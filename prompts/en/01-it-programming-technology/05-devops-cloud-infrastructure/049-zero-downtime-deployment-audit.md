---
id: UPL-IT-049
number: 49
slug: zero-downtime-deployment-audit
title: Zero-Downtime Deployment Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.1.0
status: stable
---

# ZERO-DOWNTIME DEPLOYMENT AUDIT

I want an in-depth analysis of whether the system can truly be deployed without user-visible downtime, data corruption, or mixed-version failures.

Main objective:

> Prove, rather than assume, that old and new application versions, database schemas, caches, queues, workers, clients, static assets, and configurations can coexist during rollout and rollback.

## 1. CORE INVARIANT AND NON-GOALS

Core invariant:

> Old and new versions must coexist safely: every combination of old and new code, schema, clients, messages, sessions and caches that can exist during rollout and rollback must work without user-visible errors or data corruption.

Non-goals:

- demanding zero downtime where the stated availability requirement allows a maintenance window
- general CI/CD pipeline security (only the rollout mechanics and compatibility)
- query performance tuning unrelated to migrations or rollout
- infrastructure redundancy outside the deployment process

## 2. CONTEXT DISCOVERY

Establish first:

```text
Platform and rollout mechanism (orchestrator, platform, serverless, VMs behind load balancer):
Rollout parameters (surge, max unavailable, canary steps, pause conditions):
Database engine and version; migration tool; when migrations run:
Components deployed separately (web, API, workers, cron, functions):
Clients and their update model (web SPA, PWA, mobile, desktop, third-party API consumers):
Message brokers, caches and session stores shared across versions:
Stated availability requirement and how downtime is measured:
```

Lock behavior of DDL, online index builds, draining and termination semantics depend on the database engine, platform and version. Verify current version-specific behavior before stating it.

## 3. EVIDENCE MODEL

