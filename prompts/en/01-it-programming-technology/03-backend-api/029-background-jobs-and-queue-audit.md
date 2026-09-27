---
id: UPL-IT-029
number: 29
slug: background-jobs-and-queue-audit
title: Background Jobs & Queue Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Backend & API
subcategory_id: backend-api
language: en
version: 1.0.0
status: stable
---

# BACKGROUND JOBS AND QUEUE AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the entire background job and queue system of the backend application.

Main objective:

> Determine whether background jobs reliably survive process restarts, retries, duplicate deliveries, worker crashes, queue outages, deployments, concurrency, partial failures, and backlogs without job loss, duplicate side effects, endless retries, stuck jobs, or corrupted business state.

This is not:

- generic advice to use Redis/BullMQ/SQS/RabbitMQ/Kafka
- automatically offloading every slow HTTP request into a queue
- a superficial check to verify whether a worker process is running
- an assumption that every job runs exactly once
- an assumption that retrying blindly solves reliability problems
- automatically increasing worker concurrency limits
- solely a performance audit
- solely an error-handling audit

The focus is on the complete job lifecycle:

```text
job creation
↓
durable enqueue
↓
queue storage
↓
worker claim
↓
processing
↓
side effects
↓
ack / completion
↓
retry / terminal state
```

Priority:

**job durability > idempotency > business correctness > retry safety > concurrency > recovery > backlog control > performance**

It is better to discover 6 real job-loss, duplicate execution, or stuck-worker problems than to produce 100 generic queue recommendations.

---

# 1. DETERMINE JOB STACK

Before filing findings, establish:

- queue technology
- broker and storage engine
- worker framework
- scheduler implementation
- cron engine
- delayed job mechanics
- retry mechanism
- dead-letter queue (DLQ) mechanism
- persistence configuration
- concurrency model
- deployment topology
- observability tooling

Examples:

```text
BullMQ
Redis
Celery
RabbitMQ
SQS
Sidekiq
Hangfire
Quartz
WorkManager-like backend workers
custom DB queue
```

Do not assume the technology stack in advance.

---

# 2. INVENTORY ALL JOBS

Identify:

- background jobs
- scheduled jobs
- cron tasks
- delayed jobs
- queue consumers
- event consumers
- batch processing tasks
- maintenance tasks
- cleanup routines
- export generators
- transactional emails
- push notifications
- billing runs
- reconciliation tasks

For each, document:

```text
Job name:
Trigger:
Queue:
Payload:
Durable:
Retry:
Max attempts:
Timeout:
Concurrency:
Side effects:
Business criticality:
```

---

# 3. JOB CLASSIFICATION

Classify each job:

```text
CRITICAL
IMPORTANT
BEST-EFFORT
MAINTENANCE
ANALYTICS
```

Severity must reflect real-world business and financial impact.

---

# 4. JOB CREATION FLOW

For each job, map:

```text
request/event
↓
business commit
↓
enqueue
```

Ask:

> What happens if the enqueue call fails?

---

# 5. DUAL WRITE

Classic vulnerability:

```text
DB write succeeds
↓
enqueue fails
```

The database state asserts work should happen, but the background job record is lost.

---

# 6. ENQUEUE BEFORE DB COMMIT

Inverse flaw:

```text
job enqueued
↓
worker starts
↓
DB transaction not committed yet
```

The worker queries the database and finds a missing or partial state.

---

# 7. OUTBOX

If a job is triggered by a database state change and must be guaranteed to run:

verify the presence of:

- a transactional outbox table
- a durable work queue table
- an equivalent atomic mechanism

Do not mandate an outbox for low-value, best-effort notifications.

---

# 8. DURABLE ENQUEUE

Pinpoint the precise milestone where a job becomes truly durable on persistent storage.

---

# 9. IN-MEMORY JOB

If the system uses:

```text
setTimeout
in-memory array
thread executor only
```

for work that must survive a process restart:

this is a genuine reliability failure.

---

# 10. SERVERLESS BACKGROUND WORK

Pattern:

```text
return HTTP response
↓
continue async in same process
```

is fundamentally unreliable on serverless platforms.

Verify the specific hosting runtime constraints.

---

# 11. JOB IDENTITY

Every critical job must have a deterministic way to be uniquely identified.

---

# 12. JOB ID VS BUSINESS OPERATION ID

Distinguish:

```text
job attempt ID
```

from:

```text
logical business operation ID
```

A single logical operation can generate multiple execution attempts.

---

# 13. PAYLOAD

Map what the job payload encapsulates:

- full domain object
- resource entity ID
- point-in-time snapshot
- mutable object references

---

# 14. STALE PAYLOAD

If the job carries a historical snapshot of mutable state:

it may apply stale data after the underlying entity has already changed.

---

# 15. RESOURCE ID PAYLOAD

If the job fetches current state at execution time:

this prevents stale state for mutable entities.

However, it is unsuitable if an immutable historical audit snapshot was required.

---

# 16. SNAPSHOT VS CURRENT STATE

Explicitly determine whether each job requires an immutable snapshot or current state.

---

# 17. PAYLOAD SIZE

Bloated payloads degrade:

- queue broker memory
- serialization overhead
- network transit time
- worker heap consumption

---

# 18. SENSITIVE PAYLOAD

Do not store:

- raw passwords
- API access tokens
- full payment credentials

in queue payloads without justification.

---

# 19. SERIALIZATION

Verify:

- schema format
- schema versioning
- type preservation
- backward compatibility

---

# 20. DEPLOYMENT VERSION SKEW

Scenario:

