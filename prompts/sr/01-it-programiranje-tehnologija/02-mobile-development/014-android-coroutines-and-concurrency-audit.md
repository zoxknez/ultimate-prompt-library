---
id: UPL-IT-014
number: 14
slug: android-coroutines-and-concurrency-audit
title: Audit korutina i konkurentnosti u Android aplikacijama
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# AUDIT KORUTINA I KONKURENTNOSTI U ANDROID APLIKACIJAMA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i runtime-oriented analizu Kotlin Coroutines i concurrency ponašanja kompletne Android aplikacije.

Glavni cilj:

> Pronaći stvarne race condition-e, cancellation probleme, pogrešne coroutine scope-ove, thread-safety greške, duplicate work, deadlock rizike, stale rezultate i nekonzistentna stanja koja mogu nastati kada više asinhronih operacija rade paralelno ili se njihov redosled razlikuje od idealnog scenarija.

Ovo nije:

- generički Kotlin review
- lista Coroutines best practices
- preporuka da se sve prebaci na Flow
- preporuka da se svuda koristi Mutex
- automatsko menjanje dispatcher-a
- površno traženje `GlobalScope`
- pokušaj da se svaka paralelna operacija serializuje

Fokus je na realnom execution behavior-u.

Prioritet:

**data correctness > cancellation safety > structured concurrency > race prevention > resource safety > throughput > code elegance**

Bolje je pronaći 6 potvrđenih concurrency bugova nego napisati 100 teorijskih upozorenja.

---

# 1. UTVRDI COROUTINE STACK

Pre nalaza utvrdi:

- Kotlin verziju
- kotlinx.coroutines verziju
- Compose ili Views
- ViewModel
- lifecycle runtime
- Room
- Retrofit/Ktor
- WorkManager
- Flow
- StateFlow
- SharedFlow
- Channels
- custom CoroutineScope
- custom Dispatcher
- RxJava interop ako postoji

Pregledaj repository-wide:

```text
launch
async
await
coroutineScope
supervisorScope
withContext
runBlocking
GlobalScope
CoroutineScope
Job
SupervisorJob
Mutex
Semaphore
Channel
StateFlow
SharedFlow
stateIn
shareIn
callbackFlow
channelFlow
flowOn
collect
collectLatest
first
single
```

Ne zaključuj samo iz pojavljivanja API-ja.

---

# 2. NAPRAVI CONCURRENCY MAPU

Za svaki critical feature napravi mapu:

```text
User action
↓
ViewModel
↓
Coroutine
↓
Repository
↓
Database / Network
↓
Result
↓
Shared state
↓
UI
```

Ako postoji paralelizam:

```text
Coroutine A
          ↘
           shared state
          ↗
Coroutine B
```

Identifikuj:

- ko pokreće posao
- ko ga poseduje
- šta deli sa drugim poslovima
- šta se događa ako se operacije preklapaju
- šta se događa ako završe obrnutim redosledom

---

# 3. COROUTINE OWNERSHIP

Za svaki važan coroutine utvrdi scope:

- `viewModelScope`
- `lifecycleScope`
- `viewLifecycleOwner.lifecycleScope`
- WorkManager
- Service scope
- application scope
- custom scope
- `GlobalScope`

Pitaj:

> Da li lifetime coroutine-a odgovara lifetime-u posla?

---

# 4. PREKRATAK SCOPE

Primer:

```text
critical sync
↓
Fragment lifecycleScope
↓
user leaves screen
↓
coroutine cancelled
↓
sync incomplete
```

Ako operation mora da preživi screen, scope je verovatno pogrešan.

---

# 5. PREDUGAČAK SCOPE

Suprotan scenario:

```text
screen-specific work
↓
application scope
↓
screen destroyed
↓
work continues
↓
stale result affects global state
```

Prijavi samo ako postoji realna posledica.

---

# 6. GLOBALSCOPE

Svako korišćenje `GlobalScope` analiziraj duboko.

Ne prijavljuj ga automatski.

Pitaj:

- ko očekuje rezultat
- šta cancel-uje posao
- šta se događa pri logout-u
- šta se događa pri process lifecycle promeni
- može li rezultat stići u pogrešan state

---

# 7. CUSTOM SCOPE

Za svaki:

```kotlin
CoroutineScope(...)
```

utvrdi:

- Job
- SupervisorJob
- dispatcher
- owner
- cancellation

Ako nema jasnog owner-a, označi kao architectural/concurrency risk.

---

# 8. STRUCTURED CONCURRENCY

Proveri da child poslovi pripadaju parent operaciji tamo gde semantika to zahteva.

Primer:

```text
loadDashboard
├── loadProfile
├── loadStats
└── loadNotifications
```

Ako jedan failure treba da prekine celu operaciju, proveri običan `coroutineScope`.

Ako treba izolacija, proveri `supervisorScope`.

Ne menjaj jedan drugim bez razumevanja business semantics.

---

# 9. `launch`

Za svaki critical `launch` pitaj:

> Ko čeka da se ovo završi?

Ako odgovor glasi:

```text
niko
```

utvrdi da li je to zaista fire-and-forget operacija ili slučajno izgubljen dependency.

---

# 10. FIRE-AND-FORGET

Posebno opasno za:

- database write
- analytics koji utiče na state
- upload
- payment
- message send
- cleanup

Ako caller nastavlja kao da je posao uspeo, a coroutine tek treba da izvrši operaciju, proveri false-success scenario.

---

# 11. `async`

Traži `async` koji:

- nikada nije awaited
- radi u nepotrebnom scope-u
- koristi se samo kao `launch`

`async` bez jasnog await contract-a može sakriti exception.

---

# 12. PARALLELIZATION

Ako se koriste:

```kotlin
async { loadA() }
async { loadB() }
```

proveri da A i B stvarno mogu paralelno.

Ako B zavisi od A, paralelizacija može biti correctness bug.

---

# 13. SERIAL EXECUTION

Suprotno tome, traži:

```kotlin
val a = loadA()
val b = loadB()
val c = loadC()
```

kada su sve tri potpuno nezavisne.

To je performance improvement, ne concurrency bug.

