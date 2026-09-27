---
id: UPL-IT-045
number: 45
slug: cicd-pipeline-audit
title: Audit CI/CD pipeline-a
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# AUDIT CI/CD PIPELINE-A

Želim kompletan production-grade audit čitavog CI/CD pipeline-a, nezavisno od platforme.

Glavni cilj:

> Utvrditi da li source, tests, builds, artifacts, approvals, migrations, secrets, deployments i rollback proces formiraju pouzdan i bezbedan lanac od commita do production-a.

## 1. OBJECTIVE AND NON-GOALS

Dokaži da li je lanac od pregledanog commit-a do koda koji radi u production-u **pouzdan** (ono što je testirano je ono što radi, otkazi su ograničeni i nadoknadivi) i **bezbedan** (niko ne može da ubaci nepregledan kod, zameni artefakt ili dođe do production kredencijala bez ovlašćenja).

Van obima:

- pregled sintakse workflow-a za konkretnog CI provajdera red po red (to pokriva audit specifičan za provajdera, na primer GitHub Actions audit; njegove nalaze koristi kao ulaz)
- zahtevanje ljudskog odobrenja, potpisivanja ili konkretnog alata za svaki sistem bez obzira na njegov rizik
- kvalitet koda aplikacije i testova (samo kapije koje oni čine)
- konfiguracija infrastrukture van putanje deployment-a

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
CI provider(s) and deployment tool(s):
Runner types (hosted, self-hosted, ephemeral, shared):
Environments (preview, staging, production) and how they differ:
Artifact types and registries (container images, packages, bundles, serverless zips):
How production is triggered (merge, tag, manual job, promotion, GitOps sync):
Deployment strategy (rolling, blue/green, canary, serverless, recreate):
Database migration tool and when it runs:
Components deployed separately (web, workers, cron, mobile/desktop clients, infrastructure):
Deployment frequency and team size:
```

Semantika pipeline-a (kontrole konkurentnosti, prekidanje, zaštita okruženja, čuvanje artefakata) zavisi od provajdera. Proveri stvarno ponašanje detektovanog provajdera i verzije pre nego što ga navedeš.

## 3. EVIDENCE MODEL

```text
A - observed: pipeline run history, deploy logs, registry metadata or a safe test run shows the behavior
B - complete path: pipeline definitions, permissions and environment settings fully show the path
C - strong static evidence: configuration suggests the path, but runtime settings (branch protection, environment rules) are not visible
D - inference: plausible behavior that depends on settings or provider semantics not verified
E - hardening: stronger control where the current chain already has no failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - put otkaza ili zaobilaženja pokazuju istorija pokretanja ili kompletna konfiguracija (tier A ili B).
- **LIKELY** - jak statički dokaz (tier C).
- **NOT VERIFIED** - zavisi od podešavanja van repozitorijuma (branch protection, pravila okruženja, politike registry-ja) koja nisu mogla da se provere.
- **NOT APPLICABLE** - faza ili rizik ne postoje u ovom pipeline-u.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretan put do netestiranog koda u production-u, neovlašćenog deployment-a, procurelog kredencijala, nenadoknadivog otkaza ili ispada.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Ručni deployment nije automatski nebezbedan; postaje nalaz kada deploy-ovani artefakt nije onaj koji je pregledan i testiran, ili kada akcija ne može da se pripiše osobi.
- Ljudsko odobrenje koje nedostaje nije defekt za continuous delivery niskog rizika sa jakim automatskim kapijama.
- Potpisivanje artefakata koje nedostaje nije ranjivost osim ako napadač ili greška zaista mogu da zamene artefakt između build-a i deploy-a.
- `continue-on-error` ili dozvoljeni padovi na poslovima koji ne blokiraju (lint dokumentacije, opcione provere) nisu zaobilaženje kapije.
- Ponovni build po okruženju nije automatski pogrešan ako su build-ovi hermetički i zaključani; postaje nalaz kada se ulazi mogu razlikovati.
- Dugoživeći kredencijal za deploy je hardening stavka osim ako je izložen nepoverljivom kodu ili širi nego što je potrebno.

