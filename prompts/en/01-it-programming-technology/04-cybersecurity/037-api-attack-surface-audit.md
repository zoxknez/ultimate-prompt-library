---
id: UPL-IT-037
number: 37
slug: api-attack-surface-audit
title: API Attack Surface Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# API ATTACK SURFACE AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and attacker-oriented analysis of the application's entire API attack surface.

Main goal:

> Locate all externally, internally, indirectly, or conditionally reachable API entry points, determine what data and privileges they accept, which trust boundaries they cross, and where an attacker can bypass expected defenses through alternative routes, legacy versions, hidden parameters, batch operations, GraphQL, webhooks, internal endpoints, file workflows, debug functions, or inconsistent middleware pipelines.

This is not:

- a generic API security checklist
- merely an inventory table of endpoints
- an OWASP API Top 10 checklist recitation
- merely an authentication audit
- merely an authorization audit
- generic fuzzing
- merely a Swagger/OpenAPI documentation review
- assuming undocumented endpoints are unreachable
- assuming internal endpoints cannot be reached
- automatically deleting all legacy routes
- automatically migrating everything to an API gateway

The focus is on the question:

> What can an attacker actually invoke, with what input, through which network and application boundaries, and how many distinct pathways lead to the same privileged capability?

Priority:

**unintended public exposure > alternative privileged paths > inconsistent auth/authz > dangerous inputs > legacy/debug/admin routes > bulk/batch amplification > internal trust bypass > hidden side effects > enumeration > hardening**

It is better to identify 5 unexpected, genuinely reachable attack paths than to compile a table of 300 endpoints devoid of security context.

---

# 1. ESTABLISH THE API ARCHITECTURE

Before filing findings, identify:

- REST
- GraphQL
- RPC
- gRPC
- WebSocket
- SSE
- webhook endpoints
- upload endpoints
- internal service endpoints
- admin APIs
- mobile APIs
- legacy APIs
- callback endpoints

---

# 2. MAP THE NETWORK TOPOLOGY

Map:

```text
Internet
↓
CDN / WAF
↓
API Gateway / Reverse Proxy
↓
Backend
↓
Internal services
↓
Database / Queue / Storage
```

If unknown:

**NETWORK EXPOSURE: NOT VERIFIED**

---

# 3. ROUTE INVENTORY

Extract all routes from:

- router definitions
- controllers
- routing decorators
- route annotations
- framework configuration files
- API gateway configurations
- reverse proxy rules
- serverless functions
- OpenAPI specifications
- GraphQL schemas
- webhook listener definitions

---

# 4. DO NOT RELY SOLELY ON OPENAPI

Documentation is frequently incomplete or stale.

Compare:

```text
documented routes
vs
actual registered routes
```

---

# 5. UNDOCUMENTED ROUTES

An undocumented route is not automatically a vulnerability.

However, it may be:

- forgotten
- legacy
- internal
- debug
- privileged

---

# 6. DEAD ROUTES

A route existing solely in code is not an attack surface if it is never registered or deployed.

Verify runtime reachability.

---

# 7. ROUTE MAPPING

For each endpoint, record:

```text
Method:
Path:
Protocol:
Public:
Authentication:
Authorization:
Tenant-scoped:
Input:
Output:
Side effects:
Rate limit:
Environment:
```

---

# 8. ATTACK SURFACE CLASSIFICATION

Categorize:

```text
PUBLIC READ
PUBLIC WRITE
AUTHENTICATED READ
AUTHENTICATED WRITE
ADMIN
INTERNAL
WEBHOOK
UPLOAD
BULK
BACKGROUND TRIGGER
DEBUG
LEGACY
```

---

# 9. ENTRY POINT DUPLICATION

The same underlying business action may be exposed across:

```text
REST
GraphQL
mobile API
legacy API
admin API
internal API
```

Each surface must enforce identical security controls.

---

# 10. ALTERNATIVE PATH BYPASSES

Classic defect pattern:

```text
new route protected
↓
old v1 route still active
↓
same service call
↓
weaker middleware
```

---

# 11. API VERSION INVENTORY

Locate:

```text
/v1
/v2
/v3
legacy
deprecated
```

---

# 12. VERSION SECURITY DRIFT

Compare across API versions:

- authentication
- authorization
- rate limiting
- input validation
- response field serialization

---

# 13. MOBILE APIS

Legacy mobile clients often mandate dedicated endpoints.

Verify security parity with web APIs.

---

# 14. ADMIN APIS

Never assume an `/admin` path prefix implies real access control.

---

# 15. INTERNAL APIS

Never assume an `/internal` prefix is not internet-reachable.

---

# 16. DEBUG APIS

Search for:

```text
/debug
/test
/dev
/diagnostics
/metrics
/admin
/internal
```

---

# 17. HIDDEN FEATURE FLAG ROUTES

An endpoint may be hidden in the UI, but actively routed on the backend.

---

# 18. FEATURE FLAGS ARE NOT AUTHORIZATION

If clients can supply or manipulate feature flags:

this does not constitute an authorization boundary.

---

# 19. ROUTE REGISTRATION ORDER

Framework middleware mounting order can silently alter route protection.

---

# 20. MIDDLEWARE COVERAGE

Map middleware application:

```text
global
router
group
route
handler
```

---

# 21. ROUTES OUTSIDE PROTECTED GROUPS

Example:

```text
router.use(auth)
router.get(...)
```

while another sensitive route was registered prior to `auth`.

---

# 22. METHOD DRIFT

A GET route is protected, but POST or DELETE on the identical path accidentally lacks authorization.

---

# 23. HEAD REQUESTS

Frameworks may automatically synthesize HEAD handlers.

Inspect:

- metadata leakage
- unauthenticated state mutation

---

# 24. OPTIONS REQUESTS

Must not disclose sensitive content or bypass preflight checks.

---

# 25. HTTP METHOD OVERRIDE

If supporting:

```text
X-HTTP-Method-Override
_method
```

verify whether middleware evaluates the effective or raw method.

---

# 26. TRAILING SLASHES

If reverse proxies and backend applications diverge on:

```text
/admin
/admin/
```

verify actual routing behavior.

Do not report without evidence.

---

# 27. CASE NORMALIZATION

Same principle applies to case-sensitive versus case-insensitive routing mismatches.

---

# 28. ENCODED PATHS

