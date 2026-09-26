---
id: UPL-IT-051
number: 51
slug: ultimate-database-audit
title: Ultimate Database Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# ULTIMATE DATABASE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog database sloja aplikacije.

Glavni cilj:

> Utvrditi da li schema, constraints, relationships, indexes, queries, transactions, migrations, locking, connection pooling, isolation levels, data lifecycle, backup/recovery i application-to-database interaction mogu da izazovu data corruption, lost updates, duplicate records, cross-tenant exposure, performance collapse, deadlocks, deployment failure ili trajno narušavanje integriteta podataka.

Ovo nije:

- generički SQL checklist
- samo query performance audit
- samo index audit
- samo schema review
- automatski zahtev za normalizaciju
- automatski zahtev za denormalizaciju
- automatski zahtev za PostgreSQL/MySQL migration
- pretpostavka da ORM garantuje correctness
- savet da se svuda dodaju indexes
- savet da se sve wrap-uje u transaction

Prioritet:

**data corruption > tenant/data boundary violation > lost updates > broken constraints > unsafe migrations > deadlocks > connection exhaustion > performance cliffs > maintainability > hardening**

## 1. DATABASE INVENTORY

Utvrdite:

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

Ako nije potvrđeno:

**DATABASE TOPOLOGY NOT VERIFIED**

## 2. TABLE INVENTORY

Za svaku važnu tabelu:

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

Za svaki business entity utvrdi koji datastore je authoritative.

## 4. PRIMARY KEY

Proveri:

- type
- generation
- collisions
- sequence
- UUID semantics
- composite keys

## 5. TENANT KEY

Multi-tenant tabela bez jasnog tenant boundary-ja je high-value review surface.

## 6. FOREIGN KEY

Ne tretiraj odsustvo FK automatski kao bug.

Utvrdi da li integrity održava drugi sloj i da li to stvarno radi.

## 7. UNIQUE CONSTRAINT

Business invariant koji zahteva uniqueness ne sme se oslanjati samo na:

```text
SELECT
↓
if not exists
↓
INSERT
```

pod concurrency-jem.

## 8. NULLABILITY

Proveri da schema odgovara stvarnom domain modelu.

## 9. DEFAULTS

DB default vs application default.

## 10. ENUM

Proveri migration/backward compatibility.

## 11. CHECK CONSTRAINT

Useful za hard business invariants.

## 12. CASCADE

Audituj:

- ON DELETE CASCADE
- SET NULL
- RESTRICT

## 13. ACCIDENTAL MASS DELETE

Parent delete može obrisati veliki graph.

## 14. SOFT DELETE

Ako postoji:

- unique constraints
- query scopes
- restore
- related entities
- indexes

## 15. DELETED DATA LEAK

Default query scope mora biti konzistentan.

## 16. ARCHIVE

Archived nije automatski deleted.

## 17. TEMPORAL STATE

Created/updated/deleted timestamps.

## 18. CLOCK

DB vs application time.

## 19. MONEY

Ne koristiti floating point za precise financial amounts gde nije primereno.

## 20. CURRENCY

Amount bez currency može biti model flaw.

## 21. DECIMAL PRECISION

Overflow/truncation.

## 22. TIMEZONE

Timestamp with/without timezone semantics.

## 23. DATE-ONLY

Ne pretvaraj date-only business concept nepotrebno u timestamp.

## 24. TEXT LENGTH

Unbounded text može imati performance/storage consequences.

## 25. JSON COLUMN

Može biti validan, ali proveri:

- schema drift
- queryability
- indexes
- security fields

## 26. ARRAY COLUMN

Tradeoff, ne automatski smell.

## 27. NORMALIZATION

Traži duplicated authoritative facts.

## 28. DENORMALIZATION

Ako postoji, mora imati update/invalidation model.

## 29. MATERIALIZED VIEW

Refresh semantics.

## 30. GENERATED COLUMN

Compatibility i source authority.

