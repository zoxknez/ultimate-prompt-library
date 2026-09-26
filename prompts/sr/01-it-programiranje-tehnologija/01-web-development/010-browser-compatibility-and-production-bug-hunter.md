---
id: UPL-IT-010
number: 10
slug: browser-compatibility-and-production-bug-hunter
title: Browser Compatibility & Production Bug Hunter
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# BROWSER COMPATIBILITY AND PRODUCTION BUG HUNTER

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu problema koji se mogu pojaviti samo:

- u određenim browserima
- na određenim operativnim sistemima
- na određenim uređajima
- u produkcionom buildu
- na CDN-u
- u serverless runtime-u
- pri drugačijoj locale/timezone konfiguraciji
- pri sporijoj mreži
- pri drugačijem filesystem ponašanju
- pri minifikaciji
- pri tree shaking-u
- pri različitim JavaScript/Web API implementacijama

Glavni cilj:

> Pronaći realne cross-browser, cross-platform i production-only probleme koje lokalni development environment može sakriti.

Ovo nije:

- generički browser support checklist
- lista zastarelih browsera
- preporuka da se podrži svaki browser koji postoji
- automatsko dodavanje polyfill-a
- površna analiza `caniuse` tabela
- običan frontend code review
- generalni production-readiness audit

Fokus je na bugovima koji nastaju zbog razlike između:

```text
development
vs
production
```

ili:

```text
browser A
vs
browser B
```

ili:

```text
OS A
vs
OS B
```

Prioritet:

**reproducibility > user impact > evidence > breadth**

Bolje je pronaći 8 stvarnih production/browser bugova nego 80 teorijskih compatibility rizika.

---

# 1. UTVRDI TARGET OKRUŽENJA

Pre analize utvrdi:

- podržane browsere
- minimalne verzije ako su definisane
- desktop/mobile scope
- podržane OS-eve
- SSR/CSR model
- build target
- bundler
- transpilation
- polyfills
- deployment platformu
- Node/runtime verziju
- Edge runtime ako postoji
- serverless/function runtime
- CDN
- proxy
- filesystem assumptions

Pregledaj:

- `package.json`
- browserslist
- build config
- Babel config
- TypeScript target
- PostCSS
- CSS tooling
- framework config
- deployment config
- Dockerfile
- CI
- environment config

Ako target browseri nisu dokumentovani:

**SUPPORTED BROWSER MATRIX: NOT DEFINED**

Nemoj automatski pretpostaviti podršku za legacy browsere.

---

# 2. NAPRAVI ENVIRONMENT MATRIX

Klasifikuj relevantna okruženja.

Na primer:

| Layer | Variant |
|---|---|
| Browser | Chrome |
| Browser | Firefox |
| Browser | Safari |
| Browser | Edge |
| OS | Windows |
| OS | macOS |
| OS | Linux |
| Mobile | iOS Safari |
| Mobile | Android Chrome |
| Runtime | Node |
| Runtime | Edge |
| Environment | Development |
| Environment | Production |

Ne uključuj platforme koje nisu relevantne proizvodu.

---

# 3. DEVELOPMENT VS PRODUCTION

Pronađi sve razlike između dev i prod režima.

Mapiraj:

```text
Development
↓
bundler/dev server
↓
source code
↓
runtime
```

naspram:

```text
Production
↓
optimized build
↓
minification
↓
tree shaking
↓
chunking
↓
CDN/server
```

Traži probleme koji se mogu pojaviti tek u drugom toku.

---

# 4. ENVIRONMENT GUARDS

Pretraži:

```text
NODE_ENV
development
production
localhost
127.0.0.1
```

Za svaki relevantan branch proveri:

- da li produkcija dobija drugačiju logiku
- da li dev bypass ostaje aktivan
- da li fallback radi samo lokalno

---

# 5. LOCALHOST ASSUMPTIONS

Traži hardcoded:

```text
localhost
127.0.0.1
http://localhost
```

Proveri:

- API URL
- WebSocket URL
- callback URL
- OAuth redirect
- image host
- CORS
- webhook references

---

# 6. HTTP VS HTTPS

Development često radi preko HTTP-a.

Production obično koristi HTTPS.

Proveri API-je koji zahtevaju secure context:

- service worker
- clipboard
- camera
- microphone
- geolocation
- credentials behavior

---

# 7. MIXED CONTENT

Traži production HTTPS page koja poziva:

```text
http://
```

resource.

Browser može blokirati:

- API
- images
- scripts
- media

u zavisnosti od tipa.

---

# 8. SECURE COOKIES

Cookie sa:

```text
Secure
```

se ponaša drugačije na lokalnom HTTP environment-u.

Proveri dev/prod konfiguraciju.

---

# 9. COOKIE DOMAIN

Traži razlike:

```text
localhost
app.example.com
www.example.com
api.example.com
```

Proveri:

- domain
- path
- SameSite
- Secure

---

# 10. SAME-SITE BEHAVIOR

Auth koji radi lokalno može pasti kada frontend/backend završe na različitim originima.

Prati:

```text
frontend
↓
cross-origin request
↓
cookie
↓
CORS
```

---

# 11. CORS

Development proxy može sakriti CORS problem.

Proveri production direktne request-ove.

Traži:

- `*` + credentials conflict
- missing allowed origin
- preview domain
- localhost-only config

---

# 12. DEV PROXY

Ako dev server proxy-uje:

```text
/api
→ localhost:3001
```

proveri kako production rešava isti route.

---

# 13. ORIGIN ASSUMPTIONS

Traži:

```ts
window.location.origin
```

ili hardcoded origin logic.

Proveri:

- proxy
- custom domain
- preview deployment
- reverse proxy

---

# 14. FORWARDED HEADERS

Ako app radi iza proxy/CDN-a, proveri korišćenje:

- `X-Forwarded-For`
- `X-Forwarded-Proto`
- host headers

