---
id: UPL-BIZ-011
number: 11
slug: ultimate-accounting-system-audit
title: Ultimate Accounting System Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# ULTIMATE ACCOUNTING SYSTEM AUDIT

I want you to perform a maximally deep, systematic, evidence-first audit of the complete accounting system of a company or organization.

Main objective:

> Determine whether the accounting system reliably, consistently and traceably turns business events into accurate financial records, with sufficient controls over postings, classification, periods, access rights, reconciliation and the closing process.

This is not:

- only an audit of the financial statements
- only a check of the chart of accounts
- a formal external audit
- an assumption that an ERP automatically guarantees correctness
- an assumption that a balanced ledger means the transactions are economically correct
- a generic checklist without understanding the actual accounting flow

Priority:

**material misstatement > unauthorized posting > broken subledger-to-GL reconciliation > period-cutoff failure > unsupported manual journals > reporting inconsistency > control weakness > process inefficiency**

## 1. SYSTEM INVENTORY

Inventory:

- ERP/accounting software
- entities
- currencies
- ledgers
- subledgers
- integrations
- bank feeds
- payroll
- inventory
- fixed assets
- billing
- AP
- AR
- tax modules
- consolidation
- reporting tools

## 2. ACCOUNTING FLOW MAP

Map:

```text
business event
↓
source system
↓
subledger
↓
journal
↓
general ledger
↓
trial balance
↓
financial statement
```

## 3. CHART OF ACCOUNTS

Check:

- structure
- consistency
- obsolete accounts
- duplicate accounts
- uncontrolled free-text classification
- entity/department dimensions

## 4. MASTER DATA

Audit:

- customer
- supplier
- account
- tax code
- cost center
- product
- currency
- payment terms

## 5. USER ACCESS

## 6. ROLE SEGREGATION

## 7. JOURNAL ENTRY RIGHTS

## 8. POSTING RIGHTS

## 9. MASTER-DATA CHANGE RIGHTS

## 10. PERIOD OPEN/CLOSE RIGHTS

## 11. MANUAL JOURNALS

## 12. SUPPORTING EVIDENCE

## 13. APPROVAL

## 14. POSTING DATE

## 15. DOCUMENT DATE

## 16. PERIOD CUT-OFF

## 17. BACKDATED ENTRY

## 18. FUTURE-DATED ENTRY

## 19. REVERSING ENTRY

## 20. RECURRING JOURNAL

## 21. AUTO-POSTING

## 22. INTEGRATION POSTING

## 23. DUPLICATE POSTING

## 24. FAILED INTERFACE

## 25. PARTIAL INTERFACE

## 26. RETRY

## 27. IDEMPOTENCY

Where relevant.

## 28. SUBLEDGER RECONCILIATION

- AR to GL
- AP to GL
- inventory to GL
- fixed assets to GL
- payroll to GL
- bank to GL

## 29. CONTROL ACCOUNT

## 30. SUSPENSE ACCOUNT

## 31. CLEARING ACCOUNT

## 32. AGED UNRECONCILED ITEM

## 33. BANK RECONCILIATION

## 34. CASH

## 35. FX

## 36. MULTI-CURRENCY

## 37. REVALUATION

## 38. CONSOLIDATION

## 39. INTERCOMPANY

## 40. ELIMINATION

## 41. MINORITY INTEREST

If relevant.

## 42. TAX

## 43. VAT/GST/SALES TAX

Jurisdiction-specific.

## 44. WITHHOLDING

## 45. DEFERRED TAX

If in scope.

## 46. FIXED ASSETS

## 47. DEPRECIATION

## 48. DISPOSAL

## 49. INVENTORY

## 50. COSTING

## 51. COGS

## 52. PAYROLL

## 53. EXPENSE REIMBURSEMENT

## 54. PREPAID

## 55. ACCRUAL

## 56. PROVISION

## 57. REVENUE

Check that revenue is recognized in the right amount and period according to the contract, the delivery and the applicable accounting framework, and that it reconciles from contract to GL.

## 58. EXPENSE

Check the classification (COGS/OPEX, capex/opex), period, accruals and cost allocation.

## 59. AR

