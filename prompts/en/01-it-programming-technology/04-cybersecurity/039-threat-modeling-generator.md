---
id: UPL-IT-039
number: 39
slug: threat-modeling-generator
title: Threat Modeling Generator
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# THREAT MODELING GENERATOR

I want you to build a maximally deep, systematic, evidence-first, and production-oriented threat model of the entire application or system.

Main objective:

> Identify the most critical assets, trust boundaries, attacker models, attack surfaces, abuse scenarios, privilege escalation paths, cross-tenant risks, data exposure scenarios, and failure combinations before they materialize into concrete security incidents.

This is not:

- a generic STRIDE checklist without context

- enumerating every conceivable cyber attack

- a penetration test

- a routine application security audit

- automatically declaring every threat as high severity

- inventing infrastructure components that the project does not have

- assuming every attacker possesses admin or internal network access

- merely drawing DFDs

- merely a compliance document

The focus is on the question:

> What is the system trying to protect, from whom, across which trust boundaries, and via what realistic path can an attacker transition from their initial posture to significant impact?

Priority:

**critical assets > trust boundaries > attacker capabilities > realistic attack paths > privilege escalation > tenant/data isolation > destructive actions > persistence > detection gaps > theoretical hardening**

It is better to identify 10 realistic threat scenarios with complete attack paths than to draft 200 generic STRIDE checklist items.

---

# 1. ESTABLISH SCOPE

Before modeling, define:

```text
System:

Environment:

Production / Staging / Dev:

Included components:

Excluded components:

Internet-facing:

Multi-tenant:

Sensitive data:

Critical business actions:
```

If something is not accessible:

**NOT VERIFIED**

---

# 2. DO NOT BUILD A THREAT MODEL FROM ASSUMPTIONS

First analyze:

- repository

- architecture docs

- routes

- configuration

- deployment

- database

- queues

- integrations

- storage

- CI/CD

If a part is not accessible, mark it as unknown.

---

# 3. SYSTEM CONTEXT

Create a high-level map:

```text
Users

↓

Frontend / Mobile / Desktop

↓

Edge / CDN / Gateway

↓

Backend/API

↓

Database

↓

Cache

↓

Queue/Workers

↓

Storage

↓

Third-party services
```

Use only genuine components.

---

# 4. COMPONENT INVENTORY

For each component record:

```text
Component:

Purpose:

Inputs:

Outputs:

Credentials:

Privileges:

Data handled:

Network exposure:

Trust level:
```

---

# 5. DATA FLOW DIAGRAM

Construct a textual DFD for major flows.

Example:

```text
Browser
  |
  | HTTPS
  v
API
  |
  | SQL
  v
Database
```

Add:

- queue

- storage

- provider

- internal services

where they exist.

---

# 6. TRUST BOUNDARIES

Explicitly indicate where data crosses between different levels of trust.

Examples:

```text
Internet -> Edge

Edge -> Backend

Backend -> Database

Backend -> Third-party

Tenant A -> Shared infrastructure

User -> Admin functionality

CI -> Production
```

---

# 7. A TRUST BOUNDARY IS NOT JUST NETWORK

A trust boundary can be:

- privilege

- process

- tenant

- environment

- organization

- credential

- browser/server

- user/system worker

---

# 8. ASSET INVENTORY

Identify what is truly worth protecting.

---

# 9. DATA ASSETS

Examples:

- user PII

- documents

- credentials

- tokens

- payment data

- audit logs

- customer data

- private files

---

# 10. CONTROL ASSETS

Even more critical:

- admin privileges

- signing keys

- deploy credentials

- DB write access

- production config

- encryption keys

- package publish token

---

# 11. BUSINESS ASSETS

Examples:

- money

- credits

- subscriptions

- account ownership

- entitlement

- orders

- inventory

- reputation

---

# 12. AVAILABILITY ASSETS

Examples:

- login

- checkout

- API

- queue processing

- media playback

- critical jobs

---

# 13. ASSET CRITICALITY

Classify:

```text
CRITICAL

HIGH

MEDIUM

LOW
```

---

# 14. ASSET OWNER

If known:

- user

- tenant

- company

- system

- third-party

---

# 15. SECURITY OBJECTIVES

For each asset assess:

```text
Confidentiality

Integrity

Availability

Authenticity

Authorization

Non-repudiation
```

Not all have to be equally important.

---

# 16. ATTACKER MODELS

Do not use a single universal "hacker".

---

# 17. UNAUTHENTICATED INTERNET ATTACKER

Capabilities:

- public endpoints

- arbitrary request input

- registration if it exists

- public upload

---

# 18. AUTHENTICATED USER

Can possess a substantially larger attack surface.

---

# 19. MALICIOUS TENANT USER

Particularly for SaaS/multi-tenant systems.

---

# 20. TENANT ADMIN

Can abuse legitimate higher privilege.

---

# 21. GLOBAL ADMIN

The threat can be:

- compromised admin credential

- malicious insider

---

# 22. COMPROMISED API KEY

Model what an attacker gains with it.

---

