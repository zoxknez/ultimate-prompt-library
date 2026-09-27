---
id: UPL-IT-088
number: 88
slug: accessibility-experience-audit
title: Audit pristupačnosti korisničkog iskustva
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# AUDIT PRISTUPAČNOSTI KORISNIČKOG ISKUSTVA

Želim dubok accessibility audit fokusiran na stvarno iskustvo korišćenja proizvoda, ne samo na statičku WCAG checklist-u.

Glavni cilj:

> Utvrditi da li osobe sa različitim vidnim, motoričkim, auditivnim i kognitivnim potrebama mogu razumeti, navigirati i završiti critical user journey-je bez blokirajućih prepreka.

Ovo nije:

- samo automated scanner
- samo color contrast
- samo ARIA audit
- pokušaj da se sve proceni bez realne interaction analize
- pretpostavka da valid HTML automatski znači accessible UX

## 1. SCOPE

## 2. CRITICAL JOURNEYS

## 3. WCAG TARGET

Ako project ima target, koristi ga.

Ako nema, jasno označi basis.

## 4. KEYBOARD

## 5. TAB ORDER

## 6. FOCUS VISIBLE

## 7. FOCUS TRAP

## 8. FOCUS RESTORE

## 9. SKIP LINK

## 10. LANDMARKS

## 11. HEADINGS

## 12. PAGE TITLE

## 13. LINK PURPOSE

## 14. BUTTON NAME

## 15. ICON BUTTON

## 16. FORM LABEL

## 17. FIELD DESCRIPTION

## 18. ERROR ASSOCIATION

## 19. REQUIRED STATE

## 20. LIVE REGION

## 21. DYNAMIC CONTENT

## 22. MODAL

## 23. DIALOG NAME

## 24. MENU

## 25. COMBOBOX

## 26. TABLE

## 27. SORT

## 28. GRID

## 29. DRAG/DROP

Alternative input.

## 30. POINTER

## 31. TARGET SIZE

## 32. GESTURE

## 33. SCREEN READER

## 34. ACCESSIBLE NAME

## 35. ROLE

## 36. STATE

## 37. VALUE

## 38. ARIA

Native semantics preferred where suitable.

## 39. ARIA MISUSE

## 40. CONTRAST

## 41. COLOR-ONLY MEANING

## 42. TEXT SIZE

## 43. ZOOM

## 44. REFLOW

## 45. RESPONSIVE

## 46. HIGH CONTRAST

## 47. REDUCED MOTION

## 48. ANIMATION

## 49. FLASHING

## 50. AUDIO

## 51. CAPTIONS

## 52. TRANSCRIPT

## 53. AUTOPLAY

## 54. IMAGE ALT

## 55. DECORATIVE IMAGE

## 56. CHART

Need equivalent information.

## 57. CANVAS

## 58. PDF

If part of flow.

## 59. TIMEOUT

## 60. SESSION EXPIRY

## 61. EXTEND TIME

## 62. COGNITIVE LOAD

## 63. ERROR CLARITY

## 64. INSTRUCTIONS

## 65. CONSISTENCY

## 66. AUTHENTICATION

Avoid unnecessary cognitive puzzles.

## 67. CAPTCHA

Accessible alternative.

## 68. MOBILE SCREEN READER

## 69. SWITCH CONTROL

## 70. VOICE CONTROL

Naming/labels matter.

## 71. AUTOMATED TOOL

Use as evidence, not full audit.

## 72. MANUAL TEST

## 73. REAL ASSISTIVE TECH

Where feasible.

## 74. BROWSER/AT MATRIX

## 75. FALSE POSITIVE RULES

Do not treat every theoretical WCAG concern as confirmed blocker.

Separate:

- automated violation
- manually reproduced barrier
- semantic concern
- hardening

## 76. EVIDENCE TIERS

```text
A - reproduced assistive-technology/user barrier
B - deterministic standards/interaction failure
C - strong static accessibility evidence
D - suspected issue requiring manual verification
E - accessibility hardening
```

## 77. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 78. SEVERITY

P0:
rare catastrophic unsafe effect

P1:
critical journey completely inaccessible to affected users

P2:
material barrier requiring major workaround

P3:
limited friction

P4:
polish/hardening

## 79. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Journey:
Element:
User/AT:
Expected:
Observed:
Barrier:
Standard reference if applicable:
Impact:
Evidence:
Fix:
Manual regression test:
```

## 80. JOURNEY MATRIX

| Journey | Keyboard | Screen reader | Zoom | Errors | Mobile AT |
|---|---|---|---|---|---|

## 81. SECOND PASS

Complete critical flows using:

- keyboard only
- screen reader
- 200%/400% zoom where applicable
- reduced motion
- mobile screen reader
- high contrast
- error states
- modal/dialog flows

## 82. FINAL QUALITY GATE

Confirm:

- keyboard
- focus
- semantics
- forms
- dynamic states
- contrast
- zoom/reflow
- media
- motion
- auth
- mobile
- critical journeys
- manual verification

## 83. OUTPUT

`ACCESSIBILITY_EXPERIENCE_AUDIT.md`

## 84. FAILURE CHAIN

```text
user opens modal by keyboard
↓
focus remains behind modal
↓
screen reader continues reading page background
↓
user cannot identify active dialog
↓
critical confirmation flow becomes unusable
```

# KONAČNO PRAVILO

Accessibility nije dodatna vizuelna opcija.

Za critical flow postavi pitanje:

> Može li korisnik sa relevantnom assistive tehnologijom stvarno završiti isti posao i razumeti isti sistem state?
