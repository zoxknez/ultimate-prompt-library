---
id: UPL-IT-016
number: 16
slug: android-persistence-and-room-audit
title: Android Persistence & Room Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# ANDROID PERSISTENCE AND ROOM AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog persistence sloja Android aplikacije, sa posebnim fokusom na Room, SQLite, DataStore, SharedPreferences, fajlove, cache i lokalni source of truth.

Glavni cilj:

> Utvrditi da li aplikacija pouzdano čuva, migrira, čita, menja i briše lokalne podatke bez gubitka, korupcije, race condition-a, cross-user curenja, nekonzistentnih relacija ili problema koji se pojavljuju tek nakon više verzija aplikacije.

Ovo nije:

- generički Room checklist
- savet da se "koristi Repository pattern"
- automatsko dodavanje indeksa
- automatsko prebacivanje SharedPreferences u DataStore
- preporuka da se sve obavije transakcijom
- površna provera DAO interfejsa
- analiza samo trenutne schema verzije
- pretpostavka da migration test znači da su podaci semantički ispravni

Fokus je na stvarnom životnom ciklusu podataka:

```text
create
↓
read
↓
update
↓
delete
↓
migration
↓
backup/restore
↓
logout/account switch
↓
app update
↓
process death
↓
recovery
```

Prioritet:

**data integrity > migration safety > transaction correctness > account isolation > recoverability > query correctness > performance > architecture elegance**

Bolje je pronaći 6 stvarnih persistence problema koji mogu izgubiti ili pogrešno prikazati podatke nego napisati 100 generičkih Room preporuka.

---

# 1. UTVRDI PERSISTENCE STACK

Pre nalaza utvrdi:

- Room verziju
- SQLite layer
- database version
- export schema konfiguraciju
- migration strategiju
- DAO strukturu
- entity modele
- relations
- indices
- foreign keys
- converters
- DataStore
- SharedPreferences
- files
- cache directories
- encrypted storage ako postoji
- backup/import/export mehanizam
- sync/offline model
- multi-account model
- WorkManager interaction

Pregledaj najmanje:

- `@Database`
- `@Entity`
- `@Dao`
- migrations
- callbacks
- repositories
- DataStore
- SharedPreferences
- file persistence
- backup/restore
- tests
- schema JSON fajlove ako postoje

---

# 2. NAPRAVI DATA OWNERSHIP MAPU

Za svaki važan tip podatka odredi:

```text
Data:
Owner:
Source of truth:
Local storage:
Remote storage:
User-specific:
Durable:
Cache-only:
Retention:
```

Primer:

```text
Profile
↓
server authority
↓
Room cache
↓
user-scoped
```

ili:

```text
Draft
↓
local authority
↓
Room
↓
must survive process death
```

Ne možeš proceniti persistence correctness bez razumevanja ownership-a.

---

# 3. SOURCE OF TRUTH

Za svaki feature odgovori:

> Koja kopija podatka je autoritativna?

Mogući odgovori:

- server
- Room
- DataStore
- file
- in-memory state
- hybrid

Traži situaciju gde UI može dobiti različite odgovore iz više izvora bez jasnog prioriteta.

---

# 4. DATABASE ARCHITECTURE

Mapiraj:

```text
UI
↓
ViewModel
↓
Repository
↓
DAO
↓
Room
↓
SQLite
```

Ako repository kombinuje remote i local:

```text
API
↓
Repository
↓
transaction
↓
Room
↓
Flow
↓
UI
```

Prati stvarni execution flow.

---

# 5. DATABASE VERSION

Utvrdi trenutnu Room database verziju.

Zatim pronađi sve prethodne podržane verzije.

Napravi:

| Version | Schema change | Migration | Tested |
|---|---|---|---|

Ako istorija nije dostupna:

**HISTORICAL SCHEMA COVERAGE: NOT VERIFIED**

---

# 6. MIGRATION GRAPH

Ne proveravaj samo:

```text
v6 -> v7
```

Proveri kompletan upgrade graph.

Primer:

```text
v1
↓
v2
↓
v3
↓
v4
↓
v5
↓
v6
↓
v7
```

Korisnik može preskočiti više verzija aplikacije.

---

# 7. SKIPPED VERSION UPGRADE

Scenario:

```text
user has app DB v2
↓
does not update for 2 years
↓
installs latest DB v9
```

Pitaj:

> Postoji li validan migration path?

Nemoj pretpostaviti da Play Store korisnici prolaze kroz svaku verziju aplikacije.

---

# 8. DIRECT MIGRATION

Ako postoje direktne migracije:

```text
2 -> 5
```

proveri da li se sukobljavaju sa chain migration modelom.

---

# 9. DESTRUCTIVE MIGRATION

Pronađi:

- `fallbackToDestructiveMigration`
- destructive downgrade
- custom database deletion

Za svaki usage utvrdi:

> Koji podaci se mogu izgubiti?

Ako su podaci samo rebuildable cache, severity može biti nizak.

Ako su user-generated i jedina kopija:

severity može biti veoma visok.

---

# 10. MIGRATION CONTENT CORRECTNESS

Migration koja SQL tehnički uspe ne mora semantički biti ispravna.

Primer:

```text
old column status INTEGER
↓
new status TEXT
```

Proveri mapping svih starih vrednosti.

---

# 11. DEFAULT VALUES U MIGRACIJI

Kada se dodaje `NOT NULL` kolona, proveri:

- default
- stvarnu semantiku default vrednosti
- stare redove

Nemoj prihvatiti default samo zato što migration prolazi.

---

# 12. COLUMN RENAME

Proveri da rename ne postane slučajno:

```text
add new column
↓
old data never copied
```

---

# 13. TABLE REBUILD

Kod SQLite migration pattern-a:

```text
create new table
↓
copy data
↓
drop old
↓
rename
```

proveri:

- sve kolone
- nullability
- defaults
- indexes
- foreign keys

---

# 14. INDEX POSLE MIGRACIJE

Table recreation može zaboraviti index.

Uporedi finalni schema output sa očekivanim entity definicijama.

---

# 15. FOREIGN KEY POSLE MIGRACIJE

Isto za foreign keys.

---

# 16. TRIGGERI

Ako DB koristi SQLite triggers, proveri da migration ne zaboravi njihovo ponovno kreiranje.

---

# 17. VIEW

Ako postoje database views, proveri migration compatibility.

---

# 18. FTS

Ako postoje FTS tabele:

- content table
- tokenizer
- rebuild
- migration

analiziraj posebno.

---

# 19. TYPE CONVERTERS

Mapiraj sve `TypeConverter` funkcije.

Traži:

- unstable serialization format
- enum name persistence
- locale-dependent format
- date/time ambiguity
- null mapping

---

# 20. ENUM PERSISTENCE

Ako se enum čuva kao:

```text
enum.name
```

preimenovanje konstante može učiniti stare podatke nečitljivim.

Ako se koristi ordinal:

reordering može biti još opasniji.

Proveri actual implementation.

---

# 21. STABLE PERSISTED ENUM VALUE

Ako business data treba dugoročno preživeti verzije, vrednost u bazi treba imati stabilnu semantiku.

Ne menjaj model bez migration plana.

---

# 22. DATE STORAGE

Utvrdi kako se čuvaju datumi:

- epoch millis
- epoch seconds
- ISO text
- local date string
- timezone-aware model

Traži implicitne timezone pretpostavke.

---

# 23. EPOCH UNIT

Sekunde i milisekunde mogu biti pomešane.

Proveri converters i API mapping.

---

# 24. LOCAL DATE VS INSTANT

Datum rođenja i server event timestamp nisu ista vrsta podatka.

Proveri da storage model odgovara semantici.

---

# 25. MONEY

Ako baza čuva novac kao floating point:

proveri precision risk.

Ne zahtevaj jedan model svuda, ali finansijska vrednost mora imati stabilnu preciznost.

---

# 26. DECIMAL SERIALIZATION

Ako decimalna vrednost ide kroz string, ne koristi locale-formatted display string kao persisted canonical value.

---

# 27. BOOLEAN

Ako legacy schema koristi integer/string boolean, proveri mapping svih vrednosti.

---

# 28. JSON U KOLONI

Ako se kompleksni object čuva kao JSON blob:

proveri:

- schema evolution
- unknown fields
- missing fields
- queryability
- partial corruption

---

# 29. VERSIONED JSON

Ako JSON predstavlja dugoročno durable user data, razmotri version field ako format evoluira.

Ne dodaj versioning ako podatak predstavlja disposable cache.

---

# 30. ENTITY ANALIZA

Za svaku važnu `@Entity` proveri:

- primary key
- nullability
- defaults
- indices
- foreign keys
- uniqueness
- ownership/user scoping

---

# 31. PRIMARY KEY

Pitaj:

> Da li ID zaista predstavlja stabilan identitet ovog reda?

Traži:

- mutable business field kao PK
- generated local ID bez remote mapping-a
- collision

---

# 32. AUTO-GENERATED ID

Kod offline/sync sistema proveri kako se lokalni generated ID mapira na server ID.

---

# 33. COMPOSITE KEY

Ako identitet zavisi od više polja, proveri da single-column key ne dozvoljava logičke duplikate.

---

# 34. UNIQUE CONSTRAINT

Business invariant treba po mogućnosti imati database-level zaštitu ako mora važiti pod concurrency-jem.

Primer:

```text
one row per user + provider
```

Nemoj se oslanjati samo na:

```text
if (!exists) insert
```

---

# 35. NULLABILITY

Uporedi:

- Kotlin nullability
- Room schema
- API
- migration

Traži mismatch.

---

# 36. DEFAULT

Default u Kotlin property-ju nije nužno SQLite column default.

Proveri stvarni schema output.

---

# 37. FOREIGN KEYS

Za svaku važnu relaciju utvrdi:

- parent
- child
- onDelete
- onUpdate

---

# 38. CASCADE DELETE

`CASCADE` može biti ispravan ili katastrofalan.

Prati:

```text
delete parent
↓
which child rows disappear?
```

---

# 39. RESTRICT / NO ACTION

Ako delete parent-a ne uspe zbog child-a, proveri UX/error behavior.

---

# 40. ORPHAN DATA

Ako nema FK-a, proveri da delete/update flow eksplicitno održava relaciju.

---

# 41. SOFT DELETE

Ako se koristi:

- deleted flag
- archived state
- deletedAt

proveri da svi relevantni query-ji isključuju/uključuju redove prema semantici.

---

# 42. SOFT DELETE + UNIQUE

Soft-deleted row može i dalje blokirati unique constraint.

Proveri business expectation.

---

# 43. RELATIONS

Pregledaj Room `@Relation`.

Traži:

- N+1
- huge result sets
- transaction consistency

---

# 44. `@Transaction` ZA RELATION

Ako Room učitava parent i relations kroz više query-ja, proveri da li snapshot treba biti konzistentan.

---

# 45. DAO INVENTORY

Klasifikuj DAO metode:

```text
READ
CREATE
UPDATE
DELETE
UPSERT
TRANSACTION
MAINTENANCE
```

---

# 46. RAW QUERY

Svaki `@RawQuery` analiziraj posebno.

Proveri:

- user-controlled SQL fragments
- projection
- invalidation tracking
- maintainability

---

# 47. STRING-BUILT SQL

Traži ručno spajanje user input-a u SQL.

