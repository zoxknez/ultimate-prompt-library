---
id: UPL-IT-010
number: 10
slug: browser-compatibility-and-production-bug-hunter
title: Browser Compatibility & Production Bug Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.1.0
status: stable
---

# BROWSER COMPATIBILITY AND PRODUCTION BUG HUNTER

I want you to perform an exhaustive, systematic, and evidence-first analysis of issues that surface only:

- in specific browsers
- on specific operating systems
- on specific devices
- in production builds
- on CDNs
- within serverless runtimes
- under differing locale/timezone configurations
- over slow or degraded networks
- under different filesystem behaviors
- following code minification
- following tree shaking
- across differing JavaScript/Web API implementations

Main goal:

> Identify genuine cross-browser, cross-platform, and production-only defects that local development environments conceal.

This is not:

- a generic browser support checklist
- an inventory of obsolete browsers
- a recommendation to support every browser ever created
- automatic injection of polyfills
- a superficial review of `caniuse` tables
- a routine frontend code review
- a generic production-readiness audit

The focus is on bugs arising from discrepancies between:

```text
development
vs
production
```

or:

```text
browser A
vs
browser B
```

or:

```text
OS A
vs
OS B
```

Priority:

**reproducibility > user impact > evidence > breadth**

It is better to discover 8 genuine production or browser bugs than 80 theoretical compatibility risks.

---

# 1. IDENTIFY TARGET ENVIRONMENTS

Before the analysis, determine:

- supported browser portfolio
- minimum version baselines if defined
- desktop vs mobile scope
- supported operating systems
- SSR vs CSR model
- build compilation target
- bundler architecture
- transpilation pipeline
- polyfill strategy
- deployment platform
- Node/runtime engine version
- Edge runtime if utilized
- serverless/function execution runtime
- CDN tier
- reverse proxy architecture
- filesystem assumptions

Inspect:

- `package.json`
- browserslist configuration
- build configs
- Babel configuration
- TypeScript target settings
- PostCSS configuration
- CSS build tooling
- framework configuration
- deployment specifications
- Dockerfile
- CI/CD pipelines
- environment configs

If target browsers are undocumented:

**SUPPORTED BROWSER MATRIX: NOT DEFINED**

Do not automatically assume support for legacy browsers.

---

# 2. CREATE ENVIRONMENT MATRIX

Classify relevant runtime targets.

For example:

| Layer | Variant |
|---|---|
| Browser | Chrome |
| Browser | Firefox |
| Browser | Safari |
| Browser | Edge |
| OS | Windows |
| OS | macOS |
| OS | Linux |
| Mobile | iOS Safari |
| Mobile | Android Chrome |
| Runtime | Node |
| Runtime | Edge |
| Environment | Development |
| Environment | Production |

Exclude platforms that are out of scope for the product.

---

# 3. DEVELOPMENT VS PRODUCTION

Identify all divergence between development and production modes.

Map:

```text
Development
↓
bundler/dev server
↓
source code
↓
runtime
```

versus:

```text
Production
↓
optimized build
↓
minification
↓
tree shaking
↓
chunking
↓
CDN/server
```

Hunt for defects that can only materialize in the production pipeline.

---

# 4. ENVIRONMENT GUARDS

Search for:

```text
NODE_ENV
development
production
localhost
127.0.0.1
```

For every conditional branch, verify:

- whether production executes distinct logic
- whether development bypasses remain accidentally active
- whether fallbacks function exclusively in local development

---

# 5. LOCALHOST ASSUMPTIONS

Search for hardcoded:

```text
localhost
127.0.0.1
http://localhost
```

Inspect:

- API URLs
- WebSocket endpoints
- callback endpoints
- OAuth redirect targets
- image host domains
- CORS origins
- webhook receiver references

---

# 6. HTTP VS HTTPS

Development frequently operates over unencrypted HTTP.

Production universally enforces HTTPS.

Inspect APIs that strictly require a secure context:

- service workers
- clipboard API
- camera access
- microphone access
- geolocation
- credential transmission

---

# 7. MIXED CONTENT

Search for production HTTPS pages attempting to fetch:

```text
http://
```

resources.

Browsers will block mixed content:

- active API calls
- image assets
- external scripts
- embedded media

depending on browser security policies.

---

# 8. SECURE COOKIES

Cookies marked with:

```text
Secure
```

behave differently on local HTTP environments compared to production HTTPS.

Verify development vs production cookie configurations.

---

# 9. COOKIE DOMAINS

Look for mismatches across:

```text
localhost
app.example.com
www.example.com
api.example.com
```

Inspect:

- domain scope
- path scope
- SameSite attributes
- Secure flags

---

# 10. SAME-SITE BEHAVIOR

Authentication that succeeds locally can collapse when the frontend and backend reside on distinct production origins.

Trace:

```text
frontend
↓
cross-origin request
↓
cookie transmission
↓
CORS headers
```

---

# 11. CORS

Development proxy servers often mask CORS misconfigurations.

Verify production direct cross-origin requests.

Look for:

- wildcard `*` conflicting with credentialed requests
- missing allowed origin headers
- dynamic preview domain rejections
- localhost-only whitelist configurations

---

# 12. DEV PROXIES

If the development server proxies requests:

```text
/api
→ localhost:3001
```

verify how production routes resolve that exact same path.

---

# 13. ORIGIN ASSUMPTIONS

Look for:

```ts
window.location.origin
```

or hardcoded origin resolution logic.

Evaluate:

- reverse proxy setups
- custom domain mappings
- preview deployment hosts
- CDN host rewrites

---

# 14. FORWARDED HEADERS

When running behind reverse proxies or CDNs, inspect usage of:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- host headers

Never trust these headers without proper upstream infrastructure verification.

---

# 15. BASE URL GENERATION

Verify absolute URL synthesis for:

- canonical links
- OAuth redirects
- transactional emails
- API requests
- asset URLs

The production host may differ from the immediate incoming request host behind a proxy.

---

# 16. BUILD-TIME VS RUNTIME ENVIRONMENT VARIABLES

Distinguish between environment variables evaluated:

- during compilation/build time
- during server runtime
- inside client browser bundles

Look for:

```text
env changed after build
↓
frontend bundle still has old value
```

---

