---
id: UPL-IT-013
number: 13
slug: android-lifecycle-bug-hunter
title: Lov na lifecycle bagove u Android aplikacijama
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# LOV NA LIFECYCLE BAGOVE U ANDROID APLIKACIJAMA

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu Android lifecycle problema u kompletnoj aplikaciji.

Glavni cilj:

> Pronaći stvarne bugove koji nastaju kada Activity, Fragment, View, Compose screen, ViewModel, Service, coroutine, observer ili drugi resource žive kraće ili duže nego što implementacija pretpostavlja.

Ovo nije:

- generički Android code review
- architecture audit cele aplikacije
- lista lifecycle best practices
- automatski refactor
- savet da se sve prebaci u ViewModel
- potraga za svakim `onCreate` ili `onDestroy`
- pokušaj da se svaki state sačuva po svaku cenu

Fokus je na bugovima koji nastaju zbog:

- configuration change-a
- rotation-a
- Fragment View lifecycle-a
- navigation-a
- Activity recreation-a
- app background/foreground tranzicije
- process death-a
- system reclaim-a
- observer lifecycle-a
- coroutine ownership-a
- resource cleanup-a
- service lifecycle-a
- delayed callbacks
- asynchronous rezultata koji stižu prekasno
- pogrešnog state restoration-a

Prioritet:

**correctness > data preservation > lifecycle safety > resource safety > UX continuity > architecture elegance**

Bolje je pronaći 8 stvarnih lifecycle bugova nego napisati 80 generičkih Android preporuka.

---

# 1. UTVRDI ANDROID STACK

Pre analize utvrdi:

- Android Gradle Plugin
- Kotlin
- `minSdk`
- `targetSdk`
- Activities
- Fragments
- Jetpack Compose
- Navigation Component
- ViewModel
- SavedStateHandle
- LiveData
- Flow / StateFlow / SharedFlow
- Coroutines
- Room
- WorkManager
- Services
- Media components
- dependency injection
- test framework

Posebno utvrdi da li aplikacija koristi:

- single Activity architecture
- multiple Activities
- Fragment-based navigation
- Compose Navigation
- hybrid Views + Compose
- custom lifecycle ownership

Ne koristi zastarele lifecycle pretpostavke.

---

# 2. NAPRAVI LIFECYCLE MAPU

Pre finding-a mapiraj glavne lifecycle owner-e.

Primer:

```text
Application
↓
Activity
↓
Fragment
↓
Fragment View
↓
ComposeView / Composable
↓
ViewModel
↓
Coroutine / Flow collector
↓
Resource
```

Za svaki važan deo aplikacije utvrdi:

- ko ga kreira
- kada postaje aktivan
- ko ga poseduje
- kada mora prestati da radi
- šta treba preživeti
- šta ne treba preživeti

---

# 3. KLJUČNO PRAVILO

Za svaki state, coroutine, listener ili resource postavi dva pitanja:

> Da li živi kraće nego što treba?

i:

> Da li živi duže nego što treba?

Prva grupa proizvodi:

- izgubljeni state
- prekinute operacije
- reset UI-ja

Druga grupa proizvodi:

- memory leak
- stale callback
- duplicate event
- invalid UI access
- cross-screen behavior

---

# 4. ACTIVITY LIFECYCLE

Za svaku važnu Activity proveri:

- `onCreate`
- `onStart`
- `onResume`
- `onPause`
- `onStop`
- `onDestroy`

Traži code koji pretpostavlja da:

```text
onDestroy = application exit
```

To nije pouzdana pretpostavka.

---

# 5. ACTIVITY RECREATION

Mentalno izvrši:

```text
Activity A
↓
configuration change
↓
old Activity destroyed
↓
new Activity created
```

Proveri:

- state
- observers
- callbacks
- dialogs
- coroutines
- adapters
- resources

---

# 6. CONFIGURATION CHANGE

Testiraj najmanje:

- rotation
- locale change
- font scale
- dark/light mode
- screen size change

Ne mora svaka konfiguracija biti relevantna svakom projektu.

---

# 7. `configChanges`

Ako manifest koristi:

```xml
android:configChanges
```

utvrdi zašto.

Ne tretiraj ga automatski kao bug.

Ali proveri da li samo skriva lifecycle problem koji aplikacija zapravo ne rešava.

---

# 8. STATE POSLE ROTATION-A

Za critical screen proveri:

- selected tab
- form input
- selected item
- filters
- scroll
- dialog
- playback position
- search query
- loading state

Klasifikuj:

```text
SHOULD SURVIVE
SHOULD RESET
NOT VERIFIED
```

---

# 9. VIEWMODEL

ViewModel preživljava configuration change, ali ne i process death.

Nikada nemoj koristiti argument:

> State je bezbedan jer je u ViewModel-u.

bez razmatranja process death-a.

---

# 10. VIEWMODEL SCOPE

Utvrdi stvarni owner:

- Activity
- Fragment
- parent Fragment
- navigation graph
- Compose destination