# 23. COMPROMISED USER SESSION

A distinct scenario from password compromise.

---

# 24. COMPROMISED THIRD-PARTY

Provider/webhook/package/vendor can become attacker-controlled.

---

# 25. MALICIOUS FILE

A file itself represents attacker-controlled input.

---

# 26. MALICIOUS DEPENDENCY

Build-time attacker model.

---

# 27. MALICIOUS CONTRIBUTOR

Can modify source/PR, but may not possess production secrets.

---

# 28. CI COMPROMISE

Attacker can execute code inside the build environment.

---

# 29. CLOUD CREDENTIAL COMPROMISE

Specifically model the blast radius.

---

# 30. INSIDER

Do not invent employee access.

Model only if the system/org context makes it relevant.

---

# 31. ATTACKER CAPABILITY MATRIX

| Attacker | Network | Account | Tenant | Code access | Credential |
|---|---|---|---|---|---|

---

# 32. ENTRY POINT INVENTORY

Locate:

- public routes

- login

- registration

- upload

- webhooks

- GraphQL

- WebSockets

- admin APIs

- internal APIs

- file import

- callback

- CI triggers

- updater

---

# 33. EXTERNAL DEPENDENCIES

For each third-party service ask:

> What happens if it is compromised or delivers malicious input?

---

# 34. DATA STORES

Model:

- relational DB

- NoSQL

- Redis

- object storage

- local files

- logs

- backups

---

# 35. PRIVILEGE DOMAINS

Identify levels:

```text
anonymous

user

tenant member

tenant admin

support

global admin

service

system
```

---

# 36. PRIVILEGE TRANSITIONS

Specifically threat-model actions that transition privilege.

Example:

```text
user

↓

role assignment

↓

admin
```

---

# 37. IDENTITY BOUNDARIES

Map:

- password

- session

- JWT

- API key

- OAuth

- service token

- webhook signature

---

# 38. TENANT BOUNDARY

For multi-tenant systems this is one of the most critical trust boundaries.

---

# 39. ENVIRONMENT BOUNDARY

Dev/staging/prod must be treated as separate trust domains if they are separated.

---

# 40. BUILD/PRODUCTION BOUNDARY

CI is not the same as production, but it may possess production deploy capability.

---

# 41. ADMIN/USER BOUNDARY

Privileged functions.

---

# 42. SERVER/CLIENT BOUNDARY

Consider everything sent to the client as attacker-visible/modifiable.

---

# 43. SYSTEM WORKER BOUNDARY

A background job often runs with more privileges than the user who initiated it.

---

# 44. THREAT ENUMERATION METHODOLOGY

Use a combination of:

- STRIDE

- abuse cases

- attack trees

- privilege analysis

- data flow analysis

Do not use any framework mechanically.

---

# 45. STRIDE - SPOOFING

Ask:

> How can an attacker impersonate another principal?

---

# 46. STRIDE - TAMPERING

Ask:

> What data/state can an attacker modify unauthorized?

---

# 47. STRIDE - REPUDIATION

Ask:

> Can a critical action be executed without a reliable actor/audit trail?

---

# 48. STRIDE - INFORMATION DISCLOSURE

Ask:

> How does private data cross a boundary toward an illegitimate principal?

---

# 49. STRIDE - DENIAL OF SERVICE

Ask:

> What is the cheapest request that triggers the most expensive server operation?

---

# 50. STRIDE - ELEVATION OF PRIVILEGE

Ask:

> What legitimate low-privilege input/path can lead to higher privilege?

---

# 51. DO NOT STOP AT A STRIDE LABEL

Every threat must possess a concrete scenario.

---

# 52. ATTACK TREE

Build an attack tree for the most critical asset.

Example:

```text
Goal: obtain admin access

├─ steal admin session
├─ forge admin token
├─ exploit role assignment
├─ compromise OAuth linking
└─ compromise signing key
```

---

# 53. ATTACK TREE LEAF

Every leaf must represent a concrete technical possibility.

---

# 54. ATTACK PATH

Use:

```text
Initial capability

↓

Entry point

↓

Control bypass

↓

Intermediate privilege

↓

Target asset

↓

Impact
```

---

# 55. MULTI-STEP ATTACK

The most dangerous scenario is frequently not a single vulnerability.

Example:

```text
open redirect

↓

OAuth token leak

↓

account takeover

↓

admin action
```

---

# 56. DO NOT INVENT A CHAIN

Every step must be grounded in architecture or explicitly designated as hypothetical.

---

# 57. ABUSE CASE

A threat model is not limited to software exploits.

Example:

```text
user creates 100,000 exports

↓

queue backlog

↓

other tenants delayed
```

---

# 58. BUSINESS ABUSE

Look for:

- promo abuse

- credit abuse

- referral abuse

- refund abuse

- invitation abuse

- resource creation spam

if the feature exists.

---

# 59. AUTH ABUSE

- credential stuffing

- reset abuse

- MFA reset

- account linking

---

# 60. AUTHZ ABUSE

- IDOR

- tenant crossing

- admin function misuse

---