Nemoj verovati njima bez odgovarajućeg infrastructure konteksta.

---

# 15. BASE URL GENERATION

Proveri URL generisanje za:

- canonical
- OAuth
- emails
- API
- assets

Production host možda nije isti kao request host iza proxy-ja.

---

# 16. BUILD-TIME VS RUNTIME ENV

Razlikuj env varijable dostupne:

- tokom build-a
- tokom server runtime-a
- u browseru

Traži:

```text
env changed after build
↓
frontend bundle still has old value
```

---

# 17. CLIENT ENV EXPOSURE

Proveri da server-only secret nije ubačen u browser bundle kroz javni env prefix ili build-time replacement.

Ako pronađeš secret:

- ne prikazuj punu vrednost
- maskiraj ga

---

# 18. MISSING ENV

Development `.env.local` može sakriti production missing env.

Proveri startup validation.

---

# 19. FALLBACK CONFIG

Traži:

```ts
process.env.API_URL || "http://localhost:3000"
```

U production-u missing env može tiho prebaciti app na pogrešan endpoint.

---

# 20. CASE SENSITIVITY

Windows filesystem je često case-insensitive.

Linux deployment je često case-sensitive.

Traži:

```ts
import Button from "./button"
```

dok fajl glasi:

```text
Button.tsx
```

Ovo može raditi lokalno na Windows-u i pasti na Linux-u.

---

# 21. IMPORT CASE AUDIT

Repository-wide proveri casing za:

- paths
- files
- directories
- static assets

---

# 22. STATIC ASSET CASE

Posebno:

```text
/Logo.png
```

vs stvarni:

```text
/logo.png
```

---

# 23. PATH SEPARATORS

Traži Windows-specific:

```text
C:\folder\file
```

ili ručno spajanje sa:

```text
"\\"
```

Umesto platform-aware path handling-a na serveru.

---

# 24. UNIX PATH ASSUMPTIONS

I obrnuto:

```text
/tmp/file
```

može biti validno samo u određenom runtime-u.

---

# 25. FILESYSTEM PERSISTENCE

Local development filesystem je persistent.

Serverless filesystem često nije.

Traži:

```text
write file
↓
expect file later
```

u produkcionom request flow-u.

---

# 26. TEMP DIRECTORY

Ako runtime omogućava samo privremeni filesystem, proveri da aplikacija ne očekuje permanent storage.

---

# 27. CURRENT WORKING DIRECTORY

Traži code koji pretpostavlja određeni `cwd`.

Build/deploy može koristiti drugi working directory.

---

# 28. FILE PERMISSIONS

Development user može imati više prava nego production runtime.

Proveri:

- read
- write
- execute

---

# 29. EXECUTABLE ASSUMPTIONS

Traži pozive:

```text
ffmpeg
python
bash
sh
cmd.exe
powershell
```

Proveri da binary stvarno postoji u production environment-u.

---

# 30. SHELL DIFFERENCES

Komanda koja radi u:

```text
bash
```

ne mora raditi u:

```text
cmd.exe
```

i obrnuto.

---

# 31. `npm` SCRIPT CROSS-PLATFORM

Pregledaj scripts za:

```text
VAR=value command
rm -rf
cp
mv
```

koji mogu biti Unix-specific.

Ako projekat targetira Windows developere, proceni problem.

---

# 32. LINE ENDINGS

CRLF/LF problemi su ređi, ali relevantni za:

- shell scripts
- generated files
- parsers

Prijavi samo konkretan problem.

---

# 33. FILE ENCODING

Proveri assumptions o UTF-8.

Posebno:

- CSV
- legacy files
- Windows-generated content

---

# 34. UNICODE

Testiraj:

- č
- ć
- š
- ž
- đ
- emoji
- CJK
- combining characters

gde user input ili filenames mogu sadržati Unicode.

---

# 35. UNICODE NORMALIZATION

Dve vizuelno iste vrednosti mogu imati različite Unicode reprezentacije.

Relevantno za:

- usernames
- filenames
- search
- unique constraints

Ne prijavljuj ako domen nema takve podatke.

---

# 36. LOCALE

Browser/server locale može biti različit.

Traži:

```ts
toLocaleString()
```

bez eksplicitnog locale-a kada deterministic output treba da bude isti.

---

# 37. SERVER VS CLIENT LOCALE

SSR scenario:

```text
server locale = en-US
client locale = sr-RS
```

može izazvati različit prvi render.

---

# 38. NUMBER FORMAT

Proveri:

```text
1,234.56
```

vs:

```text
1.234,56
```

Posebno ako formatted string kasnije pokušava da se parsira.

---

# 39. DECIMAL SEPARATOR

Nikad ne tretiraj lokalizovani display string kao stabilan machine format.

---

# 40. DATE PARSING

Browseri i runtime-i mogu različito tretirati ne-standardne date stringove.

Traži:

```ts
new Date("25/09/2026")
```

ili druge ne-ISO formate.

---

# 41. ISO DATE

Razlikuj:

```text
2026-09-25
```

i:

```text
2026-09-25T00:00:00Z
```

Posebno server/browser timezone.

---

# 42. TIMEZONE

Development i production server mogu koristiti različite timezone-e.

Traži implicitno:

```ts
new Date()
getHours()
setDate()
```

u business logici.

---

# 43. DST

Ako scheduling ili dates prelaze daylight saving transition, proveri edge scenario.

---

# 44. CURRENT DATE U BUILD-U

SSG/build code koji koristi:

```ts
new Date()
```

može zamrznuti vrednost na build time umesto request time.

---

# 45. RANDOM U BUILD-U

Isto za:

```ts
Math.random()
```

u pre-rendered output-u.

---

# 46. NODE VERSION

Proveri:

- local Node version
- engines
- CI version
- production runtime

Version drift može izazvati različito ponašanje.

---

# 47. PACKAGE MANAGER VERSION

Lockfile može zavisiti od:

- npm
- pnpm
- yarn

verzije.

Proveri CI/prod consistency.

---

# 48. LOCKFILE

Production install treba da koristi očekivani lockfile.

Traži:

- više lockfile-ova
- ignored lockfile
- install bez frozen lock

---

# 49. OPTIONAL DEPENDENCIES

Native/optional dependency može biti instalirana na jednom OS-u, a ne na drugom.

---

# 50. NATIVE MODULES

Posebno proveri:

- image processing
- SQLite
- crypto
- canvas
- sharp-like packages

za OS/runtime compatibility.

---

# 51. CPU ARCHITECTURE

Ako deployment ili desktop environment koristi:

- x64
- ARM64

proveri native binaries.

Ne prijavljuj ako nema native dependencies.

---

# 52. BROWSER API SUPPORT

Repository-wide pronađi modernije API-je.

Na primer:

- Clipboard
- Web Share
- ResizeObserver
- IntersectionObserver
- BroadcastChannel
- Web Locks
- File System Access
- Notification
- Web Bluetooth
- WebUSB

Za svaki relevantan API proveri target support i fallback.

---

# 53. FEATURE DETECTION

Preferiraj:

```ts
if ("share" in navigator)
```

u odnosu na rigid user-agent assumptions gde je moguće.

---

# 54. USER-AGENT SNIFFING

Pretraži:

```text
userAgent
navigator.userAgent
```

Proveri:

- šta pokušava da detektuje
- da li parser može zastareti
- postoji li feature detection alternativa

---

# 55. SAFARI

Posebno pregledaj funkcije koje istorijski imaju browser-specific behavior, ali ne prijavljuj generički "Safari bug".

Potrebna je konkretna API/CSS semantika.

---

# 56. IOS SAFARI

Proveri gde je relevantno:

- viewport
- fixed positioning
- input
- PWA standalone
- video
- autoplay
- file input
- safe areas

---

# 57. FIREFOX

Proveri konkretne web API/CSS razlike samo gde projekat koristi relevantnu funkciju.

---

# 58. EDGE

Moderni Edge deli Chromium bazu, ali enterprise/security konfiguracije mogu biti drugačije.

Ne tretiraj ga kao potpuno odvojen engine bez razloga.

---

# 59. WEBKIT PREFIX

Traži vendor-specific CSS.

Proveri da li fallback postoji gde je potreban.

---

# 60. CSS SUPPORT

Pronađi modernije CSS funkcije:

- container queries
- subgrid
- `:has`
- `dvh`
- `color-mix`
- nesting

Proveri target browser support pre finding-a.

---

# 61. CSS FALLBACK

Ako unsupported CSS samo degradira estetiku bez blokiranja funkcije, severity treba biti nizak.

---

# 62. FLEXBOX EDGE CASES

Testiraj:

- min-content
- overflow
- percentage height
- nested flex

samo ako code structure sugeriše realan issue.

---

# 63. GRID EDGE CASES

Isto za CSS Grid.

---

# 64. FORM CONTROLS

Native form controls izgledaju i ponašaju se različito po browserima.

Proveri custom styling za:

- select
- date
- number
- checkbox
- radio

---

# 65. DATE INPUT

`input type="date"` UI i support nisu identični svuda.

Ne oslanjaj business logic na vizuelni picker.

---

# 66. NUMBER INPUT

Browseri mogu različito tretirati:

- decimal input
- spinner
- invalid text
- locale keyboard

Server validation ostaje obavezna.

---

# 67. FILE INPUT

Proveri:

- accept
- multiple
- camera capture
- mobile behavior

---

# 68. CAMERA / MEDIA

Ako app koristi `getUserMedia`, proveri:

- permissions
- secure context
- device availability
- browser support

---

# 69. CLIPBOARD

Ako koristi Clipboard API, proveri:

- permissions
- secure context
- fallback

---

# 70. DOWNLOADS

`download` attribute i blob URL behavior mogu imati platform razlike.

Proveri ako je download critical feature.

---

# 71. BLOB URL

Proveri lifecycle:

```text
createObjectURL
↓
download/preview
↓
revokeObjectURL
```

---

# 72. FILESYSTEM ACCESS API

Ako app zavisi od browser file system API-ja, proveri fallback za nepodržane browsere.

---

# 73. WEB SHARE

Isto za Web Share.

---

# 74. NOTIFICATIONS

Permission model se razlikuje po platformi.

Ne pretpostavljaj identičan desktop/mobile flow.

---

# 75. PUSH

Web push support zavisi od browser/platform kombinacije.

Ako feature postoji, napravi stvarnu matrix analizu.

---

# 76. SERVICE WORKER

Service worker support sam po sebi nije dovoljan.

Proveri platform-specific capability koji app koristi.

---

# 77. INDEXEDDB

Ako app zavisi od IndexedDB, proveri:

- private mode
- quota errors
- schema migration

Ne tvrdi univerzalno behavior bez runtime testa.

---

# 78. LOCALSTORAGE

Može baciti grešku ili biti ograničen u nekim privacy kontekstima.

Ako je critical, proveri error path.

---

# 79. THIRD-PARTY COOKIES

Ako integration zavisi od third-party cookies, moderni privacy modeli browsera mogu ga polomiti.

Prati konkretan flow.

---

# 80. OAUTH POPUP

Popup flow može pasti zbog:

- popup blockers
- cross-origin restrictions
- mobile browser behavior

Proveri fallback redirect flow gde je potreban.

---

# 81. POPUP BLOCKERS

`window.open` obično mora biti vezan za user gesture.

Ako se poziva posle async delay-a, proveri da li browser može blokirati popup.

---

# 82. NEW TAB

Proveri `target="_blank"` behavior gde security/UX zavisi od opener-a.

Detaljni security deo pripada security auditu.

---

# 83. HISTORY API

SPA routing može različito reagovati na:

- direct refresh
- server fallback
- static hosting

---

# 84. DIRECT ROUTE REFRESH

Klasičan production bug:

```text
client navigation /dashboard works
↓
hard refresh /dashboard
↓
server returns 404
```

ako hosting nije konfigurisan za SPA fallback.

---

# 85. STATIC HOSTING

Ako app koristi client router na static host-u, proveri rewrite config.

---

# 86. BASE PATH

Ako app nije hostovana na root-u:

```text
/app/
```

proveri:

- assets
- router
- links
- service worker
- manifest

---

# 87. TRAILING SLASH

Hosting/platform behavior može razlikovati:

```text
/page
/page/
```

Proveri consistency.

---

# 88. CDN

CDN može cache-irati drugačije od local dev servera.

Mapiraj:

- HTML
- static assets
- API
- redirects
- error responses

---

# 89. CACHED HTML

Stari HTML + novi asset manifest može napraviti version mismatch.

---

# 90. CDN QUERY PARAMS

Proveri da cache key pravilno tretira query parametre koji menjaju sadržaj.

---

# 91. `Vary`

Ako response zavisi od:

- Accept-Encoding
- locale
- auth
- device

proveri caching semantiku gde je relevantno.

---

# 92. PROXY COMPRESSION

Ne dodaj manual compression ako proxy/CDN već radi.

Ali proveri double compression ili header mismatch ako postoji.

---

# 93. MINIFICATION

Production minification može razotkriti kod koji zavisi od:

- function name
- class name
- source formatting

Traži reflection-like patterns.

---

# 94. FUNCTION NAME DEPENDENCY

Primer:

```ts
fn.name === "SomeHandler"
```

može postati problem nakon minification-a.

Proveri bundler behavior.

---

# 95. CLASS NAME DEPENDENCY

Slično ako business logic zavisi od `constructor.name`.

---

# 96. TREE SHAKING

Side-effect import može biti uklonjen ako package metadata pogrešno označava side effects.

Proveri samo gde postoji konkretan runtime symptom/risk.

---

# 97. MODULE INITIALIZATION ORDER

Circular dependencies mogu se manifestovati različito posle bundling optimizacija.

---

# 98. ESM VS CJS

Proveri compatibility:

- default import
- named import
- `require`
- `import`

Posebno Node/runtime verziju.

---

# 99. DYNAMIC IMPORT

Path koji bundler ne može statički analizirati može raditi u dev-u, a failovati u production build-u.

---

# 100. CASE-SENSITIVE DYNAMIC IMPORT

Posebno proveri path casing.

---

# 101. SOURCE MAP

Ako source map behavior utiče na security ili debugging, dokumentuj.

Ne tretiraj public source maps automatski kao kritičan security bug bez konteksta.

---

# 102. PRODUCTION ERROR HANDLING

Development overlay može sakriti činjenicu da production user dobija prazan ekran.

Proveri global error boundary.

---

# 103. CHUNK LOAD FAILURE

Production code splitting može dati:

```text
old page
↓
new deployment
↓
old chunk removed
↓
dynamic import
↓
ChunkLoadError
```

Proveri recovery.

---

# 104. RELOAD LOOP

Ako chunk failure automatski radi reload, proveri da ne može nastati beskonačna reload petlja.

---

# 105. LAZY ROUTES

Proveri šta user vidi ako lazy chunk ne uspe da se učita.

---

# 106. NETWORK SPEED

Fast localhost može sakriti:

- loading race
- timeout
- skeleton issue
- request ordering

Testiraj mentalno ili runtime sporu mrežu.

---

# 107. NETWORK LOSS

Production user može izgubiti vezu usred request-a.

Proveri critical mutation flow.

---

# 108. DNS / PROVIDER FAILURE

Ne svaki failure treba da se analizira u ovom promptu, ali browser-side behavior mora ostati smislen kada endpoint nije dostupan.

---

# 109. FIREWALL / CORPORATE NETWORK

Ako app zavisi od non-standard port-a, WebSocket-a ili external domain-a, corporate network može ga blokirati.

Prijavi samo ako proizvod targetira takva okruženja ili feature nema fallback.

---

# 110. WEBSOCKETS

Proveri:

- proxy support
- secure `wss`
- reconnect
- fallback

---

# 111. SSE

Ako koristi Server-Sent Events, proveri:

- proxy buffering
- timeout
- browser connection limits gde je relevantno

---

# 112. LONG POLLING

Proveri timeout i proxy behavior.

---

# 113. KEEPALIVE

Browser limits za `fetch(..., { keepalive: true })` i unload scenarios mogu uticati na analytics/save behavior.

Ne oslanjaj critical data persistence na page unload request bez analize.

---

# 114. `beforeunload`

Browser behavior i UX restrictions mogu varirati.

Ako app zavisi od custom poruke, proveri stvarnu podršku.

---

# 115. PAGE LIFECYCLE

Mobile browser može suspendovati ili ubiti tab.

Proveri critical state koji postoji samo u memory-ju.

---

# 116. BACK-FORWARD CACHE

BFCache može vratiti staro page stanje bez punog reload-a.

Ako app ima auth/session-sensitive UI, proveri da li restore flow osvežava potrebno stanje.

---

# 117. `pageshow`

Ako postoji specifičan BFCache handling, proveri ga.

---

# 118. MOBILE MEMORY PRESSURE

Mobile browser može agresivnije odbacivati tab/state.

Ako user draft postoji samo u memory-ju, proceni rizik prema proizvodu.

---

# 119. APP BACKGROUNDING

Scenario:

```text
user starts action
↓
switches app
↓
browser suspends page
↓
returns later
```

Proveri:

- stale data
- timer assumptions
- auth expiry

---

# 120. TIMERS U BACKGROUND TAB-U

Browseri throttluju timers.

Ne oslanjaj critical scheduling na tačan client-side interval.

---

# 121. `setInterval` AS CLOCK

