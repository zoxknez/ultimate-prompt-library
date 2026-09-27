---
id: UPL-IT-011
number: 11
slug: ultimate-android-application-audit
title: Ultimate Android Application Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# ULTIMATE ANDROID APPLICATION AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletne Android aplikacije.

Ovo nije običan code review.

Tretiraj zadatak kao kombinaciju:

- senior Android architecture review-a
- Kotlin review-a
- lifecycle audita
- Jetpack Compose ili Views audita
- Coroutines / Flow audita
- threading i concurrency audita
- Room / persistence audita
- networking audita
- offline-first audita
- performance audita
- ANR i crash audita
- security audita
- permission audita
- background execution audita
- WorkManager audita
- media audita ako postoji
- Android TV audita ako postoji
- accessibility pregleda
- release-readiness audita
- Play Store readiness audita
- test coverage audita
- cross-version Android compatibility audita

Glavni cilj:

> Utvrditi kako Android aplikacija zaista radi kroz lifecycle, procese, threading, storage, mrežu i korisničke flow-ove, pronaći realne probleme i proceniti da li je spremna za stabilnu produkciju.

Prioritet:

**correctness > lifecycle safety > data integrity > reliability > security > performance > architecture elegance**

Ne izmišljaj probleme da bi audit izgledao detaljnije.

Ne prijavljuj Android best practice ako ne postoji konkretan razlog u ovom projektu.

---

# 0. PRVO UTVRDI STVARNI ANDROID STACK

Pre ozbiljne analize utvrdi:

- Android Gradle Plugin verziju
- Gradle verziju
- Kotlin verziju
- `compileSdk`
- `targetSdk`
- `minSdk`
- JDK verziju
- Compose ili XML Views
- Compose BOM ako postoji
- Navigation verziju
- Lifecycle verziju
- Coroutines verziju
- Room verziju
- DataStore verziju
- WorkManager verziju
- Retrofit/OkHttp/Ktor ili drugi network stack
- dependency injection sistem
- Hilt
- Koin
- Dagger
- manual DI
- serialization biblioteku
- test framework
- build variants
- flavors
- release konfiguraciju

Pregledaj najmanje:

- root Gradle konfiguraciju
- app/module Gradle fajlove
- version catalog
- `AndroidManifest.xml`
- ProGuard/R8 pravila
- source setove
- build variants
- Compose/View strukturu
- navigation
- data layer
- repository layer
- database
- network
- workers
- services
- receivers
- tests

Ne koristi zastarele Android pretpostavke.

Ako zaključak zavisi od konkretne Android/API/library verzije, prvo utvrdi tu verziju.

---

# 1. MAPIRAJ KOMPLETNU ARHITEKTURU

Pre nalaza napravi mapu aplikacije.

Utvrdi:

- Activities
- Fragments
- Compose screens
- Navigation graph
- ViewModels
- domain/use-case sloj
- repositories
- local data source
- remote data source
- Room
- DataStore
- files
- cache
- workers
- services
- receivers
- providers
- media components
- notifications
- deep links

Napravi stvarni flow:

```text
UI
↓
ViewModel
↓
Use Case / Repository
↓
Local / Remote Data Source
↓
Room / API
↓
StateFlow / LiveData
↓
UI
```

Ako projekat koristi drugačiji pattern, dokumentuj stvarni pattern.

---

# 2. MODULE BOUNDARIES

Ako projekat ima više Gradle modula, mapiraj dependency smer.

Traži:

```text
feature
↓
core
```

ali i problematično:

```text
core
↓
feature
```

ili circular module dependencies.

Za svaki ozbiljan problem objasni realan impact.

---

# 3. APPLICATION ENTRY POINT

Pregledaj:

- `Application`
- dependency initialization
- SDK initialization
- logging
- analytics
- database
- background scheduling

Traži previše rada tokom startup-a.

---

# 4. ANDROID MANIFEST

Duboko pregledaj manifest.

Proveri:

- exported components
- permissions
- intent filters
- providers
- receivers
- services
- activities
- deep links
- backup config
- cleartext traffic
- network security config
- foreground service declarations
- task/launch mode
- themes

Manifest finding mora imati konkretan security ili runtime impact.

---

# 5. EXPORTED COMPONENTS

Za svaku exported komponentu proveri:

- da li treba da bude exported
- ko može da je pozove
- da li validira input
- da li zahteva permission

Posebno:

- Activity
- Service
- BroadcastReceiver
- ContentProvider

---

# 6. INTENT INPUT

Svaki external Intent tretiraj kao nepoverljiv input.

Proveri:

- extras
- URI
- action
- MIME
- flags

Ne veruj da je caller isključivo tvoja aplikacija ako komponenta može biti spolja pozvana.

---

# 7. DEEP LINKS

Mapiraj sve deep links.

Prati:

```text
external URL
↓
Intent
↓
Activity
↓
navigation
↓
screen
↓
resource access
```

Traži:

- auth bypass
- invalid ID
- crash
- open redirect
- navigation do nepostojećeg resource-a

---

# 8. APP LINKS

Ako postoje Android App Links, proveri:

- manifest
- host
- path
- verification
- fallback

Ako production domen nije dostupan za proveru:

**APP LINK VERIFICATION: NOT VERIFIED**

---

# 9. ACTIVITY LIFECYCLE

Za svaku važnu Activity proveri:

- `onCreate`
- `onStart`
- `onResume`
- `onPause`
- `onStop`
- `onDestroy`

Traži business logic koji zavisi od pogrešne lifecycle faze.

---

# 10. FRAGMENT LIFECYCLE

Posebno razlikuj:

- Fragment lifecycle
- Fragment View lifecycle

Traži observer vezan za Fragment umesto `viewLifecycleOwner` kada može preživeti View.

---

# 11. VIEWMODEL OWNERSHIP

Proveri scope ViewModel-a:

- Activity
- Fragment
- Navigation graph
- Compose route

Pogrešan scope može izazvati:

- stale state
- neočekivano deljenje
- reset
- memory retention

---

# 12. CONFIGURATION CHANGE

Mentalno testiraj:

```text
screen open
↓
user enters data
↓
rotation/configuration change
```

Šta se gubi?

Proveri:

- UI state
- form state
- selected item
- request state

---

# 13. PROCESS DEATH

Jedan od najvažnijih Android scenarija.

Simuliraj:

```text
app in background
↓
OS kills process
↓
user returns
```

Ne pretpostavljaj da ViewModel preživljava process death.

