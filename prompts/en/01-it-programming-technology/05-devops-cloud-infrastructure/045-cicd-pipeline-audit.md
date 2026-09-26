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
version: 1.1.0
status: stable
---

# CI/CD PIPELINE AUDIT

I want a complete production-grade audit of the entire CI/CD pipeline, independent of the platform.

Main objective:

> Determine whether source, tests, builds, artifacts, approvals, migrations, secrets, deployments, and rollback processes form a reliable and secure chain from commit to production.

## 1. OBJECTIVE AND NON-GOALS

Prove whether the chain from a reviewed commit to running production code is **reliable** (what was tested is what runs, failures are contained and recoverable) and **secure** (nobody can insert unreviewed code, replace an artifact or reach production credentials without authorization).

Non-goals:

- line-by-line review of workflow syntax for a specific CI provider (a provider-specific audit, for example a GitHub Actions audit, covers that; use its findings as input)
- mandating human approval, signing or a specific tool for every system regardless of its risk
- application code quality and test quality (only the gates they form)
- infrastructure configuration outside the deployment path

## 2. CONTEXT DISCOVERY

Establish first:

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

Pipeline semantics (concurrency controls, cancellation, environment protection, artifact retention) are provider-specific. Check the actual behavior of the detected provider and version before stating it.

## 3. EVIDENCE MODEL

```text
A - observed: pipeline run history, deploy logs, registry metadata or a safe test run shows the behavior
B - complete path: pipeline definitions, permissions and environment settings fully show the path
C - strong static evidence: configuration suggests the path, but runtime settings (branch protection, environment rules) are not visible
D - inference: plausible behavior that depends on settings or provider semantics not verified
E - hardening: stronger control where the current chain already has no failure path
```

## 4. FINDING STATUS

- **CONFIRMED** - the failure or bypass path is shown by run history or complete configuration (tier A or B).
- **LIKELY** - strong static evidence (tier C).
- **NOT VERIFIED** - depends on settings outside the repository (branch protection, environment rules, registry policies) that could not be checked.
- **NOT APPLICABLE** - the stage or risk does not exist in this pipeline.
- **CONTROLLED** - the risk exists but another control contains it.
- **HARDENING** - improvement without a current failure path (P4).

Do not report a missing best practice as a confirmed defect unless there is a concrete path to untested code in production, an unauthorized deployment, a leaked credential, an unrecoverable failure or an outage.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- Manual deployment is not automatically unsafe; it becomes a finding when the deployed artifact is not the reviewed and tested one, or the action is not attributable.
- Missing human approval is not a defect for low-risk continuous delivery with strong automated gates.
- Missing artifact signing is not a vulnerability unless an attacker or mistake can actually substitute an artifact between build and deploy.
- `continue-on-error` or allowed failures on non-blocking jobs (linting of docs, optional checks) are not gate bypasses.
- Rebuilding per environment is not automatically wrong if builds are hermetic and pinned; it becomes a finding when inputs can differ.
- A long-lived deploy credential is a hardening item unless it is exposed to untrusted code or broader than necessary.

## 6. MAP THE PIPELINE

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

For every link of the chain record what enters, what leaves and what proves it:

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

A break at any link (for example "artifact identified by a mutable tag") means the chain cannot prove what runs in production.

## 8. INVENTORY

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

Which ref is permitted into production?

## 10. BRANCH PROTECTION

If release depends on main/master:

verify:

- required reviews
- required checks
- direct push
- force push

Do not treat a process rule as a technical vulnerability without an attack path.

## 11. PR VALIDATION

Tests must cover the actual merge/deploy artifact.

## 12. TEST ON PR, DEPLOY DIFFERENT SHA

High-signal race/drift.

## 13. TOCTOU BETWEEN REVIEW AND DEPLOY

When the same branch can be modified after approval but prior to deployment.

## 14. APPROVAL BINDING

An approval must be bound to what it approved:

- Is the review or deployment approval tied to a commit SHA or artifact digest, or only to a branch or pipeline run that can pick up newer commits?
- Can new commits be pushed after approval and still be deployed under that approval?
- Does a manual "deploy" job build from the current branch head instead of the approved commit?
- Are approvals dismissed when the change set changes?

