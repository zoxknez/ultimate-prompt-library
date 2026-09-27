---
id: UPL-IT-033
number: 33
slug: authorization-and-idor-hunter
title: Lov na propuste u autorizaciji i IDOR
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# LOV NA PROPUSTE U AUTORIZACIJI I IDOR

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i attacker-oriented analizu kompletne autorizacije u aplikaciji, sa posebnim fokusom na IDOR/BOLA, broken function-level authorization, cross-user i cross-tenant pristup, field-level privilege escalation i zaobilaženje ownership granica.

Glavni cilj:

> Utvrditi da li authenticated ili partially privileged korisnik može da pristupi, menja, briše ili pokrene akciju nad resource-om nad kojim nema pravo, samo promenom ID-a, tenant-a, parent resource-a, body field-a, role-a, route-a, API verzije, batch payload-a ili alternativnog entry point-a.

Ovo nije:

- authentication audit
- generički RBAC checklist
- samo pregled admin ruta
- pretpostavka da je numeric ID sam po sebi ranjivost
- pokušaj da se svaki endpoint prebaci na UUID
- automatski zahtev za ABAC
- automatski zahtev za policy engine
- samo frontend permission review

Fokus je na pitanju:

> Ko sme da uradi šta nad kojim tačno resource-om i gde se to stvarno enforce-uje?

Prioritet:

**cross-tenant isolation > horizontal privilege escalation > vertical privilege escalation > ownership enforcement > function-level authorization > field-level authorization > indirect resource access > hardening**

Bolje je pronaći 5 stvarnih authorization bypass-a nego napisati 100 generičkih saveta o roles i permissions.

---

# 1. UTVRDI AUTHORIZATION MODEL

Pre finding-a utvrdi:

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

# 2. NAPRAVI PRINCIPAL INVENTORY

Identifikuj:

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

Dodaj actual role/principal tipove iz projekta.

---

# 3. NAPRAVI RESOURCE INVENTORY

Za svaki osetljiv resource zabeleži:

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

Napravi:

| Principal | Resource | Read | Create | Update | Delete | Special |
|---|---|---|---|---|---|---|

Ne zasnivaj matricu samo na dokumentaciji.

Proveri actual code.

---

# 5. ROUTE INVENTORY

Za svaki osetljiv endpoint zabeleži:

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

Ako route ima:

```text
requireLogin()
```

to samo dokazuje identitet.

Ne dokazuje da caller sme resource.

---

# 7. IDOR / BOLA

Za svaki endpoint sa resource ID-em testiraj:

```text
valid own ID
↓
replace with another user's ID
```

---

# 8. READ IDOR

Primer:

```text
GET /documents/:id
```

Proveri da query uključuje:

- owner
- tenant
- permission

a ne samo ID.

---

# 9. UPDATE IDOR

Primer:

```text
PATCH /documents/:id
```

---

# 10. DELETE IDOR

Primer:

```text
DELETE /documents/:id
```

---

# 11. ACTION IDOR

Posebno:

```text
POST /orders/:id/cancel
POST /users/:id/reset-mfa
POST /files/:id/share
```

---

# 12. NUMERIC ID NIJE PROBLEM SAM PO SEBI

Sequential IDs mogu povećati discoverability, ali authorization mora biti stvarna zaštita.

Ne preporučuj UUID kao zamenu za authz.

---

# 13. UNGUESSABLE ID NIJE AUTHORIZATION

Čak i UUID treba proveru prava.

---

# 14. OWNERSHIP FILTER

High-value pattern:

```text
SELECT *
FROM resource
WHERE id = ?
AND owner_id = ?
```

ili equivalent policy enforcement.

---

# 15. FETCH THEN CHECK

Može biti ispravno:

```text
load resource
↓
check owner
```

ako check zaista pokriva sve paths.

---

# 16. CHECK AFTER SIDE EFFECT

Nije ispravno:

```text
update/delete
↓
then check owner
```

---

# 17. NESTED RESOURCE

Primer:

```text
/orgs/:orgId/projects/:projectId/tasks/:taskId
```

Proveri svaku relaciju.

---

# 18. PARENT/CHILD MISMATCH

Klasičan problem:

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

Path izgleda scoped, ali query nije.

To je visok signal.

---

# 20. CHILD LOOKUP

Proveri da child query sadrži expected parent/tenant scope.

---

# 21. GRANDCHILD

Ne pretpostavljaj da je proveravanje parent-a dovoljno ako deeper child može biti nevezan.

---

# 22. INDIRECT REFERENCE

Resource možda nije direktno u URL-u.

Primer:

```text
POST /export
{
  "documentId": "..."
}
```

Body ID zahteva isti authorization.

---

# 23. QUERY PARAM ID

Isto:

```text
?userId=...
```

---

# 24. HEADER-SCOPED RESOURCE

Custom headers tipa:

```text
X-Organization-Id
```

moraju biti autorizovani.

---

# 25. TENANT ISOLATION

Za multi-tenant sistem:

> Svaki access mora biti scoped na tenant authority, ne samo client-provided tenant ID.

---

# 26. TENANT FROM TOKEN

Ako token sadrži tenant:

proveri da nije stale ili client-forgeable.

---

# 27. TENANT SWITCHING

Ako user pripada više tenant-a:

mapiraj kako bira active tenant.

---

# 28. ACTIVE TENANT

Active tenant nije dokaz permission-a ako caller pošalje resource drugog tenant-a.

---

# 29. CLIENT-SUPPLIED TENANT

Pattern:

```text
tenantId = body.tenantId
```

bez membership validation-a.

---

# 30. TENANT QUERY MISSING

Pretraži repository metode koje traže samo po `id`, bez tenant scope-a.

---

# 31. SOFT-DELETE + TENANT

Global resource lookup možda može pronaći soft-deleted ili cross-tenant record koji normalna scoped repository metoda skriva.

---

# 32. CACHE

Authorization može biti ispravna u DB-u, ali cache key pogrešan.

Primer:

```text
resource:{id}
```

umesto:

```text
tenant:{tenantId}:resource:{id}
```

gde IDs nisu globalno unique.

---

# 33. RESPONSE CACHE

Personalized response ne sme biti shared među principals.

---

# 34. FILES

File authorization mora proveriti:

- metadata
- owner
- tenant
- storage key

---

# 35. DIRECT STORAGE URL

Ako knowledge of URL/object key daje pristup private file-u:

authorization boundary je slaba.

---

# 36. PRESIGNED URL

Endpoint koji generiše signed URL mora autorizovati requested object.

---

# 37. FILE IDOR

Promeni:

```text
fileId
```

na tuđ ID.

---

# 38. IMAGE/THUMBNAIL DERIVATIVES

Thumbnail/preview ruta može slučajno biti public i zaobići authorization original file-a.

---

# 39. EXPORT

Export endpoint je čest IDOR/BOLA surface.

---

# 40. REPORT

Report generator može primiti tenant/user/resource filter koji caller ne sme da bira proizvoljno.

---

# 41. SEARCH

Search results moraju poštovati authorization.

---

# 42. SEARCH SIDE CHANNEL

Čak i ako full resource nije dostupan, search može otkriti:

- name
- email
- title
- existence

---

# 43. AUTOCOMPLETE

Isto.

---

# 44. COUNTS

Endpoint može leakovati:

```text
count of records
```

za drugi tenant.

---

# 45. METADATA

Data exposure kroz list/search često nastaje iako detail endpoint ima dobar authz.

---

# 46. LIST ENDPOINT

Proveri da list query automatski scopu-je na caller/tenant.

---

# 47. FILTER TAMPERING

High-signal:

```text
GET /users?tenantId=other
```

---

# 48. OWNER FILTER IZ QUERY-JA

Caller ne treba da može da ukloni server-required owner filter.

---

# 49. FILTER MERGE ORDER

Klasičan bug:

```text
safeFilter = { tenantId: currentTenant }
finalFilter = { ...safeFilter, ...req.query }
```

Ako query sadrži `tenantId`, safe filter može biti overwritten.

---

# 50. SUPPORTED FILTER WHITELIST

Ne merge-uj arbitrary request object u DB where clause.

---

# 51. BODY MERGE

Isto za update/create.

---

# 52. MASS ASSIGNMENT

Caller može imati pravo da update-uje resource, ali ne sva polja.

---

# 53. FIELD-LEVEL AUTHZ

Mapiraj privileged fields:

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

Primer:

```text
PATCH /me
```

nije automatski bezbedan ako body prima:

```text
role
```

---

# 55. CREATE-ON-BEHALF

Ko sme da kreira resource za drugog korisnika?

---

# 56. `userId` U BODY-JU

Ako običan user može poslati:

```json
{
  "userId": "victim"
}
```

proveri semantics.

---

# 57. SERVER-SIDE OWNER ASSIGNMENT

Često owner treba uzeti iz authenticated principal-a.

---

# 58. ADMIN CREATE-ON-BEHALF

Može biti legitimno, ali mora biti explicit privileged path.

---

# 59. OWNERSHIP TRANSFER

Posebno audituj:

```text
change owner
```

---

# 60. TRANSFER TO ATTACKER

Ordinary editor možda ne sme sebi prebaciti ownership.

---

# 61. TRANSFER OUT OF TENANT

Resource možda ne sme menjati tenant.

---

# 62. LAST OWNER

Organization/project možda mora imati bar jednog owner-a.

To je business logic, ali utiče na privilege boundary.

---

# 63. ROLE ASSIGNMENT

Ko sme dodeljivati koje role?

---

# 64. PRIVILEGE CEILING

Manager ne bi trebalo da može dodeliti role veće od svoje ako product to ne dozvoljava.

---

# 65. SELF-PROMOTION

Testiraj:

```text
caller changes own role
```

---

# 66. PEER PROMOTION

Može user sa srednjom rolom da napravi drugog global admin-a?

---

# 67. ROLE DOWNGRADE

Može li attacker demote-ovati jedinu osobu koja bi mogla da mu oduzme prava?

---

# 68. ROLE CHECK

Pattern:

```text
if user.role == "admin"
```

može biti validan.

Ali proveri:

- stale claims
- multiple role types
- tenant-local vs global admin

---

# 69. GLOBAL ADMIN VS TENANT ADMIN

Jedna od najvažnijih granica.

---

# 70. TENANT ADMIN

Ne sme po default-u imati global system access.

---

# 71. ROLE NAME COLLISION

`admin` u tenant-u nije nužno `admin` globalno.

---

# 72. BFLA

Broken Function Level Authorization:

ordinary user može pozvati privileged endpoint.

---

# 73. ADMIN ROUTE

Path name nije control:

```text
/admin/users
```

mora imati actual authorization.

---

# 74. HIDDEN FRONTEND BUTTON

Sakrivanje UI button-a nije authz.

---

# 75. CLIENT GUARD

Frontend route guard nije server authorization.

---

# 76. INTERNAL FRONTEND API

Endpoint koji frontend "nikada ne zove" i dalje je attack surface ako reachable.

---

# 77. METHOD-LEVEL AUTHZ

GET može biti protected, PATCH na istoj ruti slučajno ne.

---

# 78. ROUTE ALIAS

Jedan handler može biti mountovan na više ruta sa različitim middleware chain-om.

---

# 79. API VERSION

V1 može imati slabiji authz od V2.

---

# 80. MOBILE LEGACY

Stari mobile endpoint često ostane otvoren.

---

# 81. GRAPHQL

Ako postoji:

authorization mora biti proverena po resolver/resource-u.

---

# 82. GRAPHQL NODE LOOKUP

Generic:

```text
node(id)
```

može postati centralni IDOR surface.

---

# 83. GRAPHQL NESTED FIELD

User možda sme parent object, ali ne sensitive nested relation.

