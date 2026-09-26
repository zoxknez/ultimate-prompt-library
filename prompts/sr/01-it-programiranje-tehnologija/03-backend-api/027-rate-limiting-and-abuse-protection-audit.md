---
id: UPL-IT-027
number: 27
slug: rate-limiting-and-abuse-protection-audit
title: Rate Limiting & Abuse Protection Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# RATE LIMITING AND ABUSE PROTECTION AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog rate limiting i abuse protection sistema backend/API aplikacije.

Glavni cilj:

> Utvrditi da li sistem zaista ograničava zloupotrebu, štiti skupe ili osetljive endpoint-e, sprečava trivijalne bypass-eve, radi ispravno kroz više backend instanci i ne kažnjava legitimne korisnike više nego što štiti infrastrukturu.

Ovo nije:

- generički savet da se doda Redis rate limiter
- jedan globalni "100 req/min" limit za ceo sistem
- DDoS audit cele infrastrukture
- WAF marketing checklist
- automatsko blokiranje po IP adresi
- automatsko CAPTCHA rešenje
- zamena za authorization
- zamena za fraud detection
- pokušaj da se svaki endpoint agresivno limitira

Fokus je na stvarnom abuse i capacity modelu:

```text
request
↓
identity extraction
↓
rate-limit key
↓
policy selection
↓
counter/token state
↓
allow / delay / reject
↓
headers / retry guidance
↓
monitoring
```

Prioritet:

**critical abuse prevention > bypass resistance > distributed correctness > account fairness > capacity protection > false-positive reduction > operational visibility**

Bolje je pronaći 6 stvarnih abuse bypass-a ili limiter failure-a nego napisati 100 generičkih security saveta.

---

# 1. UTVRDI RATE LIMIT STACK

Pre nalaza utvrdi:

- reverse proxy
- CDN
- WAF
- API gateway
- application limiter
- Redis/cache
- database counters
- in-memory counters
- serverless platform protections
- cloud provider quotas
- queue admission control
- login protection
- CAPTCHA/challenge ako postoji

---

# 2. MAPIRAJ SVE LAYERE

Napravi:

```text
Internet
↓
CDN/WAF
↓
Load balancer
↓
Gateway
↓
Backend limiter
↓
Business quota
```

Razlikuj:

- infrastructure rate limit
- API abuse limit
- authentication brute-force protection
- business quota
- billing quota

---

# 3. NE MEŠAJ BUSINESS QUOTA I ABUSE LIMIT

Primer:

```text
5 exports/month
```

je product/business pravilo.

```text
10 export requests/min
```

je abuse/capacity protection.

Oba mogu postojati.

---

# 4. NAPRAVI ENDPOINT ABUSE INVENTORY

Za svaki važan endpoint zabeleži:

```text
Method:
Route:
Public/authenticated:
Cost:
Side effect:
Sensitive:
Brute-force surface:
Enumeration surface:
Current limit:
Limiter key:
```

---

# 5. RISK CLASSIFICATION

Klasifikuj endpoint-e kao:

```text
LOW COST
EXPENSIVE
AUTH SENSITIVE
WRITE SENSITIVE
ENUMERATION SENSITIVE
EXTERNAL-COST
BULK
FILE
ASYNC JOB
```

---

# 6. GLOBAL LIMIT NIJE DOVOLJAN

Jedan user može potrošiti isti global budget na jeftine i veoma skupe operacije.

Proveri route-specific policies.

---

# 7. JEFTIN VS SKUP REQUEST

Primer:

```text
GET /health
```

nije isti cost kao:

```text
POST /reports/generate
```

---

# 8. IDENTITET LIMITERA

Utvrdi po čemu se limitira:

- IP
- user ID
- API key
- tenant
- session
- device
- route
- combination

---

# 9. IP-ONLY LIMIT

IP je slab identity signal.

Problemi:

- NAT
- office
- carrier-grade NAT
- VPN
- IPv6
- proxy

Ne proglašavaj ga beskorisnim, ali proveri use case.

---

# 10. SHARED NAT

Scenario:

```text
100 legitimate users
↓
same public IP
```

Jedan agresivan korisnik može throttle-ovati sve.

---

# 11. ACCOUNT LIMIT

Authenticated abuse se često bolje prati kroz principal/user/account.

---

# 12. IP + ACCOUNT

Kombinovani model može biti koristan za login/write abuse.

Ali ne uvodi ga automatski.

---

# 13. TENANT LIMIT

Multi-tenant sistem možda treba:

- per-user
- per-tenant
- global

zaštitu.

---

# 14. NOISY TENANT

Jedan tenant ne sme iscrpeti sve shared resources ako product zahteva fairness.

---

# 15. API KEY LIMIT

Ako external clients koriste API key:

proveri key-scoped quotas.

---

# 16. PUBLIC ENDPOINT

Ako nema user identity:

IP/network/device-like signal može biti jedino dostupno.

Dokumentuj ograničenja.

---

# 17. TRUSTED PROXY

Ako limiter koristi client IP iza proxy-ja:

proveri `trust proxy` ili ekvivalent.

---

# 18. SPOOFED FORWARDED HEADER

Critical bypass:

```text
client sends X-Forwarded-For
↓
backend blindly trusts it
↓
attacker rotates header value
↓
new limiter bucket every request
```

---

# 19. PROXY CHAIN

Utvrdi koji hop je stvarno trusted.

---

# 20. `X-REAL-IP`

Isto.

---

# 21. CDN IP HEADER

Ako CDN daje verified client IP header:

proveri da origin nije direktno javno dostupan na način koji omogućava spoofing tog header-a.

---

# 22. IPV6

Napadač može imati ogroman IPv6 address space.

Limiter po punoj IPv6 adresi može biti lako rotiran.

---

# 23. IPV6 PREFIX

Neki sistemi agregiraju subnet/prefix.

Ne preporučuj konkretan prefix bez network/product context-a.

---

# 24. MULTI-INSTANCE