Review commit A, deploy commit B is a finding whenever B can contain changes nobody reviewed or tested.

## 15. IMMUTABLE COMMIT

Production artifact should be pinned to an exact SHA.

## 16. BUILD ONCE, PROMOTE

If staging and prod rebuild source separately:

they can produce different artifacts.

## 17. REBUILD PRODUCTION

Can pull newer transitive dependencies/toolchain.

## 18. ARTIFACT IMMUTABILITY

Who can replace a build?

## 19. ARTIFACT RETENTION

Does the preceding release exist for rollback?

## 20. ARTIFACT TRUST

For every artifact type check:

- **identity** - deployment references an immutable digest or checksum, not a mutable tag such as `latest` or a reused version
- **substitution** - who (people, CI jobs, other pipelines) can push to the same repository or path, and can an artifact be replaced after tests passed?
- **registry immutability** - are tags or versions protected against overwrite?
- **signing and verification** - if signing is used, is the signature verified at deploy time, and is only the final build signed?
- **retention** - are previous production artifacts retained long enough to roll back, and are they excluded from cleanup policies?

## 21. BUILD PROVENANCE

Artifact -> source commit -> workflow run.

## 22. PROVENANCE QUESTION

For production, the pipeline must be able to answer, with evidence and without guessing:

> Which exact commit produced the running artifact, which pipeline run built it, which checks passed on it, and who or what deployed it?

Try to answer it for the current production deployment of every component (web, workers, cron, functions). If any component cannot be traced back to a commit, report it.

## 23. TEST GATE

Which checks block deployment?

## 24. FAILING TEST

Can a production deploy still proceed?

## 25. SKIP TEST

Manual path?

## 26. ALLOW FAILURE

Critical security/test job with continue-on-error.

## 27. FLAKY TEST

If it is simply rerun until green:

the gate loses value.

## 28. TEST ENV PARITY

Does not have to be identical to production, but critical differences must be known.

## 29. BUILD CONFIG

Dev flags must not end up in the production artifact.

## 30. SECRET INJECTION

When do secrets become accessible?

## 31. UNTRUSTED CODE + SECRET

The most critical supply-chain scenario.

## 32. DEPLOY CREDENTIAL

Scoped strictly to the required environment.

## 33. STATIC LONG-LIVED KEY

Blast radius vs short-lived/OIDC.

## 34. ENVIRONMENT ISOLATION

Staging deploy credential should not have production access.

## 35. SECRETS BOUNDARY

Map when privileged secrets become available along the chain:

```text
Stage:
Code executed at this stage (trusted, contributor-controlled, third-party):
Secrets available (and their scope):
Could the code at this stage exfiltrate or misuse them?
```

The critical rule: no stage that runs contributor-controlled or third-party code (pull request builds, dependency install scripts, test code from forks) may have access to production or publishing credentials. Deploy credentials should appear only in stages that run reviewed code on trusted runners, scoped to one environment.

## 36. PRODUCTION APPROVAL

If required according to the operational model.

Do not mandate human approval for every low-risk continuous delivery system.

## 37. CHANGE RISK

Migrations/infra/secrets may require a different approval model.

## 38. MIGRATION STEP

Who executes it?

## 39. MIGRATION PRE/POST APP

Order.

## 40. MIGRATION RETRY

Can it be safely rerun?

## 41. PARTIAL MIGRATION

Failure midway through execution.

## 42. SCHEMA BACKWARD COMPATIBILITY

Mixed versions.

## 43. MIGRATION AND DEPLOYMENT COUPLING

For every release with a schema or data change, walk through each combination:

```text
migration succeeds, application deploy succeeds    -> expected
migration succeeds, application deploy fails       -> old code on new schema: does it work?
migration fails midway, application not deployed   -> partial schema: can it be retried or completed?
migration fails, application deploy continues      -> new code on old schema: is this prevented?
application deploys, worker/cron deploy fails      -> mixed versions on the same data
rollback of the application after the migration    -> does the old version work on the new schema?
```

The pipeline must encode the correct order and stop on failure; state what it does today for each row.

