---
id: UPL-IT-021
number: 21
slug: ultimate-backend-architecture-audit
title: Ultimate Backend Architecture Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# ULTIMATE BACKEND ARCHITECTURE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletne backend arhitekture aplikacije ili servisa.

Glavni cilj:

> Utvrditi kako backend zaista funkcioniše kroz request lifecycle, business logiku, persistence, background processing, integracije, autentikaciju, autorizaciju, concurrency, failures i production infrastrukturu, i pronaći realne arhitektonske probleme koji mogu dovesti do bugova, data corruption-a, security problema, performance bottleneck-a ili teškog održavanja.

Ovo nije:

- generički backend code review
- savet da se "koristi Clean Architecture"
- automatska preporuka za microservices
- automatska preporuka za event-driven architecture
- automatsko prebacivanje u serverless
- površna provera endpoint-a
- lista popularnih backend pattern-a
- refactor pre razumevanja sistema

Prioritet:

**correctness > data integrity > security > reliability > architectural clarity > scalability > performance > elegance**

Bolje je pronaći 8 stvarnih sistemskih problema nego napisati 100 generičkih preporuka.

---

# 1. PRVO UTVRDI STVARNI BACKEND STACK

Pre bilo kakvog finding-a utvrdi:

- programski jezik
- runtime verziju
- framework
- framework verziju
- package manager
- database
- ORM/query layer
- cache
- message queue
- job system
- object storage
- auth provider
- session/token model
- API style
- deployment platform
- container/serverless model
- reverse proxy
- CDN ako postoji
- observability stack
- CI/CD
- test framework

Primeri:

```text
Node.js
NestJS / Express / Fastify
PostgreSQL
Prisma
Redis
BullMQ
S3
JWT
Docker
Kubernetes
```

ali nemoj pretpostavljati stack unapred.

---

# 2. REPOSITORY KAO SOURCE OF TRUTH

Pregledaj default branch i stvarni kod.

Dokumentacija predstavlja nameru.

Kod predstavlja stvarno ponašanje.

Ako README tvrdi jedno, a kod drugo:

označi discrepancy.

---

# 3. MAPIRAJ REPOSITORY

Pre detaljne analize napravi mapu:

- entry points
- API routes/controllers
- middleware
- business/services
- repositories
- models/entities
- database migrations
- jobs
- workers
- events
- external integrations
- auth
- configuration
- tests
- scripts
- infrastructure
- deployment
- CI/CD

Ako je monorepo:

mapiraj svaki relevantan package/service.

---

# 4. UTVRDI ARHITEKTONSKI MODEL

Klasifikuj stvarni model, na primer:

```text
modular monolith
layered monolith
service-oriented
microservices
serverless functions
event-driven
hybrid
```

Ne ocenjuj model po trendu.

Pitaj:

> Da li trenutna arhitektura odgovara stvarnoj veličini i problemu sistema?

---

# 5. NAPRAVI DEPENDENCY MAPU

Mapiraj smer zavisnosti između glavnih slojeva.

Primer:

```text
HTTP
↓
Controller
↓
Service
↓
Repository
↓
Database
```

Ako postoji domain layer:

```text
Transport
↓
Application
↓
Domain
↓
Infrastructure
```

Dokumentuj stvarnu strukturu.

---

# 6. LAYER BOUNDARIES

Za svaki sloj pitaj:

- šta sme da zna
- šta ne treba da zna
- ko ga poziva
- koga on poziva

Traži situacije gde:

- controller sadrži business logiku
- repository odlučuje business pravila
- domain zavisi od HTTP framework-a
- database model direktno predstavlja API contract

---

# 7. BUSINESS LOGIC LOCATION

Za svaki critical flow odredi gde business pravilo stvarno živi.

Primer:

```text
POST /orders
↓
controller
↓
service
↓
repository
```

Ako validacija važnog invariant-a postoji samo u controller-u, background job ili drugi caller možda može da je zaobiđe.

---

# 8. CROSS-ENTRY-POINT INVARIANTS

Ako isti business operation može biti pokrenut kroz:

- API
- worker
- cron
- admin
- webhook

proveri da svi prolaze kroz isti authority/business layer.

---

# 9. GOD SERVICE

Traži service/class koji upravlja:

- auth
- DB
- email
- payment
- notifications
- files

u jednom ogromnom modulu.

Ali ne prijavljuj samo na osnovu broja linija.

Pokaži:

- coupling
- change amplification
- test difficulty
- conflicting responsibilities

---

# 10. GOD CONTROLLER

Controller koji:

- parsira request
- validira
- radi business logic
- query-uje DB
- poziva external API
- šalje email

ima jasnu boundary degradaciju.

---

# 11. THIN CONTROLLER NIJE CILJ SAM PO SEBI

Ne meri kvalitet arhitekture brojem linija u controller-u.

Bitno je da transport-specific behavior ostane odvojen od business pravila.

---

# 12. DOMAIN MODEL

Utvrdi da li domain koncepti postoje eksplicitno ili su razbacani kroz:

- request DTO
- ORM model
- utility funkcije
- controller uslove

---

# 13. ANEMIC MODEL

Anemic model nije automatski bug.

Ako service-based architecture jasno i pouzdano čuva business invariants, ne forsiraj rich domain model.

---

# 14. DTO GRANICE

Proveri razliku između:

- request DTO
- domain model
- persistence model
- response DTO

Ako su isti object svuda, proveri realne posledice.

---

# 15. ORM ENTITY KAO API RESPONSE

Ako se ORM row direktno vraća client-u:

proveri:

- sensitive fields
- schema coupling
- accidental data exposure
- migration impact

---

# 16. MASS ASSIGNMENT

Ako request body direktno ulazi u ORM create/update:

```text
req.body
↓
database update
```

proveri da korisnik ne može menjati:

- ownerId
- role
- status
- billing fields
- internal flags

---

# 17. WHITELIST INPUT POLJA

Critical write operation treba eksplicitno da definiše dozvoljena polja.

---

# 18. REQUEST LIFECYCLE

Za svaki critical endpoint mapiraj:

```text
request
↓
routing
↓
middleware
↓
authentication
↓
authorization
↓
validation
↓
business logic
↓
database
↓
external side effects
↓
response
```

---

