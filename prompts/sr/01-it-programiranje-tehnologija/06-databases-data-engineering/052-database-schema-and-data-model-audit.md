---
id: UPL-IT-052
number: 52
slug: database-schema-and-data-model-audit
title: Audit šeme baze i modela podataka
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# AUDIT ŠEME BAZE I MODELA PODATAKA

Želim forenzičku analizu schema-e i domain modela sa fokusom na dugoročnu correctness, integrity, evoluciju i queryability.

Glavni cilj:

> Pronaći mesta gde database schema ne uspeva da izrazi stvarne business invariants, dozvoljava nemoguće state-ove, duplira authoritative podatke, meša tenant boundaries ili otežava bezbednu evoluciju sistema.

## 1. OBJECTIVE AND NON-GOALS

Dokaži da li šema može da predstavi svako validno poslovno stanje i da **ne može** da predstavi nevalidna, za identitet, vlasništvo, tenancy, relacije, životni ciklus, istoriju i buduće izmene. Svaki nalaz mora da imenuje poslovno pravilo, nevalidno stanje koje šema dozvoljava i realan put kojim to stanje nastaje.

Van obima:

- podešavanje performansi query-ja (samo kada izbor modela onemogućava efikasno izvršavanje tačnog query-ja)
- mehanika izvršavanja migracija (lock-ovi, backfill-ovi), osim da se navedu posledice predložene izmene modela na migracije
- preferencije stila imenovanja bez uticaja na tačnost
- zahtevanje normalizacije ili denormalizacije kao principa; svaki izbor ocenjuj po invarijantama koje štiti ili ugrožava

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
Database engine(s) and version(s):
ORM and how the schema is defined (migrations, model definitions, both):
Multi-tenant model (shared tables with tenant_id, schema per tenant, database per tenant):
Core domain entities and their lifecycles:
External systems that own or mirror data (payments, identity provider, CRM, search):
Retention, archival and deletion rules (legal, contractual):
Consumers of the schema besides the application (analytics, exports, integrations):
```

Mogućnosti constraint-a razlikuju se po engine-u i verziji (partial unique indeksi, deferrable constraint-i, exclusion constraint-i, check constraint-i koje neki engine-i parsiraju, ali ne primenjuju). Proveri pre nego što preporučiš rešenje na nivou baze.

## 3. DOMAIN INVARIANT EXTRACTION

Pre pregleda bilo koje tabele izvuci poslovna pravila koja podaci moraju da zadovolje. Izvori: dokumentacija domena, kod za validaciju, servisna logika, testovi, ograničenja u UI-ju, support tiketi i izveštaji o incidentima.

Svako pravilo zapiši kao preciznu tvrdnju:

```text
a user has at most one membership per organization
an invoice total equals the sum of its lines at the time of issue
a PAID order has paid_at and a payment reference
a task and its project belong to the same tenant
subscription periods of one account never overlap
```

Zatim pregledaj šemu u odnosu na ovu listu. Pregled tabela bez liste invarijanti daje komentare o stilu, a ne nalaze o tačnosti.

## 4. EVIDENCE MODEL

```text
A - observed: invalid rows exist in the data (found with a read-only query), or the invalid state was produced in a test
B - complete path: schema allows the state AND a traced code path (endpoint, job, import, admin tool) can write it
C - strong static evidence: schema allows the state and application-only validation is the sole guard
D - inference: the state is allowed but no writer path is known yet
E - hardening: adding a constraint for a rule that is already reliably enforced elsewhere
```

Prijavi broj nevalidnih redova, nikada lične podatke u njima.

## 5. FINDING STATUS

- **CONFIRMED** - nevalidni podaci postoje ili je praćena putanja upisa do nevalidnog stanja (tier A ili B).
- **LIKELY** - šema dozvoljava stanje i samo validacija u aplikaciji ga sprečava (tier C).
- **NOT VERIFIED** - zavisi od mogućnosti engine-a, podataka ili putanja koda koji nisu mogli da se provere.
- **NOT APPLICABLE** - pravilo ne postoji u ovom domenu.
- **CONTROLLED** - šema dozvoljava stanje, ali ga drugi mehanizam pouzdano sprečava ili popravlja.
- **HARDENING** - dodatni constraint bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice (foreign key koji nedostaje, nullable kolona) kao potvrđeni defekt ako ne omogućava upis ili čitanje stvarnog nevalidnog stanja.

## 6. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- JSON kolone, EAV ili polimorfne relacije su kompromis, a ne automatski loš obrazac; nalaz su samo kada krše konkretnu invarijantu, tipove ili zahtev za query.
- Foreign key koji nedostaje nije automatski defekt preko granica baze ili servisa, ili tamo gde se reference pouzdano validiraju i čiste.
- Denormalizovana ili duplirana polja nisu automatski pogrešna ako je jedan izvor jasno autoritativan, a kopija se sinhronizuje ili ponovo izračunava.
- Nekoliko boolean flag-ova nije automatski prikrivena state machine; mogu biti nezavisne dimenzije.
- Nullable kolona nije automatski pogrešna; razlikuj unknown, not applicable i not yet set.
- Surrogate ključevi nisu automatski bolji od prirodnih ključeva, niti obrnuto.

## 7. ENTITY INVENTORY

Za svaku domain entity:

```text
Entity:
Table:
Identity:
Owner:
Tenant:
Lifecycle:
Required fields:
Relationships:
Business invariants:
```

## 8. BUSINESS INVARIANT -> DB SUPPORT

Za svaki invariant odredi:

- application only
- DB constraint
- transaction
- external authority

## 9. IMPOSSIBLE STATE

Traži combinations koje business nikad ne bi trebalo da dozvoli.

Primer:

```text
status = PAID
paid_at = NULL
```

## 10. IMPOSSIBLE STATE HUNT

Za svaki entitet sa životnim ciklusom nabroj kombinacije polja koje nikada ne bi trebalo da se pojave zajedno i proveri da li ih šema sprečava:

```text
status = PAID      AND paid_at IS NULL
status = CANCELLED AND shipped_at IS NOT NULL
deleted_at IS NOT NULL AND status = ACTIVE
end_date < start_date
quantity <= 0 on an order line
parent_id = id (self-parent)
```

Za svaku kombinaciju: da li je sprečava check constraint, tip (enum, domain), posebna tabela po stanju ili samo kod aplikacije? Zatim traži pisce koji zaobilaze taj kod (importi, admin alati, skripte, drugi servisi).

## 11. NULL SEMANTICS

Razlikuj:

- unknown
- not applicable
- not yet set

## 12. BOOLEAN EXPLOSION

Više boolean flags može dozvoliti kontradiktorna stanja.

## 13. STATE ENUM

State machine može biti jasniji.

Ne menjaj automatski ako booleans imaju independent semantics.

## 14. IDENTITY

Stable vs mutable natural key.

## 15. EMAIL AS PRIMARY KEY

Može biti problem ako email menja value.

## 16. SURROGATE KEY

Not automatically superior.

## 17. COMPOSITE IDENTITY

Tenant + external ID.

## 18. EXTERNAL ID

Unique scope.

## 19. GLOBAL UNIQUE VS TENANT UNIQUE

Critical.

## 20. OWNER/TENANT FOREIGN KEY

Child mora pripadati correct parent/tenant.

## 21. COMPOSITE FK

Može enforce-ovati:

```text
(project_id, tenant_id)
```

consistency.

## 22. TENANT AND OWNERSHIP INTEGRITY

Foreign key samo na `project_id` ne sprečava da task pokazuje na projekat drugog tenant-a. Proveri composite obrazac tamo gde tenant-i dele tabele:

```text
projects: UNIQUE (tenant_id, id)
tasks:    FOREIGN KEY (tenant_id, project_id) REFERENCES projects (tenant_id, id)
```

Za svaku child tabelu vezanu za tenant utvrdi da li baza garantuje da parent i child pripadaju istom tenant-u ili to garantuje samo kod aplikacije. Isto uradi za lance vlasništva (user -> membership -> organization -> resource).

## 23. ORPHAN RECORD

Missing FK/cascade logic.

## 24. MANY-TO-MANY

Join table unique pair.

## 25. DUPLICATE MEMBERSHIP

Missing unique constraint.

## 26. SELF-REFERENCE

Cycles.

## 27. TREE

Parent relationship + cycle prevention if required.

## 28. ORDERING

Position/rank duplicates.

## 29. MONEY

Amount/currency.

## 30. UNIT

Value without unit.

## 31. PERCENTAGE

Range constraint.

## 32. QUANTITY

Can it be negative?

## 33. COUNTER

Derived vs authoritative.

## 34. DENORMALIZED COUNT

Can drift.

## 35. AGGREGATE

Rebuild/reconciliation.

## 36. DERIVED DATA AUTHORITY

Za svaki brojač, zbir, keširani status ili drugo izvedeno polje zabeleži:

```text
Derived field:
Computed from:
Authoritative source:
Update mechanism (same transaction, trigger, async job, never):
Can it be recomputed from scratch?
Decisions made from it (billing, limits, access):
```

Izvedena vrednost koja upravlja odlukama, a ne može ponovo da se izračuna iz autoritativnog izvora, predstavlja rizik za tačnost.

## 37. SNAPSHOT

Historical invoice price should not necessarily reference current product price.

## 38. HISTORICAL DATA

Mutable relation may destroy historical truth.

## 39. ADDRESS

Current profile address vs order-time address.

## 40. HISTORICAL TRUTH AND SNAPSHOTS

Identifikuj činjenice koje moraju da budu zamrznute u trenutku kada su se desile:

- cena, poreska stopa i valuta na stavci fakture
- adresa za dostavu i primalac porudžbine
- uloga i organizacija korisnika u trenutku neke akcije (audit)
- uslovi, plan i cena perioda pretplate

Za svaku proveri da li šema čuva snapshot ili referencira promenljive trenutne podatke. Ako referencira trenutne podatke, pokaži koja kasnija izmena (promena cene, izmena adrese, uklanjanje članstva) tiho menja istoriju.

## 41. AUDIT FIELDS

created_by/updated_by where meaningful.

## 42. VERSION

Optimistic locking.

## 43. STATUS HISTORY

If business needs transitions/history.

## 44. SOFT DELETE

Uniqueness.

## 45. UNIQUE WITH SOFT DELETE

Partial unique index may be needed depending on DB.

## 46. SOFT DELETE MODEL

Tamo gde se koristi soft delete, proveri sve četiri posledice:

- **uniqueness** - obrisan red i dalje zauzima unique vrednost, osim ako je partial unique indeks ili drugi dizajn ne isključuje
- **restore** - vraćanje može da prekrši uniqueness koji je u međuvremenu zauzeo noviji red ili da oživi decu koja treba da ostanu obrisana
- **query scope** - svaki query, join, izveštaj i loader relacija mora da isključi obrisane redove; jedan filter koji nedostaje prikazuje obrisane podatke
- **cascade** - soft delete parent-a ne briše automatski decu; cascade u bazi deluje samo na hard delete

## 47. TEMPORAL VALIDITY

valid_from / valid_to.

## 48. OVERLAPPING RANGES

Schedule/subscription/inventory domains.

## 49. TEMPORAL MODEL

Za entitete sa periodima važenja (cene, članstva, pretplate, rezervacije):

- da li su intervali poluotvoreni (`[valid_from, valid_to)`), tako da se susedni periodi ne preklapaju i ne ostavljaju praznine?
- kako je predstavljeno "trenutno važi" (NULL valid_to, datum u dalekoj budućnosti) i da li je to dosledno?
- da li nepreklapanje obezbeđuje baza (exclusion constraint ili ekvivalent) ili samo kod aplikacije pod konkurentnošću?
- da li se timestamp-ovi čuvaju u UTC-u, uz jasno pravilo za datume koji su po prirodi lokalni (rođendani, radni dani)?
- da li ispravka prošlog perioda može da se zabeleži bez prepisivanja istorije?

## 50. CHECK CONSTRAINT

Ranges.

## 51. DATE VS TIMESTAMP

Correct semantic type.

## 52. TIMEZONE

Store instant consistently.

## 53. JSON

Document-like flexibility vs integrity.

## 54. JSON VERSIONING

Schema field inside payload if long-lived.

## 55. JSON SECURITY FIELD

Do not bury critical authorization data in arbitrary JSON without controlled schema.

## 56. POLYMORPHIC RELATION

`type + id` loses normal FK enforcement.

Analyze tradeoff.

## 57. EAV

Entity-attribute-value can destroy type/integrity/query performance.

Use only if actual domain justifies.

## 58. GENERIC TABLE

`key/value` config tables.

## 59. JSON, EAV AND POLYMORPHIC TRADE-OFFS

Fleksibilne strukture ocenjuj po tome šta gube:

```text
Structure:
Why it was chosen (dynamic attributes, integration payloads, many owner types):
Lost guarantee (foreign keys, types, NOT NULL, uniqueness, indexing):
Compensating mechanism (validation schema, triggers, application checks, cleanup jobs):
Invariants that depend on data inside it:
```

Nalaz postoji kada poslovna invarijanta, bezbednosni atribut ili polje po kojem se često filtrira zavisi od podataka koje baza ne može da validira ili ograniči.

## 60. DUPLICATED FACT

Same email/name/status copied across tables.

Which is authoritative?

## 61. SYNCHRONIZATION

If duplicate by design, update model.

## 62. EXTERNAL SYSTEM

Local mirror vs source of truth.

## 63. WEBHOOK DATA

Keep raw event if needed for idempotency/audit.

## 64. IDENTITY MAPPING

External provider ID must have proper uniqueness.

## 65. TENANT ISOLATION

Every tenant-scoped entity must make scope unambiguous.

## 66. GLOBAL TABLE

Some tables intentionally global.

Do not force tenant ID everywhere.

## 67. SHARED REFERENCE

Country/currency catalog.

## 68. CASCADE GRAPH

Map all delete paths.

## 69. CYCLE

Cascades may create unexpected delete behavior.

## 70. SET NULL

Can produce semantically invalid orphan.

## 71. RESTRICT

May block legitimate lifecycle unless application sequences deletes.

## 72. ARCHIVE

Archival table/schema.

## 73. DATA TYPE WIDTH

Integer overflow long-term.

## 74. ID BIGINT

Growth.

## 75. STRING ID

Length/collation.

## 76. COLLATION

Case sensitivity.

## 77. EMAIL CASE

Domain semantics.

## 78. USERNAME CASE

Uniqueness.

## 79. Unicode normalization.

## 80. FLOAT

Scientific vs financial.

## 81. DECIMAL SCALE

Rounding.

## 82. SERIALIZED DECIMAL

ORM conversion.

## 83. BLOB

Large binary in DB vs object storage.

No blanket answer.

## 84. INDEXABILITY

Schema design should support actual access patterns.

## 85. PARTITION KEY

If partitioned.

## 86. FUTURE EVOLUTION

Can schema add new states without breaking old clients?

## 87. MODEL EVOLUTION TEST

Testiraj model na verovatne buduće izmene i prijavi samo gde je odgovor skup ili nebezbedan:

- novo stanje životnog ciklusa (na primer PARTIALLY_REFUNDED)
- druga valuta, region tenant-a ili jezik
- one-to-one koji postaje one-to-many (korisnik sa više adresa, porudžbina sa više plaćanja)
- novi tip vlasnika za polimorfnu relaciju
- zakonski zahtev za brisanje ili anonimizaciju ličnih podataka uz čuvanje finansijskih zapisa

Za svaku: koje tabele, constraint-i, enum-i i potrošači se menjaju i da li stara i nova verzija aplikacije mogu da rade istovremeno tokom te izmene?

## 88. ENUM MIGRATION

DB enum can be operationally awkward depending on engine.

## 89. DEFAULT VALUE MIGRATION

Old rows.

## 90. REQUIRED COLUMN

Safe rollout.

## 91. BACKWARD COMPATIBILITY

Old code/new schema.

## 92. DATA CONTRACT

Analytics/downstream consumers.

## 93. MIGRATION HISTORY

Model evolution patterns.

## 94. NAMING

Consistency.

## 95. RESERVED WORDS

Portability/tooling.

## 96. CASE-SENSITIVE NAMES

Quoted identifiers can create friction.

## 97. ORM MAPPING

Does code model match actual schema?

## 98. DRIFT

Schema generated from ORM vs migrations.

## 99. HIDDEN COLUMN

DB field absent from domain model.

## 100. DOMAIN FIELD ABSENT FROM DB

Potential persistence loss.

## 101. SCHEMA DOCUMENTATION

Not security requirement, but useful for critical entities.

## 102. MATRICES

### Entity Matrix

| Entity | PK | Tenant | Owner | Lifecycle | Main invariants |
|---|---|---|---|---|---|

### Relationship Matrix

| Parent | Child | FK | Same-tenant guaranteed | Delete behavior | Soft delete handling | Risk |
|---|---|---|---|---|---|---|

### Invariant Matrix

| Invariant | App enforcement | DB enforcement | Concurrency safe | Repair / reconciliation | Status |
|---|---|---|---|---|---|

## 103. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (entity / table / relationship):
Invariant:
Current schema:
Allowed invalid state:
Trigger (writer path that can produce it):
Failure path:
Impact (business, security, reporting, history):
Blast radius (rows, tenants, consumers):
Evidence (query counts, code path):
Root cause:
Recommended model:
Migration implications (data cleanup, backfill, mixed-version compatibility):
Verification (constraint test, data check):
Regression risk:
```

