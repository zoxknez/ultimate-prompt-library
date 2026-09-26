---
id: UPL-IT-055
number: 55
slug: database-migration-safety-audit
title: Database Migration Safety Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# DATABASE MIGRATION SAFETY AUDIT

I want an exhaustive analysis of all database migrations and the operational procedures by which schema and data modifications enter production environments.

Main objective:

> Identify migration changes capable of acquiring exclusive table locks, crashing mixed-version deployments, losing data, resulting in partial migration states, preventing safe rollback, or causing prolonged production outages.

## 1. MIGRATION INVENTORY

For every migration:

```text
Migration:
Tool:
Schema/data:
Tables:
Estimated rows:
Potential lock:
Backward compatible:
Rollback:
```

## 2. APPLIED MIGRATION

Never edit an already-applied migration script as if it were a new change.

## 3. ORDER

Ensure deterministic execution ordering.

## 4. CONCURRENT RUNNERS

Can multiple application instances execute the same migration script concurrently?

## 5. LOCK TABLE

Evaluate DDL locking semantics for the specific database engine and version.

## 6. ADD COLUMN

Usually relatively safe, but default value assignment and backfill semantics vary widely across engines.

## 7. ADD NOT NULL

Can trigger full table scans, table rewrites, or long-held exclusive locks.

## 8. DEFAULT

Evaluate volatility functions and engine version behaviors.

## 9. DROP COLUMN

Breaks mixed-version deployments where older instances still query the dropped column.

## 10. RENAME

Utilize expand-contract phased deployment patterns.

## 11. TYPE CHANGE

Carries data rewrite, lock acquisition, and truncation risks.

## 12. ENUM CHANGE

Evaluate backward compatibility across running application fleets.

## 13. FK ADD

Validation over large tables can hold extensive shared locks.

## 14. UNIQUE ADD

Fails if existing duplicate rows are present.

## 15. CHECK CONSTRAINT

Fails if existing invalid rows violate the constraint.

## 16. INDEX CREATE

Lock duration analysis.

## 17. ONLINE/CONCURRENT

Deploy online or concurrent index creation where supported and needed.

## 18. BACKFILL

Execute data backfills in separate, bounded batches.

## 19. HUGE UPDATE

A single massive update transaction generates immense WAL/transaction log volume and holds locks indefinitely.

## 20. BATCH SIZE

Tune batch sizes appropriately.

## 21. PAUSE/THROTTLE

Introduce pauses or throttling between batches if necessary.

## 22. RESUMABILITY

Long backfills must be architected to survive interruptions.

## 23. PROGRESS

Track migration progress via persistent cursors or checkpoints.

## 24. IDEMPOTENT BACKFILL

Must be safe to rerun repeatedly.

## 25. DUAL WRITE

Mitigate data consistency hazards during dual-write phases.

## 26. DATA COPY

Verify row counts, checksums, or sampling comparisons.

## 27. OLD/NEW APP

Compatibility matrix evaluation.

## 28. ROLLBACK

Verify the old application binary operates correctly after the migration runs.

## 29. NEW DATA

Verify legacy application code can gracefully handle new enum values or data states produced by the new code.

## 30. DELETE OLD COLUMN

Only drop legacy columns after older code instances are fully decommissioned.

## 31. CONTRACT PHASE

Execute the contract phase as a distinct, subsequent release.

## 32. MIGRATION FAILURE

Handling failure midway through execution.

## 33. TRANSACTIONAL DDL

Engine-specific transactional DDL support.

## 34. NON-TRANSACTIONAL DDL

Mitigate half-applied or orphaned schema modifications.

## 35. MIGRATION RETRY

Is the failed migration safely retryable?

## 36. TIMEOUT

Prevent indefinitely blocked deployments.

## 37. LOCK TIMEOUT

Configure lock timeouts to avoid hanging migrations.

## 38. STATEMENT TIMEOUT

Configure statement timeouts on long DDL executions.

## 39. REPLICATION LAG

Heavy schema operations can cause severe replication lag on follower nodes.

## 40. DISK GROWTH

Index and table rewrites demand temporary storage headroom.

## 41. DOUBLE STORAGE

Building new indexes or rewritten tables requires substantial temporary storage capacity.

## 42. BACKUP

Backups represent a disaster recovery plan, not an excuse for executing unsafe migrations.

## 43. PITR

Verify point-in-time recovery is active prior to high-risk migrations.

## 44. DEPLOY ORDER

Determine whether migrations must execute before or after application binary rollout.

## 45. FEATURE FLAG

Decouple schema availability from functional feature activation.

## 46. MIGRATION JOB

Execute migrations via a dedicated singleton runner.

## 47. ORM AUTO-SYNC

Extremely dangerous in production if the ORM automatically mutates physical schemas.

## 48. `synchronize=true`

High-priority vulnerability check in ORM frameworks (e.g., TypeORM).

## 49. PRISMA/DRIZZLE/ALEMBIC/FLYWAY ETC.

Understand actual tool mechanics, locking behaviors, and transaction wrappers.

## 50. DRIFT

Identify drift between migration tracking tables and the live physical schema.

## 51. MANUAL HOTFIX

Hotfixes applied directly to production that are missing from migration history.

## 52. SHADOW DATABASE

Assess operational risks if the migration tooling utilizes a shadow database.

## 53. GENERATED SQL

Review the raw generated SQL statements, not merely the ORM DSL definitions.

## 54. PRODUCTION VOLUME

Validate migrations against production-scale cloned datasets or statistical profiles where feasible.

## 55. MIGRATION BENCHMARK

Benchmark lock acquisition durations and total execution times.

## 56. FINDING FORMAT

```text
ID:
Severity:
Migration:
DB/version:
Operation:
Table size:
Lock/rewrite risk:
Mixed-version risk:
Data-loss risk:
Failure path:
Evidence:
Safer rollout:
Rollback:
Validation:
```

## 57. OUTPUT

`DATABASE_MIGRATION_SAFETY_AUDIT.md`

## 58. SECOND PASS

For every destructive or large-scale migration simulate:

- old application binary running against the new schema
- new application binary running against the transitional schema
- migration failure midway through execution
- migration retry after failure
- application binary rollback
- maximum anticipated production row counts
- read replica replication lag
- disk space headroom

# FINAL RULE

Looking for issues such as:

```text
migration:
ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT 'RS'

↓
table has 400M rows
↓
actual DB/version rewrites/validates table
↓
migration runs inside deployment
↓
exclusive lock blocks traffic
↓
deployment outage
```
