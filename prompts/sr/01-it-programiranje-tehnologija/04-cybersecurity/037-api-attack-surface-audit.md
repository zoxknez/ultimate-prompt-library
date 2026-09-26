---
id: UPL-IT-037
number: 37
slug: api-attack-surface-audit
title: API Attack Surface Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# API ATTACK SURFACE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i attacker-oriented analizu kompletne API attack surface aplikacije.

Glavni cilj:

> Pronaći sve spolja, interno, indirektno ili uslovno dostupne API entry point-e, utvrditi koje podatke i privilegije prihvataju, koje trust boundary-je prelaze i gde napadač može da zaobiđe očekivane zaštite kroz alternativne rute, legacy verzije, skrivene parametre, batch operacije, GraphQL, webhooks, internal endpoints, file flows, debug funkcije ili nekonzistentne middleware lance.

Ovo nije:

- generički API security checklist

- samo lista endpoint-a

- samo OWASP API Top 10 prepisivanje

- samo authentication audit

- samo authorization audit

- samo fuzzing

- samo Swagger/OpenAPI review

- pretpostavka da undocumented endpoint nije dostupan

- pretpostavka da internal endpoint nije reachable

- automatsko brisanje svih legacy ruta

- automatsko prebacivanje svega na API gateway

Fokus je na pitanju:

> Šta sve napadač stvarno može da pozove, sa kojim inputom, kroz koju mrežnu i aplikacionu granicu, i koliko različitih puteva vodi do iste privileged funkcije?

Prioritet:

**unintended public exposure > alternative privileged paths > inconsistent auth/authz > dangerous inputs > legacy/debug/admin routes > bulk/batch amplification > internal trust bypass > hidden side effects > enumeration > hardening**

Bolje je pronaći 5 neočekivanih, stvarno reachable attack path-ova nego napraviti tabelu od 300 endpoint-a bez sigurnosnog konteksta.

---

# 1. UTVRDI API ARHITEKTURU

Pre nalaza identifikuj:

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

# 2. UTVRDI NETWORK TOPOLOGIJU

Mapiraj:

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

Ako nije poznato:

**NETWORK EXPOSURE: NOT VERIFIED**

---

# 3. ROUTE INVENTORY

Pronađi sve rute iz:

- router files

- controllers

- decorators

- annotations

- framework config

- API gateway config

- proxy config

- serverless functions

- OpenAPI

- GraphQL schema

- webhook definitions

---

# 4. NE VERUJ SAMO OPENAPI-JU

Dokumentacija može biti nepotpuna.

Compare:

```text

documented routes

vs

actual registered routes

```

---

# 5. UNDOCUMENTED ROUTE

Undocumented ne znači automatski vulnerability.

Ali može biti:

- forgotten

- legacy

- internal

- debug

- privileged

---

# 6. DEAD ROUTE

Code route nije attack surface ako nije registered/deployed.

Proveri reachability.

---

# 7. ROUTE MAP

Za svaki endpoint zabeleži:

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

# 8. ATTACK SURFACE KLASIFIKACIJA

Koristi:

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

Isti business action može postojati kao:

```text

REST

GraphQL

mobile API

legacy API

admin API

internal API

```

Svaki mora imati konzistentnu zaštitu.

---

# 10. ALTERNATIVE PATH BYPASS

Klasičan scenario:

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

Pronađi:

```text

/v1

/v2

/v3

legacy

deprecated

```

---

# 12. VERSION SECURITY DRIFT

Uporedi:

- auth

- authz

- rate limit

- validation

- response fields

između verzija.

---

# 13. MOBILE API

Stari mobile clients često održavaju posebne endpoint-e.

Proveri security parity.

---

# 14. ADMIN API

Ne pretpostavljaj da `/admin` znači protected.

---

# 15. INTERNAL API

Ne pretpostavljaj da `/internal` nije internet-reachable.

---

# 16. DEBUG API

Traži:

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

# 17. HIDDEN FEATURE FLAG ROUTE

Endpoint može biti skriven u UI-ju, ali aktivan backend-side.

---

# 18. FEATURE FLAG NIJE AUTHORIZATION

Ako client može uključiti hidden flag:

to nije security boundary.

---

# 19. ROUTE REGISTRATION ORDER

Framework middleware order može menjati zaštitu.

---

# 20. MIDDLEWARE COVERAGE

Mapiraj:

```text

global

router

group

route

handler

```

---

# 21. ROUTE IZVAN ZAŠTIĆENE GRUPE

Primer:

```text

router.use(auth)

router.get(...)

```

ali druga route je registrovana pre `auth`.

---

# 22. METHOD DRIFT

GET protected, ali POST/DELETE na istoj path nije.

---

# 23. HEAD

Framework može automatski podržati HEAD.

Proveri:

- metadata leakage

- side effects

---

# 24. OPTIONS

Ne treba vraćati sensitive content.

---

# 25. METHOD OVERRIDE

Ako postoji:

```text

X-HTTP-Method-Override

_method

```

proveri middleware order.

---

# 26. TRAILING SLASH

Ako proxy/app routing razlikuju:

```text

/admin

/admin/

```

proveri stvarno ponašanje.

Ne prijavljuj bez dokaza.

---

# 27. CASE NORMALIZATION

Isto za case-sensitive / insensitive routing.

---

# 28. ENCODED PATH

Double decode/encoded slash može završiti na drugom route-u.

Relevantno samo ako proxy/framework semantics to podržavaju.

---

# 29. BASE PATH

API gateway može expose-ovati backend route pod neočekivanim public path-om.

---

# 30. DIRECT ORIGIN

Ako API gateway/WAF štiti public domain:

proveri da backend origin nije direktno dostupan i time zaobilazi:

- WAF

- limiter

- auth headers

- IP restrictions

---

# 31. TRUSTED HEADERS

Traži:

```text

X-User

X-Internal

X-Forwarded-User

X-Role

X-Tenant

```

---

# 32. HEADER SPOOFING

Ako backend veruje gateway-added header-u:

direct-origin client ne sme moći sam da ga pošalje.

---

# 33. PROXY AUTH

Ako edge radi authentication:

backend mora imati dokaz da request stvarno dolazi od trusted edge-a.

---

# 34. INTERNAL NETWORK TRUST

`source IP is internal` nije dovoljna zaštita ako SSRF/internal compromise može pozvati endpoint.

---

# 35. PUBLIC ROUTE

Pronađi sve unauthenticated routes.

---

# 36. PUBLIC WRITE

Posebno high-value:

```text

POST

PUT

PATCH

DELETE

```

bez auth-a.

Neke mogu biti legitimne:

- registration

- login

- webhook

- contact form

ali zahtevaju poseban threat model.

---

# 37. PUBLIC RESOURCE CREATION

Može omogućiti:

- spam

- storage abuse

- queue abuse

- free-credit abuse

---

# 38. SIDE EFFECT INVENTORY

Za svaki endpoint odredi:

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

# 39. HIDDEN SIDE EFFECT

GET koji:

- menja state

- šalje email

- kreira token

- pokreće job

je high-signal.

---

# 40. SAFE METHOD SEMANTICS

GET/HEAD ne bi trebalo da prave meaningful state change osim specifičnih exception-a.

---

# 41. QUERY PARAM INPUT

Inventariši query params.

---

# 42. BODY INPUT

Inventariši:

- JSON

- form

- multipart

- raw bytes

- XML

- CSV

---

# 43. HEADER INPUT

Attacker kontroliše veliki broj headers osim onih koje pouzdano postavlja/overwrites trusted proxy.

---

# 44. COOKIE INPUT

Cookie je attacker-influenced input.

---

# 45. PATH PARAM

Resource ID, slug, filename, action.

---

# 46. UNKNOWN FIELDS

Kako API reaguje na dodatne JSON fields?

---

# 47. SILENT ACCEPT

Može povećati mass-assignment risk ako se body prosleđuje dalje.

---

# 48. STRICT REJECT

Može biti sasvim validan.

Ali additive client compatibility tradeoff postoji.

---

# 49. BODY MERGE

Traži:

```text

{

  ...defaults,

  ...req.body

}

```

i reverse order.

---

# 50. SECURITY FIELD OVERRIDE

Pitaj da li body može promeniti:

- role

- owner

- tenant

- status

- verified

- price

- plan

- permissions

---

# 51. QUERY TO DB FILTER

Traži:

```text

where: req.query

```

---

# 52. ARBITRARY FILTER

Može otvoriti:

- sensitive fields

- expensive queries

- tenant bypass

---

# 53. SORT

Dynamic sort može biti:

- SQL injection surface

- expensive query surface

---

# 54. INCLUDE / EXPAND

API koji podržava:

```text

?include=...

?expand=...

```

može izložiti relations koje normalan response ne vraća.

---

# 55. FIELD SELECTION

```text

?fields=...

```

ne sme omogućiti sensitive fields.

---

# 56. DEBUG PARAMETER

Traži:

```text

?debug=true

?admin=true

?internal=true

```

---

# 57. ENVIRONMENT PARAMETER

Caller ne treba proizvoljno da bira:

- prod

- staging

- region

ako to otključava druge resources.

---

# 58. CALLBACK URL

API koji prima callback/webhook URL ima SSRF surface.

---

# 59. URL INPUT

Pronađi svaki:

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

# 60. FILE INPUT

File endpoints ulaze u poseban upload audit, ali ovde mapiraj reachable attack surface.

---

# 61. BULK ENDPOINT

Posebno:

```text

/bulk

/batch

/import

/export

```

---

# 62. BULK AMPLIFICATION

Jedan HTTP request može pokrenuti:

```text

10,000 DB writes

10,000 emails

10,000 jobs

```

---

# 63. ITEM COUNT LIMIT

Request count limiter ne vidi internal amplification.

---

# 64. BULK AUTHORIZATION

Svaki item mora biti authorized.

---

# 65. BULK VALIDATION

Jedan malformed item ne sme napraviti unexpected partial side effects bez definisane semantics.

---

# 66. BATCH PARTIAL SUCCESS

