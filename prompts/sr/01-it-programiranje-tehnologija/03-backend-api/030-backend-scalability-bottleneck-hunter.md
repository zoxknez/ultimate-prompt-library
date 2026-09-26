---
id: UPL-IT-030
number: 30
slug: backend-scalability-bottleneck-hunter
title: Backend Scalability Bottleneck Hunter
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# BACKEND SCALABILITY BOTTLENECK HUNTER

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu svih mesta na kojima backend prestaje linearno ili predvidljivo da skalira sa rastom:

- saobraćaja
- broja korisnika
- broja tenant-a
- količine podataka
- concurrency-ja
- background poslova
- fajlova
- external API poziva
- deployment instanci

Glavni cilj:

> Pronaći stvarna mesta na kojima sistem dostiže hard ili soft capacity granicu, ulazi u contention, queue growth, connection exhaustion, hot-key/hot-row problem, serial execution bottleneck ili cascading failure, i dokazati koji resurs prvi puca kako workload raste.

Ovo nije:

- generički "dodajte još servera"
- automatski horizontal scaling
- automatska migracija na Kubernetes
- automatski prelazak na microservices
- automatski sharding
- preporuka da se sve stavi u Redis
- običan performance audit
- nagađanje šta će se desiti na milion korisnika bez workload modela

Fokus je na pitanju:

> Šta prvo prestaje da skalira kada workload poraste?

Prioritet:

**hard shared bottlenecks > resource exhaustion > serial execution points > data growth problems > cross-tenant contention > queue growth > scale-out blockers > cost explosion > theoretical future limits**

Bolje je pronaći 5 stvarnih scalability cliffs nego napisati 100 generičkih cloud preporuka.

---

# 1. UTVRDI STVARNU PRODUCTION TOPOLOGIJU

Mapiraj:

```text
Clients
↓
CDN / Edge
↓
Load balancer
↓
Backend instances
↓
Cache
↓
Database
↓
Queue / workers
↓
External services
↓
Object storage
```

Zabeleži:

- broj backend instanci
- autoscaling model
- DB tip
- DB limits
- cache
- queue
- worker count
- serverless limits
- regions
- tenancy model

Ako nije poznato:

**PRODUCTION TOPOLOGY: NOT VERIFIED**

---

# 2. UTVRDI WORKLOAD

Pronađi ili proceni samo iz dostupnih dokaza:

- requests/sec
- concurrent users
- active sessions
- records
- tenants
- jobs/sec
- uploads/day
- exports/day
- external API calls

Ako brojke nisu dostupne:

**CURRENT WORKLOAD: NOT MEASURED**

Ne izmišljaj production traffic.

---

# 3. UTVRDI GROWTH DIMENZIJE

Sistem može skalirati po:

```text
requests
users
tenants
data volume
file volume
jobs
connections
regions
```

Svaka može imati drugačiji bottleneck.

---

# 4. NAPRAVI CAPACITY MAPU

Za svaki ključni resurs:

| Resource | Current usage | Limit | Scaling model | Shared |
|---|---:|---:|---|---|

Za:

- CPU
- memory
- DB connections
- DB CPU
- storage
- IOPS
- Redis
- queue
- workers
- external quota
- bandwidth

---

# 5. SHARED BOTTLENECK

Najvažnije pitanje:

> Koji resurs ostaje shared čak i kada dodamo još backend instanci?

Primer:

```text
backend replicas ↑
↓
all still use one DB
```

---

# 6. HORIZONTAL SCALE TEST

Mentalno ili stvarno:

```text
1 backend
2 backends
5 backends
10 backends
```

Pitaj šta se menja, a šta ne.

---

# 7. NON-LINEAR SCALE

Ako 2x instances daje samo 1.1x throughput:

pronađi shared bottleneck.

---

# 8. DB KAO SCALE LIMIT

Čest primer:

```text
backend instances scale
↓
DB remains single primary
↓
DB CPU / connections saturate
```

---

# 9. CONNECTION MULTIPLICATION

Izračunaj:

```text
backend instances
×
DB pool size
=
possible connections
```

Ako autoscaling nema hard cap:

izračunaj worst plausible scenario iz config-a.

---

# 10. SERVERLESS CONNECTION EXPLOSION

Posebno proveri function/serverless architecture.

---

# 11. DB POOL VS DB LIMIT

Ako:

```text
20 instances × 30 pool = 600
DB max = 200
```

scale-out može izazvati outage.

Koristi samo stvarne vrednosti.

---

# 12. CONNECTION PROXY

Ako postoji:

- PgBouncer
- RDS Proxy
- equivalent

uzmi ga u obzir.

---

# 13. DB CPU

Više app instances ne pomaže kada DB CPU saturira.

---

# 14. DB IOPS

Storage throughput može biti bottleneck i kada CPU nije.

---

# 15. LOCK CONTENTION

Sa većim concurrency-jem:

```text
more requests
↓
same hot rows
↓
more waiting
```

Throughput može stagnirati ili pasti.

---

# 16. HOT ROW

Traži:

- global counters
- central settings row
- singleton state
- inventory row
- sequence-like business row

---

# 17. HOT TENANT

Multi-tenant tabela može imati jedan tenant sa disproporcionalnim volume-om.

---

# 18. HOT PARTITION

Ako DB/storage koristi partitioning:

jedan key range može primati većinu traffic-a.

---

# 19. MONOTONIC KEY

Timestamp/sequential ID ponekad može koncentrisati writes u jednom storage partition-u.

Prijavi samo za konkretnu tehnologiju gde je relevantno.

---

# 20. READ SCALING

Mapiraj read/write ratio.

---

# 21. READ REPLICA

Može povećati read capacity.

Ali proveri:

- replica lag
- consistency
- connection count

---

# 22. READ-AFTER-WRITE

Critical flow možda ne sme ići na lagging replica.

---

# 23. CACHE

Pitaj:

> Da li cache rasterećuje stvarni shared bottleneck?

Ako ne:

nije scalability rešenje.

---

# 24. CACHE HIT RATE

Ako nije mereno:

**CACHE HIT RATE: NOT MEASURED**

---

# 25. CACHE MISSES POD SCALE-OM

DB mora preživeti cold cache ili stampede.

---

# 26. CACHE STAMPEDE

Scale increases impact:

```text
1 cache miss → 1 query
```

postaje:

```text
10,000 simultaneous misses → 10,000 queries
```

---

# 27. HOT CACHE KEY

Jedan key može postati Redis/network hotspot.

---

# 28. REDIS SINGLE INSTANCE

Ako Redis predstavlja:

- session store
- limiter
- cache
- queue

na istoj instanci:

on može postati veliki shared bottleneck/failure domain.

---

# 29. REDIS MEMORY

Unbounded cache/queue keys mogu dostići max memory.

---

# 30. EVICTION

Eviction policy može promeniti application behavior.

Posebno opasno ako isti Redis drži:

- cache
- critical queue/locks

---

# 31. QUEUE SCALABILITY

Mapiraj:

```text
producer capacity
consumer capacity
```

---

# 32. PRODUCER > CONSUMER

Ako sustained:

backlog raste bez granice.

---

# 33. QUEUE PARTITIONING

Jedna queue može postati serial bottleneck.

---

# 34. SINGLE CONSUMER

Proveri da li je single worker:

- namerna ordering garancija
- slučajan bottleneck

---

# 35. GLOBAL ORDERING

Ako cela queue zahteva strict global order:

to ograničava horizontal processing.

Pitaj da li domain stvarno zahteva global ordering ili samo per-resource.

---

# 36. PER-RESOURCE ORDERING

Partitioning po resource key-u može dozvoliti paralelizam.

Ne uvodi bez potrebe.

---

# 37. QUEUE BROKER LIMIT

Pronađi:

- throughput
- connections
- message size
- storage

ako je relevantno i poznato.

---

# 38. WORKER SCALE

Više worker-a može povećati throughput samo dok downstream ima capacity.

---

# 39. WORKER → DB AMPLIFICATION

Primer:

```text
worker count × queries/job
```

---

# 40. WORKER → API AMPLIFICATION

External provider quota može postati bottleneck pre queue-a.

---

# 41. EXTERNAL QUOTA

Mapiraj:

- requests/sec
- requests/day
- concurrent operations
- bandwidth

ako provider limit postoji.

---

# 42. THIRD-PARTY SCALE CEILING

Sistem ne može skalirati iznad hard provider quota-e bez:

- higher plan
- batching
- multiple accounts gde je legitimno
- architectural change

---

# 43. RETRY AMPLIFICATION

Na velikom scale-u retry može multiplicirati traffic.

---

# 44. 1% FAILURE NA MILION REQUEST-A

Na velikom volume-u i mali failure rate može generisati ogroman retry load.

---

# 45. NESTED RETRIES

Izračunaj theoretical attempts iz realnih config-a.

---

# 46. FAN-OUT

Jedan API request može napraviti:

```text
1 request
↓
20 internal calls
↓
100 DB queries
```

---

# 47. AMPLIFICATION FACTOR

Za hot endpoint izračunaj približno:

```text
incoming request
→ DB operations
→ external operations
→ queued jobs
```

---

# 48. SUPERLINEAR COST

Ako broj operacija raste sa brojem child resources:

```text
O(users × projects)
```

traži realnu growth dimenziju.

---

# 49. N+1 POD GROWTH-OM

100 query-ja možda radi danas.

Kod 10.000 child records više neće.

---

# 50. UNBOUNDED COLLECTION

Endpoint koji vraća celu kolekciju ima workload proporcionalan data volume-u.

---

# 51. OFFSET PAGINATION

Veliki offset može sve više usporavati sa rastom tabele.

---

# 52. COUNT SCALING

Exact totals nad ogromnim filtered set-om mogu postati bottleneck.

---

# 53. SEARCH

Full text, wildcard i fuzzy search posebno analiziraj.

---

# 54. `%LIKE%`

Može degradirati sa velikim dataset-om, zavisno od DB/index modela.

---

# 55. SORT

Sort velikog unindexed rezultata može rasti skupo.

---

# 56. AGGREGATION

Dashboard koji svaki request računa sve istorijske podatke možda neće skalirati.

---

# 57. REPORTING ON OLTP

Heavy analytics query na istoj operational DB može ugroziti transactional workload.

---

# 58. ANALYTICS SEPARATION

Ne uvodi data warehouse bez dokaza.

Ali označi ako report queries već blokiraju OLTP.

---

# 59. HISTORICAL DATA GROWTH

