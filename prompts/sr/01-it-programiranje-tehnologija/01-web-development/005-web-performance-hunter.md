---
id: UPL-IT-005
number: 5
slug: web-performance-hunter
title: Lov na probleme web performansi
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# LOV NA PROBLEME WEB PERFORMANSI

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu web performansi kompletnog projekta.

Glavni cilj:

> Pronaći konkretna uska grla koja realno usporavaju učitavanje, rendering, interakciju, mrežu ili backend response i objasniti njihov stvarni uticaj bez generičkih preporuka.

Ovo nije:

- generički Lighthouse checklist
- lista "optimizuj bundle" saveta
- automatski refactor
- nagađanje koliko korisnika sistem podržava
- preporuka da se sve memoizuje
- lov na svaku mikro-optimizaciju

Fokus je na realnim bottleneck-ima.

Prioritet:

**measurable impact > reproducible bottleneck > architectural risk > mikro-optimizacija**

Ako nema runtime merenja, jasno odvoji:

**CODE-LEVEL RISK**

od:

**MEASURED PERFORMANCE PROBLEM**

---

# 1. UTVRDI STACK I RUNTIME

Pre analize utvrdi:

- framework
- React/Vue/Angular/Svelte verziju
- SSR/CSR/SSG model
- bundler
- deployment platformu
- backend arhitekturu
- database
- CDN
- image pipeline
- font loading
- caching
- analytics
- third-party scripts
- monitoring/performance tooling

Pregledaj:

- `package.json`
- build konfiguraciju
- route strukturu
- entry points
- shared layouts
- global providers
- asset loading
- API client
- database queries
- server handlers
- deployment config

---

# 2. NAPRAVI PERFORMANCE MAPU

Za najvažnije stranice napravi tok:

```text
DNS
↓
connection
↓
HTML / initial response
↓
critical CSS
↓
JavaScript
↓
fonts
↓
images
↓
hydration
↓
data fetching
↓
interactive UI
```

Ako postoji SSR:

```text
request
↓
server render
↓
DB/API calls
↓
HTML/RSC
↓
browser
↓
hydration
```

Ako postoji CSR:

```text
HTML shell
↓
JS bundle
↓
app bootstrap
↓
API calls
↓
render
```

Za svaki kritični flow odredi gde vreme realno može biti izgubljeno.

---

# 3. NE OPTIMIZUJ SLEPO

Pre finding-a proveri:

- koliko često se kod izvršava
- koliko podataka obrađuje
- da li je na critical path-u
- da li blokira korisnika
- da li se izvršava samo jednom
- da li je problem visible ili theoretical

Ne prijavljuj:

```text
O(n)
```

kao problem ako je `n` u realnosti 10.

---

# 4. INITIAL LOAD

Analiziraj šta mora da se učita pre prvog korisnog prikaza.

Pronađi:

- oversized JS
- blocking CSS
- font blokiranje
- velike hero slike
- third-party scripts
- route data dependency
- server latency

Pitaj:

> Šta korisnik zaista mora da dobije odmah?

Sve ostalo je kandidat za odlaganje samo ako to ne kvari UX.

---

# 5. JAVASCRIPT BUNDLE

Ako tooling omogućava, analiziraj bundle.

Traži:

- velike dependencies
- duplirane biblioteke
- whole-library import
- locale pakete
- icon libraries
- editors
- charts
- maps
- PDF libraries
- analytics SDK
- admin-only kod u public bundle-u

Ne preporučuj dependency replacement samo zbog veličine.

Navedi konkretan trošak i alternativu.

---

# 6. TREE SHAKING

Proveri imports.

Primer:

```ts
import _ from "lodash"
```

naspram selektivnog importovanja.

Ali proveri stvarni bundler behavior pre nalaza.

Ne pretpostavljaj da se ceo paket uključuje bez dokaza.

---

# 7. CODE SPLITTING

Analiziraj granice bundle-a.

Traži:

- feature koji se koristi na jednoj ruti ali je u globalnom bundle-u
- admin code za sve korisnike
- editor/chart/video biblioteku na initial load-u
- modal feature koji se retko koristi

Ne lazy-loaduj male critical komponente samo zato što možeš.

---

# 8. DYNAMIC IMPORT

Proveri postojeće dynamic imports.

Traži:

- prekasno učitavanje
- loading flash
- waterfall
- chunk koji je potreban gotovo odmah

