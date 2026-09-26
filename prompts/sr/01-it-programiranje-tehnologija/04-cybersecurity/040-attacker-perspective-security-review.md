---
id: UPL-IT-040
number: 40
slug: attacker-perspective-security-review
title: Attacker-Perspective Security Review
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# ATTACKER-PERSPECTIVE SECURITY REVIEW

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i attacker-oriented analizu aplikacije iz perspektive realnog napadača.

Glavni cilj:

> Posmatraj sistem onako kako bi ga napadač video: pronađi najjeftinije ulazne tačke, najmanje zaštićene funkcije, privilege escalation puteve, cross-tenant pivote, credential reuse, trusted-boundary slabosti, parser/file surface, abuse mogućnosti, supply-chain puteve i višestepene exploit chain-ove koji realno vode do značajnog impact-a.

Ovo nije:

- generički penetration-test checklist

- automatsko skeniranje svega i prijavljivanje svake anomalije

- samo OWASP audit

- samo auth audit

- samo IDOR audit

- samo threat model

- automatsko označavanje svake teorijske slabosti kao exploitable

- pokušaj destruktivnog exploitation-a

- neovlašćeni pristup tuđim sistemima

- generička lista payload-a bez razumevanja aplikacije

Fokus je na pitanju:

> Ako sam napadač sa najmanjom mogućom početnom privilegijom, kojim najkraćim, najrealnijim i najjeftinijim putem mogu da dođem do značajnog data, privilege, financial ili system impact-a?

Prioritet:

**practical exploit chains > auth bypass > privilege escalation > cross-tenant access > credential compromise > server-side pivots > destructive business abuse > persistence > lateral movement > stealth/detection gaps > hardening**

Bolje je pronaći 5 realnih attack chain-ova sa jasnim početkom, pivotima i finalnim impact-om nego napisati 200 izolovanih security nalaza bez prioriteta.

---

# 1. POČNI KAO NAPADAČ

Ne kreći od koda.

Kreni od pitanja:

```text

Šta je javno dostupno?

Šta mogu bez naloga?

Šta mogu sa običnim nalogom?

Šta mogu ako ukradem session?

Šta mogu ako dobijem API key?

Šta mogu ako kompromitujem staging ili CI?

```

---

# 2. ATTACKER TIERS

Koristi odvojene scenarije:

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

Koristi samo one koji su relevantni.

---

# 3. NE DAJ ATTACKER-U BESPLATNE PRIVILEGIJE

Ako scenario zahteva:

- admin

- VPN

- cloud root

- DB access

to mora biti eksplicitna precondition.

---

# 4. ENTRY POINT INVENTORY

Napadač prvo vidi:

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

Bez destruktivnog testiranja identifikuj:

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

# 6. JAVNI FRONTEND KAO DOKUMENTACIJA

Client code može otkriti:

- hidden endpoints

- feature flags

- route names

- role names

- model fields

- internal API paths

---

# 7. SOURCE MAP

Ako public:

može olakšati recon.

Ne tretiraj kao ozbiljnu vulnerability bez dodatnog attack path-a.

---

# 8. API DISCOVERY

Uporedi:

```text

frontend calls

OpenAPI

actual registered routes

legacy/mobile routes

```

---

# 9. UNDOCUMENTED ENDPOINT

Za attacker-a je relevantan ako je reachable, ne ako je dokumentovan.

---

# 10. ATTACK SURFACE RANKING

Za svaku entry point-u oceni:

```text

required privilege

input control

side-effect power

data sensitivity

cost amplification

```

---

# 11. TRAŽI NAJJEFTINIJI PIVOT

Ako attacker može:

```text

anonymous

↓

create free account

```

onda se attack surface naglo povećava.

---

# 12. REGISTRATION

Testiraj abuse model:

- unlimited accounts

- referral

- credits

- free resources

- upload

- invites

prema feature-u.

---

# 13. LOGIN

Traži:

- enumeration

- rate bypass

- legacy auth path

- weak reset flow

---

# 14. PASSWORD RESET

Često najjeftiniji takeover path.

---

# 15. MFA BYPASS

Traži alternativni flow.

---

# 16. OAUTH ACCOUNT LINKING

