---
id: UPL-IT-029
number: 29
slug: background-jobs-and-queue-audit
title: Audit pozadinskih poslova i redova
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# AUDIT POZADINSKIH POSLOVA I REDOVA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog background job i queue sistema backend aplikacije.

Glavni cilj:

> Utvrditi da li background poslovi pouzdano preživljavaju restart, retry, duplicate delivery, worker crash, queue outage, deployment, concurrency, partial failure i backlog, bez gubitka poslova, duplih side effect-a, beskonačnih retry-ja, stuck job-ova ili pogrešnog business stanja.

Ovo nije:

- generički savet da se koristi Redis/BullMQ/SQS/RabbitMQ/Kafka
- automatsko prebacivanje svakog sporog request-a u queue
- površna provera da li postoji worker
- pretpostavka da je svaki job exactly-once
- pretpostavka da retry rešava reliability
- automatsko povećavanje worker concurrency-ja
- samo performance audit
- samo error handling audit

Fokus je na celom job lifecycle-u:

```text
job creation
↓
durable enqueue
↓
queue storage
↓
worker claim
↓
processing
↓
side effects
↓
ack / completion
↓
retry / terminal state
```

Prioritet:

**job durability > idempotency > business correctness > retry safety > concurrency > recovery > backlog control > performance**

Bolje je pronaći 6 stvarnih job-loss/duplicate/stuck problema nego napisati 100 generičkih queue preporuka.

---

# 1. UTVRDI JOB STACK

Pre finding-a utvrdi:

- queue tehnologiju
- broker/storage
- worker framework
- scheduler
- cron
- delayed jobs
- retry mehanizam
- dead-letter mehanizam
- persistence
- concurrency model
- deployment model
- observability

Primeri:

```text
BullMQ
Redis
Celery
RabbitMQ
SQS
Sidekiq
Hangfire
Quartz
WorkManager-like backend workers
custom DB queue
```

Ne pretpostavljaj stack unapred.

---

# 2. INVENTARIŠI SVE JOB-OVE

Pronađi:

- background jobs
- scheduled jobs
- cron jobs
- delayed jobs
- queue consumers
- event consumers
- batch jobs
- maintenance tasks
- cleanup jobs
- exports
- emails
- notifications
- billing jobs
- reconciliation jobs

Za svaki zabeleži:

```text
Job name:
Trigger:
Queue:
Payload:
Durable:
Retry:
Max attempts:
Timeout:
Concurrency:
Side effects:
Business criticality:
```

---

# 3. JOB CLASSIFICATION

Klasifikuj svaki job:

```text
CRITICAL
IMPORTANT
BEST-EFFORT
MAINTENANCE
ANALYTICS
```

Severity mora da prati business impact.

---

# 4. JOB CREATION FLOW

Za svaki job mapiraj:

```text
request/event
↓
business commit
↓
enqueue
```

Pitaj:

> Šta ako enqueue padne?

---

# 5. DUAL WRITE

Klasičan problem:

```text
DB write succeeds
↓
enqueue fails
```

Business state kaže da posao treba da se izvrši, ali job ne postoji.

---

# 6. ENQUEUE PRE DB COMMIT-A

Suprotno:

```text
job enqueued
↓
worker starts
↓
DB transaction not committed yet
```

Worker može videti nepotpun state.

---

# 7. OUTBOX

Ako job nastaje kao posledica DB business promene i mora sigurno da postoji:

proveri da li postoji:

- transactional outbox
- durable work table
- drugi atomic model

Ne preporučuj outbox za svaki low-value notification.

---

# 8. DURABLE ENQUEUE

Utvrdi tačan trenutak kada je job zaista durable.

---

# 9. IN-MEMORY JOB

Ako se koristi:

```text
setTimeout
in-memory array
thread executor only
```

za posao koji mora preživeti process restart:

realan reliability problem.

---

# 10. SERVERLESS BACKGROUND WORK

Pattern:

```text
return HTTP response
↓
continue async in same process
```

može biti nepouzdan na serverless platformi.

Proveri konkretan runtime.

---

# 11. JOB IDENTITY

Svaki critical job treba da ima način da se identifikuje.

---

# 12. JOB ID VS BUSINESS OPERATION ID

Razlikuj:

```text
job attempt ID
```

od:

```text
logical business operation ID
```

Jedna logical operation može imati više attempts.

---

# 13. PAYLOAD

Mapiraj šta job nosi:

- full object
- resource ID
- snapshot
- mutable references

---

# 14. STALE PAYLOAD

Ako job nosi snapshot starog state-a:

može se izvršiti nakon što se resource promenio.

---

# 15. RESOURCE ID PAYLOAD

Ako job učita current state u vreme izvršenja:

to može biti bolje za neke use case-ove.

Ali nije dobro ako treba istorijski snapshot.

---

# 16. SNAPSHOT VS CURRENT STATE

Za svaki job eksplicitno odredi šta je ispravno.

---

# 17. PAYLOAD SIZE

Ogroman payload može povećati:

- queue storage
- serialization
- network
- memory

---

# 18. SENSITIVE PAYLOAD

Ne stavljaj:

- password
- access token
- full payment data

u queue payload bez potrebe.

---

# 19. SERIALIZATION

Proveri:

- schema
- version
- types
- backward compatibility

---

# 20. DEPLOYMENT VERSION SKEW

