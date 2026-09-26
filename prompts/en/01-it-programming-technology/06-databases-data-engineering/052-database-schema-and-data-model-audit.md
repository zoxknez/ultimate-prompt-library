---
id: UPL-IT-052
number: 52
slug: database-schema-and-data-model-audit
title: Database Schema & Data Model Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Databases & Data Engineering
subcategory_id: databases-data-engineering
language: en
version: 1.0.0
status: stable
---

# DATABASE SCHEMA AND DATA MODEL AUDIT

I want a forensic analysis of the schema and domain model focusing on long-term correctness, integrity, evolution, and queryability.

Main objective:

> Identify areas where the database schema fails to express true business invariants, permits impossible states, duplicates authoritative facts, blurs tenant boundaries, or hinders safe system evolution.

## 1. ENTITY INVENTORY

For every domain entity:

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

For each invariant determine the enforcement layer:

- application only
- database constraint
- transaction logic
- external authority

## 3. IMPOSSIBLE STATE

Search for combinations that business logic should never permit.

Example:

```text
status = PAID
paid_at = NULL
```

## 4. NULL SEMANTICS

Distinguish between:

- unknown
- not applicable
- not yet set

## 5. BOOLEAN EXPLOSION

Multiple boolean flags permitting contradictory or invalid states.

## 6. STATE ENUM

State machines often provide greater clarity.

Do not automatically refactor if booleans represent truly independent dimensions.

## 7. IDENTITY

Stable natural keys vs mutable identifiers.

## 8. EMAIL AS PRIMARY KEY

Can cause severe cascading issues if email values change.

## 9. SURROGATE KEY

Not automatically superior in all design scenarios.

## 10. COMPOSITE IDENTITY

Tenant identifier + external resource identifier.

## 11. EXTERNAL ID

Uniqueness scoping.

## 12. GLOBAL UNIQUE VS TENANT UNIQUE

Critical distinction for multi-tenant architectures.

## 13. OWNER/TENANT FOREIGN KEY

Child records must reference the correct parent and tenant.

## 14. COMPOSITE FK

Enforces multi-column consistency:

```text
(project_id, tenant_id)
```

## 15. ORPHAN RECORD

Missing foreign key constraints or deletion cascade rules.

## 16. MANY-TO-MANY

Join tables requiring unique constraint pairs.

## 17. DUPLICATE MEMBERSHIP

Missing unique constraint on relationship pairings.

## 18. SELF-REFERENCE

Hierarchical cycles.

## 19. TREE

Parent-child relationships and cycle prevention where required.

## 20. ORDERING

Duplicate position or rank values.

## 21. MONEY

Storing amounts alongside explicit currencies.

## 22. UNIT

Storing numerical values without explicit measurement units.

## 23. PERCENTAGE

Check constraints governing valid percentage ranges.

## 24. QUANTITY

Can quantities legitimately be negative?

## 25. COUNTER

Derived aggregate values vs authoritative source values.

## 26. DENORMALIZED COUNT

Susceptible to data drift.

## 27. AGGREGATE

Reconciliation and recalculation procedures.

## 28. SNAPSHOT

Historical invoice lines should record point-in-time prices rather than referencing current mutable catalog rates.

## 29. HISTORICAL DATA

Mutable relations can destroy historical accuracy.

## 30. ADDRESS

Current profile address vs immutable order-time shipping address.

## 31. AUDIT FIELDS

Capturing created_by and updated_by where meaningful.

## 32. VERSION

Optimistic concurrency locking columns.

## 33. STATUS HISTORY

Capturing state transitions and audit logs if required by business logic.

## 34. SOFT DELETE

Impact on uniqueness guarantees.

## 35. UNIQUE WITH SOFT DELETE

Partial unique indexes required depending on the database engine.

## 36. TEMPORAL VALIDITY

Managing valid_from and valid_to intervals.

## 37. OVERLAPPING RANGES

Preventing overlapping time spans in scheduling, subscriptions, or inventory.

## 38. CHECK CONSTRAINT

Enforcing valid value boundaries.

## 39. DATE VS TIMESTAMP

Selecting the semantically correct temporal type.

## 40. TIMEZONE

Consistently persisting UTC timestamps.

## 41. JSON

Document flexibility vs schema integrity trade-offs.

## 42. JSON VERSIONING

Embedding schema version numbers within long-lived JSON payloads.

## 43. JSON SECURITY FIELD

