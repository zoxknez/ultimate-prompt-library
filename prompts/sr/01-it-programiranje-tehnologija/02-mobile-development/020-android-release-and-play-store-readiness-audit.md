---
id: UPL-IT-020
number: 20
slug: android-release-and-play-store-readiness-audit
title: Android Release & Play Store Readiness Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# ANDROID RELEASE AND PLAY STORE READINESS AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu spremnosti kompletne Android aplikacije za stvarni release i distribuciju kroz Google Play.

Glavni cilj:

> Utvrditi da li aplikacija može bezbedno, reproduktivno i pouzdano da se izgradi, potpiše, objavi, instalira, ažurira i koristi u production okruženju bez release-only crash-eva, pogrešne konfiguracije, curenja secrets-a, problema sa R8/ProGuard-om, target SDK zahtevima, permission modelom, manifestom, App Bundle-om, versioning-om, signing-om ili Play policy zahtevima.

Ovo nije:

- običan `assembleRelease` test
- generički Play Store checklist
- savet da se samo poveća `versionCode`
- automatsko update-ovanje svih dependency-ja
- površna provera manifest fajla
- zamena za security audit
- zamena za kompletan privacy/legal audit
- pretpostavka da debug build koji radi znači da je release spreman
- pretpostavka da build koji prolazi znači da aplikacija radi u production-u

Fokus je na celom release lancu:

```text
source
↓
dependencies
↓
Gradle configuration
↓
release build
↓
R8 / shrinking
↓
signing
↓
AAB/APK
↓
Play delivery
↓
installation/update
↓
production runtime
```

Prioritet:

**release correctness > update safety > signing/security > production configuration > store compliance > runtime reliability > build optimization**

Bolje je pronaći 5 stvarnih release blocker-a nego napisati 100 generičkih Play Store preporuka.

---

# 1. UTVRDI RELEASE STACK

Pre bilo kakvog finding-a utvrdi:

- Android Gradle Plugin verziju
- Gradle verziju
- Kotlin verziju
- JDK verziju
- `compileSdk`
- `targetSdk`
- `minSdk`
- build tools ako su eksplicitno definisani
- versionCode
- versionName
- build types
- product flavors
- signing configs
- R8/minification
- resource shrinking
- manifest
- dependency model
- AAB/APK output
- CI/CD
- Play publishing automation ako postoji

Ne koristi zastarele Android/Play pretpostavke.

Ako Play policy zahtev zavisi od trenutnog datuma ili aktuelnog Google zahteva:

**VERIFY CURRENT PLAY POLICY BEFORE CONCLUSION**

Ako ne možeš proveriti aktuelni zahtev:

**PLAY POLICY STATUS: NOT VERIFIED**

---

# 2. MAPIRAJ RELEASE PIPELINE

Napravi stvarni flow:

```text
Git commit
↓
CI/local Gradle
↓
release variant
↓
minification
↓
resource shrinking
↓
signing
↓
AAB
↓
Play Console
↓
track
↓
user device
```

Ako postoje:

- internal
- closed
- open testing
- production

mapiraj svaki relevantan track.

---

# 3. BUILD TYPES

Pregledaj:

```text
debug
release
```

i sve custom varijante.

Za svaki utvrdi:

- debuggable
- minifyEnabled
- shrinkResources
- signing
- applicationIdSuffix
- API URL
- logging
- feature flags
- analytics
- crash reporting

---

# 4. DEBUG VS RELEASE DIFF

Jedan od najvažnijih delova audita.

Napravi tabelu:

| Setting | Debug | Release | Risk |
|---|---|---|---|

Za:

- API endpoint
- logging
- certificates
- feature flags
- mock data
- test accounts
- network security
- analytics
- remote config

---

# 5. RELEASE BUILD

Ako tooling dozvoljava, pokušaj pravi release build.

Na primer:

```text
./gradlew assembleRelease
```

ili:

```text
./gradlew bundleRelease
```

Ako signing/secrets nedostaju:

**RELEASE BUILD: BLOCKED BY MISSING SIGNING/SECRETS**

Nemoj zaobilaziti security samo da build prođe.

---

# 6. BUNDLE RELEASE

Za Play distribuciju proveri AAB output gde je relevantno.

Build APK-a nije zamena za validaciju AAB pipeline-a.

---

# 7. CLEAN BUILD

Ako je bezbedno:

```text
./gradlew clean bundleRelease
```

ili odgovarajući reproducible build flow.

Cilj:

otkriti dependency na stale local outputs.

---

# 8. BUILD REPRODUCIBILITY

Proveri da release ne zavisi od:

- ručno kreiranog fajla
- lokalnog IDE state-a
- necommitovanog config-a
- globalnog environment-a
- specifičnog developera

---

# 9. VERSION CODE

Proveri da:

- raste između release-a
- nije slučajno isti za različite production artefakte
- flavor logic ne pravi collision gde je relevantno

---

# 10. VERSION NAME

VersionName je user-facing metadata.

Proveri consistency sa release procesom.

Ne tretiraj format kao bug ako product nema specifičan zahtev.

---

# 11. MULTI-FLAVOR VERSIONING

Ako postoji više flavor-a:

proveri da versionCode ostaje validan i jedinstven prema distribution modelu.

---

# 12. APPLICATION ID

Utvrdi production:

```text
applicationId
```

Proveri da release ne koristi:

- `.debug`
- `.dev`
- test ID

slučajno.

---

# 13. NAMESPACE VS APPLICATION ID

Ne mešaj Gradle namespace i runtime package/application ID.

Proveri tamo gde deployment/config zavisi od ID-a.

---

# 14. APP LINKS / OAUTH PACKAGE ID

Promena package/application ID-a može uticati na:

- OAuth
- Firebase
- App Links
- API key restrictions

Proveri production config.

---

# 15. SIGNING

Mapiraj:

```text
release signing config
↓
keystore
↓
key alias
↓
credentials
```

Ne prikazuj secret vrednosti.

---

# 16. DEBUG KEY U RELEASE-U

Critical finding ako production artefakt koristi debug certificate.

---

# 17. KEYSTORE U REPOSITORY-JU

Ako je private keystore commitovan u javni ili neadekvatno zaštićen repository:

ozbiljno analiziraj exposure.

Ne reprodukuj binary ili password.

---

# 18. SIGNING PASSWORDS

Traži:

- Gradle files
- properties
- CI config
- scripts

Ako su hardcoded secrets pronađeni:

maskiraj ih u izveštaju.

---

# 19. ENV-BASED SIGNING

Ako signing dolazi iz environment-a:

proveri fail-closed behavior kada env nedostaje.

---

# 20. SILENT FALLBACK NA DEBUG SIGNING

Opasan pattern:

```text
if release credentials missing
↓
use debug signing
```

Production build treba radije jasno da fail-uje nego da tiho promeni trust identity.

---

# 21. PLAY APP SIGNING

Ako koristi Play App Signing:

utvrdi razliku između:

- upload key
- app signing key

Nemoj tvrditi status bez dostupne konfiguracije/Play informacija.

Ako nije dostupno:

**PLAY APP SIGNING: NOT VERIFIED**

---

# 22. KEY ROTATION

Ako projekat ima istoriju signing key promene, proveri documented upgrade path.

Ako nije relevantno:

**NOT APPLICABLE**

---

# 23. CERTIFICATE-BOUND SERVICES

Neki servisi zavise od signing certificate fingerprint-a:

- OAuth
- Maps
- Firebase auth
- App Links-related integrations
- API restrictions

Proveri release fingerprint konfiguraciju.

---

# 24. DEBUG WORKS, RELEASE AUTH FAILS

Klasičan scenario:

```text
debug SHA registered
↓
release SHA missing
↓
OAuth/API works in debug
↓
production auth fails
```

Aktivno proveri.

---

# 25. R8

Ako release koristi R8:

mapiraj:

- minification
- shrinking
- optimization
- obfuscation

---

# 26. RELEASE-ONLY CRASH SURFACE

Traži code koji zavisi od:

- reflection
- class names
- method names
- annotations
- generic metadata
- serialization
- JNI

---

# 27. REFLECTION

Ako code radi:

```text
Class.forName(...)
```

proveri da R8 ne ukloni/preimenuje target.

---

# 28. `javaClass.name`

Ako business logic zavisi od runtime class name-a, obfuscation može promeniti ponašanje.

```kotlin
javaClass.name
javaClass.simpleName
```

---

# 29. SERIALIZATION

Za Gson/Moshi/Kotlin serialization i druge sisteme utvrdi stvarni R8 contract.

Ne dodaj broad keep rules bez potrebe.

---

# 30. REFLECTIVE SERIALIZATION

Reflection-based serializer može zahtevati metadata/classes koje shrinker može ukloniti.

Proveri library dokumentaciju za stvarnu verziju ako je potrebno.

---

# 31. ANNOTATIONS

Ako runtime reflection zavisi od annotations, proveri retention/keep attributes.

---

# 32. JNI

Native lookup po class/method imenu može pasti posle obfuscation-a ako keep rules nisu odgovarajući.

---

# 33. WEBVIEW JAVASCRIPT BRIDGE

Methods pozvane iz JS-a mogu zahtevati odgovarajuću zaštitu od shrinking/obfuscation-a u zavisnosti od implementation-a.

---

# 34. CUSTOM VIEWS IZ XML-A

Ako class ime živi u XML/resource-u, proveri shrinker/framework handling.

Ne prijavljuj ako toolchain to automatski rešava.

---

# 35. NAVIGATION / SAFE ARGS

Ako destination/class reference zavisi od generated metadata, proveri actual release build.

---

# 36. R8 WARNINGS

Pregledaj warnings.

Klasifikuj:

```text
ACTIONABLE
KNOWN SAFE
DEPENDENCY ISSUE
NOT VERIFIED
```

Ne koristi `-dontwarn **` kao univerzalni fix.

---

# 37. BROAD KEEP RULES

Pravila tipa:

```text
-keep class ** { *; }
```

mogu praktično poništiti shrinking.

Klasifikuj kao optimization/maintenance problem osim ako kriju correctness issue.

---

# 38. RESOURCE SHRINKING

Ako je uključen:

proveri dynamic resource lookup:

- `getIdentifier`
- reflection-like naming
- asset references

---

# 39. DYNAMIC RESOURCE NAME

Resource referenced samo stringom može biti high-risk za shrinking.

Proveri keep config i actual release output.

---

# 40. NATIVE LIBRARIES

Ako postoje `.so` biblioteke:

proveri ABI packaging.

---

# 41. ABI MATRIX

Mapiraj:

- arm64-v8a
- armeabi-v7a
- x86/x86_64

samo prema target device scope-u.

---

# 42. MISSING ABI

Ako app targetira device sa ABI koji nije isporučen:

instalacija ili native feature može pasti.

---

# 43. NATIVE SYMBOLS

Ako crash reporting/native debugging zahteva symbols:

proveri upload pipeline ako postoji.

---

# 44. APP BUNDLE SPLITS

AAB može generisati device-specific split APK-ove.

Proveri da app ne očekuje resource/native asset koji split delivery ne isporučuje kako code pretpostavlja.

---

# 45. DYNAMIC FEATURES

Ako postoje Dynamic Feature Modules:

analiziraj:

- install state
- unavailable module
- navigation
- version compatibility

Ako ne:

**NOT APPLICABLE**

---

# 46. ON-DEMAND FEATURE

UI ne sme pretpostaviti da module code/resources već postoje pre installation completion-a.

---

# 47. ASSET PACKS

Ako postoje Play Asset Delivery paketi:

proveri download/availability/error state.

Ako ne:

**NOT APPLICABLE**

---

# 48. MANIFEST MERGE

Analiziraj finalni merged release manifest, ne samo source manifest.

Dependencies mogu dodati:

- permissions
- providers
- services
- receivers
- activities

---

# 49. RELEASE MANIFEST

Proveri finalne vrednosti:

- debuggable
- allowBackup
- usesCleartextTraffic
- exported
- permissions
- application label
- theme
- network security
- services

---

# 50. `android:debuggable`

Release mora imati očekivano production ponašanje.

Finalni production manifest treba da potvrdi:

```xml
android:debuggable="false"
```

Ako finalni manifest kaže debuggable=true bez razloga:

P1/P0 zavisno od threat modela.

---

# 51. BACKUP

Proveri:

- `allowBackup`
- data extraction rules
- Auto Backup

u odnosu na podatke aplikacije.

---

# 52. CLEARTEXT

Ako production nepotrebno dozvoljava HTTP:

security finding.

Ali proveri da li određeni local/device integration legitimno zahteva cleartext.

---

# 53. NETWORK SECURITY CONFIG

Pregledaj release variant.

Debug-specific trust anchors ne smeju slučajno procureti u production.

---

# 54. USER CERTIFICATES

Debug config može dozvoliti user-installed CA radi proxy debugging-a.

Proveri da production config nije slučajno isti ako threat model to ne dozvoljava.

---

# 55. CERTIFICATE PINNING

Ako postoji:

proveri expiry/rotation/recovery.

Ne preporučuj pinning automatski.

---

# 56. EXPORTED COMPONENTS

Na finalnom release manifestu proveri:

- Activity
- Service
- Receiver
- Provider

i njihove permissions.

---

# 57. INTENT FILTERI

Intent filter može promeniti exported behavior.

Proveri actual merged manifest.

---

# 58. DEEP LINKS

Production host/scheme mora biti ispravan.

---

# 59. DEBUG DEEP LINK

Ne ostavljaj production app vezanu za test/dev domain bez namere.

---

# 60. APP LINKS

Ako postoje:

proveri:

- scheme
- host
- path
- autoVerify
- domain verification

Ako domain nije runtime proverljiv:

**APP LINKS PRODUCTION VERIFICATION: NOT VERIFIED**

---

# 61. CUSTOM SCHEMES

Proveri collision/hijacking rizik prema auth flow-u.

Detaljni security deo može ići u security audit.

---

# 62. PERMISSIONS INVENTORY

Napravi finalni release permission inventory.

Klasifikuj:

```text
REQUIRED
OPTIONAL
TRANSITIVE
LEGACY
UNUSED
NOT VERIFIED
```

---

# 63. TRANSITIVE PERMISSIONS

Dependency može dodati permission koji app direktno nije deklarisao.

Ako je permission nepotreban, uklanjanje kroz manifest merge pravilo može izgledati ovako:

```xml
<uses-permission android:name="..." tools:node="remove" />
```

Merged manifest je source of truth.

---

# 64. UNUSED DANGEROUS PERMISSION

Ako release traži permission koji feature više ne koristi:

- privacy
- Play review
- UX

problem.

---

# 65. RUNTIME PERMISSIONS

Proveri da runtime flow odgovara target Android verzijama.

---

# 66. NOTIFICATION PERMISSION

Ako relevantno za target Android verziju:

proveri da app ne pretpostavlja da su notifications automatski dozvoljene.

---

# 67. MEDIA PERMISSIONS

Ako radi sa slikama/audio/video:

proveri current permission model prema target SDK-u.

---

# 68. PHOTO PICKER

Ako app može koristiti system picker bez broad storage permission-a, to može biti improvement.

Ne prepisuj feature samo radi modernosti.

---

# 69. BACKGROUND LOCATION

Ako se traži, mora imati stvarnu feature potrebu.

Ovo može imati i Play policy implikacije.

Aktuelna pravila moraju biti proverena pre finalnog compliance zaključka.

---

# 70. EXACT ALARM

Ako koristi exact alarms:

proveri:

- permission model
- realnu potrebu
- fallback

---

# 71. FOREGROUND SERVICE TYPES

Ako postoje FGS:

proveri manifest type i stvarnu funkcionalnost.

---

# 72. FOREGROUND SERVICE PERMISSIONS

Savremene Android verzije imaju dodatne zahteve prema tipu FGS-a.

Aktuelni requirement potvrdi pre konačnog compliance finding-a.

---

# 73. BACKGROUND EXECUTION

Release mora poštovati savremena ograničenja za background services/jobs.

Debug test sa app-om stalno otvorenim nije dovoljan.

---

# 74. PACKAGE VISIBILITY

Ako app query-uje druge instalirane aplikacije:

proveri `<queries>` i stvarnu potrebu.

---

# 75. QUERY_ALL_PACKAGES

Ako postoji:

ozbiljno proveri razlog i Play policy scope.

Nemoj donositi current compliance zaključak bez aktuelne provere.

---

# 76. STORAGE

Proveri scoped storage compatibility.

---

# 77. LEGACY EXTERNAL STORAGE

Ako postoji legacy flag:

utvrdi da li još ima efekat na target SDK-u koji projekat koristi.

Ne koristi istorijske pretpostavke.

---

# 78. FILEPROVIDER

Proveri:

- authority
- exported
- grant URI permissions
- paths

---

# 79. PROVIDER AUTHORITY

Flavor/build može promeniti application ID.

Koristi application ID placeholder kada je to odgovarajuće:

```xml
android:authorities="${applicationId}.fileprovider"
```

Hardcoded authority može napraviti install/runtime problem.

---

# 80. MULTIPLE APP INSTALLATION

Ako debug i release treba da mogu koegzistirati, proveri authorities/custom permissions collisions.

Ako nije zahtev:

**NOT APPLICABLE**

---

# 81. CUSTOM PERMISSIONS

Ako aplikacija definiše custom permission:

proveri protection level i uniqueness.

---

# 82. MIN SDK

Proveri da code/resources/API usage imaju odgovarajuće guardove za podržani minimum.

---

# 83. API LEVEL GUARDS

Traži:

```text
Build.VERSION.SDK_INT
```

ali ne pretpostavljaj da svaka nova API funkcija zahteva manual guard ako desugaring/library rešava problem.

---

# 84. `@RequiresApi`

Annotation ne štiti runtime sama po sebi ako call path nije ograničen.

Prati call site.

---

# 85. CORE LIBRARY DESUGARING

Utvrdi da li moderni Java API zahteva/koristi desugaring prema minSdk-u.

Kada je potrebno, Gradle konfiguracija uključuje:

```groovy
coreLibraryDesugaringEnabled true
```

---

# 86. TARGET SDK BEHAVIOR CHANGES

Povećanje targetSdk može promeniti runtime ponašanje.

Pregledaj features koje pogađaju relevantne promene platforme.

Ne generiši generičku listu svih Android promena.

---

# 87. CURRENT TARGET SDK REQUIREMENT

Ako procenjuješ Play submission readiness:

moraš proveriti aktuelan Google Play target API zahtev za datum audita.

Ako nije provereno:

**CURRENT PLAY TARGET REQUIREMENT: NOT VERIFIED**

---

# 88. COMPILE SDK

Compile SDK ne mora biti isti kao targetSdk.

Ne mešaj njihove uloge.

---

# 89. DEPENDENCIES

Pregledaj dependency tree.

Traži:

- conflicts
- duplicate libraries
- incompatible versions
- stale critical dependencies
- vulnerabilities gde evidence postoji

---

# 90. DYNAMIC DEPENDENCY VERSIONS

Izbegni nereproduktivno:

```text
1.+
latest.release
```

u production dependency-ju.

---

# 91. SNAPSHOT DEPENDENCY

Release ne treba slučajno da zavisi od unstable snapshot-a ako nije eksplicitna odluka.

---

# 92. LOCAL AAR/JAR

Ako release zavisi od lokalnog binary-ja:

proveri:

- reproducibility
- source/provenance
- ABI
- licensing gde je relevantno

---

# 93. DEPENDENCY REPOSITORIES

Pregledaj:

- Google
- Maven Central
- JitPack
- private repos
- custom HTTP repo

Insecure HTTP repository je security/supply-chain risk.

---

# 94. REPOSITORY CREDENTIALS

Ne hardcode credentials za private Maven repo.

---

# 95. LOCKING / VERIFICATION

Ako projekat koristi dependency verification/locking, proveri config.

Ako ne:

to je P4 ili supply-chain improvement osim ako reproducibility stvarno trpi.

---

# 96. LICENSES

Ako aplikacija distribuira third-party komponente koje zahtevaju notices/attribution:

proveri postojeći compliance workflow.

Ne pružaj pravni zaključak bez osnova.

---

# 97. OPEN-SOURCE LICENSE SCREEN

Nije univerzalno obavezan u UI-u.

Proceni prema dependency licencama i product/legal requirement-u.

---

# 98. SECRETS INVENTORY

Traži release-sensitive vrednosti:

- API keys
- signing secrets
- OAuth client secrets
- service accounts
- backend admin keys

---

# 99. CLIENT SECRET FALLACY

Secret koji mora biti ugrađen u APK/AAB nije pravi secret od krajnjeg korisnika.

Ako backend veruje takvoj vrednosti kao credential-u:

security design problem.

---

# 100. API KEYS

Client-visible API ključ treba ograničiti koliko provider podržava:

- package
- signing cert
- allowed APIs
- quotas

gde je relevantno.

---

# 101. SERVICE ACCOUNT

Service account private key ne sme biti ugrađen u Android aplikaciju.

Ako postoji:

P0/P1 security finding.

---

# 102. FIREBASE CONFIG

`google-services.json` nije automatski secret.

Ali proveri da security ne zavisi od njegove tajnosti.

---

# 103. ENVIRONMENT CONFIG

Release mora koristiti production:

- API
- OAuth
- analytics
- remote config
- Sentry/Crashlytics project

---

# 104. DEV BACKEND U PRODUCTION-U

Critical config finding:

```text
release
↓
DEV_API_URL
```