## 6. MAPIRAJ PIPELINE

```text
commit
↓
validation
↓
tests
↓
build
↓
artifact
↓
security checks
↓
approval
↓
migration
↓
deploy
↓
smoke verification
↓
promotion
```

## 7. CHAIN OF CUSTODY

Za svaku kariku lanca zabeleži šta ulazi, šta izlazi i šta to dokazuje:

```text
source commit   -> which ref, who reviewed it, can it change after review?
validation      -> which checks run on exactly this commit (or merge result)?
build           -> which inputs (lockfile, base image, toolchain), on which runner?
artifact        -> immutable identifier (digest), where stored, who can overwrite?
promotion       -> is the same artifact moved between environments, or rebuilt?
migration       -> which schema change runs, by whom, before or after the app?
deployment      -> which identity deploys which digest to which environment?
verification    -> which checks prove the critical flows work?
rollback        -> which previous artifact and which data state can be restored?
```

Prekid na bilo kojoj karici (na primer "artefakt identifikovan promenljivim tag-om") znači da lanac ne može da dokaže šta radi u production-u.

## 8. INVENTARIŠI

- CI provider

- deployment provider

- runners

- environments

- artifacts

- registries

- signing

- secrets

- deployment triggers

- approvals

## 9. SOURCE AUTHORITY

Koji ref može ući u production?

## 10. BRANCH PROTECTION

Ako release zavisi od main/master:

proveri:

- required reviews

- required checks

- direct push

- force push

Ne tretiraj process rule kao technical vulnerability bez attack path-a.

## 11. PR VALIDATION

Tests moraju pokrivati stvarni merge/deploy artifact.

## 12. TEST ON PR, DEPLOY DIFFERENT SHA

High-signal race/drift.

## 13. TOCTOU IZMEĐU REVIEW I DEPLOY

Ako isti branch može biti promenjen nakon approval-a ali pre deploy-a.

## 14. APPROVAL BINDING

Odobrenje mora da bude vezano za ono što je odobreno:

- Da li je odobrenje review-a ili deployment-a vezano za commit SHA ili digest artefakta, ili samo za granu ili pokretanje pipeline-a koje može da preuzme novije commit-e?
- Da li novi commit-i mogu da se push-uju posle odobrenja i da se ipak deploy-uju pod tim odobrenjem?
- Da li ručni "deploy" posao pravi build sa trenutnog vrha grane umesto sa odobrenog commit-a?
- Da li se odobrenja poništavaju kada se promeni skup izmena?

Pregledan commit A, a deploy-ovan commit B je nalaz kad god B može da sadrži izmene koje niko nije pregledao niti testirao.

## 15. IMMUTABLE COMMIT

Production artifact treba biti vezan za exact SHA.

## 16. BUILD ONCE, PROMOTE

Ako staging i prod rebuild-uju source odvojeno:

mogu proizvesti različite artifacts.

## 17. REBUILD PRODUCTION

Može povući newer transitive dependencies/toolchain.

## 18. ARTIFACT IMMUTABILITY

Ko može replace-ovati build?

## 19. ARTIFACT RETENTION

Da li prethodni release postoji za rollback?

## 20. ARTIFACT TRUST

Za svaki tip artefakta proveri:

- **identitet** - deployment referencira nepromenljiv digest ili checksum, a ne promenljiv tag kao što je `latest` ili ponovo iskorišćena verzija
- **zamena** - ko (ljudi, CI poslovi, drugi pipeline-ovi) može da push-uje u isti repozitorijum ili putanju i da li artefakt može da se zameni pošto su testovi prošli?
- **nepromenljivost registry-ja** - da li su tag-ovi ili verzije zaštićeni od prepisivanja?
- **potpisivanje i verifikacija** - ako se koristi potpisivanje, da li se potpis proverava pri deploy-u i da li se potpisuje samo finalni build?
- **čuvanje** - da li se prethodni production artefakti čuvaju dovoljno dugo za rollback i da li su izuzeti iz politika čišćenja?

## 21. BUILD PROVENANCE

Artifact -> source commit -> workflow run.

## 22. PROVENANCE QUESTION

