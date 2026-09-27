---
id: UPL-IT-003
number: 3
slug: react-bug-hunter
title: React Bug Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.0.0
status: stable
---

# REACT BUG HUNTER

I want you to perform a maximally deep, systematic, and evidence-first analysis of the React application with one primary objective:

> Uncover genuine bugs and potentially erroneous runtime behaviors in the React codebase.

This is not:

- a generic code review
- an architecture review of the whole system
- a styling review
- a list of React best practices
- an automated refactor
- a search for subjectively "cleaner" code

The focus is squarely on concrete issues that can cause:

- broken or inaccurate UI
- stale data
- lost user data
- corrupted state
- infinite render/effect loops
- race conditions
- memory leaks
- duplicate executions
- hydration errors
- broken post-navigation behavior
- async operation flaws
- UI and server-state desynchronization
- bugs that emerge only under specific sequences of user interactions

Priority:

**correctness > evidence > reproducibility > number of findings**

It is far better to report 10 confirmed React bugs than 100 generic suggestions.

---

# 1. FIRST DETERMINE THE REACT ENVIRONMENT

Before analyzing, determine:

- React version
- framework if applicable
- Next.js
- Remix
- Vite
- CRA
- React Router
- other framework/runtime
- TypeScript or JavaScript
- state management libraries
- server-state libraries
- form libraries
- routing solution
- test framework
- UI/component libraries

Specifically identify:

- React Strict Mode
- Server Components if present
- Client Components if present
- SSR
- CSR
- hydration
- Suspense
- transitions
- streaming
- concurrent features
- React Compiler if utilized
- framework-specific behaviors

Do not use obsolete React assumptions.

If a conclusion hinges on a specific React version, first confirm the exact semantics of that version.

---

# 2. MAP STATE BEFORE HUNTING FOR BUGS

For all primary features, map where state lives.

Map:

```text
Server state
↓
query/cache layer
↓
component props
↓
local state
↓
derived state
↓
rendered UI
```

Identify:

- local `useState`
- `useReducer`
- Context
- Zustand
- Redux
- TanStack Query
- SWR
- Apollo
- custom stores
- URL state
- form state
- localStorage
- sessionStorage
- cookies

For every piece of critical data ask:

> What is the true source of truth?

Specifically hunt for cases where identical data exists in multiple locations.

Example:

```text
server response
↓
query cache
↓
component state
↓
form state
```

When the same data is manually synchronized across multiple state layers, investigate potential drift.

---

# 3. STALE STATE

Actively hunt for stale state issues.

Scrutinize:

- callback functions
- timers
- subscriptions
- promises
- async functions
- event listeners
- WebSocket handlers
- observers
- debounced callbacks
- throttled callbacks

Example risky pattern:

```tsx
setTimeout(() => {
  doSomething(value)
}, 5000)
```

Verify whether `value` at the moment of execution reflects:

- current state
- or the captured value from when the callback was scheduled

Do not report a stale closure without a provable failure scenario.

---

# 4. FUNCTIONAL STATE UPDATES

Review state updates that depend on preceding state.

Look for patterns like:

```tsx
setCount(count + 1)
```

when multiple updates can occur:

- within the same event
- across async boundaries
- via concurrent operations
- under batching

Verify if the updater form should be used:

```tsx
setCount(prev => prev + 1)
```

Do not file an issue if the actual execution flow cannot produce an erroneous result.

---

# 5. DERIVED STATE DEFECTS

Look for values stored in state that can instead be derived from existing state or props.

Example:

```tsx
const [filteredUsers, setFilteredUsers] = useState([])
```

when there already exist:

```tsx
users
filter
```

Check:

- what triggers updates to derived state
- whether all input changes propagate an update
- whether it can become stale
- whether it resets at the wrong moment

Do not automatically flag all derived state.

A defect exists when duplicated sources of truth lead to state divergence.

---

# 6. useEffect FORENSICS

Locate all critical `useEffect` calls.

For each, determine:

- what the effect does
- what it reads
- what it mutates
- dependencies
- cleanup
- whether the effect is needed at all

Look for:

- missing dependencies
- excessive dependencies
- unstable dependencies
- effect loops
- stale closures
- duplicate executions
- race conditions
- missing cleanup
- state synchronization defects
- async resolutions resolving after unmount
- requests that no longer match current state

Do not blindly rely on the ESLint exhaustive-deps rule as proof.

Analyze runtime semantics.

---

# 7. EFFECT LOOP HUNTER

Search for patterns:

```tsx
useEffect(() => {
  setState(...)
}, [state])
```

and indirect cycles:

```text
effect A
↓
setState B
↓
render
↓
effect B
↓
setState A
```

Specifically check:

- object dependencies
- array dependencies
- inline function dependencies
- selectors returning fresh references
- recreated callbacks
- form watch values

If a loop only exists theoretically, label it accordingly.

---