---

# 105. STAGING CREDENTIALS

Production build ne treba slučajno da koristi staging client ID/key ako servisi to razlikuju.

---

# 106. FEATURE FLAGS

Mapiraj release defaults.

Feature koji nije production-ready ne sme slučajno biti enabled samo zato što debug config drugačije radi.

---

# 107. REMOTE CONFIG

Remote config ne treba da bude jedina zaštita za security-critical feature.

---

# 108. KILL SWITCH

Ako postoji:

proveri failure mode kada config service nije dostupan.

---

# 109. LOGGING

Release audit:

- log level
- PII
- auth tokeni
- URLs
- request bodies

---

# 110. `Log.d`

Nije svaki debug log ozbiljan problem.

Prijavi ako:

- ostaje u release
- sadrži sensitive data
- pravi performance/noise problem

Primer R8 pristupa za uklanjanje debug log poziva:

```text
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}
```

---

# 111. NETWORK LOGGING INTERCEPTOR

Ako BODY logging ostaje u release:

može izložiti sensitive payload.

---

# 112. CRASH REPORTING

Proveri release enablement i environment.

Ako ne postoji crash reporting:

to je observability improvement, ne runtime bug.

---

# 113. SYMBOL / MAPPING UPLOAD

Za obfuscated release crash-eve potreban je mapping ako crash service treba readable stack traces.

---

# 114. MAPPING FILE RETENTION

Mapping za svaku production verziju treba biti sačuvan ili uploadovan u odgovarajući sistem.

---

# 115. NATIVE DEBUG SYMBOLS

Ako app ima NDK code, proveri symbol upload/retention gde crash debugging to zahteva.

---

# 116. SOURCE MAP / COMPOSE

Koristi odgovarajući mapping/symbol pipeline prema stack-u.

Ne izmišljaj potrebu za web-style source maps.

---

# 117. ANALYTICS

Proveri:

- production project
- debug event filtering
- user identity reset
- consent flow ako postoji requirement

---

# 118. TEST EVENTS U PRODUCTION-U

Release ne treba slati QA/test podatke kao prave analytics events zbog pogrešne environment konfiguracije.

---

# 119. PRIVACY SDK-OVI

Mapiraj sve third-party SDK-ove koji potencijalno obrađuju user/device podatke.

---

# 120. DATA SAFETY

Ako se procenjuje Play Data safety forma:

ne nagađaj.

Mora se mapirati stvarni data collection/share behavior svih SDK-ova i app code-a.

Ako Play Console odgovori nisu dostupni:

**DATA SAFETY DECLARATION CONSISTENCY: NOT VERIFIED**

---

# 121. PRIVACY POLICY

Ako app po funkcionalnosti/policy-ju zahteva privacy policy:

proveri da postoji validan production URL ako je dostupan.

Aktuelne Play zahteve proveri pre kategoričkog zaključka.

---

# 122. BROKEN PRIVACY URL

Ako store listing vodi na 404 ili dev page:

release-readiness problem.

---

# 123. ACCOUNT DELETION

Ako aplikacija omogućava kreiranje account-a i Play pravila zahtevaju deletion path za dati scenario, proveri current requirement i stvarnu implementaciju.

Nemoj koristiti zastarelu policy pretpostavku.

---

# 124. IN-APP ACCOUNT DELETE

Ako feature postoji:

proveri:

- confirmation
- re-auth gde je potrebno
- local cleanup
- pending jobs
- server outcome

---

# 125. EXTERNAL DELETE URL

Ako Play listing zahteva web deletion resource za konkretan app model, proveri validnost.

Samo uz current policy evidence.

---

# 126. ADS

Ako app ima oglase:

mapiraj SDK i ad behavior.

Ako nema:

**NOT APPLICABLE**

---

# 127. AD ID

Proveri manifest permissions/API usage prema aktuelnom target SDK/policy modelu.

---

# 128. CHILD-DIRECTED / FAMILIES

Ako proizvod targetira decu ili families program:

poseban policy audit je potreban.

Ako nije:

ne primenjuj te zahteve automatski.

---

# 129. HEALTH / FINANCE / VPN / SENSITIVE CATEGORIES

Ako aplikacija pripada regulisanijoj Play kategoriji:

proveri relevantne current declarations/policies.

Ne prenosi zahteve jedne kategorije na druge aplikacije.

---

# 130. USER-GENERATED CONTENT

Ako app ima UGC:

proveri moderation/report/block mehanizme prema product/policy scope-u.

---

# 131. SUBSCRIPTIONS

Ako app prodaje digitalni sadržaj/funkcionalnost:

proveri billing architecture i current Play policy applicability.

Ne daj compliance verdict bez current policy provere.

---

# 132. PLAY BILLING LIBRARY

Ako se koristi:

utvrdi verziju i current support requirement.

---

# 133. BILLING RELEASE CONFIG

Debug/test product IDs ne smeju slučajno ostati jedini IDs u release flow-u.

---

# 134. PURCHASE ACKNOWLEDGEMENT

Ako billing postoji, proveri purchase state machine i acknowledgement/consumption model prema aktuelnom API-ju.

---

# 135. PENDING PURCHASE

Release mora pravilno obraditi pending status gde je relevantno.

---

# 136. RESTORE PURCHASES

Entitlement ne treba da zavisi samo od lokalnog boolean-a.

---

# 137. SERVER VERIFICATION

Ako business risk opravdava, proveri backend verification model.

Ne zahtevaj server za trivijalne free features.

---

# 138. PLAY INTEGRITY

Ako postoji Play Integrity:

proveri da li se koristi kao signal, ne kao magična apsolutna zaštita.

Ako nema:

ne zahtevaj automatski.

---

# 139. ROOT DETECTION

Ne koristi root detection kao release-readiness requirement bez threat modela.

---

# 140. APP UPDATES

Najvažniji production scenario:

```text
installed production version N
↓
Play update
↓
version N+1
```

Proveri:

- database migration
- files
- preferences
- auth
- pending jobs
- notifications
- cache

---

# 141. UPDATE TEST

Ne testiraj samo fresh install.

Obavezno razlikuj:

```text
FRESH INSTALL
```

i:

```text
UPGRADE
```

---

# 142. SKIPPED UPDATE

Testiraj korisnika koji preskače više verzija.

---

# 143. DOWNGRADE

Play obično ne predstavlja običan downgrade flow krajnjem korisniku, ali QA/manual install može.

Ako nije podržano:

dokumentuj.

---

# 144. DATA MIGRATION

Release blocker ako production user sa legitimnom starom bazom ne može da otvori novu verziju.

---

# 145. PREFERENCES MIGRATION

Promena key-a/default-a može promeniti user behavior nakon update-a.

---

# 146. AUTH TOKEN COMPATIBILITY

Update ne sme nepotrebno logoutovati sve korisnike ako product ne očekuje.

---

# 147. PENDING WORK POSLE UPDATE-A

WorkManager jobs iz stare verzije mogu postojati kada nova verzija stigne.

Proveri worker compatibility.

---

# 148. WORKER CLASS RENAME

Ako persistent work referencira class name, rename/remove može imati posledice.

Proveri WorkManager behavior/version i actual migration strategy pre finding-a.

---

# 149. NOTIFICATION CHANNELS