Najvažnije pitanje:

> Da li limit važi globalno ili samo po procesu?

---

# 25. IN-MEMORY LIMITER

Scenario:

```text
limit = 100/min
backend replicas = 10
```

Ako svaki ima sopstveni counter:

efektivni limit može biti približno 1000/min uz dovoljno raspodeljen traffic.

---

# 26. LOAD BALANCER

Sticky session može promeniti behavior, ali ne treba računati na nju bez verifikacije.

---

# 27. SERVERLESS

Svaka function instance može imati sopstvenu memoriju.

In-memory limiter često nije globalna garancija.

---

# 28. DISTRIBUTED STORE

Ako limiter koristi Redis/DB:

proveri atomicity.

---

# 29. READ THEN WRITE RACE

Pattern:

```text
count = GET
if count < limit
  SET count+1
```

nije atomic pri concurrency-ju.

---

# 30. ATOMIC INCREMENT

Proveri da limiter koristi atomic operation/script/transaction gde je potrebno.

---

# 31. TTL

Limiter counter mora imati pravilnu expiration logiku.

---

# 32. FIRST REQUEST TTL

Klasičan bug:

```text
INCR key
↓
process crashes before EXPIRE
```

Key može ostati zauvek ako implementacija nije atomic ili recovery-safe.

---

# 33. FIXED WINDOW

Ako se koristi:

```text
100 requests / minute
```

sa fixed window modelom:

boundary burst može dozvoliti:

```text
100 at 12:00:59
+
100 at 12:01:00
```

u veoma kratkom intervalu.

---

# 34. SLIDING WINDOW

Ako je stvarno potreban glatkiji model, proveri implementaciju.

Ne zahtevaj ga za svaki endpoint.

---

# 35. TOKEN BUCKET

Ako postoji:

mapiraj:

- capacity
- refill rate
- cost per operation

---

# 36. LEAKY BUCKET

Isto prema actual algorithm-u.

---

# 37. ALGORITHM JE SEKUNDARAN

Ne ocenjuj limiter samo zato što koristi fixed window.

Pitaj da li semantics odgovaraju threat/capacity modelu.

---

# 38. BURST

Neki legitimate use case zahteva burst.

Primer:

```text
mobile app startup
↓
20 parallel requests
```

Prestrogi limiter može polomiti normalan UX.

---

# 39. PARALLEL CLIENT REQUESTS

Moderni frontend može poslati više request-a istovremeno.

Testiraj realan startup/dashboard flow.

---

# 40. WEIGHTED LIMITS

Skup endpoint može koristiti veći "cost" od jeftinog ako limiter to podržava.

P4/P2 prema actual need-u.

---

# 41. COST MODEL

Primer:

```text
GET /profile = 1
POST /ai/generate = 20
POST /export = 50
```

ali ne izmišljaj težine bez workload evidence-a.

---

# 42. EXTERNAL COST

Endpoint koji aktivira:

- SMS
- email
- AI API
- maps API
- payment verification

može imati direktan finansijski cost.

---

# 43. SMS ABUSE

Scenario:

```text
POST /send-otp
```

bez adequate limiting-a može napraviti:

- trošak
- spam
- harassment

---

# 44. EMAIL ABUSE

Password reset/invite/email verification može se zloupotrebiti za spam.

---

# 45. EMAIL EXISTENCE

Abuse protection ne treba da uvodi account enumeration kroz različit limiter/error response ako security model to izbegava.

---

# 46. LOGIN

Posebno analiziraj:

```text
POST /login
```

---

# 47. GLOBAL LOGIN IP LIMIT

Može zaštititi infrastructure, ali NAT može pogoditi legitimate users.

---

# 48. PER-ACCOUNT LOGIN LIMIT

Može sprečiti concentrated brute force.

Ali može omogućiti napadaču da namerno lockout-uje žrtvu.

---

# 49. LOCKOUT

Permanent/dug account lockout posle nekoliko pokušaja može biti abuse vector.

---

# 50. EXPONENTIAL DELAY

Može biti alternativa hard lockout-u.

Ne preporučuj bez UX/security analize.

---

# 51. CREDENTIAL STUFFING

Napad:

```text
one password attempt
x
100k accounts
```

Per-account limit ne pomaže mnogo.

---

# 52. DISTRIBUTED BRUTE FORCE

Napadač može koristiti mnogo IP adresa.

IP-only limiter nije dovoljna zaštita za high-value auth.

---

# 53. CAPTCHA

Ne uvodi automatski.

Može biti relevantna nakon:

- risk threshold
- suspicious behavior

ali accessibility/UX cost postoji.

---

# 54. MFA / OTP SEND

Poseban limiter treba razmotriti za:

- send
- verify

---

# 55. OTP SEND VS OTP VERIFY

To su različiti abuse modeli.

---

# 56. OTP GUESSING

Verification endpoint treba ograničiti pokušaje za konkretan challenge/code.

---

# 57. NEW OTP RESET COUNTER

Critical bypass:

```text
wrong OTP attempts reach limit
↓
request new OTP
↓
attempt counter resets
↓
repeat endlessly
```

Proveri actual design.

---

# 58. PASSWORD RESET

Mapiraj:

- reset request
- token verification
- final password change

---

# 59. RESET REQUEST SPAM

Napadač može spamovati email korisniku.

---

# 60. RESEND

`resend verification` endpoint je tipičan abuse surface.

---

# 61. REGISTRATION

Proveri:

- IP/user/device limits
- fake account creation
- expensive side effects

---

# 62. FREE TIER ABUSE

Ako novi account dobija:

- credits
- trial
- storage
- AI usage

simple per-account limit može biti trivijalno zaobiđen novim account-om.

---

# 63. DEVICE FINGERPRINT

Ne preporučuj invasive fingerprinting automatski.

Privacy/product tradeoff mora biti opravdan.

---

# 64. REFERRAL ABUSE

Ako referral daje reward:

rate limiting sam možda nije dovoljan.

