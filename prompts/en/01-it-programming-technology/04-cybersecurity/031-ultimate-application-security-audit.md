---
id: UPL-IT-031
number: 31
slug: ultimate-application-security-audit
title: Ultimate Application Security Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# ULTIMATE APPLICATION SECURITY AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented security analysis of the entire application, its backend, APIs, frontend trust boundaries, authentication, authorization, data persistence, configuration, infrastructure, and all externally reachable attack surfaces.

Main objective:

> Identify genuine exploitable or security-relevant defects that permit unauthorized access, privilege escalation, cross-user or cross-tenant data access, credential theft or abuse, server-side logic manipulation, secret leakage, injection attacks, insecure file uploads, SSRF, broken session/token mechanics, or any other tangible security failure.

This is not:

- a generic OWASP checklist
- automatically declaring every divergence from best practices a vulnerability
- speculative penetration testing without evidence
- guessing that something "might be hackable"
- automatically requiring MFA everywhere
- automatically requiring a WAF
- automatically mandating a zero-trust architecture
- automatically banning JWTs
- automatically banning session cookies
- vulnerability scanning detached from business logic
- advising that everything be rewritten in a different framework

The focus is centered on:

```text
attacker-controlled input
↓
trust boundary
↓
authentication
↓
authorization
↓
business logic
↓
data/system side effect
```

Priority:

**authorization > authentication > tenant isolation > secrets > injection > session/token integrity > dangerous server capabilities > sensitive data exposure > security hardening**

It is better to discover 5 genuine exploitable vulnerabilities than to produce 100 generic security recommendations.

---

# 1. ESTABLISH ACTUAL TECH STACK

Before drawing security conclusions, establish:

- frontend framework
- backend runtime
- web application framework
- database engine
- ORM/data layer
- authentication libraries/identity providers
- session/JWT architecture
- reverse proxy
- CDN/WAF
- object storage
- message brokers/queues
- deployment platform
- secret and configuration management
- external third-party integrations

Do not apply framework-specific guidance until the stack is conclusively verified.

---

# 2. DEFINE ATTACK SURFACE

Inventory:

- public web routes
- API endpoints
- authentication endpoints
- administrative portals
- internal service endpoints
- webhook receivers
- file upload endpoints
- file download endpoints
- OAuth callback URLs
- WebSocket and SSE channels
- GraphQL endpoints
- background worker entry points
- scheduled tasks
- CLI and administrative scripts that can be remotely triggered

---

# 3. MAP TRUST BOUNDARIES

Map operational boundaries between:

```text
browser/client
↓
edge/proxy
↓
backend
↓
database
↓
internal services
↓
third-party providers
```

and trace all points where untrusted input crosses a security boundary.

---

# 4. ATTACKER MODELS

Distinguish:

```text
unauthenticated external attacker
authenticated ordinary user
authenticated malicious user
tenant administrator
compromised API key
compromised third-party integration
malicious uploaded file
malicious webhook sender
```

Do not restrict threat models solely to anonymous external attackers.

---

# 5. DO NOT ASSUME INTERNAL MEANS TRUSTED

Internal service endpoints, queue messages, and inbound webhooks can carry attacker-influenced payloads.

---

# 6. AUTHENTICATION MAP

Map:

```text
credential
↓
verification
↓
session/token
↓
principal
↓
request context
```

---

# 7. AUTHORIZATION MAP

Independently map:

```text
principal
↓
resource
↓
permission/ownership
↓
allow/deny
```

Authentication does not equal authorization.

---

# 8. ROUTE SECURITY INVENTORY

For every relevant endpoint, document:

| Route | Public | Auth | Authorization | Resource scope | Sensitive |
|---|---|---|---|---|---|

---

# 9. AUTHENTICATION BYPASS

Identify routes accidentally excluded from global authentication middleware filters.

---

# 10. ROUTE GROUP DRIFT

Example:

```text
/api/admin/*
```

is strictly protected, but:

```text
/api/v2/admin/*
```

lacks middleware enforcement.

---

# 11. DEFAULT-PUBLIC ROUTING

If framework routing makes handlers public unless developers manually annotate authentication:

audit route coverage with extreme care.

---

# 12. DEFAULT-PROTECTED ROUTING

If authentication is globally enforced:

scrutinize all configured public bypass exceptions.

---

# 13. AUTHORIZATION ENFORCEMENT

For every resource endpoint, answer:

> Why is this specific caller permitted to perform this specific action on this specific resource entity?

---

# 14. IDOR / BOLA

Classic vulnerability:

```text
GET /documents/123
```

Change:

```text
123 -> 124
```

and verify whether ownership or authorization policies prevent unauthorized reads.

---

# 15. READ IDOR

Unauthorized data exposure represents a major security vulnerability even without state modification.

---

# 16. UPDATE IDOR

Particularly critical on endpoints like:

```text
PATCH /users/:id
```

---

# 17. DELETE IDOR

Particularly catastrophic due to destructive data loss.

---

# 18. NESTED RESOURCE IDOR

Example:

```text
/orgs/A/projects/B
```

Verify:

- caller has authorized access to organization A
- project B legitimately belongs to organization A

---

# 19. PARENT/CHILD SCOPING CONFUSION

Handlers often validate access to the parent entity, but load the child resource via an unconstrained global lookup.

---

# 20. TENANT ISOLATION

In multi-tenant systems:

every data access and mutation operation must be strictly scoped to the caller's tenant.

---

# 21. TENANT ID FROM CLIENT REQUEST

Never trust client-supplied tenant identifiers:

```json
{
  "tenantId": "..."
}
```

merely because the caller is authenticated.

---

# 22. TENANT QUERY FILTERS

Search for repository and query methods missing explicit tenant ID clauses.

---

# 23. TENANT CACHING

Cache keys must incorporate the tenant identifier whenever cached data is tenant-specific.

---

# 24. TENANT OBJECT STORAGE

Object storage paths, buckets, and prefixes must enforce rigorous tenant boundary isolation.

---

# 25. TENANT BACKGROUND JOBS

Asynchronous workers must inherit, propagate, and enforce valid tenant contexts.

---

# 26. TENANT WEBHOOK INTEGRATION

External provider accounts and entities must resolve deterministically to their respective local tenant namespaces.

---

# 27. CROSS-TENANT ENUMERATION

Even when data payloads are suppressed, differentiated error responses, status codes, or response times can expose resource existence across tenants.

---

# 28. ROLE-BASED ACCESS CONTROL

Map roles where present:

- user
- moderator
- administrator
- owner
- system

---

# 29. ROLES FROM CLIENT INPUT

Never trust client-supplied role values as the source of truth for authorization decisions.

---

# 30. ROLE CACHE INVALIDATION

Role revocations may fail to take effect immediately due to cached tokens or session claims.

Verify session revocation semantics upon privilege changes.

---

# 31. FIELD-LEVEL AUTHORIZATION

A user may have permission to edit a resource, but must be barred from modifying privileged fields:

- role
- owner ID
- billing tier
- approval status
- verification flags
- internal system state

---

# 32. MASS ASSIGNMENT

High-signal vulnerability pattern:

```text
request.body
↓
ORM.update
```

without explicit field whitelisting or schema filtering.

---

# 33. HIDDEN FIELD TAMPERING

Test injecting privileged attributes:

```json
{
  "isAdmin": true,
  "role": "admin",
  "ownerId": "victim",
  "status": "paid"
}
```

---

# 34. OVERPOSTING VULNERABILITY

