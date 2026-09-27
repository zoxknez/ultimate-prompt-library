---
id: UPL-IT-041
number: 41
slug: ultimate-devops-and-infrastructure-audit
title: Sveobuhvatni DevOps i infrastrukturni audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.0
status: stable
---

# SVEOBUHVATNI DEVOPS I INFRASTRUKTURNI AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog DevOps, cloud i infrastructure sloja projekta.

Glavni cilj:

> Utvrditi da li deployment, infrastruktura, environment konfiguracija, compute, networking, secrets, storage, DNS, observability, backup, autoscaling, release proces i operational procedure mogu da izazovu outage, data loss, security incident, deployment failure, environment drift, rollback failure ili ozbiljan production degradation.

Ovo nije:

- generički DevOps checklist

- automatski zahtev za Kubernetes

- automatski zahtev za Terraform

- automatski zahtev za microservices

- automatski prelazak na multi-region

- automatsko povećavanje replicas

- automatsko dodavanje Redis-a

- samo CI/CD audit

- samo cloud security audit

- samo cost optimization audit

- savet da se sve "containerize-uje"

- blanket zahtev za 99.999% availability

Fokus je na kompletnom production chain-u:

```text

source

↓

build

↓

artifact

↓

configuration

↓

deployment

↓

runtime

↓

network

↓

dependencies

↓

storage/data

↓

observability

↓

recovery

```

Prioritet:

**data loss > production outage > security boundary failure > irreversible deployment > configuration drift > shared infrastructure bottleneck > recovery failure > observability gaps > cost inefficiency > hardening**

Bolje je pronaći 10 stvarnih production failure path-ova nego napisati 200 generičkih cloud preporuka.

---

# 1. UTVRDI STVARNU INFRASTRUKTURU

Pre finding-a mapiraj:

- hosting platform

- cloud provider

- regions

- compute model

- containers

- serverless

- VMs

- Kubernetes

- managed services

- database

- cache

- queue

- object storage

- CDN

- load balancer

- DNS

- CI/CD

- secret storage

- monitoring

- backups

Ako nešto nije dostupno:

**NOT VERIFIED**

---

# 2. NE IZMIŠLJAJ KOMPONENTE

Ako projekat koristi Vercel + managed Postgres:

ne piši Kubernetes recommendations bez razloga.

Ako koristi jednu VM:

analiziraj tu arhitekturu.

---

# 3. NAPRAVI INFRASTRUCTURE MAPU

Primer:

```text

Internet

↓

DNS

↓

CDN / Edge

↓

Load Balancer

↓

Application Instances

↓

Database

↓

Cache

↓

Queue

↓

Workers

↓

Object Storage

```

Dodaj stvarne komponente.

---

# 4. INVENTARIŠI ENVIRONMENT-E

Mapiraj:

```text

development

test

preview

staging

production

```

---

# 5. ENVIRONMENT ISOLATION

Za svaki proveri:

- credentials

- database

- storage

- queues

- domains

- provider accounts

- secrets

---

# 6. STAGING -> PRODUCTION PIVOT

Traži shared:

- signing secret

- DB credentials

- storage key

- API key

- service account

---

# 7. PREVIEW ENVIRONMENT

Posebno proveri da li preview deployment dobija production secrets.

---

# 8. ENVIRONMENT NAMING

Ne oslanjaj se samo na:

```text

NODE_ENV

```

ako platforma ima dodatne environment concepts.

---

# 9. CONFIGURATION SOURCE

Utvrdite gde config dolazi iz:

- env

- config files

- secret manager

- database

- platform settings

- runtime flags

---

# 10. CONFIG PRECEDENCE

Primer:

```text

defaults

↓

config file

↓

environment

↓

CLI

```

Mora biti jasno.

---

# 11. DEFAULT CONFIG

Traži unsafe fallback:

```text

DB_SSL=false

AUTH_DISABLED=true

SECRET=changeme

```

---

# 12. MISSING CONFIG

Critical config ne treba tiho dobiti nesigurnu default vrednost.

---

# 13. FAIL FAST

Ako production nema:

- DB URL

- signing secret

- encryption key

app treba jasno failovati gde je appropriate.

---

# 14. CONFIG DRIFT

Uporedi:

```text

repo

CI

staging

production

```

---

# 15. MANUAL CLICKOPS

Manual cloud changes nisu automatski problem.

Ali mogu napraviti drift koji nije vidljiv u repo-u.

---

# 16. INFRASTRUCTURE AS CODE

Ako postoji:

- Terraform

- Pulumi

- CloudFormation

- Bicep

- CDK

- Helm

- Kubernetes YAML

audituj actual state vs declared state gde je moguće.

---

# 17. IaC NIJE OBAVEZAN

Ne prijavljuj odsustvo Terraform-a kao vulnerability.

---

# 18. STATE FILE

Ako Terraform:

proveri:

- storage

- access

- locking

- secrets

---

# 19. DRIFT DETECTION

Ako IaC postoji:

pitanje je da li manual changes ostaju neprimećene.

---

# 20. COMPUTE MODEL

Utvrdite:

```text

VM

container

serverless

Kubernetes pod

PaaS instance

edge function

```

---

# 21. INSTANCE LIFECYCLE

Da li instance može nestati u bilo kom trenutku?

Ako da:

lokalni state nije durable.

---

# 22. LOCAL DISK

Traži da li application čuva:

- uploads

- jobs

- sessions

- cache

- generated files

na ephemeral filesystem-u.

---

# 23. EPHEMERAL FILESYSTEM

Serverless/PaaS restart može izgubiti podatke.

---

# 24. INSTANCE RESTART

Simuliraj:

```text

kill instance

```