# 61. INPUT ABUSE

- injection

- SSRF

- XSS

- upload

- parser

---

# 62. RESOURCE ABUSE

- expensive query

- batch

- upload

- queue

- AI/API cost

---

# 63. SUPPLY CHAIN ABUSE

- dependency

- CI

- package registry

- updater

---

# 64. DATA EXFILTRATION PATHS

For critical data locate all exits:

- API

- export

- file download

- logs

- backups

- third-party

- email

---

# 65. DATA INGEST PATHS

Locate:

- forms

- upload

- webhooks

- imports

- third-party sync

- queue

---

# 66. DATA PROCESSORS

Who processes attacker-controlled content?

---

# 67. DATA RETENTION

Stored attacker content can become a second-order threat later.

---

# 68. CROWN JEWELS

Designate 3-10 most critical assets.

---

# 69. CROWN JEWEL PATHS

For each:

> How can an attacker reach it?

---

# 70. ADMIN ACCOUNT

If present, always a high-value target.

---

# 71. SIGNING KEY

Can represent identity minting authority.

---

# 72. DATABASE WRITE ACCESS

Can bypass application controls.

---

# 73. DEPLOY CREDENTIAL

Can enable code execution through deployment.

---

# 74. OBJECT STORAGE ADMIN

Can expose/delete private files.

---

# 75. AUDIT LOG

Can be an asset if incident response relies on it.

---

# 76. ATTACK SURFACE TO ASSET MAP

| Entry point | Attacker | Intermediate system | Target asset |
|---|---|---|---|

---

# 77. TRUST ASSUMPTIONS

Compile a list of all implicit assumptions.

Example:

```text
Requests reaching origin came through trusted gateway.
```

---

# 78. ASSUMPTION VALIDATION

For each assumption ask:

> Where is it technically enforced?

---

# 79. "INTERNAL SERVICE IS TRUSTED"

Ask whether SSRF can target it.

---

# 80. "CLIENT WILL NOT SEND THAT FIELD"

Is not a valid security assumption to harbor.

---

# 81. "USER DOES NOT KNOW UUID"

Is not authorization.

---

# 82. "ONLY UI CAN TRIGGER THIS"

Is not a valid server security assumption.

---

# 83. "WEBHOOK COMES FROM PROVIDER"

Must have an authenticity control.

---

# 84. "CI ACTION IS TRUSTED"

Ask:

- owner

- ref

- permissions

---

# 85. "PREVIEW ENV IS SAFE"

Ask whether it holds production secrets/data.

---

# 86. SECURITY INVARIANTS

Define rules that must never be breached.

Example:

```text
User can never access another tenant's private document.
```

---

# 87. AUTH INVARIANTS

Example:

```text
Only validated identity proof may issue a full session.
```

---

# 88. PRIVILEGE INVARIANTS

Example:

```text
A principal cannot grant a privilege higher than its own grant ceiling.
```

---

# 89. FINANCIAL INVARIANTS

Example:

```text
A payment/refund operation may have at most one business effect.
```

---

# 90. FILE INVARIANTS

Example:

```text
User-controlled file paths may never escape the assigned storage namespace.
```

---

# 91. SUPPLY CHAIN INVARIANTS

Example:

```text
Untrusted PR code must never execute with production signing credentials.
```

---

# 92. THREAT ID FORMAT

Use:

```text
TM-001

TM-002

TM-003
```

---

# 93. THREAT FORMAT

Every serious threat must contain:

```text
Threat ID:

Title:

Category:

Status:

Confidence:

Target asset:

Asset criticality:

Attacker:

Initial capability:

Required privileges:

Entry point:

Trust boundary:

Intermediate components:

Threat scenario:

Attack path:

T0:

T1:

T2:

T3:

Security invariant violated:

Current controls:

Control effectiveness:

Detection:

Impact:

Confidentiality:

Integrity:

Availability:

Financial:

Tenant:

Operational:

Likelihood evidence:

Impact evidence:

Overall risk:

Mitigation options:

Recommended control:

Residual risk:

Validation/test:

Unknowns:
```

---

# 94. RISK ASSESSMENT

Do not use false mathematical precision.

Use:

```text
CRITICAL

HIGH

MEDIUM

LOW
```

or the existing organizational model.

---

# 95. RISK = THREAT, NOT JUST VULNERABILITY

A threat can be high-risk even before a confirmed bug exists if:

- the asset is critical

- exposure is realistic

- controls are weak

However, clearly designate whether the finding is confirmed or an architectural risk.

---

# 96. STATUS

Use:

```text
CONFIRMED WEAKNESS

PLAUSIBLE THREAT

CONTROLLED

NOT APPLICABLE

NOT VERIFIED
```

---

# 97. CONFIDENCE

Use:

```text
HIGH

MEDIUM

LOW
```

---

# 98. EXISTING CONTROLS

For each threat:

- auth

- authorization

- encryption

- validation

- limiter

- isolation

- monitoring

- backup

---

# 99. CONTROL EFFECTIVENESS

Use:

```text
STRONG

PARTIAL

WEAK

UNKNOWN
```

---

# 100. PREVENTIVE CONTROL

Prevents the attack.

---

# 101. DETECTIVE CONTROL

Detects it.

---

# 102. RECOVERY CONTROL

Minimizes impact.

---

# 103. CONTROL GAP

The threat model must demonstrate not merely that "an attack exists", but:

> Which control is missing?

---

# 104. DEFENSE IN DEPTH

For crown-jewel threats verify whether the failure of a single control immediately results in total compromise.

---

# 105. SINGLE POINT OF SECURITY FAILURE

Example:

```text
one shared signing secret

↓

all users/admin identities
```

---

# 106. BLAST RADIUS

For each threat assess:

```text
single resource

single user

single tenant

multiple tenants

global
```

---

# 107. PERSISTENCE

Can the attacker maintain access following the initial compromise?

Example:

- create API key

- add admin

- deploy backdoor

- create OAuth connection

---

# 108. PRIVILEGE ESCALATION

Map:

```text
anonymous -> user

user -> tenant admin

tenant admin -> global admin

service -> cloud admin
```

---

# 109. LATERAL MOVEMENT

Can the compromise of one service grant access to another?

---

# 110. CREDENTIAL REUSE

Shared credentials amplify lateral movement.

---

# 111. ENVIRONMENT PIVOT

Staging compromise -> production.

---

# 112. TENANT PIVOT

Tenant A -> Tenant B.

---

# 113. USER TO SYSTEM PIVOT

User-controlled job -> system privileged worker.

---

# 114. WEB TO INTERNAL PIVOT

SSRF.

---

# 115. CI TO PRODUCTION PIVOT

Supply chain.

---

# 116. FILE TO SERVER PIVOT

Parser/upload.

---

# 117. PROVIDER TO LOCAL PIVOT

Webhook/callback.

---

# 118. BROWSER TO ADMIN PIVOT

Stored XSS.

---

# 119. SECRET TO IDENTITY PIVOT

JWT/session signing key.

---

# 120. DATA FLOW CONFIDENTIALITY

For each sensitive flow check:

- transport

- destination

- logs

- caching

- third parties

---

# 121. DATA FLOW INTEGRITY

Who can modify data in transit or prior to processing?

---

# 122. DATA ORIGIN

Can the server distinguish:

- a genuine provider event

- an attacker-crafted payload

---

# 123. REPLAY

An authenticated message is not necessarily fresh.

---

# 124. ONE-TIME OPERATIONS

Threat-model replay/race conditions.

---

# 125. CONCURRENCY

A security invariant may collapse solely under concurrent requests.

---

# 126. TOCTOU

Check and action separated in time.

---

# 127. STALE AUTHORIZATION

Role revocation, old token, queued job.

---

# 128. STALE DATA

A delayed job executes an action that is no longer valid in business context.

---

# 129. FAILURE MODE THREATS

Ask:

> What happens when a security dependency fails?

---

# 130. AUTH SERVICE DOWN

Fail open or fail closed?

---

# 131. POLICY STORE DOWN

---

# 132. SECRET MANAGER DOWN

---

# 133. DATABASE PARTIAL FAILURE

Can the security state remain partially updated?

---

# 134. QUEUE FAILURE

Can a required security action be lost?

Example:

- revoke

- cleanup

- notification

---

# 135. LOGGING FAILURE

Must not block a critical security action without specific justification.

---

# 136. DETECTION MODEL

For high-risk threats ask:

> How would we know this just occurred?

---

# 137. AUTH ANOMALY

- repeated failed logins

- unusual session creation

---

# 138. PRIVILEGE CHANGE

Admin/role changes.

---

# 139. CROSS-TENANT ATTEMPT

403 patterns.

---

# 140. SECRET USE

Cloud/provider logs can expose compromised token usage.

---

# 141. DEPLOYMENT

Unexpected production deployment.

---

# 142. DATA EXPORT

Large/unusual exports.

---

# 143. FILE ABUSE

Malicious uploads/scan failures.

---

# 144. DETECTION GAP

A high-risk threat lacking both preventive and detective controls holds elevated priority.

---

# 145. RESPONSE READINESS

For crown-jewel threats ask:

- how do we revoke?

- how do we isolate?

- how do we restore state?

---

# 146. COMPROMISED USER SESSION

Response:

- revoke session

- reset credential

- audit actions

---

# 147. COMPROMISED SIGNING KEY

Major incident:

- rotate

- invalidate tokens

- redeploy

- investigate forged identities

---

# 148. COMPROMISED DEPLOY TOKEN

- revoke

- inspect deployments

- rotate downstream secrets if necessary

---

# 149. CROSS-TENANT LEAK

- stop the path

- determine affected records

- evidence preservation

---

# 150. THREAT PRIORITIZATION

Determine priority based on:

- asset criticality

- attacker accessibility

- control weakness

- blast radius

- persistence

- detectability

---

# 151. EASY ATTACK + MEDIUM IMPACT

Can represent higher priority than a theoretical catastrophic attack requiring cloud admin access.

