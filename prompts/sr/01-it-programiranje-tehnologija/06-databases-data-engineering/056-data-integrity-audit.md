---
id: UPL-IT-056
number: 56
slug: data-integrity-audit
title: Data Integrity Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# DATA INTEGRITY AUDIT

Želim forenzički audit svih invariants i puteva kojima podaci mogu postati nevalidni, kontradiktorni, duplicirani ili međusobno neusaglašeni.

Glavni cilj:

> Dokazati gde aplikacija sprečava impossible states, duplicate business effects, orphaned data, stale denormalized values i cross-system divergence.

## 1. INVARIANT INVENTORY

Primer:

```text
email unique per tenant
stock >= 0
invoice total = sum(lines)
one active membership per user/org
payment provider ID unique
```

## 2. ENFORCEMENT LAYER

Za svaki:

- UI
- API validator
- service
- DB constraint
- transaction
- external reconciliation

## 3. UI ONLY

Nije integrity enforcement.

## 4. APPLICATION CHECK ONLY

Concurrency risk.

## 5. DB UNIQUE

Strong atomic guard.

## 6. CHECK

## 7. FK

## 8. TRANSACTION

## 9. DUPLICATE RECORD

Concurrent create.

## 10. IDEMPOTENCY

External retry.

## 11. ORPHAN

Parent deleted.

## 12. DANGLING REFERENCE

Logical ID without FK.

## 13. CROSS-TENANT FK

Child ID references resource from another tenant.

## 14. DENORMALIZED FIELD

Must stay synchronized.

## 15. COUNTER

`comment_count`, `balance`, `usage`.

## 16. BALANCE

Never derive critical money state from unsafe incremental writes without reconciliation.

## 17. AGGREGATE DRIFT

## 18. MATERIALIZED STATE

## 19. EVENTUAL CONSISTENCY

Not automatically integrity failure.

Define acceptable window.

## 20. OUTBOX

If cross-system event delivery needs atomicity.

## 21. DUAL WRITE

DB + external system.

## 22. DB + QUEUE

Commit succeeds, enqueue fails.

## 23. QUEUE + DB

Message delivered twice.

## 24. DB + STORAGE

Metadata/object mismatch.

## 25. PAYMENT

Provider success + local timeout.

## 26. WEBHOOK

Duplicate/out-of-order.

## 27. IMPORT

Partial rows.

## 28. EXPORT

Doesn't mutate, but may expose inconsistent snapshot.

## 29. STATE MACHINE

Invalid transition.

## 30. SKIP TRANSITION

Client sets final status.

## 31. TERMINAL STATE

Should it be immutable?

## 32. RESTORE

Deleted object resurrected.

## 33. SOFT DELETE

Related records.

## 34. OWNERSHIP TRANSFER

All dependent scopes update.

## 35. UNIQUE + SOFT DELETE

## 36. NULL

Missing critical relation.

## 37. MONEY ROUNDING

Line totals vs invoice total.

## 38. CURRENCY CONVERSION

Rate/time source.

## 39. TIME RANGE

End before start.

## 40. OVERLAP

Booking/subscription.

## 41. CAPACITY

Reservation overbook.

## 42. STOCK

Negative stock.

## 43. QUOTA

Parallel requests exceed limit.

## 44. VERSION

Optimistic concurrency.

## 45. GENERATED DATA

Can it be recomputed?

## 46. RECONCILIATION JOB

Detect drift.

## 47. CONSISTENCY CHECK

Periodic query.

## 48. CHECKSUM

For pipelines/backups.

## 49. AUDIT LOG

State change trace.

## 50. DATABASE CORRUPTION VS LOGICAL CORRUPTION

Separate concepts.

## 51. REPAIR

How invalid data is corrected.

## 52. REPAIR SCRIPT

Can make problem worse.

## 53. DATA FIX MIGRATION

Must be idempotent/verifiable.

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

Za svaki critical invariant pokušaj:

- duplicate concurrent request
- retry
- failure between two writes
- out-of-order message
- stale update
- parent delete
- cross-tenant ID
- restore old data

# KONAČNO PRAVILO

Tražim:

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
