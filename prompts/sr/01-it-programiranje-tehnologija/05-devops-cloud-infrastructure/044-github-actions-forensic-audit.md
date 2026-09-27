---
id: UPL-IT-044
number: 44
slug: github-actions-forensic-audit
title: Forenzički audit GitHub Actions tokova
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# FORENZIČKI AUDIT GITHUB ACTIONS TOKOVA

Želim kompletan forensic audit svih GitHub Actions workflow-a sa fokusom na supply-chain, secrets, permissions, untrusted pull requests, deployment authority i expression/script injection.

Glavni cilj:

> Utvrditi da li contributor, compromised dependency/action, malicious PR, tag, branch ili workflow input može da dovede do krađe secrets, repository write-a, package publishing-a, release tampering-a ili production deployment-a.

## 1. INVENTARIŠI

Sve:

```text
.github/workflows/*.yml
.github/actions/*
```

plus reusable workflows.

Za svaki workflow:

```text
Name:
Triggers:
Permissions:
Secrets:
Environment:
Runner:
External actions:
Deployment:
Artifacts:
```

## 2. TRIGGERS

Pregledaj:

- push

- pull_request

- pull_request_target

- workflow_dispatch

- workflow_run

- schedule

- release

- issue_comment

- repository_dispatch

## 3. `pull_request`

Kod iz fork-a je untrusted.

GitHub secret semantics proveri prema actual event-u.

## 4. `pull_request_target`

High-value.

Workflow radi u context-u base repository-ja i može imati veće privilegije.

## 5. DANGEROUS COMBINATION

```text
pull_request_target
+
checkout PR head
+
execute code
+
secrets/write token
```

P0/P1 candidate.

## 6. CHECKOUT REF

Tačno utvrdi šta se checkout-uje:

- base SHA

- merge commit

- head SHA

- arbitrary input

## 7. `workflow_run`

Privileged follow-up workflow može obrađivati artifact iz untrusted workflow-a.

## 8. ARTIFACT TRUST

Artifact nije trusted samo zato što dolazi iz drugog workflow-a.

## 9. ARTIFACT POISONING

Untrusted build artifact -> privileged workflow executes file/script.

## 10. `workflow_dispatch`

Pregledaj inputs.

## 11. USER-CONTROLLED EXPRESSION U SHELL-U

High-signal:

```yaml

run: echo "${{ github.event.issue.title }}"

```

Ako content može sadržati shell syntax i interpolacija ulazi direktno u generated script.

## 12. SAFE ENV INDIRECTION

Preferiraj prosleđivanje untrusted expression u env pa shell quoting prema jeziku.

## 13. PR TITLE/BODY/BRANCH

Attacker-controlled.

## 14. ISSUE COMMENT

Attacker-controlled prema repo permissions.

## 15. COMMIT MESSAGE

Potential attacker input.

## 16. MATRIX

Matrix values iz dynamic JSON mogu uticati na commands/runners.

## 17. PERMISSIONS

Pregledaj top-level i job-level:

```yaml

permissions:

```

## 18. DEFAULT TOKEN

Ne pretpostavljaj permission.

Utvrdi actual declared/default context.

## 19. `contents: write`

Zašto je potrebno?

## 20. `actions: write`

Može menjati/trigger workflow state.

## 21. `packages: write`

Supply-chain impact.

## 22. `id-token: write`

OIDC cloud authentication.

Vrlo high-value permission.

## 23. `pull-requests: write`

Lower impact ali useful za attacker persistence/social paths.

## 24. MINIMAL PER JOB

Deploy permission ne treba build/test job-u.

## 25. SECRETS

Inventariši samo names, nikad values.

## 26. SECRET SCOPE

Koji job/step dobija:

- deploy token

- registry token

- signing key

- cloud credential

## 27. ENVIRONMENT SECRETS

Production environment protection.

## 28. APPROVAL

Ako workflow deployuje prod:

proveri environment reviewers/rules ako available.

## 29. OIDC

Ako cloud provider podržava OIDC:

analiziraj subject/audience/repository/branch trust.

## 30. STATIC CLOUD SECRET

Nije automatski bug, ali long-lived blast radius je veći.

## 31. OIDC TRUST POLICY

Critical:

> Koji repo, workflow, branch/tag/environment može dobiti cloud role?

## 32. WILDCARD SUBJECT

Može omogućiti untrusted branch/PR da dobije production role.

## 33. THIRD-PARTY ACTION

Svaki:

```text

uses: owner/action@ref

```

je executable dependency.

## 34. SHA PINNING

Strong immutability.

## 35. MAJOR TAG

`@v4` može biti mutable.

P4/P2 prema secrets/permissions.

## 36. `@main`

High-risk za privileged workflows.

## 37. DOCKER ACTION

Može izvršiti arbitrary code.

## 38. JS ACTION

Isto.

## 39. COMPOSITE ACTION

Može pozivati shell i druge actions.

