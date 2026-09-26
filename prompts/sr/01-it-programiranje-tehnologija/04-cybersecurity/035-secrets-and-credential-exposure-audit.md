---
id: UPL-IT-035
number: 35
slug: secrets-and-credential-exposure-audit
title: Secrets & Credential Exposure Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# SECRETS AND CREDENTIAL EXPOSURE AUDIT

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu svih mesta na kojima secrets, credentials, tokens, signing keys, connection strings i drugi poverljivi autentikacioni materijali mogu biti:

- commitovani

- buildovani

- logovani

- poslati klijentu

- izloženi kroz CI/CD

- procurili kroz error reporting

- ubačeni u frontend bundle

- ostavljeni u Docker image-u

- sačuvani u history/artifact-u

- preširoko dostupni runtime procesima

Glavni cilj:

> Utvrditi da li postoji konkretan put kojim neovlašćena osoba može da dobije credential dovoljan za pristup produkcionim sistemima, third-party servisima, bazama, cloud resursima, admin API-jima ili drugim osetljivim funkcijama.

Ovo nije:

- generički "nikada ne commituj .env"

- automatsko prijavljivanje svakog stringa nalik API key-u

- tretiranje public frontend API identifier-a kao secret-a

- automatska rotacija svih credentials

- samo Git secret scan

- samo `.env` audit

- pretpostavka da je svaki exposed token još uvek validan

- supply-chain audit dependencies

- cloud IAM audit u celini

Fokus je na kompletnom secret lifecycle-u:

```text

secret creation

↓

storage

↓

distribution

↓

runtime use

↓

logging / telemetry

↓

rotation

↓

revocation

```

Prioritet:

**valid production credential exposure > signing/decryption key exposure > database/cloud credentials > privileged API tokens > CI/CD secrets > auth/session secrets > accidental logs/artifacts > stale/revoked secrets > hygiene**

Bolje je pronaći 3 stvarno važeća produkciona credential exposure-a nego prijaviti 500 random stringova.

---

# 1. UTVRDI SECRET MODEL

Pre finding-a identifikuj vrste tajni koje projekat koristi:

- database passwords

- connection strings

- cloud access keys

- API keys

- OAuth client secrets

- JWT signing secrets

- private keys

- webhook secrets

- session secrets

- encryption keys

- SMTP credentials

- storage credentials

- CI/CD tokens

- package registry tokens

- deploy tokens

- SSH keys

- admin bootstrap credentials

---

# 2. KLASIFIKUJ SECRETS

Za svaki pronađeni candidate klasifikuj:

```text

PUBLIC IDENTIFIER

LOW-PRIVILEGE SECRET

PRODUCTION CREDENTIAL

SIGNING KEY

ENCRYPTION KEY

ADMIN CREDENTIAL

DEPLOYMENT CREDENTIAL

UNKNOWN

```

---

# 3. PUBLIC VALUE NIJE SECRET

Primeri koji često nisu pravi secrets:

- Stripe publishable key

- Firebase public config

- public OAuth client ID

- analytics ID

- project ID

Ne prijavljuj samo zato što "liči na key".

---

# 4. SECRET VALIDATION

Za svaki ozbiljan candidate odgovori:

> Da li je vrednost verovatno stvarni credential ili samo placeholder/test/example?

---

# 5. PLACEHOLDER

Primer:

```text

sk_test_example

your-api-key-here

changeme

```

nije automatski incident.

---

# 6. PRODUCTION CONTEXT

Traži dokaze:

- production hostname

- real service endpoint

- CI usage

- deployment config

- matching secret name

- recent commit

---

# 7. NE TESTIRAJ CREDENTIAL PROTIV TUĐEG SERVISA BEZ OVLAŠĆENJA

Validnost proveravaj samo:

- kroz lokalni config

- controlled environment

- provider metadata koji je već dostupan

- eksplicitno odobren test

Ne pokušavaj neovlašćen login.

---

# 8. SOURCE CODE SCAN

Pretraži:

- `.ts`

- `.js`

- `.py`

- `.java`

- `.kt`

- `.go`

- `.cs`

- shell scripts

- config files

- IaC

za secret-like values.

---

# 9. CONFIG FILES

Posebno:

```text

.env

.env.local

.env.production

config.json

settings.json

application.yml

application.properties

secrets.json

```

---

# 10. `.env.example`

Može legitimno sadržati names/placeholders.

Ne prijavljuj bez realne vrednosti.

---

# 11. PRODUCTION `.env`

Ako realni secret postoji u repository-ju:

ozbiljan finding.

---

# 12. GITIGNORE

Proveri da sensitive files jesu ignorisani.

P4 ako nema actual exposure.

---

# 13. GIT HISTORY

Secret uklonjen iz trenutnog branch-a može i dalje biti u history-ju.

---

# 14. DELETED != REVOKED

Ako credential ikada commitovan:

brisanje iz Git-a ne invalidira credential.

---

# 15. ROTATION

Confirmed exposed credential treba tretirati kao kompromitovan dok se ne dokaže da je:

- revoked

- expired

- rotated

---

# 16. HISTORY SCOPE

Ako secret je postojao u public repo-u:

exposure assumption je mnogo ozbiljnija.

---

# 17. PRIVATE REPO

Private repo smanjuje attack surface, ali ne znači da secret storage u source-u postaje bezbedan.

---

# 18. FORKS

Public/private forks mogu zadržati history.

---

# 19. PULL REQUESTS

Secret može ostati u:

- diff-u

- review comment-u

- CI logs

---

# 20. ISSUES

Developeri ponekad paste-uju tokens u issue.

Ako connector/repo metadata to omogućava, proveri.

---

# 21. DOCUMENTATION

README/tutorial može sadržati realni credential.

---

