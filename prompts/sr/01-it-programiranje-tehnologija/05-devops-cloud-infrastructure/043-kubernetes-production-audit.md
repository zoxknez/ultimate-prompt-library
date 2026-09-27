---
id: UPL-IT-043
number: 43
slug: kubernetes-production-audit
title: Produkcioni audit Kubernetes okruženja
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# PRODUKCIONI AUDIT KUBERNETES OKRUŽENJA

Želim da izvršiš maksimalno dubok forensic audit Kubernetes production deployment-a.

Glavni cilj:

> Utvrditi da li workload scheduling, probes, resource limits, RBAC, secrets, networking, storage, rollouts, autoscaling, disruption handling, Jobs/CronJobs i cluster configuration mogu izazvati outage, privilege escalation, secret exposure, data loss ili nebezbedan rollout.

Ako projekat ne koristi Kubernetes:

**NOT APPLICABLE**

## 1. INVENTARIŠI

- Deployments

- StatefulSets

- DaemonSets

- Jobs

- CronJobs

- Services

- Ingress

- Secrets

- ConfigMaps

- ServiceAccounts

- Roles

- ClusterRoles

- PVC/PV

- HPA

- PDB

- NetworkPolicy

- Helm/Kustomize

## 2. WORKLOAD MATRIX

```text
Workload:
Namespace:
Replicas:
ServiceAccount:
Requests/Limits:
Probes:
Volumes:
Exposure:
Update strategy:
```

## 3. NAMESPACE ISOLATION

Proveri da li prod/staging dele namespace ili credentials.

## 4. DEFAULT SERVICE ACCOUNT

Workload koji ne treba Kubernetes API ne treba širok token.

## 5. AUTOMOUNT TOKEN

Ako workload-u API nije potreban, razmotri:

```yaml

automountServiceAccountToken: false

```

## 6. RBAC

Traži:

- `cluster-admin`

- `*` verbs

- `*` resources

- broad namespace grants

## 7. SERVICE ACCOUNT PIVOT

Ako attacker kompromituje pod:

koje Kubernetes API privilegije dobija?

## 8. SECRETS READ

Permission za `get/list secrets` je high-value.

## 9. CREATE POD

U mnogim konfiguracijama permission da kreira privileged pod može postati ozbiljan cluster pivot.

## 10. EXEC

`pods/exec` omogućava code execution u workload-u.

## 11. IMPERSONATE

High-risk RBAC permission.

## 12. SECRET OBJECT

Base64 nije encryption.

## 13. SECRET ENV

Process/env visibility.

## 14. SECRET VOLUME

Permissions i rotation semantics.

## 15. CONFIGMAP

Ne stavljaj real secrets u ConfigMap.

## 16. IMAGE

Proveri:

- immutable tag/digest

- registry

- pull policy

- provenance

## 17. `latest`

Rollout/recovery ambiguity.

## 18. IMAGEPULLSECRETS

Scope i namespace.

## 19. SECURITY CONTEXT

Analiziraj:

```text
runAsNonRoot
runAsUser
readOnlyRootFilesystem
allowPrivilegeEscalation
capabilities
seccomp
```

Ne tretiraj sve kao mandatory bez context-a.

## 20. PRIVILEGED POD

High-risk.

## 21. HOSTPID / HOSTNETWORK / HOSTIPC

Povećavaju host exposure.

## 22. HOSTPATH

Posebno:

- `/`

- `/var/run`

- `/etc`

- container runtime sockets

## 23. CAP_SYS_ADMIN

High-risk.

## 24. INIT CONTAINER

Ima sopstveni security context i secrets.

## 25. SIDECAR

Može dobiti iste volumes/secrets.

## 26. REQUESTS

Bez requests scheduler ne zna realnu potrošnju.

## 27. LIMITS

Bez memory limita runaway container može izazvati node pressure.

## 28. CPU LIMIT

Preagresivan limit -> throttling.

## 29. MEMORY LIMIT

Prenizak -> OOMKill.

## 30. QoS CLASS

Razumi Burstable/Guaranteed/BestEffort implications.

## 31. OOMKILL

Proveri restart pattern.

## 32. LIVENESS

Ne sme ubijati pod zbog transient downstream failure-a.

## 33. READINESS

Pod ne sme dobijati traffic pre readiness-a.

## 34. STARTUP PROBE

Koristan za spor startup da liveness ne ubija app prerano.

## 35. PROBE TIMEOUT

Default može biti prekratak.

## 36. PROBE ENDPOINT

Ne koristi težak query kao liveness.

## 37. ROLLING UPDATE

Analiziraj:

```text
maxUnavailable
maxSurge
```

## 38. SINGLE REPLICA

Rolling update može imati downtime ako config nije odgovarajući.

## 39. READINESS + ROLLING

Bez readiness-a novi broken pod može primiti traffic.

