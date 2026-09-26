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
version: 1.1.0
status: stable
---

# DATABASE SCHEMA AND DATA MODEL AUDIT

I want a forensic analysis of the schema and domain model focusing on long-term correctness, integrity, evolution, and queryability.

Main objective:

> Identify areas where the database schema fails to express true business invariants, permits impossible states, duplicates authoritative facts, blurs tenant boundaries, or hinders safe system evolution.

## 1. OBJECTIVE AND NON-GOALS

Prove whether the schema can represent every valid business state and **cannot** represent the invalid ones, for identity, ownership, tenancy, relationships, lifecycle, history and future change. Each finding must name the business rule, the invalid state the schema allows, and a realistic path by which that state is produced.

Non-goals:

- query performance tuning (only where a model choice makes a correct query impossible to run efficiently)
- migration execution mechanics (locks, backfills), except to note the migration implications of a proposed model change
- naming style preferences without correctness impact
- demanding normalization or denormalization as a principle; judge each choice by the invariants it protects or endangers

## 2. CONTEXT DISCOVERY

Establish first:

```text
Database engine(s) and version(s):
ORM and how the schema is defined (migrations, model definitions, both):
Multi-tenant model (shared tables with tenant_id, schema per tenant, database per tenant):
Core domain entities and their lifecycles:
External systems that own or mirror data (payments, identity provider, CRM, search):
Retention, archival and deletion rules (legal, contractual):
Consumers of the schema besides the application (analytics, exports, integrations):
```

Constraint capabilities differ by engine and version (partial unique indexes, deferrable constraints, exclusion constraints, check constraints on some engines being parsed but not enforced). Verify before recommending a database-level solution.

## 3. DOMAIN INVARIANT EXTRACTION

Before reviewing any table, extract the business rules the data must satisfy. Sources: domain documentation, validation code, service logic, tests, UI constraints, support tickets and incident reports.

Write each rule as a precise statement:

```text
a user has at most one membership per organization
an invoice total equals the sum of its lines at the time of issue
a PAID order has paid_at and a payment reference
a task and its project belong to the same tenant
subscription periods of one account never overlap
```

Then review the schema against this list. A table review without an invariant list produces style comments, not correctness findings.

## 4. EVIDENCE MODEL

```text
A - observed: invalid rows exist in the data (found with a read-only query), or the invalid state was produced in a test
B - complete path: schema allows the state AND a traced code path (endpoint, job, import, admin tool) can write it
C - strong static evidence: schema allows the state and application-only validation is the sole guard
D - inference: the state is allowed but no writer path is known yet
E - hardening: adding a constraint for a rule that is already reliably enforced elsewhere
```

Report counts of invalid rows, never the personal data in them.

## 5. FINDING STATUS

- **CONFIRMED** - invalid data exists or a writer path to the invalid state is traced (tier A or B).
- **LIKELY** - the schema allows the state and only application validation prevents it (tier C).
- **NOT VERIFIED** - depends on engine capabilities, data or code paths that could not be checked.
- **NOT APPLICABLE** - the rule does not exist in this domain.
- **CONTROLLED** - the state is allowed by the schema but reliably prevented or repaired by another mechanism.
- **HARDENING** - an additional constraint without a current failure path (P4).

Do not report a missing best practice (a missing foreign key, a nullable column) as a confirmed defect unless it lets a real invalid state be written or read.

## 6. FALSE-POSITIVE RULES

The following are **not** findings by themselves:

- JSON columns, EAV or polymorphic relations are trade-offs, not automatic smells; they are findings only when they break a specific invariant, typing or query requirement.
- A missing foreign key is not automatically a defect across database or service boundaries, or where references are validated and cleaned reliably.
- Denormalized or duplicated fields are not automatically wrong if one source is clearly authoritative and the copy is synchronized or recomputed.
- Several boolean flags are not automatically a state machine in disguise; they may be independent dimensions.
- A nullable column is not automatically wrong; distinguish unknown, not applicable and not yet set.
- Surrogate keys are not automatically better than natural keys, and vice versa.