# 22. EXAMPLE COMMANDS

Primer:

```text

curl -H "Authorization: Bearer real_token"

```

---

# 23. TESTS

Fixtures mogu sadržati:

- real API token

- production DB string

---

# 24. SNAPSHOTS

Test snapshot može uhvatiti secret iz response-a.

---

# 25. GOLDEN FILES

Isto.

---

# 26. GENERATED FILES

Build/config generation može zapisati secret u output file koji se commit-uje.

---

# 27. FRONTEND BUNDLE

Najvažnije pravilo:

> Sve što završi u browser bundle-u tretiraj kao javno.

---

# 28. FRONTEND ENV PREFIX

Primeri:

```text

NEXT_PUBLIC_

VITE_

REACT_APP_

PUBLIC_

```

prema stack-u.

Sve takve vrednosti mogu postati javne.

---

# 29. SERVER SECRET SA PUBLIC PREFIX-OM

Critical candidate.

---

# 30. FRONTEND BUILD-TIME INJECTION

Secret može biti ubačen u compiled JS čak i ako source referencira env variable.

---

# 31. SOURCE MAP

Source map može otkriti:

- embedded config

- source literals

ali nije automatski secret exposure.

---

# 32. STATIC HTML

Build može inline-ovati config u HTML.

---

# 33. NEXT.JS SERVER/CLIENT BOUNDARY

Ako stack koristi Next.js:

proveri da server-only secret nije importovan u client component path.

---

# 34. CLIENT COMPONENT IMPORT

Transitive import može povući config module u browser bundle.

---

# 35. BUILD ANALYSIS

Ne oslanjaj se samo na source.

Pregledaj production build output gde je moguće.

---

# 36. JAVNI NETWORK RESPONSE

Secret može procuriti kroz API response.

---

# 37. RAW CONFIG ENDPOINT

Traži:

```text

/config

/env

/settings

/debug

```

---

# 38. ERROR RESPONSE

Third-party SDK error može sadržati:

- API token

- request headers

- connection string

---

# 39. STACK TRACE

Može uključiti env/config vrednosti ako custom errors to rade.

---

# 40. SERIALIZED ERROR OBJECT

Nikad ne vraćaj ceo provider error client-u bez pregleda.

---

# 41. GRAPHQL

Introspection nije secret leak sama po sebi.

Ali resolver može slučajno expose-ovati config/secrets fields.

---

# 42. ADMIN CONFIG UI

Ako UI prikazuje integration config:

proveri da li secret prikazuje:

```text

********

```

ili plaintext.

---

# 43. SECRET READBACK

Mnogi sistemi treba da dozvole:

- replace

- rotate

bez ponovnog prikaza full secret-a.

---

# 44. SECRET "SHOW" BUTTON

Ako postoji:

proveri authorization/re-auth.

---

# 45. DATABASE MODEL

Ako integration secret se čuva u DB:

proveri:

- plaintext

- encrypted

- hashed

u zavisnosti od toga da li runtime mora ponovo da ga koristi.

---

# 46. HASH VS ENCRYPT

Ako aplikacija mora poslati original secret provider-u:

hash nije dovoljan.

Encryption može biti potreban.

---

# 47. API KEY KOJI SE SAMO VERIFIKUJE

Ako backend samo proverava user-provided API key:

hash storage može biti bolji.

---

# 48. ENCRYPTION KEY

Ako secrets u DB-u jesu encrypted:

gde je master key?

---

# 49. KEY U ISTOJ DB

Ako encryption key stoji pored ciphertext-a u istoj tabeli:

zaštita od DB compromise-a je mala.

---

# 50. APP ENV KEY

Može biti validan model ako threat model odvaja DB od runtime secret store-a.

---

# 51. LOGGING

Repository-wide traži:

```text

console.log

logger.*

print

dump

trace

```

sa auth/config objectima.

---

# 52. AUTHORIZATION HEADER

Mora biti redacted.

---

# 53. COOKIE

Session cookie ne sme biti full logged.

---

# 54. API REQUEST DEBUG

HTTP client debug logging može zapisati headers.

---

# 55. PROVIDER SDK DEBUG

Verbose provider logs mogu uključiti credentials.

---

# 56. DB CONNECTION STRING

ORM startup log može odštampati pun URL:

```text

postgres://user:password@host/db

```

---

# 57. URL USERINFO

Credentials u URL-u posebno lako cure u logs.

---

# 58. QUERY PARAM SECRET

Primer:

```text

?api_key=...

?token=...

```

Može završiti u:

- access logs

- browser history

- proxy logs

---

# 59. STRUCTURED LOG OBJECT

Pattern:

```text

logger.info({ req })

```

može serializovati headers/body.

---

# 60. REDACTION

Proveri logger config za:

- authorization

- cookie

- password

- token

- secret

- apiKey

---

# 61. CASE VARIANTS

Redaction možda pokriva `password`, ali ne:

```text

newPassword

clientSecret

access_token

```

---

# 62. NESTED VALUES

Redaction može raditi samo top-level.

---

# 63. ERROR MONITORING

Sentry-like sistem može automatski prikupiti:

- request headers

- body

- local variables

- breadcrumbs

---

# 64. SENTRY `sendDefaultPii`

Ako relevantno, proveri actual config.

---

# 65. BREADCRUMBS

Fetch/XHR breadcrumbs mogu otkriti URL token.

---

# 66. LOCAL VARIABLES

Server error monitoring može capture-ovati function locals sa secrets.

---

# 67. APM

Datadog/New Relic/OpenTelemetry spans mogu sadržati sensitive attributes.

---

# 68. TRACE HEADERS

Ne stavljaj auth token u span attribute.

---

# 69. METRICS

Secret nikad ne sme biti metric label.

---

# 70. ANALYTICS