Tabela raste zauvek?

Mapiraj:

- events
- logs
- audit
- notifications
- jobs

---

# 60. RETENTION

Neke tabele možda ne moraju čuvati sve zauvek.

Ali business/legal requirements imaju prioritet.

---

# 61. ARCHIVAL

Cold data može izaći iz hot path-a ako product dozvoljava.

---

# 62. PARTITIONING

Relevantno za veoma velike/time-series tabele.

Ne preporučuj prerano.

---

# 63. SHARDING

Visok complexity.

Pre preporuke dokaži da:

- vertical scaling
- query/index optimization
- caching
- read replicas
- partitioning

nisu dovoljne ili odgovarajuće.

---

# 64. SHARD KEY

Ako sistem već sharding koristi:

proveri distribution.

---

# 65. CROSS-SHARD QUERY

Može postati fan-out problem.

---

# 66. RESHARDING

Growth strategy mora uzeti u obzir buduću rebalans operaciju.

---

# 67. MULTI-TENANT DATABASE MODEL

Utvrdi:

- shared tables
- schema per tenant
- DB per tenant
- hybrid

---

# 68. TENANT COUNT SCALE

10 tenant-a i 100.000 tenant-a mogu imati drugačiji config/connection model.

---

# 69. DB PER TENANT

Može napraviti:

- connection explosion
- migration complexity

na velikom tenant count-u.

---

# 70. SHARED TABLES

Mogu napraviti:

- huge indexes
- noisy neighbor

ali su često jednostavnije.

---

# 71. TENANT-SCOPED INDEX

Proveri critical query patterns.

---

# 72. LARGE TENANT

Jedan tenant sa milion puta više records može dominirati query plan/cache.

---

# 73. FAIRNESS

Sistem može imati dovoljno ukupnog capacity-ja, ali jedan tenant zauzeti sve.

---

# 74. PER-TENANT CONCURRENCY

Može biti potreban za skupe jobs/API.

---

# 75. STORAGE

Mapiraj:

- DB storage growth
- object storage
- temp storage
- logs

---

# 76. LOCAL DISK

Horizontal scale je teži ako user files ostaju samo na lokalnoj instanci.

---

# 77. SHARED FILESYSTEM

Može biti shared bottleneck.

---

# 78. OBJECT STORAGE

Generalno bolje skalira za user files, ali request architecture i dalje može proxy-ovati sav bandwidth kroz backend.

---

# 79. BANDWIDTH

Backend može saturirati network pre CPU-a.

---

# 80. EGRESS

Large downloads mogu postati cost bottleneck.

---

# 81. PRESIGNED DELIVERY

Može rasteretiti backend ako security model dozvoljava.

---

# 82. UPLOAD SCALE

Veliki concurrent uploads mogu iscrpeti:

- sockets
- memory
- temp disk
- network

---

# 83. CONNECTIONS

Ne misli samo na DB.

Mapiraj:

- inbound HTTP
- outbound HTTP
- Redis
- queue
- WebSocket

---

# 84. FILE DESCRIPTORS

Na high concurrency sistemu mogu postati hard limit.

---

# 85. WEBSOCKET

Long-lived connection scale ima drugačiji resource model od REST-a.

---

# 86. CONNECTION COUNT

Za WebSocket/SSE utvrdi:

```text
connections per instance
```

---

# 87. PUB/SUB FAN-OUT

Jedna poruka -> milion connected clients može biti ozbiljan broadcast challenge.

---

# 88. PRESENCE

Global real-time presence može napraviti hot shared state.

---

# 89. RECONNECT STORM

Restart jedne velike fleet instance može izazvati masovni reconnect.

---

# 90. SESSION STATE

Ako session ostaje lokalno u memory-ju:

horizontal scaling zahteva:

- sticky sessions
- shared session store

ili stateless model.

---

# 91. STICKY SESSION

Može ograničiti load distribution i failover.

Ne znači automatski da je loša.

---

# 92. IN-MEMORY STATE

Pronađi sve što scale-out čini neispravnim:

- locks
- counters
- cache authority
- queue
- cron state

---

# 93. IN-PROCESS LOCK

Ne koordinira različite instances.

---

# 94. SINGLETON ASSUMPTION

Traži:

```text
"this runs once"
```

bez distributed/platform garancije.

---

# 95. CRON

Horizontal app scaling može duplirati scheduled jobs.

---

# 96. BACKGROUND SCHEDULER

Ako scheduler živi unutar web servera:

scale-out semantics moraju biti poznate.

---

# 97. LEADER ELECTION

Može biti potrebno za singleton work, ali managed scheduler često jednostavniji.

---

# 98. CENTRALIZED SERVICE

Jedan service instance može namerno biti singleton.

Pitaj da li throughput zahtevi to dozvoljavaju.

---

# 99. GLOBAL MUTEX

Najčistiji signal serial scalability ceiling-a.

---

# 100. BUSINESS SERIALIZATION

Ponekad domain zahteva serial handling određenog resource-a.

To nije bug.

Problem je kada lock scope postane veći nego business invariant zahteva.

---

# 101. COARSE LOCK

Lock cele tabele/sistema umesto jednog resource-a.

---

# 102. LOCK DURATION

External network call dok lock traje.

---

# 103. DEADLOCK UNDER SCALE

