---
id: UPL-IT-052
number: 52
slug: database-schema-and-data-model-audit
title: Database Schema & Data Model Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# DATABASE SCHEMA AND DATA MODEL AUDIT

Želim forenzičku analizu schema-e i domain modela sa fokusom na dugoročnu correctness, integrity, evoluciju i queryability.

Glavni cilj:

> Pronaći mesta gde database schema ne uspeva da izrazi stvarne business invariants, dozvoljava nemoguće state-ove, duplira authoritative podatke, meša tenant boundaries ili otežava bezbednu evoluciju sistema.

## 1. ENTITY INVENTORY

Za svaku domain entity:

```text
Entity:
Table:
Identity:
Owner:
Tenant:
Lifecycle:
Required fields:
Relationships:
Business invariants:
```

## 2. BUSINESS INVARIANT -> DB SUPPORT

Za svaki invariant odredi:

- application only
- DB constraint
- transaction
- external authority

## 3. IMPOSSIBLE STATE

Traži combinations koje business nikad ne bi trebalo da dozvoli.

Primer:

```text
status = PAID
paid_at = NULL
```

## 4. NULL SEMANTICS

Razlikuj:

- unknown
- not applicable
- not yet set

## 5. BOOLEAN EXPLOSION

Više boolean flags može dozvoliti kontradiktorna stanja.

## 6. STATE ENUM

State machine može biti jasniji.

Ne menjaj automatski ako booleans imaju independent semantics.

## 7. IDENTITY

Stable vs mutable natural key.

## 8. EMAIL AS PRIMARY KEY

Može biti problem ako email menja value.

## 9. SURROGATE KEY

Not automatically superior.

## 10. COMPOSITE IDENTITY

Tenant + external ID.

## 11. EXTERNAL ID

Unique scope.

## 12. GLOBAL UNIQUE VS TENANT UNIQUE

Critical.

## 13. OWNER/TENANT FOREIGN KEY

Child mora pripadati correct parent/tenant.

## 14. COMPOSITE FK

Može enforce-ovati:

```text
(project_id, tenant_id)
```

consistency.

## 15. ORPHAN RECORD

Missing FK/cascade logic.

## 16. MANY-TO-MANY

Join table unique pair.

## 17. DUPLICATE MEMBERSHIP

Missing unique constraint.

## 18. SELF-REFERENCE

Cycles.

## 19. TREE

Parent relationship + cycle prevention if required.

## 20. ORDERING

Position/rank duplicates.

## 21. MONEY

Amount/currency.

## 22. UNIT

Value without unit.

## 23. PERCENTAGE

Range constraint.

## 24. QUANTITY

Can it be negative?

## 25. COUNTER

Derived vs authoritative.

## 26. DENORMALIZED COUNT

Can drift.

## 27. AGGREGATE

Rebuild/reconciliation.

## 28. SNAPSHOT

Historical invoice price should not necessarily reference current product price.

## 29. HISTORICAL DATA

Mutable relation may destroy historical truth.

## 30. ADDRESS

Current profile address vs order-time address.

## 31. AUDIT FIELDS

created_by/updated_by where meaningful.

## 32. VERSION

Optimistic locking.

## 33. STATUS HISTORY

If business needs transitions/history.

## 34. SOFT DELETE

Uniqueness.

## 35. UNIQUE WITH SOFT DELETE

Partial unique index may be needed depending on DB.

## 36. TEMPORAL VALIDITY

valid_from / valid_to.

## 37. OVERLAPPING RANGES

Schedule/subscription/inventory domains.

## 38. CHECK CONSTRAINT

Ranges.

## 39. DATE VS TIMESTAMP

Correct semantic type.

## 40. TIMEZONE

Store instant consistently.

## 41. JSON

Document-like flexibility vs integrity.

## 42. JSON VERSIONING

Schema field inside payload if long-lived.

## 43. JSON SECURITY FIELD

Do not bury critical authorization data in arbitrary JSON without controlled schema.

## 44. POLYMORPHIC RELATION

`type + id` loses normal FK enforcement.

Analyze tradeoff.

## 45. EAV

Entity-attribute-value can destroy type/integrity/query performance.

Use only if actual domain justifies.