```text
A - observed: a mixed-version test, staging rollout, rollback exercise or production rollout metrics show the behavior
B - complete path: migration, both code versions and the rollout configuration fully show the compatibility or the break
C - strong static evidence: one side of the pair is clear, the other (old code, old clients, payloads in flight) is not verified
D - inference: plausible incompatibility that depends on timing, traffic or platform behavior not verified
E - hardening: stronger compatibility margin without a current failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - tier A or B evidence shows the mixed-version failure.
- **LIKELY** - tier C evidence.
- **NOT VERIFIED** - depends on old code, clients or in-flight data that could not be inspected.
- **NOT APPLICABLE** - the combination cannot occur (for example no workers, no mobile clients).
- **CONTROLLED** - a flag, version check, compatibility layer or rollout order prevents the combination.
- **HARDENING** - improvement without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete mixed-version, draining, capacity or rollback failure path.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A recreate strategy or maintenance window is not a defect when the stated availability requirement allows it.
- Adding a nullable column, a new table or a new optional field is normally compatible; report it only with a concrete break (for example `SELECT *` mapped positionally, strict deserializers rejecting unknown fields).
- A breaking change is not a finding if the component is never run in mixed versions (single instance with downtime accepted, or the change is gated until the whole fleet is new).
- An irreversible migration is acceptable when a roll-forward plan exists and the old version still works on the new schema.
- A brief error spike is a finding only if it exceeds the stated requirement or corrupts data.

## 6. DEFINE "ZERO DOWNTIME"

Does not mean absolute 0 ms.

Define according to:

- availability requirement
- error budget
- user-visible impact

If not defined:

**ZERO-DOWNTIME REQUIREMENT NOT DEFINED**

## 7. CLAIM VERIFICATION

Do not accept a "zero downtime" claim based on the deployment strategy name ("we use rolling updates", "blue/green"). A claim is supported only by concrete evidence for the mixed-version period: the compatibility pairs below checked, draining behavior verified, capacity during rollout calculated and a rollback exercised after a migration. Without that evidence, report the claim as **NOT VERIFIED**.

## 8. DEPLOY STRATEGY

- rolling
- blue/green
- canary
- serverless
- recreate

## 9. TRAFFIC FLOW

```text
old instances
+
new instances
↓
same load balancer
↓
same DB/cache/queue
```

## 10. MIXED VERSION PERIOD

The most critical operational concept.

## 11. MANDATORY COMPATIBILITY PAIRS

Evaluate every pair that can exist during rollout or rollback; each row needs an answer and evidence:

```text
old app      -> new DB schema          (migration runs before the fleet is replaced; rollback)
new app      -> transitional DB schema (expand phase done, contract not yet)
old producer -> new consumer           (messages already queued, delayed jobs)
new producer -> old consumer           (old workers still running)
old client   -> new API                (cached SPA, mobile, desktop, third parties)
new client   -> old API                (new assets served while old instances handle requests)
old session  -> new app                (and new session -> old app during rollback)
```

Add pairs for caches, tokens, webhooks and configuration where the system has them.

## 12. DB SCHEMA

New schema must remain compatible with old application instances while old replicas are still active.

## 13. ADD COLUMN

Usually safer.

## 14. DROP COLUMN

Breaking for older code.

## 15. RENAME COLUMN

Breaking without a transition compatibility layer.

## 16. CHANGE TYPE

Locking and data type compatibility.

## 17. NOT NULL

Impact on existing/old write queries.

## 18. DEFAULT

Database vs application-level defaults.

## 19. ENUM

Old application cannot recognize new enum values.

## 20. MIGRATION CLASSES

Classify every schema change in the release:

```text
Class        | Old app compatible?                     | Typical safe pattern
add          | usually yes (nullable / with default)   | add, deploy code that uses it
rename       | no                                      | add new, dual write/read, backfill, switch, drop old
drop         | no while old code reads it              | stop reading and writing first, drop in a later release
type change  | often no; may rewrite and lock table    | new column, dual write, backfill, switch
enum add     | old code may reject unknown values      | deploy tolerant readers first, then write new values
constraint   | may reject old writes; validation locks | add unvalidated/not enforced, fix data, then validate
index        | yes, but build may lock writes          | online/concurrent build where supported
backfill     | yes if batched                          | separate job, batched, resumable, throttled
```

For each change record: which versions touch it, lock risk (engine and version specific), duration on production data size, and whether it can be rolled back.

## 21. EXPAND-CONTRACT

Utilize when required:

```text
add
↓
dual-compatible deploy
↓
backfill
↓
switch
↓
remove old
```

## 22. EXPAND-CONTRACT IN DEPTH

For each expand-contract sequence, verify every phase as a separate release:

```text
Phase 1 expand   : new structure added; old code unaffected
Phase 2 dual     : code writes both (or writes new, reads both); old instances still safe
Phase 3 backfill : historical data copied; progress measurable; resumable
Phase 4 switch   : reads move to new structure; verified by comparison
Phase 5 contract : old structure removed only after no running or rollback-able version uses it
```

For each phase check: which versions may be running, what rollback returns to, and what evidence gates the next phase (backfill complete, divergence checks zero, no old clients). Dual writes need a defined source of truth and a reconciliation check for divergence. Contracting in the same release as the switch is a finding when a rollback target still uses the old structure.

## 23. DUAL WRITE

May be necessary, but introduces data consistency risks.

## 24. BACKFILL

Do not block primary deployment workflows.

## 25. MIGRATION LOCK

DDL table locks on large datasets.

## 26. ONLINE INDEX

Provider/database indexing semantics.

## 27. MIGRATION ORDER

Schema prior to application or application prior to schema based on compatibility plan.

## 28. MIGRATION SINGLETON

Execute from a single job, not across every replica.

## 29. MIGRATION FAILURE

Deploy abort and rollback strategy.

## 30. IRREVERSIBLE MIGRATION

Mitigation plan.

## 31. OLD APP ROLLBACK

Does the old binary operate correctly against the newly migrated schema?

## 32. API BACKWARD COMPATIBILITY

Compatibility with older frontend and mobile clients.

## 33. RESPONSE FIELD REMOVAL

Breaking change.

## 34. REQUEST FIELD REQUIREMENT

New backend immediately requiring fields that older clients do not send.

## 35. STATUS/ENUM VALUE

Older client crashes upon receiving unrecognized values.

## 36. CACHE SCHEMA

Old vs new serialized object formatting.

## 37. CACHE KEY VERSIONING

Prevents deserialization failures.

## 38. CACHE INVALIDATION

Mitigating deploy-time cache stampedes.

## 39. SESSION FORMAT

Old and new application instances must parse identical session formats during rollout.

## 40. TOKEN CLAIM

New versions must not unintentionally invalidate previously issued, valid tokens.

## 41. SERIALIZATION COMPATIBILITY

Sessions, tokens, cache entries and queue messages outlive the process that wrote them. For each format:

- can the new version read what the old version wrote, and can the old version read what the new version writes (for rollback)?
- are unknown fields ignored, and missing fields defaulted, by both versions?
- is there a version marker, and does a reader reject or route unknown versions safely instead of crashing or retrying forever?
- how long can data in this format live (session lifetime, token expiry, cache TTL, queue retention, delayed jobs)?

Rule of thumb to verify, not assume: deploy tolerant readers before writers of a new format.

## 42. QUEUE PAYLOAD

Old producer -> new consumer.

## 43. NEW PRODUCER -> OLD CONSUMER

Bidirectional compatibility throughout mixed-fleet operations.

## 44. JOB VERSION

Version envelope wrapper where necessary.

## 45. DELAYED JOB

May execute hours after deployment completes.

## 46. CRON

Old and new cron schedules may run concurrently.

## 47. DUPLICATE SCHEDULER

Concurrency across rolling replicas.

## 48. WEBHOOK VERSION

External providers do not deploy synchronously with your system.

## 49. STATIC ASSETS

Old HTML -> new JS? New HTML -> old assets?

## 50. HASHED ASSETS

Mitigates asset mismatches.

## 51. DELETE OLD ASSETS

Do not purge prematurely.

## 52. CDN

Cache propagation delays.

## 53. SERVICE WORKER

Legacy PWA clients may persist on older bundles.

## 54. LONG-LIVED CLIENTS

Clients do not update when the server does:

- **web SPA and cached assets** - an open tab can run the old bundle for hours or days
- **PWA / service worker** - may keep serving old assets until an update cycle completes
- **mobile and desktop apps** - users may stay on old versions for months
- **third-party API consumers and webhooks** - update on their own schedule

For each API change determine the oldest client version still in use (from telemetry, not assumption), whether the server can identify client versions, and whether a minimum-version or forced-upgrade mechanism exists and has been tested.

## 55. FEATURE FLAG

Keeps new code dormant until the entire fleet is running the new release.

## 56. FLAG ROLLBACK

Substantially faster than binary rollbacks.

## 57. CONFIG COMPATIBILITY

Old and new versions reading the same runtime environment.

## 58. SECRET ROTATION

Dual-key overlap periods.

## 59. SIGNING KEY ROTATION

Verifier temporarily accepting both old and new keys per security model.

## 60. TLS/CERT

Independent of application deployment cycles.

## 61. LOAD BALANCER

Readiness probe accuracy.

## 62. NEW INSTANCE STARTUP

Do not route production traffic prior to complete warmup.

## 63. OLD INSTANCE DRAIN

Do not terminate active in-flight requests.

## 64. KEEP-ALIVE

Connection draining behavior.

## 65. WEBSOCKET

Reconnection storms and session re-establishment.

## 66. LONG POLL/SSE

Graceful termination semantics.

## 67. UPLOAD

Long-running file uploads in-flight prior to deploy.

## 68. DOWNLOAD/STREAM

Connection draining during file streaming.

## 69. TRAFFIC DRAINING MODEL

The correct shutdown order for an instance is:

```text
stop receiving new traffic (readiness fails / deregistered from load balancer)
-> wait for routing changes to propagate
-> stop accepting new work
-> finish or hand off in-flight work within the grace period
-> close connections and exit
```

Check each connection type separately:

```text
HTTP request/response    : in-flight requests finish; keep-alive connections closed cleanly
WebSocket                : clients reconnect with backoff; state restored; no reconnect storm
SSE / long polling       : stream closed with a retry hint; no lost events
uploads                  : long uploads not cut off, or resumable
downloads / streams      : completed or resumable
background jobs          : stop fetching, finish or requeue safely
```

A process that exits immediately on the termination signal, or a load balancer that still routes to it after it stopped listening, produces errors on every deploy.

## 70. PAYMENT

Ambiguous transaction states during pod shutdown.

## 71. WORKER SHUTDOWN

Cease fetching new tasks, complete or requeue current jobs.

## 72. GRACE PERIOD

Sufficiently long and strictly bounded.

## 73. HARD KILL

Recovery mechanisms if grace period expires.

## 74. HEALTHCHECK

New version broken -> never becomes ready.

## 75. ROLLOUT PROGRESS DEADLINE

Prevent stalled rollouts from hanging indefinitely.

## 76. CAPACITY DURING ROLLOUT

If 25% of nodes are unavailable during rolling updates:

remaining fleet must comfortably absorb peak load.

## 77. CPU/MEM HEADROOM

Headroom sizing.

## 78. DB CONNECTIONS

Old and new fleet overlap may temporarily spike total connections.

## 79. CAPACITY AND CONNECTION MATH DURING ROLLOUT

Calculate, do not assume:

```text
serving capacity during rollout = (desired - max unavailable) instances, minus instances warming up
peak load / serving capacity = utilization during rollout (must stay under safe limit)
DB connections during rollout = (old instances + new instances) x pool size + workers + jobs
```

Surge instances, blue/green double fleets and canaries temporarily raise connection counts; compare with the database connection limit. Cold caches and JIT warmup on new instances reduce effective capacity at the start of each wave.

## 80. CANARY

Real user metric evaluation.

## 81. CANARY DB WRITES

Canary instances write against the same database schema.

## 82. CANARY EVALUATION

A canary protects only if it can detect the failure before full rollout:

- are metrics segmented by version, so a canary receiving a small share of traffic is not hidden in the aggregate?
- does canary traffic exercise the changed code paths, and is the sample large enough to be meaningful?
- does the evaluation window cover delayed effects (jobs, cron, cache expiry, next-day batches)?
- are canary writes compatible with the old version, since a rejected canary leaves its data behind?
- does a failed evaluation stop and roll back automatically, and has that been exercised?

## 83. BLUE/GREEN

Both environments may process background jobs concurrently.

## 84. BLUE/GREEN BACKGROUND WORKERS

Avoid duplicate asynchronous side effects.

## 85. DUPLICATE EXECUTION DURING ROLLOUT

During rolling, blue/green and canary deployments, two fleets can run background work at once:

- schedulers or cron in both old and new instances (or both colors) triggering the same job
- queue consumers of both versions processing the same message types with different logic
- singleton tasks (leader-only) with leader election that does not survive the transition

Check for leader election or external scheduling, idempotency keys on side effects (emails, payments, exports) and whether the idle color in blue/green actually stops its workers.

## 86. SWITCHOVER

DNS vs load balancer routing switches.

## 87. ROLLBACK SWITCH

Fast-path cutback.

## 88. ROLLBACK AFTER NEW DATA IS WRITTEN

Once the new version has written data, rolling back the code does not remove that data. For each new data shape (new enum values, new columns populated, new message or session formats, new file layouts), check whether the old version can read, ignore or safely reject it. If not, the real options are a roll-forward fix or a data repair step; state which one applies and whether it is prepared before the release.

## 89. SERVERLESS

New deployment activates rapidly, but older client requests and caches persist.

## 90. REGION

Multi-region deployment skew.

## 91. COMPATIBILITY WINDOW

How long must old and new versions coexist?

## 92. MOBILE CLIENT WINDOW

Days or months of expected client lag.

## 93. CONTRACT TEST

Test old client against new server and new client against old server where applicable.

## 94. DB COMPAT TEST

Old binary validated against migrated database schema.

## 95. QUEUE COMPAT TEST

Permutations of old and new producers and consumers.

## 96. SESSION COMPAT TEST

Legacy sessions persisting across deployment boundaries.

## 97. ROLLBACK TEST

Actual validation exercise in a staging environment.

## 98. PRODUCTION SMOKE

Automated smoke verification following each rollout wave.

## 99. SLO MONITOR

Error rates and latency metrics.

## 100. AUTO PAUSE

Automatic rollout halt on canary error spikes.

## 101. FAILURE SCENARIO

New pods reach 50% readiness then database migration fails.

## 102. FAILURE SCENARIO

Migration completes successfully, application boot fails.

## 103. FAILURE SCENARIO

Web application succeeds, background workers fail.

## 104. FAILURE SCENARIO

Rollback binary incompatible with already migrated database.

## 105. FAILURE SCENARIO

New queue payload poisons older consumer workers.

## 106. FAILURE SCENARIO

Legacy browser requests an endpoint removed in the release.

## 107. MATRICES

### Mixed-Version Compatibility Matrix

| Pair | Can occur during | Duration of exposure | Compatible | Evidence (tier) | Failure if not | Control |
|---|---|---|---|---|---|---|
| old app -> new DB schema | | | | | | |
| new app -> transitional DB schema | | | | | | |
| old producer -> new consumer | | | | | | |
| new producer -> old consumer | | | | | | |
| old client -> new API | | | | | | |
| new client -> old API | | | | | | |
| old session -> new app | | | | | | |

Add rows for caches, tokens, webhooks, static assets, jobs and configuration where applicable.

## 108. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Deployment phase:
Old version:
New version:
Compatibility pair:
Shared dependency:
Scope:
Trigger:
Compatibility assumption:
Expected invariant:
Failure path:
User impact:
Data impact:
Blast radius:
Rollback impact:
Evidence:
Root cause:
Remediation:
Verification:
Regression risk:
```

