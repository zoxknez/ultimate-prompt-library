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
version: 1.1.0
status: stable
---

# DATA INTEGRITY AUDIT

I want a forensic audit of all data invariants and potential pathways through which data can become invalid, contradictory, duplicated, or mutually inconsistent.

Main objective:

> Prove where the application prevents impossible states, duplicate business effects, orphaned records, stale denormalized values, and cross-system divergence.

## 1. OBJECTIVE AND NON-GOALS

For every critical business fact, prove which mechanism guarantees that it stays correct under concurrency, retries, partial failures, cross-system operations, repairs and restores, and how long a violation would stay undetected.

The deliverable is an invariant-by-invariant map of enforcement, gaps, detection and repair, with concrete corruption paths.

Non-goals:

- physical storage health (disk, replication checksums) except where it affects logical integrity
- general schema style or naming
- performance tuning
- data quality issues that do not violate an invariant (see the separate section below)

## 2. CONTEXT DISCOVERY

Establish before looking for violations:

```text
Database engine(s) and version(s):
Isolation level actually used by critical transactions:
ORM / data-access layer:
External systems that hold copies or effects (queue, object storage, payment provider, email/SMS, webhooks, search index, cache, analytics, CRM):
Integration style (synchronous call, outbox, CDC, event bus, batch sync):
Delivery guarantees of queues and webhooks (at-most-once, at-least-once, ordering):
Multi-tenant model:
Existing reconciliation jobs, consistency checks and alerts:
Backup / restore / PITR process:
```

## 3. INTEGRITY CLASSES

Classify every invariant, because each class needs a different enforcement mechanism:

```text
entity integrity          identity, uniqueness, required attributes
referential integrity     references point to existing, correct parents
business invariant        rules such as stock >= 0, invoice total = sum(lines), one active subscription
cross-system integrity    local records agree with payment provider, storage, search index, queue
temporal integrity        valid intervals, no overlaps, correct ordering of state changes
tenant integrity          every related record belongs to the same tenant
financial integrity       money is never created, lost or double-counted; ledgers balance
```

## 4. AUTHORITY MAP

For every important fact, answer: **who owns the truth?**

```text
Fact:                   (for example: payment status of order 123)
Authoritative source:   (local DB, payment provider, identity provider, object storage)
Copies:                 (tables, caches, search index, analytics, client state)
Direction of sync:      (provider -> DB via webhook, DB -> search via CDC, ...)
Lag tolerated:
What wins on conflict:
```

Many integrity defects are two components that both believe they are authoritative, or a copy that is used to make a decision the authority should make.

## 5. EVIDENCE MODEL

```text
A - reproduced: the invalid state was produced in a test (deterministic interleaving, fault injection) or found in production data
B - complete path: code, transaction boundaries and constraints show an unguarded path to the invalid state
C - strong static evidence: an invariant has no visible enforcement, but the full path is not traced
D - inference: plausible violation that needs verification (timing, configuration, provider behavior)
E - hardening: additional defense (constraint, reconciliation, alert) where the current guard already works
```

Existing corrupt rows found by a read-only query are tier A evidence: include the query and the counts, never the personal data itself.

## 6. FINDING STATUS

- **CONFIRMED** - the invalid state exists or was reproduced, or an unguarded path is fully traced (tier A or B).
- **LIKELY** - strong static evidence (tier C).
- **NOT VERIFIED** - depends on timing, isolation, provider or configuration that could not be established.
- **NOT APPLICABLE** - the invariant does not exist in this domain.
- **CONTROLLED** - the violation can occur but is detected and repaired within the accepted window (reconciliation, outbox, idempotency).
- **HARDENING** - an extra layer of defense without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete path to an invalid, duplicated, lost or divergent state.

