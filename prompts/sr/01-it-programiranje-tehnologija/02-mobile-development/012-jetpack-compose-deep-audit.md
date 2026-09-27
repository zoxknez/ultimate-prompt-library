---
id: UPL-IT-012
number: 12
slug: jetpack-compose-deep-audit
title: Jetpack Compose Deep Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# JETPACK COMPOSE DEEP AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i runtime-oriented analizu Jetpack Compose implementacije kompletne Android aplikacije.

Glavni cilj:

> Utvrditi da li Compose UI pravilno upravlja state-om, recomposition-om, lifecycle-om, side effect-ima, navigacijom, performansama i accessibility semantikom, bez skrivenih race condition-a, stale state-a, memory leak-ova ili production-only problema.

Ovo nije:

- generički Compose best practices checklist
- preporuka da se sve prepiše u Compose
- automatski refactor
- obična provera naming-a
- lov na svaku recomposition
- pokušaj da se svuda dodaju `remember`, `derivedStateOf` ili `key`
- površna analiza samo jednog ekrana

Fokus je na stvarnom ponašanju Compose runtime-a.

Prioritet:

**correctness > lifecycle safety > state consistency > side-effect safety > performance > architecture elegance**

Ne prijavljuj problem samo zato što postoji alternativni Compose pattern.

Svaki ozbiljan finding mora imati konkretan execution flow i stvarnu posledicu.

---

# 1. UTVRDI COMPOSE STACK

Pre analize utvrdi:

- Kotlin verziju
- Android Gradle Plugin
- Compose Compiler ili relevantan compiler setup
- Compose BOM
- Compose UI
- Material / Material3
- Navigation Compose
- Lifecycle Compose
- Activity Compose
- Paging Compose
- Coil Compose ili drugi image stack
- Hilt Navigation Compose ako postoji
- testing biblioteke
- minSdk
- targetSdk

Pregledaj:

- Gradle konfiguraciju
- version catalog
- Compose compiler options
- feature flags
- stability config ako postoji
- ProGuard/R8 pravila
- release build setup

Ne koristi zastarele Compose pretpostavke.

Ako zaključak zavisi od verzije biblioteke ili compiler behavior-a, prvo utvrdi stvarnu verziju.

---

# 2. MAPIRAJ COMPOSE UI ARHITEKTURU

Pre finding-a napravi mapu:

```text
Activity
↓
Root Composable
↓
Navigation Host
↓
Screen Composable
↓
ViewModel
↓
StateFlow
↓
UI State
↓
Reusable Components
```

Ako app koristi drugačiji model, dokumentuj stvarni model.

Identifikuj:

- root composition
- navigation boundaries
- screen composables
- reusable UI
- state holders
- ViewModels
- custom hooks-like composables/helpers
- effect-heavy composables
- local persistence
- event system

---

# 3. STATE INVENTORY

Mapiraj sve važne state izvore:

- `remember`
- `rememberSaveable`
- `mutableStateOf`
- `derivedStateOf`
- `StateFlow`
- `SharedFlow`
- LiveData
- ViewModel state
- SavedStateHandle
- Room Flow
- DataStore Flow
- navigation arguments

Za svaki ključan podatak pitaj:

> Ko je stvarni owner ovog state-a?

---

# 4. SINGLE SOURCE OF TRUTH

Traži isti podatak na više mesta.

Primer:

```text
ViewModel StateFlow
↓
collected state
↓
copied into local remember state
↓
form state
```

Proveri da li može nastati drift.

Ne prijavljuj local UI state samo zato što postoji.

Problem je kada više nezavisnih kopija predstavljaju istu poslovnu istinu.

---

# 5. `remember`

Za svaki važan `remember` proveri:

- šta se pamti
- koliko dugo treba da živi
- od čega zavisi
- da li key-evi odgovaraju semantici

Traži:

```kotlin
remember { expensiveObject(id) }
```

ako se `id` može promeniti, a object treba ponovo kreirati.

---

# 6. `remember` KEY BUGOVI

Scenario:

```text
Composable rendered for item A
↓
remember caches object A
↓
same composable instance receives item B
↓
remember has no key
↓
state/object still belongs to A
```

Ovo je realan correctness finding.

---

# 7. `rememberSaveable`

Proveri da li state koji mora preživeti recreation koristi odgovarajući persistence model.

Ne koristi `rememberSaveable` za:

- velike objekte
- ne-serializable state
- data koji pripada ViewModel-u ili bazi

---

# 8. SAVEABLE STATE SIZE

Traži velike strukture u saved state-u:

- liste
- bitmap
- kompletni entity objekti
- veliki JSON

Proveri rizik od prevelikog Bundle-a.

---

# 9. STATE HOISTING

Za reusable composables proveri da li state može biti kontrolisan spolja gde to ima smisla.

Ali ne pretvaraj svaku komponentu u stateless component.

Pitaj:

> Da li trenutni ownership otežava reuse, test ili state synchronization?

---

# 10. CONTROLLED VS INTERNAL STATE

Ako composable ima i:

```kotlin
value
```

prop i sopstveni internal `remember` za isti koncept, proveri ko je authority.

Traži dva izvora istine.

---

# 11. DERIVED STATE

Ako se vrednost može izračunati iz drugog Compose state-a, proveri da li se nepotrebno čuva kao zaseban mutable state.

Primer:

```text
items
filter
↓
filteredItems
```

Ako `filteredItems` mora ručno da se sinhronizuje, postoji drift rizik.

