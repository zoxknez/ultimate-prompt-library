---
id: UPL-IT-042
number: 42
slug: docker-production-audit
title: Produkcioni audit Docker okruženja
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# PRODUKCIONI AUDIT DOCKER OKRUŽENJA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog Docker/container sloja projekta.

Glavni cilj:

> Utvrditi da li Dockerfile, build context, image layers, runtime user, filesystem, networking, secrets, health checks, resource limits, dependency installation i container lifecycle mogu da izazovu security compromise, secret exposure, unreproducible build, startup failure, data loss, oversized attack surface ili production outage.

Ovo nije:

- generički "koristi Alpine"

- automatski zahtev za multi-stage build

- automatski zahtev za non-root bez analize compatibility-ja

- samo image-size audit

- samo vulnerability scan

- samo Dockerfile lint

- pretpostavka da container sam po sebi predstavlja sandbox

Prioritet:

**embedded secrets > privileged/root compromise impact > executable supply-chain risk > ephemeral data loss > broken health/startup > resource exhaustion > unreproducible build > oversized image > hardening**

## 1. INVENTARIŠI SVE CONTAINER ARTEFAKTE

Pronađi:

- Dockerfile

- Dockerfile.*

- docker-compose.yml

- compose.yaml

- `.dockerignore`

- entrypoint scripts

- build scripts

- container CI config

- image publishing workflows

Za svaki image zabeleži:

```text
Image:
Purpose:
Base image:
Stages:
Runtime user:
Ports:
Volumes:
Entrypoint:
CMD:
Healthcheck:
Secrets used:
Persistent data:
```

## 2. BASE IMAGE

Proveri:

- registry

- namespace

- tag

- digest

- runtime version

- OS version

- EOL status

`latest` nije automatski vulnerability, ali smanjuje reproducibility.

## 3. MUTABLE TAG

Ako production deploy koristi:

```text

image: app:latest

```

pitaj:

- šta je stvarno deploy-ovano

- može li rollback vratiti tačan artifact

- može li tag biti pomeren bez infrastructure diff-a

## 4. DIGEST PINNING

Koristan za immutable release.

Ne zahtevaj za svaki development flow.

## 5. MULTI-STAGE BUILD

Proveri da build dependencies, compilers, package-manager tokens i source ne završavaju nepotrebno u runtime image-u.

## 6. BUILD CONTEXT

Posebno pregledaj `.dockerignore`.

Traži da li build context uključuje:

- `.git`

- `.env`

- secrets

- backups

- test data

- private keys

- node_modules

- build artifacts

## 7. COPY EVERYTHING

High-signal:

```text

COPY . .

```

nije automatski problem, ali zahteva pregled `.dockerignore`.

## 8. SECRET U BUILD ARGUMENTU

Traži:

```text
ARG TOKEN
ENV TOKEN=$TOKEN
```

Build args nisu secret store.

## 9. SECRET U IMAGE LAYER-U

Ako secret bude:

```text
COPY .env .
RUN use-secret
RUN rm .env
```

brisanje kasnijim layer-om ga ne uklanja iz prethodnog layer-a.

## 10. BUILDKIT SECRET

Ako build mora da koristi credential:

proveri da li koristi ephemeral secret mount ili ekvivalent koji ne završava u image-u.

## 11. PACKAGE REGISTRY TOKEN

Posebno:

- `.npmrc`

- pip config

- Maven settings

- NuGet config

## 12. IMAGE HISTORY

Pregledaj da li komande ili metadata expose-uju secrets.

## 13. RUNTIME USER

Ako container radi kao root:

proceni:

- šta exploit dobija

- mounts

- capabilities

- host integration

Ne proglašavaj automatski P1.

## 14. USER DIRECTIVE

Proveri:

```text

USER app

```

ili equivalent.

## 15. FILE OWNERSHIP

Non-root container koji ne može pisati temp/cache dir može failovati tek u production-u.

## 16. `chmod 777`

High-signal permissions smell.

Proceni actual attack impact.

## 17. LINUX CAPABILITIES

Ako runtime dodaje:

- SYS_ADMIN

- NET_ADMIN

- SYS_PTRACE

analiziraj zašto.

## 18. `--privileged`

P1/P0 candidate ako attacker-controlled application code može doći do container compromise-a.

