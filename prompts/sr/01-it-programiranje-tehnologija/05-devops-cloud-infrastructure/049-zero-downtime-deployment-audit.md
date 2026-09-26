---
id: UPL-IT-049
number: 49
slug: zero-downtime-deployment-audit
title: Zero-Downtime Deployment Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.0
status: stable
---

# ZERO-DOWNTIME DEPLOYMENT AUDIT

Želim maksimalno duboku analizu da li sistem zaista može da se deployuje bez user-visible downtime-a, data corruption-a i mixed-version failure-a.

Glavni cilj:

> Dokazati, a ne pretpostaviti, da old i new application versions, database schema, caches, queues, workers, clients, static assets i configuration mogu koegzistirati tokom rollout-a i rollback-a.

## 1. DEFINIŠI "ZERO DOWNTIME"

Ne znači apsolutno 0 ms.

Definiši prema:

- availability requirement
- error budget
- user-visible impact

Ako nije definisano:

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

Najvažniji koncept.

## 5. DB SCHEMA

New schema mora biti compatible sa old app dok old replicas postoje.

## 6. ADD COLUMN

Obično safer.

## 7. DROP COLUMN

Breaking za old code.

## 8. RENAME COLUMN

Breaking bez compatibility layer-a.

## 9. CHANGE TYPE

Lock/data compatibility.

## 10. NOT NULL

Existing/old writes.

## 11. DEFAULT

Database vs application default.

## 12. ENUM

Old app ne zna new value.

## 13. EXPAND-CONTRACT

Koristi kad potrebno:

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

Može biti potrebno, ali nosi consistency risk.

## 15. BACKFILL

Ne blokiraj deployment.

## 16. MIGRATION LOCK

Large table DDL.

## 17. ONLINE INDEX

Provider/DB semantics.

## 18. MIGRATION ORDER

Schema pre app ili app pre schema zavisno od compatibility plana.

## 19. MIGRATION SINGLETON

Ne svaka replica.

## 20. MIGRATION FAILURE

Deploy stop/rollback.

## 21. IRREVERSIBLE MIGRATION

Plan.

## 22. OLD APP ROLLBACK

Da li radi sa new schema?

## 23. API BACKWARD COMPATIBILITY

Old frontend/mobile client.

## 24. RESPONSE FIELD REMOVAL

Breaking.

## 25. REQUEST FIELD REQUIREMENT

New backend koji odmah zahteva field old client ne šalje.

## 26. STATUS/ENUM VALUE

Old client crash.

## 27. CACHE SCHEMA

Old/new serialized object format.

## 28. CACHE KEY VERSIONING

Može sprečiti deserialize failures.

## 29. CACHE INVALIDATION

Deploy stampede.

## 30. SESSION FORMAT

Old/new app moraju čitati iste sessions tokom rollout-a.

## 31. TOKEN CLAIM

New version ne sme odbaciti old still-valid token bez namere.

## 32. QUEUE PAYLOAD

Old producer -> new consumer.

## 33. NEW PRODUCER -> OLD CONSUMER

Oba smera tokom mixed fleet-a.

## 34. JOB VERSION

Version envelope gde potrebno.

## 35. DELAYED JOB

Može biti izvršen satima posle deploy-a.

## 36. CRON

Old i new schedules mogu oba raditi.

## 37. DUPLICATE SCHEDULER

Rolling replicas.

## 38. WEBHOOK VERSION

External providers ne deployuju zajedno sa vama.

## 39. STATIC ASSETS

Old HTML -> new JS? New HTML -> old assets?

## 40. HASHED ASSETS

Pomažu.

## 41. DELETE OLD ASSETS

Ne prerano.

## 42. CDN

Propagation.

## 43. SERVICE WORKER

Old PWA may persist.

## 44. FEATURE FLAG

Može držati code dormant dok fleet nije kompletno new.

## 45. FLAG ROLLBACK

Brže od binary rollback-a.

## 46. CONFIG COMPATIBILITY

Old/new versions čitaju isto env.

## 47. SECRET ROTATION

Dual-key overlap.

## 48. SIGNING KEY ROTATION

Verifier može privremeno prihvatati old+new prema security modelu.

## 49. TLS/CERT

Deployment-independent.

## 50. LOAD BALANCER

Readiness.

## 51. NEW INSTANCE STARTUP

Ne primaj traffic pre warmup-a.

## 52. OLD INSTANCE DRAIN

Ne ubij active requests.

## 53. KEEP-ALIVE

Connection draining.

## 54. WEBSOCKET

Reconnect.

## 55. LONG POLL/SSE

Shutdown semantics.

## 56. UPLOAD

Long upload pre deploy.

## 57. DOWNLOAD/STREAM

Drain.

## 58. PAYMENT

Unknown outcome pri shutdown-u.

## 59. WORKER SHUTDOWN

Stop fetching, finish/invalidate current job.

## 60. GRACE PERIOD

Long enough, bounded.

## 61. HARD KILL

Recovery if grace expires.

## 62. HEALTHCHECK

New version broken -> never ready.

## 63. ROLLOUT PROGRESS DEADLINE

Prevent hanging forever.

## 64. CAPACITY DURING ROLLOUT

Ako 25% unavailable:

remaining fleet must handle peak.

## 65. CPU/MEM HEADROOM

## 66. DB CONNECTIONS

New+old overlap may temporarily increase connections.

## 67. CANARY

Real user metric.

## 68. CANARY DB WRITES

Canary uses same schema.

## 69. BLUE/GREEN

Both environments may run jobs.

## 70. BLUE/GREEN BACKGROUND WORKERS

Avoid duplicate side effects.

## 71. SWITCHOVER

DNS/load balancer.

## 72. ROLLBACK SWITCH

Fast path.

## 73. SERVERLESS

New deployment may become active quickly, but old client requests/caches still matter.

## 74. REGION

Multi-region deploy skew.

## 75. COMPATIBILITY WINDOW

Koliko dugo old/new may coexist?

## 76. MOBILE CLIENT WINDOW

Days/months.

## 77. CONTRACT TEST

Test old client/new server and new client/old server where relevant.

## 78. DB COMPAT TEST

Old binary against migrated schema.

## 79. QUEUE COMPAT TEST

Old/new producer-consumer permutations.

## 80. SESSION COMPAT TEST

Old session across deploy.

## 81. ROLLBACK TEST

Actual staging exercise.

## 82. PRODUCTION SMOKE

After each wave.

## 83. SLO MONITOR

Errors/latency.

## 84. AUTO PAUSE

Canary error spike.

## 85. FAILURE SCENARIO

New pods 50% ready then migration fails.

## 86. FAILURE SCENARIO

Migration succeeds, app fails.

## 87. FAILURE SCENARIO

App succeeds, background worker fails.

## 88. FAILURE SCENARIO

Rollback binary incompatible with migrated DB.

## 89. FAILURE SCENARIO

New queue payload poisons old consumer.

## 90. FAILURE SCENARIO

Old browser calls removed endpoint.

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

Obavezno:

- 50/50 old/new fleet
- old binary against new schema
- new binary against old-compatible schema
- deploy during peak
- long request during SIGTERM
- queue message crossing versions
- session crossing versions
- rollback after migration
- old mobile/web client
- cron/job duplication

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

# KONAČNO PRAVILO

Tražim:

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

ili:

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