# 8. MISSING CLEANUP

Review everything that registers or starts a long-lived resource.

Look for:

- `addEventListener`
- `setInterval`
- `setTimeout`
- subscriptions
- observers
- WebSocket
- BroadcastChannel
- custom event buses
- media query listeners
- geolocation watchers
- requestAnimationFrame
- web workers

Verify whether cleanup exists.

Example:

```tsx
useEffect(() => {
  window.addEventListener("resize", handler)

  return () => {
    window.removeEventListener("resize", handler)
  }
}, [])
```

Also check that the remove call uses the exact same function reference.

---

# 9. EVENT LISTENER DUPLICATION

Look for scenarios where re-rendering or remounting can attach duplicate listeners.

Analyze:

```text
mount
↓
register
↓
rerender/remount
↓
register again
↓
event fires
↓
handler runs multiple times
```

Check consequences:

- duplicate API calls
- duplicate analytics events
- duplicate navigations
- duplicate state mutations
- memory leaks

---

# 10. TIMER BUGS

Inspect:

- `setTimeout`
- `setInterval`
- debouncing
- throttling

Look for:

- un-cleared timers
- stale state captures
- multiple active timers
- timers executing post-navigation
- race with user interactions
- unexpected resets
- interval drift where relevant

Scrutinize components that mount and unmount frequently.

---

# 11. ASYNC RACE CONDITIONS

For every async flow check:

```text
request A starts
↓
state changes
↓
request B starts
↓
B finishes
↓
A finishes
↓
A overwrites B
```

Check this in:

- search
- autocomplete
- filters
- pagination
- navigation
- profile switching
- tab switching
- live validation
- fetching by ID

This is one of the most critical React bug patterns.

---

# 12. REQUEST CANCELLATION

When a user rapidly changes context, check what happens to the preceding request.

Example:

```text
/user/1
↓
fetch user 1
↓
navigate /user/2
↓
fetch user 2
↓
user 2 response arrives
↓
user 1 late response arrives
```

Verify whether:

- cancellation exists
- the library ignores stale requests
- request keys prevent overwriting
- the component verifies result relevance

Do not demand `AbortController` if the utilized library already handles this safely.

---

# 13. PROMISE ERROR HANDLING

Look for:

- missing `catch`
- unhandled rejections
- async handlers devoid of error handling
- loading states permanently stuck
- error states that never render
- optimistic states that never roll back

Trace the complete flow:

```text
user action
↓
async call
↓
success/failure
↓
state update
↓
UI render
```

---

# 14. DOUBLE SUBMIT

Review all critical forms and mutation triggers.

Ask:

> What happens if the user clicks the button twice in rapid succession?

Look for:

- two POST requests
- duplicate records created
- double billing
- duplicate messages
- duplicate navigations
- race between parallel responses

Check:

- pending states
- disabled states
- server idempotency
- mutation library behaviors

A client-side disabled button is no substitute for server-side idempotency in critical flows.

---

# 15. OPTIMISTIC UPDATE DEFECTS

If optimistic UI is used, trace:

```text
old state
↓
optimistic mutation
↓
server call
↓
success or failure
↓
cache/state reconciliation
```

Look for:

- missing rollback
- rollback to wrong state
- concurrent optimistic mutations
- server payload ignored
- duplicate items
- temporary ID reconciliation flaws
- item ordering errors

---

# 16. OUT-OF-ORDER MUTATIONS

Check the scenario:

```text
mutation A
mutation B
```

where both mutate the same resource.

If the server responds:

```text
B
A
```

can the UI end up displaying stale data?

Pay special attention to:

- autosave
- drag and drop
- settings
- inline editing
- status toggles

---

# 17. TANSTACK QUERY / SWR / SERVER STATE

If utilizing server-state libraries, check:

- query keys
- invalidation
- stale time
- cache time / gc time
- refetch triggers
- optimistic updates
- mutation callbacks
- placeholder data
- initial data
- pagination
- dependent queries

Look specifically for query-key collisions.

Example:

```tsx
["user"]
```

for multiple different users can cause cross-contamination if the ID is omitted from the key.

Only file an issue if the actual code allows invalid cache reuse.

---

# 18. CACHE INVALIDATION

For every mutation ask:

> What data became stale as a result of this operation?

Then check what the codebase actually invalidates.

Example:

```text
updateProject()
↓
project changed
↓
project detail invalidated
↓
project list NOT invalidated
```

Result:

one section of the UI displays the fresh value while another shows stale data.

---

# 19. PAGINATION DEFECTS

Review:

- page-based pagination
- cursor-based pagination
- infinite scroll

Look for:

- duplicate items
- skipped items
- wrong cursors
- stale page indices
- filter modifications without resetting current page
- total count discrepancies
- deletion of the last item on a page
- load-more concurrency races

---

# 20. FILTERING AND SORTING

Check interaction between:

- filters
- sorting
- pagination
- search
- server state

Scenario:

```text
page 10
↓
change filter
↓
new result set has only 2 pages
```

If page index remains 10, the user receives an empty screen despite valid results existing.

---

# 21. SEARCH AND AUTOCOMPLETE

Scrutinize:

- debouncing
- async races
- stale results
- loading indicators
- query clearing
- keyboard navigation
- response arrival order
- cache keys

---

# 22. PROP DRILLING DEFECTS

Prop drilling is not inherently a bug.

Only look for situations where a deep prop chain causes:

- stale values
- wrong parameter forwarding
- type mismatches
- optional fallbacks masking errors
- duplicated handler logic

---

# 23. CALLBACK IDENTITY

Analyze cases where callback referential identity affects behavior.

For instance:

- event subscriptions
- memoized child components
- effect dependencies
- third-party components
- observers

Do not report missing `useCallback` as a bug purely for performance optimization.

A concrete functional failure is required.

---

# 24. useMemo AND useCallback

Check:

- missing dependencies
- stale memoized values
- needless memoization that complicates correctness
- memoization masking mutable object mutations

Focus is not on micro-optimizations.

Focus is on broken behavior.

---

# 25. useRef DEFECTS

Look for:

- refs treated as stale source of truth
- refs used where state is needed for UI reactivity
- DOM ref accessed prior to mount
- unsafe null assumptions
- refs shared across mismatched lifecycles
- mutable refs violating state invariants

---

# 26. CONDITIONAL HOOKS

Search for violations of the Rules of Hooks.

Specifically:

```tsx
if (condition) {
  useEffect(...)
}
```

and custom hooks that conditionally invoke hooks internally.

Even if linter/build blocks it, report it as a compile/runtime blocker if present in active code.

---

# 27. CUSTOM HOOK FORENSICS

For important custom hooks, identify:

- inputs
- state
- effects
- cleanup
- returned API
- lifecycle assumptions

Verify that the custom hook does not hide:

- global singleton state
- duplicate listeners
- async race conditions
- timer leaks
- unexpected shared resources

---

# 28. CONTEXT DEFECTS

For each critical Context, check:

- default value
- provider placement
- nested providers
- provider remounting
- re-render propagation
- stale values
- missing provider handling

Specifically look for route changes that unmount/remount Providers, unintentionally resetting state.

---

# 29. CONTEXT DEFAULT VALUES

A risky pattern is:

```tsx
createContext({
  user: null,
  logout: () => {}
})
```

if a component can execute outside of the Provider and silently execute fallback dummy behaviors.

Check if this masks an integration bug.

---

# 30. PROVIDER REMOUNT DEFECTS

Trace Providers through the component tree.

Ask:

> Does a route change or key change remount the Provider?

If so, check whether that accidentally resets:

- shopping cart
- auth-derived UI
- drafts
- filters
- media player
- form data
- transient state

---

# 31. REDUX / ZUSTAND / GLOBAL STORES

If a global store is used, check:

- selectors
- subscriptions
- persistence
- resets
- logout cleanup
- user switching
- multi-tab behaviors

Look for:

- previous user data leaking
- global state never reset
- persisted sensitive data
- selectors returning invalid derived state

---

# 32. LOCALSTORAGE AND SESSIONSTORAGE

Review all storage accesses.

Check:

- SSR safety
- JSON parsing failures
- schema/version upgrades
- corrupted stored values
- quota exceeded errors
- sensitive data storage
- cross-tab synchronization
- stale state
- logout clearing

Example:

```tsx
JSON.parse(localStorage.getItem("x"))
```

can crash the application if stored data is corrupted or outdated.

---

# 33. HYDRATION MISMATCH

If SSR is used, actively hunt for server/client markup differences.

Specifically:

- `Date`
- `Math.random`
- locale formatting
- timezone differences
- browser-only APIs
- persisted storage hydration
- viewport-dependent rendering
- authentication state differences
- media queries
- dynamic IDs

Reconstruct:

```text
server HTML
vs
first client render
```

If not deterministically identical, verify actual framework handling.

---

# 34. DATE AND TIME DEFECTS

React UIs frequently conceal timezone bugs.

Look for:

- server local timezone
- browser local timezone
- UTC
- ISO strings
- date-only strings
- midnight boundary issues
- daylight saving time (DST)
- relative time calculations

Example:

```text
2026-09-25
```

does not necessarily equate to:

```text
2026-09-25T00:00:00Z
```

Verify the application's actual domain semantics.

---

# 35. RANDOM AND NON-DETERMINISTIC RENDERS

Look for:

- `Math.random()` called in render
- current timestamps in render
- uncontrolled ID generators
- unstable sorting algorithms
- mutable global state read during render

Especially critical in SSR/hydration environments.

---

# 36. KEYS IN LISTS

Do not report every array index key.

Analyze whether the list undergoes:

- reordering
- filtering
- sorting
- insertions
- deletions

If using array index as key, trace a concrete scenario where component state ends up tied to the wrong element.

Example:

```text
row A
row B
row C
```

deleting A can result in child component internal state shifting incorrectly onto B if keys are indices.

---

# 37. DIRECT STATE MUTATIONS

Look for:

```tsx
state.push(...)
state.x = ...
array.sort(...)
```

performed directly on state objects.

Check:

- whether references change
- whether React triggers a re-render
- whether shared data objects are mutated
- whether query/store cache records are contaminated

Do not report local copy mutations as state mutations.

---

# 38. ARRAY.sort BUGS

Pay special attention to:

```tsx
items.sort(...)
```

because `sort()` mutates the underlying array in-place.

If `items` originates from:

- props
- state
- cache
- global store

trace the side effects.

---

# 39. OBJECT AND ARRAY IDENTITY

Look for code that expects a stable reference while constantly generating a new one.

Example:

```tsx
const filters = { status }
```

used as an effect dependency.

Only file when there is a concrete behavioral consequence.

---

# 40. NULL AND UNDEFINED

Trace data flow from source to JSX.

Look for:

- async initial states
- optional API fields
- missing route params
- undefined lookup results
- deleted entities
- empty responses
- invalid persisted data

Especially:

```tsx
data.user.name
```

where `user` can realistically be null or undefined.

---

# 41. EMPTY STATE

For primary lists check:

- `[]`
- `null`
- loading
- error
- no-results
- filtered-empty

Look for cases where two distinct states share the exact same UI, confusing the user.

Example:

```text
loading finished
API request failed
```

yet the UI states:

```text
No items found.
```

This is a functional UX bug.

---

# 42. LOADING STATE

Check:

- loading never terminates
- loading disappears prematurely
- parallel requests sharing a single boolean flag
- request A finishes and resets `loading=false` while B is still in flight

Example:

```text
A starts
B starts
A finishes
loading = false
B still running
```

This is a very common concurrency bug.

---

# 43. BOOLEAN LOADING STATE FOR MULTIPLE OPERATIONS

Specifically locate:

```tsx
const [loading, setLoading] = useState(false)
```

if multiple independent async operations mutate this single flag.

Reconstruct the concurrent scenario.

---

# 44. ERROR STATE

Check:

- error banner remains after successful retry
- new request does not clear previous errors
- previous resource error displayed for new resource
- global error state overwriting unrelated feature errors

---

# 45. COMPONENT UNMOUNT DURING ASYNC OPERATIONS

Check what happens when:

```text
request starts
↓
component unmounts
↓
request finishes
```

Do not automatically claim every state update after unmount is a memory leak.

Analyze the React version and actual consequence.

The more significant issue is usually:

- stale side effects
- cache mutations
- erratic navigation
- unwanted notifications
- un-cleared resource leaks

---

# 46. ROUTING DEFECTS

If a router is present, check:

- route params
- search params
- navigation
- redirects
- Back/Forward buttons
- deep links
- direct URLs
- malformed URL state

Ask:

> Does the page function if the user does not arrive through the anticipated prior screen?

Never assume user flows only start via internal UI buttons.

---

# 47. URL AS STATE

When filters/tabs/pages/queries live in both URL and React state, determine the source of truth.

Look for:

```text
URL changes
↓
state does not update
```

or:

```text
state changes
↓
URL updates
↓
effect reads URL
↓
state updates again
```

---

# 48. BACK/FORWARD NAVIGATION

Mentally test:

- Back
- Forward
- browser refresh
- direct deep link
- duplicate tabs

Look for UIs that remain stale because they only expect navigation through in-app buttons.

---

# 49. FORM STATE

If using:

- React Hook Form
- Formik
- custom form state

check:

- default values
- reset triggers
- controlled vs uncontrolled
- async initial data
- validation
- dirty state tracking
- submission lifecycle
- server error mapping

---

# 50. ASYNC DEFAULT VALUES

Scenario:

```text
component mounts
↓
form initializes with empty defaults
↓
API returns user profile
↓
props change
```

Does the form actually receive the new values?

Many form libraries do not automatically re-initialize default values once mounted.

Check the library documentation and code implementation.

---

# 51. CONTROLLED VS UNCONTROLLED INPUT

Look for transitions:

```text
undefined
↓
"value"
```

or the reverse.

Check consequences:

- React warnings
- lost input keystrokes
- unexpected resets
- unpredictable form values

---

# 52. FORM VALIDATION MISMATCH

Compare:

```text
client validation
vs
server validation
```

The React frontend is never an authoritative security boundary.

However, a secure server can still cause functional UX bugs if client validation rules diverge from server expectations.

---

# 53. FILE INPUTS

Inspect:

- reset logic
- multi-file handling
- file size limits
- MIME type checking
- preview URL generation
- object URL cleanup
- upload progress
- cancellation

