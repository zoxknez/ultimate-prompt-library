---
id: UPL-IT-019
number: 19
slug: android-tv-application-audit
title: Android TV Application Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Mobile Development
subcategory_id: mobile-development
language: en
version: 1.0.0
status: stable
---

# ANDROID TV APPLICATION AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the complete Android TV application.

Main objective:

> Determine whether the application is genuinely, reliably usable on a television via a remote control without touch or mouse assumptions, with stable focus management, correct D-pad directional navigation, resilient Live TV and media playback flows, robust performance on resource-constrained TV hardware, and predictable behavior across lifecycle changes, Picture-in-Picture (PiP), Electronic Program Guide (EPG), playback, recording, timeshifting, multiview, and other TV-specific features if present.

This is not:

- a standard Android mobile app audit
- a mobile phone UI review blown up onto a large screen
- merely checking whether the APK installs and boots on Android TV
- a generic Leanback library checklist
- a recommendation to simply "enlarge the buttons"
- automatically sprinkling focus modifiers across components
- an assumption that any screen is acceptable if it functions with a mouse pointer
- a shallow inspection of ExoPlayer
- randomly rearranging D-pad spatial navigation

The focus is on the real-world operational TV experience:

```text
remote input
↓
focus movement
↓
screen state
↓
content selection
↓
playback
↓
overlay / EPG / controls
↓
Back / Home / PiP / resume
```

Priority hierarchy:

**focus correctness > playback continuity > remote usability > lifecycle reliability > data correctness > TV performance > visual polish**

Finding 6 genuine D-pad, focus, and playback defects is infinitely more valuable than writing 100 generic TV UI recommendations.

---

# 1. IDENTIFY THE TV TECHNOLOGY STACK

Before formulating findings, establish:

- Android Gradle Plugin version
- Kotlin version
- minSdk
- targetSdk
- Compose for TV vs standard Jetpack Compose
- Leanback library presence and usage
- RecyclerView-based TV UI architectures
- Navigation framework
- Media3 / ExoPlayer
- MediaSession integration
- Picture-in-Picture (PiP) implementation
- Live TV playback architecture
- EPG (Electronic Program Guide) data and UI layers
- Cloud / local recording features
- Timeshift and rolling DVR buffers
- Multiview / split-screen playback
- Google Cast receiver integration
- DRM (Widevine, ClearKey)
- Room database
- WorkManager background jobs
- Remote control and physical key event handling
- Focus management system
- Image loading engine (Coil, Glide)
- Analytics and crash reporting tools

Never evaluate a TV app through mobile phone assumptions.

---

# 2. IDENTIFY TARGET TV HARDWARE AND PLATFORMS

Map target environments:

```text
Android TV
Google TV
Operator set-top boxes (STB)
Retail TV streaming sticks / boxes
Generic AOSP TV builds
```

If the project targets specific operator hardware, document:

- Native screen resolution (720p, 1080p, 4K)
- Display aspect ratios
- Hardware performance tiers (CPU, GPU, RAM)
- Remote control layout and available keys
- Android OS versions

If not explicitly defined:

**TARGET DEVICE MATRIX: NOT DEFINED**

---

# 3. TV MANIFEST AUDIT

Inspect `AndroidManifest.xml`:

- Standard launcher category
- Leanback launcher category (`android.intent.category.LEANBACK_LAUNCHER`)
- Touchscreen hardware requirements (`android.hardware.touchscreen` marked `required="false"`)
- TV home screen banner asset declarations
- Screen orientation locking (`landscape`)
- TV-specific hardware feature flags (`android.software.leanback`)
- Picture-in-Picture declarations (`android:supportsPictureInPicture="true"`)
- Exported components and intent filter security

Verify that the application properly registers, displays, and launches within Android TV leanback environments.

---

# 4. TOUCHSCREEN HARDWARE DECLARATION

An Android TV app must never inadvertently declare a mandatory touchscreen requirement in its manifest:

```xml
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />
```

Verify that absence of touchscreen hardware does not block Play Store distribution for TV devices.

---

# 5. TV HOME BANNER

If target TV launchers require a TV banner asset:

- Verify presence in `res/drawable`
- Verify compliant dimensions (320x180 px or 16:9 ratio)
- Verify legible branding at a distance

Do not elevate cosmetic banner omissions to critical runtime defects.

---

# 6. D-PAD FIRST PRINCIPLE

For every critical screen and user flow, ask:

> Can the complete end-to-end flow be executed strictly using the remote control D-pad and center button?

Without requiring:

- Mouse pointer simulation
- Touchscreen input
- Hardware or software keyboard text entry where avoidable

---

# 7. REMOTE INPUT HARDWARE INVENTORY

Map supported physical remote buttons:

- D-pad Up
- D-pad Down
- D-pad Left
- D-pad Right
- D-pad Center / Select / Enter
- Back
- Play / Pause
- Skip Next
- Skip Previous
- Rewind
- Fast Forward
- Menu / Options
- Numeric keypad (0-9) if present on target remotes

Do not demand support for buttons that the target remote control hardware does not possess.

---

# 8. FOCUS MAP

Construct a formal spatial focus map for every critical screen.

Example:

```text
Sidebar Navigation
↓
Content Category Row
↓
Content Card
↓
Program Details View
↓
Action Buttons (Play, Details, Favorite)
```

Document the intended spatial transitions across all four directions.

---

# 9. FOCUSABLE COMPONENT INVENTORY

Catalog all interactive on-screen elements:

- Media cards
- Action buttons
- Navigation tabs and rail items
- Horizontal rows
- Filter chips
- Search input fields
- Video player control overlays
- EPG grid cells
- Modal dialogs and alert buttons

Ask:

> Does every interactive element receive focus when navigated to via D-pad?

---

# 10. NON-FOCUSABLE INTERACTIVE ELEMENTS

Critical usability defect:

A UI element visually implies clickability, but cannot receive D-pad focus, rendering it completely unreachable to remote control users.

---

# 11. FOCUS TRAP HAZARDS

Scenario:

```text
user moves D-pad focus into a nested component
↓
D-pad directional movements cannot escape back to parent hierarchy
```

Actively test for and eliminate directional focus traps.

---

# 12. FOCUS LOSS AND DISAPPEARANCE

Scenario:

```text
background data refresh arrives
↓
currently focused item is recomposed or replaced
↓
focus state drops to null
```

The user is left with no visual focus indicator on screen and cannot navigate.

---

# 13. FOCUS JUMPING ANOMALIES

Focus must never jump unexpectedly to:

- The top-left first item
- The sidebar navigation rail
- A completely random row

following routine background data refreshes or list mutations.

---

# 14. FOCUS RESTORATION ACROSS NAVIGATION

For forward and back transitions:

```text
Content List
↓
select item and navigate to Detail Screen
↓
press Back
```

Verify that focus returns precisely to the previously selected item rather than resetting to the beginning of the list.

---

# 15. FOCUS RESTORATION POST-FULLSCREEN PLAYBACK

Scenario:

```text
channel or card selected from catalog
↓
fullscreen video player opens
↓
user presses Back to return to catalog
```

Focus must restore meaningfully to the originating card or channel row.

---

# 16. FOCUS MANAGEMENT IN MODAL DIALOGS

Modal dialog lifecycle:

```text
screen element A has focus
↓
modal dialog opens
↓
focus moves immediately inside the dialog to default action
↓
dialog dismissed
↓
focus returns cleanly to element A
```

Failure to restore focus leaves the user stranded on an inactive screen.

---

# 17. FOCUS MANAGEMENT OVER ON-SCREEN OVERLAYS

Apply the same rigor to:

- EPG timeline overlays
- Video player control bars
- Audio and subtitle track selection menus
- Settings slide-out drawers

---

# 18. FOCUS PERSISTENCE THROUGH DATA REFRESHES

When an underlying list refreshes:

- The previously focused item still exists in the dataset
- The entity possesses a stable ID

Verify that focus remains bound to the identical logical item regardless of index shifts.

---

# 19. STABLE IDENTITY IN FOCUS RETENTION

Focus restoration must be anchored to a stable, unique item identity, never to a transient list position index.

---

# 20. INDEX-BASED FOCUS DRIFT

Scenario:

```text
user focuses item at list index 5
↓
new item inserted at top of list (index 0)
↓
system preserves focus purely by numeric index 5
↓
focus now unexpectedly points to a different program
```

Audit for index-based focus retention defects.

---

# 21. COMPOSE FOR TV FOCUS ARCHITECTURE

When using Jetpack Compose, inspect:

- `Modifier.focusable()`
- `FocusRequester`
- `Modifier.focusRequester()`
- `Modifier.focusProperties()`
- `Modifier.onFocusChanged()`
- `FocusManager` interactions

