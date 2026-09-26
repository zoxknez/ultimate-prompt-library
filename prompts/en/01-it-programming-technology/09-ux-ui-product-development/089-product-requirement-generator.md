---
id: UPL-IT-089
number: 89
slug: product-requirement-generator
title: Product Requirement Generator
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: UX, UI & Product Development
subcategory_id: ux-ui-product-development
language: en
version: 1.0.0
status: stable
---

# PRODUCT REQUIREMENT GENERATOR

From a product idea, a problem, a feature request or rough notes, I want you to generate a rigorous Product Requirements Document that clearly separates the problem, users, scope, invariants, acceptance criteria, risks and open questions.

Main objective:

> Turn an unclear idea into an implementable and testable product requirement without inventing missing business decisions.

This is not:

- a generic PRD template with filler
- automatically adding 50 features
- designing technical architecture without need
- turning assumptions into facts
- writing a roadmap without priorities

## 1. INPUT INVENTORY

Extract only provided facts.

## 2. FACT

## 3. ASSUMPTION

## 4. OPEN QUESTION

Always distinguish.

## 5. PROBLEM STATEMENT

## 6. USER

## 7. USER NEED

## 8. CURRENT BEHAVIOR

## 9. PAIN

## 10. BUSINESS GOAL

## 11. NON-GOAL

## 12. SUCCESS OUTCOME

## 13. KPI

Only if meaningful.

## 14. GUARDRAIL METRIC

## 15. USER JOURNEY

## 16. ENTRY

## 17. MAIN FLOW

## 18. ALTERNATE FLOW

## 19. FAILURE FLOW

## 20. PERMISSION

## 21. ROLE

## 22. DATA

## 23. PERSISTENCE

## 24. EXTERNAL INTEGRATION

## 25. NOTIFICATION

## 26. MOBILE

## 27. ACCESSIBILITY

## 28. LOCALIZATION

## 29. PRIVACY

## 30. SECURITY

## 31. PERFORMANCE

## 32. RELIABILITY

## 33. OFFLINE

If relevant.

## 34. COMPATIBILITY

## 35. MIGRATION

## 36. ROLLOUT

## 37. FEATURE FLAG

## 38. ANALYTICS

## 39. ACCEPTANCE CRITERIA

Must be observable.

## 40. FUNCTIONAL

## 41. NON-FUNCTIONAL

## 42. INVARIANT

## 43. EDGE CASE

## 44. ERROR MESSAGE

Only where UX critical.

## 45. UNKNOWN OUTCOME

## 46. RETRY

## 47. IDEMPOTENCY

## 48. CONCURRENCY

## 49. OUT OF SCOPE

## 50. DEPENDENCY

## 51. RISK

## 52. TRADEOFF

## 53. OPEN DECISION

## 54. TECHNICAL CONSTRAINT

Only provided/verified.

## 55. DESIGN CONSTRAINT

## 56. LEGAL/COMPLIANCE

Only when relevant.

## 57. PHASE

## 58. MVP

Do not label MVP as "everything minus polish".

## 59. FUTURE

## 60. ROLLBACK

## 61. SUPPORT

## 62. OBSERVABILITY

## 63. TESTABILITY

## 64. ACCEPTANCE TEST

## 65. FALSE POSITIVE RULES

Do not invent:

- personas
- KPI targets
- legal requirements
- business priorities
- pricing
- technical stack

unless provided or explicitly researched.

## 66. EVIDENCE MODEL

```text
GIVEN - explicitly provided
DERIVED - logically follows from provided facts
ASSUMPTION - plausible but unconfirmed
OPEN - requires decision/information
```

Use this model as the evidence behind every requirement. A requirement is confirmed only when its evidence is GIVEN or DERIVED; an ASSUMPTION stays NOT VERIFIED and is listed with the question that would confirm it. Prioritize requirements as P0 (the release cannot ship without it), P1 (critical to the user outcome), P2 (important), P3 (useful) or P4 (optional), and never give P0 or P1 to a requirement that rests on an ASSUMPTION without saying so.

## 67. REQUIREMENT FORMAT

```text
Requirement ID:
Status:
Priority:
User:
Problem:
Requirement:
Rationale:
Acceptance criteria:
Failure behavior:
Dependencies:
Risks:
Open questions:
```

## 68. PRD STRUCTURE

```text
# Overview
# Problem
# Users
# Goals
# Non-goals
# User journeys
# Functional requirements
# Non-functional requirements
# Data and permissions
# Edge/failure cases
# Acceptance criteria
# Analytics
# Rollout
# Risks
# Open questions
```

## 69. SECOND PASS

Challenge:

- hidden assumption
- contradictory requirement
- untestable acceptance criterion
- scope creep
- missing failure behavior
- missing role/permission
- missing data lifecycle
- undefined success

## 70. FINAL QUALITY GATE

Confirm:

- facts vs assumptions
- problem defined
- user defined
- goal/non-goal
- flows
- requirements
- failure
- acceptance
- privacy/security
- accessibility
- rollout
- risks
- open questions

## 71. OUTPUT

`PRODUCT_REQUIREMENTS_DOCUMENT.md`

# FINAL RULE

A good PRD does not try to sound complete when the information does not exist.

It is better to write clearly:

```text
OPEN QUESTION
```

than to invent a product decision and present it as a requirement.
