---
id: UPL-IT-057
number: 57
slug: transaction-and-concurrency-audit
title: Audit transakcija i konkurentnosti
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# AUDIT TRANSAKCIJA I KONKURENTNOSTI

Želim maksimalno dubok audit concurrency-ja, transaction boundaries, isolation i race conditions.

Glavni cilj:

> Pronaći mesta gde sistem radi ispravno sa jednim request-om, ali proizvodi pogrešan rezultat kada dve ili više operacija rade paralelno.

## 1. OBJECTIVE AND NON-GOALS

Za svaku mutaciju visoke vrednosti dokaži da li ostaje tačna kada se dva ili više izvršavanja preklope u vremenu: paralelni zahtevi, retry-ji, duplirane poruke, background poslovi, više worker-a i replike. Nalaz mora da prikaže konkretan interleaving koji krši invarijantu i da imenuje mehanizam koji bi to sprečio.

Van obima:

- preporuka "koristi transakciju" ili "koristi serializable" bez prikaza zašto trenutni isolation level dozvoljava anomaliju
- opšte podešavanje performansi, osim kada contention ili čekanje na lock izazivaju netačno ponašanje ili ispad
- uvođenje distribuiranih lock-ova ili saga tamo gde jedna baza već garantuje invarijantu

## 2. CONCURRENCY MODEL FIRST

Pre analize bilo kog race-a utvrdi:

```text
Database engine and exact version:
Default isolation level and any per-transaction overrides:
How the ORM opens transactions (explicit, implicit per request, autocommit):
Row-locking primitives in use (SELECT ... FOR UPDATE, advisory locks, version columns):
Read replicas and whether reads after writes can hit a replica:
Number of application instances and workers:
Queue technology, delivery guarantee, visibility timeout, consumer concurrency:
Scheduled jobs and how many instances run them:
Distributed locks (implementation, TTL, renewal):
Retry layers (client, load balancer, HTTP library, ORM, queue):
```

Isolation level-i sa istim imenom ponašaju se različito na različitim engine-ima (šta "repeatable read" sprečava, da li je write skew moguć, kako se prijavljuju serialization failure-i). Proveri semantiku za detektovani engine i verziju; nikada se ne oslanjaj na definicije iz udžbenika kada se engine razlikuje.

## 3. EVIDENCE MODEL

```text
A - reproduced: a deterministic interleaving test, a stress test or production data shows the anomaly
B - complete path: code, transaction boundaries, isolation semantics and constraints show that the interleaving is possible
C - strong static evidence: a read-check-write pattern without a visible guard, but isolation or locking not fully traced
D - inference: plausible race depending on timing, configuration or infrastructure behavior
E - hardening: extra protection where the current mechanism already prevents the anomaly
```

## 4. FINDING STATUS

