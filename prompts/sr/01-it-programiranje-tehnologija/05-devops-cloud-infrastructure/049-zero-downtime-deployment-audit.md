---
id: UPL-IT-049
number: 49
slug: zero-downtime-deployment-audit
title: Zero-Downtime Deployment Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# ZERO-DOWNTIME DEPLOYMENT AUDIT

Želim maksimalno duboku analizu da li sistem zaista može da se deployuje bez user-visible downtime-a, data corruption-a i mixed-version failure-a.

Glavni cilj:

> Dokazati, a ne pretpostaviti, da old i new application versions, database schema, caches, queues, workers, clients, static assets i configuration mogu koegzistirati tokom rollout-a i rollback-a.

## 1. CORE INVARIANT AND NON-GOALS

Osnovna invarijanta:

> Stare i nove verzije moraju bezbedno da koegzistiraju: svaka kombinacija starog i novog koda, šeme, klijenata, poruka, sesija i cache-a koja može da postoji tokom rollout-a i rollback-a mora da radi bez grešaka vidljivih korisniku i bez oštećenja podataka.

Van obima:

- zahtevanje zero downtime tamo gde navedeni zahtev za dostupnost dozvoljava maintenance window
- opšta bezbednost CI/CD pipeline-a (samo mehanika rollout-a i kompatibilnost)
- podešavanje performansi upita koje nije povezano sa migracijama ili rollout-om
- redundantnost infrastrukture van procesa deployment-a

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
Platform and rollout mechanism (orchestrator, platform, serverless, VMs behind load balancer):
Rollout parameters (surge, max unavailable, canary steps, pause conditions):
Database engine and version; migration tool; when migrations run:
Components deployed separately (web, API, workers, cron, functions):
Clients and their update model (web SPA, PWA, mobile, desktop, third-party API consumers):
Message brokers, caches and session stores shared across versions:
Stated availability requirement and how downtime is measured:
```

Ponašanje zaključavanja kod DDL-a, online build indeksa, draining i semantika gašenja zavise od database engine-a, platforme i verzije. Proveri trenutno ponašanje za konkretnu verziju pre nego što ga navedeš.

## 3. EVIDENCE MODEL

```text
A - observed: a mixed-version test, staging rollout, rollback exercise or production rollout metrics show the behavior
B - complete path: migration, both code versions and the rollout configuration fully show the compatibility or the break
C - strong static evidence: one side of the pair is clear, the other (old code, old clients, payloads in flight) is not verified
D - inference: plausible incompatibility that depends on timing, traffic or platform behavior not verified
E - hardening: stronger compatibility margin without a current failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - dokaz tier A ili B pokazuje otkaz pri mešanim verzijama.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od starog koda, klijenata ili podataka u letu koji nisu mogli da se pregledaju.
- **NOT APPLICABLE** - kombinacija ne može da nastane (na primer nema worker-a, nema mobilnih klijenata).
- **CONTROLLED** - flag, provera verzije, sloj kompatibilnosti ili redosled rollout-a sprečavaju kombinaciju.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza pri mešanim verzijama, draining-u, kapacitetu ili rollback-u.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Recreate strategija ili maintenance window nisu defekt kada navedeni zahtev za dostupnost to dozvoljava.
- Dodavanje nullable kolone, nove tabele ili novog opcionog polja je obično kompatibilno; prijavi samo uz konkretan prekid (na primer `SELECT *` mapiran po poziciji, strogi deserializeri koji odbijaju nepoznata polja).
- Promena koja kvari kompatibilnost nije nalaz ako komponenta nikada ne radi u mešanim verzijama (jedna instanca uz prihvaćen downtime ili je promena zaključana flag-om dok cela flota ne bude nova).
- Nepovratna migracija je prihvatljiva kada postoji plan za roll-forward, a stara verzija i dalje radi na novoj šemi.
- Kratak skok grešaka je nalaz samo ako prelazi navedeni zahtev ili oštećuje podatke.

## 6. DEFINIŠI "ZERO DOWNTIME"

