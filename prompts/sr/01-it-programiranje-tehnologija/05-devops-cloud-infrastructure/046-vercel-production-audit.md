---
id: UPL-IT-046
number: 46
slug: vercel-production-audit
title: Vercel Production Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# VERCEL PRODUCTION AUDIT

Želim duboku production reviziju Vercel deployment-a i Next.js/serverless/edge infrastrukture.

Ako projekat ne koristi Vercel:

**NOT APPLICABLE**

## 1. OBJECTIVE AND NON-GOALS

Dokaži da li Vercel podešavanje drži **secrets i privatne podatke u predviđenom okruženju i publici**, da li je **ono što radi u production-u predviđeni, testirani deployment** i da li serverless i caching model **izdržavaju stvaran saobraćaj, otkaze i rollback**.

Van obima:

- opšti bezbednosni pregled aplikacije (samo tamo gde semantika Vercel ili Next.js platforme menja odgovor)
- podešavanje performansi pojedinačnih stranica osim ako izaziva trošak, nedostupnost ili izlaganje podataka
- preporuka prelaska sa Vercel-a ili sa serverless-a
- opšti CI/CD pregled van Vercel deployment modela

## 2. CONTEXT DISCOVERY

Prvo utvrdi, iz repozitorijuma i podešavanja projekta:

```text
Framework and exact version (Next.js major/minor, App Router, Pages Router, or both):
Rendering modes in use (static, dynamic, ISR, streaming, server actions):
Runtimes per route (Node.js, Edge) and middleware location:
Vercel plan and enabled features (deployment protection, firewall, cron, storage):
Data stores and their regions; pooling or serverless drivers:
Git integration: production branch, fork PR behavior, ignored build step:
Other deployment paths (CLI, deploy hooks, CI with tokens):
```

Next.js caching podrazumevane vrednosti, mogućnosti runtime-a, limiti funkcija, cene i kvote razlikuju se između verzija i planova i menjaju se vremenom. Proveri trenutno ponašanje provajdera i verzije pre nego što ga navedeš; ne oslanjaj se na zapamćene podrazumevane vrednosti.

## 3. EVIDENCE MODEL

