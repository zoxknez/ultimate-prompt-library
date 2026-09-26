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
version: 1.1.0
status: stable
---

# N+1 AND EXPENSIVE QUERY HUNTER

I want to systematically identify all N+1, duplicate, overfetch, and hidden expensive query patterns in the application.

Main objective:

> Correlate application call paths with the actual count of database round-trips and prove where the workload grows as O(n) or worse rather than roughly constant or batched.

## 1. OBJECTIVE AND NON-GOALS

For every list, detail, export, GraphQL and background-job path, prove how the number and cost of database round trips grow with the amount of data processed, and fix the paths where they grow linearly (or worse) instead of staying constant or batched.

Non-goals:

- labelling every flow with more than one query as N+1
- minimizing query count at any cost (one enormous join can be worse than three batched queries)
- general SQL tuning of single slow queries (only when it is part of a repeated pattern)
- introducing caching to hide a data-access problem

## 2. CONTEXT DISCOVERY

Establish first:

```text
ORM / query builder and version:
Default loading behavior (lazy, eager, explicit):
API style (REST, GraphQL, RPC, server-rendered templates):
Batching / loader library and where its instances are created:
How queries can be observed (ORM query log, DB statement statistics, APM spans, test query counter):
Connection pool size per instance and number of instances:
Typical network latency between application and database:
Page sizes and maximum page sizes allowed by the API:
```

## 3. EVIDENCE MODEL

```text
A - measured: query counts and timings captured for the path at several input sizes (log, APM trace, test counter)
B - complete path: call chain from the entry point to repeated data access is fully traced in code, including loops, serializers and resolvers
C - strong static evidence: data access inside a loop or lazy relation access, but the call chain or input size is not confirmed
D - inference: plausible repetition depending on configuration or data shape
E - hardening: preventive measure (query-count assertion, loader adoption) where the path is currently fine
```

## 4. FINDING STATUS

- **CONFIRMED** - measured or fully traced linear growth of queries or cost with input size (tier A or B).
- **LIKELY** - strong static evidence (tier C).
- **NOT VERIFIED** - depends on data shape, configuration or ORM behavior that could not be checked.
- **NOT APPLICABLE** - input size is bounded and small by design (for example a fixed list of 5 settings).
- **CONTROLLED** - repetition exists but is batched, cached per request or otherwise bounded.
- **HARDENING** - preventive improvement without a current problem (P4).

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- Multiple queries are not automatically N+1. A request that always runs 5 queries regardless of page size is constant, not N+1.
- Lazy loading is not a defect until an actual code path accesses the relation repeatedly for many parents.
- A loop over a small, bounded collection (for example the 3 payment methods of a user) is not a scaling problem.
- A higher query count after a fix is not a regression if total database time, rows scanned and latency dropped (split queries instead of a Cartesian join).
- Do not invent absolute query-count limits ("more than 20 queries is bad"); judge by how counts and cost scale with input and by measured latency and load.

## 6. REQUEST-TO-QUERY TRACING

For every candidate path, map the chain from the entry point to the SQL:

```text
HTTP/API operation or job:
↓
controller / resolver / handler:
↓
service method:
↓
repository / ORM call (and the line where the relation is touched):
↓
SQL fingerprint(s) and how many times each runs:
```

Hidden repetition usually lives in the last two steps: serializers, template helpers, computed properties, authorization hooks, and GraphQL field resolvers.

## 7. REQUEST-LEVEL QUERY COUNT

For critical endpoints measure:

```text
1 item
10 items
100 items
```

## 8. SCALING SIGNATURE

Measure each important path at increasing input sizes where it is safe to do so:

```text
items:            1     10     100     1000
queries:          ?     ?      ?       ?
DB time (ms):     ?     ?      ?       ?
rows scanned:     ?     ?      ?       ?
latency p50/p95:  ?     ?      ?       ?
```

Expected behavior is constant or stepwise (one extra batch per relation). Linear growth in queries or DB time is the N+1 signature; growth faster than linear (nested relations) is worse. Use production-like data shapes: a tenant with 10 projects behaves differently from one with 10,000.

## 9. N+1 SIGNATURE

```text
1 parent query
+
N child queries
```

## 10. NESTED N+1

```text
users
↓
projects per user
↓
tasks per project
```

Can become O(users × projects).

## 11. GRAPHQL

Resolver-level N+1 query patterns.

## 12. DATALOADER

Verify batch key scoping and cache lifetime boundaries.

## 13. LOADER AND CACHE SCOPE

