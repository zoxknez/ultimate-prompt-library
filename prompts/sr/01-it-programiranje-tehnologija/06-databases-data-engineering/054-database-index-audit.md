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
version: 1.0.0
status: stable
---

# DATABASE INDEX AUDIT

Želim kompletan forensic audit svih indexes sa fokusom na query coverage, write amplification, duplicate indexes, uniqueness, ordering i production usage.

## 1. INDEX INVENTORY

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

## 2. PRIMARY/UNIQUE

Ne diraj constraint-backed indexes bez razumevanja.

## 3. FOREIGN KEY

Child FK često treba index za joins/deletes, ali proveri workload.

## 4. MISSING INDEX

Finding mora pokazati concrete query.

## 5. UNUSED INDEX

Usage statistics imaju observation window.

Restart statistics can mislead.

## 6. DUPLICATE INDEX

Exact duplicate.

## 7. PREFIX DUPLICATE

Composite `(a,b)` may cover some `(a)` queries, ali uniqueness/order/include differences matter.

## 8. REDUNDANT UNIQUE

## 9. WRITE COST

Svaki index:

- insert
- update
- delete
- storage
- maintenance

## 10. WIDE INDEX

Large text/include columns.

## 11. COMPOSITE ORDER

Equality columns, range, sort pattern prema actual query.

## 12. LEFTMOST PREFIX

Engine-specific behavior.

## 13. ORDER DIRECTION

Some engines can scan backward.

Verify.

## 14. INCLUDE/COVERING

Do not overuse.

## 15. PARTIAL INDEX

Useful for:

```text
deleted_at IS NULL
status = active
```

if query matches.

## 16. EXPRESSION INDEX

LOWER(email), date expressions etc.

## 17. FUNCTION MATCH

Query expression must match planner semantics.

## 18. SELECTIVITY

## 19. BOOLEAN INDEX

May be poor unless partial/composite.

## 20. TENANT

Typical multi-tenant indexes need scope awareness.

## 21. GLOBAL ID

If IDs globally unique, tenant may not be needed for lookup performance, but authorization still needs scoping.

## 22. UNIQUE PER TENANT

```text
UNIQUE(tenant_id, slug)
```

## 23. SOFT DELETE UNIQUE

Partial unique or lifecycle alternative.

## 24. NULL UNIQUE SEMANTICS

DB-specific.

## 25. PAGINATION

Index for filter + order.

## 26. SEARCH

B-tree not appropriate for all text search patterns.

## 27. FULL TEXT

Engine-specific index.

## 28. TRIGRAM

Where relevant.

## 29. JSON

GIN/GiST/inverted according to engine/query.

## 30. ARRAY

## 31. SPATIAL

If geo.

## 32. PREFIX LENGTH

MySQL-like.

## 33. COLLATION

Index semantics.

## 34. CASE INSENSITIVE

## 35. DESC

## 36. NULL ORDER

## 37. CLUSTERED INDEX

Engine-specific physical behavior.

## 38. HOT INSERT

Sequential keys vs random UUID.

Do not claim one always superior.

## 39. UUID V4

May increase index fragmentation/page splits in some engines.

## 40. UUID V7 / ordered ID

Potential improvement if actual bottleneck proven.

## 41. INDEX SIZE

Fits cache?

## 42. BLOAT

## 43. REINDEX

Operational risk.

## 44. CONCURRENT INDEX CREATION

Use engine-supported online/concurrent method where required.

## 45. LOCKING

Index build can block writes/reads.

## 46. PROD MIGRATION

Large index build as release step.

## 47. VALIDATION

Some DBs support create not-valid/online workflows for constraints/indexes.

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

P1 only for actual production-critical outage/performance/integrity paths.

Most index findings are P2/P3/P4 unless proven otherwise.

## 52. OUTPUT

`DATABASE_INDEX_AUDIT.md`

## 53. SECOND PASS

For every high-volume table:

- map top queries
- map indexes
- identify redundant
- identify gaps
- simulate/index-plan compare
- calculate write overhead
- assess build migration safety

## 54. FINAL QUALITY GATE

- query evidence
- actual plan
- frequency
- write workload
- index size
- selectivity
- multi-column order
- uniqueness
- migration locking

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