## 19. HOST MOUNTS

Posebno:

```text
/var/run/docker.sock
/
 /etc
```

Docker socket često znači praktično host-level control.

## 20. READ-WRITE VOLUME

Koji paths su writable?

## 21. READ-ONLY ROOT FS

Može smanjiti persistence/tampering, ali samo ako app podržava.

## 22. TEMP DIR

Aplikacija može zahtevati writable:

```text

/tmp

```

## 23. EPHEMERAL DATA

Pronađi da li application čuva durable data unutar container writable layer-a.

## 24. CONTAINER RECREATE

Ako container nestane:

šta se gubi?

## 25. DATABASE U CONTAINER-U

Ako self-hosted DB preko Compose-a:

proveri volume durability i backup.

## 26. BIND MOUNT

Local host path može praviti environment-specific dependency.

## 27. NAMED VOLUME

Proveri ownership, backup i lifecycle.

## 28. `docker compose down -v`

Ako operational docs koriste ovo:

može obrisati persistent data.

## 29. NETWORKING

Inventariši exposed ports.

## 30. `EXPOSE`

Nije security firewall.

## 31. HOST PORT

Compose:

```text

0.0.0.0:5432:5432

```

može javno expose-ovati DB zavisno od host firewall-a.

## 32. INTERNAL NETWORK

DB/cache ne treba da budu public ako nema potrebe.

## 33. CONTAINER DNS

Service names i startup dependencies.

## 34. STARTUP ORDER

`depends_on` ne znači nužno service readiness.

## 35. RETRY CONNECT

App treba razumno da podnese DB/cache koji postane ready nekoliko sekundi kasnije.

## 36. HEALTHCHECK

Proveri:

- interval

- timeout

- retries

- start-period

- command

## 37. HEALTHCHECK COST

Ne pokreći težak DB/API call svakih nekoliko sekundi bez potrebe.

## 38. HEALTHCHECK TOOL

Ako runtime image nema `curl`, healthcheck može biti permanentno broken.

## 39. SIGNALS

Proveri da process PID 1 prima:

- SIGTERM

- SIGINT

## 40. SHELL WRAPPER

Pattern:

```text

CMD sh -c "node app.js"

```

može promeniti signal propagation ako shell ne `exec`-uje child.

## 41. ENTRYPOINT

Proveri `exec "$@"`.

## 42. GRACEFUL SHUTDOWN

Container stop mora dati app-u vreme za:

- HTTP drain

- queue stop

- DB cleanup

## 43. STOP TIMEOUT

Ako worker treba 60 sekundi, a platforma ubija posle 10:

jobs mogu ostati nedovršeni.

## 44. ZOMBIE PROCESSES

Ako process spawn-uje child procese:

PID 1 reaping behavior može biti relevantan.

## 45. RESOURCE LIMITS

Proveri:

- CPU

- memory

- pids

- disk/temp

## 46. MEMORY LIMIT

Bez limita runaway process može ugroziti host/shared environment.

## 47. PRENIZAK MEMORY LIMIT

OOMKill loop.

## 48. NODE/PYTHON/JVM MEMORY

Runtime heap awareness u container-u.

## 49. CPU THROTTLING

Može objasniti latency bez high host CPU.

## 50. PID LIMIT

Fork bomb/process leak defense.

## 51. LOGGING

Ako app loguje u file unutar container-a:

- rotation

- persistence

- disk growth

## 52. STDOUT/STDERR

Obično bolji za orchestrated logging.

## 53. LOG DRIVER

Može blokirati application ako sync sink padne, zavisno od config-a.

## 54. IMAGE SIZE

Velika image utiče na:

- deployment speed

- cold start

- vulnerability surface

ali nije security severity sama po sebi.

## 55. CACHE ORDER

Dockerfile layer ordering treba da omogući dependency cache bez stale build bugova.

## 56. COPY LOCKFILE PRE SOURCE

Za reproducible/cache-friendly dependency install.

## 57. FROZEN INSTALL

Production build treba koristiti lockfile na deterministički način gde ecosystem podržava.

## 58. DEV DEPENDENCIES

Proveri da li nepotrebno završavaju u runtime image-u.

## 59. COMPILERS U RUNTIME-U

Povećavaju attack surface.

## 60. SHELL/DEBUG TOOLS

