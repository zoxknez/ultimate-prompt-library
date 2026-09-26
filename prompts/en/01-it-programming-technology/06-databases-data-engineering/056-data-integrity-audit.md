---
id: UPL-IT-056
number: 56
slug: data-integrity-audit
title: Data Integrity Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# DATA INTEGRITY AUDIT

I want a forensic audit of all data invariants and potential pathways through which data can become invalid, contradictory, duplicated, or mutually inconsistent.

Main objective:

> Prove where the application prevents impossible states, duplicate business effects, orphaned records, stale denormalized values, and cross-system divergence.

## 1. INVARIANT INVENTORY

Examples:

```text
email unique per tenant
stock >= 0
invoice total = sum(lines)
one active membership per user/org
payment provider ID unique
```

## 2. ENFORCEMENT LAYER

For each invariant determine the enforcement layer:

- UI
- API validator
- service layer
- database constraint
- transaction boundary
- external reconciliation process

## 3. UI ONLY

Client-side checks do not constitute data integrity enforcement.

## 4. APPLICATION CHECK ONLY

Application-level validation without database enforcement carries critical concurrency risks.

## 5. DB UNIQUE

Database-level unique constraints provide strong atomic protection.

## 6. CHECK

Database check constraints.

## 7. FK

Foreign key referential integrity.

## 8. TRANSACTION

Transactional consistency.

## 9. DUPLICATE RECORD

Concurrent entity creation races.

## 10. IDEMPOTENCY

Handling repeated external retries.

## 11. ORPHAN

Parent record deleted without cascade handling.

## 12. DANGLING REFERENCE

Logical references without foreign key constraints.

## 13. CROSS-TENANT FK

Child foreign key referencing resources belonging to a foreign tenant.

## 14. DENORMALIZED FIELD

Must maintain strict synchronization with authoritative sources.

## 15. COUNTER

`comment_count`, `balance`, `usage`.

## 16. BALANCE

Never derive critical financial balances from unchecked incremental updates without automated reconciliation.

## 17. AGGREGATE DRIFT

Aggregate calculations drifting from individual line items.

## 18. MATERIALIZED STATE

Synchronization models for materialized or cached values.

## 19. EVENTUAL CONSISTENCY

Not automatically an integrity failure.

Explicitly define the acceptable inconsistency window.

## 20. OUTBOX

Transactional outbox pattern for atomic event publishing across systems.

## 21. DUAL WRITE

Direct dual writes across databases and external third-party services.

## 22. DB + QUEUE

Database commit succeeds while message queuing fails.

## 23. QUEUE + DB

Messages delivered more than once resulting in duplicate execution.

## 24. DB + STORAGE

Database metadata and object storage state mismatches.

## 25. PAYMENT

Payment gateway charge succeeds while local database update times out.

## 26. WEBHOOK

Duplicate or out-of-order webhook delivery.

## 27. IMPORT

Partial or interrupted bulk data imports.

## 28. EXPORT

Does not mutate state, but can expose inconsistent point-in-time snapshots.

## 29. STATE MACHINE

Invalid lifecycle state transitions.

## 30. SKIP TRANSITION

Clients attempting to bypass intermediate states and set terminal statuses directly.

## 31. TERMINAL STATE

Should terminal states be strictly immutable?

## 32. RESTORE

Accidental resurrection of deleted or soft-deleted entities.

## 33. SOFT DELETE

Cascading soft-delete implications across related entities.

## 34. OWNERSHIP TRANSFER

Ensuring all dependent resource scopes update synchronously upon ownership change.

## 35. UNIQUE + SOFT DELETE

Handling uniqueness constraints on tables utilizing soft delete.

## 36. NULL

Critical relationships permitting NULL values unexpectedly.

## 37. MONEY ROUNDING

Discrepancies between individual line item rounding and overall invoice totals.

## 38. CURRENCY CONVERSION

Historical exchange rate authority and timestamp accuracy.

## 39. TIME RANGE

End dates recorded prior to start dates.

## 40. OVERLAP

Preventing overlapping reservations or subscription windows.

## 41. CAPACITY

Overbooking shared capacity under concurrency.

## 42. STOCK

Inventory falling below zero.

## 43. QUOTA

Parallel requests bypassing quota limits.

## 44. VERSION

Optimistic concurrency control enforcement.

## 45. GENERATED DATA

Can derived data be reliably recomputed from scratch?

## 46. RECONCILIATION JOB

Background jobs designed to detect and flag state drift.

## 47. CONSISTENCY CHECK

Periodic automated consistency verification queries.

## 48. CHECKSUM

Cryptographic checksum verification for data pipelines and backups.

## 49. AUDIT LOG

Immutable audit trails tracking all state mutations.

## 50. DATABASE CORRUPTION VS LOGICAL CORRUPTION

Distinguish between physical storage corruption and logical state inconsistencies.

## 51. REPAIR

Procedures for remediating corrupted or inconsistent records.

## 52. REPAIR SCRIPT

Ad-hoc repair scripts capable of exacerbating data corruption.

## 53. DATA FIX MIGRATION

Data correction migrations must remain strictly idempotent and verifiable.

## 54. FINDING FORMAT

```text
ID:
Severity:
Invariant:
Entities:
Failure path:
Concurrency involved:
Current guards:
Missing guard:
Corrupt state:
Business impact:
Detection:
Repair:
Permanent fix:
Regression test:
```

## 55. OUTPUT

`DATA_INTEGRITY_AUDIT.md`

## 56. INVARIANT MATRIX

| Invariant | DB | App | Concurrency-safe | Reconciliation |
|---|---|---|---|---|

## 57. SECOND PASS

For every critical invariant test:

- concurrent duplicate requests
- request retries
- failures occurring between two discrete write operations
- out-of-order message delivery
- stale update attempts
- parent record deletion
- cross-tenant identifier references
- restoring legacy data snapshots

# FINAL RULE

Looking for issues such as:

```text
payment provider succeeds
↓
local DB update times out
↓
client retries payment endpoint
↓
new provider charge is created
↓
user charged twice
↓
local records still look valid individually
↓
business integrity violated
```
