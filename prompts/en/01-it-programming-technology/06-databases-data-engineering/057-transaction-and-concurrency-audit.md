---
id: UPL-IT-057
number: 57
slug: transaction-and-concurrency-audit
title: Transaction & Concurrency Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# TRANSACTION AND CONCURRENCY AUDIT

I want an in-depth audit of concurrency controls, transaction boundaries, isolation levels, and race conditions.

Main objective:

> Identify areas where the system operates correctly under single-threaded execution, but produces erroneous results when two or more operations execute concurrently.

## 1. CRITICAL MUTATIONS

Inventory:

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

For each mutation map:

```text
Read:
Checks:
Writes:
External calls:
Events:
Commit:
```

## 3. READ-MODIFY-WRITE

High-signal race condition pattern.

## 4. LOST UPDATE

Transaction A and Transaction B read identical version state.

## 5. WRITE-WRITE

Unintentional last-writer-wins overwrites.

## 6. OPTIMISTIC LOCK

Version check and conditional increment mechanisms.

## 7. ATOMIC UPDATE

```text
UPDATE ... WHERE stock > 0
```

provides stronger concurrency guarantees than application-side checks.

## 8. UNIQUE CONSTRAINT

Race-safe uniqueness enforcement.

## 9. CHECK-THEN-INSERT

Unsafe under concurrency without underlying unique database constraints.

## 10. QUOTA

COUNT followed by INSERT race condition.

## 11. COUPON

Verifying unused status followed by marking as redeemed.

## 12. ONE-TIME TOKEN

Single-use token redemption races.

## 13. PAYMENT REFUND

Preventing duplicate refund issuance.

## 14. INVENTORY

Stock decrements under concurrent purchase requests.

## 15. BOOKING

Preventing overlapping calendar bookings.

## 16. ACCOUNT BALANCE

Ledger updates and balance mutations.

## 17. ROLE GRANT

Concurrent administrative privilege modifications.

## 18. OWNERSHIP TRANSFER

Resource ownership transfers under parallel requests.

## 19. ISOLATION LEVEL

Evaluate actual database engine runtime behavior.

## 20. READ COMMITTED

Read committed default behaviors and anomalies.

## 21. REPEATABLE READ

Repeatable read semantics.

## 22. SERIALIZABLE

Do not mandate serializable isolation globally without analyzing throughput impact.

## 23. SNAPSHOT

Snapshot isolation and write skew vulnerabilities.

## 24. NON-REPEATABLE READ

Anomalies permitted under lower isolation levels.

## 25. PHANTOM

Phantom reads impacting business invariant enforcement.

## 26. WRITE SKEW

Two doctors on-call pattern invariant violations.

## 27. LOCK

Row-level, table-level, and advisory locks.

## 28. LOCK ORDER

Inconsistent lock acquisition ordering causing deadlocks.

## 29. DEADLOCK RETRY

Implement bounded retries with complete transaction restarts.

## 30. EXTERNAL CALL INSIDE TRANSACTION

Holding database locks for seconds across outbound network calls.

## 31. EXTERNAL CALL BEFORE COMMIT

External provider call succeeds while database commit rolls back.

## 32. EXTERNAL CALL AFTER COMMIT

Database commit succeeds while external provider call fails.

## 33. OUTBOX

Transactional outbox pattern for reliable external messaging.

## 34. SAGA

Sagas for distributed workflows (not an automatic requirement for local boundaries).

## 35. IDEMPOTENCY

Critical operational safeguard.

## 36. IDEMPOTENCY KEY SCOPE

Scoping keys by user, tenant, and operation.

## 37. SAME KEY DIFFERENT BODY

Handling payload conflicts for identical idempotency keys.

## 38. CONCURRENT SAME KEY

Atomic locking or unique constraints on idempotency keys.

## 39. RETRY

Database, network, and client retry handling.

## 40. CLIENT DOUBLE CLICK

Duplicate client form submissions.

## 41. MOBILE RETRY

Aggressive mobile network retry behaviors.

## 42. LOAD BALANCER RETRY

Upstream proxies automatically retrying idempotent or non-idempotent requests.

## 43. QUEUE DUPLICATE

At-least-once queue delivery semantics.

## 44. WEBHOOK DUPLICATE

Repeated webhook callbacks from third-party services.

## 45. OUT-OF-ORDER

Out-of-order message delivery processing.

## 46. STALE JOB

Background worker executing after permissions or entity state changed.

## 47. TOCTOU

Time-of-check to time-of-use authorization and mutation races.

## 48. FILE

Checking file existence or metadata prior to overwriting.

## 49. CACHE LOCK

Cache stampede and dogpile prevention.

## 50. DISTRIBUTED LOCK

Audit:

- TTL
- ownership token
- renewal
- clock
- failure

## 51. LOCK EXPIRY

Long-running operations continuing after lock expiry leading to dual active workers.

## 52. REDLOCK-LIKE

Do not prescribe complex distributed locking algorithms without comprehensive failure modeling.

## 53. DB LOCK PREFERRED

If an invariant resides in a single database, native database atomicity is vastly simpler and safer.

## 54. COUNTER

Atomic increment operations.

## 55. SEQUENCE

Database sequence allocation.

## 56. MAX()+1

Race condition in primary key or order generation.

## 57. ORDER POSITION

Two concurrent inserts assigning the identical sequence position.

## 58. DELETE VS UPDATE

Race between entity deletion and concurrent update.

## 59. DELETE VS JOB

Entity deletion racing against queued background worker processing.

## 60. ARCHIVE VS EDIT

Archiving an entity racing against active edit requests.

## 61. ROLE REVOKE VS REQUEST

Role revocation racing against an in-flight authenticated request.

## 62. SESSION REVOKE

Session revocation propagation latency.

## 63. TRANSACTION TIMEOUT

Configuring upper limits on transaction duration.

## 64. IDLE TRANSACTION

Monitoring and terminating idle-in-transaction connections.

## 65. LOCK WAIT

Monitoring lock wait queues.

## 66. CONNECTION POOL

Blocked or slow transactions exhausting the shared connection pool.

## 67. HOT ROW

Global application settings or contention hotspots.

## 68. HIGH CONTENTION

Benchmarking behavior under high contention.

## 69. RETRY STORM

Cascading retry storms triggered by serializable failures or deadlocks.

## 70. BACKOFF/JITTER

Implementing exponential backoff with randomized jitter on transaction retries.

## 71. CONCURRENCY TEST

Utilize synchronization barriers to enforce exact operational interleaving.

## 72. TEST FORMAT

```text
T1 read
T2 read
T1 write
T2 write
```

## 73. DETERMINISTIC RACE TEST

Deterministic interleaving tests are vastly superior to probabilistic loops.

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

For every high-value mutation execute:

- 2 parallel requests
- 10 parallel requests
- duplicate submissions with identical idempotency keys
- retry execution following timeout
- deadlock acquisition paths
- updating against stale version tokens
- permission revocation mid-flight

# FINAL RULE

Looking for:

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

and concrete atomic fixes, not merely:

> Use a transaction.

Transactions executing under improper isolation levels can still permit race conditions.