Even if UI forms omit specific fields:

attackers construct direct HTTP payloads containing prohibited attributes.

---

# 35. AUTHENTICATION SCHEME

Identify the implementation:

- session cookies
- JSON Web Tokens (JWT)
- OAuth 2.0 / OIDC
- API keys
- magic links
- password authentication
- multi-factor authentication (MFA)

---

# 36. PASSWORD STORAGE

If the application manages credentials directly:

verify the usage of modern, salted password hashing algorithms (Argon2id, bcrypt, scrypt) with adequate cost parameters.

Never compromise password hashing cost parameters for raw performance gains.

---

# 37. PLAINTEXT PASSWORDS

Classified as P0 Critical.

---

# 38. REVERSIBLY ENCRYPTED PASSWORDS

A severe flaw unless backed by an explicit regulatory mandate.

Passwords must be securely hashed, never reversibly encrypted.

---

# 39. HASHING ALGORITHMS

Verify against modern cryptography standards and current runtime implementations.

---

# 40. PASSWORD LOGGING

Passwords must never appear in:

- web server access logs
- application error traces
- third-party analytics telemetry

---

# 41. LOGIN USER ENUMERATION

Compare responses for:

```text
unknown email
```

versus:

```text
wrong password
```

---

# 42. USER ENUMERATION SEVERITY

Enumeration is not automatically P0 Critical.

Severity depends on application sensitivity, threat model, and regulatory context.

---

# 43. PASSWORD RESET LIFECYCLE

Map:

```text
request reset
↓
token creation
↓
delivery
↓
verification
↓
password change
```

---

# 44. RESET TOKEN ENTROPY

Reset tokens must be:

- cryptographically unpredictable
- generated with adequate entropy
- strictly time-bounded
- single-use where required by design

---

# 45. RESET TOKEN STORAGE

To prevent database breach compromises from translating into immediate account takeovers:

store cryptographic hashes of reset tokens rather than plaintext tokens.

---

# 46. RESET TOKEN REUSE

Following a successful password reset:

the consumed token must be immediately invalidated.

---

# 47. RESET TOKEN RACE CONDITIONS

Test concurrent submissions of the identical reset token.

---

# 48. SESSION REVOCATION ON PASSWORD CHANGE

Verify whether active sessions and tokens are terminated upon password changes as required by security policy.

---

# 49. EMAIL CHANGE VERIFICATION

If email serves as the primary authentication identity:

verify that changing an email address requires confirmation and terminates old sessions appropriately.

---

# 50. SESSION COOKIE FLAGS

If utilizing cookies:

verify:

- Secure
- HttpOnly
- SameSite
- Domain constraints
- Path scoping

calibrated to the production deployment topology.

---

# 51. SESSION FIXATION

Verify that session identifiers rotate upon authentication and privilege escalation.

---

# 52. SESSION IDENTIFIER ENTROPY

Session IDs must be cryptographically random and unguessable.

Rely on proven framework-provided session generators.

---

# 53. SESSION STORE SECURITY

Verify:

- idle and absolute expirations
- server-side revocation
- multi-instance session synchronization

---

# 54. LOGOUT INVALIDATION

Logout must explicitly invalidate server-side session state or client credentials according to the auth model.

---

# 55. JWT VALIDATION

If using JSON Web Tokens:

verify:

- signature verification enforcement
- algorithm pinning
- issuer (`iss`) validation
- audience (`aud`) validation
- expiration (`exp`) enforcement
- not-before (`nbf`) handling
- key rotation mechanics

---

# 56. THE `alg=none` ATTACK

Do not speculate.

Test only if the library or configuration actively permits algorithm negotiation manipulation.

---

# 57. ALGORITHM CONFUSION

Report only when an actionable exploit path exists between asymmetric and symmetric verification routines.

---

# 58. JWT SIGNING SECRETS

Weak, predictable, or hardcoded signing secrets constitute severe vulnerabilities.

---

# 59. JWT CLAIMS VERIFICATION

Never trust client-supplied JWT claims without strict cryptographic signature validation.

---

# 60. ISSUER AND AUDIENCE ENFORCEMENT

Crucial when multiple microservices or client applications share signing keys.

---

# 61. TOKEN EXPIRATION WINDOWS

Long-lived access tokens are not automatically vulnerabilities.

Evaluate:

- data sensitivity
- token revocation mechanisms
- refresh token architecture

---

# 62. REFRESH TOKEN LIFECYCLE

Verify:

- secure storage
- one-time use rotation
- reuse detection
- server-side revocation
- maximum absolute lifetime

---

# 63. REFRESH TOKEN REUSE DETECTION

If rotation is enforced:

attempting to reuse an old refresh token must trigger automatic invalidation of the entire token family.

---

# 64. TOKENS IN URL QUERY STRINGS

Transmitting sensitive tokens in URL query strings leaks credentials via:

- browser history
- web server access logs
- HTTP `Referer` headers

---

# 65. API KEY MANAGEMENT

Verify:

- generation entropy
- secure salted hash storage
- scoped authorization permissions
- key rotation capabilities
- immediate revocation paths

---

# 66. API KEY PREFIXING

Prefixes aid secret scanning and identification, but do not provide security on their own.

---

# 67. API KEYS IN SOURCE CONTROL

Critical secret exposure.

---

# 68. OAUTH 2.0 IMPLEMENTATION

Map the complete authorization code grant lifecycle.

---

# 69. REDIRECT URI VALIDATION

Redirect URIs must match strict, exact allowlists.

---

# 70. OPEN REDIRECTS IN OAUTH

Open redirects on authentication origins enable authorization code and token exfiltration.

---

# 71. PKCE ENFORCEMENT

Verify Proof Key for Code Exchange (PKCE) implementation on public clients (mobile, SPA).

---

# 72. THE `state` PARAMETER

Verify CSRF and correlation protection on OAuth handshakes.

---

# 73. THE `nonce` PARAMETER

Verify replay mitigation in OpenID Connect authentication flows.

---

# 74. THIRD-PARTY ACCOUNT LINKING

High-risk attack surface.

Verify that attackers cannot bind their third-party provider accounts to existing local victim accounts without proof of ownership.

---

# 75. EMAIL VERIFICATION TRUST

Do not trust third-party provider email addresses as pre-verified unless explicitly guaranteed by the provider contract.

---

# 76. MFA BYPASS PATHS

Verify whether alternative login routes bypass secondary authentication factors.

---

# 77. MFA BYPASS VIA LEGACY ENDPOINTS

Example:

```text
password login requires MFA
```

but:

```text
legacy endpoint issues full session without MFA
```

---

# 78. RECOVERY CODES

Verify:

- single-use invalidation
- secure hashed storage
- secure re-generation workflows

---

# 79. MFA RESET FLOWS

Administrative MFA resets represent high-value takeover vectors requiring strict authorization and audit logging.

---

# 80. CSRF PROTECTION

If browsers transmit ambient credentials (cookies, HTTP basic auth):

verify protections on state-mutating requests.

---

# 81. SAMESITE COOKIES ARE NOT COMPLETE CSRF DEFENSE

Evaluate:

- SameSite mode
- cross-site integration needs
- anti-CSRF tokens
- origin and referer header verification

---

# 82. BEARER TOKEN HEADERS

Authorization header schemes have fundamentally different CSRF threat profiles than cookie sessions.

Do not apply cookie-centric CSRF rules blindly.

---

# 83. CORS POLICY

