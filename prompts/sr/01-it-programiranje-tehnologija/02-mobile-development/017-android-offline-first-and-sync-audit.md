---
id: UPL-IT-017
number: 17
slug: android-offline-first-and-sync-audit
title: Audit offline-first rada i sinhronizacije u Android aplikacijama
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# AUDIT OFFLINE-FIRST RADA I SINHRONIZACIJE U ANDROID APLIKACIJAMA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog offline-first i synchronization sistema Android aplikacije.

Glavni cilj:

> Utvrditi da li aplikacija može pouzdano da radi kroz promene mreže, offline periode, process death, app restart, više uređaja, retries, conflict-e, stare podatke i partial failure bez gubitka podataka, duplikata, silent overwrite-a ili lažnog prikaza da je nešto uspešno sinhronizovano.

Ovo nije:

- generički savet "koristi Room kao source of truth"
- običan networking audit
- provera da li postoji WorkManager
- površna provera `isOnline`
- automatsko dodavanje retry-ja
- preporuka da se sve queue-uje offline
- pretpostavka da je "last write wins" uvek dobar model
- preporuka da se svuda koristi timestamp
- pokušaj da se svaka aplikacija pretvori u offline-first proizvod

Fokus je na stvarnom sistemu:

```text
user action
↓
local state
↓
pending operation
↓
network availability
↓
sync
↓
server
↓
response
↓
conflict resolution
↓
local reconciliation
↓
UI
```

Prioritet:

**data integrity > operation durability > idempotency > conflict correctness > account isolation > retry safety > eventual consistency > freshness > performance**

Bolje je pronaći 5 stvarnih sync problema koji mogu korumpirati korisničke podatke nego napisati 100 generičkih offline-first preporuka.

---

# 1. UTVRDI STVARNI OFFLINE MODEL

Pre bilo kakvog finding-a utvrdi šta aplikacija zaista pokušava da podrži.

Klasifikuj model:

```text
ONLINE-ONLY
ONLINE-FIRST
CACHE-ASSISTED
PARTIAL OFFLINE
OFFLINE-FIRST
LOCAL-FIRST
NOT CLEAR
```

Ne zahtevaj offline write podršku ako proizvod nikada nije obećava.

---

# 2. UTVRDI TEHNOLOŠKI STACK

Pregledaj:

- Room
- DataStore
- files
- repository layer
- Retrofit/Ktor/OkHttp
- WorkManager
- ConnectivityManager
- Flow
- StateFlow
- retry logic
- sync workers
- push/WebSocket/SSE ako postoje
- server API contracts
- entity versioning
- timestamps
- operation IDs
- remote/local IDs

---

# 3. MAPIRAJ SOURCE OF TRUTH

Za svaki critical data type odredi:

```text
Server authority
Local authority
Room as source of truth
Hybrid authority
Derived/cache-only
```

Za svaki feature odgovori:

> Odakle UI čita podatke?

Ako odgovor zavisi od više izvora, mapiraj prioritet.

---

# 4. UI SOURCE OF TRUTH

Poželjno je jasno razumeti flow.

Primer:

```text
API
↓
Room
↓
Flow
↓
UI
```

ili:

```text
Local edit
↓
Room
↓
UI immediately updates
↓
Sync later
```

Traži situacije gde UI ponekad čita API direktno, a ponekad Room, pa prikazuje različita stanja.

---

# 5. DATA INVENTORY

Za svaki sinhronizovani data type napravi:

| Data | Local storage | Remote storage | Authority | Offline read | Offline write |
|---|---|---|---|---|---|

---

# 6. SYNC DIRECTION

Klasifikuj:

```text
PULL ONLY
PUSH ONLY
BIDIRECTIONAL
LOCAL ONLY
REMOTE ONLY
```

Ne analiziraj conflict-e za read-only dataset bez potrebe.

---

# 7. SYNC TRIGGERS

Mapiraj sve trigger-e:

- app startup
- foreground
- pull-to-refresh
- scheduled WorkManager
- connectivity restore
- user save
- push notification
- manual retry
- background refresh

Pitaj:

> Mogu li dva ili više trigger-a istovremeno pokrenuti isti sync?

---

# 8. DUPLICATE SYNC

Scenario:

```text
app foregrounds
↓
manual refresh starts
↓
WorkManager also starts
↓
network restore callback starts another sync
```

Proveri:

- deduplication
- locking
- unique work
- server idempotency

---

# 9. SINGLE-FLIGHT SYNC

Ako samo jedan sync sme raditi:

utvrdi da li postoji stvarna single-flight zaštita.

Ne pretpostavljaj da `isSyncing` boolean rešava problem kroz process restart ili više repository instanci.

---

# 10. SYNC STATE MACHINE

Ako sistem ima više faza, modeluj ih.

Primer:

```text
IDLE
↓
PULLING
↓
MERGING
↓
PUSHING
↓
COMPLETED
```

Sa failure granama:

```text
FAILED_TRANSIENT
FAILED_PERMANENT
AUTH_REQUIRED
CONFLICT
```

Traži invalid transitions.

---

# 11. LOCAL READ OFFLINE

Za svaki critical screen proveri:

```text
network unavailable
↓
app opens
↓
Room/local data available
```

Šta UI prikazuje?

---

# 12. COLD START OFFLINE

Scenario:

```text
process killed
↓
network off
↓
app launches
```

Ne testiraj samo prelazak online -> offline dok app već radi.

---

# 13. FIRST-EVER LAUNCH OFFLINE

Ako user nikada nije imao podatke lokalno:

šta se prikazuje?

Razlikuj:

```text
EMPTY
```

od:

```text
FAILED TO LOAD
```

---

# 14. EMPTY VS OFFLINE

Ako nema lokalnih podataka i nema mreže, UI ne treba pogrešno da tvrdi:

> Nema rezultata.

Možda jednostavno ne može da ih učita.

---

# 15. STALE DATA

Offline-first često prikazuje stare podatke.

Pitaj:

> Da li korisnik zna kada je freshness bitan?

---

# 16. LAST SYNC TIME

Ako se prikazuje:

```text
Last synced 10 min ago
```

proveri:

- ko postavlja timestamp
- kada
- timezone
- client clock
- failed sync

Ne ažuriraj ga samo zato što je sync počeo.

---

# 17. FALSE FRESHNESS

Scenario:

```text
sync starts
↓
server request partly succeeds
↓
later phase fails
↓
lastSynced updated anyway
```

UI može tvrditi da su podaci sveži iako nisu.

---

# 18. TIME-SENSITIVE DATA

Posebno klasifikuj:

- prices
- inventory
- permissions
- subscription
- status
- financial values
- availability

