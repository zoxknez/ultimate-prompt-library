---
id: UPL-IT-048
number: 48
slug: environment-configuration-audit
title: Environment Configuration Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.0.0
status: stable
---

# ENVIRONMENT CONFIGURATION AUDIT

I want to perform a forensic audit of all environment variables, config files, runtime flags, platform settings, and environment-specific behaviors.

Main objective:

> Determine whether erroneous, missing, stale, duplicated, or cross-environment configuration can cause a security bypass, outage, data corruption, incorrect provider routing, production-to-staging leakage, debugging exposure, or rollback failure.

## 1. INVENTORY CONFIG SOURCES

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

For each value:

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

A critical variable must not silently fall back to a dangerous default.

## 4. TYPE VALIDATION

String:

```text
"false"
```

is not boolean false if the parser mishandles it.

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

Production must refuse startup if critical configuration is missing.

## 9. DEFAULT SECRET

Critical finding.

## 10. DEFAULT DB

Must not accidentally connect to a development database in production.

## 11. LOCALHOST FALLBACK

Cloud application may boot in a broken state instead of failing fast.

## 12. PROD/STAGING COLLISION

Compare configured values.

## 13. SHARED DB

High priority.

## 14. SHARED STORAGE

## 15. SHARED SIGNING SECRET

## 16. SHARED OAUTH CREDENTIAL

## 17. SHARED WEBHOOK SECRET

## 18. SHARED QUEUE

Cross-environment job contamination.

## 19. EMAIL/SMS PROVIDER

Staging must not accidentally dispatch communications to real users if operational process forbids it.

## 20. PAYMENT MODE

Test vs live credential mismatch.

## 21. FEATURE FLAG

Environment-specific toggles.

## 22. DEBUG

Production flags:

```text
DEBUG=true
DEV_MODE=true
AUTH_BYPASS=true
```

high priority.

## 23. LOG LEVEL

Debug logging can expose sensitive data or amplify costs.

## 24. CORS ORIGIN

Environment-specific domain configurations.

## 25. COOKIE DOMAIN

Staging and production domain overlap.

## 26. COOKIE SECURE

TLS termination awareness.

## 27. BASE URL

Used for:

- password reset links
- OAuth callbacks
- email verification links

## 28. HOST-DERIVED FALLBACK

Security risk if a trusted base URL is absent.

## 29. OAUTH CALLBACK

Production credentials configured with an erroneous callback URL.

## 30. JWT ISSUER/AUDIENCE

Strict environment separation.

## 31. STORAGE PREFIX

Prod and staging sharing the same bucket but using distinct prefixes?

Authorization and lifecycle implications.

## 32. CDN DOMAIN

Wrong origin mapping.

## 33. API BASE URL

Frontend production build must not accidentally call staging backends.

## 34. BUILD-TIME VS RUNTIME

Critical distinction.

## 35. NEXT/VITE PUBLIC VARS

Browser exposure.

## 36. BUILD CACHE

Modifying env variables might not trigger an expected artifact rebuild if cache invalidation fails.

## 37. CONFIG SNAPSHOT

Rollback semantics.

## 38. OLD ARTIFACT + NEW ENV

May introduce runtime incompatibility.

## 39. ENV RENAMING

Legacy variable name still consumed by an active service.

## 40. DUPLICATE SOURCES

Same configuration declared in:

- repository
- CI
- cloud platform

Which source takes precedence?

## 41. PRECEDENCE

Document the actual evaluation order.

## 42. STALE ENV

Unused yet valid secrets remaining in runtime configurations.

## 43. SECRET ROTATION

Old vs new variable names during transitions.

## 44. QUOTING

Handling spaces and embedded newlines.

## 45. MULTILINE PRIVATE KEY

Formatting and serialization failures.

## 46. BASE64

Is encoding, not encryption.

## 47. TRAILING NEWLINE

Can invalidate exact secret strings or certificates.

## 48. JSON ENV

JSON parsing failures.

## 49. CASE

Windows vs Linux environment variable case sensitivity differences.

## 50. MISSING ENV IN ONE INSTANCE

Fleet configuration drift.

## 51. CONFIG DRIFT

Two replicas operating with divergent values.

## 52. RUNTIME RELOAD

If configuration updates dynamically:

atomicity and consistency guarantees.

## 53. REMOTE CONFIG

Failure and fallback behavior.

## 54. FEATURE FLAG OUTAGE

Fail-open vs fail-closed posture.

## 55. KILL SWITCH

Privileged remote configuration actions.

## 56. CLIENT-CONTROLLED CONFIG

Frontend values are not authoritative for backend decisions.

## 57. RATE LIMIT CONFIG

Zero vs unlimited semantics.

## 58. TIMEOUT

`0` can denote no timeout or instantaneous timeout depending on runtime.

## 59. RETRY COUNT

Excessive value -> retry storm.

## 60. POOL SIZE

Too large -> database connection exhaustion.

## 61. CONCURRENCY

Can overwhelm downstream providers.

## 62. UPLOAD LIMIT

Units:

- bytes
- MB
- MiB

## 63. TIME UNITS

Milliseconds vs seconds.

## 64. CRON

Timezone assumptions.

## 65. DATE/TIME

Environment timezone discrepancies.

## 66. LOCALE

Parsing and formatting behaviors.

## 67. PROXY TRUST

`TRUST_PROXY=true` can distort client IP and security controls.

## 68. SESSION CONFIG

Cookie and expiration settings.

## 69. CACHE CONFIG

TTL units and stale data policies.

## 70. DATABASE SSL

Production security requirements.

## 71. CERT VALIDATION

`NODE_TLS_REJECT_UNAUTHORIZED=0` or equivalent bypasses are critical vulnerabilities.

## 72. INSECURE HTTP

Unencrypted provider URLs.

## 73. STORAGE PUBLIC FLAG

Dangerous single-bit configuration toggle.

## 74. MAINTENANCE MODE

Authorization and bypass controls.

## 75. ADMIN BOOTSTRAP

Default bootstrap credentials and configurations.

## 76. MIGRATION FLAG

Automatic migrations running in production.

## 77. SEED FLAG

Accidental production database seeding or resetting.

## 78. TEST MODE

Payment, email, or authentication test modes.

## 79. MOCK PROVIDER

Must never accidentally remain active in production.

## 80. ERROR REPORTING DSN

Public DSN may be benign; authentication/ingestion tokens are not.

## 81. MONITORING SAMPLE RATE

Cost and performance trade-offs.

## 82. PII LOGGING FLAG

Security and regulatory privacy compliance.

## 83. ENV DOCS

Compare `.env.example` against actual codebase consumption.

## 84. UNUSED DOCUMENTED VAR

Can confuse operations and maintenance.

## 85. UNDOCUMENTED REQUIRED VAR

Deployment failure risk.

## 86. CONFIG TEST

Automated schema validation on boot.

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

Test:

- remove each critical var
- invalid boolean parsing
- wrong URL formatting
- staging key in prod
- prod key in preview
- zero timeout edge case
- huge connection pool
- debug mode activated
- TLS verification disabled
- stale secret present
- rollback old artifact with current env

## 91. FINAL QUALITY GATE

- source
- precedence
- required
- type
- environment isolation
- secret/public boundary
- build/runtime separation
- dangerous defaults
- rollback compatibility
- config drift
- cross-environment services

# FINAL RULE

Looking for:

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

or:

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