Proveri:

- SavedStateHandle
- persistent data
- navigation state
- draft recovery

---

# 14. SAVEDSTATEHANDLE

Pregledaj šta se čuva.

Ne stavljaj ogromne objekte.

Proveri da li čuva minimalan state potreban za rekonstrukciju.

---

# 15. BUNDLE SIZE

Veliki state u Bundle/SavedState može izazvati TransactionTooLargeException.

Traži:

- liste
- bitmap
- veliki JSON
- veliki Parcelable

---

# 16. COMPOSE STATE

Ako postoji Compose, mapiraj:

- `remember`
- `rememberSaveable`
- ViewModel state
- Flow collection
- derived state

Proveri da state odgovara potrebnom lifecycle-u.

---

# 17. `remember` VS `rememberSaveable`

Ne prijavljuj svaki `remember`.

Pitaj:

> Da li ovaj state mora preživeti recreation?

Ako da, proveri odgovarajuće rešenje.

---

# 18. STATE HOISTING

Proveri da UI state ima jasnog vlasnika.

Traži isti state u:

- composable-u
- ViewModel-u
- repository-ju

bez jasnog source of truth-a.

---

# 19. RECOMPOSITION

Traži skupe operacije direktno u composable body-ju:

- sorting
- filtering
- parsing
- DB/API pozive
- allocations

Ali ne prijavljuj običnu recomposition bez realnog troška.

---

# 20. UNSTABLE INPUTS

Ako performance problem zavisi od Compose stability-ja, proveri stvarni model i compiler behavior pre finding-a.

---

# 21. SIDE EFFECT APIs

Pregledaj:

- `LaunchedEffect`
- `DisposableEffect`
- `SideEffect`
- `rememberCoroutineScope`
- `produceState`

Proveri key-eve i lifecycle.

---

# 22. LAUNCHEDEFFECT KEY

Scenario:

```text
LaunchedEffect(Unit)
```

ali effect zavisi od promenljivog ID-a.

Proveri da li se effect ponovo pokreće kada treba.

---

# 23. DISPOSABLEEFFECT

Ako registruje listener/resource, proveri cleanup.

---

# 24. COLLECTING FLOW U COMPOSE-U

Proveri lifecycle-aware collection.

Traži collection koja radi i kada UI nije aktivan bez potrebe.

---

# 25. XML VIEWS

Ako projekat koristi Views, proveri:

- ViewBinding
- DataBinding
- nullable binding
- cleanup u Fragment-u
- adapter lifecycle

---

# 26. VIEWBINDING U FRAGMENT-U

Klasičan problem:

binding referenca preživi `onDestroyView`.

Proveri konkretnu implementaciju.

---

# 27. RECYCLERVIEW

Za liste proveri:

- stable IDs
- DiffUtil
- payloads
- nested lists
- listener recycling
- stale position

---

# 28. ADAPTER POSITION

Traži korišćenje stare cached pozicije umesto trenutne adapter pozicije.

---

# 29. DIFFUTIL

Proveri:

- identity
- content equality
- mutable objects

Loša DiffUtil logika može prikazati stale UI.

---

# 30. NAVIGATION

Mapiraj kompletan navigation model.

Proveri:

- back stack
- deep links
- nested graphs
- dialogs
- bottom navigation
- multiple back stacks

---

# 31. DUPLICATE NAVIGATION

Scenario:

```text
button double tap
↓
navigate twice
```

Može izazvati:

- duplicate destination
- crash
- back stack problem

---

# 32. NAVIGATION AFTER ASYNC

Scenario:

```text
screen A
↓
request starts
↓
user leaves
↓
request completes
↓
old ViewModel/navigation event tries to navigate
```

Proveri lifecycle relevance.

---

# 33. ONE-TIME EVENTS

Pregledaj:

- navigation events
- toast/snackbar events
- dialogs

Traži event koji se ponavlja posle rotation-a ili re-collection-a.

---

# 34. EVENT WRAPPERS

Ne uvodi automatski custom `SingleLiveEvent`.

Analiziraj postojeći event model.

---

# 35. STATEFLOW VS SHAREDFLOW

Proveri da je semantika odgovarajuća:

- persistent state
- transient event

Pogrešan primitive može izazvati izgubljene ili ponovljene događaje.

---

# 36. COROUTINE SCOPES

Mapiraj:

- `viewModelScope`
- `lifecycleScope`
- custom CoroutineScope
- GlobalScope
- application scope

---

# 37. GLOBALSCOPE

Ako postoji `GlobalScope`, proveri konkretan lifecycle problem.

Nemoj ga prijaviti samo po imenu ako je use case ekstremno specifičan, ali zahtevaj opravdanje.

---

# 38. CUSTOM SCOPE

Za svaki custom scope proveri:

- ko ga poseduje
- ko ga cancel-uje
- dispatcher
- SupervisorJob

---

# 39. CANCELLATION

Prati:

```text
screen closes
↓
coroutine still running?
```

Proveri side effect nakon cancellation-a.

---

# 40. SWALLOWED CANCELLATION

Posebno traži:

```kotlin
catch (e: Exception)
```

koji može progutati `CancellationException`.

---

# 41. STRUCTURED CONCURRENCY

Traži detached coroutines bez jasnog ownership-a.

---

# 42. DISPATCHERS

Proveri:

- Main
- IO
- Default

Traži:

- DB/file/network operaciju na Main thread-u
- CPU-heavy posao na Main-u
- nepotreban dispatcher switching

---

# 43. MAIN THREAD BLOCKING

Aktivno traži:

- blocking IO
- `runBlocking`
- large JSON parsing
- bitmap processing
- encryption
- file operations

na glavnom thread-u.

---

# 44. RUNBLOCKING

Posebno analiziraj svako korišćenje.

Ako je u UI/runtime path-u, može biti ozbiljan ANR rizik.

---

# 45. FLOW

Za važne Flow lance proveri:

- upstream
- operators
- dispatcher
- collection
- lifecycle
- error handling

---

# 46. `flowOn`

Proveri da developer pravilno razume šta `flowOn` menja.

---

# 47. HOT VS COLD FLOW

Proveri da li repeated collection ponavlja skupu operaciju.

---

# 48. `stateIn` / `shareIn`

Proveri:

- scope
- SharingStarted
- replay
- memory

---

# 49. COMBINE

Ako se kombinuje mnogo flow-ova, proveri:

- duplicate emissions
- expensive recalculation
- initial values

