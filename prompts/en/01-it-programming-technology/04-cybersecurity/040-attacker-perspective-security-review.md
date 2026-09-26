---
id: UPL-IT-040
number: 40
slug: attacker-perspective-security-review
title: Attacker-Perspective Security Review
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# ATTACKER-PERSPECTIVE SECURITY REVIEW

I want you to perform a maximally deep, systematic, evidence-first, and attacker-oriented analysis of the application from the perspective of a realistic attacker.

Main objective:

> View the system the way an attacker would: find the cheapest entry points, least protected functions, privilege escalation paths, cross-tenant pivots, credential reuse, trusted-boundary weaknesses, parser/file surfaces, abuse possibilities, supply-chain avenues, and multi-step exploit chains that realistically lead to significant impact.

This is not:

- a generic penetration-test checklist

- automatically scanning everything and reporting every anomaly

- merely an OWASP audit

- merely an auth audit

- merely an IDOR audit

- merely a threat model

- automatically tagging every theoretical weakness as exploitable

- an attempt at destructive exploitation

- unauthorized access to third-party systems

- a generic list of payloads without understanding the application

The focus is on the question:

> If I am an attacker with the lowest possible initial privilege, what is the shortest, most realistic, and cheapest path to achieve significant data, privilege, financial, or system impact?

Priority:

**practical exploit chains > auth bypass > privilege escalation > cross-tenant access > credential compromise > server-side pivots > destructive business abuse > persistence > lateral movement > stealth/detection gaps > hardening**

It is better to identify 5 realistic attack chains with clear origins, pivots, and final impacts than to write 200 isolated security findings without prioritization.

---

# 1. START AS AN ATTACKER

Do not start with the source code.

Start with the questions:

```text
What is publicly accessible?

What can I achieve without an account?

What can I achieve with an ordinary account?

What can I achieve if I steal a session?

What can I achieve if I acquire an API key?

What can I achieve if I compromise staging or CI?
```

---

# 2. ATTACKER TIERS

Use distinct scenarios:

```text
T0 - anonymous internet attacker
T1 - registered user
T2 - paid/premium user
T3 - tenant admin
T4 - compromised ordinary session
T5 - compromised API key
T6 - compromised internal/service credential
T7 - malicious contributor / PR author
T8 - compromised CI/build system
```

Employ only those that are relevant.

---

# 3. DO NOT GRANT THE ATTACKER FREE PRIVILEGES

If a scenario requires:

- admin

- VPN

- cloud root

- DB access

this must be an explicit precondition.

---

# 4. ENTRY POINT INVENTORY

An attacker first observes:

- public web

- API

- login

- registration

- password reset

- OAuth

- uploads

- webhooks

- GraphQL

- WebSockets

- search

- exports

- callbacks

- mobile endpoints

- legacy endpoints

- admin/login panels

---

# 5. PASSIVE RECON

Without destructive testing, identify:

- frameworks

- public routes

- JS bundles

- API calls

- response headers

- errors

- public schemas

- mobile/desktop endpoints

- storage URLs

---

# 6. PUBLIC FRONTEND AS DOCUMENTATION

Client code can reveal:

- hidden endpoints

- feature flags

- route names

- role names

- model fields

- internal API paths

---

# 7. SOURCE MAP

If public:

can simplify reconnaissance.

Do not treat as a serious vulnerability without an additional attack path.

---

# 8. API DISCOVERY

Compare:

```text
frontend calls
OpenAPI
actual registered routes
legacy/mobile routes
```

---

# 9. UNDOCUMENTED ENDPOINT

For an attacker, an endpoint is relevant if it is reachable, not if it is documented.

---

# 10. ATTACK SURFACE RANKING

For each entry point evaluate:

```text
required privilege
input control
side-effect power
data sensitivity
cost amplification
```

---

# 11. SEEK THE CHEAPEST PIVOT

If an attacker can:

```text
anonymous

↓

create free account
```

then the attack surface expands sharply.

---

# 12. REGISTRATION

Test the abuse model:

- unlimited accounts

- referral

- credits

- free resources

- upload

- invites

according to the feature set.

---

# 13. LOGIN

Look for:

- enumeration

- rate bypass

- legacy auth path

- weak reset flow

---

# 14. PASSWORD RESET

Frequently the cheapest takeover path.

---

# 15. MFA BYPASS

Look for alternative flows.

---

# 16. OAUTH ACCOUNT LINKING

Look for identity confusion.

---

# 17. SESSION

Ask:

> If I steal a single normal session, how far can I go?

---

# 18. SESSION PERSISTENCE

Test:

- logout

- password change

- role revoke

- user disable

---

# 19. AUTH TOKEN

If an attacker possesses a valid low-privilege token:

look for vertical/horizontal escalation.

---

# 20. API KEY

Ask:

- scopes

- tenant

- environment

- write access

- alternate routes

---

# 21. IDOR HUNTING

For each reachable resource:

```text
valid own ID

↓

different valid ID
```

---

# 22. CROSS-TENANT HUNTING

Tenant A credential + Tenant B resource.

---

# 23. NESTED RESOURCE PIVOT

Authorized parent + unauthorized child.

---

# 24. FILTER OVERRIDE

Attempt to override server-required scopes via query/body parameters.

---

# 25. BULK ENDPOINT

An attacker particularly targets bulk endpoints because a single request can bypass:

- item auth

- quotas

- rate limits

---

# 26. EXPORT

One of the most valuable data-exfiltration paths.

---

# 27. SEARCH

Can assist with enumeration and harvesting resource IDs.

---

# 28. AUTOCOMPLETE

Can leak private identifiers.

---

# 29. FILES

Look for:

- upload bypass

- cross-user read

- signed URL abuse

- preview route

- thumbnail route

- same-origin active content

---

# 30. STORED CONTENT

An attacker can store a payload and wait for it to be viewed by:

- admin

- support

- moderator

---

# 31. STORED XSS PIVOT

Classic path:

```text
normal user

↓

stored XSS

↓

admin browser

↓

privileged API action
```

---

# 32. SSRF PIVOT

Classic path:

```text
public URL fetch

↓

backend

↓

internal service
```

---

# 33. INTERNAL SERVICE TRUST

If an internal endpoint lacks authentication because it is "not public":

SSRF can convert that into a privileged pivot.

---

# 34. WEBHOOK

An attacker looks for:

- unsigned endpoint

- weak signature

- replay

- tenant mapping confusion

---

# 35. CALLBACK

An OAuth/payment callback can serve as an excellent pivot if local state is not strictly bound.

---

# 36. PAYMENT/BUSINESS ACTIONS

Look for:

- price tampering

- duplicate action

- replay

- negative values

- refund abuse

- free-credit abuse

---

# 37. ONE-TIME TOKENS

Invite, coupon, reset, promo, download.

Test race conditions/reuse.

---

# 38. CONCURRENCY

An attacker does not have to send requests sequentially.

Attempt:

```text
A || B
```

against:

- coupon

- credit

- refund

- invite

- reset

- quota

---

# 39. RATE LIMIT BYPASS

Ask:

- IP

- account

- tenant

- endpoint

- trusted proxy

---

# 40. DIRECT ORIGIN

If a WAF/gateway is present:

seek origin bypasses.

---

# 41. TRUSTED HEADER

The attacker attempts:

```text
X-Internal

X-User

X-Role

X-Tenant
```

where they exist.

---

# 42. LEGACY ROUTE

The most fruitful attacker path is frequently an old endpoint that the development team no longer uses.

---

# 43. MOBILE API

An older app version can expose weaker server routes.

---

# 44. API VERSION DRIFT

Compare V1 and V2 as an attacker.

---

# 45. DEBUG ROUTE

Look for:

- token issue

- data dump

- test mail

- reset

- reindex

- run job

---

# 46. ADMIN PANEL

The attacker looks not only for login, but:

- weak alternative auth

- reset

- impersonation

- support workflow

---

# 47. SUPPORT FUNCTION

Frequently holds more authority than an ordinary user and weaker UX-focused security.

---

# 48. IMPERSONATION

If an attacker elevates to support privilege, this can become universal account takeover.

---

# 49. MASS ASSIGNMENT

The attacker injects fields that the UI never transmits.

---

# 50. ROLE

```text
role=admin
```

---

# 51. OWNER

```text
ownerId=attacker
```

---

# 52. TENANT

```text
tenantId=victim
```

---

# 53. STATUS

```text
status=approved
```

---

# 54. PLAN

```text
plan=enterprise
```

---

# 55. BALANCE/CREDIT

Client-side authority is a high-value attacker target.

---

# 56. HIDDEN PARAMETER

Discover model/schema fields that the UI does not employ.

---

# 57. INCLUDE / EXPAND

The attacker attempts to extract extra relationships/fields.

---

# 58. RAW FILTER

The attacker attempts to bypass server-side scoping.

---

# 59. GRAPHQL

An exceptional attacker surface for:

- aliases

- deep queries

- hidden fields

- generic node IDs

- mutations

---

# 60. GLOBAL NODE ID

Look for cross-resource access.

---

# 61. GRAPHQL ALIAS AMPLIFICATION

One request, multiple resolver executions.

---

# 62. WEBSOCKET

Following the handshake, the attacker attempts:

- another tenant's topic

