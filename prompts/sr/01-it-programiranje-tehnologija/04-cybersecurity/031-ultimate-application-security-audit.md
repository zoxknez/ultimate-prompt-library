---
id: UPL-IT-031
number: 31
slug: ultimate-application-security-audit
title: Sveobuhvatni bezbednosni audit aplikacije
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# SVEOBUHVATNI BEZBEDNOSNI AUDIT APLIKACIJE

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented sigurnosnu analizu kompletne aplikacije, njenog backend-a, API-ja, frontend trust boundary-ja, autentikacije, autorizacije, podataka, konfiguracije, infrastrukture i svih spolja dostupnih attack surface-a.

Glavni cilj:

> Pronaći stvarne exploitable ili security-relevant probleme koji omogućavaju neovlašćen pristup, eskalaciju privilegija, cross-user ili cross-tenant pristup podacima, krađu ili zloupotrebu kredencijala, manipulaciju server-side logikom, curenje tajni, injection napade, nebezbedan upload, SSRF, slabu session/token zaštitu ili drugi konkretan security failure.

Ovo nije:

- generički OWASP checklist
- automatsko proglašavanje svake best-practice razlike ranjivošću
- penetration test bez dokaza
- nagađanje da nešto "možda može da se hakne"
- automatski zahtev za MFA svuda
- automatski zahtev za WAF
- automatski zahtev za zero-trust arhitekturu
- automatska zabrana JWT-a
- automatska zabrana cookie session-a
- skeniranje bez razumevanja business logike
- savetovanje da se sve prebaci na drugi framework

Fokus je na:

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

Prioritet:

**authorization > authentication > tenant isolation > secrets > injection > session/token integrity > dangerous server capabilities > sensitive data exposure > security hardening**

Bolje je pronaći 5 stvarnih exploitable problema nego napisati 100 generičkih security preporuka.

---

# 1. UTVRDI STVARNI STACK

Pre security zaključaka utvrdi:

- frontend
- backend
- runtime
- framework
- database
- ORM
- auth library/provider
- session/JWT model
- reverse proxy
- CDN
- object storage
- queue
- deployment platform
- secrets/config model
- external integrations

Ne koristi framework-specific preporuke dok stack nije potvrđen.

---

# 2. DEFINIŠI ATTACK SURFACE

Inventariši:

- public web routes
- API endpoints
- auth endpoints
- admin endpoints
- internal endpoints
- webhook endpoints
- file uploads
- downloads
- callback URLs
- WebSocket/SSE
- GraphQL
- background job entry points
- scheduled tasks
- CLI/admin scripts ako mogu biti remotely triggered

---

# 3. TRUST BOUNDARIES

Mapiraj granice između:

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

i sve tačke gde untrusted input prelazi granicu.

---

# 4. ATTACKER MODELS

Razlikuj:

```text
unauthenticated external attacker
authenticated ordinary user
authenticated malicious user
tenant admin
compromised API key
compromised third-party integration
malicious uploaded file
malicious webhook sender
```

Ne pretpostavljaj samo anonymous attacker scenario.

---

# 5. NE PRETPOSTAVLJAJ INTERNAL = TRUSTED

Internal endpoint, queue message ili webhook može nositi attacker-influenced data.

---

# 6. AUTHENTICATION MAP

Mapiraj:

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

Odvojeno mapiraj:

```text
principal
↓
resource
↓
permission/ownership
↓
allow/deny
```

Authentication nije authorization.

---

# 8. ROUTE SECURITY INVENTORY

Za svaki relevantan endpoint:

| Route | Public | Auth | Authorization | Resource scope | Sensitive |
|---|---|---|---|---|---|

---

# 9. AUTH BYPASS

Traži rute koje su slučajno izuzete iz global auth middleware-a.

---

# 10. ROUTE GROUP DRIFT

Primer:

```text
/api/admin/*
```

zaštićeno, ali:

```text
/api/v2/admin/*
```

nije.

---

# 11. DEFAULT-PUBLIC ROUTING

Ako framework route postaje public osim ako developer ručno doda auth:

pregledaj coverage posebno pažljivo.

---

# 12. DEFAULT-PROTECTED ROUTING

Ako je auth globalan:

proveri izuzetke.

---

# 13. AUTHORIZATION

Za svaki resource endpoint odgovori:

> Zašto baš ovaj caller sme baš nad ovim resource-om da izvrši baš ovu akciju?

---

# 14. IDOR / BOLA

Klasičan scenario:

```text
GET /documents/123
```

Promeni:

```text
123 -> 124
```

i proveri ownership/permission.

---

# 15. READ IDOR

Neovlašćen read je security problem čak i bez mutation-a.

---

# 16. UPDATE IDOR

Posebno:

```text
PATCH /users/:id
```

---

# 17. DELETE IDOR

Posebno destructive.

---

# 18. NESTED RESOURCE IDOR

Primer:

```text
/orgs/A/projects/B
```

Proveri:

- caller pristup A
- B stvarno pripada A

---

# 19. PARENT/CHILD CONFUSION

Handler može proveriti parent, ali učitati child globalno.

---

# 20. TENANT ISOLATION

Ako multi-tenant:

svaka relevantna data operacija mora biti scoped.

---

# 21. TENANT ID IZ REQUEST-A

Ne veruj:

```json
{
  "tenantId": "..."
}
```

samo zato što je caller authenticated.

---

# 22. TENANT QUERY FILTER

Traži repository/query method koji nema tenant filter.

---

# 23. TENANT CACHE

Cache key mora uključiti tenant ako cached data zavisi od tenant-a.

---

# 24. TENANT OBJECT STORAGE

Object path/bucket/prefix mora čuvati tenant boundary.

---

# 25. TENANT JOB

Background worker mora nositi/proveriti pravilan tenant context.

---

# 26. TENANT WEBHOOK

External provider account/resource mora se pravilno mapirati na local tenant.