u test environment-u.

Pitaj šta se izgubi.

---

# 25. STATELESSNESS

Horizontal scaling je lakši ako application state nije vezan za jednu instancu.

---

# 26. STICKY SESSION

Ako postoji:

proveri:

- failover

- uneven load

- session loss

---

# 27. IN-MEMORY SESSION

Restart može logout-ovati users.

Može biti prihvatljivo ili ozbiljno prema product-u.

---

# 28. IN-MEMORY JOB

Ako critical work postoji samo u RAM-u:

instance crash gubi job.

---

# 29. LOCAL CRON

Horizontal replicas mogu izvršiti isti cron više puta.

---

# 30. SINGLE INSTANCE ASSUMPTION

Pretraži code/config za logiku koja pretpostavlja:

```text

only one server exists

```

---

# 31. APPLICATION REPLICAS

Utvrdite:

- min

- max

- desired

- autoscaling

---

# 32. SINGLE INSTANCE PRODUCTION

Nije automatski problem.

Ali znači:

- no compute redundancy

- restart downtime

Proceni SLO/business zahtev.

---

# 33. LOAD BALANCER

Ako postoji:

proveri:

- health checks

- connection behavior

- session affinity

- timeout

---

# 34. HEALTH CHECK

Health endpoint ne treba samo:

```text

return 200

```

ako app zapravo nije spremna.

---

# 35. LIVENESS VS READINESS

Ako platforma razlikuje:

- liveness

- readiness

proveri semantics.

---

# 36. READINESS

Nova instanca ne treba da prima traffic pre:

- config load

- migrations dependency readiness

- critical initialization

---

# 37. LIVENESS LOOP

Loš liveness check može restartovati spor ali zdrav service i izazvati restart loop.

---

# 38. DEPENDENCY HEALTH

Ne proveravaj svaku dependency na svakom liveness request-u ako time health check postaje uzrok problema.

---

# 39. STARTUP

Mapiraj:

```text

process starts

↓

config

↓

DB connect

↓

cache

↓

migrations?

↓

warmup

↓

ready

```

---

# 40. MIGRATION ON STARTUP

Ako svaka replika pokreće migrations:

race/lock risk.

---

# 41. MIGRATION RUNNER

Utvrdi da li migrations pokreće:

- svaki app instance

- poseban deployment step

- singleton job

---

# 42. DESTRUCTIVE MIGRATION

Traži:

- DROP

- rename

- type change

- not-null

- data rewrite

---

# 43. ZERO-DOWNTIME COMPATIBILITY

Old i new app verzija mogu kratko raditi istovremeno.

Schema mora podržati mixed-version period gde rollout tako radi.

---

# 44. EXPAND-CONTRACT

Za breaking schema promene proceni potrebu za:

```text

expand

deploy

migrate

contract

```

---

# 45. LARGE TABLE MIGRATION

Query koji traje 2 sekunde na development bazi može zaključati production tabelu dugo.

---

# 46. BACKFILL

Ne pokreći ogromni backfill kao blocking migration bez analize.

---

# 47. MIGRATION ROLLBACK

Pitaj:

> Da li rollback application verzije radi nakon schema migration-a?

---

# 48. IRREVERSIBLE MIGRATION

Ako ne:

deployment mora imati poseban recovery plan.

---

# 49. DEPLOYMENT STRATEGY

Utvrdite:

- rolling

- blue/green

- canary

- recreate

- serverless atomic-like deploy

---

# 50. ROLLING DEPLOY

Mixed versions.

---

# 51. BLUE/GREEN

Pitaj:

- data compatibility

- background workers

- duplicated jobs

---

# 52. CANARY

Pomaže samo ako metrics i rollback decision postoje.

---

# 53. ATOMIC DEPLOYMENT

Frontend + backend možda se ne deploy-uju istovremeno.

---

# 54. CLIENT/BACKEND COMPATIBILITY

Old browser/mobile client može ostati dugo aktivan.

---

# 55. API BACKWARD COMPATIBILITY

Deployment ne sme instant slomiti postojeće clients bez namere.

---

# 56. FEATURE FLAG

Može odvojiti code deployment od feature activation.

---

# 57. FEATURE FLAG FAILURE

Stale/missing flag ne sme izazvati unsafe default.

---

# 58. DARK LAUNCH

Može smanjiti rollout risk za skupe features.

Ne zahtevaj generički.

---

# 59. ROLLBACK

Mora biti stvarno moguć, ne samo:

```text

git revert

```

---

# 60. ARTIFACT ROLLBACK

Da li prethodni immutable artifact postoji?

---

# 61. CONFIG ROLLBACK

Old app može zahtevati old config.

---

# 62. DATABASE ROLLBACK

Najčešće najteži deo.

---

# 63. EXTERNAL SIDE EFFECT

Deploy rollback ne može vratiti:

- poslate email-ove

- payments

- data deletion

---

# 64. FAILED DEPLOY

Pitaj šta se dešava ako deployment stane na 50%.

---

# 65. MIXED FLEET

Polovina old, polovina new.

---

# 66. JOB WORKER VERSION

Queue može sadržati jobs proizvedene starom verzijom, a obrađivati ih nova.

---

# 67. JOB SCHEMA COMPATIBILITY

Payload versioning gde potrebno.

---

# 68. SCHEDULED JOB DURING DEPLOY

Može izvršavati old/new logic paralelno.

---

# 69. CONNECTION DRAINING

Instanca koja se gasi treba da završi ili pravilno prekine:

- HTTP requests

- jobs

- WebSockets

---

# 70. GRACEFUL SHUTDOWN

Audituj:

- SIGTERM

- server close

- queue consumption stop

- timeout

---