# 19. MIDDLEWARE ORDER

Redosled može biti security/correctness kritičan.

Primer:

```text
route
↓
business handler
↓
auth middleware
```

ako framework/config to zaista dozvoljava.

---

# 20. GLOBAL VS ROUTE MIDDLEWARE

Utvrdi šta je globalno, a šta route-specific.

Ne pretpostavljaj zaštitu samo zato što middleware postoji negde.

---

# 21. ROUTE INVENTORY

Napraviti tabelu:

| Method | Route | Auth | Authorization | Validation | Handler |
|---|---|---|---|---|---|

Posebno za:

- create
- update
- delete
- admin
- upload
- export
- webhook

---

# 22. DUPLICATE ROUTES

Traži:

- shadowed route
- conflicting route
- duplicate handler
- različitu zaštitu za isti resource

---

# 23. VERSIONED API

Ako postoji:

```text
/v1
/v2
```

proveri:

- shared business logic
- deprecation
- compatibility

---

# 24. INTERNAL API

Ako postoji internal/admin API:

ne pretpostavljaj da "nije dokumentovan" znači bezbedan.

Mora imati eksplicitnu zaštitu.

---

# 25. AUTHENTICATION BOUNDARY

Mapiraj:

```text
credential
↓
verification
↓
principal/user
↓
request context
```

---

# 26. AUTHORIZATION BOUNDARY

Posebno mapiraj:

```text
authenticated user
↓
permission/ownership
↓
resource access
```

Authentication nije authorization.

---

# 27. BUSINESS AUTHORIZATION

Pravila poput:

- owner može editovati
- admin može delete
- member može view

treba da budu centralno i dosledno implementirana.

---

# 28. AUTHORIZATION DUPLIKACIJA

Ako isti rule postoji u 7 controller-a:

verovatno postoji drift rizik.

Pronađi konkretne razlike.

---

# 29. SERVICE BYPASS

Ako jedan code path direktno poziva repository i zaobilazi authorization service:

može nastati privilege bypass.

---

# 30. INTERNAL CALL TRUST

Backend funkcija pozvana "interno" nije automatski trusted ako input može poticati iz:

- queue
- webhook
- admin
- compromised service

---

# 31. VALIDATION LAYER

Mapiraj:

- syntax validation
- schema validation
- business validation
- database constraints

---

# 32. SCHEMA VALIDATION

Proveri:

- required
- type
- enum
- bounds
- nested objects

---

# 33. BUSINESS VALIDATION

Primer:

```text
endDate > startDate
```

ili:

```text
amount <= available balance
```

Ovo pripada business invariant-u, ne samo schema validator-u.

---

# 34. DATABASE KAO POSLEDNJA ODBRANA

Za critical invariant proveri:

- unique constraint
- FK
- check constraint
- transaction

gde database može pouzdano da ga enforce-uje.

---

# 35. CLIENT VALIDATION

Nikad ne računaj frontend validation kao backend zaštitu.

---

# 36. RESPONSE CONTRACT

Za endpoint proveri:

- success shape
- error shape
- nullability
- pagination
- metadata

---

# 37. INCONSISTENT RESPONSES

Ako isti API vraća:

```text
{ data: ... }
```

negde, a:

```text
{ result: ... }
```

drugde:

to je maintainability/API design pitanje.

Severity zavisi od client impact-a.

---

# 38. ERROR CONTRACT

Mapiraj:

- error code
- message
- details
- correlation ID

---

# 39. INTERNAL ERROR LEAK

Ne vraćaj:

- stack trace
- SQL
- file path
- secrets

client-u u production-u.

---

# 40. ERROR MAPPING

Razlikuj:

- validation
- auth
- authorization
- not found
- conflict
- rate limit
- internal error
- upstream failure

---

# 41. GENERIC 500

Ako sve postaje 500:

client ne može pravilno reagovati, monitoring gubi semantiku.

---

# 42. FALSE 200

Ne vraćaj HTTP 200 sa:

```text
success: false
```

za normalne protocol-level error-e bez veoma dobrog razloga.

---

# 43. DATABASE ARCHITECTURE

Mapiraj:

- primary database
- replicas
- cache
- transactions
- migration system
- connection pooling

---

# 44. REPOSITORY BOUNDARY

Repository treba da predstavlja data access abstraction samo ako projekat to zaista koristi.

Ne uvodi repository pattern automatski preko dobrog ORM layer-a bez potrebe.

---

# 45. QUERY LOGIC DUPLIKACIJA

Isti complex query u više mesta može driftovati.

---

# 46. TRANSACTION BOUNDARY

Za svaki critical write flow pitaj:

> Šta mora da bude atomic?

Primer:

```text
create order
↓
create lines
↓
decrement inventory
↓
record payment state
```

---

# 47. TRANSACTION TOO SMALL

Ako transaction pokriva samo prvi DB write, partial state može ostati.

---

# 48. TRANSACTION TOO LARGE

Ako transaction drži lock dok čeka:

- HTTP API
- email
- payment gateway

može napraviti contention i rollback complexity.

---

# 49. NETWORK INSIDE DB TRANSACTION

Visok signal.

Proveri da li external call radi dok transaction ostaje otvorena.

---

# 50. DUAL WRITE

Jedan od glavnih backend problema:

```text
DB write
↓
publish message
```

Šta ako DB uspe, message ne uspe?

---

# 51. OUTBOX

Ako consistency zahteva da DB change i event publish budu povezani, proveri da li postoji:

- transactional outbox
- durable event log
- druga pouzdana strategija

Ne preporučuj outbox za svaki email.

---

# 52. SIDE EFFECT POSLE COMMIT-A

Primer:

```text
transaction commits
↓
email fails
```

Da li email failure treba da rollback-uje business operation?

Verovatno ne, ali zavisi od domain-a.

---

# 53. SIDE EFFECT PRE COMMIT-A

Suprotno:

```text
email/payment side effect
↓
DB commit fails
```

Može nastati spoljašnji efekat bez lokalnog record-a.

---

# 54. PAYMENT BOUNDARY

Ako postoji payment:

posebno analiziraj:

- authorization
- capture
- local DB
- webhook
- retries
- idempotency

---

# 55. IDEMPOTENCY

Za critical write API pitaj:

> Šta ako isti request stigne dva puta?