Scenario:

```text
old producer
↓
new worker
```

ili:

```text
new producer
↓
old worker
```

tokom rolling deployment-a.

---

# 21. JOB PAYLOAD VERSIONING

Ako job može dugo ostati u queue-u:

worker mora razumeti payload napravljen starijom aplikacijom.

---

# 22. CLASS NAME SERIALIZATION

Ako queue framework čuva worker/class/function name:

rename/deletion tokom deploy-a može slomiti stare pending jobs.

---

# 23. UNKNOWN JOB TYPE

Ne treba silent drop.

---

# 24. WORKER CLAIM

Utvrdi kako worker uzima job.

---

# 25. VISIBILITY TIMEOUT

Ako queue koristi visibility timeout:

mora biti duži ili obnovljiv u odnosu na realan job duration.

---

# 26. JOB TRAJE DUŽE OD VISIBILITY TIMEOUT-A

Scenario:

```text
worker A processes job
↓
visibility expires
↓
worker B receives same job
↓
both run simultaneously
```

Critical duplicate risk.

---

# 27. LEASE RENEWAL

Ako postoji:

proveri failure/restart behavior.

---

# 28. ACK

Utvrdi kada queue smatra job uspešnim.

---

# 29. ACK PRE SIDE EFFECT-A

Critical:

```text
ack
↓
process crashes
↓
side effect never happens
```

Job je izgubljen.

---

# 30. ACK POSLE SIDE EFFECT-A

Standardniji model, ali:

```text
side effect succeeds
↓
process crashes before ack
↓
job redelivered
```

Duplicate execution.

---

# 31. AT-LEAST-ONCE

Mnoge queue tehnologije efektivno zahtevaju da consumer podnosi duplicate delivery.

Ne nazivaj to exactly-once bez end-to-end dokaza.

---

# 32. IDEMPOTENCY

Za svaki critical job pitaj:

> Šta se događa ako se potpuno isti logical job izvrši dva puta?

---

# 33. IDEMPOTENT DB UPDATE

Primer:

```text
set status = PROCESSED
```

može biti prirodno idempotentno.

---

# 34. NON-IDEMPOTENT SIDE EFFECT

Primer:

```text
send money
increment credit
send email
create invoice
```

zahteva zaštitu prema business risk-u.

---

# 35. DEDUP

Ako postoji job dedup:

proveri:

- key
- TTL
- persistence
- multi-instance

---

# 36. DEDUP NIJE ISTO ŠTO I IDEMPOTENCY

Dedup može sprečiti dva queued job-a.

Ne štiti nužno od:

```text
side effect succeeded
↓
worker crashed before ack
↓
same job redelivered
```

---

# 37. UNIQUE BUSINESS OPERATION

Critical business action može imati unique operation ID u DB-u.

---

# 38. JOB RETRY

Inventariši:

- max attempts
- backoff
- jitter
- retryable errors

---

# 39. RETRY ALL

Anti-pattern:

```text
catch every exception
↓
retry
```

Neke greške su permanentne.

---

# 40. VALIDATION ERROR

Nevalidan payload neće postati validan sam od sebe.

---

# 41. NOT FOUND

Može biti:

- transient race
- permanent deletion
- expected

Zavisi od domain-a.

---

# 42. AUTH ERROR

External provider auth failure obično zahteva credential/config fix, ne agresivni retry.

---

# 43. 429

Backoff prema provider semantics.

---

# 44. TIMEOUT

Može biti transient, ali external mutation outcome može biti unknown.

---

# 45. 5XX

Bounded retry često ima smisla.

---

# 46. RETRY CLASSIFICATION

Koristi:

```text
TRANSIENT
PERMANENT
BUSINESS REJECTION
UNKNOWN OUTCOME
CANCELLED
```

---

# 47. NESTED RETRIES

Mapiraj:

```text
queue retries
↓
service retries
↓
HTTP client retries
```

Ukupan broj attempts može eksplodirati.

---

# 48. RETRY STORM

Provider outage + mnogo jobs može napraviti masovni synchronized retry.

---

# 49. JITTER

Relevantan za veliki fleet/backlog.

---

# 50. MAX ATTEMPTS

Ne retry-uj beskonačno bez jasne business potrebe.

---

# 51. MAX AGE

Neki posao posle određenog vremena više nema smisla.

Primer:

- push notification
- stale reminder

---

# 52. DEAD LETTER

Permanent failure treba da ima terminal state ili DLQ gde architecture to zahteva.

---

# 53. FAILED JOB VISIBILITY

Failed job ne sme samo nestati.

---

# 54. POISON JOB

Jedan permanentno nevalidan job ne sme blokirati queue.

---

# 55. FIFO QUEUE

Ako jedan poison job blokira group/order stream:

proveri handling.

---

# 56. MANUAL RETRY

Ako admin može retry:

proveri:

- isti logical operation
- side-effect safety
- audit

---

# 57. RETRY POSLE DELIMIČNOG SUCCESS-A

Najvažniji scenario.

---

# 58. STEP 1 SUCCESS, STEP 2 FAIL

Primer:

```text
upload file
↓
DB insert fails
↓
job retries
↓
file uploaded again
```

---

# 59. CHECKPOINTING

Za multi-step jobs može biti potrebno čuvati progress.

