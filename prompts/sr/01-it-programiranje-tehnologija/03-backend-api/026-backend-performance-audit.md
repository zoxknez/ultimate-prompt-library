---
id: UPL-IT-026
number: 26
slug: backend-performance-audit
title: Backend Performance Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# BACKEND PERFORMANCE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu performansi kompletnog backend sistema.

Glavni cilj:

> Pronaći stvarne latency, throughput, CPU, memory, database, network, serialization, queue i concurrency bottleneck-e koji mogu degradirati response time, smanjiti kapacitet sistema, povećati troškove ili izazvati cascading failure pod realnim production opterećenjem.

Ovo nije:

- generički "optimizuj backend" checklist
- automatsko dodavanje cache-a
- automatsko dodavanje Redis-a
- automatsko prebacivanje na microservices
- nasumično dodavanje concurrency-ja
- prerano indeksiranje svake DB kolone
- fokus samo na prosečan response time
- zaključivanje iz jednog lokalnog benchmarka
- mikro-optimizovanje koda koji nije hot path

Fokus je na:

```text
request
↓
routing/middleware
↓
business logic
↓
database
↓
external dependencies
↓
serialization
↓
network response
```

i na resource modelu:

```text
CPU
memory
database connections
threads/event loop
file descriptors
network sockets
queue workers
external API quotas
```

Prioritet:

**critical latency > throughput collapse > resource exhaustion > database bottlenecks > external dependency latency > queue backlog > CPU/memory hotspots > mikro-optimizacije**

Glavni princip:

> Ne optimizuj ono što nije dokazano da je bottleneck.

---

# 1. UTVRDI BACKEND STACK

Pre finding-a utvrdi:

- jezik
- runtime
- framework
- async model
- deployment
- database
- ORM
- cache
- message queue
- object storage
- reverse proxy
- API gateway
- CDN
- external APIs
- background workers
- observability tooling

---

# 2. UTVRDI PRODUCTION TOPOLOGIJU

Mapiraj:

```text
client
↓
CDN
↓
load balancer
↓
backend instances
↓
database/cache/queue
```

Ako nije poznato:

**PRODUCTION TOPOLOGY: NOT VERIFIED**

Nemoj izvoditi skalabilnost zaključke kao da postoji jedna ili 50 instanci bez evidence-a.

---

# 3. UTVRDI PERFORMANCE CILJEVE

Traži postojeće:

- SLO
- SLA
- latency budget
- throughput target
- concurrency target
- cost target

Ako ne postoje:

ne izmišljaj univerzalne pragove.

Označi:

**PERFORMANCE BUDGET: NOT DEFINED**

---

# 4. PROSEK NIJE DOVOLJAN

Gde postoje metrike koristi:

- P50
- P90
- P95
- P99
- max

Average može sakriti loš tail latency.

---

# 5. RPS NIJE JEDINA METRIKA

Mapiraj i:

- concurrent requests
- active DB connections
- queue depth
- worker utilization
- CPU
- memory
- I/O
- upstream latency

---

# 6. KRITIČNI ENDPOINT-I

Identifikuj najvažnije endpoint-e prema:

- traffic-u
- business važnosti
- latency sensitivity
- computational cost-u

Ne troši najveći deo audita na retko korišćen admin endpoint ako checkout/login/home query predstavlja glavni load.

---

# 7. HOT PATH MAPA

Za svaki critical endpoint napravi:

```text
HTTP request
↓
middleware
↓
auth
↓
service
↓
DB query
↓
external API
↓
serialization
↓
response
```

Za svaki korak odredi:

- sync/async
- resource
- latency
- frequency
- fan-out

---

# 8. LATENCY BUDGET

Ako imaš trace/metrike:

razloži ukupno vreme.

Primer:

```text
Total: 600 ms

DB: 350 ms
external API: 180 ms
serialization: 20 ms
other: 50 ms
```

Ne optimizuj 20 ms deo dok DB troši 350 ms.

---

# 9. EVIDENCE HIERARCHY

Koristi:

## A - Production traces/metrics

najviši signal.

## B - Production-like load test

## C - Query plans/profiler

## D - Reproducible benchmark

## E - Static code hotspot

## F - Teorijska sumnja

Severity i confidence prilagodi nivou evidence-a.

---

# 10. MEASURED VS INFERRED

Za svaki performance finding označi:

```text
MEASURED
CODE-LEVEL BOTTLENECK
POTENTIAL RISK
NOT MEASURED
```

---

# 11. REQUEST CONCURRENCY

Mapiraj koliko istovremenih request-a jedna instanca može podneti pre:

- CPU saturation-a
- memory growth-a
- DB pool exhaustion-a
- thread starvation-a
- event loop blockage-a

---

# 12. EVENT LOOP

Ako runtime ima event loop model, pronađi blocking operacije.

Primeri:

- sync filesystem
- CPU-heavy loop
- sync crypto
- blocking subprocess
- sync compression

---

# 13. EVENT LOOP BLOCKING

Scenario:

```text
one request
↓
CPU-heavy sync operation
↓
event loop blocked
↓
unrelated requests wait
```

Ovo može dramatično povećati tail latency.

---

# 14. THREAD-BASED SERVER

Ako framework koristi thread-per-request ili pool:

analiziraj:

- blocking time
- pool size
- starvation

Ne primenjuj Node.js event-loop zaključke na Java/.NET bez prilagođavanja.

---

# 15. ASYNC NE ZNAČI BESPLATNO

Async I/O smanjuje blocking thread usage, ali:

- DB
- CPU
- memory
- downstream

i dalje imaju ograničenja.

---

# 16. CPU PROFILING

Ako tooling postoji:

traži:

- hot functions
- serialization
- parsing
- crypto
- compression
- regex
- template rendering
- business loops

Ne nagađaj CPU hotspot bez evidence-a.

---

# 17. CPU-BOUND ENDPOINT

Ako endpoint radi heavy CPU task:

pitanje je:

> Da li request thread/event loop treba direktno da radi taj posao?

---

# 18. OFFLOAD

CPU-heavy workload možda pripada:

- worker pool-u
- queue-u
- dedicated service-u

ali samo ako latency/product semantics to dozvoljavaju.

---

# 19. WORKER POOL SATURATION

Ako svi CPU tasks idu u isti pool:

proveri da jedan feature ne blokira sve ostalo.

---

# 20. UNBOUNDED PARALLELISM

Traži:

```text
Promise.all(10000 items)
```

ili ekvivalent.

---

# 21. PARALLEL != FASTER

Ako 1000 tasks svi udare isti DB/API:

može biti sporije i destabilizovati dependency.

---

# 22. CONCURRENCY LIMIT

Preporuči limit samo uz konkretan bounded downstream/resource.

---

# 23. DATABASE PERFORMANCE

Za critical request pronađi sve query-je.

Napraviti:

| Query | Endpoint | Frequency | Rows | Index | Measured |
|---|---|---|---|---|---|

---

# 24. SLOW QUERY

Ako DB metric/query log postoji:

rangiraj po:

- total time
- mean time
- call count
- P95/P99 gde dostupno

---

# 25. TOTAL DB TIME

Query od 5 ms pozvan 1.000 puta može biti veći problem od jednog query-ja od 300 ms.

---

# 26. N+1

Klasičan:

```text
load 100 orders
↓
query customer for each order
```

---

# 27. ORM HIDDEN N+1

Lazy relations mogu sakriti query count.

Prati stvarne SQL query-je.

---

# 28. OVERFETCHING

Query učitava:

- veliki text
- BLOB
- relations

koji endpoint ne koristi.

---

# 29. UNDERFETCHING

Suprotno:

previše malih query-ja može biti skuplje od jednog smislenog JOIN-a/batch-a.

---

# 30. INDEX

Za critical query koristi:

```text
EXPLAIN
EXPLAIN ANALYZE
```

gde bezbedno i dostupno.

Ne izmišljaj query plan.

---

# 31. FULL SCAN

Full scan nije automatski problem.

Tabela od 20 redova može biti brža bez index-a.

---

# 32. COMPOSITE INDEX

Proveri column order prema query predicates/order-u.

---

# 33. INDEX OVERLOAD

Previše index-a povećava:

- write latency
- storage
- maintenance

---

# 34. SORT

Large sort bez useful index-a može biti skup.

---

# 35. GROUP BY / AGGREGATION

Report endpoint može raditi expensive aggregate svaki put.

Proveri frequency i dataset.

---

# 36. COUNT

`COUNT(*)` preko velikog filtered dataset-a može biti skup kod pagination API-ja.

Ne pretpostavljaj bez DB evidence-a.

---

# 37. EXACT TOTAL

Pitaj da li UI stvarno zahteva tačan total za svaki request.

Ako ne, možda je expensive work nepotreban.

---

# 38. PAGINATION

Unbounded list endpoint je performance risk.

---

# 39. OFFSET

Large OFFSET može postati skup.

---

# 40. KEYSET

Može pomoći pri velikom dataset-u i stabilnom sort-u.

Ne preporučuj ako dataset mali.

---

# 41. QUERY DUPLIKACIJA

Isti request može izvršiti isti DB query više puta kroz različite layers.

---

# 42. REQUEST-SCOPED MEMOIZATION

Može imati smisla samo ako repeated query zaista postoji.

---

# 43. CONNECTION POOL

Utvrdi:

- min/max
- timeout
- instance count
- DB connection limit

---

# 44. POOL SATURATION

Ako request čeka connection duže nego query traje:

pool je bottleneck ili downstream je spor.

---

# 45. POOL TOO LARGE

Veći pool nije automatski bolji.

Može preopteretiti DB.

---

# 46. MULTI-INSTANCE POOL

Izračunaj:

```text
instances × max pool
```

i uporedi sa DB capacity ako je poznata.

---

# 47. SERVERLESS CONNECTION STORM

Autoscaling može otvoriti mnogo DB connections.

---

# 48. CONNECTION PROXY

Ako postoji PgBouncer/RDS Proxy/etc, uzmi ga u obzir.

---

# 49. LONG TRANSACTION

Duga transaction može:

- držati locks
- povećati contention
- blokirati vacuum/version cleanup

prema DB-u.

---

# 50. NETWORK INSIDE TRANSACTION

High-signal problem.

---

# 51. LOCK CONTENTION

Traži hot rows/resources.

Primer:

```text
all requests update same counter row
```

---

# 52. HOT ROW

Jedna tabela može skalirati dobro, ali jedna centralna row postati serialization point.

---

# 53. SEQUENCE / COUNTER

Global counter može biti contention hotspot.

---

# 54. DATABASE WRITE AMPLIFICATION

Jedna logical mutation može pokrenuti:

- many indexes
- triggers
- audit rows
- cascades

---

# 55. TRIGGERS

Ako DB triggers postoje, uključi ih u query latency analysis.

---

# 56. CACHE

Pre nego što preporučiš cache pitaj:

> Koji konkretan expensive read se ponavlja?

---

# 57. CACHE HIT RATE

Ako nije mereno:

**CACHE HIT RATE: NOT MEASURED**

---

# 58. LOW HIT RATE

Cache sa 5% hit rate-a može samo dodavati complexity.

---

# 59. CACHE MISS COST

Miss može biti skuplji zbog:

```text
cache lookup
↓
DB
↓
cache write
```

---

# 60. CACHE KEY

Pravilno keying utiče i na correctness i performance.

---

# 61. CACHE STAMPEDE

Popular key expire:

```text
1000 requests
↓
1000 DB queries
```

---

# 62. REQUEST COALESCING

Može biti kandidat za hot cache misses.

Ne uvodi bez evidence-a.

---

# 63. TTL

Prekratak TTL smanjuje hit rate.

Predug povećava stale risk.

Ne optimizuj samo performance bez correctness-a.

---

# 64. MEMORY CACHE

Per-instance cache ne deli podatke kroz replicas.

To može biti potpuno u redu.

---

# 65. REDIS

Ne uvodi Redis samo zato što backend treba "da bude brži".

---

# 66. CDN

Static/public cacheable responses mogu se skinuti sa backend-a.

Ali private/personalized data traži pažljiv cache model.

---

# 67. SERIALIZATION

Veliki response može trošiti značajan CPU.

---

# 68. JSON SERIALIZATION

Proveri:

- response size
- nested objects
- duplicate data
- serializer performance

---

# 69. LARGE JSON

Primer:

```text
50 MB JSON
```

nije samo network problem.

Može trošiti:

- DB
- memory
- CPU
- GC

---

# 70. RESPONSE COMPRESSION

Compression smanjuje bandwidth, ali troši CPU.

Proveri ko je radi:

- app
- proxy
- CDN

Ne kompresuj dvaput.

---

# 71. COMPRESSION LEVEL

Maksimalna kompresija nije nužno najbolji tradeoff.

---

# 72. BINARY FORMATS

Ne prebacuj REST JSON na Protobuf samo radi teorijske brzine bez realnog bottleneck-a.

---

# 73. RESPONSE SIZE

Meri:

- average
- P95
- max

ako podaci postoje.

---

# 74. REQUEST SIZE

Large payload parsing takođe može biti CPU/memory hotspot.

---

# 75. STREAMING

Za velike response/file:

proveri da li backend bufferuje ceo sadržaj pre slanja.

---

# 76. FILE DOWNLOAD

Preferiraj streaming/presigned/object storage path gde architecture to opravdava.

---

# 77. FILE UPLOAD

Large upload ne treba nužno ceo u RAM.

---

# 78. MULTIPART MEMORY

Proveri framework defaults.

---

# 79. TEMP DISK

Streaming na disk smanjuje memory, ali uvodi disk capacity/I/O bottleneck.

---

# 80. OBJECT STORAGE PROXY

Ako backend samo proxy-uje gigabyte file iz object storage-a:

pitanje je da li direktan presigned transfer ima smisla.

---

# 81. EXTERNAL API LATENCY

Za svaki critical downstream:

napravi:

| Dependency | Calls/request | Latency | Timeout | Parallel |
|---|---:|---:|---:|---|

---

# 82. SEQUENTIAL CALLS

Scenario:

```text
A 200 ms
↓
B 300 ms
↓
C 400 ms
```

total minimum približno 900 ms.

Ako su nezavisni, možda se mogu paralelizovati.

---

# 83. PARALLEL CALLS

Ali parallelization povećava:

- connection usage
- downstream load

---

# 84. FAN-OUT

Endpoint koji zove 50 downstream resource-a ima inherentni tail latency problem.

---

# 85. TAIL AMPLIFICATION

Kod fan-out-a request kasni koliko i najsporiji required dependency.

---

# 86. BATCH API

Ako upstream podržava batch, može smanjiti round trips.

---

# 87. CONNECTION REUSE

HTTP client treba da koristi connection pooling/keep-alive gde library to podržava.

---

# 88. NEW CLIENT PER REQUEST

Kreiranje novog HTTP client-a/connection pool-a po request-u može biti ozbiljan performance problem.

---

# 89. DNS

Ne optimizuj DNS bez metric-a.

Ali repeated fresh connections mogu povećati DNS/TLS cost.

---

# 90. TLS HANDSHAKE

Connection reuse smanjuje handshake overhead.

---

# 91. TIMEOUT

Predug timeout veže resource capacity tokom outage-a.

---

# 92. RETRIES

Retries povećavaju load.

---

# 93. RETRY STORM

Dependency usporava:

```text
requests timeout
↓
all retry
↓
dependency receives još više load-a
↓
becomes slower
```

---

# 94. NESTED RETRIES

Posebno proveri multiplicative load.

---

# 95. CIRCUIT BREAKER

Može zaštititi capacity u određenim outage scenarijima.

Ne uvodi bez actual dependency failure problem-a.

---

# 96. QUEUE PERFORMANCE

Mapiraj:

- enqueue rate
- process rate
- concurrency
- backlog
- job latency

---

# 97. LITTLE'S LAW MENTAL MODEL

Ako producer stalno pravi više poslova nego consumer može obraditi:

backlog raste bez granice.

---

# 98. QUEUE DEPTH

Ako nije dostupna:

**QUEUE DEPTH: NOT MEASURED**

---

# 99. OLDEST JOB AGE

Često korisnija metrika od same queue count.

---

# 100. WORKER CONCURRENCY

Više worker-a nije automatski bolje.

Downstream može biti bottleneck.

---

# 101. JOB BATCHING

Mnogi mali jobs mogu imati veliki per-job overhead.

---

# 102. HUGE JOB

Jedan posao od 1h smanjuje failure isolation.

Batch/chunk može pomoći.

---

# 103. FAIRNESS

Jedna vrsta heavy job-a ne treba da izgladni latency-sensitive poslove ako dele isti worker pool.

---

# 104. PRIORITY QUEUE

Može imati smisla samo ako business ima realne prioritete.

---

# 105. CRON PERFORMANCE

Periodični job može napraviti veliki spike svakog punog sata.

---

# 106. THUNDERING HERD CRON

Ako sve instance pokrenu isti cron:

load se multiplicira.

---

# 107. SCHEDULING SPREAD

Jitter/spread može smanjiti periodične spike-ove.

---

# 108. MEMORY

Pronađi memory profile ako postoji.

Traži:

- request buffering
- caches
- huge arrays
- retained objects
- queue payload
- response construction

---

# 109. MEMORY LEAK

Backend leak znači da RSS/heap raste kroz vreme bez vraćanja očekivanom steady state-u.

---

# 110. HIGH MEMORY NIJE LEAK

Cache/runtime heap može legitimno ostati visok.

Potrebna je growth/retention analiza.

---

# 111. OOM

Mapiraj worst-case input/request/job.

---

# 112. LARGE ARRAY

Pattern:

```text
SELECT millions rows
↓
map()
↓
JSON.stringify()
```

može napraviti više kopija podataka u memory-ju.

---

# 113. STREAM / ITERATOR

Može pomoći za huge datasets.

Ne komplikuje male response-e.

---

# 114. GC

Visoka allocation rate može izazvati GC latency.

---

# 115. OBJECT CHURN

Ne mikro-optimizuj obične object allocations bez profiler evidence-a.

---

# 116. BUFFER COPYING

Large file/data pipeline može praviti nepotrebne kopije.

---

# 117. CACHE MEMORY LIMIT

In-memory cache mora imati bound ako key space može rasti neograničeno.

---

# 118. USER-SCOPED CACHE LEAK

Cache entry po user-u bez eviction-a raste sa brojem korisnika.

---

# 119. LOG MEMORY

Async logging buffer može rasti ako sink ne stiže.

---

# 120. LOGGING PERFORMANCE

High-frequency debug logging može biti ozbiljan overhead.

---

# 121. SYNCHRONOUS LOGGING

Disk/network logging na request hot path-u može povećati latency.

---

# 122. HUGE LOG PAYLOAD

Serializacija celog request/response-a troši CPU i I/O.

---

# 123. METRICS OVERHEAD

High-cardinality metrics mogu opteretiti telemetry system.

---

# 124. TRACING

100% detailed tracing može imati cost.

Proceni sampling prema potrebi.

---

# 125. MIDDLEWARE

Svaki request može prolaziti kroz mnogo middleware-a.

Ali ne optimizuj par jeftinih funkcija bez evidence-a.

---

# 126. AUTH

Token verification može biti hotspot kod ekstremnog throughput-a.

Proveri:

- crypto
- remote auth lookup
- cache

---

# 127. AUTH DB LOOKUP

Ako svaki request radi DB query za user/session:

može biti značajan.

Ali možda je correctness requirement.

---

# 128. JWT

Stateless validation smanjuje lookup, ali menja revocation semantics.

Ne preporučuj samo radi speed-a.

---

# 129. PERMISSION CHECK

N+1 permission lookup može biti performance issue.

---

# 130. TENANT CONFIG

Ako se učitava iz DB-a na svaki request, proveri frequency/cache.

---

# 131. FEATURE FLAGS

Remote flag lookup po request-u može dodati latency.

---

# 132. TEMPLATE RENDERING

SSR/email/report generation može biti CPU-heavy.

---

# 133. PDF GENERATION

CPU/memory heavy.

Razmotri async worker ako user ne mora čekati synchronous result.

---

# 134. IMAGE PROCESSING

Isto.

---

# 135. VIDEO

Transcoding ne treba raditi na web request process-u ako traje dugo i architecture podržava async job.

---

# 136. CRYPTO

Password hashing namerno treba da bude skup.

Nemoj ga "optimizovati" tako da oslabi security.

---

