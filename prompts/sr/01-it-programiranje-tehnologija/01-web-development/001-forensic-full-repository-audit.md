---
id: UPL-IT-001
number: 1
slug: forensic-full-repository-audit
title: Forenzički audit celog repozitorijuma
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# FORENZIČKI AUDIT CELOG REPOZITORIJUMA

Želim da izvršiš **maksimalno duboku, sistematsku i evidence-first analizu kompletnog GitHub repozitorijuma i aplikacije**.

Ovo nije običan code review.

Tretiraj zadatak kao kombinaciju:

* senior software architecture review-a
* security audita
* production-readiness audita
* bug hunting-a
* performance audita
* reliability audita
* UX/accessibility pregleda
* test coverage analize
* DevOps/CI/CD pregleda
* technical debt analize
* cross-file i cross-system forenzike

Glavni cilj je:

> Pronaći, potvrditi, klasifikovati i dokumentovati sve realne probleme, rizike, bugove, nedoslednosti, tehnički dug i opravdana mesta za poboljšanje u čitavom projektu.

Prioritet:

**tačnost > dubina > broj nalaza.**

Nemoj izmišljati probleme samo da bi audit izgledao detaljnije.

---

# 0. PRAVILA RADA SA GITHUB REPOZITORIJUMOM

Kada dobiješ GitHub URL, ne analiziraj samo README ili nekoliko fajlova koje GitHub slučajno prikaže.

Prvo sistematski mapiraj repozitorijum.

Utvrdi:

* repository
* default branch
* strukturu direktorijuma
* relevantne druge branch-eve ako postoje
* monorepo strukturu ako postoji
* package/workspace strukturu
* entry pointe
* aplikacije
* shared packages
* frontend
* backend
* API
* database
* tests
* scripts
* CI/CD
* infrastructure
* konfiguracije
* dokumentaciju

Koristi GitHub sadržaj kao primarni izvor istine.

Ako su dostupni, pregledaj i:

* relevantne GitHub Actions
* otvorene issues
* relevantne PR-ove
* release/tag informacije
* Dependabot/Renovate konfiguraciju

ali **kod u trenutnom default branch-u ima prednost nad opisima iz issues/README-a**.

Ako dokumentacija tvrdi jedno, a kod radi drugo - prijavi neslaganje.

---

# 1. NEMOJ POČETI NALAZIMA

Pre nalaza napravi internu mapu sistema.

Prvo razumi:

* šta aplikacija radi
* kome je namenjena
* glavne use-case-ove
* tehnologije
* framework
* runtime
* deployment target
* data model
* authentication
* authorization
* frontend/backend granicu
* glavne business flow-ove
* external integrations

Ne donosi ozbiljne zaključke dok ne razumeš arhitekturu.

---

# 2. MAPIRAJ CEO REPOSITORY

Pregledaj, gde postoje:

* source
* app
* pages
* src
* components
* features
* modules
* services
* lib
* utils
* hooks
* stores
* contexts
* server
* backend
* API routes
* route handlers
* server actions
* middleware
* database
* migrations
* schema
* ORM
* seeds
* workers
* queues
* cron
* webhooks
* storage
* uploads
* downloads
* authentication
* authorization
* payments
* email
* notifications
* third-party integrations
* tests
* unit tests
* integration tests
* E2E
* fixtures
* mocks
* scripts
* Docker
* Vercel
* Railway
* Cloudflare
* GitHub Actions
* configuration
* environment handling
* package manifests
* lockfiles
* public assets
* PWA
* manifest
* service workers
* translations
* analytics
* monitoring
* documentation

Ne pretpostavljaj da direktorijum nije bitan samo zato što nije `src`.

---

# 3. REPOSITORY INVENTORY

Na početku audita napravi inventar.

Ako podaci mogu pouzdano da se utvrde, navedi:

* framework
* runtime
* language
* package manager
* deployment platform
* DB/ORM
* auth sistem
* broj aplikacija/packages u monorepo-u
* API površinu
* test frameworke
* CI/CD sistem
* ključne third-party servise

