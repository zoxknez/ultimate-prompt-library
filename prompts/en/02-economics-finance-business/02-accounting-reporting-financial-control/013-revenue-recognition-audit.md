---
id: UPL-BIZ-013
number: 13
slug: revenue-recognition-audit
title: Revenue Recognition Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# REVENUE RECOGNITION AUDIT

I want a deep audit of the revenue recognition process and the evidence chain from contract/order to invoice, delivery/performance obligation, journal and financial statement.

Main objective:

> Determine whether revenue arises in the right amount, period and entity according to the actual contractual/economic event and the applicable accounting framework.

This is not:

- legal advice
- automatically applying IFRS 15/ASC 606 without establishing the framework
- only an invoice-to-GL reconciliation
- an assumption that invoicing date = revenue recognition date

## 1. ACCOUNTING FRAMEWORK

Always establish:

- IFRS
- US GAAP
- local GAAP
- other

If unknown:

**ACCOUNTING FRAMEWORK: NOT VERIFIED**

## 2. REVENUE STREAMS

For each:

```text
Revenue stream:
Contract type:
Customer:
Performance obligation:
Billing timing:
Recognition timing:
Variable consideration:
Refund/return:
```

## 3. CONTRACT

## 4. ORDER

## 5. PERFORMANCE OBLIGATION

## 6. DELIVERY

## 7. ACCEPTANCE

## 8. SERVICE PERIOD

## 9. SUBSCRIPTION

## 10. USAGE

## 11. MILESTONE

## 12. LICENSE

## 13. PROFESSIONAL SERVICES

## 14. BUNDLE

## 15. DISCOUNT

## 16. ALLOCATION

## 17. VARIABLE CONSIDERATION

## 18. BONUS

## 19. PENALTY

## 20. REFUND

## 21. RETURN

## 22. CANCELLATION

## 23. CREDIT NOTE

## 24. DEFERRED REVENUE

## 25. CONTRACT ASSET

## 26. CONTRACT LIABILITY

## 27. UNBILLED REVENUE

## 28. BILLING IN ADVANCE

## 29. BILLING IN ARREARS

## 30. CUT-OFF

Critical.

## 31. PERIOD-END SHIPMENT

## 32. CUSTOMER ACCEPTANCE

## 33. BILL-AND-HOLD

Only if relevant.

## 34. CONSIGNMENT

## 35. PRINCIPAL VS AGENT

## 36. GROSS VS NET

## 37. MARKETPLACE

## 38. COMMISSION

## 39. PAYMENT PROCESSOR

## 40. MULTI-CURRENCY

## 41. FX

## 42. TAX

Tax is usually not revenue where pass-through, depending on the framework.

## 43. RELATED PARTY

## 44. INTERCOMPANY

## 45. MANUAL JOURNAL

## 46. SYSTEM AUTOMATION

## 47. RECONCILIATION

Contract/order -> invoice -> subledger -> GL.

## 48. REFUND RESERVE

## 49. BAD DEBT

Distinguish from revenue recognition.

## 50. CHURN

## 51. CONTRACT MODIFICATION

## 52. UPGRADE

## 53. DOWNGRADE

## 54. RENEWAL

## 55. FREE TRIAL

## 56. PROMOTIONAL CREDIT

## 57. GIFT CARD/CREDIT

## 58. LOYALTY

## 59. DATA QUALITY

## 60. FALSE POSITIVE RULES

Invoice before recognition is not automatically wrong.

Revenue before cash is not automatically wrong.

Deferred revenue is not a problem by itself.

## 61. EVIDENCE TIERS

```text
A - contract/delivery/ledger evidence proves recognition treatment
B - complete system transaction path
C - strong accounting pattern evidence
D - treatment requires contractual/framework verification
E - control hardening
```

## 62. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
```

## 63. SEVERITY

P0:
- systemic material revenue misstatement

P1:
- repeatable material cut-off/recognition error

P2:
- material control/contract-treatment gap

P3:
- limited revenue-process issue

P4:
- hardening

## 64. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Revenue stream:
Contract:
Performance obligation:
Billing:
Recognition:
Period:
Expected accounting:
Actual accounting:
Amount/materiality:
Evidence:
Framework basis:
Remediation:
Regression/control:
```

## 65. REVENUE MATRIX

| Stream | Billing | Recognition | Deferred/unbilled | Control |
|---|---|---|---|---|

## 66. SECOND PASS

Test:

- period-end transactions
- refunds
- cancellations
- bundles
- modifications
- advance billing
- principal/agent
- customer acceptance
- manual adjustments

## 67. FINAL QUALITY GATE

Confirm:

- framework
- streams
- contracts
- obligations
- timing
- amount
- variable consideration
- cut-off
- deferred/unbilled
- refunds
- gross/net
- reconciliation

## 68. OUTPUT

`REVENUE_RECOGNITION_AUDIT.md`

# FINAL RULE

Revenue is the accounting result of a satisfied economic obligation under the applicable framework, not just the moment an invoice was created or cash was received.