CORS is an origin-sharing mechanism, not an authorization boundary.

---

# 84. WILDCARD CORS ORIGINS

Public, unauthenticated APIs may legitimately declare `*`.

Security risks arise only when combined with credentialed requests or private data exposure.

---

# 85. REFLECTED ORIGIN WITH CREDENTIALS

If the server reflects arbitrary `Origin` headers while setting `Access-Control-Allow-Credentials: true`:

this is a severe cross-origin data exposure vulnerability.

---

# 86. PREFLIGHT CONFIGURATION

Preflight configurations must not introduce security bypasses, nor should misconfigurations block legitimate clients.

---

# 87. CROSS-SITE SCRIPTING (XSS)

If the application serves HTML or renders dynamic client-side content:

scrutinize untrusted data sinks.

---

# 88. STORED XSS

Audit high-risk injection sinks:

- user comments
- profile fields
- admin dashboards
- uploaded SVG or HTML documents

---

# 89. REFLECTED XSS

URL parameters or path segments echoed directly into HTML responses.

---

# 90. DOM-BASED XSS

Dangerous frontend DOM sinks:

- `innerHTML`
- `dangerouslySetInnerHTML`
- `document.write`
- unvalidated URL assignments to `location.href`

---

# 91. FRAMEWORK AUTO-ESCAPING

Do not flag standard UI template interpolations as XSS if the underlying framework enforces safe contextual auto-escaping.

---

# 92. HTML SANITIZATION

When rich text is supported:

audit sanitizer configurations (e.g., DOMPurify) against known bypass vectors.

---

# 93. MARKDOWN RENDERING

Markdown-to-HTML rendering engines introduce XSS surfaces via embedded raw HTML or `javascript:` URI schemes.

---

# 94. SVG FILE SERVING

User-uploaded SVG files can execute JavaScript when rendered inline in the browser.

---

# 95. CONTENT SECURITY POLICY (CSP)

CSP serves as defense-in-depth.

Do not report the absence of CSP as an exploitable XSS vulnerability on its own.

---

# 96. SQL INJECTION

Identify locations where untrusted data interpolates directly into raw SQL statements.

---

# 97. PARAMETERIZED QUERIES

Modern ORMs and query builders parameterize data values safely by default.

Do not report injection simply because a query statement contains variables.

---

# 98. DYNAMIC SQL IDENTIFIERS

Table names, column identifiers, and sort orders cannot be parameterized via standard SQL bind parameters.

Verify strict identifier whitelisting.

---

# 99. RAW QUERY CONCATENATION

High-signal vulnerability:

```text
"... WHERE id = " + userInput
```

---

# 100. ORDER BY INJECTION

User-controlled sorting fields concatenated directly into database queries.

---

# 101. NOSQL INJECTION

In MongoDB or Document databases:

verify whether user-controlled object input injects query operators (`$ne`, `$gt`, `$where`).

---

# 102. OBJECT QUERY INJECTION

Example:

```json
{
  "password": {
    "$ne": null
  }
}
```

relevant to specific query parser implementations.

---

# 103. COMMAND INJECTION

Audit executions of:

- `child_process.exec`
- shell commands
- system script execution

that consume untrusted user input.

---

# 104. SAFE PROCESS SPAWNING

Prefer parameterized argument array APIs (`execFile`, `spawn`) over shell-parsed execution strings.

---

# 105. MANUAL SHELL ESCAPING

Manual shell argument escaping is notoriously fragile.

---

# 106. PATH TRAVERSAL

If user input influences filesystem paths:

test traversal payloads:

```text
../../
```

and operating-system-specific encoded variations.

---

# 107. PATH NORMALIZATION

Verify that path canonicalization and normalization occur prior to prefix validation checks.

---

# 108. ZIP SLIP

When extracting archives:

verify that destination entry paths do not escape the target extraction root directory.

---

# 109. SYMLINK ATTACKS

Filesystem interactions must not follow symlinks outside authorized directory sandboxes.

---

# 110. ARBITRARY LOCAL FILE READS

Endpoints accepting file path parameters must not expose arbitrary operating system files.

---

# 111. SERVER-SIDE REQUEST FORGERY (SSRF)

Audit server-side network requests that fetch user-supplied URLs.

---

# 112. SSRF TARGETS

Target surfaces include:

- loopback addresses (`127.0.0.1`, `localhost`)
- internal private networks (RFC 1918)
- cloud instance metadata endpoints (`169.254.169.254`)
- internal administrative interfaces

---

# 113. URL ALLOWLISTING

If remote URL fetching is a functional requirement:

enforce strict scheme, domain, and IP address allowlists.

---

# 114. DNS REBINDING

If custom SSRF defenses resolve hostnames only once before fetching:

audit whether DNS rebinding attacks can bypass IP checks.

---

# 115. HTTP REDIRECTS IN SSRF

An initially allowed public domain might return an HTTP 302 redirecting to an internal target.

---

# 116. ALTERNATIVE IP REPRESENTATIONS

Custom IP blocklists can often be bypassed using hexadecimal, octal, dword, or IPv6 representations.

---

# 117. CLOUD METADATA ENDPOINTS

Verify platform specifics before filing findings.

Do not assume AWS IMDS endpoints exist on serverless or non-AWS platforms.

---

# 118. XML EXTERNAL ENTITY (XXE)

Applies only if the application parses XML payloads.

If XML is unused:

**NOT APPLICABLE**

---

# 119. XML PARSER CONFIGURATION

Verify whether external entity resolution and DTD processing are disabled in XML parsers.

---

# 120. TEMPLATE INJECTION

Applies when user input controls template source code rather than dynamic data bindings.

---

# 121. SERVER-SIDE TEMPLATE INJECTION (SSTI)

Report only when attackers can manipulate template syntax in an engine that evaluates code expressions.

---

# 122. INSECURE DESERIALIZATION

Audit for unsafe native object deserialization:

- Java native serialization
- Python `pickle`
- unsafe YAML `load`
- PHP `unserialize`
- native equivalents

---

# 123. JSON PARSING IS NOT INSECURE DESERIALIZATION

Do not confuse standard JSON schema parsing with native code or object graph deserialization.

---

# 124. YAML LOADING

Verify usage of safe YAML loaders that prohibit arbitrary code execution.

---

# 125. PROTOTYPE POLLUTION

Applicable to JavaScript runtimes and recursive object merging utilities.

Trace untrusted JSON input into unsafe object property merges.

---

# 126. FILE UPLOAD ARCHITECTURE

Map:

```text
request
↓
validation
↓
storage
↓
serving
↓
processing
```

---

# 127. FILE EXTENSION VALIDATION

File extensions alone do not prove genuine content type.

---

# 128. CLIENT-SUPPLIED MIME TYPES

MIME types provided in request headers are completely attacker-controlled.

---

# 129. MAGIC NUMBER VERIFICATION

Validating file headers (magic bytes) improves content verification, though it does not eliminate polyglot files entirely.

---

# 130. FILE SIZE LIMITS

Enforce strict maximum payload and file size limits.

---

# 131. FILE COUNT LIMITS

Bound the number of simultaneous files processed per request.

---

# 132. FILENAME SANITIZATION

Sanitize or generate random alphanumeric storage names.

Never use raw client filenames as direct filesystem paths.

---

# 133. PUBLIC FILE SERVING

Serving user-uploaded HTML, SVG, or active content from the primary application origin introduces stored XSS and session compromise risks.

---

