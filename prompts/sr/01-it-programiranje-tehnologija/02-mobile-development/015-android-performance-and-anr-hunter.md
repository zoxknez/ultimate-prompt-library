---
id: UPL-IT-015
number: 15
slug: android-performance-and-anr-hunter
title: Lov na probleme performansi i ANR u Android aplikacijama
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# LOV NA PROBLEME PERFORMANSI I ANR U ANDROID APLIKACIJAMA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu performansi kompletne Android aplikacije, sa posebnim fokusom na ANR, main-thread blocking, UI jank, startup, memory pressure i spore critical user flow-ove.

Glavni cilj:

> Pronaći konkretna mesta gde aplikacija može da postane spora, da zamrzne UI, preskače frame-ove, troši previše memorije, nepotrebno opterećuje CPU/GPU ili upadne u ANR, i razlikovati stvarne performance probleme od običnih mikro-optimizacija.

Ovo nije:

- generički "optimizuj performanse" checklist
- savet da se sve prebaci na background thread
- automatsko dodavanje coroutine-a
- lov na svaku alokaciju
- proglašavanje svake recomposition-e problemom
- nasumično dodavanje cache-a
- automatsko uvođenje Baseline Profiles
- zaključivanje iz debug build-a
- izmišljanje benchmark rezultata

Fokus je na:

- stvarnom critical path-u
- stvarnom thread-u na kome se rad izvršava
- frekvenciji operacije
- količini podataka
- lifecycle kontekstu
- production behavior-u
- merljivom user impact-u

Prioritet:

**ANR risk > user-blocking latency > jank > startup > memory pressure > CPU/battery > mikro-optimizacija**

Ako problem nije izmeren, jasno razlikuj:

**MEASURED PROBLEM**

od:

**CODE-LEVEL PERFORMANCE RISK**

---

# 1. UTVRDI PERFORMANCE KONTEKST

Pre nalaza utvrdi:

- Android Gradle Plugin
- Kotlin
- minSdk
- targetSdk
- Compose ili Views
- Coroutines
- Room
- network stack
- image loader
- Media3 ako postoji
- WorkManager
- services
- dependency injection
- analytics/crash SDK-ove
- build types
- R8/minification
- Baseline Profiles
- Macrobenchmark
- startup library

Ne analiziraj performance koristeći pogrešne pretpostavke o stack-u.

---

# 2. RAZDVOJI DEBUG I RELEASE

Debug build može biti mnogo sporiji.

Posebno kod:

- Compose
- logging
- debuggers
- inspectors
- StrictMode
- unoptimized bytecode

Ne tvrdi:

> ovaj screen je spor

samo zato što je debug build spor.

Ako release behavior nije testiran:

**RELEASE PERFORMANCE: NOT VERIFIED**

---

# 3. NAPRAVI PERFORMANCE MAPU

Za svaki critical user flow napravi:

```text
User action
↓
UI handler
↓
ViewModel
↓
Repository
↓
Database / Network / CPU work
↓
State update
↓
UI render
```

Zatim označi:

- Main thread
- IO
- Default
- worker
- unknown

Cilj je pronaći gde korisnik realno čeka.

---

# 4. KRITIČNI USER FLOW-OVI

Identifikuj najvažnije:

- app startup
- login
- home/dashboard
- list loading
- search
- detail open
- save/edit
- file import/export
- media playback
- sync
- navigation

Ne optimizuj sekundarne feature-e pre critical flow-a.

---

# 5. ANR MODEL

ANR nije samo "spora aplikacija".

Traži situacije gde glavni thread predugo ne može da obrađuje:

- input
- lifecycle
- broadcast
- service callbacks
- system interaction

Ne tvrdi ANR bez realnog blocking scenario-a.

---

# 6. MAIN THREAD INVENTORY

Repository-wide identifikuj operacije koje mogu da se izvrše na Main thread-u.

Traži:

- database
- file IO
- network
- parsing
- encryption
- compression
- bitmap processing
- large sorting/filtering
- blocking locks
- `runBlocking`
- synchronous SDK initialization

---

# 7. `runBlocking`

Svako korišćenje u runtime Android kodu analiziraj.

Posebno:

```text
Main thread
↓
runBlocking
↓
suspend/blocking operation
```

Može biti ozbiljan ANR rizik.

---

# 8. SYNCHRONOUS DATABASE

Proveri:

- Room query
- raw SQLite
- DAO
- migration

koji može da blokira Main.

Ako Room API vraća suspend/Flow, ne pretpostavljaj Main-thread problem.

---

# 9. `allowMainThreadQueries`

Ako postoji, utvrdi da li se koristi samo u testu ili production-u.

Production usage analiziraj detaljno.

---

# 10. FILE I/O

Traži:

- readText
- writeText
- FileInputStream
- FileOutputStream
- ZIP
- backup
- import/export

u UI thread path-u.

---

# 11. JSON PARSING

Veliki JSON može blokirati CPU.

Pitaj:

- koliki payload može biti
- gde se parse-uje
- koliko često

---

# 12. SERIALIZATION

Serialization velikog modela može biti jednako skupa kao parsing.

Posebno kod:

- backup
- export
- IPC
- saved state

---

# 13. CRYPTO

Encryption/hash/password derivation može biti CPU-intensive.

Proveri dispatcher/thread.

---

# 14. COMPRESSION

ZIP/GZIP/media compression ne treba izvršavati na Main thread-u.

---

# 15. BITMAP PROCESSING

Traži:

- decode
- resize
- rotate
- blur
- encode

na UI thread-u.

---

# 16. PDF

