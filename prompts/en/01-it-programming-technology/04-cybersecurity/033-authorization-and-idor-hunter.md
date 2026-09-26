---
id: UPL-IT-033
number: 33
slug: authorization-and-idor-hunter
title: Authorization & IDOR Hunter
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# AUTHORIZATION AND IDOR HUNTER

I want you to perform a maximally deep, systematic, evidence-first, and attacker-oriented analysis of the complete authorization layer across the application, with a special focus on IDOR/BOLA, broken function-level authorization, cross-user and cross-tenant access, field-level privilege escalation, and ownership boundary bypasses.

Main goal:

> Determine whether an authenticated or partially privileged user can access, modify, delete, or trigger an action on a resource they have no right to, simply by altering an ID, tenant, parent resource, body field, role, route, API version, batch payload, or alternative entry point.

This is not:

- an authentication audit
- a generic RBAC checklist
- merely an admin route inspection
- an assumption that a numeric ID is a vulnerability in itself
- an attempt to migrate every endpoint to UUID
- an automatic demand for ABAC
- an automatic demand for a policy engine
- merely a frontend permission review

The focus is on the question:

> Who is permitted to do what on which exact resource, and where is that actually enforced?

Priority:

**cross-tenant isolation > horizontal privilege escalation > vertical privilege escalation > ownership enforcement > function-level authorization > field-level authorization > indirect resource access > hardening**

It is better to identify 5 real authorization bypasses than to compile 100 generic recommendations regarding roles and permissions.

---

# 1. ESTABLISH THE AUTHORIZATION MODEL

Before documenting findings, establish:

- ownership model
- tenant model
- role model
- permission model
- ACL
- capabilities
- organization membership
- resource hierarchy
- admin levels
- service/system principals

---

# 2. CREATE A PRINCIPAL INVENTORY

Identify:

```text
anonymous
user
owner
manager
tenant admin
global admin
support
service account
system worker
```

Add the actual role and principal types from the project.

---

# 3. CREATE A RESOURCE INVENTORY

For each sensitive resource, document:

```text
Resource:
Primary ID:
Tenant:
Owner:
Parent:
Read permission:
Write permission:
Delete permission:
Special actions:
```

---

# 4. AUTHORIZATION MATRIX

Construct:

| Principal | Resource | Read | Create | Update | Delete | Special |
|---|---|---|---|---|---|---|

Do not base the matrix solely on documentation.

Verify against actual code.

---

# 5. ROUTE INVENTORY

For each sensitive endpoint, document:

```text
Method:
Path:
Authentication:
Route-level authorization:
Resource-level authorization:
Tenant scope:
Field-level authorization:
```

---

# 6. AUTH != AUTHZ

If a route includes:

```text
requireLogin()
```

this only proves identity.

It does not prove that the caller is authorized for the resource.

---

# 7. IDOR / BOLA

For each endpoint taking a resource ID, test:

```text
valid own ID
↓
replace with another user's ID
```

---

# 8. READ IDOR

Example:

```text
GET /documents/:id
```

Verify that the query enforces:

- owner
- tenant
- permission

and not merely the ID.

---

# 9. UPDATE IDOR

Example:

```text
PATCH /documents/:id
```

---

# 10. DELETE IDOR

Example:

```text
DELETE /documents/:id
```

---

# 11. ACTION IDOR

Specifically:

```text
POST /orders/:id/cancel
POST /users/:id/reset-mfa
POST /files/:id/share
```

---

# 12. A NUMERIC ID IS NOT A DEFECT IN ITSELF

Sequential IDs may increase discoverability, but authorization must provide the actual protection.

Do not recommend UUIDs as a substitute for authz.

---

# 13. UNGUESSABLE ID IS NOT AUTHORIZATION

Even UUIDs require permission checks.

---

# 14. OWNERSHIP FILTER

High-value pattern:

```text
SELECT *
FROM resource
WHERE id = ?
AND owner_id = ?
```

or equivalent policy enforcement.

---

# 15. FETCH THEN CHECK

This can be valid:

```text
load resource
↓
check owner
```

provided the check genuinely covers all execution paths.

---

# 16. CHECK AFTER SIDE EFFECT

This is invalid:

```text
update/delete
↓
then check owner
```

---

# 17. NESTED RESOURCE

Example:

```text
/orgs/:orgId/projects/:projectId/tasks/:taskId
```

Verify every relationship.

---

# 18. PARENT/CHILD MISMATCH

Classic defect:

```text
caller may access org A
↓
passes project B from org C
↓
handler validates org A
↓
loads project B only by projectId
```

---

# 19. DECEPTIVE NESTED ROUTE

The path appears scoped, but the database query is not.

This is a high signal.

---

