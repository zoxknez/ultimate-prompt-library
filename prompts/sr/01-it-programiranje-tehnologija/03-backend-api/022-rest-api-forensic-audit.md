---
id: UPL-IT-022
number: 22
slug: rest-api-forensic-audit
title: Forenzički audit REST API-ja
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# FORENZIČKI AUDIT REST API-JA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog REST API-ja.

Glavni cilj:

> Utvrditi da li API ima dosledne i bezbedne ugovore, pravilnu HTTP semantiku, jasnu validaciju, pouzdanu autentikaciju/autorizaciju, deterministične error modele, idempotentno ponašanje tamo gde je potrebno, stabilno versioning ponašanje i dobru kompatibilnost sa realnim klijentima i production uslovima.

Ovo nije:

- generički REST best practices checklist
- automatsko insistiranje na "REST purity"
- pokušaj da se svaka ruta pretvori u textbook resource model
- insistiranje da sve mora biti `GET/POST/PUT/PATCH/DELETE` u savršenom akademskom obliku
- automatska zabrana RPC-like endpoint-a
- površna provera HTTP status kodova
- samo OpenAPI review
- samo security audit

Fokus je na stvarnom API ponašanju.

Prioritet:

**correctness > authorization > data integrity > contract stability > idempotency > error semantics > compatibility > elegance**

Bolje je pronaći 6 stvarnih API problema nego napisati 100 generičkih REST preporuka.

---

# 1. UTVRDI API STACK

Pre nalaza utvrdi:

- framework
- routing sistem
- middleware
- validation library
- auth
- serialization
- ORM/repository
- OpenAPI/Swagger
- API versioning
- rate limiting
- pagination
- caching
- reverse proxy/API gateway
- tests

---

# 2. NAPRAVI ROUTE INVENTORY

Pronađi sve REST rute.

Za svaku zabeleži:

```text
Method:
Path:
Auth:
Authorization:
Request schema:
Response schema:
Status codes:
Side effects:
Idempotent:
Pagination:
Rate limit:
```

---

# 3. FINAL ROUTE TABLE

Napravi:

| Method | Route | Auth | Authorization | Validation | Success | Main errors |
|---|---|---|---|---|---|---|

Ne oslanjaj se samo na dokumentaciju.

Kod je source of truth.

---

# 4. PATH SEMANTICS

Proveri da path jasno predstavlja:

- resource
- collection
- subresource
- operation

Primeri:

```text
/users
/users/:id
/users/:id/sessions
```

Ali RPC-like ruta nije automatski bug.

Primer:

```text
/orders/:id/cancel
```

može biti potpuno legitimna ako predstavlja business command.

---

# 5. RESOURCE IDENTITY

Za svaki resource utvrdi:

- primary ID
- public ID
- slug
- owner/tenant

Pitaj:

> Da li ruta stabilno identifikuje jedan isti logical resource?

---

# 6. GET SEMANTICS

GET ne bi trebalo da ima business side effect.

Traži:

```text
GET /delete-user
GET /mark-paid
GET /send-email
```

Ako GET menja state:

ozbiljan semantics/caching/security problem.

---

# 7. SAFE METHOD

Ako GET/HEAD mogu menjati durable state, browser, crawler, cache ili prefetch može neočekivano pokrenuti akciju.

---

# 8. POST

POST je legitimno za:

- create
- command
- non-idempotent operation

Ne forsiraj PUT gde business semantics ne odgovara.

---

# 9. PUT

Ako se koristi PUT, proveri da semantics predstavljaju replacement ili idempotent update prema API contract-u.

---

# 10. PATCH

Proveri:

- partial update semantics
- omitted field
- explicit null
- field deletion

---

# 11. MISSING VS NULL

Critical contract pitanje:

```json
{}
```

nije isto što i:

```json
{"name": null}
```

ako API dozvoljava nullable field.

---

# 12. DELETE

Proveri ponašanje za:

- existing resource
- already deleted
- missing resource
- soft delete
- dependent resources

---

# 13. DELETE IDEMPOTENCY

Ponovljeni DELETE treba imati jasno ponašanje.

Ne mora svaki put vraćati isti status kod, ali finalni resource state treba biti stabilan.

---

# 14. HTTP STATUS KODOVI

Mapiraj stvarnu upotrebu:

- 200
- 201
- 202
- 204
- 400
- 401
- 403
- 404
- 409
- 422
- 429
- 500
- 502/503/504

Ne zahtevaj jedan "sveti" status kod gde je više modela legitimno.

---

# 15. 200 ZA ERROR

Ako endpoint vraća:

```json
{
  "success": false,
  "error": "..."
}
```

sa 200 za normalnu failure semantiku, proveri client impact.

---

# 16. 201 CREATED

Za create endpoint proveri da li response jasno identifikuje kreirani resource.

---

# 17. 202 ACCEPTED

Ako API vraća 202:

mora biti jasno da posao još nije završen.

Proveri kako client saznaje finalni rezultat.

---

# 18. 204

204 ne treba da ima meaningful response body.

Proveri actual framework behavior.

---

# 19. 400 VS 422

Ne troši audit na akademsku raspravu ako je API dosledan.

Bitnija je stabilna distinction između:

- malformed request
- validation/business rejection

---

# 20. 401 VS 403

