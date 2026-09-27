---
id: UPL-IT-004
number: 4
slug: frontend-architecture-audit
title: Frontend Architecture Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.1
status: stable
---

# FRONTEND ARCHITECTURE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu frontend arhitekture kompletnog projekta.

Glavni cilj:

> Utvrditi da li je frontend organizovan tako da ostane stabilan, razumljiv, skalabilan i bezbedan za dalje promene, bez uvođenja nepotrebne kompleksnosti.

Ovo nije:

- generički code review
- vizuelni design review
- formatting review
- potraga za "modernijim" obrascima samo zato što postoje
- automatski refactor
- lista subjektivnih best practices

Fokus je na stvarnoj arhitekturi i njenim posledicama.

Prioritet:

**correctness > architectural clarity > maintainability > scalability > elegance**

Ne prijavljuj problem zato što kod nije organizovan po tvojoj omiljenoj strukturi.

Svaki ozbiljan nalaz mora imati konkretan uticaj.

---

# 1. UTVRDI STACK

Pre analize utvrdi:

- framework
- React/Vue/Angular/Svelte verziju
- TypeScript/JavaScript
- router
- state management
- server-state biblioteku
- form biblioteku
- styling sistem
- UI/component library
- build system
- test framework
- monorepo setup ako postoji
- backend/frontend granicu

Pregledaj najmanje:

- `package.json`
- lockfile
- `src/`
- `app/`
- `pages/`
- `components/`
- `features/`
- `modules/`
- `hooks/`
- `stores/`
- `services/`
- `lib/`
- `utils/`
- `contexts/`
- testove
- konfiguracije

Nemoj donositi arhitektonske zaključke pre nego što mapiraš strukturu.

---

# 2. NAPRAVI FRONTEND MAPU

Napravi realnu mapu:

```text
Routing
↓
Pages / Screens
↓
Features
↓
Components
↓
Hooks / State
↓
Services
↓
API / Backend
```

Ako projekat koristi drugačiji model, dokumentuj ono što postoji.

Identifikuj:

- application shell
- route-level sloj
- feature sloj
- shared UI
- domain logic
- data access
- global state
- server state
- utilities
- integration layer

---

# 3. FEATURE BOUNDARIES

Utvrdi kako su feature-i organizovani.

Za svaki važan feature proveri:

- gde počinje
- koje komponente poseduje
- koje hook-ove koristi
- gde mu je state
- gde pristupa API-ju
- gde mu je business logika
- koje shared module-e koristi

Traži feature koji je razbacan kroz ceo projekat bez jasne granice.

Primer lošeg toka:

```text
Page
↓
shared component
↓
global hook
↓
generic util
↓
global store
↓
API helper
```

gde se business logika nalazi na više nevezanih mesta.

---

# 4. LAYERING

Utvrdi da li postoje smisleni slojevi:

- presentation
- feature/domain
- state
- data access
- integration

Traži:

- UI komponentu koja direktno sadrži veliku količinu business logike
- utility koji poziva API i menja UI state
- data layer koji zavisi od presentation layer-a
- circular architectural dependency

Nije obavezno da projekat koristi formalni layered architecture.

Bitno je da odgovornosti budu razumljive.

---

# 5. DEPENDENCY DIRECTION

Analiziraj smer dependency-ja.

Poželjno je da niži/generičniji slojevi ne zavise od specifičnih feature-a bez razloga.

Traži obrasce:

```text
shared
↓
imports specific feature
```

ili:

```text
utility
↓
imports page component
```

ili:

```text
domain logic
↓
depends on visual component
```

Ako takva zavisnost postoji, objasni konkretan maintainability ili coupling problem.

---

# 6. CIRCULAR DEPENDENCIES

Traži direktne i indirektne cikluse.

Primer:

```text
A imports B
B imports C
C imports A
```

Proceni posledice:

- initialization order
- undefined exports
- bundling problemi
- testability
- coupling

Nemoj prijaviti samo tooling warning bez praktične posledice.

---

# 7. COMPONENT RESPONSIBILITY

Za velike komponente proveri koliko odgovornosti imaju.

Traži komponentu koja istovremeno:

- fetchuje podatke
- drži kompleksan state
- validira formu
- sadrži business rules
- renderuje veliki UI
- upravlja modalima
- navigira
- šalje analytics
- manipuliše storage-om