Ne znači apsolutno 0 ms.

Definiši prema:

- availability requirement
- error budget
- user-visible impact

Ako nije definisano:

**ZERO-DOWNTIME REQUIREMENT NOT DEFINED**

## 7. CLAIM VERIFICATION

Ne prihvataj tvrdnju "zero downtime" na osnovu naziva strategije deployment-a ("koristimo rolling updates", "blue/green"). Tvrdnju podržava samo konkretan dokaz za period mešanih verzija: provereni parovi kompatibilnosti ispod, proveren draining, izračunat kapacitet tokom rollout-a i izveden rollback posle migracije. Bez tog dokaza prijavi tvrdnju kao **NOT VERIFIED**.

## 8. DEPLOY STRATEGY

- rolling
- blue/green
- canary
- serverless
- recreate

## 9. TRAFFIC FLOW

```text
old instances
+
new instances
↓
same load balancer
↓
same DB/cache/queue
```

## 10. MIXED VERSION PERIOD

Najvažniji koncept.

## 11. MANDATORY COMPATIBILITY PAIRS

Proceni svaki par koji može da postoji tokom rollout-a ili rollback-a; svaki red zahteva odgovor i dokaz:

```text
old app      -> new DB schema          (migration runs before the fleet is replaced; rollback)
new app      -> transitional DB schema (expand phase done, contract not yet)
old producer -> new consumer           (messages already queued, delayed jobs)
new producer -> old consumer           (old workers still running)
old client   -> new API                (cached SPA, mobile, desktop, third parties)
new client   -> old API                (new assets served while old instances handle requests)
old session  -> new app                (and new session -> old app during rollback)
```

Dodaj parove za cache, tokene, webhook-ove i konfiguraciju tamo gde ih sistem ima.

## 12. DB SCHEMA

New schema mora biti compatible sa old app dok old replicas postoje.

## 13. ADD COLUMN

Obično safer.

## 14. DROP COLUMN

Breaking za old code.

## 15. RENAME COLUMN

Breaking bez compatibility layer-a.

## 16. CHANGE TYPE

Lock/data compatibility.

## 17. NOT NULL

Existing/old writes.

## 18. DEFAULT

Database vs application default.

## 19. ENUM

Old app ne zna new value.

## 20. MIGRATION CLASSES

Klasifikuj svaku izmenu šeme u release-u:

```text
Class        | Old app compatible?                     | Typical safe pattern
add          | usually yes (nullable / with default)   | add, deploy code that uses it
rename       | no                                      | add new, dual write/read, backfill, switch, drop old
drop         | no while old code reads it              | stop reading and writing first, drop in a later release
type change  | often no; may rewrite and lock table    | new column, dual write, backfill, switch
enum add     | old code may reject unknown values      | deploy tolerant readers first, then write new values
constraint   | may reject old writes; validation locks | add unvalidated/not enforced, fix data, then validate
index        | yes, but build may lock writes          | online/concurrent build where supported
backfill     | yes if batched                          | separate job, batched, resumable, throttled
```

Za svaku izmenu zabeleži: koje verzije je dodiruju, rizik zaključavanja (zavisi od engine-a i verzije), trajanje na veličini production podataka i da li može da se vrati.

## 21. EXPAND-CONTRACT

Koristi kad potrebno:

```text
add
↓
dual-compatible deploy
↓
backfill
↓
switch
↓
remove old
```

## 22. EXPAND-CONTRACT IN DEPTH

Za svaku expand-contract sekvencu proveri svaku fazu kao zaseban release:

```text
Phase 1 expand   : new structure added; old code unaffected
Phase 2 dual     : code writes both (or writes new, reads both); old instances still safe
Phase 3 backfill : historical data copied; progress measurable; resumable
Phase 4 switch   : reads move to new structure; verified by comparison
Phase 5 contract : old structure removed only after no running or rollback-able version uses it
```