Ako app:

- generiše
- renderuje
- parsira

PDF, proveri threading i memory.

---

# 17. NETWORK

Moderni network stack uglavnom radi async, ali proveri:

- synchronous `.execute()`
- custom blocking wrapper
- `runBlocking`

---

# 18. DNS / CONNECT LATENCY

Network nije ANR ako Main thread nije blokiran.

Ne prijavljuj sporu mrežu kao ANR bez blocking path-a.

---

# 19. LOCKS

Traži:

- `synchronized`
- ReentrantLock
- Mutex
- semaphore

koji mogu blokirati Main.

---

# 20. MAIN THREAD WAITS FOR WORKER

Scenario:

```text
Main
↓
wait/latch/future.get
↓
worker
```

Time background work postaje Main-thread blocking.

---

# 21. COUNTDOWNLATCH

Svako čekanje sa `CountDownLatch.await()` u Android UI path-u analiziraj.

---

# 22. FUTURE.GET

Isto.

---

# 23. THREAD.JOIN

Isto.

---

# 24. BUSY WAIT

Traži loop koji čeka state bez suspension-a.

---

# 25. SLEEP

`Thread.sleep` na Main-u je direktan performance signal.

---

# 26. STARTUP MAP

Razloži startup:

```text
process creation
↓
Application
↓
ContentProviders
↓
SDK init
↓
Activity
↓
first frame
↓
usable screen
```

---

# 27. APPLICATION.ONCREATE

Mapiraj sve što se inicijalizuje.

Klasifikuj:

```text
REQUIRED BEFORE FIRST FRAME
CAN BE DEFERRED
LAZY
NOT VERIFIED
```

---

# 28. CONTENT PROVIDERS

Neke biblioteke koriste automatic initialization kroz provider.

To može raditi pre `Application.onCreate`.

Proveri Startup library i manifest merge.

---

# 29. THIRD-PARTY SDK STARTUP

Traži:

- analytics
- ads
- crash
- remote config
- social
- attribution

Ne odlaži SDK naslepo.

Utvrdi da li je potreban pre prvog ekrana.

---

# 30. DATABASE STARTUP

Otvaranje velike baze ili migracije mogu povećati cold start.

---

# 31. DATABASE MIGRATION

Posebno analiziraj skupe migration operacije:

- table copy
- large update
- index creation

Ako user mora čekati na startup-u, dokumentuj.

---

# 32. SYNCHRONOUS MIGRATION

Room migration se mora završiti pre otvaranja baze.

Proceni stvarnu veličinu podataka pre severity-ja.

---

# 33. COLD START

Ako možeš meriti:

- process start do first frame
- process start do fully usable

Ako ne:

**COLD START: NOT MEASURED**

---

# 34. WARM START

Odvoji od cold start-a.

---

# 35. HOT START

Odvoji i hot start.

Ne mešaj metrike.

---

# 36. TIME TO FIRST FRAME

Ako tooling postoji, meri.

Ne izmišljaj vrednosti.

---

# 37. TIME TO FULLY DRAWN

Ako app može pouzdano označiti kada je stvarno spremna za korišćenje, analiziraj.

---

# 38. SPLASH SCREEN

Splash ne popravlja startup performance.

Može samo sakriti ili vizuelno organizovati čekanje.

Traži stvarni posao iza splash-a.

---

# 39. ARTIFICIAL SPLASH DELAY

Ako postoji fixed delay koji korisnika tera da čeka duže nego što mora, prijavi.

---

# 40. INITIAL DATA LOAD

Ako app blokira first screen dok čeka:

- config
- auth
- DB
- network

utvrdi šta je zaista potrebno pre prikaza.

---

# 41. PARALLEL STARTUP

Ne paralelizuj sve naslepo.

Mapiraj dependency između init taskova.

---

# 42. LAZY INITIALIZATION

Kandidat su resursi koji se koriste tek kasnije.

Ali lazy init može prebaciti zastoj sa startup-a na prvi feature use.

Dokumentuj tradeoff.

---

# 43. FIRST-USE JANK

Feature koji se prvi put otvori može inicijalizovati tešku biblioteku.

Pitaj:

> Da li je bolje platiti trošak na startup-u ili pri prvom korišćenju?

Ne odlučuj bez konteksta.

---

# 44. UI JANK

Traži frame u kome Main thread radi previše posla.

Mogući uzroci:

- heavy composition
- layout
- draw
- list binding
- image decode
- synchronous logic

---

# 45. FRAME BUDGET

Nemoj koristiti rigidnu jednu vrednost kao univerzalnu bez razumevanja refresh rate-a.

Bitno je da aplikacija redovno završava frame pre sledećeg display deadline-a.

---

# 46. COMPOSE RECOMPOSITION

Ne prijavljuj broj recomposition-a sam po sebi.

Pitaj:

- šta se recomponuje
- koliko je skupo
- koliko često
- da li vodi u jank

---

# 47. EXPENSIVE COMPOSABLE BODY

Traži:

- sorting
- filtering
- parsing
- formatiranje velikih dataset-a
- allocations

direktno u composition-u.

---

# 48. STATE BLAST RADIUS

State promena visoko u Compose tree-u može invalidirati veliki subtree.

Proceni actual cost.

---

# 49. COMPOSITIONLOCAL

Često menjana CompositionLocal vrednost visoko u tree-u može izazvati mnogo recomposition-a.

---

# 50. UNSTABLE TYPES

Ne prijavljuj instability bez merenog ili jasno dokazivog recomposition impact-a.

---

# 51. COMPOSE COMPILER METRICS