## 40. TERMINATION

`terminationGracePeriodSeconds`.

## 41. PRESTOP

Ako treba draining.

## 42. ENDPOINT REMOVAL

Race između readiness/termination/load balancer.

## 43. PDB

Pomaže voluntary disruptions.

Ne štiti od svih failures.

## 44. NODE DRAIN

Simuliraj impact.

## 45. ANTI-AFFINITY

Ako sve replicas na jednom node-u, node failure može oboriti service.

## 46. TOPOLOGY SPREAD

Za HA workloads.

## 47. MULTI-ZONE

Proveri stvarno scheduling/storage support.

## 48. HPA

Metric:

- CPU

- memory

- custom

- queue depth

mora odgovarati workload-u.

## 49. HPA WITHOUT REQUESTS

CPU utilization HPA može raditi neočekivano ako requests nisu pravilno postavljeni.

## 50. HPA MAX

Downstream DB/provider capacity.

## 51. SCALE-UP SPEED

Startup time može biti sporiji od traffic spike-a.

## 52. SCALE-DOWN

Ne ubijaj pods sa long jobs bez graceful semantics.

## 53. VPA

Ako postoji, proveri restart impact.

## 54. CLUSTER AUTOSCALER

HPA može tražiti podove koje cluster nema gde da smesti.

## 55. PENDING POD

Alerting.

## 56. RESOURCE QUOTA

Tenant/team namespace protection.

## 57. LIMIT RANGE

Defaults.

## 58. PVC

Proveri:

- storage class

- reclaim policy

- access mode

- expansion

- backup

## 59. STATEFULSET

Identity/storage semantics.

## 60. `emptyDir`

Ephemeral.

## 61. `hostPath`

Node-bound state.

## 62. PVC DELETE

Šta se dešava sa volume-om?

## 63. RECLAIM POLICY

`Delete` vs `Retain`.

## 64. DATABASE IN K8S

Ako critical DB self-hosted:

audituj posebno HA, backup i storage failure.

## 65. SERVICE

ClusterIP/NodePort/LoadBalancer.

## 66. NODEPORT

Može neočekivano expose-ovati service.

## 67. LOADBALANCER

Public/internal annotation.

## 68. INGRESS

- TLS

- host routing

- path routing

- auth

- size/timeouts

## 69. DEFAULT BACKEND

Ne sme expose-ovati debug/internal app.

## 70. WILDCARD HOST

Host-based tenant apps zahtevaju dodatni review.

## 71. INGRESS ANNOTATIONS

Neki controllers omogućavaju snippets/custom config sa visokim privilege impact-om.

## 72. NETWORK POLICY

Ako cluster threat model zahteva isolation.

## 73. NO POLICY

Pods možda mogu komunicirati široko.

Ne proglašavaj high severity bez actual lateral movement path-a.

## 74. EGRESS

SSRF/post-compromise blast radius.

## 75. DNS

CoreDNS failure impact.

## 76. EXTERNALNAME

Može uvesti trust confusion.

## 77. CRONJOB

Audit:

- schedule

- concurrencyPolicy

- startingDeadlineSeconds

- history

- idempotency

## 78. `Allow` CONCURRENCY

Može pokrenuti dva ista destructive/business job-a.

## 79. MISSED RUN

Šta se dešava posle control-plane downtime-a?

## 80. JOB RETRY

`backoffLimit`.

## 81. JOB IDEMPOTENCY

Retry-safe.

## 82. LONG JOB + DEPLOY

Worker compatibility.

## 83. HELM

Values mogu sadržati secrets/config drift.

## 84. HELM UPGRADE

Atomic/rollback semantics.

## 85. HELM HOOK

Migration hooks mogu blokirati ili ponoviti operacije.

## 86. KUSTOMIZE

Overlay drift.

## 87. PROD/STAGING OVERLAY

Ne smeju deliti pogrešne secrets/domains.

## 88. ADMISSION

Ako postoji Pod Security / policy engine:

proveri coverage.

## 89. POD SECURITY

Privileged/Baseline/Restricted model gde applicable.

## 90. CONTROL PLANE

Ako managed:

ne izmišljaj etcd/admin requirements koje provider vodi.

## 91. K8S VERSION

EOL cluster/workload APIs.

## 92. DEPRECATED API

Upgrade može slomiti manifests.

## 93. CRD

Custom controller je privileged supply-chain/runtime component.

## 94. OPERATOR

Koje cluster permissions ima?

## 95. OBSERVABILITY

Prati:

- pod restarts

- OOM

- Pending

- probe failures

- HPA saturation

- node pressure

- PVC usage

## 96. EVENTS

Useful ali imaju limited retention.

## 97. LOGGING

Ephemeral pod logs moraju biti agregirani ako incident investigation zahteva.

## 98. METRICS SERVER

HPA dependency.

