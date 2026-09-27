---
id: UPL-IT-002
number: 2
slug: ultimate-nextjs-production-audit
title: Sveobuhvatni produkcioni audit Next.js aplikacije
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# SVEOBUHVATNI PRODUKCIONI AUDIT NEXT.JS APLIKACIJE

Želim da izvršiš **maksimalno duboku, sistematsku, version-aware i evidence-first analizu kompletnog Next.js projekta**.

Ovo nije generički code review i nije lista Next.js best practices.

Tretiraj zadatak kao kombinaciju:

- senior Next.js architecture review-a
- React architecture review-a
- Server Components / Client Components audita
- Server Actions audita
- Route Handlers / API audita
- caching i rendering audita
- authentication i authorization audita
- security audita
- performance audita
- Core Web Vitals analize
- production-readiness audita
- Vercel/serverless audita gde je relevantno
- SEO audita
- accessibility pregleda
- PWA audita ako postoji
- test coverage analize
- reliability audita
- observability pregleda
- deployment i CI/CD pregleda
- cross-file i cross-runtime forenzike

Glavni cilj:

> Utvrditi kako Next.js aplikacija zaista radi od browsera do servera i baze, pronaći potvrđene probleme i rizike, razlikovati bugove od unapređenja i oceniti da li je projekat spreman za ozbiljnu produkciju.

Prioritet:

**tačnost > dokaz > dubina > broj nalaza.**

Ne izmišljaj probleme kako bi audit izgledao detaljnije.

Ne prijavljuj generičke Next.js preporuke ako nema konkretnog razloga u ovom projektu.

---

# 0. NAJPRE UTVRDI STVARNU NEXT.JS VERZIJU

Pre ozbiljne analize utvrdi:

- Next.js verziju
- React verziju
- Node.js/runtime zahteve
- package manager
- App Router ili Pages Router
- da li oba routera koegzistiraju
- TypeScript verziju
- deployment target
- hosting platformu
- ORM/database sloj
- auth sistem
- caching/data-fetching biblioteke
- UI framework
- test frameworke

Pregledaj najmanje:

- `package.json`
- lockfile
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `middleware.*` ili odgovarajući proxy sloj
- `app/`
- `pages/` ako postoji
- `src/`
- `public/`
- env konfiguraciju
- deployment konfiguraciju
- GitHub Actions / CI ako postoje

**Ne koristi ponašanje stare Next.js verzije kao dokaz za novu verziju.**

Ako je semantika frameworka promenjena između verzija i zaključak zavisi od toga:

1. utvrdi verziju projekta
2. proveri ponašanje te verzije
3. tek onda napravi finding

Framework behaviour koji je ispravan po dizajnu nije bug.

---

# 1. MAPIRAJ NEXT.JS ARHITEKTURU PRE NALAZA

Ne počinji finding-ima.

Prvo napravi mapu sistema.

Utvrdi:

- root layout
- nested layouts
- route groups
- pages
- dynamic routes
- catch-all routes
- parallel routes
- intercepting routes ako postoje
- loading boundaries
- error boundaries
- not-found handling
- Server Components
- Client Components
- Server Actions
- Route Handlers
- middleware/proxy
- authentication
- authorization
- database layer
- external API integracije
- background jobs
- webhooks
- storage
- analytics
- monitoring
- PWA/service worker
- sitemap/robots
- localization
- deployment infrastrukturu

Napravi stvarni high-level flow, npr:

```text
Browser
↓
Next.js routing
↓
Server Component
↓
service/business layer
↓
ORM
↓
database
↓
RSC payload / HTML
↓
hydration
↓
Client Components
```

Ako aplikacija koristi drugačiju arhitekturu, dokumentuj ono što zaista postoji.

---

# 2. SERVER COMPONENTS VS CLIENT COMPONENTS

Ovo je jedan od glavnih delova audita.

Mapiraj Client Component boundary.

Pretraži projekat za:

```text
"use client"
'use client'
```

Za svaki važniji Client Component utvrdi zašto mora biti client-side.

Traži:

- nepotrebno velike Client Component subtree-ove
- `use client` previsoko u stablu
- server-capable komponente pretvorene u client zbog jednog malog interaktivnog dela
- nepotrebno slanje JavaScript-a browseru
- server-only podatke prosleđene ka client-u
- serialization probleme
- nebezbedno izlaganje podataka
- duplicated server/client fetching
- hydration mismatch
- client-side fetch koji je mogao biti server-side
- server-side posao koji se nepotrebno radi u browseru

Proveri i suprotan problem:

- komponenta koristi browser API u Server Component kontekstu
- `window`
- `document`
- `localStorage`
- `sessionStorage`
- browser-only biblioteke

Razlikuj:

**BUG**

od

**PERFORMANCE / ARCHITECTURE IMPROVEMENT**.

Ne prijavljuj `use client` samo zato što postoji.

---

# 3. REACT SERVER COMPONENT DATA FLOW

Za kritične stranice prati kompletan tok podataka.

Na primer:

```text
request
↓
route
↓
layout
↓
page
↓
Server Component
↓
data access
↓
database/API
↓
serialization
↓
Client Component
↓
interactive state
```

Traži:

- redundant fetching
- isti podatak učitan na više nivoa
- waterfalls
- sequential awaits koji mogu biti paralelni
- nepotrebno blokiranje rendera
- prevelike RSC payload-e
- slanje velikih objekata Client Components
- previše podataka iz DB/API-ja
- fetching koji zavisi od client-only efekta i proizvodi kasno učitavanje

Nemoj optimizovati paralelizaciju ako operacije stvarno zavise jedna od druge.

---

# 4. SERVER ACTIONS AUDIT

Pronađi sve Server Actions.

Za svaku važnu akciju proveri:

- authentication
- authorization
- ownership
- tenant isolation
- input validation
- schema validation
- server/client trust boundary
- business invariants
- database transaction
- idempotency
- duplicate submission
- error handling
- redirect/revalidation ponašanje
- cache invalidation
- sensitive return values

Svaki input iz browsera tretiraj kao nepoverljiv.

Posebno proveri da Server Action ne veruje client vrednostima kao što su:

```text
userId
ownerId
tenantId
role
isAdmin
price
total
status
permissions
subscriptionTier
```

ako se mogu pouzdano izvesti na serveru.

Frontend kontrola nije authorization.

Ako UI sakrije dugme, a Server Action dozvoljava operaciju, prijavi server-side problem.

---

# 5. ROUTE HANDLERS I API

Mapiraj sve važne:

```text
GET
POST
PUT
PATCH
DELETE
```

Route Handlere/API endpoint-e.

Za svaki relevantan endpoint proveri:

- auth
- authorization
- ownership
- tenancy
- request validation
- query params
- headers
- body
- content type
- response shape
- status codes
- excessive data exposure
- mass assignment
- rate limiting
- idempotency
- pagination
- error leakage
- timeout
- external API failure
- database failure

Posebno traži asimetriju:

```text
GET proverava ownerId
DELETE ne proverava ownerId
```

ili:

```text
UI ima role guard
API ga nema
```

ili:

```text
POST validira schema
PATCH prihvata proizvoljan object
```

---

# 6. AUTHENTICATION

Mapiraj kompletan auth flow:

```text
login
→ provider/credentials
→ validation
→ session/token
→ cookie
→ middleware/proxy
→ server component/action/API
→ authorization
```

Proveri:

- registration
- login
- logout
- password reset
- email verification
- OAuth
- session creation
- session validation
- token refresh
- token expiration
- cookie flags
- HttpOnly
- Secure
- SameSite
- session fixation
- enumeration
- brute-force protection
- callback/redirect validation

Nemoj pretpostavljati da middleware automatski štiti server operation.

Prati svaki critical write path do stvarne authorization kontrole.

---

# 7. AUTHORIZATION

Posebno proveri:

- IDOR
- broken access control
- horizontal privilege escalation
- vertical privilege escalation
- role bypass
- ownership bypass
- tenant escape
- admin-only operations
- destructive actions
- billing/subscription operations

Za važne resurse napravi CRUD matricu:

| Resource | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|

Proveri da li svaki write path ima konzistentnu authorization logiku.

Jedan zaštićeni endpoint ne znači da su svi putevi do istog resource-a zaštićeni.

---

# 8. NEXT.JS CACHING AUDIT