## 104. SEVERITY

- **P0** - model dozvoljava vlasništvo između tenant-a, gubitak finansijske ili pravne istorije, ili podatke o autorizaciji koji mogu postati kontradiktorni, a postoji putanja upisa.
- **P1** - nevalidna stanja na kritičnim entitetima (duplirana članstva, plaćanja bez porudžbina, osiroćeni finansijski zapisi) koja su uočena ili dostupna kroz praćenu putanju.
- **P2** - invarijante na važnim entitetima koje štiti samo kod aplikacije, istorijski podaci koji mogu tiho da se prepišu, ili izbori modela koji blokiraju poznat predstojeći zahtev.
- **P3** - slabiji tipovi, nullability ili imenovanje sa ograničenim uticajem na tačnost.
- **P4** - hardening: dodatni constraint-i, dokumentacija, priprema za budućnost bez trenutnog failure path-a.

## 105. OUTPUT

`DATABASE_SCHEMA_DATA_MODEL_AUDIT.md`

## 106. SECOND PASS

Za svaki kritični entitet pitaj:

- da li mogu da se naprave duplirani zapisi (uključujući pod konkurentnim zahtevima)?
- da li osiroćeni zapisi mogu da ostanu posle brisanja, importa ili neuspelih upisa?
- da li entitet ili njegova deca mogu da pripadaju dvama različitim tenant-ima?
- da li status životnog ciklusa može da postane kontradiktoran sa drugim poljima?
- da li istorijski zapisi mogu naknadno da promene značenje?
- da li soft delete može da prekrši uniqueness, ili restore da oživi nevalidne kombinacije?
- da li kolizije eksternih ID-eva mogu da povežu pogrešne zapise?
- da li intervali mogu da se preklope ili da ostave praznine?
- koji pisci zaobilaze validaciju aplikacije (importi, skripte, admin alati, drugi servisi)?

