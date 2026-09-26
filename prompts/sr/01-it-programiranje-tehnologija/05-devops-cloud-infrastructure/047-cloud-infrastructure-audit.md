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
version: 1.1.0
status: stable
---

# CLOUD INFRASTRUCTURE AUDIT

Želim kompletan cloud infrastructure audit bez obzira da li je AWS, Azure, GCP, Oracle, Hetzner, DigitalOcean ili kombinacija.

Glavni cilj:

> Pronaći realne cloud failure i compromise puteve kroz IAM, public exposure, networking, storage, compute, managed databases, secrets, backups, logging, regions, quotas i cross-account/project trust.

## 1. NON-GOALS

- zahtevanje više regiona, više cloud-ova ili konkretnog landing-zone dizajna bez poslovnog zahteva
- bodovanje po compliance checklist-i (CIS, SOC 2) kao zamena za konkretne putanje kompromitovanja i otkaza
- pregled koda aplikacije van cloud dozvola i mrežnih putanja koje koristi
- pregled Kubernetes objekata (to pokriva zaseban Kubernetes audit); ovde pripadaju samo cloud identiteti i mreže oko klastera

## 2. CONTEXT DISCOVERY

Prvo utvrdi:

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

Nazivi IAM akcija, metadata endpoint-i, primitivi za eskalaciju, podrazumevana enkripcija i ponašanje kvota zavise od provajdera i menjaju se vremenom. Proveri trenutno ponašanje konkretnog provajdera pre nego što ga navedeš.

## 3. EVIDENCE MODEL

```text
A - observed: live configuration export, policy simulator result, access analyzer output or a safe test shows the path
B - complete path: effective policies, trust policies, network rules and resource policies fully show the path
C - strong static evidence: IaC shows the path, but drift, organization guardrails or console changes are not verified
D - inference: plausible path that depends on provider semantics or configuration not seen
E - hardening: stronger control without a current compromise or failure path
```

IaC je dokaz namere, a ne stvarnog stanja; uzmi u obzir drift pre nego što nalaz označiš kao CONFIRMED.

## 4. FINDING STATUS

- **CONFIRMED** - dokaz tier A ili B pokazuje konkretnu putanju kompromitovanja, izlaganja ili otkaza.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od stvarnog stanja, organizacionih guardrail-a ili semantike provajdera koji nisu mogli da se provere.
- **NOT APPLICABLE** - servis ili obrazac se ne koristi.
- **CONTROLLED** - putanja postoji, ali je guardrail, granica ili detekcija ograničava.
- **HARDENING** - arhitektonsko poboljšanje bez trenutne putanje (P4).

Drži odvojeno **potvrđeni cloud rizik** (principal, mrežnu putanju ili podešavanje resursa koje omogućava konkretno kompromitovanje ili gubitak) od preporuke za **arhitektonski hardening** (odvojeni nalozi, više regiona, privatni endpoint-i). Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja exploit-a, izlaganja podataka, gubitka podataka ili nedostupnosti.

## 5. FALSE-POSITIVE RULES

Sledeće samo po sebi **nije** nalaz:

- Javna IP adresa ili javni load balancer nisu ranjivost; pitanje je šta je na njima dostupno i koja autentikacija to štiti.
- Široka managed politika na break-glass ili administrativnoj ulozi koju koristi mala grupa uz audit je očekivana; prijavi je samo ako se rutinski koristi, deli ili je dostupna workload-ima.
- Production i staging u jednom nalogu su pitanje blast radius-a (HARDENING), a ne potvrđeni rizik, osim ako postoji konkretna putanja između okruženja.
- Jedan region je prihvatljiv kada navedeni zahtevi za oporavak to dozvoljavaju.
- Podrazumevana enkripcija sa ključevima kojima upravlja provajder nije nalaz osim ako zahtev traži customer-managed ključeve ili razdvajanje ključeva.
- Dozvola koja izgleda opasno može biti neutralisana uslovima, permission boundary-jima ili organizacionim politikama; proveri ih pre prijave.