## 109. SEVERITY

- **P0** - rollout or rollback corrupts or loses data, or makes the service unavailable for all users beyond the stated requirement with no fast recovery.
- **P1** - a normal deploy causes widespread errors during the mixed-version period (dropped column still read, incompatible message format, session invalidation), or rollback is impossible after the release writes data.
- **P2** - errors limited to some users or connection types (long uploads, WebSockets, old clients), duplicate side effects during rollout, capacity or connection limits reached at peak.
- **P3** - transient, self-healing errors within the stated requirement; missing version-segmented metrics.
- **P4** - hardening: stronger compatibility margins, automated compatibility tests, where no current failure path exists.

## 110. OUTPUT

`ZERO_DOWNTIME_DEPLOYMENT_AUDIT.md`

## 111. SECOND PASS

Mandatory verification:

- 50/50 split across old and new fleet
- old binary against the new schema; new binary against the transitional schema
- deploy executed during peak traffic, with capacity and connection math
- long requests, uploads, WebSockets and streams during the termination signal
- queue messages and delayed jobs crossing version boundaries in both directions
- sessions, tokens and cache entries crossing version boundaries in both directions
- rollback executed after the migration and after the new version wrote data
- oldest supported mobile, desktop and cached web clients
- cron and background job duplication across fleets or colors