```text
A - observed: deployment, response headers, logs, a safe preview test or a two-user cache test shows the behavior
B - complete path: project settings, env scopes and code fully show the path
C - strong static evidence: code or configuration suggests the path, but dashboard settings are not visible
D - inference: depends on platform or framework semantics not verified for this version
E - hardening: stronger control without a current failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - dokaz tier A ili B pokazuje put izlaganja ili otkaza.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od podešavanja u dashboard-u, funkcija plana ili semantike verzije koje nisu mogle da se provere (tier D).
- **NOT APPLICABLE** - funkcija se ne koristi.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava (na primer deployment protection na preview-ima).
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan put izlaganja, greške u ispravnosti, pouzdanosti, troška ili operativnog otkaza.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Korišćenje serverless funkcija ili postojanje cold start-ova nije defekt; postaje defekt kada naruši zahtev za ispravnost, kapacitet ili latenciju.
- Postojanje preview deployment-a nije izlaganje; postaje izlaganje kada sadrži production secrets ili podatke, ili izlaže neobjavljeni poverljivi sadržaj ljudima koji ne treba da ga vide.
- `NEXT_PUBLIC_*` promenljiva sa vrednošću koja je namenjena da bude javna (publishable ključevi, javni URL-ovi, analytics ID-evi) nije curenje.
- Statičko generisanje ili keširanje rute je ispravno kada izlaz ne zavisi od korisnika, tenant-a ili autorizacije.
- Javni cron URL je prihvatljiv kada je poziv autentifikovan, a posao idempotentan.
- Source maps su hardening stavka osim ako otkrivaju secrets ili materijalno osetljivu logiku.

## 6. MAPIRAJ VERCEL

- Project

- Production domain

- Preview domains

- Git integration

- Framework

- Build settings

- Functions

- Edge Functions

- Cron

- KV/Blob/Postgres integrations

- env vars

- regions

## 7. PRODUCTION BRANCH

Koji branch deployuje production?

## 8. PREVIEW

Svaki PR/branch može kreirati live deployment.

Pitaj koje secrets dobija.

## 9. ENV SCOPE

Za svaki env:

```text
Development
Preview
Production
```

proveri variable scope.

## 10. PRODUCTION SECRET U PREVIEW-U

High-risk ako untrusted PR code može da ga pročita.

## 11. UNTRUSTED BUILD WITH SECRETS

Preview build izvršava kod sa grane: `next.config`, build skripte, install skripte zavisnosti i svaki modul importovan tokom build-a.

- Ko može da napravi granu ili PR koji pokreće Vercel build (članovi tima, spoljni contributor-i, fork-ovi)?
- Koje environment promenljive taj build dobija (Preview scope i svaka promenljiva označena za sva okruženja)?
- Da li build ili dobijeni preview runtime dolazi do production skladišta podataka?

Kod koji kontroliše contributor plus production kredencijali je kritična kombinacija; rešenje je ograničavanje opsega, a ne poverenje u contributor-a.

## 12. PUBLIC ENV

Next.js `NEXT_PUBLIC_*` završava u browseru.

## 13. SERVER-ONLY ENV

Proveri import boundary.

## 14. PUBLIC ENV LEAKAGE

`NEXT_PUBLIC_*` vrednosti se ugrađuju u client bundle tokom build-a; preimenovanje secret-a sa tim prefiksom ga objavljuje. Proveri i indirektne putanje:

- serverske vrednosti prosleđene kao props client komponentama
- serverske vrednosti serijalizovane u podatke stranice ili RSC payload
- `env` unosi u `next.config` koji se ugrađuju
- stranice sa greškom i logovi prikazani klijentu

Proveri pretragom izgrađenih client asset-a po poznatim prefiksima i vrednostima secrets-a kada je build dostupan.

## 15. BUILD-TIME SECRET

Može biti embedded u generated assets.

## 16. BUILD-TIME VS RUNTIME ENVIRONMENT

Za svaku promenljivu utvrdi kada se čita:

- **build time** - vrednost ugrađena u statičke stranice, client bundle ili generisane fajlove; njena promena zahteva novi build
- **runtime** - vrednost koju funkcije čitaju pri svakom pozivu

Nalazi koje tražiš: promenljiva izmenjena u dashboard-u, ali i dalje ugrađena u stari build; statički generisana stranica koja sadrži secret pročitan tokom build-a; promocija ili rollback koji pokreću kod izgrađen sa drugačijom vrednošću od očekivane. Proveri kako trenutna verzija platforme primenjuje izmene okruženja na postojeće deployment-e.

## 17. FUNCTION RUNTIME

Node vs Edge.

## 18. EDGE LIMITATIONS

- filesystem

- TCP

- packages

- runtime APIs

## 19. EDGE VS NODE.JS RUNTIME

Za svaku rutu, middleware i funkciju na Edge runtime-u potvrdi da njene zavisnosti zaista rade tamo: drajveri baze, crypto i JWT biblioteke, SDK-ovi koji očekuju Node.js API-je. Otkazi koje tražiš:

- biblioteka tiho prelazi na slabije ponašanje (na primer bez provere potpisa)
- putanja koda koja pada tek u runtime-u na retko korišćenoj grani
- baza kojoj se pristupa iz Edge regiona daleko od podataka

Mogućnosti runtime-a za middleware i Edge funkcije menjaju se između verzija framework-a i platforme; proveri za detektovanu verziju.

## 20. REGION

Function region vs database region.

## 21. CROSS-REGION LATENCY

DB calls iz udaljenog regiona.

## 22. SERVERLESS DB CONNECTIONS

Burst functions mogu iscrpeti DB pool.

## 23. POOLING

Proveri provider/proxy.

## 24. SERVERLESS DATABASE MODEL

Proceni najgori slučaj konekcija:

```text
concurrent function instances x connections per instance (pool size) = demand
demand vs database max connections (minus reserved and other clients)
```

Proveri:

- veličinu pool-a po instanci (pool od 10 po instanci brzo se umnožava)
- da li ispred baze stoji pooler, proxy ili drajver zasnovan na HTTP-u i u kom režimu (session ili transaction pooling i šta to kvari: prepared statements, podešavanja sesije, advisory locks)
- ponovnu upotrebu konekcija kroz tople pozive ili novu konekciju po zahtevu
- vreme povezivanja pri cold start-u i TLS handshake do udaljenog regiona
- ponašanje pri naletu: skok saobraćaja ili retry oluja koji odjednom prave mnogo instanci
- region funkcije u odnosu na region baze

## 25. FUNCTION TIMEOUT

Long tasks.

## 26. BACKGROUND WORK

Ne oslanjaj se na function execution nakon response-a ako platform semantics ne garantuju.

## 27. CRON

Audit:

- auth

- duplicate run

- duration

- retries

- idempotency

## 28. CRON URL

Ako public endpoint:

mora imati strong invocation control ako action privileged.

## 29. CRON SEMANTICS

Za svaki zakazani posao:

- **autentikacija poziva** - endpoint proverava secret koji platforma šalje, a ne samo putanju koju je teško pogoditi
- **dupli ili propušteni pozivi** - pretpostavi da poziv može da stigne više puta ili da se preskoči; posao mora da bude idempotentan i da podnese praznine
- **preklapanje** - poziv duži od intervala može da se preklopi sa sledećim; da li postoji lock ili zaštita?
- **timeout-i** - posao ubijen na limitu funkcije mora da ostavi konzistentno stanje i da se ispravno nastavi
- **okruženje** - koji deployment-i izvršavaju cron (samo production?) i šta se dešava posle rollback-a ili promocije

Proveri trenutne garancije isporuke i limite cron-a za plan koji se koristi.

## 30. BUILD OUTPUT

Proveri šta ulazi u static bundle.

## 31. SOURCE MAPS

Public exposure.

## 32. STATIC FILE

Accidental `.env`, backups, internal JSON.

## 33. NEXT.JS ROUTE HANDLERS

Runtime config.

## 34. SERVER ACTIONS

Auth/authz enforcement.

## 35. MIDDLEWARE

Edge middleware nije jedini security layer za backend resource authorization.

## 36. CACHING

Next.js:

- static

- dynamic

- revalidate

- fetch cache

- route cache

## 37. PRIVATE DATA CACHE

Najvažniji scenario:

```text
User A response
↓
cached without user/tenant key
↓
User B receives it
```

## 38. STATIC GENERATION

Sensitive per-user route ne sme postati static.

## 39. REVALIDATION

Stale private data.

## 40. CDN CACHE

Cache-Control.

## 41. `Vary`

Relevantni request dimensions.

## 42. ISR

Public content consistency.

## 43. AUTH COOKIE + CACHE

Proveri da auth-dependent rendering zaista ostaje dynamic/private.

## 44. NEXT.JS CACHING MODEL

Utvrdi caching slojeve za detektovanu verziju Next.js-a i router, i za svaki utvrdi da li može da drži podatke koji zavise od korisnika, tenant-a ili autorizacije:

```text
Request memoization: per request, deduplicates identical fetches
Data Cache: persistent fetch/function results across requests and deployments
Full Route Cache: rendered output of static routes
Client Router Cache: RSC payloads kept in the browser session
CDN / edge cache: responses cached by Cache-Control and platform rules
```

Za svaku rutu koja čita sesiju, cookies, headers ili tenant:

- da li se renderuje dinamički ili može da se generiše statički i servira svima?
- da li je neki keširani fetch ili keširana funkcija indeksirana bez identiteta korisnika ili tenant-a?
- da li revalidacija (vremenska, po tag-u ili putanji) može da servira zastarele privatne podatke posle promene dozvola?
- da li CDN može da kešira odgovor sa `Set-Cookie` ili privatnim podacima?

Podrazumevano ponašanje keširanja se menjalo između major verzija Next.js-a; potvrdi podrazumevane vrednosti i API-je za uključivanje i isključivanje za detektovanu verziju umesto da pretpostavljaš. Potvrdi izlaganje testom sa dva korisnika (A pa B, i različiti tenant-i).

## 45. IMAGE OPTIMIZATION

Remote image patterns mogu dati SSRF-like/proxy/cost surface prema Next/Vercel semantics.

## 46. REMOTE PATTERNS

Ne dozvoli unnecessary arbitrary hosts.

## 47. IMAGE COST ABUSE

Huge/remote image requests.

## 48. REWRITES

Mogu expose-ovati internal backend.

## 49. PROXY

Server-side rewrite može zaobići očekivane boundaries.

## 50. INTERNAL SERVICE EXPOSURE

Za svaki rewrite, proxy rutu i serverski fetch sastavljen od ulaza zahteva:

- do kojih odredišta može da se stigne (interni API-ji, admin backend-i, metadata ili privatni host-ovi)?
- da li parametri putanje ili upita mogu da promene host ili putanju odredišta (`/api/proxy/:path*` ka internom API-ju)?
- koji header-i se prosleđuju (cookies, authorization), a koji se dodaju (interni tokeni)?
- da li odredište veruje zahtevu zato što dolazi sa Vercel deployment-a?

Rewrite ka internom servisu je izložen endpoint sa modelom autorizacije tog servisa.

## 51. REDIRECTS

Open redirect logic u app config-u.

## 52. HEADERS

Security/cache/CORS.

## 53. CUSTOM DOMAIN

DNS ownership.

## 54. DANGLING VERCEL DOMAIN

Old project/custom domain mappings.

## 55. PREVIEW URL

Može expose-ovati unreleased feature/data.

## 56. PREVIEW AUTH

Ako preview treba private access, proveri protection.

## 57. PREVIEW PROTECTION

- Koji deployment-i su zaštićeni (samo preview-i, svi generisani URL-ovi, production alias-i)?
- Da li zaštita može da se zaobiđe tokenima za automatizaciju ili linkovima za deljenje i ko ih ima?
- Da li se preview-i povezuju na production podatke, šalju prave email-ove ili naplate ili pozivaju production webhook-ove?
- Da li pretraživači indeksiraju preview URL-ove ili su povezani sa javnih mesta?

## 58. DEPLOY HOOK

Secret URL koji trigger-uje deployment je capability.

## 59. GIT DEPLOY

Koji Git actor može production?

## 60. DIRECT CLI DEPLOY

Ko ima Vercel token/project access?

## 61. VERCEL TOKEN

Scope i CI exposure.

## 62. TEAM ACCESS

Production management privilege.

## 63. ENV VAR AUDIT

- missing

- duplicates

- stale

- preview leakage

- public prefix

## 64. VERCEL INTEGRATION

Third-party integration permissions.

## 65. BLOB/STORAGE

Public/private access.

## 66. POSTGRES

Connection pooling/region/backup.

## 67. KV/CACHE

Authoritative vs disposable.

## 68. EDGE CONFIG

Propagation/staleness.

## 69. LOGS

Function logs can expose secrets.

## 70. OBSERVABILITY

Cold starts, errors, duration.

## 71. FUNCTION CONCURRENCY

Serverless amplification.

## 72. PROVIDER QUOTA

Functions/builds/bandwidth/image optimization.

## 73. BUILD MINUTES

Abuse/cost.

## 74. BANDWIDTH

Large downloads.

## 75. BOT/ATTACK TRAFFIC

Cost before app rate-limit.

## 76. COST AMPLIFICATION

Utvrdi putanje zahteva na kojima jedan jeftin spoljni zahtev izaziva skupu upotrebu platforme: nekeširano dinamičko renderovanje, optimizacija slika iz proizvoljnih izvora, veliki download-i servirani kroz funkcije, dugotrajne funkcije ili ponovni pokušaji. Proveri limite potrošnje, alert-e i ograničenja i proveri trenutni model cena i kvote za plan; ne navodi zapamćene limite ili cene.

## 77. FIREWALL/WAF

Ako Vercel security features postoje, ne tretiraj kao zamenu za app controls.

## 78. ROLLBACK

Vercel može redeploy/promote previous deployment, ali proveri DB/config compatibility.

## 79. ROLLBACK REALITY

Rollback na prethodni deployment vraća kod, a ne svet oko njega. Za svaku putanju rollback-a utvrdi:

- da li stari deployment radi sa **trenutnom šemom baze** i podacima koje je upisala novija verzija?
- sa kojim **vrednostima environment promenljivih** radi (sopstvenim build-time vrednostima, trenutnim runtime vrednostima)? Proveri za verziju platforme.
- da li se **cron rasporedi, rewrite-ovi i header-i** vraćaju zajedno sa njim?
- da li klijenti sa novijim keširanim bundle-om ili service worker-om pucaju na starijem API-ju?

Rollback koji ne može bezbedno da se izvede tokom incidenta nije plan za rollback.

## 80. IMMUTABLE DEPLOY

Deployment URL je useful artifact identity.

## 81. PROMOTION

Ako workflow koristi preview -> production promotion, proveri da je exact tested deployment promoted.

## 82. REBUILD

Ako production rebuild-uje, parity risk.

## 83. DEPLOYMENT IDENTITY

Svaki deployment je nepromenljiv build sa sopstvenim URL-om; production je alias koji pokazuje na jedan od njih. Utvrdi:

- Da li se production pravi **promocijom** već testiranog deployment-a ili **novim build-om** sa production grane?
- Ako se ponovo build-uje, da li ulazi mogu da se razlikuju od testiranih (vrednosti okruženja, razrešavanje zavisnosti, build cache)?
- Koji commit i koji deployment trenutno služe production domen i da li to može da se prati?
- Da li neko može da dodeli production domen proizvoljnom deployment-u i da li se to beleži?

## 84. BUILD CACHE

Stale generated output.

## 85. MONOREPO

Root directory/build ignore.

## 86. `ignoreCommand`

Može slučajno preskočiti needed deploy.

## 87. DEPLOY ORDER

Frontend/backend u istom Next app ili external API.

## 88. PWA

Old service worker/cache posle Vercel deploy-a.

## 89. ENV ROLLBACK

Old deployment koristi current env ili snapshot semantics? Potvrdi actual behavior, ne nagađaj.

## 90. DATABASE MIGRATION

Ne vezuj unsafe migration za serverless function startup.

## 91. MIGRATION JOB

Poseban controlled step.

## 92. SEED

Nikad production seed reset accidental.

## 93. SERVERLESS FILESYSTEM

Ephemeral.

## 94. UPLOADS

Ne čuvaj durable user files lokalno u function filesystem-u.

## 95. `/tmp`

Temporary only.

## 96. RESPONSE SIZE

Platform limits.

## 97. REQUEST SIZE

Uploads.

## 98. STREAMING

Runtime/platform limit.

## 99. WEBSOCKET

Vercel support/model proveri prema current architecture, ne pretpostavljaj.

## 100. LONG CONNECTION

SSE/stream.

## 101. THIRD-PARTY BACKEND

Rewrites/proxies.

## 102. MANDATORY FAILURE WALKTHROUGH

Za svaki scenario navedi trenutno ponašanje, stanje koje ostaje, kako se otkriva i kako se oporavlja:

```text
preview build from an untrusted branch receives a production secret
secret is exposed through NEXT_PUBLIC or a statically generated page
private route response is cached and served to another user or tenant
traffic burst creates a database connection storm
long function is killed at the platform limit mid-write
cron runs twice, overlaps or is skipped
durable file written to the function filesystem disappears after redeploy
rollback runs an older deployment against a newer schema
public Blob or storage object exposes private data
production branch or domain assignment is misconfigured
```

## 103. MATRICES

### Environment Matrix

| Variable / resource | Development | Preview | Production | Read at build or runtime | Exposed to client | Risk |
|---|---|---|---|---|---|---|

### Function / Runtime Matrix

| Route or function | Runtime | Region | Data store and region | Max duration need | Connections per instance | Auth |
|---|---|---|---|---|---|---|

### Cache / Data Sensitivity Matrix

| Route or fetch | Depends on user/tenant | Rendering mode | Cache layers involved | Cache key includes identity | Revalidation | Verified by test |
|---|---|---|---|---|---|---|

## 104. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Vercel surface:
Environment:
Runtime:
Region:
Scope (routes, functions, deployments):
Trigger:
Current config / behavior:
Expected invariant:
Failure / exploit path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Verification:
Regression risk:
Complexity:
```

