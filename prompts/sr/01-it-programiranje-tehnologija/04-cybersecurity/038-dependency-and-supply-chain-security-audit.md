---
id: UPL-IT-038
number: 38
slug: dependency-and-supply-chain-security-audit
title: Bezbednosni audit zavisnosti i lanca snabdevanja softvera
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# BEZBEDNOSNI AUDIT ZAVISNOSTI I LANCA SNABDEVANJA SOFTVERA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog software supply chain-a projekta.

Glavni cilj:

> Utvrditi da li projekat može biti kompromitovan kroz dependency, transitive package, package registry, build proces, lockfile, installer/postinstall script, CI/CD workflow, release artifact, dependency confusion, typosquatting, compromised maintainer account, unpinned external action, package substitution ili drugi supply-chain put.

Ovo nije:

- generički `npm audit`

- automatsko prijavljivanje svakog CVE-a

- automatsko update-ovanje svih dependency-ja

- pretpostavka da je svaka stara verzija ranjiva

- pretpostavka da je svaki package sa malim brojem maintainer-a nesiguran

- automatski zahtev da se dependency-je vendor-uje

- samo SBOM generisanje

- samo GitHub Dependabot pregled

- samo npm/pip/Maven security audit

- samo CI/CD audit

Fokus je na kompletnom lancu:

```text

developer selects dependency

↓

manifest

↓

registry resolution

↓

lockfile

↓

package download

↓

install scripts

↓

build environment

↓

CI/CD

↓

artifact

↓

deployment

```

Prioritet:

**active exploitable vulnerable dependency > malicious/package substitution path > dependency confusion > compromised build execution > untrusted CI supply chain > release artifact integrity > lockfile/reproducibility weakness > package hygiene**

Bolje je pronaći 5 stvarnih supply-chain compromise path-ova nego prijaviti 300 dependency-ja sa zastarelim verzijama.

---

# 1. UTVRDI ECOSYSTEM

Inventariši sve package ecosystems:

- npm/pnpm/yarn/bun

- pip/poetry/uv

- Maven/Gradle

- NuGet

- Cargo

- Go modules

- Composer

- RubyGems

- SwiftPM

- CocoaPods

- system packages

- Docker base images

- GitHub Actions

- Helm charts

- Terraform providers/modules

---

# 2. MANIFEST INVENTORY

Pronađi:

```text

package.json

pnpm-workspace.yaml

requirements.txt

pyproject.toml

poetry.lock

pom.xml

build.gradle

Cargo.toml

go.mod

*.csproj

composer.json

Gemfile

Package.swift

```

i sve druge dependency izvore.

---

# 3. LOCKFILE INVENTORY

Pronađi:

- package-lock.json

- pnpm-lock.yaml

- yarn.lock

- bun.lock

- poetry.lock

- uv.lock

- Cargo.lock

- composer.lock

- packages.lock.json

- Gradle dependency lock

- equivalent

---

# 4. LOCKFILE MISSING

Nije automatski critical.

Ali za deployable application može smanjiti reproducibility i povećati resolution drift.

---

# 5. LOCKFILE COMMITTED

Proveri da li je versionovan.

---

# 6. MULTIPLE LOCKFILES

High-signal:

```text

package-lock.json

+

yarn.lock

+

pnpm-lock.yaml

```

Pitaj koji tool je authoritative.

---

# 7. PACKAGE MANAGER DRIFT

Local koristi npm, CI koristi yarn, production nešto treće.

Može resolve-ovati drugačije dependency-je.

---

# 8. LOCKFILE BYPASS

CI/install command možda ignoriše lockfile.

Primer:

```text

npm install

```

naspram reproducible/frozen install moda gde ecosystem to podržava.

---

# 9. FLOATING VERSION

Manifest:

```text

*

latest

>=

```

može dozvoliti neočekivanu buduću verziju.

Severity prema ecosystem-u i lockfile-u.

---

# 10. RANGE VERSION

`^` ili `~` nije automatski problem.

Lockfile može stabilizovati application build.

---

# 11. DIRECT DEPENDENCY

Inventariši direct production dependencies.

---

# 12. DEV DEPENDENCY

Dev-only package može i dalje biti supply-chain risk ako se izvršava u:

- CI

- build

- release

---

# 13. TRANSITIVE DEPENDENCY

Napad ne mora biti u top-level package-u.

Mapiraj dependency tree za high-risk components.

---

# 14. RUNTIME VS BUILD-TIME

Klasifikuj:

```text

RUNTIME

BUILD

DEV

TEST

CI

DEPLOY

```

---

# 15. ATTACK SURFACE DEPENDENCY-JA

Package koji samo radi compile-time type checking nema isti risk kao:

- HTTP parser

- image parser

- auth library

- template engine

- shell utility

---

# 16. REACHABILITY

CVE nije isto što i exploitable vulnerability.

Pitaj:

> Da li aplikacija stvarno koristi ranjivu funkciju/path?

---

# 17. INSTALLED VERSION

Ne oslanjaj se samo na manifest range.

Utvrdi exact resolved version iz lockfile-a/build-a.

---

# 18. DEPLOYED VERSION

Repo version može se razlikovati od produkcionog artifact-a.

Ako nije potvrđeno:

**DEPLOYED DEPENDENCY VERSION: NOT VERIFIED**

---

# 19. VULNERABILITY SOURCES

Ako koristiš scanner/advisory:

preferiraj:

- official vendor advisory

- ecosystem advisory database

- NVD/CVE gde relevantno

- framework security advisory

---

# 20. CVE SCORE NIJE SEVERITY APLIKACIJE

External CVSS nije automatski lokalni P0/P1.

Proceni:

- reachability

- exposure

- prerequisites

- app privileges

---

# 21. VULNERABLE FUNCTION

Utvrdi konkretan code path.

---

# 22. CONFIG-DEPENDENT CVE

Neki vulnerability postoji samo kada je uključena određena opcija.

Proveri config.

---

# 23. PLATFORM-DEPENDENT CVE

