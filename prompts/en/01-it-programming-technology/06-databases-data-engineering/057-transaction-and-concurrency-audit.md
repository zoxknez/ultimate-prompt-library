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
version: 1.1.0
status: stable
---

# TRANSACTION AND CONCURRENCY AUDIT

I want an in-depth audit of concurrency controls, transaction boundaries, isolation levels, and race conditions.

Main objective:

> Identify areas where the system operates correctly under single-threaded execution, but produces erroneous results when two or more operations execute concurrently.

## 1. OBJECTIVE AND NON-GOALS

For every high-value mutation, prove whether it remains correct when two or more executions overlap in time: parallel requests, retries, duplicate messages, background jobs, multiple workers and replicas. A finding must show a concrete interleaving that breaks an invariant and name the mechanism that would prevent it.

Non-goals:

- recommending "use a transaction" or "use serializable" without showing why the current isolation level allows the anomaly
- general performance tuning, except where contention or lock waits cause incorrect behavior or outages
- introducing distributed locks or sagas where a single database already guarantees the invariant

## 2. CONCURRENCY MODEL FIRST

Before analyzing any race, establish:

```text
Database engine and exact version:
Default isolation level and any per-transaction overrides:
How the ORM opens transactions (explicit, implicit per request, autocommit):
Row-locking primitives in use (SELECT ... FOR UPDATE, advisory locks, version columns):
Read replicas and whether reads after writes can hit a replica:
Number of application instances and workers:
Queue technology, delivery guarantee, visibility timeout, consumer concurrency:
Scheduled jobs and how many instances run them:
Distributed locks (implementation, TTL, renewal):
Retry layers (client, load balancer, HTTP library, ORM, queue):
```

Isolation levels with the same name behave differently across engines (what "repeatable read" prevents, whether write skew is possible, how serialization failures are reported). Verify the semantics for the detected engine and version; never rely on textbook definitions when the engine differs.

## 3. EVIDENCE MODEL

```text
A - reproduced: a deterministic interleaving test, a stress test or production data shows the anomaly
B - complete path: code, transaction boundaries, isolation semantics and constraints show that the interleaving is possible
C - strong static evidence: a read-check-write pattern without a visible guard, but isolation or locking not fully traced
D - inference: plausible race depending on timing, configuration or infrastructure behavior
E - hardening: extra protection where the current mechanism already prevents the anomaly
```

## 4. FINDING STATUS

- **CONFIRMED** - the anomaly was reproduced or the interleaving is proven possible (tier A or B).
- **LIKELY** - strong static evidence (tier C).
- **NOT VERIFIED** - depends on isolation, deployment topology or provider behavior that could not be established.
- **NOT APPLICABLE** - only one writer can ever execute the path (for example a single-consumer queue per key).
- **CONTROLLED** - the race can occur but a constraint, atomic statement, lock, idempotency key or reconciliation makes the outcome correct.
- **HARDENING** - defense in depth without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete interleaving that produces a wrong result.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A read followed by a write is not automatically a race if the write is conditional (`UPDATE ... WHERE version = ?`, `WHERE stock > 0`) and the affected row count is checked.
- A missing `SELECT ... FOR UPDATE` is not a defect when a unique constraint or atomic statement already enforces the invariant.
- Read committed isolation is not automatically wrong; many invariants are safely protected by constraints and atomic updates under it.
- A non-idempotent endpoint is not a finding if no client, proxy or queue can retry it and duplicates have no business effect.
- Eventual consistency between a primary and a replica is not a race defect unless a decision is made from a stale replica read.
- A theoretical race on data nobody writes concurrently in practice is at most HARDENING; state why concurrency is or is not realistic.

## 6. INTERLEAVING NOTATION

Every race finding must include the interleaving that breaks the invariant, written step by step with the value each actor sees:

```text
T1 read   balance = 100
T2 read   balance = 100
T1 check  100 >= 80  OK
T2 check  100 >= 80  OK
T1 write  balance = 20
T2 write  balance = 20
result    two withdrawals of 80 succeeded, balance should be -60 or one should fail
```

Then show the same interleaving with the proposed fix and which step now blocks, fails or retries.

## 7. RACE CLASSES

Classify every finding:

```text
lost update          two read-modify-write cycles, one overwrites the other
duplicate create     check-then-insert creates two rows for one logical entity
write skew           two transactions read overlapping data and write disjoint rows, violating a shared rule
stale write          a write based on a value that changed after it was read (old form, old version)
check-then-act       permission, quota or state checked, then acted on after it changed
delete/update race   an update or job runs on an entity that was deleted or archived meanwhile
revoke/use race      a token, session or role is used after it was revoked
lease expiry         a lock holder keeps working after its lease expired and another holder started
timeout/retry race   a timed-out operation actually succeeded and the retry executes it again
```

## 8. CRITICAL MUTATIONS

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

## 9. TRANSACTION BOUNDARY

For each mutation map:

```text
Read:
Checks:
Writes:
External calls:
Events:
Commit:
```

## 10. READ-MODIFY-WRITE

High-signal race condition pattern.

## 11. LOST UPDATE

Transaction A and Transaction B read identical version state.

## 12. WRITE-WRITE

Unintentional last-writer-wins overwrites.

## 13. OPTIMISTIC LOCK

Version check and conditional increment mechanisms.

## 14. ATOMIC UPDATE

```text
UPDATE ... WHERE stock > 0
```

provides stronger concurrency guarantees than application-side checks.

## 15. ATOMIC DATABASE PRIMITIVES

When the invariant lives in one database, prefer the database's own atomic primitives over application-level coordination:

- conditional update with a row-count check: `UPDATE ... SET stock = stock - 1 WHERE id = ? AND stock >= 1`
- unique constraints (including partial or composite ones) for "only one" rules
- `INSERT ... ON CONFLICT` / upsert semantics, verified for the engine
- check and exclusion constraints for ranges and overlaps where the engine supports them
- sequences or identity columns instead of `MAX()+1`

For every application-level check, ask whether one of these makes it unnecessary.

## 16. UNIQUE CONSTRAINT

Race-safe uniqueness enforcement.

## 17. CHECK-THEN-INSERT

Unsafe under concurrency without underlying unique database constraints.

## 18. QUOTA

COUNT followed by INSERT race condition.

## 19. COUPON

Verifying unused status followed by marking as redeemed.

## 20. ONE-TIME TOKEN

Single-use token redemption races.

## 21. PAYMENT REFUND

Preventing duplicate refund issuance.

## 22. INVENTORY

Stock decrements under concurrent purchase requests.

## 23. BOOKING

Preventing overlapping calendar bookings.

## 24. ACCOUNT BALANCE

Ledger updates and balance mutations.

## 25. ROLE GRANT

Concurrent administrative privilege modifications.

## 26. OWNERSHIP TRANSFER

Resource ownership transfers under parallel requests.

## 27. ISOLATION LEVEL

Evaluate actual database engine runtime behavior.

## 28. ISOLATION SEMANTICS FOR THIS ENGINE

For the detected engine and version, state concretely:

- which anomalies the configured isolation level allows (lost update, non-repeatable read, phantom, write skew)
- whether locking reads (`FOR UPDATE`, `FOR SHARE`) change that for the rows they touch
- how conflicts surface: blocking, a serialization error, a deadlock error, or silent last-writer-wins
- whether the application catches those errors and retries the **whole** transaction, not only the last statement
- whether some transactions run at a different level than the default (ORM options, per-connection settings)

A finding that depends on isolation must name the level and the engine behavior it relies on.

## 29. READ COMMITTED

Read committed default behaviors and anomalies.

## 30. REPEATABLE READ

Repeatable read semantics.

## 31. SERIALIZABLE

