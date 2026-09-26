---
id: UPL-IT-023
number: 23
slug: api-contract-consistency-audit
title: API Contract Consistency Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Backend & API
subcategory_id: backend-api
language: en
version: 1.0.0
status: stable
---

# API CONTRACT CONSISTENCY AUDIT

I want you to perform an ultra-deep, systematic, evidence-first, and client-oriented analysis of the complete API contract consistency across all endpoints, versions, clients, and runtime scenarios.

Main goal:

> Determine whether the API has a stable, predictable, and mutually consistent contract so that diverse clients can safely dispatch requests, parse responses, handle errors, and survive API evolution without hidden breaking changes.

This is not:

- a routine REST style audit
- just OpenAPI validation
- just a schema review
- advice that all responses must have the same envelope
- a demand that every endpoint looks identical
- automatic versioning introduction
- insistence on a single naming style without real client impact
- rewriting an API purely for aesthetics

Focus is on the actual contract that clients consume.

Priority:

**client correctness > backward compatibility > schema stability > error predictability > semantic consistency > documentation consistency > stylistic uniformity**

It is better to find 7 real contract mismatches than to write 100 stylistic recommendations.

---

# 1. IDENTIFY ALL CONTRACT SOURCES

Before findings, map out where the API contract is defined.

Possible sources:

- route/controller code
- request DTO
- response DTO
- validation schemas
- OpenAPI/Swagger
- generated types
- GraphQL schemas if present concurrently
- client SDK
- frontend/mobile types
- integration tests
- documentation
- API examples
- Postman collections

Do not assume documentation is the source of truth.

---

# 2. DETERMINE THE ACTUAL SOURCE OF TRUTH

For each contract component ask:

> What does runtime actually accept and return?

If they diverge:

```text
OpenAPI
vs
runtime validator
vs
actual serializer
```

document the drift.

---

# 3. CREATE CONTRACT INVENTORY

For each endpoint record:

```text
Method:
Path:
Request params:
Query:
Headers:
Body:
Success response:
Error responses:
Nullability:
Pagination:
Version:
Authentication:
```

---

# 4. CONTRACT MATRIX

Construct:

| Endpoint | Request schema | Response schema | Error schema | Versioned | Documented |
|---|---|---|---|---|---|

---

# 5. REQUEST NAMING

Compare field naming across the API.

Examples:

```text
userId
user_id
userid
userID
```

Do not report merely as styling.

Demonstrate real problems:

- client mapping
- generated SDK drift
- duplicated models
- user confusion

---

# 6. RESPONSE NAMING

Same for responses.

---

# 7. SAME CONCEPT, DIFFERENT NAME

Specifically look for the exact same domain concept under multiple names:

```text
createdAt
created
creationDate
dateCreated
```

---

# 8. SEMANTIC CONSISTENCY

The same name must convey the same meaning.

Example:

```text
status
```

in one endpoint means:

```text
HTTP-like lifecycle
```

and in another:

```text
payment status
```

This may be legitimate across different resources.

A finding requires actual ambiguity for the client model.

---

# 9. ID TYPES

Compare ID types:

```text
"id": 123
```

vs:

```text
"id": "123"
```

for the same resource.

---

# 10. UUID CONSISTENCY

If one endpoint returns a UUID string and another returns a numerical internal ID for the same entity:

check whether this is intentional.

---

# 11. PUBLIC VS INTERNAL ID

If the API uses:

- publicId
- internal DB ID

their boundary must remain distinct and well-defined.

---

# 12. DATE/TIME FORMAT

Map all temporal fields.

Search for:

```text
ISO 8601 string
epoch seconds
epoch millis
localized string
```

representing the same semantic type.

---

# 13. TIMEZONE

Timestamps must explicitly convey or imply timezone context.

Example:

```text
2026-09-25T20:00:00Z
```

is a completely different contract from:

```text
2026-09-25 20:00:00
```

without timezone context.

---

# 14. DATE-ONLY

Do not convert:

```text
birthday
```

into an instant if the domain represents strictly a calendar date.

---

# 15. EPOCH UNIT

If numeric timestamps are utilized:

verify that clients can unambiguously differentiate seconds and milliseconds.

---

# 16. MONEY FORMAT

Map:

```text
amount
currency
```

Verify:

- integer minor units
- decimal string
- float

for the same contract.

---

# 17. MONEY WITHOUT CURRENCY

If amount can represent multiple currencies, a value lacking currency context represents an incomplete contract.

---

# 18. BOOLEAN CONSISTENCY

Look for:

```text
true
false
```

vs:

```text
0
1
```

vs:

```text
"true"
"false"
```

for the exact same concept.

---

# 19. ENUM CONTRACT

Inventory enum values.

Example:

```text
PENDING
ACTIVE
FAILED
```

---

# 20. ENUM CASE

If the same enum concept employs:

```text
pending
PENDING
Pending
```

across different endpoints:

client complexity escalates.

---

# 21. UNKNOWN ENUM VALUE

Ask:

> What happens when backend adds a new value tomorrow?

Especially for mobile clients that may remain outdated for months.

---

# 22. OPEN ENUM VS CLOSED ENUM

Document whether the client should:

- reject unknown values
- present a fallback
- preserve the raw value

in accordance with the domain.

---

# 23. NULLABILITY

For each field distinguish:

```text
required non-null
required nullable
optional non-null
optional nullable
```

Do not treat these as equivalent states.

---

# 24. ABSENT VS NULL

Critical distinction:

```json
{}
```

is not necessarily identical to:

```json
{"name": null}
```

Especially in PATCH contracts.

---

# 25. EMPTY STRING VS NULL

If backend intermittently returns:

```text
""
```

and elsewhere:

```text
null
```

for "no value", examine client behavior.

---

# 26. EMPTY ARRAY VS NULL

Collection contract must be unambiguous.

Example:

```text
[]
```

is typically a different semantic signal than:

```text
null
```

---

# 27. MISSING COLLECTION

A third possible state:

field omitted entirely.

Verify whether clients expect this.

---

# 28. RESPONSE ENVELOPE

Inventory response structures.

Example:

```json
{"data": {...}}
```

vs:

```json
{"result": {...}}
```

vs direct object.

---

# 29. ENVELOPE IS NOT MANDATORY

Do not demand a uniform envelope purely for aesthetics.

A finding exists when inconsistency causes:

- generic client parsing issues
- SDK duplication
- error handling failures

---

# 30. LIST RESPONSE

Compare:

```json
[...]
```

with:

```json
{
  "items": [...],
  "total": 100
}
```

The divergence can be legitimate if one endpoint provides pagination.

---

# 31. PAGINATION CONTRACT

Map:

- page
- pageSize
- total
- nextCursor
- hasMore
- next

---

# 32. DIFFERENT PAGINATION MODELS

If one API uses:

```text
page/limit
```

another:

```text
offset/limit
```

and a third:

```text
cursor
```

this is not automatically a bug.

Ask whether the same resource family unnecessarily mixes multiple models.

---

# 33. PAGE NUMBER BASE

Verify:

```text
page starts at 0
```

vs:

```text
page starts at 1
```

---

# 34. LIMIT DEFAULT

Documentation and runtime must align.

---

# 35. MAX LIMIT

If docs declare 100, while runtime allows 1000 or vice versa:

contract drift.

---

# 36. TOTAL SEMANTICS

`total` can indicate:

- total items overall
- total returned
- filtered total

Must be unambiguous.

---

# 37. HASMORE

If computed inconsistently with nextCursor:

client pagination can stall or loop.

---

# 38. SORT CONTRACT

Map:

```text
sort
order
sortBy
sortDirection
```

---

# 39. SAME FILTER DIFFERENT PARAM

If the same endpoint family uses:

```text
status
filterStatus
state
```

for the same concept, examine the necessity.

---

# 40. CASE SENSITIVITY

Search/filter enum queries can be case-sensitive or insensitive.

Document actual behavior.

---

# 41. ARRAY QUERY PARAMS

Verify format:

```text
?status=a&status=b
```

vs:

```text
?status=a,b
```

vs JSON-like encoding.

---

# 42. BOOLEAN QUERY

Does the API accept:

```text
true
false
1
0
```

and what is documented?

---

# 43. DEFAULT FILTER

If omitted filter assumes different semantics across versions:

breaking semantic change.

---

# 44. REQUEST DTO

Compare create and update DTOs.

---

# 45. CREATE VS UPDATE

A field required upon creation may need to be optional during PATCH.

Do not reuse identical schema models blindly if semantics diverge.

---

# 46. IMMUTABLE FIELD

A field settable only upon creation:

```text
ownerId
type
```

must not accidentally be updateable.

---

# 47. SERVER-GENERATED FIELD

Clients must not be forced to provide:

- createdAt
- internal ID
- computed status

if the server generates them.

---

# 48. READ-ONLY FIELD IN REQUEST

If schema accepts yet silently ignores it:

client may falsely believe it modified the attribute.

It is better to explicitly reject or clearly document, according to contract rules.

---

# 49. WRITE-ONLY FIELD

Passwords must remain request-only and never appear as response fields.

Verify schema and documentation.

---

# 50. SENSITIVE RESPONSE FIELD

DTO reuse can accidentally expose:

- password hashes
- reset tokens
- secrets
- internal notes

---

# 51. ERROR SHAPE

Inventory all error shapes.

Example:

```json
{"error":"Not found"}
```

vs:

```json
{"message":"Not found"}
```

