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
version: 1.0.0
status: stable
---

# VERCEL PRODUCTION AUDIT

I want a deep production audit of the Vercel deployment and Next.js/serverless/edge infrastructure.

If the project does not use Vercel:

**NOT APPLICABLE**

## 1. MAP VERCEL

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

## 2. PRODUCTION BRANCH

Which branch deploys to production?

## 3. PREVIEW

Every PR/branch can trigger a live deployment.

Ask what secrets it receives.

## 4. ENV SCOPE

For each env:

`	ext
Development
Preview
Production
`

verify variable scope.

## 5. PRODUCTION SECRET IN PREVIEW

High-risk if untrusted PR code can read it.

## 6. PUBLIC ENV

Next.js NEXT_PUBLIC_* variables are exposed to the browser.

## 7. SERVER-ONLY ENV

Verify the import boundary.

## 8. BUILD-TIME SECRET

Can be inadvertently embedded into generated assets.

## 9. FUNCTION RUNTIME

Node vs Edge.

## 10. EDGE LIMITATIONS

- filesystem
- TCP
- packages
- runtime APIs

## 11. REGION

Function region vs database region.

## 12. CROSS-REGION LATENCY

DB calls originating from a distant region.

## 13. SERVERLESS DB CONNECTIONS

Bursting functions can exhaust the database connection pool.

## 14. POOLING

Verify connection provider/proxy.

## 15. FUNCTION TIMEOUT

Long-running tasks.

## 16. BACKGROUND WORK

Do not rely on function execution continuing post-response unless platform semantics explicitly guarantee it.

## 17. CRON

Audit:

- auth
- duplicate runs
- duration
- retries
- idempotency

## 18. CRON URL

If public endpoint:

must enforce strong invocation controls if the underlying action is privileged.

## 19. BUILD OUTPUT

Verify what enters the static bundle.

## 20. SOURCE MAPS

Public exposure.

## 21. STATIC FILE

Accidental inclusion of .env, backups, or internal JSON.

## 22. NEXT.JS ROUTE HANDLERS

Runtime configuration.

## 23. SERVER ACTIONS

Auth and authorization enforcement.

## 24. MIDDLEWARE

Edge middleware is not the sole security layer for backend resource authorization.

## 25. CACHING

Next.js:

- static
- dynamic
- revalidate
- fetch cache
- route cache

## 26. PRIVATE DATA CACHE

Most critical scenario:

`	ext
User A response
↓
cached without user/tenant key
↓
User B receives it
`

## 27. STATIC GENERATION

Sensitive per-user routes must never be statically generated.

## 28. REVALIDATION

Stale private data exposure.

## 29. CDN CACHE

Cache-Control headers.

## 30. Vary

Relevant request dimensions.

## 31. ISR

Public content consistency.

## 32. AUTH COOKIE + CACHE

Ensure that authentication-dependent rendering truly remains dynamic/private.

## 33. IMAGE OPTIMIZATION

Remote image patterns can introduce SSRF-like/proxy/cost attack surfaces per Next/Vercel semantics.

## 34. REMOTE PATTERNS

Do not allow arbitrary wildcard hosts.

## 35. IMAGE COST ABUSE

Enormous or repeated remote image requests.

## 36. REWRITES

Can accidentally expose internal backends.

## 37. PROXY

Server-side rewrites can bypass expected security boundaries.

## 38. REDIRECTS

Open redirect logic in application configuration.

## 39. HEADERS

Security, caching, and CORS headers.

## 40. CUSTOM DOMAIN

DNS ownership and verification.

## 41. DANGLING VERCEL DOMAIN

Orphaned project-to-custom-domain mappings.

## 42. PREVIEW URL

Can inadvertently expose unreleased features or confidential data.

## 43. PREVIEW AUTH

If preview requires restricted access, verify deployment protection.

## 44. DEPLOY HOOK

A secret URL triggering deployment is an authorization capability.

## 45. GIT DEPLOY

Which Git actor has authority to trigger production?

## 46. DIRECT CLI DEPLOY

Who holds Vercel tokens or direct project access?

## 47. VERCEL TOKEN

Scope and exposure within CI.

## 48. TEAM ACCESS

Production management privileges.

## 49. ENV VAR AUDIT

