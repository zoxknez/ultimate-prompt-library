---
id: UPL-IT-035
number: 35
slug: secrets-and-credential-exposure-audit
title: Secrets & Credential Exposure Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# SECRETS AND CREDENTIAL EXPOSURE AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of all locations where secrets, credentials, tokens, signing keys, connection strings, and other sensitive authentication materials might be:

- committed
- built
- logged
- transmitted to clients
- exposed via CI/CD
- leaked through error reporting
- bundled into frontend assets
- left inside Docker images
- retained in history/artifacts
- made too broadly accessible to runtime processes

Main goal:

> Determine whether a concrete path exists by which an unauthorized individual can obtain credentials sufficient to access production systems, third-party services, databases, cloud resources, admin APIs, or other sensitive capabilities.

This is not:

- a generic "never commit .env" checklist
- automatically reporting every string resembling an API key
- treating public frontend API identifiers as secrets
- automatic rotation of all credentials
- merely a Git secret scan
- merely a `.env` audit
- assuming every exposed token remains active
- a dependency supply-chain audit
- a comprehensive cloud IAM review

The focus is on the complete secret lifecycle:

```text
secret creation
↓
storage
↓
distribution
↓
runtime use
↓
logging / telemetry
↓
rotation
↓
revocation
```

Priority:

**valid production credential exposure > signing/decryption key exposure > database/cloud credentials > privileged API tokens > CI/CD secrets > auth/session secrets > accidental logs/artifacts > stale/revoked secrets > hygiene**

It is better to identify 3 genuinely valid production credential exposures than to report 500 random strings.

---

# 1. ESTABLISH THE SECRET MODEL

Before documenting findings, identify the classes of secrets used across the project:

- database passwords
- connection strings
- cloud access keys
- API keys
- OAuth client secrets
- JWT signing secrets
- private keys
- webhook secrets
- session secrets
- encryption keys
- SMTP credentials
- storage credentials
- CI/CD tokens
- package registry tokens
- deploy tokens
- SSH keys
- admin bootstrap credentials

---

# 2. CLASSIFY SECRETS

For each candidate discovered, classify:

```text
PUBLIC IDENTIFIER
LOW-PRIVILEGE SECRET
PRODUCTION CREDENTIAL
SIGNING KEY
ENCRYPTION KEY
ADMIN CREDENTIAL
DEPLOYMENT CREDENTIAL
UNKNOWN
```

---

# 3. PUBLIC VALUES ARE NOT SECRETS

Examples that frequently are not true secrets:

- Stripe publishable keys
- Firebase public configurations
- public OAuth client IDs
- analytics IDs
- project IDs

Do not report values simply because they "look like a key".

---

# 4. SECRET VALIDATION

For every serious candidate, answer:

> Is this value likely an active credential or merely a placeholder, test fixture, or example?

---

# 5. PLACEHOLDERS

Examples:

```text
sk_test_example
your-api-key-here
changeme
```

do not automatically constitute security incidents.

---

# 6. PRODUCTION CONTEXT

Look for confirming evidence:

- production hostnames
- real service endpoints
- active CI usage
- deployment configurations
- matching secret naming schemes
- recent commits

---

# 7. DO NOT TEST CREDENTIALS AGAINST THIRD-PARTY SERVICES WITHOUT AUTHORIZATION

Verify validity exclusively through:

- local configurations
- controlled environments
- already accessible provider metadata
- explicitly authorized tests

Never attempt unauthorized logins.

---

# 8. SOURCE CODE SCAN

Search through:

- `.ts`
- `.js`
- `.py`
- `.java`
- `.kt`
- `.go`
- `.cs`
- shell scripts
- configuration files
- IaC definitions

for secret-like values.

---

# 9. CONFIGURATION FILES

Specifically audit:

```text
.env
.env.local
.env.production
config.json
settings.json
application.yml
application.properties
secrets.json
```

---

# 10. `.env.example`

May legitimately contain variable names and placeholder values.

Do not report without evidence of real credentials.

---

# 11. PRODUCTION `.env`

If real secrets reside in repository files:

this constitutes a serious finding.

---

# 12. GITIGNORE

Verify that sensitive files are properly ignored.

P4 hardening if no actual exposure occurred.

---

# 13. GIT HISTORY

A secret deleted from the current branch may still reside in Git history.

---

# 14. DELETED != REVOKED

If a credential was ever committed:

deleting it from Git does not invalidate the credential.

---

# 15. ROTATION

Confirmed exposed credentials must be treated as compromised until proven to be:

- revoked
- expired
- rotated

---

# 16. HISTORY SCOPE

If a secret existed in a public repository:

exposure assumptions are substantially more severe.

---

# 17. PRIVATE REPOSITORIES

A private repository narrows the attack surface, but does not render storing secrets in source code secure.

---

# 18. FORKS

Public or private forks may retain committed history indefinitely.

---

# 19. PULL REQUESTS

Secrets may persist in:

- commit diffs
- review comments
- CI job logs

---

# 20. ISSUES

Developers sometimes paste tokens into issue trackers.

If issue connectors or repository metadata allow, verify.

---

# 21. DOCUMENTATION

README files and tutorials may inadvertently contain real credentials.

---

# 22. EXAMPLE COMMANDS

Example:

```text
curl -H "Authorization: Bearer real_token"
```

---

# 23. TESTS

Test fixtures may contain:

- real API tokens
- production database connection strings

---

# 24. SNAPSHOTS

Test snapshots may inadvertently capture secrets from API responses.

---

# 25. GOLDEN FILES

The same risk applies to golden test fixtures.

---

# 26. GENERATED FILES

Build and configuration generators may emit secrets into output files that get committed.

---

# 27. FRONTEND BUNDLE

The paramount rule:

> Treat anything that ends up in a browser bundle as public.

