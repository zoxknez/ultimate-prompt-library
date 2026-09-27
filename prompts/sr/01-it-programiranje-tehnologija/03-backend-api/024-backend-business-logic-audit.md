---
id: UPL-IT-024
number: 24
slug: backend-business-logic-audit
title: Backend Business Logic Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Backend i API
subcategory_id: backend-api
language: sr
version: 1.0.0
status: stable
---

# BACKEND BUSINESS LOGIC AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletne business logike backend sistema.

Glavni cilj:

> Utvrditi da li backend zaista čuva poslovna pravila sistema kroz sve API-je, background job-ove, webhooks, admin akcije, concurrency scenarije, retries, partial failures i state transitions, bez mogućnosti da se podaci dovedu u nemoguće ili kontradiktorno stanje.

Ovo nije:

- generički code review
- REST style audit
- security audit celog sistema
- database-only audit
- preporuka za DDD bez razloga
- pokušaj da se svaki `if` pretvori u design pattern
- analiza samo happy path-a
- automatski refactor service layer-a

Fokus je na stvarnim poslovnim pravilima.

Prioritet:

**business correctness > data integrity > invariant preservation > state transition safety > side-effect correctness > concurrency > maintainability**

Bolje je pronaći 5 business pravila koja se stvarno mogu prekršiti nego napisati 100 opštih saveta o arhitekturi.

---

# 1. PRVO UTVRDI DOMAIN

Pre finding-a razumi šta sistem zapravo radi.

Identifikuj:

- glavne entitete
- business procese
- critical actions
- novac
- ownership
- quotas
- limits
- status/state modele
- approvals
- reservations
- bookings
- inventory
- subscriptions
- lifecycle-e
- destructive operations

Ako domain nije dokumentovan:

izvuci ga iz koda.

---

# 2. MAPIRAJ BUSINESS ENTITETE

Za svaki važan entity napravi:

```text
Entity:
Identity:
Owner:
Mutable fields:
Immutable fields:
States:
Dependencies:
Side effects:
Deletion semantics:
```

---

# 3. IDENTIFIKUJ BUSINESS INVARIANTS

Za svaki entity pitaj:

> Šta apsolutno mora ostati tačno bez obzira kojim putem se sistem koristi?

Primeri:

```text
balance >= 0
```

```text
one active subscription per account
```

```text
approved order cannot return to draft
```

```text
used coupon cannot be redeemed twice
```

```text
child must belong to existing parent
```

---

# 4. NAPRAVI INVARIANT INVENTORY

Tabela:

| Invariant | Entity | Enforced where | DB protection | Other entry points | Risk |
|---|---|---|---|---|---|

---

# 5. BUSINESS RULE SOURCE OF TRUTH

Za svako pravilo utvrdi gde je authoritative implementation:

- service
- domain object
- database
- policy engine
- workflow engine
- external system

Ne sme isto pravilo imati više nezavisnih implementacija bez razloga.

---

# 6. DUPLICIRANA BUSINESS LOGIKA

Traži isto pravilo u:

- controller-u
- service-u
- worker-u
- webhook-u
- admin API-ju

Primer:

```text
API checks status == ACTIVE
worker does not
```

Worker može zaobići invariant.

---

# 7. ENTRY POINT INVENTORY

Za svaki critical business action pronađi sve ulaze:

- REST API
- GraphQL
- admin
- CLI
- cron
- worker
- webhook
- event consumer
- migration/script

---

# 8. ENTRY POINT BYPASS

Ako samo jedan ulaz radi validaciju, a drugi poziva niži sloj direktno:

finding visokog signala.

---

# 9. AUTH NIJE BUSINESS RULE

Nemoj pomešati:

```text
user sme da izvrši akciju
```

sa:

```text
akcija je poslovno validna u trenutnom stanju
```

Oba moraju biti proverena.

---

# 10. STATE MACHINES

Za entity sa statusom napravi eksplicitnu state mašinu.

Primer:

```text
DRAFT
↓
SUBMITTED
↓
APPROVED
↓
COMPLETED
```

sa granama:

```text
REJECTED
CANCELLED
FAILED
```

---

# 11. TRANSITION MATRIX

| From | Action | To | Allowed | Guard | Side effects |
|---|---|---|---|---|---|

---

# 12. INVALID TRANSITIONS

Traži mogućnost:

```text
COMPLETED -> DRAFT
```

ili:

```text
CANCELLED -> PROCESSING
```

bez eksplicitnog product pravila.

---

# 13. DIRECT STATUS UPDATE

High-signal pattern:

```text
PATCH /entity
{
  "status": "APPROVED"
}
```

Ako client može proizvoljno postaviti status bez transition logic-e:

ozbiljan business flaw.

---

# 14. COMMAND VS FIELD UPDATE

Neke promene treba da budu business command:

```text
approve()
cancel()
refund()
```

a ne običan arbitrary field assignment.

Ali ne refaktoriši samo radi stila.

---

# 15. TRANSITION GUARDS

Primer:

```text
SUBMITTED -> APPROVED
```

možda zahteva:

- payment
- documents
- permissions
- inventory

Proveri da svi guardovi stvarno postoje.

---

# 16. SIDE EFFECTS TRANSICIJE

Transition može zahtevati:

- event
- email
- invoice
- reservation
- audit record