Označi da je potreban širi anti-fraud model ako relevantno.

---

# 65. SEARCH

Expensive search može biti abuse/capacity surface.

---

# 66. REGEX SEARCH

Ako user kontroliše regex ili heavy query:

performance abuse risk.

---

# 67. FILTER EXPLOSION

Complex query params mogu napraviti veoma skup DB plan.

---

# 68. REPORTS

Report/export endpoint često treba poseban limiter.

---

# 69. ASYNC JOB CREATION

Čak i ako posao ide u queue:

unlimited enqueue može napuniti backlog.

---

# 70. QUEUE ABUSE

Scenario:

```text
attacker creates 1M jobs
↓
API quickly returns 202
↓
queue backlog explodes
↓
legitimate jobs delayed
```

---

# 71. JOB LIMIT

Proveri:

- requests/time
- active jobs
- queued jobs
- per-user/tenant

---

# 72. ACTIVE JOB CAP

Može biti važniji od simple request rate-a.

---

# 73. DUPLICATE JOB REQUEST

Isti expensive export/generation može biti dedupovan gde semantics dozvoljavaju.

---

# 74. FILE UPLOAD

Abuse nije samo request count.

---

# 75. BYTE RATE

10 request-a od 10 GB nije isto što i 10 malih JSON request-a.

---

# 76. UPLOAD SIZE

Proveri:

- per-file
- total
- concurrent uploads
- per-account storage quota

---

# 77. SLOW UPLOAD

Slow client može dugo držati connection/resource.

Reverse proxy/server timeout i body-rate protections mogu biti relevantni.

---

# 78. DOWNLOAD ABUSE

Large file download može generisati:

- egress cost
- bandwidth saturation

---

# 79. SIGNED URL

Ako object storage može direktno služiti file, backend možda ne treba da proxy-uje sav bandwidth.

Ali authorization/cost model mora ostati bezbedan.

---

# 80. RANGE ABUSE

Veliki broj random Range request-a može povećati origin overhead u određenim sistemima.

Prijavi samo gde realno relevantno.

---

# 81. AI / LLM ENDPOINT

Ako postoji:

posebno mapiraj:

- token cost
- model cost
- context size
- concurrent generations
- timeout

---

# 82. REQUEST COUNT NIJE DOVOLJAN ZA AI

Jedan request od 100k tokena može koštati mnogo više od 100 malih.

---

# 83. TOKEN QUOTA

Ako provider/model usage ima tokene:

business/cost limiter može koristiti token budget.

---

# 84. CONCURRENT AI REQUESTS

Per-user concurrency limit može biti važniji od requests/min.

---

# 85. CANCELLATION

Ako user zatvori request, proveri da li expensive upstream generation nastavlja i naplaćuje se.

---

# 86. WEBHOOK ENDPOINT

Incoming webhook ne treba limitirati tako da legitimni provider retry burst bude izgubljen.

---

# 87. WEBHOOK AUTHENTICATION PRE LIMITA

Pitanje:

> Da li invalid attackers mogu trošiti shared provider bucket?

Možda signature validation treba da utiče na policy redosled.

Ali crypto validation takođe košta.

Analiziraj realan tradeoff.

---

# 88. PROVIDER IP ALLOWLIST

Može pomoći samo ako provider stabilno dokumentuje IP range.

Ne preporučuj bez contract-a.

---

# 89. ADMIN ENDPOINT

Admin nije immune na accidental loops ili compromised credentials.

Skupi admin bulk actions mogu imati capacity guard.

---

# 90. INTERNAL SERVICE

Service-to-service API može imati:

- per-service quota
- circuit breaker
- admission control

Ne pretpostavljaj trusted = unlimited.

---

# 91. HEALTH ENDPOINT

Ne treba težak limiter ako monitoring često poll-uje.

---

# 92. METRICS ENDPOINT

Ako public, može biti information/security problem, ali limiter nije glavna zaštita.

---

# 93. RATE LIMIT RESPONSE

Proveri status:

```text
429 Too Many Requests
```

gde odgovara.

---

# 94. RETRY-AFTER

Ako client može smisleno retry-ovati:

proveri header.

---

# 95. RATE LIMIT HEADERS

Ako API izlaže:

- limit
- remaining
- reset

proveri da se slažu sa stvarnim algorithm-om.

---

# 96. FALSE REMAINING

Distributed/race bug može vratiti `remaining=5`, pa sledeći request biti odbijen.

Mali mismatch možda nije critical, ali contract mora biti razuman.

---

# 97. CLOCK

Limiter koji koristi više server clock-ova može imati edge case ako clocks nisu dovoljno sinhronizovani.

Posebno za custom distributed window logic.

---

# 98. REDIS TIME

Centralized time source može pomoći nekim algoritmima.

Ne uvodi automatski.

---

# 99. FAIL-OPEN VS FAIL-CLOSED

Najvažnije pitanje kada limiter backend padne.

---

# 100. REDIS DOWN

Šta se događa?

```text
allow all
```

ili:

```text
reject all
```

---

# 101. FAIL-OPEN

Može biti ispravno za low-risk endpoint da limiter outage ne obori celu aplikaciju.

---

# 102. FAIL-CLOSED

Može biti potrebno za:

- expensive money-burning action
- OTP abuse
- critical security endpoint

Ali može napraviti total outage.

---

# 103. HYBRID FALLBACK

Možda postoji local emergency limiter.

Ne preporučuj bez complexity potrebe.

---

# 104. LIMITER LATENCY

Svaki API request koji čeka remote limiter store uvodi latency.

Meri ako je hot path.

---

# 105. LIMITER STORE BOTTLENECK

Redis/DB limiter sam može postati centralni bottleneck.

---

# 106. ONE KEY HOTSPOT

Global limiter counter za sav traffic može biti hot key.

---

# 107. HIGH CARDINALITY KEYS

Suprotno, milioni unique keys povećavaju memory usage.

---

# 108. KEY CLEANUP