Zatim pokušaj da opovrgneš svaki nalaz: da li postoji constraint, trigger ili jedan pisac koji već sprečava stanje? Da li je pravilo zaista deo domena?

## 107. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da je svaki kritični entitet proveren za:

- **identity** - stabilan ključ, ispravan opseg uniqueness-a
- **ownership** - vlasnik je jednoznačan i ne može da pokazuje na pogrešnog parent-a
- **tenant** - garantovano je da parent i child pripadaju istom tenant-u
- **uniqueness** - pravila važe pod konkurentnošću i uz soft delete
- **nullability** - NULL ima jedno jasno značenje po koloni
- **relationships** - foreign key-evi, ponašanje pri brisanju, cascade i ciklusi
- **historical state** - činjenice koje moraju biti zamrznute čuvaju se kao snapshot
- **impossible states** - kontradiktorne kombinacije polja se sprečavaju ili otkrivaju
- **lifecycle** - dozvoljeni prelazi i završna stanja mogu da se predstave i primenjuju se
- **evolution** - verovatne buduće izmene ne zahtevaju nebezbedne prepravke

Proveri i da je lista invarijanti izvučena pre pregleda tabela i da su statusi i evidence tier-ovi dosledno primenjeni.

# KONAČNO PRAVILO

Tražim:

```text
membership table:
user_id
organization_id
role

↓
nema UNIQUE(user_id, organization_id)

↓
isti user dobija dve membership rows
↓
jedna MEMBER, druga ADMIN

↓
različiti query paths biraju različitu row
↓
authorization postaje nondeterministic
```

Drugi failure chain-ovi koje tražim:

```text
invoice_lines.product_id references products
↓
invoice shows products.price instead of a stored line price
↓
catalog price is updated next month
↓
re-printed historical invoices show the new price
↓
accounting records no longer match what customers paid
```

```text
comments(commentable_type, commentable_id) without foreign keys
↓
invoice 42 is hard-deleted by a cleanup job; its comments remain as orphans
↓
a support view joins comments to tickets on commentable_id only, ignoring commentable_type
↓
the orphaned invoice comments appear on ticket 42, possibly in another customer's account
```

```text
subscription_periods(account_id, valid_from, valid_to) without an overlap constraint
↓
upgrade and renewal jobs run at the same time
↓
two active periods overlap for one account
↓
customer is billed twice for the overlapping days
```