Ne uvodi ako job može jednostavno biti idempotentan od početka.

---

# 60. PARTIAL STATE

Job retry treba da zna šta je već završeno.

---

# 61. COMPENSATION

Ako job mora poništiti raniji side effect nakon kasnijeg failure-a:

proveri compensation.

---

# 62. COMPENSATION FAILURE

Šta ako rollback/cleanup takođe padne?

---

# 63. CONCURRENCY

Utvrdi worker concurrency:

- per process
- global
- per queue
- per tenant
- per resource

---

# 64. CONCURRENCY > 1

Pitaj da li dva jobs mogu istovremeno menjati isti resource.

---

# 65. RESOURCE CONFLICT

Scenario:

```text
Job A updates order
Job B updates same order
```

---

# 66. SERIALIZATION PER RESOURCE

Ako ordering mora biti per-resource:

proveri queue partition/group/key model.

---

# 67. GLOBAL SERIALIZATION

Jedan worker za ceo sistem može očuvati ordering, ali ubiti throughput.

Ne preporučuj global lock bez potrebe.

---

# 68. PARALLEL SAFE

Neki jobs su potpuno nezavisni i treba ih paralelizovati.

---

# 69. UNBOUNDED WORKER CONCURRENCY

Može saturirati:

- DB
- external API
- CPU
- memory

---

# 70. DOWNSTREAM CAPACITY

Worker count treba biti u skladu sa bottleneck dependency-jem.

---

# 71. CONCURRENCY LIMIT

Ne povećavaj samo zato što queue raste.

Prvo utvrdi zašto consumer ne stiže.

---

# 72. QUEUE BACKLOG

Meri:

- depth
- oldest job age
- processing latency

---

# 73. DEPTH NIJE DOVOLJAN

100k jobs od 1 ms nije isto što i 100 jobs od 10 minuta.

---

# 74. OLDEST JOB AGE

Često najbolji signal korisničkog kašnjenja.

---

# 75. PRODUCER RATE

Izmeri:

```text
jobs/sec produced
```

---

# 76. CONSUMER RATE

Izmeri:

```text
jobs/sec completed
```

---

# 77. NEGATIVAN KAPACITET

Ako:

```text
produce rate > consume rate
```

dugo vremena:

backlog raste bez granice.

---

# 78. BURST

Queue može biti dizajnirana da upije kratke burst-ove.

To nije bug ako se backlog kasnije normalno isprazni.

---

# 79. SUSTAINED OVERLOAD

Ako se backlog nikad ne smanjuje:

capacity problem.

---

# 80. AUTOSCALING WORKERS

Ako postoji:

proveri scaling signal.

---

# 81. SCALE PO DEPTH-U

Samo depth može pogrešno skalirati huge jobs.

---

# 82. SCALE PO OLDEST AGE-U

Može biti bolji signal u nekim sistemima.

---

# 83. SCALE LIMIT

Downstream capacity mora ograničiti worker autoscaling.

---

# 84. THUNDERING HERD

100 novih worker-a mogu istovremeno udariti DB/provider.

---

# 85. QUEUE PRIORITY

Ako postoji više priority nivoa:

proveri starvation.

---

# 86. HIGH PRIORITY STARVATION

Infinite high-priority stream može sprečiti low-priority jobs zauvek.

---

# 87. FAIRNESS

Jedan tenant/user može napuniti queue.

---

# 88. PER-TENANT BACKLOG

Ako multi-tenant:

proveri noisy-neighbor scenario.

---

# 89. QUEUE PARTITION

Može pomoći isolation-u, ali ne uvodi bez product potrebe.

---

# 90. SCHEDULED JOBS

Inventariši sve cron/scheduled poslove.

---

# 91. DUPLICATE CRON

Ako svaka app replica pokreće:

```text
cron every minute
```

isti posao može krenuti više puta.

---

# 92. PLATFORM SCHEDULER

Ako deployment platform već garantuje single execution:

ne prijavljuj duplicate bez verifikacije.

---

# 93. CRON IDEMPOTENCY

Čak i singleton scheduler može retry-ovati/ponovo pokrenuti job.

---

# 94. LONGER THAN INTERVAL

Scenario:

```text
cron every 5 min
job duration = 10 min
```

Da li se execution preklapa?

---

# 95. REENTRANCY

Ako isti scheduled job ne sme paralelno:

potrebna je zaštita.

---

# 96. MISFIRE

Šta se događa ako scheduler nije radio 2 sata?

- run once
- run all missed
- skip

---

# 97. BACKFILL STORM

Ako scheduler nakon downtime-a pokrene sve missed minute intervals:

može nastati overload.

---

# 98. TIMEZONE

Cron po lokalnom vremenu ima DST edge cases.

---

# 99. DST DUPLICATE

Sat koji se ponovi može pokrenuti scheduled posao dvaput.

---

# 100. DST SKIP

Sat koji ne postoji može preskočiti job.

---

# 101. MONTH-END

Jobs vezani za calendar boundary zahtevaju posebno testiranje.

---

# 102. DELAYED JOB

Proveri:

- exact schedule
- persistence
- restart
- clock

---

# 103. CANCEL DELAYED JOB

Ako resource bude otkazan/obrisan pre execution-a:

job mora ponovo proveriti state.

---

# 104. STALE JOB

Scenario:

```text
job scheduled while ACTIVE
↓
resource becomes CANCELLED
↓
old job executes
↓
side effect still runs
```

---

# 105. CURRENT STATE CHECK

Delayed job ne treba slepo verovati starom payload state-u kada business semantics zahtevaju current state.

---

# 106. REMINDERS

Reminder možda više nije relevantan posle state change-a.

---

# 107. EXPIRATION JOBS

Ako expiration zavisi samo od delayed job-a:

šta ako job kasni 20 minuta?

---

# 108. STATE DERIVATION

Neki expiry status može biti derived iz vremena umesto fizičkog job-a.

Ne refaktoriši bez domain razumevanja.

---

# 109. BATCH JOBS

Inventariši jobs koji obrađuju veliki broj records.

---

# 110. LOAD ALL

Pattern:

```text
SELECT 1,000,000 rows
↓
process all
```

može izazvati memory/time problem.

---

# 111. CHUNKING

Batch možda treba chunk.

---

# 112. CHECKPOINT

Ako job padne na record 900.000:

da li retry kreće od početka?

---

# 113. DUPLICATE PREVIOUS ITEMS

Ako side effects nisu idempotentni:

restart od početka je opasan.

---

# 114. PER-ITEM STATE

Može biti potrebno samo za critical long batch.

---

# 115. TRANSACTION SIZE

Ne obavijaj milion records u jednu transaction bez razloga.

---

# 116. PARTIAL BATCH SEMANTICS

Definiši:

- all-or-nothing
- partial progress
- per-item retry

---

# 117. FAILED ITEM

Jedan loš record ne treba nužno da blokira 999.999 validnih ako product dozvoljava partial processing.

---

# 118. ERROR ISOLATION

Poison item treba izolovati.

---

# 119. BATCH CONCURRENCY

Previše paralelnih chunks može saturirati DB.

---

# 120. EXTERNAL API JOB

Za jobs koji zovu third-party servis:

proveri:

- timeout
- retry
- rate limit
- idempotency

---

# 121. PROVIDER QUOTA

Worker concurrency ne sme prelaziti external provider capacity bez razloga.

---

# 122. 429

Queue treba da uspori, ne da napravi još veći retry storm.

---

# 123. EMAIL JOB

Email je tipičan queue use case.

Proveri duplicate send.

---

# 124. SMS JOB

Isto, ali ima direktan financial cost.

---

# 125. PAYMENT JOB

High-risk.

Posebno proveri unknown outcome i idempotency.

---

# 126. EXPORT JOB

Mapiraj:

```text
queued
↓
processing
↓
file generation
↓
storage
↓
ready
```

---

# 127. EXPORT DUPLICATION

Retry može napraviti više fajlova.

---

# 128. ORPHAN FILE

File generated, DB update fails.

---

# 129. STALE EXPORT

Data može da se promeni tokom višeminutnog export-a.

Odredi da li export treba:

- snapshot
- current eventual data

---

# 130. IMPORT JOB

Partial failure i idempotency posebno analiziraj.

---

# 131. MEDIA PROCESSING

Video/image/transcoding jobs često imaju:

- CPU/GPU constraints
- temp files
- long duration

---

# 132. TEMP CLEANUP

Crash/failure ne sme ostaviti neograničeno temp fajlova.

---

# 133. RESOURCE LIMIT

Worker ne treba da pokrene više transcodes nego što hardware može da obradi.

---

# 134. RECONCILIATION JOB

Ako job popravlja inconsistent data:

mora biti konzervativan.

---

# 135. RECONCILIATION IDEMPOTENCY

Ponovljeno pokretanje ne sme praviti novi problem.

---

# 136. CLEANUP JOB

Delete old data/cache/files mora imati jasne granice.

---

# 137. CLEANUP RACE

Resource može postati active baš dok cleanup odlučuje da je stale.

---

# 138. DELETE BY AGE

Proveri:

- timezone
- exact boundary
- current references

---

# 139. RETENTION

Ne hardcode retention bez product/legal context-a.

---

# 140. JOB CANCELLATION

Ako user može otkazati job:

mapiraj semantics.

---

# 141. CANCEL PENDING

Jednostavnije.

---

# 142. CANCEL RUNNING

Teže.

Worker mora cooperative cancellation ako runtime to podržava.

---

# 143. SIDE EFFECT PRE CANCEL-A

Cancellation ne može magično poništiti već izvršene external side effects.

---

# 144. TERMINAL STATE

Job state može biti:

```text
COMPLETED
FAILED
CANCELLED
```

---

# 145. CANCEL RACE

Scenario:

```text
user cancels
↓
worker completes at same moment
```

Koji state pobedi?

---

# 146. STATUS UPDATE ATOMICITY

Terminal transition treba biti determinističan.

---

# 147. JOB TIMEOUT

Utvrdi per-job timeout.

---

# 148. TIMEOUT NIJE CANCEL

Framework može samo označiti timeout dok underlying external operation nastavlja.

Proveri runtime.

---

# 149. HARD KILL

Ako worker process bude ubijen:

job mora imati redelivery/recovery model.

---

# 150. GRACEFUL SHUTDOWN

Na deploy/SIGTERM:

- stop claiming new jobs
- finish/cancel active jobs
- release lease/ack pravilno

prema framework-u.

---

# 151. DEPLOYMENT

Workers se restartuju tokom deploy-a.

