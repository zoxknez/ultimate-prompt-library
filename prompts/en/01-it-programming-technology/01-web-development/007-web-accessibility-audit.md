---
id: UPL-IT-007
number: 7
slug: web-accessibility-audit
title: Web Accessibility Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.0.0
status: stable
---

# WEB ACCESSIBILITY AUDIT

I want you to perform an exhaustive, systematic, and evidence-first accessibility analysis of the entire web application.

Main goal:

> Determine whether people with diverse motor, visual, auditory, and cognitive disabilities can understand, navigate, and utilize all critical application features.

This is not:

- a generic accessibility checklist
- automatic injection of ARIA attributes
- an "add alt text everywhere" audit
- analyzing solely the Lighthouse accessibility score
- a visual design review
- an attempt to turn every warning into a bug
- an automated refactor

The focus is on real user experience.

Priority:

**functional accessibility > semantics > keyboard/focus > screen reader experience > content perception > cosmetic recommendations**

Every serious finding must include:

- a concrete location
- specific affected users or usage modalities
- a clear failure scenario
- code-level or runtime behavioral evidence
- an actionable remediation recommendation

If something could not be verified in a browser or assistive technology, explicitly mark it:

**NOT VERIFIED**

---

# 1. IDENTIFY STACK AND ACCESSIBILITY CONTEXT

Before the audit, determine:

- framework
- React/Vue/Angular/Svelte or other
- SSR/CSR model
- component library
- headless UI library
- design system
- routing
- form library
- modal/dialog library
- table/grid library
- charting library
- rich text/editor library
- internationalization
- testing framework

Specifically determine whether the project employs libraries that already implement accessibility primitives.

For example:

- Radix
- React Aria
- Headless UI
- MUI
- Chakra
- shadcn/ui
- Reach UI

Do not report an issue that a library already handles correctly without verifying the actual rendered behavior.

---

# 2. IDENTIFY APPLICABLE STANDARD

If the project, contract, regulatory framework, or documentation specifies a target, use that standard.

If not specified otherwise, use the current WCAG framework relevant to the project and target at least Level AA as a practical baseline.

Distinguish between:

- standard requirement
- usability improvement
- framework/library recommendation

Do not fabricate legal obligations.

If legal compliance is unknown:

**LEGAL REQUIREMENT: NOT VERIFIED**

---

# 3. MAP CRITICAL USER FLOWS

Before individual findings, identify key user flows.

For example:

```text
Landing
↓
Navigation
↓
Registration
↓
Login
↓
Main feature
↓
Form
↓
Submit
↓
Success/Error
```

or:

```text
Dashboard
↓
Search
↓
Results
↓
Open item
↓
Edit
↓
Save
```

Accessibility is not merely a property of isolated components.

For each key flow, verify whether a user can complete it:

- via keyboard
- via screen reader
- without relying solely on color
- with scaled text
- under browser zoom
- with reduced motion where relevant

---

# 4. SEMANTIC HTML

Inspect usage of:

- `header`
- `nav`
- `main`
- `section`
- `article`
- `aside`
- `footer`
- `button`
- `a`
- `form`
- `label`
- `fieldset`
- `legend`
- `table`
- headings

Look for generic elements masquerading as interactive controls.

Example:

```html
<div onclick="...">
  Save
</div>
```

If it behaves as a button, determine why it is not a native `button`.

Do not recommend ARIA when native HTML solves the problem better.

---

# 5. INTERACTIVE ELEMENT SEMANTICS

Find:

- clickable divs
- clickable spans
- custom controls
- custom dropdowns
- custom tabs
- custom switches
- custom checkboxes

For each, check:

- keyboard operability
- role
- accessible name
- focusability
- state announcement

---

# 6. BUTTON VS LINK

Verify semantics:

- `button` for actions
- `a` for navigation

Look for:

```html
<a href="#" onclick="deleteItem()">
```

or:

```html
<button onclick="navigate('/page')">
```

Evaluate actual semantics and browser behavior.

Do not alter elements purely for theoretical purity if the current implementation already exhibits valid behavior.

---

# 7. LANDMARKS

Inspect:

- main landmark
- navigation landmarks
- header/banner
- footer/contentinfo

If multiple navigation regions exist, verify that they have distinguishing accessible names where necessary.

---

# 8. HEADING HIERARCHY

Map `h1` through `h6`.

Look for:

- structural level skipping that breaks hierarchy
- headings used purely for visual styling
- visual headings lacking semantic heading tags
- multiple disconnected `h1` tags

Do not report every numerical skip without evaluating overall document structure.

---

# 9. PAGE TITLE

For every critical route, verify:

- meaningful `<title>`
- title updates on client-side navigation
- uniqueness
- context

A screen reader user must be able to comprehend which page is active.

---

# 10. LANGUAGE

Check:

- document `lang` attribute
- language-shifted fragments where relevant
- locale switching

If the application is multilingual, verify that the root language attribute updates with the active locale.

---

# 11. KEYBOARD AUDIT

Every interactive feature must be keyboard operable where applicable.

Test mentally or at runtime:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys
Home
End
```

depending on the component pattern.

---

# 12. TAB ORDER

Verify that focus proceeds in a logical sequence.

Look for:

- invisible elements in the tab order
- elements visually later that receive focus earlier
- custom `tabindex` values
- `tabindex > 0`

Positive tabindex frequently disrupts natural DOM sequence.

Report only when it genuinely impairs user flow.

---

# 13. FOCUS VISIBILITY

Every keyboard-interactive element must provide an unmistakable visual focus indicator.

Look for:

```css
outline: none;
```

```css
outline: 0;
```

or Tailwind equivalents.

Verify whether adequate replacement focus styling is present.

Removing default outlines is not an issue if a robust custom focus state replaces it.

---

# 14. FOCUS CONTRAST

The focus indicator ring must maintain sufficient contrast against its background.

Do not merely guess "it looks faint".

If tooling allows, measure the contrast ratio.

---

# 15. FOCUS ORDER VS VISUAL ORDER

If CSS employs:

- `order`
- grid placement
- absolute positioning

verify that visual and keyboard orders remain aligned and intuitive.

---

# 16. FOCUS MANAGEMENT

Specifically check:

- route changes
- modals
- drawers
- menus
- dialogs
- dynamically inserted content
- errors

Ask:

> Where does focus land immediately following this action?

---

# 17. ROUTE CHANGE FOCUS

In Single Page Applications, verify that keyboard and screen reader users receive an unambiguous indication that content has transitioned.

Do not mandate auto-focusing headings if the framework or product employs another valid navigation announcement pattern.

---

# 18. MODAL FOCUS

For every modal, check:

```text
open
↓
focus enters modal
↓
focus remains logically inside
↓
Escape/close
↓
focus returns to trigger
```

Look for:

- focus remaining on background content
- focus escaping behind the modal overlay
- unreachable close buttons
- lost focus after dismissal

---

# 19. FOCUS TRAP

A focus trap must exist when the dialog pattern requires modal behavior.

Verify library internals before reporting.

Do not report "missing custom focus trap code" if the underlying component library handles it automatically.

---

# 20. DRAWER FOCUS

A drawer functioning as a modal must follow modal focus rules.

If it acts as a non-modal supplementary panel, expectations differ.

Identify intended semantics.

---

# 21. ESCAPE KEY

Verify where `Escape` should dismiss:

- modals
- menus
- popovers
- comboboxes

Do not mandate Escape handling for arbitrary non-modal panels.

---

# 22. SKIP LINKS

For applications with extensive repetitive navigation headers, verify whether keyboard users can bypass directly to main content.

If omitting a skip link forces dozens of repetitive tab presses per page, report the defect.

---

# 23. ACCESSIBLE NAME

Verify that every interactive element possesses a meaningful accessible name.

Sources include:

- visible text
- `<label>`
- `aria-label`
- `aria-labelledby`
- `alt`

Look for buttons announced to screen readers merely as:

```text
button
```

devoid of context.

---

# 24. ICON-ONLY BUTTONS

Specifically check:

- close
- menu
- delete
- edit
- share
- search
- settings

An SVG icon alone does not constitute a valid accessible name.

---

# 25. DUPLICATE ACCESSIBLE NAMES

If repeated buttons exist:

```text
Edit
Edit
Edit
```

within a list or table, verify whether a screen reader user can ascertain which entity is being edited.

Contextual accessible names may be needed.

Do not alter visible text unnecessarily.

---

# 26. IMAGES

For every significant image, classify it as:

- informative
- decorative
- functional
- text-based

Evaluate `alt` accordingly.

---

# 27. DECORATIVE IMAGES

Decorative images must not produce redundant screen reader announcements.

Verify `alt=""` or appropriate hiding attributes.

---

# 28. INFORMATIVE ALT TEXT

Alt text should communicate function or relevant information, not describe pixels.

Do not mandate generic descriptions like:

```text
image of...
```

if it offers no informational value.

---

# 29. FUNCTIONAL IMAGES

When an image functions as a link or button, its accessible name must describe the action or destination.

---

# 30. SVG

For SVGs, verify:

- decorative vs informative classification
- `aria-hidden`
- title/label
- focusability

Do not automatically inject `<title>` tags into every decorative SVG.

---

# 31. FORMS

For every key form, trace:

```text
label
↓
input
↓
hint
↓
validation
↓
error
↓
submit
```

Verify the end-to-end flow.

---

# 32. FORM LABELS

Every relevant input must have a programmatically linked label.

Placeholders are not an acceptable substitute for visible, associated labels.

Look for:

- placeholder-only fields
- visual labels lacking programmatic association
- custom component wrappers breaking `for/id` bindings

---

# 33. PLACEHOLDER

Ensure placeholders never contain the sole critical instructions.

They disappear once the user begins typing.

---

# 34. REQUIRED FIELDS

Verify that required states are not communicated solely through color or visual asterisks without programmatic attributes (`required` or `aria-required`).

---

# 35. FIELD INSTRUCTIONS

For specialized formats, ensure instructions precede user input errors.

Examples:

- password constraints
- date formatting
- username rules

---

# 36. ERROR IDENTIFICATION

When validation fails, verify:

- field identification
- problem description
- guidance on how to fix

A message like:

```text
Invalid
```

is often inadequate.

---

# 37. ERROR ASSOCIATION

Error text must be programmatically associated with its respective input where appropriate.

Inspect:

- `aria-describedby`
- `aria-errormessage`
- library behavior

---

# 38. ERROR ANNOUNCEMENT

If errors occur after submission or async validation, ensure screen reader users are notified.

Do not inject live regions blindly.

Evaluate existing focus and error management patterns.

---

# 39. FORM SUBMISSION FAILURE

Scenario:

```text
submit
↓
server validation fails
↓
three fields invalid
```

Ask:

- where does focus move
- does the user know submission failed
- how does the user navigate to the first error

---

# 40. ERROR SUMMARY

For lengthy forms, evaluate whether an error summary component is appropriate.

It is not required for compact forms.

---

# 41. SUCCESS ANNOUNCEMENT

When submission succeeds, screen reader users must understand that the action completed.

Check:

- navigation transitions
- visible messages
- live regions
- focus shifts

---

# 42. LOADING STATE

Verify that loading states are not communicated solely through visual spinners.

For critical async operations, users must clearly know:

- that the operation started
- whether it is currently in progress
- when it completes

---

# 43. `aria-busy`

Where appropriate, verify usage of `aria-busy` or equivalent patterns.

Do not introduce without cause.

---

# 44. DISABLED CONTROLS

Verify how screen reader users understand why a control is disabled.

Particularly when a submit button remains disabled without explaining prerequisite requirements.

---

# 45. NATIVE DISABLED VS ARIA-DISABLED

Evaluate semantics.

`aria-disabled` does not natively block interactions.

If used, verify corresponding event handling logic.

---

# 46. CUSTOM CHECKBOX

If not a native checkbox, verify:

- role
- checked state
- keyboard activation
- label association
- focus indicator

---

# 47. RADIO GROUP

Check:

- group naming
- arrow key navigation
- selected state
- legend/group label association

---

# 48. SWITCH

If using a switch pattern:

- role
- checked state
- accessible name
- keyboard activation

---

# 49. SELECT

Prefer native `<select>` where suitable.

If custom:

- role
- keyboard navigation
- expanded state
- active option
- focus management
- screen reader announcements

---

# 50. COMBOBOX

Thoroughly inspect custom autocomplete/combobox components:

- input element
- popup listbox
- active descendant
- selected value
- arrow key navigation
- Escape dismissal
- Enter selection
- loading states
- empty/no-results states

This is a notorious accessibility hotspot.

---

# 51. AUTOCOMPLETE

Ensure screen reader users are informed of:

- count of matching results
- which result is currently active
- what value has been selected

where pattern guidelines dictate.

---

# 52. LISTBOX

Custom listboxes must implement complete pattern keyboard behaviors.

Do not merely append `role="listbox"`.

ARIA roles without matching keyboard interactions degrade accessibility.

---

# 53. MENUS

Distinguish standard navigation link lists from ARIA application menus (`role="menu"`).

Do not apply:

```text
role="menu"
```

merely because an element visually resembles a dropdown menu.

---

# 54. TABS

Check:

- `tablist`
- `tab`
- `tabpanel`
- selection state
- arrow key navigation
- focus behavior

If an implementation uses standard anchor links and works cleanly, do not force an ARIA tabs pattern.

---

# 55. ACCORDION

Check:

- button triggers
- expanded states
- relationships to panel containers
- keyboard interactions

---

# 56. DISCLOSURE

A simple show/hide control often demands fewer ARIA attributes than a full accordion widget.

Distinguish between patterns.

---

# 57. TOOLTIPS

Tooltip content:

- must not be the sole mechanism for conveying critical data
- must be triggerable via keyboard focus where relevant
- must maintain appropriate semantic relationships

Evaluate mobile/touch implications separately.

---

# 58. DIALOG SEMANTICS

For modals, check:

- dialog role
- accessible name
- modal state where appropriate
- focus trapping

Do not set `aria-modal` without providing complete focus entrapment.

---

# 59. ALERT DIALOG

For destructive confirmation actions, evaluate whether an alertdialog or standard dialog pattern is appropriate.

Do not use disruptive alertdialogs for routine confirmations.

---

# 60. TOASTS AND NOTIFICATIONS

Check:

- success
- warning
- error
- informational

Does the screen reader announce notifications without unnecessarily interrupting ongoing reading?

---

# 61. LIVE REGIONS

Inspect:

- `aria-live`
- `role="status"`
- `role="alert"`

Look for:

- overly aggressive announcements
- live regions mounted concurrently with messages (which browsers often fail to announce)
- repeated chatter

---

# 62. STATUS UPDATES

Dynamic notifications like:

```text
3 results found
```

may require polite announcements depending on context.

Evaluate actual necessity.

---

# 63. TABLES

For data tables, inspect:

- native `table` usage
- headers
- scope attributes
- captions
- cell-to-header relationships
- sort state indications

---

# 64. TABLE HEADERS

Complex tables with multi-tier headings require explicit header association logic.

Do not assume a single `th` suffices for nested layouts.

---

# 65. SORTABLE TABLES

If clicking a header sorts data, verify:

- control is keyboard accessible
- current sort direction is programmatically exposed

---

# 66. RESPONSIVE TABLES

If a mobile layout converts a table into cards, verify that semantic header-cell associations are preserved.

---

# 67. DATA GRID

An interactive data grid has rigorous keyboard requirements.

First determine whether the component truly requires a grid pattern or a standard table.

Do not introduce `role="grid"` without complete keyboard navigation implementation.

---

# 68. PAGINATION

Check:

- navigation landmark semantics
- current page indication
- accessible names for page links
- disabled control behavior

---

# 69. BREADCRUMBS

Check:

- navigation landmark
- accessible label
- current page indication

---

# 70. NAVIGATION

For main navigation, verify:

- semantic structure
- active/current page indicator
- keyboard operability
- mobile drawer behavior

---

# 71. MOBILE MENU ACCESSIBILITY

Verify the complete mobile menu lifecycle:

```text
menu button
↓
open
↓
focus
↓
navigate
↓
close
↓
focus restoration
```

---

# 72. CURRENT STATE

For navigation, tabs, and pagination, check programmatic current/selected indicators (`aria-current`, `aria-selected`).

Do not rely solely on color or bold font weights.

---

# 73. COLOR CONTRAST

Measure contrast ratios across relevant pairs:

- body text
- secondary text
- links
- button text
- input text
- placeholders where relevant
- icons conveying state or meaning
- focus indicators

Whenever possible, calculate exact contrast ratios.

Do not rely solely on subjective visual inspection.

---

# 74. TEXT CONTRAST

Distinguish:

- normal text
- large text

and apply the relevant standard thresholds.

---

# 75. NON-TEXT CONTRAST

Inspect essential UI boundaries and state indicators where contrast is mandatory:

- input borders
- checkboxes
- focus rings
- selected states
- meaningful icons

---

# 76. COLOR-ONLY INFORMATION

Look for instances where:

- green = success
- red = error
- blue = selected

without secondary visual or programmatic indicators.

Supplement with:

- text
- icons
- distinct shapes
- semantic states

---

# 77. LINKS

Links must be easily distinguishable as interactive elements.

If distinguished only by color, verify that styling and surrounding context satisfy standard requirements.

---

# 78. CHARTS

For charts, verify that data is not exposed exclusively through:

- color
- hover
- visual positioning

Provide alternative data access where appropriate.

---

# 79. DATA VISUALIZATION

For complex charts, provide:

- accessible tables
- textual summaries
- descriptive accessible captions

Do not attempt to verbalize every single data point in an image alt attribute.

---

# 80. STATUS BADGES

Badges utilizing color alone to denote:

- active
- failed
- pending
- success

must include programmatic and readable textual meaning.

---

# 81. MOTION

Inspect:

- animations
- transitions
- parallax effects
- auto-moving content
- blinking
- scrolling

---

# 82. PREFERS-REDUCED-MOTION

If significant animations exist, verify support for:

```css
@media (prefers-reduced-motion: reduce)
```

Not every subtle transition needs to be stripped.

Eliminate disorienting or excessive motion.

---

# 83. AUTOPLAY

For audio and video, verify:

- autoplay behavior
- audio playback
- user controls
- pause/stop mechanisms

Do not autoplay audio without an exceptional, justified reason.

---

# 84. CAROUSELS

Check:

- auto-rotation
- pause/play controls
- keyboard operability
- navigation buttons
- screen reader context
- current slide announcements

---

# 85. ANIMATED CONTENT

Users must be able to pause, stop, or hide moving, blinking, or scrolling content that starts automatically.

---

# 86. FLASHING CONTENT

Identify content presenting seizure risks (flashing more than three times in any one-second period).

If absent:

**NOT APPLICABLE**

---

# 87. ZOOM

Test browser zoom handling:

- 200% zoom
- layout reflow
- fixed elements
- horizontal scrolling

Do not block zooming via viewport configurations.

---

# 88. TEXT RESIZING

Verify that text can scale up without:

- clipping
- overlapping
- disappearing interactive controls

---

# 89. REFLOW

At narrow effective viewports, verify that users do not need two-dimensional scrolling for standard linear content, except where horizontal display is inherently required.

Examples:

- data tables
- interactive maps
- complex technical diagrams

---

# 90. FIXED ELEMENTS

Under magnification, verify that:

- sticky headers
- cookie banners
- bottom navigation bars
- chat widgets

do not consume the entire usable viewport area.

---

# 91. COGNITIVE ACCESSIBILITY

Do not diagnose users.

Evaluate UX attributes such as:

- clear, straightforward language
- consistent navigation
- predictable controls
- understandable error messages
- prevention of accidental data loss

---

# 92. CONSISTENT NAVIGATION

Repeated navigation elements must maintain consistent placement and order across related views.

---

# 93. CONSISTENT IDENTIFICATION

Identical functionality must not be labeled arbitrarily:

```text
Save
```

on one page and:

```text
Apply
```

on another if performing the exact same action.

Distinguish genuine semantic differences.

---

# 94. DESTRUCTIVE ACTIONS

Verify:

- clear labeling
- confirmation prompts where justified
- undo options where feasible
- keyboard access

Accessibility encompasses preventing irreversible unintentional actions.

---

# 95. TIME LIMITS

If the application enforces:

- session timeouts
- quiz countdowns
- checkout booking holds
- automatic logouts

verify options to warn users and extend duration where applicable.

Do not report inherent real-time limits without understanding business context.

---

# 96. SESSION EXPIRY

If a session expires during a long form submission, verify:

- whether users lose entered data
- whether a warning is displayed
- whether users can resume after re-authenticating

---

# 97. DRAG AND DROP

If drag-and-drop is present, ensure a keyboard-accessible alternative exists to achieve the same outcome.

---

# 98. POINTER GESTURES

If a feature relies on:

- swiping
- pinching
- multi-touch gestures
- path-based gestures

verify that single-pointer or keyboard alternatives exist.

---

# 99. TARGET SIZE

For compact controls, verify the actual tap hit area, not merely icon dimensions.

Particularly:

- close buttons
- pagination links
- kebab menus
- tiny checkboxes

---

# 100. POINTER CANCELLATION

For critical actions, verify that operations are not committed prematurely on pointer-down if users should have the ability to abort by dragging away.

---

# 101. SCREEN READER READING ORDER

The DOM order must convey coherent meaning independent of visual CSS layout styling.

Check:

- grids
- sidebars
- mobile content reordering
- portals

---

# 102. VISUALLY HIDDEN CONTENT

Inspect utility classes for screen-reader-only content (`sr-only`).

Ensure visually hidden elements do not inadvertently disrupt layout or remain focusable when deactivated.

---

# 103. `aria-hidden`

Find:

```html
aria-hidden="true"
```

and verify that no focusable or critical interactive elements reside within that hidden subtree.

---

# 104. HIDDEN INTERACTIVE ELEMENTS

Specifically check duplicate responsive desktop/mobile components.

If one is visually hidden via CSS, ensure keyboard users and screen readers cannot accidentally navigate into it.

---

# 105. ARIA MISUSE

Search for:

```text
role=
aria-
```

Look for:

- invalid roles
- redundant ARIA attributes
- contradictory states
- missing required ARIA properties
- misapplied widget patterns

Rule:

> No ARIA is better than bad ARIA.

Native HTML semantics always take precedence where they solve the problem.

---

# 106. `aria-label` VS VISIBLE TEXT

If an accessible name does not match or include visible text, speech-input users may fail to activate controls.

Verify matching labels.

---

# 107. LABEL IN NAME

For controls with visible text labels, verify that the programmatic accessible name contains that exact visible text string.

---

# 108. IDS

Look for duplicate HTML IDs that break:

- form label associations
- `aria-labelledby`
- `aria-describedby`

Particularly inside reusable list items.

---

# 109. GENERATED IDS

If IDs are generated during rendering, check SSR and hydration stability (`useId`).

---

# 110. LIVE DATA

If a dashboard updates figures automatically, avoid announcing every routine minor tick to screen readers.

Determine which updates genuinely warrant user interruption.

---

# 111. CHAT / MESSAGING

Check:

- new message notifications
- send states
- focus transitions
- conversation history accessibility
- live message announcements

Excessive live announcements can be as disruptive as missing ones.

---

# 112. FILE UPLOAD

Check:

- label association
- drag/drop keyboard alternatives
- upload status
- progress feedback
- error states
- completion announcements

---

# 113. PROGRESS

For long-running uploads or operations, verify that progress bars expose appropriate programmatic values (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).

---

# 114. CAPTCHA

If CAPTCHAs are employed, verify that accessible alternative verification options exist.

Do not assume third-party CAPTCHAs are accessible out of the box.

---

# 115. AUTHENTICATION ACCESSIBILITY

Inspect:

- login forms
- password inputs
- multi-factor authentication (MFA)
- password manager compatibility
- paste blocking
- one-time passcode fields

Never block pasting into password or verification inputs without compelling justification.

---

# 116. PASSWORD FIELDS

Check:

- show/hide password toggles
- accessible toggle names
- state announcements
- clear password criteria

---

# 117. MFA

One-time code inputs must support:

- keyboard navigation
- pasting complete codes
- autocomplete attributes (`one-time-code`)

---

# 118. CAPTCHA / SECURITY BALANCE

Security safeguards must not needlessly exclude users with disabilities.

Document accessibility gaps without undermining underlying security.

---

# 119. MAPS

If a map conveys essential data, verify that accessible alternative representations are provided.

For example:

- list of locations
- searchable textual addresses

---

# 120. CANVAS

If significant content resides exclusively inside `<canvas>`, inspect accessible fallback DOM trees.

---

# 121. VIDEO

For video content, inspect:

- closed captions
- transcripts
- player controls
- keyboard operability
- focus rings

---

# 122. AUDIO

For audio content, check:

- controls
- transcripts where required
- autoplay restrictions

---

# 123. CAPTIONS

Do not declare captions compliant merely because a caption track file exists.

If caption accuracy cannot be evaluated:

**CAPTION QUALITY: NOT VERIFIED**

---

# 124. DOCUMENTS AND DOWNLOADS

If the application links to downloadable PDFs or documents containing essential information, flag potential document accessibility risks if not verifiable in this audit.

Do not assume a PDF is accessible without reviewing it.

---

# 125. PDF LINKS

When an anchor opens a PDF instead of a web page, indicating the file format in the accessible name or visible text helps set expectations.

---

# 126. THIRD-PARTY WIDGETS

Map:

- payment gateways
- chat widgets
- external maps
- social embeds
- booking widgets
- cookie consent banners

Accessibility flaws in embedded third-party widgets still harm end users.

Clearly attribute ownership.

---

# 127. COOKIE BANNERS

Check:

- keyboard access
- focus trapping/restoration
- contrast
- screen reader visibility
- reject/accept control symmetry
- modal backdrop behavior

---

# 128. CHAT WIDGET

Ensure floating chat widgets do not:

- obscure focus rings
- cover primary buttons
- introduce unexpected tab traps

---

# 129. MOBILE ACCESSIBILITY

Specifically verify:

- touch targets
- screen reader reading sequence
- mobile hamburger menus
- forms on mobile viewports
- modals
- orientation handling
- pinch-to-zoom

Desktop accessibility alone is insufficient.

---

# 130. LANDSCAPE

Verify that critical content is not locked or rendered unreachable in landscape mobile orientations.

---

# 131. COLOR SCHEME

If a dark mode exists, evaluate contrast independently for both light and dark themes.

Passing light mode does not imply dark mode passes.

---

# 132. HIGH CONTRAST MODES

If the platform supports forced colors or high contrast modes, inspect custom controls for lost borders and backgrounds.

---

# 133. CSS BACKGROUND IMAGES

Critical informative text must not reside solely inside CSS background images.

---

# 134. ICON COLOR

If icons denote status solely through color, incorporate secondary visual and programmatic indicators.

---

# 135. VALIDATION COLOR

A red input border without descriptive textual or programmatic error indicators is insufficient.

---

# 136. AUTOMATED TOOLS

Where available, utilize:

- axe
- Lighthouse
- framework accessibility linters
- browser accessibility trees

However:

> Automated tools do not constitute a complete accessibility audit.

Never pronounce an application accessible merely because axe reports 0 violations.

---

# 137. AUTOMATED FALSE POSITIVES

Evaluate automated findings in their actual context.

Do not transcribe raw automated reports without verification.

---

# 138. MANUAL TESTING

Prioritize manual verification:

- keyboard-only navigation
- browser magnification (zoom)
- mobile screen navigation
- screen reader testing where available
- form validation error handling
- modal lifecycle
- navigation routing

---

# 139. SCREEN READER TESTING

If feasible, test with a relevant screen reader.

Verify:

- page titles
- landmarks
- headings
- form controls
- buttons
- links
- dialogs
- dynamic updates

If not verified at runtime:

**SCREEN READER RUNTIME TEST: NOT VERIFIED**

---

# 140. ACCESSIBILITY TREE

If browser tooling permits, inspect the accessibility tree for critical custom components.

---

# 141. REPOSITORY TESTS

Review existing accessibility tests in the codebase.

Look for:

- jest-axe
- axe Playwright/Cypress integration
- keyboard navigation tests
- accessibility snapshots
- focus management tests

---

# 142. TEST LIMITATIONS

A test that merely asserts:

```text
expect(await axe(container)).toHaveNoViolations()
```

does not prove:

- intuitive keyboard flows
- correct focus management
- intelligible screen reader UX
- end-to-end form usability

---

# 143. CRITICAL COMPONENT MATRIX

Create a matrix:

| Component | Keyboard | Focus | Name | State | Screen reader | Result |
|---|---|---|---|---|---|---|

For:

- navigation
- menu
- dialog
- form
- combobox
- tabs
- table
- toast

where present.

---

# 144. PAGE MATRIX

For key routes:

| Route | Headings | Landmarks | Forms | Keyboard | Focus | Result |
|---|---|---|---|---|---|---|

---

# 145. FINDING FORMAT

For every serious finding:

```text
ID:
Severity:
Standard/Category:
Confidence:
Status:
 