Defense-in-depth, ne root fix.

## 61. CA CERTIFICATES

Minimal image može slomiti TLS outbound requests.

## 62. TIMEZONE / LOCALE

Minimal image može slomiti implicitne assumptions.

## 63. NATIVE LIBRARIES

glibc/musl compatibility.

Ne preporučuj Alpine automatski.

## 64. ARCHITECTURE

amd64 vs arm64.

## 65. MULTI-ARCH BUILD

Proveri native dependency compatibility.

## 66. IMAGE SCAN

Razdvoji:

- OS CVE

- language dependency CVE

- unreachable package

## 67. FIXED PACKAGE

Scan output mora odgovarati final built image-u.

## 68. SBOM

Ako postoji, proveri da predstavlja stvarni runtime image.

## 69. LABELS

Dodaj/analiziraj:

- commit SHA

- version

- build date

za provenance ako workflow koristi.

## 70. IMMUTABLE RELEASE ID

Container image treba biti traceable do source commit-a.

## 71. ROOT CA CERT / CUSTOM CERT

Proveri da se internal CA ne dodaje nesigurno.

## 72. SSH SERVER U CONTAINER-U

Obično unnecessary attack surface.

## 73. CRON U ISTOM CONTAINER-U

Više procesa komplikuje supervision i scaling semantics.

## 74. ONE PROCESS RULE NIJE DOGMA

Više procesa mogu biti validni ako supervision model radi.

## 75. COMPOSE PRODUCTION

Ako Docker Compose koristi production:

audituj:

- restart policies

- networks

- volumes

- secrets

- dependency startup

- resource limits

## 76. RESTART POLICY

`always` može sakriti crash loop.

## 77. CRASH LOOP

Monitoring mora pokazati restart frequency.

## 78. SECRET U COMPOSE

Hardcoded:

```yaml
environment:
  DB_PASSWORD: ...
```

ako commitovan real secret.

## 79. `.env` COMPOSE

Proveri source i permissions.

## 80. DOCKER SECRETS

Ako Swarm/compatible system postoji.

Ne zahtevaj ako platforma koristi drugi secret manager.

## 81. CONTAINER ESCAPE

Ne proglašavaj theoretical kernel/container escape bez relevantnog CVE/config path-a.

## 82. SECCOMP

Hardening ako threat model opravdava.

## 83. APPARMOR/SELINUX

Isto.

## 84. NO-NEW-PRIVILEGES

Useful hardening.

## 85. SUID BINARIES

Minimal runtime može ih smanjiti.

## 86. MOUNTED CLOUD CREDENTIAL

Ako host injectuje credential file:

ko ga može read?

## 87. DOCKER SOCKET

Ako app ili monitoring container ima socket:

mapiraj blast radius.

## 88. CONTAINER METADATA

Cloud credentials kroz metadata endpoint su cloud audit tema, ali post-compromise path zabeleži.

## 89. DNS FAILURE

App treba imati timeout/retry semantics.

## 90. DEPENDENCY OUTAGE

Container restart nije fix za downstream outage ako restart storm pogoršava problem.

## 91. IMAGE PULL FAILURE

Deploy strategy treba da zadrži old healthy replicas gde orchestrator to omogućava.

## 92. PRIVATE REGISTRY

Credential i availability.

## 93. IMAGE RETENTION

Rollback artifact ne sme biti garbage-collected prerano.

## 94. LATEST IMAGE OVERRIDE

Rollback na `latest` nije rollback.

## 95. BUILD PLATFORM VS RUNTIME PLATFORM

Native module mismatch.

## 96. PRODUCTION DEBUG

Development server unutar container-a nije production server automatski.

## 97. NODE DEV SERVER / FLASK DEV SERVER

Proveri actual runtime command.

## 98. PORT BINDING

Process mora bindovati očekivani interface/port.

## 99. HEALTH + APP PORT

Mismatch može učiniti healthy app nedostupnom.

## 100. SECURITY FINDING FORMAT

Svaki ozbiljan finding:

```text
ID:
Severity:
Category:
Evidence tier:
Status:
Dockerfile/Image:
Stage:
Runtime user:
Base image:
Artifact:
Problem:
Trigger:
Failure/Exploit path:
Impact:
Blast radius:
Evidence:
Root cause:
Fix:
Regression/verification:
Complexity:
```

