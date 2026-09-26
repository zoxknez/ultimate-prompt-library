---
id: UPL-IT-084
number: 84
slug: form-ux-audit
title: Form UX Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: UX, UI & Product Development
subcategory_id: ux-ui-product-development
language: en
version: 1.0.0
status: stable
---

# FORM UX AUDIT

I want a deep audit of form UX from the first interaction to a successful submission, including validation, error recovery, autofill, accessibility, persistence and the backend outcome.

Main objective:

> Determine whether the user can enter and submit information accurately, quickly and without losing data, including invalid input, network failure, session expiry and partial completion.

This is not:

- automatically shortening every form
- insisting on a one-column layout
- criticizing required fields without business context
- only a visual design review

## 1. FORM PURPOSE

## 2. USER CONTEXT

## 3. FIELD INVENTORY

For each:

```text
Field:
Required:
Why required:
Input type:
Validation:
Default:
Autocomplete:
Sensitive:
Error:
```

## 4. REQUIRED FIELD

Justify.

## 5. OPTIONAL FIELD

Clearly marked where useful.

## 6. LABEL

Persistent label preferred over relying only on placeholder.

## 7. PLACEHOLDER

## 8. HELP TEXT

## 9. EXAMPLE

## 10. INPUT TYPE

## 11. MOBILE KEYBOARD

## 12. AUTOCOMPLETE

## 13. AUTOFILL

## 14. PASSWORD MANAGER

## 15. COPY/PASTE

Do not block without strong reason.

## 16. FORMAT

## 17. MASK

Can create confusion.

## 18. DATE

## 19. TIME

## 20. NUMBER

## 21. CURRENCY

## 22. PHONE

## 23. ADDRESS

## 24. COUNTRY

## 25. NAME

Avoid assumptions about names.

## 26. FILE

## 27. MULTISELECT

## 28. CHECKBOX

## 29. RADIO

## 30. DROPDOWN

## 31. SEARCHABLE SELECT

## 32. DEPENDENT FIELD

## 33. CONDITIONAL FIELD

## 34. DISABLED FIELD

## 35. READONLY

## 36. VALIDATION TIMING

- on submit
- blur
- input

Context-dependent.

## 37. SERVER VALIDATION

## 38. CLIENT VALIDATION

Client not authoritative.

## 39. ERROR LOCATION

## 40. ERROR TEXT

## 41. ERROR SUMMARY

For large forms where useful.

## 42. FOCUS ERROR

## 43. PRESERVE VALID FIELDS

## 44. CLEARING FORM

High-risk.

## 45. SUBMIT

## 46. DOUBLE SUBMIT

## 47. DISABLE BUTTON

Not backend idempotency.

## 48. LOADING

## 49. UNKNOWN OUTCOME

## 50. RETRY

## 51. IDEMPOTENCY

## 52. NETWORK FAILURE

## 53. SESSION EXPIRY

## 54. DRAFT

## 55. AUTO-SAVE

## 56. SAVE INDICATOR

## 57. CONFLICT

## 58. MULTI-STEP

## 59. PROGRESS

## 60. BACK

## 61. SKIP

## 62. RESUME

## 63. UNSAVED WARNING

## 64. DATA LOSS

## 65. ACCESSIBILITY

- labels
- field association
- errors
- required state
- focus
- keyboard

## 66. SCREEN READER

## 67. COLOR

Error not color-only.

## 68. TOUCH TARGET

## 69. ZOOM

## 70. LONG LOCALIZATION

## 71. SECURITY

Sensitive forms:

- password
- payment
- identity

## 72. PRIVACY

Explain why unusual sensitive field is needed.

## 73. BROWSER NATIVE VALIDATION

## 74. BACKEND ERROR

Map to field/general error.

## 75. RATE LIMIT

## 76. CAPTCHA

Only if relevant.

## 77. BOT DEFENSE UX

## 78. ANALYTICS

Field drop-off can be signal.

## 79. FALSE POSITIVE RULES

Do not report:

- long form
- dropdown
- inline validation
- disabled submit
- multi-step form

as inherently bad.

## 80. EVIDENCE TIERS

```text
A - user-test/funnel/reproduced form failure
B - complete interaction proof
C - strong usability/accessibility evidence
D - hypothesis
E - hardening
```

## 81. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 82. SEVERITY

P0:
form interaction can trigger catastrophic incorrect/destructive outcome

P1:
critical form frequently loses data or submits wrong/duplicate sensitive action

P2:
material completion/accessibility issue

P3:
limited friction

P4:
polish

## 83. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Form:
Field/step:
User goal:
Current behavior:
Failure/friction:
Data-loss risk:
Backend effect:
Evidence:
Recommended change:
Validation test:
```

## 84. FIELD MATRIX

| Field | Required | Validation | Error | Autofill | Accessibility |
|---|---|---|---|---|---|

## 85. SECOND PASS

Test:

- empty
- partially complete
- invalid value
- paste
- autofill
- mobile keyboard
- session expiry
- submit twice
- server error
- network timeout
- refresh
- back
- long translation
- keyboard-only

## 86. FINAL QUALITY GATE

Confirm:

- labels
- required fields
- input semantics
- validation
- errors
- data preservation
- submit
- retry
- backend outcome
- drafts
- multi-step
- accessibility
- mobile
- sensitive data

## 87. OUTPUT

`FORM_UX_AUDIT.md`

## 88. FAILURE CHAIN

```text
user fills 30-field application
↓
one server-side validation error
↓
response rerenders empty form
↓
all valid input lost
↓
user must restart
```

# FINAL RULE

A good form is not the one with the fewest fields.

A good form asks for justified information, clearly helps the user enter it and never needlessly punishes a mistake with lost work.