## 31. INDEX INVENTORY

Pronađi:

- PK
- unique
- FK
- filter
- sort
- composite
- partial
- functional

## 32. MISSING INDEX

Evidence mora uključiti actual query pattern ili production plan.

## 33. UNUSED INDEX

Može povećavati write cost.

Ne briši samo na osnovu kratkog observation window-a.

## 34. DUPLICATE INDEX

Equivalent indexes.

## 35. COMPOSITE INDEX ORDER

Mora pratiti query predicates/order.

## 36. SELECTIVITY

Index na low-cardinality field-u nije automatski koristan.

## 37. COVERING INDEX

Koristi samo gde workload opravdava.

## 38. QUERY INVENTORY

Pronađi:

- hot paths
- expensive reports
- search
- dashboards
- background jobs
- exports

## 39. `SELECT *`

Može povećati payload/I/O, ali ne prijavljuj bez context-a.

## 40. FULL TABLE SCAN

Nije problem na maloj tabeli.

## 41. UNBOUNDED QUERY

High-value:

```text
SELECT ...
without LIMIT
```

nad velikom user-controlled result set-om.

## 42. SORT

Sort bez supporting index-a nad velikim dataset-om.

## 43. OFFSET PAGINATION

Extreme offsets mogu degradirati.

## 44. KEYSET PAGINATION

Alternative gde product/use case odgovara.

## 45. N+1

ORM loop -> query po item-u.

## 46. BULK WRITE

Row-by-row vs batched operation.

## 47. TRANSACTION

Definiši atomic business boundaries.

## 48. TOO LARGE TRANSACTION

Dugi locks, WAL/log growth, contention.

## 49. TOO SMALL TRANSACTION

Partial state.

## 50. LOST UPDATE

Read-modify-write bez concurrency protection.

## 51. OPTIMISTIC LOCK

Version column gde appropriate.

## 52. PESSIMISTIC LOCK

Only when contention model justifies.

## 53. ISOLATION LEVEL

Utvrdi actual DB default i per-transaction override.

## 54. WRITE SKEW

Snapshot/repeatable-read semantics gde relevantno.

## 55. PHANTOMS

Business invariant queries.

## 56. DEADLOCK

Proveri inconsistent lock order.

## 57. DEADLOCK RETRY

DB deadlock može biti expected concurrency outcome.

App treba bezbedno retry-ovati ako operation idempotent/retry-safe.

## 58. LOCK WAIT

Long lock can look like random latency.

## 59. `FOR UPDATE`

Use carefully.

## 60. ADVISORY LOCK

Ne koristi kao univerzalni fix.

## 61. CONNECTION POOL

Izračunaj:

```text
instances × pool per instance
```

## 62. DB MAX CONNECTIONS

Compare.

## 63. SERVERLESS

Burst connection storm.

## 64. IDLE CONNECTION

Pool configuration.

## 65. CONNECTION LEAK

Request path ne vraća connection.

## 66. TRANSACTION LEAK

Open transaction ostaje tokom external HTTP call-a.

## 67. READ REPLICA

Replication lag.

## 68. READ-AFTER-WRITE

Critical flows možda moraju primary.

## 69. REPLICA FAILOVER

App behavior.

## 70. DB FAILOVER

Connection retry semantics.

## 71. PREPARED STATEMENTS

Pooling/proxy compatibility.

## 72. STATEMENT TIMEOUT

Prevent pathological query.

## 73. LOCK TIMEOUT

Useful for avoiding indefinite waiting.

## 74. QUERY CANCELLATION

Client disconnect.

## 75. MIGRATIONS

Inventory all migration files.

## 76. MIGRATION ORDER

Deterministic.

## 77. MIGRATION IMMUTABILITY

Applied migrations should generally not be silently edited.

## 78. DESTRUCTIVE CHANGE

Drop/rename/type.

## 79. BACKFILL

Large workload.

## 80. INDEX CREATION

Lock/block semantics.

