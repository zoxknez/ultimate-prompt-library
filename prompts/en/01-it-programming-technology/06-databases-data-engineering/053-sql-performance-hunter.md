---
id: UPL-IT-053
number: 53
slug: sql-performance-hunter
title: SQL Performance Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# SQL PERFORMANCE HUNTER

I want a deep analysis of SQL performance bottlenecks based on actual queries, execution plans, and production workloads.

Main objective:

> Identify queries that degrade non-linearly with data growth or concurrency, and prove why through execution plans, row estimates, I/O profiles, sorting overhead, lock contention, or repeated execution patterns.

## 1. QUERY INVENTORY

Prioritize:

- highest cumulative execution time
- highest mean and p95 latencies
- highest execution frequency
- most rows scanned
- largest temporary disk sort spills
- heavy lock contention

## 2. PRODUCTION EVIDENCE

Prefer empirical data:

- slow query logs
- pg_stat_statements
- MySQL performance_schema
- APM tracing

over theoretical guesswork.

## 3. QUERY FINGERPRINT

Group queries by parameterized fingerprints.

## 4. TOTAL COST

A 5 ms query executed 1M times can be vastly more critical than a 5 s query executed once daily.

## 5. EXPLAIN

Employ safe EXPLAIN commands.

`EXPLAIN ANALYZE` executes the underlying statement; never run destructive write operations against production databases.

## 6. SEQ SCAN

Sequential table scans are not inherently an anti-pattern on small datasets.

## 7. ROW ESTIMATE

Compare estimated vs actual row counts.

## 8. STALE STATISTICS

Outdated optimizer statistics driving suboptimal execution plans.

## 9. FILTER SELECTIVITY

Predicate selectivity evaluation.

## 10. JOIN ORDER

Optimizer join order decisions.

## 11. JOIN TYPE

Nested loops, hash joins, or merge joins depending on engine capabilities.

## 12. LARGE NESTED LOOP

High-signal bottleneck when inner iterations scan large or unindexed tables repeatedly.

## 13. SORT

In-memory vs temporary disk spill sorting.

## 14. GROUP BY

Aggregations computed over enormous datasets.

## 15. DISTINCT

Frequently misused to conceal duplicate rows produced by improper joins.

## 16. OR

Can prevent index utilization depending on optimizer capabilities.

## 17. FUNCTION ON INDEXED COLUMN

Renders predicates non-sargable.

## 18. CAST

Implicit type casting defeating index lookups.

## 19. LEADING WILDCARD

```text
LIKE '%term'
```

## 20. LOWER/UPPER

Deploy functional indexes or normalized storage strategies where appropriate.

## 21. DATE FUNCTION

Filtering against transformed timestamp columns.

## 22. CALCULATION

Column-side arithmetic breaking index usage.

## 23. `NOT IN`

NULL handling semantics and associated performance pitfalls.

## 24. EXISTS

May yield superior execution plans, but avoid blind query rewrites.

## 25. SUBQUERY

Correlated subqueries executing repeatedly per outer row.

## 26. CTE

Optimization fencing and materialization semantics vary by database engine and version.

## 27. WINDOW FUNCTION

Computationally expensive but functionally appropriate.

## 28. PAGINATION

Massive OFFSET values scanning and discarding vast row volumes.

## 29. COUNT

Exact row counts executed against massive tables.

## 30. DASHBOARD COUNT

Use approximate counts or cached summaries where business requirements permit.

## 31. SEARCH

Full-text search engines vs wildcard `%like%` scans.

## 32. JSON FILTER

Index strategies for semi-structured JSON querying.

## 33. ARRAY

Array containment querying strategies.

## 34. ORDER BY + LIMIT

Prime candidates for composite index optimization.

## 35. MULTI-TENANT

Indexes typically must lead with or incorporate the tenant identifier based on query shapes.

## 36. JOIN FK INDEX