Frontend analytics events mogu uključiti:

- reset token

- auth token

- secret form values

---

# 71. FORM AUTO-CAPTURE

Session replay / analytics auto-capture je visok signal na auth/admin secret forms.

---

# 72. SESSION REPLAY

Proveri masking sensitive inputs.

---

# 73. CI/CD

Pregledaj:

- GitHub Actions

- GitLab CI

- Jenkins

- CircleCI

- other pipelines

---

# 74. SECRET STORE

CI secrets treba dolaziti iz zaštićenog secret store-a ili equivalent-a.

---

# 75. SECRET U YAML-U

Hardcoded secret u workflow file-u je exposure.

---

# 76. `echo $SECRET`

Critical CI log leak.

---

# 77. DEBUG SHELL

`set -x` može odštampati commands sa expanded secrets.

---

# 78. ENV DUMP

Pattern:

```text

env

printenv

set

```

u CI može dump-ovati secrets.

---

# 79. MASKING

CI platform masking pomaže, ali ne računaj na njega za transformed secrets.

---

# 80. TRANSFORMED SECRET

Base64/substring/JSON-wrapped secret možda više nije masked.

---

# 81. ARTIFACT

Build artifact može sadržati:

- `.env`

- credentials file

- signing key

---

# 82. CACHE

CI dependency/build cache može slučajno sadržati secret-containing files.

---

# 83. WORKSPACE UPLOAD

`upload-artifact` sa preširokim path-om može pokupiti `.env`.

---

# 84. TEST REPORT

Test output može embed-ovati secret.

---

# 85. SCREENSHOT

UI test screenshot može prikazati secret u admin panel-u.

---

# 86. FORKED PR

Posebno proveri kada CI secrets postaju dostupni untrusted pull request code-u.

---

# 87. PULL_REQUEST_TARGET

Ako GitHub Actions koristi privileged event sa secrets:

review execution trust veoma pažljivo.

---

# 88. CHECKOUT UNTRUSTED CODE

High-risk kombinacija:

```text

privileged workflow

+

production secrets

+

checkout attacker-controlled PR

+

execute code

```

Može omogućiti secret theft.

---

# 89. THIRD-PARTY ACTION

Pinned/unpinned CI actions ulaze u supply-chain audit, ali ovde proveri da li imaju pristup sensitive secrets.

---

# 90. SECRET SCOPE

Ne daj svaki secret svakom job-u.

---

# 91. JOB ENVIRONMENT

Deploy credential samo deploy job-u.

---

# 92. ENVIRONMENT PROTECTION

Production secrets možda treba zaštititi approval/environment rules prema CI platformi i risk modelu.

P4/P2 prema actual exposure-u.

---

# 93. DEPLOYMENT

Pregledaj:

- Vercel env vars

- Docker

- Kubernetes

- Compose

- systemd

- cloud functions

---

# 94. DOCKERFILE

Traži:

```text

ENV SECRET=...

ARG SECRET

COPY .env

```

---

# 95. BUILD ARG

Docker `ARG` nije secret store.

Vrednost može ostati u image history/build metadata zavisno od workflow-a.

---

# 96. MULTI-STAGE BUILD

Secret korišćen u build stage-u može ipak procureti ako je:

- copied

- cached

- embedded in artifact

---

# 97. `.dockerignore`

Treba sprečiti slanje unnecessary secret files u build context.

---

# 98. DOCKER IMAGE

Pregledaj final layers/files.

---

# 99. IMAGE HISTORY

Secret obrisan u kasnijem layer-u može ostati u prethodnom layer-u.

---

# 100. PRIVATE REGISTRY

Smanjuje exposure, ali ne rešava embedded secrets.

---

# 101. CONTAINER ENV

Runtime env je uobičajen način distribucije secrets.

Ali proveri ko može čitati:

- process env

- orchestrator metadata

- debug endpoints

---

# 102. `docker inspect`

Operator sa Docker access-om često može videti env.

To je privilege model, ne nužno bug.

---

# 103. KUBERNETES

Ako koristi K8s:

proveri:

- Secret objects

- RBAC

- mounts

- env

- namespaces

---

# 104. K8S SECRET BASE64

Base64 nije encryption.

---

# 105. SECRET VOLUME PERMISSIONS

Proveri process/user access.

---

# 106. SERVICE ACCOUNT TOKEN

Pod može imati širok cluster credential bez potrebe.

Cloud/IAM audit detaljnije zasebno.

---

# 107. CONFIGMAP

True secrets ne treba u ConfigMap.

---

# 108. SYSTEMD

`Environment=` ili env file permissions.

---

# 109. FILE SECRET

Ako secret je file:

proveri filesystem permissions.

---

# 110. SSH PRIVATE KEY

Posebno:

```text

-----BEGIN PRIVATE KEY-----

```

---

# 111. PUBLIC KEY NIJE SECRET

Ne prijavljuj `.pub` kao credential exposure.

---

# 112. TLS PRIVATE KEY

Exposure može omogućiti impersonation/decryption zavisno od protocol/key use-a.

---

# 113. SIGNING PRIVATE KEY

JWT/package/code-signing private key je high impact.

---

# 114. CERTIFICATE

Certificate sam po sebi najčešće public.

Private key je tajna.

---

# 115. MOBILE APP

Sve embedded u APK/IPA može se izvući.

---

# 116. MOBILE "SECRET"

Client-side API secret nije stvarna tajna ako svaki app korisnik dobija binary.

---

# 117. DESKTOP APP

Isto za distributed desktop executable.

---

# 118. OBFUSCATION

Obfuscation ne pretvara client-embedded secret u pouzdanu tajnu.

---

# 119. ANDROID `strings.xml`

Secret kandidat.

---

# 120. BUILD CONFIG

