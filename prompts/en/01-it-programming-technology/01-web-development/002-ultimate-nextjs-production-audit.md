---
id: UPL-IT-002
number: 2
slug: ultimate-nextjs-production-audit
title: Ultimate Next.js Production Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.0.0
status: stable
---

# ULTIMATE NEXT.JS PRODUCTION AUDIT

I want you to perform a **maximally deep, systematic, version-aware, and evidence-first analysis of the entire Next.js project**.

This is not a generic code review and not a list of Next.js best practices.

Treat this task as a combination of:

- senior Next.js architecture review
- React architecture review
- Server Components / Client Components audit
- Server Actions audit
- Route Handlers / API audit
- caching and rendering audit
- authentication and authorization audit
- security audit
- performance audit
- Core Web Vitals analysis
- production-readiness audit
- Vercel/serverless audit where relevant
- SEO audit
- accessibility review
- PWA audit if applicable
- test coverage analysis
- reliability audit
- observability review
- deployment and CI/CD review
- cross-file and cross-runtime forensics

Main objective:

> Determine how the Next.js application truly operates from browser to server and database, identify confirmed issues and risks, distinguish bugs from improvements, and assess whether the project is ready for serious production.

Priority:

**accuracy > evidence > depth > number of findings.**

Do not invent issues to make the audit look more detailed.

Do not report generic Next.js recommendations unless there is a concrete reason in this project.

---

# 0. FIRST DETERMINE THE ACTUAL NEXT.JS VERSION

Before conducting serious analysis, establish:

- Next.js version
- React version
- Node.js/runtime requirements
- package manager
- App Router or Pages Router
- whether both routers coexist
- TypeScript version
- deployment target
- hosting platform
- ORM/database layer
- auth system
- caching/data-fetching libraries
- UI framework
- test frameworks

Inspect at least:

- `package.json`
- lockfile
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `middleware.*` or corresponding proxy layer
- `app/`
- `pages/` if present
- `src/`
- `public/`
- env configuration
- deployment configuration
- GitHub Actions / CI if present

**Do not use the behavior of an older Next.js version as evidence for a newer version.**

If framework semantics changed between versions and a conclusion depends on it:

1. determine project version
2. verify the behavior of that version
3. only then construct the finding

Framework behavior that is correct by design is not a bug.

---

# 1. MAP NEXT.JS ARCHITECTURE BEFORE REPORTING FINDINGS

Do not start with findings.

First map the system.

Establish:

- root layout
- nested layouts
- route groups
- pages
- dynamic routes
- catch-all routes
- parallel routes
- intercepting routes if present
- loading boundaries
- error boundaries
- not-found handling
- Server Components
- Client Components
- Server Actions
- Route Handlers
- middleware/proxy
- authentication
- authorization
- database layer
- external API integrations
- background jobs
- webhooks
- storage
- analytics
- monitoring
- PWA/service worker
- sitemap/robots
- localization
- deployment infrastructure

Build the actual high-level flow, e.g.:

```text
Browser
↓
Next.js routing
↓
Server Component
↓
service/business layer
↓
ORM
↓
database
↓
RSC payload / HTML
↓
hydration
↓
Client Components
```

If the application uses a different architecture, document what actually exists.

---

# 2. SERVER COMPONENTS VS CLIENT COMPONENTS

This is one of the primary pillars of the audit.

Map the Client Component boundaries.

Search the project for:

```text
"use client"
'use client'
```

For every major Client Component, determine why it must be client-side.

Look for:

- unnecessarily large Client Component subtrees
- `use client` placed too high in the tree
- server-capable components converted to client due to a single small interactive slice
- unnecessary JavaScript shipped to the browser
- server-only data passed down to client
- serialization issues
- unsafe data exposure
- duplicated server/client fetching
- hydration mismatches
- client-side fetch that could be server-side
- server-side computation unnecessarily performed in the browser

Check for the inverse problem as well:

- component using browser APIs in a Server Component context
- `window`
- `document`
- `localStorage`
- `sessionStorage`
- browser-only libraries

Distinguish:

**BUG**

from

**PERFORMANCE / ARCHITECTURE IMPROVEMENT**.

Do not report `use client` merely because it exists.

---

# 3. REACT SERVER COMPONENT DATA FLOW

For critical pages, trace the complete data pipeline.

