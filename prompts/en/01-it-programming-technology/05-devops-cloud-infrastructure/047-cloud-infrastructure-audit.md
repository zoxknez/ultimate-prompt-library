---
id: UPL-IT-047
number: 47
slug: cloud-infrastructure-audit
title: Cloud Infrastructure Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: DevOps, Cloud & Infrastructure
subcategory_id: devops-cloud-infrastructure
language: en
version: 1.1.0
status: stable
---

# CLOUD INFRASTRUCTURE AUDIT

I want a complete cloud infrastructure audit regardless of whether it is AWS, Azure, GCP, Oracle, Hetzner, DigitalOcean, or a hybrid combination.

Main objective:

> Identify realistic cloud failure and compromise paths across IAM, public exposure, networking, storage, compute, managed databases, secrets, backups, logging, regions, quotas, and cross-account/project trust.

## 1. NON-GOALS

- demanding multi-region, multi-cloud or a specific landing-zone design without a business requirement
- compliance checklist scoring (CIS, SOC 2) as a substitute for concrete compromise and failure paths
- application code review beyond the cloud permissions and network paths it uses
- Kubernetes object-level review (a dedicated Kubernetes audit covers that); only the cloud identities and networks around the cluster belong here

## 2. CONTEXT DISCOVERY

Establish first:

```text
Provider(s) and how many accounts/subscriptions/projects:
Organization structure and guardrails (organization policies, SCPs, management groups):
How infrastructure is provisioned (IaC tool, console, scripts) and where state lives:
Environments and which account/project each lives in:
Identity sources (SSO, local users, CI federation, workload identity):
Data stores holding sensitive or business-critical data:
Stated availability and recovery requirements:
Access available for this audit (read-only credentials, IaC only, exported policies):
```

IAM action names, metadata endpoints, escalation primitives, default encryption and quota behavior are provider-specific and change over time. Verify current provider-specific behavior before stating it.

## 3. EVIDENCE MODEL

```text
A - observed: live configuration export, policy simulator result, access analyzer output or a safe test shows the path
B - complete path: effective policies, trust policies, network rules and resource policies fully show the path
C - strong static evidence: IaC shows the path, but drift, organization guardrails or console changes are not verified
D - inference: plausible path that depends on provider semantics or configuration not seen
E - hardening: stronger control without a current compromise or failure path
```

IaC is evidence of intent, not of the live state; account for drift before marking a finding CONFIRMED.

## 4. FINDING STATUS

- **CONFIRMED** - tier A or B evidence shows a concrete compromise, exposure or failure path.
- **LIKELY** - tier C evidence.
- **NOT VERIFIED** - depends on live state, organization guardrails or provider semantics that could not be checked.
- **NOT APPLICABLE** - the service or pattern is not used.
- **CONTROLLED** - the path exists but a guardrail, boundary or detection contains it.
- **HARDENING** - architectural improvement without a current path (P4).

Keep a **confirmed cloud risk** (a principal, network path or resource setting that allows a concrete compromise or loss) separate from an **architectural hardening** recommendation (separate accounts, more regions, private endpoints). Do not report a missing best practice as a confirmed defect unless there is a concrete exploit, data exposure, data loss or availability path.

## 5. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- A public IP or public load balancer is not a vulnerability; the question is what is reachable on it and what authentication protects it.
- A broad managed policy on a break-glass or administrative role used by a small, audited group is expected; report it only if it is used routinely, shared, or reachable by workloads.
- Production and staging in one account is a blast-radius concern (HARDENING), not a confirmed risk, unless a concrete cross-environment path exists.
- A single region is acceptable when the stated recovery requirements allow it.
- Default encryption with provider-managed keys is not a finding unless a requirement demands customer-managed keys or key separation.
- A permission that looks dangerous may be neutralized by conditions, permission boundaries or organization policies; check them before reporting.

## 6. CLOUD INVENTORY

Inventory:

- accounts/subscriptions/projects
- regions
- VPC/VNet
- subnets
- load balancers
- compute
- DB
- cache
- storage
- queues
- IAM
- secrets
- DNS
- KMS
- logs
- backups