## 101. SEVERITY

P0:

- container config daje practical host/global production takeover

- embedded current privileged secret u public/distributed image

- production durable data se sistemski gubi pri normalnom redeploy-u bez recovery-ja

P1:

- Docker socket/privileged container + practical compromise path

- production secret embedded u image layer-u

- critical startup/shutdown/data model vodi do realnog outage/data loss-a

P2:

- meaningful resource, permission, reproducibility ili persistence problem

P3:

- minor operational/config weakness

P4:

- hardening

## 102. EVIDENCE

```text
A - reproduced
B - complete image/runtime path
C - strong Dockerfile/config evidence
D - inferred
E - hardening
```

## 103. STATUS AND FALSE POSITIVES

Status:

- **CONFIRMED** - dokaz tier A ili B pokazuje putanju otkaza ili exploit-a.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od runtime stanja, podešavanja ili verzija koji nisu mogli da se provere (tier D). Tier D nikada ne predstavljaj kao potvrđen.
- **NOT APPLICABLE** - komponenta ili obrazac se ne koriste.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

False-positive pravila:

- Root korisnik u container-u je nalaz samo uz konkretnu putanju (mount-ovi sa pravom upisa, host namespace-i, capabilities, poznata površina za bekstvo) ili kada politika zahteva non-root; inače je HARDENING.
- Veliki image ili base koji nije minimalan je napomena o trošku i površini napada, a ne ranjivost sama po sebi.
- CVE-ovi iz skenera su nalazi samo kada je ranjiv paket prisutan u finalnom runtime image-u, a ranjiva putanja koda ili izloženost su verovatni; paketi samo iz build faze se ne isporučuju.
- `latest` ili nezaključani tag-ovi u Compose fajlovima za lokalni razvoj nisu production defekti.
- `HEALTHCHECK` instrukcija koja nedostaje nije defekt kada orkestrator definiše sopstvene probe.
- Build argumenti su curenje secret-a samo kada se prosleđuje stvarna vrednost secret-a koja ostaje u istoriji, slojevima ili metapodacima.

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza, exploit-a, greške u ispravnosti, pouzdanosti ili rada.

## 104. OUTPUT

`DOCKER_PRODUCTION_AUDIT.md`

Sekcije:

1. Executive Summary

2. Image Inventory

3. Dockerfile Architecture

4. Base Image Audit

5. Build Context Audit

6. Secret Leakage Audit

7. Layer / History Audit

8. Runtime User / Privilege Audit

9. Filesystem / Volume Audit

10. Networking Audit

11. Healthcheck Audit

12. Startup / Shutdown Audit

13. Resource Limit Audit

14. Compose Audit

15. Supply Chain / Image Provenance

16. Vulnerability Scan Analysis

17. Deployment / Rollback Readiness

18. Findings

19. Things Done Well

20. Remediation Roadmap

## 105. SECOND PASS

Obavezno simuliraj ili analiziraj:

- rebuild bez cache-a

- container restart

- container recreate

- SIGTERM

- DB unavailable on startup

- memory pressure

- disk/temp full

- secret search kroz image layers

- non-root execution

- rollback na prethodni immutable image

- private registry outage

## 106. FINAL QUALITY GATE

Proveri:

- final image, ne samo Dockerfile

- build context

- image history

- runtime UID/GID

- writable paths

- durable data

- graceful shutdown

- healthcheck semantics

- resource limits

- registry provenance

- rollback artifact

- embedded secrets

- actual deployment runtime

# KONAČNO PRAVILO

Ne želim:

> Koristi Alpine, non-root i multi-stage build.

Tražim problem poput:

```text
Docker build:
COPY . .
↓
.env.production ulazi u layer
↓
kasniji RUN rm .env.production
↓
final filesystem je čist
↓
secret i dalje postoji u prethodnom image layer-u
↓
svako sa pull pristupom image-u može ga izvući
```

ili:

```text
upload storage:
/app/uploads
↓
nije mountovan persistent volume
↓
docker compose recreate
↓
DB metadata ostaje
↓
fajlovi nestaju
```

Ako Docker nije production deployment:

**PRODUCTION DOCKER USAGE NOT VERIFIED.**

Ako je samo hardening bez realnog failure/exploit path-a:

**P4 - HARDENING.**