vs:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "..."
  }
}
```

---

# 52. SAME ERROR, DIFFERENT SHAPE

If a client must maintain multiple parsers for the same backend:

contract consistency problem.

---

# 53. ERROR CODE TYPE

Look for:

```text
"NOT_FOUND"
```

vs:

```text
40401
```

for the same error namespace.

---

# 54. ERROR CODE STABILITY

Human messages must not serve as machine identifiers.

---

# 55. FIELD VALIDATION ERRORS

Verify format.

Example:

```json
{
  "fields": {
    "email": ["invalid"]
  }
}
```

or:

```json
{
  "errors": [
    {"field":"email","code":"INVALID"}
  ]
}
```

Stability is what matters.

---

# 56. FIELD PATH

Nested validation must provide a sufficiently precise path.

---

# 57. ARRAY VALIDATION

Example:

```text
items[3].price
```

must be unambiguously identifiable.

---

# 58. GLOBAL ERROR

Not every validation error belongs to a single field.

The API must be capable of expressing cross-field errors.

---

# 59. CORRELATION ID

If error responses include a request or correlation ID:

verify consistency.

---

# 60. HTTP STATUS + ERROR CODE

The same logical error should pair consistently wherever possible.

---

# 61. AUTH ERRORS

Compare:

- missing token
- expired token
- invalid token
- revoked token
- insufficient role

---

# 62. LOGIN ERRORS

Security intentionally homogenizes:

```text
wrong password
unknown email
```

to avoid exposing account existence.

Do not "fix" this into granular error messages without considering the threat model.

---

# 63. NOT FOUND

Private resources may intentionally return 404 instead of 403.

Consistency is evaluated within the specific security model, not by academic rules.

---

# 64. CONFLICT ERRORS

For duplicate creation or resource state conflicts, verify stable error codes.

---

# 65. RATE LIMIT ERRORS

If 429 exists:

verify:

- body
- retry hint
- headers

---

# 66. UPSTREAM ERROR

Do not forward raw provider error formats directly to clients if the rest of the API maintains a stable internal contract.

---

# 67. EXTERNAL PROVIDER LEAK

If Stripe, AWS, or other third-party provider payloads leak directly through an endpoint:

clients become tightly coupled to the upstream provider contract.

---

# 68. CONTRACT BOUNDARY

The backend must deliberately determine which external provider details are exposed.

---

# 69. SUCCESS STATUS SHAPE

Some endpoints return:

```json
{"success": true}
```

while others return a resource.

Ask whether clients truly require uniformity here.

---

# 70. COMMAND RESPONSE

Business commands like cancel may legitimately return:

```text
updated resource
```

or:

```text
204
```

What matters is that the contract is stable.

---

# 71. CREATE RESPONSE

Verify that create responses do not return a different object shape than subsequent GET requests for the same resource without reason.

---

# 72. CREATE/GET MODEL DRIFT

Example:

```text
POST /users -> {userId,name}
GET /users/:id -> {id,fullName}
```

For the same resource, this is high-signal inconsistency.

---

# 73. UPDATE RESPONSE

If PATCH returns only mutated fields while clients expect a complete resource representation:

document the contract clearly.

---

# 74. DELETE RESPONSE

Consistency within the resource family.

---

# 75. NESTED RESOURCE SHAPE

A user embedded inside an Order response may provide a smaller projection than the standalone User endpoint.

This is completely legitimate.

Do not demand full DTO representations everywhere.

---

# 76. PROJECTION TYPES

If there exist:

- UserSummary
- UserDetails
- UserAdminView

make the contract distinctions explicit.

---

# 77. SAME NAME, DIFFERENT SHAPE

The most dangerous scenario is when both responses claim to be:

```text
User
```

yet possess fundamentally divergent required fields.

---

# 78. GRAPH NORMALIZATION

If clients use normalized caches, stable IDs and typename/resource identity become essential.

Tie findings directly to the active client stack.

---

# 79. BOOLEAN FLAGS

Look for logical contradictions:

```json
{
  "isActive": true,
  "status": "DISABLED"
}
```

If both express the same concept, the contract allows impossible states.

---

# 80. REDUNDANT FIELDS

Duplicate representations can drift over time.

Example:

```text
fullName
firstName
lastName
```

is not automatically an issue, but identify which field acts as the source of truth.

---

# 81. COMPUTED FIELD

If server returns computed values, clients should not necessarily be forced to reconstruct them independently.

---

# 82. STALE COMPUTED FIELD

If computed fields and source fields derive from divergent snapshots:

inconsistency.

---

# 83. DEFAULT VALUES

Determine where defaults are applied:

- validator
- controller
- DB
- serializer

---

# 84. MULTIPLE DEFAULTS

If an omitted request field receives:

```text
false
```

in the validator, but the DB default is:

```text
true
```

different write paths can produce divergent results.

---

# 85. VERSIONING

Map all API versions.

---

# 86. SAME RESOURCE ACROSS VERSIONS

For:

```text
/v1/users
/v2/users
```

compare:

- field names
- type
- nullability
- semantics
- errors

---

# 87. BREAKING CHANGES

Classify:

```text
FIELD REMOVAL
FIELD RENAME
TYPE CHANGE
NULLABILITY CHANGE
SEMANTIC CHANGE
ENUM CHANGE
STATUS CHANGE
ERROR CHANGE
```

---

# 88. NULLABILITY BREAK

Field:

```text
string
```

becoming:

```text
string | null
```

can break strict typed clients.

---

# 89. OPTIONAL -> REQUIRED

Breaking request change.

---

# 90. REQUIRED -> OPTIONAL

Usually more compatible, but client semantics may alter.

---

# 91. NUMBER -> STRING

Frequent breaking change for IDs and monetary amounts.

---

# 92. ARRAY -> OBJECT

Clear breaking change.

---

# 93. OBJECT -> NULLABLE OBJECT

Potentially breaking.

---

# 94. ENUM ADDITION

Can break clients utilizing exhaustive enum parsers.

---

# 95. ENUM REMOVAL

Clear breaking semantic change for clients submitting the retired value.

---

# 96. FIELD SEMANTICS CHANGE

Most dangerous silent break.

Example:

```text
price
```

was in:

```text
dollars
```

and changes to:

```text
cents
```

without altering the data type.

---

# 97. UNIT CONTRACT

Map units:

- bytes
- KB
- MB
- seconds
- milliseconds
- meters
- kilometers
- percentages

---

# 98. PERCENT

Does:

```text
0.25
```

mean 25% or:

```text
25
```

?

---

# 99. FILE SIZE

Consistent unit representation.

---

# 100. DURATION

Do not mix:

```text
durationMs
```

with generic:

```text
duration
```

unless clearly specified.

---

# 101. COORDINATES

Latitude and longitude type and range consistency.

---

# 102. COUNTRY / LOCALE

Map:

- ISO code
- display name
- locale tag

Do not mix without an explicit contract.

---

# 103. LANGUAGE

Example:

```text
en
en-US
English
```

can represent three completely distinct contracts.

---

# 104. PHONE NUMBERS

If backend receives or returns phone numbers:

verify canonical vs display format.

---

# 105. EMAIL

Case normalization and canonicalization must not mutate contracts implicitly without understanding identity semantics.

---

# 106. URLS

Does the backend return:

- relative path
- absolute URL
- signed URL

for the same field across different endpoints?

---

# 107. SIGNED URL

Expiry semantics must be clear.

Clients must never assume signed URLs are permanent.

---

# 108. FILE OBJECT

If one endpoint returns:

```text
fileUrl
```

and another returns:

```json
{
  "file": {
    "url": "...",
    "size": ...
  }
}
```

verify whether these truly represent projections of the same resource.

---

# 109. MAP / DICTIONARY

Dynamic object keys can complicate typed clients.

Use only when the domain truly represents a map.

---

# 110. TUPLE-LIKE ARRAYS

Responses like:

```json
["123","John",true]
```

are fragile when positional indexes imply schema semantics.

High-signal finding for public APIs.

---

# 111. POLYMORPHISM

If a response can assume multiple types:

a discriminator or other reliable parsing mechanism must exist.

---

# 112. DISCRIMINATOR

Example:

```json
{"type":"image", ...}
```

Verify that each variant exhibits a stable contract.

---

# 113. UNKNOWN VARIANT

Older clients must have defined fallback behavior.

---

# 114. PAGINATION + POLYMORPHISM

If a paginated list contains diverse item kinds, typed clients need to know.

---

# 115. GENERIC `any`

If OpenAPI or TypeScript definitions specify `any` for critical responses:

the contract is insufficiently specified.

Severity (P4 vs P2) depends on client failure modes.

---

# 116. RAW JSON

`Map<String,Any>` or raw JSON can be legitimate for metadata extension fields.

Do not force rigid schemas everywhere.

---

# 117. EXTENSIBILITY

If API permits arbitrary metadata:

clearly segregate core stable fields from extension areas.

---

# 118. HEADER CONTRACT

Map custom headers:

- request ID
- idempotency key
- version
- tenant
- locale

---

# 119. HEADER CASING

HTTP header names are case-insensitive.

Do not build custom parsers that rely on casing.

---

# 120. REQUIRED HEADER

If an endpoint mandates a custom header:

it must be documented and validated.

---

# 121. TENANT HEADER

If tenant is supplied via a header:

authorization must bind it securely to the principal.

Contract consistency is not a replacement for security.

---

# 122. CONTENT TYPE

Map:

```text
application/json
multipart/form-data
application/octet-stream
```

---

# 123. ACCEPT HEADER

If the API supports multiple representations or versioning via media types:

verify consistency.

---

# 124. CHARACTER ENCODING

JSON must reliably support Unicode.

Search for manual encoding flaws.

---

# 125. EMPTY RESPONSE

Distinguish:

- 204
- 200 {}
- 200 null

within the contract.

---

# 126. OPTIONAL RESPONSE

An endpoint that legitimately can find nothing must have a documented model.

---

# 127. SEARCH SINGLE RESULT

Never return an object sometimes and an array other times for the exact same endpoint.

---

# 128. ONE-OR-MANY

Contracts like:

```text
object | array
```

lacking a clear discriminator represent high risk for typed clients.

---

# 129. REQUEST COERCION

Validators may coerce:

```text
"123"
```

into:

```text
123
```

Document the actual accepted contract.

---

# 130. STRICT VS COERCED TYPES

If one endpoint coerces query numbers while another rejects them:

this can indicate client inconsistency.

---

# 131. TRIM

Does the backend trim whitespace?

If divergent endpoints handle the same field differently, semantic bugs can emerge.

---

# 132. CASE NORMALIZATION

Same for usernames and codes.

---

# 133. INPUT NORMALIZATION

Map:

```text
raw input
↓
normalized domain value
```

---

# 134. RESPONSE NORMALIZATION

If a client sends:

```text
" John "
```

and the response returns:

```text
"John"
```

this can be legitimate, but should be expected.

---

# 135. VALIDATION BOUNDS

Compare constraints on the same field across create, update, and bulk endpoints.

---

# 136. DUPLICATE SCHEMAS

If copy-pasted schemas drifted apart:

pinpoint concrete differences.

---

# 137. GENERATED SCHEMA

If OpenAPI is generated from DTOs:

verify that runtime transforms and interceptors do not mutate the response outside the schema.

---

# 138. SERIALIZER TRANSFORM

A global serializer may:

- rename fields
- strip nulls
- transform dates

OpenAPI must reflect the actual serialized outcome.

---

# 139. NULL EXCLUSION

If the serializer omits null fields:

spec must not falsely claim the field is always present with null.

---

# 140. DEFAULT EXCLUSION

Same for default values.

---

# 141. ORM SERIALIZATION

Direct ORM serialization can return:

- Decimal objects
- Dates
- relation proxies

diverging from the promised DTO contract.

---

# 142. BIGINT SERIALIZATION

Especially Node.js:

native BigInt is not natively JSON-serializable without custom transformations.

Verify the active runtime layer.

---

# 143. DECIMAL SERIALIZATION

ORM Decimal can become a string.

The spec and client must align.

---

# 144. BINARY DATA

Do not embed massive binaries directly into base64 JSON without reason.

However, small encoded fields may be legitimate.

---

# 145. OPENAPI AUDIT

If spec exists:

compare:

- paths
- methods
- params
- request
- response
- errors
- auth
- enum
- required
- nullable

---

# 146. STALE OPENAPI

Documentation generated months ago does not prove the runtime contract.

---

# 147. DOCUMENTATION EXAMPLES

Example payloads can drift even when schema remains accurate.

---

# 148. COPY-PASTE DOC BUG

Identify examples illustrating mismatched resource fields.

---

# 149. CLIENT SDK

If repository houses a client SDK:

compare SDK models against backend contracts.

---

# 150. GENERATED CLIENT

If SDK is generated from OpenAPI:

OpenAPI drift directly translates into client bugs.

---

# 151. MANUAL CLIENT TYPES

Frontend and mobile codebases often maintain handcrafted DTO types.

Compare them.

---

# 152. CLIENT NULLABILITY

Backend may return null while client type declares non-null.

Severity P1/P2 if normal runtime conditions trigger this.

---

# 153. CLIENT OPTIONALITY

Backend may omit a field that client logic treats as required.

---

# 154. CLIENT ENUM

Backend adds a new enum value while client enum is closed.

---

# 155. CLIENT DATE PARSER

Backend alters date format, causing client parsers to crash.

---

# 156. CLIENT NUMBER PRECISION

JS clients can lose precision on 64-bit numeric IDs.

If API emits large integer IDs as JSON numbers, verify the actual numeric range.

---

# 157. MULTIPLE CLIENTS

If there are:

- web
- Android
- iOS
- third-party APIs

map every contract consumer.

---

# 158. CLIENT CAPABILITY MATRIX

Construct:

| Contract feature | Web | Android | iOS | External |
|---|---|---|---|---|

---

# 159. SERVER CHANGE IMPACT

For each breaking candidate ask:

> Which clients are impacted?

---

# 160. MOBILE LAG

Mobile application updates are never instantaneous.

Backend must tolerate older releases across the full supported lifecycle.

---

# 161. WEB CLIENT

Web apps deploy faster, but cached browser tabs and service workers can temporarily consume stale contracts.

---

# 162. THIRD-PARTY CLIENT

If a public API serves external integrators:

backward compatibility increases dramatically in criticality.

---

# 163. CONTRACT VERSIONING

Versioning can be implemented via:

- path
- header
- media type
- schema version field

Do not mandate a single pattern.

---

# 164. VERSION NEGOTIATION

If a client requests an unsupported version:

the response must be deterministic and clear.

---

# 165. VERSION DEFAULT

If omitting version defaults to "latest", this can spontaneously break older clients.

Verify the versioning resolution model.

---

# 166. SUNSET

If API supplies deprecation and sunset headers:

verify consistency.

P4 unless mandated by product requirements.

---

# 167. FEATURE FLAGS

A flag altering response shapes for a subset of users can severely complicate client contracts.

---

# 168. CONDITIONAL FIELD

If a field exists only when a feature flag is active:

the spec must explicitly model it or mark the field optional.

---

# 169. ROLE-DEPENDENT SHAPE

Admin responses may expose additional fields.

Do not declare them under the same strict schema model if regular users receive a subset.

---

# 170. PERMISSION-DEPENDENT FIELD

Same.

---

# 171. EXPANSION PARAMETER

If endpoint supports:

```text
?expand=owner
```

verify that the schema clearly describes the optional expanded entity.

---

# 172. SPARSE FIELDSETS

If `fields=` parameter is supported, evaluate typed client parsing consequences.

---

# 173. LOCALIZATION

If response fields vary content based on locale:

types remain stable, but cache keys and documentation must reflect localization.

---

# 174. TRANSLATED ENUM LABEL

Do not conflate stable machine enum codes with localized display labels.

---

# 175. SERVER MESSAGE

Human-readable messages may be localized.

Clients must never bind business logic to message text.

---

# 176. BULK ENDPOINT

Bulk response contracts must reliably map inputs to corresponding outputs.

---

# 177. INDEX-BASED BULK RESULT

If results rely solely on array order:

verify that backend strictly guarantees ordered processing.

---

# 178. PER-ITEM ID

A more resilient mapping utilizes an input or client operation ID.

Do not demand without necessity, but flag ambiguity.

---

# 179. PARTIAL FAILURE

Bulk responses must clearly communicate:

- successes
- failures
- per-item details

---

# 180. ALL-OR-NOTHING

If batch execution is atomic, the contract must explicitly state so.

---

# 181. ASYNC CONTRACT

The 202/job model requires a stable Job resource schema.

---

# 182. JOB STATUS ENUM

Verify:

- pending
- running
- completed
- failed
- cancelled

and client handling of unobserved states.

---

# 183. PROGRESS

If progress reporting exists:

clearly define whether range is:

```text
0..1
```

or:

```text
0..100
```

---

# 184. RESULT

Completed jobs must possess a defined result object or resource link.

---

# 185. FAILURE

Async job error contracts should be parsable like sync API errors or follow a dedicated, well-documented model.

---

# 186. WEBHOOK CONTRACT

If backend dispatches webhooks:

analyze them as public contracts.

---

# 187. WEBHOOK VERSIONING

Provider-side event schemas can evolve independently from REST responses.

---

# 188. EVENT TYPE

Stable event types:

```text
order.created
```

must convey unambiguous semantics.

---

# 189. EVENT PAYLOAD

Whether payloads contain:

- full resource
- delta
- ID only

must be explicit.

---

# 190. EVENT SCHEMA DRIFT

If webhook documentation and spec diverge from runtime payloads:

integration break.

---

# 191. DUPLICATE EVENTS

While deduplication is a reliability topic, contracts must provide stable event IDs if consumers must dedup.

---

# 192. EVENT TIME

Differentiate:

- event occurred
- webhook delivered

timestamp semantics.

---

# 193. IMPORT/EXPORT CONTRACT

If export formats serve as data or API contracts:

versioning becomes crucial.

---

# 194. CSV

Verify:

- headers
- encoding
- delimiter
- escaping

only where CSV constitutes part of the product contract.

---

# 195. JSON EXPORT

Version fields may be needed if exports are subsequently re-imported.

---

# 196. ROUNDTRIP

Export -> import must preserve semantic data promised by the product.

---

# 197. GRAPHQL INTEROP

If backend provides both REST and GraphQL:

compare domain semantics.

Do not mandate identical response shapes.

---

# 198. DUPLICATE DOMAIN ENUM

REST and GraphQL must not assign divergent meanings to the same status without clear reason.

---

# 199. INTERNAL API

Internal APIs also possess contracts if other services consume them.

---

# 200. SERVICE-TO-SERVICE

A breaking contract change can take down downstream microservices even if the public frontend remains functional.

---

# 201. MESSAGE QUEUE CONTRACT

If event payloads act as inter-service contracts, audit them.

---

# 202. EVENT VERSION

If consumers deploy independently, schema evolution rules are critical.

---

# 203. REMOVE FIELD

Older consumers may still depend on the removed attribute.

---

# 204. ADD REQUIRED FIELD

Consumer deserializers may fail.

---

# 205. SCHEMA REGISTRY

If a schema registry is present, check compatibility settings.

If not:

do not demand one automatically.

---

# 206. CONTRACT TESTS

Map:

- API integration
- schema validation
- snapshot
- generated SDK
- consumer-driven contracts

---

# 207. SNAPSHOT TEST

Snapshots can catch accidental response mutations.

However, they become fragile if covering non-deterministic fields.

---

# 208. SCHEMA TEST

Validating runtime responses against OpenAPI schemas provides strong signals.

---

# 209. CONSUMER-DRIVEN CONTRACT

If multiple independent teams or services consume the API, consumer-driven contracts add high value.

Do not introduce without cause.

---

# 210. GOLDEN PAYLOADS

Critical contracts benefit from golden payload fixtures.

---

# 211. OLD CLIENT TEST

Run older client models and parsers against the new backend responses where feasible.

---

# 212. UNKNOWN FIELD TEST

Clients should generally ignore unknown response fields.

Verify actual serializers and parsers.

---

# 213. UNKNOWN ENUM TEST

Especially on mobile platforms.

---

# 214. NULL TEST

Backend fixtures populated with realistic null values.

---

# 215. OMITTED FIELD TEST

Same for omitted attributes.

---

# 216. MAX VALUE TEST

Boundary values for IDs, counts, and amounts.

---

# 217. LARGE INTEGER TEST

Specifically web/JS runtimes.

---

# 218. DATE EDGE TEST

- UTC
- timezone offset
- DST
- leap day

according to domain.

---

# 219. DECIMAL TEST

Precision-sensitive fields.

---

# 220. BULK MIXED RESULT TEST

Batches containing both successful and failing items.

---

# 221. FINDING FORMAT

Every serious finding must include:

```text
ID:
Severity:
Category:
Confidence:
Status:

Endpoint/Event:
Method:
Version:
Affected client(s):

Backend file/schema:
Client file/schema:
OpenAPI/documentation:
Relevant definitions:

Problem:

Evidence:

Contract Comparison:

Expected:

Actual:

Runtime example:

Backward compatibility impact:

Client failure mode:

Data/semantic impact:

Root cause:

Recommended remediation:

Migration/compatibility strategy:

Regression/contract test:

Verification:

Complexity:
XS / S / M / L / XL
```

---

# 222. SEVERITY

Use:

## P0 - CRITICAL

- contract inconsistency triggers cross-user or security boundary failure
- financial or data corruption due to unit/type mismatch
- catastrophic consumer misinterpretation

## P1 - HIGH

- released client routinely crashes or cannot execute critical API flows
- silent semantic mismatch corrupts critical business data
- normal response violates declared non-null or type contract
- production versioning change breaks supported clients

## P2 - MEDIUM

- significant schema, error, or pagination inconsistency with real client impact
- response drift requiring substantial client workarounds

## P3 - LOW

- limited inconsistency
- edge-case parsing problem

## P4 - IMPROVEMENT

- naming, style, or documentation harmonization without confirmed runtime failure

---

# 223. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

backend and consumer definitions directly conflict, or a test reproduces the issue.

MEDIUM:

runtime schema is clear, but affected client behavior is not completely confirmed.

LOW:

depends on external clients or undocumented consumer behavior.

---

# 224. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 225. COMPATIBILITY CLASS

For each contract change classify:

```text
BACKWARD COMPATIBLE
POTENTIALLY BREAKING
BREAKING
SEMANTICALLY BREAKING
NOT VERIFIED
```

---

# 226. AFFECTED CLIENT

Use:

```text
WEB
ANDROID
IOS
EXTERNAL
SERVICE
WEBHOOK CONSUMER
ALL
UNKNOWN
```

---

# 227. FALSE-POSITIVE PREVENTION

Before any P1/P2 finding, verify:

1. runtime handler
2. validator
3. serializer
4. DTO/schema
5. OpenAPI
6. client parser/types
7. version
8. tests
9. feature flags
10. role-specific projections

Do not conclude solely from documentation.

---

# 228. DO NOT ENFORCE IDENTICAL DTOS

Summary and Detail resources can legitimately exhibit different shapes.

Report a finding only if contract identity or typing becomes ambiguous.

---

# 229. DO NOT ENFORCE A SINGLE ERROR MESSAGE

Human-readable text may vary.

Machine-readable semantics must be stable where client logic depends on them.

---

# 230. DO NOT ENFORCE ENVELOPE

Direct response representations can form excellent contracts.

---

# 231. DO NOT ENFORCE VERSIONING

If compatibility requirements do not exist, versioning adds complexity without benefit.

---

# 232. DO NOT RENAME FIELDS PURELY FOR AESTHETICS

Renaming a public field is a breaking change.

Minor naming inconsistencies are preferable to breaking production clients.

---

# 233. BACKWARD COMPATIBILITY TAKES PRECEDENCE OVER ELEGANCE

If an existing "imperfect" schema serves clients in production:

do not refactor it without a comprehensive migration and versioning strategy.

---

# 234. DO NOT MODIFY CODE

During audit:

- do not rename fields
- do not change schemas
- do not introduce envelopes
- do not add versioning
- do not change errors
- do not alter enums

Finish the audit first.

---

# 235. OUTPUT - API_CONTRACT_CONSISTENCY_AUDIT.md

Structure the final report:

## 1. Executive Summary

- contract sources
- API versions
- clients
- primary consistency problems
- compatibility readiness

## 2. Contract Source-of-Truth Map

## 3. Endpoint Contract Inventory

## 4. Naming Consistency

## 5. Primitive Type Consistency

## 6. ID Contract Audit

## 7. Date / Time Contract Audit

## 8. Money / Decimal / Unit Audit

## 9. Nullability / Optionality Audit

## 10. Enum Audit

## 11. Request DTO Consistency

## 12. Response DTO Consistency

## 13. Error Contract Consistency

## 14. Pagination Contract Audit

## 15. Filter / Sort Contract Audit

## 16. Header Contract Audit

## 17. Async Job Contract Audit

## 18. Bulk Contract Audit

## 19. Webhook / Event Contract Audit

## 20. OpenAPI Drift Audit

## 21. Client Type Drift Audit

## 22. Multi-Client Compatibility

## 23. Versioning / Backward Compatibility

## 24. Contract Test Coverage

## 25. Findings Summary

| ID | Severity | Contract | Client | Problem | Compatibility | Status |
|---|---|---|---|---|---|---|

## 26. P0 Findings

## 27. P1 Findings

## 28. P2 Findings

## 29. P3 Findings

## 30. P4 Improvements

## 31. Things Done Well

## 32. Unknown / Not Verified

## 33. Compatibility Remediation Roadmap

---

# 236. FIELD CONSISTENCY MATRIX

For shared concepts:

| Concept | Endpoint A | Endpoint B | Client model | Consistent |
|---|---|---|---|---|

---

# 237. NULLABILITY MATRIX

| Field | Runtime | OpenAPI | Web | Mobile | Risk |
|---|---|---|---|---|---|

---

# 238. ENUM MATRIX

| Enum | Backend | Web | Mobile | Unknown-safe | Risk |
|---|---|---|---|---|---|

---

# 239. ERROR MATRIX

| Logical error | HTTP | Error code | Shape | Endpoints | Consistent |
|---|---|---|---|---|---|

---

# 240. PAGINATION MATRIX

| Endpoint | Model | Index base | Max | Ordering | Consistent |
|---|---|---|---|---|---|

---

# 241. VERSION MATRIX

| Contract change | Old version | New version | Client impact | Classification |
|---|---|---|---|---|

---

# 242. SECOND PASS - SAME CONCEPT SEARCH

After the initial audit, select core domain concepts:

- user
- status
- amount
- date
- ID
- pagination
- error

and search repository-wide for all representations.

Ask:

> Does the same concept consistently carry the same meaning?

---

# 243. SECOND PASS - NULL ATTACK

For each optional or nullable field test:

```text
missing
null
empty string
empty array
```

according to type.

Verify both backend and clients.

---

# 244. SECOND PASS - UNKNOWN ENUM

Backend emits a new enum value unknown to the released mobile client.

Ask:

> Does the client crash, reject the response, or execute a graceful fallback?

---

# 245. SECOND PASS - OLD CLIENT

For each newer contract change simulate the previously supported client version.

---

# 246. SECOND PASS - TYPE EDGE

Test:

- large int
- decimal precision
- zero
- negative
- max values

according to domain.

---

# 247. SECOND PASS - DATE EDGE

Test:

```text
UTC
+14:00
-12:00
DST transition
leap day
```

where relevant.

---

# 248. SECOND PASS - PAGINATION

Seed multiple items with identical sort values.

Verify deterministic, stable ordering.

---

# 249. SECOND PASS - ERROR DRIFT

Trigger the same logical failure across multiple endpoints.

Compare:

- HTTP status
- code
- shape
- field path

---

# 250. SECOND PASS - OPENAPI

Automatically or manually compare each critical runtime response with the declared schema.

---

# 251. SECOND PASS - ROLE VARIANTS

Invoke the same endpoint as:

- ordinary user
- admin
- owner
- non-owner

where relevant.

Verify response shape remains within the documented contract.

---

# 252. SECOND PASS - FEATURE FLAGS

If flags influence responses:

test both enabled and disabled states.

---

# 253. SECOND PASS - BULK

Mixed success and failure payload.

Ask whether clients can deterministically correlate results with inputs.

---

# 254. SECOND PASS - WEBHOOK

Compare webhook and event schemas with corresponding REST resources.

They do not need to be identical, but semantics must align clearly.

---

# 255. SECOND PASS - DOC EXAMPLES

Validate each example payload against the actual runtime schema.

---

# 256. FINAL QUALITY GATE

Before final response verify:

- runtime contract takes precedence over documentation assumptions
- the same domain concept is mapped repository-wide
- ID types are compared
- timestamps and timezone semantics are verified
- money and unit representations are not implicitly conflated
- null, missing, and empty values are not treated as equivalent
- create and update schemas have appropriate optionality semantics
- read-only and sensitive fields are not accidentally writeable or readable
- enum evolution is analyzed for legacy clients
- error messages are not treated as stable machine identifiers
- pagination indexing, defaults, and ordering are audited
- response summary and detail projections are not falsely labeled as inconsistencies
- OpenAPI is compared against runtime behavior
- manual client types are compared where present
- older mobile clients are evaluated where compatibility matters
- feature-flagged and role-dependent response shapes are accounted for
- breaking changes and stylistic variations are clearly separated
- public field renames are never recommended purely for styling
- backward compatibility is strictly prioritized over aesthetics

---

# FINAL RULE

I do not want a report like:

> Standardize naming, use OpenAPI, and align response structures.

That is not a contract audit.

I am looking for problems like:

```text
POST /orders response:
{
  "id": 123
}

