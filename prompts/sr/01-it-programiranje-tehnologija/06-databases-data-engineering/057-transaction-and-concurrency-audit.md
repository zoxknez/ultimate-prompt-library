---
id: UPL-IT-057
number: 57
slug: transaction-and-concurrency-audit
title: Transaction & Concurrency Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# TRANSACTION AND CONCURRENCY AUDIT

Želim maksimalno dubok audit concurrency-ja, transaction boundaries, isolation i race conditions.

Glavni cilj:

> Pronaći mesta gde sistem radi ispravno sa jednim request-om, ali proizvodi pogrešan rezultat kada dve ili više operacija rade paralelno.

## 1. CRITICAL MUTATIONS

Inventariši:

- payments
- inventory
- quotas
- role changes
- ownership
- counters
- coupons
- reservations
- state transitions

## 2. TRANSACTION BOUNDARY

Za svaku mutation:

```text
Read:
Checks:
Writes:
External calls:
Events:
Commit:
```

## 3. READ-MODIFY-WRITE

High-signal.

## 4. LOST UPDATE

A and B read same version.

## 5. WRITE-WRITE

Last writer wins unintentionally.

## 6. OPTIMISTIC LOCK

Version compare.

## 7. ATOMIC UPDATE

```text
UPDATE ... WHERE stock > 0
```

can be stronger than app-side check.

## 8. UNIQUE CONSTRAINT

Race-safe uniqueness.

## 9. CHECK-THEN-INSERT

Unsafe without unique constraint.

## 10. QUOTA

COUNT then INSERT race.

## 11. COUPON

Check unused then mark used.

## 12. ONE-TIME TOKEN

Same.

## 13. PAYMENT REFUND

## 14. INVENTORY

## 15. BOOKING

Overlap.

## 16. ACCOUNT BALANCE

## 17. ROLE GRANT

Two admin changes.

## 18. OWNERSHIP TRANSFER

## 19. ISOLATION LEVEL

Actual engine behavior.

## 20. READ COMMITTED

## 21. REPEATABLE READ

## 22. SERIALIZABLE

Do not recommend globally without throughput analysis.

## 23. SNAPSHOT

Write skew.

## 24. NON-REPEATABLE READ

## 25. PHANTOM

## 26. WRITE SKEW

Two doctors/on-call style invariant.

## 27. LOCK

Row/table/advisory.

## 28. LOCK ORDER

Deadlock.

## 29. DEADLOCK RETRY

Use bounded retry with transaction restart.

## 30. EXTERNAL CALL INSIDE TRANSACTION

Can hold locks for seconds.

## 31. EXTERNAL CALL BEFORE COMMIT

Provider succeeds, DB rollback.

## 32. EXTERNAL CALL AFTER COMMIT

DB commits, provider fails.

## 33. OUTBOX

Potential pattern.

## 34. SAGA

For distributed workflows, not automatic requirement.

## 35. IDEMPOTENCY

Critical.

## 36. IDEMPOTENCY KEY SCOPE

User/tenant/action.

## 37. SAME KEY DIFFERENT BODY

Conflict.

## 38. CONCURRENT SAME KEY

Atomic lock/unique.

## 39. RETRY

DB/network/client.

## 40. CLIENT DOUBLE CLICK

## 41. MOBILE RETRY

## 42. LOAD BALANCER RETRY

## 43. QUEUE DUPLICATE

At-least-once.

## 44. WEBHOOK DUPLICATE

## 45. OUT-OF-ORDER

## 46. STALE JOB

Permission/state changes.

## 47. TOCTOU

Authorization and resource mutation.

## 48. FILE

Check file state then overwrite.

## 49. CACHE LOCK

Dogpile.

## 50. DISTRIBUTED LOCK

Audit:

- TTL
- ownership token
- renewal
- clock
- failure

## 51. LOCK EXPIRY

Long operation continues after lock expires -> two owners.

## 52. REDLOCK-LIKE

Do not prescribe without threat/failure analysis.

## 53. DB LOCK PREFERRED

If invariant lives in one DB, DB atomicity is often simpler.

## 54. COUNTER

Atomic increment.

## 55. SEQUENCE

## 56. MAX()+1

Race.

## 57. ORDER POSITION

Two inserts same position.

## 58. DELETE VS UPDATE

## 59. DELETE VS JOB

## 60. ARCHIVE VS EDIT

## 61. ROLE REVOKE VS REQUEST

## 62. SESSION REVOKE

## 63. TRANSACTION TIMEOUT

## 64. IDLE TRANSACTION

## 65. LOCK WAIT

## 66. CONNECTION POOL

Blocked transactions can exhaust pool.

## 67. HOT ROW

Global settings/counter.

## 68. HIGH CONTENTION

Benchmark.

## 69. RETRY STORM

Serializable/deadlock retries can amplify load.

## 70. BACKOFF/JITTER

Where needed.

## 71. CONCURRENCY TEST

Use barriers to force exact interleaving.

## 72. TEST FORMAT

```text
T1 read
T2 read
T1 write
T2 write
```

## 73. DETERMINISTIC RACE TEST

Better than probabilistic 1000-loop test.

## 74. FINDING FORMAT

```text
ID:
Severity:
Invariant:
Transaction:
Isolation:
Actors:
Interleaving:
Expected:
Actual:
Impact:
Evidence:
Root cause:
Fix:
Retry behavior:
Regression test:
```

## 75. OUTPUT

`TRANSACTION_CONCURRENCY_AUDIT.md`

## 76. SECOND PASS

Za svaku high-value mutation izvrši:

- 2 parallel
- 10 parallel
- duplicate same idempotency key
- retry after timeout
- deadlock path
- stale version
- revoke during operation

# KONAČNO PRAVILO

Tražim:

```text
quota = 10

current rows = 9

Request A:
COUNT = 9

Request B:
COUNT = 9

A inserts
B inserts

final = 11
```

i konkretan atomic fix, ne samo:

> Koristi transaction.

Transaction pri pogrešnom isolation-u i dalje može dozvoliti race.
