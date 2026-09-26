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
version: 1.0.0
status: stable
---

# ZERO-DOWNTIME DEPLOYMENT AUDIT

I want an in-depth analysis of whether the system can truly be deployed without user-visible downtime, data corruption, or mixed-version failures.

Main objective:

> Prove, rather than assume, that old and new application versions, database schemas, caches, queues, workers, clients, static assets, and configurations can coexist during rollout and rollback.

## 1. DEFINE "ZERO DOWNTIME"

Does not mean absolute 0 ms.

Define according to:

- availability requirement
- error budget
- user-visible impact

If not defined:

**ZERO-DOWNTIME REQUIREMENT NOT DEFINED**

## 2. DEPLOY STRATEGY

- rolling
- blue/green
- canary
- serverless
- recreate

## 3. TRAFFIC FLOW

```text
old instances
+
new instances
↓
same load balancer
↓
same DB/cache/queue
```

## 4. MIXED VERSION PERIOD

The most critical operational concept.

## 5. DB SCHEMA

New schema must remain compatible with old application instances while old replicas are still active.

## 6. ADD COLUMN

Usually safer.

## 7. DROP COLUMN

Breaking for older code.

## 8. RENAME COLUMN

Breaking without a transition compatibility layer.

## 9. CHANGE TYPE

Locking and data type compatibility.

## 10. NOT NULL

Impact on existing/old write queries.

## 11. DEFAULT

Database vs application-level defaults.

## 12. ENUM

Old application cannot recognize new enum values.

## 13. EXPAND-CONTRACT

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

## 14. DUAL WRITE

May be necessary, but introduces data consistency risks.

## 15. BACKFILL

Do not block primary deployment workflows.

## 16. MIGRATION LOCK

DDL table locks on large datasets.

## 17. ONLINE INDEX

Provider/database indexing semantics.

## 18. MIGRATION ORDER

Schema prior to application or application prior to schema based on compatibility plan.

## 19. MIGRATION SINGLETON

Execute from a single job, not across every replica.

## 20. MIGRATION FAILURE

Deploy abort and rollback strategy.

## 21. IRREVERSIBLE MIGRATION

Mitigation plan.

## 22. OLD APP ROLLBACK

Does the old binary operate correctly against the newly migrated schema?

## 23. API BACKWARD COMPATIBILITY

Compatibility with older frontend and mobile clients.

## 24. RESPONSE FIELD REMOVAL

Breaking change.

## 25. REQUEST FIELD REQUIREMENT

New backend immediately requiring fields that older clients do not send.

## 26. STATUS/ENUM VALUE

Older client crashes upon receiving unrecognized values.

## 27. CACHE SCHEMA

Old vs new serialized object formatting.

## 28. CACHE KEY VERSIONING

Prevents deserialization failures.

## 29. CACHE INVALIDATION

Mitigating deploy-time cache stampedes.

## 30. SESSION FORMAT

Old and new application instances must parse identical session formats during rollout.

## 31. TOKEN CLAIM

New versions must not unintentionally invalidate previously issued, valid tokens.

## 32. QUEUE PAYLOAD

Old producer -> new consumer.

## 33. NEW PRODUCER -> OLD CONSUMER

Bidirectional compatibility throughout mixed-fleet operations.

## 34. JOB VERSION

Version envelope wrapper where necessary.

## 35. DELAYED JOB

May execute hours after deployment completes.

## 36. CRON

Old and new cron schedules may run concurrently.

## 37. DUPLICATE SCHEDULER

Concurrency across rolling replicas.

## 38. WEBHOOK VERSION

External providers do not deploy synchronously with your system.

## 39. STATIC ASSETS

Old HTML -> new JS? New HTML -> old assets?

## 40. HASHED ASSETS

Mitigates asset mismatches.

## 41. DELETE OLD ASSETS

Do not purge prematurely.

## 42. CDN

Cache propagation delays.

## 43. SERVICE WORKER

Legacy PWA clients may persist on older bundles.

## 44. FEATURE FLAG

Keeps new code dormant until the entire fleet is running the new release.

## 45. FLAG ROLLBACK

Substantially faster than binary rollbacks.

## 46. CONFIG COMPATIBILITY

Old and new versions reading the same runtime environment.

## 47. SECRET ROTATION

Dual-key overlap periods.

## 48. SIGNING KEY ROTATION

Verifier temporarily accepting both old and new keys per security model.

## 49. TLS/CERT

Independent of application deployment cycles.

## 50. LOAD BALANCER

