---
id: UPL-IT-054
number: 54
slug: database-index-audit
title: Database Index Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# DATABASE INDEX AUDIT

Želim kompletan forensic audit svih indexes sa fokusom na query coverage, write amplification, duplicate indexes, uniqueness, ordering i production usage.

## 1. OBJECTIVE AND NON-GOALS

Audit mora da dokaže, za svaku važnu tabelu, da li postojeći skup indeksa odgovara stvarnim access pattern-ima: koji query-ji su dobro opsluženi, koji loše, koji indeksi koštaju više nego što donose i koje izmene indeksa mogu bezbedno da se deploy-uju.

Rezultat je mali skup izmena indeksa (add, change, drop, rebuild) potkrepljenih dokazima, sa izmerenom koristi za čitanje, procenjenim troškom upisa i storage-a i bezbednim rollout-om.

Van obima:

- nabrajanje svih kolona koje bi teorijski mogle da se indeksiraju
- generički saveti tipa "dodaj indekse na foreign key-eve" bez query-ja kojem su potrebni
- redizajn šeme, ORM-a ili cache sloja (pomeni samo ako indeks ne može da reši access pattern)
- backup, autentikacija ili opšta arhitektura aplikacije
- izbor drugog database engine-a

## 2. CONTEXT DISCOVERY

Pre nego što proceniš bilo koji indeks, utvrdi:

```text
Engine and exact version:
Storage engine / table type:
Primary key strategy (sequential, UUID v4, ordered ID):
Largest tables (rows, bytes, growth rate):
Read/write ratio per table:
Workload source available (statement statistics, slow log, APM, query log):
Statistics window (since when are usage counters collected?):
Replicas (are reads served from replicas with their own index usage?):
Multi-tenant model (shared tables with tenant_id, schema per tenant, database per tenant):
ORM / query builder that generates the SQL:
```

Ponašanje indeksa zavisi od engine-a i verzije (leftmost-prefix pravila, backward scan, INCLUDE kolone, partial/filtered indeksi, online build, NULL u unique indeksima, clustered layout). Proveri semantiku za detektovani engine i verziju pre nego što je navedeš. Ako engine ili verzija ne mogu da se utvrde, reci to i označi zaključke koji zavise od engine-a kao **NOT VERIFIED**.

## 3. ACCESS-PATTERN-FIRST RULE

Nikada ne radi u ovom smeru:

```text
look at columns
↓
invent indexes
```

Uvek kreni od workload-a:

```text
query fingerprint
↓
filter predicates (equality / range / IN / LIKE / functions)
↓
joins
↓
sort and limit
↓
selected columns
↓
frequency and total time
↓
cardinality and selectivity of each predicate
```

Za svaki važan query zabeleži:

```text
Fingerprint:
Call site / endpoint / job:
Calls per second or per day:
Total and p95 time:
Rows examined vs rows returned:
Predicates (with operator type):
Join keys:
ORDER BY / LIMIT:
Columns returned:
Current plan (index used, scan type, sort, rows):
```

Preporuka za indeks koja ne može da se poveže sa jednim od ovih zapisa nije nalaz.

## 4. EVIDENCE MODEL

Klasifikuj dokaze iza svakog nalaza:

```text
A - measured: production statement statistics, actual execution plans with real row counts, or a benchmark on production-like data
B - complete static path: query text + current plan (EXPLAIN without execution) + table size and statistics
C - strong static evidence: query and schema show the gap, but no plan or volume data
D - inference: plausible access pattern or risk that needs verification
E - hardening: maintenance or future-growth recommendation without a current problem
```

Nalaz o indeksu koji **nedostaje** zahteva najmanje tier B. Preporuka za **brisanje** indeksa zahteva dokaz o korišćenju kroz reprezentativan period (tier A ili B) i proveru svih potrošača (primary, replike, periodični poslovi, constraint-i). Stavke tier D i E se nikada ne prijavljuju kao potvrđeni defekti.

## 5. FINDING STATUS

Svaki nalaz ima tačno jedan status:

- **CONFIRMED** - problem sa access path-om ili višak troška je dokazan (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C); plan ili volumen još treba proveriti.
- **NOT VERIFIED** - zavisi od podataka koji nisu dostupni (verzija engine-a, period statistike, production volumen).
- **NOT APPLICABLE** - problem se ne odnosi na ovaj engine, veličinu tabele ili workload.
- **CONTROLLED** - rizik postoji u principu, ali je već rešen (na primer, postojeći composite indeks pokriva query).
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako iza nje ne stoji konkretan query, write path, lock ili storage problem.

## 6. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Indeks koji nedostaje nije nalaz osim ako stvaran, čest ili skup access pattern ima koristi od njega.
- Sequential scan nije automatski loš: na malim tabelama, ili kada se vraća većina redova, to može biti najjeftiniji plan.
- Indeks sa nula zabeleženih korišćenja nije automatski nekorišćen: brojači su možda resetovani, period možda ne obuhvata mesečne poslove, čitanja možda idu na replike, a indeks možda obezbeđuje constraint.
- Foreign key kolona bez indeksa nije automatski problem ako se parent redovi nikada ne brišu ili menjaju i nijedan query ne radi join ili filter po njoj.
- Kolona niske kardinalnosti (status, boolean) nije automatski loš kandidat: može biti odlična kao partial indeks ili kao vodeća kolona za redak value.
- UUID primarni ključevi nisu automatski performance defekt; mora se pokazati da je fragmentacija bitna za ovaj workload.
- Dva indeksa koja počinju istom kolonom nisu automatski redundantna; uniqueness, smer sortiranja, INCLUDE kolone i partial predikati mogu da se razlikuju.

## 7. INDEX INVENTORY

Za svaki:

```text
Index:
Table:
Columns:
Order:
Unique:
Partial:
Expression:
Size:
Usage stats:
Queries supported:
```

## 8. PRIMARY/UNIQUE

Ne diraj constraint-backed indexes bez razumevanja.

## 9. FOREIGN KEY

Child FK često treba index za joins/deletes, ali proveri workload.

## 10. MISSING INDEX

Finding mora pokazati concrete query.

## 11. UNUSED INDEX

Usage statistics imaju observation window.

Restart statistics can mislead.

## 12. UNUSED INDEX EVIDENCE

Pre nego što preporučiš brisanje indeksa, dokaži da se ne koristi:

- Kada su statistike korišćenja poslednji put resetovane (restart, failover, ručni reset, upgrade)?
- Da li period obuhvata ceo poslovni ciklus (poslovi na kraju meseca, godišnji izveštaji, retki admin ekrani)?
- Da li replike vode sopstvenu statistiku korišćenja? Indeks koji se ne koristi na primary-ju možda opslužuje sva čitanja na replici.
- Da li indeks stoji iza primarnog ključa, unique constraint-a ili foreign key-a?
- Da li ga optimizer koristi za statistiku ili dokaz uniqueness-a čak i kada se ne skenira?
- Da li se na njega pozivaju index hint-ovi u kodu ili ORM konfiguraciji?

Ako nešto od ovoga ne može da se proveri, status je **NOT VERIFIED**, a ne CONFIRMED.

## 13. DUPLICATE INDEX

Exact duplicate.

## 14. PREFIX DUPLICATE

Composite `(a,b)` may cover some `(a)` queries, ali uniqueness/order/include differences matter.

## 15. REDUNDANT UNIQUE

## 16. REDUNDANCY DETECTION

Klasifikuj svako preklapanje precizno:

```text
exact duplicate        same columns, order, direction, predicate, expression and INCLUDE list
left-prefix overlap    (a) next to (a, b): often removable, but only if uniqueness, sort and size allow it
constraint-backed      one of the pair enforces PRIMARY KEY / UNIQUE / FK and cannot simply be dropped
INCLUDE difference     same key columns, different covered columns: one may enable index-only scans
partial difference     same columns, different WHERE predicate: they may serve different queries
expression difference  lower(email) vs email: different access paths
```

Za svakog kandidata za uklanjanje navedi query-je koji ga trenutno koriste i dokaži da ih preostali indeks opslužuje ekvivalentnim planom.

## 17. INDEX CAPABILITY MODEL

Procenjuj svaki postojeći i predloženi indeks po istim dimenzijama:

```text
Predicate support:   which WHERE conditions can use it (equality, range, IN, prefix LIKE, expression)
Sort support:        which ORDER BY clauses it satisfies without a sort step
Covering potential:  can the query be answered from the index alone?
Uniqueness:          does it enforce or prove uniqueness?
Write cost:          which INSERT/UPDATE/DELETE paths must maintain it, and how often
Storage cost:        size on disk and in memory, growth rate
Maintenance cost:    bloat, rebuild needs, statistics, build time on the current table size
```

Predloženi indeks je opravdan samo kada korist za čitanje stvarnih query-ja nadmašuje njegov trošak upisa, storage-a i održavanja.

## 18. WRITE COST

Svaki index:

- insert
- update
- delete
- storage
- maintenance

## 19. WRITE AMPLIFICATION

Za tabele sa mnogo upisa kvantifikuj koliko košta svaki dodatni indeks:

- broj indeksa koji moraju da se ažuriraju po INSERT-u
- UPDATE naredbe koje menjaju indeksirane kolone (u engine-ima koji mogu da preskoče održavanje indeksa kada se indeksirane kolone ne menjaju, novi indeks na koloni koja se često menja može da isključi tu optimizaciju)
- DELETE i cascade putanje
- dodatni WAL / redo / binlog volumen i njegov uticaj na replike
- lock i latch contention na hot stranicama indeksa

Navedi trošak upisa pored koristi za čitanje. Ubrzanje retkog izveštaja koje usporava svaki checkout upis je obično loša razmena.

## 20. WIDE INDEX

Large text/include columns.

## 21. COMPOSITE ORDER

Equality columns, range, sort pattern prema actual query.

## 22. LEFTMOST PREFIX

Engine-specific behavior.

## 23. ORDER DIRECTION

Some engines can scan backward.

Verify.

## 24. EQUALITY, RANGE AND SORT COMBINATIONS

Za composite indekse zaključuj na osnovu oblika query-ja:

```text
WHERE tenant_id = ? AND status = ? AND created_at > ?
ORDER BY created_at DESC
LIMIT 50
```

- prvo equality kolone (tenant_id, status), u redosledu koji opslužuje i druge česte query-je
- zatim kolona koja se i filtrira po opsegu i sortira (created_at)
- range uslov na ranijoj koloni obično sprečava da indeks obezbedi sortiranje za kasnije kolone
- IN liste se u nekim engine-ima ponašaju kao equality, a u drugim kao range; proveri za dati engine
- proveri da li planner stvarno koristi indeks i za filtriranje i za sortiranje (bez posebnog sort koraka, razuman broj pregledanih redova)

Nemoj predlagati redosled kolona bez prikaza koje query-je opslužuje, a koje prestaje da opslužuje.

## 25. INCLUDE/COVERING

Do not overuse.

## 26. PARTIAL INDEX

Useful for:

```text
deleted_at IS NULL
status = active
```

if query matches.

## 27. EXPRESSION INDEX

LOWER(email), date expressions etc.

## 28. FUNCTION MATCH

Query expression must match planner semantics.

## 29. SELECTIVITY

## 30. BOOLEAN INDEX

May be poor unless partial/composite.

## 31. TENANT

Typical multi-tenant indexes need scope awareness.

## 32. GLOBAL ID

If IDs globally unique, tenant may not be needed for lookup performance, but authorization still needs scoping.

## 33. UNIQUE PER TENANT

```text
UNIQUE(tenant_id, slug)
```

## 34. SOFT DELETE UNIQUE

Partial unique or lifecycle alternative.

## 35. NULL UNIQUE SEMANTICS

DB-specific.

## 36. PAGINATION

Index for filter + order.

## 37. SEARCH

B-tree not appropriate for all text search patterns.

## 38. FULL TEXT

Engine-specific index.

## 39. TRIGRAM

Where relevant.

## 40. JSON

GIN/GiST/inverted according to engine/query.

## 41. ARRAY

## 42. SPATIAL

If geo.

## 43. PREFIX LENGTH

MySQL-like.

## 44. COLLATION

Index semantics.

## 45. CASE INSENSITIVE

## 46. DESC

## 47. NULL ORDER

## 48. CLUSTERED INDEX

Engine-specific physical behavior.

## 49. HOT INSERT

Sequential keys vs random UUID.