Proveri expiry.

---

# 109. MEMORY DOS

Attacker može generisati mnogo unique keys:

```text
random username
random path
random token
```

Ako svaki pravi limiter entry:

state store može rasti.

---

# 110. UNTRUSTED KEY MATERIAL

Ne koristi raw ogromni user-controlled string direktno kao Redis key bez bounds/normalization.

---

# 111. KEY COLLISION

Composite keys moraju izbegavati ambiguity.

Primer:

```text
user + ":" + route
```

je obično okej ako komponente imaju jasnu encoding semantiku.

---

# 112. NORMALIZATION

Email/user identifier limiter može biti zaobiđen razlikama:

- case
- whitespace
- Unicode

ako identity semantics kažu da su zapravo isti account.

---

# 113. PATH NORMALIZATION

Limiter po raw path-u može se zaobići kroz route variants ako framework mapira više URL formi na isti handler.

---

# 114. QUERY STRING

Ako limiter key uključuje ceo query:

napadač može menjati nebitan parametar i praviti nove buckets.

---

# 115. ROUTE TEMPLATE

Često je smislenije limitirati po logical route-u:

```text
/users/:id
```

nego po svakom konkretnom ID-u, zavisno od policy-ja.

---

# 116. RESOURCE-SCOPED LIMIT

Ponekad upravo resource ID treba u key-u.

Primer:

OTP challenge.

---

# 117. HTTP METHOD

GET i POST na istoj path ruti mogu imati različite cost/risk profile.

---

# 118. STATUS-BASED COUNTING

Pitaj da li failed request računa limit.

---

# 119. LOGIN FAILURE COUNT

Za brute-force zaštitu upravo failures su glavni signal.

---

# 120. VALIDATION SPAM

Invalid request i dalje troši CPU/parsing.

Limiter pre skupog business work-a može imati smisla.

---

# 121. SUCCESS-ONLY LIMIT

Može biti pogrešan za abuse.

Attacker može slati requests koji namerno padaju posle skupog rada.

---

# 122. COST OCCURS PRE FAILURE

Mapiraj kada se limiter check radi u odnosu na:

- body parse
- auth
- DB
- external API

---

# 123. LIMITER TOO LATE

Scenario:

```text
parse huge body
↓
DB query
↓
expensive provider call
↓
rate limit check
```

Zaštita je praktično beskorisna za capacity.

---

# 124. LIMITER TOO EARLY

Pre auth-a možda svi useri iza jedne IP dele bucket.

Tradeoff mora biti nameran.

---

# 125. MULTI-STAGE LIMITING

Moguće:

```text
cheap IP edge limit
↓
auth
↓
user-specific application limit
```

ali ne uvodi bez razloga.

---

# 126. ERROR CODE BYPASS

Napadač može menjati input tako da request ide drugim route/error path-om koji nema limiter.

---

# 127. ALIAS ENDPOINT

Ako postoje:

```text
/login
/auth/login
/v1/login
```

proveri da protection važi na svim variantama.

---

# 128. OLD API VERSION

Legacy endpoint može ostati bez novog limiter-a.

---

# 129. GRAPHQL

Jedan HTTP endpoint otežava request-count limiting.

---

# 130. GRAPHQL COMPLEXITY

Ako postoji GraphQL:

proveri:

- query depth
- complexity
- field cost
- aliases
- batching

---

# 131. ONE GRAPHQL REQUEST

Može sadržati stotine expensive resolver calls.

---

# 132. ALIAS ABUSE

Ista expensive field query ponovljena kroz aliases.

---

# 133. BATCHED GRAPHQL

Jedan HTTP request može sadržati multiple operations ako stack dozvoljava.

---

# 134. REST BULK

Sličan problem:

jedan request može sadržati 10.000 items.

Request-count limiter to ne vidi.

---

# 135. BULK ITEM LIMIT

Proveri hard bound.

---

# 136. WEBSOCKET

Ako postoji:

HTTP connection limiter nije dovoljan.

---

# 137. CONNECTION LIMIT

Proveri per-user/IP:

- simultaneous sockets
- reconnect rate

---

# 138. MESSAGE RATE

Connected client može slati neograničeno messages/sec ako nema message-level guard.

---

# 139. SUBSCRIPTION LIMIT

Jedan socket može subscribe-ovati na hiljade topics.

---

# 140. SSE

Long-lived connections troše connection capacity.

Proveri per-user/global bounds ako relevantno.

---

# 141. RECONNECT STORM

Backend restart može izazvati hiljade clients koji reconnect-uju odjednom.

---

# 142. CLIENT BACKOFF

Ako client code postoji, proveri reconnect jitter/backoff.

---

# 143. CACHE ABUSE

Napadač može namerno birati unique query-je koji nikada ne hituju cache.

---

# 144. CACHE BUSTER

Random query parameter može zaobići CDN/cache i udariti origin.

---

# 145. CDN CONFIG

Ako CDN uključuje nepotrebne query parametre u cache key, abuse surface raste.

---

# 146. EXPENSIVE CACHE MISS

Posebno proveri popularne public endpoints.

---

# 147. DB CONNECTION ABUSE

Mnogo slow requests može iscrpeti DB pool čak pre CPU saturation-a.

---

# 148. SLOWLORIS-LIKE APPLICATION EFFECT

Ne radi full network DoS audit, ali proveri body/header/request timeouts ako server direktno prima internet traffic.

---

# 149. SERVER TIMEOUTS

Ograniči koliko dugo incomplete/slow request može zauzimati resource, prema stack-u.

---

# 150. REQUEST BODY LIMIT

Prva linija odbrane protiv velikih payload-a.

---

# 151. HEADER SIZE

Oversized headers takođe imaju limits na proxy/server layer-u.

---

# 152. PARSER ABUSE

Deeply nested JSON može biti CPU/memory problem u nekim stack-ovima.

---

# 153. ARRAY SIZE

Validacija:

```text
items: max N
```

gde business/API to zahteva.