---

# 22. FOCUSREQUESTER LIFECYCLE CONTRACTS

Verify that `focusRequester.requestFocus()` is never invoked:

- Before the target node has entered the composition layout pass
- After the target composable has left the composition

---

# 23. REPEATED FOCUS FIGHTS IN EFFECTS

A `LaunchedEffect` that repeatedly requests focus will fight directly against the user's manual navigation:

Scenario:

```text
user presses D-pad Right
↓
reactive effect triggers on state change
↓
requestFocus() forcibly pulls focus back to Left
```

---

# 24. FOCUSPROPERTIES DIRECTIONAL GRAPH

When explicitly overriding directional navigation via `focusProperties`:

Verify that the navigation graph contains no:

- Infinite circular loops
- Unreachable dead ends
- Invalid or unmounted component references

---

# 25. MANUAL KEY EVENT CONSUMPTION

When intercepting physical D-pad events via:

- `Modifier.onKeyEvent()`
- `Modifier.onPreviewKeyEvent()`
- `Activity.dispatchKeyEvent()`

Ensure custom logic does not swallow or duplicate native framework focus navigation.

---

# 26. KEY EVENT CONSUMPTION TRAPS

Returning `true` from a key event handler marks the event consumed.

Verify that global key handlers do not accidentally starve nested child controls of directional inputs.

---

# 27. KEY DOWN VS KEY UP DUPLICATION

A single remote button press emits both `ACTION_DOWN` and `ACTION_UP` events.

If a business action triggers on both events:

The action will execute twice per physical press.

---

# 28. KEY REPEAT HANDLING

Holding down a physical D-pad directional button emits repeated `ACTION_DOWN` events with a repeat counter.

Verify:

- High-speed list navigation responsiveness
- Prevention of accidental multiple purchases or destructive actions
- Smooth scrolling without input backlog stalls

---

# 29. D-PAD CENTER BUTTON ACTIVATION

Selection actions triggered by `KEYCODE_DPAD_CENTER` or `KEYCODE_ENTER` must execute exactly once per intentional button press.

---

# 30. MEDIA HARDWARE BUTTON INTEGRATION

If the remote includes dedicated Play, Pause, Rewind, or Fast-Forward buttons:

Verify that they control the canonical playback state identically to on-screen overlay buttons.

---

# 31. BACK BUTTON HIERARCHY

Back button semantics on Android TV must be strictly predictable.

Map the precedence stack:

```text
Player control overlay visible
↓
Back dismisses overlay (playback continues)

Fullscreen playback active without overlay
↓
Back exits playback and returns to previous catalog screen

Main root screen
↓
Back shows exit confirmation or follows product navigation policy
```

---

# 32. NON-DETERMINISTIC BACK NAVIGATION

Search for screens where pressing Back:

- Sometimes dismisses an overlay
- Sometimes immediately kills the application
- Sometimes jumps to an unrelated route

without a deterministic state machine governing transitions.

---

# 33. DOUBLE BACK PRESS DEBOUNCING

Rapid repeated Back button presses can pop multiple destinations off the navigation backstack simultaneously.

Verify debouncing and route guards.

---

# 34. NAVIGATION ARCHITECTURE MAP

Map the complete screen graph:

- Home screen
- Category browse
- Search interface
- Content detail screen
- Live TV player
- Electronic Program Guide (EPG)
- Settings menu
- Video on Demand (VOD) player

Verify bidirectional focus continuity across every transition edge.

---

# 35. SIDEBAR NAVIGATION RAIL

Where a persistent TV navigation rail exists:

- D-pad entry from content into sidebar
- D-pad exit from sidebar into content grid
- Visual selected state vs active focused state
- Expanded vs collapsed animation performance
- Back button behavior while inside sidebar

---

# 36. SIDEBAR FOCUS MEMORY

When navigating into the sidebar, moving down, exiting into content, and re-entering:

Does focus land on the currently active category item, or reset to the top?

Define and enforce consistent behavior.

---

# 37. TOP NAVIGATION BARS

Apply identical focus memory and navigation rules to horizontal top tab bars.

---

# 38. ROW-BASED CONTENT PRESENTATION

Standard TV leanback catalog layout:

```text
Vertical list of horizontal rows
↓
Horizontal row containing media cards
```

Verify:

- Horizontal scrolling within row
- Vertical jumping between rows
- Remembering horizontal position per row

---

# 39. PER-ROW HORIZONTAL FOCUS MEMORY

Scenario:

```text
user scrolls Row 1 to Card 8
↓
presses Down to Row 2
↓
presses Up back to Row 1
```

Does focus restore to Card 8, or snap back to Card 1?

Preserving per-row position is standard TV UX.

---

# 40. VIRTUALIZED ROWS AND FOCUS RESTORATION

Lazy layouts unmount rows scrolled out of the active viewport.

Verify that off-screen rows restore their previous horizontal focus index when scrolled back into view.

---

# 41. AUTOMATIC SCROLL ALIGNMENT

The focused element must always remain fully visible within the TV viewport.

Verify that programmatic scrolling:

- Centers or aligns the focused item cleanly
- Avoids jerky, abrupt visual snaps
- Avoids infinite scroll oscillations

---

# 42. SCROLL ANIMATION AND FOCUS RACE CONDITIONS

Scenario:

```text
user holds D-pad Right
↓
focus transitions across cards rapidly
↓
scroll animation continues running asynchronously
```

Verify that final scroll offset matches the final focused card.

---

# 43. RAPID D-PAD TRAVERSAL STABILITY

Simulate rapid input bursts:

```text
D-pad Right pressed 20 times in 2 seconds
```

Audit for:

- Visual focus drop or lag
- Event queue backpressure stalls
- Inadvertent action triggering
- Frame drops and jank

---

# 44. FOCUS VISIBILITY AND CONTRAST

The currently focused item must be unambiguously identifiable from 10 feet away.

Inspect visual focus treatments:

- Scale transformation (e.g., 1.05x or 1.1x)
- High-contrast border stroke
- Outer glow / shadow elevation
- Color tinting
- Supporting card detail expansion

Never rely on subtle color shifts alone; they wash out on cheap TV panels.

---

# 45. FOCUS SCALE AND NEIGHBOR OVERLAYS

When a card scales up on focus:

Verify that it:

- Does not awkwardly overlap or clip neighboring card text
- Does not trigger parent layout reflows that push adjacent items
- Stays within its visual layer

---

# 46. PARENT CLIPPING RESTRICTIONS

Scale animations inside parents with `clipChildren="true"` or `Modifier.clip()` will crop focus borders and shadows.

Verify parent clipping flags.

---

# 47. Z-INDEX ELEVATION ON FOCUS

The currently focused and scaled card must render above adjacent un-focused cards in the visual Z-order.

---

# 48. FOCUS ANIMATION DURATION

Focus feedback animations must be snappy (typically 150-250ms).

Overly long animations make D-pad navigation feel sluggish and sticky.

---

# 49. REMOTE INPUT LATENCY

The delay between physical remote button click and on-screen visual focus shift must be minimal.

If not empirically profiled:

**REMOTE INPUT LATENCY: NOT MEASURED**

---

# 50. TV HARDWARE PERFORMANCE CONSTRAINTS

TV chipsets frequently feature:

- Low-power quad-core ARM CPUs
- Limited GPU fill-rates
- 1.5 GB to 2 GB total system RAM
- Slow eMMC flash storage

Never benchmark TV performance exclusively on high-end mobile phones or desktop emulators.

---

# 51. LARGE HERO BACKDROP IMAGES

Full-screen 1080p or 4K background images cause:

- Severe memory pressure
- Decoding latency on Main thread
- UI stutter and jank

Verify exact image decode dimensions.

---

# 52. ROW IMAGE LOADING PIPELINE

Rapid horizontal navigation dispatches dozens of image requests per second.

Verify:

- Bitmap memory caching
- Cancellation of out-of-viewport requests
- Fast placeholder rendering
- Downsampling to exact container dimensions

---

# 53. REDUNDANT FOCUS-DRIVEN IMAGE REQUESTS

Never trigger a brand-new network image request every time an item gains focus if the asset is already cached in memory.

---

# 54. BACKDROP IMAGE REPLACEMENT RACES

When changing focus triggers an update to the global screen backdrop:

Inspect for asynchronous out-of-order response races.

---

# 55. BACKDROP ASYNC RACE HAZARD

Scenario:

```text
focus on Card A
↓
backdrop request for A initiated
↓
user moves focus to Card B
↓
backdrop request for B loads and renders
↓
request for A finishes late
↓
background switches back to Card A
```

The screen backdrop no longer corresponds to the focused item.

