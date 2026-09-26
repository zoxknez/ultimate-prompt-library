---
id: UPL-IT-048
number: 48
slug: environment-configuration-audit
title: Environment Configuration Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# ENVIRONMENT CONFIGURATION AUDIT

Želim izvršiti forensic audit svih environment variables, config files, runtime flags, platform settings i environment-specific behavior-a.

Glavni cilj:

> Utvrditi da li pogrešna, missing, stale, duplicated ili cross-environment konfiguracija može izazvati security bypass, outage, data corruption, pogrešan provider, production-to-staging leak, debugging exposure ili rollback failure.

## 1. NON-GOALS

- bezbednost skladištenja secrets-a u celini (hardening vault-a, KMS dizajn); samo kako konfiguracija stiže do aplikacije i kako je ona tumači
- stilske preferencije za imenovanje ili raspored fajlova bez failure path-a
- zamena sistema za konfiguraciju ili zahtevanje konkretne biblioteke
- pregled svake nekritične promenljive podjednako duboko; prioritet imaju vrednosti koje utiču na bezbednost, rutiranje podataka, novac, dostupnost i spoljne sporedne efekte

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

```text
Languages/runtimes and the configuration library or parser in use:
Environments that exist (development, preview, staging, production, others):
Where each environment's values are stored and who can change them:
Deployment units that read configuration (web, workers, cron, functions, clients):
Build-time consumers (frontend bundlers, static generation, container build args):
Remote configuration or feature flag providers:
How configuration changes are deployed (restart, redeploy, hot reload):
```

Pravila parsiranja i prioriteta razlikuju se između biblioteka, platformi i verzija. Proveri ponašanje detektovanog parser-a i platforme umesto da ga pretpostavljaš.

## 3. EVIDENCE MODEL

```text
A - observed: effective runtime value, startup log, config dump (redacted) or a test with the value set shows the behavior
B - complete path: every source, the precedence rule and the parsing code are visible
C - strong static evidence: code path is clear, but the actual value in an environment is not visible
D - inference: depends on platform values or precedence not verified
E - hardening: stronger validation or separation without a current failure path
```

Nikada ne ispisuj vrednosti secrets-a u izveštaju; navodi ih po imenu i opiši njihovo stanje (nedostaje, podrazumevana, deljena, zastarela, test režim).

## 4. FINDING STATUS

- **CONFIRMED** - dokaz tier A ili B pokazuje pogrešnu efektivnu vrednost ili failure path.
- **LIKELY** - tier C: kod bi pao sa verovatnom vrednošću, ali vrednost u okruženju nije viđena.
- **NOT VERIFIED** - zavisi od vrednosti ili prioriteta u okruženjima koja nisu mogla da se pregledaju.
- **NOT APPLICABLE** - promenljiva ili okruženje ne postoje.
- **CONTROLLED** - validacija, izolacija ili zaštita neutrališu rizik.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza bezbednosti, ispravnosti, pouzdanosti, rutiranja podataka ili rada.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Vrednost deljena između okruženja nije automatski pogrešna: javni URL-ovi trećih strana, podrazumevane vrednosti funkcija, formati logova i identifikatori koji nisu secret često su identični. Postaje nalaz kada deljenje omogućava jednom okruženju da čita, piše, potpisuje ili pokreće sporedne efekte u drugom.
- Podrazumevana vrednost u kodu je u redu kada je bezbedna u svakom okruženju u kom može da se primeni (na primer konzervativan timeout); nalaz je kada je kredencijal, pokazuje na stvaran resurs ili slabi bezbednost.
- Publishable ključ ili javni DSN u client bundle-u su očekivani.
- Duple definicije sa identičnim vrednostima su napomena o održavanju, a ne defekt.
- Nedokumentovana opciona promenljiva nije rizik za deployment.

## 6. INVENTARIŠI CONFIG SOURCES

- `.env*`
- config files
- secret manager
- Docker
- CI
- Vercel/platform env
- Kubernetes ConfigMap/Secret
- CLI flags
- database-stored config
- remote config

## 7. SOURCE HIERARCHY AND PRECEDENCE

Navedi svaki sloj koji može da obezbedi vrednost, redosledom kojim ih runtime zaista primenjuje:

```text
code default
-> committed config files (per environment)
-> .env files (which ones are loaded, in which order, in which environments)
-> container image (ENV, build args)
-> CI/CD injected variables
-> secret manager (fetched at build, at start, or per request)
-> platform environment settings
-> runtime remote config / feature flags
-> command-line flags
```

Za svaku kritičnu promenljivu navedi **izvor efektivne vrednosti** u svakom okruženju. Vrednost podešena u dashboard-u koju pregazi ugrađeni `ENV` iz image-a ili commit-ovan `.env.production` je čest tihi otkaz.

## 8. CONFIG SCHEMA

Za svaku vrednost:

```text
Name:
Type:
Required:
Secret:
Environment:
Default:
Validated:
Consumer:
Restart required:
```

## 9. REQUIRED VARIABLES

Critical var ne sme tiho fallbackovati na dangerous default.

## 10. TYPE VALIDATION

String:

```text
"false"
```

nije boolean false ako parser pogreši.

## 11. NUMERIC VALIDATION

- negative
- zero
- NaN
- too high

## 12. URL VALIDATION

Database/provider/base URLs.

## 13. ENUM

Environment name/strategy.

## 14. CONFIG FAIL FAST

Production treba da odbije startup ako nema critical config.

## 15. TYPED SCHEMA AND UNITS

Svaka kritična vrednost treba da se parsira u tip jednom, pri pokretanju, sa eksplicitnim pravilima:

```text
boolean   : accepted literals ("true"/"false", "1"/"0"); anything else rejected, not truthy
integer   : range checked; NaN, negative and zero handled deliberately
duration  : unit explicit in the name or value (TIMEOUT_MS, "30s"); zero meaning defined
size      : unit explicit (bytes, MB vs MiB)
URL       : scheme, host and path validated; https required where it matters
enum      : closed set; unknown value rejected
JSON      : parsed and schema-validated; parse error stops startup
secret    : non-empty, expected format, no surrounding whitespace or newline
```

Proveri da li aplikacija brzo pada na neispravnoj kritičnoj konfiguraciji ili se pokreće u degradiranom ili nebezbednom stanju. Neslaganja jedinica (sekunde pročitane kao milisekunde, MB naspram MiB) su nalazi ispravnosti kada menjaju timeout, limit ili TTL za redove veličine.

## 16. DEFAULT SECRET

Critical.

## 17. DEFAULT DB

Ne sme slučajno koristiti development DB u production-u.

## 18. LOCALHOST FALLBACK

Cloud app može krenuti broken umesto fail-fast.

## 19. DANGEROUS DEFAULTS

Pronađi fallback vrednosti koje se aktiviraju kada vrednost nedostaje ili je prazna i klasifikuj ih:

```text
debug or development mode enabled
authentication or authorization bypass
localhost or development service URLs
test/sandbox payment, email or SMS providers
TLS verification disabled
public storage or permissive CORS
hard-coded signing keys, passwords or tokens
mock providers
```

Promenljiva koja nedostaje u production-u mora ili da zaustavi pokretanje ili da pređe na **bezbednije** ponašanje, nikada na permisivnije.

## 20. PROD/STAGING COLLISION

Uporedi vrednosti.

## 21. SHARED DB

High priority.

## 22. SHARED STORAGE

## 23. SHARED SIGNING SECRET

## 24. SHARED OAUTH CREDENTIAL

## 25. SHARED WEBHOOK SECRET

## 26. SHARED QUEUE

Cross-environment job contamination.

## 27. SHARED RESOURCES ACROSS ENVIRONMENTS

Za svaki resurs dostupan iz više od jednog okruženja (baza, Redis, red, storage bucket, OAuth klijent, webhook secret, ključ za potpisivanje, nalog za email/SMS/plaćanje) odgovori:

- Da li izolaciju obezbeđuju odvojeni kredencijali, namespace/prefiks ili ništa?
- Da li neproduction okruženje može da **čita** production podatke, da ih **piše**, da **preuzima** production poslove, da **potpisuje** tokene koje production prihvata ili da **pokreće** stvarne spoljne sporedne efekte?
- Da li čišćenje, migracija ili flush u jednom okruženju pogađa drugo?

Prijavi konkretnu putanju između okruženja, a ne samu činjenicu deljenja.

