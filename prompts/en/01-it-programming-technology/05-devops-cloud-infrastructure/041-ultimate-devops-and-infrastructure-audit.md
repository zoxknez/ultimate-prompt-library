---
id: UPL-IT-041
number: 41
slug: ultimate-devops-and-infrastructure-audit
title: Ultimate DevOps & Infrastructure Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.0.0
status: stable
---

# ULTIMATE DEVOPS AND INFRASTRUCTURE AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the entire DevOps, cloud, and infrastructure layer of the project.

Main objective:

> Determine whether deployment, infrastructure, environment configuration, compute, networking, secrets, storage, DNS, observability, backups, autoscaling, release processes, and operational procedures can cause outages, data loss, security incidents, deployment failures, environment drift, rollback failures, or severe production degradation.

This is not:

- a generic DevOps checklist

- automatically demanding Kubernetes

- automatically demanding Terraform

- automatically demanding microservices

- automatically switching to multi-region

- automatically scaling replicas

- automatically adding Redis

- merely a CI/CD audit

- merely a cloud security audit

- merely a cost optimization audit

- advising that everything should be "containerized"

- a blanket demand for 99.999% availability

The focus is on the entire production chain:

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

Priority:

**data loss > production outage > security boundary failure > irreversible deployment > configuration drift > shared infrastructure bottleneck > recovery failure > observability gaps > cost inefficiency > hardening**

It is better to identify 10 genuine production failure paths than to write 200 generic cloud recommendations.

---

# 1. ESTABLISH ACTUAL INFRASTRUCTURE

Prior to generating findings, map:

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

If something is not accessible:

**NOT VERIFIED**

---

# 2. DO NOT INVENT COMPONENTS

If the project uses Vercel + managed Postgres:

do not draft Kubernetes recommendations without justification.

If it utilizes a single VM:

analyze that specific architecture.

---

# 3. BUILD AN INFRASTRUCTURE MAP

Example:

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

Incorporate genuine components.

---

# 4. INVENTORY ENVIRONMENTS

Map:

```text
development

test

preview

staging

production
```

---

# 5. ENVIRONMENT ISOLATION

For each environment verify:

- credentials

- database

- storage

- queues

- domains

- provider accounts

- secrets

---

# 6. STAGING -> PRODUCTION PIVOT

Look for shared:

- signing secret

- DB credentials

- storage key

- API key

- service account

---

# 7. PREVIEW ENVIRONMENT

Specifically verify whether preview deployments receive production secrets.

---

# 8. ENVIRONMENT NAMING

Do not rely solely on:

```text
NODE_ENV
```

if the platform employs additional environment concepts.

---

# 9. CONFIGURATION SOURCE

Determine where configuration originates:

- env

- config files

- secret manager

- database

- platform settings

- runtime flags

---

# 10. CONFIG PRECEDENCE

Example:

```text
defaults

↓

config file

↓

environment

↓

CLI
```

Must be unambiguously defined.

---

# 11. DEFAULT CONFIG

Look for unsafe fallbacks:

```text
DB_SSL=false

AUTH_DISABLED=true

SECRET=changeme
```

---

# 12. MISSING CONFIG

Critical configuration must not silently receive insecure default values.

---

# 13. FAIL FAST

If production lacks:

- DB URL

- signing secret

- encryption key

the application should fail loudly and immediately where appropriate.

---

# 14. CONFIG DRIFT

Compare:

```text
repo

CI

staging

production
```

---

# 15. MANUAL CLICKOPS

Manual cloud modifications are not automatically an issue.

However, they can introduce drift that remains invisible in the repository.

---

# 16. INFRASTRUCTURE AS CODE

If present:

- Terraform

- Pulumi

- CloudFormation

- Bicep

- CDK

- Helm

- Kubernetes YAML

audit the actual state against the declared state where feasible.

---

# 17. IaC IS NOT MANDATORY

Do not report the absence of Terraform as a vulnerability.

---

# 18. STATE FILE

If using Terraform:

verify:

- storage

- access

- locking

- secrets

---

# 19. DRIFT DETECTION

If IaC exists:

the question is whether manual modifications remain undetected.

---

# 20. COMPUTE MODEL

Determine:

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

Can an instance terminate or vanish at any moment?

If yes:

local state is not durable.

---

# 22. LOCAL DISK

Check whether the application retains:

- uploads

- jobs

- sessions

- cache

- generated files

on an ephemeral filesystem.

---

# 23. EPHEMERAL FILESYSTEM

Serverless/PaaS restarts can destroy data.

---

# 24. INSTANCE RESTART

Simulate:

```text
kill instance
```

in a test environment.

Ask what is lost.

---

# 25. STATELESSNESS

