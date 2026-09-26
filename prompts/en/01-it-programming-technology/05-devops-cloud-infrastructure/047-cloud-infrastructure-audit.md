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
version: 1.0.1
status: stable
---

# CLOUD INFRASTRUCTURE AUDIT

I want a complete cloud infrastructure audit regardless of whether it is AWS, Azure, GCP, Oracle, Hetzner, DigitalOcean, or a hybrid combination.

Main objective:

> Identify realistic cloud failure and compromise paths across IAM, public exposure, networking, storage, compute, managed databases, secrets, backups, logging, regions, quotas, and cross-account/project trust.

## 1. CLOUD INVENTORY

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

## 2. ACCOUNT BOUNDARY

Are prod and staging situated in the same account/project?

Not automatically an issue, but blast radius expands significantly.

## 3. ROOT/OWNER ACCOUNT

Audit protection mechanisms and operational usage.

## 4. HUMAN IAM

Who holds:

- admin
- billing
- IAM
- production write

## 5. SERVICE IAM

Application identity permissions.

## 6. LEAST PRIVILEGE

Not merely policy length, but concrete actions/resources.

## 7. WILDCARD

```text
Action: *
Resource: *
```

High-value finding.

## 8. PRIVILEGE ESCALATION IAM

Look for combinations that allow an actor to elevate their own privileges:

- create/update role
- attach policy
- pass role
- create service account key
- modify function/job role

provider-specific.

## 9. PASS ROLE

Extremely high-value finding.

## 10. SERVICE ACCOUNT KEY

Long-lived credential risk.

## 11. WORKLOAD IDENTITY

Short-lived credential model where supported by provider.

## 12. CROSS-ACCOUNT TRUST

Who can assume the role?

## 13. WILDCARD PRINCIPAL

Critical review required.

## 14. OIDC CI TRUST

Repo, branch, and environment restrictions.

## 15. PUBLIC COMPUTE

Inventory public IP addresses.

## 16. SECURITY GROUP/FIREWALL

Which ports are exposed to `0.0.0.0/0` and `::/0`.

## 17. SSH/RDP

Public administrative management access.

## 18. DATABASE PUBLIC

Authentication + TLS + firewall + actual business necessity.

## 19. CACHE PUBLIC

High-risk exposure.

## 20. PRIVATE SUBNET

Does not automatically mean secure if a compromised application can reach it.

## 21. EGRESS

Post-compromise and SSRF blast radius.

## 22. NAT

Availability and port capacity limits.

## 23. VPC PEERING

Lateral movement paths.

## 24. TRANSITIVE ROUTING ASSUMPTIONS

Verify provider-specific routing semantics.

## 25. PRIVATE ENDPOINT

Secrets, storage, and databases.

## 26. DNS

Private vs public split-horizon DNS.

## 27. STORAGE BUCKET

- public access
- ACL
- policy
- listing
- versioning
- lifecycle

## 28. PUBLIC ACCESS BLOCK

Check account-level guards provided by the platform.

## 29. PRESIGNED URL

Scope and expiration limits.

## 30. STATIC WEBSITE

Bucket website hosting can inadvertently expose content.

## 31. STORAGE ENCRYPTION

Provider-managed default encryption may be sufficient.

Do not mandate customer-managed keys without explicit reason.

## 32. KMS

If customer-managed:

who can:

- decrypt
- encrypt
- modify key policy
- disable/delete key

## 33. KMS SINGLE POINT

Key deletion or disabling can render backups and active data unreadable.

## 34. SECRET MANAGER

Who can list, read, or update secrets?

## 35. SECRET VERSION

Rotation practices.

## 36. COMPUTE METADATA

SSRF attack paths targeting instance metadata services.

## 37. INSTANCE ROLE

If the web app is compromised:

what cloud privileges are acquired?

## 38. VM IMAGE

Patch status and end-of-life (EOL).

## 39. DISK SNAPSHOT

Can contain residual secrets or sensitive data.

## 40. SNAPSHOT PUBLIC/SHARED

Critical vulnerability check.

## 41. DATABASE

Audit:

- HA
- replicas
- backups
- PITR
- encryption
- network
- credentials

## 42. DB SUPERUSER

App must not connect as superuser unless strictly necessary.

## 43. DATABASE DELETE PROTECTION

Essential safeguard for critical production databases.

## 44. BACKUP RETENTION

Retention schedules and immutability.

## 45. BACKUP ACCOUNT