- arbitrary resource ID

- privileged command

---

# 63. MESSAGE RATE

The HTTP rate limiter may no longer apply.

---

# 64. QUEUE

If an attacker can influence the job payload:

this is a pivot toward a system-privileged worker.

---

# 65. USER -> SYSTEM WORKER

One of the most valuable trust escalations.

---

# 66. DELAYED JOB

Authorization/state can become stale.

---

# 67. JOB REPLAY

Duplicate delivery from the queue can trigger duplicate business effects.

---

# 68. EMAIL/SMS

The attacker can transform an endpoint into a spam/cost amplifier.

---

# 69. THIRD-PARTY API

If a single application action initiates an expensive provider call:

look for abuse.

---

# 70. AI API

If present:

- token cost

- prompt injection

- tool execution

detailed AI security audit follows later.

---

# 71. UPLOAD

The attacker considers:

```text
What does the server do with my bytes?
```

---

# 72. FILE TYPE

Attempt a mismatch.

---

# 73. FILENAME

Path traversal/metadata XSS.

---

# 74. PARSER

The attacker seeks:

- network access

- filesystem access

- decompression

- shell subprocess

---

# 75. REMOTE IMPORT

Combination:

- SSRF

- oversized response

- malicious file

---

# 76. ARCHIVE

Zip Slip/decompression bomb.

---

# 77. SAME-ORIGIN ACTIVE FILE

The attacker uploads HTML/SVG and attempts to have it served under the trusted origin.

---

# 78. PUBLIC STORAGE

Look for enumeration/ACL flaws.

---

# 79. SIGNED URL

Look for scope/reuse/long expiry.

---

# 80. DATABASE INPUT

Trace attacker input to:

- raw SQL

- NoSQL operators

- sort/filter

---

# 81. COMMAND EXECUTION

Trace user input to:

- shell

- CLI tool

- converter

- script runner

---

# 82. TEMPLATE

Trace user input to template sources.

---

# 83. DESERIALIZATION

Trace attacker-controlled objects/files to unsafe loaders.

---

# 84. HOST HEADER

The attacker attempts to influence:

- reset URL

- callback

- absolute links

---

# 85. OPEN REDIRECT

In isolation, frequently low impact.

However, an attacker leverages it as a chain component.

---

# 86. CACHE

Attempt:

```text
User A warms cache

↓

User B retrieves
```

---

# 87. CDN

Authenticated data + shared cache is high-value.

---

# 88. TENANT CACHE CONFUSION

Cache key without tenant scoping.

---

# 89. CLIENT-SIDE CACHE

A shared device/service worker may retain private data.

---

# 90. SECRETS

The attacker hunts in:

- JS bundle

- source

- logs

- error responses

- CI

- Docker

- mobile binary

---

# 91. PUBLIC BUNDLE

Everything in the browser is attacker-readable.

---

# 92. MOBILE/DESKTOP BINARY

Likewise.

---

# 93. SOURCE CONTROL

A committed secret is a high-value pivot.

---

# 94. GIT HISTORY

A secret "deleted" a year ago may still remain valid.

---

# 95. LOGS

Stealing a session/token through logs can be simpler than exploiting a vulnerability.

---

# 96. ERROR TRACKER

Sensitive breadcrumbs/local variables.

---

# 97. CI/CD

An attacker with PR capabilities asks:

> Can I force CI to execute my code in the presence of privileged secrets?

---

# 98. `pull_request_target`

High-value review surface.

---

# 99. BUILD SCRIPTS

Dependency/postinstall/build plugins execute code.

---

# 100. THIRD-PARTY ACTION

An attacker can target the supply chain instead of the application.

---

# 101. DEPENDENCY CONFUSION

Internal package name + public registry.

---

# 102. MALICIOUS PACKAGE

Build-time privilege may suffice.

---

# 103. RELEASE PIPELINE

If an attacker acquires a publish/deploy token:

an application exploit is no longer necessary.

---

# 104. SIGNING KEY

Crown jewel.

---

# 105. DESKTOP UPDATER

The attacker looks for an unsigned/fail-open update path.

---

# 106. STAGING

An attacker frequently targets the weaker environment first.

---

# 107. ENVIRONMENT PIVOT

Ask:

```text
staging credential

↓

production?
```

---

# 108. SHARED SECRET

One of the most frequent boundary collapses.

---

# 109. SHARED DATABASE

The staging app may possess production data/credentials.

---

# 110. SHARED STORAGE

Likewise.

---

# 111. DEV TOOL

Debug/internal tooling active in production.

---

# 112. DEFAULT CREDENTIAL

The attacker will attempt defaults.

---

# 113. DEFAULT SECRET FALLBACK

If an environment variable is omitted.