To nije edge case.

---

# 152. JOB U TOKU DEPLOY-A

Testiraj long-running job dok worker odlazi.

---

# 153. CODE VERSION CHANGE

Pending job možda je kreiran starim code-om.

Novi worker mora razumeti semantics ili imati migration.

---

# 154. REMOVED WORKER

Ne briši worker implementation dok queue još može sadržati taj job type.

---

# 155. RENAMED QUEUE

Deployment može ostaviti jobs u staroj queue koja više nema consumer.

---

# 156. ORPHAN QUEUE

Traži queue names koje niko ne consume-uje.

---

# 157. PRODUCER WITHOUT CONSUMER

Critical operational finding.

---

# 158. CONSUMER WITHOUT PRODUCER

Može biti legacy/dead code.

---

# 159. CONFIG DRIFT

Producer i worker mogu koristiti različite:

- queue names
- Redis URLs
- namespaces

---

# 160. ENVIRONMENT LEAK

Production producer ne sme slati jobs u staging queue ili obrnuto.

---

# 161. PREFIX/NAMESPACE

Ako dev/staging/prod dele Redis/broker:

queue names moraju biti izolovani.

---

# 162. CROSS-ENVIRONMENT JOB

P1/P0 zavisno od data impact-a.

---

# 163. MULTI-TENANCY

Job payload mora nositi ili izvesti pravilan tenant context.

---

# 164. TENANT CONTEXT LOSS

Scenario:

```text
API has tenant A context
↓
job payload only contains resource ID
↓
worker queries globally
↓
wrong tenant resource matched
```

---

# 165. TENANT AUTH

Worker ne koristi user auth isto kao HTTP request.

Zato service/business layer mora eksplicitno čuvati tenant boundary.

---

# 166. USER CONTEXT

Ako job radi u ime user-a:

proveri:

- user ID
- permissions snapshot/current permissions
- revoked user

---

# 167. PERMISSION AT EXECUTION TIME

Ako user izgubi pravo pre delayed execution-a:

da li job treba nastaviti?

To je product/business odluka.

---

# 168. SYSTEM JOB

Neki job radi kao system principal.

Dokumentuj.

---

# 169. AUDIT

Za high-value background actions korisno je znati:

- ko je inicirao
- koji job je izvršio
- kada

---

# 170. OBSERVABILITY

Za svaku critical queue prati:

- queued
- active
- completed
- failed
- retried
- cancelled
- delayed

---

# 171. OLDEST AGE

Posebno bitna.

---

# 172. PROCESSING DURATION

P50/P95/P99 ako postoji.

---

# 173. FAILURE RATE

Per job type.

---

# 174. RETRY RATE

Visok retry rate može prikrivati dependency problem.

---

# 175. DEAD LETTER COUNT

Treba biti vidljiv.

---

# 176. STUCK ACTIVE JOB

Job u active state-u satima/danima može značiti lost worker/lease problem.

---

# 177. NOISE

Expected business rejection ne mora biti ERROR alert svaki put.

---

# 178. LOG CONTEXT

Job log treba imati:

- job ID
- logical operation ID
- type
- attempt
- tenant/resource ID gde bezbedno

---

# 179. SENSITIVE PAYLOAD LOG

Ne dump-uj ceo job payload automatski.

---

# 180. TRACE CONTEXT

Ako job nastaje iz API request-a:

trace correlation može biti korisna.

---

# 181. TRACE NE TREBA DA ŽIVI 7 DANA KAO JEDAN SPAN

Asynchronous tracing model treba prilagoditi tooling-u.

---

# 182. METRICS CARDINALITY

Job ID ne kao metric label.

---

# 183. ALERTING

Candidate alerts:

- oldest job age
- sustained failure rate
- queue depth growth
- no active consumers
- DLQ growth

prema product importance-u.

---

# 184. HEALTH

Worker health nije samo:

```text
process alive
```

Ako ne može da claim/process jobs, operationalno je unhealthy.

---

# 185. QUEUE CONNECTIVITY

Readiness može zavisiti od broker-a, ali proceni architecture-u.

---

# 186. BROKER OUTAGE

Šta rade producers?

---

# 187. ENQUEUE FAILURE

Critical request možda ne sme vratiti success ako required job nije durable.

---

# 188. BROKER OUTAGE WORKER

Workers treba da reconnect-uju bez busy loop-a.

---

# 189. REDIS/BROKER RESTART

Proveri persistence model.

---

# 190. QUEUE DURABILITY

Ako broker restartuje:

da li queued jobs opstaju?

---

# 191. EPHEMERAL QUEUE

Može biti validna za analytics/best-effort.

Ne za critical financial work bez dodatne durability.

---

# 192. BROKER DATA LOSS

Ako system koristi persistence:

proveri configured guarantees, ne samo default assumption.

---

# 193. BACKUP

Queue broker backup nije uvek pravi način recovery-ja.

Za critical jobs durable source/outbox može biti važniji.

---

# 194. REPLAY FROM SOURCE

Ako queue izgubi state, može li se posao rekonstruisati iz authoritative DB event/outbox?

---

# 195. JOB HISTORY

Koliko dugo se čuvaju completed/failed records?

Operational choice.

---

# 196. UNBOUNDED HISTORY

Millions completed jobs u Redis/DB mogu povećati storage.