For example:

```text
request
↓
route
↓
layout
↓
page
↓
Server Component
↓
data access
↓
database/API
↓
serialization
↓
Client Component
↓
interactive state
```

Look for:

- redundant fetching
- same data loaded at multiple levels
- waterfalls
- sequential awaits that could be concurrent
- unnecessary blocking of render
- oversized RSC payloads
- passing large objects to Client Components
- excessive data queried from DB/API
- fetching that depends on client-only effects causing late-loading cascades

Do not optimize parallelization if operations genuinely depend on each other.

---

# 4. SERVER ACTIONS AUDIT

Locate all Server Actions.

For every critical action verify:

- authentication
- authorization
- ownership
- tenant isolation
- input validation
- schema validation
- server/client trust boundary
- business invariants
- database transaction
- idempotency
- duplicate submission
- error handling
- redirect/revalidation behavior
- cache invalidation
- sensitive return values

Treat all browser input as untrusted.

Specifically check that Server Actions do not trust client-supplied values such as:

```text
userId
ownerId
tenantId
role
isAdmin
price
total
status
permissions
subscriptionTier
```

whenever they can be reliably derived on the server.

Frontend visibility controls are not authorization.

If the UI hides a button but the Server Action permits the operation, report a server-side defect.

---

# 5. ROUTE HANDLERS AND API

Map all critical:

```text
GET
POST
PUT
PATCH
DELETE
```

Route Handlers/API endpoints.

For each relevant endpoint check:

- auth
- authorization
- ownership
- tenancy
- request validation
- query params
- headers
- body
- content type
- response shape
- status codes
- excessive data exposure
- mass assignment
- rate limiting
- idempotency
- pagination
- error leakage
- timeout
- external API failure
- database failure

Specifically seek asymmetry:

```text
GET checks ownerId
DELETE does not check ownerId
```

or:

```text
UI has a role guard
API lacks it
```

or:

```text
POST validates schema
PATCH accepts arbitrary object
```

---

# 6. AUTHENTICATION

Map the entire auth flow:

```text
login
→ provider/credentials
→ validation
→ session/token
→ cookie
→ middleware/proxy
→ server component/action/API
→ authorization
```

Verify:

- registration
- login
- logout
- password reset
- email verification
- OAuth
- session creation
- session validation
- token refresh
- token expiration
- cookie flags
- HttpOnly
- Secure
- SameSite
- session fixation
- enumeration
- brute-force protection
- callback/redirect validation

Do not assume middleware automatically secures server operations.

Trace every critical write path to actual authorization controls.

---

# 7. AUTHORIZATION

Specifically check:

- IDOR
- broken access control
- horizontal privilege escalation
- vertical privilege escalation
- role bypass
- ownership bypass
- tenant escape
- admin-only operations
- destructive actions
- billing/subscription operations

For important resources, construct a CRUD matrix:

| Resource | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|

Verify that each write path enforces consistent authorization logic.

A single protected endpoint does not guarantee all access paths to the same resource are secured.

---

# 8. NEXT.JS CACHING AUDIT

Analyze this with extreme care.

Establish the actual behavior of the project's Next.js version regarding:

- server `fetch`
- route caching
- page caching
- static rendering
- dynamic rendering
- revalidation
- tag-based invalidation
- path-based invalidation
- request memoization
- application-level caching
- third-party caching layers

Inspect relevant APIs and configurations.

Look for:

- stale user data
- stale permissions
- stale dashboard
- wrongly cached authenticated content
- cross-user data leakage
- cache failing to invalidate after mutation
- overly aggressive invalidation
- needlessly fully dynamic routes
- accidentally static data that must be fresh
- duplicate fetch
- cache stampede risk
- inconsistent cache across multiple write paths

For every cache finding, explain:

```text
WRITE
↓
what changes
↓
which cache remains
↓
who subsequently reads stale data
↓
user-visible consequence
```

Do not rely on obsolete Next.js caching assumptions.

---

# 9. STATIC VS DYNAMIC RENDERING

For essential routes, classify whether they are:

- static
- dynamic
- prerendered
- request-time rendered
- client-rendered
- hybrid

Check:

- whether rendering mode matches data requirements
- accidental dynamic rendering
- accidental static rendering
- user-specific data in wrong rendering model
- needlessly lost static optimization
- runtime dependencies unexpectedly altering rendering behavior

