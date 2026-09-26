---
id: UPL-IT-045
number: 45
slug: cicd-pipeline-audit
title: CI/CD Pipeline Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.0
status: stable
---

# CI/CD PIPELINE AUDIT

Želim kompletan production-grade audit čitavog CI/CD pipeline-a, nezavisno od platforme.

Glavni cilj:

> Utvrditi da li source, tests, builds, artifacts, approvals, migrations, secrets, deployments i rollback proces formiraju pouzdan i bezbedan lanac od commita do production-a.

## 1. MAPIRAJ PIPELINE

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

## 2. INVENTARIŠI

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

## 3. SOURCE AUTHORITY

Koji ref može ući u production?

## 4. BRANCH PROTECTION

Ako release zavisi od main/master:

proveri:

- required reviews

- required checks

- direct push

- force push

Ne tretiraj process rule kao technical vulnerability bez attack path-a.

## 5. PR VALIDATION

Tests moraju pokrivati stvarni merge/deploy artifact.

## 6. TEST ON PR, DEPLOY DIFFERENT SHA

High-signal race/drift.

## 7. TOCTOU IZMEĐU REVIEW I DEPLOY

Ako isti branch može biti promenjen nakon approval-a ali pre deploy-a.

## 8. IMMUTABLE COMMIT

Production artifact treba biti vezan za exact SHA.

## 9. BUILD ONCE, PROMOTE

Ako staging i prod rebuild-uju source odvojeno:

mogu proizvesti različite artifacts.

## 10. REBUILD PRODUCTION

Može povući newer transitive dependencies/toolchain.

## 11. ARTIFACT IMMUTABILITY

Ko može replace-ovati build?

## 12. ARTIFACT RETENTION

Da li prethodni release postoji za rollback?

## 13. BUILD PROVENANCE

Artifact -> source commit -> workflow run.

## 14. TEST GATE

Koji checks blokiraju deployment?

## 15. FAILING TEST

Može li production deploy ipak proći?

## 16. SKIP TEST

Manual path?

## 17. ALLOW FAILURE

Critical security/test job sa `continue-on-error`.

## 18. FLAKY TEST

Ako se samo rerun-uje dok ne prođe:

gate gubi vrednost.

## 19. TEST ENV PARITY

Ne mora biti identičan production-u, ali critical differences moraju biti poznate.

## 20. BUILD CONFIG

Dev flags ne smeju završiti u production artifact-u.

## 21. SECRET INJECTION

Kada secrets postaju dostupni?

## 22. UNTRUSTED CODE + SECRET

Najvažniji supply-chain scenario.

## 23. DEPLOY CREDENTIAL

Scope samo do potrebnog environment-a.

## 24. STATIC LONG-LIVED KEY

Blast radius vs short-lived/OIDC.

## 25. ENVIRONMENT ISOLATION

Staging deploy credential ne treba production access.

## 26. PRODUCTION APPROVAL

Ako required prema operational modelu.

Ne zahtevaj human approval za svaki low-risk continuous delivery system.

## 27. CHANGE RISK

Migrations/infra/secrets mogu imati drugačiji approval model.

## 28. MIGRATION STEP

Ko je pokreće?

## 29. MIGRATION PRE/POST APP

Order.

## 30. MIGRATION RETRY

Može li se bezbedno rerun-ovati?

## 31. PARTIAL MIGRATION

Failure sredinom.

## 32. SCHEMA BACKWARD COMPATIBILITY

Mixed versions.

## 33. ROLLBACK

Ne znači samo redeploy old artifact.

## 34. ROLLBACK DATABASE

Može biti nemoguć.

## 35. FEATURE FLAG

Može biti bolji rollback mehanizam za feature behavior.

## 36. SMOKE TEST

Nakon deploy-a proveri critical paths.

## 37. SMOKE TEST AUTHORITY

Health 200 nije dokaz da login/DB/write radi.

## 38. AUTO ROLLBACK

Ako postoji:

koji metric i threshold?

## 39. FALSE ROLLBACK

Transient metric spike može loop-ovati deployment.

## 40. CANARY

Ako postoji, analiziraj traffic split i evaluation.

## 41. BLUE/GREEN

Database compatibility.

## 42. CONCURRENT DEPLOY

Dve osobe/pipelines deployuju različite SHA.

## 43. DEPLOY LOCK

Serialization gde potrebno.

## 44. CANCEL DEPLOY

Cancel na pola može ostaviti mixed state.

## 45. PIPELINE RETRY

Non-idempotent steps.

## 46. PACKAGE PUBLISH

Version collision.