Pogrešan scope može proizvesti:

- state koji se resetuje prerano
- state koji živi predugo
- state deljen pogrešnom screen-u

---

# 11. ACTIVITY-SCOPED VIEWMODEL

Ako dva Fragment-a koriste isti Activity ViewModel, proveri da li je sharing nameran.

Scenario:

```text
Fragment A
↓
sets selectedItem
↓
Fragment B
↓
unexpectedly inherits same state
```

---

# 12. NAVIGATION GRAPH VIEWMODEL

Ako ViewModel treba da živi tokom celog nested flow-a, proveri da nije slučajno scoped samo jednom destination-u.

---

# 13. STALE VIEWMODEL

Scenario:

```text
screen item A
↓
ViewModel created
↓
navigate item B
↓
same ViewModel retained
↓
state for A remains
```

Proveri keys/owners/arguments.

---

# 14. FRAGMENT LIFECYCLE

Posebno razlikuj:

```text
Fragment lifecycle
```

od:

```text
Fragment View lifecycle
```

Ovo je jedan od najvažnijih izvora Android bugova.

---

# 15. FRAGMENT VIEW DESTRUCTION

Scenario:

```text
Fragment remains on back stack
↓
onDestroyView()
↓
Fragment object still alive
```

Svaka referenca na staru View hijerarhiju može postati problem.

---

# 16. VIEW BINDING

Traži pattern:

```kotlin
private var _binding: FragmentXBinding? = null
```

Proveri da se binding pravilno briše u:

```text
onDestroyView
```

Ne prijavljuj automatski ako projekat koristi lifecycle-safe delegate.

---

# 17. STALE VIEW REFERENCE

Traži:

- cached View
- adapter reference
- dialog binding
- RecyclerView
- toolbar
- TextView reference

koja preživljava `onDestroyView`.

---

# 18. `viewLifecycleOwner`

Za UI observaciju u Fragment-u proveri korišćenje:

```text
viewLifecycleOwner
```

umesto Fragment lifecycle-a kada observer direktno manipuliše View-em.

---

# 19. OBSERVER POSLE DESTROYVIEW

Scenario:

```text
Fragment View destroyed
↓
Flow/LiveData emits
↓
observer tied to Fragment lifecycle
↓
callback tries to update old binding
```

To može biti:

- crash
- stale UI
- leak

---

# 20. COMPOSE U FRAGMENT-U

Ako `ComposeView` živi u Fragment View lifecycle-u, proveri composition disposal strategy.

Pogrešan owner može ostaviti composition živim posle View-a.

---

# 21. COMPOSE LIFECYCLE

Ako je aplikacija Compose-first, mapiraj:

- composition lifetime
- NavBackStackEntry
- Activity lifecycle
- ViewModel lifecycle

Ne tretiraj odlazak composable-a iz composition-a kao process death.

---

# 22. `LaunchedEffect`

Ako screen ode iz composition-a, effect se cancel-uje.

Pitaj:

> Da li je to poželjno za posao koji radi?

Ako operation mora preživeti screen, UI scope možda nije pravi owner.

---

# 23. `rememberCoroutineScope`

Isti princip.

Scope se vezuje za composition.

Ne koristi ga za durable business posao koji mora nastaviti posle navigation-a.

---

# 24. LIFECYCLE COROUTINES

Mapiraj:

- `lifecycleScope`
- `viewLifecycleOwner.lifecycleScope`
- `viewModelScope`
- custom scope

Za svaki job odredi očekivani lifetime.

---

# 25. WRONG SCOPE

Primer:

```text
database sync
↓
launched in Fragment viewLifecycleOwner scope
↓
user navigates away
↓
sync cancelled
```

Ako sync treba da završi bez obzira na UI, scope je možda pogrešan.

---

# 26. SUPROTAN PROBLEM

Primer:

```text
UI animation callback
↓
launched in application scope
↓
screen destroyed
↓
callback keeps reference/state
```

Job živi predugo.

---

# 27. CUSTOM COROUTINE SCOPE

Za svaki custom scope utvrdi:

- owner
- Job
- dispatcher
- cancellation point

Ako niko ne poziva `cancel`, proveri leak/resource problem.

---

# 28. GLOBALSCOPE

Svako korišćenje proveri detaljno.

Finding zahteva konkretan ownership problem, ne samo činjenicu da `GlobalScope` postoji.

---

# 29. ASYNC CALLBACK POSLE SCREEN-A

Jedan od glavnih pattern-a:

```text
Screen A
↓
request starts
↓
user navigates away
↓
response arrives
↓
callback updates A
```

Proveri da li:

- callback još ima validan owner
- rezultat treba ignorisati
- rezultat pripada shared state-u
- navigation event može biti pogrešno pokrenut

---

# 30. DELAYED CALLBACK

Traži:

- Handler
- `postDelayed`
- timer
- coroutine delay
- scheduler

koji posle kašnjenja pristupa Activity/Fragment/View-u.

---

