---
id: UPL-IT-042
number: 42
slug: docker-production-audit
title: Docker Production Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.1.0
status: stable
---

# DOCKER PRODUCTION AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the entire Docker/container layer of the project.

Main objective:

> Determine whether the Dockerfile, build context, image layers, runtime user, filesystem, networking, secrets, health checks, resource limits, dependency installation, and container lifecycle can cause security compromise, secret exposure, unreproducible builds, startup failures, data loss, oversized attack surface, or production outages.

This is not:

- generic "use Alpine"

- automatically demanding multi-stage builds

- automatically demanding non-root without analyzing compatibility

- merely an image-size audit

- merely a vulnerability scan

- merely a Dockerfile lint

- assuming a container inherently provides a sandbox

Priority:

**embedded secrets > privileged/root compromise impact > executable supply-chain risk > ephemeral data loss > broken health/startup > resource exhaustion > unreproducible build > oversized image > hardening**

## 1. INVENTORY ALL CONTAINER ARTIFACTS

Locate:

- Dockerfile

- Dockerfile.*

- docker-compose.yml

- compose.yaml

- `.dockerignore`

- entrypoint scripts

- build scripts

- container CI config

- image publishing workflows

For each image record:

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

Verify:

- registry

- namespace

- tag

- digest

- runtime version

- OS version

- EOL status

`latest` is not automatically a vulnerability, but it reduces reproducibility.

## 3. MUTABLE TAG

If production deployment uses:

```text
image: app:latest
```

ask:

- what is actually deployed

- can rollback restore the exact artifact

- can the tag be shifted without infrastructure diffs

## 4. DIGEST PINNING

Valuable for immutable releases.

Do not demand for every development flow.

## 5. MULTI-STAGE BUILD

Verify that build dependencies, compilers, package-manager tokens, and source files do not unnecessarily end up in the runtime image.

## 6. BUILD CONTEXT

Specifically review `.dockerignore`.

Check whether the build context includes:

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

not automatically an issue, but mandates a thorough `.dockerignore` review.

## 8. SECRET IN BUILD ARGUMENT

Look for:

```text
ARG TOKEN
ENV TOKEN=$TOKEN
```

Build arguments are not a secret store.

## 9. SECRET IN IMAGE LAYER

If a secret is handled as:

```text
COPY .env .
RUN use-secret
RUN rm .env
```

deleting it in a subsequent layer does not purge it from the prior layer.

## 10. BUILDKIT SECRET

If the build must utilize credentials:

verify whether it employs ephemeral secret mounts or an equivalent that leaves no trace in the image.

## 11. PACKAGE REGISTRY TOKEN

Specifically:

- `.npmrc`

- pip config

- Maven settings

- NuGet config

## 12. IMAGE HISTORY

Inspect whether commands or metadata expose secrets.

## 13. RUNTIME USER

If the container runs as root:

evaluate:

- what an exploit achieves

- mounts

- capabilities

- host integration

Do not automatically declare as P1.

## 14. USER DIRECTIVE

Verify:

```text
USER app
```

or equivalent.

## 15. FILE OWNERSHIP

A non-root container unable to write to temp/cache directories may fail only once deployed to production.

## 16. `chmod 777`

High-signal permissions smell.

Assess actual attack impact.

## 17. LINUX CAPABILITIES

If the runtime adds:

- SYS_ADMIN

- NET_ADMIN

- SYS_PTRACE

analyze why.

## 18. `--privileged`

P1/P0 candidate if attacker-controlled application code can achieve container compromise.

## 19. HOST MOUNTS

Specifically:

```text
/var/run/docker.sock
/
/etc
```

Mounting the Docker socket effectively confers host-level control.

## 20. READ-WRITE VOLUME

Which paths are writable?

## 21. READ-ONLY ROOT FS

Can mitigate persistence and tampering, but only if the application supports it.

## 22. TEMP DIR

The application may require a writable:

```text
/tmp
```

## 23. EPHEMERAL DATA

Identify whether the application stores durable data within the container's writable layer.

## 24. CONTAINER RECREATE

If the container is destroyed and recreated:

what is lost?

## 25. DATABASE IN CONTAINER

If running a self-hosted database via Compose:

verify volume durability and backups.

## 26. BIND MOUNT

Local host paths can introduce environment-specific dependencies.

## 27. NAMED VOLUME

Verify ownership, backup policies, and lifecycle management.

## 28. `docker compose down -v`

If operational documentation prescribes this:

it will permanently delete persistent data.

## 29. NETWORKING

Inventory exposed ports.

## 30. `EXPOSE`

Is not a firewall or security boundary.

## 31. HOST PORT

Compose:

```text
0.0.0.0:5432:5432
```

can publicly expose the database depending on host firewall rules.

## 32. INTERNAL NETWORK

Databases and caches should not be public without strict operational necessity.

## 33. CONTAINER DNS