# 17. CLIENT ENV EXPOSURE

Ensure server-only secrets are not bundled into client-side JavaScript via public environment prefixes or build-time variable replacements.

If a secret is uncovered:

- do not display the full value in reports
- mask it appropriately

---

# 18. MISSING ENVIRONMENT VARIABLES

A local `.env.local` file can mask missing environment variables in production.

Verify startup environment validation routines.

---

# 19. FALLBACK CONFIGURATION

Look for patterns like:

```ts
process.env.API_URL || "http://localhost:3000"
```

In production, an unconfigured variable can silently divert requests to localhost.

---

# 20. CASE SENSITIVITY

Windows filesystems are typically case-insensitive.

Linux production deployment environments are strictly case-sensitive.

Look for:

```ts
import Button from "./button"
```

when the filesystem entity is actually:

```text
Button.tsx
```

This compiles cleanly on Windows development workstations but crashes production Linux builds.

---

# 21. IMPORT CASE AUDIT

Check case accuracy repository-wide across:

- import paths
- file names
- directory names
- static asset references

---

# 22. STATIC ASSET CASING

Specifically inspect:

```text
/Logo.png
```

versus actual:

```text
/logo.png
```

---

# 23. PATH SEPARATORS

Look for Windows-specific hardcoded paths:

```text
C:\folder\file
```

or manual string joins using:

```text
"\\"
```

instead of platform-agnostic `path.join()` or `path.resolve()`.

---

# 24. UNIX PATH ASSUMPTIONS

Conversely, assumptions like:

```text
/tmp/file
```

may fail or behave unexpectedly on non-Unix runtimes.

---

# 25. FILESYSTEM PERSISTENCE

Local development filesystems are persistent.

Serverless cloud execution environments are ephemeral and read-only (except `/tmp`).

Look for:

```text
write file
↓
expect file later
```

within production request lifecycles.

---

# 26. TEMP DIRECTORY

If the runtime only provides a transient scratch filesystem, verify that the application never treats it as durable long-term storage.

---

# 27. CURRENT WORKING DIRECTORY

Look for code presuming a specific current working directory (`cwd`).

Build and deployment pipelines may invoke processes from divergent parent roots.

---

# 28. FILE PERMISSIONS

Development accounts often enjoy elevated permissions compared to unprivileged production containers.

Inspect:

- read permissions
- write permissions
- execution permissions

---

# 29. EXECUTABLE ASSUMPTIONS

Look for process invocations calling:

```text
ffmpeg
python
bash
sh
cmd.exe
powershell
```

Verify that the required binary is genuinely installed in the production container image.

---

# 30. SHELL DIFFERENCES

A script command valid in:

```text
bash
```

may immediately fail under:

```text
cmd.exe
```

and vice versa.

---

# 31. CROSS-PLATFORM `npm` SCRIPTS

Review `package.json` scripts for Unix-specific constructs:

```text
VAR=value command
rm -rf
cp
mv
```

If the development team includes Windows engineers, flag cross-platform script breakages.

---

# 32. LINE ENDINGS

CRLF vs LF discrepancies are less frequent, but impact:

- shell scripts
- generated files
- rigid custom parsers

Report only concrete, observed issues.

---

# 33. FILE ENCODING

Verify assumptions regarding UTF-8 encoding.

Particularly with:

- CSV file processing
- legacy third-party data feeds
- Windows-exported files

---

# 34. UNICODE

Test character handling for:

- accented characters (č, ć, š, ž, đ, etc.)
- emojis
- CJK ideograms
- combining diacritical marks

wherever user inputs or filenames pass through the system.

---

# 35. UNICODE NORMALIZATION

Two visually indistinguishable characters may possess divergent Unicode code point representations (NFC vs NFD).

Relevant for:

- usernames
- file lookup keys
- search indices
- database unique constraints

Do not report if the application domain does not ingest such inputs.

---

# 36. LOCALE

Browser and server locales frequently diverge.

Look for:

```ts
toLocaleString()
```

invoked without explicit locale arguments when deterministic, repeatable output is required.

---

# 37. SERVER VS CLIENT LOCALE

SSR hydration mismatch scenario:

```text
server locale = en-US
client locale = sr-RS
```

producing differing initial DOM markup and triggering hydration errors.

---

# 38. NUMBER FORMATTING

Check:

```text
1,234.56
```

versus:

```text
1.234,56
```

especially if formatted display strings are subsequently parsed back into numeric values.

---

# 39. DECIMAL SEPARATORS

Never parse localized display strings as authoritative machine-readable numbers.

---

# 40. DATE PARSING

Browsers and runtimes parse non-standard date strings inconsistently.

Look for:

```ts
new Date("25/09/2026")
```

or other non-ISO date string formats.

---

# 41. ISO DATES

Distinguish between date-only strings:

```text
2026-09-25
```

and full ISO UTC timestamps:

```text
2026-09-25T00:00:00Z
```

Observing how server and browser timezones alter rendered dates.

---

# 42. TIMEZONES

Development laptops and production servers rarely share identical timezone settings.

Look for implicit local time assumptions:

```ts
new Date()
getHours()
setDate()
```

in core business logic.

---

# 43. DAYLIGHT SAVING TIME

If scheduling or date arithmetic crosses daylight saving transitions, inspect edge calculation rules.

---

# 44. CURRENT DATE DURING BUILD

SSG/build pipelines invoking:

```ts
new Date()
```

freeze that timestamp at build time rather than reflecting the active request time.

---

# 45. RANDOM VALUES DURING BUILD

Similarly, inspect:

```ts
Math.random()
```

baked into pre-rendered static artifacts.

---

# 46. NODE VERSION DRIFT

Verify:

- local developer Node version
- `engines` field in `package.json`
- CI/CD container Node version
- production hosting runtime version

Version drift introduces unexpected runtime behavioral variances.

---

# 47. PACKAGE MANAGER VERSION

Lockfile stability depends on:

- npm
- pnpm
- yarn

version consistency.

Verify CI and production installation parity.

---

# 48. LOCKFILES

Production builds must install strictly from committed lockfiles.

Look for:

- multiple competing lockfiles
- git-ignored lockfiles
- installation commands omitting frozen-lockfile flags

---

# 49. OPTIONAL DEPENDENCIES