Affected users:
Route:
Component:
File:
Relevant location:
 
Problem:
 
Evidence:
 
User flow:
 
Keyboard behavior:
 
Screen reader behavior:
 
Visual behavior:
 
Impact:
 
Root cause:
 
Recommended remediation:
 
How to verify:
 
Regression test:
 
Complexity:
XS / S / M / L / XL
```

If a particular field is not relevant, mark it:

**NOT APPLICABLE**

---

# 146. SEVERITY

Use:

## P1 - HIGH

- user is blocked from completing a critical flow
- essential action is completely keyboard unreachable
- modal traps or completely blocks screen reader/keyboard users
- key form is entirely unusable for an affected user group

## P2 - MEDIUM

- significant accessibility barrier with an available workaround
- critical information is not programmatically exposed
- serious focus management or navigation disruption

## P3 - LOW

- isolated issue on secondary functionality
- minor semantic anomaly with observable consequences

## P4 - IMPROVEMENT

- justified accessibility improvement without an active blocking barrier

Reserve P0 exclusively for accessibility failures triggering severe safety, security, or catastrophic operational incidents.

---

# 147. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

reproduced at runtime or proven directly through DOM semantics.

MEDIUM:

code strongly demonstrates the defect, but assistive technology runtime was not tested directly.

LOW:

depends on specific browser/assistive technology combinations that were not verified.

---

# 148. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 149. STANDARD MAPPING

Where reliable, link findings to relevant WCAG success criteria.

However:

- do not fabricate criterion numbers
- do not force mappings if uncertain
- technical accessibility bugs remain valid even without explicit criterion numbers

If mapping is not verified:

```text
WCAG mapping: NOT VERIFIED
```

---

# 150. DUPLICATE FINDINGS

If the same component pattern causes defects across 30 instances:

create a single root-cause finding.

List:

```text
Affected locations:
```

Do not produce 30 redundant finding entries.

---

# 151. FALSE-POSITIVE PREVENTION

Before filing a finding, verify:

1. rendered HTML
2. component library behavior
3. parent container wrappers
4. event handlers
5. keyboard handling
6. CSS
7. hidden labels
8. ARIA relationships
9. native browser behavior
10. test coverage

Example:

If you see no `aria-label` in a component, verify whether its accessible name derives naturally from visible text content.

---

# 152. DO NOT INJECT ARIA UNCONDITIONALLY

Rule:

> Use native HTML whenever it solves the problem correctly.

Do not suggest:

```html
<div role="button">
```

when:

```html
<button>
```

provides superior native behavior.

---

# 153. DO NOT MODIFY CODE

During the audit:

- do not edit components
- do not add ARIA
- do not change styles
- do not alter design systems
- do not install accessibility libraries

Complete the audit first.

---

# 154. OUTPUT - ACCESSIBILITY_AUDIT.md

Structure the final audit report as follows:

## 1. Executive Summary

Detail:

- stack
- accessibility posture
- primary barriers
- strongest existing accessibility practices
- runtime verified scope
- unverified scope

## 2. Accessibility Architecture

- component library
- design system
- semantic strategy
- test coverage

## 3. Critical User Flows

## 4. Keyboard Audit

## 5. Focus Management Audit

## 6. Screen Reader Audit

## 7. Semantic HTML Audit

## 8. Forms Audit

## 9. Navigation Audit

## 10. Dialog / Modal / Drawer Audit

## 11. Custom Widgets Audit

## 12. Tables & Data Visualization Audit

## 13. Color & Contrast Audit

## 14. Motion Audit

## 15. Responsive / Zoom / Reflow Audit

## 16. Media Accessibility

## 17. Dynamic Content & Live Regions

## 18. Third-Party Components

## 19. Automated Testing Results

## 20. Manual Testing Results

## 21. Findings Summary

| ID | Severity | Category | Affected users | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P1 Findings

## 23. P2 Findings

## 24. P3 Findings

## 25. P4 Improvements

## 26. Existing Accessibility Strengths

## 27. Missing Test Coverage

## 28. Unknown / Not Verified

## 29. Remediation Roadmap

### Phase 1 - Blocking barriers

### Phase 2 - Critical user flows

### Phase 3 - Shared components

### Phase 4 - Secondary content

### Phase 5 - Improvements

Prioritize based on real user impact, not solely on WCAG checklist volume.

---

# 155. KEYBOARD-ONLY SECOND PASS

Following the initial audit, traverse the critical flow once more without touching a mouse.

Assume you have only:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys
```