Specifically hunt for:

```tsx
URL.createObjectURL(...)
```

lacking:

```tsx
URL.revokeObjectURL(...)
```

which causes long-term memory leakage.

---

# 54. MODAL AND DIALOG STATE

Check:

- open/close behavior
- stale selected entities
- double modal rendering
- background scrolling/state
- focus restoration
- destructive confirmation dialogs

Scenario:

```text
open edit user A
close
open user B
```

Does the form actually display B or retained A state?

---

# 55. CONDITIONAL RENDERING BUGS

Look for:

```tsx
value && <Component />
```

when `value` can evaluate to `0`.

Example:

```tsx
{count && <Badge>{count}</Badge>}
```

which renders the literal character `0` or hides a valid zero quantity.

Analyze the exact context.

---

# 56. FALSY VALUE BUGS

Distinguish between:

- `0`
- `""`
- `false`
- `null`
- `undefined`

Look for incorrect fallback patterns:

```tsx
value || defaultValue
```

when `0` or `false` is a legitimate value.

In such cases:

```tsx
value ?? defaultValue
```

may be appropriate, provided domain logic confirms it.

---

# 57. NUMBER INPUT DEFECTS

Inspect:

- string vs number conversions
- empty inputs
- `Number("")` evaluating to 0
- `parseInt` radix omissions
- decimal handling
- locale decimal separators
- NaN propagation
- min/max constraints

Pay special attention to:

- currency
- quantities
- percentages
- age
- geographic coordinates

---

# 58. MONEY AND DECIMAL CALCULATIONS

Look for floating point inaccuracies:

```js
0.1 + 0.2
```

If the UI calculates:

- prices
- taxes
- discounts
- totals

verify whether client calculations match backend financial logic.

Never rely on frontend calculations as the financial source of truth.

---

# 59. DATE INPUTS

`<input type="date">` semantics often diverge from ISO timestamps.

Trace:

```text
input
↓
string
↓
Date parsing
↓
API
↓
DB
↓
response
↓
render
```

Look for timezone shifts moving dates forward or backward by one day.

---

# 60. SELECT AND MULTISELECT

Check:

- value types
- empty selection behavior
- controlled state synchronization
- stale options
- async options loading
- removed options handling
- duplicate values

---

# 61. COMPONENT REUSE DEFECTS

When a single component instance handles multiple resources, check what happens when props change without remounting.

Scenario:

```text
<Resource id=1>
↓
route changes
↓
<Resource id=2>
```

If the component instance is retained:

- does local state retain data from ID 1?
- do effects trigger on prop change?
- does query key incorporate the new ID?

---

# 62. `key` AS A RESET MECHANISM

If `key` is used to force-remount a component, check:

- is key stable
- what gets reset
- is user input lost
- does it re-run expensive initialization repeatedly

---

# 63. STRICT MODE

When Strict Mode is enabled in development, distinguish:

- intentional dev-only double invocations
- genuine production bugs

Strict Mode often reveals:

- missing cleanup
- non-idempotent effects
- mutations during render

Do not dismiss an issue merely because it surfaces visibly in development.

---

# 64. RENDER SIDE EFFECTS

Render functions must be pure.

Look in the render path for:

- state mutations
- storage writes
- API calls
- global variable mutations
- analytics events
- subscriptions
- programmatic navigation

If rendering is retried or repeated, the side effect will duplicate.

---

# 65. API CALLS IN RENDER

Report any component directly invoking an async or business mutation during render without framework-sanctioned mechanisms.

Trace how many times it can trigger.

---

# 66. GLOBAL MUTABLE STATE

Look for module-level variables:

```ts
let currentUser
let cache = {}
let selectedItem
```

If React components rely on them, check:

- missing re-renders
- SSR data leakage across requests
- multi-user contamination
- test isolation breakdowns
- stale state

---

# 67. MEMOIZED COMPONENTS

For `React.memo`, check:

- custom comparison functions
- ignored props
- unstable callbacks passed down
- nested mutable data

A flawed custom comparator can swallow valid, needed re-renders.

---

# 68. CUSTOM EQUALITY FUNCTIONS

If stores, queries, or components use custom equality checks, check if they can falsely evaluate two distinct states as identical.

---

# 69. SUSPENSE

If Suspense is present, check:

- fallback boundaries
- nested boundaries
- unexpected remounts
- loading waterfalls
- error handling
- state resets

Do not report standard Suspense mechanics as defects.

---

# 70. TRANSITIONS

If `startTransition` or related APIs are used, check:

- stale results
- pending state management
- races with urgent user updates
- incorrect assumption that transitions eliminate async race conditions

---

# 71. ERROR BOUNDARIES

Check:

- boundary scope
- recovery mechanisms
- reset behavior
- navigation interplay
- fallback UIs
- logging

Determine whether an error in an isolated component crashes a disproportionately large section of the application.

---

