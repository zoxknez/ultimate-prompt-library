---
id: UPL-IT-024
number: 24
slug: backend-business-logic-audit
title: Backend Business Logic Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Backend & API
subcategory_id: backend-api
language: en
version: 1.0.0
status: stable
---

# BACKEND BUSINESS LOGIC AUDIT

I want you to perform an ultra-deep, systematic, evidence-first, and production-oriented analysis of the complete business logic across the backend system.

Main goal:

> Determine whether the backend genuinely protects the business rules of the system across all APIs, background jobs, webhooks, admin actions, concurrency scenarios, retries, partial failures, and state transitions, without allowing data to enter impossible or contradictory states.

This is not:

- a generic code review
- a REST style audit
- a whole-system security audit
- a database-only audit
- a recommendation for DDD without reason
- an attempt to convert every `if` into a design pattern
- happy-path-only analysis
- an automatic refactoring of the service layer

Focus is on real business rules.

Priority:

**business correctness > data integrity > invariant preservation > state transition safety > side-effect correctness > concurrency > maintainability**

It is better to find 5 business rules that can genuinely be violated than to write 100 generic architectural recommendations.

---

# 1. FIRST, ESTABLISH THE DOMAIN

Before findings, understand what the system actually does.

Identify:

- core entities
- business processes
- critical actions
- money
- ownership
- quotas
- limits
- status/state models
- approvals
- reservations
- bookings
- inventory
- subscriptions
- lifecycles
- destructive operations

If the domain is undocumented:

extract it from code.

---

# 2. MAP BUSINESS ENTITIES

For each critical entity define:

```text
Entity:
Identity:
Owner:
Mutable fields:
Immutable fields:
States:
Dependencies:
Side effects:
Deletion semantics:
```

---

# 3. IDENTIFY BUSINESS INVARIANTS

For each entity ask:

> What must absolutely remain true regardless of how the system is exercised?

Examples:

```text
balance >= 0
```

```text
one active subscription per account
```

```text
approved order cannot return to draft
```

```text
used coupon cannot be redeemed twice
```

```text
child must belong to existing parent
```

---

# 4. CREATE INVARIANT INVENTORY

Table:

| Invariant | Entity | Enforced where | DB protection | Other entry points | Risk |
|---|---|---|---|---|---|

---

# 5. BUSINESS RULE SOURCE OF TRUTH

For each rule identify the authoritative implementation:

- service
- domain object
- database
- policy engine
- workflow engine
- external system

The same rule must not have multiple independent implementations without clear justification.

---

# 6. DUPLICATED BUSINESS LOGIC

Look for identical rules duplicated across:

- controller
- service
- worker
- webhook
- admin API

Example:

```text
API checks status == ACTIVE
worker does not
```

The worker can bypass the invariant.

---

# 7. ENTRY POINT INVENTORY

For every critical business action identify all entry channels:

- REST API
- GraphQL
- admin
- CLI
- cron
- worker
- webhook
- event consumer
- migration/script

---

# 8. ENTRY POINT BYPASS

If only one entry point enforces validation while another calls the lower layer directly:

high-signal finding.

---

# 9. AUTH IS NOT A BUSINESS RULE

Do not confuse:

```text
user has permission to perform action
```

with:

```text
action is business-valid in current state
```

Both must be verified independently.

---

# 10. STATE MACHINES

For entities with status models construct explicit state machines.

Example:

```text
DRAFT
↓
SUBMITTED
↓
APPROVED
↓
COMPLETED
```

with branches:

```text
REJECTED
CANCELLED
FAILED
```

---

# 11. TRANSITION MATRIX

| From | Action | To | Allowed | Guard | Side effects |
|---|---|---|---|---|---|

---

# 12. INVALID TRANSITIONS

Look for pathways permitting:

```text
COMPLETED -> DRAFT
```

or:

```text
CANCELLED -> PROCESSING
```

without explicit product authorization.

---

# 13. DIRECT STATUS UPDATE

High-signal pattern:

```text
PATCH /entity
{
  "status": "APPROVED"
}
```

If clients can arbitrarily assign status bypassing transition logic:

critical business flaw.

---

# 14. COMMAND VS FIELD UPDATE

Certain state mutations must be structured as business commands:

```text
approve()
cancel()
refund()
```

rather than generic arbitrary field assignments.

Do not refactor purely for style.

---

# 15. TRANSITION GUARDS

Example:

```text
SUBMITTED -> APPROVED
```

may mandate:

- payment confirmation
- documentation
- permissions
- inventory availability

Verify that all guards genuinely execute.

---

# 16. TRANSITION SIDE EFFECTS

A transition may trigger:

- event emission
- email delivery
- invoice generation
- inventory reservation
- audit log creation

If state mutation succeeds while side effects vanish, the business process stalls.

---

# 17. DUPLICATE TRANSITION

What happens if:

```text
approve()
approve()
```

arrives twice?

The second invocation must never duplicate:

- payments
- emails
- rewards
- inventory movements