---

# 152. ATTACK COST

Assess qualitatively:

```text
TRIVIAL

LOW

MODERATE

HIGH
```

---

# 153. REQUIRED ACCESS

```text
NONE

USER ACCOUNT

TENANT ADMIN

INTERNAL NETWORK

CODE CONTRIBUTOR

CI COMPROMISE

ADMIN
```

---

# 154. AUTOMATION

Can the attack scale to:

- a single user

- all users

- all tenants

---

# 155. ATTACK REPEATABILITY

One-off race vs deterministic exploit.

---

# 156. USER INTERACTION

Does the victim need to click anything?

---

# 157. DETECTION DIFFICULTY

```text
EASY

MODERATE

DIFFICULT
```

---

# 158. THREAT MATRIX

| Threat | Asset | Attacker | Boundary | Risk | Control |
|---|---|---|---|---|---|

---

# 159. ASSET-THREAT MATRIX

| Asset | Spoofing | Tampering | Disclosure | DoS | EoP |
|---|---|---|---|---|---|

Do not populate mechanically if a category does not make sense.

---

# 160. TRUST BOUNDARY MATRIX

| Boundary | Data crossing | Credentials | Main threat | Existing control |
|---|---|---|---|---|

---

# 161. ABUSE CASE MATRIX

| Feature | Legitimate use | Abuse | Attacker | Impact |
|---|---|---|---|---|

---

# 162. CROWN JEWEL MATRIX

| Asset | Owner | Security objective | Main attack paths | Current controls |
|---|---|---|---|---|

---

# 163. SECURITY INVARIANT MATRIX

| Invariant | Components enforcing it | Failure consequence | Test |
|---|---|---|---|

---

# 164. ATTACK PATH 1 - ACCOUNT TAKEOVER

Model only if authentication exists.

Possible branches:

```text
password

session

reset

OAuth

MFA

support
```

---

# 165. ATTACK PATH 2 - PRIVILEGE ESCALATION

Model:

```text
user

↓

field/route/policy weakness

↓

admin
```

---

# 166. ATTACK PATH 3 - CROSS-TENANT DATA ACCESS

For multi-tenant systems.

---

# 167. ATTACK PATH 4 - SERVER COMPROMISE

Potential inputs:

- injection

- file parser

- dependency

- admin tool

---

# 168. ATTACK PATH 5 - SUPPLY CHAIN

```text
dependency / CI

↓

build compromise

↓

artifact

↓

production
```

---

# 169. ATTACK PATH 6 - SECRET COMPROMISE

```text
repo/log/CI

↓

credential

↓

provider/cloud
```

---

# 170. ATTACK PATH 7 - DATA DESTRUCTION

- admin API

- compromised DB write

- restore/reset

- ransomware-like actor

---

# 171. ATTACK PATH 8 - AVAILABILITY

- expensive API

- queue flood

- upload bomb

- provider quota exhaustion

---

# 172. ATTACK PATH 9 - THIRD-PARTY COMPROMISE

Provider sends malicious/signed content or vendor JS executes.

---

# 173. ATTACK PATH 10 - INSIDER/PRIVILEGED ABUSE

Only if relevant.

---

# 174. ARCHITECTURAL THREAT

A threat model can surface issues that are not code bugs.

Example:

```text
all production/admin access depends on one shared static credential
```

---

# 175. OPERATIONAL THREAT

Example:

```text
production backups accessible wider than live DB
```

---

# 176. HUMAN PROCESS THREAT

Example:

```text
support can reset MFA without secondary approval
```

Only if process evidence exists.

---

# 177. EXTERNAL UNKNOWN

If third-party security semantics are unknown:

**THIRD-PARTY CONTROL NOT VERIFIED**

---

# 178. NETWORK UNKNOWN

If infrastructure is not accessible:

**NETWORK BOUNDARY NOT VERIFIED**

---

# 179. DATA CLASSIFICATION UNKNOWN

Do not speculate on sensitivity.

Flag it.

---

# 180. THREAT VS FINDING

Threat:

```text
Potential attack scenario
```

Finding:

```text
Confirmed weakness enabling scenario
```

Do not conflate them.

---

# 181. CONTROLLED THREAT

If current controls definitively halt the scenario:

record it as:

```text
CONTROLLED
```

This is vital.

---

# 182. THINGS DONE WELL

The threat model must document robust controls.

---

# 183. CONTROL COVERAGE

Demonstrate which threats possess:

```text
Prevent

Detect

Recover
```

---

# 184. HIGH-RISK WITHOUT DETECTION

Highlight specifically.

---

# 185. HIGH-RISK WITHOUT RECOVERY

Highlight specifically.

---

# 186. SINGLE CONTROL THREAT

If critical risk hinges solely upon a single middleware/secret:

defense-in-depth gap.

---

# 187. SECURITY TEST DERIVATION

Every high/critical threat must generate at least one test or verification.

---

# 188. THREAT-DRIVEN TEST

Example:

```text
Threat:
tenant A reads tenant B file

Test:
tenant A credential + tenant B file ID -> deny
```