Više concurrency-ja povećava probability.

---

# 104. CPU SCALE

Ako workload CPU-bound:

više instances može skalirati do nekog shared limit-a.

---

# 105. SINGLE-THREADED CPU

Jedna Node/Python process instanca može koristiti ograničen broj CPU core-ova za certain workloads.

Ali process replication može rešiti deo problema.

Ne preporučuj rewrite jezika bez profiler dokaza.

---

# 106. GIL

Ako Python CPU-bound workload postoji:

proveri actual execution model.

Ne koristite GIL kao generički argument protiv Python-a.

---

# 107. JVM/.NET THREAD POOL

Thread starvation može postati bottleneck pri blocking I/O.

---

# 108. CPU-HEAVY TASK

Transcoding, PDF, image, crypto, AI inference:

razdvoji od latency-sensitive HTTP workload-a gde je potrebno.

---

# 109. MEMORY SCALE

Per-request memory × concurrency.

---

# 110. MEMORY MODEL

Izračunaj:

```text
memory/request × concurrent requests
```

ako imaš merljive podatke.

---

# 111. BUFFERING

Veliki request/response može eksplodirati memory pod concurrency-jem.

---

# 112. CACHE PER INSTANCE

Svaka nova instanca duplicira cache u RAM-u.

---

# 113. HUGE STATIC MODEL

Ako svaki worker učitava isti multi-GB model:

horizontal scaling može biti veoma skup.

---

# 114. STARTUP TIME

Autoscaling nije efikasan ako nova instanca treba 10 minuta da postane ready.

---

# 115. COLD START

Serverless burst možda doživi latency spike.

---

# 116. SCALE-UP LAG

Traffic može porasti brže nego autoscaler.

---

# 117. HEADROOM

Production obično treba rezervu.

Ne izmišljaj universal 30/50% threshold bez product/SLO context-a.

---

# 118. AUTOSCALING METRIC

CPU možda nije pravi signal ako bottleneck predstavlja:

- DB connection
- request concurrency
- queue age

---

# 119. SCALE ON CPU

Aplikacija može biti I/O-bound i imati nizak CPU dok latency eksplodira.

---

# 120. SCALE ON QUEUE

Za workers queue age/depth može biti relevantniji.

---

# 121. MAX INSTANCES

Ako postoji hard max:

proveri šta se dešava nakon njega.

---

# 122. MIN INSTANCES

Može smanjiti cold start, ali povećava cost.

---

# 123. REGION

Single-region deployment može imati latency/availability ograničenja.

Ali multi-region nije automatski potreban.

---

# 124. MULTI-REGION WRITE

Veoma kompleksno.

Ne preporučuj samo radi "scale".

---

# 125. GLOBAL USERS

Latency problem nije isto što i capacity problem.

CDN može rešiti static content, ali ne global transactional DB write latency.

---

# 126. DATA RESIDENCY

Može ograničiti regional architecture-u.

Ako nije poznato:

**NOT VERIFIED**

---

# 127. API RATE LIMIT

Vaš limiter može postati scalability boundary legitimnim velikim customer-ima.

---

# 128. PRODUCT TIER

Enterprise tenant može legitimno zahtevati više throughput-a.

---

# 129. BUSINESS QUOTAS

Scale architecture i pricing/product model moraju biti kompatibilni.

---

# 130. EXPENSIVE FREE FEATURE

Sistem možda tehnički može skalirati, ali cost po user-u ne.

---

# 131. COST SCALABILITY

Za workload pitaj:

> Da li infra cost raste linearno, sublinearno ili superlinearno?

---

# 132. N+1 COST

Može biti i cost scaling problem pre latency problema.

---

# 133. EXTERNAL API COST

Provider bill može rasti direktno sa usage-om.

---

# 134. STORAGE COST

Audit/log/event tables bez retention-a.

---

# 135. LOGGING SCALE

Log volume može postati:

- cost
- ingestion limit
- search bottleneck

---

# 136. HIGH-CARDINALITY METRICS

Milioni unique labels mogu ugroziti monitoring sistem.

---

# 137. TRACE VOLUME

Full tracing 100% traffic-a možda neće skalirati cost-wise.

---

# 138. SAMPLING

Ne smanjuj observability toliko da izgubiš critical errors.

---

# 139. CONTROL PLANE SCALE

Admin/list endpoints koji učitavaju sve:

- users
- tenants
- jobs

mogu postati problem tek sa velikim sistemom.

---

# 140. MIGRATIONS

Schema migration koja traje sekunde danas može trajati satima na 100x tabeli.

---

# 141. ALTER TABLE

Proceni lock/rewrite behavior za konkretnu DB verziju.

Ne nagađaj.

---

# 142. INDEX CREATION

Large index build može biti deployment scalability problem.

---

# 143. BACKFILL

Million-row backfill u request/deploy thread-u može postati neprihvatljiv.

---

# 144. ONLINE MIGRATION

Može biti potrebna tek na većem dataset-u.

---

# 145. DEPLOYMENT SCALE

Što više instances:

- rollout duration
- mixed-version period
- connection churn

rastu.

---

# 146. STARTUP STORM

50 replicas restartuju:

```text
50 × migrations?
50 × cache warmup?
50 × external registration?
```

---

# 147. CACHE WARMUP

Masovni cold start može udariti DB.

---