# 20. CHILD LOOKUP

Verify that child queries enforce expected parent and tenant scopes.

---

# 21. GRANDCHILD

Do not assume verifying the parent is sufficient if a deeper child can be unassociated.

---

# 22. INDIRECT REFERENCE

The resource might not reside directly in the URL.

Example:

```text
POST /export
{
  "documentId": "..."
}
```

A body-supplied ID requires identical authorization.

---

# 23. QUERY PARAM ID

Similarly:

```text
?userId=...
```

---

# 24. HEADER-SCOPED RESOURCE

Custom headers such as:

```text
X-Organization-Id
```

must be authorized.

---

# 25. TENANT ISOLATION

For multi-tenant systems:

> Every access must be scoped to tenant authority, not merely client-supplied tenant IDs.

---

# 26. TENANT FROM TOKEN

If the token contains a tenant:

verify that it is neither stale nor forgeable by the client.

---

# 27. TENANT SWITCHING

If a user belongs to multiple tenants:

map how they select the active tenant.

---

# 28. ACTIVE TENANT

An active tenant claim does not prove authorization if the caller submits a resource ID belonging to another tenant.

---

# 29. CLIENT-SUPPLIED TENANT

Pattern:

```text
tenantId = body.tenantId
```

without membership validation.

---

# 30. TENANT QUERY MISSING

Search for repository methods that look up records solely by `id`, omitting tenant scope.

---

# 31. SOFT-DELETE + TENANT

Global resource lookups might retrieve soft-deleted or cross-tenant records that normal scoped repository methods conceal.

---

# 32. CACHE

Authorization may be correct in the database, but the cache key flawed.

Example:

```text
resource:{id}
```

instead of:

```text
tenant:{tenantId}:resource:{id}
```

where IDs are not globally unique.

---

# 33. RESPONSE CACHE

A personalized response must never be shared across principals.

---

# 34. FILES

File authorization must verify:

- metadata
- owner
- tenant
- storage key

---

# 35. DIRECT STORAGE URL

If knowledge of a URL or object key grants access to private files:

the authorization boundary is weak.

---

# 36. PRESIGNED URL

Endpoints generating signed URLs must authorize the requested object.

---

# 37. FILE IDOR

Swap:

```text
fileId
```

for another user's ID.

---

# 38. IMAGE/THUMBNAIL DERIVATIVES

Thumbnail and preview routes may accidentally be public, bypassing original file authorization.

---

# 39. EXPORT

Export endpoints represent a frequent IDOR/BOLA attack surface.

---

# 40. REPORT

Report generators may accept tenant, user, or resource filters that callers must not supply arbitrarily.

---

# 41. SEARCH

Search results must honor authorization boundaries.

---

# 42. SEARCH SIDE CHANNEL

Even if a full resource cannot be retrieved, search may leak:

- name
- email
- title
- existence

---

# 43. AUTOCOMPLETE

Same principle applies.

---

# 44. COUNTS

An endpoint may leak:

```text
count of records
```

for another tenant.

---

# 45. METADATA

Data exposure through list or search operations often arises even when detail endpoints enforce strong authz.

---

# 46. LIST ENDPOINT

Verify that list queries automatically scope results to the caller and tenant.

---

# 47. FILTER TAMPERING

High-signal:

```text
GET /users?tenantId=other
```

---

# 48. OWNER FILTER FROM QUERY

Callers must not be able to strip away server-mandated owner filters.

---

# 49. FILTER MERGE ORDER

Classic bug:

```text
safeFilter = { tenantId: currentTenant }
finalFilter = { ...safeFilter, ...req.query }
```

If the query supplies `tenantId`, the safe filter can be overwritten.

---

# 50. SUPPORTED FILTER WHITELIST

Do not merge arbitrary request objects into database where clauses.

---

# 51. BODY MERGE

Same risk applies to update and create operations.

---

# 52. MASS ASSIGNMENT

A caller may possess permission to update a resource, but not all of its fields.

---

# 53. FIELD-LEVEL AUTHZ

Map privileged fields:

- role
- ownerId
- tenantId
- status
- balance
- verified
- permissions
- billing plan
- visibility
- moderation state

---

# 54. USER PROFILE UPDATE

Example:

```text
PATCH /me
```

is not automatically secure if the body accepts:

```text
role
```

---

# 55. CREATE-ON-BEHALF

Who is permitted to create a resource on behalf of another user?

---

# 56. `userId` IN REQUEST BODY

If an ordinary user can pass:

```json
{
  "userId": "victim"
}
```

verify the underlying semantics.

---

# 57. SERVER-SIDE OWNER ASSIGNMENT

Ownership must generally be assigned from the authenticated principal server-side.

---