## 7. ACCOUNT BOUNDARY

Are prod and staging situated in the same account/project?

Not automatically an issue, but blast radius expands significantly.

## 8. ACCOUNT / PROJECT BOUNDARY MAP

Draw the boundaries before judging any single resource:

```text
Organization / root
  -> account/project: purpose, environment, owner
     -> trusts: which external principals can assume roles here
     -> trusted by: which other accounts this one can act in
     -> shared resources: networks, keys, buckets, registries, DNS zones
```

Every trust edge and shared resource is a path by which a compromise in one boundary reaches another.

## 9. ROOT/OWNER ACCOUNT

Audit protection mechanisms and operational usage.

## 10. HUMAN IAM

Who holds:

- admin
- billing
- IAM
- production write

## 11. SERVICE IAM

Application identity permissions.

## 12. LEAST PRIVILEGE

Not merely policy length, but concrete actions/resources.

## 13. WILDCARD

```text
Action: *
Resource: *
```

High-value finding.

## 14. IDENTITY GRAPH

Build a graph of who can act as whom:

```text
nodes: humans, groups, CI identities, workload identities, service accounts, roles, external accounts
edges: can assume / can impersonate / can create key for / can attach to workload / federated from
```

For each workload and CI identity, record its effective permissions after conditions, boundaries and organization policies. The graph answers: starting from a compromised web server, CI job or leaked key, which identities can be reached?

## 15. PRIVILEGE ESCALATION IAM

Look for combinations that allow an actor to elevate their own privileges:

- create/update role
- attach policy
- pass role
- create service account key
- modify function/job role

provider-specific.

## 16. PASS ROLE

Extremely high-value finding.

## 17. PRIVILEGE ESCALATION GRAPH

For every identity in the graph ask:

> Can this identity modify another identity, or launch or modify a workload that runs with more privilege?

Escalation primitives (names differ per provider, verify the current set):

- create or update roles, policies, bindings or trust policies
- create keys or tokens for another service account
- attach a more privileged role to a new or existing compute, function, job or container task
- modify code or configuration of a workload that already has more privilege (function code, startup scripts, container image, CI pipeline with a deploy role)
- write to storage or registries that a more privileged workload executes from

Report each escalation as a path from the starting identity to the gained privilege.

## 18. SERVICE ACCOUNT KEY

Long-lived credential risk.

## 19. WORKLOAD IDENTITY

Short-lived credential model where supported by provider.

## 20. CROSS-ACCOUNT TRUST

Who can assume the role?

## 21. WILDCARD PRINCIPAL

Critical review required.

## 22. OIDC CI TRUST

Repo, branch, and environment restrictions.

## 23. PUBLIC COMPUTE

Inventory public IP addresses.

## 24. SECURITY GROUP/FIREWALL

Which ports are exposed to `0.0.0.0/0` and `::/0`.

## 25. SSH/RDP

Public administrative management access.

## 26. DATABASE PUBLIC

Authentication + TLS + firewall + actual business necessity.

## 27. CACHE PUBLIC

High-risk exposure.

## 28. PRIVATE SUBNET

Does not automatically mean secure if a compromised application can reach it.

## 29. EGRESS

Post-compromise and SSRF blast radius.

## 30. NAT

Availability and port capacity limits.

## 31. VPC PEERING

Lateral movement paths.

## 32. TRANSITIVE ROUTING ASSUMPTIONS

Verify provider-specific routing semantics.

## 33. PRIVATE ENDPOINT

Secrets, storage, and databases.

## 34. NETWORK REACHABILITY

Prove reachability hop by hop instead of reading one rule in isolation:

```text
source (internet, peer network, other environment, workload)
-> route (route table, peering, transit, VPN, private endpoint)
-> filter (network ACL, firewall, security group, IPv4 and IPv6)
-> service (listening port, load balancer, managed endpoint)
-> identity (authentication and authorization at the service)
```

A path is exposed only if every hop allows it. An open security group behind a private subnet with no route is not an internet exposure; a private database with a public snapshot is.