---

# 114. CLOUD/IAM

If credentials leak:

determine the shortest pivot:

```text
key

↓

storage

↓

secrets

↓

production
```

---

# 115. SERVICE CREDENTIAL

May hold far greater privileges than the application requires.

---

# 116. LATERAL MOVEMENT

Compromising a single service is not the ultimate objective.

Ask what else it can invoke.

---

# 117. NETWORK

Which internal services are reachable from the compromised application process?

---

# 118. METADATA SERVICE

Only if the platform architecture makes it relevant.

---

# 119. INTERNAL DNS

Can aid an attacker following SSRF/RCE.

---

# 120. DATABASE CREDENTIAL

Ask:

- read

- write

- DDL

- superuser

---

# 121. REDIS

If exposed/compromised internally:

can contain:

- sessions

- cache

- queues

---

# 122. QUEUE BROKER

If an attacker can publish:

they may compel a privileged worker to execute actions.

---

# 123. OBJECT STORAGE

Can contain:

- uploads

- backups

- artifacts

---

# 124. BACKUPS

The attacker seeks a less protected copy of the same data.

---

# 125. AUDIT LOG

An attacker with privileged access may seek to erase trails.

---

# 126. LOG DELETE

A threat to repudiation/detection.

---

# 127. PERSISTENCE

Following initial compromise, the attacker seeks persistence mechanisms.

---

# 128. CREATE ADMIN

The most straightforward approach.

---

# 129. CREATE API KEY

Superior stealth/persistence.

---

# 130. ADD OAUTH IDENTITY

Can survive password resets if account recovery fails to detach the identity link.

---

# 131. CREATE SERVICE CREDENTIAL

Even more durable.

---

# 132. DEPLOY BACKDOOR

If CI/deployment access exists.

---

# 133. SCHEDULED JOB

Persistence through cron/worker tasks.

---

# 134. WEBHOOK

The attacker can register an outbound webhook to exfiltrate future data.

---

# 135. ACCESS TOKEN

Long-lived credential.

---

# 136. NEW SSH KEY

If infrastructure context exists.

---

# 137. DETECTION EVASION

Do not develop stealth techniques to exploit real systems.

However, audit whether critical actions have logging.

---

# 138. AUDIT COVERAGE

Ask whether logging captures:

- role change

- API key creation

- MFA reset

- admin impersonation

- export

- deploy

---

# 139. LOG INTEGRITY

Can an actor delete their own audit trail?

---

# 140. ALERTING

Does a high-risk action generate a monitoring alert?

---

# 141. ATTACK CHAIN FORMAT

For every serious chain, use:

```text
Chain ID:

Goal:

Attacker:

Initial privilege:

Initial entry point:

Step 1:

Step 2:

Step 3:

Step 4:

Final capability:

Target asset:

Impact:

Prerequisites:

Evidence per step:

Weakest step:

Current controls:

Detection:

Persistence:

Blast radius:

Confidence:

Recommended break point:
```

---

# 142. EVIDENCE PER STEP

Mark each chain step:

```text
CONFIRMED

LIKELY

NOT VERIFIED
```

---

# 143. A CHAIN CANNOT BE STRONGER THAN ITS WEAKEST STEP

If a single pivotal step is not confirmed:

the entire chain is unconfirmed.

---

# 144. ATTACKER EFFORT

Use:

```text
TRIVIAL

LOW

MODERATE

HIGH
```

---

# 145. INITIAL ACCESS COST

An anonymous exploit holds a different priority from an exploit demanding global admin credentials.

---

# 146. RELIABILITY

Does the attack function:

- deterministically

- frequently

- race-based

- only theoretical

---

# 147. AUTOMATABILITY

Can the attacker automate across:

- all users

- all IDs

- all tenants

---

# 148. BLAST RADIUS

Use:

```text
SINGLE RESOURCE

SINGLE USER

SINGLE TENANT

MULTI-TENANT

GLOBAL
```

---

# 149. IMPACT DIMENSIONS

```text
CONFIDENTIALITY

INTEGRITY

AVAILABILITY

PRIVILEGE

FINANCIAL

PERSISTENCE

SUPPLY CHAIN
```

---

# 150. SEVERITY

## P0 - CRITICAL

- practical anonymous/low-privilege chain to global production takeover

- chain enables arbitrary admin identity or deploy/code execution

- multi-tenant catastrophic compromise

- signing/deploy/cloud crown-jewel compromise with direct production impact

## P1 - HIGH

- practical account takeover

- cross-tenant access

- privilege escalation

- sensitive server/internal pivot

- persistent high-value compromise

- strong CI/supply-chain compromise path

## P2 - MEDIUM

- meaningful chained abuse with additional preconditions