## 40. REUSABLE WORKFLOW

External repo/ref trust.

## 41. ACTION OWNER

Compromise upstream owner može pivotovati u vaš CI.

## 42. `curl | bash`

High-value.

## 43. REMOTE BINARY DOWNLOAD

Version + checksum/signature.

## 44. SETUP ACTIONS

Toolchain version.

## 45. DEPENDENCY INSTALL

Package lifecycle code se izvršava u CI-u.

## 46. SECRETS PRE INSTALL

Ako secrets već postoje u env-u pre untrusted dependency install-a:

risk raste.

## 47. `npm install` PR

Malicious contributor može promeniti lifecycle script.

## 48. BUILD SCRIPT

Repo code je executable.

## 49. SELF-HOSTED RUNNER

Critical trust boundary.

## 50. PUBLIC REPO + SELF-HOSTED

Untrusted PR execution može biti veoma rizičan.

## 51. RUNNER PERSISTENCE

Self-hosted runner može zadržati:

- files

- credentials

- Docker state

- processes

iz prethodnog job-a.

## 52. EPHEMERAL RUNNER

Smanjuje persistence.

## 53. RUNNER LABEL

Može li untrusted workflow targetirati privileged runner?

## 54. NETWORK ACCESS

Runner možda može pristupiti internal infrastructure.

## 55. DOCKER SOCKET

CI runner sa Docker socket-om ima visok host privilege.

## 56. GITHUB-HOSTED

Ephemeral model smanjuje persistence, ali secrets i token privileges i dalje ključni.

## 57. CACHE

Cache iz untrusted branch-a može kasnije uticati na privileged job.

## 58. CACHE POISONING

Pregledaj cache key i restore key breadth.

## 59. DEPENDENCY CACHE

Ne izvršava se sam po sebi, ali može vratiti attacker-modified files ako workflow veruje cache-u.

## 60. BUILD ARTIFACT

Integrity/trust između jobs/workflows.

## 61. ARTIFACT NAME COLLISION

Privileged workflow može skinuti pogrešan artifact.

## 62. RELEASE

Ko može trigger-ovati?

## 63. TAG-BASED RELEASE

Može li attacker kreirati/tagovati release ref?

## 64. TAG PROTECTION

Ako repo model to koristi.

## 65. PACKAGE PUBLISH

NPM/PyPI/container registry.

## 66. VERSION SOURCE

Attacker-controlled package version/name?

## 67. RELEASE ASSET

Može li privileged job uploadovati attacker-provided binary?

## 68. SIGNING

Koji workflow dobija signing key?

## 69. SIGN UNTRUSTED ARTIFACT

Critical scenario:

```text
untrusted build
↓
artifact
↓
privileged signer
```

## 70. DEPLOY

Koji exact job može production deploy?

## 71. DEPLOY REF

Da li deployuje:

- main

- tag

- arbitrary SHA/input

## 72. MANUAL INPUT SHA

workflow_dispatch input može omogućiti operatoru da deployuje arbitrary commit. Možda namerno, ali audituj.

## 73. ENVIRONMENT URL

Ne security control.

## 74. CONCURRENCY

Production deploy workflow treba sprečiti neželjene concurrent deployments gde race može biti problem.

## 75. CANCEL-IN-PROGRESS

Može preseći migration/deploy sredinom.

## 76. MIGRATIONS

Da li workflow pokreće DB migration?

## 77. RETRY

GitHub Actions rerun može ponoviti non-idempotent deploy/migration step.

## 78. MANUAL RERUN

Ne pretpostavljaj safe.

## 79. OUTPUTS

Secret može procureti kroz:

- job outputs

- logs

- artifacts

## 80. MASKING

Transformed secret možda nije masked.

## 81. `set -x`

Shell debug leak.

## 82. `printenv`

Secret dump.

## 83. ERROR COMMAND

Command line može prikazati secret.

## 84. STEP SUMMARY

Ne stavljaj credentials.

## 85. PR COMMENT

Workflow može slučajno objaviti secret u comment.

## 86. SARIF/REPORT

Generated scanner output može sadržati sensitive paths/data.

## 87. PATH FILTER

Workflow security ne treba zavisiti na način koji attacker može zaobići kroz renamed file.

## 88. BRANCH FILTER

Tačno proveri patterns.

## 89. TAG FILTER

Glob semantics.

## 90. CONDITION

Complex `if:` expressions mogu imati logic bug.

## 91. FORK DETECTION

Ne oslanjaj se na pogrešan field.

## 92. ACTOR VS TRIGGERING_ACTOR

Re-run semantics mogu promeniti trust.

## 93. BOT

Dependabot token/secret restrictions.

## 94. SCHEDULE

Runs with current default branch workflow, ne nužno old committed version.

## 95. REPOSITORY_DISPATCH

Ko ima token da ga trigger-uje?

## 96. ISSUE_COMMENT DEPLOY

Komentar poput `/deploy` mora imati actor permission check.