# 148. HEALTH CHECK STORM

Obično minor, ali expensive health endpoint može napraviti nepotreban load.

---

# 149. READINESS

Nova instanca ne treba da prima traffic pre nego što može normalno da radi.

---

# 150. DEPENDENCY INITIALIZATION

Ako startup radi skupi global fetch, scaling može biti spor.

---

# 151. SINGLE MIGRATION RUNNER

Proveri deployment model.

---

# 152. BOOTSTRAP LOCK

Ako sve instances čekaju jedan centralni lock pre starta:

može produžiti rollout.

---

# 153. API GATEWAY

Hard quotas/throughput mogu biti ceiling.

---

# 154. LOAD BALANCER

Connection/request limits ako poznati.

---

# 155. CDN ORIGIN

Cache miss flood može preopteretiti origin.

---

# 156. EXTERNAL AUTH

Ako svaki request proverava token remote auth provider-om:

external auth latency/quota može postati shared bottleneck.

---

# 157. DNS / SERVICE DISCOVERY

Obično nije prvi bottleneck, ali large service mesh može dodati overhead.

Ne fokusiraj se bez evidence-a.

---

# 158. MICROSERVICE FAN-OUT

Scale-out jednog servisa ne pomaže ako request mora kroz lanac od 8 services.

---

# 159. CHATTER

Mnogo fine-grained network calls može napraviti network/serialization overhead.

---

# 160. MICROSERVICES NISU SCALE MAGIJA

Monolith se često može horizontalno skalirati.

Ne preporučuj decomposition bez ownership/deployment/scaling razloga.

---

# 161. SERVICE-SPECIFIC SCALE

Jedna komponenta može imati potpuno drugačiji workload.

Primer:

```text
web API = I/O bound
video processor = CPU bound
```

Tu separation može biti opravdana.

---

# 162. BLAST RADIUS

Scalability nije samo throughput.

Jedan heavy workload može oboriti unrelated feature ako dele:

- process
- DB
- queue
- Redis

---

# 163. BULKHEAD

Resource isolation može biti relevantna kada je potvrđen noisy-neighbor problem.

---

# 164. RESOURCE CLASSES

Odvoji:

- latency-sensitive
- batch
- CPU-heavy
- external-cost

ako current architecture pravi contention.

---

# 165. DEGRADATION

Pitaj:

> Kako sistem ponaša kada capacity pređe limit?

---

# 166. GRACEFUL DEGRADATION

Bolje:

```text
some requests rejected quickly
```

nego:

```text
all requests timeout
```

---

# 167. LOAD SHEDDING

Može sačuvati core funkcionalnost tokom overload-a.

---

# 168. PRIORITY SHEDDING

Optional report možda može biti odbijen pre checkout/login-a.

Samo uz business requirement.

---

# 169. ADMISSION CONTROL

Ne prihvataj više expensive work nego što sistem može procesirati.

---

# 170. QUEUE NIJE BESKONAČAN BUFFER

Queue samo odlaže failure ako incoming work dugoročno prelazi capacity.

---

# 171. BACKPRESSURE

Producer mora nekako osetiti downstream saturation.

---

# 172. CASCADING FAILURE

Klasičan scenario:

```text
DB slows
↓
requests last longer
↓
more concurrent requests
↓
pool fills
↓
timeouts
↓
retries
↓
even more load
```

---

# 173. POSITIVE FEEDBACK LOOP

Traži systemske petlje koje worsening failure.

---

# 174. RETRY STORM

Jedna od najvažnijih.

---

# 175. TIMEOUTS

Predugi timeout-i povećavaju active work tokom overload-a.

---

# 176. CIRCUIT BREAKER

Može sprečiti cascade od unhealthy downstream-a.

Ne uvodi bez konkretnog dependency failure mode-a.

---

# 177. POOL QUEUES

Thread/connection pool može imati svoju hidden wait queue.

---

# 178. UNBOUNDED WAIT

Ako requests čekaju connection minutima:

memory/concurrency raste.

---

# 179. FAIL FAST

Ponekad je bolje brzo 503 nego 60 s timeout.

---

# 180. LOAD TEST

Ne završavaj scalability audit bez pokušaja da pronađeš:

- current capacity
- breakpoint
- bottleneck

ako environment dozvoljava.

---

# 181. STEP LOAD

Primer:

```text
100 RPS
200
400
800
...
```

Prati kada:

- throughput prestane da raste
- latency eksplodira
- error rate raste

---

# 182. BREAKPOINT

Dokumentuj:

```text
first measurable degradation
```

i:

```text
hard failure point
```

ako su testirani.

---

# 183. SOAK TEST

Scalability problem može biti vremenski:

- memory leak
- queue drift
- connection leak

---

# 184. SPIKE TEST

Autoscaling/reconnect/cold-cache behavior.

---

# 185. LARGE DATA TEST

Traffic nije jedina dimenzija.

Testiraj sa production-like row counts.

---

# 186. LARGE TENANT TEST

Ne samo mnogo malih tenant-a.

---

# 187. FAN-OUT TEST

Resource sa maksimalnim realnim child count-om.

---

# 188. QUEUE SATURATION TEST

Sustained producer load iznad consumer capacity-ja.

---

# 189. DOWNSTREAM SLOW TEST

DB/provider uspori 10x.

