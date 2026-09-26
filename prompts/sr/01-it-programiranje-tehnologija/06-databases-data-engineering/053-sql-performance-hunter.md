---
id: UPL-IT-053
number: 53
slug: sql-performance-hunter
title: SQL Performance Hunter
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# SQL PERFORMANCE HUNTER

Želim duboku analizu SQL performance bottleneck-a zasnovanu na stvarnim query-jima, execution plan-ovima i production workload-u.

Glavni cilj:

> Pronaći queries koji degradiraju nelinearno sa rastom podataka ili concurrency-ja i dokazati zašto kroz plan, row estimates, I/O, sorting, locking ili repeated execution.

## 1. OBJECTIVE AND NON-GOALS

Pronađi query-je koji troše najviše kapaciteta baze ili probijaju ciljeve latencije, dokaži zašto pomoću planova i podataka o workload-u i predloži izmene čija je korist izmerena, a ne pretpostavljena.

Van obima:

- prepravljanje svakog query-ja koji "bi mogao biti brži"
- preporuka indeksa, cache-a, replika, particionisanja ili sharding-a bez izmerenog problema sa query-jem iza njih
- redizajn šeme (pomeni ga samo kada nijedna izmena query-ja ili indeksa ne može da reši trošak)
- podešavanje database servera odvojeno od workload-a

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
Engine and exact version:
Workload data available (statement statistics, slow log, APM traces) and its time window:
Largest tables and their growth:
Data distribution (largest tenant vs median tenant):
Peak concurrency and connection pool configuration:
Replicas and which queries run on them:
Safe environment for EXPLAIN ANALYZE and benchmarks (production-sized copy?):
```

Ponašanje optimizer-a (algoritmi join-a, materijalizacija CTE-a, keširanje planova, osetljivost na parametre) zavisi od engine-a i verzije. Navedi verziju pre opisa ponašanja optimizer-a.

## 3. PERFORMANCE EVIDENCE HIERARCHY

Daj prednost jačim dokazima i svaki nalaz označi tier-om:

```text
A - production statistics: statement statistics, slow logs or APM traces with frequency, total time and rows
B - representative benchmark: EXPLAIN ANALYZE or load test on production-sized, production-shaped data
C - execution plan: EXPLAIN (estimates) on realistic statistics, without measured runtime
D - static suspicion: the query text or code pattern suggests a problem; no plan or measurement yet
E - hardening: preventive improvement for expected growth
```

Tier D je hipoteza koju treba proveriti, a ne nalaz koji treba ispraviti. Nikada ne pokreći EXPLAIN ANALYZE nad naredbama upisa na production-u.

## 4. FINDING STATUS

- **CONFIRMED** - izmeren problem troška ili latencije (tier A ili B).
- **LIKELY** - plan pokazuje problem, vreme izvršavanja nije izmereno (tier C).
- **NOT VERIFIED** - statička sumnja ili nedostaju podaci o workload-u (tier D).
- **NOT APPLICABLE** - tabela je mala ili je query dovoljno redak da trošak nije bitan.
- **CONTROLLED** - problem postoji, ali je ograničen (keširan rezultat, async posao, izvršavanje van vršnog perioda).
- **HARDENING** - poboljšanje za očekivani rast bez trenutnog problema (P4).

Nemoj predstaviti potencijalnu neefikasnost kao ispad production-a; navedi izmeren ili procenjen uticaj.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Sequential scan nije automatski loš: često je najbolji plan za male tabele ili predikate niske selektivnosti.
- Spor query u razvojnoj bazi sa nerealnim podacima nije dokaz o production-u.
- Visoka latencija query-ja zbog čekanja na konekciju iz pool-a ili na lock nije problem plana; klasifikuj je ispravno.
- Jedno sporo izvršavanje nije obrazac; posmatraj raspodelu i ukupno vreme.
- Query bez indeksa na koloni iz WHERE klauzule nije nalaz osim ako je dovoljno čest ili skup da bi bio bitan.
- CTE-ovi, subquery-ji, DISTINCT ili window funkcije nisu automatski spori; ocenjuj stvarni plan.

## 6. QUERY INVENTORY

Prioritet:

- highest total time
- highest mean/p95
- most frequent
- most rows scanned
- largest temp/sort
- lock-heavy

## 7. PRODUCTION EVIDENCE

Preferiraj:

- slow query log
- pg_stat_statements
- performance schema
- APM

pre theoretical guesses.

## 8. QUERY FINGERPRINT

Group parameterized variants.

## 9. TOTAL COST

A 5 ms query × 1M calls može biti važnija od 5 s query × 1 call/day.

## 10. QUERY COST DIMENSIONS

Latencija je samo jedna dimenzija. Za svaki važan fingerprint zabeleži:

```text
Calls per second:
Total database time (calls × mean time):
Mean / p95 / p99 latency:
Rows scanned vs rows returned:
Buffer hits vs physical reads:
Temporary spills (sort, hash):
Lock wait time:
Network payload (bytes returned):
Connection wait time in the application:
```

Rangiraj nalaze po ukupnom vremenu u bazi i po uticaju na kritične korisničke putanje, a ne po najsporijem pojedinačnom izvršavanju.

## 11. EXPLAIN

Koristi safe EXPLAIN.

`EXPLAIN ANALYZE` može izvršiti query, zato ne radi destructive writes nad production-om.

## 12. SEQ SCAN

Nije automatski problem.

## 13. ROW ESTIMATE

Actual vs estimated.

## 14. STALE STATISTICS

Can lead to wrong plan.

## 15. PLAN INSTABILITY

Query koji je uglavnom brz, a ponekad veoma spor, obično ima nestabilan plan. Traži:

- zastarelu ili nedovoljnu statistiku posle bulk učitavanja ili naglog rasta
- data skew: isti oblik query-ja je brz za male tenant-e, a spor za najveći
- osetljivost na parametre: keširan ili generički plan izabran za jednu vrednost parametra ponovo se koristi za veoma drugačiju
- korelisane kolone čiju zajedničku selektivnost optimizer pogrešno procenjuje
- planove koji se menjaju posle upgrade-a verzije, izmene indeksa ili osvežavanja statistike

Uporedi planove za najgore parametre (najveći tenant, najširi opseg datuma), a ne samo za tipičan slučaj.

## 16. FILTER SELECTIVITY

## 17. JOIN ORDER

## 18. JOIN TYPE

Nested loop/hash/merge prema engine-u.

## 19. LARGE NESTED LOOP

High-signal when inner side large/repeated.

## 20. SORT

Memory/temp disk.

## 21. GROUP BY

Aggregation over huge dataset.

## 22. DISTINCT

Often used to hide join duplication.

## 23. OR

Can prevent index use depending on engine.

## 24. FUNCTION ON INDEXED COLUMN

May make predicate non-sargable.

## 25. CAST

Implicit cast can defeat index.

## 26. LEADING WILDCARD

```text
LIKE '%term'
```

## 27. LOWER/UPPER

Functional index or normalized strategy if needed.

## 28. DATE FUNCTION

Filtering transformed timestamp.

## 29. CALCULATION

Column arithmetic.

## 30. `NOT IN`

NULL semantics + performance.

## 31. EXISTS

May be better depending on plan, no blanket rewrite.

## 32. SUBQUERY

Correlated repeated execution.

## 33. CTE

Optimization semantics depend on DB/version.

## 34. WINDOW FUNCTION

Can be expensive but appropriate.

## 35. PAGINATION

Huge OFFSET.

## 36. COUNT

Exact count on large table.

## 37. DASHBOARD COUNT

Maybe approximate/cache if business permits.

## 38. SEARCH

Full-text vs `%like%`.

## 39. JSON FILTER

Index strategy.

## 40. ARRAY

## 41. ORDER BY + LIMIT

Excellent index candidate.

## 42. MULTI-TENANT

Index usually begins/includes tenant key depending on query.

## 43. JOIN FK INDEX

Missing child FK index can hurt joins/deletes.

## 44. N+1

Capture at request level.

## 45. LOOP QUERY

100 rows -> 101 queries.

## 46. DUPLICATE QUERY

Same query repeatedly within request.

## 47. OVERFETCH

Fetching columns/relations not used.

## 48. LARGE RESULT SET

Network + serialization.

## 49. BATCH SIZE

Huge `IN (...)`.

## 50. TEMP TABLE

May help or hurt.

## 51. BULK INSERT

Multi-row/COPY equivalent.

## 52. ROW-BY-ROW UPDATE

## 53. UPSERT

Index/locking.

## 54. CONTENTION

Fast single query can be slow under locks.

## 55. HOT ROW

Global counter.

## 56. HOT INDEX

Sequential insert edge cases depending on DB.

## 57. CONNECTION WAIT

Query latency includes pool waiting.

## 58. TRANSACTION DURATION

External API inside transaction.

## 59. IDLE IN TRANSACTION

High-risk.

## 60. LOCK WAIT

## 61. DEADLOCK

## 62. VACUUM/BLOAT

Postgres-like.

## 63. TABLE STATS

## 64. TEMP SPILL

Sort/hash beyond memory.

## 65. DB MEMORY

Do not globally raise work memory without concurrency impact analysis.

## 66. CACHE HIT

DB buffer cache.

## 67. OS PAGE CACHE

## 68. READ REPLICA

Offload read only if consistency permits.

## 69. APPLICATION CACHE

Don't cache around fundamental bad query blindly.

## 70. QUERY CACHE INVALIDATION

## 71. MATERIALIZED VIEW

For expensive stable aggregations.

## 72. PRECOMPUTE

If business allows.

## 73. DENORMALIZE

Last-mile optimization only with consistency model.

## 74. PARTITIONING

Only for concrete pruning/maintenance problem.

## 75. SHARDING

Not a query optimization default.

## 76. PARAMETER SNIFFING / PLAN CACHE

Engine specific.

## 77. DATA SKEW

Tenant A huge, others small.

## 78. WORST TENANT

Benchmark with realistic large tenant.

## 79. REALISTIC DATA

Synthetic 100 rows hides performance cliffs.

## 80. LOAD

Query may be fine alone but fail at 100 concurrency.

## 81. CONCURRENCY MATH

Query koji izgleda u redu kada se izvršava sam može da zasiti bazu pod opterećenjem:

```text
20 ms per execution × 500 concurrent requests
= 10 seconds of database work requested at once
with a pool of 50 connections: 450 requests wait for a connection
```

Za svaki kritičan query proceni vršni broj izvršavanja u sekundi, konekcije i CPU koje zauzima i da li contention za lock ili I/O raste sa konkurentnošću. Proveri load testom gde je moguće.

## 82. CONNECTION POOL

## 83. DB CPU

## 84. IOPS

## 85. STORAGE LATENCY

## 86. NETWORK REGION

## 87. FIX VERIFICATION

Nijedan nalaz se ne zatvara bez:

```text
before plan
after plan
before latency (mean, p95) and total time
after latency (mean, p95) and total time
rows scanned before / after
write-cost regression, if an index was added (insert/update latency, WAL volume)
results equivalence (the rewritten query returns the same rows)
```

Meri na podacima veličine production-a, sa najgorim parametrima.

## 88. QUERY COST MATRIX

| Fingerprint | Calls/sec | Total time share | p95 | Rows scanned/returned | Spills | Lock wait | Worst-tenant behavior | Evidence tier | Status |
|---|---:|---:|---:|---|---|---:|---|---|---|

## 89. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (query fingerprint, tables):
Call site / trigger:
Frequency and total time:
Current behavior (plan, rows scanned/returned, spills, waits):
Scale behavior (1x / 10x / 100x, worst tenant):
Failure path (how the cost becomes timeouts, pool exhaustion or saturation):
Impact:
Blast radius:
Evidence:
Root cause:
Proposed change:
Expected effect (with method of estimation):
Benchmark (before / after):
Write-cost or regression risk:
Verification:
```

