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
version: 1.0.0
status: stable
---

# DATABASE INDEX AUDIT

I want a complete forensic audit of all database indexes with a focus on query coverage, write amplification, duplicate indexes, uniqueness, column ordering, and actual production usage.

## 1. INDEX INVENTORY

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

## 2. PRIMARY/UNIQUE

Do not alter constraint-backed indexes without fully understanding domain invariants.

## 3. FOREIGN KEY

Child foreign key columns frequently require indexes for joins and cascade deletes, but verify actual workloads.

## 4. MISSING INDEX

Findings must reference concrete queries with demonstrated performance issues.

## 5. UNUSED INDEX

Usage statistics are bounded by the observation window.

Server restarts reset usage statistics and can mislead audits.

## 6. DUPLICATE INDEX

Exact duplicate index definitions.

## 7. PREFIX DUPLICATE

Composite `(a, b)` can cover certain `(a)` lookups, but uniqueness, sort order, and included columns dictate actual viability.

## 8. REDUNDANT UNIQUE

Redundant unique index configurations.

## 9. WRITE COST

Every index incurs overhead on:

- insertions
- updates
- deletions
- storage consumption
- background maintenance

## 10. WIDE INDEX

Large text columns or excessive included attributes.

## 11. COMPOSITE ORDER

Ordering equality columns, range filters, and sort patterns to match actual query shapes.

## 12. LEFTMOST PREFIX

Engine-specific index traversal rules.

## 13. ORDER DIRECTION

Some database engines can scan indexes in reverse efficiently.

Verify engine capabilities.

## 14. INCLUDE/COVERING

Do not overuse covering indexes unnecessarily.

## 15. PARTIAL INDEX

Useful for:

```text
deleted_at IS NULL
status = active
```

when query predicates match index conditions.

## 16. EXPRESSION INDEX

Functional indexes such as LOWER(email), date truncations, etc.

## 17. FUNCTION MATCH

Query predicates must precisely align with expression index definitions.

## 18. SELECTIVITY

Column selectivity analysis.

## 19. BOOLEAN INDEX

Low efficiency unless utilized within partial or composite indexes.

## 20. TENANT

Multi-tenant indexes generally require explicit tenant scoping.

## 21. GLOBAL ID

If primary keys are globally unique, tenant prefixes may not be required for lookup speed, but authorization still demands scoping.

## 22. UNIQUE PER TENANT

```text
UNIQUE(tenant_id, slug)
```

## 23. SOFT DELETE UNIQUE

Partial unique indexes or alternative lifecycle modeling.

## 24. NULL UNIQUE SEMANTICS

Engine-specific NULL handling in unique indexes.

## 25. PAGINATION

Indexing optimized for filter and sort combinations.

## 26. SEARCH

B-tree indexes are unsuitable for arbitrary pattern or substring searches.

## 27. FULL TEXT

Engine-specific full-text indexing mechanisms.

## 28. TRIGRAM

Trigram indexes where pattern matching warrants them.

## 29. JSON

GIN, GiST, or inverted indexes depending on engine and query patterns.

## 30. ARRAY

Array containment indexes.

## 31. SPATIAL

Spatial indexing for geospatial data.

## 32. PREFIX LENGTH

Prefix length indexing in MySQL-like engines.

## 33. COLLATION

Collation semantics affecting index lookups.

## 34. CASE INSENSITIVE

Case-insensitive indexing strategies.

## 35. DESC

Explicit descending index ordering.

## 36. NULL ORDER

NULLS FIRST vs NULLS LAST index ordering.

## 37. CLUSTERED INDEX

Engine-specific physical data layout behaviors.

## 38. HOT INSERT

Sequential keys vs random UUID insertions.

Do not claim one is universally superior in all scenarios.

## 39. UUID V4

Can increase index fragmentation and page splits in B-tree architectures.

## 40. UUID V7 / ordered ID

Potential optimization if insertion fragmentation is an empirically proven bottleneck.

## 41. INDEX SIZE

Ensuring critical working indexes fit within buffer memory.

## 42. BLOAT

Index bloat identification.

## 43. REINDEX

Operational locking risks associated with rebuilding indexes.

## 44. CONCURRENT INDEX CREATION

Utilize non-blocking, online, or concurrent creation methods supported by the engine.

## 45. LOCKING

Index builds blocking concurrent reads or writes.

## 46. PROD MIGRATION

Building large indexes as part of production release steps.

## 47. VALIDATION

Using phased create-not-valid and online validation patterns where supported.

## 48. COVERAGE MATRIX

| Query | Predicates | Order | Existing index | Gap |
|---|---|---|---|---|

## 49. WRITE HOTSPOT MATRIX

| Table | Writes/sec | Index count | Index bytes | Risk |
|---|---:|---:|---:|---|

## 50. FINDING FORMAT

```text
ID:
Severity:
Table:
Index:
Query:
Observed plan:
Usage stats:
Problem:
Read impact:
Write impact:
Storage impact:
Evidence:
Recommendation:
Migration safety:
Benchmark:
```

## 51. SEVERITY

P1 reserved exclusively for verified production outages, critical performance cliffs, or integrity failures.

Most index findings belong in P2, P3, or P4 unless empirically proven otherwise.

## 52. OUTPUT

`DATABASE_INDEX_AUDIT.md`

## 53. SECOND PASS

For every high-volume table:

- map top queries
- map existing indexes
- identify redundant indexes
- identify coverage gaps
- compare execution plans with and without candidate indexes
- calculate write amplification overhead
- evaluate index creation migration safety

## 54. FINAL QUALITY GATE

- query evidence
- actual execution plan
- query frequency
- write workload
- index memory footprint
- predicate selectivity
- composite column ordering
- uniqueness guarantees
- migration locking safety

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