```text
old producer
↓
new worker
```

or:

```text
new producer
↓
old worker
```

during rolling zero-downtime deployments.

---

# 21. JOB PAYLOAD VERSIONING

If jobs can linger in backlogs across deployments:

workers must gracefully parse payloads emitted by older application builds.

---

# 22. CLASS NAME SERIALIZATION

If the queue framework serializes fully qualified class or function names:

renaming or moving classes during deployment will crash pending jobs.

---

# 23. UNKNOWN JOB TYPE

Unknown job types should not be silently dropped without alerting.

---

# 24. WORKER CLAIM

Determine the locking or lease acquisition mechanism used by workers.

---

# 25. VISIBILITY TIMEOUT

If the queue relies on visibility timeouts or leases:

the timeout must be substantially longer than, or actively renewed during, real job execution.

---

# 26. JOB EXCEEDS VISIBILITY TIMEOUT

Scenario:

```text
worker A processes job
↓
visibility expires
↓
worker B receives same job
↓
both run simultaneously
```

Critical duplicate execution risk.

---

# 27. LEASE RENEWAL

If heartbeat or lease renewal is used:

verify failure detection and restart semantics.

---

# 28. ACK

Determine when the queue acknowledges and marks a job complete.

---

# 29. ACK BEFORE SIDE EFFECT

Critical defect:

```text
ack
↓
process crashes
↓
side effect never happens
```

The job is permanently lost.

---

# 30. ACK AFTER SIDE EFFECT

Standard pattern, but carries duplicate delivery risks:

```text
side effect succeeds
↓
process crashes before ack
↓
job redelivered
```

Duplicate execution occurs on restart.

---

# 31. AT-LEAST-ONCE

Most message queues enforce at-least-once delivery, requiring workers to tolerate duplicate runs.

Do not claim exactly-once processing without end-to-end evidence.

---

# 32. IDEMPOTENCY

For each critical job, ask:

> What happens if the exact same logical job executes twice?

---

# 33. IDEMPOTENT DB UPDATE

Example:

```text
set status = PROCESSED
```

is naturally idempotent.

---

# 34. NON-IDEMPOTENT SIDE EFFECT

Example:

```text
send money
increment credit
send email
create invoice
```

requires defensive guards calibrated to financial and business risk.

---

# 35. DEDUP

If job deduplication exists:

verify:

- deduplication key
- key TTL
- persistence mechanism
- cross-instance enforcement

---

# 36. DEDUP IS NOT IDEMPOTENCY

Deduplication prevents enqueuing duplicate items.

It does not protect against:

```text
side effect succeeded
↓
worker crashed before ack
↓
same job redelivered
```

---

# 37. UNIQUE BUSINESS OPERATION

Critical business mutations should enforce unique operation keys in the database.

---

# 38. JOB RETRY

Inventory:

- max retry attempts
- backoff algorithm
- jitter configuration
- retryable error definitions

---

# 39. RETRY ALL

Anti-pattern:

```text
catch every exception
↓
retry
```

Certain errors are permanent and will never resolve via retry.

---

# 40. VALIDATION ERROR

An invalid payload schema will not become valid on retry.

---

# 41. NOT FOUND

Can represent:

- a transient replication race
- a permanent entity deletion
- an expected business branch

Analyze based on domain semantics.

---

# 42. AUTH ERROR

Third-party authentication failures typically require credential rotation or config updates, not fast retry loops.

---

# 43. 429

Apply exponential backoff honoring upstream rate-limit headers.

---

# 44. TIMEOUT

May be transient, but downstream mutation results remain unknown.

---

# 45. 5XX

Bounded retries with backoff are generally appropriate.

---

# 46. RETRY CLASSIFICATION

Categorize errors:

```text
TRANSIENT
PERMANENT
BUSINESS REJECTION
UNKNOWN OUTCOME
CANCELLED
```

---

# 47. NESTED RETRIES

Map retry multiplication:

```text
queue retries
↓
service retries
↓
HTTP client retries
```

Total attempts can easily multiply out of control.

---

# 48. RETRY STORM

An external provider outage combined with hundreds of jobs causes synchronized retry storms upon recovery.

---

# 49. JITTER

Essential for large worker fleets and deep queues.

---

# 50. MAX ATTEMPTS

Never retry indefinitely without explicit business justification.

---

# 51. MAX AGE

Certain jobs expire after a defined time window.

Example:

- push notifications
- time-sensitive reminders

---

# 52. DEAD LETTER

Permanent failures must transition to a terminal state or dead-letter queue (DLQ) where required.

---

# 53. FAILED JOB VISIBILITY

Failed jobs must not vanish silently into unmonitored tables.

---

# 54. POISON JOB

A permanently crashing job must not stall an entire queue.

---

# 55. FIFO QUEUE

If a poison job blocks an entire ordered partition or FIFO group:

verify error isolation and unblocking procedures.

---

# 56. MANUAL RETRY

If an administrator triggers a manual retry:

verify:

- same logical operation ID
- safety of re-executing side effects
- comprehensive audit logging

---

# 57. RETRY AFTER PARTIAL SUCCESS

The most critical distributed failure scenario.

---

# 58. STEP 1 SUCCESS, STEP 2 FAIL

Example:

```text
upload file
↓
DB insert fails
↓
job retries
↓
file uploaded again
```

---

# 59. CHECKPOINTING

Multi-step batch jobs often require durable step checkpointing.

Do not impose checkpointing if the entire job can simply be designed idempotent from the start.

---

# 60. PARTIAL STATE

