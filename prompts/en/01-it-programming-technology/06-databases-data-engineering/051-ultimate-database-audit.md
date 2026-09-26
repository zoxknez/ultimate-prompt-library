---
id: UPL-IT-051
number: 51
slug: ultimate-database-audit
title: Ultimate Database Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# ULTIMATE DATABASE AUDIT

I want an in-depth, systematic, evidence-first, and production-oriented analysis of the entire application database layer.

Main objective:

> Determine whether the schema, constraints, relationships, indexes, queries, transactions, migrations, locking, connection pooling, isolation levels, data lifecycle, backup/recovery, and application-to-database interactions can cause data corruption, lost updates, duplicate records, cross-tenant exposure, performance collapse, deadlocks, deployment failures, or permanent compromise of data integrity.

This is not:

- a generic SQL checklist
- solely a query performance audit
- solely an index audit
- solely a schema review
- an automatic demand for normalization
- an automatic demand for denormalization
- an automatic demand to migrate to PostgreSQL/MySQL
- an assumption that an ORM guarantees correctness
- advice to blindly add indexes everywhere
- advice to wrap every operation in a transaction

Priority:

**data corruption > tenant/data boundary violation > lost updates > broken constraints > unsafe migrations > deadlocks > connection exhaustion > performance cliffs > maintainability > hardening**

## 1. DATABASE INVENTORY

Determine:

- engine
- version
- deployment topology
- primary/replicas
- schemas/databases
- extensions
- ORM
- connection pool
- migration tool
- backup/PITR
- read replicas
- caches

If not verified:

**DATABASE TOPOLOGY NOT VERIFIED**

## 2. TABLE INVENTORY

For every critical table:

```text
Table:
Purpose:
Primary key:
Tenant key:
Owner key:
Foreign keys:
Unique constraints:
Indexes:
High-volume:
Write frequency:
Retention:
```

## 3. SOURCE OF TRUTH

For each business entity, establish which datastore is authoritative.

## 4. PRIMARY KEY

Verify:

- type
- generation strategy
- collision resistance
- sequence limits
- UUID semantics
- composite keys

## 5. TENANT KEY

A multi-tenant table lacking an explicit tenant boundary is a high-value review surface.

## 6. FOREIGN KEY

Do not automatically treat the absence of a foreign key as a bug.

Determine whether integrity is enforced by another layer and whether that mechanism truly functions.

## 7. UNIQUE CONSTRAINT

A business invariant requiring uniqueness must not rely solely on:

```text
SELECT
↓
if not exists
↓
INSERT
```

under concurrency.

## 8. NULLABILITY

Verify that the schema accurately reflects the actual domain model.

## 9. DEFAULTS

Database defaults vs application-level defaults.

## 10. ENUM

Verify migration and backward compatibility implications.

## 11. CHECK CONSTRAINT

Useful for enforcing hard business invariants.

## 12. CASCADE

Audit:

- ON DELETE CASCADE
- SET NULL
- RESTRICT

## 13. ACCIDENTAL MASS DELETE

Parent record deletion can inadvertently purge an extensive relation graph.

## 14. SOFT DELETE

If present:

- unique constraints
- query scopes
- restoration logic
- related entities
- index coverage

## 15. DELETED DATA LEAK

Default query scopes must be uniformly enforced.

## 16. ARCHIVE

Archived state is not automatically deleted state.

## 17. TEMPORAL STATE

Created, updated, and deleted timestamps.

## 18. CLOCK

Database time vs application runtime time.

## 19. MONEY

Never use floating-point types for precise financial amounts where inappropriate.

## 20. CURRENCY

An amount missing an explicit currency designator can be an architectural flaw.

## 21. DECIMAL PRECISION

Numeric overflow and truncation risks.

## 22. TIMEZONE

Timestamp with vs without timezone semantics.

## 23. DATE-ONLY

Do not unnecessarily convert date-only business concepts into timestamps.

## 24. TEXT LENGTH

Unbounded text columns can carry substantial storage and performance consequences.

## 25. JSON COLUMN

Can be valid, but verify:

- schema drift
- queryability
- index strategies
- security-sensitive attributes

## 26. ARRAY COLUMN

An architectural trade-off, not automatically an anti-pattern.

## 27. NORMALIZATION

Identify duplicate authoritative facts.

## 28. DENORMALIZATION

If employed, must possess an explicit synchronization and invalidation model.

## 29. MATERIALIZED VIEW

Refresh mechanisms and concurrency impact.

## 30. GENERATED COLUMN

Engine compatibility and source authority.

## 31. INDEX INVENTORY

Identify:

- primary keys
- unique constraints
- foreign keys
- filter predicates
- sort orders
- composite indexes
- partial indexes
- functional expressions

## 32. MISSING INDEX

Evidence must incorporate actual query patterns or production execution plans.

