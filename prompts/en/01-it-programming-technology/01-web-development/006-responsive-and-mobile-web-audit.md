---
id: UPL-IT-006
number: 6
slug: responsive-and-mobile-web-audit
title: Responsive & Mobile Web Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.0.0
status: stable
---

# RESPONSIVE AND MOBILE WEB AUDIT

I want you to perform an exhaustive, systematic, and evidence-first analysis of the responsive behavior of the entire web application.

Main goal:

> Determine whether the application remains functional, legible, stable, and usable across different screen sizes, devices, orientations, and input methods.

This is not:

- just checking a few CSS breakpoints
- just a visual review
- a generic "make it mobile-first" recommendation
- an automatic layout rewrite
- a list of subjective design opinions

The focus is on real responsive and mobile issues that can cause:

- horizontal overflow
- unreachable actions
- clipped content
- broken layouts
- overlapping elements
- illegible text
- poor navigation
- poor touch experience
- virtual keyboard issues
- modal/dialog issues
- mobile-only or desktop-only regressions
- viewport issues
- orientation issues
- responsive state drift
- layout-related accessibility issues

Priority:

**functionality > accessibility > legibility > layout stability > visual perfection**

Do not report a design difference as a bug if it is deliberate and functional.

---

# 1. IDENTIFY FRONTEND STACK

Before the analysis, determine:

- framework
- CSS system
- Tailwind
- CSS Modules
- styled-components
- vanilla CSS
- design system
- component library
- responsive utility system
- breakpoint configuration
- viewport configuration
- layout primitives
- mobile navigation model

Inspect:

- global styles
- theme
- Tailwind config
- layout components
- header
- sidebar
- navigation
- cards
- forms
- tables
- dialogs
- modals
- drawers
- pages
- dashboard layouts

---

# 2. MAP BREAKPOINT SYSTEM

Identify all breakpoints.

If Tailwind is used, check the actual configuration.

If custom media queries are used, find them repository-wide.

Create a map:

```text
mobile
tablet
small desktop
desktop
wide desktop
```

with actual values from the project.

Look for:

- multiple parallel breakpoint systems
- hardcoded media queries
- JS breakpoint values that differ from CSS
- duplicated breakpoint constants

---

# 3. CSS VS JAVASCRIPT RESPONSIVE LOGIC

Find responsive behavior implemented via JavaScript.

For example:

```ts
window.innerWidth
```

```ts
matchMedia(...)
```

```ts
isMobile
```

Verify:

- whether the same can be achieved more simply with CSS
- whether JS and CSS share the same breakpoints
- whether there is an SSR/hydration risk
- whether window resize updates state
- whether listeners have proper cleanup

Do not report JS-based responsive behavior if it is genuinely necessary.

---

# 4. VIEWPORT META

Check the viewport configuration.

Look for issues such as:

- incorrect width
- scaling restrictions
- user-scalable restrictions
- improper viewport settings

Specifically check accessibility implications.

Do not disable user zoom without an extraordinarily justified reason.

---

# 5. GLOBAL HORIZONTAL OVERFLOW

Look for elements that expand the viewport.

Typical causes:

- fixed width
- `100vw`
- absolute positioning
- large margin
- transform
- long text
- pre element
- table
- image
- code block
- flex child without `min-width: 0`

For each finding, pinpoint the exact element causing the overflow.

---

# 6. `100vw` ISSUES

Check usage of:

```css
width: 100vw;
```

in layouts that already have a scrollbar or parent padding.

This can introduce horizontal overflow.

Do not report every `100vw`.

Analyze the context.

---

# 7. FLEXBOX OVERFLOW

Specifically inspect flex children.

Common issue:

```css
display: flex;
```

with a child that lacks:

```css
min-width: 0;
```

when containing long text.

Reproduce the specific scenario.

---

# 8. GRID OVERFLOW

Review CSS Grid.

Look for:

```css
grid-template-columns: repeat(3, 1fr);
```

without responsive adjustments when the viewport becomes small.

Also inspect:

```css
minmax(...)
```

and minimum column widths.

---

# 9. FIXED WIDTH

Repository-wide look for:

- `width: 500px`
- `min-width`
- `max-width`
- Tailwind `w-[...]`
- `min-w-[...]`

For every large fixed value, check behavior on smaller screens.

---

# 10. MIN-WIDTH ISSUES

Specifically analyze elements with large `min-width`.

This frequently causes mobile overflow.

Examples:

- input
- modal
- table
- card
- toolbar

---

# 11. MAX-WIDTH

Check whether main content becomes excessively wide on large displays.

This can degrade:

- legibility
- visual hierarchy
- reading comfort

Do not enforce a single max-width across all page types.

---

# 12. TEXT WRAPPING

Mentally test long content:

- email
- URL
- UUID
- filename
- company name
- long title
- German compound words
- generated content

Look for text that breaks out of its container.

---

# 13. WORD BREAKING

Check where the following are needed:

- `overflow-wrap`
- `word-break`
- truncation

Do not apply aggressive word breaking if it harms readability.

---

# 14. TEXT TRUNCATION

For `truncate` and `line-clamp`, check:

- whether users can access the full text
- whether essential content is obscured
- whether tooltips work on touch devices

A hover-only tooltip is insufficient on mobile.

---

# 15. TYPOGRAPHY SCALE

Check whether font sizes work across smaller screens.

Look for:

- oversized hero headings
- undersized body text
- undersized metadata text
- line-height issues

---

# 16. RESPONSIVE TYPOGRAPHY

If fluid typography is used, check:

- minimum size
- maximum size
- extreme viewports

`clamp()` is not automatically correct if values are poorly chosen.

---

# 17. TOUCH TARGETS

Inspect:

- buttons
- icons
- links
- checkboxes
- menu items
- pagination
- close buttons

Look for actions that are difficult to tap with a finger.

Do not focus solely on visual dimensions.

Verify the actual hit area.

---

# 18. ICON-ONLY BUTTONS

On mobile devices, an icon-only button must have:

- an adequately sized touch target
- clear meaning
- an accessible name

Specifically verify:

- close
- menu
- delete
- edit
- overflow menu

---

# 19. HOVER-ONLY INTERACTIONS

Look for features available exclusively through:

- `:hover`
- tooltip
- hidden controls on hover
- hover menus

Ask:

> How does a user on a touch device trigger this function?

If there is no answer, it is a real mobile defect.

---

# 20. DESKTOP HOVER STATE

Conversely, verify that mobile CSS does not leave elements stuck in a "hover-like" state after a tap.

---

# 21. NAVIGATION

Analyze the navigation model across all sizes.

Verify:

- desktop nav
- mobile nav
- hamburger
- drawer
- bottom navigation
- sidebar

Ask:

> Do all critical routes remain accessible on mobile?

---

# 22. MOBILE MENU

Check:

- open
- close
- escape
- backdrop
- scroll lock
- focus
- navigation close behavior
- route change
- resize

Scenario:

```text
open menu
↓
navigate
↓
does menu close?
```

---

# 23. RESIZE WITH OPEN MENU

Scenario:

```text
mobile viewport
↓
open drawer
↓
resize to desktop
```

Check:

- whether the drawer remains open
- whether the backdrop remains
- whether body remains scroll-locked

---

# 24. SIDEBAR

Check desktop sidebar behavior when space becomes narrow.

Look for:

- squeezed content
- overlapping
- sidebars that cannot be collapsed
- disappeared navigation

---

# 25. BOTTOM NAVIGATION

If present, verify:

- safe area
- browser controls
- keyboard
- content padding

Verify that content is not obscured behind the bottom nav.

---

# 26. SAFE AREA

For mobile/PWA, verify support for:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

where relevant.