## 7. ENTITY INVENTORY

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

## 8. BUSINESS INVARIANT -> DB SUPPORT

For each invariant determine the enforcement layer:

- application only
- database constraint
- transaction logic
- external authority

## 9. IMPOSSIBLE STATE

Search for combinations that business logic should never permit.

Example:

```text
status = PAID
paid_at = NULL
```

## 10. IMPOSSIBLE STATE HUNT

For every entity with a lifecycle, enumerate combinations of fields that should never occur together and check whether the schema prevents them:

```text
status = PAID      AND paid_at IS NULL
status = CANCELLED AND shipped_at IS NOT NULL
deleted_at IS NOT NULL AND status = ACTIVE
end_date < start_date
quantity <= 0 on an order line
parent_id = id (self-parent)
```

For each combination: is it prevented by a check constraint, a type (enum, domain), a separate table per state, or only by application code? Then look for writers that bypass that code (imports, admin tools, scripts, other services).

## 11. NULL SEMANTICS

Distinguish between:

- unknown
- not applicable
- not yet set

## 12. BOOLEAN EXPLOSION

Multiple boolean flags permitting contradictory or invalid states.

## 13. STATE ENUM

State machines often provide greater clarity.

Do not automatically refactor if booleans represent truly independent dimensions.

## 14. IDENTITY

Stable natural keys vs mutable identifiers.

## 15. EMAIL AS PRIMARY KEY

Can cause severe cascading issues if email values change.

## 16. SURROGATE KEY

Not automatically superior in all design scenarios.

## 17. COMPOSITE IDENTITY

Tenant identifier + external resource identifier.

## 18. EXTERNAL ID

Uniqueness scoping.

## 19. GLOBAL UNIQUE VS TENANT UNIQUE

Critical distinction for multi-tenant architectures.

## 20. OWNER/TENANT FOREIGN KEY

Child records must reference the correct parent and tenant.

## 21. COMPOSITE FK

Enforces multi-column consistency:

```text
(project_id, tenant_id)
```

## 22. TENANT AND OWNERSHIP INTEGRITY

A foreign key on `project_id` alone does not stop a task from pointing to another tenant's project. Check the composite pattern where tenants share tables:

```text
projects: UNIQUE (tenant_id, id)
tasks:    FOREIGN KEY (tenant_id, project_id) REFERENCES projects (tenant_id, id)
```

For every tenant-scoped child table, determine whether the database guarantees that parent and child share the tenant, or whether only application code does. Do the same for ownership chains (user -> membership -> organization -> resource).

## 23. ORPHAN RECORD

Missing foreign key constraints or deletion cascade rules.

## 24. MANY-TO-MANY

Join tables requiring unique constraint pairs.

## 25. DUPLICATE MEMBERSHIP

Missing unique constraint on relationship pairings.

## 26. SELF-REFERENCE

Hierarchical cycles.

## 27. TREE

Parent-child relationships and cycle prevention where required.

## 28. ORDERING

Duplicate position or rank values.

## 29. MONEY

Storing amounts alongside explicit currencies.

## 30. UNIT

Storing numerical values without explicit measurement units.

## 31. PERCENTAGE

Check constraints governing valid percentage ranges.

## 32. QUANTITY

Can quantities legitimately be negative?

## 33. COUNTER

Derived aggregate values vs authoritative source values.

## 34. DENORMALIZED COUNT

Susceptible to data drift.

## 35. AGGREGATE

Reconciliation and recalculation procedures.

## 36. DERIVED DATA AUTHORITY

For every counter, total, cached status or other derived field, record:

```text
Derived field:
Computed from:
Authoritative source:
Update mechanism (same transaction, trigger, async job, never):
Can it be recomputed from scratch?
Decisions made from it (billing, limits, access):
```

