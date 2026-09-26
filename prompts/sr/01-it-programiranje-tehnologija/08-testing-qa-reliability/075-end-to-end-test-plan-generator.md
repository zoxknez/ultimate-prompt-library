---
id: UPL-IT-075
number: 75
slug: end-to-end-test-plan-generator
title: End-to-End Test Plan Generator
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# END-TO-END TEST PLAN GENERATOR

Želim da generišeš production-grade E2E test plan zasnovan na stvarnim critical user journeys, state transitions, permissions, external integrations i recovery behavior-u.

Glavni cilj:

> Dizajnirati najmanji skup E2E scenarija koji daje maksimalnu sigurnost da kompletan sistem radi iz perspektive stvarnog korisnika i production-like infrastrukture.

Ovo nije:

- automatizovanje svakog UI klika
- dupliciranje svih unit/integration testova
- browser test za svaki branch
- samo happy path
- testiranje CSS detalja kroz E2E bez razloga
- ogromna suite koja traje satima bez dodatnog confidence-a

## 1. USER JOURNEY INVENTORY

Za svaki critical journey:

```text
Journey:
Actor:
Entry point:
Preconditions:
Main steps:
Persistent state:
External systems:
Authorization:
Failure/recovery:
Business outcome:
```

## 2. CRITICALITY

## 3. REVENUE

## 4. DATA LOSS

## 5. AUTH

## 6. ADMIN

## 7. USER

## 8. GUEST

## 9. TENANT

## 10. CROSS-TENANT

## 11. SIGNUP

## 12. LOGIN

## 13. PASSWORD RESET

## 14. MFA

## 15. SESSION EXPIRY

## 16. CREATE

## 17. EDIT

## 18. DELETE

## 19. SEARCH

## 20. PAYMENT

## 21. CHECKOUT

## 22. UPLOAD

## 23. EXPORT

## 24. NOTIFICATION

## 25. BACKGROUND PROCESS

## 26. OFFLINE

## 27. RECONNECT

## 28. LONG-RUN JOB

## 29. EXTERNAL CALLBACK

## 30. WEBHOOK

## 31. RECOVERY

## 32. ERROR PATH

## 33. RETRY

## 34. IDEMPOTENCY

## 35. CANCELLATION

## 36. NAVIGATION

## 37. BROWSER BACK

## 38. REFRESH

## 39. DEEP LINK

## 40. MULTI-TAB

## 41. MULTI-DEVICE

## 42. OLD SESSION

## 43. ACCESSIBILITY

Critical keyboard flows where applicable.

## 44. MOBILE VIEWPORT

## 45. DESKTOP VIEWPORT

## 46. BROWSER MATRIX

Only relevant supported set.

## 47. LOCALE

## 48. TIMEZONE

## 49. FEATURE FLAG

## 50. ENVIRONMENT

## 51. PRODUCTION-LIKE BACKEND

## 52. TEST DATA

## 53. ISOLATION

## 54. RESET

## 55. UNIQUE USER

## 56. REAL DB

## 57. REAL QUEUE

Where meaningful.

## 58. MOCK EXTERNAL SERVICE

Use sandbox/stub deliberately.

## 59. CONTRACT DRIFT

## 60. WAIT STRATEGY

Observe state, not arbitrary sleeps.

## 61. UI SELECTOR

Stable semantic selectors.

## 62. DATA-TESTID

Use sparingly.

## 63. ASSERT USER OUTCOME

## 64. ASSERT SERVER STATE

For critical flows.

## 65. ASSERT SIDE EFFECT

## 66. ASSERT NO DUPLICATE

## 67. TRACE

## 68. SCREENSHOT

On failure.

## 69. VIDEO

Optional.

## 70. NETWORK LOG

## 71. DB STATE

## 72. CLEANUP

## 73. PARALLEL

## 74. SHARD

## 75. FLAKE

## 76. RETRY

Retry must not hide failures.

## 77. SMOKE SUBSET

## 78. RELEASE GATE

## 79. NIGHTLY

## 80. FULL SUITE

## 81. POST-DEPLOY

## 82. PROD SYNTHETIC

Where safe.

## 83. FALSE POSITIVE RULES

Ne predlaži E2E test samo zato što behavior postoji.

Prefer E2E kada cross-layer integration itself is the risk.

## 84. EVIDENCE TIERS

```text
A - known critical journey or incident evidence
B - complete cross-system path
C - strong product risk
D - inferred useful scenario
E - optional coverage
```

P0 i P1 journey-ji zahtevaju evidence tier A ili B (poznat critical journey, incident ili kompletna cross-system putanja). Scenario zasnovan samo na tier D evidence je pretpostavljen predlog, a ne confirmed rizik: označi ga kao NOT VERIFIED i ne stavljaj ga u release gate.

## 85. PRIORITY

```text
P0 - release must block
P1 - critical
P2 - important
P3 - useful
P4 - optional
```

## 86. TEST CASE FORMAT

```text
ID:
Priority:
Journey:
Actor:
Preconditions:
Data:
Steps:
Expected UI:
Expected backend state:
Expected external side effects:
Failure artifacts:
Cleanup:
```

## 87. JOURNEY MATRIX

| Journey | Happy | Failure | Auth | Retry | Release gate |
|---|---|---|---|---|---|

## 88. SECOND PASS

For each journey ask:

- refresh halfway
- session expires
- request duplicated
- backend slow
- background job delayed
- user retries
- external provider fails
- another tab modifies same record
- permission changes during flow

## 89. FINAL QUALITY GATE

Confirm:

- critical journeys
- roles
- auth
- persistent state
- external systems
- failure
- retry
- recovery
- release gate
- stable selectors
- deterministic waits
- isolation
- artifacts

## 90. OUTPUT

`END_TO_END_TEST_PLAN.md`

# KONAČNO PRAVILO

E2E suite treba da odgovori:

> Može li stvarni korisnik završiti najvažnije zadatke kroz kompletan sistem i da li sistem ostaje ispravan kada nešto usput pođe po zlu?