Lazy loading može i pogoršati performance ako uvodi novi round trip na critical path.

---

# 9. HYDRATION COST

Ako postoji SSR, proceni koliko UI-ja mora biti hydrated.

Traži:

- ogromne Client Component subtree-ove
- globalne providers
- interaktivnost previsoko u stablu
- server-rendered markup koji odmah zahteva mnogo JS-a

Prijavi samo gde postoji realan razlog da granica bude manja.

---

# 10. CLIENT COMPONENT OVERUSE

Ako framework podržava server rendering/Server Components, proveri da li previše koda završava u browseru.

Traži:

```text
"use client"
```

na visokim nivoima.

Proceni:

- bundle impact
- hydration impact
- serialization impact
- duplicated fetching

---

# 11. RENDER PERFORMANCE

Pronađi komponente koje se često renderuju i rade značajan posao.

Traži:

- velike `.map`
- nested loops
- sorting
- filtering
- parsing
- formatting
- expensive calculations

Ne prijavljuj svaki rerender.

Finding zahteva:

- skupu komponentu
- mnogo elemenata
- visoku frekvenciju
- vidljiv jank
- ili drugi konkretan impact

---

# 12. UNNECESSARY RERENDERS

Utvrdi uzrok:

- Context
- parent state
- unstable object
- unstable callback
- store selector
- prop identity

Ali ne predlaži `React.memo` automatski.

Proveri da li memoization ima smisla.

---

# 13. CONTEXT PERFORMANCE

Ako veliki deo aplikacije zavisi od jednog Context-a, proveri:

```text
context value changes
↓
large subtree rerenders
```

Posebno ako Context sadrži mnogo nepovezanih vrednosti.

---

# 14. GLOBAL STORE SELECTORS

Ako postoji Zustand/Redux ili slično:

- proveri selektore
- proveri object return
- proveri equality
- proveri broad subscriptions

Traži komponentu koja prati ceo store iako koristi mali deo.

---

# 15. LIST PERFORMANCE

Za velike liste proveri:

- render count
- stable keys
- pagination
- virtualization
- DOM size

Ne preporučuj virtualization za listu od 20 elemenata.

---

# 16. VIRTUALIZATION

Ako se koristi, proveri:

- item height
- measurement
- overscan
- scrolling
- dynamic size
- accessibility

Virtualization nije besplatna optimizacija.

---

# 17. SORTING I FILTERING

Pronađi client-side sorting/filtering nad velikim dataset-om.

Pitaj:

- koliko zapisa realno postoji
- koliko često operacija radi
- može li server to rešiti
- da li se ista operacija ponavlja pri svakom renderu

---

# 18. SEARCH PERFORMANCE

Za search proveri:

- debounce
- request frequency
- cancellation
- server query
- index
- response size
- local filtering

Traži request na svaki keystroke ako to pravi realan load.

---

# 19. EVENT HANDLERS

Proveri high-frequency event-e:

- scroll
- resize
- mousemove
- pointermove
- input
- drag

Traži heavy work bez:

- throttling
- debouncing
- requestAnimationFrame

ali samo gde je posao stvarno skup.

---

# 20. MAIN THREAD BLOCKING

Traži sinhrone operacije koje mogu trajati dugo:

- JSON parsing velikih payload-a
- PDF processing
- image processing
- encryption
- compression
- large loops
- data transformation

Proceni da li treba:

- server
- worker
- chunking
- async processing

---

# 21. WEB WORKERS

Ako postoji CPU-heavy browser rad, proceni da li Web Worker ima smisla.

Ne uvodi Worker za trivijalne operacije.

---

# 22. NETWORK WATERFALLS

Mapiraj:

```text
request A
↓
A response
↓
request B
↓
B response
↓
request C
```

Pitaj:

> Da li B zaista zavisi od A?

Ako ne, kandidat je za paralelizaciju.

---

# 23. SERVER WATERFALLS

Isto uradi na serveru.

Traži:

```ts
const a = await getA()
const b = await getB()
const c = await getC()
```

ako su nezavisni.

Ne koristi `Promise.all` gde postoji dependency.

---

# 24. DUPLICATE FETCHING

Traži isti resource učitan:

- u layout-u
- u page-u
- u child component-u
- ponovo client-side

Proveri framework deduplication pre finding-a.

---

# 25. API RESPONSE SIZE

Za kritične endpoint-e proveri:

- broj polja
- nested objekti
- arrays
- repeated metadata

Pitaj:

> Koliki deo response-a UI stvarno koristi?

---

# 26. OVERFETCHING

Traži:

```text
SELECT *
```

ili API koji vraća ceo resource kada UI koristi 3 polja.

Proceni:

- network
- serialization
- database
- privacy impact

---

# 27. UNDERFETCHING

Suprotan problem:

```text
list
↓
N individual detail requests
```

Pronađi situacije gde premali endpoint proizvodi N+1 na mrežnom sloju.

---

# 28. API CHATTER

Mapiraj broj request-ova za jedan ekran.

Ako učitavanje dashboard-a zahteva mnogo malih request-ova, proveri:

- paralelizaciju
- aggregation
- server composition
- caching

Nemoj automatski praviti mega endpoint.

---

# 29. N+1 DATABASE QUERY

Za listu od N entiteta proveri da li kod radi:

```text
1 query for list
+
N queries for details
```

Posebno:

- relations
- counts
- permissions
- metadata

---

# 30. DATABASE INDEXES

Za performance-critical queries proveri:

- WHERE
- JOIN
- ORDER BY
- GROUP BY

Nemoj nagađati missing index bez schema/query evidence.

---

# 31. UNBOUNDED QUERIES

Traži:

- `findMany()` bez limita
- kompletne collections
- full-table exports
- ogromne admin liste

Ako dataset može rasti, objasni limit.

---

# 32. PAGINATION

Proveri:

- offset
- cursor
- limit
- ordering

Veliki offset može postati skup.

Ali navedi stvarni growth scenario.

---

# 33. DATABASE CONNECTIONS

Ako je serverless:

- pooling
- connection reuse
- connection limits
- ORM behavior

Traži mogućnost connection exhaustion-a.

---

# 34. EXTERNAL API LATENCY

Mapiraj third-party pozive na critical path-u.

Primer:

```text
page request
↓
server
↓
external provider
↓
page cannot render until provider responds
```

Razmotri:

- caching
- timeout
- fallback
- async refresh

---

# 35. TIMEOUT

Svaki remote call treba analizirati za neograničeno čekanje.

Proveri:

- fetch timeout
- SDK timeout
- DB timeout
- retry timeout

---

# 36. RETRIES

Retries mogu poboljšati reliability ali pogoršati latency.

Traži:

```text
request
↓
timeout
↓
retry
↓
timeout
↓
retry
```

na user-facing request-u.

Izračunaj potencijalni worst-case wait ako je moguće.

---

# 37. RETRY STORM

Kod velikog broja request-ova isti retry policy može pojačati outage.

Proveri:

- exponential backoff
- jitter
- max attempts

Ali ne prijavljuj ako scale ne opravdava rizik.

---

# 38. CACHE STRATEGY

Mapiraj cache slojeve:

- browser
- CDN
- framework
- server
- query cache
- Redis
- DB

Za critical resources utvrdi:

- TTL
- invalidation
- ownership

---

# 39. MISSING CACHE

Traži expensive read koji se često ponavlja i retko menja.

Primer:

- configuration
- public catalog
- expensive aggregation

Ali ne cache-iraj user-specific ili rapidly changing podatke bez pažnje.

---

# 40. OVER-CACHING

Cache može napraviti performance problem kroz:

- huge memory usage
- invalidation storms
- stale data
- serialization cost

Ne pretpostavljaj da više cache-a znači bolje performanse.

---

# 41. CACHE STAMPEDE

Ako popularan cache key istekne i mnogo request-ova istovremeno radi isti expensive computation, proveri postoji li rizik stampede-a.

Relevantno samo za dovoljno prometne i skupe operacije.

---

# 42. STATIC GENERATION

Ako framework podržava SSG, proveri da li javne stranice koje se retko menjaju nepotrebno rade request-time rendering.

Ali uzmi u obzir:

- personalization
- freshness
- deployment size
- build time

---

# 43. DYNAMIC RENDERING

Traži accidental dynamic rendering zbog:

- cookies
- headers
- request-specific API
- config

Ako jedna mala zavisnost čini celu route dinamičkom, proveri impact.

---

# 44. SERVER RESPONSE TIME

Razloži TTFB:

```text
routing
↓
auth
↓
DB
↓
external API
↓
render
↓
serialization
```

Ne pripisuj sav TTFB frameworku.

---

# 45. SERIALIZATION

Veliki server-to-client objekti mogu biti skupi.

Traži:

- huge JSON
- duplicate data
- nested relations
- base64
- prevelik RSC payload

---

# 46. COMPRESSION

Proveri da li deployment/CDN već automatski radi compression.

Ne preporučuj ručni gzip ako ga platforma već rešava.

---

# 47. IMAGES

Za svaku veliku/critical sliku proveri:

- format
- dimensions
- responsive variants
- compression
- loading strategy
- CDN/image optimization

---

# 48. LCP IMAGE

Posebno identifikuj verovatni LCP element.

Ako je image:

- da li je preloadovana kada treba
- da li je prevelika
- da li se otkriva prekasno
- da li ima odgovarajući `sizes`

Ne tvrdi da je stvarni LCP bez merenja.

---

# 49. LAZY LOADING SLIKA

Nemoj lazy-loadovati above-the-fold critical image.

I obrnuto, ne učitavaj sve slike odmah.

Analiziraj poziciju.

---

# 50. IMAGE DIMENSIONS

Nedostatak poznatih dimensions može izazvati layout shift.

Proveri framework behavior.

---

# 51. FONTS

Analiziraj:

- broj font family-ja
- weights
- subsets
- format
- preload
- self-hosting
- render strategy

---

# 52. FONT OVERLOAD

Ako se učitava:

```text
100
200
300
400
500
600
700
800
900
```

a koriste se tri težine, prijavi nepotreban transfer ako je potvrđeno.

---

# 53. ICONS

Proveri:

- full icon library import
- SVG sprite
- inline SVG
- icon font

Ne optimizuj ikone ako impact nije značajan.

---

# 54. CSS

Traži:

- ogroman global CSS
- duplicate styles
- unused CSS
- runtime CSS generation
- expensive CSS selectors samo ako imaju realan impact

---

# 55. CRITICAL CSS

Ako framework automatski optimizuje CSS, proveri pre preporuke custom critical CSS sistema.

---

# 56. THIRD-PARTY SCRIPTS

Mapiraj sve third-party scriptove.

Za svaki:

- size
- blocking
- execution cost
- necessity
- loading timing
- failure impact

Primeri:

- analytics
- ads
- chat
- maps
- tracking
- social embeds

---

# 57. ANALYTICS

Proveri da analytics initialization ne blokira critical UI.

Traži duplicate event listeners i duplicate SDK init.

---

# 58. ADS

Ako postoje oglasi, odvoji:

- business requirement
- performance cost

Analiziraj layout shift i script load.

---

# 59. EMBEDS

YouTube, maps, social embeds mogu biti veoma teški.

Proveri lazy facade pattern gde je relevantno.

---

# 60. CORE WEB VITALS

Analiziraj code-level rizike za:

- LCP
- CLS
- INP

Ne izmišljaj brojeve.

Ako nema merenja:

```text
Status: NOT MEASURED
```

---

# 61. LCP

Traži potencijalne uzroke:

- slow TTFB
- render-blocking
- large hero
- client-only render
- late data
- late CSS

---

# 62. CLS

Traži:

- images bez dimensions
- ads bez reserved space
- dynamic content insertion
- late fonts
- banners
- client hydration differences

---

# 63. INP

Traži:

- heavy click handler
- large render
- synchronous calculation
- long task
- huge DOM update

---

# 64. LONG TASKS

Ako runtime profiling nije moguć, identifikuj samo code-level kandidate.

Ne nazivaj ih measured long task-ovima.

---

# 65. DOM SIZE

Veliki DOM može pogoršati:

- style calculation
- layout
- memory

Relevantno kod:

- huge tables
- trees
- menus
- hidden duplicated UIs

---

# 66. HIDDEN UI

Traži desktop i mobile verziju istog velikog component tree-a koje se obe renderuju, a samo CSS skriva jednu.

To može duplirati:

- DOM
- effects
- fetching
- event listeners

---

# 67. MODALS I PORTALS

Veliki modal sadržaj koji se renderuje i kada je zatvoren može biti nepotreban trošak.

Proveri biblioteku pre zaključka.

---

# 68. ANIMATIONS

Traži animacije koje koriste:

- `top`
- `left`
- `width`
- `height`

u high-frequency animaciji kada transform/opacity može biti efikasniji.

Ali ne prijavljuj male statične transition-e.

---

# 69. SCROLL PERFORMANCE

Proveri:

- scroll listeners
- parallax
- sticky logic
- infinite scroll
- layout reads/writes