Ovo analiziraj posebno detaljno.

Utvrdi stvarno ponašanje korišćene Next.js verzije za:

- server `fetch`
- route caching
- page caching
- static rendering
- dynamic rendering
- revalidation
- tag-based invalidation
- path-based invalidation
- request memoization
- application-level caching
- third-party cache slojeve

Pretraži relevantne API-je i konfiguracije.

Traži:

- stale user data
- stale permissions
- stale dashboard
- pogrešno cachiran authenticated content
- cross-user data leakage
- cache koji ne invalidira posle mutation-a
- prečestu invalidaciju
- nepotrebno potpuno dinamičke rute
- slučajno statičke podatke koji moraju biti sveži
- duplicate fetch
- cache stampede rizik
- inconsistent cache između više write path-ova

Za svaki cache finding objasni:

```text
WRITE
↓
šta se menja
↓
koji cache ostaje
↓
ko kasnije čita stale podatak
↓
user-visible posledica
```

Ne koristi zastarele Next.js caching pretpostavke.

---

# 9. STATIC VS DYNAMIC RENDERING

Za bitne rute utvrdi da li su:

- static
- dynamic
- prerendered
- request-time rendered
- client-rendered
- kombinovane

Proveri:

- da li rendering mode odgovara prirodi podataka
- accidental dynamic rendering
- accidental static rendering
- user-specific data u pogrešnom rendering modelu
- nepotrebno izgubljen static optimization
- runtime dependencies koje menjaju rendering behavior

Nemoj zahtevati static rendering tamo gde dinamičko ponašanje ima smisla.

---

# 10. STREAMING, SUSPENSE I LOADING

Ako projekat koristi:

- Suspense
- streaming
- `loading.*`
- async Server Components

proveri:

- da li se spore sekcije izolovano streamuju
- da li jedan spor request blokira celu stranicu
- nested waterfall
- loše postavljene Suspense boundaries
- layout shift
- flicker
- redundant loaders
- inconsistent loading state

Posebno proveri korisničko iskustvo na sporoj mreži.

---

# 11. ERROR BOUNDARIES

Pregledaj:

- `error.*`
- `global-error.*`
- route-level error handling
- server errors
- client errors
- API errors

Traži:

- missing error state
- generic failure bez korisnog recovery-ja
- infinite retry
- stale UI posle failed mutation-a
- sensitive error details
- stack trace exposure
- errors koji se samo loguju
- errors koji ostavljaju partial DB state

---

# 12. NOT-FOUND I ROUTING EDGE CASES

Pregledaj:

- `not-found.*`
- dynamic params
- invalid IDs
- malformed slugs
- deleted resources
- unauthorized vs non-existent resources
- redirect behavior

Traži:

- pogrešan HTTP status
- soft 404
- redirect loop
- information leakage
- route collision
- invalid dynamic params koji izazivaju 500

---

# 13. MIDDLEWARE / PROXY AUDIT

Ako postoji middleware ili ekvivalentni request interception sloj, proveri:

- matcher
- excluded routes
- static assets
- API routes
- locale routing
- authentication
- redirects
- rewrites
- security assumptions
- runtime compatibility

Posebno traži:

- protected route koja nije obuhvaćena matcher-om
- public route koja je slučajno zaključana
- redirect loop
- auth samo u middleware-u bez server-side provere
- skupe operacije na svakom request-u

Middleware nije automatski dovoljan authorization sloj.

---

# 14. DATABASE I ORM

Prati data access iz Server Components, Server Actions i Route Handlera do baze.

Proveri:

- schema
- relations
- indexes
- constraints
- transactions
- N+1
- unbounded queries
- overfetching
- pagination
- ordering
- race conditions
- unique constraints
- tenant filtering
- delete cascades
- connection handling

Ako je deployment serverless, proveri:

- connection assumptions
- pooling
- connection exhaustion
- long transactions
- runtime compatibility

Business invariant koji postoji samo u TypeScript kodu, ali ne i u DB-u, posebno proveri za concurrent write scenario.

---

# 15. SECURITY AUDIT

Proveri gde je relevantno:

- XSS
- stored XSS
- DOM XSS
- CSRF
- SSRF
- SQL injection
- command injection
- path traversal
- open redirects
- header injection
- unsafe URL fetching
- unsafe HTML rendering
- prototype pollution
- malicious uploads
- auth bypass
- IDOR
- excessive data exposure
- secret exposure

Pretraži:

```text
dangerouslySetInnerHTML
innerHTML
eval
exec
spawn
fetch
redirect
headers
cookies
process.env
NEXT_PUBLIC_
```

Rezultat pretrage nije automatski finding.

Analiziraj kontekst.

---

# 16. ENVIRONMENT VARIABLES

Mapiraj sve env varijable.

Za svaku utvrdi:

- server-only ili client-visible
- gde se koristi
- da li je dokumentovana
- da li se validira
- ponašanje kada nedostaje
- development fallback
- production fallback

Posebno proveri `NEXT_PUBLIC_*`.

Traži slučajno izlaganje:

- API ključeva
- database credentials
- private tokens
- internal service URLs
- signing secrets

Nikada ne reprodukuj ceo pronađeni secret.

Maskiraj vrednost.

---

# 17. PERFORMANCE

Nemoj se zaustaviti na rečenici:

> smanjiti bundle.

Pronađi konkretne probleme.

## Server

Proveri:

- sequential requests
- waterfalls
- duplicate DB queries
- N+1
- expensive calculations
- large serialization
- blocking operations
- large API responses
- slow external providers

## Client

Proveri:

- client JS
- bundle size
- heavy dependencies
- unnecessary hydration
- rerenders
- context rerenders
- expensive rendering
- large lists
- unnecessary effects
- duplicate client fetching

## Network

Proveri:

- request waterfalls
- excessive round trips
- duplicate requests
- missing caching
- huge JSON
- asset sizes

## Assets

Proveri:

- images
- fonts
- icons
- video
- third-party scripts

Nemoj davati lažne procene tipa:

> podržavaće 100.000 korisnika.

Bez benchmarka navedi samo konkretna bottleneck mesta i skalabilne rizike.

---

# 18. IMAGES

Pregledaj način korišćenja slika.

Proveri:

- `next/image`
- dimensions
- responsive sizing
- `sizes`
- priority/preload usage
- lazy loading
- remote sources
- image domains/patterns
- oversized assets
- layout shift
- decorative images
- alt text

Ne zahtevaj Next Image tamo gde nema realnu korist.

---

# 19. FONTS

Pregledaj font loading.

Proveri:

- local vs remote
- framework font optimization
- unnecessary weights
- unnecessary subsets
- render blocking
- layout shifts
- duplicated font loading

---

# 20. THIRD-PARTY SCRIPTS

Mapiraj:

- analytics
- ads
- chat
- tracking
- embeds
- payment SDK
- maps
- social widgets

Proceni:

- blocking
- privacy
- loading strategy
- consent
- performance impact
- failure impact

---

# 21. CORE WEB VITALS

Iz koda identifikuj potencijalne uzroke problema sa:

- LCP
- CLS
- INP

Ne izmišljaj stvarne metrike bez runtime merenja.

Razlikuj:

```text
CODE-LEVEL RISK
```

od:

```text
MEASURED PROBLEM
```

Ako nema Lighthouse/field/runtime podataka, napiši:

**NOT MEASURED**

---

# 22. SEO

Ako je aplikacija javno indeksabilna, proveri:

- title
- description
- metadata
- canonical
- OpenGraph
- Twitter/X metadata
- robots
- sitemap
- status codes
- redirects
- structured data
- pagination/indexing
- duplicate content
- dynamic metadata
- locale/hreflang gde je relevantno

Posebno razlikuj:

- SEO issue
- social sharing issue
- indexing issue

---

# 23. ACCESSIBILITY

Proveri:

- semantic HTML
- heading hierarchy
- labels
- errors
- ARIA
- keyboard
- focus
- modal/dialog behavior
- focus traps
- skip navigation
- touch targets
- alt text
- reduced motion
- color-independent state
- live announcements gde su potrebni

Nemoj prijavljivati accessibility problem bez konkretne lokacije i posledice.

---

# 24. FORMS

Za sve važne forme prati:

```text
input
↓
client validation
↓
submission
↓
server validation
↓
authorization
↓
business operation
↓
database
↓
response
↓
UI feedback
```

Traži:

- validation mismatch
- double submit
- stale errors
- data loss
- missing pending state
- invalid server assumptions
- optimistic update bez rollback-a
- browser Back/Forward problem
- refresh problem
- duplicate creation

---

# 25. STATE MANAGEMENT

Ako projekat koristi:

- React state
- Context
- Zustand
- Redux
- TanStack Query
- SWR
- custom stores

proveri:

- duplicated source of truth
- stale state
- server state u client store-u bez potrebe
- synchronization problems
- cache mismatch
- race conditions
- over-globalized state
- persistence/privacy problem

---

# 26. EXTERNAL API INTEGRATIONS

Za svaku važnu integraciju prati:

```text
caller
↓
request
↓
provider
↓
response
↓
validation
↓
persistence
↓
UI
```

Proveri:

- timeout
- retries
- malformed response
- unavailable provider
- duplicate calls
- rate limits
- version assumptions
- partial failure
- sensitive data transfer

---

# 27. WEBHOOKS

Ako postoje, proveri:

- signature verification
- timestamp
- replay
- duplicate delivery
- idempotency
- ordering
- retries
- event version
- transaction boundaries

Webhook koji može stići dva puta mora biti analiziran kao takav.

---

# 28. FILE UPLOAD

Ako projekat prihvata fajlove:

- extension
- MIME
- actual content
- size
- filename
- path
- storage
- authorization
- public exposure
- executable formats
- SVG
- replacement/overwrite behavior

---

# 29. PWA

Ako postoji PWA:

- manifest
- icons
- installability
- service worker
- cache strategy
- offline fallback
- update behavior
- stale assets
- logout/cache interaction
- user-specific cached data

Posebno proveri da service worker ne zadržava korisnika na zastareloj ili nebezbednoj verziji aplikacije.

---

# 30. INTERNATIONALIZATION

Ako projekat ima više jezika:

- locale routing
- fallback
- missing translation
- server/client locale mismatch
- metadata localization
- dates
- numbers
- currency
- pluralization
- RTL gde je relevantno
- hydration mismatch zbog locale-a

---

# 31. DATE, TIME I TIMEZONE

Aktivno traži:

- UTC/local mismatch
- browser/server timezone mismatch
- DST
- date-only values
- ISO parsing
- midnight boundaries
- locale formatting
- scheduled operations

---

# 32. SERVERLESS I VERCEL ASSUMPTIONS

Ako se aplikacija deployuje na Vercel ili sličnu infrastrukturu, proveri pretpostavke o:

- local filesystem persistence
- global memory
- long-running processes
- background jobs
- connection pooling
- function duration
- cold starts
- region
- edge/runtime compatibility
- scheduled tasks

Kod koji radi na lokalnom persistent Node procesu možda ne radi isto u serverless okruženju.

---

# 33. NODE VS EDGE RUNTIME

Ako projekat koristi više runtime-a, proveri:

- Node-only API-je
- native dependencies
- crypto
- filesystem
- database drivers
- SDK compatibility
- runtime declarations

Traži kod koji može proći typecheck/build, ali pasti tek u odgovarajućem runtime-u.

---

# 34. PRODUCTION VS DEVELOPMENT

Traži:

- localhost
- debug bypass
- development auth
- test credentials
- mock API
- fallback secrets
- filesystem assumptions
- case sensitivity
- local-only service
- production-only env
- dev-only data initialization

Klasifikuj problem kao:

- BUILD-TIME
- RUNTIME
- PRODUCTION-ONLY
- BROWSER-ONLY
- SERVER-ONLY

gde je korisno.

---

# 35. TESTOVI

Pregledaj postojeće testove.

Utvrdi:

- šta stvarno pokrivaju
- šta samo izgleda pokriveno
- critical flow-ove bez testova

Traži:

- meaningless assertions
- over-mocking
- obsolete testove
- flaky testove
- timing assumptions
- testove koji ne odgovaraju implementaciji
- snapshot abuse
- happy-path-only testove

Za Server Actions, Route Handlere i authorization posebno traži missing negative tests.

---

# 36. BUILD, TYPECHECK, LINT I TEST