---

# 84. FIELD-LEVEL GRAPHQL AUTH

Sensitive field:

- email
- salary
- billing
- secret metadata

može zahtevati poseban policy.

---

# 85. GraphQL MUTATION

Mutation authorization odvojeno od query-ja.

---

# 86. ALIAS/BATCH

Jedan GraphQL request može pokušati mnogo resource IDs odjednom.

---

# 87. BULK REST

Bulk endpoint mora autorizovati svaki item.

---

# 88. ONE BAD ITEM

Pattern:

```text
authorize request based on first item
↓
process all item IDs
```

Critical BOLA.

---

# 89. BULK DELETE

Posebno opasan.

---

# 90. IMPORT

Import može kreirati/update-ovati resources za druge users/tenant-e.

---

# 91. CSV USER ID

Ako imported row sadrži owner/tenant ID:

proveri permission.

---

# 92. BATCH JOB

Background worker ne dobija user auth middleware automatski.

---

# 93. USER-INITIATED JOB

Ako job kasnije izvršava privileged action:

mora nositi validan authorization context ili re-check model.

---

# 94. TIME-OF-CHECK VS EXECUTION

User može izgubiti permission između enqueue i execution-a.

Pitaj da li job treba:

- koristiti original grant
- proveriti current permission

Domain/product odlučuje.

---

# 95. SYSTEM PRINCIPAL

Worker često ima system privilege.

Zato mora ograničiti resource iz payload-a.

---

# 96. JOB IDOR

Attacker kreira job sa tuđim resource ID-em.

---

# 97. WEBHOOK

Provider-authenticated webhook nije automatski authorized za svaki local tenant/resource.

---

# 98. EXTERNAL ID MAPPING

Webhook external object mora mapirati na pravi tenant.

---

# 99. SERVICE-TO-SERVICE

Internal service account mora imati scope.

---

# 100. SERVICE TOKEN

Ne tretiraj svaki internal token kao global admin bez razloga.

---

# 101. API KEY SCOPES

Ako API keys postoje:

proveri route/resource enforcement.

---

# 102. READ-ONLY KEY

Ne sme moći write kroz alternativnu rutu.

---

# 103. SCOPES U TOKENU

Stale scope claim može trajati do expiry-ja.

---

# 104. REVOKED KEY

Svaki authentication path mora poštovati revocation.

---

# 105. OBJECT CAPABILITY

Signed URL/token može predstavljati authorization capability.

Proveri:

- resource scope
- operation
- expiry
- single use gde relevantno

---

# 106. SHARE LINK

Public/share token može legitimno zaobići normalnu user ownership proveru.

To je poseban authorization model.

---

# 107. SHARE TOKEN SCOPE

Token za:

```text
read document A
```

ne sme omogućiti:

```text
edit document A
```

ili read B.

---

# 108. TOKEN ENUMERATION

Share token mora biti dovoljno nepredvidiv ako possession = authorization.

---

# 109. SHARE REVOKE

Revoked share link treba prestati da radi prema product semantics.

---

# 110. INVITATION

Invite token može dati membership role.

---

# 111. INVITE ROLE TAMPERING

Ako token je za `member`, caller ne sme body field-om dobiti `admin`.

---

# 112. INVITE TENANT

Invite mora biti bound na tačnu organization/tenant.

---

# 113. ACCESS THROUGH RELATION

User možda ima access jer je:

- owner
- member
- collaborator
- viewer

Proveri sve relation-based paths.

---

# 114. REVOKED MEMBERSHIP

Cache/session ne sme dugo zadržati access ako security model zahteva immediate revocation.

---

# 115. GROUP MEMBERSHIP

Nested groups mogu dati transitive permission.

Proveri cycle/precedence samo ako model to podržava.

---

# 116. ACL

Ako resource ima ACL:

mapiraj:

- allow
- deny
- inherited

---

# 117. DENY PRECEDENCE

Ne izmišljaj pravilo.

Utvrdi actual intended semantics.

---

