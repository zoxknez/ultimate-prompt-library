---
id: UPL-IT-081
number: 81
slug: ultimate-ux-ui-product-audit
title: Ultimate UX/UI Product Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: UX, UI & Product Development
subcategory_id: ux-ui-product-development
language: en
version: 1.0.0
status: stable
---

# ULTIMATE UX/UI PRODUCT AUDIT

I want you to perform a maximally deep, systematic, evidence-first and product-oriented audit of the complete UX/UI experience of the application or digital product.

Main objective:

> Determine where the interface, product structure, navigation, feedback, state handling or visual hierarchy make it harder for the user to understand the system and successfully complete their real goal, while clearly distinguishing confirmed usability problems from subjective design preferences.

This is not:

- a generic "make it cleaner"
- redesign for the sake of redesign
- criticizing colors without context
- insisting on a particular design trend
- automatically declaring every extra click a problem
- automatically recommending minimalism
- automatically recommending more elements
- a replacement for an accessibility audit
- a replacement for product strategy

Priority:

**task failure > destructive/confusing action > inaccessible critical flow > lost user state > navigation failure > unclear system status > preventable user error > cognitive friction > consistency > aesthetics**

It is better to find 10 UX problems that actually block the user than 100 visual preferences.

## 1. PRODUCT CONTEXT

Before any findings, establish:

- what the product does
- who uses it
- the primary user personas
- the most important tasks
- business goals
- monetization, if relevant
- device context
- frequency of use
- novice vs expert usage

## 2. CRITICAL USER JOURNEYS

Map the real flows.

For each:

```text
Journey:
Actor:
Entry point:
Goal:
Required information:
Actions:
Decision points:
Persistent state:
Exit/success:
Failure/recovery:
```

## 3. FIRST IMPRESSION

Does the user understand:

- what the product is
- what they can do
- where to start
- what the next step is

## 4. INFORMATION SCENT

A link or button label should predict its destination well enough.

## 5. VISUAL HIERARCHY

Does attention go to:

- the main task
- the most important status
- the primary action

## 6. PRIMARY ACTION

Clear.

## 7. SECONDARY ACTION

It must not visually outweigh the critical primary action without a reason.

## 8. DESTRUCTIVE ACTION

Distinguish it.

## 9. AFFORDANCE

Does an element look interactive when it is?

## 10. FALSE AFFORDANCE

Does a decorative element look clickable?

## 11. LABELS

Terminology should match the user's mental model.

## 12. INTERNAL JARGON

Do not expose it unnecessarily.

## 13. CONSISTENCY

The same concept should behave the same way.

## 14. EXCEPTION

Consistency is not the goal if different behavior has a clear reason.

## 15. USER CONTROL

Back/cancel/undo where relevant.

## 16. SYSTEM STATUS

The user must know:

- loading
- saving
- success
- failure
- pending
- offline
- sync

## 17. LATENCY UX

Prevent uncertainty.

## 18. SKELETON

Not automatically better.

## 19. SPINNER

Not automatically bad.

## 20. OPTIMISTIC UI

Audit correctness + rollback.

## 21. PESSIMISTIC UI

Potential unnecessary waiting.

## 22. EMPTY STATE

Should answer:

- why empty
- what next

## 23. ZERO DATA

## 24. LOADING STATE

## 25. ERROR STATE

## 26. PARTIAL ERROR

## 27. RETRY

## 28. UNKNOWN OUTCOME

Critical.

## 29. OFFLINE

## 30. SYNC

## 31. STALE DATA

## 32. CONFLICT

## 33. FORM

Check labels, validation timing, error recovery, preservation of entered data and the submit outcome (double submit, unknown outcome).

## 34. NAVIGATION

Check whether the user knows where they are, whether labels predict the destination and whether back, URLs and deep links keep the expected state.

## 35. MOBILE UX

Check touch targets, the keyboard overlay, interruptions (background/resume), network loss and platform conventions for back.

## 36. ACCESSIBILITY

Check whether critical flows can be completed with a keyboard only and with a screen reader, with visible focus and associated error messages.

A detailed WCAG audit is outside the scope of this prompt.

## 37. ONBOARDING

Check whether a new user reaches the first real value without premature setup and decisions they do not yet understand.

## 38. CRITICAL FLOW

For each critical flow, follow every step from the entry point to the business outcome, including interruption, retry and recovery.

## 39. ERROR PREVENTION

## 40. ERROR RECOVERY

## 41. VALIDATION

## 42. CLEAR ERROR MESSAGE

Should tell user:

- what happened
- where
- how to fix

## 43. FOCUS

After error, focus should help recovery where appropriate.

## 44. CONFIRMATION

Not every action needs modal.

## 45. HIGH-RISK ACTION

Confirmation may be justified.

## 46. UNDO

Often better than blocking confirmation when reversible.

## 47. DATA LOSS

Protect:

- unsaved form
- draft
- navigation away

## 48. MULTI-STEP FLOW

Progress.

## 49. WIZARD

Not automatically preferable.

## 50. OPTIONAL STEP

## 51. BRANCHING FLOW