Ako app koristi interval kao authoritative countdown, proveri drift posle background-a.

---

# 122. VISIBILITY API

Ako app ima realtime/polling, proveri da li background behavior ima smisla.

---

# 123. SCREEN SIZE VS DEVICE TYPE

Ne pretpostavljaj:

```text
small width = mobile device
```

Tablet, split-screen i desktop resize mogu imati isti viewport.

---

# 124. INPUT MODE

Ne pretpostavljaj:

```text
desktop = mouse
mobile = touch
```

Hibridni uređaji postoje.

---

# 125. POINTER EVENTS

Ako koristi pointer/mouse/touch events, proveri duplicate handling.

Primer:

```text
touchend
+
click
```

može izazvati dvostruku akciju u lošoj implementaciji.

---

# 126. PASSIVE LISTENERS

Scroll/touch listener behavior može uticati na performance i `preventDefault`.

Prijavi samo konkretan problem.

---

# 127. KEYBOARD LAYOUT

Hotkeys zasnovani na karakteru mogu se ponašati drugačije na različitim keyboard layout-ima.

Relevantno za power-user aplikacije.

---

# 128. IME

Za search/input proveri East Asian Input Method Editor scenario ako app radi agresivne `keydown` ili live-search operacije.

Ne prijavljuj ako target audience ne zahteva.

---

# 129. COMPOSITION EVENTS

Ako Enter automatski šalje formu/message, proveri da ne prekida IME composition.

---

# 130. COPY/PASTE

Custom clipboard behavior može pasti zbog browser permissions.

Obezbedi fallback gde je critical.

---

# 131. DRAG AND DROP

Browser/platform differences za:

- files
- touch
- dataTransfer

Proveri critical alternative.

---

# 132. DOWNLOAD FILENAME

Filesystem/browser može sanitizovati filename različito.

Ne oslanjaj business logic na exact saved filename.

---

# 133. CONTENT DISPOSITION

Server download filename treba proveriti za Unicode i browser compatibility gde je relevantno.

---

# 134. MIME TYPES

Production server/CDN može servirati pogrešan MIME i browser strožije blokirati resource.

Proveri:

- JS
- CSS
- WASM
- fonts

---

# 135. NOSNIFF

Ako postoji `X-Content-Type-Options: nosniff`, pogrešan MIME postaje vidljiv production bug.

---

# 136. FONT CORS

Web font sa drugog origin-a može zahtevati pravilne CORS headers.

---

# 137. IMAGE DOMAIN

Production image optimizer može blokirati host koji localhost development ne koristi.

---

# 138. REMOTE ASSETS

Proveri whitelist/domain config.

---

# 139. CSP

Development često nema istu CSP politiku kao production.

Inline script/style koji radi lokalno može biti blokiran u produkciji.

Ako CSP postoji, prati konkretan resource.

---

# 140. NONCE / HASH

Ako framework koristi CSP nonce, proveri SSR/streaming kompatibilnost.

Detaljni CSP audit pripada security auditu.

---

# 141. AD BLOCKERS

Ako app critical functionality zavisi od endpoint-a sa imenima poput:

```text
/analytics
/ads
/tracker
```

ad blocker može ga blokirati.

Prijavi samo ako critical product feature zaista zavisi od njega.

---

# 142. PRIVACY EXTENSIONS

Slično za third-party storage/cookies.

---

# 143. JAVASCRIPT DISABLED

Nemoj zahtevati da moderna aplikacija radi potpuno bez JS-a ako proizvod to ne zahteva.

Ali proveri public content/SEO ako je relevantno.

---

# 144. BROWSER EXTENSIONS

Ne pokušavaj podržati arbitrary extension interference.

Ali critical app ne treba lako da se sruši zbog injected DOM elemenata ako postoji konkretan known scenario.

---

# 145. AUTOMATIC TRANSLATION

Browser translation može promeniti text nodes.

Ako app zavisi od exact visible text za selectors/business logic, to je architectural smell.

---

# 146. PASSWORD MANAGERS

Form DOM treba da bude dovoljno standardan da password manager/autofill radi gde je relevantno.

---

# 147. AUTOFILL

Autofill može promeniti input bez očekivanih synthetic event pretpostavki u nekim implementacijama.

Testiraj auth/checkout forme ako su critical.

---

# 148. PRINT

Samo ako print/export predstavlja feature.

Ako nije:

**NOT APPLICABLE**

---

# 149. PDF GENERATION

Ako PDF generacija zavisi od browser rendera, proveri browser-specific layout ako je feature kritičan.

---

# 150. BROWSER EXTENSION API

Ako je proizvod browser extension, ovaj audit mora posebno obuhvatiti:

- Chromium
- Firefox
- manifest version
- permissions

Ako nije:

**NOT APPLICABLE**

---

# 151. WEBASSEMBLY

Ako postoji WASM, proveri:

- MIME
- browser support
- thread/SIMD requirements
- cross-origin isolation

---

# 152. SHAREDARRAYBUFFER

Ako se koristi, proveri required security headers i browser support.

---

# 153. CROSS-ORIGIN ISOLATION

COOP/COEP može uticati na third-party resources.

---

# 154. FEATURE FLAGS

Production flag config može biti potpuno različit od local dev-a.

Mapiraj critical feature flagove.

---

# 155. STALE FEATURE FLAG

Ako client cache-ira flag, proveri koliko dugo može ostati na starom ponašanju.

---

# 156. BUILD FLAGS

Build-time flag zahteva novi deployment da bi se promenio.

Ne tretiraj ga kao runtime config.

---

# 157. PREVIEW ENVIRONMENT

Preview deployment često ima:

- drugi domain
- drugu auth konfiguraciju
- drugi API
- drugačiji robots/CORS

Ne koristi preview PASS kao dokaz production PASS.

---

# 158. STAGING DRIFT

Uporedi konfiguraciju:

```text
development
staging
production
```