# 118. PUBLIC RESOURCE

Public visibility može biti legitiman bypass ownership-a.

---

# 119. PUBLIC -> PRIVATE TRANSITION

Cache/share URLs moraju prestati da izlažu resource prema intended modelu.

---

# 120. UNLISTED

Unlisted nije isto što i private.

---

# 121. AUTHZ + SOFT DELETE

User možda više ne sme pristupiti deleted resource-u.

Admin/recovery route može.

---

# 122. RESTORE

Ko sme restore?

---

# 123. ARCHIVED RESOURCE

Archived možda read-only.

Proveri mutations.

---

# 124. STATE-DEPENDENT AUTHZ

Permission može zavisiti od resource state-a.

Primer:

```text
author can edit DRAFT
cannot edit APPROVED
```

---

# 125. STATUS TAMPERING

Ako caller sam promeni status, možda time otključa action.

---

# 126. WORKFLOW AUTHZ

Approver možda sme approve, ali ne svoj submission.

---

# 127. SELF-APPROVAL

Ako business rule zabranjuje, authorization/business boundary.

---

# 128. FOUR-EYES PRINCIPLE

Ako requires two distinct approvers:

jedan user ne sme zaobići preko više sessions.

---

# 129. RESOURCE CREATOR VS CURRENT OWNER

Authorization treba koristiti pravi concept.

---

# 130. HISTORICAL OWNER

Stari owner možda ne sme pristup posle transfera.

---

# 131. DELEGATION

Ako user može delegirati permission:

mapiraj duration/scope.

---

# 132. REVOKED DELEGATION

Cache token mora poštovati revocation prema modelu.

---

# 133. IMPERSONATION

Support/admin impersonation je posebna authorization granica.

---

# 134. ACTOR VS SUBJECT

Tokom impersonation-a treba znati:

```text
real actor
impersonated subject
```

---

# 135. IMPERSONATION RESTRICTIONS

Neke critical akcije možda ne smeju biti dostupne tokom impersonation-a.

Product/security odluka.

---

# 136. ADMIN EXPORT

Global data export je high-risk privileged function.

---

# 137. AUDIT LOG

Ko sme da čita audit logs?

---

# 138. AUDIT LOG DELETE

Ordinary admin možda ne sme brisati evidence.

---

# 139. BILLING

Tenant member možda može read project, ali ne billing.

---

# 140. PAYMENT METHODS

High-value field/resource authorization.

---

# 141. SUBSCRIPTION PLAN

Ko sme menjati plan?

---

# 142. INVOICE

Invoice IDOR često izlaže PII/financial data.

---

# 143. ADDRESS / PII

Profile access može imati field-level permissions.

---

# 144. PASSWORD HASH / AUTH DATA

Nikakav običan read resource endpoint ne treba to da vraća.

To je i serialization issue.

---

# 145. INTERNAL NOTES

Support/admin-only field.

---

# 146. MODERATION DATA

Moderator možda vidi abuse reports, ordinary user ne.

---

# 147. HIDDEN COMMENTS / DRAFTS

Visibility rules su authorization.

---

# 148. DATA EXPORT / GDPR-LIKE EXPORT

User treba dobiti samo svoje data prema application semantics.

Ne pravi pravni zaključak, proveri technical scope.

---

# 149. DELETE ACCOUNT

Caller treba moći obrisati svoj account ili privileged path prema product-u, ne arbitrary user ID.

---

# 150. ADMIN DELETE USER

High-risk function-level auth.

---

# 151. RESET MFA ZA DRUGOG USER-A

High-risk support/admin operation.

---

# 152. FORCE PASSWORD RESET

Isto.

---

# 153. CREATE API KEY ZA DRUGOG USER-A

Critical.

---

# 154. VIEW SECRET

Ko sme read full API key/credential?

---

# 155. ROTATE SECRET

High privilege.

---

# 156. ENVIRONMENT / PROJECT SCOPING

Ako SaaS ima:

```text
organization
project
environment
```