Stale prikaz ovde može imati veći impact.

---

# 19. LOCAL WRITES

Za svaki offline-capable mutation mapiraj:

```text
User action
↓
Local DB write
↓
Pending marker
↓
Queue
↓
Sync
↓
Remote confirmation
↓
Pending cleared
```

---

# 20. DURABLE QUEUE

Ako aplikacija obećava eventualnu sinhronizaciju, queue mora preživeti:

- process death
- app restart
- reboot

In-memory lista nije dovoljna.

---

# 21. PENDING OPERATION MODEL

Za svaki queued operation utvrdi:

- operation ID
- type
- entity ID
- payload
- createdAt
- attempts
- state
- dependency
- user/account owner

---

# 22. QUEUE STATES

Mogući model:

```text
PENDING
IN_FLIGHT
SUCCEEDED
FAILED_RETRYABLE
FAILED_PERMANENT
CANCELLED
```

Ne zahtevaj ove nazive, ali proveri da implementation razlikuje bitno različita stanja.

---

# 23. IN_FLIGHT POSLE PROCESS DEATH

Scenario:

```text
operation marked IN_FLIGHT
↓
request sent
↓
process dies
```

Nakon restart-a:

> Da li operation ostaje zauvek zaglavljena kao IN_FLIGHT?

---

# 24. LEASE / RECOVERY

Ako koristi processing state, proveri kako sistem ponovo preuzima abandoned operation.

---

# 25. UNKNOWN REMOTE OUTCOME

Najvažniji distributed-systems scenario:

```text
client sends create
↓
server commits
↓
response is lost
↓
client sees timeout
```

Client ne zna da li je mutation izvršena.

---

# 26. RETRY POSLE UNKNOWN OUTCOME-A

Ako client samo ponovi create:

mogu nastati duplikati.

Proveri idempotency.

---

# 27. IDEMPOTENCY KEY

Za critical create/mutation proveri postoji li stabilan operation identifier koji server može prepoznati pri retry-ju.

---

# 28. CLIENT-GENERATED ID

Jedan model:

```text
UUID generated locally
↓
same ID reused on retry
```

može pomoći deduplication-u ako server contract to podržava.

Ne uvodi bez potrebe.

---

# 29. EXACTLY-ONCE ILUZIJA

Nemoj tvrditi da mrežna operacija ima exactly-once delivery samo zato što queue postoji.

U distribuiranom sistemu obično se rešava:

```text
at-least-once delivery
+
idempotent processing
```

ili drugim eksplicitnim modelom.

---

# 30. CREATE DUPLICATION

Scenario:

```text
offline create
↓
sync request
↓
server creates entity
↓
response lost
↓
retry
↓
second entity created
```

Traži zaštitu.

---

# 31. UPDATE IDEMPOTENCY

Set-based update:

```text
set name = X
```

je često prirodno idempotentniji od:

```text
increment value
```

Ali server semantics mora biti analizirana.

---

# 32. DELETE IDEMPOTENCY

Ponovljen delete treba imati definisano ponašanje.

Ako server vraća 404 nakon prvog uspešnog delete-a, client možda i dalje treba da tretira finalno stanje kao uspešno, zavisno od domain-a.

---

# 33. QUEUE ORDERING

Da li redosled operacija mora biti sačuvan?

Primer:

```text
create A
↓
update A
↓
delete A
```

Ako se šalju paralelno ili obrnutim redom, može nastati problem.

---

# 34. DEPENDENT OPERATIONS

Update lokalno kreiranog entity-ja može zavisiti od create sync-a ako server generiše svoj ID.

Mapiraj dependency.

---

# 35. LOCAL ID / REMOTE ID

Proveri mapping između:

```text
localId
remoteId
```

Posebno:

- offline create
- later update
- relationships

---

# 36. REMOTE ID ASSIGNMENT

Scenario:

```text
local entity ID = -1
↓
server creates ID = 572
```

Kako se:

- row
- relations
- pending operations
- UI references

prebacuju na novi ID?

---

# 37. ID REMAPPING RACE

Ako user napravi child record pre nego što parent dobije remote ID:

proveri kako dependency chain radi.

---

# 38. CLIENT UUID KAO STABILNI IDENTITET

Ako server podržava client-generated stable ID, može pojednostaviti offline-first.

Ali audit treba oceniti postojeći sistem, ne redizajnirati bez razloga.

---

# 39. QUEUE COMPACTION

Scenario:

```text
offline
↓
edit name A
↓
edit name B
↓
edit name C
```

Da li treba poslati 3 update-a ili samo finalno stanje?

Zavisi od business semantics.

Ako su operacije event-log, compaction može biti pogrešan.

---

# 40. DELETE COMPACTION

Ako entity offline dobije:

```text
create
update
delete
```

pre bilo kog sync-a, možda nijedna remote operacija nije potrebna.

Ali samo ako server nikada nije video entity.

---

# 41. OPERATION VS STATE SYNC

Utvrdi da li sistem sinhronizuje:

**operations**

ili:

**current state**

Ovo je fundamentalna razlika.

---

# 42. OPERATION-BASED SYNC

Primer:

```text
ADD_ITEM
RENAME_ITEM
DELETE_ITEM
```

Ordering i duplicate delivery su kritični.

---

# 43. STATE-BASED SYNC

Primer:

```text
local entity current state
↓
PUT/upsert server
```

Conflict semantics postaju centralnije.

---

# 44. SERVER AUTHORITY

Ako server predstavlja authority, local unsynced edit može biti prepisan remote refresh-om ako merge logic nije pažljiva.

---

# 45. LOCAL DIRTY FLAG

Ako row ima unsynced local changes:

remote pull ne bi trebalo naslepo da ga prepiše.

---

# 46. SYNC VS LOCAL EDIT RACE

Scenario:

```text
sync starts and downloads server v10
↓
user locally edits entity to v11
↓
sync response v10 written afterward
↓
local edit disappears
```

Ovo je critical sync race.

---

# 47. SNAPSHOT TIMING

Pitaj:

> Kada je remote response zapravo bio validan u odnosu na lokalnu promenu?

Request start i response arrival nisu isto.

---

# 48. SERVER VERSION

Ako server daje monotonic:

- revision
- version
- ETag

proveri da li client koristi signal za conflict detection.

---

# 49. `updatedAt`

Timestamp može pomoći, ali nije automatski bezbedan conflict model.

Problemi:

- clock skew
- same timestamp
- client-generated time

---

# 50. SERVER-GENERATED TIME

Ako timestamps odlučuju ordering, server authority je obično pouzdaniji od device clock-a.

Ali proveri stvarni API.

