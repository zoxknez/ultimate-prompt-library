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
version: 1.0.0
status: stable
---

# SQL PERFORMANCE HUNTER

Želim duboku analizu SQL performance bottleneck-a zasnovanu na stvarnim query-jima, execution plan-ovima i production workload-u.

Glavni cilj:

> Pronaći queries koji degradiraju nelinearno sa rastom podataka ili concurrency-ja i dokazati zašto kroz plan, row estimates, I/O, sorting, locking ili repeated execution.

## 1. QUERY INVENTORY

Prioritet:

- highest total time
- highest mean/p95
- most frequent
- most rows scanned
- largest temp/sort
- lock-heavy

## 2. PRODUCTION EVIDENCE

Preferiraj:

- slow query log
- pg_stat_statements
- performance schema
- APM

pre theoretical guesses.

## 3. QUERY FINGERPRINT

Group parameterized variants.

## 4. TOTAL COST

A 5 ms query × 1M calls može biti važnija od 5 s query × 1 call/day.

## 5. EXPLAIN

Koristi safe EXPLAIN.

`EXPLAIN ANALYZE` može izvršiti query, zato ne radi destructive writes nad production-om.

## 6. SEQ SCAN

Nije automatski problem.

## 7. ROW ESTIMATE

Actual vs estimated.

## 8. STALE STATISTICS

Can lead to wrong plan.

## 9. FILTER SELECTIVITY

## 10. JOIN ORDER

## 11. JOIN TYPE

Nested loop/hash/merge prema engine-u.

## 12. LARGE NESTED LOOP

High-signal when inner side large/repeated.

## 13. SORT

Memory/temp disk.

## 14. GROUP BY

Aggregation over huge dataset.

## 15. DISTINCT

Often used to hide join duplication.

## 16. OR

Can prevent index use depending on engine.

## 17. FUNCTION ON INDEXED COLUMN

May make predicate non-sargable.

## 18. CAST

Implicit cast can defeat index.

## 19. LEADING WILDCARD

```text
LIKE '%term'
```

## 20. LOWER/UPPER

Functional index or normalized strategy if needed.

## 21. DATE FUNCTION

Filtering transformed timestamp.

## 22. CALCULATION

Column arithmetic.

## 23. `NOT IN`

NULL semantics + performance.

## 24. EXISTS

May be better depending on plan, no blanket rewrite.

## 25. SUBQUERY

Correlated repeated execution.

## 26. CTE

Optimization semantics depend on DB/version.

## 27. WINDOW FUNCTION

Can be expensive but appropriate.

## 28. PAGINATION

Huge OFFSET.

## 29. COUNT

Exact count on large table.

## 30. DASHBOARD COUNT

Maybe approximate/cache if business permits.

## 31. SEARCH

Full-text vs `%like%`.

## 32. JSON FILTER

Index strategy.

## 33. ARRAY

## 34. ORDER BY + LIMIT

Excellent index candidate.

## 35. MULTI-TENANT

Index usually begins/includes tenant key depending on query.

## 36. JOIN FK INDEX

Missing child FK index can hurt joins/deletes.

## 37. N+1

Capture at request level.

## 38. LOOP QUERY

100 rows -> 101 queries.

## 39. DUPLICATE QUERY

Same query repeatedly within request.

## 40. OVERFETCH

Fetching columns/relations not used.

## 41. LARGE RESULT SET

Network + serialization.

## 42. BATCH SIZE

Huge `IN (...)`.

## 43. TEMP TABLE

May help or hurt.

## 44. BULK INSERT

Multi-row/COPY equivalent.

## 45. ROW-BY-ROW UPDATE

## 46. UPSERT

Index/locking.

## 47. CONTENTION

Fast single query can be slow under locks.

## 48. HOT ROW

Global counter.

## 49. HOT INDEX

Sequential insert edge cases depending on DB.

## 50. CONNECTION WAIT

Query latency includes pool waiting.

## 51. TRANSACTION DURATION

External API inside transaction.

## 52. IDLE IN TRANSACTION

High-risk.

## 53. LOCK WAIT

## 54. DEADLOCK

## 55. VACUUM/BLOAT

Postgres-like.

## 56. TABLE STATS

## 57. TEMP SPILL

Sort/hash beyond memory.

## 58. DB MEMORY

Do not globally raise work memory without concurrency impact analysis.

## 59. CACHE HIT

DB buffer cache.

## 60. OS PAGE CACHE

## 61. READ REPLICA

Offload read only if consistency permits.

## 62. APPLICATION CACHE

Don't cache around fundamental bad query blindly.

## 63. QUERY CACHE INVALIDATION

## 64. MATERIALIZED VIEW

For expensive stable aggregations.

## 65. PRECOMPUTE

If business allows.

## 66. DENORMALIZE

Last-mile optimization only with consistency model.

## 67. PARTITIONING

Only for concrete pruning/maintenance problem.

## 68. SHARDING

Not a query optimization default.

## 69. PARAMETER SNIFFING / PLAN CACHE

Engine specific.

## 70. DATA SKEW

Tenant A huge, others small.

## 71. WORST TENANT

Benchmark with realistic large tenant.

## 72. REALISTIC DATA

Synthetic 100 rows hides performance cliffs.

## 73. LOAD

Query may be fine alone but fail at 100 concurrency.

## 74. CONNECTION POOL

## 75. DB CPU

## 76. IOPS

## 77. STORAGE LATENCY

## 78. NETWORK REGION

## 79. FINDING FORMAT

```text
ID:
Severity:
Query fingerprint:
Call site:
Frequency:
Rows:
Plan:
Observed latency:
Scale behavior:
Root cause:
Evidence:
Proposed change:
Expected effect:
Regression risk:
Benchmark:
```

## 80. OUTPUT

`SQL_PERFORMANCE_HUNTER.md`

## 81. SECOND PASS

Benchmark critical queries at:

```text
1x
10x
100x realistic row counts
```

plus representative concurrency.

## 82. FINAL QUALITY GATE

- actual workload
- plans
- frequency
- row counts
- lock waits
- indexes
- data skew
- pagination
- N+1
- result size
- pool wait
- realistic benchmark

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