Traži forced layout samo ako execution flow to pokazuje.

---

# 70. LAYOUT THRASHING

Obrazac:

```text
read layout
write DOM
read layout
write DOM
```

u petlji može biti skup.

Prijavi samo konkretan kod.

---

# 71. INFINITE SCROLL

Proveri:

- DOM growth
- pagination
- memory
- request overlap
- observer cleanup

---

# 72. PREFETCH

Analiziraj route/data prefetch.

Premalo:

- kasna navigacija

Previše:

- nepotreban bandwidth
- API load

Proceni prema stvarnom navigacionom modelu.

---

# 73. PRELOAD

Preload koristi samo za resurse koji su skoro sigurno critical.

Previše preload-a može međusobno konkurisati.

---

# 74. PRIORITY HINTS

Ako postoje:

- `fetchpriority`
- preload
- priority props

proveri da li su dodeljeni pravim resursima.

---

# 75. SERVICE WORKER

Ako postoji:

- precache size
- runtime cache
- stale assets
- duplicate network
- offline strategy

Service worker može ubrzati repeat load, ali i komplikovati update.

---

# 76. MEMORY

Traži browser memory probleme koji utiču na dugotrajnu sesiju.

- leaked listeners
- timers
- sockets
- DOM references
- object URLs
- huge cached data

---

# 77. CLIENT CACHE SIZE

Query/store cache može beskonačno rasti.

Proveri:

- key cardinality
- gc
- user switching
- pagination pages

---

# 78. LARGE FILE PROCESSING

Ako browser obrađuje:

- CSV
- PDF
- image
- video

proveri memory duplication i main-thread blocking.

---

# 79. MOBILE PERFORMANCE

Posebno razmišljaj o slabijem:

- CPU
- GPU
- memory
- network

Desktop performance nije dovoljan dokaz mobilnog iskustva.

---

# 80. SLOW NETWORK

Mentalno testiraj:

- high latency
- low bandwidth
- packet loss

Pitaj šta blokira UI.

---

# 81. COLD START

Ako deployment ima serverless funkcije, identifikuj heavy initialization:

- ORM
- SDK
- large imports
- config loading

Ne tvrdi cold-start broj bez merenja.

---

# 82. SERVER MEMORY

Traži:

- huge in-memory caches
- full dataset loading
- large buffers
- unbounded maps

Posebno kod long-lived server procesa.

---

# 83. SERVER CPU

Pronađi:

- encryption
- image manipulation
- PDF generation
- compression
- heavy loops

na request path-u.

---

# 84. BACKGROUND WORK

Ako user-facing request čeka posao koji ne mora završiti pre response-a, proceni mogućnost queue/background processing-a.

Ali uzmi u obzir reliability serverless okruženja.

---

# 85. DATABASE VS APPLICATION WORK

Ne prebacuj slepo sve u DB ili sve u JS.

Proceni gde je operacija efikasnija.

Na primer:

- filtering
- aggregation
- sorting

nad velikim dataset-om često pripada DB-u.

---

# 86. ALGORITHM COMPLEXITY

Identifikuj ozbiljne:

- O(n²)
- repeated scans
- nested searches

Posebno kada `n` može biti veliki.

---

# 87. DATA STRUCTURES

Primer:

```ts
array.find(...)
```

u petlji može postati O(n²).

Ako dataset raste, razmotri Map/Set.

Ne prijavljuj za trivijalne liste.

---

# 88. DUPLICATE COMPUTATION

Traži isti expensive calculation više puta u istom request/render flow-u.

---

# 89. FORM PERFORMANCE

Velike forme:

- rerender svakog polja
- global watch
- validation na svaki keypress
- huge schema

Analiziraj samo ako forma stvarno ima dovoljno polja/kompleksnosti.

---

# 90. TABLE PERFORMANCE

Za velike data tables proveri:

- server pagination
- filtering
- sorting
- virtualization
- memoization
- cell rendering

---

# 91. DASHBOARD PERFORMANCE

Dashboard često ima mnogo paralelnih widget-a.

Mapiraj:

```text
widget A
widget B
widget C
widget D
```

Utvrdi:

- šta je critical
- šta može streamovati
- šta može lazy load
- šta može cache

---

# 92. AUTH PERFORMANCE

Proveri da li svaki request radi nepotrebno skupu auth operaciju:

- DB lookup
- remote provider
- permission graph

Security ne sme biti uklonjen zbog performance-a, ali implementacija može biti optimizovana.