proveri sve tri granice.

---

# 157. PROJECT MEMBER

Ne mora automatski imati production environment access.

---

# 158. DEV VS PROD PERMISSIONS

High-value distinction.

---

# 159. RESOURCE ID COLLISION ACROSS ENVIRONMENTS

Composite lookup mora uključiti project/environment context.

---

# 160. URL SLUG

Slug nije authorization.

---

# 161. SLUG CHANGE

Old slug redirect ne sme bypass-ovati private state.

---

# 162. ALTERNATE IDENTIFIER

Endpoint možda prihvata i ID i slug.

Oba paths moraju imati isti authz.

---

# 163. CASE VARIANT ROUTE

Route normalization/proxy mismatch može ponekad napraviti alternate middleware path.

Proveri actual framework.

---

# 164. TRAILING SLASH

Ne prijavljuj bez dokaza, ali testiraj ako proxy/app auth routing razlikuju canonical paths.

---

# 165. METHOD OVERRIDE

Ako app podržava:

```text
X-HTTP-Method-Override
_method
```

proveri auth middleware semantics.

---

# 166. HEAD

Framework može automatski mapirati HEAD na GET.

Sensitive body nije vraćen, ali side effects/data metadata mogu postojati.

---

# 167. OPTIONS

Ne treba davati privileged resource content.

---

# 168. DEBUG/ADMIN ALIAS

Legacy debug action može pozivati isti service bez policy-ja.

---

# 169. DIRECT SERVICE ROUTE

Internal route može zaobići public controller authorization.

---

# 170. FUNCTION REUSE

Ako service metoda pretpostavlja caller je već autorizovan:

svaki call-site mora to garantovati.

---

# 171. SECURITY AT WRONG LAYER

Ako 12 controllers svaki ručno proveravaju ownership:

jedan novi controller može zaboraviti.

To je architecture risk, ali severity prema realnom bypass-u.

---

# 172. CENTRALIZED POLICY

Može smanjiti drift.

Ne uvodi full policy engine bez potrebe.

---

# 173. DEFAULT DENY

Security-sensitive authorization architecture idealno treba da ne daje pristup zato što je check zaboravljen.

Proceni framework/model.

---

# 174. POLICY COVERAGE

Ako decorators/annotations postoje:

traži endpoints bez njih.

---

# 175. ANNOTATION != ENFORCEMENT

Proveri da decorator zaista aktivira guard.

---

# 176. ORDER OF MIDDLEWARE

Authz middleware može biti mountovan posle handler-a ili samo na neke methods.

---

# 177. ERROR HANDLING

Authorization failure treba fail-closed.

---

# 178. POLICY SERVICE DOWN

Ne sme default allow.

---

# 179. CACHE ERROR

Permission cache failure ne sme dati privileged access ako cache je authz authority.

---

# 180. UNKNOWN ROLE

Default ne sme biti highest privilege.

---

# 181. UNKNOWN PERMISSION

Fail closed gde je security-sensitive.

---

# 182. INCOMPLETE PRINCIPAL

Missing tenant/user context ne sme pasti na global access.

---

# 183. TESTING

Mapiraj negative authorization coverage.

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

Payload sadrži:

```text
own
own
other-user
```

---

# 192. NESTED MISMATCH TEST

Valid parent A + child B koji pripada parent C.

---

# 193. FILTER OVERRIDE TEST

Pokušaj override server tenant/owner filter-a.

---

# 194. HIDDEN FIELD TEST

---

# 195. ALT ROUTE TEST

V1/V2/admin/internal alias.

---

# 196. SHARE TOKEN TEST

Read token protiv write action-a.

---

# 197. REVOKE TEST

Permission/membership uklonjena, old session/token/cache.

---

# 198. STATE CHANGE TEST

Resource menja:

```text
DRAFT -> APPROVED
```

pa isti user pokuša ponovni edit.

---

# 199. JOB TEST

Attacker enqueue job sa tuđim resource ID-em.

---

# 200. SEARCH TEST