## 28. EMAIL/SMS PROVIDER

Staging ne treba slučajno slati stvarnim korisnicima ako product process to ne želi.

## 29. PAYMENT MODE

Test/live credential mismatch.

## 30. FEATURE FLAG

Environment-specific.

## 31. DEBUG

Production:

```text
DEBUG=true
DEV_MODE=true
AUTH_BYPASS=true
```

high priority.

## 32. LOG LEVEL

Debug može expose data/cost.

## 33. CORS ORIGIN

Environment-specific domains.

## 34. COOKIE DOMAIN

Staging/prod overlap.

## 35. COOKIE SECURE

TLS termination awareness.

## 36. BASE URL

Used for:

- reset links
- OAuth callback
- email links

## 37. HOST-DERIVED FALLBACK

Security risk ako trusted base URL nedostaje.

## 38. OAUTH CALLBACK

Production credentials + wrong callback.

## 39. JWT ISSUER/AUDIENCE

Environment separation.

## 40. STORAGE PREFIX

Prod/staging same bucket but distinct prefixes?

Authorization/lifecycle.

## 41. CDN DOMAIN

Wrong origin.

## 42. API BASE URL

Frontend production build ne sme zvati staging backend slučajno.

## 43. BUILD-TIME VS RUNTIME

Critical distinction.

## 44. NEXT/VITE PUBLIC VARS

Browser exposure.

## 45. BUILD CACHE

Changing env may not rebuild expected artifact if cache incorrect.

## 46. CONFIG SNAPSHOT

Rollback semantics.

## 47. OLD ARTIFACT + NEW ENV

Može biti incompatible.

## 48. CONFIGURATION ROLLBACK COMPATIBILITY

Konfiguracija i kod se deploy-uju na različitim vremenskim linijama. Proveri oba smera:

- **stari artefakt, nova konfiguracija** - rollback pokreće kod koji ne zna preimenovane ili novo obavezne promenljive, ili drugačije tumači izmenjenu vrednost
- **novi artefakt, stara konfiguracija** - kod deploy-ovan pre konfiguracije koja mu je potrebna

Preimenovanja i semantičke izmene zahtevaju prelazni period u kom se prihvataju oba imena ili oba značenja.

## 49. ENV RENAMING

Old variable still used by one service.

## 50. DUPLICATE SOURCES

Same config exists in:

- repo
- CI
- platform

Ko pobeđuje?

## 51. PRECEDENCE

Dokumentuj actual order.

## 52. STALE ENV

Unused but valid secret remains.

## 53. SECRET ROTATION

Old/new variable names.

## 54. ROTATION OVERLAP

Za svaki secret koji se rotira (ključevi za potpisivanje, webhook secrets, API ključevi, lozinke baze):

- Da li stara i nova vrednost mogu istovremeno da važe tokom rollout-a?
- Da li su svi potrošači (svaka replika, worker, funkcija, spoljni pozivalac) ažurirani pre nego što se stara vrednost opozove?
- Da li se tokeni potpisani starim ključem i dalje proveravaju dok ne isteknu?
- Šta se dešava ako se rollout vrati usred rotacije?

Rotacija bez preklapanja je ispad zakazan za trenutak rotacije.

## 55. QUOTING

Spaces/newlines.

## 56. MULTILINE PRIVATE KEY

Formatting failure.

## 57. BASE64

Nije encryption.

## 58. TRAILING NEWLINE

Can break exact secrets/certs.

## 59. JSON ENV

Parsing errors.

## 60. CASE

Windows/Linux env semantics differences.

## 61. MISSING ENV IN ONE INSTANCE

Mixed fleet configuration.

## 62. CONFIG DRIFT

Two replicas with different values.

## 63. REPLICA AND DEPLOYMENT-UNIT DRIFT

Uporedi efektivnu konfiguraciju kroz svaku jedinicu koja mora da se slaže: web replike, worker-e, cron poslove, funkcije i regione. Vrednosti koje moraju biti identične (ključevi za potpisivanje, feature flag-ovi koji utiču na format podataka, ciljne baze) izazivaju podeljeno ponašanje kada se razlikuju. Proveri kako konfiguracija stiže do svake jedinice i da li se neka jedinica deploy-uje ili restartuje po drugačijem rasporedu.