Do not claim one always superior.

## 50. UUID V4

May increase index fragmentation/page splits in some engines.

## 51. UUID V7 / ordered ID

Potential improvement if actual bottleneck proven.

## 52. INDEX SIZE

Fits cache?

## 53. CACHE RESIDENCY

Indeks predvidljivo pomaže latenciji samo ako njegov hot deo ostaje u memoriji.

- uporedi ukupnu veličinu često korišćenih indeksa sa buffer pool-om / shared buffers
- proveri da li insert-i sa nasumičnim ključem dodiruju stranice kroz ceo indeks (loša lokalnost) ili samo krajnje desne stranice
- proveri buffer hit ratio i fizička čitanja za pogođene query-je
- novi veliki indeks može da izbaci working set drugih query-ja iz memorije; uračunaj to u trošak

## 54. BLOAT

## 55. REINDEX

Operational risk.

## 56. CONCURRENT INDEX CREATION

Use engine-supported online/concurrent method where required.

## 57. LOCKING

Index build can block writes/reads.

## 58. PROD MIGRATION

Large index build as release step.

## 59. VALIDATION

Some DBs support create not-valid/online workflows for constraints/indexes.

## 60. LOCK-SAFE INDEX BUILD

Za svaku izmenu indeksa na velikoj production tabeli konkretno utvrdi:

- Ako migracija pravi indeks na tabeli od 500 GB: da li stvarni engine i verzija podržavaju online ili concurrent build i koje lock-ove uzima na početku i na kraju?
- Koliko samo čekanje na lock može da traje iza postojeće dugačke transakcije i da li DDL koji čeka blokira nove query-je iza sebe na ovom engine-u?
- Koliko privremenog prostora na disku, prostora za sortiranje i WAL / redo / binlog volumena će build napraviti i da li ima rezerve na primary-ju i na svakoj replici?
- Da li replike mogu da primene izmenu uz prihvatljiv replication lag?
- Šta se dešava ako build padne ili se prekine na pola (na primer, ostane invalid indeks koji i dalje košta upise)?
- Da li postoje lock timeout i statement timeout, tako da deployment brzo padne umesto da zaustavi saobraćaj?
- Da li build pokreće jedan kontrolisani migration job, a ne svaka instanca aplikacije?

Build unique indeksa dodatno pada ako već postoje duplikati; prvo proveri podatke.

## 61. ROLLBACK AND REMOVAL

Svaka izmena indeksa mora da ima put nazad:

- brisanje indeksa se brzo izvršava, ali se sporo poništava: ponovno pravljenje na velikoj tabeli je ceo build
- gde engine to podržava, prvo učini indeks invisible/disabled i posmatraj pre brisanja
- redundantne indekse briši u zasebnom release-u u odnosu na dodavanje njihove zamene, da bi se zamena prvo dokazala
- zabeleži tačnu definiciju svakog obrisanog indeksa da bi mogao ponovo da se napravi
- proveri ORM migracije i schema fajlove da sledeći deploy ne bi ponovo napravio ili obrisao indeks

## 62. QUERY-TO-INDEX COVERAGE MATRIX

| Query fingerprint | Calls/day | Predicates | Order/limit | Index used now | Rows examined/returned | Candidate | Expected access path | Status |
|---|---:|---|---|---|---|---|---|---|

## 63. WRITE-COST MATRIX

| Table | Writes/sec | Updates to indexed columns | Index count | Index bytes | WAL/redo impact | Proposed change | Net effect |
|---|---:|---|---:|---:|---|---|---|