Do not mandate serializable isolation globally without analyzing throughput impact.

## 32. SNAPSHOT

Snapshot isolation and write skew vulnerabilities.

## 33. NON-REPEATABLE READ

Anomalies permitted under lower isolation levels.

## 34. PHANTOM

Phantom reads impacting business invariant enforcement.

## 35. WRITE SKEW

Two doctors on-call pattern invariant violations.

## 36. LOCK

Row-level, table-level, and advisory locks.

## 37. OPTIMISTIC VS PESSIMISTIC CONCURRENCY

Evaluate the chosen strategy against the workload:

- **optimistic** (version column, conditional update): good for low contention; verify that the version is checked in the WHERE clause, that the affected row count is checked, and that the user or job gets a clear conflict outcome instead of a silent overwrite
- **pessimistic** (`SELECT ... FOR UPDATE`, advisory locks): good for high contention on few rows; verify lock scope, lock ordering, timeouts, and that no external call happens while the lock is held
- mixed strategies on the same row (one path uses versions, another writes without them) break the optimistic guarantee

## 38. LOCK ORDER

Inconsistent lock acquisition ordering causing deadlocks.

## 39. DEADLOCK RETRY

Implement bounded retries with complete transaction restarts.

## 40. DEADLOCK ANALYSIS

For every multi-row or multi-table write path:

- list the lock acquisition order of each path; two paths that lock the same rows in different orders can deadlock
- identify which transaction the engine chooses as the victim and whether the application retries it safely (whole transaction, bounded attempts, backoff with jitter)
- check whether retried transactions repeat side effects (emails, provider calls, events)
- check deadlock and lock-wait metrics or logs for real occurrences before rating severity

## 41. EXTERNAL CALL INSIDE TRANSACTION

Holding database locks for seconds across outbound network calls.

## 42. EXTERNAL CALL BEFORE COMMIT

External provider call succeeds while database commit rolls back.

## 43. EXTERNAL CALL AFTER COMMIT

Database commit succeeds while external provider call fails.

## 44. SIDE EFFECTS AND COMMIT BOUNDARIES

For every transaction with an external effect, place the effect on the timeline:

```text
before commit   effect happens even if the transaction rolls back (charge without order)
inside commit   impossible for external systems; only the database is atomic
after commit    effect can be lost if the process dies between commit and call (order without email)
```

Acceptable designs make the effect recoverable: a transactional outbox with an idempotent relay, an idempotency key sent to the provider, or a reconciliation job. Check that the provider call uses a stable idempotency key derived from the business operation, not a new random key on every retry.

## 45. OUTBOX

Transactional outbox pattern for reliable external messaging.

## 46. SAGA

Sagas for distributed workflows (not an automatic requirement for local boundaries).

## 47. IDEMPOTENCY

Critical operational safeguard.

## 48. IDEMPOTENCY KEY SCOPE

Scoping keys by user, tenant, and operation.

## 49. SAME KEY DIFFERENT BODY

Handling payload conflicts for identical idempotency keys.

## 50. CONCURRENT SAME KEY

Atomic locking or unique constraints on idempotency keys.

## 51. RETRY

Database, network, and client retry handling.

## 52. CLIENT DOUBLE CLICK

Duplicate client form submissions.

## 53. MOBILE RETRY

Aggressive mobile network retry behaviors.

## 54. LOAD BALANCER RETRY

Upstream proxies automatically retrying idempotent or non-idempotent requests.

## 55. QUEUE DUPLICATE

At-least-once queue delivery semantics.

## 56. WEBHOOK DUPLICATE

Repeated webhook callbacks from third-party services.

## 57. OUT-OF-ORDER

Out-of-order message delivery processing.

## 58. STALE JOB

Background worker executing after permissions or entity state changed.

## 59. QUEUE AND WORKER CONCURRENCY

For every consumer:

- how many consumers process messages for the same entity at the same time?
- is ordering guaranteed per key (partition, message group), or can two events for one entity run in parallel?
- what happens when processing takes longer than the visibility timeout or lease: is the message redelivered to a second worker while the first still runs?
- are handlers idempotent on the message ID or the business key?
- can a scheduled job run on several instances at once, or overlap with its own previous run?

## 60. TOCTOU

Time-of-check to time-of-use authorization and mutation races.

## 61. FILE

Checking file existence or metadata prior to overwriting.

## 62. CACHE LOCK

Cache stampede and dogpile prevention.

## 63. DISTRIBUTED LOCK

Audit:

- TTL
- ownership token
- renewal
- clock
- failure

## 64. LOCK EXPIRY

Long-running operations continuing after lock expiry leading to dual active workers.

## 65. REDLOCK-LIKE

Do not prescribe complex distributed locking algorithms without comprehensive failure modeling.

## 66. DISTRIBUTED LOCKS AND FENCING TOKENS

A distributed lock with a TTL does not guarantee mutual exclusion by itself:

```text
worker A acquires lease (TTL 30 s)
↓
worker A pauses (GC, network, slow provider call) for 45 s
↓
lease expires; worker B acquires it and starts writing
↓
worker A resumes and writes, believing it still holds the lock
```

For every distributed lock verify:

- **lease duration** vs the worst-case duration of the protected work
- **renewal**: how the lease is extended, and what happens if renewal fails
- **owner verification**: release and renewal only succeed for the current owner token
- **fencing token**: a monotonically increasing number issued with the lease and checked by the resource being written (for example `UPDATE ... WHERE fence < ?`), so a stale holder's writes are rejected
- **clock assumptions**: behavior under clock drift between nodes
- **failure of the lock service** itself: does the system fail closed or run unprotected?

If the protected resource is a single database, a row lock or conditional write in that database is usually simpler and safer than a distributed lock.

## 67. DB LOCK PREFERRED

If an invariant resides in a single database, native database atomicity is vastly simpler and safer.

## 68. COUNTER

Atomic increment operations.

## 69. SEQUENCE

Database sequence allocation.

## 70. MAX()+1

Race condition in primary key or order generation.

## 71. ORDER POSITION

Two concurrent inserts assigning the identical sequence position.

## 72. DELETE VS UPDATE

Race between entity deletion and concurrent update.

## 73. DELETE VS JOB

Entity deletion racing against queued background worker processing.

## 74. ARCHIVE VS EDIT

Archiving an entity racing against active edit requests.

## 75. ROLE REVOKE VS REQUEST

Role revocation racing against an in-flight authenticated request.

## 76. SESSION REVOKE

Session revocation propagation latency.

## 77. TRANSACTION TIMEOUT

Configuring upper limits on transaction duration.

## 78. IDLE TRANSACTION

Monitoring and terminating idle-in-transaction connections.

## 79. LOCK WAIT

Monitoring lock wait queues.

## 80. CONNECTION POOL

Blocked or slow transactions exhausting the shared connection pool.

## 81. HOT ROW

Global application settings or contention hotspots.

## 82. HIGH CONTENTION

Benchmarking behavior under high contention.

## 83. RETRY STORM

Cascading retry storms triggered by serializable failures or deadlocks.

## 84. BACKOFF/JITTER

Implementing exponential backoff with randomized jitter on transaction retries.

## 85. CONCURRENCY TEST

Utilize synchronization barriers to enforce exact operational interleaving.

## 86. TEST FORMAT

```text
T1 read
T2 read
T1 write
T2 write
```

## 87. DETERMINISTIC RACE TEST

Deterministic interleaving tests are vastly superior to probabilistic loops.

## 88. DETERMINISTIC RACE TESTING

Do not rely on loops that "usually" trigger a race. Force the interleaving:

- barriers or latches in the test that pause T1 after its read until T2 has read too
- hooks or fault-injection points in the code path (test-only) between check and write
- two database sessions driven step by step by the test
- for retries: simulate a timeout after the side effect succeeded, then run the retry

Each confirmed finding should come with a test that fails before the fix and passes after it.

## 89. CONCURRENCY INTERLEAVING MATRIX

| Mutation | Invariant | Race class | Actors | Breaking interleaving | Current guard | Isolation | Retry safe | Status |
|---|---|---|---|---|---|---|---|---|

## 90. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Race class:
Scope (mutation, tables, services):
Invariant:
Trigger (parallel requests, retry, duplicate message, job overlap):
Actors:
Transaction boundary and isolation:
Current guards:
Interleaving (step by step):
Expected result:
Actual result:
Impact:
Blast radius:
Evidence:
Root cause:
Fix (atomic statement, constraint, lock, idempotency, fencing):
Retry behavior after the fix:
Verification (deterministic test):
Regression risk (contention, deadlocks, latency):
```

## 91. SEVERITY

- **P0** - a race that allows systematic financial loss (double spend, double refund, unlimited coupon use), privilege escalation, or cross-tenant writes, and that an attacker can trigger deliberately.
- **P1** - a repeatable race on a critical mutation (payments, inventory, quotas, roles, ownership) that produces wrong business results under normal concurrency or retries.
- **P2** - a race with real but limited impact (duplicate notifications, occasional lost edits, recoverable inconsistencies), or deadlocks and lock waits that cause failed requests.
- **P3** - races on non-critical data or with very narrow timing windows and small impact.
- **P4** - hardening: additional constraints, tests or monitoring where the current mechanism already works.

Consider exploitability: a race that a user can trigger at will with parallel requests is more severe than one that needs rare infrastructure timing.

## 92. OUTPUT

`TRANSACTION_CONCURRENCY_AUDIT.md`

## 93. SECOND PASS

For every high-value mutation execute or reason through:

- 2 and 10 parallel requests with identical input
- duplicate submissions with the same idempotency key, and the same key with a different body
- a retry after a timeout in which the first attempt actually succeeded
- the same message delivered twice and two related messages out of order
- processing that outlives a visibility timeout or lock lease
- deadlock paths between the mutation and other writers of the same rows
- an update against a stale version token
- permission revocation or entity deletion while the operation is in flight
- reads served from a replica immediately after the write

Then try to disprove each finding: is there a constraint, atomic statement or single-writer path you missed? Does the engine's isolation actually prevent this interleaving?

## 94. FINAL QUALITY GATE

Before returning the report, verify that:

- the concurrency model (engine, version, isolation, workers, queues, retries) is documented
- every race finding has a step-by-step interleaving and a race class
- isolation claims are specific to the detected engine and version
- atomic database primitives were considered before application-level locks
- external side effects are placed on the commit timeline and their recovery is described
- retries (client, proxy, library, queue) were checked for duplicate effects
- distributed locks were checked for lease duration, renewal, owner verification and fencing
- queue consumers were checked for parallel processing of the same entity and redelivery during long processing
- every confirmed finding has a deterministic test proposal
- statuses and evidence tiers are applied consistently; no finding says only "use a transaction"

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

Other failure chains to look for:

```text
refund job holds a distributed lock with a 60 s lease
↓
provider call hangs for 90 s
↓
lease expires; a second worker takes the lock and issues the refund
↓
first worker's call completes; it also records a refund
↓
customer refunded twice; no fencing token rejected the stale worker
```

```text
rule: at least one doctor on call per shift
↓
Doctor A and Doctor B both read "2 on call" under snapshot isolation
↓
each updates only their own row to "off call"
↓
no row conflict, both commit
↓
nobody on call (write skew)
```

```text
payment request times out at the load balancer after the provider charged the card
↓
client retries with a new idempotency key generated per attempt
↓
provider treats it as a new charge
↓
customer charged twice; local order shows one payment
```