## 44. ROLLBACK

Does not merely mean redeploying old artifact.

## 45. ROLLBACK DATABASE

May be impossible.

## 46. FEATURE FLAG

May be a superior rollback mechanism for feature behavior.

## 47. ROLLBACK REALITY

Separate:

- **code rollback** - redeploying a previous artifact: does the artifact still exist, can the pipeline deploy an older digest, and how long does it take?
- **configuration rollback** - environment variables, feature flags and infrastructure changes deployed alongside the code
- **data rollback** - schema and data changes, which usually cannot be undone by redeploying code

A rollback plan that only says "redeploy the previous version" is incomplete if the release changed the schema, the configuration or the data.

## 48. SMOKE TEST

Verify critical paths post-deployment.

## 49. SMOKE TEST AUTHORITY

Health 200 is not proof that login/DB/write operations work.

## 50. AUTO ROLLBACK

If present:

which metric and threshold?

## 51. POST-DEPLOY VALIDATION

A health endpoint returning 200 proves that the process started, not that the product works. Check whether post-deploy verification covers:

- a real write and read against the production database (or a safe synthetic tenant)
- authentication and session handling
- the most critical business flow (checkout, booking, message send)
- background workers and scheduled jobs actually processing
- error rate and latency compared with the pre-deploy baseline

State which failures would pass the current checks unnoticed.

## 52. FALSE ROLLBACK

Transient metric spike can loop deployment.

## 53. CANARY

If present, analyze traffic split and evaluation.

## 54. BLUE/GREEN

Database compatibility.

## 55. PARTIAL DEPLOYMENT

During and after a failed rollout, part of the fleet may run the new version and part the old one:

- what happens if the rollout stops at 50%: does traffic keep reaching both versions, and are they compatible with each other and with the shared data?
- does the pipeline detect a stalled or partial rollout and alert, or report success?
- are web, workers, cron and functions deployed in the same step, or can one of them stay on an old version indefinitely?

## 56. CONCURRENT DEPLOY

Two actors/pipelines deploying different SHAs.

## 57. DEPLOY LOCK

Serialization where required.

## 58. CANCEL DEPLOY

Mid-flight cancellation can leave a mixed state.

## 59. CANCELLATION SEMANTICS

Automatic cancellation of superseded runs (for example `cancel-in-progress` in a concurrency group) is safe for tests and builds, but not automatically safe for deployments and migrations:

- can a newer run cancel a deployment halfway, leaving a mixed fleet?
- can it kill a migration mid-statement or mid-backfill?
- after cancellation, does the next run start from a consistent state, or assume the previous run finished?
- are deploy jobs serialized per environment instead of cancelled?

Check the actual cancellation behavior of the provider (graceful signal vs hard kill, timeout).

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

Config can be breaking even when code is unchanged.

## 66. SECRET ROTATION

Old/new application compatibility.

## 67. DATABASE BACKUP PRE RISKY MIGRATION

If architecture/process demands it.

Do not use backup as an excuse for an unsafe migration.

## 68. PREVIEW DEPLOY

Which secrets/data does it receive?

## 69. PR DEPLOY

Untrusted code + public URL + provider tokens.

## 70. PIPELINE DEPENDENCIES

Actions/plugins/images/build tools.

## 71. REMOTE SCRIPTS

Pin + verify.

## 72. RUNNER TRUST

Hosted vs self-hosted.

## 73. CACHE

Can poisoned cache influence the final artifact?

## 74. WORKSPACE CONTAMINATION

Self-hosted runners.

## 75. CLEAN CHECKOUT

Release build must originate from the expected source.

## 76. GENERATED FILES

Uncommitted generated output discrepancies.

## 77. MONOREPO

Path-based pipelines can miss shared dependency changes.

## 78. SELECTIVE TESTING

Changed-files optimization must understand the dependency graph.

## 79. BUILD MATRIX

A combination might be untested yet deployed.

## 80. PLATFORM ARCH

amd64/arm64.

## 81. RUNTIME VERSION

CI test runtime vs production runtime.

## 82. DB VERSION

Integration tests.

