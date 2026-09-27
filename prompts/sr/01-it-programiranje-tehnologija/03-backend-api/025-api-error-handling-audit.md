---
id: UPL-IT-025
number: 25
slug: api-error-handling-audit
title: API Error Handling Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# API ERROR HANDLING AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog error handling sistema backend/API aplikacije.

Glavni cilj:

> Utvrditi da li backend greške pravilno detektuje, klasifikuje, mapira, loguje, vraća klijentu i oporavlja od njih bez gubitka podataka, lažnog success-a, beskonačnih retry-ja, curenja internih detalja ili pogrešnog tretiranja očekivanih business failure-a kao sistemskih kvarova.

Ovo nije:

- generički savet da se koristi `try/catch`
- checklist status kodova
- samo logging audit
- samo observability audit
- samo security audit
- automatsko pretvaranje svih grešaka u custom exception klase
- pokušaj da svaki failure vrati isti response
- automatsko retry-ovanje svih grešaka
- automatsko sakrivanje svih detalja bez obzira na potrebe debugging-a

Fokus je na kompletnom failure lifecycle-u:

```text
failure occurs
↓
exception/result created
↓
propagation
↓
classification
↓
mapping
↓
logging/metrics
↓
client response
↓
retry/recovery
```

Prioritet:

**correctness > data integrity > retry safety > error classification > client semantics > observability > developer ergonomics**

Bolje je pronaći 6 stvarnih failure path problema nego napisati 100 generičkih preporuka o exception handling-u.

---

# 1. UTVRDI ERROR HANDLING STACK

Pre nalaza utvrdi:

- framework
- exception middleware/filter
- validation library
- ORM/database layer
- HTTP client
- queue/job framework
- logger
- tracing
- metrics
- error monitoring
- external API integrations

Pronađi:

```text
try
catch
throw
Promise.catch
Result
Either
error middleware
exception filter
onError
retry
fallback
```

prilagođeno jeziku/runtime-u.

---

# 2. MAPIRAJ ERROR ARHITEKTURU

Napravi stvarni flow.

Primer:

```text
Repository error
↓
Service
↓
Controller
↓
Global exception handler
↓
HTTP response
```

Za background job:

```text
Worker failure
↓
queue retry
↓
dead letter / failed state
```

Za external integration:

```text
provider error
↓
adapter
↓
domain mapping
↓
API
```

---

# 3. ERROR INVENTORY

Klasifikuj failure-e najmanje kao:

```text
VALIDATION
AUTHENTICATION
AUTHORIZATION
NOT_FOUND
CONFLICT
BUSINESS_RULE
RATE_LIMIT
TIMEOUT
DEPENDENCY
DATABASE
INTERNAL
CANCELLATION
```

Dodaj domain-specific kategorije ako postoje.

---

# 4. EXPECTED VS UNEXPECTED

Najvažnija distinkcija:

```text
EXPECTED FAILURE
```

primer:

- invalid input
- insufficient balance
- duplicate email
- invalid state transition

naspram:

```text
UNEXPECTED FAILURE
```

primer:

- null dereference
- DB outage
- serializer bug

Ne tretiraj oba isto.

---

# 5. DOMAIN ERROR

Expected business rejection ne treba automatski da završi kao 500.

---

# 6. SYSTEM ERROR

Unexpected internal exception ne treba maskirati kao:

```text
400 Bad Request
```

samo da API "ne vraća 500".

---

# 7. ERROR PROPAGATION

Za svaki critical flow prati gde se error:

- baca
- hvata
- wrapuje
- transformiše
- ignoriše

---

# 8. SWALLOWED ERROR

High-signal pattern:

```text
try {
  importantOperation()
} catch {
}
```

Ako failure menja business ishod, silent swallow je ozbiljan problem.

---

# 9. LOG-AND-SWALLOW

Pattern:

```text
catch (e) {
  logger.error(e)
}
```

nije dovoljan ako caller nastavlja kao da je operation uspela.

---

# 10. FALSE SUCCESS

Scenario:

```text
DB write fails
↓
error caught
↓
function returns success object
↓
API returns 200
```

P1/P0 zavisno od data/business impact-a.

---

# 11. ERROR TO NULL

Pattern:

```text
catch {
  return null
}
```

Proveri da li caller može razlikovati:

```text
not found
```

od:

```text
database failed
```

---

# 12. DEFAULT VALUE ON ERROR

Pattern:

```text
catch {
  return []
}
```

može pretvoriti service outage u "nema podataka".

---

# 13. FALSE EMPTY STATE

Scenario:

```text
DB/API fails
↓
[]
↓
client displays "No results"
```

Korisnik dobija lažnu informaciju.

---

# 14. ERROR WRAPPING

Ako lower-level error postaje custom error:

proveri da se ne izgubi važan context.

---

# 15. ERROR CAUSE

Ako runtime podržava exception cause/chaining:

proveri da root cause ostaje dostupan internom debugging-u.

---

# 16. OVER-WRAPPING

Ne pravi 8 slojeva custom exception-a koji ne dodaju semantiku.

---

# 17. ERROR TYPE AS CONTROL FLOW

Expected domain rejection može legitimno koristiti typed error/result.

Ne insistiraj na exception-free modelu.

---

# 18. STRING MATCHING

High-risk pattern:

```text
if (error.message.includes("duplicate"))
```