Traži identity confusion.

---

# 17. SESSION

Pitaj:

> Ako ukradem jednu običnu session, koliko daleko mogu da idem?

---

# 18. SESSION PERSISTENCE

Testiraj:

- logout

- password change

- role revoke

- user disable

---

# 19. AUTH TOKEN

Ako napadač ima validan low-privilege token:

traži vertical/horizontal escalation.

---

# 20. API KEY

Pitaj:

- scopes

- tenant

- environment

- write access

- alternate routes

---

# 21. IDOR HUNTING

Za svaki reachable resource:

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

Pokušaj da server-required scope pregaziš query/body parametrima.

---

# 25. BULK ENDPOINT

Napadač posebno voli bulk jer jedan request može zaobići:

- item auth

- quotas

- rate limits

---

# 26. EXPORT

Jedan od najvrednijih data-exfiltration puteva.

---

# 27. SEARCH

Može pomoći enumeration-u i prikupljanju resource IDs.

---

# 28. AUTOCOMPLETE

Može leakovati private identifiers.

---

# 29. FILES

Traži:

- upload bypass

- cross-user read

- signed URL abuse

- preview route

- thumbnail route

- same-origin active content

---

# 30. STORED CONTENT

Napadač može sačuvati payload i čekati da ga otvori:

- admin

- support

- moderator

---

# 31. STORED XSS PIVOT

Klasičan put:

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

Klasičan put:

```text

public URL fetch

↓

backend

↓

internal service

```

---

# 33. INTERNAL SERVICE TRUST

Ako internal endpoint nema auth zato što "nije public":

SSRF može pretvoriti to u privileged pivot.

---

# 34. WEBHOOK

Napadač traži:

- unsigned endpoint

- weak signature

- replay

- tenant mapping confusion

---

# 35. CALLBACK

OAuth/payment callback može biti odličan pivot ako local state nije pravilno vezan.

---

# 36. PAYMENT/BUSINESS ACTIONS

Traži:

- price tampering

- duplicate action

- replay

- negative values

- refund abuse

- free-credit abuse

---

# 37. ONE-TIME TOKENS

Invite, coupon, reset, promo, download.

Testiraj race/reuse.

---

# 38. CONCURRENCY

Napadač ne mora slati requests sekvencijalno.

Pokušaj:

```text

A || B

```

na:

- coupon

- credit

- refund

- invite

- reset

- quota

---

# 39. RATE LIMIT BYPASS

Pitaj:

- IP

- account

- tenant

- endpoint

- trusted proxy

---

# 40. DIRECT ORIGIN

Ako WAF/gateway postoji:

traži origin bypass.

---

# 41. TRUSTED HEADER

Napadač pokušava:

```text

X-Internal

X-User

X-Role

X-Tenant

```

gde postoje.

---

# 42. LEGACY ROUTE

Najbolji attacker path često je stari endpoint koji development team više ne koristi.

---

# 43. MOBILE API

Stari app version može otkriti slabije server routes.

---

# 44. API VERSION DRIFT

V1 i V2 uporedi kao attacker.

---

# 45. DEBUG ROUTE

Traži:

- token issue

- data dump

- test mail

- reset

- reindex

- run job

---

# 46. ADMIN PANEL

Napadač traži ne samo login, već:

- weak alt auth

- reset

- impersonation

- support workflow

---

# 47. SUPPORT FUNCTION

Često ima više moći od običnog user-a i slabiji UX-focused security.

---

# 48. IMPERSONATION

Ako attacker pređe do support privilegije, to može postati universal account takeover.

---

# 49. MASS ASSIGNMENT

Napadač dodaje fields koje UI nikad ne šalje.

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

Client-side authority je high-value attacker target.

---

# 56. HIDDEN PARAMETER

Pronađi model/schema fields koje UI ne koristi.

---

# 57. INCLUDE / EXPAND

Napadač pokušava da izvuče više relations/polja.

---

# 58. RAW FILTER

Napadač pokušava da zaobiđe server scoping.

---

# 59. GRAPHQL

Odličan attacker surface za:

- aliases

- deep queries

- hidden fields

- generic node IDs

- mutations

---