# 134. CONTENT-DISPOSITION ENFORCEMENT

Serving untrusted uploads with `Content-Disposition: attachment` forces browser downloads and mitigates inline execution.

---

# 135. ACCURATE CONTENT-TYPE HEADERS

Delivering incorrect content types allows browsers to sniff and execute payloads.

---

# 136. THE `X-Content-Type-Options: nosniff` HEADER

Essential defense-in-depth against browser MIME-sniffing exploits.

---

# 137. IMAGE PROCESSING LIBRARIES

Image parsers can contain memory safety flaws.

Document upload parsing surfaces for underlying library analysis.

---

# 138. DECOMPRESSION BOMBS

Zip or image uploads can decompress into massive sizes, triggering memory and disk exhaustion.

---

# 139. MALWARE SCANNING

Do not mandate enterprise antivirus scanning for every application.

Evaluate:

- peer-to-peer file sharing risks
- regulatory and corporate compliance requirements

---

# 140. OBJECT STORAGE ACCESS CONTROL

Ensure uploaded objects are not made publicly accessible unless explicitly designated as public assets.

---

# 141. PRESIGNED URL AUTHORIZATION

Verify:

- restricted object key scope
- tight expiration intervals
- strict HTTP method enforcement
- caller authorization checks

---

# 142. OBJECT KEY TAMPERING

Users must never be able to request signed upload or download URLs for objects belonging to other users or tenants.

---

# 143. DOWNLOAD AUTHORIZATION

Possessing an object key or UUID must not substitute for proper authorization verification.

---

# 144. DIRECTORY LISTING

If cloud storage buckets or web servers expose directory browsing, evaluate exposure sensitivity.

---

# 145. SECRETS SCANNING

Scan repositories for exposed:

- API keys
- database credentials
- private cryptographic keys
- webhook signing secrets
- service account tokens

---

# 146. FALSE POSITIVE SECRETS

Placeholder and test values do not constitute production exposures.

Verify context before reporting.

---

# 147. HISTORICAL SECRETS IN GIT

Removing a secret from the latest commit does not purge it from historical Git commits.

---

# 148. SECRET ROTATION REMEDIATION

If an exposed secret is confirmed:

remediation requires immediate revocation and rotation, not merely deleting the file.

---

# 149. ENVIRONMENT CONFIGURATION FILES

`.env` files must never be committed to repositories or exposed publicly through web servers.

---

# 150. FRONTEND ENVIRONMENT VARIABLES

Client-side JavaScript bundles are public.

Never place private secrets in frontend builds.

---

# 151. PUBLIC FRONTEND PREFIXES

Treat all variables exposed via `NEXT_PUBLIC_*` or equivalent prefixes as public knowledge.

---

# 152. PRODUCTION SOURCE MAPS

Public source maps expose code comments and internal architecture, but are not automatic vulnerabilities.

---

# 153. DEBUG ENDPOINTS

Audit for exposed administrative routes:

```text
/debug
/test
/dev
/internal
```

---

# 154. STACK TRACE LEAKAGE

Production error responses must not expose:

- physical file paths
- raw database queries
- credentials
- internal service hostnames

---

# 155. THIRD-PARTY ERROR OBJECTS

Errors returned by external SDKs often contain sensitive request metadata and credentials.

Never return raw SDK exceptions directly to clients.

---

# 156. APPLICATION LOGGING SECURITY

Audit logs to ensure they exclude:

- Authorization headers
- session cookies
- plaintext passwords
- API tokens
- personally identifiable information (PII)

---

# 157. SENSITIVE DATA IN QUERY STRINGS

Credentials transmitted in query parameters are captured in web server access logs.

---

# 158. AUDIT LOGGING OF PRIVILEGED ACTIONS

Critical administrative actions must generate tamper-resistant audit logs:

- role modifications
- permission escalations
- API key generation and revocation
- bulk data deletions

---

# 159. AUDIT LOG INTEGRITY

If standard users can alter or delete audit trail records, the security audit value is void.

---

# 160. ADMINISTRATIVE INTERFACES

Map:

- authentication enforcement
- MFA requirements
- role authorization
- exposed operations

---

# 161. ADMIN IS NOT UNCONSTRAINED BY DEFAULT

Administrative endpoints must still enforce tenant boundaries if the product supports multi-tenant administration.

---

# 162. USER IMPERSONATION CAPABILITIES

"Login-as-user" support features represent extreme security risks.

Verify:

- strict administrator authorization
- mandatory audit logging
- bounded session duration
- persistent visual indicators
- restrictions on sensitive actions while impersonating

---

# 163. FEATURE FLAG TAMPERING

Administrative feature flag controls must enforce strict authorization to prevent unauthorized access to hidden capabilities.

---

# 164. DEBUG CONFIGURATIONS

Running with `DEBUG=true` in production exposes detailed diagnostic state and unsafe execution paths.

---

# 165. DEFAULT CREDENTIALS

Audit for factory-default administrative credentials deployed to production.

---

# 166. HARDCODED PASSWORDS

Classified as P0 Critical.

---

# 167. BACKDOOR AND BYPASS LOGIC

Search for:

```text
if email == ...
if env == ...
master password
skipAuth
```

Do not speculate on intent; document the exact security impact.

---

# 168. TEST ROUTES IN PRODUCTION

Test endpoints that generate administrative tokens or bypass logic must never be active in production builds.

---

# 169. UNTRUSTED INTERNAL HEADERS

Pattern:

```text
X-Internal: true
```

without cryptographic verification or network boundary enforcement.

---

# 170. IP ALLOWLIST TRUST

If security depends on IP allowlisting:

verify reverse proxy trust configurations and direct origin accessibility.

---

# 171. REVERSE PROXY CONFIGURATION

Map:

- client IP extraction
- scheme detection
- host headers
- TLS termination

---

# 172. HOST HEADER INJECTION

If the backend utilizes the `Host` header to construct:

- password reset links
- OAuth callback URLs
- canonical links

attacker-controlled `Host` headers create serious vulnerabilities.

---

# 173. PASSWORD RESET HOST POISONING

Scenario:

```text
attacker sets Host
↓
backend generates reset URL from Host
↓
victim gets attacker-domain link
```

if infrastructure configuration permits arbitrary Host headers.

---

# 174. THE `X-Forwarded-Proto` HEADER

Misconfigured proxy trust can trick backends into issuing insecure cookies or redirect loops.

---

# 175. TLS TERMINATION

Verify production infrastructure.

Do not report an application as lacking TLS if TLS is properly terminated at a trusted edge load balancer.

---

# 176. SECURE COOKIE TRANSMISSION

Ensure application frameworks recognize reverse-proxied HTTPS connections so `Secure` cookies are transmitted.

---

# 177. HSTS

HTTP Strict Transport Security is defense-in-depth.

Do not report its absence as an exploitable vulnerability on its own.

---

# 178. SECURITY HEADERS

Evaluate:

- Content-Security-Policy (CSP)
- X-Frame-Options / frame-ancestors
- X-Content-Type-Options
- Referrer-Policy

Classify as P4 Hardening unless a direct attack path is demonstrated.

---

# 179. CLICKJACKING

Applicable if sensitive transactional UI interfaces can be embedded in malicious iframes.

---

# 180. OPEN REDIRECTS

Audit redirect, return, and callback parameters against strict allowlists.

---

# 181. JAVASCRIPT PSEUDO-PROTOCOLS

Frontend navigation routines must reject `javascript:` and other unsafe URI schemes.

---

