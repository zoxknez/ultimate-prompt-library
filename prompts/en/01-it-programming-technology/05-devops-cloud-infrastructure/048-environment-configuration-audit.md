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
version: 1.1.0
status: stable
---

# ENVIRONMENT CONFIGURATION AUDIT

I want to perform a forensic audit of all environment variables, config files, runtime flags, platform settings, and environment-specific behaviors.

Main objective:

> Determine whether erroneous, missing, stale, duplicated, or cross-environment configuration can cause a security bypass, outage, data corruption, incorrect provider routing, production-to-staging leakage, debugging exposure, or rollback failure.

## 1. NON-GOALS

- secret storage security as a whole (vault hardening, KMS design); only how configuration reaches and is interpreted by the application
- style preferences for naming or file layout without a failure path
- replacing the configuration system or mandating a specific library
- reviewing every non-critical variable with equal depth; prioritize values that affect security, data routing, money, availability and external side effects

## 2. CONTEXT DISCOVERY

Establish first:

```text
Languages/runtimes and the configuration library or parser in use:
Environments that exist (development, preview, staging, production, others):
Where each environment's values are stored and who can change them:
Deployment units that read configuration (web, workers, cron, functions, clients):
Build-time consumers (frontend bundlers, static generation, container build args):
Remote configuration or feature flag providers:
How configuration changes are deployed (restart, redeploy, hot reload):
```

Parsing and precedence rules differ between libraries, platforms and versions. Verify the behavior of the detected parser and platform instead of assuming it.

## 3. EVIDENCE MODEL

```text
A - observed: effective runtime value, startup log, config dump (redacted) or a test with the value set shows the behavior
B - complete path: every source, the precedence rule and the parsing code are visible
C - strong static evidence: code path is clear, but the actual value in an environment is not visible
D - inference: depends on platform values or precedence not verified
E - hardening: stronger validation or separation without a current failure path
```

Never print secret values in the report; reference them by name and describe their state (missing, default, shared, stale, test-mode).

## 4. FINDING STATUS

- **CONFIRMED** - tier A or B evidence shows the wrong effective value or the failure path.
- **LIKELY** - tier C: the code would fail with a plausible value, but the environment value was not seen.
- **NOT VERIFIED** - depends on values or precedence in environments that could not be inspected.
- **NOT APPLICABLE** - the variable or environment does not exist.
- **CONTROLLED** - validation, isolation or a guard neutralizes the risk.
- **HARDENING** - improvement without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete security, correctness, reliability, data-routing or operational failure path.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A value shared across environments is not automatically wrong: public URLs of third parties, feature defaults, log formats and non-secret identifiers are often identical. It becomes a finding when sharing lets one environment read, write, sign for or trigger side effects in another.
- A default value in code is fine when it is safe in every environment where it can apply (for example a conservative timeout); it is a finding when it is a credential, points to a real resource, or weakens security.
- A publishable key or public DSN in the client bundle is expected.
- Duplicate definitions with identical values are a maintainability note, not a defect.
- An undocumented optional variable is not a deployment risk.

## 6. INVENTORY CONFIG SOURCES

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

## 7. SOURCE HIERARCHY AND PRECEDENCE

List every layer that can provide a value, in the order the runtime actually applies them:

```text
code default
-> committed config files (per environment)
-> .env files (which ones are loaded, in which order, in which environments)
-> container image (ENV, build args)
-> CI/CD injected variables
-> secret manager (fetched at build, at start, or per request)
-> platform environment settings
-> runtime remote config / feature flags
-> command-line flags
```

For each critical variable, state the **effective value source** in each environment. A value set in the dashboard that is overridden by a baked-in image `ENV` or a committed `.env.production` is a common silent failure.

## 8. CONFIG SCHEMA

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

## 9. REQUIRED VARIABLES

A critical variable must not silently fall back to a dangerous default.

## 10. TYPE VALIDATION

String:

```text
"false"
```

is not boolean false if the parser mishandles it.

## 11. NUMERIC VALIDATION

- negative
- zero
- NaN
- too high

## 12. URL VALIDATION

Database/provider/base URLs.

## 13. ENUM

Environment name/strategy.

## 14. CONFIG FAIL FAST

Production must refuse startup if critical configuration is missing.

## 15. TYPED SCHEMA AND UNITS

Every critical value should be parsed into a type once, at startup, with explicit rules:

```text
boolean   : accepted literals ("true"/"false", "1"/"0"); anything else rejected, not truthy
integer   : range checked; NaN, negative and zero handled deliberately
duration  : unit explicit in the name or value (TIMEOUT_MS, "30s"); zero meaning defined
size      : unit explicit (bytes, MB vs MiB)
URL       : scheme, host and path validated; https required where it matters
enum      : closed set; unknown value rejected
JSON      : parsed and schema-validated; parse error stops startup
secret    : non-empty, expected format, no surrounding whitespace or newline
```

Check whether the application fails fast on invalid critical configuration or starts in a degraded or unsafe state. Unit mismatches (seconds read as milliseconds, MB vs MiB) are correctness findings when they change a timeout, limit or TTL by orders of magnitude.

## 16. DEFAULT SECRET

Critical finding.

## 17. DEFAULT DB

Must not accidentally connect to a development database in production.

## 18. LOCALHOST FALLBACK

Cloud application may boot in a broken state instead of failing fast.

## 19. DANGEROUS DEFAULTS

Search for fallbacks that activate when a value is missing or empty, and classify them:

```text
debug or development mode enabled
authentication or authorization bypass
localhost or development service URLs
test/sandbox payment, email or SMS providers
TLS verification disabled
public storage or permissive CORS
hard-coded signing keys, passwords or tokens
mock providers
```

A missing variable in production must either stop startup or fall back to the **safer** behavior, never to a more permissive one.

## 20. PROD/STAGING COLLISION

Compare configured values.

## 21. SHARED DB

High priority.

## 22. SHARED STORAGE

## 23. SHARED SIGNING SECRET

## 24. SHARED OAUTH CREDENTIAL

## 25. SHARED WEBHOOK SECRET

## 26. SHARED QUEUE

Cross-environment job contamination.

## 27. SHARED RESOURCES ACROSS ENVIRONMENTS

For each resource reachable from more than one environment (database, Redis, queue, storage bucket, OAuth client, webhook secret, signing key, email/SMS/payment account), answer:

- Is isolation provided by separate credentials, a namespace/prefix, or nothing?
- Can the non-production environment **read** production data, **write** it, **consume** production jobs, **sign** tokens accepted by production, or **trigger** real external side effects?
- Does a cleanup, migration or flush in one environment affect the other?

Report the concrete cross-environment path, not the fact of sharing.

## 28. EMAIL/SMS PROVIDER

Staging must not accidentally dispatch communications to real users if operational process forbids it.

## 29. PAYMENT MODE

Test vs live credential mismatch.

## 30. FEATURE FLAG

Environment-specific toggles.

## 31. DEBUG

Production flags:

```text
DEBUG=true
DEV_MODE=true
AUTH_BYPASS=true
```

high priority.

## 32. LOG LEVEL

Debug logging can expose sensitive data or amplify costs.

## 33. CORS ORIGIN

Environment-specific domain configurations.

## 34. COOKIE DOMAIN

Staging and production domain overlap.

## 35. COOKIE SECURE

TLS termination awareness.

## 36. BASE URL

Used for:

- password reset links
- OAuth callbacks
- email verification links

## 37. HOST-DERIVED FALLBACK

Security risk if a trusted base URL is absent.

## 38. OAUTH CALLBACK

Production credentials configured with an erroneous callback URL.

## 39. JWT ISSUER/AUDIENCE

Strict environment separation.

## 40. STORAGE PREFIX

Prod and staging sharing the same bucket but using distinct prefixes?

Authorization and lifecycle implications.

## 41. CDN DOMAIN

Wrong origin mapping.

## 42. API BASE URL

Frontend production build must not accidentally call staging backends.

## 43. BUILD-TIME VS RUNTIME

Critical distinction.

## 44. NEXT/VITE PUBLIC VARS

Browser exposure.

## 45. BUILD CACHE

Modifying env variables might not trigger an expected artifact rebuild if cache invalidation fails.

## 46. CONFIG SNAPSHOT

Rollback semantics.

## 47. OLD ARTIFACT + NEW ENV

May introduce runtime incompatibility.

## 48. CONFIGURATION ROLLBACK COMPATIBILITY

Configuration and code are deployed on different timelines. Check both directions:

- **old artifact, new configuration** - a rollback runs code that does not know renamed or newly required variables, or interprets a changed value differently
- **new artifact, old configuration** - code deployed before the configuration it requires