Ako status promena uspe, a side effect nestane, business process može stati.

---

# 17. DUPLICATE TRANSITION

Šta ako:

```text
approve()
approve()
```

stigne dvaput?

Drugi poziv ne sme duplirati:

- payment
- email
- reward
- stock movement

---

# 18. CONCURRENT TRANSITION

Scenario:

```text
Request A: approve
Request B: cancel
```

oba čitaju isti initial state.

Koji sme pobediti?

---

# 19. ATOMIC TRANSITION

Ako transition mora da važi samo iz određenog state-a:

proveri atomic DB update tipa:

```text
UPDATE ...
WHERE id = ?
AND status = 'SUBMITTED'
```

ili ekvivalent.

---

# 20. CHECK-THEN-UPDATE RACE

Pattern:

```text
read status
↓
if allowed
↓
update
```

može biti race ako konkurentni request menja state između.

---

# 21. VERSIONING / OPTIMISTIC LOCK

Ako se koristi version field:

proveri da conflict nije silent overwrite.

---

# 22. BUSINESS CLOCK

Za time-based pravila utvrdi authoritative clock.

Primer:

- booking expires
- trial expires
- campaign starts
- invoice overdue

Server-side business time je obično authority.

---

# 23. CLIENT TIME

Ne veruj client timestamp-u za critical eligibility bez validacije.

---

# 24. BOUNDARY TIME

Testiraj tačno:

```text
now == expiresAt
```

Da li je resource još validan ili ne?

Mora biti deterministički.

---

# 25. TIMEZONE

Ako business pravilo kaže:

```text
do kraja lokalnog dana
```

to nije isto što i UTC instant bez timezone context-a.

---

# 26. DST

Scheduled business rules po lokalnom vremenu mogu imati:

- missing hour
- duplicate hour

---

# 27. MONEY

Ako sistem radi sa novcem:

mapiraj:

- amount
- currency
- precision
- taxes
- discounts
- fees
- rounding

---

# 28. FLOATING POINT

Ne koristi binary float za critical money math ako precision može promeniti business rezultat.

---

# 29. ROUNDING

Utvrdi:

- kada se zaokružuje
- na koliko decimala
- kojim pravilom

---

# 30. ROUNDING REDOSLED

Primer:

```text
discount
tax
fee
rounding
```

Redosled može promeniti iznos.

---

# 31. CURRENCY

Nikad ne sabiraj:

```text
10 EUR + 10 USD
```

bez conversion/business rule-a.

---

# 32. EXCHANGE RATE

Ako postoji conversion:

- source rate
- timestamp
- rounding

moraju biti definisani.

---

# 33. NEGATIVE AMOUNT

Testiraj:

- 0
- negative
- extremely large

u skladu sa domain-om.

---

# 34. DISCOUNT

Proveri:

- max discount
- stacking
- expired
- user eligibility
- reuse

---

# 35. COUPON REUSE

Klasičan invariant:

```text
one use per user
```

mora preživeti concurrency.

---

# 36. COUPON GLOBAL LIMIT

Ako ima:

```text
100 redemptions total
```

check mora biti atomic.

---

# 37. INVENTORY

Za stock/reservation sistem:

```text
available >= 0
```

---

# 38. LAST ITEM RACE

Scenario:

```text
stock = 1

A reads 1
B reads 1

A reserves
B reserves
```

Oba ne smeju uspeti ako overselling nije dozvoljen.

---

# 39. RESERVATION

Mapiraj:

- available
- reserved
- sold
- released

---

# 40. RESERVATION EXPIRY

Expired reservation mora vratiti capacity jednom, ne dvaput.

---

# 41. RELEASE DUPLIKACIJA

Ako retry pozove release dvaput:

inventory ne sme porasti dvaput.

---

# 42. BOOKING

Za booking sistem proveri overlap.

---

# 43. DATE RANGE OVERLAP

Boundary:

```text
A ends exactly when B starts
```

da li je dozvoljeno?

---

# 44. CONCURRENT BOOKING

Dva korisnika pokušavaju isti slot.

DB/invariant mora odlučiti atomically.

---

# 45. QUOTA

Za limite:

```text
max 5 active resources per user
```

concurrent create može preći limit.

---

# 46. COUNT-THEN-CREATE

Pattern:

```text
count = 4
A checks
B checks
A creates
B creates
```

final = 6.

---

# 47. SUBSCRIPTIONS

Ako sistem ima subscription:

mapiraj:

- trial
- active
- past due
- cancelled
- expired

---

# 48. ENTITLEMENT

Ne vezuj entitlement samo za jedan lokalni boolean ako authoritative payment/subscription system kaže drugačije.

---

# 49. CANCEL AT PERIOD END

Razlikuj:

```text
cancelled now
```

od:

```text
cancel scheduled
```

---

# 50. RENEWAL

Webhook/event ordering može promeniti state.

---

# 51. PAYMENT WEBHOOK

External payment provider može biti authoritative za određene payment state-ove.

Proveri local command vs webhook precedence.

---

# 52. DUPLICATE WEBHOOK

Isti payment event ne sme duplirati business side effects.

---

# 53. OUT-OF-ORDER PAYMENT EVENT

Scenario:

```text
payment.succeeded
↓
payment.processing arrives late
```

state ne sme regresirati ako event versions/timestamps govore suprotno.