---

# 27. CROSS-TENANT ENUMERATION

Čak i ako data nije vraćena, različiti errors/status/timing mogu otkriti existence.

Severity prema sensitivity-ju.

---

# 28. ROLE-BASED AUTHORIZATION

Ako postoje role:

mapiraj:

- user
- moderator
- admin
- owner
- system

---

# 29. ROLE IZ CLIENT-A

Nikada ne veruj client-supplied role field-u kao authorization authority.

---

# 30. ROLE CACHE

Promena role možda ne utiče odmah na cached/session claims.

Proveri expected revocation semantics.

---

# 31. FIELD-LEVEL AUTHORIZATION

User možda sme editovati resource, ali ne sme menjati:

- role
- owner
- billing
- status
- verified
- internal flags

---

# 32. MASS ASSIGNMENT

High-signal pattern:

```text
request.body
↓
ORM.update
```

bez eksplicitne field whitelist-e.

---

# 33. HIDDEN FIELD TAMPERING

Testiraj dodavanje:

```json
{
  "isAdmin": true,
  "role": "admin",
  "ownerId": "victim",
  "status": "paid"
}
```

---

# 34. OVERPOSTING

Čak i ako frontend ne prikazuje field:

attacker može ručno poslati request.

---

# 35. AUTHENTICATION MODEL

Utvrdite:

- session cookie
- JWT
- OAuth/OIDC
- API key
- magic link
- password
- MFA

---

# 36. PASSWORD STORAGE

Ako aplikacija sama čuva passwords:

proveri moderni password hashing algorithm i parametre.

Ne optimizuj hashing radi performance-a nauštrb sigurnosti.

---

# 37. PLAINTEXT PASSWORD

P0.

---

# 38. REVERSIBLE ENCRYPTED PASSWORD

Takođe ozbiljan problem ako nema specifičnog opravdanja.

Password treba hashovati, ne recover-ovati.

---

# 39. HASH ALGORITHM

Proveri prema stvarnom runtime/library modelu.

---

# 40. PASSWORD LOGGING

Nikada:

- request log
- error log
- analytics

---

# 41. LOGIN ENUMERATION

Uporedi response za:

```text
unknown email
```

i:

```text
wrong password
```

---

# 42. ENUMERATION NIJE UVEK P0

Severity zavisi od sensitivity-ja i product context-a.

---

# 43. PASSWORD RESET

Mapiraj:

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

# 44. RESET TOKEN

Treba biti:

- unpredictable
- sufficiently random
- limited lifetime
- single-use gde product to zahteva

---

# 45. RESET TOKEN STORAGE

Ako kompromitovana DB ne treba da omogućava instant reset takeover:

razmotri hashovanje tokena gde design to dozvoljava.

---

# 46. RESET TOKEN REUSE

Nakon successful password reset-a:

isti token ne sme ponovo menjati password.

---

# 47. RESET TOKEN RACE

Dva concurrent request-a sa istim tokenom.

---

# 48. PASSWORD CHANGE

Proveri da li aktivne sessions/tokens treba revokovati prema security modelu.

---

# 49. EMAIL CHANGE

Ako email predstavlja login identity:

proveri verification i existing-session semantics.

---

# 50. SESSION COOKIE

Ako koristi cookies:

proveri:

- Secure
- HttpOnly
- SameSite
- domain
- path

prema deployment-u.

---

# 51. SESSION FIXATION

Proveri da li session ID rotira nakon login/privilege elevation gde je potrebno.

---

# 52. SESSION ID

Mora biti dovoljno nepredvidiv.

Preferiraj framework-generated secure identifiers.

---

# 53. SESSION STORE

Proveri:

- expiry
- revocation
- multi-instance behavior

---

# 54. LOGOUT

Mora invalidirati relevantan server-side session ili client credential prema modelu.

---

# 55. JWT

Ako koristi JWT:

proveri:

- signature
- algorithm
- issuer
- audience
- expiration
- not-before
- key rotation

---

# 56. `alg=none`

Ne nagađaj.

Testiraj samo ako library/config realno dopušta manipulaciju algorithm selection-a.

---

# 57. ALGORITHM CONFUSION

Prijavi samo uz konkretan library/config exploit path.

---

# 58. JWT SECRET

Weak/hardcoded secret je ozbiljan problem.

---

# 59. JWT CLAIMS

Ne veruj arbitrary client-generated JWT claims bez validne signature verification.

---

# 60. ISSUER / AUDIENCE

Posebno važno kada više auth systems/clients koriste iste signing keys.

---

# 61. TOKEN EXPIRATION

Long-lived token nije automatski vulnerability.

Proceni:

- sensitivity
- revocation
- refresh model

---

# 62. REFRESH TOKEN

Proveri:

- storage
- rotation
- reuse
- revocation
- lifetime

---

# 63. REFRESH TOKEN REUSE

Ako rotation postoji:

stari token reuse može signalizirati theft.

---

# 64. TOKEN U URL-U

Sensitive token u query string-u može procureti kroz:

- history
- logs
- referrer

---

# 65. API KEY

Proveri:

- generation
- storage
- hashing
- scopes
- rotation
- revocation

---

# 66. API KEY PREFIX

Može pomoći identification-u, ali nije security sama po sebi.

---

# 67. API KEY U REPO-U

Critical secret exposure.

---

# 68. OAUTH

Ako postoji:

mapiraj authorization code flow.

---

# 69. REDIRECT URI

Mora biti pravilno ograničen.

---

# 70. OPEN REDIRECT

Može se koristiti za phishing/token leakage u određenim auth flow-ovima.

---

# 71. PKCE

Za public OAuth clients proveri prema provider/flow requirements.

---

# 72. `state`

Proveri CSRF/correlation semantics gde OAuth flow to zahteva.

---

# 73. `nonce`

OIDC flow gde relevantno.

---