## 46. GENERIC TABLE

`key/value` config tables.

## 47. DUPLICATED FACT

Same email/name/status copied across tables.

Which is authoritative?

## 48. SYNCHRONIZATION

If duplicate by design, update model.

## 49. EXTERNAL SYSTEM

Local mirror vs source of truth.

## 50. WEBHOOK DATA

Keep raw event if needed for idempotency/audit.

## 51. IDENTITY MAPPING

External provider ID must have proper uniqueness.

## 52. TENANT ISOLATION

Every tenant-scoped entity must make scope unambiguous.

## 53. GLOBAL TABLE

Some tables intentionally global.

Do not force tenant ID everywhere.

## 54. SHARED REFERENCE

Country/currency catalog.

## 55. CASCADE GRAPH

Map all delete paths.

## 56. CYCLE

Cascades may create unexpected delete behavior.

## 57. SET NULL

Can produce semantically invalid orphan.

## 58. RESTRICT

May block legitimate lifecycle unless application sequences deletes.

## 59. ARCHIVE

Archival table/schema.

## 60. DATA TYPE WIDTH

Integer overflow long-term.

## 61. ID BIGINT

Growth.

## 62. STRING ID

Length/collation.

## 63. COLLATION

Case sensitivity.

## 64. EMAIL CASE

Domain semantics.

## 65. USERNAME CASE

Uniqueness.

## 66. Unicode normalization.

## 67. FLOAT

Scientific vs financial.

## 68. DECIMAL SCALE

Rounding.

## 69. SERIALIZED DECIMAL

ORM conversion.

## 70. BLOB

Large binary in DB vs object storage.

No blanket answer.

## 71. INDEXABILITY

Schema design should support actual access patterns.

## 72. PARTITION KEY

If partitioned.

## 73. FUTURE EVOLUTION

Can schema add new states without breaking old clients?

## 74. ENUM MIGRATION

DB enum can be operationally awkward depending on engine.

## 75. DEFAULT VALUE MIGRATION

Old rows.

## 76. REQUIRED COLUMN

Safe rollout.

## 77. BACKWARD COMPATIBILITY

Old code/new schema.

## 78. DATA CONTRACT

Analytics/downstream consumers.

## 79. MIGRATION HISTORY

Model evolution patterns.

## 80. NAMING

Consistency.

## 81. RESERVED WORDS

Portability/tooling.

## 82. CASE-SENSITIVE NAMES

Quoted identifiers can create friction.

## 83. ORM MAPPING

Does code model match actual schema?

## 84. DRIFT

Schema generated from ORM vs migrations.

## 85. HIDDEN COLUMN

DB field absent from domain model.

## 86. DOMAIN FIELD ABSENT FROM DB

Potential persistence loss.

## 87. SCHEMA DOCUMENTATION

Not security requirement, but useful for critical entities.

## 88. FINDING FORMAT

```text
ID:
Severity:
Entity/Table:
Invariant:
Current schema:
Allowed invalid state:
Consequence:
Evidence:
Root cause:
Recommended model:
Migration implications:
Regression test:
```

## 89. OUTPUT

`DATABASE_SCHEMA_DATA_MODEL_AUDIT.md`

## 90. MATRICE

### Entity Matrix

| Entity | PK | Tenant | Owner | Main invariants |
|---|---|---|---|---|

### Relationship Matrix

| Parent | Child | FK | Delete behavior | Risk |
|---|---|---|---|---|

### Invariant Matrix

| Invariant | App | DB | Transaction | Test |
|---|---|---|---|---|

## 91. SECOND PASS

Za svaki critical entity pitaj:

- može li postojati duplicate?
- može li ostati orphan?
- može li pripasti dva tenant-a?
- može li status biti kontradiktoran?
- može li historical fact promeniti značenje?
- može li soft delete polomiti uniqueness?
- može li external ID collision povezati pogrešne records?

# KONAČNO PRAVILO

Tražim:

```text
membership table:
user_id
organization_id
role

↓
nema UNIQUE(user_id, organization_id)

↓
isti user dobija dve membership rows
↓
jedna MEMBER, druga ADMIN

↓
različiti query paths biraju različitu row
↓
authorization postaje nondeterministic
```