Traži razliku koja utiče na behavior.

---

# 159. PROD DATA SHAPE

Dev fixture može biti idealan.

Production podaci mogu sadržati:

- null
- long text
- Unicode
- huge arrays
- old schema values

Ovo je production compatibility problem čak i ako nije browser-specific.

---

# 160. LEGACY DATA

Kod može biti kompatibilan samo sa novim records.

Proveri migration/backward compatibility.

---

# 161. OLD CLIENT

Korisnik može držati stari tab otvoren tokom novog deployment-a.

Proveri frontend/backend contract compatibility.

---

# 162. OLD SERVICE WORKER

Ako postoji PWA, detaljno ga prepusti posebnom PWA auditu, ali prijavi cross-version compatibility finding ako utiče na production-only behavior.

---

# 163. DATABASE CONNECTION RUNTIME

Ako server code ide iz local persistent Node-a u serverless, connection behavior može biti drugačiji.

---

# 164. GLOBAL MEMORY

Traži:

```ts
const cache = new Map()
```

kao source of truth na serveru.

U serverless/multi-instance production-u nije globalno konzistentan.

---

# 165. SINGLE INSTANCE ASSUMPTION

Development ima jedan server process.

Production može imati više instanci.

Traži in-memory:

- locks
- counters
- rate limits
- sessions
- queues

---

# 166. LOCAL LOCK

In-memory mutex ne štiti više production instanci.

Ako postoji critical concurrency path, prijavi.

---

# 167. CRON DUPLICATION

Ako svaki instance startup registruje job, production scaling može pokrenuti isti job više puta.

---

# 168. BACKGROUND WORK

Serverless function može završiti pre fire-and-forget task-a.

Traži:

```ts
sendResponse()
doAsyncWorkWithoutAwait()
```

ili slične obrasce.

---

# 169. TIMEOUT

Local server nema isti request timeout kao production platforma.

Pronađi long-running operations.

---

# 170. PAYLOAD LIMITS

Platforma može imati body/upload limit.

Ako app šalje velike fajlove, proveri deployment limit ako je dostupan.

Ne izmišljaj brojeve.

---

# 171. RESPONSE LIMITS

Isto za velike responses.

---

# 172. EDGE RUNTIME

Ako route radi na Edge-u, proveri:

- Node APIs
- filesystem
- native packages
- database drivers

---

# 173. NODE-ONLY PACKAGE

Package može buildovati, ali failovati u Edge runtime-u.

---

# 174. SERVER ACTION / FUNCTION REGION

Ako data store i compute region nisu blizu, production latency može biti drugačija.

Ovo je performance risk, ne compatibility bug, osim ako timeouts uzrokuju failure.

---

# 175. DNS / CUSTOM DOMAIN

Ako app zavisi od host header-a ili domain routing-a, custom domain treba proveriti odvojeno od platform preview URL-a.

---

# 176. EMAIL LINKS

Generated email link treba da vodi na production domain, ne localhost/preview.

---

# 177. WEBHOOK CALLBACK

Isto za webhook/public callback URL.

---

# 178. OAUTH CALLBACK

Provider često ima exact redirect allowlist.

Local callback koji radi nije dokaz production callback-a.

---

# 179. CSP REPORTING

Ako production-only CSP report/restriction postoji, proveri da ga staging testira gde je moguće.

---

# 180. LOGGING

Production logging može serializovati objekte drugačije ili biti disabled.

Proveri da critical error handling ne zavisi od `console.log`.

---

# 181. ERROR MASKING

Production često skriva stack trace.

UI ne sme zavisiti od parsing-a development error text-a.

---

# 182. SOURCE MAP STACK

Ako observability zavisi od source maps, proveri upload/deployment pipeline.

---

# 183. RUNTIME FEATURE DETECTION

Za svaki optional browser API proveri:

```text
supported
↓
normal path

unsupported
↓
fallback
```

---

# 184. POLYFILLS

Mapiraj polyfill strategiju.

Traži:

- missing polyfill za target browser
- global polyfill koji pravi conflict
- legacy polyfill koji više nije potreban i značajno opterećuje bundle

Ne prijavljuj package samo zato što je star.

---

# 185. TRANSPILATION TARGET

Proveri da output syntax odgovara browser target-u.

Ako build generiše syntax koju target browser ne razume, to je ozbiljan compatibility problem.

---

# 186. THIRD-PARTY PACKAGE BROWSER SUPPORT

Neke dependencies mogu odustati od starijih browsera pre aplikacije.

Ako projekat obećava određeni support, proveri dependency compatibility.

---

# 187. CSS AUTOPREFIXER

Ako projekat cilja browser koji zahteva prefix, proveri PostCSS/autoprefixer konfiguraciju.

Ne dodaj ručne prefikse ako tooling već rešava.

---

# 188. JS FEATURE SUPPORT

Posebno proveri syntax/API razliku.

Transpiler može rešiti syntax:

```text
optional chaining
```

ali ne mora rešiti runtime API:

```text
structuredClone
```

---

# 189. `structuredClone`

Ako se koristi, proveri browser target ili fallback.

---

# 190. `crypto.randomUUID`

Isto.

---

# 191. `Intl`

Napredni Intl API-ji možda imaju različitu podršku.

Relevantno za:

- Segmenter
- DisplayNames
- RelativeTimeFormat

---

# 192. `URLPattern`

Proveri support ako postoji.

---

# 193. OBSERVERS

Proveri:

- IntersectionObserver
- ResizeObserver
- MutationObserver

samo prema target browserima.

---

# 194. DIALOG ELEMENT

Ako se koristi native `<dialog>`, proveri target support i library/polyfill strategiju ako je potreban.

---

# 195. POPOVER API

Isto za novi native Popover API.

---

# 196. VIEW TRANSITIONS

Ako feature zavisi od View Transitions API-ja, mora imati graceful fallback ako target nije univerzalno podržan.