Pitaj da li sistema ulazi u cascade.

---

# 190. COLD CACHE TEST

Restart/clear cache pod traffic-om u sigurnom test okruženju.

---

# 191. SCALE-OUT TEST

Dodaj instances.

Pitaj da li throughput stvarno raste.

---

# 192. EFFICIENCY

Izračunaj gde je moguće:

```text
scale efficiency =
throughput increase / resource increase
```

Ne forsiraj formulu ako workload nije stabilan.

---

# 193. DATABASE GROWTH TEST

Query plan sa:

```text
1x
10x
100x
```

data volume ako je moguće reprodukovati.

---

# 194. INDEX SIZE

Index može više ne stati u memory/cache sa rastom dataset-a.

---

# 195. WORKING SET

Razlikuj total DB size i hot working set.

---

# 196. READ CACHE

DB buffer cache miss rate može menjati performance nakon data growth-a.

---

# 197. CARDINALITY

Query optimizer plan može se promeniti sa drugačijom distribucijom podataka.

---

# 198. DATA SKEW

Jedan popularan key može napraviti potpuno drugačiji workload.

---

# 199. CAPACITY FORECAST

Ako postoje realne growth projekcije:

proceni kada bottleneck dolazi.

Ako nema:

ne izmišljaj datum.

---

# 200. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Component:
Shared resource:
Current topology:
Current workload:
Growth dimension:

Current capacity:
Measured limit:
Hard configured limit:

Scale scenario:

T0:
T1:
T2:
T3:

Bottleneck:

Why adding app instances does/does not help:

Failure mode:

Latency impact:

Throughput impact:

Availability impact:

Cross-tenant impact:

Cost impact:

Evidence:

Root cause:

Recommended remediation:

Capacity test after remediation:

Production verification:

Complexity:
XS / S / M / L / XL
```

Ako nije merljivo:

**NOT MEASURED**

---

# 201. SEVERITY

Koristi:

## P0 - CRITICAL

Samo ako scaling bottleneck može izazvati katastrofalni correctness/security/data failure ili potpuni systemic outage veoma lako.

## P1 - HIGH

- normalan očekivani growth vodi ka jasnom production outage-u
- autoscaling može direktno izazvati shared-resource exhaustion
- queue/backlog nema bounded recovery
- critical shared DB/provider hard limit je već blizu ili prekoračen
- jedan tenant/workload može ozbiljno oboriti ostale

## P2 - MEDIUM

- značajan capacity ceiling
- growth vodi ka ozbiljnoj degradaciji
- horizontal scaling daje mali benefit zbog konkretnog shared bottleneck-a

## P3 - LOW

- ograničen scalability problem
- non-critical component

## P4 - IMPROVEMENT

- budući scale hardening bez potvrđenog current/growth problema

---

# 202. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

load/capacity test ili production metrics direktno potvrđuju ceiling.

MEDIUM:

config + architecture jasno pokazuju hard limit, ali nije load-testiran.

LOW:

budući growth scenario bez potvrđenog workload-a.

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

# 204. SCALE DIMENSION

Označi:

```text
TRAFFIC
CONCURRENCY
DATA
TENANTS
FILES
QUEUE
CONNECTIONS
REGIONS
EXTERNAL QUOTA
COST
```

---

# 205. BOTTLENECK CLASS

Koristi:

```text
CPU
MEMORY
DATABASE
LOCK
CONNECTION
CACHE
QUEUE
NETWORK
STORAGE
EXTERNAL API
SERIAL EXECUTION
ARCHITECTURE
```

---

# 206. FALSE-POSITIVE PREVENCIJA

Pre P1/P2 finding-a proveri:

1. actual topology
2. current workload
3. configured limits
4. autoscaling
5. DB/cache/queue shared resources
6. production metrics
7. load test
8. data volume
9. tenant distribution
10. downstream quotas

Ne zaključuj iz "ovaj loop je O(n)" bez relevantnog N.

---

# 207. NE PREPORUČUJ MICROSERVICES AUTOMATSKI

Ako monolith može horizontalno skalirati i bottleneck je DB:

decomposition možda ništa ne rešava.

---

# 208. NE PREPORUČUJ SHARDING PRERANO

Sharding je poslednja, ne prva, opcija za mnoge DB scale probleme.

---

# 209. NE PREPORUČUJ KUBERNETES KAO SCALE FIX

Orchestrator ne rešava:

- slow queries
- hot rows
- provider quotas
- DB connection limit

---

# 210. NE PREPORUČUJ CACHE KAO UNIVERZALNI FIX

Write-heavy bottleneck možda nema korist.

---

# 211. NE POVEĆAVAJ INSTANCE NASLEPO

Scale-out može pogoršati:

- DB connections
- retry traffic
- provider quota

---

# 212. NE POVEĆAVAJ DB POOL SA SVAKOM INSTANCOM

Total connection budget je bitan.

---

# 213. NE ŽRTVUJ CONSISTENCY

Replica/cache nije rešenje ako critical decision zahteva current data.

---

# 214. NE ŽRTVUJ FAIRNESS

Veći total throughput nije dobar ako jedan tenant može monopolizovati sistem.

---

# 215. NE MENJAJ KOD

Tokom audita:

- ne sharduj
- ne dodaj replicas
- ne menja autoscaling
- ne uvodi cache
- ne deli monolith
- ne menja queue partitioning

Prvo završi audit.

---

# 216. OUTPUT - BACKEND_SCALABILITY_BOTTLENECK_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- topology
- workload
- current scalability model
- primary shared bottlenecks
- highest-risk capacity ceilings

## 2. Production Topology Map

## 3. Workload / Growth Model

## 4. Capacity Inventory

## 5. Horizontal Scaling Audit

## 6. Database Scaling Audit

## 7. Connection Scaling Audit

## 8. Lock / Hot Row Audit

## 9. Cache Scaling Audit

## 10. Queue / Worker Scaling Audit

## 11. External Provider Quota Audit

## 12. API Fan-Out / Amplification Audit

## 13. Data Growth Audit

## 14. Pagination / Search / Aggregation Scaling

## 15. Multi-Tenant / Noisy Neighbor Audit

## 16. Storage / File / Bandwidth Scaling

## 17. WebSocket / Long-Lived Connection Scaling

Ako relevantno.

## 18. In-Memory State / Scale-Out Blockers

## 19. Scheduler / Singleton Audit

## 20. CPU / Memory Scaling

## 21. Serverless / Autoscaling Audit

## 22. Regional Scaling

Ako relevantno.

## 23. Cost Scalability

## 24. Deployment / Migration Scaling

## 25. Cascading Failure / Overload Audit

## 26. Load / Capacity Test Results

## 27. Findings Summary

| ID | Severity | Dimension | Bottleneck | Failure mode | Confidence | Status |
|---|---|---|---|---|---|---|

## 28. P0 Findings

## 29. P1 Findings

## 30. P2 Findings

## 31. P3 Findings

## 32. P4 Improvements

## 33. Things Done Well

## 34. Unknown / Not Measured

## 35. Scalability Remediation Roadmap

---

# 217. CAPACITY MATRIX

| Resource | Current | Limit | Headroom | Scale strategy | Risk |
|---|---:|---:|---:|---|---|

---

# 218. HORIZONTAL SCALE MATRIX

| Component | Can scale horizontally | Shared state | Shared bottleneck | Effective |
|---|---|---|---|---|

---

# 219. DATABASE SCALE MATRIX

| Workload | Query/operation | Growth factor | Index/lock | Scale risk |
|---|---|---:|---|---|

---

# 220. CONNECTION MATRIX

| Client | Per instance | Instances | Possible total | Dependency limit |
|---|---:|---:|---:|---:|

---

# 221. QUEUE CAPACITY MATRIX

| Queue | Produce rate | Consume rate | Max concurrency | Downstream limit |
|---|---:|---:|---:|---:|

---

# 222. TENANT FAIRNESS MATRIX

| Resource | Shared | Tenant isolation | Noisy-neighbor risk | Protection |
|---|---|---|---|---|

---

# 223. SECOND PASS - 10X TRAFFIC

Simuliraj:

```text
current traffic × 10
```

Pitaj redom:

1. app CPU
2. app memory
3. DB connections
4. DB CPU
5. cache
6. queue
7. external APIs

Ko prvi saturira?

---

# 224. SECOND PASS - 100X DATA

Za critical queries simuliraj:

```text
current data × 100
```

Pitaj:

- plan
- index
- response size
- sort
- aggregate
- storage

---

# 225. SECOND PASS - 100X TENANTS

Pitaj:

- config memory
- DB schemas/connections
- migrations
- queue fairness
- monitoring cardinality

---

# 226. SECOND PASS - SCALE OUT APPS

Dodaj backend instances bez menjanja downstream-a.

Pitaj:

> Koji shared dependency prima linearno više load-a?

---

# 227. SECOND PASS - DB CONNECTION CLIFF

Povećavaj instance count dok total possible connections ne pređe dependency capacity.

---

# 228. SECOND PASS - CACHE COLD START

Restartuj/isprazni cache u test environment-u pod load-om.

Pitaj da li DB može podneti full miss traffic.

---

# 229. SECOND PASS - HOT KEY

Koncentriši veliki procenat traffic-a na:

- jedan tenant
- resource
- cache key
- DB row

---

# 230. SECOND PASS - LARGE TENANT

Jedan tenant sa ekstremno velikim dataset-om.

Pitaj da li globalni query modeli i limits i dalje rade.

---

# 231. SECOND PASS - QUEUE OVERLOAD

Povećavaj producer rate iznad consumer rate-a.

Prati:

- depth
- oldest age
- memory/storage

---

# 232. SECOND PASS - EXTERNAL QUOTA

Povećaj local throughput do provider hard quota-e.

Pitaj šta se dešava nakon 429/rate limit-a.

---

# 233. SECOND PASS - RETRY CASCADE

Dependency uspori/pada.

Uključi realne retry-je.

Izračunaj traffic amplification.

---

# 234. SECOND PASS - AUTOSCALE STORM

Traffic spike pokrene mnogo novih instances.

Pitaj:

- DB connections
- cache warmup
- provider calls
- startup DB reads

---

# 235. SECOND PASS - DEPLOYMENT STORM

Rolling restart svih replicas.

Pitaj kako cold start utiče na shared dependencies.

---

# 236. SECOND PASS - SLOW DATABASE

DB latency ×10.

Pitaj:

```text
requests last longer
↓
concurrency rises
↓
pool fills
↓
what happens next?
```

---

# 237. SECOND PASS - ONE TENANT FLOOD

Legitimni ili abusive veliki tenant.

Prati impact na druge tenant-e.

---

# 238. SECOND PASS - MIGRATION AT SCALE

Primeni planiranu schema migration na production-sized kopiji ili analiziraj DB-specific lock/rewrite behavior.

---

# 239. SECOND PASS - FILE SCALE

Simuliraj mnogo concurrent upload/download-a.

Prati:

- sockets
- memory
- temp disk
- network
- egress

---

# 240. SECOND PASS - FAILURE CLIFF

Traži tačku gde:

```text
load +10%
```

izazove:

```text
latency +500%
```

Takav nelinearni cliff ima visok prioritet.

---

# 241. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- scalability nije pomešana sa čistom performance optimizacijom
- actual production topology je mapirana ili označena NOT VERIFIED
- growth dimenzije su eksplicitno navedene
- shared resources su pronađeni pre scale-out preporuka
- DB pool × instance count je izračunat gde je moguće
- DB CPU/IOPS/locks nisu ignorisani
- cache cold-start behavior je analiziran
- Redis nije tretiran kao beskonačan scalable resource
- queue producer/consumer odnos je analiziran
- external provider quotas su uključene
- retry amplification je izračunat gde config postoji
- fan-out amplification je mapiran
- data growth i traffic growth nisu pomešani
- large tenant scenario je analiziran
- local state/locks/cron su provereni za scale-out
- autoscaling ne može neograničeno preopteretiti shared dependency bez analize
- migration/deployment behavior je razmatran sa velikim dataset-om
- overload mode i cascading failure su analizirani
- cost scalability je uzeta u obzir gde je relevantno
- microservices/sharding/Kubernetes nisu preporučeni bez dokaza
- svaki P1/P2 ima jasan bottleneck i growth scenario
- P4 future-hardening je odvojen od current/growth blockers

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite horizontal scaling, Redis, read replicas i Kubernetes.

To nije scalability bottleneck audit.

Tražim probleme poput:

```text
backend autoscaling:
2 → 50 instances