Particularly with:

- fullscreen
- fixed header
- bottom nav

---

# 27. FIXED HEADER

Check:

- height
- sticky/fixed
- content offset
- anchor navigation
- mobile browser UI

Look for content obscured behind headers.

---

# 28. STICKY ELEMENTS

`position: sticky` can fail due to parent overflow constraints.

Verify the actual DOM hierarchy.

---

# 29. MULTIPLE STICKY ELEMENTS

If the following coexist:

- header
- filters
- tabs
- toolbar

verify that they do not consume excessive vertical real estate on mobile phones.

---

# 30. VIEWPORT HEIGHT

Look for:

```css
height: 100vh;
```

On mobile browsers, this can cause layout jumping due to dynamic browser chrome.

Check whether the project adopts appropriate modern viewport units where relevant.

Do not replace `100vh` automatically without an identifiable problem.

---

# 31. `dvh`, `svh`, `lvh`

If used, check the project's target browser support.

Analyze:

- keyboard
- browser bars
- fullscreen

---

# 32. MODALS

Inspect all critical modals on small viewports.

Check:

- width
- max-height
- scroll
- close button
- keyboard
- focus
- long content

---

# 33. MODAL LARGER THAN SCREEN

Scenario:

```text
small phone
+
long form
```

Verify whether:

- modal content scrolls properly
- header/footer remain accessible
- submit button can be reached

---

# 34. MOBILE FULLSCREEN DIALOG

Some complex forms function better as fullscreen mobile dialogs.

Do not recommend automatically.

Evaluate current UX first.

---

# 35. DRAWERS

Check:

- width
- edge gestures
- scroll
- focus
- nested content

---

# 36. TOOLTIPS

Tooltips are not a reliable sole mechanism to convey critical information on touch devices.

Identify critical information exposed only on hover.

---

# 37. DROPDOWN MENUS

Check on touch devices:

- opening
- closing
- nested menus
- viewport collision
- scroll
- keyboard

---

# 38. POPOVER POSITIONING

Verify that popovers do not overflow outside the viewport.

If the component library automatically handles collision detection, avoid reporting false positives.

---

# 39. FORMS

Mobile forms require specialized inspection.

Check:

- field width
- labels
- spacing
- error messages
- submit button
- keyboard
- scrolling

---

# 40. INPUT TYPES

Verify that inputs use appropriate types:

- email
- tel
- number
- date
- search
- url

This directly dictates mobile keyboard presentation and UX.

---

# 41. `inputmode`

Where appropriate, check `inputmode`.

Especially:

- numeric
- decimal
- email
- tel

---

# 42. AUTOCOMPLETE

Check autocomplete attributes for:

- name
- email
- address
- phone
- password

Poor autocomplete attributes significantly degrade mobile form UX.

---

# 43. MOBILE KEYBOARD

Mentally test:

```text
focus input
↓
keyboard opens
↓
viewport shrinks
```

Ask:

- does the field remain visible
- does submit remain reachable
- does a fixed footer cover the input

---

# 44. KEYBOARD + MODAL

Specifically test forms inside modals.

This is a frequent source of mobile breakage.

---

# 45. FIXED BOTTOM CTA

If a fixed CTA exists, inspect:

- keyboard interaction
- safe area
- overlap
- scroll

Verify that it does not conceal the last form input.

---

# 46. TABLES

Large data tables are a critical responsive challenge.

Analyze the layout strategy:

- horizontal scroll
- responsive columns
- card transformation
- priority columns
- stacked layout

Do not transform every table into cards unconditionally.

---

# 47. HORIZONTAL TABLE SCROLL

If intentional, check:

- discoverability
- sticky columns
- touch scroll
- scrollbar
- action columns

---

# 48. TABLE ACTIONS

If edit/delete actions reside in the far-right column, verify whether users can discover and tap them easily on mobile.

---

# 49. DATA DENSITY