# 31. HANDLER

Proveri callback removal gde je potrebno.

Posebno ako Runnable capture-uje Activity/View.

---

# 32. TIMER

Ako timer pripada screen-u, proveri kada se cancel-uje.

---

# 33. COUNTDOWN

Ako countdown treba da nastavi kroz background/recreation, nemoj ga zasnivati samo na decrement-u u memory-ju.

Bolji model često je računanje iz canonical timestamp-a.

Ali prijavi samo ako trenutni model stvarno može driftovati.

---

# 34. PROCESS DEATH

Ovo tretiraj kao potpuno odvojen scenario od rotation-a.

Simuliraj:

```text
app backgrounded
↓
Android kills process
↓
user returns through Recents
```

Proveri šta se rekonstruiše.

---

# 35. VIEWMODEL POSLE PROCESS DEATH-A

Stari ViewModel ne postoji.

Novi ViewModel mora dobiti dovoljno podataka da rekonstruiše screen.

---

# 36. NAVIGATION ARGUMENTS

Proveri da critical destination može biti rekonstruisana iz:

- route argumenta
- ID-a
- persisted source-a

a ne samo iz prethodnog in-memory screen state-a.

---

# 37. SCREEN ZAVISI OD PRETHODNOG SCREEN-A

Problematičan flow:

```text
List screen
↓
stores selected object globally
↓
Detail screen reads global object
```

Ako process umre dok je Detail otvoren:

```text
global object gone
```

Detail možda više nema podatke za reconstruction.

---

# 38. PASS ID, NOT WHOLE EPHEMERAL STATE

Ako screen može rekonstruisati resource iz ID-a, to je često robustniji model.

Ali ne prepisuj architecture ako trenutni model već bezbedno persistira state.

---

# 39. SAVEDSTATEHANDLE

Proveri:

- koje vrednosti se čuvaju
- njihove veličine
- serialization
- default
- restoration

---

# 40. STATE RESTORATION SOURCE

Za svaki critical screen označi:

```text
ViewModel only
SavedStateHandle
Room/database
DataStore
navigation argument
file
server
none
```

---

# 41. DURABLE VS EPHEMERAL

Razlikuj:

**Ephemeral UI state**

- open tab
- scroll
- temporary selection

**Durable user data**

- draft
- created record
- payment
- recording
- downloaded file

Durable podatak ne treba da zavisi samo od lifecycle state-a.

---

# 42. FORM PROCESS DEATH

Za duge forme proveri:

```text
user enters 20 fields
↓
background
↓
process death
↓
return
```

Da li je očekivanje proizvoda:

- restore all
- restore draft
- reset

Dokumentuj actual vs expected.

---

# 43. UNSAVED CHANGES

Ako screen ima unsaved data, proveri:

- Back
- navigation
- configuration change
- process death

Ne mora svaki app imati autosave, ali behavior treba biti konzistentan.

---

# 44. ACTIVITY RESULT API

Pregledaj:

- file picker
- permissions
- camera
- external Activity

Proveri lifecycle-safe registration.

---

# 45. LEGACY `startActivityForResult`

Ako postoji, proveri da li current implementation pouzdano rukuje recreation-om.

Ne prijavljuj samo zato što API ima moderniju zamenu.

---

# 46. RESULT POSLE RECREATION-A

Scenario:

```text
external picker opened
↓
Activity recreated
↓
result returns
```

Da li callback i dalje stiže pravom owner-u?

---

# 47. FRAGMENT RESULT API

Ako se koristi, proveri lifecycle i key collision.

---

# 48. DIALOGFRAGMENT

Proveri:

- state restoration
- callback owner
- duplicate dialog
- transaction state

---

# 49. CUSTOM DIALOG

Ako se običan Dialog vezuje za Activity/Fragment ručno, proveri leak i recreation.

---

# 50. WINDOW LEAK

Scenario:

```text
Activity finishing
↓
dialog still attached
```

Traži `WindowLeaked` rizik gde je realan.

---

# 51. TOAST

Toast obično nije veliki lifecycle problem, ali custom Toast/View sa Activity context-om može biti.

Proveri samo ako postoji custom implementacija.

---

# 52. SNACKBAR

Ako Snackbar koristi stari View posle navigation-a, može završiti na pogrešnom screen-u ili pasti.

---

# 53. LIVE DATA

Za svaki LiveData observer proveri owner.

Posebno:

- Activity
- Fragment
- Fragment View

---

# 54. `observeForever`

Svako korišćenje detaljno analiziraj.

Pitaj:

> Ko ga uklanja?

Ako nikad nije uklonjen, postoji realan leak/duplicate callback rizik.

---

# 55. FLOW COLLECTION

Proveri da Flow collection odgovara lifecycle-u.

---

# 56. `repeatOnLifecycle`

Ako se koristi, proveri koji state:

- STARTED
- RESUMED

i da li odgovara poslu.

---

# 57. FLOW RESTART

`repeatOnLifecycle` može ponovo pokretati block pri ponovnom ulasku u state.