Batching loaders fix N+1 only when they are used correctly:

- create loader instances **per request** (or per operation); a process-wide loader cache can serve one user's data to another user and keep stale data forever
- make sure authorization is applied to what the loader returns, not only to the top-level query
- the batch function must return results in the order of the requested keys and handle missing keys explicitly
- loaders used from background jobs need their own scope and invalidation after writes
- check that every resolver path actually goes through the loader; one direct ORM call inside a field resolver reintroduces N+1

## 14. SERIALIZER

Lazy relationship access triggered during response serialization.

## 15. TEMPLATE

Template rendering implicitly invoking lazy database lookups.

## 16. ADMIN UI

Frequently overlooked administrative interface loops.

## 17. EXPORT

Exporting thousands of records drastically magnifies N+1 overhead.

## 18. BACKGROUND JOB

No immediate user-facing latency, but actual database load remains severe.

## 19. LOOP

Identify database queries executed inside procedural loops.

## 20. ASYNC LOOP

`Promise.all` can transform sequential N+1 into a concurrent database connection storm.

## 21. PARALLEL N+1

Can induce severe connection pool exhaustion.

## 22. LAZY LOADING

Implicit hidden query execution.

## 23. EAGER LOADING

Can resolve N+1 but risks triggering Cartesian join explosions.

## 24. JOIN EXPLOSION

Multiple one-to-many relationship includes.

## 25. EAGER LOADING ROW EXPLOSION

Fixing N+1 with eager loading of several one-to-many relations in a single join multiplies rows:

```text
50 orders, each with 20 items and 10 comments (two sibling relations)
joined in one query: 50 × 20 × 10 = 10,000 rows
to return 50 + 1,000 + 500 = 1,550 logical records
```

For every eager-load fix, compare rows transferred and memory used with the alternative of one batched query per relation (split query / preload). Choose the shape with the lowest total cost, not the lowest query count.

## 26. SPLIT QUERY

Split queries can offer superior performance over massive multi-table joins.

## 27. PRELOAD/BATCH

Preloading and batching strategies.

## 28. `IN (...)`

Large parameter list limits and optimizer performance cliffs.

## 29. CHUNKING

Chunking large batched queries into manageable thresholds.

## 30. DUPLICATE QUERY

Identical primary key records loaded repeatedly within a single request context.

## 31. REQUEST CACHE

Verify whether identity maps or unit of work patterns mitigate duplicates.

## 32. OVERFETCH COLUMNS

Retrieving massive BLOB or text columns that are never rendered.

## 33. OVERFETCH RELATIONS

Fetching deep relation graphs unconsumed by the caller.

## 34. COUNT PER ROW

Executing distinct COUNT queries per displayed record.

## 35. EXISTS PER ROW

Batching existence checks instead of row-by-row queries.

## 36. PERMISSION QUERY PER ROW

Generates severe database load and auth complexity.

## 37. AUTHORIZATION N+1

Per-row permission checks are a common hidden N+1:

- policy checks that load the resource, its owner and its membership separately for every row
- list endpoints that fetch everything and then filter by permission in application code (also a data-exposure risk if the filter is incomplete)
- field-level authorization in GraphQL that queries for every field of every item

Fix by pushing the permission predicate into the query or by batch-evaluating permissions for all IDs at once. Never fix the performance problem by removing or weakening the authorization check.

## 38. TENANT CONFIG PER ROW

Scope tenant configuration to the request or cache context.

## 39. USER LOOKUP PER ROW

Repeated user profile lookups in item loops.

## 40. PROVIDER CALL

Extend analysis beyond databases if loops execute external third-party API calls.

## 41. ORM QUERY LOG

Capture and inspect exact raw SQL statements.

## 42. TRACE

Correlate queries back to precise application source call sites.

## 43. LATENCY

Low local development latency masks N+1 issues until deployed over production network paths.

## 44. CONNECTION POOL

Concurrent N+1 bursts consuming all available pool connections.

## 45. CONNECTION POOL IMPACT

Repetition turns into outages through the pool:

```text
request issues 200 queries through Promise.all
↓
pool size 20 per instance
↓
each request holds many connections at once
↓
10 concurrent requests exhaust the pool
↓
unrelated fast endpoints wait for connections and time out
```

`Promise.all` or parallel streams are not a fix for N+1: they trade latency for a connection storm. Measure pool wait time and active connections under realistic concurrency, not only single-request latency.

## 46. ROW COUNT

Measure rows scanned versus rows returned to the application.