Linux-only problem nije active na Windows-only deployment-u, i obrnuto.

---

# 24. DEV-ONLY CVE

Ako package nije u runtime artifact-u:

severity prema build/CI exploit path-u.

---

# 25. FIX AVAILABLE

Zabeleži:

- patched version

- migration complexity

- breaking change

bez automatskog update-a.

---

# 26. NO FIX

Ako nema patch-a:

proceni:

- workaround

- package replacement

- feature disable

- isolation

---

# 27. ABANDONED PACKAGE

Ne prijavljuj samo zato što je poslednji release star.

Traži realne signale:

- unpatched known vulnerabilities

- incompatible ecosystem

- compromised maintainership

- dead upstream

---

# 28. PACKAGE OWNERSHIP

Za critical packages proveri:

- maintainer changes

- ownership transfers

- namespace transfers

ako podaci postoje.

---

# 29. MAINTAINER TAKEOVER

Package može promeniti owner-a bez promene imena.

High-value supply-chain signal.

---

# 30. SUDDEN MAJOR BEHAVIOR CHANGE

New version može dodati:

- installer

- network access

- telemetry

- obfuscated code

Ne proglašavaj malicious bez dokaza.

---

# 31. TYPOSQUATTING

Pregledaj package names za sličnosti sa popularnim bibliotekama.

---

# 32. INTERNAL PACKAGE NAME

Posebno važno za dependency confusion.

---

# 33. DEPENDENCY CONFUSION

Scenario:

```text

company uses:

@internal/foo

```

ili unscoped private name.

Pitaj:

> Može li public registry package sa istim imenom/version-om biti izabran?

---

# 34. PRIVATE REGISTRY

Proveri:

- registry mapping

- scope

- auth

- fallback

---

# 35. PUBLIC FALLBACK

Ako private package lookup padne, package manager ne treba neočekivano da povuče public namesake.

---

# 36. `.npmrc`

Pregledaj:

- registry

- scoped registry

- tokens

- `always-auth`

- fallback behavior

---

# 37. PIP INDEX

Pregledaj:

```text

--index-url

--extra-index-url

```

`extra-index-url` može povećati dependency-confusion risk.

---

# 38. MAVEN REPOSITORIES

Repo order i internal artifact coordinates.

---

# 39. NUGET SOURCES

Package source mapping gde relevantno.

---

# 40. GO PRIVATE MODULES

`GOPRIVATE`, proxy/checksum settings.

---

# 41. PACKAGE HASH / INTEGRITY

Lockfile često sadrži integrity/hash.

Proveri ecosystem semantics.

---

# 42. HASH MISSING

Može smanjiti tamper detection.

Ne rangiraj visoko bez concrete registry/path risk-a.

---

# 43. GIT DEPENDENCY

Manifest može koristiti:

```text

github:user/repo

git+https://...

```

---

# 44. GIT BRANCH DEPENDENCY

`main`, `master`, branch name:

floating code.

---

# 45. GIT COMMIT PIN

Bolje reproducibility.

---

# 46. GIT TAG

Tag može biti mutable u nekim systems.

Ne tretiraj kao immutable bez provider guarantee-a.

---

# 47. DIRECT URL DEPENDENCY

Remote tarball/binary URL.

Proveri:

- TLS

- hash

- immutability

- ownership

---

# 48. CURL | SHELL

High-signal install pattern:

```text

curl https://... | sh

```

u CI/build-u.

---

# 49. REMOTE INSTALL SCRIPT

Ako nije pinned/verified:

upstream compromise može izvršiti code u build environment-u.

---

# 50. PACKAGE INSTALL SCRIPT

Inventariši package lifecycle hooks:

- preinstall

- install

- postinstall

- prepare

---

# 51. INSTALL SCRIPT PRIVILEGE

Package code se izvršava sa privilegijama package manager procesa.

---

# 52. UNNECESSARY INSTALL SCRIPT

Package koji ne bi trebalo da ima install-time code zaslužuje review ako ga ima.

---

# 53. `ignore-scripts`

Ne preporučuj globalno bez razumevanja dependencies koje legitimno zahtevaju build scripts.

---

# 54. NATIVE ADDON BUILD

Node-gyp, Python extension, Cargo build scripts itd. izvršavaju build code.

---

# 55. BUILD SCRIPT = CODE EXECUTION

Dependency ne mora biti runtime-importovan da bi kompromitovao CI.

---

# 56. CI SECRETS

Supply-chain package install tokom job-a sa production secrets može exfiltrirati te secrets.

---

# 57. INSTALL PRE SECRETS

Ako je moguće, instalacija untrusted dependencies pre injection-a sensitive secrets smanjuje exposure.

P4/P2 prema CI threat-u.

---

# 58. UNTRUSTED PR + INSTALL

Contributor može promeniti dependency ili lockfile.

Ako privileged CI zatim instalira package sa secrets:

high-risk.

---

# 59. LOCKFILE PR REVIEW

Malicious dependency može biti sakriven u ogromnom lockfile diff-u.

---

# 60. MANIFEST-LOCK MISMATCH

Manifest izgleda benign, lockfile može resolve-ovati drugačiji package/version.

---

# 61. LOCKFILE TAMPERING

Pregledaj resolved URLs/integrity.

---

# 62. REGISTRY HOST

Dependency ne treba neočekivano da se preuzima sa random host-a.

---

# 63. ALTERNATE REGISTRY PACKAGE

Lockfile može ostati pinned na compromised private registry.

---

# 64. PACKAGE NAME COLLISION

Monorepo/workspace package vs external registry package.

---

# 65. WORKSPACE RESOLUTION

Proveri da build stvarno koristi lokalni workspace package kada je to namera.

---

# 66. MONOREPO HOISTING

Hoisting može promeniti resolved version.

---

# 67. PEER DEPENDENCY

Može implicitno dovesti package/version koji developer nije očekivao.

---

# 68. OPTIONAL DEPENDENCY

Može biti OS-specific i izvršavati code samo na određenim platformama.