Za production, pipeline mora da odgovori, uz dokaz i bez nagađanja:

> Koji tačno commit je proizveo artefakt koji radi, koje pokretanje pipeline-a ga je napravilo, koje provere su prošle nad njim i ko ili šta ga je deploy-ovalo?

Pokušaj da odgovoriš za trenutni production deployment svake komponente (web, worker-i, cron, funkcije). Ako bilo koja komponenta ne može da se poveže sa commit-om, prijavi to.

## 23. TEST GATE

Koji checks blokiraju deployment?

## 24. FAILING TEST

Može li production deploy ipak proći?

## 25. SKIP TEST

Manual path?

## 26. ALLOW FAILURE

Critical security/test job sa `continue-on-error`.

## 27. FLAKY TEST

Ako se samo rerun-uje dok ne prođe:

gate gubi vrednost.

## 28. TEST ENV PARITY

Ne mora biti identičan production-u, ali critical differences moraju biti poznate.

## 29. BUILD CONFIG

Dev flags ne smeju završiti u production artifact-u.

## 30. SECRET INJECTION

Kada secrets postaju dostupni?

## 31. UNTRUSTED CODE + SECRET

Najvažniji supply-chain scenario.

## 32. DEPLOY CREDENTIAL

Scope samo do potrebnog environment-a.

## 33. STATIC LONG-LIVED KEY

Blast radius vs short-lived/OIDC.

## 34. ENVIRONMENT ISOLATION

Staging deploy credential ne treba production access.

## 35. SECRETS BOUNDARY

Mapiraj kada privilegovani secrets postaju dostupni duž lanca:

```text
Stage:
Code executed at this stage (trusted, contributor-controlled, third-party):
Secrets available (and their scope):
Could the code at this stage exfiltrate or misuse them?
```

Ključno pravilo: nijedna faza koja izvršava kod koji kontroliše contributor ili treća strana (build pull request-a, install skripte zavisnosti, test kod iz fork-a) ne sme da ima pristup production kredencijalima ili kredencijalima za objavljivanje. Kredencijali za deploy treba da se pojavljuju samo u fazama koje izvršavaju pregledan kod na poverljivim runner-ima, ograničeni na jedno okruženje.

## 36. PRODUCTION APPROVAL

Ako required prema operational modelu.

Ne zahtevaj human approval za svaki low-risk continuous delivery system.

## 37. CHANGE RISK

Migrations/infra/secrets mogu imati drugačiji approval model.

## 38. MIGRATION STEP

Ko je pokreće?

## 39. MIGRATION PRE/POST APP

Order.

## 40. MIGRATION RETRY

Može li se bezbedno rerun-ovati?

## 41. PARTIAL MIGRATION

Failure sredinom.

## 42. SCHEMA BACKWARD COMPATIBILITY

Mixed versions.

## 43. MIGRATION AND DEPLOYMENT COUPLING

Za svaki release sa izmenom šeme ili podataka prođi kroz svaku kombinaciju:

```text
migration succeeds, application deploy succeeds    -> expected
migration succeeds, application deploy fails       -> old code on new schema: does it work?
migration fails midway, application not deployed   -> partial schema: can it be retried or completed?
migration fails, application deploy continues      -> new code on old schema: is this prevented?
application deploys, worker/cron deploy fails      -> mixed versions on the same data
rollback of the application after the migration    -> does the old version work on the new schema?
```

Pipeline mora da ugradi ispravan redosled i da se zaustavi pri otkazu; za svaki red navedi šta danas radi.

## 44. ROLLBACK

Ne znači samo redeploy old artifact.

## 45. ROLLBACK DATABASE

Može biti nemoguć.

## 46. FEATURE FLAG

Može biti bolji rollback mehanizam za feature behavior.

## 47. ROLLBACK REALITY

Razdvoji:

- **code rollback** - ponovni deploy prethodnog artefakta: da li artefakt i dalje postoji, da li pipeline može da deploy-uje stariji digest i koliko to traje?
- **configuration rollback** - environment promenljive, feature flag-ovi i izmene infrastrukture deploy-ovane zajedno sa kodom
- **data rollback** - izmene šeme i podataka, koje obično ne mogu da se ponište ponovnim deploy-om koda