Klasifikuj kao P4 osim ako latency pravi realan failure.

---

# 14. CANCELLATION

Za svaku važnu suspend operaciju pitaj:

> Šta se događa ako bude cancel-ovana baš ovde?

Prati:

```text
start
↓
partial work
↓
cancellation
↓
cleanup / rollback / persisted partial state
```

---

# 15. CANCELLATION PROPAGATION

Proveri da child coroutines pravilno primaju cancellation kada parent više nije relevantan.

---

# 16. SWALLOWED CANCELLATION

Posebno traži:

```kotlin
catch (e: Exception) {
    ...
}
```

u suspend funkcijama.

Proveri da li hvata `CancellationException` i nastavlja rad.

---

# 17. POGREŠAN RETRY POSLE CANCELLATION-A

Scenario:

```text
screen closes
↓
coroutine cancelled
↓
catch(Exception)
↓
treated as network failure
↓
retry starts
```

Job koji je trebalo da prestane nastavlja da radi.

---

# 18. `runCatching`

Pregledaj suspend kod unutar:

```kotlin
runCatching { ... }
```

Proveri da cancellation nije pretvorena u običan failure rezultat.

---

# 19. `NonCancellable`

Svako korišćenje detaljno analiziraj.

Validni slučajevi postoje, uglavnom za kratki critical cleanup.

Traži:

- mrežni request
- dugačak DB posao
- retry
- navigation

unutar `NonCancellable`.

---

# 20. CLEANUP

Ako cancellation nastane tokom resource operacije, proveri `finally`.

Primeri:

- file stream
- lock
- temporary file
- progress state
- DB transaction wrapper

---

# 21. PARTIAL SIDE EFFECT

Suspend funkcija može izvršiti deo posla pre cancellation-a.

Primer:

```text
DB record inserted
↓
coroutine cancelled
↓
network call nikad nije poslat
```

Da li system može da se oporavi?

---

# 22. NON-ATOMIC MULTI-STEP OPERATION

Mapiraj:

```text
step A
↓
step B
↓
step C
```

Ako cancellation/failure između koraka ostavlja nekonzistentno stanje, prijavi.

---

# 23. TRANSACTIONS

Ako više DB write-ova čini jednu poslovnu operaciju, proveri transakciju.

Concurrency audit treba da potvrdi da drugi reader ne može videti polu-upisano stanje.

---

# 24. THREAD CONFINEMENT

Utvrdi koji state pripada:

- Main thread-u
- jednom worker thread-u
- multi-thread access-u

Nemoj automatski pretpostaviti thread safety zato što se koristi coroutine.

Coroutines mogu menjati thread.

---

# 25. SHARED MUTABLE STATE

Repository-wide traži:

```kotlin
var ...
mutableListOf
mutableMapOf
ArrayList
HashMap
```

koji mogu biti menjani iz više coroutine-a.

---

# 26. READ-MODIFY-WRITE RACE

Klasičan scenario:

```text
Coroutine A reads count = 5
Coroutine B reads count = 5
A writes 6
B writes 6
```

Expected:

```text
7
```

Actual:

```text
6
```

Traži ovakve obrasce.

---

# 27. CHECK-THEN-ACT RACE

Primer:

```text
if (!exists(id)) {
    insert(id)
}
```

Dve coroutine mogu obe videti `false`.

Ako unique DB constraint ne postoji, mogu nastati duplikati.

---

# 28. BUSINESS INVARIANT RACE

Za svaki važan invariant pitaj:

> Da li dva paralelna poziva mogu oba proći proveru pre nego što jedan promeni stanje?

Primeri:

- jedan aktivan recording
- jedan default account
- jedna rezervacija
- jedan pending sync
- limited inventory

---

# 29. DATABASE CONSTRAINT KAO POSLEDNJA ODBRANA

Ako invariant mora biti apsolutan, UI/Mutex zaštita u jednom procesu možda nije dovoljna.

Proveri DB/server constraint gde je moguće.

---

# 30. MUTEX

Za svaki Mutex utvrdi:

- šta tačno štiti
- da li svi access paths koriste isti mutex
- scope mutex-a
- proces granicu

---

# 31. LOCAL MUTEX FALSE SAFETY

Primer:

```text
Repository instance A -> Mutex A
Repository instance B -> Mutex B
```

Ako DI kreira dve instance, zaštita možda ne postoji globalno.

---

# 32. MULTI-PROCESS

Mutex u jednom procesu ne štiti drugi Android process.

Ako aplikacija koristi više procesa, uzmi to u obzir.

---

# 33. SERVER CONCURRENCY

Client Mutex ne sprečava isti user action sa drugog uređaja.

Ako invariant mora važiti globalno, server mora biti authority.

---

# 34. DEADLOCK

Mapiraj više lock-ova.

Scenario:

```text
Coroutine A:
lock X
↓
wait Y

Coroutine B:
lock Y
↓
wait X
```

Ako postoji mogućnost, dokumentuj precizno.

---

# 35. LOCK ORDERING

Ako više funkcija uzima iste lock-ove različitim redosledom, to je high-risk signal.

---

# 36. SUSPEND DOK DRŽIŠ LOCK

Proveri duge suspend operacije unutar Mutex-a.

Primer:

```kotlin
mutex.withLock {
    networkCall()
}
```

Može serializovati sve korisnike/operacije duže nego što je potrebno.

Nije automatski bug, ali proceni contention.

---

# 37. BLOCKING LOCK

Traži:

- `synchronized`
- `ReentrantLock`

na Main thread-u ili oko suspend/slow rada.

---

# 38. `synchronized`

Ako je critical section kratak i lokalni, može biti ispravno.

Ne menjaj ga u Mutex samo zato što projekat koristi coroutines.

---

# 39. ATOMIC TYPES

Ako se koristi:

- AtomicBoolean
- AtomicInteger
- AtomicReference

proveri da jedna atomic promenljiva zaista pokriva ceo invariant.

Atomic pojedinačna polja ne čine multi-field operation atomskom.

---

# 40. VOLATILE

`@Volatile` obezbeđuje visibility, ne kompleksnu atomicity.