---

# 50. COLLECTLATEST

Proveri da cancellation prethodne operacije ima smisla.

---

# 51. EXCEPTION HANDLING U COROUTINES

Traži:

- izgubljene exceptions
- supervisor semantics
- child failure
- scope cancellation

---

# 52. SUPERVISORJOB

Ne koristi ga automatski kao "fix".

Proceni da li child failures treba da budu izolovani.

---

# 53. RACE CONDITIONS

Pronađi shared mutable state dostupan iz više coroutines/thread-ova.

---

# 54. MUTEX

Ako postoji mutex, proveri:

- scope
- deadlock
- reentrancy assumption
- cancellation

---

# 55. ATOMICITY

Scenario:

```text
read state
↓
compute
↓
write state
```

Dva paralelna coroutine-a mogu izgubiti update.

---

# 56. NETWORK STACK

Mapiraj:

```text
UI
↓
ViewModel
↓
Repository
↓
API client
↓
HTTP
```

---

# 57. BASE URL

Proveri:

- dev
- staging
- production
- trailing slash
- flavor config

---

# 58. TIMEOUTS

Proveri:

- connect
- read
- write
- call

Ne izmišljaj optimalne vrednosti bez context-a.

---

# 59. RETRIES

Proveri da write operacije nisu automatski retry-ovane bez idempotency-ja.

---

# 60. INTERCEPTORS

Pregledaj:

- auth
- logging
- retry
- headers

Traži redosled koji menja ponašanje.

---

# 61. AUTH TOKEN REFRESH

Rekonstruiši:

```text
multiple requests
↓
token expired
↓
401 x N
↓
refresh
```

Pitaj:

> Da li se pokreće jedan refresh ili N refresh operacija?

---

# 62. REFRESH RACE

Proveri concurrent 401 scenario.

---

# 63. AUTH LOOP

Scenario:

```text
request
↓
401
↓
refresh
↓
refresh 401
↓
interceptor retries again
```

Proveri infinite loop zaštitu.

---

# 64. NETWORK ERROR MAPPING

Proveri razliku:

- timeout
- no network
- DNS
- HTTP 4xx
- HTTP 5xx
- parse error

Nemoj sve pretvarati u isti generic error ako behavior treba da bude drugačiji.

---

# 65. SERIALIZATION

Proveri:

- unknown fields
- missing fields
- nullable
- enum drift
- malformed response

---

# 66. ENUM DRIFT

Backend može poslati novu enum vrednost koju stari Android client ne poznaje.

Proveri serializer behavior.

---

# 67. API VERSION SKEW

Stari instalirani APK može mesecima komunicirati sa novim backend-om.

Pitaj:

> Da li API ostaje backward compatible?

---

# 68. CERTIFICATE / TLS

Ako postoji custom trust manager, certificate pinning ili network security config, analiziraj pažljivo.

Nikada ne preporučuj trust-all certificate behavior.

---

# 69. CLEARTEXT TRAFFIC

Proveri da production ne dozvoljava HTTP bez potrebe.

---

# 70. ROOM DATABASE

Mapiraj:

- entities
- DAO
- relationships
- migrations
- indexes
- transactions

---

# 71. ROOM MAIN THREAD

Traži `allowMainThreadQueries`.

Ako postoji, proveri production usage.

---

# 72. ROOM MIGRATIONS

Mapiraj version history.

Proveri da korisnik može upgrade-ovati sa starijih podržanih verzija.

---

# 73. MIGRATION CHAIN

Scenario:

```text
DB v1
↓
app not updated for years
↓
install latest DB v7
```

Da li postoji validan path 1 -> 7?

---

# 74. DESTRUCTIVE MIGRATION

Ako se koristi fallback destructive migration, proceni da li podaci mogu biti izgubljeni.

---

# 75. SCHEMA EXPORT

Ako Room schema export/tests postoje, proveri ih.

---

# 76. TRANSACTIONS

Za multi-step write operacije proveri atomicity.

---

# 77. UNIQUE CONSTRAINTS

Business invariant koji postoji samo u Kotlin-u može pasti pod concurrency-jem.

---

# 78. FOREIGN KEYS

Proveri orphan data i cascade behavior.

---

# 79. DATABASE INDEXES

Za query-je sa:

- WHERE
- JOIN
- ORDER BY

proveri relevantne indekse.

---

# 80. N+1

Traži listu koja pokreće poseban query po item-u.

---

# 81. FLOW IZ ROOM-A

Proveri da li UI collection i query invalidation rade smisleno.

---

# 82. DATASTORE

Ako postoji, proveri:

- Proto/Preferences
- corruption handler
- migrations
- IO behavior

---

# 83. SHAREDPREFERENCES

Ako se i dalje koristi, proveri:

- synchronous commit na Main-u
- sensitive data
- migration ka DataStore samo ako postoji konkretan razlog

---

# 84. FILE STORAGE

Mapiraj:

- internal
- external
- cache
- media storage

---

# 85. SCOPED STORAGE

Ako target SDK zahteva savremen storage model, proveri legacy assumptions.

---

# 86. FILE URI

Traži `file://` deljenje ka drugim aplikacijama.

Proveri FileProvider gde je relevantno.

---

# 87. FILEPROVIDER

Proveri path konfiguraciju.

Nemoj izlagati širi filesystem nego što je potrebno.

---

# 88. CACHE FILE CLEANUP

Privremeni fajlovi mogu rasti bez granice.

---

# 89. SENSITIVE FILES

Proveri da li se credentials ili sensitive data čuvaju u plaintext-u.

---

# 90. ANDROID KEYSTORE

Ako app čuva secrets/tokene, proveri model.

Nemoj tvrditi da svaki token mora nužno biti u Keystore-u bez analize auth arhitekture.

---

# 91. BACKUP

Proveri:

- Auto Backup
- data extraction rules
- šta ulazi u backup
- sensitive data

---

# 92. LOGOUT

Mapiraj kompletan cleanup:

```text
logout
↓
tokens
↓
database
↓
DataStore
↓
cache
↓
files
↓
notifications
↓
workers
```

Proveri cross-user leakage.

---

# 93. ACCOUNT SWITCHING

Scenario:

```text
User A
↓
logout
↓
User B
```

Pitaj:

> Može li B videti bilo koji A state ili persisted podatak?

---

# 94. WORKMANAGER

Mapiraj sve workers.

Za svaki proveri:

- constraints
- unique work
- retries
- backoff
- input
- output
- cancellation