# 71. HARD KILL

Šta ako platforma ipak ubije process?

Critical operations treba imati recovery.

---

# 72. LONG REQUEST

Deploy može preseći:

- upload

- export

- stream

- payment

---

# 73. WEBSOCKET DEPLOY

Connections se prekidaju.

Client reconnect behavior.

---

# 74. DATABASE

Utvrdite:

- managed/self-hosted

- primary

- replicas

- backups

- failover

---

# 75. SINGLE DB

Dodavanje app replicas ne daje database HA.

---

# 76. DB MULTI-AZ

Ako managed service tvrdi HA:

proveri actual configured tier.

---

# 77. DB FAILOVER

Pitaj:

- connection interruption

- DNS change

- reconnect

- transaction outcome

---

# 78. CONNECTION POOL

Total:

```text

instances × pool size

```

mora stati u DB limits.

---

# 79. AUTOSCALING CONNECTION STORM

App scale-out može oboriti DB.

---

# 80. SERVERLESS + DB

Large number functions + direct DB connections high-risk.

---

# 81. CONNECTION PROXY

Ako postoji:

proveri semantics, ne pretpostavljaj da rešava sve.

---

# 82. LONG TRANSACTION

Može blokirati failover/migration i držati locks.

---

# 83. READ REPLICA

Ako postoji:

proveri replication lag.

---

# 84. READ-AFTER-WRITE

Critical flows možda moraju čitati primary.

---

# 85. BACKUP

Ne pitaj samo:

> Da li backup postoji?

Pitaj:

> Da li je restore stvarno testiran?

---

# 86. BACKUP FREQUENCY

Ne izmišljaj RPO.

Izvedi iz business zahteva ako postoje.

---

# 87. RETENTION

Mapiraj.

---

# 88. OFFSITE / SEPARATE FAILURE DOMAIN

Backup koji je na istom hostu/storage account-u može deliti failure mode.

---

# 89. BACKUP CREDENTIAL

Ransomware/admin compromise možda može obrisati i backup.

---

# 90. IMMUTABLE BACKUP

Može biti opravdan za high-value data.

Ne zahtevaj svuda.

---

# 91. RESTORE TEST

Dokumentuj:

```text

latest tested restore

restore duration

data validation

```

ako dostupno.

---

# 92. BACKUP WITHOUT RESTORE TEST

To je samo pretpostavljena recoverability.

---

# 93. RPO

Ako product ima zahtev:

uporedi backup/log replication sa njim.

Ako nema:

**RPO REQUIREMENT NOT DEFINED**

---

# 94. RTO

Isto.

---

# 95. POINT-IN-TIME RECOVERY

Ako DB podržava:

proveri da li je uključeno.

---

# 96. ACCIDENTAL DELETE

Recovery scenario.

---

# 97. BAD MIGRATION

Recovery scenario.

---

# 98. APPLICATION BUG CORRUPTION

Backup možda sadrži već korumpirane podatke.

---

# 99. BACKUP VERSION HISTORY

Potrebno da se vrati pre corruption window-a.

---

# 100. OBJECT STORAGE

Audituj:

- durability

- ACL

- versioning

- lifecycle

- deletion

---

# 101. PUBLIC BUCKET

Security audit cross-reference.

---

# 102. VERSIONING

Može pomoći accidental overwrite/delete recovery.

---

# 103. LIFECYCLE RULE

Ne sme prerano obrisati critical data.

---

# 104. STORAGE CLASS

Cold archive može imati dugačak restore time.

Uključi u RTO.

---

# 105. LOCAL FILE BACKUP

Ako app koristi local persistent volume:

da li se backupuje?

---

# 106. CACHE

Utvrdite da li je cache:

- disposable

- authoritative

- session store

- lock store

- queue

---

# 107. CACHE FAILURE

Ako Redis padne:

šta se dešava?

---

# 108. CACHE AS DATABASE

Ako jedina kopija critical state-a postoji u cache-u:

high-risk.

---

# 109. CACHE PERSISTENCE

Ako Redis koristi persistent state:

proveri recovery semantics.

---

# 110. CACHE COLD START

DB mora podneti miss storm.

---

# 111. QUEUE

Audituj:

- durability

- retry

- DLQ

- capacity

- worker deployment

---

# 112. QUEUE FAILURE

Producers:

- fail

- buffer

- drop

?

---

# 113. MESSAGE DURABILITY

Ako broker restartuje:

da li poruke prežive?

---

# 114. QUEUE STORAGE

Disk full/retention.

---

# 115. DLQ

Dead-letter queue nije dovoljno ako niko ne prati/replay-uje.

---

# 116. POISON MESSAGE

Jedna loša poruka ne sme beskonačno blokirati consumer.

---

# 117. QUEUE BACKLOG

Operational alarm treba gledati:

- depth

- oldest age

---

# 118. WORKER AUTOSCALING

Ne skaliraj workers iznad downstream capacity-ja.

---

# 119. EXTERNAL SERVICES

Inventariši:

- payments

- email

- SMS

- auth

- AI

- storage

- analytics

---

# 120. HARD DEPENDENCY

Pitaj:

> Ako servis padne, da li ceo app pada?

---

# 121. OPTIONAL DEPENDENCY

Analytics failure ne bi trebalo da blokira checkout ako nije business-critical.

---

# 122. TIMEOUT

Svaki remote call treba bounded waiting.

---

# 123. RETRY

Mora biti operation-aware.

---

# 124. CIRCUIT BREAKER

Koristan za neke dependencies, ne univerzalno.

---

# 125. PROVIDER QUOTA

Autoscaling app ne povećava provider quota-u.

---

# 126. DNS

Audituj:

- authoritative provider

- records

- TTL

- ownership

- stale records

---

# 127. DANGLING DNS

Stari CNAME ka obrisanom cloud resource-u može biti subdomain takeover risk.

---

# 128. DOMAIN EXPIRY

Operational/security crown jewel.

---

# 129. DNSSEC

P4 hardening prema threat modelu.

Ne zahtevaj automatski.

---

# 130. TLS

Utvrdite gde terminira.

---

# 131. CERTIFICATE RENEWAL

Automatizovan/manual.

---

# 132. CERT EXPIRY

Jednostavan ali catastrophic outage scenario.

---

# 133. CUSTOM DOMAIN

Platform certificate automation može biti dovoljna.

---

# 134. ORIGIN TLS

Ako edge -> origin ide public network-om:

proveri transport trust.

---

# 135. LOAD BALANCER TLS

Correct cert/SNI/hostname.

---

# 136. NETWORK EXPOSURE

Inventariši public ports/services.

---

# 137. DATABASE PUBLIC INTERNET

Može biti acceptable uz strong controls, ali high-value review.

---

# 138. CACHE PUBLIC INTERNET

Usually dangerous.

---

# 139. MANAGEMENT PORT

Debug/metrics/admin port.

---

# 140. FIREWALL / SECURITY GROUP

Proveri actual rules.

---

# 141. `0.0.0.0/0`

Nije automatski bug ako port treba biti public.

Context je ključ.

---

# 142. EGRESS

App outbound access može biti veoma širok.

Relevantno za SSRF/post-compromise blast radius.

---

# 143. EGRESS RESTRICTION

Advanced hardening, ne blanket zahtev.

---

# 144. PRIVATE NETWORK

Ne pretpostavljaj da internal = safe.

---

# 145. SERVICE DISCOVERY

Stale endpoints/failure semantics.

---

# 146. NAT

Outbound connection limits/port exhaustion ako high concurrency.

---

# 147. IPV4 / IPV6

Security rules mogu pokrivati IPv4, a ne IPv6.

---

# 148. CDN

Audituj:

- cache rules

- origin exposure

- authenticated content

- invalidation

---

# 149. PRIVATE RESPONSE CACHE

Critical leakage risk.

---

# 150. ORIGIN BYPASS

CDN/WAF/rate-limit controls mogu biti zaobiđeni direktnim origin access-om.

---

# 151. WAF

Ne tretiraj kao root security kontrolu za application bugs.

---

# 152. RATE LIMIT

Edge limit + origin reachability.

---

# 153. SERVERLESS

Ako relevantno:

audituj:

- execution timeout

- memory

- concurrency

- cold start

- connection limits

- ephemeral storage

---

# 154. SERVERLESS MAX DURATION

Background work duže od function limit-a mora imati drugi execution model.

---

# 155. SERVERLESS RETRY

Platform može automatski retry-ovati events.

---

# 156. SERVERLESS CONCURRENCY

Burst može udariti DB/provider.

---

# 157. COLD START

Latency + dependency initialization storm.

---

# 158. FUNCTION ENV

Secrets/config versioning.

---

# 159. EDGE RUNTIME

Node APIs/filesystem/TCP možda nisu dostupni.

Proveri compatibility.

---

# 160. KUBERNETES

Ako ne postoji:

**NOT APPLICABLE**

Ako postoji:

nastavi detaljno.

---

# 161. REQUESTS / LIMITS

CPU/memory.

---

# 162. NO MEMORY LIMIT

Jedan pod može pojesti node memory.

---

# 163. LIMIT PRENIZAK

OOMKill loop.

---

# 164. CPU LIMIT

Throttling može povećati latency.

---

# 165. HPA

Metric mora odgovarati workload-u.

---

# 166. PDB

PodDisruptionBudget može zaštititi availability tokom voluntary disruptions.

Ne rešava node outage sam.

---

# 167. ANTI-AFFINITY

Ako sve replicas završe na istom node-u:

node failure obara sve.

---

# 168. MULTI-ZONE

Ako business zahteva.

---

# 169. NODE DRAIN

Graceful termination.

---

# 170. K8S ROLLING UPDATE

`maxUnavailable`, `maxSurge`.

---

# 171. READINESS PROBE

Critical za safe rollout.

---

# 172. LIVENESS PROBE

Ne sme izazivati cascade.

---

# 173. INIT CONTAINER

Failure može blokirati rollout.

---

# 174. JOB / CRONJOB

ConcurrencyPolicy/history/deadlines.

---

# 175. K8S SECRET

Base64 nije encryption.

---

# 176. SERVICE ACCOUNT

RBAC scope.

---

# 177. PRIVILEGED CONTAINER

Security audit cross-reference.

---

# 178. HOST MOUNTS

High-risk.

---

# 179. INGRESS

Routing/TLS/auth.

---

# 180. NETWORK POLICY

Defense-in-depth prema cluster modelu.

---

# 181. CONTAINER

Ako koristi Docker/container runtime:

audituj production image.

---

# 182. ROOT USER

Running as root increases container breakout/application exploit impact.

Severity according to threat.

---

# 183. READ-ONLY ROOT FILESYSTEM

Hardening gde compatible.

---

# 184. CAPABILITIES

Drop unnecessary Linux capabilities.

---

# 185. IMAGE SIZE

More packages = larger patch/attack surface, ali ne security finding samo po sebi.

---

# 186. DEBUG TOOLS U IMAGE-U

Shell/curl package može pomoći attacker-u post-compromise, ali primary fix je sprečiti compromise.

---

# 187. MULTI-STAGE BUILD

Smanjuje build tools/secrets u runtime image-u.

---

# 188. IMAGE TAG