---

# 56. DUPLICATE CLIENT REQUEST

Scenario:

```text
client sends POST
↓
server commits
↓
response lost
↓
client retries
```

Može nastati duplicate.

---

# 57. IDEMPOTENCY KEY

Ako API podržava:

proveri scope i storage.

Key treba da se veže za odgovarajući:

- user
- operation
- payload semantics

---

# 58. IDEMPOTENCY COLLISION

Isti key sa različitim payload-om mora imati definisano ponašanje.

---

# 59. REQUEST DEDUPLICATION

In-memory Map nije dovoljna ako:

- postoji više server instanci
- process restartuje

---

# 60. CONCURRENCY

Za critical resource mapiraj:

```text
Request A
Request B
↓
same data
```

---

# 61. READ-MODIFY-WRITE

Klasičan race:

```text
read balance = 100
↓
two requests subtract 80
```

Bez atomicity-ja oba mogu proći.

---

# 62. UNIQUE BUSINESS ACTION

Primer:

- redeem coupon once
- accept invite once
- issue refund once

Proveri DB-level zaštitu.

---

# 63. OPTIMISTIC LOCKING

Ako se koristi:

proveri version/revision semantics.

---

# 64. PESSIMISTIC LOCKING

Ako se koristi:

proveri:

- lock scope
- duration
- deadlock
- contention

---

# 65. DISTRIBUTED LOCK

Ako sistem ima više instanci:

in-process mutex ne daje distributed mutual exclusion.

---

# 66. LOCK NECESSITY

Nemoj uvoditi distributed lock ako DB atomic operation/constraint može jednostavnije rešiti invariant.

---

# 67. DEADLOCK

Ako više transaction-a zaključava iste resurse različitim redom:

dokumentuj konkretan scenario.

---

# 68. RETRY TRANSACTION

Ako DB vraća serialization/deadlock failure:

proveri retry samo kada operation može bezbedno da se ponovi.

---

# 69. DATABASE CONNECTION POOL

Utvrdi:

- pool size
- server instances
- serverless concurrency
- DB limit

---

# 70. CONNECTION EXPLOSION

Scenario:

```text
20 serverless instances
x
20 DB connections
=
400
```

Ako DB podržava 100:

production failure.

Koristi realne config vrednosti, ne nagađaj.

---

# 71. SERVERLESS DATABASE

Ako deployment može horizontalno eksplodirati:

proveri pooling/proxy model.

---

# 72. CONNECTION LEAK

Raw DB connection/transaction mora biti release-ovan.

---

# 73. QUERY PERFORMANCE

Mapiraj critical queries.

Ne pretvaraj audit u čisti SQL audit, ali pronađi arhitektonske bottleneck-e.

---

# 74. N+1

Posebno API endpoint:

```text
GET /items
↓
100 rows
↓
query owner per item
```

---

# 75. UNBOUNDED QUERY

Endpoint koji vraća celu tabelu bez:

- limit
- pagination
- hard business bound

može biti scalability risk.

---

# 76. PAGINATION

Proveri:

- offset
- cursor
- stable ordering

prema data modelu.

---

# 77. LARGE RESPONSE

Backend može potrošiti:

- DB
- memory
- serialization CPU
- bandwidth

pre nego što response stigne client-u.

---

# 78. STREAMING

Za velike file/data response-e proveri da li se sve prvo učitava u RAM.

---

# 79. FILE UPLOAD

Mapiraj:

```text
HTTP upload
↓
validation
↓
temporary storage
↓
scan/process
↓
final storage
↓
DB
```

---

# 80. UPLOAD MEMORY

Ako server čita ceo veliki upload u memory:

OOM risk.

---

# 81. UPLOAD SIZE LIMIT

Mora postojati odgovarajuća granica na:

- reverse proxy
- framework
- app logic

---

# 82. MIME / CONTENT VALIDATION

Ne veruj samo client-provided content type-u.

---

# 83. OBJECT STORAGE

Ako upload ide u S3-like storage:

proveri:

- key generation
- overwrite
- permissions
- cleanup
- orphan objects

---

# 84. DB + OBJECT STORAGE DUAL WRITE

Scenario:

```text
object uploaded
↓
DB insert fails
```

Orphan file.

Suprotno:

```text
DB row created
↓
upload fails
```

Broken reference.

---

# 85. CLEANUP STRATEGY

Orphan cleanup treba biti idempotent i ne sme brisati live object.

---

# 86. PRESIGNED URL

Ako backend izdaje presigned upload/download URL:

proveri:

- object scope
- expiry
- content restrictions
- authorization pre izdavanja

---

# 87. CACHE

Mapiraj:

- in-memory
- Redis
- CDN
- application cache

---

# 88. CACHE SOURCE OF TRUTH

Cache nije authority osim ako architecture eksplicitno tako radi.

---

# 89. CACHE INVALIDATION

Za svaki cached resource pitaj:

> Šta se događa nakon write-a?

---

# 90. STALE AUTHORIZATION CACHE

Ako permission/role promena kasni zbog cache-a:

security impact.

---

# 91. CACHE KEY

Mora uključiti relevantne dimensions:

- user
- locale
- query
- tenant

gde response zavisi od njih.

---

# 92. CROSS-USER CACHE

P0/P1 scenario:

```text
GET /profile
↓
cache key = "/profile"
↓
User A response cached
↓
User B receives same cache entry
```

Aktivno proveri.

---

# 93. CDN

Ako private/auth response ide preko CDN-a:

proveri cache-control/Vary i authorization model.

---

# 94. CACHE STAMPEDE

Ako popularan cache key istekne:

mnogo request-a može istovremeno udariti DB/upstream.

Prijavi samo sa realnim high-traffic context-om.

---

# 95. BACKGROUND JOBS

Mapiraj:

- cron
- queue
- workers
- delayed jobs
- scheduled jobs

---

# 96. JOB DURABILITY

Ako job predstavlja critical posao:

mora preživeti process restart ako product to zahteva.

---

# 97. IN-MEMORY JOB

`setTimeout`, local scheduler ili background thread nije durable queue u multi-instance production-u.

---

# 98. JOB IDEMPOTENCY

Queue može redeliver-ovati job.

Worker treba biti bezbedan za duplicate execution gde sistem daje at-least-once semantics.