---

# 95. DUPLICATE WORK

Ako app schedule-uje sync pri svakom startup-u, proveri da se ne akumuliraju isti jobs.

---

# 96. UNIQUE WORK

Proveri policy:

- KEEP
- REPLACE
- APPEND

u odnosu na business semantiku.

---

# 97. PERIODIC WORK

Proveri da proizvod ne očekuje precizno izvršenje u tačno vreme.

Android background scheduling nije real-time scheduler.

---

# 98. RETRY

Worker treba razlikovati:

- transient failure
- permanent failure

Ne retry-uj zauvek validation error.

---

# 99. WORKER IDEMPOTENCY

Worker može biti ponovo pokrenut.

Pitaj:

> Da li je bezbedno izvršiti ga dva puta?

---

# 100. PROCESS RESTART

Worker mora raditi i u novom procesu bez pretpostavke o in-memory state-u.

---

# 101. SERVICES

Mapiraj:

- started services
- bound services
- foreground services

---

# 102. FOREGROUND SERVICE

Proveri:

- opravdan type
- notification
- lifecycle
- stop behavior

---

# 103. FGS START RESTRICTIONS

Savremene Android verzije ograničavaju kada background može startovati FGS.

Ako app zavisi od toga, proveri ciljnu verziju.

---

# 104. SERVICE LEAK

Proveri listeners/connections koji ostaju posle stop-a.

---

# 105. BROADCASTRECEIVER

Pregledaj:

- manifest vs runtime registration
- exported state
- permission
- unregister

---

# 106. RECEIVER INPUT

External broadcast data tretiraj kao untrusted.

---

# 107. NOTIFICATIONS

Proveri:

- channels
- channel importance
- permission
- PendingIntent
- deep link
- duplicate notification IDs

---

# 108. NOTIFICATION PERMISSION

Za Android verzije gde je potrebna runtime dozvola, proveri flow.

---

# 109. PENDINGINTENT

Proveri:

- mutability
- uniqueness
- extras
- security

---

# 110. NOTIFICATION CLICK

Prati:

```text
notification
↓
PendingIntent
↓
Activity
↓
navigation
↓
resource
```

Proveri stale/deleted resource.

---

# 111. ALARMMANAGER

Ako postoji, utvrdi:

- exact vs inexact
- permission
- business requirement

Ne koristi exact alarm kao generički scheduler.

---

# 112. BOOT RECEIVER

Ako app mora obnoviti alarms/jobs posle reboot-a, proveri behavior.

---

# 113. DOZE

Mentalno testiraj background funkcije pod Doze režimom.

Ne očekuj tačno izvršenje standardnih background tasks.

---

# 114. APP STANDBY

Isto za retko korišćenu aplikaciju.

---

# 115. BATTERY

Traži:

- aggressive polling
- wake locks
- location
- sensors
- frequent network

---

# 116. WAKELOCK

Svaki WakeLock mora imati jasan lifecycle i timeout gde je relevantno.

---

# 117. LOCATION

Ako app koristi location, proveri:

- permission
- approximate vs precise
- foreground/background
- lifecycle
- battery

---

# 118. PERMISSIONS

Napraviti inventory svih permission-a.

Klasifikuj:

```text
REQUIRED
OPTIONAL
LEGACY
UNUSED
NOT VERIFIED
```

---

# 119. RUNTIME PERMISSIONS

Prati flow:

```text
feature
↓
permission rationale
↓
request
↓
grant / deny
↓
permanent deny
↓
fallback
```

---

# 120. DON'T ASK AGAIN

Proveri UX kada korisnik trajno odbije permission.

---

# 121. PARTIAL PERMISSIONS

Savremene Android verzije mogu dati parcijalne photo/media dozvole.

Ako app radi sa medijima, proveri.

---

# 122. PERMISSION VERSION DIFFERENCES

Permission model se menja kroz API levele.

Ne koristi jednu logiku za sve verzije bez provere.

---

# 123. CAMERA

Ako postoji camera feature:

- lifecycle
- permission
- rotation
- process death
- file output

---

# 124. MEDIA PICKER

Proveri moderni system picker gde je relevantno, ali ne prepisuj arhitekturu bez potrebe.

---

# 125. BIOMETRICS

Ako postoji:

- fallback
- lifecycle
- invalidation
- auth state

Ne tretiraj biometric success kao server authorization.

---

# 126. WEBVIEW

Ako postoji WebView, ovo je high-risk površina.

Proveri:

- JavaScript
- file access
- mixed content
- JS interfaces
- navigation
- untrusted URLs
- SSL handling

---

# 127. JAVASCRIPT INTERFACE

`addJavascriptInterface` analiziraj posebno.

---

# 128. SSL ERROR HANDLING

Nikada ne prihvataj SSL error automatski.

---

# 129. URL VALIDATION

Ako WebView otvara URL iz input-a/deep link-a, proveri allowlist.

---

# 130. MEDIA3 / EXOPLAYER

Ako app koristi media playback, proveri:

- player ownership
- release
- lifecycle
- source switching
- errors
- retries
- audio focus

---

# 131. PLAYER INSTANCE

Traži kreiranje novog player-a pri recomposition/recreation bez pravilnog release-a.

---

# 132. AUDIO FOCUS

Proveri interaction sa:

- calls
- other audio apps
- headphones
- Bluetooth

ako je media centralan feature.

---

# 133. MEDIA SESSION

Ako postoji background playback, proveri MediaSession lifecycle.

---

# 134. PICTURE-IN-PICTURE

Ako postoji PiP, proveri:

- lifecycle
- actions
- state restoration
- configuration change

---

# 135. ANDROID TV

Ako je TV target, proveri:

- D-pad
- focus
- remote
- large screen
- playback
- EPG
- focus restoration

Detaljan audit može ići u poseban prompt.

---

# 136. ACCESSIBILITY

Proveri osnovno:

- content descriptions
- touch target
- focus order
- TalkBack
- state descriptions
- custom controls

Ne pretvaraj ovaj prompt u kompletan accessibility audit.

---

# 137. CONTENTDESCRIPTION

Ne dodaj description dekorativnim elementima bez potrebe.

Decorative content često treba biti ignorisan od TalkBack-a.

---

# 138. TEST TAG VS ACCESSIBILITY

Compose `testTag` nije zamena za accessibility semantics.

---

# 139. UI PERFORMANCE

Traži:

- jank
- main thread work
- huge list
- excessive recomposition
- image decode
- layout complexity