# 182. TRUSTED ORIGINS IN EMAIL LINKS

Password reset and invitation links must always use an immutable, trusted server origin.

---

# 183. WEBHOOK SECURITY

Incoming webhooks require:

- cryptographic signature verification
- replay prevention
- tenant mapping isolation

---

# 184. UNSIGNED WEBHOOKS

Webhooks that alter critical financial or account state without cryptographic authentication are P0/P1 vulnerabilities.

---

# 185. WEBHOOK REPLAY ATTACKS

Old, signed webhook payloads must not be accepted and processed repeatedly.

---

# 186. OUTGOING WEBHOOK SSRF

Customer-defined webhook callback URLs can be targeted against internal infrastructure.

---

# 187. CALLBACK URL TARGETING

Same as outgoing webhooks.

---

# 188. REMOTE ASSET FETCHING

Fetching user-supplied image or document URLs creates SSRF risks.

---

# 189. DATA IMPORT VIA URL

Same SSRF attack surface.

---

# 190. DYNAMIC EMAIL TEMPLATE ASSETS

Fetching remote resources during email template rendering introduces SSRF vectors.

---

# 191. HEADLESS BROWSER RENDERING

Operating headless browsers against user-controlled URLs creates severe SSRF and sandbox escape risks.

---

# 192. PDF GENERATION FROM HTML/URLS

Combines risks of:

- SSRF
- local file disclosure
- script execution

depending on the underlying rendering engine.

---

# 193. GRAPHQL SECURITY

If GraphQL is deployed, audit:

- field-level authorization
- schema introspection policy
- query depth and complexity limits
- query batching abuse
- resolver-level IDORs

---

# 194. GRAPHQL RESOLVER AUTHORIZATION

Authorizing only the top-level query does not protect nested resolver fields.

---

# 195. GRAPHQL INTROSPECTION

Enabling introspection is not an automatic vulnerability; security through obscurity is not an authorization control.

---

# 196. BATCH REST OPERATIONS

Bulk update endpoints must validate authorization individually for every included item.

---

# 197. BULK OPERATION IDOR

A caller submits 100 IDs where 99 belong to them and 1 belongs to another tenant.

---

# 198. DATA EXPORT ENDPOINTS

Export endpoints represent high-volume data exfiltration channels requiring strict authorization.

---

# 199. CSV INJECTION

Formula injection occurs when exported spreadsheets open attacker-controlled cells without escaping.

---

# 200. FORMULA INJECTION CHARACTERS

Cells starting with:

```text
=
+
-
@
```

can be interpreted as formulas in spreadsheet software.

Evaluate the actual operational context.

---

# 201. DATA IMPORT PARSING

Bulk data imports must not bypass standard validation, authorization, or capacity quotas.

---

# 202. ADMINISTRATIVE IMPORTS

Administrative privileges do not permit imported data to violate fundamental domain constraints.

---

# 203. SEARCH RESULT AUTHORIZATION

Search queries must never return summary snippets of documents the caller cannot access.

---

# 204. AUTOCOMPLETE DATA LEAKAGE

Autocomplete endpoints must not leak private emails, usernames, or document titles.

---

# 205. ERROR-BASED ENUMERATION

Search endpoints must not leak resource existence via distinct error messages or result counts.

---

# 206. DATA MINIMIZATION

API responses should return only the specific fields required by the client.

---

# 207. SENSITIVE FIELD EXPOSURE

Audit for accidental serialization of:

- password hashes
- internal tokens
- secret credentials
- internal notes
- provider account IDs
- private customer contact info

---

# 208. PASSWORD HASH LEAKAGE

Password hashes must never be serialized in API responses, even to authorized users.

---

# 209. INTERNAL DATABASE IDENTIFIERS

Exposing sequential integers or UUIDs is not inherently a vulnerability; authorization is the real defense.

---

# 210. PRIVATE METADATA SERIALIZATION

Admin-only fields leaking through shared object serializers.

---

# 211. SENSITIVE DATA IN ACCESS LOGS

Sensitive responses must not be echoed into plaintext access logs.

---

# 212. SHARED CACHE DATA LEAKAGE

Shared caching layers returning user A's private response to user B.

---

# 213. CDN CACHING OF AUTHENTICATED DATA

Authenticated responses cached publicly at the edge.

---

# 214. THE `Vary: Cookie` AND `Vary: Authorization` HEADERS

Verify proper cache variance configuration where caching is deployed.

---

# 215. SERVICE WORKER CACHING

Service workers caching private responses on shared multi-user workstations.

---

# 216. CLIENT-SIDE STORAGE

Storing tokens in `localStorage`, `sessionStorage`, or `IndexedDB` must be evaluated against the application's XSS exposure and session architecture.

Do not declare `localStorage` an automatic vulnerability.

---

# 217. LOGOUT STORAGE PURGING

Logout routines should purge sensitive client-side cached data.

---

# 218. API KEY PRESENTATION

Dashboards should display API secrets only upon creation, storing only secure hashes thereafter.

---

# 219. CRYPTOGRAPHIC IMPLEMENTATION

Audit for custom, non-standard cryptography.

---

# 220. CUSTOM CRYPTOGRAPHY

Extreme risk occurs when developers implement custom encryption, password hashing, token generation, or digital signatures rather than leveraging standard libraries.

---

# 221. SECURE RANDOM NUMBER GENERATION

Security tokens must be generated using cryptographically secure pseudorandom number generators (CSPRNG).

---

# 222. PREDICTABLE TOKENS

Never generate security tokens using `Math.random()`, sequential timestamps, or predictable counters.

---

# 223. ENCRYPTION AT REST

Verify:

- algorithm selection
- cipher mode
- nonce/IV uniqueness
- key management
- ciphertext integrity (AEAD)

when custom application-level encryption is employed.

---

# 224. STATIC IV AND NONCE REUSE

Reusing static initialization vectors in modes like AES-GCM or AES-CBC completely breaks confidentiality.

---

# 225. UNAUTHENTICATED ENCRYPTION

Avoid unauthenticated cipher modes (e.g., standard AES-CBC without HMAC) vulnerable to padding oracle attacks.

---

# 226. CRYPTOGRAPHIC KEYS IN SOURCE

Hardcoded keys in source control are critical vulnerabilities.

---

# 227. KEY ROTATION STRATEGY

Encrypted persistent storage requires a defined key rotation and re-encryption lifecycle.

---

# 228. PSEUDONYMIZATION AND HASHING PII

Unsalted hashes of phone numbers or email addresses can be reversed via rainbow tables.

---

# 229. RATE LIMITING AS A SECURITY DEFENSE

Critical security control for:

- login endpoints
- password resets
- OTP verifications
- high-cost endpoints

---

# 230. RATE LIMITING BYPASS

If the rate limiter uses client-controlled headers (`X-Forwarded-For`) as identity keys:

the control is trivially bypassed.

---

# 231. DENIAL OF SERVICE VIA ACCOUNT LOCKOUT

Aggressive account lockout policies allow attackers to lock out victim accounts maliciously.

---

# 232. USER ENUMERATION VIA RATE LIMITING

Divergent rate limit buckets or error messages can confirm the existence of specific user accounts.

---

# 233. BUSINESS LOGIC ABUSE

Security extends beyond technical injection:

- self-referral abuse
- credit and promotional code farming
- unauthorized workflow state jumps
- negative numeric value submissions
- one-time action replay

---

# 234. NEGATIVE QUANTITY EXPLOITS

