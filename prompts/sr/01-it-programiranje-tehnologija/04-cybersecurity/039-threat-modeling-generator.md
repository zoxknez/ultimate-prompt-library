---
id: UPL-IT-039
number: 39
slug: threat-modeling-generator
title: Threat Modeling Generator
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# THREAT MODELING GENERATOR

Želim da izgradiš maksimalno dubok, sistematski, evidence-first i production-oriented threat model kompletne aplikacije ili sistema.

Glavni cilj:

> Identifikovati najvažnije assets, trust boundaries, attacker modele, attack surfaces, abuse scenarios, privilege escalation puteve, cross-tenant rizike, data exposure scenarije i failure kombinacije pre nego što se pretvore u konkretne security incidente.

Ovo nije:

- generički STRIDE checklist bez konteksta

- nabrajanje svih mogućih cyber napada

- penetration test

- običan application security audit

- automatsko proglašavanje svake pretnje high severity

- izmišljanje infrastructure komponenti koje projekat nema

- pretpostavka da svaki attacker ima admin/network access

- samo DFD crtanje

- samo compliance dokument

Fokus je na pitanju:

> Šta sistem pokušava da zaštiti, od koga, preko kojih granica poverenja, i kojim realnim putem attacker može da pređe iz svog početnog položaja do značajnog impact-a?

Prioritet:

**critical assets > trust boundaries > attacker capabilities > realistic attack paths > privilege escalation > tenant/data isolation > destructive actions > persistence > detection gaps > theoretical hardening**

Bolje je pronaći 10 realnih threat scenarija sa kompletnim attack path-om nego napisati 200 generičkih STRIDE stavki.

---

# 1. UTVRDI SCOPE

Pre modelovanja definiši:

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

Ako nešto nije dostupno:

**NOT VERIFIED**

---

# 2. NE IZRADI THREAT MODEL IZ PRETPOSTAVKI

Prvo analiziraj:

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

Ako deo nije dostupan, označi ga kao unknown.

---

# 3. SYSTEM CONTEXT

Napravi high-level mapu:

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

Koristi samo stvarne komponente.

---

# 4. COMPONENT INVENTORY

Za svaku komponentu zabeleži:

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

Napravi tekstualni DFD za glavne flows.

Primer:

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

Dodaj:

- queue

- storage

- provider

- internal services

gde postoje.

---

# 6. TRUST BOUNDARIES

Eksplicitno označi gde data prelazi između različitih nivoa poverenja.

Primeri:

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

# 7. TRUST BOUNDARY NIJE SAMO NETWORK

Trust boundary može biti:

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

Identifikuj šta stvarno vredi zaštititi.

---

# 9. DATA ASSETS

Primeri:

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

Još važnije:

- admin privileges

- signing keys

- deploy credentials

- DB write access

- production config

- encryption keys

- package publish token

---

# 11. BUSINESS ASSETS

Primeri:

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

Primeri:

- login

- checkout

- API

- queue processing

- media playback

- critical jobs

---

# 13. ASSET CRITICALITY

Klasifikuj:

```text

CRITICAL

HIGH

MEDIUM

LOW

```

---

# 14. ASSET OWNER

Ako je poznato:

- user

- tenant

- company

- system

- third-party

---

# 15. SECURITY OBJECTIVES

Za svaki asset proceni:

```text

Confidentiality

Integrity

Availability

Authenticity

Authorization

Non-repudiation

```

Ne moraju svi biti jednako važni.

---

# 16. ATTACKER MODELS

Ne koristi jedan univerzalan "hacker".

---

# 17. UNAHTENTICATED INTERNET ATTACKER

Capabilities:

- javni endpoints

- arbitrary request input

- registration ako postoji

- public upload

---

# 18. AUTHENTICATED USER

Može imati mnogo veći attack surface.

---

# 19. MALICIOUS TENANT USER

Posebno za SaaS/multi-tenant.

---

# 20. TENANT ADMIN

Može zloupotrebiti legitimate higher privilege.

---

# 21. GLOBAL ADMIN

Threat može biti:

- compromised admin credential

- malicious insider

---

# 22. COMPROMISED API KEY

Modeluj šta attacker dobija sa njim.

---

# 23. COMPROMISED USER SESSION