Ask:

- Can I open every required control?
- Can I close everything I opened?
- Do I always know where the focus indicator is?
- Does focus wander into invisible content?
- Is there any keyboard trap?
- Does navigation order make sense?

---

# 156. SCREEN-READER SECOND PASS

Re-evaluate the UI stripped of visual presentation.

For each screen, ask:

> If I only had the accessibility tree, would I understand this page?

Specifically inspect:

- page titles
- headings
- landmarks
- links
- buttons
- forms
- error messages
- dynamic state updates

---

# 157. NO-COLOR PASS

Assume the user cannot reliably perceive color differences.

Ask:

> What information is lost?

Verify:

- validation states
- statuses
- charts
- selected states
- required indicators
- alerts

---

# 158. 200% ZOOM PASS

Mentally or at runtime test the critical flow under significant magnification.

Ask:

- Do controls overlap?
- Does content disappear?
- Does fixed UI mask primary content?
- Does functionality remain operable?

---

# 159. REDUCED MOTION PASS

Assume the user has enabled reduced motion preferences.

Ask:

- Which animations still run?
- Are they essential?
- Does the interface remain fully functional without them?

---

# 160. ERROR PASS

Intentionally trigger:

- required field errors
- invalid input formats
- server errors
- authentication errors

Ask:

> Can a non-sighted user understand what went wrong and how to fix it?

---

# 161. DYNAMIC CONTENT PASS

For:

- search inputs
- autocomplete
- filters
- toast notifications
- progress indicators
- real-time updates

ask:

> Does a user who cannot see the screen know that something changed?

Do not announce trivial, noisy background updates.

---

# 162. DESTRUCTIVE FLOW PASS

For:

- deletions
- subscription cancellations
- account resets
- removals

check:

- accessible control naming
- confirmation flows
- focus landing
- action outcomes

---

# 163. FIRST-TIME USER PASS

Imagine a user who:

- does not know the layout
- uses a keyboard
- uses a screen reader

Does the UI require visual memorization of control coordinates?

---

# 164. FINAL QUALITY GATE

Before returning your final response, verify:

- you did not reduce accessibility to mere ARIA attributes
- you did not reduce accessibility to automated tooling
- you did not report missing aria-labels when good visible names exist
- you did not inject ARIA onto native elements unnecessarily
- every P1/P2 finding reflects concrete user impact
- keyboard and focus behavior were evaluated independently
- modal behavior was inspected through its complete lifecycle
- forms were checked alongside error states
- dynamic content was not ignored
- responsive and zoom accessibility were checked
- color-only dependencies were examined
- third-party widgets were evaluated where they touch critical flows
- standards mappings were not fabricated
- assistive technology behavior was not asserted as confirmed without runtime testing
- duplicate root causes were consolidated
- improvements were clearly separated from actual barriers