# 74. THIRD-PARTY LOGIN ACCOUNT LINKING

Critical area.

Proveri da attacker ne može spojiti svoj provider identity sa tuđim local account-om.

---

# 75. EMAIL TRUST

Ne tretiraj provider email kao verified ako provider contract to ne garantuje.

---

# 76. MFA

Ako postoji:

proveri bypass kroz alternative flows.

---

# 77. MFA BYPASS

Primer:

```text
password login requires MFA
```

ali:

```text
legacy endpoint issues full session without MFA
```

---

# 78. RECOVERY CODES

Ako postoje:

- single use
- secure storage
- regeneration semantics

---

# 79. MFA RESET

High-value admin/support operation.

Proveri authorization/audit.

---

# 80. CSRF

Ako browser koristi ambient credentials:

- cookies
- browser auth

proveri state-changing requests.

---

# 81. SAME-SITE NIJE JEDINA ANALIZA

Proceni:

- SameSite mode
- cross-site requirements
- CSRF token
- origin/referer checks

---

# 82. BEARER TOKEN

Authorization header model ima drugačiji CSRF threat.

Ne primenjuj cookie rules naslepo.

---

# 83. CORS

CORS nije authorization.

---

# 84. WILDCARD CORS

Public API može legitimno dozvoliti `*`.

Problem zavisi od credentials/data modela.

---

# 85. ORIGIN REFLECTION

Ako server reflektuje bilo koji Origin i dozvoljava credentials:

ozbiljan problem.

---

# 86. PREFLIGHT

Ne sme biti security bypass, ali pogrešna konfiguracija može blokirati legitimate client.

---

# 87. XSS

Ako aplikacija ima frontend/server-rendered HTML:

proveri untrusted data output.

---

# 88. STORED XSS

Posebno:

- comments
- profiles
- admin dashboards
- uploaded SVG/HTML

---

# 89. REFLECTED XSS

Query/path values vraćeni u HTML.

---

# 90. DOM XSS

Frontend sink-ovi:

- innerHTML
- dangerouslySetInnerHTML
- document.write
- unsafe URL assignment

---

# 91. FRAMEWORK ESCAPING

Ne prijavljuj svaki interpolation kao XSS ako framework automatski escape-uje.

---

# 92. HTML SANITIZER

Ako rich text mora biti podržan:

proveri sanitizer config.

---

# 93. MARKDOWN

Markdown -> HTML može postati XSS surface kroz raw HTML/URL schemes.

---

# 94. SVG

User-uploaded SVG može biti active content u određenim serving context-ima.

---

# 95. CSP

CSP je defense-in-depth.

Ne predstavljaj odsustvo CSP-a kao confirmed XSS vulnerability.

---

# 96. SQL INJECTION

Pronađi mesta gde untrusted data ulazi u raw SQL.

---

# 97. PARAMETERIZED QUERY

ORM/query builder često bezbedno parametrizuje values.

Ne prijavljuj injection samo zato što query sadrži variable.

---

# 98. DYNAMIC IDENTIFIER

Table/column/order direction se ne mogu uvek parameterize-ovati isto kao values.

Whitelist dynamic identifiers.

---

# 99. RAW QUERY

High-signal:

```text
"... WHERE id = " + userInput
```

---

# 100. ORDER BY INJECTION

User-controlled sort fields.

---

# 101. NOSQL INJECTION

Ako Mongo/NoSQL:

proveri user-controlled operators.

---

# 102. OBJECT QUERY INJECTION

Primer:

```json
{
  "password": {
    "$ne": null
  }
}
```

relevantno samo za određene query patterns.

---

# 103. COMMAND INJECTION

Traži:

- shell exec
- child process
- command strings

sa attacker-controlled data.

---

# 104. SAFE ARGUMENT API

Preferiraj argument arrays/API-je bez shell parsing-a gde je moguće.

---

# 105. SHELL ESCAPING

Manual escaping je fragile.

---

# 106. PATH TRAVERSAL

Ako user kontroliše filename/path:

testiraj:

```text
../../
```

i platform-specific varijante.

---

# 107. NORMALIZATION

Proveri decode/normalize redosled.

---

# 108. ZIP SLIP

Ako backend raspakuje archive:

entry path ne sme izaći iz intended directory-ja.

---

# 109. SYMLINK

Filesystem operation može pratiti symlink van sandbox-a.

Proceni stvarni code path.

---

# 110. LOCAL FILE READ

Endpoint koji prima path može otvoriti arbitrary file.

---

# 111. SSRF

Pronađi server-side fetch nad user-controlled URL-om.

---

# 112. SSRF TARGETS

Attack može ciljati:

- localhost
- internal network
- cloud metadata
- admin services

---

# 113. URL ALLOWLIST

Ako product zahteva URL fetch:

proveri scheme/host/address restrictions prema use case-u.

---

# 114. DNS REBINDING

Ako custom SSRF protection samo resolve-uje hostname jednom:

analiziraj re-resolution/connection semantics gde relevantno.

---

# 115. REDIRECT

Allowed external URL može redirectovati ka internal target-u.

---

# 116. IP REPRESENTATIONS

Custom blocklist može biti zaobiđen alternativnim IP formatima.

Ne prepisuj networking parser ručno bez potrebe.

---

# 117. CLOUD METADATA

Proceni platformu pre tvrdnje.

Ne pretpostavljaj AWS metadata endpoint na Vercel/other platformi.

---

# 118. XXE

Samo ako aplikacija parsira XML.

Ako ne:

**NOT APPLICABLE**

---

# 119. XML PARSER

Proveri external entity/DTD behavior prema library verziji.

---

# 120. TEMPLATE INJECTION

Ako user input postaje template source, ne samo template data.

---

# 121. SSTI

Prijavi samo kada attacker može kontrolisati template syntax u engine-u koji izvršava expressions.

---

# 122. DESERIALIZATION

Pronađi unsafe native object deserialization:

- Java serialization
- pickle
- YAML unsafe load
- PHP unserialize
- equivalent

---

# 123. JSON NIJE AUTOMATSKI UNSAFE DESERIALIZATION

Ne mešaj normalno JSON parsing sa code/object deserialization.

---

# 124. YAML

Proveri safe loader.

---

# 125. PROTOTYPE POLLUTION

Relevantno za JS stack i object merge/path libraries.

Traži konkretan attacker-controlled object -> unsafe merge path.

---

# 126. FILE UPLOAD

Mapiraj:

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

# 127. EXTENSION

File extension nije dovoljan dokaz tipa.

---

# 128. MIME

Client-provided MIME nije dovoljan.

---

# 129. MAGIC BYTES

Može pomoći za određene file tipove.

Ne pretpostavljaj da rešava svaki polyglot.

---

# 130. FILE SIZE

Limit.

---

# 131. FILE COUNT

Limit.

---

# 132. FILENAME

Sanitize/replace.

Ne koristi user filename kao direct filesystem path.

---

# 133. PUBLIC FILE SERVING

Ako upload može biti HTML/SVG i služi sa istog origin-a:

XSS/origin risk.

---

# 134. CONTENT-DISPOSITION

Download attachment može biti sigurniji za neke file types.

---

# 135. CONTENT-TYPE

Serving pogrešan content type može omogućiti browser interpretation.

---

# 136. `nosniff`

Defense-in-depth gde relevantno.

---

# 137. IMAGE PROCESSING

Parser vulnerabilities zavise od libraries.

Dependency audit je poseban prompt, ali zabeleži attack surface.

---

# 138. ARCHIVE BOMB

Zip/compressed upload može imati veliki decompressed size.

---

# 139. MALWARE

Ne insistiraj na antivirus skeniranju za svaki app.

Proceni:

- user-to-user distribution
- enterprise requirements

---

# 140. OBJECT STORAGE ACL

Upload ne sme slučajno biti public ako treba private.

---

# 141. PRESIGNED URL

Proveri:

- object scope
- expiration
- method
- authorization

---

# 142. OBJECT KEY TAMPERING

User ne sme zatražiti signed URL za tuđ object.

---

# 143. DOWNLOAD AUTHORIZATION

Knowing object URL/ID nije authorization.

---

# 144. DIRECTORY LISTING

Ako server/storage izlaže listing, proceni sensitivity.

---

# 145. SECRETS

Pretraži repository za:

- API keys
- passwords
- tokens
- private keys
- DB URLs
- webhook secrets

---

# 146. FALSE POSITIVE SECRET

Example/test values nisu production exposure.

Proveri validity/context gde bezbedno.

---

# 147. COMMITTED SECRET

Čak i ako kasnije obrisan iz latest code-a:

Git history može ga i dalje sadržati.

---

# 148. SECRET ROTATION

Ako confirmed exposed:

preporuka nije samo "remove file".

Treba rotirati/revoke-ovati.

---

# 149. ENV FILE

`.env` ne sme biti public artifact/repository commit ako sadrži secrets.

---

# 150. FRONTEND ENV

Client bundles nisu mesto za true secrets.

---

# 151. `NEXT_PUBLIC_*` / EQUIVALENT

Sve što ide u browser tretiraj kao public.

---

# 152. SOURCE MAP

Public source maps mogu izložiti source details, ali nisu automatski critical.

---

# 153. DEBUG ENDPOINT

Traži:

```text
/debug
/test
/dev
/internal
```

---

# 154. STACK TRACE

Production errors ne treba da izlažu:

- file paths
- SQL
- secrets
- internal services

---

# 155. ERROR OBJECT

Third-party SDK error može sadržati request metadata/secrets.

Ne vraćaj raw.

---

# 156. LOGS

Security audit mora obuhvatiti:

- auth headers
- cookies
- passwords
- tokens
- secrets
- PII

---

# 157. URL LOGGING

Token/password u query parametrima može završiti u access logs.

---

# 158. AUDIT LOGS

High-value actions možda treba zabeležiti:

- role changes
- admin actions
- key creation/revocation
- destructive actions

---

# 159. AUDIT LOG INTEGRITY

Ako običan user može edit/delete audit record:

security vrednost je mala.

---

# 160. ADMIN PANEL

Mapiraj:

- auth
- MFA ako postoji
- authorization
- exposed operations

---

# 161. ADMIN ≠ ALL POWER BY DEFAULT

I admin endpoint treba proveriti za cross-tenant/system boundaries ako product ima više admin nivoa.

---

# 162. SUPPORT IMPERSONATION

Ako postoji "login as user":

high-risk feature.

Proveri:

- authorization
- audit
- duration
- clear indication
- sensitive action restrictions ako postoje

---

# 163. FEATURE FLAGS

Admin feature flag endpoint može omogućiti hidden functionality.

Proveri authorization.

---

# 164. DEBUG CONFIG

Production `DEBUG=true` može izložiti detalje ili unsafe behavior.

---

# 165. DEVELOPMENT CREDENTIALS

Default/admin/test accounts u production-u.

---

# 166. DEFAULT PASSWORD

Critical.

---

# 167. BACKDOOR / BYPASS

Traži:

```text
if email == ...
if env == ...
master password
skipAuth
```

Ne zaključuj zlonamernost.

Samo dokumentuj security effect.

---

# 168. TEST ROUTES

Test endpoint koji stvara admin/user/token može ostati deploy-ovan.

---

# 169. INTERNAL HEADER BYPASS

Pattern:

```text
X-Internal: true
```

bez cryptographic/network trust.

---

# 170. IP ALLOWLIST

Ako security zavisi od IP-a:

proveri proxy trust i direct origin exposure.

---

# 171. REVERSE PROXY

Mapiraj:

- client IP
- scheme
- host
- TLS termination

---

# 172. HOST HEADER

Ako backend koristi Host za:

- reset link
- callback
- canonical URL

attacker-controlled Host može biti opasan.

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

ako infrastructure dopušta.

---

# 174. FORWARDED PROTO

Wrong trust može napraviti insecure redirects/cookie semantics.

---

# 175. HTTPS

Proveri production architecture.

Ne prijavljuj app-level no-TLS ako TLS pravilno terminira trusted edge.

---

# 176. SECURE COOKIE I PROXY

Framework mora znati da original request jeste HTTPS.

---

# 177. HSTS

Defense-in-depth.

Ne označavaj odsustvo kao exploitable vulnerability samo po sebi.

---

# 178. SECURITY HEADERS

Proveri prema aplikaciji:

- CSP
- frame-ancestors
- nosniff
- referrer policy

P4 osim ako odsustvo omogućava konkretan attack path.

---

# 179. CLICKJACKING

Relevantno ako sensitive action UI može biti framed i user click exploited.

---

# 180. OPEN REDIRECT

Testiraj redirect/callback/next parametre.

---

# 181. JAVASCRIPT URL

Frontend redirect/navigation mora ograničiti unsafe schemes gde user kontroliše destination.

---

# 182. EMAIL LINKS

Reset/invite links moraju koristiti trusted origin.

---

# 183. WEBHOOK SECURITY

Incoming webhooks:

- signature
- replay
- tenant mapping

Detaljni reliability audit je poseban.

---

# 184. WEBHOOK UNSIGNED

Ako webhook menja critical state bez authentication/signature:

P0/P1.

---

# 185. WEBHOOK REPLAY

Valid old event može biti ponovno poslat.

---

# 186. OUTGOING WEBHOOK SSRF

Customer-controlled webhook URL može targetirati internal services.

---

# 187. CALLBACK URL

Isto.

---

# 188. IMAGE/PDF FETCH URL

Isto.

---

# 189. IMPORT FROM URL

Isto.

---

# 190. EMAIL TEMPLATE FETCH

Ako server fetchuje remote assets based on user input, proveri SSRF.

---

# 191. SERVER-SIDE BROWSER

Headless browser nad attacker-controlled URL-om predstavlja jak SSRF/internal-browser attack surface.

---

# 192. PDF GENERATION FROM URL/HTML

Može kombinovati:

- SSRF
- local file access
- script execution

zavisno od engine-a.

---

# 193. GRAPHQL

Ako postoji:

proveri:

- field authorization
- introspection policy
- depth/complexity
- batching
- resolver IDOR

---

# 194. GRAPHQL FIELD AUTH

Auth samo na top-level query-ju možda nije dovoljan.

---

# 195. GRAPHQL INTROSPECTION

Nije automatski vulnerability.

Security through obscurity nije authorization.

---

# 196. REST BATCH

Bulk endpoint mora autorizovati svaki item.

---

# 197. BULK IDOR

Caller pošalje listu od 100 IDs, od kojih 1 pripada drugom user-u.

---

# 198. EXPORT

Export endpoint je high-value data exfiltration surface.

---

# 199. CSV EXPORT

Formula injection može biti relevantna ako spreadsheet otvara attacker-controlled cells.

---

# 200. CSV FORMULA INJECTION

Vrednosti koje počinju sa:

```text
=
+
-
@
```

mogu biti interpreted kao formulas u nekim spreadsheet alatima.

Proceni stvaran user flow.

---

# 201. IMPORT

Import može zaobići normalnu:

- validation
- authorization
- quotas

---

# 202. ADMIN IMPORT

Admin privilege ne znači da imported data sme da prekrši hard invariants.

---

# 203. SEARCH

Search response ne sme otkriti resources koje caller ne može direktno otvoriti.

---

# 204. AUTOCOMPLETE

Može leakovati:

- email
- usernames
- document names

---

# 205. ERROR DIFFERENCE

Search/query može omogućiti enumeration kroz errors/counts.

---

# 206. DATA MINIMIZATION

API response treba da vraća samo potrebna polja.

---

# 207. SENSITIVE FIELDS

Traži:

- password hash
- token
- secret
- internal notes
- provider IDs
- private contact data

---

# 208. PASSWORD HASH

Ni hashed password ne treba slati client-u.

---

# 209. INTERNAL DATABASE ID

Nije automatski security problem.

Authorization je ključ.

---

# 210. PRIVATE METADATA

Admin-only field može procuriti kroz shared serializer.

---

# 211. LOGGED RESPONSE

Sensitive response možda nije exposed client-u, ali može biti exposed kroz logs.

---

# 212. CACHE DATA LEAK

Shared cache može vratiti response drugog user-a.

---

# 213. CDN DATA LEAK

Authenticated response cache-ovan kao public/shared.

---

# 214. `Vary`

Proveri samo gde caching model zahteva.

---

# 215. SERVICE WORKER CACHE

Frontend/PWA može cache-ovati private response na shared device-u.

Proceni actual architecture.

---

# 216. BROWSER STORAGE

Ako tokeni idu u:

- localStorage
- sessionStorage
- IndexedDB

analiziraj threat prema XSS/session modelu.

Ne proglašavaj localStorage automatski vulnerability.

---

# 217. SENSITIVE CLIENT CACHE

Logout možda treba ukloniti local sensitive data.

---

# 218. API KEY DISPLAY

UI ne treba ponovo vraćati full secret ako backend čuva samo hash, osim ako design namerno podržava recovery.

---

# 219. CRYPTO

Traži custom cryptography.

---

# 220. CUSTOM CRYPTO

High-risk ako developer implementira:

- encryption
- password hashing
- token generation
- signatures

umesto standard library/protocol-a.

---

# 221. RANDOMNESS

Security tokens moraju koristiti cryptographically secure random source.

---

# 222. PREDICTABLE TOKEN

Timestamp/random() counter nije dovoljan.

---

# 223. ENCRYPTION

Proveri:

- algorithm
- mode
- nonce/IV
- key storage
- integrity

samo ako app stvarno radi custom encryption.

---

# 224. STATIC IV/NONCE

Može biti ozbiljan cryptographic problem, zavisno od mode-a.

---

# 225. ENCRYPTION WITHOUT AUTHENTICATION

Proceni chosen scheme.

---

# 226. KEY IN SOURCE

Critical secret handling problem.

---

# 227. KEY ROTATION

Ako encrypted persistent data postoji:

rotacija zahteva strategy.

---

# 228. HASHING PII

Unsalted plain hash email/phone nije nužno anonymization.

Ako threat/privacy model to tvrdi, proveri.

---

# 229. RATE LIMITING

Security-relevant za:

- login
- reset
- OTP
- expensive abuse

Detaljni audit je prethodni prompt.

Ovde fokus na attack path.

---

# 230. RATE LIMIT BYPASS

Ako attacker-controlled IP header predstavlja key:

high-signal.

---

# 231. LOCKOUT DOS

Napadač možda može zaključati tuđ account.

---

# 232. USER ENUMERATION KROZ RATE LIMIT

Different counters/messages mogu otkriti account existence.

---

# 233. BUSINESS LOGIC ABUSE

Security nije samo injection.

Traži:

- self-referral
- free-credit farming
- unauthorized state transition
- negative values
- reuse of one-time actions

---

# 234. NEGATIVE VALUES

Primer:

```text
quantity = -10
```

može menjati balance/inventory.

---

# 235. PRICE TAMPERING

Client-supplied price ne sme biti authoritative.

---

# 236. PLAN/TIER TAMPERING

Client ne sme menjati paid entitlement field.

---

# 237. ONE-TIME ACTION

Reset token, coupon, invite, promo, redemption:

concurrency-safe single use.

---

# 238. RACE CONDITION KAO SECURITY BUG

Ako race omogućava prekoračenje:

- balance
- quota
- entitlement
- coupon

može biti security/business abuse.

---

# 239. TOCTOU

Check permission/state pa kasnije action nad promenjenim resource-om.

---

# 240. FILE TOCTOU

Validated file path/object može biti zamenjen pre use-a u lokalnom filesystem context-u.

---

# 241. DEPENDENCIES

Detaljni supply-chain audit dolazi kasnije.

Ovde zabeleži samo:

- obvious vulnerable unsupported component
- dangerous configuration

ako direktno utiče na app attack surface.

---

# 242. DEBUG / DEV DEPENDENCY U PRODUCTION-U

Ako otvara route/tool bez auth-a.

---

# 243. ADMIN TOOLS

DB console, profiler, debug toolbar u production-u može biti ozbiljan problem.

---

# 244. DATABASE ACCESS

App DB user treba najmanje privilegije potrebne za runtime.

---

# 245. DB SUPERUSER

Ako app normalno radi kao superuser:

blast radius injection/compromise raste.

---

# 246. SEPARATE MIGRATION PRIVILEGE

Može biti security hardening, ali ne zahtevaj ako deployment context ne podržava.

---

# 247. OBJECT STORAGE CREDENTIAL

Scoped permissions.

---

# 248. CLOUD IAM

App credential ne treba širok admin pristup bez potrebe.

---

# 249. QUEUE PERMISSIONS

Worker/service treba minimalan potrebni scope.

---

# 250. SERVICE-TO-SERVICE AUTH

Internal network location sama po sebi možda nije dovoljno trust.

---

# 251. MUTUAL TLS / SIGNED TOKENS

Ne uvodi automatski.

Prvo analiziraj threat model.

---

# 252. INTERNAL ADMIN API

Ako samo "nije dokumentovan":

to nije zaštita.

---

# 253. NETWORK BOUNDARY

Proveri da li internal service zaista nije internet-accessible.

Ako infrastructure nije dostupna:

**NETWORK EXPOSURE: NOT VERIFIED**

---

# 254. SSRF + INTERNAL TRUST

Najopasnija kombinacija:

```text
SSRF
+
internal unauthenticated admin service
```

---

# 255. SSRF + CLOUD CREDENTIALS

Proceni konkretnu platformu.

---

# 256. ORIGIN EXPOSURE

Ako CDN/WAF štiti public domain:

da li origin može direktno da se pogodi i zaobiđe protection?

---

# 257. TRUSTED HEADERS

Ako edge dodaje:

```text
X-Authenticated-User
X-Internal
```

origin mora prihvatati te headers samo od trusted edge-a.

---

# 258. HEADER SPOOFING

Direct origin access može omogućiti client-u da sam pošalje trusted header.

---

# 259. ERROR HANDLING

Security failures treba fail-closed kada je authorization/authentication nepoznat.

---

# 260. AUTH SERVICE FAILURE

Ne sme:

```text
auth provider timeout
↓
allow request
```

ako operation zahteva auth.

---

# 261. PERMISSION STORE FAILURE

Isto za authorization.

---

# 262. CACHE FAILURE

Ako permission cache padne:

proveri fallback.

---

# 263. DEFAULT-ALLOW

Search for:

```text
catch {
  return true
}
```

u security decisions.

---

# 264. UNKNOWN ROLE

Ne mapiraj unknown role na privileged default.

---

# 265. DEFAULT TENANT

Missing tenant context ne sme pasti na global/default tenant koji izlaže data.

---

# 266. TESTING

Pregledaj:

- auth tests
- authorization matrix
- negative tests
- cross-user tests
- tenant tests
- injection tests
- upload tests

---

# 267. HAPPY PATH TEST NIJE SECURITY TEST

`owner can update resource` ne dokazuje:

`non-owner cannot`.

---

# 268. NEGATIVE AUTH TEST

Za sensitive route:

```text
unauthenticated
authenticated wrong user
authenticated right user
privileged user
```

gde relevantno.

---

# 269. CROSS-TENANT TEST