API mora jasno izraziti:

- per-item success/failure

- atomicity

---

# 67. GRAPHQL

Ako postoji, mapiraj:

```text

queries

mutations

subscriptions

custom scalars

directives

```

---

# 68. GRAPHQL SINGLE ENDPOINT NIJE SMALL ATTACK SURFACE

Jedan `/graphql` može expose-ovati stotine operations.

---

# 69. INTROSPECTION

Nije vulnerability sama po sebi.

Koristi ga za inventory ako je dostupno u authorized context-u.

---

# 70. GRAPHQL DEPTH

Duboki nested query može biti resource abuse.

---

# 71. GRAPHQL ALIASES

Jedna query može ponoviti isti resolver mnogo puta.

---

# 72. GRAPHQL BATCHING

Jedan HTTP request može sadržati više operations.

---

# 73. GRAPHQL MUTATION AUTH

Svaki mutation mora imati permission check.

---

# 74. GRAPHQL FIELD AUTH

Sensitive nested fields moraju imati odgovarajuću policy.

---

# 75. GRAPHQL GLOBAL ID

Generic node resolver je IDOR kandidat.

---

# 76. CUSTOM SCALAR

Custom URL/file/JSON scalar može zaobići standardnu validation.

---

# 77. ARBITRARY JSON SCALAR

Može omogućiti mass assignment/operator injection ako se prosleđuje dalje.

---

# 78. RPC

Ako postoji JSON-RPC/custom RPC:

inventariši metode.

---

# 79. METHOD NAME INPUT

Ne dozvoli arbitrary method dispatch bez allowlist-a.

---

# 80. gRPC

Ako externally exposed:

mapiraj services/methods i auth metadata.

---

# 81. gRPC REFLECTION

Nije automatski vulnerability, ali može otkriti API shape.

---

# 82. WEBSOCKET

Mapiraj:

```text

handshake

message types

subscriptions

commands

```

---

# 83. HANDSHAKE AUTH

Proveri.

---

# 84. MESSAGE-LEVEL AUTH

Authenticated socket ne znači da user sme svaki command/resource.

---

# 85. SOCKET IDOR

Resource ID u WebSocket message-u zahteva isti authorization kao REST.

---

# 86. SUBSCRIPTION

User ne sme subscribe-ovati na tuđ private topic/channel.

---

# 87. CHANNEL NAME

Predictable channel name nije authorization.

---

# 88. WEBSOCKET MESSAGE SIZE

Resource abuse.

---

# 89. MESSAGE RATE

Request rate limiter možda ne pokriva WebSocket messages.

---

# 90. SSE

Long-lived connection:

proveri auth i subscription resource.

---

# 91. SSE RECONNECT TOKEN

URL query token može procureti kroz logs/history ako se koristi.

---

# 92. WEBHOOK ENDPOINT

Incoming webhook je public route po definiciji u mnogim sistemima.

Mora imati zaseban authenticity model.

---

# 93. WEBHOOK SECRET/SIGNATURE

Detaljni webhook audit postoji, ovde proveri attack surface.

---

# 94. UNSIGNED WEBHOOK

Critical ako menja privileged state.

---

# 95. CALLBACK ENDPOINT

OAuth/payment callbacks su security-sensitive.

---

# 96. STATE / CORRELATION

Callback mora biti vezan za očekivanu session/transaction semantics gde protokol zahteva.

---

# 97. FILE DOWNLOAD

Private download endpoint je attack surface iako nije upload.

---

# 98. EXPORT

High-value exfiltration endpoint.

---

# 99. DATA EXPORT

Može agregirati više resursa i bypass-ovati normalne per-resource checks.

---

# 100. SEARCH

Search je attack surface za:

- enumeration

- data leakage

- expensive queries

---

# 101. AUTOCOMPLETE

Može leakovati private identifiers.

---

# 102. COUNT/STATS

Analytics endpoint može leakovati tenant existence/volume.

---

# 103. METRICS

Public metrics mogu izložiti:

- internal routes

- hostnames

- customer identifiers

- operational details

Severity prema content-u.

---

# 104. HEALTH

Health endpoint treba biti minimalan.

---

# 105. DEEP HEALTH

Ako vraća:

```text

DB URL

Redis host

provider status

```

može dati unnecessary reconnaissance data.

---

# 106. OPENAPI / SWAGGER

Public docs nisu automatski bug.

Ali proveri:

- hidden admin endpoints

- example secrets

- internal hostnames

---

# 107. ACTUAL ROUTES NOT IN DOCS

Posebno analiziraj.

---

# 108. DOCS ROUTE NOT IN APP

Ne tretiraj outdated docs kao active attack surface.

---

# 109. ADMIN FUNCTION

Inventariši:

- create user

- delete user

- reset MFA

- impersonate

- modify role

- billing

- feature flags

- data export

- system reset

---

# 110. SUPPORT API

Support često ima široke privilegije.

---

# 111. IMPERSONATION API

High-risk.

---

# 112. INTERNAL MAINTENANCE

Endpoints za:

- reindex

- migrate

- retry

- sync

- repair

- reset