Pitaj:

> Da li posao sme da se restartuje?

---

# 58. DUPLICATE API REQUEST

Scenario:

```text
STARTED
↓
collector starts
↓
STOPPED
↓
cancelled
↓
STARTED
↓
collector starts
↓
cold Flow repeats API request
```

Ako request nije trebalo ponavljati, ovo je realan lifecycle/data problem.

---

# 59. HOT FLOW

Ako upstream radi nezavisno od collector-a, proveri sharing scope.

---

# 60. `stateIn`

Scope određuje koliko dugo upstream živi.

Predugačak scope može trošiti resurse.

Prekratak može restartovati skupe operacije.

---

# 61. `SharingStarted`

Proveri `WhileSubscribed`, `Eagerly`, `Lazily` u odnosu na feature.

---

# 62. SENSOR LISTENERS

Ako app koristi:

- accelerometer
- gyroscope
- proximity
- location

proveri registration/unregistration lifecycle.

---

# 63. LOCATION

Pitaj:

> Treba li location update dok Activity nije vidljiva?

Ako ne, listener treba prestati u odgovarajućem lifecycle-u.

---

# 64. CAMERA

Camera lifecycle treba pratiti odgovarajući owner.

Proveri:

- background
- rotation
- permission
- process recreation

---

# 65. BLUETOOTH

Ako postoji connection/session, utvrdi da li pripada:

- screen-u
- Activity-ju
- Service-u
- application/session layer-u

Pogrešan owner može prekinuti vezu ili je zadržati predugo.

---

# 66. USB

Isto za hardware resource lifecycle.

---

# 67. MEDIA PLAYER

Mapiraj:

```text
create
↓
prepare
↓
play
↓
pause/background
↓
release
```

Pitaj:

> Da li playback treba da preživi screen?

---

# 68. PLAYER U ACTIVITY-JU

Ako treba background playback, Activity lifecycle je možda prekratak.

---

# 69. PLAYER U GLOBAL SINGLETON-U

Ako playback ne treba da preživi feature, global ownership može biti predug.

---

# 70. PLAYER LISTENERS

Proveri da listener sa screen reference-om ne ostane registrovan nakon destroy-a.

---

# 71. WEBVIEW

WebView je resource-heavy.

Proveri:

- owner
- navigation
- cleanup
- destroy
- Activity reference

---

# 72. MAP VIEW

Map/SDK components često imaju sopstveni lifecycle.

Proveri forwarding odgovarajućih lifecycle events ako biblioteka to zahteva.

---

# 73. AD SDK

Third-party SDK callback može stići nakon Activity destroy-a.

Proveri current screen validation.

---

# 74. BILLING

Purchase flow može preživeti Activity recreation.

Proveri da rezultat ne zavisi samo od instance Activity-ja koja je pokrenula purchase.

---

# 75. PAYMENT EXTERNAL ACTIVITY

Isto za payment/provider callback.

---

# 76. NOTIFICATION FLOW

Notification može otvoriti novu Activity instancu dok druga već postoji.

Proveri:

- launch mode
- flags
- task stack

---

# 77. MULTIPLE ACTIVITY INSTANCES

Scenario:

```text
existing MainActivity
↓
notification
↓
new MainActivity created
```

Ako app pretpostavlja jednu instancu, state može postati nekonzistentan.

---

# 78. LAUNCH MODE

Pregledaj:

- standard
- singleTop
- singleTask
- singleInstance

Ne menjaj launch mode bez razumevanja back-stack posledica.

---

# 79. `onNewIntent`

Ako se koristi `singleTop`/`singleTask`, proveri da new Intent zaista osvežava state.

---

# 80. DEEP LINK NA POSTOJEĆU ACTIVITY

Stari ViewModel/state može ostati vezan za prethodni resource ako new Intent nije pravilno obrađen.

---

# 81. BACKGROUND / FOREGROUND

Simuliraj:

```text
app active
↓
Home
↓
5 min
↓
return
```

Proveri:

- auth
- stale data
- active timers
- paused resources

---

# 82. LONG BACKGROUND

Ponovi sa:

- nekoliko sati
- session expiry
- backend data changes

Ne izmišljaj vremenski prag koji proizvod nije definisao.

---

# 83. SESSION EXPIRY

Ako session istekne dok je app u background-u:

```text
foreground resume
```

mora dati konzistentno stanje.

---

# 84. FOREGROUND REFRESH

Ako app refreshuje podatke svaki put u `onResume`, proveri:

- duplicate request
- navigation return
- dialog return
- permission return

`onResume` se može pozivati mnogo češće nego "app opened".

---

# 85. `onResume` KAO APP START

Traži pogrešnu pretpostavku:

```text
onResume = user opened app from launcher
```

Nije tačno.

---

# 86. `onPause` KAO APP BACKGROUND

Isto:

Dialog/external Activity može izazvati pause bez pravog background-a.

---

# 87. PROCESS LIFECYCLE OWNER