---

# 28. FRONTEND ENV PREFIXES

Examples:

```text
NEXT_PUBLIC_
VITE_
REACT_APP_
PUBLIC_
```

depending on the technology stack.

All such values become publicly visible.

---

# 29. SERVER SECRET WITH PUBLIC PREFIX

Critical vulnerability candidate.

---

# 30. FRONTEND BUILD-TIME INJECTION

Secrets can be baked into compiled JavaScript even if source code references environment variables.

---

# 31. SOURCE MAPS

Source maps can reveal:

- embedded configuration values
- source literals

but do not automatically constitute a secret exposure.

---

# 32. STATIC HTML

Build steps may inline configuration values directly into static HTML.

---

# 33. NEXT.JS SERVER/CLIENT BOUNDARY

If the stack uses Next.js:

verify that server-only secrets are never imported into client component dependency paths.

---

# 34. CLIENT COMPONENT IMPORTS

Transitive imports can pull configuration modules directly into browser bundles.

---

# 35. BUILD ANALYSIS

Do not rely solely on source code.

Inspect production build artifacts wherever accessible.

---

# 36. PUBLIC NETWORK RESPONSES

Secrets can leak through API response payloads.

---

# 37. RAW CONFIGURATION ENDPOINTS

Search for:

```text
/config
/env
/settings
/debug
```

---

# 38. ERROR RESPONSES

Third-party SDK errors may contain:

- API tokens
- request headers
- connection strings

---

# 39. STACK TRACES

May include environment and configuration values if custom errors attach them.

---

# 40. SERIALIZED ERROR OBJECTS

Never return raw provider error objects to clients without sanitization.

---

# 41. GRAPHQL

Introspection is not a secret leak in itself.

However, resolvers may inadvertently expose configuration or secret fields.

---

# 42. ADMIN CONFIGURATION UI

If the UI displays integration settings:

verify whether secrets are masked:

```text
********
```

or rendered in plaintext.

---

# 43. SECRET READBACK

Systems should generally allow:

- replacing
- rotating

without displaying the full active secret again.

---

# 44. SECRET "SHOW" BUTTON

If present:

verify strict authorization and re-authentication requirements.

---

# 45. DATABASE MODEL

If integration secrets are stored in the database:

verify whether they are:

- plaintext
- encrypted
- hashed

depending on whether runtime workflows need to recover the original secret.

---

# 46. HASH VS ENCRYPT

If the application must forward the original secret to an upstream provider:

hashing is insufficient.

Encryption at rest is required.

---

# 47. API KEYS USED ONLY FOR VERIFICATION

If the backend merely verifies client-provided API keys:

hash-based storage is the superior pattern.

---

# 48. ENCRYPTION KEYS

If secrets in the database are encrypted:

where is the master encryption key stored?

---

# 49. KEY IN THE SAME DATABASE

If the encryption key resides alongside ciphertext in the same database table:

protection against database compromise is minimal.

---

# 50. APPLICATION ENVIRONMENT KEY

Can be a valid model if the threat model separates database storage from runtime secret stores.

---

# 51. LOGGING

Repository-wide search for:

```text
console.log
logger.*
print
dump
trace
```

handling authentication or configuration objects.

---

# 52. AUTHORIZATION HEADER

Must be redacted unconditionally.

---

# 53. COOKIES

Session cookies must never be logged in full.

---

# 54. API REQUEST DEBUGGING

HTTP client debug logging may record sensitive request and response headers.

---

# 55. PROVIDER SDK DEBUG LOGS

Verbose provider SDK logs frequently include credentials.

---

# 56. DATABASE CONNECTION STRINGS

ORM startup routines may print the complete connection URL:

```text
postgres://user:password@host/db
```

---

# 57. URL USERINFO

Credentials embedded in URLs leak readily into access logs and telemetry.

---

# 58. QUERY PARAMETER SECRETS

Examples:

```text
?api_key=...
?token=...
```

Can easily land in:

- access logs
- browser history
- proxy logs

---

# 59. STRUCTURED LOG OBJECTS

Pattern:

```text
logger.info({ req })
```

can serialize full headers and request bodies.

---

# 60. REDACTION

Inspect logger configurations for:

- authorization
- cookie
- password
- token
- secret
- apiKey

---

# 61. CASE VARIANTS

Redaction rules might catch `password`, but overlook:

```text
newPassword
clientSecret
access_token
```

---

# 62. NESTED VALUES

Redaction logic may operate only on top-level properties.

---

# 63. ERROR MONITORING

Sentry-like platforms can automatically collect:

- request headers
- request bodies
- local variable scopes
- breadcrumbs

---

# 64. SENTRY `sendDefaultPii`

If relevant, inspect actual configuration settings.

---

# 65. BREADCRUMBS

Fetch/XHR breadcrumbs can expose URL-based tokens.

---

# 66. LOCAL VARIABLES

Server error monitoring may capture stack frame local variables containing secrets.

---

# 67. APM

Datadog, New Relic, and OpenTelemetry trace spans can inadvertently contain sensitive attributes.

---

# 68. TRACE HEADERS

Never attach authentication tokens as span attributes.

---

# 69. METRICS

Secrets must never appear as metric labels.

---

# 70. ANALYTICS

Frontend analytics payloads may include:

- password reset tokens
- authentication tokens
- secret form inputs

---

# 71. FORM AUTO-CAPTURE

Session replay and analytics auto-capture represent high-signal risks on authentication and administrative secret forms.

---

# 72. SESSION REPLAY

Verify masking across all sensitive inputs.

---

# 73. CI/CD

Inspect:

- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
- other deployment pipelines

---

# 74. SECRET STORES

CI secrets must originate from protected secret managers or platform equivalents.

---

# 75. SECRETS IN YAML