Ako imaš runtime/tooling pristup, pokušaj odgovarajuće:

```text
install
lint
typecheck
test
build
```

Nemoj nasumično menjati projekat samo da bi komanda prošla.

Zabeleži:

- komandu
- rezultat
- relevantan failure

Ako nešto nisi pokrenuo:

**NOT VERIFIED**

Nemoj tvrditi da prolazi.

---

# 37. DEPENDENCIES

Pregledaj dependencies i devDependencies.

Traži:

- abandoned packages
- deprecated packages
- konkretne incompatibility probleme
- duplicated functionality
- unnecessary client-heavy dependency
- Node/runtime incompatibility
- security concern
- packages koji značajno povećavaju client bundle

Ne prijavljuj paket samo zato što nije poslednja verzija.

Upgrade mora imati razlog.

---

# 38. CI/CD

Pregledaj pipeline.

Proveri:

- install
- cache
- lint
- typecheck
- tests
- build
- migrations
- deployment
- environment
- artifacts
- concurrency
- rollback

Traži:

- deployment uprkos failing check-u
- branch mismatch
- missing build verification
- production migration race
- uncontrolled concurrent deploy
- staging/production drift

---

# 39. OBSERVABILITY

Proceni koliko bi developer mogao da dijagnostikuje production incident.

Pregledaj:

- structured logs
- error tracking
- request IDs
- correlation IDs
- audit logs
- health endpoints
- metrics
- Web Vitals telemetry
- tracing

Ne preporučuj enterprise observability stack malom projektu bez potrebe.

---

# 40. PRIVACY

Mapiraj tok ličnih podataka:

```text
browser
→ server
→ database
→ logs
→ analytics
→ third party
```

Traži:

- nepotrebno prikupljanje
- PII u logovima
- secret/sensitive data u analytics-u
- excessive client exposure
- cached private data
- third-party leakage

---

# 41. REPOSITORY-WIDE SEARCH

Aktivno pretraži kod za:

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
process.env
NEXT_PUBLIC_
localStorage
sessionStorage
cookies
headers
redirect
revalidate
admin
role
permission
userId
ownerId
tenantId
```

Nijedan rezultat nije finding sam po sebi.

Za svaki relevantan rezultat proveri:

- caller
- callee
- wrapper
- validation
- authorization
- middleware
- DB constraint
- framework behavior

---

# 42. BUSINESS INVARIANTS

Izvedi najvažnija poslovna pravila iz aplikacije.

Primer:

```text
Only owner can edit project.
```

Zatim pronađi SVE puteve kojima project može biti izmenjen.

Ako postoji:

- Server Action
- API
- admin action
- import
- webhook
- background worker

svaki mora čuvati invariant.

---

# 43. STATE MACHINES

Za entitete koji imaju status:

```text
draft
pending
active
cancelled
completed
```

izvedi state machine.

Proveri:

- dozvoljene tranzicije
- nedozvoljene tranzicije
- duplicate transitions
- concurrent transition
- impossible state
- server-side enforcement

---

# 44. FALSE-POSITIVE PREVENTION

Pre svakog P0/P1/P2 nalaza proveri najmanje:

1. isti fajl
2. parent component
3. wrapper
4. Server Action
5. Route Handler
6. middleware/proxy
7. shared validation
8. shared authorization
9. DB constraint
10. caller
11. callee
12. relevantne testove
13. framework behavior
14. infrastructure layer

Ako zaštita već postoji, ne prijavljuj problem.

---

# 45. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Affected route/feature:
File:
Function/Component:
Relevant code location:

Description:

Evidence:

Execution/Data Flow:

Why this is a problem:

Reproduction scenario:

User/Production impact:

Root cause:

Recommended remediation:

Verification after fix:

Complexity:
XS / S / M / L / XL
```

---

# 46. SEVERITY

Koristi:

## P0 - CRITICAL

- unauthorized compromise
- ozbiljan data breach
- ozbiljan data loss
- catastrophic business impact
- potpuni failure glavnog sistema

## P1 - HIGH

- ozbiljan security problem
- major production bug
- critical user flow failure
- major reliability/data-integrity problem

## P2 - MEDIUM