---

# 54. REFUND

Refund:

- full
- partial
- multiple partial

mora čuvati:

```text
refunded <= paid
```

---

# 55. DOUBLE REFUND

Retry/concurrency ne sme refundovati isti iznos dvaput.

---

# 56. CREDIT / BALANCE

Ako postoji internal balance:

svaka promena treba imati jasan ledger ili drugi pouzdan invariant model.

---

# 57. BALANCE KAO DERIVED VALUE

Ako se balance čuva i kao total i kroz transactions:

proveri drift.

---

# 58. LEDGER

Ako postoji ledger:

entries treba biti immutable ili strogo kontrolisane.

---

# 59. LEDGER SUM

Stored balance i sum ledger-a moraju imati reconciliation model ako oba postoje.

---

# 60. TRANSFER

Za transfer:

```text
debit A
credit B
```

mora biti atomic ili imati pouzdanu distributed compensation strategiju.

---

# 61. PARTIAL TRANSFER

Debit bez credit-a je critical data integrity problem.

---

# 62. SELF-TRANSFER

Ako nema smisla:

validiraj.

---

# 63. LIMITS

Daily/monthly/business limits treba da definišu:

- timezone
- reset
- pending transactions
- failed transactions

---

# 64. ORDER

Za order flow mapiraj:

```text
cart
↓
checkout
↓
payment
↓
confirmed
↓
fulfilled
```

---

# 65. PRICE SNAPSHOT

Ako product price može da se promeni posle order create-a:

koji iznos order treba da pamti?

---

# 66. RECOMPUTE PRICE

Ne oslanjaj se na current product price kada prikazuješ istorijski order ako order treba da čuva snapshot.

---

# 67. CLIENT PRICE

Ne veruj iznosu koji client pošalje bez server-side calculation/validation.

---

# 68. TAX

Ako se računa tax:

mapiraj authority i snapshot.

---

# 69. SHIPPING

Isto.

---

# 70. ORDER TOTAL

Proveri invariant:

```text
subtotal
- discounts
+ tax
+ fees
= total
```

prema stvarnim pravilima.

---

# 71. STATUS + PAYMENT

Impossible state primer:

```text
order = PAID
payment = FAILED
```

Ako je moguće privremeno zbog eventual consistency-ja, mora biti jasno modelovano.

---

# 72. STATUS DERIVATION

Ako status može biti derived iz drugih podataka, duplicirano čuvanje može driftovati.

---

# 73. USER LIFECYCLE

Mapiraj:

```text
invited
active
suspended
deleted
```

---

# 74. SUSPENDED USER

Proveri koji actions ostaju dozvoljeni.

Ne oslanjaj se samo na login denial ako existing session/token i dalje radi.

---

# 75. DELETED USER

Background jobs/webhooks ne smeju ponovo kreirati ili menjati podatke obrisanog korisnika bez jasnog modela.

---

# 76. ACCOUNT MERGE

Ako postoji:

proveri identity, ownership i duplicate resources.

---

# 77. EMAIL CHANGE

Ako email predstavlja login identity:

proveri verification flow i uniqueness.

---

# 78. ROLE CHANGE

Role change mora uticati na active sessions/cached permissions prema security modelu.

---

# 79. OWNERSHIP TRANSFER

Ako resource može promeniti owner-a:

proveri:

- old owner permissions
- child resources
- cache
- jobs

---

# 80. PARENT/CHILD BUSINESS RULE

Child može zavisiti od parent state-a.

Primer:

```text
cannot add item to CLOSED project
```

---

# 81. PARENT STATE RACE

Parent može biti zatvoren između child validation i child insert-a.

---

# 82. CASCADE BUSINESS EFFECTS

Delete parent može zahtevati:

- cancel jobs
- archive children
- refund
- notify

DB cascade sama ne rešava business effects.

---

# 83. SOFT DELETE

Soft-deleted resource ne treba da učestvuje u aktivnim business rule-ovima osim ako je namerno.

---

# 84. RESTORE

Ako se restore-uje soft-deleted resource:

proveri uniqueness/conflicts sa novim resource-ima.

---

# 85. ARCHIVE

Archive nije nužno delete.

Pravila pristupa i mutation-a treba jasno da se razlikuju.

---

# 86. IMMUTABILITY

Neki field posle određenog state-a više ne sme da se menja.

Primer:

```text
invoice amount after issued
```

---

# 87. HISTORY

Ako se business record mora istorijski očuvati:

ne čitaj current linked entity umesto snapshot-a.

---

# 88. NAME SNAPSHOT

Order možda treba da čuva product name/price u trenutku kupovine.

Ako samo referencira current product, istorija se menja.

---

# 89. APPROVAL WORKFLOW

Mapiraj:

- requester
- reviewer
- approver

---

# 90. SELF-APPROVAL

Ako business rule zabranjuje:

proveri.

---

# 91. TWO-PERSON RULE

Ako critical action zahteva dve različite osobe:

DB/service invariant mora to stvarno enforce-ovati.

---

# 92. DUPLICATE APPROVAL

Isti approver ne sme brojati dvaput ako rule zahteva unique approvers.

---

# 93. PARALLEL APPROVAL

Dva approvals koja zajedno dosežu threshold moraju samo jednom pokrenuti final side effect.

---

# 94. THRESHOLD