---

# 99. JOB ACK

Pitaj:

> Kada job sistem smatra posao završenim?

Ako ack pre critical side effect-a:

job može biti izgubljen.

---

# 100. ACK POSLE SIDE EFFECT-A

Ako process padne posle side effect-a, pre ack-a:

job može biti ponovljen.

Idempotency je ključ.

---

# 101. POISON JOB

Permanentno nevalidan job ne sme beskonačno trošiti worker.

Proveri:

- max attempts
- dead letter
- failed state

---

# 102. RETRY POLICY

Razlikuj:

- transient
- permanent
- validation
- auth
- rate limit

---

# 103. EXPONENTIAL BACKOFF

Ne zahtevaj konkretan algoritam, ali retry storm treba biti sprečen.

---

# 104. JOB ORDERING

Ako B zavisi od A:

queue mora sačuvati dependency.

---

# 105. MULTIPLE WORKERS

Dva worker-a mogu uzeti povezane poslove paralelno.

Proveri business invariant.

---

# 106. CRON

Periodic job može se pokrenuti na više instanci ako scheduler nije singleton/distributed-aware.

---

# 107. DUPLICATE CRON

Scenario:

```text
instance A starts cron
instance B starts same cron
```

Ako posao nije idempotent:

duplirani side effect.

---

# 108. LEADER ELECTION

Ne uvodi automatski.

DB advisory lock, scheduler platform ili idempotent work mogu biti jednostavniji.

---

# 109. WEBHOOKS

Mapiraj svaki incoming webhook.

---

# 110. WEBHOOK AUTHENTICITY

Proveri:

- signature
- secret
- timestamp/replay protection

prema provider contract-u.

---

# 111. RAW BODY

Neki signature sistemi zahtevaju raw request body.

Proveri middleware ordering.

---

# 112. WEBHOOK IDEMPOTENCY

Provider može poslati isti event više puta.

Event ID treba biti dedupovan gde side effect nije prirodno idempotentan.

---

# 113. OUT-OF-ORDER WEBHOOK

Event 2 može stići pre event 1.

Ako provider ne garantuje ordering, backend mora tolerisati.

---

# 114. WEBHOOK ACK

Ako backend radi 20 sekundi pre 200 response-a:

provider može timeout-ovati i retry-ovati.

Razmotri:

```text
verify
↓
durably enqueue
↓
respond
↓
process async
```

samo ako domain to dozvoljava.

---

# 115. EXTERNAL API INTEGRATIONS

Za svaku mapiraj:

- timeout
- retry
- auth
- rate limit
- circuit behavior
- failure propagation

---

# 116. NO TIMEOUT

External HTTP call bez bounded timeout-a može iscrpeti worker/request capacity.

---

# 117. RETRY NON-IDEMPOTENT

Ne retry-uj POST/mutation naslepo.

---

# 118. NESTED RETRIES

HTTP client retry + service retry + queue retry mogu multiplicirati pokušaje.

Primer:

```text
3 x 3 x 5 = 45 attempts
```

Koristi realne vrednosti ako postoje.

---

# 119. CIRCUIT BREAKER

Ne zahtevaj ga automatski.

Relevantno kada unstable dependency može srušiti kapacitet celog servisa.

---

# 120. BULKHEAD

Isto.

Razdvajanje resource pool-a ima smisla samo uz realan failure containment problem.

---

# 121. TIMEOUT BUDGET

Ako request ima 5 s globalni timeout, downstream call od 10 s je besmislen.

Mapiraj timeout chain.

---

# 122. DEADLINE PROPAGATION

Ako architecture podržava, downstream operacije treba da znaju koliko request budget-a ostaje.

P4/P2 prema stvarnom problemu.

---

# 123. CLIENT DISCONNECT

Ako client odustane:

proveri da li skupa server operacija treba:

- cancel
- nastavi durable
- bude nezavisna

---

# 124. REQUEST CANCELLATION

Nemoj cancel-ovati business mutation samo zato što HTTP socket nestane ako je mutation već durable/critical.

---

# 125. EMAIL

Ako email nije critical transaction:

nemoj blokirati request bez razloga.

Ali proceni product semantics.

---

# 126. NOTIFICATIONS

Isti princip za:

- push
- SMS
- email

Side effect može biti async.

---

# 127. EMAIL DUPLIKACIJA

Queue retry može poslati email više puta.

Za password reset ili receipt to može biti značajno.

---

# 128. AUDIT LOG

Ako domain zahteva immutable audit trail:

proveri da normalni update/delete ne može nehotice izbrisati istoriju.

---

# 129. BUSINESS EVENTS

Ako sistem emituje domain events:

utvrdi:

- ko ih stvara
- kada
- durability
- consumers

---

# 130. EVENTUAL CONSISTENCY

Ako jedan servis/update nije trenutno vidljiv drugom:

dokumentuj očekivanu consistency granicu.

---

# 131. MICROSERVICES

Ako postoji više servisa, mapiraj:

```text
Service A
↓
Service B
↓
Service C
```

---

# 132. DISTRIBUTED TRANSACTION

Ne očekuj klasičnu ACID transaction preko više servisa/datastore-a.

Analiziraj:

- saga
- compensation
- idempotency
- reconciliation

ako use case to zahteva.

---

# 133. SERVICE OWNERSHIP

Jedan servis treba da ima jasan authority nad svojim podacima.

Shared DB između "microservices" može napraviti tight coupling.

Ali ne proglašavaj automatski anti-pattern ako je deployment zapravo modular monolith.

---

# 134. CROSS-SERVICE DB WRITE

Ako Service A direktno menja tabele Service B:

boundary je probijena.

Pronađi realni impact.

---

# 135. NETWORK CHATTINESS

Jedan request koji pravi 20 synchronous service-to-service poziva može biti latency/reliability problem.

---

# 136. FAN-OUT

Ako endpoint poziva mnogo downstream servisa paralelno:

proveri:

- partial failure
- timeout
- resource usage

---

# 137. CHAIN FAILURE

Ako A zavisi od B, B od C, C od D:

availability se multiplicira.

Dokumentuj critical chain.

---

# 138. SERVERLESS

Ako backend koristi functions/serverless:

proveri:

- stateless assumptions
- cold start
- connection pooling
- execution timeout
- ephemeral filesystem
- background work

---

# 139. GLOBAL MEMORY U SERVERLESS-U

Global object može preživeti između invocation-a, ali ne postoji garancija.

Ne koristi ga kao durable state.

---

# 140. EPHEMERAL FILESYSTEM

Ne čuvaj durable user data samo u `/tmp` ili local function filesystem-u.

---

# 141. BACKGROUND AFTER RESPONSE

Neke serverless platforme mogu prekinuti rad posle response-a ili nemaju garanciju dugotrajnog background execution-a.

Ako code radi:

```text
respond()
↓
sendEmailAsync()
```

bez durable mechanism-a, proveri platformu.

---

# 142. COLD START

Ne optimizuj bez merenja.

Ali heavy imports/SDK init mogu biti architecture-level latency risk.

---

# 143. CONTAINER DEPLOYMENT

Ako Docker:

proveri:

- non-root
- health checks
- signal handling
- graceful shutdown
- writable paths

---

# 144. GRACEFUL SHUTDOWN

Na SIGTERM:

proveri:

- stop accepting requests
- finish/abort jobs
- close DB
- flush relevant state

---

# 145. DEPLOY DURING REQUEST

Kubernetes/serverless replacement može prekinuti active requests.

Critical mutations moraju tolerisati retry/unknown outcome.

---

# 146. HEALTH CHECK

Razlikuj:

- liveness
- readiness

Readiness ne treba da kaže "ready" ako servis još ne može da obrađuje critical dependencies, u skladu sa architecture-om.

---

# 147. DEPENDENCY HEALTH

Ne stavljaj sve downstream servise u liveness ako njihov privremeni outage ne znači da proces treba restartovati.

---

# 148. STARTUP MIGRATIONS

Ako svaka replica automatski pokreće DB migrations pri startup-u:

proveri concurrency/deployment safety.

---

# 149. ZERO-DOWNTIME MIGRATION

Schema change treba da bude kompatibilna tokom perioda kada:

```text
old app instances
+
new app instances
```

rade istovremeno.

---

# 150. EXPAND-CONTRACT

Za breaking schema promene razmotri:

```text
expand
↓
deploy compatible code
↓
migrate data
↓
contract
```

ako realan deployment zahteva zero downtime.

---

# 151. COLUMN RENAME

Direktan rename/drop može slomiti stare instance tokom rolling deploy-a.

---

# 152. ENUM MIGRATION

DB enum/schema promena može slomiti old code.

---

# 153. DATA BACKFILL

Veliki backfill unutar blocking migration-a može zaključati tabelu ili produžiti deploy.

---

# 154. CONFIGURATION

Mapiraj:

- env vars
- config files
- secret manager
- defaults

---

# 155. REQUIRED CONFIG

Critical config treba fail-fast ako nedostaje.

---

# 156. UNSAFE DEFAULT

Primer:

```text
JWT_SECRET = env.JWT_SECRET || "secret"
```

Critical security finding.

---

# 157. DEV DEFAULT U PRODUCTION-U

Traži:

- localhost DB
- sandbox payment
- test bucket
- debug CORS
- weak secret

---

# 158. CONFIG VALIDATION

Startup treba da validira required config gde je moguće.

---

# 159. SECRET ROTATION

Ako secret/token može rotirati:

proveri da li deployment zahteva restart i da li old/new overlap treba da postoji.

---

# 160. LOGGING

Proveri strukturisane logove i sensitive podatke.

---

# 161. REQUEST ID

Correlation/request ID može pomoći cross-service debugging-u.

P4 ako nema konkretan observability failure.

---

# 162. TRACE ID

Ako distributed tracing postoji, proveri propagation.

---

# 163. LOG LEVEL

Production ne treba da loguje ogromne debug payload-e.

---

# 164. PII

Maskiraj:

- passwords
- tokens
- personal data
- financial details

---

# 165. ERROR LOGGING

Server error treba imati dovoljno context-a za debugging bez curenja secrets-a.

---

# 166. METRICS

Ako postoje:

- latency
- throughput
- error rate
- queue depth
- DB pool
- cache

proveri da pokrivaju critical dependencies.

---

# 167. HEALTHY CPU, BROKEN APP

Infra metric nije dovoljna.

Service može imati 10% CPU, ali 50% request failure.

Application-level metrics su bitne.

---

# 168. ALERTING

Ne zahtevaj ogromnu monitoring platformu.

Ali critical production servis treba imati način da otkrije ozbiljan failure.

---

# 169. AUDIT / SECURITY LOGGING

Auth/security events mogu zahtevati poseban log stream.

---

# 170. TEST ARCHITEKTURA

Mapiraj:

- unit
- integration
- DB
- API
- E2E
- contract tests

---

# 171. MOCK FALSE CONFIDENCE

Service test sa mocked repository-jem ne dokazuje:

- SQL
- transactions
- constraints

---

# 172. INTEGRATION TEST

Critical persistence flow treba test sa stvarnom ili dovoljno realističnom DB.

---

# 173. API TEST

Proveri:

- auth
- validation
- error contract
- response

---

# 174. CONCURRENCY TEST

Critical invariant treba determinističan race test gde je moguće.

---

# 175. IDEMPOTENCY TEST

Pošalji isti logical request dva puta.

Assert jedan business effect.

---

# 176. LOST RESPONSE TEST

Simuliraj:

```text
server commits
↓
client loses response
↓
same request retried
```

---

# 177. JOB RETRY TEST

Worker izvrši side effect pa padne pre ack-a.

Ponovljeni job ne sme napraviti duplicate critical effect.

---

# 178. WEBHOOK DUPLICATE TEST

Isti event ID dva puta.

---

# 179. WEBHOOK OUT-OF-ORDER TEST

Ako provider to može:

event B pre A.

---

# 180. MIGRATION TEST

Schema migration treba biti testirana na realističnom prethodnom stanju.

---

# 181. DEPLOYMENT COMPATIBILITY TEST

Ako rolling deployment:

testiraj old/new code protiv transitional schema-e gde je bitno.

---

# 182. CHAOS / FAILURE TEST

Za critical dependency simuliraj:

- timeout
- 500
- connection reset
- DB unavailable
- queue unavailable