## 33. UNUSED INDEX

Can increase write amplification.

Do not prune based solely on a brief observation window.

## 34. DUPLICATE INDEX

Completely redundant indexes.

## 35. COMPOSITE INDEX ORDER

Must align with query predicate selectivity and sort orders.

## 36. SELECTIVITY

An index on a low-cardinality column is not automatically beneficial.

## 37. COVERING INDEX

Deploy only where the workload explicitly justifies the overhead.

## 38. QUERY INVENTORY

Identify:

- hot paths
- expensive analytical reports
- search queries
- reporting dashboards
- background workers
- data export pipelines

## 39. `SELECT *`

Can inflate payload size and network I/O, but do not flag without context.

## 40. FULL TABLE SCAN

Not problematic on small lookup tables.

## 41. UNBOUNDED QUERY

High-value finding:

```text
SELECT ...
without LIMIT
```

executed against large, user-controlled result sets.

## 42. SORT

Explicit sorting without supporting index structures on large tables.

## 43. OFFSET PAGINATION

High offsets induce severe performance degradation.

## 44. KEYSET PAGINATION

Preferred alternative where product requirements permit.

## 45. N+1

ORM loop yielding a distinct query per parent item.

## 46. BULK WRITE

Row-by-row iteration vs batched or multi-row writes.

## 47. TRANSACTION

Define crisp, atomic business boundaries.

## 48. TOO LARGE TRANSACTION

Prolonged lock retention, WAL/undo log growth, and heavy contention.

## 49. TOO SMALL TRANSACTION

Inadvertent partial state persistence upon failure.

## 50. LOST UPDATE

Read-modify-write sequences lacking concurrency controls.

## 51. OPTIMISTIC LOCK

Version or timestamp column where appropriate.

## 52. PESSIMISTIC LOCK

Deploy only when the contention profile explicitly warrants it.

## 53. ISOLATION LEVEL

Determine the actual database default and any per-transaction overrides.

## 54. WRITE SKEW

Snapshot and repeatable-read isolation semantics where relevant.

## 55. PHANTOMS

Queries validating business invariants against concurrent insertions.

## 56. DEADLOCK

Investigate inconsistent lock acquisition ordering.

## 57. DEADLOCK RETRY

Deadlocks can represent expected concurrency outcomes.

The application must safely retry if the operation is idempotent and retry-safe.

## 58. LOCK WAIT

Prolonged lock contention can manifest as intermittent application latency.

## 59. `FOR UPDATE`

Employ with caution and tight row-locking scopes.

## 60. ADVISORY LOCK

Do not treat advisory locks as a universal concurrency panacea.

## 61. CONNECTION POOL

Calculate:

```text
instances × pool per instance
```

## 62. DB MAX CONNECTIONS

Compare aggregate pool allocation against database limits.

## 63. SERVERLESS

Connection burst storms exhausting database capacity.

## 64. IDLE CONNECTION

Pool idle timeout and reaping configurations.

## 65. CONNECTION LEAK

Request codepaths failing to release pooled connections.

## 66. TRANSACTION LEAK

Open transactions persisting across outbound external HTTP calls.

## 67. READ REPLICA

Replication lag implications.

## 68. READ-AFTER-WRITE

Critical operational flows may mandate primary node routing.

## 69. REPLICA FAILOVER

Application recovery and failover behavior.

## 70. DB FAILOVER

Connection retry semantics during primary failovers.

## 71. PREPARED STATEMENTS

Compatibility with connection pooling proxies (e.g., PgBouncer transaction mode).

## 72. STATEMENT TIMEOUT

Safeguard against runaway or pathological queries.

## 73. LOCK TIMEOUT

Essential for preventing indefinite lock acquisition hangs.

## 74. QUERY CANCELLATION

Handling client disconnect events.

## 75. MIGRATIONS

Inventory all database migration files.

## 76. MIGRATION ORDER

Ensure fully deterministic execution ordering.

## 77. MIGRATION IMMUTABILITY

Applied migrations should never be altered silently.

## 78. DESTRUCTIVE CHANGE

Column drops, renames, and type mutations.

## 79. BACKFILL

Managing large-scale data transformation workloads.

## 80. INDEX CREATION

Table locking and blocking semantics during builds.

## 81. NOT NULL MIGRATION

Handling existing rows and compatibility with older application code.

## 82. ROLLBACK

Can the previous application binary function against the migrated schema?

## 83. DATA MIGRATION

Verification of data transformation correctness.

## 84. PARTIAL MIGRATION

Handling failures midway through migration execution.

## 85. MIGRATION CONCURRENCY

Managing concurrent execution across multiple application instances.

## 86. SEED

Ensuring seed scripts are safe against production environments.

## 87. TEST DATA

Prevent test data leakage into production environments.

## 88. BACKUP

