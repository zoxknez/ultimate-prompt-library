---
id: UPL-IT-087
number: 87
slug: design-system-consistency-audit
title: Design System Consistency Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: UX, UI & Product Development
subcategory_id: ux-ui-product-development
language: en
version: 1.0.0
status: stable
---

# DESIGN SYSTEM CONSISTENCY AUDIT

I want a complete audit of the design system and UI consistency with a focus on semantics, components, states, tokens, accessibility and product behavior.

Main objective:

> Determine where the same concept looks or behaves differently without a justified reason, where the design system allows contradictory patterns and where inconsistency increases cognitive load or implementation risk.

This is not:

- pixel-perfect uniformity
- a ban on local exceptions
- "everything must be one component"
- automatic consolidation of every similar element
- only a Figma audit

## 1. DESIGN SYSTEM INVENTORY

- tokens
- typography
- spacing
- color
- components
- patterns
- icons
- motion
- states
- docs

## 2. SOURCE OF TRUTH

Code?

Design tool?

Both?

## 3. TOKEN

## 4. RAW VALUE

## 5. SEMANTIC TOKEN

## 6. THEME

## 7. DARK MODE

## 8. CONTRAST

## 9. TYPOGRAPHY

## 10. SPACING

## 11. RADIUS

## 12. SHADOW

## 13. ICON

## 14. BUTTON

## 15. LINK

## 16. INPUT

## 17. SELECT

## 18. CHECKBOX

## 19. MODAL

## 20. POPOVER

## 21. TOOLTIP

## 22. TABLE

## 23. CARD

## 24. BADGE

## 25. ALERT

## 26. TOAST

## 27. EMPTY STATE

## 28. LOADING

## 29. ERROR

## 30. DISABLED

## 31. HOVER

## 32. FOCUS

## 33. PRESSED

## 34. SELECTED

## 35. DESTRUCTIVE

## 36. SIZE VARIANT

## 37. VISUAL VARIANT

## 38. SEMANTIC VARIANT

## 39. PROP EXPLOSION

## 40. COMPONENT DUPLICATION

## 41. NEAR-DUPLICATE

## 42. WRAPPER

## 43. ONE-OFF

## 44. LOCAL OVERRIDE

## 45. CSS ESCAPE HATCH

Not automatically bad.

## 46. COMPONENT API

## 47. COMPOSITION

## 48. ACCESSIBILITY

Built into primitive.

## 49. KEYBOARD

## 50. ARIA

## 51. FOCUS MANAGEMENT

## 52. RESPONSIVE

## 53. CONTENT LENGTH

## 54. LOCALIZATION

## 55. THEME OVERRIDE

## 56. BRAND VARIANT

## 57. PRODUCT VARIANT

## 58. DESIGN-CODE DRIFT

## 59. DOCUMENTATION

## 60. STORYBOOK

If present.

## 61. VISUAL REGRESSION

## 62. SNAPSHOT

## 63. CHANGE PROCESS

## 64. DEPRECATION

## 65. MIGRATION

## 66. VERSIONING

## 67. ADOPTION

## 68. BYPASS

Why teams bypass system?

## 69. UX CONSISTENCY

Same destructive action should communicate risk similarly.

## 70. BEHAVIOR CONSISTENCY

Not only appearance.

## 71. NAMING

## 72. SEMANTIC COLLISION

Two components named differently but same purpose.

## 73. FALSE POSITIVE RULES

Do not report:

- local exception
- multiple button variants
- raw CSS
- one-off component

without actual maintenance/UX consequence.

## 74. EVIDENCE TIERS

```text
A - reproduced inconsistency causing user/dev issue
B - complete component/code evidence
C - strong design-system inconsistency
D - suspected consolidation opportunity
E - stylistic hardening
```

## 75. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 76. SEVERITY

P0:
rare, system inconsistency causes catastrophic wrong action

P1:
critical semantic component behaves inconsistently in dangerous flow

P2:
material accessibility/interaction inconsistency

P3:
maintenance/UX drift

P4:
visual polish

## 77. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Pattern/component:
Locations:
Expected semantic:
Variant A:
Variant B:
User/developer impact:
Evidence:
Recommended consolidation:
Migration risk:
```

## 78. COMPONENT MATRIX

| Semantic role | Components | Behavior same | Visual same | Accessible |
|---|---|---|---|---|

## 79. TOKEN MATRIX

| Property | Tokenized | Raw overrides | Theme-safe |
|---|---|---|---|

## 80. SECOND PASS

Search:

- buttons
- destructive actions
- inputs
- errors
- focus
- loading
- empty state
- modal
- table
- typography
- spacing
- responsive variants
- dark mode

## 81. FINAL QUALITY GATE

Confirm:

- tokens
- components
- semantics
- states
- accessibility
- behavior
- variants
- documentation
- design-code parity
- migration

## 82. OUTPUT

`DESIGN_SYSTEM_CONSISTENCY_AUDIT.md`

# FINAL RULE

A design system is not good because everything looks the same.

It is good when:

```text
the same concept has a predictable meaning and behavior
+
exceptions are intentional
+
the implementation stays maintainable
```