Za svaku fazu proveri: koje verzije mogu da rade, na šta se vraća rollback i koji dokaz otvara sledeću fazu (backfill završen, provere razilaženja na nuli, nema starih klijenata). Dual write zahteva definisan izvor istine i proveru usklađenosti za razilaženja. Uklanjanje (contract) u istom release-u kao switch je nalaz kada cilj rollback-a i dalje koristi staru strukturu.

## 23. DUAL WRITE

Može biti potrebno, ali nosi consistency risk.

## 24. BACKFILL

Ne blokiraj deployment.

## 25. MIGRATION LOCK

Large table DDL.

## 26. ONLINE INDEX

Provider/DB semantics.

## 27. MIGRATION ORDER

Schema pre app ili app pre schema zavisno od compatibility plana.

## 28. MIGRATION SINGLETON

Ne svaka replica.

## 29. MIGRATION FAILURE

Deploy stop/rollback.

## 30. IRREVERSIBLE MIGRATION

Plan.

## 31. OLD APP ROLLBACK

Da li radi sa new schema?

## 32. API BACKWARD COMPATIBILITY

Old frontend/mobile client.

## 33. RESPONSE FIELD REMOVAL

Breaking.

## 34. REQUEST FIELD REQUIREMENT

New backend koji odmah zahteva field old client ne šalje.

## 35. STATUS/ENUM VALUE

Old client crash.

## 36. CACHE SCHEMA

Old/new serialized object format.

## 37. CACHE KEY VERSIONING

Može sprečiti deserialize failures.

## 38. CACHE INVALIDATION

Deploy stampede.

## 39. SESSION FORMAT

Old/new app moraju čitati iste sessions tokom rollout-a.

## 40. TOKEN CLAIM

New version ne sme odbaciti old still-valid token bez namere.

## 41. SERIALIZATION COMPATIBILITY

Sesije, tokeni, cache unosi i poruke u redovima nadžive proces koji ih je upisao. Za svaki format:

- da li nova verzija može da pročita ono što je upisala stara i da li stara verzija može da pročita ono što upisuje nova (za rollback)?
- da li obe verzije ignorišu nepoznata polja i dodeljuju podrazumevane vrednosti poljima koja nedostaju?
- da li postoji oznaka verzije i da li čitalac bezbedno odbija ili preusmerava nepoznate verzije umesto da pukne ili beskonačno ponavlja?
- koliko dugo podaci u ovom formatu mogu da žive (trajanje sesije, istek tokena, TTL cache-a, zadržavanje u redu, odloženi poslovi)?

Pravilo koje proveravaš, a ne pretpostavljaš: tolerantne čitaoce deploy-uj pre pisaca novog formata.

## 42. QUEUE PAYLOAD

Old producer -> new consumer.

## 43. NEW PRODUCER -> OLD CONSUMER

Oba smera tokom mixed fleet-a.

## 44. JOB VERSION

Version envelope gde potrebno.

## 45. DELAYED JOB

Može biti izvršen satima posle deploy-a.

## 46. CRON

Old i new schedules mogu oba raditi.

## 47. DUPLICATE SCHEDULER

Rolling replicas.

## 48. WEBHOOK VERSION

External providers ne deployuju zajedno sa vama.

## 49. STATIC ASSETS

Old HTML -> new JS? New HTML -> old assets?

## 50. HASHED ASSETS

Pomažu.

## 51. DELETE OLD ASSETS

Ne prerano.

## 52. CDN

Propagation.

## 53. SERVICE WORKER

Old PWA may persist.

## 54. LONG-LIVED CLIENTS

Klijenti se ne ažuriraju kada i server:

- **web SPA i keširani asset-i** - otvoren tab može satima ili danima da pokreće stari bundle
- **PWA / service worker** - može da servira stare asset-e dok se ciklus ažuriranja ne završi
- **mobilne i desktop aplikacije** - korisnici mogu mesecima da ostanu na starim verzijama
- **API potrošači trećih strana i webhook-ovi** - ažuriraju se po sopstvenom rasporedu

