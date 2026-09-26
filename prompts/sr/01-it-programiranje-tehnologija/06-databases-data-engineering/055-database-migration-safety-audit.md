---
id: UPL-IT-055
number: 55
slug: database-migration-safety-audit
title: Database Migration Safety Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# DATABASE MIGRATION SAFETY AUDIT

Želim maksimalno duboku analizu svih database migrations i procedure kojom schema/data changes ulaze u production.

Glavni cilj:

> Pronaći migration promene koje mogu zaključati velike tabele, oboriti mixed-version deployment, izgubiti podatke, napraviti partial migration, onemogućiti rollback ili proizvesti dug production outage.

## 1. OBJECTIVE AND NON-GOALS

Za svaku migraciju koja čeka i svaku nedavnu migraciju dokaži da li može da se izvrši na stvarnoj production bazi, na production veličini i pod production saobraćajem, dok stara i nova verzija aplikacije rade istovremeno, i da li sistem može da se oporavi ako migracija padne na pola.

Van obima:

- pregled logičkog dizajna šeme (to pokriva poseban schema audit; pomeni problem dizajna samo kada čini migraciju nebezbednom)
- odbacivanje migracije samo zato što sintaksa izgleda opasno (DROP, ALTER TYPE) bez analize rollout-a
- generički saveti tipa "uvek prvo napravi backup" umesto konkretnog plana rollout-a i oporavka
- propisivanje određenog alata za migracije

## 2. CONTEXT DISCOVERY

Utvrdi pre nego što proceniš bilo koju migraciju:

```text
Engine and exact version (and managed-service variant):
Migration tool and version:
How migrations run (CI step, dedicated job, app startup, init container, manual):
Transaction wrapping (per migration, per file, none):
Deployment strategy (rolling, blue/green, canary, serverless):
Largest affected tables (rows, bytes, write rate, peak hours):
Long-running transactions and jobs that hold locks:
Replication topology (replicas, logical replication, CDC consumers):
Lock timeout and statement timeout settings used by the migration session:
Backup / PITR status:
```

Ponašanje DDL-a (koje operacije prepisuju, skeniraju ili zaključavaju i koje lock-ove uzimaju) razlikuje se između engine-a i između verzija istog engine-a. Proveri ponašanje za detektovanu verziju; ako ne može da se proveri, označi zaključak kao **NOT VERIFIED** umesto da pretpostaviš najgori ili najbolji slučaj.

## 3. EVIDENCE MODEL

```text
A - executed: migration run against a production-sized copy or measured in production (duration, locks, disk, lag)
B - complete path: exact generated SQL + engine/version DDL semantics + table size + deployment order
C - strong static evidence: migration file and table size suggest the risk, but generated SQL or version is unverified
D - inference: plausible risk that needs verification
E - hardening: process or tooling improvement without a current failure path
```

Nalaze uvek zasnivaj na SQL-u koji se stvarno izvršava (koji generiše alat), a ne na ORM ili DSL definiciji.

## 4. FINDING STATUS