Ne treba full chaos engineering ako sistem nije dovoljno kompleksan.

---

# 183. STARTUP FAILURE

Ako DB nedostupan:

da li servis:

- fail-uje startup
- postaje unready
- prima request-e koji svi padaju

Dokumentuj nameru.

---

# 184. RESOURCE EXHAUSTION

Analiziraj:

- DB connections
- threads
- queue consumers
- file descriptors
- memory

---

# 185. UNBOUNDED CONCURRENCY

Endpoint koji pokreće `Promise.all`/equivalent preko hiljada item-a može napraviti resource spike.

---

# 186. CONCURRENCY LIMIT

Ne dodaj limit svuda.

Relevantno kada downstream/resource ima ograničen kapacitet.

---

# 187. MEMORY

Large request/response/batch processing može učitati sve u RAM.

---

# 188. STREAM PROCESSING

Za veoma veliki dataset možda treba streaming/batching.

P4/P2 prema realnom input size-u.

---

# 189. BACKPRESSURE

Ako queue producer generiše poslove brže nego consumer može obraditi:

queue može nekontrolisano rasti.

---

# 190. QUEUE DEPTH

Ako nema metrike:

**QUEUE BACKLOG VISIBILITY: NOT VERIFIED**

---

# 191. RATE LIMITING

Arhitektura treba razmotriti abuse/capacity protection.

Detaljni audit dolazi u poseban prompt.

Ovde proveri samo sistemsku poziciju i fail mode.

---

# 192. GLOBAL RATE LIMIT U MULTI-INSTANCE-U

In-memory counter ne daje globalni limit kroz više server instanci.

---

# 193. PROXY / REAL IP

Ako rate/security logika zavisi od client IP-a iza proxy-ja:

proveri trusted proxy configuration.

---

# 194. CORS

CORS nije backend auth mehanizam.

Ne tretiraj ga kao zaštitu API-ja od non-browser client-a.

---

# 195. CSRF

Ako backend koristi cookie-based browser session:

proveri CSRF model.

Ako koristi Authorization header bez browser ambient credential-a:

scope je drugačiji.

---

# 196. SESSION STORE

Ako session state živi in-memory na jednoj instanci:

horizontal scaling može slomiti login bez sticky session-a ili shared store-a.

---

# 197. JWT

Ako stateless JWT:

proveri:

- revocation/logout expectation
- role changes
- expiry

Ne proglašavaj JWT lošim samim po sebi.

---

# 198. REFRESH TOKENS

Mapiraj:

- storage
- rotation
- reuse detection
- revocation

Detaljni auth audit dolazi kasnije, ovde proveri architecture boundary.

---

# 199. MULTI-TENANCY

Ako postoji tenant:

tenant boundary mora prolaziti kroz:

- auth
- queries
- cache
- jobs
- files

---

# 200. TENANT ID IZ CLIENT-A

Ne veruj `tenantId` iz request body-ja bez autorizacije prema authenticated principal-u.

---

# 201. TENANT DB FILTER

Missing tenant filter u jednom repository method-u može biti P0.

---

# 202. TENANT CACHE

Cache key mora uključiti tenant kada response zavisi od njega.

---

# 203. TENANT BACKGROUND JOB

Job payload treba pouzdano da zna tenant/account context.

---

# 204. DATA DELETION

Ako user/tenant data deletion postoji:

mapiraj:

```text
DB
↓
files
↓
cache
↓
search index
↓
queue
↓
analytics/external systems
```

prema product/legal zahtevima.

---

# 205. SOFT DELETE

Ako se koristi, proveri da standardni query ne vraća deleted data slučajno.

---

# 206. CASCADE

Delete jednog parent-a može obrisati neočekivane podatke.

---

# 207. BACKUP

Proveri architecture-level:

- postoji li backup
- šta uključuje
- encryption/access
- restore

Detaljni disaster recovery audit dolazi kasnije.

---

# 208. BACKUP NIJE RESTORE DOKAZ

Backup koji nikada nije restore-testiran nije potvrđen recovery plan.

---

# 209. TIME / CLOCK

Ako business logic koristi vreme:

- expiration
- billing
- scheduling

server time je obično authority.

---

# 210. TIMEZONE

Persistiraj/računaj temporal data prema domain semantici.

Ne koristi server local timezone implicitno.

---

# 211. DST

Scheduled jobs prema lokalnom user vremenu mogu imati DST edge case.

---

# 212. RANDOMNESS

Security tokeni zahtevaju cryptographically secure RNG.

Business random selection ne mora.

---

# 213. UUID

Proveri collision/guessability samo u context-u gde ID služi i kao security secret, što obično ne bi trebalo.

---

# 214. PUBLIC IDs

Sequential ID nije automatski IDOR.

Authorization i resource access rule su bitni.

---

# 215. FEATURE FLAGS

Mapiraj gde se evaluiraju:

- request
- user
- tenant
- process startup

---

# 216. FLAG MID-REQUEST

Ako flag promena usred multi-step operation-a može promeniti semantiku:

proveri consistency.

---

# 217. ROLLOUT COMPATIBILITY

Feature flag može omogućiti novi client behavior dok backend nije potpuno kompatibilan.

---

# 218. DEAD CODE

Legacy endpoint/service koji više nije UI-reachable može i dalje biti public attack surface.

---

# 219. OLD API

"Frontend ga ne koristi" nije razlog da endpoint ostane nezaštićen.

---

# 220. DUPLICATE IMPLEMENTATIONS

Ako postoje old/new service implementations:

proveri koji route koristi koji.

---

# 221. FEATURE MIGRATION

Tokom migracije architecture može imati:

```text
old write path
new write path
```

koji proizvode različite podatke.

---

# 222. CANARY / PARTIAL ROLLOUT

Ako samo deo server instances ima novi kod:

database/event contracts moraju biti kompatibilni.

---

# 223. BACKEND/API VERSION SKEW

Stari client i novi client mogu istovremeno postojati.

Backend ne sme pretpostaviti instant client upgrade.

---

# 224. ENUM EVOLUTION

Novi backend enum može slomiti stare mobile/client parsere.

---

# 225. REQUIRED FIELD

Dodavanje required response field obično ne smeta starom client-u, ali promena postojećeg polja/type-a može.

Analiziraj contract.

---