Mobile screens possess limited area.

Look for desktop dashboards that simply "compress" identical counts of:

- cards
- columns
- widgets

without prioritization.

---

# 50. CARDS

Check:

- card width
- grid
- content wrapping
- action placement
- image ratio

---

# 51. RESPONSIVE GRID

Mentally test layout transitions:

```text
4 columns
↓
3
↓
2
↓
1
```

Look for awkward width zones between breakpoints.

---

# 52. BREAKPOINT CLIFFS

Defects frequently occur right at breakpoint thresholds.

Example:

```text
767px
768px
```

where layout abruptly shifts structure.

Test both boundary edges.

---

# 53. INTERMEDIATE WIDTHS

Do not test only:

- 375
- 768
- 1440

Also test irregular and intermediate widths:

- 320
- 360
- 390
- 430
- 600
- 820
- 1024
- 1280

The goal is not an exhaustive device inventory, but detecting breakpoint gaps.

---

# 54. VERY SMALL MOBILE

Specifically verify widths around 320 px.

Inspect:

- buttons
- forms
- nav
- dialogs
- tables
- headers

---

# 55. LARGE MOBILE

Large phones may fall between mobile and tablet designs.

Verify that the layout does not look unintentionally stretched.

---

# 56. TABLET PORTRAIT

A tablet is not merely an oversized phone.

Check:

- sidebar
- dashboard
- forms
- tables

---

# 57. TABLET LANDSCAPE

Specifically test intermediate desktop-like layouts.

---

# 58. LANDSCAPE PHONE

Short viewport height frequently reveals flaws that portrait mode masks.

Check:

- modal
- navigation
- video/player
- forms
- fixed header/footer

---

# 59. ORIENTATION CHANGE

Scenario:

```text
portrait
↓
open feature
↓
rotate landscape
```

Check:

- stale JS breakpoint state
- modal sizing
- scroll
- selected layout

---

# 60. IMAGES

Check responsive images.

Look for:

- fixed dimensions
- overflow
- wrong aspect ratio
- stretched images
- oversized asset downloads

---

# 61. `object-fit`

Check `cover` vs `contain` where subject matter matters.

`cover` can clip critical parts of an image.

---

# 62. IMAGE ASPECT RATIO

Verify that media containers reserve appropriate space to prevent layout shifts.

---

# 63. VIDEO

Check video/player components on mobile for:

- aspect ratio
- controls
- fullscreen
- landscape
- overlays
- captions

---

# 64. IFRAME

Embeds often enforce fixed dimensions.

Look for:

- YouTube
- maps
- external widgets

Check for responsive wrapper containment.

---

# 65. CODE BLOCKS

For blog/docs applications, check:

- horizontal scroll
- copy button
- line wrapping
- mobile width

Do not force line wrapping if it damages code readability.

---

# 66. PRE ELEMENTS

`pre` elements frequently cause global horizontal overflow.

Verify container containment.

---

# 67. LONG URLS

Test long URLs in:

- comments
- posts
- tables
- cards

---

# 68. FILE NAMES

Long filenames can break:

- upload lists
- attachment cards
- modals

---

# 69. INTERNATIONALIZATION

If the application supports multiple locales, perform the responsive audit with longer translation strings.

Particularly:

- German
- Finnish
- localized CTAs

Do not assume an English layout represents all languages.

---

# 70. RTL

If the application supports RTL, check:

- flex direction
- icons
- drawer side
- margins
- text alignment

---

# 71. ZOOM

Check browser zoom levels:

- 125%
- 150%
- 200%

Desktop responsive designs must withstand scaling.

---

# 72. TEXT SIZE

Mobile operating systems and browsers allow users to scale default fonts.

Verify layout behavior with increased font sizes.

---

# 73. ACCESSIBILITY REFLOW

For accessibility compliance, verify that content remains functional when the viewport is effectively narrowed by scaling.

---

