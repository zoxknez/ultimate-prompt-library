---
id: UPL-IT-058
number: 58
slug: n-plus-1-and-expensive-query-hunter
title: N+1 & Expensive Query Hunter
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# N+1 AND EXPENSIVE QUERY HUNTER

Želim sistematski pronaći sve N+1, duplicate, overfetch i hidden expensive query obrasce u aplikaciji.

Glavni cilj:

> Povezati application call path sa stvarnim brojem DB round-trip-ova i dokazati gde workload raste kao O(n) ili gore umesto približno konstantno/batched.

## 1. REQUEST-LEVEL QUERY COUNT

Za critical endpoints meri:

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

Resolver N+1.

## 5. DATALOADER

Check key scope/cache.

## 6. SERIALIZER

Lazy relation access during serialization.

## 7. TEMPLATE

Rendering triggers lazy queries.

## 8. ADMIN UI

Often overlooked.

## 9. EXPORT

Thousands of rows magnify N+1.

## 10. BACKGROUND JOB

No user latency, but DB load still real.

## 11. LOOP

Search for DB calls inside loops.

## 12. ASYNC LOOP

`Promise.all` may turn sequential N+1 into concurrent DB storm.

## 13. PARALLEL N+1

Can be worse for pool exhaustion.

## 14. LAZY LOADING

Hidden query.

## 15. EAGER LOADING

Can solve N+1 but cause Cartesian explosion.

## 16. JOIN EXPLOSION

Multiple one-to-many includes.

## 17. SPLIT QUERY

Can be better.

## 18. PRELOAD/BATCH

## 19. `IN (...)`

Large list limit/performance.

## 20. CHUNKING

## 21. DUPLICATE QUERY

Same PK loaded multiple times in one request.

## 22. REQUEST CACHE

Identity map/unit of work may already solve.

## 23. OVERFETCH COLUMNS

Huge blob/text not used.

## 24. OVERFETCH RELATIONS

## 25. COUNT PER ROW

Classic.

## 26. EXISTS PER ROW

Can batch.

## 27. PERMISSION QUERY PER ROW

May be both performance and auth complexity.

## 28. TENANT CONFIG PER ROW

Cache/request scope.

## 29. USER LOOKUP PER ROW

## 30. PROVIDER CALL

Extend analysis beyond DB if loop calls external API.

## 31. ORM QUERY LOG

Capture exact SQL.

## 32. TRACE

Map to source call site.

## 33. LATENCY

DB local low latency can hide N+1 until production network.

## 34. CONNECTION POOL

Parallel N+1 can consume all.

## 35. ROW COUNT

Measure returned/scanned.

## 36. CARTESIAN PRODUCT

One mega join can be worse than several batched queries.

## 37. BALANCE

Goal is lowest total cost, not minimum query count at all costs.

## 38. PAGINATION

N+1 multiplies page size.

## 39. API `include`

Optional relation expansion.

## 40. GRAPHQL COMPLEXITY

User can request nested expensive fields.

## 41. CACHE

Do not hide DB abuse with long global cache if data correctness suffers.

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

Za svaki list/search/export endpoint:

- query count at 1, 10, 100 rows
- relation expansion
- serialization
- authorization lookup
- count lookup
- external API lookup

## 45. FINAL QUALITY GATE

Ne nazivaj sve multi-query N+1.

N+1 postoji kada broj queries nepotrebno raste sa brojem items.

# KONAČNO PRAVILO

Tražim:

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