## 47. CARTESIAN PRODUCT

A single mega-join can perform worse than several cleanly batched queries.

## 48. BALANCE

The objective is minimizing overall query cost, not reducing query count at all costs.

## 49. PAGINATION

N+1 query frequency directly scales with configured page size.

## 50. API `include`

Optional dynamic relationship expansions requested by API consumers.

## 51. GRAPHQL COMPLEXITY

API consumers requesting deeply nested, computationally expensive fields.

## 52. CACHE

Do not conceal database abuse behind prolonged global caching if data correctness suffers.

## 53. TOTAL DATABASE COST

Rank findings by total cost, not by the most dramatic query count:

```text
total cost = calls per second × queries per call × average DB time per query
```

A list endpoint called 300 times per second with 21 queries per call can load the database more than a nightly export with 10,000 queries. Include background jobs and exports, which do not show up in user-facing latency but still consume database capacity.

## 54. ENDPOINT QUERY SCALING MATRIX

| Endpoint / job | Calls/sec | Queries at 1 / 10 / 100 items | Growth | DB time per call | Pool wait | Pattern | Status |
|---|---:|---|---|---:|---:|---|---|

## 55. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (endpoint / resolver / job):
Trigger (request shape, page size, include/expand parameters):
Call chain (entry point -> ORM call -> SQL fingerprint):
Pattern (N+1, nested N+1, parallel N+1, duplicate query, overfetch, count per row, authorization per row, external call per row):
Scaling signature (queries and DB time at 1 / 10 / 100 items):
Rows scanned / returned:
Latency and pool impact:
Impact:
Blast radius (endpoints, tenants, concurrency):
Evidence:
Root cause:
Fix options (with trade-offs):
Benchmark before:
Benchmark after:
Verification (query-count assertion or trace):
Regression risk:
```

## 56. SEVERITY

- **P0** - repeated data access that can exhaust the database or its connection pool for the whole system and that any user or client can trigger (for example unbounded page size or GraphQL depth).
- **P1** - proven linear or worse growth on a critical, high-traffic path causing timeouts, pool exhaustion or significant database load; a loader cache that leaks data across users.
- **P2** - material latency or database cost on important endpoints, exports or jobs.
- **P3** - repetition on low-traffic paths or with small bounded inputs.
- **P4** - hardening: query-count tests, loader adoption, observability.

## 57. OUTPUT

`N_PLUS_1_EXPENSIVE_QUERY_HUNTER.md`

## 58. SECOND PASS

For every list, search, detail, export and GraphQL operation evaluate:

- query count and DB time at 1, 10 and 100 items (1,000 where safe)
- every optional relationship expansion (`include`, `expand`, GraphQL fields)
- response serialization and template rendering
- authorization lookups per row
- aggregate count and existence lookups per row
- external API calls per row
- the maximum page size and GraphQL depth a client can request
- background jobs and exports over the largest tenant

Then try to disprove each finding: is the collection actually bounded? Does a request-scoped cache or identity map already remove the repetition? Would the proposed eager load cause a row explosion?

## 59. FINAL QUALITY GATE

Do not label all multi-query flows as N+1. An N+1 defect exists when query counts or database cost scale with the number of processed items.

Before returning the report, verify that:

- each finding has a traced call chain from entry point to SQL fingerprint
- each confirmed finding has a scaling signature at several input sizes, not a single query count
- no absolute query-count threshold was used as the only argument
- nested, parallel, serializer, template, authorization and resolver paths were checked
- loader instances are request-scoped and do not bypass authorization
- proposed eager loads were checked for row explosion, and split queries were considered
- pool impact under concurrency and total database cost were considered for ranking
- external API calls per row were reported separately from database findings
- statuses and evidence tiers are applied consistently

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

Other failure chains to look for:

```text
GraphQL query: projects(first: 100) { owner { name } tasks { assignee { name } } }
↓
each field resolver loads its relation directly through the ORM
↓
1 + 100 owners + 100 task lists + (100 × 30) assignees
↓
3,201 queries for one request
↓
a client can make it worse by requesting first: 1000
```

```text
N+1 "fixed" by including orders.items and orders.comments in one join
↓
50 × 20 × 10 = 10,000 joined rows for 1,550 records
↓
response time improves locally, memory spikes in production
↓
large tenants hit out-of-memory errors
```

```text
user loader created once at application startup
↓
cache is shared by all requests and never cleared
↓
user B receives user A's cached profile data after a permission change
↓
performance fix becomes a data-exposure bug
```
