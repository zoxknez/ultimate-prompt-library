---
id: UPL-IT-089
number: 89
slug: product-requirement-generator
title: Generator zahteva za proizvod
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# GENERATOR ZAHTEVA ZA PROIZVOD

Želim da iz product ideje, problema, feature request-a ili rough notes-a generišeš rigorozan Product Requirements Document koji jasno razdvaja problem, korisnike, scope, invariants, acceptance criteria, risks i open questions.

Glavni cilj:

> Pretvoriti nejasnu ideju u implementabilan i testabilan product requirement bez izmišljanja nedostajućih business odluka.

Ovo nije:

- generički PRD template sa filler-om
- automatsko dodavanje 50 feature-a
- dizajniranje tehničke arhitekture bez potrebe
- pretvaranje pretpostavki u činjenice
- pisanje roadmap-a bez prioriteta

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

Ovaj model koristi kao evidence za svaki requirement. Requirement je confirmed samo kada je njegov evidence GIVEN ili DERIVED; ASSUMPTION ostaje NOT VERIFIED i navodi se uz pitanje koje bi ga potvrdilo. Prioritet requirement-a označi kao P0 (release ne može bez njega), P1 (kritičan za korisnički ishod), P2 (važan), P3 (koristan) ili P4 (opcion), i nikada ne dodeli P0 ili P1 requirement-u koji počiva na ASSUMPTION-u bez eksplicitne napomene.

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

# KONAČNO PRAVILO

Dobar PRD ne pokušava da zvuči kompletno kada informacije ne postoje.

Bolje je jasno napisati:

```text
OPEN QUESTION
```

nego izmisliti product odluku i predstaviti je kao requirement.