## 6. CLOUD INVENTORY

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

## 7. ACCOUNT BOUNDARY

Prod i staging u istom account/project-u?

Nije automatski problem, ali blast radius veći.

## 8. ACCOUNT / PROJECT BOUNDARY MAP

Nacrtaj granice pre nego što proceniš bilo koji pojedinačni resurs:

```text
Organization / root
  -> account/project: purpose, environment, owner
     -> trusts: which external principals can assume roles here
     -> trusted by: which other accounts this one can act in
     -> shared resources: networks, keys, buckets, registries, DNS zones
```

Svaka ivica poverenja i svaki deljeni resurs su putanja kojom kompromitovanje u jednoj granici stiže do druge.

## 9. ROOT/OWNER ACCOUNT

Audituj protection i normal use.

## 10. HUMAN IAM

Ko ima:

- admin

- billing

- IAM

- production write

## 11. SERVICE IAM

App identity permissions.

## 12. LEAST PRIVILEGE

Ne samo policy size, nego realne actions/resources.

## 13. WILDCARD

```text
Action: *
Resource: *
```

High-value.

## 14. IDENTITY GRAPH

Napravi graf ko može da deluje kao ko:

```text
nodes: humans, groups, CI identities, workload identities, service accounts, roles, external accounts
edges: can assume / can impersonate / can create key for / can attach to workload / federated from
```

Za svaki workload i CI identitet zabeleži efektivne dozvole posle uslova, boundary-ja i organizacionih politika. Graf odgovara na pitanje: počevši od kompromitovanog web servera, CI posla ili procurelog ključa, do kojih identiteta može da se stigne?

## 15. PRIVILEGE ESCALATION IAM

Traži kombinacije koje omogućavaju actor-u da sebi podigne privilegije:

- create/update role

- attach policy

- pass role

- create service account key

- modify function/job role

provider-specific.

## 16. PASS ROLE

Veoma high-value.

## 17. PRIVILEGE ESCALATION GRAPH

Za svaki identitet u grafu pitaj:

> Da li ovaj identitet može da izmeni drugi identitet ili da pokrene ili izmeni workload koji radi sa više privilegija?

Primitivi za eskalaciju (nazivi se razlikuju po provajderu, proveri trenutni skup):

- kreiranje ili izmena uloga, politika, binding-a ili trust politika
- kreiranje ključeva ili tokena za drugi service account
- dodeljivanje privilegovanije uloge novom ili postojećem compute-u, funkciji, poslu ili container task-u
- izmena koda ili konfiguracije workload-a koji već ima više privilegija (kod funkcije, startup skripte, container image, CI pipeline sa deploy ulogom)
- upis u skladište ili registry iz kog privilegovaniji workload izvršava kod

Prijavi svaku eskalaciju kao putanju od početnog identiteta do stečene privilegije.

## 18. SERVICE ACCOUNT KEY

Long-lived credential.

## 19. WORKLOAD IDENTITY

Short-lived model gde provider podržava.

## 20. CROSS-ACCOUNT TRUST

Ko može assume role?

## 21. WILDCARD PRINCIPAL

Critical review.

## 22. OIDC CI TRUST

Repo/branch/environment restrictions.

## 23. PUBLIC COMPUTE

Inventariši public IPs.

## 24. SECURITY GROUP/FIREWALL

Koji ports su `0.0.0.0/0` i `::/0`.

## 25. SSH/RDP

Public management access.

## 26. DATABASE PUBLIC

Authentication + TLS + firewall + actual need.

## 27. CACHE PUBLIC

High-risk.

## 28. PRIVATE SUBNET

Ne znači automatski safe ako compromised app može reach.

## 29. EGRESS

Post-compromise/SSRF blast radius.

## 30. NAT

Availability/port capacity.

## 31. VPC PEERING

Lateral movement.

## 32. TRANSITIVE ROUTING ASSUMPTIONS

Proveri provider semantics.

## 33. PRIVATE ENDPOINT

Secrets/storage/DB.

## 34. NETWORK REACHABILITY