Ako je moguće, proceni i:

* broj relevantnih source fajlova
* broj test fajlova
* broj API endpointa
* broj DB modela
* broj GitHub workflow-a
* TODO/FIXME/HACK oznake

Nemoj izmišljati precizne brojke ako ih nisi mogao kompletno izračunati.

---

# 4. ARHITEKTONSKA MAPA

Napravi realan flow sistema.

Na primer:

```text
Browser
  ↓
Next.js UI
  ↓
Server Actions / Route Handlers
  ↓
Business Services
  ↓
ORM
  ↓
Database
```

ili arhitekturu koja stvarno postoji.

Posebno mapiraj:

## Authentication flow

```text
Login
→ credentials/provider
→ server validation
→ session/token
→ cookie
→ middleware
→ protected operation
```

## Data flow

```text
UI
→ request
→ validation
→ authorization
→ business logic
→ database
→ response
→ UI state
```

## External integration flow

```text
App
→ provider SDK/API
→ response/webhook
→ validation
→ persistence
→ user-visible state
```

---

# 5. CROSS-FILE ANALIZA JE OBAVEZNA

Najvažnije pravilo:

**Nemoj pregledati fajlove kao izolovane jedinice.**

Za svaku važnu funkcionalnost prati ceo tok kroz repository.

Primer:

```text
Form
↓
client validation
↓
request payload
↓
API route
↓
server validation
↓
authorization
↓
business logic
↓
database schema
↓
response
↓
client state
```

Traži neslaganja.

Na primer:

```text
Frontend šalje `userId`
API očekuje `id`
schema koristi `ownerId`
DB foreign key koristi `accountId`
```

ili:

```text
UI skriva admin dugme
↓
ali API endpoint proverava samo authentication
↓
bilo koji authenticated user može ručno pozvati endpoint
```

Cross-file nalazi imaju posebno visok prioritet.

---

# 6. TRACE CALLERS AND CALLEES

Pre nego što funkciju proglasiš problematičnom:

* pronađi ko je poziva
* pronađi šta ona poziva
* proveri wrappers
* proveri middleware
* proveri shared validation
* proveri shared authorization
* proveri DB constraints
* proveri framework behaviour

Ovo je obavezno radi smanjenja false-positive nalaza.

---

# 7. BUG HUNTING

Aktivno traži realne funkcionalne probleme.

Proveri:

* null
* undefined
* empty values
* invalid values
* boundary conditions
* off-by-one
* incorrect comparisons
* stale state
* stale closures
* async errors
* missing await
* Promise handling
* race conditions
* duplicate execution
* double submit
* idempotency
* concurrency
* pagination
* filtering
* sorting
* dates
* timezone
* DST
* locale
* decimal calculations
* currencies
* rounding
* encoding
* Unicode
* file paths
* Windows/Linux razlike
* case sensitivity
* SSR/CSR razlike
* hydration
* caching
* stale cache
* optimistic updates
* retry behaviour
* timeout behaviour
* partial failure

Za svaki ozbiljniji bug pokušaj da napraviš konkretan scenario reprodukcije.

---

# 8. HAPPY PATH NIJE DOVOLJAN

Za svaku važnu funkcionalnost proveri najmanje:

### Normalni slučaj

Šta se događa kada je sve ispravno?

### Empty state

Šta ako nema podataka?

### Invalid input

Šta ako korisnik pošalje pogrešan input?

### Malicious input

Šta ako korisnik zaobiđe frontend?

### Large input

Šta ako podataka ima ekstremno mnogo?

### Concurrent usage

Šta ako se operacija izvršava paralelno?

### Failure path

Šta ako:

* API padne
* baza padne
* external provider padne
* request timeout-uje
* response bude malformed

### User behaviour

Šta ako korisnik:

* klikne dva puta
* refreshuje
* koristi Back
* koristi Forward
* otvori dva taba
* promeni URL ručno
* direktno pozove API

---

# 9. SECURITY AUDIT

Uradi ozbiljan security pregled.