Then try to disprove each finding: is the combination really reachable given the rollout order, flags and version checks? Does a tolerant reader or compatibility layer already handle it? Record the ones that cannot be disproven with their evidence tier.

## 112. FINAL QUALITY GATE

Before returning the report, verify that it covers:

- the stated availability requirement and whether the "zero downtime" claim is supported by evidence
- exact rollout strategy and parameters
- every mandatory compatibility pair with an answer and evidence tier
- every migration classified, with lock risk and expand-contract phases
- serialization compatibility for sessions, tokens, caches and messages, in both directions
- long-lived clients and the oldest version in use
- static assets, CDN and service worker behavior
- draining for each connection type and background work
- capacity and database connection math during rollout
- canary evaluation and automatic pause/rollback
- duplicate execution of scheduled and background work
- rollback after new data is written, and the roll-forward alternative
- tested failure paths, not only designed ones
- consistent statuses and evidence tiers

# FINAL RULE

Looking for:

```text
migration:
DROP COLUMN legacy_price
↓
rolling deploy starts
↓
old instances still run
↓
old code reads legacy_price
↓
requests fail until rollout completes
```

or:

```text
new producer emits queue payload v2
↓
old worker remains alive during rollout
↓
old worker cannot parse v2
↓
message retries forever
↓
queue backlog grows
```

Other failure chains to look for:

```text
release adds order status "partially_refunded"
↓
new version writes it for a few hundred orders
↓
error spike triggers rollback to the previous version
↓
old code maps status with an exhaustive switch and throws on unknown values
↓
order pages and exports fail for exactly the orders touched after the release
```

```text
blue and green environments both run the scheduler
↓
switchover moves traffic, but the idle color keeps its workers running
↓
daily invoice job runs in both colors
↓
customers receive duplicate invoices and charges
```