Traži pogrešno oslanjanje na njega za read-modify-write.

---

# 41. STATEFLOW

Mapiraj sve mutable StateFlow instance.

Pitaj:

- ko sme da piše
- koliko writer-a postoji
- da li update zavisi od prethodne vrednosti

---

# 42. STATEFLOW VALUE RACE

Primer:

```kotlin
_state.value = _state.value.copy(count = _state.value.count + 1)
```

Ako više coroutine-a može paralelno menjati state, proveri lost update.

---

# 43. `update`

Ako se koristi atomic `update`, proveri da li rešava konkretan shared-state race.

Ne preporučuj ga bez stvarne konkurentnosti writer-a.

---

# 44. MULTIPLE STATEFLOW WRITERS

Idealan signal za audit.

Mapiraj svaku funkciju koja menja isti MutableStateFlow.

---

# 45. PARTIAL UI STATE

Ako se odvojeno menjaju:

```text
dataFlow
loadingFlow
errorFlow
```

paralelne coroutine mogu napraviti kontradiktorno UI stanje.

---

# 46. COMPOSITE UISTATE

Proceni da li jedan atomic UiState model smanjuje race samo ako postoje konkretni problemi sa koordinacijom.

---

# 47. SHAREDFLOW

Proveri:

- replay
- extraBufferCapacity
- overflow policy
- broj collector-a

---

# 48. LOST EVENT

Scenario:

```text
event emitted
↓
no active collector
↓
event lost
```

Ako event mora biti durable, SharedFlow bez replay/persistence možda je pogrešan model.

---

# 49. DUPLICATE EVENT

Ako replay > 0 za transient event, novi collector može dobiti stari event.

---

# 50. BACKPRESSURE

Ako producer emituje brže nego consumer obrađuje, proveri:

- suspend
- buffer
- drop oldest
- drop latest

Business event ne sme slučajno biti odbačen.

---

# 51. CHANNEL

Za Channel proveri:

- capacity
- sender lifecycle
- receiver lifecycle
- closure

---

# 52. CHANNEL CLOSE

Ko zatvara Channel i šta se događa sa senderima posle close-a?

---

# 53. MULTIPLE CONSUMERS

Channel distribuira elemente consumerima, ne broadcastuje po default-u.

Proveri da li autor očekuje broadcast semantiku.

---

# 54. FLOW EXCEPTION

Utvrdi gde exception nastaje:

```text
upstream
operator
collector
```

i gde se hvata.

---

# 55. `catch`

Flow `catch` ne hvata sve downstream exception-e.

Proveri konkretan chain.

---

# 56. `retry`

Za svaki retry proveri:

- koje exception-e retry-uje
- max attempts
- delay/backoff
- cancellation
- write idempotency

---

# 57. INFINITE RETRY

Traži flow koji beskonačno retry-uje permanent error.

---

# 58. RETRY STORM

Više collector-a može istovremeno retry-ovati isti upstream problem.

---

# 59. `collectLatest`

Proveri da cancellation prethodnog collector block-a ne ostavlja partial side effect.

---

# 60. SEARCH FLOW

Klasičan scenario:

```text
query A
↓
request A

query B
↓
request A cancelled
↓
request B
```

Proveri da underlying client stvarno podržava cancellation.

---

# 61. FLATMAPLATEST

Ako se koristi za search/resource switching, proveri da downstream side effects ne prežive cancellation.

---

# 62. FLATMAPMERGE

Paralelni inner flows mogu završiti u različitom redosledu.

Proveri da li ordering ima business značaj.

---

# 63. ZIP VS COMBINE

Proveri da izabrani operator odgovara željenoj semantici.

`combine` emituje pri promeni bilo kog source-a nakon initial values.

`zip` pari elemente.

Pogrešan izbor može napraviti missing ili unexpected updates.

---

# 64. DEBOUNCE

Search/autosave debounce analiziraj zajedno sa cancellation-om i finalnim flush behavior-om.

---

# 65. AUTOSAVE

Scenario:

```text
edit A
↓
debounce
↓
save A starts
↓
edit B
↓
save B starts
↓
B completes
↓
A completes late
```

Da li A može prepisati B?

---

# 66. REQUEST ORDERING

Za svaki resource koji se učitava po promenljivom ID-u proveri:

```text
request A starts
request B starts
B completes
A completes
```

Da li stariji response može postati finalni state?

---

# 67. NETWORK CANCELLATION

Retrofit/OkHttp/Ktor behavior proveri prema verziji i API-ju koji se koristi.

Ne tvrdi cancellation support bez provere.

---

# 68. CANCELLATION NE ZNAČI ROLLBACK

Ako server request već stigne serveru, client coroutine cancellation ne znači da server nije izvršio mutation.

Posebno važno za write operacije.

---

# 69. UNKNOWN MUTATION OUTCOME

Scenario:

```text
POST sent
↓
server creates record
↓
connection lost before response
↓
client sees timeout
```

Client ne zna da li je operacija uspela.

Retry bez idempotency-ja može duplirati record.

---

# 70. IDEMPOTENCY

Za critical mutations proveri:

- client-generated operation ID
- idempotency key
- unique constraint
- server deduplication

gde je potrebno.

---

# 71. DOUBLE TAP

Simuliraj dve coroutine za isti button action.

Ne oslanjaj se samo na UI disable ako business consequence mora biti exactly-once.

---

# 72. RAPID STATE CHANGES

Testiraj:

- toggle brzo on/off
- multiple selection
- drag/reorder
- status update

Traži out-of-order persistence.

---

# 73. OPTIMISTIC UPDATES

Mapiraj:

```text
old local state
↓
optimistic state
↓
remote mutation
↓
success/failure
↓
reconciliation
```

Ako postoje dve concurrent optimistic mutations, proveri rollback behavior.

---

# 74. ROLLBACK RACE

Mutation A i B menjaju isti state.

Ako A padne nakon što je B uspeo, naive rollback A može poništiti i B.

---

# 75. VERSIONED STATE

Za complex concurrent edits razmotri version/revision samo ako business flow to opravdava.

---

# 76. ROOM CONCURRENCY