Missing foreign key indexes on child tables impairing joins and cascades.

## 37. N+1

Detect N+1 patterns at the HTTP request or transaction level.

## 38. LOOP QUERY

Iterating over 100 rows resulting in 101 distinct queries.

## 39. DUPLICATE QUERY

Identical queries dispatched repeatedly within a single request cycle.

## 40. OVERFETCH

Retrieving columns or relationships never consumed by the caller.

## 41. LARGE RESULT SET

Network saturation and serialization overhead.

## 42. BATCH SIZE

Excessively massive `IN (...)` parameter lists.

## 43. TEMP TABLE

Temporary tables can alleviate or aggravate memory pressure.

## 44. BULK INSERT

Multi-row insert or streaming COPY operations.

## 45. ROW-BY-ROW UPDATE

Single-row update iterations.

## 46. UPSERT

Concurrency locking and index overhead during upsert operations.

## 47. CONTENTION

Queries that execute rapidly in isolation collapsing under lock contention.

## 48. HOT ROW

Contended global counters or ledger rows.

## 49. HOT INDEX

Sequential insert contention on rightmost index pages.

## 50. CONNECTION WAIT

Reported query latency inflated by connection pool acquisition wait times.

## 51. TRANSACTION DURATION

Outbound external HTTP calls held within open database transactions.

## 52. IDLE IN TRANSACTION

High-risk condition holding locks and preventing vacuum operations.

## 53. LOCK WAIT

Lock acquisition wait monitoring.

## 54. DEADLOCK

Deadlock analysis.

## 55. VACUUM/BLOAT

PostgreSQL table and index bloat.

## 56. TABLE STATS

Table-level statistics health.

## 57. TEMP SPILL

Sort and hash operations spilling to temporary disk storage.

## 58. DB MEMORY

Do not globally increase working memory without modeling concurrency impact.

## 59. CACHE HIT

Database buffer cache hit ratio.

## 60. OS PAGE CACHE

Operating system filesystem cache efficiency.

## 61. READ REPLICA

Offload reads only when replication lag and consistency requirements permit.

## 62. APPLICATION CACHE

Do not blindly introduce application caching around fundamentally broken SQL queries.

## 63. QUERY CACHE INVALIDATION

Cache invalidation complexity.

## 64. MATERIALIZED VIEW

Deploy for heavy, relatively stable aggregations.

## 65. PRECOMPUTE

Precompute asynchronous summaries if business rules allow.

## 66. DENORMALIZE

Last-mile optimization requiring strict consistency management.

## 67. PARTITIONING

Deploy only to resolve tangible partition pruning or maintenance challenges.

## 68. SHARDING

Never recommend sharding as the primary answer to query performance issues.

## 69. PARAMETER SNIFFING / PLAN CACHE

Engine-specific plan caching and parameter sniffing behaviors.

## 70. DATA SKEW

Tenant A holding massive data volumes while others remain small.

## 71. WORST TENANT

Benchmark against realistic, heavy-tenant data distributions.

## 72. REALISTIC DATA

Synthetic datasets of 100 rows mask production performance cliffs.

## 73. LOAD

A query performing well in isolation failing at 100 concurrent requests.

## 74. CONNECTION POOL

Connection pool tuning.

## 75. DB CPU

CPU resource saturation.

## 76. IOPS

Storage IOPS exhaustion.

## 77. STORAGE LATENCY

Disk read and write latency.

## 78. NETWORK REGION

Cross-region latency between compute nodes and database servers.

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

alongside representative concurrency loads.

## 82. FINAL QUALITY GATE

- real production workload
- query plans
- execution frequency
- row counts
- lock wait metrics
- index configurations
- data skew profiles
- pagination efficiency
- N+1 detection
- result payload size
- pool wait times
- realistic benchmarking data

# FINAL RULE

Looking for:

> Do not blindly advise adding indexes simply because a query features a WHERE clause.

Looking for issues such as:

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