za business/error classification.

---

# 19. DATABASE ERROR MAPPING

Mapiraj:

- unique violation
- foreign key
- deadlock
- serialization
- connection failure
- timeout

---

# 20. UNIQUE VIOLATION

DB duplicate constraint može mapirati na:

```text
409 Conflict
```

ili domain error.

Proveri da se ne vraća generic 500 ako je duplicate očekivan business scenario.

---

# 21. UNIQUE CONSTRAINT IDENTITY

Ne mapiraj svaku unique violation na:

```text
EMAIL_ALREADY_EXISTS
```

ako ista tabela ima više unique constraints.

---

# 22. FOREIGN KEY FAILURE

Može značiti:

- parent missing
- invalid request
- race
- internal bug

Mapiranje zavisi od context-a.

---

# 23. DEADLOCK

DB deadlock može biti retryable na transaction boundary-ju.

Ali samo ako cela operation može bezbedno da se ponovi.

---

# 24. SERIALIZATION FAILURE

Isto za serializable transaction conflict.

---

# 25. DATABASE UNAVAILABLE

Ne pretvaraj u 404 ili validation failure.

To je dependency/system failure.

---

# 26. POOL EXHAUSTION

Treba biti observability signal i verovatno 5xx, ne business error.

---

# 27. ORM ERROR

ORM može wrapovati native DB error.

Proveri da mapper koristi stabilne code/type podatke, ne message string gde postoji bolji signal.

---

# 28. EXTERNAL HTTP ERRORS

Za svaki provider mapiraj:

- timeout
- DNS/connect
- 4xx
- 429
- 5xx
- malformed response

---

# 29. UPSTREAM 4XX

Ne prosleđuj provider status klijentu automatski.

Primer:

```text
provider 401
```

ne mora značiti da je naš user unauthorized.

Možda su naše provider credentials pokvarene.

---

# 30. UPSTREAM 404

Ne mora značiti naš resource 404.

---

# 31. UPSTREAM 429

Može zahtevati:

- retry
- queue
- 503/429 prema našem client-u

zavisno od architecture-e.

---

# 32. UPSTREAM 5XX

Klasifikuj kao dependency failure.

---

# 33. BAD PROVIDER PAYLOAD

HTTP 200 sa invalidnim JSON/schema-om je failure.

Ne tretiraj status 200 kao dokaz success-a.

---

# 34. RESPONSE VALIDATION

Za critical integrations proveri da li response ima očekivana required polja/type.

---

# 35. PROVIDER ERROR LEAK

Ne vraćaj raw Stripe/AWS/third-party error object klijentu ako time curi:

- implementation
- IDs
- request details
- credentials

---

# 36. PROVIDER ERROR TRANSLATION

Mapiraj external error u stable internal/domain error gde je potrebno.

---

# 37. TIMEOUT

Za svaki downstream poziv proveri bounded timeout.

---

# 38. NO TIMEOUT

External dependency koja može da visi bez limita može iscrpeti server capacity.

---

# 39. TIMEOUT CLASSIFICATION

Timeout nije isto što i:

```text
operation definitely failed
```

posebno kod mutation-a.

---

# 40. UNKNOWN OUTCOME

Critical scenario:

```text
request sent to payment/provider
↓
timeout
```

Provider možda jeste izvršio side effect.

Retry mora uzeti to u obzir.

---

# 41. CONNECTION RESET

Isto može imati unknown outcome nakon request send-a.

---

# 42. RETRYABILITY

Za svaki error type označi:

```text
RETRY NOW
RETRY LATER
DO NOT RETRY
REAUTH
USER ACTION REQUIRED
UNKNOWN
```

---

# 43. RETRY MATRIX

| Error | Retryable | Safe automatically | Backoff | Max attempts |
|---|---|---|---|---|

---

# 44. RETRY VALIDATION ERROR

Beskonačni retry nad istim nevalidnim payload-om je bug.

---

# 45. RETRY AUTH ERROR

401 može zahtevati refresh/re-auth, ne običan network retry.

---

# 46. RETRY 403

Permission problem se obično ne menja sam od sebe.

---

# 47. RETRY 404

Zavisi od eventual consistency-ja i operation semantics.

Ne generalizuj.

---

# 48. RETRY 409

Conflict može zahtevati re-read/reconciliation.

---

# 49. RETRY 429

Poštuj provider/server retry hints gde postoje.

---

# 50. RETRY 5XX

Bounded retry može biti smislen.

---

# 51. JITTER

Za masovni distributed client/worker retry razmotri jitter ako postoji stampede rizik.

---

# 52. NESTED RETRIES

Mapiraj:

```text
API layer retry
↓
service retry
↓
HTTP client retry
↓
queue retry
```

Ukupan broj pokušaja može eksplodirati.

---

# 53. RETRY MULTIPLICATION

Ako konfiguracije postoje, izračunaj realan maksimum.

---

# 54. IDEMPOTENCY PRE RETRY-JA

Pre automatskog retry-ja mutation-a odgovori:

> Da li je operacija idempotentna ili dedupovana?

Ako nije:

retry može biti opasniji od failure-a.

---

# 55. SIDE EFFECT + ERROR

Scenario:

```text
side effect succeeds
↓
later local step fails
↓
whole operation reported failed
```

Caller može retry-ovati side effect.

---