---

# 197. AUTO-REMOVE

Ako completed jobs odmah nestaju:

debugging/audit može biti teži.

Balance prema criticality-ju.

---

# 198. FAILED HISTORY

Critical failed jobs možda treba čuvati duže.

---

# 199. TESTOVI

Mapiraj:

- unit
- worker integration
- broker integration
- retry
- concurrency
- crash
- deployment
- backlog/load

---

# 200. IN-MEMORY MOCK QUEUE

Mock koji odmah pozove handler ne dokazuje realne queue semantics.

---

# 201. REAL BROKER TEST

Critical reliability flow je bolje testirati protiv realističnog broker-a gde je moguće.

---

# 202. DUPLICATE DELIVERY TEST

Isti job dva puta.

---

# 203. CONCURRENT DUPLICATE TEST

Isti job paralelno na dva worker-a.

---

# 204. CRASH BEFORE ACK TEST

Side effect posle pa crash.

---

# 205. CRASH BEFORE SIDE EFFECT TEST

Job claimed, process umre odmah.

Treba da se redeliver-uje prema contract-u.

---

# 206. VISIBILITY TIMEOUT TEST

Job traje duže od lease/visibility vremena.

---

# 207. RETRY TEST

Transient error:

```text
fail
fail
success
```

Proveri attempt count/backoff.

---

# 208. PERMANENT ERROR TEST

Nevalidan payload ne treba da troši infinite retries.

---

# 209. BROKER OUTAGE TEST

Producer i consumer behavior.

---

# 210. DEPLOYMENT TEST

Job queue ima stare jobs, deploy novog worker-a.

---

# 211. STALE JOB TEST

Resource state promenjen između enqueue i execution.

---

# 212. CANCEL TEST

Cancel dok:

- pending
- delayed
- running
- završava

---

# 213. BATCH PARTIAL FAILURE TEST

Neki item-i već processed.

---

# 214. QUEUE FLOOD TEST

Masovno enqueue.

Prati:

- depth
- latency
- memory
- DB/provider capacity

---

# 215. FAIRNESS TEST

Jedan tenant kreira veliki backlog.

Pitaj šta se događa drugom tenant-u.

---

# 216. CRON DUPLICATION TEST

Više app replicas/scheduler instances.

---

# 217. CRON OVERLAP TEST

Job duration > interval.

---

# 218. DST TEST

Ako schedule koristi lokalno vreme.

---

# 219. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Job:
Queue:
Trigger:
Producer:
Worker:
Broker:
Business resource:
Tenant:

File/Class:
Function:
Relevant config:

Problem:

Evidence:

Job Timeline:

T0:
T1:
T2:
T3:

Expected delivery semantics:

Actual/Possible semantics:

Durability point:

Ack point:

Retry behavior:

Attempt:
Concurrency:

Side effect:

Duplicate impact:

Data impact:

Financial impact:

User impact:

Backlog/capacity impact:

Root cause:

Recommended remediation:

Regression/failure-injection test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 220. SEVERITY

Koristi:

## P0 - CRITICAL

- duplicate job pravi irreversible financial effect
- cross-tenant worker corruption
- critical job system može catastrophicno korumpirati podatke

## P1 - HIGH

- critical job može trajno biti izgubljen
- normalan retry/redelivery duplira critical side effect
- deployment/restart redovno ostavlja posao stuck
- queue backlog može oboriti core business proces
- critical scheduled job može biti izvršen više puta bez zaštite

## P2 - MEDIUM

- značajan retry/concurrency/stale-job problem
- job može ostati stuck ili kasniti ozbiljno
- worker fairness/capacity problem sa realnim impact-om

## P3 - LOW

- ograničen edge case
- minor operational issue

## P4 - IMPROVEMENT

- observability/tuning/maintainability bez potvrđenog correctness failure-a

---

# 221. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

queue config/code/test direktno potvrđuje scenario.

MEDIUM:

jak evidence, ali broker/deployment runtime nije potpuno potvrđen.

LOW:

zavisi od nepoznatog managed queue behavior-a.

---

# 222. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 223. DELIVERY SEMANTICS STATUS

Koristi:

```text
AT-LEAST-ONCE
AT-MOST-ONCE
BEST-EFFORT
UNKNOWN
```

Ne koristi exactly-once osim uz dokazanu end-to-end business garanciju.

---

# 224. JOB IDEMPOTENCY STATUS

Koristi:

```text
NATURALLY IDEMPOTENT
IDEMPOTENCY GUARDED
DEDUP ONLY
NOT IDEMPOTENT
NOT VERIFIED
```

---

# 225. DURABILITY STATUS

Koristi:

```text
DURABLE
EPHEMERAL
PARTIALLY DURABLE
NOT VERIFIED
```

---

# 226. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. producer
2. queue config
3. broker semantics
4. worker
5. ack
6. retry
7. DB constraints
8. side effects
9. deployment topology
10. tests

Ne zaključuj samo iz worker handler-a.

---

# 227. NE PRETPOSTAVLJAJ EXACTLY-ONCE

Queue acknowledgement nije isto što i exactly-once business execution.

---

# 228. NE REŠAVAJ DUPLICATE SAMO DEDUP-OM

Crash-after-side-effect scenario može i dalje duplirati.

---

# 229. NE POVEĆAVAJ CONCURRENCY NASLEPO