Never bury critical authorization attributes in unstructured JSON lacking schema validation.

## 44. POLYMORPHIC RELATION

`type + id` structures forfeit native foreign key referential integrity.

Analyze trade-offs.

## 45. EAV

Entity-attribute-value patterns can ruin typing, integrity, and query performance.

Use only when the domain explicitly mandates dynamic modeling.

## 46. GENERIC TABLE

Catch-all key/value configuration tables.

## 47. DUPLICATED FACT

Authoritative facts copied redundantly across tables.

Which record is authoritative?

## 48. SYNCHRONIZATION

If duplicated by design, establish clear synchronization mechanisms.

## 49. EXTERNAL SYSTEM

Local mirrors vs external sources of truth.

## 50. WEBHOOK DATA

Preserving raw payloads for idempotency verification and auditability.

## 51. IDENTITY MAPPING

Ensuring unique mapping for third-party provider IDs.

## 52. TENANT ISOLATION

Every tenant-scoped entity must make tenant association unambiguous.

## 53. GLOBAL TABLE

Some lookup tables are intentionally global.

Do not force tenant keys where inappropriate.

## 54. SHARED REFERENCE

Global country and currency catalogs.

## 55. CASCADE GRAPH

Map the complete deletion traversal graph.

## 56. CYCLE

Cascades introducing unexpected or cyclic deletion behaviors.

## 57. SET NULL

Can produce semantically invalid orphan records.

## 58. RESTRICT

Can block legitimate application operations unless deletions are sequenced properly.

## 59. ARCHIVE

Dedicated archival schemas or historical tables.

## 60. DATA TYPE WIDTH

Long-term integer overflow risks.

## 61. ID BIGINT

Ensuring sequence identifiers handle anticipated growth.

## 62. STRING ID

Length boundaries and collation settings.

## 63. COLLATION

Case sensitivity and sorting semantics.

## 64. EMAIL CASE

Domain and delivery case normalization.

## 65. USERNAME CASE

Ensuring uniqueness across varying character casings.

## 66. Unicode normalization.

## 67. FLOAT

Scientific approximations vs financial calculations.

## 68. DECIMAL SCALE

Rounding and precision definitions.

## 69. SERIALIZED DECIMAL

ORM precision conversion fidelity.

## 70. BLOB

Database BLOB storage vs external object storage.

No universal answer.

## 71. INDEXABILITY

Designing schemas that align with real-world query access patterns.

## 72. PARTITION KEY

Selecting appropriate keys if partitioning is implemented.

## 73. FUTURE EVOLUTION

Can the schema incorporate new states without breaking existing clients?

## 74. ENUM MIGRATION

Native database enums can introduce operational friction during migrations.

## 75. DEFAULT VALUE MIGRATION

Applying defaults across legacy records.

## 76. REQUIRED COLUMN

Safe phased rollout for non-nullable additions.

## 77. BACKWARD COMPATIBILITY

Old application binaries interacting with newer database schemas.

## 78. DATA CONTRACT

Preserving schema contracts for analytics and downstream systems.

## 79. MIGRATION HISTORY

Tracking historical model evolution patterns.

## 80. NAMING

Enforcing uniform naming conventions.

## 81. RESERVED WORDS

Avoiding engine reserved keywords in identifiers.

## 82. CASE-SENSITIVE NAMES

Quoted, case-sensitive identifiers introducing friction.

## 83. ORM MAPPING

Ensuring application entity definitions match physical database schemas.

## 84. DRIFT

Discrepancies between ORM auto-generated schemas and version-controlled migrations.

## 85. HIDDEN COLUMN

Physical columns absent from application models.

## 86. DOMAIN FIELD ABSENT FROM DB

Domain entity attributes missing persistence fields.

## 87. SCHEMA DOCUMENTATION

Useful documentation for critical business entities.

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

## 90. MATRICES

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

For every critical entity ask:

- can duplicate records be created?
- can orphan records persist?
- can an entity belong to two distinct tenants?
- can lifecycle status become contradictory?
- can historical records have their meaning altered retroactively?
- can soft deletion break uniqueness constraints?
- can external ID collisions link to incorrect records?

# FINAL RULE

Looking for:

```text
membership table:
user_id
organization_id
role

↓
no UNIQUE(user_id, organization_id)

↓
same user receives two membership rows
↓
one MEMBER, one ADMIN

↓
different query paths select different rows
↓
authorization becomes nondeterministic
```