Ako su dostupne, koristi ih.

Ali:

**unstable != automatically slow**

---

# 52. LAYOUT

Kompleksni nested layout-i mogu biti skupi.

Posebno:

- intrinsic measurements
- nested weights
- custom layout

Ali zahtevaj hotspot evidence.

---

# 53. INTRINSIC MEASUREMENTS

Ako se koriste često u velikoj listi, proveri performance.

---

# 54. SUBCOMPOSE

Komponente zasnovane na SubcomposeLayout-u mogu imati dodatni cost.

Ne prijavljuj standardnu Material komponentu samo zato što koristi subcomposition.

---

# 55. LAZY LISTS

Proveri:

- key
- content type
- heavy item
- nested scrolling
- image loading

---

# 56. PREVELIK ITEM TREE

Ako svaki list item ima ogroman UI tree, scrolling može jankovati.

---

# 57. NESTED LAZYCOLUMN

Traži problematic nested same-direction scrolling.

---

# 58. COLUMN UMESTO LAZY

Ako se renderuju stotine ili hiljade elemenata u običnom Column-u, to može biti ozbiljan problem.

Ali proveri realnu veličinu liste.

---

# 59. XML VIEW HIERARCHY

Ako app koristi Views:

- duboko nesting
- weights
- repeated inflation
- custom onDraw

---

# 60. RECYCLERVIEW

Proveri:

- `notifyDataSetChanged`
- DiffUtil
- view holder binding
- nested RecyclerView
- shared recycled pool

Ne prijavljuj `notifyDataSetChanged` ako lista ima 3 item-a i update je redak.

---

# 61. BIND WORK

`onBindViewHolder` ne treba da radi skupe:

- parsing
- DB
- bitmap
- network

operacije.

---

# 62. VIEW INFLATION

Veliki kompleksni layout može praviti jank pri kreiranju mnogo ViewHolder-a.

---

# 63. TEXT

Veliki tekst i kompleksni spans mogu biti skupi.

Proveri samo concrete hotspots.

---

# 64. MARKDOWN / HTML RENDER

Ako lista renderuje Markdown/HTML po svakom item-u, proveri caching/preprocessing.

---

# 65. SYNTAX HIGHLIGHTING

Code editor/viewer može imati ozbiljan CPU cost.

---

# 66. IMAGE LOADING

Mapiraj image pipeline:

```text
URL/file
↓
decode
↓
resize
↓
cache
↓
display
```

---

# 67. ORIGINAL SIZE

Ako thumbnail traži full-resolution decode, memory i CPU mogu biti nepotrebno veliki.

---

# 68. IMAGE CACHE

Proveri postojeći library cache pre custom preporuka.

---

# 69. PLACEHOLDER

Placeholder ne popravlja performance, ali može poboljšati perceived performance.

Odvoji UX od runtime cost-a.

---

# 70. LARGE BITMAP

Izračunaj približan decoded memory samo ako dimenzije postoje.

Ne nagađaj.

---

# 71. OOM RISK

Prijavi OOM samo uz realan allocation/growth scenario.

---

# 72. MEMORY INVENTORY

Mapiraj velike ili dugotrajne:

- bitmaps
- lists
- caches
- buffers
- media
- WebViews
- players

---

# 73. MEMORY LEAK

Leak je i performance problem jer povećava GC pressure i eventualno OOM.

Ali ne prijavljuj reference bez dokazivog dužeg lifetime-a.

---

# 74. ACTIVITY LEAK

Traži Activity reference u process-lifetime objektu.

---

# 75. FRAGMENT VIEW LEAK

Proveri binding/listener.

---

# 76. WEBVIEW

WebView može trošiti značajnu memoriju.

Proveri ownership i destroy.

---

# 77. PLAYER

Media player resource mora imati jasan lifecycle.

---

# 78. LIST CACHE

In-memory cache bez limita može rasti sa svakim otvorenim item-om.

---

# 79. FLOW CACHE

`stateIn/shareIn` sa dugim scope-om može zadržavati velike poslednje vrednosti.

---

# 80. VIEWMODEL MEMORY

ViewModel može držati velike liste mnogo duže od screen-a ako je scoped previsoko.

---

# 81. GC PRESSURE

Traži high-frequency alokacije u:

- rendering
- scroll
- animation
- audio/video callbacks

---

# 82. OBJECT CREATION U DRAW

Custom draw koji alocira Paint/Path/Bitmap pri svakom frame-u može biti hotspot.

---

# 83. STRING FORMATTING

High-frequency string allocation u per-frame callback-u proveri.

Ne mikro-optimizuj obične UI render-e.

---

# 84. CPU-HEAVY WORK

Traži:

- sorting huge dataset-a
- cryptography
- compression
- transcoding
- ML inference
- image processing

---

# 85. DEFAULT DISPATCHER

CPU-heavy coroutine tipično pripada CPU dispatcher-u, ali proveri library internal threading.

---

# 86. TOO MUCH PARALLELISM

`Dispatchers.Default` nije beskonačan.

Ako app pokrene veliki broj CPU-heavy jobs, mogu konkurisati UI procesu za CPU.

---

# 87. IO SATURATION

Veliki broj IO tasks može:

- opteretiti storage
- database
- network
- memory

Proveri concurrency limit gde resource ima prirodno ograničenje.

---

# 88. THREAD EXPLOSION

Custom executor ili thread-per-task može napraviti mnogo thread-ova.

---

# 89. BATTERY VS PERFORMANCE

Brže nije uvek bolje.

Aggressive polling/background refresh može poboljšati freshness uz cenu baterije.