Backlog može biti simptom:

- sporog DB-a
- 429 provider-a
- locks
- huge jobs

Više worker-a može pogoršati stanje.

---

# 230. NE SMANJUJ CONCURRENCY NASLEPO

Može samo povećati backlog.

---

# 231. NE DODAJ QUEUE SVUDA

Short, reliable synchronous work možda ne treba queue.

---

# 232. NE PRETVARAJ BEST-EFFORT JOB U CRITICAL

Analytics drop može biti prihvatljiv.

Payment settlement ne.

---

# 233. NE KORISTI REDIS LOCK KAO PRVI ODGOVOR

Conditional DB update, unique constraint ili idempotency key često su bolji.

---

# 234. NE ČUVAJ CELO ORM STANJE U JOBU BEZ RAZLOGA

Stale serialized entity može biti pogrešna u trenutku execution-a.

---

# 235. NE MENJAJ KOD

Tokom audita:

- ne menja queue
- ne menja retries
- ne povećava concurrency
- ne dodaje outbox
- ne menja cron
- ne dodaje DLQ

Prvo završi audit.

---

# 236. OUTPUT - BACKGROUND_JOBS_QUEUE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- queue stack
- broker
- job count/types
- delivery semantics
- najveći reliability rizici

## 2. Queue Architecture Map

## 3. Job Inventory

## 4. Job Criticality Classification

## 5. Producer / Enqueue Audit

## 6. Durability Audit

## 7. Payload / Schema Audit

## 8. Deployment Compatibility Audit

## 9. Worker Claim / Ack Audit

## 10. Idempotency / Duplicate Delivery Audit

## 11. Retry / Backoff Audit

## 12. Dead Letter / Poison Job Audit

## 13. Concurrency / Race Audit

## 14. Queue Backlog / Capacity Audit

## 15. Fairness / Multi-Tenant Audit

## 16. Scheduled / Cron Job Audit

## 17. Delayed / Stale Job Audit

## 18. Batch Job Audit

## 19. External API Worker Audit

## 20. Export / Import / Media Job Audit

Ako relevantno.

## 21. Cancellation Audit

## 22. Worker Shutdown / Deployment Audit

## 23. Broker Failure / Recovery Audit

## 24. Observability / Alerting

## 25. Test Coverage

## 26. Findings Summary

| ID | Severity | Job | Category | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 27. P0 Findings

## 28. P1 Findings

## 29. P2 Findings

## 30. P3 Findings

## 31. P4 Improvements

## 32. Things Done Well

## 33. Unknown / Not Verified

## 34. Reliability Remediation Roadmap

---

# 237. JOB MATRIX

| Job | Queue | Criticality | Retry | Idempotent | Durable |
|---|---|---|---|---|---|

---

# 238. ACK MATRIX

| Job | Side effect | Ack point | Crash window | Duplicate risk |
|---|---|---|---|---|

---

# 239. RETRY MATRIX

| Error | Retryable | Backoff | Max attempts | Side-effect safe |
|---|---|---|---|---|

---

# 240. QUEUE CAPACITY MATRIX

| Queue | Produce rate | Consume rate | Depth | Oldest age | Risk |
|---|---:|---:|---:|---:|---|

---

# 241. CRON MATRIX

| Scheduled job | Frequency | Singleton | Reentrant | Missed-run policy |
|---|---|---|---|---|

---

# 242. SECOND PASS - CRASH AFTER SIDE EFFECT

Za svaki critical job simuliraj:

```text
side effect succeeds
↓
worker crashes
↓
ack not sent
↓
job redelivered
```

Pitaj šta se duplira.

---

# 243. SECOND PASS - CRASH BEFORE SIDE EFFECT

```text
job claimed
↓
worker crashes
```

Pitaj da li job ponovo postaje available.

---

# 244. SECOND PASS - VISIBILITY EXPIRY

Pokreni job duži od lease/visibility timeout-a.

Pitaj da li drugi worker dobija isti posao.

---

# 245. SECOND PASS - CONCURRENT DUPLICATE

Dva worker-a izvršavaju isti logical job istovremeno.

---

# 246. SECOND PASS - STALE JOB

Promeni resource state nakon enqueue-a, pre execution-a.

Pitaj da li job ponovo proverava relevantne invariants.

---

# 247. SECOND PASS - DEPLOYMENT

Ostavi jobs u queue-u.

Deploy-uj novu verziju sa promenjenim payload/worker code-om.

Pitaj da li stari job može da se obradi.

---

# 248. SECOND PASS - QUEUE DOWN

Producer pokušava enqueue dok broker nije dostupan.

Pitaj:

> Da li caller dobija success pre nego što critical work postane durable?

---

# 249. SECOND PASS - WORKER DOWN

Queue raste bez aktivnih consumers.

Pitaj koliko brzo monitoring to otkriva.

---

# 250. SECOND PASS - RETRY STORM

External provider vraća 503 za veliki broj jobs.

Pitaj koliko attempts nastaje i kako backlog raste.

---

# 251. SECOND PASS - 429 PROVIDER

Pitaj da li concurrency/retry smanjuju load ili ga dodatno povećavaju.

---

# 252. SECOND PASS - POISON JOB

Jedan permanentno invalidan job.

Pitaj:

- koliko puta retry
- gde završava
- blokira li druge

