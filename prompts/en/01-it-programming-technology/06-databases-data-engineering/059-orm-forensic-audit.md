---
id: UPL-IT-059
number: 59
slug: orm-forensic-audit
title: ORM Forensic Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.1.0
status: stable
---

# ORM FORENSIC AUDIT

I want an exhaustive forensic audit of the ORM and data-access layer, without assuming the ORM automatically guarantees correctness, security, or performance.

Apply to the actual ORM in use:

- Prisma
- Drizzle
- TypeORM
- Sequelize
- Hibernate
- EF Core
- SQLAlchemy
- Django ORM
- Room
- others

## 1. OBJECTIVE AND NON-GOALS

Prove where the ORM and data-access layer produce SQL, transactions or data states that differ from what the code appears to express: queries that escape tenant or soft-delete scope, writes outside the intended transaction, filters that silently disappear, stale entities overwriting newer data, and unsafe raw SQL.

Non-goals:

- recommending a different ORM
- general SQL performance tuning (only where ORM behavior generates the problem)
- style preferences about repository patterns or query builders
- treating every raw SQL call or lazy relation as a defect

## 2. ORM DETECTION

Establish before any conclusion:

```text
ORM and exact version:
Database driver / adapter and version:
Generated client or model classes (and how they are regenerated):
Connection pooling (driver, ORM, external proxy):
Transaction API used in the codebase:
Global filters, middleware, extensions or interceptors in use:
Migration tool and whether schema sync / push is possible in production:
Runtime (long-lived server, serverless, edge):
```

ORM semantics change between major versions (how undefined values are treated, default loading, upsert behavior, transaction propagation). State the version before stating any behavior, and confirm critical behavior by inspecting the generated SQL.

## 3. EVIDENCE MODEL

```text
A - observed: generated SQL captured from logs or tests, or the wrong behavior reproduced
B - complete path: code path traced from input to ORM call, with version-specific semantics confirmed in documentation or source
C - strong static evidence: a risky ORM pattern in code, but semantics or reachability not fully confirmed
D - inference: plausible behavior depending on version or configuration
E - hardening: safer pattern where the current code is not exploitable or incorrect
```

## 4. FINDING STATUS

- **CONFIRMED** - generated SQL or reproduced behavior shows the problem (tier A or B).
- **LIKELY** - strong static evidence (tier C).
- **NOT VERIFIED** - depends on ORM version, configuration or runtime behavior that could not be checked.
- **NOT APPLICABLE** - the pattern does not occur with this ORM or version.
- **CONTROLLED** - the risk exists but is neutralized (validated input, whitelisted identifiers, database constraints).
- **HARDENING** - safer alternative without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete injection, data-scope, transaction, correctness or availability path.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- Raw SQL is not automatically SQL injection: parameterized raw queries and tagged-template APIs that bind values are safe for values.
- Lazy loading is not N+1 until an actual code path accesses the relation repeatedly for many parents.
- `findById(id)` is not automatically an authorization defect if tenant or ownership is enforced by a global filter, a row-level security policy or a preceding check that you have verified.
- ORM-level cascades or defaults that differ from database ones are not defects if nothing relies on the database behavior.
- Returning ORM entities from an API is not automatically a data leak if the serializer explicitly selects fields.
- A bulk operation that skips hooks is not a defect if no hook contains required logic.

## 6. ORM INVENTORY

```text
ORM:
Version:
Models:
Migration tool:
Lazy loading:
Transactions:
Raw SQL support:
Connection pool:
```

## 7. MODEL -> SCHEMA DRIFT

Compare the ORM model against the live migration and physical database schema definitions.

## 8. NULLABILITY

Code flags attribute as required while the database schema permits nulls, or vice versa.

## 9. DEFAULT

ORM-level defaults vs database-level defaults.

## 10. ENUM

Enum mapping and synchronization across application code and the database.

## 11. RELATION

Foreign key mapping and referential behavior.

## 12. CASCADE

Application-side ORM cascades do not necessarily match database-level cascade triggers.

## 13. ORPHAN REMOVAL

Handling orphaned child records upon parent detachment.

## 14. SOFT DELETE

Default query filter scope enforcement across relationships.

## 15. TENANT SCOPE