---

# 51. CLOCK SKEW

Scenario:

```text
device clock +2h
```

Ako local `updatedAt` odlučuje "newest wins", client može pregaziti noviji remote state.

---

# 52. LAST WRITE WINS

Ako se koristi LWW, eksplicitno dokumentuj:

- šta predstavlja "last"
- čiji clock
- da li korisnik može izgubiti izmene
- da li je to prihvatljivo za domain

---

# 53. FIELD-LEVEL MERGE

Ako različiti uređaji menjaju različita polja:

```text
Device A changes title
Device B changes color
```

whole-object LWW može izgubiti jednu izmenu.

Proceni da li domain zahteva field-level merge.

---

# 54. MANUAL CONFLICT

Za high-value podatke možda je potrebna user-assisted conflict resolution.

Ne preporučuj za trivijalne preference.

---

# 55. CRDT / COMPLEX MERGE

Nemoj uvoditi CRDT samo zato što app ima offline mode.

To je opravdano samo za određene collaborative modele.

---

# 56. DELETE CONFLICT

Scenario:

```text
Device A deletes item offline
Device B edits item online
```

Šta se događa kada A reconnect-uje?

---

# 57. TOMBSTONE

Ako delete mora da se propagira kroz sync, lokalna tombstone informacija mora trajati dovoljno dugo.

---

# 58. HARD DELETE PRE RANO

Ako row odmah nestane iz baze, sync engine možda više ne zna šta treba da obriše remote.

---

# 59. TOMBSTONE RETENTION

Ne briši tombstone dok ne postoji dovoljan dokaz da je delete propagiran tamo gde treba.

---

# 60. REMOTE DELETE

Ako server kaže da entity više ne postoji, proveri:

- lokalni dirty edit
- local child records
- open detail screen

---

# 61. RESURRECTION BUG

Scenario:

```text
server entity deleted
↓
client offline still has old entity
↓
client edits it
↓
reconnect
↓
generic upsert recreates entity
```

Da li je to željena semantika?

---

# 62. SYNC WINDOW

Ako server API vraća samo changes since token/time:

proveri token semantics.

---

# 63. DELTA SYNC

Mapiraj:

```text
sync token
↓
request changes
↓
apply transaction
↓
persist new token
```

---

# 64. TOKEN ATOMICITY

Critical:

```text
apply half changes
↓
save new sync token
↓
crash
```

Sledeći sync može preskočiti neprimenjene promene.

Token i data apply možda moraju biti atomic.

---

# 65. TOKEN PRE DATA

Još gori scenario:

```text
persist new token
↓
then write data
↓
write fails
```

Promene mogu biti zauvek preskočene.

---

# 66. PAGINATED SYNC

Ako delta/full sync ima više pages:

```text
page 1
page 2
page 3
```

proveri:

- partial progress
- token
- crash recovery
- duplicates

---

# 67. CURSOR EXPIRY

Ako server pagination cursor može isteći, proveri recovery.

---

# 68. FULL RESYNC

Da li postoji način da se lokalni cache rekonstruše iz authoritative server state-a?

Posebno korisno kada incremental state postane sumnjiv.

---

# 69. FULL RESYNC + LOCAL DIRTY DATA

Full refresh ne sme obrisati unsynced lokalne promene.

---

# 70. REPLACE STRATEGY

Scenario:

```text
DELETE ALL LOCAL
↓
INSERT SERVER SNAPSHOT
```

Ako postoje pending local mutations, ovo može izazvati data loss.

---

# 71. STAGING TABLE / MERGE

Za kompleksan sync, server snapshot može prvo ići u staging/temporary model pa merge.

Ne preporučuj bez realnog need-a.

---

# 72. TRANSACTION BOUNDARY

Batch remote changes koje predstavljaju jednu snapshot verziju možda treba primeniti atomically da UI ne vidi partial inconsistent state.

---

# 73. SYNC FAILURE NA POLA

Pitaj:

> Ako sync padne posle 60% remote promena, šta UI vidi?

---

# 74. PARTIAL SUCCESS

Razlikuj:

```text
10 operations
↓
7 success
3 fail
```

od total failure-a.

---

# 75. BATCH API

Ako server vraća per-item rezultate, client mora pravilno mapirati success/failure za svaku operation.

---

# 76. ALL-OR-NOTHING BATCH

Ako API batch radi atomically, client retry semantics su drugačije.

Utvrdi contract.

---

# 77. RETRY CLASSIFICATION

Greške klasifikuj najmanje semantički:

```text
TRANSIENT
PERMANENT
AUTH
CONFLICT
VALIDATION
NOT FOUND
RATE LIMITED
UNKNOWN
```

Ne retry-uj sve isto.

---

# 78. HTTP 400

Validation/request error obično se neće sam popraviti retry-jem.

Ako queue retry-uje zauvek, može ostati zaglavljena.

---

# 79. HTTP 401

Auth failure zahteva:

- refresh token
- re-auth
- pending operation preservation

Nemoj odmah obrisati pending edits.

---

# 80. HTTP 403

Može značiti da user više nema pravo na mutation.

Queue mora imati permanent-failure path.

---

# 81. HTTP 404

Značenje zavisi od mutation-a:

- update missing entity
- delete already deleted

Ne tretiraj univerzalno.

---

# 82. HTTP 409

Conflict treba rešiti drugačije od transient network failure-a.

---

# 83. HTTP 429

Proveri:

- Retry-After
- backoff
- coordinated retry

Ne pravi request storm.

---

# 84. HTTP 5XX

Obično transient kandidat, ali retry policy mora biti bounded.

---

# 85. TIMEOUT

Timeout ostavlja nepoznat outcome kod write-a.

Ne tretiraj ga isto kao "request nikada nije poslat".

---

# 86. DNS / CONNECTION FAILURE

Ako request nije stigao serveru, retry je jednostavniji.

Ali client često nema savršeno znanje o tačnoj tački failure-a.

---

# 87. BACKOFF

Proveri:

- exponential ili drugi model
- max delay
- max attempts
- server hint

Ne zahtevaj jednu formulu svuda.

---

# 88. RETRY STORM

Ako 10.000 uređaja reconnectuje nakon outage-a i svi retry-uju odmah:

server može dobiti stampede.

Jitter može biti relevantan.

Prijavi samo ako architecture/client policy zaista stvara ovakav rizik.

---

# 89. WORKMANAGER

Mapiraj sync worker-e.

Za svaki:

- unique work name
- constraints
- retry
- backoff
- tags
- cancellation
- expedited status ako postoji

---

# 90. NETWORK CONSTRAINT