## 64. RUNTIME RELOAD

Ako config changes live:

atomicity/consistency.

## 65. REMOTE CONFIG

Failure behavior.

## 66. FEATURE FLAG OUTAGE

Fail-open vs fail-closed.

## 67. FEATURE FLAG SEMANTICS

Za svaki flag koji kontroliše bezbednost, novac, format podataka ili spoljne sporedne efekte:

- **podrazumevana vrednost kada provajder nije dostupan** - fail-open (funkcija uključena) ili fail-closed (funkcija isključena) i da li je to bezbedna strana?
- **zastareo cache** - koliko dugo izmenjenom flag-u treba da stigne do svake instance i šta se dešava u međuvremenu
- **doslednost evaluacije** - da li jedan zahtev ili posao može da vidi različite vrednosti u različitim koracima?
- **targeting** - da li atributi koje kontroliše korisnik (header-i, claims, query parametri) mogu da promene targeting?
- **životni ciklus** - zastareli flag-ovi čija "off" putanja više nije testirana

## 68. KILL SWITCH

Privileged remote config action.

## 69. CLIENT-CONTROLLED CONFIG

Frontend values nisu server authority.

## 70. RATE LIMIT CONFIG

Zero/unlimited semantics.

## 71. TIMEOUT

`0` može značiti no timeout ili immediate timeout.

## 72. RETRY COUNT

Huge value -> retry storm.

## 73. POOL SIZE

Too large -> DB outage.

## 74. CONCURRENCY

Can overwhelm provider.

## 75. UPLOAD LIMIT

Units:

- bytes
- MB
- MiB

## 76. TIME UNITS

ms vs seconds.

## 77. CRON

Timezone.

## 78. DATE/TIME

Environment timezone assumptions.

## 79. LOCALE

Parsing.

## 80. PROXY TRUST

`TRUST_PROXY=true` can alter IP/security behavior.

## 81. SESSION CONFIG

Cookie/expiry.

## 82. CACHE CONFIG

TTL units/stale data.

## 83. DATABASE SSL

Production security.

## 84. CERT VALIDATION

`NODE_TLS_REJECT_UNAUTHORIZED=0` or equivalents are critical.

## 85. INSECURE HTTP

Provider URL.

## 86. STORAGE PUBLIC FLAG

Dangerous one-bit config.

## 87. MAINTENANCE MODE

Authorization.

## 88. ADMIN BOOTSTRAP

Default credentials/config.

## 89. MIGRATION FLAG

Auto-migrate in prod.

## 90. SEED FLAG

Production seed/reset.

## 91. TEST MODE

Payment/email/auth.

## 92. MOCK PROVIDER

Must not accidentally remain in prod.

## 93. ERROR REPORTING DSN

Public DSN may be intentional; auth tokens are not.

## 94. MONITORING SAMPLE RATE

Cost/performance.

## 95. PII LOGGING FLAG

Security/privacy.

## 96. ENV DOCS

Compare `.env.example` vs actual usage.

## 97. UNUSED DOCUMENTED VAR

Can confuse operations.

## 98. UNDOCUMENTED REQUIRED VAR

Deploy risk.

## 99. CONFIG TEST

Automated schema validation.

## 100. MANDATORY FAILURE WALKTHROUGH

Za svaki scenario navedi trenutno ponašanje, kako se otkriva i kako se oporavlja:

```text
DATABASE_URL (or another critical URL) is missing in production
"false" is parsed as truthy
timeout is set to 0
a duration or size is configured in the wrong unit
a staging credential is used in production
a production secret is available to a preview or staging build
TLS verification is disabled by a variable
an old artifact runs with the new configuration (rollback)
the feature flag provider is unavailable
one replica has a different value than the others
```

## 101. MATRICES

### Configuration Source / Precedence Matrix

| Config | Code default | Files | Image/CI | Secret manager | Platform | Remote config | Effective source | Parsed type and validation |
|---|---|---|---|---|---|---|---|---|

### Environment Comparison Matrix

| Config | Dev | Preview | Staging | Prod | Shared | Cross-environment path | Risk |
|---|---|---|---|---|---|---|---|