Horizontal scaling is simpler if application state is decoupled from individual instances.

---

# 26. STICKY SESSION

If present:

verify:

- failover

- uneven load distribution

- session loss

---

# 27. IN-MEMORY SESSION

A restart can log out active users.

This may be acceptable or severe depending on product requirements.

---

# 28. IN-MEMORY JOB

If critical work exists exclusively in RAM:

an instance crash results in lost jobs.

---

# 29. LOCAL CRON

Horizontally scaled replicas may execute the same cron task multiple times.

---

# 30. SINGLE INSTANCE ASSUMPTION

Search code and configuration for logic presuming:

```text
only one server exists
```

---

# 31. APPLICATION REPLICAS

Determine:

- min

- max

- desired

- autoscaling

---

# 32. SINGLE INSTANCE PRODUCTION

Not automatically a flaw.

However, it entails:

- no compute redundancy

- restart downtime

Evaluate against SLO and business requirements.

---

# 33. LOAD BALANCER

If present:

verify:

- health checks

- connection behavior

- session affinity

- timeout

---

# 34. HEALTH CHECK

A health endpoint must not simply:

```text
return 200
```

if the application is not actually functional.

---

# 35. LIVENESS VS READINESS

If the platform differentiates between:

- liveness

- readiness

verify their individual semantics.

---

# 36. READINESS

A new instance must not receive inbound traffic prior to:

- config load

- migrations dependency readiness

- critical initialization

---

# 37. LIVENESS LOOP

A defective liveness check can restart a slow but healthy service, causing a crash loop.

---

# 38. DEPENDENCY HEALTH

Do not probe every downstream dependency on every liveness ping if that makes the health check a source of outages.

---

# 39. STARTUP

Map:

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

If every replica runs migrations concurrently:

race conditions and lock contention arise.

---

# 41. MIGRATION RUNNER

Determine whether migrations are executed by:

- each application instance

- a distinct deployment step

- a singleton job

---

# 42. DESTRUCTIVE MIGRATION

Look for:

- DROP

- rename

- type change

- not-null

- data rewrite

---

# 43. ZERO-DOWNTIME COMPATIBILITY

Old and new application versions may run concurrently for brief intervals.

The database schema must tolerate a mixed-version period where rollouts operate that way.

---

# 44. EXPAND-CONTRACT

For breaking schema modifications evaluate the necessity of:

```text
expand

deploy

migrate

contract
```

---

# 45. LARGE TABLE MIGRATION

A query taking 2 seconds in development can lock a production table for hours.

---

# 46. BACKFILL

Do not execute massive backfills as blocking migrations without prior analysis.

---

# 47. MIGRATION ROLLBACK

Ask:

> Does rolling back the application code work following a schema migration?

---

# 48. IRREVERSIBLE MIGRATION

If not:

the deployment must have a specialized recovery plan.

---

# 49. DEPLOYMENT STRATEGY

Determine:

- rolling

- blue/green

- canary

- recreate

- serverless atomic-like deploy

---

# 50. ROLLING DEPLOY

Mixed versions in flight.

---

# 51. BLUE/GREEN

Ask:

- data compatibility

- background workers

- duplicated jobs

---

# 52. CANARY

Useful only if metrics and automated rollback decision criteria exist.

---

# 53. ATOMIC DEPLOYMENT

Frontend and backend may not be deployed simultaneously.

---

# 54. CLIENT/BACKEND COMPATIBILITY

Old browser or mobile clients may remain active for extended periods.

---

# 55. API BACKWARD COMPATIBILITY

Deployments must not abruptly break existing clients without intent.

---

# 56. FEATURE FLAG

Can decouple code deployment from feature activation.

---

# 57. FEATURE FLAG FAILURE

A stale or missing flag must not trigger an unsafe default state.

---

# 58. DARK LAUNCH

Can mitigate rollout risk for resource-intensive features.

Do not prescribe generically.

---

# 59. ROLLBACK

Must be genuinely viable, not merely:

```text
git revert
```

---

# 60. ARTIFACT ROLLBACK

Does the previous immutable artifact remain accessible?

---

# 61. CONFIG ROLLBACK

An older application binary may require older configuration values.

---

# 62. DATABASE ROLLBACK

Frequently the most complex recovery challenge.

---

# 63. EXTERNAL SIDE EFFECT

A deployment rollback cannot undo:

- sent emails

- payment transactions

- data deletions

---

# 64. FAILED DEPLOY

Ask what happens if deployment halts at 50%.

---

# 65. MIXED FLEET

Half old version, half new version.

---

# 66. JOB WORKER VERSION

Queues may contain jobs emitted by older code that must be processed by newer code.

---

# 67. JOB SCHEMA COMPATIBILITY