Native or optional dependencies may install successfully on one OS while failing silently on another.

---

# 50. NATIVE MODULES

Specifically inspect native packages:

- image processing libraries
- embedded SQLite drivers
- cryptographic modules
- canvas libraries
- sharp or similar C++ bindings

for OS and architecture runtime compatibility.

---

# 51. CPU ARCHITECTURE

When deployment or developer environments span:

- x64
- ARM64

verify pre-compiled native binaries.

Do not report if the project contains no native dependencies.

---

# 52. BROWSER API SUPPORT

Search repository-wide for modern Web APIs.

For example:

- Clipboard API
- Web Share API
- ResizeObserver
- IntersectionObserver
- BroadcastChannel
- Web Locks API
- File System Access API
- Notification API
- Web Bluetooth
- WebUSB

Verify support baselines and fallback implementations for each.

---

# 53. FEATURE DETECTION

Prefer robust feature detection:

```ts
if ("share" in navigator)
```

over brittle user-agent string checks wherever possible.

---

# 54. USER-AGENT SNIFFING

Search for:

```text
userAgent
navigator.userAgent
```

Inspect:

- what capability is being inferred
- whether regex patterns risk obsolescence
- whether standard feature detection provides a superior alternative

---

# 55. SAFARI

Carefully review features with historically idiosyncratic browser behavior, but avoid filing generic "Safari bugs".

Pinpoint the exact Web API or CSS property semantics.

---

# 56. IOS SAFARI

Verify where applicable:

- viewport sizing quirks
- fixed positioning bugs
- form input focus zooming
- PWA standalone display
- video playback restrictions
- media autoplay blocks
- file input handling
- safe area insets

---

# 57. FIREFOX

Inspect concrete Web API and CSS engine divergences only where the application relies on the relevant capability.

---

# 58. EDGE

Modern Microsoft Edge shares the Chromium engine, though enterprise policies and security controls may differ.

Do not treat it as a distinct browser engine without specific architectural cause.

---

# 59. WEBKIT PREFIXES

Search for vendor-prefixed CSS rules.

Verify whether standard fallbacks exist where required.

---

# 60. CSS SUPPORT

Identify modern CSS capabilities:

- container queries
- subgrid
- `:has()` pseudo-class
- `dvh` / `svh` / `lvh` units
- `color-mix()`
- native CSS nesting

Verify target browser support baselines before filing findings.

---

# 61. CSS FALLBACKS

If unsupported CSS merely causes minor aesthetic degradation without impairing functionality, assign a low severity.

---

# 62. FLEXBOX EDGE CASES

Inspect:

- `min-content` sizing
- overflow containment
- percentage height calculations
- nested flex containers

only where code structure suggests an authentic cross-engine defect.

---

# 63. GRID EDGE CASES

Apply the same rigor to CSS Grid edge cases.

---

# 64. FORM CONTROLS

Native form controls render and behave differently across browser engines.

Inspect custom styling applied to:

- select dropdowns
- date pickers
- number inputs
- checkboxes
- radio buttons

---

# 65. DATE INPUTS

Native `input type="date"` interfaces and browser support vary widely.

Never rely on native visual pickers for mandatory business logic validation.

---

# 66. NUMBER INPUTS

Browser engines diverge in how they handle:

- localized decimal separators
- stepper spinners
- non-numeric text entry
- mobile virtual keyboards

Server-side validation remains mandatory.

---

# 67. FILE INPUTS

Inspect:

- `accept` attribute filtering
- `multiple` selection behavior
- camera capture triggers
- mobile operating system interactions

---

# 68. CAMERA / MEDIA CAPTURE

When using `getUserMedia`, inspect:

- permission prompt lifecycles
- secure context constraints
- hardware availability guards
- browser compatibility fallbacks

---

# 69. CLIPBOARD

When using the Clipboard API, inspect:

- permission handling
- secure context requirements
- fallback mechanisms for unprivileged contexts

---

# 70. DOWNLOADS

The `download` anchor attribute and blob URL downloads carry platform-specific limitations.

Inspect if file download is a critical product capability.

---

# 71. BLOB URL LIFECYCLE

Verify the blob URL lifecycle:

```text
createObjectURL
↓
download/preview
↓
revokeObjectURL
```

---

# 72. FILESYSTEM ACCESS API

If the application utilizes the File System Access API, verify fallback behavior for unsupported browsers.

---

# 73. WEB SHARE API

Verify graceful fallback when Web Share is absent.

---

# 74. NOTIFICATIONS

Permission models differ fundamentally across operating systems and browser engines.

Do not assume desktop and mobile notification flows are identical.

---

# 75. WEB PUSH

Web push support depends heavily on browser, OS, and platform combinations.

If implemented, provide a concrete capability matrix analysis.

---

# 76. SERVICE WORKERS

Service worker availability alone is insufficient.

Verify the specific underlying capabilities used within the worker on each target platform.

---

# 77. INDEXEDDB

If relying on IndexedDB, inspect:

- private/incognito browsing constraints
- quota exhaustion error paths
- schema migration routines

Do not assert universal behavior without runtime validation.

---

# 78. LOCALSTORAGE

`localStorage` can throw security exceptions in restricted privacy modes or if quotas are exceeded.

Verify error boundary handling on critical paths.

---

# 79. THIRD-PARTY COOKIES

If integrations depend on third-party cookies, modern browser privacy protections (e.g. tracking prevention) will break them.

Trace the end-to-end authentication or integration flow.

---

# 80. OAUTH POPUPS

Popup-based authentication flows frequently break due to:

- aggressive popup blockers
- cross-origin window opener policies
- mobile browser tab behaviors

Verify that a full-page redirect fallback flow exists.

---

# 81. POPUP BLOCKERS

`window.open` must typically be invoked directly within an authentic user gesture context.

If invoked following an asynchronous promise resolution, browsers will suppress the popup.

---

# 82. NEW TAB BEHAVIOR

Verify `target="_blank"` link handling where opener security and user experience are critical.

Defer pure security vulnerabilities to the security audit.

---

# 83. HISTORY API

SPA client-side routers respond differently to:

- direct browser refreshes
- server fallback rewrites
- static hosting hosts

---

# 84. DIRECT ROUTE REFRESH