## 102. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Variable/config:
Environment:
Secret (yes/no):
Scope (deployment units affected):
Trigger:
Current / default value state:
Effective source and precedence:
Consumer:
Expected invariant:
Failure path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Validation test:
Regression risk:
```

## 103. SEVERITY

- **P0** - konfiguracija koja isključuje autentikaciju ili TLS proveru u production-u, javno izlaže production secrets ili omogućava neproduction okruženju da piše u production ili potpisuje za njega.
- **P1** - production tiho rutiran na pogrešnu bazu, provajdera ili okruženje, neslaganje test/live režima sa stvarnim novcem ili porukama, ili opasna podrazumevana vrednost koja se aktivira kada vrednost nedostaje.
- **P2** - pogrešno parsirane vrednosti ili vrednosti u pogrešnoj jedinici koje utiču na timeout-e, limite ili ponovne pokušaje; rotacija bez preklapanja; konfiguracija nekompatibilna sa rollback-om; razlike između replika.
- **P3** - ograničeni problemi: zastarele promenljive, nedostajuća dokumentacija za obavezne vrednosti, nekritični duplikati sa različitim vrednostima.
- **P4** - hardening: tipizirana šema, stroža validacija, gde ne postoji trenutni failure path.

## 104. OUTPUT

`ENVIRONMENT_CONFIGURATION_AUDIT.md`

## 105. SECOND PASS

Testiraj ili analiziraj:

- ukloni svaku kritičnu promenljivu i pokreni servis
- neispravne boolean, integer, URL i JSON vrednosti
- nula, negativne i veoma velike numeričke vrednosti; pogrešne jedinice
- staging ključ u production-u i production ključ u preview-u
- ogroman connection pool ili vrednost konkurentnosti
- aktiviran debug režim
- isključena TLS provera
- zastareo secret koji je i dalje prisutan
- rollback starog artefakta sa trenutnom konfiguracijom
- provajder feature flag-ova nedostupan pri pokretanju i tokom rada
- jedna replika restartovana sa drugačijom vrednošću

Zatim pokušaj da opovrgneš svaki nalaz: da li kasniji sloj pregazi vrednost, da li validacija pri pokretanju odbija vrednost ili je opasna putanja koda nedostupna u tom okruženju? Nalaze koji zavise od neviđenih vrednosti okruženja označi kao **NOT VERIFIED**.

## 106. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da pokriva:

- svaki izvor konfiguracije i stvarni redosled prioriteta
- izvor efektivne vrednosti za svaku kritičnu vrednost po okruženju
- obavezne vrednosti, tipizirano parsiranje, jedinice i fail-fast ponašanje
- opasne podrazumevane vrednosti kada vrednost nedostaje
- izolaciju okruženja i svaki deljeni resurs sa njegovom putanjom između okruženja
- granicu secret/public i čitanje u build-time ili runtime
- kompatibilnost konfiguracije sa rollback-om u oba smera
- preklapanje pri rotaciji secrets-a
- razlike između replika i jedinica deployment-a
- fail-open/fail-closed ponašanje i zastarevanje feature flag-ova
- TLS, cookie, CORS, base URL i proxy trust podešavanja
- test/mock/seed/migration flag-ove u production-u
- da nijedna vrednost secret-a nije ispisana u izveštaju
- dosledne statuse i evidence tier-ove

# KONAČNO PRAVILO

Tražim:

```text
DATABASE_URL missing
↓
fallback:
postgres://localhost/dev
↓
production starts successfully
↓
healthcheck returns 200
↓
all writes go to wrong database/environment
```

ili:

```text
TLS_VERIFY env parser:
Boolean(process.env.TLS_VERIFY)
↓
TLS_VERIFY="false"
↓
Boolean("false") == true
↓
runtime behavior opposite configuration intent
```

Drugi failure chain-ovi koje tražim:

```text
REQUEST_TIMEOUT=30 set in the platform
↓
code treats the value as milliseconds
↓
every outbound call times out after 30 ms
↓
retries multiply load on the provider
↓
checkout fails under normal traffic
```

```text
staging and production share one Redis instance
↓
both use the same queue name
↓
staging worker consumes production jobs
↓
jobs run with staging configuration and staging database
↓
production emails, payments or exports are lost or corrupted
```