Global query middleware, extensions, and hooks enforcing tenant boundaries.

## 16. `findById(id)`

High-value review target if tenant or ownership scoping is required.

## 17. GLOBAL FILTER

Can be bypassed by raw SQL queries or secondary repository interfaces.

## 18. ADMIN BYPASS

Administrative query bypasses must be explicit and auditable.

## 19. GLOBAL FILTER BYPASS PATHS

Tenant and soft-delete filters implemented in the ORM (middleware, extensions, default scopes, interceptors) protect only the queries that pass through them. Check every other path:

- raw SQL and query-builder calls
- an alternate repository, a second client instance or a "system" client
- relation loaders and includes (does the filter apply to related rows, not only the root?)
- aggregate, count, exists and group-by queries
- bulk updates and deletes
- admin tools, background jobs and scripts that construct their own client
- database views, functions and triggers

For every bypass, show whether a caller-controlled ID can reach another tenant's or a deleted row.

## 20. MASS ASSIGNMENT

Unsanitized request payloads spread directly into ORM entity creation or updates.

## 21. HIDDEN FIELD

Accidental mutation of role, tenant_id, or owner_id attributes.

## 22. SELECT

Default projection selecting sensitive or internal fields.

## 23. SERIALIZATION

Returning raw ORM entity models directly across API responses.

## 24. LAZY LOADING

Unexpected lazy loading triggering N+1 query patterns.

## 25. EAGER LOADING

Aggressive eager loading causing Cartesian join explosions.

## 26. RELATION INCLUDE

Overfetching unneeded relationship graphs.

## 27. RAW SQL

Parameterization and injection risks within raw query interfaces.

## 28. RAW IDENTIFIER

Dynamic concatenation in sort clauses, table names, or column identifiers.

## 29. UNSAFE ESCAPE API

ORM-specific unsafe string escaping functions.

## 30. VALUES VS IDENTIFIERS

Parameters protect **values**, not **identifiers**. A query can bind every value correctly and still be injectable through:

- a column name used for sorting or filtering (`ORDER BY ${sortField}`)
- a table or schema name selected at runtime (multi-tenant schemas)
- a JSON path or operator built from input
- raw fragments passed to "unsafe" ORM helpers

Every dynamic identifier must come from a fixed whitelist mapped in code, never from the request directly. Check escaping helpers for the specific ORM and version.

## 31. TRANSACTION API

Does the callback truly execute against the transactional client instance?

## 32. TRANSACTION LEAK

Code invoking the global ORM client within an open transaction callback.

Example:

```text
transaction(tx => {
  tx.order.update(...)
  globalClient.audit.create(...)
})
```

The second write may not participate in the transaction.

## 33. ASYNC TRANSACTION

Awaiting external network calls within open database transactions.

## 34. TRANSACTION CLIENT PROPAGATION

Writes participate in a transaction only if they use the transaction's client or context. Trace every write called inside a transaction callback:

- helper functions and services that import the global client instead of receiving the transaction client
- repositories instantiated once with the global client
- event handlers, hooks or audit loggers triggered inside the callback
- async context propagation (does the ORM rely on async-local storage, and does it survive the code path?)
- nested service calls that open their own transaction

For each write, state whether it commits or rolls back together with the rest, and what inconsistent state results if it does not.

## 35. NESTED TRANSACTION

ORM-specific nested transaction and savepoint semantics.

## 36. SAVEPOINT

Savepoint handling during partial transaction failures.

## 37. ISOLATION

Actual transaction isolation level configurations.

## 38. RETRY

Automatic client-side query retry behaviors on transient errors.

## 39. UPSERT

Concurrency semantics and race condition handling during upserts.

## 40. `connectOrCreate`

Potential race conditions depending on underlying unique constraints.

## 41. FIRST OR CREATE

Non-atomic check-then-insert patterns.

## 42. BULK CREATE

Handling partial failures during multi-row insertions.

## 43. `updateMany/deleteMany`

Missing or malformed WHERE filter conditions.

## 44. EMPTY FILTER

Critical failure scenario:

```text
deleteMany({})
```

## 45. UNDEFINED FILTER

Some ORMs silently ignore undefined filter properties.

Severe security and correctness risk.

## 46. NULL VS UNDEFINED