---

# 12. `derivedStateOf`

Ne dodaj `derivedStateOf` automatski.

Koristi ga samo kada:

- izračunavanje zavisi od observable state-a
- recomposition frequency opravdava ga
- postoji konkretna korist

---

# 13. SNAPSHOT STATE

Proveri direct mutation struktura unutar Compose state-a.

Primer:

```kotlin
val list = remember { mutableListOf<Item>() }
```

ako UI očekuje automatsku recomposition nakon mutacije obične liste.

---

# 14. SNAPSHOT STATE LIST / MAP

Ako se koriste `mutableStateListOf` ili slični tipovi, proveri:

- item mutation
- replacement
- derived rendering

Mutacija polja unutar item-a koji sam nije observable može ostaviti UI stale.

---

# 15. IMMUTABILITY

Ne zahtevaj immutable modele samo kao stil.

Prijavi problem kada mutable shared model uzrokuje:

- propuštenu recomposition
- race condition
- teško praćenje state-a

---

# 16. VIEWMODEL STATE

Za svaki screen ViewModel mapiraj:

```text
repository
↓
Flow
↓
ViewModel
↓
UiState
↓
Composable
```

Traži:

- state dupliciran u više Flow-ova
- UI koji mora kombinovati mnogo nepovezanih stream-ova
- partial state inconsistencies

---

# 17. UI STATE MODEL

Proceni da li UI state dozvoljava invalid kombinacije.

Primer:

```kotlin
isLoading = true
error = "..."
data = nonNull
```

ako su ta stanja međusobno kontradiktorna za taj feature.

Razmotri sealed/discriminated model samo gde realno smanjuje ambiguity.

---

# 18. `collectAsState`

Pregledaj sve collection tačke.

Proveri:

- lifecycle awareness
- unnecessary always-on collection
- multiple collections istog Flow-a

---

# 19. `collectAsStateWithLifecycle`

Ako se koristi, proveri lifecycle behavior i dependency verziju.

Ako se ne koristi, nemoj automatski prijaviti problem dok ne utvrdiš da collection zaista radi van potrebnog lifecycle-a.

---

# 20. DUPLICATE FLOW COLLECTION

Isti Flow može biti collectovan u više composable-a.

To može biti bezbedno za hot Flow, ali skupo/problematično za cold Flow.

Utvrdi upstream semantics.

---

# 21. COLD FLOW RE-EXECUTION

Scenario:

```text
Composable A collects
Composable B collects
↓
cold Flow executes twice
↓
DB/API work duplicated
```

Proveri `stateIn`, `shareIn` ili repository behavior pre finding-a.

---

# 22. LIFECYCLE-AWARE COLLECTION

Pitaj:

> Da li network, sensor, location ili expensive Flow nastavlja da radi kada screen nije aktivan?

---

# 23. SIDE EFFECT INVENTORY

Repository-wide pronađi:

- `LaunchedEffect`
- `DisposableEffect`
- `SideEffect`
- `produceState`
- `rememberCoroutineScope`
- `snapshotFlow`

Za svaki važan effect dokumentuj:

```text
Trigger
Key
Work
Cleanup
Ownership
```

---

# 24. `LaunchedEffect`

Proveri da effect key odgovara stvarnom lifecycle-u posla.

---

# 25. MISSING KEY

Primer:

```kotlin
LaunchedEffect(Unit) {
    load(id)
}
```

ako isti composable može ostati u composition-u dok `id` menja vrednost.

Proveri da li se load mora ponoviti.

---

# 26. OVER-BROAD KEY

Suprotan problem:

```kotlin
LaunchedEffect(largeObject)
```

gde se object referenca menja pri svakom renderu.

To može restartovati coroutine/effect mnogo češće nego nameravano.

---

# 27. EFFECT RESTART

Za svaki effect pitaj:

> Šta se događa sa starim coroutine-om kada key promeni vrednost?

Proveri cancellation i partial side effects.

---

# 28. STALE CAPTURE U EFFECT-U

Effect može capture-ovati callback/value koji se kasnije promeni.

Proveri da li je potreban `rememberUpdatedState` ili drugi model.

Ne dodaj ga automatski.

---

# 29. `rememberUpdatedState`

Traži scenario gde long-lived effect treba najnoviji callback bez restarta.

Primer:

- timer
- lifecycle observer
- delayed callback

---

# 30. `DisposableEffect`

Za svaki proveri simetriju:

```text
register
↓
lifetime
↓
unregister
```

Posebno:

- lifecycle observer
- listener
- sensor
- callback
- player listener

---

# 31. CLEANUP

Cleanup mora koristiti isti resource/reference koji je registrovan.

---

# 32. `SideEffect`

Proveri da li se koristi za sync sa external non-Compose object-om i da li je side effect bezbedan pri čestim recomposition-ima.

---

# 33. `produceState`

Proveri cancellation, keys i error state.

---

# 34. `snapshotFlow`

Proveri:

- koliko često emituje
- distinct behavior
- expensive downstream work
- cancellation

---

# 35. `rememberCoroutineScope`

Scope pripada composition lifetime-u.

Proveri da se ne koristi za posao koji mora preživeti screen/composition.

---

# 36. LONG-RUNNING BUSINESS WORK

Ako operation mora preživeti navigation ili process/background scenario, composable scope možda nije pravi owner.

---

# 37. EVENT HANDLERS