# 56. PARTIAL FAILURE

Mapiraj svaki multi-step flow.

---

# 57. TRANSACTION ROLLBACK

DB transaction rollback ne rollback-uje:

- email
- HTTP
- payment
- file upload

---

# 58. ERROR AFTER COMMIT

Scenario:

```text
DB commit succeeds
↓
response serialization fails
↓
client sees 500
```

Client može retry-ovati already completed mutation.

---

# 59. RESPONSE SERIALIZATION FAILURE

Visok signal za idempotency.

---

# 60. ERROR BEFORE COMMIT

Spoljašnji side effect može već postojati.

---

# 61. COMPENSATION FAILURE

Ako error handler pokušava rollback/compensation:

proveri šta ako i compensation padne.

---

# 62. ERROR HANDLER NE SME DA IZAZOVE VEĆI ERROR

Primer:

```text
catch error
↓
logger serializes circular object
↓
logging itself throws
```

Originalni context može biti izgubljen.

---

# 63. ERROR MIDDLEWARE

Pregledaj global handler.

Pitaj:

- šta hvata
- šta ne hvata
- sync/async coverage
- framework semantics

---

# 64. ASYNC EXCEPTION

U nekim stack-ovima async rejection ne prolazi istim putem kao sync throw.

Proveri stvarnu verziju/framework.

---

# 65. UNHANDLED REJECTION

Ako runtime/process može pasti ili samo logovati:

proveri production ponašanje.

---

# 66. UNCAUGHT EXCEPTION

Definiši process-level policy.

Server ne treba da nastavi u potencijalno korumpiranom in-memory state-u samo zato što želi 100% uptime.

---

# 67. PROCESS CRASH

Crash nije uvek najgori ishod.

Orchestrator može restartovati proces.

Ali critical work mora biti durable/retry-safe.

---

# 68. BACKGROUND JOB ERROR

Worker exception treba pravilno da utiče na:

- retry
- failed state
- ack

---

# 69. SWALLOWED JOB ERROR

Scenario:

```text
job fails
↓
catch + log
↓
worker returns success
↓
queue removes job
```

Posao je trajno izgubljen.

---

# 70. THROW AFTER SIDE EFFECT

Suprotno:

```text
job completes side effect
↓
non-critical logging fails
↓
worker throws
↓
queue retries
↓
side effect duplicates
```

---

# 71. ACK SEMANTICS

Mapiraj tačno kada queue smatra job successful.

---

# 72. DEAD LETTER

Permanent failure treba imati konačno stanje.

---

# 73. POISON MESSAGE

Jedan permanentno nevalidan job ne sme beskonačno blokirati queue.

---

# 74. FAILURE METADATA

Failed job treba čuvati dovoljno context-a za debugging, ali ne sensitive payload bez potrebe.

---

# 75. WEBHOOK ERROR

Incoming webhook failure mora uzeti u obzir provider retry behavior.

---

# 76. WEBHOOK 500

Provider može ponoviti event.

Processing mora biti idempotent.

---

# 77. WEBHOOK 200 PRE DURABILITY

Ako odgovorimo 200 pre nego što event bude durable:

process crash može trajno izgubiti event.

---

# 78. WEBHOOK 500 POSLE SIDE EFFECT-A

Ako side effect već izvršen, provider retry može ga duplirati.

---

# 79. WEBHOOK SIGNATURE ERROR

Invalid signature treba biti client/auth-like rejection, ne server 500.

---

# 80. FILE ERRORS

Mapiraj:

- missing
- permission
- disk full
- partial write
- storage service failure

---

# 81. DISK FULL

Ne vraćaj success ako metadata kaže file saved, a write nije uspeo.

---

# 82. TEMP FILE CLEANUP

Error path mora očistiti temp file gde je bezbedno.

---

# 83. CLEANUP ERROR

Cleanup failure ne sme maskirati originalni error bez razloga.

---

# 84. OBJECT STORAGE FAILURE

DB i storage mogu imati partial success.

---

# 85. CACHE ERROR

Pitaj:

> Da li cache failure treba da obori request?

Ako je cache optional:

možda fallback na DB.

Ako je cache authority/lock/session:

možda je critical.

---

# 86. CACHE FAIL-OPEN

Može biti correctness/security problem za:

- permission cache
- distributed lock
- rate limit

---

# 87. CACHE FAIL-CLOSED

Može izazvati nepotreban outage ako cache služi samo kao performance optimization.

---

# 88. AUTH ERROR HANDLING

Mapiraj:

- missing token
- malformed
- expired
- revoked
- provider unavailable

---

# 89. AUTH PROVIDER DOWN

Ne govori user-u:

```text
invalid password
```

ako auth provider nije dostupan.

---

# 90. AUTH ENUMERATION

Ne vraćaj previše detalja login failure-a ako security model zahteva homogen response.

---

# 91. TOKEN REFRESH ERROR

Razlikuj:

- refresh token expired
- refresh token revoked
- provider/network failure

---

# 92. AUTHORIZATION ERROR

Forbidden business action ne treba biti 500.

---

# 93. RESOURCE HIDING

404 umesto 403 može biti namerna anti-enumeration strategija.

Ne "ispravljaj" bez context-a.

---

# 94. VALIDATION ERROR FORMAT

Proveri stabilan format za:

- field
- code
- message

---