Drugačiji scenario od password compromise-a.

---

# 24. COMPROMISED THIRD-PARTY

Provider/webhook/package/vendor može postati attacker-controlled.

---

# 25. MALICIOUS FILE

File sam predstavlja attacker-controlled input.

---

# 26. MALICIOUS DEPENDENCY

Build-time attacker model.

---

# 27. MALICIOUS CONTRIBUTOR

Može menjati source/PR, ali možda nema production secrets.

---

# 28. CI COMPROMISE

Attacker može izvršavati code u build environment-u.

---

# 29. CLOUD CREDENTIAL COMPROMISE

Posebno modeluj blast radius.

---

# 30. INSIDER

Ne izmišljaj employee access.

Modeluj samo ako sistem/org context to čini relevantnim.

---

# 31. ATTACKER CAPABILITY MATRIX

| Attacker | Network | Account | Tenant | Code access | Credential |

|---|---|---|---|---|---|

---

# 32. ENTRY POINT INVENTORY

Pronađi:

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

Za svaki third-party servis pitaj:

> Šta se dešava ako je on kompromitovan ili šalje malicious input?

---

# 34. DATA STORES

Modeluj:

- relational DB

- NoSQL

- Redis

- object storage

- local files

- logs

- backups

---

# 35. PRIVILEGE DOMAINS

Identifikuj nivoe:

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

Posebno threat-modeluj akcije koje menjaju privilege.

Primer:

```text

user

↓

role assignment

↓

admin

```

---

# 37. IDENTITY BOUNDARIES

Mapiraj:

- password

- session

- JWT

- API key

- OAuth

- service token

- webhook signature

---

# 38. TENANT BOUNDARY

Za multi-tenant sisteme ovo je jedan od najvažnijih trust boundaries.

---

# 39. ENVIRONMENT BOUNDARY

Dev/staging/prod moraju biti tretirani kao odvojeni trust domains ako jesu.

---

# 40. BUILD/PRODUCTION BOUNDARY

CI nije isto što i production, ali može imati production deploy capability.

---

# 41. ADMIN/USER BOUNDARY

Privileged functions.

---

# 42. SERVER/CLIENT BOUNDARY

Sve što ide client-u smatraj attacker-visible/modifiable.

---

# 43. SYSTEM WORKER BOUNDARY

Background job često radi sa više privileges nego user koji ga je pokrenuo.

---

# 44. THREAT ENUMERATION METODOLOGIJA

Koristi kombinaciju:

- STRIDE

- abuse cases

- attack trees

- privilege analysis

- data flow analysis

Ne koristi nijedan framework mehanički.

---

# 45. STRIDE - SPOOFING

Pitaj:

> Kako attacker može da se predstavi kao drugi principal?

---

# 46. STRIDE - TAMPERING

Pitaj:

> Koje data/state attacker može neovlašćeno promeniti?

---

# 47. STRIDE - REPUDIATION

Pitaj:

> Može li critical akcija da se izvrši bez pouzdanog actor/audit traga?

---

# 48. STRIDE - INFORMATION DISCLOSURE

Pitaj:

> Kako private data prelazi granicu ka pogrešnom principal-u?

---

# 49. STRIDE - DENIAL OF SERVICE

Pitaj:

> Koji je najjeftiniji request koji izaziva najskuplju server operaciju?

---

# 50. STRIDE - ELEVATION OF PRIVILEGE

Pitaj:

> Koji legitimni low-privilege input/path može dovesti do više privilegije?

---

# 51. NE ZAUSTAVLJAJ SE NA STRIDE LABEL-I

Svaka pretnja mora imati konkretan scenario.

---

# 52. ATTACK TREE

Za najkritičniji asset napravi attack tree.

Primer:

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

Svaki leaf treba da bude konkretna tehnička mogućnost.

---

# 54. ATTACK PATH

Koristi:

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

Najopasniji scenario često nije jedna vulnerability.

Primer:

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

# 56. NE IZMIŠLJAJ CHAIN

Svaki korak mora biti podržan arhitekturom ili jasno označen kao hypothetical.

---

# 57. ABUSE CASE

Threat model nije samo software exploit.

Primer:

```text

user creates 100,000 exports

↓

queue backlog

↓

other tenants delayed

```

---