Example:

```text
quantity = -10
```

manipulating financial balances or inventory counts.

---

# 235. CLIENT-SUPPLIED PRICING

Prices and discounts submitted in client request bodies must never override server-side authoritative pricing.

---

# 236. SUBSCRIPTION TIER TAMPERING

Clients must not be able to elevate their own paid entitlement flags.

---

# 237. CONCURRENCY-SAFE SINGLE-USE ACTIONS

Coupons, invites, reset tokens, and vouchers must enforce race-free, atomic single-use redemption.

---

# 238. RACE CONDITIONS AS SECURITY EXPLOITS

Race conditions allowing users to exceed account balances, quotas, or coupon limits represent severe business logic flaws.

---

# 239. TIME-OF-CHECK TO TIME-OF-USE (TOCTOU)

Checking permissions or account balance in one step and executing mutations subsequently without transaction isolation.

---

# 240. FILE SYSTEM TOCTOU

Validating a temporary file path that is swapped before consumption.

---

# 241. DEPENDENCY AUDITING

Supply-chain vulnerability audits are addressed separately.

Document here only:

- actively vulnerable, unmaintained core dependencies
- dangerous dependency configurations

that directly impact the application's attack surface.

---

# 242. DEVELOPMENT DEPENDENCIES IN PRODUCTION

Development packages opening unauthenticated diagnostic routes in production.

---

# 243. EMBEDDED ADMINISTRATIVE TOOLS

Exposing database consoles, profilers, or debug toolbars in production environments is a severe finding.

---

# 244. LEAST PRIVILEGE DATABASE ACCESS

The runtime database user must possess only the minimum required CRUD privileges.

---

# 245. DATABASE SUPERUSER ACCESS

Applications connecting to databases as superusers drastically magnify the blast radius of SQL injection flaws.

---

# 246. SEPARATED MIGRATION PRIVILEGES

Running application runtime connections with schema modification (DDL) permissions should be avoided where possible.

---

# 247. OBJECT STORAGE CREDENTIAL SCOPING

Object storage tokens should be constrained to specific bucket prefixes.

---

# 248. CLOUD IAM PRIVILEGE BOUNDARIES

Application credentials must not hold broad administrative cloud permissions.

---

# 249. ASYNCHRONOUS WORKER PERMISSIONS

Background workers should operate under tightly scoped permissions.

---

# 250. SERVICE-TO-SERVICE AUTHENTICATION

Network locality alone does not provide sufficient trust for internal microservices.

---

# 251. MUTUAL TLS AND SIGNED SERVICE TOKENS

Evaluate against the internal threat model rather than mandating mTLS unconditionally.

---

# 252. SECURITY THROUGH OBSCURITY

Unpublished or undocumented internal endpoints are not secure by default.

---

# 253. NETWORK PERIMETER EXPOSURE

Verify whether internal services are genuinely shielded from public internet ingress.

If unverified:

**NETWORK EXPOSURE: NOT VERIFIED**

---

# 254. SSRF PAIRED WITH INTERNAL TRUST

The most devastating attack chain:

```text
SSRF
+
internal unauthenticated admin service
```

---

# 255. SSRF LEADING TO CLOUD CREDENTIALS

Evaluate based on the actual cloud provider environment.

---

# 256. DIRECT ORIGIN EXPOSURE

If a WAF/CDN protects public domains:

verify whether backend origins can be reached directly via IP to bypass perimeter controls.

---

# 257. TRUSTED EDGE HEADERS

If edge proxies inject identity headers:

```text
X-Authenticated-User
X-Internal
```

backends must accept these headers only from verified upstream proxies.

---

# 258. HEADER SPOOFING VIA DIRECT ACCESS

Direct origin access allows attackers to inject trusted proxy headers directly.

---

# 259. FAIL-CLOSED ERROR HANDLING

Security checks must fail-closed whenever authentication or authorization services are unreachable.

---

# 260. AUTHENTICATION SERVICE TIMEOUTS

Never fall back to:

```text
auth provider timeout
↓
allow request
```

---

# 261. PERMISSION STORE FAILURES

Authorization checks must deny access if permission stores fail.

---

# 262. CACHE FAILURE FALLBACKS

If permission caches fail, ensure fallbacks fail securely rather than defaulting to open access.

---

# 263. DEFAULT-ALLOW EXCEPTION HANDLING

Search for antipatterns:

```text
catch {
  return true
}
```

inside security decision logic.

---

# 264. UNKNOWN ROLE MAPPINGS

Never map an unknown or malformed role to an administrative default.

---

# 265. DEFAULT TENANT ESCALATION

Missing tenant context must never default to a global or primary tenant.

---

# 266. SECURITY TEST COVERAGE

Inspect:

- authentication unit tests
- authorization test matrices
- negative security test cases
- cross-user isolation tests
- cross-tenant isolation tests
- injection test suites
- upload validation tests

---

# 267. HAPPY PATH TESTING IS NOT SECURITY TESTING

Proving an owner can update a resource does not prove a non-owner cannot.

---

# 268. NEGATIVE AUTHENTICATION TESTS

For sensitive endpoints, verify:

```text
unauthenticated
authenticated wrong user
authenticated right user
privileged user
```

---

# 269. NEGATIVE CROSS-TENANT TESTS

Authenticate with Tenant A credentials while requesting Tenant B resource IDs.

---

# 270. NEGATIVE MASS ASSIGNMENT TESTS

Submit payloads containing forbidden privileged attributes.

---

# 271. TARGETED SQL INJECTION TESTS

Execute tests only against identified raw query paths; avoid blind fuzzing of safe ORM queries.

---

# 272. CONTROLLED SSRF TESTING

Use dedicated loopback test environments; never target external third-party infrastructure without explicit authorization.

---

# 273. UPLOAD VALIDATION TESTS

Verify handling of:

- oversized files
- mismatched MIME types
- traversal filenames
- active script payloads

in controlled sandboxes.

---

# 274. TOKEN INTEGRITY TESTS

Verify rejection of:

- expired tokens
- revoked tokens
- malformed signatures
- wrong issuers or audiences
- reused refresh tokens

---

# 275. CONCURRENT ACTION TESTS

Submit simultaneous parallel requests for one-time resources:

```text
same coupon/reset/invite
```

---

# 276. SESSION INVALIDATION TESTS

Verify that a session cannot be reused after explicit logout.

---

# 277. CREDENTIAL CHANGE SESSION TESTS

Verify active session and token behavior following password updates.

---

# 278. PRIVILEGE REVOCATION TESTS

Verify that revoking a user's administrative role immediately terminates their administrative access.

---

# 279. FINDING FORMAT

Every significant finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Attacker model:
Authentication required:
Privileges required:

Entry point:
Method/Route:
Resource:
Tenant:

File/Class:
Function:
Relevant configuration:

Vulnerability:

Evidence:

Exploit Preconditions:

Exploit Flow:

T0:
T1:
T2:
T3:

Expected security boundary:

Actual security boundary:

Affected data/action:

Confidentiality impact:

Integrity impact:

Availability impact:

Cross-user impact:

Cross-tenant impact:

Exploitability:

Blast radius:

Root cause:

Recommended remediation:

Regression/security test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 280. SEVERITY

Use:

## P0 - CRITICAL

Examples:

- unauthenticated remote code execution or account takeover
- cross-tenant sensitive data exfiltration at scale
- exposed production secrets granting immediate administrative access
- arbitrary financial or balance manipulation
- complete authentication bypass to administrative privileges