# 58. ADMIN CREATE-ON-BEHALF

This may be legitimate, but must represent an explicitly privileged code path.

---

# 59. OWNERSHIP TRANSFER

Specifically audit:

```text
change owner
```

---

# 60. TRANSFER TO ATTACKER

An ordinary editor must not be able to transfer ownership to themselves.

---

# 61. TRANSFER OUT OF TENANT

A resource must not be able to migrate across tenants.

---

# 62. LAST OWNER

An organization or project may require at least one owner.

This is business logic, but directly affects privilege boundaries.

---

# 63. ROLE ASSIGNMENT

Who is authorized to assign which roles?

---

# 64. PRIVILEGE CEILING

A manager must not be able to grant roles higher than their own unless explicitly permitted by product design.

---

# 65. SELF-PROMOTION

Test:

```text
caller changes own role
```

---

# 66. PEER PROMOTION

Can a user with an intermediate role promote another user to global admin?

---

# 67. ROLE DOWNGRADE

Can an attacker demote the only administrator capable of revoking their rights?

---

# 68. ROLE CHECK

The pattern:

```text
if user.role == "admin"
```

may be valid.

However, inspect:

- stale claims
- multiple role types
- tenant-local vs global admin

---

# 69. GLOBAL ADMIN VS TENANT ADMIN

One of the most critical access boundaries.

---

# 70. TENANT ADMIN

Must not inherit global system access by default.

---

# 71. ROLE NAME COLLISION

An `admin` role within a tenant is not necessarily an `admin` globally.

---

# 72. BFLA

Broken Function Level Authorization:

an ordinary user can invoke a privileged endpoint.

---

# 73. ADMIN ROUTE

A path name is not an access control:

```text
/admin/users
```

must enforce actual authorization.

---

# 74. HIDDEN FRONTEND BUTTON

Hiding a UI button is not authorization.

---

# 75. CLIENT GUARD

Frontend route guards do not constitute server authorization.

---

# 76. INTERNAL FRONTEND API

An endpoint that the frontend "never calls" remains an attack surface if reachable.

---

# 77. METHOD-LEVEL AUTHZ

A GET route may be protected while a PATCH on the same path accidentally lacks authorization.

---

# 78. ROUTE ALIAS

A single handler may be mounted on multiple routes with diverging middleware chains.

---

# 79. API VERSION

V1 may have weaker authz enforcement than V2.

---

# 80. MOBILE LEGACY

Older mobile endpoints frequently remain unprotected.

---

# 81. GRAPHQL

If present:

authorization must be verified per resolver and resource.

---

# 82. GRAPHQL NODE LOOKUP

Generic:

```text
node(id)
```

resolvers often become central IDOR attack surfaces.

---

# 83. GRAPHQL NESTED FIELD

A user may be authorized for a parent object, but not a sensitive nested relation.

---

# 84. FIELD-LEVEL GRAPHQL AUTH

Sensitive fields:

- email
- salary
- billing
- secret metadata

may demand dedicated policy guards.

---

# 85. GRAPHQL MUTATION

Mutation authorization must be audited independently from query authorization.

---

# 86. ALIAS/BATCH

A single GraphQL request can probe multiple resource IDs simultaneously.

---

# 87. BULK REST

Bulk endpoints must authorize every item individually.

---

# 88. ONE BAD ITEM

Defect pattern:

```text
authorize request based on first item
↓
process all item IDs
```

Critical BOLA defect.

---

# 89. BULK DELETE

Especially critical.

---

# 90. IMPORT

Import workflows may create or update resources belonging to other users or tenants.

---

# 91. CSV USER ID

If an imported row contains an owner or tenant ID:

verify caller permissions.

---

# 92. BATCH JOB

Background workers do not automatically inherit user auth middleware.

---

# 93. USER-INITIATED JOB

If a background job executes a privileged action asynchronously:

it must carry a valid authorization context or enforce a re-check model.

---

# 94. TIME-OF-CHECK VS EXECUTION

A user may lose permissions between job enqueue and execution.

Determine whether the job must:

- use the original grant
- verify current permissions at runtime

Domain and product requirements dictate the correct approach.

---

# 95. SYSTEM PRINCIPAL

Workers frequently operate under system-level privileges.

They must strictly restrict resource lookups based on payload claims.

---

# 96. JOB IDOR

An attacker enqueues a job referencing another user's resource ID.

---

# 97. WEBHOOK

A provider-authenticated webhook is not automatically authorized for arbitrary local tenants or resources.

---

# 98. EXTERNAL ID MAPPING

External webhook objects must map strictly to the matching local tenant.

---

# 99. SERVICE-TO-SERVICE

Internal service accounts must be restricted to defined scopes.

---