WorkManager network constraint smanjuje besmislene pokušaje bez mreže, ali `CONNECTED` ne znači da server radi.

---

# 91. UNIQUE WORK

Proveri da unique work sprečava samo WorkManager duplicate scheduling, ne:

- manual sync
- foreground repository sync

---

# 92. PERIODIC SYNC

Ne očekuj precizno vreme izvršenja.

---

# 93. ONE-TIME SYNC

Ako se enqueue-uje posle svake mutation, proveri da 100 lokalnih promena ne napravi 100 redundantnih workers.

---

# 94. WORK CHAIN

Ako push mora ići posle pull/merge faze, proveri chaining/dependency.

---

# 95. WORKER PROCESS DEATH

Worker može biti prekinut i ponovljen.

Pitaj:

> Da li je bezbedno ponovno izvršiti istu fazu?

---

# 96. `Result.retry()`

Ne koristi za permanent server validation problem.

---

# 97. WORKER INPUTDATA

WorkManager Data nije baza za velike payload-e.

Ako queue payload treba biti durable, proveri Room/file storage.

---

# 98. FOREGROUND SYNC

Ako user ručno klikne Refresh, ne mora nužno čekati periodic worker.

Ali proveri koordinaciju.

---

# 99. SYNC PROGRESS

Ako sync traje dugo, UI možda prikazuje progress.

Proveri da progress odgovara stvarnom radu.

---

# 100. FALSE SUCCESS UI

Najvažnije:

```text
user saves offline
↓
UI shows "Saved"
```

Da li "Saved" znači:

- saved locally
- queued
- synced server-side

Ne sme biti semantički obmanjujuće.

---

# 101. LOCAL SAVED VS SYNCED

Razdvoj status ako business context zahteva:

```text
Saved on device
Waiting to sync
Synced
Sync failed
```

Ne mora se svaki status prikazivati krajnjem korisniku, ali interni model treba da zna razliku.

---

# 102. PENDING UI

Ako entity čeka sync, proveri da korisnik može razumeti kritičan pending state gde je važan.

---

# 103. FAILED OPERATION UI

Permanent failure ne sme zauvek ostati nevidljiv.

Primer:

```text
message queued
↓
server permanently rejects
↓
UI still shows sent
```

---

# 104. RETRY UI

Manual retry treba da radi nad istom logical operation gde idempotency to zahteva, a ne da generiše potpuno novu duplicate mutation bez razloga.

---

# 105. CANCEL PENDING OPERATION

Ako user može odustati pre sync-a:

proveri:

- local state rollback
- queue removal
- dependent operations

---

# 106. CANCEL TOKOM IN_FLIGHT

Ako request već može biti na serveru, lokalni cancel možda ne može garantovati remote cancellation.

UI i model moraju imati jasnu semantiku.

---

# 107. CONNECTIVITY DETECTION

Ne tretiraj:

```text
network available
```

kao:

```text
API reachable
```

---

# 108. `isOnline`

Ako postoji globalni boolean, proveri kako se računa.

Može biti samo UX signal, ne authority za to da li request treba pokušati.

---

# 109. CAPABILITIES

ConnectivityManager može pokazati network transport, ali internet validation i konkretan server availability su druga pitanja.

---

# 110. OFFLINE DETECTION RACE

Network može nestati između check-a i request-a.

Pattern:

```text
if (online) request()
```

ne uklanja potrebu za normalnim request error handling-om.

---

# 111. RECONNECT

Kad se mreža vrati, proveri koji sistemi se bude:

- foreground listener
- WorkManager
- socket reconnect
- manual refresh

Traži duplicate sync.

---

# 112. FLAPPING NETWORK

Simuliraj:

```text
online
offline
online
offline
online
```

u kratkom periodu.

Queue ne sme eksplodirati od duplicate jobs/request-a.

---

# 113. SLOW NETWORK

Offline nije jedini problem.

Scenario:

```text
network technically available
↓
requests take 30 sec
```

Proveri:

- user edits meanwhile
- retry
- stale response
- timeout

---

# 114. MULTI-DEVICE

Ako isti account radi na više uređaja, local-only concurrency guard nije dovoljan.

---

# 115. DEVICE A / DEVICE B

Simuliraj:

```text
A offline
B online
A edits
B edits
A reconnects
```

Dokumentuj conflict policy.

---

# 116. DEVICE ID

Ako server koristi device ID za sync, proveri:

- persistence
- reinstall
- backup/restore
- privacy

---

# 117. MULTI-ACCOUNT

Sync queue mora biti user-scoped.

---

# 118. USER A QUEUE

Scenario:

```text
User A creates pending operations
↓
logout
↓
User B login
```

Šta se dešava sa A queue-om?

---

# 119. CROSS-USER EXECUTION

P0/P1 scenario:

```text
A pending operation
↓
B login
↓
generic sync worker executes
↓
uses B auth token
↓
sends A payload under B session
```

Aktivno proveri.

---

# 120. ACCOUNT ID NA QUEUE-U

Ako queue sadrži account owner ID, proveri da worker validira current session pre izvršenja.

---

# 121. LOGOUT

Na logout-u moguća ponašanja:

- clear pending
- preserve account-scoped pending
- force sync
- warn user

Koje je ispravno zavisi od proizvoda.

Bitno je da ponašanje bude eksplicitno.

---

# 122. LOGOUT SA UNSYNCED DATA

Ako će logout obrisati lokalne unsynced promene, korisnik možda treba upozorenje.

Posebno ako podaci nemaju drugu kopiju.

---

# 123. ACCOUNT DELETE

Pending operation starog account-a ne sme se ponovo pokrenuti nakon deletion-a.

---

# 124. TOKEN REFRESH

Sync request-i mogu dobiti 401 paralelno.

Proveri single-flight refresh i queue behavior.

---

# 125. TOKEN EXPIRED OFFLINE

Scenario:

```text
user offline 7 days
↓
many edits
↓
auth expires
↓
network returns
```

Da li pending data ostaje sačuvan dok se user re-authenticate-uje?

---

# 126. AUTH FAILURE NE SME IZGUBITI QUEUE

Ne briši mutation samo zato što trenutni token ne radi.

Razlikuj:

```text
operation invalid
```

od:

```text
authentication temporarily invalid
```

---

# 127. PERMISSION CHANGE

Server može promeniti user permissions dok je uređaj offline.

Kad pending mutation kasnije dobije 403:

UI treba da zna da operation nije sinhronizovana.

---

# 128. REMOTE SCHEMA EVOLUTION

Stari Android client može imati queued operation starog formata.

Backend se u međuvremenu menja.

Pitaj:

> Da li server i dalje prihvata payload?

---

