---
id: UPL-IT-047
number: 47
slug: cloud-infrastructure-audit
title: Cloud Infrastructure Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.0.1
status: stable
---

# CLOUD INFRASTRUCTURE AUDIT

Želim kompletan cloud infrastructure audit bez obzira da li je AWS, Azure, GCP, Oracle, Hetzner, DigitalOcean ili kombinacija.

Glavni cilj:

> Pronaći realne cloud failure i compromise puteve kroz IAM, public exposure, networking, storage, compute, managed databases, secrets, backups, logging, regions, quotas i cross-account/project trust.

## 1. CLOUD INVENTORY

Inventariši:

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

Prod i staging u istom account/project-u?

Nije automatski problem, ali blast radius veći.

## 3. ROOT/OWNER ACCOUNT

Audituj protection i normal use.

## 4. HUMAN IAM

Ko ima:

- admin

- billing

- IAM

- production write

## 5. SERVICE IAM

App identity permissions.

## 6. LEAST PRIVILEGE

Ne samo policy size, nego realne actions/resources.

## 7. WILDCARD

```text

Action: *

Resource: *

```

High-value.

## 8. PRIVILEGE ESCALATION IAM

Traži kombinacije koje omogućavaju actor-u da sebi podigne privilegije:

- create/update role

- attach policy

- pass role

- create service account key

- modify function/job role

provider-specific.

## 9. PASS ROLE

Veoma high-value.

## 10. SERVICE ACCOUNT KEY

Long-lived credential.

## 11. WORKLOAD IDENTITY

Short-lived model gde provider podržava.

## 12. CROSS-ACCOUNT TRUST

Ko može assume role?

## 13. WILDCARD PRINCIPAL

Critical review.

## 14. OIDC CI TRUST

Repo/branch/environment restrictions.

## 15. PUBLIC COMPUTE

Inventariši public IPs.

## 16. SECURITY GROUP/FIREWALL

Koji ports su `0.0.0.0/0` i `::/0`.

## 17. SSH/RDP

Public management access.

## 18. DATABASE PUBLIC

Authentication + TLS + firewall + actual need.

## 19. CACHE PUBLIC

High-risk.

## 20. PRIVATE SUBNET

Ne znači automatski safe ako compromised app može reach.

## 21. EGRESS

Post-compromise/SSRF blast radius.

## 22. NAT

Availability/port capacity.

## 23. VPC PEERING

Lateral movement.

## 24. TRANSITIVE ROUTING ASSUMPTIONS

Proveri provider semantics.

## 25. PRIVATE ENDPOINT

Secrets/storage/DB.

## 26. DNS

Private/public split.

## 27. STORAGE BUCKET

- public access

- ACL

- policy

- listing

- versioning

- lifecycle

## 28. PUBLIC ACCESS BLOCK

Ako provider ima account-level guard.

## 29. PRESIGNED URL

Scope/expiry.

## 30. STATIC WEBSITE

Bucket website može expose-ovati content.

## 31. STORAGE ENCRYPTION

Provider-managed default može biti dovoljan.

Ne zahtevaj customer-managed key bez razlogа.

## 32. KMS

Ako customer-managed:

ko može:

- decrypt

- encrypt

- modify key policy

- disable/delete key

## 33. KMS SINGLE POINT

Key deletion/disable može učiniti backup/data unreadable.

## 34. SECRET MANAGER

Ko može list/read/update secrets?

## 35. SECRET VERSION

Rotation.

## 36. COMPUTE METADATA

SSRF path prema platformi.

## 37. INSTANCE ROLE

Ako web app kompromitovan:

koje cloud privilegije dobija?

## 38. VM IMAGE

Patch/EOL.

## 39. DISK SNAPSHOT

Može sadržati secrets/data.

## 40. SNAPSHOT PUBLIC/SHARED

Critical.

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

App ne treba default superuser ako nije potrebno.

## 43. DATABASE DELETE PROTECTION

Useful for critical prod DB.

## 44. BACKUP RETENTION

## 45. BACKUP ACCOUNT

Separate failure/permission domain gde high-value.

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

Function role permissions.

## 49. FUNCTION URL

Public?

## 50. ENV SECRETS

Logs/config exposure.

## 51. CONTAINER SERVICE

Task/pod identity.

## 52. REGISTRY

Push/pull permissions.

## 53. MUTABLE TAG

Supply chain.

## 54. REGISTRY PUBLIC

Private image leak.

## 55. LOGGING

Cloud audit logs:

- IAM

- resource changes

- data-plane where needed

## 56. AUDIT LOG DISABLE

Ko može ugasiti logging?

## 57. LOG STORAGE

Actor ne bi idealno trebalo lako da briše sopstvene tragove za high-assurance systems.

## 58. ALERTING

- root/admin use

- policy changes

- public bucket

- security group broadening

- key deletion

- unusual deploy

## 59. COST

Unbounded:

- serverless

- bandwidth

- AI

- storage

- logs

## 60. BUDGET

Detection, ne prevention.

## 61. QUOTAS

Hidden availability boundary.

## 62. REGION

Actual resources po regionu.

## 63. AZ

HA claims.

## 64. MULTI-AZ DB

Configured tier.

## 65. MULTI-REGION

Ne zahtevaj bez business requirement-a.

## 66. CONTROL PLANE OUTAGE

Managed services mogu imati regional limitations.

## 67. DNS PROVIDER

Single point.

## 68. CERTIFICATE

Managed renewal.

## 69. DOMAIN OWNERSHIP

Critical asset.

## 70. CDN

Origin bypass.

## 71. WAF

Defense-in-depth.

## 72. DDoS

Provider baseline + application cost amplification.

## 73. IaC

Actual config vs deployed config.

## 74. DRIFT

Manual cloud edits.

## 75. DESTROY

IaC accidental deletion.

## 76. STATE

Terraform state secret exposure.

## 77. PROD PROTECTION

Prevent destroy where appropriate.

## 78. LABEL/TAGS

Ownership/cost, lower security priority.

## 79. ORPHAN RESOURCE

Old bucket/IP/load balancer/domain.

## 80. DANGLING DNS

Subdomain takeover path.

## 81. UNUSED CREDENTIAL

Remove unnecessary blast radius.

## 82. OLD SNAPSHOT

Sensitive data retention.

## 83. CROSS-ENV SHARING

- DB

- bucket

- KMS

- secrets

- VPC

## 84. ATTACK PATH

Za svaki compromised app credential:

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

## 87. MATRICE

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

Pretpostavi:

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

Za svaki prati blast radius.

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

# KONAČNO PRAVILO

Tražim:

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

ili:

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

Ako cloud provider/config nije potvrđen:

**CLOUD CONFIGURATION NOT VERIFIED.**
