---
id: UPL-IT-072
number: 72
slug: missing-test-coverage-hunter
title: Missing Test Coverage Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# MISSING TEST COVERAGE HUNTER

I want a targeted analysis of missing test coverage based on real production risks, not only on coverage percentages.

Main objective:

> Find the concrete behaviors, branches, invariants and failure paths that have no adequate regression protection and rank them by real production risk.

This is not:

- "add a test for every uncovered line"
- a push toward 100%
- an automatic demand to test trivial DTO/getter functions
- a generic list of missing tests
- an assumption that a covered line means tested behavior

## 1. MAP PRODUCTION SURFACE

Inventory:

- critical endpoints
- commands
- jobs
- state transitions
- transactions
- authorization checks
- migrations
- external integrations
- user flows

## 2. MAP EXISTING TESTS

## 3. CODE TO TEST TRACEABILITY

For critical code, find the corresponding tests.

## 4. COVERAGE DATA

If available:

- line
- branch
- condition
- mutation

## 5. NO COVERAGE DATA

Static analysis still possible, but mark uncertainty.

## 6. UNCOVERED BRANCH

## 7. COVERED BUT UNASSERTED

## 8. COVERED BY INCIDENTAL TEST

## 9. CRITICAL INVARIANT

## 10. ERROR BRANCH

## 11. RETRY

## 12. TIMEOUT

## 13. DUPLICATE

## 14. AUTHORIZATION DENIAL

## 15. TENANT BOUNDARY

## 16. INVALID INPUT

## 17. BOUNDARY VALUES

## 18. NULL/EMPTY

## 19. MAXIMUM

## 20. CONCURRENCY

## 21. TRANSACTION ROLLBACK

## 22. PARTIAL EXTERNAL SUCCESS

## 23. RELEASE CONFIGURATION

## 24. FEATURE FLAG

## 25. MIGRATION

## 26. BACKWARD COMPATIBILITY

## 27. SERIALIZATION

## 28. CACHE

## 29. EXPIRY

## 30. TIMEZONE

## 31. DST

## 32. ORDERING

## 33. PAGINATION

## 34. FILE SIZE

## 35. ENCODING

## 36. SPECIAL CHARACTERS

## 37. RACE

## 38. MOBILE PROCESS DEATH

## 39. BROWSER FAILURE

## 40. API CONTRACT

## 41. WEBHOOK SIGNATURE

## 42. RATE LIMIT

## 43. BACKGROUND JOB

## 44. RESTART/RESUME

## 45. KNOWN BUG HISTORY

High-value source.

## 46. RECENT DIFFS

Frequently changed critical code may deserve extra regression protection.

## 47. COMPLEXITY

High branching alone is not proof, but a signal.

## 48. SECURITY-SENSITIVE

## 49. MONEY

## 50. DATA DELETE

## 51. PERMISSIONS

## 52. TEST LAYER

For each missing behavior decide best level:

- unit
- integration
- contract
- E2E
- property
- concurrency

## 53. MINIMAL EFFECTIVE TEST

Do not propose full E2E where unit/integration proves invariant better.

## 54. FALSE POSITIVE RULES

Do not report a gap only because:

- file coverage < 80%
- function has no direct unit test
- generated code is uncovered
- defensive impossible branch lacks test
- framework boilerplate is uncovered

## 55. EVIDENCE TIERS

```text
A - uncovered known regression or reproduced failure
B - critical code path proven without adequate test
C - strong coverage/branch evidence
D - suspected gap
E - optional hardening
```

## 56. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 57. SEVERITY

P0:
catastrophic invariant with demonstrated unguarded regression path

P1:
critical business/security path missing meaningful protection

P2:
material failure path missing

P3:
limited gap

P4:
hardening

## 58. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Production behavior:
Code path:
Existing tests:
Missing scenario:
Why current tests do not catch it:
Failure impact:
Recommended layer:
Concrete test:
Data/setup:
Expected assertions:
```

## 59. COVERAGE MATRIX

| Behavior | Test exists | Assertion strong | Failure path | Priority |
|---|---|---|---|---|

## 60. SECOND PASS

Search specifically for:

- known production bug without regression test
- catch blocks
- rollback paths
- authorization denial
- duplicate handling
- retry
- race
- migrations
- feature flags
- stale cache
- release-only behavior
- background recovery

## 61. FINAL QUALITY GATE

Confirm:

- critical behaviors mapped
- missing vs weak test distinguished
- best test layer selected
- no raw percentage-driven noise
- failure scenario concrete
- proposed tests assert real outcomes

## 62. OUTPUT

`MISSING_TEST_COVERAGE_HUNTER.md`

## 63. FAILURE CHAIN

```text
branch:
if payment already processed -> return existing result
↓
no test executes branch
↓
future refactor removes duplicate check
↓
all existing tests still pass
↓
provider retry charges customer twice
```

# FINAL RULE

Missing test coverage is not:

```text
uncovered line
```

but:

```text
important behavior
+
realistic failure path
+
no adequate automated guard
```
