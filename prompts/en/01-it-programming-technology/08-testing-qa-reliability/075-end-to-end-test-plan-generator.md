---
id: UPL-IT-075
number: 75
slug: end-to-end-test-plan-generator
title: End-to-End Test Plan Generator
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# END-TO-END TEST PLAN GENERATOR

I want you to generate a production-grade E2E test plan based on real critical user journeys, state transitions, permissions, external integrations and recovery behavior.

Main objective:

> Design the smallest set of E2E scenarios that gives maximum confidence that the complete system works from the perspective of a real user and production-like infrastructure.

This is not:

- automating every UI click
- duplicating all unit/integration tests
- a browser test for every branch
- only the happy path
- testing CSS details through E2E without a reason
- a huge suite that runs for hours without additional confidence

## 1. USER JOURNEY INVENTORY

For each critical journey:

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

Do not propose an E2E test only because a behavior exists.

Prefer E2E when the cross-layer integration itself is the risk.

## 84. EVIDENCE TIERS

```text
A - known critical journey or incident evidence
B - complete cross-system path
C - strong product risk
D - inferred useful scenario
E - optional coverage
```

P0 and P1 journeys need evidence tier A or B (a known critical journey, an incident or a complete cross-system path). A scenario based only on tier D evidence is an inferred suggestion, not a confirmed risk: mark it NOT VERIFIED and do not make it a release gate.

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

# FINAL RULE

The E2E suite should answer:

> Can a real user complete the most important tasks through the complete system, and does the system stay correct when something goes wrong along the way?