Do not enforce static rendering where dynamic behavior is legitimate.

---

# 10. STREAMING, SUSPENSE AND LOADING

If the project uses:

- Suspense
- streaming
- `loading.*`
- async Server Components

verify:

- whether slow sections stream in isolation
- whether one slow query blocks the entire page
- nested waterfalls
- poorly placed Suspense boundaries
- layout shifts
- flicker
- redundant loaders
- inconsistent loading states

Evaluate real user experience under slow network conditions.

---

# 11. ERROR BOUNDARIES

Inspect:

- `error.*`
- `global-error.*`
- route-level error handling
- server errors
- client errors
- API errors

Look for:

- missing error states
- generic failure without actionable recovery
- infinite retries
- stale UI after failed mutations
- sensitive error leakage
- stack trace exposure
- errors that are silently logged
- errors leaving partial database state

---

# 12. NOT-FOUND AND ROUTING EDGE CASES

Inspect:

- `not-found.*`
- dynamic params
- invalid IDs
- malformed slugs
- deleted resources
- unauthorized vs non-existent resources
- redirect behavior

Look for:

- wrong HTTP status
- soft 404
- redirect loops
- information leakage
- route collisions
- invalid dynamic params triggering 500s

---

# 13. MIDDLEWARE / PROXY AUDIT

If middleware or an equivalent request interception layer exists, verify:

- matcher
- excluded routes
- static assets
- API routes
- locale routing
- authentication
- redirects
- rewrites
- security assumptions
- runtime compatibility

Specifically look for:

- protected route not covered by matcher
- public route accidentally locked down
- redirect loops
- auth verified only in middleware without server-side validation
- expensive operations executed on every single request

Middleware is never a standalone, sufficient authorization layer.

---

# 14. DATABASE AND ORM

Trace data access from Server Components, Server Actions, and Route Handlers down to the database.

Check:

- schema
- relations
- indexes
- constraints
- transactions
- N+1 queries
- unbounded queries
- overfetching
- pagination
- ordering
- race conditions
- unique constraints
- tenant filtering
- delete cascades
- connection handling

If deployed serverless, check:

- connection assumptions
- pooling
- connection exhaustion
- long transactions
- runtime compatibility

Pay special attention to business invariants enforced only in TypeScript code but lacking DB constraints during concurrent writes.

---

# 15. SECURITY AUDIT

Check where relevant:

- XSS
- stored XSS
- DOM XSS
- CSRF
- SSRF
- SQL injection
- command injection
- path traversal
- open redirects
- header injection
- unsafe URL fetching
- unsafe HTML rendering
- prototype pollution
- malicious uploads
- auth bypass
- IDOR
- excessive data exposure
- secret exposure

Search for:

```text
dangerouslySetInnerHTML
innerHTML
eval
exec
spawn
fetch
redirect
headers
cookies
process.env
NEXT_PUBLIC_
```

A search match is not automatically a finding.

Analyze context.

---

# 16. ENVIRONMENT VARIABLES

Map all environment variables.

For each, determine:

- server-only or client-visible
- where used
- whether documented
- whether validated
- behavior when missing
- development fallback
- production fallback

Scrutinize `NEXT_PUBLIC_*`.

Look for accidental leakage of:

- API keys
- database credentials
- private tokens
- internal service URLs
- signing secrets

Never display a discovered secret in full.

Mask values.

---

# 17. PERFORMANCE

Do not stop at:

> reduce bundle size.

Identify concrete bottlenecks.

## Server

Check:

- sequential requests
- waterfalls
- duplicate DB queries
- N+1
- expensive calculations
- large serialization
- blocking operations
- large API responses
- slow external providers

## Client

Check:

- client JS
- bundle size
- heavy dependencies
- unnecessary hydration
- rerenders
- context rerenders
- expensive rendering
- large lists
- unnecessary effects
- duplicate client fetching

## Network

Check:

- request waterfalls
- excessive round trips
- duplicate requests
- missing caching
- huge JSON
- asset sizes

## Assets

Check:

- images
- fonts
- icons
- video
- third-party scripts

Do not give unsubstantiated capacity estimates like:

> it will support 100,000 users.

Without benchmarks, cite only concrete bottleneck locations and scalability risks.

