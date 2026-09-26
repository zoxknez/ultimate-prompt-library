---
id: UPL-BIZ-015
number: 15
slug: accounts-receivable-audit
title: Accounts Receivable Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# ACCOUNTS RECEIVABLE AUDIT

I want a deep audit of the Accounts Receivable process from customer master and billing to collection, cash application, credit risk and write-off.

Main objective:

> Determine whether the AR balance represents genuinely collectible receivables and whether the process reliably prevents duplicate billing, wrong cash application, stale receivables and uncontrolled credit exposure.

This is not:

- only an aging report
- a customer credit rating without evidence
- an assumption that every overdue receivable is uncollectible
- legal advice on collection or litigation

## 1. CUSTOMER MASTER

## 2. DUPLICATE CUSTOMER

## 3. CREDIT TERMS

## 4. CREDIT LIMIT

## 5. BILLING

## 6. INVOICE

## 7. INVOICE DATE

## 8. DUE DATE

## 9. TAX

## 10. CURRENCY

## 11. CREDIT NOTE

## 12. REFUND

## 13. DISPUTE

## 14. RECEIVABLE AGING

Buckets.

## 15. DSO

## 16. OVERDUE

## 17. VERY OLD BALANCE

## 18. COLLECTION

## 19. REMINDER

## 20. DUNNING

## 21. PROMISE TO PAY

## 22. PAYMENT

## 23. CASH APPLICATION

## 24. UNAPPLIED CASH

## 25. PARTIAL PAYMENT

## 26. OVERPAYMENT

## 27. SHORT PAYMENT

## 28. DEDUCTION

## 29. BANK RECONCILIATION

## 30. LOCKBOX/PROCESSOR

## 31. FX DIFFERENCE

## 32. BAD DEBT

## 33. ALLOWANCE

## 34. EXPECTED CREDIT LOSS

Framework-sensitive.

## 35. WRITE-OFF

## 36. RECOVERY

## 37. COLLECTION AGENCY

## 38. FACTORING

## 39. RECEIVABLE SALE

## 40. CUSTOMER CONCENTRATION

## 41. COUNTRY

## 42. INDUSTRY

## 43. PAYMENT BEHAVIOR

## 44. CREDIT RISK

## 45. RELATED PARTY

## 46. RECONCILIATION

AR subledger -> GL.

## 47. NEGATIVE AR

## 48. CUSTOMER CREDIT BALANCE

## 49. STALE UNAPPLIED CASH

## 50. FALSE POSITIVE RULES

Long DSO may reflect contractual terms.

Old balance may be secured/disputed.

Customer credit balance is not automatically error.

## 51. EVIDENCE TIERS

```text
A - invoice/payment/bank/contract evidence
B - reconciled AR subledger evidence
C - strong aging/payment pattern
D - credit-risk inference
E - process hardening
```

## 52. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
```

## 53. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Customer:
Invoice:
Amount:
Age:
Terms:
Payment history:
Issue:
Collectability:
Cash impact:
Evidence:
Recommended action:
```

## 54. AR MATRIX

| Customer | Balance | Overdue | DSO/payment | Risk |
|---|---|---|---|---|

## 55. SECOND PASS

Review:

- top overdue
- largest customers
- negative balances
- unapplied cash
- disputed invoices
- write-offs
- post-period cash collections
- duplicate billing

## 56. FINAL QUALITY GATE

Confirm:

- customer master
- invoice
- terms
- aging
- collections
- cash application
- allowance
- write-off
- concentration
- reconciliation

## 57. OUTPUT

`ACCOUNTS_RECEIVABLE_AUDIT.md`

# FINAL RULE

AR is not just the sum of open invoices.

The audit must answer:

> How much of the balance is actually collectible, when it will be collected and which process/control problems can prevent the receivables from turning into cash?