Ako app prati globalni foreground/background preko ProcessLifecycleOwner-a, proveri da li behavior odgovara nameri.

---

# 88. GLOBAL APP LOCK

Ako app zahteva PIN/biometric nakon background-a, proveri:

- ProcessLifecycleOwner
- external Activities
- configuration changes

da se lock ne pokreće u pogrešnim situacijama.

---

# 89. TIMER ZA BACKGROUND

Ako se meri vreme od odlaska u background, koristi realni timestamp umesto lifecycle callback count-a.

---

# 90. APP STARTUP

Application `onCreate` može se pozvati u više procesa ako aplikacija koristi multi-process components.

Proveri samo ako projekat ima više procesa.

---

# 91. MULTI-PROCESS

Ako manifest koristi:

```text
android:process
```

mapiraj koji initialization kod radi u kom procesu.

---

# 92. STATIC SINGLETON

Singleton je per-process, ne nužno globalno jedan za celu aplikaciju ako ima više procesa.

---

# 93. SERVICES

Za svaki Service utvrdi:

- started
- bound
- foreground
- lifecycle owner

---

# 94. STARTED SERVICE

Proveri šta se događa ako system ubije process/service.

---

# 95. `START_STICKY`

Ako se koristi, proveri behavior kada se service recreira bez originalnog Intent-a.

---

# 96. `START_REDELIVER_INTENT`

Proveri duplicate work scenario.

---

# 97. BOUND SERVICE

Mapiraj bind/unbind lifecycle.

Traži:

- connection leak
- callback posle unbind-a
- Activity reference

---

# 98. FOREGROUND SERVICE

Proveri:

- start
- notification
- stop
- task completion
- process recreation

---

# 99. WORKMANAGER

Worker lifecycle je drugačiji od UI lifecycle-a.

Ne pokreći durable work samo kroz Activity coroutine ako treba da preživi app close.

---

# 100. UI + WORKER DUPLIKACIJA

Scenario:

```text
foreground sync starts
↓
app backgrounds
↓
worker starts same sync
```

Proveri deduplication/idempotency.

---

# 101. BROADCAST RECEIVER

Runtime-registered receiver mora imati jasan unregister owner.

---

# 102. REGISTER/UNREGISTER SYMMETRY

Napravi parove:

```text
register -> unregister
bind -> unbind
addListener -> removeListener
start -> stop
open -> close
```

Za svaki resource proveri simetriju.

---

# 103. OBSERVER DUPLIKACIJA

Scenario:

```text
onStart
↓
register observer
↓
onStop
↓
not removed
↓
onStart
↓
register again
```

Jedan event može izazvati dva callback-a.

---

# 104. EVENT BUS

Ako postoji event bus, proveri subscription lifecycle.

---

# 105. RXJAVA

Ako projekat koristi RxJava:

- CompositeDisposable
- lifecycle
- repeated subscribe
- disposal

---

# 106. DISPOSABLE OWNER

Pitaj:

> Kada subscription više nema smisla?

Dispose treba odgovarati toj granici.

---

# 107. CALLBACK API

Legacy SDK callbacks često nisu lifecycle-aware.

Mapiraj registration/cancellation.

---

# 108. CALLBACK TO COROUTINE BRIDGE

Ako se koristi `suspendCancellableCoroutine`, proveri:

- cancellation handler
- callback unregister
- double resume

---

# 109. DOUBLE RESUME

Callback API koji može vratiti success i error ili callback posle cancellation-a može izazvati problem.

---

# 110. RESOURCE CLOSURE

Pregledaj:

- Cursor
- InputStream
- OutputStream
- file descriptor
- ParcelFileDescriptor

Proveri `use`/close.

---

# 111. DATABASE CURSOR

Ako postoji raw SQLite/Cursor, proveri lifecycle.

---

# 112. ACTIVITY CONTEXT

Traži Activity referencu sačuvanu u:

- singleton
- repository
- companion object
- long-lived callback

---

# 113. FRAGMENT REFERENCE

ViewModel/repository ne treba da drži Fragment instance.

Ako postoji, proveri leak i architecture problem.

---

# 114. VIEW REFERENCE U VIEWMODELU

Ovo je visok signal.

Proveri konkretan use case.

ViewModel uglavnom ne treba da poseduje Android View.

---

# 115. NAVCONTROLLER REFERENCE

Dugotrajni slojevi ne treba da zadržavaju NavController.

Navigation event model treba imati jasan lifecycle.

---

# 116. ADAPTER CONTEXT

RecyclerView adapter koji drži Activity context nije automatski leak ako adapter živi isto koliko i Activity.

Finding zahteva da adapter živi duže.

---

# 117. LISTENER CAPTURE

Anonymous listener može capture-ovati outer Activity/Fragment.

Prati gde je listener sačuvan.

---

# 118. STATIC CALLBACK

Static/global callback sa Activity referencom je high-risk pattern.

---

# 119. DELAYED NAVIGATION

Scenario:

```text
delay 2 sec
↓
navigate
```

Ako user u međuvremenu ode, proveri current destination pre navigation-a.

---

# 120. SPLASH

Ako splash koristi fixed delay, proveri:

- rotation
- duplicate navigation
- background
- process recreation

---

# 121. AUTH SPLASH

Auth routing treba da bude zasnovan na state-u, ne samo lifecycle timing-u.

---

# 122. INITIALIZATION RACE

Scenario:

```text
Activity starts
↓
session loading
↓
navigation decision runs too early
↓
wrong destination
```

---

# 123. PERMISSION DIALOG

System permission dialog menja lifecycle state.

Proveri da `onResume` side effects ne tretiraju povratak iz permission dialog-a kao fresh app launch.

---

# 124. SETTINGS SCREEN RETURN

Ako user ode u Android Settings da odobri permission:

```text
app background
↓
settings
↓
return
```

feature treba ponovo proveriti stvarno permission stanje.

---

# 125. CAMERA / EXTERNAL APP RETURN

Isto za external Activity flow.

---

# 126. BACK PRESS

Back može:

- popovati Fragment
- zatvoriti Activity
- dismiss dialog
- exit nested flow

Proveri critical state pri svakom.

---

# 127. CUSTOM BACK HANDLER

Custom Back ne sme prekinuti system/navigation state bez potrebe.

---

# 128. UNSAVED FORM + BACK

Ako postoji confirmation dialog, proveri:

```text
Back
↓
dialog
↓
rotation
```

Da li dialog i form state ostaju konzistentni?

---

# 129. DOUBLE BACK

Brzi višestruki Back može izazvati duplicate navigation/pop u lošoj implementaciji.

---

# 130. ACTIVITY FINISH

Ako async callback stigne nakon `finish()`, proveri da li pokušava UI operation.

---

# 131. `isFinishing`

Nemoj koristiti samo `isFinishing` kao univerzalno lifecycle rešenje.

Activity može biti destroyed iz drugih razloga.

---

# 132. `isDestroyed`

Isto.

Bolje je pravilno vezati operation za owner gde je moguće.

---

# 133. SCREEN OFF / ON

Ako feature zavisi od display state-a, proveri:

- media
- sensors
- timers

samo gde je relevantno.

---

# 134. DEVICE LOCK

Lock screen može backgroundovati app ili promeniti resource behavior.

Ako product feature to zahteva, testiraj.

---

# 135. PHONE CALL / INTERRUPTION

Media/camera/audio aplikacije treba da razmotre interruption lifecycle.

Ako nije relevantno:

**NOT APPLICABLE**

---

# 136. LOW MEMORY

Ne oslanjaj se na `onLowMemory` kao jedini resource management mehanizam.

Ali pregledaj ako app drži velike cache-eve.

---

# 137. `onTrimMemory`

Ako se koristi, proveri da critical state nije slučajno obrisan kao običan cache.

---

# 138. CACHE VS STATE

Resource cache može biti disposable.

User state ne sme biti izgubljen samo zato što app oslobađa memory.

---

# 139. MULTI-WINDOW

Activity može biti visible ali ne RESUMED zavisno od Android verzije/window modela.

Ako feature pauzira critical behavior u `onPause`, proveri multi-window scenario gde je relevantno.

---

# 140. PICTURE-IN-PICTURE

Ako postoji PiP:

- Activity lifecycle
- UI controls
- player ownership
- return to fullscreen

---

# 141. PiP ENTER/EXIT

Proveri da configuration/UI changes ne resetuju player state.

---

# 142. ORIENTATION LOCK

Ako app zaključava orientation, proveri da li time samo izbegava nerešen lifecycle problem.

Ne proglašavaj orientation lock samim po sebi bugom.

---

# 143. ACTIVITY RECREATION TEST

Ako tooling dozvoljava, koristi recreation test za critical Activity/Fragment.

---

# 144. `ActivityScenario.recreate()`

Može proveriti deo configuration recreation behavior-a.

Ali nije isto što i pravi process death.

---

# 145. PROCESS DEATH TEST LIMITATION

Nikada nemoj označiti:

```text
ActivityScenario.recreate() PASS
```

kao dokaz:

```text
PROCESS DEATH PASS
```

To su različite stvari.

---

# 146. DON'T KEEP ACTIVITIES

Developer option može pomoći u otkrivanju lifecycle problema.

Ali nije identična simulacija process death-a.

Jasno dokumentuj ograničenje.

---

# 147. BACKGROUND PROCESS KILL TEST

Ako možeš ručno/instrumentation testirati, dokumentuj tačan metod.

Ne tvrdi process-death verification ako ga nisi stvarno simulirao.

---

# 148. TEST MATRIX

Za critical screen napravi:

| Scenario | Tested | Result |
|---|---|---|
| Rotation | | |
| Background/foreground | | |
| Navigation away/back | | |
| Activity recreation | | |
| Process death | | |
| Double tap | | |
| Slow response | | |

---