# 95. MULTIPLE VALIDATION ERRORS

Da li API:

- vraća sve
- prvi

Oba mogu biti validna.

Bitna je dokumentovana stabilnost.

---

# 96. SANITIZATION ERROR

Invalid encoding/characters ne smeju oboriti error serializer.

---

# 97. MALFORMED JSON

Treba kontrolisan 4xx, ne raw parser exception.

---

# 98. OVERSIZED BODY

Body limit error treba mapirati kontrolisano.

---

# 99. MULTIPART ERROR

Malformed multipart ne treba da ostavi temp resources.

---

# 100. RATE LIMIT ERROR

Proveri:

- 429
- headers
- machine-readable error

---

# 101. BUSINESS RULE ERROR

Primer:

```text
INSUFFICIENT_BALANCE
INVALID_TRANSITION
QUOTA_EXCEEDED
```

Treba da bude determinističan client contract.

---

# 102. BUSINESS ERROR LOG LEVEL

Expected user rejection ne mora biti logged kao ERROR.

Inače monitoring postaje noisy.

---

# 103. 4XX KAO ERROR METRIC

Ne alarmiraj na svaki 404/validation failure kao server incident.

---

# 104. 5XX KAO SIGNAL

Unexpected 5xx treba biti vidljiv u monitoring-u.

---

# 105. LOG LEVEL TAXONOMY

Proveri:

```text
DEBUG
INFO
WARN
ERROR
FATAL
```

u odnosu na stvarni failure impact.

---

# 106. DUPLICATE LOGGING

Ista exception može biti logged u:

- repository
- service
- controller
- global handler

što pravi 4 identična error event-a.

---

# 107. LOG ONCE WITH CONTEXT

Ne znači da lower layer nikad ne sme logovati.

Ali izbegni duplicate stack noise bez dodatne vrednosti.

---

# 108. MISSING CONTEXT

Log:

```text
Something went wrong
```

bez:

- operation
- resource
- request ID

slabo pomaže.

---

# 109. TOO MUCH CONTEXT

Ne loguj:

- password
- token
- full payment details
- private file content

---

# 110. STRUCTURED LOG

Ako logger podržava:

preferiraj fields nad string concatenation za searchable context.

P4 ako nema realan observability problem.

---

# 111. REQUEST ID

Error treba moći povezati sa request trace-om.

---

# 112. USER ID U LOGU

Može biti koristan, ali proveri privacy i cardinality context.

---

# 113. TENANT ID

Critical za multi-tenant debugging, uz odgovarajuću privacy politiku.

---

# 114. ERROR MONITORING

Ako postoji Sentry/Datadog/etc:

proveri da expected errors nisu spam i da unexpected errors nisu suppressovani.

---

# 115. `ignoreErrors`

Traži broad ignore pattern koji može sakriti realne failures.

---

# 116. SAMPLING

Ne sample-uj critical rare errors toliko agresivno da potpuno nestanu.

---

# 117. FINGERPRINT

Ako custom grouping postoji:

proveri da različiti root causes nisu spojeni u jedan incident.

---

# 118. STACK TRACE

Internal monitoring treba da zadrži koristan stack.

Client ne treba da ga vidi.

---

# 119. SOURCE MAP / SYMBOL

Obfuscated/transpiled stack mora biti mapiran gde je relevantno.

---

# 120. TRACE

Distributed call:

```text
API
↓
service A
↓
service B
↓
DB
```

error treba moći pratiti kroz trace ako observability stack postoji.

---

# 121. TRACE ERROR STATUS

Proveri da trace span dobija failure status.

---

# 122. METRICS

Korisne error metrike:

- rate
- category
- endpoint
- dependency

Ne koristi raw message kao metric label.

---

# 123. HIGH CARDINALITY

Ne stavljaj:

- stack trace
- request ID
- user email

kao metric label.

---

# 124. ALERTING

Alert treba da bude na actionable symptoms.

Ne svaki pojedinačni exception.

---

# 125. ERROR BUDGET / SLO

Ako sistem ima SLO:

proveri da error classification odgovara availability metrici.

Ako nema:

ne zahtevaj SRE ceremoniju automatski.

---

# 126. FALLBACK

Za external dependency može postojati fallback.

Pitaj:

> Da li fallback daje semantički ispravan rezultat?

---

# 127. STALE FALLBACK

Cache fallback može biti bolji od outage-a za neke read use case-ove.

Ali opasan za:

- price
- permission
- balance

---

# 128. DEFAULT FALLBACK

`return false`, `0`, `[]` nije fallback ako menja business istinu.

---

# 129. DEGRADED MODE

Ako samo optional feature pada:

backend možda može nastaviti bez njega.

---

# 130. PARTIAL RESPONSE

Ako API vraća partial data kada jedan upstream padne:

contract mora to jasno izraziti.

---

# 131. SILENT PARTIAL RESPONSE

Ne vraćaj missing fields kao da je response kompletan ako client očekuje potpun snapshot.

---

# 132. MULTI-UPSTREAM AGGREGATION

Ako endpoint poziva A, B, C:

definiši:

- fail-fast
- partial
- fallback

---

# 133. FAIL-FAST

Ispravno kada je svaki deo required.

---

# 134. PARTIAL SUCCESS

Ispravno kada feature može bez nekog dela.

Ali response mora razlikovati missing/error data.

---