mogu biti skupi ili destructive.

---

# 113. SCRIPT RUNNER

Ako API može pokrenuti script/command:

critical surface.

---

# 114. DYNAMIC JOB RUNNER

Endpoint poput:

```text

POST /jobs/run/:name

```

mora imati strict allowlist/authz.

---

# 115. ARBITRARY FUNCTION NAME

Ne dozvoli reflection/dynamic dispatch nad arbitrary method names.

---

# 116. JOB PARAMS

Privileged job sa attacker-controlled params može zaobići normalne app constraints.

---

# 117. QUEUE ENTRY API

Ako user može direktno enqueue:

proveri resource ownership i job type allowlist.

---

# 118. SCHEDULER API

Create cron/schedule može biti high-value.

---

# 119. DELAYED ACTION

Authorization možda treba proveriti i pri execution-u.

---

# 120. IDOR

Za svaki endpoint sa resource reference-om testiraj horizontalni access.

Detaljni IDOR audit je prethodni prompt.

---

# 121. TENANT PARAMETER

Pokušaj cross-tenant.

---

# 122. ROLE PARAMETER

Pokušaj vertical escalation.

---

# 123. OWNER PARAMETER

Pokušaj ownership takeover.

---

# 124. PRICE/BALANCE

Client-supplied values high-signal.

---

# 125. STATUS

Caller ne treba da preskoči workflow menjanjem status field-a.

---

# 126. BUSINESS ACTION ENDPOINT

Primer:

```text

/approve

/refund

/cancel

/activate

/verify

```

ima inherentno security-sensitive semantics.

---

# 127. DUPLICATE BUSINESS ACTION

API attack surface uključuje replay/double-submit.

---

# 128. IDEMPOTENCY

Critical financial mutation mora imati odgovarajući duplicate protection prema domain-u.

---

# 129. RACE

Dva concurrent request-a mogu zaobići:

- quota

- one-time action

- stock

- coupon

---

# 130. RATE LIMIT

Public/sensitive endpoint-i moraju biti razmatrani u odnosu na abuse potential.

---

# 131. RATE LIMIT LAYER

Pitaj da li važi kroz:

- edge

- origin

- multi-instance

---

# 132. DIRECT ORIGIN LIMIT BYPASS

Edge limiter ne pomaže ako origin direktno accessible.

---

# 133. API KEY

Ako API key auth postoji:

inventariši routes i scopes.

---

# 134. DIFFERENT AUTH METHODS

Isti endpoint može prihvatiti:

- session

- bearer JWT

- API key

- internal token

Najslabiji path je bitan.

---

# 135. AUTH METHOD CONFUSION

API key namenjen read-only integraciji ne treba da postane admin credential kroz shared auth parser.

---

# 136. TOKEN TYPE

ID token, access token, refresh token ne treba mešati.

---

# 137. COOKIE + BEARER

Ako oba postoje:

utvrdi precedence.

---

# 138. AMBIGUOUS PRINCIPAL

Request sa dva različita credentials ne sme dobiti neočekivanu privileged identity.

---

# 139. AUTH PRECEDENCE

Primer:

```text

cookie = normal user

header token = admin

```

Ko pobeđuje?

Mora biti namerno.

---

# 140. STALE AUTH

Role/tenant claims u tokenu mogu biti stare.

---

# 141. REVOKED USER

Testiraj existing credentials.

---

# 142. API ERROR SURFACE

Error response može otkriti:

- stack

- SQL

- resource existence

- provider details

---

# 143. DIFFERENTIAL ERROR

Može omogućiti enumeration.

---

# 144. 404 VS 403

Može biti namerna concealment strategija.

Ne proglašavaj samo po statusu.

---

# 145. VALIDATION ERROR

Field names mogu otkriti hidden model fields.

Nizak priority osim ako pomaže konkretnom exploit-u.

---

# 146. OVERLY VERBOSE SCHEMA

GraphQL/OpenAPI može otkriti model, ali security mora stajati na controls, ne obscurity.

---

# 147. RESPONSE DATA

Pronađi excessive data exposure.

---

# 148. SHARED SERIALIZER

Admin i user endpoint možda koriste isti serializer.

---

# 149. INTERNAL FIELD

Proveri:

- passwordHash

- secret

- internalNotes

- providerToken

- resetToken

- flags

---

# 150. NESTED RELATION

`include=user` može vratiti sensitive fields.

---

# 151. PAGINATION

Unbounded page size može biti resource abuse.

---

# 152. `limit` PARAM

Pokušaj:

```text

limit=1000000

limit=-1

```

prema parser semantics.

---

# 153. OFFSET

Extreme offset može biti expensive.

---

# 154. DATE RANGE

Unbounded historical query.

---

# 155. COMPLEX FILTER

User može kreirati expensive DB query.

---

# 156. REGEX INPUT

Ako backend dozvoljava regex search:

ReDoS/DB abuse.

---

# 157. SORT ARRAY

Mnogi sort fields mogu napraviti expensive plans.

---

# 158. AGGREGATION API

Analytics endpoint može generisati heavy DB workload.

---