## Authentication

Proveri:

* login
* registration
* reset password
* session creation
* session validation
* logout
* token expiration
* refresh flow
* cookie settings
* HttpOnly
* Secure
* SameSite
* session fixation
* enumeration
* brute-force zaštitu gde je potrebna

## Authorization

Posebno proveri:

* IDOR
* broken access control
* role bypass
* privilege escalation
* tenant isolation
* ownership validation
* admin endpoints
* user-to-user access

Frontend zaštita se **nikada ne računa kao dovoljna authorization kontrola**.

Proveri server.

## Input attacks

Traži gde je relevantno:

* SQL injection
* NoSQL injection
* command injection
* shell injection
* XSS
* stored XSS
* reflected XSS
* DOM XSS
* CSRF
* SSRF
* path traversal
* open redirect
* unsafe URL fetching
* unsafe deserialization
* prototype pollution
* header injection
* template injection

## API

Za svaku kritičnu rutu proveri:

* authentication
* authorization
* validation
* rate limiting
* abuse
* idempotency
* enumeration
* excessive data exposure
* mass assignment
* error leakage

## Secrets

Traži:

* hardcoded API keys
* credentials
* tokens
* private keys
* passwords
* sensitive connection strings

Ako pronađeš secret:

**nikada ne reprodukuj njegovu punu vrednost u izveštaju.**

Maskiraj ga.

## Upload

Ako postoji:

* extension
* MIME
* content validation
* file size
* filename
* path traversal
* SVG
* executable payload
* overwrite
* storage permissions
* public exposure

## Webhooks

Proveri:

* signature
* timestamp
* replay
* duplicate event
* idempotency
* event ordering

## Security headers

Gde je relevantno proveri:

* CSP
* HSTS
* frame-ancestors
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* CORS

---

# 10. DATABASE I DATA INTEGRITY

Analiziraj:

* models
* schema
* relations
* migrations
* constraints
* indexes
* transactions

Traži:

* missing foreign keys
* missing unique constraints
* nullable podatke koji ne bi smeli biti nullable
* loše defaults
* orphan records
* unsafe cascade
* duplicate records
* race condition pri create/update
* lost updates
* missing transactions
* N+1
* unbounded queries
* expensive joins
* missing pagination
* missing indexes
* destructive migrations
* migration/deployment compatibility

Posebno proveri business invariants.

Ako aplikacija pretpostavlja:

> korisnik može imati samo jedan X

a DB to uopšte ne garantuje, prijavi rizik.

---

# 11. FRONTEND

Pregledaj:

* component architecture
* hooks
* state
* forms
* routing
* error handling
* loading
* empty states
* responsiveness

Traži:

* unnecessary rerender
* state duplication
* derived state koji je nepotrebno sačuvan
* stale state
* wrong React keys
* effect dependency probleme
* effect loops
* improper hooks
* memory leaks
* event listener cleanup
* timer cleanup
* request cancellation
* double submit
* hydration mismatch
* huge client components
* unnecessary client-side JS

---

# 12. NEXT.JS

Ako je projekat Next.js, detaljno proveri stvarnu verziju i ponašanje te verzije.

Pregledaj:

* App Router
* layouts
* pages
* route handlers
* Server Components
* Client Components
* Server Actions
* middleware/proxy
* caching
* revalidation
* fetch behaviour
* dynamic rendering
* static generation
* metadata
* error.tsx
* loading.tsx
* not-found.tsx
* redirects
* images
* fonts

Nemoj koristiti zastarele Next.js pretpostavke ako projekat koristi noviju verziju.

---

# 13. PERFORMANCE

Nemoj se ograničiti na "optimizuj bundle".

Traži konkretna uska grla.

Frontend:

* bundle
* dependency weight
* client JS
* render
* hydration
* images
* fonts
* network waterfalls
* sequential fetching
* duplicate fetching

Backend:

* DB
* N+1
* serial API calls
* blocking work
* excessive serialization
* large responses
* unbounded operations
* CPU-heavy work
* memory usage
* timeout
* retry storms