## 99. EVIDENCE, STATUS AND FALSE POSITIVES

Evidence tier-ovi:

```text
A - observed: live cluster state (kubectl output, events, audit log) or a safe test shows the behavior
B - complete path: rendered manifests, RBAC bindings, admission policies and node configuration fully show the path
C - strong static evidence: source manifests or charts show the path, but values, overlays, admission or live drift are not verified
D - inference: depends on cluster version, CNI, managed-provider defaults or runtime state not verified
E - hardening: stronger configuration without a current failure path
```

Status:

- **CONFIRMED** - dokaz tier A ili B pokazuje putanju otkaza ili exploit-a.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od runtime stanja, podešavanja ili verzija koji nisu mogli da se provere (tier D). Tier D nikada ne predstavljaj kao potvrđen.
- **NOT APPLICABLE** - komponenta ili obrazac se ne koriste.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

False-positive pravila:

- Privilegovane sistemske komponente (CNI, CSI, node agenti, monitoring daemon-i) su očekivane; proveri njihovo poreklo, izolaciju namespace-a i RBAC, a ne samu privilegiju.
- NetworkPolicy koja nedostaje je nalaz samo uz konkretnu lateralnu putanju do osetljivog servisa; proveri da li CNI uopšte primenjuje politike.
- CPU limit koji nedostaje nije defekt sam po sebi; memory limiti ili request-i koji nedostaju postaju nalazi kada izazivaju eviction, noisy-neighbor ili otkaze pri raspoređivanju.
- Jedna replika je prihvatljiva za batch, interne ili izričito nekritične workload-e.
- Podešavanja managed control plane-a koja ne vidiš su **NOT VERIFIED**, a ne nebezbedna.
- Izvorne manifeste mogu da izmene Helm vrednosti, Kustomize overlay-i, admission mutacija ili operatori; potvrdi renderovani ili živi objekat pre prijave.

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza, exploit-a, greške u ispravnosti, pouzdanosti ili rada.

## 100. SEVERITY

P0:
- workload-compromise -> cluster-admin/host takeover
- critical persistent data systematically ephemeral

P1:
- privileged pod/host mount sa practical attacker path-om
- broken rollout config daje repeated production outage
- secret exposure kroz overly broad RBAC

P2:
- disruption, probe ili resource kontrole koje nedostaju sa realnom putanjom ispada ili eviction-a
- putanje lateralnog kretanja do internih servisa bez direktnog sticanja privilegija
- zastareli API-ji ili verzije koji će pući pri sledećem upgrade-u

P3:
- pogrešna podešavanja ograničenog opsega sa malim uticajem ili uskim blast radius-om

P4:
- hardening bez trenutne putanje otkaza ili exploit-a

## 101. FINDING FORMAT

```text
ID:
Severity:
Workload:
Namespace:
Resource:
Evidence tier:
Status:
Attacker/failure trigger:
Current config:
Path:
Impact:
Blast radius:
Root cause:
Fix:
Verification:
Complexity:
```

## 102. OUTPUT

`KUBERNETES_PRODUCTION_AUDIT.md`

Sekcije:

1. Architecture

2. Namespace Isolation

3. Workloads

4. Security Context

5. RBAC

6. Secrets

7. Resources

8. Probes

9. Rollouts

10. Scheduling

11. Autoscaling

12. Storage

13. Networking

14. Ingress

15. Jobs/CronJobs

16. Helm/Kustomize

17. Observability

18. Failure Scenarios

19. Findings

20. Roadmap

## 103. SECOND PASS

Simuliraj:

- kill one pod

- kill one node

- failed rollout

- readiness never becomes true

- liveness false positive

- OOMKill

- HPA reaches max

- PVC nearly full

- CronJob runs twice

- secret/RBAC compromise

- Ingress controller restart

- zone loss ako architecture tvrdi zone HA

## 104. FINAL QUALITY GATE

- actual cluster manifests

- namespace boundaries

- SA/RBAC

- privileged workloads

- host mounts

- secrets

- requests/limits

- probes

- rollout

- graceful termination

- PDB/topology

- HPA/downstream capacity

- PVC/reclaim/backup

- network exposure

- Jobs retry/idempotency

- observability

# KONAČNO PRAVILO

Ne želim:

> Dodaj resource limits, NetworkPolicy i PDB.

Tražim problem poput:

```text
Deployment replicas = 1
maxUnavailable = 1
↓
rolling update terminira old pod
↓
new pod još nije ready
↓
service nema endpoints
↓
svaki deploy pravi downtime
```

ili:

```text
application pod
↓
default service account
↓
ClusterRoleBinding:
cluster-admin
↓
web RCE u aplikaciji
↓
attacker koristi mounted K8s token
↓
cluster takeover
```

Ako Kubernetes nije production platforma:

**NOT APPLICABLE.**