- realan problem ograničenijeg uticaja

## P3 - LOW

- manji bug
- maintainability problem sa realnim posledicama

## P4 - IMPROVEMENT

- opravdano unapređenje koje nije bug

---

# 47. CONFIDENCE

Za svaki finding:

```text
HIGH
MEDIUM
LOW
```

HIGH:

direktno dokazano kodom, testom ili reprodukcijom.

MEDIUM:

kod daje jak dokaz, ali runtime potvrda nedostaje.

LOW:

zavisi od produkcione konfiguracije ili konteksta koji nije dostupan.

LOW nemoj predstavljati kao činjenicu.

---

# 48. VERIFICATION STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

Ne pretvaraj theoretical rizik u confirmed bug.

---

# 49. NEMOJ AUTOMATSKI POPRAVLJATI KOD

Tokom audita:

- ne edituj fajlove
- ne menjaj dependency-je
- ne otvaraj PR
- ne refaktoriši
- ne menjaj konfiguraciju

Prvo završi audit.

Remediation radimo odvojeno.

---

# 50. OUTPUT - NEXTJS_AUDIT_REPORT.md

Finalni izveštaj strukturiraj ovako:

## 1. Executive Summary

- svrha aplikacije
- Next.js/React verzija
- architecture model
- deployment model
- opšte stanje
- najveći rizici
- najbolje implementirani delovi
- production readiness

## 2. Technology Inventory

Tabela sa:

- Next.js
- React
- Node
- TypeScript
- package manager
- database
- ORM
- auth
- state management
- deployment
- tests
- monitoring

## 3. Architecture Map

Stvarna arhitektura aplikacije.

## 4. Routing Map

Najvažnije rute, layouts i rendering model.

## 5. Server/Client Boundary Map

Najvažniji Client Component boundaries i njihov razlog.

## 6. Critical User Flows

End-to-end tokovi koje si pratio.

## 7. Rendering & Caching Matrix

Gde se može pouzdano utvrditi:

| Route | Rendering | User-specific | Cache | Revalidation | Risk |
|---|---|---|---|---|---|

## 8. Server Actions Matrix

| Action | Auth | Authorization | Validation | Transaction | Revalidation | Result |
|---|---|---|---|---|---|---|

## 9. API / Route Handler Matrix

| Route | Method | Auth | Authorization | Validation | Rate limit | Result |
|---|---|---|---|---|---|---|

## 10. Findings Summary

| ID | Severity | Category | Problem | Location | Confidence | Status |
|---|---|---|---|---|---|---|

## 11. P0 Findings

Detaljno.

## 12. P1 Findings

Detaljno.

## 13. P2 Findings

Detaljno.

## 14. P3 Findings

Detaljno.

## 15. P4 Improvements

Odvojeno od bugova.

## 16. Server Components Audit

## 17. Client Components Audit

## 18. Server Actions Audit

## 19. Routing Audit

## 20. Caching & Revalidation Audit

## 21. Authentication Audit

## 22. Authorization Audit

## 23. Security Audit

## 24. Database & Data Integrity Audit

## 25. Performance Audit

Razdvoji:

- server
- browser
- network
- assets
- database

## 26. Core Web Vitals Risks

Odvojiti code-level rizike od stvarnih merenja.

## 27. SEO Audit

## 28. Accessibility Audit

## 29. PWA Audit

Ako je relevantno.

## 30. Testing Audit

## 31. Dependency Audit

## 32. CI/CD & Deployment Audit

## 33. Vercel/Serverless Audit

Ako je relevantno.

## 34. Observability Audit

## 35. Privacy Audit

## 36. Documentation Drift

Dokumentacija naspram stvarnog koda.

## 37. Dead / Legacy / Suspicious Code

Razdvoji:

```text
CONFIRMED DEAD
LIKELY DEAD
LEGACY BUT USED
UNKNOWN
```

## 38. Production Readiness Checklist

Koristi:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Za najmanje:

- clean install
- lint
- typecheck
- tests
- production build
- routes
- Server Components
- Client Components
- Server Actions
- caching
- auth
- authorization
- validation
- database
- migrations
- security
- secrets
- error handling
- external APIs
- performance
- Core Web Vitals
- accessibility
- SEO
- responsive UI
- PWA
- logging
- monitoring
- CI
- deployment
- rollback