Double decoding or encoded path slashes mapping to unexpected route handlers.

Relevant only where proxy and framework parsing semantics enable it.

---

# 29. BASE PATH MAPPING

API gateways may map internal routes under unexpected public paths.

---

# 30. DIRECT ORIGIN ACCESS

If a WAF or API gateway protects the public domain:

verify whether the origin IP is directly reachable, thereby bypassing:

- WAF rules
- rate limiters
- edge authentication headers
- IP allowlists

---

# 31. TRUSTED HEADERS

Search for:

```text
X-User
X-Internal
X-Forwarded-User
X-Role
X-Tenant
```

---

# 32. HEADER SPOOFING

If the backend trusts gateway-injected identity headers:

clients communicating directly with the origin must not be able to forge them.

---

# 33. PROXY AUTHENTICATION

If authentication terminates at the edge:

the backend must cryptographically verify that requests genuinely originate from trusted proxies.

---

# 34. INTERNAL NETWORK TRUST

`source IP is internal` is insufficient protection if SSRF or compromised internal nodes can invoke the endpoint.

---

# 35. PUBLIC ROUTES

Identify all unauthenticated endpoints across the application.

---

# 36. PUBLIC WRITE ENDPOINTS

High-risk category:

```text
POST
PUT
PATCH
DELETE
```

without authentication requirements.

Some are legitimate:

- user registration
- login
- webhooks
- contact forms

yet each demands a dedicated threat model.

---

# 37. PUBLIC RESOURCE CREATION

Can facilitate:

- spam flooding
- storage exhaustion
- queue worker saturation
- free tier and credit abuse

---

# 38. SIDE EFFECT INVENTORY

Classify side effects for each endpoint:

```text
NONE
DB WRITE
EXTERNAL CALL
EMAIL/SMS
PAYMENT
JOB ENQUEUE
FILE WRITE
PRIVILEGE CHANGE
```

---

# 39. HIDDEN SIDE EFFECTS

A GET request that:

- modifies state
- sends emails
- generates tokens
- triggers asynchronous jobs

represents a high-signal defect.

---

# 40. SAFE METHOD SEMANTICS

GET and HEAD requests should never induce state mutations outside specific design exceptions.

---

# 41. QUERY PARAMETER INPUTS

Inventory all accepted query parameters.

---

# 42. REQUEST BODY INPUTS

Inventory payload formats:

- JSON
- form URL-encoded
- multipart
- raw binary
- XML
- CSV

---

# 43. HEADER INPUTS

Attackers control incoming HTTP headers except those reliably sanitized or overwritten by trusted proxies.

---

# 44. COOKIE INPUTS

Cookies represent attacker-controlled input.

---

# 45. PATH PARAMETERS

Resource IDs, slugs, filenames, and sub-actions embedded within URLs.

---

# 46. UNKNOWN FIELDS

How does the API handle extraneous JSON fields?

---

# 47. SILENT ACCEPTANCE

Increases mass-assignment risks if bodies pass directly to data layers.

---

# 48. STRICT REJECTION

Can be an effective defense.

However, consider client backwards-compatibility trade-offs.

---

# 49. BODY MERGE PATTERNS

Search for:

```text
{
  ...defaults,
  ...req.body
}
```

and reversed merge orders.

---

# 50. SECURITY FIELD OVERRIDES

Determine whether request bodies can modify:

- role
- owner
- tenant
- status
- verified
- price
- billing plan
- permissions

---

# 51. QUERY PARAMETERS TO DATABASE FILTERS

Search for patterns like:

```text
where: req.query
```

---

# 52. ARBITRARY FILTERS

Can expose:

- sensitive entity fields
- expensive query execution plans
- tenant isolation bypasses

---

# 53. DYNAMIC SORTING

Dynamic sort parameters can expose:

- SQL injection vectors
- unindexed query performance degradations

---

# 54. INCLUDE AND EXPAND PARAMETERS

APIs supporting:

```text
?include=...
?expand=...
```

can leak sensitive relationships omitted from default serialization.

---

# 55. FIELD SELECTION

```text
?fields=...
```

must never expose restricted or privileged attributes.

---

# 56. DEBUG PARAMETERS

Search for:

```text
?debug=true
?admin=true
?internal=true
```

---

# 57. ENVIRONMENT PARAMETERS

Callers must never be permitted to specify:

- production
- staging
- deployment region

if doing so unlocks alternative environments or resources.

---

# 58. CALLBACK URLS

Endpoints accepting webhook or callback URLs inherently expose SSRF attack surfaces.

---

# 59. URL INPUT ATTRIBUTES

Locate parameters named:

```text
url
uri
callback
redirect
webhook
imageUrl
importUrl
```

---

# 60. FILE INPUTS

File endpoints belong in dedicated upload audits, but catalog their reachable attack surfaces here.

---

# 61. BULK ENDPOINTS

Specifically audit:

```text
/bulk
/batch
/import
/export
```

---

# 62. BULK AMPLIFICATION

A single incoming HTTP request can trigger:

```text
10,000 DB writes
10,000 emails
10,000 jobs
```

---

# 63. ITEM COUNT LIMITS

Request rate limiters cannot observe backend operational amplification.

---

# 64. BULK AUTHORIZATION

Every individual item in a bulk payload must undergo authorization.

---

# 65. BULK VALIDATION

A single malformed item must not trigger undefined partial state mutations.

---

# 66. BATCH PARTIAL SUCCESS

The API contract must clearly define:

- item-level success/error reporting
- transactional atomicity

---

# 67. GRAPHQL

If implemented, map:

```text
queries
mutations
subscriptions
custom scalars
directives
```

---

# 68. GRAPHQL IS NOT A SINGLE NARROW SURFACE

A single `/graphql` endpoint can expose hundreds of operational resolvers.

---

# 69. INTROSPECTION

Not a vulnerability in isolation.

Leverage it for surface enumeration if available in authorized contexts.

---

# 70. GRAPHQL QUERY DEPTH

Deeply nested queries can exhaust server memory and database connections.

---

# 71. GRAPHQL ALIASES

A single query can duplicate the same expensive resolver many times.

---

# 72. GRAPHQL BATCHING

A single HTTP POST can pack multiple independent GraphQL operations.

---

# 73. GRAPHQL MUTATION AUTHORIZATION

Every mutation resolver must enforce strict authorization checks.

---