---

# 18. IMAGES

Review image handling.

Check:

- `next/image`
- dimensions
- responsive sizing
- `sizes`
- priority/preload usage
- lazy loading
- remote sources
- image domains/patterns
- oversized assets
- layout shift
- decorative images
- alt text

Do not demand Next Image where it provides no practical benefit.

---

# 19. FONTS

Review font loading.

Check:

- local vs remote
- framework font optimization
- unnecessary weights
- unnecessary subsets
- render blocking
- layout shifts
- duplicated font loading

---

# 20. THIRD-PARTY SCRIPTS

Map:

- analytics
- ads
- chat
- tracking
- embeds
- payment SDKs
- maps
- social widgets

Assess:

- blocking behavior
- privacy
- loading strategy
- consent
- performance impact
- failure blast radius

---

# 21. CORE WEB VITALS

From the codebase, identify potential root causes for:

- LCP
- CLS
- INP

Do not fabricate metrics without runtime measurements.

Distinguish:

```text
CODE-LEVEL RISK
```

from:

```text
MEASURED PROBLEM
```

If Lighthouse/field/runtime metrics are unavailable, state:

**NOT MEASURED**

---

# 22. SEO

If the application is publicly indexable, check:

- title
- description
- metadata
- canonical
- OpenGraph
- Twitter/X metadata
- robots
- sitemap
- status codes
- redirects
- structured data
- pagination/indexing
- duplicate content
- dynamic metadata
- locale/hreflang where relevant

Clearly distinguish:

- SEO issue
- social sharing issue
- indexing issue

---

# 23. ACCESSIBILITY

Check:

- semantic HTML
- heading hierarchy
- labels
- errors
- ARIA
- keyboard
- focus
- modal/dialog behavior
- focus traps
- skip navigation
- touch targets
- alt text
- reduced motion
- color-independent state
- live announcements where required

Do not file an accessibility finding without a specific location and user consequence.

---

# 24. FORMS

For all critical forms trace:

```text
input
↓
client validation
↓
submission
↓
server validation
↓
authorization
↓
business operation
↓
database
↓
response
↓
UI feedback
```

Look for:

- validation mismatch
- double submit
- stale errors
- data loss
- missing pending state
- invalid server assumptions
- optimistic update without rollback
- browser Back/Forward issues
- refresh problems
- duplicate creation

---

# 25. STATE MANAGEMENT

If the project uses:

- React state
- Context
- Zustand
- Redux
- TanStack Query
- SWR
- custom stores

check:

- duplicated source of truth
- stale state
- server state kept in client store unnecessarily
- synchronization problems
- cache mismatch
- race conditions
- over-globalized state
- persistence/privacy problems

---

# 26. EXTERNAL API INTEGRATIONS

For each major integration trace:

```text
caller
↓
request
↓
provider
↓
response
↓
validation
↓
persistence
↓
UI
```

Check:

- timeout
- retries
- malformed responses
- unavailable provider
- duplicate calls
- rate limits
- version assumptions
- partial failures
- sensitive data transfer

---

# 27. WEBHOOKS

If present, verify:

- signature verification
- timestamp
- replay attacks
- duplicate delivery
- idempotency
- ordering
- retries
- event versions
- transaction boundaries

A webhook that can arrive twice must be audited under that exact premise.

---

# 28. FILE UPLOAD

If the project accepts uploads:

- extension
- MIME
- actual content validation
- size
- filename sanitization
- path traversal
- storage
- authorization
- public exposure
- executable formats
- SVG
- replacement/overwrite behavior

---

# 29. PWA

If a PWA exists:

- manifest
- icons
- installability
- service worker
- cache strategy
- offline fallback
- update behavior
- stale assets
- logout/cache interaction
- user-specific cached data

Ensure the service worker never traps the user on an outdated or vulnerable build.

---

# 30. INTERNATIONALIZATION

If multi-language support exists:

- locale routing
- fallback
- missing translations
- server/client locale mismatch
- metadata localization
- dates
- numbers
- currency
- pluralization
- RTL where relevant
- hydration mismatch caused by locale

---

# 31. DATE, TIME AND TIMEZONE

Actively check:

- UTC/local mismatch
- browser/server timezone mismatch
- DST
- date-only values
- ISO parsing
- midnight boundaries
- locale formatting
- scheduled operations

