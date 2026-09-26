---
id: UPL-IT-050
number: 50
slug: backup-disaster-recovery-and-rollback-audit
title: Backup, Disaster Recovery & Rollback Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: DevOps, cloud i infrastruktura
subcategory_id: devops-cloud-infrastructure
language: sr
version: 1.1.0
status: stable
---

# BACKUP, DISASTER RECOVERY AND ROLLBACK AUDIT

Želim ultimativni forensic audit backup-a, restore-a, disaster recovery-ja i rollback mogućnosti kompletnog sistema.

Glavni cilj:

> Utvrditi da li se sistem zaista može oporaviti od data deletion-a, corruption-a, ransomware/admin compromise-a, bad migration-a, broken deploy-a, region/provider failure-a, secret loss-a i infrastructure destruction-a, umesto da se samo pretpostavlja da "backup postoji".

Najvažnije pravilo:

> Backup koji nikada nije restore-ovan nije dokaz recoverability-ja.

## 1. INVENTARIŠI CRITICAL STATE

- primary database
- object/file storage
- user uploads
- configs
- secrets
- encryption keys
- queue state
- search index
- analytics
- source artifacts
- deployment artifacts
- DNS/IaC state

## 2. KLASIFIKUJ

Za svaki:

```text
Authoritative:
Rebuildable:
Backup required:
Recovery method:
```

## 3. DATABASE BACKUP

Proveri:

- full backup
- incremental
- WAL/binlog
- snapshots
- PITR

## 4. FREQUENCY

Ne izmišljaj expected RPO.

Ako nema requirement:

**RPO NOT DEFINED**

## 5. RETENTION

Koliko daleko unazad možemo?

## 6. CORRUPTION WINDOW

Ako corruption stoji 30 dana, a retention 7:

backup ne pomaže.

## 7. PITR

Granularity i retention.

## 8. RESTORE TEST

Kada je poslednji put stvarno urađen?

## 9. RESTORE IN ISOLATION

Ne restore-uj preko production-a kao test.

## 10. DATA VALIDATION

Restore command uspešan nije dovoljno.

Proveri:

- tables
- row counts
- constraints
- application login
- critical reads/writes

## 11. ENCRYPTED BACKUP

Gde je encryption key?

## 12. LOST KEY

Encrypted backup bez key-a je neupotrebljiv.

## 13. KEY BACKUP

Ali key ne sme biti nezaštićeno uz backup.

## 14. ACCESS

Ko može read backup?

## 15. DELETE

Ko može delete backup?

## 16. SAME CREDENTIAL

Ako jedan compromised admin credential može obrisati:

```text
production
+
all backups
```

blast radius je catastrophic.

## 17. IMMUTABILITY

Object lock/WORM gde justified.

## 18. SEPARATE ACCOUNT/PROJECT

Za critical backup threat model.

Ne zahtevaj svuda.

## 19. OFFSITE

Same physical/provider failure domain.

## 20. CROSS-REGION

Samo ako regional disaster requirement postoji.

## 21. FILE STORAGE

DB backup ne uključuje uploads automatski.

## 22. OBJECT STORAGE VERSIONING

Recovery from overwrite/delete.

## 23. LIFECYCLE

Version expiration.

## 24. CDN

Nije backup.

## 25. CACHE

Ako disposable, rebuild.

Ako authoritative state, backup/recovery problem.

## 26. REDIS

Sessions/queues/locks vs durable business data.

## 27. QUEUE

Da li gubitak queue messages znači business data loss?

## 28. DLQ

Nije backup.

## 29. SEARCH INDEX

Može li se rebuild-ovati iz DB-a?

## 30. ANALYTICS

Da li je critical?

## 31. SECRET MANAGER

Kako oporaviti:

- deleted secret
- rotated key
- lost encryption key

## 32. SIGNING KEY

Loss može logoutovati users ili potpuno slomiti verification.

## 33. PRIVATE TLS KEY

Certificate reissue.

## 34. CODE SIGNING KEY

Loss/compromise plan.

## 35. IaC STATE

Terraform state backup/versioning.

## 36. IaC SOURCE

Može rebuild infrastructure, ali ne data.

## 37. DNS

Zone export/configuration.

## 38. DEPLOYMENT ARTIFACT

Prethodni production artifact.

## 39. REGISTRY RETENTION

Rollback image nije obrisan.

## 40. PACKAGE ARTIFACT

Desktop/mobile release.

## 41. DATABASE MIGRATION

Backup pre destructive migration nije dovoljno ako restore traje 12h a business RTO 15min.

## 42. FORWARD FIX VS RESTORE

Ponekad restore pravi veći gubitak novih podataka.