---

# 189. FAILURE-INJECTION TEST

Example:

```text
authorization service unavailable

↓

request must not become authorized
```

---

# 190. CONCURRENCY TEST

One-time resource.

---

# 191. DEPLOYMENT TEST

Old/new worker/token/config compatibility if the threat is relevant.

---

# 192. ATTACK SIMULATION

Only in an authorized test environment and without destructive payloads.

---

# 193. SECURITY REQUIREMENTS

Derive concrete requirements from the threat model.

---

# 194. REQUIREMENT FORMAT

```text
SR-001:
Tenant-scoped resource lookup MUST enforce tenant authority server-side.
```

---

# 195. REQUIREMENTS MUST NOT BE GENERIC

Poor:

```text
System must be secure.
```

---

# 196. SECURITY ACCEPTANCE CRITERIA

For critical requirements append a testable condition.

---

# 197. RESIDUAL RISK

No system is entirely without risk.

For each mitigated high threat state what remains.

---

# 198. MITIGATION COST

Use:

```text
XS

S

M

L

XL
```

---

# 199. MITIGATION TYPE

```text
PREVENT

DETECT

RECOVER

REDUCE BLAST RADIUS
```

---

# 200. MITIGATION PRIORITY

Do not recommend the most complex control if a simpler invariant resolves the attack.

---

# 201. DISTRIBUTED LOCK

Do not prescribe as a generic security fix for races.

A unique constraint/atomic update may be superior.

---

# 202. WAF

Do not use as a substitute for app-level authorization/input remediation.

---

# 203. MFA

Do not use as a universal fix for every threat.

---

# 204. ENCRYPTION

Encryption does not solve an authorization problem.

---

# 205. NETWORK ISOLATION

Does not resolve a compromised internal service.

---

# 206. ZERO TRUST

Do not employ as a buzzword without concrete control architecture.

---

# 207. MICROSEGMENTATION

Only if lateral movement threats justify it.

---

# 208. THREAT MODEL ITERATION

A threat model is not a one-off document.

Identify triggers for review:

- new auth method

- new provider

- file upload

- tenant model

- admin function

- new CI/release path

---

# 209. CHANGE-DRIVEN THREAT MODEL

For a major feature ask:

> What new asset, trust boundary, or attacker capability does it introduce?

---

# 210. FEATURE THREAT TEMPLATE

```text
New feature:

New entry points:

New data:

New privileges:

New dependencies:

New trust boundaries:

New threats:
```

---

# 211. ARCHITECTURAL ASSUMPTION REGISTER

Compile a list:

| ID | Assumption | Enforced where | Verified |
|---|---|---|---|

---

# 212. UNKNOWN REGISTER

Everything unverified must remain explicitly visible.

---

# 213. DO NOT CONVERT UNKNOWN TO LOW RISK

Unknown is not synonymous with secure.

---

# 214. DO NOT CONVERT UNKNOWN TO HIGH RISK

Equally, do not sensationalize.

---

# 215. ATTACK SURFACE COMPLETENESS

Finally verify whether all are included:

- web

- API

- mobile

- desktop

- jobs

- storage

- CI

- dependencies

- third parties

- admin

according to the actual project.

---

# 216. PRIVACY THREATS

If the app processes sensitive personal data:

include:

- overcollection

- unintended exposure

- excessive logs

without drawing legal conclusions.

---

# 217. FINANCIAL THREATS

If payments/credits exist:

model:

- replay

- double spend

- price tampering

- refund abuse

- idempotency

---

# 218. AI/LLM THREATS

If the app utilizes AI:

include:

- prompt injection

- tool abuse

- data leakage

- malicious retrieved content

Detailed AI audit follows later.

---

# 219. MOBILE THREATS

If a mobile client exists:

- embedded credentials

- deep links

- token storage

- API parity

---

# 220. DESKTOP THREATS

If a desktop client exists:

- updater

- local files

- IPC

- credential storage

---

# 221. OFFLINE THREATS

If the app functions offline:

- local sensitive cache

- stale permissions

- sync conflict

---

# 222. PWA THREATS

Service worker/cache can retain private data.

---

# 223. BACKUP THREATS

- public backup

- restore tampering

- old credentials/data

---

# 224. LOG THREATS

Logs can turn into a secondary sensitive datastore.

---

# 225. MONITORING THREATS

Monitoring credential/service may possess broad read access.

---

# 226. SUPPORT TOOL THREATS

Internal support tools frequently hold wide customer data access.

---

# 227. IMPERSONATION THREATS

Actor vs subject audit.

---

# 228. API KEY THREATS

- leakage

- overbroad scope

- no revocation

- tenant confusion

---

# 229. WEBHOOK THREATS

- forgery

- replay

- cross-tenant mapping

- SSRF outgoing

---

# 230. QUEUE THREATS

- forged job payload

- privileged worker

- stale job

- replay

---

# 231. CACHE THREATS

- cross-user leak

- stale permission

- poisoning

---

# 232. DATABASE THREATS

- injection

- compromised credential