## 35. DNS

Private vs public split-horizon DNS.

## 36. STORAGE BUCKET

- public access
- ACL
- policy
- listing
- versioning
- lifecycle

## 37. PUBLIC ACCESS BLOCK

Check account-level guards provided by the platform.

## 38. PRESIGNED URL

Scope and expiration limits.

## 39. STATIC WEBSITE

Bucket website hosting can inadvertently expose content.

## 40. STORAGE ENCRYPTION

Provider-managed default encryption may be sufficient.

Do not mandate customer-managed keys without explicit reason.

## 41. KMS

If customer-managed:

who can:

- decrypt
- encrypt
- modify key policy
- disable/delete key

## 42. KMS SINGLE POINT

Key deletion or disabling can render backups and active data unreadable.

## 43. KEY MANAGEMENT FAILURE

For each key protecting important data, determine:

- who can disable, schedule deletion of, or change the policy of the key
- what happens to running services, backups and replicas if the key becomes unavailable
- whether backups in another account or region depend on a key in the primary account
- whether key deletion has a waiting period and is monitored

An attacker or mistake that disables a key can make data unreadable without deleting it.

## 44. SECRET MANAGER

Who can list, read, or update secrets?

## 45. SECRET VERSION

Rotation practices.

## 46. COMPUTE METADATA

SSRF attack paths targeting instance metadata services.

## 47. INSTANCE ROLE

If the web app is compromised:

what cloud privileges are acquired?

## 48. SSRF AND METADATA PIVOT

For every workload that makes outbound requests from user input (webhooks, URL fetchers, image processors, PDF renderers):

```text
SSRF -> metadata or credential endpoint -> workload credentials -> cloud API -> reachable resources
```

Check the provider-specific protections (metadata service version and required headers, hop limits, workload identity token audience) and the egress controls. The impact equals the effective permissions of the workload identity; trace them through the identity graph.

## 49. VM IMAGE

Patch status and end-of-life (EOL).

## 50. DISK SNAPSHOT

Can contain residual secrets or sensitive data.

## 51. SNAPSHOT PUBLIC/SHARED

Critical vulnerability check.

## 52. DATABASE

Audit:

- HA
- replicas
- backups
- PITR
- encryption
- network
- credentials

## 53. DB SUPERUSER

App must not connect as superuser unless strictly necessary.

## 54. DATABASE DELETE PROTECTION

Essential safeguard for critical production databases.

## 55. BACKUP RETENTION

Retention schedules and immutability.

## 56. BACKUP ACCOUNT

Separate failure/permission domain for high-value assets.

## 57. BACKUP FAILURE DOMAIN

A backup protects against a failure only if it does not share that failure domain. For each critical store, check whether backups share with production:

- the account or project (one compromised admin deletes both)
- the region (one regional outage affects both)
- the encryption key (one disabled key makes both unreadable)
- the deletion path (the same automation or lifecycle rule can remove both)

Also check immutability or deletion protection and whether restores have ever been tested.

## 58. CACHE

- auth
- TLS
- network
- persistence
- HA

## 59. QUEUE

- access policy
- DLQ
- encryption
- retry
- message retention

## 60. SERVERLESS

Function execution role permissions.

## 61. FUNCTION URL

Is it publicly accessible?

## 62. ENV SECRETS

Exposure via logs or runtime configurations.

## 63. CONTAINER SERVICE

Task and pod workload identities.

## 64. REGISTRY

Push and pull permissions.

## 65. MUTABLE TAG

Supply chain poisoning risk.

## 66. REGISTRY PUBLIC

Accidental private container image leaks.

## 67. LOGGING

Cloud audit trails:

- IAM
- resource changes
- data-plane where necessary

## 68. AUDIT LOG DISABLE

Who has permission to disable logging?

## 69. LOG STORAGE

Actors should ideally not be capable of deleting their own audit trails in high-assurance systems.

## 70. ALERTING

- root/admin usage
- policy modifications
- public bucket exposure
- security group widening
- key deletion
- unusual deployment activity