Dokaži dostupnost korak po korak umesto da čitaš jedno pravilo izolovano:

```text
source (internet, peer network, other environment, workload)
-> route (route table, peering, transit, VPN, private endpoint)
-> filter (network ACL, firewall, security group, IPv4 and IPv6)
-> service (listening port, load balancer, managed endpoint)
-> identity (authentication and authorization at the service)
```

Putanja je izložena samo ako je svaki korak dozvoljava. Otvorena security grupa iza privatnog subnet-a bez rute nije izloženost internetu; privatna baza sa javnim snapshot-om jeste.

## 35. DNS

Private/public split.

## 36. STORAGE BUCKET

- public access

- ACL

- policy

- listing

- versioning

- lifecycle

## 37. PUBLIC ACCESS BLOCK

Ako provider ima account-level guard.

## 38. PRESIGNED URL

Scope/expiry.

## 39. STATIC WEBSITE

Bucket website može expose-ovati content.

## 40. STORAGE ENCRYPTION

Provider-managed default može biti dovoljan.

Ne zahtevaj customer-managed key bez razlogа.

## 41. KMS

Ako customer-managed:

ko može:

- decrypt

- encrypt

- modify key policy

- disable/delete key

## 42. KMS SINGLE POINT

Key deletion/disable može učiniti backup/data unreadable.

## 43. KEY MANAGEMENT FAILURE

Za svaki ključ koji štiti važne podatke utvrdi:

- ko može da onemogući ključ, zakaže njegovo brisanje ili promeni njegovu politiku
- šta se dešava sa servisima koji rade, backup-ima i replikama ako ključ postane nedostupan
- da li backup-i u drugom nalogu ili regionu zavise od ključa u primarnom nalogu
- da li brisanje ključa ima period čekanja i da li se nadgleda

Napadač ili greška koji onemoguće ključ mogu da učine podatke nečitljivim bez njihovog brisanja.

## 44. SECRET MANAGER

Ko može list/read/update secrets?

## 45. SECRET VERSION

Rotation.

## 46. COMPUTE METADATA

SSRF path prema platformi.

## 47. INSTANCE ROLE

Ako web app kompromitovan:

koje cloud privilegije dobija?

## 48. SSRF AND METADATA PIVOT

Za svaki workload koji šalje odlazne zahteve na osnovu korisničkog ulaza (webhook-ovi, preuzimanje URL-ova, obrada slika, PDF renderer-i):

```text
SSRF -> metadata or credential endpoint -> workload credentials -> cloud API -> reachable resources
```

Proveri zaštite specifične za provajdera (verzija metadata servisa i obavezni header-i, hop limiti, audience tokena za workload identity) i egress kontrole. Uticaj je jednak efektivnim dozvolama workload identiteta; prati ih kroz identity graph.

## 49. VM IMAGE

Patch/EOL.

## 50. DISK SNAPSHOT

Može sadržati secrets/data.

## 51. SNAPSHOT PUBLIC/SHARED

Critical.

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

App ne treba default superuser ako nije potrebno.

## 54. DATABASE DELETE PROTECTION

Useful for critical prod DB.

## 55. BACKUP RETENTION

## 56. BACKUP ACCOUNT

Separate failure/permission domain gde high-value.

## 57. BACKUP FAILURE DOMAIN

Backup štiti od otkaza samo ako ne deli taj failure domain. Za svako kritično skladište proveri da li backup-i dele sa production-om:

- nalog ili projekat (jedan kompromitovan admin briše oba)
- region (jedan regionalni ispad pogađa oba)
- ključ za enkripciju (jedan onemogućen ključ čini oba nečitljivim)
- putanju brisanja (ista automatizacija ili lifecycle pravilo može da ukloni oba)

Proveri i nepromenljivost ili zaštitu od brisanja i da li je restore ikada testiran.

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

Function role permissions.

## 61. FUNCTION URL

Public?

## 62. ENV SECRETS

Logs/config exposure.

## 63. CONTAINER SERVICE

Task/pod identity.

## 64. REGISTRY