# 137. PASSWORD HASH COST

Performance audit ne sme preporučiti smanjenje sigurnosnog cost factor-a samo radi latency-ja.

---

# 138. ENCRYPTION

Bulk encryption može biti CPU-heavy, ali security requirement ima prioritet.

---

# 139. REGEX

Catastrophic backtracking može biti performance i security problem.

Traži samo kod user-controlled input + risky pattern.

---

# 140. STRING PROCESSING

Huge parsing/formatting loops mogu biti hotspot.

---

# 141. DATA TRANSFORMATION

Više puta:

```text
DB row
↓
ORM entity
↓
domain
↓
DTO
↓
JSON intermediate
```

može biti overhead na huge datasets.

Ne ruši layering radi mikro-optimizacije bez metric-a.

---

# 142. API GATEWAY

Ako gateway radi:

- auth
- transform
- compression
- rate limit

uključi njegove metrike u latency budget.

---

# 143. REVERSE PROXY BUFFERING

Može uticati na streaming response.

---

# 144. CDN MISS

Origin latency se vidi tek na cache miss-u.

Razdvoji:

- hit latency
- miss latency

---

# 145. SERVERLESS COLD START

Ako koristi functions:

meri cold vs warm.

---

# 146. BUNDLE/INIT SIZE

Heavy module imports mogu povećati cold start.

---

# 147. EAGER INIT

DB client, SDK, large config parsing pri startup-u.

---

# 148. LAZY INIT

Može premestiti cost na prvi request.

Dokumentuj tradeoff.

---

# 149. CONTAINER STARTUP

Kubernetes scaling/restart brzina može biti bitna za burst traffic.

---

# 150. AUTOSCALING

Proveri trigger:

- CPU
- concurrency
- custom metric

Ako scaling kasni iza burst-a, latency može skočiti.

---

# 151. AUTOSCALING NIJE MAGIJA

DB/external API možda ne skaliraju zajedno sa backend instancama.

---

# 152. SHARED BOTTLENECK

Dodavanje app replicas ne pomaže ako DB CPU već 100%.

---

# 153. HORIZONTAL SCALING

Pronađi state koji sprečava scaling:

- in-memory sessions
- local files
- locks
- local queues

---

# 154. STICKY SESSION

Može biti validna, ali utiče na load balancing i failure recovery.

---

# 155. VERTICAL SCALING

Može biti najjednostavnije rešenje za određeni workload.

Ne odbacuj samo zato što nije "cloud-native".

---

# 156. RATE LIMIT / LOAD SHEDDING

Kada je sistem na capacity granici:

bolje je kontrolisano odbiti deo load-a nego dozvoliti total collapse.

---

# 157. QUEUE ADMISSION

Ne prihvataj beskonačno work ako nema kapaciteta da se obradi.

---

# 158. BACKPRESSURE

Producer treba imati signal/limit kada consumer zaostaje.

---

# 159. BOUNDED QUEUE

Može zaštititi memory, ali failure semantics moraju biti jasne.

---

# 160. LOAD TEST

Ako postoje testovi, analiziraj:

- workload model
- concurrency
- duration
- data realism
- think time
- ramp

---

# 161. 1-SECOND BENCHMARK

Nije dovoljan za:

- memory leaks
- pool saturation
- cache behavior
- thermal/resource steady state

---

# 162. SOAK TEST

Dug test može otkriti:

- memory growth
- connection leak
- queue drift

---

# 163. SPIKE TEST

Naglo povećanje traffic-a.

---

# 164. STRESS TEST

Traži capacity ceiling.

---

# 165. BREAKPOINT

Dobro je znati:

> Kada sistem počinje ozbiljno da degradira?

---

# 166. PERFORMANCE CLIFF

Mnogi sistemi rade dobro do određene concurrency granice, pa naglo propadaju zbog:

- pool
- locks
- GC
- downstream saturation

---

# 167. REALISTIC DATA

DB sa 100 redova nije reprezentativna ako production ima 10 miliona.

---

# 168. DATA DISTRIBUTION

Query performance može zavisiti od cardinality/skew-a.

---

# 169. HOT TENANT

Jedan veliki tenant može imati potpuno drugačije performance karakteristike.

---

# 170. MULTI-TENANT FAIRNESS

Heavy tenant ne treba da obori sve druge ako product zahteva isolation.

---

# 171. NOISY NEIGHBOR

Relevantno za:

- queue
- DB
- API quotas

---

# 172. PER-TENANT LIMITS

Može biti capacity zaštita, ali je business/product odluka.

---

# 173. LOAD GENERATOR BOTTLENECK

U load testu proveri da generator nije bottleneck.

---

# 174. NETWORK LOCATION

Test iz istog datacenter-a ne meri user internet latency.

Razlikuj:

```text
server processing latency
```

od:

```text
end-to-end user latency
```

---

# 175. TTFB

Ako korisnički web experience zavisi od TTFB-a:

razloži backend vs network.

---

# 176. P95/P99

Tail latency je posebno bitna za interactive requests.

---

# 177. OUTLIERS

Nemoj izbrisati sve outlier-e kao "noise".

Možda predstavljaju:

- cold start
- lock
- GC
- cache miss

---

# 178. COORDINATED OMISSION

