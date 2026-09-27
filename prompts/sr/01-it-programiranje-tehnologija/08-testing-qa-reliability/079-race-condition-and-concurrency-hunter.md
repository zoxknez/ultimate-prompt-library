---
id: UPL-IT-079
number: 79
slug: race-condition-and-concurrency-hunter
title: Lov na race condition i probleme konkurentnosti
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# LOV NA RACE CONDITION I PROBLEME KONKURENTNOSTI

Želim duboku analizu svih concurrency, race i interleaving failure path-ova u aplikaciji.

Glavni cilj:

> Pronaći situacije u kojima dva ili više legitimnih execution path-ova istovremeno čitaju ili menjaju shared state i mogu prekršiti business invariant, čak i kada je svaki path pojedinačno ispravan.

Ovo nije:

- samo thread race audit
- automatska preporuka lock-a
- pretpostavka da database transaction rešava sve race-ove
- pretpostavka da JavaScript/single-thread znači nema concurrency problema

## 1. SHARED STATE INVENTORY

- DB rows
- cache
- files
- memory
- queue
- external API
- distributed resource
- counters
- quotas
- inventory
- session

## 2. CONCURRENT ACTORS

- requests
- workers
- schedulers
- retries
- webhooks
- users
- devices
- tabs

## 3. INVARIANT

## 4. READ-MODIFY-WRITE

## 5. CHECK-THEN-ACT

## 6. CHECK-THEN-INSERT

## 7. LOST UPDATE

## 8. DUPLICATE CREATE

## 9. WRITE SKEW

## 10. STALE WRITE

## 11. DELETE/UPDATE

## 12. REVOKE/USE

## 13. EXPIRE/RENEW

## 14. QUOTA

## 15. BALANCE

## 16. INVENTORY

## 17. SEQUENCE

## 18. UNIQUE CONSTRAINT

## 19. UPSERT

## 20. ATOMIC UPDATE

## 21. TRANSACTION

## 22. ISOLATION

Engine-specific.

## 23. OPTIMISTIC LOCK

## 24. VERSION COLUMN

## 25. PESSIMISTIC LOCK

## 26. DEADLOCK

## 27. LOCK ORDER

## 28. LOCK TIMEOUT

## 29. LONG TRANSACTION

## 30. RETRY

## 31. SERIALIZATION FAILURE

## 32. REPLICA

## 33. STALE READ

## 34. READ-AFTER-WRITE

## 35. CACHE

## 36. CACHE INVALIDATION

## 37. DOUBLE CACHE FILL

## 38. DISTRIBUTED LOCK

## 39. LEASE

## 40. TTL

## 41. FENCING TOKEN

## 42. CLOCK

## 43. LEADER

## 44. DUPLICATE WORKER

## 45. QUEUE DUPLICATE

## 46. OUT-OF-ORDER

## 47. RETRY AFTER SUCCESS

## 48. IDEMPOTENCY KEY

## 49. SAME KEY CONCURRENCY

## 50. BACKGROUND JOB

## 51. SCHEDULER OVERLAP

## 52. WEBHOOK

## 53. PAYMENT

## 54. FILE

## 55. OBJECT STORAGE

## 56. EXTERNAL API

## 57. UNKNOWN OUTCOME

## 58. MULTI-SERVICE

## 59. SAGA

## 60. EVENTUAL CONSISTENCY

## 61. SESSION

## 62. MULTI-TAB

## 63. MULTI-DEVICE

## 64. PERMISSION CHANGE

## 65. AUTH CACHE

## 66. FEATURE FLAG CHANGE

## 67. CONFIG CHANGE

## 68. PROCESS RESTART

## 69. DEPLOYMENT

## 70. OLD/NEW VERSION

## 71. INTERLEAVING PROOF

Za svaki race napiši:

```text
T1:
T2:
```

korak po korak.

## 72. DETERMINISTIC REPRO

Use:

- barrier
- latch
- hooks
- test transaction coordination

## 73. STRESS TEST

Useful after deterministic proof.

## 74. TSAN/RACE DETECTOR

Where applicable.

## 75. DB LOCK INSPECTION

## 76. TRACE

## 77. FALSE POSITIVE RULES

Ne prijavljuj race samo zato što:

- two requests can run concurrently
- lock missing
- transaction absent

Mora postojati shared state + harmful interleaving.

## 78. EVIDENCE TIERS

```text
A - deterministically reproduced race
B - complete interleaving proof
C - strong static concurrency evidence
D - plausible interleaving requiring test
E - hardening
```

## 79. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 80. SEVERITY

P0:
catastrophic corruption/security concurrency failure

P1:
repeatable duplicate money/data loss/authorization race

P2:
material consistency problem

P3:
limited conflict

P4:
hardening

## 81. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Invariant:
Shared state:
Actors:
T1:
T2:
Harmful interleaving:
Current protection:
Why insufficient:
Impact:
Evidence:
Fix:
Deterministic regression test:
```

## 82. CONCURRENCY MATRIX

| Resource | Actors | Invariant | Atomicity | Race protected |
|---|---|---|---|---|

## 83. SECOND PASS

Search:

- all read-modify-write
- existence checks
- balance/quota
- unique creation
- retry paths
- duplicate events
- scheduler
- permission change
- distributed locks
- cache invalidation
- process restart

## 84. FINAL QUALITY GATE

Confirm:

- shared state
- actors
- interleaving
- transaction semantics
- isolation
- locks
- retries
- queue
- external side effects
- deterministic tests
- false positives

## 85. OUTPUT

`RACE_CONDITION_CONCURRENCY_HUNTER.md`

## 86. FAILURE CHAIN

```text
T1 reads stock = 1
T2 reads stock = 1

T1 validates stock > 0
T2 validates stock > 0

T1 writes stock = 0
T2 writes stock = 0
↓
two orders accepted for one item
```

# KONAČNO PRAVILO

Race finding nije:

```text
"this code might run concurrently"
```

nego dokaz:

```text
shared invariant
+
two valid actors
+
specific interleaving
+
wrong final state
```