Analiziraj šta će se verovatno dogoditi sa većim brojem:

* users
* records
* requests
* tenants
* jobs

Nemoj tvrditi:

> aplikacija podržava X korisnika

bez benchmarka.

Umesto toga navedi potencijalna bottleneck mesta.

---

# 14. EXTERNAL SERVICES

Za svaku integraciju pronađi:

* gde se inicijalizuje
* gde se poziva
* gde se response obrađuje
* gde se čuva stanje

Proveri:

* timeout
* retries
* malformed response
* unavailable provider
* rate limits
* duplicate request
* partial failure
* webhook consistency
* API version assumptions

---

# 15. ERROR HANDLING

Traži:

* empty catch
* swallowed errors
* `console.log` umesto ozbiljnog handlinga
* generic 500
* stack trace leakage
* internal error exposure
* catch bez rollback-a
* partial DB write
* UI bez error stanja

Proveri da li failure može ostaviti sistem u nekonzistentnom stanju.

---

# 16. RELIABILITY

Analiziraj:

* retries
* idempotency
* duplicate events
* concurrent workers
* queues
* scheduled jobs
* crash recovery
* partial writes
* cleanup
* resource lifecycle
* distributed race conditions

Ako aplikacija koristi serverless infrastrukturu, posebno proveri pretpostavke o:

* memory persistence
* local filesystem
* long-running processes
* background work
* shared global state

---

# 17. TEST SUITE

Pregledaj kompletne testove.

Utvrdi:

* šta testovi zaista pokrivaju
* šta samo deluje da pokrivaju
* šta nije pokriveno

Traži:

* test bez meaningful assertion-a
* test koji mockuje praktično sve
* flaky behaviour
* timing assumptions
* snapshot abuse
* duplicate tests
* obsolete tests
* tests koji više ne odgovaraju implementaciji

Posebno pronađi kritične flow-ove bez:

* unit
* integration
* E2E

testova.

Ako runtime/tooling pristup omogućava pokretanje:

* test
* lint
* typecheck
* build

koristi rezultate.

Ako nije moguće pokrenuti ih, nemoj tvrditi da prolaze.

Označi:

**NOT VERIFIED**

---

# 18. TESTIRAJ PRETPOSTAVKE TESTOVA

Posebno obrati pažnju na situaciju:

```text
Tests PASS
```

ali samo zato što nikada ne aktiviraju bug.

Nemoj koristiti broj passing testova kao dokaz da je implementation ispravan.

---

# 19. DEPENDENCIES

Pregledaj:

* package.json
* lockfile
* workspace dependencies

Traži:

* unused
* duplicate
* deprecated
* abandoned
* vulnerable
* incompatible
* outdated sa konkretnim razlogom za upgrade
* nepotrebno velike biblioteke

Ne prijavljuj svaki paket samo zato što nije najnoviji.

Upgrade preporuči samo kada postoji razlog.

---

# 20. CI/CD

Analiziraj svaki workflow.

Proveri:

* trigger
* permissions
* secrets
* cache
* build
* test
* lint
* typecheck
* deployment
* migration
* artifacts
* concurrency
* failure handling

Traži:

* deploy uprkos failing testovima
* missing required checks
* unsafe permissions
* branch mismatch
* production migration rizik
* concurrency deployment problem
* environment drift

---

# 21. CONFIGURATION

Pregledaj sve relevantne konfiguracije.

Na primer:

* package.json
* tsconfig
* eslint
* prettier
* next.config
* vite
* webpack
* tailwind
* postcss
* Docker
* compose
* vercel.json
* railway
* turbo
* pnpm-workspace
* npmrc
* gitignore
* env example

Traži kontradikcije između konfiguracije i koda.

---

# 22. ENVIRONMENT VARIABLES

Utvrdi:

* koje env varijable postoje
* gde se koriste
* da li su documented
* da li se validiraju pri startup-u
* šta se događa kada nedostaju
* server/client exposure

Posebno traži slučajno izlaganje server secreta kroz client bundle.