Hardcoding secrets inside pipeline workflow files is an active exposure.

---

# 76. `echo $SECRET`

Critical CI log leakage.

---

# 77. DEBUG SHELL OPTIONS

`set -x` prints commands with expanded secrets into build output.

---

# 78. ENVIRONMENT DUMPS

Patterns like:

```text
env
printenv
set
```

in CI steps can dump full environment secrets into logs.

---

# 79. MASKING

Platform log masking provides defense-in-depth, but cannot be relied on for transformed secret values.

---

# 80. TRANSFORMED SECRETS

Base64-encoded, substringed, or JSON-wrapped secrets often evade automated log masking.

---

# 81. ARTIFACTS

Build artifacts may inadvertently package:

- `.env` files
- credential files
- signing keys

---

# 82. CACHE

CI dependency and build caches may accidentally store files containing secrets.

---

# 83. WORKSPACE UPLOADS

Overly broad `upload-artifact` path definitions can capture `.env` files.

---

# 84. TEST REPORTS

Test execution outputs can embed secrets.

---

# 85. SCREENSHOTS

End-to-end UI test screenshots may capture plaintext secrets in admin panels.

---

# 86. FORKED PULL REQUESTS

Specifically audit conditions under which CI secrets become available to untrusted pull request code.

---

# 87. PULL_REQUEST_TARGET

If GitHub Actions uses privileged workflow triggers with access to repository secrets:

review execution trust boundaries with extreme care.

---

# 88. CHECKING OUT UNTRUSTED CODE

High-risk combination:

```text
privileged workflow
+
production secrets
+
checkout attacker-controlled PR
+
execute code
```

Can enable direct credential exfiltration.

---

# 89. THIRD-PARTY ACTIONS

Pinned versus unpinned actions belong in supply-chain audits, but verify whether untrusted actions hold access to sensitive secrets.

---

# 90. SECRET SCOPING

Do not grant every secret to every pipeline job.

---

# 91. JOB ENVIRONMENTS

Restrict deployment credentials strictly to deploy jobs.

---

# 92. ENVIRONMENT PROTECTION

Production secrets should be guarded by environment review rules and approvals.

P4/P2 depending on actual exposure risks.

---

# 93. DEPLOYMENT

Review configurations across:

- Vercel environment variables
- Docker
- Kubernetes
- Docker Compose
- systemd
- serverless cloud functions

---

# 94. DOCKERFILE

Search for:

```text
ENV SECRET=...
ARG SECRET
COPY .env
```

---

# 95. BUILD ARGUMENTS

Docker `ARG` variables are not secret storage mechanisms.

Values can persist in image history and build metadata.

---

# 96. MULTI-STAGE BUILDS

Secrets consumed during build stages can still leak if:

- copied into final images
- cached improperly
- embedded within build artifacts

---

# 97. `.dockerignore`

Must prevent copying unnecessary secret files into the build context.

---

# 98. DOCKER IMAGES

Inspect final image layers and filesystem contents.

---

# 99. IMAGE HISTORY

A secret deleted in a later Docker layer remains retrievable from earlier layers.

---

# 100. PRIVATE REGISTRIES

A private registry narrows external exposure, but does not resolve embedded credentials.

---

# 101. CONTAINER ENVIRONMENT VARIABLES

Runtime environment variables are a standard mechanism for secret distribution.

However, audit who can inspect:

- process environments
- orchestrator metadata
- debug endpoints

---

# 102. `docker inspect`

Operators with Docker daemon access can typically inspect environment variables.

This reflects a privilege model rather than an automatic defect.

---

# 103. KUBERNETES

If running on Kubernetes:

review:

- Secret objects
- RBAC permissions
- volume mounts
- environment bindings
- namespace boundaries

---

# 104. KUBERNETES SECRETS BASE64

Base64 encoding is not encryption.

---

# 105. SECRET VOLUME PERMISSIONS

Verify process user and filesystem permissions on mounted secret volumes.

---

# 106. SERVICE ACCOUNT TOKENS

Pods may mount overly broad cluster service account credentials without necessity.

Audit in depth alongside cloud IAM reviews.

---

# 107. CONFIGMAPS

True secrets must never be placed inside ConfigMaps.

---

# 108. SYSTEMD

Review `Environment=` directives and environment file filesystem permissions.

---

# 109. FILE-BASED SECRETS

If secrets reside on disk:

verify restrictive filesystem permissions.

---

# 110. SSH PRIVATE KEYS

Specifically search for:

```text
-----BEGIN PRIVATE KEY-----
```

---

# 111. PUBLIC KEYS ARE NOT SECRETS

Do not report `.pub` files as credential exposures.

---

# 112. TLS PRIVATE KEYS

Exposure can enable traffic decryption or server impersonation depending on key usage.

---

# 113. SIGNING PRIVATE KEYS

JWT, package, and code signing private keys represent critical-impact assets.

---

# 114. CERTIFICATES

Certificates are publicly shareable assets by design.

The private key is the secret.

---

# 115. MOBILE APPLICATIONS

Anything embedded within APK or IPA binaries can be extracted.

---

# 116. MOBILE "SECRETS"

Client-side API secrets are not true secrets when distributed to every app user.

---

# 117. DESKTOP APPLICATIONS

The same rule applies to distributed desktop executables.

---

# 118. OBFUSCATION

Code obfuscation does not turn client-embedded secrets into trustworthy credentials.

---

# 119. ANDROID `strings.xml`

Frequent secret candidate.

---

# 120. BUILD CONFIG

`BuildConfig.SECRET` in APKs is not secure secret storage.

---

# 121. IOS PLIST

Same risk applies to iOS plist files.

---

# 122. DESKTOP CONFIGURATIONS

Bundled JSON and application resources.

---