## P1 - HIGH

- exploitable IDOR/BOLA exposing sensitive data or mutations
- privilege escalation from user to administrator
- exploitable SQL or command injection with significant impact
- SSRF exposing sensitive internal services or cloud credentials
- account takeover flows
- unsigned webhooks mutating critical business state
- sensitive credential or personal data exposure

## P2 - MEDIUM

- security weaknesses requiring specific preconditions
- stored XSS restricted to low-privilege contexts
- limited information disclosure
- CSRF on non-critical actions
- constrained business logic abuse paths

## P3 - LOW

- minor information disclosure
- edge-case vulnerabilities with high complexity
- defense-in-depth gaps without direct exploitability

## P4 - HARDENING

- security best practice enhancements without a confirmed exploit path

---

# 281. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

source code, configuration, or test reproduction conclusively verifies the exploit path.

MEDIUM:

strong static code evidence exists, but deployment exposure is partially unverified.

LOW:

depends on unverified third-party infrastructure or provider settings.

---

# 282. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 283. EXPLOITABILITY

Use:

```text
TRIVIAL
LOW COMPLEXITY
MODERATE
HIGH COMPLEXITY
NOT VERIFIED
```

Do not assign arbitrary CVSS scores without complete metrics or explicit requests.

---

# 284. SECURITY CATEGORIES

Classify:

```text
AUTHENTICATION
AUTHORIZATION
IDOR/BOLA
TENANT ISOLATION
SESSION
TOKEN
INJECTION
XSS
CSRF
SSRF
FILE UPLOAD
PATH TRAVERSAL
SECRETS
DATA EXPOSURE
CRYPTO
BUSINESS LOGIC
CONFIGURATION
TRUST BOUNDARY
```

---

# 285. EVIDENCE TIER

Use:

```text
A - reproduced in controlled environment
B - complete executable code path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 286. FALSE-POSITIVE PREVENTION

Before reporting P0/P1/P2 findings, verify:

1. actual route reachability
2. authentication middleware coverage
3. authorization enforcement
4. framework interceptors and filters
5. service-layer access checks
6. database-level constraints
7. production deployment exposure
8. framework default auto-escaping and parameterization
9. automated test coverage
10. exploit preconditions

Do not flag a vulnerability based on an isolated code snippet if another layer neutralizes the attack path.

---

# 287. DO NOT LABEL EVERYTHING CRITICAL

Severity must strictly reflect:

- required attacker model
- necessary preconditions
- affected data and actions
- total blast radius

---

# 288. DO NOT REPORT MISSING HEADERS AS STANDALONE VULNERABILITIES

Missing CSP, HSTS, or nosniff headers are defense-in-depth hardening opportunities, not exploitable vulnerabilities on their own.

---

# 289. DO NOT REPORT JWT USAGE AS A VULNERABILITY

JWT is a standard mechanism; the vulnerability lies in broken implementations.

---

# 290. DO NOT REPORT LOCALSTORAGE USAGE AS AN AUTOMATIC FLAW

Threat depends entirely on XSS exposure, token lifetime, and the overall session model.

---

# 291. DO NOT REPORT PUBLIC IDENTIFIERS AS IDORS

Sequential or public IDs are not IDORs if proper authorization controls exist.

---

# 292. DO NOT REPORT WILDCARD CORS AUTOMATICALLY

Public, unauthenticated APIs may legitimately declare wildcard CORS.

---

# 293. DO NOT REPORT OPENAPI/SWAGGER MERELY FOR BEING PUBLIC

Verify whether documentation endpoints actually expose sensitive internal data or administrative actions.

---

# 294. DO NOT REPORT VERSION BANNERS AS HIGH SEVERITY

Informational disclosure without an exploit path is low severity.

---

# 295. DO NOT RELY ON WAFS TO FIX APPLICATION DEFECTS

WAFs provide defense-in-depth; always remediate the root vulnerability in the application code.

---

# 296. DO NOT PROPOSE CAPTCHA AS AN AUTHORIZATION FIX

CAPTCHAs mitigate automated abuse, but do not provide authorization controls.

---

# 297. DO NOT MODIFY CODE

During the audit:

- do not alter authentication logic
- do not rotate secrets
- do not ban users
- do not modify firewall rules
- do not delete routes
- do not alter permissions

unless explicitly authorized. Complete the thorough investigation first.

---

# 298. OUTPUT - APPLICATION_SECURITY_AUDIT.md

Structure the final report:

## 1. Executive Summary

- security architecture overview
- attacker models evaluated
- attack surface summary
- highest-risk vulnerabilities
- evidence quality assessment

## 2. Attack Surface Map

## 3. Trust Boundary Map

## 4. Authentication Audit

## 5. Session Audit

## 6. JWT / Token Audit

## 7. Password / Reset / MFA Audit

## 8. Authorization Audit

## 9. IDOR / BOLA Audit

## 10. Multi-Tenant Isolation Audit

## 11. Field-Level Authorization / Mass Assignment

## 12. CSRF / CORS Audit

## 13. XSS Audit

## 14. Injection Audit

## 15. SSRF Audit

## 16. Path / Filesystem Audit

## 17. File Upload / Download Security

## 18. Secrets / Credentials Audit

## 19. Sensitive Data Exposure Audit

## 20. Admin / Debug / Internal Endpoint Audit

## 21. Proxy / Trusted Header Audit

## 22. Webhook Security Audit

## 23. Cryptography / Token Generation Audit

## 24. Business Logic Abuse Audit

## 25. Cloud / IAM / Service Credential Audit

## 26. Logging / Audit Trail Security

## 27. Security Test Coverage

## 28. Findings Summary

| ID | Severity | Category | Entry point | Attacker | Problem | Confidence |
|---|---|---|---|---|---|---|

## 29. P0 Findings

## 30. P1 Findings

## 31. P2 Findings

## 32. P3 Findings

## 33. P4 Hardening

## 34. Things Done Well

## 35. Not Verified

## 36. Security Remediation Roadmap

---

# 299. AUTHORIZATION MATRIX

| Route | Principal | Resource | Ownership | Role | Result |
|---|---|---|---|---|---|

---

# 300. TENANT MATRIX

| Component | Tenant source | Query scope | Cache scope | Safe |
|---|---|---|---|---|

---

# 301. SECRET MATRIX

| Secret | Source | Runtime location | Client exposed | Rotation |
|---|---|---|---|---|

Never print actual production secret values in the audit report.

---

# 302. INPUT TRUST MATRIX

| Input | Source | Validation | Dangerous sink | Risk |
|---|---|---|---|---|

---

# 303. SESSION/TOKEN MATRIX

| Credential | Lifetime | Storage | Revocation | Rotation | Risk |
|---|---|---|---|---|---|

---

# 304. SECOND PASS - WRONG USER ATTACK

For every sensitive resource:

```text
User A owns resource
↓
User B authenticates
↓
B sends A's resource ID
```

Verify what explicit authorization control prevents unauthorized access.

---

# 305. SECOND PASS - WRONG TENANT ATTACK

```text
Tenant A credential
↓
Tenant B resource ID
```

Audit:

- direct APIs
- search endpoints
- data exports
- cached entries
- file storage

---

# 306. SECOND PASS - HIDDEN FIELD INJECTION ATTACK

Inject privileged attributes into every critical resource creation and update request.

---

# 307. SECOND PASS - LEGACY ROUTE RECONNAISSANCE

Audit older:

- v1 endpoints
- deprecated routes
- internal endpoints
- legacy mobile paths

and compare authentication coverage against modern routes.

---

# 308. SECOND PASS - TOKEN REUSE EXPLOITATION

Test:

- post-logout token reuse
- post-password-reset token reuse
- refresh token rotation reuse
- post-role-revocation access token reuse

---

# 309. SECOND PASS - PASSWORD RESET TAKEOVER

Walk the password reset flow from the attacker's perspective:

- reset request initiation
- token entropy and storage
- token reuse prevention
- concurrent token usage
- Host header manipulation

---

# 310. SECOND PASS - MASS ASSIGNMENT AUDIT

Submit:

```json
{
  "ownerId": "attacker",
  "role": "admin",
  "verified": true,
  "balance": 999999
}
```

tailored to the specific application schema.

---

# 311. SECOND PASS - INJECTION SINK TRACING

Perform repository-wide searches for:

- raw SQL statements
- shell command execution
- dynamic template evaluation
- filesystem path construction
- server-side HTTP fetches
- unsafe deserialization

Trace all untrusted user inputs reaching these sinks.

---

# 312. SECOND PASS - SSRF PATH ANALYSIS

For every server-side URL fetch, ask:

> Who controls the destination?

Analyze:

- URI schemes
- HTTP redirect handling
- DNS resolution
- private network ranges

---

# 313. SECOND PASS - FILE HANDLING ATTACKS

For upload and download pipelines, test:

- filename sanitization
- payload validation
- storage paths
- access authorization
- serving origin isolation

---

# 314. SECOND PASS - REPOSITORY SECRETS SEARCH

Search:

- active source code
- configuration files
- sample and test files
- CI/CD pipelines
- Dockerfiles
- infrastructure definitions

Inspect Git history where accessible.

---

# 315. SECOND PASS - TRUSTED HEADER SPOOFING

Directly submit headers normally appended by:

- reverse proxies
- CDNs
- API gateways

Verify whether clients can spoof identity or internal trust boundaries.

---

# 316. SECOND PASS - ADMINISTRATIVE ATTACK SURFACE

Review administrative functionality for:

- missing granular authorization checks
- unconstrained destructive operations
- hidden authentication bypass flags
- user impersonation mechanisms

---

# 317. SECOND PASS - ERROR LEAKAGE

Trigger:

- input validation errors
- database exceptions
- unhandled system errors
- third-party SDK failures

Inspect responses and log files for information leakage.

---

# 318. SECOND PASS - CACHE DATA CONTAMINATION

Invoke personalized endpoints sequentially as User A and User B.

Verify that User A's response is never served to User B.

---

# 319. SECOND PASS - CONCURRENT ACTION EXPLOITATION

For one-time actions:

- coupons
- invite codes
- reset tokens
- credit redemptions

dispatch concurrent parallel requests to test race conditions.

---

# 320. SECOND PASS - AUTHENTICATION SERVICE OUTAGE

Simulate:

- identity provider downtime
- authorization database downtime
- caching layer failure

Verify that security decisions fail-closed.

---

# 321. FINAL QUALITY GATE

Before finalizing the audit report, confirm:

- attacker models are explicitly defined
- public, internal, and administrative attack surfaces are fully inventoried
- authentication is strictly distinguished from authorization
- every sensitive resource has an explicit ownership and authorization analysis
- cross-tenant isolation is tested
- nested resources have parent-child authorization validation
- field-level authorization is evaluated
- mass assignment vulnerability paths are tested
- the complete login, reset, session, and token lifecycle is mapped
- token revocation and reuse detection are audited
- CSRF is evaluated only where ambient credentials exist
- CORS is not conflated with authorization
- injection findings trace untrusted input to genuine sinks
- framework auto-escaping and parameterized queries are confirmed before filing XSS/SQLi
- SSRF includes redirect and private network evaluation
- file upload audits cover storage and serving, not just intake validation
- secret findings distinguish real credentials from sample or test values
- frontend-visible environment variables are not flagged if designed to be public
- raw error and third-party SDK objects are not returned to clients
- trusted proxy headers are analyzed for direct origin spoofing
- internal endpoints are not assumed safe merely because they are internal
- business logic abuse and race conditions are evaluated
- P4 hardening items are strictly distinguished from exploitable vulnerabilities
- severity accurately reflects attacker model, preconditions, and blast radius
- no P0/P1 finding is based purely on the absence of a best practice

---

# FINAL RULE

Do not deliver a report that merely states:

> Add MFA, CSP, WAF, secure headers, and follow OWASP guidelines.

That is not an application security audit.

Look for real issues such as:

```text
GET /invoices/:id
↓
middleware confirms user is logged in
↓
handler loads invoice only by ID
↓
no ownership/tenant condition
↓
attacker changes 8231 -> 8232
↓
receives another customer's invoice
```

or:

```text
PATCH /users/me
↓
request body passed directly to ORM update
↓
attacker adds:
role = "admin"
↓
ORM persists hidden field
↓
privilege escalation
```

or:

```text
backend receives X-Internal-User header from trusted gateway
↓
origin is also directly internet accessible
↓
backend trusts header without verifying caller
↓
attacker calls origin directly
↓
sets X-Internal-User manually
↓
authentication bypass
```

or:

```text
POST /fetch-preview
{
  "url": attackerControlled
}