## 43. SELECTIVE RESTORE

Can recover one tenant/table/object?

## 44. FULL RESTORE

Whole system.

## 45. LOGICAL BACKUP

Useful for granular recovery.

## 46. PHYSICAL SNAPSHOT

Fast but coarse/provider-dependent.

## 47. CONSISTENCY

Multiple stores:

```text
DB
+
object storage
```

backup timestamps mogu biti inconsistent.

## 48. APPLICATION-CONSISTENT BACKUP

Ako required.

## 49. TRANSACTIONAL LINK

DB record references object version.

## 50. PARTIAL RESTORE

DB restored to yesterday, object store current.

## 51. CROSS-SYSTEM RPO

Najsporiji/retention-limited state određuje actual recovery.

## 52. DISASTER SCENARIOS

Modeluj posebno:

- accidental delete
- malicious delete
- corruption
- bad migration
- broken deploy
- ransomware/admin compromise
- provider outage
- region outage
- account lockout
- secret compromise
- key loss

## 53. ACCIDENTAL DELETE

Najčešći realan recovery scenario.

## 54. SOFT DELETE

Nije backup.

## 55. MALICIOUS DELETE

Attacker može obrisati soft-deleted rows.

## 56. BAD SCRIPT

Bulk update corruption.

## 57. BUG CORRUPTION

Backup posle bug-a može sadržati corrupted data.

## 58. DETECTION TIME

Koliko brzo se corruption otkriva?

## 59. BACKUP RETENTION > DETECTION WINDOW

Ako ne, recovery gap.

## 60. RANSOMWARE/CLOUD ADMIN

Assume production credentials fully compromised.

## 61. BACKUP CREDENTIAL SEPARATION

Can attacker reach backup plane?

## 62. PROVIDER ACCOUNT LOSS

Can organization recover access?

Operational/business continuity.

## 63. REGION LOSS

Samo ako relevantan disaster target.

## 64. MULTI-REGION DATA

Replication nije backup.

## 65. REPLICATION

Corruption/delete može replicirati odmah.

## 66. HA ≠ BACKUP

Veoma važno.

## 67. BACKUP ≠ HA

Isto.

## 68. DR ≠ ROLLBACK

Razdvoji.

## 69. APPLICATION ROLLBACK

Previous artifact.

## 70. DATABASE ROLLBACK

Often impossible after destructive schema changes.

## 71. CONFIG ROLLBACK

Old config version.

## 72. SECRET ROLLBACK

Ne vraćaj compromised secret.

## 73. INFRA ROLLBACK

IaC previous state.

## 74. FEATURE FLAG

May avoid full rollback.

## 75. DEPLOYMENT ROLLBACK

Testiraj.

## 76. ROLLBACK AFTER MIGRATION

Critical.

## 77. ROLLBACK AFTER NEW DATA FORMAT

Old app možda ne ume da pročita data koju je new app već napisala.

## 78. FORWARD COMPATIBILITY

## 79. QUEUE ROLLBACK

Old worker reading new messages.

## 80. CACHE ROLLBACK

Serialized format.

## 81. RESTORE DURATION

Measure, not guess.

## 82. RTO

If undefined:

**RTO NOT DEFINED**

## 83. RESTORE BOTTLENECK

- download
- decompression
- DB import
- object restore
- DNS
- validation

## 84. COLD STORAGE

Retrieval delay.

## 85. LARGE DB

Restore time grows.

## 86. PARALLEL RESTORE

Potential optimization, not assumption.

## 87. RUNBOOK

Precise steps.

## 88. OWNER

Who executes restore?

## 89. ACCESS DURING INCIDENT

Do responders still have credentials if primary IAM/provider impaired?

## 90. BREAK-GLASS

For critical recovery.

## 91. CONTACTS

Provider escalation where applicable.

## 92. EVIDENCE PRESERVATION

Incident restore ne treba automatski uništiti forensic evidence.

## 93. CLEAN RESTORE

If attacker persistence may exist, restoring compromised app image/config can reintroduce attacker.

## 94. SECRET ROTATION AFTER RESTORE

If compromise.

## 95. DR EXERCISE

Tabletop vs actual technical restore.

## 96. TABLETOP

Useful but not proof of technical recovery.

## 97. GAME DAY

Controlled disaster simulation.

## 98. RESTORE AUTOMATION

Can reduce human error.

## 99. AUTOMATION BUG

Automation itself must be tested.

## 100. BACKUP MONITORING

Alert on:

- failed backup
- stale backup
- size anomaly
- PITR disabled
- replication issue

## 101. "SUCCESS" CHECK

Backup job 0 bytes can technically "succeed" if validation absent.

## 102. SIZE TREND