Payload versioning where required.

---

# 68. SCHEDULED JOB DURING DEPLOY

Can execute old and new logic concurrently.

---

# 69. CONNECTION DRAINING

An instance undergoing termination must finish or cleanly terminate:

- HTTP requests

- jobs

- WebSockets

---

# 70. GRACEFUL SHUTDOWN

Audit:

- SIGTERM

- server close

- queue consumption stop

- timeout

---

# 71. HARD KILL

What occurs if the host platform forcibly terminates the process?

Critical operations must have recovery mechanisms.

---

# 72. LONG REQUEST

A deployment can interrupt:

- uploads

- exports

- streams

- payments

---

# 73. WEBSOCKET DEPLOY

Connections will be severed.

Evaluate client reconnection behavior.

---

# 74. DATABASE

Determine:

- managed vs self-hosted

- primary

- replicas

- backups

- failover

---

# 75. SINGLE DB

Scaling application replicas does not provide database high availability.

---

# 76. DB MULTI-AZ

If a managed service advertises HA:

verify the actual provisioned tier.

---

# 77. DB FAILOVER

Ask:

- connection interruption

- DNS propagation

- reconnection logic

- in-flight transaction outcome

---

# 78. CONNECTION POOL

Total:

```text
instances × pool size
```

must fit within database connection limits.

---

# 79. AUTOSCALING CONNECTION STORM

Application scale-out can exhaust database connections and crash the database.

---

# 80. SERVERLESS + DB

High numbers of concurrent functions directly querying databases is high-risk.

---

# 81. CONNECTION PROXY

If present:

verify semantics; do not assume it resolves all connection issues.

---

# 82. LONG TRANSACTION

Can stall failover, block migrations, and hold locks indefinitely.

---

# 83. READ REPLICA

If present:

verify replication lag.

---

# 84. READ-AFTER-WRITE

Critical user flows may need to read directly from the primary.

---

# 85. BACKUP

Do not merely ask:

> Does a backup exist?

Ask:

> Has a restore ever been successfully tested?

---

# 86. BACKUP FREQUENCY

Do not invent an RPO.

Derive it from business requirements if defined.

---

# 87. RETENTION

Map retention policies.

---

# 88. OFFSITE / SEPARATE FAILURE DOMAIN

A backup stored on the identical host or cloud account shares failure modes.

---

# 89. BACKUP CREDENTIAL

Ransomware or compromised cloud admin credentials can delete backups as well.

---

# 90. IMMUTABLE BACKUP

May be warranted for mission-critical data.

Do not prescribe universally.

---

# 91. RESTORE TEST

Document:

```text
latest tested restore

restore duration

data validation
```

if accessible.

---

# 92. BACKUP WITHOUT RESTORE TEST

This represents only assumed recoverability.

---

# 93. RPO

If product requirements exist:

compare backup and log replication against them.

If none exist:

**RPO REQUIREMENT NOT DEFINED**

---

# 94. RTO

Likewise.

---

# 95. POINT-IN-TIME RECOVERY

If the database engine supports it:

verify whether it is enabled and configured.

---

# 96. ACCIDENTAL DELETE

Recovery scenario.

---

# 97. BAD MIGRATION

Recovery scenario.

---

# 98. APPLICATION BUG CORRUPTION

Backups may contain already corrupted records.

---

# 99. BACKUP VERSION HISTORY

Required to restore state before the corruption window began.

---

# 100. OBJECT STORAGE

Audit:

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

Can aid recovery from accidental overwrites or deletions.

---

# 103. LIFECYCLE RULE

Must not prematurely delete critical data.

---

# 104. STORAGE CLASS

Cold archive storage can have extended restore retrieval times.

Factor into RTO.

---

# 105. LOCAL FILE BACKUP

If the application utilizes local persistent volumes:

are they backed up?

---

# 106. CACHE

Determine whether the cache is:

- disposable

- authoritative

- session store

- lock store

- queue

---

# 107. CACHE FAILURE

If Redis crashes:

what happens?

---

# 108. CACHE AS DATABASE

If the only copy of critical state exists inside the cache:

high-risk.

---

# 109. CACHE PERSISTENCE

If Redis employs persistent storage:

verify recovery semantics.

---

# 110. CACHE COLD START

The database must be able to withstand the cache miss storm.

---

# 111. QUEUE

Audit:

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

If the message broker restarts:

do messages survive?

---

# 114. QUEUE STORAGE

Disk capacity and retention policies.

---

# 115. DLQ

A dead-letter queue is insufficient if nobody monitors or replays it.

---

# 116. POISON MESSAGE

A single malformed message must not permanently stall the consumer.

---

# 117. QUEUE BACKLOG