## 71. COST

Unbounded spending:

- serverless
- bandwidth
- AI services
- storage
- logs

## 72. BUDGET

Provides detection, not prevention.

## 73. QUOTAS

Hidden operational availability boundaries.

## 74. QUOTA EXHAUSTION AND COST AMPLIFICATION

- Which quotas (instances, IPs, API rate limits, concurrent functions) would block scaling or recovery during an incident, and is anyone alerted before they are hit?
- Can one environment or tenant consume a shared quota and starve production?
- Which paths let external traffic or a compromised credential create cost quickly (compute launches, egress, logging volume, serverless invocations), and what limits or alerts stop it?

Verify current quotas and pricing with the provider; do not quote remembered values.

## 75. REGION

Actual resource distribution per region.

## 76. AZ

High-availability claims vs reality.

## 77. MULTI-AZ DB

Configured availability tier.

## 78. MULTI-REGION

Do not demand multi-region setups without explicit business requirements.

## 79. CONTROL PLANE OUTAGE

Managed services may suffer regional control plane limitations.

## 80. FAILURE DOMAIN CLAIMS

For every availability claim ("multi-AZ", "highly available", "can fail over"), check the evidence:

- are all tiers (load balancer, compute, database, cache, queue, NAT) actually spread, or does one single-zone component defeat the claim?
- does failover require control-plane operations that may be unavailable during the same outage?
- is there capacity in the surviving zones or region to absorb the load?
- has failover been exercised?

A claim without these is **NOT VERIFIED**, not confirmed.

## 81. DNS PROVIDER

Single point of failure.

## 82. CERTIFICATE

Automated managed renewal.

## 83. DOMAIN OWNERSHIP

Critical corporate asset.

## 84. CDN

Origin shield bypass vulnerabilities.

## 85. WAF

Defense-in-depth enforcement.

## 86. DDoS

Provider baseline protection plus application cost amplification.

## 87. IaC

Actual running configuration vs codified configuration.

## 88. DRIFT

Manual out-of-band cloud edits.

## 89. DESTROY

Accidental infrastructure destruction risks.

## 90. STATE

Terraform state file secret exposure.

## 91. PROD PROTECTION

Prevent destroy operations where appropriate.

## 92. LABEL/TAGS

Ownership and cost allocation tracking (lower security priority).

## 93. ORPHAN RESOURCE

Dangling buckets, IPs, load balancers, and DNS records.

## 94. DANGLING DNS

Subdomain takeover attack paths.

## 95. DANGLING DNS AND ORPHANED RESOURCES

For every DNS record pointing to a cloud resource (storage endpoint, CDN, load balancer, IP address, platform hostname), confirm the target still exists and is owned by you. A record pointing to a released IP, a deleted bucket or an unclaimed platform hostname can be claimed by someone else and serve content under your domain, including cookies scoped to the parent domain.

Also list orphaned resources (unattached disks, old snapshots, forgotten instances, unused keys) that still hold data or credentials.

## 96. UNUSED CREDENTIAL

Prune unnecessary credentials to reduce blast radius.

## 97. OLD SNAPSHOT

Sensitive data retention within obsolete snapshots.

## 98. CROSS-ENV SHARING

- DB
- bucket
- KMS
- secrets
- VPC

## 99. CROSS-ENVIRONMENT BLAST RADIUS

For each shared resource or trust between environments, trace one step:

```text
compromise or mistake in staging/dev
-> shared network, key, bucket, registry, CI role or credential
-> production resource affected
```

Report the concrete path, not the fact of sharing.

## 100. ATTACK PATH

For each compromised application credential:

```text
app identity
↓
cloud permissions
↓
reachable resources
↓
potential privilege escalation
```

## 101. MATRICES

### IAM Matrix

| Principal | Type (human, CI, workload, external) | Effective critical actions | Can escalate to | Environment | Evidence tier | Risk |
|---|---|---|---|---|---|---|

### Exposure Matrix

