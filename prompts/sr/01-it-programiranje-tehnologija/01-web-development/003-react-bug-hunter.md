---
id: UPL-IT-003
number: 3
slug: react-bug-hunter
title: Lov na bagove u React aplikacijama
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# LOV NA BAGOVE U REACT APLIKACIJAMA

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu React aplikacije sa jednim glavnim ciljem:

> Pronaći stvarne bugove i potencijalno pogrešno runtime ponašanje u React kodu.

Ovo nije:

- generički code review
- architecture review celog sistema
- styling review
- lista React best practices
- automatski refactor
- potraga za subjektivno "lepšim" kodom

Fokus je na stvarnim problemima koji mogu izazvati:

- pogrešan UI
- stale podatke
- izgubljene podatke
- pogrešan state
- beskonačne render/effect cikluse
- race conditions
- memory leak
- duplicate execution
- hydration probleme
- pogrešno ponašanje nakon navigacije
- probleme sa async operacijama
- neusklađenost UI-ja i server stanja
- probleme koji se pojavljuju samo u određenom redosledu korisničkih akcija

Prioritet:

**correctness > evidence > reproducibility > broj nalaza**

Bolje je prijaviti 10 potvrđenih React bugova nego 100 generičkih preporuka.

---

# 1. PRVO UTVRDI REACT OKRUŽENJE

Pre analize utvrdi:

- React verziju
- framework ako postoji
- Next.js
- Remix
- Vite
- CRA
- React Router
- drugi framework/runtime
- TypeScript ili JavaScript
- state management
- server-state biblioteke
- form biblioteke
- routing
- test framework
- UI/component biblioteke

Posebno identifikuj:

- React Strict Mode
- Server Components ako postoje
- Client Components ako postoje
- SSR
- CSR
- hydration
- Suspense
- transitions
- streaming
- concurrent features
- React compiler ako se koristi
- framework-specific behavior

Nemoj koristiti zastarele React pretpostavke.

Ako zaključak zavisi od konkretne React verzije, prvo utvrdi semantiku te verzije.

---

# 2. MAPIRAJ STATE PRE NEGO ŠTO TRAŽIŠ BUGOVE

Za glavne feature-e utvrdi gde se stanje nalazi.

Mapiraj:

```text
Server state
↓
query/cache layer
↓
component props
↓
local state
↓
derived state
↓
rendered UI
```

Identifikuj:

- lokalni `useState`
- `useReducer`
- Context
- Zustand
- Redux
- TanStack Query
- SWR
- Apollo
- custom stores
- URL state
- form state
- localStorage
- sessionStorage
- cookies

Za svaki važan podatak pitaj:

> Koji je pravi source of truth?

Posebno traži slučajeve gde isti podatak postoji na više mesta.

Primer:

```text
server response
↓
query cache
↓
component state
↓
form state
```

Ako se isti podatak sinhronizuje ručno između više state slojeva, proveri mogućnost drift-a.

---

# 3. STALE STATE

Aktivno traži stale state probleme.

Posebno pregledaj:

- callback funkcije
- timers
- subscriptions
- promises
- async functions
- event listeners
- WebSocket handlers
- observers
- debounced callbacks
- throttled callbacks

Primer rizičnog obrasca:

```tsx
setTimeout(() => {
  doSomething(value)
}, 5000)
```

Proveri da li `value` u trenutku izvršenja predstavlja:

- trenutno stanje
- ili vrednost iz trenutka kreiranja callback-a

Ne prijavljuj stale closure bez dokazivog scenarija.

---

# 4. FUNCTIONAL STATE UPDATES

Pregledaj state promene koje zavise od prethodnog state-a.

Traži obrasce poput:

```tsx
setCount(count + 1)
```

kada više update-a može nastati:

- u istom event-u
- kroz async operaciju
- kroz concurrency
- kroz batching

Proveri da li bi trebalo koristiti:

```tsx
setCount(prev => prev + 1)
```

Ali ne prijavljuj problem ako stvarni execution flow ne može proizvesti pogrešan rezultat.

---

# 5. DERIVED STATE BUGOVI

Traži podatke koji se čuvaju u state-u iako mogu biti izvedeni iz drugog state-a ili props-a.

Primer:

```tsx
const [filteredUsers, setFilteredUsers] = useState([])
```

dok već postoje:

```tsx
users
filter
```

Proveri:

- ko ažurira derived state
- da li svi input-i pokreću update
- da li može postati stale
- da li se resetuje u pogrešnom trenutku

Nemoj automatski prijaviti svaki derived state.

Problem postoji kada dupliranje izvora istine može dovesti do nekonzistentnosti.

---

# 6. useEffect FORENZIKA

Pronađi sve važne `useEffect` pozive.

Za svaki utvrdi:

- šta effect radi
- šta čita
- šta menja
- dependencies
- cleanup
- da li je effect uopšte potreban

Traži:

- missing dependency
- extra dependency
- unstable dependency
- effect loop
- stale closure
- duplicate execution
- race condition
- missing cleanup
- state synchronization bug
- async result nakon unmount-a
- request koji se više ne odnosi na trenutni state

Ne koristi slepo ESLint dependency pravilo kao dokaz.

Analiziraj semantiku.

---

# 7. EFFECT LOOP HUNTER

Traži obrasce:

```tsx
useEffect(() => {
  setState(...)
}, [state])
```

i druge indirektne cikluse:

```text
effect A
↓
setState B
↓
render
↓
effect B
↓
setState A
```

Posebno proveri:

- object dependency
- array dependency
- inline function dependency
- selector koji vraća novu referencu
- callback koji se rekreira
- form watch values

Ako loop postoji samo teorijski, označi ga kao takvog.

---

# 8. MISSING CLEANUP

Pregledaj sve što registruje ili pokreće dugotrajan resource.

Traži:

- `addEventListener`
- `setInterval`
- `setTimeout`
- subscriptions
- observers
- WebSocket
- BroadcastChannel
- custom event bus
- media listeners
- geolocation watch
- animation frame
- workers

Proveri da li postoji cleanup.

Primer:

```tsx
useEffect(() => {
  window.addEventListener("resize", handler)

  return () => {
    window.removeEventListener("resize", handler)
  }
}, [])
```

Proveri i da li se za remove koristi ista funkcijska referenca.

---

# 9. EVENT LISTENER DUPLIKACIJA

Traži situacije gde component rerender ili remount može dodati više listenera.

Analiziraj:

```text
mount
↓
register
↓
rerender/remount
↓
register again
↓
event
↓
handler runs multiple times
```

Proveri posledice:

- duplicate API call
- duplicate analytics event
- duplicate navigation
- duplicate state mutation
- memory leak

---

# 10. TIMER BUGOVI

Pregledaj:

- `setTimeout`
- `setInterval`
- debouncing
- throttling

Traži:

- timer koji nije očišćen
- stale state
- više aktivnih timera
- timer koji radi posle navigation-a
- race sa user action-om
- unexpected reset
- interval drift gde je relevantno

Posebno analiziraj komponente koje se često mount/unmount-uju.

---

# 11. ASYNC RACE CONDITIONS

Za svaki async flow proveri:

```text
request A starts
↓
state changes
↓
request B starts
↓
B finishes
↓
A finishes
↓
A overwrites B
```

Traži ovo kod:

- search
- autocomplete
- filters
- pagination
- navigation
- profile switching
- tab switching
- live validation
- fetching po ID-u

Ovo je jedan od najvažnijih React bug pattern-a.

---

# 12. REQUEST CANCELLATION

Ako korisnik može brzo promeniti kontekst, proveri šta se događa sa prethodnim request-om.

Primer:

```text
/user/1
↓
fetch user 1
↓
navigate /user/2
↓
fetch user 2
↓
user 2 response
↓
user 1 late response
```

Proveri da li:

- postoji cancellation
- biblioteka ignoriše stale request
- request key sprečava overwrite
- component proverava relevance rezultata

Ne zahtevaj `AbortController` ako korišćena biblioteka već pravilno rešava problem.

---

# 13. PROMISE ERROR HANDLING

Traži:

- missing `catch`
- unhandled rejection
- async handler bez error handling-a
- loading state koji ostaje zauvek
- error state koji se nikad ne prikazuje
- optimistic state koji se ne rollback-uje

Prati kompletan tok:

```text
user action
↓
async call
↓
success/failure
↓
state
↓
UI
```

---

# 14. DOUBLE SUBMIT

Pregledaj sve važne forme i akcije.

Pitaj:

> Šta se dešava ako korisnik klikne dugme dva puta veoma brzo?

Traži:

- dva POST request-a
- duplicate record
- dupla naplata
- duplicate message
- duplicate navigation
- race između response-a

Proveri:

- pending state
- disabled state
- server idempotency
- mutation library behavior

Client-side disabled dugme nije zamena za server-side idempotency kada je operacija kritična.

---

# 15. OPTIMISTIC UPDATE BUGOVI

Ako postoji optimistic UI, prati:

```text
old state
↓
optimistic mutation
↓
server call
↓
success or failure
↓
cache/state reconciliation
```

Traži:

- missing rollback
- rollback na pogrešno stanje
- concurrent optimistic mutations
- server rezultat se ignoriše
- duplicate item
- temporary ID problem
- ordering problem

---

# 16. OUT OF ORDER MUTATIONS

Proveri scenario:

```text
mutation A
mutation B
```

gde oba menjaju isti resource.

Ako server odgovori:

```text
B
A
```

da li UI može završiti u starijem stanju?

Posebno proveri:

- autosave
- drag and drop
- settings
- inline editing
- status toggles

---

# 17. TANSTACK QUERY / SWR / SERVER STATE

Ako projekat koristi server-state biblioteku, proveri:

- query keys
- invalidation
- stale time
- cache time / gc time
- refetch behavior
- optimistic updates
- mutation callbacks
- placeholder data
- initial data
- pagination
- dependent queries

Posebno traži query-key collision.

Primer:

```tsx
["user"]
```

za više različitih korisnika može biti problem ako ID nije deo ključa.

Ali prijavi samo ako stvarni kod omogućava pogrešan cache reuse.

---

# 18. CACHE INVALIDATION

Za svaku mutation proveri:

> Koji podaci su ovom operacijom postali stale?

Zatim proveri šta kod invalidira.

Primer:

```text
updateProject()
↓
project changed
↓
project detail invalidated
↓
project list NOT invalidated
```

Rezultat:

jedan deo UI-ja prikazuje novu, drugi staru vrednost.

---