## 64. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (table / index):
Trigger (query fingerprint, call frequency, total time):
Current behavior (current plan, rows examined / returned):
Expected access path:
Failure path (how the index problem becomes latency, contention, write cost or an outage):
Impact:
Blast radius:
Evidence:
Root cause:
Candidate index definition:
Read benefit (measured or estimated, with method):
Write cost:
Storage and memory cost:
Redundancy / overlap:
Usage statistics and observation window:
Migration risk (lock, duration, disk, replicas):
Benchmark evidence (before / after):
Rollback / removal plan:
Remediation:
Verification:
Regression risk:
```

## 65. SEVERITY

Severity prati uticaj, a ne broj indeksa koji nedostaju:

- **P0** - izmena indeksa ili indeks koji nedostaje izaziva ispad celog production-a ili gubitak integriteta podataka (na primer, blokirajući build indeksa na najopterećenijoj tabeli u vršnom periodu, ili obrisan unique indeks zbog kojeg duplikati kvare poslovne podatke).
- **P1** - dokazan, ponovljiv pad performansi na kritičnoj putanji (timeout-i, iscrpljen pool, gomilanje lock-ova) ili unique indeks koji nedostaje, a dozvoljava stvarno kršenje invarijanti.
- **P2** - značajna latencija ili trošak resursa na važnim query-jima, ili veliki trošak upisa/storage-a zbog redundantnih indeksa.
- **P3** - ograničena neefikasnost na sporednim putanjama, umeren bloat, manja redundantnost.
- **P4** - hardening: priprema za rast, čišćenje, praćenje korišćenja indeksa.

Većina nalaza o indeksima je P2-P4. P1 koristi samo uz dokaz stvarnog uticaja na production ili ugrožene invarijante.

## 66. OUTPUT

`DATABASE_INDEX_AUDIT.md`

## 67. SECOND PASS

Za svaku tabelu sa velikim volumenom i svaku preporučenu izmenu:

- ponovo mapiraj glavne query-je i potvrdi da je svaka preporuka vezana za neki od njih
- pokušaj da dokažeš da predloženi indeks nije potreban: da li postoji indeks sa ekvivalentnim planom? da li bi prepravka query-ja, dodavanje LIMIT-a ili rešavanje N+1 uklonili potrebu?
- pokušaj da dokažeš da je preporuka za brisanje pogrešna: replike, retki poslovi, constraint-i, reset statistike
- uporedi planove sa i bez kandidata na podacima sličnim production-u, uključujući najveći tenant
- ponovo izračunaj write amplification pri vršnom broju upisa
- ponovo proveri bezbednost build-a za trenutnu veličinu tabele i brzinu rasta
- potvrdi rollback putanju za svaku izmenu

## 68. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da:

- su engine i verzija utvrđeni, a tvrdnje specifične za engine proverene za tu verziju
- svaki nalaz o indeksu koji nedostaje navodi stvaran query, njegovu učestalost i trenutni plan
- svaka preporuka za brisanje navodi dokaz o korišćenju, period posmatranja, replike i proveru constraint-a
- je redosled kolona u composite indeksu opravdan equality/range/sort analizom stvarnih query-ja
- je trošak upisa, storage-a i memorije naveden pored svake koristi za čitanje
- su uniqueness i multi-tenant scoping provereni za svaki unique indeks
- je obrađena bezbednost build-a i uklanjanja (lock-ovi, trajanje, disk, WAL, replike, timeout-i) za velike tabele
- su statusi i evidence tier-ovi dosledno primenjeni i nijedna stavka tier D/E nije predstavljena kao potvrđena
- izveštaj sadrži mali, prioritizovan skup izmena, a ne listu svih kolona koje mogu da se indeksiraju

# KONAČNO PRAVILO

Tražim:

```text
table orders:
indexes:
(status)
(created_at)
(tenant_id)

query:
WHERE tenant_id = ?
AND status = 'OPEN'
ORDER BY created_at DESC
LIMIT 100

↓
planner combines/filters large sets
↓
high tenant volume causes sort

candidate:
(tenant_id, status, created_at DESC)

↓
benchmark demonstrates lower reads and latency
```

Ne želim nasumično dodavanje indexes.

Drugi failure chain-ovi koje tražim:

```text
index on (email) is reported "unused"
↓
usage statistics were reset by a failover 3 days ago
↓
index is dropped
↓
monthly login-audit job runs a full scan on 400M rows
↓
job overloads the primary during business hours
```

```text
new index added on orders(status)
↓
status changes on every order update
↓
engine can no longer apply its "no index change" update optimization
↓
write latency and WAL volume grow on the busiest table
↓
replicas fall behind; read-after-write paths return stale data
```

```text
CREATE UNIQUE INDEX in release migration
↓
production already contains 12 duplicate rows
↓
build fails after 40 minutes
↓
invalid index remains and still slows writes
↓
deployment is blocked until data is repaired
```
