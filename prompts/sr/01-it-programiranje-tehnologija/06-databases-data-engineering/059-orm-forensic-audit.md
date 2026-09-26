---
id: UPL-IT-059
number: 59
slug: orm-forensic-audit
title: ORM Forensic Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# ORM FORENSIC AUDIT

Želim kompletan forensic audit ORM/data-access sloja, bez pretpostavke da ORM automatski obezbeđuje correctness, security ili performance.

Primeni actual ORM:

- Prisma
- Drizzle
- TypeORM
- Sequelize
- Hibernate
- EF Core
- SQLAlchemy
- Django ORM
- Room
- drugi

## 1. OBJECTIVE AND NON-GOALS

Dokaži gde ORM i sloj za pristup podacima proizvode SQL, transakcije ili stanja podataka koja se razlikuju od onoga što kod naizgled izražava: query-ji koji izlaze iz tenant ili soft-delete opsega, upisi van predviđene transakcije, filteri koji tiho nestaju, zastareli entiteti koji prepisuju novije podatke i nebezbedan raw SQL.

Van obima:

- preporuka drugog ORM-a
- opšte podešavanje SQL performansi (samo kada ponašanje ORM-a stvara problem)
- stilske preferencije o repository obrascima ili query builder-ima
- tretiranje svakog raw SQL poziva ili lazy relacije kao defekta

## 2. ORM DETECTION

Utvrdi pre bilo kakvog zaključka:

```text
ORM and exact version:
Database driver / adapter and version:
Generated client or model classes (and how they are regenerated):
Connection pooling (driver, ORM, external proxy):
Transaction API used in the codebase:
Global filters, middleware, extensions or interceptors in use:
Migration tool and whether schema sync / push is possible in production:
Runtime (long-lived server, serverless, edge):
```

Semantika ORM-a menja se između major verzija (kako se tretiraju undefined vrednosti, podrazumevano učitavanje, ponašanje upsert-a, propagacija transakcija). Navedi verziju pre opisa bilo kakvog ponašanja i potvrdi kritično ponašanje pregledom generisanog SQL-a.

## 3. EVIDENCE MODEL

```text
A - observed: generated SQL captured from logs or tests, or the wrong behavior reproduced
B - complete path: code path traced from input to ORM call, with version-specific semantics confirmed in documentation or source
C - strong static evidence: a risky ORM pattern in code, but semantics or reachability not fully confirmed
D - inference: plausible behavior depending on version or configuration
E - hardening: safer pattern where the current code is not exploitable or incorrect
```

## 4. FINDING STATUS