Immutable deployment je lakši sa digest/versioned artifact-om.

---

# 189. `latest`

Teško je znati šta je zapravo deploy-ovano.

---

# 190. IMAGE VULNERABILITIES

Supply chain audit detaljnije.

---

# 191. LOGGING

Audituj:

- stdout

- files

- aggregation

- retention

- redaction

---

# 192. LOCAL LOG FILE

Može napuniti disk.

---

# 193. LOG ROTATION

Ako local logs postoje.

---

# 194. STRUCTURED LOGS

Olakšavaju operational analysis, ali nisu requirement za svaki mali sistem.

---

# 195. CORRELATION ID

Pomaže tracing-u multi-service flows.

---

# 196. SECRET REDACTION

Security audit cross-reference.

---

# 197. LOG LEVEL

Production debug logging može povećati:

- cost

- secret exposure

- noise

---

# 198. LOGGING FAILURE

Remote log service outage ne bi trebalo automatski da obori app.

---

# 199. METRICS

Minimum useful dimensions:

- throughput

- errors

- latency

- saturation

---

# 200. SLO

Ako nisu definisani:

**SLO NOT DEFINED**

Ne izmišljaj.

---

# 201. P50/P95/P99

Average latency nije dovoljna za tail problems.

---

# 202. ERROR RATE

Razlikuj:

- expected 4xx

- actual server failures

---

# 203. SATURATION

CPU nije jedina metrika.

Prati:

- memory

- DB pool

- queue

- disk

- connections

---

# 204. HIGH-CARDINALITY METRICS

User ID/URL raw params kao label mogu eksplodirati monitoring system.

---

# 205. TRACING

Useful za distributed systems.

Ne zahtevaj u trivijalnom monolith-u bez potrebe.

---

# 206. TRACE SAMPLING

Cost vs observability.

---

# 207. ALERTING

Alert treba predstavljati problem koji zahteva akciju.

---

# 208. ALERT ON CAUSE VS SYMPTOM

CPU 80% nije nužno incident.

User-visible errors/SLO burn često važniji.

---

# 209. ALERT FATIGUE

Previše noise-a ubija detection.

---

# 210. NO ALERT ON CRITICAL FAILURE

High-risk.

Primer:

- backup failing for weeks

- queue dead

- certificate expires

- DB storage almost full

---

# 211. DISK CAPACITY

Proveri:

- DB

- logs

- temp

- uploads

- queue

---

# 212. DISK FULL

Može izazvati:

- crashes

- DB corruption/failure

- inability to log

---

# 213. DATABASE STORAGE AUTOGROW

Managed DB može auto-grow, ali:

- max limit

- cost

- emergency behavior

---

# 214. OBJECT STORAGE COST

Unbounded upload/retention.

---

# 215. BANDWIDTH

Large downloads/uploads.

---

# 216. COST AUDIT

Ne fokusiraj se samo na mesečni bill.

Pronađi:

- accidental amplification

- unbounded usage

- idle resources

- overprovisioning

---

# 217. AUTOSCALING COST ATTACK

Attacker može povećati traffic i izazvati veliki cloud račun čak pre outage-a.

---

# 218. PROVIDER COST

SMS/email/AI APIs.

---

# 219. LOGGING COST

High-volume debug logs.

---

# 220. EGRESS COST

Cross-region / file downloads.

---

# 221. BUDGET ALERT

Operational safeguard, ne technical security fix.

---

# 222. QUOTAS

Cloud/provider quotas mogu biti hidden hard limits.

---

# 223. SERVICE QUOTA

Pitaj:

> Koji quota prvi puca pri 10x workload-u?

---

# 224. AUTOSCALING

Audituj:

- min

- max

- metric

- cooldown

- startup time

---

# 225. AUTOSCALING NIJE BESKONAČNO

Downstream limits.

---

# 226. SCALE TO ZERO

Može izazvati cold start.

Prihvatljivo za neke workloads.

---

# 227. MAX REPLICA

Kada se dosegne:

šta se dešava?

---

# 228. RESOURCE RESERVATION

Ako shared environment:

noisy-neighbor risk.

---

# 229. CAPACITY HEADROOM

Ne izmišljaj univerzalni procenat.

Koristi metrics/SLO/growth.

---

# 230. CHAOS / FAILURE TEST

Samo u controlled environment-u.

---

# 231. KILL ONE INSTANCE

Da li system nastavlja?

---

# 232. DATABASE LATENCY

Povećaj u test-u.

---

# 233. CACHE OUTAGE

---

# 234. QUEUE OUTAGE

---

# 235. THIRD-PARTY TIMEOUT

---

# 236. DNS FAILURE

---

# 237. STORAGE FAILURE

---

# 238. NETWORK PARTITION

Ako distributed architecture opravdava.

---

# 239. CLOCK

Time skew može uticati na:

- auth

- distributed leases

- certificates

Modern managed infra obično rešava NTP.

---

# 240. REGION OUTAGE

Ne zahtevaj multi-region ako business ne zahteva regional failover.

Ali dokumentuj current blast radius.

---

# 241. AVAILABILITY DOMAIN

Koji single failure domain obara ceo system?

---

# 242. SINGLE POINT OF FAILURE

Pronađi stvarne:

- one VM

- one DB

- one Redis

- one storage account

- one external provider

---

# 243. SPOF NIJE AUTOMATSKI BUG

Ako downtime tolerance dozvoljava.

---

# 244. BUSINESS CRITICALITY

Severity mora pratiti stvarni requirement.

---

# 245. DR PLAN

Postoji li documented disaster recovery plan?

---

# 246. RUNBOOK

Critical incidents treba da imaju praktične korake gde maturity zahteva.

