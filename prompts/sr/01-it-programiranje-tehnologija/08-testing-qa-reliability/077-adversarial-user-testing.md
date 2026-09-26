---
id: UPL-IT-077
number: 77
slug: adversarial-user-testing
title: Adversarial User Testing
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# ADVERSARIAL USER TESTING

Želim sistematski audit aplikacije iz perspektive legitimnog ali nepredvidivog, greškama sklonog ili namerno nekonvencionalnog korisnika, bez prelaska u neovlašćeno napadanje sistema.

Glavni cilj:

> Otkriti gde proizvod zavisi od "idealnog korisnika" koji klikće očekivanim redom, nikad ne refresh-uje, nikad ne duplira akciju, ne koristi više tabova, ne menja dozvole i ne pravi neobične ali legitimne kombinacije.

Ovo nije:

- penetration test
- socijalni inženjering
- destructive abuse
- DDoS
- brute force
- testiranje sistema bez dozvole

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

Ne prijavljuj kao defect samo zato što user može uraditi nešto neobično.

Mora postojati:

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

# KONAČNO PRAVILO

Ne testiraj samo:

> "Može li korisnik završiti flow?"

Testiraj i:

> "Šta se desi kada korisnik uradi potpuno legitimnu stvar u potpuno neočekivanom trenutku?"