---

# 32. SERVERLESS AND VERCEL ASSUMPTIONS

If deploying to Vercel or similar serverless infrastructure, verify assumptions regarding:

- local filesystem persistence
- global in-memory state
- long-running processes
- background jobs
- connection pooling
- function duration limits
- cold starts
- region alignment
- edge/runtime compatibility
- scheduled tasks

Code that operates correctly in a long-lived Node process may break in serverless environments.

---

# 33. NODE VS EDGE RUNTIME

If utilizing multiple runtimes, verify:

- Node-only APIs
- native dependencies
- crypto
- filesystem
- database drivers
- SDK compatibility
- runtime declarations

Look for code that builds/typechecks fine but crashes only at runtime in the target environment.

---

# 34. PRODUCTION VS DEVELOPMENT

Look for:

- localhost hardcoding
- debug bypasses
- development auth
- test credentials
- mock APIs
- fallback secrets
- filesystem assumptions
- case sensitivity differences
- local-only services
- production-only env requirements
- dev-only data initialization

Classify issues as:

- BUILD-TIME
- RUNTIME
- PRODUCTION-ONLY
- BROWSER-ONLY
- SERVER-ONLY

where appropriate.

---

# 35. TESTS

Review existing tests.

Determine:

- what they genuinely cover
- what only appears to be covered
- critical user flows completely devoid of tests

Look for:

- meaningless assertions
- over-mocking
- obsolete tests
- flaky tests
- timing assumptions
- tests out of sync with implementation
- snapshot abuse
- happy-path-only tests

For Server Actions, Route Handlers, and authorization, check especially for missing negative/security tests.

---

# 36. BUILD, TYPECHECK, LINT AND TEST

If you have runtime/tooling access, execute:

```text
install
lint
typecheck
test
build
```

Do not make arbitrary code changes just to get a command to pass.

Record:

- command
- outcome
- relevant failure

If an action was not executed:

**NOT VERIFIED**

Never claim tests pass without running them.

---

# 37. DEPENDENCIES

Review dependencies and devDependencies.

Look for:

- abandoned packages
- deprecated packages
- concrete incompatibility issues
- duplicated functionality
- unnecessary client-heavy libraries
- Node/runtime incompatibilities
- security concerns
- packages disproportionately inflating client bundle

Do not report a package solely because a newer version exists.

Upgrades must have justifiable reasons.

---

# 38. CI/CD

Review pipelines.

Check:

- install
- cache
- lint
- typecheck
- tests
- build
- migrations
- deployment
- environment
- artifacts
- concurrency
- rollback

Look for:

- deployment despite failing checks
- branch mismatch
- missing build verification
- production migration race conditions
- uncontrolled concurrent deploys
- staging/production drift

---

# 39. OBSERVABILITY

Assess whether a developer could diagnose a production incident.

Review:

- structured logs
- error tracking
- request IDs
- correlation IDs
- audit logs
- health endpoints
- metrics
- Web Vitals telemetry
- tracing

Do not mandate enterprise observability stacks for small projects without necessity.

---

# 40. PRIVACY

Map the flow of personal data:

```text
browser
→ server
→ database
→ logs
→ analytics
→ third party
```

Look for:

- unnecessary data collection
- PII in server/client logs
- secret/sensitive data leaked to analytics
- excessive client data exposure
- cached private data
- third-party leakage

---

# 41. REPOSITORY-WIDE SEARCH

Actively search codebase for:

```text
TODO
FIXME
HACK
XXX
eslint-disable
ts-ignore
ts-expect-error
any
console.
catch
setTimeout
setInterval
dangerouslySetInnerHTML
innerHTML
eval
exec
spawn
fetch
process.env
NEXT_PUBLIC_
localStorage
sessionStorage
cookies
headers
redirect
revalidate
admin
role
permission
userId
ownerId
tenantId
```

A search match is not inherently a finding.

For each relevant hit, check:

- caller
- callee
- wrapper
- validation
- authorization
- middleware
- DB constraints
- framework behavior

---

# 42. BUSINESS INVARIANTS

Derive primary business rules from the application.

Example:

```text
Only owner can edit project.
```

Then find ALL avenues by which that project can be mutated.

If there is a:

- Server Action
- API
- admin action
- import
- webhook
- background worker