# 19. PAGINATION BUGOVI

Pregledaj:

- page-based pagination
- cursor pagination
- infinite scroll

Traži:

- duplicate items
- skipped items
- wrong cursor
- stale page
- filter promena bez resetovanja page-a
- total count mismatch
- delete sa poslednje stranice
- race pri load-more

---

# 20. FILTERING I SORTING

Proveri interakciju između:

- filtera
- sortiranja
- pagination-a
- search-a
- server state-a

Scenario:

```text
page 10
↓
change filter
↓
new result has 2 pages
```

Ako page ostane 10, korisnik može dobiti prazan ekran iako rezultati postoje.

---

# 21. SEARCH I AUTOCOMPLETE

Posebno proveri:

- debounce
- async races
- stale result
- loading indicators
- clearing query
- keyboard navigation
- response order
- cache keys

---

# 22. PROP DRILLING BUGOVI

Prop drilling nije automatski problem.

Traži samo situacije gde dugačak prop chain uzrokuje:

- stale value
- pogrešno prosleđivanje
- mismatch tipova
- optional fallback koji sakrije grešku
- duplicated handler logic

---

# 23. CALLBACK IDENTITY

Analiziraj slučajeve gde identitet callback-a utiče na ponašanje.

Na primer:

- event subscription
- memoized child
- effect dependency
- third-party component
- observer

Ne prijavljuj nedostatak `useCallback` kao bug samo radi optimizacije.

Potrebna je konkretna posledica.

---

# 24. useMemo I useCallback

Proveri:

- missing dependency
- stale memoized value
- nepotrebnu memoizaciju samo ako komplikuje correctness
- memoizaciju koja skriva mutable object problem

Fokus nije na mikro-optimizaciji.

Fokus je na pogrešnom ponašanju.

---

# 25. useRef BUGOVI

Traži:

- ref koji postaje stale source of truth
- ref koji se koristi umesto state-a, ali UI treba da reaguje
- DOM ref korišćen pre mount-a
- null assumptions
- ref shared kroz pogrešan lifecycle
- mutable ref koji narušava state invariants

---

# 26. CONDITIONAL HOOKS

Traži kršenje Rules of Hooks.

Posebno:

```tsx
if (condition) {
  useEffect(...)
}
```

ali proveri i custom hooks koji interno uslovno pozivaju hook.

Ako tooling/build već garantovano blokira problem, i dalje ga možeš prijaviti kao compile/runtime blocker ako postoji u trenutnom kodu.

---

# 27. CUSTOM HOOK FORENZIKA

Za važne custom hooks utvrdi:

- inpute
- state
- effects
- cleanup
- returned API
- lifecycle assumptions

Proveri da custom hook ne krije:

- global singleton state
- duplicate listener
- async race
- timer leak
- unexpected shared resource

---

# 28. CONTEXT BUGOVI

Za svaki važan Context proveri:

- default value
- provider placement
- nested providers
- provider remount
- rerender behavior
- stale value
- missing provider handling

Posebno traži situaciju gde navigation remountuje Provider i resetuje neočekivano stanje.

---

# 29. CONTEXT DEFAULT VALUE

Opasan obrazac može biti:

```tsx
createContext({
  user: null,
  logout: () => {}
})
```

ako component može raditi van Provider-a i tiho koristiti fake/default ponašanje.

Proveri da li to može sakriti integration bug.

---

# 30. PROVIDER REMOUNT BUGOVI

Prati Provider kroz component tree.

Pitaj:

> Da li promena route-a ili key-a remountuje Provider?

Ako da, proveri da li se time resetuje:

- cart
- auth-derived UI
- draft
- filters
- player
- form
- temporary state

---

# 31. REDUX / ZUSTAND / GLOBAL STORE

Ako postoji globalni store, proveri:

- selectors
- subscriptions
- persistence
- reset
- logout cleanup
- user switching
- cross-tab behavior

Traži:

- podatke prethodnog korisnika
- global state koji nije resetovan
- persisted sensitive data
- selector koji vraća pogrešno derived stanje

---

# 32. LOCALSTORAGE I SESSIONSTORAGE

Pregledaj sve accesses.

Proveri:

- SSR safety
- parse failure
- schema/version changes
- corrupted value
- quota failure
- sensitive data
- cross-tab synchronization
- stale state
- logout cleanup

Primer:

```tsx
JSON.parse(localStorage.getItem("x"))
```

bez zaštite može pasti ako je stored value korumpiran ili zastareo.

---

# 33. HYDRATION MISMATCH

Ako postoji SSR, aktivno traži server/client različit render.

Posebno:

- `Date`
- `Math.random`
- locale formatting
- timezone
- browser APIs
- persisted state
- viewport-dependent render
- authentication state
- media query
- dynamic IDs

Rekonstruiši:

```text
server HTML
vs
first client render
```

Ako nisu deterministički isti, proveri stvarni framework handling.

---

# 34. DATE I TIME BUGOVI

React UI često skriva timezone probleme.

Traži:

- server local timezone
- browser local timezone
- UTC
- ISO strings
- date-only string
- midnight boundary
- DST
- relative time

Primer:

```text
2026-09-25
```

ne mora imati isto značenje kao:

```text
2026-09-25T00:00:00Z
```

Proveri stvarnu semantiku aplikacije.

---