Renames and semantic changes need a transition period where both names or both meanings are accepted.

## 49. ENV RENAMING

Legacy variable name still consumed by an active service.

## 50. DUPLICATE SOURCES

Same configuration declared in:

- repository
- CI
- cloud platform

Which source takes precedence?

## 51. PRECEDENCE

Document the actual evaluation order.

## 52. STALE ENV

Unused yet valid secrets remaining in runtime configurations.

## 53. SECRET ROTATION

Old vs new variable names during transitions.

## 54. ROTATION OVERLAP

For each rotated secret (signing keys, webhook secrets, API keys, database passwords):

- Can old and new values be valid at the same time during rollout?
- Are all consumers (every replica, worker, function, external caller) updated before the old value is revoked?
- Are tokens signed with the old key still verified until they expire?
- What happens if the rollout is rolled back mid-rotation?

A rotation without overlap is an outage scheduled at the moment of rotation.

## 55. QUOTING

Handling spaces and embedded newlines.

## 56. MULTILINE PRIVATE KEY

Formatting and serialization failures.

## 57. BASE64

Is encoding, not encryption.

## 58. TRAILING NEWLINE

Can invalidate exact secret strings or certificates.

## 59. JSON ENV

JSON parsing failures.

## 60. CASE

Windows vs Linux environment variable case sensitivity differences.

## 61. MISSING ENV IN ONE INSTANCE

Fleet configuration drift.

## 62. CONFIG DRIFT

Two replicas operating with divergent values.

## 63. REPLICA AND DEPLOYMENT-UNIT DRIFT

Compare effective configuration across every unit that must agree: web replicas, workers, cron jobs, functions and regions. Values that must be identical (signing keys, feature flags that affect data format, database targets) cause split behavior when they drift. Check how configuration reaches each unit and whether any unit is deployed or restarted on a different schedule.

## 64. RUNTIME RELOAD

If configuration updates dynamically:

atomicity and consistency guarantees.

## 65. REMOTE CONFIG

Failure and fallback behavior.

## 66. FEATURE FLAG OUTAGE

Fail-open vs fail-closed posture.

## 67. FEATURE FLAG SEMANTICS

For each flag that gates security, money, data format or external side effects:

- **default when the provider is unavailable** - fail-open (feature on) or fail-closed (feature off), and is that the safe side?
- **stale cache** - how long a changed flag takes to reach every instance, and what happens in between
- **evaluation consistency** - can one request or job see different values at different steps?
- **targeting** - can user-controlled attributes (headers, claims, query parameters) change targeting?
- **lifecycle** - stale flags whose "off" path is no longer tested

## 68. KILL SWITCH

Privileged remote configuration actions.

## 69. CLIENT-CONTROLLED CONFIG

Frontend values are not authoritative for backend decisions.

## 70. RATE LIMIT CONFIG

Zero vs unlimited semantics.

## 71. TIMEOUT

`0` can denote no timeout or instantaneous timeout depending on runtime.

## 72. RETRY COUNT

Excessive value -> retry storm.

## 73. POOL SIZE

Too large -> database connection exhaustion.

## 74. CONCURRENCY

Can overwhelm downstream providers.

## 75. UPLOAD LIMIT

Units:

- bytes
- MB
- MiB

## 76. TIME UNITS

Milliseconds vs seconds.

## 77. CRON

Timezone assumptions.

## 78. DATE/TIME

Environment timezone discrepancies.

## 79. LOCALE

Parsing and formatting behaviors.

## 80. PROXY TRUST

`TRUST_PROXY=true` can distort client IP and security controls.

## 81. SESSION CONFIG

Cookie and expiration settings.

## 82. CACHE CONFIG

TTL units and stale data policies.

## 83. DATABASE SSL

Production security requirements.

## 84. CERT VALIDATION

`NODE_TLS_REJECT_UNAUTHORIZED=0` or equivalent bypasses are critical vulnerabilities.

## 85. INSECURE HTTP

Unencrypted provider URLs.

## 86. STORAGE PUBLIC FLAG

Dangerous single-bit configuration toggle.

## 87. MAINTENANCE MODE

Authorization and bypass controls.

## 88. ADMIN BOOTSTRAP

Default bootstrap credentials and configurations.

## 89. MIGRATION FLAG

Automatic migrations running in production.

## 90. SEED FLAG

Accidental production database seeding or resetting.