Classic production deployment bug:

```text
client navigation /dashboard works
↓
hard refresh /dashboard
↓
server returns 404
```

when the hosting provider is not configured for SPA rewrite fallbacks.

---

# 85. STATIC HOSTING REWRITES

If running client-side routers on static cloud storage, verify URL rewrite configurations.

---

# 86. BASE PATH CONFIGURATION

If the application is mounted on a subpath:

```text
/app/
```

verify asset loading, router basenames, links, service workers, and manifests.

---

# 87. TRAILING SLASHES

Hosting platforms differ in how they normalize:

```text
/page
/page/
```

Verify routing consistency.

---

# 88. CDN CACHING

CDNs cache responses according to different rules than local development servers.

Map:

- HTML documents
- static asset bundles
- API endpoints
- redirects
- error responses

---

# 89. CACHED HTML

Stale HTML paired with an updated asset manifest triggers version mismatch failures.

---

# 90. CDN QUERY PARAMETERS

Ensure CDN cache keys properly account for query parameters that alter response content.

---

# 91. `Vary` HEADERS

If responses vary based on:

- Accept-Encoding
- locale
- authentication
- device type

verify that CDN caching rules respect appropriate `Vary` semantics.

---

# 92. PROXY COMPRESSION

Do not add manual compression middleware if upstream reverse proxies or CDNs already compress payloads.

Check for double-compression anomalies or corrupted headers.

---

# 93. MINIFICATION DEFECTS

Production minification can break code relying on:

- `function.name`
- `class.name`
- source code formatting

Look for reflection or runtime introspection patterns.

---

# 94. FUNCTION NAME DEPENDENCY

Example defect:

```ts
fn.name === "SomeHandler"
```

which fails once identifiers are mangled during minification.

---

# 95. CLASS NAME DEPENDENCY

Similarly, verify whether business logic relies on `constructor.name`.

---

# 96. TREE SHAKING HAZARDS

Side-effect imports can be stripped if package manifests erroneously mark modules as `sideEffects: false`.

Report only where concrete runtime symptoms or risks exist.

---

# 97. MODULE INITIALIZATION ORDER

Circular module dependencies often manifest differently after bundling and tree-shaking optimizations.

---

# 98. ESM VS CJS INTEROPERABILITY

Verify module compatibility across:

- default imports
- named imports
- `require()`
- dynamic `import()`

particularly across Node and runtime versions.

---

# 99. DYNAMIC IMPORTS

Import paths that bundlers cannot statically analyze may resolve in development but crash in production bundles.

---

# 100. CASE-SENSITIVE DYNAMIC IMPORTS

Specifically verify casing in dynamically constructed import paths.

---

# 101. SOURCE MAP CONFIGURATION

If source map generation affects operational security or debugging capabilities, document the pattern.

Do not automatically classify public source maps as critical security vulnerabilities without threat context.

---

# 102. PRODUCTION ERROR HANDLING

Development error overlays often mask the fact that production users receive an unhandled blank screen.

Verify global React/framework error boundaries.

---

# 103. CHUNK LOAD FAILURES

Production code splitting frequently encounters:

```text
old page
↓
new deployment
↓
old chunk removed
↓
dynamic import
↓
ChunkLoadError
```

Verify graceful recovery handling.

---

# 104. RELOAD LOOPS

If chunk loading failures trigger automatic page reloads, verify that a loop detection guard prevents infinite reloading.

---

# 105. LAZY ROUTES

Verify what users see if a lazy-loaded route bundle fails to download.

---

# 106. NETWORK SPEED LATENCY

Fast localhost environments conceal:

- loading race conditions
- request timeouts
- skeleton layout shifts
- out-of-order request resolution

Mentally or programmatically test degraded network conditions.

---

# 107. NETWORK DISCONNECTION

Production users can drop connections mid-request.

Verify critical mutation pipelines.

---

# 108. DNS / UPSTREAM FAILURES

While external infrastructure failures cannot always be prevented, client-side behavior must remain graceful when endpoints become unreachable.

---

# 109. CORPORATE FIREWALLS

If an application depends on non-standard ports, custom WebSockets, or external third-party domains, enterprise firewalls may block traffic.

Report only if enterprise networks fall within product requirements.

---

# 110. WEBSOCKETS

Verify:

- reverse proxy WebSocket upgrade support
- secure `wss://` enforcement
- reconnect logic with backoff
- polling fallback mechanisms

---

# 111. SERVER-SENT EVENTS (SSE)

When using Server-Sent Events, inspect:

- proxy buffering behaviors
- gateway timeouts
- browser connection limits per origin

---

# 112. LONG POLLING

Inspect timeout configurations and proxy buffering interactions.

---

# 113. KEEPALIVE FETCH REQUESTS

Browser limits on `fetch(..., { keepalive: true })` during page unload can truncate analytics or save requests.

Never rely on page unload requests for critical persistence without fail-safe architectures.

---

# 114. `beforeunload`

Browser support and UX constraints on `beforeunload` dialogs vary significantly.

Verify actual browser behavior before relying on custom exit prompts.

---

# 115. PAGE LIFECYCLE

Mobile browser engines will suspend or terminate background tabs under memory pressure.

Inspect critical user state residing exclusively in memory.

---

# 116. BACK-FORWARD CACHE (BFCACHE)

BFCache restores previous pages from memory without executing a standard reload.

If the application displays sensitive authenticated state, verify that restore events refresh necessary state.

---

# 117. `pageshow` EVENT

Verify specific `pageshow` handlers (`event.persisted`) for BFCache state reconciliation.

---

# 118. MOBILE MEMORY PRESSURE

Mobile browsers aggressively discard tabs and state under RAM pressure.

Evaluate data-loss risks if user drafts are stored solely in volatile component memory.

---

# 119. APPLICATION BACKGROUNDING

Scenario:

```text
user starts action
↓
switches app
↓
browser suspends page
↓
returns later
```

Inspect:

- stale cached data
- broken timer assumptions
- expired session tokens

---

# 120. TIMERS IN BACKGROUND TABS

Browsers heavily throttle timers (`setTimeout`, `setInterval`) in inactive tabs.

Never depend on client-side intervals for authoritative scheduling or precise timing.

---