---

# 69. PLATFORM BINARY

Package može downloadovati prebuilt binary.

---

# 70. BINARY DOWNLOAD

Proveri:

- source host

- TLS

- checksum/signature

- version binding

---

# 71. POSTINSTALL DOWNLOAD

High-value supply-chain surface.

---

# 72. BROWSER BINARY

Playwright/Puppeteer-like browser downloads su legitimate, ali supply source/integrity i CI privileges treba razumeti.

---

# 73. FFmpeg / TOOL BUNDLE

Package može downloadovati executable.

---

# 74. PREBUILT NATIVE BINARY

Registry package može sadržati executable bez source review-a.

---

# 75. DOCKER BASE IMAGE

Supply chain uključuje:

```text

FROM ...

```

---

# 76. `latest`

Floating base image.

---

# 77. TAG

Tag nije nužno immutable.

---

# 78. DIGEST PIN

Digest daje stronger immutability.

Ne zahtevaj svuda bez release workflow context-a.

---

# 79. BASE IMAGE SOURCE

Official/verified namespace.

---

# 80. ABANDONED IMAGE

Outdated OS/runtime može imati vulnerabilities.

---

# 81. IMAGE LAYERS

Inherited packages mogu biti ranjivi čak ako app dependencies nisu.

---

# 82. OS PACKAGES

Audituj:

```text

apt

apk

yum

dnf

```

installe.

---

# 83. `apt-get upgrade` BUILD

Može smanjiti reproducibility.

---

# 84. PINNED SYSTEM PACKAGE

Tradeoff između reproducibility i security updates.

Ne donosi blanket pravilo.

---

# 85. PACKAGE REPOSITORY KEY

Custom apt/yum repo trust.

---

# 86. EXPIRED REPO KEY

Build failure/security management issue.

---

# 87. GITHUB ACTIONS

Svaki:

```text

uses: owner/action@...

```

je dependency.

---

# 88. ACTION TAG

`@v4` može biti mutable tag.

---

# 89. ACTION COMMIT SHA

Strong immutability.

---

# 90. FIRST-PARTY VS THIRD-PARTY ACTION

Third-party action sa secrets/write token pristupom je high-value supply-chain boundary.

---

# 91. ACTION PERMISSIONS

Pregledaj:

```text

permissions:

```

---

# 92. DEFAULT GITHUB TOKEN

Ne pretpostavljaj read-only.

Proveri actual workflow/repo permissions model.

---

# 93. ACTION SECRET ACCESS

Koji steps dobijaju secrets?

---

# 94. THIRD-PARTY ACTION + PROD SECRET

High-risk ako action nije dovoljno trusted/pinned.

---

# 95. ACTION UPDATE

Major tag može promeniti code bez workflow diff-a.

---

# 96. COMPOSITE ACTION

Može pozivati dodatne remote tools/actions.

---

# 97. REUSABLE WORKFLOW

Supply-chain boundary i u:

```text

uses: org/repo/.github/workflows/...@ref

```

---

# 98. EXTERNAL WORKFLOW REF

Pinning/integrity prema risk-u.

---

# 99. CI SCRIPT DOWNLOAD

Workflow može downloadovati tools kroz curl/wget.

---

# 100. CHECKSUM

Remote binary download bez checksum/signature je high-value review point.

---

# 101. BUILD TOOLCHAIN

Compiler/runtime installer je dependency.

---

# 102. NODE SETUP

Version pinning.

---

# 103. PYTHON/JAVA/GO TOOLCHAIN

Isto.

---

# 104. FLOATING RUNTIME

Build sa "latest" runtime može neočekivano promeniti output.

---

# 105. CI IMAGE

Hosted runner/container image changes mogu promeniti toolchain.

---

# 106. SELF-HOSTED RUNNER

Veći persistence risk između jobs ako nije pravilno izolovan.

---

# 107. COMPROMISED RUNNER

Može ukrasti:

- source

- secrets

- signing keys

- artifacts

---

# 108. UNTRUSTED PR NA SELF-HOSTED RUNNER-U

Posebno high-risk.

---

# 109. BUILD ISOLATION

Untrusted contribution code ne treba da deli persistent privileged environment bez jasnog threat modela.

---

# 110. RELEASE ARTIFACT

Prati:

```text

source commit

↓

build

↓

artifact

↓

registry/release

↓

deployment

```

---

# 111. PROVENANCE

Može li se dokazati koji commit je proizveo artifact?

---

# 112. ARTIFACT HASH

Release checksum.

---

# 113. ARTIFACT SIGNING

Code/package/container signing može povećati assurance.

Ne zahtevaj kao blanket P1.

---

# 114. SIGNING KEY SECURITY

Ako potpisivanje postoji:

key je crown jewel.

---

# 115. SIGNING U CI

Ko može da trigger-uje signed production release?

---

# 116. UNTRUSTED CODE + SIGNING KEY

Critical supply-chain path.

---

# 117. PACKAGE PUBLISH

Ko može publish-ovati:

- npm

- PyPI

- Maven

- NuGet

- container registry

---

# 118. REGISTRY TOKEN

Scope:

- read

- publish

- org-wide

- package-specific

---

# 119. PUBLISH TOKEN U CI

Secrets & credential exposure audit ga takođe pokriva.

Ovde fokus na malicious release risk.

---

# 120. MFA / TRUSTED PUBLISHING

Registry account/publish mechanism.

P4/P2 prema package importance-u i actual controls.

---

# 121. NPM PROVENANCE / EQUIVALENT

Ako ecosystem podržava trusted publishing/provenance:

evidentiraj usage.

Ne zahtevaj kao jedinu validnu metodu.

---

# 122. PACKAGE IMMUTABILITY

Da li registry dozvoljava overwrite postojeće verzije?

Proveri ecosystem.

---

# 123. UNPUBLISH / REPUBLISH

Može promeniti availability/resolution u nekim ecosystems.

---

# 124. YANKED VERSION

Build može prestati da radi ili resolve-ovati drugačije prema ecosystem-u.