## 91. TEST MODE

Payment, email, or authentication test modes.

## 92. MOCK PROVIDER

Must never accidentally remain active in production.

## 93. ERROR REPORTING DSN

Public DSN may be benign; authentication/ingestion tokens are not.

## 94. MONITORING SAMPLE RATE

Cost and performance trade-offs.

## 95. PII LOGGING FLAG

Security and regulatory privacy compliance.

## 96. ENV DOCS

Compare `.env.example` against actual codebase consumption.

## 97. UNUSED DOCUMENTED VAR

Can confuse operations and maintenance.

## 98. UNDOCUMENTED REQUIRED VAR

Deployment failure risk.

## 99. CONFIG TEST

Automated schema validation on boot.

## 100. MANDATORY FAILURE WALKTHROUGH

For each scenario, state the current behavior, how it is detected and how it is recovered:

```text
DATABASE_URL (or another critical URL) is missing in production
"false" is parsed as truthy
timeout is set to 0
a duration or size is configured in the wrong unit
a staging credential is used in production
a production secret is available to a preview or staging build
TLS verification is disabled by a variable
an old artifact runs with the new configuration (rollback)
the feature flag provider is unavailable
one replica has a different value than the others
```

## 101. MATRICES

### Configuration Source / Precedence Matrix

| Config | Code default | Files | Image/CI | Secret manager | Platform | Remote config | Effective source | Parsed type and validation |
|---|---|---|---|---|---|---|---|---|

### Environment Comparison Matrix

| Config | Dev | Preview | Staging | Prod | Shared | Cross-environment path | Risk |
|---|---|---|---|---|---|---|---|

## 102. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Variable/config:
Environment:
Secret (yes/no):
Scope (deployment units affected):
Trigger:
Current / default value state:
Effective source and precedence:
Consumer:
Expected invariant:
Failure path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Validation test:
Regression risk:
```

## 103. SEVERITY

- **P0** - configuration that disables authentication or TLS verification in production, exposes production secrets publicly, or lets a non-production environment write to or sign for production.
- **P1** - production silently routed to the wrong database, provider or environment, test/live mode mismatch with real money or messages, or a dangerous default that activates on a missing value.
- **P2** - misparsed or wrong-unit values affecting timeouts, limits or retries; rotation without overlap; rollback-incompatible configuration; drift between replicas.
- **P3** - limited issues: stale variables, missing documentation for required values, non-critical duplicates with different values.
- **P4** - hardening: typed schema, stricter validation, where no current failure path exists.

## 104. OUTPUT

`ENVIRONMENT_CONFIGURATION_AUDIT.md`

## 105. SECOND PASS

Test or analyze:

- remove each critical variable and start the service
- invalid boolean, integer, URL and JSON values
- zero, negative and very large numeric values; wrong units
- a staging key in production and a production key in preview
- a huge connection pool or concurrency value
- debug mode activated
- TLS verification disabled
- a stale secret still present
- rollback of the old artifact with the current configuration
- the feature flag provider unavailable at startup and during runtime
- one replica restarted with a different value

Then try to disprove each finding: does a later layer override the value, does startup validation reject it, or is the dangerous code path unreachable in that environment? Mark findings that depend on unseen environment values as **NOT VERIFIED**.

## 106. FINAL QUALITY GATE

Before returning the report, verify that it covers:

- every configuration source and the actual precedence order
- effective source of each critical value per environment
- required values, typed parsing, units and fail-fast behavior
- dangerous defaults on missing values
- environment isolation and every shared resource with its cross-environment path
- secret/public boundary and build-time vs runtime reads
- rollback compatibility of configuration in both directions
- rotation overlap for rotated secrets
- drift between replicas and deployment units
- feature flag fail-open/fail-closed behavior and staleness
- TLS, cookie, CORS, base URL and proxy trust settings
- test/mock/seed/migration flags in production
- no secret values printed in the report
- consistent statuses and evidence tiers

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

Other failure chains to look for:

```text
REQUEST_TIMEOUT=30 set in the platform
↓
code treats the value as milliseconds
↓
every outbound call times out after 30 ms
↓
retries multiply load on the provider
↓
checkout fails under normal traffic
```

```text
staging and production share one Redis instance
↓
both use the same queue name
↓
staging worker consumes production jobs
↓
jobs run with staging configuration and staging database
↓
production emails, payments or exports are lost or corrupted
```