| Resource | Source that can reach it | Port/protocol | Route and filters | Auth at service | Intended | Risk |
|---|---|---|---|---|---|---|

### Datastore Protection Matrix

| Store | Data class | Backup / PITR | Backup account and region | Key | Delete protection | Restore tested |
|---|---|---|---|---|---|---|

### Failure-Domain Matrix

| Component | Zones / regions | Single point of failure | Failover mechanism | Depends on control plane | Tested |
|---|---|---|---|---|---|

## 102. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Classification (confirmed cloud risk / architectural hardening):
Cloud:
Account/project:
Region:
Resource:
Identity:
Scope:
Trigger / attacker:
Current permissions / exposure:
Expected invariant:
Attack / failure path:
Impact:
Blast radius:
Evidence:
Root cause:
Remediation:
Verification:
Regression risk:
```

## 103. SEVERITY

- **P0** - internet-reachable path to account takeover, production data exposure or destructive access (public sensitive data, leaked admin credential, escalation from an exposed workload to admin).
- **P1** - escalation or cross-environment path from a plausible foothold (compromised workload, CI job, staging), or a single action that can destroy production data and its backups.
- **P2** - material weaknesses: over-privileged workloads without a known escalation, backups sharing the failure domain, untested failover behind an availability claim, missing audit logging on critical actions.
- **P3** - limited issues: stale credentials with narrow scope, orphaned resources without sensitive data, cost alerts missing.
- **P4** - architectural hardening: account separation, private endpoints, customer-managed keys, where no current path exists.

## 104. OUTPUT

`CLOUD_INFRASTRUCTURE_AUDIT.md`

## 105. SECOND PASS

Assume each foothold in turn and trace the blast radius through the identity graph and network paths:

- application VM, container or function compromised (including through SSRF)
- staging administrator compromised
- CI cloud role compromised
- one access key leaked
- public bucket or snapshot misconfiguration
- production database deleted
- encryption key disabled or scheduled for deletion
- region or zone unavailable
- security group widened by mistake
- audit logging disabled

Then try to disprove each finding: do organization policies, permission boundaries, conditions, resource policies or missing routes block the path? Is the IaC evidence still true in the live account? Downgrade to **NOT VERIFIED** or **CONTROLLED** where they do or where you cannot see them.

## 106. FINAL QUALITY GATE

Before returning the report, verify that it covers:

- account/project boundary map with trust edges and shared resources
- human, CI and workload identities with effective permissions
- privilege escalation paths, stated as start identity -> gained privilege
- network reachability proven hop by hop, IPv4 and IPv6
- storage, snapshot and registry exposure
- SSRF and metadata pivot for every outbound-fetching workload
- key management failure and who can disable keys
- secrets storage and rotation
- datastores: backup, PITR, delete protection, backup failure domain, restore test
- logging and alerting on critical control-plane actions
- DNS, certificates and dangling records
- availability claims vs actual failure domains
- quotas and cost amplification, verified for the current provider
- IaC drift and resources created outside IaC
- cross-environment blast radius
- each finding classified as confirmed cloud risk or architectural hardening, with status and evidence tier

# FINAL RULE

Looking for:

```text
application role:
can CreateRole
can AttachRolePolicy
can PassRole
can RunTask
↓
web application compromised
↓
attacker creates admin role
↓
runs task with admin role
↓
cloud account privilege escalation
```

or:

```text
production DB backup
↓
snapshot shared publicly by mistake
↓
database itself remains private
↓
attacker copies snapshot
↓
offline extraction of production data
```

Other failure chains to look for:

```text
api.example.com CNAME points to a storage website endpoint
↓
bucket is deleted during a cleanup
↓
DNS record is left in place
↓
someone creates a bucket with the same name in their own account
↓
attacker content is served under the company domain
```

```text
nightly snapshots are copied to a second region
↓
same account, same administrator role, same key
↓
compromised admin credential disables the key and deletes the database
↓
backups exist but cannot be decrypted or are deleted by the same identity
```

If cloud provider/config is not verified:

**CLOUD CONFIGURATION NOT VERIFIED.**