A retried job must detect which execution stages were already completed.

---

# 61. COMPENSATION

If a job must roll back earlier side effects after a downstream failure:

verify compensation logic.

---

# 62. COMPENSATION FAILURE

What occurs if the compensating rollback action also fails?

---

# 63. CONCURRENCY

Determine worker concurrency boundaries:

- per process
- cluster-wide
- per queue
- per tenant
- per resource

---

# 64. CONCURRENCY > 1

Ask whether two parallel jobs can mutate the same entity concurrently.

---

# 65. RESOURCE CONFLICT

Scenario:

```text
Job A updates order
Job B updates same order
```

---

# 66. SERIALIZATION PER RESOURCE

If ordering must be strictly preserved per entity:

verify queue partitioning, consumer groups, or lock keys.

---

# 67. GLOBAL SERIALIZATION

Running a single global worker preserves ordering but destroys throughput.

Do not recommend global serialization without strict necessity.

---

# 68. PARALLEL SAFE

Independent, embarrassingly parallel tasks should run concurrently.

---

# 69. UNBOUNDED WORKER CONCURRENCY

Can saturate:

- database connection pools
- third-party API quotas
- host CPU
- available memory

---

# 70. DOWNSTREAM CAPACITY

Worker concurrency must align with the capacity of the bottleneck dependency.

---

# 71. CONCURRENCY LIMIT

Do not increase concurrency blindly just because backlogs grow.

First identify why consumption is bottlenecked.

---

# 72. QUEUE BACKLOG

Track:

- queue depth
- oldest job age
- processing latency

---

# 73. DEPTH IS NOT ENOUGH

100,000 one-millisecond jobs differ vastly from 100 ten-minute jobs.

---

# 74. OLDEST JOB AGE

Often the most reliable indicator of user-perceived processing delay.

---

# 75. PRODUCER RATE

Measure:

```text
jobs/sec produced
```

---

# 76. CONSUMER RATE

Measure:

```text
jobs/sec completed
```

---

# 77. NEGATIVE CAPACITY

If:

```text
produce rate > consume rate
```

sustained over time:

backlog expands uncontrollably.

---

# 78. BURST

Queues are designed to absorb short-lived ingestion spikes.

Temporary backlogs are expected behavior if they drain normally.

---

# 79. SUSTAINED OVERLOAD

If the backlog never decreases during normal operations:

this is a fundamental capacity failure.

---

# 80. AUTOSCALING WORKERS

If autoscaling is deployed:

verify the driving metric signal.

---

# 81. SCALE ON DEPTH

Scaling solely on raw depth can over-provision for large, slow jobs.

---

# 82. SCALE ON OLDEST AGE

Often provides a more stable scaling trigger for latency-sensitive workloads.

---

# 83. SCALE LIMIT

Downstream dependency capacity must define hard ceilings for worker autoscaling.

---

# 84. THUNDERING HERD

Scaling 100 new worker pods simultaneously can immediately take down the database or downstream APIs.

---

# 85. QUEUE PRIORITY

If multiple priority levels are used:

verify anti-starvation mechanisms.

---

# 86. HIGH PRIORITY STARVATION

An endless stream of high-priority jobs can permanently starve low-priority tasks.

---

# 87. FAIRNESS

A single abusive tenant or user can saturate an entire shared queue.

---

# 88. PER-TENANT BACKLOG

In multi-tenant systems:

audit noisy-neighbor isolation controls.

---

# 89. QUEUE PARTITION

Partitioning queues aids tenant isolation, but avoid over-engineering without product requirements.

---

# 90. SCHEDULED JOBS

Inventory all cron and scheduled recurring tasks.

---

# 91. DUPLICATE CRON

If every backend app replica executes:

```text
cron every minute
```

the identical scheduled job triggers concurrently across all replicas.

---

# 92. PLATFORM SCHEDULER

If the cloud platform natively guarantees single-instance execution:

do not report duplicate cron runs without verification.

---

# 93. CRON IDEMPOTENCY

Even singleton schedulers can re-fire or retry after transient network disconnects.

---

# 94. LONGER THAN INTERVAL

Scenario:

```text
cron every 5 min
job duration = 10 min
```

Do executions overlap concurrently?

---

# 95. REENTRANCY

If a scheduled job must not execute concurrently with itself:

enforce distributed mutex or overlap prevention locks.

---

# 96. MISFIRE

What happens if the scheduler is down for 2 hours?

- execute once
- execute all missed runs
- skip entirely

---

# 97. BACKFILL STORM

If a recovered scheduler fires all missed intervals at once:

it can cause severe infrastructure overload.

---

# 98. TIMEZONE

Scheduling cron jobs in local time zones introduces daylight saving time (DST) edge cases.

---

# 99. DST DUPLICATE

The repeated hour during fall DST transitions can trigger scheduled runs twice.

---

# 100. DST SKIP

The lost hour during spring DST transitions can skip scheduled executions completely.

---

# 101. MONTH-END

Jobs anchored to calendar boundaries require rigorous validation.

---

# 102. DELAYED JOB

Verify:

- scheduling precision
- persistence guarantees
- restart behavior
- time source drift

---

# 103. CANCEL DELAYED JOB

If the target entity is deleted or cancelled before execution:

the job must verify domain state before proceeding.

---

# 104. STALE JOB

Scenario:

```text
job scheduled while ACTIVE
↓
resource becomes CANCELLED
↓
old job executes
↓
side effect still runs
```

---

# 105. CURRENT STATE CHECK

Delayed jobs must never blindly trust stale payload data when business rules require current entity state.