# 60. GLOBAL NODE ID

Traži cross-resource access.

---

# 61. GRAPHQL ALIAS AMPLIFICATION

Jedan request, mnogo resolver calls.

---

# 62. WEBSOCKET

Napadač nakon handshake-a pokušava:

- tuđ topic

- arbitrary resource ID

- privileged command

---

# 63. MESSAGE RATE

HTTP rate limiter možda više ne postoji.

---

# 64. QUEUE

Ako attacker može uticati na job payload:

to je pivot ka system-privileged worker-u.

---

# 65. USER -> SYSTEM WORKER

Jedan od najvrednijih trust escalations.

---

# 66. DELAYED JOB

Authorization/state može postati stale.

---

# 67. JOB REPLAY

Queue duplicate delivery može izazvati duplicate business effect.

---

# 68. EMAIL/SMS

Napadač može pretvoriti endpoint u spam/cost amplifier.

---

# 69. THIRD-PARTY API

Ako jedna aplikaciona akcija pokreće skupi provider call:

traži abuse.

---

# 70. AI API

Ako postoji:

- token cost

- prompt injection

- tool execution

kasnije detaljniji AI security audit.

---

# 71. UPLOAD

Napadač razmišlja:

```text

Šta server uradi sa mojim bajtovima?

```

---

# 72. FILE TYPE

Pokušaj mismatch.

---

# 73. FILENAME

Path traversal/metadata XSS.

---

# 74. PARSER

Napadač traži:

- network access

- filesystem access

- decompression

- shell subprocess

---

# 75. REMOTE IMPORT

Kombinacija:

- SSRF

- oversized response

- malicious file

---

# 76. ARCHIVE

Zip Slip/decompression bomb.

---

# 77. SAME-ORIGIN ACTIVE FILE

Napadač uploaduje HTML/SVG i pokušava da ga servira pod trusted origin-om.

---

# 78. PUBLIC STORAGE

Traži enumeration/ACL greške.

---

# 79. SIGNED URL

Traži scope/reuse/long expiry.

---

# 80. DATABASE INPUT

Prati attacker input do:

- raw SQL

- NoSQL operators

- sort/filter

---

# 81. COMMAND EXECUTION

Prati user input do:

- shell

- CLI tool

- converter

- script runner

---

# 82. TEMPLATE

Prati user input do template source-a.

---

# 83. DESERIALIZATION

Prati attacker-controlled object/file do unsafe loader-a.

---

# 84. HOST HEADER

Napadač pokušava da utiče na:

- reset URL

- callback

- absolute links

---

# 85. OPEN REDIRECT

Sam po sebi često mali impact.

Ali attacker ga koristi kao chain component.

---

# 86. CACHE

Pokušaj:

```text

User A warms cache

↓

User B retrieves

```

---

# 87. CDN

Authenticated data + shared cache je high-value.

---

# 88. TENANT CACHE CONFUSION

Cache key bez tenant-a.

---

# 89. CLIENT-SIDE CACHE

Shared device/service worker može zadržati private data.

---

# 90. SECRETS

Napadač traži:

- JS bundle

- source

- logs

- error responses

- CI

- Docker

- mobile binary

---

# 91. PUBLIC BUNDLE

Sve u browseru je attacker-readable.

---

# 92. MOBILE/DESKTOP BINARY

Isto.

---

# 93. SOURCE CONTROL

Commitovani secret je high-value pivot.

---

# 94. GIT HISTORY

Secret "obrisan" pre godinu dana može i dalje biti validan.

---

# 95. LOGS

Ukradeni session/token kroz logs može biti lakši od exploit-a.

---

# 96. ERROR TRACKER

Sensitive breadcrumbs/local variables.

---

# 97. CI/CD

Attacker sa PR capability pita:

> Da li mogu da nateram CI da izvrši moj code uz privileged secrets?

---

# 98. `pull_request_target`

High-value review surface.

---

# 99. BUILD SCRIPTS

Dependency/postinstall/build plugin izvršava code.

---

# 100. THIRD-PARTY ACTION

Napadač može ciljati supply chain umesto aplikacije.

---

# 101. DEPENDENCY CONFUSION

Internal package name + public registry.