# 123. SERVER CREDENTIALS IN CLIENT APPLICATIONS

High severity if the credential grants privileged backend or cloud provider access.

---

# 124. API DESIGN

If clients require provider credentials to function:

the architecture likely demands a backend proxy or ephemeral scoped token.

Do not recommend changes without an actual use case.

---

# 125. SIGNED URLS

Ephemeral scoped signed URLs and tokens may legitimately be returned to clients.

This is not a secret leak simply because a token is visible to its intended recipient.

---

# 126. TOKEN SCOPING

Evaluate:

- resource constraints
- permitted HTTP methods
- expiration lifetime
- intended audience

---

# 127. OVER-BROAD EPHEMERAL TOKENS

A short lifetime provides little defense if the token grants global admin rights.

---

# 128. DATABASES

Search for embedded credentials in:

- migrations
- seed scripts
- backup scripts
- connection configurations

---

# 129. DATABASE DUMPS

SQL dumps can contain:

- user credentials
- API tokens
- integration secrets
- password hashes

---

# 130. BACKUPS

A backup archive residing in a public bucket is a catastrophic exposure.

---

# 131. PASSWORD HASHES

A hash is not a plaintext secret, but represents highly sensitive authentication material.

---

# 132. UNSALTED FAST HASHES

Cryptographic analysis belongs in authentication audits, but exposure elevates breach impact.

---

# 133. API TOKEN TABLES

If raw bearer tokens are stored in the database:

a database dump yields instant impersonation.

---

# 134. HASHING API TOKENS

If only token verification is required:

prefer salted hashing at rest.

---

# 135. ENCRYPTING THIRD-PARTY TOKENS

If the backend must reuse the token for outbound API calls:

encryption at rest is necessary.

---

# 136. REFRESH TOKENS

Treat as high-value credentials.

---

# 137. OAUTH PROVIDER TOKENS

Can confer direct access to users' external accounts.

---

# 138. CLOUD CREDENTIALS

Highest priority if granting broad infrastructure permissions.

---

# 139. IAM SCOPES

The impact of an exposed credential depends entirely on its granted permissions.

If permissions cannot be determined:

**CREDENTIAL PRIVILEGES: NOT VERIFIED**

---

# 140. ROOT / OWNER CREDENTIALS

P0 candidate.

---

# 141. DATABASE SUPERUSERS

High impact.

---

# 142. READ-ONLY CREDENTIALS

Lower severity, but sensitive data exposure can remain catastrophic.

---

# 143. WEBHOOK SECRETS

Exposure allows event spoofing only if the receiver relies exclusively on that secret.

---

# 144. SESSION SIGNING SECRETS

Exposure allows cookie session forgery in specific web frameworks.

---

# 145. JWT SIGNING SECRETS

If symmetric:

an attacker can forge valid tokens given the claims schema and verification rules.

---

# 146. JWT PRIVATE KEYS

High impact.

---

# 147. ENCRYPTION MASTER KEYS

Can decrypt all encrypted stored data at rest.

---

# 148. ROTATED SECRETS

If a revoked credential is confirmed inactive:

severity for active exploitability decreases.

However, historical exposure and process findings remain.

---

# 149. EXPIRATION

An expired token is no longer an active access credential.

---

# 150. SECRET VERSIONS

Map:

```text
current
old
unknown
```

---

# 151. DUPLICATE SECRET USAGE

Using the same production secret across multiple services or environments:

significantly inflates blast radius.

---

# 152. STAGING EQUALS PRODUCTION SECRETS

Especially dangerous.

Compromising a lower-security staging environment directly compromises production.

---

# 153. SHARED JWT SECRETS

Token trust between development, staging, and production can be dangerously conflated.

---

# 154. SHARED DATABASE CREDENTIALS

Multiple applications sharing a single privileged database account.

---

# 155. PER-SERVICE CREDENTIALS

Dramatically restrict breach blast radius.

P4/P2 depending on confirmed broad exposure.

---

# 156. ROTATION CAPABILITY

For every high-value secret, ask:

> Can this secret be rotated without causing an extended outage?

---

# 157. DUAL-KEY ROTATION

Signing and webhook secrets frequently require dual-key overlap periods during rotation.

---

# 158. NEVER-ROTATED SECRETS

Not automatically a vulnerability.

However, it compounds the impact of undetected long-term exposures.

---

# 159. SECRET AGE

Document secret creation and rotation metadata where available.

---

# 160. BOOTSTRAP SECRETS

Initial admin passwords and setup API keys must be invalidated or rotated post-provisioning.

---

# 161. DEFAULT SECRETS

Pattern:

```text
SECRET = env.SECRET || "secret"
```

Critical vulnerability if the fallback operates in production.

---

# 162. EMPTY SECRETS

Verify application behavior when:

```text
SECRET=""
```

---

# 163. MISSING SECRET FAIL-OPEN

Applications must never fall back to weak defaults if credentials protect authentication, signing, or encryption.

---

# 164. FAIL FAST

The absence of critical secrets must fail application startup cleanly.

---

# 165. SECRET MANAGERS

If integrated with:

- AWS Secrets Manager
- HashiCorp Vault
- Cloud Secret Manager
- Vercel Environment Variables

inspect the actual integration logic.

Do not mandate migrations purely for checklist compliance.

---

# 166. SECRET MANAGER ACCESS SCOPING

Application identities should only have access to strictly required secrets.

---

# 167. LIST SECRETS PERMISSION

Permissions allowing listing or reading all secrets drastically increase blast radius.

---

# 168. RUNTIME FETCHING

Secrets can be fetched on demand at runtime or injected at process startup.

Both models entail distinct operational trade-offs.

---

# 169. CACHING SECRETS

In-memory caching is standard.

Never log or dump cached secrets.

---

# 170. CRASH DUMPS