Takva komponenta može predstavljati architectural hotspot.

Ali velika komponenta nije automatski loša.

Prijavi problem samo kada veličina stvara:

- visok coupling
- teško testiranje
- duplicate logic
- česte regresije
- teško razumevanje toka

---

# 8. SMART VS PRESENTATIONAL COMPONENTS

Ne forsiraj zastarelu formalnu podelu.

Umesto toga proveri:

> Da li komponenta ima jasnu odgovornost?

Ako UI komponenta ima domain-specific logic koja se ponavlja na više mesta, prijavi problem.

---

# 9. REUSABILITY

Ne pokušavaj sve da pretvoriš u reusable component.

Traži dve suprotne greške:

## Premalo reuse-a

- ista logika kopirana na više mesta
- isti UI pattern implementiran više puta
- validation drift
- styling drift

## Previše apstrakcije

- generic component sa desetinama props-a
- mnogo boolean flagova
- teško razumljiv "universal" component
- abstraction koja skriva različite business slučajeve

---

# 10. BOOLEAN PROP EXPLOSION

Traži komponente poput:

```tsx
<Component
  compact
  dark
  editable
  searchable
  admin
  mobile
  bordered
  collapsible
/>
```

Proveri da li kombinacije flagova proizvode:

- teško predvidivo ponašanje
- invalid kombinacije
- puno conditional logic-a
- nejasan API

Ne prijavljuj nekoliko smislenih boolean props-a kao problem.

---

# 11. COMPONENT API DESIGN

Za shared komponente proveri:

- naziv props-a
- required vs optional
- default vrednosti
- event callbacks
- controlled/uncontrolled model
- composition
- children usage
- prop leakage

Traži API koji dozvoljava invalid stanje.

---

# 12. INVALID STATES

Jedan od glavnih ciljeva arhitekture je da invalid stanje bude teško ili nemoguće napraviti.

Traži:

```ts
loading: boolean
error: boolean
success: boolean
```

gde je moguće:

```text
loading = true
error = true
success = true
```

ako je stvarno značenje međusobno isključivo.

Razmotri da li bi state model trebalo da bude eksplicitniji.

---

# 13. STATE OWNERSHIP

Za svaki važan state pitaj:

> Ko je vlasnik ovog state-a?

Proveri da li je state:

- previše visoko
- previše nisko
- dupliran
- globalan bez potrebe
- lokalni iako ga deli više nezavisnih delova

Ne prijavljuj state placement samo na osnovu stila.

Navedi konkretan problem.

---

# 14. GLOBAL STATE AUDIT

Mapiraj šta je globalno.

Klasifikuj:

- auth
- user preferences
- UI state
- domain state
- server state
- transient state

Traži:

- global state koji pripada samo jednom ekranu
- server response kopiran u global store bez razloga
- global modal state koji stvara coupling
- store koji postaje "sve u jednom"

---

# 15. GLOBAL STORE GOD OBJECT

Ako jedan store sadrži mnogo nepovezanih stvari, proveri:

- coupling
- rerenders
- reset ponašanje
- ownership
- testing
- persistence

Ne predlaži cepanje samo zbog broja linija.

Pokaži feature boundaries koje store trenutno meša.

---

# 16. SERVER STATE VS CLIENT STATE

Posebno razdvoji:

**Server state**

- podaci iz API-ja
- baza
- remote resource-i

**Client state**

- modal open
- selected tab
- temporary form input
- local interaction

Traži server state koji se ručno kopira u:

- Redux
- Zustand
- Context
- `useState`

i zatim ručno sinhronizuje.

---

# 17. SOURCE OF TRUTH

Za svaki ključan podatak identifikuj jedan primarni source of truth.

Problematičan primer:

```text
API response
↓
query cache
↓
Redux
↓
component state
↓
form state
```

Ako svi mogu biti menjani nezavisno, postoji visok rizik drift-a.

---

# 18. STATE SYNCHRONIZATION

Traži `useEffect` koji postoji samo da sinhronizuje dva state-a.

Primer:

```tsx
useEffect(() => {
  setLocalValue(globalValue)
}, [globalValue])
```

To nije automatski problem.

Proveri da li može doći do:

- loop-a
- stale state-a
- overwrite-a user inputa
- timing problema