Operational alerting must track:

- depth

- oldest age

---

# 118. WORKER AUTOSCALING

Do not scale workers beyond downstream capacity limits.

---

# 119. EXTERNAL SERVICES

Inventory:

- payments

- email

- SMS

- auth

- AI

- storage

- analytics

---

# 120. HARD DEPENDENCY

Ask:

> If this service fails, does the entire application collapse?

---

# 121. OPTIONAL DEPENDENCY

Analytics failure should not block checkout if not business-critical.

---

# 122. TIMEOUT

Every remote call must enforce bounded waiting.

---

# 123. RETRY

Must be operation-aware.

---

# 124. CIRCUIT BREAKER

Useful for select dependencies, not universally.

---

# 125. PROVIDER QUOTA

An autoscaling application does not automatically expand upstream provider quotas.

---

# 126. DNS

Audit:

- authoritative provider

- records

- TTL

- ownership

- stale records

---

# 127. DANGLING DNS

An old CNAME pointing to a deleted cloud resource can represent subdomain takeover risk.

---

# 128. DOMAIN EXPIRY

Operational and security crown jewel.

---

# 129. DNSSEC

P4 hardening based on threat model.

Do not demand automatically.

---

# 130. TLS

Determine where TLS terminates.

---

# 131. CERTIFICATE RENEWAL

Automated vs manual.

---

# 132. CERT EXPIRY

A simple yet catastrophic outage scenario.

---

# 133. CUSTOM DOMAIN

Platform-level certificate automation may suffice.

---

# 134. ORIGIN TLS

If edge-to-origin traffic traverses public networks:

verify transport trust.

---

# 135. LOAD BALANCER TLS

Correct cert/SNI/hostname.

---

# 136. NETWORK EXPOSURE

Inventory public ports and exposed services.

---

# 137. DATABASE PUBLIC INTERNET

May be acceptable under strict controls, but warrants high-scrutiny review.

---

# 138. CACHE PUBLIC INTERNET

Usually dangerous.

---

# 139. MANAGEMENT PORT

Debug/metrics/admin ports.

---

# 140. FIREWALL / SECURITY GROUP

Verify actual rules.

---

# 141. `0.0.0.0/0`

Not automatically a bug if the port is meant to be public.

Context is essential.

---

# 142. EGRESS

Application outbound access can be excessively broad.

Relevant for SSRF and post-compromise blast radius.

---

# 143. EGRESS RESTRICTION

Advanced hardening, not a blanket demand.

---

# 144. PRIVATE NETWORK

Do not assume internal equals safe.

---

# 145. SERVICE DISCOVERY

Stale endpoints and failure semantics.

---

# 146. NAT

Outbound connection limits and port exhaustion under high concurrency.

---

# 147. IPV4 / IPV6

Security rules may protect IPv4 while neglecting IPv6.

---

# 148. CDN

Audit:

- cache rules

- origin exposure

- authenticated content

- invalidation

---

# 149. PRIVATE RESPONSE CACHE

Critical data leakage risk.

---

# 150. ORIGIN BYPASS

CDN, WAF, and rate-limiting controls can be bypassed via direct origin access.

---

# 151. WAF

Do not treat as a root security control for application bugs.

---

# 152. RATE LIMIT

Edge limits combined with origin reachability.

---

# 153. SERVERLESS

If relevant:

audit:

- execution timeout

- memory

- concurrency

- cold start

- connection limits

- ephemeral storage

---

# 154. SERVERLESS MAX DURATION

Background work exceeding function timeout limits requires an alternative execution model.

---

# 155. SERVERLESS RETRY

The platform may automatically retry asynchronous events.

---

# 156. SERVERLESS CONCURRENCY

Bursts can overwhelm databases and upstream providers.

---

# 157. COLD START

Latency spike plus dependency initialization storm.

---

# 158. FUNCTION ENV

Secrets and configuration versioning.

---

# 159. EDGE RUNTIME

Node APIs, local filesystems, and raw TCP sockets may be unavailable.

Verify runtime compatibility.

---

# 160. KUBERNETES

If not present:

**NOT APPLICABLE**

If present:

proceed in detail.

---

# 161. REQUESTS / LIMITS

CPU and memory allocations.

---

# 162. NO MEMORY LIMIT

A single runaway pod can exhaust all node memory.

---

# 163. LIMIT TOO LOW

OOMKill crash loop.

---

# 164. CPU LIMIT

Throttling can severely degrade latency.

---

# 165. HPA

Autoscaling metrics must correspond to actual workload behavior.

---

# 166. PDB

PodDisruptionBudget can safeguard availability during voluntary disruptions.

Does not resolve underlying node hardware outages alone.

---