Process memory dumps can contain plaintext secrets.

Typically an operational access control concern rather than an application vulnerability.

---

# 171. CORE DUMPS

Production core dumps can preserve active credentials.

P4/P2 depending on access controls and retention policies.

---

# 172. SWAP FILES

OS-level consideration, not an application finding without a relevant threat model.

---

# 173. PROCESS LISTS

Secrets supplied via command-line arguments can be observed by other local users and system tools.

---

# 174. CLI ARGUMENTS

Prefer standard input, environment variables, or files based on the CLI tool's security model.

---

# 175. SUBPROCESS INVOCATIONS

Applications passing API keys as CLI arguments can leak them into process tables and execution logs.

---

# 176. SHELL HISTORY

Operational scripts and commands containing embedded secrets.

---

# 177. DEPLOYMENT LOGS

Platform command logging may capture expanded secret arguments.

---

# 178. PACKAGE MANAGER TOKENS

Search for:

```text
.npmrc
.pypirc
.nuget
pip.conf
```

---

# 179. `.npmrc`

Tokens frequently leak into repositories or Docker images through `.npmrc`.

---

# 180. GIT CREDENTIALS

Personal Access Tokens embedded in remote URLs:

```text
https://token@github...
```

---

# 181. SUBMODULES

`.gitmodules` files containing credentialed URLs.

---

# 182. TERRAFORM

State files frequently store database passwords and provider secrets in plaintext.

---

# 183. TFSTATE

If published as public or accessible CI artifacts:

critical vulnerability.

---

# 184. TERRAFORM OUTPUTS

Sensitive outputs must be flagged, but `sensitive=true` does not encrypt the underlying state file.

---

# 185. IAC VARIABLES

Committed `.tfvars` files containing production secrets.

---

# 186. PULUMI AND OTHER IAC TOOLS

Verify secret encryption and backend storage semantics.

---

# 187. ANSIBLE VAULT

Encrypted files are safe provided the vault password is not co-located in the repository.

---

# 188. KUBERNETES MANIFESTS

Base64 secrets committed to Git are effectively plaintext exposures.

---

# 189. HELM VALUES

Production passwords frequently leak into version-controlled `values.yaml` files.

---

# 190. VERCEL

On Vercel:

verify that server-only variables omit public prefixes and that preview/production scopes align with intent.

---

# 191. PREVIEW DEPLOYMENTS

Preview builds might receive production secrets unnecessarily.

---

# 192. UNTRUSTED PREVIEWS

If arbitrary pull request code gains access to production credentials:

high-risk vulnerability.

---

# 193. RAILWAY AND OTHER PLATFORMS

Apply the same isolation principles:

- environment boundaries
- service boundaries
- preview scoping

---

# 194. THIRD-PARTY INTEGRATIONS

Secrets can be transmitted to remote vendors via webhooks or integration configs.

Verify intentional boundaries.

---

# 195. SUPPORT TOOLS

Internal admin and support dashboards displaying full environment configurations.

---

# 196. DEBUG DUMP ENDPOINTS

Endpoints like:

```text
/debug/env
```

P0/P1 if publicly accessible or weakly authenticated.

---

# 197. HEALTH ENDPOINTS

Must never return full connection strings or configuration dumps.

---

# 198. METRICS

Prometheus metrics labels must never contain secrets or credentials.

---

# 199. EXCEPTION MESSAGES

Libraries can format error messages containing credentialed URLs.

---

# 200. DATABASE ERRORS

Database connection failures may print complete DSNs with passwords into application logs.

---

# 201. SMTP ERRORS

May expose usernames and server details, rarely passwords.

Inspect actual error objects.

---

# 202. CLOUD SDK ERRORS

Must never return raw credentials or request signing headers to callers.

---

# 203. SECRET REDACTION TESTING

Intentionally inject a fake canary secret into a test environment.

Trigger:

- happy path flows
- error flows

Verify whether it surfaces in:

- application logs
- trace spans
- client HTTP responses
- CI job outputs

---

# 204. CANARY SECRETS

An effective technique to validate redaction coverage without risking genuine credentials.

---

# 205. BUILD SCANNING

Search compiled production outputs for injected canary secrets.

---

# 206. IMAGE SCANNING

Inspect final Docker container filesystems and history for canary strings.

---

# 207. CLIENT BUNDLE SCANNING

Specifically audit frontend bundles for client-visible canary tokens.

---

# 208. LOG SCANNING

Execute requests with canary credentials and inspect log indexing.

---

# 209. ERROR MONITORING SCANNING

Audit error platform event payloads in integrated test environments.

---

# 210. CI LOG SCANNING

Place canary secrets in CI pipelines to verify log masking behavior.

---

# 211. ROTATION DRILLS

For critical credentials, verify the existence of tested rotation procedures.

P4 hardening if no active exposure exists.

---

# 212. COMPROMISE RESPONSE

Remediation for confirmed leaks must follow:

```text
revoke
rotate
replace
verify old credential invalid
search reuse
remove exposure source
```

---

# 213. DELETION ALONE IS NOT REMEDIATION

If a key has leaked:

```text
delete from repo
```

is completely insufficient.

---

# 214. REWRITING GIT HISTORY

Can prevent future accidental exposures, but cannot restore secrecy to an already exposed credential.

---

# 215. SECRET SCANNING

Pre-commit hooks and CI scans help prevent future leaks.

P4/P3 unless current workflows repeatedly leak credentials.

---

# 216. PUSH PROTECTION

Valuable defense-in-depth where supported by the repository host.

---

# 217. ENTROPY-BASED SCANNERS

Subject to false positives on high-entropy non-secret strings.

---

# 218. PROVIDER PATTERNS

Highly accurate for structured key formats.

---

# 219. CUSTOM SECRET FORMATS

