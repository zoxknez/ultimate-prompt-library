---
id: UPL-IT-043
number: 43
slug: kubernetes-production-audit
title: Kubernetes Production Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.0.0
status: stable
---

# KUBERNETES PRODUCTION AUDIT

I want you to perform a maximally deep forensic audit of the Kubernetes production deployment.

Main objective:

> Determine whether workload scheduling, probes, resource limits, RBAC, secrets, networking, storage, rollouts, autoscaling, disruption handling, Jobs/CronJobs, and cluster configuration can cause outages, privilege escalation, secret exposure, data loss, or insecure rollouts.

If the project does not use Kubernetes:

**NOT APPLICABLE**

## 1. INVENTORY

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

Verify whether production and staging share namespaces or credentials.

## 4. DEFAULT SERVICE ACCOUNT

A workload that does not require access to the Kubernetes API must not mount a broad API token.

## 5. AUTOMOUNT TOKEN

If the workload does not require the API, configure:

```yaml
automountServiceAccountToken: false
```

## 6. RBAC

Look for:

- `cluster-admin`

- `*` verbs

- `*` resources

- broad namespace grants

## 7. SERVICE ACCOUNT PIVOT

If an attacker compromises a pod:

what Kubernetes API privileges do they acquire?

## 8. SECRETS READ

Permissions to `get/list secrets` represent high-value targets.

## 9. CREATE POD

In many cluster configurations, permission to create privileged pods enables a cluster takeover pivot.

## 10. EXEC

`pods/exec` grants arbitrary command execution inside workloads.

## 11. IMPERSONATE

High-risk RBAC permission.

## 12. SECRET OBJECT

Base64 encoding is not encryption.

## 13. SECRET ENV

Process environment visibility and exposure.

## 14. SECRET VOLUME

File permissions and volume rotation semantics.

## 15. CONFIGMAP

Do not store plaintext secrets inside ConfigMaps.

## 16. IMAGE

Verify:

- immutable tag/digest

- registry

- pull policy

- provenance

## 17. `latest`

Introduces rollout and recovery ambiguity.

## 18. IMAGEPULLSECRETS

Scope and namespace bindings.

## 19. SECURITY CONTEXT

Analyze:

```text
runAsNonRoot
runAsUser
readOnlyRootFilesystem
allowPrivilegeEscalation
capabilities
seccomp
```

Do not treat all settings as universally mandatory without context.

## 20. PRIVILEGED POD

High-risk architectural pattern.

## 21. HOSTPID / HOSTNETWORK / HOSTIPC

Significantly increase host-level exposure.

## 22. HOSTPATH

Specifically:

- `/`

- `/var/run`

- `/etc`

- container runtime sockets

## 23. CAP_SYS_ADMIN

High-risk Linux capability.

## 24. INIT CONTAINER

Maintains its own security context and secrets access.

## 25. SIDECAR

Can access the identical volumes and secrets.

## 26. REQUESTS

Without resource requests, the scheduler cannot determine actual consumption or placement.

## 27. LIMITS

Without memory limits, a runaway container can induce node memory pressure.

## 28. CPU LIMIT

Overly aggressive limits result in CPU throttling and elevated latency.

## 29. MEMORY LIMIT

Configured too low leads to continuous OOMKill crash loops.

## 30. QoS CLASS

Understand the operational implications of Burstable, Guaranteed, and BestEffort classes.

## 31. OOMKILL

Analyze pod restart patterns and frequency.

## 32. LIVENESS

Must not terminate pods due to transient downstream dependency failures.

## 33. READINESS

Pods must not receive traffic prior to passing readiness checks.

## 34. STARTUP PROBE

Useful for slow-starting applications to prevent liveness probes from killing the process prematurely.

## 35. PROBE TIMEOUT

Defaults can be too brief for stressed nodes.

## 36. PROBE ENDPOINT

Do not utilize expensive database queries as liveness checks.

## 37. ROLLING UPDATE

Analyze:

```text
maxUnavailable
maxSurge
```

## 38. SINGLE REPLICA

Rolling updates can cause downtime if update configurations are misaligned.

## 39. READINESS + ROLLING

Without readiness checks, newly launched broken pods will receive traffic immediately.

## 40. TERMINATION

`terminationGracePeriodSeconds`.

## 41. PRESTOP

If network connection draining is required.

## 42. ENDPOINT REMOVAL

Race conditions between readiness, pod termination, and load balancer deregistration.

## 43. PDB

Protects against voluntary disruptions.

Does not prevent hardware or node failures on its own.

## 44. NODE DRAIN

Simulate operational impact during node maintenance.

## 45. ANTI-AFFINITY

If all replicas land on a single node, a node failure takes down the entire service.

## 46. TOPOLOGY SPREAD

Enforce zone and host spread for HA workloads.

## 47. MULTI-ZONE

Verify actual scheduling policies and multi-zone storage volume support.

## 48. HPA

Target metrics:

- CPU

- memory

- custom

- queue depth

must correspond to actual application bottlenecks.

## 49. HPA WITHOUT REQUESTS

CPU-based HPA can behave unpredictably if resource requests are not configured properly.

## 50. HPA MAX

Constrained by downstream database and provider capacity limits.

## 51. SCALE-UP SPEED

Pod startup duration can lag behind rapid traffic spikes.

## 52. SCALE-DOWN

