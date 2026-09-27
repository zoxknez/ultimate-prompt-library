---
id: UPL-BIZ-014
number: 14
slug: expense-and-cost-accounting-audit
title: Audit rashoda i troškovnog računovodstva
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# AUDIT RASHODA I TROŠKOVNOG RAČUNOVODSTVA

Želim dubok audit expense recognition-a, cost classification-a, accrual-a, capitalization-a i cost allocation-a.

Glavni cilj:

> Utvrditi da li costs završavaju u pravom periodu, account-u, entity-ju, cost center-u i ekonomskom category-ju, bez nepravilnog kapitalizovanja, odlaganja ili arbitrary allocation-a koji menja reported profitability.

## 1. COST MAP

Inventariši:

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

Status findinga: CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED dok se policy ne potvrdi; tier E je HARDENING. Severity prati efekat na reported profit, klasifikaciju i cash: **P0** sistemski materijalni misstatement troškova; **P1** ponovljiva materijalna greška u klasifikaciji, periodu ili kapitalizaciji; **P2** materijalni control ili policy gap; **P3** ograničen problem u procesu; **P4** hardening.

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

# KONAČNO PRAVILO

Expense accounting treba da prati ekonomsku prirodu i period troška, ne samo način na koji invoice ulazi u sistem.
