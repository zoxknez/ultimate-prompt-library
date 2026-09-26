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
version: 1.1.0
status: stable
---

# SQL PERFORMANCE HUNTER

I want a deep analysis of SQL performance bottlenecks based on actual queries, execution plans, and production workloads.

Main objective:

> Identify queries that degrade non-linearly with data growth or concurrency, and prove why through execution plans, row estimates, I/O profiles, sorting overhead, lock contention, or repeated execution patterns.

## 1. OBJECTIVE AND NON-GOALS

Find the queries that consume the most database capacity or break latency targets, prove why with plans and workload data, and propose changes whose benefit is measured, not assumed.

Non-goals:

- rewriting every query that "could be faster"
- recommending indexes, caching, replicas, partitioning or sharding without a measured query problem behind them
- schema redesign (mention it only when no query or index change can fix the cost)
- database server tuning in isolation from the workload

## 2. CONTEXT DISCOVERY

Establish first:

```text
Engine and exact version:
Workload data available (statement statistics, slow log, APM traces) and its time window:
Largest tables and their growth:
Data distribution (largest tenant vs median tenant):
Peak concurrency and connection pool configuration:
Replicas and which queries run on them:
Safe environment for EXPLAIN ANALYZE and benchmarks (production-sized copy?):
```

Optimizer behavior (join algorithms, CTE materialization, plan caching, parameter sensitivity) is engine- and version-specific. State the version before describing optimizer behavior.

## 3. PERFORMANCE EVIDENCE HIERARCHY

Prefer stronger evidence and label every finding with its tier:

```text
A - production statistics: statement statistics, slow logs or APM traces with frequency, total time and rows
B - representative benchmark: EXPLAIN ANALYZE or load test on production-sized, production-shaped data
C - execution plan: EXPLAIN (estimates) on realistic statistics, without measured runtime
D - static suspicion: the query text or code pattern suggests a problem; no plan or measurement yet
E - hardening: preventive improvement for expected growth
```

Tier D is a hypothesis to verify, not a finding to fix. Never run EXPLAIN ANALYZE on write statements against production.

## 4. FINDING STATUS

- **CONFIRMED** - measured cost or latency problem (tier A or B).
- **LIKELY** - the plan shows the problem, runtime not measured (tier C).
- **NOT VERIFIED** - static suspicion or missing workload data (tier D).
- **NOT APPLICABLE** - the table is small or the query rare enough that the cost does not matter.
- **CONTROLLED** - the problem exists but is bounded (cached result, async job, off-peak schedule).
- **HARDENING** - improvement for expected growth without a current problem (P4).

Do not present a potential inefficiency as a production outage; state the measured or estimated impact.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A sequential scan is not automatically bad: it is often the best plan for small tables or low-selectivity predicates.
- A slow query in a development database with unrealistic data is not evidence about production.
- High query latency caused by waiting for a pool connection or a lock is not a plan problem; classify it correctly.
- A single slow execution is not a pattern; look at the distribution and the total time.
- A query without an index on its WHERE column is not a finding unless it is frequent or expensive enough to matter.
- CTEs, subqueries, DISTINCT or window functions are not automatically slow; judge the actual plan.

## 6. QUERY INVENTORY

Prioritize:

- highest cumulative execution time
- highest mean and p95 latencies
- highest execution frequency
- most rows scanned
- largest temporary disk sort spills
- heavy lock contention

## 7. PRODUCTION EVIDENCE

Prefer empirical data:

- slow query logs
- pg_stat_statements
- MySQL performance_schema
- APM tracing

over theoretical guesswork.

## 8. QUERY FINGERPRINT

Group queries by parameterized fingerprints.

## 9. TOTAL COST

A 5 ms query executed 1M times can be vastly more critical than a 5 s query executed once daily.

## 10. QUERY COST DIMENSIONS

Latency is only one dimension. For each important fingerprint record:

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

Rank findings by total database time and by impact on critical user paths, not by the slowest single execution.

## 11. EXPLAIN

Employ safe EXPLAIN commands.

`EXPLAIN ANALYZE` executes the underlying statement; never run destructive write operations against production databases.

## 12. SEQ SCAN

Sequential table scans are not inherently an anti-pattern on small datasets.

## 13. ROW ESTIMATE

Compare estimated vs actual row counts.

## 14. STALE STATISTICS