To može biti correctness i security problem.

---

# 48. QUERY CORRECTNESS

Za važne query-je proveri:

- `WHERE`
- JOIN
- grouping
- ordering
- limit
- null semantics

Ne fokusiraj se samo na performance.

---

# 49. NULL SQL SEMANTIKA

SQL:

```text
column = NULL
```

ne radi kao:

```text
column IS NULL
```

Proveri dynamic query generation.

---

# 50. `NOT IN` + NULL

Ako subquery/list može sadržati NULL, `NOT IN` može dati neočekivane rezultate.

Prijavi samo konkretan case.

---

# 51. JOIN DUPLIKACIJA

JOIN preko one-to-many relacije može duplicirati parent redove.

Proveri mapping u UI/domain model.

---

# 52. DISTINCT

Ne dodaj `DISTINCT` samo da sakrije loš JOIN.

Pronađi root cause.

---

# 53. GROUP BY

SQLite može dozvoliti fleksibilnije GROUP BY ponašanje nego što developer intuitivno očekuje.

Proveri neagregirane kolone.

---

# 54. ORDERING

Bez `ORDER BY`, redosled nije garantovan.

Ako UI/business logic očekuje stabilan order, query mora ga definisati.

---

# 55. TIEBREAKER

Ako više redova ima isti primary sort field, dodaj stable secondary ordering ako user-visible order treba biti determinističan.

---

# 56. PAGINATION

Ako query koristi `LIMIT/OFFSET`, proveri stabilan ordering.

Bez njega pagination može duplirati/preskočiti redove.

---

# 57. OFFSET PAGINATION

Veliki offset može postati skup.

Ali performance finding zahteva realan dataset.

---

# 58. KEYSET PAGINATION

Razmotri samo ako dataset i UX stvarno zahtevaju.

---

# 59. LIMIT

Query koji očekuje jedan red treba jasno definisati šta se dešava ako postoje duplikati.

---

# 60. `SELECT *`

Ne prijavljuj automatski.

Pitaj:

- koliko kolona
- koliko redova
- da li postoje BLOB/large text
- šta caller koristi

---

# 61. LARGE BLOB

Veliki binary data u glavnoj Room tabeli može povećati memory/query cost.

Proveri:

- images
- PDFs
- media

Možda je file storage prikladniji, ali zavisi od use case-a.

---

# 62. CURSOR WINDOW / LARGE ROW

Veoma veliki row payload može izazvati runtime probleme.

Ne tvrdi bez realne veličine.

---

# 63. INDEX AUDIT

Za svaki critical query analiziraj:

- equality predicates
- ranges
- JOIN
- ORDER BY

Nemoj samo generisati index po svakoj koloni.

---

# 64. INDEX WRITE COST

Svaki dodatni index usporava write i zauzima storage.

Preporuka mora imati konkretan query benefit.

---

# 65. COMPOSITE INDEX

Redosled kolona je bitan.

Uporedi ga sa stvarnim query pattern-om.

---

# 66. REDUNDANT INDEX

Primary/unique/composite index može već pokrivati manji index.

Prijavi samo ako nepotrebnost ima realnu cenu.

---

# 67. QUERY PLAN

Ako tooling omogućava, koristi:

```text
EXPLAIN QUERY PLAN
```

za critical queries.

Ne izmišljaj rezultat.

---

# 68. FULL TABLE SCAN

Nije automatski problem za tabelu od 20 redova.

Severity zavisi od growth-a i frequency-ja.

---

# 69. N+1

Prati:

```text
load list
↓
for each item
↓
additional DAO query
```

Ako lista ima veliki cardinality, ovo može biti ozbiljan problem.

---

# 70. FLOW QUERY

Room Flow se ponovo emituje kada relevantna tabela invalidira query.

Proveri da write u nepovezani semantički deo tabele ne pokreće skupu recomputation prečesto.

---

# 71. DUPLICATE COLLECTORS

Više collector-a istog cold Room Flow-a može pokretati više query izvršenja.

Proveri repository sharing.

---

# 72. TRANSACTIONS

Mapiraj sve business operacije koje menjaju više redova/tabela.

Pitaj:

> Da li korisnik/server sme videti partial state?

Ako ne, potrebna je atomic boundary.

---

# 73. `@Transaction`

Ne dodaj je svuda.

Koristi je kada više DB operacija mora imati jednu konzistentnu celinu.

---

# 74. TRANSACTION + NETWORK

Nemoj držati SQLite transaction otvoren tokom network request-a bez ekstremno dobrog razloga.

To može dugo blokirati DB.

---

# 75. PARTIAL WRITE

Scenario:

```text
insert parent
↓
insert children
↓
failure on child 5
```

Šta ostaje?

---

# 76. IMPORT TRANSACTION

Backup/import koji replace-uje veliki deo baze mora imati jasno atomic behavior.

---

# 77. RESTORE FAILURE

Ako restore pukne na 80%:

> Da li stara baza još postoji ili korisnik ostaje sa polu-restorovanim podacima?

---

# 78. TEMP DATABASE STRATEGY

Za kompleksan full restore razmotri validate-then-swap model samo ako postojeći flow ima partial corruption risk.

---

# 79. CONCURRENCY

Room je thread-safe kao engine abstraction, ali business operacije i dalje mogu imati race.

---

# 80. READ-MODIFY-WRITE

Primer:

```text
read balance/state
↓
calculate
↓
update
```

Dve coroutine mogu izgubiti update ako operacija nije pravilno atomic.

---

# 81. `UPDATE ... SET value = value + 1`

Ponekad je SQL-level atomic update bolji od Kotlin read-modify-write.

Primeni samo gde odgovara domain-u.

---

# 82. UPSERT

Utvrdi stvarnu semantiku `@Upsert`.