## 81. NOT NULL MIGRATION

Existing rows + old application.

## 82. ROLLBACK

Can old app work with new schema?

## 83. DATA MIGRATION

Correctness verification.

## 84. PARTIAL MIGRATION

Failure halfway.

## 85. MIGRATION CONCURRENCY

Multiple app instances.

## 86. SEED

Production safety.

## 87. TEST DATA

Do not leak into production.

## 88. BACKUP

Cross-reference DR audit.

## 89. PITR

Verify configured, not assumed.

## 90. DATA ENCRYPTION

At rest/in transit according to threat model.

## 91. DATABASE CREDENTIAL

Least privilege.

## 92. APP DB USER

Does app need DDL/drop privileges at runtime?

## 93. READ-ONLY USER

Reporting/read replica.

## 94. ROW-LEVEL SECURITY

If used:

audit policies and bypass/service roles.

## 95. RLS SERVICE ROLE

Can bypass all policies.

## 96. RLS POLICY

Tenant predicate.

## 97. SECURITY DEFINER

High-value PostgreSQL-specific review surface.

## 98. SEARCH PATH

For security-definer functions.

## 99. STORED PROCEDURE

Auth/business logic.

## 100. TRIGGER

Hidden side effects.

## 101. TRIGGER ORDER

Where engine supports multiple triggers.

## 102. AUDIT TABLE

Who can modify/delete it?

## 103. PII

Do not duplicate sensitive data unnecessarily.

## 104. RETENTION

Technical cleanup.

## 105. ARCHIVE JOB

Can cause locks/load.

## 106. DELETE BATCHING

Huge deletes can stall DB.

## 107. VACUUM/GC

Engine-specific maintenance.

## 108. TABLE BLOAT

Where relevant.

## 109. STATISTICS

Stale stats -> bad plans.

## 110. QUERY PLAN

Use actual EXPLAIN/EXPLAIN ANALYZE only in safe environment and avoid destructive/high-load production execution.

## 111. PLAN ESTIMATE ERROR

Cardinality mismatch.

## 112. PARAMETER SKEW

Same query, different values, radically different plans.

## 113. SLOW QUERY LOG

Useful evidence.

## 114. METRICS

- CPU
- IOPS
- latency
- connections
- locks
- deadlocks
- cache hit
- replication lag
- storage

## 115. ALERTING

Tie to actual failure modes.

## 116. CAPACITY

Storage growth.

## 117. AUTOGROW

Provider limits.

## 118. DISK FULL

Catastrophic DB risk.

## 119. LARGE TABLE

Growth projections.

## 120. PARTITIONING

Do not recommend without workload evidence.

## 121. SHARDING

Never recommend as default response to scale.

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
- global/irrecoverable data corruption
- practical tenant boundary collapse at DB layer
- catastrophic production deletion without usable recovery

P1:
- repeatable lost updates on critical state
- unsafe migration with concrete corruption/outage path
- connection/locking failure capable of major outage
- broken uniqueness/integrity with high business impact

P2:
- significant performance or integrity weakness

P3:
- limited DB issue

P4:
- tuning/hardening

## 124. OUTPUT

`ULTIMATE_DATABASE_AUDIT.md`

## 125. SECOND PASS

Simuliraj/anliziraj:

- two concurrent updates
- duplicate create
- parent delete
- stale replica read
- DB failover
- max pool across max replicas
- slow query under 10x rows
- migration with old+new app
- rollback after migration
- disk near capacity
- backup restore

## 126. FINAL QUALITY GATE

Proveri:

- schema
- constraints
- indexes
- query plans
- transactions
- concurrency
- connection pool
- replicas
- migrations
- permissions
- backup
- growth/capacity

# KONAČNO PRAVILO

Tražim probleme poput:

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

ili:

```text
max app replicas = 30
pool = 20
↓
potential DB connections = 600
DB limit = 250
↓
autoscaling under load accelerates database outage
```
