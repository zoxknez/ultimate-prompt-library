---
id: UPL-IT-054
number: 54
slug: database-index-audit
title: Database Index Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.1.0
status: stable
---

# DATABASE INDEX AUDIT

I want a complete forensic audit of all database indexes with a focus on query coverage, write amplification, duplicate indexes, uniqueness, column ordering, and actual production usage.

## 1. OBJECTIVE AND NON-GOALS

The audit must prove, for each important table, whether the existing index set matches the real access patterns: which queries are served well, which are served badly, which indexes cost more than they return, and which index changes can be deployed safely.

The result is a small set of evidence-backed index changes (add, change, drop, rebuild) with measured read benefit, estimated write and storage cost, and a safe rollout.

Non-goals:

- listing every column that could theoretically be indexed
- generic advice such as "add indexes to foreign keys" without a query that needs them
- redesigning the schema, the ORM or the caching layer (mention only if an index cannot fix the access pattern)
- backup, authentication or general application architecture
- choosing a different database engine

## 2. CONTEXT DISCOVERY

Before judging any index, establish:

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

Index behavior is engine- and version-specific (leftmost-prefix rules, backward scans, INCLUDE columns, partial/filtered indexes, online builds, NULL handling in unique indexes, clustered layout). Verify the semantics for the detected engine and version before stating them. If the engine or version cannot be determined, say so and mark engine-dependent conclusions **NOT VERIFIED**.

## 3. ACCESS-PATTERN-FIRST RULE

Never work in this direction:

```text
look at columns
↓
invent indexes
```

Always start from the workload:

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

For every important query record:

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

An index recommendation that cannot be traced back to one of these records is not a finding.

## 4. EVIDENCE MODEL

Classify the evidence behind every finding:

```text
A - measured: production statement statistics, actual execution plans with real row counts, or a benchmark on production-like data
B - complete static path: query text + current plan (EXPLAIN without execution) + table size and statistics
C - strong static evidence: query and schema show the gap, but no plan or volume data
D - inference: plausible access pattern or risk that needs verification
E - hardening: maintenance or future-growth recommendation without a current problem
```

A **missing** index finding needs at least tier B. A **drop** recommendation needs usage evidence over a representative window (tier A or B) and a check of every consumer (primary, replicas, periodic jobs, constraints). Tier D and E items are never reported as confirmed defects.

## 5. FINDING STATUS

Every finding carries exactly one status:

- **CONFIRMED** - the access-path problem or the excess cost is demonstrated (tier A or B).
- **LIKELY** - strong static evidence (tier C); the plan or volume still needs to be checked.
- **NOT VERIFIED** - depends on data that is not available (engine version, statistics window, production volume).
- **NOT APPLICABLE** - the concern does not apply to this engine, table size or workload.
- **CONTROLLED** - the risk exists in principle but is already handled (for example, an existing composite index covers the query).
- **HARDENING** - an improvement without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete query, write path, lock or storage problem behind it.

## 6. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A missing index is not a finding unless an actual, frequent or expensive access pattern benefits from it.
- A sequential scan is not automatically bad: on small tables, or when most rows are returned, it can be the cheapest plan.
- An index with zero recorded usage is not automatically unused: counters may have been reset, the window may miss monthly jobs, reads may run on replicas, and the index may enforce a constraint.
- A foreign key column without an index is not automatically a problem if parents are never deleted or updated and no query joins or filters by it.
- A low-cardinality column (status, boolean) is not automatically a bad index candidate: it can be excellent as a partial index or as the leading column for a rare value.
- UUID primary keys are not automatically a performance defect; fragmentation must be shown to matter for this workload.
- Two indexes that start with the same column are not automatically redundant; uniqueness, sort direction, INCLUDE columns and partial predicates can differ.

## 7. INDEX INVENTORY

For every index:

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

Do not alter constraint-backed indexes without fully understanding domain invariants.

## 9. FOREIGN KEY

Child foreign key columns frequently require indexes for joins and cascade deletes, but verify actual workloads.

## 10. MISSING INDEX

Findings must reference concrete queries with demonstrated performance issues.

## 11. UNUSED INDEX

Usage statistics are bounded by the observation window.

Server restarts reset usage statistics and can mislead audits.

## 12. UNUSED INDEX EVIDENCE

Before recommending that an index be dropped, prove it is unused:

- When were usage statistics last reset (restart, failover, manual reset, upgrade)?
- Does the window cover the full business cycle (month-end jobs, yearly reports, rare admin screens)?
- Are replicas collecting their own usage statistics? An index unused on the primary may serve all reads on a replica.
- Is the index backing a primary key, unique constraint or foreign key?
- Is it used by the optimizer for statistics or uniqueness proofs even when not scanned?
- Is it referenced by index hints in code or ORM configuration?

If any of these cannot be checked, the status is **NOT VERIFIED**, not CONFIRMED.

## 13. DUPLICATE INDEX

Exact duplicate index definitions.

## 14. PREFIX DUPLICATE