# 135. `Promise.all`

Jedan rejection ruši agregaciju.

Pitaj da li je to desired semantics.

---

# 136. `Promise.allSettled`

Može omogućiti partial result, ali caller mora eksplicitno obraditi failures.

---

# 137. CANCELLATION

Ako runtime/framework podržava request cancellation:

razlikuj je od system error-a.

---

# 138. CLIENT DISCONNECT

Ne loguj svaki normalni disconnect kao P1 server error.

---

# 139. CANCELLATION EXCEPTION

Ne retry-uj cancelled operation naslepo.

---

# 140. SHUTDOWN ERROR

Tokom graceful shutdown-a neki requests/jobs mogu biti prekinuti.

Proveri classification i retry.

---

# 141. DEPLOYMENT TERMINATION

Ako SIGTERM prekine worker:

queue treba da redeliver-uje gde je potrebno.

---

# 142. STARTUP ERROR

Missing critical config treba fail-fast.

---

# 143. CONFIG PARSE ERROR

Ne startuj server sa invalidnim fallback default-om ako je config critical.

---

# 144. MIGRATION ERROR

Ako DB migration pada:

servis ne treba da počne da prima traffic kao da je healthy.

---

# 145. READY STATE

Readiness treba reflektovati critical startup failure.

---

# 146. HEALTH ERROR

Health endpoint ne treba sam da crashuje ako jedan dependency ne odgovara.

---

# 147. GRACEFUL DEGRADATION

Ako dependency optional:

health model treba to razlikovati.

---

# 148. ERROR DURING ERROR RESPONSE

Serializer/template može pasti dok pravi error body.

Proveri safe minimal fallback.

---

# 149. ERROR RECURSION

Global handler ne sme ponovo baciti isti tip error-a i ući u loop.

---

# 150. HEADERS ALREADY SENT

Kod streaming/partial response-a error može nastati nakon slanja headers/body dela.

Proveri framework-specific handling.

---

# 151. STREAM ERROR

Ako file/stream pukne na pola:

ne možeš više jednostavno vratiti JSON 500.

Potreban je stream/client recovery model.

---

# 152. SSE

Ako SSE postoji:

error contract je drugačiji od običnog HTTP request-a.

---

# 153. WEBSOCKET

Isto za WebSocket.

Ako ne:

**NOT APPLICABLE**

---

# 154. WEBSOCKET ERROR

Razlikuj:

- protocol
- auth
- application message
- network disconnect

---

# 155. SSE ERROR EVENT

Ako stream nastavlja posle pojedinačnog business error-a:

nemoj nužno zatvoriti connection.

---

# 156. GRAPHQL

Ako backend ima GraphQL:

HTTP 200 sa `errors` može biti legitiman deo GraphQL protocol-a.

Ne primenjuj REST pravila naslepo.

---

# 157. CLI / INTERNAL TOOL

Internal consumers takođe trebaju stable error semantics ako automatizacija zavisi od njih.

---

# 158. BATCH ERROR

Za batch operaciju definiši:

- all failed
- partial
- per-item

---

# 159. PER-ITEM ERROR

Mora se povezati sa odgovarajućim input item-om.

---

# 160. ERROR ORDER

Ne oslanjaj se samo na array poziciju ako processing može promeniti ordering.

---

# 161. ASYNC JOB ERROR

Job status treba imati:

- machine code
- safe message
- internal diagnostic reference

gde je potrebno.

---

# 162. RETRY COUNT

Ako job više puta pada:

proveri da final error nije samo poslednji symptom bez originalnog cause-a.

---

# 163. DEAD LETTER VISIBILITY

Failed jobs ne smeju nestati bez operativne vidljivosti.

---

# 164. USER-VISIBLE ASYNC FAILURE

Ako user pokrene export/import/process:

mora postojati način da sazna da je async posao propao.

---

# 165. EMAIL ERROR

Ako email slanje nije critical:

možda log/queue retry bez rušenja request-a.

---

# 166. EMAIL CRITICAL

Ako email nosi one-time credential/required business action:

failure model mora biti drugačiji.

---

# 167. NOTIFICATION ERROR

Push notification failure obično ne znači da core business mutation treba rollback.

Ali domain može biti drugačiji.

---

# 168. ANALYTICS ERROR

Ne ruši business request zbog analytics failure-a.

---

# 169. OPTIONAL SIDE EFFECT

Klasifikuj eksplicitno.

---

# 170. CRITICAL SIDE EFFECT

Ne swallow-uj critical provider/payment failure.

---

# 171. COMPENSATION LOGGING

Ako compensation padne:

to je poseban incident visokog prioriteta.

---

# 172. UNKNOWN STATE

Ako sistem više ne zna da li je external operation uspela:

nemoj je predstavljati kao jednostavan FAILED.

Možda treba:

```text
UNKNOWN
RECONCILIATION_REQUIRED
```

ili equivalent domain model.

---

# 173. RECONCILIATION

Za unknown outcome proveri:

- provider query
- idempotency lookup
- scheduled reconciliation

---

# 174. PAYMENT UNKNOWN

Posebno kritično.

Ne retry charge naslepo ako originalni outcome nije poznat.

---

# 175. FINALITY

Neki error-i su terminalni.

Neki su privremeni.

Model treba to da razlikuje.

---

# 176. RETRY BUDGET