# 74. GRAPHQL FIELD-LEVEL AUTHORIZATION

Sensitive nested fields mandate dedicated field-level authorization policies.

---

# 75. GRAPHQL GLOBAL OBJECT IDENTIFIERS

Generic `node(id: ID!)` resolvers represent major IDOR attack vectors.

---

# 76. CUSTOM SCALARS

Custom URL, file, or JSON scalars can evade standard schema validation routines.

---

# 77. ARBITRARY JSON SCALARS

Can enable mass assignment or query operator injection when passed downstream.

---

# 78. RPC SERVICES

If exposing JSON-RPC or custom RPC:

inventory all callable methods.

---

# 79. METHOD NAME INPUTS

Never allow dynamic method dispatch without an explicit allowlist.

---

# 80. GRPC SERVICES

If externally reachable:

map all services, methods, and required authentication metadata.

---

# 81. GRPC REFLECTION

Not an automatic vulnerability, but discloses complete API contracts.

---

# 82. WEBSOCKET CHANNELS

Map:

```text
handshake
message types
subscriptions
commands
```

---

# 83. HANDSHAKE AUTHENTICATION

Audit connection initialization checks.

---

# 84. MESSAGE-LEVEL AUTHORIZATION

An authenticated connection does not grant rights to invoke arbitrary commands or mutate resources.

---

# 85. WEBSOCKET IDOR

Resource IDs in socket messages demand the identical authorization checks enforced in REST APIs.

---

# 86. TOPIC SUBSCRIPTIONS

Users must never be able to subscribe to private channels belonging to other accounts.

---

# 87. CHANNEL NAMES

Predictable channel names do not replace authorization controls.

---

# 88. WEBSOCKET MESSAGE SIZES

Large message payloads can cause memory exhaustion.

---

# 89. WEBSOCKET MESSAGE RATE LIMITING

HTTP rate limiters frequently fail to monitor intra-socket message rates.

---

# 90. SERVER-SENT EVENTS (SSE)

Long-lived connections:

verify authentication and channel scoping.

---

# 91. SSE RECONNECT TOKENS

Tokens passed via query strings can leak into logs and browser history.

---

# 92. WEBHOOK ENDPOINTS

Incoming webhooks are inherently public endpoints in most architectures.

They require dedicated authenticity and origin verification.

---

# 93. WEBHOOK SECRETS AND SIGNATURES

Detailed webhook audits are covered separately; audit public reachability here.

---

# 94. UNSIGNED WEBHOOKS

Critical risk if unauthenticated webhooks trigger privileged state mutations.

---

# 95. CALLBACK ENDPOINTS

OAuth and payment callbacks represent security-sensitive entry points.

---

# 96. STATE AND CORRELATION TOKENS

Callbacks must validate state or transaction correlation parameters matching expected protocol flows.

---

# 97. FILE DOWNLOAD ENDPOINTS

Private file download routes represent critical data exfiltration attack surfaces.

---

# 98. EXPORT ENDPOINTS

High-value targets for bulk data extraction.

---

# 99. AGGREGATED DATA EXPORTS

Can compile data across multiple entities while bypassing individual resource-level checks.

---

# 100. SEARCH ENDPOINTS

Search functionality presents attack surfaces for:

- account enumeration
- data leakage
- unindexed database query abuse

---

# 101. AUTOCOMPLETE ENDPOINTS

Can leak sensitive names, emails, or internal identifiers.

---

# 102. COUNT AND STATS ENDPOINTS

Analytics endpoints can leak tenant user counts, transaction volumes, or business growth metrics.

---

# 103. METRICS ENDPOINTS

Public metrics endpoints can disclose:

- internal endpoint routes
- server hostnames
- customer identifiers
- system load patterns

Severity scales according to exposed data.

---

# 104. HEALTH ENDPOINTS

Health endpoints should remain strictly minimal.

---

# 105. DEEP HEALTH ENDPOINTS

Returning:

```text
DB URL
Redis host
provider status
```

provides unnecessary internal reconnaissance data.

---

# 106. OPENAPI AND SWAGGER DOCUMENTATION

Public API documentation is not an automatic vulnerability.

However, inspect:

- exposed admin endpoints
- embedded credentials or examples
- internal service hostnames

---

# 107. ACTUAL ROUTES ABSENT FROM DOCUMENTATION

Audit undocumented routes with heightened scrutiny.

---

# 108. DOCUMENTED ROUTES MISSING FROM CODE

Do not treat stale or removed API definitions as active attack surfaces.

---

# 109. ADMINISTRATIVE FUNCTIONS

Inventory:

- user creation
- account deletion
- MFA resets
- user impersonation
- role modifications
- billing changes
- feature flag toggles
- bulk data exports
- system resets

---

# 110. SUPPORT APIS

Support endpoints frequently carry sweeping operational privileges.

---

# 111. IMPERSONATION APIS

High-risk privilege surface.

---

# 112. INTERNAL MAINTENANCE ENDPOINTS

Endpoints for:

- reindexing
- database migrations
- transaction retries
- synchronization
- cache repair
- state resets

can be computationally destructive or resource-intensive.

---

# 113. SCRIPT EXECUTION ENDPOINTS

If an API can trigger local scripts or system commands:

critical attack surface.

---

# 114. DYNAMIC JOB RUNNERS

Endpoints like:

```text
POST /jobs/run/:name
```

must enforce strict method allowlists and authorization.

---

# 115. ARBITRARY FUNCTION NAMES

Never allow reflection or dynamic dispatch based on user-supplied method names.

---

# 116. JOB PARAMETERS

Privileged background jobs accepting attacker-controlled arguments can bypass standard application constraints.

---

# 117. DIRECT QUEUE ENQUEUE APIS

If clients can enqueue directly:

verify resource ownership and enforce an allowlist of job types.

---

# 118. SCHEDULER APIS

APIs managing recurring cron jobs represent high-value administrative surfaces.

---

# 119. DELAYED ACTIONS

Authorization checks may need re-evaluation at job execution time.

---

# 120. IDOR

For every endpoint accepting a resource reference, test horizontal access controls.

Detailed IDOR audits are covered in a dedicated prompt.

---

# 121. TENANT PARAMETERS

Attempt cross-tenant resource tampering.

---

# 122. ROLE PARAMETERS

Attempt vertical privilege escalation.

---

# 123. OWNER PARAMETERS

