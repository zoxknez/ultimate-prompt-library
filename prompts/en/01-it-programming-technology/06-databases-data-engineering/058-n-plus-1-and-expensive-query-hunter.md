---
id: UPL-IT-058
number: 58
slug: n-plus-1-and-expensive-query-hunter
title: N+1 & Expensive Query Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# N+1 AND EXPENSIVE QUERY HUNTER

I want to systematically identify all N+1, duplicate, overfetch, and hidden expensive query patterns in the application.

Main objective:

> Correlate application call paths with the actual count of database round-trips and prove where the workload grows as O(n) or worse rather than roughly constant or batched.

## 1. REQUEST-LEVEL QUERY COUNT

For critical endpoints measure:

```text
1 item
10 items
100 items
```

## 2. N+1 SIGNATURE

```text
1 parent query
+
N child queries
```

## 3. NESTED N+1

```text
users
↓
projects per user
↓
tasks per project
```

Can become O(users × projects).

## 4. GRAPHQL

Resolver-level N+1 query patterns.

## 5. DATALOADER

Verify batch key scoping and cache lifetime boundaries.

## 6. SERIALIZER

Lazy relationship access triggered during response serialization.

## 7. TEMPLATE

Template rendering implicitly invoking lazy database lookups.

## 8. ADMIN UI

Frequently overlooked administrative interface loops.

## 9. EXPORT

Exporting thousands of records drastically magnifies N+1 overhead.

## 10. BACKGROUND JOB

No immediate user-facing latency, but actual database load remains severe.

## 11. LOOP

Identify database queries executed inside procedural loops.

## 12. ASYNC LOOP

`Promise.all` can transform sequential N+1 into a concurrent database connection storm.

## 13. PARALLEL N+1

Can induce severe connection pool exhaustion.

## 14. LAZY LOADING

Implicit hidden query execution.

## 15. EAGER LOADING

Can resolve N+1 but risks triggering Cartesian join explosions.

## 16. JOIN EXPLOSION

Multiple one-to-many relationship includes.

## 17. SPLIT QUERY

Split queries can offer superior performance over massive multi-table joins.

## 18. PRELOAD/BATCH

Preloading and batching strategies.

## 19. `IN (...)`

Large parameter list limits and optimizer performance cliffs.

## 20. CHUNKING

Chunking large batched queries into manageable thresholds.

## 21. DUPLICATE QUERY

Identical primary key records loaded repeatedly within a single request context.

## 22. REQUEST CACHE

Verify whether identity maps or unit of work patterns mitigate duplicates.

## 23. OVERFETCH COLUMNS

Retrieving massive BLOB or text columns that are never rendered.

## 24. OVERFETCH RELATIONS

Fetching deep relation graphs unconsumed by the caller.

## 25. COUNT PER ROW

Executing distinct COUNT queries per displayed record.

## 26. EXISTS PER ROW

Batching existence checks instead of row-by-row queries.

## 27. PERMISSION QUERY PER ROW

Generates severe database load and auth complexity.

## 28. TENANT CONFIG PER ROW

Scope tenant configuration to the request or cache context.

## 29. USER LOOKUP PER ROW

Repeated user profile lookups in item loops.

## 30. PROVIDER CALL

Extend analysis beyond databases if loops execute external third-party API calls.

## 31. ORM QUERY LOG

Capture and inspect exact raw SQL statements.

## 32. TRACE

Correlate queries back to precise application source call sites.

## 33. LATENCY

Low local development latency masks N+1 issues until deployed over production network paths.

## 34. CONNECTION POOL

Concurrent N+1 bursts consuming all available pool connections.

## 35. ROW COUNT

Measure rows scanned versus rows returned to the application.

## 36. CARTESIAN PRODUCT

A single mega-join can perform worse than several cleanly batched queries.

## 37. BALANCE

The objective is minimizing overall query cost, not reducing query count at all costs.

## 38. PAGINATION

N+1 query frequency directly scales with configured page size.

## 39. API `include`

Optional dynamic relationship expansions requested by API consumers.

## 40. GRAPHQL COMPLEXITY

API consumers requesting deeply nested, computationally expensive fields.

## 41. CACHE

Do not conceal database abuse behind prolonged global caching if data correctness suffers.

## 42. FINDING FORMAT

```text
ID:
Severity:
Endpoint/job:
Call site:
Input size:
Query count:
Rows scanned/returned:
Latency:
Pattern:
Root cause:
Fix options:
Benchmark before:
Benchmark after:
Regression test:
```

## 43. OUTPUT

`N_PLUS_1_EXPENSIVE_QUERY_HUNTER.md`

## 44. SECOND PASS

For every list, search, or export endpoint evaluate:

- query count at 1, 10, and 100 row thresholds
- relationship expansions
- response serialization
- authorization lookups
- aggregate count lookups
- external API dependencies

## 45. FINAL QUALITY GATE

Do not label all multi-query flows as N+1.

An N+1 defect exists when query counts scale linearly with the volume of processed items.

# FINAL RULE

Looking for:

```text
GET /projects

1 query -> 100 projects

serializer loops:
project.owner.name

lazy relation
↓
100 additional user queries

then:
project.taskCount
↓
100 COUNT queries

total:
201 queries
```
