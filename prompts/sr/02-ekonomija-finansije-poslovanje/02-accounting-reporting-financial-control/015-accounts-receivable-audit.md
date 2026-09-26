---
id: UPL-BIZ-015
number: 15
slug: accounts-receivable-audit
title: Accounts Receivable Audit
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# ACCOUNTS RECEIVABLE AUDIT

Želim dubok audit Accounts Receivable procesa od customer master-a i billing-a do collection-a, cash application-a, credit risk-a i write-off-a.

Glavni cilj:

> Utvrditi da li AR balance predstavlja stvarno naplativa potraživanja i da li proces pouzdano sprečava duplicate billing, pogrešnu cash application, zastarela potraživanja i nekontrolisan credit exposure.

Ovo nije:

- samo aging report
- credit rating kupaca bez dokaza
- pretpostavka da je svako overdue potraživanje nenaplativo
- pravni savet o naplati ili sudskom postupku

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

# KONAČNO PRAVILO

AR nije samo zbir otvorenih invoice-a.

Audit mora odgovoriti:

> Koliki deo balance-a je stvarno naplativ, kada će biti naplaćen i koji process/control problemi mogu sprečiti pretvaranje potraživanja u cash?