# 74. DESKTOP ULTRAWIDE

A responsive audit does not end at mobile.

On ultrawide monitors, check:

- overly long line lengths
- sparse dashboard layouts
- overstretched cards
- unconstrained container widths

---

# 75. HIGH DPI

Verify that raster assets provide adequate resolution where relevant.

---

# 76. POINTER TYPES

CSS can distinguish between:

- fine pointer
- coarse pointer

Verify that UX does not assume a mouse purely based on screen width.

A tablet with touch input is distinct from a desktop workstation.

---

# 77. HOVER CAPABILITY

Use media queries for actual hover capability where appropriate instead of assuming "desktop = hover".

---

# 78. MOBILE SCROLL

Check:

- nested scroll containers
- body scroll lock
- overscroll
- sticky content
- scroll restoration

---

# 79. NESTED SCROLL

A scrollable modal inside an already scrollable page can yield frustrating UX.

Identify concrete nested scroll traps.

---

# 80. SCROLL LOCK

Verify that after closing:

- modal
- drawer
- menu

body scrolling is reliably restored.

---

# 81. SCROLL POSITION

Scenario:

```text
list
↓
open detail
↓
Back
```

Does the user return to their approximate previous scroll position where expected?

---

# 82. INFINITE SCROLL

On mobile, verify:

- load trigger
- footer reachability
- duplicate loads
- scroll restoration

---

# 83. PAGINATION

Verify that pagination controls fit on small screens.

Desktop pagination frequently displays too many page numbers.

---

# 84. BREADCRUMBS

Long breadcrumbs can trigger overflow.

Evaluate:

- truncation
- wrapping
- collapsing

---

# 85. TABS

Excessive tabs on mobile phones present navigation friction.

Check:

- horizontal scroll
- wrapping
- dropdown alternative
- active tab visibility

---

# 86. STEPPERS

Multi-step forms must remain comprehensible on narrow viewports.

---

# 87. TOOLBARS

Toolbars with numerous actions may require:

- overflow menus
- wrapping
- prioritization

Do not hide critical actions without justification.

---

# 88. FILTER BAR

Desktop filter bars rarely fit directly on mobile.

Check:

- wrapping
- drawer
- modal
- collapsible filters

---

# 89. SEARCH BAR

Check:

- width
- clear button
- results overlay
- keyboard
- cancel behavior

---

# 90. DASHBOARD WIDGETS

On small screens, check widget rendering order.

CSS reflow can unintentionally alter semantic priority.

---

# 91. CHARTS

Check:

- responsive dimensions
- legends
- labels
- tooltips
- horizontal scroll
- touch interaction

---

# 92. CHART HOVER

Charts that display values exclusively via hover are often unusable on touch devices.

---

# 93. MAPS

Check map interactions on mobile.

Specifically detect conflicts between:

- page scroll
- map dragging
- pinch zoom

---

# 94. DATE PICKERS

Desktop calendar pickers frequently perform poorly on mobile.

Check:

- viewport boundaries
- keyboard behavior
- native input usage
- modal wrappers
- month navigation

---

# 95. SELECT COMPONENTS

Custom select components must support:

- touch
- keyboard
- long option lists
- mobile viewports

---

# 96. DRAG AND DROP

If drag and drop is the sole means of performing an action, check touch support and provide an accessible alternative.

---

# 97. RESIZE LISTENERS

Search repository-wide for resize handling.

Check:

- cleanup
- debounce/throttle
- duplicate listeners
- unnecessary JS responsive behavior

---

# 98. MATCHMEDIA

If `matchMedia` is used, verify:

- initial state
- listener attachment
- cleanup
- SSR safety
- legacy API compatibility if relevant

---

# 99. SSR AND RESPONSIVE UI

If the server does not know the viewport dimensions, ensure the server and client do not render entirely divergent DOM structures on first paint based on `window.innerWidth`.

This can trigger:

- hydration mismatches
- layout flash

---

# 100. MOBILE-SPECIFIC DUPLICATE TREES

Look for patterns like:

```tsx
<DesktopVersion />
<MobileVersion />
```

where CSS merely hides one.

Check whether both versions:

- mount simultaneously
- execute network fetches
- register effects
- dispatch analytics events

This can represent both a correctness and a performance defect.

---

# 101. CONDITIONAL MOUNTING

If one version mounts conditionally based on a JS breakpoint, verify:

- initial mismatch
- hydration
- window resizing
- lost state

---

# 102. RESPONSIVE STATE LOSS

Scenario:

```text
desktop
↓
user fills form
↓
resize to mobile
↓
different component mounts
↓
form state disappears
```

If such a flow exists, report it.

---

# 103. MOBILE PERFORMANCE

The responsive audit should flag conspicuous mobile performance risks such as:

- rendering dual layout DOM trees
- oversized images
- excessive DOM nodes
- heavy touch event handlers

Leave in-depth performance profiling to the dedicated performance audit.

---

# 104. MOBILE NETWORK

Inspect critical UI for loading behavior on slower connections.

Particularly:

- skeleton layouts
- content jumping
- modal loading states
- navigation feedback

---

# 105. LOADING SKELETON

A skeleton should closely mirror the target layout.

If a mobile skeleton assumes desktop proportions, it will trigger significant layout shifts (CLS).

---

# 106. ERROR MESSAGES

Form validation errors can significantly increase layout height.

Check:

- overlapping
- clipped content
- displaced submit buttons
- scrolling to errors

---

# 107. TOASTS

Check:

- mobile width
- bottom nav overlap
- safe area insets
- multiple stacked toasts
- keyboard overlap

---

# 108. COOKIE BANNERS

Cookie/privacy banners frequently break mobile viewports.

Check:

- height
- scrollability
- fixed positioning
- availability of accept/close controls

---

# 109. INSTALL BANNERS

If a PWA install prompt exists, verify interactions with:

- bottom nav
- cookie banners
- browser UI

---

# 110. CHAT WIDGETS

Third-party chat widgets can obscure:

- CTA buttons
- bottom nav
- form controls

Particularly on small screens.

---

# 111. Z-INDEX

Inspect critical overlay layers:

- header
- menu
- dialog
- popover
- tooltip
- toast

Look for conflicting stacking hierarchies.

---

# 112. STACKING CONTEXT

The root issue is rarely just "increase z-index".

Check parent properties:

- transform
- opacity
- position
- isolation

which establish new stacking contexts.

---

# 113. CONTENT ORDER

CSS Grid/Flex `order` can visually reorder elements without altering DOM order.

Ensure keyboard navigation and screen reader reading orders remain logical.

---

# 114. HIDDEN CONTENT

Inspect:

- `display: none`
- `visibility`
- opacity
- offscreen positioning

Ensure hidden mobile or desktop elements are not still focusable.

---

# 115. FOCUS

On mobile and during responsive breakpoint transitions, check focus state.

Scenario:

```text
desktop menu item focused
↓
viewport shrinks
↓
desktop nav hidden
```

Does focus remain trapped inside an invisible element?

---

# 116. BREAKPOINT STATE CHANGE

If a component alters behavior at a breakpoint, verify existing state persistence.

Example:

```text
desktop modal
↓
resize
↓
mobile drawer
```

Does data/state transition smoothly?

---

# 117. BROWSER CHROME

Mobile browser address and toolbar bars dynamically modify the visible viewport.

Check fullscreen and fixed layouts specifically.

---

# 118. IOS-SPECIFIC LAYOUT RISKS

If code contains mobile-specific CSS, check for:

- safe area
- viewport height
- fixed elements
- form input auto-zoom

Do not report browser-specific issues without code evidence or established platform semantics.

---

# 119. INPUT FONT SIZE