---

# 106. REMINDERS

A scheduled reminder may become invalid after an intermediate state transition.

---

# 107. EXPIRATION JOBS

If entity expiration relies solely on delayed jobs:

what happens if queue delays postpone execution by 30 minutes?

---

# 108. STATE DERIVATION

Expiration should ideally be evaluated dynamically based on timestamps rather than relying exclusively on physical queue execution.

Do not refactor without domain understanding.

---

# 109. BATCH JOBS

Inventory jobs designed to process large volumes of records.

---

# 110. LOAD ALL

Pattern:

```text
SELECT 1,000,000 rows
↓
process all
```

triggers memory exhaustion and execution timeouts.

---

# 111. CHUNKING

Batch processing must stream or page records in manageable chunks.

---

# 112. CHECKPOINT

If a job crashes after processing record 900,000:

does the retry re-execute from record 0?

---

# 113. DUPLICATE PREVIOUS ITEMS

If processing side effects are non-idempotent:

restarting batch jobs from the beginning is destructive.

---

# 114. PER-ITEM STATE

May be necessary for long-running, critical batch jobs.

---

# 115. TRANSACTION SIZE

Do not wrap one million record updates inside a single database transaction without justification.

---

# 116. PARTIAL BATCH SEMANTICS

Explicitly define:

- all-or-nothing
- partial progress with progress markers
- individual item retry

---

# 117. FAILED ITEM

A single malformed item should not block 999,999 valid records if domain rules permit partial success.

---

# 118. ERROR ISOLATION

Isolate poison records into a failure collection.

---

# 119. BATCH CONCURRENCY

Running excessive batch chunks in parallel saturates database I/O.

---

# 120. EXTERNAL API JOB

For workers integrating with third-party APIs:

verify:

- HTTP timeouts
- retry policies
- rate limit compliance
- request idempotency keys

---

# 121. PROVIDER QUOTA

Worker concurrency must not exceed external API quotas without throttling.

---

# 122. 429

Queues should throttle or delay retries rather than magnifying retry storms upon receiving 429 responses.

---

# 123. EMAIL JOB

Transactional email dispatch is a classic queue workload.

Audit duplicate email transmission risks.

---

# 124. SMS JOB

Same as email, but carries immediate financial billing costs.

---

# 125. PAYMENT JOB

High risk.

Scrutinize unknown network timeout outcomes and payment gateway idempotency keys.

---

# 126. EXPORT JOB

Map lifecycle:

```text
queued
↓
processing
↓
file generation
↓
storage
↓
ready
```

---

# 127. EXPORT DUPLICATION

Retries can generate redundant export files and orphan artifacts.

---

# 128. ORPHAN FILE

File is uploaded to object storage, but the database update fails.

---

# 129. STALE EXPORT

Data can mutate during multi-minute export generations.

Determine whether the business requires:

- an immutable point-in-time snapshot
- eventual current state

---

# 130. IMPORT JOB

Scrutinize partial failure modes and idempotency for file imports.

---

# 131. MEDIA PROCESSING

Video, image, and transcoding jobs carry:

- CPU/GPU bounds
- temporary disk space consumption
- extended execution durations

---

# 132. TEMP CLEANUP

Process crashes must not leave unbounded temporary files on worker disks.

---

# 133. RESOURCE LIMIT

Workers must not spawn more transcoding processes than physical hardware can handle.

---

# 134. RECONCILIATION JOB

Reconciliation tasks repairing data inconsistencies must be exceptionally conservative.

---

# 135. RECONCILIATION IDEMPOTENCY

Repeated execution of reconciliation routines must never corrupt valid data.

---

# 136. CLEANUP JOB

Purging historical records, cached files, or data partitions must enforce strict retention boundaries.

---

# 137. CLEANUP RACE

An entity might transition to active right as the cleanup routine marks it eligible for deletion.

---

# 138. DELETE BY AGE

Verify:

- UTC timezone consistency
- precise cutoff boundaries
- active foreign key and domain references

---

# 139. RETENTION

Never hardcode retention windows without consulting legal and product compliance policies.

---

# 140. JOB CANCELLATION

If users can abort active tasks:

map cancellation mechanics.

---

# 141. CANCEL PENDING

Straightforward state transition before worker acquisition.

---

# 142. CANCEL RUNNING

Complex.

Workers must implement cooperative cancellation tokens if supported by the runtime.

---

# 143. SIDE EFFECT BEFORE CANCEL

Cancellation cannot undo external side effects that were already executed.

---

# 144. TERMINAL STATE

Common terminal job states:

```text
COMPLETED
FAILED
CANCELLED
```

---

# 145. CANCEL RACE

Scenario:

```text
user cancels
↓
worker completes at same moment
```

Determine which terminal state wins deterministically.

---

# 146. STATUS UPDATE ATOMICITY

Terminal state transitions must be atomic and race-free.

---

# 147. JOB TIMEOUT

Establish explicit per-job execution timeouts.

---

# 148. TIMEOUT IS NOT CANCEL

Framework timeouts may mark the job failed while the underlying thread continues running.

Verify runtime semantics.

---

# 149. HARD KILL

If worker processes are abruptly terminated (e.g., OOM killer):

the queue must safely detect and redeliver orphaned jobs.

---

# 150. GRACEFUL SHUTDOWN

Upon receiving SIGTERM/SIGINT during deployments:

- stop claiming new jobs
- allow active jobs to finish or cancel cooperatively
- release leases or un-ack appropriately

according to framework specifications.

---

# 151. DEPLOYMENT