Ne tvrdi frame metrics bez merenja.

---

# 140. STARTUP PERFORMANCE

Mapiraj šta se izvršava pre prvog korisnog ekrana.

Traži:

- SDK init
- DB open
- network
- migration
- blocking dependency initialization

---

# 141. COLD START

Ako nije meren:

**COLD START: NOT MEASURED**

---

# 142. BASELINE PROFILES

Ako postoje, proveri coverage.

Ako ne postoje, to je improvement kandidat samo ako performance scope to opravdava.

---

# 143. ANR AUDIT

Traži puteve koji mogu blokirati Main thread dovoljno dugo da izazovu ANR.

Posebno:

- I/O
- locks
- binder calls
- large parsing
- DB
- synchronous network

---

# 144. DEADLOCK

Mapiraj locks/mutexes/synchronized blocks.

Traži lock ordering problem.

---

# 145. STRICTMODE

Ako se koristi, proveri šta hvata u debug/test builds.

Ako ne postoji, nemoj ga automatski zahtevati kao ozbiljan finding.

---

# 146. MEMORY LEAKS

Traži:

- Activity reference u singleton-u
- Fragment/View binding leak
- listener leak
- callback leak
- adapter context
- static reference
- coroutine scope

---

# 147. CONTEXT LEAK

Razlikuj:

- Application context
- Activity context

Ne prijavljuj svaku Context referencu.

---

# 148. LARGE BITMAPS

Proveri:

- decode
- cache
- image library
- memory pressure

---

# 149. OOM

Ne tvrdi OOM bez scenario-a.

Identifikuj konkretan memory growth path.

---

# 150. IMAGE LOADING

Ako koristi Coil/Glide/Picasso, proveri lifecycle-aware usage i caching.

Ne praviti custom image loader bez potrebe.

---

# 151. LIST MEMORY

Velike liste sa full-resolution media mogu napraviti memory pressure.

---

# 152. DATABASE MEMORY

Ne učitavaj ogromne tabele u memory ako UI treba malu stranicu.

---

# 153. PAGING

Ako dataset može biti veliki, proveri Paging implementaciju.

Ne zahtevaj Paging za male liste.

---

# 154. OFFLINE-FIRST

Ako app ima offline podršku, utvrdi source of truth.

Poželjno je jasno razumeti:

```text
network
↓
local DB
↓
UI
```

ili drugi stvarni model.

---

# 155. CACHE INVALIDATION

Proveri:

- stale data
- TTL
- manual refresh
- server push
- sync

---

# 156. SYNC

Mapiraj:

```text
local changes
↓
queue/state
↓
network
↓
server
↓
merge
↓
local DB
```

---

# 157. CONFLICT RESOLUTION

Scenario:

```text
Device A offline edits item
Device B edits same item
Device A reconnects
```

Dokumentuj actual behavior.

---

# 158. LAST-WRITE-WINS

Ako se koristi, proveri da li je to svesna business odluka.

---

# 159. DUPLICATE SYNC

Worker i foreground refresh mogu istovremeno pokrenuti sync.

Proveri idempotency/locking.

---

# 160. CONNECTIVITY

Ne koristi `isConnected == true` kao dokaz da API radi.

Network capability može postojati bez pristupa serveru.

---

# 161. RETRY OFFLINE

Proveri da app ne spamuje request-ove bez mreže.

---

# 162. STALE AUTH OFFLINE

Ako app omogućava offline pristup prethodno učitanim podacima, proveri šta se dešava posle server-side revoke-a.

To može biti security/business policy pitanje.

---

# 163. APP UPDATE

Stari instalirani APK može dugo ostati kod korisnika.

Backend i lokalna data schema moraju uzeti version skew u obzir.

---

# 164. IN-APP UPDATE

Ako postoji Play in-app update, proveri:

- flexible/immediate
- state
- failure
- resume

Ako ne postoji:

**NOT APPLICABLE**

---

# 165. FORCED UPDATE

Ako backend blokira stare verzije, proveri:

- offline behavior
- unavailable Play Store
- emergency fallback

---

# 166. VERSION CODE / VERSION NAME

Proveri release increment i flavor behavior.

---

# 167. DEBUG VS RELEASE

Jedan od najvažnijih delova.

Uporedi:

```text
debug
release
```

za:

- minification
- logging
- API URL
- certificates
- feature flags
- analytics
- crash reporting
- network security

---

# 168. DEBUGGABLE

Production release ne sme slučajno ostati debuggable.

---

# 169. LOGGING

Traži logovanje:

- tokena
- passworda
- personal data
- full API response

Posebno release behavior.

---

# 170. R8 / PROGUARD

Proveri release minification.

Traži reflection/serialization/JNI biblioteku koja zahteva keep rules.

---

# 171. DEBUG PASS / RELEASE FAIL

Klasičan Android problem:

```text
debug works
↓
R8 removes/renames required class
↓
release crashes
```

Proveri library requirements.

---

# 172. RESOURCE SHRINKING

Ako se koristi, proveri dynamic resource lookup.

---

# 173. SIGNING

Proveri da signing secrets nisu u repository-ju.

Ne reprodukuj vrednosti ako ih pronađeš.

---

# 174. APP BUNDLE

Ako se koristi AAB, proveri assumptions o split APK/resource delivery-ju gde je relevantno.

---

# 175. ABI

Ako postoje native libs, proveri podržane ABI-jeve.

---

# 176. NATIVE CODE

JNI crash može zaobići normalni Kotlin exception handling.

Ako native code postoji, označi poseban audit surface.

---

# 177. PLAY STORE TARGET REQUIREMENTS

Ako current compliance treba potvrditi, proveri ga prema aktuelnim zahtevima platforme pre zaključka.

Ako nije provereno:

**PLAY POLICY STATUS: NOT VERIFIED**

---

# 178. PRIVACY

Mapiraj:

```text
user data
↓
device
↓
logs
↓
network
↓
analytics
↓
third party
```

---

# 179. ANALYTICS

Proveri da:

- PII nije nepotrebno poslata
- user IDs imaju jasan lifecycle
- logout resetuje identitet gde je potrebno

---

# 180. CRASH REPORTING

Crash reports mogu sadržati sensitive context.

Proveri custom metadata/breadcrumbs.

---

# 181. THIRD-PARTY SDKS

Mapiraj SDK-ove:

- analytics
- ads
- social
- payment
- attribution
- crash