- **CONFIRMED** - lock, rewrite, kompatibilnost ili put do gubitka podataka je dokazan (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od verzije engine-a, veličine tabele ili redosleda deployment-a koji nisu mogli da se utvrde.
- **NOT APPLICABLE** - operacija je bezbedna za ovaj engine, verziju ili veličinu tabele.
- **CONTROLLED** - rizik je stvaran, ali ga rollout već rešava (expand-contract, online build, batching, timeout-i).
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan lock, ispad, problem kompatibilnosti, gubitak podataka ili problem sa oporavkom.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Destruktivna migracija (DROP COLUMN, DROP TABLE) nije automatski nebezbedna ako rollout dokazuje da nijedan kod koji radi ne koristi objekat i da je oporavak moguć.
- ADD COLUMN, ADD INDEX ili ALTER TYPE nisu automatski blokirajući: mnogi engine-i i verzije izvršavaju neke od njih kao metadata-only ili online operacije. Proveri.
- Migracija na maloj tabeli ili tabeli u koju se retko upisuje nije rizik od lock-a samo zato što bi ista naredba bila opasna na velikoj tabeli.
- Nedostajuća down migracija nije defekt ako je rollback osmišljen kroz forward fix i backward-compatible izmene šeme.
- Pokretanje migracija kao CI koraka umesto posebnog job-a nije automatski pogrešno ako samo jedan runner može da ih izvrši.

## 6. MIGRATION INVENTORY

Za svaku:

```text
Migration:
Tool:
Schema/data:
Tables:
Estimated rows:
Potential lock:
Backward compatible:
Rollback:
```

## 7. OPERATION CLASSIFICATION

Klasifikuj svaku naredbu u svakoj migraciji za detektovani engine i verziju:

```text
metadata-only      catalog change, near-instant, brief lock
table scan         validates every row (constraint validation, NOT NULL check) but does not rewrite
table rewrite      copies the table (type change, some defaults, column reorder), needs time and double storage
blocking DDL       holds a lock that blocks reads and/or writes for its whole duration
online/concurrent  runs alongside traffic but may take short locks at start and end, and may fail midway
data backfill      UPDATE/INSERT over existing rows; cost scales with row count
destructive        removes data or objects; irreversible without restore
```

Zatim proceni na production skali: broj i veličinu redova koji se dodiruju, očekivano trajanje i da li se izvršava u jednoj transakciji. Naredba koja je metadata-only na jednoj verziji može biti ceo rewrite na drugoj.

## 8. APPLIED MIGRATION

Ne edituj already-applied migration kao da je nova.

## 9. ORDER

Deterministic.

## 10. CONCURRENT RUNNERS

Može li više app instances pokrenuti istu migration?

## 11. MIGRATION OWNERSHIP

Tačno jedan runner sme da izvrši migraciju:

- Gde se migracija izvršava: CI job, release job, pokretanje aplikacije, Kubernetes init container, serverless cold start?
- Ako se izvršava pri pokretanju aplikacije, šta sprečava deset replika da je pokrenu u isto vreme?
- Da li alat uzima lock (na primer advisory lock ili lock tabelu) i da li se taj lock oslobađa ako se runner ubije?
- Šta se dešava ako runner izgubi konekciju usred migracije: da li alat beleži delimično stanje?
- Ko sme ručno da pokreće migracije na production-u i da li se ta pokretanja beleže u istoriji migracija?

## 12. LOCK TABLE

Proceni DDL semantics za actual DB/version.

## 13. LOCK ACQUISITION AND LOCK QUEUE

Čak i "brza" DDL naredba može da izazove ispad:

```text
long-running report query holds a shared lock
↓
ALTER TABLE waits for an exclusive lock
↓
on engines where waiting DDL blocks later requests, every new query on the table queues behind it
↓
connection pool fills up
↓
application-wide outage, although the DDL itself would take milliseconds
```

Za svaki DDL utvrdi:

- koji lock mode mu je potreban, na početku, tokom i na kraju operacije
- da li DDL koji čeka blokira nove čitaoce ili pisce na ovom engine-u i verziji
- koje transakcije ili poslovi mogu dugo da drže konfliktne lock-ove (izveštaji, backup, dugi batch poslovi, idle-in-transaction sesije)
- da li migracija postavlja kratak lock timeout i ponavlja pokušaj, umesto da čeka neograničeno

## 14. ADD COLUMN

Usually safe-ish, but default/backfill semantics vary.

## 15. ADD NOT NULL

Potential table scan/rewrite/block.

## 16. DEFAULT

Volatility/engine version.

## 17. DROP COLUMN

Mixed version break.

## 18. RENAME

Use expand-contract.

## 19. TYPE CHANGE

Data rewrite/truncation.

## 20. ENUM CHANGE

Backward compatibility.

## 21. FK ADD

Validation over large table.

## 22. UNIQUE ADD

Existing duplicates.

## 23. CHECK CONSTRAINT

Existing invalid rows.

## 24. INDEX CREATE

Lock duration.

## 25. ONLINE/CONCURRENT

Use where supported and needed.

## 26. BACKFILL

Separate bounded batches.

## 27. HUGE UPDATE

One transaction can generate enormous WAL/log and locks.

## 28. BATCH SIZE

Tune.

## 29. PAUSE/THROTTLE

If needed.

## 30. RESUMABILITY

Long backfill should survive interruption.

## 31. PROGRESS

Track cursor/checkpoint.

## 32. IDEMPOTENT BACKFILL

Rerun safe.

## 33. BACKFILL CONTRACT

Svaki backfill podataka mora da odgovori na:

```text
Selection:        how are the next rows chosen (keyset on a stable key, not OFFSET)?
Chunk size:       rows per batch and expected time per batch at peak load
Transaction:      one transaction per batch, never one for the whole table
Checkpoint:       where progress is stored, so a restart continues instead of starting over
Resume:           what happens after a crash, deploy or manual stop
Throttle:         pause between batches, and a way to slow down when replica lag or load grows
Idempotency:      running a batch twice produces the same result
Concurrent writes: how rows changed by the application during the backfill are handled
Verification:     counts, checksums or sampling that prove completion
Ownership:        which process runs it, and how it is stopped
```

Backfill koji se izvršava u okviru deployment transakcije ili blokira release dok se ne završi na velikoj tabeli je nalaz.

## 34. DUAL WRITE

Consistency hazards.

## 35. DATA COPY

Verify counts/checksum/sample.

## 36. OLD/NEW APP

Matrix.

## 37. ROLLBACK

Old binary after migration.

## 38. NEW DATA

Old code handling values created by new code.

## 39. DELETE OLD COLUMN

Only after old code is gone.

## 40. CONTRACT PHASE

Separate release.

## 41. ROLLBACK REALITY

Razdvoji tri vrste rollback-a:

- **code rollback** - ponovni deploy prethodne verzije aplikacije; bezbedno samo ako stari kod radi nad trenutnom šemom i podacima
- **schema rollback** - down migracija; često netestirana, može ponovo da zaključa ili prepiše tabelu i ne može da vrati obrisane podatke
- **data rollback** - vraćanje podataka; obično znači PITR ili restore, što odbacuje i sve validne upise napravljene u međuvremenu

Za svaku migraciju eksplicitno navedi:

- Da li je izmena reverzibilna bez gubitka podataka? Ako nije, šta je čini prihvatljivom (provereni backup, expand-contract, podaci sačuvani u drugoj koloni)?
- Da li je down migracija ikada izvršena?
- Kada su novi podaci upisani u novom obliku, da li stari kod i dalje može da ih čita?
- Backup nije rollback: restore znači downtime i gubitak novijih upisa. To je disaster-recovery plan, a ne rollback deployment-a.

## 42. MIGRATION FAILURE

Halfway.

## 43. TRANSACTIONAL DDL

DB-specific.

## 44. NON-TRANSACTIONAL DDL

Partial state.

## 45. MIGRATION RETRY

Safe?

## 46. TIMEOUT

Avoid indefinitely blocked deploy.

## 47. LOCK TIMEOUT

## 48. STATEMENT TIMEOUT

## 49. REPLICATION LAG

Heavy migration may overload replica.

## 50. DISK GROWTH

Index/table rewrite needs temporary space.

## 51. DOUBLE STORAGE

Build new index/table can require substantial headroom.

## 52. BACKUP

Recovery plan, not excuse.

## 53. PITR

## 54. DEPLOY ORDER

Migration before/after app.

## 55. FEATURE FLAG

Can separate behavior activation.

## 56. MIGRATION JOB

Dedicated singleton.

## 57. ORM AUTO-SYNC

Dangerous in production if it auto-mutates schema unexpectedly.

## 58. `synchronize=true`

High-priority in ORM frameworks where applicable.

## 59. PRISMA/DRIZZLE/ALEMBIC/FLYWAY ETC.

Understand actual tool semantics.

## 60. DRIFT

Migration history vs live schema.

## 61. MANUAL HOTFIX

Not represented in migration.

## 62. SHADOW DATABASE

If migration tool uses one.

## 63. GENERATED SQL

Review actual SQL, not only ORM DSL.

## 64. PRODUCTION VOLUME

Test using production-scale clone/statistics if possible.

## 65. MIGRATION BENCHMARK

Duration + lock.

## 66. MIGRATION RISK MATRIX

| Migration | Operation class | Table size | Lock mode / duration | Disk / WAL growth | Replica impact | Old app compatible | Reversible | Status |
|---|---|---|---|---|---|---|---|---|

## 67. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (migration, table, statement):
Trigger (when and how it runs):
DB engine / version:
Operation class:
Current behavior (generated SQL, lock mode, rewrite/scan):
Table size and write rate:
Expected invariant (no blocking, mixed-version safety, no data loss):
Failure path:
Impact (lock duration, outage, data loss, stuck deploy):
Blast radius:
Evidence:
Root cause:
Mixed-version risk:
Rollback / recovery:
Remediation (safer rollout steps):
Verification (how to prove the new rollout is safe):
Regression risk:
```

## 68. SEVERITY

- **P0** - nepovratan gubitak ili oštećenje podataka u production-u, ili migracija koja obori ceo sistem bez brzog oporavka.
- **P1** - dokazan blokirajući lock, rewrite tabele ili prekid kompatibilnosti verzija na kritičnoj tabeli koji izaziva ispad production-a ili neuspeo deployment; destruktivna izmena bez funkcionalnog puta oporavka.
- **P2** - značajan rizik na važnim tabelama (dugi lock-ovi van vršnog perioda, veliki replication lag, nebezbedan dizajn backfill-a, netestiran rollback za rizičnu izmenu).
- **P3** - ograničen rizik: male tabele, nedostajući timeout-i na putanjama sa malo saobraćaja, manji drift alata.
- **P4** - hardening: poboljšanja procesa, bolja vidljivost, dokumentovanje koraka rollout-a.

## 69. OUTPUT

`DATABASE_MIGRATION_SAFETY_AUDIT.md`

## 70. SECOND PASS

Za svaku destruktivnu, veliku ili blokirajuću migraciju simuliraj:

- stari binarni fajl aplikacije nad novom šemom (period mešanih verzija)
- novi binarni fajl aplikacije nad prelaznom šemom
- dugačku transakciju koja drži konfliktni lock kada migracija počne
- pad migracije usred izvršavanja i stanje koje ostavlja za sobom
- ponovni pokušaj migracije posle tog pada
- rollback aplikacije posle upisa novih podataka
- maksimalan očekivani broj redova i brzinu upisa u production-u
- replication lag replika i CDC / logical replication potrošače
- rezervu prostora na disku, privremenog prostora i WAL / redo / binlog prostora na primary-ju i replikama
- dva runner-a koji istovremeno pokušavaju da izvrše migraciju

Zatim pokušaj da opovrgneš svaki nalaz: da li je operacija na ovoj verziji zapravo metadata-only? Da li je tabela zapravo mala? Da li rollout već koristi expand-contract?

## 71. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da:

- su engine i verzija utvrđeni, a DDL semantika proverena za tu verziju
- se zaključci zasnivaju na SQL-u koji se stvarno izvršava, a ne samo na ORM definiciji
- je svaka migracija klasifikovana (metadata-only, scan, rewrite, blocking, online, backfill, destructive)
- su za velike tabele uzeti u obzir production broj redova, veličina i brzina upisa
- su analizirani čekanje na lock, efekti lock queue-a i timeout-i
- su za rewrite i build indeksa provereni disk, privremeni prostor, WAL i rezerva na replikama
- je za svaki rollout proverena kompatibilnost mešanih verzija (stara aplikacija / nova šema, nova aplikacija / stara šema)
- backfill-ovi imaju chunking, checkpoint, resume, throttling, idempotentnost i verifikaciju
- samo jedan runner može da izvrši svaku migraciju
- je rollback opisan posebno za kod, šemu i podatke i da su nepovratne izmene identifikovane
- su statusi i evidence tier-ovi dosledno primenjeni

# KONAČNO PRAVILO

Tražim:

```text
migration:
ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT 'RS'

↓
table has 400M rows
↓
actual DB/version rewrites/validates table
↓
migration runs inside deployment
↓
exclusive lock blocks traffic
↓
deployment outage
```

Drugi failure chain-ovi koje tražim:

```text
migration: ALTER TABLE orders ADD CONSTRAINT fk_customer FOREIGN KEY ...
↓
constraint is validated immediately
↓
validation scans 300M rows while holding a lock that blocks writes to orders
↓
checkout requests time out for the duration of the scan
```

```text
migrations run at application startup
↓
rolling deploy starts 12 replicas at once
↓
no migration lock: two replicas run the same backfill concurrently
↓
duplicate rows and a deadlock
↓
half the fleet crashes on boot; the other half runs against a half-migrated schema
```

```text
column renamed in one release (no expand-contract)
↓
new version writes to the new name
↓
deploy fails health checks and is rolled back
↓
old version reads the old column name, which no longer exists
↓
rollback itself causes the outage
```