---

# 19. DOMAIN LOGIC

Pronađi business pravila poput:

- permissions
- pricing
- status transitions
- eligibility
- limits
- calculations

Proveri gde se nalaze.

Traži istu domain logiku u:

- komponentama
- hook-ovima
- utils
- serveru

Ako ista pravila postoje na više frontend mesta, proveri drift.

---

# 20. BUSINESS LOGIC U KOMPONENTAMA

Primer:

```tsx
if (
  user.role === "admin" &&
  order.status !== "cancelled" &&
  order.total > 1000
) {
  ...
}
```

Ako se isto pravilo koristi na više mesta, može zaslužiti domain abstraction.

Ali nemoj praviti abstraction za svaku `if` proveru.

---

# 21. DUPLICATED LOGIC

Repository-wide traži slične implementacije za:

- permissions
- validation
- formatting
- calculations
- date handling
- route generation
- API payload construction
- status mapping

Najvažnije pitanje:

> Da li se kopije već ponašaju različito?

Behavioural drift je jači finding od same dupliciranosti.

---

# 22. SHARED UTILITIES

Pregledaj `utils` i `lib`.

Traži "junk drawer" module-e gde završava sve.

Primer:

```text
utils.ts
```

sa:

- date functions
- auth
- API
- string helpers
- business rules
- analytics

Predloži razdvajanje samo ako trenutna struktura otežava ownership ili stvara coupling.

---

# 23. GENERIC HELPERS

Traži helper funkcije koje su postale previše generičke.

Simptomi:

- mnogo optional argumenata
- options object sa mnogo flagova
- različiti return tipovi
- mnogo branch-eva po feature-u

Proveri da li jedna funkcija zapravo radi više različitih poslova.

---

# 24. CUSTOM HOOK ARCHITECTURE

Mapiraj custom hooks.

Za svaki važan hook proveri:

- responsibility
- side effects
- API calls
- state
- returned API
- reuse

Traži hook koji je postao mini-application layer bez jasne granice.

---

# 25. HOOK COMPOSITION

Proveri da li hooks:

- elegantno kombinuju manje behavior-e
- ili formiraju dubok dependency chain

Primer:

```text
useFeature
↓
useAccount
↓
usePermissions
↓
useSettings
↓
useUser
```

Proceni:

- koliko skrivenog rada pokreće jedan hook
- da li nastaju duplicate query-ji
- koliko je teško pratiti flow

---

# 26. HIDDEN SIDE EFFECTS

Funkcija nazvana:

```ts
getUserPreferences()
```

ne bi neočekivano trebalo da:

- zapisuje storage
- šalje analytics
- menja global store

Traži API-je sa misleading side effects.

---

# 27. SERVICE LAYER

Ako postoji `services`, proveri da li ima jasnu svrhu.

Traži:

- thin wrappers bez vrednosti
- business logic razbacanu između service-a i component-a
- service koji direktno menja UI store
- service koji kombinuje potpuno nepovezane domene

---

# 28. API CLIENT ARCHITECTURE

Pregledaj:

- base URL
- headers
- auth
- error handling
- parsing
- retries
- interceptors
- typing

Traži:

- više API client implementacija
- različito error ponašanje po feature-u
- duplicate auth header logic
- response parsing u component-u

---

# 29. NETWORK BOUNDARY

Frontend mora jasno da zna gde završava local logic, a počinje remote call.

Traži component koji direktno konstruiše kompleksan backend payload na više mesta.

Ako payload mapiranje predstavlja domain logic, možda pripada posebnijem sloju.

---

# 30. TYPES

Pregledaj type architecture.

Traži:

- isti entity definisan više puta
- API type različit od UI type-a bez jasnog mapping-a
- mnogo `any`
- preširoke tipove
- type assertions koje zaobilaze realnu strukturu

Nemoj zahtevati maksimalnu type kompleksnost.

Tipovi treba da smanjuju mogućnost greške.

---

# 31. DOMAIN TYPES VS API TYPES

Ne mora svaki API response biti direktno UI model.

Proveri da li postoji potreba za mapping slojem.

Na primer:

```text
API UserDTO
↓
mapper
↓
User model
↓
UI
```

Posebno ako API koristi:

- nullable vrednosti
- drugačije naming konvencije
- timestamps
- raw status codes

---

# 32. TYPE ASSERTIONS

Pretraži:

```ts
as SomeType
```

Posebno:

```ts
as any
as unknown as
```

Za svaki relevantan slučaj proveri da li assertion skriva realan contract mismatch.

---

# 33. ENUMS I STATUSI

Ako entity ima statuse, proveri da li su definisani konzistentno.

Traži:

```text
"active"
"ACTIVE"
1
Status.Active
```

na različitim mestima.

Status drift je čest cross-layer problem.

---

# 34. ROUTING ARCHITECTURE

Pregledaj:

- route organization
- nesting
- params
- search params
- protected routes
- layout boundaries

Traži routing logic razbacanu kroz komponente.

---

# 35. HARD-CODED ROUTES

Traži:

```ts
"/users/" + id
```

na mnogo mesta.

Ako route pattern često postoji na više mesta, razmotri centralizovan route builder.

Ali ne pravi veliki routing abstraction za tri statična linka.

---

# 36. NAVIGATION LOGIC

Proveri da li business logic zavisi od toga kako je korisnik stigao do ekrana.

Loš assumption:

```text
Screen B radi samo ako korisnik prvo otvori Screen A
```

Direktan URL mora biti analiziran gde je relevantno.

---

# 37. FORM ARCHITECTURE

Mapiraj velike forme.

Proveri:

- schema
- form state
- validation
- domain transformation
- API payload
- errors

Traži form component od više stotina linija koji kombinuje sve ove slojeve.

---

# 38. VALIDATION ARCHITECTURE

Utvrdi gde se validira:

- client
- shared schema
- server

Frontend arhitektonski treba da razlikuje:

- UX validation
- authoritative validation

Ne oslanjaj se na client kao authority.

---

# 39. ERROR ARCHITECTURE

Mapiraj kako greške putuju:

```text
API
↓
service
↓
query/mutation
↓
component
↓
user
```

Traži:

- svaka komponenta drugačije interpretira isti error
- raw backend messages direktno prikazane korisniku
- swallowed errors
- global error handler koji gubi context

---

# 40. ERROR TYPES

Ako sve greške postaju:

```text
Something went wrong
```

proveri da li aplikacija gubi korisne kategorije:

- validation
- auth
- permission
- rate limit
- network
- server
- conflict

Ali ne uvodi kompleksnu error taxonomy bez potrebe.

---

# 41. LOADING ARCHITECTURE

Proveri da li loading state postoji:

- globalno
- po route-u
- po component-u
- po query-ju

Traži jedan globalni `loading` state za više nepovezanih operacija.

---

# 42. MODAL ARCHITECTURE

Pregledaj način otvaranja modala.

Mogući modeli:

- local state
- route-driven
- global store
- modal service

Nijedan nije automatski najbolji.

Proceni da li trenutni model stvara coupling ili state probleme.

---

# 43. NOTIFICATION / TOAST ARCHITECTURE

Traži:

- duplicated success poruke
- error handling direktno vezan za toast
- business logic koja zavisi od UI notification sistema

Toast treba da bude prezentacija događaja, ne business kontrola.

---

# 44. PERMISSION ARCHITECTURE

Mapiraj frontend permission logic.

Proveri:

- central source
- role checks
- capability checks
- UI guards

Traži:

```tsx
user.role === "admin"
```

razbacano kroz desetine komponenti ako postoji kompleksniji permission model.

Ali zapamti:

Frontend permission architecture nije server authorization.

---

# 45. FEATURE FLAGS

Ako postoje feature flags:

- gde se čitaju
- kako se override-uju
- fallback
- stale flags
- cleanup starih flagova

Traži:

- permanent dead branches
- flag logic razbacanu po komponentama
- client flag koji se pogrešno koristi kao security kontrola

---

# 46. CONFIGURATION ARCHITECTURE

Mapiraj:

- env
- runtime config
- build config
- feature config

Traži:

- hardcoded URL-ove
- duplicated env parsing
- inconsistent fallback
- client/server config mix

---

# 47. DESIGN SYSTEM GRANICE

Ako postoji design system, proveri:

- primitive komponente
- composed components
- feature components

Traži domain-specific behavior u generičkom Button/Input/Dialog sloju.

---