# 58. BUSINESS ABUSE

Traži:

- promo abuse

- credit abuse

- referral abuse

- refund abuse

- invitation abuse

- resource creation spam

ako feature postoji.

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

Za critical data pronađi sve izlaze:

- API

- export

- file download

- logs

- backups

- third-party

- email

---

# 65. DATA INGEST PATHS

Pronađi:

- forms

- upload

- webhooks

- imports

- third-party sync

- queue

---

# 66. DATA PROCESSORS

Ko obrađuje attacker-controlled content?

---

# 67. DATA RETENTION

Stored attacker content može postati second-order threat kasnije.

---

# 68. CROWN JEWELS

Odredi 3-10 najkritičnijih assets.

---

# 69. CROWN JEWEL PATHS

Za svaki:

> Kako attacker može doći do njega?

---

# 70. ADMIN ACCOUNT

Ako postoji, uvek high-value target.

---

# 71. SIGNING KEY

Može predstavljati identity minting authority.

---

# 72. DATABASE WRITE ACCESS

Može zaobići application controls.

---

# 73. DEPLOY CREDENTIAL

Može omogućiti code execution kroz deployment.

---

# 74. OBJECT STORAGE ADMIN

Može otkriti/izbrisati private files.

---

# 75. AUDIT LOG

Može biti asset ako incident response zavisi od njega.

---

# 76. ATTACK SURFACE TO ASSET MAP

| Entry point | Attacker | Intermediate system | Target asset |

|---|---|---|---|

---

# 77. TRUST ASSUMPTIONS

Napravi listu svih implicitnih assumptions.

Primer:

```text

Requests reaching origin came through trusted gateway.

```

---

# 78. ASSUMPTION VALIDATION

Za svaku pretpostavku pitaj:

> Gde se ona tehnički enforce-uje?

---

# 79. "INTERNAL SERVICE IS TRUSTED"

Pitaj da li ga može pogoditi SSRF.

---

# 80. "CLIENT WILL NOT SEND THAT FIELD"

Nije security assumption koji sme da postoji.

---

# 81. "USER DOES NOT KNOW UUID"

Nije authorization.

---

# 82. "ONLY UI CAN TRIGGER THIS"

Nije validna server security pretpostavka.

---

# 83. "WEBHOOK COMES FROM PROVIDER"

Mora imati authenticity control.

---

# 84. "CI ACTION IS TRUSTED"

Pitaj:

- owner

- ref

- permissions

---

# 85. "PREVIEW ENV IS SAFE"

Pitaj da li ima production secrets/data.

---

# 86. SECURITY INVARIANTS

Definiši pravila koja nikad ne smeju biti prekršena.

Primer:

```text

User can never access another tenant's private document.

```

---

# 87. AUTH INVARIANTS

Primer:

```text

Only validated identity proof may issue a full session.

```

---

# 88. PRIVILEGE INVARIANTS

Primer:

```text

A principal cannot grant a privilege higher than its own grant ceiling.

```

---

# 89. FINANCIAL INVARIANTS

Primer:

```text

A payment/refund operation may have at most one business effect.

```

---

# 90. FILE INVARIANTS

Primer:

```text

User-controlled file paths may never escape the assigned storage namespace.

```

---

# 91. SUPPLY CHAIN INVARIANTS

Primer:

```text

Untrusted PR code must never execute with production signing credentials.

```

---

# 92. THREAT ID FORMAT

Koristi:

```text

TM-001

TM-002

TM-003

```

---

# 93. THREAT FORMAT

Svaka ozbiljna pretnja mora sadržati:

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

# 94. RISK PROCENA

Ne koristi lažnu matematičku preciznost.

Koristi:

```text

CRITICAL

HIGH

MEDIUM

LOW

```

ili postojeći organizational model.

---

# 95. RISK = THREAT, NE SAMO VULNERABILITY

Threat može biti high-risk i pre nego što postoji potvrđen bug ako:

- asset je critical

- exposure je realan

- controls su slabi

Ali jasno označi da li je finding potvrđen ili architectural risk.

---

# 96. STATUS

Koristi:

```text

CONFIRMED WEAKNESS

PLAUSIBLE THREAT

CONTROLLED

NOT APPLICABLE

NOT VERIFIED

```