## 7. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- Eventual consistency is not an integrity failure if the inconsistency window is defined, bounded and acceptable to the business, and divergence is detected.
- A missing foreign key is not automatically a defect when references are validated and cleaned by another reliable mechanism, or cross a database boundary where a foreign key is impossible.
- A denormalized counter is not automatically wrong if it is recomputed or reconciled and nobody makes an authoritative decision from it.
- Application-level validation is not automatically insufficient if all writes go through one serialized path (for example a single-writer queue consumer).
- A soft-deleted parent with active children is not automatically corruption if the domain intends children to remain.
- Duplicate-looking rows are not a violation if the domain legitimately allows them (repeat purchases, versions, history rows).

## 8. INVARIANT INVENTORY

Examples:

```text
email unique per tenant
stock >= 0
invoice total = sum(lines)
one active membership per user/org
payment provider ID unique
```

## 9. ENFORCEMENT LAYER

For each invariant determine the enforcement layer:

- UI
- API validator
- service layer
- database constraint
- transaction boundary
- external reconciliation process

## 10. UI ONLY

Client-side checks do not constitute data integrity enforcement.

## 11. APPLICATION CHECK ONLY

Application-level validation without database enforcement carries critical concurrency risks.

## 12. DB UNIQUE

Database-level unique constraints provide strong atomic protection.

## 13. CHECK

Database check constraints.

## 14. FK

Foreign key referential integrity.

## 15. TRANSACTION

Transactional consistency.

## 16. DUPLICATE RECORD

Concurrent entity creation races.

## 17. IDEMPOTENCY

Handling repeated external retries.

## 18. RACE SAFETY OF INVARIANTS

For every invariant enforced in application code, write the interleaving that could break it:

```text
T1 read stock = 1
T2 read stock = 1
T1 check stock >= 1
T2 check stock >= 1
T1 write stock = 0
T2 write stock = 0      (two items sold, one in stock)
```

Then state which mechanism prevents it: a unique or check constraint, an atomic conditional UPDATE, a row lock, optimistic versioning, or serializable isolation. "It is inside a transaction" is not an answer; name the isolation level and show why the interleaving is impossible under it.

## 19. ORPHAN

Parent record deleted without cascade handling.

## 20. DANGLING REFERENCE

Logical references without foreign key constraints.

## 21. CROSS-TENANT FK

Child foreign key referencing resources belonging to a foreign tenant.

## 22. DENORMALIZED FIELD

Must maintain strict synchronization with authoritative sources.

## 23. COUNTER

`comment_count`, `balance`, `usage`.

## 24. BALANCE

Never derive critical financial balances from unchecked incremental updates without automated reconciliation.

## 25. AGGREGATE DRIFT

Aggregate calculations drifting from individual line items.

## 26. MATERIALIZED STATE

Synchronization models for materialized or cached values.

## 27. EVENTUAL CONSISTENCY

Not automatically an integrity failure.

Explicitly define the acceptable inconsistency window.

## 28. OUTBOX

Transactional outbox pattern for atomic event publishing across systems.

## 29. DUAL WRITE

Direct dual writes across databases and external third-party services.

## 30. DB + QUEUE

Database commit succeeds while message queuing fails.

## 31. QUEUE + DB

Messages delivered more than once resulting in duplicate execution.

## 32. DB + STORAGE

Database metadata and object storage state mismatches.

## 33. PAYMENT

Payment gateway charge succeeds while local database update times out.

## 34. WEBHOOK

Duplicate or out-of-order webhook delivery.

## 35. IMPORT

Partial or interrupted bulk data imports.

## 36. DISTRIBUTED FAILURE COMBINATIONS

For every operation that changes the database and at least one other system, walk through each partial outcome:

```text
DB commit OK, side effect failed            (message not published, file not stored, email not sent)
side effect OK, DB commit failed             (card charged, row missing)
side effect OK, response lost, client retries (duplicate charge, duplicate email)
side effect executed twice                   (at-least-once delivery, webhook redelivery)
side effects arrive out of order             (refund before payment, delete before create)
```

Cover each external system that holds state: queue, object storage, payment provider, email/SMS, webhooks (in and out), search index, cache, analytics. For each combination state what the system does today and which invalid state results.

## 37. RECONCILIATION AND DETECTION LATENCY

For every external system and every derived value, answer:

```text
How do we detect divergence?        (scheduled comparison, provider event, checksum, count check, none)
How often?
Detection latency:                  (how long can a violation exist unnoticed?)
Who is alerted?
How do we repair it?                (automatic, manual procedure, one-off script)
Is the repair idempotent and auditable?
```

A violation with no detection is **silent corruption**: rate it by how long it can persist and what decisions are made from the wrong data in the meantime, not only by how often it happens.

## 38. EXPORT

Does not mutate state, but can expose inconsistent point-in-time snapshots.

## 39. STATE MACHINE

Invalid lifecycle state transitions.

## 40. SKIP TRANSITION

Clients attempting to bypass intermediate states and set terminal statuses directly.

## 41. TERMINAL STATE

Should terminal states be strictly immutable?

## 42. RESTORE

Accidental resurrection of deleted or soft-deleted entities.

## 43. SOFT DELETE

Cascading soft-delete implications across related entities.

## 44. OWNERSHIP TRANSFER

Ensuring all dependent resource scopes update synchronously upon ownership change.

## 45. UNIQUE + SOFT DELETE

Handling uniqueness constraints on tables utilizing soft delete.

## 46. NULL

Critical relationships permitting NULL values unexpectedly.

## 47. MONEY ROUNDING

Discrepancies between individual line item rounding and overall invoice totals.

## 48. CURRENCY CONVERSION

Historical exchange rate authority and timestamp accuracy.

## 49. TIME RANGE

End dates recorded prior to start dates.

## 50. OVERLAP

Preventing overlapping reservations or subscription windows.

## 51. CAPACITY

Overbooking shared capacity under concurrency.

## 52. STOCK

Inventory falling below zero.

## 53. QUOTA

Parallel requests bypassing quota limits.

## 54. VERSION

Optimistic concurrency control enforcement.

## 55. GENERATED DATA

Can derived data be reliably recomputed from scratch?

## 56. RECONCILIATION JOB

Background jobs designed to detect and flag state drift.

## 57. CONSISTENCY CHECK

Periodic automated consistency verification queries.

## 58. CHECKSUM

Cryptographic checksum verification for data pipelines and backups.

## 59. AUDIT LOG

Immutable audit trails tracking all state mutations.

## 60. DATABASE CORRUPTION VS LOGICAL CORRUPTION

Distinguish between physical storage corruption and logical state inconsistencies.

## 61. RESTORE CONSISTENCY

Restoring the database does not restore the rest of the world:

- a restored database can resurrect revoked sessions, used one-time tokens, deleted accounts or cancelled subscriptions
- payments, emails and webhooks sent after the restore point cannot be undone; local records no longer match providers
- object storage, search indexes and caches keep newer state than the restored database
- sequences and IDs may be reissued and collide with IDs already given to external systems

For each restore scenario, list what must be reconciled or invalidated afterwards, and whether that procedure exists.

## 62. DATA QUALITY VS INTEGRITY

Do not conflate the two:

- **integrity** - the data violates a rule the system relies on (duplicate payment, negative stock, orphaned invoice, cross-tenant reference)
- **quality** - the data is valid but inaccurate or incomplete (typo in a name, outdated phone number, missing optional field)

Report quality problems only when a system decision depends on them, and label them as quality, not integrity.

## 63. REPAIR

Procedures for remediating corrupted or inconsistent records.

## 64. REPAIR SCRIPT

Ad-hoc repair scripts capable of exacerbating data corruption.

## 65. DATA FIX MIGRATION

Data correction migrations must remain strictly idempotent and verifiable.

## 66. REPAIR STRATEGY

For every confirmed or likely violation, propose a repair plan separate from the permanent fix:

```text
Detection query (read-only):
Affected scope (count, tenants, time range):
Authoritative source used to decide the correct value:
Repair action and its ordering relative to the fix:
Idempotency and dry-run mode:
Audit trail of changed records:
Customer or financial follow-up (refunds, notices):
Verification after repair:
```

Fix the write path first or in the same release; repairing data while the bug keeps producing new violations wastes the repair.