Add custom regex rules only for genuine internal token structures.

---

# 220. ALLOWLISTS

Scanner allowlists must be tightly scoped to avoid concealing future leaks.

---

# 221. SECRET OWNERSHIP

For high-value credentials, document:

- associated service
- responsible team
- intended use
- granted scopes

where metadata is available.

---

# 222. UNUSED SECRETS

A credential that is no longer required but remains active:

presents unnecessary attack surface with zero business value.

---

# 223. ORPHAN CREDENTIALS

Credentials with active privileges but unknown ownership.

High-value candidates for decommissioning.

---

# 224. OVER-PRIVILEGED CREDENTIALS

The severity of an exposure scales directly with granted privileges.

---

# 225. READ-ONLY TOKENS

Can still facilitate massive data exfiltration breaches.

---

# 226. WRITE TOKENS

Direct integrity and data destruction impact.

---

# 227. ADMIN TOKENS

Critical vulnerability.

---

# 228. BILLING TOKENS

Immediate financial fraud and resource exhaustion risks.

---

# 229. EMAIL/SMS CREDENTIALS

Can enable phishing, spam, and financial toll abuse.

---

# 230. AI PROVIDER KEYS

Can enable financial cost abuse and data leakage depending on provider account permissions.

---

# 231. STORAGE KEYS

Can grant arbitrary read and delete access to private storage buckets.

---

# 232. DATABASE URLS

Impact depends on network accessibility and database user permissions.

---

# 233. DB CREDENTIALS BEHIND PRIVATE NETWORKS

Still a serious exposure, but exploitability must factor in network reachability constraints.

---

# 234. VPN-ONLY CREDENTIALS

An attacker requires an initial network foothold before exploitation.

Adjust severity accordingly.

---

# 235. SIGNING SECRETS

Even without network database access, allows offline token forgery.

---

# 236. PRIVATE KEY PASSPHRASES

If private keys and passphrases are stored together:

cryptographic protection collapses.

---

# 237. TWO-PART SECRETS

Document whether secret components originate from separated trust domains.

---

# 238. SECRET DERIVATION

Hardcoded "master keys" from which subkeys are derived represent critical risks.

---

# 239. CRYPTOGRAPHIC KEY ROTATION

Requires special care because historical encrypted data may still mandate the original decryption key.

---

# 240. FINDING FORMAT

Every substantive finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:
Evidence tier:

Secret type:
Secret value:
DO NOT PRINT FULL VALUE

Masked fingerprint:
Example:
abcd...wxyz

Environment:
Production / Staging / Dev / Unknown

Location:
File / Commit / Log / Bundle / Artifact / Image / Response / CI

File/Path:
Line/Commit:
Service:

Exposure path:

Who can access it:

Credential status:
CURRENT
ROTATED
REVOKED
EXPIRED
UNKNOWN

Privileges:
VERIFIED
PARTIAL
NOT VERIFIED

Potential access:

Confidentiality impact:

Integrity impact:

Financial impact:

Blast radius:

Evidence:

Root cause:

Immediate containment:

Rotation/revocation plan:

Long-term remediation:

Regression/prevention test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 241. NEVER PRINT FULL SECRETS IN REPORTS

Use:

```text
sk_live_abcd...wxyz
```

or SHA-256 fingerprint hashes.

---

# 242. SEVERITY

Use:

## P0 - CRITICAL

- active exposed credential allows production admin or cloud takeover
- active signing private key or secret allows forging privileged authentication tokens
- production database root or admin credential is publicly exposed and reachable
- encryption master key plus ciphertext access enables catastrophic data disclosure

## P1 - HIGH

- valid production API key with substantial read/write permissions
- active database credential with sensitive data access
- CI or deploy token enabling arbitrary production code deployment
- private storage credential granting broad data access
- untrusted CI code execution with access to production secrets

## P2 - MEDIUM

- limited-scope active credentials
- sensitive secret exposed only to authenticated/internal users with realistic abuse paths
- staging credential with substantial lateral-risk connections to production
- application logs capturing reusable user authentication tokens

## P3 - LOW

- expired or revoked secret exposures
- low-impact internal credentials
- minor metadata leakage

## P4 - HARDENING

- missing secret scanning automation
- broad access policies without confirmed leaks
- secret rotation and hygiene improvements

---

# 243. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

---

# 244. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 245. EVIDENCE TIER

```text
A - confirmed exposure + credential status/impact
B - exact secret value present in reachable artifact/code
C - strong secret-pattern and production context
D - partial/inferred
E - generic hardening
```

---

# 246. CATEGORY

Use:

```text
SOURCE CONTROL
GIT HISTORY
FRONTEND BUNDLE
API RESPONSE
LOGGING
ERROR MONITORING
CI/CD
BUILD ARTIFACT
DOCKER IMAGE
MOBILE/DESKTOP BUNDLE
DATABASE
CLOUD/IAM
CONFIGURATION
BACKUP
IaC
```

---

# 247. FALSE-POSITIVE PREVENTION

Before reporting P0/P1/P2 findings, verify:

1. whether the value is genuinely a secret
2. that it is not a test fixture or placeholder
3. target environment
4. active versus revoked status where verifiable
5. granted privilege scope
6. network and reachability prerequisites
7. who can access the exposure location
8. deployment build artifacts
9. logs and artifact retention policies
10. duplicate copies in version history

---

# 248. DO NOT TEST LIVE KEYS WITHOUT AUTHORIZATION

Never verify validity by accessing customer data or third-party systems without explicit permission.

---

# 249. DO NOT REPORT CLIENT IDS AS CLIENT SECRETS

Distinguish strictly between public and confidential OAuth credentials.

---

# 250. DO NOT AUTOMATICALLY REPORT PUBLIC API KEYS

