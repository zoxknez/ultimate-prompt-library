---
id: UPL-IT-056
number: 56
slug: data-integrity-audit
title: Data Integrity Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# DATA INTEGRITY AUDIT

Želim forenzički audit svih invariants i puteva kojima podaci mogu postati nevalidni, kontradiktorni, duplicirani ili međusobno neusaglašeni.

Glavni cilj:

> Dokazati gde aplikacija sprečava impossible states, duplicate business effects, orphaned data, stale denormalized values i cross-system divergence.

## 1. OBJECTIVE AND NON-GOALS

Za svaku kritičnu poslovnu činjenicu dokaži koji mehanizam garantuje da ostaje tačna pod konkurentnim izvršavanjem, retry-jima, delimičnim otkazima, operacijama kroz više sistema, popravkama i restore-ima, i koliko dugo bi kršenje ostalo neotkriveno.

Rezultat je mapa po invarijantama: enforcement, praznine, detekcija i popravka, sa konkretnim putevima do oštećenja podataka.

Van obima:

- fizičko zdravlje storage-a (disk, checksum replikacije), osim kada utiče na logički integritet
- opšti stil ili imenovanje šeme
- podešavanje performansi
- problemi kvaliteta podataka koji ne krše invarijantu (pogledaj posebnu sekciju ispod)

## 2. CONTEXT DISCOVERY

Utvrdi pre traženja kršenja:

```text
Database engine(s) and version(s):
Isolation level actually used by critical transactions:
ORM / data-access layer:
External systems that hold copies or effects (queue, object storage, payment provider, email/SMS, webhooks, search index, cache, analytics, CRM):
Integration style (synchronous call, outbox, CDC, event bus, batch sync):
Delivery guarantees of queues and webhooks (at-most-once, at-least-once, ordering):
Multi-tenant model:
Existing reconciliation jobs, consistency checks and alerts:
Backup / restore / PITR process:
```

## 3. INTEGRITY CLASSES

Klasifikuj svaku invarijantu, jer svaka klasa zahteva drugačiji mehanizam zaštite:

```text
entity integrity          identity, uniqueness, required attributes
referential integrity     references point to existing, correct parents
business invariant        rules such as stock >= 0, invoice total = sum(lines), one active subscription
cross-system integrity    local records agree with payment provider, storage, search index, queue
temporal integrity        valid intervals, no overlaps, correct ordering of state changes
tenant integrity          every related record belongs to the same tenant
financial integrity       money is never created, lost or double-counted; ledgers balance
```

## 4. AUTHORITY MAP

Za svaku važnu činjenicu odgovori: **ko je vlasnik istine?**

```text
Fact:                   (for example: payment status of order 123)
Authoritative source:   (local DB, payment provider, identity provider, object storage)
Copies:                 (tables, caches, search index, analytics, client state)
Direction of sync:      (provider -> DB via webhook, DB -> search via CDC, ...)
Lag tolerated:
What wins on conflict:
```

Mnogi defekti integriteta nastaju kada dve komponente veruju da su izvor istine, ili kada se kopija koristi za odluku koju bi trebalo da donese izvor istine.

## 5. EVIDENCE MODEL

```text
A - reproduced: the invalid state was produced in a test (deterministic interleaving, fault injection) or found in production data
B - complete path: code, transaction boundaries and constraints show an unguarded path to the invalid state
C - strong static evidence: an invariant has no visible enforcement, but the full path is not traced
D - inference: plausible violation that needs verification (timing, configuration, provider behavior)
E - hardening: additional defense (constraint, reconciliation, alert) where the current guard already works
```

Postojeći oštećeni redovi pronađeni read-only query-jem su tier A dokaz: navedi query i brojeve, nikada same lične podatke.

## 6. FINDING STATUS