---

# 102. MALICIOUS PACKAGE

Build-time privilege može biti dovoljan.

---

# 103. RELEASE PIPELINE

Ako attacker dobije publish/deploy token:

aplikacioni exploit više nije potreban.

---

# 104. SIGNING KEY

Crown jewel.

---

# 105. DESKTOP UPDATER

Napadač traži unsigned/fail-open update path.

---

# 106. STAGING

Napadač često prvo cilja slabiji environment.

---

# 107. ENVIRONMENT PIVOT

Pitaj:

```text

staging credential

↓

production?

```

---

# 108. SHARED SECRET

Jedan od najčešćih boundary collapses.

---

# 109. SHARED DATABASE

Staging app možda ima production data/credential.

---

# 110. SHARED STORAGE

Isto.

---

# 111. DEV TOOL

Debug/internal tooling u production-u.

---

# 112. DEFAULT CREDENTIAL

Napadač će probati.

---

# 113. DEFAULT SECRET FALLBACK

Ako env nedostaje.

---

# 114. CLOUD/IAM

Ako credential procure:

utvrdi najkraći pivot:

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

Može imati više privileges nego aplikacija treba.

---

# 116. LATERAL MOVEMENT

Compromise jednog service-a nije finalni cilj.

Pitaj šta dalje može da pozove.

---

# 117. NETWORK

Koji internal services su reachable iz compromised app process-a?

---

# 118. METADATA SERVICE

Samo ako platforma to čini relevantnim.

---

# 119. INTERNAL DNS

Može pomoći attacker-u nakon SSRF/RCE.

---

# 120. DATABASE CREDENTIAL

Pitaj:

- read

- write

- DDL

- superuser

---

# 121. REDIS

Ako exposed/internal compromise:

može sadržati:

- sessions

- cache

- queues

---

# 122. QUEUE BROKER

Ako attacker može publish:

možda može naterati privileged worker da izvršava akcije.

---

# 123. OBJECT STORAGE

Može sadržati:

- uploads

- backups

- artifacts

---

# 124. BACKUPS

Napadač traži slabije zaštićenu kopiju istih podataka.

---

# 125. AUDIT LOG

Napadač sa privileged access-om možda želi da ukloni trag.

---

# 126. LOG DELETE

Threat za repudiation/detection.

---

# 127. PERSISTENCE

Nakon prvog compromise-a attacker traži način da ostane.

---

# 128. CREATE ADMIN

Najjednostavnije.

---

# 129. CREATE API KEY

Bolje stealth/persistence.

---

# 130. ADD OAUTH IDENTITY

Može ostati posle password reset-a ako recovery ne ukloni link.

---

# 131. CREATE SERVICE CREDENTIAL

Još jače.

---

# 132. DEPLOY BACKDOOR

Ako ima CI/deploy access.

---

# 133. SCHEDULED JOB

Persistence kroz cron/worker.

---

# 134. WEBHOOK

Attacker može registrovati outgoing webhook da exfiltruje future data.

---

# 135. ACCESS TOKEN

Long-lived credential.

---

# 136. NEW SSH KEY

Ako infrastructure context postoji.

---

# 137. DETECTION EVASION

Ne razvijaj stealth techniques za zloupotrebu realnih sistema.

Ali audituj da li critical actions imaju logging.

---

# 138. AUDIT COVERAGE

Pitaj da li se beleži:

- role change

- API key creation

- MFA reset

- admin impersonation

- export

- deploy

---

# 139. LOG INTEGRITY

Može li actor obrisati svoj trag?

---

# 140. ALERTING

Da li high-risk action generiše signal?

---

# 141. ATTACK CHAIN FORMAT

Za svaki ozbiljan chain koristi:

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

Svaki chain korak označi:

```text

CONFIRMED

LIKELY

NOT VERIFIED

```

---

# 143. CHAIN NE SME BITI JAČI OD NAJSLABIJEG KORAKA

Ako jedan ključni korak nije potvrđen:

ceo chain nije confirmed.

---

# 144. ATTACKER EFFORT

Koristi:

```text

TRIVIAL

LOW

MODERATE

HIGH

```

---

# 145. INITIAL ACCESS COST