---

# 197. CSS `:has`

Proveri support prema targetima.

---

# 198. CONTAINER QUERIES

Isto.

---

# 199. BROWSER MATRIX TESTOVI

Ako postoje E2E testovi, proveri koje engine-e testiraju.

Na primer:

```text
Chromium
Firefox
WebKit
```

Ako se testira samo Chromium:

ne tvrdi cross-browser correctness.

---

# 200. MOBILE TEST MATRIX

Proveri da li postoje testovi za:

- iOS-like WebKit
- Android/Chromium behavior

gde je relevantno.

---

# 201. VISUAL REGRESSION

Screenshot test na jednom browseru ne garantuje identičan rendering u drugom.

---

# 202. PRODUCTION BUILD TEST

Veoma važan zahtev:

Ako tooling dozvoljava, testiraj:

```text
production build
↓
production server
↓
critical flows
```

Nemoj bazirati audit samo na dev serveru.

---

# 203. CLEAN INSTALL

Pokreni clean install samo ako je bezbedno i dostupno.

Zabeleži package manager/runtime.

---

# 204. BUILD

Ako ne možeš izvršiti production build:

```text
PRODUCTION BUILD: NOT VERIFIED
```

---

# 205. PREVIEW / START

Ako framework ima:

```text
build
start
```

testiraj built artifact gde je moguće.

---

# 206. BROWSER AUTOMATION

Ako tooling omogućava, testiraj critical flows u više engine-a.

Prioritet:

- auth
- navigation
- forms
- file operations
- critical business action

---

# 207. DEVTOOLS CONSOLE

Traži browser-specific:

- errors
- warnings
- blocked resources
- CSP
- CORS
- hydration

---

# 208. NETWORK PANEL

Proveri:

- failed resources
- MIME
- redirects
- CORS
- cache
- chunk failures

---

# 209. SERVER LOGS

Production-only bug može imati browser simptom, ali server root cause.

Prati oba kraja.

---

# 210. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Environment:
Browser:
OS:
Runtime:
Build mode:

Feature/Route:
File:
Relevant code/config:

Problem:

Evidence:

Why development does not expose it:

Reproduction:

Expected behavior:

Actual behavior:

Affected users/environments:

Impact:

Root cause:

Recommended remediation:

Cross-browser fallback:

Verification matrix:

Regression test:

Complexity:
XS / S / M / L / XL
```

Ako vrednost nije poznata:

**NOT VERIFIED**

---

# 211. SEVERITY

Koristi:

## P0 - CRITICAL

- critical security/data issue koji se pojavljuje u production environment-u
- katastrofalan cross-user ili data-loss incident

## P1 - HIGH

- aplikacija ili glavni feature ne radi u značajnom podržanom browseru
- production-only failure glavnog user flow-a
- production deployment ne može pouzdano da startuje
- ozbiljan auth/cookie/CORS problem

## P2 - MEDIUM

- važan feature ne radi u delu podržanih environment-a
- realan production bug sa workaround-om

## P3 - LOW

- ograničen browser/platform bug
- sekundarna funkcija

## P4 - IMPROVEMENT

- compatibility enhancement bez postojećeg failure-a

---

# 212. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

reprodukovano u konkretnom environment-u ili direktno dokazano konfiguracijom.

MEDIUM:

jak code/config dokaz, ali target runtime nije pokrenut.

LOW:

zavisi od browser/platform detalja koji nisu provereni.

---

# 213. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 214. SUPPORT STATUS

Za browser-specific finding navedi:

```text
Browser support:
SUPPORTED TARGET
UNSUPPORTED TARGET
TARGET NOT DEFINED
```

Bug u browseru koji proizvod eksplicitno ne podržava nije isti prioritet kao bug u podržanom browseru.

---

# 215. FALSE-POSITIVE PREVENTION

Pre ozbiljnog finding-a proveri:

1. target browser matrix
2. framework behavior
3. transpilation
4. polyfills
5. component library
6. deployment config
7. CDN/proxy
8. runtime version
9. browser native behavior
10. production build
11. testove

Nemoj zaključiti samo na osnovu korišćenja modernog API-ja.

---

# 216. NE MENJAJ KOD

Tokom audita:

- ne dodaj polyfills
- ne menjaj browserslist
- ne menjaj build target
- ne menjaj CDN
- ne menjaj CORS
- ne menjaj runtime
- ne patchuj dependencies

Prvo završi audit.

---

# 217. OUTPUT - BROWSER_PRODUCTION_COMPATIBILITY_AUDIT.md

Finalni rezultat strukturiraj:

## 1. Executive Summary

- stack
- defined browser support
- deployment model
- najveći cross-browser rizici
- najveći production-only rizici
- runtime verification coverage

## 2. Browser Support Matrix

| Browser/Platform | Targeted | Tested | Result |
|---|---|---|---|

## 3. Environment Matrix

## 4. Development vs Production Differences

## 5. Build & Bundling Audit

## 6. Environment Variables Audit

## 7. Filesystem / OS Compatibility

## 8. Browser API Compatibility

## 9. CSS Compatibility

## 10. Forms & Input Compatibility

## 11. Auth / Cookie / CORS Compatibility

## 12. Routing / Hosting Compatibility

## 13. CDN / Cache Compatibility

## 14. Runtime Compatibility

## 15. Node / Edge / Serverless Audit

## 16. Locale / Date / Time Audit

## 17. Mobile Browser Audit

## 18. Production Data Compatibility

## 19. Dependency Compatibility

## 20. Existing Cross-Browser Tests

## 21. Findings Summary

| ID | Severity | Environment | Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P0 Findings

## 23. P1 Findings

## 24. P2 Findings

## 25. P3 Findings

## 26. P4 Improvements

## 27. Things Done Well

## 28. Unsupported / Out-of-Scope Platforms

## 29. Unknown / Not Verified

## 30. Remediation Roadmap

---

# 218. WINDOWS TO LINUX PASS

Ako development uključuje Windows, a production Linux, ponovo proveri:

- path casing
- path separators
- shell commands
- executable names
- permissions
- line endings
- filesystem persistence

---

# 219. LOCAL TO SERVERLESS PASS

Simuliraj:

```text
one persistent local Node process
↓
many ephemeral production instances
```

Pitaj:

- šta živi u memory-ju
- šta se zapisuje na disk
- koji lock je local
- koji job pretpostavlja jednu instancu

---

# 220. CHROME TO SAFARI PASS

Za critical browser feature ponovo proveri samo konkretno korišćene API-je i CSS funkcije.

Ne generiši listu svih istorijskih Safari problema.

---

# 221. DESKTOP TO MOBILE BROWSER PASS

Pitaj:

- da li browser API postoji
- da li permission model postoji
- da li popup radi
- da li file picker radi
- da li background lifecycle menja ponašanje

---

# 222. DEV TO PROD BUILD PASS

Za svaki critical feature pitaj:

> Da li code splitting, minification, env replacement ili tree shaking može promeniti ovo ponašanje?

Ako ne postoji konkretan razlog:

ne izmišljaj finding.

---

# 223. FAST NETWORK TO SLOW NETWORK PASS

Pitaj:

> Koja race condition ili timeout pretpostavka postaje vidljiva tek kada request traje mnogo duže?

---

# 224. SINGLE TAB TO LONG-LIVED TAB PASS

Simuliraj korisnika koji drži app otvorenu satima ili danima.

Proveri:

- auth expiry
- deployed new version
- stale cache
- WebSocket reconnect
- timers
- BFCache

---

# 225. OLD CLIENT TO NEW BACKEND PASS

Ovo je posebno važno kod čestih deployment-a.

Pitaj:

> Da li frontend od juče može bezbedno komunicirati sa backend-om od danas?

Proveri:

- required fields
- enum values
- removed endpoints
- changed response shapes

---

# 226. NEW CLIENT TO OLD BACKEND PASS

Kod rolling deployment-a moguć je i obrnut scenario.

Proveri backward/forward compatibility.

---

# 227. PRODUCTION ERROR PASS

Namerno analiziraj šta user vidi kada:

- chunk ne može da se učita
- API CORS padne
- env nedostaje
- asset 404
- browser API ne postoji
- cookie nije poslat

Ne prihvataj blank screen kao normalan failure mode.

---

# 228. DIRECT URL PASS

Za svaku glavnu SPA route mentalno testiraj:

```text
paste URL into fresh browser
↓
Enter
```

Ne testiraj samo client-side navigation.

---

# 229. PRIVATE BROWSING PASS

Ako aplikacija značajno zavisi od local persistence-a, razmotri private/incognito režim.

Ako nije runtime testirano:

**NOT VERIFIED**

---

# 230. STRICT PRIVACY PASS

Za auth/third-party integrations razmotri browser koji blokira third-party storage/cookies.

Samo ako arhitektura na tome zavisi.

---

# 231. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- target browseri su utvrđeni pre severity-ja
- unsupported browser nije tretiran isto kao supported
- development i production su analizirani odvojeno
- production build nije zamenjen dev server testom
- browser API finding proverava feature detection/polyfill
- CSS finding proverava stvarni target support
- Windows/Linux razlike su analizirane gde su relevantne
- local filesystem nije tretiran kao persistent u serverless-u
- global memory nije tretirana kao shared production state bez dokaza
- CORS problem nije zaključen samo iz source koda ako proxy može da ga reši
- cookie problem proverava domain/SameSite/Secure kontekst
- date/locale problemi imaju konkretan execution scenario
- old-client/new-backend compatibility je proverena
- chunk/deployment mismatch nije ignorisan
- theory nije predstavljena kao confirmed bug
- svaki P1/P2 ima pogođeni environment
- recommendations ne dodaju bespotrebne polyfill-e ili legacy support

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Testirajte aplikaciju u Chrome-u, Firefox-u i Safari-ju i dodajte potrebne polyfill-e.

To nije compatibility audit.

Tražim probleme poput:

```text
Windows development
↓
filesystem import is case-insensitive
↓
import "./button"
↓
actual file Button.tsx
↓
Linux production build
↓
module not found
```

ili:

```text
local development
↓
frontend and API same-origin through dev proxy
↓
cookies work
↓
production frontend and API on different origins
↓
SameSite/CORS config incompatible
↓
login appears broken only in production
```

ili:

```text
production v1 page remains open
↓
v2 deployment removes old lazy chunk
↓
user opens rarely-used feature
↓
browser requests old chunk
↓
404
↓
feature crashes
```

ili:

```text
server renders date using UTC
↓
browser renders same value using local timezone
↓
different visible text
↓
hydration mismatch
```

ili:

```text
local persistent Node process
↓
in-memory rate limit works
↓
production has multiple serverless instances
↓
each instance has its own counter
↓
effective limit can be bypassed
```

To su problemi koje treba da pronađeš.

Razmišljaj kroz razlike između:

- browser engine-a
- OS-a
- filesystem-a
- developmenta
- production build-a
- persistent i ephemeral runtime-a
- jednog i više server procesa
- localhost-a i realnog domain-a
- brzog i sporog network-a
- novog i starog client-a
- različitih locale/timezone okruženja

Ako nisi mogao pokrenuti target environment:

**NOT VERIFIED.**

Ako browser nije podržan:

jasno napiši da finding nije problem u podržanom scope-u.

Ako je samo compatibility enhancement:

**P4 - IMPROVEMENT.**

Bolje je pronaći 7 stvarnih production-only problema nego generisati ogromnu listu teorijskih browser razlika.

Cilj je dobiti forenzički precizan compatibility audit koji otkriva sve ono što lokalno "radi", ali može da pukne čim aplikacija napusti developer računar.