# 129. QUEUE PAYLOAD VERSIONING

Ako operations mogu čekati veoma dugo i format se menja, razmotri:

- version
- migration
- backward compatible parser

---

# 130. APP UPDATE + QUEUE

Scenario:

```text
v1 queues operations
↓
app updates to v3
↓
v3 worker reads v1 queue
```

Proveri compatibility.

---

# 131. DATABASE MIGRATION + QUEUE

Migration ne sme izgubiti pending flags/operation payload-e.

---

# 132. SERVER ENUM DRIFT

Stari pending operation može imati enum koji server više ne prihvata.

Potrebna je explicit failure/migration politika.

---

# 133. LOCAL ENTITY SCHEMA DRIFT

Pending operation koja samo referencira current row može poslati drugačiji payload nakon app update-a nego što je user originalno nameravao.

Utvrdi da li queue čuva:

- snapshot operation payload
- pointer na current state

---

# 134. OPERATION SNAPSHOT VS CURRENT STATE

Primer:

```text
user schedules change A
↓
later locally changes to B
```

Ako pending operation čita current entity tek pri execution-u:

da li treba poslati A ili B?

To zavisi od operation semantics.

---

# 135. ATTACHMENTS

Offline file upload zahteva poseban lifecycle.

Mapiraj:

```text
local file
↓
pending upload
↓
worker
↓
remote URL/ID
↓
entity reconciliation
```

---

# 136. FILE STILL EXISTS?

Ako user/system obriše temp file pre worker execution-a:

šta se događa?

---

# 137. URI PERMISSION

Ako queue čuva external content URI, proveri da li permission preživljava dovoljno dugo.

---

# 138. PERSISTABLE URI PERMISSION

Ako je relevantno, proveri da aplikacija zadržava pristup dokumentu koji treba uploadovati mnogo kasnije.

---

# 139. TEMP FILE QUEUE

Ne čuvaj jedinu upload kopiju u disposable cache-u ako operation mora preživeti storage cleanup.

---

# 140. LARGE UPLOAD RETRY

Ako upload od 2 GB padne na 99%, da li ponavlja sve?

Ako proizvod radi velike fajlove, proveri resume/chunk model.

Ako ne:

**NOT APPLICABLE**

---

# 141. UPLOAD IDEMPOTENCY

Retry complete upload-a posle lost response može napraviti duplicate attachment.

---

# 142. DOWNLOAD OFFLINE

Za downloaded content proveri:

- complete marker
- partial file
- checksum
- resume

ako feature postoji.

---

# 143. PARTIAL DOWNLOAD

Ne tretiraj partial file kao validan completed download.

---

# 144. TEMP + FINALIZE

Robustan model često:

```text
download temp
↓
verify
↓
atomic rename/finalize
```

ako filesystem/use case to podržava.

---

# 145. CHECKSUM

Za critical large downloadable artifacts može pomoći.

Ne zahtevaj za svaki mali cache file.

---

# 146. WEBSOCKET / PUSH

Ako server gura promene:

mapiraj interaction sa periodic/manual sync-om.

---

# 147. DUPLICATE REMOTE EVENT

Push može stići više puta.

Remote event processing treba biti idempotent ako provider ne garantuje exactly-once.

---

# 148. OUT-OF-ORDER REMOTE EVENTS

Event v12 može stići pre v11.

Ako version postoji, proveri ordering logic.

---

# 149. MISSED EVENTS

Socket nije pouzdan durable sync log po default-u.

Nakon reconnect-a možda je potreban catch-up sync.

---

# 150. PUSH KAO INVALIDATION SIGNAL

Često robustan model:

```text
push says data changed
↓
client fetches authoritative state
```

Ali audit mora prvo utvrditi stvarni model.

---

# 151. DUPLICATE INVALIDATION

Više push-a ne bi trebalo da generiše nekontrolisani fetch storm.

---

# 152. LOCAL CACHE INVALIDATION

Mutation može zahtevati update više lokalnih query/modela.

Proveri da nema stale derived data.

---

# 153. DENORMALIZED DATA

Ako isti podatak postoji u više tabela:

sync mora ažurirati sve kopije ili imati jasan derivation model.

---

# 154. DERIVED COUNTS

Primer:

```text
folder.itemCount
```

plus stvarna child tabela.

Proveri da sync/delete ne ostavlja count stale.

---

# 155. MATERIALIZED DATA

Ako app čuva agregate radi performance-a, proveri transaction/invalidation.

---

# 156. SYNC LOOP

Scenario:

```text
remote change
↓
local write
↓
local observer interprets as user change
↓
pushes remote
↓
server event returns
↓
repeat
```

Proveri origin/source metadata.

---

# 157. REMOTE VS LOCAL ORIGIN

Sync engine možda mora razlikovati:

```text
USER_EDIT
REMOTE_SYNC
MIGRATION
SYSTEM_UPDATE
```

ako observer-based sync automatski generiše mutations.

---

# 158. ECHO SUPPRESSION

Ako server vraća istu promenu koju je client upravo poslao, client mora bezbedno obraditi echo.

---

# 159. REMOTE VERSION ACK

Kad mutation uspe:

proveri da local row dobija novu authoritative server revision.

---

# 160. ACK RACE

Scenario:

```text
local edit A sent
↓
user makes local edit B
↓
server response A arrives
↓
response writes whole entity A
↓
B disappears
```

Jedan od najvažnijih offline-first bugova.

---

# 161. PATCH ACK

Ako server response vraća samo metadata/version, lakše je izbeći overwrite current local fields.

Ali proveri API.

---

# 162. FULL ENTITY RESPONSE

Ako server vraća canonical entity, merge mora znati da li su postojale nove lokalne izmene nakon request start-a.

---

# 163. DIRTY GENERATION

Jedan model je local revision/generation.

Ne uvodi automatski,变 proveri da li postojeći sistem ima način da detektuje novije lokalne izmene.

---

# 164. PULL AFTER PUSH

Ako nakon uspešnog push-a radi full pull, proveri da eventual consistency na serveru ne vrati stariju vrednost i privremeno je prepiše.

---

# 165. READ-AFTER-WRITE

Ne pretpostavljaj da svaki backend/storage pruža trenutnu globalnu read-after-write consistency bez provere.

---

# 166. SERVER CACHE

Backend/CDN cache može vratiti stale podatke neposredno posle mutation-a.

Ako app zatim overwrite-uje Room, može delovati kao da save nije uspeo.

---

# 167. UI OPTIMISM VS SERVER CANONICALIZATION

Server može normalizovati:

- text
- calculated fields
- status
- timestamps

Proveri kako local optimistic state reconciliuje canonical response.