Dokumentuj tradeoff.

---

# 90. NETWORK CHATTER

Mapiraj broj request-ova za jedan screen.

Traži:

- duplicate fetch
- N+1
- per-item request
- redundant refresh

---

# 91. DUPLICATE FETCH

Compose/View lifecycle restart može ponoviti network request.

Proveri cache/repository semantics.

---

# 92. SEARCH

Search bez debounce/cancellation može generisati mnogo request-ova.

Proceni prema API cost-u i UX-u.

---

# 93. API PAYLOAD

Veliki JSON:

- download
- parse
- allocations

Analiziraj polja koja app stvarno koristi.

---

# 94. COMPRESSION

HTTP compression uglavnom rešava server/network layer.

Ne implementiraj ručno u Android client-u bez potrebe.

---

# 95. CONNECTION POOLING

OkHttp/Ktor to obično rešavaju.

Ne prijavljuj missing custom pooling.

---

# 96. DATABASE QUERY PERFORMANCE

Identifikuj query-e na critical path-u.

Traži:

- full table scan
- missing index
- large JOIN
- N+1
- sorting
- loading cele tabele

---

# 97. `SELECT *`

Nije automatski problem.

Relevantno je ako entity ima mnogo teških kolona ili UI koristi mali subset na velikom dataset-u.

---

# 98. ROOM FLOW INVALIDATION

Jedan write može triggerovati query i re-emission.

Proveri da skupi query ne radi prečesto.

---

# 99. N+1 ROOM

Scenario:

```text
load 500 rows
↓
for each row query relation/count
```

Pronađi stvarni DAO flow.

---

# 100. DATABASE INDEX

Ne preporučuj index bez analize query-ja i write cost-a.

---

# 101. LARGE TRANSACTION

Velika transaction može dugo držati DB lock.

Proveri:

- imports
- sync
- backup restore

---

# 102. DATABASE CONTENTION

Foreground i worker mogu istovremeno raditi teške write/query operacije.

---

# 103. PAGINATION

Ako UI prikazuje veoma veliki dataset, proveri da li sve učitava odjednom.

---

# 104. PAGING

Paging je kandidat tek kada dataset i UX opravdavaju.

---

# 105. DATA TRANSFORMATION

Repository/ViewModel može više puta mapirati velike liste.

Pronađi repeated identical transformations.

---

# 106. SORTING

Ako se ista velika lista sortira pri svakoj Flow emisiji/recomposition-i, proveri cost.

---

# 107. FILTERING

Isto.

---

# 108. DISTINCT

Ako upstream emituje isti veliki state često, proveri equality i redundant processing.

---

# 109. FLOW CHAIN

Mapiraj:

```text
Room Flow
↓
map
↓
combine
↓
sort
↓
filter
↓
stateIn
↓
UI
```

Utvrdi gde je najveći computation.

---

# 110. `combine`

Česta promena jednog malog source-a može ponovo pokrenuti veliki transformation nad drugim source-om.

---

# 111. MAIN THREAD FLOW OPERATORS

Flow operatori rade na context-u upstream-a prema stvarnoj chain semantici.

Proveri da expensive mapping nije na Main.

---

# 112. `flowOn`

Ne pretpostavljaj pogrešno downstream behavior.

---

# 113. STATEFLOW CONFLATION

StateFlow može preskočiti intermediate state koji je semantički isti prema equality-ju.

To je correctness tema osim ako utiče na performance.

---

# 114. UI STATE GRANULARITY

Ogroman UiState promenjen zbog jednog malog polja može triggerovati širi UI update.

Proveri actual render cost pre finding-a.

---

# 115. ANIMATION

Traži:

- infinite animations
- large blur
- expensive custom draw
- multiple alpha/layer operations

---

# 116. HARDWARE LAYERS

Ne forsiraj `graphicsLayer` kao optimizaciju bez profiling-a.

Može povećati memory.

---

# 117. SHADOWS / BLUR

Complex visual effects mogu biti skupi na slabijim GPU uređajima.

Potreban je runtime evidence ili jasan hotspot.

---

# 118. OVERDRAW

Ako UI crta više velikih opaque background-a preko cele površine, proveri GPU overdraw samo gde je relevantno.

---

# 119. CLIPPING

Complex clipping/path može povećati GPU cost.

Ne mikro-optimizuj jednostavan rounded rectangle.

---

# 120. VIDEO

Ako postoji playback, proveri:

- decoder
- resolution
- surface
- buffering
- lifecycle

Ne zaključuj o codec performance-u bez device/test podataka.

---

# 121. AUDIO

Audio processing callbacks moraju biti veoma laki ako se izvršavaju u real-time kontekstu.

---

# 122. MEDIA BUFFERING

Network buffering nije isto što i UI performance.

Ali može biti user-perceived latency.

---

# 123. WEBVIEW PERFORMANCE

Ako WebView učitava kompleksan sadržaj:

- creation
- reuse
- JS
- caching

mogu imati veliki impact.

---

# 124. MAPS

Map SDK može biti GPU/memory-heavy.

Proveri da se mapa ne kreira više puta nepotrebno.

---

# 125. CAMERA

Camera preview/image processing može imati:

- frame backlog
- CPU pressure
- buffer leak

---

# 126. IMAGE ANALYSIS

Ako analiza ne stiže da obradi svaki frame, proveri backpressure strategiju.

---

# 127. ML

Ako postoji on-device inference, proveri:

- model load
- warm-up
- thread
- batching
- memory

---

# 128. SENSOR DATA