## 97. ASSOCIATION

`author_association` može pomoći ali treba razumeti semantics.

## 98. APPROVAL BOT

Ne tretiraj bot kao bezbedan ako untrusted user može kontrolisati njegov input.

## 99. COMMIT PINNING

Za high-privilege third-party actions preporučuj SHA pin ako praktično.

## 100. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Workflow:
Trigger:
Job:
Step:
Runner:
Permissions:
Secrets:
Untrusted input:
Execution path:
Impact:
Blast radius:
Evidence:
Fix:
Regression check:
Complexity:
```

## 101. EVIDENCE

```text
A - reproduced in safe repo/test
B - complete workflow execution path
C - strong YAML/config evidence
D - inferred
E - hardening
```

## 102. STATUS AND FALSE POSITIVES

Status:

- **CONFIRMED** - dokaz tier A ili B pokazuje putanju otkaza ili exploit-a.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od runtime stanja, podešavanja ili verzija koji nisu mogli da se provere (tier D). Tier D nikada ne predstavljaj kao potvrđen.
- **NOT APPLICABLE** - komponenta ili obrazac se ne koriste.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

False-positive pravila:

- `pull_request_target` ili `workflow_run` nisu ranjivost sami po sebi; postaju ranjivost kada privilegovan posao preuzima, izvršava ili interpolira nepoverljiv sadržaj.
- Akcija zaključana na tag umesto na commit SHA je HARDENING osim ako je akcija visokoprivilegovana ili njen izdavač nije pouzdan.
- Secrets referencirani u workflow-u nisu izloženi ako ih ne dobija nijedan posao dostupan iz nepoverljivih trigger-a.
- `${{ }}` izrazi nad pouzdanim vrednostima (konstante repozitorijuma, `github.sha`, workflow ulazi ograničeni na maintainer-e) nisu tačke za injection.
- Workflow-i u fork-ovima rade sa dozvolama ograničenim na fork; ne prijavljuj ih kao da utiču na osnovni repozitorijum osim ako trigger prelazi tu granicu.
- Branch protection, pravila okruženja i podešavanja organizacije su van repozitorijuma; zavisne nalaze označi kao **NOT VERIFIED** kada ne mogu da se provere.

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza, exploit-a, greške u ispravnosti, pouzdanosti ili rada.

## 103. SEVERITY

P0:
- untrusted PR code -> production signing/deploy/admin credential -> arbitrary production control

P1:
- expression injection u privileged workflow
- artifact poisoning -> privileged execution
- self-hosted runner untrusted code -> internal/secret compromise
- overbroad OIDC trust daje prod cloud role

P2:
- prevelik opseg `GITHUB_TOKEN`-a ili secret-a dostupan samo pouzdanim trigger-ima
- trovanje cache-a ili rizik third-party akcije bez potvrđenog privilegovanog potrošača
- putanje deployment-a koje zaobilaze predviđena odobrenja za neproduction okruženja

P3:
- ograničene slabosti uskog uticaja (bučni logovi, manji višak dozvola)

P4:
- hardening bez trenutne putanje exploit-a

## 104. OUTPUT

`GITHUB_ACTIONS_FORENSIC_AUDIT.md`

## 105. MATRICE

### Workflow Matrix

| Workflow | Trigger | Token permissions | Secrets | Deploy |
|---|---|---|---|---|

### External Action Matrix

| Action | Ref | Third-party | Secrets | Write perms |
|---|---|---|---|---|

### Trust Matrix

| Trigger | Untrusted code | Secrets | Write token | Runner |
|---|---|---|---|---|

## 106. SECOND PASS

Obavezno testiraj/anliziraj:

- malicious PR modifies package script

- PR title shell characters

- pull_request_target checkout

- workflow_run poisoned artifact

- third-party action compromise assumption

- self-hosted runner persistence

- rerun privileged workflow

- arbitrary dispatch input

- OIDC branch/subject manipulation

- production deploy concurrency

## 107. FINAL QUALITY GATE

Proveri:

- sve workflows

- all triggers

- effective permissions

- secrets per job

- untrusted inputs

- third-party refs

- reusable workflows

- artifacts/caches

- self-hosted runners

- OIDC

- release signing

- package publish

- production deploy

- rerun/idempotency

# KONAČNO PRAVILO

Ne želim:

> Pinujte actions i smanjite permissions.

Tražim:

```text
trigger:
pull_request_target
↓
job has:
contents: write
production token
↓
checkout:
ref = pull_request.head.sha
↓
npm install
↓
PR author modifies postinstall
↓
attacker code executes with production secret
```

ili:

```text
untrusted PR workflow
↓
uploads build artifact
↓
workflow_run triggers privileged release job
↓
release job downloads artifact
↓
executes included script
↓
production signing key exposed
```

Ako workflow nije production-relevant:

severity prilagodi.

Ako postoji samo best-practice improvement:

**P4 - HARDENING.**