Pitaj:

> Da li conflict znači update ili je conflict zapravo bug?

---

# 83. REPLACE

SQLite REPLACE semantika može uključivati delete + insert ponašanje, što može imati posledice po:

- foreign keys
- IDs
- triggers

Proveri stvarni usage.

---

# 84. INSERT CONFLICT STRATEGY

Analiziraj:

- ABORT
- IGNORE
- REPLACE

u odnosu na business semantics.

---

# 85. IGNORE

`IGNORE` može sakriti činjenicu da write nije izvršen.

Proveri da caller proverava rezultat gde je važno.

---

# 86. UPDATE BROJ REDOVA

Ako update treba da pogodi tačno jedan red, proveri return count ako API to omogućava.

Scenario:

```text
expected 1
actual 0
```

može značiti stale/deleted record.

---

# 87. DELETE BROJ REDOVA

Isto za delete.

---

# 88. OPTIMISTIC CONCURRENCY

Ako uređaj može menjati stale entity, proveri:

- version
- updatedAt
- server conflict
- overwrite policy

---

# 89. DATABASE AS CACHE

Ako Room sadrži samo remote cache, utvrdi invalidation/freshness model.

---

# 90. DATABASE AS SOURCE OF TRUTH

Ako UI čita samo Room, proveri da remote sync uvek na kraju završava u Room pre nego što UI očekuje promenu.

---

# 91. DUAL SOURCE UI

Ako UI ponekad koristi API result direktno, a ponekad Room Flow, može nastati kratkotrajni disagreement.

Prati konkretan flow.

---

# 92. OFFLINE WRITE

Ako user mutation prvo ide u Room:

```text
local write
↓
pending state
↓
sync
```

proveri durability pending metadata.

---

# 93. PENDING OPERATION

Pending sync state treba da preživi:

- process death
- app restart
- reboot

ako proizvod obećava eventualnu sinhronizaciju.

---

# 94. TOMBSTONE

Ako delete treba kasnije sinhronizovati, fizičko lokalno brisanje može izgubiti informaciju o pending delete-u.

Proveri actual sync model.

---

# 95. SYNC METADATA

Mapiraj:

- dirty
- synced
- pending
- version
- remote ID
- deleted/tombstone

ako postoji.

---

# 96. SYNC + MIGRATION

Stari pending operation može ostati u bazi kroz app upgrade.

Da li nova verzija razume stari payload/state?

---

# 97. DATASTORE

Mapiraj sve ključeve/Proto fields.

Klasifikuj:

```text
USER-SCOPED
DEVICE-SCOPED
APP-SCOPED
CACHE
CONFIG
```

---

# 98. PREFERENCES DATASTORE

Traži:

- typo key
- duplicate key definitions
- key rename bez migration-a
- default value semantic change

---

# 99. PROTO DATASTORE

Proveri schema evolution.

Ne reuse-uj uklonjen field number.

---

# 100. DATASTORE MIGRATION

Ako se prelazi sa SharedPreferences, proveri:

- koji ključevi
- kada
- partial migration
- cleanup

---

# 101. SHARED PREFERENCES

Ne proglašavaj ih zastarelim bugom samo zato što DataStore postoji.

Prijavi realan problem poput:

- blocking commit
- race
- corruption handling
- poor lifecycle model

---

# 102. `commit` VS `apply`

Synchronous `commit` na Main-u može biti performance problem.

Ali persistence correctness može zahtevati da caller zna success/failure.

Analiziraj context.

---

# 103. FILE PERSISTENCE

Mapiraj:

- internal files
- cache
- external files
- media
- temp

Za svaki pitaj:

> Da li ovaj direktorijum garantuje lifetime koji feature očekuje?

---

# 104. CACHE DIRECTORY

Cache može biti obrisan od strane sistema.

Nikada ga ne tretiraj kao jedinu durable kopiju critical user data.

---

# 105. TEMP FILE

Proveri cleanup i crash recovery.

---

# 106. ATOMIC FILE WRITE

Scenario:

```text
open target file
↓
truncate
↓
write
↓
process dies halfway
```

Rezultat može biti korumpiran.

Za critical config/backup razmotri temp-write + atomic replace gde filesystem semantics dozvoljavaju.

---

# 107. FILE VERSIONING

Ako app čuva vlastiti durable file format, proveri schema/version compatibility.

---

# 108. EXPORT FORMAT

Backup/export treba imati jasno definisano:

- version
- encoding
- data scope
- integrity checks

u skladu sa complexity-jem proizvoda.

---

# 109. IMPORT VALIDATION

Tretiraj import fajl kao nepoverljiv input.

Proveri:

- JSON structure
- required fields
- ID collision
- enum values
- size
- duplicates

---

# 110. IMPORT MEMORY

Ne učitavaj ogroman file ceo u RAM bez potrebe.

Ovo je performance finding ako realna veličina opravdava.

---

# 111. BACKUP COMPLETENESS

Napraviti inventory svih durable data source-ova.

Pitaj:

> Da li backup zaista uključuje sve što tvrdi?

Možda podaci žive u:

- Room
- DataStore
- files

---

# 112. BACKUP CONSISTENCY

Ako se Room i files backup-uju odvojeno dok writes nastavljaju, snapshot može biti međusobno nekonzistentan.

---

# 113. RESTORE ORDER

Ako DB referencira files, proveri da restore redosled ne napravi references ka fajlovima koji još ne postoje.

---

# 114. CHECKSUM / INTEGRITY

Za critical backup proceni potrebu za:

- checksum
- manifest
- validation

Ne komplikuje običan mali export bez potrebe.

---

# 115. ACCOUNT SCOPING

Jedan od najvažnijih audit delova.

Za svaku user-specific tabelu pitaj:

> Kako row pripada konkretnom user-u?

---

# 116. USER ID COLUMN

Ako app podržava više account-a bez total DB wipe-a, proveri user/tenant key.

---

# 117. LOGOUT

Prati:

```text
logout
↓
Room
↓
DataStore
↓
SharedPreferences
↓
files
↓
cache
```

Koji podaci ostaju?

---

# 118. USER A -> USER B

Scenario:

```text
User A
↓
loads private records
↓
logout
↓
User B login
↓
old Room Flow emits A records
```

Ako je moguće, to može biti P0/P1.

---

# 119. DB PER ACCOUNT

Ako app koristi odvojenu bazu po korisniku, proveri:

- file naming
- close/open
- cleanup
- switching race

---

# 120. SHARED DB PER ACCOUNT

Ako je jedna baza zajednička, proveri da svaki user-specific query pravilno filtrira owner-a.

---

# 121. MISSING USER FILTER

Jedan DAO:

```sql
SELECT * FROM messages
```

u multi-account bazi može biti ozbiljan leak ako pozivalac očekuje trenutnog korisnika.

---

# 122. TENANT SCOPING

Isto za multi-tenant aplikacije.

---

# 123. LOGOUT TOKOM WRITE-A

Scenario:

```text
User A save starts
↓
logout
↓
User B login
↓
A save completes
```

Proveri da podatak ne završi u pogrešnom user scope-u.

---

# 124. DATABASE INSTANCE LIFETIME

Ako se DB zatvara/otvara pri account switch-u, proveri active Flow/coroutine reference.

---

# 125. CLOSED DB

Old repository može pokušati query nad zatvorenom DB instancom.

---

# 126. AUTO BACKUP

Proveri Android Auto Backup/data extraction rules.

Pitaj:

> Da li sensitive ili session-specific local data treba da bude backup-ovana?

---

# 127. DEVICE-TO-DEVICE RESTORE

Podatak koji se vrati na novi uređaj možda više nije validan:

- auth token
- device ID
- cached permission
- temporary server state

---

# 128. KEYSTORE + BACKUP

Encrypted podatak backup-ovan bez odgovarajućeg key material-a može postati nečitljiv na drugom uređaju.

Proveri architecture.

---

# 129. DOWNGRADE

Ako user/QA instalira stariju verziju nad novijom bazom:

šta se događa?

Ne mora biti podržano.

Ako nije:

**DOWNGRADE SUPPORT: NOT REQUIRED / NOT VERIFIED**

prema projektu.

---

# 130. CORRUPTION

Proveri handling za:

- SQLite corruption
- malformed DataStore
- malformed file

---

# 131. DESTRUCTIVE RECOVERY

Ako corruption recovery briše bazu, utvrdi da li je ona:

- cache
- unique user data

Severity zavisi od toga.

---

# 132. DATASTORE CORRUPTION HANDLER

Ako postoji, proveri šta vraća i šta se gubi.

---

# 133. PARTIAL DISK FAILURE

Disk full tokom write-a može izazvati error.

Proveri da UI ne tvrdi success pre durable write-a.

---

# 134. FALSE SUCCESS

Scenario:

```text
Save pressed
↓
UI says Saved
↓
DB write fails
```

Ako error nikada ne stigne korisniku, to je realan reliability problem.

---

# 135. DURABILITY BOUNDARY

Za svaki critical save pitaj:

> U kom trenutku sistem korisniku kaže da je podatak bezbedno sačuvan?

To mora odgovarati stvarnoj durability garanciji proizvoda.

---

# 136. ROOM CALLBACKS

Pregledaj:

- `onCreate`
- `onOpen`
- prepopulate
- destructive callbacks

Traži heavy work, duplicate initialization ili non-idempotent behavior.

---

# 137. PREPOPULATED DATABASE

Ako app shipuje DB asset:

- schema version
- migration
- copy
- first-open

moraju biti kompatibilni.

---

# 138. SEED DATA

Seed insert treba biti idempotent ako može biti pokrenut više puta.

---

# 139. TEST DATA

Proveri da debug/demo seed ne ulazi slučajno u release.

---

# 140. DATABASE ENCRYPTION

Ako postoji SQLCipher ili drugi layer, proveri:

- key lifecycle
- migration
- backup
- performance

Ne zahtevaj DB encryption bez threat modela.

---

# 141. SENSITIVE DATA

Za tokene/passworde/keys proceni da li Room uopšte treba da ih sadrži.

---

# 142. TOKEN STORAGE

Room nije automatski pogrešno mesto za svaki token, ali threat model i logout/backup moraju biti jasni.

---

# 143. SEARCH HISTORY

Lokalni history može biti private data.

Proveri logout/account separation.

---

# 144. LOGS U DB

Ako app čuva logove lokalno, proveri growth i sensitive data.

---

# 145. RETENTION

Za svaku tabelu koja raste kroz vreme pitaj:

> Šta briše stare redove?

---

# 146. UNBOUNDED TABLE

Primeri:

- history
- events
- logs
- notifications
- analytics
- sync queue

mogu rasti neograničeno.

---

# 147. CLEANUP JOB

Ako postoji cleanup, proveri:

- frequency
- transaction
- retention semantics
- failure

---

# 148. VACUUM

Ne preporučuj VACUUM rutinski bez merenja.

Može biti skup.

---

# 149. WAL

Utvrdi journal mode ako je relevantno.

Ne menjaj ga bez performance/concurrency razloga.

---

# 150. WAL CHECKPOINT

Obično Room/SQLite upravljaju time.

Prijavi samo ako custom behavior pravi problem.

---

# 151. DATABASE SIZE

Ako nije izmerena:

**DATABASE SIZE: NOT MEASURED**

Ne nagađaj.