Plan rollback-a koji kaže samo "deploy-uj prethodnu verziju" nije potpun ako je release promenio šemu, konfiguraciju ili podatke.

## 48. SMOKE TEST

Nakon deploy-a proveri critical paths.

## 49. SMOKE TEST AUTHORITY

Health 200 nije dokaz da login/DB/write radi.

## 50. AUTO ROLLBACK

Ako postoji:

koji metric i threshold?

## 51. POST-DEPLOY VALIDATION

Health endpoint koji vraća 200 dokazuje da je proces pokrenut, a ne da proizvod radi. Proveri da li verifikacija posle deploy-a obuhvata:

- stvaran upis i čitanje nad production bazom (ili bezbednim sintetičkim tenant-om)
- autentikaciju i rad sa sesijama
- najkritičniji poslovni tok (checkout, rezervacija, slanje poruke)
- da li background worker-i i zakazani poslovi zaista obrađuju posao
- stopu grešaka i latenciju u poređenju sa stanjem pre deploy-a

Navedi koji otkazi bi prošli trenutne provere neprimećeno.

## 52. FALSE ROLLBACK

Transient metric spike može loop-ovati deployment.

## 53. CANARY

Ako postoji, analiziraj traffic split i evaluation.

## 54. BLUE/GREEN

Database compatibility.

## 55. PARTIAL DEPLOYMENT

Tokom i posle neuspelog rollout-a, deo flote može da radi na novoj verziji, a deo na staroj:

- šta se dešava ako rollout stane na 50%: da li saobraćaj i dalje stiže do obe verzije i da li su one kompatibilne međusobno i sa deljenim podacima?
- da li pipeline otkriva zaustavljen ili delimičan rollout i šalje alert, ili prijavljuje uspeh?
- da li se web, worker-i, cron i funkcije deploy-uju u istom koraku ili neki od njih može neograničeno da ostane na staroj verziji?

## 56. CONCURRENT DEPLOY

Dve osobe/pipelines deployuju različite SHA.

## 57. DEPLOY LOCK

Serialization gde potrebno.

## 58. CANCEL DEPLOY

Cancel na pola može ostaviti mixed state.

## 59. CANCELLATION SEMANTICS

Automatsko prekidanje zastarelih pokretanja (na primer `cancel-in-progress` u concurrency grupi) je bezbedno za testove i build-ove, ali nije automatski bezbedno za deployment-e i migracije:

- da li novije pokretanje može da prekine deployment na pola i ostavi mešanu flotu?
- da li može da ubije migraciju usred naredbe ili usred backfill-a?
- posle prekida, da li sledeće pokretanje kreće od konzistentnog stanja ili pretpostavlja da je prethodno završeno?
- da li se deploy poslovi serijalizuju po okruženju umesto da se prekidaju?

Proveri stvarno ponašanje provajdera pri prekidu (graceful signal ili hard kill, timeout).

## 60. PIPELINE RETRY

Non-idempotent steps.

## 61. PACKAGE PUBLISH

Version collision.

## 62. CONTAINER PUBLISH

Mutable tags.

## 63. SIGNING

Only trusted final artifact.

## 64. INFRA DEPLOY

Terraform/app deploy ordering.

## 65. CONFIG DEPLOY

Config može biti breaking čak i kada code nije promenjen.

## 66. SECRET ROTATION

Old/new application compatibility.

## 67. DATABASE BACKUP PRE RISKY MIGRATION

Ako architecture/process to zahteva.

Ne koristi backup kao izgovor za unsafe migration.

## 68. PREVIEW DEPLOY

Koji secrets/data dobija?

## 69. PR DEPLOY

Untrusted code + public URL + provider tokens.

## 70. PIPELINE DEPENDENCIES

Actions/plugins/images/build tools.

## 71. REMOTE SCRIPTS

Pin + verify.

## 72. RUNNER TRUST

Hosted vs self-hosted.

## 73. CACHE

Can poisoned cache influence final artifact?

## 74. WORKSPACE CONTAMINATION