↓
backend fetches URL
↓
redirects are followed
↓
attacker-controlled endpoint redirects to internal service
↓
backend fetches internal administrative endpoint
```

or:

```text
password reset URL generated using incoming Host header
↓
attacker triggers reset with forged Host
↓
victim receives link to attacker-controlled domain
↓
token is exposed when victim clicks
```

or:

```text
tenant A requests:
GET /files/123

↓
API checks user authentication
↓
storage lookup uses global file ID
↓
no tenant ownership condition
↓
file 123 belongs to tenant B
↓
cross-tenant file disclosure
```

or:

```text
upload endpoint allows SVG
↓
file is served inline from main application origin
↓
uploaded active content executes under application origin
↓
stored XSS affects other authenticated users
```

or:

```text
production frontend bundle contains provider secret
↓
browser downloads bundle
↓
attacker extracts key
↓
key has privileged server API scope
```

These are the application security flaws you must uncover.

Think through:

- attacker identity
- trust boundaries
- authentication
- authorization
- resource ownership
- tenant scoping
- untrusted input
- dangerous sinks
- credential lifecycles
- server-side capabilities
- data exposure
- concurrency abuse

For every significant finding, you must be able to answer:

> Who is the attacker?

> Must they be authenticated?

> What privileges must they possess?

> What exact request and payload do they submit?

> What security control should stop them?

> Where is that control missing or bypassable?

> What exact data or unauthorized action does the attacker achieve?

> What is the blast radius?

If route exposure is unconfirmed:

**NOT VERIFIED.**

If vulnerability depends on unconfirmed infrastructure settings:

**INFRASTRUCTURE EXPOSURE NOT VERIFIED.**

If an observation is simply defense-in-depth without a confirmed exploit path:

**P4 - HARDENING.**

It is better to discover 5 genuine exploitable security vulnerabilities with complete attack paths than to produce 100 generic OWASP checklist items.

The ultimate objective is a forensically rigorous application security audit from which every significant finding translates directly into:

- deterministic security regression tests
- authorization fixes
- tenant isolation safeguards
- secure input validation
- token and session corrections
- secret rotation procedures
- trust-boundary hardening
- production security remediation