Outdated optimizer statistics driving suboptimal execution plans.

## 15. PLAN INSTABILITY

A query that is fast most of the time and sometimes very slow usually has an unstable plan. Look for:

- outdated or insufficient statistics after bulk loads or rapid growth
- data skew: the same query shape is fast for small tenants and slow for the largest one
- parameter sensitivity: a cached or generic plan chosen for one parameter value is reused for a very different one
- correlated columns whose combined selectivity the optimizer misestimates
- plans that change after a version upgrade, index change or statistics refresh

Compare plans for the worst-case parameters (largest tenant, widest date range), not only for the typical case.

## 16. FILTER SELECTIVITY

Predicate selectivity evaluation.

## 17. JOIN ORDER

Optimizer join order decisions.

## 18. JOIN TYPE

Nested loops, hash joins, or merge joins depending on engine capabilities.

## 19. LARGE NESTED LOOP

High-signal bottleneck when inner iterations scan large or unindexed tables repeatedly.

## 20. SORT

In-memory vs temporary disk spill sorting.

## 21. GROUP BY

Aggregations computed over enormous datasets.

## 22. DISTINCT

Frequently misused to conceal duplicate rows produced by improper joins.

## 23. OR

Can prevent index utilization depending on optimizer capabilities.

## 24. FUNCTION ON INDEXED COLUMN

Renders predicates non-sargable.

## 25. CAST

Implicit type casting defeating index lookups.

## 26. LEADING WILDCARD

```text
LIKE '%term'
```

## 27. LOWER/UPPER

Deploy functional indexes or normalized storage strategies where appropriate.

## 28. DATE FUNCTION

Filtering against transformed timestamp columns.

## 29. CALCULATION

Column-side arithmetic breaking index usage.

## 30. `NOT IN`

NULL handling semantics and associated performance pitfalls.

## 31. EXISTS

May yield superior execution plans, but avoid blind query rewrites.

## 32. SUBQUERY

Correlated subqueries executing repeatedly per outer row.

## 33. CTE

Optimization fencing and materialization semantics vary by database engine and version.

## 34. WINDOW FUNCTION

Computationally expensive but functionally appropriate.

## 35. PAGINATION

Massive OFFSET values scanning and discarding vast row volumes.

## 36. COUNT

Exact row counts executed against massive tables.

## 37. DASHBOARD COUNT

Use approximate counts or cached summaries where business requirements permit.

## 38. SEARCH

Full-text search engines vs wildcard `%like%` scans.

## 39. JSON FILTER

Index strategies for semi-structured JSON querying.

## 40. ARRAY

Array containment querying strategies.

## 41. ORDER BY + LIMIT

Prime candidates for composite index optimization.

## 42. MULTI-TENANT

Indexes typically must lead with or incorporate the tenant identifier based on query shapes.

## 43. JOIN FK INDEX

Missing foreign key indexes on child tables impairing joins and cascades.

## 44. N+1

Detect N+1 patterns at the HTTP request or transaction level.

## 45. LOOP QUERY

Iterating over 100 rows resulting in 101 distinct queries.

## 46. DUPLICATE QUERY

Identical queries dispatched repeatedly within a single request cycle.

## 47. OVERFETCH

Retrieving columns or relationships never consumed by the caller.

## 48. LARGE RESULT SET

Network saturation and serialization overhead.

## 49. BATCH SIZE

Excessively massive `IN (...)` parameter lists.

## 50. TEMP TABLE

Temporary tables can alleviate or aggravate memory pressure.

## 51. BULK INSERT

Multi-row insert or streaming COPY operations.

## 52. ROW-BY-ROW UPDATE

Single-row update iterations.

## 53. UPSERT

Concurrency locking and index overhead during upsert operations.

## 54. CONTENTION

Queries that execute rapidly in isolation collapsing under lock contention.

## 55. HOT ROW

Contended global counters or ledger rows.

## 56. HOT INDEX

Sequential insert contention on rightmost index pages.

## 57. CONNECTION WAIT

Reported query latency inflated by connection pool acquisition wait times.

## 58. TRANSACTION DURATION

Outbound external HTTP calls held within open database transactions.

## 59. IDLE IN TRANSACTION

High-risk condition holding locks and preventing vacuum operations.

## 60. LOCK WAIT

Lock acquisition wait monitoring.