## 105. SEVERITY

- **P0** - production secrets dostupni nepoverljivom kodu ili javnosti, ili privatni podaci jednog korisnika ili tenant-a servirani drugom.
- **P1** - neovlašćena putanja do production deployment-a, privilegovan cron ili proxy endpoint koji može da se pozove bez autentikacije, ili rutinski događaj (nalet saobraćaja, rollback) koji izaziva ispad ili oštećenje podataka.
- **P2** - značajne praznine u pouzdanosti ili trošku: rizik iscrpljivanja konekcija pri realnim vrhovima, neidempotentan cron, nebezbedan rollback, uvećanje troška bez limita.
- **P3** - ograničeni problemi: zastareo javni sadržaj, manje izlaganje nepoverljivog sadržaja na preview-u, nedostajuća vidljivost.
- **P4** - hardening: uži opsezi, uklanjanje source maps, dodatna zaštita gde ne postoji trenutna putanja.

## 106. OUTPUT

`VERCEL_PRODUCTION_AUDIT.md`

## 107. SECOND PASS

Testiraj ili analiziraj:

- novi preview sa nepoverljive grane: tačno koje env vrednosti stižu do njegovog build-a i runtime-a
- korisnik A, pa korisnik B (i tenant A, pa tenant B) na svakoj personalizovanoj ruti; uporedi odgovore i cache header-e
- nalet funkcija na bazu: instance x veličina pool-a u odnosu na limit konekcija
- funkciju koja dostiže timeout tokom upisa
- dva cron poziva paralelno
- rollback na prethodni deployment nad trenutnom šemom i env-om
- skeniranje statičkog izlaza i client bundle-a na secrets
- trajni fajl upisan pre redeploy-a
- otkaz custom domena ili DNS-a