---

# 125. MIRROR / CACHE

Internal package proxy može:

- poboljšati availability

- izolovati registry

ali može i servirati stale/compromised artifacts.

---

# 126. CACHE POISONING

Ako internal registry/proxy trust model slab.

---

# 127. PACKAGE NAMESPACE OWNERSHIP

Prevent internal package names from being claimed publicly gde moguće.

---

# 128. SBOM

Generiši ili proveri postojeći Software Bill of Materials.

---

# 129. SBOM FORMAT

Primeri:

- CycloneDX

- SPDX

Ne zahtevaj određeni ako tooling koristi drugi validan format.

---

# 130. SBOM COMPLETENESS

Treba uključiti:

- direct

- transitive

- runtime

prema intended use-u.

---

# 131. SBOM STALENESS

SBOM od prošlog release-a ne opisuje current artifact.

---

# 132. ARTIFACT-SPECIFIC SBOM

Idealno vezan za stvarni build/release.

P4/P2 prema compliance/security need-u.

---

# 133. DEPENDENCY LICENSE

Licensing nije isto što i security.

Može biti zaseban report, ne mešaj severity.

---

# 134. END-OF-LIFE RUNTIME

Unsupported:

- Node

- Python

- Java

- framework

može prestati da dobija security patches.

---

# 135. EOL ≠ CURRENT EXPLOIT

P2/P4 prema exposure-u i known vulnerabilities.

---

# 136. FRAMEWORK SECURITY SUPPORT

Proveri branch/version support.

---

# 137. FORKED DEPENDENCY

Internal fork može sadržati security fixes ili ih izgubiti.

---

# 138. PATCH PACKAGE

Ako app patchuje dependency lokalno:

proveri:

- patch tracked

- applies deterministically

- ne briše upstream security fix

---

# 139. VENDORED CODE

Vendored dependency više neće dobiti automatic update notifications.

---

# 140. COPY-PASTED LIBRARY CODE

Supply-chain scanner ga možda ne vidi.

---

# 141. GENERATED CLIENT

Generated API SDK može bundle-ovati vulnerable runtime.

---

# 142. WASM

WASM module/binary je dependency i mora imati provenance/source.

---

# 143. CDN JAVASCRIPT

Frontend:

```html

<script src="https://cdn...">

```

je runtime supply-chain dependency.

---

# 144. SUBRESOURCE INTEGRITY

SRI može sprečiti neočekivanu promenu third-party static script-a kada deployment model dozvoljava fixed asset.

---

# 145. DYNAMIC THIRD-PARTY SCRIPT

Analytics/chat/widget script može menjati code bez vašeg deployment-a.

---

# 146. THIRD-PARTY SCRIPT PRIVILEGE

Na app origin-u obično ima pristup DOM-u i JS-readable data.

---

# 147. CSP

Može ograničiti script sources, ali ne sprečava compromised allowlisted vendor code.

---

# 148. TAG MANAGER

Tag manager je supply-chain code execution channel.

---

# 149. MARKETING TOOLS

Ko može kroz dashboard objaviti JS na production site-u?

---

# 150. BROWSER EXTENSIONS

Nisu vaš application supply chain u ovom scope-u osim enterprise-managed deployment-a.

---

# 151. REMOTE CONFIG

Ako app downloaduje executable rules/scripts/config:

proveri integrity/authenticity.

---

# 152. FEATURE CONFIG NIJE NUŽNO CODE

Ali template/expression config može postati code execution surface.

---

# 153. PLUGIN SYSTEM

Ako aplikacija podržava plugins/extensions:

supply-chain boundary je posebno važna.

---

# 154. PLUGIN SIGNING

Ako postoji marketplace/plugin install:

proveri provenance/permissions.

---

# 155. AUTO-UPDATE

Desktop/mobile auto-updater je software supply chain.

---

# 156. UPDATE MANIFEST

Mora biti authenticated/integrity-protected prema framework-u.

---

# 157. UPDATE URL

HTTPS je minimum, ali signed updates daju stronger assurance za desktop apps.

---

# 158. SIGNATURE CHECK BYPASS

Ako desktop updater prihvata unsigned package ili fail-open:

P0/P1 prema deployment-u.

---

# 159. DOWNGRADE

Attacker možda može naterati updater na staru vulnerable verziju.

---

# 160. VERSION MONOTONICITY

Anti-rollback gde security model zahteva.

---

# 161. MOBILE STORE

Official app stores pružaju svoj signing/distribution model.

Ne izmišljaj custom update requirements.

---

# 162. DESKTOP INSTALLER

Installer signing/provenance.

---

# 163. BUILD OUTPUT TAMPERING

Artifact upload/download između CI stages.

---

# 164. ARTIFACT PERMISSIONS

Ko može replace release artifact?

---

# 165. RELEASE TAG

Git tag nije dovoljan ako artifact može biti ručno zamenjen.

---

# 166. RELEASE APPROVAL

Production deploy rights.

---

# 167. BRANCH PROTECTION

Supply-chain risk ako attacker može directly push malicious dependency change na release branch.

---

# 168. CODE REVIEW

Critical dependency/CI changes mogu zahtevati review.

Organizaciona hardening stavka, ne vulnerability sama po sebi.

---

# 169. CODEOWNERS

Može pojačati review za:

- workflows

- lockfiles

- package manifests

P4/P2 prema controls.

---

# 170. BOT UPDATE

Dependabot/Renovate PR treba isto testirati/review-ovati.

Bot nije inherentno trusted source code oracle.

---

# 171. AUTO-MERGE

Dependency update auto-merge bez tests/policy može povećati risk.

---

# 172. SECURITY PATCH SPEED

Suprotni problem: previše ručni proces može ostaviti known exploit dugo unpatched.

---

# 173. UPDATE STRATEGY

Pitaj:

> Kako projekat otkriva i primenjuje security dependency updates?

---

# 174. VULNERABILITY SCANNING

Inventariši:

- npm audit

- pip-audit

- osv-scanner