## 47. CONTAINER PUBLISH

Mutable tags.

## 48. SIGNING

Only trusted final artifact.

## 49. INFRA DEPLOY

Terraform/app deploy ordering.

## 50. CONFIG DEPLOY

Config može biti breaking čak i kada code nije promenjen.

## 51. SECRET ROTATION

Old/new application compatibility.

## 52. DATABASE BACKUP PRE RISKY MIGRATION

Ako architecture/process to zahteva.

Ne koristi backup kao izgovor za unsafe migration.

## 53. PREVIEW DEPLOY

Koji secrets/data dobija?

## 54. PR DEPLOY

Untrusted code + public URL + provider tokens.

## 55. PIPELINE DEPENDENCIES

Actions/plugins/images/build tools.

## 56. REMOTE SCRIPTS

Pin + verify.

## 57. RUNNER TRUST

Hosted vs self-hosted.

## 58. CACHE

Can poisoned cache influence final artifact?

## 59. WORKSPACE CONTAMINATION

Self-hosted runners.

## 60. CLEAN CHECKOUT

Release build mora biti iz očekivanog source-a.

## 61. GENERATED FILES

Uncommitted generated output differences.

## 62. MONOREPO

Path-based pipelines mogu propustiti shared dependency change.

## 63. SELECTIVE TESTING

Changed-files optimization mora razumeti dependency graph.

## 64. BUILD MATRIX

Jedna kombinacija možda nije testirana a deployovana je.

## 65. PLATFORM ARCH

amd64/arm64.

## 66. RUNTIME VERSION

CI test runtime vs production runtime.

## 67. DB VERSION

Integration tests.

## 68. ENVIRONMENT VARIABLE

Missing production env može biti otkriven tek posle deployment-a.

## 69. CONFIG VALIDATION

Pre deploy-a.

## 70. SECRET VALIDATION

Ne printati value.

## 71. DNS/TLS DEPLOY

Infrastructure changes mogu zahtevati propagation.

## 72. CDN INVALIDATION

Old frontend + new backend compatibility.

## 73. STATIC ASSET HASHING

Old HTML/new assets.

## 74. SERVICE WORKER

PWA update može držati star client posle backend deploy-a.

## 75. MOBILE CLIENT

Backend mora ostati compatible sa starim mobile app verzijama prema support window-u.

## 76. DESKTOP CLIENT

Isto.

## 77. FEATURE ROLLOUT

Gradual activation.

## 78. DEPLOY OBSERVABILITY

Poveži release SHA sa logs/metrics/traces.

## 79. RELEASE MARKER

Monitoring treba znati kada je deployment počeo.

## 80. ERROR SPIKE

Pre/posle deploy.

## 81. PIPELINE ALERT

Failed deploy mora imati owner/signal.

## 82. MANUAL HOTFIX

Kako prolazi kroz controls?

## 83. BREAK-GLASS DEPLOY

Ako postoji:

- authorization

- audit

- post-review

## 84. DIRECT PLATFORM DEPLOY

Može li neko zaobići CI i deployovati lokalno?

## 85. CONFIG CLICKOPS

Može menjati runtime bez Git evidence-a.

## 86. ACCESS REVIEW

Ko može deploy production?

## 87. SHARED CREDENTIAL

Attribution.

## 88. AUDIT LOG

Deploy actor, SHA, time.

## 89. SUPPLY CHAIN

Cross-reference Prompt 38.

## 90. FAILURE SCENARIOS

Testiraj:

- test passes, build fails

- build passes, deploy fails

- deploy 50%

- migration fails

- smoke fails

- rollback fails

- provider unavailable

- secrets missing

- registry unavailable

## 91. FINDING FORMAT

```text

ID:

Severity:

Stage:

Environment:

Trigger:

Artifact/SHA:

Current control:

Failure path:

Impact:

Evidence:

Root cause:

Fix:

Verification:

Rollback considerations:

```

## 92. OUTPUT

`CICD_PIPELINE_AUDIT.md`

## 93. MATRICE

### Stage Matrix

| Stage | Input | Output | Secrets | Failure behavior |

|---|---|---|---|---|

### Environment Promotion

| Artifact | Dev | Staging | Production | Rebuilt |

|---|---|---|---|---|

### Deployment Authority

| Principal | Staging | Prod | Secrets | Rollback |

|---|---|---|---|---|

## 94. FINAL QUALITY GATE

- exact production SHA

- same tested artifact

- secret boundary

- untrusted code

- migration order

- retry/idempotency

- concurrency

- rollback

- environment isolation

- deployment observability

- direct bypass paths

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