---

# 247. BUS FACTOR

Operational knowledge samo kod jedne osobe je organizacioni risk.

Prijavi odvojeno od software bug-a.

---

# 248. ACCESS

Ko može menjati production infrastructure?

---

# 249. LEAST PRIVILEGE

Cloud/admin access.

---

# 250. SHARED ADMIN ACCOUNT

Smanjuje attribution.

---

# 251. MFA FOR CLOUD ADMIN

High-value hardening/control.

---

# 252. BREAK-GLASS

Ako postoji:

audituj protection i logging.

---

# 253. PRODUCTION DATABASE ACCESS

Developeri možda ne moraju imati direktan write access.

Ali zavisi od operational modela.

---

# 254. AUDIT TRAIL

Infrastructure changes:

- deployment

- secret change

- IAM

- DNS

- database config

---

# 255. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text

ID:

Severity:

Category:

Confidence:

Status:

Evidence tier:

Environment:

Component:

Provider/platform:

Region:

Failure domain:

Current configuration:

Trigger:

Failure scenario:

T0:

T1:

T2:

T3:

User-visible impact:

Data impact:

Availability impact:

Security impact:

Recovery impact:

Blast radius:

Current controls:

Why current controls are insufficient:

Evidence:

Root cause:

Recommended remediation:

Rollback/recovery considerations:

Validation test:

Production metric/alert:

Complexity:

XS / S / M / L / XL

```

---

# 256. SEVERITY

Koristi:

## P0 - CRITICAL

- realistic single failure vodi do unrecoverable/catastrophic data loss

- infrastructure configuration daje practical global production compromise

- production deploy/recovery mehanizam može sistemski uništiti critical state bez recovery-ja

- backup/recovery tvrdnja je potpuno lažna za critical data i realan catastrophic scenario postoji

## P1 - HIGH

- realistic single point failure izaziva veliki production outage protiv definisanog requirement-a

- staging/preview trust omogućava production compromise

- deployment strategy ima concrete high-probability outage/data corruption path

- critical backups postoje ali nisu usable/restorable

- autoscaling/deployment može iscrpeti shared DB i oboriti sistem

## P2 - MEDIUM

- significant reliability/operational weakness

- limited outage/data loss window

- important observability/recovery gap

- meaningful environment/config drift

## P3 - LOW

- limited operational weakness

- minor cost/config issue

- constrained failure case

## P4 - HARDENING

- maturity, automation, redundancy ili process improvement bez potvrđenog current production risk-a

---

# 257. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

---

# 258. STATUS

Koristi:

```text

CONFIRMED

LIKELY

THEORETICAL

NOT VERIFIED

```

---

# 259. EVIDENCE TIER

```text

A - reproduced or production telemetry

B - complete config/topology/failure path

C - strong infrastructure/code evidence

D - partial/inferred

E - general hardening

```

---

# 260. CATEGORY

Koristi:

```text

DEPLOYMENT

CONFIGURATION

COMPUTE

DATABASE

CACHE

QUEUE

STORAGE

NETWORK

DNS

TLS

AUTOSCALING

BACKUP

DISASTER RECOVERY

OBSERVABILITY

SECURITY

COST

KUBERNETES

SERVERLESS

CONTAINER

