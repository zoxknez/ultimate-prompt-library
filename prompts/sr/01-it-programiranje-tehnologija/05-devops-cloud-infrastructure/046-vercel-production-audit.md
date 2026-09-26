---
id: UPL-IT-046
number: 46
slug: vercel-production-audit
title: Vercel Production Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.0
status: stable
---

# VERCEL PRODUCTION AUDIT

Želim duboku production reviziju Vercel deployment-a i Next.js/serverless/edge infrastrukture.

Ako projekat ne koristi Vercel:

**NOT APPLICABLE**

## 1. MAPIRAJ VERCEL

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

Koji branch deployuje production?

## 3. PREVIEW

Svaki PR/branch može kreirati live deployment.

Pitaj koje secrets dobija.

## 4. ENV SCOPE

Za svaki env:

```text

Development

Preview

Production

```

proveri variable scope.

## 5. PRODUCTION SECRET U PREVIEW-U

High-risk ako untrusted PR code može da ga pročita.

## 6. PUBLIC ENV

Next.js `NEXT_PUBLIC_*` završava u browseru.

## 7. SERVER-ONLY ENV

Proveri import boundary.

## 8. BUILD-TIME SECRET

Može biti embedded u generated assets.

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

DB calls iz udaljenog regiona.

## 13. SERVERLESS DB CONNECTIONS

Burst functions mogu iscrpeti DB pool.

## 14. POOLING

Proveri provider/proxy.

## 15. FUNCTION TIMEOUT

Long tasks.

## 16. BACKGROUND WORK

Ne oslanjaj se na function execution nakon response-a ako platform semantics ne garantuju.

## 17. CRON

Audit:

- auth

- duplicate run

- duration

- retries

- idempotency

## 18. CRON URL

Ako public endpoint:

mora imati strong invocation control ako action privileged.

## 19. BUILD OUTPUT

Proveri šta ulazi u static bundle.

## 20. SOURCE MAPS

Public exposure.

## 21. STATIC FILE

Accidental `.env`, backups, internal JSON.

## 22. NEXT.JS ROUTE HANDLERS

Runtime config.

## 23. SERVER ACTIONS

Auth/authz enforcement.

## 24. MIDDLEWARE

Edge middleware nije jedini security layer za backend resource authorization.

## 25. CACHING

Next.js:

- static

- dynamic

- revalidate

- fetch cache

- route cache

## 26. PRIVATE DATA CACHE

Najvažniji scenario:

```text

User A response

↓

cached without user/tenant key

↓

User B receives it

```

## 27. STATIC GENERATION

Sensitive per-user route ne sme postati static.

## 28. REVALIDATION

Stale private data.

## 29. CDN CACHE

Cache-Control.

## 30. `Vary`

Relevantni request dimensions.

## 31. ISR

Public content consistency.

## 32. AUTH COOKIE + CACHE

Proveri da auth-dependent rendering zaista ostaje dynamic/private.

## 33. IMAGE OPTIMIZATION

Remote image patterns mogu dati SSRF-like/proxy/cost surface prema Next/Vercel semantics.

## 34. REMOTE PATTERNS

Ne dozvoli unnecessary arbitrary hosts.

## 35. IMAGE COST ABUSE

Huge/remote image requests.

## 36. REWRITES

Mogu expose-ovati internal backend.

## 37. PROXY

Server-side rewrite može zaobići očekivane boundaries.

## 38. REDIRECTS

Open redirect logic u app config-u.

## 39. HEADERS

Security/cache/CORS.

## 40. CUSTOM DOMAIN

DNS ownership.

## 41. DANGLING VERCEL DOMAIN

Old project/custom domain mappings.

## 42. PREVIEW URL

Može expose-ovati unreleased feature/data.

## 43. PREVIEW AUTH

Ako preview treba private access, proveri protection.

## 44. DEPLOY HOOK

Secret URL koji trigger-uje deployment je capability.

## 45. GIT DEPLOY

Koji Git actor može production?

## 46. DIRECT CLI DEPLOY

Ko ima Vercel token/project access?

## 47. VERCEL TOKEN

Scope i CI exposure.

## 48. TEAM ACCESS

Production management privilege.

## 49. ENV VAR AUDIT

- missing

- duplicates

- stale

- preview leakage

- public prefix

## 50. VERCEL INTEGRATION

Third-party integration permissions.

## 51. BLOB/STORAGE

Public/private access.

## 52. POSTGRES

Connection pooling/region/backup.

## 53. KV/CACHE

Authoritative vs disposable.

## 54. EDGE CONFIG

Propagation/staleness.

## 55. LOGS

Function logs can expose secrets.

## 56. OBSERVABILITY

Cold starts, errors, duration.

## 57. FUNCTION CONCURRENCY

Serverless amplification.

## 58. PROVIDER QUOTA

Functions/builds/bandwidth/image optimization.

## 59. BUILD MINUTES

Abuse/cost.

## 60. BANDWIDTH

Large downloads.

## 61. BOT/ATTACK TRAFFIC

Cost before app rate-limit.

## 62. FIREWALL/WAF

Ako Vercel security features postoje, ne tretiraj kao zamenu za app controls.

## 63. ROLLBACK

Vercel može redeploy/promote previous deployment, ali proveri DB/config compatibility.

## 64. IMMUTABLE DEPLOY

Deployment URL je useful artifact identity.

## 65. PROMOTION

Ako workflow koristi preview -> production promotion, proveri da je exact tested deployment promoted.

## 66. REBUILD

Ako production rebuild-uje, parity risk.

## 67. BUILD CACHE

Stale generated output.

## 68. MONOREPO

Root directory/build ignore.

## 69. `ignoreCommand`

Može slučajno preskočiti needed deploy.

## 70. DEPLOY ORDER

Frontend/backend u istom Next app ili external API.

## 71. PWA

Old service worker/cache posle Vercel deploy-a.

## 72. ENV ROLLBACK

Old deployment koristi current env ili snapshot semantics? Potvrdi actual behavior, ne nagađaj.

## 73. DATABASE MIGRATION

Ne vezuj unsafe migration za serverless function startup.

## 74. MIGRATION JOB

Poseban controlled step.

## 75. SEED

Nikad production seed reset accidental.

## 76. SERVERLESS FILESYSTEM

Ephemeral.

## 77. UPLOADS

Ne čuvaj durable user files lokalno u function filesystem-u.

## 78. `/tmp`

Temporary only.

## 79. RESPONSE SIZE

Platform limits.

## 80. REQUEST SIZE

Uploads.

## 81. STREAMING

Runtime/platform limit.

## 82. WEBSOCKET

Vercel support/model proveri prema current architecture, ne pretpostavljaj.

## 83. LONG CONNECTION

SSE/stream.

## 84. THIRD-PARTY BACKEND

Rewrites/proxies.

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

```text

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

```

## 87. OUTPUT

`VERCEL_PRODUCTION_AUDIT.md`

## 88. SECOND PASS

Testiraj/anliziraj:

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

# KONAČNO PRAVILO

Tražim problem poput:

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

ili:

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