Jednom kreirani channel properties mogu ostati na uređaju kroz update.

Promena code default-a ne znači nužno da postojeći user dobija novi channel behavior.

---

# 150. DEEP LINK COMPATIBILITY

Stari email/notification link treba i dalje da radi ako business zahteva backward compatibility.

---

# 151. OLD SHORTCUT

Ako app koristi shortcuts, proveri da update ne ostavi broken shortcut destination.

---

# 152. WIDGET UPDATE

Ako postoje widgets:

proveri migration/update.

---

# 153. FIRST RUN AFTER UPDATE

Ako se pokreće migration/cleanup/onboarding logic:

proveri idempotency.

---

# 154. "WHAT'S NEW"

Nije release requirement.

P4 UX samo ako proizvod želi.

---

# 155. FRESH INSTALL

Testiraj:

```text
no previous app data
↓
install release
↓
launch
```

---

# 156. FRESH INSTALL DEFAULTS

Proveri:

- preferences
- DB seed
- permissions
- login
- first-run navigation

---

# 157. RELEASE INSTALL

Ako je moguće, instaliraj pravi release artefakt na device/emulator.

Build success nije runtime test.

---

# 158. SIGNED INSTALL

Ako release signing nije dostupno:

**SIGNED RELEASE INSTALL: NOT VERIFIED**

---

# 159. UPGRADE INSTALL

Idealno:

```text
install old signed production-compatible build
↓
seed data
↓
install new build over it
```

---

# 160. UNINSTALL / REINSTALL

Proveri šta se vraća kroz:

- Auto Backup
- cloud restore

gde je relevantno.

Fresh reinstall možda nije zaista fresh state.

---

# 161. BACKUP RESTORE SURPRISE

User može reinstall i dobiti stare preferences/data ako backup to dozvoljava.

Onboarding/auth logic treba to tolerisati.

---

# 162. STORE LISTING

Ako listing assets/text postoje u repo-u ili dostupnim izvorima, proveri consistency sa app funkcionalnošću.

Ako nisu dostupni:

**STORE LISTING: NOT VERIFIED**

---

# 163. APP NAME

Production label treba da odgovara stvarnom proizvodu.

---

# 164. ICON

Proveri adaptive icon / relevantne launcher assets ako su deo projekta.

---

# 165. TV BANNER

Za Android TV release posebno proveri TV listing/launcher requirements ako app targetira TV.

---

# 166. FEATURE GRAPHICS / SCREENSHOTS

Ne mogu se auditovati iz source-a ako nisu dostupni.

Označi NOT VERIFIED.

---

# 167. CONTENT RATING

Ako Play Console nije dostupan:

**CONTENT RATING: NOT VERIFIED**

---

# 168. APP ACCESS

Ako review timu treba login/demo credentials:

proveri release process dokumentaciju ako postoji.

Nemoj izmišljati Play requirement bez current evidence.

---

# 169. REVIEWER FLOW

Ako app zahteva:

- invite
- VPN
- hardware
- paid account

može biti potreban jasan review path.

---

# 170. COUNTRY AVAILABILITY

Ako feature zavisi od regiona:

proveri da listing/distribution ne uključuje tržište gde app ne može da radi, ako ta konfiguracija postoji.

---

# 171. DEVICE CATALOG

Ako app zahteva:

- camera
- TV
- Bluetooth
- telephony

manifest features mogu filtrirati kompatibilne uređaje.

---

# 172. ACCIDENTAL DEVICE EXCLUSION

`uses-feature required=true` može isključiti veliki broj uređaja.