# 159. EXPORT SIZE

One request -> huge data generation.

---

# 160. RESPONSE AMPLIFICATION

Small request može proizvesti gigabyte response.

---

# 161. COMPRESSION

Compression može dodati CPU amplification.

---

# 162. DECOMPRESSION

Compressed request body može biti bomb ako server automatski decompress-uje.

---

# 163. CONTENT ENCODING

Proveri:

```text

gzip

br

deflate

```

ako server prima compressed request bodies.

---

# 164. DECOMPRESSION LIMIT

Limit mora važiti na expanded body, ne samo compressed bytes, gde relevantno.

---

# 165. JSON DEPTH

Deep JSON može izazvati recursive/validation cost.

---

# 166. ARRAY SIZE

Huge arrays.

---

# 167. STRING LENGTH

Huge string.

---

# 168. MULTIPART

Upload audit detaljnije, ali API parser limits ovde mapiraj.

---

# 169. CONTENT TYPE

Endpoint koji očekuje JSON možda različito reaguje na:

- form

- text/plain

- XML

---

# 170. CONTENT-TYPE CONFUSION

Parser chain može omogućiti drugu validation putanju.

---

# 171. ACCEPT

Response format negotiation može aktivirati različite serializers.

---

# 172. XML FALLBACK

Ako endpoint podržava XML:

XXE/parser attack surface.

---

# 173. METHOD CONTENT DIFFERENCES

POST JSON path može imati validator, POST form path možda ne.

---

# 174. DUPLICATE JSON KEYS

Različiti parseri mogu drugačije tretirati:

```json

{

  "role": "user",

  "role": "admin"

}

```

Relevantno samo ako više layers parsira isti body drugačije.

---

# 175. HTTP PARAMETER POLLUTION

Primer:

```text

?role=user&role=admin

```

Proxy/framework/backend mogu birati različitu vrednost.

---

# 176. ARRAY VS SCALAR

```text

id=1

id[]=1

```

može zaobići validator u nekim stack-ovima.

---

# 177. BOOLEAN PARSING

String `"false"` može postati truthy ako code radi naivan cast.

---

# 178. NUMBER PARSING

Testiraj:

- negative

- huge

- float

- NaN

- Infinity

prema language/parser semantics.

---

# 179. INTEGER OVERFLOW

Relevantno za fixed-width languages i financial/count fields.

---

# 180. NULL

Optional vs explicit null mogu pokrenuti različitu business logiku.

---

# 181. EMPTY STRING

Isto.

---

# 182. UNICODE

Normalization može zaobići identifier allowlist.

---

# 183. ENCODING

Malformed UTF-8 / invalid sequences prema runtime-u.

---

# 184. HEADER SIZE

Proxy i backend limits mogu biti različiti.

---

# 185. COOKIE SIZE

Huge cookies mogu izazvati 431/processing problems.

---

# 186. PATH LENGTH

Extreme URL path/query.

---

# 187. SERVER LIMITS

Mapiraj:

- request size

- header size

- timeout

- concurrent requests

---

# 188. PROXY/BACKEND MISMATCH

Proxy dozvoljava 10 MB, backend 1 MB ili obrnuto.

Najvažnije su security/correctness gaps.

---

# 189. REQUEST SMUGGLING

Ne prijavljuj generički.

Relevantno samo uz konkretan proxy/backend HTTP parser mismatch.

---

# 190. HTTP/2 TO HTTP/1

Može promeniti attack model, ali samo uz infrastructure evidence.

---

# 191. INTERNAL API SCANNER

Pronađi sve rute na:

- different port

- localhost bind

- management server

- metrics server

---

# 192. BIND ADDRESS

`0.0.0.0` može expose-ovati management port ako network layer dozvoljava.

---

# 193. MANAGEMENT PORT

Proveri:

- health

- metrics

- debug

- admin

- profiling

---

# 194. PROFILER

Runtime profiler može expose-ovati:

- memory

- source

- stack

- env

---

# 195. ACTUATOR

Spring-like actuator endpoints.

Proveri actual exposure/auth.

---

# 196. DEBUG TOOLBAR

Django/Flask/other debug tooling.

---

# 197. RPC DEBUG

Developer console/playground.

---

# 198. GRAPHQL PLAYGROUND

Nije vulnerability sam po sebi, ali može biti unwanted production surface.

---

# 199. API EXPLORER

Isto.

---

# 200. TEST BACKDOOR

Traži:

```text

skipAuth

testUser

debugToken

masterKey

```

---

# 201. CONDITIONAL AUTH BY ENV

Primer:

```text

if NODE_ENV !== "production":

   skip auth

```

Proveri actual deployment env values.

---

# 202. MISNAMED ENV

Production deployment može imati `NODE_ENV=development` ili custom env mismatch.

---

# 203. DEFAULT CONFIG

Missing env može uključiti debug/default auth bypass.

---

# 204. ERROR FALLBACK

Auth middleware exception ne sme:

```text

catch

↓

next()

```

---

# 205. POLICY FAILURE

Authorization service timeout ne sme default allow.

---

# 206. RATE LIMIT FAILURE

