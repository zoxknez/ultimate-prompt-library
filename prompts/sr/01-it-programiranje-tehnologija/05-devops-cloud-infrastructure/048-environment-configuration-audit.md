---
id: UPL-IT-048
number: 48
slug: environment-configuration-audit
title: Environment Configuration Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.0
status: stable
---

# ENVIRONMENT CONFIGURATION AUDIT

Želim izvršiti forensic audit svih environment variables, config files, runtime flags, platform settings i environment-specific behavior-a.

Glavni cilj:

> Utvrditi da li pogrešna, missing, stale, duplicated ili cross-environment konfiguracija može izazvati security bypass, outage, data corruption, pogrešan provider, production-to-staging leak, debugging exposure ili rollback failure.

## 1. INVENTARIŠI CONFIG SOURCES

- `.env*`
- config files
- secret manager
- Docker
- CI
- Vercel/platform env
- Kubernetes ConfigMap/Secret
- CLI flags
- database-stored config
- remote config

## 2. CONFIG SCHEMA

Za svaku vrednost:

```text
Name:
Type:
Required:
Secret:
Environment:
Default:
Validated:
Consumer:
Restart required:
```

## 3. REQUIRED VARIABLES

Critical var ne sme tiho fallbackovati na dangerous default.

## 4. TYPE VALIDATION

String:

```text
"false"
```

nije boolean false ako parser pogreši.

## 5. NUMERIC VALIDATION

- negative
- zero
- NaN
- too high

## 6. URL VALIDATION

Database/provider/base URLs.

## 7. ENUM

Environment name/strategy.

## 8. CONFIG FAIL FAST

Production treba da odbije startup ako nema critical config.

## 9. DEFAULT SECRET

Critical.

## 10. DEFAULT DB

Ne sme slučajno koristiti development DB u production-u.

## 11. LOCALHOST FALLBACK

Cloud app može krenuti broken umesto fail-fast.

## 12. PROD/STAGING COLLISION

Uporedi vrednosti.

## 13. SHARED DB

High priority.

## 14. SHARED STORAGE

## 15. SHARED SIGNING SECRET

## 16. SHARED OAUTH CREDENTIAL

## 17. SHARED WEBHOOK SECRET

## 18. SHARED QUEUE

Cross-environment job contamination.

## 19. EMAIL/SMS PROVIDER

Staging ne treba slučajno slati stvarnim korisnicima ako product process to ne želi.

## 20. PAYMENT MODE

Test/live credential mismatch.

## 21. FEATURE FLAG

Environment-specific.

## 22. DEBUG

Production:

```text
DEBUG=true
DEV_MODE=true
AUTH_BYPASS=true
```

high priority.

## 23. LOG LEVEL

Debug može expose data/cost.

## 24. CORS ORIGIN

Environment-specific domains.

## 25. COOKIE DOMAIN

Staging/prod overlap.

## 26. COOKIE SECURE

TLS termination awareness.

## 27. BASE URL

Used for:

- reset links
- OAuth callback
- email links

## 28. HOST-DERIVED FALLBACK

Security risk ako trusted base URL nedostaje.

## 29. OAUTH CALLBACK

Production credentials + wrong callback.

## 30. JWT ISSUER/AUDIENCE

Environment separation.

## 31. STORAGE PREFIX

Prod/staging same bucket but distinct prefixes?

Authorization/lifecycle.

## 32. CDN DOMAIN

Wrong origin.

## 33. API BASE URL

Frontend production build ne sme zvati staging backend slučajno.

## 34. BUILD-TIME VS RUNTIME

Critical distinction.

## 35. NEXT/VITE PUBLIC VARS

Browser exposure.

## 36. BUILD CACHE

Changing env may not rebuild expected artifact if cache incorrect.

## 37. CONFIG SNAPSHOT

Rollback semantics.

## 38. OLD ARTIFACT + NEW ENV

Može biti incompatible.

## 39. ENV RENAMING

Old variable still used by one service.

## 40. DUPLICATE SOURCES

Same config exists in:

- repo
- CI
- platform

Ko pobeđuje?

## 41. PRECEDENCE

Dokumentuj actual order.

## 42. STALE ENV

Unused but valid secret remains.

## 43. SECRET ROTATION

Old/new variable names.

## 44. QUOTING