Za svaku izmenu API-ja utvrdi najstariju verziju klijenta koja se još koristi (iz telemetrije, a ne pretpostavke), da li server može da prepozna verzije klijenata i da li postoji mehanizam minimalne verzije ili prinudnog ažuriranja i da li je testiran.

## 55. FEATURE FLAG

Može držati code dormant dok fleet nije kompletno new.

## 56. FLAG ROLLBACK

Brže od binary rollback-a.

## 57. CONFIG COMPATIBILITY

Old/new versions čitaju isto env.

## 58. SECRET ROTATION

Dual-key overlap.

## 59. SIGNING KEY ROTATION

Verifier može privremeno prihvatati old+new prema security modelu.

## 60. TLS/CERT

Deployment-independent.

## 61. LOAD BALANCER

Readiness.

## 62. NEW INSTANCE STARTUP

Ne primaj traffic pre warmup-a.

## 63. OLD INSTANCE DRAIN

Ne ubij active requests.

## 64. KEEP-ALIVE

Connection draining.

## 65. WEBSOCKET

Reconnect.

## 66. LONG POLL/SSE

Shutdown semantics.

## 67. UPLOAD

Long upload pre deploy.

## 68. DOWNLOAD/STREAM

Drain.

## 69. TRAFFIC DRAINING MODEL

Ispravan redosled gašenja instance je:

```text
stop receiving new traffic (readiness fails / deregistered from load balancer)
-> wait for routing changes to propagate
-> stop accepting new work
-> finish or hand off in-flight work within the grace period
-> close connections and exit
```

Proveri svaki tip konekcije posebno:

```text
HTTP request/response    : in-flight requests finish; keep-alive connections closed cleanly
WebSocket                : clients reconnect with backoff; state restored; no reconnect storm
SSE / long polling       : stream closed with a retry hint; no lost events
uploads                  : long uploads not cut off, or resumable
downloads / streams      : completed or resumable
background jobs          : stop fetching, finish or requeue safely
```

Proces koji se odmah gasi na signal za prekid ili load balancer koji i dalje rutira ka njemu pošto je prestao da sluša proizvode greške pri svakom deploy-u.

## 70. PAYMENT

Unknown outcome pri shutdown-u.

## 71. WORKER SHUTDOWN

Stop fetching, finish/invalidate current job.

## 72. GRACE PERIOD

Long enough, bounded.

## 73. HARD KILL

Recovery if grace expires.

## 74. HEALTHCHECK

New version broken -> never ready.

## 75. ROLLOUT PROGRESS DEADLINE

Prevent hanging forever.

## 76. CAPACITY DURING ROLLOUT

Ako 25% unavailable:

remaining fleet must handle peak.

## 77. CPU/MEM HEADROOM

## 78. DB CONNECTIONS

New+old overlap may temporarily increase connections.

## 79. CAPACITY AND CONNECTION MATH DURING ROLLOUT

Izračunaj, ne pretpostavljaj:

```text
serving capacity during rollout = (desired - max unavailable) instances, minus instances warming up
peak load / serving capacity = utilization during rollout (must stay under safe limit)
DB connections during rollout = (old instances + new instances) x pool size + workers + jobs
```

Surge instance, dvostruke blue/green flote i canary privremeno podižu broj konekcija; uporedi sa limitom konekcija baze. Hladni cache i JIT zagrevanje na novim instancama smanjuju efektivni kapacitet na početku svakog talasa.

## 80. CANARY

Real user metric.

## 81. CANARY DB WRITES

Canary uses same schema.

## 82. CANARY EVALUATION

Canary štiti samo ako može da otkrije otkaz pre punog rollout-a:

- da li su metrike razdvojene po verziji, tako da se canary koji dobija mali deo saobraćaja ne sakrije u zbiru?
- da li canary saobraćaj prolazi kroz izmenjene putanje koda i da li je uzorak dovoljno veliki da bude smislen?
- da li prozor procene pokriva odložene efekte (poslovi, cron, istek cache-a, batch-evi sledećeg dana)?
- da li su canary upisi kompatibilni sa starom verzijom, pošto odbijen canary ostavlja svoje podatke?
- da li neuspela procena automatski zaustavlja i vraća rollout i da li je to izvedeno?