Cross-reference disaster recovery audit requirements.

## 89. PITR

Verify point-in-time recovery is active, not merely assumed.

## 90. DATA ENCRYPTION

Encryption at rest and in transit per the threat model.

## 91. DATABASE CREDENTIAL

Enforce least privilege principles.

## 92. APP DB USER

Does the runtime application user require DDL or DROP permissions?

## 93. READ-ONLY USER

Dedicated accounts for analytical reporting and read replicas.

## 94. ROW-LEVEL SECURITY

If utilized:

audit policies, service accounts, and bypass mechanisms.

## 95. RLS SERVICE ROLE

Can bypass all row-level security policies.

## 96. RLS POLICY

Tenant isolation predicate correctness.

## 97. SECURITY DEFINER

High-value PostgreSQL-specific privilege escalation review surface.

## 98. SEARCH PATH

Fix search paths on security-definer functions.

## 99. STORED PROCEDURE

Authentication and encapsulated business logic reviews.

## 100. TRIGGER

Hidden side effects executing implicitly.

## 101. TRIGGER ORDER

Execution ordering where the engine supports multiple triggers.

## 102. AUDIT TABLE

Permissions governing modification or deletion of audit logs.

## 103. PII

Avoid redundant duplication of personally identifiable information.

## 104. RETENTION

Automated technical cleanup and purging policies.

## 105. ARCHIVE JOB

Can induce severe locking and I/O load.

## 106. DELETE BATCHING

Unbatched mass deletions stalling database performance.

## 107. VACUUM/GC

Engine-specific maintenance mechanisms.

## 108. TABLE BLOAT

Bloat monitoring where applicable.

## 109. STATISTICS

Stale optimizer statistics generating suboptimal execution plans.

## 110. QUERY PLAN

Execute EXPLAIN or EXPLAIN ANALYZE only in safe environments, avoiding destructive operations on production.

## 111. PLAN ESTIMATE ERROR

Cardinality estimation mismatches.

## 112. PARAMETER SKEW

Same query shape with differing parameters yielding radically different plans.

## 113. SLOW QUERY LOG

Essential empirical evidence.

## 114. METRICS

- CPU utilization
- IOPS
- query latency
- connection counts
- lock waits
- deadlock frequency
- buffer cache hit ratio
- replication lag
- storage growth

## 115. ALERTING

Align alerts with concrete operational failure modes.

## 116. CAPACITY

Predictable storage volume growth.

## 117. AUTOGROW

Provider storage autogrowth ceilings.

## 118. DISK FULL

Catastrophic database outage scenario.

## 119. LARGE TABLE

Growth projection modeling.

## 120. PARTITIONING

Do not recommend partitioning without concrete query and maintenance workload evidence.

## 121. SHARDING

Never recommend sharding as the default response to scaling.

## 122. FINDING FORMAT

```text
ID:
Severity:
Category:
Database:
Schema/Table:
Query/Transaction:
Evidence tier:
Trigger:
Failure path:
Data impact:
Performance impact:
Blast radius:
Evidence:
Root cause:
Fix:
Regression test:
Production verification:
Complexity:
```

## 123. SEVERITY

P0:
- global or irrecoverable data corruption
- practical tenant boundary collapse at the database layer
- catastrophic production deletion lacking viable recovery paths

P1:
- repeatable lost updates on critical state
- unsafe migration with a concrete corruption or outage path
- connection pooling or locking failures capable of triggering major outages
- broken uniqueness or integrity constraints with significant business impact

P2:
- significant performance bottlenecks or integrity weaknesses

P3:
- limited scope database defects

P4:
- tuning and hardening suggestions

## 124. OUTPUT

`ULTIMATE_DATABASE_AUDIT.md`

## 125. SECOND PASS

Simulate or analyze:

- two concurrent updates to identical rows
- duplicate entity creation attempts
- parent record deletion cascading
- reading stale data from a replica
- database failover handling
- maximum connection pool allocation across autoscaled replicas
- slow query performance scaled to 10x row volume
- migrations running concurrently across old and new application instances
- rollback execution following schema migration
- disk storage approaching maximum capacity
- database backup restoration in an isolated sandbox

## 126. FINAL QUALITY GATE

Verify:

- schema definitions
- constraint completeness
- index alignment
- query plans
- transaction boundaries
- concurrency safeguards
- connection pool sizing
- replica synchronization
- migration safety
- credential permissions
- backup and recovery readiness
- capacity and growth planning

# FINAL RULE

Looking for issues such as:

```text
checkout flow:
SELECT stock
↓
stock = 1

Request A and B both read 1
↓
both write stock = 0
↓
two orders created
↓
inventory invariant violated
```

or:

```text
max app replicas = 30
pool = 20
↓
potential DB connections = 600
DB limit = 250
↓
autoscaling under load accelerates database outage
```