---

# 97. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

---

# 98. EXISTING CONTROL

Za svaku threat:

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

Koristi:

```text

STRONG

PARTIAL

WEAK

UNKNOWN

```

---

# 100. PREVENTIVE CONTROL

Sprečava napad.

---

# 101. DETECTIVE CONTROL

Otkriva ga.

---

# 102. RECOVERY CONTROL

Smanjuje impact.

---

# 103. CONTROL GAP

Threat model treba da pokaže ne samo "postoji attack", nego:

> Koja kontrola nedostaje?

---

# 104. DEFENSE IN DEPTH

Za crown-jewel threats proveri da li failure jedne kontrole odmah daje total compromise.

---

# 105. SINGLE POINT OF SECURITY FAILURE

Primer:

```text

one shared signing secret

↓

all users/admin identities

```

---

# 106. BLAST RADIUS

Za svaki threat proceni:

```text

single resource

single user

single tenant

multiple tenants

global

```

---

# 107. PERSISTENCE

Može li attacker održati access nakon originalnog compromise-a?

Primer:

- create API key

- add admin

- deploy backdoor

- create OAuth connection

---

# 108. PRIVILEGE ESCALATION

Mapiraj:

```text

anonymous -> user

user -> tenant admin

tenant admin -> global admin

service -> cloud admin

```

---

# 109. LATERAL MOVEMENT

Može li compromise jednog service-a dati access drugom?

---

# 110. CREDENTIAL REUSE

Shared credentials povećavaju lateral movement.

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

Za svaki sensitive flow proveri:

- transport

- destination

- logs

- caching

- third parties

---

# 121. DATA FLOW INTEGRITY

Ko može menjati data u tranzitu ili pre processing-a?

---

# 122. DATA ORIGIN

Može li server razlikovati:

- genuine provider event

- attacker-crafted payload

---

# 123. REPLAY

Authenticated message nije nužno fresh.

---

# 124. ONE-TIME OPERATIONS

Threat-modeluj replay/race.

---

# 125. CONCURRENCY

Security invariant može pasti samo pod paralelnim requests.

---

# 126. TOCTOU

Check i action razdvojeni vremenski.

---

# 127. STALE AUTHORIZATION

Role revoke, old token, queued job.

---

# 128. STALE DATA

Delayed job izvršava više nevažeću business akciju.

---

# 129. FAILURE MODE THREATS

Pitaj:

> Šta se dešava kada security dependency padne?

---

# 130. AUTH SERVICE DOWN

Fail open ili fail closed?

---

# 131. POLICY STORE DOWN

---

# 132. SECRET MANAGER DOWN

---

# 133. DATABASE PARTIAL FAILURE

Može li security state ostati delimično promenjen?

---

# 134. QUEUE FAILURE

Može li required security action biti izgubljen?

Primer:

- revoke

- cleanup

- notification

---

# 135. LOGGING FAILURE

Ne treba da blokira critical security action bez posebnog razloga.

---

# 136. DETECTION MODEL

Za high-risk threat pitaj:

> Kako bismo znali da se ovo upravo dogodilo?

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

Cloud/provider logs mogu pokazati compromised token usage.

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

High-risk threat bez preventive ni detective control-a ima veći priority.

---

# 145. RESPONSE READINESS

Za crown-jewel threats pitaj:

- kako revoke-ujemo?

- kako izolujemo?

- kako vraćamo state?

---

# 146. COMPROMISED USER SESSION

Response:

- revoke session

- reset credential

- audit actions

---

# 147. COMPROMISED SIGNING KEY

Veći incident:

- rotate

- invalidate tokens

- redeploy

- investigate forged identities

---

# 148. COMPROMISED DEPLOY TOKEN

- revoke

- inspect deployments

- rotate downstream secrets ako potrebno

---

# 149. CROSS-TENANT LEAK

- stop path

- determine affected records

- evidence preservation

---

# 150. THREAT PRIORITIZATION

Prioritet određuj kroz:

- asset criticality

- attacker accessibility

- control weakness

- blast radius

- persistence

- detectability

---

# 151. EASY ATTACK + MEDIUM IMPACT

Može biti veći prioritet od theoretical catastrophic attack koji zahteva cloud admin.

---

# 152. ATTACK COST