## 83. BLUE/GREEN

Both environments may run jobs.

## 84. BLUE/GREEN BACKGROUND WORKERS

Avoid duplicate side effects.

## 85. DUPLICATE EXECUTION DURING ROLLOUT

Tokom rolling, blue/green i canary deployment-a, dve flote mogu istovremeno da rade posao u pozadini:

- scheduler-i ili cron i u starim i u novim instancama (ili u obe boje) pokreću isti posao
- potrošači reda obe verzije obrađuju iste tipove poruka različitom logikom
- singleton zadaci (samo za lidera) sa izborom lidera koji ne preživi prelaz

Proveri izbor lidera ili spoljno zakazivanje, idempotency ključeve na sporednim efektima (email-ovi, plaćanja, izvozi) i da li neaktivna boja u blue/green zaista zaustavlja svoje worker-e.

## 86. SWITCHOVER

DNS/load balancer.

## 87. ROLLBACK SWITCH

Fast path.

## 88. ROLLBACK AFTER NEW DATA IS WRITTEN

Kada nova verzija upiše podatke, vraćanje koda ne uklanja te podatke. Za svaki novi oblik podataka (nove enum vrednosti, popunjene nove kolone, novi formati poruka ili sesija, novi raspored fajlova) proveri da li stara verzija može da ga pročita, ignoriše ili bezbedno odbije. Ako ne može, stvarne opcije su roll-forward ispravka ili korak popravke podataka; navedi koja važi i da li je pripremljena pre release-a.

## 89. SERVERLESS

New deployment may become active quickly, but old client requests/caches still matter.

## 90. REGION

Multi-region deploy skew.

## 91. COMPATIBILITY WINDOW

Koliko dugo old/new may coexist?

## 92. MOBILE CLIENT WINDOW

Days/months.

## 93. CONTRACT TEST

Test old client/new server and new client/old server where relevant.

## 94. DB COMPAT TEST

Old binary against migrated schema.

## 95. QUEUE COMPAT TEST

Old/new producer-consumer permutations.

## 96. SESSION COMPAT TEST

Old session across deploy.

## 97. ROLLBACK TEST

Actual staging exercise.

## 98. PRODUCTION SMOKE

After each wave.

## 99. SLO MONITOR

Errors/latency.

## 100. AUTO PAUSE

Canary error spike.

## 101. FAILURE SCENARIO

New pods 50% ready then migration fails.

## 102. FAILURE SCENARIO

Migration succeeds, app fails.

## 103. FAILURE SCENARIO

App succeeds, background worker fails.

## 104. FAILURE SCENARIO

Rollback binary incompatible with migrated DB.

## 105. FAILURE SCENARIO

New queue payload poisons old consumer.

## 106. FAILURE SCENARIO

Old browser calls removed endpoint.

## 107. MATRICES

### Mixed-Version Compatibility Matrix

| Pair | Can occur during | Duration of exposure | Compatible | Evidence (tier) | Failure if not | Control |
|---|---|---|---|---|---|---|
| old app -> new DB schema | | | | | | |
| new app -> transitional DB schema | | | | | | |
| old producer -> new consumer | | | | | | |
| new producer -> old consumer | | | | | | |
| old client -> new API | | | | | | |
| new client -> old API | | | | | | |
| old session -> new app | | | | | | |

Dodaj redove za cache, tokene, webhook-ove, statičke asset-e, poslove i konfiguraciju gde je primenljivo.