```xml
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

Proveri da li je feature stvarno mandatory. Ako je optional, eksplicitno proveri da li treba `android:required="false"`.

---

# 173. ACCIDENTAL DEVICE INCLUSION

Suprotno:

app se može nuditi uređajima gde critical hardware nedostaje ako manifest ne opisuje requirement, a code nema fallback.

---

# 174. SCREEN SUPPORT

Ako app ima phone/tablet/TV scope, proveri manifest/resource assumptions.

---

# 175. ORIENTATION REQUIREMENT

Hard lock može ograničiti određene device form factor-e.

Ne tretiraj kao bug ako proizvod to zahteva.

---

# 176. CHROMEBOOK / DESKTOP ANDROID

Ako Play distribucija uključuje takve uređaje, proveri relevance.

Ako nisu target:

**NOT IN TARGET SCOPE**

---

# 177. INSTALL SIZE

AAB output size može uticati na download/install.

Ako nije izmereno:

**DOWNLOAD SIZE: NOT MEASURED**

---

# 178. LARGE ASSETS

Traži velike:

- videos
- models
- images
- DB assets
- duplicate resources

---

# 179. UNUSED ASSETS

Resource shrinking može pomoći, ali ne briši asset koji se dinamički referencira bez provere.

---

# 180. DENSITY RESOURCES

Proveri nepotrebno shipovanje ogromnih bitmap-a svim uređajima ako AAB/resources već mogu optimizovati.

---

# 181. NATIVE LIB SIZE

Multiple ABI-jevi povećavaju universal APK, ali AAB distribuira relevantne splits.

Ne ocenjuj samo universal APK size kao stvarni Play download.

---

# 182. BASELINE PROFILES

Ako postoje:

proveri da budu uključeni u release kako je očekivano.

Ako ih nema:

to nije release blocker.

---

# 183. BENCHMARK MODULE

Benchmark kod ne sme slučajno biti deo production app artifact-a ako nije namerno.

---

# 184. DEBUG TOOLS

Traži:

- LeakCanary
- Stetho
- debug menus
- mock server
- dev toolbar
- test endpoint switcher

u release dependency/config.

---

# 185. LEAKCANARY

Obično debug-only.

Proveri dependency configuration.

---

# 186. MOCK DATA

Release ne sme slučajno startovati sa test/demo podacima zbog pogrešnog flag-a.

---

# 187. DEBUG MENU

Ako postoji hidden debug screen:

utvrdi da li je dostupna u production-u.

Ako omogućava dangerous actions, security risk raste.

---

# 188. TEST CREDENTIALS

Hardcoded production-accessible test credentials su critical finding.

---

# 189. STRICTMODE

Ako je uključen u release, proveri penalty behavior.

Debug detection je korisna, ali release penalty koji ruši app može biti problem.

---

# 190. ASSERTIONS

Ne oslanjaj production correctness samo na debug-only assertions.

---

# 191. LOGIC POD `BuildConfig.DEBUG`

Pregledaj sve branch-eve.

Traži:

```text
if (BuildConfig.DEBUG) {
    validation/security
}
```

gde release gubi potrebnu logiku.

---

# 192. SUPROTAN DEBUG BRANCH

Takođe:

```text
if (!BuildConfig.DEBUG) {
    ...
}
```

može sadržati potpuno netestiran production-only flow.

---

# 193. PRODUCTION-ONLY SDK INIT

Analytics/crash/ads koji rade samo u release-u moraju biti testirani.

---

# 194. PRODUCTION API DIFFERENCES

Staging API success ne dokazuje production config.

Ako produkcioni backend nije bezbedno testiran:

**PRODUCTION BACKEND INTEGRATION: NOT VERIFIED**

---

# 195. PRODUCTION CERTIFICATES

TLS/certificate/domain config može biti drugačiji.

---

# 196. PROD RATE LIMITS

Production može imati druge quotas/rate limits.

Nije release blocker bez evidence-a, ali critical flow treba tolerisati 429 ako API to može vraćati.

---

# 197. CRASH ON START

Poseban release test:

```text
clean install
↓
launch release
```

Bez debugger-a.

---

# 198. OFFLINE FIRST LAUNCH

Ako app može biti instalirana bez mreže:

proveri ponašanje.

---

# 199. PERMISSION DENIAL

Release smoke test treba uključiti odbijanje optional permission-a.

App ne sme odmah crashovati.

---

# 200. NO GOOGLE PLAY SERVICES

Ako app može biti instalirana na uređaj bez GMS prema distribution scope-u:

proveri fallback.

Ako Play/GMS je hard requirement:

manifest/device filtering treba to reflektovati koliko platforma dozvoljava.

---

# 201. PLAY SERVICES VERSION

Ne hardcode assumptions ako Google Play services dependency već rešava update/availability.

---

# 202. FIREBASE INIT

Ako Firebase config nedostaje za release flavor:

build/runtime može pasti.

---

# 203. DIFFERENT APPLICATION ID + FIREBASE

Svaki flavor/app ID može zahtevati odgovarajuću app registration.

---

# 204. CRASHLYTICS MAPPING

Ako R8 obfuscation postoji, mapping upload treba proveriti.

---

# 205. CI PIPELINE

Mapiraj release CI:

```text
checkout
↓
JDK
↓
dependency restore
↓
tests
↓
lint
↓
bundle
↓
sign
↓
publish
```

---

# 206. PIN TOOLCHAIN

CI treba da koristi poznate:

- JDK
- Gradle wrapper
- package/dependency versions

---

# 207. GRADLE WRAPPER

Repository treba da koristi wrapper za reproducibility.

---

# 208. WRAPPER INTEGRITY

Ako postoji checksum/verification workflow, proveri.

Ne tretiraj izostanak kao blocker bez threat modela.

---

# 209. CI SECRETS

Signing credentials i Play service credentials treba da budu u secret store-u, ne logs/repo-u.

---

# 210. SECRET LOGGING

CI command sa password-om u argumentu može završiti u log-u.

Proveri masking.

---

# 211. RELEASE FROM DEVELOPER LAPTOP

Ako production release zavisi od jednog lokalnog računara bez reproducible pipeline-a:

operational risk.

Severity prema projektu.

---

# 212. TEST GATE

Pre release-a proveri da CI izvršava relevantno:

- unit tests
- lint
- release build
- migration tests
- critical instrumentation

Ne mora svaki projekat imati sve.

---

# 213. FAILING TEST IGNORED

Traži:

```yaml
continue-on-error: true
```

kao i:

- `|| true`
- ignored Gradle failure
- disabled tests

u release gate-u.

---

# 214. LINT ABORT

Ako lint ima:

```text
abortOnError false
```

utvrdi da li critical findings mogu proći.

Ne zahtevaj nula lint warning-a.

---

# 215. BASELINE LINT

Baseline može biti legitimna strategija.

Proveri da novi errors ne budu automatski sakriveni.

---

# 216. RELEASE ARTIFACT PROVENANCE

Ako pipeline gradi artefakt, proveri da publish koristi isti artefakt koji je testiran, ne drugi lokalno rebuildovan artefakt.

---

# 217. BUILD ONCE, PROMOTE

Dobar release model često testira jedan artefakt pa ga promoviše.

Ako pipeline rebuild-uje sa drugačijom konfiguracijom između stages, proveri drift.

---

# 218. COMMIT TRACEABILITY

Production artefakt treba imati način da se poveže sa:

- version
- commit
- release

Ako nema, debugging/rollback postaje teži.

P4/P3 operational finding prema context-u.

---

# 219. ROLLBACK

Android app release ne može uvek trenutno vratiti već instalirane korisnike na stariju verziju.

Zato backward-compatible backend i emergency release plan imaju značaj.

---

# 220. BAD RELEASE

Pitaj:

> Šta radimo ako production verzija ima critical crash?

Mogući recovery:

- halt rollout
- staged rollout
- server feature flag
- rapid patch

Ne pretpostavljaj dostupnost bez Play Console podataka.

---

# 221. STAGED ROLLOUT

Ako release process koristi staged rollout:

proveri monitoring/gate.

Ako nema podatka:

**STAGED ROLLOUT STRATEGY: NOT VERIFIED**

---

# 222. MONITORING

Release treba da ima način da primeti:

- crash spike
- ANR
- auth failure
- server error

Ako telemetry ne postoji, klasifikuj kao operational improvement osim ako release rizik to čini ozbiljnijim.

---

# 223. PRE-LAUNCH REPORT

Ako Google Play Pre-launch report postoji u workflow-u, proveri findings ako su dostupni.

Ako nisu:

**PRE-LAUNCH REPORT: NOT VERIFIED**

---

# 224. PLAY CONSOLE WARNINGS

Ne izmišljaj Play Console stanje bez pristupa.

---

# 225. APP COMPATIBILITY

Release treba testirati barem reprezentativne:

- min API
- current/common API
- latest target environment

prema product device matrix-u.

---

# 226. API MATRIX

Napravi:

| API/Device | Install | Launch | Critical flow | Status |
|---|---|---|---|---|

---

# 227. LOW-END DEVICE

Release build treba proveriti i na slabijem uređaju ako performance-sensitive.

---

# 228. 64-BIT / NATIVE REQUIREMENTS

Ako app distribuira native code, proveri current Play architecture requirements prema relevantnom trenutnom policy-ju.

Ako nije provereno:

**NATIVE PLAY REQUIREMENTS: NOT VERIFIED**

---

# 229. LARGE PAGE SIZE / PLATFORM NATIVE REQUIREMENTS

Za savremene Android native-library compatibility zahteve proveri aktuelne platform/Play smernice prema target datumu ako NDK postoji.

Ne koristi zastarele brojke ili rokove bez verifikacije.

---

# 230. EDGE-TO-EDGE / PLATFORM UI CHANGES

Ako target SDK menja window/system UI behavior, testiraj critical screens.

Ne generiši finding bez relevantnog target SDK-a.

---

# 231. PREDICTIVE BACK

Ako target/platform requirement utiče na app i custom back navigation postoji, proveri release behavior.

---

# 232. NOTIFICATION CHANGES

Ako target SDK/platform uvodi promene notification behavior-a, proveri prema actual feature-u.

---

# 233. EXACT ALARM CHANGES

Isto.

---

# 234. FGS CHANGES

Isto.

---

# 235. PLAY POLICY VERIFICATION

Za svaki policy-related nalaz obavezno navedi:

```text
Policy area:
Applicable to this app:
Evidence:
Current requirement verified:
YES / NO
Date/source:
```

Ako nema current verification:

ne tvrdi da submission sigurno neće proći.

---

# 236. NE MEŠAJ PLATFORM BUG I PLAY POLICY

Primer:

```text
permission runtime crash
```

je application/platform correctness.

```text
permission declaration violates store policy
```

je Play compliance.

Drži ih odvojeno.

---

# 237. NE MEŠAJ RECOMMENDATION I BLOCKER

Svaki nalaz klasifikuj kao:

```text
RELEASE BLOCKER
HIGH RISK
NON-BLOCKING ISSUE
IMPROVEMENT
NOT VERIFIED
```

---

# 238. RELEASE BLOCKER

Primeri:

- release ne build-uje
- release crashuje na launch-u
- pogrešan signing identity
- critical migration failure
- production endpoint pogrešan
- critical required permission flow ne radi
- current verified Play rule direktno sprečava submission

---

# 239. NON-BLOCKING IMPROVEMENT

Primeri:

- nema Baseline Profile
- nema staged rollout dokumentacije
- dodatna telemetry
- build speed improvement

Ne predstavljaj kao "ne može na Play Store".

---

# 240. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Release classification:
Confidence:
Status:

Build variant:
Application ID:
Version:
API scope:
Device scope:

File:
Gradle config:
Manifest component:
Dependency:
Relevant code/config:

Problem:

Evidence:

Release Flow:

Reproduction:

Debug behavior:

Release behavior:

User impact:

Store/Policy impact:

Security/Data impact:

Root cause:

Recommended remediation:

Regression / release test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 241. SEVERITY

Koristi:

## P0 - CRITICAL

- production signing/private credential compromise
- embedded server/service account secret sa ozbiljnim privilegijama
- catastrophic security/data issue koji release distribuira korisnicima

## P1 - HIGH

- release build ne radi
- release-only crash glavnog flow-a
- critical update/migration failure
- pogrešan production backend/auth config
- verified store requirement sprečava release
- private data ozbiljno izložena release konfiguracijom

## P2 - MEDIUM

- značajan release/config/device compatibility problem
- store readiness issue koji zahteva korekciju, ali nije catastrophic

## P3 - LOW

- ograničen release edge case
- manja metadata/config inconsistency

## P4 - IMPROVEMENT

- CI, observability, rollout ili optimization poboljšanje bez trenutnog blocker-a

---

# 242. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

release build/runtime ili config direktno potvrđuje finding.

MEDIUM:

jak source/config dokaz, ali Play/device runtime nije proverljiv.

LOW:

zavisi od Play Console, current policy ili external service config-a koji nisu dostupni.

---

# 243. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 244. RELEASE VERIFICATION STATUS

Dodatno koristi:

```text
RELEASE BUILD:
PASS
FAIL
NOT VERIFIED