---

# 154. STRING SIZE

Search/query/text fields mogu imati bounds.

---

# 155. REGEX DOS

Ako user-controlled string ide kroz rizičan regex:

abuse protection i code fix su odvojeni problemi.

---

# 156. DATABASE ABUSE

Arbitrary sort/filter combinations mogu napraviti expensive query.

---

# 157. SORT WHITELIST

Security + performance.

---

# 158. DATE RANGE

Report endpoint sa:

```text
from=1900
to=2100
```

može skenirati ogromnu tabelu.

---

# 159. MAX RANGE

Može biti smislen domain/capacity guard.

---

# 160. EXPORT FREQUENCY

Veliki export može imati:

- per-user limit
- active export cap

---

# 161. ASYNC NE UKLANJA ABUSE

Prebacivanje u queue samo premešta bottleneck.

---

# 162. EMAIL VERIFICATION

Limiter treba da zaštiti:

- resend
- verify attempts

različitim semantics.

---

# 163. INVITE SPAM

User sa pravom invite-a može slati hiljade email pozivnica.

---

# 164. COMMENT / MESSAGE SPAM

Ako UGC postoji:

rate limit je samo deo anti-spam modela.

---

# 165. DELETE ABUSE

High-frequency destructive operations mogu opteretiti:

- cascades
- audit
- storage cleanup

---

# 166. CREATE/DELETE LOOP

Napadač može praviti i brisati resources radi:

- storage
- jobs
- notifications

---

# 167. EXPENSIVE FAILURE PATH

Napadač može birati input koji prolazi najskuplji deo obrade, pa tek onda pada.

---

# 168. AUTHORIZED ABUSE

Validan paid/authenticated user može i dalje zloupotrebiti capacity.

Authorization ne rešava abuse.

---

# 169. PREMIUM USER

Veći quota ne znači unlimited.

---

# 170. ADMIN

Isti princip.

---

# 171. INTERNAL BUG LOOP

Rate limiter može zaštititi i od sopstvenog buggy client-a koji uđe u retry loop.

---

# 172. MOBILE RETRY LOOP

Scenario:

```text
API returns error
↓
client retries instantly forever
```

Backend limiter može sprečiti total overload, ali client bug treba posebno rešiti.

---

# 173. WEB POLLING

Frontend koji poll-uje svakih 100 ms može slučajno izazvati abuse-like load.

---

# 174. RETRY-AFTER CLIENT COMPLIANCE

Ako server vraća 429:

proveri da official clients poštuju backoff.

---

# 175. 429 RETRY STORM

Ako svi clients retry-uju tačno u istoj sekundi reset-a:

može nastati burst.

---

# 176. JITTER ON CLIENT

Može pomoći za large fleets.

---

# 177. RATE LIMIT MONITORING

Meri bar gde je relevantno:

- allowed
- rejected
- key category
- route
- tenant/user class

---

# 178. NE LOGUJ RAW KEY

Limiter key može sadržati:

- email
- IP
- API key

Maskiraj/hashi po potrebi.

---

# 179. TOP THROTTLED ROUTES

Operativno koristan signal.

---

# 180. FALSE POSITIVE RATE

Ako legitimate requests često dobijaju 429:

policy možda nije dobro podešena.

---

# 181. BYPASS DETECTION

Ako request rate ostaje ogroman, a limiter skoro nikad ne reject-uje:

možda je key previše lako rotirati.

---

# 182. DISTRIBUTION

Prati broj unique limiter keys.

Nagao rast može ukazivati na distributed attack ili key explosion.

---

# 183. LIMITER STORE METRICS

Ako Redis:

- latency
- errors
- memory
- evictions

---

# 184. EVICTION

Ako limiter keys mogu biti evicted pod memory pressure:

attacker može dobiti dodatni budget.

---

# 185. SHARED REDIS

Ako cache i limiter dele Redis:

cache memory spike može uticati na abuse protection.

---

# 186. DB-BASED LIMITER

Može biti preskup za svaki request pod velikim traffic-om.

Meri.

---

# 187. WRITE AMPLIFICATION

Svaki HTTP request -> DB row update može sam napraviti bottleneck.

---

# 188. EDGE LIMITER

CDN/WAF layer može skinuti volumetrijski load pre origin-a.

Ali app-level identity/quota i dalje može biti potrebna.

---

# 189. WAF NIJE BUSINESS LIMITER

WAF ne zna nužno user/tenant quotas.

---

# 190. APPLICATION LIMITER NIJE DDOS MITIGATION

Ako 10 Gbps traffic stigne do app-a, application code možda nikada neće imati priliku da se zaštiti.

Jasno razdvoji scope.

---

# 191. UPSTREAM INFRA LIMITS

Ako platforma već ima:

- connection limits
- edge rate control
- function concurrency caps

dokumentuj ih.

---

# 192. CONCURRENCY CAP

Serverless reserved concurrency može štititi downstream, ali i izazvati rejection/queue behavior.

---

# 193. LOAD SHEDDING

Kada je backend preopterećen:

kontrolisani 503/429 može biti bolji od totalnog timeout-a.

---

# 194. 429 VS 503

429 obično znači caller quota/rate.

503 može značiti service capacity/unavailability.

Ne mešaj semantiku bez razloga.

---

# 195. RETRY SIGNAL

Client behavior može zavisiti od razlike.

---

# 196. PRIORITY

Critical internal requests možda treba drugačiji capacity bucket od low-priority report-a.

Samo ako product/architecture to opravdava.

---

# 197. FAIRNESS

Jedan korisnik ne bi trebalo da zauzme svih N expensive worker slotova ako sistem treba da služi mnoge korisnike.

---

# 198. PER-USER CONCURRENCY

Za expensive jobs može biti važnije od rate/minute.

---

# 199. SEMAPHORE

Local semaphore nije globalna per-user garancija u multi-instance deployment-u.

---

# 200. DISTRIBUTED CONCURRENCY