# 226. REMOVAL

Ne uklanjaj field/endpoint dok supported clients još zavise od njega.

---

# 227. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Service:
Module:
Route/Job/Event:
File:
Function/Class:
Relevant code/config:

Architecture boundary:
Data/resource:
Affected callers:

Problem:

Evidence:

Execution Flow:

T0:
T1:
T2:
T3:

Expected behavior:

Actual/Possible behavior:

Data impact:

Security impact:

Reliability impact:

Scalability impact:

Root cause:

Recommended remediation:

Regression/integration test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 228. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-tenant/user data exposure
- remote critical privilege bypass
- catastrophic data corruption
- exposed high-privilege production secret
- duplicate irreversible financial action

## P1 - HIGH

- critical business flow corrupts data
- major authorization architecture bypass
- common retry duplicates critical action
- rolling deploy/update može oboriti servis
- major transaction/reliability flaw

## P2 - MEDIUM

- značajan architectural correctness/reliability problem
- partial data consistency issue
- important scaling bottleneck sa realnim production impact-om

## P3 - LOW

- lokalizovan architecture problem
- manji coupling/reliability issue

## P4 - IMPROVEMENT

- maintainability/scalability improvement bez potvrđenog trenutnog failure-a

---

# 229. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code/config/test direktno potvrđuje execution path.

MEDIUM:

jak evidence postoji, ali production topology/runtime nije potvrđen.

LOW:

zavisi od nepoznate infrastrukture, traffic-a ili external contract-a.

---

# 230. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 231. ARCHITECTURAL CLASSIFICATION

Za finding označi:

```text
CORRECTNESS
SECURITY
DATA INTEGRITY
RELIABILITY
SCALABILITY
PERFORMANCE
MAINTAINABILITY
OBSERVABILITY
```

---

# 232. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. route/entry point
2. middleware
3. service
4. repository
5. DB constraint
6. transaction
7. job/event path
8. deployment topology
9. tests
10. external contract

Ne zaključuj iz jednog fajla.

---

# 233. NE FORSIRAJ CLEAN ARCHITECTURE

Ne zahtevaj:

```text
controller
use case
domain service
repository interface
repository implementation
adapter
gateway
```

za jednostavan CRUD servis ako nema stvarnog problema.

---

# 234. NE FORSIRAJ MICROSERVICES

Monolith može biti ispravan.

Microservices uvode:

- network failure
- deployment complexity
- eventual consistency
- observability requirements

Preporuči ih samo ako konkretni scaling/ownership problem opravdava cenu.

---

# 235. NE FORSIRAJ EVENT-DRIVEN

Event bus/queue nije automatski bolja arhitektura.

Koristi kada durability, decoupling ili asynchronous processing stvarno zahtevaju.

---

# 236. NE DODAJ CACHE BEZ POTREBE

Cache komplikuje correctness.

Preporuka mora imati merljiv bottleneck ili load problem.

---

# 237. NE DODAJ DISTRIBUTED LOCK PRVO

Prvo proveri:

- DB atomic update
- unique constraint
- transaction
- idempotency

---

# 238. NE REFAKTORIŠI

Tokom audita:

- ne premeštaj slojeve
- ne menja DB
- ne uvodi queue
- ne pravi microservices
- ne menja auth
- ne update-uj dependencies

Prvo završi audit.

---

# 239. OUTPUT - BACKEND_ARCHITECTURE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- backend stack
- architecture model
- critical services/modules
- najveći sistemski rizici
- production readiness

## 2. Repository / Service Map

## 3. Architecture Diagram

## 4. Dependency / Boundary Audit

## 5. Request Lifecycle Audit

## 6. Controller / Transport Audit

## 7. Business Logic Audit

## 8. Domain / Invariant Audit

## 9. Data Access Architecture

## 10. Transaction Audit

## 11. Concurrency / Atomicity Audit

## 12. Authentication / Authorization Architecture

## 13. Validation / Error Architecture

## 14. Cache Architecture

## 15. Background Jobs / Queue Architecture

## 16. Webhook Architecture

## 17. External Integration Architecture

## 18. File / Object Storage Architecture

## 19. Multi-Tenant Architecture

## 20. Serverless / Container Runtime

## 21. Deployment / Migration Compatibility

## 22. Configuration / Secrets

## 23. Observability

## 24. Testing Architecture

## 25. Scalability Risks

## 26. Reliability Risks

## 27. Findings Summary

| ID | Severity | Category | Component | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 28. P0 Findings

## 29. P1 Findings

## 30. P2 Findings

## 31. P3 Findings

## 32. P4 Improvements

## 33. Things Done Well

## 34. Unknown / Not Verified

## 35. Architecture Remediation Roadmap

---

# 240. ENDPOINT ARCHITECTURE MATRIX

Napravi za critical API:

| Route | Auth | Authorization | Validation | Transaction | Side effects |
|---|---|---|---|---|---|

---

# 241. BUSINESS INVARIANT MATRIX

| Invariant | Enforced in | DB protection | Other entry points | Risk |
|---|---|---|---|---|

---

# 242. TRANSACTION MATRIX

| Operation | DB writes | External side effects | Atomic boundary | Risk |
|---|---|---|---|---|

---

# 243. JOB MATRIX

| Job | Trigger | Durable | Retry | Idempotent | Risk |
|---|---|---|---|---|---|

---

# 244. DEPENDENCY MATRIX

| Dependency | Timeout | Retry | Critical | Failure behavior |
|---|---|---|---|---|

---

# 245. CONFIG MATRIX

| Setting | Required | Default | Production source | Safe failure |
|---|---|---|---|---|

---

# 246. SECOND PASS - CROSS-LAYER TRACE

Nakon prvog audita uzmi svaki critical flow i prati ga kroz sve slojeve.

Primer:

```text
POST /order
↓
auth
↓
validation
↓
service
↓
inventory
↓
DB
↓
payment
↓
event
↓
email
↓
response
```

Pitaj na svakom koraku:

> Šta ako baš ovaj korak padne?

---

# 247. SECOND PASS - RETRY ATTACK

Za svaki write operation pretpostavi:

```text
operation succeeds
↓
response/ack is lost
↓
caller retries
```

Proveri finalni business effect.

---

# 248. SECOND PASS - CONCURRENCY ATTACK