Anonymous exploit ima drugačiji prioritet od exploit-a koji zahteva global admin.

---

# 146. RELIABILITY

Da li attack radi:

- deterministički

- često

- race-based

- samo theoretical

---

# 147. AUTOMATABILITY

Može li attacker skalirati preko:

- svih users

- svih IDs

- svih tenants

---

# 148. BLAST RADIUS

Koristi:

```text

SINGLE RESOURCE

SINGLE USER

SINGLE TENANT

MULTI-TENANT

GLOBAL

```

---

# 149. IMPACT DIMENZIJE

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

- practical anonymous/low-privilege chain do global production takeover

- chain omogućava arbitrary admin identity ili deploy/code execution

- multi-tenant catastrophic compromise

- signing/deploy/cloud crown-jewel compromise sa direct production impact-om

## P1 - HIGH

- practical account takeover

- cross-tenant access

- privilege escalation

- sensitive server/internal pivot

- persistent high-value compromise

- strong CI/supply-chain compromise path

## P2 - MEDIUM

- meaningful chained abuse sa dodatnim preconditions

- limited data/privilege escalation

- costly resource abuse

- constrained persistence

## P3 - LOW

- minor reconnaissance/metadata/edge-case path

## P4 - HARDENING

- attacker friction/defense-in-depth improvements bez confirmed exploit chain-a

---

# 151. NE SABIRAJ SLABE FINDINGS AUTOMATSKI

3 low findings ne postaju P0 samo zato što ih povežeš.

Chain mora zaista povećati capability.

---

# 152. EXPLOIT CHAIN BREAKPOINT

Za svaki chain identifikuj najjeftiniju tačku gde ga možeš preseći.

---

# 153. FIX ROOT STEP

Ako chain:

```text

IDOR

↓

data

↓

admin token

```

primarni fix je IDOR/secret exposure, ne samo monitoring.

---

# 154. DEFENSE IN DEPTH

Posle root fix-a dodaj secondary kontrolu ako ima smisla.

---

# 155. ATTACK PATH 1 - ANONYMOUS TO ACCOUNT

Traži:

- reset

- magic link

- OAuth linking

- session fixation

---

# 156. ATTACK PATH 2 - USER TO OTHER USER

Traži:

- IDOR

- file

- export

- cache

---

# 157. ATTACK PATH 3 - USER TO TENANT ADMIN

Traži:

- role field

- invite role

- function-level auth

---

# 158. ATTACK PATH 4 - TENANT ADMIN TO GLOBAL ADMIN

Posebno proveri role naming/scope confusion.

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

Pronađi najjeftiniji request koji izaziva najskuplji backend rad.

---

# 171. AMPLIFICATION FACTOR

Gde moguće:

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

Ako AI feature postoji.

---

# 178. TOKEN LIFETIME

Ako attacker ukrade token:

koliko dugo traje privilege?

---

# 179. REVOCATION

Može li defender zaista izbaciti attacker-a?

---

# 180. PERSISTENCE TEST

Posle:

- logout

- password reset

- key rotation

proveri da li attacker-created persistence ostaje.

---

# 181. USER DISABLE

Da li API keys/OAuth links/jobs ostaju aktivni?

---

# 182. ADMIN DEMOTION

Da li issued tokens nastavljaju privileged access?

---

# 183. KEY ROTATION

Da li old key zaista prestaje da radi?

---

# 184. DEPLOY ROLLBACK

Može li rollback vratiti ranjivu konfiguraciju/secret?

---

# 185. INCIDENT CHAIN

Za svaki P0/P1 pitaj:

> Ako ovo bude exploited u petak uveče, kako ga gasimo?

---

# 186. CONTAINMENT

Mapiraj:

- revoke

- disable route

- rotate secret

- block artifact

- isolate service

---

# 187. FORENSIC EVIDENCE

Koji logs postoje da utvrde:

- actor

- affected data

- duration

- actions

---

# 188. LOG GAP

Bez evidence-a blast radius može ostati nepoznat.

---

# 189. ATTACK REPLAY TEST

Critical one-time actions.

---

# 190. DOUBLE EXECUTION

Financial/business.

---