---

# 253. SECOND PASS - CRON MULTI-INSTANCE

Pokreni više app/scheduler instanci.

Pitaj koliko puta isti schedule firing može nastati.

---

# 254. SECOND PASS - CRON OVERLAP

Job traje duže od perioda.

Pitaj da li se izvršenja preklapaju.

---

# 255. SECOND PASS - BATCH CRASH

Batch završi 70%, pa process umre.

Pitaj šta se događa pri retry-ju.

---

# 256. SECOND PASS - TENANT FLOOD

Jedan tenant enqueue-uje ogroman broj jobs.

Pitaj da li drugi tenant-i ostaju usluženi.

---

# 257. SECOND PASS - CANCEL RACE

```text
worker almost finished
||
user cancels
```

Pitaj koji terminal state i side effects nastaju.

---

# 258. SECOND PASS - SHUTDOWN

Pošalji SIGTERM dok worker ima active jobs.

Prati:

- claim
- ack
- lease
- redelivery

---

# 259. SECOND PASS - BROKER RESTART

Proveri:

- queued jobs
- delayed jobs
- retries
- active leases

pre i posle restart-a.

---

# 260. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- critical jobs imaju jasan durability point
- DB commit + enqueue dual-write je analiziran
- enqueue pre commit-a je analiziran
- payload snapshot/current-state semantics su određene
- old/new producer-worker compatibility je proverena
- ack point je mapiran u odnosu na side effects
- duplicate delivery je tretirana kao realan scenario
- dedup nije pogrešno izjednačen sa idempotency-jem
- crash-after-side-effect je testiran
- visibility timeout/lease odgovara job duration-u
- retries razlikuju transient i permanent errors
- nested retries su analizirani
- poison jobs imaju terminalni put
- worker concurrency je upoređen sa downstream capacity-jem
- queue backlog se meri kroz depth i oldest age
- cron duplicate/misfire/overlap su provereni
- delayed jobs ponovo proveravaju current business state gde treba
- long batch jobs imaju partial-failure/resume analizu
- deployment ne ostavlja orphan queue/job types
- production/staging queue namespace je izolovan
- worker tenant context je provereno bezbedan
- cancellation nije predstavljena kao rollback već izvršenih side effect-a
- broker outage behavior je eksplicitno analiziran
- observability može detektovati no-consumer/stuck/DLQ scenario
- P4 tuning predlozi su odvojeni od stvarnih reliability problema

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte queue, retries, dead-letter queue i više worker-a.

To nije background jobs audit.

Tražim probleme poput:

```text
order DB transaction commits
↓
enqueue email/fulfillment job fails
↓
API returns success
↓
order exists
↓
required background processing nikada ne počinje
```

ili:

```text
job sends payment/refund request
↓
provider succeeds
↓
worker crashes before queue ack
↓
job is redelivered
↓
same financial operation is attempted again
```

ili:

```text
visibility timeout = 30 s
↓
job normally runs 2 min
↓
worker A still processing
↓
queue makes job visible after 30 s
↓
worker B starts same job
↓
two executions overlap
```

ili:

```text
delayed job scheduled while resource ACTIVE
↓
resource becomes CANCELLED
↓
job executes 24 h later
↓
handler trusts stale payload
↓
cancelled resource receives forbidden side effect
```

ili:

```text
cron configured inside application process
↓
5 backend replicas
↓
all five fire at midnight
↓
same billing job runs five times
```

ili:

```text
queue producer uses payload v1
↓
deployment updates worker to v2
↓
old v1 jobs remain pending
↓
new worker cannot deserialize them
↓
jobs permanently fail after deploy
```

ili:

```text
one tenant queues 500,000 exports
↓
shared FIFO queue
↓
other tenants' small jobs sit behind them
↓
system is technically alive
↓
legitimate jobs wait for hours
```

ili:

```text
worker performs side effect
↓
non-critical analytics call fails
↓
job throws
↓
queue retries entire operation
↓
critical side effect happens twice
```

To su background job i queue problemi koje treba da pronađeš.

Razmišljaj kroz:

- enqueue durability
- ack timing
- process crashes
- duplicate delivery
- retries
- stale state
- concurrency
- deployment version skew
- queue backlog
- cron overlap
- tenant fairness
- downstream limits

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Kada posao postaje durable?

> Kada queue smatra posao završenim?

> Šta se događa ako worker padne pre ack-a?

> Šta se događa ako padne posle side effect-a?

> Može li isti logical job raditi paralelno na dva worker-a?

> Da li retry duplira nešto?

> Može li pending job preživeti novi deployment?

> Može li jedan tenant ili job type blokirati ostatak sistema?

Ako broker semantics nisu potvrđene:

**QUEUE DELIVERY SEMANTICS NOT VERIFIED.**

Ako je samo tuning/organizacija bez potvrđenog reliability problema:

**P4 - IMPROVEMENT.**

Bolje je pronaći 6 stvarnih job-loss/duplicate/stuck scenarija nego napisati 100 generičkih queue saveta.

Cilj je dobiti forenzički precizan Background Jobs & Queue audit koji se može direktno pretvoriti u:

- crash-window regression test
- retry/idempotency fix
- stale-job safeguard
- queue durability correction
- cron overlap protection
- deployment compatibility fix
- backlog/fairness monitoring
- production recovery plan