# 48. UI PRIMITIVES

Primitive UI component treba da ostane dovoljno generičan.

Ako shared `Button` zna za:

- subscription
- user roles
- business status
- API requests

granice su verovatno loše.

---

# 49. FEATURE COMPONENTS

Suprotno tome, nemoj gurati business feature u design system samo zato što se koristi dva puta.

Razlikuj:

- reusable visual primitive
- reusable domain component

---

# 50. STYLING ARCHITECTURE

Bez subjektivnog style review-a proveri:

- global CSS leakage
- specificity wars
- duplicated theme constants
- inline magic values
- inconsistent responsive rules

Prijavi samo ako utiče na maintainability ili behavior.

---

# 51. RESPONSIVE LOGIC

Traži JavaScript-based responsive logic kada CSS može rešiti isto, posebno ako JS verzija uvodi:

- SSR mismatch
- resize listeners
- duplicate breakpoint definitions

Ali ne prijavljuj JS responsive behavior kada je stvarno potreban.

---

# 52. FEATURE FOLDER COHESION

Za svaki feature proveri koliko fajlova potrebnih za razumevanje feature-a živi zajedno.

Ako developer mora da skače kroz:

```text
components/
hooks/
utils/
services/
stores/
types/
```

za jedan mali feature, proceni da li struktura fragmentira ownership.

---

# 53. TYPE-BASED VS FEATURE-BASED STRUCTURE

Ne forsiraj nijedan model.

Proceni trenutni projekat.

Type-based struktura može biti dobra za mali projekat.

Feature-based može biti bolja kada aplikacija raste.

Finding zahteva konkretan dokaz da trenutna struktura otežava promene.

---

# 54. MONOREPO FRONTEND BOUNDARIES

Ako postoji monorepo, proveri:

- shared packages
- UI package
- types
- API client
- feature packages

Traži:

- package koji zna previše o aplikaciji
- circular workspace dependency
- duplicated dependencies
- version drift

---

# 55. BARREL EXPORTS

Pregledaj `index.ts` barrel fajlove.

Traži:

- circular imports
- hidden dependency
- ogromne public surface-e
- accidental client bundle inclusion

Nemoj proglasiti barrel export lošim po definiciji.

---

# 56. PUBLIC MODULE API

Za važne feature/module foldere utvrdi šta je intended public API.

Ako sve može biti importovano sa svih mesta, architecture boundary praktično ne postoji.

---

# 57. INTERNAL IMPLEMENTATION LEAK

Primer:

```text
Feature B
↓
imports Feature A internal hook
```

umesto javnog API-ja feature-a.

Proveri coupling koji nastaje.

---

# 58. CROSS-FEATURE DEPENDENCIES

Mapiraj feature-to-feature imports.

Traži:

- bidirectional dependency
- domino effect promena
- feature koji ne može samostalno da se testira

---

# 59. SHARED FOLDER AUDIT

`shared` često postaje dumping ground.

Klasifikuj sadržaj:

- truly generic
- cross-domain
- domain-specific
- misplaced

Nemoj sve automatski premeštati.

---

# 60. DEAD ABSTRACTIONS

Traži abstraction napravljenu za buduću potrebu koja nikada nije stigla.

Primer:

- interface sa jednom implementacijom
- factory sa jednim case-om
- plugin architecture za dva hardcoded feature-a

Ali ne uklanjaj abstraction ako ima smisla kao stabilna granica.

---

# 61. PREMATURE GENERALIZATION

Simptomi:

- generics koje niko ne koristi
- mnogo config flagova
- generic entity renderer
- meta-driven forms bez stvarne potrebe

Proceni cognitive cost.

---

# 62. LEAKY ABSTRACTIONS

Ako developer mora da zna interne detalje abstraction-a da bi ga koristio, granica nije jaka.

Primer: `API abstraction` postoji, ali caller mora da zna raw backend response kodove.

---

# 63. COUPLING

Identifikuj module sa mnogo incoming/outgoing dependencies.

To su architectural hotspots.

Za svaki objasni:

- zašto je centralan
- šta bi promena mogla da polomi

---

# 64. COHESION

Module treba da grupiše stvari koje prirodno pripadaju zajedno.

Traži file/module koji kombinuje nepovezane domene.

---

# 65. CHANGE AMPLIFICATION