# 35. RANDOM I NON-DETERMINISTIC RENDER

Traži:

- `Math.random()` u renderu
- trenutni timestamp u renderu
- generator ID-a
- unstable sort
- mutable global state

Posebno kod SSR/hydration aplikacija.

---

# 36. KEYS U LISTAMA

Nemoj prijaviti svaki index key.

Analiziraj da li se lista:

- reorderuje
- filtrira
- sortira
- dodaje
- briše

Ako se koristi index kao key, proveri konkretan scenario gde state može završiti vezan za pogrešan element.

Primer:

```text
row A
row B
row C
```

brisanje A može dovesti do ponovne upotrebe component state-a ako keys nisu stabilni.

---

# 37. MUTATING STATE DIRECTLY

Traži:

```tsx
state.push(...)
state.x = ...
array.sort(...)
```

kada se radi direktno nad state objektom.

Proveri:

- da li se referenca menja
- da li React detektuje update
- da li je mutate-ovan shared object
- da li je query/store cache takođe promenjen

Ne prijavljuj mutaciju lokalne kopije kao state mutation.

---

# 38. ARRAY.sort BUGOVI

Posebno obrati pažnju:

```tsx
items.sort(...)
```

jer `sort()` menja originalni niz.

Ako `items` dolazi iz:

- props
- state
- cache
- global store

proveri posledice.

---

# 39. OBJECT I ARRAY IDENTITY

Traži kod koji očekuje stabilnu referencu, a stalno proizvodi novu.

Primer:

```tsx
const filters = { status }
```

ako se koristi kao dependency effect-a.

Ali prijavi samo kada postoji behavioural consequence.

---

# 40. NULL I UNDEFINED

Prati podatke od izvora do rendera.

Traži:

- async initial state
- optional API field
- missing route param
- undefined lookup
- deleted entity
- empty response
- invalid persisted value

Posebno:

```tsx
data.user.name
```

ako `user` realno može biti null.

---

# 41. EMPTY STATE

Za glavne liste proveri:

- `[]`
- `null`
- loading
- error
- no-results
- filtered-no-results

Traži kada dva različita stanja imaju isti UI i mogu zbuniti korisnika.

Primer:

```text
loading završio
API failed
```

ali UI kaže:

```text
Nema rezultata.
```

To može biti funkcionalni UX bug.

---

# 42. LOADING STATE

Proveri:

- loading nikad ne završava
- loading nestane prerano
- paralelni requests koriste jedan boolean
- request A završi i postavi `loading=false` dok B još traje

Primer:

```text
A starts
B starts
A finishes
loading = false
B still running
```

Ovo je čest concurrency bug.

---

# 43. BOOLEAN LOADING STATE ZA VIŠE OPERACIJA

Posebno pronađi:

```tsx
const [loading, setLoading] = useState(false)
```

ako više nezavisnih async operacija kontroliše isti state.

Rekonstruiši paralelni scenario.

---

# 44. ERROR STATE

Proveri:

- error ostaje posle uspešnog retry-a
- novi request ne resetuje error
- error prethodnog resource-a se prikazuje novom resource-u
- globalni error state prepisuje unrelated errors

---

# 45. COMPONENT UNMOUNT TOKOM ASYNC OPERACIJE

Proveri šta se događa ako:

```text
request starts
↓
component unmounts
↓
request finishes
```

Nemoj automatski tvrditi da svaki state update posle unmount-a pravi memory leak.

Analiziraj konkretnu verziju Reacta i stvarnu posledicu.

Važniji problem često je:

- stale side effect
- cache mutation
- navigation
- notification
- resource leak

---

# 46. ROUTING BUGOVI

Ako postoji router, proveri:

- route params
- search params
- navigation
- redirects
- Back/Forward
- deep link
- direct URL
- invalid URL state

Pitaj:

> Da li aplikacija radi ako korisnik ne dođe do stranice kroz očekivani prethodni ekran?

Nikad ne pretpostavljaj da user flow mora krenuti kroz UI.

---

# 47. URL KAO STATE

Ako filteri/tabovi/page/search žive i u URL-u i u React state-u, proveri ko je source of truth.

Traži:

```text
URL changes
↓
state does not update
```

ili:

```text
state changes
↓
URL updates
↓
effect reads URL
↓
state updates again
```

---

# 48. BACK/FORWARD NAVIGATION

Posebno testiraj mentalno:

- Back
- Forward
- refresh
- direct deep link
- duplicate tab

Traži UI koji ostaje stale jer očekuje samo navigation kroz svoje dugme.

---

# 49. FORM STATE

Ako se koriste:

- React Hook Form
- Formik
- custom forms

proveri:

- default values
- reset
- controlled/uncontrolled
- async initial data
- validation
- dirty state
- submit
- server errors

---

# 50. ASYNC DEFAULT VALUES

Scenario:

```text
component mounts
↓
form initializes empty
↓
API returns user
↓
props change
```

Da li form zaista dobija nove vrednosti?

Mnoge form biblioteke ne menjaju default values automatski nakon inicijalizacije.

Proveri biblioteku i konkretan kod.

---

# 51. CONTROLLED VS UNCONTROLLED INPUT

Traži transition:

```text
undefined
↓
"value"
```

ili obrnuto.

Proveri posledice:

- warning
- izgubljen input
- reset
- nepredvidivo form ponašanje

---

