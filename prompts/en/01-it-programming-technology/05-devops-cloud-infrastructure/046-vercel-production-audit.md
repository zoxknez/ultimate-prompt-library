---
id: UPL-IT-046
number: 46
slug: vercel-production-audit
title: Vercel Production Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.1.0
status: stable
---

# VERCEL PRODUCTION AUDIT

I want a deep production audit of the Vercel deployment and Next.js/serverless/edge infrastructure.

If the project does not use Vercel:

**NOT APPLICABLE**

## 1. OBJECTIVE AND NON-GOALS

Prove whether the Vercel setup keeps **secrets and private data inside their intended environment and audience**, whether **what runs in production is the intended, tested deployment**, and whether the serverless and caching model **holds under real traffic, failure and rollback**.

Non-goals:

- general application security review (only where Vercel or Next.js platform semantics change the answer)
- performance tuning of individual pages unless it causes cost, availability or data exposure
- recommending migration away from Vercel or from serverless
- generic CI/CD review outside Vercel's deployment model

## 2. CONTEXT DISCOVERY

Establish first, from the repository and the project settings:

```text
Framework and exact version (Next.js major/minor, App Router, Pages Router, or both):
Rendering modes in use (static, dynamic, ISR, streaming, server actions):
Runtimes per route (Node.js, Edge) and middleware location:
Vercel plan and enabled features (deployment protection, firewall, cron, storage):
Data stores and their regions; pooling or serverless drivers:
Git integration: production branch, fork PR behavior, ignored build step:
Other deployment paths (CLI, deploy hooks, CI with tokens):
```

Next.js caching defaults, runtime capabilities, function limits, pricing and quotas differ between versions and plans and change over time. Verify current provider and version-specific behavior before stating it; do not rely on remembered defaults.

## 3. EVIDENCE MODEL

