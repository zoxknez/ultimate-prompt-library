---
id: UPL-IT-060
number: 60
slug: etl-and-data-pipeline-reliability-audit
title: Audit pouzdanosti ETL-a i data pipeline-a
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.1.0
status: stable
---

# AUDIT POUZDANOSTI ETL-A I DATA PIPELINE-A

Želim maksimalno duboku analizu ETL, ingestion, sync, import/export i data pipeline sistema sa fokusom na correctness, idempotency, replay, ordering, schema evolution, lineage i recovery.

Glavni cilj:

> Utvrditi da li pipeline može tiho izgubiti, duplicirati, pogrešno transformisati, preskočiti, kasno obraditi ili pogrešnom tenant-u pripisati podatke, kao i da li se može bezbedno replay-ovati i oporaviti posle parcijalnog failure-a.

## 1. PIPELINE INVENTORY

Inventariši:

- source
- ingestion
- staging
- transform
- output
- schedule
- queue
- storage
- destination
- owner

Za svaki:

```text
Pipeline:
Source:
Trigger:
Input format:
Checkpoint:
Transform:
Destination:
Idempotency:
Retry:
DLQ:
Freshness SLA:
```

## 2. SOURCE OF TRUTH

Koji system je authoritative?

## 3. FULL LOAD

## 4. INCREMENTAL LOAD

## 5. CDC

## 6. POLLING

## 7. WEBHOOK

## 8. FILE IMPORT

## 9. SCHEDULE

Timezone.

## 10. WATERMARK

`updated_at`, sequence, cursor.

## 11. WATERMARK GAP

Using `>` may miss same-timestamp rows depending on strategy.

## 12. WATERMARK OVERLAP

Sa replay/dedup.

## 13. CLOCK

Source clock skew.

## 14. PAGINATION

Source data changes during pagination.

## 15. OFFSET

Can skip/duplicate under inserts/deletes.

## 16. CURSOR

Preferred where source supports stable cursor.

## 17. CHECKPOINT

When written?

Before or after destination commit?

## 18. EARLY CHECKPOINT

Can lose data.

## 19. LATE CHECKPOINT

Can duplicate data.

## 20. IDEMPOTENCY

Destination upsert/dedupe.

## 21. EVENT ID

Unique external ID.

## 22. DUPLICATE SOURCE

## 23. RETRY

At-least-once behavior.

## 24. EXACTLY ONCE

Do not claim casually.

Prove semantics.

## 25. OUT-OF-ORDER

Events.

## 26. LATE EVENT

Historical correction.

## 27. DELETE EVENT

How propagated?

## 28. TOMBSTONE

## 29. UPDATE

Full replacement vs partial patch.

## 30. SCHEMA EVOLUTION

Source adds field.

## 31. SOURCE REMOVES FIELD

## 32. TYPE CHANGE

## 33. ENUM VALUE

## 34. UNKNOWN FIELD

Forward compatibility.

## 35. REQUIRED FIELD

Old producer.

## 36. VERSIONED EVENT

## 37. DEAD LETTER

Messages that cannot parse.

## 38. DLQ MONITORING

DLQ that nobody watches equals slow data loss.

## 39. REPLAY

Can messages be replayed safely?

## 40. REPLAY RANGE

## 41. REPLAY ORDER

## 42. REPLAY SIDE EFFECT

Don't resend email/payment when rebuilding analytical data.

## 43. STAGING TABLE

Useful to separate raw ingest and transform.

## 44. RAW EVENT RETENTION

Can aid replay/debug.

## 45. LINEAGE

For output row, can we identify source?

## 46. TRANSFORMATION

Pure/deterministic?

## 47. NON-DETERMINISTIC

Current time/random/external lookup.

## 48. REPROCESS

Could produce different result.

## 49. REFERENCE DATA

Version used.

## 50. JOIN

Late/missing dimension.

## 51. TENANT MAPPING

Critical.

External account -> local tenant.

## 52. CROSS-TENANT MISROUTING

High severity.

## 53. ID COLLISION

External IDs only unique per source/account.

## 54. SOURCE ID NAMESPACE

Use composite identity.

## 55. PARTIAL FAILURE

Batch of 1000, row 500 fails.

## 56. ATOMIC BATCH

Maybe too expensive.

## 57. PER-ROW STATUS

## 58. POISON RECORD

Should not block entire pipeline forever unless required.