Event handleri ne smeju pokretati duplicate side effect zbog double tap-a ili recomposition misunderstanding-a.

Proveri:

- save
- delete
- purchase
- send
- navigate

---

# 38. DOUBLE TAP

Scenario:

```text
tap
tap
↓
two coroutines
↓
two mutations
```

Proveri UI guard i server/database idempotency gde je relevantno.

---

# 39. NAVIGATION EFFECTS

Navigation kao posledica state-a može biti problematična ako state ostaje true nakon navigation-a.

Scenario:

```text
success = true
↓
navigate
↓
back
↓
state still true
↓
navigate again
```

---

# 40. ONE-TIME EVENTS

Mapiraj model za:

- navigation
- snackbar
- toast
- open dialog

Proveri da li događaj:

- može biti izgubljen
- može biti replay-ovan
- preživljava recreation kada treba

---

# 41. SHAREDFLOW EVENTS

Ako `SharedFlow` koristi replay, proveri da transient event ne bude ponovljen novom collector-u.

---

# 42. CHANNEL EVENTS

Ako se koristi Channel, proveri:

- consumer lifecycle
- lost event
- multiple collectors
- buffering

---

# 43. STATE-BASED EVENTS

Ako se transient event modeluje kroz persistent state, proveri consume/reset logic.

---

# 44. RECOMPOSITION AUDIT

Ne prijavljuj svaku recomposition.

Identifikuj:

- šta se recomponuje
- koliko često
- koliko je skupo
- zašto

---

# 45. COMPOSITION LOCAL

Pregledaj `CompositionLocal`.

Traži:

- previše širok mutable state
- hidden dependency
- često menjanje vrednosti na vrhu stabla

---

# 46. ROOT STATE CHANGES

Ako root-level value menja veliki subtree, proceni recomposition blast radius.

---

# 47. PARAMETERS

Za velike composables proveri da li dobijaju ogromne state objekte kada koriste samo mali deo.

Ali ne cepaj state object automatski ako Compose stability i clarity favorizuju model.

---

# 48. STABILITY

Ako performance finding zavisi od stability inference-a, proveri compiler/tooling umesto nagađanja.

---

# 49. UNSTABLE COLLECTIONS

List/Map/model mogu biti tretirani kao unstable u zavisnosti od tipa i compiler setup-a.

Ne proglašavaj to performance problemom bez konkretne recomposition posledice.

---

# 50. LAMBDA ALLOCATIONS

Ne prijavljuj male lambda alokacije bez dokaza.

Compose optimizacije i compiler mogu već rešavati deo toga.

---

# 51. `remember` ZA LAMBDE

Ne preporučuj `remember` oko svake lambda funkcije.

---

# 52. EXPENSIVE WORK U COMPOSITION-U

Traži:

- sorting
- filtering
- JSON parsing
- bitmap creation
- date parsing
- regex compilation
- database access
- file I/O

direktno u composable body-ju.

---

# 53. SORTING / FILTERING

Ako lista ima mnogo elemenata i recomposition je česta, mapiraj actual cost.

---

# 54. `remember` ZA EXPENSIVE CALCULATION

Ako calculation zavisi od inputa, key-evi moraju pokrivati sve inpute.

---

# 55. LAZY LISTS

Pregledaj:

- `LazyColumn`
- `LazyRow`
- grids

Proveri:

- key
- content type
- item state
- nested lists
- scroll state

---

# 56. LAZY LIST KEYS

Ako nema key-a, proveri da li insertion/reordering može vezati internal state za pogrešan item.

---

# 57. INDEX AS KEY

Index key je problem samo kada lista menja redosled ili elemente.

Dokaži scenario.

---

# 58. MUTABLE ITEM

Ako item menja internal property bez promene identity/reference modela, proveri da li UI dobija update.

---

# 59. NESTED LAZY LISTS

Proveri:

- scroll behavior
- measurement
- nested state
- performance

---

# 60. SCROLL STATE

Ako screen treba da sačuva poziciju kroz navigation/recreation, proveri ownership i saveability.

---

# 61. `LazyListState`

Proveri da state ne bude kreiran iznova zbog pogrešnog key-a.

---

# 62. PAGING COMPOSE

Ako postoji Paging:

- collect
- load states
- retry
- refresh
- item keys
- placeholders

---

# 63. LOAD STATE

Proveri odvojeno:

- initial load
- refresh
- append
- prepend
- error

Ne prikazuj full-screen loader za svaki append bez razloga.

---

# 64. PAGING ERROR

Proveri retry flow i da li korisnik može nastaviti da vidi već učitane podatke.

---

# 65. NAVIGATION COMPOSE

Mapiraj:

- NavHost
- routes
- arguments
- nested graphs
- deep links
- saved state

---

# 66. ROUTE STRINGS

Traži ručno sastavljanje string ruta sa user input-om.

Proveri encoding.

---

# 67. NAVIGATION ARGUMENTS

Nemoj slati velike kompleksne objekte kroz navigation argumente ako ID/reference može rekonstruisati stanje.

Posebno zbog Bundle limita i stale data.

---

# 68. SAVEDSTATEHANDLE + NAVIGATION

Proveri da route param postaje stabilan ViewModel input.

---

# 69. VIEWMODEL SCOPE

Proveri da ViewModel nije slučajno scoped previsoko ili prenisko.

Scenario:

```text
screen A
screen B
↓
shared ViewModel
```

može biti namerno ili bug.

Utvrdi ownership.

---

# 70. BACK STACK