SIGNED INSTALL:
PASS
FAIL
NOT VERIFIED

UPGRADE TEST:
PASS
FAIL
NOT VERIFIED

PLAY POLICY:
VERIFIED
PARTIAL
NOT VERIFIED
```

---

# 245. NE MENJAJ KOD

Tokom audita:

- ne povećavaj versionCode
- ne update-uj targetSdk
- ne menjaj signing
- ne dodaj keep rules
- ne briši permissions
- ne update-uj dependencies
- ne menja Play config

Prvo završi audit.

---

# 246. OUTPUT - ANDROID_RELEASE_PLAY_READINESS_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- release stack
- build status
- signing status
- release blockers
- Play readiness
- production configuration status

## 2. Release Environment

## 3. Build Variant Matrix

## 4. Debug vs Release Differences

## 5. Release Build Audit

## 6. AAB / APK Audit

## 7. Signing Audit

## 8. R8 / ProGuard Audit

## 9. Resource Shrinking Audit

## 10. Manifest Merge Audit

## 11. Permissions Audit

## 12. Target SDK / Platform Compatibility

## 13. Dependencies / Supply Chain Audit

## 14. Secrets / Production Configuration

## 15. Network / API Production Config

## 16. Firebase / External Service Config

## 17. Logging / Analytics / Crash Reporting

## 18. Update / Migration Audit

## 19. Fresh Install Audit

## 20. Upgrade Install Audit

## 21. Device / API Compatibility Matrix

## 22. Play Store Policy Areas

## 23. Data Safety / Privacy Configuration

## 24. Billing Audit

Ako postoji.

## 25. Store Listing Readiness

Ako podaci postoje.

## 26. CI/CD Release Pipeline

## 27. Rollout / Monitoring / Recovery

## 28. Findings Summary

| ID | Severity | Classification | Area | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 29. Release Blockers

## 30. P0 Findings

## 31. P1 Findings

## 32. P2 Findings

## 33. P3 Findings

## 34. P4 Improvements

## 35. Things Done Well

## 36. Unknown / Not Verified

## 37. Final Release Readiness Matrix

Koristi:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Za najmanje:

- clean build
- release build
- AAB
- R8
- resource shrink
- signing
- install
- launch
- update
- DB migration
- auth
- production API
- permissions
- notifications
- deep links
- background work
- external SDKs
- crash reporting
- target SDK
- privacy/data safety
- billing
- store listing
- CI/CD
- rollout/monitoring

## 38. Go-Live Remediation Roadmap

### Phase 0 - Release Blockers

### Phase 1 - Before Production

### Phase 2 - First Production Rollout

### Phase 3 - Post-Launch Hardening

---

# 247. BUILD MATRIX

Napravi:

| Variant | Build | Minify | Shrink | Signed | Install tested |
|---|---|---|---|---|---|

---

# 248. SIGNING MATRIX

| Environment | Certificate | Storage | Verified | Risk |
|---|---|---|---|---|

Ne prikazuj sensitive vrednosti.

---

# 249. CONFIG MATRIX

| Config | Debug | Release | Expected production | Status |
|---|---|---|---|---|

Za:

- API
- OAuth
- Firebase
- analytics
- crash
- feature flags

---

# 250. PERMISSION MATRIX

| Permission | Source | Required | Runtime flow | Policy relevance |
|---|---|---|---|---|

---

# 251. UPDATE MATRIX

| From version | To version | DB migration | Preferences | Work | Tested |
|---|---|---|---|---|---|

---

# 252. STORE READINESS MATRIX

| Area | Required | Available | Verified | Status |
|---|---|---|---|---|

Za:

- app name
- icon
- screenshots
- privacy
- Data safety
- content rating
- app access
- account deletion
- billing

Samo prema applicable/current requirements.

---

# 253. SECOND PASS - RELEASE-ONLY ATTACK

Nakon prvog audita prođi codebase sa jednim pitanjem:

> Šta postoji samo u release-u ili se u release-u ponaša drugačije?

Traži:

- R8
- production API
- production SDK initialization
- signing
- logging disabled
- resource shrinking
- manifest placeholders

---

# 254. SECOND PASS - DEBUG FALSE CONFIDENCE

Za svaki critical feature pitaj:

> Koji deo debug environment-a može sakriti production problem?

Primeri:

- debug certificate
- mock backend
- verbose logs
- no R8
- relaxed network security
- dev account

---

# 255. SECOND PASS - FRESH INSTALL

Simuliraj:

```text
brand new device
↓
install release
↓
deny optional permissions
↓
launch
```

Pitaj:

- da li app stiže do usable state-a
- da li postoji skriven dependency na lokalni dev state

---

# 256. SECOND PASS - OLD USER UPDATE

Simuliraj korisnika sa starijom legitimnom production verzijom:

```text
old DB
old preferences
pending WorkManager
cached auth
↓
install new version
```

Prati ceo startup.

---

# 257. SECOND PASS - R8 ATTACK

Za svaki:

- reflection
- serializer
- JNI
- dynamic class lookup
- resource string lookup

pitaj:

> Može li minification/shrinking promeniti runtime behavior?

---

# 258. SECOND PASS - SIGNING ATTACK

Pitaj:

> Koji external service vezuje identitet app-a za release certificate?

Proveri:

- OAuth
- APIs
- Firebase
- App Links related setup

---

# 259. SECOND PASS - MISSING ENV

Ukloni mentalno svaki secret/env var.

Pitaj:

> Da li release fail-uje jasno ili tiho koristi unsafe fallback?

---

# 260. SECOND PASS - STORE POLICY

Za svaku relevantnu capability:

- background location
- broad package access
- VPN
- billing
- children
- health
- finance
- UGC

proveri samo aktuelna i applicable pravila.

---

# 261. SECOND PASS - PRODUCTION NETWORK

Testiraj ili analiziraj production-like:

```text
real production host
real TLS
release auth client
release certificate identity
```

Ne koristi staging PASS kao dokaz.

---

# 262. SECOND PASS - NO DEBUGGER

Pokreni release bez attached debugger-a.

Neki timing/error behavior se razlikuje.

---

# 263. SECOND PASS - CRASH VISIBILITY

Namerno izazovi kontrolisani non-production test crash u odgovarajućem test environment-u ako workflow to dozvoljava.

Proveri da crash pipeline može mapirati release stack.

Ne izazivaj crash u stvarnoj production populaciji.

---

# 264. SECOND PASS - ROLLOUT FAILURE

Pretpostavi da nova verzija ima critical bug.

Pitaj:

- može li rollout biti stopiran
- postoji li server-side mitigation
- koliko brzo se može izdati patch
- može li backend ostati compatible sa starim clientom

---

# 265. SECOND PASS - BACKEND VERSION SKEW

Tokom rollout-a istovremeno postoje:

```text
client N
client N+1
```

Backend mora tolerisati oba ako rollout nije trenutan.

---

# 266. SECOND PASS - OLD CLIENT

Pitaj:

> Ako user ne update-uje aplikaciju 6 meseci, šta se dešava?

Proveri:

- API
- auth
- enum
- required fields
- force-update logic

---

# 267. SECOND PASS - FORCE UPDATE

Ako postoji:

proveri:

- server unavailable
- Play unavailable
- offline
- update not yet propagated

User ne sme bez potrebe biti zarobljen u unrecoverable loop-u.

---

# 268. SECOND PASS - UNINSTALL/RESTORE

Simuliraj cloud backup restoration gde je relevantno.

Pitaj da li se:

- stale auth
- device-specific IDs
- obsolete settings

vraćaju pogrešno.

---

# 269. SECOND PASS - PERMISSION DENIAL

Za svaku optional dangerous permission:

```text
deny
↓
deny again / don't ask again
```

Critical app flow koji ne zahteva tu permission treba i dalje da radi.

---

# 270. SECOND PASS - MIN SDK

Ako je moguće, pokreni release na najnižem podržanom API nivou.

Traži:

- missing API guard
- resource issue
- dependency minimum mismatch

---

# 271. SECOND PASS - CURRENT ANDROID

Isto za savremenu target platformu.

Traži behavior changes relevantne aplikaciji.

---

# 272. SECOND PASS - DEVICE FILTERING

Pitaj:

> Koji uređaji će Play smatrati kompatibilnim na osnovu finalnog manifest-a?

Ako required feature slučajno filtrira uređaje:

prijavi.

---

# 273. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- release build je odvojen od debug build-a
- AAB je analiziran gde je Play distribution cilj
- signing status nije nagađan
- secrets nisu prikazani u izveštaju
- finalni merged manifest je analiziran
- transitive permissions su proverene
- R8 finding ima konkretan reflection/serialization/JNI/resource scenario
- broad keep rule nije preporučen bez potrebe
- resource shrinking i dynamic resources su provereni
- fresh install i upgrade su odvojeno analizirani
- skipped-version migration je proverena
- production API/config nije zaključena iz staging-a
- release certificate integrations su proverene
- debug-only tools ne cure u release
- crash mapping/symbol pipeline je analiziran
- Play policy tvrdnje imaju current verification
- policy issue i platform correctness nisu pomešani
- listing/Console stvari koje nisu dostupne su označene NOT VERIFIED
- billing se analizira samo ako postoji
- child/health/finance/VPN/UGC zahtevi se primenjuju samo ako su relevantni
- minSdk i target SDK behavior su analizirani verzijski
- stari i novi client mogu koegzistirati tokom rollout-a
- release blockers su odvojeni od P4 improvements

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Povećajte versionCode, uključite R8, napravite AAB i objavite aplikaciju na Play Store.

To nije release-readiness audit.

Tražim probleme poput:

```text
debug build
↓
OAuth uses debug signing certificate
↓
login works
↓
release signed with production key
↓
production certificate is not registered
↓
login fails only after release
```

ili:

```text
release minification enabled
↓
serializer discovers models through reflection
↓
required metadata/classes removed or renamed
↓
debug tests pass
↓
release crashes while parsing production response
```

ili:

```text
current app DB = v8
↓
user still has production DB v4
↓
only migration 7->8 is tested
↓
user installs latest version
↓
database cannot reach v8 safely
↓
startup fails or destructive fallback erases data
```

ili:

```text
release env variable missing
↓
Gradle config silently falls back to dev API
↓
production app ships successfully
↓
real users send data to staging backend
```

ili:

```text
dependency adds dangerous permission through manifest merge
↓
developer inspects only app manifest
↓
permission is present in final release
↓
store/privacy declarations no longer match actual artifact
```

ili:

```text
R8 mapping file not retained
↓
production crash occurs
↓
stack trace contains obfuscated symbols
↓
team cannot reliably identify failing code in released version
```

ili:

```text
new release removes/renames worker class
↓
existing users already have persistent WorkManager jobs referencing old worker
↓
after update scheduler tries to restore work
↓
pending background workflow breaks
```

To su release problemi koje treba da pronađeš.

Razmišljaj kroz:

- debug vs release
- source vs final manifest
- code vs shrunk code
- local build vs CI build
- unsigned vs signed artifact
- fresh install vs upgrade
- current client vs old client
- staging vs production
- APK vs AAB
- technical correctness vs Play policy

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Da li se problem pojavljuje samo u release-u?

> Da li pravi AAB sadrži očekivanu konfiguraciju?

> Da li production signing identity odgovara external servisima?

> Može li postojeći korisnik bezbedno da se update-uje?

> Da li finalni manifest odgovara očekivanom permission i component modelu?

> Da li je Play Store tvrdnja potvrđena aktuelnim pravilom?

Ako nije provereno:

**NOT VERIFIED.**

Ako je Play policy u pitanju bez trenutne verifikacije:

**CURRENT PLAY POLICY NOT VERIFIED.**

Ako je samo kvalitet release procesa, a ne blocker:

**P4 - IMPROVEMENT.**

Bolje je pronaći 5 stvarnih release blocker-a nego napisati 100 generičkih saveta o Play Store-u.

Cilj je dobiti forenzički precizan release audit iz kojeg se svaki ozbiljan nalaz može direktno pretvoriti u:

- build fix
- signing/config correction
- R8 regression test
- upgrade/migration test
- release smoke test
- CI gate
- Play submission checklist
- production rollout plan