---

# 18. CONCURRENT TRANSITION

Scenario:

```text
Request A: approve
Request B: cancel
```

both read the exact same initial state.

Which one is allowed to win?

---

# 19. ATOMIC TRANSITION

If a transition is valid only from a specific preceding state:

verify atomic DB updates like:

```text
UPDATE ...
WHERE id = ?
AND status = 'SUBMITTED'
```

or equivalent concurrency constructs.

---

# 20. CHECK-THEN-UPDATE RACE

Pattern:

```text
read status
↓
if allowed
↓
update
```

is vulnerable to races if concurrent requests mutate state in between.

---

# 21. VERSIONING / OPTIMISTIC LOCK

If version fields are used:

verify that conflict does not result in silent overwrites.

---

# 22. BUSINESS CLOCK

For time-dependent rules determine the authoritative clock.

Examples:

- booking expires
- trial expires
- campaign starts
- invoice overdue

Server-side business time is typically authoritative.

---

# 23. CLIENT TIME

Never trust client timestamps for critical eligibility without validation.

---

# 24. BOUNDARY TIME

Test the exact boundary:

```text
now == expiresAt
```

Is the resource still valid or not?

Behavior must be deterministic.

---

# 25. TIMEZONE

If a business rule states:

```text
until the end of the local day
```

that is not identical to a UTC instant lacking timezone context.

---

# 26. DST

Scheduled business rules evaluated in local time can experience:

- missing hour
- duplicate hour

---

# 27. MONEY

If the system processes financial transactions:

map:

- amount
- currency
- precision
- taxes
- discounts
- fees
- rounding

---

# 28. FLOATING POINT

Never use binary floating-point numbers for critical monetary arithmetic where precision loss alters business outcomes.

---

# 29. ROUNDING

Determine:

- when rounding occurs
- to how many decimals
- using which rounding mode

---

# 30. ROUNDING ORDER

Example:

```text
discount
tax
fee
rounding
```

Calculation order can mutate final totals.

---

# 31. CURRENCY

Never add:

```text
10 EUR + 10 USD
```

without explicit currency conversion rules.

---

# 32. EXCHANGE RATE

If conversion exists:

- source rate
- timestamp
- rounding

must be strictly defined.

---

# 33. NEGATIVE AMOUNT

Test:

- 0
- negative numbers
- extreme values

against domain rules.

---

# 34. DISCOUNT

Verify:

- max discount cap
- stacking rules
- expiration
- user eligibility
- reuse restrictions

---

# 35. COUPON REUSE

Classic invariant:

```text
one use per user
```

must survive concurrent redemptions.

---

# 36. COUPON GLOBAL LIMIT

If there are:

```text
100 redemptions total
```

verification must be atomic.

---

# 37. INVENTORY

For stock or reservation systems:

```text
available >= 0
```

---

# 38. LAST ITEM RACE

Scenario:

```text
stock = 1

A reads 1
B reads 1

A reserves
B reserves
```

Both must not succeed unless overselling is explicitly supported.

---

# 39. RESERVATION

Map:

- available
- reserved
- sold
- released

---

# 40. RESERVATION EXPIRY

An expired reservation must return capacity exactly once, never twice.

---

# 41. RELEASE DUPLICATION

If a retry invokes release twice:

inventory must not increment twice.

---

# 42. BOOKING

For booking systems verify overlap prevention.

---

# 43. DATE RANGE OVERLAP

Boundary:

```text
A ends exactly when B starts
```

is this permitted?

---

# 44. CONCURRENT BOOKING

Two users attempt to book the same slot simultaneously.

DB and invariants must decide atomically.

---

# 45. QUOTA

For resource limits:

```text
max 5 active resources per user
```

concurrent creations can breach the threshold.

---

# 46. COUNT-THEN-CREATE

Pattern:

```text
count = 4
A checks
B checks
A creates
B creates
```

final count = 6.

---

# 47. SUBSCRIPTIONS

If the system has subscriptions:

map:

- trial
- active
- past due
- cancelled
- expired

---

# 48. ENTITLEMENT

Do not bind entitlement to a single local boolean if the authoritative payment/subscription system states otherwise.

---

# 49. CANCEL AT PERIOD END

Distinguish:

```text
cancelled now
```

from:

```text
cancel scheduled
```

---

# 50. RENEWAL

Webhook and event ordering can alter state.

---

# 51. PAYMENT WEBHOOK

External payment providers can be authoritative for specific payment states.

Audit precedence between local commands and webhooks.

---

# 52. DUPLICATE WEBHOOK

Duplicate payment events must never multiply business side effects.

---

# 53. OUT-OF-ORDER PAYMENT EVENT

Scenario:

```text
payment.succeeded
↓
payment.processing arrives late
```

state must not regress if event versions or timestamps prove otherwise.

---

# 54. REFUND

Refunds:

- full
- partial
- multiple partial

must preserve:

```text
refunded <= paid
```

---