- missing
- duplicates
- stale
- preview leakage
- public prefix misuse

## 50. VERCEL INTEGRATION

Third-party integration permissions.

## 51. BLOB/STORAGE

Public vs private access controls.

## 52. POSTGRES

Connection pooling, region alignment, and backups.

## 53. KV/CACHE

Authoritative data vs disposable cache.

## 54. EDGE CONFIG

Propagation latency and staleness.

## 55. LOGS

Function logs can inadvertently leak secrets.

## 56. OBSERVABILITY

Cold starts, error rates, and invocation durations.

## 57. FUNCTION CONCURRENCY

Serverless concurrency amplification.

## 58. PROVIDER QUOTA

Functions, builds, bandwidth, and image optimization limits.

## 59. BUILD MINUTES

Abuse and unexpected costs.

## 60. BANDWIDTH

Large egress downloads.

## 61. BOT/ATTACK TRAFFIC

Incurred costs prior to application rate limiting.

## 62. FIREWALL/WAF

If Vercel security features are enabled, do not treat them as substitutes for application controls.

## 63. ROLLBACK

Vercel can redeploy/promote previous deployments, but verify database/config compatibility.

## 64. IMMUTABLE DEPLOY

Deployment URL acts as a distinct artifact identity.

## 65. PROMOTION

If workflow promotes preview to production, verify that the exact tested deployment is promoted.

## 66. REBUILD

If production rebuilds from source, parity risks emerge.

## 67. BUILD CACHE

Stale generated build outputs.

## 68. MONOREPO

Root directory and build ignore settings.

## 69. ignoreCommand

Can inadvertently skip required deployments.

## 70. DEPLOY ORDER

Frontend/backend combined in the same Next app vs decoupled external APIs.

## 71. PWA

Stale service workers and caches persisting after Vercel deployment.

## 72. ENV ROLLBACK

Does an older deployment run against current environment variables or snapshot semantics? Confirm actual behavior; do not guess.

## 73. DATABASE MIGRATION

Never tie unsafe database migrations to serverless function cold starts.

## 74. MIGRATION JOB

Execute as a dedicated, controlled step.

## 75. SEED

Ensure production database seeds are never accidentally reset.

## 76. SERVERLESS FILESYSTEM

Ephemeral nature of storage.

## 77. UPLOADS

Do not persist durable user uploads locally in the function filesystem.

## 78. /tmp

Temporary usage only.

## 79. RESPONSE SIZE

Platform payload limits.

## 80. REQUEST SIZE

Upload payload limits.

## 81. STREAMING

Runtime and platform streaming limits.

## 82. WEBSOCKET

Verify current architecture support and operational models; do not assume.

## 83. LONG CONNECTION

Server-sent events (SSE) and long-lived streams.

## 84. THIRD-PARTY BACKEND

Rewrites and reverse proxies.

## 85. FAILURE SCENARIOS

- preview gets prod secret
- DB connection storm
- private route cached
- long function killed
- cron duplicate
- rollback with incompatible schema
- public Blob exposure
- build embeds secret
- production branch misconfigured

## 86. FINDING FORMAT

`	ext
ID:
Severity:
Vercel surface:
Environment:
Runtime:
Region:
Trigger:
Current config:
Failure/exploit path:
Impact:
Evidence:
Fix:
Verification:
Complexity:
`

## 87. OUTPUT

VERCEL_PRODUCTION_AUDIT.md

## 88. SECOND PASS

Test/analyze:

- new preview from untrusted branch
- exact env values exposed to preview
- user A/User B cache switch
- function burst to DB
- function timeout
- cron parallel execution
- previous deployment rollback
- source/static bundle secret scan
- durable file after redeploy
- custom domain/DNS failure

## 89. FINAL QUALITY GATE

- production branch
- previews
- env scopes
- public bundle
- caching
- region
- DB pool
- functions limits
- cron
- storage
- rollback
- Git/CLI deployment authority
- logs/secrets
- provider quotas

# FINAL RULE

Looking for issues such as:

`	ext
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
`

or:

`	ext
server component fetch:
cache enabled

↓
response depends on authenticated tenant
↓
cache key does not include tenant identity

↓
Tenant B receives Tenant A data
`