Tenant A credential + Tenant B resource ID.

---

# 270. MASS ASSIGNMENT TEST

Dodaj hidden privileged fields.

---

# 271. SQL INJECTION TEST

Samo na recognized untrusted raw query paths.

Ne bombarduj safe ORM endpoints bez razloga.

---

# 272. SSRF TEST

Koristi bezbedne controlled endpoints/test environment.

Ne targetiraj third-party/private systems bez odobrenja.

---

# 273. UPLOAD TEST

- oversized
- wrong content
- malicious filename
- executable/active content

u kontrolisanom environment-u.

---

# 274. TOKEN TEST

- expired
- revoked
- malformed
- wrong issuer/audience
- old refresh token

prema actual modelu.

---

# 275. CONCURRENCY SECURITY TEST

One-time resource:

```text
same coupon/reset/invite
```

paralelno.

---

# 276. SESSION TEST

Logout + reuse old session.

---

# 277. PASSWORD CHANGE TEST

Old session/token behavior nakon promene.

---

# 278. ROLE CHANGE TEST

User izgubi admin role, zatim koristi old token/session.

---

# 279. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

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

Koristi:

## P0 - CRITICAL

Primeri:

- unauthenticated remote takeover
- cross-tenant critical data access at scale
- arbitrary code execution u production context-u
- critical production secrets exposed sa direktnim takeover impact-om
- arbitrary financial action
- auth bypass do administrative privileges

## P1 - HIGH

- serious IDOR/BOLA
- privilege escalation
- exploitable injection sa značajnim impact-om
- critical SSRF do sensitive internal resource-a
- account takeover flow
- insecure webhook koji menja critical state
- sensitive data exposure

## P2 - MEDIUM

- meaningful security weakness sa potrebnim preconditions
- limited stored XSS
- restricted data exposure
- significant CSRF na non-critical action
- constrained abuse path

## P3 - LOW

- limited information disclosure
- difficult edge-case weakness
- defense-in-depth gap sa malim direct impact-om

## P4 - HARDENING

- security best practice bez potvrđenog exploit path-a

---

# 281. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code/config/test direktno potvrđuje vulnerability path.

MEDIUM:

jak static evidence postoji, ali deployment/exposure nije potpuno potvrđen.

LOW:

zavisi od nepoznate infrastructure/provider konfiguracije.

---

# 282. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 283. EXPLOITABILITY

Koristi:

```text
TRIVIAL
LOW COMPLEXITY
MODERATE
HIGH COMPLEXITY
NOT VERIFIED
```

Ne koristi CVSS broj bez dovoljno podataka ili eksplicitnog zahteva.

---

# 284. SECURITY CATEGORY

Označi:

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

Koristi:

```text
A - reproduced in controlled environment
B - complete executable code path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 286. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. route reachability
2. authentication
3. authorization
4. middleware/interceptors
5. service checks
6. repository/DB constraints
7. deployment exposure
8. framework/library security behavior
9. tests
10. exploit preconditions

Ne prijavljuj iz jednog code fragment-a ako drugi layer zatvara attack path.

---

# 287. NE ZOVI SVE "CRITICAL"

Severity mora pratiti realan:

- attacker
- precondition
- data/action
- blast radius

---

# 288. NE PRIJAVLJUJ MISSING HEADER KAO VULNERABILITY SAM PO SEBI

CSP/HSTS/nosniff mogu biti važni, ali bez konkretnog attack path-a najčešće su hardening findings.

---

# 289. NE PRIJAVLJUJ JWT KAO VULNERABILITY

JWT je format/mehanizam.

Problem je konkretna implementacija.

---

# 290. NE PRIJAVLJUJ LOCALSTORAGE SAMO PO SEBI

Threat zavisi od XSS, token lifetime-a i app modela.

---

# 291. NE PRIJAVLJUJ PUBLIC ID KAO IDOR

Sequential/numeric ID nije IDOR bez missing authorization-a.

---

# 292. NE PRIJAVLJUJ CORS `*` AUTOMATSKI

Public unauthenticated API može legitimno imati wildcard.

---

# 293. NE PRIJAVLJUJ OPENAPI/Swagger KAO SECURITY BUG SAMO ZATO ŠTO JE JAVAN

Proveri da li izlaže sensitive internal data ili operations.

---

# 294. NE PRIJAVLJUJ VERSION BANNER KAO HIGH SEVERITY

Informational disclosure bez exploit path-a je nizak prioritet.

---

# 295. NE TRAŽI WAF KAO FIX ZA APP BUG

WAF može biti defense-in-depth.

Popravi root vulnerability.

---

# 296. NE TRAŽI CAPTCHA KAO FIX ZA AUTHORIZATION

CAPTCHA nije authorization control.

---

# 297. NE MENJAJ KOD

Tokom audita:

- ne menja auth
- ne rotira secrets
- ne blokira users
- ne menja firewall
- ne briše routes
- ne menja permissions

osim ako je eksplicitno odobreno.

Prvo završi audit.

---

# 298. OUTPUT - APPLICATION_SECURITY_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- security architecture
- attacker models
- attack surface
- najveći rizici
- overall evidence quality

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

Ne štampaj samu secret vrednost u report.

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

Za svaki sensitive resource:

```text
User A owns resource
↓
User B authenticates
↓
B sends A's resource ID
```

Pitaj gde exact authorization sprečava access.

---

# 305. SECOND PASS - WRONG TENANT ATTACK

```text
Tenant A credential
↓
Tenant B resource ID
```

Proveri:

- direct API
- search
- export
- cache
- files

---

# 306. SECOND PASS - HIDDEN FIELD ATTACK

Dodaj privileged fields svakom relevantnom create/update request-u.

---

# 307. SECOND PASS - LEGACY ROUTE ATTACK

Pronađi stare:

- v1
- deprecated
- internal
- mobile legacy

rute i uporedi auth sa novim flow-om.

---

# 308. SECOND PASS - TOKEN REUSE

Testiraj:

- logout pa reuse
- reset pa reuse
- refresh rotation pa reuse
- role revoke pa old token

---

# 309. SECOND PASS - RESET TAKEOVER

Prođi password reset flow kao attacker:

- request
- token
- reuse
- concurrent use
- host generation

---

# 310. SECOND PASS - MASS ASSIGNMENT

Pošalji:

```json
{
  "ownerId": "attacker",
  "role": "admin",
  "verified": true,
  "balance": 999999
}
```

prema actual fields.

---

# 311. SECOND PASS - INJECTION SINKS

Repository-wide pronađi:

- raw SQL
- shell execution
- templates
- filesystem paths
- server-side URLs
- unsafe deserialization

Zatim prati untrusted input do svakog sink-a.

---

# 312. SECOND PASS - SSRF

Za svaki server-side URL fetch pitaj:

> Ko može kontrolisati destination?

Zatim analiziraj:

- scheme
- redirect
- DNS resolution
- internal ranges

---

# 313. SECOND PASS - FILE ATTACK

Za upload/download testiraj:

- filename
- content
- path
- access control
- serving origin

---

# 314. SECOND PASS - SECRET SEARCH

Pretraži:

- current source
- config
- examples
- CI
- Docker
- infrastructure

Ako Git history može biti pregledan, proveri i history.

---

# 315. SECOND PASS - TRUSTED HEADER ATTACK

Pošalji direktno headers koje bi normalno postavio:

- proxy
- CDN
- gateway

Pitaj može li client da spoofuje identity/internal trust.

---

# 316. SECOND PASS - ADMIN ATTACK SURFACE

Pregledaj sve admin actions za:

- missing finer-grained authorization
- destructive operations
- hidden bypass flags
- user impersonation

---

# 317. SECOND PASS - ERROR LEAK

Izazovi:

- validation
- DB error
- unexpected exception
- provider error

i pregledaj client response/log behavior.

---

# 318. SECOND PASS - CACHE LEAK

Pozovi personalized endpoint kao User A pa User B.

Proveri da A response ne može biti vraćen B.

---

# 319. SECOND PASS - CONCURRENT ONE-TIME ACTION

Za:

- coupon
- token
- invite
- credit
- redemption

pokreni dva requests istovremeno.

---

# 320. SECOND PASS - AUTH SERVICE FAILURE

Simuliraj:

- identity provider outage
- permission store outage
- cache outage

Pitaj da li security decision failuje zatvoreno tamo gde mora.

---

# 321. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- attacker models su eksplicitni
- public/internal/admin attack surface je inventarisan
- auth i authorization nisu pomešani
- svaki sensitive resource ima ownership/permission analizu
- cross-tenant scenario je eksplicitno testiran
- nested resources imaju parent-child scope proveru
- field-level authorization je analizirana
- mass assignment je testiran
- login/reset/session/token lifecycle je mapiran
- token revocation/reuse je analiziran
- CSRF je primenjen samo na relevantan credential model
- CORS nije predstavljen kao authorization
- injection finding prati untrusted input do stvarnog sink-a
- framework escaping/parameterization je proverena pre XSS/SQLi finding-a
- SSRF uključuje redirects/internal targets gde relevantno
- file upload audit obuhvata storage i serving, ne samo upload validation
- exposed secret finding razlikuje test/example od realnog credential-a
- browser-visible env values nisu tretirane kao secrets ako su dizajnirane da budu public
- raw error/provider objects nisu exposed
- trusted proxy headers su analizirani kroz direct origin exposure
- internal endpoint nije smatran bezbednim samo zato što je "internal"
- business logic abuse i concurrency su uključeni
- P4 hardening je strogo odvojen od exploitable vulnerabilities
- severity prati realan attacker, preconditions i blast radius
- nijedan P0/P1 nije zasnovan samo na best-practice odsustvu

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte MFA, CSP, WAF, secure headers i koristite OWASP preporuke.

To nije application security audit.

Tražim probleme poput:

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

ili:

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

ili:

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

ili:

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

ili:

```text
password reset URL generated using incoming Host header
↓
attacker triggers reset with forged Host
↓
victim receives link to attacker-controlled domain
↓
token is exposed when victim clicks
```

ili:

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

ili:

```text
upload endpoint allows SVG
↓
file is served inline from main application origin
↓
uploaded active content executes under application origin
↓
stored XSS affects other authenticated users
```

ili:

```text
production frontend bundle contains provider secret
↓
browser downloads bundle
↓
attacker extracts key
↓
key has privileged server API scope
```

To su application security problemi koje treba da pronađeš.

Razmišljaj kroz:

- attacker identity
- trust boundary
- authentication
- authorization
- resource ownership
- tenant scoping
- untrusted input
- dangerous sink
- credential lifecycle
- server-side capabilities
- data exposure
- concurrency abuse

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Ko je attacker?

> Da li mora biti authenticated?

> Koje privilegije mora već imati?

> Koji tačan request/input koristi?

> Koja security kontrola bi trebalo da ga zaustavi?

> Gde ta kontrola nedostaje ili može da se zaobiđe?

> Koji tačan podatak ili akciju attacker dobija?

> Koliki je blast radius?

Ako route/exposure nije potvrđen:

**NOT VERIFIED.**

Ako vulnerability zavisi od nepoznate infrastructure konfiguracije:

**INFRASTRUCTURE EXPOSURE NOT VERIFIED.**

Ako postoji samo defense-in-depth poboljšanje bez potvrđenog attack path-a:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih exploitable security problema sa kompletnim attack path-om nego napisati 100 generičkih OWASP stavki.

Cilj je dobiti forenzički precizan application security audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- deterministic security regression test
- authorization fix
- tenant isolation safeguard
- secure input handling
- token/session correction
- secret rotation
- trust-boundary hardening
- production security remediation