Search kao User A ne sme otkriti User B private resources.

---

# 201. EXPORT TEST

Export filter sa tuđim tenant/user ID-em.

---

# 202. CACHE TEST

User A request pa User B request za isti logical cache path.

---

# 203. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

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

Koristi:

## P0 - CRITICAL

- ordinary/unauthenticated user dobija global admin capability
- cross-tenant unrestricted sensitive data access at scale
- authorization bypass omogućava catastrophic financial/system action

## P1 - HIGH

- practical cross-user IDOR nad sensitive data
- tenant isolation bypass
- vertical privilege escalation
- ordinary user može pozvati critical admin function
- bulk/export endpoint izlaže velike količine tuđih podataka

## P2 - MEDIUM

- limited cross-user access
- constrained BFLA
- field-level privilege issue sa značajnim preconditions
- limited metadata/private data leak

## P3 - LOW

- mali authorization edge case
- limited existence leak
- low-impact stale access

## P4 - HARDENING

- architecture/policy centralization bez confirmed bypass-a

---

# 205. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

complete request -> policy -> query -> resource path potvrđuje bypass.

MEDIUM:

jak code evidence, ali runtime middleware/cache semantics nisu potpuno potvrđene.

LOW:

zavisi od nepoznatog external policy/infrastructure sloja.

---

# 206. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 207. CATEGORY

Koristi:

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

Koristi:

```text
A - reproduced
B - complete executable path
C - strong static evidence
D - partial/inferred
E - theoretical
```

---

# 209. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. authentication
2. route middleware
3. policy/decorator
4. resource lookup
5. tenant filter
6. ownership check
7. DB/query constraints
8. cache scope
9. alternate entry points
10. tests

---

# 210. NE PRIJAVLJUJ NUMERIC ID KAO IDOR

IDOR zahteva missing/bypassable authorization.

---

# 211. NE PREPORUČUJ UUID KAO FIX ZA AUTHZ

UUID može otežati enumeration, ali ne rešava broken access control.

---

# 212. NE PRIJAVLJUJ 404 UMESTO 403 KAO BUG AUTOMATSKI

Može biti namerna resource concealment strategija.

---

# 213. NE PREPORUČUJ FULL RBAC AKO OWNERSHIP CHECK DOVOLJAN

Koristi najjednostavniji model koji odgovara domain-u.

---

# 214. NE PREPORUČUJ ABAC/POLICY ENGINE AUTOMATSKI

Complexity mora biti opravdana.

---

# 215. NE VERUJ FRONTEND-U

Disabled button, hidden menu i route guard nisu authorization controls.

---

# 216. NE VERUJ ROUTE NAZIVU

`/admin` nije security control.

---

# 217. NE MENJAJ KOD

Tokom audita:

- ne menja roles
- ne menja tenant model
- ne dodaje policy engine
- ne menja resource ownership
- ne blokira users

Prvo završi audit.

---

# 218. OUTPUT - AUTHORIZATION_IDOR_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- authorization model
- principals
- resources
- tenant model
- najveći privilege-boundary problemi

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

Ako relevantno.

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

Za svaki sensitive endpoint:

```text
own valid resource ID
↓
replace with another user's valid ID
```

Testiraj:

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

Ponovi kroz:

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

Ako backend dodaje:

```text
tenantId=currentTenant
```

pokušaj poslati svoj:

```text
tenantId=otherTenant
```

i proveri merge precedence.

---

# 228. SECOND PASS - BODY OVERRIDE

Dodaj:

```json
{
  "ownerId": "attacker",
  "tenantId": "other",
  "role": "admin"
}
```

prema actual modelu.

---

# 229. SECOND PASS - FUNCTION ATTACK

Ordinary user poziva sve:

- admin
- moderation
- billing
- support
- destructive

operacije direktno, bez UI-ja.

---

# 230. SECOND PASS - ROLE CEILING

Za svaku role management operaciju:

> Može li caller dodeliti permission/role koji sam nema?

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

Pokušaj:

- owner filter
- tenant filter
- arbitrary user ID
- broad wildcard

---

# 233. SECOND PASS - CACHE

Warm cache kao User A.

Pozovi kao User B.

---

# 234. SECOND PASS - FILE

Promeni:

- file ID
- object key
- signed URL requested object

---

# 235. SECOND PASS - JOB

Ako user može enqueue work:

zameni resource ID tuđim.

---

# 236. SECOND PASS - STALE PERMISSION

User izgubi membership/role.

Pokušaj:

- existing session
- old JWT
- cached permission
- queued job

---

# 237. SECOND PASS - ALTERNATE ROUTE

Ponovi isti business action kroz:

- v1
- v2
- mobile
- admin
- GraphQL
- internal
- webhook
- import

gde postoje.

---

# 238. SECOND PASS - SHARE CAPABILITY

Share/read token pokušaj koristiti za:

- write
- delete
- other resource

---

# 239. SECOND PASS - IMPERSONATION

Ako postoji support impersonation:

proveri koje critical akcije ostaju dostupne i kako audit beleži real actor-a.

---

# 240. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svi principals i resources su mapirani
- IDOR nije zaključena samo iz numeric/sequential ID-a
- svaki P0/P1 ima konkretan attacker principal
- authentication i authorization nisu pomešani
- owner i tenant scope su provereni u stvarnom query path-u
- nested parent/child relacija je proverena
- list/search/export nisu zanemareni u korist detail ruta
- body/query/header IDs su tretirani kao resource references
- server-required tenant/owner filter ne može biti overridden merge redosledom
- field-level authz je proverena
- role assignment ima privilege-ceiling analizu
- admin/function-level routes su pozvane bez oslanjanja na UI
- bulk operacije autorizuju svaki item
- background jobs ne zaobilaze user/tenant granice
- files/presigned URLs imaju resource-level authorization
- cache ne prelazi principal/tenant boundary
- stale token/session/cache behavior posle permission revoke-a je analiziran
- share/capability token ima tačno definisan scope
- 404 concealment nije pogrešno prijavljen kao bug
- UUID nije preporučen kao zamena za authorization
- P4 architecture improvements su odvojeni od stvarnih bypass-a

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite RBAC, UUID i proveravajte permission-e na backend-u.

To nije authorization audit.

Tražim probleme poput:

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

ili:

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

ili:

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

ili:

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

ili:

```text
bulk delete request contains 100 IDs
↓
handler verifies first resource belongs to caller
↓
remaining 99 IDs are deleted without per-item authorization
↓
attacker includes victim resources
```

ili:

```text
User loses organization membership
↓
old authorization cache remains valid for 24 h
↓
user continues downloading private organization files
```

ili:

```text
API key scope = read-only
↓
GET endpoints check scope
↓
legacy POST /v1/resource bypasses common scope middleware
↓
same key performs write
```

ili:

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

To su authorization problemi koje treba da pronađeš.

Razmišljaj kroz:

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

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Ko je attacker?

> Koje legitimne privilegije već ima?

> Koji resource napada?

> Koji ID, tenant, field ili route menja?

> Koja authorization kontrola bi trebalo da ga zaustavi?

> Gde ona tačno nedostaje ili se zaobilazi?

> Da li dobija horizontalnu, vertikalnu ili cross-tenant eskalaciju?

Ako resource ownership ili tenant model nije potvrđen:

**AUTHORIZATION MODEL NOT VERIFIED.**

Ako postoji samo arhitektonsko poboljšanje bez stvarnog bypass-a:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih IDOR/BOLA/BFLA problema sa kompletnim request-to-resource putem nego napisati 100 generičkih access-control preporuka.

Cilj je dobiti forenzički precizan Authorization & IDOR audit koji se može direktno pretvoriti u:

- negative authorization test
- ownership query fix
- tenant-scoping correction
- field-level whitelist
- role-ceiling guard
- bulk authorization fix
- cache isolation fix
- privilege-boundary hardening