---

# FINAL RULE

I do not want generic recommendations like:

> Add alt text to images, ARIA labels to buttons, and increase contrast.

That is not a rigorous accessibility audit.

I want you to analyze a real user attempting to complete a real task.

A quality finding looks like this:

```text
Keyboard user
↓
opens Edit Profile modal
↓
focus remains on background Edit button
↓
Tab continues through background page
↓
modal controls are not next in focus order
↓
user cannot reliably navigate the modal
```

or:

```text
Form submit
↓
server returns validation error
↓
error appears visually at top of page
↓
focus remains on Submit
↓
no live announcement
↓
screen reader user receives no cue that submission failed
```

or:

```text
Status displayed as green/red dot
↓
no text
↓
no accessible label
↓
user who cannot distinguish colors or relies on a screen reader
↓
cannot ascertain system status
```

For every serious finding, identify:

- who is affected
- what function they are trying to perform
- where the flow breaks
- what current code is doing
- how to prove the defect
- how to fix the root cause
- how to prevent regression

If something was not verified with assistive technology:

**NOT VERIFIED.**

If only a potential risk is observed:

**LIKELY** or **THEORETICAL**.

If it is merely an enhancement:

**P4 - IMPROVEMENT.**

It is better to discover 12 genuine accessibility barriers than to produce 100 generic WCAG checklist items devoid of context.

The goal is an accessibility audit that developers can immediately convert into concrete code fixes, regression tests, and verifiable acceptance criteria.