# 191. FAILURE INJECTION

Attacker ponekad koristi failure:

```text

make provider timeout

↓

force retry

↓

duplicate effect

```

---

# 192. UNKNOWN OUTCOME

External mutation timeout je attacker-relevantan ako retry nije idempotent.

---

# 193. PARTIAL FAILURE

Multi-step operation može ostaviti exploitable state.

---

# 194. STEP ORDER

Pitaj da li attacker može prekinuti flow između security-relevantnih koraka.

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

Takeover.

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

Koristi:

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

# 206. FALSE-POSITIVE PREVENCIJA

Pre P0/P1 chain-a proveri:

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

# 207. NE PRAVI CHAIN OD NEPOVEZANIH FINDINGS

Ako finding A ne daje capability potreban za B:

to nije chain.

---

# 208. NE PRETPOSTAVLJAJ DA ATTACKER ZNA SECRET

Ako chain zahteva secret prvo mora objasniti kako ga dobija.

---

# 209. NE PRETPOSTAVLJAJ INTERNAL ACCESS

Mora imati pivot.

---

# 210. NE PRETPOSTAVLJAJ ADMIN

Ako attacker već mora biti global admin, većina attack chain-a gubi vrednost.

---

# 211. NE KORISTI SECURITY THROUGH OBSCURITY KAO GLAVNU ODBRANU

Undocumented UUID route nije prava granica.

---

# 212. NE IZVODI DESTRUKTIVNE TESTOVE

Ne:

- briši production data

- šalji stvarni malware

- troši stvarni novac

- pristupaj tuđim podacima

- pokreći denial-of-service

- pokušavaj RCE protiv neovlašćenih sistema

---

# 213. SAFE PROOF

Preferiraj:

- controlled test tenant

- synthetic canary

- non-destructive requests

- local/staging reproduction

- static executable path proof

---

# 214. OUTPUT - ATTACKER_PERSPECTIVE_SECURITY_REVIEW.md

Finalni izveštaj strukturiraj:

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

Ponovi audit sa strogim pravilom:

```text

attacker nema account

nema credentials

nema internal access

```

Pronađi najjači mogući impact.

---

# 221. SECOND PASS - FREE USER ONLY

Pretpostavi attacker može legalno otvoriti običan account.

Pitaj koliko se attack surface povećava.

---

# 222. SECOND PASS - STOLEN SESSION

Pretpostavi jednu normalnu user session.

Pitaj:

- privilege escalation

- persistence

- tenant crossing

---

# 223. SECOND PASS - TENANT ADMIN

Pretpostavi kompromitovan tenant admin.

Pitaj:

> Može li preći svoj tenant?

---

# 224. SECOND PASS - API KEY

Pretpostavi leak jednog integration key-a.

Pronađi najjači alternate API path.

---

# 225. SECOND PASS - MALICIOUS FILE

Jedan normalno dozvoljen upload.

Prati sve do:

- parsera

- browsera

- admina

- internal mreže

---

# 226. SECOND PASS - SSRF

Pretpostavi kontrolu jedne server-side URL destination vrednosti.

Pronađi najvredniji reachable internal target, ali ne pristupaj neovlašćenim sistemima.

---

# 227. SECOND PASS - ONE IDOR

Ako potvrdiš jedan cross-user read:

pitaj:

> Da li data iz njega sadrži novi credential, identifier ili capability za sledeći pivot?

---

# 228. SECOND PASS - ONE XSS

Ako potvrdiš XSS:

pitaj:

- ko vidi payload

- koje API akcije njegov browser može da pozove

- da li postoji CSP/HttpOnly/re-auth

---

# 229. SECOND PASS - ONE SECRET

Ako potvrdiš exposed key:

pronađi njegov permissions/blast-radius model.

Ne koristi key neovlašćeno.

---

# 230. SECOND PASS - STAGING

Pretpostavi staging je potpuno kompromitovan.

Pitaj šta deli sa production-om.

---

# 231. SECOND PASS - CI

Pretpostavi attacker može izvršiti arbitrary code u CI job-u.

Pitaj:

- koji secrets

- tokens

- artifacts

- registries

- deploy targets

---

