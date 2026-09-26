---
id: UPL-IT-085
number: 85
slug: navigation-and-information-architecture-audit
title: Navigation & Information Architecture Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# NAVIGATION AND INFORMATION ARCHITECTURE AUDIT

Želim kompletan audit navigation i information architecture sistema.

Glavni cilj:

> Utvrditi da li korisnik može predvidljivo pronaći sadržaj, feature ili sledeći korak bez poznavanja interne strukture proizvoda.

Ovo nije:

- "smanji broj menu item-a"
- automatsko preporučivanje hamburger menija
- automatsko insistiranje na breadcrumbs
- estetski audit sidebar-a
- SEO audit

## 1. CONTENT/FEATURE INVENTORY

## 2. USER MENTAL MODEL

## 3. PRODUCT TAXONOMY

## 4. INTERNAL TAXONOMY

Compare.

## 5. PRIMARY NAV

## 6. SECONDARY NAV

## 7. LOCAL NAV

## 8. FOOTER NAV

## 9. SIDEBAR

## 10. TABS

## 11. BREADCRUMBS

## 12. SEARCH

## 13. COMMAND PALETTE

## 14. DEEP LINK

## 15. BACK BUTTON

## 16. URL STATE

## 17. ROUTE

## 18. PAGE TITLE

## 19. ACTIVE STATE

## 20. CURRENT LOCATION

## 21. LABEL

## 22. AMBIGUOUS LABEL

## 23. DUPLICATE LABEL

## 24. CATEGORY

## 25. GROUPING

## 26. NESTING DEPTH

Not automatically bad.

## 27. DISCOVERABILITY

## 28. FREQUENCY

Frequently used action deserves appropriate access.

## 29. CRITICALITY

## 30. RECENCY

## 31. ROLE

## 32. PERMISSION

Hidden vs disabled.

## 33. FEATURE FLAG

## 34. EMPTY SECTION

## 35. LEGACY ROUTE

## 36. REDIRECT

## 37. BOOKMARK

## 38. SHAREABLE URL

## 39. FILTER STATE

## 40. PAGINATION STATE

## 41. MOBILE NAV

## 42. DESKTOP NAV

## 43. KEYBOARD

## 44. FOCUS

## 45. SCREEN READER

## 46. COLLAPSED NAV

## 47. ICON-ONLY NAV

## 48. TOOLTIP

## 49. SEARCH RESULT

## 50. ZERO RESULT

## 51. TYPO

## 52. SYNONYM

## 53. OLD TERMINOLOGY

## 54. CONTENT MIGRATION

## 55. ANALYTICS

- search terms
- zero-result
- backtracking
- nav usage

## 56. SUPPORT DATA

"Where is X?"

Strong signal.

## 57. TREE TEST

If possible.

## 58. CARD SORT

If taxonomy uncertain.

## 59. FALSE POSITIVE RULES

Do not declare:

- deep hierarchy
- sidebar
- tabs
- breadcrumbs
- hamburger
- search

as inherently right/wrong.

## 60. EVIDENCE TIERS

```text
A - user research/search/support/navigation evidence
B - complete task-navigation failure path
C - strong IA heuristic evidence
D - hypothesis
E - optimization
```

## 61. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 62. SEVERITY

P0:
rare, navigation causes catastrophic wrong-context/destructive action

P1:
critical feature/task effectively undiscoverable or context confusion causes severe wrong action

P2:
material findability problem

P3:
limited inconsistency

P4:
polish

## 63. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Persona:
Target:
Starting location:
Expected path:
Actual path:
Confusion:
Impact:
Evidence:
Recommended IA/navigation change:
Validation:
```

## 64. IA MATRIX

| User goal | Expected label | Current location | Path depth | Searchable |
|---|---|---|---:|---|

## 65. SECOND PASS

Ask users/tasks to locate:

- most frequent feature
- rare critical setting
- billing
- account security
- destructive admin action
- recent item
- shared item
- item via mobile

## 66. FINAL QUALITY GATE

Confirm:

- taxonomy
- labels
- primary nav
- local nav
- current location
- URLs
- search
- permissions
- mobile
- keyboard
- analytics
- support signals

## 67. OUTPUT

`NAVIGATION_INFORMATION_ARCHITECTURE_AUDIT.md`

# KONAČNO PRAVILO

Dobra information architecture nije ona koja izgleda uredno developer-u.

To je ona u kojoj korisnik može predvideti:

> gde se nešto nalazi i šta će se desiti kada tamo ode.