GET /orders/123 response:
{
  "id": "123"
}
↓
web client treats IDs as number
↓
mobile model expects String
↓
shared caching/comparison logic becomes inconsistent
```

or:

```text
OpenAPI:
email: string

Runtime:
email: string | null

Android generated model:
val email: String

↓
production user without email receives null
↓
client deserialization/runtime flow fails
```

or:

```text
API v1 status enum:
PENDING
ACTIVE

backend later adds:
SUSPENDED

old mobile client uses exhaustive enum parser
↓
unknown SUSPENDED value
↓
entire response fails to parse
```

or:

```text
PATCH /profile

missing "nickname"
means:
leave unchanged

but:

"nickname": null
is silently normalized to missing
↓
client has no way to clear nickname
```

or:

```text
GET /transactions
amount = "12.50"

GET /account/summary
balance = 12.5

POST /payment
amount = 1250

↓
same monetary concept uses decimal string,
floating number and minor units
↓
client can silently interpret one value incorrectly
```

or:

```text
API docs:
page starts at 1

runtime:
page=1 applies offset=limit
↓
first page is skipped
↓
generated/integrating client never receives first result set
```

or:

```text
backend error A:
{
  "code": "INVALID_STATE"
}

same logical failure on bulk endpoint:
{
  "message": "Cannot update item"
}

↓
client can recognize and handle conflict in one flow
but not in another
```

These are the API contract consistency problems you need to find.

Think through:

- same concept
- same type
- same semantics
- nullability
- enum evolution
- units
- errors
- versions
- documentation
- actual consumers

For each serious finding you must be able to answer:

> Which backend contract exists?

> Which client contract exists?

> Where do they diverge?

> Does the issue manifest today or only after schema evolution?

> Can the issue be resolved backward-compatibly or does it require versioning/migration?

If not provable:

**NOT VERIFIED.**

If it is merely a naming or style difference without runtime impact:

**P4 - IMPROVEMENT.**

If a "fix" itself would break existing clients:

do not recommend it without a compatibility plan.

It is better to find 7 real schema or semantic mismatches than to write 100 stylistic rules.

The goal is to produce a forensically precise API contract audit from which each serious finding can be directly converted into:

- contract test
- schema correction
- backward-compatible migration
- OpenAPI fix
- client model fix
- versioning decision
- compatibility safeguard