Ako je neophodno, treba shared coordination ili queue partition model.

Ne uvodi automatski distributed lock.

---

# 201. RACE U LIMITERU

Load testiraj exact boundary:

```text
limit = 10
20 simultaneous requests
```

Koliko stvarno prolazi?

---

# 202. OFF-BY-ONE

Čest bug:

```text
if count > limit
```

vs:

```text
if count >= limit
```

Proveri actual semantics.

---

# 203. RESET

Na window boundary proveri:

- tačno vreme
- old key
- new key
- headers

---

# 204. TIMEZONE

Rate limiter window obično treba stabilan server/UTC model.

Ne vezuj za user timezone osim ako je business quota.

---

# 205. DISTRIBUTED CLOCK SKEW

Custom multi-node window algorithm može biti osetljiv.

---

# 206. TESTOVI

Mapiraj:

- limiter unit tests
- integration tests
- concurrency tests
- multi-instance tests
- proxy/IP tests
- load tests

---

# 207. HAPPY PATH NIJE DOVOLJAN

Test:

```text
1 request
```

ne dokazuje limiter.

---

# 208. BOUNDARY TEST

Test:

```text
limit - 1
limit
limit + 1
```

---

# 209. CONCURRENT BOUNDARY TEST

Sve zahteve pošalji istovremeno.

---

# 210. WINDOW BOUNDARY TEST

Request-i neposredno pre i posle reset-a.

---

# 211. MULTI-INSTANCE TEST

Ako architecture ima više replicas:

requests rasporedi preko više instanci.

---

# 212. PROCESS RESTART

In-memory state nestaje.

Pitaj da li je to expected ili bypass.

---

# 213. REDIS OUTAGE TEST

Testiraj fail-open/fail-closed semantics.

---

# 214. SPOOFED IP TEST

Pošalji različite forwarded headers kroz realan proxy path.

---

# 215. NAT TEST

Više authenticated users sa istom IP.

---

# 216. MULTI-IP TEST

Isti account sa više IP adresa.

---

# 217. QUERY VARIATION TEST

Dodaj random irrelevant query param.

Pitaj da li limiter bucket ostaje isti gde treba.

---

# 218. ROUTE PARAM TEST

```text
/users/1
/users/2
/users/3
```

Da li logical route limit može biti zaobiđen menjajući resource ID?

Zavisi od policy-ja.

---

# 219. LOGIN ATTACK TEST

Simuliraj:

- same account, many IPs
- many accounts, same IP
- many accounts, many IPs

u sigurnom test okruženju.

---

# 220. OTP TEST

Proveri:

- send spam
- verify guessing
- resend reset bypass

---

# 221. EXPENSIVE ENDPOINT LOAD TEST

Proveri limiter pre nego što downstream saturira.

---

# 222. QUEUE ADMISSION TEST

Pokušaj masovno kreiranje jobs.

---

# 223. FILE TEST

Malo request-a sa maksimalnim body size-om.

---

# 224. COST TEST

Ako endpoint ima direktan paid external cost:

izračunaj worst-case dozvoljeni cost po:

- useru
- satu
- danu

samo ako pricing/config podaci postoje.

---

# 225. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Endpoint/Operation:
Limiter layer:
Current policy:
Limiter key:
Algorithm:
Store:
Deployment topology:

Problem:

Evidence:

Abuse Timeline:

T0:
T1:
T2:
T3:

Expected limit:

Effective limit:

Bypass method:

Affected scope:

Infrastructure impact:

Financial impact:

Security impact:

Legitimate-user impact:

Fail-open/fail-closed behavior:

Root cause:

Recommended remediation:

Regression/load test:

Production verification:

Complexity:
XS / S / M / L / XL
```

Ako vrednost nije poznata:

**NOT VERIFIED**

---

# 226. SEVERITY

Koristi:

## P0 - CRITICAL

Samo kada abuse/rate-limit flaw omogućava:

- catastrophic financial drain
- critical authentication/security compromise
- sistemski outage veoma niskim effort-om
- cross-tenant critical resource starvation sa ozbiljnim posledicama

## P1 - HIGH

- critical auth endpoint praktično nema efikasnu abuse zaštitu
- limiter se trivijalno zaobilazi
- expensive endpoint može lako iscrpeti production capacity ili paid provider budget
- multi-instance bug višestruko povećava navodno garantovani limit
- queue/file/job abuse može izazvati veliki outage ili trošak

## P2 - MEDIUM

- značajan limiter weakness
- fairness problem
- rate policy ne odgovara realnom endpoint cost-u
- substantial false-positive ili bypass scenario

## P3 - LOW

- ograničen abuse edge case
- manje nedosledan header/reset behavior

## P4 - IMPROVEMENT

- bolja observability/tuning/fairness bez potvrđenog trenutnog abuse problema

---

# 227. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code/config + concurrency/load test direktno potvrđuju behavior.

MEDIUM:

jak code-level evidence, ali production proxy/topology nije potpuno potvrđen.

LOW:

zavisi od nepoznatog CDN/WAF/provider behavior-a.

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

# 229. ABUSE CATEGORY

Za svaki finding označi:

```text
BRUTE FORCE
CREDENTIAL STUFFING
SPAM
ENUMERATION
CAPACITY EXHAUSTION
QUEUE FLOOD
FILE/BANDWIDTH
EXTERNAL-COST
FAIRNESS
LIMITER BYPASS
DISTRIBUTED CORRECTNESS
```

---

# 230. PROTECTION LAYER

Označi:

```text
EDGE
GATEWAY
APPLICATION
BUSINESS QUOTA
QUEUE
PROVIDER
MULTI-LAYER
```

---

# 231. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. proxy/CDN config
2. route middleware
3. limiter key construction
4. store atomicity
5. deployment instance count
6. endpoint actual cost
7. business quota
8. official client behavior
9. tests
10. monitoring

Ne zaključuj da limiter ne postoji samo zato što ga nema u controller-u.

---

# 232. NE PREPORUČUJ ISTI LIMIT SVIMA

Different endpoint, user tier, tenant i workload mogu legitimno imati različite limite.

---

# 233. NE PREPORUČUJ IP-ONLY AUTOMATSKI

Shared NAT i distributed attackers menjaju value IP signala.

---

# 234. NE PREPORUČUJ ACCOUNT LOCKOUT AUTOMATSKI

Može omogućiti denial-of-service nad žrtvinim account-om.

---

# 235. NE PREPORUČUJ CAPTCHA SVUDA

CAPTCHA ima UX, accessibility i privacy cenu.

---

# 236. NE PREPORUČUJ REDIS BEZ POTREBE

Ako postoji jedna backend instance i mali internal sistem, in-memory limiter može biti dovoljan za njegov jasno definisan cilj.

---

# 237. NE PREPORUČUJ WAF KAO JEDINO REŠENJE

WAF nije zamena za user/tenant/business-aware limits.

---

# 238. NE POVEĆAVAJ LIMIT DA "FIXUJEŠ" FALSE POSITIVE

Prvo razumi legitimni burst obrazac.

Možda treba drugačiji algorithm/key, ne samo veći broj.

---

# 239. NE SMANJUJ LIMIT BEZ CAPACITY MODELA

Agresivnije nije automatski bezbednije.

Može samo oštetiti normalne korisnike.

---

# 240. NE MENJAJ KOD

Tokom audita:

- ne dodaje limiter
- ne menja threshold
- ne uvodi Redis
- ne menja login lockout
- ne dodaje CAPTCHA
- ne menja proxy

Prvo završi audit.

---

# 241. OUTPUT - RATE_LIMITING_ABUSE_PROTECTION_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- protection layers
- limiter architecture
- critical abuse surfaces
- najveći bypass-i
- capacity protection readiness

## 2. Infrastructure / Edge Protection Map

## 3. Application Limiter Architecture

## 4. Endpoint Abuse Inventory

## 5. Limiter Identity / Key Audit

## 6. Proxy / Client IP Audit

## 7. Multi-Instance / Distributed Correctness

## 8. Algorithm / Window Audit

## 9. Login / Credential Abuse Audit

## 10. OTP / Password Reset Audit

## 11. Registration / Trial Abuse Audit

## 12. Email / SMS Abuse Audit

## 13. Expensive API Audit

## 14. External-Cost API Audit

## 15. File / Bandwidth Abuse Audit

## 16. Search / Report / Export Audit

## 17. Queue / Background Job Admission Audit

## 18. WebSocket / SSE Audit

Ako relevantno.

## 19. GraphQL / Bulk Cost Audit

Ako relevantno.

## 20. Fail-Open / Fail-Closed Audit

## 21. Limiter Store Performance / Reliability

## 22. Fairness / Multi-Tenant Audit

## 23. Response Contract / Retry Guidance

## 24. Monitoring / Abuse Visibility

## 25. Test Coverage

## 26. Findings Summary

| ID | Severity | Endpoint | Abuse type | Bypass/Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 27. P0 Findings

## 28. P1 Findings

## 29. P2 Findings

## 30. P3 Findings

## 31. P4 Improvements

## 32. Things Done Well

## 33. Unknown / Not Verified

## 34. Protection Remediation Roadmap

---

# 242. ENDPOINT LIMIT MATRIX

| Endpoint | Identity | Limit | Window | Cost | Distributed |
|---|---|---:|---|---|---|

---

# 243. AUTH ABUSE MATRIX

| Flow | Per-IP | Per-account | Global | Lockout | Bypass risk |
|---|---|---|---|---|---|

---

# 244. DISTRIBUTED MATRIX

| Limiter | Store | Atomic | Shared across replicas | Restart-safe | Risk |
|---|---|---|---|---|---|

---

# 245. COST MATRIX

| Operation | Backend cost | External cost | Concurrency cap | Abuse protection |
|---|---|---|---|---|

---

# 246. FAILOVER MATRIX

| Limiter dependency failure | Current behavior | Fail-open | Fail-closed | Business risk |
|---|---|---|---|---|

---

# 247. SECOND PASS - LIMIT BYPASS ATTACK

Za svaki limiter key pitaj:

> Koji njegov deo napadač može lako da promeni?

Primeri:

- IP header
- query param
- path ID
- account
- session
- API key

---

# 248. SECOND PASS - MULTI-INSTANCE ATTACK

Pretpostavi 10 backend replicas.

Pošalji request-e tako da se ravnomerno rasporede.

Izračunaj efektivni limit.

---

# 249. SECOND PASS - WINDOW EDGE

Maksimalan burst neposredno pre i posle reset-a.

---

# 250. SECOND PASS - NAT ATTACK

100 legitimnih usera sa iste IP.

Pitaj ko biva throttled.

---

# 251. SECOND PASS - DISTRIBUTED ATTACK

Jedan account kroz 100 IP adresa.

Pitaj da li account-level protection i dalje važi.

---

# 252. SECOND PASS - ACCOUNT ROTATION

Jedna IP, mnogo novih naloga.

Relevantno za:

- trial
- credits
- free generation
- referrals

---

# 253. SECOND PASS - UNIQUE KEY FLOOD

Šalji veliki broj request-a sa unique limiter identity values.

Pitaj koliko state store raste.

---

# 254. SECOND PASS - REDIS OUTAGE

Ugasi limiter store u test environment-u.

Pitaj:

> Koji endpoint-i fail-open, a koji fail-closed?

---

# 255. SECOND PASS - EXPENSIVE FAILURE PATH

Konstruiši request koji troši maksimalni server cost, ali na kraju vraća error.

Pitaj da li limiter/admission control štiti pre expensive rada.

---

# 256. SECOND PASS - QUEUE FLOOD

Masovno enqueue expensive jobs.

Prati:

- API response
- queue depth
- oldest job
- legitimate-user latency

---

# 257. SECOND PASS - LOGIN MATRIX

Testiraj:

```text
same account + same IP
same account + many IPs
many accounts + same IP
many accounts + many IPs
```

---

# 258. SECOND PASS - OTP

Proveri:

```text
send
verify
resend
new challenge
```

Traži counter reset bypass.

---

# 259. SECOND PASS - 429 CLIENT LOOP

Official client dobije 429.

Pitaj:

- da li odmah retry-uje
- poštuje Retry-After
- pravi jitter

---

# 260. SECOND PASS - PEAK LOAD

Limiter treba da zaštiti sistem pre:

- DB pool exhaustion
- queue collapse
- paid-provider budget exhaustion

Uporedi protection threshold sa realnim capacity signalima gde postoje.

---

# 261. SECOND PASS - LEGITIMATE BURST

Simuliraj realan app startup/dashboard flow.

Pitaj da li normalan user dobija 429 zbog nekoliko paralelnih request-a.

---

# 262. SECOND PASS - LARGE TENANT

Jedan legitimni veliki tenant može generisati workload koji izgleda kao abuse.

Pitaj da li policy podržava njegov product tier.

---

# 263. SECOND PASS - COST AMPLIFICATION

Jedan request možda pokreće:

```text
1 API request
↓
50 DB queries
↓
10 external API calls
↓
100 queued jobs
```

Request-count limiter mora biti ocenjen prema stvarnom amplification-u.

---

# 264. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- infrastructure i app-level protection nisu pomešani
- business quotas su odvojene od abuse limits
- critical endpoint-i su rangirani prema stvarnom cost/risk-u
- IP identity je analizirana kroz proxy, NAT i IPv6
- X-Forwarded-For nije slepo trusted
- multi-instance effective limit je izračunat gde je moguće
- distributed counter update je provereno atomic
- fixed-window boundary burst je analiziran samo ako relevantan
- login je testiran protiv concentrated i distributed brute force-a
- account lockout nije preporučen bez DoS analize
- OTP send i verify imaju odvojene threat modele
- resend/new challenge ne resetuje zaštitu trivijalno
- expensive endpoint-i imaju admission/cost analizu
- async jobs nisu tretirani kao "besplatni" zato što idu u queue
- file abuse uzima byte size/concurrency u obzir
- AI/external paid endpoint-i uzimaju actual unit cost u obzir
- limiter check nije postavljen tek posle expensive work-a
- fail-open/fail-closed behavior je eksplicitno analiziran
- limiter store sam nije postao bottleneck ili memory DoS površina
- official clients pravilno reaguju na 429 gde su dostupni
- legitimate burst/fairness scenariji su provereni
- WAF/CDN nisu predstavljeni kao zamena za business-aware limiter
- P4 tuning suggestions su odvojene od potvrđenih bypass-a

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte Redis rate limiter, 100 request-a u minuti i CAPTCHA na login.

To nije abuse protection audit.

Tražim probleme poput:

```text
backend behind reverse proxy
↓
rate limiter key = X-Forwarded-For
↓
proxy trust configuration accepts client header directly
↓
attacker sends a different fake IP each request
↓
every request gets a fresh bucket
↓
rate limit is effectively bypassed
```

ili:

```text
limit = 100/min per process
↓
10 backend replicas
↓
load balancer distributes traffic
↓
attacker receives approximately 100 requests of budget on each replica
↓
documented 100/min protection is not globally enforced
```

ili:

```text
POST /send-otp
↓
5 attempts allowed
↓
attacker reaches limit
↓
requests new OTP
↓
verification-attempt counter resets
↓
cycle repeats
↓
OTP guessing protection is bypassed
```

ili:

```text
POST /reports/generate
↓
returns 202 quickly
↓
each request creates expensive queue job
↓
no per-user active/queued job cap
↓
attacker creates 100,000 jobs
↓
legitimate reports wait for hours
```

ili:

```text
limiter checks rate only after:
body parsing
database queries
external AI request
↓
attacker exceeds limit
↓
429 returned
↓
but expensive work has already happened
```

ili:

```text
rate limit key includes raw query string
↓
?search=x&a=1
?search=x&a=2
?search=x&a=3
↓
each variation creates a new bucket
↓
logical endpoint limit is bypassed
```

ili:

```text
100 legitimate mobile users behind carrier NAT
↓
one shared public IP
↓
one user generates heavy traffic
↓
entire IP bucket is exhausted
↓
99 unrelated users receive 429
```

ili:

```text
Redis limiter unavailable
↓
middleware catches Redis error
↓
allows every request
↓
expensive paid external API endpoint becomes unlimited
↓
provider cost spikes during limiter outage
```

To su rate limiting i abuse protection problemi koje treba da pronađeš.

Razmišljaj kroz:

- attacker-controlled identity
- distributed deployment
- endpoint cost
- burst
- concurrency
- queue admission
- paid external resources
- fail-open/fail-closed
- fairness
- legitimate traffic patterns

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji endpoint se zloupotrebljava?

> Koji limiter bi trebalo da ga štiti?

> Koji exact key/policy se koristi?

> Kako se taj key može rotirati ili zaobići?

> Da li limit važi kroz sve backend instance?

> Koliki je efektivni limit u production topologiji?

> Šta napadač dobija, a šta sistem troši?

> Šta se događa ako limiter infrastructure padne?

Ako protection nije proverljiva:

**NOT VERIFIED.**

Ako production proxy/topologija nije poznata:

**PRODUCTION TOPOLOGY NOT VERIFIED.**

Ako je samo fino podešavanje bez potvrđenog problema:

**P4 - IMPROVEMENT.**

Bolje je pronaći 6 stvarnih bypass/capacity/fairness problema nego napisati 100 generičkih limiter pravila.

Cilj je dobiti forenzički precizan abuse protection audit koji se može direktno pretvoriti u:

- limiter regression test
- concurrency test
- multi-instance test
- proxy/IP hardening
- endpoint-specific policy
- queue admission control
- cost protection
- production monitoring