Postavi pitanje:

> Ako promenim jedno poslovno pravilo, koliko fajlova moram da menjam?

Na primer, promena `status label` ne bi trebalo da zahteva deset ručnih izmena ako postoji jedno domain značenje.

---

# 66. SHOTGUN SURGERY

Pronađi promene koje zahtevaju editovanje mnogo nepovezanih fajlova.

Posebno:

- permissions
- route definitions
- status mapping
- API fields
- feature flags
- analytics events

---

# 67. DIVERGENT CHANGE

Suprotan problem:

jedan fajl mora često da se menja zbog mnogo nepovezanih feature-a.

Primer: `utils.ts` menja se za auth, checkout, reports i notifications.

---

# 68. GOD COMPONENTS

Finding zahteva više od line count-a.

Pronađi komponentu koja poseduje veliki broj različitih razloga za promenu.

Dokumentuj ih.

---

# 69. GOD HOOKS

Isto važi za hook.

Primer: `useDashboard()` koji:

- fetchuje pet resursa
- upravlja permissions
- otvara modale
- formatira podatke
- šalje analytics

---

# 70. GOD SERVICES

Pronađi service module koji je centralna zavisnost čitave aplikacije.

Proceni blast radius.

---

# 71. TESTABILITY

Za architectural hotspot pitaj:

> Koliko lako se ovaj deo može testirati izolovano?

Traži:

- hidden global dependency
- direct browser API
- hardcoded service
- implicit state
- module singleton

---

# 72. MOCKING COMPLEXITY

Ako test mora da mockuje 15 stvari da bi testirao jednu funkciju, to može ukazivati na prevelik coupling.

Ne zaključuj bez pregleda samog testa i koda.

---

# 73. TEST ARCHITECTURE

Pregledaj odnos:

- unit tests
- component tests
- integration tests
- E2E

Proveri da architecture omogućava testiranje važnih granica.

---

# 74. DUPLICATED TEST SETUP

Velika količina ponovljenog setup-a može pokazivati da module API nije jednostavan za korišćenje.

Ali ne pretvaraj test helper refactor u glavni architectural finding bez realnog uticaja.

---

# 75. MOCK SERVICE LAYER

Proveri da testovi i development koriste iste contracts kao produkcija.

Traži mock API koji više ne odgovara stvarnom backend-u.

---

# 76. DOCUMENTATION VS ARCHITECTURE

Uporedi:

- README
- architecture docs
- comments
- folder docs

sa stvarnim dependency flow-om.

Ako dokumentacija kaže `components are purely presentational`, a komponente direktno pozivaju API, prijavi drift.

---

# 77. NAMING

Ne prijavljuj subjektivna imena.

Prijavi samo misleading naming koji povećava rizik greške.

Primer: `getUser()` koji zapravo:

- fetchuje user
- upisuje store
- refreshuje token

Naziv skriva side effects.

---

# 78. MODULE SIZE

Line count je samo signal.

Za velike module analiziraj:

- responsibilities
- dependencies
- reasons to change
- testability

---

# 79. FILE GRANULARITY

Ne forsiraj "one component per file".

Proceni da li file organizacija olakšava ili otežava lokalno razumevanje feature-a.

---

# 80. ABSTRACTION DEPTH

Prati critical flow.

Primer:

```text
Page
↓
Container
↓
Feature
↓
Provider
↓
Hook
↓
Service
↓
Repository
↓
Client
```

Ako svaki sloj samo prosleđuje poziv, proceni da li architecture ima nepotrebnu dubinu.

---

# 81. PASS-THROUGH LAYERS

Traži module koji rade samo:

```ts
return otherFunction(args)
```

bez:

- validation
- mapping
- domain semantics
- isolation

Jedan takav wrapper nije problem.

Veliki broj može stvarati accidental complexity.

---

# 82. ARCHITECTURAL CONSISTENCY

Uporedi slične feature-e.

Primer:

```text
Users
Orders
Products
```

Ako svaki koristi potpuno drugačiji:

- fetching
- state
- errors
- forms

proveri da li postoji opravdanje ili samo historical drift.

---

# 83. PATTERN DRIFT

Pronađi:

- stari način
- novi način

koji koegzistiraju.

Na primer, `Axios + Redux` za stare feature-e i `fetch + TanStack Query` za nove.