# 100. SERVICE TOKEN

Do not treat every internal token as a global admin principal without justification.

---

# 101. API KEY SCOPES

If API keys exist:

audit route-level and resource-level enforcement.

---

# 102. READ-ONLY KEY

Must not be capable of writing via alternative routes.

---

# 103. SCOPES IN TOKEN

Stale scope claims may persist until token expiration.

---

# 104. REVOKED KEY

Every authentication path must honor key revocation.

---

# 105. OBJECT CAPABILITY

Signed URLs and tokens can represent object capabilities.

Verify:

- resource scope
- permitted operation
- expiration
- single-use enforcement where relevant

---

# 106. SHARE LINK

Public share tokens can legitimately bypass standard user ownership checks.

This constitutes a dedicated authorization model.

---

# 107. SHARE TOKEN SCOPE

A token granting:

```text
read document A
```

must not allow:

```text
edit document A
```

or reading document B.

---

# 108. TOKEN ENUMERATION

Share tokens must possess sufficient entropy if possession equals authorization.

---

# 109. SHARE REVOCATION

Revoked share links must immediately cease functioning according to product semantics.

---

# 110. INVITATION

Invitation tokens can confer membership roles.

---

# 111. INVITE ROLE TAMPERING

If a token is issued for `member`, the caller must not acquire `admin` via body manipulation.

---

# 112. INVITE TENANT

Invitations must be strictly bound to the exact issuing organization or tenant.

---

# 113. ACCESS THROUGH RELATION

A user may hold access rights because they are an:

- owner
- member
- collaborator
- viewer

Audit all relation-based access paths.

---

# 114. REVOKED MEMBERSHIP

Caches or sessions must not preserve access if the security model mandates immediate revocation.

---

# 115. GROUP MEMBERSHIP

Nested groups can confer transitive permissions.

Inspect cycles and precedence only where the model supports them.

---

# 116. ACL

If a resource employs an Access Control List (ACL):

map:

- allow rules
- deny rules
- inherited permissions

---

# 117. DENY PRECEDENCE

Do not fabricate rules.

Determine the actual intended semantics.

---

# 118. PUBLIC RESOURCE

Public visibility can be a legitimate bypass of user ownership.

---

# 119. PUBLIC TO PRIVATE TRANSITION

Caches and share URLs must cease exposing resources when visibility flips to private.

---

# 120. UNLISTED

Unlisted visibility is not identical to private visibility.

---

# 121. AUTHZ + SOFT DELETE

A user might no longer be permitted to access a deleted resource.

Admin and recovery routes may retain access.

---

# 122. RESTORE

Who is authorized to restore a deleted resource?

---

# 123. ARCHIVED RESOURCE

Archived resources may be read-only.

Verify that mutations are rejected.

---

# 124. STATE-DEPENDENT AUTHZ

Permissions may depend on the lifecycle state of a resource.

Example:

```text
author can edit DRAFT
cannot edit APPROVED
```

---

# 125. STATUS TAMPERING

If a caller can manipulate status fields, they may unlock restricted actions.

---

# 126. WORKFLOW AUTHZ

An approver may approve records, but must not approve their own submissions.

---

# 127. SELF-APPROVAL

If business logic forbids self-approval, treat it as an authorization boundary.

---

# 128. FOUR-EYES PRINCIPLE

If an action mandates two distinct approvers:

a single user must not circumvent this via multiple sessions.

---

# 129. RESOURCE CREATOR VS CURRENT OWNER

Authorization checks must rely on the correct conceptual identity.

---

# 130. HISTORICAL OWNER

A previous owner must not retain access after ownership transfer.

---

# 131. DELEGATION

If users can delegate permissions:

map the permitted duration and scope.

---

# 132. REVOKED DELEGATION

Cached authorization tokens must honor delegation revocation.

---

# 133. IMPERSONATION

Support and administrator impersonation represents a specialized authorization boundary.

---

# 134. ACTOR VS SUBJECT

During impersonation, the system must distinguish between:

```text
real actor
impersonated subject
```

---

# 135. IMPERSONATION RESTRICTIONS

Certain critical actions must remain blocked during impersonated sessions.

Product and security policies dictate these constraints.

---

# 136. ADMIN EXPORT

Global data exports represent high-risk privileged functions.

---

# 137. AUDIT LOG

Who is authorized to read audit logs?

---

# 138. AUDIT LOG DELETE

Standard administrators must not be permitted to purge audit trails.

---

# 139. BILLING

A tenant member may be authorized to view projects, but barred from billing records.

---

# 140. PAYMENT METHODS

High-value field-level and resource-level authorization boundary.

---

# 141. SUBSCRIPTION PLAN

Who is permitted to modify the subscription tier?

---