```

---

# 261. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. actual provider/platform

2. deployed environment

3. current config

4. topology

5. redundancy

6. provider-managed behavior

7. backup/recovery

8. autoscaling

9. business/SLO requirement

10. production evidence gde je dostupno

---

# 262. NE PRIJAVLJUJ SINGLE INSTANCE AUTOMATSKI KAO P1

Ako app sme da ima kratki downtime:

možda je sasvim racionalna arhitektura.

---

# 263. NE ZAHTEVAJ MULTI-REGION AUTOMATSKI

Multi-region uvodi veliku kompleksnost.

---

# 264. NE ZAHTEVAJ KUBERNETES AUTOMATSKI

PaaS/serverless/VM mogu biti bolji izbor.

---

# 265. NE ZAHTEVAJ TERRAFORM AUTOMATSKI

IaC je alat, ne cilj.

---

# 266. NE ZAHTEVAJ REDIS AUTOMATSKI

Ako nema stvarnog potrebe.

---

# 267. NE ZAHTEVAJ READ REPLICAS AUTOMATSKI

Bez read bottleneck-a nepotrebno.

---

# 268. NE ZAHTEVAJ BLUE/GREEN ZA SVAKI SISTEM

Deployment strategy treba pratiti risk i platformu.

---

# 269. NE TRETIRAJ MANAGED SERVICE KAO MAGIC

Managed service smanjuje operational burden, ali config/tier i dalje odlučuju behavior.

---

# 270. NE TRETIRAJ "BACKUP ENABLED" KAO DOKAZ RECOVERY-JA

Restore je dokaz.

---

# 271. NE TRETIRAJ "AUTOSCALING ENABLED" KAO DOKAZ SCALABILITY-JA

Shared bottlenecks ostaju.

---

# 272. NE MENJAJ INFRASTRUKTURU TOKOM AUDITA

Bez eksplicitnog odobrenja ne:

- deployuj

- scale-uj

- restartuj production

- menja DNS

- menja firewall

- menja secrets

- restore-uj backup

- briši resources

- menja IAM

Prvo završi audit.

---

# 273. OUTPUT - DEVOPS_INFRASTRUCTURE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- infrastructure model

- environments

- deployment model

- top production risks

- recovery posture

## 2. Infrastructure Architecture

## 3. Environment Isolation

## 4. Configuration Management

## 5. Compute / Runtime Audit

## 6. Statelessness / Local State Audit

## 7. Health / Readiness / Startup Audit

## 8. Deployment Strategy Audit

## 9. Migration / Schema Deployment Audit

## 10. Rollback Audit

## 11. Graceful Shutdown Audit

## 12. Database Infrastructure Audit

## 13. Cache Infrastructure Audit

## 14. Queue / Worker Infrastructure Audit

## 15. Storage Audit

## 16. Backup Audit

## 17. Restore Audit

## 18. Disaster Recovery Audit

## 19. External Dependency Resilience

## 20. Network / Firewall Audit

## 21. CDN / Load Balancer Audit

## 22. DNS / Domain Audit

## 23. TLS / Certificate Audit

## 24. Autoscaling Audit

## 25. Serverless Audit

Ako relevantno.

## 26. Kubernetes Audit

Ako relevantno.

## 27. Container Audit

Ako relevantno.

## 28. Logging Audit

## 29. Metrics / Tracing Audit

## 30. Alerting Audit

## 31. Capacity / Quota Audit

## 32. Cost Resilience Audit

## 33. Cloud/IAM Operational Audit

## 34. Failure Injection Findings

## 35. Findings Summary

| ID | Severity | Component | Category | Failure | Blast radius | Confidence |

|---|---|---|---|---|---|---|

## 36. P0 Findings

## 37. P1 Findings

## 38. P2 Findings

## 39. P3 Findings

## 40. P4 Hardening

## 41. Things Done Well

## 42. Not Applicable

## 43. Not Verified

## 44. Production Remediation Roadmap

---

# 274. INFRASTRUCTURE MATRIX

| Component | Provider | Region | Redundancy | Persistent | Critical |

|---|---|---|---|---|---|

---

# 275. ENVIRONMENT MATRIX

| Resource | Dev | Preview | Staging | Production | Shared |

|---|---|---|---|---|---|

---

# 276. FAILURE DOMAIN MATRIX

| Component | Failure | User impact | Data impact | Recovery |

|---|---|---|---|---|

---

# 277. BACKUP MATRIX

| Data | Backup | Frequency | Retention | PITR | Restore tested |

|---|---|---|---|---|---|

---

# 278. DEPLOYMENT MATRIX

| Component | Strategy | Mixed version | Rollback | Migration coupling |

|---|---|---|---|---|

---

# 279. OBSERVABILITY MATRIX

| Failure | Metric | Log | Alert | Runbook |

|---|---|---|---|---|

---

# 280. SECOND PASS - KILL ONE APPLICATION INSTANCE

U controlled environment-u proveri:

- user requests

- sessions

- uploads

- jobs

- WebSockets

---

# 281. SECOND PASS - FULL APPLICATION RESTART

Pitaj šta je izgubljeno.

---

# 282. SECOND PASS - DEPLOYMENT AT PEAK LOAD

Simuliraj mentalno ili testom:

```text

peak traffic

+

rolling deploy

```

Pitaj da li preostale instances imaju dovoljno capacity-ja.

---

# 283. SECOND PASS - FAILED DEPLOY AT 50%

Polovina fleet-a new, polovina old.

Proveri API/schema/job compatibility.

---

# 284. SECOND PASS - ROLLBACK

Vrati prethodni artifact u staging/test-u.

Proveri:

- DB

- config

- jobs

- assets

---

# 285. SECOND PASS - DATABASE FAILOVER

Ako platforma podržava test:

proveri reconnect/recovery.

Ako ne:

analiziraj documented behavior/config.

---

# 286. SECOND PASS - DB CONNECTION STORM

Simuliraj app autoscale od:

```text

1 -> 10 -> max

```

Izračunaj total connection budget.

---

# 287. SECOND PASS - CACHE DOWN

Pitaj:

- app radi?

- DB preživljava?

- sessions?

- locks?

---

# 288. SECOND PASS - QUEUE DOWN

Pitaj:

- request failuje

- job se gubi

- local buffer raste

---

# 289. SECOND PASS - STORAGE DOWN

Pitaj:

- upload

- download

- app startup

- critical path

---

# 290. SECOND PASS - THIRD-PARTY 30s LATENCY

Proveri:

- timeouts

- worker threads

- retries

- cascade

---

# 291. SECOND PASS - CERTIFICATE EXPIRY

Utvrdi:

- renewal owner

- automation

- monitoring

---

# 292. SECOND PASS - DOMAIN/DNS CHANGE

Pitaj:

- TTL

- rollback

- old records

- certificate

---

# 293. SECOND PASS - DISK 95%

Za persistent disk/DB:

pitanje je da li postoji:

- alert

- auto growth

- cleanup

- emergency response

---

# 294. SECOND PASS - BACKUP RESTORE

Najvažniji test.

U izolovanom environment-u:

```text

backup

↓

restore

↓

application connect

↓

integrity validation

```

---

# 295. SECOND PASS - ACCIDENTAL TABLE DELETE

Pitaj:

> Koji tačan recovery path postoji?

---

# 296. SECOND PASS - BAD MIGRATION

Pitaj:

- rollback

- PITR

- forward fix

- downtime

---

# 297. SECOND PASS - STAGING COMPROMISE

Pitaj šta može dosegnuti u production-u.

---

# 298. SECOND PASS - PROVIDER QUOTA

Za svaki managed/provider service pronađi hard quota relevantan za workload.

---

# 299. SECOND PASS - REGION/AZ FAILURE

Ako system tvrdi HA:

proveri da replicas/data zaista prelaze failure domain.

---

# 300. SECOND PASS - OBSERVABILITY OUTAGE

Ako monitoring/logging padne:

da li application nastavlja?

---

# 301. SECOND PASS - LOG STORM

Simuliraj high error volume.

Pitaj:

- disk

- ingestion

- cost

- app latency

---

# 302. SECOND PASS - AUTOSCALING MAX

Povećaj workload do max replicas.

Pitaj koji sledeći bottleneck puca.

---

# 303. SECOND PASS - INSTANCE STARTUP STORM

Sve instances restartuju istovremeno.

Prati:

- DB

- cache

- provider

- migrations

---

# 304. SECOND PASS - BACKUP CREDENTIAL COMPROMISE

Pitaj da li isti identity može:

```text