- **CONFIRMED** - nevalidno stanje postoji ili je reprodukovano, ili je nezaštićena putanja u potpunosti praćena (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od tajminga, isolation-a, provajdera ili konfiguracije koji nisu mogli da se utvrde.
- **NOT APPLICABLE** - invarijanta ne postoji u ovom domenu.
- **CONTROLLED** - kršenje može da se desi, ali se otkriva i popravlja u prihvaćenom roku (reconciliation, outbox, idempotentnost).
- **HARDENING** - dodatni sloj zaštite bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan put do nevalidnog, dupliranog, izgubljenog ili neusaglašenog stanja.

## 7. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Eventual consistency nije narušen integritet ako je period nekonzistentnosti definisan, ograničen i prihvatljiv za posao, a razilaženje se otkriva.
- Foreign key koji nedostaje nije automatski defekt kada reference validira i čisti drugi pouzdan mehanizam, ili kada prelaze granicu baze gde foreign key nije moguć.
- Denormalizovani brojač nije automatski pogrešan ako se ponovo izračunava ili usklađuje i niko na osnovu njega ne donosi autoritativnu odluku.
- Validacija na nivou aplikacije nije automatski nedovoljna ako svi upisi idu kroz jednu serijalizovanu putanju (na primer queue consumer sa jednim piscem).
- Soft-deleted parent sa aktivnom decom nije automatski oštećenje ako domen namerno zadržava decu.
- Redovi koji izgledaju kao duplikati nisu kršenje ako ih domen legitimno dozvoljava (ponovljene kupovine, verzije, istorijski redovi).

## 8. INVARIANT INVENTORY

Primer:

```text
email unique per tenant
stock >= 0
invoice total = sum(lines)
one active membership per user/org
payment provider ID unique
```

## 9. ENFORCEMENT LAYER

Za svaki:

- UI
- API validator
- service
- DB constraint
- transaction
- external reconciliation

## 10. UI ONLY

Nije integrity enforcement.

## 11. APPLICATION CHECK ONLY

Concurrency risk.

## 12. DB UNIQUE

Strong atomic guard.

## 13. CHECK

## 14. FK

## 15. TRANSACTION

## 16. DUPLICATE RECORD

Concurrent create.

## 17. IDEMPOTENCY

External retry.

## 18. RACE SAFETY OF INVARIANTS

Za svaku invarijantu koju štiti kod aplikacije napiši interleaving koji bi mogao da je prekrši:

```text
T1 read stock = 1
T2 read stock = 1
T1 check stock >= 1
T2 check stock >= 1
T1 write stock = 0
T2 write stock = 0      (two items sold, one in stock)
```

Zatim navedi koji mehanizam to sprečava: unique ili check constraint, atomski uslovni UPDATE, row lock, optimistic versioning ili serializable isolation. "Nalazi se u transakciji" nije odgovor; navedi isolation level i pokaži zašto je interleaving pod njim nemoguć.

## 19. ORPHAN

Parent deleted.

## 20. DANGLING REFERENCE

Logical ID without FK.

## 21. CROSS-TENANT FK

Child ID references resource from another tenant.

## 22. DENORMALIZED FIELD

Must stay synchronized.

## 23. COUNTER

`comment_count`, `balance`, `usage`.

## 24. BALANCE

Never derive critical money state from unsafe incremental writes without reconciliation.

## 25. AGGREGATE DRIFT

## 26. MATERIALIZED STATE

## 27. EVENTUAL CONSISTENCY

Not automatically integrity failure.

Define acceptable window.

## 28. OUTBOX

If cross-system event delivery needs atomicity.

## 29. DUAL WRITE

DB + external system.

## 30. DB + QUEUE

Commit succeeds, enqueue fails.

## 31. QUEUE + DB

Message delivered twice.

## 32. DB + STORAGE

Metadata/object mismatch.

## 33. PAYMENT

Provider success + local timeout.

## 34. WEBHOOK

Duplicate/out-of-order.

## 35. IMPORT

Partial rows.

## 36. DISTRIBUTED FAILURE COMBINATIONS

Za svaku operaciju koja menja bazu i najmanje jedan drugi sistem prođi kroz svaki delimičan ishod:

```text
DB commit OK, side effect failed            (message not published, file not stored, email not sent)
side effect OK, DB commit failed             (card charged, row missing)
side effect OK, response lost, client retries (duplicate charge, duplicate email)
side effect executed twice                   (at-least-once delivery, webhook redelivery)
side effects arrive out of order             (refund before payment, delete before create)
```

Obuhvati svaki eksterni sistem koji čuva stanje: queue, object storage, payment provajder, email/SMS, webhook-ove (dolazne i odlazne), search index, cache, analitiku. Za svaku kombinaciju navedi šta sistem danas radi i koje nevalidno stanje nastaje.

## 37. RECONCILIATION AND DETECTION LATENCY

Za svaki eksterni sistem i svaku izvedenu vrednost odgovori:

```text
How do we detect divergence?        (scheduled comparison, provider event, checksum, count check, none)
How often?
Detection latency:                  (how long can a violation exist unnoticed?)
Who is alerted?
How do we repair it?                (automatic, manual procedure, one-off script)
Is the repair idempotent and auditable?
```

Kršenje bez detekcije je **silent corruption**: ocenjuj ga po tome koliko dugo može da traje i koje odluke se u međuvremenu donose na osnovu pogrešnih podataka, a ne samo po tome koliko se često dešava.

## 38. EXPORT

Doesn't mutate, but may expose inconsistent snapshot.

## 39. STATE MACHINE

Invalid transition.

## 40. SKIP TRANSITION

Client sets final status.

## 41. TERMINAL STATE

Should it be immutable?

## 42. RESTORE

Deleted object resurrected.

## 43. SOFT DELETE

Related records.

## 44. OWNERSHIP TRANSFER

All dependent scopes update.

## 45. UNIQUE + SOFT DELETE

## 46. NULL

Missing critical relation.

## 47. MONEY ROUNDING

Line totals vs invoice total.

## 48. CURRENCY CONVERSION

Rate/time source.

## 49. TIME RANGE

End before start.

## 50. OVERLAP

Booking/subscription.

## 51. CAPACITY

Reservation overbook.

## 52. STOCK

Negative stock.

## 53. QUOTA

Parallel requests exceed limit.

## 54. VERSION

Optimistic concurrency.

## 55. GENERATED DATA

Can it be recomputed?

## 56. RECONCILIATION JOB

Detect drift.

## 57. CONSISTENCY CHECK

Periodic query.

## 58. CHECKSUM

For pipelines/backups.

## 59. AUDIT LOG

State change trace.

## 60. DATABASE CORRUPTION VS LOGICAL CORRUPTION

Separate concepts.

## 61. RESTORE CONSISTENCY

Vraćanje baze ne vraća ostatak sveta:

- vraćena baza može da oživi opozvane sesije, iskorišćene jednokratne tokene, obrisane naloge ili otkazane pretplate
- plaćanja, email-ovi i webhook-ovi poslati posle tačke restore-a ne mogu da se ponište; lokalni zapisi više se ne slažu sa provajderima
- object storage, search indeksi i cache zadržavaju novije stanje od vraćene baze
- sekvence i ID-evi mogu ponovo da se dodele i da se sudare sa ID-evima koji su već dati eksternim sistemima

Za svaki scenario restore-a navedi šta mora da se uskladi ili poništi posle toga i da li ta procedura postoji.

## 62. DATA QUALITY VS INTEGRITY

Nemoj mešati ta dva pojma:

- **integritet** - podaci krše pravilo na koje se sistem oslanja (duplo plaćanje, negativno stanje zaliha, osiroćena faktura, referenca na drugog tenant-a)
- **kvalitet** - podaci su validni, ali netačni ili nepotpuni (greška u imenu, zastareo broj telefona, prazno opciono polje)

Probleme kvaliteta prijavi samo kada od njih zavisi neka odluka sistema i označi ih kao kvalitet, a ne integritet.

## 63. REPAIR

How invalid data is corrected.

## 64. REPAIR SCRIPT

Can make problem worse.

## 65. DATA FIX MIGRATION

Must be idempotent/verifiable.

## 66. REPAIR STRATEGY

Za svako potvrđeno ili verovatno kršenje predloži plan popravke odvojen od trajne ispravke:

```text
Detection query (read-only):
Affected scope (count, tenants, time range):
Authoritative source used to decide the correct value:
Repair action and its ordering relative to the fix:
Idempotency and dry-run mode:
Audit trail of changed records:
Customer or financial follow-up (refunds, notices):
Verification after repair:
```

Prvo ispravi putanju upisa, ili u istom release-u; popravka podataka dok bug i dalje stvara nova kršenja je uzaludna.

## 67. INVARIANT ENFORCEMENT MATRIX

| Invariant | Class | Authority | App enforcement | DB enforcement | Concurrency-safe | Retry-safe | Detection | Repair | Status |
|---|---|---|---|---|---|---|---|---|---|

## 68. CROSS-SYSTEM CONSISTENCY MATRIX

| Operation | Systems touched | Atomicity mechanism | Partial-failure outcome | Duplicate handling | Ordering | Reconciliation | Detection latency |
|---|---|---|---|---|---|---|---|

## 69. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Integrity class:
Scope (entities, tables, systems):
Invariant:
Authoritative source:
Trigger (request, retry, job, webhook, restore):
Current guards:
Failure path (interleaving or partial-failure sequence):
Resulting invalid state:
Impact (business, financial, security):
Blast radius (tenants, records, time range):
Evidence:
Root cause:
Detection (existing or proposed) and detection latency:
Repair plan:
Permanent fix:
Verification (deterministic test, fault injection, reconciliation query):
Regression risk:
```

## 70. SEVERITY

- **P0** - sistematsko finansijsko oštećenje (novac stvoren, izgubljen ili dvostruko naplaćen u velikom obimu), mešanje podataka između tenant-a ili silent corruption autoritativnih podataka bez načina da se rekonstruiše istina.
- **P1** - ponovljiva putanja do dupliranih poslovnih efekata, negativnog stanja ili zaliha, osiroćenih finansijskih zapisa ili razilaženja sa provajderom koje se ne otkriva.
- **P2** - značajna kršenja ograničenog obima, ili kršenja koja se otkrivaju i mogu da se poprave, ali samo ručno i kasno.
- **P3** - nekonzistentnosti u graničnim slučajevima na nekritičnim podacima, ili izvedene vrednosti koje odstupaju, ali se ponovo izračunavaju.
- **P4** - hardening: dodatni constraint, reconciliation ili alert na invarijanti koja je već zaštićena.

Povećaj severity kada je latencija detekcije duga ili kada pogrešni podaci upravljaju plaćanjima, kontrolom pristupa ili pravnim zapisima.

## 71. OUTPUT

`DATA_INTEGRITY_AUDIT.md`

## 72. SECOND PASS

Za svaku kritičnu invarijantu testiraj:

- dva i deset konkurentnih dupliranih zahteva
- ponavljanje zahteva posle timeout-a, sa i bez idempotency ključa
- otkaz između dva odvojena upisa (baza i eksterni sistem)
- duplirano i izmenjenog redosleda isporučivanje poruka ili webhook-ova
- pokušaje ažuriranja zastarelom verzijom nad novijom
- brisanje parent zapisa dok se deca kreiraju
- reference na ID drugog tenant-a koje šalje klijent
- vraćanje starog snapshot-a podataka ili dvostruko pokretanje skripte za popravku
- pad ili konkurentno pokretanje samog reconciliation posla

Zatim pokušaj da opovrgneš svaki nalaz: da li postoji constraint, lock ili putanja sa jednim piscem koju si propustio? Da li je period nekonzistentnosti prihvaćen i praćen?

## 73. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da:

- svaka kritična činjenica ima identifikovan autoritativni izvor
- su invarijante klasifikovane (entity, referential, business, cross-system, temporal, tenant, financial)
- svaka invarijanta ima identifikovan sloj zaštite i obrazloženu otpornost na race kroz interleaving
- su retry i idempotentnost provereni za svaki upis koji pokreće spoljni događaj
- je svaka operacija koja obuhvata bazu i drugi sistem prođena kroz sve delimične ishode
- svaki eksterni sistem ima odgovor za detekciju i popravku, sa latencijom detekcije
- su razmotrene posledice restore-a
- problemi kvaliteta podataka nisu prijavljeni kao kršenje integriteta
- su statusi i evidence tier-ovi dosledno primenjeni i planovi popravke odvojeni od trajnih ispravki

# KONAČNO PRAVILO

Tražim:

```text
payment provider succeeds
↓
local DB update times out
↓
client retries payment endpoint
↓
new provider charge is created
↓
user charged twice
↓
local records still look valid individually
↓
business integrity violated
```

Drugi failure chain-ovi koje tražim:

```text
stock check in application code (SELECT stock, then UPDATE stock = stock - 1)
↓
two checkouts for the last item run concurrently
↓
both read stock = 1 and both commit
↓
stock = -1, two orders confirmed for one item
```

```text
task.project_id references a project by id only
↓
API accepts project_id from the request body
↓
no composite (project_id, tenant_id) constraint
↓
tenant A creates a task inside tenant B's project
↓
tenant B's users see foreign data; exports mix tenants
```

```text
comment_count incremented in application code
↓
comment deletion path forgets to decrement
↓
no recomputation job
↓
counts drift for months
↓
moderation limits and billing tiers use the wrong numbers
```

```text
upload: DB row inserted, then file written to object storage
↓
storage write times out after the DB commit
↓
row points to a missing object
↓
download returns 404; backups contain rows without files
```

```text
database restored to yesterday after a bad migration
↓
password resets and session revocations from today are lost
↓
revoked sessions become valid again
↓
payments captured today no longer have local orders
```