Self-hosted runners.

## 75. CLEAN CHECKOUT

Release build mora biti iz očekivanog source-a.

## 76. GENERATED FILES

Uncommitted generated output differences.

## 77. MONOREPO

Path-based pipelines mogu propustiti shared dependency change.

## 78. SELECTIVE TESTING

Changed-files optimization mora razumeti dependency graph.

## 79. BUILD MATRIX

Jedna kombinacija možda nije testirana a deployovana je.

## 80. PLATFORM ARCH

amd64/arm64.

## 81. RUNTIME VERSION

CI test runtime vs production runtime.

## 82. DB VERSION

Integration tests.

## 83. ENVIRONMENT VARIABLE

Missing production env može biti otkriven tek posle deployment-a.

## 84. CONFIG VALIDATION

Pre deploy-a.

## 85. SECRET VALIDATION

Ne printati value.

## 86. DNS/TLS DEPLOY

Infrastructure changes mogu zahtevati propagation.

## 87. CDN INVALIDATION

Old frontend + new backend compatibility.

## 88. STATIC ASSET HASHING

Old HTML/new assets.

## 89. SERVICE WORKER

PWA update može držati star client posle backend deploy-a.

## 90. MOBILE CLIENT

Backend mora ostati compatible sa starim mobile app verzijama prema support window-u.

## 91. DESKTOP CLIENT

Isto.

## 92. FEATURE ROLLOUT

Gradual activation.

## 93. DEPLOY OBSERVABILITY

Poveži release SHA sa logs/metrics/traces.

## 94. RELEASE MARKER

Monitoring treba znati kada je deployment počeo.

## 95. ERROR SPIKE

Pre/posle deploy.

## 96. PIPELINE ALERT

Failed deploy mora imati owner/signal.

## 97. MANUAL HOTFIX

Kako prolazi kroz controls?

## 98. BREAK-GLASS DEPLOY

Ako postoji:

- authorization

- audit

- post-review

## 99. DIRECT PLATFORM DEPLOY

Može li neko zaobići CI i deployovati lokalno?

## 100. CONFIG CLICKOPS

Može menjati runtime bez Git evidence-a.

## 101. ACCESS REVIEW

Ko može deploy production?

## 102. SHARED CREDENTIAL

Attribution.

## 103. AUDIT LOG

Deploy actor, SHA, time.

## 104. SUPPLY CHAIN

Zaključane third-party akcije, plugin-ovi i build alati; integritet lockfile-a; install skripte koje rade sa kredencijalima pipeline-a. Ovde zabeleži rizik; zaseban supply-chain audit pokriva dubinu zavisnosti.

## 105. MANDATORY FAILURE WALKTHROUGH

Za svaki scenario navedi šta pipeline danas radi, u kakvom stanju ostaje production, kako se to otkriva i kako se oporavlja:

```text
tests pass on commit A, commit B is deployed
tests pass, build fails
build passes, deploy fails
artifact is replaced in the registry after tests passed
migration fails midway
migration succeeds, application deploy fails
application succeeds, worker deploy fails
deploy stops at 50% of the fleet
deploy is cancelled halfway
smoke test fails after traffic is switched
rollback itself fails
artifact registry or deployment provider is unavailable during deploy or rollback
a required secret is missing in the target environment
rollback artifact no longer exists
```

## 106. MATRICES

### Pipeline Stage Matrix

| Stage | Input | Output | Code trust level | Secrets available | Failure behavior | Blocks deploy |
|---|---|---|---|---|---|---|

### Deployment Authority Matrix

| Principal (person, job, token) | Environments | Can deploy arbitrary SHA | Secrets | Rollback | Audited |
|---|---|---|---|---|---|

### Artifact Promotion Matrix

| Artifact | Identifier (digest) | Built once | Dev | Staging | Production | Retained for rollback |
|---|---|---|---|---|---|---|