Service names and startup dependencies.

## 34. STARTUP ORDER

`depends_on` does not inherently guarantee service readiness.

## 35. RETRY CONNECT

The application must gracefully tolerate databases or caches becoming ready a few seconds late.

## 36. HEALTHCHECK

Verify:

- interval

- timeout

- retries

- start-period

- command

## 37. HEALTHCHECK COST

Do not invoke heavy database queries or external API calls every few seconds without need.

## 38. HEALTHCHECK TOOL

If the runtime image lacks `curl` or `wget`, the healthcheck may be permanently broken.

## 39. SIGNALS

Ensure the process running as PID 1 receives:

- SIGTERM

- SIGINT

## 40. SHELL WRAPPER

Pattern:

```text
CMD sh -c "node app.js"
```

can inhibit signal propagation if the shell does not `exec` the child process.

## 41. ENTRYPOINT

Verify `exec "$@"`.

## 42. GRACEFUL SHUTDOWN

Container shutdown must grant the application sufficient time for:

- HTTP request draining

- queue task completion

- database connection cleanup

## 43. STOP TIMEOUT

If a worker requires 60 seconds and the host platform terminates it after 10:

jobs will be left unfinished or corrupted.

## 44. ZOMBIE PROCESSES

If the process spawns child processes:

PID 1 process reaping behavior becomes relevant.

## 45. RESOURCE LIMITS

Verify:

- CPU

- memory

- pids

- disk/temp

## 46. MEMORY LIMIT

Without limits, a runaway process can destabilize the host or shared environment.

## 47. MEMORY LIMIT TOO LOW

OOMKill crash loop.

## 48. NODE/PYTHON/JVM MEMORY

Runtime heap awareness inside containers.

## 49. CPU THROTTLING

Can explain latency spikes without high aggregate host CPU utilization.

## 50. PID LIMIT

Fork bomb and process leakage defense.

## 51. LOGGING

If the application logs to a file inside the container:

- rotation

- persistence

- disk space exhaustion

## 52. STDOUT/STDERR

Generally preferred for container orchestration logging.

## 53. LOG DRIVER

Can block the application if a synchronous log sink fails, depending on configuration.

## 54. IMAGE SIZE

A large image affects:

- deployment velocity

- cold-start times

- vulnerability surface

but is not an intrinsic security severity rating on its own.

## 55. CACHE ORDER

Dockerfile layer ordering should optimize dependency caching without introducing stale build bugs.

## 56. COPY LOCKFILE BEFORE SOURCE

For reproducible and cache-friendly dependency installation.

## 57. FROZEN INSTALL

Production builds must utilize lockfiles deterministically where the ecosystem supports it.

## 58. DEV DEPENDENCIES

Verify whether development dependencies unnecessarily end up in the runtime image.

## 59. COMPILERS IN RUNTIME

Expand the attack surface.

## 60. SHELL/DEBUG TOOLS

Defense-in-depth consideration, not a root cause vulnerability.

## 61. CA CERTIFICATES

A minimal base image lacking CA certificates can break outbound TLS requests.

## 62. TIMEZONE / LOCALE

A minimal base image can disrupt implicit system assumptions.

## 63. NATIVE LIBRARIES

glibc vs musl compatibility.

Do not recommend Alpine by default.

## 64. ARCHITECTURE

amd64 vs arm64.

## 65. MULTI-ARCH BUILD

Verify native binary and dependency compatibility.

## 66. IMAGE SCAN

Distinguish between:

- OS CVEs

- language dependency CVEs

- unreachable packages

## 67. FIXED PACKAGE

Scanner output must correspond to the final built image artifact.

## 68. SBOM

If present, verify that it reflects the actual runtime image.

## 69. LABELS

Add or analyze:

- commit SHA

- version

- build date

for provenance if supported by workflow.

## 70. IMMUTABLE RELEASE ID

Container images should remain traceable back to the source commit.

## 71. ROOT CA CERT / CUSTOM CERT

Ensure internal CA certificates are not imported insecurely.

## 72. SSH SERVER IN CONTAINER

Typically an unnecessary attack surface.

## 73. CRON IN SAME CONTAINER

Running multiple processes complicates supervision and container scaling semantics.

## 74. ONE PROCESS RULE IS NOT DOGMA

Multiple processes can be valid if an adequate supervision model is implemented.

## 75. COMPOSE PRODUCTION

If Docker Compose is utilized in production:

audit:

- restart policies

- networks

- volumes

- secrets

- dependency startup sequencing

- resource limits

## 76. RESTART POLICY

`always` can mask active crash loops.

## 77. CRASH LOOP

Monitoring must expose container restart frequency.

## 78. SECRET IN COMPOSE

Hardcoded:

```yaml
environment:
  DB_PASSWORD: ...
```

if real credentials are committed.

## 79. `.env` COMPOSE

Verify source location and file permissions.

