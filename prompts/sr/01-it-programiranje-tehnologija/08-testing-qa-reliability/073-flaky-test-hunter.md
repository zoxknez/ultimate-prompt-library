---
id: UPL-IT-073
number: 73
slug: flaky-test-hunter
title: Flaky Test Hunter
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# FLAKY TEST HUNTER

Želim forenzičku analizu flaky testova sa ciljem da se utvrdi tačan nondeterministic dependency i ukloni root cause, umesto da se problem maskira retries-ima.

Glavni cilj:

> Pronaći testove čiji rezultat zavisi od timing-a, order-a, environment-a, shared state-a, randomness-a, network-a ili hidden dependency-ja i dokazati root cause reproducible metodom.

Ovo nije:

- automatsko brisanje flaky testa
- povećanje timeout-a bez dokaza
- `retry: 3` kao fix
- pretpostavka da test koji jednom padne mora biti flaky
- pretpostavka da spor test mora biti flaky

## 1. FLAKE EVIDENCE

Traži:

- repeated CI failures
- rerun pass
- local vs CI difference
- order-dependent pass/fail
- timing sensitivity

## 2. REPRODUCTION

Run repeatedly.

## 3. SEED

## 4. ORDER

Randomize test order.

## 5. PARALLEL

Compare serial vs parallel.

## 6. RESOURCE CONTENTION

## 7. CLOCK

## 8. SLEEP

## 9. FIXED DELAY

## 10. POLLING

## 11. EVENTUAL CONSISTENCY

## 12. ASYNC NOT AWAITED

## 13. BACKGROUND TASK

## 14. TIMER

## 15. UI ANIMATION

## 16. NETWORK

## 17. EXTERNAL API

## 18. DNS

## 19. RATE LIMIT

## 20. PORT

## 21. TEMP FILE

## 22. FILE LOCK

## 23. DATABASE

## 24. TRANSACTION LEAK

## 25. DATA CLEANUP

## 26. UNIQUE CONSTRAINT

## 27. SHARED DB

## 28. TEST FIXTURE COLLISION

## 29. RANDOM ID COLLISION

## 30. CACHE

## 31. GLOBAL SINGLETON

## 32. ENV VAR MUTATION

## 33. LOCALE

## 34. TIMEZONE

## 35. DST

## 36. CURRENT DATE

## 37. RANDOMNESS

## 38. UNSEEDED RANDOM

## 39. HASH/ITERATION ORDER

## 40. THREADING

## 41. RACE

## 42. PROCESS

## 43. CPU LOAD

## 44. MEMORY PRESSURE

## 45. GC

## 46. BROWSER

## 47. DOM READINESS

## 48. SELECTOR

## 49. STALE ELEMENT

## 50. SCREENSHOT

Rendering variability.

## 51. DEVICE

## 52. EMULATOR

## 53. OS VERSION

## 54. CI RUNNER

## 55. CONTAINER STARTUP

## 56. SERVICE HEALTH

## 57. DEPENDENCY VERSION

## 58. TEST ORDER

## 59. SHARED STATIC STATE

## 60. BEFORE/AFTER HOOK

## 61. MISSING CLEANUP

## 62. RETRY HIDING DEFECT

## 63. PRODUCTION RACE

Important: test flake can reveal real product race.

## 64. TEST-ONLY RACE

Differentiate.

## 65. QUARANTINE

Temporary only, with owner/reason.

## 66. DISABLE

Requires justification.

## 67. TIMEOUT INCREASE

Only if expected operation legitimately requires longer bound.

## 68. CONDITION WAIT

Prefer observable condition over arbitrary sleep.

## 69. VIRTUAL CLOCK

Where appropriate.

## 70. DETERMINISTIC DATA

## 71. ISOLATED RESOURCE

## 72. UNIQUE NAMESPACE

## 73. TEST CONTAINER

## 74. FAKE SERVICE

## 75. CONTRACT

## 76. LOGGING

Capture enough to prove race.

## 77. TIMELINE

Build event sequence.

## 78. TRACE

## 79. FAILURE RATE

## 80. CONDITIONAL RATE

By runner, order, time.

## 81. STATISTICAL REPRO

## 82. FALSE POSITIVE RULES

Ne nazivaj flaky:

- deterministic real regression
- consistent platform incompatibility
- persistent infrastructure outage
- intentionally randomized property test that exposes real failure

## 83. EVIDENCE TIERS

```text
A - repeated controlled reproduction of nondeterministic pass/fail
B - exact race/order/timing path proven
C - strong statistical/log evidence
D - suspected source
E - hardening
```

## 84. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 85. SEVERITY

P0:
rarely applicable, only if flake hides catastrophic product failure gate

P1:
frequent flake masks/retries critical regression or makes release signal unreliable

P2:
material CI instability

P3:
isolated low-frequency flake

P4:
stability improvement

## 86. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Test:
Failure signature:
Pass rate:
Failure rate:
Environment:
Order:
Parallelism:
Timeline:
Shared dependency:
Root cause:
Product bug or test bug:
Fix:
Proof after fix:
```

## 87. FLAKE MATRIX

| Test | Rate | Serial | Parallel | Seed/order | Root cause |
|---|---:|---|---|---|---|

## 88. SECOND PASS

For suspected flaky test:

- run 100x where practical
- randomize order
- vary seed
- serial
- parallel
- CPU constrained
- clock controlled
- timezone changed
- external dependency disabled
- cleanup verified

## 89. FINAL QUALITY GATE

Confirm:

- nondeterminism proven
- root cause identified or explicitly not verified
- retries not mistaken for fix
- product race considered
- deterministic fix validated
- repeated post-fix runs pass

## 90. OUTPUT

`FLAKY_TEST_HUNTER.md`

## 91. FAILURE CHAINS

```text
test clicks "Save"
↓
asserts immediately
↓
database write completes asynchronously
↓
fast runner passes
↓
loaded CI runner asserts before persistence
↓
intermittent failure
```

```text
tests share same user email
↓
parallel execution
↓
both create user
↓
one gets unique constraint
↓
failure depends on scheduling
```

# KONAČNO PRAVILO

Flaky test nije popravljen kada:

```text
više ne pada često
```

nego kada je uklonjen ili kontrolisan nondeterministic dependency i rezultat testa ponovo zavisi samo od ponašanja koje testira.