## 39. Top Problems by Risk

Najvažniji problemi bez obzira na težinu popravke.

## 40. Top Problems by ROI

Najveći odnos:

```text
impact / effort
```

## 41. Remediation Roadmap

### Phase 0 - Emergency

P0.

### Phase 1 - Before Production

P1.

### Phase 2 - Stabilization

P2.

### Phase 3 - Quality

P3.

### Phase 4 - Optimization

P4 i performance improvements.

Navedi dependency između popravki.

## 42. Things Done Well

Dokumentuj kvalitetne delove koje ne treba nepotrebno menjati.

## 43. Unknown / Not Verified

Sve što nije moglo biti provereno zbog:

- produkcione infrastrukture
- secrets
- DB pristupa
- runtime-a
- provider naloga
- analytics podataka
- monitoring podataka
- real-user metrics

---

# 51. FINAL NEXT.JS SECOND PASS

Kada završiš prvi audit, uradi drugi prolaz.

Ne čitaj projekat ponovo samo direktorijum po direktorijum.

Promeni perspektivu.

## Security pass

Pitaj:

> Ako sam authenticated korisnik bez posebnih privilegija, koje server operacije mogu pokušati da pozovem direktno?

## Cache pass

Pitaj:

> Koji podatak korisnik može promeniti, a zatim i dalje dobiti njegovu staru verziju?

I:

> Može li cache ikada vratiti podatak pogrešnom korisniku?

## Server/Client pass

Pitaj:

> Koji podatak ili kod prelazi server/client granicu iako ne mora?

## Performance pass

Pitaj:

> Koji request ili render trenutno blokira nešto što ne mora da čeka?

## Failure pass

Pitaj:

> Šta će se dogoditi ako DB, API ili provider timeout-uje tačno između dva koraka business operacije?

## Concurrent-user pass

Pitaj:

> Šta se događa ako dva request-a menjaju isti resource gotovo istovremeno?

## Production pass

Pitaj:

> Šta trenutno radi lokalno samo zahvaljujući persistent procesu, lokalnom filesystemu ili development konfiguraciji?

## User pass

Pitaj:

> Šta se događa ako korisnik klikne dva puta, refreshuje, koristi Back, otvori dva taba ili direktno promeni URL?

Sve nove potvrđene probleme dodaj u glavni audit.

---

# 52. FINAL QUALITY GATE

Pre završetka proveri:

- svaki P0/P1 ima konkretan evidence
- svaki security finding je proverio server-side zaštite
- svaki cache finding odgovara stvarnoj Next.js verziji
- nisi pomešao Server i Client Component semantiku
- nisi koristio zastarele framework pretpostavke
- theoretical findings nisu predstavljeni kao confirmed
- nema duplicate findings sa istim root cause-om
- svaki performance problem ima konkretan bottleneck
- nisi tvrdio Core Web Vitals rezultate bez merenja
- nisi tvrdio da test/build prolaze ako ih nisi izvršio
- improvements su odvojeni od bugova
- preporučeni remediation rešava root cause
- dokumentacija je proverena protiv koda
- produkcioni rizici su odvojeni od lokalnih development problema

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Next.js projekat izgleda dobro. Preporučujem više Server Components, bolji caching i dodatne testove.

To nije audit.

Želim da utvrdiš:

- šta projekat zaista radi
- gde se izvršava svaki važan deo
- gde su trust boundaries
- šta se izvršava na serveru
- šta se šalje browseru
- kako se podaci učitavaju
- kako se menjaju
- kako se cache invalidira
- kako su operacije zaštićene
- šta se događa pod failure-om
- šta može poći po zlu tek u produkciji

Svaki ozbiljan zaključak mora imati dokaz u:

- kodu
- konfiguraciji
- testu
- dependency/runtime semantici
- ili jasno rekonstruisanom execution flow-u

Ako dokaz nije dovoljan:

**NOT VERIFIED.**

Bolje je pronaći **8 stvarnih Next.js problema** nego napisati **80 generičkih best practices**.

Ponašaj se kao poslednja tehnička kontrola pre ozbiljnog production deployment-a.