# 55. DOUBLE REFUND

Retries and concurrency must never refund the same amount twice.

---

# 56. CREDIT / BALANCE

If internal balances exist:

every modification requires a clear ledger or equivalent durable invariant mechanism.

---

# 57. BALANCE AS DERIVED VALUE

If balance is stored as both a running total and transaction ledger:

check for drift.

---

# 58. LEDGER

If a ledger exists:

entries must be immutable or strictly controlled.

---

# 59. LEDGER SUM

Stored balances and ledger sums must maintain a reconciliation model if both exist.

---

# 60. TRANSFER

For transfers:

```text
debit A
credit B
```

must be atomic or feature reliable distributed compensation.

---

# 61. PARTIAL TRANSFER

Debiting without crediting represents a critical data integrity failure.

---

# 62. SELF-TRANSFER

If nonsensical:

validate and reject.

---

# 63. LIMITS

Daily, monthly, or business limits must specify:

- timezone
- reset mechanics
- handling of pending transactions
- handling of failed transactions

---

# 64. ORDER

For order flows map:

```text
cart
↓
checkout
↓
payment
↓
confirmed
↓
fulfilled
```

---

# 65. PRICE SNAPSHOT

If product prices change after order creation:

which amount must the order record?

---

# 66. RECOMPUTE PRICE

Never rely on current live product prices when rendering historical orders if orders must preserve snapshots.

---

# 67. CLIENT PRICE

Never trust prices dispatched by clients without server-side validation and calculation.

---

# 68. TAX

If taxes are calculated:

map authority and snapshot behavior.

---

# 69. SHIPPING

Same.

---

# 70. ORDER TOTAL

Verify invariant:

```text
subtotal
- discounts
+ tax
+ fees
= total
```

against actual business rules.

---

# 71. STATUS + PAYMENT

Impossible state example:

```text
order = PAID
payment = FAILED
```

If temporarily allowable due to eventual consistency, it must be explicitly modeled.

---

# 72. STATUS DERIVATION

If status can be derived from other data, redundant persistence can drift.

---

# 73. USER LIFECYCLE

Map:

```text
invited
active
suspended
deleted
```

---

# 74. SUSPENDED USER

Verify which actions remain permitted.

Do not rely solely on login prevention if existing sessions or tokens stay active.

---

# 75. DELETED USER

Background jobs and webhooks must never recreate or mutate records of deleted users without an explicit model.

---

# 76. ACCOUNT MERGE

If supported:

verify identity, ownership consolidation, and duplicate resource resolution.

---

# 77. EMAIL CHANGE

If email serves as login identity:

verify verification workflows and uniqueness guarantees.

---

# 78. ROLE CHANGE

Role mutations must invalidate or update active sessions and cached permissions in line with the security model.

---

# 79. OWNERSHIP TRANSFER

If resources can transfer owners:

verify:

- prior owner permission revocation
- child resource access
- caching
- scheduled jobs

---

# 80. PARENT/CHILD BUSINESS RULE

Children can depend on parent state.

Example:

```text
cannot add item to CLOSED project
```

---

# 81. PARENT STATE RACE

A parent entity may be closed between child validation and child insertion.

---

# 82. CASCADE BUSINESS EFFECTS

Deleting a parent may require:

- cancelling pending jobs
- archiving children
- issuing refunds
- dispatching notifications

Database cascades alone do not execute business side effects.

---

# 83. SOFT DELETE

Soft-deleted resources must not participate in active business rules unless explicitly intended.

---

# 84. RESTORE

If restoring a soft-deleted resource:

verify uniqueness constraints and conflicts against newer records.

---

# 85. ARCHIVE

Archiving is not necessarily deleting.

Access and mutation policies must be clearly separated.

---

# 86. IMMUTABILITY

Certain fields must freeze after reaching specific states.

Example:

```text
invoice amount after issued
```

---

# 87. HISTORY

If business records require historical integrity:

do not query current mutable relations in place of snapshots.

---

# 88. NAME SNAPSHOT

An order should record product name and price at the exact moment of purchase.

If it merely references the current product, history shifts retrospectively.

---

# 89. APPROVAL WORKFLOW

Map:

- requester
- reviewer
- approver

---

# 90. SELF-APPROVAL

If business rules forbid self-approval:

verify enforcement.

---

# 91. TWO-PERSON RULE

If critical actions require two distinct individuals:

DB and service invariants must enforce this strictly.

---

# 92. DUPLICATE APPROVAL

The same approver must not count twice if rules require unique approvers.

---

# 93. PARALLEL APPROVAL

Two approvals simultaneously reaching the threshold must trigger the final side effect exactly once.

---

# 94. THRESHOLD

If:

```text
2 approvals required
```

a third concurrent approval must not execute duplicate finalization.

---

# 95. FEATURE LIMIT

Free vs paid limits must be enforced on the backend, not solely in UI.

---

# 96. PLAN CHANGE

Upgrades and downgrades can alter capacity limits.