Proveri:

- 401 za missing/invalid authentication
- 403 za authenticated principal bez prava

gde to odgovara auth modelu.

---

# 21. RESOURCE EXISTENCE LEAK

Ponekad API namerno koristi 404 i za unauthorized resource da ne otkriva postojanje.

Ne menjaj to u 403 naslepo.

---

# 22. 404

Proveri da endpoint ne vraća 200 + null za missing resource ako client očekuje normalan resource.

Ali dokumentovan nullable lookup može biti validan.

---

# 23. 409 CONFLICT

Relevantno za:

- duplicate
- version conflict
- invalid state transition

Proveri doslednost.

---

# 24. 429

Ako postoji rate limiting, proveri response contract i eventualni Retry-After.

---

# 25. 5XX

Server bug/upstream failure ne treba predstavljati kao user validation error.

---

# 26. RESPONSE BODY

Za svaki endpoint proveri stabilnost:

- field names
- types
- nullability
- nested structures

---

# 27. RESPONSE ENVELOPE

Ako API koristi:

```json
{"data": ...}
```

proveri doslednost.

Ne forsiraj envelope ako API ga nema i clients rade dobro.

---

# 28. METADATA

Pagination/meta treba imati stabilan shape.

---

# 29. ERROR MODEL

Idealno svaki client-visible error ima stabilan machine-readable code.