every single entry point must uphold the invariant.

---

# 43. STATE MACHINES

For entities with statuses:

```text
draft
pending
active
cancelled
completed
```

derive the state machine.

Check:

- valid transitions
- forbidden transitions
- duplicate transitions
- concurrent transitions
- impossible states
- server-side enforcement

---

# 44. FALSE-POSITIVE PREVENTION

Before filing any P0/P1/P2 finding, verify at least:

1. same file
2. parent component
3. wrapper
4. Server Action
5. Route Handler
6. middleware/proxy
7. shared validation
8. shared authorization
9. DB constraints
10. caller
11. callee
12. relevant tests
13. framework behavior
14. infrastructure layer

If protection is already in place, do not file a bug.

---

# 45. FINDING FORMAT

Every serious finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Affected route/feature:
File:
Function/Component:
Relevant code location:

Description:

Evidence:

Execution/Data Flow:

Why this is a problem:

Reproduction scenario:

User/Production impact:

Root cause:

Recommended remediation:

Verification after fix:

Complexity:
XS / S / M / L / XL
```

---

# 46. SEVERITY

Use:

## P0 - CRITICAL

- unauthorized compromise
- severe data breach
- severe data loss
- catastrophic business impact
- total core system failure

## P1 - HIGH

- severe security issue
- major production bug
- critical user flow failure
- major reliability/data-integrity defect

## P2 - MEDIUM

- genuine issue with bounded impact

## P3 - LOW

- minor bug
- maintainability defect with measurable consequence

## P4 - IMPROVEMENT

- justifiable improvement that is not a bug

---

# 47. CONFIDENCE

For each finding:

```text
HIGH
MEDIUM
LOW
```

HIGH:

directly proven by code, test, or live reproduction.

MEDIUM:

code gives strong evidence, but runtime confirmation is missing.

LOW:

depends on production configurations or inaccessible environment context.

Never present LOW confidence as fact.

---

# 48. VERIFICATION STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

Do not turn theoretical risks into confirmed bugs.

---

# 49. DO NOT AUTOMATICALLY MODIFY CODE

During the audit:

- do not edit files
- do not change dependencies
- do not open PRs
- do not refactor
- do not modify configurations

Complete the audit first.

Remediation is handled separately.

---

# 50. OUTPUT - NEXTJS_AUDIT_REPORT.md

Structure the final report as follows:

## 1. Executive Summary

- purpose of application
- Next.js/React versions
- architecture model
- deployment model
- overall health
- highest risks
- best implemented areas
- production readiness verdict

## 2. Technology Inventory

Table containing:

- Next.js
- React
- Node
- TypeScript
- package manager
- database
- ORM
- auth
- state management
- deployment
- tests
- monitoring

## 3. Architecture Map

Actual application architecture.

## 4. Routing Map

Key routes, layouts, and rendering models.

## 5. Server/Client Boundary Map

Major Client Component boundaries and their justifications.

## 6. Critical User Flows

End-to-end flows traced during audit.

## 7. Rendering & Caching Matrix

Where reliably verifiable:

| Route | Rendering | User-specific | Cache | Revalidation | Risk |
|---|---|---|---|---|---|

## 8. Server Actions Matrix

| Action | Auth | Authorization | Validation | Transaction | Revalidation | Result |
|---|---|---|---|---|---|---|

## 9. API / Route Handler Matrix

| Route | Method | Auth | Authorization | Validation | Rate limit | Result |
|---|---|---|---|---|---|---|

## 10. Findings Summary

| ID | Severity | Category | Problem | Location | Confidence | Status |
|---|---|---|---|---|---|---|

## 11. P0 Findings

Detailed.

## 12. P1 Findings

Detailed.

## 13. P2 Findings

Detailed.

## 14. P3 Findings

Detailed.

## 15. P4 Improvements

Separated from defects.

## 16. Server Components Audit

## 17. Client Components Audit

## 18. Server Actions Audit

## 19. Routing Audit

## 20. Caching & Revalidation Audit

## 21. Authentication Audit

## 22. Authorization Audit

## 23. Security Audit

## 24. Database & Data Integrity Audit

## 25. Performance Audit

Break down into:

- server
- browser
- network
- assets
- database

## 26. Core Web Vitals Risks

Distinguish code-level risks from actual measurements.

## 27. SEO Audit

## 28. Accessibility Audit

## 29. PWA Audit

Where applicable.

## 30. Testing Audit

## 31. Dependency Audit

## 32. CI/CD & Deployment Audit

## 33. Vercel/Serverless Audit

Where applicable.

## 34. Observability Audit

## 35. Privacy Audit

## 36. Documentation Drift

Documentation vs actual code implementation.

## 37. Dead / Legacy / Suspicious Code

Classify into:

```text
CONFIRMED DEAD
LIKELY DEAD
LEGACY BUT USED
UNKNOWN
```

## 38. Production Readiness Checklist

Use:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Covering at least:

- clean install
- lint
- typecheck
- tests
- production build
- routes
- Server Components
- Client Components
- Server Actions
- caching
- auth
- authorization
- validation
- database
- migrations
- security
- secrets
- error handling
- external APIs
- performance
- Core Web Vitals
- accessibility
- SEO
- responsive UI
- PWA
- logging
- monitoring
- CI
- deployment
- rollback

## 39. Top Problems by Risk

Highest impact problems regardless of fix complexity.

## 40. Top Problems by ROI

Highest ratio of:

```text
impact / effort
```

## 41. Remediation Roadmap

### Phase 0 - Emergency

P0.

### Phase 1 - Before Production

P1.

### Phase 2 - Stabilization

P2.

### Phase 3 - Quality

P3.

### Phase 4 - Optimization

P4 and performance improvements.

Specify dependencies between remediations.

## 42. Things Done Well

Document well-implemented patterns that should not be unnecessarily altered.

## 43. Unknown / Not Verified

Everything that could not be verified due to:

- production infrastructure access
- secrets
- DB access
- runtime constraints
- provider accounts
- analytics data
- monitoring data
- real-user metrics

---

# 51. FINAL NEXT.JS SECOND PASS

Once the first audit pass is complete, perform a second pass.

Do not re-read directory by directory.

Shift perspectives.

## Security pass

Ask:

> As an authenticated user without special privileges, which server operations can I invoke directly?

## Cache pass

Ask:

> What data can a user mutate, yet still receive the stale version?

And:

> Could the cache ever return one user's data to another user?

## Server/Client pass

Ask:

> What code or data crosses the server/client boundary unnecessarily?

## Performance pass

Ask:

> What request or render currently blocks something that does not need to wait?

## Failure pass

Ask:

> What happens if DB, API, or external provider times out right between two steps of a business operation?

## Concurrent-user pass

Ask:

> What happens if two requests modify the exact same resource simultaneously?

## Production pass

Ask:

> What currently works locally only thanks to a long-lived process, local filesystem, or dev configuration?

## User pass

Ask:

> What happens if a user clicks twice, refreshes, hits Back, opens two tabs, or directly manipulates the URL?

Incorporate all newly confirmed problems into the main audit.

---

# 52. FINAL QUALITY GATE

Before finalizing, verify:

- every P0/P1 has concrete evidence
- every security finding checked server-side defenses
- every cache finding matches the actual Next.js version
- Server and Client Component semantics were not conflated
- no obsolete framework assumptions were relied upon
- theoretical findings are not presented as confirmed
- no duplicate findings sharing the same root cause
- every performance defect points to a concrete bottleneck
- no Core Web Vitals figures were claimed without runtime metrics
- no test/build success claims made without execution
- improvements are separated from bugs
- recommended remediation targets the root cause
- documentation was cross-referenced against code
- production risks are decoupled from local dev limitations

---

# FINAL RULE

Do not return a report like:

> Next.js project looks good. Recommend more Server Components, better caching, and additional tests.

That is not an audit.

I want you to establish:

- what the project actually does
- where every critical part executes
- where the trust boundaries lie
- what executes on the server
- what ships to the browser
- how data is fetched
- how data is mutated
- how caches invalidate
- how operations are secured
- what happens under failure conditions
- what can break only once in production

Every serious conclusion must have evidence in:

- code
- configuration
- test
- dependency/runtime semantics
- or clearly reconstructed execution flow

If evidence is insufficient:

**NOT VERIFIED.**

It is far better to find **8 real Next.js issues** than to write **80 generic best practices**.

Act as the final technical gatekeeper before a serious production deployment.