Attempt unauthorized ownership transfer.

---

# 124. PRICE AND BALANCE PARAMETERS

Client-supplied monetary values represent high-signal risks.

---

# 125. STATUS FIELDS

Callers must not skip approval or payment workflows by manipulating status properties.

---

# 126. BUSINESS ACTION ENDPOINTS

Endpoints like:

```text
/approve
/refund
/cancel
/activate
/verify
```

possess inherently security-sensitive semantics.

---

# 127. DUPLICATE BUSINESS ACTIONS

API attack surfaces include request replays and accidental double submissions.

---

# 128. IDEMPOTENCY

Critical financial mutations must implement duplicate request protection according to domain requirements.

---

# 129. RACE CONDITIONS

Concurrent requests can bypass:

- quotas
- one-time token uses
- inventory reservations
- discount coupons

---

# 130. RATE LIMITING

Public and sensitive endpoints must be evaluated against their abuse potential.

---

# 131. RATE LIMITING LAYERS

Determine enforcement across:

- edge proxies
- origin servers
- multi-instance distributed clusters

---

# 132. DIRECT ORIGIN RATE LIMIT BYPASS

Edge rate limiters provide no protection if the origin server is directly accessible.

---

# 133. API KEYS

If API key authentication exists:

inventory all accessible routes and granted scopes.

---

# 134. DIVERGING AUTHENTICATION METHODS

A single endpoint accepting:

- cookie sessions
- bearer JWTs
- API keys
- internal service tokens

The weakest authentication path dictates the true risk.

---

# 135. AUTHENTICATION METHOD CONFUSION

An API key intended for read-only integration must not be granted admin rights by a shared auth parser.

---

# 136. TOKEN TYPE CONFUSION

ID tokens, access tokens, and refresh tokens must never be accepted interchangeably.

---

# 137. COOKIE AND BEARER TOKEN COMBINATIONS

If both are presented simultaneously:

determine explicit precedence rules.

---

# 138. AMBIGUOUS PRINCIPALS

A request carrying conflicting credentials must never resolve to an unexpected privileged identity.

---

# 139. AUTHENTICATION PRECEDENCE

Example:

```text
cookie = normal user
header token = admin
```

Which credential wins?

The precedence must be intentional.

---

# 140. STALE CLAIMS

Role and tenant claims baked into tokens can become outdated before expiration.

---

# 141. REVOKED USERS

Test whether deactivated accounts can continue invoking endpoints with existing tokens.

---

# 142. API ERROR ATTACK SURFACES

Error responses can leak:

- stack traces
- database SQL queries
- entity existence confirmations
- third-party provider configurations

---

# 143. DIFFERENTIAL ERRORS

Can facilitate user and resource enumeration.

---

# 144. 404 VERSUS 403 STATUS CODES

May represent an intentional resource concealment strategy.

Do not report as a bug based solely on status codes.

---

# 145. VALIDATION ERRORS

Field validation error messages can disclose hidden entity properties.

Low priority unless facilitating a concrete exploit chain.

---

# 146. OVERLY VERBOSE SCHEMAS

GraphQL and OpenAPI schemas disclose model structures, but true security must rest on access controls, not obscurity.

---

# 147. RESPONSE DATA EXPOSURE

Locate excessive data exposure in API outputs.

---

# 148. SHARED SERIALIZERS

Administrative and consumer endpoints inadvertently sharing the same entity serializer.

---

# 149. INTERNAL FIELDS

Inspect serializers for:

- passwordHash
- secret
- internalNotes
- providerToken
- resetToken
- internalFlags

---

# 150. NESTED RELATIONSHIPS

`include=user` parameters returning sensitive attributes on related entities.

---

# 151. PAGINATION CONTROLS

Unbounded page sizes enable resource exhaustion.

---

# 152. `limit` PARAMETERS

Test:

```text
limit=1000000
limit=-1
```

against parser validation rules.

---

# 153. LARGE OFFSETS

Extreme pagination offsets can trigger costly database table scans.

---

# 154. DATE RANGE QUERIES

Unbounded historical queries exhausting database CPU.

---

# 155. COMPLEX QUERY FILTERS

Clients generating complex, unindexed database filter combinations.

---

# 156. REGEX INPUTS

If backends permit user-supplied regex filters:

ReDoS and database exhaustion risks.

---

# 157. ARRAYS OF SORT FIELDS

Specifying numerous sort fields can trigger expensive database execution plans.

---

# 158. AGGREGATION APIS

Analytics endpoints running heavy aggregation workloads across shared databases.

---

# 159. EXPORT PAYLOAD SIZES

A single request generating massive file exports.

---

# 160. RESPONSE AMPLIFICATION

Small incoming requests producing gigabytes of serialized JSON.

---

# 161. COMPRESSION OVERHEAD

Response compression adds CPU amplification risks under high load.

---

# 162. DECOMPRESSION BOMBS

Compressed request bodies can act as bombs if backends decompress automatically.

---

# 163. CONTENT ENCODING

Inspect handling of:

```text
gzip
br
deflate
```

on incoming request bodies.

---

# 164. DECOMPRESSION LIMITS

Limits must enforce maximum byte thresholds on expanded streams, not merely compressed lengths.

---

# 165. JSON NESTING DEPTH

Excessively nested JSON structures can induce recursion stack overflows.

---

# 166. ARRAY SIZE LIMITS

Gigantic JSON arrays overwhelming memory allocation.

---

# 167. STRING LENGTH LIMITS

Excessively long string attributes.

---

# 168. MULTIPART REQUESTS

Detailed upload audits cover file handling, but map general body parser limits here.

---

# 169. CONTENT-TYPE NEGOTIATION

An endpoint expecting JSON may behave differently when sent:

- form URL-encoded
- text/plain
- XML

---

# 170. CONTENT-TYPE CONFUSION

Parser discrepancies can bypass validation filters.

---

# 171. ACCEPT HEADERS

Format negotiation activating alternative serialization paths.

---

# 172. XML FALLBACKS

If endpoints support XML:

XXE and parser vulnerability attack surfaces.

---

# 173. CONTENT METHOD DISCREPANCIES

A POST JSON handler may validate inputs, while a POST form handler on the same route omits validation.

---

# 174. DUPLICATE JSON KEYS

Different parsers can resolve:

```json
{
  "role": "user",
  "role": "admin"
}
```