- Dependabot

- Snyk

- Trivy

- Grype

- Maven/NuGet tools

---

# 175. SCANNER COVERAGE

Jedan scanner možda ne pokriva:

- OS packages

- container

- actions

- vendored code

---

# 176. SCANNER FALSE POSITIVES

Ne otvaraj P1 finding samo na scanner output-u bez context-a.

---

# 177. SUPPRESSION

Ignore list može skrivati ranjivost.

---

# 178. IGNORE EXPIRY

Suppression treba imati razlog i ideally rok/review.

---

# 179. TRANSITIVE FIX

Ponekad update direct parent-a rešava vulnerable transitive dependency.

---

# 180. OVERRIDE/RESOLUTION

Package manager override može patchovati transitive version.

Proveri compatibility.

---

# 181. FORCED OVERRIDE

Može slomiti package ako dependency nije kompatibilna.

Ne preporučuj bez tests.

---

# 182. SECURITY BACKPORT

Vendor može patchovati bez major upgrade-a.

---

# 183. MAJOR UPGRADE

Nije jedini način.

---

# 184. EXPLOITABILITY ANALYSIS

Za svaki high/critical advisory:

```text

dependency

↓

vulnerable API

↓

our code path

↓

attacker-controlled input

↓

impact

```

---

# 185. PARSER LIBRARY

File/media/XML/image parsers imaju high exposure ako obrađuju untrusted content.

---

# 186. AUTH LIBRARY

Security-sensitive čak i bez user input parser exploit-a.

---

# 187. HTTP SERVER

Framework/router/server vulnerability može biti reachable na svaki request.

---

# 188. BUILD-ONLY PACKAGE

Can still compromise release if malicious.

---

# 189. TEST-ONLY PACKAGE

Može kompromitovati developer/CI environment, ali možda ne production runtime.

---

# 190. MALICIOUS PACKAGE MODEL

CVE scanner neće otkriti namerno malicious latest package.

Zato audit mora uključiti provenance/trust.

---

# 191. OBFUSCATED PACKAGE CODE

Može biti signal, ali ne dokaz zlonamernosti.

---

# 192. NEW DEPENDENCY

Pitaj:

- zašto je potreban

- reputation/ownership

- privileges

- transitive size

- install scripts

---

# 193. ONE-LINE UTILITY PACKAGE

Velik transitive tree za trivijalnu funkciju može povećati attack surface.

Ali ne mora biti security finding.

---

# 194. DEPENDENCY FOOTPRINT

Broj dependencies nije vulnerability metric sam po sebi.

---

# 195. CRITICALITY

Prioritet package review-a po:

```text

privilege × exposure × execution stage

```

---

# 196. CI NETWORK

Malicious install script može exfiltrirati secrets preko network-a.

---

# 197. EGRESS RESTRICTION

Build egress restriction može biti advanced hardening.

Ne zahtevaj svuda.

---

# 198. HERMETIC BUILD

Strong assurance, ali complexity visoka.

P4 osim high-assurance environment-a.

---

# 199. REPRODUCIBLE BUILD

Ako isti source/lock/toolchain proizvodi isti artifact:

povećava tamper detection.

Ne mora biti potpuna bit-for-bit reproducibility za svaki project.

---

# 200. BUILD NETWORK ACCESS

Ako build uvek fetchuje arbitrary remote latest assets:

reproducibility opada.

---

# 201. CODE GENERATION

OpenAPI/protobuf/client code generator package može izvršiti arbitrary code tokom build-a.

---

# 202. PREBUILD HOOKS

Audituj scripts:

```text

prebuild

postbuild

prepare

generate

```

---

# 203. MONOREPO ROOT SCRIPT

Root `postinstall` može imati veliki privilege.

---

# 204. WORKSPACE PACKAGE SCRIPT

Untrusted workspace contribution može izvršiti during install/build.

---

# 205. GIT HOOK

Husky/pre-commit tools mogu izvršavati code kod developera.

Niži production severity, ali developer supply-chain risk.

---

# 206. IDE EXTENSION RECOMMENDATION

Repo može preporučiti extension, ali auto-install/execution model zavisi od IDE-a.

Obično van primary scope-a.

---

# 207. DEVCONTAINER

`.devcontainer` može izvršiti setup code sa developer privileges.

---

# 208. CODESPACES

Secrets availability u dev container-u.

---

# 209. POST-CREATE COMMAND

Supply-chain/dev environment code execution.

---

# 210. MAKEFILE / TASK RUNNER

Build commands mogu downloadovati unpinned tools.

---

# 211. BINARY CHECKSUM

Svaki externally downloaded build binary high-value.

---

# 212. RELEASE ASSET

GitHub release binary može biti replaced? Proveri trust/provenance model.

---

# 213. MIRROR COMPROMISE

Checksum/signature može pomoći.

---

# 214. TLS NIJE ARTIFACT IDENTITY

HTTPS štiti transport do servera, ne od compromised upstream server-a.

---

# 215. SIGNED ARTIFACT

Potpis je koristan samo ako verification key/trust root bezbedan.

---

# 216. SBOM + PROVENANCE

Dokumentacija ne sprečava attack sama po sebi, ali pomaže detection/audit.

---

# 217. INCIDENT RESPONSE

Ako package postane compromised:

može li se brzo utvrditi:

- gde je korišćen

- u kojim releases

- koji artifacts

- koji environments

---

# 218. DEPENDENCY INVENTORY

Bez njega blast-radius analiza je spora.

---

# 219. REMOVAL

Unused dependency treba ukloniti ako zaista nije potrebna.

Smanjuje attack surface.

---

# 220. DEAD IMPORT NIJE DOVOLJAN

Package može imati install script čak i ako nikad nije importovan.

---

# 221. UNUSED PACKAGE ANALYSIS

Proveri:

- imports

- scripts

- config

- build plugins

pre uklanjanja.

---

# 222. PACKAGE EXECUTION PERMISSIONS

Npm package ne dobija OS sandbox automatski.