Workers restart frequently during rolling application releases.

This is standard production operation, not an edge case.

---

# 152. JOB DURING DEPLOYMENT

Test behavior when long-running jobs are interrupted by a worker shutdown.

---

# 153. CODE VERSION CHANGE

Pending jobs were serialized by older application code.

New workers must deserialize old payloads or provide data migration paths.

---

# 154. REMOVED WORKER

Never remove a worker class while unconsumed jobs of that type remain in queues.

---

# 155. RENAMED QUEUE

Deploying a queue name change can abandon pending jobs in old queues without consumers.

---

# 156. ORPHAN QUEUE

Search for queue names defined in brokers that have zero active consumers.

---

# 157. PRODUCER WITHOUT CONSUMER

Critical operational failure finding.

---

# 158. CONSUMER WITHOUT PRODUCER

May represent dead legacy code or abandoned features.

---

# 159. CONFIG DRIFT

Producers and workers must not disagree on:

- queue names
- broker connection URLs
- Redis prefixes/namespaces

---

# 160. ENVIRONMENT LEAK

Production producers must never push jobs into staging queues, and vice versa.

---

# 161. PREFIX/NAMESPACE

If dev, staging, and production share a broker:

queue namespaces must be strictly isolated.

---

# 162. CROSS-ENVIRONMENT JOB

Classify as P1/P0 depending on data leakage and mutation impact.

---

# 163. MULTI-TENANCY

Job payloads must carry or deterministically derive proper tenant context.

---

# 164. TENANT CONTEXT LOSS

Scenario:

```text
API has tenant A context
↓
job payload only contains resource ID
↓
worker queries globally
↓
wrong tenant resource matched
```

---

# 165. TENANT AUTH

Workers do not inherit HTTP request headers or user session tokens.

The service layer must explicitly enforce tenant boundaries.

---

# 166. USER CONTEXT

If a job executes on behalf of a user:

verify:

- user ID propagation
- permission snapshots vs current permissions
- handling of deactivated or revoked user accounts

---

# 167. PERMISSION AT EXECUTION TIME

If a user account is suspended before delayed execution:

should the scheduled background job still proceed?

This is a business and security decision.

---

# 168. SYSTEM JOB

Certain background maintenance runs under a privileged system principal.

Document these explicitly.

---

# 169. AUDIT

For high-value background actions, document:

- initiating principal
- worker job ID
- execution timestamp

---

# 170. OBSERVABILITY

For each critical queue, monitor:

- queued count
- active count
- completed count
- failed count
- retried count
- cancelled count
- delayed count

---

# 171. OLDEST AGE

A crucial metric for tracking latency.

---

# 172. PROCESSING DURATION

Track P50, P95, and P99 latency where available.

---

# 173. FAILURE RATE

Track failure percentages per job type.

---

# 174. RETRY RATE

High retry frequencies often mask chronic downstream dependency failures.

---

# 175. DEAD LETTER COUNT

Must be exposed on operational dashboards.

---

# 176. STUCK ACTIVE JOB

Jobs remaining in active states for hours or days indicate orphaned workers or broken lease renewals.

---

# 177. NOISE

Expected business rejections should not trigger high-severity system alerts.

---

# 178. LOG CONTEXT

Job log entries must include:

- job ID
- logical operation ID
- job type
- attempt count
- tenant and entity ID where safe

---

# 179. SENSITIVE PAYLOAD LOG

Never dump raw, unredacted job payloads into production logs.

---

# 180. TRACE CONTEXT

Propagate distributed trace context (OpenTelemetry/W3C) from HTTP intake into background jobs.

---

# 181. TRACE SHOULD NOT SPAN 7 DAYS

Asynchronous trace lifecycles should adapt appropriately to long delays rather than generating 7-day spans.

---

# 182. METRICS CARDINALITY

Do not use high-cardinality values like job IDs as metric labels.

---

# 183. ALERTING

Recommended production alerts:

- oldest job age exceeding SLA
- sustained error rate spikes
- rapid queue depth accumulation
- zero active consumers on queue
- dead-letter queue growth

---

# 184. HEALTH

Worker process liveness alone:

```text
process alive
```

does not prove workers are actively claiming and processing jobs.

---

# 185. QUEUE CONNECTIVITY

Readiness checks should reflect broker connectivity according to architectural standards.

---

# 186. BROKER OUTAGE

What happens to producers when the message broker is down?

---

# 187. ENQUEUE FAILURE

Critical HTTP operations must not return 200 OK if their required background tasks could not be durably enqueued.

---

# 188. BROKER OUTAGE WORKER

Workers must reconnect with backoff rather than entering aggressive busy loops.

---

# 189. REDIS/BROKER RESTART

Audit the persistence configuration (e.g., AOF vs RDB for Redis).

---

# 190. QUEUE DURABILITY

If the broker restarts:

do pending and delayed jobs survive?

---

# 191. EPHEMERAL QUEUE

Acceptable for disposable analytics or telemetry.

Unacceptable for financial or critical business processing without auxiliary persistence.

---

# 192. BROKER DATA LOSS

Verify configured broker durability guarantees, not default assumptions.

---

# 193. BACKUP

Backing up message brokers is rarely sufficient for disaster recovery.

For critical operations, a transactional outbox in the primary database is far more resilient.

---

# 194. REPLAY FROM SOURCE

If the queue loses state, can pending jobs be reconstructed from authoritative database events?

---

# 195. JOB HISTORY

How long are completed and failed job records retained in broker memory?

---

# 196. UNBOUNDED HISTORY