# 121. `setInterval` AS AN AUTHORITATIVE CLOCK

If an application uses interval ticks as an authoritative countdown clock, check for drift following tab deactivation.

---

# 122. PAGE VISIBILITY API

If polling or realtime connections are maintained, verify that inactive background tabs pause or throttle non-essential traffic.

---

# 123. SCREEN SIZE VS DEVICE TYPE

Never assume:

```text
small width = mobile device
```

Tablets, split-screen desktop windows, and resized browser viewports produce identical widths.

---

# 124. INPUT MODALITY ASSUMPTIONS

Never assume:

```text
desktop = mouse
mobile = touch
```

Hybrid laptops and touch-enabled desktop monitors are widespread.

---

# 125. POINTER EVENTS

When binding to pointer, mouse, and touch events simultaneously, look for duplicate action triggers.

Example defect:

```text
touchend
+
click
```

firing the same mutation twice in flawed implementations.

---

# 126. PASSIVE EVENT LISTENERS

Passive event listeners on touch and scroll events affect scroll performance and prohibit `preventDefault()`.

Report only where concrete bugs arise.

---

# 127. KEYBOARD LAYOUTS

Hotkeys bound to physical key values (`e.key` vs `e.code`) behave differently across international keyboard layouts.

Relevant for power-user and desktop productivity tools.

---

# 128. INPUT METHOD EDITORS (IME)

For search and text inputs, verify East Asian IME composition handling if the application intercepts `keydown` or triggers real-time search.

Do not report if out of scope for the target user base.

---

# 129. COMPOSITION EVENTS

Ensure Enter key handling does not accidentally submit forms or chat messages while an IME composition session is active.

---

# 130. CLIPBOARD COPY/PASTE

Custom clipboard write actions can fail due to browser permission constraints.

Provide accessible visual fallbacks on critical paths.

---

# 131. DRAG AND DROP

Inspect cross-browser differences in:

- file drops
- touch emulation
- `dataTransfer` payloads

Verify keyboard-accessible alternatives.

---

# 132. DOWNLOAD FILENAMES

Operating systems and browsers sanitize suggested download filenames differently.

Never depend on exact saved filenames for subsequent business logic.

---

# 133. CONTENT-DISPOSITION

Server `Content-Disposition` headers must be tested for proper Unicode filename encoding (RFC 5987 / RFC 6266).

---

# 134. MIME TYPES

Production web servers or CDNs may emit incorrect MIME types, prompting strict browser blocking.

Verify:

- JavaScript (`application/javascript` / `text/javascript`)
- CSS (`text/css`)
- WebAssembly (`application/wasm`)
- Web fonts

---

# 135. NOSNIFF

When `X-Content-Type-Options: nosniff` is enforced, an incorrect MIME type becomes a blocking production bug.

---

# 136. WEB FONT CORS

Web fonts loaded from external origins strictly require valid cross-origin CORS headers.

---

# 137. IMAGE DOMAINS

Production image optimization pipelines will reject external domains not explicitly allowlisted in configuration.

---

# 138. REMOTE ASSETS

Verify domain allowlists for external assets and media.

---

# 139. CONTENT SECURITY POLICY (CSP)

Local development rarely enforces the strict CSP rules applied in production.

Inline scripts or styles functioning locally will be blocked in production.

Trace specific blocked resources.

---

# 140. NONCE / HASH CSP

If the framework generates CSP nonces, verify compatibility with SSR streaming.

Defer comprehensive CSP audits to the security audit.

---

# 141. AD BLOCKERS

If critical application functionality calls endpoints named:

```text
/analytics
/ads
/tracker
```

content and ad blockers will intercept and abort them.

Report only if primary product features depend on those requests.

---

# 142. PRIVACY EXTENSIONS

Similarly, evaluate integrations blocked by privacy extensions restricting third-party storage.

---

# 143. JAVASCRIPT DISABLED

Do not demand that a modern web application function with JavaScript disabled unless specifically required.

Evaluate public SEO content where applicable.

---

# 144. BROWSER EXTENSION INTERFERENCE

Do not attempt to defend against arbitrary browser extension DOM tampering.

However, critical applications should not crash catastrophically due to known extension DOM injections.

---

# 145. AUTOMATIC TRANSLATION

Browser translation features modify DOM text nodes directly.

If application code relies on exact visible text strings for DOM selectors or logic, flag this architectural risk.

---

# 146. PASSWORD MANAGERS

Form markup must adhere to standard semantic conventions so password managers and autofill systems operate cleanly.

---

# 147. AUTOFILL

Browser autofill can populate fields without firing standard synthetic change events in certain frameworks.

Test critical login and checkout forms.

---

# 148. PRINT STYLESHEETS

Only if printing or exporting is an advertised feature.

Otherwise:

**NOT APPLICABLE**

---

# 149. PDF GENERATION

If PDF generation relies on browser rendering (e.g. headless Chrome), verify engine-specific layout fidelity.

---

# 150. BROWSER EXTENSION APIS

If the product itself is a browser extension, this audit must explicitly evaluate:

- Chromium
- Firefox
- Manifest V3 vs V2
- Permission declarations

Otherwise:

**NOT APPLICABLE**

---

# 151. WEBASSEMBLY

If WebAssembly is used, inspect:

- MIME type serving
- target browser engine support
- thread and SIMD prerequisites
- cross-origin isolation headers

---

# 152. SHAREDARRAYBUFFER

If using `SharedArrayBuffer`, verify mandatory cross-origin isolation headers (`COOP`/`COEP`) and browser support.

---

# 153. CROSS-ORIGIN ISOLATION

`COOP` and `COEP` enforcement can inadvertently block unconfigured third-party embeds or images.

---

# 154. FEATURE FLAGS

Production feature flag configurations frequently diverge entirely from local development states.

Map critical feature flags.

---

# 155. STALE FEATURE FLAGS

If clients cache feature flag states, determine how long obsolete behavior persists.

---

# 156. BUILD FLAGS

Build-time compile flags require a fresh deployment to update.

Do not mistake them for dynamic runtime configuration.

---

# 157. PREVIEW ENVIRONMENTS

Preview deployment environments often feature:

- different domain origins
- divergent OAuth callback registrations
- separate API backends
- differing robots and CORS rules