```text
A - observed: deployment, response headers, logs, a safe preview test or a two-user cache test shows the behavior
B - complete path: project settings, env scopes and code fully show the path
C - strong static evidence: code or configuration suggests the path, but dashboard settings are not visible
D - inference: depends on platform or framework semantics not verified for this version
E - hardening: stronger control without a current failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - tier A or B evidence shows the exposure or failure path.
- **LIKELY** - tier C evidence.
- **NOT VERIFIED** - depends on dashboard settings, plan features or version semantics that could not be checked (tier D).
- **NOT APPLICABLE** - the feature is not used.
- **CONTROLLED** - the risk exists but another control contains it (for example deployment protection on previews).
- **HARDENING** - improvement without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete exposure, correctness, reliability, cost or operational failure path.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- Using serverless functions, or having cold starts, is not a defect; it becomes one when it breaks a correctness, capacity or latency requirement.
- A preview deployment existing is not an exposure; it becomes one when it holds production secrets or data, or exposes unreleased confidential content to people who should not see it.
- A `NEXT_PUBLIC_*` variable holding a value designed to be public (publishable keys, public URLs, analytics IDs) is not a leak.
- Static generation or caching of a route is correct when the output does not depend on the user, tenant or authorization.
- A public cron URL is acceptable when the invocation is authenticated and the job is idempotent.
- Source maps are a hardening item unless they reveal secrets or materially sensitive logic.

## 6. MAP VERCEL

- Project
- Production domain
- Preview domains
- Git integration
- Framework
- Build settings
- Functions
- Edge Functions
- Cron
- KV/Blob/Postgres integrations
- env vars
- regions

## 7. PRODUCTION BRANCH

Which branch deploys to production?

## 8. PREVIEW

Every PR/branch can trigger a live deployment.

Ask what secrets it receives.

## 9. ENV SCOPE

For each env:

```text
Development
Preview
Production
```

verify variable scope.

## 10. PRODUCTION SECRET IN PREVIEW

High-risk if untrusted PR code can read it.

## 11. UNTRUSTED BUILD WITH SECRETS

A preview build executes code from the branch: `next.config`, build scripts, dependency install scripts and any module imported during build.

- Who can create a branch or PR that triggers a Vercel build (team members, outside contributors, forks)?
- Which environment variables does that build receive (Preview scope, and any variable marked for all environments)?
- Does the build or the resulting preview runtime reach production data stores?

Contributor-controlled code plus production credentials is the critical combination; the fix is scoping, not trust in the contributor.

## 12. PUBLIC ENV

Next.js NEXT_PUBLIC_* variables are exposed to the browser.

## 13. SERVER-ONLY ENV

Verify the import boundary.

## 14. PUBLIC ENV LEAKAGE

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time; renaming a secret with that prefix publishes it. Also check indirect paths:

- server values passed as props to client components
- server values serialized into page data or RSC payloads
- `env` entries in `next.config` that are inlined
- error pages and logs rendered to the client

Verify by searching the built client assets for known secret prefixes and values when a build is available.

## 15. BUILD-TIME SECRET

Can be inadvertently embedded into generated assets.

## 16. BUILD-TIME VS RUNTIME ENVIRONMENT

For each variable, determine when it is read:

- **build time** - value baked into static pages, the client bundle or generated files; changing it requires a new build
- **runtime** - value read by functions on each invocation

Findings to look for: a variable changed in the dashboard but still baked into an old build, a statically generated page containing a secret read at build time, and a promotion or rollback that runs code built with a different value than expected. Verify how the current platform version applies environment changes to existing deployments.

## 17. FUNCTION RUNTIME

Node vs Edge.

## 18. EDGE LIMITATIONS

- filesystem
- TCP
- packages
- runtime APIs

## 19. EDGE VS NODE.JS RUNTIME

For every route, middleware and function on the Edge runtime, confirm that its dependencies actually work there: database drivers, crypto and JWT libraries, SDKs that expect Node.js APIs. Failures to look for:

- a library silently falling back to weaker behavior (for example no signature verification)
- a code path that only fails at runtime on a rarely used branch
- a database accessed from Edge regions far from the data

Runtime capabilities of middleware and Edge functions change between framework and platform versions; verify for the detected version.

## 20. REGION

Function region vs database region.

## 21. CROSS-REGION LATENCY

DB calls originating from a distant region.

## 22. SERVERLESS DB CONNECTIONS

Bursting functions can exhaust the database connection pool.

## 23. POOLING

Verify connection provider/proxy.

## 24. SERVERLESS DATABASE MODEL

Estimate worst-case connections:

```text
concurrent function instances x connections per instance (pool size) = demand
demand vs database max connections (minus reserved and other clients)
```

Check:

- pool size per instance (a pool of 10 per instance multiplies quickly)
- whether a pooler, proxy or HTTP-based driver sits in front of the database, and its mode (session vs transaction pooling and what that breaks: prepared statements, session settings, advisory locks)
- connection reuse across warm invocations vs a new connection per request
- cold-start connect time and TLS handshakes to a distant region
- burst behavior: a traffic spike or retry storm creating many instances at once
- function region vs database region

## 25. FUNCTION TIMEOUT

Long-running tasks.

## 26. BACKGROUND WORK

Do not rely on function execution continuing post-response unless platform semantics explicitly guarantee it.

## 27. CRON

Audit:

- auth
- duplicate runs
- duration
- retries
- idempotency

## 28. CRON URL

If public endpoint:

must enforce strong invocation controls if the underlying action is privileged.

## 29. CRON SEMANTICS

For each scheduled job:

- **invocation authentication** - the endpoint verifies a secret the platform sends, not just a hard-to-guess path
- **duplicate or missed runs** - assume a run can be delivered more than once or skipped; the job must be idempotent and tolerate gaps
- **overlap** - a run longer than the interval can overlap the next one; is there a lock or a guard?
- **timeouts** - a job killed at the function limit must leave consistent state and resume correctly
- **environment** - which deployments execute cron (production only?), and what happens after a rollback or promotion

Verify the current cron delivery guarantees and limits for the plan in use.

## 30. BUILD OUTPUT

Verify what enters the static bundle.

## 31. SOURCE MAPS

Public exposure.

## 32. STATIC FILE

Accidental inclusion of .env, backups, or internal JSON.

## 33. NEXT.JS ROUTE HANDLERS

Runtime configuration.

## 34. SERVER ACTIONS

Auth and authorization enforcement.

## 35. MIDDLEWARE

Edge middleware is not the sole security layer for backend resource authorization.

## 36. CACHING

Next.js:

- static
- dynamic
- revalidate
- fetch cache
- route cache

## 37. PRIVATE DATA CACHE

Most critical scenario:

```text
User A response
↓
cached without user/tenant key
↓
User B receives it
```

## 38. STATIC GENERATION

Sensitive per-user routes must never be statically generated.

## 39. REVALIDATION

Stale private data exposure.

## 40. CDN CACHE

Cache-Control headers.

## 41. Vary

Relevant request dimensions.

## 42. ISR

Public content consistency.

## 43. AUTH COOKIE + CACHE

Ensure that authentication-dependent rendering truly remains dynamic/private.

## 44. NEXT.JS CACHING MODEL

Identify the caching layers for the detected Next.js version and router, and for each one determine whether it can hold user-, tenant- or authorization-dependent data:

```text
Request memoization: per request, deduplicates identical fetches
Data Cache: persistent fetch/function results across requests and deployments
Full Route Cache: rendered output of static routes
Client Router Cache: RSC payloads kept in the browser session
CDN / edge cache: responses cached by Cache-Control and platform rules
```

For each route that reads the session, cookies, headers or tenant:

- does it render dynamically, or can it be statically generated and served to everyone?
- is any cached fetch or cached function keyed without user or tenant identity?
- can revalidation (time-based, tag or path) serve stale private data after a permission change?
- can a response with `Set-Cookie` or private data be cached by the CDN?

Default caching behavior has changed between Next.js major versions; confirm the defaults and opt-in/opt-out APIs for the detected version instead of assuming. Confirm exposure with a two-user test (A then B, and different tenants).

## 45. IMAGE OPTIMIZATION

Remote image patterns can introduce SSRF-like/proxy/cost attack surfaces per Next/Vercel semantics.

## 46. REMOTE PATTERNS

Do not allow arbitrary wildcard hosts.

## 47. IMAGE COST ABUSE

Enormous or repeated remote image requests.

## 48. REWRITES

Can accidentally expose internal backends.

## 49. PROXY

Server-side rewrites can bypass expected security boundaries.

## 50. INTERNAL SERVICE EXPOSURE

For every rewrite, proxy route and server-side fetch built from request input:

- which destinations are reachable (internal APIs, admin backends, metadata or private hosts)?
- can path or query parameters change the destination host or path (`/api/proxy/:path*` to an internal API)?
- which headers are forwarded (cookies, authorization) and which are added (internal tokens)?
- does the destination trust the request because it comes from the Vercel deployment?

A rewrite to an internal service is an exposed endpoint with that service's authorization model.

## 51. REDIRECTS

Open redirect logic in application configuration.

## 52. HEADERS

Security, caching, and CORS headers.

## 53. CUSTOM DOMAIN

DNS ownership and verification.

## 54. DANGLING VERCEL DOMAIN

Orphaned project-to-custom-domain mappings.

## 55. PREVIEW URL

Can inadvertently expose unreleased features or confidential data.

## 56. PREVIEW AUTH

If preview requires restricted access, verify deployment protection.

## 57. PREVIEW PROTECTION

- Which deployments are protected (previews only, all generated URLs, production aliases)?
- Can protection be bypassed by automation tokens or shareable links, and who holds them?
- Do previews connect to production data, send real emails or payments, or call production webhooks?
- Are preview URLs indexed by search engines or linked from public places?

## 58. DEPLOY HOOK

A secret URL triggering deployment is an authorization capability.

## 59. GIT DEPLOY

Which Git actor has authority to trigger production?

## 60. DIRECT CLI DEPLOY

Who holds Vercel tokens or direct project access?

## 61. VERCEL TOKEN

Scope and exposure within CI.

## 62. TEAM ACCESS

Production management privileges.

## 63. ENV VAR AUDIT

- missing
- duplicates
- stale
- preview leakage
- public prefix misuse

## 64. VERCEL INTEGRATION

Third-party integration permissions.

## 65. BLOB/STORAGE

Public vs private access controls.

## 66. POSTGRES

Connection pooling, region alignment, and backups.

## 67. KV/CACHE

Authoritative data vs disposable cache.

## 68. EDGE CONFIG

Propagation latency and staleness.

## 69. LOGS

Function logs can inadvertently leak secrets.

## 70. OBSERVABILITY

Cold starts, error rates, and invocation durations.

## 71. FUNCTION CONCURRENCY

Serverless concurrency amplification.

## 72. PROVIDER QUOTA

Functions, builds, bandwidth, and image optimization limits.

## 73. BUILD MINUTES

Abuse and unexpected costs.

## 74. BANDWIDTH

Large egress downloads.

## 75. BOT/ATTACK TRAFFIC

Incurred costs prior to application rate limiting.

## 76. COST AMPLIFICATION

Identify request paths where one cheap external request causes expensive platform usage: uncached dynamic rendering, image optimization of arbitrary sources, large downloads served through functions, long-running functions, or retries. Check spend limits, alerts and caps, and verify the current pricing model and quotas for the plan; do not quote remembered limits or prices.

## 77. FIREWALL/WAF

If Vercel security features are enabled, do not treat them as substitutes for application controls.

## 78. ROLLBACK

Vercel can redeploy/promote previous deployments, but verify database/config compatibility.

## 79. ROLLBACK REALITY

Rolling back to a previous deployment restores code, not the world around it. For each rollback path, determine:

- does the old deployment work with the **current database schema** and data written by the newer version?
- which **environment variable values** does it run with (its own build-time values, current runtime values)? Verify for the platform version.
- do **cron schedules, rewrites and headers** revert with it?
- do clients with a newer cached bundle or service worker break against the older API?

A rollback that cannot be performed safely during an incident is not a rollback plan.

## 80. IMMUTABLE DEPLOY

Deployment URL acts as a distinct artifact identity.

## 81. PROMOTION

If workflow promotes preview to production, verify that the exact tested deployment is promoted.

## 82. REBUILD

If production rebuilds from source, parity risks emerge.

## 83. DEPLOYMENT IDENTITY

Each deployment is an immutable build with its own URL; production is an alias pointing at one of them. Determine:

- Is production created by **promoting** an already-tested deployment, or by a **new build** from the production branch?
- If rebuilt, can inputs differ from what was tested (environment values, dependency resolution, build cache)?
- Which commit and which deployment are serving the production domain right now, and can that be traced?
- Can someone assign the production domain to an arbitrary deployment, and is that audited?

## 84. BUILD CACHE

Stale generated build outputs.

## 85. MONOREPO

Root directory and build ignore settings.

## 86. ignoreCommand

Can inadvertently skip required deployments.

## 87. DEPLOY ORDER

Frontend/backend combined in the same Next app vs decoupled external APIs.

## 88. PWA

Stale service workers and caches persisting after Vercel deployment.

## 89. ENV ROLLBACK

Does an older deployment run against current environment variables or snapshot semantics? Confirm actual behavior; do not guess.

## 90. DATABASE MIGRATION

Never tie unsafe database migrations to serverless function cold starts.

## 91. MIGRATION JOB

Execute as a dedicated, controlled step.

## 92. SEED

Ensure production database seeds are never accidentally reset.

## 93. SERVERLESS FILESYSTEM

Ephemeral nature of storage.

## 94. UPLOADS

Do not persist durable user uploads locally in the function filesystem.

## 95. /tmp

Temporary usage only.

## 96. RESPONSE SIZE

Platform payload limits.

## 97. REQUEST SIZE

Upload payload limits.

## 98. STREAMING

Runtime and platform streaming limits.

## 99. WEBSOCKET

Verify current architecture support and operational models; do not assume.

## 100. LONG CONNECTION

Server-sent events (SSE) and long-lived streams.

## 101. THIRD-PARTY BACKEND

Rewrites and reverse proxies.

## 102. MANDATORY FAILURE WALKTHROUGH

For each scenario, state the current behavior, the resulting state, how it is detected and how it is recovered:

```text
preview build from an untrusted branch receives a production secret
secret is exposed through NEXT_PUBLIC or a statically generated page
private route response is cached and served to another user or tenant
traffic burst creates a database connection storm
long function is killed at the platform limit mid-write
cron runs twice, overlaps or is skipped
durable file written to the function filesystem disappears after redeploy
rollback runs an older deployment against a newer schema
public Blob or storage object exposes private data
production branch or domain assignment is misconfigured
```

## 103. MATRICES

### Environment Matrix

| Variable / resource | Development | Preview | Production | Read at build or runtime | Exposed to client | Risk |
|---|---|---|---|---|---|---|

### Function / Runtime Matrix

| Route or function | Runtime | Region | Data store and region | Max duration need | Connections per instance | Auth |
|---|---|---|---|---|---|---|

### Cache / Data Sensitivity Matrix

| Route or fetch | Depends on user/tenant | Rendering mode | Cache layers involved | Cache key includes identity | Revalidation | Verified by test |
|---|---|---|---|---|---|---|

## 104. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Vercel surface:
Environment:
Runtime:
Region:
Scope (routes, functions, deployments):
Trigger:
Current config / behavior:
Expected invariant:
Failure / exploit path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Verification:
Regression risk:
Complexity:
```