---

# 152. STORAGE GROWTH

Proceni growth samo iz poznate retention/cardinality logike.

Ako realna veličina podataka nije poznata:

**GROWTH IMPACT: NOT VERIFIED**

---

# 153. QUERY PERFORMANCE

Za svaki performance finding razlikuj:

```text
MEASURED
CODE-LEVEL RISK
NOT MEASURED
```

---

# 154. QUERY FREQUENCY

Query od 100 ms jednom dnevno nije isto što i query od 20 ms 50 puta u sekundi.

Uvek uključi frequency.

---

# 155. DATABASE STARTUP

Ako se velika DB otvara/migrira tokom launch-a, može uticati na startup.

Poveži sa performance auditom.

---

# 156. MIGRATION PERFORMANCE

Migration correctness je prioritet, ali ogromna migration može izazvati veoma dug startup.

Ako nije mereno:

**MIGRATION DURATION: NOT MEASURED**

---

# 157. BACKGROUND MIGRATION

Room schema migration mora završiti pre upotrebe baze.

Ne predlaži jednostavno "pokreni kasnije" bez razumevanja DB lifecycle-a.

---

# 158. SCHEMA EXPORT

Ako projekat koristi:

```text
exportSchema = true
```

proveri da schema files postoje u version control-u ako workflow to očekuje.

---

# 159. SCHEMA HISTORY

Schema JSON omogućava poređenje istorijskih verzija i migration testiranje.

Ako ga nema, klasifikuj kao testability/maintenance risk, ne automatski runtime bug.

---

# 160. AUTO MIGRATION

Ako se koriste Room auto migrations:

proveri da promena zaista može bezbedno biti izvedena automatski.

---

# 161. AUTO MIGRATION SPEC

Za rename/delete scenarije proveri potrebni spec.

---

# 162. AUTO MIGRATION NE ZNA BUSINESS SEMANTIKU

Automatska schema migracija može biti sintaktički validna, ali ne mora rešiti transformaciju značenja podataka.

---

# 163. MIGRATION TESTING

Traži Room migration tests.

Za svaki proveri:

- start schema
- migration
- final validation
- actual data assertions

---

# 164. `validateMigration`

Schema validation nije dovoljna ako sadržaj mora biti transformisan.

---

# 165. DATA ASSERTION

Primer:

```text
old status = 2
↓
migration
↓
new status expected = "ARCHIVED"
```

Test treba proveriti podatak, ne samo da DB otvara.

---

# 166. ALL START VERSIONS

Za current v8 proveri barem relevantne supported upgrade paths, ne samo 7 -> 8.

---

# 167. MIGRATION TEST MATRIX

Napravi:

| From | To | Schema tested | Data tested | Result |
|---|---|---|---|---|

---

# 168. DAO TESTS

Za important queries testiraj realnu Room bazu.

Mock DAO ne dokazuje SQL correctness.

---

# 169. QUERY EDGE CASES

Testiraj:

- empty DB
- one row
- duplicates
- null
- deleted parent
- same timestamps
- huge values

prema domain-u.

---

# 170. TRANSACTION TEST

Namerno izazovi failure u sredini multi-step write-a.

Proveri rollback.

---

# 171. UNIQUE CONSTRAINT TEST

Simuliraj concurrent/duplicate insert.

---

# 172. ACCOUNT ISOLATION TEST

Ako app ima account:

```text
insert A data
↓
logout/switch
↓
query B
↓
assert no A data
```

---

# 173. BACKUP TEST

Backup ne treba testirati samo time što je file kreiran.

Proveri restore u čistu app state.

---

# 174. RESTORE TEST

Najbolji scenario:

```text
seed complex state
↓
backup
↓
clear/reset app
↓
restore
↓
compare semantic state
```

---

# 175. ROUNDTRIP

Backup/restore treba imati roundtrip proveru za critical fields.

---

# 176. IMPORT INVALID DATA

Testiraj:

- malformed JSON
- unsupported version
- duplicate IDs
- missing required fields

---

# 177. CRASH TOKOM RESTORE-A

Ako je flow critical, simuliraj partial failure.

---

# 178. PROCESS DEATH TOKOM WRITE-A

SQLite transaction daje određene atomicity garancije, ali višeslojna operacija može ostati partial.

Prati ceo business flow.

---

# 179. APP UPDATE + PENDING STATE

Pre upgrade-a seeduj:

- pending sync
- drafts
- archived data
- relations

Zatim migration test treba potvrditi očuvanje njihovog značenja.

---

# 180. MULTI-STEP VERSION HISTORY

Dugovečni proizvod mora testirati realan history, ne samo najnoviji schema diff.

---

# 181. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Data type:
Table/File/Store:
Entity:
DAO:
Migration:
File:
Relevant code/schema:

Source of truth:
User-scoped:
Durability requirement:

Problem:

Evidence:

Data Lifecycle:

Reproduction:

Expected data state:

Actual/Possible data state:

Data loss impact:

Cross-user impact:

Migration impact:

Root cause:

Recommended remediation:

Regression test:

Verification:

Complexity:
XS / S / M / L / XL
```

Ako polje nije relevantno:

**NOT APPLICABLE**

---

# 182. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-user private data exposure
- catastrophic irreversible local data corruption
- critical backup/restore flaw koji uništava jedinu kopiju podataka

## P1 - HIGH

- user-generated data loss
- broken migration za postojeću production populaciju
- ozbiljan cross-account data leak
- database corruption kroz normalan flow
- critical multi-step write nije atomic

## P2 - MEDIUM

- značajan data inconsistency problem
- query vraća pogrešne rezultate u realnom edge case-u
- migration problem sa ograničenim scope-om
- stale/local data problem sa workaround-om

## P3 - LOW

- ograničen persistence edge case
- manji cleanup/retention problem

## P4 - IMPROVEMENT

- performance/testability/schema improvement bez trenutnog correctness buga

---

# 183. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

SQL/schema/test direktno dokazuju problem.

MEDIUM:

implementation snažno ukazuje na problem, ali historical/production data nije dostupna.

LOW:

zavisi od nepoznate realne veličine, legacy state-a ili runtime uslova.

---

# 184. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 185. MIGRATION STATUS

Za migration finding dodatno označi:

```text
SCHEMA FAILURE
DATA SEMANTICS FAILURE
UPGRADE PATH GAP
DESTRUCTIVE RISK
PERFORMANCE RISK
```

---

# 186. DATA CLASSIFICATION

Za affected data označi:

```text
CACHE
REBUILDABLE
USER-GENERATED
SERVER-RECOVERABLE
LOCAL-ONLY
SECURITY-SENSITIVE
NOT VERIFIED
```

Severity mora uzeti ovo u obzir.

---

# 187. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 nalaza proveri:

1. entity
2. DAO
3. repository
4. transaction boundary
5. migration
6. schema JSON
7. DB constraints
8. sync layer
9. logout/reset
10. tests

Ne zaključuj iz jedne DAO metode bez call-site analize.

---

# 188. NE DODAJ INDEX NASLEPO

Pre index preporuke pokaži:

```text
critical query
↓
filter/join/order
↓
missing useful index
↓
expected benefit
```

Ako query plan nije izmeren:

**PERFORMANCE BENEFIT: NOT MEASURED**

---

# 189. NE DODAJ TRANSAKCIJU SVUDA

Transaction ima smisla kada operacija ima atomicity/consistent snapshot requirement.

Nije generički wrapper za svaku DAO funkciju.

---

# 190. NE BRIŠI BAZU KAO FIX

Destructive reset može sakriti migration bug dok korisnik izgubi podatke.

Ne prihvataj:

> ako pukne, obriši DB

kao normalan production recovery za unique local user data.

---

# 191. NE MIGRIRAJ SHAREDPREFERENCES SAMO ZBOG MODERNOSTI

Ako postojeća implementacija radi i nema correctness/performance problem, to je eventualno P4.

---

# 192. NE MENJAJ KOD

Tokom audita:

- ne menjaj entity
- ne dodaj index
- ne povećavaj DB version
- ne piši migration
- ne briši bazu
- ne menjaj backup format

Prvo završi audit.

---

# 193. OUTPUT - ANDROID_PERSISTENCE_ROOM_AUDIT.md

Finalni rezultat strukturiraj:

## 1. Executive Summary

- persistence architecture
- Room/database version
- source-of-truth model
- migration readiness
- data integrity stanje
- najveći rizici

## 2. Persistence Inventory

| Data | Storage | Authority | User-scoped | Durable | Risk |
|---|---|---|---|---|---|

## 3. Database Architecture

## 4. Schema Audit

## 5. Entity Audit

## 6. Primary / Unique Key Audit

## 7. Foreign Key / Relation Audit

## 8. DAO Correctness Audit

## 9. Query Audit

## 10. Index Audit

## 11. Transaction Audit

## 12. Concurrency / Atomicity Audit

## 13. Migration Audit

## 14. Migration Test Coverage

## 15. TypeConverter Audit

## 16. DataStore / SharedPreferences Audit

## 17. File Persistence Audit

## 18. Backup / Export Audit

## 19. Restore / Import Audit

## 20. Account Isolation Audit

## 21. Logout / Reset Audit

## 22. Offline / Sync Persistence

## 23. Retention / Cleanup Audit

## 24. Corruption / Recovery Audit

## 25. Persistence Performance Risks

## 26. Test Coverage

## 27. Findings Summary

| ID | Severity | Data | Storage | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 28. P0 Findings

## 29. P1 Findings

## 30. P2 Findings

## 31. P3 Findings

## 32. P4 Improvements

## 33. Things Done Well

## 34. Unknown / Not Verified

## 35. Remediation Roadmap

---

# 194. DATABASE SCHEMA MATRIX

Napravi:

| Table | PK | Unique | FK | Indexes | User scope | Growth |
|---|---|---|---|---|---|---|

---

# 195. MIGRATION MATRIX

| From | To | Migration exists | Schema tested | Data tested | Risk |
|---|---|---|---|---|---|

---

# 196. TRANSACTION MATRIX

| Business operation | Tables | Atomic required | Atomic actual | Risk |
|---|---|---|---|---|

---

# 197. ACCOUNT ISOLATION MATRIX

| Data | User key | Query filtered | Cleared on logout | Cross-user risk |
|---|---|---|---|---|

---

# 198. RETENTION MATRIX

| Data | Growth source | Retention policy | Cleanup | Unbounded |
|---|---|---|---|---|

---

# 199. BACKUP MATRIX

| Data source | Included | Restored | Versioned | Sensitive | Verified |
|---|---|---|---|---|---|

---

# 200. SECOND PASS - OLD USER UPGRADE

Nakon prvog audita simuliraj korisnika sa jednom od najstarijih još podržanih DB verzija.

Dodaj:

- realne podatke
- null vrednosti
- relations
- pending sync
- archived rows

Zatim mentalno ili testom prođi sve migracije do trenutne verzije.

Pitaj:

> Da li semantički dobija isti podatak, samo u novom schema modelu?

---

# 201. SECOND PASS - PROCESS DEATH TOKOM WRITE-A

Za svaki critical save:

```text
operation starts
↓
first persistent side effect
↓
process dies
```

Pitaj:

- šta ostaje
- može li sledeći start prepoznati partial state
- može li se bezbedno oporaviti

---

# 202. SECOND PASS - ACCOUNT SWITCH

Simuliraj:

```text
User A
↓
populate Room
↓
background sync starts
↓
logout
↓
User B
↓
A sync completes
```

Proveri sve persistence slojeve.

---

# 203. SECOND PASS - DUPLICATE WRITE

Za svaki create/import/sync flow:

```text
operation A
operation B
```

pokreni praktično istovremeno.

Pitaj:

- unique constraint
- transaction
- upsert
- duplicate rows

---

# 204. SECOND PASS - DELETE RACE

Scenario:

```text
resource loaded
↓
background operation starts
↓
user deletes resource
↓
background operation completes
```

Da li resource može biti ponovo kreiran ili orphan state ostati?

---

# 205. SECOND PASS - DISK FULL

Pretpostavi write failure zbog storage problema.

Pitaj:

- da li transakcija rollback-uje
- da li UI prikazuje success prerano
- da li fajl ostaje partial

---

# 206. SECOND PASS - CORRUPTED LOCAL DATA

Simuliraj:

- invalid JSON
- missing file
- malformed DataStore
- DB corruption

Pitaj:

> Da li app ima kontrolisani recovery ili ulazi u crash loop?

---

# 207. SECOND PASS - BACKUP ROUNDTRIP

Mentalno ili runtime:

```text
complex user state
↓
backup
↓
delete/reset app state
↓
restore
```

Poredi:

- entities
- relations
- files
- preferences
- pending state

---

# 208. SECOND PASS - LARGE DATABASE

Povećaj očekivani broj redova 10x.

Proveri samo critical query-je za:

- scan
- sort
- joins
- memory

Severity prilagodi realnom growth modelu.

---

# 209. SECOND PASS - RETENTION

Pretpostavi višegodišnje korišćenje.

Pitaj:

> Koja tabela ili file directory nastavlja da raste bez granice?

---

# 210. SECOND PASS - LEGACY VALUE

Za svaki persisted enum/status/type converter pitaj:

> Šta se događa kada se naziv ili struktura promeni za dve verzije?

---

# 211. SECOND PASS - MIGRATION FAILURE

Pitaj:

> Šta aplikacija radi kada migration baci exception na production uređaju?

Proveri:

- crash loop
- destructive fallback
- error recovery
- user data preservation

---

# 212. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- current schema nije jedino što je analizirano
- svi relevantni upgrade path-ovi su provereni
- migration test nije automatski proglašen data-correctness dokazom
- destructive migration ima klasifikovan data impact
- svaki critical business invariant proverava DB-level zaštitu
- foreign key behavior je analiziran
- `REPLACE`/`IGNORE` semantika nije zanemarena
- transaction nalazi imaju konkretan partial-state scenario
- account isolation je proverena kroz DAO i logout flow
- Room cache nije pomešan sa durable local-only data
- backup pokriva sve persistence izvore koje tvrdi da čuva
- restore failure behavior je analiziran
- file cache nije tretiran kao durable storage
- DataStore i SharedPreferences nisu ocenjeni samo prema modernosti API-ja
- query performance nalazi imaju dataset/frequency kontekst
- index preporuke imaju konkretan query
- unbounded growth je proveren
- bugovi i P4 improvements su jasno odvojeni

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte indekse, koristite transakcije i testirajte migracije.

To nije persistence audit.

Tražim probleme poput:

```text
DB v2
↓
user upgrades directly to app with DB v6
↓
migrations exist only 4->5 and 5->6
↓
Room cannot construct 2->6 path
↓
existing production user cannot open database
```

ili:

```text
create order
↓
insert order row
↓
insert items one by one
↓
item 4 fails
↓
no transaction
↓
database contains incomplete order
```

ili:

```text
User A logs out
↓
auth token cleared
↓
Room rows remain
↓
User B logs in
↓
DAO query has no userId predicate
↓
A data emitted to B
```

ili:

```text
enum status stored as ordinal
↓
new release inserts enum constant in middle
↓
old integer values now map to different meanings
↓
existing records silently change semantic state
```

ili:

```text
backup starts
↓
Room exported
↓
user edits attachment
↓
files copied later
↓
backup contains database metadata from one state
and files from another
↓
restore is internally inconsistent
```

ili:

```text
cacheDir stores only copy of user-generated document
↓
Android clears cache under storage pressure
↓
document disappears permanently
```

ili:

```text
if (!dao.exists(remoteId))
    dao.insert(entity)