# 52. FORM VALIDATION MISMATCH

Uporedi:

```text
client validation
vs
server validation
```

React frontend nikad nije bezbednosna granica.

Ali i bezbednosno ispravan server može proizvesti UX bug ako pravila nisu konzistentna.

---

# 53. FILE INPUT

Pregledaj:

- reset
- multiple files
- size
- type
- preview URL
- object URL cleanup
- upload progress
- cancellation

Posebno traži:

```tsx
URL.createObjectURL(...)
```

bez:

```tsx
URL.revokeObjectURL(...)
```

kada može dovesti do dugotrajnog memory growth-a.

---

# 54. MODAL I DIALOG STATE

Proveri:

- open/close
- stale selected entity
- double modal
- background state
- focus return
- destructive confirmation

Scenario:

```text
open edit user A
close
open user B
```

Da li forma i state zaista prikazuju B?

---

# 55. CONDITIONAL RENDERING BUGOVI

Traži:

```tsx
value && <Component />
```

kada `value` može biti `0`.

Primer:

```tsx
{count && <Badge>{count}</Badge>}
```

može renderovati `0` na neočekivan način ili sakriti validnu nultu vrednost, zavisno od namere.

Analiziraj konkretan kontekst.

---

# 56. FALSY VALUE BUGOVI

Posebno proveri razliku između:

- `0`
- `""`
- `false`
- `null`
- `undefined`

Traži neispravne fallback obrasce:

```tsx
value || defaultValue
```

ako je `0` validna vrednost.

Tada možda treba:

```tsx
value ?? defaultValue
```

Ali samo ako domen podataka to potvrđuje.

---

# 57. NUMBER INPUT BUGOVI

Pregledaj:

- string vs number
- empty input
- `Number("")`
- `parseInt`
- decimals
- locale decimal separator
- NaN
- min/max

Posebno kod:

- novca
- količine
- procenta
- godina
- koordinata

---

# 58. MONEY I DECIMAL VALUES

Traži floating-point probleme:

```js
0.1 + 0.2
```

Ako UI računa:

- cenu
- porez
- popust
- total

proveri da li client calculation odgovara server calculation-u.

Ne oslanjaj se na frontend kao finalni finansijski source of truth.

---

# 59. DATE INPUT

`input type="date"` može imati različitu semantiku od timestamp-a.

Prati:

```text
input
↓
string
↓
Date parsing
↓
API
↓
DB
↓
response
↓
render
```

Traži timezone pomeranje datuma.

---

# 60. SELECT I MULTISELECT

Proveri:

- value type
- empty selection
- controlled state
- stale options
- async options
- removed option
- duplicate values

---

# 61. COMPONENT REUSE BUGOVI

Ako ista komponenta radi za više resource-a, proveri šta se dešava kada se props promene bez remount-a.

Scenario:

```text
<Resource id=1>
↓
route changes
↓
<Resource id=2>
```

Ako component instance ostaje ista:

- da li lokalni state ostaje od ID 1?
- da li effect reaguje?
- da li query key uključuje ID?

---

# 62. `key` KAO RESET MEHANIZAM

Ako se `key` koristi da prisilno remountuje komponentu, proveri:

- da li je key stabilan
- šta se resetuje
- da li se gubi user input
- da li se ponavlja expensive initialization

---

# 63. STRICT MODE

Ako je development Strict Mode uključen, razlikuj:

- development-only intentional invocation
- pravi production bug

Ali Strict Mode često otkriva:

- missing cleanup
- non-idempotent effect
- mutation tokom rendera

Nemoj problem odbaciti samo zato što se lakše vidi u developmentu.

---

# 64. RENDER SIDE EFFECTS

Render mora biti čist.

Traži u render path-u:

- state mutation
- storage writes
- API calls
- global mutation
- analytics event
- subscription
- navigation

Ako render može biti ponovljen, side effect može biti dupliran.

---

# 65. API CALL U RENDERU

Posebno prijavi ako component direktno poziva async/business operaciju tokom rendera bez odgovarajućeg framework mechanism-a.

Prati koliko puta može biti pozvana.

---

# 66. GLOBAL MUTABLE STATE

Traži module-level promenljive:

```ts
let currentUser
let cache = {}
let selectedItem
```

Ako React component-i zavise od njih, proveri:

- rerender
- SSR
- više korisnika
- tests
- stale state

---

# 67. MEMOIZED COMPONENTS

Za `React.memo` proveri:

- custom comparator
- ignored prop
- callback
- nested mutable data

Opasan custom comparator može sprečiti validan rerender.

---

# 68. CUSTOM EQUALITY FUNCTIONS

Ako store/query/component koristi custom equality, proveri da li može proglasiti dva različita stanja jednakim.

---

# 69. SUSPENSE

Ako postoji Suspense, proveri:

- fallback granice
- nested boundaries
- unexpected remount
- loading waterfall
- error handling
- state reset

Ne prijavljuj standardno Suspense ponašanje kao bug.

---

# 70. TRANSITIONS

Ako se koriste `startTransition` ili related React APIs, proveri:

- stale result
- pending state
- race sa urgent update-om
- pogrešan assumption da transition sprečava async race

---

# 71. ERROR BOUNDARIES

Proveri:

- scope
- recovery
- reset
- navigation
- fallback
- logging