- overprivileged app user

- backup leak

---

# 233. OBJECT STORAGE THREATS

- public ACL

- predictable key

- unauthorized signed URL

---

# 234. THIRD-PARTY JS

- compromised vendor

- DOM/data access

---

# 235. RELEASE THREATS

- malicious artifact

- compromised signing key

- untrusted workflow

---

# 236. FINDING FORMAT FOR CONFIRMED WEAKNESS

If the threat model exposes a concrete bug:

```text
Finding ID:

Related Threat:

Severity:

Evidence:

Exploit Path:

Impact:

Fix:

Regression Test:
```

Do not conflate all threats with vulnerabilities.

---

# 237. OUTPUT - THREAT_MODEL.md

Structure the final document:

## 1. Executive Summary

- system

- critical assets

- top attacker models

- highest-risk attack paths

- largest control gaps

## 2. Scope

## 3. Architecture Overview

## 4. Data Flow Diagram

## 5. Component Inventory

## 6. Asset Inventory

## 7. Crown Jewels

## 8. Attacker Models

## 9. Trust Boundaries

## 10. Privilege Domains

## 11. Entry Points

## 12. External Dependencies

## 13. Security Assumptions

## 14. Security Invariants

## 15. STRIDE Analysis

## 16. Abuse Cases

## 17. Attack Trees

## 18. Account Takeover Paths

## 19. Privilege Escalation Paths

## 20. Cross-Tenant Paths

## 21. Server Compromise Paths

## 22. Supply Chain Paths

## 23. Secret Compromise Paths

## 24. Data Exfiltration Paths

## 25. Destructive / Availability Paths

## 26. Third-Party Compromise Paths

## 27. Threat Matrix

## 28. Existing Controls

## 29. Detection Coverage

## 30. Recovery Coverage

## 31. Confirmed Weaknesses

## 32. Controlled Threats

## 33. Unknown / Not Verified

## 34. Security Requirements

## 35. Threat-Driven Test Plan

## 36. Mitigation Roadmap

## 37. Residual Risk

---

# 238. THREAT SUMMARY TABLE

| Threat | Asset | Attacker | Boundary | Risk | Status |
|---|---|---|---|---|---|

---

# 239. ATTACK PATH TABLE

| Goal | Initial access | Intermediate step | Final asset | Current blocker |
|---|---|---|---|---|

---

# 240. CONTROL MATRIX

| Threat | Prevent | Detect | Recover | Gap |
|---|---|---|---|---|

---

# 241. SECOND PASS - "ASSUME ONE CONTROL FAILS"

For each crown jewel:

> What happens if its primary security control fails?

Example:

```text
authorization middleware fails
```

Does DB scoping still preserve the tenant boundary?

---

# 242. SECOND PASS - "COMPROMISE ONE USER"

Assume:

```text
one normal user account compromised
```

Ask:

- what the attacker can see

- what they can modify

- can they cross tenant boundaries

- can they gain higher privilege

---

# 243. SECOND PASS - "COMPROMISE ONE TENANT ADMIN"

Ask the blast radius.

---

# 244. SECOND PASS - "COMPROMISE ONE API KEY"

Ask:

- scopes

- tenants

- read/write

- persistence

---

# 245. SECOND PASS - "COMPROMISE ONE SERVICE"

Ask:

> What credentials and network paths does that service hold?

---

# 246. SECOND PASS - "COMPROMISE CI"

Ask:

- production deploy

- signing

- cloud

- registry

- secrets

---

# 247. SECOND PASS - "COMPROMISE THIRD PARTY"

For each critical provider:

> What can a malicious provider response/event/script do?

---

# 248. SECOND PASS - "TENANT A ATTACKS TENANT B"

Walk through:

- APIs

- files

- caches

- jobs

- exports

- webhooks

---

# 249. SECOND PASS - "MALICIOUS FILE"

Walk through upload -> parser -> storage -> browser/server impact.

---

# 250. SECOND PASS - "MALICIOUS DATA AT REST"

Attacker-stored string displayed later by:

- admin

- support

- exporter

- parser

Look for second-order attacks.

---

# 251. SECOND PASS - "AUTH PROVIDER DOWN"

Ask fail-open/fail-closed.

---

# 252. SECOND PASS - "QUEUE DELIVERS TWICE"

Ask whether a security-sensitive action can be re-executed.

---

# 253. SECOND PASS - "OLD TOKEN AFTER ROLE REVOKE"

Ask the stale permission window.

---

# 254. SECOND PASS - "STAGING COMPROMISED"

Ask whether production secrets/trust cross the environment boundary.

---

# 255. SECOND PASS - "BACKUP LEAK"

Ask what the backup contains and whether credentials remain reusable.

---

# 256. SECOND PASS - "ONE EXPENSIVE REQUEST"

Locate the greatest attacker-to-server cost amplification.

---

# 257. SECOND PASS - "DETECTION"

For every CRITICAL/HIGH threat ask:

> Which signal would alert us?

If none:

mark a detection gap.

---

# 258. SECOND PASS - "RECOVERY"