# 72. PORTALS

For modals, tooltips, and dropdowns rendered via portals, check:

- event bubbling
- cleanup on unmount
- z-index stacking
- focus management
- lifecycle alignment
- stale DOM target elements

---

# 73. THIRD-PARTY COMPONENTS

For complex external libraries, check assumptions at the boundary:

- controlled values
- event callbacks
- lifecycle quirks
- portal rendering
- async state
- serialization

Do not audit external library internals unless the defect arises from improper integration.

---

# 74. DRAG AND DROP

Check:

- stable item IDs
- reorder calculations
- optimistic UI state
- failed persistence handling
- concurrent updates
- stale index references

Never rely solely on array indices as permanent business identifiers.

---

# 75. VIRTUALIZED LISTS

If virtualization is used:

- stable item keys
- dynamic item heights
- stale measurement caches
- scroll restoration
- list filtering
- focus management
- selected rows

---

# 76. TABLES

Complex data tables combine:

- sorting
- filtering
- pagination
- selection
- inline editing
- virtualization

Track their intersections rather than testing each feature in complete isolation.

---

# 77. SELECTION STATE

Scenario:

```text
select row 5
↓
filter changes
↓
row 5 no longer visible
```

Does row 5 remain selected for destructive bulk actions?

Scrutinize bulk action handling.

---

# 78. DELETE FLOW

For deletions trace:

```text
click
↓
confirmation
↓
request
↓
server response
↓
cache update
↓
selection cleanup
↓
navigation
```

Look for:

- stale selected item state
- deleted item remaining in list view
- detail route remaining on deleted entity
- duplicate delete calls
- optimistic deletion without rollback

---

# 79. CREATE FLOW

Check:

- double submissions
- temporary client IDs
- server-generated ID replacement
- cache insertion
- navigation triggers
- form state resets

---

# 80. UPDATE FLOW

Check:

- stale form data
- conflicting concurrent writes
- cache invalidations
- partial updates
- accidental field overwrites
- server/client merge semantics

---

# 81. USER SWITCHING

If the app supports logout/login or profile switching:

```text
User A
↓
cache/store/localStorage
↓
logout
↓
User B logs in
```

Ensure User B cannot access:

- User A's data
- User A's cached responses
- User A's drafts
- User A's selected resources
- User A's notification state

This can also constitute a serious security finding.

---

# 82. MULTI-TAB BEHAVIOR

Evaluate behavior when the user opens the application across multiple browser tabs.

Scenario:

```text
Tab A logs out
Tab B remains open
```

or:

```text
Tab A edits a resource
Tab B displays stale state
```

Assess whether the application requires cross-tab synchronization.

Do not report if out of scope for the product.

---

# 83. NETWORK FAILURES

For critical interactions, test:

- offline state
- request timeouts
- connection resets
- server 500 responses
- malformed payloads

Does the UI:

- freeze in an indefinite loading state
- display false success
- lose user input
- offer a safe retry path

---

# 84. RETRY DEFECTS

If the client library automatically retries requests, check if the operation is safe to retry.

GET requests differ fundamentally from:

- record creation
- payment processing
- sending emails
- destructive mutations

Retrying write operations lacking idempotency can trigger duplicate side effects.

---

# 85. OFFLINE AND ONLINE EVENTS

If the application listens to network connectivity, check:

- false online reporting
- queued actions
- duplicate synchronization
- stale indicators
- reconnection race conditions

---

# 86. WEBSOCKET / REALTIME

If realtime functionality exists:

- subscription setup
- unsubscription / teardown
- reconnection handling
- duplicate subscriptions
- event ordering guarantees
- stale entity handling
- optimistic mutations colliding with incoming server events
- duplicate event handling

---

# 87. POLLING

If polling is used:

- cleanup on unmount
- visibility API integration
- duplicate polling instances
- overlapping requests
- exponential backoff
- stale closure captures
- background tab throttling

---

# 88. INTERVAL + ASYNC

Specifically check:

```text
interval runs every 5s
request takes 8s
```

Do requests begin overlapping?

This can trigger:

- race conditions
- server overload
- stale data overwrites

---

# 89. ACCESSIBILITY AS A FUNCTIONAL BUG

Do not perform a full accessibility audit unless requested.

However, report an accessibility issue when it directly breaks functionality.

For example:

- button inaccessible via keyboard
- modal traps keyboard focus indefinitely
- input lacks an accessible label
- user cannot trigger critical actions without a mouse

---

# 90. TOUCH AND MOBILE EVENTS

Check custom pointer/touch logic for:

- duplicate click/touch firing
- gesture collisions
- hover-only functionality
- scroll locking issues
- passive listener assumptions

---

# 91. MEMORY LEAK HUNTER

A memory leak finding must trace a concrete resource lifecycle.

Look for:

```text
create/register
↓
component lifecycle
↓
missing destroy/unregister
```

Resources:

- event listeners
- intervals
- observers
- sockets
- workers
- blob URLs
- media streams
- subscriptions
- third-party library instances

---

# 92. LARGE OBJECT RETENTION

Check closures that retain references to:

- huge response objects
- detached DOM nodes
- raw files
- images
- multimedia buffers

Do not declare a leak without a demonstrable retention lifecycle.

---

# 93. PERFORMANCE BUG VS PERFORMANCE IMPROVEMENT

Distinguish:

**BUG**

Example:

UI freezes for seconds due to synchronous heavy computation on the main thread.

**IMPROVEMENT**

Example:

component re-renders slightly more often than optimal, but with zero perceptible user impact.

Do not conflate these.

---

# 94. EXPENSIVE RENDERS

Identify:

- massive `.map` calls
- nested loops
- synchronous parsing
- in-render sorting
- filtering
- formatting
- calculations

running on every render cycle.

Estimate actual dataset sizes before assigning severity.

---

# 95. UNNECESSARY RE-RENDERS

Do not count re-renders as bugs in the absence of tangible consequences.

A finding requires at least one of:

- visible UI jank
- expensive render duration
- large expensive child component tree
- network or effect side effects triggered
- battery/device resource degradation

---

# 96. PRODUCTION VS DEVELOPMENT

Look for bugs masked by the development environment:

- Strict Mode behavior differences
- mocked APIs
- localhost zero-latency network
- tiny development datasets
- issues hidden prior to minification
- missing environment variables
- CDN caching discrepancies
- SSR differences

---

# 97. CROSS-FILE TRACE

For every serious bug, do not stop at the component.

Trace:

```text
UI
↓
hook
↓
store/query
↓
API client
↓
response
↓
cache
↓
component
```

Defects frequently originate at the interface between layers.

---

# 98. FALSE-POSITIVE PREVENTION

Before reporting a P0/P1/P2 defect, inspect:

1. the entire component
2. custom hooks
3. parent components
4. child components
5. store definitions
6. query layer
7. router configuration
8. API contracts
9. framework behavior
10. test suites

Never draw conclusions from an isolated code snippet.

---

# 99. REPRODUCTION SCENARIO

Every serious bug must provide a reproduction scenario.

Use the format:

```text
Initial state:

1.
2.
3.

Expected:

Actual:

Why it happens:
```

If you cannot construct a realistic reproduction, downgrade confidence.

---

# 100. SEVERITY

Use:

## P0 - CRITICAL

- security compromise
- severe data loss
- catastrophic application breakdown

## P1 - HIGH

- critical user flow broken
- severe data corruption
- major race condition
- major production outage

## P2 - MEDIUM

- genuine functional bug with bounded impact

## P3 - LOW

- edge-case bug
- minor functional inconsistency

## P4 - IMPROVEMENT

- maintainability or performance enhancement that is not a bug

---

# 101. CONFIDENCE

For each finding use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

directly proven by execution flow, test, or clear code semantics.

MEDIUM:

strong evidence from code, but lacking live runtime validation.

LOW:

scenario relies on information or runtime conditions not fully verifiable.

---

# 102. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

Never label a THEORETICAL finding as a confirmed defect.

---

# 103. FINDING FORMAT

For every significant finding use:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Component:
File:
Hook/Function:
Relevant location:

Problem:

Evidence:

State/Data Flow:

Reproduction:

Expected behavior:

Actual behavior:

Impact:

Root cause:

Recommended fix:

Regression test:

Complexity:
XS / S / M / L / XL
```

---

# 104. TESTS

Review existing React tests.

Look for:

- happy-path-only tests
- missing interaction tests
- missing async race condition tests
- excessive mocking
- testing internal implementation details
- tests failing to await async updates properly
- fake timers misuse
- flaky tests
- snapshot-only coverage

Ask:

> Which bugs currently existing in the code pass through the test suite unnoticed?

This is far more telling than test quantity.

---

# 105. GENERATE A REGRESSION TEST FOR EVERY SERIOUS BUG

For every P0/P1/P2 finding, propose a test that:

1. fails on the current implementation
2. passes once fixed
3. directly targets and reproduces the root cause

Do not provide generic "add a test" advice.

---

# 106. DO NOT MODIFY CODE

During this audit:

- do not edit source files
- do not refactor
- do not open PRs
- do not update dependencies
- do not "fix as you go"

Complete the bug audit first.

---

# 107. OUTPUT - REACT_BUG_AUDIT.md

Structure the final output as:

## 1. Executive Summary

Detail:

- React version
- framework
- state architecture
- server-state layer
- count of confirmed bugs by severity
- most dangerous bug patterns identified

## 2. State Architecture

Explain the source-of-truth model.

## 3. Critical UI Flows

Flows audited end-to-end.

## 4. Findings Summary

| ID | Severity | Category | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 5. P0 Findings

## 6. P1 Findings

## 7. P2 Findings

## 8. P3 Findings

## 9. P4 Improvements

## 10. State & Derived State Findings

## 11. useEffect Findings

## 12. Async & Race Condition Findings

## 13. Server-State / Cache Findings

## 14. Form Findings

## 15. Routing Findings

## 16. Hydration / SSR Findings

## 17. Resource & Memory Findings

## 18. Concurrency Findings

## 19. Error Handling Findings

## 20. Existing Test Weaknesses

## 21. Missing Regression Tests

## 22. Things Done Well

Document properly implemented patterns that should be preserved.

## 23. Unknown / Not Verified

Clearly identify what could not be definitively verified.

---

# 108. BUG PATTERN MATRIX

Provide an overview:

| Pattern | Checked | Findings | Highest severity |
|---|---|---|---|
| Stale closures | | | |
| Effect loops | | | |
| Missing cleanup | | | |
| Async races | | | |
| Double submit | | | |
| Cache invalidation | | | |
| Derived state drift | | | |
| Hydration | | | |
| Form state | | | |
| Routing | | | |
| Memory/resource leaks | | | |
| User switching | | | |
| Pagination | | | |
| Date/time | | | |

Do not populate findings if nothing genuine was uncovered.

---

# 109. FINAL SECOND PASS

Once the initial audit is complete, perform a fresh pass strictly from the lens of user actions.

For every critical feature mentally execute:

### Fast user pass

What if the user:

- clicks twice rapidly
- switches filters very fast
- rapidly switches tabs
- navigates back and forth between resources

### Slow network pass

What if a request takes 10 seconds?

### Out-of-order pass

What if responses arrive in reverse order?

### Failure pass

What if the first request succeeds but the second fails?

### Navigation pass

What if the user navigates away while an operation is ongoing?

### Back/Forward pass

What if the user relies on browser history?

### Refresh pass

What if the user refreshes mid-flow?

### Multi-tab pass

What if the user uses the application simultaneously across two tabs?

### Empty-data pass

What if there are zero records?

### Huge-data pass

What if a list contains 10, 1,000, or 100,000 items?

Identify algorithmic and rendering bottlenecks without fabricating benchmark figures.

---

# 110. FINAL ADVERSARIAL STATE PASS

For every critical state ask:

> How can this state become inaccurate?

Then check:

- who updates it
- who resets it
- who can overwrite it
- how many async operations touch it
- what happens on remount
- what happens on logout
- what happens on navigation
- what happens on failure

For every critical query/cache entry ask:

> Who invalidates it?

For every effect ask:

> Why does this effect exist and when does it become invalid?

For every async callback ask:

> Does the result still belong to the current UI state when it arrives?

For every form ask:

> Can the user lose data or submit duplicate operations?

---

# 111. FINAL QUALITY GATE

Before returning your answer, verify:

- no serious bug relies merely on generic pattern matching
- every P0/P1/P2 has an execution flow
- every race condition defines a concrete event timeline
- stale closure findings prove the callback genuinely captures stale data
- array index keys are only flagged with a realistic reorder/filter/delete scenario
- missing `useMemo` or `useCallback` is not reported as a bug without proven harm
- missing cleanups are not branded memory leaks without resource lifecycle evidence
- framework-specific behavior is verified
- Strict Mode development artifacts are not confused with production bugs
- passing tests are not accepted as proof of correctness without inspection
- identical root causes are not duplicated across multiple findings
- bugs and improvements are strictly segregated
- every recommended fix addresses the root cause
- every serious bug includes a regression test proposal

---

# FINAL RULE

Do not return a report like:

> Use useMemo, useCallback, and add dependencies to useEffect.

That is not React bug hunting.

I want you to track the real-world behavior of the application across time.

A React bug rarely exists in an isolated line of code.

It typically manifests like this:

```text
render 1
↓
effect starts request A
↓
user changes state
↓
render 2
↓
request B starts
↓
B finishes
↓
UI becomes correct
↓
A finishes
↓
stale response overwrites UI
```

or:

```text
component mounts
↓
listener registered
↓
component remounts
↓
second listener registered
↓
single event fires
↓
business action runs twice
```

or:

```text
server data
↓
copied into local state
↓
server data changes
↓
local copy does not
↓
UI displays stale information
```

Search precisely for problems of this nature.

Think in terms of:

- time
- event ordering
- lifecycle
- state ownership
- concurrency
- async operations
- source of truth

Do not evaluate React code based on how aesthetically pleasing it appears.

Evaluate it based on:

> Does it produce the exact expected state across all realistic sequences of user and system events?

If there is insufficient evidence for a finding:

**NOT VERIFIED.**

If something is merely an optimization:

**P4 - IMPROVEMENT.**

If it is a genuine bug:

prove it through an execution flow.

The goal is a forensically precise React bug audit that transitions directly into:

- reproduction
- fix
- regression test
- fix verification