Certain providers intentionally design keys for browser visibility.

Audit provider specifications and scopes.

---

# 251. DO NOT REPORT HASHES AS PLAINTEXT PASSWORDS

However, password hashes remain sensitive authentication material.

---

# 252. DO NOT REPORT CERTIFICATES AS PRIVATE KEYS

Public certificates are intended to be public.

---

# 253. DO NOT REPORT MASKED UI VALUES AS EXPOSURES

`••••abcd` is not a secret leak.

---

# 254. DO NOT AUTOMATICALLY RECOMMEND VAULT

Platform-managed environment secrets can be entirely adequate.

---

# 255. DO NOT ROTATE SECRETS BLINDLY

Confirmed active exposure requires prioritized emergency rotation.

Unexposed credentials follow scheduled risk-based rotation policies.

---

# 256. DO NOT REVOKE SECRETS BEFORE UNDERSTANDING DEPENDENCIES

Abruptly revoking production keys causes service outages.

Containment must be coordinated.

---

# 257. DO NOT MODIFY CODE

During the audit:

- do not revoke keys
- do not rotate keys
- do not delete environment variables
- do not modify CI secrets
- do not rewrite Git history

without explicit authorization.

Complete the audit first.

---

# 258. OUTPUT - SECRETS_CREDENTIAL_EXPOSURE_AUDIT.md

Structure the final report as follows:

## 1. Executive Summary

- secret model
- scanned surfaces
- confirmed current exposures
- historical exposures
- highest blast-radius credentials

## 2. Secret Inventory

Without full plaintext values.

## 3. Source Code Exposure Audit

## 4. Git History Audit

## 5. Config / Environment Audit

## 6. Frontend Bundle Audit

## 7. API / Error Response Leakage Audit

## 8. Logging Audit

## 9. Error Monitoring / Tracing Audit

## 10. CI/CD Secret Audit

## 11. CI Artifact / Cache Audit

## 12. Docker / Container Audit

## 13. Deployment Platform Audit

## 14. Mobile / Desktop Embedded Credential Audit

## 15. Database Stored Credential Audit

## 16. Cloud / Provider Credential Audit

## 17. Object Storage / Backup Exposure Audit

## 18. IaC / Terraform / Helm Audit

## 19. Environment Separation Audit

## 20. Secret Rotation / Revocation Readiness

## 21. Secret Scanning / Prevention Coverage

## 22. Findings Summary

| ID | Severity | Secret type | Environment | Exposure | Status | Confidence |
|---|---|---|---|---|---|---|

## 23. P0 Findings

## 24. P1 Findings

## 25. P2 Findings

## 26. P3 Findings

## 27. P4 Hardening

## 28. Things Done Well

## 29. Revoked / Historical Secrets

## 30. Not Verified

## 31. Immediate Containment Plan

## 32. Rotation Roadmap

## 33. Long-Term Prevention Roadmap

---

# 259. SECRET INVENTORY MATRIX

| Secret | Environment | Storage | Consumer | Scope | Status |
|---|---|---|---|---|---|

Use masked identifiers.

---

# 260. EXPOSURE MATRIX

| Secret | Source | Git | Bundle | Logs | CI | Image |
|---|---|---|---|---|---|---|

---

# 261. ROTATION MATRIX

| Secret | Rotatable | Downtime needed | Dual-key support | Last rotation |
|---|---|---|---|---|

If unknown:

**NOT VERIFIED**

---

# 262. CLIENT VISIBILITY MATRIX

| Value | Browser | Mobile binary | Desktop binary | Intended public |
|---|---|---|---|---|

---

# 263. SECOND PASS - REPOSITORY SECRET HUNT

Scan the complete repository including:

- source files
- configurations
- tests
- documentation
- scripts
- workflows
- IaC files

for:

- known provider key prefixes
- private key markers
- credentialed URLs
- high-entropy string literals

---

# 264. SECOND PASS - GIT HISTORY HUNT

If version history is accessible:

search for secrets across historical commits and deleted files.

---

# 265. SECOND PASS - FRONTEND BUILD

Generate production builds.

Scan compiled browser assets for:

- known secret strings
- canary tokens
- server-only environment variables

---

# 266. SECOND PASS - SOURCE MAPS

If deployed source maps exist:

audit for embedded secrets and configuration leaks.

---

# 267. SECOND PASS - API RESPONSES

Trigger:

- valid responses
- validation errors
- internal server errors
- upstream provider errors

Search payloads for exposed credentials and configurations.

---

# 268. SECOND PASS - LOGGING

Using canary credentials, exercise:

- authentication flows
- external API provider calls
- webhook handlers
- database connection error paths

Verify redaction completeness.

---

# 269. SECOND PASS - ERROR MONITORING

Where accessible in test environments:

verify that canary secrets are not captured in error reports.

---

# 270. SECOND PASS - CI

Audit every pipeline workflow for:

```text
echo
printenv
set -x
artifact upload
untrusted PR execution
```

---

# 271. SECOND PASS - UNTRUSTED CI CODE

Ask:

> Can contributor-controlled code execute in jobs with access to production secrets?

If yes:

high-priority finding.

---

# 272. SECOND PASS - DOCKER

Inspect:

- Dockerfile instructions
- build contexts
- final container filesystems
- image layer history

---

# 273. SECOND PASS - `.npmrc` / PACKAGE CONFIGS

Search for registry authentication tokens in:

- repository files
- container images
- build artifacts

---

# 274. SECOND PASS - IAC

Inspect:

- tfvars definitions
- tfstate storage and permissions
- Helm values files
- Kubernetes manifests

---

# 275. SECOND PASS - PREVIEW ENVIRONMENTS

Ask:

> Do preview deployments triggered by untrusted branches receive production credentials?

---