Primer:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "..."
  }
}
```

Ne mora biti baš ovaj oblik.

---

# 30. ERROR MESSAGE KAO CONTRACT

Ako client logic radi:

```text
if message == "User not found"
```

to je fragile contract.

---

# 31. ERROR CODE

Machine-readable code treba biti stabilniji od human-readable poruke.

---

# 32. LOCALIZATION

Backend error message ne treba nužno biti lokalizovan ako client koristi error codes i prevodi UI.

Proveri stvarnu architecture-u.

---

# 33. STACK TRACE LEAK

Production response ne sme izlagati:

- stack trace
- SQL
- filesystem path
- internal service details
- secrets

---

# 34. VALIDATION

Mapiraj sve inpute:

- path params
- query params
- headers
- body
- multipart

---

# 35. PATH PARAM VALIDATION

Ako endpoint očekuje UUID/int:

proveri da invalid format bude deterministički odbijen.

---

# 36. QUERY PARAM VALIDATION

Posebno:

- sort
- filter
- page
- limit
- date range
- search

---

# 37. BODY VALIDATION

Proveri:

- required
- optional
- nullable
- enum
- min/max
- length
- nested arrays
- unknown fields

---

# 38. UNKNOWN FIELDS

Odluči da li API:

- ignoriše
- odbija

nepoznata polja.

Oba modela mogu biti validna.

Bitna je bezbednost i stabilnost.

---

# 39. MASS ASSIGNMENT

Critical:

```text
request body
↓
ORM update
```

bez whitelist-a.

Traži polja poput:

- role
- ownerId
- isAdmin
- status
- balance

---

# 40. BUSINESS VALIDATION

Schema validacija ne rešava:

```text
start < end
amount <= allowed
state transition allowed
```

---

# 41. DUPLICATE VALIDATION

Ako isti business rule postoji u više endpoint-a:

proveri drift.

---

# 42. AUTHENTICATION INVENTORY

Za svaku rutu označi:

```text
PUBLIC
AUTHENTICATED
ADMIN
SERVICE-TO-SERVICE
WEBHOOK
```

---

# 43. MISSING AUTH

Traži critical rutu koja je slučajno public.

---

# 44. AUTH MIDDLEWARE COVERAGE

Ne pretpostavljaj da global middleware pokriva sve route group-e.

---

# 45. AUTHORIZATION

Za svaki resource endpoint pitaj:

> Da li authenticated user ima pravo baš nad OVIM resource-om?

---

# 46. IDOR

Klasičan flow:

```text
GET /documents/123
```

User mora imati authorization za document 123.

Ne samo valid session.

---

# 47. UPDATE IDOR

Posebno:

```text
PATCH /users/:id
```

Da li user može promeniti tuđi ID?

---

# 48. DELETE IDOR

Isto za delete.

---

# 49. NESTED RESOURCE AUTH

Primer:

```text
/projects/:projectId/tasks/:taskId
```

Proveri da task zaista pripada project-u i user ima pravo na project/task.

---

# 50. PARENT/CHILD MISMATCH

Endpoint može loadovati task samo po `taskId`, ignorišući `projectId`.

Tada ruta izgleda scoped, ali authorization nije.

---

# 51. TENANT BOUNDARY

Ako postoji multi-tenancy:

svaki query/write/cache mora koristiti tenant context.

---

# 52. TENANT ID IZ REQUEST-A

Client-provided tenant ID nije authority.

Mora biti povezan sa authenticated principal-om.

---

# 53. ADMIN ROUTES

Proveri da nije dovoljno samo:

```text
/auth/admin/*
```

u nazivu path-a.

Stvarna role/capability provera mora postojati.

---

# 54. ROLE VS PERMISSION

Ako sistem ima granularity:

- role
- permission
- ownership

proveri da endpoint koristi pravi nivo.

---

# 55. FIELD-LEVEL AUTHORIZATION

User možda sme da edit-uje resource, ali ne i sva polja.

Primer:

- name yes
- ownerId no
- billingStatus no

---

# 56. RESPONSE FIELD AUTHORIZATION

Isti resource može imati sensitive field koji nije za svakog caller-a.

---

# 57. AUTHORIZED WRITE, UNAUTHORIZED READ

Proveri asimetrične edge case-ove.

---

# 58. API VERSIONING

Utvrdi da li postoji:

- path version
- header version
- media type
- implicit unversioned API

---

# 59. VERSIONING NIJE OBAVEZAN PO DEFAULT-U

Mali internal API može legitimno biti unversioned.

Severity zavisi od external client compatibility zahteva.

---

# 60. BREAKING CHANGE

Identifikuj:

- field rename
- type change
- enum removal
- endpoint removal
- semantics change

---

# 61. ADDITIVE CHANGE

Dodavanje optional response field-a je često backward-compatible.

Ali strict client parser može menjati situaciju.

---

# 62. ENUM EVOLUTION

Novi enum value može slomiti client koji očekuje exhaustive list.

---

# 63. REQUIRED REQUEST FIELD

Dodavanje novog required polja može slomiti stare client-e.

---

# 64. OLD CLIENT

Za mobile/public API pitaj:

> Da li backend i dalje radi sa clientom starim nekoliko meseci?

---

# 65. DEPRECATION

Ako se endpoint povlači:

proveri plan i usage.

---

# 66. PAGINATION

Za collection endpoint utvrdi:

- offset
- cursor
- keyset
- none

---

# 67. UNBOUNDED COLLECTION

Ako dataset može rasti, endpoint bez limita može biti production risk.

---

# 68. LIMIT BOUNDS

Client ne treba da traži:

```text
limit=10000000
```

ako to može iscrpeti backend.

---

# 69. NEGATIVE PAGE/LIMIT

Validacija.

---

# 70. STABLE ORDERING

Pagination zahteva determinističan order.

---

# 71. OFFSET PAGINATION

Ako data menja sadržaj između page request-a:

mogu nastati:

- duplicate
- missing items

Proceni use case.

---

# 72. CURSOR

Cursor treba da bude:

- validiran
- stabilan
- opaque ako internal details ne treba izlagati

---

# 73. CURSOR TAMPERING

Ako cursor sadrži user-controlled decoded parameters, proveri validation.

---

# 74. SORTING

Whitelist sort polja.

Ne ubacuj raw `sort` direktno u SQL.

---

# 75. SORT DIRECTION

Validiraj:

```text
asc
desc
```

---

# 76. FILTERS

Mapiraj supported filter semantics.

---

# 77. SEARCH

Proveri:

- length bounds
- normalization
- DB cost
- user-visible semantics

---

# 78. DATE FILTER

Proveri:

- inclusive/exclusive granice
- timezone
- invalid range

---

# 79. `from > to`

Business validation treba da odbije ili definiše ponašanje.

---

# 80. CACHING

REST endpoint može koristiti:

- Cache-Control
- ETag
- Last-Modified
- CDN

Proveri samo tamo gde postoji.

---

# 81. PRIVATE RESPONSE CACHE

Authenticated response ne sme slučajno biti shared cached među userima.

---

# 82. CACHE KEY

Ako response zavisi od:

- Authorization
- tenant
- locale

cache mora to poštovati.

---

# 83. ETAG

Ako postoji optimistic conditional update:

proveri `If-Match` semantiku.

---

# 84. 304

Za conditional GET proveri response behavior.

---

# 85. IDEMPOTENCY

Klasifikuj endpoint:

```text
SAFE
IDEMPOTENT
NON-IDEMPOTENT
CONDITIONALLY IDEMPOTENT
```

---

# 86. POST RETRY

Za critical POST:

```text
request commits
↓
response lost
↓
client retries
```

Analiziraj duplicate consequence.

---

# 87. PAYMENT / ORDER / BOOKING

Posebno zahtevaju idempotency analizu.

---

# 88. IDEMPOTENCY KEY STORAGE

Ako postoji:

proveri:

- TTL
- user scope
- endpoint scope
- payload consistency
- persistence

---

# 89. SAME KEY DIFFERENT PAYLOAD

Mora imati definisan odgovor.

Ne sme jedan key neprimetno vratiti rezultat potpuno druge operacije.

---

# 90. IN-MEMORY IDEMPOTENCY

Nije dovoljna za multi-instance ili restart ako guarantee treba biti durable.

---

# 91. CONDITIONAL UPDATE

Za concurrent edit proveri:

- version
- ETag
- updatedAt
- DB atomicity

---

# 92. LOST UPDATE

Scenario:

```text
Client A reads version 1
Client B reads version 1
A updates
B updates
```

Ako B naslepo prepiše A, proveri da li je to prihvatljivo.

---

# 93. PUT/PATCH RACE

HTTP metod sam ne rešava concurrency.

---

# 94. DELETE VS UPDATE RACE

Simuliraj:

```text
A delete
B update
```

Koje finalno stanje je dozvoljeno?

---

# 95. CREATE DUPLICATE

Business unique constraint treba da spreči duplicate čak i ako client ne pošalje idempotency key gde domain to zahteva.

---

# 96. ERROR RETRYABILITY

Za svaki error code pitaj:

```text
Should client retry?
```

---

# 97. VALIDATION ERROR

Nema smisla automatski retry-ovati identičan payload.

---

# 98. RATE LIMIT

Retry može imati smisla nakon odgovarajućeg vremena.

---

# 99. SERVER ERROR

Transient kandidat, ali ne svaki 500 mora beskonačno retry-ovati.

---

# 100. TIMEOUT

Za write timeout:

outcome može biti unknown.

---

# 101. ASYNC API

Ako endpoint pokreće dug posao:

proveri model:

```text
POST /jobs
↓
202 + jobId
↓
GET /jobs/:id
```

ili drugi documented pattern.

---

# 102. FAKE ASYNC

Endpoint koji vrati 200 "success" odmah, a posao može kasnije permanentno pasti, može obmanuti client.

---

# 103. JOB STATUS

Proveri:

- pending
- running
- success
- failed

---

# 104. POLLING

Ako client poll-uje status:

proveri rate/expiration.

---

# 105. CALLBACK / WEBHOOK OUTBOUND

Ako API kasnije obaveštava client webhook-om:

proveri reliability/idempotency.

---

# 106. LONG-RUNNING HTTP

Ako endpoint drži request otvoren minutima:

proveri proxy/server timeout i resource cost.

---

# 107. FILE DOWNLOAD

Proveri:

- authorization
- content type
- content disposition
- range requests gde potrebno
- streaming

---

# 108. FILE NAME

User-controlled filename u Content-Disposition mora biti bezbedno encoded/sanitized.

---

# 109. RANGE

Za media/large download, Range support može biti bitan.

Ne zahtevaj za male JSON/file endpoint-e bez razloga.

---

# 110. UPLOAD

Za multipart:

proveri:

- size limit
- file count
- field limits
- streaming
- cleanup

---

# 111. EMPTY FILE

Validacija prema domain-u.

---

# 112. MULTIPLE FILES

Proveri total size, ne samo per-file limit.

---

# 113. PARTIAL UPLOAD

Ako connection pukne:

temp file cleanup.

---

# 114. CONTENT TYPE

Client header nije dovoljan security dokaz.

---

# 115. URL INPUT

Ako API prima URL:

može biti SSRF surface.

Detaljni security audit kasnije, ali označi trust boundary.

---

# 116. CALLBACK URL

Isto.

---

# 117. REDIRECT URL

Auth/payment redirect URL treba biti whitelistovan prema business/security modelu.

---

# 118. HOST HEADER

Ako API gradi absolute URLs iz Host header-a:

proveri trusted proxy/host validation.

---

# 119. PROXY

Utvrdi:

- forwarded proto
- forwarded host
- forwarded for
- trust proxy

---

# 120. CLIENT IP

Ako rate limit/audit koristi IP, proveri da attack client ne može spoofovati trusted forwarding header.

---

# 121. CORS

Mapiraj:

- allowed origins
- credentials
- methods
- headers

Ali:

CORS nije API authorization.

---

# 122. WILDCARD + CREDENTIALS

Proveri framework behavior.

---

# 123. PREFLIGHT

OPTIONS request ne treba slučajno da zahteva isti auth kao business request ako browser integration to onemogućava.

---

# 124. CSRF

Ako API koristi cookies/session:

proveri CSRF.

---

# 125. BEARER TOKEN

Ako credentials nisu browser-ambient, CSRF model je drugačiji.

---

# 126. COOKIE ATTRIBUTES

Ako cookie auth postoji:

- Secure
- HttpOnly
- SameSite

prema architecture-i.

---

# 127. CONTENT NEGOTIATION

Ako API tvrdi JSON-only:

proveri Content-Type handling.

---

# 128. INVALID JSON

Treba dati kontrolisan 4xx, ne generic crash/500.

---

# 129. BODY SIZE

JSON body mora imati razumnu granicu prema endpoint-u.

---

# 130. DECOMPRESSION

Ako server prihvata compressed request, proveri decompression bomb risk gde je relevantno.

---

# 131. SERIALIZATION

Response serialization može fail-ovati zbog:

- circular reference
- unsupported type
- BigInt
- date

prema stack-u.

---

# 132. BIG INTEGER

JavaScript backend može imati precision problem za velike integer ID-eve iz DB-a.

Proveri stvarni stack.

---

# 133. DATE FORMAT

API treba da koristi stabilan canonical representation.

Proveri timezone/offset.

---

# 134. DECIMAL

Finansijske decimalne vrednosti ne smeju nejasno prolaziti kroz binary floating point ako precision ima business značaj.

---

# 135. NULL

Response schema treba jasno razlikovati:

- field absent
- field null

ako clients zavise od toga.

---

# 136. BOOLEAN STRING

Traži nedoslednosti:

```json
{"active": "true"}
```

vs:

```json
{"active": true}
```

---

# 137. OPENAPI

Ako postoji OpenAPI:

uporedi spec sa stvarnim route-ovima.

---

# 138. DOCUMENTED, NOT IMPLEMENTED

Endpoint/spec može obećavati field/status koji kod ne vraća.

---

# 139. IMPLEMENTED, NOT DOCUMENTED

Public API drift.

---

# 140. REQUIRED FIELD DRIFT

OpenAPI kaže required, kod ga ne zahteva ili obrnuto.

---

# 141. TYPE DRIFT

Spec integer, runtime string.

---

# 142. STATUS CODE DRIFT

Spec 404, runtime 200/null.

---

# 143. SECURITY SCHEME DRIFT

Spec kaže auth required, route je public ili obrnuto.

---

# 144. CONTRACT TESTING

Ako API ima multiple clients:

contract test može imati veliku vrednost.

Ne zahtevaj enterprise tooling bez potrebe.

---

# 145. CLIENT GENERATION

Ako clients koriste generated SDK iz OpenAPI-ja:

spec drift postaje ozbiljniji.

---

# 146. BACKWARD COMPATIBILITY

Za svaki change pitaj:

> Da li stari client nastavlja da radi?

---

# 147. FIELD REMOVAL

Najčešći breaking response change.

---

# 148. TYPE CHANGE

Primer:

```text
id: integer
```

postaje:

```text
id: string
```

može razbiti client.

---

# 149. ENUM

Unknown enum handling mora se uzeti u obzir.

---

# 150. ERROR CHANGE

Promena error code-a može biti breaking ako client ima specifičan UX flow.

---

# 151. PAGINATION CHANGE

Offset -> cursor može zahtevati verzionisanje ili kompatibilan transition.

---

# 152. DEFAULT SORT CHANGE

Može biti user-visible breaking behavior čak i bez schema promene.

---

# 153. DEFAULT VALUE CHANGE

Isto.

---

# 154. BOOLEAN DEFAULT

Omitted field može promeniti semantiku nakon backend release-a.

---

# 155. FIELD SEMANTICS

Najopasniji breaking change može zadržati isti tip, ali promeniti značenje.

---

# 156. RATE LIMITING

Mapiraj:

- global
- user
- IP
- endpoint
- tenant

---

# 157. LIMIT RESPONSE

Proveri status i retry signal.

---

# 158. LOGIN LIMIT

Authentication endpoint zahteva abuse protection prema threat modelu.

---

# 159. EXPENSIVE ENDPOINT

Search/export/report može zahtevati stroži capacity control.

---

# 160. RATE LIMIT BYPASS

Ako limit zavisi od spoofable header-a:

problem.

---

# 161. DISTRIBUTED RATE LIMIT

In-memory limit nije globalan kroz više instance.

Može i dalje biti koristan local protection, ali ne predstavljaj ga kao globalnu garanciju.

---

# 162. CACHE + RATE LIMIT

Cache hit i miss mogu imati veoma različit backend cost.

---

# 163. API TIMEOUTS

Za svaki critical endpoint utvrdi:

- server timeout
- reverse proxy timeout
- downstream timeout

---

# 164. CLIENT TIMEOUT KRAĆI OD SERVERA

Ako client odustaje na 10 s, a backend nastavlja 60 s expensive posao, može se gomilati wasted work.

---

# 165. SERVER TIMEOUT KRAĆI OD DOWNSTREAM-A

Nelogičan timeout budget.

---

# 166. CANCELLATION

Ako HTTP request nestane:

da li DB/network posao nastavlja?

Correct behavior zavisi od operation semantics.

---

# 167. MUTATION CANCELLATION

Ne cancel-uj durable critical mutation naslepo kada client disconnect-uje.

---

# 168. READ CANCELLATION

Expensive read može često bezbedno biti cancel-ovan.

---

# 169. TRACEABILITY

Za ozbiljne API greške korisno je imati:

- request ID
- trace ID

Ako postoji, proveri da se vraća/loguje dosledno.

---

# 170. REQUEST ID SPOOFING

Ako client šalje svoj ID, server možda treba da ga validira ili generiše internal ID da se logovi ne mogu lako manipulisati.

---

# 171. OBSERVABILITY

Za endpoint treba moći videti:

- latency
- errors
- status codes
- throughput

gde production maturity to zahteva.

---

# 172. HIGH CARDINALITY METRICS

Nemoj stavljati:

- user ID
- raw URL
- email

kao metric label bez razumevanja cardinality/privacy posledica.

---

# 173. LOGGING

Ne loguj ceo request/response bez sanitization-a.

---

# 174. AUTH HEADER

Nikad plain-text u logovima.

---

# 175. COOKIE

Isto.

---

# 176. PASSWORD

Isto.

---

# 177. PAYMENT DATA

Isto.

---

# 178. HEALTH ENDPOINT

Ako postoji:

proveri da ne izlaže:

- secrets
- internal topology
- verbose stack

---

# 179. DEBUG ENDPOINT

Traži:

```text
/debug
/test
/internal
/admin/dev
```

u production routes.

---

# 180. DOCUMENTATION ENDPOINT

Swagger UI u production-u nije automatski vulnerability.

Ali proveri:

- sensitive internal APIs
- auth
- product policy

---

# 181. GraphQL / RPC PORED REST-A

Ako backend ima više API paradigmi:

proveri da ista business pravila nisu različito implementirana.

---

# 182. LEGACY ENDPOINT

Old endpoint može imati slabiju validation/auth logiku.

---

# 183. DUPLICATE BUSINESS OPERATIONS

Ako postoji:

```text
POST /users/:id/activate
```

i:

```text
PATCH /users/:id { active: true }
```

proveri da oba enforce-uju ista pravila.

---

# 184. ADMIN BYPASS

Internal/admin API ne sme direktno da menja DB ako time zaobilazi critical invariant bez jasne namere.

---

# 185. BULK API

Bulk create/update/delete zahteva posebnu analizu.

---

# 186. BULK PARTIAL FAILURE

Definiši:

- all-or-nothing
- per-item result
- stop on first failure

---

# 187. BULK RESPONSE

Client mora znati koji item je uspeo.

---

# 188. BULK AUTHORIZATION

Svaki item treba autorizovati, ne samo prvi ili parent collection.

---

# 189. BULK SIZE LIMIT

Ne dozvoli neograničen broj item-a.

---

# 190. BULK TRANSACTION

Ne obavijaj ogromnu batch operaciju transaction-om bez procene lock/time impact-a.

---

# 191. EXPORT API

Ako generiše veliki report:

proveri:

- sync vs async
- memory
- authorization
- expiration

---

# 192. IMPORT API

Proveri:

- schema
- duplicate
- transaction
- partial failure
- idempotency

---

# 193. SOFT DELETE API

Proveri kako list/detail endpoint tretiraju deleted resource.

---

# 194. RESTORE API

Ako resource može biti restored:

proveri conflict sa novim resource-om koji je zauzeo isti unique key.

---

# 195. ARCHIVE

Archive semantics treba razlikovati od delete ako product pravi tu razliku.

---

# 196. STATE MACHINE ENDPOINTS

Ako resource ima lifecycle:

```text
DRAFT
SUBMITTED
APPROVED
REJECTED
```

proveri dozvoljene transitions.

---

# 197. INVALID TRANSITION

Endpoint ne sme dopustiti:

```text
REJECTED -> APPROVED
```

ako domain to ne dozvoljava.

---

# 198. CONCURRENT TRANSITION

Dva request-a mogu pokušati različite transition-e iz istog state-a.

Treba DB-level/atomic protection.

---

# 199. APPROVAL

Authorization možda zavisi od trenutnog state-a.

---

# 200. STATE TRANSITION AUDIT LOG

Za high-value workflow možda treba audit trail.

---

# 201. IDEMPOTENT COMMAND

Ponovljen:

```text
POST /orders/:id/cancel
```

može legitimno vratiti "already cancelled" bez dodatnog side effect-a.

---

# 202. SIDE EFFECTS

Mapiraj da li API request pokreće:

- email
- notification
- event
- payment
- webhook
- file

---

# 203. RESPONSE PRE SIDE EFFECT-A

Ako API vraća success pre durable enqueue-a critical side effect-a:

posao može biti izgubljen.

---

# 204. RESPONSE POSLE NON-CRITICAL SIDE EFFECT-A

Ako request čeka email provider, može nepotrebno povećati latency i failure surface.

---

# 205. ATOMICITY

Za svaki endpoint pitaj:

> Koji minimalni deo mora biti atomic da bi client success bio istinit?

---

# 206. RETRY SAFETY

Za svaki write endpoint pitaj:

> Može li potpuno isti request bezbedno stići ponovo?

---

# 207. PROXY RETRY

Ne samo client.

Reverse proxy/gateway/service mesh ponekad može retry-ovati request.

Proveri platform config pre tvrdnje.

---

# 208. MOBILE RETRY

Mobile client može retry-ovati posle timeout-a iako server operation jeste uspela.

---

# 209. DOUBLE CLICK

Frontend može poslati dva request-a.

Backend mora čuvati critical invariant bez oslanjanja na disabled button.

---

# 210. CONTRACT MATRIX

Za critical endpoint-e napravi:

| Route | Input | Success | Errors | Idempotency | Compatibility risk |
|---|---|---|---|---|---|

---

# 211. AUTHORIZATION MATRIX

| Route | Principal | Resource ownership | Role/permission | Verified |
|---|---|---|---|---|

---

# 212. STATUS MATRIX

| Scenario | Expected HTTP | Actual | Consistent |
|---|---|---|---|

---

# 213. IDEMPOTENCY MATRIX

| Endpoint | Retry possible | Duplicate consequence | Protection | Risk |
|---|---|---|---|---|

---

# 214. PAGINATION MATRIX

| Endpoint | Method | Max size | Stable order | Cursor/offset | Risk |
|---|---|---|---|---|---|

---

# 215. VERSIONING MATRIX

| Contract | Old clients | New clients | Breaking risk | Status |
|---|---|---|---|---|

---

# 216. TESTOVI

Pregledaj:

- route tests
- integration tests
- auth tests
- validation tests
- OpenAPI tests
- concurrency tests

---

# 217. HAPPY PATH TEST NIJE DOVOLJAN

Critical endpoint treba failure coverage.

---

# 218. AUTH MATRIX TEST

Za sensitive route:

```text
unauthenticated
wrong user
correct user
admin
```

gde su relevantni.

---

# 219. VALIDATION TEST

Testiraj granice:

- empty
- null
- max
- malformed
- unknown enum

---

# 220. IDEMPOTENCY TEST

Pošalji isti request dvaput.

---

# 221. CONCURRENT TEST

Pošalji konfliktne request-e paralelno.

---

# 222. PAGINATION TEST

Testiraj duplicate sort values i data changes između pages.

---

# 223. OPENAPI CONTRACT TEST

Ako spec postoji, proveri da runtime response odgovara spec-u.

---

# 224. OLD CLIENT CONTRACT TEST

Ako postoje fixture-i ili generated clients starijih verzija, koristi ih.

---

# 225. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Method:
Route:
Authentication:
Authorization:
Request schema:
Response schema:

File:
Handler:
Relevant code:

Problem:

Evidence:

HTTP Flow:

Request:
Server processing:
Response:

Reproduction:

Expected HTTP behavior:

Actual/Possible behavior:

Security impact:

Data impact:

Client compatibility impact:

Retry/idempotency impact:

Root cause:

Recommended remediation:

Regression/contract test:

Runtime verification:

Complexity:
XS / S / M / L / XL
```

---

# 226. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-user/tenant private data access
- privilege escalation kroz API
- duplicate irreversible financial action
- exposed critical secret

## P1 - HIGH

- critical IDOR
- common retry pravi duplicate business effect
- major contract flaw kvari glavni client flow
- data corruption kroz concurrent API usage
- severe auth/authorization inconsistency

## P2 - MEDIUM

- značajan API correctness problem
- inconsistent error/status behavior sa realnim client impact-om
- pagination/versioning bug sa ozbiljnim posledicama

## P3 - LOW

- ograničen contract edge case
- minor inconsistency

## P4 - IMPROVEMENT

- API design/maintainability/documentation improvement bez potvrđenog functional failure-a

---

# 227. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

route + handler + data layer direktno potvrđuju scenario.

MEDIUM:

jak evidence, ali production proxy/client behavior nije potvrđen.

LOW:

zavisi od external API gateway/client contract-a koji nije dostupan.

---

# 228. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 229. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. route
2. middleware
3. request validator
4. auth
5. authorization
6. service
7. DB constraint
8. response serializer
9. API spec
10. tests

Ne zaključuj iz route fajla samo zato što ne vidiš authorization u handler-u.

---

# 230. NE FORSIRAJ "PURE REST"

RPC-like command ruta može biti bolja od neprirodnog PATCH modela.

Primer:

```text
POST /orders/:id/cancel
```

može biti jasniji od:

```text
PATCH /orders/:id
{"status":"cancelled"}
```

ako cancel ima business pravila i side effects.

---

# 231. NE RASPRAVLJAJ BESKRAJNO O 400 VS 422

Ako je contract dosledan i clients rade pravilno:

to je sekundarno.

---

# 232. NE UVODI VERSIONING BEZ POTREBE

Ako API ima samo jedan tightly coupled client i nema compatibility problem:

versioning može biti P4.

---

# 233. NE DODAJ RESPONSE ENVELOPE SAMO RADI STILA

```json
{"data": ...}
```

nije automatski bolje od direktnog resource response-a.

---

# 234. NE DODAJ HATEOAS AUTOMATSKI

Ne zahtevaj hyperlinks u svakom API response-u ako proizvod od toga nema korist.

---

# 235. NE MENJAJ KOD

Tokom audita:

- ne menja rute
- ne menja status kodove
- ne dodaje versioning
- ne menja schemas
- ne dodaje idempotency keys
- ne menja auth

Prvo završi audit.

---

# 236. OUTPUT - REST_API_FORENSIC_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- API stack
- route count
- auth model
- contract quality
- najveći rizici
- production readiness

## 2. Route Inventory

## 3. HTTP Method / Resource Semantics

## 4. Request Validation Audit

## 5. Response Contract Audit

## 6. Error Contract Audit

## 7. Authentication Coverage

## 8. Authorization / IDOR Audit

## 9. Tenant Isolation Audit

## 10. Status Code Audit

## 11. Pagination Audit

## 12. Filter / Sort / Search Audit

## 13. Idempotency Audit

## 14. Concurrency / Lost Update Audit

## 15. Async Operations Audit

## 16. Upload / Download API Audit

## 17. Caching / Conditional Request Audit

## 18. CORS / CSRF / Proxy Context

## 19. API Versioning / Compatibility

## 20. OpenAPI / Documentation Drift

## 21. Observability

## 22. Testing Coverage

## 23. Findings Summary

| ID | Severity | Method/Route | Category | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 24. P0 Findings

## 25. P1 Findings

## 26. P2 Findings

## 27. P3 Findings

## 28. P4 Improvements

## 29. Things Done Well

## 30. Unknown / Not Verified

## 31. Remediation Roadmap

---

# 237. SECOND PASS - UNAUTHENTICATED ATTACK

Za svaku non-public rutu ukloni authentication.

Pitaj:

> Koji middleware tačno sprečava request?

---

# 238. SECOND PASS - WRONG USER ATTACK

Za svaki resource ID zamisli:

```text
authenticated User B
↓
sends ID belonging to User A
```

Pitaj:

> Gde se proverava ownership?

---

# 239. SECOND PASS - FIELD TAMPERING

Za svaki write request dodaj neočekivano polje:

```json
{
  "role": "admin",
  "ownerId": "other-user",
  "status": "paid"
}
```

Pitaj šta backend radi.

---

# 240. SECOND PASS - DUPLICATE REQUEST

Za svaki critical POST/PATCH:

```text
request A
request A again
```

u isto vreme i nakon lost response-a.

---

# 241. SECOND PASS - CONCURRENT REQUEST

Pokreni:

```text
Request A
Request B
```

nad istim resource-om.

Pitaj da li se izgubi update ili prekrši invariant.

---

# 242. SECOND PASS - INVALID INPUT

Za svaki parametar probaj:

- null
- empty
- oversized
- malformed
- unsupported enum
- wrong type

---

# 243. SECOND PASS - PAGINATION MUTATION

Scenario:

```text
client fetches page 1
↓
new record inserted
↓
client fetches page 2
```

Pitaj da li offset pagination može:

- preskočiti
- duplirati

item.

---

# 244. SECOND PASS - OLD CLIENT

Zadrži stari request/response expectation.

Primeni current backend.

Traži breaking change.

---

# 245. SECOND PASS - TIMEOUT RETRY

Critical write:

```text
request sent
↓
server succeeds
↓
response delayed/lost
↓
client timeout
↓
retry
```

Pitaj šta se duplira.

---

# 246. SECOND PASS - PROXY

Ako backend stoji iza proxy/gateway-a:

proveri:

- host
- proto
- client IP
- timeout
- body size

---

# 247. SECOND PASS - BULK

Ako bulk endpoint postoji:

simuliraj jedan invalid item u sredini batch-a.

Pitaj šta ostaje commitovano.

---

# 248. SECOND PASS - ASYNC

Za 202/job endpoint:

simuliraj:

```text
accepted
↓
job permanently fails
```

Pitaj kako client saznaje.

---

# 249. SECOND PASS - API SPEC

Uporedi svaku critical rutu sa OpenAPI specifikacijom ako postoji.

Traži silent drift.

---

# 250. SECOND PASS - ERROR CONTRACT

Za svaki failure type pitaj:

> Može li client pouzdano razlikovati šta treba da uradi?

Na primer:

- fix input
- login
- ask permission
- retry
- stop retrying
- show conflict

---

# 251. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- sve critical route su inventarisane
- GET side effects su provereni
- auth i authorization nisu pomešani
- IDOR se proverava kroz realni resource ownership
- nested route parent-child relation je proverena
- mass assignment je analiziran
- response fields nisu slučajno exposing internal/sensitive data
- status kod findings imaju realan client impact
- error codes su analizirani kao machine contract
- pagination ima stable ordering
- unbounded list endpoint-i imaju realan growth context
- critical POST/PATCH imaju retry/idempotency analizu
- concurrency nije zaključena iz HTTP metode same
- timeout write scenario uključuje unknown outcome
- bulk endpoint ima partial failure semantics
- 202 ima način praćenja finalnog rezultata
- OpenAPI je upoređen sa runtime kodom gde postoji
- old client compatibility je analizirana gde je bitna
- proxy/CORS/CSRF nisu pomešani sa authorization-om
- pure REST estetika nije stavljena ispred correctness-a
- P4 design improvements su jasno odvojeni od realnih bugova

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite pravilne HTTP metode, status kodove, pagination i OpenAPI.

To nije REST API audit.

Tražim probleme poput:

```text
PATCH /users/:id
↓
authentication verifies caller
↓
handler loads user by :id
↓
no ownership/role check
↓
ordinary user can modify another account
```

ili:

```text
POST /payments
↓
payment succeeds
↓
response lost
↓
client retries same POST
↓
server has no idempotency protection
↓
payment is charged twice
```

ili:

```text
GET /reports/export
↓
endpoint creates export record
↓
browser prefetch/crawler hits URL
↓
server creates report without explicit user action
```

ili:

```text
PATCH /profile
{
  "name": "Zoran",
  "role": "admin"
}
↓
request body passed directly into ORM update
↓
role changes because field was not whitelisted
```

ili:

```text
GET /projects/A/tasks/B
↓
caller may access project A
↓
task B actually belongs to project C
↓
handler loads B only by task ID
↓
parent project scope is never verified
```

ili:

```text
GET /items?page=1
↓
new item inserted at top
↓
GET /items?page=2
↓
offset shifted
↓
client receives duplicate item and misses another
```

ili:

```text
POST /jobs
↓
server returns 200 "success"
↓
job runs asynchronously
↓
job permanently fails
↓
client has no job ID or failure channel
↓
user believes operation completed
```

To su REST API problemi koje treba da pronađeš.

Razmišljaj kroz:

- HTTP semantics
- resource identity
- trust boundary
- authorization
- validation
- stable contracts
- retry
- idempotency
- concurrency
- pagination
- old clients
- proxy/runtime behavior

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji tačan HTTP request pokreće problem?

> Koji principal ga šalje?

> Koji resource je pogođen?

> Koji status/body client dobija?

> Šta se događa ako isti request stigne dvaput?

> Šta se događa ako dva client-a menjaju isti resource?

> Da li stari client i dalje razume response?

Ako nije dokazivo:

**NOT VERIFIED.**

Ako je samo REST stil bez realnog impact-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 6 stvarnih contract/auth/idempotency problema nego napisati 100 akademskih REST preporuka.

Cilj je dobiti forenzički precizan REST API audit iz kojeg se svaki ozbiljan finding može direktno pretvoriti u:

- reproduction request
- integration test
- authorization fix
- schema/contract correction
- idempotency protection
- concurrency regression test
- compatibility safeguard
- production API hardening plan