```

sa dve concurrent sync operacije:

```text
A sees false
B sees false
A inserts
B inserts
↓
duplicate rows
```

ako database nema unique constraint.

To su persistence problemi koje treba da pronađeš.

Razmišljaj kroz:

- schema history
- data semantics
- upgrade paths
- atomicity
- database constraints
- account ownership
- durability
- recovery
- backup/restore
- concurrency
- long-term storage growth

Za svaki ozbiljan finding odgovori:

> Koji podatak je ugrožen?

> Da li je rebuildable ili jedina kopija?

> Koji tačan DB/file flow dovodi do greške?

> Može li postojeći production korisnik već imati state potreban da problem nastane?

> Da li fix zahteva schema migration?

> Kako regression test dokazuje da podaci ostaju semantički isti?

Ako nema dovoljno dokaza:

**NOT VERIFIED.**

Ako je samo performance/schema improvement:

**P4 - IMPROVEMENT.**

Ako migration prolazi ali nije potvrđen sadržaj podataka:

**DATA SEMANTICS NOT VERIFIED.**

Bolje je pronaći 5 stvarnih data-integrity problema nego napisati 100 generičkih Room saveta.

Cilj je dobiti forenzički precizan persistence audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- migration
- database constraint
- transaction fix
- recovery mechanism
- regression test
- backup/restore test
- production data-preservation plan