each instance:
DB pool = 20

↓
possible DB connections:
40 → 1000

database max:
300

↓
traffic spike triggers autoscaling
↓
connection capacity is exceeded
↓
more app instances make the outage worse
```

ili:

```text
queue producer capacity:
500 jobs/sec

worker sustained capacity:
300 jobs/sec

↓
normal peak lasts 4 hours
↓
backlog grows by 200/sec
↓
2,880,000 jobs accumulate
↓
oldest-job latency keeps increasing
```

ili:

```text
API request loads organization
↓
queries every project
↓
queries every member of every project
↓
work grows with nested resource count
↓
small tenants are fast
↓
one enterprise tenant causes seconds of DB work per request
```

ili:

```text
10 backend replicas
↓
all update same global counter row
↓
row lock serializes writes
↓
adding replicas increases lock wait
↓
throughput stops scaling
```

ili:

```text
cache handles 95% of reads
↓
deployment flushes cache
↓
all new instances start simultaneously
↓
100% of traffic hits database
↓
DB capacity was sized only for 5% misses
↓
cold-start outage
```

ili:

```text
one tenant queues 1 million low-priority exports
↓
all tenants share one FIFO queue
↓
critical small jobs enter behind backlog
↓
system has enough total compute
↓
but no fairness/isolation
↓
other tenants experience multi-hour delay
```

ili:

```text
API handles 1 incoming request
↓
fans out to 30 downstream requests
↓
traffic grows to 1000 RPS
↓
downstream receives 30,000 RPS
↓
provider hard limit is 5,000 RPS
↓
backend scale-out cannot solve the real ceiling
```

ili:

```text
table currently has 100k rows
↓
pagination uses OFFSET
↓
enterprise growth reaches hundreds of millions
↓
deep pages require scanning/skipping huge row counts
↓
request latency grows with page depth
```

To su scalability bottleneck-i koje treba da pronađeš.

Razmišljaj kroz:

- shared resources
- capacity ceilings
- growth dimensions
- amplification
- serial execution
- hot keys/rows
- connection budgets
- queues
- tenant fairness
- autoscaling side effects
- failure cliffs
- cost

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koja growth dimenzija aktivira problem?

> Koji tačan resource prvi saturira?

> Koji je njegov hard ili measured limit?

> Da li dodavanje backend instanci pomaže ili pogoršava problem?

> Da li se throughput skalira linearno?

> Postoji li tačka posle koje latency naglo eksplodira?

> Kako jedan veliki tenant utiče na druge?

> Koja najmanja arhitektonska promena uklanja stvarni bottleneck?

Ako nije izmereno:

**NOT MEASURED.**

Ako topologija nije potvrđena:

**PRODUCTION TOPOLOGY NOT VERIFIED.**

Ako je samo mogući budući problem bez potvrđenog growth scenarija:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih capacity ceiling-a sa dokazivim failure path-om nego napisati 100 generičkih skalabilnih architecture saveta.

Cilj je dobiti forenzički precizan scalability audit koji se može direktno pretvoriti u:

- capacity test
- scale-out experiment
- DB capacity correction
- queue capacity plan
- tenant isolation
- load-shedding strategy
- architectural bottleneck fix
- production growth plan