Retaining millions of completed job records in Redis or database tables wastes storage and memory.

---

# 197. AUTO-REMOVE

Immediately purging completed jobs impedes post-incident debugging and audit verification.

Balance based on criticality.

---

# 198. FAILED HISTORY

Failed job records should be retained longer for operational analysis.

---

# 199. TESTS

Map test coverage:

- unit tests
- worker integration tests
- broker integration tests
- retry logic tests
- concurrency tests
- crash-recovery tests
- deployment versioning tests
- backlog stress tests

---

# 200. IN-MEMORY MOCK QUEUE

A synchronous in-memory mock that invokes handlers immediately does not test true distributed queue semantics.

---

# 201. REAL BROKER TEST

Critical reliability workflows are best verified against realistic broker instances in test environments.

---

# 202. DUPLICATE DELIVERY TEST

Dispatch the identical job payload twice.

---

# 203. CONCURRENT DUPLICATE TEST

Dispatch the identical job concurrently across two worker processes.

---

# 204. CRASH AFTER SIDE EFFECT TEST

Execute the external side effect, then terminate the worker before acknowledgment.

---

# 205. CRASH BEFORE SIDE EFFECT TEST

Claim the job and terminate the process immediately.

Verify the job is redelivered.

---

# 206. VISIBILITY TIMEOUT TEST

Execute a task whose duration intentionally exceeds the visibility lease timeout.

---

# 207. RETRY TEST

Simulate transient failures:

```text
fail
fail
success
```

Verify attempt counters and backoff intervals.

---

# 208. PERMANENT ERROR TEST

Verify that invalid payloads do not trigger endless retry cycles.

---

# 209. BROKER OUTAGE TEST

Observe producer and consumer behavior during broker disconnects.

---

# 210. DEPLOYMENT TEST

Enqueue jobs with version 1 payloads, then deploy version 2 workers.

---

# 211. STALE JOB TEST

Mutate entity state between the enqueue moment and actual execution.

---

# 212. CANCEL TEST

Simulate cancellation while jobs are:

- pending
- delayed
- active
- completing

---

# 213. BATCH PARTIAL FAILURE TEST

Simulate a failure after partial records are processed.

---

# 214. QUEUE FLOOD TEST

Enqueue a sudden surge of jobs.

Monitor:

- queue depth
- end-to-end latency
- memory footprint
- downstream database and API saturation

---

# 215. FAIRNESS TEST

Simulate one tenant generating a massive backlog.

Verify whether other tenants continue receiving prompt execution.

---

# 216. CRON DUPLICATION TEST

Run multiple application replicas with embedded schedulers.

---

# 217. CRON OVERLAP TEST

Execute a scheduled task whose duration exceeds the recurrence period.

---

# 218. DST TEST

Simulate daylight saving time boundary shifts if schedules use local time zones.

---

# 219. FINDING FORMAT

Every significant finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Job:
Queue:
Trigger:
Producer:
Worker:
Broker:
Business resource:
Tenant:

File/Class:
Function:
Relevant config:

Problem:

Evidence:

Job Timeline:

T0:
T1:
T2:
T3:

Expected delivery semantics:

Actual/Possible semantics:

Durability point:

Ack point:

Retry behavior:

Attempt:
Concurrency:

Side effect:

Duplicate impact:

Data impact:

Financial impact:

User impact:

Backlog/capacity impact:

Root cause:

Recommended remediation:

Regression/failure-injection test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 220. SEVERITY

Use:

## P0 - CRITICAL

- duplicate job execution causes irreversible financial loss
- worker tenant context failure causes cross-tenant corruption
- background processing flaws cause catastrophic data corruption

## P1 - HIGH

- critical jobs are permanently lost
- standard retries or redeliveries duplicate critical side effects
- deployments or restarts routinely leave jobs permanently stuck
- queue backlogs cause severe business outages
- critical scheduled jobs execute multiple times concurrently without protection

## P2 - MEDIUM

- significant retry, concurrency, or stale-job defects
- jobs experience severe latency or get stuck intermittently
- worker capacity or tenant fairness defects with tangible operational impact

## P3 - LOW

- minor edge-case anomalies
- cosmetic logging or tracking defects

## P4 - IMPROVEMENT

- observability, code structure, or tuning enhancements without confirmed business failure

---

# 221. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

source code, configuration, or tests directly confirm the scenario.

MEDIUM:

strong code evidence exists, but broker runtime configuration is partially unverified.

LOW:

depends on unverified third-party managed broker behaviors.

---

# 222. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 223. DELIVERY SEMANTICS STATUS

Use:

```text
AT-LEAST-ONCE
AT-MOST-ONCE
BEST-EFFORT
UNKNOWN
```

Do not designate exactly-once without verified end-to-end domain safeguards.

---

# 224. JOB IDEMPOTENCY STATUS

Use:

```text
NATURALLY IDEMPOTENT
IDEMPOTENCY GUARDED
DEDUP ONLY
NOT IDEMPOTENT
NOT VERIFIED
```

---

# 225. DURABILITY STATUS

Use:

```text
DURABLE
EPHEMERAL
PARTIALLY DURABLE
NOT VERIFIED
```

---

# 226. FALSE-POSITIVE PREVENTION

Before reporting P0/P1/P2 findings, verify:

1. producer logic
2. queue configuration
3. broker semantics
4. worker execution logic
5. acknowledgment sequence
6. retry policies
7. database constraints
8. side-effect implementations
9. deployment topology
10. test coverage

Do not conclude a flaw exists based solely on an isolated worker handler.

---