---

# 56. DEBOUNCING FOCUS-DRIVEN ASYNC OPERATIONS

When focus changes trigger expensive operations:

- Detail API fetches
- Live EPG program lookups
- High-resolution backdrop downloads
- Video preview autoplay

Verify that requests are properly debounced (e.g., 200-400ms) or cancelled upon subsequent focus shifts.

---

# 57. VIDEO PREVIEW AUTOPLAY INTEGRATION

If focusing an item plays a short video preview:

- Debounce playback initiation
- Cancel playback immediately on focus loss
- Mute audio by default or respect user settings
- Release video decoders promptly

---

# 58. MULTIPLE PREVIEW INSTANCE LEAKS

Rapid focus movements across cards with preview autoplay must never instantiate multiple concurrent player instances or exhaust hardware decoders.

---

# 59. TV PLAYER OWNERSHIP ARCHITECTURE

For the primary media player, identify:

- Hosting Activity / Fragment
- Background playback Service
- MediaSession attachment

Ensure the player lifecycle reflects TV viewing expectations (e.g., stopping playback when entering deep settings menus).

---

# 60. LIVE TV STREAMING FLOW

For Live TV functionality, trace:

```text
Channel list / EPG grid
↓
select channel
↓
resolve streaming URL / manifest
↓
prepare ExoPlayer / Media3
↓
render audio and video streams
```

---

# 61. CHANNEL ZAPPING CONCURRENCY

Channel zapping is the core operational flow of Live TV.

Simulate:

```text
Channel A selected
↓
Channel B selected
↓
Channel C selected
↓
Channel D selected
```

in rapid succession.

The final active stream must strictly be Channel D.

---

# 62. STALE CHANNEL RESOLUTION OVERWRITE

Delayed asynchronous URL resolution for Channel A or B must never overwrite the active player after Channel D has been selected.

---

# 63. CHANNEL LIST BOUNDARY GUARDS

When navigating channels sequentially:

- First channel behavior (stop or wrap)
- Last channel behavior (stop or wrap)
- Empty channel list handling
- Filtered category boundaries
- Dynamic channel removal handling

---

# 64. CHANNEL WRAP-AROUND POLICIES

If channel list navigation wraps from last to first:

Document explicit behavior.

If wrap-around is disabled:

Prevent out-of-bounds index exceptions.

---

# 65. DYNAMIC CHANNEL LIST REFRESH DURING ZAPPING

If a background provider sync updates the channel list while the user is actively zapping, verify that channel identity is preserved.

---

# 66. CHANNEL IDENTITY: ID VS INDEX

The active playback channel must be tracked by its permanent, unique logical channel ID, never by transient list index.

---

# 67. NUMERIC KEYPAD CHANNEL SELECTION

If supporting direct numeric channel entry (e.g., typing "1", "0", "5"):

- Multi-digit entry timeout window (typically 2-3 seconds)
- Validation against available channel numbers
- Leading zero handling ("05" vs "5")
- Duplicate channel number conflict resolution

---

# 68. PREVIOUS CHANNEL RECALL ("LAST CHANNEL")

If supporting a "Recall" or "Last Channel" remote button:

Verify that rapid zapping does not corrupt the tracking of the previous channel versus the active channel.

---

# 69. RECENT CHANNEL HISTORY BOUNDS

Cap recent channel history queues to prevent unbounded memory growth.

---

# 70. LIVE STREAM PLAYBACK FAILURES

When a live channel fails to load or drops connection:

- Render clear error messaging
- Provide manual retry action
- Allow easy zap to next channel
- Allow clean exit back to channel list

Never trap the user on an unresponsive black screen.

---

# 71. LIVE BUFFERING ACCESSIBILITY

When a live stream enters buffering, ensure the buffering indicator and control overlays remain accessible via remote control.

---

# 72. AUDIO-FIRST PLAYBACK TIMING

On TV streams, audio decoders often initialize before the first video frame.

Ensure the UI does not treat initial video delay as a playback error.

---

# 73. BLACK SCREEN WITH ACTIVE AUDIO

If video decoding fails while audio continues playing:

Verify that codec errors are caught and surfaced rather than leaving the user in an ambiguous state.

---

# 74. ELECTRONIC PROGRAM GUIDE (EPG) ARCHITECTURE

The EPG is a complex, high-density TV-specific interaction model.

Audit its data flow, rendering performance, and directional navigation.

---

# 75. EPG DATA MODEL SCHEMA

Inspect the EPG hierarchy:

```text
Channel Entity
↓
Program Events List
↓
Start Time / End Time (UTC)
↓
Program Metadata (Title, Description, Genre, Rating)
```

---

# 76. EPG TIMEZONE AND LOCALIZATION

Verify:

- Server source timestamps (UTC)
- Local device timezone translation
- Daylight Saving Time (DST) transitions
- Formatting against 12-hour vs 24-hour user preferences

Incorrect offsets shift the entire visual program grid.

---

# 77. DAYLIGHT SAVING TIME (DST) BOUNDARIES

Test EPG behavior across DST transition days:

- Repeated hour handling in autumn
- Skipped hour handling in spring
- Grid cell width and position calculations

---

# 78. EPG PROGRAM TIME BOUNDS VALIDATION

Assert that every program event satisfies:

```text
startTime < endTime
```

Verify defensive fallbacks for corrupt or inverted provider data.

---

# 79. OVERLAPPING PROGRAM EVENTS

If a provider delivers overlapping programs on the same channel:

The UI grid must resolve overlaps without crashing or corrupting spatial navigation.

---

# 80. GAPS IN PROGRAM DATA

When gaps occur where no program data exists:

Render accessible placeholder cells ("No Information Available") that maintain D-pad navigation continuity.

---

# 81. ABNORMALLY LONG PROGRAM EVENTS

Multi-day or 24-hour continuous broadcast events must not generate extreme layout widths that crash rendering pipelines.

---

# 82. VERY SHORT PROGRAM EVENTS

Micro-programs (1 to 5 minutes duration) must remain focusable or provide a magnified inspection mode.

---

# 83. CURRENT PROGRAM SELECTION LOGIC

Enforce precise boundary semantics:

```text
startTime <= currentTime < endTime
```

Prevent double-highlighting at the exact millisecond of transition.

---

# 84. REALTIME EPG "NOW" INDICATOR LINE

If an on-screen vertical line marks the current live time:

Ensure its periodic update does not trigger full-grid recomposition or layout reflows.

---

# 85. EPG CLOCK UPDATE CADENCE

Do not re-query database tables or reconstruct the EPG view hierarchy on every second tick.

---

# 86. EPG SPATIAL 2D NAVIGATION DETERMINISM

D-pad traversal through a 2D non-uniform time grid must be predictable:

> Where does focus land when pressing Up, Down, Left, or Right from any cell?

---

# 87. EPG VERTICAL CHANNEL SHIFTS

When moving Up or Down between channels:

Adjacent channels rarely have programs starting at the identical minute.

Verify selection algorithm:

- Program with largest time overlap
- Nearest program start time
- Program encompassing the current playback timeline cursor

---

# 88. EPG HORIZONTAL TIME SHIFTS

Pressing Left or Right must navigate to the chronologically preceding or succeeding program on the active channel, not jump diagonally across channels.

---

# 89. EPG FOCUS AND SCROLL POSITION MEMORY

Exiting the EPG to watch a channel and reopening it should restore:

- Previously selected channel
- Previously focused time slot
- Overall grid scroll offset

---

# 90. AUTOMATIC TIMELINE SCROLL ALIGNMENT

The focused program cell must automatically scroll into view horizontally and vertically without erratic visual snapping.

---

# 91. EPG DUAL-LIST SYNCHRONIZATION

When the channel header column and the program timeline grid use separate scrollable containers:

Verify that vertical scrolling remains lock-step synchronized.

---

# 92. EPG TIMELINE HEADER AND GRID SYNCHRONIZATION

Verify that the horizontal time ruler header scrolls in exact alignment with the underlying program grid.

---

# 93. EPG GRID VIRTUALIZATION

With hundreds of channels and thousands of program blocks:

Verify robust windowing and virtualization to prevent out-of-memory crashes and scroll jank.

---

# 94. EPG SCROLLING PERFORMANCE BENCHMARKS

If scroll framerates have not been profiled on physical hardware:

**EPG SCROLL PERFORMANCE: NOT MEASURED**

---

# 95. EPG DATA REFRESH UNDER ACTIVE USER NAVIGATION

When fresh EPG data loads from the network while the user is actively browsing:

Focus must remain anchored to the active program or channel rather than resetting to the beginning.

---

# 96. EPG PROGRAM BOUNDARY TRANSITION DURING BROWSING

