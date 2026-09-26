---
id: UPL-IT-059
number: 59
slug: orm-forensic-audit
title: ORM Forensic Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Baze podataka i data engineering
subcategory_id: databases-data-engineering
language: sr
version: 1.0.0
status: stable
---

# ORM FORENSIC AUDIT

Želim kompletan forensic audit ORM/data-access sloja, bez pretpostavke da ORM automatski obezbeđuje correctness, security ili performance.

Primeni actual ORM:

- Prisma
- Drizzle
- TypeORM
- Sequelize
- Hibernate
- EF Core
- SQLAlchemy
- Django ORM
- Room
- drugi

## 1. ORM INVENTORY

```text
ORM:
Version:
Models:
Migration tool:
Lazy loading:
Transactions:
Raw SQL support:
Connection pool:
```

## 2. MODEL -> SCHEMA DRIFT

Compare ORM model sa live migration/schema definicijom.

## 3. NULLABILITY

Code says required, DB says nullable or reverse.

## 4. DEFAULT

ORM vs DB.

## 5. ENUM

## 6. RELATION

Foreign key behavior.

## 7. CASCADE

ORM cascade != DB cascade nužno.

## 8. ORPHAN REMOVAL

## 9. SOFT DELETE

Default scopes.

## 10. TENANT SCOPE

Global query hooks/extensions.

## 11. `findById(id)`

High-value if tenant/ownership expected.

## 12. GLOBAL FILTER

Can be bypassed by raw query/alternate repository.

## 13. ADMIN BYPASS

Should be explicit.

## 14. MASS ASSIGNMENT

Object spread directly to ORM create/update.

## 15. HIDDEN FIELD

Role/tenant/owner.

## 16. SELECT

Default selects may include sensitive fields.

## 17. SERIALIZATION

ORM entity returned directly.

## 18. LAZY LOADING

N+1.

## 19. EAGER LOADING

Join explosion.

## 20. RELATION INCLUDE

Overfetch.

## 21. RAW SQL

Parameterization.

## 22. RAW IDENTIFIER

Sort/table/column.

## 23. UNSAFE ESCAPE API

ORM-specific.

## 24. TRANSACTION API

Does callback actually use same transaction client/session?

## 25. TRANSACTION LEAK

Code calls global ORM client inside transaction callback.

Example:

```text
transaction(tx => {
  tx.order.update(...)
  globalClient.audit.create(...)
})
```

Second write may not participate.

## 26. ASYNC TRANSACTION

External await inside transaction.

## 27. NESTED TRANSACTION

ORM semantics.

## 28. SAVEPOINT

## 29. ISOLATION

Actual options.

## 30. RETRY

ORM/client may auto-retry certain errors.

## 31. UPSERT

Concurrency semantics.

## 32. `connectOrCreate`

Potential races depending on unique constraints.

## 33. FIRST OR CREATE

## 34. BULK CREATE

Partial errors.

## 35. `updateMany/deleteMany`

Missing where condition.

## 36. EMPTY FILTER

Critical scenario:

```text
deleteMany({})
```

## 37. UNDEFINED FILTER

Some ORMs ignore undefined fields.

Security/correctness risk.

## 38. NULL VS UNDEFINED

Important in JS ORMs.

## 39. DYNAMIC WHERE

Request object spread.

## 40. DYNAMIC ORDER

## 41. PAGINATION

ORM offset implementation.

## 42. COUNT

## 43. RELATION COUNT

N+1.

## 44. QUERY GENERATION

Inspect actual SQL, not ORM intention.

## 45. PARAMETER TYPES

Implicit cast.

## 46. DATE CONVERSION

Timezone.

## 47. DECIMAL

ORM may return string/Decimal object.

## 48. BIGINT

JS number overflow.

## 49. JSON

Typed code vs runtime arbitrary structure.

## 50. MIGRATION AUTO-GENERATION

Review generated SQL.

## 51. SCHEMA PUSH/SYNC

Production destructive risk.

## 52. CLIENT GENERATION

Version mismatch.

## 53. CONNECTION MANAGEMENT

Singleton vs per-request client.

## 54. SERVERLESS

Opening new ORM client per function/request can exhaust DB.

## 55. HOT RELOAD

Dev clients.

## 56. CONNECTION LEAK

## 57. POOL

Driver vs ORM pool.

## 58. PREPARED STATEMENT

Proxy compatibility.

## 59. QUERY TIMEOUT

## 60. CANCELLATION

## 61. ERROR MAPPING

Unique/FK/deadlock errors.

## 62. RETRYABLE ERROR

## 63. NOT FOUND

## 64. OPTIMISTIC CONCURRENCY

Version field.

## 65. CHANGE TRACKING

EF/Hibernate-like stale entity state.

## 66. FIRST-LEVEL CACHE

## 67. SECOND-LEVEL CACHE

Staleness.

## 68. DIRTY CHECKING

Unexpected writes.

## 69. PARTIAL UPDATE

May overwrite fields with stale values.

## 70. ENTITY MERGE

Detached object risk.

## 71. BATCHING

ORM may auto-batch, verify.

## 72. LOGGING

Queries can include PII.

## 73. SENSITIVE PARAMETER LOGGING

Dev feature accidentally in prod.

## 74. FINDING FORMAT

```text
ID:
Severity:
ORM:
Model:
Call site:
Generated SQL:
Transaction context:
Problem:
Data/security/performance impact:
Evidence:
Root cause:
Fix:
Regression test:
```

## 75. OUTPUT

`ORM_FORENSIC_AUDIT.md`

## 76. SECOND PASS

Search repository-wide for:

- raw
- unsafe
- findUnique/findById
- updateMany
- deleteMany
- object spread into create/update
- transaction callbacks
- relation includes
- lazy access
- query inside loops
- per-request client initialization

## 77. FINAL QUALITY GATE

Proveri actual generated SQL and ORM version semantics before serious finding.

# KONAČNO PRAVILO

Tražim:

```text
transaction(async tx => {
  await tx.orders.create(...)
  await sendPayment(...)
  await prisma.auditLog.create(...)
})

↓
auditLog uses global prisma client
↓
not part of transaction

↓
later transaction rollback
↓
audit log claims order exists
↓
database state diverges
```
