---
id: UPL-BIZ-012
number: 12
slug: general-ledger-forensic-audit
title: Forenzički audit glavne knjige
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# FORENZIČKI AUDIT GLAVNE KNJIGE

Želim dubok forenzički audit General Ledger-a sa fokusom na neobične journals, period-end activity, unsupported postings, duplicate patterns, round-number entries, unusual users/accounts i entries koji mogu menjati reported results.

Glavni cilj:

> Identifikovati anomalne GL postings koji zahtevaju dodatnu verifikaciju, bez pretvaranja statističkog signala u optužbu za fraud.

Ovo nije:

- automatski fraud detector
- Benford-only analiza
- označavanje svakog manual journal-a
- pretpostavka da round number znači manipulaciju

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** može materijalno da promeni reported results ili ključni balans; **MEDIUM** menja ključni account ili trend, ali ne i ukupan zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (npr. profit before tax, revenue ili ukupna aktiva) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je exploratory signal, a ne finding. Anomalija sa dokumentovanim legitimnim objašnjenjem dobija status EXPLAINED.

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

# KONAČNO PRAVILO

GL forensic audit treba da kaže:

> Ovo je anomalija zato što odstupa od konkretnog istorijskog/accounting pattern-a i zahteva sledeći dokaz.

Ne:

> Ovo izgleda čudno, dakle prevara.
