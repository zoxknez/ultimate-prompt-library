---
id: UPL-IT-086
number: 86
slug: mobile-ux-audit
title: Mobile UX Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# MOBILE UX AUDIT

Želim dubok audit mobile web ili native app iskustva sa fokusom na touch interaction, viewport, keyboard, interruptions, connectivity, platform conventions i one-handed use.

Glavni cilj:

> Utvrditi da li proizvod stvarno funkcioniše kao mobile iskustvo, a ne samo kao desktop UI smanjen na uži ekran.

Ovo nije:

- samo responsive CSS audit
- automatsko insistiranje na bottom navigation
- kritika desktop feature parity-ja
- "mobile first" slogan

## 1. PLATFORM

- mobile web
- PWA
- Android
- iOS

## 2. DEVICE RANGE

## 3. VIEWPORT

## 4. SAFE AREA

## 5. NOTCH

## 6. DYNAMIC BARS

## 7. ORIENTATION

## 8. TOUCH TARGET

## 9. SPACING

## 10. ONE-HANDED

## 11. THUMB REACH

Not universal requirement.

## 12. GESTURE

## 13. GESTURE DISCOVERABILITY

## 14. GESTURE CONFLICT

## 15. BACK

Platform semantics.

## 16. SWIPE

## 17. LONG PRESS

## 18. HOVER DEPENDENCY

## 19. KEYBOARD

## 20. KEYBOARD TYPE

## 21. KEYBOARD OVERLAY

## 22. FIELD VISIBILITY

## 23. AUTOFILL

## 24. PASSWORD MANAGER

## 25. COPY/PASTE

## 26. FILE PICKER

## 27. CAMERA

## 28. PHOTO PERMISSION

## 29. LOCATION

## 30. NOTIFICATION PERMISSION

## 31. PERMISSION TIMING

## 32. SHARE SHEET

## 33. DEEP LINK

## 34. APP LINK

## 35. BROWSER BACK

## 36. PWA INSTALL

## 37. OFFLINE

## 38. POOR NETWORK

## 39. NETWORK SWITCH

Wi-Fi -> mobile.

## 40. BACKGROUND

## 41. RESUME

## 42. PROCESS DEATH

Native.

## 43. TAB EVICTION

Mobile web.

## 44. INTERRUPT

Phone call/system interruption.

## 45. DRAFT

## 46. STATE RESTORE

## 47. SCROLL

## 48. SCROLL POSITION

## 49. STICKY UI

## 50. MODAL

## 51. BOTTOM SHEET

## 52. FULLSCREEN

## 53. TABLE

## 54. WIDE CONTENT

## 55. CHART

## 56. ZOOM

## 57. TEXT SIZE

## 58. DYNAMIC TYPE

## 59. ACCESSIBILITY

## 60. SCREEN READER

## 61. SWITCH ACCESS

## 62. MOTION

## 63. BATTERY

Only if app work impacts.

## 64. DATA USAGE

## 65. LARGE MEDIA

## 66. PERFORMANCE

## 67. STARTUP

## 68. INPUT LATENCY

## 69. SLOW DEVICE

## 70. FORM

## 71. MULTI-STEP

## 72. ERROR

## 73. TOAST

## 74. SNACKBAR

## 75. SYSTEM UI

## 76. AUTH

## 77. OTP

## 78. SMS AUTOFILL

## 79. PAYMENT

## 80. EXTERNAL APP RETURN

## 81. ANALYTICS

Segment desktop/mobile rather than assuming same behavior.

## 82. FALSE POSITIVE RULES

Do not declare:

- bottom nav mandatory
- hamburger bad
- modal bad
- long page bad
- feature reduction bad

without user/task evidence.

## 83. EVIDENCE TIERS

```text
A - reproduced device/user issue
B - complete mobile flow evidence
C - strong mobile/accessibility evidence
D - hypothesis
E - hardening
```

## 84. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 85. SEVERITY

P0:
catastrophic wrong/destructive action caused by mobile interaction

P1:
critical mobile journey unusable or data loss under common interruption

P2:
material mobile usability/accessibility issue

P3:
limited friction

P4:
polish

## 86. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Device/platform:
Viewport:
Journey:
Interaction:
Current behavior:
Failure/friction:
Persistent state impact:
Evidence:
Recommended change:
Device regression test:
```

## 87. DEVICE MATRIX

| Flow | Small phone | Large phone | Landscape | Keyboard open | Offline |
|---|---|---|---|---|---|

## 88. SECOND PASS

Test:

- smallest supported viewport
- large font
- keyboard open
- rotation
- app background/resume
- network loss
- tab reload
- one-handed use
- screen reader
- external app round trip

## 89. FINAL QUALITY GATE

Confirm:

- platform conventions
- viewport
- touch
- keyboard
- interruptions
- state
- network
- permissions
- accessibility
- forms
- navigation
- performance

## 90. OUTPUT

`MOBILE_UX_AUDIT.md`

# KONAČNO PRAVILO

Mobile UX problem nije:

> "ovo ne liči dovoljno na native app"

nego:

> korisnik na realnom mobilnom uređaju ne može pouzdano, razumljivo i bez gubitka state-a da završi svoj task.