Proveri:

- duplicate routes
- pop behavior
- singleTop
- restoreState
- saveState

---

# 71. BOTTOM NAVIGATION

Ako postoji više top-level destinacija, proveri state/back-stack model.

---

# 72. MULTIPLE BACK STACKS

Proveri da switching tabova ne gubi ili ne duplira navigation state.

---

# 73. NAVIGATION RACE

Double click/tap može poslati dve navigation komande.

---

# 74. NAVIGATION POSLE PROCESS DEATH

Proveri deep link / restored back stack sa ViewModel state-om.

---

# 75. DIALOG COMPOSABLES

Proveri:

- state ownership
- dismissal
- rotation
- back press
- focus

---

# 76. DIALOG + ASYNC

Scenario:

```text
open confirm dialog
↓
tap confirm
↓
request starts
↓
dialog dismissed
↓
request fails
```

Pitaj:

> Gde korisnik vidi failure i može li retry?

---

# 77. BOTTOM SHEETS

Proveri:

- sheet state
- coroutine transitions
- navigation
- recreation
- hidden/expanded race

---

# 78. MODAL STATE MACHINE

Kompleksan sheet/dialog često ima više stanja.

Proveri invalid transitions.

---

# 79. ANIMATION

Pregledaj:

- `AnimatedVisibility`
- `animate*AsState`
- transitions
- infinite transitions

Ne prijavljuj animaciju kao performance problem bez dokaza.

---

# 80. ANIMATION STATE

Ako animacija pokreće business event na completion, proveri cancellation/restart behavior.

---

# 81. INFINITE TRANSITION

Proveri da nije aktivna za UI koji nije vidljiv ako to nepotrebno troši resurse.

---

# 82. REDUCED MOTION / ACCESSIBILITY

Ako app ima značajne animacije, proceni accessibility impact.

---

# 83. POINTER INPUT

Ako postoje custom gestures:

- `pointerInput`
- `detectTapGestures`
- drag
- transform

proveri key-eve i cancellation.

---

# 84. `pointerInput` KEY

Pogrešan key može ostaviti stale callback/state unutar gesture coroutine-a.

---

# 85. CLICKABLE

Proveri da custom gesture nije zamenio `clickable` i izgubio:

- semantics
- keyboard
- ripple/interaction
- accessibility

bez razloga.

---

# 86. COMBINED CLICKABLE

Ako postoji long press, proveri discoverability/accessibility.

---

# 87. SEMANTICS

Pregledaj custom composables za:

- content description
- role
- selected
- state description
- heading
- merge semantics

---

# 88. `clearAndSetSemantics`

Može sakriti child semantics.

Proveri konkretan use case.

---

# 89. DECORATIVE CONTENT

Ne dodaj content description dekorativnim ikonama.

To pravi screen reader noise.

---

# 90. ICON BUTTON

Proveri accessible label za icon-only actions.

---

# 91. TALKBACK FOCUS ORDER

Ako custom layout vizuelno menja redosled, proveri semantics order.

---

# 92. CUSTOM COMPONENTS

Za custom switch, slider, tab ili control proveri da semantics odgovaraju behavior-u.

---

# 93. FORMS

Compose forms analiziraj kroz:

```text
TextField
↓
local/form state
↓
validation
↓
ViewModel
↓
submit
↓
result
```

---

# 94. TEXTFIELD STATE

Proveri source of truth.

Traži:

```text
server/form value
↓
copied into remember
```

bez reset/update logike.

---

# 95. ASYNC INITIAL FORM DATA

Scenario:

```text
Composable mounts
↓
empty form state created
↓
network returns entity
↓
new entity data arrives
```

Da li form zaista dobija podatke ili `remember` zadržava prazne vrednosti?

---

# 96. USER INPUT OVERWRITE

Suprotan scenario:

```text
user starts typing
↓
background refresh arrives
↓
effect copies server state into form
↓
user input disappears
```

Traži ovakve race condition-e.

---

# 97. VALIDATION

Razlikuj:

- per-keystroke validation
- submit validation
- server validation

Ne radi skupu validaciju pri svakom karakteru bez razloga.

---

# 98. FOCUS

Pregledaj `FocusRequester`, `focusable`, focus traversal.

Traži:

- request pre nego što element postoji
- stale FocusRequester
- focus loop
- izgubljen focus posle state change-a

---

# 99. KEYBOARD

Proveri:

- IME actions
- keyboardOptions
- keyboardActions
- focus next
- submit

---

# 100. IME ACTION

`Done`/`Next` treba da odgovara stvarnom flow-u.

---

# 101. KEYBOARD HIDING

Ne tretiraj ručno hide keyboard kao obavezno.

Proceni UX i fokus.

---

# 102. BRING INTO VIEW

Na dugim formama proveri da fokusirani field ostaje vidljiv iznad tastature.

---

# 103. WINDOW INSETS

Pregledaj:

- status bar
- navigation bar
- IME
- display cutout

Traži double padding ili missing inset.

---

# 104. EDGE-TO-EDGE

Ako app koristi edge-to-edge, proveri da sadržaj nije sakriven ispod system bars.

---

# 105. IME INSETS

Posebno forme i bottom sheets.

---

# 106. ORIENTATION

Compose ne rešava automatski svaki state problem pri configuration change-u.

Ponovo proveri:

- form
- dialog
- scroll
- selected tab
- player

---

# 107. ADAPTIVE LAYOUT