differently.

Relevant only where multiple layers parse the same payload inconsistently.

---

# 175. HTTP PARAMETER POLLUTION

Example:

```text
?role=user&role=admin
```

Proxies, frameworks, and database drivers may pick differing values.

---

# 176. ARRAYS VERSUS SCALARS

Parameters like:

```text
id=1
id[]=1
```

can bypass naive type validators in specific frameworks.

---

# 177. BOOLEAN PARSING

The string `"false"` resolves as truthy in loose casting operations.

---

# 178. NUMBER PARSING

Test:

- negative values
- extreme magnitudes
- floating-point numbers
- NaN
- Infinity

against parser semantics.

---

# 179. INTEGER OVERFLOW

Relevant for fixed-width languages and financial balance tracking.

---

# 180. NULL VALUES

Distinguish between omitted fields and explicit `null` assignments.

---

# 181. EMPTY STRINGS

Verify business logic divergence between empty strings and absent fields.

---

# 182. UNICODE NORMALIZATION

Normalization discrepancies can bypass identifier allowlists.

---

# 183. ENCODING ATTACKS

Malformed UTF-8 sequences and alternate character sets.

---

# 184. HEADER SIZES

Mismatch between proxy and backend header size limits.

---

# 185. COOKIE SIZES

Oversized cookies causing HTTP 431 errors and service degradation.

---

# 186. PATH LENGTHS

Excessively long URL paths and query strings.

---

# 187. SERVER CAPACITY LIMITS

Map:

- request payload limits
- header limits
- socket timeouts
- maximum concurrent connections

---

# 188. PROXY AND BACKEND MISMATCHES

Proxies permitting 10 MB while backends accept 1 MB, or vice-versa.

Focus on security and access control gaps.

---

# 189. HTTP REQUEST SMUGGLING

Do not report generically.

Applicable only with concrete proxy/backend HTTP parsing discrepancies.

---

# 190. HTTP/2 TO HTTP/1 CONVERSIONS

May alter parsing semantics, but requires infrastructure evidence.

---

# 191. INTERNAL API LISTENERS

Identify listeners bound to:

- alternative ports
- localhost interfaces
- management networks
- metrics servers

---

# 192. BIND ADDRESSES

Binding to `0.0.0.0` can expose internal management ports if network controls fail.

---

# 193. MANAGEMENT PORTS

Inspect:

- health checks
- metrics
- debug consoles
- administrative tools
- profiling listeners

---

# 194. RUNTIME PROFILERS

Live profilers can expose:

- process memory
- application source code
- thread stack traces
- environment variables

---

# 195. ACTUATOR ENDPOINTS

Spring Actuator and similar diagnostic endpoints.

Verify network exposure and authentication.

---

# 196. DEBUG TOOLBARS

Django, Flask, or Node.js development toolbars deployed in production.

---

# 197. RPC DEBUG PLAYGROUNDS

Exposed developer consoles.

---

# 198. GRAPHQL PLAYGROUND

Not a vulnerability in itself, but an undesirable production attack surface.

---

# 199. API EXPLORERS

Same applies to interactive API explorers.

---

# 200. TEST BACKDOORS

Search for:

```text
skipAuth
testUser
debugToken
masterKey
```

---

# 201. CONDITIONAL AUTHENTICATION BY ENVIRONMENT

Example:

```text
if NODE_ENV !== "production":
   skip auth
```

Verify actual runtime environment variable configuration.

---

# 202. MISNAMED ENVIRONMENT VARIABLES

Production containers running with `NODE_ENV=development` due to misconfiguration.

---

# 203. DEFAULT CONFIGURATIONS

Missing environment variables activating default authentication bypasses.

---

# 204. ERROR HANDLING FALLTHROUGH

Authentication middleware exceptions must never fail open:

```text
catch
↓
next()
```

---

# 205. POLICY SERVICE FAILURES

Timeouts in remote authorization services must never default to allow.

---

# 206. RATE LIMIT SERVICE FAILURES

Failing open may be acceptable for low-risk endpoints, but hazardous on expensive operations.

---

# 207. VALIDATION SERVICE FAILURES

Schema parsing exceptions must never divert execution to unvalidated fallback paths.

---

# 208. FEATURE FLAG OUTAGES

Privileged features must not enable by default if flag lookups fail, unless intentionally designed.

---

# 209. MULTI-TENANT HEADERS

If tenant identity originates from subdomains, headers, or URL paths:

verify consistency across all sources.

---

# 210. TENANT CONFUSION

Example:

```text
Host says tenant A
X-Tenant says tenant B
JWT says tenant C
```

Which authority wins?

---

# 211. CANONICAL TENANT AUTHORITY

The authoritative tenant source must be strictly and unambiguously defined.

---

# 212. RESOURCE IDENTIFIER FORMATS

Resource IDs from foreign tenants or environments must not be accepted merely because their format matches.

---

# 213. ENVIRONMENT IDENTIFIERS

Development resources must not be operable through production APIs if identifiers share formats.

---

# 214. API KEY ENVIRONMENTS

Distinguish strictly between test and production keys.

---

# 215. CROSS-ENVIRONMENT TRUST

Staging credentials must never authenticate against production systems without explicit authorization.

---

# 216. REGION PARAMETERS

If callers can select regions or database clusters:

verify authorization boundaries.

---

# 217. CALLBACK STATE VALIDATION

Payment and OAuth callbacks accepting attacker-supplied transaction IDs must strictly bind to original local transactions.

---

# 218. WEBHOOK TENANT MAPPING

Map external account and object IDs strictly to the correct local tenant.

---

# 219. REQUEST REPLAY PROTECTION

Endpoints using one-time tokens must enforce replay protection.

---

# 220. IDEMPOTENCY KEYS

If client-provided:

verify:

- user and tenant scoping
- payload fingerprint binding
- key expiration

---

# 221. CROSS-USER IDEMPOTENCY COLLISIONS

A shared idempotency key must not link operations across different users if storage is unscoped.

---

# 222. IDENTICAL KEY WITH ALTERED PAYLOADS

The API must enforce a defined rejection policy when payloads diverge under the same key.

---

# 223. API RESPONSE CACHING

API response caches can become cross-user data leakage surfaces.

---

# 224. CACHE KEYS

Inspect inclusion of:

- authenticated user identity
- tenant ID
- query parameters
- locale headers

