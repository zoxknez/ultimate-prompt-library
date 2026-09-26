---
id: UPL-IT-074
number: 74
slug: regression-test-generator
title: Regression Test Generator
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# REGRESSION TEST GENERATOR

Based on a specific bug, incident, PR or fix, I want you to generate a minimal but robust regression test set that will reliably prevent the same failure class from returning.

Main objective:

> Turn a proven bug into a permanent automated guard that checks the real invariant and, where useful, neighboring variants of the same root cause.

This is not:

- only a test that reproduces the exact input
- a snapshot of the current broken output
- generating dozens of redundant tests
- testing implementation details
- copying the fix into the test so that both can be wrong in the same way

## 1. BUG INPUT

Collect:

```text
Bug:
Trigger:
Observed result:
Expected result:
Root cause:
Fix:
Affected layer:
Production impact:
```

## 2. PROVE BUG

If possible, the test should fail before the fix.

## 3. INVARIANT

Translate the bug into a general invariant.

## 4. FAILURE CLASS

Example:

```text
duplicate webhook
timezone boundary
missing tenant filter
lost update
stale cache
off-by-one
null handling
```

## 5. MINIMAL REPRO

## 6. REALISTIC REPRO

## 7. BEST TEST LAYER

## 8. UNIT

## 9. INTEGRATION

## 10. CONTRACT

## 11. E2E

## 12. CONCURRENCY

## 13. PROPERTY

## 14. FIXTURE

Use smallest realistic setup.

## 15. ASSERT INVARIANT

Not implementation.

## 16. ASSERT SIDE EFFECT

## 17. ASSERT NEGATIVE EFFECT

Example:

"second charge does not occur".

## 18. ASSERT DATABASE

## 19. ASSERT EXTERNAL CALL COUNT

Where relevant.

## 20. BOUNDARY NEIGHBOR

Test one or more nearby values if root cause implies class.

## 21. BEFORE/AFTER

## 22. EMPTY

## 23. DUPLICATE

## 24. RETRY

## 25. CONCURRENCY

## 26. INVALID

## 27. PERMISSION

## 28. ALTERNATE ROLE

## 29. MULTI-TENANT

## 30. TIME

## 31. CLOCK

## 32. DST

## 33. VERSION

## 34. MIGRATION

## 35. OLD CLIENT

## 36. FEATURE FLAG

## 37. TEST NAME

Describe invariant.

## 38. FAILURE MESSAGE

## 39. DETERMINISM

## 40. CLEANUP

## 41. NO SLEEP

Unless timing itself is under test and bounded.

## 42. CONCURRENCY CONTROL

Use barriers/latches where possible.

## 43. TEST FAILS ON OLD CODE

Strong regression proof.

## 44. TEST PASSES ON FIX

## 45. MUTATION

If practical, verify removing fix makes test fail.

## 46. FALSE POSITIVE RULES

Do not generate additional tests only because:

- related function exists
- nearby lines changed
- coverage could increase

Every test should protect an identifiable behavior.

## 47. EVIDENCE TIERS

```text
A - test demonstrably fails on buggy version and passes on fixed version
B - root cause/invariant fully mapped
C - strong inferred regression scenario
D - speculative adjacent scenario
E - optional hardening
```

REQUIRED tests are based on evidence tier A or B. A test built on tier C or D evidence names the assumption it depends on; a speculative adjacent scenario (tier D) is never REQUIRED. A bug counts as confirmed only when it has been reproduced or its root cause is fully mapped; otherwise mark the bug NOT VERIFIED and say what would confirm it.

## 48. STATUS

```text
REQUIRED
RECOMMENDED
OPTIONAL
NOT APPLICABLE
```

## 49. PRIORITY

P0/P1 bug:
regression protection mandatory where technically feasible.

P2:
strongly recommended.

P3/P4:
risk/maintenance tradeoff.

## 50. OUTPUT FORMAT

For each generated test:

```text
Test ID:
Priority:
Layer:
Invariant:
Bug trigger:
Setup:
Action:
Assertions:
Why this catches regression:
Fails on old code:
Adjacent failure class covered:
```

## 51. TEST PLAN MATRIX

| Test | Layer | Original bug | Adjacent class | Priority |
|---|---|---|---|---|

## 52. SECOND PASS

Ask:

- Could fix regress while this test remains green?
- Does test assert correct effect?
- Is mock hiding actual bug?
- Does test depend on implementation?
- Does it cover root cause or only exact input?
- Is concurrency deterministic?
- Does test survive refactor?

## 53. FINAL QUALITY GATE

Confirm:

- original bug represented
- root invariant explicit
- appropriate layer
- deterministic
- assertions strong
- old code would fail where feasible
- fixed code passes
- no redundant filler tests

## 54. OUTPUT

`REGRESSION_TEST_PLAN.md`

If the user asks for an implementation, implement the tests in the existing framework and show the changed files.

## 55. FAILURE CHAIN

```text
bug:
same webhook charged twice
↓
weak regression test:
checks first webhook returns 200
↓
idempotency code removed later
↓
test remains green
↓
bug returns
```

A real regression test must send the same event at least twice and check the authoritative final state.

# FINAL RULE

A regression test should not remember how the fix was implemented.

It should remember:

> Which invariant did the bug violate, and how do we prove it can no longer happen?