When wall-clock time transitions to the next program:

Do not rip focus away from the user if they are deliberately inspecting future or past schedule slots.

---

# 97. PROGRAM DETAILS VIEW NAVIGATION

Flow:

```text
focus program in EPG
↓
open Program Details modal / screen
↓
press Back
```

Focus must return cleanly to the identical program cell in the EPG grid.

---

# 98. FUTURE PROGRAM ACTIONS

Actions on future program events should offer:

- Set reminder
- Schedule recording
- View series details

Never attempt live playback on future un-broadcast content unless catch-up/timeshift is explicitly available.

---

# 99. PAST PROGRAM CATCH-UP / REPLAY

When past programs support catch-up streaming:

Verify proper source resolution and playback initiation bound to the historical event ID.

---

# 100. STABLE EPG EVENT IDENTIFIERS

Rely on permanent provider event IDs rather than composite keys (channel + start time) where possible to withstand schedule adjustments.

---

# 101. PROGRAM REMINDERS

If reminders are supported:

- Alarm scheduling via `AlarmManager` or `WorkManager`
- System notification or heads-up TV overlay
- One-click remote action to tune directly to the reminded channel

---

# 102. REMINDER RESILIENCE TO EPG SCHEDULE SHIFTS

If a program's start time changes after a reminder is scheduled, verify update or notification semantics.

---

# 103. CLOUD AND LOCAL RECORDING

If recording functionality exists, treat it as a high-risk state machine.

---

# 104. RECORDING STATE MACHINE TAXONOMY

Standard state lifecycle:

```text
IDLE
SCHEDULED
STARTING
RECORDING
STOPPING
COMPLETED
FAILED
CANCELLED
```

Verify that all state transitions are accounted for and guarded.

---

# 105. RECORDING EXECUTION LIFECYCLE

Starting a recording must belong to a durable process or backend service, completely independent of the on-screen UI lifecycle.

---

# 106. RAPID RECORDING TOGGLE CONCURRENCY

Rapidly toggling Record on and off on the remote control must not trigger race conditions in file creation or backend API dispatches.

---

# 107. BACKGROUND EXECUTION MECHANISMS

If performing local recording, verify proper usage of Foreground Services, User-Initiated Data Transfer (UIDT) jobs, or WorkManager according to platform restrictions.

---

# 108. RECORDING DURABILITY ACROSS SCREEN NAVIGATION

Navigating away from the channel, returning to home, or turning off the screen must not abort an active recording session.

---

# 109. RECORDING RECOVERY AFTER PROCESS TERMINATION

Evaluate:

> How does the system detect and recover an ongoing recording if the Android OS kills the process?

---

# 110. RECORDING RECOVERY ARTIFACTS

Inspect:

- Temporary media file finalization
- Metadata database synchronization
- Broken stream segment repair
- Status transition to FAILED or PARTIALLY_COMPLETED

---

# 111. STALE RECORDING STATUS ILLUSION

The UI must never display "Recording Active" based solely on an obsolete database flag if the underlying background job has terminated.

---

# 112. TERMINAL RECORDING RESOURCE CLEANUP

When a recording finishes or fails:

Ensure active file handles, foreground notifications, network streams, and temporary buffers are released.

---

# 113. RECORDING WHEN PROVIDER / SOURCE IS DELETED

If a user deletes a TV playlist or provider account while a recording is scheduled or active:

Define deterministic cleanup behavior.

---

# 114. RECORDING STATE RESTORATION FROM BACKUPS

Restoring application backups must never leave ghost active recording states.

---

# 115. STORAGE EXHAUSTION MITIGATION

Local recordings can rapidly exhaust TV flash storage:

- Low storage warnings
- Automatic recording halt before storage is 100% full
- Graceful partial file preservation
- Automated cleanup of old recordings

---

# 116. DUPLICATE RECORDING SCHEDULES

Prevent concurrent duplicate recording tasks for the identical program event on the same channel.

---

# 117. SCHEDULED RECORDING RESILIENCE

For scheduled future recordings, audit behavior across:

- Device reboots
- Application updates
- Timezone and clock shifts
- EPG schedule adjustments

---

# 118. CONCURRENT TUNER AND RECORDING CONFLICTS

If hardware tuner or stream concurrency limits prevent watching Channel A while recording Channel B:

Verify clear user warning and conflict resolution dialogs.

---

# 119. TIMESHIFTING AND ROLLING DVR BUFFERS

If timeshifting live streams is supported, trace:

```text
Live stream input
↓
Rolling circular buffer (RAM or storage)
↓
User pauses live TV
↓
User seeks backward
↓
User resumes playback
↓
User triggers "Go Live"
```

---

# 120. TIMESHIFT BUFFER MANAGEMENT

Inspect:

- Maximum buffer capacity (e.g., 60 minutes)
- Storage location (RAM vs internal flash vs USB storage)
- FIFO eviction policy for oldest segments
- Resource cleanup on channel change

---

# 121. TIMESHIFT SEEK BOUNDARIES

Enforce strict seek limits:

- Cannot seek earlier than the oldest retained buffer segment
- Cannot seek later than the live broadcast edge

---

# 122. BUFFER EVICTION COLLISION

If a user remains paused longer than the maximum buffer window:

Define deterministic recovery when the paused position is purged by FIFO eviction.

---

# 123. "GO LIVE" RECONCILIATION

The "Go Live" action must seek directly to the current live broadcast edge, synchronize the seekbar, and resume standard live playback mode.

---

# 124. LIVE TO TIMESHIFT CONCURRENCY RACE

Scenario:

```text
user clicks "Go Live"
↓
delayed asynchronous seek callback arrives from previous scrub
↓
player jumps backward into timeshift buffer
```

Guard against stale seek execution.

---

# 125. TIMESHIFT SURVIVAL ACROSS PROCESS DEATH

Timeshift rolling buffers are typically ephemeral and do not survive process restarts.

Document explicit expectations.

---

# 126. TIMESHIFT TEMPORARY FILE CLEANUP

Verify that temporary rolling buffer cache files are wiped immediately upon channel change or application exit.

---

# 127. MULTIVIEW (MULTI-SCREEN) PLAYBACK

Where multiple live streams render concurrently:

Map layout:

```text
Tile A (Focused) | Tile B
-------------------------
Tile C           | Tile D
```

---

# 128. MULTIVIEW CONCURRENT DECODER CAPACITY

How many simultaneous hardware video decoders can the target TV platform run?

If unverified on hardware:

**DECODER CAPACITY: NOT VERIFIED**

---

# 129. ACTIVE AUDIO FOCUS TILE

Only the currently focused or user-designated multiview tile should output audio.

Audit seamless audio switching during D-pad navigation between tiles.

---

# 130. MULTIVIEW D-PAD FOCUS NAVIGATION

D-pad navigation must cleanly shift visual focus and audio output across tiles without video stutter.

---

# 131. DYNAMIC TILE REMOVAL

When removing a stream from multiview:

- Release player and decoder resources
- Reallocate D-pad focus to a remaining tile
- Update audio focus cleanly

---

# 132. ISOLATION OF STREAM FAILURES

A stream error or buffering stall on Tile B must not disrupt playback on Tile A, C, or D.

---

# 133. MULTIVIEW PERFORMANCE METRICS

Audit bandwidth consumption, decoder throughput, and memory pressure under multi-stream rendering.

---

# 134. PICTURE-IN-PICTURE (PIP) ON TV

If TV PiP is supported, inspect:

- Entry triggers (pressing Home or explicit PiP action)
- Remote actions available in PiP mode
- Audio focus management
- Exiting PiP back to fullscreen
- Restoring D-pad focus upon exit

---

# 135. ANDROID TV PIP DIFFERENCES

Android TV PiP mechanics differ from mobile phone PiP (e.g., PiP overlay focus and repositioning APIs).

Verify adherence to TV-specific PiP guidelines.

---

# 136. BACKGROUND AUDIO PLAYBACK ON TV

Unlike mobile, continuing audio playback in the background after the user presses Home is often undesirable for a TV video app.

Verify that background playback behavior matches deliberate product intent.

---

# 137. HOME BUTTON BEHAVIOR

Pressing the physical Home button suspends the TV application.

Inspect state handling for:

- Video player (pause / release)
- Active recordings (must continue in background)
- Timeshift buffers (cleanup)
- MediaSession status

---

# 138. APPLICATION RESUMPTION POST-HOME

Returning to the app from the TV launcher must reconstruct the UI from actual persistent state rather than stale in-memory booleans.

---

# 139. TV PROCESS DEATH RESILIENCE

Audit state recovery across OS process termination for:

- Last tuned channel ID
- Content catalog scroll position
- Active EPG channel and timeline coordinates
- Background recording jobs
- User authentication and profile
- Active playlist / provider configurations

---

# 140. RESTART POST-PROCESS DEATH POLICIES

Do not automatically autoplay the last channel upon cold launch unless specifically configured in user preferences.

Separate state restoration from automatic playback initiation.

---

# 141. RESTORING PLAYBACK OF DELETED CONTENT

If restoring the last viewed channel:

Verify that the channel still exists in the active subscription and that credentials remain valid.

---

# 142. PLAYLIST AND PROVIDER MANAGEMENT

When supporting multiple IPTV or content providers:

Map data scopes:

- Provider account ID
- Channel lineup
- EPG metadata feeds
- Program recordings
- User favorites
- Watch history

---

# 143. PROVIDER DELETION INTEGRITY

Deleting a provider account must atomically coordinate:

- Immediate termination of active playback on that provider
- Purging cached EPG data
- Cancelling scheduled recordings
- Purging orphaned favorites and history entries

---

# 144. PROVIDER REPLACEMENT AND RE-IMPORT

When updating or re-importing an M3U or Xtream playlist:

Differentiate retained channels from removed channels to preserve user favorites.

---

# 145. PROVIDER REFRESH INTEGRITY

Refreshing playlist channels and EPG feeds must not erase user preferences attached to stable logical channels.

---

# 146. CHANNEL IDENTITY STABILITY ACROSS REFRESHES

Providers frequently alter:

- Channel array ordering
- Internal stream URLs
- Category classifications

If favorites and history track items by array index, they will corrupt upon refresh.

---

# 147. STABLE CHANNEL FINGERPRINTING

When permanent provider IDs are absent:

Inspect the heuristic matching algorithm (e.g., tvg-id, clean channel name) used to preserve user associations across refreshes.

---

# 148. DUPLICATE CHANNELS DEDUPLICATION

If a provider stream list contains identical channel duplicates, audit deduplication semantics.

---

# 149. FAVORITES LIST PRESERVATION

User favorite tags must persist across provider syncs provided the logical channel still exists.

---

# 150. WATCH HISTORY SEGREGATION

Recent watch history must be scoped to the active user profile and active provider.

---

# 151. PARENTAL CONTROLS SECURITY BOUNDARY

Treat parental controls and mature content locks as strict security boundaries.

---

# 152. PARENTAL PIN CHALLENGE FLOW

Audit:

```text
select locked channel / category
↓
PIN dialog intercepts focus
↓
validate PIN
↓
grant access on success / reject on failure
```

---

# 153. BACK NAVIGATION FROM PIN DIALOG

Pressing Back from a parental PIN dialog must restore focus to safe content without unlocking the restricted stream.

---

# 154. PIN UNLOCK EXPIRATION POST-PROCESS DEATH

Session-based PIN unlocks must expire when the application process terminates or after an idle timeout.

---

# 155. MULTI-PROFILE USER SWITCHING

Where user profiles exist:

Ensure parental restrictions, watch history, and favorites are strictly partitioned per profile.

---

# 156. TV SEARCH INTERACTION

Search interfaces on Android TV must be 100% remote-navigable.

---

# 157. ONSCREEN KEYBOARD (IME) INTEGRATION

Inspect focus transitions between:

- Custom on-screen grid keyboards or system Leanback IME
- Search query text field
- Search results grid

---

# 158. SEARCH FOCUS AND BACK NAVIGATION

Flow:

```text
search query input
↓
move focus down into results grid
↓
press Back
```

Focus should return to the search input field or previous screen according to consistent navigation rules.

---

# 159. VOICE SEARCH INTEGRATION

If implementing Google Assistant or system voice search:

Verify speech recognition permissions and intent handling.

If not implemented:

**NOT APPLICABLE**

---

# 160. FAST SEARCH QUERY ENTRY

As search results update asynchronously per character:

Ensure the results update does not reset or snatch focus away from the keyboard while the user is typing.

---

# 161. FILTER CHIPS AND DROPDOWNS

Category and genre filter chips must support fluid D-pad traversal and clear visual selected states.

---

# 162. SORT ORDER CHANGES AND FOCUS ANCHORING

Changing sort order re-arranges the list items.

Verify that focus remains on the selected item or resets cleanly to the first item without disappearing.

---

# 163. SETTINGS AND FORM NAVIGATION

Settings screens on TV typically utilize lists of toggle switches, sliders, and option rows.

Ensure the entire row is a coherent focus target and pressing D-pad Center toggles the value or opens the sub-dialog.

---

# 164. TOGGLE SWITCH VISIBILITY AND SEMANTICS

Ensure the focused and selected state of toggle switches is distinctly visible and communicates state to accessibility screen readers.

---

# 165. DESTRUCTIVE ACTIONS CONFIRMATION

Destructive actions (e.g., "Clear Data", "Delete Playlist") must require a two-step confirmation dialog fully operable via remote control.

---

# 166. LONG TEXT AND TERMS SCROLLING

Legal agreements, privacy policies, and changelogs must be vertically scrollable via D-pad Up and Down.

---

# 167. QR CODE AUTHENTICATION

If presenting a QR code for mobile login / device pairing:

Provide a clear fallback URL and activation code for users without mobile cameras.

---

# 168. TV AUTHENTICATION ARCHITECTURES

Common TV auth patterns:

- Direct on-screen email/password entry
- Device activation code (e.g., "Visit example.com/activate and enter code")
- QR code scanning
- Web browser redirect

---

# 169. DEVICE ACTIVATION CODE LIFECYCLE

If using device activation codes:

- Polling interval rate limiting
- Expiration timer display
- Cancellation on screen exit
- Regeneration of expired codes

---

# 170. POLLING LEAK PREVENTION

Background auth token polling must cancel immediately if the user navigates away from the login screen.

---

# 171. ASYNCHRONOUS AUTHENTICATION COMPLETION

When the user finishes pairing on their mobile device or PC:

The TV interface must automatically detect token grant, transition to authenticated home, and place focus on the primary content row.

---

# 172. USER LOGOUT TEARDOWN

Upon user logout:

- Terminate active playback
- Clear MediaSession
- Cancel scheduled recordings
- Purge local cached profile data
- Clear navigation backstack
- Reset focus to login prompt

---

# 173. BACK PRESS POST-LOGOUT

Pressing Back from the login screen after logout must never pop back into authenticated private content.

---

# 174. CROSS-ACCOUNT DATA BLEED

Favorites, history, and stored recordings must not leak across different accounts on the same TV.

---

# 175. NETWORK LOSS DURING EXTENDED TV VIEWING

TV apps often run continuously for days.

Simulate:

```text
live stream active
↓
network connection drops
↓
wait 60 seconds
↓
network connection restores
```

Verify seamless playback recovery or clear retry prompts.

---

# 176. WI-FI TO ETHERNET SEAMLESS TRANSITIONS

TV set-top boxes frequently switch between Wi-Fi and wired Ethernet.

Verify that network capability changes trigger graceful reconnection.

---

# 177. CAPTIVE PORTALS AND WALLED GARDENS

Differentiate network transport presence from actual API endpoint reachability.

---

# 178. OFFLINE ERROR UI ACCESSIBILITY

When offline, error screens must display a prominent, default-focused "Retry" button that responds to D-pad Center.

---

# 179. ERROR OVERLAY FOCUS TRAPS

Error dialogs and network loss toasts must never trap focus or prevent the user from pressing Back to navigate away.

---

# 180. RETRY BUTTON DEFAULT FOCUS

When presenting an error dialog, focus must land immediately on the "Retry" or "Dismiss" action.

---

# 181. EXITING BROKEN PLAYER SCREENS

The user must always be able to press Back to escape a failed player screen, even if the video surface is unresponsive.

---

# 182. LOADING SCREEN ESCAPE PATHS

Indefinite loading spinners must never block Back button handling.

---

# 183. SLOW API PROVIDER LATENCY

If a channel list or EPG endpoint takes 15 seconds to respond:

Ensure the UI allows the user to navigate to other tabs or cancel the request.

---

# 184. ASYNCHRONOUS CANCELLATION ON NAVIGATION

If a user leaves a screen while data is loading:

Cancel outstanding coroutines so late responses do not overwrite the new destination's state or focus.

---

# 185. MULTI-DAY LONG-RUNNING SESSIONS

Televisions are rarely rebooted, and TV apps remain open in the foreground for days.

Audit:

- Access token expiration and silent renewal
- EPG daily refresh cycles
- Signed stream URL renewals
- Native memory footprint
- Image cache bounds
- WebSocket reconnect lifecycles

---

# 186. MIDNIGHT DATE CROSSING INTEGRITY

When midnight passes:

Verify that the EPG timeline advances, the active day indicator updates, and scheduled recordings trigger accurately.

---

# 187. SYSTEM TIMEZONE ADJUSTMENT

If the user changes the TV system timezone, EPG event schedules must update immediately without requiring app restart.

---

# 188. DEVICE CLOCK SKEW TOLERANCE

If the TV hardware clock is inaccurate, determine whether the app relies strictly on local device clock or uses server time synchronization.

---

# 189. SCREEN BURN-IN MITIGATION

For OLED televisions displaying static UI elements (e.g., news tickers, channel logos, static overlays) for hours:

Verify whether pixel shifting or overlay auto-hide timers are implemented if required by product specs.

---

# 190. SYSTEM SCREENSAVER INTERACTION

Android TV automatically launches ambient screensavers (Backdrop / Colors).

Ensure video playback properly suppresses screensaver activation, but allows screensavers to trigger when browsing static menus.

---

# 191. WAKE LOCK AND `KEEP_SCREEN_ON`

Verify that `FLAG_KEEP_SCREEN_ON` is set strictly during active media playback and released when paused or idling on menus.

---

# 192. WAKE LOCK LEAKS

Ensure wake locks acquired during playback are abandoned immediately upon playback termination or Activity destruction.

---

# 193. LOW-MEMORY SYSTEM RESISTANCE

TV devices aggressively terminate background tasks.

Ensure return from background reconstructs state from Room or saved instance bundles.

---

# 194. FLASH STORAGE CAPACITY MANAGEMENT

Low-cost TV sticks frequently possess less than 1 GB of free storage.

Audit disk footprints for:

- Local recordings
- Timeshift temporary buffers
- Image disk caches
- EPG SQLite databases

---

# 195. CACHE SIZE BOUNDS

Enforce strict upper size bounds on disk caches for images, manifests, and EPG records.

---

# 196. EPG HISTORICAL DATA RETENTION POLICIES

Purge past EPG program entries older than the catch-up window (e.g., purge records older than 7 days).

---

# 197. RECORDING DISK MANAGEMENT

Provide intuitive remote-operable UI for reviewing available disk space and deleting old recordings.

---

# 198. TIMESHIFT TEMP BUFFER LIFECYCLE

Ensure temporary timeshift video segments are deleted when changing channels or stopping playback.

---

# 199. EPG DATABASE QUERY OPTIMIZATION

With 50,000+ program entries, EPG SQLite queries can cause severe UI freezes.

Verify:

- Compound indexes on `(channel_id, start_time, end_time)`
- Asynchronous database querying off the Main thread
- Query pagination or windowing

---

# 200. CRITICAL EPG QUERY AUDIT

Inspect the core query pattern:

```sql
SELECT * FROM epg_programs
WHERE channel_id = :channelId
  AND end_time > :windowStart
  AND start_time < :windowEnd
ORDER BY start_time ASC
```

Verify index coverage in Room entity definitions.

---

# 201. CHANNEL LIST RENDERING EFFICIENCY

When handling 5,000+ channels:

Verify virtualized lists (`LazyColumn`, `RecyclerView`) and lightweight model mappings.

---

# 202. FAVORITE CHANNEL FILTERING OVERHEAD

Filtering large channel lists by favorites or categories must not execute heavy synchronous processing on every D-pad directional click.

---

# 203. BITMAP MEMORY ALLOCATION FOR TV

TV poster and backdrop assets must be downsampled to display container dimensions during decoding to prevent heap exhaustion.

---

# 204. BACKDROP BITMAP TRANSITION ACCUMULATION

Avoid retaining multiple full-resolution 4K bitmap buffers in memory during rapid focus scrolling.

---

# 205. GPU FILL-RATE OVERLOAD

Excessive use of real-time blur modifiers, multi-layer shadows, glowing borders, and alpha blending across dozens of cards will overwhelm weak TV GPUs.

If unmeasured:

**TV GPU PERFORMANCE: NOT MEASURED**

---

# 206. ANIMATION TIMING SNAPPINESS

Focus transition animations must feel crisp and responsive.

Long animation curves make remote navigation feel sluggish.

---

# 207. JETPACK COMPOSE RECOMPOSITION BLAST RADIUS

Focus changes in Compose for TV can trigger massive recomposition cascades if state holders are poorly structured.

Audit recomposition scopes around focused items.

---

# 208. FOCUS STATE ISOLATION IN DEEP UI TREES

Avoid hosting mutable focus state in root screen composables where every D-pad step forces the entire screen to recompose.

---

# 209. EPG CLOCK TICK RECOMPOSITION HAZARDS

Updating an on-screen clock every second must not recompose the entire 2D program grid.

---

# 210. STABLE KEYS IN LAZY TV LISTS

`LazyRow` and `LazyColumn` items must define explicit, stable `key` lambdas to ensure Compose preserves focus state correctly across list mutations.

---

# 211. MULTI-RESOLUTION LAYOUT TESTING

Verify layout scaling and alignment across:

- 720p (HD Ready STBs)
- 1080p (Standard Full HD)
- 4K UHD (2160p)

---

# 212. OVERSCAN AND TITLE-SAFE MARGINS

Ensure critical text labels, action buttons, and player status indicators observe title-safe padding (typically 5% margins from screen edges) to avoid clipping on legacy TV sets.

---

# 213. TYPOGRAPHY AND DISTANT LEGIBILITY

TV UI is viewed from 10 feet away.

Verify font sizes, line heights, and weights for readability from a couch distance.

---

# 214. FOCUS INDICATOR CONTRAST RATIO

Ensure focus borders and highlight rings remain clearly distinguishable against both dark and vibrant channel poster artwork.

---

# 215. TALKBACK ACCESSIBILITY ON ANDROID TV

If accessibility support is required:

- Verify clear semantic content descriptions
- Ensure correct accessibility focus traversal order
- Announce active item selection state

Do not conflate accessibility focus with native D-pad input focus.

---

# 216. SEMANTIC CONTENT DESCRIPTIONS

Media cards with visible text titles should use the title as their accessibility label rather than duplicating text reads.

---

# 217. ACCESSIBLE PLAYER CONTROLS

Ensure Play, Pause, CC, Audio Track, and Settings icons provide localized content descriptions.

---

# 218. PARENTAL PIN ACCESSIBILITY

The parental PIN entry view must communicate the currently focused digit and mask state to screen readers.

---

# 219. AUTOMATED TEST SUITE AUDIT

Inspect existing TV automated testing coverage:

- Unit tests for EPG and channel models
- Compose for TV UI tests
- D-pad navigation instrumentation tests
- Screenshot regression tests for focus states
- Playback state machine tests
- Recording lifecycle tests

---

# 220. INADEQUACY OF TOUCH-BASED UI TESTS

UI tests that call `performClick()` directly do not prove D-pad spatial navigation or focus correctness.

---

# 221. D-PAD NAVIGATION TEST AUTOMATION

Verify deterministic directional navigation test sequences:

```text
performKeyPress(KEYCODE_DPAD_RIGHT)
performKeyPress(KEYCODE_DPAD_RIGHT)
performKeyPress(KEYCODE_DPAD_DOWN)
performKeyPress(KEYCODE_DPAD_LEFT)
performKeyPress(KEYCODE_DPAD_CENTER)
performKeyPress(KEYCODE_BACK)
```

Assert focused node identity after each discrete step.

---

# 222. FOCUS RESTORATION TEST

```text
focus Item X
↓
trigger navigation to Details
↓
trigger Back
↓
assert Item X is focused
```

---

# 223. FOCUS RETENTION ACROSS DATA REFRESH TEST

```text
focus Item X
↓
refresh underlying dataset
↓
assert Item X retains focus
```

---

# 224. REMOVAL OF FOCUSED ITEM TEST

When the focused item is deleted from the dataset:

Verify deterministic fallback focus to nearest neighbor or parent container.

---

# 225. RAPID D-PAD BURST TESTS

Simulate repeated rapid key events via instrumentation to ensure the focus engine does not crash or lose state.

---

# 226. RAPID CHANNEL ZAPPING RACE TESTS

For Live TV:

Inject artificial delays into source resolution so earlier channel requests complete after later ones.

Assert that the player settles strictly on the latest selected channel.

---

# 227. 2D EPG GRID NAVIGATION TESTS

Automate horizontal, vertical, and diagonal traversal across non-uniform program boundary grids.

---

# 228. EPG REFRESH DURING NAVIGATION TEST

Trigger EPG data sync while a specific program cell holds active focus.

Assert focus stability.

---

# 229. EPG MIDNIGHT DATE CROSSING TEST

Simulate clock advancement across 23:59 to 00:00 and verify timeline updates.

---