Proceni kvalitativno:

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

Može li attack skalirati na:

- jednog korisnika

- sve users

- sve tenant-e

---

# 155. ATTACK REPEATABILITY

One-off race vs deterministic exploit.

---

# 156. USER INTERACTION

Da li žrtva mora kliknuti nešto?

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

Ne popunjavaj mehanički ako kategorija nema smisla.

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

Modeluj samo ako auth postoji.

Mogući branches:

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

Modeluj:

```text

user

↓

field/route/policy weakness

↓

admin

```

---

# 166. ATTACK PATH 3 - CROSS-TENANT DATA ACCESS

Za multi-tenant.

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

Samo ako relevantno.

---

# 174. ARCHITECTURAL THREAT

Threat model može pronaći problem koji nije code bug.

Primer:

```text

all production/admin access depends on one shared static credential

```

---

# 175. OPERATIONAL THREAT

Primer:

```text

production backups accessible wider than live DB

```

---

# 176. HUMAN PROCESS THREAT

Primer:

```text

support can reset MFA without secondary approval

```

Samo ako process evidence postoji.

---

# 177. EXTERNAL UNKNOWN

Ako third-party security semantics nisu poznate:

**THIRD-PARTY CONTROL NOT VERIFIED**

---

# 178. NETWORK UNKNOWN

Ako infrastructure nije dostupna:

**NETWORK BOUNDARY NOT VERIFIED**

---

# 179. DATA CLASSIFICATION UNKNOWN

Ne nagađaj sensitivity.

Označi.

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

Ne mešaj.

---

# 181. CONTROLLED THREAT

Ako current controls jasno zaustavljaju scenario:

zabeleži kao:

```text

CONTROLLED

```

To je važno.

---

# 182. THINGS DONE WELL

Threat model mora dokumentovati jake controls.

---

# 183. CONTROL COVERAGE

Pokaži koje threats imaju:

```text

Prevent

Detect

Recover

```

---

# 184. HIGH-RISK WITHOUT DETECTION

Posebno istakni.

---

# 185. HIGH-RISK WITHOUT RECOVERY

Posebno istakni.

---

# 186. SINGLE CONTROL THREAT

Ako critical risk zavisi samo od jednog middleware-a/secret-a:

defense-in-depth gap.

---

# 187. SECURITY TEST DERIVATION

Svaki high/critical threat treba da generiše bar jedan test ili verification.

---

# 188. THREAT-DRIVEN TEST

Primer:

```text

Threat:

tenant A reads tenant B file

Test:

tenant A credential + tenant B file ID -> deny

```

---

# 189. FAILURE-INJECTION TEST

Primer:

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

Old/new worker/token/config compatibility ako threat relevantan.

---

# 192. ATTACK SIMULATION

Samo u odobrenom test environment-u i bez destructive payload-a.

---

# 193. SECURITY REQUIREMENTS

Iz threat modela izvedi konkretne zahteve.

---

# 194. REQUIREMENT FORMAT

```text

SR-001:

Tenant-scoped resource lookup MUST enforce tenant authority server-side.

```

---

# 195. REQUIREMENTS NE SMEJU BITI GENERIČKE

Loše:

```text

System must be secure.

```

---

# 196. SECURITY ACCEPTANCE CRITERIA

Za critical zahteve dodaj testable condition.

---

# 197. RESIDUAL RISK

Ne postoji sistem bez rizika.

Za svaki mitigated high threat navedi šta ostaje.

---

# 198. MITIGATION COST

Koristi:

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

# 200. MITIGATION PRIORITET

Ne preporučuj najkompleksniju kontrolu ako jednostavniji invariant rešava attack.

---

# 201. DISTRIBUTED LOCK

Ne predlaži kao generički security fix za races.

Unique constraint/atomic update možda je bolji.

---

# 202. WAF

Ne koristi kao zamenu za app-level authorization/input fix.

---

# 203. MFA

Ne koristi kao univerzalni fix za svaki threat.

---

# 204. ENCRYPTION

Encryption ne rešava authorization problem.

---

# 205. NETWORK ISOLATION

Ne rešava compromised internal service.

---

# 206. ZERO TRUST

Ne koristi buzzword bez konkretnog control design-a.

---

# 207. MICROSEGMENTATION