A derived value that drives decisions but cannot be recomputed from an authoritative source is a correctness risk.

## 37. SNAPSHOT

Historical invoice lines should record point-in-time prices rather than referencing current mutable catalog rates.

## 38. HISTORICAL DATA

Mutable relations can destroy historical accuracy.

## 39. ADDRESS

Current profile address vs immutable order-time shipping address.

## 40. HISTORICAL TRUTH AND SNAPSHOTS

Identify facts that must be frozen at the moment they happened:

- the price, tax rate and currency on an invoice line
- the shipping address and recipient of an order
- the role and organization of a user at the time of an action (audit)
- the terms, plan and price of a subscription period

For each, check whether the schema stores a snapshot or references mutable current data. If it references current data, show which later change (price update, address edit, membership removal) silently rewrites history.

## 41. AUDIT FIELDS

Capturing created_by and updated_by where meaningful.

## 42. VERSION

Optimistic concurrency locking columns.

## 43. STATUS HISTORY

Capturing state transitions and audit logs if required by business logic.

## 44. SOFT DELETE

Impact on uniqueness guarantees.

## 45. UNIQUE WITH SOFT DELETE

Partial unique indexes required depending on the database engine.

## 46. SOFT DELETE MODEL

Where soft delete is used, check all four consequences:

- **uniqueness** - a deleted row still occupies the unique value unless a partial unique index or another design excludes it
- **restore** - restoring can violate uniqueness taken by a newer row, or resurrect children that should stay deleted
- **query scope** - every query, join, report and relation loader must exclude deleted rows; one missing filter shows deleted data
- **cascade** - soft-deleting a parent does not soft-delete children automatically; database cascades act only on hard deletes

## 47. TEMPORAL VALIDITY

Managing valid_from and valid_to intervals.

## 48. OVERLAPPING RANGES

Preventing overlapping time spans in scheduling, subscriptions, or inventory.

## 49. TEMPORAL MODEL

For entities with validity periods (prices, memberships, subscriptions, reservations):

- are intervals half-open (`[valid_from, valid_to)`) so that adjacent periods do not overlap or leave gaps?
- how is "currently valid" represented (NULL valid_to, far-future date), and is it consistent?
- is non-overlap enforced by the database (exclusion constraint or equivalent) or only by application code under concurrency?
- are timestamps stored in UTC with a clear rule for dates that are local by nature (birthdays, business days)?
- can a correction of a past period be recorded without rewriting history?

## 50. CHECK CONSTRAINT

Enforcing valid value boundaries.

## 51. DATE VS TIMESTAMP

Selecting the semantically correct temporal type.

## 52. TIMEZONE

Consistently persisting UTC timestamps.

## 53. JSON

Document flexibility vs schema integrity trade-offs.

## 54. JSON VERSIONING

Embedding schema version numbers within long-lived JSON payloads.

## 55. JSON SECURITY FIELD

Never bury critical authorization attributes in unstructured JSON lacking schema validation.

## 56. POLYMORPHIC RELATION

`type + id` structures forfeit native foreign key referential integrity.

Analyze trade-offs.

## 57. EAV

Entity-attribute-value patterns can ruin typing, integrity, and query performance.

Use only when the domain explicitly mandates dynamic modeling.

## 58. GENERIC TABLE

Catch-all key/value configuration tables.

## 59. JSON, EAV AND POLYMORPHIC TRADE-OFFS

Judge flexible structures by what they lose:

```text
Structure:
Why it was chosen (dynamic attributes, integration payloads, many owner types):
Lost guarantee (foreign keys, types, NOT NULL, uniqueness, indexing):
Compensating mechanism (validation schema, triggers, application checks, cleanup jobs):
Invariants that depend on data inside it:
```

A finding exists when a business invariant, a security attribute or a frequently filtered field depends on data the database cannot validate or constrain.