Fail-open može biti acceptable ili dangerous prema endpoint cost-u.

---

# 207. VALIDATION FAILURE

Parser/schema exception ne sme završiti u alternate unvalidated code path-u.

---

# 208. FEATURE FLAG SERVICE FAILURE

Privileged feature ne treba postati enabled po default-u ako flag lookup padne, osim ako namerno.

---

# 209. MULTI-TENANT HEADER

Ako tenant dolazi iz subdomain/header/path:

proveri consistency.

---

# 210. TENANT CONFUSION

Primer:

```text

Host says tenant A

X-Tenant says tenant B

JWT says tenant C

```

Ko pobeđuje?

---

# 211. CANONICAL TENANT AUTHORITY

Mora biti jasno definisana.

---

# 212. ID FORMAT

Resource ID iz drugog tenant-a/environment-a ne sme biti prihvaćen samo zato što format odgovara.

---

# 213. ENVIRONMENT ID

Dev resource ne treba da bude operabilan kroz production API ako namespaces dele format.

---

# 214. API KEY ENVIRONMENT

Test key vs live key.

---

# 215. CROSS-ENVIRONMENT TRUST

Staging credential ne sme raditi u production-u bez namere.

---

# 216. REGION PARAM

Ako caller bira region/data source:

proveri authorization.

---

# 217. CALLBACK STATE

Payment/OAuth callback može primiti attacker-controlled transaction ID.

Mora biti vezan za originalnu local operation.

---

# 218. WEBHOOK TENANT MAPPING

External account ID + object ID.

---

# 219. REPLAY

API endpoint sa one-time tokenom mora imati replay protection prema semantics.

---

# 220. IDEMPOTENCY KEY

Ako client kontroliše:

proveri:

- user/tenant scope

- request fingerprint

- expiry

---

# 221. CROSS-USER IDEMPOTENCY COLLISION

Isti idempotency key ne sme povezati operacije različitih users ako storage nije scoped.

---

# 222. SAME KEY, DIFFERENT BODY

API treba imati definisano ponašanje.

---

# 223. CACHE

API response cache može postati cross-user surface.

---

# 224. CACHE KEY

Proveri:

- auth identity

- tenant

- query

- locale

samo gde utiču na response.

---

# 225. CDN

Personalized API response ne sme slučajno biti public-cacheable.

---

# 226. NEGATIVE CACHE

404 cache može sakriti upravo kreiran resource, više reliability nego security.

---

# 227. VARY

Proveri gde response zavisi od relevantnog request header-a.

---

# 228. CORS

Mapiraj browser-reachable cross-origin surface.

---

# 229. CREDENTIALS + ORIGIN

Broad credentialed CORS high-signal.

---

# 230. PUBLIC API

Broad CORS može biti normalan.

---

# 231. CSRF

Za cookie-auth mutations.

---

# 232. ORIGIN CHECK

Ako koristi ambient auth.

---

# 233. LOGIN CSRF

Poseban flow.

---

# 234. ACCOUNT LINK CSRF

High-value.

---

# 235. API RESPONSE HEADERS

Security headers su secondary za JSON API, ali caching/CORS imaju direktan značaj.

---

# 236. JSONP

Ako legacy API podržava callback parameter:

može otvoriti cross-origin data exposure/XSS model.

---

# 237. CALLBACK WRAPPING

Prijavi samo ako actual JSONP postoji.

---

# 238. JSON HIJACKING

Legacy concern, ne prijavljuj modernom API-ju bez konkretne browser/exposure semantics.

---

# 239. API CLIENTS

Ako official clients postoje:

analiziraj kako koriste API.

---

# 240. CLIENT-SIDE HIDDEN PARAMETER

Frontend code može otkriti undocumented:

- flags

- endpoints

- admin actions

---

# 241. MOBILE APK/DESKTOP BINARY

Može sadržati legacy/internal endpoints.

---

# 242. CLIENT DOES NOT DEFINE SERVER AUTHORITY

To što frontend ne koristi route ne znači da attacker ne može.

---

# 243. SDK

Generated SDK može otkriti kompletan supported surface.

---

# 244. API DEPRECATION

Deprecated endpoint mora imati:

- owner

- retirement plan

ako je security slabiji.

P4/P2 prema realnom gap-u.

---

# 245. ORPHAN ROUTE

Route više nema legitimate client, ali i dalje menja state.

Attack surface bez business value.

---

# 246. UNUSED PRIVILEGED ROUTE

High-value removal candidate.

---

# 247. MONITORING

Prati gde relevantno:

- route usage

- 401/403

- 404 scanning

- validation failures

- rate-limit rejects

- admin actions

---

# 248. UNKNOWN ROUTE SCANNING

Visok 404 volume može biti reconnaissance, ali nije vulnerability.

---

# 249. RARE ADMIN ROUTE

Any use može biti security-relevant.

---

# 250. DEPRECATED ROUTE USAGE

Ako metrics postoje, vidi da li je stvarno neiskorišćena.

---

# 251. AUDIT LOG

Critical privileged API actions treba da imaju actor/resource context gde product zahteva.