Composite `(a, b)` can cover certain `(a)` lookups, but uniqueness, sort order, and included columns dictate actual viability.

## 15. REDUNDANT UNIQUE

Redundant unique index configurations.

## 16. REDUNDANCY DETECTION

Classify every overlap precisely:

```text
exact duplicate        same columns, order, direction, predicate, expression and INCLUDE list
left-prefix overlap    (a) next to (a, b): often removable, but only if uniqueness, sort and size allow it
constraint-backed      one of the pair enforces PRIMARY KEY / UNIQUE / FK and cannot simply be dropped
INCLUDE difference     same key columns, different covered columns: one may enable index-only scans
partial difference     same columns, different WHERE predicate: they may serve different queries
expression difference  lower(email) vs email: different access paths
```

For each candidate for removal, list the queries that currently use it and prove that the remaining index serves them with an equivalent plan.

## 17. INDEX CAPABILITY MODEL

Evaluate every existing and candidate index on the same dimensions:

```text
Predicate support:   which WHERE conditions can use it (equality, range, IN, prefix LIKE, expression)
Sort support:        which ORDER BY clauses it satisfies without a sort step
Covering potential:  can the query be answered from the index alone?
Uniqueness:          does it enforce or prove uniqueness?
Write cost:          which INSERT/UPDATE/DELETE paths must maintain it, and how often
Storage cost:        size on disk and in memory, growth rate
Maintenance cost:    bloat, rebuild needs, statistics, build time on the current table size
```

A candidate index is justified only when the read benefit for real queries outweighs its write, storage and maintenance cost.

## 18. WRITE COST

Every index incurs overhead on:

- insertions
- updates
- deletions
- storage consumption
- background maintenance

## 19. WRITE AMPLIFICATION

For write-heavy tables, quantify what every additional index costs:

- number of indexes that must be updated per INSERT
- UPDATE statements that change indexed columns (in engines that can avoid index maintenance when indexed columns are unchanged, a new index on a frequently updated column can disable that optimization)
- DELETE and cascade paths
- extra WAL / redo / binlog volume and its effect on replicas
- lock and latch contention on hot index pages

Report the write cost next to the read benefit. A read improvement of a rare report that slows every checkout write is usually a bad trade.

## 20. WIDE INDEX

Large text columns or excessive included attributes.

## 21. COMPOSITE ORDER

Ordering equality columns, range filters, and sort patterns to match actual query shapes.

## 22. LEFTMOST PREFIX

Engine-specific index traversal rules.

## 23. ORDER DIRECTION

Some database engines can scan indexes in reverse efficiently.

Verify engine capabilities.

## 24. EQUALITY, RANGE AND SORT COMBINATIONS

For composite indexes, reason from the query shape:

```text
WHERE tenant_id = ? AND status = ? AND created_at > ?
ORDER BY created_at DESC
LIMIT 50
```

- equality columns first (tenant_id, status), in an order that also serves other frequent queries
- then the column that is both range-filtered and sorted (created_at)
- a range condition on an earlier column usually prevents the index from providing the sort for later columns
- IN lists behave like equality in some engines and like ranges in others; verify for the engine
- check whether the planner actually uses the index for both filtering and sorting (no separate sort node, reasonable rows examined)

Do not propose a column order without showing which queries it serves and which it stops serving.

## 25. INCLUDE/COVERING

Do not overuse covering indexes unnecessarily.

## 26. PARTIAL INDEX

Useful for:

```text
deleted_at IS NULL
status = active
```

when query predicates match index conditions.

## 27. EXPRESSION INDEX

Functional indexes such as LOWER(email), date truncations, etc.

## 28. FUNCTION MATCH

Query predicates must precisely align with expression index definitions.

## 29. SELECTIVITY

Column selectivity analysis.

## 30. BOOLEAN INDEX

Low efficiency unless utilized within partial or composite indexes.

## 31. TENANT

Multi-tenant indexes generally require explicit tenant scoping.

## 32. GLOBAL ID

If primary keys are globally unique, tenant prefixes may not be required for lookup speed, but authorization still demands scoping.

## 33. UNIQUE PER TENANT

```text
UNIQUE(tenant_id, slug)
```

## 34. SOFT DELETE UNIQUE

Partial unique indexes or alternative lifecycle modeling.

## 35. NULL UNIQUE SEMANTICS

Engine-specific NULL handling in unique indexes.

## 36. PAGINATION

Indexing optimized for filter and sort combinations.

## 37. SEARCH

B-tree indexes are unsuitable for arbitrary pattern or substring searches.

## 38. FULL TEXT

Engine-specific full-text indexing mechanisms.

## 39. TRIGRAM

Trigram indexes where pattern matching warrants them.

## 40. JSON

GIN, GiST, or inverted indexes depending on engine and query patterns.

## 41. ARRAY

Array containment indexes.

## 42. SPATIAL

Spatial indexing for geospatial data.

## 43. PREFIX LENGTH

Prefix length indexing in MySQL-like engines.

## 44. COLLATION

Collation semantics affecting index lookups.