Install/build script ima prava CI/user procesa.

---

# 223. CONTAINER BUILD ROOT

Package install često radi kao root u Docker build-u.

Malicious script može menjati image.

---

# 224. FINAL IMAGE TAMPERING

Build dependency može inject-ovati backdoor u output bez ostanka kao runtime package.

---

# 225. CLIENT BUNDLE INJECTION

Compromised frontend dependency može inject-ovati JS u production bundle.

---

# 226. SERVER BUNDLE INJECTION

Isto za backend.

---

# 227. SOURCE TRANSFORM PLUGIN

Babel/Vite/Webpack plugin ima ogromnu build moć.

---

# 228. LINTER / TEST PACKAGE

U CI sa secrets takođe može biti malicious execution vector.

---

# 229. SECURITY OF PACKAGE MANAGER

Package manager version/toolchain itself je supply-chain dependency.

---

# 230. COREPACK

Pin manager version gde workflow koristi.

---

# 231. `packageManager` FIELD

Može povećati reproducibility.

---

# 232. PYTHON BUILD BACKEND

`pyproject.toml` build-system dependencies se izvršavaju tokom install-a.

---

# 233. PEP 517 BUILD

Source package build može izvršiti arbitrary build code.

---

# 234. WHEEL VS SDIST

Wheel smanjuje local build execution, ali wheel sam predstavlja trusted binary artifact.

---

# 235. MAVEN PLUGIN

Build plugin izvršava code.

---

# 236. GRADLE PLUGIN

Isto.

---

# 237. TERRAFORM PROVIDER

Binary code sa cloud credentials.

High-value supply-chain boundary.

---

# 238. TERRAFORM MODULE

Module može definisati destructive cloud changes, iako ne izvršava arbitrary local code na isti način.

---

# 239. HELM CHART

Može promeniti deployment security/config.

---

# 240. ACTIONABLE FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text

ID:

Severity:

Category:

Confidence:

Status:

Evidence tier:

Dependency / component:

Ecosystem:

Resolved version:

Environment:

Execution stage:

RUNTIME / BUILD / CI / DEPLOY

Direct / transitive:

Source registry:

Lock status:

Integrity/provenance:

Vulnerability / supply-chain weakness:

Attacker model:

Preconditions:

Reachability:

Execution path:

T0:

T1:

T2:

T3:

Current exploitability:

Secrets available during execution:

Privileges available:

Production impact:

Developer/CI impact:

Blast radius:

Known patched version:

YES / NO / NOT VERIFIED

Root cause:

Recommended remediation:

Regression/build verification:

Production verification:

Complexity:

XS / S / M / L / XL

```

---

# 241. SEVERITY

Koristi:

## P0 - CRITICAL

- current dependency/supply-chain path omogućava unauthenticated production RCE sa realnim reachable path-om

- untrusted contribution/dependency code može pristupiti production signing/admin credentials i publish/deploy compromise

- package substitution/dependency confusion praktično omogućava arbitrary code u privileged production build-u

- updater prihvata attacker-controlled unsigned production binary

## P1 - HIGH

- exploitable high-impact dependency je reachable iz untrusted input-a

- unpinned/untrusted build code ima pristup production credentials i realan compromise path

- compromised internal package resolution može preuzeti privileged build

- third-party action/build plugin sa high privileges i weak provenance predstavlja practical supply-chain compromise risk

## P2 - MEDIUM

- meaningful vulnerable dependency sa dodatnim preconditions

- significant build/release integrity gap

- transitive package sa reachable moderate-impact flaw

- staging/dev supply-chain weakness sa plausible production lateral path

## P3 - LOW

- low-impact vulnerable package

- constrained dev-tool risk

- reproducibility weakness sa malim direct impact-om

## P4 - HARDENING

- SBOM/provenance/pinning/review improvements bez potvrđenog current compromise path-a

---

# 242. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

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

# 244. EVIDENCE TIER

Koristi:

```text

A - reproduced / exact deployed vulnerable path confirmed

B - complete dependency/build execution path

C - strong manifest/lock/config/advisory evidence

D - partial/inferred

E - generic hardening

```

---

# 245. CATEGORY

Koristi:

```text

VULNERABLE DEPENDENCY

TRANSITIVE DEPENDENCY

DEPENDENCY CONFUSION

TYPOSQUATTING

REGISTRY TRUST

LOCKFILE

INSTALL SCRIPT

REMOTE BINARY

DOCKER BASE IMAGE

CI ACTION

BUILD TOOLCHAIN

ARTIFACT INTEGRITY

PUBLISHING

UPDATER

SBOM / PROVENANCE

EOL