`BuildConfig.SECRET` u APK-u nije safe secret storage.

---

# 121. IOS PLIST

Isto.

---

# 122. DESKTOP CONFIG

Bundled JSON/resource.

---

# 123. SERVER CREDENTIAL U CLIENT APP-U

High severity ako credential ima privileged backend/provider access.

---

# 124. API DESIGN

Ako client mora imati provider credential da bi feature radio:

možda architecture zahteva server proxy/ephemeral scoped token.

Ne preporučuj bez actual use case-a.

---

# 125. SIGNED URL

Ephemeral scoped signed URL/token može legitimno biti poslat client-u.

To nije secret leak samo zato što je token vidljiv svom korisniku.

---

# 126. TOKEN SCOPE

Proceni:

- resource

- method

- expiration

- audience

---

# 127. OVER-BROAD EPHEMERAL TOKEN

Short lifetime ne pomaže ako token daje full admin access.

---

# 128. DATABASE

Traži credentials u:

- migrations

- seed

- backup scripts

- connection config

---

# 129. DATABASE DUMP

SQL dump može sadržati:

- users

- API tokens

- secrets

- password hashes

---

# 130. BACKUP

Backup file u public bucket-u može biti catastrophic exposure.

---

# 131. PASSWORD HASH

Hash nije plaintext secret, ali je sensitive authentication material.

---

# 132. UNSALTED FAST HASH

Detalj ide auth audit-u, ali dump exposure povećava risk.

---

# 133. API TOKEN TABLE

Ako raw bearer tokens stored u DB:

DB dump daje direct impersonation.

---

# 134. HASH API TOKENS

Ako samo verification treba:

preferiraj hash.

---

# 135. ENCRYPT THIRD-PARTY TOKEN

Ako backend mora koristiti token dalje:

encryption-at-rest može biti relevantna.

---

# 136. REFRESH TOKEN

Tretiraj kao high-value credential.

---

# 137. OAUTH PROVIDER TOKEN

Može dati pristup user external account-u.

---

# 138. CLOUD CREDENTIAL

Najviši prioritet ako ima široke privilegije.

---

# 139. IAM SCOPE

Pronađeni credential impact zavisi od permissions.

Ako permissions nisu poznate:

**CREDENTIAL PRIVILEGES: NOT VERIFIED**

---

# 140. ROOT / OWNER CREDENTIAL

P0 candidate.

---

# 141. DATABASE SUPERUSER

High impact.

---

# 142. READ-ONLY CREDENTIAL

Niži severity, ali sensitive data exposure može i dalje biti ozbiljan.

---

# 143. WEBHOOK SECRET

Exposure omogućava forging događaja samo ako receiver veruje toj tajni.

---

# 144. SESSION SIGNING SECRET

Exposure može omogućiti forging session-a u određenim frameworks.

---

# 145. JWT SIGNING SECRET

Ako symmetric:

attacker može kreirati tokene ako zna claims/verification model.

---

# 146. JWT PRIVATE KEY

High impact.

---

# 147. ENCRYPTION MASTER KEY

Može dekriptovati stored sensitive data.

---

# 148. ROTATED SECRET

Ako old credential je definitivno revoked:

incident severity za current exploitability pada.

Ali historical exposure i process finding ostaju.

---

# 149. EXPIRATION

Expired token nije current access credential.

---

# 150. SECRET VERSION

Mapiraj:

```text

current

old

unknown

```

---

# 151. DUPLICATE SECRET USE

Isti production secret koristi više services/environments.

Blast radius raste.

---

# 152. STAGING = PRODUCTION SECRET

Posebno loše.

Compromise slabijeg environment-a utiče na production.

---

# 153. SHARED JWT SECRET

Dev/staging/prod token trust može biti pomešan.

---

# 154. SHARED DATABASE CREDENTIAL

Više apps imaju isti privileged DB account.

---

# 155. PER-SERVICE CREDENTIALS

Smanjuju blast radius.

P4/P2 prema actual broad exposure-u.

---

# 156. ROTATION SUPPORT

Za svaki high-value secret pitaj:

> Može li biti rotiran bez velikog outage-a?

---

# 157. DUAL-KEY ROTATION

Signing/webhook secrets mogu zahtevati overlap.

---

# 158. NEVER-ROTATED SECRET

Nije automatski vulnerability.

Ali povećava impact dugotrajnog neotkrivenog exposure-a.

---

# 159. SECRET AGE

Ako metadata postoji, dokumentuj.

---

# 160. BOOTSTRAP SECRET

Initial admin password/API key treba invalidirati/promeni nakon provisioning-a.

---

# 161. DEFAULT SECRET

Pattern:

```text

SECRET = env.SECRET || "secret"

```

Critical ako fallback radi u production-u.

---

# 162. EMPTY SECRET

Proveri behavior:

```text

SECRET=""

```

---

# 163. MISSING SECRET FAIL-OPEN

App ne treba startovati sa weak default-om ako credential štiti authentication/signing/encryption.

---

# 164. FAIL FAST

Critical secret absence treba jasno failovati startup gde je appropriate.

---

# 165. SECRET MANAGER

Ako postoji:

- AWS Secrets Manager

- Vault

- cloud secret store

- Vercel env

proveri actual integration.

Ne preporučuj migraciju samo radi checkbox-a.

---

# 166. SECRET MANAGER ACCESS

App identity mora imati samo potrebne secrets.

---

# 167. LIST SECRETS

Permission da listuje sve secrets povećava blast radius.

---

# 168. RUNTIME FETCH

Secret može biti fetched on demand ili injected at startup.

Oba modela imaju tradeoff.

---

# 169. CACHE SECRET

In-memory caching je normalno.

Ne loguj/dumpuj.

---

