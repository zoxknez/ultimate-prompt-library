---
id: UPL-IT-077
number: 77
slug: adversarial-user-testing
title: Adversarial User Testing
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# ADVERSARIAL USER TESTING

I want a systematic audit of the application from the perspective of a legitimate but unpredictable, error-prone or deliberately unconventional user, without crossing into unauthorized attacks on the system.

Main objective:

> Discover where the product depends on an "ideal user" who clicks in the expected order, never refreshes, never duplicates an action, does not use multiple tabs, does not change permissions and does not make unusual but legitimate combinations.

This is not:

- penetration test
- social engineering
- destructive abuse
- DDoS
- brute force
- testing a system without permission

## 1. USER PERSONAS

- novice
- power user
- impatient
- distracted
- low connectivity
- accessibility user
- multi-device
- old client
- high-volume legitimate user

## 2. CLICK TWICE

## 3. DOUBLE SUBMIT

## 4. REFRESH

## 5. BACK

## 6. FORWARD

## 7. CLOSE TAB

## 8. REOPEN

## 9. MULTI-TAB

## 10. MULTI-DEVICE

## 11. REPEAT ACTION

## 12. CANCEL THEN RETRY

## 13. NAVIGATE AWAY

## 14. SLOW NETWORK

## 15. OFFLINE MID-ACTION

## 16. RECONNECT

## 17. SESSION EXPIRE

## 18. LOGIN OTHER ACCOUNT

## 19. ROLE CHANGE

## 20. PERMISSION REVOKE

## 21. RECORD DELETED ELSEWHERE

## 22. RECORD MODIFIED ELSEWHERE

## 23. STALE FORM

## 24. STALE TAB

## 25. COPY URL

## 26. DEEP LINK

## 27. OLD BOOKMARK

## 28. INVALID URL PARAM

## 29. SHARE LINK

## 30. LOCALE

## 31. TIMEZONE

## 32. BROWSER ZOOM

## 33. KEYBOARD ONLY

## 34. SCREEN READER

## 35. MOBILE ROTATION

## 36. RESIZE

## 37. RAPID FILTERING

## 38. RAPID SEARCH

## 39. PASTE LARGE TEXT

## 40. UNICODE

## 41. EMPTY VALUE

## 42. HUGE VALUE

## 43. REPEATED FILE

## 44. WRONG FILE

## 45. LARGE FILE

## 46. CANCEL UPLOAD

## 47. RETRY UPLOAD

## 48. DUPLICATE PAYMENT BUTTON

## 49. PAYMENT BACK BUTTON

## 50. PAYMENT REFRESH

## 51. AUTH CALLBACK REFRESH

## 52. OAUTH DENY

## 53. PROVIDER DELAY

## 54. WEBHOOK DELAY

## 55. EMAIL LINK TWICE

## 56. RESET LINK EXPIRED

## 57. INVITE USED TWICE

## 58. INVITE WRONG ACCOUNT

## 59. DELETE THEN RESTORE

## 60. SOFT DELETE

## 61. FEATURE FLAG CHANGE MID-SESSION

## 62. DEPLOY DURING SESSION

## 63. OLD FRONTEND + NEW BACKEND

## 64. NEW FRONTEND + OLD BACKEND

## 65. BACKGROUND JOB DELAY

## 66. USER MANUALLY RETRIES

## 67. EXPORT TWICE

## 68. REPORT GENERATION CANCEL

## 69. NOTIFICATION CLICK TWICE

## 70. AI FEATURE

If applicable:

- contradictory prompts
- very long conversation
- correction
- cancel generation
- retry
- edit message
- stale context

## 71. INTENT MISMATCH

User action different from expected linear flow.

## 72. RECOVERY UX

Can user understand what happened?

## 73. UNKNOWN OUTCOME

"Did it save?"

## 74. PREVENT DUPLICATE

## 75. DISABLE BUTTON

Not sufficient alone.

## 76. BACKEND IDEMPOTENCY

## 77. CONFLICT UI

## 78. STALE DATA WARNING

## 79. SAFE RETRY

## 80. FALSE POSITIVE RULES

Do not report a defect only because a user can do something unusual.

There must be:

- corruption
- duplicate
- confusing irreversible outcome
- permission issue
- meaningful UX/reliability failure

## 81. EVIDENCE TIERS

```text
A - reproduced legitimate-user failure
B - complete path proves failure
C - strong reachable scenario
D - scenario requiring validation
E - resilience hardening
```

## 82. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 83. SEVERITY

P0:
catastrophic legitimate interaction causing widespread corruption/loss

P1:
common or realistic action causes severe irreversible failure

P2:
material reliability/data/permission issue

P3:
recoverable UX/state inconsistency

P4:
polish/hardening

## 84. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Persona:
Initial state:
User action sequence:
Expected:
Actual:
Persistent side effect:
Recovery:
Impact:
Evidence:
Fix:
Regression test:
```

## 85. JOURNEY MATRIX

| Journey | Refresh | Duplicate | Multi-tab | Expiry | Offline |
|---|---|---|---|---|---|

## 86. SECOND PASS

Attempt every critical flow with:

- double click
- refresh
- back
- two tabs
- stale session
- network interruption
- role change
- old URL
- duplicate submission

## 87. FINAL QUALITY GATE

Confirm:

- critical journeys
- duplicate actions
- stale state
- navigation
- network
- multi-tab
- multi-device
- auth expiry
- permission change
- upload/payment
- recovery UX
- persistent backend state

## 88. OUTPUT

`ADVERSARIAL_USER_TESTING_REPORT.md`

## 89. FAILURE CHAIN

```text
user clicks Save
↓
button appears frozen
↓
user clicks again
↓
two POST requests
↓
backend has no idempotency
↓
two records created
```

# FINAL RULE

Do not test only:

> "Can the user complete the flow?"

Also test:

> "What happens when the user does a completely legitimate thing at a completely unexpected moment?"