Separate failure/permission domain for high-value assets.

## 46. CACHE

- auth
- TLS
- network
- persistence
- HA

## 47. QUEUE

- access policy
- DLQ
- encryption
- retry
- message retention

## 48. SERVERLESS

Function execution role permissions.

## 49. FUNCTION URL

Is it publicly accessible?

## 50. ENV SECRETS

Exposure via logs or runtime configurations.

## 51. CONTAINER SERVICE

Task and pod workload identities.

## 52. REGISTRY

Push and pull permissions.

## 53. MUTABLE TAG

Supply chain poisoning risk.

## 54. REGISTRY PUBLIC

Accidental private container image leaks.

## 55. LOGGING

Cloud audit trails:

- IAM
- resource changes
- data-plane where necessary

## 56. AUDIT LOG DISABLE

Who has permission to disable logging?

## 57. LOG STORAGE

Actors should ideally not be capable of deleting their own audit trails in high-assurance systems.

## 58. ALERTING

- root/admin usage
- policy modifications
- public bucket exposure
- security group widening
- key deletion
- unusual deployment activity

## 59. COST

Unbounded spending:

- serverless
- bandwidth
- AI services
- storage
- logs

## 60. BUDGET

Provides detection, not prevention.

## 61. QUOTAS

Hidden operational availability boundaries.

## 62. REGION

Actual resource distribution per region.

## 63. AZ

High-availability claims vs reality.

## 64. MULTI-AZ DB

Configured availability tier.

## 65. MULTI-REGION

Do not demand multi-region setups without explicit business requirements.

## 66. CONTROL PLANE OUTAGE

Managed services may suffer regional control plane limitations.

## 67. DNS PROVIDER

Single point of failure.

## 68. CERTIFICATE

Automated managed renewal.

## 69. DOMAIN OWNERSHIP

Critical corporate asset.

## 70. CDN

Origin shield bypass vulnerabilities.

## 71. WAF

Defense-in-depth enforcement.

## 72. DDoS

Provider baseline protection plus application cost amplification.

## 73. IaC

Actual running configuration vs codified configuration.

## 74. DRIFT

Manual out-of-band cloud edits.

## 75. DESTROY

Accidental infrastructure destruction risks.

## 76. STATE

Terraform state file secret exposure.

## 77. PROD PROTECTION

Prevent destroy operations where appropriate.

## 78. LABEL/TAGS

Ownership and cost allocation tracking (lower security priority).

## 79. ORPHAN RESOURCE

Dangling buckets, IPs, load balancers, and DNS records.

## 80. DANGLING DNS

Subdomain takeover attack paths.

## 81. UNUSED CREDENTIAL

Prune unnecessary credentials to reduce blast radius.

## 82. OLD SNAPSHOT

Sensitive data retention within obsolete snapshots.

## 83. CROSS-ENV SHARING

- DB
- bucket
- KMS
- secrets
- VPC

## 84. ATTACK PATH

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

## 85. FINDING FORMAT

```text
ID:
Severity:
Cloud:
Account/project:
Region:
Resource:
Identity:
Current permissions/exposure:
Trigger/attacker:
Attack/failure path:
Impact:
Blast radius:
Evidence:
Root cause:
Fix:
Verification:
```

## 86. OUTPUT

`CLOUD_INFRASTRUCTURE_AUDIT.md`

## 87. MATRICES

### IAM Matrix

| Principal | Role | Critical actions | Environment | Risk |
|---|---|---|---|---|

### Exposure Matrix

| Resource | Public | Port/protocol | Auth | Intended |
|---|---|---|---|---|

### Data Protection

| Store | Backup | PITR | Encryption | Delete protection |
|---|---|---|---|---|

## 88. SECOND PASS

Assume:

- app VM/function compromised
- staging admin compromised
- CI cloud role compromised
- one access key leaked
- public bucket misconfig
- DB deleted
- KMS disabled
- region unavailable
- security group widened
- audit logging disabled

Trace blast radius for each scenario.

## 89. FINAL QUALITY GATE

- account/project boundaries
- human IAM
- workload IAM
- privilege escalation permissions
- public exposure
- IPv6
- storage
- KMS
- secrets
- metadata/workload identity
- DB/cache/queue
- logging
- backup
- DNS
- region/AZ
- quotas
- cost
- IaC drift

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

If cloud provider/config is not verified:

**CLOUD CONFIGURATION NOT VERIFIED.**
