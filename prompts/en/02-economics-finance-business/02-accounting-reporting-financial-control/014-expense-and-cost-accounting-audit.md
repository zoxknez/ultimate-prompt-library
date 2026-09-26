---
id: UPL-BIZ-014
number: 14
slug: expense-and-cost-accounting-audit
title: Expense & Cost Accounting Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# EXPENSE & COST ACCOUNTING AUDIT

I want a deep audit of expense recognition, cost classification, accruals, capitalization and cost allocation.

Main objective:

> Determine whether costs end up in the right period, account, entity, cost center and economic category, without improper capitalization, deferral or arbitrary allocation that changes reported profitability.

## 1. COST MAP

Inventory:

- payroll
- materials
- freight
- rent
- utilities
- software
- marketing
- commissions
- professional services
- depreciation
- travel
- taxes
- financing costs

## 2. DIRECT VS INDIRECT

## 3. FIXED VS VARIABLE

## 4. COGS VS OPEX

## 5. CAPEX VS OPEX

## 6. CAPITALIZATION POLICY

## 7. DEVELOPMENT COST

## 8. SOFTWARE

## 9. REPAIR VS IMPROVEMENT

## 10. ACCRUAL

## 11. PREPAID

## 12. PROVISION

## 13. INVOICE TIMING

## 14. SERVICE PERIOD

## 15. CUT-OFF

## 16. PURCHASE ORDER

## 17. GOODS RECEIPT

## 18. THREE-WAY MATCH

## 19. NON-PO EXPENSE

## 20. EMPLOYEE EXPENSE

## 21. CORPORATE CARD

## 22. DUPLICATE EXPENSE

## 23. DUPLICATE INVOICE

## 24. VENDOR CREDIT

## 25. REFUND

## 26. COST CENTER

## 27. DEPARTMENT

## 28. PRODUCT

## 29. PROJECT

## 30. ALLOCATION KEY

## 31. SHARED COST

## 32. TRANSFER PRICING

If relevant.

## 33. INTERCOMPANY

## 34. FX

## 35. TAX

## 36. NON-DEDUCTIBLE

Tax treatment only if scope/jurisdiction confirmed.

## 37. PAYROLL ACCRUAL

## 38. BONUS

## 39. COMMISSION

## 40. VACATION/PTO

## 41. STOCK COMPENSATION

## 42. DEPRECIATION

## 43. AMORTIZATION

## 44. IMPAIRMENT

## 45. PERIOD TREND

## 46. VENDOR TREND

## 47. UNUSUAL SPIKE

## 48. ROUND NUMBER

## 49. MANUAL JOURNAL

## 50. FALSE POSITIVE RULES

High expense is not automatically inefficient.

Capitalization is not automatically aggressive.

Allocation is not automatically misleading.

## 51. EVIDENCE TIERS

```text
A - invoice/contract/payroll/source-document and ledger proof
B - complete accounting flow
C - strong analytical evidence
D - classification requiring policy confirmation
E - control hardening
```

Finding status: CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED until the policy is confirmed; tier E is HARDENING. Severity follows the effect on reported profit, classification and cash: **P0** systemic material misstatement of costs; **P1** repeatable material error in classification, period or capitalization; **P2** material control or policy gap; **P3** limited process issue; **P4** hardening.

## 52. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Expense:
Vendor/cost center:
Period:
Current classification:
Expected classification:
Timing:
Amount:
Profit impact:
Cash impact:
Evidence:
Policy:
Remediation:
```

## 53. COST MATRIX

| Cost | Classification | Period | Allocation | Evidence |
|---|---|---|---|---|

## 54. SECOND PASS

Review:

- period-end accruals
- capitalization
- duplicate invoices
- shared-cost allocations
- payroll accrual
- prepaid balances
- vendor credits
- manual journals

## 55. FINAL QUALITY GATE

Confirm:

- classification
- timing
- capex/opex
- COGS/OPEX
- accrual
- prepaid
- allocation
- payroll
- vendor
- reconciliation

## 56. OUTPUT

`EXPENSE_COST_ACCOUNTING_AUDIT.md`

# FINAL RULE

Expense accounting should follow the economic nature and period of the cost, not just the way the invoice enters the system.