# 227. DO NOT ASSUME EXACTLY-ONCE

Queue acknowledgment does not equal exactly-once business execution.

---

# 228. DO NOT SOLVE DUPLICATES WITH DEDUP ALONE

Deduplication does not protect against crashes occurring between side-effect execution and job acknowledgment.

---

# 229. DO NOT INCREASE CONCURRENCY BLINDLY

Backlogs can be caused by:

- database bottlenecks
- downstream 429 rate limits
- lock contention
- oversized jobs

Spawning more workers can exacerbate system collapse.

---

# 230. DO NOT DECREASE CONCURRENCY BLINDLY

Can artificially restrict necessary throughput.

---

# 231. DO NOT INTRODUCE QUEUES EVERYWHERE

Brief, dependable synchronous operations often do not need queue complexity.

---

# 232. DO NOT CONVERT BEST-EFFORT JOBS INTO CRITICAL

Dropping an analytics event may be acceptable.

Dropping payment settlement is not.

---

# 233. DO NOT USE REDIS LOCKS AS THE DEFAULT ANSWER

Conditional database writes, unique constraints, or idempotency keys are often cleaner and more reliable.

---

# 234. DO NOT STORE ENTIRE ORM OBJECTS IN PAYLOADS

Serialized entities often become stale by the time execution occurs.

---

# 235. DO NOT MODIFY CODE

During the audit:

- do not alter queue parameters
- do not modify retry configurations
- do not change worker concurrency
- do not insert outbox patterns
- do not rewrite cron jobs
- do not create dead-letter queues

Complete the full investigation first.

---

# 236. OUTPUT - BACKGROUND_JOBS_QUEUE_AUDIT.md

Structure the final report:

## 1. Executive Summary

- queue stack
- broker infrastructure
- job inventory overview
- delivery semantics summary
- top reliability vulnerabilities

## 2. Queue Architecture Map

## 3. Job Inventory

## 4. Job Criticality Classification

## 5. Producer / Enqueue Audit

## 6. Durability Audit

## 7. Payload / Schema Audit

## 8. Deployment Compatibility Audit

## 9. Worker Claim / Ack Audit

## 10. Idempotency / Duplicate Delivery Audit

## 11. Retry / Backoff Audit

## 12. Dead Letter / Poison Job Audit

## 13. Concurrency / Race Audit

## 14. Queue Backlog / Capacity Audit

## 15. Fairness / Multi-Tenant Audit

## 16. Scheduled / Cron Job Audit

## 17. Delayed / Stale Job Audit

## 18. Batch Job Audit

## 19. External API Worker Audit

## 20. Export / Import / Media Job Audit

If applicable.

## 21. Cancellation Audit

## 22. Worker Shutdown / Deployment Audit

## 23. Broker Failure / Recovery Audit

## 24. Observability / Alerting

## 25. Test Coverage

## 26. Findings Summary

| ID | Severity | Job | Category | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 27. P0 Findings

## 28. P1 Findings

## 29. P2 Findings

## 30. P3 Findings

## 31. P4 Improvements

## 32. Things Done Well

## 33. Unknown / Not Verified

## 34. Reliability Remediation Roadmap

---

# 237. JOB MATRIX

| Job | Queue | Criticality | Retry | Idempotent | Durable |
|---|---|---|---|---|---|

---

# 238. ACK MATRIX

| Job | Side effect | Ack point | Crash window | Duplicate risk |
|---|---|---|---|---|

---

# 239. RETRY MATRIX

| Error | Retryable | Backoff | Max attempts | Side-effect safe |
|---|---|---|---|---|

---

# 240. QUEUE CAPACITY MATRIX

| Queue | Produce rate | Consume rate | Depth | Oldest age | Risk |
|---|---:|---:|---:|---:|---|

---

# 241. CRON MATRIX

| Scheduled job | Frequency | Singleton | Reentrant | Missed-run policy |
|---|---|---|---|---|

---

# 242. SECOND PASS - CRASH AFTER SIDE EFFECT

For each critical job, simulate:

```text
side effect succeeds
↓
worker crashes
↓
ack not sent
↓
job redelivered
```

Determine what duplicates.

---

# 243. SECOND PASS - CRASH BEFORE SIDE EFFECT

```text
job claimed
↓
worker crashes
```

Verify whether the job becomes available for redelivery.

---

# 244. SECOND PASS - VISIBILITY EXPIRY

Execute a task whose runtime exceeds the visibility lease timeout.

Determine whether another worker receives the same job concurrently.

---

# 245. SECOND PASS - CONCURRENT DUPLICATE

Execute two worker processes running the same logical task simultaneously.

---

# 246. SECOND PASS - STALE JOB

Mutate entity state after enqueue but before execution.

Verify whether the worker re-checks required invariants.

---

# 247. SECOND PASS - DEPLOYMENT

Leave jobs pending in the queue.

Deploy a new application release with updated payload or worker code.

Verify whether older jobs can still be processed.

---

# 248. SECOND PASS - QUEUE DOWN

Attempt to enqueue jobs while the broker is down.

Ask:

> Does the caller receive success before the critical task is durable?

---

# 249. SECOND PASS - WORKER DOWN

The queue accumulates jobs without active consumers.

Evaluate how quickly observability tooling detects this state.

---

# 250. SECOND PASS - RETRY STORM

A third-party API returns 503 for a large batch of jobs.

Evaluate the volume of retries and backlog growth rate.

---

# 251. SECOND PASS - 429 PROVIDER

Verify whether concurrency and retries throttle or escalate load against rate-limited providers.

---