## 52. SKIP

## 53. RETURN LATER

## 54. PERSISTENCE

## 55. USER MEMORY BURDEN

Avoid forcing user to remember data visible elsewhere.

## 56. RECOGNITION VS RECALL

## 57. INFORMATION DENSITY

Depends on user/task.

## 58. POWER USER

Dense UI can be correct.

## 59. NOVICE USER

May need guidance.

## 60. PROGRESSIVE DISCLOSURE

## 61. SHORTCUT

## 62. BULK ACTION

## 63. MULTISELECT

## 64. FILTER

## 65. SEARCH

## 66. SORT

## 67. PAGINATION

## 68. INFINITE SCROLL

Neither automatically better.

## 69. TABLE

## 70. CARD

Use data/task evidence.

## 71. RESPONSIVE

## 72. TOUCH TARGET

## 73. HOVER-ONLY

## 74. KEYBOARD

## 75. SCREEN SIZE

## 76. ZOOM

## 77. CONTENT LENGTH

## 78. TRANSLATION

Longer localized strings.

## 79. DATE/TIME

## 80. CURRENCY

## 81. NUMBER

## 82. USER TRUST

Critical when:

- payments
- privacy
- destructive actions
- security

## 83. PRIVACY UX

Do users understand what is shared?

## 84. PERMISSION PROMPT

Ask at meaningful time.

## 85. AUTH

Session expiry should preserve intent where safe.

## 86. PAYWALL

Should be clear before work is lost.

## 87. UPGRADE

## 88. LIMIT

User should know quota state.

## 89. DISABLED CONTROL

If disabled, ideally user understands why.

## 90. TOOLTIP

Not replacement for essential content.

## 91. MODAL

Not automatically bad.

## 92. TOAST

Not suitable for every critical message.

## 93. NOTIFICATION

## 94. PERSISTENT STATUS

## 95. ACCESSIBILITY OF FEEDBACK

## 96. USER TEST EVIDENCE

If available, prioritize:

- usability study
- support tickets
- analytics
- session recordings
- funnel drop-off

over personal preference.

## 97. ANALYTICS

Can show where issue occurs, not always why.

## 98. DROP-OFF

Investigate cause.

## 99. RAGE CLICK

Signal, not proof.

## 100. SUPPORT TICKET

Strong contextual evidence.

## 101. HEURISTICS

Can use established heuristics, but not as mechanical scorecard.

## 102. FALSE POSITIVE RULES

Do not automatically report:

- modal
- dropdown
- hamburger menu
- dense table
- long form
- multiple clicks
- disabled button
- confirmation dialog

A problem must have a concrete user/task consequence.

## 103. EVIDENCE TIERS

```text
A - observed user failure, usability test, analytics/support evidence
B - complete user-flow evidence demonstrating friction/failure
C - strong heuristic/accessibility evidence
D - plausible usability concern requiring validation
E - stylistic/hardening suggestion
```

## 104. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 105. SEVERITY

P0:
- UX causes catastrophic irreversible loss or critical unsafe action at scale

P1:
- critical user task frequently fails or destructive action is easily triggered/misunderstood

P2:
- material completion/friction/accessibility problem

P3:
- limited usability inconsistency

P4:
- polish/hardening

## 106. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Persona:
Journey:
Screen/state:
User goal:
Current behavior:
Expected mental model:
Friction/failure:
Impact:
Evidence:
Root cause:
Recommended change:
Alternative:
Validation method:
Regression risk:
```

## 107. MATRICES

### Journey Matrix

| Journey | Entry | Main action | Error recovery | Completion |
|---|---|---|---|---|

### State Matrix

| Screen | Loading | Empty | Error | Success | Offline |
|---|---|---|---|---|---|

### Interaction Consistency Matrix

| Concept | Screen A | Screen B | Difference justified |
|---|---|---|---|

## 108. SECOND PASS

Repeat the audit as:

- first-time user
- expert user
- keyboard-only user
- mobile user
- user with slow network
- user returning after session expiry
- user with empty account
- user with large dataset
- user who makes a mistake halfway
- user who cancels/retries

## 109. FINAL QUALITY GATE

Confirm:

- product context
- personas
- critical flows
- hierarchy
- navigation
- feedback
- loading
- error
- empty
- destructive actions
- data loss
- forms
- mobile
- accessibility
- trust
- localization
- recovery
- evidence

## 110. OUTPUT

`ULTIMATE_UX_UI_PRODUCT_AUDIT.md`

## 111. FAILURE CHAINS

```text
user clicks Delete
↓
confirmation dialog says only "Are you sure?"
↓
does not identify selected workspace
↓
user has two similarly named workspaces
↓
confirms wrong target
↓
irreversible data loss
```

```text
user submits long form
↓
spinner appears
↓
request times out after server actually saved data
↓
UI shows generic error
↓
user retries
↓
duplicate entity created
```

# FINAL RULE

A UX finding is not:

> "I would have designed this differently."

A UX finding must show:

```text
user goal
+
current interaction
+
specific friction/failure
+
measurable or logically justified consequence
```