## 108. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Deployment phase:
Old version:
New version:
Compatibility pair:
Shared dependency:
Scope:
Trigger:
Compatibility assumption:
Expected invariant:
Failure path:
User impact:
Data impact:
Blast radius:
Rollback impact:
Evidence:
Root cause:
Remediation:
Verification:
Regression risk:
```

## 109. SEVERITY

- **P0** - rollout ili rollback oštećuju ili gube podatke, ili čine servis nedostupnim za sve korisnike duže od navedenog zahteva bez brzog oporavka.
- **P1** - normalan deploy izaziva raširene greške tokom perioda mešanih verzija (obrisana kolona se i dalje čita, nekompatibilan format poruke, poništavanje sesija), ili je rollback nemoguć pošto release upiše podatke.
- **P2** - greške ograničene na deo korisnika ili tipova konekcija (dugi upload-i, WebSocket-i, stari klijenti), dupli sporedni efekti tokom rollout-a, dostignuti limiti kapaciteta ili konekcija u vršnom opterećenju.
- **P3** - prolazne greške koje se same oporavljaju u okviru navedenog zahteva; nedostaju metrike razdvojene po verziji.
- **P4** - hardening: jače margine kompatibilnosti, automatski testovi kompatibilnosti, gde ne postoji trenutni failure path.

## 110. OUTPUT

`ZERO_DOWNTIME_DEPLOYMENT_AUDIT.md`

## 111. SECOND PASS

Obavezna provera:

- podela 50/50 između stare i nove flote
- stari binary nad novom šemom; novi binary nad prelaznom šemom
- deploy izveden u vršnom saobraćaju, sa računicom kapaciteta i konekcija
- dugi zahtevi, upload-i, WebSocket-i i stream-ovi tokom signala za prekid
- poruke u redovima i odloženi poslovi koji prelaze granicu verzija u oba smera
- sesije, tokeni i cache unosi koji prelaze granicu verzija u oba smera
- rollback izveden posle migracije i pošto je nova verzija upisala podatke
- najstariji podržani mobilni, desktop i keširani web klijenti
- dupliranje cron-a i poslova u pozadini kroz flote ili boje

Zatim pokušaj da opovrgneš svaki nalaz: da li je kombinacija zaista dostižna s obzirom na redosled rollout-a, flag-ove i provere verzija? Da li je tolerantan čitalac ili sloj kompatibilnosti već obrađuje? Zabeleži one koji ne mogu da se opovrgnu sa njihovim evidence tier-om.

## 112. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da pokriva:

- navedeni zahtev za dostupnost i da li je tvrdnja "zero downtime" podržana dokazom
- tačnu strategiju i parametre rollout-a
- svaki obavezni par kompatibilnosti sa odgovorom i evidence tier-om
- svaku migraciju klasifikovanu, sa rizikom zaključavanja i expand-contract fazama
- kompatibilnost serijalizacije za sesije, tokene, cache i poruke, u oba smera
- dugoživeće klijente i najstariju verziju u upotrebi
- ponašanje statičkih asset-a, CDN-a i service worker-a
- draining za svaki tip konekcije i posao u pozadini
- računicu kapaciteta i konekcija baze tokom rollout-a
- canary procenu i automatsku pauzu/rollback
- duplo izvršavanje zakazanih poslova i poslova u pozadini
- rollback pošto su upisani novi podaci i alternativu roll-forward
- testirane putanje otkaza, a ne samo dizajnirane
- dosledne statuse i evidence tier-ove

# KONAČNO PRAVILO

Tražim:

```text
migration:
DROP COLUMN legacy_price
↓
rolling deploy starts
↓
old instances still run
↓
old code reads legacy_price
↓
requests fail until rollout completes
```

ili:

```text
new producer emits queue payload v2
↓
old worker remains alive during rollout
↓
old worker cannot parse v2
↓
message retries forever
↓
queue backlog grows
```

Drugi failure chain-ovi koje tražim:

```text
release adds order status "partially_refunded"
↓
new version writes it for a few hundred orders
↓
error spike triggers rollback to the previous version
↓
old code maps status with an exhaustive switch and throws on unknown values
↓
order pages and exports fail for exactly the orders touched after the release
```

```text
blue and green environments both run the scheduler
↓
switchover moves traffic, but the idle color keeps its workers running
↓
daily invoice job runs in both colors
↓
customers receive duplicate invoices and charges
```
