---
id: UPL-BIZ-012
number: 12
slug: general-ledger-forensic-audit
title: General Ledger Forensic Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# GENERAL LEDGER FORENSIC AUDIT

I want a deep forensic audit of the General Ledger focused on unusual journals, period-end activity, unsupported postings, duplicate patterns, round-number entries, unusual users/accounts and entries that can change reported results.

Main objective:

> Identify anomalous GL postings that require additional verification, without turning a statistical signal into an accusation of fraud.

This is not:

- an automatic fraud detector
- a Benford-only analysis
- flagging every manual journal
- an assumption that a round number means manipulation

## 1. DATA INTEGRITY

Validate:

- completeness
- duplicate rows
- account mapping
- entity
- dates
- users
- document IDs
- debits/credits
- currency

## 2. PERIOD

## 3. POSTING DATE

## 4. DOCUMENT DATE

## 5. CREATED DATE

## 6. USER

## 7. SOURCE MODULE

## 8. MANUAL VS AUTOMATED

## 9. JOURNAL TYPE

## 10. REVERSAL

## 11. POSTING TIME

Outside normal hours is signal, not proof.

## 12. WEEKEND

## 13. PERIOD END

## 14. YEAR END

## 15. POST-CLOSE

## 16. REOPENED PERIOD

## 17. ROUND NUMBER

## 18. LARGE VALUE

## 19. MATERIALITY

## 20. UNUSUAL ACCOUNT

## 21. RARE ACCOUNT COMBINATION

## 22. UNUSUAL DEBIT/CREDIT DIRECTION

## 23. SUSPENSE

## 24. REVENUE

## 25. RESERVE

## 26. PROVISION

## 27. ACCRUAL

## 28. CAPITALIZATION

## 29. CASH

## 30. RELATED PARTY

## 31. MANAGEMENT USER

## 32. ADMIN USER

## 33. SAME USER CREATE/APPROVE

## 34. JOURNAL DESCRIPTION

## 35. BLANK DESCRIPTION

## 36. GENERIC DESCRIPTION

## 37. SUPPORTING DOCUMENT

## 38. REPEATED JOURNAL

## 39. DUPLICATE AMOUNT

## 40. DUPLICATE REFERENCE

## 41. SPLIT TRANSACTION

Below approval threshold.

## 42. OFFSETTING ENTRY

## 43. RAPID REVERSAL

## 44. LATE REVERSAL

## 45. UNUSUAL COUNTERPARTY ACCOUNT

## 46. JOURNAL SEQUENCE

## 47. MISSING NUMBER

## 48. CURRENCY

## 49. FX

## 50. INTERCOMPANY

## 51. ELIMINATION

## 52. BENFORD

Use only as exploratory signal where statistically appropriate.

## 53. DISTRIBUTION ANALYSIS

## 54. Z-SCORE/OUTLIER

## 55. TIME SERIES

## 56. USER BASELINE

## 57. ACCOUNT BASELINE

## 58. TEXT ANALYSIS

## 59. CLUSTER

Only if useful.

## 60. FALSE POSITIVE RULES

Anomaly != error.

Error != fraud.

Fraud != proven without direct evidence.

## 61. EVIDENCE TIERS

```text
A - journal + supporting document proves issue
B - deterministic GL/control inconsistency
C - strong multi-signal anomaly
D - statistical anomaly requiring verification
E - exploratory signal
```

Materiality is the severity scale of this analysis: **HIGH** can materially change reported results or a key balance; **MEDIUM** changes a key account or trend but not the overall conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (for example profit before tax, revenue or total assets) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is an exploratory signal, not a finding. An anomaly with a documented legitimate explanation gets the status EXPLAINED.

## 62. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
EXPLAINED
NOT APPLICABLE
```

## 63. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Journal:
Account:
User:
Date/time:
Amount:
Anomaly:
Expected pattern:
Actual pattern:
Possible legitimate explanation:
Evidence:
Additional evidence needed:
Conclusion:
```

## 64. ANOMALY MATRIX

| Journal | Amount | Signal | Materiality | Status |
|---|---|---|---|---|

## 65. SECOND PASS

Search specifically:

- period-end manual entries
- admin users
- revenue/provision journals
- unusual account pairings
- reversals
- split journals
- post-close journals
- missing support

## 66. FINAL QUALITY GATE

Confirm:

- completeness
- materiality
- account behavior
- user behavior
- timing
- reversals
- support
- statistical signals correctly qualified

## 67. OUTPUT

`GENERAL_LEDGER_FORENSIC_AUDIT.md`

# FINAL RULE

A GL forensic audit should say:

> This is an anomaly because it deviates from a specific historical/accounting pattern and requires the following evidence.

Not:

> This looks strange, therefore it is fraud.