Posebno utvrdi da li greška u jednom delu ruši mnogo veći deo UI-ja nego što je potrebno.

---

# 72. PORTALS

Ako postoje modals/tooltips/menus preko portal-a, proveri:

- event propagation
- cleanup
- stacking
- focus
- lifecycle
- stale DOM target

---

# 73. THIRD-PARTY COMPONENTS

Za kompleksne biblioteke proveri assumptions na granici:

- controlled value
- callbacks
- lifecycle
- portal behavior
- async state
- serialization

Ne analiziraj internu biblioteku kao svoj kod osim ako problem proizlazi iz načina korišćenja.

---

# 74. DRAG AND DROP

Proveri:

- stable IDs
- reorder
- optimistic state
- failed persistence
- concurrent update
- stale index

Nikad nemoj koristiti samo index kao permanent business identity.

---

# 75. VIRTUALIZED LISTS

Ako postoji virtualization:

- stable item key
- dynamic heights
- stale measurement
- scroll restoration
- filtering
- focus
- selected row

---

# 76. TABLES

Kompleksne tabele često kombinuju:

- sorting
- filtering
- pagination
- selection
- editing
- virtualization

Prati njihove interakcije, a ne svaku funkciju izolovano.

---

# 77. SELECTION STATE

Scenario:

```text
select row 5
↓
filter changes
↓
row 5 no longer visible
```

Da li selection i dalje utiče na destructive action?

Posebno proveri bulk actions.

---

# 78. DELETE FLOW

Za delete:

```text
click
↓
confirmation
↓
request
↓
server
↓
cache
↓
selection
↓
navigation
```

Traži:

- stale selected item
- deleted item ostaje u listi
- current detail route pokazuje deleted entity
- duplicate delete
- optimistic delete bez rollback-a

---

# 79. CREATE FLOW

Proveri:

- duplicate submit
- temporary IDs
- server-generated ID
- cache insertion
- navigation
- default state reset

---

# 80. UPDATE FLOW

Proveri:

- stale form
- conflicting writes
- cache invalidation
- partial update
- unexpected field overwrite
- server/client merge semantics

---

# 81. USER SWITCHING

Ako aplikacija podržava logout/login ili switch account:

```text
User A
↓
cache/store/localStorage
↓
logout
↓
User B
```

Proveri da B ne može dobiti:

- A podatke
- A cached response
- A draft
- A selected resource
- A notification state

Ovo može biti i security finding.

---

# 82. MULTI-TAB BEHAVIOR

Proveri kada korisnik otvori aplikaciju u dva taba.

Scenario:

```text
Tab A logs out
Tab B remains open
```

ili:

```text
Tab A edits resource
Tab B has stale state
```

Proceni da li aplikacija ima zahtev za cross-tab synchronization.

Ne prijavljuj ako nije relevantno za proizvod.

---

# 83. NETWORK FAILURE

Za critical interaction proveri:

- offline
- timeout
- connection reset
- server 500
- malformed response

Da li UI:

- ostaje loading
- prikazuje success iako nije uspeo
- gubi lokalne podatke
- dozvoljava bezbedan retry

---

# 84. RETRY BUGOVI

Ako biblioteka automatski retry-uje, proveri da li je operacija bezbedna za retry.

GET je obično drugačiji od:

- create
- payment
- send email
- destructive mutation

Retry write operacije bez idempotency-ja može napraviti duplicate side effect.

---

# 85. OFFLINE I ONLINE EVENTS

Ako aplikacija reaguje na connectivity, proveri:

- false online state
- queued actions
- duplicate sync
- stale indicator
- reconnection races

---

# 86. WEBSOCKET / REALTIME

Ako postoji realtime:

- subscribe
- unsubscribe
- reconnect
- duplicate subscription
- event ordering
- stale entity
- optimistic mutation + server event
- duplicate event

---

# 87. POLLING

Ako postoji polling:

- cleanup
- visibility
- duplicate polling
- overlapping requests
- backoff
- stale closure
- tab background behavior

---

# 88. INTERVAL + ASYNC

Posebno proveri:

```text
interval every 5s
request takes 8s
```

Da li requests počinju da se preklapaju?

To može proizvesti:

- race
- server overload
- stale overwrite

---

# 89. ACCESSIBILITY KAO FUNCTIONAL BUG

Ne radi kompletan accessibility audit osim ako nije traženo.

Ali prijavi a11y problem kada utiče na funkcionalnost.

Na primer:

- button nije dostupan tastaturom
- modal zarobi focus
- input nema upotrebljiv label
- user ne može aktivirati critical action bez miša

---

# 90. TOUCH I MOBILE EVENTS

Proveri gde postoji custom pointer/touch logic:

- duplicate click/touch
- gesture collision
- hover-only functionality
- scroll locking
- passive listener assumptions

---

# 91. MEMORY LEAK HUNTER

Memory leak finding mora imati konkretan resource lifecycle.

Traži:

```text
create/register
↓
component lifecycle
↓
missing destroy/unregister
```

Resursi:

- listener
- interval
- observer
- socket
- worker
- blob URL
- media resource
- subscription
- third-party instance

---

# 92. LARGE OBJECT RETENTION

Proveri closures koje mogu dugo zadržavati:

- velike response objekte
- DOM nodes
- files
- images
- media data

Ne proglašavaj leak bez realnog lifecycle-a.