Za svaki utvrdi initialization i data access.

---

# 182. SDK STARTUP COST

Mnogi SDK-ovi inicijalizovani u `Application.onCreate` mogu usporiti startup.

Ne odlaži ih bez analize dependency-ja.

---

# 183. SDK FAILURE

Third-party initialization ne bi trebalo nepotrebno da sruši celu aplikaciju.

---

# 184. DEPENDENCY AUDIT

Pregledaj:

- deprecated libs
- duplicate libs
- old support libraries
- AndroidX consistency
- compatibility

Ne zahtevaj update samo zato što postoji novija verzija.

---

# 185. BUILD WARNINGS

Ne tretiraj svaki warning kao bug.

Klasifikuj:

- actionable
- deprecated
- release risk
- cosmetic

---

# 186. LINT

Ako možeš, pokreni Android Lint.

Ali automatski lint output nije finalni audit.

Svaki ozbiljan nalaz proveri.

---

# 187. TESTOVI

Mapiraj:

- unit
- integration
- Room
- ViewModel
- Compose/UI
- instrumentation
- screenshot
- E2E

---

# 188. UNIT TEST FALSE CONFIDENCE

ViewModel test sa potpuno mocked repository-jem ne potvrđuje:

- Room
- network
- serialization
- lifecycle

---

# 189. COROUTINE TESTS

Proveri:

- test dispatcher
- virtual time
- uncontrolled real dispatcher
- race coverage

---

# 190. FLOW TESTS

Proveri:

- initial state
- emissions
- error
- cancellation

---

# 191. ROOM MIGRATION TESTS

Za ozbiljnu bazu očekuj migration coverage.

Posebno stare supported verzije.

---

# 192. PROCESS DEATH TESTS

Ako critical flow zavisi od restoration-a, proveri da li postoji test ili manual verification.

---

# 193. ROTATION TESTS

Posebno forme, player, dialogs, selected state.

---

# 194. BACKGROUND/FOREGROUND TESTS

Simuliraj:

```text
foreground
↓
background
↓
system delay
↓
foreground
```

---

# 195. OFFLINE TESTS

Testiraj:

- cold start offline
- previously cached data
- mutation offline
- reconnect

samo ako app podržava takav model.

---

# 196. API FAILURE TESTS

Nemoj testirati samo HTTP 200.

Dodaj:

- 401
- 403
- 404
- 409
- 429
- 500
- timeout
- malformed response

prema relevantnom endpoint-u.

---

# 197. UI TEST ROBUSTNESS

Traži testove vezane za:

- tekst
- position
- timing

umesto stabilne semantics/test ID strategije.

---

# 198. FLAKY TESTOVI

Traži:

- sleep
- arbitrary delay
- uncontrolled async
- network
- animations

---

# 199. SCREENSHOT TESTS

Screenshot pass ne znači da feature funkcioniše.

Razlikuj visual correctness od behavior correctness.

---

# 200. CI

Pregledaj Android CI:

- JDK
- Gradle cache
- lint
- unit tests
- instrumentation
- assemble
- bundle
- signing

---

# 201. RELEASE BUILD U CI

Ako CI testira samo debug:

release-only problemi mogu ostati neotkriveni.

---

# 202. GRADLE CONFIGURATION

Pregledaj:

- duplicate dependencies
- dynamic versions
- repositories
- configuration cache
- build types

---

# 203. DYNAMIC DEPENDENCY VERSION

`1.+` ili slične verzije mogu napraviti nereproduktivne buildove.

---

# 204. REPOSITORIES

Proveri nepotrebne ili insecure repository source-ove.

---

# 205. SECRETS

Traži:

- API keys
- keystore passwords
- signing credentials
- service account
- private URLs

Ne prikazuj pun secret.

---

# 206. BUILD CONFIG FIELDS

Proveri da secret ubačen u BuildConfig ne završi trivijalno u APK-u ako se tretira kao tajna.

Client app ne može pouzdano sakriti pravi secret.

---

# 207. API KEY RESTRICTIONS

Client-visible API ključ treba da ima server/provider restrictions gde je moguće.

---

# 208. ROOTED DEVICE ASSUMPTION

Ne tretiraj lokalni client storage kao apsolutno tajan od vlasnika uređaja.

Threat model mora biti realan.

---

# 209. SCREENSHOTS / FLAG_SECURE

Ako aplikacija prikazuje veoma sensitive sadržaj, proveri da li product requirements traže screenshot zaštitu.

Ne uvodi automatski.

---

# 210. CLIPBOARD

Sensitive podatak kopiran u clipboard može biti dostupan drugim aplikacijama ili sistemu.

Proceni prema domenu.

---

# 211. INTENT LEAK

Proveri da sensitive extras nisu poslati implicitnim Intent-om bez potrebe.

---

# 212. PENDINGINTENT SECURITY

Ponovo proveri mutable PendingIntent posebno za external interaction.

---

# 213. SQL INJECTION

Room parameter binding uglavnom smanjuje rizik, ali raw queries sa user input-om treba pregledati.

---

# 214. WEBVIEW XSS / BRIDGE

Ako WebView postoji, tretiraj ga kao poseban trust boundary.

---

# 215. SERIALIZED INTENTS

Ne veruj Parcelable/Serializable input-u iz exported components.

---

# 216. DESERIALIZATION

Ako app deserializuje lokalne fajlove/import podatke, validiraj format.

---

# 217. IMPORT / BACKUP

Ako postoji user backup/import:

- schema version
- validation
- size
- duplicate IDs
- transaction
- destructive replace

---

# 218. BACKUP RESTORE

Prati:

```text
backup file
↓
parse
↓
validate
↓
migration
↓
DB transaction
↓
rebuild app state
```

---

# 219. PARTIAL RESTORE FAILURE

Ako restore padne na pola, da li ostaje polu-zamenjena baza?

---

# 220. DESTRUCTIVE RESET

Ako app ima reset:

- stop workers
- close DB
- clear cache
- files
- restart state

Proveri active background operations.

---

# 221. APP PROCESS RESTART

Ako reset/import zahteva restart, proveri deterministic behavior.

---

# 222. DEVICE ROTATION

Ponovo prođi sve:

- modal
- player
- form
- recording/upload
- navigation

---

# 223. MULTI-WINDOW

Ako target/use case opravdava, proveri state/lifecycle pri multi-window promenama.

---

# 224. FOLDABLES

Ako UI targetira large/foldable screens, proveri adaptive layout.