# 170. CRASH DUMP

Memory dump može sadržati secrets.

Obično operational privileged access, ne app vulnerability samo po sebi.

---

# 171. CORE DUMP

Production core dumps mogu čuvati credentials.

P4/P2 prema access/retention.

---

# 172. SWAP

OS-level concern, ne app finding bez relevantnog threat modela.

---

# 173. PROCESS LIST

Secret u command-line argumentu može biti vidljiv drugim users/process tools.

---

# 174. CLI ARGUMENT

Preferiraj stdin/env/file prema tool threat modelu.

---

# 175. SUBPROCESS

App može proslediti API key kroz command arg i leakovati ga kroz process listing/log.

---

# 176. SHELL HISTORY

Operational commands sa secrets.

---

# 177. DEPLOY LOG

Platform command logging može sačuvati argumente.

---

# 178. PACKAGE MANAGER TOKEN

Traži:

```text

.npmrc

.pypirc

.nuget

pip.conf

```

---

# 179. `.npmrc`

Token često završi u repo-u ili Docker image-u.

---

# 180. GIT CREDENTIAL

PAT u remote URL-u:

```text

https://token@github...

```

---

# 181. SUBMODULE

`.gitmodules` može sadržati credentialed URL.

---

# 182. TERRAFORM

State file može sadržati plaintext secrets.

---

# 183. TFSTATE

Ako public/uploaded artifact:

critical.

---

# 184. TERRAFORM OUTPUT

Sensitive output mora biti pravilno tretiran, ali `sensitive=true` ne encryptuje state.

---

# 185. IaC VARIABLES

`.tfvars` real secrets u repo-u.

---

# 186. PULUMI / OTHER IaC

Proveri secret storage semantics prema tool-u.

---

# 187. ANSIBLE VAULT

Encrypted file može biti bezbedan ako vault password nije zajedno sa njim.

---

# 188. K8S MANIFEST

Base64 secret u Git nije stvarno zaštićen.

---

# 189. HELM VALUES

Production passwords često procure kroz `values.yaml`.

---

# 190. VERCEL

Ako Vercel:

proveri da server-only env nema public prefix i da preview/prod scopes odgovaraju nameri.

---

# 191. PREVIEW DEPLOYMENT

Preview builds možda dobijaju production secrets nepotrebno.

---

# 192. UNTRUSTED PREVIEW

Ako arbitrary branch/PR code dobija production credential:

high-risk.

---

# 193. RAILWAY/OTHER PLATFORM

Isti princip:

- environment scope

- service scope

- preview scope

---

# 194. THIRD-PARTY INTEGRATION

Secret može biti prosleđen remote vendor-u kroz webhook/config.

Proveri samo intentional boundaries.

---

# 195. SUPPORT TOOL

Admin/support tooling može prikazivati env/config.

---

# 196. DEBUG DUMP

Endpoint:

```text

/debug/env

```

P0/P1 ako public/auth weak.

---

# 197. HEALTH ENDPOINT

Ne vraćaj full connection strings/config.

---

# 198. METRICS

Prometheus labels ne smeju imati secrets.

---

# 199. EXCEPTION MESSAGE

Library može uključiti credentialed URL.

---

# 200. DATABASE ERROR

Connection failure može ispisati DSN.

---

# 201. SMTP ERROR

Može uključiti username/server details, ređe password.

Proveri actual object.

---

# 202. CLOUD SDK ERROR

Ne vraćaj raw credential/request signing headers.

---

# 203. SECRET REDACTION TEST

Namerno koristi fake canary secret u test env-u.

Pokreni:

- normal flow

- error flow

Traži da li se pojavljuje u:

- logs

- traces

- client response

- CI

---

# 204. CANARY SECRET

Odličan način za potvrdu redaction coverage bez izlaganja pravog credential-a.

---

# 205. BUILD SCAN

Posle production build-a pretraži output za fake canary secret.

---

# 206. IMAGE SCAN

Posle Docker build-a pretraži final filesystem/history za canary.

---

# 207. CLIENT BUNDLE SCAN

Posebno.

---

# 208. LOG SCAN

Pokreni request sa fake credential-om.

Pregledaj logs.

---

# 209. ERROR MONITORING SCAN

Ako test environment integrisan.

---

# 210. CI LOG SCAN

Canary u secret store-u, bez expose-ovanja pravog credential-a.

---

# 211. ROTATION DRILL

Za critical credentials proveri da li postoji procedure/test za rotation.

P4 ako nema active exposure.

---

# 212. COMPROMISE RESPONSE

Za confirmed secret leak remediation mora uključiti:

```text

revoke

rotate

replace

verify old credential invalid

search reuse

remove exposure source

```

---

# 213. SAMO BRISANJE NIJE REMEDIATION

Ako key je procurio:

```text

delete from repo

```

nije dovoljno.

---

# 214. GIT HISTORY REWRITE

Može smanjiti buduću accidental exposure, ali ne vraća tajnost već procurilog credential-a.

---

# 215. SECRET SCANNING

Pre-commit/CI scanning može sprečiti nove incidente.

P4/P3 osim ako current process već pravi repeated exposure.

---

# 216. PUSH PROTECTION

Koristan defense-in-depth ako platforma podržava.

---

# 217. ENTROPY-BASED SCANNER

Može imati false positives.

---

# 218. PROVIDER PATTERNS

Precizniji za poznate key formate.

---

# 219. CUSTOM SECRET FORMAT

Dodaj rules samo za stvarne interne patterns.

---

# 220. ALLOWLIST

Scanner allowlist mora biti uska, da ne sakrije realne future leaks.

---

# 221. SECRET OWNER

Za high-value credential identifikuj:

- service

- team

- use

- scope

ako metadata postoji.

---

# 222. UNUSED SECRET