# 167. ANTI-AFFINITY

If all replicas land on the same node:

node failure takes down the entire application.

---

# 168. MULTI-ZONE

If business requirements demand zone resilience.

---

# 169. NODE DRAIN

Graceful termination workflows.

---

# 170. K8S ROLLING UPDATE

`maxUnavailable`, `maxSurge`.

---

# 171. READINESS PROBE

Critical for safe rolling updates.

---

# 172. LIVENESS PROBE

Must not trigger cascading restarts across the cluster.

---

# 173. INIT CONTAINER

Failure can block rollouts indefinitely.

---

# 174. JOB / CRONJOB

ConcurrencyPolicy, history limits, and execution deadlines.

---

# 175. K8S SECRET

Base64 encoding is not encryption.

---

# 176. SERVICE ACCOUNT

RBAC scope minimization.

---

# 177. PRIVILEGED CONTAINER

Security audit cross-reference.

---

# 178. HOST MOUNTS

High-risk architectural pattern.

---

# 179. INGRESS

Routing, TLS termination, and authentication.

---

# 180. NETWORK POLICY

Defense-in-depth matched to the cluster security model.

---

# 181. CONTAINER

If using Docker or container runtimes:

audit the production image.

---

# 182. ROOT USER

Running as root escalates container breakout and exploit severity.

Severity assessed according to threat exposure.

---

# 183. READ-ONLY ROOT FILESYSTEM

Hardening where workload compatible.

---

# 184. CAPABILITIES

Drop unnecessary Linux capabilities.

---

# 185. IMAGE SIZE

More packages equal larger patch and attack surface, but is not a security finding by itself.

---

# 186. DEBUG TOOLS IN IMAGE

Shell and curl packages can assist attackers post-compromise, but primary remediation is preventing compromise.

---

# 187. MULTI-STAGE BUILD

Reduces build tooling and credentials inside runtime images.

---

# 188. IMAGE TAG

Immutable deployments are more reliable with digest-pinned or strictly versioned artifacts.

---

# 189. `latest`

Makes it difficult to determine what code is actually deployed.

---

# 190. IMAGE VULNERABILITIES

Supply chain audit handles in greater depth.

---

# 191. LOGGING

Audit:

- stdout

- files

- aggregation

- retention

- redaction

---

# 192. LOCAL LOG FILE

Can exhaust host disk space.

---

# 193. LOG ROTATION

If local logs exist.

---

# 194. STRUCTURED LOGS

Facilitate operational analysis, but are not a mandatory requirement for simple systems.

---

# 195. CORRELATION ID

Aids tracing across distributed multi-service flows.

---

# 196. SECRET REDACTION

Security audit cross-reference.

---

# 197. LOG LEVEL

Production debug logging can increase:

- cost

- secret exposure

- noise

---

# 198. LOGGING FAILURE

Remote logging infrastructure outages should not automatically crash the application.

---

# 199. METRICS

Minimum useful dimensions:

- throughput

- errors

- latency

- saturation

---

# 200. SLO

If not defined:

**SLO NOT DEFINED**

Do not invent.

---

# 201. P50/P95/P99

Average latency is insufficient for detecting tail performance degradation.

---

# 202. ERROR RATE

Distinguish between:

- expected 4xx client errors

- actual server failures

---

# 203. SATURATION

CPU is not the sole saturation metric.

Track:

- memory

- DB pool

- queue

- disk

- connections

---

# 204. HIGH-CARDINALITY METRICS

Using user IDs or unvalidated raw URL query parameters as metric labels can crash monitoring systems.

---

# 205. TRACING

Valuable for distributed topologies.

Do not mandate inside simple monolithic architectures without necessity.

---

# 206. TRACE SAMPLING

Balance cost against observability fidelity.

---

# 207. ALERTING

An alert must signify an actionable incident requiring human intervention.

---

# 208. ALERT ON CAUSE VS SYMPTOM

80% CPU utilization is not inherently an incident.

User-facing errors and SLO error-budget burn are frequently more meaningful.

---

# 209. ALERT FATIGUE

Excessive noise degrades incident detection.

---

# 210. NO ALERT ON CRITICAL FAILURE

High-risk condition.

Examples:

- backup failing for weeks

- queue consumer stalled

- certificate nearing expiration

- DB storage nearly exhausted

---

# 211. DISK CAPACITY

Audit:

- DB

- logs

- temp

- uploads

- queue

---

# 212. DISK FULL

Can trigger:

- application crashes

- database corruption or failure

- inability to write logs

---

# 213. DATABASE STORAGE AUTOGROW

Managed databases may support autogrowth, but verify:

- hard maximum ceiling

- cost implications

- emergency failure behavior

---