Ask what happens if users currently exceed the new quota.

---

# 97. TRIAL

Trial eligibility must prevent trivial reuse if mandated by business goals.

---

# 98. TRIAL START

Never rely on client-supplied start dates.

---

# 99. PROMOTION

Promotional periods and eligibility require server-side enforcement.

---

# 100. REFERRAL

If referral incentives exist:

verify:

- self-referral prevention
- duplicate tracking
- cycle detection
- qualification conditions

---

# 101. REWARD SIDE EFFECT

Rewards must be issued exactly once.

---

# 102. COUNTERS

If the system tracks:

- views
- usage
- quota
- attempts

determine whether exact or approximate semantics are required.

---

# 103. EXACT COUNTER

Financial and quota counters generally require strict atomicity.

---

# 104. APPROXIMATE COUNTER

Analytics page views may not require strong consistency.

Avoid over-engineering where approximations suffice.

---

# 105. RATE-BASED BUSINESS RULE

Example:

```text
3 free exports per month
```

is not just security rate limiting.

It is a business quota.

---

# 106. RESET BOUNDARY

Define monthly and daily resets by timezone and inclusive boundaries.

---

# 107. FILE BUSINESS RULES

If resources link attachments:

verify:

- mandatory file presence
- max attachment counts
- ownership
- deletion policies

---

# 108. FILE REPLACEMENT

Replacement workflows may require:

```text
new upload succeeds
↓
DB update
↓
old file deletion
```

Failure sequencing can leave broken resources.

---

# 109. NOTIFICATION AS BUSINESS SIGNAL

If a user must be notified, email dispatch failure carries business impact.

If purely convenient, behavior differs.

Classify explicitly.

---

# 110. SIDE EFFECT CRITICALITY

For each side effect classify:

```text
CRITICAL
RETRYABLE
BEST-EFFORT
INFORMATIONAL
```

---

# 111. BEST-EFFORT

Analytics logging failure should not abort checkout.

---

# 112. CRITICAL SIDE EFFECT

Payment capture cannot be treated as a casual best-effort callback.

---

# 113. ORDERING SIDE EFFECTS

Map the execution chain:

```text
validate
reserve
charge
commit
notify
```

Analyze what happens if each step fails.

---

# 114. FAILURE MATRIX

For critical workflows:

| Step | If fails before | If fails after | Recovery |
|---|---|---|---|

---

# 115. COMPENSATION

If multiple systems participate:

verify compensation mechanisms.

Example:

```text
inventory reserved
↓
payment fails
↓
release inventory
```

---

# 116. COMPENSATION CAN FAIL

What happens if releasing inventory also fails?

A reconciliation strategy may be necessary.

---

# 117. SAGA

Do not introduce saga frameworks automatically.

Analyze the actual multi-step distributed workflow first.

---

# 118. RECONCILIATION

For eventually consistent architectures ask:

> How is stuck or inconsistent business state detected and repaired?

---

# 119. STUCK STATE

Example:

```text
PROCESSING
```

forever.

Does a timeout or recovery worker exist?

---

# 120. ORPHAN STATE

A resource may lose its parent or external counterpart.

---

# 121. REPAIR JOB

If reconciliation workers exist:

verify they are idempotent and sufficiently conservative.

---

# 122. ADMIN REPAIR

Admin repair tools may be essential, but must not bypass business invariants without auditing.

---

# 123. MANUAL OVERRIDE

If administrators can override rules:

verify:

- permissions
- audit trail
- recorded justification
- allowable state transitions

---

# 124. FORCE FLAG

Search for:

```text
force=true
skipValidation=true
```

and inspect all call sites.

---

# 125. DANGEROUS INTERNAL FLAG

Internal options can become client-controllable through unchecked request mapping.

---

# 126. IMPORT

Bulk imports frequently bypass standard creation flows.

Verify that identical business invariants are enforced.

---

# 127. MIGRATION SCRIPT

Data migrations can create states that runtime code otherwise disallows.

---

# 128. SEED

Production seeding and initialization must respect constraints.

---

# 129. WEBHOOK

External provider events must not be capable of producing impossible local business states.

---

# 130. EVENT CONSUMER

Message events can be stale or duplicated.

---

# 131. EVENT VERSION

If incoming event version < current version:

state must not regress.

---

# 132. EVENTUAL CONSISTENCY

Document which contradictions are:

```text
TEMPORARILY EXPECTED
```

and which are:

```text
INVALID AT ALL TIMES
```

---

# 133. TEMPORARY INCONSISTENCY

Do not report as a bug if the architecture deliberately accommodates brief eventual consistency and guarantees convergence.

---

# 134. NO CONVERGENCE

If temporary inconsistency can persist permanently following a failure:

genuine issue.

---

# 135. CACHE

Business rules must never rely on stale caches when correctness requires current state.

---

# 136. CACHED ELIGIBILITY

Example:

```text
user eligible cached 1h
↓
admin revokes permission
↓
old cache still approves action
```