Do not terminate pods executing long-running background tasks without graceful draining semantics.

## 53. VPA

If present, verify the operational impact of automated pod restarts.

## 54. CLUSTER AUTOSCALER

HPA may request additional pods that the cluster cannot schedule due to node constraints.

## 55. PENDING POD

Alerting on unscheduled pods.

## 56. RESOURCE QUOTA

Protects tenant and team namespaces from resource monopolization.

## 57. LIMIT RANGE

Provides default requests and limits.

## 58. PVC

Verify:

- storage class

- reclaim policy

- access mode

- volume expansion

- backup strategy

## 59. STATEFULSET

Predictable pod identities and dedicated persistent storage semantics.

## 60. `emptyDir`

Ephemeral lifecycle tied to pod existence.

## 61. `hostPath`

Ties state to specific physical nodes.

## 62. PVC DELETE

What occurs to the underlying storage volume?

## 63. RECLAIM POLICY

`Delete` vs `Retain`.

## 64. DATABASE IN K8S

If running a self-hosted database in Kubernetes:

specifically audit HA, automated backups, and storage volume failure modes.

## 65. SERVICE

ClusterIP, NodePort, and LoadBalancer configurations.

## 66. NODEPORT

Can unexpectedly expose internal services on node IPs.

## 67. LOADBALANCER

Public vs internal subnet annotations.

## 68. INGRESS

- TLS

- host routing

- path routing

- auth

- payload size and timeouts

## 69. DEFAULT BACKEND

Must not expose debug interfaces or internal administrative applications.

## 70. WILDCARD HOST

Host-based multi-tenant applications warrant additional routing scrutiny.

## 71. INGRESS ANNOTATIONS

Certain ingress controllers support configuration snippets or custom directives with severe security impact.

## 72. NETWORK POLICY

When the cluster threat model mandates isolation.

## 73. NO POLICY

Pods may communicate unrestricted across namespaces.

Do not declare high severity without a realistic lateral movement path.

## 74. EGRESS

SSRF and post-compromise blast radius.

## 75. DNS

Impact of CoreDNS latency or outages.

## 76. EXTERNALNAME

Can introduce trust and DNS confusion.

## 77. CRONJOB

Audit:

- schedule

- concurrencyPolicy

- startingDeadlineSeconds

- history limits

- idempotency

## 78. `Allow` CONCURRENCY

Can initiate duplicate destructive or financial business executions.

## 79. MISSED RUN

What occurs following control-plane downtime?

## 80. JOB RETRY

`backoffLimit`.

## 81. JOB IDEMPOTENCY

Must be retry-safe.

## 82. LONG JOB + DEPLOY

Worker version compatibility with in-flight tasks.

## 83. HELM

Values files can contain plaintext secrets and configuration drift.

## 84. HELM UPGRADE

Atomic deployments and automated rollback semantics.

## 85. HELM HOOK

Migration hooks can block or inadvertently repeat database operations.

## 86. KUSTOMIZE

Overlay configuration drift.

## 87. PROD/STAGING OVERLAY

Must not share production secrets or incorrect domain routes.

## 88. ADMISSION

If Pod Security Standards or policy engines exist:

verify policy enforcement coverage.

## 89. POD SECURITY

Privileged, Baseline, and Restricted standard profiles where applicable.

## 90. CONTROL PLANE

If running a managed service:

do not invent etcd or master node requirements handled by the cloud provider.

## 91. K8S VERSION

EOL cluster versions and deprecated workload APIs.

## 92. DEPRECATED API

Cluster upgrades can break incompatible manifests.

## 93. CRD

Custom resource controllers represent privileged supply-chain and runtime components.

## 94. OPERATOR

What cluster permissions does the operator service account possess?

## 95. OBSERVABILITY

Track:

- pod restarts

- OOM events

- Pending status

- probe failures

- HPA saturation

- node pressure

- PVC usage

## 96. EVENTS

Useful for diagnostics, but have short retention windows.

## 97. LOGGING

Ephemeral pod logs must be aggregated centrally for incident investigation.

## 98. METRICS SERVER

Critical dependency for HPA operation.

## 99. P0/P1 EXAMPLES

P0:
- workload compromise leading directly to cluster-admin or node host takeover
- critical persistent application data stored systematically on ephemeral volumes

P1:
- privileged pod or host mount combined with a practical attacker path
- defective rollout configuration causing repeatable production outages
- secret exposure through overly broad RBAC permissions

## 100. FINDING FORMAT

```text
ID:
Severity:
Workload:
Namespace:
Resource:
Evidence tier:
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

## 101. OUTPUT

`KUBERNETES_PRODUCTION_AUDIT.md`

Sections:

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

## 102. SECOND PASS

Simulate:

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
- zone loss if architecture claims multi-zone HA

## 103. FINAL QUALITY GATE

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

# FINAL RULE

I do not want:

> Add resource limits, NetworkPolicy, and PDB.

I am seeking issues such as:

```text
Deployment replicas = 1
maxUnavailable = 1

↓
rolling update terminates old pod

↓
new pod is not yet ready

↓
service has no endpoints

↓
every deploy causes downtime
```

or:

```text
application pod
↓
default service account
↓
ClusterRoleBinding:
cluster-admin

↓
web RCE in application
↓
attacker uses mounted K8s token
↓
cluster takeover
```

If Kubernetes is not the production platform:

**NOT APPLICABLE.**
