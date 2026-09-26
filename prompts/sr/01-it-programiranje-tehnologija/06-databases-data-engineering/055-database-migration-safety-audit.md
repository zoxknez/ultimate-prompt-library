---
id: UPL-IT-055
number: 55
slug: database-migration-safety-audit
title: Database Migration Safety Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# DATABASE MIGRATION SAFETY AUDIT

Želim maksimalno duboku analizu svih database migrations i procedure kojom schema/data changes ulaze u production.

Glavni cilj:

> Pronaći migration promene koje mogu zaključati velike tabele, oboriti mixed-version deployment, izgubiti podatke, napraviti partial migration, onemogućiti rollback ili proizvesti dug production outage.

## 1. MIGRATION INVENTORY

Za svaku:

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

Ne edituj already-applied migration kao da je nova.

## 3. ORDER

Deterministic.

## 4. CONCURRENT RUNNERS

Može li više app instances pokrenuti istu migration?

## 5. LOCK TABLE

Proceni DDL semantics za actual DB/version.

## 6. ADD COLUMN

Usually safe-ish, but default/backfill semantics vary.

## 7. ADD NOT NULL

Potential table scan/rewrite/block.

## 8. DEFAULT

Volatility/engine version.

## 9. DROP COLUMN

Mixed version break.

## 10. RENAME

Use expand-contract.

## 11. TYPE CHANGE

Data rewrite/truncation.

## 12. ENUM CHANGE

Backward compatibility.

## 13. FK ADD

Validation over large table.

## 14. UNIQUE ADD

Existing duplicates.

## 15. CHECK CONSTRAINT

Existing invalid rows.

## 16. INDEX CREATE

Lock duration.

## 17. ONLINE/CONCURRENT

Use where supported and needed.

## 18. BACKFILL

Separate bounded batches.

## 19. HUGE UPDATE

One transaction can generate enormous WAL/log and locks.

## 20. BATCH SIZE

Tune.

## 21. PAUSE/THROTTLE

If needed.

## 22. RESUMABILITY

Long backfill should survive interruption.

## 23. PROGRESS

Track cursor/checkpoint.

## 24. IDEMPOTENT BACKFILL

Rerun safe.

## 25. DUAL WRITE

Consistency hazards.

## 26. DATA COPY

Verify counts/checksum/sample.

## 27. OLD/NEW APP

Matrix.

## 28. ROLLBACK

Old binary after migration.

## 29. NEW DATA

Old code handling values created by new code.

## 30. DELETE OLD COLUMN

Only after old code is gone.

## 31. CONTRACT PHASE

Separate release.

## 32. MIGRATION FAILURE

Halfway.

## 33. TRANSACTIONAL DDL

DB-specific.

## 34. NON-TRANSACTIONAL DDL

Partial state.

## 35. MIGRATION RETRY

Safe?

## 36. TIMEOUT

Avoid indefinitely blocked deploy.

## 37. LOCK TIMEOUT

## 38. STATEMENT TIMEOUT

## 39. REPLICATION LAG

Heavy migration may overload replica.

## 40. DISK GROWTH

Index/table rewrite needs temporary space.

## 41. DOUBLE STORAGE

Build new index/table can require substantial headroom.

## 42. BACKUP

Recovery plan, not excuse.

## 43. PITR

## 44. DEPLOY ORDER

Migration before/after app.

## 45. FEATURE FLAG

Can separate behavior activation.

## 46. MIGRATION JOB

Dedicated singleton.

## 47. ORM AUTO-SYNC

Dangerous in production if it auto-mutates schema unexpectedly.

## 48. `synchronize=true`

High-priority in ORM frameworks where applicable.

## 49. PRISMA/DRIZZLE/ALEMBIC/FLYWAY ETC.

Understand actual tool semantics.

## 50. DRIFT

Migration history vs live schema.

## 51. MANUAL HOTFIX

Not represented in migration.

## 52. SHADOW DATABASE

If migration tool uses one.

## 53. GENERATED SQL

Review actual SQL, not only ORM DSL.

## 54. PRODUCTION VOLUME

Test using production-scale clone/statistics if possible.

## 55. MIGRATION BENCHMARK

Duration + lock.

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

For every destructive/large migration simulate:

- old app + new schema
- new app + transitional schema
- failure halfway
- retry
- rollback binary
- max production row count
- replica lag
- disk headroom

# KONAČNO PRAVILO

Tražim:

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