# 214. OBJECT STORAGE COST

Unbounded upload volume and lack of retention lifecycle policies.

---

# 215. BANDWIDTH

High-volume downloads and unthrottled uploads.

---

# 216. COST AUDIT

Do not look solely at the monthly invoice.

Identify:

- accidental cost amplification

- unbounded resource usage

- idle assets

- excessive overprovisioning

---

# 217. AUTOSCALING COST ATTACK

An attacker can drive traffic to inflict massive cloud billing spikes prior to triggering outages.

---

# 218. PROVIDER COST

SMS, email, and external AI APIs.

---

# 219. LOGGING COST

Excessive production debug logs.

---

# 220. EGRESS COST

Cross-region transfers and public asset downloads.

---

# 221. BUDGET ALERT

An operational safeguard, not a technical security mitigation.

---

# 222. QUOTAS

Cloud and SaaS provider quotas can form hidden hard ceilings.

---

# 223. SERVICE QUOTA

Ask:

> Which quota breaks first under a 10x workload spike?

---

# 224. AUTOSCALING

Audit:

- min

- max

- metric

- cooldown

- startup time

---

# 225. AUTOSCALING IS NOT INFINITE

Constrained by downstream dependency limits.

---

# 226. SCALE TO ZERO

Can trigger cold-start latency.

Acceptable for select background workloads.

---

# 227. MAX REPLICA

When the ceiling is reached:

what happens to incoming traffic?

---

# 228. RESOURCE RESERVATION

In shared hosting environments:

noisy-neighbor risks.

---

# 229. CAPACITY HEADROOM

Do not mandate an arbitrary percentage.

Base headroom on real metrics, SLOs, and historical growth.

---

# 230. CHAOS / FAILURE TEST

Execute strictly in controlled environments.

---

# 231. KILL ONE INSTANCE

Does the system maintain continuous availability?

---

# 232. DATABASE LATENCY

Inject latency during testing.

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

If the distributed architecture justifies testing.

---

# 239. CLOCK

Time drift can compromise:

- auth tokens

- distributed lease acquisitions

- TLS certificates

Modern managed infrastructure typically handles NTP.

---

# 240. REGION OUTAGE

Do not demand multi-region deployment unless business requirements dictate regional failover.

However, document the existing blast radius.

---

# 241. AVAILABILITY DOMAIN

Which single failure domain takes down the entire system?

---

# 242. SINGLE POINT OF FAILURE

Identify genuine SPOFs:

- one VM

- one DB

- one Redis

- one storage account

- one external provider

---

# 243. SPOF IS NOT AUTOMATICALLY A BUG

If downtime tolerance permits it.

---

# 244. BUSINESS CRITICALITY

Severity must correspond to actual business requirements.

---

# 245. DR PLAN

Does a documented disaster recovery plan exist?

---

# 246. RUNBOOK

Critical incidents must have actionable recovery runbooks where operational maturity requires it.

---

# 247. BUS FACTOR

Operational expertise confined to a single individual is an organizational risk.

Report separately from software flaws.

---

# 248. ACCESS

Who possesses authority to modify production infrastructure?

---

# 249. LEAST PRIVILEGE

Cloud and administrative access controls.

---

# 250. SHARED ADMIN ACCOUNT

Degrades accountability and audit attribution.

---

# 251. MFA FOR CLOUD ADMIN

High-value operational control.

---

# 252. BREAK-GLASS

If break-glass procedures exist:

audit protection and logging mechanisms.

---

# 253. PRODUCTION DATABASE ACCESS

Developers should generally not require direct write privileges.

Dependent upon organizational operational models.

---

# 254. AUDIT TRAIL

Track infrastructure changes:

- deployment

- secret change

- IAM

- DNS

- database config

---

# 255. FINDING FORMAT

Every serious finding must include:

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

Use:

## P0 - CRITICAL

- a realistic single failure leads to unrecoverable or catastrophic data loss

- infrastructure configuration enables a practical global production compromise

- production deployment or recovery mechanisms can systematically destroy critical state without recovery paths

- backup and recovery claims are demonstrably false for critical data and a realistic catastrophic scenario exists

## P1 - HIGH

- a realistic single point of failure causes major production outages violating defined requirements

- staging or preview environment trust permits production compromise

- deployment strategies contain a concrete, high-probability outage or data corruption path

- critical backups exist but cannot be restored or used

- autoscaling or deployments can exhaust shared database connections and collapse the system

## P2 - MEDIUM

- significant reliability or operational weakness

- limited outage or data loss exposure window

- important observability or recovery gap

- meaningful environment or configuration drift

## P3 - LOW

- limited operational weakness

- minor cost or configuration flaw

- constrained failure scenario