To nije automatski bug.

Proceni migration debt i cognitive cost.

---

# 84. LEGACY LAYERS

Klasifikuj:

```text
LEGACY BUT USED
LIKELY OBSOLETE
CONFIRMED DEAD
```

Ne briši samo zato što je staro.

---

# 85. MIGRATION BOUNDARY

Ako projekat migrira tehnologiju, proveri da li postoji jasna strategija.

Primer: `old store -> adapter -> new query layer` je često bolji od nasumične mešavine oba sistema.

---

# 86. FEATURE EVOLUTION

Koristi git history ako je dostupna i korisna.

Traži module koji su stalno menjani zbog regresija.

High-churn + high-coupling može biti važan architectural hotspot.

Ne donosi zaključak samo iz broja commit-a.

---

# 87. FRONTEND SECURITY BOUNDARY

Architecture audit mora označiti gde frontend pogrešno preuzima security odgovornost.

Traži:

- role guard samo u UI
- hidden admin element kao "zaštitu"
- trusted client totals
- client-calculated permission

Server mora biti authority.

---

# 88. DATA EXPOSURE

Proveri da UI dobija više podataka nego što mu treba.

Primer: API vrati `full user record`, dok komponenta koristi samo `name` i `avatar`. Proceni privacy/security i coupling rizik.

---

# 89. PERFORMANCE ARCHITECTURE

Bez dubokog performance audita identifikuj arhitektonske uzroke:

- veliki global providers
- client-heavy root
- huge shared bundle
- central context koji rerenderuje sve
- serial data dependency
- large shared package

---

# 90. BUNDLE BOUNDARIES

Ako tooling omogućava, proveri šta završava u glavnom bundle-u.

Traži:

- heavy feature dependency imported globally
- admin-only library u public bundle-u
- editor/chart library u root-u

---

# 91. LAZY LOADING GRANICE

Proveri da li veliki, retko korišćeni feature-i moraju biti deo initial path-a.

Ne predlaži lazy loading svega.

---

# 92. FRAMEWORK-AWARE ARCHITECTURE

Ako framework već daje:

- routing
- data loading
- layouts
- server state
- caching

proveri da projekat nije izgradio paralelni custom framework bez potrebe.

Ali custom sloj može biti opravdan.

Potrebno je dokazati cost.

---

# 93. ARCHITECTURAL FALSE POSITIVES

Pre finding-a proveri:

1. project size
2. team size ako je poznat
3. framework conventions
4. stvarni reuse
5. test coverage
6. historical migration
7. performance requirements
8. domain complexity

Mala aplikacija ne treba enterprise architecture.

---

# 94. SEVERITY

Koristi:

## P1 - HIGH

Arhitektonski problem već proizvodi ozbiljne:

- regressions
- correctness probleme
- security problem
- vrlo visok change risk

## P2 - MEDIUM

Realna architecture slabost sa značajnim maintainability uticajem.

## P3 - LOW

Lokalni design problem ograničenog uticaja.

## P4 - IMPROVEMENT

Opravdano poboljšanje bez postojećeg problema.

P0 koristi samo ako architectural flaw direktno omogućava kritičnu posledicu.

---

# 95. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

jasno dokazano dependency flow-om i kodom.

MEDIUM:

struktura snažno ukazuje na problem, ali dugoročni impact nije potpuno dokaziv.

LOW:

potrebne su informacije o timu, planiranom rastu ili runtime-u.

---

# 96. FINDING FORMAT

Za svaki ozbiljan nalaz:

```text
ID:
Severity:
Category:
Confidence:
Status:

Affected area:
Files/modules:

Architectural problem:

Evidence:

Dependency flow:

Current consequence:

Future change risk:

Root cause:

Recommended direction:

Migration risk:

Complexity:
XS / S / M / L / XL
```

---

# 97. NE REFAKTORIŠI AUTOMATSKI

Tokom audita:

- ne pomeraj fajlove
- ne menjaj imports
- ne kreiraj nove abstraction-e
- ne menjaj state management
- ne menjaj folder structure

Prvo dokumentuj architecture.

---

# 98. OUTPUT - FRONTEND_ARCHITECTURE_AUDIT.md

Struktura:

## 1. Executive Summary