## 90. SEVERITY

- **P0** - obrazac query-ja koji može da obori bazu ili celu aplikaciju (na primer neograničen query koji bilo koji klijent može da pokrene).
- **P1** - dokazan pad performansi na kritičnoj putanji: timeout-i, iscrpljen pool ili zasićenje pri trenutnom ili skorom opterećenju.
- **P2** - značajna latencija ili veliki udeo u ukupnom vremenu baze na važnim putanjama.
- **P3** - neefikasnost na sporednim putanjama sa ograničenim uticajem.
- **P4** - hardening za očekivani rast, vidljivost, održavanje.

## 91. OUTPUT

`SQL_PERFORMANCE_HUNTER.md`

## 92. SECOND PASS

Izvrši benchmark kritičnih query-ja pri:

```text
1x
10x
100x realistic row counts
```

uz reprezentativno konkurentno opterećenje, i dodatno:

- pokreni najgore parametre (najveći tenant, najširi opseg, najdublja strana)
- proveri da li je problem u planu, u čekanju na lock ili u čekanju na pool
- traži promene plana posle osvežavanja statistike
- pokušaj da opovrgneš svaki nalaz: da li je query zaista čest? da li bi jeftinija ispravka (LIMIT, uklanjanje nekorišćene kolone, rešavanje N+1 pozivaoca) uklonila potrebu za indeksom ili prepravkom?