Credential možda više nije potreban, ali i dalje validan.

Attack surface bez business value.

---

# 223. ORPHAN CREDENTIAL

Niko ne zna čemu služi, ali ima privilege.

High-value cleanup candidate.

---

# 224. OVER-PRIVILEGED CREDENTIAL

Exposure severity zavisi od permissions.

---

# 225. READ-ONLY TOKEN

Može i dalje omogućiti massive data exfiltration.

---

# 226. WRITE TOKEN

Integrity impact.

---

# 227. ADMIN TOKEN

Critical.

---

# 228. BILLING TOKEN

Financial impact.

---

# 229. EMAIL/SMS CREDENTIAL

Može omogućiti spam/phishing/cost abuse.

---

# 230. AI PROVIDER KEY

Može omogućiti cost abuse, data access zavisno od provider/account permissions.

---

# 231. STORAGE KEY

Može omogućiti private file access/delete.

---

# 232. DATABASE URL

Impact zavisi od network accessibility + DB privileges.

---

# 233. DB CREDENTIAL BEHIND PRIVATE NETWORK

Exposure i dalje ozbiljan, ali exploitability mora uzeti network reachability u obzir.

---

# 234. VPN-ONLY CREDENTIAL

Attacker možda treba dodatni network foothold.

Severity prilagodi.

---

# 235. SIGNING SECRET

Čak i bez network DB access-a, može omogućiti offline token forging.

---

# 236. PRIVATE KEY PASSPHRASE

Ako key + passphrase stoje zajedno:

zaštita se smanjuje.

---

# 237. TWO-PART SECRET

Ako halves dolaze iz odvojenih trust domains:

dokumentuj.

---

# 238. SECRET DERIVATION

Hardcoded "master password" iz kojeg se deriviraju keys je high-risk.

---

# 239. CRYPTO KEY ROTATION

Posebno pažljivo jer stari encrypted data može zahtevati old key.

---

# 240. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text

ID:

Severity:

Category:

Confidence:

Status:

Evidence tier:

Secret type:

Secret value:

DO NOT PRINT FULL VALUE

Masked fingerprint:

Example:

abcd...wxyz

Environment:

Production / Staging / Dev / Unknown

Location:

File / Commit / Log / Bundle / Artifact / Image / Response / CI

File/Path:

Line/Commit:

Service:

Exposure path:

Who can access it:

Credential status:

CURRENT

ROTATED

REVOKED

EXPIRED

UNKNOWN

Privileges:

VERIFIED

PARTIAL

NOT VERIFIED

Potential access:

Confidentiality impact:

Integrity impact:

Financial impact:

Blast radius:

Evidence:

Root cause:

Immediate containment:

Rotation/revocation plan:

Long-term remediation:

Regression/prevention test:

Production verification:

Complexity:

XS / S / M / L / XL

```

---

# 241. NIKADA NE ŠTAMPAJ FULL SECRET U REPORT

Koristi:

```text

sk_live_abcd...wxyz

```

ili hash/fingerprint.

---

# 242. SEVERITY

Koristi:

## P0 - CRITICAL

- current exposed credential omogućava production admin/cloud takeover

- current signing private key/secret omogućava forging privileged auth

- production DB root/admin credential javno izložen i reachable

- encryption master key + ciphertext/data access daju catastrophic disclosure

## P1 - HIGH

- valid production API key sa značajnim read/write privilegijama

- current DB credential sa sensitive data access-om

- CI/deploy token koji omogućava production code modification

- private storage credential sa širokim access-om

- untrusted CI code može čitati production secrets

## P2 - MEDIUM

- limited-scope current credential

- sensitive secret exposed samo authenticated/internal users sa realnim abuse path-om

- staging credential sa značajnim lateral-risk vezama

- logs sadrže reusable user tokens

## P3 - LOW

- expired/revoked secret exposure

- low-impact internal credential

- minor metadata leakage

## P4 - HARDENING

- missing secret scanning

- broad access policy bez confirmed leak-a

- rotation/readiness improvement

---

# 243. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

---

# 244. STATUS

Koristi:

```text

CONFIRMED

LIKELY

THEORETICAL

NOT VERIFIED

```

---

# 245. EVIDENCE TIER

```text

A - confirmed exposure + credential status/impact

B - exact secret value present in reachable artifact/code

C - strong secret-pattern and production context

D - partial/inferred

E - generic hardening

```

---

# 246. CATEGORY

Koristi:

```text

SOURCE CONTROL

GIT HISTORY

FRONTEND BUNDLE

API RESPONSE

LOGGING

ERROR MONITORING

CI/CD

BUILD ARTIFACT

DOCKER IMAGE

MOBILE/DESKTOP BUNDLE

DATABASE

CLOUD/IAM

CONFIGURATION

BACKUP

IaC