## P4 - HARDENING

- maturity, automation, redundancy, or process improvements without a confirmed current production risk

---

# 257. CONFIDENCE

Use:

```text
HIGH

MEDIUM

LOW
```

---

# 258. STATUS

Use:

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

Use:

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

# 261. FALSE-POSITIVE PREVENTION

Before reporting a P0/P1/P2 finding verify:

1. actual provider and platform

2. deployed environment

3. current configuration

4. topology

5. redundancy

6. provider-managed behaviors

7. backup and recovery mechanisms

8. autoscaling policies

9. business and SLO requirements

10. production telemetry evidence where accessible

---

# 262. DO NOT REPORT SINGLE INSTANCE AUTOMATICALLY AS P1

If the application can tolerate brief downtime:

a single instance may represent an entirely rational architecture.

---

# 263. DO NOT DEMAND MULTI-REGION AUTOMATICALLY

Multi-region introduces substantial architectural complexity.

---

# 264. DO NOT DEMAND KUBERNETES AUTOMATICALLY

PaaS, serverless, or simple VMs may be superior choices.

---

# 265. DO NOT DEMAND TERRAFORM AUTOMATICALLY

IaC is an instrument, not an ultimate objective.

---

# 266. DO NOT DEMAND REDIS AUTOMATICALLY

Avoid unless there is a genuine architectural requirement.

---

# 267. DO NOT DEMAND READ REPLICAS AUTOMATICALLY

Unnecessary in the absence of a confirmed read bottleneck.

---

# 268. DO NOT DEMAND BLUE/GREEN FOR EVERY SYSTEM

Deployment strategies must align with actual platform capabilities and risk profiles.

---

# 269. DO NOT TREAT MANAGED SERVICES AS MAGIC

Managed services reduce operational burdens, but tiering and configuration dictate actual reliability.

---

# 270. DO NOT TREAT "BACKUP ENABLED" AS PROOF OF RECOVERY

A verified restore is the only proof of recovery.

---

# 271. DO NOT TREAT "AUTOSCALING ENABLED" AS PROOF OF SCALABILITY

Shared downstream bottlenecks remain unmitigated.

---

# 272. DO NOT ALTER INFRASTRUCTURE DURING THE AUDIT

Without explicit authorization do not:

- deploy

- scale

- restart production services

- modify DNS records

- change firewall rules

- rotate secrets

- restore backups

- delete resources

- alter IAM permissions

First complete the audit.

---

# 273. OUTPUT - DEVOPS_INFRASTRUCTURE_AUDIT.md

Structure the final report:

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

If relevant.

## 26. Kubernetes Audit

If relevant.

## 27. Container Audit

If relevant.

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

In a controlled environment, evaluate:

- user requests

- sessions

- uploads

- jobs

- WebSockets

---

# 281. SECOND PASS - FULL APPLICATION RESTART

Ask what is lost during a complete cold restart.

---

# 282. SECOND PASS - DEPLOYMENT AT PEAK LOAD

Simulate mentally or via testing:

```text
peak traffic

+

rolling deploy
```

Ask whether remaining instances have adequate headroom.

---

# 283. SECOND PASS - FAILED DEPLOY AT 50%

Fleet split half new and half old.

Verify API, schema, and job compatibility.

---

# 284. SECOND PASS - ROLLBACK

Revert to the previous artifact in staging or test environments.

Verify:

- DB

- config

- jobs

- assets

---

# 285. SECOND PASS - DATABASE FAILOVER

If the platform supports failover drills:

verify reconnection and recovery.

If not:

analyze documented platform behaviors and client configurations.

---

# 286. SECOND PASS - DB CONNECTION STORM

Simulate application autoscaling:

```text
1 -> 10 -> max
```

Calculate total connection budgets against database pool limits.

---

# 287. SECOND PASS - CACHE DOWN

Ask:

- does the application continue operating?

- does the database survive the query storm?

- what happens to sessions?

- what happens to distributed locks?

---

# 288. SECOND PASS - QUEUE DOWN

Ask:

- do requests fail?

- are jobs dropped?

- does local memory buffer overflow?

---

# 289. SECOND PASS - STORAGE DOWN

Ask:

- uploads

- downloads

- app startup

- critical user path

---

# 290. SECOND PASS - THIRD-PARTY 30s LATENCY

Verify:

- timeouts

- worker thread exhaustion

- retries

- cascading failures

---

# 291. SECOND PASS - CERTIFICATE EXPIRY

Determine:

- renewal ownership

- automation reliability

- monitoring alerts

---

# 292. SECOND PASS - DOMAIN/DNS CHANGE

Ask:

- TTL values

- rollback procedures

- stale cached records

- TLS certificate alignment