# 276. SECOND PASS - ENVIRONMENT REUSE

Compare secrets across:

```text
development
staging
production
```

including API credentials and JWT signing keys.

---

# 277. SECOND PASS - DATABASE STORED TOKENS

For every bearer credential stored in the database, ask:

> If an attacker obtains a read-only database dump, can they use these tokens immediately?

---

# 278. SECOND PASS - BACKUPS

Locate:

- SQL dumps
- `.bak` files
- compressed archives
- automated database backups

and audit access controls.

---

# 279. SECOND PASS - DEFAULT FALLBACKS

Search for patterns like:

```text
process.env.X || "..."
getenv("X", "...")
default_secret
changeme
```

for authentication, signing, and encryption keys.

---

# 280. SECOND PASS - CLIENT APPLICATIONS

If targeting:

- Web
- Android
- iOS
- Desktop

search for server or provider credentials embedded in distributed binaries.

---

# 281. SECOND PASS - ROTATION

For every confirmed P0/P1 secret, develop a containment plan:

```text
1. create replacement
2. deploy consumers
3. switch traffic
4. revoke old
5. verify old invalid
6. monitor abuse
```

Tailor to specific technologies.

---

# 282. SECOND PASS - HISTORICAL EXPOSURE

If an active credential was rotated:

check whether Git history contains other related active credentials.

---

# 283. SECOND PASS - BLAST RADIUS

For every exposed credential, evaluate:

- what it can read
- what it can write
- whether it can provision additional credentials
- whether it can alter production infrastructure
- whether it grants lateral access to other environments

---

# 284. FINAL QUALITY GATE

Before issuing the final report, verify:

- public identifiers are not misclassified as secrets
- placeholder and test values are separated from genuine credentials
- full secret values are never printed in the report
- active, revoked, and expired statuses are clearly distinguished
- production environments take precedence over development
- Git history has been analyzed where accessible
- deleting files from repositories is not framed as sufficient remediation
- browser bundles are treated as public environments
- transitive client imports have been audited
- API and error response leakages have been investigated
- logs, APM, and error monitoring systems feature redaction audits
- CI logs, artifacts, and cache paths have been reviewed
- untrusted pull request code execution alongside production secrets is evaluated
- Docker final filesystem layers and history are audited separately
- client mobile and desktop binaries are not treated as secure secret vaults
- database storage of raw bearer tokens is evaluated against requirements
- environment separation boundaries are verified
- default and fallback secrets have been investigated
- credential privileges are verified or marked NOT VERIFIED
- network reachability is factored into database and cloud exploitability
- rotation plans mandate revoking compromised secrets
- every P0/P1 finding features a concrete exposure path and blast radius
- P4 secret-management hardening is distinguished from confirmed leaks

---

# FINAL RULE

Do not generate reports like:

> Do not commit `.env`, use Vault, and rotate your keys.

That is not a Secrets & Credential Exposure Audit.

I am looking for concrete defects such as:

```text
production API secret stored in:
.env.production

↓
file committed to repository
↓
repository accessible to many contributors
↓
same key still configured in production
↓
credential gives write access to provider
↓
current production credential exposure
```

or:

```text
server secret:
PAYMENT_PROVIDER_SECRET

↓
renamed:
NEXT_PUBLIC_PAYMENT_PROVIDER_SECRET

↓
Next.js production build
↓
value in client JavaScript bundle
↓
every visitor can extract server credential
```

or:

```text
CI job has:
PRODUCTION_DEPLOY_TOKEN

↓
workflow triggered by untrusted PR context
↓
attacker-controlled repository code executes
↓
code reads environment variable
↓
production deploy token can be exfiltrated
```

or:

```text
Dockerfile:
COPY . .

↓
build context includes .env
↓
later layer deletes .env
↓
final filesystem looks clean
↓
older image layer still contains credential
```

or:

```text
logger records entire HTTP request object
↓
Authorization header included
↓
logs retained for 30 days
↓
support/monitoring users can retrieve reusable bearer token
```

or:

```text
database stores API keys in plaintext
↓
keys are bearer credentials
↓
backend only needs to verify presented key
↓
read-only DB compromise immediately gives reusable customer credentials
```

or:

```text
JWT signing secret:
same value in staging and production

↓
staging environment is accessible to wider group
↓
production verifier does not isolate issuer/environment
↓
staging compromise can enable production token forgery
```

or:

```text
production backup:
database-2026.sql

↓
contains users, refresh tokens and third-party credentials
↓
uploaded to public object storage bucket
↓
direct credential and data exposure
```

These are the secret exposure problems you must uncover.

Reason through:

- what is genuinely a secret
- where it resides
- who can access it
- whether it is currently active
- what privileges it confers
- where duplicate copies persist
- how to rotate it safely
- how to verify the compromised credential is dead

For every serious finding, you must be able to answer:

> Which credential is exposed?

> Where is it exposed?

> Who exactly can access it?

> Is it a production credential?

> Is it currently active?

> What privileges does it confer?

> Do duplicate copies exist in history, logs, or build artifacts?

> Does the remediation include actual revocation and rotation?

If validity cannot be verified:

**CREDENTIAL STATUS NOT VERIFIED.**

If privilege scope cannot be determined:

**CREDENTIAL PRIVILEGES NOT VERIFIED.**

If the value is a public identifier or placeholder:

**NOT A SECRET.**

If only a superior secret-management practice is identified without concrete exposure:

**P4 - HARDENING.**

It is far better to find 3 real, active credential exposures with precise blast radii than to report hundreds of false-positive strings.

The objective is to produce a forensically precise Secrets & Credential Exposure audit that translates directly into:

- incident containment
- credential rotation
- Git/CI cleanup
- frontend bundle correction
- logging redaction
- environment isolation
- secret-scanning prevention
- production credential hardening