Useful anomaly signal.

## 103. RESTORE CHECKSUM

Integrity.

## 104. BACKUP CATALOG

Know what exists.

## 105. OWNERSHIP

Who owns each recovery domain?

## 106. DOCUMENTATION DRIFT

Runbook references old service/path/credential.

## 107. DEPENDENCY RESTORE

Third-party SaaS data may need export/backup.

## 108. EMAIL/CRM/EXTERNAL SYSTEM

Only if critical authoritative data lives there.

## 109. USER EXPORT

Not substitute for system backup.

## 110. LEGAL RETENTION

Do not make legal conclusions unless requirements supplied.

## 111. DATA DELETION REQUIREMENTS

Can conflict with long backup retention. Document requirement if known.

## 112. BACKUP SECURITY

Backups are often more valuable to attacker than live DB because concentrated/offline.

## 113. PASSWORD HASHES

Sensitive.

## 114. TOKENS

Old backup may contain still-valid API/refresh tokens.

## 115. SECRET ROTATION + OLD BACKUP

Restored old database may reintroduce old credentials/state.

## 116. RESTORE SANITIZATION

After old restore, verify compromised/revoked tokens remain revoked where intended.

## 117. USER PASSWORD CHANGE

PITR to before change could restore old password hash.

Security implications.

## 118. ACCOUNT DELETION

Restore may resurrect deleted users/data.

Business/privacy handling needs design.

## 119. AUDIT LOG

Restore should preserve/reconcile incident chronology.

## 120. ID GENERATORS

Rollback DB may cause IDs/sequences to collide with external records/events created later.

## 121. EXTERNAL SIDE EFFECTS

You cannot "restore" external emails/payments.

## 122. PAYMENT RECONCILIATION

Database restore could forget payments that provider processed.

## 123. WEBHOOK REPLAY

After restore, provider events may need reconciliation.

## 124. EVENT SOURCING

If used, recovery model differs.

## 125. THIRD-PARTY SOURCE OF TRUTH

Define authority.

## 126. DR MODE

Read-only degraded operation may be viable.

## 127. MAINTENANCE PAGE

Could preserve UX during restore.

## 128. DNS FAILOVER

If alternate environment exists.

## 129. COLD STANDBY

Cost vs RTO.

## 130. WARM STANDBY

## 131. HOT STANDBY

Do not recommend automatically.

## 132. REGION RESTORE

Can IaC + backups reconstruct?

## 133. ACCOUNT-LEVEL DISASTER

Separate org/account backup matters only for high-assurance threat.

## 134. SINGLE PROVIDER

Not automatically unacceptable.