---

# 93. PERMISSION CHECK N+1

Ako lista ima 100 resursa i svaki radi poseban permission query, to može biti ozbiljan bottleneck.

---

# 94. LOGGING OVERHEAD

Traži:

- ogromne JSON logove
- synchronous logging
- logging u tight loops
- sensitive payload serialization

Ne uklanjaj korisne production logove bez razloga.

---

# 95. DEVELOPMENT VS PRODUCTION

Razlikuj:

- dev tooling overhead
- Strict Mode
- source maps
- HMR

od stvarnog production performance-a.

---

# 96. BUILD PERFORMANCE

Odvoji runtime performance od build performance-a.

Ako build traje dugo, analiziraj:

- static generation volume
- asset processing
- typechecking
- huge dependency graph

Ali nemoj mešati to sa user-facing latency.

---

# 97. PERFORMANCE TESTOVI

Pregledaj da li postoje:

- Lighthouse CI
- Web Vitals
- load tests
- benchmarks
- bundle budgets

Ne pretpostavljaj da postoje ako ih ne vidiš.

---

# 98. PERFORMANCE BUDGETS

Ako projekat nema performance budgets, predloži ih samo ako veličina/projekat opravdava.

Mogući budgets:

- route JS
- image size
- API latency
- LCP
- INP
- bundle growth

Brojeve ne izmišljaj bez baseline-a.

---

# 99. FINDING EVIDENCE

Svaki ozbiljan finding treba da sadrži:

```text
ID:
Severity:
Category:
Confidence:
Status:

User flow:
Location:
File:
Function/Component:

Bottleneck:

Evidence:

Execution flow:

Why it is expensive:

Frequency:

Data size / scale assumption:

User-visible impact:

Recommended remediation:

How to measure improvement:

Complexity:
XS / S / M / L / XL
```

---

# 100. SEVERITY

Koristi:

## P1 - HIGH

- ozbiljno blokiranje glavnog user flow-a
- veoma spor critical path
- veliki scalability bottleneck koji već ima realan impact

## P2 - MEDIUM

- primetan problem na važnom flow-u
- realan bottleneck sa ograničenijim scope-om

## P3 - LOW

- manja inefficiency sa dokazivim uticajem

## P4 - IMPROVEMENT

- optimizacija bez trenutnog user-visible problema

P0 koristi samo ako performance problem izaziva praktično potpuni failure sistema.

---

# 101. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

runtime merenje ili očigledan i direktno dokaziv bottleneck.

MEDIUM:

jak code-level dokaz bez production merenja.

LOW:

zavisi od realnog traffic-a, dataset-a ili infrastrukture.

---

# 102. MERENJE

Za svaki P1/P2 finding definiši šta treba meriti pre i posle fix-a.

Primer:

```text
Metric:
Current:
Target:
Measurement method:
Environment:
```

Ako `Current` nije poznat:

```text
Current: NOT MEASURED
```

Ne izmišljaj baseline.

---

# 103. ALATI

Ako su dostupni, koristi odgovarajuće:

- browser performance profiler
- React Profiler
- bundle analyzer
- Lighthouse
- Web Vitals
- database query logs
- EXPLAIN
- load testing
- application tracing

Ako nisu dostupni, jasno napiši šta nije runtime potvrđeno.

---

# 104. NE OPTIMIZUJ KOD TOKOM AUDITA

Tokom ovog audita:

- ne menjaj source
- ne menjaj bundle config
- ne menjaj cache
- ne menjaj DB indexe
- ne dodaj dependencies

Prvo završi audit.

---

# 105. OUTPUT - WEB_PERFORMANCE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- architecture
- critical performance path
- najveći bottleneck-i
- measured vs inferred stanje

## 2. Performance Architecture

## 3. Critical Page Load Flows

## 4. Bundle Audit

## 5. Rendering Audit

## 6. Hydration Audit

## 7. Network Audit

## 8. API Audit

## 9. Database Performance Audit

## 10. Cache Audit

## 11. Image Audit

## 12. Font Audit

## 13. Third-Party Script Audit

## 14. Core Web Vitals Risk Audit

## 15. Mobile Performance

## 16. Server Performance

## 17. Serverless / Cold Start

## 18. Memory Audit

## 19. Findings Summary

| ID | Severity | Layer | Bottleneck | Evidence | Confidence |
|---|---|---|---|---|---|

## 20. Detailed Findings