Security and business impact.

---

# 137. READ REPLICA

If business validation reads from a lagging replica before writing to the primary:

stale reads can violate invariants.

---

# 138. READ-AFTER-WRITE

Critical workflows may mandate consistent primary reads.

---

# 139. EVENTUAL SEARCH INDEX

Search indexes are not authoritative for critical existence or ownership decisions.

---

# 140. EXTERNAL PROVIDER STATE

If an external provider is authoritative:

local stale copies must not drive critical decisions without a freshness strategy.

---

# 141. PAYMENT PROVIDER

A local `paid=true` is inadequate if reconciliation reveals payment revocation.

---

# 142. EMAIL VERIFICATION

If verified status depends on token events:

audit token reuse and expiration as business flows.

Security specifics can belong to dedicated audits.

---

# 143. TOKEN-BASED BUSINESS ACTION

Invitation, reset, and confirmation tokens usually have an invariant:

```text
usable once
```

---

# 144. TOKEN REUSE

Concurrent requests presenting the same token must not both trigger side effects.

---

# 145. INVITE

Map:

```text
created
sent
accepted
expired
revoked
```

---

# 146. ACCEPT AFTER REVOKE

Must not succeed unless explicitly intended by domain rules.

---

# 147. ACCEPT TWICE

Must not generate duplicate memberships.

---

# 148. INVITE EMAIL CHANGE

If an invitation targets an email, verify identity semantics after account updates.

---

# 149. MEMBERSHIP

Unique:

```text
user + organization
```

constraints prevent duplicate memberships.

---

# 150. OWNER LEAVES

If an organization must retain at least one owner:

the last owner must not self-remove or self-demote without transferring ownership.

---

# 151. DELETE LAST ADMIN

Similar invariant.

---

# 152. TEAM LIMIT

Concurrent invitation acceptances can breach plan seat limits.

---

# 153. COUNT PENDING?

Business rules must define whether pending invitations count toward capacity.

---

# 154. APPROVAL COUNT

Rejected or cancelled approvals must not be erroneously counted.

---

# 155. RETRY SEMANTICS

For each business action classify:

```text
SAFE TO RETRY
IDEMPOTENT WITH KEY
NOT SAFE TO RETRY
UNKNOWN
```

---

# 156. LOST RESPONSE

Critical scenario:

```text
business action succeeds
↓
response lost
↓
client retries
```

The final state must remain valid.

---

# 157. DUPLICATE JOB

The same business action dispatched via a queue can be executed multiple times.

---

# 158. CRON REENTRY

A scheduled job may fire again before the previous instance finishes.

---

# 159. LONG-RUNNING BUSINESS JOB

Examples:

- invoicing
- billing
- report generation
- payroll

audit overlap protection and checkpoints.

---

# 160. BATCH PROCESSING

If a job processes 10,000 records:

partial failure must support resume semantics.

---

# 161. CHECKPOINT

Do not mark a batch "completed" until all mandatory records are fully processed.

---

# 162. PARTIAL BATCH

Verify that retries do not re-execute already completed side effects.

---

# 163. BATCH ORDER

If processing order carries business meaning:

queues and batches must preserve ordering.

---

# 164. MONTH-END / PERIOD CLOSE

If domain includes financial closing periods:

subsequent mutations must be disallowed after closure.

---

# 165. BACKDATED CHANGE

Backdating can corrupt historical calculations.

Verify rules.

---

# 166. RECALCULATION

If historical changes require recalculating downstream records:

verify execution.

---

# 167. DERIVED DATA

Map:

```text
source fields
↓
derived fields
```

---

# 168. STORED DERIVED DATA

If derived values are persisted:

who updates them when source inputs change?

---

# 169. DRIFT

Example:

```text
item prices changed
↓
stored invoice total not recalculated
```

Could be a bug or an intended historical snapshot.

Understand domain intent.

---

# 170. SNAPSHOT VS LIVE DERIVATION

Always distinguish explicitly.

---

# 171. AUDIT HISTORY

If business requires change histories:

verify updates do not erase historical meaning.

---

# 172. UPDATED_BY

If actors are tracked:

system and background jobs must possess an explicit actor model.

---

# 173. EVENT TIME VS PROCESS TIME

Business history must differentiate:

```text
occurredAt
processedAt
```

where necessary.

---

# 174. SOURCE

If mutations originate from:

- user
- admin
- webhook
- migration

audit records should capture the origin source.

---

# 175. DOMAIN ERRORS

Business failures must emit recognizable domain error codes:

- limit reached
- invalid transition
- insufficient balance
- already used

---

# 176. GENERIC INTERNAL ERROR

Do not convert expected business rejections into generic 500 errors.

---

# 177. ERROR MESSAGE IS NOT A BUSINESS RULE

Clients must not be forced to parse text strings to determine what occurred.

---

# 178. TRANSACTION

For each invariant verify transaction boundaries.

---

# 179. DB CONSTRAINT

Where feasible, reinforce critical invariants with DB constraints.