Ako app targetira tablet/large screens, proveri:

- window size classes
- pane layout
- state ownership

Ne zahtevaj adaptive architecture ako nije target.

---

# 108. MULTI-WINDOW

Ako relevantno, proveri state i layout na promenjivoj veličini window-a.

---

# 109. PREVIEW CODE

Compose Preview helper kod ne sme procureti u production behavior.

Proveri fake data/provider boundaries.

---

# 110. PREVIEW-ONLY ASSUMPTIONS

UI koji izgleda dobro u Preview-u može pući sa realnim:

- dugim textom
- null
- huge list
- loading
- errors

---

# 111. DESIGN SYSTEM

Ako postoji Compose design system, mapiraj:

- colors
- typography
- shapes
- spacing
- primitives

Traži feature-specific business behavior u generic UI primitives.

---

# 112. THEME

Proveri:

- light
- dark
- dynamic color
- system bars

Functional accessibility problem ima veći prioritet od vizuelne razlike.

---

# 113. HARD-CODED COLORS

Prijavi samo kada:

- kvari dark theme
- kontrast
- state semantics
- theme consistency

---

# 114. HARD-CODED DIMENSIONS

Ne prijavljuj svaku `dp` vrednost.

Traži layout koji puca na:

- font scale
- small screens
- tablets

---

# 115. FONT SCALE

Testiraj mentalno ili runtime:

- large system font

Traži:

- clipped button text
- hidden controls
- fixed-height container

---

# 116. STRING RESOURCES

User-visible text hardcoded u composable-u može otežati localization.

Ako app ima i18n, proveri consistency.

---

# 117. PLURALIZATION

Ako prikazuje count, proveri odgovarajući plural model gde je relevantno.

---

# 118. LOCALE

Formatiranje:

- date
- number
- currency

ne treba ručno graditi bez razloga.

---

# 119. IMAGE LOADING

Ako koristi Coil Compose ili slično, proveri:

- model
- placeholder
- error
- size
- caching
- lifecycle

---

# 120. LARGE IMAGE

Proveri da app ne učitava full-resolution sliku za mali thumbnail bez resize/caching strategije.

---

# 121. ASYNC IMAGE

Loading/error state mora biti smislen za critical images.

---

# 122. CANVAS

Ako koristi Compose Canvas:

- expensive drawing
- allocations u draw loop-u
- accessibility alternative

gde je relevantno.

---

# 123. CUSTOM DRAWING

Ne alociraj velike objekte u svakom draw pass-u ako je dokazivo skupo.

---

# 124. ANDROID VIEW INTEROP

Ako postoji `AndroidView`, proveri:

- factory
- update
- lifecycle
- release
- listeners

---

# 125. VIEW INTEROP LEAK

Custom View može držati Activity/Context/listeners duže nego Compose lifecycle.

---

# 126. COMPOSEVIEW U XML APLIKACIJI

Ako Compose postoji unutar Fragment-a/View sistema, proveri Composition disposal strategy.

---

# 127. COMPOSITION DISPOSAL

Pogrešna strategija može zadržati composition posle View lifecycle-a.

---

# 128. WEBVIEW INTEROP

Ako WebView živi u Compose-u, posebno proveri:

- recreation
- state
- destroy
- navigation
- memory

---

# 129. MAP VIEW INTEROP

Isto za map/video/other heavy Views.

---

# 130. PLAYER INTEROP

Media player ne treba da se kreira pri svakoj recomposition-i.

Mapiraj ownership.

---

# 131. RESOURCE OWNERSHIP

Za svaki težak resource pitaj:

> Ko ga kreira i ko ga uništava?

Primeri:

- ExoPlayer
- CameraController
- Sensor listener
- WebView
- Map
- Bluetooth connection

---

# 132. APPLICATION VS SCREEN RESOURCE

Resource koji treba da preživi screen ne sme slučajno biti scoped na composable.

Resource koji ne treba da preživi screen ne sme biti global singleton bez razloga.

---

# 133. CONTEXT

U composable-u se lako dobija `LocalContext.current`.

Proveri da Activity context ne bude zadržan u long-lived singleton/resource-u.

---

# 134. CONFIGURATION

`LocalConfiguration.current` može izazvati recomposition pri config promenama.

Ako se čita visoko u tree-u, proceni blast radius.

---

# 135. DENSITY

Custom drawing/layout treba pravilno koristiti density conversions.

---

# 136. PERFORMANCE PROFILING

Ako tooling postoji, koristi relevantne metrike.

Nemoj tvrditi:

- recompositions count
- frame time
- jank rate

bez merenja.

---

# 137. COMPOSE COMPILER REPORTS

Ako projekat omogućava compiler reports/metrics, koristi ih kao evidence.

Ne tumači svaki unstable type kao bug.

---

# 138. LAYOUT INSPECTOR

Ako runtime tooling postoji, koristi ga za konkretne recomposition probleme.

---

# 139. MACROBENCHMARK

Ako app ima performance-critical screen, proveri postoje li macrobenchmarks.

Nedostatak je P4 dok nema konkretan performance problem.

---

# 140. BASELINE PROFILE

Ako postoji, proveri critical journey coverage.

---

# 141. STARTUP

Root composition ne treba da blokira na:

- disk
- network
- large parsing

Ako postoji, prijavi kao Android performance finding.

---

# 142. MAIN THREAD

Compose ne menja pravilo da blocking I/O ne pripada Main thread-u.

---