- limited data/privilege escalation

- costly resource abuse

- constrained persistence

## P3 - LOW

- minor reconnaissance/metadata/edge-case path

## P4 - HARDENING

- attacker friction/defense-in-depth improvements without a confirmed exploit chain

---

# 151. DO NOT COMBINE WEAK FINDINGS AUTOMATICALLY

Three low findings do not become a P0 simply because you chain them together.

The chain must genuinely expand capability.

---

# 152. EXPLOIT CHAIN BREAKPOINT

For each chain, identify the cheapest location where it can be severed.

---

# 153. FIX ROOT STEP

If the chain is:

```text
IDOR

↓

data

↓

admin token
```

the primary remediation is the IDOR/secret exposure, not merely monitoring.

---

# 154. DEFENSE IN DEPTH

Following the root remediation, apply a secondary defense where appropriate.

---

# 155. ATTACK PATH 1 - ANONYMOUS TO ACCOUNT

Look for:

- reset

- magic link

- OAuth linking

- session fixation

---

# 156. ATTACK PATH 2 - USER TO OTHER USER

Look for:

- IDOR

- file

- export

- cache

---

# 157. ATTACK PATH 3 - USER TO TENANT ADMIN

Look for:

- role field

- invite role

- function-level auth

---

# 158. ATTACK PATH 4 - TENANT ADMIN TO GLOBAL ADMIN

Specifically check role naming/scope confusion.

---

# 159. ATTACK PATH 5 - USER TO SYSTEM WORKER

Through:

- queue

- export

- import

- background job

---

# 160. ATTACK PATH 6 - WEB TO INTERNAL NETWORK

Through:

- SSRF

- parser

- callback

---

# 161. ATTACK PATH 7 - USER TO SERVER CODE

Through:

- command injection

- SSTI

- unsafe deserialization

- executable upload

---

# 162. ATTACK PATH 8 - FILE TO ADMIN

Stored XSS/malicious file.

---

# 163. ATTACK PATH 9 - SECRET TO PRIVILEGE

Exposed credential -> provider/admin.

---

# 164. ATTACK PATH 10 - STAGING TO PROD

Environment boundary.

---

# 165. ATTACK PATH 11 - PR TO PROD

Supply chain.

---

# 166. ATTACK PATH 12 - THIRD PARTY TO APP

Webhook/vendor JS/provider callback.

---

# 167. ATTACK PATH 13 - APP TO CUSTOMER DATA

Compromised service credential + data store.

---

# 168. ATTACK PATH 14 - CACHE TO DATA LEAK

Shared/private cache confusion.

---

# 169. ATTACK PATH 15 - BUSINESS LOGIC TO FINANCIAL LOSS

Concurrency/replay/tampering.

---

# 170. EXPENSIVE OPERATION ABUSE

Identify the cheapest request that initiates the most costly backend operation.

---

# 171. AMPLIFICATION FACTOR

Where feasible:

```text
1 attacker request
→ N DB ops
→ N jobs
→ N external calls
→ N bytes
```

---

# 172. STORAGE ABUSE

Public upload/free account.

---

# 173. EMAIL/SMS ABUSE

Cost/reputation.

---

# 174. QUEUE FLOOD

Small producer cost -> large backlog.

---

# 175. EXPORT FLOOD

CPU/storage/provider cost.

---

# 176. GRAPHQL AMPLIFICATION

Aliases/depth.

---

# 177. AI COST AMPLIFICATION

If an AI feature exists.

---

# 178. TOKEN LIFETIME

If an attacker steals a token:

how long does the privilege endure?

---

# 179. REVOCATION

Can a defender genuinely evict the attacker?

---

# 180. PERSISTENCE TEST

Following:

- logout

- password reset

- key rotation

verify whether attacker-created persistence endures.

---

# 181. USER DISABLE

Do API keys/OAuth links/jobs remain active?

---

# 182. ADMIN DEMOTION

Do previously issued tokens retain privileged access?

---

# 183. KEY ROTATION

Does the old key truly cease functioning?

---

# 184. DEPLOY ROLLBACK

Can a rollback reintroduce a vulnerable configuration/secret?

---

# 185. INCIDENT CHAIN

For each P0/P1 ask:

> If this is exploited on a Friday night, how do we shut it down?

---

# 186. CONTAINMENT

Map:

- revoke

- disable route

- rotate secret

- block artifact

- isolate service

---

# 187. FORENSIC EVIDENCE

What logs exist to establish:

- actor

- affected data

- duration

- actions

---

# 188. LOG GAP

Without evidence, the blast radius may remain indeterminate.

---

# 189. ATTACK REPLAY TEST

Critical one-time actions.

---

# 190. DOUBLE EXECUTION

