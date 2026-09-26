---
id: UPL-IT-082
number: 82
slug: critical-user-flow-audit
title: Critical User Flow Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# CRITICAL USER FLOW AUDIT

Želim duboku analizu jednog ili više critical user flow-ova od entry point-a do stvarnog business outcome-a.

Glavni cilj:

> Utvrditi da li korisnik može pouzdano završiti najvažniji task bez izgubljenog state-a, nejasnih odluka, permission problema, dead-end stanja ili nebezbednog retry-ja.

Ovo nije:

- audit celog UI-ja
- estetska analiza
- brojanje klikova
- automatsko skraćivanje svakog flow-a
- generički funnel optimization

## 1. DEFINE FLOW

```text
Name:
Persona:
Entry:
Goal:
Success condition:
Persistent state:
External side effects:
Criticality:
```

## 2. STEP MAP

Za svaki korak:

```text
User intent
↓
UI action
↓
system request
↓
state change
↓
user feedback
```

## 3. PRECONDITION

## 4. DISCOVERY

Can user find starting point?

## 5. LABEL

## 6. DECISION

## 7. REQUIRED INFORMATION

## 8. MEMORY BURDEN

## 9. VALIDATION

## 10. ERROR

## 11. RECOVERY

## 12. BACK

## 13. REFRESH

## 14. CANCEL

## 15. RESUME

## 16. DRAFT

## 17. SESSION EXPIRY

## 18. PERMISSION CHANGE

## 19. MULTI-TAB

## 20. NETWORK INTERRUPTION

## 21. DUPLICATE SUBMISSION

## 22. UNKNOWN OUTCOME

## 23. SUCCESS FEEDBACK

## 24. PERSISTED RESULT

## 25. EXTERNAL SIDE EFFECT

## 26. POST-SUCCESS NEXT STEP

## 27. DEAD END

## 28. LOOP

## 29. OPTIONAL STEP

## 30. CONDITIONAL STEP

## 31. ROLE DIFFERENCE

## 32. MOBILE

## 33. KEYBOARD

## 34. SCREEN READER

## 35. LONG CONTENT

## 36. LARGE DATA

## 37. EMPTY DATA

## 38. OLD CLIENT

## 39. FEATURE FLAG

## 40. ANALYTICS

If available:

- start
- step completion
- abandonment
- retry
- error

## 41. FLOW SUCCESS RATE

## 42. TIME TO COMPLETE

## 43. ERROR RATE

## 44. RECOVERY RATE

## 45. FALSE POSITIVE RULES

Extra step is not automatically bad.

Confirmation is not automatically bad.

Long flow is not automatically bad.

Judge against risk/task complexity.

## 46. EVIDENCE TIERS

```text
A - observed funnel/user-test failure
B - complete flow evidence
C - strong usability evidence
D - hypothesis
E - optimization
```

## 47. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 48. SEVERITY

P0:
flow can cause catastrophic irreversible outcome

P1:
critical flow frequently cannot complete or causes serious wrong action

P2:
material friction/failure

P3:
limited issue

P4:
polish

## 49. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Flow:
Step:
Persona:
Goal:
Current behavior:
Failure/friction:
Persistent impact:
Evidence:
Recommended change:
Validation:
```

## 50. FLOW MATRIX

| Step | User intent | System state | Failure | Recovery |
|---|---|---|---|---|

## 51. SECOND PASS

Test flow with:

- wrong input
- timeout
- refresh
- back
- duplicate click
- session expiry
- other-tab modification
- mobile
- keyboard
- user abandons and returns

## 52. FINAL QUALITY GATE

Confirm:

- entry
- discoverability
- every state transition
- validation
- feedback
- retry
- recovery
- persistence
- success
- post-success state
- accessibility
- failure cases

## 53. OUTPUT

`CRITICAL_USER_FLOW_AUDIT.md`

## 54. FAILURE CHAIN

```text
user completes 8-step application
↓
session expires on final submit
↓
server returns 401
↓
UI redirects to login
↓
draft was never persisted
↓
all work lost
```

# KONAČNO PRAVILO

Critical flow je dobar kada korisnik može ne samo da završi happy path, već i da razume i oporavi se kada tok bude prekinut.