# 143. REPOSITORY CALL U COMPOSABLE-U

Ako composable direktno pokreće repository/network poziv tokom body execution-a, to može biti ozbiljan bug.

Prati koliko puta se poziv može izvršiti.

---

# 144. VIEWMODEL CREATION

Proveri `viewModel()` / `hiltViewModel()` lokaciju.

Pogrešna NavBackStackEntry može dati pogrešan scope.

---

# 145. KEYED VIEWMODEL

Ako ViewModel treba da bude različit po ID-u, proveri kako key/owner radi.

---

# 146. DEPENDENCY INJECTION

Ako Hilt/Koin ulazi u Compose, proveri da UI ne koristi DI kao zamenu za jasan ownership.

---

# 147. PREVIEW + DI

Preview ne treba da zahteva pravi production dependency graph samo da bi prikazao component.

Ovo je maintainability improvement, ne ozbiljan runtime bug.

---

# 148. ERROR BOUNDARIES

Compose nema identičan model kao web React.

Proveri kako aplikacija rukuje exceptions iz:

- ViewModel
- Flow
- async work

Ne izmišljaj nonexistent Compose "error boundary" pattern.

---

# 149. CRASH U COMPOSITION-U

Ako user data može izazvati exception u composable body-ju, scenario može rušiti ceo screen/process.

Posebno:

- unsafe cast
- index
- null
- parsing

---

# 150. NULL / EMPTY STATE

Za svaki screen proveri:

- loading
- empty
- error
- content

Traži UI koji prikazuje "nema podataka" kada request zapravo nije uspeo.

---

# 151. STATE RESTORATION

Proveri:

- selected tab
- scroll
- form
- dialog

prema tome šta proizvod očekuje nakon recreation-a.

---

# 152. PROCESS DEATH

`rememberSaveable` može pomoći samo za određene tipove state-a.

Critical business data treba imati durable source.

---

# 153. PERSISTED DRAFT

Ako korisnik može unositi mnogo podataka, proceni da li process death može izazvati neprihvatljiv gubitak.

---

# 154. BACK HANDLING

Ako koristi `BackHandler`, proveri:

- enabled state
- nested handlers
- dialog
- unsaved data

---

# 155. PREDICTIVE BACK

Ako target/relevant Android verzije koriste predictive back, proveri compatibility gde app ima custom back behavior.

Ako nije provereno:

**PREDICTIVE BACK: NOT VERIFIED**

---

# 156. DEEP LINK + COMPOSE NAVIGATION

Proveri invalid/missing arguments i auth flow.

---

# 157. AUTH GATE

UI navigation guard nije server authorization, ali Compose flow mora pravilno rešiti:

- loading session
- authenticated
- unauthenticated

bez flash-a pogrešnog ekrana.

---

# 158. AUTH STATE RACE

Scenario:

```text
app starts
↓
auth unknown
↓
UI assumes logged out
↓
navigates to login
↓
stored session finishes loading
```

Proveri flicker/navigation race.

---

# 159. LOGOUT STATE

Na logout-u resetuj relevantan Compose/ViewModel/nav state.

Traži podatke prethodnog user-a u back stack-u.

---

# 160. BACK STACK POSLE LOGOUT-A

Scenario:

```text
logout
↓
login screen
↓
Back
```

Da li se otvara privatni screen iz starog back stack-a?

---

# 161. USER SWITCHING

Ponovo proveri ViewModel scoped state i retained back stack.

---

# 162. MULTIPLE WINDOWS / TASKS

Ako deep links mogu otvoriti više Activity/task instanci, proveri state assumptions.

---

# 163. ACCESSIBILITY SEMANTICS TESTS

Ako postoje Compose UI testovi, proveri da li koriste semantics na način koji istovremeno održava accessibility ili samo test tagove.

---

# 164. TESTING

Mapiraj:

- ViewModel unit tests
- Compose UI tests
- screenshot tests
- navigation tests
- integration tests

---

# 165. COMPOSE UI TESTS

Proveri:

- semantics selectors
- async/idling
- transient UI
- scroll
- dialog
- navigation

---

# 166. TESTTAG

`testTag` može pomoći testovima, ali nemoj da ga koristiš kao jedini signal korisničke semantike.

---

# 167. SCREENSHOT TESTS

Vizuelni snapshot ne dokazuje:

- click behavior
- state correctness
- focus
- lifecycle

---

# 168. RECOMPOSITION TESTS

Ne praviti krhke testove koji očekuju tačan broj recomposition-a osim ako je to specifičan performance test.

---

# 169. STATE RESTORATION TEST

Za critical screens testiraj:

```text
input
↓
recreate
↓
verify expected state
```

---

# 170. NAVIGATION TEST

Testiraj:

- direct route
- Back
- deep link
- double tap
- logout

---

# 171. PROCESS DEATH LIMITATION

Ako test framework ne simulira pravi process death, jasno označi šta test zapravo dokazuje.

---

# 172. PREVIEW NIJE TEST

Nikad ne koristi Preview izgled kao dokaz runtime correctness-a.

---

# 173. R8 / RELEASE

Compose uglavnom dobro sarađuje sa R8, ali custom reflection/serialization/navigation može imati release-only problem.

Analiziraj stvarni codebase.

---

# 174. DEBUG VS RELEASE

Proveri da performance ili timing problem nije samo debug overhead.

Ne koristi debug recomposition/performance kao production measurement.

---

# 175. LAYOUT INSPECTOR OVERHEAD