Pokreni dve iste ili konfliktne operacije simultano.

Primer:

```text
reserve last item A
reserve last item B
```

Pitaj:

> Koji database/server primitive čuva invariant?

---

# 249. SECOND PASS - MULTI-INSTANCE

Pretpostavi da postoje najmanje dve backend instance.

Pitaj šta prestaje da važi:

- in-memory cache
- lock
- rate counter
- job scheduler
- session

---

# 250. SECOND PASS - PROCESS RESTART

Pretpostavi:

```text
process dies immediately after important side effect
```

Pitaj:

- šta je durable
- šta se retry-uje
- šta se gubi
- šta se duplira

---

# 251. SECOND PASS - DOWNSTREAM FAILURE

Za svaki external dependency:

```text
timeout
500
429
connection reset
```

Pitaj:

> Da li naš servis ostaje zdrav?

---

# 252. SECOND PASS - DATABASE FAILURE

Simuliraj:

- connection exhaustion
- timeout
- deadlock
- serialization failure
- replica lag ako postoji

---

# 253. SECOND PASS - DEPLOYMENT

Pretpostavi rolling deployment:

```text
old backend
+
new backend
+
transition database schema
```

Pitaj da li svi ostaju kompatibilni.

---

# 254. SECOND PASS - OLD CLIENT

Pretpostavi mobile/web client star 6 meseci.

Pitaj:

- endpoint
- fields
- enum
- auth
- error contract

---

# 255. SECOND PASS - TENANT ATTACK

Ako multi-tenant:

za svaki query/cache/job ukloni mentalno tenant filter.

Pitaj:

> Gde je poslednja zaštita koja sprečava cross-tenant pristup?

---

# 256. SECOND PASS - FAILURE AFTER COMMIT

Za svaki flow:

```text
DB commit
↓
external side effect
```

ubaci failure posle commit-a.

Pitaj kako system reconciliuje.

---

# 257. SECOND PASS - FAILURE BEFORE COMMIT

Obrni:

```text
external side effect
↓
DB commit fails
```

Da li sada spolja postoji efekat koji lokalni sistem ne zna?

---

# 258. SECOND PASS - RESOURCE EXHAUSTION

Pretpostavi 10x saobraćaj.

Pitaj:

- DB pool
- thread/event loop
- external API
- queue
- memory

Ne proglašavaj scalability issue bez concrete bottleneck-a.

---

# 259. SECOND PASS - OBSERVABILITY

Za svaki P0/P1 scenario pitaj:

> Kako bi tim znao da se ovo dešava u production-u?

Ako odgovor glasi:

```text
ne bi znao
```

dodaj observability gap kao odvojen finding kada je opravdano.

---

# 260. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- architecture je mapirana pre preporuka
- repository/default branch je source of truth
- business invariants su analizirani kroz sve entry point-e
- auth i authorization nisu pomešani
- controller/service/repository boundary nalazi imaju konkretan impact
- DB constraint je proveravan za critical invariant
- transaction granice su mapirane
- network call unutar DB transaction-a je proveren
- dual-write failure scenarios su analizirani
- critical mutation ima retry/idempotency analizu
- background jobs su provereni za redelivery
- webhooks su provereni za duplicate/out-of-order delivery
- multi-instance deployment je uzet u obzir
- in-memory state nije tretiran kao distributed/durable
- serverless filesystem/global memory assumptions su proverene
- rolling deployment i schema compatibility su analizirani
- old/new client version skew je analiziran
- cache keys proveravaju user/tenant dimensions
- cross-tenant risks imaju najviši prioritet
- external dependencies imaju timeout/retry analizu
- retry slojevi nisu slučajno multiplicirani
- testovi nisu korišćeni kao dokaz za neproverene failure path-ove
- microservices/cache/queue/lock nisu preporučeni bez razloga
- P4 improvements su jasno odvojeni od correctness problema

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite Clean Architecture, repository pattern, Redis, queue i microservices.

To nije backend architecture audit.

Tražim probleme poput:

```text
POST /orders
↓
controller checks available stock = 1
↓
Request A passes
Request B passes
↓
both insert order
↓
inventory becomes negative
```

ili:

```text
DB transaction commits order
↓
publish event fails
↓
worker that fulfills order never receives event
↓
database says order exists
↓
business process permanently stops
```

ili:

```text
payment provider captures money
↓
database commit fails
↓
API returns error
↓
client retries
↓
second capture can occur
```

ili:

```text
webhook event processed
↓
provider does not receive acknowledgement
↓
same event delivered again
↓
backend performs side effect twice
```

ili:

```text
multi-tenant cache
↓
cache key contains only resource ID
↓
tenant A loads resource 15
↓
tenant B requests its own resource 15
↓
cache returns tenant A response
```

ili:

```text
serverless function
↓
stores pending jobs in global in-memory array
↓
instance is terminated
↓
jobs disappear permanently
```

ili:

```text
rolling deployment starts
↓
new version renames database column
↓
old instances are still serving traffic
↓
old code queries removed column
↓
partial production outage
```

To su sistemski backend problemi koje treba da pronađeš.

Razmišljaj kroz:

- entry points
- trust boundaries
- business invariants
- transaction boundaries
- concurrency
- idempotency
- side effects
- durability
- multiple instances
- deployment version skew
- tenant boundaries
- dependency failures

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji exact request/job/event pokreće problem?

> Koji slojevi učestvuju?

> Koji invariant se krši?

> Šta se događa ako proces padne?

> Šta se događa ako request stigne dva puta?

> Šta se događa ako dva request-a rade paralelno?

> Šta se događa ako downstream servis ne odgovori?

> Da li problem i dalje postoji sa dve backend instance?

Ako nema dovoljno dokaza:

**NOT VERIFIED.**

Ako zavisi od production topologije koja nije poznata:

**PRODUCTION TOPOLOGY NOT VERIFIED.**

Ako je samo architectural improvement bez potvrđenog failure-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 7 stvarnih sistemskih failure mode-ova nego napisati 100 generičkih architecture preporuka.

Cilj je dobiti forenzički precizan backend architecture audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- deterministic reproduction
- integration test
- transaction/idempotency fix
- architecture correction
- deployment safeguard
- observability check
- production hardening plan