For each crown jewel:

> If compromise succeeds, how do we regain control?

---

# 259. SECOND PASS - "PERSISTENCE"

Ask how an attacker can retain presence following:

- password reset

- key rotation

- deployment rollback

---

# 260. SECOND PASS - "ALTERNATIVE ENTRY POINT"

For each critical action locate all:

- REST

- GraphQL

- mobile

- admin

- worker

- import

- webhook

paths.

---

# 261. FINAL QUALITY GATE

Before the final response verify:

- scope is explicitly defined

- actual architecture is used instead of assumed

- critical assets are identified

- attacker models have realistic capabilities

- trust boundaries are not restricted solely to network

- multi-tenant boundary is incorporated where present

- CI/build/release trust boundary is included

- third-party providers are treated as an external trust domain

- every high-risk threat has a concrete attack path

- STRIDE is not applied mechanically

- threats and confirmed vulnerabilities are separated

- security assumptions are explicitly stated

- security invariants are testable

- privilege escalation paths are mapped

- lateral movement is analyzed

- persistence is analyzed

- failure-mode threats are included

- detection and recovery controls are included, not only prevention

- unknown elements are tagged without false certainty or sensationalism

- every CRITICAL/HIGH threat generates a test or verification

- mitigations target root boundary/invariant

- WAF/MFA/encryption are not used as universal answers

- residual risk is explicitly outlined

---

# FINAL RULE

I do not want a threat model of the type:

> The attacker may attempt SQL injection, XSS, phishing, and DDoS. Use a firewall, MFA, and encryption.

That is not a threat model.

I am seeking scenarios such as:

```text
Asset:
private tenant documents

Attacker:
authenticated Tenant A user

Entry point:
GET /documents/:id

Trust boundary:
Tenant A -> shared backend -> Tenant B data

Attack path:
attacker obtains valid document ID
↓
resource loaded globally by ID
↓
tenant ownership not enforced
↓
Tenant B document returned

Impact:
cross-tenant confidentiality breach
```

or:

```text
Asset:
production deployment authority

Attacker:
malicious external contributor

Entry point:
pull request

Attack path:
PR modifies package lifecycle script
↓
privileged CI workflow checks out PR code
↓
npm install executes attacker-controlled script
↓
production deploy token is present
↓
token exfiltrated
↓
attacker deploys arbitrary production code

Impact:
global system compromise
```

or:

```text
Asset:
admin accounts

Attacker:
normal authenticated user

Attack path:
user stores malicious profile content
↓
support/admin dashboard renders raw HTML
↓
stored XSS executes in admin browser
↓
admin session performs privileged API calls
↓
attacker gains privileged action path
```

or:

```text
Asset:
internal infrastructure

Attacker:
unauthenticated internet user

Entry point:
URL preview API

Attack path:
attacker supplies controlled URL
↓
backend follows redirect
↓
redirect targets internal admin service
↓
internal service trusts network location
↓
privileged action triggered

Impact:
Internet -> backend -> internal network privilege pivot
```

or:

```text
Asset:
payment integrity

Attacker:
authenticated customer

Attack path:
refund request accepted
↓
provider processes refund
↓
worker crashes before ACK
↓
queue retries
↓
same refund is issued twice

Impact:
financial loss through duplicate business effect
```

or:

```text
Asset:
all authenticated identities

Threat:
JWT signing secret exposed in frontend build

Attack path:
visitor downloads JS bundle
↓
extracts signing secret
↓
creates arbitrary valid token
↓
sets privileged subject/role
↓
backend accepts signature

Impact:
global authentication authority compromise
```

or:

```text
Asset:
production tenant data

Attacker:
staging administrator

Attack path:
staging and production share DB/service credential
↓
staging environment compromised
↓
attacker obtains shared credential
↓
production dependency accepts it
↓
production data accessed

Impact:
environment boundary collapse
```

These are the threat scenarios you need to produce.

Think through:

- asset

- attacker

- capability

- entry point

- trust boundary

- security invariant

- privilege

- intermediate pivot

- target

- impact

- detection

- recovery

For every serious threat you must be able to answer:

> What does the attacker desire?

> Where do they start?

> What legitimate capabilities do they already possess?

> Which trust boundary must they cross?

> Which security assumption or invariant do they attack?

> Which existing controls halt them?

> What occurs if the primary control fails?

> What is the blast radius?

> How would we detect the attack?

> How would we recover?

If there is insufficient evidence that the scenario genuinely exists:

**PLAUSIBLE THREAT, NOT CONFIRMED WEAKNESS.**

If a control clearly and demonstrably halts the scenario:

**CONTROLLED.**

If a key architectural fact is unconfirmed:

**NOT VERIFIED.**

It is better to produce 10 realistic threat scenarios tracing a concrete system from attacker to asset than 200 generic security items.

The goal is to produce a forensically precise Threat Model that directly translates into:

- security requirements

- penetration-test plan

- authorization tests

- failure-injection tests

- architecture hardening

- monitoring rules

- incident-response playbooks

- prioritized security roadmap