# 142. INVOICE

Invoice IDOR frequently exposes sensitive PII and financial records.

---

# 143. ADDRESS / PII

Profile access may require field-level access control.

---

# 144. PASSWORD HASH / AUTH DATA

No standard read endpoint must ever serialize or return credential data.

This is both a serialization and an access control defect.

---

# 145. INTERNAL NOTES

Support-only and admin-only fields.

---

# 146. MODERATION DATA

Moderators may review abuse reports; ordinary users must not.

---

# 147. HIDDEN COMMENTS / DRAFTS

Visibility rules function as authorization boundaries.

---

# 148. DATA EXPORT / GDPR-LIKE EXPORT

Users must receive only their own data according to application semantics.

Avoid legal assessments; verify technical scoping.

---

# 149. DELETE ACCOUNT

Callers must only delete their own account or invoke a privileged administrative path.

---

# 150. ADMIN DELETE USER

High-risk function-level access boundary.

---

# 151. RESET MFA FOR ANOTHER USER

High-risk support and administrative action.

---

# 152. FORCE PASSWORD RESET

Similarly high risk.

---

# 153. CREATE API KEY FOR ANOTHER USER

Critical privilege boundary.

---

# 154. VIEW SECRET

Who is permitted to view full API keys or credentials?

---

# 155. ROTATE SECRET

High-privilege operation.

---

# 156. ENVIRONMENT / PROJECT SCOPING

If the SaaS platform organizes resources by:

```text
organization
project
environment
```

verify all three boundaries.

---

# 157. PROJECT MEMBER

Does not automatically hold access to the production environment.

---

# 158. DEV VS PROD PERMISSIONS

High-value access distinction.

---

# 159. RESOURCE ID COLLISION ACROSS ENVIRONMENTS

Composite lookups must include project and environment context.

---

# 160. URL SLUG

A slug is an identifier, not an authorization token.

---

# 161. SLUG CHANGE

Redirects from old slugs must not bypass access controls on private resources.

---

# 162. ALTERNATE IDENTIFIER

An endpoint may accept both numeric IDs and slugs.

Both resolution paths must enforce identical authz.

---

# 163. CASE VARIANT ROUTE

Route normalization or proxy mismatches may occasionally route requests past middleware.

Verify against the actual framework implementation.

---

# 164. TRAILING SLASH

Do not report without evidence, but test if reverse proxy and application routes diverge on canonical paths.

---

# 165. METHOD OVERRIDE

If the application supports:

```text
X-HTTP-Method-Override
_method
```

verify that authorization middleware inspects the effective method.

---

# 166. HEAD

Frameworks may automatically map HEAD requests to GET handlers.

While bodies are omitted, side effects and resource headers may still be exposed.

---

# 167. OPTIONS

Must not return privileged resource content.

---

# 168. DEBUG/ADMIN ALIAS

Legacy debug routes may call the same service while omitting policy guards.

---

# 169. DIRECT SERVICE ROUTE

Internal routes may bypass public controller authorization logic.

---

# 170. FUNCTION REUSE

If a service method assumes the caller has already been authorized:

every call site must guarantee that assumption holds.

---

# 171. SECURITY AT WRONG LAYER

If 12 controllers each perform manual ownership checks:

a new controller is prone to omitting the check.

This is an architectural risk, but severity depends on confirmed bypasses.

---

# 172. CENTRALIZED POLICY

Reduces policy drift across endpoints.

Do not mandate an external policy engine unless genuinely required.

---

# 173. DEFAULT DENY

Security-sensitive authorization architecture should fail to deny access if a check is omitted.

Evaluate against the framework and domain model.

---

# 174. POLICY COVERAGE

If decorators or annotations are used:

search for unprotected endpoints.

---

# 175. ANNOTATION != ENFORCEMENT

Verify that annotations actually activate underlying guard logic.

---

# 176. ORDER OF MIDDLEWARE

Authorization middleware may be mounted after the handler or only applied to specific HTTP methods.

---

# 177. ERROR HANDLING

Authorization failures must fail closed.

---

# 178. POLICY SERVICE DOWN

A failed policy service must never default to allowing access.

---

# 179. CACHE ERROR

Permission cache outages must not grant privileged access if the cache acts as the authority.

---

# 180. UNKNOWN ROLE

Unknown roles must never default to maximum privilege.

---

# 181. UNKNOWN PERMISSION

Fail closed across all security-sensitive operations.

---

# 182. INCOMPLETE PRINCIPAL

A missing tenant or user context must not fall back to global access.

---

# 183. TESTING

Map negative authorization test coverage.

---

# 184. OWN RESOURCE TEST

---

# 185. OTHER USER RESOURCE TEST

---