---

# 168. FAILURE ROLLBACK

Ako optimistic mutation padne:

- rollback
- failed state
- user retry

moraju uzeti u obzir druge izmene nastale posle optimistic change-a.

---

# 169. NAIVE ROLLBACK

Scenario:

```text
state = A
↓
optimistic mutation 1 -> B
↓
mutation 2 -> C
↓
mutation 1 fails
↓
rollback to A
```

Time je izgubljena validna promena C.

---

# 170. REVERSIBLE PATCH

Za concurrent optimistic updates, rollback može zahtevati operation-level inverse/merge, a ne vraćanje celog starog snapshot-a.

Samo ako complexity proizvoda to opravdava.

---

# 171. CONFLICT UI

Ako conflict zahteva korisničku odluku:

proveri da UI ima dovoljno informacija:

- local value
- remote value
- timestamp/version
- retry/choose action

---

# 172. HIDDEN CONFLICT

Nemoj silently izabrati stranu ako business data zahteva explicit user decision.

---

# 173. SYNC ERROR PERSISTENCE

Error state ne sme nestati samo zato što app restartuje.

Ako operation i dalje nije uspešna, queue mora znati to stanje.

---

# 174. RETRY COUNT

Ako retry count nije durable, process restart može vratiti broj na 0 i napraviti praktično beskonačne retries.

---

# 175. DEAD LETTER

Permanentno neuspešna operation može zahtevati dead-letter/failed stanje.

Ne sme blokirati celu queue zauvek.

---

# 176. POISON OPERATION

Jedna invalid mutation ne sme nužno sprečiti sync svih nezavisnih operacija iza nje.

Ali ako ordering/dependency zahteva, možda mora.

Dokumentuj strategiju.

---

# 177. DEPENDENCY FAILURE

Ako parent create permanentno padne:

šta se dešava sa queued child mutations?

---

# 178. QUEUE PRIORITY

Critical mutation možda treba pre background refresh-a.

Ali ne uvodi priority sistem bez business razloga.

---

# 179. FAIRNESS

Veliki backlog jednog entity/type-a ne bi trebalo slučajno da blokira sve ostalo ako nema dependency razloga.

---

# 180. QUEUE GROWTH

Ako user dugo radi offline:

koliko pending operations može nastati?

---

# 181. UNBOUNDED QUEUE

Proveri storage/memory/performance behavior za dug offline period.

---

# 182. COMPACTION SAFETY

Ako queue compaction postoji:

dokaži da dve operacije zaista mogu bezbedno da se objedine.

---

# 183. BACKPRESSURE

Ako UI proizvodi offline mutations mnogo brže nego što sync može kasnije poslati:

proveri queue stability.

---

# 184. SYNC RATE LIMIT

Client možda mora ograničiti paralelne request-e.

Ali ne serializuj sve ako backend može bezbedno raditi paralelno.

---

# 185. BATCHING

Batching može smanjiti network overhead.

Proveri:

- partial failure
- idempotency
- max payload

---

# 186. SERVER LIMITS

Ako API ima request size/item limits, veliki offline backlog možda ne staje u jedan batch.

---

# 187. PAGINATED PUSH

Ako queue šalje u batch segmentima, proveri checkpoint između batch-eva.

---

# 188. TRANSACTIONAL SERVER BATCH

Ne pretpostavljaj da server batch endpoint radi atomically.

Proveri contract.

---

# 189. OBSERVABILITY

Sync je teško debugovati bez jasne observability strategije.

Mapiraj:

- sync start
- completion
- duration
- counts
- retries
- permanent failures
- conflicts

---

# 190. LOGGING SENSITIVE DATA

Ne loguj cele mutation payload-e ako sadrže privatne podatke.

---

# 191. OPERATION ID U LOGOVIMA

Stabilan non-sensitive operation ID može pomoći praćenju retry flow-a.

---

# 192. SYNC METRICS

Ako telemetry postoji, korisni signali mogu biti:

- pending queue size
- oldest pending age
- success/failure
- conflict count

Ne zahtevaj telemetry ako proizvod nema realnu operativnu potrebu.

---

# 193. DEBUG SCREEN

Internal diagnostics za sync može biti koristan u složenim aplikacijama.

Klasifikuj kao P4 ako nema postojećeg operativnog problema.

---

# 194. TESTOVI

Mapiraj:

- repository tests
- Room tests
- worker tests
- network mocks
- sync integration tests
- end-to-end tests

---

# 195. OFFLINE TEST

Minimalni critical scenario:

```text
online
↓
load data
↓
offline
↓
read/edit
↓
restart process
↓
online
↓
sync
```

---

# 196. PROCESS DEATH TEST

Queue treba preživeti:

```text
mutation pending
↓
process killed
↓
new process
↓
sync
```

---

# 197. REBOOT TEST

Ako WorkManager/durable sync treba nastaviti nakon reboot-a, testiraj gde je moguće.

---

# 198. LOST RESPONSE TEST

Veoma važan test:

```text
server executes mutation
↓
connection closed before response
↓
client retries
```

Proveri da nema duplicate side effect-a.

---

# 199. OUT-OF-ORDER TEST

Kontroliši response redosled:

```text
A request
B request
complete B
complete A
```

Proveri finalni local state.

---

# 200. MULTI-DEVICE TEST

Ako backend test environment dozvoljava:

- client A
- client B
- conflict

Proveri stvarnu server policy.

---

# 201. ACCOUNT SWITCH TEST

```text
A creates pending
↓
logout
↓
B login
↓
sync triggers
```

Assert:

- A operation nije poslata kao B
- A data nije prikazana B

---

# 202. TOKEN EXPIRY TEST

Queue + expired auth + re-login.

Proveri da pending operation preživi i nastavi pod originalnim account-om.

---

# 203. PERMANENT FAILURE TEST

Server vrati validation failure.

Assert:

- nema beskonačnog retry-ja
- operation dobija failed state
- user može razumeti problem gde je potrebno

---

# 204. TRANSIENT FAILURE TEST

Server 500/network failure.

Assert eventual retry prema policy-ju.

---

# 205. CONFLICT TEST

Server ima newer revision.

Client pokušava stale update.

Proveri actual conflict handling.

---

# 206. DELETE CONFLICT TEST

Delete vs remote edit.

---

# 207. LOCAL EDIT DURING SYNC TEST

Veoma važan:

```text
start sync
↓
pause remote response
↓
edit locally
↓
release remote response
```

Assert da local edit nije slučajno izgubljen.

---

# 208. ACK RACE TEST

```text
send local version A
↓
make local version B
↓
receive ack A
```

Assert da B ostaje.