Financial/business operations.

---

# 191. FAILURE INJECTION

An attacker sometimes leverages failure:

```text
make provider timeout

↓

force retry

↓

duplicate effect
```

---

# 192. UNKNOWN OUTCOME

External mutation timeouts are attacker-relevant if retries lack idempotency.

---

# 193. PARTIAL FAILURE

Multi-step operations can leave an exploitable state.

---

# 194. STEP ORDER

Ask whether an attacker can abort the flow between security-relevant steps.

---

# 195. EMAIL CHANGE FLOW

Identity change.

---

# 196. OWNERSHIP TRANSFER FLOW

Privilege change.

---

# 197. TENANT LEAVE/DELETE

Stale permissions.

---

# 198. INVITE FLOW

Role/tenant binding.

---

# 199. API KEY CREATION FLOW

Persistence.

---

# 200. MFA RESET FLOW

Account takeover.

---

# 201. ATTACKER-PERSPECTIVE FINDING FORMAT

```text
ID:

Severity:

Category:

Confidence:

Status:

Evidence tier:

Attacker:

Initial privilege:

Entry point:

Target:

Target asset:

Target tenant/user:

Attack objective:

Recon evidence:

Attack path:

Step 1:

Evidence:

Step 2:

Evidence:

Step 3:

Evidence:

Step 4:

Evidence:

Final capability:

Security boundary crossed:

Alternative paths:

Automation potential:

Attacker effort:

User interaction required:

Persistence:

Detection:

Containment:

Blast radius:

Impact:

Root causes:

Primary remediation:

Secondary hardening:

Regression test:

Production verification:

Complexity:

XS / S / M / L / XL
```

---

# 202. CATEGORY

Use:

```text
ACCOUNT TAKEOVER

AUTH BYPASS

PRIVILEGE ESCALATION

IDOR

CROSS-TENANT

SERVER PIVOT

SSRF

CODE EXECUTION

FILE

SECRET COMPROMISE

SUPPLY CHAIN

BUSINESS ABUSE

RESOURCE ABUSE

PERSISTENCE

LATERAL MOVEMENT
```

---

# 203. CONFIDENCE

```text
HIGH

MEDIUM

LOW
```

---

# 204. STATUS

```text
CONFIRMED CHAIN

PARTIALLY CONFIRMED

PLAUSIBLE

THEORETICAL

NOT VERIFIED
```

---

# 205. EVIDENCE TIER

```text
A - safely reproduced end-to-end

B - every technical step confirmed from executable paths

C - strong multi-step static/config evidence

D - partial chain with unknown critical step

E - theoretical
```

---

# 206. FALSE-POSITIVE PREVENTION

Before reporting a P0/P1 chain verify:

1. initial attacker capability

2. entry point reachability

3. authentication

4. authorization

5. actual data/control transition

6. each pivot

7. environment/network exposure

8. final capability

9. blast radius

10. exploit reproducibility

---

# 207. DO NOT BUILD A CHAIN FROM UNCONNECTED FINDINGS

If finding A does not furnish the capability required for B:

that is not a chain.

---

# 208. DO NOT ASSUME THE ATTACKER KNOWS THE SECRET

If a chain requires a secret, it must first explain how it is obtained.

---

# 209. DO NOT ASSUME INTERNAL ACCESS

It must have a pivot.

---

# 210. DO NOT ASSUME ADMIN

If the attacker must already be a global admin, most of the attack chain loses its value.

---

# 211. DO NOT USE SECURITY THROUGH OBSCURITY AS PRIMARY DEFENSE

An undocumented UUID route is not a real boundary.

---

# 212. DO NOT EXECUTE DESTRUCTIVE TESTS

Do not:

- delete production data

- transmit real malware

- spend actual funds

- access third-party data

- initiate denial-of-service

- attempt RCE against unauthorized systems

---

# 213. SAFE PROOF

Prefer:

- controlled test tenant

- synthetic canary

- non-destructive requests

- local/staging reproduction

- static executable path proof

---

# 214. OUTPUT - ATTACKER_PERSPECTIVE_SECURITY_REVIEW.md

Structure the final report:

## 1. Executive Summary

- attacker tiers

- easiest initial access

- top exploit chains

- highest-value pivots

- biggest blast-radius risks

## 2. Attacker Models

## 3. External Recon Surface

## 4. Entry Point Ranking

## 5. Anonymous Attack Paths

## 6. Registered User Attack Paths

## 7. Compromised Session Attack Paths

## 8. API Key Attack Paths

## 9. Privilege Escalation Paths

## 10. Cross-User / Cross-Tenant Paths

## 11. Admin / Support Paths

## 12. SSRF / Internal Pivot Paths