Ako:

```text
2 approvals required
```

treći concurrent approval ne sme duplirati finalization.

---

# 95. FEATURE LIMIT

Free vs paid limits moraju biti enforce-ovani backend-side, ne samo UI.

---

# 96. PLAN CHANGE

Upgrade/downgrade može promeniti resource limits.

Pitaj šta se događa ako user već ima više resursa od novog limita.

---

# 97. TRIAL

Trial eligibility treba sprečiti trivijalni reuse ako product to zahteva.

---

# 98. TRIAL START

Ne koristi client-controlled date.

---

# 99. PROMOTION

Promo period/eligibility treba da ima server-side rule.

---

# 100. REFERRAL

Ako postoji referral reward:

proveri:

- self-referral
- duplicate
- cycle
- reward condition

---

# 101. REWARD SIDE EFFECT

Reward treba izdati tačno jednom.

---

# 102. COUNTERS

Ako system ima:

- views
- usage
- quota
- attempts

utvrdi da li exact ili approximate semantics trebaju.

---

# 103. EXACT COUNTER

Financial/quota counter obično zahteva atomicity.

---

# 104. APPROXIMATE COUNTER

Analytics views možda ne zahtevaju strong consistency.

Ne prekomplikuj.

---

# 105. RATE-BASED BUSINESS RULE

Primer:

```text
3 free exports per month
```

nije samo security rate limiting.

To je business quota.

---

# 106. RESET BOUNDARY

Definiši monthly/day reset po timezone-u i inclusive granicama.

---

# 107. FILE BUSINESS RULES

Ako resource ima attachment:

proveri:

- mandatory file
- max count
- ownership
- deletion

---

# 108. FILE REPLACEMENT

Replace može zahtevati:

```text
new upload succeeds
↓
DB update
↓
old file deletion
```

Redosled failure-a može ostaviti broken resource.

---

# 109. NOTIFICATION KAO BUSINESS SIGNAL

Ako korisnik mora biti obavešten, email failure možda ima business značaj.

Ako je samo convenience, drugačije.

Klasifikuj eksplicitno.

---

# 110. SIDE EFFECT CRITICALITY

Za svaki side effect označi:

```text
CRITICAL
RETRYABLE
BEST-EFFORT
INFORMATIONAL
```

---

# 111. BEST-EFFORT

Analytics failure ne treba obarati checkout.

---

# 112. CRITICAL SIDE EFFECT

Payment capture ne može biti tretiran kao običan best-effort callback.

---

# 113. ORDERING SIDE EFFECTS

Mapiraj redosled:

```text
validate
reserve
charge
commit
notify
```

Pitaj šta ako svaki korak padne.

---

# 114. FAILURE MATRIX

Za critical workflow:

| Step | If fails before | If fails after | Recovery |
|---|---|---|---|

---

# 115. COMPENSATION

Ako više sistema učestvuje:

proveri compensation.

Primer:

```text
inventory reserved
↓
payment fails
↓
release inventory
```

---

# 116. COMPENSATION MOŽE PASTI

Šta ako release inventory takođe padne?

Potrebna može biti reconciliation strategija.

---

# 117. SAGA

Ne uvodi saga framework automatski.

Analiziraj actual multi-step distributed workflow.

---

# 118. RECONCILIATION

Za eventual consistency sistem pitaj:

> Kako se detektuje i popravlja stuck/inconsistent business state?

---

# 119. STUCK STATE

Primer:

```text
PROCESSING
```

zauvek.

Postoji li timeout/recovery?

---

# 120. ORPHAN STATE

Resource može ostati bez parent/external counterpart-a.

---

# 121. REPAIR JOB

Ako postoji reconciliation worker:

proveri da je idempotent i dovoljno konservativan.

---

# 122. ADMIN REPAIR

Admin alat može biti potreban, ali ne sme zaobići sve business invariants bez audit-a.

---

# 123. MANUAL OVERRIDE

Ako admin može override:

proveri:

- permission
- audit
- reason
- allowed transitions

---

# 124. FORCE FLAG

Traži:

```text
force=true
skipValidation=true
```

i sve call-site-ove.

---

# 125. DANGEROUS INTERNAL FLAG

Internal option može postati user-controlled kroz request mapping.

---

# 126. IMPORT

Bulk import često zaobilazi normalni create flow.

Proveri da isti business invariants važe.

---

# 127. MIGRATION SCRIPT

Data migration takođe može napraviti states koje runtime code inače ne dozvoljava.

---

# 128. SEED

Production seed/init treba da čuva constraints.

---

# 129. WEBHOOK

External provider event ne treba da bude able da proizvede nemoguć lokalni business state.

---

# 130. EVENT CONSUMER

Message event može biti stale ili duplikat.

---

# 131. EVENT VERSION

Ako event entity version < current version:

ne bi trebalo da regresira state.

---

# 132. EVENTUAL CONSISTENCY

Dokumentuj koje kontradikcije su:

```text
TEMPORARILY EXPECTED
```

a koje su:

```text
INVALID AT ALL TIMES
```

---

# 133. TEMPORARY INCONSISTENCY

Nemoj prijaviti kao bug ako architecture namerno omogućava kratku eventual-consistency fazu i ima convergence.

---

# 134. NO CONVERGENCE