---

# 252. SENSITIVE INPUT LOGGING

API request logs ne smeju dumpovati:

- passwords

- tokens

- secrets

---

# 253. RESPONSE LOGGING

Isto za private data.

---

# 254. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

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

Koristi:

## P0 - CRITICAL

- unintended public/internal API daje remote administrative takeover

- unauthenticated critical destructive action

- direct-origin bypass potpuno uklanja auth trust boundary

- hidden API omogućava catastrophic cross-tenant/system compromise

## P1 - HIGH

- legacy/alternative endpoint zaobilazi auth/authz

- exposed internal/admin operation daje ozbiljnu privilege escalation

- bulk/export API omogućava masovno sensitive data leakage

- trusted-header spoofing daje practical identity/role bypass

- critical debug endpoint reachable u production-u

## P2 - MEDIUM

- significant attack surface inconsistency

- constrained hidden endpoint

- resource amplification sa realnim availability/cost impact-om

- limited enumeration/data exposure

- weaker legacy route sa dodatnim preconditions

## P3 - LOW

- minor unnecessary exposure

- limited metadata leak

- low-impact deprecated route

## P4 - HARDENING

- route cleanup

- documentation parity

- centralized policy improvements bez confirmed security bypass-a

---

# 256. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

---

# 257. STATUS

Koristi:

```text

CONFIRMED

LIKELY

THEORETICAL

NOT VERIFIED

```

---

# 258. EVIDENCE TIER

Koristi:

```text

A - safely reproduced

B - complete route/middleware/execution path

C - strong static/config evidence

D - partial/inferred

E - theoretical

```

---

# 259. CATEGORY

Koristi:

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

# 260. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. route je registrovana

2. deployed environment

3. network reachability

4. proxy/gateway

5. middleware chain

6. authentication

7. authorization

8. rate limiting

9. service-level checks

10. actual side effect

Ne prijavljuj dead/unreachable code kao public vulnerability.

---

# 261. UNDOCUMENTED NIJE AUTOMATSKI RANJIVO

Dokumentacija nije security control.

---

# 262. INTERNAL NAZIV NIJE SECURITY CONTROL

`/internal` path nije zaštita.

---

# 263. ADMIN NAZIV NIJE SECURITY CONTROL

`/admin` path nije zaštita.

---

# 264. HIDDEN UI NIJE SECURITY CONTROL

Napadač može direktno zvati API.

---

# 265. API GATEWAY NIJE DOVOLJAN AKO JE ORIGIN DIREKTNO DOSTUPAN

Trust chain mora biti potvrđen.

---

# 266. NE PRIJAVLJUJ SWAGGER KAO VULNERABILITY SAM PO SEBI

Public docs mogu biti namerni.

---

# 267. NE PRIJAVLJUJ GRAPHQL INTROSPECTION KAO HIGH RISK SAMO PO SEBI

Authorization mora biti prava zaštita.

---

# 268. NE PRIJAVLJUJ 404 SCAN KAO VULNERABILITY

To je operational signal.

---

# 269. NE MENJAJ KOD

Tokom audita:

- ne briši legacy routes

- ne blokiraj endpoints

- ne menja gateway

- ne menja CORS

- ne menja auth middleware

- ne vrši destructive calls

Koristi bezbedne negative tests.

---

# 270. OUTPUT - API_ATTACK_SURFACE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- protocols

- exposed entry points

- network topology

- najveći alternative-path rizici

- undocumented/deprecated surfaces

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

Ako relevantno.

## 18. WebSocket / SSE Attack Surface

Ako relevantno.

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

Uporedi security controls.

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

Programatski ili sistematski uporedi:

```text

actual framework routes

vs

OpenAPI/docs

```

Pronađi:

- undocumented

- deprecated

- hidden

- test

- admin

---

# 277. SECOND PASS - VERSION BYPASS

Za svaki privileged business action pronađi sve API verzije i uporedi:

- auth

- authz

- validation

- rate limits

---

# 278. SECOND PASS - DIRECT ORIGIN

Ako postoji edge/gateway protection:

proveri da li se origin može pozvati mimo njega u odobrenom test environment-u ili kroz config dokaz.

---

# 279. SECOND PASS - TRUSTED HEADER

Pokušaj poslati gateway/internal identity headers sa običnog client path-a.

---

# 280. SECOND PASS - PUBLIC WRITE

Za svaki unauthenticated write endpoint pitaj:

> Koji je najskuplji ili najprivilegovaniji side effect koji može izazvati?

---

# 281. SECOND PASS - HIDDEN BODY FIELDS

Za create/update endpoints dodaj undocumented fields iz modela/schema-e.

---

# 282. SECOND PASS - QUERY OVERRIDE

Pokušaj:

- tenant

- owner

- role

- include

- expand

- fields

- limit

- sort

parametre.

---

# 283. SECOND PASS - BULK

Pošalji:

```text

1 item

10

100

max

over max

```

i proveri authorization/amplification.

---

# 284. SECOND PASS - GRAPHQL

Ako postoji:

testiraj:

- deep nesting