Room podržava concurrency, ali business logika iznad njega može imati race.

Proveri:

- transactions
- insert/update
- unique constraints
- read-modify-write

---

# 77. TRANSACTION BOUNDARY

Ako DAO metode pojedinačno imaju `@Transaction`, proveri da li ceo business operation stvarno ulazi u jednu transakciju.

---

# 78. DAO FLOW + WRITE

Flow može emitovati intermediate states između više odvojenih write-ova.

Ako UI ne sme videti partial state, koristi transaction.

---

# 79. DATABASE + NETWORK DUAL WRITE

Scenario:

```text
local DB write
↓
network write
```

ili obrnuto.

Proveri failure između koraka.

---

# 80. OFFLINE-FIRST CONCURRENCY

Ako local DB predstavlja source of truth:

- foreground refresh
- background sync
- user mutation

mogu paralelno menjati iste podatke.

Mapiraj konflikt.

---

# 81. SYNC VS USER EDIT

Scenario:

```text
sync downloads old server entity
↓
user locally edits newer value
↓
sync writes response after edit
↓
user change overwritten
```

Proveri timestamp/version model.

---

# 82. WORKMANAGER + FOREGROUND

Worker i foreground repository mogu istovremeno izvršavati istu operaciju.

---

# 83. UNIQUE WORK

Proveri da unique work rešava samo WorkManager duplikaciju, ne nužno konkurenciju sa foreground pozivom.

---

# 84. MULTIPLE WORKERS

Ako različiti work names menjaju isti data set, mogu se preklapati.

---

# 85. WORKER RETRY

WorkManager može pokrenuti posao ponovo.

Svaki worker mora biti tolerant na re-execution kada business semantics to zahtevaju.

---

# 86. PROCESS RESTART

In-memory mutex/singleton nestaje nakon process death.

Ne oslanjaj durable deduplication na njega.

---

# 87. MULTIPLE APP INSTANCES / PROCESSES

Ako isti backend može biti pozvan sa više uređaja ili procesa, client-side locking ima ograničenu moć.

---

# 88. SHARED PREFERENCES

Concurrent writes mogu imati ordering problem.

Ako se state sinhronizuje kroz SharedPreferences/DataStore, proveri semantics.

---

# 89. DATASTORE

DataStore `updateData`/`edit` daje atomic update model.

Ako code radi read van transakcije pa kasnije write, proveri race.

---

# 90. FILE WRITES

Paralelna file write operacija može:

- truncirati
- prepisati
- korumpirati sadržaj

Proveri synchronization i atomic replace.

---

# 91. TEMP FILE + RENAME

Za critical fajlove atomic temp-write + rename može biti bolji model.

Ne predlaži bez realnog corruption rizika.

---

# 92. CACHE CONCURRENCY

In-memory LRU/custom cache:

- read
- write
- eviction

proveri thread safety.

---

# 93. SINGLETON REPOSITORY

Singleton nije automatski thread-safe.

---

# 94. LAZY INITIALIZATION

Dvostruka initialization race može nastati ako custom lazy pattern nije thread-safe.

---

# 95. TOKEN REFRESH RACE

Jedan od najvažnijih mrežnih concurrency flow-ova:

```text
Request A -> 401
Request B -> 401
Request C -> 401
↓
three refresh attempts
```

Proveri:

- single-flight refresh
- waiting requests
- token rotation
- retry count

---

# 96. REFRESH TOKEN ROTATION

Ako provider rotira refresh token, concurrent refresh može invalidirati ostatak session-a.

---

# 97. AUTH STATE

Logout može konkurentno da se desi sa:

- token refresh
- API retry
- background sync

Prati ordering.

---

# 98. LOGOUT VS ACTIVE REQUEST

Scenario:

```text
User A request starts
↓
logout
↓
User B login
↓
A response returns
```

Da li A response može biti upisan u B state/cache/database?

Ovo može biti P0/P1.

---

# 99. SESSION GENERATION

Za kompleksne sisteme proveri postoji li način da async result potvrdi da pripada trenutnoj session/account generaciji.

Ne uvodi ovaj mehanizam ako nije potreban.

---

# 100. CACHE USER ISOLATION

Ako concurrent logout/login može ostaviti request-e prethodnog korisnika aktivnim, proveri cross-user state.

---

# 101. PAGINATION

Concurrent:

- refresh
- append
- filter change

mogu proizvesti duplicate ili missing items.

---

# 102. PAGING 3

Ako koristi Paging, proveri:

- invalidation
- RemoteMediator
- keys
- transaction
- refresh race

---

# 103. REMOTEMEDIATOR

Posebno proveri atomic update:

```text
remote keys
+
entities
```

u jednoj transaction boundary gde treba.

---

# 104. MEDIA

Player commands mogu dolaziti iz:

- UI
- notification
- headset
- MediaSession

više thread/context izvora.

Proveri serialization/state machine.

---

# 105. RECORDING

Start/stop recording race je high-risk.

Scenario:

```text
start
↓
stop
↓
start
```

veoma brzo.

Proveri resource ownership i terminal state.

---

# 106. CAMERA

Camera bind/unbind i lifecycle callback mogu konkurisati.

Ako feature postoji, analiziraj state machine.

---

# 107. DOWNLOAD

Parallel:

- pause
- cancel
- complete

mogu stići skoro istovremeno.

Proveri terminal state winner.

---

# 108. UPLOAD

Retry i user cancel mogu konkurisati.

Pitaj:

> Može li cancelled upload ipak završiti kao success state?

---

# 109. STATE MACHINE

Za kompleksne async feature-e napravi eksplicitna stanja.

Primer:

```text
IDLE
STARTING
RUNNING
STOPPING
COMPLETED
FAILED
CANCELLED
```

Zatim proveri dozvoljene tranzicije.

---

# 110. INVALID TRANSITIONS

Traži:

```text
STOPPING -> STARTING
```

ili dve terminalne tranzicije koje mogu nastati paralelno.

---

# 111. COMPARE-AND-SET

Ako state machine zahteva atomic transition, proveri implementaciju.

Ne preporučuj CAS ako obična single-thread confinement strategija već garantuje redosled.

