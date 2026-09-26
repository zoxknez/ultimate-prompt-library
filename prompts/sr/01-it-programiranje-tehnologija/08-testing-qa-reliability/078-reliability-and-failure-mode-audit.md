---
id: UPL-IT-078
number: 78
slug: reliability-and-failure-mode-audit
title: Reliability & Failure Mode Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# RELIABILITY AND FAILURE MODE AUDIT

Želim kompletan reliability audit aplikacije kroz failure-mode, recovery i degraded-operation perspektivu.

Glavni cilj:

> Utvrditi kako sistem reaguje kada dependency, process, storage, network, queue, cache ili provider radi sporo, delimično, duplirano ili uopšte ne radi, i da li sistem zadržava critical invariants bez silent corruption-a.

Ovo nije:

- "dodaj retries svuda"
- checklist high availability buzzword-a
- pretpostavka da health endpoint 200 znači healthy system
- automatska preporuka multi-region arhitekture
- insistiranje na 99.999%

## 1. RELIABILITY REQUIREMENTS

Za svaki critical flow definiši:

- availability
- correctness
- durability
- recovery time
- recovery point
- degraded behavior

## 2. DEPENDENCY MAP

```text
component
↓
dependency
↓
failure effect
↓
fallback
```

## 3. PROCESS CRASH

## 4. HOST CRASH

## 5. CONTAINER RESTART

## 6. NETWORK PARTITION

## 7. LATENCY

## 8. PACKET LOSS

## 9. DNS

## 10. TLS

## 11. DATABASE DOWN

## 12. DATABASE SLOW

## 13. REPLICA LAG

## 14. CONNECTION EXHAUSTION

## 15. DISK FULL

## 16. STORAGE READ-ONLY

## 17. CACHE DOWN

## 18. CACHE STALE

## 19. QUEUE DOWN

## 20. QUEUE BACKLOG

## 21. DUPLICATE DELIVERY

## 22. OUT-OF-ORDER

## 23. DEAD LETTER

## 24. PROVIDER 5XX

## 25. PROVIDER 429

## 26. PROVIDER TIMEOUT

## 27. PARTIAL SUCCESS

## 28. UNKNOWN OUTCOME

## 29. RETRY

## 30. BACKOFF

## 31. JITTER

## 32. RETRY STORM

## 33. THUNDERING HERD

## 34. CIRCUIT BREAKER

## 35. BULKHEAD

## 36. LOAD SHEDDING

## 37. BACKPRESSURE

## 38. RATE LIMIT

## 39. DEADLINE

## 40. TIMEOUT HIERARCHY

## 41. CANCELLATION

## 42. IDEMPOTENCY

## 43. RECONCILIATION

## 44. COMPENSATION

## 45. CHECKPOINT

## 46. RESUME

## 47. ORPHAN STATE

## 48. LEASE

## 49. LOCK

## 50. FENCING

## 51. CLOCK SKEW

## 52. REGION

## 53. AZ

## 54. QUOTA

## 55. CAPACITY

## 56. AUTOSCALING

## 57. COLD START

## 58. WARMUP

## 59. DEPLOYMENT

## 60. ROLLBACK

## 61. MIGRATION

## 62. OLD/NEW VERSION

## 63. FEATURE FLAG

## 64. CONFIG

## 65. CERTIFICATE EXPIRY

## 66. SECRET ROTATION

## 67. BACKUP

## 68. RESTORE

## 69. DR

## 70. RPO

## 71. RTO

## 72. DATA CORRUPTION

## 73. LOGICAL CORRUPTION

## 74. REPLICATION

## 75. SPLIT BRAIN

Where relevant.

## 76. OBSERVABILITY

## 77. SLI

## 78. SLO

## 79. ERROR BUDGET

Only if useful.

## 80. ALERT

## 81. ALERT FATIGUE

## 82. HEALTH CHECK

## 83. READINESS

## 84. LIVENESS

## 85. DEPENDENCY HEALTH

## 86. BUSINESS HEALTH

## 87. SYNTHETIC

## 88. CHAOS

## 89. FAULT INJECTION

## 90. SAFE ENVIRONMENT

## 91. GAME DAY

## 92. RUNBOOK

## 93. ON-CALL

## 94. INCIDENT COMMUNICATION

## 95. RECOVERY VERIFY

## 96. DATA RECONCILIATION

## 97. FALSE POSITIVE RULES

Ne prijavljuj automatski:

- single region
- no circuit breaker
- retries
- no multi-region
- synchronous architecture

bez requirement-a i concrete failure impact-a.

## 98. EVIDENCE TIERS

```text
A - fault injection, incident or production evidence
B - complete failure/recovery path
C - strong static evidence
D - plausible failure needing validation
E - resilience hardening
```

## 99. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 100. SEVERITY

P0:
catastrophic data loss/corruption or global unrecoverable outage

P1:
critical realistic failure with severe outage/corruption and weak recovery

P2:
material reliability weakness

P3:
limited degradation

P4:
hardening

## 101. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Flow:
Dependency:
Failure:
Detection:
Immediate behavior:
Retry:
Persistent state:
Recovery:
Data risk:
User impact:
Blast radius:
Evidence:
Fix:
Fault-injection test:
Runbook:
```

## 102. FAILURE MODE MATRIX

| Dependency | Failure | Detection | System response | Recovery |
|---|---|---|---|---|

## 103. FLOW RELIABILITY MATRIX

| Flow | Dependency outage | Duplicate | Timeout | Restart | Recovery |
|---|---|---|---|---|---|

## 104. SECOND PASS

Inject:

- DB latency
- DB restart
- queue duplicate
- queue delay
- provider timeout
- disk full
- cache loss
- network partition
- process kill
- deployment rollback
- expired credential
- 10x load
- partial external success

## 105. FINAL QUALITY GATE

Confirm:

- dependencies
- timeouts
- retries
- idempotency
- backpressure
- process restart
- persistence
- queues
- DB
- cache
- providers
- deployment
- config/secrets
- backup/restore
- observability
- fault injection
- runbooks

## 106. OUTPUT

`RELIABILITY_FAILURE_MODE_AUDIT.md`

## 107. FAILURE CHAIN

```text
provider latency increases
↓
application timeout is longer than request deadline
↓
requests accumulate
↓
connection pool saturates
↓
healthy endpoints cannot acquire connections
↓
partial provider slowdown becomes full application outage
```

# KONAČNO PRAVILO

Pouzdan sistem nije sistem u kome dependency nikad ne pada.

Pouzdan sistem je onaj koji:

```text
failure očekuje
ograničava blast radius
čuva invariants
i ima dokaziv recovery path
```