- **CONFIRMED** - anomalija je reprodukovana ili je dokazano da je interleaving moguć (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od isolation-a, topologije deployment-a ili ponašanja provajdera koji nisu mogli da se utvrde.
- **NOT APPLICABLE** - samo jedan pisac ikada može da izvrši putanju (na primer queue sa jednim consumer-om po ključu).
- **CONTROLLED** - race može da se desi, ali constraint, atomska naredba, lock, idempotency ključ ili reconciliation čine ishod tačnim.
- **HARDENING** - dodatna zaštita bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan interleaving koji daje pogrešan rezultat.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Čitanje praćeno upisom nije automatski race ako je upis uslovni (`UPDATE ... WHERE version = ?`, `WHERE stock > 0`) i ako se proverava broj izmenjenih redova.
- `SELECT ... FOR UPDATE` koji nedostaje nije defekt kada unique constraint ili atomska naredba već štite invarijantu.
- Read committed isolation nije automatski pogrešan; mnoge invarijante su pod njim bezbedno zaštićene constraint-ima i atomskim update-ima.
- Endpoint koji nije idempotentan nije nalaz ako ga nijedan klijent, proxy ili queue ne može ponoviti i ako duplikati nemaju poslovni efekat.
- Eventual consistency između primary-ja i replike nije race defekt osim ako se odluka donosi na osnovu zastarelog čitanja sa replike.
- Teorijski race nad podacima u koje u praksi niko ne upisuje istovremeno je najviše HARDENING; navedi zašto je konkurentnost realna ili nije.

## 6. INTERLEAVING NOTATION

Svaki nalaz o race-u mora da sadrži interleaving koji krši invarijantu, napisan korak po korak sa vrednošću koju svaki akter vidi:

```text
T1 read   balance = 100
T2 read   balance = 100
T1 check  100 >= 80  OK
T2 check  100 >= 80  OK
T1 write  balance = 20
T2 write  balance = 20
result    two withdrawals of 80 succeeded, balance should be -60 or one should fail
```

Zatim prikaži isti interleaving sa predloženom ispravkom i koji korak sada blokira, pada ili se ponavlja.

## 7. RACE CLASSES

Klasifikuj svaki nalaz:

```text
lost update          two read-modify-write cycles, one overwrites the other
duplicate create     check-then-insert creates two rows for one logical entity
write skew           two transactions read overlapping data and write disjoint rows, violating a shared rule
stale write          a write based on a value that changed after it was read (old form, old version)
check-then-act       permission, quota or state checked, then acted on after it changed
delete/update race   an update or job runs on an entity that was deleted or archived meanwhile
revoke/use race      a token, session or role is used after it was revoked
lease expiry         a lock holder keeps working after its lease expired and another holder started
timeout/retry race   a timed-out operation actually succeeded and the retry executes it again
```

## 8. CRITICAL MUTATIONS

Inventariši:

- payments
- inventory
- quotas
- role changes
- ownership
- counters
- coupons
- reservations
- state transitions

## 9. TRANSACTION BOUNDARY

Za svaku mutation:

```text
Read:
Checks:
Writes:
External calls:
Events:
Commit:
```

## 10. READ-MODIFY-WRITE

High-signal.

## 11. LOST UPDATE

A and B read same version.

## 12. WRITE-WRITE

Last writer wins unintentionally.

## 13. OPTIMISTIC LOCK

Version compare.

## 14. ATOMIC UPDATE

```text
UPDATE ... WHERE stock > 0
```

can be stronger than app-side check.

## 15. ATOMIC DATABASE PRIMITIVES

Kada invarijanta postoji u jednoj bazi, prednost daj atomskim primitivima same baze umesto koordinaciji na nivou aplikacije:

- uslovni update uz proveru broja redova: `UPDATE ... SET stock = stock - 1 WHERE id = ? AND stock >= 1`
- unique constraint-i (uključujući partial i composite) za pravila tipa "samo jedan"
- `INSERT ... ON CONFLICT` / upsert semantika, proverena za engine
- check i exclusion constraint-i za opsege i preklapanja gde engine to podržava
- sekvence ili identity kolone umesto `MAX()+1`

Za svaku proveru na nivou aplikacije pitaj da li neki od ovih mehanizama čini tu proveru nepotrebnom.

## 16. UNIQUE CONSTRAINT

Race-safe uniqueness.

## 17. CHECK-THEN-INSERT

Unsafe without unique constraint.

## 18. QUOTA

COUNT then INSERT race.

## 19. COUPON

Check unused then mark used.

## 20. ONE-TIME TOKEN

Isto.

## 21. PAYMENT REFUND

## 22. INVENTORY

## 23. BOOKING

Overlap.

## 24. ACCOUNT BALANCE

## 25. ROLE GRANT

Two admin changes.

## 26. OWNERSHIP TRANSFER

## 27. ISOLATION LEVEL

Actual engine behavior.

## 28. ISOLATION SEMANTICS FOR THIS ENGINE

Za detektovani engine i verziju konkretno navedi:

- koje anomalije dozvoljava podešeni isolation level (lost update, non-repeatable read, phantom, write skew)
- da li locking čitanja (`FOR UPDATE`, `FOR SHARE`) to menjaju za redove koje dodiruju
- kako se konflikti ispoljavaju: blokiranje, serialization greška, deadlock greška ili tihi last-writer-wins
- da li aplikacija hvata te greške i ponavlja **celu** transakciju, a ne samo poslednju naredbu
- da li neke transakcije rade na drugačijem nivou od podrazumevanog (ORM opcije, podešavanja po konekciji)

Nalaz koji zavisi od isolation-a mora da imenuje nivo i ponašanje engine-a na koje se oslanja.

## 29. READ COMMITTED

## 30. REPEATABLE READ

## 31. SERIALIZABLE

Do not recommend globally without throughput analysis.

## 32. SNAPSHOT

Write skew.

## 33. NON-REPEATABLE READ

## 34. PHANTOM

## 35. WRITE SKEW

Two doctors/on-call style invariant.

## 36. LOCK

Row/table/advisory.

## 37. OPTIMISTIC VS PESSIMISTIC CONCURRENCY

Proceni izabranu strategiju u odnosu na workload:

- **optimistic** (version kolona, uslovni update): dobar za mali contention; proveri da se verzija proverava u WHERE klauzuli, da se proverava broj izmenjenih redova i da korisnik ili posao dobija jasan ishod konflikta umesto tihog prepisivanja
- **pessimistic** (`SELECT ... FOR UPDATE`, advisory lock-ovi): dobar za veliki contention na malom broju redova; proveri opseg lock-a, redosled zaključavanja, timeout-e i da se dok se lock drži ne izvršava nijedan eksterni poziv
- mešanje strategija na istom redu (jedna putanja koristi verzije, druga upisuje bez njih) ruši optimistic garanciju

## 38. LOCK ORDER

Deadlock.

## 39. DEADLOCK RETRY

Use bounded retry with transaction restart.

## 40. DEADLOCK ANALYSIS

Za svaku putanju upisa koja obuhvata više redova ili više tabela:

- navedi redosled zaključavanja svake putanje; dve putanje koje zaključavaju iste redove različitim redosledom mogu da uđu u deadlock
- utvrdi koju transakciju engine bira kao žrtvu i da li je aplikacija bezbedno ponavlja (cela transakcija, ograničen broj pokušaja, backoff sa jitter-om)
- proveri da li ponovljene transakcije ponavljaju side effect-e (email-ove, pozive provajderu, događaje)
- pre ocene severity-ja proveri deadlock i lock-wait metrike ili logove za stvarna pojavljivanja

## 41. EXTERNAL CALL INSIDE TRANSACTION

Can hold locks for seconds.

## 42. EXTERNAL CALL BEFORE COMMIT

Provider succeeds, DB rollback.

## 43. EXTERNAL CALL AFTER COMMIT

DB commits, provider fails.

## 44. SIDE EFFECTS AND COMMIT BOUNDARIES

Za svaku transakciju sa eksternim efektom postavi efekat na vremensku liniju:

```text
before commit   effect happens even if the transaction rolls back (charge without order)
inside commit   impossible for external systems; only the database is atomic
after commit    effect can be lost if the process dies between commit and call (order without email)
```

Prihvatljiv dizajn čini efekat nadoknadivim: transactional outbox sa idempotentnim relay-em, idempotency ključ poslat provajderu ili reconciliation posao. Proveri da poziv provajderu koristi stabilan idempotency ključ izveden iz poslovne operacije, a ne novi nasumični ključ pri svakom retry-ju.

## 45. OUTBOX

Potential pattern.

## 46. SAGA

For distributed workflows, not automatic requirement.

## 47. IDEMPOTENCY

Critical.

## 48. IDEMPOTENCY KEY SCOPE

User/tenant/action.

## 49. SAME KEY DIFFERENT BODY

Conflict.

## 50. CONCURRENT SAME KEY

Atomic lock/unique.

## 51. RETRY

DB/network/client.

## 52. CLIENT DOUBLE CLICK

## 53. MOBILE RETRY

## 54. LOAD BALANCER RETRY

## 55. QUEUE DUPLICATE

At-least-once.

## 56. WEBHOOK DUPLICATE

## 57. OUT-OF-ORDER

## 58. STALE JOB

Permission/state changes.

## 59. QUEUE AND WORKER CONCURRENCY

Za svaki consumer:

- koliko consumer-a istovremeno obrađuje poruke za isti entitet?
- da li je redosled garantovan po ključu (partition, message group) ili dva događaja za jedan entitet mogu da se obrađuju paralelno?
- šta se dešava kada obrada traje duže od visibility timeout-a ili lease-a: da li se poruka ponovo isporučuje drugom worker-u dok prvi još radi?
- da li su handler-i idempotentni po message ID-u ili poslovnom ključu?
- da li zakazani posao može da se izvršava na više instanci odjednom ili da se preklopi sa sopstvenim prethodnim pokretanjem?

## 60. TOCTOU

Authorization and resource mutation.

## 61. FILE

Check file state then overwrite.

## 62. CACHE LOCK

Dogpile.

## 63. DISTRIBUTED LOCK

Audit:

- TTL
- ownership token
- renewal
- clock
- failure

## 64. LOCK EXPIRY

Long operation continues after lock expires -> two owners.

## 65. REDLOCK-LIKE

Do not prescribe without threat/failure analysis.

## 66. DISTRIBUTED LOCKS AND FENCING TOKENS

Distribuirani lock sa TTL-om sam po sebi ne garantuje međusobno isključivanje:

```text
worker A acquires lease (TTL 30 s)
↓
worker A pauses (GC, network, slow provider call) for 45 s
↓
lease expires; worker B acquires it and starts writing
↓
worker A resumes and writes, believing it still holds the lock
```

Za svaki distribuirani lock proveri:

- **trajanje lease-a** u odnosu na najgore trajanje zaštićenog posla
- **obnavljanje**: kako se lease produžava i šta se dešava ako obnavljanje ne uspe
- **proveru vlasnika**: oslobađanje i obnavljanje uspevaju samo za token trenutnog vlasnika
- **fencing token**: monotono rastući broj izdat uz lease koji proverava resurs u koji se upisuje (na primer `UPDATE ... WHERE fence < ?`), tako da se upisi zastarelog vlasnika odbijaju
- **pretpostavke o satu**: ponašanje pri razlici satova između čvorova
- **otkaz samog lock servisa**: da li sistem prestaje da radi (fail closed) ili nastavlja bez zaštite?

Ako je zaštićeni resurs jedna baza, row lock ili uslovni upis u toj bazi je obično jednostavniji i bezbedniji od distribuiranog lock-a.

## 67. DB LOCK PREFERRED

If invariant lives in one DB, DB atomicity is often simpler.

## 68. COUNTER

Atomic increment.

## 69. SEQUENCE

## 70. MAX()+1

Race.

## 71. ORDER POSITION

Two inserts same position.

## 72. DELETE VS UPDATE

## 73. DELETE VS JOB

## 74. ARCHIVE VS EDIT

## 75. ROLE REVOKE VS REQUEST

## 76. SESSION REVOKE

## 77. TRANSACTION TIMEOUT

## 78. IDLE TRANSACTION

## 79. LOCK WAIT

## 80. CONNECTION POOL

Blocked transactions can exhaust pool.

## 81. HOT ROW

Global settings/counter.

## 82. HIGH CONTENTION

Benchmark.

## 83. RETRY STORM

Serializable/deadlock retries can amplify load.

## 84. BACKOFF/JITTER

Where needed.

## 85. CONCURRENCY TEST

Use barriers to force exact interleaving.

## 86. TEST FORMAT

```text
T1 read
T2 read
T1 write
T2 write
```

## 87. DETERMINISTIC RACE TEST

Better than probabilistic 1000-loop test.

## 88. DETERMINISTIC RACE TESTING

Nemoj se oslanjati na petlje koje "obično" izazovu race. Nametni interleaving:

- barijere ili latch-evi u testu koji zaustave T1 posle čitanja dok T2 takođe ne pročita
- hook-ovi ili tačke za fault injection u putanji koda (samo za test) između provere i upisa
- dve sesije baze kojima test upravlja korak po korak
- za retry: simuliraj timeout posle uspešnog side effect-a, pa pokreni retry

Uz svaki potvrđeni nalaz treba da postoji test koji pada pre ispravke i prolazi posle nje.

## 89. CONCURRENCY INTERLEAVING MATRIX

| Mutation | Invariant | Race class | Actors | Breaking interleaving | Current guard | Isolation | Retry safe | Status |
|---|---|---|---|---|---|---|---|---|

## 90. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Race class:
Scope (mutation, tables, services):
Invariant:
Trigger (parallel requests, retry, duplicate message, job overlap):
Actors:
Transaction boundary and isolation:
Current guards:
Interleaving (step by step):
Expected result:
Actual result:
Impact:
Blast radius:
Evidence:
Root cause:
Fix (atomic statement, constraint, lock, idempotency, fencing):
Retry behavior after the fix:
Verification (deterministic test):
Regression risk (contention, deadlocks, latency):
```

## 91. SEVERITY

- **P0** - race koji omogućava sistematski finansijski gubitak (double spend, dupli refund, neograničeno korišćenje kupona), eskalaciju privilegija ili upise u tuđi tenant, i koji napadač može namerno da izazove.
- **P1** - ponovljiv race na kritičnoj mutaciji (plaćanja, zalihe, kvote, uloge, vlasništvo) koji daje pogrešne poslovne rezultate pri normalnoj konkurentnosti ili retry-jima.
- **P2** - race sa stvarnim, ali ograničenim uticajem (duplirana obaveštenja, povremeno izgubljene izmene, nekonzistentnosti koje mogu da se poprave), ili deadlock-ovi i čekanja na lock koji izazivaju neuspele zahteve.
- **P3** - race-ovi na nekritičnim podacima ili sa veoma uskim vremenskim prozorom i malim uticajem.
- **P4** - hardening: dodatni constraint-i, testovi ili praćenje tamo gde trenutni mehanizam već radi.

Uzmi u obzir iskoristivost: race koji korisnik može po volji da izazove paralelnim zahtevima je ozbiljniji od onog kojem je potreban redak tajming infrastrukture.

## 92. OUTPUT

`TRANSACTION_CONCURRENCY_AUDIT.md`

## 93. SECOND PASS

Za svaku mutaciju visoke vrednosti izvrši ili razmotri:

- 2 i 10 paralelnih zahteva sa identičnim ulazom
- duplirana slanja sa istim idempotency ključem i isti ključ sa drugačijim telom
- retry posle timeout-a u kojem je prvi pokušaj zapravo uspeo
- istu poruku isporučenu dva puta i dve povezane poruke pogrešnim redosledom
- obradu koja traje duže od visibility timeout-a ili lease-a lock-a
- deadlock putanje između mutacije i drugih pisaca istih redova
- update nad zastarelim version tokenom
- opoziv dozvole ili brisanje entiteta dok je operacija u toku
- čitanja sa replike neposredno posle upisa

Zatim pokušaj da opovrgneš svaki nalaz: da li postoji constraint, atomska naredba ili putanja sa jednim piscem koju si propustio? Da li isolation ovog engine-a zapravo sprečava ovaj interleaving?

## 94. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da:

- je model konkurentnosti (engine, verzija, isolation, worker-i, queue-ovi, retry-ji) dokumentovan
- svaki nalaz o race-u ima interleaving korak po korak i klasu race-a
- su tvrdnje o isolation-u specifične za detektovani engine i verziju
- su atomski primitivi baze razmotreni pre lock-ova na nivou aplikacije
- su eksterni side effect-i postavljeni na vremensku liniju commit-a i njihov oporavak opisan
- su retry-ji (klijent, proxy, biblioteka, queue) provereni na duplirane efekte
- su distribuirani lock-ovi provereni za trajanje lease-a, obnavljanje, proveru vlasnika i fencing
- su queue consumer-i provereni na paralelnu obradu istog entiteta i ponovnu isporuku tokom duge obrade
- svaki potvrđeni nalaz ima predlog determinističkog testa
- su statusi i evidence tier-ovi dosledno primenjeni; nijedan nalaz ne kaže samo "koristi transakciju"

# KONAČNO PRAVILO

Tražim:

```text
quota = 10

current rows = 9

Request A:
COUNT = 9

Request B:
COUNT = 9

A inserts
B inserts

final = 11
```

i konkretan atomic fix, ne samo:

> Koristi transaction.

Transaction pri pogrešnom isolation-u i dalje može dozvoliti race.

Drugi failure chain-ovi koje tražim:

```text
refund job holds a distributed lock with a 60 s lease
↓
provider call hangs for 90 s
↓
lease expires; a second worker takes the lock and issues the refund
↓
first worker's call completes; it also records a refund
↓
customer refunded twice; no fencing token rejected the stale worker
```

```text
rule: at least one doctor on call per shift
↓
Doctor A and Doctor B both read "2 on call" under snapshot isolation
↓
each updates only their own row to "off call"
↓
no row conflict, both commit
↓
nobody on call (write skew)
```

```text
payment request times out at the load balancer after the provider charged the card
↓
client retries with a new idempotency key generated per attempt
↓
provider treats it as a new charge
↓
customer charged twice; local order shows one payment
```
