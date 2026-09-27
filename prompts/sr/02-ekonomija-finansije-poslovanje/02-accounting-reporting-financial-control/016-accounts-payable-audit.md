---
id: UPL-BIZ-016
number: 16
slug: accounts-payable-audit
title: Audit obaveza prema dobavljačima
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# AUDIT OBAVEZA PREMA DOBAVLJAČIMA

Želim dubok audit Accounts Payable procesa od vendor master-a i purchase request-a do payment-a i GL reconciliation-a.

Glavni cilj:

> Utvrditi da li kompanija plaća stvarne, odobrene i ispravno evidentirane obaveze tačnom dobavljaču, u tačnom iznosu i trenutku, bez duplicate payment-a, unauthorized vendor change-a ili propuštenih liabilities.

Ovo nije:

- samo duplicate-payment scan
- automatska fraud optužba
- pretpostavka da svaka promena vendor bank detalja znači prevaru
- procurement strategija ili pregovaranje sa dobavljačima

## 1. VENDOR MASTER

## 2. VENDOR CREATION

## 3. VENDOR CHANGE

## 4. BANK ACCOUNT CHANGE

High-risk.

## 5. DUPLICATE VENDOR

## 6. INACTIVE VENDOR

## 7. RELATED PARTY

## 8. PO

## 9. REQUISITION

## 10. APPROVAL

## 11. GOODS RECEIPT

## 12. SERVICE RECEIPT

## 13. INVOICE

## 14. THREE-WAY MATCH

## 15. TWO-WAY MATCH

## 16. NON-PO INVOICE

## 17. DUPLICATE INVOICE

## 18. SAME AMOUNT

Signal only.

## 19. SPLIT INVOICE

Potential approval circumvention.

## 20. TAX

## 21. CURRENCY

## 22. PAYMENT TERMS

## 23. EARLY PAYMENT DISCOUNT

## 24. LATE PAYMENT

## 25. PAYMENT RUN

## 26. PAYMENT APPROVAL

## 27. SEGREGATION

## 28. BANK FILE

## 29. PAYMENT API

## 30. MANUAL PAYMENT

## 31. URGENT PAYMENT

High-value review.

## 32. PAYMENT CONFIRMATION

## 33. DUPLICATE PAYMENT

## 34. CANCELLED PAYMENT

## 35. FAILED PAYMENT

## 36. RETRY

## 37. UNKNOWN PAYMENT OUTCOME

## 38. CREDIT NOTE

## 39. VENDOR REFUND

## 40. UNMATCHED LIABILITY

## 41. UNRECORDED LIABILITY

## 42. GRNI/GRIR

If relevant.

## 43. ACCRUAL

## 44. PERIOD CUT-OFF

## 45. AP AGING

## 46. NEGATIVE AP

## 47. DEBIT BALANCE

## 48. SUPPLIER CONCENTRATION

## 49. SUPPLY RISK

## 50. RECONCILIATION

AP subledger -> GL.

## 51. FRAUD RISK SIGNAL

Do not equate with fraud.

## 52. FALSE POSITIVE RULES

Manual payment is not automatically wrong.

Duplicate amount is not duplicate invoice proof.

Vendor bank change is not suspicious by itself.

## 53. EVIDENCE TIERS

```text
A - PO/invoice/receipt/payment/bank evidence
B - complete AP transaction path
C - strong control/anomaly evidence
D - suspicious pattern requiring verification
E - hardening
```

## 54. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
```

## 55. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Vendor:
Invoice:
Payment:
Amount:
Approval:
Match status:
Issue:
Cash impact:
Evidence:
Root cause:
Recommended control/action:
```

## 56. AP MATRIX

| Vendor | Balance | Due | Payment terms | Risk |
|---|---|---|---|---|

## 57. SECOND PASS

Review:

- duplicate invoices
- vendor bank changes
- urgent/manual payments
- split invoices
- unmatched receipts
- old debit balances
- post-period invoices
- payments without PO where PO required

## 58. FINAL QUALITY GATE

Confirm:

- vendor master
- PO
- invoice
- receipt
- matching
- approval
- payment
- bank details
- cut-off
- accrual
- reconciliation

## 59. OUTPUT

`ACCOUNTS_PAYABLE_AUDIT.md`

# KONAČNO PRAVILO

AP audit mora pratiti kompletan dokazni lanac:

```text
real supplier
+
real obligation
+
approved purchase
+
received value
+
correct invoice
+
correct payment
```