# 149. PROCESS DEATH MATRIX

Za critical state:

| State | Source | Survives rotation | Survives process death | Expected |
|---|---|---|---|---|

---

# 150. RESOURCE LIFETIME MATRIX

| Resource | Created by | Expected lifetime | Cleanup | Risk |
|---|---|---|---|---|

Za:

- listeners
- players
- WebViews
- sensors
- services
- callbacks
- coroutines

---

# 151. COROUTINE MATRIX

| Job | Scope | Should survive screen | Cancellation | Risk |
|---|---|---|---|---|

---

# 152. FINDING FORMAT

Svaki ozbiljan finding:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Screen:
Lifecycle owner:
File:
Function/Class:
Relevant code:

Trigger:
Lifecycle transition:

Problem:

Evidence:

Lifecycle Flow:

Reproduction:

Expected behavior:

Actual behavior:

User impact:

Data impact:

Resource impact:

Root cause:

Recommended remediation:

Regression test:

Verification steps:

Complexity:
XS / S / M / L / XL
```

---

# 153. SEVERITY

Koristi:

## P1 - HIGH

- critical data loss
- glavni flow puca pri normalnom lifecycle događaju
- severe memory/resource leak
- major duplicate business action
- process death pravi neupotrebljiv critical screen

## P2 - MEDIUM

- realan lifecycle bug na važnom feature-u
- state loss sa workaround-om
- stale UI ili duplicate callback

## P3 - LOW

- ograničeni edge case
- lokalni state/reset problem

## P4 - IMPROVEMENT

- lifecycle architecture improvement bez trenutnog buga

P0 koristi samo ako lifecycle problem vodi do kritičnog security/data-loss incidenta.

---

# 154. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

runtime reprodukovano ili direktno dokazano lifecycle flow-om.

MEDIUM:

kod snažno ukazuje na problem, ali lifecycle scenario nije runtime potvrđen.

LOW:

zavisi od platform/system behavior-a koji nije proveren.

---

# 155. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 156. LIFECYCLE EVENT NIVO

Za finding označi relevantan događaj:

```text
CONFIGURATION CHANGE
VIEW DESTROY
ACTIVITY DESTROY
PROCESS DEATH
BACKGROUND
FOREGROUND
NAVIGATION
SERVICE RESTART
OTHER
```

---

# 157. FALSE-POSITIVE PREVENCIJA

Pre ozbiljnog nalaza proveri:

1. stvarni lifecycle owner
2. ViewModel scope
3. SavedStateHandle
4. DB/DataStore persistence
5. Flow sharing
6. coroutine scope
7. cleanup
8. navigation stack
9. testove
10. framework/library behavior

Ne zaključuj samo zato što ne vidiš `onDestroy()` cleanup u istom fajlu.

---

# 158. NEMOJ MEŠATI LIFECYCLE KATEGORIJE

Obavezno razlikuj:

```text
rotation/configuration change
```

od:

```text
process death
```

od:

```text
navigation away
```

od:

```text
app background
```

od:

```text
Activity finish
```

Fix za jedan scenario ne mora rešiti ostale.

---

# 159. NE MENJAJ KOD

Tokom audita:

- ne pomeraj state
- ne dodaj ViewModel
- ne menjaj coroutine scope
- ne dodaj SavedStateHandle
- ne menjaj manifest
- ne menjaj navigation

Prvo završi audit.

---

# 160. OUTPUT - ANDROID_LIFECYCLE_BUG_AUDIT.md

Finalni izveštaj:

## 1. Executive Summary

- lifecycle architecture
- najveći lifecycle rizici
- critical state preservation
- process-death readiness
- resource ownership

## 2. Lifecycle Architecture Map

## 3. Activity Audit

## 4. Fragment Audit

## 5. Fragment View Lifecycle Audit

## 6. Compose Lifecycle Audit

## 7. ViewModel Scope Audit

## 8. Configuration Change Audit

## 9. State Restoration Audit

## 10. Process Death Audit

## 11. Navigation Lifecycle Audit

## 12. Coroutine Lifetime Audit

## 13. Flow / Observer Audit

## 14. Resource Ownership Audit

## 15. Background / Foreground Audit

## 16. Service Lifecycle Audit

## 17. External Activity / Permission Result Audit

## 18. Memory / Resource Leak Audit

## 19. Findings Summary

| ID | Severity | Lifecycle Event | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 20. P1 Findings

## 21. P2 Findings

## 22. P3 Findings

## 23. P4 Improvements

## 24. Things Done Well

## 25. Lifecycle Test Coverage

## 26. Unknown / Not Verified

## 27. Remediation Roadmap

---

# 161. ROTATION SECOND PASS

Za svaki critical screen simuliraj:

```text
screen open
↓
partial user action
↓
rotate
↓
new instance
```

Pitaj:

- šta je sačuvano
- šta se ponovo pokreće
- šta se duplira
- šta se gubi

---

# 162. PROCESS DEATH SECOND PASS

Zatim za isti screen:

```text
background
↓
process killed
↓
restore
```

Pitaj:

- odakle se state vraća
- šta više ne postoji
- da li destination može da se rekonstruiše

---

# 163. NAVIGATE-AWAY PASS

Scenario:

```text
request starts
↓
user navigates away
↓
response arrives
```

Pitaj:

> Ko sada poseduje rezultat?

---

# 164. FAST BACK-FORWARD PASS

Simuliraj:

```text
A
↓
B
↓
Back
↓
B
↓
Back
```

veoma brzo.

Traži:

- stale callbacks
- duplicate observers
- retained state

---

# 165. BACKGROUND PASS

Scenario:

```text
operation starts
↓
Home
↓
several minutes
↓
return
```

Proveri:

- timer
- request
- auth
- progress
- resource

---

# 166. SYSTEM KILL PASS

Pitaj:

> Koji critical podatak postoji samo u RAM-u?

Svaki takav podatak klasifikuj:

```text
safe to lose
user inconvenience
business data loss
not verified
```

---

# 167. DUPLICATE SUBSCRIPTION PASS

Za svaki listener/observer:

```text
start
stop
start
stop
```

Proveri da broj aktivnih subscriptions ostaje 1 ili 0 prema očekivanju.

---

# 168. RESOURCE OWNER PASS

Za svaki težak resource pitaj:

> Da li owner živi tačno onoliko dugo koliko resource treba da živi?

Posebno:

- player
- camera
- WebView
- sensors
- Bluetooth
- location

---

# 169. ASYNC COMPLETION PASS

Za svaki async operation:

```text
start
↓
owner destroyed
↓
completion
```

Proveri rezultat.

---

# 170. ERROR PASS

Ponavljaj lifecycle scenario kada async operacija ne uspe.

Failure callback može imati isti stale-owner problem kao success callback.

---

# 171. LOGOUT PASS

Logout je lifecycle/state boundary.

Proveri:

- Activity stack
- Fragment stack
- ViewModels
- Flow collectors
- workers
- services

Ništa privatno od prethodnog session-a ne treba slučajno ostati aktivno.

---

# 172. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- rotation i process death nisu pomešani
- View lifecycle je odvojen od Fragment lifecycle-a
- svaki coroutine ima utvrđen owner
- svaki listener ima registration i cleanup analysis
- async findings proveravaju šta se dešava nakon navigation-a
- ViewModel nije tretiran kao durable storage
- SavedStateHandle nije korišćen kao zamena za bazu za velike/durable podatke
- svaki process-death finding ima reconstruction scenario
- observer finding proverava lifecycle owner
- `onResume` nije tretiran kao sinonim za "app launched"
- `onPause` nije tretiran kao sinonim za "app backgrounded"
- resource leak ima konkretan retained reference/resource
- test reproduction jasno razlikuje recreation od process death-a
- bugovi i improvements su odvojeni
- preporučeni fix odgovara pravom lifecycle problemu

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite ViewModel i SavedStateHandle da rešite lifecycle probleme.

To nije lifecycle audit.

Tražim probleme poput:

```text
Fragment
↓
View created
↓
observer registered against Fragment lifecycle
↓
View destroyed
↓
Fragment remains on back stack
↓
Flow emits
↓
observer tries to access old binding
```

ili:

```text
screen loads item A
↓
request starts
↓
user navigates to item B
↓
A response arrives late
↓
shared ViewModel accepts result
↓
B screen shows A data
```

ili:

```text
form data stored only in ViewModel
↓
app goes to background
↓
process killed
↓
user returns
↓
new ViewModel created
↓
form data permanently lost
```

ili:

```text
listener registered in onStart
↓
not removed in onStop
↓
onStart happens again
↓
second listener added
↓
single event triggers business action twice
```

ili:

```text
media player scoped to composable
↓
user navigates away
↓
composition disposed
↓
player released
↓
business requirement expected playback to continue
```

ili:

```text
Activity starts long operation in lifecycleScope
↓
user rotates
↓
Activity destroyed
↓
coroutine cancelled
↓
operation never completes
↓
UI had already told user it started successfully
```

To su lifecycle problemi koje treba da pronađeš.

Razmišljaj kroz:

- owner
- lifetime
- recreation
- destruction
- process death
- cancellation
- restoration
- delayed completion
- duplicate registration
- resource cleanup

Za svaki objekat ili operaciju pitaj:

> Ko ga poseduje?

> Koliko dugo treba da živi?

> Šta se događa kada owner nestane?

Ako nema dovoljno dokaza:

**NOT VERIFIED.**

Ako postoji samo bolji architectural pattern bez trenutnog failure-a:

**P4 - IMPROVEMENT.**

Bolje je pronaći 7 stvarnih lifecycle bugova nego napisati 70 generičkih saveta.

Cilj je dobiti audit iz kojeg se svaki nalaz može direktno pretvoriti u:

- lifecycle reprodukciju
- regression test
- tačan ownership fix
- process-death verification
- production validation