## 93. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da se nalazi zasnivaju na:

- stvarnom production workload-u (ili su jasno označeni kada on nije dostupan)
- planovima query-ja za stvarnu verziju engine-a
- učestalosti izvršavanja i ukupnom vremenu u bazi
- broju skeniranih u odnosu na vraćene redove
- metrikama čekanja na lock i na pool, odvojenim od problema plana
- konfiguraciji indeksa i njihovom trošku upisa
- profilima data skew-a i najvećem tenant-u
- efikasnosti paginacije
- detekciji N+1 na nivou zahteva
- veličini vraćenog rezultata
- realnim podacima i konkurentnosti za benchmark
- merenjima pre / posle za svaku predloženu ispravku

i da su statusi i evidence tier-ovi dosledno primenjeni, bez ijedne stavke tier D predstavljene kao potvrđene.

# KONAČNO PRAVILO

Ne želim:

> Dodaj index jer query koristi WHERE.

Tražim:

```text
dashboard query:
WHERE tenant_id = ?
ORDER BY created_at DESC
LIMIT 50

current index:
(created_at)

↓
planner scans newest rows across all tenants
↓
filters most rows out

↓
large tenant count increases latency sharply

fix candidate:
(tenant_id, created_at DESC)
```

Drugi failure chain-ovi koje tražim:

```text
report query uses a cached generic plan
↓
plan was chosen when the first caller was a small tenant (nested loop, index lookups)
↓
largest tenant calls it with 2M matching rows
↓
nested loop runs millions of index lookups
↓
query takes minutes, holds a connection, and the dashboard times out only for the biggest customer
```

```text
list endpoint uses OFFSET pagination
↓
crawler requests page 20,000
↓
database reads and discards 1M rows per request
↓
several concurrent deep-page requests saturate I/O
↓
all queries on the table slow down
```