- **CONFIRMED** - generisani SQL ili reprodukovano ponašanje pokazuju problem (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od verzije ORM-a, konfiguracije ili ponašanja u runtime-u koji nisu mogli da se provere.
- **NOT APPLICABLE** - obrazac se ne javlja sa ovim ORM-om ili verzijom.
- **CONTROLLED** - rizik postoji, ali je neutralisan (validiran ulaz, whitelist identifikatora, constraint-i u bazi).
- **HARDENING** - bezbednija alternativa bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan put do injection-a, izlaska iz opsega podataka, problema sa transakcijom, tačnošću ili dostupnošću.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Raw SQL nije automatski SQL injection: parametrizovani raw query-ji i tagged-template API-ji koji vezuju vrednosti su bezbedni za vrednosti.
- Lazy loading nije N+1 dok stvarna putanja koda ne pristupa relaciji više puta za mnogo parent zapisa.
- `findById(id)` nije automatski defekt autorizacije ako tenant ili vlasništvo obezbeđuje globalni filter, row-level security policy ili prethodna provera koju si potvrdio.
- ORM cascade ili default-i koji se razlikuju od onih u bazi nisu defekt ako se ništa ne oslanja na ponašanje baze.
- Vraćanje ORM entiteta iz API-ja nije automatski curenje podataka ako serializer eksplicitno bira polja.
- Bulk operacija koja preskače hook-ove nije defekt ako nijedan hook ne sadrži obaveznu logiku.

## 6. ORM INVENTORY

```text
ORM:
Version:
Models:
Migration tool:
Lazy loading:
Transactions:
Raw SQL support:
Connection pool:
```

## 7. MODEL -> SCHEMA DRIFT

Compare ORM model sa live migration/schema definicijom.

## 8. NULLABILITY

Code says required, DB says nullable or reverse.

## 9. DEFAULT

ORM vs DB.

## 10. ENUM

## 11. RELATION

Foreign key behavior.

## 12. CASCADE

ORM cascade != DB cascade nužno.

## 13. ORPHAN REMOVAL

## 14. SOFT DELETE

Default scopes.

## 15. TENANT SCOPE

Global query hooks/extensions.

## 16. `findById(id)`

High-value if tenant/ownership expected.

## 17. GLOBAL FILTER

Can be bypassed by raw query/alternate repository.

## 18. ADMIN BYPASS

Should be explicit.

## 19. GLOBAL FILTER BYPASS PATHS

Tenant i soft-delete filteri implementirani u ORM-u (middleware, extension-i, default scope-ovi, interceptor-i) štite samo query-je koji kroz njih prolaze. Proveri svaku drugu putanju:

- raw SQL i pozive query builder-a
- alternativni repository, drugu instancu klijenta ili "sistemski" klijent
- loader-e relacija i include-ove (da li se filter primenjuje na povezane redove, a ne samo na koren?)
- aggregate, count, exists i group-by query-je
- bulk update i delete
- admin alate, background poslove i skripte koje prave sopstveni klijent
- view-ove, funkcije i trigger-e u bazi

Za svako zaobilaženje pokaži da li ID koji kontroliše pozivalac može da dođe do reda drugog tenant-a ili obrisanog reda.

## 20. MASS ASSIGNMENT

Object spread directly to ORM create/update.

## 21. HIDDEN FIELD

Role/tenant/owner.

## 22. SELECT

Default selects may include sensitive fields.

## 23. SERIALIZATION

ORM entity returned directly.

## 24. LAZY LOADING

N+1.

## 25. EAGER LOADING

Join explosion.

## 26. RELATION INCLUDE

Overfetch.

## 27. RAW SQL

Parameterization.

## 28. RAW IDENTIFIER

Sort/table/column.

## 29. UNSAFE ESCAPE API

ORM-specific.

## 30. VALUES VS IDENTIFIERS

Parametri štite **vrednosti**, a ne **identifikatore**. Query može ispravno da veže sve vrednosti i da ipak bude ranjiv na injection kroz:

- ime kolone koje se koristi za sortiranje ili filtriranje (`ORDER BY ${sortField}`)
- ime tabele ili šeme izabrano u runtime-u (multi-tenant šeme)
- JSON putanju ili operator sastavljen od ulaza
- raw fragmente prosleđene "unsafe" ORM helper-ima

Svaki dinamički identifikator mora da dolazi iz fiksne whitelist-e mapirane u kodu, nikada direktno iz zahteva. Proveri helper-e za escaping za konkretan ORM i verziju.

## 31. TRANSACTION API

Does callback actually use same transaction client/session?

## 32. TRANSACTION LEAK

Code calls global ORM client inside transaction callback.

Example:

```text
transaction(tx => {
  tx.order.update(...)
  globalClient.audit.create(...)
})
```

Second write may not participate.

## 33. ASYNC TRANSACTION

External await inside transaction.

## 34. TRANSACTION CLIENT PROPAGATION

Upisi učestvuju u transakciji samo ako koriste klijent ili kontekst transakcije. Prati svaki upis koji se poziva unutar transaction callback-a:

- helper funkcije i servise koji importuju globalni klijent umesto da prime klijent transakcije
- repository-je instancirane jednom sa globalnim klijentom
- event handler-e, hook-ove ili audit logger-e koji se okidaju unutar callback-a
- propagaciju async konteksta (da li se ORM oslanja na async-local storage i da li on preživljava tu putanju koda?)
- ugnježdene pozive servisa koji otvaraju sopstvenu transakciju

Za svaki upis navedi da li se commit-uje ili rollback-uje zajedno sa ostatkom i koje nekonzistentno stanje nastaje ako ne.

## 35. NESTED TRANSACTION

ORM semantics.

## 36. SAVEPOINT

## 37. ISOLATION

Actual options.

## 38. RETRY

ORM/client may auto-retry certain errors.

## 39. UPSERT

Concurrency semantics.

## 40. `connectOrCreate`

Potential races depending on unique constraints.

## 41. FIRST OR CREATE

## 42. BULK CREATE

Partial errors.

## 43. `updateMany/deleteMany`

Missing where condition.

## 44. EMPTY FILTER

Critical scenario:

```text
deleteMany({})
```

## 45. UNDEFINED FILTER

Some ORMs ignore undefined fields.

Security/correctness risk.

## 46. NULL VS UNDEFINED

Important in JS ORMs.

## 47. UNDEFINED AND NULL IN FILTERS

U nekoliko JavaScript/TypeScript ORM-ova svojstvo filtera čija je vrednost `undefined` se izbacuje, umesto da ne odgovara ničemu. Proveri za detektovani ORM i verziju:

```text
tenantId = req.user.tenantId      // undefined for a misconfigured service token
deleteMany({ where: { tenantId } })
↓
where clause becomes empty
↓
rows of every tenant are deleted
```

Proveri svaki filter sastavljen od opcionog ulaza, podataka iz sesije ili konfiguracije: `where`, `updateMany`, `deleteMany`, `count` i filtere relacija. Proveri i kako se `null` razlikuje od `undefined` u update-ima (postavljanje kolone na NULL naspram ostavljanja bez izmene).

## 48. DYNAMIC WHERE

Request object spread.

## 49. DYNAMIC ORDER

## 50. PAGINATION

ORM offset implementation.

## 51. COUNT

## 52. RELATION COUNT

N+1.

## 53. QUERY GENERATION

Inspect actual SQL, not ORM intention.

## 54. PARAMETER TYPES

Implicit cast.

## 55. DATE CONVERSION

Timezone.

## 56. DECIMAL

ORM may return string/Decimal object.

## 57. BIGINT

JS number overflow.

## 58. JSON

Typed code vs runtime arbitrary structure.

## 59. MIGRATION AUTO-GENERATION

Review generated SQL.

## 60. SCHEMA PUSH/SYNC

Production destructive risk.

## 61. CLIENT GENERATION

Version mismatch.

## 62. CONNECTION MANAGEMENT

Singleton vs per-request client.

## 63. SERVERLESS

Opening new ORM client per function/request can exhaust DB.

## 64. HOT RELOAD

Dev clients.

## 65. CONNECTION LEAK

## 66. POOL

Driver vs ORM pool.

## 67. PREPARED STATEMENT

Proxy compatibility.

## 68. QUERY TIMEOUT

## 69. CANCELLATION

## 70. ERROR MAPPING

Unique/FK/deadlock errors.

## 71. RETRYABLE ERROR

## 72. ERROR MAPPING AND RETRY DECISIONS

Za svaku klasu grešaka baze proveri šta aplikacija radi:

```text
unique violation        -> conflict response or idempotent success, never a generic 500 that the client retries
foreign key violation   -> validation error or not-found, depending on the cause
serialization failure   -> retry the whole transaction (bounded, with backoff)
deadlock                -> retry the whole transaction (bounded, with backoff)
timeout / cancellation  -> do not blindly retry non-idempotent writes; the first attempt may have committed
connection error        -> retry only if the operation is idempotent or known not to have executed
```

Proveri da se greške prepoznaju po stabilnim kodovima grešaka drajvera, a ne po tekstu poruke, i da retry-ji ne ponavljaju side effect-e.

## 73. NOT FOUND

## 74. OPTIMISTIC CONCURRENCY

Version field.

## 75. CHANGE TRACKING

EF/Hibernate-like stale entity state.

## 76. FIRST-LEVEL CACHE

## 77. SECOND-LEVEL CACHE

Staleness.

## 78. DIRTY CHECKING

Unexpected writes.

## 79. PARTIAL UPDATE

May overwrite fields with stale values.

## 80. ENTITY MERGE

Detached object risk.

## 81. UNIT OF WORK AND STALE ENTITIES

U ORM-ovima sa identity map-om ili praćenjem izmena proveri kako se dugo živeći entiteti upisuju nazad:

- entitet učitan na početku zahteva (ili keširan između zahteva) i sačuvan na kraju upisuje **sve** praćene kolone i prepisuje izmene koje su drugi pisci u međuvremenu napravili
- detached entiteti spojeni nazad u sesiju mogu da ožive obrisane redove ili vrate starije vrednosti
- dirty checking može da izda UPDATE koji niko nije nameravao (na primer kada konverzija tipa promeni vrednost)
- first-level cache može unutar jedne sesije da vrati zastareli entitet pošto je druga sesija promenila red

Za entitete koji se istovremeno menjaju daj prednost parcijalnim update-ima eksplicitno izmenjenih polja ili optimistic proveri verzije.

## 82. BATCHING

ORM may auto-batch, verify.

## 83. LOGGING

Queries can include PII.

## 84. SENSITIVE PARAMETER LOGGING

Dev feature accidentally in prod.

## 85. ORM FEATURE / RISK MATRIX

| ORM feature | Used where | Version-specific behavior checked | Risk (scope, injection, transaction, stale write, performance) | Guard | Status |
|---|---|---|---|---|---|

## 86. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
ORM / version:
Scope (model, call site):
Trigger (input, job, request):
Current behavior (code and generated SQL):
Transaction context:
Expected behavior:
Failure / exploit path:
Impact (data scope, security, correctness, performance):
Blast radius:
Evidence:
Root cause:
Fix:
Verification (generated-SQL assertion, test):
Regression risk:
```

## 87. SEVERITY

- **P0** - injection, pristup tuđem tenant-u ili masovna izmena/brisanje podataka dostupni iz spoljnog ulaza (na primer undefined filter u `deleteMany` ili raw identifikator iz zahteva).
- **P1** - upisi van predviđene transakcije u kritičnim tokovima, zaobilaženje tenant ili soft-delete filtera nad osetljivim podacima, schema sync nad production-om ili prepisivanje važnih podataka zastarelim entitetima.
- **P2** - značajni defekti tačnosti ili performansi koje izaziva ponašanje ORM-a na važnim putanjama (pogrešno mapiranje grešaka koje izaziva ponavljanje već commit-ovanih upisa, eksplozija lazy loading-a, gubitak preciznosti).
- **P3** - ograničeni problemi na sporednim putanjama.
- **P4** - hardening: bezbedniji API-ji, testovi generisanog SQL-a, higijena logovanja.

## 88. OUTPUT

`ORM_FORENSIC_AUDIT.md`

## 89. SECOND PASS

Pretraži repozitorijum za sledeće i pregledaj njihov generisani SQL:

- raw SQL interfejse i nebezbednu interpolaciju stringova
- dinamičke identifikatore (sort, filter, tabela, šema)
- `findUnique` / `findById` pozive nad modelima vezanim za tenant
- `updateMany` / `deleteMany` operacije i svaki filter sastavljen od opcionih vrednosti
- spread objekata u create i update pozive
- transaction callback-e i svaki upis u njima
- include-ove relacija i lazy pristup u petljama
- inicijalizaciju klijenta po zahtevu ili po pozivu
- mesta gde se entiteti keširaju ili čuvaju između zahteva

Zatim pokušaj da opovrgneš svaki nalaz: da li globalni filter, constraint u bazi ili row-level security policy već to blokira? Da li se ova verzija ORM-a i dalje ovako ponaša?

## 90. FINAL QUALITY GATE

Pre podizanja kritičnih nalaza proveri stvarni generisani SQL i semantiku specifičnu za verziju ORM-a.

Pre vraćanja izveštaja proveri da:

- su ORM, drajver i verzije identifikovani
- svaki kritični nalaz sadrži ili referencira generisani SQL
- su tenant i soft-delete filteri provereni na raw query-jima, alternativnim klijentima, relacijama, agregatima i bulk operacijama
- su dinamički identifikatori provereni odvojeno od vezanih vrednosti
- je svaki upis u transaction callback-u proveren za propagaciju klijenta
- su filteri sastavljeni od opcionih vrednosti provereni za undefined/null semantiku
- su mapiranje grešaka i retry provereni za upise koji su commit-ovani, a završili timeout-om
- su razmotrena prepisivanja zastarelim entitetima i parcijalnim update-ima za modele koji se istovremeno menjaju
- je životni ciklus konekcija proveren za runtime (serverless, hot reload, proxy)
- raw SQL i lazy loading nisu prijavljeni bez konkretnog failure path-a
- su statusi i evidence tier-ovi dosledno primenjeni

# KONAČNO PRAVILO

Tražim:

```text
transaction(async tx => {
  await tx.orders.create(...)
  await sendPayment(...)
  await prisma.auditLog.create(...)
})

↓
auditLog uses global prisma client
↓
not part of transaction

↓
later transaction rollback
↓
audit log claims order exists
↓
database state diverges
```

Drugi failure chain-ovi koje tražim:

```text
tenant filter implemented as ORM middleware on findMany/findFirst
↓
reporting endpoint uses a raw aggregate query with a tenantId from the URL
↓
middleware does not apply to raw queries
↓
any authenticated user can read revenue totals of other tenants
```

```text
edit form loads the order entity, user edits notes for 10 minutes
↓
meanwhile the payment webhook sets status = PAID
↓
form submit calls save(order) with the full stale entity
↓
status is written back to PENDING
↓
paid order is shipped again or cancelled by a cleanup job
```