## 105. SEVERITY

- **P0** - production secrets reachable by untrusted code or the public, or private data of one user or tenant served to another.
- **P1** - unauthorized production deployment path, privileged cron or proxy endpoint callable without authentication, or a routine event (traffic burst, rollback) that causes an outage or data corruption.
- **P2** - material reliability or cost gaps: connection exhaustion risk under realistic peaks, non-idempotent cron, unsafe rollback, cost amplification without limits.
- **P3** - limited issues: stale public content, minor preview exposure of non-confidential content, missing observability.
- **P4** - hardening: tighter scopes, source map removal, additional protection where no current path exists.

## 106. OUTPUT

VERCEL_PRODUCTION_AUDIT.md

## 107. SECOND PASS

Test or analyze:

- a new preview from an untrusted branch: exactly which env values reach its build and runtime
- user A, then user B (and tenant A, then tenant B) on every personalized route; compare responses and cache headers
- a function burst against the database: instances x pool size vs the connection limit
- a function reaching its timeout during a write
- two cron invocations in parallel
- rollback to the previous deployment against the current schema and env
- a secret scan of the static output and client bundle
- a durable file written before a redeploy
- a custom domain or DNS failure

Then try to disprove each finding: does deployment protection, env scoping, dynamic rendering or an upstream check already block the path for the detected version? Mark findings that depend on unverified platform semantics as **NOT VERIFIED**.

