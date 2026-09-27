---
id: UPL-IT-081
number: 81
slug: ultimate-ux-ui-product-audit
title: Sveobuhvatni UX/UI audit proizvoda
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: UX, UI i razvoj proizvoda
subcategory_id: ux-ui-product-development
language: sr
version: 1.0.0
status: stable
---

# SVEOBUHVATNI UX/UI AUDIT PROIZVODA

Želim da izvršiš maksimalno dubok, sistematski, evidence-first i product-oriented audit kompletnog UX/UI iskustva aplikacije ili digitalnog proizvoda.

Glavni cilj:

> Utvrditi gde interfejs, struktura proizvoda, navigacija, feedback, state handling ili vizuelna hijerarhija otežavaju korisniku da razume sistem i uspešno završi svoj stvarni cilj, uz jasno razlikovanje potvrđenih usability problema od subjektivnih dizajnerskih preferencija.

Ovo nije:

- generički "make it cleaner"
- redesign radi redesign-a
- kritikovanje boja bez konteksta
- insistiranje na određenom design trend-u
- automatsko proglašavanje svakog dodatnog klika problemom
- automatsko preporučivanje minimalizma
- automatsko preporučivanje više elemenata
- zamena za accessibility audit
- zamena za product strategy

Prioritet:

**task failure > destructive/confusing action > inaccessible critical flow > lost user state > navigation failure > unclear system status > preventable user error > cognitive friction > consistency > aesthetics**

Bolje je pronaći 10 UX problema koji stvarno sprečavaju korisnika nego 100 vizuelnih preferencija.

## 1. PRODUCT CONTEXT

Pre findings-a utvrdi:

- šta proizvod radi
- ko ga koristi
- primarne user personas
- najvažnije taskove
- business goals
- monetization ako je relevantna
- device context
- frequency of use
- novice vs expert usage

## 2. CRITICAL USER JOURNEYS

Mapiraj stvarne tokove.

Za svaki:

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

Da li user razume:

- šta je proizvod
- šta može da uradi
- gde da počne
- koji je sledeći korak

## 4. INFORMATION SCENT

Link/button label treba da dovoljno dobro predvidi destinaciju.

## 5. VISUAL HIERARCHY

Da li pažnja ide ka:

- glavnom task-u
- najvažnijem statusu
- primarnoj akciji

## 6. PRIMARY ACTION

Jasna.

## 7. SECONDARY ACTION

Ne sme vizuelno pobediti critical primary action bez razloga.

## 8. DESTRUCTIVE ACTION

Razlikovati.

## 9. AFFORDANCE

Da li element izgleda interaktivno kada jeste?

## 10. FALSE AFFORDANCE

Da li dekorativni element izgleda klikabilno?

## 11. LABELS

Terminologija treba da odgovara user mental model-u.

## 12. INTERNAL JARGON

Ne izlagati nepotrebno.

## 13. CONSISTENCY

Isti koncept treba da se ponaša isto.

## 14. EXCEPTION

Consistency nije cilj ako drugačije ponašanje ima jasan razlog.

## 15. USER CONTROL

Back/cancel/undo gde je relevantno.

## 16. SYSTEM STATUS

User mora znati:

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

Proveri labels, validation timing, error recovery, čuvanje unetih podataka i ishod submit-a (double submit, unknown outcome).

## 34. NAVIGATION

Proveri da li korisnik zna gde se nalazi, da li labels predviđaju destinaciju i da li back, URL i deep link čuvaju očekivani state.

## 35. MOBILE UX

Proveri touch targets, keyboard overlay, prekide (background/resume), gubitak mreže i platform konvencije za back.

## 36. ACCESSIBILITY

Proveri da li se critical flows mogu završiti samo tastaturom i screen reader-om, uz vidljiv focus i povezane error poruke.

Detaljan WCAG audit je van obima ovog prompta.

## 37. ONBOARDING

Proveri da li novi korisnik stiže do prve stvarne vrednosti bez preranog setup-a i odluka koje još ne razume.

## 38. CRITICAL FLOW

Za svaki critical flow prati svaki korak od entry point-a do business outcome-a, uključujući prekid, retry i oporavak.

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

Ne prijavljuj automatski:

- modal
- dropdown
- hamburger menu
- dense table
- long form
- multiple clicks
- disabled button
- confirmation dialog

Problem mora imati concrete user/task consequence.

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

Ponovi audit kao:

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

# KONAČNO PRAVILO

UX finding nije:

> "Ja bih ovo dizajnirao drugačije."

UX finding mora pokazati:

```text
user goal
+
current interaction
+
specific friction/failure
+
measurable or logically justified consequence
```