## 135. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Asset:
Authoritative:
Failure scenario:
Backup mechanism:
Frequency:
Retention:
Restore tested:
Last known restore:
RPO requirement:
Actual estimated RPO:
RTO requirement:
Measured/estimated RTO:
Failure path:
Data loss:
Availability impact:
Security impact:
Evidence:
Root cause:
Remediation:
Restore verification:
```

## 136. SEVERITY

P0:
- critical data has no usable recovery and realistic catastrophic loss path exists
- backup encryption/key loss makes all recovery impossible
- one compromised credential can irreversibly destroy production + all backups and no secondary recovery exists

P1:
- backup exists but proven unusable
- actual RPO/RTO grossly violates explicit critical requirement
- rollback procedure can further corrupt/destroy production
- region/account failure has no recovery despite explicit DR requirement

P2:
- meaningful restore gap
- partial data class omitted
- stale/unverified runbook
- insufficient retention vs realistic corruption detection

P3:
- limited recovery weakness

P4:
- maturity/hardening

## 137. EVIDENCE

```text
A - successful/failed restore exercise or production incident evidence
B - complete backup/restore config and path
C - strong config evidence
D - inferred
E - maturity
```

## 138. STATUS AND FALSE POSITIVES

Status:

- **CONFIRMED** - dokaz tier A ili B pokazuje putanju otkaza ili exploit-a.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od runtime stanja, podešavanja ili verzija koji nisu mogli da se provere (tier D). Tier D nikada ne predstavljaj kao potvrđen.
- **NOT APPLICABLE** - komponenta ili obrazac se ne koriste.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

Mogućnost oporavka je CONFIRMED samo uz vežbu restore-a ili dokaz iz incidenta (tier A); kompletna konfiguracija (tier B) dokazuje da putanja backup-a postoji, a ne da restore radi u okviru RPO/RTO.

False-positive pravila:

- Jedan region ili jedan provajder nisu defekt kada navedeni zahtevi za oporavak ne traže više.
- Point-in-time recovery koji nedostaje je nalaz samo kada realan scenario oštećenja ili brisanja zahteva precizniju tačku restore-a od one koju obezbeđuju postojeći backup-i.
- Izvedeno stanje ili stanje koje može ponovo da se izgradi (cache, search indeksi, kopije za analitiku) ne zahteva backup ako su putanja ponovne izgradnje i njeno trajanje prihvatljivi.
- Zadržavanje kraće od compliance smernice je nalaz samo kada zahtev važi ili realno vreme otkrivanja prelazi to zadržavanje.
- Nepovratna migracija nije rollback defekt ako postoji testirana roll-forward putanja.

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza, exploit-a, greške u ispravnosti, pouzdanosti ili rada.

## 139. OUTPUT

`BACKUP_DISASTER_RECOVERY_ROLLBACK_AUDIT.md`

## 140. MATRICE

### Critical State Matrix

| State | Authoritative | Backup | PITR | Restore tested |
|---|---|---|---|---|

### Failure Matrix

| Disaster | Data affected | Recovery | RPO | RTO |
|---|---|---|---|---|

### Rollback Matrix

| Component | Previous version available | Data compatible | Rollback tested |
|---|---|---|---|

### Credential Separation

| Identity | Prod delete | Backup read | Backup delete | KMS |
|---|---|---|---|---|

## 141. SECOND PASS - RESTORE EXERCISES

Obavezno prođi:

### Scenario A
Accidental deletion jedne tabele/resource-a.

### Scenario B
Bad migration corrupts data.

### Scenario C
Production database fully lost.

### Scenario D
Object storage files deleted.

### Scenario E
Production cloud admin compromised.

### Scenario F
Backup encryption key unavailable.

### Scenario G
Latest backup corrupted.

### Scenario H
Need restore to 24h-old point.

### Scenario I
Application rollback after DB migration.

### Scenario J
Region/provider outage, ako je u scope-u.

Za svaki:

```text
Detection
↓
Decision
↓
Containment
↓
Restore
↓
Validation
↓
Traffic return
↓
Reconciliation
```

## 142. SECOND PASS - ACTUAL RESTORE

Ako postoji bezbedno izolovano test okruženje:

1. uzmi production-like backup
2. restore u praznu isolated environment
3. pokreni application
4. validiraj integrity
5. meri vreme
6. dokumentuj failures

Ne restore-uj preko production-a radi audita.

## 143. SECOND PASS - CREDENTIAL COMPROMISE

Pretpostavi da je attacker dobio production admin credential.

Pitaj:

> Može li istim credentialom obrisati backups, KMS key i audit logs?

## 144. SECOND PASS - LONG-LIVED CORRUPTION

Pretpostavi da bug kvari podatke 30 dana pre nego što ga primetimo.

Da li retention omogućava clean restore point?

## 145. SECOND PASS - ROLLBACK REALITY

Deployment:

```text
v1 -> migration -> v2
```

zatim probaj mentalno ili staging:

```text
v2 -> v1
```

Da li v1 i dalje razume:

- schema
- new rows
- enum values
- queue messages
- cache
- config

## 146. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svaki authoritative datastore
- files/object storage
- secrets/keys
- deployment artifacts
- backup location
- access/delete permissions
- PITR
- retention
- encryption key recovery
- tested restore
- measured/estimated restore time
- RPO/RTO requirements
- application validation posle restore-a
- cross-store consistency
- rollback posle migration-a
- queue/cache/client compatibility
- attacker/admin compromise
- backup monitoring
- runbook ownership
- external side-effect reconciliation

# KONAČNO PRAVILO

Ne želim:

> Radite backup svakog dana i čuvajte kopiju van sistema.

Tražim problem poput:

```text
database backup:
daily
↓
backup encrypted customer-managed key-em
↓
same cloud admin identity može:
delete DB
delete backups
schedule KMS key deletion
↓
admin credential compromised
↓
production + backups + decryption capability izgubljeni
↓
recovery impossible
```

ili:

```text
migration adds new enum values
↓
v2 writes new values
↓
deployment later fails
↓
team rolls back to v1
↓
v1 cannot deserialize new enum
↓
rollback deployment itself causes outage
```

ili:

```text
DB is restored to yesterday
↓
payment provider nije rollbackovan
↓
provider has 500 successful payments
↓
restored DB remembers only 450
↓
system may retry/reconcile incorrectly
↓
financial state divergence
```

Ako backup postoji, ali restore nikad nije potvrđen:

**RECOVERABILITY NOT VERIFIED.**

Ako RPO/RTO nisu definisani:

**REQUIREMENT NOT DEFINED.**

Ako postoji samo DR maturity improvement bez potvrđenog gap-a:

**P4 - HARDENING.**