- aliases

- batches

- unauthorized global IDs

- privileged mutations

---

# 285. SECOND PASS - WEBSOCKET

Proveri:

- handshake auth

- message-level authz

- topic subscription

- message size/rate

---

# 286. SECOND PASS - CALLBACK

Za OAuth/payment callback pokušaj:

- wrong state

- foreign transaction ID

- repeated callback

- mismatched tenant

u bezbednom test okruženju.

---

# 287. SECOND PASS - CONTENT TYPE

Isti logical request pošalji kao:

```text

application/json

form-urlencoded

multipart

text/plain

```

samo ako server podržava više parsera.

Pitaj da li svi paths koriste istu validation/authz logiku.

---

# 288. SECOND PASS - PARAMETER POLLUTION

Testiraj duplicate:

```text

?id=A&id=B

```

ako proxy/framework parsing razlike mogu biti relevantne.

---

# 289. SECOND PASS - AUTH METHOD CONFUSION

Za endpoint koji prihvata više credential tipova:

testiraj precedence i scope.

---

# 290. SECOND PASS - TENANT CONFUSION

Ako tenant može doći iz više izvora:

```text

JWT = A

Host = B

Header = C

Body = D

```

utvrdi authoritative source.

---

# 291. SECOND PASS - ERROR SURFACE

Izazovi:

- unauthenticated

- unauthorized

- invalid ID

- valid foreign ID

- malformed input

- internal error

i uporedi exposure.

---

# 292. SECOND PASS - DEPRECATED ROUTE

Za svaku deprecated route pitaj:

> Da li još ima legitimate traffic?

Ako ne i ima privilegije:

attack surface bez koristi.

---

# 293. SECOND PASS - MANAGEMENT PORT

Proveri sve additional listeners/ports iz config-a.

---

# 294. SECOND PASS - DEBUG FEATURE

Pretraži:

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

# 295. SECOND PASS - ONE REQUEST AMPLIFICATION

Za svaki expensive route izračunaj približno:

```text

1 HTTP request

→ N DB ops

→ N external calls

→ N jobs

→ N bytes

```

---

# 296. SECOND PASS - CACHE USER SWITCH

Warm personalized response kao User A, zatim request kao User B.

---

# 297. SECOND PASS - ENVIRONMENT CROSSING

Pokušaj identifiers/credentials iz:

```text

dev

staging

production

```

prema actual trust modelu.

---

# 298. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- inventory koristi actual registered routes, ne samo dokumentaciju

- reachability je potvrđena ili označena NOT VERIFIED

- undocumented route nije automatski vulnerability

- dead code nije predstavljen kao production surface

- public write endpoints imaju side-effect analizu

- legacy/v1/mobile routes su upoređene sa novim security controls

- admin/internal/debug path names nisu tretirani kao protection

- direct-origin gateway bypass je analiziran

- trusted headers su provereni

- method-specific middleware drift je analiziran

- query/body/header/cookie/path inputs su inventarisani

- hidden fields i filter override paths su provereni

- bulk endpoints imaju amplification + per-item authz analizu

- GraphQL je analiziran na operation/field nivou, ne samo `/graphql` URL-u

- WebSocket auth ne završava samo na handshake-u

- webhook/callback endpoints imaju zaseban trust model

- import/export/search imaju data-exfiltration analizu

- request-count limiter nije tretiran kao dovoljan za batch/amplification

- content-type/parser variants su provereni gde postoje

- tenant authority je jasno definisana ako postoji više tenant signals

- više auth metoda ne pravi identity/scope confusion

- deprecated unused privileged routes su identifikovane

- debug/management listeners su provereni

- svaki P0/P1 ima kompletan entry-point-to-impact path

- P4 attack-surface reduction preporuke su odvojene od potvrđenih security bypass-a

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Zaštitite API autentikacijom, koristite rate limiting i sakrijte Swagger.

To nije API Attack Surface Audit.

Tražim probleme poput:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

To su API attack surface problemi koje treba da pronađeš.

Razmišljaj kroz:

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

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji tačan entry point attacker koristi?

> Da li je stvarno deployed i reachable?

> Koji middleware chain prolazi?

> Koji credential ili privilege je potreban?

> Postoji li bezbednija nova ruta za isti business action?

> Koji alternativni path ima slabiju zaštitu?

> Koji attacker-controlled parametar menja security rezultat?

> Koji tačan side effect ili podatak attacker dobija?

Ako reachability nije potvrđena:

**API EXPOSURE NOT VERIFIED.**

Ako network topology nije dostupna:

**NETWORK EXPOSURE NOT VERIFIED.**

Ako postoji samo redundant/deprecated površina bez potvrđenog security problema:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih alternativnih ili neočekivanih API attack path-ova nego napraviti ogromnu tabelu endpoint-a bez security zaključka.

Cilj je dobiti forenzički precizan API Attack Surface Audit koji se može direktno pretvoriti u:

- route removal

- middleware correction

- legacy API closure

- gateway/origin hardening

- trusted-header protection

- bulk abuse guard

- parser/validation unification

- production attack-surface reduction