---

# 93. PERFORMANCE BUG VS PERFORMANCE IMPROVEMENT

Razlikuj:

**BUG**

Primer:

UI freeze od višesekundne sinhrone operacije.

**IMPROVEMENT**

Primer:

component može rerenderovati nešto češće nego idealno, ali korisnik nema vidljivu posledicu.

Ne mešaj ova dva.

---

# 94. EXPENSIVE RENDER

Pronađi:

- ogromne `.map`
- nested loops
- parsing
- sorting
- filtering
- formatting
- calculations

koji se izvršavaju pri svakom renderu.

Proceni stvaran dataset pre severity-ja.

---

# 95. UNNECESSARY RERENDER

Nemoj brojati rerendere kao bug bez posledice.

Finding zahteva makar jedno:

- vidljiv jank
- skup render
- expensive child tree
- network/effect side effect
- battery/resource impact

---

# 96. PRODUCTION VS DEVELOPMENT

Traži probleme koji se kriju zbog development okruženja:

- Strict Mode differences
- mocked API
- fast localhost network
- tiny dev dataset
- missing minification issue
- environment variables
- production CDN
- SSR differences

---

# 97. CROSS-FILE TRACE

Za svaki ozbiljan bug nemoj stati na component-u.

Prati:

```text
UI
↓
hook
↓
store/query
↓
API
↓
response
↓
cache
↓
component
```

Bug često nastaje na granici između dva sloja.

---

# 98. FALSE-POSITIVE PREVENTION

Pre prijave P0/P1/P2 problema proveri:

1. ceo component
2. custom hook
3. parent
4. child
5. store
6. query layer
7. router
8. API behavior
9. framework behavior
10. tests

Nemoj zaključiti iz jednog izolovanog snippet-a.

---

# 99. REPRODUCTION SCENARIO

Svaki ozbiljan bug mora imati scenario.

Koristi format:

```text
Initial state:

1.
2.
3.

Expected:

Actual:

Why it happens:
```

Ako ne možeš da napraviš realan scenario, smanji confidence.

---

# 100. SEVERITY

Koristi:

## P0 - CRITICAL

- security compromise
- ozbiljan data loss
- catastrophic application failure

## P1 - HIGH

- critical user flow ne radi
- ozbiljan data corruption
- major race condition
- major production failure

## P2 - MEDIUM

- realan funkcionalni bug sa ograničenijim impact-om

## P3 - LOW

- edge-case bug
- manja funkcionalna nekonzistentnost

## P4 - IMPROVEMENT

- maintainability ili performance poboljšanje koje nije bug

---

# 101. CONFIDENCE

Za svaki finding koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

direktno dokazano execution flow-om, testom ili jasnom semantikom koda.

MEDIUM:

jak dokaz iz koda, ali nedostaje runtime potvrda.

LOW:

scenario zavisi od informacija koje nisu dostupne.

---

# 102. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

Nemoj THEORETICAL nalaz opisivati kao potvrđenu grešku.

---

# 103. FINDING FORMAT

Za svaki značajan finding koristi:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Component:
File:
Hook/Function:
Relevant location:

Problem:

Evidence:

State/Data Flow:

Reproduction:

Expected behavior:

Actual behavior:

Impact:

Root cause:

Recommended fix:

Regression test:

Complexity:
XS / S / M / L / XL
```

---

# 104. TESTOVI

Pregledaj postojeće React testove.

Traži:

- happy-path-only tests
- missing interaction tests
- missing async race tests
- over-mocking
- direct implementation testing
- tests koji ne čekaju async update pravilno
- fake timers misuse
- flaky tests
- snapshot-only coverage

Pitaj:

> Koji bugovi iz trenutnog koda prolaze kroz postojeći test suite?

To je važnije od samog broja testova.

---

# 105. GENERIŠI REGRESSION TEST ZA SVAKI OZBILJAN BUG

Za P0/P1/P2 finding predloži test koji:

1. pada na trenutnoj implementaciji
2. prolazi nakon popravke
3. direktno reprodukuje root cause

Ne predlaži samo generički "dodati test".

---

# 106. NE MENJAJ KOD

Tokom ovog audita:

- ne edituj source
- ne refaktoriši
- ne otvaraj PR
- ne menjaj dependencies
- ne "popravljaj usput"

Prvo završi bug audit.

---

# 107. OUTPUT - REACT_BUG_AUDIT.md

Finalni rezultat strukturiraj kao:

## 1. Executive Summary

Navedi:

- React verziju
- framework
- state architecture
- server-state layer
- broj potvrđenih problema po severity-ju
- najopasnije bug pattern-e

## 2. State Architecture

Objasni source-of-truth model.

## 3. Critical UI Flows

Tokovi koje si pratio.

## 4. Findings Summary

| ID | Severity | Category | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 5. P0 Findings

## 6. P1 Findings

## 7. P2 Findings

## 8. P3 Findings

## 9. P4 Improvements

## 10. State & Derived State Findings

## 11. useEffect Findings

## 12. Async & Race Condition Findings

## 13. Server-State / Cache Findings

## 14. Form Findings

## 15. Routing Findings

## 16. Hydration / SSR Findings

## 17. Resource & Memory Findings

## 18. Concurrency Findings

## 19. Error Handling Findings

## 20. Existing Test Weaknesses

## 21. Missing Regression Tests

## 22. Things Done Well

Obavezno dokumentuj i pravilno implementirane obrasce koje ne treba menjati.

## 23. Unknown / Not Verified

Jasno navedi šta nisi mogao potvrditi.

---

# 108. BUG PATTERN MATRIX

Napravi pregled:

| Pattern | Checked | Findings | Highest severity |
|---|---|---|---|
| Stale closures | | | |
| Effect loops | | | |
| Missing cleanup | | | |
| Async races | | | |
| Double submit | | | |
| Cache invalidation | | | |
| Derived state drift | | | |
| Hydration | | | |
| Form state | | | |
| Routing | | | |
| Memory/resource leaks | | | |
| User switching | | | |
| Pagination | | | |
| Date/time | | | |

Ne popunjavaj findings ako nešto nije stvarno pronađeno.

---

# 109. FINAL SECOND PASS

Kada završiš prvi audit, uradi potpuno novi prolaz iz perspektive korisničkih akcija.

Za svaki critical feature mentalno izvrši:

### Fast user pass

Šta ako korisnik:

- klikne dva puta
- veoma brzo promeni filter
- brzo menja tabove
- brzo navigira između dva resource-a

### Slow network pass

Šta ako request traje 10 sekundi?

### Out-of-order pass

Šta ako response-i stignu obrnutim redosledom?

### Failure pass

Šta ako prvi request uspe, a drugi padne?

### Navigation pass

Šta ako korisnik ode sa stranice dok operacija traje?

### Back/Forward pass

Šta ako koristi browser history?

### Refresh pass

Šta ako refreshuje u sred flow-a?

### Multi-tab pass

Šta ako istu aplikaciju koristi u dva taba?

### Empty-data pass

Šta ako nema nijednog record-a?

### Huge-data pass

Šta ako lista ima 10, 1.000 ili 100.000 stavki?

Ne tvrdi performance rezultat bez benchmarka, ali identifikuj algoritamski i rendering rizik.

---

# 110. FINAL ADVERSARIAL STATE PASS

Za svaki važan state pitaj:

> Kako ovaj state može postati netačan?

Zatim proveri:

- ko ga postavlja
- ko ga resetuje
- ko ga može prepisati
- koliko async operacija utiče na njega
- šta se događa pri remount-u
- šta se događa pri logout-u
- šta se događa pri navigation-u
- šta se događa pri failure-u

Za svaki važan query/cache entry pitaj:

> Ko ga invalidira?

Za svaki effect pitaj:

> Zašto ovaj effect postoji i kada prestaje da važi?

Za svaki async callback pitaj:

> Da li rezultat i dalje pripada trenutnom UI stanju kada stigne?

Za svaki form pitaj:

> Može li korisnik izgubiti podatke ili poslati operaciju dva puta?

---

# 111. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nijedan ozbiljan bug nije zasnovan samo na pattern matching-u
- svaki P0/P1/P2 ima execution flow
- svaki race condition ima redosled događaja koji ga reprodukuje
- stale closure findings imaju dokaz da callback zaista može postati stale
- nisi prijavio index key bez realnog reorder/filter/delete scenarija
- nisi prijavio nedostatak `useMemo` ili `useCallback` kao bug bez posledice
- nisi proglasio svaki missing cleanup memory leak-om bez resource lifecycle-a
- framework-specific ponašanje je provereno
- Strict Mode development behavior nije pogrešno predstavljen kao production behavior
- testovi nisu korišćeni kao dokaz samo zato što prolaze
- isti root cause nije prijavljen deset puta
- bugovi i improvements su jasno odvojeni
- svaki recommended fix rešava root cause
- svaki ozbiljan bug ima predlog regression testa

---

# KONAČNO PRAVILO

Nemoj mi vratiti izveštaj tipa:

> Koristi useMemo, useCallback i dodaj dependencies u useEffect.

To nije React bug hunting.

Želim da pratiš stvarno ponašanje aplikacije kroz vreme.

React bug često ne postoji u jednoj liniji.

On izgleda ovako:

```text
render 1
↓
effect starts request A
↓
user changes state
↓
render 2
↓
request B starts
↓
B finishes
↓
UI becomes correct
↓
A finishes
↓
stale response overwrites UI
```

ili:

```text
component mounts
↓
listener registered
↓
component remounts
↓
second listener registered
↓
single event fires
↓
business action runs twice
```

ili:

```text
server data
↓
copied into local state
↓
server data changes
↓
local copy does not
↓
UI displays stale information
```

Traži upravo takve probleme.

Razmišljaj u terminima:

- vremena
- redosleda događaja
- lifecycle-a
- ownership-a state-a
- concurrency-ja
- async operacija
- source of truth-a

Ne ocenjuj React kod prema tome koliko izgleda elegantno.

Oceni ga prema tome:

> Da li za sve realne redoslede korisničkih i sistemskih događaja proizvodi tačno očekivano stanje?

Ako nema dovoljno dokaza za nalaz:

**NOT VERIFIED.**

Ako je nešto samo unapređenje:

**P4 - IMPROVEMENT.**

Ako je stvarni bug:

dokaži ga execution flow-om.

Cilj je dobiti forenzički precizan React bug audit koji se može direktno pretvoriti u:

- reprodukciju
- fix
- regression test
- verifikaciju popravke