Check aging, cash application, unapplied cash, the allowance and the reconciliation of the AR subledger to the GL.

## 60. AP

Check the vendor master, bank detail changes, matching, duplicate invoices and payments, cut-off and the reconciliation of the AP subledger to the GL.

## 61. CLOSE

Check the close calendar, balance sheet reconciliations, late and top-side journals, period reopening and sign-off.

## 62. REPORTING

Check that reports and KPIs reconcile to the GL and that the same metric does not have several unexplained values.

## 63. INTERNAL CONTROLS

Check that key controls (approval, segregation of duties, reconciliations, master data, manual journals) exist, operate and leave evidence.

## 64. AUDIT TRAIL

For each material transaction, can you answer:

- Who created it?
- Who approved it?
- What source document supports it?
- When was it posted?
- Was it changed?
- How did it reach the financial statement?

## 65. CHANGE HISTORY

## 66. DELETION

Posted accounting records should have controlled correction semantics.

## 67. VOID

## 68. CORRECTION

## 69. DOCUMENT NUMBERING

## 70. DUPLICATE DOCUMENT

## 71. PERIOD LOCK

## 72. SOFT CLOSE

## 73. HARD CLOSE

## 74. REOPEN

## 75. CLOSE AFTER AUDIT

## 76. REPORTING BASIS

- GAAP
- IFRS
- local GAAP
- cash basis
- management basis

## 77. POLICY CONSISTENCY

## 78. ACCOUNTING POLICY CHANGE

## 79. ESTIMATE CHANGE

## 80. MATERIALITY

## 81. DATA EXPORT

## 82. SPREADSHEET ADJUSTMENT

High-risk if external reporting depends on manual off-system adjustment.

## 83. BACKUP

## 84. RESTORE

## 85. DR

## 86. RETENTION

## 87. ARCHIVE

## 88. SYSTEM MIGRATION

## 89. OPENING BALANCES

## 90. DATA CONVERSION

## 91. FALSE POSITIVE RULES

Do not automatically report:

- manual journal
- spreadsheet reconciliation
- suspense account
- reopened period
- custom chart of accounts

without a concrete risk or an unsupported state.

## 92. EVIDENCE TIERS

```text
A - reconciled ledger/source-document evidence
B - complete accounting-system transaction path
C - strong control/configuration evidence
D - suspected accounting/control issue requiring verification
E - hardening/process improvement
```

## 93. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 94. SEVERITY

P0:
- systemic accounting corruption or loss of auditability affecting material reporting

P1:
- repeatable material misstatement path
- unauthorized material posting
- broken critical reconciliation

P2:
- material control/process weakness

P3:
- limited reconciliation/process issue

P4:
- hardening

## 95. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Entity:
Module:
Account/subledger:
Period:
Transaction type:
Expected accounting:
Actual accounting:
Control:
Failure:
Financial-statement impact:
Evidence:
Root cause:
Remediation:
Validation:
```

## 96. MATRICES

### Accounting Flow Matrix

| Business event | Source | Subledger | GL account | Control |
|---|---|---|---|---|

### Reconciliation Matrix

| Subledger | GL | Frequency | Difference | Owner |
|---|---|---|---|---|

### Access Matrix

| Role | Create | Approve | Post | Reopen period |
|---|---|---|---|---|

## 97. SECOND PASS

Check in particular:

- manual journals at period end
- entries posted by administrators
- suspense accounts
- reopened periods
- failed interfaces
- unmatched subledger balances
- spreadsheet adjustments
- duplicate vendors/customers
- unusual backdated entries
- transactions without support

## 98. FINAL QUALITY GATE

Confirm:

- system architecture
- master data
- access
- journal controls
- cut-off
- reconciliations
- bank
- FX
- consolidation
- tax
- fixed assets
- inventory
- AR/AP
- close
- reporting
- audit trail
- backup/migration

## 99. OUTPUT

`ULTIMATE_ACCOUNTING_SYSTEM_AUDIT.md`

# FINAL RULE

An accounting system is not reliable because:

> trial balance debits = credits.

You must prove that:

```text
business event
+
classification
+
period
+
authorization
+
reconciliation
+
audit trail
```

together produce an economically correct record.