Spaces/newlines.

## 45. MULTILINE PRIVATE KEY

Formatting failure.

## 46. BASE64

Nije encryption.

## 47. TRAILING NEWLINE

Can break exact secrets/certs.

## 48. JSON ENV

Parsing errors.

## 49. CASE

Windows/Linux env semantics differences.

## 50. MISSING ENV IN ONE INSTANCE

Mixed fleet configuration.

## 51. CONFIG DRIFT

Two replicas with different values.

## 52. RUNTIME RELOAD

Ako config changes live:

atomicity/consistency.

## 53. REMOTE CONFIG

Failure behavior.

## 54. FEATURE FLAG OUTAGE

Fail-open vs fail-closed.

## 55. KILL SWITCH

Privileged remote config action.

## 56. CLIENT-CONTROLLED CONFIG

Frontend values nisu server authority.

## 57. RATE LIMIT CONFIG

Zero/unlimited semantics.

## 58. TIMEOUT

`0` može značiti no timeout ili immediate timeout.

## 59. RETRY COUNT

Huge value -> retry storm.

## 60. POOL SIZE

Too large -> DB outage.

## 61. CONCURRENCY

Can overwhelm provider.

## 62. UPLOAD LIMIT

Units:

- bytes
- MB
- MiB

## 63. TIME UNITS

ms vs seconds.

## 64. CRON

Timezone.

## 65. DATE/TIME

Environment timezone assumptions.

## 66. LOCALE

Parsing.

## 67. PROXY TRUST

`TRUST_PROXY=true` can alter IP/security behavior.

## 68. SESSION CONFIG

Cookie/expiry.

## 69. CACHE CONFIG

TTL units/stale data.

## 70. DATABASE SSL

Production security.

## 71. CERT VALIDATION

`NODE_TLS_REJECT_UNAUTHORIZED=0` or equivalents are critical.

## 72. INSECURE HTTP

Provider URL.

## 73. STORAGE PUBLIC FLAG

Dangerous one-bit config.

## 74. MAINTENANCE MODE

Authorization.

## 75. ADMIN BOOTSTRAP

Default credentials/config.

## 76. MIGRATION FLAG

Auto-migrate in prod.

## 77. SEED FLAG

Production seed/reset.

## 78. TEST MODE

Payment/email/auth.

## 79. MOCK PROVIDER

Must not accidentally remain in prod.

## 80. ERROR REPORTING DSN

Public DSN may be intentional; auth tokens are not.

## 81. MONITORING SAMPLE RATE

Cost/performance.

## 82. PII LOGGING FLAG

Security/privacy.

## 83. ENV DOCS

Compare `.env.example` vs actual usage.

## 84. UNUSED DOCUMENTED VAR

Can confuse operations.

## 85. UNDOCUMENTED REQUIRED VAR

Deploy risk.

## 86. CONFIG TEST

Automated schema validation.

## 87. FINDING FORMAT

```text
ID:
Severity:
Variable/config:
Environment:
Secret:
Current/default value state:
Consumer:
Failure path:
Impact:
Evidence:
Root cause:
Fix:
Validation test:
```

## 88. OUTPUT

`ENVIRONMENT_CONFIGURATION_AUDIT.md`

## 89. MATRIX

| Config | Dev | Preview | Staging | Prod | Shared | Risk |
|---|---|---|---|---|---|---|

## 90. SECOND PASS

Testiraj:

- remove each critical var
- invalid boolean
- wrong URL
- staging key in prod
- prod key in preview
- zero timeout
- huge pool
- debug on
- TLS verification off
- stale secret
- rollback old artifact with current env

## 91. FINAL QUALITY GATE

- source
- precedence
- required
- type
- environment isolation
- secret/public
- build/runtime
- dangerous defaults
- rollback compatibility
- config drift
- cross-environment services

# KONAČNO PRAVILO

Tražim:

```text
DATABASE_URL missing
↓
fallback:
postgres://localhost/dev

↓
production starts successfully
↓
healthcheck returns 200
↓
all writes go to wrong database/environment
```

ili:

```text
TLS_VERIFY env parser:
Boolean(process.env.TLS_VERIFY)

↓
TLS_VERIFY="false"

↓
Boolean("false") == true

↓
runtime behavior opposite configuration intent
```
