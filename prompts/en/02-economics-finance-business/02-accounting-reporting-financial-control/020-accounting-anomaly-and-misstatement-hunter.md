---
id: UPL-BIZ-020
number: 20
slug: accounting-anomaly-and-misstatement-hunter
title: Accounting Anomaly & Misstatement Hunter
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# ACCOUNTING ANOMALY & MISSTATEMENT HUNTER

I want a deep, data-driven analysis of accounting anomalies and possible misstatements across the ledger, subledgers, reconciliations and financial statements.

Main objective:

> Find concrete inconsistencies, mismatches and patterns that may represent an accounting error, a classification problem, a cut-off issue or a material misstatement, with maximum protection against false positive conclusions and unfounded fraud accusations.

This is not:

- fraud accusation engine
- only anomaly scoring
- an "AI auditor" that draws conclusions without source documents
- a substitute for professional audit judgment

## 1. DATA SOURCES

- GL
- AR
- AP
- bank
- inventory
- fixed assets
- payroll
- revenue
- close reconciliations
- financial statements

## 2. COMPLETENESS

## 3. CROSS-SOURCE RECONCILIATION

## 4. GL VS SUBLEDGER

## 5. STATEMENT VS GL

## 6. BANK VS CASH

## 7. FIXED ASSET VS GL

## 8. INVENTORY VS GL

## 9. PAYROLL VS GL

## 10. PERIOD CUT-OFF

## 11. REVENUE CUT-OFF

## 12. EXPENSE CUT-OFF

## 13. DUPLICATE

## 14. MISSING

## 15. REVERSAL

## 16. LATE POSTING

## 17. BACKDATED

## 18. FUTURE-DATED

## 19. CLASSIFICATION

## 20. WRONG ACCOUNT

## 21. WRONG ENTITY

## 22. WRONG COST CENTER

## 23. WRONG CURRENCY

## 24. FX

## 25. ROUNDING

## 26. NEGATIVE BALANCE

## 27. UNUSUAL BALANCE DIRECTION

## 28. RECONCILING ITEM

## 29. AGED ITEM

## 30. SUSPENSE

## 31. CLEARING

## 32. MANUAL JOURNAL

## 33. ADMIN JOURNAL

## 34. END-OF-PERIOD

## 35. MATERIALITY

## 36. TREND BREAK

## 37. RATIO BREAK

## 38. ACCOUNT RELATIONSHIP

## 39. REVENUE VS RECEIVABLE

## 40. COGS VS INVENTORY

## 41. PAYROLL VS HEADCOUNT

## 42. DEPRECIATION VS FIXED ASSET

## 43. INTEREST VS DEBT

## 44. TAX VS PRE-TAX

## 45. CASH FLOW VS BALANCE MOVEMENT

## 46. ACCRUAL

## 47. PROVISION

## 48. PREPAID

## 49. CAPITALIZATION

## 50. WRITE-OFF

## 51. RESERVE

## 52. DUPLICATE VENDOR

## 53. DUPLICATE CUSTOMER

## 54. PAYMENT ANOMALY

## 55. COLLECTION ANOMALY

## 56. MISSING LIABILITY

## 57. UNRECORDED ASSET

## 58. STATISTICAL OUTLIER

## 59. BENFORD

Only where valid.

## 60. CLUSTER

## 61. RULE-BASED SIGNAL

## 62. MULTI-SIGNAL

More useful than isolated anomaly.

## 63. MATERIALITY WEIGHTING

## 64. FALSE POSITIVE CONTROL

Mandatory.

Possible legitimate explanations must be listed.

## 65. FRAUD LANGUAGE

Never infer intent without evidence.

## 66. EVIDENCE TIERS

```text
A - source-document/reconciliation proves misstatement
B - deterministic accounting inconsistency
C - strong multi-signal anomaly
D - anomaly requiring verification
E - exploratory signal
```

## 67. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
EXPLAINED
NOT APPLICABLE
```

## 68. SEVERITY

P0:
- systemic catastrophic material misstatement/data corruption

P1:
- confirmed/repeatable material accounting error

P2:
- potentially material anomaly requiring urgent verification

P3:
- limited misclassification/control issue

P4:
- analytical/hardening signal

## 69. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Entity:
Account/source:
Period:
Amount:
Signal:
Expected relationship:
Observed relationship:
Potential misstatement:
Alternative explanations:
Evidence:
Additional evidence needed:
Conclusion:
Correction/control:
```

## 70. ANOMALY MATRIX

| Signal | Amount | Materiality | Evidence | Status |
|---|---|---|---|---|

## 71. SECOND PASS

Search specifically:

- period-end anomalies
- revenue/AR mismatch
- inventory/COGS mismatch
- unexplained cash movement
- manual journals
- aged reconciling items
- repeated corrections
- missing liabilities
- classification changes

## 72. FINAL QUALITY GATE

Confirm:

- source completeness
- reconciliation
- materiality
- period
- classification
- trends
- accounting relationships
- alternative explanations
- fraud intent not inferred
- evidence requirements clear

## 73. OUTPUT

`ACCOUNTING_ANOMALY_MISSTATEMENT_HUNTER.md`

# FINAL RULE

An anomaly is the start of an investigation, not a conclusion.

The best finding states:

```text
what deviates
+
how large the potential financial effect is
+
which legitimate explanations exist
+
which evidence distinguishes between the explanations
```