## 13. File / Parser Paths

## 14. Code Execution Paths

## 15. Business Logic Abuse Paths

## 16. Resource / Cost Abuse Paths

## 17. Secret Compromise Paths

## 18. Staging -> Production Paths

## 19. CI / Supply Chain Paths

## 20. Third-Party Compromise Paths

## 21. Persistence Paths

## 22. Lateral Movement Paths

## 23. Detection / Evidence Gaps

## 24. Containment Analysis

## 25. Findings Summary

| ID | Severity | Attacker | Initial access | Final capability | Blast radius | Confidence |
|---|---|---|---|---|---|---|

## 26. P0 Chains

## 27. P1 Chains

## 28. P2 Chains

## 29. P3 Findings

## 30. P4 Hardening

## 31. Things Done Well

## 32. Not Verified

## 33. Attack Chain Breakpoints

## 34. Remediation Roadmap

---

# 215. ATTACK CHAIN MATRIX

| Chain | Start | Pivot | Final capability | Risk |
|---|---|---|---|---|

---

# 216. ENTRY POINT MATRIX

| Entry point | Minimum privilege | Input power | Side effect | Attacker value |
|---|---|---|---|---|

---

# 217. PRIVILEGE ESCALATION MATRIX

| Start privilege | Mechanism | New privilege | Evidence |
|---|---|---|---|

---

# 218. PERSISTENCE MATRIX

| Persistence method | Required privilege | Survives password reset | Survives logout | Detection |
|---|---|---|---|---|

---

# 219. LATERAL MOVEMENT MATRIX

| Compromised component | Credential/network access | Reachable targets | Risk |
|---|---|---|---|

---

# 220. SECOND PASS - ANONYMOUS ONLY

Repeat the audit with the strict rule:

```text
attacker has no account

no credentials

no internal access
```

Identify the strongest possible impact.

---

# 221. SECOND PASS - FREE USER ONLY

Assume the attacker can legally create an ordinary account.

Ask how much the attack surface expands.

---

# 222. SECOND PASS - STOLEN SESSION

Assume one normal user session.

Ask:

- privilege escalation

- persistence

- tenant crossing

---

# 223. SECOND PASS - TENANT ADMIN

Assume a compromised tenant admin.

Ask:

> Can they cross their tenant?

---

# 224. SECOND PASS - API KEY

Assume a leak of one integration key.

Identify the strongest alternate API path.

---

# 225. SECOND PASS - MALICIOUS FILE

A single routinely permitted upload.

Trace all the way to:

- parser

- browser

- admin

- internal network

---

# 226. SECOND PASS - SSRF

Assume control of one server-side URL destination value.

Identify the most valuable reachable internal target, without accessing unauthorized systems.

---

# 227. SECOND PASS - ONE IDOR

If you confirm one cross-user read:

ask:

> Does the data from it contain a new credential, identifier, or capability for the next pivot?

---

# 228. SECOND PASS - ONE XSS

If you confirm XSS:

ask:

- who views the payload

- which API actions their browser can execute

- whether CSP/HttpOnly/re-auth exist

---

# 229. SECOND PASS - ONE SECRET

If you confirm an exposed key:

determine its permissions/blast-radius model.

Do not use the key unauthorized.

---

# 230. SECOND PASS - STAGING

Assume staging is fully compromised.

Ask what it shares with production.

---

# 231. SECOND PASS - CI

Assume an attacker can execute arbitrary code inside a CI job.

Ask:

- which secrets

- tokens

- artifacts

- registries

- deploy targets

---

# 232. SECOND PASS - PROVIDER COMPROMISE

Assume one critical third party delivers a malicious but valid response/event.

Ask what the local application automatically trusts.

---

# 233. SECOND PASS - RETRY

Assume an external action succeeds, but the response is lost.

Ask whether retrying produces duplicate financial/business effects.

---

# 234. SECOND PASS - CACHE

Attempt cross-user/cross-tenant cache confusion.

---

# 235. SECOND PASS - LEGACY

For every new protected function, locate the legacy alternative.

---

# 236. SECOND PASS - SUPPORT

Identify support/admin workflows that could grant an attacker persistence or account takeover if compromised.

---

# 237. SECOND PASS - DETECTION

For each P0/P1 chain ask:

> Would a defender detect Step 1, the pivot, and the final action?

If not:

mark a monitoring gap.

---

# 238. SECOND PASS - CONTAINMENT

For each P0/P1 chain, define the fastest safe method to sever it during an incident.

---

# 239. SECOND PASS - MULTIPLE PATHS TO SAME CROWN JEWEL

For:

- admin identity

- signing key

- production deploy

- tenant data

- payment authority

identify all distinct attack paths.