Samo ako lateral movement threat opravdava.

---

# 208. THREAT MODEL ITERACIJA

Threat model nije jednokratni dokument.

Identifikuj triggers za review:

- novi auth method

- novi provider

- file upload

- tenant model

- admin function

- new CI/release path

---

# 209. CHANGE-DRIVEN THREAT MODEL

Za veliki feature pitaj:

> Koji novi asset, trust boundary ili attacker capability uvodi?

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

Napravi listu:

| ID | Assumption | Enforced where | Verified |

|---|---|---|---|

---

# 212. UNKNOWN REGISTER

Sve što nije potvrđeno mora biti eksplicitno vidljivo.

---

# 213. NE PRETVARAJ UNKNOWN U LOW RISK

Nepoznato nije isto što i bezbedno.

---

# 214. NE PRETVARAJ UNKNOWN U HIGH RISK

Isto tako, ne senzacionalizuj.

---

# 215. ATTACK SURFACE COMPLETENESS

Na kraju proveri da li su uključeni:

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

prema actual projektu.

---

# 216. PRIVACY THREATS

Ako app obrađuje sensitive personal data:

uključi:

- overcollection

- unintended exposure

- excessive logs

ali ne pravi pravne zaključke.

---

# 217. FINANCIAL THREATS

Ako payments/credits postoje:

modeluj:

- replay

- double spend

- price tampering

- refund abuse

- idempotency

---

# 218. AI/LLM THREATS

Ako app koristi AI:

uključi:

- prompt injection

- tool abuse

- data leakage

- malicious retrieved content

Detaljni AI audit je kasnije.

---

# 219. MOBILE THREATS

Ako postoji mobile client:

- embedded credentials

- deep links

- token storage

- API parity

---

# 220. DESKTOP THREATS

Ako postoji desktop client:

- updater

- local files

- IPC

- credential storage

---

# 221. OFFLINE THREATS

Ako app radi offline:

- local sensitive cache

- stale permissions

- sync conflict

---

# 222. PWA THREATS

Service worker/cache može zadržati private data.

---

# 223. BACKUP THREATS

- public backup

- restore tampering

- old credentials/data

---

# 224. LOG THREATS

Logs mogu postati secondary sensitive datastore.

---

# 225. MONITORING THREATS

Monitoring credential/service može imati wide read access.

---

# 226. SUPPORT TOOL THREATS

Internal support app često ima širok customer data access.

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

# 236. FINDING FORMAT ZA CONFIRMED WEAKNESS

Ako threat model otkrije konkretan bug:

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

Ne mešaj sve threats sa vulnerabilities.

---

# 237. OUTPUT - THREAT_MODEL.md

Finalni dokument strukturiraj:

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

Za svaki crown jewel:

> Šta se dešava ako njegova glavna security kontrola zakaže?

Primer:

```text

authorization middleware fails

```

Da li DB scoping i dalje štiti tenant boundary?

---

# 242. SECOND PASS - "COMPROMISE ONE USER"

Pretpostavi:

```text

one normal user account compromised

```

Pitaj:

- šta attacker može videti

- šta može menjati

- može li preći tenant

- može li dobiti više privilege

---

# 243. SECOND PASS - "COMPROMISE ONE TENANT ADMIN"

Pitaj blast radius.

---

# 244. SECOND PASS - "COMPROMISE ONE API KEY"

Pitaj:

- scopes

- tenants

- read/write

- persistence

---

# 245. SECOND PASS - "COMPROMISE ONE SERVICE"

Pitaj:

> Koje credentials i network paths taj service ima?

---

# 246. SECOND PASS - "COMPROMISE CI"

Pitaj:

- production deploy

- signing

- cloud

- registry

- secrets

---

# 247. SECOND PASS - "COMPROMISE THIRD PARTY"

Za svaki critical provider:

> Šta malicious provider response/event/script može da uradi?

---

# 248. SECOND PASS - "TENANT A ATTACKS TENANT B"

Prođi:

- APIs

- files

- caches

- jobs

- exports

- webhooks

---

# 249. SECOND PASS - "MALICIOUS FILE"

Prođi upload -> parser -> storage -> browser/server impact.

---

# 250. SECOND PASS - "MALICIOUS DATA AT REST"