- stack
- architecture style
- najveće prednosti
- najveći architectural rizici
- overall maintainability

## 2. Architecture Map

## 3. Dependency Map

## 4. Feature Boundaries

## 5. State Architecture

## 6. Data Flow

## 7. Component Architecture

## 8. Hooks Architecture

## 9. API/Data Layer

## 10. Routing Architecture

## 11. Form Architecture

## 12. Error Architecture

## 13. Shared Code

## 14. Design System Boundaries

## 15. Cross-Feature Dependencies

## 16. Legacy / Migration Layers

## 17. Testing Architecture

## 18. Architectural Hotspots

Tabela:

| Module | Responsibilities | Incoming dependencies | Outgoing dependencies | Risk |
|---|---|---|---|---|

## 19. Findings Summary

| ID | Severity | Area | Problem | Confidence | Complexity |
|---|---|---|---|---|---|

## 20. Detailed Findings

## 21. Things Done Well

## 22. Technical Debt

## 23. Unknown / Not Verified

## 24. Recommended Architecture Direction

Ne predlaži rewrite.

Objasni evolutivni smer.

## 25. Refactoring Roadmap

### Phase 1 - High-risk boundaries

### Phase 2 - State/data consistency

### Phase 3 - Feature ownership

### Phase 4 - Shared architecture cleanup

### Phase 5 - Optional improvements

---

# 99. CHANGE SCENARIO TEST

Nakon prvog audita, testiraj architecture mentalnim promenama.

Za svaku od sledećih promena pitaj:

### Scenario A

> Dodaj novo polje postojećem važnom entity-ju.

Koliko slojeva i fajlova mora da se menja?

### Scenario B

> Promeni jedno permission pravilo.

Koliko mesta mora da se menja?

### Scenario C

> Zameni jedan API endpoint.

Da li UI zna previše o backend contract-u?

### Scenario D

> Dodaj novi ekran postojećem feature-u.

Da li se feature lako proširuje?

### Scenario E

> Promeni state management biblioteku za jedan feature.

Da li cela aplikacija zavisi od nje?

### Scenario F

> Promeni UI biblioteku.

Da li business logic zavisi od UI primitives?

### Scenario G

> Dodaj drugi tip korisnika sa drugačijim dozvolama.

Da li su permissions centralizovane ili razbacane?

Ovi scenariji nisu razlog za izmišljanje findings-a.

Koristi ih da otkriješ realan change amplification.

---

# 100. SECOND PASS - ARCHITECTURAL PRESSURE TEST

Uradi još jedan prolaz iz četiri perspektive.

## New developer pass

Pitaj:

> Ako novi developer treba da izmeni jedan feature, koliko sistema mora da razume?

## Change pass

Pitaj:

> Koja mala promena ima najveći blast radius?

## Failure pass

Pitaj:

> Ako jedan shared module promeni ponašanje, koliko feature-a može neprimetno da se pokvari?

## Growth pass

Pitaj:

> Koji deo architecture trenutno radi dobro na ovoj veličini, ali ima jasan dokaziv limit ako feature count značajno poraste?

Ne koristi apstraktno "neće skalirati".

Objasni tačno šta raste:

- dependency count
- number of branches
- shared state
- rerender surface
- change amplification
- testing complexity

---

# FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nisi nametao svoj omiljeni folder pattern
- nisi predložio microfrontend bez jasne potrebe
- nisi predložio Redux/Zustand samo zato što postoji mnogo state-a
- nisi prijavio velike fajlove samo zbog broja linija
- nisi prijavio dupliciranje bez provere behavioural drift-a
- svaki P1/P2 nalaz ima jasan dokaz i dependency flow
- arhitektonski rizici su odvojeni od sitnih stilskih preferencija
- svaki predloženi refactoring je evolutivan, a ne kompletan rewrite

---

# KONAČNO PRAVILO

Nemoj mi vratiti izveštaj koji preporučuje kompletan rewrite ili čisto subjektivne design pattern-e.

Fokusiraj se na stvarno arhitektonsko zdravlje:
- jasne granice
- nedvosmisleno vlasništvo nad state-om
- predvidljiv smer zavisnosti
- ograničen blast radius promena
- visoka testabilnost

Svaki nalaz mora pokazati stvarne posledice po maintainability, reliability ili scalability.