Push/pull permissions.

## 65. MUTABLE TAG

Supply chain.

## 66. REGISTRY PUBLIC

Private image leak.

## 67. LOGGING

Cloud audit logs:

- IAM

- resource changes

- data-plane where needed

## 68. AUDIT LOG DISABLE

Ko može ugasiti logging?

## 69. LOG STORAGE

Actor ne bi idealno trebalo lako da briše sopstvene tragove za high-assurance systems.

## 70. ALERTING

- root/admin use

- policy changes

- public bucket

- security group broadening

- key deletion

- unusual deploy

## 71. COST

Unbounded:

- serverless

- bandwidth

- AI

- storage

- logs

## 72. BUDGET

Detection, ne prevention.

## 73. QUOTAS

Hidden availability boundary.

## 74. QUOTA EXHAUSTION AND COST AMPLIFICATION

- Koje kvote (instance, IP adrese, API rate limiti, konkurentne funkcije) bi blokirale skaliranje ili oporavak tokom incidenta i da li neko dobija alert pre nego što se dostignu?
- Da li jedno okruženje ili tenant može da potroši deljenu kvotu i izgladni production?
- Koje putanje omogućavaju spoljnom saobraćaju ili kompromitovanom kredencijalu da brzo naprave trošak (pokretanje compute-a, egress, obim logova, serverless pozivi) i koji limiti ili alert-i to zaustavljaju?

Proveri trenutne kvote i cene kod provajdera; ne navodi zapamćene vrednosti.

## 75. REGION

Actual resources po regionu.

## 76. AZ

HA claims.

## 77. MULTI-AZ DB

Configured tier.

## 78. MULTI-REGION

Ne zahtevaj bez business requirement-a.

## 79. CONTROL PLANE OUTAGE

Managed services mogu imati regional limitations.

## 80. FAILURE DOMAIN CLAIMS

Za svaku tvrdnju o dostupnosti ("multi-AZ", "highly available", "može da uradi failover") proveri dokaz:

- da li su svi slojevi (load balancer, compute, baza, cache, red, NAT) zaista raspoređeni ili jedna komponenta u jednoj zoni obara tvrdnju?
- da li failover zahteva operacije control plane-a koje mogu biti nedostupne tokom istog ispada?
- da li postoji kapacitet u preostalim zonama ili regionu da primi opterećenje?
- da li je failover ikada izveden?

Tvrdnja bez ovoga je **NOT VERIFIED**, a ne potvrđena.

## 81. DNS PROVIDER

Single point.

## 82. CERTIFICATE

Managed renewal.

## 83. DOMAIN OWNERSHIP

Critical asset.

## 84. CDN

Origin bypass.

## 85. WAF

Defense-in-depth.

## 86. DDoS

Provider baseline + application cost amplification.

## 87. IaC

Actual config vs deployed config.

## 88. DRIFT

Manual cloud edits.

## 89. DESTROY

IaC accidental deletion.

## 90. STATE

Terraform state secret exposure.

## 91. PROD PROTECTION

Prevent destroy where appropriate.

## 92. LABEL/TAGS

Ownership/cost, lower security priority.

## 93. ORPHAN RESOURCE

Old bucket/IP/load balancer/domain.

## 94. DANGLING DNS

Subdomain takeover path.

## 95. DANGLING DNS AND ORPHANED RESOURCES

Za svaki DNS zapis koji pokazuje na cloud resurs (storage endpoint, CDN, load balancer, IP adresu, hostname platforme) potvrdi da cilj i dalje postoji i da je u tvom vlasništvu. Zapis koji pokazuje na oslobođenu IP adresu, obrisan bucket ili nepreuzet hostname platforme može da preuzme neko drugi i da servira sadržaj pod tvojim domenom, uključujući cookies ograničene na roditeljski domen.

Navedi i napuštene resurse (nepovezani diskovi, stari snapshot-i, zaboravljene instance, nekorišćeni ključevi) koji i dalje drže podatke ili kredencijale.

## 96. UNUSED CREDENTIAL