Inputs with font sizes smaller than 16px can trigger automatic zooming in certain mobile browsers.

Check where relevant.

---

# 120. ANDROID MOBILE RISKS

Check:

- keyboard resizing behavior
- browser UI chrome
- PWA standalone mode

only where implementation depends on viewport height or fixed positioning.

---

# 121. PWA STANDALONE

If the application can be installed as a PWA, verify:

- safe areas
- display mode
- standalone navigation controls
- fixed UI

The responsive audit must include this display context.

---

# 122. PRINT

Only if the application is intended for printing, verify print stylesheet responsive behavior.

Otherwise:

**NOT APPLICABLE**

---

# 123. SCREENSHOT / VISUAL TESTS

If visual regression tests exist, check:

- which viewports are covered
- whether mobile screenshot tests are included
- whether only ideal breakpoint widths are checked

---

# 124. RESPONSIVE TEST COVERAGE

Map existing test coverage for:

- mobile nav
- dialogs
- tables
- forms
- orientation
- window resizing

Never assume CSS is defect-free merely because unit tests pass.

---

# 125. BROWSER TESTING

If you can run the application, test across multiple viewports.

Priority:

- critical user flows
- not random page samples

---

# 126. VIEWPORT TEST MATRIX

For key routes, produce a test matrix:

| Route | 320 | 375 | 430 | 768 | 1024 | 1440 | Result |
|---|---|---|---|---|---|---|---|

If a viewport was not tested at runtime:

**NOT VERIFIED**

---

# 127. ORIENTATION MATRIX

For mobile-critical views:

| Feature | Portrait | Landscape | Result |
|---|---|---|---|

---

# 128. INPUT MATRIX

Where relevant:

| Feature | Mouse | Keyboard | Touch | Result |
|---|---|---|---|---|

---

# 129. RESPONSIVE FINDING FORMAT

Every significant finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:
 
Route:
Viewport:
Orientation:
Input method:
 
Component:
File:
Relevant location:
 
Problem:
 
Evidence:
 
Reproduction:
 
Expected behavior:
 
Actual behavior:
 
User impact:
 
Root cause:
 
Recommended remediation:
 
Regression test:
 