---

# 112. ACTOR MODEL

Ako projekat koristi Channel/actor-like serialization, proveri:

- queue growth
- closure
- error handling

Ne predlaži actor samo zato što postoji concurrency.

---

# 113. MAIN THREAD SERIALIZATION

Neke UI state promene su prirodno serialized na Main dispatcher-u.

Ne prijavljuj race ako svi writer-i garantovano rade sekvencijalno na istom thread-u i nema suspension između read/write koraka koji omogućava interleaving.

---

# 114. SUSPENSION POINT

Važno:

Jedna coroutine na Main-u može biti interleaved sa drugom kada suspenduje.

Prati suspension points.

---

# 115. CHECK + SUSPEND + ACT

Scenario:

```text
if (!busy) {
    networkCall() // suspend
    busy = true
}
```

Druga coroutine može proći proveru dok prva suspenduje.

---

# 116. FLAG GUARDS

`isLoading`/`isSaving` boolean nije automatski thread-safe guard.

Proveri:

- kada se postavlja
- postoji li suspension pre postavljanja
- koliko writer-a postoji

---

# 117. EARLY GUARD

Scenario:

```text
if (saving) return
saving = true
try {
   ...
} finally {
   saving = false
}
```

može biti dovoljan ako se sve izvršava sekvencijalno na Main-u.

Ne komplikuj bez razloga.

---

# 118. `withContext`

Za svaki relevantan `withContext` proveri:

- dispatcher
- return
- cancellation
- nesting

---

# 119. `Dispatchers.IO`

Ne koristi ga kao univerzalno "background thread" rešenje.

Mnoge biblioteke već interno prebacuju I/O.

Ali dodatni switch je obično performance pitanje, ne bug.

---

# 120. `Dispatchers.Default`

CPU-heavy work treba proveriti ovde.

Traži previše paralelnih CPU taskova.

---

# 121. LIMITED PARALLELISM

Ako se koristi `limitedParallelism`, proveri razlog i resource koji štiti.

---

# 122. CUSTOM EXECUTOR

Ako se pretvara u CoroutineDispatcher, proveri lifecycle i shutdown.

---

# 123. EXECUTOR LEAK

Custom thread pool koji se nikad ne zatvara može biti resource leak ako nije process-lifetime nameran.

---

# 124. `runBlocking`

Svako korišćenje u Android runtime path-u detaljno analiziraj.

Posebno Main thread.

---

# 125. DEADLOCK SA `runBlocking`

Ako `runBlocking` čeka coroutine kojoj treba isti Main thread, moguć deadlock.

Dokaži execution flow.

---

# 126. BLOCKING API U COROUTINE

Coroutine ne čini blocking API neblokirajućim.

Ako se blocking I/O poziva na Main dispatcher-u, to ostaje problem.

---

# 127. THREAD AFFINITY

Neki API-ji moraju biti korišćeni sa specifičnog thread-a.

Primeri mogu uključivati određene UI/media/camera API-je.

Proveri library contract pre finding-a.

---

# 128. CALLBACK THREAD

Legacy callback možda ne dolazi na Main thread.

Ako direktno menja UI/state koji zahteva Main, proveri.

---

# 129. CALLBACK VIŠE PUTA

Nemoj pretpostaviti callback exactly once ako SDK contract to ne garantuje.

---

# 130. CALLBACK POSLE CANCEL

Ako coroutine bridge cancel-uje operation, callback i dalje može stići.

Proveri race sa continuation state-om.

---

# 131. `suspendCancellableCoroutine`

Za svaki usage proveri:

- immediate callback
- asynchronous callback
- cancellation unregister
- double resume
- exception

---

# 132. RESUME AFTER CANCEL

Continuation može već biti cancelled.

Implementacija mora poštovati API contract.

---

# 133. CALLBACKFLOW

Proveri `awaitClose`.

Ako listener nije uklonjen, može nastati leak.

---

# 134. CALLBACKFLOW CHANNEL CLOSE

Ako external API emituje nakon close-a, proveri `trySend` result handling gde je relevantno.

---

# 135. CONFLATION

Ako se koristi `conflate`, proveri da dropped intermediate values nisu business-critical.

---

# 136. DISTINCT UNTIL CHANGED

Ako equality model nije ispravan, validan update može biti potisnut.

---

# 137. MAPLATEST

Kao i collectLatest, proveri partial side effects u cancelled transformaciji.

---

# 138. FLOW BUFFER

Buffer može promeniti ordering/timing ponašanje.

Pitaj da li producer sme da nastavi bez consumer-a.

---

# 139. FLOWON

`flowOn` menja upstream context, ne downstream collector.

Traži pogrešan mentalni model.

---

# 140. UI STATE ORDERING

Ako više Flow-ova kontroliše jedan screen, combine ordering može proizvesti privremene kombinacije state-a.

Proveri da UI može bezbedno prikazati intermediate state.

---

# 141. TRANSACTIONAL SNAPSHOT

Ako screen zahteva nekoliko vrednosti koje moraju predstavljati isti trenutak, odvojeni stream-ovi mogu biti problem.

---

# 142. CACHE INVALIDATION RACE

Scenario:

```text
mutation
↓
invalidate
↓
refetch
```

Ako stari request već traje, može li njegov rezultat stići nakon novog?

---

# 143. REQUEST DEDUPLICATION

Proveri da više screen-ova ne pokreće isti expensive request paralelno ako repository treba shared single-flight behavior.

---

# 144. SINGLE-FLIGHT

Single-flight nije uvek potreban.

Relevantno za:

- token refresh
- expensive initialization
- one-time configuration

---

# 145. INITIALIZATION RACE

Scenario:

```text
Screen A -> ensureInitialized()
Screen B -> ensureInitialized()
```

Oba mogu pokrenuti isti initialization.

---

# 146. LAZY SINGLETON INIT

Ako initialization ima side effects, proveri thread safety.

---

# 147. CONFIG REFRESH

Remote config refresh koji radi paralelno sa feature read-om može dati inconsistent snapshot ako update nije atomic.

---

# 148. FEATURE FLAGS