---

# 293. SECOND PASS - DISK 95%

For persistent disks and databases:

verify whether there is:

- alerting

- automatic volume expansion

- cleanup routines

- emergency response protocols

---

# 294. SECOND PASS - BACKUP RESTORE

The most critical operational validation.

In an isolated environment execute:

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

Ask:

> What exact recovery procedure exists?

---

# 296. SECOND PASS - BAD MIGRATION

Ask:

- rollback feasibility

- PITR availability

- forward fix complexity

- required downtime

---

# 297. SECOND PASS - STAGING COMPROMISE

Ask what production systems staging can reach.

---

# 298. SECOND PASS - PROVIDER QUOTA

For each managed service identify the hard quota relevant to the workload.

---

# 299. SECOND PASS - REGION/AZ FAILURE

If the system claims high availability:

verify whether replicas and data genuinely cross failure domains.

---

# 300. SECOND PASS - OBSERVABILITY OUTAGE

If logging and monitoring services fail:

does the application continue running?

---

# 301. SECOND PASS - LOG STORM

Simulate a severe error surge.

Ask impact on:

- disk capacity

- log ingestion limits

- cost

- application latency

---

# 302. SECOND PASS - AUTOSCALING MAX

Scale workload to maximum configured replicas.

Ask which downstream bottleneck breaks first.

---

# 303. SECOND PASS - INSTANCE STARTUP STORM

All instances restart concurrently.

Track:

- DB connections

- cache priming

- external providers

- migrations

---

# 304. SECOND PASS - BACKUP CREDENTIAL COMPROMISE

Ask whether a single identity can:

```text
delete production

+

delete all backups
```

If yes:

recovery blast radius is catastrophic.

---

# 305. SECOND PASS - EXPENSIVE ABUSE

A single malicious user or client triggers:

- autoscaling spikes

- SMS/email quota expenditure

- egress bandwidth surges

- logging saturation

Evaluate cost guardrails.

---

# 306. FINAL QUALITY GATE

Before finalizing the review verify:

- actual platform and provider are identified

- environments are comprehensively mapped

- production and staging isolation is verified

- ephemeral and local state is identified

- startup and readiness behaviors are evaluated

- deployment strategy aligns with actual platform capabilities

- mixed-version rollout periods are accounted for

- migrations are evaluated alongside rollout and rollback plans

- rollback is not reduced to a simple Git revert

- graceful shutdown mechanisms are checked

- database connection budgets account for autoscaling ceilings

- managed database HA is not assumed without tier and configuration proof

- cache and queue failure semantics are defined

- backups include verified restore validation

- RPO and RTO requirements are not fabricated

- DNS, TLS, and domain expiration risks are evaluated

- direct-origin, CDN, and WAF boundaries are audited

- service quotas are analyzed

- autoscaling accounts for downstream dependency capacity

- logging and monitoring are evaluated beyond mere presence

- alerts correlate to genuine failure modes

- cost amplification risks are evaluated

- single points of failure are prioritized against actual business requirements

- Kubernetes, multi-region, and Terraform are not recommended by default

- every P0/P1 finding features a concrete production failure path

- P4 operational maturity items are clearly segregated from active production flaws

---

# FINAL RULE

I do not want a report of the type:

> Use Kubernetes, autoscaling, Terraform, multi-region, and monitoring.

That is not a DevOps & Infrastructure Audit.

I am seeking issues such as:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

These are the DevOps and infrastructure vulnerabilities you need to discover.

Think through:

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

For every serious finding you must be able to answer:

> Which concrete infrastructure component is the problem?

> What event triggers the failure?

> Is the failure realistic in the current deployment?

> What is the blast radius?

> Do we lose only availability or data as well?

> How does the system detect the issue?

> How does it restore normal state?

> Has recovery ever been genuinely tested?

> Does the proposed change actually resolve the root cause or merely add infrastructure complexity?

If production topology is unconfirmed:

**PRODUCTION TOPOLOGY NOT VERIFIED.**

If SLO/RPO/RTO are undefined:

**REQUIREMENT NOT DEFINED.**

If backups exist but restore is unconfirmed:

**RECOVERABILITY NOT VERIFIED.**

If the issue represents only a maturity improvement without a confirmed production failure path:

**P4 - HARDENING.**

It is better to discover 10 genuine infrastructure failure paths with precise recovery consequences than to draft 200 generic DevOps recommendations.

The goal is to produce a forensically precise Ultimate DevOps & Infrastructure Audit that directly translates into:

- deployment hardening

- migration safety plan

- rollback strategy

- backup/restore testing

- environment isolation

- autoscaling guardrails

- infrastructure monitoring

- disaster-recovery plan

- production reliability roadmap