## 59. RETRY STORM

Persistent malformed record.

## 60. BACKOFF

## 61. RATE LIMIT

Source API.

## 62. QUOTA

## 63. PAGINATION RETRY

Retry same page may duplicate.

## 64. TOKEN EXPIRY

Long job.

## 65. NETWORK TIMEOUT

Unknown outcome.

## 66. DESTINATION TRANSACTION

## 67. BULK WRITE

## 68. UPSERT

Correct unique key.

## 69. DELETE + INSERT

Can create temporary absence.

## 70. MERGE

Engine-specific semantics.

## 71. DATA QUALITY

Checks:

- null rate
- duplicate rate
- range
- referential integrity
- row counts
- checksum

## 72. SILENT TRUNCATION

String/numeric.

## 73. ROUNDING

## 74. TIMEZONE

## 75. ENCODING

UTF-8/CSV.

## 76. CSV HEADER

Column reorder.

## 77. CSV FORMULA

If files later opened by humans.

## 78. JSON

Unknown nested shape.

## 79. XML

Parsing/security.

## 80. FILE NAMING

Do not use filename alone as authoritative date/source without validation.

## 81. PARTIAL FILE

Upload still in progress.

## 82. FILE ATOMICITY

Temporary name then rename.

## 83. DUPLICATE FILE

Hash/external ID.

## 84. LARGE FILE

Streaming.

## 85. MEMORY

Don't load whole 10 GB file.

## 86. BACKPRESSURE

Producer > consumer.

## 87. QUEUE DEPTH

## 88. OLDEST MESSAGE AGE

Better freshness signal than depth alone.

## 89. WORKER CONCURRENCY

Destination capacity.

## 90. PARALLEL PARTITIONS

Ordering.

## 91. PARTITION KEY

Same entity should preserve needed order.

## 92. HOT PARTITION

One tenant dominates.

## 93. REBALANCE

Consumer group.

## 94. LEASE

Expiration/duplicate work.

## 95. JOB LOCK

## 96. SCHEDULE OVERLAP

Previous ETL still running when next starts.

## 97. CONCURRENCY POLICY

Skip/queue/parallel according to semantics.

## 98. SLA/FRESHNESS

If not defined:

**FRESHNESS REQUIREMENT NOT DEFINED**

## 99. STALENESS

Pipeline "green" but data 12h old.

## 100. HEARTBEAT

## 101. ROW COUNT MONITOR

Sudden zero/10x.

## 102. SCHEMA MONITOR

## 103. QUALITY ALERT

## 104. OBSERVABILITY

Per batch:

- source range
- rows read
- rows accepted
- rows rejected
- rows written
- duplicates
- duration
- checkpoint

## 105. AUDIT

Critical sync history.

## 106. BACKFILL

Historical range.

## 107. BACKFILL + LIVE

Can race.

## 108. CUTOVER

## 109. NEW PIPELINE VERSION

Old/new transform consistency.

## 110. REPROCESS WITH NEW LOGIC

Historical values may intentionally change.

Document.

## 111. DATABASE MIGRATION

Destination schema compatibility.

## 112. SOURCE OUTAGE

Catch-up behavior.

## 113. DESTINATION OUTAGE

Buffer/retry.

## 114. STORAGE OUTAGE

## 115. DLQ OUTAGE

## 116. CREDENTIAL ROTATION

Long-running workers.

## 117. DISASTER RECOVERY

Can rebuild destination from raw/source?

## 118. SOURCE RETENTION

Maybe source events expire before recovery.

## 119. RPO

Data loss window.

## 120. RTO

Catch-up time.

## 121. RECONCILIATION

Periodically compare source/destination.

## 122. COUNT ONLY

Counts can match while rows differ.

## 123. CHECKSUM/PER-ID

For high-integrity pipeline.

## 124. GDPR/PII

Technical handling only unless legal requirements provided.

## 125. SECRET DATA

Pipeline logs should not dump full records.

## 126. MULTI-TENANT LOG

Avoid leaking one tenant's data into another's diagnostics/export.

## 127. EVIDENCE, STATUS AND FALSE POSITIVES

Evidence tier-ovi:

```text
A - reproduced: run history, reconciliation results, checkpoint state or a safe replay shows the behavior
B - complete path: pipeline code, checkpoint logic, delivery semantics and sink writes fully show the failure
C - strong static evidence: code shows the path, but orchestrator, broker or connector settings are not verified
D - inference: depends on delivery guarantees, ordering or provider behavior not verified
E - hardening: stronger observability or controls without a current failure path
```