## 60. DUPLICATED FACT

Authoritative facts copied redundantly across tables.

Which record is authoritative?

## 61. SYNCHRONIZATION

If duplicated by design, establish clear synchronization mechanisms.

## 62. EXTERNAL SYSTEM

Local mirrors vs external sources of truth.

## 63. WEBHOOK DATA

Preserving raw payloads for idempotency verification and auditability.

## 64. IDENTITY MAPPING

Ensuring unique mapping for third-party provider IDs.

## 65. TENANT ISOLATION

Every tenant-scoped entity must make tenant association unambiguous.

## 66. GLOBAL TABLE

Some lookup tables are intentionally global.

Do not force tenant keys where inappropriate.

## 67. SHARED REFERENCE

Global country and currency catalogs.

## 68. CASCADE GRAPH

Map the complete deletion traversal graph.

## 69. CYCLE

Cascades introducing unexpected or cyclic deletion behaviors.

## 70. SET NULL

Can produce semantically invalid orphan records.

## 71. RESTRICT

Can block legitimate application operations unless deletions are sequenced properly.

## 72. ARCHIVE

Dedicated archival schemas or historical tables.

## 73. DATA TYPE WIDTH

Long-term integer overflow risks.

## 74. ID BIGINT

Ensuring sequence identifiers handle anticipated growth.

## 75. STRING ID

Length boundaries and collation settings.

## 76. COLLATION

Case sensitivity and sorting semantics.

## 77. EMAIL CASE

Domain and delivery case normalization.

## 78. USERNAME CASE

Ensuring uniqueness across varying character casings.

## 79. Unicode normalization.

## 80. FLOAT

Scientific approximations vs financial calculations.

## 81. DECIMAL SCALE

Rounding and precision definitions.

## 82. SERIALIZED DECIMAL

ORM precision conversion fidelity.

## 83. BLOB

Database BLOB storage vs external object storage.

No universal answer.

## 84. INDEXABILITY

Designing schemas that align with real-world query access patterns.

## 85. PARTITION KEY

Selecting appropriate keys if partitioning is implemented.

## 86. FUTURE EVOLUTION

Can the schema incorporate new states without breaking existing clients?

## 87. MODEL EVOLUTION TEST

Test the model against plausible future changes, and report only where the answer is costly or unsafe:

- a new lifecycle state (for example PARTIALLY_REFUNDED)
- a second currency, tenant region or language
- one-to-one becoming one-to-many (a user with several addresses, an order with several payments)
- a new owner type for a polymorphic relation
- a legal requirement to delete or anonymize personal data while keeping financial records

For each: which tables, constraints, enums and consumers change, and can old and new application versions coexist during that change?

## 88. ENUM MIGRATION

Native database enums can introduce operational friction during migrations.

## 89. DEFAULT VALUE MIGRATION

Applying defaults across legacy records.

## 90. REQUIRED COLUMN

Safe phased rollout for non-nullable additions.

## 91. BACKWARD COMPATIBILITY

Old application binaries interacting with newer database schemas.

## 92. DATA CONTRACT

Preserving schema contracts for analytics and downstream systems.

## 93. MIGRATION HISTORY

Tracking historical model evolution patterns.

## 94. NAMING

Enforcing uniform naming conventions.

## 95. RESERVED WORDS

Avoiding engine reserved keywords in identifiers.

## 96. CASE-SENSITIVE NAMES

Quoted, case-sensitive identifiers introducing friction.

## 97. ORM MAPPING

Ensuring application entity definitions match physical database schemas.

## 98. DRIFT

Discrepancies between ORM auto-generated schemas and version-controlled migrations.

## 99. HIDDEN COLUMN

Physical columns absent from application models.

## 100. DOMAIN FIELD ABSENT FROM DB

Domain entity attributes missing persistence fields.

## 101. SCHEMA DOCUMENTATION