Retry ne sme trajati beskonačno bez business razloga.

---

# 177. OLD ERROR CODE

Ako clients zavise od code-a:

rename je breaking contract change.

---

# 178. ERROR VERSIONING

Error schema je deo API contract-a.

---

# 179. CLIENT RETRY LOGIC

Ako client repo postoji:

uporedi server error semantics sa client retry behavior-om.

---

# 180. CLIENT RETRIES WRONG ERRORS

Primer:

```text
server 409 = business conflict
client retries 5x
```

može samo napraviti load/noise.

---

# 181. CLIENT DOES NOT RETRY TRANSIENT

Suprotno:

network timeout završava kao permanent failure iako operation može bezbedno da se retry-uje.

---

# 182. USER MESSAGE

Internal error text nije user-friendly contract.

Client treba stabilan code, a UI može dati prikladnu poruku.

---

# 183. LOCALIZATION

Ne vezuj server logic za lokalizovan message string.

---

# 184. SUPPORT REFERENCE

Za unexpected error može biti korisno vratiti safe correlation ID.

---

# 185. ERROR PRIVACY

Correlation ID je bolji od stack trace-a za user support.

---

# 186. SECURITY ERROR

Ne otkrivaj više detalja napadaču nego što je potrebno.

---

# 187. ACCOUNT ENUMERATION

Login/reset error semantics proveri posebno.

---

# 188. VALIDATION DETALJI

Za authenticated normalne forme detaljan field error je koristan.

Security context određuje koliko detalja je bezbedno.

---

# 189. TIMING

Ne ulazi u micro timing attack zaključke bez evidence-a.

Detaljni auth/security audit je zaseban.

---

# 190. ERROR CACHE

Ne cache-uj transient 5xx response dugo na CDN-u/proxy-ju slučajno.

---

# 191. NEGATIVE CACHING

404 caching može biti validan, ali opasan ako resource upravo nastaje i client očekuje eventual consistency.

---

# 192. RETRY-AFTER

Ako API zna kada retry ima smisla:

header može biti koristan.

Ne zahtevaj za svaku grešku.

---

# 193. CIRCUIT BREAKER

Ako postoji:

proveri kako error postaje circuit failure.

---

# 194. CIRCUIT OPEN

Client-facing behavior treba biti jasan.

---

# 195. FALLBACK WHEN CIRCUIT OPEN

Proveri semantičku ispravnost.

---

# 196. BULKHEAD

Ako jedan upstream ne radi, ne treba nužno iscrpeti sve request workers.

Ako architecture ima separate pools, proveri.

---

# 197. ERROR STORM

Dependency outage može proizvesti ogromnu količinu identičnih logs/events.

Proveri sampling/rate control samo ako je realan operational problem.

---

# 198. LOG LOSS

Preagresivan sampling može sakriti prvi/root error.

---

# 199. ROOT CAUSE VS CASCADE

Ako DB padne, desetine endpoints će početi da bacaju 500.

Monitoring treba da omogući prepoznavanje shared root cause-a.

---

# 200. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Entry point:
Operation:
File/Class:
Function:
Error source:
Current error type:
Current client response:

Problem:

Evidence:

Failure Timeline:

T0:
T1:
T2:
T3:

Expected classification:

Actual classification:

Expected response/recovery:

Actual/Possible response/recovery:

Retryable:
YES / NO / CONDITIONAL / UNKNOWN

Side effect already possible:
YES / NO / UNKNOWN

Data impact:

User impact:

Operational impact:

Security/privacy impact:

Root cause:

Recommended remediation:

Regression/failure-injection test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 201. SEVERITY

Koristi:

## P0 - CRITICAL

- error handling uzrokuje duplicate irreversible financial action
- silent failure pravi catastrophic data corruption
- error response izlaže critical production secret
- recovery path pravi cross-user/tenant corruption

## P1 - HIGH

- false success gubi critical data
- retry model duplira critical side effect
- common failure trajno gubi job/event
- major dependency outage pretvara se u nekontrolisani systemic failure
- production client dobija pogrešnu semantiku za core operation

## P2 - MEDIUM

- značajan error classification/recovery problem
- client ne može pouzdano reagovati
- partial failure ostaje bez recovery-ja

## P3 - LOW

- ograničen error handling edge case
- observability nedoslednost manjeg uticaja

## P4 - IMPROVEMENT

- bolji taxonomy/logging/developer ergonomics bez potvrđenog runtime failure-a

---

# 202. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

failure path je direktno dokaziv kodom/testom.

MEDIUM:

jak code evidence postoji, ali downstream/runtime semantics nisu potpuno potvrđene.

LOW:

zavisi od nepoznatog provider/proxy/queue behavior-a.

---

# 203. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 204. ERROR CLASS

Za finding označi:

```text
EXPECTED BUSINESS
EXPECTED CLIENT
TRANSIENT INFRASTRUCTURE
PERMANENT DEPENDENCY
UNEXPECTED INTERNAL
UNKNOWN OUTCOME
```

---

# 205. RETRY CLASS

Koristi:

```text
SAFE IMMEDIATE
SAFE WITH BACKOFF
SAFE ONLY WITH IDEMPOTENCY
REAUTH REQUIRED
USER ACTION REQUIRED
DO NOT RETRY
UNKNOWN
```

---