Status:

- **CONFIRMED** - dokaz tier A ili B pokazuje putanju otkaza ili exploit-a.
- **LIKELY** - dokaz tier C.
- **NOT VERIFIED** - zavisi od runtime stanja, podešavanja ili verzija koji nisu mogli da se provere (tier D). Tier D nikada ne predstavljaj kao potvrđen.
- **NOT APPLICABLE** - komponenta ili obrazac se ne koriste.
- **CONTROLLED** - rizik postoji, ali ga druga kontrola ograničava.
- **HARDENING** - poboljšanje bez trenutnog failure path-a (P4).

False-positive pravila:

- At-least-once isporuka nije defekt kada je svaki upis u sink idempotentan ili deduplikovan.
- Latencija ili eventual consistency u okviru navedenog zahteva za svežinu nisu nalaz.
- Puno ponovno učitavanje umesto inkrementalne obrade je pitanje troška ili trajanja, a ne defekt ispravnosti, osim ako izaziva praznine, duplikate ili preopterećenje.
- Razlike u broju redova objašnjene dokumentovanim filterima, deduplikacijom ili podacima koji kasne nisu gubitak podataka; dokaži razliku po ID-u pre nego što prijaviš gubitak.
- Tolerisanje schema drift-a ignorisanjem nepoznatih polja je namerno osim ako tiho odbacuje podatke koji su potrošačima potrebni.

Nemoj da prijaviš nedostajuću best practice kao potvrđeni defekt ako ne postoji konkretna putanja otkaza, exploit-a, greške u ispravnosti, pouzdanosti ili rada.

## 128. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Pipeline:
Source:
Destination:
Checkpoint:
Idempotency:
Ordering:
Failure scenario:
Lost/duplicated data:
Tenant impact:
Detection:
Recovery:
Evidence:
Root cause:
Fix:
Replay test:
```

## 129. SEVERITY

P0:
- silent global data corruption/loss with no recovery
- systematic cross-tenant pipeline misrouting
- financial/identity pipeline corruption with catastrophic impact

P1:
- repeatable data loss/duplication on critical pipeline
- checkpoint bug causing gaps
- unsafe replay causing major duplicate side effects
- large-scale stale/inaccurate production data without detection

P2:
- meaningful limited integrity/freshness problem

P3:
- limited quality/reliability weakness

P4:
- maturity/observability hardening

## 130. OUTPUT

`ETL_DATA_PIPELINE_RELIABILITY_AUDIT.md`

## 131. PIPELINE MATRIX

| Pipeline | Source | Checkpoint | Idempotent | Ordering | DLQ | Replay |
|---|---|---|---|---|---|---|

## 132. SECOND PASS

Za svaki pipeline simuliraj:

- same batch twice
- crash before checkpoint
- crash after checkpoint
- out-of-order events
- source API timeout
- destination timeout
- one malformed row
- schema adds new field
- source deletes record
- backlog 100x
- replay one day
- tenant mapping mismatch
- old and new pipeline versions overlap

## 133. FINAL QUALITY GATE

Proveri:

- authority
- checkpoint
- idempotency
- ordering
- retries
- schema evolution
- tenant mapping
- batch partial failure
- DLQ
- replay
- freshness
- quality
- observability
- reconciliation
- DR

# KONAČNO PRAVILO

Ne želim:

> Dodaj retry, DLQ i monitoring.

Tražim:

```text
poller:
fetch rows WHERE updated_at > last_checkpoint
↓
three source rows receive identical updated_at timestamp
↓
page 1 contains first two
↓
checkpoint is set to that timestamp
↓
page 2 query uses >
↓
third row with same timestamp is permanently skipped
↓
pipeline reports success
↓
silent data loss
```

ili:

```text
batch writes 1000 rows
↓
destination commits successfully
↓
process crashes before checkpoint update
↓
same batch runs again
↓
destination uses INSERT without unique/idempotency key
↓
1000 duplicates created
```

Ako exactly-once nije dokazano:

**AT-LEAST-ONCE / DELIVERY SEMANTICS NOT VERIFIED.**

Ako pipeline freshness requirement nije definisan:

**FRESHNESS REQUIREMENT NOT DEFINED.**