Readiness probe accuracy.

## 51. NEW INSTANCE STARTUP

Do not route production traffic prior to complete warmup.

## 52. OLD INSTANCE DRAIN

Do not terminate active in-flight requests.

## 53. KEEP-ALIVE

Connection draining behavior.

## 54. WEBSOCKET

Reconnection storms and session re-establishment.

## 55. LONG POLL/SSE

Graceful termination semantics.

## 56. UPLOAD

Long-running file uploads in-flight prior to deploy.

## 57. DOWNLOAD/STREAM

Connection draining during file streaming.

## 58. PAYMENT

Ambiguous transaction states during pod shutdown.

## 59. WORKER SHUTDOWN

Cease fetching new tasks, complete or requeue current jobs.

## 60. GRACE PERIOD

Sufficiently long and strictly bounded.

## 61. HARD KILL

Recovery mechanisms if grace period expires.

## 62. HEALTHCHECK

New version broken -> never becomes ready.

## 63. ROLLOUT PROGRESS DEADLINE

Prevent stalled rollouts from hanging indefinitely.

## 64. CAPACITY DURING ROLLOUT

If 25% of nodes are unavailable during rolling updates:

remaining fleet must comfortably absorb peak load.

## 65. CPU/MEM HEADROOM

Headroom sizing.

## 66. DB CONNECTIONS

Old and new fleet overlap may temporarily spike total connections.

## 67. CANARY

Real user metric evaluation.

## 68. CANARY DB WRITES

Canary instances write against the same database schema.

## 69. BLUE/GREEN

Both environments may process background jobs concurrently.

## 70. BLUE/GREEN BACKGROUND WORKERS

Avoid duplicate asynchronous side effects.

## 71. SWITCHOVER

DNS vs load balancer routing switches.

## 72. ROLLBACK SWITCH

Fast-path cutback.

## 73. SERVERLESS

New deployment activates rapidly, but older client requests and caches persist.

## 74. REGION

Multi-region deployment skew.

## 75. COMPATIBILITY WINDOW

How long must old and new versions coexist?

## 76. MOBILE CLIENT WINDOW

Days or months of expected client lag.

## 77. CONTRACT TEST

Test old client against new server and new client against old server where applicable.

## 78. DB COMPAT TEST

Old binary validated against migrated database schema.

## 79. QUEUE COMPAT TEST

Permutations of old and new producers and consumers.

## 80. SESSION COMPAT TEST

Legacy sessions persisting across deployment boundaries.

## 81. ROLLBACK TEST

Actual validation exercise in a staging environment.

## 82. PRODUCTION SMOKE

Automated smoke verification following each rollout wave.

## 83. SLO MONITOR

Error rates and latency metrics.

## 84. AUTO PAUSE

Automatic rollout halt on canary error spikes.

## 85. FAILURE SCENARIO

New pods reach 50% readiness then database migration fails.

## 86. FAILURE SCENARIO

Migration completes successfully, application boot fails.

## 87. FAILURE SCENARIO

Web application succeeds, background workers fail.

## 88. FAILURE SCENARIO

Rollback binary incompatible with already migrated database.

## 89. FAILURE SCENARIO

New queue payload poisons older consumer workers.

## 90. FAILURE SCENARIO

Legacy browser requests an endpoint removed in the release.

## 91. FINDING FORMAT

```text
ID:
Severity:
Deployment phase:
Old version:
New version:
Shared dependency:
Compatibility assumption:
Failure path:
User impact:
Data impact:
Rollback impact:
Evidence:
Fix:
Verification:
```

## 92. OUTPUT

`ZERO_DOWNTIME_DEPLOYMENT_AUDIT.md`

## 93. COMPAT MATRIX

| Component | Old -> New | New -> Old | Rollback safe |
|---|---|---|---|

Components:

- DB
- API
- sessions
- cache
- queue
- jobs
- assets
- config

## 94. SECOND PASS

Mandatory verification:

- 50/50 split across old and new fleet
- old binary against new schema
- new binary against old-compatible schema
- deploy executed during peak traffic
- long request handling during SIGTERM
- queue messages crossing version boundaries
- sessions crossing version boundaries
- rollback executed post-migration
- legacy mobile/web client interactions
- cron and background job duplication

## 95. FINAL QUALITY GATE

- exact rollout strategy
- mixed-version period
- DB compatibility
- migrations
- client compatibility
- cache/session
- queues/jobs
- static assets
- graceful drain
- capacity
- rollback
- tested failure path

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