# 252. SECOND PASS - POISON JOB

Inject a permanently invalid payload.

Verify:

- retry limit
- final destination
- whether other tasks in the queue are blocked

---

# 253. SECOND PASS - CRON MULTI-INSTANCE

Launch multiple backend or scheduler replicas.

Determine how many duplicate cron firings occur.

---

# 254. SECOND PASS - CRON OVERLAP

The job execution duration exceeds the recurrence interval.

Verify whether executions overlap.

---

# 255. SECOND PASS - BATCH CRASH

A batch job reaches 70% completion before the worker crashes.

Verify what happens upon retry.

---

# 256. SECOND PASS - TENANT FLOOD

A single tenant enqueues an enormous volume of jobs.

Verify whether other tenants continue receiving prompt processing.

---

# 257. SECOND PASS - CANCEL RACE

```text
worker almost finished
||
user cancels
```

Determine which terminal state and side effects emerge.

---

# 258. SECOND PASS - SHUTDOWN

Send SIGTERM while workers have active jobs in flight.

Track:

- job claim behavior
- acknowledgment handling
- lease expiration
- redelivery

---

# 259. SECOND PASS - BROKER RESTART

Verify:

- pending jobs
- delayed jobs
- retry counters
- active leases

before and after a broker reboot.

---

# 260. FINAL QUALITY GATE

Before finalizing the audit report, confirm:

- critical jobs have unambiguous durability guarantees
- database commit and enqueue dual-write scenarios were evaluated
- enqueueing before database transaction commit was investigated
- payload snapshot vs current-state semantics were identified
- forward and backward producer-worker compatibility was verified
- acknowledgment points were mapped relative to external side effects
- duplicate delivery was treated as an operational inevitability
- deduplication was not conflated with true idempotency
- crash-after-side-effect failure modes were analyzed
- visibility timeout durations accommodate realistic job execution times
- retry policies distinguish transient from permanent errors
- nested retry cascades were investigated
- poison jobs have a documented path to dead-letter storage
- worker concurrency is calibrated against downstream capacity limits
- queue backlogs are evaluated via depth and oldest job age
- cron duplicate firings, misfires, and execution overlaps were checked
- delayed jobs re-verify current domain invariants where appropriate
- long-running batch jobs have partial failure and resume mechanisms
- deployments do not abandon orphan queues or job types
- production and staging queue namespaces are strictly isolated
- worker execution preserves tenant boundaries securely
- cancellation is not represented as an undo of irreversible side effects
- broker outage behavior was explicitly evaluated
- observability reliably surfaces missing consumers, stuck jobs, and DLQ growth
- P4 tuning proposals are kept distinct from verified reliability bugs

---

# FINAL RULE

Do not deliver a report that merely states:

> Add a queue, configure retries, use a dead-letter queue, and add more workers.

That is not a background jobs audit.

Look for real issues such as:

```text
order DB transaction commits
↓
enqueue email/fulfillment job fails
↓
API returns success
↓
order exists
↓
required background processing never starts
```

or:

```text
job sends payment/refund request
↓
provider succeeds
↓
worker crashes before queue ack
↓
job is redelivered
↓
same financial operation is attempted again
```

or:

```text
visibility timeout = 30 s
↓
job normally runs 2 min
↓
worker A still processing
↓
queue makes job visible after 30 s
↓
worker B starts same job
↓
two executions overlap
```

or:

```text
delayed job scheduled while resource ACTIVE
↓
resource becomes CANCELLED
↓
job executes 24 h later
↓
handler trusts stale payload
↓
cancelled resource receives forbidden side effect
```

or:

```text
cron configured inside application process
↓
5 backend replicas
↓
all five fire at midnight
↓
same billing job runs five times
```

or:

```text
queue producer uses payload v1
↓
deployment updates worker to v2
↓
old v1 jobs remain pending
↓
new worker cannot deserialize them
↓
jobs permanently fail after deploy
```

or:

```text
one tenant queues 500,000 exports
↓
shared FIFO queue
↓
other tenants' small jobs sit behind them
↓
system is technically alive
↓
legitimate jobs wait for hours
```

or:

```text
worker performs side effect
↓
non-critical analytics call fails
↓
job throws
↓
queue retries entire operation
↓
critical side effect happens twice
```

These are the background job and queue defects you must uncover.

Think through:

- enqueue durability
- acknowledgment timing
- process crashes
- duplicate deliveries
- retries
- stale state
- concurrency
- deployment version skew
- queue backlogs
- cron overlap
- tenant fairness
- downstream dependency limits

For every critical finding, you must be able to answer:

> When does the job become durable?

> When does the queue consider the job complete?

> What happens if the worker crashes before acknowledgment?

> What happens if the worker crashes after executing a side effect?

> Can the same logical job run concurrently on two workers?

> Does retrying duplicate any operation?

> Can pending jobs survive an application release?

> Can a single tenant or job type starve the rest of the system?

If broker delivery semantics are unverified:

**QUEUE DELIVERY SEMANTICS NOT VERIFIED.**

If an observation is simply an architectural enhancement without verified reliability risks:

**P4 - IMPROVEMENT.**

It is better to discover 6 real job-loss, duplicate execution, or stuck-task scenarios than to output 100 generic queue tips.

The ultimate objective is a forensically rigorous Background Jobs & Queue audit that translates directly into:

- crash-window regression tests
- retry and idempotency hardening
- stale-job safeguards
- queue durability fixes
- cron overlap protection
- deployment compatibility adjustments
- backlog and tenant fairness monitoring
- production disaster recovery procedures