## 21. Quick Wins

Samo stvarni low-effort/high-impact kandidati.

## 22. Architectural Bottlenecks

## 23. Things Already Done Well

## 24. Unknown / Not Measured

## 25. Measurement Plan

---

# 106. BOTTLENECK CHAIN ANALYSIS

Za najsporiji ili najrizičniji flow napravi lanac:

```text
User request
↓
network
↓
server
↓
database
↓
external API
↓
serialization
↓
browser
↓
render
↓
interactive
```

Za svaki korak označi:

```text
MEASURED
LIKELY BOTTLENECK
LOW RISK
NOT VERIFIED
```

Ovo sprečava optimizovanje pogrešnog sloja.

---

# 107. 10X SCALE PASS

Mentalno testiraj šta se događa kada poraste:

- broj records 10x
- broj concurrent users 10x
- broj dashboard widgets 10x
- broj list items 10x
- broj API calls 10x

Nemoj tvrditi da će nešto sigurno pasti.

Identifikuj mesto gde complexity ili resource usage raste problematično.

---

# 108. SLOW DEVICE PASS

Pretpostavi:

- slabiji mobilni CPU
- sporiji storage
- ograničenu memoriju

Pitaj:

> Koje client-side operacije postaju problem?

---

# 109. SLOW NETWORK PASS

Pretpostavi:

- visoku latenciju
- nizak bandwidth

Pitaj:

> Koji waterfall ili veliki asset postaje dominantan?

---

# 110. COLD CACHE PASS

Analiziraj potpuno novog korisnika bez:

- browser cache
- CDN warm cache
- app cache
- query cache

Šta je stvarni first-load cost?

---

# 111. WARM CACHE PASS

Zatim analiziraj ponovni dolazak.

Pitaj:

> Šta se bespotrebno učitava ponovo?

---

# 112. FAILURE PERFORMANCE PASS

Performance problem može nastati i kada sistem otkazuje.

Primer:

```text
provider timeout
↓
3 retries
↓
fallback
```

Ako failure path traje 45 sekundi, to je relevantan performance finding.

---

# 113. ROI RANKING

Za remediation napravi tabelu:

| Finding | Expected impact | Effort | Confidence | Measurement |
|---|---|---|---|---|

Ne izmišljaj precizne procente poboljšanja bez benchmarka.

Koristi relativne:

- HIGH
- MEDIUM
- LOW

---

# 114. FINAL SECOND PASS

Kada završiš audit, uradi novi prolaz sa jednim pitanjem:

> Šta korisnik čeka, a ne bi morao da čeka?

Ponovo proveri:

- initial load
- route change
- form submit
- search
- dashboard
- file operation
- authentication
- third-party API

Zatim pitaj:

> Šta browser radi, a server bi mogao efikasnije?

I:

> Šta server radi, a ne mora da bude na critical request path-u?

I:

> Koji podatak se prenosi ili računa više puta bez potrebe?

---

# FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nisi prijavio rerender bez dokaza da je skup
- nisi preporučio memoization naslepo
- nisi prijavio large bundle bez utvrđivanja šta ga čini velikim
- nisi prijavio N+1 bez reconstruction-a query flow-a
- nisi predložio cache bez analize invalidacije
- nisi preporučio lazy loading critical sadržaja
- nisi pomešao development performance sa production performance
- nisi izmišljao Core Web Vitals rezultate
- nisi izmišljao load capacity
- svaki P1/P2 ima konkretan bottleneck
- svaka optimizacija ima način verifikacije
- network, server, database i browser su analizirani kao jedan sistem

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Koristite lazy loading, memoization, caching i optimizujte slike.

To nije performance audit.

Želim odgovor na pitanje:

> Gde korisnik realno gubi vreme i zašto?

Za svaki ozbiljan problem moraš objasniti:

```text
operation
↓
expensive step
↓
why expensive
↓
how often
↓
what user waits for
↓
how to prove it
↓
how to improve it
```

Performance je end-to-end svojstvo sistema.

Nemoj optimizovati liniju koda dok ne razumeš critical path.

Ako nešto nije mereno:

**NOT MEASURED.**

Ako postoji samo potencijalni rizik:

**CODE-LEVEL RISK.**

Ako nema dovoljno dokaza:

**NOT VERIFIED.**

Cilj je dobiti precizan performance audit koji se može direktno pretvoriti u merljive optimizacije, benchmarke i regression performance testove.