---

# 23. UX

Analiziraj UI flow iz implementacije.

Traži:

* dead ends
* confusing navigation
* previše koraka
* nejasne CTA
* nedostatak feedback-a
* destructive actions bez zaštite
* forme koje mogu izgubiti podatke
* poor loading state
* poor empty state
* mobile overflow
* previše skrola
* loš responsive behaviour
* nekonzistentan UX

Razlikuj:

**BUG**

od

**UX IMPROVEMENT**

---

# 24. ACCESSIBILITY

Proveri:

* semantic HTML
* headings
* form labels
* ARIA
* keyboard
* focus
* dialogs
* modals
* focus trap
* alt text
* error announcements
* touch targets
* reduced motion

Ne prijavljuj accessibility finding bez konkretnog razloga.

---

# 25. SEO

Ako je relevantno:

* metadata
* titles
* descriptions
* canonical
* robots
* sitemap
* OpenGraph
* structured data
* indexing
* status codes

---

# 26. PWA

Ako postoji:

* manifest
* service worker
* cache strategy
* offline state
* installability
* cache invalidation
* update behaviour

Posebno traži mogućnost da korisnik ostane na staroj verziji aplikacije zbog pogrešnog caching-a.

---

# 27. PRIVACY

Mapiraj tokove ličnih podataka:

```text
collection
→ processing
→ database
→ logs
→ analytics
→ external providers
```

Traži:

* nepotrebno čuvanje
* sensitive logs
* excessive data
* accidental client exposure

---

# 28. OBSERVABILITY

Proceni da li developer može dijagnostikovati production incident.

Pregledaj:

* logs
* structured logs
* error tracking
* request IDs
* correlation IDs
* audit trail
* health checks
* metrics
* performance telemetry

Ne preporučuj kompleksan monitoring ako veličina projekta to ne opravdava.

---

# 29. CODE QUALITY

Traži samo stvari sa stvarnim maintainability uticajem:

* dead code
* duplicate logic
* huge functions
* huge components
* excessive nesting
* unclear boundaries
* misleading naming
* magic values
* TODO
* FIXME
* HACK
* temporary workaround
* commented code
* obsolete compatibility layer

Ne troši izveštaj na subjektivne formatting preferencije.

---

# 30. DEAD CODE

Pre nego što nešto označiš kao dead code:

* traži import
* traži dynamic import
* traži string reference
* proveri routing conventions
* proveri framework conventions
* proveri tests
* proveri scripts

Koristi:

**LIKELY DEAD**

ako nemaš dovoljno dokaza.

---

# 31. DOCUMENTATION VS REALITY

Uporedi:

* README
* docs
* comments
* architecture dokumentaciju

sa kodom.

Traži:

* obsolete commands
* wrong setup
* wrong env names
* outdated screenshots/opise
* removed features
* undocumented features

Kod ima prednost.

---

# 32. FALSE-POSITIVE PREVENTION

Pre prijave ozbiljnog problema obavezno proveri:

1. da li postoji zaštita u istom fajlu
2. parent wrapper
3. middleware
4. shared utility
5. framework behaviour
6. DB constraint
7. infrastructure layer
8. caller
9. callee
10. tests koji otkrivaju očekivano ponašanje

Ako zaštita postoji, nemoj prijavljivati problem.

---

# 33. FRAMEWORK-AWARE ANALYSIS

Nemoj označiti standardno framework ponašanje kao bug.

Pre nalaza proveri:

* verziju frameworka
* konfiguraciju projekta
* njegovu stvarnu semantiku

Ako ti je ponašanje određene moderne verzije biblioteke nejasno, proveri pouzdan izvor pre zaključka.

---

# 34. REPOSITORY-WIDE SEARCH

Aktivno pretraži repository za obrasce koji često otkrivaju probleme:

```text
TODO
FIXME
HACK
XXX
eslint-disable
ts-ignore
ts-expect-error
any
console.
catch
setTimeout
setInterval
dangerouslySetInnerHTML
innerHTML
eval
exec
spawn
fetch
axios
process.env
localStorage
sessionStorage
cookies
redirect
revalidate
middleware
admin
role
permission
userId
ownerId
tenantId
```