## 61. DEADLOCK

Deadlock analysis.

## 62. VACUUM/BLOAT

PostgreSQL table and index bloat.

## 63. TABLE STATS

Table-level statistics health.

## 64. TEMP SPILL

Sort and hash operations spilling to temporary disk storage.

## 65. DB MEMORY

Do not globally increase working memory without modeling concurrency impact.

## 66. CACHE HIT

Database buffer cache hit ratio.

## 67. OS PAGE CACHE

Operating system filesystem cache efficiency.

## 68. READ REPLICA

Offload reads only when replication lag and consistency requirements permit.

## 69. APPLICATION CACHE

Do not blindly introduce application caching around fundamentally broken SQL queries.

## 70. QUERY CACHE INVALIDATION

Cache invalidation complexity.

## 71. MATERIALIZED VIEW

Deploy for heavy, relatively stable aggregations.

## 72. PRECOMPUTE

Precompute asynchronous summaries if business rules allow.

## 73. DENORMALIZE

Last-mile optimization requiring strict consistency management.

## 74. PARTITIONING

Deploy only to resolve tangible partition pruning or maintenance challenges.

## 75. SHARDING

Never recommend sharding as the primary answer to query performance issues.

## 76. PARAMETER SNIFFING / PLAN CACHE

Engine-specific plan caching and parameter sniffing behaviors.

## 77. DATA SKEW

Tenant A holding massive data volumes while others remain small.

## 78. WORST TENANT

Benchmark against realistic, heavy-tenant data distributions.

## 79. REALISTIC DATA

Synthetic datasets of 100 rows mask production performance cliffs.

## 80. LOAD

A query performing well in isolation failing at 100 concurrent requests.

## 81. CONCURRENCY MATH

A query that looks fine alone can saturate the database under load:

```text
20 ms per execution × 500 concurrent requests
= 10 seconds of database work requested at once
with a pool of 50 connections: 450 requests wait for a connection
```

For each critical query estimate peak executions per second, the connections and CPU they occupy, and whether lock or I/O contention grows with concurrency. Verify with a load test where possible.

## 82. CONNECTION POOL

Connection pool tuning.

## 83. DB CPU

CPU resource saturation.

## 84. IOPS

Storage IOPS exhaustion.

## 85. STORAGE LATENCY

Disk read and write latency.

## 86. NETWORK REGION

Cross-region latency between compute nodes and database servers.

## 87. FIX VERIFICATION

No finding is closed without:

```text
before plan
after plan
before latency (mean, p95) and total time
after latency (mean, p95) and total time
rows scanned before / after
write-cost regression, if an index was added (insert/update latency, WAL volume)
results equivalence (the rewritten query returns the same rows)
```

Measure on production-sized data with the worst-case parameters.

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

- **P0** - a query pattern that can take down the database or the whole application (for example an unbounded query any client can trigger).
- **P1** - a proven performance cliff on a critical path: timeouts, pool exhaustion or saturation at current or near-term load.
- **P2** - material latency or a large share of total database time on important paths.
- **P3** - inefficiency on secondary paths with limited impact.
- **P4** - hardening for expected growth, observability, housekeeping.

## 91. OUTPUT

`SQL_PERFORMANCE_HUNTER.md`

## 92. SECOND PASS

Benchmark critical queries at:

```text
1x
10x
100x realistic row counts
```

alongside representative concurrency loads, and additionally:

- run the worst-case parameters (largest tenant, widest range, deepest page)
- check whether the problem is in the plan, in lock waits or in pool waits
- look for plan changes after statistics refresh
- try to disprove each finding: is the query actually frequent? would a cheaper fix (LIMIT, removing an unused column, fixing an N+1 caller) remove the need for an index or rewrite?

## 93. FINAL QUALITY GATE

Before returning the report, verify that findings are based on:

- real production workload (or clearly labelled when it is not available)
- query plans for the actual engine version
- execution frequency and total database time
- row counts scanned vs returned
- lock wait and pool wait metrics, separated from plan problems
- index configurations and their write cost
- data skew profiles and the worst tenant
- pagination efficiency
- N+1 detection at the request level
- result payload size
- realistic benchmarking data and concurrency
- before / after measurements for every proposed fix

and that statuses and evidence tiers are applied consistently, with no tier D item presented as confirmed.

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

Other failure chains to look for:

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