Isto.

---

# 176. FINDING FORMAT

Svaki ozbiljan nalaz mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Screen:
Composable:
ViewModel:
File:
Relevant code:

State owner:
Effect/lifecycle:
Affected Android versions:

Problem:

Evidence:

Composition/State Flow:

Reproduction:

Expected behavior:

Actual behavior:

User impact:

Performance/Data impact:

Root cause:

Recommended remediation:

Regression test:

Verification:

Complexity:
XS / S / M / L / XL
```

Ako nešto nije relevantno:

**NOT APPLICABLE**

---

# 177. SEVERITY

Koristi:

## P1 - HIGH

- critical screen puca
- serious state/data loss
- major navigation loop
- severe lifecycle/resource leak
- Compose bug koji blokira glavni flow

## P2 - MEDIUM

- realan state/recomposition/effect bug sa značajnim impact-om
- important UI stale/inconsistent behavior

## P3 - LOW

- edge-case UI/state problem
- lokalni performance/recomposition problem

## P4 - IMPROVEMENT

- architecture/performance/readability unapređenje koje nije bug

P0 koristi samo ako Compose problem vodi ka kritičnom security/data-loss incidentu.

---

# 178. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

direktno dokazano code/runtime flow-om.

MEDIUM:

jak evidence, ali device/runtime reprodukcija nedostaje.

LOW:

zavisi od compiler/library/platform behavior-a koji nije potvrđen.

---

# 179. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 180. PERFORMANCE STATUS

Za performance finding dodaj:

```text
MEASURED
CODE-LEVEL RISK
NOT MEASURED
```

Ne koristi reč "slow" kao potvrđenu činjenicu bez merenja.

---

# 181. FALSE-POSITIVE PREVENTION

Pre P1/P2 nalaza proveri:

1. composable
2. parent
3. ViewModel
4. Flow source
5. effect key
6. lifecycle
7. navigation owner
8. state restoration
9. library behavior
10. Compose/compiler version
11. tests

Ne zaključuj iz jedne linije.

---

# 182. NE REFAKTORIŠI

Tokom audita:

- ne premeštaj state
- ne dodaj `remember`
- ne dodaj memoization
- ne menjaj navigation
- ne menjaš ViewModel scope
- ne uvodi MVI
- ne menja design system

Prvo završi audit.

---

# 183. OUTPUT - JETPACK_COMPOSE_AUDIT.md

Finalni rezultat strukturiraj:

## 1. Executive Summary

- Compose stack
- architecture
- najveći state/lifecycle rizici
- performance stanje
- production readiness

## 2. Compose Architecture Map

## 3. State Ownership Map

## 4. ViewModel / StateFlow Audit

## 5. `remember` / `rememberSaveable` Audit

## 6. Derived State Audit

## 7. Side Effects Audit

## 8. Coroutine Ownership Audit

## 9. Recomposition Audit

## 10. Stability Audit

## 11. Lazy List Audit

## 12. Navigation Compose Audit

## 13. Form State Audit

## 14. Focus / IME / Insets Audit

## 15. Accessibility Semantics Audit

## 16. View Interop Audit

## 17. Resource Lifecycle Audit

## 18. Performance Audit

## 19. State Restoration / Process Death

## 20. Authentication / Logout State

## 21. Testing Audit

## 22. Release Build Risks

## 23. Findings Summary

| ID | Severity | Category | Screen | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 24. P1 Findings

## 25. P2 Findings

## 26. P3 Findings

## 27. P4 Improvements

## 28. Things Done Well

## 29. Unknown / Not Verified

## 30. Remediation Roadmap

---

# 184. COMPOSE STATE MATRIX

Za critical screens napravi:

| Screen | State source | Owner | Saveable | Durable | Risk |
|---|---|---|---|---|---|

---

# 185. EFFECT MATRIX

Za important effects:

| Composable | Effect | Key | Work | Cleanup | Risk |
|---|---|---|---|---|---|

---

# 186. RECOMPOSITION MATRIX

Samo za hotspots:

| Composable | Trigger | Expensive work | Measured | Risk |
|---|---|---|---|---|

Ne izmišljaj broj recomposition-a.

---

# 187. NAVIGATION MATRIX

| Destination | ViewModel scope | Arguments | Deep link | Restoration | Risk |
|---|---|---|---|---|---|

---

# 188. STATE RESET PASS

Nakon prvog audita za svaki screen pitaj:

> Kada ovaj state treba da se resetuje?

Scenario-i:

- navigate away
- logout
- new entity
- filter change
- account switch
- retry

Traži state koji živi duže nego što bi trebalo.

---

# 189. STATE SURVIVAL PASS

Zatim obrni pitanje:

> Koji state nestaje ranije nego što bi trebalo?

Scenario-i:

- rotation
- configuration change
- tab switching
- process recreation
- app background

---

# 190. EFFECT RESTART PASS

Za svaki `LaunchedEffect` pitaj:

> Koja promena treba da restartuje ovaj posao?

Zatim uporedi sa stvarnim key-evima.

---

# 191. EFFECT CANCELLATION PASS

Pitaj:

> Šta se događa ako effect bude cancel-ovan na pola?

Posebno:

- save
- animation
- navigation
- repository operation

---

# 192. FAST INPUT PASS

Simuliraj:

```text
type fast
↓
change query
↓
switch filter
↓
navigate
```

Traži stale async results i effect restarts.

---

# 193. DOUBLE TAP PASS

Za sve critical click akcije:

```text
tap twice
```

Proveri navigation i mutations.

---

# 194. ROTATION PASS

Ponovo prođi:

- forms
- dialogs
- sheets
- tabs
- lists
- player
- search

---

# 195. PROCESS DEATH PASS

Pitaj:

> Šta bi se dogodilo da Android ubije proces baš sada?

Ne odgovaraj "ViewModel čuva state".

ViewModel ne preživljava process death.

---

# 196. SLOW DEVICE PASS

Pretpostavi slabiji CPU i mnogo recomposition-a.

Identifikuj samo konkretne expensive hotspots.

---

# 197. LARGE DATA PASS

Povećaj mentalno:

- 20 list items na 2.000
- 10 search results na 10.000

Pitaj gde Compose tree/data processing prestaje da bude razuman.

---

# 198. ACCESSIBILITY PASS

Zamisli TalkBack korisnika.

Za custom component pitaj:

- šta čuje
- kako aktivira
- kako zna state

---

# 199. DARK MODE / FONT SCALE PASS

Proveri critical UI sa:

- dark theme
- velikim fontom

Traži clipping ili nevidljiv state.

---

# 200. LOGOUT PASS

Scenario:

```text
private screen
↓
logout
↓
login screen
↓
Back
```

Proveri:

- nav stack
- ViewModel state
- remembered UI state
- cached private content

---

# 201. SECOND PASS

Posle state i lifecycle pass-ova ponovo prođi kroz svaki finding kao sopstveni skeptik:

- prati stvarnu recomposition, effect ili state putanju u kodu, ili je reprodukuj na uređaju ili emulatoru; ne oslanjaj se samo na naziv pattern-a
- proveri da li key, `remember` scope, `rememberSaveable`, `derivedStateOf`, stabilni tipovi, ViewModel ili navigation back stack već sprečavaju problem
- potvrdi Compose, Kotlin i AGP verzije od kojih finding zavisi; ponašanje compiler-a i runtime-a razlikuje se između verzija
- traži skrivene putanje: isti composable ponovo korišćen u listama, dialog-ima, bottom sheet-ovima, preview-ima, drugim navigation destinacijama ili configuration varijantama
- proveri vreme i obim: brz ponovljen input, rotaciju tokom effect-a, process death tokom operacije koja čeka, velike liste, spore uređaje
- za performance findings traži dokaz (recomposition counts, Layout Inspector, traces, benchmarks), a ne samo sumnju

Finding bez konkretnog trigger-a i vidljivog uticaja spušta se na THEORETICAL ili NOT VERIFIED.

---

# 202. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nisi prijavio recomposition samo zato što postoji
- nisi dodao `remember` naslepo
- nisi koristio `derivedStateOf` kao univerzalni fix
- effect finding ima konkretan key/lifecycle problem
- stale state finding ima dokaziv source-of-truth problem
- ViewModel scope je proveravan kroz actual NavBackStackEntry
- process death nije pomešan sa configuration change-om
- transient events nisu automatski prebačeni u SharedFlow bez analize
- performance claims nisu izmišljeni
- accessibility nije svedena na `contentDescription`
- custom gestures proveravaju semantics
- lazy list key problem ima stvaran reorder/insert scenario
- release behavior je odvojen od debug-a
- bugovi i P4 improvements su jasno razdvojeni
- remediation rešava root cause, ne samo simptom

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite remember, derivedStateOf, stable modele i smanjite recomposition.

To nije Compose audit.

Tražim probleme poput:

```text
Screen pokazuje item A
↓
remember { mutableStateOf(item.name) }
↓
navigation menja item na B bez remount-a
↓
remember nema item.id key
↓
UI i dalje pokazuje ime A
```

ili:

```text
LaunchedEffect(Unit)
↓
učitava podatke za userId 1
↓
isti composable dobija userId 2
↓
effect se ne restartuje
↓
screen ostaje sa stale podacima
```

ili:

```text
LaunchedEffect(searchQuery)
↓
request A start
↓
query se menja
↓
A se cancel-uje
↓
repository call ignoriše cancellation i ipak upiše rezultat
↓
noviji state može biti prepisan
```

ili:

```text
success state = true
↓
Composable navigira
↓
Back
↓
ViewModel i dalje success = true
↓
screen odmah ponovo navigira
```

ili:

```text
form value iz ViewModel-a
↓
copied into remember local state
↓
background refresh promeni server value
↓
local state ostaje star
↓
UI prikazuje podatak koji više nije source of truth
```

ili:

```text
Player created inside composable
↓
recomposition
↓
new Player instance
↓
old instance nije release-ovan
↓
audio/resource leak
```

Razmišljaj kroz:

- composition lifetime
- state ownership
- effect keys
- cancellation
- recomposition
- navigation back stack
- configuration change
- process death
- resource ownership
- async ordering

Ako nema dovoljno dokaza:

**NOT VERIFIED.**

Ako je problem samo potencijalna optimizacija:

**P4 - IMPROVEMENT.**

Ako je performance samo sumnjiv iz koda:

**CODE-LEVEL RISK.**

Bolje je pronaći 8 stvarnih Compose state/effect problema nego generisati 80 generičkih saveta.

Cilj je dobiti forenzički precizan Jetpack Compose audit iz kojeg se svaki ozbiljan finding može direktno pretvoriti u:

- reproduction
- fix
- regression test
- lifecycle verification
- production validation