where they influence response bodies.

---

# 225. CDN CACHING OF APIS

Personalized API responses must never be cached on shared public CDN nodes.

---

# 226. NEGATIVE CACHING

Caching 404 responses can hide newly created resources:

primarily a reliability concern, but relevant to state consistency.

---

# 227. VARY HEADERS

Ensure responses vary appropriately on headers influencing serialization.

---

# 228. CORS CONFIGURATIONS

Map all browser-accessible cross-origin surfaces.

---

# 229. CREDENTIALED CORS HEADERS

Broad origins combined with `Access-Control-Allow-Credentials: true` represent critical risks.

---

# 230. PUBLIC APIS

Permissive CORS can be entirely legitimate on public endpoints.

---

# 231. CSRF DEFENSES

Mandatory for state-mutating requests authenticated via cookies.

---

# 232. ORIGIN VERIFICATION

Inspect `Origin` header validation on state-changing requests using ambient credentials.

---

# 233. LOGIN CSRF

A dedicated vulnerability category.

---

# 234. ACCOUNT LINKING CSRF

High-risk attack surface on OAuth connecting routes.

---

# 235. API RESPONSE SECURITY HEADERS

While secondary for pure JSON APIs, proper caching and CORS headers are essential.

---

# 236. JSONP ENDPOINTS

Legacy APIs supporting JSONP callbacks can enable cross-origin data theft and XSS.

---

# 237. CALLBACK WRAPPERS

Report only where active JSONP functionality genuinely exists.

---

# 238. JSON HIJACKING

A legacy vulnerability class; do not report on modern APIs without specific exploitable browser semantics.

---

# 239. OFFICIAL API CLIENTS

If first-party client libraries exist:

audit how they interact with endpoints.

---

# 240. CLIENT-SIDE HIDDEN PARAMETERS

Frontend source code can expose undocumented:

- feature flags
- hidden parameters
- administrative actions

---

# 241. EMBEDDED ENDPOINTS IN MOBILE AND DESKTOP APPS

Client binaries may package references to legacy or internal endpoints.

---

# 242. CLIENTS DO NOT DEFINE SERVER BOUNDARIES

Just because an official client omits an endpoint does not prevent an attacker from calling it.

---

# 243. GENERATED SDKS

Generated SDK code can reveal the complete supported backend attack surface.

---

# 244. API DEPRECATION

Deprecated endpoints must possess:

- designated owners
- definitive retirement schedules

P4/P2 depending on real security gaps.

---

# 245. ORPHANED ROUTES

Routes with no active clients that continue modifying backend state:

attack surfaces offering zero business value.

---

# 246. UNUSED PRIVILEGED ROUTES

High-value candidates for immediate decommissioning.

---

# 247. MONITORING AND TELEMETRY

Monitor where applicable:

- route invocation metrics
- 401 and 403 authorization failures
- 404 scanning patterns
- validation failure spikes
- rate limit rejections
- administrative operations

---

# 248. SCANNING DETECTION

High volumes of 404 responses indicate automated reconnaissance, but do not constitute a vulnerability.

---

# 249. RARE ADMINISTRATIVE ROUTE INVOCATIONS

Any usage of rare admin endpoints warrants heightened security scrutiny.

---

# 250. DEPRECATED ROUTE TRAFFIC

Verify via telemetry whether deprecated routes receive legitimate traffic.

---

# 251. AUDIT LOGGING

Privileged actions must record actor identity, tenant context, and target resources.

---

# 252. LOGGING SENSITIVE INPUTS

Request logging must never capture:

- passwords
- API keys
- session tokens

---

# 253. LOGGING SENSITIVE RESPONSES

Same redaction rules apply to private response payloads.

---

# 254. FINDING FORMAT

Every substantive finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:
Evidence tier:

Entry point:
Protocol:
Method:
Path/Operation:
Environment:

Attacker:
Authentication required:
Privileges required:

Route registration:
Middleware chain:
Authorization:
Rate limit:

Input source:
Dangerous parameter:
Side effect:

Problem:

Evidence:

Attack Path:

T0:
T1:
T2:
T3:

Expected exposure:

Actual exposure:

Alternative path:
YES / NO

Auth bypass:
YES / NO

Authorization bypass:
YES / NO

Cross-tenant:
YES / NO

Data exposure:
YES / NO

Privilege impact:
YES / NO

Resource amplification:
YES / NO

Blast radius:

Root cause:

Recommended remediation:

Regression/security test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 255. SEVERITY

Use:

## P0 - CRITICAL

- unintended public or internal API grants unauthenticated remote administrative control
- unauthenticated critical destructive action
- direct-origin access completely strips edge authentication controls
- hidden API allows catastrophic cross-tenant or system-wide compromise

## P1 - HIGH

- legacy or alternative endpoint bypasses authentication or authorization
- exposed internal or admin endpoint grants substantial privilege escalation
- bulk or export endpoint enables large-scale sensitive data exfiltration
- trusted header spoofing allows identity or role spoofing
- critical debug endpoint accessible in production

## P2 - MEDIUM

- significant inconsistency across API attack surfaces
- constrained hidden endpoint
- resource amplification inducing realistic availability or financial impact
- limited enumeration or private data disclosure
- weaker legacy route requiring specific preconditions

## P3 - LOW

- minor unnecessary endpoint exposure
- limited metadata disclosure
- low-impact deprecated endpoint

## P4 - HARDENING

- route pruning
- documentation synchronization
- centralized policy improvements without confirmed bypasses

---

# 256. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

---

# 257. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 258. EVIDENCE TIER

Use:

```text
A - safely reproduced
B - complete route/middleware/execution path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 259. CATEGORY

Use:

```text
UNINTENDED EXPOSURE
LEGACY API
ADMIN API
INTERNAL API
DEBUG API
AUTH BYPASS
AUTHZ BYPASS
TRUSTED HEADER
TENANT CONFUSION
BULK/BATCH
GRAPHQL
WEBSOCKET
WEBHOOK
FILE
ENUMERATION
RESOURCE AMPLIFICATION
CACHE/CORS
CONFIGURATION
```

---

# 260. FALSE-POSITIVE PREVENTION

Before filing P0/P1/P2 findings, verify:

1. route is genuinely registered
2. deployment target environment
3. network reachability
4. reverse proxy and gateway rules
5. middleware pipeline ordering
6. authentication requirements
7. authorization checks
8. rate limiting enforcement
9. service-layer access checks
10. actual state side effects

Do not report dead or unreachable code as public vulnerabilities.

---

# 261. UNDOCUMENTED IS NOT AUTOMATICALLY VULNERABLE

Documentation is not an access control.

---

# 262. "INTERNAL" IN PATH IS NOT A SECURITY CONTROL

An `/internal` prefix provides no protection.

---

# 263. "ADMIN" IN PATH IS NOT A SECURITY CONTROL

An `/admin` prefix provides no protection.

---

# 264. HIDDEN UI IS NOT A SECURITY CONTROL

Attackers invoke APIs directly without browser interfaces.

---

# 265. API GATEWAYS ARE INSUFFICIENT IF ORIGIN IS DIRECTLY REACHABLE

The complete network trust chain must be validated.

---

# 266. DO NOT REPORT SWAGGER AS A VULNERABILITY IN ITSELF

Public documentation may be an intentional product choice.

---

# 267. DO NOT REPORT GRAPHQL INTROSPECTION AS HIGH RISK IN ISOLATION

Authorization must serve as the true security control.

---

# 268. DO NOT REPORT 404 SCANNING AS A VULNERABILITY

It reflects background reconnaissance telemetry, not an application defect.

---

# 269. DO NOT MODIFY CODE

During the audit:

- do not delete legacy routes
- do not block endpoints
- do not reconfigure gateways
- do not alter CORS rules
- do not modify authentication middleware
- do not execute destructive calls

Use safe negative tests.

---

# 270. OUTPUT - API_ATTACK_SURFACE_AUDIT.md

Structure the final report as follows:

## 1. Executive Summary

- protocols
- exposed entry points
- network topology
- top alternative-path risks
- undocumented and deprecated surfaces

## 2. API Architecture Map

## 3. Network Exposure Map

## 4. Route Inventory

## 5. Documented vs Actual API

## 6. Public Endpoint Audit

## 7. Legacy / Deprecated Endpoint Audit

## 8. Admin API Audit

## 9. Internal / Management API Audit

## 10. Debug / Test Endpoint Audit

## 11. Middleware Coverage Audit

## 12. Direct-Origin / Gateway Bypass Audit

## 13. Trusted Header Audit

## 14. Input Surface Audit

## 15. Query / Filter / Expand Audit

## 16. Bulk / Batch API Audit

## 17. GraphQL Attack Surface

If relevant.

## 18. WebSocket / SSE Attack Surface

If relevant.

## 19. Webhook / Callback Surface

## 20. File / Import / Export Surface

## 21. Resource Amplification Audit

## 22. Tenant / Environment Confusion Audit

## 23. Auth Method / Credential Confusion Audit

## 24. Cache / CORS / Browser Exposure Audit

## 25. Hidden Side-Effect Audit

## 26. Monitoring / Deprecated Route Usage

## 27. Security Test Coverage

## 28. Findings Summary

| ID | Severity | Surface | Endpoint | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 29. P0 Findings

## 30. P1 Findings

## 31. P2 Findings

## 32. P3 Findings

## 33. P4 Hardening

## 34. Things Done Well

## 35. Not Applicable

## 36. Not Verified

## 37. Attack Surface Reduction Roadmap

---

# 271. ROUTE MATRIX

| Method | Path | Public | Auth | Authz | Side effect | Environment |
|---|---|---|---|---|---|---|

---

# 272. VERSION MATRIX

| Business action | V1 | V2 | Mobile | GraphQL | Admin |
|---|---|---|---|---|---|

Compare security controls across implementations.

---

# 273. INTERNAL SURFACE MATRIX

| Endpoint | Intended caller | Network protection | App auth | Direct internet reachable |
|---|---|---|---|---|

---

# 274. INPUT MATRIX

| Endpoint | Parameter | Source | Validation | Sink/action | Risk |
|---|---|---|---|---|---|

---

# 275. BULK AMPLIFICATION MATRIX

| Endpoint | Max items | DB ops/item | External calls/item | Jobs/item | Risk |
|---|---:|---:|---:|---:|---|

---

# 276. SECOND PASS - ROUTE DIFF

Programmatically compare:

```text
actual framework routes
vs
OpenAPI/docs
```

Identify:

- undocumented
- deprecated
- hidden
- test
- admin

---

# 277. SECOND PASS - VERSION BYPASSES

For every privileged business action, inspect all API versions and compare:

- authentication
- authorization
- validation
- rate limits

---

# 278. SECOND PASS - DIRECT ORIGIN ACCESS

Where edge WAF protections exist:

verify whether the origin server can be invoked directly in authorized test environments or through config proof.

---

# 279. SECOND PASS - TRUSTED HEADERS

Attempt sending gateway identity headers directly from standard client connections.

---

# 280. SECOND PASS - PUBLIC WRITES

For every unauthenticated write endpoint, ask:

> What is the most expensive or privileged side effect it can trigger?

---

# 281. SECOND PASS - HIDDEN BODY FIELDS

On create and update endpoints, inject undocumented fields found in data models.

---

# 282. SECOND PASS - QUERY OVERRIDES

Probe with:

- tenant
- owner
- role
- include
- expand
- fields
- limit
- sort

parameters.

---

# 283. SECOND PASS - BULK OPERATIONS

Submit payloads containing:

```text
1 item
10
100
max
over max
```

and inspect authorization and amplification behaviors.

---

# 284. SECOND PASS - GRAPHQL

If implemented:

test:

- deep nesting
- aliases
- batching
- unauthorized global IDs
- privileged mutations

---

# 285. SECOND PASS - WEBSOCKET CHANNELS

Verify:

- handshake authentication
- message-level authorization
- topic subscription isolation
- message size and frequency limits

---

# 286. SECOND PASS - CALLBACK HANDLERS

On OAuth and payment callbacks, test:

- invalid state tokens
- foreign transaction IDs
- replay attempts
- mismatched tenant contexts

in safe test environments.

---

# 287. SECOND PASS - CONTENT-TYPE VARIANTS

Submit the same logical request formatted as:

```text
application/json
form-urlencoded
multipart
text/plain
```

where multiple body parsers are enabled.

Verify consistent validation and authorization logic.

---

# 288. SECOND PASS - PARAMETER POLLUTION

Submit duplicate parameters:

```text
?id=A&id=B
```

where proxy and framework parsing discrepancies are relevant.

---

# 289. SECOND PASS - AUTHENTICATION METHOD CONFUSION

For endpoints accepting multiple credential types:

test precedence rules and granted scopes.

---

# 290. SECOND PASS - TENANT CONFUSION

If tenant identity originates from multiple vectors:

```text
JWT = A
Host = B
Header = C
Body = D
```

determine the authoritative source.

---

# 291. SECOND PASS - ERROR ATTACK SURFACES

Trigger:

- unauthenticated requests
- unauthorized requests
- invalid resource IDs
- valid foreign resource IDs
- malformed payloads
- internal server errors

and compare disclosures.

---

# 292. SECOND PASS - DEPRECATED ROUTES

For every deprecated route, ask:

> Does it still receive legitimate business traffic?

If not, and it carries elevated privileges:

decommission to eliminate attack surface.

---

# 293. SECOND PASS - MANAGEMENT PORTS

Audit all auxiliary network listeners from configuration files.

---

# 294. SECOND PASS - DEBUG FEATURES

Search for:

```text
debug
test
internal
dev
skipAuth
bypass
impersonate
```

---

# 295. SECOND PASS - SINGLE-REQUEST AMPLIFICATION

For expensive endpoints, calculate:

```text
1 HTTP request
→ N DB ops
→ N external calls
→ N jobs
→ N bytes
```

---

# 296. SECOND PASS - CACHE USER SWITCHING

Prime a personalized response cache as User A, then request as User B.

---

# 297. SECOND PASS - ENVIRONMENT CROSSING

Submit identifiers and credentials across:

```text
dev
staging
production
```

according to the platform trust model.

---

# 298. FINAL QUALITY GATE

Before issuing the final report, verify:

- route inventory reflects actual registered routes, not merely documentation
- reachability is verified or explicitly marked NOT VERIFIED
- undocumented routes are not assumed to be vulnerabilities
- dead code is not presented as active production attack surface
- public write endpoints feature side-effect impact analyses
- legacy, v1, and mobile routes are compared against contemporary security controls
- admin, internal, and debug path names are not treated as access controls
- direct-origin gateway bypass risks have been evaluated
- trusted headers have been inspected for spoofing risks
- method-specific middleware drift has been audited
- query, body, header, cookie, and path inputs are cataloged
- hidden fields and filter override paths have been probed
- bulk endpoints undergo amplification and per-item authorization audits
- GraphQL is evaluated at operation and field levels, not merely the `/graphql` URL
- WebSocket security audits cover message-level actions beyond initial handshakes
- webhook and callback endpoints enforce appropriate authenticity models
- import, export, and search features include data exfiltration analyses
- request count limiters are not assumed to prevent bulk amplification abuse
- content-type and parser variants are investigated where supported
- tenant authority is unambiguously defined across conflicting identity signals
- multiple authentication methods do not cause identity or scope confusion
- deprecated and unused privileged routes are identified for removal
- debug and management listeners have been audited
- every P0/P1 finding features a complete entry-point-to-impact path
- P4 attack-surface reduction recommendations are isolated from confirmed bypasses

---

# FINAL RULE

Do not generate reports like:

> Protect APIs with authentication, use rate limiting, and hide Swagger.

That is not an API Attack Surface Audit.

I am looking for concrete defects such as:

```text
v2:
POST /api/v2/users/:id/promote
↓
admin middleware
↓
safe