Ali sam rezultat pretrage nije finding.

Svaki relevantan rezultat mora biti analiziran u kontekstu.

---

# 35. DUPLICATED LOGIC

Kada pronađeš sličan kod na više mesta, proveri da li postoje razlike koje mogu izazvati behavioural drift.

Posebno:

* validation
* authorization
* calculations
* date logic
* status transitions
* pricing
* permissions

---

# 36. BUSINESS LOGIC INVARIANTS

Iz koda izvedi glavna poslovna pravila.

Na primer:

```text
Only owner can edit resource.
```

Zatim proveri sva mesta gde se resource menja.

Ako postoji pet write path-ova, svih pet moraju očuvati invariant.

Ovo radi za svako kritično pravilo koje identifikuješ.

---

# 37. STATE MACHINE ANALYSIS

Ako entitet ima statuse, npr:

```text
draft
pending
approved
rejected
cancelled
```

identifikuj state machine.

Proveri:

* dozvoljene tranzicije
* nedozvoljene tranzicije
* duplicate transitions
* missing validation
* impossible states

---

# 38. CREATE / READ / UPDATE / DELETE MATRIX

Za važne entitete pronađi sve:

* CREATE
* READ
* UPDATE
* DELETE

puteve.

Proveri da li svi imaju konzistentne:

* validation
* authorization
* tenancy
* logging
* side-effects

---

# 39. READ VS WRITE SECURITY

Posebno proveri da li je možda:

* READ zaštićen
* UPDATE nezaštićen

ili:

* UI zaštićen
* API nezaštićen

ili:

* GET proverava tenant
* DELETE ne proverava tenant

---

# 40. SERVER-CLIENT TRUST BOUNDARY

Svaki podatak iz browsera tretiraj kao nepoverljiv.

Proveri da li server slučajno veruje:

* role
* price
* userId
* ownerId
* tenantId
* permissions
* status
* calculated total
* admin flag

koji je poslao client.

---

# 41. PRODUCTION VS DEVELOPMENT

Traži kod koji radi samo slučajno u developmentu.

Posebno:

* localhost
* filesystem
* case sensitivity
* environment variables
* mock service
* dev fallback
* debug bypass
* development auth
* seed data
* in-memory state

---

# 42. BUILD-TIME VS RUNTIME

Razlikuj:

* compile problem
* build problem
* runtime problem
* server-only problem
* browser-only problem
* production-only problem

Navedi kategoriju kada je relevantna.

---

# 43. SEVERITY

Svaki potvrđen nalaz klasifikuj:

## P0 - CRITICAL

* compromise
* unauthorized access
* serious data loss
* catastrophic financial impact
* kompletan failure glavnog sistema

## P1 - HIGH

* ozbiljan production bug
* security weakness
* major reliability issue
* major business flow failure

## P2 - MEDIUM

* realan problem sa ograničenijim uticajem

## P3 - LOW

* manji bug ili maintainability problem

## P4 - IMPROVEMENT

* unapređenje koje nije bug

---

# 44. CONFIDENCE

Obavezno:

```text
HIGH
MEDIUM
LOW
```

## HIGH

Direktno dokazano kodom ili testom.

## MEDIUM

Kod daje jak dokaz, ali runtime potvrda nedostaje.

## LOW

Potrebna dodatna infrastruktura/runtime/proizvodna konfiguracija.

LOW finding nikada nemoj predstavljati kao potvrđenu činjenicu.

---

# 45. VERIFICATION STATUS

Pored confidence-a koristi gde ima smisla:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

Primer:

```text
Severity: P1
Confidence: HIGH
Status: CONFIRMED
```

---

# 46. EVIDENCE-FIRST FINDINGS

Svaki ozbiljan finding mora imati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Location:
File:
Function/Component:
Relevant lines or code section:

Description:

Evidence:

Execution/Data Flow:

Reproduction scenario:

Impact:

Root cause:

Recommended remediation:

Complexity:
XS / S / M / L / XL
```

---

# 47. NE PREPISUJ CEO KOD

Za dokaz citiraj samo minimalni relevantni deo ili preciznu lokaciju.

Fokus je na analizi, ne na kopiranju repozitorijuma.

---

# 48. DUPLICATE FINDINGS

Ako postoji jedan root cause na mnogo mesta:

kreiraj jedan finding.

Pod:

```text
Affected locations:
```

navedi ostale lokacije.

---

# 49. NE MENJAJ KOD

Tokom ovog audita:

* nemoj automatski editovati fajlove
* nemoj otvarati PR
* nemoj refaktorisati
* nemoj menjati dependencies
* nemoj popravljati nalaze

Prvo završi audit.

Ako korisnik kasnije zatraži remediation, koristi audit kao osnovu.

---

# 50. PROVERI I DOBRE DELOVE

Nemoj tražiti samo greške.

Dokumentuj:

* dobro dizajniranu arhitekturu
* kvalitetne abstraction boundaries
* dobru security kontrolu
* dobre testove
* dobru validation strategiju
* kvalitetan error handling

Ovo je bitno da kasniji refactor ne pokvari ono što već radi dobro.

---

# 51. OUTPUT - `AUDIT_REPORT.md`

Finalni rezultat strukturiraj kao kompletan profesionalni audit.

---

# 1. Executive Summary

Napiši:

* šta aplikacija radi
* opšte stanje
* najveće rizike
* najvažnije pozitivne strane
* production readiness

---

# 2. Scores

Oceni od 0-10:

```text
Architecture:
Code Quality:
Correctness:
Security:
Performance:
Reliability:
Data Integrity:
Testing:
UX:
Accessibility:
Observability:
Documentation:
DevOps:
Production Readiness:
```

Uz svaku ocenu napiši kratko obrazloženje.

Nemoj davati visoku ili nisku ocenu bez dokaza.

---

# 3. Architecture

Objasni stvarnu arhitekturu.

---

# 4. Repository Map

Sažeto opiši bitne direktorijume i njihovu svrhu.

---

# 5. Critical User Flows

Navedi glavne end-to-end flow-ove koje si pratio.

---

# 6. Repository Statistics

Samo proverljive podatke.

---

# 7. Findings Summary

| ID | Severity | Category | Problem | Location | Confidence | Status |
| -- | -------- | -------- | ------- | -------- | ---------- | ------ |

---

# 8. P0 Critical Findings

Detaljan opis.

---

# 9. P1 High Findings

Detaljan opis.

---

# 10. P2 Medium Findings

Detaljan opis.

---

# 11. P3 Low Findings

Detaljan opis.

---

# 12. P4 Improvements

Odvoji unapređenja od realnih bugova.

---

# 13. Security Audit

Poseban zbirni pregled security stanja.

---

# 14. Authentication & Authorization Matrix

Gde je moguće napravi tabelu:

| Feature/Route | Auth | Ownership | Role | Tenant Isolation | Result |
| ------------- | ---- | --------- | ---- | ---------------- | ------ |

---

# 15. API Audit

Za važnije endpoint-e:

```text
METHOD /route