Zatim pokušaj da opovrgneš svaki nalaz: da li deployment protection, env scoping, dinamičko renderovanje ili provera uzvodno već blokiraju putanju za detektovanu verziju? Nalaze koji zavise od neproverene semantike platforme označi kao **NOT VERIFIED**.

## 108. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da pokriva:

- verziju framework-a i semantiku keširanja proverenu za nju
- production granu, identitet deployment-a i promociju ili ponovni build
- preview-e: ko može da ih pokrene, do kojih secrets-a i podataka dolaze, zaštitu
- env scope po okruženju i čitanje u build-time ili runtime
- javni bundle i upotrebu `NEXT_PUBLIC`
- keširanje svake rute koja zavisi od korisnika ili tenant-a, sa testom sa dva korisnika gde je moguće
- izbor runtime-a, usklađenost regiona i računicu konekcija ka bazi
- limite funkcija, rad u pozadini i pretpostavke o prolaznom fajl sistemu
- autentikaciju, idempotentnost i preklapanje cron-a
- rewrite-ove i proxy-je ka internim servisima
- pristup skladištu (Blob, KV, Postgres) i backup-e
- rollback nad trenutnom šemom, env-om i klijentima
- ovlašćenja za Git, CLI, tokene i deploy hook-ove
- logove i secrets, vidljivost
- kvote i uvećanje troška, proverene za trenutni plan
- dosledne statuse i evidence tier-ove

# KONAČNO PRAVILO

Tražim problem poput:

```text
Preview environment
↓
inherits PRODUCTION_DATABASE_URL
↓
external contributor opens PR
↓
Vercel builds contributor-controlled Next.js code
↓
build script reads env
↓
production database credential can be exfiltrated
```

ili:

```text
server component fetch:
cache enabled
↓
response depends on authenticated tenant
↓
cache key does not include tenant identity
↓
Tenant B receives Tenant A data
```

Drugi failure chain-ovi koje tražim:

```text
cron job charges pending renewals
↓
invocation is delivered twice, or a slow run overlaps the next schedule
↓
no idempotency key or lock
↓
both runs select the same pending rows
↓
customers are charged twice
```

```text
release adds a NOT NULL column and writes new-format records
↓
incident triggers instant rollback to the previous deployment
↓
old code inserts without the new column and cannot parse the new records
↓
writes fail and reads crash on rows created in the last hour
```