Attacker-stored string kasnije prikazuje:

- admin

- support

- exporter

- parser

Traži second-order attacks.

---

# 251. SECOND PASS - "AUTH PROVIDER DOWN"

Pitaj fail-open/fail-closed.

---

# 252. SECOND PASS - "QUEUE DELIVERS TWICE"

Pitaj da li security-sensitive action može biti ponovljen.

---

# 253. SECOND PASS - "OLD TOKEN AFTER ROLE REVOKE"

Pitaj stale permission window.

---

# 254. SECOND PASS - "STAGING COMPROMISED"

Pitaj da li production secrets/trust prelaze environment boundary.

---

# 255. SECOND PASS - "BACKUP LEAK"

Pitaj šta backup sadrži i da li credentials ostaju reusable.

---

# 256. SECOND PASS - "ONE EXPENSIVE REQUEST"

Pronađi najveću attacker-to-server cost amplification.

---

# 257. SECOND PASS - "DETECTION"

Za svaki CRITICAL/HIGH threat pitaj:

> Koji signal bi nas upozorio?

Ako nijedan:

označi detection gap.

---

# 258. SECOND PASS - "RECOVERY"

Za svaki crown jewel:

> Ako kompromis uspe, kako vraćamo kontrolu?

---

# 259. SECOND PASS - "PERSISTENCE"

Pitaj kako attacker može ostati prisutan nakon:

- password reset

- key rotation

- deployment rollback

---

# 260. SECOND PASS - "ALTERNATIVE ENTRY POINT"

Za svaki critical action pronađi sve:

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

Pre finalnog odgovora proveri:

- scope je eksplicitno definisan

- actual architecture je korišćena umesto pretpostavljene

- critical assets su identifikovani

- attacker modeli imaju realne capabilities

- trust boundaries nisu ograničene samo na network

- multi-tenant granica je uključena gde postoji

- CI/build/release trust boundary je uključena

- third-party providers su tretirani kao external trust domain

- svaki high-risk threat ima konkretan attack path

- STRIDE nije korišćen mehanički

- threats i confirmed vulnerabilities su odvojeni

- security assumptions su eksplicitno navedene

- security invariants su testable

- privilege escalation paths su mapirani

- lateral movement je analiziran

- persistence je analizirana

- failure-mode threats su uključene

- detection i recovery controls su uključeni, ne samo prevention

- unknown elementi su označeni bez lažne sigurnosti ili senzacionalizma

- svaki CRITICAL/HIGH threat generiše test ili verification

- mitigations targetiraju root boundary/invariant

- WAF/MFA/encryption nisu korišćeni kao univerzalni odgovori

- residual risk je eksplicitno naveden

---

# KONAČNO PRAVILO

Ne želim threat model tipa:

> Napadač može pokušati SQL injection, XSS, phishing i DDoS. Koristite firewall, MFA i encryption.

To nije threat model.

Tražim scenarije poput:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

To su threat scenariji koje treba da proizvedeš.

Razmišljaj kroz:

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

Za svaki ozbiljan threat moraš moći da odgovoriš:

> Šta attacker želi?

> Odakle kreće?

> Koje legitimne mogućnosti već ima?

> Koju trust boundary mora da pređe?

> Koju security pretpostavku ili invariant napada?

> Koje postojeće kontrole ga zaustavljaju?

> Šta se dešava ako glavna kontrola zakaže?

> Koliki je blast radius?

> Kako bismo napad otkrili?

> Kako bismo se oporavili?

Ako nema dovoljno dokaza da scenario zaista postoji:

**PLAUSIBLE THREAT, NOT CONFIRMED WEAKNESS.**

Ako kontrola jasno i dokazivo zaustavlja scenario:

**CONTROLLED.**

Ako ključna arhitektonska činjenica nije potvrđena:

**NOT VERIFIED.**

Bolje je proizvesti 10 realnih threat scenarija koji prate konkretan sistem od napadača do asset-a nego 200 generičkih security stavki.

Cilj je dobiti forenzički precizan Threat Model koji se može direktno pretvoriti u:

- security requirements

- penetration-test plan

- authorization tests

- failure-injection tests

- architecture hardening

- monitoring rules

- incident-response playbooks

- prioritized security roadmap