## 107. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Stage:
Environment:
Scope (pipeline, job, component):
Trigger (event, actor, condition):
Artifact / SHA:
Current control:
Expected invariant (tested = deployed, authorized deployer, recoverable failure):
Failure / exploit path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Verification:
Rollback considerations:
Regression risk:
```

## 108. SEVERITY

- **P0** - nepoverljivi kod može da dođe do production kredencijala ili kredencijala za objavljivanje, ili bilo ko van predviđene grupe može da deploy-uje proizvoljan kod u production.
- **P1** - netestiran ili nepregledan kod može da stigne u production kroz normalnu putanju (pregledan A, deploy-ovan B; promenljivi artefakti zamenjeni posle testiranja), ili rutinski otkaz ostavlja production u stanju koje ne može da se oporavi ili ne radi.
- **P2** - značajne praznine u pouzdanosti: artefakti za rollback se ne čuvaju, migracije nemaju redosled ili nisu bezbedne za ponavljanje, delimični deploy-evi se ne otkrivaju, slaba verifikacija posle deploy-a na kritičnim tokovima.
- **P3** - ograničene slabosti: nedostaju veze za vidljivost, nestabilne kapije, manje razlike između okruženja.
- **P4** - hardening: potpisivanje, provenance attestations, uže ograničenje gde ne postoji trenutna putanja.

## 109. OUTPUT

`CICD_PIPELINE_AUDIT.md`

## 110. SECOND PASS

Ponovo prođi lanac kao napadač i kao operater koji nema sreće:

- kao contributor samo sa pravom na pull request: koja faza izvršava tvoj kod i do čega može da dođe?
- kao neko sa pravom upisa u jedan repozitorijum ili putanju registry-ja: da li možeš da zameniš ono što production preuzima?
- kao pipeline tokom incidenta: dva deploy-a istovremeno, prekinut deploy, neuspela migracija, nedostupan registry, secret koji nedostaje
- kao dežurni inženjer: da li možeš da utvrdiš koji commit radi, da vratiš kod, konfiguraciju i podatke i da proveriš rezultat?

Zatim pokušaj da opovrgneš svaki nalaz: da li branch protection, pravila okruženja ili politike registry-ja (van repozitorijuma) već blokiraju putanju? Označi ih kao **NOT VERIFIED** ako ne možeš da ih vidiš.

## 111. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da odgovara na:

- tačan production SHA i digest artefakta za svaku komponentu i kako se prate
- da li je testirani artefakt isti kao deploy-ovani (build once, promote)
- da li su odobrenja vezana za odobreni commit ili artefakt
- granicu secrets-a: koje faze izvršavaju nepoverljiv kod i do kojih secrets-a mogu da dođu
- redosled migracija, bezbednost ponavljanja i kombinacije otkaza migracije i deploy-a
- ponašanje konkurentnosti i prekida za deploy i migration poslove
- otkrivanje delimičnog deploy-a i ponašanje mešanih verzija
- rollback za kod, konfiguraciju i podatke, uključujući čuvanje artefakata
- verifikaciju kritičnih tokova posle deploy-a, a ne samo health check-ove
- izolaciju kredencijala i podataka po okruženjima
- vidljivost deployment-a (release markeri, SHA u logovima i metrikama)
- direktne putanje zaobilaženja (lokalni CLI deploy, izmene u konzoli, break-glass)
- da su statusi i evidence tier-ovi dosledno primenjeni

# KONAČNO PRAVILO

Tražim problem poput:

```text
PR tests commit A
↓
merge occurs
↓
main changes to commit B
↓
manual deploy job builds current main
↓
approval still belongs to A
↓
untested/unreviewed B enters production
```

ili:

```text
staging build
↓
tests pass
↓
production rebuilds from source
↓
floating dependency resolves newer version
↓
production artifact nije isti kao tested artifact
```

Drugi failure chain-ovi koje tražim:

```text
deploy workflow uses a concurrency group with cancel-in-progress
↓
release 1 starts a backfill migration
↓
release 2 is merged a minute later and cancels the running job
↓
migration process is killed mid-batch; no checkpoint
↓
schema is half-migrated and release 2 assumes it is complete
```

```text
registry cleanup keeps the last 10 images
↓
busy week produces 40 builds
↓
incident requires rollback to last week's release
↓
image digest no longer exists
↓
rollback means rebuilding old source with today's dependencies
```