```

---

# 247. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. da li je vrednost zaista secret

2. da nije placeholder

3. environment

4. current/revoked status ako je poznat

5. privilege scope

6. network/reachability preconditions

7. ko može videti lokaciju exposure-a

8. deployment build behavior

9. logs/artifacts retention

10. alternate copies/history

---

# 248. NE TESTIRAJ STVARNI KEY NEOVLAŠĆENO

Nikad ne potvrđuj validnost tako što ćeš pristupati tuđim podacima ili sistemima bez eksplicitnog ovlašćenja.

---

# 249. NE PRIJAVLJUJ CLIENT ID KAO CLIENT SECRET

Razlikuj public i confidential OAuth podatke.

---

# 250. NE PRIJAVLJUJ PUBLIC API KEY AUTOMATSKI

Neki providers dizajniraju key da bude browser-visible.

Proveri provider model i scopes.

---

# 251. NE PRIJAVLJUJ HASH KAO PLAINTEXT PASSWORD

Ali password hash i dalje jeste sensitive.

---

# 252. NE PRIJAVLJUJ CERTIFICATE KAO PRIVATE KEY

Public cert je normalno public.

---

# 253. NE PRIJAVLJUJ MASKED UI VALUE KAO EXPOSURE

`••••abcd` nije secret leak.

---

# 254. NE PREPORUČUJ VAULT AUTOMATSKI

Platform-managed env secrets mogu biti sasvim adekvatni.

---

# 255. NE ROTIRAJ SVE NASLEPO

Confirmed exposure -> prioritetna rotacija.

Unexposed credential -> rotation policy prema risk-u.

---

# 256. NE BRIŠI SECRET PRE NEGO ŠTO RAZUMEŠ DEPENDENCIES

Naglo revoke-ovanje production key-a može napraviti outage.

Containment mora biti kontrolisan.

---

# 257. NE MENJAJ KOD

Tokom audita:

- ne revoke-uj key

- ne rotate-uj key

- ne briši env

- ne menjaj CI secrets

- ne rewrite-uj Git history

bez eksplicitnog odobrenja.

Prvo završi audit.

---

# 258. OUTPUT - SECRETS_CREDENTIAL_EXPOSURE_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- secret model

- scanned surfaces

- confirmed current exposures

- historical exposures

- highest blast-radius credentials

## 2. Secret Inventory

Bez full values.

## 3. Source Code Exposure Audit

## 4. Git History Audit

## 5. Config / Environment Audit

## 6. Frontend Bundle Audit

## 7. API / Error Response Leakage Audit

## 8. Logging Audit

## 9. Error Monitoring / Tracing Audit

## 10. CI/CD Secret Audit

## 11. CI Artifact / Cache Audit

## 12. Docker / Container Audit

## 13. Deployment Platform Audit

## 14. Mobile / Desktop Embedded Credential Audit

## 15. Database Stored Credential Audit

## 16. Cloud / Provider Credential Audit

## 17. Object Storage / Backup Exposure Audit

## 18. IaC / Terraform / Helm Audit

## 19. Environment Separation Audit

## 20. Secret Rotation / Revocation Readiness

## 21. Secret Scanning / Prevention Coverage

## 22. Findings Summary

| ID | Severity | Secret type | Environment | Exposure | Status | Confidence |

|---|---|---|---|---|---|---|

## 23. P0 Findings

## 24. P1 Findings

## 25. P2 Findings

## 26. P3 Findings

## 27. P4 Hardening

## 28. Things Done Well

## 29. Revoked / Historical Secrets

## 30. Not Verified

## 31. Immediate Containment Plan

## 32. Rotation Roadmap

## 33. Long-Term Prevention Roadmap

---

# 259. SECRET INVENTORY MATRIX

| Secret | Environment | Storage | Consumer | Scope | Status |

|---|---|---|---|---|---|

Koristi masked identifier.

---

# 260. EXPOSURE MATRIX

| Secret | Source | Git | Bundle | Logs | CI | Image |

|---|---|---|---|---|---|---|

---

# 261. ROTATION MATRIX

| Secret | Rotatable | Downtime needed | Dual-key support | Last rotation |

|---|---|---|---|---|

Ako nije poznato:

**NOT VERIFIED**

---

# 262. CLIENT VISIBILITY MATRIX

| Value | Browser | Mobile binary | Desktop binary | Intended public |

|---|---|---|---|---|

---

# 263. SECOND PASS - REPOSITORY SECRET HUNT

Pretraži kompletan repository uključujući:

- source

- configs

- tests

- docs

- scripts

- workflows

- IaC

za:

- known provider prefixes

- private-key markers

- credential URLs

- high-entropy literals

---

# 264. SECOND PASS - GIT HISTORY HUNT

Ako history postoji:

traži secrets u starim commit-ima i deleted files.

---

# 265. SECOND PASS - FRONTEND BUILD

Napravi production build.

Pretraži final browser assets za:

- known secrets

- fake canary secret

- server-only environment values

---

# 266. SECOND PASS - SOURCE MAP

Ako deploy-ovana source mapa postoji:

proveri secret/config leakage.

---

# 267. SECOND PASS - API RESPONSES

Izazovi:

- normal response

- validation error

- internal error

- provider error

Traži credentials/config.

---

# 268. SECOND PASS - LOGGING

Sa fake credential-om prođi:

- login

- API provider call

- webhook

- DB connection error

Proveri redaction.

---

# 269. SECOND PASS - ERROR MONITORING

Ako je dostupno u test env-u:

proveri da fake secret nije captured.

---

# 270. SECOND PASS - CI

Analiziraj svaki workflow za:

```text

echo

printenv

set -x

artifact upload

untrusted PR execution

```

---

# 271. SECOND PASS - UNTRUSTED CI CODE

Pitaj:

> Može li contributor-controlled code da se izvrši u job-u koji ima production secrets?

Ako da:

high priority.

---

# 272. SECOND PASS - DOCKER

Pregledaj:

- Dockerfile

- build context

- final filesystem

- image history

---

# 273. SECOND PASS - `.npmrc` / PACKAGE CONFIG

Traži registry credentials u:

- repo-u

- image-u

- artifacts

---

# 274. SECOND PASS - IaC

Proveri:

- tfvars

- tfstate handling

- Helm values

- K8s manifests

---

# 275. SECOND PASS - PREVIEW ENVIRONMENT

Pitaj:

> Da li preview deployment iz untrusted branch-a dobija production credential?

---

# 276. SECOND PASS - ENVIRONMENT REUSE

Uporedi:

```text

development

staging

production