## 83. ENVIRONMENT VARIABLE

Missing production env might only be discovered post-deployment.

## 84. CONFIG VALIDATION

Pre-deployment.

## 85. SECRET VALIDATION

Do not print values.

## 86. DNS/TLS DEPLOY

Infrastructure changes may require propagation time.

## 87. CDN INVALIDATION

Old frontend + new backend compatibility.

## 88. STATIC ASSET HASHING

Old HTML/new assets.

## 89. SERVICE WORKER

PWA update can hold a stale client after backend deployment.

## 90. MOBILE CLIENT

Backend must remain compatible with legacy mobile app versions per the support window.

## 91. DESKTOP CLIENT

Same considerations.

## 92. FEATURE ROLLOUT

Gradual activation.

## 93. DEPLOY OBSERVABILITY

Link release SHA with logs/metrics/traces.

## 94. RELEASE MARKER

Monitoring needs to know when deployment initiated.

## 95. ERROR SPIKE

Pre/post-deploy comparison.

## 96. PIPELINE ALERT

Failed deploy must have an owner/alert signal.

## 97. MANUAL HOTFIX

How does it navigate through controls?

## 98. BREAK-GLASS DEPLOY

If present:

- authorization
- audit
- post-review

## 99. DIRECT PLATFORM DEPLOY

Can someone bypass CI and deploy locally?

## 100. CONFIG CLICKOPS

Can alter runtime without Git evidence.

## 101. ACCESS REVIEW

Who can deploy to production?

## 102. SHARED CREDENTIAL

Attribution.

## 103. AUDIT LOG

Deploy actor, SHA, timestamp.

## 104. SUPPLY CHAIN

Pinned third-party actions, plugins and build tools; lockfile integrity; install scripts running with pipeline credentials. Record the risk here; a dedicated supply-chain audit covers dependency depth.

## 105. MANDATORY FAILURE WALKTHROUGH

For each scenario, state what the pipeline does today, what state production is left in, how it is detected and how it is recovered:

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

- **P0** - untrusted code can obtain production or publishing credentials, or anyone outside the intended group can deploy arbitrary code to production.
- **P1** - untested or unreviewed code can reach production through a normal path (review A, deploy B; mutable artifacts replaced after testing), or a routine failure leaves production in an unrecoverable or broken state.
- **P2** - material reliability gaps: rollback artifacts not retained, migrations not ordered or not retry-safe, partial deploys undetected, weak post-deploy validation on critical flows.
- **P3** - limited weaknesses: missing observability links, flaky gates, minor parity differences.
- **P4** - hardening: signing, provenance attestations, tighter scoping where no current path exists.

## 109. OUTPUT

CICD_PIPELINE_AUDIT.md

## 110. SECOND PASS

Re-walk the chain as an adversary and as an unlucky operator:

- as a contributor with only pull-request rights: which stage runs your code, and what can it reach?
- as someone with write access to one repository or registry path: can you replace what production pulls?
- as the pipeline during an incident: two deploys at once, a cancelled deploy, a failed migration, an unavailable registry, a missing secret
- as the on-call engineer: can you identify the running commit, roll back code, configuration and data, and verify the result?

Then try to disprove each finding: do branch protection, environment rules or registry policies (outside the repository) already block the path? Mark those **NOT VERIFIED** if you cannot see them.

## 111. FINAL QUALITY GATE

Before returning the report, verify that it answers:

- exact production SHA and artifact digest for every component, and how they are traced
- whether the tested artifact is the deployed artifact (build once, promote)
- whether approvals are bound to the approved commit or artifact
- the secret boundary: which stages run untrusted code and which secrets they can reach
- migration order, retry safety and the migration/deploy failure combinations
- concurrency and cancellation behavior for deploy and migration jobs
- partial deploy detection and mixed-version behavior
- rollback for code, configuration and data, including artifact retention
- post-deploy validation of critical flows, not only health checks
- environment isolation of credentials and data
- deployment observability (release markers, SHA in logs and metrics)
- direct bypass paths (local CLI deploys, console changes, break-glass)
- that statuses and evidence tiers are applied consistently

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

Other failure chains to look for:

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