# 206. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. throw site
2. catch site
3. transaction/side effects
4. global handler
5. client response
6. retry
7. queue/proxy behavior
8. logs
9. tests
10. external contract

Ne zaključuj samo zato što postoji broad `catch`.

---

# 207. BROAD CATCH NIJE AUTOMATSKI BUG

Može biti potpuno validan u global boundary handler-u.

Problem je šta radi sa error-om.

---

# 208. `catch(Exception)` NIJE AUTOMATSKI BUG

Ako:

- rethrow
- map
- preserve cause

može biti ispravno.

---

# 209. CUSTOM EXCEPTION NIJE AUTOMATSKI BOLJE

Ne uvodi desetine klasa bez potrebe.

---

# 210. NE RETRY-UJ NASLEPO

Retry je business/reliability odluka, ne univerzalni error handling pattern.

---

# 211. NE VRAĆAJ SVE KAO 200

Skrivanje failures u JSON body komplikuje standardne client/proxy/monitoring semantics.

Ali protokol poput GraphQL-a može imati drugačija pravila.

---

# 212. NE VRAĆAJ SVE KAO 500

Expected validation/domain failure nije server crash.

---

# 213. NE LOGUJ SVE KAO ERROR

Monitoring treba da ostane actionable.

---

# 214. NE SWALLOW-UJ SAMO DA TEST PROĐE

Silent failure je često gori od kontrolisanog fail-a.

---

# 215. NE MENJAJ KOD

Tokom audita:

- ne menja exception hierarchy
- ne dodaje retries
- ne menja status kodove
- ne menja queue behavior
- ne menja logger
- ne dodaje circuit breaker

Prvo završi audit.

---

# 216. OUTPUT - API_ERROR_HANDLING_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- error architecture
- taxonomy
- global handler
- retry model
- najveći failure rizici
- observability readiness

## 2. Error Flow Architecture

## 3. Error Taxonomy

## 4. Expected vs Unexpected Errors

## 5. Validation Error Audit

## 6. Business Error Audit

## 7. Authentication / Authorization Error Audit

## 8. Database Error Audit

## 9. External Dependency Error Audit

## 10. Timeout / Unknown Outcome Audit

## 11. Error Propagation / Wrapping Audit

## 12. False Success / Silent Failure Audit

## 13. Retry / Backoff Audit

## 14. Idempotency Interaction

## 15. Transaction / Partial Failure Audit

## 16. Job / Queue Error Audit

## 17. Webhook Error Audit

## 18. File / Storage Error Audit

## 19. Cache Error Audit

## 20. Fallback / Degraded Mode Audit

## 21. Logging Audit

## 22. Monitoring / Metrics / Tracing

## 23. Client Error Contract

## 24. Test Coverage

## 25. Findings Summary

| ID | Severity | Error class | Component | Problem | Retry class | Status |
|---|---|---|---|---|---|---|

## 26. P0 Findings

## 27. P1 Findings

## 28. P2 Findings

## 29. P3 Findings

## 30. P4 Improvements

## 31. Things Done Well

## 32. Unknown / Not Verified

## 33. Remediation Roadmap

---

# 217. ERROR MAPPING MATRIX

Napravi:

| Source error | Internal class | HTTP/job result | Retry | Client code |
|---|---|---|---|---|

---

# 218. DATABASE ERROR MATRIX

| DB error | Current mapping | Expected semantics | Retryable | Risk |
|---|---|---|---|---|

---

# 219. DEPENDENCY FAILURE MATRIX

| Failure | Timeout | Retry | Fallback | Client result |
|---|---|---|---|---|

---

# 220. SIDE EFFECT FAILURE MATRIX

| Step | Side effect done | Error after | Duplicate on retry | Recovery |
|---|---|---|---|---|

---

# 221. JOB FAILURE MATRIX

| Job | Error | Retry count | Idempotent | Dead letter | Risk |
|---|---|---|---|---|---|

---

# 222. SECOND PASS - THROW SITE TRACE

Nakon prvog audita izaberi svaki P0/P1 candidate i prati ga od tačnog mesta gde error nastaje do finalnog:

- response-a
- queue statusa
- log-a
- retry-ja

Ne preskači slojeve.

---

# 223. SECOND PASS - SWALLOW ATTACK

Repository-wide pronađi sve catch blokove koji:

```text
return null
return false
return []
return default
continue
```

Pitaj:

> Da li failure sada izgleda kao normalan rezultat?

---

# 224. SECOND PASS - FALSE SUCCESS ATTACK

Za svaki write path izazovi failure:

- DB
- file
- provider
- event publish

Pitaj da li caller ipak dobija success.

---

# 225. SECOND PASS - UNKNOWN OUTCOME

Za svaki external mutation:

```text
send
↓
provider processes
↓
response lost
```

Pitaj kako error handler klasifikuje ishod.

---

# 226. SECOND PASS - RETRY ATTACK

Za svaki retry path pretpostavi da prethodni pokušaj JESTE napravio side effect.

Pitaj:

> Šta se duplira?

---

# 227. SECOND PASS - PROVIDER OUTAGE

Simuliraj:

```text
timeout
429
500
malformed 200
```

Pitaj kako sistem reaguje.

---

# 228. SECOND PASS - DATABASE OUTAGE

Simuliraj:

- connection refused
- pool exhausted
- timeout

Pitaj:

- response
- logs
- health
- retry

---

# 229. SECOND PASS - QUEUE REDELIVERY

Worker izvrši side effect, pa padne pre success acknowledgement-a.

Ponovljen job mora biti analiziran.

---

# 230. SECOND PASS - ERROR HANDLER FAILURE

Namerno pretpostavi da:

- logger
- serializer
- telemetry

u samom error path-u takođe padne.

Da li postoji minimalni safe fallback?

---

# 231. SECOND PASS - CASCADE FAILURE

Jedan root outage proizvodi mnogo downstream errors.

Pitaj:

> Može li monitoring povezati simptome sa root cause-om?

---

# 232. SECOND PASS - CLIENT BEHAVIOR

Za svaki stable error code proveri šta web/mobile client radi:

- retry
- logout
- validation
- conflict
- fatal screen

Traži mismatch.

---

# 233. SECOND PASS - SECURITY LEAK

Pregledaj sve error response-e za:

- stack
- SQL
- internal host
- filesystem path
- token
- provider response

---

# 234. SECOND PASS - EXPECTED ERROR NOISE

Izazovi očekivane:

- validation
- 404
- conflict

Pitaj da li monitoring tretira svaki kao incident.

---

# 235. SECOND PASS - ASYNC FAILURE

Za svaku operaciju koja korisniku odmah kaže da je accepted/success:

ubaci permanent failure kasnije.

Pitaj kako user saznaje.

---

# 236. SECOND PASS - PARTIAL RESPONSE

Ako endpoint agregira više izvora:

obori samo jedan.

Pitaj da li response jasno kaže da je partial.

---

# 237. SECOND PASS - SHUTDOWN

Prekini process/server tokom:

- request
- job
- webhook processing

Pitaj šta će biti retried i da li je retry safe.

---

# 238. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- expected i unexpected errors su jasno odvojeni
- domain rejection nije pogrešno 500
- internal bug nije maskiran kao validation error
- svaki critical catch block prati se do caller-a
- false-success scenariji su aktivno provereni
- `null`, `false`, `[]` fallbacks nisu automatski prihvaćeni
- DB errors su mapirani prema konkretnim constraints/types
- provider 4xx nije slepo prosleđen kao naš client 4xx
- timeout mutation ima unknown-outcome analizu
- retry zahteva idempotency gde je potrebno
- nested retry multiplication je proverena
- transaction rollback nije predstavljen kao rollback external side effects-a
- worker error ne može slučajno acknowledge-ovati failed job
- duplicate webhook/job redelivery je analiziran
- error handler/logging ne može lako maskirati originalni root cause
- stack trace i sensitive details nisu exposed client-u
- expected 4xx ne zatrpavaju ERROR monitoring bez razloga
- client error behavior odgovara server taxonomy-ju
- async permanent failure ima user-visible/recovery put gde je potreban
- P4 observability improvements su odvojeni od stvarnih correctness problema

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte globalni exception handler, logujte greške i koristite retry.

To nije error handling audit.

Tražim probleme poput:

```text
database insert fails
↓
repository catches exception
↓
returns null
↓
service interprets null as "not found"
↓
controller returns 404
↓
real database outage appears to clients as missing resource
```

ili:

```text
payment request reaches provider
↓
provider captures money
↓
HTTP response times out
↓
backend classifies timeout as FAILED
↓
generic retry runs
↓
second charge is attempted
```

ili:

```text
worker sends email
↓
email succeeds
↓
analytics logging throws
↓
worker returns failure
↓
queue retries entire job
↓
same email is sent again
```

ili:

```text
job DB write fails
↓
catch logs error
↓
worker returns success
↓
queue acknowledges job
↓
operation disappears permanently
```

ili:

```text
third-party service returns 401
↓
backend passes through 401
↓
client assumes its own token expired
↓
user is logged out
↓
real issue was expired backend provider credential
```

ili:

```text
database unavailable
↓
repository returns []
↓
API returns 200 []
↓
client displays "No records"
↓
operations team sees no obvious outage from API status codes
```

ili:

```text
unexpected exception
↓
global handler returns full stack trace
↓
response contains internal paths, SQL details and infrastructure names
```

To su error handling problemi koje treba da pronađeš.

Razmišljaj kroz:

- failure source
- propagation
- classification
- partial side effects
- unknown outcomes
- retryability
- client semantics
- operational visibility
- recovery

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Gde error tačno nastaje?

> Gde se prvi put hvata?

> Da li je side effect već mogao da se dogodi?

> Šta caller misli da se dogodilo?

> Koji response/job state nastaje?

> Da li će nešto retry-ovati?

> Ako retry-uje, da li je bezbedno?

> Kako će production tim znati da problem postoji?

Ako ne možeš dokazati:

**NOT VERIFIED.**

Ako outcome external mutation-a nije poznat:

**UNKNOWN OUTCOME.**

Ako je samo bolja organizacija exception taxonomy-ja:

**P4 - IMPROVEMENT.**

Bolje je pronaći 6 stvarnih false-success/retry/recovery problema nego napisati 100 generičkih `try/catch` preporuka.

Cilj je dobiti forenzički precizan error handling audit koji se može direktno pretvoriti u:

- failure-injection test
- error mapping fix
- retry policy correction
- idempotency protection
- queue recovery fix
- client contract correction
- observability alert
- production-safe failure model