Ako više flagova zajedno čine variant config, proveri da se menjaju kao jedna konzistentna verzija.

---

# 149. FILE IMPORT

Import i normalni CRUD mogu paralelno menjati bazu.

Proveri isolation.

---

# 150. BACKUP

Backup snapshot tokom write operacije može biti nekonzistentan ako nema transaction/snapshot mehanizam.

---

# 151. RESTORE

Restore i aktivni background workers ne treba paralelno da menjaju bazu bez koordinacije.

---

# 152. DESTRUCTIVE RESET

Reset mora koordinisati sa:

- workers
- repositories
- DB handles
- file operations

Traži post-reset resurrection starih podataka.

---

# 153. DELETE VS ACTIVE OPERATION

Scenario:

```text
resource operation running
↓
user deletes resource
↓
operation completes
↓
resource recreated or stale state written
```

---

# 154. ACCOUNT DELETE

Isto za account deletion/logout.

Background request ne sme posle uspeha vratiti obrisani private state.

---

# 155. APP START CONCURRENCY

Na startup-u često paralelno kreću:

- auth load
- DB
- remote config
- migrations
- sync

Mapiraj dependencies.

---

# 156. STARTUP RACE

Scenario:

```text
navigation decision
↓
auth still loading
```

ili:

```text
UI reads DB
↓
migration/sync still replacing data
```

---

# 157. DATASTORE INIT

Ako preferences određuju navigation/theme/auth, proveri initial unknown state umesto prerane default odluke.

---

# 158. ERROR STATE RACE

Request A failure može upisati error nakon request B success-a.

Scenario:

```text
A starts
B starts
B success
A failure
```

Finalni UI može pogrešno pokazati error.

---

# 159. LOADING STATE RACE

Jedan boolean za više request-ova:

```text
A starts -> loading=true
B starts -> loading=true
A ends -> loading=false
B still running
```

Traži ovakav obrazac.

---

# 160. ACTIVE REQUEST COUNT

Ne uvodi counter automatski, ali razmotri odgovarajući model ako više paralelnih request-ova deli loading indikator.

---

# 161. REQUEST ID / GENERATION

Za "latest wins" feature proveri postoji li:

- cancellation
- generation token
- resource ID verification

koji sprečava stale result.

---

# 162. LATEST-WINS VS ALL-MUST-COMPLETE

Svaki feature klasifikuj.

Search često želi latest-wins.

Batch upload želi all-must-complete.

Ne koristi isti concurrency model za oba.

---

# 163. FIRST-WINS

Neki feature možda žele prvi validan rezultat od više source-ova.

Proveri cancellation ostatka ako je potrebno.

---

# 164. FAN-OUT / FAN-IN

Za paralelne request-ove proveri:

- partial failure
- cancellation
- aggregation
- timeout

---

# 165. `awaitAll`

Ako jedan async padne, proveri šta se događa sa ostalima i da li to odgovara business semantici.

---

# 166. SUPERVISOR SCOPE

Ako partial success treba biti prihvaćen, supervisor može biti smislen.

Ali onda mora postojati eksplicitno error handling za svaki child.

---

# 167. TIMEOUT

Ako se koristi `withTimeout`, proveri šta cancellation znači za underlying side effect.

---

# 168. `withTimeoutOrNull`

Null može izgubiti razliku između:

- timeout
- legitimate null result

ako domain takođe dozvoljava null.

---

# 169. NETWORK TIMEOUT + COROUTINE TIMEOUT

Dva timeout sloja mogu imati različite vrednosti i error tipove.

Proveri consistency.

---

# 170. RETRY + TIMEOUT

Izračunaj worst-case trajanje ako je moguće:

```text
timeout
x
attempts
+
backoff
```

Ne izmišljaj broj ako config nije poznat.

---

# 171. CANCELLATION SAFE UI

`finally` block koji uvek radi:

```kotlin
_loading.value = false
```

može biti ispravan.

Ali proveri da drugi paralelni request još ne koristi isti loading state.

---

# 172. PROGRESS

Ako više parallel taskova ažurira jedan progress, proveri atomic aggregation.

---

# 173. PERCENTAGE

Ne dozvoli da late progress callback spusti progress sa 90% na 30% zbog stale task-a.

---

# 174. DOWNLOAD QUEUE

Ako postoji queue, proveri:

- concurrency limit
- cancellation
- resume
- duplicate ID
- terminal state

---

# 175. SEMAPHORE

Ako se koristi za concurrency limit, proveri permit release u failure/cancellation scenariju.

---

# 176. PERMIT LEAK

Permit koji se ne vrati u `finally` može trajno blokirati queue.

---

# 177. STARVATION

Priority ili unfair queue može teoretski izgladneti task.

Prijavi samo ako implementation stvarno omogućava praktičan problem.

---

# 178. ORDERING

Ako user očekuje FIFO, proveri da concurrency layer ne izvršava stvari proizvoljnim redom.

---

# 179. BATCH OPERATIONS

Za batch update proveri:

- partial success
- retry
- rollback
- duplicate

---

# 180. TRANSACTION + REMOTE

DB transaction ne može obuhvatiti remote server call na klasičan način.

Nemoj držati DB transaction otvoren tokom sporog network-a bez veoma jakog razloga.

---

# 181. OUTBOX PATTERN

Za reliable local-to-server sync razmotri outbox samo ako architecture/problem to opravdava.

Ne preporučuj enterprise pattern malom jednostavnom feature-u bez potrebe.

---

# 182. INBOX / DEDUP

Za server events/websocket sync proveri duplicate delivery.

---

# 183. WEBSOCKET

Concurrent:

- reconnect
- old socket message
- new socket message

mogu napraviti stale event problem.

---

# 184. CONNECTION GENERATION

Ako se socket reconnectuje, proveri da old connection callback ne može da menja novi state.

---

# 185. POLLING

Poll request može preklapati sledeći interval ako traje duže od intervala.

---

# 186. FIXED DELAY VS FIXED RATE

Ako polling koristi loop:

```text
request
↓
delay
```

ne preklapa se isto kao nezavisni timers.

Proveri stvarnu implementaciju.

---