# 230. DAYLIGHT SAVING TIME TRANSITION TEST

Verify EPG rendering and navigation across DST clock shifts.

---

# 231. RECORDING BACKGROUND LIFECYCLE TEST

```text
start recording
↓
send app to background
↓
simulate memory pressure
↓
re-open app
↓
stop recording
```

Verify output file integrity.

---

# 232. RAPID RECORDING CONTROL TOGGLE TEST

Execute rapid Start -> Stop -> Start recording sequences and assert state machine integrity.

---

# 233. PROVIDER DELETION DURING ACTIVE RECORDING TEST

Delete content provider while a recording is in progress and assert clean terminal state.

---

# 234. TIMESHIFT BOUNDARY NAVIGATION TEST

Verify seek behavior when scrubbing back to the earliest buffer segment and forward to the live edge.

---

# 235. MULTIVIEW TILE SWITCHING TEST

Simulate adding tiles, shifting focus across tiles, switching audio tracks, and closing tiles.

---

# 236. PICTURE-IN-PICTURE TRANSITION TEST

Test entering and exiting TV PiP mode while verifying playback and focus continuity.

---

# 237. TV PROCESS TERMINATION RESTORATION TEST

Seed channel, scroll position, and EPG coordinates.

Simulate process kill, relaunch, and verify restored state.

---

# 238. EXTENDED DURATION STRESS TEST

Simulate 8 hours of continuous operation across 100+ channel changes, EPG syncs, and backgrounding cycles to detect resource leaks.

---

# 239. PHYSICAL LOW-END HARDWARE TESTING

Where physical hardware is available, validate framerates, memory, and decoder stability on entry-level Android TV streaming sticks.

---

# 240. SUBSTANTIVE FINDING REPORTING TEMPLATE

Every substantive finding must be documented using this exact structure:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Screen:
TV interaction:
Focused element:
Player/source:
File/Class:
Relevant code:

Device/API scope:

Problem:

Evidence:

TV Interaction Timeline:

T0:
T1:
T2:
T3:

Expected focus/state:

Actual/Possible focus/state:

Playback impact:

User impact:

Data/Recording impact:

Root cause:

Recommended remediation:

Regression test:

Device/runtime verification:

Complexity:
XS / S / M / L / XL
```

---

# 241. SEVERITY RATING SYSTEM

Apply strict severity definitions:

## P0 - CRITICAL

- Cross-account private media or user data exposure
- Catastrophic storage corruption or unrecoverable recording data loss
- Parental control PIN bypass allowing unrestricted adult content playback

## P1 - HIGH

- Critical screen or flow completely unreachable via remote control
- Visual focus disappears, trapping the user without navigation recourse
- Channel zapping race plays the wrong channel stream
- Recording or timeshift state corruption causing data loss
- User logout leaves authenticated playback or private data active

## P2 - MEDIUM

- Substantial D-pad focus jumping or navigation disorientation
- EPG standard navigation is erratic or unreliable
- Playback recovery defect with an available manual workaround
- Inconsistent behavior across orientation, PiP, or configuration changes

## P3 - LOW

- Minor D-pad edge case with trivial impact
- Secondary UI cosmetic focus alignment or visual padding issue

## P4 - IMPROVEMENT

- TV UI polish, smoother focus animation, or performance optimization without existing functional failure

---

# 242. CONFIDENCE RATINGS

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

Empirically reproduced on a TV device/emulator or directly proven via deterministic code execution flow.

MEDIUM:

Strong code-level evidence, but untested on physical TV remote hardware.

LOW:

Dependent upon OEM-specific remote keymappings, hardware decoders, or unverified TV launcher behaviors.

---

# 243. VERIFICATION STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 244. TV HARDWARE VERIFICATION FLAGS

Include for TV-specific findings:

```text
DEVICE VERIFIED:
YES
NO