Ako nije deo scope-a:

**NOT APPLICABLE**

---

# 225. CONFIGURATION LOCALE CHANGE

Ako jezik može da se menja runtime, proveri recreation i state restoration.

---

# 226. DARK MODE

Proveri osnovni functional impact:

- nevidljiv tekst
- custom drawable
- system bars

Detaljni vizuelni audit može biti zaseban.

---

# 227. FONT SCALE

Android korisnik može povećati font.

Proveri critical screens za clipping i unreachable controls.

---

# 228. DISPLAY SIZE

Isto za system display scaling.

---

# 229. TALKBACK

Ako možeš runtime testirati:

- focus order
- labels
- dynamic state

Ako ne:

**TALKBACK RUNTIME TEST: NOT VERIFIED**

---

# 230. OFFLINE COLD START

Ako offline funkcionalnost postoji:

```text
kill process
↓
disable network
↓
launch app
```

Šta korisnik dobija?

---

# 231. PROCESS DEATH DURING WRITE

Scenario:

```text
critical operation starts
↓
process killed
```

Da li operation:

- nije započeta
- završena atomically
- može biti recovered

---

# 232. APP KILLED TOKOM UPLOAD-A

Ako upload treba da preživi UI lifecycle, proveri architecture.

---

# 233. REBOOT

Za durable jobs proveri behavior nakon reboot-a.

---

# 234. LOW STORAGE

Database/file write može pasti.

Da li error ostavlja korumpirano stanje?

---

# 235. LOW MEMORY

OS može ubiti background components.

Ne oslanjaj se na static/global memory za durability.

---

# 236. CLOCK CHANGE

Ako app koristi device time za:

- subscription
- cooldown
- security
- sync ordering

proveri manipulaciju/promenu sata.

---

# 237. TIMEZONE CHANGE

Putovanje korisnika može promeniti timezone dok app radi.

---

# 238. LANGUAGE CHANGE

App može biti restarted/recreated.

Proveri persisted values koji čuvaju lokalizovani display string umesto canonical value.

---

# 239. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Screen/Component:
Module:
File:
Function/Class:
Relevant code:

Android versions affected:
Build variant:
Lifecycle state:

Problem:

Evidence:

Execution/Lifecycle Flow:

Reproduction:

Expected behavior:

Actual behavior:

User impact:

Data/Security impact:

Root cause:

Recommended remediation:

Regression test:

Verification:

Complexity:
XS / S / M / L / XL
```

---

# 240. SEVERITY

Koristi:

## P0 - CRITICAL

- ozbiljan unauthorized data access
- catastrophic data loss
- critical security compromise
- masovna korupcija korisničkih podataka

## P1 - HIGH

- crash glavnog flow-a
- ozbiljan ANR
- veliki data integrity problem
- auth/security problem
- release build failure glavnog feature-a
- process-death failure koji gubi critical data

## P2 - MEDIUM

- realan lifecycle/reliability problem ograničenijeg scope-a
- važan feature sa workaround-om

## P3 - LOW

- edge-case bug
- manji compatibility problem

## P4 - IMPROVEMENT

- architectural/performance/UX unapređenje koje nije postojeći bug

---

# 241. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

direktno dokazano kodom, testom ili runtime reprodukcijom.

MEDIUM:

jak evidence, ali nedostaje device/runtime potvrda.

LOW:

zavisi od Android verzije, OEM-a ili production config-a koji nisu dostupni.

---

# 242. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 243. ANDROID VERSION SCOPE

Za version-specific problem navedi relevantan API range ako je pouzdano utvrđen.

Ako nije:

```text
Affected API levels: NOT VERIFIED
```

Ne izmišljaj API granicu.

---

# 244. OEM-SPECIFIC CLAIMS

Ne tvrdi:

> Samsung ubija ovaj worker.

bez runtime/evidence potvrde.

OEM-specific behavior označi kao:

**NOT VERIFIED**

ako nije direktno provereno.

---

# 245. NE MENJAJ KOD

Tokom audita:

- ne refaktoriši
- ne update-uj dependencies
- ne menjaj target SDK
- ne menjaj manifest
- ne menjaj database schema
- ne menjaj ProGuard
- ne otvaraj PR

Prvo završi audit.

---

# 246. TOOLING VERIFICATION

Ako imaš odgovarajuće okruženje, pokušaj:

```text
./gradlew lint
./gradlew test
./gradlew assembleDebug
./gradlew assembleRelease
```

ili odgovarajuće taskove projekta.

Ako release build zahteva secrets/signing koji nisu dostupni:

**RELEASE BUILD: NOT VERIFIED**

Nemoj zaobilaziti bezbednosne kontrole samo da build prođe.

---

# 247. OUTPUT - ANDROID_AUDIT_REPORT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- svrha aplikacije
- Android stack
- min/target SDK
- architecture
- overall production readiness
- najveći problemi
- najbolje implementirani delovi

## 2. Technology Inventory

| Area | Technology | Version | Status |
|---|---|---|---|

## 3. Module Architecture

## 4. Application Architecture

## 5. Critical User Flows

## 6. Lifecycle Audit

## 7. Process Death / State Restoration

## 8. Compose / Views Audit

## 9. Navigation Audit

## 10. ViewModel / State Audit

## 11. Coroutines Audit

## 12. Flow Audit

## 13. Concurrency / Race Conditions

## 14. Network Audit

## 15. Authentication Audit

## 16. Room / Persistence Audit

## 17. Offline / Sync Audit

## 18. WorkManager Audit

## 19. Services / Receivers Audit

## 20. Notifications Audit

## 21. Permissions Audit

## 22. Storage / Files Audit

## 23. Security Audit

## 24. Performance / ANR Audit

## 25. Memory Audit

## 26. Media Audit

Ako postoji.

## 27. Accessibility Audit

## 28. Android Version Compatibility

## 29. Debug vs Release Audit

## 30. R8 / ProGuard Audit

## 31. Dependency Audit

## 32. Test Suite Audit

## 33. CI / Release Pipeline Audit

## 34. Findings Summary

| ID | Severity | Category | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 35. P0 Findings

## 36. P1 Findings

## 37. P2 Findings

## 38. P3 Findings

## 39. P4 Improvements

## 40. Things Done Well

## 41. Unknown / Not Verified

## 42. Production Readiness Checklist

Koristi:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Za najmanje:

- clean Gradle sync
- lint
- unit tests
- debug build
- release build
- R8
- app startup
- rotation
- process death
- background/foreground
- offline
- API errors
- Room migration
- auth
- logout cleanup
- permissions
- notifications
- WorkManager
- deep links
- security
- ANR risks
- memory
- accessibility
- target Android compatibility

## 43. Top Problems by Risk

## 44. Top Problems by ROI

## 45. Remediation Roadmap

### Phase 0 - Emergency

P0.

### Phase 1 - Before Release

P1.

### Phase 2 - Reliability

P2.

### Phase 3 - Quality

P3.

### Phase 4 - Optimization

P4.

---

# 248. SECOND PASS - ANDROID LIFECYCLE ATTACK

Nakon prvog audita nemoj samo ponovo čitati fajlove.

Promeni perspektivu.

Za svaki critical screen uradi mentalni test:

```text
open screen
↓
start operation
↓
rotate
↓
background app
↓
process killed
↓
return
```

Pitaj:

- šta preživljava
- šta se ponavlja
- šta se gubi
- šta može biti duplirano

---

# 249. DOUBLE ACTION PASS

Za svaku critical akciju:

```text
tap twice quickly
```

Proveri:

- duplicate navigation
- duplicate DB insert
- duplicate API call
- duplicate payment/message
- duplicate worker

---

# 250. SLOW NETWORK PASS

Pretpostavi da request traje 30 sekundi.

Tokom toga korisnik:

- rotira ekran
- ode na drugi ekran
- minimizuje app
- vrati se

Pitaj:

> Gde response završava?

---

# 251. NO NETWORK PASS

Za svaki network-dependent screen proveri:

- cold start
- cached state
- retry
- error
- user feedback

---

# 252. PROCESS DEATH PASS

Ovo ponovi za:

- form
- player
- upload
- recording
- checkout
- navigation
- selected filters

gde je relevantno.

---

# 253. RELEASE BUILD PASS

Pitaj:

> Šta može raditi u debug-u, a pasti nakon R8/resource shrinking/signing konfiguracije?

Posebno:

- reflection
- serialization
- JNI
- dependency injection
- navigation arguments

---

# 254. OLD APP VERSION PASS

Pretpostavi korisnika sa APK-om starim šest meseci.

Pitaj:

- da li API i dalje radi
- da li enum može sadržati novu vrednost
- da li server zahteva novo polje
- da li auth protocol ostaje kompatibilan

---

# 255. LOW RESOURCE PASS

Pretpostavi:

- spor uređaj
- malo RAM-a
- skoro pun storage
- slab network

Pitaj:

> Koji flow prvi postaje nepouzdan?

---

# 256. MULTI-ACCOUNT PASS

Ako postoji login:

```text
A login
↓
use app
↓
logout
↓
B login
```

Ponovo proveri:

- Room
- DataStore
- files
- cache
- notifications
- workers
- global state

---

# 257. BACKGROUND EXECUTION PASS

Pitaj:

> Koji feature pretpostavlja da app može slobodno da radi u background-u?

Proveri protiv savremenog Android execution model-a.

---

# 258. SECURITY SECOND PASS

Pitaj:

> Koju komponentu druga aplikacija može direktno pozvati?

Ponovo proveri:

- exported Activity
- Service
- Receiver
- Provider
- deep links
- PendingIntent

---

# 259. DATA LOSS SECOND PASS

Pitaj:

> Gde korisnik može dobiti signal "sačuvano", iako podatak nije durable?

Posebno:

- async DB
- network
- offline sync
- file export
- background work

---

# 260. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nijedan P0/P1 nije zasnovan samo na pattern match-u
- lifecycle finding ima konkretan lifecycle scenario
- process death nije pomešan sa običnom rotation-om
- ViewModel nije pogrešno tretiran kao durable storage
- coroutine cancellation je analizirana kroz ownership
- race condition ima konkretan event ordering
- Room finding proverava transactions/constraints
- worker finding proverava retry i idempotency
- release behavior je analiziran odvojeno od debug-a
- R8 finding nije izmišljen bez reflection/serialization razloga
- permission model je version-aware
- OEM-specific tvrdnje nisu izmišljene
- API compatibility uzima u obzir stare instalirane aplikacije
- security finding proverava exported/trust boundaries
- test pass nije predstavljen kao dokaz da lifecycle edge cases ne postoje
- improvements su odvojeni od bugova
- preporučeni fix rešava root cause

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite Clean Architecture, ViewModel, Room, Hilt i WorkManager.

To nije Android audit.

Želim da rekonstruišeš stvarno ponašanje aplikacije.

Android bug često izgleda ovako:

```text
Activity starts request
↓
user rotates device
↓
old Activity destroyed
↓
request completes
↓
callback references old Activity
↓
memory leak or invalid UI operation
```

ili:

```text
Fragment View created
↓
binding stored
↓
onDestroyView
↓
binding reference remains
↓
Fragment stays on back stack
↓
old View hierarchy retained
```

ili:

```text
three API requests receive 401
↓
three interceptor calls start token refresh
↓
refresh token rotated by first request
↓
remaining refresh calls fail
↓
session becomes inconsistent
```

ili:

```text
user starts offline edit
↓
local DB updated
↓
WorkManager scheduled
↓
app process dies
↓
worker later executes twice after retry
↓
server mutation is not idempotent
↓
duplicate record created
```

ili:

```text
debug build
↓
reflection-based serializer works
↓
release build
↓
R8 renames/removes model metadata
↓
production-only crash
```

ili:

```text
User A logs out
↓
token removed
↓
Room database not cleared
↓
User B logs in
↓
cached A records are emitted immediately
↓
cross-user data exposure
```

To su problemi koje treba da tražiš.

Razmišljaj kroz:

- lifecycle
- process death
- background restrictions
- coroutine ownership
- Flow semantics
- persistence
- retries
- idempotency
- Android version differences
- debug/release razlike
- user switching
- stare instalirane verzije

Ako nešto nije runtime potvrđeno:

**NOT VERIFIED.**

Ako zavisi od određenog Android/API nivoa koji nisi proverio:

**VERSION SCOPE NOT VERIFIED.**

Ako je samo unapređenje:

**P4 - IMPROVEMENT.**

Bolje je pronaći 10 stvarnih Android lifecycle/reliability problema nego napisati 100 generičkih "Clean Architecture" preporuka.

Cilj je dobiti forenzički precizan Android audit koji se može direktno pretvoriti u:

- reprodukciju
- regression test
- fix
- release verification
- production-readiness plan