Useful documentation for critical business entities.

## 102. MATRICES

### Entity Matrix

| Entity | PK | Tenant | Owner | Lifecycle | Main invariants |
|---|---|---|---|---|---|

### Relationship Matrix

| Parent | Child | FK | Same-tenant guaranteed | Delete behavior | Soft delete handling | Risk |
|---|---|---|---|---|---|---|

### Invariant Matrix

| Invariant | App enforcement | DB enforcement | Concurrency safe | Repair / reconciliation | Status |
|---|---|---|---|---|---|

## 103. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Scope (entity / table / relationship):
Invariant:
Current schema:
Allowed invalid state:
Trigger (writer path that can produce it):
Failure path:
Impact (business, security, reporting, history):
Blast radius (rows, tenants, consumers):
Evidence (query counts, code path):
Root cause:
Recommended model:
Migration implications (data cleanup, backfill, mixed-version compatibility):
Verification (constraint test, data check):
Regression risk:
```

## 104. SEVERITY

- **P0** - the model allows cross-tenant ownership, loss of financial or legal history, or authorization data that can become contradictory, and a writer path exists.
- **P1** - invalid states on critical entities (duplicate memberships, payments without orders, orphaned financial records) that are observed or reachable through a traced path.
- **P2** - invariants protected only by application code on important entities, historical data that can be silently rewritten, or model choices that block a known upcoming requirement.
- **P3** - weaker typing, nullability or naming issues with limited correctness impact.
- **P4** - hardening: extra constraints, documentation, future-proofing without a current failure path.

## 105. OUTPUT

`DATABASE_SCHEMA_DATA_MODEL_AUDIT.md`

## 106. SECOND PASS

For every critical entity ask:

- can duplicate records be created (including under concurrent requests)?
- can orphan records persist after deletes, imports or failed writes?
- can an entity or its children belong to two distinct tenants?
- can lifecycle status become contradictory with other fields?
- can historical records have their meaning altered retroactively?
- can soft deletion break uniqueness, or restore resurrect invalid combinations?
- can external ID collisions link to incorrect records?
- can intervals overlap or leave gaps?
- which writers bypass the application validation (imports, scripts, admin tools, other services)?

Then try to disprove each finding: is there a constraint, trigger or single writer that already prevents the state? Is the rule really part of the domain?

## 107. FINAL QUALITY GATE

Before returning the report, verify that each critical entity was checked for:

- **identity** - stable key, correct uniqueness scope
- **ownership** - owner is unambiguous and cannot point to the wrong parent
- **tenant** - parent and child are guaranteed to share the tenant
- **uniqueness** - rules hold under concurrency and soft delete
- **nullability** - NULL has one clear meaning per column
- **relationships** - foreign keys, delete behavior, cascades and cycles
- **historical state** - facts that must be frozen are snapshotted
- **impossible states** - contradictory field combinations are prevented or detected
- **lifecycle** - allowed transitions and terminal states are representable and enforced
- **evolution** - plausible future changes do not require unsafe rewrites

Also verify that the invariant list was extracted before the table review, and that statuses and evidence tiers are applied consistently.

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

Other failure chains to look for:

```text
invoice_lines.product_id references products
↓
invoice shows products.price instead of a stored line price
↓
catalog price is updated next month
↓
re-printed historical invoices show the new price
↓
accounting records no longer match what customers paid
```

```text
comments(commentable_type, commentable_id) without foreign keys
↓
invoice 42 is hard-deleted by a cleanup job; its comments remain as orphans
↓
a support view joins comments to tickets on commentable_id only, ignoring commentable_type
↓
the orphaned invoice comments appear on ticket 42, possibly in another customer's account
```

```text
subscription_periods(account_id, valid_from, valid_to) without an overlap constraint
↓
upgrade and renewal jobs run at the same time
↓
two active periods overlap for one account
↓
customer is billed twice for the overlapping days
```