---

# 209. MIGRATION WITH PENDING QUEUE TEST

Seed old DB version sa:

- pending operations
- remote IDs
- dirty rows

Migriši na latest i nastavi sync.

---

# 210. LARGE BACKLOG TEST

Seed mnogo pending operations.

Proveri:

- memory
- worker timeout
- batching
- ordering

---

# 211. NETWORK FLAPPING TEST

Repeated connect/disconnect.

Assert da queue i worker count ne rastu nekontrolisano.

---

# 212. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Entity/Data type:
Local store:
Remote endpoint:
Worker/Repository:
File:
Relevant code:

Sync direction:
Source of truth:
Account scope:

Problem:

Evidence:

Sync Timeline:

T0:
T1:
T2:
T3:

Offline behavior:

Retry behavior:

Conflict behavior:

Expected final state:

Actual/Possible final state:

Data loss risk:

Duplicate risk:

Cross-user risk:

Root cause:

Recommended remediation:

Regression test:

Runtime verification:

Complexity:
XS / S / M / L / XL
```

---

# 213. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-user sync podataka
- catastrophic data corruption
- duplicate irreversible/financial mutation
- security boundary failure kroz pending queue

## P1 - HIGH

- local user data može biti izgubljen
- common retry pravi duplicate
- offline mutation može biti silently lost
- conflict sistem redovno prepisuje novije podatke
- queue nije durable i proizvod obećava offline writes

## P2 - MEDIUM

- značajan stale/conflict problem sa workaround-om
- sync retry/permanent failure problem
- partial consistency problem ograničenog scope-a

## P3 - LOW

- lokalni sync edge case
- manje freshness/UI stanje

## P4 - IMPROVEMENT

- bolji batching, observability, sync UX ili architecture bez potvrđenog correctness problema

---

# 214. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

precizan sync flow/test direktno dokazuje problem.

MEDIUM:

implementation snažno omogućava problem, ali server/runtime nije potpuno potvrđen.

LOW:

zavisi od nepoznatog server contract-a ili production uslova.

---

# 215. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 216. SERVER CONTRACT STATUS

Za nalaze koji zavise od backend semantics dodaj:

```text
SERVER CONTRACT:
VERIFIED
INFERRED
NOT VERIFIED
```

Ne nagađaj server idempotency ili conflict behavior.

---

# 217. DATA LOSS CLASSIFICATION

Za affected podatak navedi:

```text
CACHE
SERVER-RECOVERABLE
LOCAL-ONLY
USER-GENERATED
IRREVERSIBLE ACTION
NOT VERIFIED
```

---

# 218. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. Room schema
2. repository
3. queue
4. worker
5. server API contract
6. idempotency
7. account scoping
8. transaction boundaries
9. retry policy
10. tests

Ne zaključuj iz jednog `retry()` poziva.

---

# 219. NE PREPORUČUJ LAST-WRITE-WINS AUTOMATSKI

LWW može biti prihvatljiv za:

- preference
- low-value state

ali opasan za:

- documents
- inventory
- collaborative data
- financial state

Proceni domain.

---

# 220. NE PREPORUČUJ TIMESTAMP KAO MAGIČNO REŠENJE

Timestamp ne rešava automatski:

- clock skew
- field conflicts
- lost response
- duplicate create

---

# 221. NE PREPORUČUJ WORKMANAGER ZA SVE

WorkManager je dobar za durable deferrable background work.

Nije zamena za svaki foreground request.

---

# 222. NE RETRY-UJ SVE

Retry ima smisla samo kada failure može postati uspešan bez promene request-a ili nakon odgovarajućeg recovery-ja.

---

# 223. NE OSLANJAJ SE SAMO NA `isOnline`

Normalni request i dalje mora imati robustan failure path.

---

# 224. NE BRIŠI LOCAL DATA PRI CONFLICT-U

Nemoj rešavati sync problem tako što ćeš naslepo prihvatiti server i odbaciti lokalne izmene ako domain to ne dozvoljava.

---

# 225. NE MENJAJ KOD

Tokom audita:

- ne uvodi queue
- ne menja WorkManager
- ne dodaj timestamps
- ne dodaj versions
- ne menja API contract
- ne dodaj idempotency key
- ne prepisuj merge logic

Prvo završi audit.

---

# 226. OUTPUT - ANDROID_OFFLINE_SYNC_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- offline model
- sync architecture
- source of truth
- durability
- conflict model
- najveći rizici

## 2. Data / Source-of-Truth Inventory

## 3. Sync Architecture Map

## 4. Offline Read Audit

## 5. Offline Write Audit

## 6. Pending Queue Audit

## 7. Queue Durability Audit

## 8. Idempotency Audit

## 9. Retry Audit

## 10. WorkManager Audit

## 11. Network Transition Audit

## 12. Pull Sync Audit

## 13. Push Sync Audit

## 14. Delta / Incremental Sync Audit

## 15. Conflict Detection Audit

## 16. Conflict Resolution Audit

## 17. Delete / Tombstone Audit

## 18. Local ID / Remote ID Audit

## 19. Attachment / File Sync Audit

## 20. Multi-Device Audit

## 21. Multi-Account / Logout Audit

## 22. Auth Expiry Audit

## 23. App Upgrade / Queue Compatibility

## 24. Observability Audit

## 25. Sync Test Coverage

## 26. Findings Summary

| ID | Severity | Data | Sync stage | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 27. P0 Findings

## 28. P1 Findings

## 29. P2 Findings

## 30. P3 Findings

## 31. P4 Improvements

## 32. Things Done Well

## 33. Unknown / Not Verified

## 34. Remediation Roadmap

---

# 227. SYNC MATRIX

Za svaki entity:

| Entity | Pull | Push | Queue | Conflict model | Idempotent | Risk |
|---|---|---|---|---|---|---|

---

# 228. QUEUE MATRIX

| Operation | Durable | Account scoped | Ordered | Retry | Idempotent |
|---|---|---|---|---|---|

---

# 229. FAILURE MATRIX

| Failure | Retryable | User action required | Queue retained | Risk |
|---|---|---|---|---|

Za:

- no network
- timeout
- 401
- 403
- 404
- 409
- 429
- 5xx
- malformed response

---

# 230. CONFLICT MATRIX

| Conflict | Current behavior | Data loss possible | User visible | Verified |
|---|---|---|---|---|

---

# 231. ACCOUNT MATRIX

| Data/Operation | User scoped | Cleared on logout | Preserved for retry | Cross-user safe |
|---|---|---|---|---|

---

# 232. SECOND PASS - LOST RESPONSE ATTACK

Za svaku remote write operaciju:

```text
request reaches server
↓
server succeeds
↓
response disappears
```

Pitaj:

> Šta tačno client radi sledeće?

Ako odgovor može biti:

```text
send again and duplicate
```

to je ozbiljan nalaz.

---

# 233. SECOND PASS - OLD RESPONSE ATTACK

Za svaki pull/request:

```text
remote request starts
↓
local edit happens
↓
remote response returns
```

Pitaj:

> Može li stariji remote snapshot pregaziti noviju lokalnu nameru?

---

# 234. SECOND PASS - OFFLINE WEEK

Simuliraj korisnika koji je 7 dana offline.

Tokom perioda:

- pravi mnogo izmena
- server data se menja
- permissions se menjaju
- app se više puta restartuje

Zatim vrati mrežu.

Prati kompletan convergence.

---

# 235. SECOND PASS - TWO DEVICES

Simuliraj:

```text
Device A offline
Device B online
```

Napravi konfliktne izmene.

Pitaj:

> Koje finalno stanje svaki uređaj dobija nakon potpune sinhronizacije?

---

# 236. SECOND PASS - LOGOUT MID-SYNC

Scenario:

```text
A sync starts
↓
logout
↓
B login
↓
A response arrives
```

Proveri:

- DB
- queue
- UI
- auth headers
- workers

---

# 237. SECOND PASS - PROCESS DEATH

Ubij process u svakom važnom queue stanju:

```text
PENDING
IN_FLIGHT
AFTER_REMOTE_SUCCESS
BEFORE_LOCAL_ACK
```

Pitaj kako se sistem oporavlja.

---

# 238. SECOND PASS - RETRY STORM

Seeduj veliki backlog i simuliraj povratak mreže.

Pitaj:

- koliko workers
- koliko parallel requests
- da li server dobija burst
- da li client troši memory/battery

---

# 239. SECOND PASS - PERMANENT FAILURE

Ubaci jednu nepopravljivu operation usred queue-a.

Pitaj:

> Da li blokira sve iza sebe?

Ako da:

da li ordering zaista zahteva to ponašanje?

---

# 240. SECOND PASS - APP UPDATE

Seeduj queue u staroj verziji aplikacije.

Zatim upgrade na latest.

Pitaj:

- može li novi kod razumeti operation
- da li endpoint još prihvata payload
- da li account metadata ostaje

---

# 241. SECOND PASS - REMOTE DELETE

Server obriše entity dok client offline ima pending update.

Vratiti mrežu.

Pitaj:

> Delete wins, update resurrects ili conflict?

Odgovor mora biti eksplicitan.

---

# 242. SECOND PASS - ACK RACE

Ponovi:

```text
local A
↓
send A
↓
local B
↓
ack A
```

Ovo mora biti provereno za svaki high-value mutable entity.

---

# 243. SECOND PASS - FULL RESYNC

Simuliraj potrebu za kompletnim rebuild-om lokalnog cache-a.

Pitaj:

> Šta se dešava sa unsynced lokalnim promenama?

---

# 244. SECOND PASS - CLOCK WRONG

Podesi device clock značajno unapred/unazad.

Ako sync koristi client timestamps za ordering, proveri finalni rezultat.

---

# 245. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- offline model je utvrđen pre recommendations
- source of truth je eksplicitno mapiran
- local saved i remote synced nisu pomešani
- svaki retry write-a proverava idempotency
- lost-response scenario je analiziran
- queue je proverena kroz process death
- in-flight recovery je analiziran
- conflict model nije pretpostavljen
- server contract tvrdnje su označene verified/inferred/not verified
- local edit tokom pull-a je testiran
- ack stare mutation posle nove local izmene je testiran
- delete/tombstone semantics su proverene
- multi-device scenario je analiziran gde je relevantno
- account switching ne može izvršiti A queue pod B credentials
- auth expiry ne briše pending user data bez razloga
- permanent failures se razlikuju od transient
- connectivity boolean nije tretiran kao API availability guarantee
- queue growth i backlog behavior su analizirani
- app upgrade sa pending operations je analiziran
- WorkManager retries nisu tretirani kao exactly-once execution
- improvements su odvojeni od stvarnih correctness bugova

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite Room, WorkManager, retry i last-write-wins za offline mode.

To nije offline-first audit.

Tražim probleme poput:

```text
user creates item offline
↓
queue stores create
↓
network returns
↓
server creates item
↓
response is lost
↓
WorkManager retries create
↓
server creates second item
```

ili:

```text
sync request downloads entity v4
↓
user locally edits entity to v5 while request is running
↓
v4 response arrives
↓
repository blindly upserts remote entity
↓
user's v5 edit disappears
```

ili:

```text
User A queues private mutation
↓
logs out
↓
User B logs in
↓
generic sync worker wakes
↓
uses current B token
↓
sends A mutation under B account
```

ili:

```text
delta sync receives 3 pages
↓
pages 1 and 2 written
↓
new sync token saved
↓
process crashes before page 3
↓
next sync starts after token
↓
page 3 changes are permanently skipped
```

ili:

```text
local delete stored only by deleting row
↓
device remains offline
↓
sync engine later scans rows needing upload
↓
deleted row no longer exists
↓
remote entity is never deleted
```

ili:

```text
local version A sent to server
↓
user changes local entity to B
↓
server confirms A and returns canonical entity A
↓
client replaces entire Room row
↓
newer local B is lost
```

To su offline-first i sync problemi koje treba da pronađeš.

Razmišljaj kroz:

- source of truth
- durability
- queue semantics
- operation identity
- idempotency
- retries
- lost responses
- conflicts
- remote/local versions
- process death
- multiple devices
- account boundaries
- eventual convergence

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koja promena je napravljena lokalno?

> Da li je durable?

> Šta se šalje serveru?

> Šta ako server uspe, a odgovor nestane?

> Šta ako korisnik ponovo promeni podatak pre starog odgovora?

> Šta ako aplikacija umre usred sync-a?

> Šta ako drugi uređaj promeni isti podatak?

> Šta ako se korisnik odjavi i prijavi drugim nalogom?

Ako odgovor nije dokaziv:

**NOT VERIFIED.**

Ako server behavior nije poznat:

**SERVER CONTRACT NOT VERIFIED.**

Ako je samo architecture enhancement bez potvrđenog failure-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih sync correctness problema sa jasnim timeline-om nego napisati 100 generičkih saveta o offline režimu.

Cilj je dobiti forenzički precizan offline-first audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- determinističan failure scenario
- queue/state-machine fix
- idempotency zaštitu
- conflict policy
- regression test
- process-death test
- multi-account test
- production-safe sync model