Authentication:
Authorization:
Input validation:
Data access:
Side effects:
Rate limiting:
Error handling:
Potential issue:
```

---

# 16. Data Integrity Audit

Rezime DB nalaza.

---

# 17. Performance Audit

Navedi konkretne bottleneck-e.

---

# 18. Reliability Audit

---

# 19. Testing Audit

Navedi:

* dobre testove
* slabe testove
* missing coverage
* critical untested flows

---

# 20. Dependency Audit

| Dependency | Status | Finding | Risk | Recommendation |
| ---------- | ------ | ------- | ---- | -------------- |

---

# 21. CI/CD Audit

---

# 22. UX Findings

---

# 23. Accessibility Findings

---

# 24. SEO/PWA Findings

Ako su relevantni.

---

# 25. Observability Findings

---

# 26. Documentation Drift

---

# 27. Dead / Legacy / Suspicious Code

Razdvoji:

```text
CONFIRMED DEAD
LIKELY DEAD
LEGACY BUT USED
UNKNOWN
```

---

# 28. Technical Debt

Ne mešaj technical debt sa bugovima.

---

# 29. Production Readiness Checklist

Koristi:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Za:

* clean install
* build
* lint
* typecheck
* unit tests
* integration tests
* E2E tests
* auth
* authorization
* tenant isolation
* validation
* database constraints
* migrations
* error handling
* external service failure
* rate limiting
* secrets
* security headers
* logging
* monitoring
* backups
* performance
* accessibility
* responsive/mobile
* SEO
* PWA
* CI
* deployment
* rollback
* documentation

---

# 30. Top Problems

Napravi dve liste.

## Top 10 by Risk

Najopasniji problemi bez obzira na težinu popravke.

## Top 10 by ROI

Problemi čija popravka daje najveći odnos:

```text
impact / effort
```

---

# 31. Remediation Roadmap

## Phase 0 - Emergency

P0.

## Phase 1 - Before Production / Immediate

P1.

## Phase 2 - Stabilization

P2.

## Phase 3 - Quality

P3.

## Phase 4 - Improvements

P4.

Za svaku fazu objasni dependency između popravki.

---

# 32. Things Done Well

Obavezno.

---

# 33. Unknowns / Not Verified

Posebno navedi sve što nisi mogao pouzdano proveriti zbog nedostatka:

* runtime-a
* secrets
* production environment-a
* DB pristupa
* external provider-a
* deployment logs
* private infrastrukture

Nemoj ove stvari pretvoriti u findings bez dokaza.

---

# 34. FINAL SECOND-PASS AUDIT

Kada misliš da je audit završen - nije završen.

Uradi još jedan prolaz.

Ponovo proveri:

* auth
* permissions
* tenant boundaries
* API writes
* destructive operations
* money calculations
* status transitions
* webhooks
* cron/jobs
* migrations
* external integrations
* error paths
* concurrent operations
* cache
* production configuration

Zatim postavi sebi pitanje:

> Koji ozbiljan problem je mogao ostati neprimećen zato što sam prvi put posmatrao sistem iz perspektive strukture repozitorijuma umesto iz perspektive napadača, korisnika ili production incidenta?

Uradi još tri kratka mentalna prolaza:

### Attacker pass

Kako bih pokušao da zaobiđem kontrole?

### Failure pass

Šta će prvo pući ako DB/API/network počne da otkazuje?

### User pass

Koji realan korisnički scenario implementacija možda nije predvidela?

Sve nove nalaze dodaj u glavni audit.

---

# 35. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

* da li svaki P0/P1 ima konkretan evidence
* da li si proverio zaštite u drugim slojevima
* da li ima duplicate findings
* da li teorijske probleme predstavljaš kao potvrđene
* da li si propustio critical flow
* da li si pomešao improvement i bug
* da li su ocene usklađene sa findings-ima
* da li preporučeni fix zapravo rešava root cause
* da li dokumentacija odgovara stvarnom stanju koda

Ako nema dovoljno dokaza za tvrdnju - ublaži je ili označi NOT VERIFIED.

---

# KONAČNO PRAVILO

Ne želim audit koji kaže:

> "Kod generalno izgleda dobro, evo nekoliko best practices."

Želim da se ponašaš kao da će aplikacija sutra biti puštena u ozbiljnu produkciju i da si ti poslednja tehnička kontrola pre toga.

Ali istovremeno:

**ne izmišljaj rizike.**

Bolje je prijaviti 12 stvarnih problema nego 70 generičkih.

Svaki ozbiljan zaključak mora biti povezan sa stvarnim kodom, konfiguracijom, testom ili jasno dokumentovanim execution flow-om.

Cilj je dobiti **forenzički precizan repository audit koji kasnije možemo direktno pretvoriti u remediation plan i implementacione zadatke**.