# 186. OTHER TENANT RESOURCE TEST

---

# 187. NO AUTH TEST

---

# 188. LOWER ROLE TEST

---

# 189. EQUAL ROLE TEST

---

# 190. HIGHER ROLE TEST

---

# 191. BULK MIXED OWNERSHIP TEST

Payload contains:

```text
own
own
other-user
```

---

# 192. NESTED MISMATCH TEST

Valid parent A combined with child B belonging to parent C.

---

# 193. FILTER OVERRIDE TEST

Attempt to override server-mandated tenant and owner filters.

---

# 194. HIDDEN FIELD TEST

---

# 195. ALT ROUTE TEST

V1, V2, admin, or internal route aliases.

---

# 196. SHARE TOKEN TEST

Attempt write operations using a read-only share token.

---

# 197. REVOCATION TEST

Permissions or memberships revoked, testing against stale sessions, tokens, or caches.

---

# 198. STATE CHANGE TEST

Resource transitions:

```text
DRAFT -> APPROVED
```

and the original author attempts subsequent edits.

---

# 199. JOB TEST

An attacker enqueues background jobs with another user's resource ID.

---

# 200. SEARCH TEST

Search performed as User A must not reveal User B's private resources.

---

# 201. EXPORT TEST

Export filters populated with another tenant's or user's ID.

---

# 202. CACHE TEST

Request issued as User A followed by User B for the same logical cache path.

---

# 203. FINDING FORMAT

Each substantive finding must follow:

```text
ID:
Severity:
Category:
Confidence:
Status:

Attacker principal:
Attacker tenant:
Required existing privilege:

Method/Route/Operation:
Target resource:
Target owner:
Target tenant:

File/Class:
Function:
Authorization policy:
Relevant query:

Problem:

Evidence:

Authorization Flow:

T0:
T1:
T2:
T3:

Expected permission:

Actual permission:

Bypass technique:

Data exposed:

Action obtained:

Horizontal escalation:
YES / NO

Vertical escalation:
YES / NO

Cross-tenant:
YES / NO

Blast radius:

Root cause:

Recommended remediation:

Regression test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 204. SEVERITY

Use:

## P0 - CRITICAL

- ordinary or unauthenticated user acquires global admin capabilities
- cross-tenant unrestricted sensitive data access at scale
- authorization bypass enabling catastrophic financial or operational damage

## P1 - HIGH

- practical cross-user IDOR on sensitive data
- tenant isolation bypass
- vertical privilege escalation
- ordinary user can invoke critical admin functions
- bulk or export endpoint exposes substantial volumes of third-party data

## P2 - MEDIUM

- limited cross-user access
- constrained BFLA
- field-level privilege escalation with non-trivial preconditions
- limited metadata or private data exposure

## P3 - LOW

- minor authorization edge case
- limited existence leakage
- low-impact stale access

## P4 - HARDENING

- architectural or policy centralization improvements without confirmed bypasses

---

# 205. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

complete request -> policy -> query -> resource path confirms bypass.

MEDIUM:

strong code evidence, but runtime middleware or cache semantics are not fully verified.

LOW:

depends on unverified external policy or infrastructure layers.

---

# 206. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 207. CATEGORY

Use:

```text
IDOR
BOLA
BFLA
TENANT ISOLATION
FIELD-LEVEL AUTHORIZATION
ROLE ESCALATION
OWNERSHIP
NESTED RESOURCE
BULK
SEARCH/EXPORT
CACHE
BACKGROUND JOB
SERVICE ACCOUNT
SHARE CAPABILITY
```

---

# 208. EVIDENCE TIER

Use:

```text
A - reproduced
B - complete executable path
C - strong static evidence
D - partial/inferred
E - theoretical
```

---

# 209. FALSE-POSITIVE PREVENTION

Before filing P0/P1/P2 findings, inspect:

1. authentication
2. route middleware
3. policy/decorator
4. resource lookup
5. tenant filter
6. ownership check
7. database/query constraints
8. cache scope
9. alternate entry points
10. test suites

---

# 210. DO NOT REPORT NUMERIC IDS AS IDOR

An IDOR defect requires missing or bypassable authorization.

---

# 211. DO NOT RECOMMEND UUID AS A FIX FOR AUTHZ

UUIDs may hinder enumeration, but do not remedy broken access controls.

---

# 212. DO NOT AUTOMATICALLY REPORT 404 INSTEAD OF 403 AS A BUG

This may represent an intentional resource concealment strategy.

---

# 213. DO NOT RECOMMEND FULL RBAC IF AN OWNERSHIP CHECK SUFFICES

Adopt the simplest authorization model that fits domain requirements.

---

# 214. DO NOT AUTOMATICALLY RECOMMEND ABAC OR POLICY ENGINES

Complexity must be justified by product requirements.

---

# 215. DO NOT TRUST THE FRONTEND

Disabled buttons, hidden navigation items, and client route guards are not authorization controls.

---

# 216. DO NOT TRUST ROUTE NAMES

An `/admin` prefix is not a security control.

---

# 217. DO NOT MODIFY CODE

During the audit:

- do not modify roles
- do not alter the tenant model
- do not introduce policy engines
- do not reassign resource ownership
- do not block users

Complete the audit first.

---

# 218. OUTPUT - AUTHORIZATION_IDOR_AUDIT.md

Structure the final report as follows:

## 1. Executive Summary

- authorization model
- principals
- resources
- tenant model
- top privilege-boundary risks

## 2. Principal Inventory

## 3. Resource / Ownership Inventory

## 4. Authorization Matrix

## 5. Route Authorization Coverage

## 6. Horizontal IDOR / BOLA Audit

## 7. Vertical Privilege Escalation Audit

## 8. Tenant Isolation Audit

## 9. Nested Resource Authorization

## 10. Field-Level Authorization / Mass Assignment

## 11. Role Assignment / Privilege Ceiling Audit

## 12. Function-Level Authorization / Admin Audit

## 13. Search / List / Enumeration Audit

## 14. Export / Report Authorization

## 15. File / Object Storage Authorization

## 16. Bulk Operation Authorization

## 17. GraphQL Authorization

If relevant.

## 18. Background Job / Async Authorization

## 19. Webhook / External Identity Mapping

## 20. API Key / Service Account Scopes

## 21. Share Links / Capability Tokens

## 22. Cache Authorization Boundaries

## 23. State-Dependent Authorization

## 24. Impersonation / Support Authorization

## 25. Negative Test Coverage

## 26. Findings Summary

| ID | Severity | Category | Principal | Resource | Bypass | Confidence |
|---|---|---|---|---|---|---|

## 27. P0 Findings

## 28. P1 Findings

## 29. P2 Findings

## 30. P3 Findings

## 31. P4 Hardening

## 32. Things Done Well

## 33. Unknown / Not Verified

## 34. Authorization Remediation Roadmap

---

# 219. RESOURCE AUTHORIZATION MATRIX

| Resource | Read | Update | Delete | Admin action | Tenant scoped |
|---|---|---|---|---|---|

---

# 220. ROUTE MATRIX

| Method | Route | Auth | Policy | Resource check | Tenant check |
|---|---|---|---|---|---|

---

# 221. ROLE MATRIX

| Role | Scope | Can grant | Can revoke | Highest reachable privilege |
|---|---|---|---|---|

---

# 222. TENANT MATRIX

| Operation | Tenant authority source | Resource tenant source | Enforcement |
|---|---|---|---|

---

# 223. FIELD AUTH MATRIX

| Resource | Field | User | Manager | Tenant Admin | Global Admin |
|---|---|---|---|---|---|

---

# 224. SECOND PASS - ID SWAP ATTACK

For each sensitive endpoint:

```text
own valid resource ID
↓
replace with another user's valid ID
```

Test:

- GET
- PATCH
- DELETE
- action routes

---

# 225. SECOND PASS - CROSS-TENANT ATTACK

```text
Tenant A principal
↓
Tenant B resource
```

Repeat across:

- detail
- list
- search
- export
- file
- bulk
- job

---

# 226. SECOND PASS - NESTED MISMATCH

```text
authorized parent A
+
child B from parent C
```

---

# 227. SECOND PASS - FILTER OVERRIDE

If backend applies:

```text
tenantId=currentTenant
```

attempt passing:

```text
tenantId=otherTenant
```

and inspect merge precedence.

---

# 228. SECOND PASS - BODY OVERRIDE

Inject:

```json
{
  "ownerId": "attacker",
  "tenantId": "other",
  "role": "admin"
}
```

matching the project domain model.

---

# 229. SECOND PASS - FUNCTION ATTACK

An ordinary user directly triggers all:

- admin
- moderation
- billing
- support
- destructive

operations without relying on frontend UI flows.

---

# 230. SECOND PASS - ROLE CEILING

For every role management operation:

> Can the caller grant a permission or role they do not possess themselves?

---

# 231. SECOND PASS - BULK MIX

Bulk payload:

```text
resource A = own
resource B = own
resource C = victim
```

---

# 232. SECOND PASS - SEARCH / EXPORT

Probe with:

- owner filter
- tenant filter
- arbitrary user ID
- broad wildcard

---

# 233. SECOND PASS - CACHE

Prime cache as User A.

Invoke as User B.

---

# 234. SECOND PASS - FILE

Modify:

- file ID
- object key
- signed URL requested object

---

# 235. SECOND PASS - JOB

If users can enqueue background work:

replace resource IDs with victim IDs.

---

# 236. SECOND PASS - STALE PERMISSION

A user loses membership or role.

Test:

- existing session
- old JWT
- cached permissions
- queued jobs

---

# 237. SECOND PASS - ALTERNATE ROUTE

Retest the same business operation via:

- v1
- v2
- mobile
- admin
- GraphQL
- internal
- webhook
- import

where present.

---

# 238. SECOND PASS - SHARE CAPABILITY

Attempt using a share or read token to:

- write
- delete
- access other resources

---

# 239. SECOND PASS - IMPERSONATION

If support impersonation exists:

verify which critical actions remain accessible and how audit systems record the real actor.

---

# 240. FINAL QUALITY GATE

Before issuing the final report, verify:

- all principals and resources are documented
- IDOR is not inferred solely from numeric or sequential IDs
- every P0/P1 finding identifies a specific attacker principal
- authentication and authorization are strictly distinguished
- owner and tenant scopes are verified in actual query paths
- nested parent/child relations are checked
- list, search, and export paths are audited alongside detail routes
- body, query, and header IDs are treated as resource references
- server-mandated tenant/owner filters cannot be overridden via merge order
- field-level authz is audited
- role assignments include privilege ceiling analysis
- admin and function-level routes are tested directly without UI reliance
- bulk operations authorize every item
- background jobs do not bypass user or tenant boundaries
- files and presigned URLs enforce resource-level authorization
- caches do not cross principal or tenant boundaries
- stale token, session, and cache behaviors after permission revocation are analyzed
- capability and share tokens have rigorously bounded scopes
- 404 concealment is not mischaracterized as a defect
- UUIDs are not recommended as a substitute for authorization
- P4 architectural suggestions are isolated from verified bypasses

---

# FINAL RULE

Do not generate reports like:

> Use RBAC, UUIDs, and check permissions on the backend.

That is not an authorization audit.

I am looking for concrete defects such as:

```text
User A:
GET /invoices/100