Critical semantic differences in JavaScript/TypeScript ORMs.

## 47. UNDEFINED AND NULL IN FILTERS

In several JavaScript/TypeScript ORMs, a filter property whose value is `undefined` is dropped instead of matching nothing. Verify for the detected ORM and version:

```text
tenantId = req.user.tenantId      // undefined for a misconfigured service token
deleteMany({ where: { tenantId } })
↓
where clause becomes empty
↓
rows of every tenant are deleted
```

Check every filter built from optional input, session data or configuration: `where`, `updateMany`, `deleteMany`, `count`, and relation filters. Also check how `null` differs from `undefined` in updates (setting a column to NULL vs leaving it unchanged).

## 48. DYNAMIC WHERE

Spreading arbitrary request objects into query predicates.

## 49. DYNAMIC ORDER

Dynamic sorting without column whitelist validation.

## 50. PAGINATION

ORM offset pagination implementation efficiency.

## 51. COUNT

Executing expensive full counts during pagination.

## 52. RELATION COUNT

N+1 queries executed to compute related record counts.

## 53. QUERY GENERATION

Inspect actual generated SQL rather than relying on ORM DSL intent.

## 54. PARAMETER TYPES

Implicit type casting causing index bypasses.

## 55. DATE CONVERSION

Timezone conversion handling.

## 56. DECIMAL

ORM returning decimal values as strings or specialized objects.

## 57. BIGINT

JavaScript 64-bit integer overflow issues.

## 58. JSON

Typed code models vs arbitrary runtime JSON payloads.

## 59. MIGRATION AUTO-GENERATION

Review the physical SQL generated by automated migration tools.

## 60. SCHEMA PUSH/SYNC

Destructive schema synchronization running against production databases.

## 61. CLIENT GENERATION

Stale or out-of-sync generated ORM client code.

## 62. CONNECTION MANAGEMENT

Singleton clients vs per-request client instantiations.

## 63. SERVERLESS

Spawning fresh ORM connection pools on every serverless invocation exhausting the database.

## 64. HOT RELOAD

Development server hot-reloading leaking database connections.

## 65. CONNECTION LEAK

Leaked connections holding pool slots indefinitely.

## 66. POOL

Driver-level pooling vs ORM-level pool configurations.

## 67. PREPARED STATEMENT

Compatibility with connection pooling proxies (e.g., PgBouncer).

## 68. QUERY TIMEOUT

Missing query execution timeouts.

## 69. CANCELLATION

Handling query cancellation upon client disconnect.

## 70. ERROR MAPPING

Accurate mapping of database constraint, foreign key, and deadlock errors.

## 71. RETRYABLE ERROR

Identifying genuinely transient, retryable database errors.

## 72. ERROR MAPPING AND RETRY DECISIONS

For each database error class, check what the application does:

```text
unique violation        -> conflict response or idempotent success, never a generic 500 that the client retries
foreign key violation   -> validation error or not-found, depending on the cause
serialization failure   -> retry the whole transaction (bounded, with backoff)
deadlock                -> retry the whole transaction (bounded, with backoff)
timeout / cancellation  -> do not blindly retry non-idempotent writes; the first attempt may have committed
connection error        -> retry only if the operation is idempotent or known not to have executed
```

Check that errors are matched by the driver's stable error codes, not by message text, and that retries do not repeat side effects.

## 73. NOT FOUND

Consistent handling of entity not found conditions.

## 74. OPTIMISTIC CONCURRENCY

Version field handling in optimistic locking workflows.

## 75. CHANGE TRACKING

Stale entity state in unit-of-work tracking engines.

## 76. FIRST-LEVEL CACHE

First-level session cache behavior and scope.

## 77. SECOND-LEVEL CACHE

Cache staleness and invalidation failures.

## 78. DIRTY CHECKING

Implicit dirty checking triggering unintended update queries.

## 79. PARTIAL UPDATE

Partial updates inadvertently overwriting concurrent modifications.

## 80. ENTITY MERGE

Merging detached entity graphs into active sessions.

## 81. UNIT OF WORK AND STALE ENTITIES

In ORMs with an identity map or change tracking, check how long-lived entities are written back:

- an entity loaded at the start of a request (or cached across requests) and saved at the end writes **all** tracked columns, overwriting changes other writers made in between
- detached entities merged back into a session can resurrect deleted rows or revert newer values
- dirty checking can issue UPDATEs nobody intended (for example after a type conversion changes a value)
- the first-level cache can return a stale entity inside one session after another session changed the row

Prefer partial updates of explicitly changed fields or optimistic version checks for entities that are edited concurrently.

## 82. BATCHING

Verifying whether the ORM truly batches write statements.

## 83. LOGGING

Queries inadvertently logging sensitive PII.

## 84. SENSITIVE PARAMETER LOGGING

Development parameter logging remaining active in production.

## 85. ORM FEATURE / RISK MATRIX

| ORM feature | Used where | Version-specific behavior checked | Risk (scope, injection, transaction, stale write, performance) | Guard | Status |
|---|---|---|---|---|---|

## 86. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
ORM / version:
Scope (model, call site):
Trigger (input, job, request):
Current behavior (code and generated SQL):
Transaction context:
Expected behavior:
Failure / exploit path:
Impact (data scope, security, correctness, performance):
Blast radius:
Evidence:
Root cause:
Fix:
Verification (generated-SQL assertion, test):
Regression risk:
```

## 87. SEVERITY

- **P0** - injection, cross-tenant access or mass data modification/deletion reachable from external input (for example an undefined filter in `deleteMany` or a raw identifier from the request).
- **P1** - writes outside the intended transaction on critical flows, tenant or soft-delete filter bypass on sensitive data, schema sync against production, or stale-entity overwrites of important data.
- **P2** - material correctness or performance defects caused by ORM behavior on important paths (wrong error mapping causing retries of committed writes, lazy-loading explosions, precision loss).
- **P3** - limited issues on secondary paths.
- **P4** - hardening: safer APIs, generated-SQL tests, logging hygiene.

## 88. OUTPUT

`ORM_FORENSIC_AUDIT.md`

## 89. SECOND PASS

Search the repository for, and inspect the generated SQL of:

- raw SQL interfaces and unsafe string interpolation
- dynamic identifiers (sort, filter, table, schema)
- `findUnique` / `findById` invocations on tenant-scoped models
- `updateMany` / `deleteMany` operations and every filter built from optional values
- object spreading into create and update calls
- transaction callbacks and every write inside them
- relation includes and lazy access inside loops
- per-request or per-invocation client initialization
- places where entities are cached or kept across requests

Then try to disprove each finding: does a global filter, database constraint or row-level security policy already block it? Does this ORM version still behave this way?

## 90. FINAL QUALITY GATE

Verify actual generated SQL and ORM version-specific semantics prior to raising critical findings.

Before returning the report, verify that:

- the ORM, driver and versions are identified
- every critical finding includes or references the generated SQL
- tenant and soft-delete filters were checked on raw queries, alternate clients, relations, aggregates and bulk operations
- dynamic identifiers were checked separately from bound values
- every write inside a transaction callback was checked for client propagation
- filters built from optional values were checked for undefined/null semantics
- error mapping and retry behavior were checked for committed-but-timed-out writes
- stale-entity and partial-update overwrites were considered for concurrently edited models
- connection lifecycle was checked for the runtime (serverless, hot reload, proxies)
- raw SQL and lazy loading were not reported without a concrete failure path
- statuses and evidence tiers are applied consistently

# FINAL RULE

Looking for:

```text
transaction(async tx => {
  await tx.orders.create(...)
  await sendPayment(...)
  await prisma.auditLog.create(...)
})

↓
auditLog uses global prisma client
↓
not part of transaction

↓
later transaction rollback
↓
audit log claims order exists
↓
database state diverges
```

Other failure chains to look for:

```text
tenant filter implemented as ORM middleware on findMany/findFirst
↓
reporting endpoint uses a raw aggregate query with a tenantId from the URL
↓
middleware does not apply to raw queries
↓
any authenticated user can read revenue totals of other tenants
```

```text
edit form loads the order entity, user edits notes for 10 minutes
↓
meanwhile the payment webhook sets status = PAID
↓
form submit calls save(order) with the full stale entity
↓
status is written back to PENDING
↓
paid order is shipped again or cancelled by a cleanup job
```