## 67. INVARIANT ENFORCEMENT MATRIX

| Invariant | Class | Authority | App enforcement | DB enforcement | Concurrency-safe | Retry-safe | Detection | Repair | Status |
|---|---|---|---|---|---|---|---|---|---|

## 68. CROSS-SYSTEM CONSISTENCY MATRIX

| Operation | Systems touched | Atomicity mechanism | Partial-failure outcome | Duplicate handling | Ordering | Reconciliation | Detection latency |
|---|---|---|---|---|---|---|---|

## 69. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Integrity class:
Scope (entities, tables, systems):
Invariant:
Authoritative source:
Trigger (request, retry, job, webhook, restore):
Current guards:
Failure path (interleaving or partial-failure sequence):
Resulting invalid state:
Impact (business, financial, security):
Blast radius (tenants, records, time range):
Evidence:
Root cause:
Detection (existing or proposed) and detection latency:
Repair plan:
Permanent fix:
Verification (deterministic test, fault injection, reconciliation query):
Regression risk:
```

## 70. SEVERITY

- **P0** - systematic financial corruption (money created, lost or double-charged at scale), cross-tenant data mixing, or silent corruption of authoritative data without a way to reconstruct the truth.
- **P1** - a repeatable path to duplicate business effects, negative balances or stock, orphaned financial records, or divergence from a provider that is not detected.
- **P2** - material violations with limited scope, or violations that are detected and repairable but only manually and late.
- **P3** - edge-case inconsistencies on non-critical data, or derived values that drift but are recomputed.
- **P4** - hardening: an additional constraint, reconciliation or alert on an invariant that is already protected.

Raise severity when detection latency is long or the wrong data drives payments, access control or legal records.

## 71. OUTPUT

`DATA_INTEGRITY_AUDIT.md`

## 72. SECOND PASS

For every critical invariant test:

- two and ten concurrent duplicate requests
- request retries after a timeout, with and without an idempotency key
- a failure between two discrete write operations (DB and external system)
- duplicate and out-of-order message or webhook delivery
- stale update attempts against a newer version
- parent record deletion while children are being created
- cross-tenant identifier references supplied by a client
- restoring a legacy data snapshot or running a repair script twice
- the reconciliation job itself failing or running concurrently

Then try to disprove each finding: is there a constraint, lock or single-writer path you missed? Is the inconsistency window accepted and monitored?

## 73. FINAL QUALITY GATE

Before returning the report, verify that:

- every critical fact has an identified authoritative source
- invariants were classified (entity, referential, business, cross-system, temporal, tenant, financial)
- every invariant has its enforcement layer identified and its race safety argued with an interleaving
- retry and idempotency behavior was checked for every externally triggered write
- every operation that spans the DB and another system was walked through all partial outcomes
- each external system has a detection and repair answer, with detection latency
- restore consequences were considered
- data quality issues are not reported as integrity violations
- statuses and evidence tiers are applied consistently and repair plans are separate from permanent fixes

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

Other failure chains to look for:

```text
stock check in application code (SELECT stock, then UPDATE stock = stock - 1)
↓
two checkouts for the last item run concurrently
↓
both read stock = 1 and both commit
↓
stock = -1, two orders confirmed for one item
```

```text
task.project_id references a project by id only
↓
API accepts project_id from the request body
↓
no composite (project_id, tenant_id) constraint
↓
tenant A creates a task inside tenant B's project
↓
tenant B's users see foreign data; exports mix tenants
```

```text
comment_count incremented in application code
↓
comment deletion path forgets to decrement
↓
no recomputation job
↓
counts drift for months
↓
moderation limits and billing tiers use the wrong numbers
```

```text
upload: DB row inserted, then file written to object storage
↓
storage write times out after the DB commit
↓
row points to a missing object
↓
download returns 404; backups contain rows without files
```

```text
database restored to yesterday after a bad migration
↓
password resets and session revocations from today are lost
↓
revoked sessions become valid again
↓
payments captured today no longer have local orders
```