Never treat a passing preview build as conclusive proof of production health.

---

# 158. STAGING DRIFT

Compare configuration across:

```text
development
staging
production
```

Look for environment discrepancies that alter runtime behavior.

---

# 159. PRODUCTION DATA SHAPES

Development test fixtures are typically clean and well-formed.

Real production data contains:

- null values
- extremely long strings
- diverse Unicode characters
- massive array payloads
- legacy schema artifacts

This represents a production compatibility failure even when not browser-specific.

---

# 160. LEGACY DATA

Ensure newly deployed code remains backwards compatible with legacy database records.

---

# 161. LEGACY CLIENTS

Users can keep open browser tabs across new production releases.

Verify API contract compatibility between old frontends and new backends.

---

# 162. LEGACY SERVICE WORKERS

If a PWA is implemented, defer deep auditing to the PWA audit, but flag cross-version compatibility defects here.

---

# 163. DATABASE CONNECTION RUNTIMES

When moving from a single persistent local Node process to serverless compute, database connection pooling behavior changes drastically.

---

# 164. GLOBAL IN-MEMORY STATE

Look for:

```ts
const cache = new Map()
```

treated as an authoritative single source of truth on the server.

In serverless or multi-instance clusters, memory is not globally synchronized.

---

# 165. SINGLE-INSTANCE ASSUMPTIONS

Development runs on a single server process.

Production environments scale horizontally across multiple instances.

Look for in-memory:

- mutexes/locks
- request counters
- rate limiters
- session stores
- task queues

---

# 166. LOCAL LOCKS

An in-memory mutex fails to protect concurrent operations across multiple production instances.

---

# 167. DUPLICATE CRON JOBS

If every application instance startup registers scheduled jobs, horizontal autoscaling will trigger duplicate job executions.

---

# 168. UN-AWAITED BACKGROUND TASKS

Serverless functions terminate execution as soon as the HTTP response finishes.

Look for:

```ts
sendResponse()
doAsyncWorkWithoutAwait()
```

which will be abruptly frozen or killed in serverless environments.

---

# 169. GATEWAY TIMEOUTS

Local development servers do not enforce strict 15-30 second edge request timeouts.

Identify long-running operational bottlenecks.

---

# 170. PAYLOAD SIZE LIMITS

Cloud platforms and API gateways enforce body and upload size limits (e.g. 4.5MB).

Verify file upload limits against target infrastructure specifications.

---

# 171. RESPONSE SIZE LIMITS

Apply the same scrutiny to massive server responses.

---

# 172. EDGE RUNTIME CONSTRAINTS

If routes execute on Edge runtimes, verify compatibility:

- Node.js core API absences
- filesystem absences
- native binary module incompatibilities
- database driver constraints

---

# 173. NODE-ONLY PACKAGES

Packages that build cleanly may throw fatal runtime errors when invoked inside an Edge runtime.

---

# 174. SERVER ACTION / FUNCTION REGIONS

If compute functions and database clusters reside in distant geographical regions, production network latency increases significantly.

---

# 175. CUSTOM DOMAINS AND DNS

If routing depends on host headers or domain matching, verify custom domain configurations independently of platform-generated URLs.

---

# 176. EMAIL VERIFICATION LINKS

Generated transactional email links must resolve to the authoritative production domain, never `localhost` or preview URLs.

---

# 177. WEBHOOK CALLBACKS

Verify public webhook receiver URLs against production domain configurations.

---

# 178. OAUTH CALLBACK URLS

OAuth identity providers require exact redirect URI allowlisting.

A working local callback provides no guarantee that production redirect URIs are registered.

---

# 179. CSP REPORTING

Ensure production CSP violations are reported and testable in staging environments where feasible.

---

# 180. LOGGING INFRASTRUCTURE

Production logging layers may serialize objects differently or silence log levels.

Ensure critical error handling does not depend on `console.log` side effects.

---

# 181. ERROR MASKING

Production environments suppress stack traces.

Client UI components must never rely on parsing development error message strings.

---

# 182. SOURCE MAP PIPELINES

If production telemetry and APM depend on source maps, verify symbol upload pipelines.

---

# 183. RUNTIME FEATURE DETECTION

For every optional Web API, verify:

```text
supported
↓
normal path

unsupported
↓
fallback
```

---

# 184. POLYFILL AUDIT

Map the application's polyfill strategy.

Look for:

- missing polyfills for declared target browsers
- conflicting global polyfills
- obsolete legacy polyfills bloating bundle payloads unnecessarily

Do not flag a package merely because it is mature.

---

# 185. TRANSPILATION TARGETS

Ensure compiler output syntax aligns with declared target browser versions.

If the build outputs modern syntax that target engines fail to parse, report a critical compatibility bug.

---

# 186. THIRD-PARTY PACKAGE BROWSER SUPPORT

External dependencies may deprecate older browser engines before the core application does.

Verify dependency syntax compatibility against target baselines.

---

# 187. CSS AUTOPREFIXING

If targeting browser engines requiring vendor prefixes, verify PostCSS and Autoprefixer configurations.

Do not inject manual CSS prefixes if build tooling handles it automatically.

---

# 188. JAVASCRIPT SYNTAX VS RUNTIME APIS

Distinguish syntax transpilation from runtime API availability.

Babel or TypeScript can transpile syntax:

```text
optional chaining (?.)
```

but will not polyfill global runtime methods automatically:

```text
structuredClone()
```

---

# 189. `structuredClone`

If used, verify target browser support baselines or fallback logic.

---

# 190. `crypto.randomUUID`

Similarly, check support and secure context requirements.

---

# 191. `Intl` APIS

Advanced internationalization APIs have staggered browser adoption.

Verify:

- `Intl.Segmenter`
- `Intl.DisplayNames`
- `Intl.RelativeTimeFormat`

---

# 192. `URLPattern` API

Verify target support before relying on native `URLPattern`.

---

# 193. OBSERVER APIS

Verify:

- `IntersectionObserver`
- `ResizeObserver`
- `MutationObserver`

against declared target baselines.

---

# 194. HTML `<dialog>` ELEMENT

If using native `<dialog>`, verify browser support and backdrop polyfill requirements.

---

# 195. POPOVER API

Verify support baselines and fallback strategies for the native HTML Popover API.