delete production

+

delete all backups

```

Ako da:

recovery blast radius je velik.

---

# 305. SECOND PASS - EXPENSIVE ABUSE

Jedan korisnik/attacker izaziva:

- autoscale

- SMS/email spend

- egress

- logs

Proceni cost guardrails.

---

# 306. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- actual platform/provider je identifikovan

- environment-i su mapirani

- production i staging isolation je proverena

- ephemeral/local state je pronađen

- startup/readiness behavior je analiziran

- deployment strategy odgovara stvarnoj platformi

- mixed-version period je uzet u obzir

- migrations su analizirane zajedno sa rollout/rollback-om

- rollback nije sveden na Git revert

- graceful shutdown je proveravan

- DB connection budget uključuje autoscaling

- managed DB HA nije pretpostavljena bez tier/config dokaza

- cache/queue failure semantics su poznate

- backups imaju restore analizu

- RPO/RTO nisu izmišljeni

- DNS/TLS/domain expiry su uključeni

- direct-origin/CDN/WAF boundary je analiziran

- quotas su uključene

- autoscaling ne ignoriše downstream capacity

- logging/monitoring nisu posmatrani samo kroz "da li postoje"

- alerti su vezani za stvarne failure modes

- cost amplification je uključena

- single points of failure su rangirani prema stvarnom business requirement-u

- Kubernetes/multi-region/Terraform nisu preporučeni iz navike

- svaki P0/P1 ima konkretan production failure path

- P4 operational maturity stavke su jasno odvojene od current production bugs

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite Kubernetes, autoscaling, Terraform, multi-region i monitoring.

To nije DevOps & Infrastructure Audit.

Tražim probleme poput:

```text

production:

10 app instances

each:

DB pool = 30

↓

maximum possible connections:

300

DB plan:

max 200

↓

traffic spike causes autoscaling

↓

new instances open more connections

↓

DB rejects connections

↓

autoscaling makes outage worse

```

ili:

```text

application writes user uploads to:

/tmp/uploads

↓

platform filesystem is ephemeral

↓

instance restart/redeploy

↓

metadata remains in database

↓

actual files disappear

↓

permanent user data loss

```

ili:

```text

every application replica runs:

migrate-on-startup

↓

rolling deploy starts 20 replicas

↓

multiple migration attempts race

↓

DDL lock blocks application queries

↓

readiness checks fail

↓

deployment cascade

```

ili:

```text

backup:

enabled daily

↓

no restore test ever performed

↓

disaster occurs

↓

latest backup requires missing encryption key

↓

backup cannot be restored

↓

"backup enabled" provided false confidence

```

ili:

```text

CDN protects public domain with WAF and rate limiting

↓

backend origin also has public hostname

↓

origin accepts direct traffic

↓

attacker bypasses CDN

↓

WAF and edge rate limits disappear

```

ili:

```text

production deployment:

new code requires new NOT NULL column

↓

migration executes first

↓

old replicas still serve traffic

↓

old code inserts rows without column value

↓

requests fail during rolling deployment

```

ili:

```text

critical jobs stored only in process memory

↓

deployment sends SIGTERM

↓

process exits

↓

queued in-memory work disappears

↓

users have successful API acknowledgements

↓

business action never occurs

```

ili:

```text

production DB and backups use same cloud admin identity

↓

credential compromised

↓

attacker deletes production DB

↓

same credential deletes backups

↓

recovery path disappears

```

ili:

```text

certificate renewal is manual

↓

no expiry alert

↓

certificate expires Saturday night

↓

all HTTPS traffic fails

↓

application code and infrastructure remain healthy

↓

complete public outage

```

To su DevOps i infrastructure problemi koje treba da pronađeš.

Razmišljaj kroz:

- source

- artifact

- configuration

- deployment

- runtime

- state

- network

- dependencies

- data

- failure

- detection

- recovery

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji konkretan infrastructure component je problem?

> Koji događaj aktivira failure?

> Da li je failure realistic u trenutnom deployment-u?

> Koliki je blast radius?

> Da li gubimo samo availability ili i data?

> Kako sistem detektuje problem?

> Kako se vraća u normalno stanje?

> Da li je recovery ikada stvarno testiran?

> Da li predložena promena zaista rešava root cause ili samo dodaje infrastructure complexity?

Ako production topology nije potvrđena:

**PRODUCTION TOPOLOGY NOT VERIFIED.**

Ako SLO/RPO/RTO nisu definisani:

**REQUIREMENT NOT DEFINED.**

Ako backup postoji ali restore nije potvrđen:

**RECOVERABILITY NOT VERIFIED.**

Ako je samo maturity poboljšanje bez potvrđenog production failure path-a:

**P4 - HARDENING.**

Bolje je pronaći 10 stvarnih infrastructure failure path-ova sa preciznim recovery posledicama nego napisati 200 generičkih DevOps saveta.

Cilj je dobiti forenzički precizan sveobuhvatni DevOps i infrastrukturni audit koji se može direktno pretvoriti u:

- deployment hardening

- migration safety plan

- rollback strategy

- backup/restore testing

- environment isolation

- autoscaling guardrails

- infrastructure monitoring

- disaster-recovery plan

- production reliability roadmap