↓
authenticated

User B:
GET /invoices/100

↓
same handler:
findById(100)

↓
no owner/tenant predicate
↓
B receives A's invoice
```

or:

```text
route:
/orgs/A/projects/B

↓
caller is member of org A
↓
authorization verifies org A
↓
project B is loaded globally by projectId
↓
B actually belongs to org C
↓
cross-tenant access
```

or:

```text
backend starts with:
where = {
  tenantId: currentTenant
}

then:
where = {
  ...where,
  ...req.query
}

↓
attacker sends:
?tenantId=victimTenant

↓
server-required tenant condition overwritten
↓
cross-tenant listing
```

or:

```text
PATCH /me

body:
{
  "displayName": "A",
  "role": "admin"
}

↓
request body passed directly to update layer
↓
ordinary user promotes self
```

or:

```text
bulk delete request contains 100 IDs
↓
handler verifies first resource belongs to caller
↓
remaining 99 IDs are deleted without per-item authorization
↓
attacker includes victim resources
```

or:

```text
User loses organization membership
↓
old authorization cache remains valid for 24 h
↓
user continues downloading private organization files
```

or:

```text
API key scope = read-only
↓
GET endpoints check scope
↓
legacy POST /v1/resource bypasses common scope middleware
↓
same key performs write
```

or:

```text
user starts export job
↓
request accepts arbitrary tenantId
↓
HTTP controller only verifies user is authenticated
↓
worker runs with system privileges
↓
export includes another tenant's data
```

These are the authorization vulnerabilities you must uncover.

Reason through:

- principal
- resource
- action
- owner
- tenant
- role
- permission
- entry point
- field
- stale access
- alternate routes

For every serious finding, you must be able to answer:

> Who is the attacker?

> What legitimate privileges do they already hold?

> Which resource are they targeting?

> Which ID, tenant, field, or route are they altering?

> Which authorization control was supposed to stop them?

> Where exactly is that control missing or bypassed?

> Do they achieve horizontal, vertical, or cross-tenant privilege escalation?

If the resource ownership or tenant model cannot be confirmed:

**AUTHORIZATION MODEL NOT VERIFIED.**

If only an architectural improvement is identified without a confirmed bypass:

**P4 - HARDENING.**

It is far better to identify 5 real IDOR/BOLA/BFLA defects with complete request-to-resource execution paths than to write 100 generic access control recommendations.

The objective is to produce a forensically precise Authorization & IDOR audit that translates directly into:

- negative authorization test
- ownership query fix
- tenant-scoping correction
- field-level whitelist
- role-ceiling guard
- bulk authorization fix
- cache isolation fix
- privilege-boundary hardening