```

credentials/signing secrets.

---

# 277. SECOND PASS - DATABASE STORED TOKENS

Za svaki bearer-like credential u DB-u pitaj:

> Ako attacker dobije read-only DB dump, može li ga odmah koristiti?

---

# 278. SECOND PASS - BACKUP

Pronađi:

- SQL dumps

- `.bak`

- archives

- generated backups

i proveri access/storage.

---

# 279. SECOND PASS - DEFAULT FALLBACK

Pretraži:

```text

process.env.X || "..."

getenv("X", "...")

default_secret

changeme

```

za auth/signing/encryption credentials.

---

# 280. SECOND PASS - CLIENT APP

Ako postoje:

- web

- Android

- iOS

- desktop

traži server/provider credentials ugrađene u distribuirane artifacts.

---

# 281. SECOND PASS - ROTATION

Za svaki confirmed current P0/P1 secret napravi containment plan:

```text

1. create replacement

2. deploy consumers

3. switch traffic

4. revoke old

5. verify old invalid

6. monitor abuse

```

Prilagodi tehnologiji.

---

# 282. SECOND PASS - HISTORICAL EXPOSURE

Ako current credential je rotiran:

proveri da li history sadrži druge, još važeće povezane credentials.

---

# 283. SECOND PASS - BLAST RADIUS

Za svaki exposed credential pitaj:

- šta može read

- šta može write

- može li kreirati nove credentials

- može li menjati production

- može li pristupiti drugim environments

---

# 284. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- public identifiers nisu pogrešno prijavljeni kao secrets

- placeholder/test values su odvojeni od stvarnih credentials

- full secret vrednosti nisu prikazane u report-u

- current/revoked/expired status je razdvojen

- production environment ima veći prioritet od dev-a

- Git history je analiziran gde je dostupan

- uklanjanje iz repo-a nije predstavljeno kao dovoljna remediation

- browser bundle je tretiran kao public

- transitive client imports su provereni

- API/error response leakage je proverena

- logs/APM/error monitoring imaju redaction audit

- CI log/artifact/cache paths su provereni

- untrusted PR code + production secret kombinacija je posebno analizirana

- Docker final layers i history su razdvojeni

- client mobile/desktop binary nije tretiran kao secure secret store

- DB raw bearer token storage je analiziran prema use case-u

- environment separation je proverena

- default/fallback secrets su pretraženi

- credential privileges su potvrđene ili označene NOT VERIFIED

- network reachability je uključena u DB/cloud exploitability

- rotation plan uključuje revocation stare tajne

- svaki P0/P1 ima konkretan exposure path i blast radius

- P4 secret-management hardening je odvojen od potvrđenih leaks

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Nemojte commitovati `.env`, koristite Vault i rotirajte ključeve.

To nije Secrets & Credential Exposure Audit.

Tražim probleme poput:

```text

production API secret stored in:

.env.production

↓

file committed to repository

↓

repository accessible to many contributors

↓

same key still configured in production

↓

credential gives write access to provider

↓

current production credential exposure

```

ili:

```text

server secret:

PAYMENT_PROVIDER_SECRET

↓

renamed:

NEXT_PUBLIC_PAYMENT_PROVIDER_SECRET

↓

Next.js production build

↓

value in client JavaScript bundle

↓

every visitor can extract server credential

```

ili:

```text

CI job has:

PRODUCTION_DEPLOY_TOKEN

↓

workflow triggered by untrusted PR context

↓

attacker-controlled repository code executes

↓

code reads environment variable

↓

production deploy token can be exfiltrated

```

ili:

```text

Dockerfile:

COPY . .

↓

build context includes .env

↓

later layer deletes .env

↓

final filesystem looks clean

↓

older image layer still contains credential

```

ili:

```text

logger records entire HTTP request object

↓

Authorization header included

↓

logs retained for 30 days

↓

support/monitoring users can retrieve reusable bearer token

```

ili:

```text

database stores API keys in plaintext

↓

keys are bearer credentials

↓

backend only needs to verify presented key

↓

read-only DB compromise immediately gives reusable customer credentials

```

ili:

```text

JWT signing secret:

same value in staging and production

↓

staging environment is accessible to wider group

↓

production verifier does not isolate issuer/environment

↓

staging compromise can enable production token forgery

```

ili:

```text

production backup:

database-2026.sql

↓

contains users, refresh tokens and third-party credentials

↓

uploaded to public object storage bucket

↓

direct credential and data exposure

```

To su secret exposure problemi koje treba da pronađeš.

Razmišljaj kroz:

- šta je zaista secret

- gde se nalazi

- ko može da ga vidi

- da li je current

- koje privilegije daje

- gde još postoji kopija

- kako se rotira

- kako se potvrđuje da je stari credential mrtav

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji credential je izložen?

> Gde je izložen?

> Ko tačno može do njega?

> Da li je produkcioni?

> Da li je još važeći?

> Koje privilegije daje?

> Da li postoji još kopija u history-ju, logs ili artifact-ima?

> Da li remediation uključuje stvarnu revocation/rotation?

Ako validity nije potvrđena:

**CREDENTIAL STATUS NOT VERIFIED.**

Ako privilege scope nije poznat:

**CREDENTIAL PRIVILEGES NOT VERIFIED.**

Ako je vrednost javni identifier ili placeholder:

**NOT A SECRET.**

Ako postoji samo bolji secret-management proces bez konkretnog exposure-a:

**P4 - HARDENING.**

Bolje je pronaći 3 stvarna, aktuelna credential exposure-a sa preciznim blast radius-om nego prijaviti stotine false-positive stringova.

Cilj je dobiti forenzički precizan Secrets & Credential Exposure audit koji se može direktno pretvoriti u:

- incident containment

- credential rotation

- Git/CI cleanup

- frontend bundle correction

- logging redaction

- environment isolation

- secret-scanning prevention

- production credential hardening