Do not attempt to force complex workflow rules into SQL constraints if unsustainable.

---

# 180. APPLICATION-ONLY INVARIANT

If an invariant cannot reside in the DB:

verify strict concurrency controls and centralized service handling.

---

# 181. MULTI-SERVICE INVARIANT

If rules span service boundaries:

document eventual consistency and compensation mechanisms.

---

# 182. DISTRIBUTED LOCK IS NOT THE FIRST ANSWER

First consider:

- conditional writes
- unique constraints
- version checks
- idempotency
- queue partitioning

---

# 183. PROPERTY-BASED TEST

Business invariants are ideal candidates for property-based tests.

Example:

```text
balance never negative
```

---

# 184. STATE MACHINE TEST

Generate sequences of legal and illegal actions to verify state transitions.

---

# 185. CONCURRENCY TEST

For critical invariants:

launch two requests concurrently prior to commit.

---

# 186. RETRY TEST

Submit the same operation ID multiple times.

---

# 187. FAILURE-INJECTION TEST

Inject failures between discrete business steps.

---

# 188. WEBHOOK DUPLICATE TEST

Dispatch the same webhook event twice.

---

# 189. OUT-OF-ORDER EVENT TEST

Process a newer event followed by an older one.

---

# 190. CLOCK BOUNDARY TEST

Test immediately before, exactly at, and after expiration thresholds.

---

# 191. MONEY TEST

Test boundary rounding values:

```text
0.1
0.2
1.005
```

according to storage and decimal rules.

---

# 192. LIMIT TEST

Test exact limits:

```text
limit - 1
limit
limit + 1
```

---

# 193. ZERO TEST

Zero frequently possesses unique domain semantics.

---

# 194. NEGATIVE TEST

Verify behavior when negative values are disallowed.

---

# 195. MAX TEST

Extremely large inputs can reveal numeric overflow vulnerabilities.

---

# 196. INTEGER OVERFLOW

If business counters or amounts use fixed-width integers:

verify operational range.

---

# 197. DUPLICATE ENTITY TEST

Attempt concurrent creation using identical business identities.

---

# 198. CROSS-ENTRY TEST

Execute the same business action via API and worker/admin interfaces.

---

# 199. IMPORT TEST

Embed an invalid row among valid batches to verify partial import semantics.

---

# 200. RECOVERY TEST

Seed stuck intermediate business states and trigger reconciliation.

---

# 201. BUSINESS FLOW MAP

For each critical workflow map:

```text
Initial state
↓
Action
↓
Validation
↓
State change
↓
Side effects
↓
Final state
```

---

# 202. FAILURE FLOW MAP

For the same workflow:

```text
failure after step 1
failure after step 2
failure after step 3
```

---

# 203. FINDING FORMAT

Every serious finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Business process:
Entity:
Invariant:
Current state:
Action:
Expected next state:

Entry point:
File/Class:
Function:
DB table/constraint:
Relevant code:

Problem:

Evidence:

Business Timeline:

T0:
T1:
T2:
T3:

Expected business outcome:

Actual/Possible outcome:

Invariant violated:

Data impact:

Financial impact:

User impact:

Concurrency/retry impact:

Root cause:

Recommended remediation:

Regression test:

Production verification:

Complexity:
XS / S / M / L / XL
```

If not applicable:

**NOT APPLICABLE**

---

# 204. SEVERITY

Use:

## P0 - CRITICAL

- financial corruption
- cross-user ownership corruption
- critical irreversible duplicate action
- catastrophic business state corruption
- security boundary bypass via business logic

## P1 - HIGH

- core invariant can be breached in standard flows
- common concurrency or retry scenario causes data loss
- payment, order, or subscription workflow can terminate in severe inconsistency
- state machine permits critical impossible transitions

## P2 - MEDIUM

- significant domain bug with real user impact
- edge transition or reconciliation failure
- partial side effect inconsistency

## P3 - LOW

- limited business edge case
- minor domain inconsistency

## P4 - IMPROVEMENT

- centralization, clarity, or testability enhancement without confirmed failure

---

# 205. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code + DB + flow directly prove invariant violation.

MEDIUM:

strong code-level scenario, but production concurrency or external systems not verified.

LOW:

depends on undocumented product rules or unknown external contracts.

---

# 206. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 207. PRODUCT RULE STATUS

If it is unclear whether an assumption represents a genuine business invariant:

state:

```text
BUSINESS RULE:
VERIFIED
INFERRED
NOT DOCUMENTED
```

Never invent business rules.

---

# 208. EXTERNAL AUTHORITY

For payment and provider-related findings specify:

```text
EXTERNAL CONTRACT:
VERIFIED
INFERRED
NOT VERIFIED
```

---

# 209. FALSE-POSITIVE PREVENTION

Before any P0/P1/P2 finding verify:

1. all entry points
2. service and business layers
3. DB transactions
4. DB constraints
5. queues and jobs
6. webhooks
7. retry mechanics
8. existing tests
9. product documentation
10. external provider semantics

---

# 210. DO NOT INVENT THE DOMAIN

If evidence is missing that:

```text
one user can have only one X
```

do not declare it an invariant.

Mark:

**BUSINESS RULE NOT DOCUMENTED**

---

# 211. DO NOT RECOMMEND DDD AUTOMATICALLY

Entities, aggregates, domain services, and domain events are not ends in themselves.

Use the simplest architecture that reliably protects invariants.

---

# 212. DO NOT TURN EVERY STATUS INTO A STATE MACHINE FRAMEWORK

If an entity has two simple states, basic guard conditions can suffice.

---

# 213. DO NOT ADD AN EVENT BUS FOR EVERY SIDE EFFECT

Direct synchronous service calls can be completely appropriate.

---

# 214. DO NOT ADD A SAGA FRAMEWORK AUTOMATICALLY

Distributed compensation can often be implemented much more simply.

---

# 215. DO NOT RELY ONLY ON UI

Frontend disabled buttons are not business invariants.

---

# 216. DO NOT RELY ONLY ON SERVICE CHECKS

If critical invariants can be protected by database constraints:

investigate why the final line of defense is absent.

---

# 217. DO NOT MODIFY CODE

During audit:

- do not alter state machines
- do not add constraints
- do not rewrite payment flows
- do not restructure queues
- do not centralize services
- do not refactor domains

Finish the audit first.

---

# 218. OUTPUT - BACKEND_BUSINESS_LOGIC_AUDIT.md

Structure the final report:

## 1. Executive Summary

- domain model
- critical business flows
- invariant coverage
- primary business risks
- state of data integrity

## 2. Domain Entity Map

## 3. Business Invariant Inventory

## 4. Entry Point Map

## 5. State Machine Audit

## 6. Transition Guard Audit

## 7. Concurrency / Race Audit

## 8. Retry / Idempotency Audit

## 9. Transaction Boundary Audit

## 10. Money / Precision Audit

If relevant.

## 11. Inventory / Capacity / Quota Audit

If relevant.

## 12. Order / Booking / Workflow Audit

If relevant.

## 13. Subscription / Entitlement Audit

If relevant.

## 14. Payment / Refund Audit

If relevant.

## 15. User / Ownership Lifecycle Audit

## 16. Parent / Child Domain Rules

## 17. Side Effect Audit

## 18. Webhook / Event Ordering Audit

## 19. Batch / Background Job Audit

## 20. Reconciliation / Recovery Audit

## 21. Time / Expiration Audit

## 22. Historical Snapshot / Derived Data Audit

## 23. Admin / Override Audit

## 24. Test Coverage

## 25. Findings Summary

| ID | Severity | Invariant | Process | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 26. P0 Findings

## 27. P1 Findings

## 28. P2 Findings

## 29. P3 Findings

## 30. P4 Improvements

## 31. Things Done Well

## 32. Unknown / Undocumented Business Rules

## 33. Remediation Roadmap

---

# 219. INVARIANT MATRIX

| Invariant | Entry points | Service guard | DB guard | Concurrent-safe | Status |
|---|---|---|---|---|---|

---

# 220. STATE MACHINE MATRIX

| Entity | From | Action | To | Guard | Atomic |
|---|---|---|---|---|---|

---

# 221. RETRY MATRIX

| Action | Duplicate possible | Idempotent | Business consequence | Protection |
|---|---|---|---|---|

---

# 222. SIDE EFFECT MATRIX

| Business action | Side effect | Criticality | Durable | Retry-safe |
|---|---|---|---|---|

---

# 223. FAILURE MATRIX

| Workflow step | Failure before | Failure after | Recovery |
|---|---|---|---|

---

# 224. SECOND PASS - DOUBLE ACTION ATTACK

For each critical command simulate:

```text
Action
Action
```

simultaneously.

Examples:

- approve twice
- redeem twice
- refund twice
- reserve twice
- accept invite twice

Ask:

> Can both succeed?

---

# 225. SECOND PASS - CONFLICTING ACTION ATTACK

Simulate:

```text
approve
cancel
```

or:

```text
update
delete
```

simultaneously.

---

# 226. SECOND PASS - FAILURE BETWEEN EVERY STEP

For each critical workflow inject failures after each persistent or external side effect.

Ask:

> What residual state remains?

---

# 227. SECOND PASS - LOST RESPONSE

Business action completes successfully, but caller never receives the response.

Repeat the action.

---

# 228. SECOND PASS - DUPLICATE WEBHOOK

Dispatch the same provider webhook event twice.

---

# 229. SECOND PASS - OUT-OF-ORDER WEBHOOK

Process newer state followed by an older event.

Ask whether state can regress.

---

# 230. SECOND PASS - OLD JOB

A delayed background job executes after business state has shifted.

Example:

```text
job scheduled while ACTIVE
↓
entity later CANCELLED
↓
old job executes
```

Ask whether it re-verifies current state.

---

# 231. SECOND PASS - ADMIN BYPASS

Trigger critical actions through admin or internal pathways.

Ask whether they uphold identical hard invariants.

Administrators may have wider privileges, but should not inadvertently corrupt data.

---

# 232. SECOND PASS - TIME BOUNDARY

Test:

```text
1 ms before expiry
exact expiry
1 ms after expiry
```

---

# 233. SECOND PASS - LIMIT BOUNDARY

Test:

```text
limit - 1
limit
limit + 1
```

and two concurrent requests right at the boundary.

---

# 234. SECOND PASS - MONEY BOUNDARY

Test:

- 0
- minimum
- maximum
- decimal rounding
- refund = payment
- refund > payment

---

# 235. SECOND PASS - STALE READ

Assume business checks query stale:

- caches
- replicas
- event projections

Ask whether critical invariants can be breached.

---

# 236. SECOND PASS - PROCESS CRASH

Process terminates abruptly:

```text
after DB commit
before side effect ack
```

Ask what duplicates and what is lost.

---

# 237. SECOND PASS - BATCH PARTIAL FAILURE

Some records succeed, one fails.

Ask:

- rollback?
- continue?
- retry?
- duplication?

---

# 238. SECOND PASS - RECONCILIATION

Deliberately seed impossible or stuck state in test environments.

Ask whether the system can:

- detect it
- report it
- repair it

---

# 239. FINAL QUALITY GATE

Before final response verify:

- business rules are not invented
- critical invariants are explicitly inventoried
- all entry points are inspected
- controller checks are not mistaken for global protection
- state transitions are mapped out
- direct arbitrary status updates are analyzed
- concurrent transitions are checked for atomicity
- retry scenarios include duplicate side-effect analysis
- DB constraints are inspected where applicable
- money precision and rounding are checked where currency exists
- quotas and limits are tested at boundaries and under concurrency
- time-based rules have exact boundary semantics
- webhook events include duplicate and out-of-order analysis
- delayed jobs re-verify current business state where needed
- side effects are classified by criticality
- failure between steps is mapped
- compensation failure is accounted for
- eventual consistency is not mistakenly labeled as a bug when convergence exists
- stored derived data and historical snapshots are not confused
- admin overrides are not blindly accepted as valid invariant bypasses
- P4 architectural suggestions are decoupled from genuine business bugs

---

# FINAL RULE

I do not want a report like:

> Centralize business logic in the service layer and use transactions.

That is not a business logic audit.

I am looking for problems like:

```text
coupon has 1 remaining use
↓
Request A checks remaining = 1
Request B checks remaining = 1
↓
A redeems
B redeems
↓
coupon is used twice
```

or:

```text
Order = SUBMITTED
↓
Request A approves
Request B cancels
↓
both read SUBMITTED
↓
A writes APPROVED
↓
B writes CANCELLED
↓
approval side effects already executed
↓
final order says CANCELLED
```

or:

```text
payment captured
↓
DB update fails
↓
client receives error
↓
client retries checkout
↓
second payment capture occurs
```

or:

```text
refund request = 60
existing refunded = 50
original payment = 100
↓
two concurrent refund requests each validate:
50 + 60 > 100?
using stale value
↓
both proceed
↓
total refunded exceeds payment
```

or:

```text
plan allows max 5 projects
↓
user currently has 4
↓
two create requests run concurrently
↓
both count 4
↓
both create
↓
user ends with 6
```

or:

```text
entity CANCELLED
↓
old delayed job created while entity was ACTIVE executes
↓
job never re-checks current state
↓
entity receives side effect that is no longer allowed
```

or:

```text
payment.succeeded webhook processed
↓
state becomes PAID
↓
older payment.processing event arrives later
↓
consumer blindly applies event
↓
state regresses from PAID to PROCESSING
```

These are the business logic problems you need to find.

Think through:

- invariants
- legal state transitions
- concurrency
- retries
- idempotency
- side effects
- partial failures
- time boundaries
- quotas
- ownership
- external authorities
- reconciliation

For each serious finding you must be able to answer:

> Which business rule is violated?

> Is that rule documented or inferred from code?

> Through what exact sequence of events does the problem occur?

> What other entry points can bypass protections?

> What happens if an operation arrives twice?

> What happens if two conflicting operations execute concurrently?

> What layer serves as the final line of defense?

If the business rule is not verified:

**BUSINESS RULE NOT DOCUMENTED.**

If there is insufficient technical evidence:

**NOT VERIFIED.**

If there is merely a cleaner way to structure business logic without runtime failure:

**P4 - IMPROVEMENT.**

It is better to find 5 genuine invariant violations with exact timelines than to write 100 generic suggestions about the service layer.

The goal is to produce a forensically precise business logic audit from which each serious finding can be directly converted into:

- invariant test
- state-machine regression test
- concurrency test
- DB constraint
- atomic transition
- idempotency guard
- reconciliation mechanism
- production-safe business workflow