---

# 240. FINAL QUALITY GATE

Before the final response verify:

- the attacker starts with clearly defined minimum privileges

- actual reachable surfaces are separated from theoretical ones

- legacy/mobile/admin/internal paths are included

- every exploit chain possesses capability transfer between steps

- no chain skips an unexplained privilege or network step

- attack chain severity is no greater than the actual final impact

- cross-user and cross-tenant paths are explicitly tested

- files/parsers are analyzed as possible pivots

- SSRF is analyzed as a web-to-internal pivot

- queue/worker is analyzed as a user-to-system pivot

- supply chain is analyzed as a contributor-to-production pivot

- staging is analyzed as a possible production pivot

- exposed credentials include scope/blast-radius analysis

- persistence is analyzed following the initial compromise

- logout/password reset/key rotation are not presumed to be complete containment measures

- monitoring and forensic evidence are included

- root break point is stated for every serious chain

- destructive proof was not employed

- theoretical chains are clearly separated from confirmed chains

- P4 hardening is not conflated with exploitable attack paths

---

# FINAL RULE

I do not want a report of the type:

> The attacker may attempt XSS, SQL injection, brute force, and DDoS.

That is not an attacker-perspective review.

I am seeking chains such as:

```text
Initial attacker:
ordinary registered user

↓
uploads SVG profile image

↓
SVG served inline from main application origin

↓
support agent opens user profile

↓
stored active content executes in support browser

↓
support session can call:
/admin/users/:id/reset-mfa

↓
attacker targets own account first to prove capability

↓
same primitive could target other users

Final capability:
privileged account-management actions
```

or:

```text
Initial attacker:
anonymous

↓
finds legacy /v1/export endpoint

↓
endpoint requires API key but accepts public frontend key

↓
body allows tenantId

↓
worker runs export with system privilege

↓
tenantId is not re-authorized

↓
cross-tenant export generated

Final capability:
bulk private-data exfiltration
```

or:

```text
Initial attacker:
free user

↓
creates webhook URL pointing to attacker-controlled server

↓
application performs validation fetch

↓
attacker server redirects to internal admin service

↓
backend follows redirect

↓
internal service trusts source network

↓
privileged internal action triggered

Final capability:
web-to-internal privilege pivot
```

or:

```text
Initial attacker:
malicious contributor

↓
modifies package postinstall script

↓
privileged CI workflow executes contributor code

↓
job exposes production deploy token

↓
token exfiltrated

↓
attacker uses deploy authority

↓
malicious production artifact published

Final capability:
global production code execution
```

or:

```text
Initial attacker:
normal user

↓
changes object ID in invoice endpoint

↓
receives another user's invoice

↓
invoice response includes private attachment capability URL

↓
capability URL exposes private storage object

↓
attachment contains integration credential

↓
credential grants tenant API access

Final capability:
cross-user read -> credential -> tenant compromise
```

or:

```text
Initial attacker:
customer

↓
submits refund

↓
provider completes refund

↓
network timeout hides response

↓
worker retries

↓
same provider operation has no idempotency protection

↓
refund happens again

Final capability:
repeatable financial loss
```

or:

```text
Initial attacker:
staging administrator

↓
reads staging environment config

↓
staging and production share JWT signing secret

↓
production does not validate environment-specific issuer/audience

↓
attacker signs production-valid admin token

Final capability:
staging-to-production identity escalation
```

These are the attacker paths you need to discover.

Think as an attacker through:

- easiest initial access

- strongest input

- cheapest privilege pivot

- alternate routes

- trusted boundaries

- secrets

- files

- internal systems

- CI

- persistence

- final crown jewel

For every serious chain you must be able to answer:

> What does the attacker start with?

> What is the first realistically reachable entry point?

> What new capability do they acquire after each step?

> Does that capability genuinely enable the subsequent step?

> Which trust boundary do they cross?

> What final asset or privilege do they achieve?

> What is the blast radius?

> How does the attacker maintain persistence?

> How would a defender sever the chain earliest and cheapest?

If a single pivotal step is not confirmed:

**PARTIALLY CONFIRMED** or **PLAUSIBLE**, not **CONFIRMED CHAIN**.

If the scenario is merely generically possible but unrelated to actual architecture:

**DO NOT REPORT AS FINDING.**

It is better to identify 5 realistic attack chains with clear capability transfer from initial access to final impact than to report hundreds of isolated security items.

The goal is to obtain a forensically precise Attacker-Perspective Security Review that directly translates into:

- penetration-test plan

- exploit regression tests

- attack-chain breakpoints

- privilege-boundary fixes

- lateral-movement reduction

- persistence hardening

- detection rules

- incident containment playbooks

- prioritized security remediation