# 187. APP BACKGROUND

Poll/Flow može nastaviti u background-u ako scope ostaje aktivan.

Proceni da li je to namerno.

---

# 188. TESTOVI

Pregledaj concurrency test coverage.

Traži samo happy-path testove.

---

# 189. `runTest`

Proveri korišćenje kotlinx.coroutines test API-ja.

---

# 190. STANDARDTESTDISPATCHER

Virtual time može učiniti ordering determinističnim, ali test mora eksplicitno napredovati scheduler gde treba.

---

# 191. UNCONFINEDTESTDISPATCHER

Može sakriti određene ordering probleme zbog eager execution-a.

Ne proglašavaj ga lošim po definiciji.

---

# 192. REAL DISPATCHERS U TESTU

Ako code hardcoduje `Dispatchers.IO/Main/Default`, testability može biti slabija.

Ali finding zavisi od toga da li testovi postaju nondeterministični ili teški za izolaciju.

---

# 193. RACE TEST

Za svaki serious race finding predloži determinističan test.

Ne koristi samo:

```text
Thread.sleep(100)
```

ako možeš kontrolisati scheduler/deferred responses.

---

# 194. CONTROLLED DEFERRED

Dobar race test može:

```text
start A
start B
complete B
complete A
assert final state
```

To direktno testira out-of-order behavior.

---

# 195. STRESS TEST

Za shared mutable state može biti koristan repeated stress test.

Ali stress test nije zamena za determinističan reproduction.

---

# 196. TURBINE

Ako projekat koristi Turbine ili sličan Flow test helper, proveri emissions i cancellation.

Ne zahtevaj biblioteku samo radi trenda.

---

# 197. WORKMANAGER TEST

Za worker concurrency proveri retries, duplicate scheduling i unique work semantics.

---

# 198. ROOM CONCURRENCY TEST

Koristi realniju DB/in-memory Room test bazu gde je potrebno da se potvrde constraints/transactions.

---

# 199. NETWORK MOCK

MockWebServer ili ekvivalent može kontrolisati:

- delays
- response order
- disconnect
- timeout

ako projekat koristi odgovarajući stack.

---

# 200. FINDING FORMAT

Za svaki ozbiljan finding:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Module:
File:
Function/Class:

Coroutine owner:
Scope:
Dispatcher:
Shared resource/state:

Problem:

Evidence:

Concurrency Timeline:

T0:
T1:
T2:
T3:

Expected result:

Actual possible result:

Cancellation behavior:

Data impact:

User impact:

Root cause:

Recommended remediation:

Regression test:

Runtime verification:

Complexity:
XS / S / M / L / XL
```

---

# 201. CONCURRENCY TIMELINE

Za race condition obavezno koristi precizan timeline.

Primer:

```text
T0 - request A starts for query "cat"
T1 - request B starts for query "dog"
T2 - B completes and writes dog results
T3 - A completes and overwrites state with cat results
```

Bez realnog event ordering-a nemoj zvati nešto race condition-om.

---

# 202. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-user data exposure
- catastrophic corruption
- duplicate financial/irreversible critical action
- concurrency flaw koji ruši security invariant

## P1 - HIGH

- data loss
- ozbiljan duplicate mutation
- session corruption
- deadlock glavnog flow-a
- major stale overwrite
- concurrency bug koji redovno kvari critical feature

## P2 - MEDIUM

- realan race/cancellation problem ograničenijeg scope-a
- inconsistent UI/data sa workaround-om

## P3 - LOW

- edge-case concurrency problem
- manje resource/contention ponašanje

## P4 - IMPROVEMENT

- bolji concurrency design bez potvrđenog buga

---

# 203. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

race je direktno dokaziv code flow-om ili testom.

MEDIUM:

više async path-ova može konkurisati, ali runtime reprodukcija nedostaje.

LOW:

scenario zavisi od nepoznatog threading/library ponašanja.

---

# 204. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 205. NE PRIJAVLJUJ "MOGUĆ RACE" BEZ TIMELINE-A

Ako ne možeš da pokažeš:

```text
A
B
interleaving
incorrect result
```

nalaz nije potvrđen race.

---

# 206. NE KORISTI MUTEX KAO UNIVERZALNI FIX

Preporuka mora razmotriti:

- single-thread confinement
- atomic update
- DB constraint
- transaction
- idempotency
- cancellation
- state machine
- request generation

Izaberi najjednostavnije rešenje koje odgovara root cause-u.

---

# 207. NE SERIALIZUJ SVE

Previše zaključavanja može:

- povećati latency
- napraviti deadlock
- blokirati unrelated work

Concurrency treba smanjiti samo gde postoji shared invariant/resource.

---

# 208. NE MENJAJ KOD

Tokom audita:

- ne dodaj Mutex
- ne menjaj scope
- ne menjaj dispatcher
- ne prepisuj Flow
- ne uvodi Channel
- ne dodaj retry
- ne menjaj WorkManager policy

Prvo završi audit.

---

# 209. OUTPUT - ANDROID_COROUTINES_CONCURRENCY_AUDIT.md

Finalni rezultat strukturiraj:

## 1. Executive Summary

- coroutine architecture
- scope model
- najveći race rizici
- cancellation safety
- shared-state model

## 2. Coroutine Scope Map

| Scope | Owner | Work | Lifetime | Risk |
|---|---|---|---|---|

## 3. Dispatcher Map

## 4. Shared Mutable State Inventory

## 5. StateFlow / SharedFlow Audit

## 6. Flow Operator Audit

## 7. Cancellation Audit

## 8. Structured Concurrency Audit

## 9. Race Condition Audit

## 10. Mutex / Lock Audit

## 11. Deadlock Audit

## 12. Network Concurrency

## 13. Token Refresh Concurrency

## 14. Room / Database Concurrency

## 15. Offline / Sync Concurrency

## 16. WorkManager Concurrency

## 17. Resource State Machines

## 18. Logout / Account Switching Concurrency

## 19. Retry / Idempotency Audit

## 20. Test Coverage

## 21. Findings Summary

| ID | Severity | Category | Shared resource | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P0 Findings

## 23. P1 Findings

## 24. P2 Findings

## 25. P3 Findings

## 26. P4 Improvements

## 27. Things Done Well

## 28. Unknown / Not Verified

## 29. Remediation Roadmap

---

# 210. RACE CONDITION MATRIX

Za glavne feature-e:

| Feature | Operation A | Operation B | Shared state/resource | Safe? | Evidence |
|---|---|---|---|---|---|

Primeri:

- refresh vs refresh
- refresh vs edit
- save vs save
- sync vs user edit
- logout vs request
- start vs stop
- delete vs background work

---

# 211. CANCELLATION MATRIX

| Operation | Owner | Cancellation trigger | Partial side effects | Safe? |
|---|---|---|---|---|

---

# 212. IDEMPOTENCY MATRIX

| Mutation | Retry possible | Duplicate consequence | Protection | Status |
|---|---|---|---|---|

---

# 213. STATE MACHINE MATRIX

Za complex async feature:

| From | Event | To | Allowed | Atomic |
|---|---|---|---|---|

Traži dve konkurentne tranzicije iz istog state-a.

---

# 214. SECOND PASS - OUT-OF-ORDER ATTACK

Za svaku async funkciju pretpostavi:

> Response-i se vraćaju najgorim mogućim redosledom.

Testiraj:

```text
A starts
B starts
C starts
C finishes
B finishes
A finishes
```

Pitaj:

> Da li finalni state predstavlja najnoviju korisničku nameru?

---

# 215. SECOND PASS - DOUBLE ACTION

Za svaku write operaciju simuliraj:

```text
tap
tap
tap
```

u kratkom intervalu.

Proveri:

- local DB
- remote API
- queue
- notification
- final state

---

# 216. SECOND PASS - CANCELLATION

Za svaku suspend operaciju mentalno ubaci cancellation posle svakog važnog koraka:

```text
step 1
CANCEL