## 45. CASE INSENSITIVE

Case-insensitive indexing strategies.

## 46. DESC

Explicit descending index ordering.

## 47. NULL ORDER

NULLS FIRST vs NULLS LAST index ordering.

## 48. CLUSTERED INDEX

Engine-specific physical data layout behaviors.

## 49. HOT INSERT

Sequential keys vs random UUID insertions.

Do not claim one is universally superior in all scenarios.

## 50. UUID V4

Can increase index fragmentation and page splits in B-tree architectures.

## 51. UUID V7 / ordered ID

Potential optimization if insertion fragmentation is an empirically proven bottleneck.

## 52. INDEX SIZE

Ensuring critical working indexes fit within buffer memory.

## 53. CACHE RESIDENCY

An index only helps latency predictably if its hot part stays in memory.

- compare the total size of frequently used indexes with the buffer pool / shared buffers
- check whether random-key inserts touch pages across the whole index (poor locality) or only the rightmost pages
- check buffer hit ratios and physical reads for the affected queries
- a new large index can evict the working set of other queries; include this in the cost

## 54. BLOAT

Index bloat identification.

## 55. REINDEX

Operational locking risks associated with rebuilding indexes.

## 56. CONCURRENT INDEX CREATION

Utilize non-blocking, online, or concurrent creation methods supported by the engine.

## 57. LOCKING

Index builds blocking concurrent reads or writes.

## 58. PROD MIGRATION

Building large indexes as part of production release steps.

## 59. VALIDATION

Using phased create-not-valid and online validation patterns where supported.

## 60. LOCK-SAFE INDEX BUILD

For every index change on a large production table, determine concretely:

- If a migration creates an index on a 500 GB table: does the actual engine and version support an online or concurrent build, and what locks does it take at the start and at the end?
- How long can lock acquisition itself wait behind an existing long-running transaction, and does a waiting DDL block new queries behind it on this engine?
- How much temporary disk space, sort space and WAL / redo / binlog volume will the build produce, and is there headroom on the primary and on every replica?
- Can replicas apply the change within an acceptable replication lag?
- What happens if the build fails or is cancelled midway (for example, an invalid index left behind that still costs writes)?
- Is there a lock timeout and statement timeout so the deployment fails fast instead of queueing traffic?
- Is the build run by a single controlled migration job, not by every application instance?

Unique index builds additionally fail on existing duplicates; check the data first.

## 61. ROLLBACK AND REMOVAL

Every index change needs a way back:

- dropping an index is fast to execute but slow to undo: recreating it on a large table is a full build
- where the engine supports it, make the index invisible/disabled first and observe before dropping
- drop redundant indexes in a separate release from adding their replacement, so the replacement is proven first
- record the exact definition of every dropped index so it can be recreated
- check ORM migrations and schema files so the index is not recreated or dropped again by the next deploy

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

Severity follows impact, not the number of missing indexes:

- **P0** - an index change or missing index causes a production-wide outage or data integrity loss (for example, a blocking index build on the hottest table during peak, or a dropped unique index that lets duplicates corrupt business data).
- **P1** - a proven, repeatable performance cliff on a critical path (timeouts, pool exhaustion, lock pile-ups) or a missing unique index that allows real invariant violations.
- **P2** - material latency or resource cost on important queries, or substantial write/storage overhead from redundant indexes.
- **P3** - limited inefficiency on secondary paths, moderate bloat, minor redundancy.
- **P4** - hardening: future-growth preparation, cleanup, monitoring of index usage.

Most index findings are P2-P4. Use P1 only with evidence of real production impact or an invariant at risk.

## 66. OUTPUT

`DATABASE_INDEX_AUDIT.md`

## 67. SECOND PASS

For every high-volume table and every recommended change:

- map the top queries again and confirm each recommendation is tied to one of them
- try to prove the candidate index is unnecessary: is there an existing index with an equivalent plan? would rewriting the query, adding LIMIT or fixing an N+1 remove the need?
- try to prove the drop recommendation is wrong: replicas, rare jobs, constraints, statistics reset
- compare plans with and without the candidate on production-like data, including the worst (largest) tenant
- recalculate write amplification at peak write rate
- re-check build safety at the current table size and growth rate
- confirm the rollback path for every change

## 68. FINAL QUALITY GATE

Before returning the report, verify that:

- engine and version were identified, and engine-specific claims were checked for that version
- every missing-index finding cites a real query, its frequency and its current plan
- every drop recommendation cites usage evidence, the observation window, replicas and constraint checks
- composite column order is justified by equality/range/sort analysis of real queries
- write, storage and memory cost is stated next to every read benefit
- uniqueness and multi-tenant scoping were checked for every unique index
- build and removal safety (locks, duration, disk, WAL, replicas, timeouts) is addressed for large tables
- statuses and evidence tiers are applied consistently, and no tier D/E item is presented as confirmed
- the report contains a small, prioritized change set, not a list of every indexable column

# FINAL RULE

Looking for:

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

Do not recommend randomly adding indexes.

Other failure chains to look for:

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