legacy:
POST /api/v1/users/:id/promote
↓
only requires authenticated user
↓
same promotion service
↓
ordinary user uses legacy route
↓
vertical privilege escalation
```

or:

```text
public domain
↓
Cloudflare/WAF checks X-Internal header
↓
backend origin IP also public
↓
backend trusts X-Internal-User header
↓
attacker calls origin directly
↓
spoofs header
↓
identity bypass
```

or:

```text
POST /exports

body:
{
  "tenantId": "victim"
}

↓
route only checks authentication
↓
worker runs with system privileges
↓
arbitrary tenant export generated
↓
cross-tenant data exfiltration
```

or:

```text
POST /bulk/send-email

↓
request limiter:
20 requests/min

↓
payload allows:
10,000 recipients

↓
one request creates 10,000 external sends
↓
request-count limiter does not protect actual cost surface
```

or:

```text
REST update route:
strict DTO whitelist

GraphQL mutation:
accepts arbitrary JSON scalar
↓
object passed directly to update service
↓
hidden privileged fields can be modified
```

or:

```text
GET /internal/reindex

↓
intended only for internal operations
↓
route deployed on same public server
↓
no auth
↓
one request triggers full database reindex
↓
public resource-amplification surface
```

or:

```text
JWT says tenant A
↓
X-Tenant header says tenant B
↓
authorization middleware checks JWT tenant A
↓
repository query uses header tenant B
↓
attacker crosses tenant boundary through identity-source mismatch
```

or:

```text
mobile legacy API accepts API key
↓
web API requires scoped access token
↓
same business service
↓
legacy key has no scope enforcement
↓
read-only integration performs write through mobile endpoint
```

These are the API attack surface vulnerabilities you must uncover.

Reason through:

- route
- protocol
- network exposure
- middleware
- auth method
- input
- tenant
- side effect
- alternative path
- amplification
- environment
- legacy functionality

For every serious finding, you must be able to answer:

> Which exact entry point does the attacker use?

> Is it genuinely deployed and reachable?

> Which middleware chain does it traverse?

> What credential or privilege is required?

> Does a safer alternative route exist for the same business action?

> Which alternative path carries weaker protection?

> Which attacker-controlled parameter alters the security outcome?

> What exact side effect or data does the attacker obtain?

If reachability cannot be confirmed:

**API EXPOSURE NOT VERIFIED.**

If network topology is unavailable:

**NETWORK EXPOSURE NOT VERIFIED.**

If merely a redundant or deprecated surface without a confirmed security defect:

**P4 - HARDENING.**

It is far better to find 5 real alternative or unexpected API attack paths than to generate a massive endpoint table lacking security conclusions.

The objective is to produce a forensically precise API Attack Surface Audit that translates directly into:

- route removal
- middleware correction
- legacy API closure
- gateway/origin hardening
- trusted-header protection
- bulk abuse guard
- parser/validation unification
- production attack-surface reduction