step 1
step 2
CANCEL

step 1
step 2
step 3
CANCEL
```

Pitaj:

> Da li sistem ostaje konzistentan?

---

# 217. SECOND PASS - LOGOUT

Najvažniji account race:

```text
User A request starts
↓
logout
↓
User B login
↓
A request finishes
```

Ponovo proveri:

- StateFlow
- Room
- cache
- files
- notification
- navigation

---

# 218. SECOND PASS - PROCESS DEATH

Pitaj:

> Koju concurrency zaštitu gubimo kada process nestane?

Primer:

- Mutex
- in-memory flag
- singleton queue

Ako je zaštita potrebna za durable/global invariant, možda je na pogrešnom sloju.

---

# 219. SECOND PASS - BACKGROUND WORK

Simuliraj:

```text
foreground operation running
↓
app backgrounds
↓
WorkManager starts similar operation
```

Proveri shared state.

---

# 220. SECOND PASS - SLOW SERVER

Pretpostavi da svaka mrežna operacija traje 30 sekundi.

To povećava prozor za:

- duplicate tap
- logout
- navigation
- refresh
- retry
- process background

Ponovi critical flows.

---

# 221. SECOND PASS - FAILURE AFTER SIDE EFFECT

Najvažniji distributed systems scenario:

```text
server side effect succeeds
↓
response lost
↓
client sees error
```

Pitaj:

> Šta retry radi?

---

# 222. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svaki race ima precizan event timeline
- nisi prijavio race samo zato što postoje dve coroutine
- cancellation nije pomešana sa failure-om
- `CancellationException` handling je provereno
- svaki Mutex ima proverenu scope/granularity semantiku
- client-side locking nije predstavljeno kao server/global zaštita
- retry write operacija proverava idempotency
- StateFlow multi-writer behavior je analiziran
- loading/error race nije ignorisan
- logout/account switching je uključen
- Room transactions i constraints su provereni
- WorkManager re-execution je uzet u obzir
- process death uklanja in-memory concurrency guards
- performance optimizacija nije predstavljena kao correctness bug
- deadlock finding ima stvaran lock ordering scenario
- remediation ne uvodi nepotrebnu serializaciju

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite structured concurrency, Mutex i Dispatchers.IO.

To nije concurrency audit.

Tražim probleme poput:

```text
Request A starts for account A
↓
user logs out
↓
account B logs in
↓
request A completes
↓
repository writes response into global user cache
↓
account B sees A data
```

ili:

```text
save version 1 starts
↓
save version 2 starts
↓
version 2 reaches server first
↓
version 1 reaches server second
↓
older state overwrites newer state
```

ili:

```text
three API requests receive 401
↓
three token refresh coroutine-a start
↓
first refresh rotates token
↓
other two refresh requests use invalidated token
↓
session is logged out
```

ili:

```text
worker reads "not synced"
↓
foreground code also reads "not synced"
↓
both send create request
↓
server creates two records
```

ili:

```text
coroutine catches Exception
↓
CancellationException is swallowed
↓
screen is destroyed
↓
coroutine continues retry loop
↓
old screen operation keeps running
```

ili:

```text
Request A starts
↓
Request B starts
↓
B succeeds
↓
UI shows correct new data
↓
A fails later
↓
shared error state becomes error
↓
UI replaces valid B result with stale error
```

To su concurrency problemi koje treba da tražiš.

Razmišljaj kroz:

- ownership
- interleaving
- ordering
- shared state
- cancellation
- retries
- idempotency
- atomicity
- transaction boundaries
- process boundaries
- account boundaries

Za svaki ozbiljan nalaz odgovori:

> Koje dve ili više operacija mogu da se preklapaju?

> Koji state ili resource dele?

> Kojim redosledom moraju da se izvrše da bi problem nastao?

> Koji mehanizam trenutno sprečava ili ne sprečava taj scenario?

Ako nema konkretnog odgovora:

**NOT VERIFIED.**

Ako postoji samo teoretski concurrency improvement bez realnog failure-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih race condition-a sa preciznim timeline-om nego 50 generičkih upozorenja o thread safety-ju.

Cilj je dobiti forenzički precizan concurrency audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- determinističnu reprodukciju
- concurrency regression test
- atomicity/idempotency fix
- runtime verification
- production-safe concurrency model