High-frequency sensor processing treba ograničiti na potrebnu frekvenciju.

---

# 129. LOCATION

Previše česti location updates utiču na battery i CPU.

---

# 130. BLUETOOTH

Visoka frequency event processing može opteretiti Main ako callback radi težak posao.

---

# 131. LOGGING

Massive logging u hot path-u može biti skup, posebno debug.

Proveri release stripping.

---

# 132. STRING INTERPOLATION U LOGGING-U

Ako se expensive string generiše i kada log nije enabled, može biti nepotreban cost.

Relevantno samo u hot path-u.

---

# 133. ANALYTICS

Nemoj slati synchronous analytics na user interaction path-u.

---

# 134. CRASH REPORTING

Breadcrumb serialization velikih objekata može biti performance/privacy problem.

---

# 135. DISK LOGGING

Ako app piše detaljan log na disk u high-frequency flow-u, proveri.

---

# 136. STRICTMODE

Ako dostupno, koristi StrictMode za detection u dev/test okruženju.

Ali ne tretiraj njegov izostanak kao performance bug.

---

# 137. PROFILER

Ako runtime tooling postoji, koristi:

- CPU profiler
- memory profiler
- system trace
- frame timeline

Ne izmišljaj profiling rezultate.

---

# 138. PERFETTO / SYSTEM TRACE

Za ozbiljan jank/ANR problem sistemski trace može pokazati:

- blocked Main
- binder
- scheduling
- GC
- I/O

---

# 139. ANR TRACE

Ako postoje ANR trace/logovi, oni imaju visok prioritet.

Prvo analiziraj stack glavnog thread-a.

---

# 140. PLAY CONSOLE ANR

Ako nema production telemetry podataka:

**PRODUCTION ANR RATE: NOT AVAILABLE**

Ne nagađaj.

---

# 141. FIREBASE PERFORMANCE

Ako postoji, koristi samo stvarne podatke.

---

# 142. MACROBENCHMARK

Ako postoje benchmark testovi, pregledaj:

- startup
- scroll
- navigation
- critical user flow

---

# 143. MICROBENCHMARK

Microbenchmark koristi samo za izolovane algoritme ili hot code paths.

Ne koristi ga kao dokaz end-to-end UX performance-a.

---

# 144. BASELINE PROFILES

Ako postoje, proveri da pokrivaju critical journeys.

Ne tvrdi da daju određeni procenat poboljšanja bez benchmarka.

---

# 145. PROFILEINSTALLER

Utvrdi stvarnu konfiguraciju pre finding-a.

---

# 146. CLOUD PROFILE

Ne oslanjaj se na neproverene pretpostavke o tome šta Play generiše za konkretnu aplikaciju.

---

# 147. R8

Release minification može smanjiti code size/startup, ali ne pretpostavljaj korist bez merenja.

---

# 148. RESOURCE SHRINKING

Slično.

---

# 149. APK / AAB SIZE

Binary size utiče na:

- download
- install
- storage

ali nije isto što i runtime performance.

Odvoji kategoriju.

---

# 150. LARGE DEPENDENCIES

Prijavi samo ako:

- značajno povećavaju startup/binary/memory
- feature koristi mali deo biblioteke
- postoji evidence

---

# 151. MULTIDEX

Na modernim targetima nije automatski performance problem.

Proveri relevantnost prema minSdk/build-u.

---

# 152. CLASS LOADING

Heavy reflection ili veliki dependency graph mogu uticati na startup.

Profiling je poželjan.

---

# 153. REFLECTION

Ne prijavljuj reflection samo po sebi.

Relevantno je ako se koristi masovno na hot path-u.

---

# 154. DEPENDENCY INJECTION

DI framework startup cost analiziraj samo sa stvarnim initialization path-om.

---

# 155. LAZY DI

Lazy injection može pomoći za skupe dependencies koje se retko koriste.

Ali može samo pomeriti latency na prvi use.

---

# 156. PRELOADING

Preloading može ubrzati kasniji flow, ali povećati startup/memory.

Proceni tradeoff.

---

# 157. CACHE

Za svaki cache pitaj:

- šta ubrzava
- koliko memory koristi
- invalidation
- hit rate ako je poznat

Ako hit rate nije poznat:

**CACHE EFFECTIVENESS: NOT MEASURED**

---

# 158. PREMATURE CACHE

Nemoj dodati cache samo zato što funkcija deluje skupo.

Prvo utvrdi da se zaista ponavlja.

---

# 159. UNBOUNDED CACHE

Map bez eviction-a koji raste sa user data je realan memory risk.

---

# 160. DISK CACHE

Veliki disk cache može usporiti startup/cleanup ili napuniti storage.

---

# 161. LOW-END DEVICE

Poseban pass.

Pretpostavi:

- spor CPU
- slab GPU
- malo RAM-a
- spor storage

Pitaj:

> Koji hotspot prvi postaje vidljiv korisniku?

---

# 162. THERMAL THROTTLING

Dugotrajni CPU-heavy feature može usporiti zbog termalnog ograničenja.

Prijavi samo za workload gde je realno relevantno.

---

# 163. BATTERY SAVER

Background/performance behavior može biti ograničen.

To je uglavnom reliability kategorija osim ako performance model zavisi od background work-a.

---

# 164. LARGE DATASET PASS

Mentalno povećaj:

```text
100 records -> 10,000
```

Proveri:

- DB query
- transformation
- memory
- list rendering

Nemoj tvrditi da će problem sigurno nastati bez growth expectation-a.

---

# 165. LONG SESSION

Aplikacija može raditi satima.

Traži:

- memory growth
- accumulated listeners
- cached screens
- unbounded logs

---

# 166. NAVIGATION MEMORY

Navigation back stack može zadržati više ViewModel-a i njihovih velikih state-ova.

---

# 167. MULTI-TAB / BOTTOM NAV

Više retained stacks može značajno povećati memory footprint.

Proceni feature state.

---

# 168. BACKGROUND / FOREGROUND

Povratak iz background-a može pokrenuti:

- refresh
- reconnect
- analytics
- observers

Ako sve startuje istovremeno, može nastati latency spike.

---

# 169. THUNDERING HERD NA RESUME

Scenario:

```text
onResume
↓
5 ViewModels refresh
↓
several DB queries
↓
several network calls
```

Proveri koordinaciju.

---

# 170. CONNECTIVITY RESTORE

Povratak mreže može triggerovati:

- workers
- retries
- foreground refresh

istovremeno.

---

# 171. RETRY STORM

Mnogi failed requests mogu svi retry-ovati kada network vrati.

---

# 172. BACKOFF

Proveri da retries ne stvaraju performance/battery problem.

---

# 173. WORKMANAGER

Mapiraj sve work requests koji mogu istovremeno raditi.

---

# 174. WORK CONSTRAINTS

Nepotrebno agresivni jobs mogu trošiti battery/resources.

---

# 175. PERIODIC WORK

Nemoj zakazivati vrlo čest posao ako proizvod nema realnu potrebu.

---

# 176. WORKER CPU

WorkManager nije opravdanje da CPU-intensive posao radi bez ograničenja.

---

# 177. FOREGROUND SERVICE PERFORMANCE

Ako FGS radi dugo, proveri:

- polling
- logging
- sensors
- network
- CPU

---

# 178. BINDER

Veliki IPC payload može biti problem.

Posebno:

- Intent extras
- Bundle
- Messenger/AIDL

---

# 179. TRANSACTION TOO LARGE

Ogroman Bundle/Intent/SavedState može izazvati failure, ali i serialization cost.

---

# 180. NOTIFICATIONS

Generisanje mnogih notifications ili bitmap assets može imati cost.

Sekundarno osim ako feature masovno koristi notifikacije.

---

# 181. WIDGETS

Ako postoje App Widgets, update frequency i bitmap generation mogu imati performance impact.

---

# 182. BACKUP

Veliki backup/export može blokirati UI ili potrošiti mnogo memory.

---

# 183. IMPORT

Parser koji učitava ceo veliki file u RAM umesto streaming-a može napraviti memory spike.

---

# 184. STREAMING

Streaming je kandidat za velike file operations, ali ne komplikuje male fajlove bez potrebe.

---

# 185. BATCH DB WRITE

Hiljade pojedinačnih transaction-a mogu biti mnogo sporije nego batch transaction.

Proveri realan import/sync scenario.

---

# 186. BATCH NETWORK

Stotine individualnih network poziva mogu biti inefficiency.

Ali batching zahteva API support i business semantiku.

---

# 187. PROGRESS UI

Progress update za svaki pojedinačni record može previše često invalidirati UI.

---

# 188. THROTTLED PROGRESS

Razmotri manje česte UI updates samo ako high-frequency update pravi stvarni hotspot.

---

# 189. TOUCH / INPUT LATENCY

Critical tap handler treba brzo da vrati control UI thread-u.

Ne stavljaj veliki posao direktno u click callback.

---

# 190. IMMEDIATE FEEDBACK

Perceived performance može se poboljšati:

- state change
- progress
- skeleton

ali ovo ne zamenjuje stvarnu optimizaciju.

---

# 191. FALSE LOADING

Nemoj prikazati spinner ako operacija traje praktično trenutno jer može stvoriti vizuelni flicker.

Ovo je UX/perceived-performance improvement.

---

# 192. SKELETON

Skeleton koji je teži od realnog sadržaja može biti kontraproduktivan.

---

# 193. SHIMMER

Infinite shimmer preko mnogo elemenata može opteretiti GPU.

Proveri realan list size/device.

---

# 194. ANIMATION WHILE LOADING

Kombinacija network wait-a i heavy animation može pogoršati low-end iskustvo.

---

# 195. PERF TEST MATRIX

Za critical flow napravi:

| Flow | Cold | Warm | Low-end | Large data | Measured |
|---|---|---|---|---|---|

---

# 196. HOTSPOT FORMAT

Za svaki ozbiljan performance finding:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Screen:
Module:
File:
Function/Class:

Execution thread:
Frequency:
Dataset size:
Build type:

Problem:

Evidence:

Critical Path:

Why expensive:

Measured or inferred:

Metric:

Current value:
NOT MEASURED if unavailable

User impact:

ANR/Jank/Memory risk:

Root cause:

Recommended remediation:

How to measure after fix:

Regression benchmark/test:

Complexity:
XS / S / M / L / XL
```

---

# 197. PERFORMANCE STATUS

Koristi:

```text
MEASURED
CODE-LEVEL RISK
NOT MEASURED
```

Obavezno za svaki performance finding.

---

# 198. SEVERITY

Koristi:

## P1 - HIGH

- konkretan ANR risk na važnom flow-u
- Main thread blokiran velikim/snažno skalirajućim poslom
- reproducible severe jank
- ozbiljan OOM/memory growth
- critical screen postaje praktično neupotrebljiv

## P2 - MEDIUM

- značajan latency/jank/memory problem
- važan flow ima dokaziv bottleneck

## P3 - LOW

- ograničena inefficiency sa realnim user impact-om

## P4 - IMPROVEMENT

- performance poboljšanje bez potvrđenog user-visible problema

P0 koristi samo ako performance/resource problem praktično uzrokuje katastrofalni failure ili critical data/security consequence.

---

# 199. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

runtime measurement/trace ili direktno dokaziv blocking path.

MEDIUM:

jak code-level dokaz bez benchmarka.

LOW:

zavisi od realnog dataset-a, uređaja ili workload-a.

---

# 200. NE IZMIŠLJAJ METRIKE

Nikad ne piši:

```text
LCP je 2.1 s
startup je 900 ms
60 FPS
memory 250 MB
```

ako to nije stvarno izmereno.

Umesto toga:

```text
Startup: NOT MEASURED
```

---

# 201. PERFORMANCE BUDGETS

Ako projekat već ima baseline, koristi ga.

Ako nema:

predloži da se prvo izmeri baseline.

Ne izmišljaj "idealne" pragove kao univerzalne.

---

# 202. REGRESSION BENCHMARK

Za ozbiljan finding definiši scenario koji treba benchmarkovati pre i posle fix-a.

---

# 203. TRACE BEFORE OPTIMIZATION

Ako možeš pokrenuti app i problem je runtime performance:

preferiraj:

```text
reproduce
↓
trace/profile
↓
identify hotspot
↓
optimize
↓
measure again
```

umesto guessing-a iz source-a.

---

# 204. FALSE POSITIVE PREVENCIJA

Pre P1/P2 performance nalaza proveri:

1. koji thread
2. koliko često
3. dataset size
4. library internal threading
5. caching
6. lifecycle
7. debug vs release
8. low-end relevance
9. existing profiler evidence
10. test/benchmark

Ne prijavljuj samo na osnovu naziva funkcije.

---

# 205. NE OPTIMIZUJ MIKRO-KOD

Ne prijavljuj kao ozbiljan problem:

- jednu malu allocation
- jedan `map`
- malu listu
- jednu lambda
- jedan string format

osim ako je u ekstremno hot loop-u i dokazano značajno.

---

# 206. NE MEMOIZUJ SVE

Cache/memoization:

- koristi memory
- komplikuje invalidation
- može dati stale data

Preporuči samo uz jasan benefit.

---

# 207. NE PREBACUJ SVE NA IO

CPU posao ne pripada nužno IO dispatcher-u.

UI-safe ne znači samo "Dispatchers.IO".

---

# 208. NE DODAJ THREADING BEZ POTREBE

Prebacivanje malog posla na drugi dispatcher ima scheduling cost i complexity.

---

# 209. NE MENJAJ KOD

Tokom audita:

- ne refaktoriši
- ne dodaj cache
- ne menjaj dispatcher
- ne uvodi pagination
- ne dodaj Baseline Profiles
- ne menjaj list implementation
- ne optimizuj DB

Prvo završi audit.

---

# 210. OUTPUT - ANDROID_PERFORMANCE_ANR_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- performance architecture
- najveći ANR rizici
- startup stanje
- UI/jank stanje
- memory stanje
- measurement coverage

## 2. Performance Measurement Coverage

Navedi šta je:

```text
MEASURED
INFERRED
NOT MEASURED
```

## 3. Critical User Flow Performance Map

## 4. Main Thread Audit

## 5. ANR Risk Audit

## 6. Startup Audit

## 7. Compose Performance Audit

ili Views audit ako je relevantno.

## 8. Lists / Scrolling Audit

## 9. Network Performance

## 10. Database Performance

## 11. Flow / Data Transformation Performance

## 12. Image / Media Performance

## 13. Memory Audit

## 14. Memory Leak Performance Impact

## 15. CPU Audit

## 16. Background Work / Battery Audit

## 17. Low-End Device Risk

## 18. Large Dataset Risk

## 19. Release Build Performance

## 20. Benchmark / Profiling Coverage

## 21. Findings Summary

| ID | Severity | Category | Critical path | Measured/Inferred | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P1 Findings

## 23. P2 Findings

## 24. P3 Findings

## 25. P4 Improvements

## 26. Things Done Well

## 27. Unknown / Not Measured

## 28. Performance Measurement Plan

## 29. Remediation Roadmap

---

# 211. MAIN THREAD MATRIX

Za critical operations:

| Operation | Thread | Blocking | Frequency | Size | Risk |
|---|---|---|---|---|---|

---

# 212. STARTUP MATRIX

| Initialization | Required before UI | Thread | Cost measured | Deferrable |
|---|---|---|---|---|

---

# 213. MEMORY MATRIX

| Resource | Owner | Size/Growth | Lifetime | Cleanup | Risk |
|---|---|---|---|---|---|

---

# 214. DATABASE MATRIX

| Query | Critical path | Dataset | Index | Frequency | Risk |
|---|---|---|---|---|---|

---

# 215. SECOND PASS - MAIN THREAD ATTACK

Nakon prvog audita ponovo prođi kod samo sa pitanjem:

> Šta sve može završiti na Main thread-u?

Prati transitive call chain, ne samo direktnu funkciju.

Primer:

```text
button click
↓
ViewModel
↓
repository
↓
helper
↓
File.readBytes()
```

---

# 216. SECOND PASS - STARTUP ATTACK

Pitaj:

> Šta korisnik plaća pre nego što vidi prvi koristan ekran?

Klasifikuj svaki task:

```text
MUST BLOCK
CAN DEFER
CAN LAZY LOAD
NOT VERIFIED
```

---

# 217. SECOND PASS - 10X DATA

Za svaku listu/query/transformation mentalno povećaj dataset 10x.

Pitaj:

- memory
- CPU
- render
- DB

Ali severity mora odgovarati realnom očekivanom growth-u.

---

# 218. SECOND PASS - LOW-END PHONE

Pretpostavi mnogo sporiji CPU i storage.

Pitaj:

> Koja operacija trenutno deluje mala samo zato što je testirana na brzom uređaju?

---

# 219. SECOND PASS - LONG SESSION

Simuliraj više sati korišćenja.

Pitaj:

- da li memory raste
- da li cache raste
- da li listeners rastu
- da li back stack raste

---

# 220. SECOND PASS - BACKGROUND/FOREGROUND

Ponovi ciklus 20 puta mentalno ili testom:

```text
foreground
↓
background
↓
foreground
```

Traži:

- duplicate observers
- duplicate refresh
- memory growth
- repeated initialization

---

# 221. SECOND PASS - NETWORK RESTORE

Simuliraj:

```text
offline
↓
many operations fail
↓
network restored
```

Pitaj koliko request-ova/jobs odjednom kreće.

---

# 222. SECOND PASS - IMPORT/EXPORT

Ako postoji:

testiraj sa maksimalno realnim fajlom.

Traži:

- whole-file memory
- Main-thread blocking
- database transaction time
- progress update overhead

---

# 223. SECOND PASS - SCROLL

Za najtežu listu:

- mnogo elemenata
- slike
- fast scroll
- search/filter

Pitaj šta se izvršava pri svakom novom item-u/frame-u.

---

# 224. SECOND PASS - ANR

Za svaki candidate napravi precizan execution flow:

```text
Main thread
↓
blocking operation
↓
why it cannot process input/lifecycle
↓
trigger
↓
worst-case work
```

Ako to ne možeš pokazati:

nemoj ga zvati ANR finding-om.

---

# 225. SECOND PASS - MEMORY PRESSURE

Simuliraj:

- više otvorenih screens
- mnogo images
- background/foreground
- large dataset

Pitaj:

> Koji resource se ne oslobađa kada više nije potreban?

---

# 226. ROI TABELA

Za stvarne optimizacije napravi:

| Finding | User impact | Expected benefit | Effort | Measurement |
|---|---|---|---|---|

Za expected benefit koristi:

```text
HIGH
MEDIUM
LOW
```

ako nema benchmarka.

Ne izmišljaj procente.

---

# 227. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nisi performance procenjivao samo iz debug build-a
- svaki ANR finding ima blocking Main-thread scenario
- svaki jank finding ima konkretan hot path
- nije svaka recomposition proglašena problemom
- nije svaki DB query proglašen sporim
- nije svaki `SELECT *` proglašen bugom
- memory finding ima growth ili retained-lifetime scenario
- OOM nije izmišljen bez memory path-a
- startup finding razlikuje required od deferrable work-a
- network latency nije pogrešno nazvana ANR-om
- cache preporuka ima invalidation/memory analizu
- DB index preporuka ima konkretan query
- low-end scenario je analiziran
- large dataset scenario je analiziran
- measurements i inference su jasno odvojeni
- svaki P1/P2 ima način verifikacije posle fix-a
- improvements su odvojeni od stvarnih bottleneck-a

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite background threads, caching, pagination i Baseline Profiles.

To nije Android performance audit.

Tražim probleme poput:

```text
user taps Import
↓
click handler starts
↓
File.readBytes() executes on Main
↓
150 MB file loaded
↓
Main thread cannot process input
↓
screen appears frozen
↓
ANR risk
```

ili:

```text
Room Flow emits 5,000 records
↓
ViewModel maps entire list
↓
sorts entire list
↓
filters entire list
↓
all work executes on Main
↓
small filter state changes
↓
whole transformation repeats
↓
visible jank
```

ili:

```text
Application.onCreate
↓
analytics init
↓
remote config
↓
database open
↓
large JSON parse
↓
all synchronous
↓
first Activity waits
```

ili:

```text
thumbnail screen
↓
100 items
↓
each image decoded at original 4000x3000 resolution
↓
large bitmap allocations
↓
GC pressure
↓
scroll jank / memory pressure
```

ili:

```text
onResume
↓
five ViewModels independently refresh
↓
five database queries
↓
five API calls
↓
network reconnect also triggers WorkManager sync
↓
foreground transition creates burst load
```

ili:

```text
navigation creates new WebView
↓
old WebView retained by listener
↓
repeat navigation
↓
memory usage continually grows
↓
long session eventually experiences GC pressure or OOM risk
```

To su problemi koje treba da tražiš.

Razmišljaj kroz:

- Main thread
- critical path
- frequency
- dataset size
- allocation lifetime
- release build
- weak devices
- long sessions
- background/foreground transitions
- measurable user waiting time

Za svaki ozbiljan finding odgovori:

> Koji posao je skup?

> Na kom thread-u radi?

> Koliko često radi?

> Koliko podataka obrađuje?

> Zašto korisnik mora da čeka?

> Kako to možemo izmeriti pre i posle popravke?

Ako odgovor nije poznat:

**NOT MEASURED.**

Ako postoji samo sumnja iz source koda:

**CODE-LEVEL PERFORMANCE RISK.**

Ako je samo moguća optimizacija bez user-visible problema:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih ANR/jank bottleneck-a nego napisati 100 mikro-optimizacija koje niko neće primetiti.

Cilj je dobiti forenzički precizan Android performance audit koji se može direktno pretvoriti u:

- trace
- benchmark
- reprodukciju
- fix
- regression test
- pre/post measurement
- production performance verification