# 232. SECOND PASS - PROVIDER COMPROMISE

Pretpostavi da jedan critical third-party šalje malicious but valid response/event.

Pitaj šta local app automatski veruje.

---

# 233. SECOND PASS - RETRY

Pretpostavi external action uspe, response se izgubi.

Pitaj da li retry daje duplicate financial/business effect.

---

# 234. SECOND PASS - CACHE

Pokušaj cross-user/cross-tenant cache confusion.

---

# 235. SECOND PASS - LEGACY

Za svaku novu protected funkciju pronađi staru alternativu.

---

# 236. SECOND PASS - SUPPORT

Pronađi support/admin workflows koji mogu dati attacker-u persistence ili account takeover ako se kompromituju.

---

# 237. SECOND PASS - DETECTION

Za svaki P0/P1 chain pitaj:

> Da li bi defender video Step 1, pivot i finalni action?

Ako ne:

označi monitoring gap.

---

# 238. SECOND PASS - CONTAINMENT

Za svaki P0/P1 chain definiši najbrži bezbedni način da se preseče u incidentu.

---

# 239. SECOND PASS - MULTIPLE PATHS TO SAME CROWN JEWEL

Za:

- admin identity

- signing key

- production deploy

- tenant data

- payment authority

pronađi sve različite attack paths.

---

# 240. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- attacker počinje sa jasno definisanom minimalnom privilegijom

- actual reachable surfaces su odvojene od theoretical

- legacy/mobile/admin/internal paths su uključeni

- svaki exploit chain ima capability transfer između koraka

- nijedan chain ne preskače neobjašnjen privilege/network korak

- attack chain severity nije veća od stvarnog finalnog impact-a

- cross-user i cross-tenant paths su eksplicitno testirani

- files/parsers su analizirani kao mogući pivot

- SSRF je analiziran kao web-to-internal pivot

- queue/worker je analiziran kao user-to-system pivot

- supply chain je analiziran kao contributor-to-production pivot

- staging je analiziran kao possible production pivot

- exposed credential ima scope/blast-radius analizu

- persistence je analizirana nakon početnog compromise-a

- logout/password reset/key rotation nisu pretpostavljeni kao potpuna containment mera

- monitoring i forensic evidence su uključeni

- root break point je naveden za svaki serious chain

- destruktivni proof nije korišćen

- theoretical chains su jasno odvojeni od confirmed chains

- P4 hardening nije pomešan sa exploitable attack paths

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Napadač može pokušati XSS, SQL injection, brute force i DDoS.

To nije attacker-perspective review.

Tražim chain poput:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

ili:

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

To su napadački putevi koje treba da pronađeš.

Razmišljaj kao attacker kroz:

- najlakši initial access

- najjači input

- najjeftiniji privilege pivot

- alternate routes

- trusted boundaries

- secrets

- files

- internal systems

- CI

- persistence

- final crown jewel

Za svaki ozbiljan chain moraš moći da odgovoriš:

> Sa čim attacker počinje?

> Koji je prvi realno reachable entry point?

> Koju novu capability dobija nakon svakog koraka?

> Da li ta capability zaista omogućava sledeći korak?

> Koju trust boundary prelazi?

> Koji finalni asset ili privilege dobija?

> Koliki je blast radius?

> Kako attacker zadržava pristup?

> Kako bi defender prekinuo chain najranije i najjeftinije?

Ako jedan ključni korak nije potvrđen:

**PARTIALLY CONFIRMED** ili **PLAUSIBLE**, ne **CONFIRMED CHAIN**.

Ako je scenario samo generički moguć, ali nema veze sa actual arhitekturom:

**DO NOT REPORT AS FINDING.**

Bolje je pronaći 5 realnih napadačkih chain-ova sa jasnim capability transferom od početnog access-a do finalnog impact-a nego prijaviti stotine izolovanih security stavki.

Cilj je dobiti forenzički precizan Attacker-Perspective Security Review koji se može direktno pretvoriti u:

- penetration-test plan

- exploit regression tests

- attack-chain breakpoints

- privilege-boundary fixes

- lateral-movement reduction

- persistence hardening

- detection rules

- incident containment playbooks

- prioritized security remediation