Ako koristi benchmark tooling, proveri da li metodologija skriva latency tokom overload-a.

Ne ulazi u teoriju ako alat nije poznat.

---

# 179. WARMUP

JIT/runtime/cache može menjati prve rezultate.

---

# 180. DEBUG MODE

Benchmark mora koristiti production-like build/config.

---

# 181. PROFILER OVERHEAD

Profiler sam može usporiti process.

---

# 182. PRODUCTION SAMPLE

Ako bezbedno postoji continuous profiler/tracing, production sample može biti najvredniji evidence.

---

# 183. COST

Performance i cost su često povezani.

Mapiraj:

- DB queries
- egress
- compute
- cache
- queue

samo gde je business relevantno.

---

# 184. OVERPROVISIONING

Brži sistem sa 10x infrastrukturom možda nije optimalan.

---

# 185. COST PER REQUEST

Ako metrike postoje:

koristan signal.

---

# 186. CACHE COST

Redis/CDN takođe koštaju.

Ne dodaj ih bez ROI-a.

---

# 187. DATABASE READ REPLICA

Može povećati read capacity.

Ali replica lag može narušiti correctness.

---

# 188. SHARDING

Ne preporučuj bez jasnog single-DB capacity problema.

---

# 189. PARTITIONING

Može biti potrebno za ogromne time-series/history tabele.

---

# 190. ARCHIVAL

Stari data možda može izaći iz hot operational DB-a.

Ali product/query requirements odlučuju.

---

# 191. MATERIALIZED VIEW

Može ubrzati expensive aggregate.

Ali uvodi freshness/rebuild semantics.

---

# 192. PRECOMPUTATION

Useful kada isti expensive rezultat treba mnogo puta.

---

# 193. ASYNC GENERATION

Reports/exporti mogu biti precomputed ili queued.

---

# 194. PERFORMANCE VS FRESHNESS

Brže cache/precomputed data može biti starije.

Dokumentuj tradeoff.

---

# 195. PERFORMANCE VS CONSISTENCY

Replica/cache/eventual consistency ne sme slučajno pokvariti critical business logic.

---

# 196. PERFORMANCE VS SECURITY

Ne uklanjaj:

- auth checks
- encryption
- password hashing
- validation

samo radi speed-a.

---

# 197. PERFORMANCE VS RELIABILITY

Ne povećavaj concurrency toliko da retry/failure storm postane verovatniji.

---

# 198. PERFORMANCE VS COMPLEXITY

100 ms improvement možda ne opravdava distributed cache/event bus complexity ako endpoint nije critical.

---

# 199. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Endpoint/Job:
Service:
File/Class:
Function:
Resource:

Workload:
Concurrency:
Dataset:
Environment:

Problem:

Evidence:

Hot Path:

T0:
T1:
T2:
T3:

Measured latency:
P50:
P95:
P99:

If unavailable:
NOT MEASURED

Resource utilization:

Bottleneck:

Scaling behavior:

User impact:

Capacity impact:

Cost impact:

Root cause:

Recommended remediation:

Expected benefit:
HIGH / MEDIUM / LOW / NOT MEASURED

Benchmark / load test:

Verification after fix:

Complexity:
XS / S / M / L / XL
```

---

# 200. SEVERITY

Koristi:

## P0 - CRITICAL

Samo ako performance problem direktno izaziva:

- sistemski outage sa critical posledicama
- catastrophic resource exhaustion
- critical data/security failure

## P1 - HIGH

- critical endpoint redovno prelazi prihvatljiv latency/capacity cilj
- load izaziva system collapse
- DB/connection/resource exhaustion obara servis
- queue backlog može rasti bez granice u normalnom production workload-u

## P2 - MEDIUM

- značajan latency/throughput bottleneck
- važan endpoint ima dokazano nepotreban expensive path

## P3 - LOW

- manji lokalni hotspot sa ograničenim impact-om

## P4 - IMPROVEMENT

- optimizacija bez potvrđenog user/capacity problema

---

# 201. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

production trace/query plan/load test direktno potvrđuje problem.

MEDIUM:

jak code/config evidence, ali workload nije potpuno potvrđen.

LOW:

zavisi od nepoznatog traffic-a/dataset-a.

---

# 202. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 203. PERFORMANCE EVIDENCE

Dodaj:

```text
PRODUCTION METRIC
PRODUCTION TRACE
LOAD TEST
PROFILER
QUERY PLAN
BENCHMARK
STATIC CODE
NONE
```

---

# 204. FALSE-POSITIVE PREVENCIJA

Pre P1/P2 finding-a proveri:

1. frequency
2. production/load-test evidence
3. dataset size
4. concurrency
5. cache behavior
6. DB plan
7. downstream latency
8. release config
9. infrastructure topology
10. current resource utilization

---

# 205. NE OPTIMIZUJ O(N) SAMO ZATO ŠTO JE O(N)

Ako je N <= 20:

možda nikada nije relevantno.

---

# 206. NE DODAJ CACHE AUTOMATSKI

Cache uvodi:

- invalidation
- stale state
- memory
- infrastructure

---

# 207. NE DODAJ INDEX NA SVAKU KOLONU

Potrebna je query-driven analiza.

---

# 208. NE PARALELIZUJ SVE

Parallel work može samo preopteretiti DB/upstream.

---

# 209. NE POVEĆAVAJ POOL NASLEPO

Veći DB/thread pool može samo premestiti bottleneck.

---

# 210. NE REWRITE-UJ U DRUGI JEZIK

Promena Node -> Go/Rust/Java nije performance fix bez dokazivog runtime bottleneck-a koji jezik zaista uzrokuje.

---

# 211. NE UVODI MICROSERVICES ZBOG PERFORMANSI

Network boundaries često povećavaju latency.

---

# 212. NE UVODI REDIS ZBOG PERFORMANSI

Prvo dokaži repeated expensive reads.

---

# 213. NE ŽRTVUJ CORRECTNESS

Stale balance od 5 minuta nije prihvatljiv samo zato što je mnogo brži ako domain zahteva current balance.

---

# 214. NE MENJAJ KOD

Tokom audita:

- ne dodaje cache
- ne dodaje index
- ne menja pool
- ne menja concurrency
- ne uvodi queue
- ne refaktoriše query

Prvo završi audit.

---

# 215. OUTPUT - BACKEND_PERFORMANCE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- stack
- topology
- performance evidence
- critical bottlenecks
- capacity risks

## 2. Performance Measurement Coverage

## 3. Critical Endpoint Map

## 4. Latency Breakdown

## 5. CPU Audit

## 6. Event Loop / Thread Audit

## 7. Database Performance

## 8. Query / Index Audit

## 9. Connection Pool Audit

## 10. Transaction / Lock Contention

## 11. Cache Audit

## 12. Serialization / Payload Audit

## 13. File / Streaming Audit

## 14. External Dependency Latency

## 15. Retry / Timeout Load Amplification

## 16. Queue / Worker Performance

## 17. Memory / GC Audit

## 18. Logging / Observability Overhead

## 19. Serverless / Startup Performance

## 20. Horizontal Scaling Audit

## 21. Backpressure / Load Shedding

## 22. Load Test Coverage

## 23. Cost / Efficiency

## 24. Findings Summary

| ID | Severity | Component | Bottleneck | Evidence | Confidence | Status |
|---|---|---|---|---|---|---|

## 25. P1 Findings

## 26. P2 Findings

## 27. P3 Findings

## 28. P4 Improvements

## 29. Things Done Well

## 30. Unknown / Not Measured

## 31. Optimization Roadmap

---

# 216. ENDPOINT PERFORMANCE MATRIX

| Endpoint | RPS | P50 | P95 | P99 | DB calls | External calls |
|---|---:|---:|---:|---:|---:|---:|

Ako nema podataka:

**NOT MEASURED**

---

# 217. DATABASE MATRIX

| Query | Calls/request | Rows | Plan | Duration | Risk |
|---|---:|---:|---|---:|---|

---

# 218. RESOURCE MATRIX

| Resource | Limit | Typical | Peak | Saturation risk |
|---|---:|---:|---:|---|

Za:

- CPU
- memory
- DB pool
- worker pool
- queue
- sockets

---

# 219. DEPENDENCY MATRIX

| Dependency | Calls | P95 | Timeout | Retry | Critical |
|---|---:|---:|---:|---|---|

---

# 220. CACHE MATRIX

| Cache | Hit rate | TTL | Miss cost | Size | Risk |
|---|---:|---:|---:|---:|---|

---

# 221. QUEUE MATRIX

| Queue | Produce rate | Consume rate | Depth | Oldest age | Risk |
|---|---:|---:|---:|---:|---|

---

# 222. SECOND PASS - TOP LATENCY ATTACK

Uzmi najsporijih nekoliko critical endpoint-a prema dostupnim podacima.

Za svaki razloži do najsporijeg dependency/query/cpu segmenta.

---

# 223. SECOND PASS - P99 ATTACK

Ne gledaj samo median.

Pitaj:

> Šta se razlikuje u najsporijih 1% request-a?

Mogući uzroci:

- cache miss
- lock
- cold start
- GC
- slow downstream
- DB plan

---

# 224. SECOND PASS - 10X TRAFFIC

Mentalno ili kroz load test povećaj:

```text
current traffic × 10
```

Pitaj šta prvo saturira.

---

# 225. SECOND PASS - 10X DATA

Za critical query:

```text
current rows × 10
```

Proveri plan i complexity.

---

# 226. SECOND PASS - CACHE MISS STORM

Pretpostavi da cache odjednom postane prazan.

Može li origin/DB preživeti?

---

# 227. SECOND PASS - DOWNSTREAM SLOW

External API postane 10x sporiji.

Pitaj:

- active requests
- connection pool
- retries
- memory

---

# 228. SECOND PASS - DB SLOW

DB query latency skoči sa:

```text
20 ms -> 2 s
```

Pitaj kako to utiče na:

- pool
- backend concurrency
- retries
- queue

---

# 229. SECOND PASS - POOL SATURATION

Pretpostavi da su sve DB connections zauzete.

Pitaj:

> Koliko dugo request čeka i šta se dalje dešava?

---

# 230. SECOND PASS - WORKER BACKLOG

Producer rate > consumer rate tokom jednog sata.

Izračunaj backlog ako imaš realne brojeve.

---

# 231. SECOND PASS - PROCESS MEMORY

Ponovi workload dugo vremena.

Pitaj:

- heap stabilizuje
- RSS raste
- cache raste
- buffers ostaju

---

# 232. SECOND PASS - LARGE REQUEST

Pošalji maksimalno dozvoljen payload/file.

Pitaj gde nastaju memory copies.

---

# 233. SECOND PASS - LARGE RESPONSE

Najveći realan list/export.

Pitaj:

- DB memory
- app memory
- serialization
- compression
- network

---

# 234. SECOND PASS - RETRY STORM

Simuliraj dependency outage sa automatic retries.

Pitaj koliko stvarnih downstream attempts jedan originalni request generiše.

---

# 235. SECOND PASS - COLD START

Ako serverless/container autoscaling:

meri prvi request nove instance odvojeno od warm.

---

# 236. SECOND PASS - LOW CACHE HIT

Smanji hit rate.

Pitaj da li DB capacity i dalje drži production traffic.

---

# 237. SECOND PASS - HOT TENANT

Jedan tenant ima 100x više podataka od proseka.

Pitaj da li query/response i dalje rade prihvatljivo.

---

# 238. SECOND PASS - CRON SPIKE

Pokreni scheduled jobs istovremeno sa peak user traffic-om.

Traži shared DB/CPU contention.

---

# 239. SECOND PASS - FAILURE UNDER LOAD

Na visokom load-u obori downstream servis.

Pitaj da li sistem:

- gracefully degrades
- ili ulazi u cascading collapse

---

# 240. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- optimization nije počela pre hotspot evidence-a
- production topology je uzeta u obzir
- P50/P95/P99 su odvojeni gde postoje
- average nije korišćen kao jedina latency metrika
- critical endpoint-i imaju hot-path mapu
- DB query count je analiziran, ne samo pojedinačna brzina
- N+1 je potvrđen stvarnim execution flow-om
- index recommendation ima query plan ili jaku query logiku
- connection pool je posmatran u odnosu na broj instanci
- long transactions i lock contention su provereni
- cache recommendation ima očekivani hit rate/miss cost
- cache correctness nije žrtvovan radi speed-a
- external calls imaju sequential/parallel/fan-out analizu
- retries su analizirani kao load multiplier
- queue producer/consumer rate je analiziran
- memory growth je odvojen od legitimno visoke memorije
- debug/profile measurements nisu predstavljena kao production performance
- load test koristi realističan dataset/workload koliko je moguće
- horizontal scaling ne skriva shared DB/downstream bottleneck
- performance fix ne slabi security/correctness
- mikro-optimizacije su P4 ili izostavljene

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte Redis, indekse, pagination i horizontal scaling.

To nije backend performance audit.

Tražim probleme poput:

```text
GET /dashboard
↓
loads 100 projects
↓
for each project executes 3 additional queries
↓
301 SQL queries per request
↓
P95 grows sharply with user project count
```

ili:

```text
backend has 20 replicas
↓
each has DB pool max 30
↓
possible DB connections = 600
↓
database max connections = 200
↓
traffic spike
↓
connection storm / timeouts
```

ili:

```text
external API normally 200 ms
↓
outage makes calls last 10 s
↓
backend timeout = 30 s
↓
each incoming request holds resources
↓
automatic retry doubles calls
↓
capacity collapses
```

ili:

```text
cache key expires
↓
500 concurrent requests miss
↓
all independently execute same expensive DB aggregation
↓
database CPU spikes
↓
latency rises across unrelated endpoints
```

ili:

```text
export endpoint
↓
loads 2 million rows into memory
↓
maps to DTO list
↓
serializes full JSON/CSV in memory
↓
multiple copies coexist
↓
process OOM
```

ili:

```text
Node.js request handler
↓
synchronous image compression
↓
CPU busy for 700 ms
↓
event loop blocked
↓
all other requests on instance wait
```

ili:

```text
queue producer = 100 jobs/sec
worker capacity = 80 jobs/sec
↓
backlog grows by 20/sec
↓
72,000 additional jobs after one hour
↓
oldest job latency continuously increases
```

To su backend performance problemi koje treba da pronađeš.

Razmišljaj kroz:

- latency budget
- frequency
- concurrency
- dataset size
- resource limits
- DB plans
- downstream latency
- queue rates
- cache hit/miss
- tail latency
- saturation

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Gde je stvarni bottleneck?

> Koliko često se execution path koristi?

> Koliki je dataset?

> Koji resource se saturira?

> Šta se događa sa P95/P99 pod većim load-om?

> Da li fix ubrzava baš bottleneck ili samo okolni kod?

> Kako ćemo izmeriti rezultat pre i posle izmene?

Ako nije izmereno:

**NOT MEASURED.**

Ako postoji jak static signal, ali bez benchmarka:

**CODE-LEVEL BOTTLENECK.**

Ako je samo moguća optimizacija:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih hot path bottleneck-a nego napisati 100 mikro-optimizacija.

Cilj je dobiti forenzički precizan backend performance audit koji se može direktno pretvoriti u:

- profiler investigation
- query-plan analysis
- load test
- benchmark
- capacity model
- narrow optimization
- pre/post measurement
- production performance verification