Ako temporary inconsistency može ostati zauvek nakon failure-a:

realan problem.

---

# 135. CACHE

Business rule ne treba da zavisi od stale cache-a kada correctness zahteva current state.

---

# 136. CACHED ELIGIBILITY

Primer:

```text
user eligible cached 1h
↓
admin revokes permission
↓
old cache still approves action
```

Security/business impact.

---

# 137. READ REPLICA

Ako business decision čita lagging replica pa write ide primary:

stale read može prekršiti invariant.

---

# 138. READ-AFTER-WRITE

Critical workflow može zahtevati primary/consistent read.

---

# 139. EVENTUAL SEARCH INDEX

Search index nije authority za critical existence/ownership decision.

---

# 140. EXTERNAL PROVIDER STATE

Ako external provider predstavlja authority:

lokalni stale copy ne sme donositi critical odluku bez odgovarajuće freshness strategije.

---

# 141. PAYMENT PROVIDER

Local `paid=true` možda nije dovoljan ako reconciliation kaže drugačije.

---

# 142. EMAIL VERIFICATION

Ako verified flag zavisi od token event-a:

proveri token reuse/expiry kao business flow.

Detalji security-ja mogu u poseban audit.

---

# 143. TOKEN-BASED BUSINESS ACTION

Invite, reset, confirm token često ima invariant:

```text
usable once
```

---

# 144. TOKEN REUSE

Concurrent requests sa istim tokenom ne smeju oba napraviti side effect.

---

# 145. INVITE

Mapiraj:

```text
created
sent
accepted
expired
revoked
```

---

# 146. ACCEPT AFTER REVOKE

Ne sme uspeti osim ako domain kaže drugačije.

---

# 147. ACCEPT TWICE

Ne sme kreirati duplicate membership.

---

# 148. INVITE EMAIL CHANGE

Ako invite targetira email, proveri identity semantics nakon account changes.

---

# 149. MEMBERSHIP

Unique:

```text
user + organization
```

constraint može čuvati duplicate membership.

---

# 150. OWNER LEAVES

Ako organization mora imati makar jednog owner-a:

last owner ne sme sebe ukloniti/demote-ovati bez transfera.

---

# 151. DELETE LAST ADMIN

Sličan invariant.

---

# 152. TEAM LIMIT

Concurrent invite/accept može preći plan limit.

---

# 153. COUNT PENDING?

Business rule mora definisati da li pending invites ulaze u limit.

---

# 154. APPROVAL COUNT

Rejected/cancelled approvals ne treba pogrešno brojati.

---

# 155. RETRY SEMANTICS

Za svaku business akciju klasifikuj:

```text
SAFE TO RETRY
IDEMPOTENT WITH KEY
NOT SAFE TO RETRY
UNKNOWN
```

---

# 156. LOST RESPONSE

Critical scenario:

```text
business action succeeds
↓
response lost
↓
client retries
```

Finalni state mora ostati validan.

---

# 157. DUPLICATE JOB

Isti business action kroz queue može biti izvršen više puta.

---

# 158. CRON REENTRY

Periodični job može početi ponovo pre nego što prethodni završi.

---

# 159. LONG-RUNNING BUSINESS JOB

Primer:

- invoicing
- billing
- report
- payroll

proveri overlap i checkpoints.

---

# 160. BATCH PROCESSING

Ako job obrađuje 10.000 records:

partial failure mora imati resume semantics.

---

# 161. CHECKPOINT

Ne označavaj batch "completed" dok svi required records nisu obrađeni.

---

# 162. PARTIAL BATCH

Proveri da retry ne duplira već uspešno obrađene side effects.

---

# 163. BATCH ORDER

Ako processing redosled ima business značenje:

queue/batch mora ga čuvati.

---

# 164. MONTH-END / PERIOD CLOSE

Ako domain ima closing period:

nakon close-a određeni mutations možda nisu dozvoljeni.

---

# 165. BACKDATED CHANGE

Backdating može menjati historical calculations.

Proveri rule.

---

# 166. RECALCULATION

Ako historical input promena zahteva recalculation downstream records:

proveri da se radi.

---

# 167. DERIVED DATA

Mapiraj:

```text
source fields
↓
derived fields
```

---

# 168. STORED DERIVED DATA

Ako se derived value čuva:

ko ga ažurira kada source promeni?

---

# 169. DRIFT

Primer:

```text
item prices changed
↓
stored invoice total not recalculated
```

Može biti bug ili potpuno ispravan historical snapshot.

Razumi domain.

---

# 170. SNAPSHOT VS LIVE DERIVATION

Obavezno razlikuj.

---

# 171. AUDIT HISTORY

Ako business zahteva istoriju promena:

proveri da update ne briše prethodno značenje.

---

# 172. UPDATED_BY

Ako se prati actor:

background/system actions treba imati jasan actor model.

---

# 173. EVENT TIME VS PROCESS TIME

Business history treba razlikovati:

```text
occurredAt
processedAt
```

gde je potrebno.

---

# 174. SOURCE

Ako ista promena može doći iz:

- user
- admin
- webhook
- migration

audit record može zahtevati source.

---

# 175. DOMAIN ERRORS

Business failure treba imati prepoznatljiv domain error:

- limit reached
- invalid transition
- insufficient balance
- already used

---

# 176. GENERIC INTERNAL ERROR