Complexity:
XS / S / M / L / XL
```

---

# 130. SEVERITY

Use:

## P1 - HIGH

- critical action unreachable
- content or form completely unusable
- severe mobile-only functional failure
- large user cohort blocked

## P2 - MEDIUM

- significant responsive issue with an available workaround
- major overflow
- broken navigation
- severe legibility or interaction friction

## P3 - LOW

- localized layout anomaly
- minor clipping or truncation issue

## P4 - IMPROVEMENT

- UX enhancement that does not constitute a defect

Reserve P0 strictly for responsive flaws causing critical business or security incidents.

---

# 131. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

directly reproduced or irrefutably demonstrated via CSS layout rules.

MEDIUM:

code strongly indicates an issue, but browser runtime has not been verified.

LOW:

depends on browser- or device-specific behavior that has not been confirmed.

---

# 132. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 133. DO NOT MODIFY CODE

During the audit:

- do not modify CSS
- do not modify breakpoints
- do not redesign layouts
- do not introduce new UI libraries
- do not alter the navigation model

Complete the audit first.

---

# 134. OUTPUT - RESPONSIVE_MOBILE_AUDIT.md

Final audit report structure:

## 1. Executive Summary

- responsive strategy
- breakpoint system
- mobile readiness
- highest-risk issues

## 2. Breakpoint Map

## 3. Layout Architecture

## 4. Navigation Audit

## 5. Mobile Forms Audit

## 6. Tables & Data-Dense UI

## 7. Dialog / Modal / Drawer Audit

## 8. Typography & Content Audit

## 9. Media Audit

## 10. Touch Interaction Audit

## 11. Keyboard & Focus Interaction

## 12. Orientation Audit

## 13. Overflow Audit

## 14. Responsive State Audit

## 15. Mobile Performance Risks

## 16. Accessibility Reflow Findings

## 17. Findings Summary

| ID | Severity | Route | Viewport | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 18. Detailed Findings

## 19. Things Done Well

## 20. Missing Responsive Test Coverage

## 21. Unknown / Not Verified

## 22. Remediation Roadmap

---

# 135. SMALL SCREEN SECOND PASS

Following the initial audit, evaluate the application as if it existed solely on a phone screen with a width of approximately 320 px.

For every critical flow, ask:

- Can I find the action?
- Can I read the text?
- Can I complete the form?
- Can I close the modal?
- Can I scroll to reach the submit button?
- Does anything overflow horizontally?
- Does a fixed element obscure content?

---

# 136. TOUCH SECOND PASS

Assume the user has no mouse.

Check:

- hover-only controls
- undersized icons
- drag-only operations
- tooltip-only information
- chart hover interactions

---

# 137. KEYBOARD SECOND PASS

Assume the user operates exclusively via keyboard.

Hiding responsive elements must never leave active focus trapped in invisible UI.

---

# 138. LARGE TEXT SECOND PASS

Mentally scale up font sizes.

Ask:

> Which component breaks first when text occupies 50-100% more space?

Particularly inspect:

- buttons
- nav
- cards
- tabs
- dialogs

---

# 139. LONG CONTENT SECOND PASS

Replace ideal demo data with:

- long names
- long emails
- very long titles
- long filenames
- large numbers
- lengthy translated strings

Look for layouts that depend on artificially short demo text.

---

# 140. REAL USER PASS

For critical mobile flows, simulate:

```text
open app
↓
open menu
↓
find feature
↓
open form
↓
keyboard opens
↓
enter data
↓
validation error
↓
correct data
↓
submit
↓
loading
↓
success/error
↓
navigate back
```

Analyze the entire flow, not isolated screenshots.

---

# FINAL QUALITY GATE

Before returning your final response, verify:

- you did not report a visual styling variance as a functional bug
- every serious issue specifies a concrete viewport or condition
- you did not test only standard device sizes
- you tested intermediate widths
- horizontal overflow has an identified root cause
- touch interactions have been audited
- mobile keyboard behavior has been factored in
- modals and forms were examined as end-to-end flows
- desktop and mobile navigation maintain functional parity where appropriate
- dual desktop/mobile components are not concurrently mounted unintentionally
- SSR/hydration implications of JS breakpoint logic were evaluated
- accessibility and responsive issues are properly correlated where connected
- browser-specific bugs are not asserted as confirmed without evidence
- improvements are clearly distinguished from bugs

---

# FINAL RULE

I do not want generic reports like:

> The website should be further optimized for mobile devices using responsive breakpoints.

That is not a responsive audit.

For every real issue, provide a concrete failure path:

```text
viewport
↓
component
↓
layout rule
↓
failure
↓
user consequence
```

For example:

```text
375 px viewport
↓
filter toolbar has a min-width of 620 px
↓
parent container disallows wrapping
↓
page develops horizontal scroll
↓
primary action ends up offscreen
```

or:

```text
mobile form
↓
keyboard opens
↓
fixed footer stays above keyboard
↓
last input is obscured
↓
user cannot see what they are typing
```

The objective is not merely making a desktop design "fit" onto a phone.

The objective is to prove that the complete product remains fully functional across:

- small and large displays
- portrait and landscape
- touch and keyboard
- short and lengthy content
- multiple languages
- browser zoom
- virtual keyboards
- real user workflows

If an issue could not be verified at runtime:

**NOT VERIFIED.**

If it represents a potential layout risk:

**LIKELY or THEORETICAL**, according to evidence.

If it is merely an aesthetic enhancement:

**P4 - IMPROVEMENT.**

It is better to find 10 confirmed responsive issues than to produce 100 generic CSS recommendations.