INPUT VERIFIED:
YES
NO
```

---

# 245. PERFORMANCE STATUS FLAGS

For performance findings:

```text
MEASURED
CODE-LEVEL RISK
NOT MEASURED
```

---

# 246. FALSE POSITIVE PREVENTION RULES

Before asserting P1 or P2 findings, inspect:

1. Actual D-pad input dispatch chain
2. True focus owner in layout hierarchy
3. List item key stability
4. Navigation backstack states
5. Compose vs View focus mechanics
6. Underlying media player state machine
7. EPG data structure and query indices
8. Channel provider identity logic
9. Application lifecycle scopes
10. Automated test assertions

Never declare focus broken purely from static screenshots.

---

# 247. DO NOT TREAT MOUSE POINTERS AS TV TESTS

If a feature functions with a mouse pointer or touch event, that proves nothing regarding D-pad usability.

---

# 248. DO NOT FORCE MANUAL FOCUS ROUTING EVERYWHERE

Android's default spatial focus algorithm is often effective.

Introduce custom `focusProperties` only where spatial heuristics fail or produce dead ends.

---

# 249. DO NOT ANCHOR FOCUS SOLELY TO ARRAY INDICES

When lists are dynamic, anchoring focus to a stable entity ID is essential.

Verify the actual architecture in place.

---

# 250. DO NOT COUPLE MEDIA PLAYERS DIRECTLY TO FOCUS

Focus and player lifecycles are distinct concerns.

Never instantiate or release player instances on every focus step unless specifically implementing lightweight video previews.

---

# 251. DO NOT RE-FETCH HEAVY DATA ON EVERY FOCUS STEP

D-pad traversal is rapid.

Never bind heavy database queries or network requests directly to focus changes without debounce and cancellation mechanisms.

---

# 252. DO NOT MODIFY CODE DURING THE AUDIT

Throughout the audit:

- Do not rewrite focus trees
- Do not alter navigation graphs
- Do not swap media player implementations
- Do not rewrite EPG queries
- Do not adjust recording services
- Do not modify timeshift buffers
- Do not inject third-party TV libraries

Complete the investigation first.

---

# 253. OUTPUT REPORT STRUCTURE - ANDROID_TV_AUDIT.md

Structure the audit report:

## 1. Executive Summary

- TV technology stack
- Input model analysis
- Focus management architecture
- Media playback architecture
- Principal TV risks
- Production readiness verdict

## 2. TV Device / Platform Matrix

## 3. Manifest / TV Launcher Audit

## 4. D-pad Input Audit

## 5. Focus Architecture

## 6. Focus Navigation Audit

## 7. Focus Restoration Audit

## 8. Sidebar / Navigation Audit

## 9. Row / Grid Navigation Audit

## 10. TV Performance Audit

## 11. Live TV Audit

## 12. Channel Zapping Audit

## 13. Player Lifecycle Audit

## 14. EPG Data Audit

## 15. EPG Focus / Timeline Audit

## 16. Recording Audit

## 17. Timeshift Audit

## 18. Multiview Audit

## 19. PiP Audit

## 20. Provider / Source Audit

## 21. Search Audit

## 22. Settings / Forms Audit

## 23. Authentication / Logout Audit

## 24. Parental Controls Audit

## 25. Network / Recovery Audit

## 26. Long Session / Memory Audit

## 27. Accessibility Audit

## 28. Test Coverage Audit

## 29. Findings Summary

| ID | Severity | Area | Screen/Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 30. P0 Findings

## 31. P1 Findings

## 32. P2 Findings

## 33. P3 Findings

## 34. P4 Improvements

## 35. Things Done Well

## 36. Unknown / Not Verified

## 37. Production Readiness Matrix

Use:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Covering:

- TV launcher compliance
- Remote-only navigability
- Focus visibility and contrast
- Focus restoration
- Modal dialog handling
- Back button hierarchy
- Rapid D-pad traversal
- Live TV playback
- Rapid channel zapping
- EPG grid navigation
- Recording resilience
- Timeshift buffer management
- Multiview concurrency
- Picture-in-Picture
- Process death recovery
- Logout cleanup
- Low-end hardware performance
- Long session stability
- Automated test coverage

## 38. Remediation Roadmap

---

# 254. SCREEN FOCUS MATRIX

For each critical screen:

| UI Element | Focusable | Up Target | Down Target | Left Target | Right Target | Center Action |
|---|---|---|---|---|---|---|

Document logical component types across the interface.

---

# 255. FOCUS RESTORATION MATRIX

| Navigation Flow | Originating Focus | Destination | Restored Focus Target | Stable ID Bound | Verified |
|---|---|---|---|---|---|

---

# 256. TV REMOTE INPUT MATRIX

| Physical Key | Active Screen | Expected Action | Handled By | Risk |
|---|---|---|---|---|

---

# 257. LIVE TV INTERACTION MATRIX

| User Action | Player State Prior | Expected State After | Concurrency Guard | Verified |
|---|---|---|---|---|

---

# 258. EPG NAVIGATION MATRIX

| Scenario | Originating Cell | D-pad Key | Expected Landed Cell | Timeline Scroll | Result |
|---|---|---|---|---|---|

---

# 259. RECORDING LIFECYCLE MATRIX

| State | Trigger Event | Next Expected State | Durable Storage | Recovery Mechanism |
|---|---|---|---|---|

---

# 260. SECOND PASS - REMOTE-ONLY ATTACK SCENARIO

After completing the initial audit, mentally strip away all touch, mouse, and keyboard inputs.

Attempt to execute every primary flow using exclusively:

```text
Up
Down
Left
Right
Center
Back
```

If any critical flow stalls or cannot be completed:

Document a substantive TV usability finding.

---

# 261. SECOND PASS - FOCUS LOSS ATTACK SCENARIO

While an item holds active focus, mutate the underlying dataset:

```text
focus on Item X
↓
insert new item ahead of X
↓
trigger dataset refresh
↓
remove unrelated item
```

Evaluate:

> Where does visual focus reside now?

---

# 262. SECOND PASS - REMOVAL OF FOCUSED ITEM SCENARIO

```text
focus on Item X
↓
Item X is dynamically removed from the dataset
```

Evaluate:

> What component claims focus next?

Behavior must be deterministic and visible.

---

# 263. SECOND PASS - RAPID INPUT BURST STRESS SCENARIO

Simulate sustained rapid D-pad sequences:

```text
Right Right Right Right Right
Down
Left Left
Center
```

Audit for:

- Input queue backpressure
- Focus visual position desynchronization
- Executing action on wrong item

---

# 264. SECOND PASS - OUT-OF-ORDER ZAPPING RACE SCENARIO

Simulate worst-case asynchronous network delivery:

```text
Channel A resolution starts
Channel B resolution starts
Channel C resolution starts
Channel C returns response
Channel B returns response
Channel A returns response
```

The final active stream must strictly be Channel C.

---

# 265. SECOND PASS - EPG REFRESH UNDER NAVIGATION

```text
user focuses a future program cell
↓
background EPG data refresh arrives
↓
program schedule updates
```

Evaluate:

- Does the focused program remain active?
- Does focus jump back to the beginning?
- Does horizontal scroll snap erratically?

---

# 266. SECOND PASS - MIDNIGHT DATE CROSSING SCENARIO

Simulate continuous execution across the midnight boundary:

```text
23:59:58
↓
00:00:02
```

Audit:

- EPG active date tab
- Current live program mapping
- Live "Now" marker position
- Scheduled reminders and recordings

---

# 267. SECOND PASS - RECORDING INTERRUPTION FAILURE INJECTION

Inject failures during:

```text
STARTING
RECORDING
STOPPING
FINALIZING
```

Evaluate what remains persistent and what the user sees upon recovery.

---

# 268. SECOND PASS - SOURCE DELETION DURING PLAYBACK

Scenario:

```text
provider playlist active
↓
live channel actively playing
↓
scheduled recording pending
↓
user deletes the provider account
```

Verify clean teardown across all dependent features.

---

# 269. SECOND PASS - PROCESS DEATH AT CRITICAL MOMENTS

Simulate immediate process kill during:

- Catalog browsing
- Live TV playback
- EPG navigation
- Background recording
- Timeshift paused state
- Multiview rendering

Define the exact expected recovery state for each scenario.

---

# 270. SECOND PASS - USER LOGOUT MID-STREAM

```text
private channel playing
↓
user logs out
```

Inspect:

- Player instance termination
- MediaSession teardown
- Notification removal
- Background recording cancellation
- Navigation stack clearing
- Focus reset

---

# 271. SECOND PASS - EXTENDED SESSION RESOURCE STRESS

Simulate:

- 8 hours continuous playback
- 100 sequential channel switches
- Multiple EPG sync intervals
- Repeated background and foreground transitions

Identify any creeping resource or memory leaks.

---

# 272. SECOND PASS - LOW-END HARDWARE SIMULATION

Re-evaluate critical screens under realistic TV hardware constraints:

- Low-power quad-core CPU
- Less than 2 GB RAM
- Slow flash storage
- Limited hardware video decoders

---

# 273. SECOND PASS - NETWORK DROP DURING CHANNEL ZAPPING

Scenario:

```text
network connection severed
↓
user continues zapping channels
↓
network connection restored
```

Verify final settled playback stream and error recovery.

---

# 274. SECOND PASS - BACK BUTTON DETERMINISM AUDIT

For every possible screen state and overlay combination, answer:

> Exactly what action does a single Back button click perform?

If the outcome is ambiguous, investigate the underlying state machine.

---

# 275. FINAL QUALITY GATE

Before publishing the audit report, verify:

- No critical flow was evaluated solely with touch or mouse inputs
- Focus is treated as an active state machine, not merely styling
- Focus restoration across navigation is verified
- List indices are not accepted as stable identifiers for dynamic content
- Rapid D-pad key repeat handling is audited
- Back button hierarchy is fully deterministic
- Live TV zapping verifies race conditions and stale response guards
- Channel identity is independent of transient list positions
- EPG timezone, DST, and time boundary semantics are verified
- EPG data refreshes do not reset user focus unprompted
- Recording features possess durable recovery mechanisms
- Timeshift buffer boundaries are enforced
- Multiview accounts for hardware decoder constraints
- Logout boundaries purge private playback and data
- Long-session resource accumulation is audited
- TV performance claims are not inferred from mobile phone tests
- Device-specific claims are not fabricated
- Every P1 and P2 finding includes a concrete D-pad/focus/playback timeline
- Cosmetic polish improvements (P4) are strictly separated from functional bugs

---

# FINAL RULE

Do not deliver a report stating:

> Improve D-pad navigation, enlarge buttons, and test the app on a television.

That is not an Android TV audit.

Seek concrete systemic failures such as:

```text
focus on channel 15
↓
EPG refresh inserts new channel at index 0
↓
app stores focus by index
↓
same index now belongs to channel 14
↓
focus silently moves to wrong logical channel
```

or:

```text
Channel A source request starts
↓
user zaps Channel B
↓
user zaps Channel C
↓
Channel C starts playing
↓
Channel A request completes late
↓
player receives Channel A MediaItem
↓
TV jumps back to wrong channel
```

or:

```text
dialog opens
↓
focus moves inside dialog
↓
dialog closes
↓
previous FocusRequester target no longer exists
↓
focus becomes null
↓
remote user cannot continue navigation
```

or:

```text
recording marked RECORDING in database
↓
process dies
↓
underlying recording job is gone
↓
app restarts
↓
UI trusts DB flag
↓
user sees recording as active although nothing is being recorded
```

or:

```text
timeshift paused
↓
rolling buffer advances
↓
oldest segment containing current position is deleted
↓
user presses Play
↓
player attempts unavailable segment
↓
no recovery to oldest valid position or live edge
```

or:

```text
User A plays private channel
↓
logout
↓
MediaSession/Player remains alive
↓
User B logs in
↓
User A's content and metadata still active
```

or:

```text
focused card A starts backdrop request
↓
focus moves to card B
↓
card B backdrop displayed
↓
card A image request finishes later
↓
background switches back to card A
↓
visual context no longer matches focused item
```

These are the Android TV failures you must uncover.

Think through:

- Remote-only interaction
- Focus ownership and identity
- Stable entity keys
- D-pad spatial ordering
- Back button hierarchy
- Rapid input handling
- Source switching concurrency
- EPG time models
- Recording state machines
- Timeshift buffer limits
- Process death restoration
- Long-running playback stability
- Multi-user account isolation
- Resource-constrained TV hardware

For every substantive finding, you must answer:

> Which element holds focus?

> What happens if the user rapidly spams the D-pad?

> What happens if the list contents refresh?

> Where does focus return after pressing Back?

> Which channel is canonical during rapid zapping?

> Can a stale async callback overwrite new TV state?

> What happens if the process terminates during recording?

> What happens after hours of continuous playback?

If not verified at runtime:

**NOT VERIFIED.**

If dependent upon specific TV OEM hardware:

**DEVICE BEHAVIOR NOT VERIFIED.**

If representing only cosmetic UI enhancement:

**P4 - IMPROVEMENT.**

Uncovering 6 genuine focus, playback, and EPG defects with precise interaction timelines is infinitely superior to writing 100 generic TV guidelines.

The goal is a forensically precise Android TV audit from which every substantive finding translates directly into:

- a deterministic D-pad reproduction sequence
- a focus regression test
- a rapid-zap race test
- an EPG navigation test
- a recording recovery test
- a timeshift boundary test
- a process-death verification
- a production-verified TV readiness plan