Remove unnecessary blast radius.

## 97. OLD SNAPSHOT

Sensitive data retention.

## 98. CROSS-ENV SHARING

- DB

- bucket

- KMS

- secrets

- VPC

## 99. CROSS-ENVIRONMENT BLAST RADIUS

Za svaki deljeni resurs ili poverenje između okruženja prati jedan korak:

```text
compromise or mistake in staging/dev
-> shared network, key, bucket, registry, CI role or credential
-> production resource affected
```

Prijavi konkretnu putanju, a ne samu činjenicu deljenja.

## 100. ATTACK PATH

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

- **P0** - putanja dostupna sa interneta do preuzimanja naloga, izlaganja production podataka ili destruktivnog pristupa (javni osetljivi podaci, procureo admin kredencijal, eskalacija sa izloženog workload-a do admina).
- **P1** - putanja eskalacije ili između okruženja sa verovatnog uporišta (kompromitovan workload, CI posao, staging), ili jedna akcija koja može da uništi production podatke i njihove backup-e.
- **P2** - značajne slabosti: preprivilegovani workload-i bez poznate eskalacije, backup-i koji dele failure domain, netestiran failover iza tvrdnje o dostupnosti, nedostajući audit logovi za kritične akcije.
- **P3** - ograničeni problemi: zastareli kredencijali uskog opsega, napušteni resursi bez osetljivih podataka, nedostajući alert-i za trošak.
- **P4** - arhitektonski hardening: razdvajanje naloga, privatni endpoint-i, customer-managed ključevi, gde ne postoji trenutna putanja.

## 104. OUTPUT

`CLOUD_INFRASTRUCTURE_AUDIT.md`

## 105. SECOND PASS

Pretpostavi redom svako uporište i prati blast radius kroz identity graph i mrežne putanje:

- kompromitovana VM, container ili funkcija aplikacije (uključujući preko SSRF-a)
- kompromitovan staging administrator
- kompromitovana CI cloud uloga
- procureo jedan access key
- pogrešno podešen javni bucket ili snapshot
- obrisana production baza
- onemogućen ključ za enkripciju ili zakazan za brisanje
- nedostupan region ili zona
- security grupa greškom proširena
- onemogućeni audit logovi

Zatim pokušaj da opovrgneš svaki nalaz: da li organizacione politike, permission boundary-ji, uslovi, politike resursa ili nedostajuće rute blokiraju putanju? Da li je IaC dokaz i dalje tačan u stvarnom nalogu? Spusti na **NOT VERIFIED** ili **CONTROLLED** gde ga blokiraju ili gde ne možeš da ih vidiš.

## 106. FINAL QUALITY GATE

Pre vraćanja izveštaja proveri da pokriva:

- mapu granica naloga/projekata sa ivicama poverenja i deljenim resursima
- ljudske, CI i workload identitete sa efektivnim dozvolama
- putanje eskalacije privilegija, navedene kao početni identitet -> stečena privilegija
- mrežnu dostupnost dokazanu korak po korak, IPv4 i IPv6
- izloženost skladišta, snapshot-a i registry-ja
- SSRF i metadata pivot za svaki workload koji preuzima spoljne resurse
- otkaz upravljanja ključevima i ko može da onemogući ključeve
- čuvanje i rotaciju secrets-a
- skladišta podataka: backup, PITR, zaštitu od brisanja, failure domain backup-a, test restore-a
- logovanje i alert-e za kritične akcije control plane-a
- DNS, sertifikate i dangling zapise
- tvrdnje o dostupnosti u odnosu na stvarne failure domain-e
- kvote i uvećanje troška, proverene za trenutnog provajdera
- IaC drift i resurse napravljene van IaC-a
- blast radius između okruženja
- da je svaki nalaz klasifikovan kao potvrđeni cloud rizik ili arhitektonski hardening, sa statusom i evidence tier-om

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

Drugi failure chain-ovi koje tražim:

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

Ako cloud provider/config nije potvrđen:

**CLOUD CONFIGURATION NOT VERIFIED.**