```

---

# 246. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. resolved version

2. deployed/build version

3. vulnerability conditions

4. actual code reachability

5. input reachability

6. platform/config

7. execution stage

8. privileges/secrets available

9. patch status

10. artifact/deployment relevance

---

# 247. NE PRIJAVLJUJ SAMO CVE SCORE

CVE sa CVSS 9.8 može biti neiskorišćen ako aplikacija ne koristi ranjivu funkciju.

---

# 248. NE PRIJAVLJUJ STARI PACKAGE SAMO ZATO ŠTO JE STAR

Starost nije exploitability.

---

# 249. NE PRIJAVLJUJ MNOGO DEPENDENCY-JA KAO SECURITY BUG

Broj package-a nije severity.

---

# 250. NE UPDATE-UJ MAJOR VERSION NASLEPO

Security remediation mora sačuvati compatibility.

---

# 251. NE PREPORUČUJ PINOVANJE SVEGA NA BILO KOJI NAČIN

Pinning bez update procesa može zauvek zamrznuti ranjivu verziju.

Potrebni su i reproducibility i controlled updates.

---

# 252. NE PREPORUČUJ IGNORE INSTALL SCRIPTS SVUDA

Mnogi legitimni packages zahtevaju build steps.

---

# 253. NE TRETIRAJ DEV DEPENDENCY KAO NEBITNU

Ako se izvršava u CI-u sa production credentials:

može biti kritična.

---

# 254. NE TRETIRAJ LOCKFILE KAO APSOLUTNU SECURITY GARANCIJU

Lockfile može sam biti malicious/tampered.

---

# 255. NE TRETIRAJ PRIVATE REGISTRY KAO APSOLUTNO TRUSTED

Account/server compromise i dalje postoji.

---

# 256. NE TRETIRAJ HASH KAO ZAŠTITU OD MALICIOUS UPSTREAM-A AKO ATTACKER MOŽE DA MENJA I LOCKFILE

Threat model mora uključiti ko kontroliše manifest/lock.

---

# 257. NE MENJAJ DEPENDENCIES TOKOM AUDITA

Ne:

- upgrade

- uninstall

- regenerate lockfile

- change registries

- rotate tokens

- pin actions

bez eksplicitnog odobrenja.

Prvo završi audit.

---

# 258. OUTPUT - DEPENDENCY_SUPPLY_CHAIN_SECURITY_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- ecosystems

- package managers

- dependency count

- critical dependency classes

- top supply-chain risks

## 2. Dependency Architecture

## 3. Manifest / Lockfile Audit

## 4. Direct Dependency Audit

## 5. Transitive Dependency Audit

## 6. Reachable Vulnerability Audit

## 7. Registry / Source Trust Audit

## 8. Dependency Confusion Audit

## 9. Typosquatting / Namespace Audit

## 10. Package Install Script Audit

## 11. Remote Binary / Postinstall Download Audit

## 12. Build Toolchain Audit

## 13. Docker / OS Package Supply Chain

## 14. GitHub Actions / CI Dependency Audit

## 15. CI Secrets vs Dependency Execution Audit

## 16. Self-Hosted Runner Audit

## 17. Artifact Integrity Audit

## 18. Release / Package Publishing Audit

## 19. Auto-Update / Desktop Updater Audit

Ako relevantno.

## 20. Third-Party Browser Script Audit

Ako relevantno.

## 21. SBOM / Provenance Audit

## 22. EOL / Support Audit

## 23. Vulnerability Scanning Coverage

## 24. Dependency Update Process

## 25. Findings Summary

| ID | Severity | Component | Version | Category | Exploitable | Confidence |

|---|---|---|---|---|---|---|

## 26. P0 Findings

## 27. P1 Findings

## 28. P2 Findings

## 29. P3 Findings

## 30. P4 Hardening

## 31. Things Done Well

## 32. Not Applicable

## 33. Not Verified

## 34. Supply Chain Remediation Roadmap

---

# 259. DEPENDENCY MATRIX

| Package | Version | Direct | Stage | Exposure | Known issue | Reachable |

|---|---|---|---|---|---|---|

---

# 260. REGISTRY MATRIX

| Ecosystem | Registry | Private scopes | Auth | Public fallback | Risk |

|---|---|---|---|---|---|

---

# 261. CI EXECUTION MATRIX

| Step/dependency | Executes code | Secrets available | Write token | Trusted/pinned |

|---|---|---|---|---|

---

# 262. ARTIFACT MATRIX

| Artifact | Source commit known | Hash | Signature | SBOM | Deploy target |

|---|---|---|---|---|---|

---

# 263. SECOND PASS - LOCKFILE FORENSICS

Pregledaj exact resolved dependencies za:

- unexpected host

- unexpected package

- version drift

- Git URL

- tarball URL

- integrity mismatch

---

# 264. SECOND PASS - TRANSITIVE HOTSPOTS

Prioritetno proveri transitive packages ispod:

- auth

- HTTP server

- parsers

- file processing

- template engines

- crypto

- database drivers

---

# 265. SECOND PASS - CVE REACHABILITY

Za svaki high/critical advisory napravi:

```text

vulnerable package

↓

vulnerable API/function

↓

our call site

↓

attacker input

↓

impact

```

Ako lanac puca:

ne nazivaj confirmed exploit.

---

# 266. SECOND PASS - DEPENDENCY CONFUSION

Za svaki private/internal package:

proveri:

- public namespace collision

- registry priority

- version precedence

- package manager config

---

# 267. SECOND PASS - INSTALL SCRIPTS

Inventariši svaki dependency sa lifecycle script-om.

Prioritet:

```text

script

+

network

+

CI secrets

```

---

# 268. SECOND PASS - REMOTE DOWNLOADS

Pretraži:

```text

curl

wget

Invoke-WebRequest

fetch binary

download release

```

u:

- Dockerfile

- CI

- setup scripts

- package lifecycle scripts

---

# 269. SECOND PASS - CHECKSUM

Za svaki remote binary pitaj:

> Kako potvrđujemo da je baš očekivani artifact?

---

# 270. SECOND PASS - CI ACTION PINNING

Pregledaj sve external actions i reusable workflows.

Zabeleži:

- owner

- ref

- SHA/tag

- permissions

- secrets

---

# 271. SECOND PASS - UNTRUSTED PR

Scenario:

```text

attacker changes package/lock/build script

↓

privileged CI executes changed code

↓

production secrets are available

```

Proveri da li je realno.

---

# 272. SECOND PASS - DOCKER BASE

Proveri:

- tag/digest

- source

- EOL runtime

- installed OS packages

---

# 273. SECOND PASS - BUILD PLUGIN

Inventariši:

- Babel

- Webpack

- Vite

- Gradle

- Maven

- compiler plugins

- generators

koji izvršavaju code tokom build-a.

---

# 274. SECOND PASS - CLIENT SUPPLY CHAIN

Pronađi remote JS:

- analytics

- tag manager

- chat

- ads/widgets

Pitaj šta compromised vendor script može da vidi/uradi u aplikaciji.

---

# 275. SECOND PASS - PACKAGE PUBLISH

Za project-owned packages proveri ko može:

- publish

- yank

- modify release workflow

---

# 276. SECOND PASS - SIGNING

Ako se artifacts potpisuju:

proveri ko/šta ima access do signing key-a.

---

# 277. SECOND PASS - UPDATE CHANNEL

Za desktop updater:

testiraj/verifikuj:

- signature validation

- version binding

- downgrade

- failure behavior

bez instaliranja neovlašćenih artifacts.

---

# 278. SECOND PASS - SBOM

Uporedi SBOM sa actual built artifact dependency tree-em.

---

# 279. SECOND PASS - UNUSED DEPENDENCIES

Pronađi packages koji se možda više ne koriste.

Pre uklanjanja proveri:

- scripts

- build plugins

- config usage

---

# 280. SECOND PASS - ENVIRONMENT DIFFERENCE

Uporedi:

```text

