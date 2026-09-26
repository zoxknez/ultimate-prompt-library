---
id: UPL-IT-045
number: 45
slug: cicd-pipeline-audit
title: CI/CD Pipeline Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.0.1
status: stable
---

# CI/CD PIPELINE AUDIT

I want a complete production-grade audit of the entire CI/CD pipeline, independent of the platform.

Main objective:

> Determine whether source, tests, builds, artifacts, approvals, migrations, secrets, deployments, and rollback processes form a reliable and secure chain from commit to production.

## 1. MAP THE PIPELINE

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

## 2. INVENTORY

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

Which ref is permitted into production?

## 4. BRANCH PROTECTION

If release depends on main/master:

verify:

- required reviews
- required checks
- direct push
- force push

Do not treat a process rule as a technical vulnerability without an attack path.

## 5. PR VALIDATION

Tests must cover the actual merge/deploy artifact.

## 6. TEST ON PR, DEPLOY DIFFERENT SHA

High-signal race/drift.

## 7. TOCTOU BETWEEN REVIEW AND DEPLOY

When the same branch can be modified after approval but prior to deployment.

## 8. IMMUTABLE COMMIT

Production artifact should be pinned to an exact SHA.

## 9. BUILD ONCE, PROMOTE

If staging and prod rebuild source separately:

they can produce different artifacts.

## 10. REBUILD PRODUCTION

Can pull newer transitive dependencies/toolchain.

## 11. ARTIFACT IMMUTABILITY

Who can replace a build?

## 12. ARTIFACT RETENTION

Does the preceding release exist for rollback?

## 13. BUILD PROVENANCE

Artifact -> source commit -> workflow run.

## 14. TEST GATE

Which checks block deployment?

## 15. FAILING TEST

Can a production deploy still proceed?

## 16. SKIP TEST

Manual path?

## 17. ALLOW FAILURE

Critical security/test job with continue-on-error.

## 18. FLAKY TEST

If it is simply rerun until green:

the gate loses value.

## 19. TEST ENV PARITY

Does not have to be identical to production, but critical differences must be known.

## 20. BUILD CONFIG

Dev flags must not end up in the production artifact.

## 21. SECRET INJECTION

When do secrets become accessible?

## 22. UNTRUSTED CODE + SECRET

The most critical supply-chain scenario.

## 23. DEPLOY CREDENTIAL

Scoped strictly to the required environment.

## 24. STATIC LONG-LIVED KEY

Blast radius vs short-lived/OIDC.

## 25. ENVIRONMENT ISOLATION

Staging deploy credential should not have production access.

## 26. PRODUCTION APPROVAL

If required according to the operational model.

Do not mandate human approval for every low-risk continuous delivery system.

## 27. CHANGE RISK

Migrations/infra/secrets may require a different approval model.

## 28. MIGRATION STEP

Who executes it?

## 29. MIGRATION PRE/POST APP

Order.

## 30. MIGRATION RETRY

Can it be safely rerun?

## 31. PARTIAL MIGRATION

Failure midway through execution.

## 32. SCHEMA BACKWARD COMPATIBILITY

Mixed versions.

## 33. ROLLBACK

Does not merely mean redeploying old artifact.

## 34. ROLLBACK DATABASE

May be impossible.

## 35. FEATURE FLAG

May be a superior rollback mechanism for feature behavior.

## 36. SMOKE TEST

Verify critical paths post-deployment.

## 37. SMOKE TEST AUTHORITY

Health 200 is not proof that login/DB/write operations work.

## 38. AUTO ROLLBACK

If present:

which metric and threshold?

## 39. FALSE ROLLBACK

Transient metric spike can loop deployment.

## 40. CANARY

If present, analyze traffic split and evaluation.

## 41. BLUE/GREEN

Database compatibility.

## 42. CONCURRENT DEPLOY

Two actors/pipelines deploying different SHAs.

## 43. DEPLOY LOCK

Serialization where required.

## 44. CANCEL DEPLOY

Mid-flight cancellation can leave a mixed state.

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

Config can be breaking even when code is unchanged.

## 51. SECRET ROTATION

Old/new application compatibility.

## 52. DATABASE BACKUP PRE RISKY MIGRATION

If architecture/process demands it.

Do not use backup as an excuse for an unsafe migration.

## 53. PREVIEW DEPLOY

Which secrets/data does it receive?

## 54. PR DEPLOY

Untrusted code + public URL + provider tokens.

## 55. PIPELINE DEPENDENCIES

Actions/plugins/images/build tools.

## 56. REMOTE SCRIPTS

Pin + verify.

## 57. RUNNER TRUST

Hosted vs self-hosted.

## 58. CACHE

Can poisoned cache influence the final artifact?

## 59. WORKSPACE CONTAMINATION

Self-hosted runners.

## 60. CLEAN CHECKOUT

Release build must originate from the expected source.

## 61. GENERATED FILES

Uncommitted generated output discrepancies.

## 62. MONOREPO

Path-based pipelines can miss shared dependency changes.

## 63. SELECTIVE TESTING

Changed-files optimization must understand the dependency graph.

## 64. BUILD MATRIX

A combination might be untested yet deployed.

## 65. PLATFORM ARCH

amd64/arm64.

## 66. RUNTIME VERSION

CI test runtime vs production runtime.

## 67. DB VERSION

Integration tests.

## 68. ENVIRONMENT VARIABLE

Missing production env might only be discovered post-deployment.

## 69. CONFIG VALIDATION

Pre-deployment.

## 70. SECRET VALIDATION

Do not print values.

## 71. DNS/TLS DEPLOY

Infrastructure changes may require propagation time.

## 72. CDN INVALIDATION

Old frontend + new backend compatibility.

## 73. STATIC ASSET HASHING

Old HTML/new assets.

## 74. SERVICE WORKER

PWA update can hold a stale client after backend deployment.

## 75. MOBILE CLIENT

Backend must remain compatible with legacy mobile app versions per the support window.

## 76. DESKTOP CLIENT

Same considerations.

## 77. FEATURE ROLLOUT

Gradual activation.

## 78. DEPLOY OBSERVABILITY

Link release SHA with logs/metrics/traces.

## 79. RELEASE MARKER

Monitoring needs to know when deployment initiated.

## 80. ERROR SPIKE

Pre/post-deploy comparison.

## 81. PIPELINE ALERT

Failed deploy must have an owner/alert signal.

## 82. MANUAL HOTFIX

How does it navigate through controls?

## 83. BREAK-GLASS DEPLOY

If present:

- authorization
- audit
- post-review

## 84. DIRECT PLATFORM DEPLOY

Can someone bypass CI and deploy locally?

## 85. CONFIG CLICKOPS

Can alter runtime without Git evidence.

## 86. ACCESS REVIEW

Who can deploy to production?

## 87. SHARED CREDENTIAL

Attribution.

## 88. AUDIT LOG

Deploy actor, SHA, timestamp.

## 89. SUPPLY CHAIN

Cross-reference Prompt 38.

## 90. FAILURE SCENARIOS

Test:

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

CICD_PIPELINE_AUDIT.md

## 93. MATRICES

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

# FINAL RULE

Looking for issues such as:

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

or:

```text
staging build
↓
tests pass
↓
production rebuilds from source
↓
floating dependency resolves newer version
↓
production artifact is not the same as tested artifact
```