---

# 196. VIEW TRANSITIONS API

If relying on the View Transitions API, verify graceful degradation when unsupported.

---

# 197. CSS `:has()` SELECTOR

Verify engine support baselines.

---

# 198. CONTAINER QUERIES

Similarly verify CSS Container Queries against target environments.

---

# 199. BROWSER MATRIX TESTING

If automated E2E test suites exist, inspect which engines are actively executed:

```text
Chromium
Firefox
WebKit
```

If tests execute solely on Chromium:

do not claim verified cross-browser compatibility.

---

# 200. MOBILE TEST MATRIX

Inspect whether automated tests evaluate:

- iOS WebKit behavior
- Android Chromium behavior

where applicable.

---

# 201. VISUAL REGRESSION TESTING

A visual regression test passing on one engine does not guarantee pixel-identical rendering on others.

---

# 202. PRODUCTION BUILD TESTING

Essential mandate:

Where tooling permits, test against:

```text
production build
↓
production server
↓
critical user flows
```

Never base a compatibility audit exclusively on development server execution.

---

# 203. CLEAN INSTALLATION

Execute clean dependency installations only where safe and accessible.

Document package manager and runtime details.

---

# 204. BUILD VERIFICATION

If you cannot execute a production build:

```text
PRODUCTION BUILD: NOT VERIFIED
```

---

# 205. PREVIEW / STARTUP

If the framework exposes:

```text
build
start
```

evaluate the compiled artifact directly wherever possible.

---

# 206. BROWSER AUTOMATION

Where tooling allows, validate critical flows across multiple browser engines.

Priority:

- authentication
- navigation
- complex forms
- file operations
- critical transactions

---

# 207. DEVTOOLS CONSOLE

Search for engine-specific:

- errors
- warnings
- blocked asset loads
- CSP violations
- CORS rejections
- React hydration mismatches

---

# 208. NETWORK PANEL INSPECTION

Inspect:

- failed requests
- MIME type mismatches
- redirect chains
- CORS preflight failures
- cache headers
- chunk loading failures

---

# 209. SERVER ERROR LOGS

Production-only bugs often surface with client symptoms but stem from backend root causes.

Trace both ends of the wire.

---

# 210. FINDING FORMAT

Every serious finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Environment:
Browser:
OS:
Runtime:
Build mode:

Feature/Route:
File:
Relevant code/config:

Problem:

Evidence:

Why development does not expose it:

Reproduction:

Expected behavior:

Actual behavior:

Affected users/environments:

Impact:

Root cause:

Recommended remediation:

Cross-browser fallback:

Verification matrix:

Regression test:

Complexity:
XS / S / M / L / XL
```

If a value cannot be verified:

**NOT VERIFIED**

---

# 211. SEVERITY

Use:

## P0 - CRITICAL

- critical security or data-integrity defect surfacing in production
- catastrophic cross-user data leakage or irrecoverable data loss

## P1 - HIGH

- application or primary feature broken in a major supported browser
- production-only failure breaking a core user flow
- production deployment fails to boot reliably
- severe authentication, cookie, or CORS blockage

## P2 - MEDIUM

- important feature failing across a subset of supported environments
- confirmed production bug with an available workaround

## P3 - LOW

- localized browser or platform bug on secondary functionality

## P4 - IMPROVEMENT

- compatibility optimization without an existing failure

---

# 212. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

reproduced in the specific target environment or irrefutably demonstrated through configuration.

MEDIUM:

strong code/config evidence, but the target runtime was not executed directly.

LOW:

depends on unverified browser/platform specifics.

---

# 213. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 214. SUPPORT STATUS

For browser-specific findings, state:

```text
Browser support:
SUPPORTED TARGET
UNSUPPORTED TARGET
TARGET NOT DEFINED
```

A bug in a browser engine explicitly out of scope does not carry the same priority as one in a supported target.

---

# 215. FALSE-POSITIVE PREVENTION

Before confirming a finding, review:

1. target browser support matrix
2. framework behavior
3. transpilation pipeline
4. polyfill inclusions
5. component library internals
6. deployment configuration
7. CDN/proxy rules
8. runtime engine version
9. native browser behavior
10. production build outputs
11. automated test suites

Do not report an issue solely because a modern Web API is invoked.

---

# 216. DO NOT MODIFY CODE

During the audit:

- do not inject polyfills
- do not edit browserslist
- do not modify build targets
- do not alter CDN headers
- do not modify CORS configurations
- do not alter runtime configurations
- do not patch dependencies

Complete the audit first.

---

# 217. OUTPUT - BROWSER_PRODUCTION_COMPATIBILITY_AUDIT.md

Structure the final audit report as follows:

## 1. Executive Summary

- technology stack
- defined browser support scope
- deployment model
- primary cross-browser risks
- primary production-only risks
- runtime verification coverage

## 2. Browser Support Matrix

| Browser/Platform | Targeted | Tested | Result |
|---|---|---|---|

## 3. Environment Matrix

## 4. Development vs Production Differences

## 5. Build & Bundling Audit

## 6. Environment Variables Audit

## 7. Filesystem / OS Compatibility

## 8. Browser API Compatibility

## 9. CSS Compatibility

## 10. Forms & Input Compatibility

## 11. Auth / Cookie / CORS Compatibility

## 12. Routing / Hosting Compatibility

## 13. CDN / Cache Compatibility

## 14. Runtime Compatibility

## 15. Node / Edge / Serverless Audit

## 16. Locale / Date / Time Audit

## 17. Mobile Browser Audit

## 18. Production Data Compatibility

## 19. Dependency Compatibility

## 20. Existing Cross-Browser Tests

## 21. Findings Summary

| ID | Severity | Environment | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P0 Findings

## 23. P1 Findings

## 24. P2 Findings

## 25. P3 Findings

## 26. P4 Improvements

## 27. Things Done Well

## 28. Unsupported / Out-of-Scope Platforms

## 29. Unknown / Not Verified

## 30. Remediation Roadmap

---

# 218. WINDOWS TO LINUX PASS

If development involves Windows and production runs on Linux, re-examine:

- path casing
- path separators
- shell commands
- executable binary names
- file permissions
- line endings
- filesystem persistence

---

# 219. LOCAL TO SERVERLESS PASS

Simulate:

```text
one persistent local Node process
↓
many ephemeral production instances
```

Ask:

- what lives in process memory
- what is written to local disk
- which lock is process-local
- which scheduled job assumes a single instance

---

# 220. CHROME TO SAFARI PASS

For critical browser features, re-examine only explicitly utilized Web APIs and CSS features.

Do not generate an unfocused list of historical Safari grievances.

---

# 221. DESKTOP TO MOBILE BROWSER PASS

Ask:

- does the Web API exist on mobile browsers
- does the permission model work on mobile
- do popup flows succeed
- does the file picker function
- does mobile background tab suspension disrupt the flow

---

# 222. DEV TO PROD BUILD PASS

For every critical feature, ask:

> Could code splitting, minification, environment variable inlining, or tree shaking alter this behavior?

If no concrete technical rationale exists:

do not invent a finding.

---

# 223. FAST NETWORK TO SLOW NETWORK PASS

Ask:

> What race condition or timeout assumption becomes visible only when a request takes significantly longer?

---

# 224. SINGLE TAB TO LONG-LIVED TAB PASS

Simulate a user leaving the application open for hours or days.

Inspect:

- authentication token expiration
- newly deployed release versions
- stale CDN and cache storage
- WebSocket reconnection logic
- throttled timer intervals
- BFCache restoration

---

# 225. OLD CLIENT TO NEW BACKEND PASS

Critical during continuous deployment workflows.

Ask:

> Can yesterday's client bundle communicate safely with today's newly deployed backend?

Verify:

- required request fields
- new enum values
- removed endpoints
- modified response payloads

---

# 226. NEW CLIENT TO OLD BACKEND PASS

During rolling zero-downtime deployments, the inverse is equally probable.

Verify forward and backward compatibility.

---

# 227. PRODUCTION ERROR PASS

Deliberately analyze what users observe when:

- a chunk bundle fails to download
- an API CORS check fails
- an environment variable is absent
- a static asset returns 404
- a browser API is missing
- an auth cookie is omitted

Never accept an unhandled blank screen as an acceptable failure mode.

---

# 228. DIRECT URL PASS

For every primary SPA route, mentally test:

```text
paste URL into fresh browser
↓
Enter
```

Never evaluate client-side router navigation in isolation.

---

# 229. PRIVATE BROWSING PASS

If the application depends significantly on local persistence, evaluate private/incognito browsing constraints.

If unverified at runtime:

**NOT VERIFIED**

---

# 230. STRICT PRIVACY PASS

For authentication and third-party integrations, evaluate browser configurations blocking third-party cookies and storage.

Only where the application architecture depends on it.

---

# 231. SECOND PASS

After the environment passes, re-walk every finding as its own skeptic:

- reproduce it in the production build on a target browser or runtime, or state exactly why it could not be reproduced
- check whether feature detection, a polyfill, the transpilation target, a CSS fallback, a proxy or a platform setting already neutralizes it
- confirm that the affected browser, device or runtime is in the supported target matrix
- look for hidden paths: the same API or CSS feature used elsewhere, service workers, cached chunks from an older deploy, third-party scripts, embedded webviews
- check timing and scale: long-lived tabs, slow or flaky networks, a deploy during an open session, several tabs of the same user
- check that the proposed fix does not add unnecessary polyfills, bundle weight or legacy burden

A finding that cannot be tied to a supported environment and a concrete execution path is downgraded to THEORETICAL or NOT VERIFIED.

---

# 232. FINAL QUALITY GATE

Before returning your final response, verify:

- target browser matrix was established before assigning severity
- unsupported browsers were not prioritized over supported targets
- development and production were evaluated independently
- production build tests were not substituted with dev server runs
- browser API findings verified feature detection and polyfills
- CSS findings checked actual target engine support baselines
- Windows vs Linux discrepancies were analyzed where applicable
- local filesystems were not assumed persistent in serverless runtimes
- process memory was not assumed shared across server instances
- CORS defects were not asserted from source inspection alone if proxies resolve them
- cookie defects verified domain, SameSite, and Secure scopes
- date and locale defects detailed concrete execution flows
- legacy-client to new-backend compatibility was evaluated
- chunk deployment mismatches were evaluated
- theoretical concerns were not reported as confirmed bugs
- every P1/P2 finding names the affected environment
- recommendations do not introduce unnecessary polyfills or legacy burdens

---

# FINAL RULE

I do not want generic reports like:

> Test the application in Chrome, Firefox, and Safari and add necessary polyfills.

That is not a compatibility audit.

I am hunting for concrete failure mechanisms:

```text
Windows development
↓
filesystem import is case-insensitive
↓
import "./button"
↓
actual file Button.tsx
↓
Linux production build
↓
module not found
```

or:

```text
local development
↓
frontend and API same-origin through dev proxy
↓
cookies work
↓
production frontend and API on different origins
↓
SameSite/CORS config incompatible
↓
login appears broken only in production
```

or:

```text
production v1 page remains open
↓
v2 deployment removes old lazy chunk
↓
user opens rarely-used feature
↓
browser requests old chunk
↓
404
↓
feature crashes
```

or:

```text
server renders date using UTC
↓
browser renders same value using local timezone
↓
different visible text
↓
hydration mismatch
```

or:

```text
local persistent Node process
↓
in-memory rate limit works
↓
production has multiple serverless instances
↓
each instance has its own counter
↓
effective limit can be bypassed
```

These are the precise defects you must uncover.

Think through the boundaries between:

- browser rendering engines
- operating systems
- filesystems
- development environments
- production optimized builds
- persistent vs ephemeral runtimes
- single-process vs multi-instance topologies
- localhost vs production domain origins
- high-speed vs degraded networks
- newly deployed vs legacy client tabs
- divergent locale and timezone configurations

If a target environment could not be executed:

**NOT VERIFIED.**

If a browser engine is out of scope:

explicitly state that the finding is outside the supported target scope.

If it is merely an optimization:

**P4 - IMPROVEMENT.**

It is better to discover 7 authentic production-only bugs than to generate a massive catalog of theoretical browser discrepancies.

The objective is a forensically rigorous compatibility audit exposing everything that "works on my machine" locally, but will break the instant the application leaves the developer's workstation.