## 108. FINAL QUALITY GATE

Before returning the report, verify that it covers:

- framework version and the caching semantics verified for it
- production branch, deployment identity and promotion vs rebuild
- previews: who can trigger them, which secrets and data they reach, protection
- env scopes per environment and build-time vs runtime reads
- public bundle and `NEXT_PUBLIC` usage
- caching of every user- or tenant-dependent route, with a two-user test where possible
- runtime choice, region alignment and database connection math
- function limits, background work and ephemeral filesystem assumptions
- cron authentication, idempotency and overlap
- rewrites and proxies to internal services
- storage access (Blob, KV, Postgres) and backups
- rollback against current schema, env and clients
- Git, CLI, token and deploy hook authority
- logs and secrets, observability
- quotas and cost amplification, verified for the current plan
- consistent statuses and evidence tiers

# FINAL RULE

Looking for issues such as:

```text
Preview environment
↓
inherits PRODUCTION_DATABASE_URL
↓
external contributor opens PR
↓
Vercel builds contributor-controlled Next.js code
↓
build script reads env
↓
production database credential can be exfiltrated
```

or:

```text
server component fetch:
cache enabled
↓
response depends on authenticated tenant
↓
cache key does not include tenant identity
↓
Tenant B receives Tenant A data
```

Other failure chains to look for:

```text
cron job charges pending renewals
↓
invocation is delivered twice, or a slow run overlaps the next schedule
↓
no idempotency key or lock
↓
both runs select the same pending rows
↓
customers are charged twice
```

```text
release adds a NOT NULL column and writes new-format records
↓
incident triggers instant rollback to the previous deployment
↓
old code inserts without the new column and cannot parse the new records
↓
writes fail and reads crash on rows created in the last hour
```