## 80. DOCKER SECRETS

If running in Swarm or compatible systems.

Do not demand if the platform utilizes an external secret manager.

## 81. CONTAINER ESCAPE

Do not allege theoretical kernel or container escapes without an applicable CVE or concrete configuration path.

## 82. SECCOMP

Hardening when the threat model warrants it.

## 83. APPARMOR/SELINUX

Likewise.

## 84. NO-NEW-PRIVILEGES

Valuable hardening flag.

## 85. SUID BINARIES

A minimal runtime image can eliminate them.

## 86. MOUNTED CLOUD CREDENTIAL

If the host mounts a credential file:

who has read access?

## 87. DOCKER SOCKET

If the application or a monitoring container has access to the Docker socket:

map the blast radius.

## 88. CONTAINER METADATA

Cloud credentials accessible via metadata endpoints fall under cloud audits, but document the post-compromise path.

## 89. DNS FAILURE

The application must implement bounded timeouts and reconnection retry logic.

## 90. DEPENDENCY OUTAGE

Restarting containers is not a remedy for downstream service outages if restart storms exacerbate the failure.

## 91. IMAGE PULL FAILURE

Deployment strategies should retain existing healthy replicas where the orchestrator supports it.

## 92. PRIVATE REGISTRY

Authentication credentials and availability.

## 93. IMAGE RETENTION

Rollback artifacts must not be prematurely garbage-collected.

## 94. LATEST IMAGE OVERRIDE

Rolling back to `latest` is not a rollback.

## 95. BUILD PLATFORM VS RUNTIME PLATFORM

Native module architecture mismatches.

## 96. PRODUCTION DEBUG

A development server executing inside a container is not automatically a production-grade server.

## 97. NODE DEV SERVER / FLASK DEV SERVER

Verify the actual runtime execution command.

## 98. PORT BINDING

The process must bind to the expected network interface and port.

## 99. HEALTH + APP PORT

Mismatches can render a healthy application unreachable.

## 100. SECURITY FINDING FORMAT

Every serious finding must include:

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
- container configuration grants practical host or global production takeover
- embedded active privileged secret in a public or distributed image
- production durable data is systematically destroyed during routine redeployment without recovery

P1:
- Docker socket or privileged container paired with a practical compromise path
- production secret embedded in an image layer
- critical startup, shutdown, or data persistence model leading to real outage or data loss

P2:
- meaningful resource, permission, reproducibility, or persistence defect

P3:
- minor operational or configuration weakness

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

- **CONFIRMED** - tier A or B evidence shows the failure or exploit path.
- **LIKELY** - tier C evidence.
- **NOT VERIFIED** - depends on runtime state, settings or versions that could not be checked (tier D). Never present tier D as confirmed.
- **NOT APPLICABLE** - the component or pattern is not used.
- **CONTROLLED** - the risk exists but another control contains it.
- **HARDENING** - improvement without a current failure path (P4).

False-positive rules:

- A root user in the container is a finding only with a concrete path (writable mounts, host namespaces, capabilities, a known escape surface) or where policy requires non-root; otherwise it is HARDENING.
- A large image or a non-minimal base is a cost and attack-surface note, not a vulnerability by itself.
- Scanner CVEs are findings only when the vulnerable package is present in the final runtime image and the vulnerable code path or exposure is plausible; build-stage-only packages do not ship.
- `latest` or unpinned tags in local development Compose files are not production defects.
- A missing `HEALTHCHECK` instruction is not a defect when the orchestrator defines its own probes.
- Build arguments are a secret leak only when a real secret value is passed and persists in history, layers or metadata.

Do not report a missing best practice as a confirmed defect unless there is a concrete failure, exploit, correctness, reliability, or operational path.

## 104. OUTPUT

`DOCKER_PRODUCTION_AUDIT.md`

Sections:

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

Mandatorily simulate or analyze:

- rebuild without cache
- container restart
- container recreate
- SIGTERM
- DB unavailable on startup
- memory pressure
- disk/temp full
- secret search across image layers
- non-root execution
- rollback to previous immutable image
- private registry outage

## 106. FINAL QUALITY GATE

Verify:

- final image, not merely Dockerfile
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

# FINAL RULE

I do not want:

> Use Alpine, non-root, and multi-stage builds.

I am seeking issues such as:

```text
Docker build:
COPY . .
↓
.env.production enters layer
↓
later RUN rm .env.production
↓
final filesystem is clean
↓
secret still resides in previous image layer
↓
anyone with image pull access can extract it
```

or:

```text
upload storage:
/app/uploads
↓
no persistent volume mounted
↓
docker compose recreate
↓
DB metadata remains
↓
files vanish
```

If Docker is not the production deployment platform:

**PRODUCTION DOCKER USAGE NOT VERIFIED.**

If the issue represents only hardening without a realistic failure or exploit path:

**P4 - HARDENING.**