local

CI

production build

```

package-manager i dependency resolution.

---

# 281. SECOND PASS - SUPPRESSION

Pregledaj sve ignored vulnerability alerts.

Za svaki:

- razlog

- version

- reachability

- datum

- owner

---

# 282. SECOND PASS - PATCH VERIFICATION

Ako repository već tvrdi da je ranjivost patched:

proveri resolved/deployed version, ne samo manifest edit.

---

# 283. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svi package ecosystems su inventarisani

- resolved versions dolaze iz stvarnog lock/build state-a

- runtime/build/dev dependencies su razdvojene

- transitive dependencies nisu ignorisane

- CVE score nije automatski pretvoren u project severity

- high-severity CVE ima reachability analizu

- platform/config preconditions su provereni

- dependency confusion je analiziran za private packages

- registry priority/fallback je potvrđen

- package install scripts su mapirani

- build-time code je tretiran kao realan supply-chain execution

- untrusted PR + secrets scenario je posebno analiziran

- CI actions/workflows su tretirani kao dependencies

- external actions imaju ref + permissions + secrets analizu

- remote downloaded binaries imaju integrity/provenance analizu

- Docker base images i OS packages su uključeni

- frontend third-party scripts su uključeni gde postoje

- desktop updater je uključen gde postoji

- artifact -> source commit traceability je proverena

- signing key access je analiziran gde postoji signing

- SBOM nije tretiran kao security kontrola sam po sebi

- unsupported/EOL software nije označen exploitable bez dodatnog evidence-a

- update/pinning preporuke ne zamrzavaju projekat zauvek na ranjivoj verziji

- svaki P0/P1 ima realan execution/reachability path

- P4 reproducibility/provenance improvements su odvojeni od active vulnerabilities

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Pokrenite npm audit, uključite Dependabot i ažurirajte sve pakete.

To nije bezbednosni audit zavisnosti i lanca snabdevanja softvera.

Tražim probleme poput:

```text

internal package:

company-utils

↓

CI uses:

pip --extra-index-url private.registry

↓

same package name is available from public index

↓

public package has higher version

↓

package manager selects public package

↓

attacker-controlled setup/build code runs in CI

↓

CI has production deploy credentials

```

ili:

```text

frontend dependency has known RCE-style build compromise

↓

package executes postinstall

↓

CI install step has cloud credentials in environment

↓

malicious package code can exfiltrate credentials

↓

runtime reachability is irrelevant because compromise occurs during build

```

ili:

```text

workflow:

uses: third-party/action@main

↓

action repository owner can change main at any time

↓

workflow job has production signing key

↓

changed external action code executes automatically

↓

release signing key compromise path

```

ili:

```text

Dockerfile downloads:

https://vendor.example/tool-latest.tar.gz

↓

no fixed version

↓

no checksum/signature verification

↓

upstream response changes

↓

new binary becomes part of production image without repository diff

```

ili:

```text

dependency advisory:

critical parser vulnerability

↓

resolved version is affected

↓

application passes unauthenticated uploaded files into vulnerable parser function

↓

vulnerable configuration enabled

↓

production worker executes parser

↓

confirmed reachable dependency vulnerability

```

ili:

```text

package.json looks normal

↓

lockfile resolves package tarball from unknown external host

↓

CI performs frozen install

↓

unexpected artifact is trusted because lockfile itself was maliciously changed

↓

lockfile pinning preserves compromise rather than preventing it

```

ili:

```text

desktop application updater downloads update over HTTPS

↓

installer package has no signature verification

↓

update endpoint/CDN compromise can replace binary

↓

client executes attacker-controlled update with user privileges

```

ili:

```text

pull_request_target workflow

↓

production package publish token available

↓

workflow checks out contributor-controlled PR commit

↓

runs npm install/build

↓

attacker modifies package lifecycle script

↓

publish credential can be exfiltrated

```

To su supply-chain problemi koje treba da pronađeš.

Razmišljaj kroz:

- ko bira dependency

- odakle se resolve-uje

- koja exact verzija

- ko može menjati artifact

- šta se izvršava tokom install/build-a

- koji secrets postoje u tom trenutku

- da li artifact ima provenance

- da li ranjivost stvarno doseže attacker-controlled input

- da li update/remediation zaista završava u deployed artifact-u

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji package, action, tool ili artifact predstavlja problem?

> Koja exact verzija/ref se koristi?

> Da li je direct ili transitive?

> Kada se njegov code izvršava?

> Koje privilegije i secrets tada ima?

> Da li je known vulnerability zaista reachable?

> Može li attacker uticati na package resolution ili artifact?

> Kako potvrđujemo da je build/release sastavljen od očekivanog source-a?

Ako deployed version nije potvrđena:

**DEPLOYED VERSION NOT VERIFIED.**

Ako known advisory nije reachable:

**KNOWN VULNERABILITY, NOT CONFIRMED EXPLOITABLE.**

Ako postoji samo reproducibility/provenance poboljšanje bez realnog attack path-a:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih supply-chain execution ili vulnerable-dependency path-ova nego prijaviti stotine package update-a bez exploitability analize.

Cilj je dobiti forenzički precizan Dependency & Supply Chain Security Audit koji se može direktno pretvoriti u:

- dependency remediation

- registry isolation

- dependency-confusion prevention

- CI permission reduction

- action pinning

- artifact verification

- updater hardening

- SBOM/provenance improvements

- production supply-chain protection