Ne pretvaraj očekivani business rejection u 500.

---

# 177. ERROR MESSAGE NIJE BUSINESS RULE

Client ne treba da parsira poruku da bi znao šta se dogodilo.

---

# 178. TRANSACTION

Za svaki invariant proveri transaction boundary.

---

# 179. DB CONSTRAINT

Gde je moguće, critical invariant dodatno zaštiti DB constraint-om.

Ali ne pokušavaj složena business pravila nasilno pretvoriti u SQL constraint ako to nije održivo.

---

# 180. APPLICATION-ONLY INVARIANT

Ako invariant ne može lako u DB:

proveri concurrency control i centralizovan service.

---

# 181. MULTI-SERVICE INVARIANT

Ako pravilo prelazi granice servisa:

dokumentuj eventual consistency/compensation.

---

# 182. DISTRIBUTED LOCK NIJE PRVI ODGOVOR

Prvo razmotri:

- conditional write
- unique constraint
- version
- idempotency
- queue partitioning

---

# 183. PROPERTY-BASED TEST

Business invariant je često dobar kandidat za property test.

Primer:

```text
balance never negative
```

---

# 184. STATE MACHINE TEST

Generiši sekvence legalnih/ilegalnih actions i proveri state.

---

# 185. CONCURRENCY TEST

Za critical invariant:

kontrolisano pokreni dva request-a pre commit-a.

---

# 186. RETRY TEST

Isti operation ID više puta.

---

# 187. FAILURE-INJECTION TEST

Ubaci failure između business koraka.

---

# 188. WEBHOOK DUPLICATE TEST

Isti event dva puta.

---

# 189. OUT-OF-ORDER EVENT TEST

Noviji event pa stariji.

---

# 190. CLOCK BOUNDARY TEST

Tačno pre, na i posle expiry-ja.

---

# 191. MONEY TEST

Koristi values koji izazivaju rounding edge:

```text
0.1
0.2
1.005
```

u skladu sa stvarnim storage/decimal modelom.

---

# 192. LIMIT TEST

Tačno:

```text
limit - 1
limit
limit + 1
```

---

# 193. ZERO TEST

Zero često ima posebnu semantiku.

---

# 194. NEGATIVE TEST

Ako nije dozvoljeno.

---

# 195. MAX TEST

Veoma veliki input može otkriti overflow.

---

# 196. INTEGER OVERFLOW

Ako business counters/amount koriste fixed integer:

proveri realan range.

---

# 197. DUPLICATE ENTITY TEST

Same unique business identity kroz dva concurrent create-a.

---

# 198. CROSS-ENTRY TEST

Ista business akcija jednom kroz API, jednom kroz worker/admin.

---

# 199. IMPORT TEST

Invalid row među validnim.

Proveri partial semantics.

---

# 200. RECOVERY TEST

Seeduj stuck/intermediate business state.

Pokreni recovery/reconciliation.

---

# 201. BUSINESS FLOW MAP

Za svaki top critical workflow napravi:

```text
Initial state
↓
Action
↓
Validation
↓
State change
↓
Side effects
↓
Final state
```

---

# 202. FAILURE FLOW MAP

Za isti workflow:

```text
failure after step 1
failure after step 2
failure after step 3
```

---

# 203. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Business process:
Entity:
Invariant:
Current state:
Action:
Expected next state:

Entry point:
File/Class:
Function:
DB table/constraint:
Relevant code:

Problem:

Evidence:

Business Timeline:

T0:
T1:
T2:
T3:

Expected business outcome:

Actual/Possible outcome:

Invariant violated:

Data impact:

Financial impact:

User impact:

Concurrency/retry impact:

Root cause:

Recommended remediation:

Regression test:

Production verification:

Complexity:
XS / S / M / L / XL
```

Ako nije relevantno:

**NOT APPLICABLE**

---

# 204. SEVERITY

Koristi:

## P0 - CRITICAL

- financial corruption
- cross-user ownership corruption
- critical irreversible duplicate action
- catastrophic business state corruption
- security boundary bypass kroz business logic

## P1 - HIGH

- core invariant se može prekršiti u normalnom flow-u
- common concurrency/retry scenario pravi data loss
- payment/order/subscription workflow može završiti u ozbiljno pogrešnom stanju
- state machine dopušta critical nemoguću tranziciju

## P2 - MEDIUM

- značajan domain bug sa realnim user impact-om
- edge transition/reconciliation problem
- partial side effect inconsistency

## P3 - LOW

- ograničen business edge case
- minor domain inconsistency

## P4 - IMPROVEMENT

- centralizacija/clarity/testability bez potvrđenog business failure-a

---

# 205. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code + DB + flow direktno dokazuju invariant violation.

MEDIUM:

jak code-level scenario, ali production concurrency/external system nije potvrđen.

LOW:

zavisi od nepoznatog product pravila ili external contract-a.

---

# 206. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 207. PRODUCT RULE STATUS

Ako nije jasno da li je nešto zaista business invariant:

označi:

```text
BUSINESS RULE:
VERIFIED
INFERRED
NOT DOCUMENTED
```

Ne izmišljaj poslovno pravilo.

---

# 208. EXTERNAL AUTHORITY

Za payment/provider-based finding označi:

```text
EXTERNAL CONTRACT:
VERIFIED
INFERRED
NOT VERIFIED
```

---

# 209. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. sve entry point-e
2. service/business layer
3. DB transaction
4. DB constraints
5. queue/jobs
6. webhooks
7. retries
8. tests
9. product docs
10. external provider semantics

---

# 210. NE IZMIŠLJAJ DOMAIN

Ako ne postoji dokaz da:

```text
one user can have only one X
```

nemoj to proglasiti invariant-om.

Označi:

**BUSINESS RULE NOT DOCUMENTED**

---

# 211. NE PREPORUČUJ DDD AUTOMATSKI

Entity, aggregate, domain service i event nisu cilj sami po sebi.

Koristi najjednostavniju strukturu koja pouzdano čuva pravila.

---

# 212. NE PRETVARAJ SVAKI STATUS U STATE MACHINE FRAMEWORK

Ako ima dva jednostavna state-a, običan guard može biti dovoljan.

---

# 213. NE DODAJ EVENT BUS ZA SVAKI SIDE EFFECT

Direktan service call može biti sasvim dovoljan.

---

# 214. NE DODAJ SAGA FRAMEWORK AUTOMATSKI

Distributed compensation može se implementirati i jednostavnije.

---

# 215. NE OSLANJAJ SE SAMO NA UI

Frontend disabled button nije business invariant.

---

# 216. NE OSLANJAJ SE SAMO NA SERVICE CHECK

Ako critical invariant može zaštititi DB constraint:

proveri zašto nema poslednje linije odbrane.

---

# 217. NE MENJAJ KOD

Tokom audita:

- ne menja state machine
- ne dodaje constraints
- ne menja payment flow
- ne menja queue
- ne centralizuje service
- ne refaktoriše domain

Prvo završi audit.

---

# 218. OUTPUT - BACKEND_BUSINESS_LOGIC_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- domain model
- critical business flows
- invariant coverage
- najveći business rizici
- data integrity stanje

## 2. Domain Entity Map

## 3. Business Invariant Inventory

## 4. Entry Point Map

## 5. State Machine Audit

## 6. Transition Guard Audit

## 7. Concurrency / Race Audit

## 8. Retry / Idempotency Audit

## 9. Transaction Boundary Audit

## 10. Money / Precision Audit

Ako relevantno.

## 11. Inventory / Capacity / Quota Audit

Ako relevantno.

## 12. Order / Booking / Workflow Audit

Ako relevantno.

## 13. Subscription / Entitlement Audit

Ako relevantno.

## 14. Payment / Refund Audit

Ako relevantno.

## 15. User / Ownership Lifecycle Audit

## 16. Parent / Child Domain Rules

## 17. Side Effect Audit

## 18. Webhook / Event Ordering Audit

## 19. Batch / Background Job Audit

## 20. Reconciliation / Recovery Audit

## 21. Time / Expiration Audit

## 22. Historical Snapshot / Derived Data Audit

## 23. Admin / Override Audit

## 24. Test Coverage

## 25. Findings Summary

| ID | Severity | Invariant | Process | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 26. P0 Findings

## 27. P1 Findings

## 28. P2 Findings

## 29. P3 Findings

## 30. P4 Improvements

## 31. Things Done Well

## 32. Unknown / Undocumented Business Rules

## 33. Remediation Roadmap

---

# 219. INVARIANT MATRIX

| Invariant | Entry points | Service guard | DB guard | Concurrent-safe | Status |
|---|---|---|---|---|---|

---

# 220. STATE MACHINE MATRIX

| Entity | From | Action | To | Guard | Atomic |
|---|---|---|---|---|---|

---

# 221. RETRY MATRIX

| Action | Duplicate possible | Idempotent | Business consequence | Protection |
|---|---|---|---|---|

---

# 222. SIDE EFFECT MATRIX

| Business action | Side effect | Criticality | Durable | Retry-safe |
|---|---|---|---|---|

---

# 223. FAILURE MATRIX

| Workflow step | Failure before | Failure after | Recovery |
|---|---|---|---|

---

# 224. SECOND PASS - DOUBLE ACTION ATTACK

Za svaki critical command simuliraj:

```text
Action
Action
```

istovremeno.

Primer:

- approve twice
- redeem twice
- refund twice
- reserve twice
- accept invite twice

Pitaj:

> Da li oba mogu da uspeju?

---

# 225. SECOND PASS - CONFLICTING ACTION ATTACK

Simuliraj:

```text
approve
cancel
```

ili:

```text
update
delete
```

istovremeno.

---

# 226. SECOND PASS - FAILURE BETWEEN EVERY STEP

Za svaki critical workflow ubaci failure posle svakog persistent/external side effect-a.

Pitaj:

> Kakvo stanje ostaje?

---

# 227. SECOND PASS - LOST RESPONSE

Business action uspe, ali caller ne sazna.

Ponovi action.

---

# 228. SECOND PASS - DUPLICATE WEBHOOK

Pošalji isti provider event dvaput.

---

# 229. SECOND PASS - OUT-OF-ORDER WEBHOOK

Noviji state pa stariji event.

Pitaj da li state može regresirati.

---

# 230. SECOND PASS - OLD JOB

Delayed background job se izvršava nakon što se business state promenio.

Primer:

```text
job scheduled while ACTIVE
↓
entity later CANCELLED
↓
old job executes
```

Pitaj da li ponovo proverava current state.

---

# 231. SECOND PASS - ADMIN BYPASS

Izvrši critical action kroz admin/internal path.

Pitaj da li on čuva iste hard invariants.

Admin može imati više prava, ali ne treba nužno moći da korumpira podatke.

---

# 232. SECOND PASS - TIME BOUNDARY

Testiraj:

```text
1 ms before expiry
exact expiry
1 ms after expiry
```

---

# 233. SECOND PASS - LIMIT BOUNDARY

Test:

```text
limit - 1
limit
limit + 1
```

i dva concurrent request-a na granici.

---

# 234. SECOND PASS - MONEY BOUNDARY

Testiraj:

- 0
- minimum
- max
- decimal rounding
- refund = payment
- refund > payment

---

# 235. SECOND PASS - STALE READ

Pretpostavi da business check čita stale:

- cache
- replica
- event projection

Pitaj može li critical invariant biti prekršen.

---

# 236. SECOND PASS - PROCESS CRASH

Process padne:

```text
posle DB commit-a
pre side effect ack-a
```

Pitaj šta se ponavlja i šta se gubi.

---

# 237. SECOND PASS - BATCH PARTIAL FAILURE

Neki records uspeju, jedan padne.

Pitaj:

- rollback?
- continue?
- retry?
- duplicate?

---

# 238. SECOND PASS - RECONCILIATION

Namerno seeduj nemoguć/stuck state ako je bezbedno u test okruženju.

Pitaj da li sistem ume da ga:

- detektuje
- prijavi
- popravi

---

# 239. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- business pravila nisu izmišljena
- critical invariants su eksplicitno inventarisani
- svi entry point-i su provereni
- controller check nije tretiran kao globalna zaštita
- state transitions su mapirane
- direct arbitrary status update je analiziran
- concurrent transitions imaju atomicity proveru
- retry scenariji imaju duplicate side-effect analizu
- DB constraints su proverene gde su primenljive
- money precision/rounding je proverena gde postoji novac
- quotas/limits su testirani na granici i concurrency-ju
- time rules imaju tačne boundary semantics
- webhook events imaju duplicate/out-of-order analizu
- delayed jobs ponovo proveravaju current business state gde je potrebno
- side effects su klasifikovani po criticality
- failure između koraka je analiziran
- compensation failure je uzet u obzir
- eventual consistency nije pogrešno proglašena bugom ako postoji convergence
- stored derived data i historical snapshot nisu pomešani
- admin override nije automatski prihvaćen kao validan bypass hard invariants
- P4 architectural improvements su odvojeni od stvarnih business bugova

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Centralizujte business logiku u service layer i koristite transakcije.

To nije business logic audit.

Tražim probleme poput:

```text
coupon has 1 remaining use
↓
Request A checks remaining = 1
Request B checks remaining = 1
↓
A redeems
B redeems
↓
coupon is used twice
```

ili:

```text
Order = SUBMITTED
↓
Request A approves
Request B cancels
↓
both read SUBMITTED
↓
A writes APPROVED
↓
B writes CANCELLED
↓
approval side effects already executed
↓
final order says CANCELLED
```

ili:

```text
payment captured
↓
DB update fails
↓
client receives error
↓
client retries checkout
↓
second payment capture occurs
```

ili:

```text
refund request = 60
existing refunded = 50
original payment = 100
↓
two concurrent refund requests each validate:
50 + 60 > 100?
using stale value
↓
both proceed
↓
total refunded exceeds payment
```

ili:

```text
plan allows max 5 projects
↓
user currently has 4
↓
two create requests run concurrently
↓
both count 4
↓
both create
↓
user ends with 6
```

ili:

```text
entity CANCELLED
↓
old delayed job created while entity was ACTIVE executes
↓
job never re-checks current state
↓
entity receives side effect that is no longer allowed
```

ili:

```text
payment.succeeded webhook processed
↓
state becomes PAID
↓
older payment.processing event arrives later
↓
consumer blindly applies event
↓
state regresses from PAID to PROCESSING
```

To su business logic problemi koje treba da pronađeš.

Razmišljaj kroz:

- invariants
- legal state transitions
- concurrency
- retries
- idempotency
- side effects
- partial failures
- time boundaries
- quotas
- ownership
- external authorities
- reconciliation

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koje poslovno pravilo se krši?

> Da li je to pravilo dokumentovano ili izvedeno iz koda?

> Kojim tačnim redosledom događaja problem nastaje?

> Koji drugi entry point može zaobići zaštitu?

> Šta se događa ako operacija stigne dvaput?

> Šta se događa ako dve konfliktne operacije rade istovremeno?

> Koji layer je poslednja linija odbrane?

Ako business pravilo nije potvrđeno:

**BUSINESS RULE NOT DOCUMENTED.**

Ako nema dovoljno tehničkih dokaza:

**NOT VERIFIED.**

Ako postoji samo bolji način organizovanja business koda bez trenutnog failure-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih invariant violation-a sa preciznim timeline-om nego napisati 100 generičkih saveta o service layer-u.

Cilj je dobiti forenzički precizan business logic audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- invariant test
- state-machine regression test
- concurrency test
- DB constraint
- atomic transition
- idempotency zaštitu
- reconciliation mechanism
- production-safe business workflow
