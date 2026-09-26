---
id: UPL-BIZ-007
number: 7
slug: financial-model-audit
title: Financial Model Audit
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# FINANCIAL MODEL AUDIT

Želim forenzički audit Excel/Sheets/programmatic financial model-a sa fokusom na formula correctness, assumptions, circularity, hardcodes, scenario logic, units, timing i output reliability.

Glavni cilj:

> Dokazati da model matematički i ekonomski radi ono što tvrdi da radi.

Ovo nije:

- formatting audit
- preference for a particular spreadsheet style
- automatska kritika hardcoded assumptions
- replacement for business validation

## 1. MODEL PURPOSE

## 2. INPUTS

## 3. CALCULATIONS

## 4. OUTPUTS

## 5. DATA FLOW

Map:

```text
source
↓
input
↓
calculation
↓
statement
↓
decision output
```

## 6. HARD-CODE

Hardcode is acceptable in designated assumption cell.

## 7. HARD-CODE IN FORMULA

Review.

## 8. BROKEN LINK

## 9. EXTERNAL LINK

## 10. CIRCULAR REFERENCE

## 11. INTENTIONAL CIRCULARITY

## 12. ITERATIVE CALCULATION

## 13. FORMULA COPY

## 14. RANGE ERROR

## 15. OFF-BY-ONE

## 16. SIGN

## 17. UNIT

## 18. CURRENCY

## 19. THOUSANDS/MILLIONS

## 20. PERCENT

## 21. DATE

## 22. MONTH/YEAR

## 23. LEAP YEAR

## 24. TIMING

## 25. BEGINNING/ENDING BALANCE

## 26. CASH FLOW

## 27. BALANCE CHECK

## 28. THREE-STATEMENT

## 29. RETAINED EARNINGS

## 30. DEBT ROLL-FORWARD

## 31. PP&E ROLL-FORWARD

## 32. WORKING CAPITAL

## 33. TAX

## 34. SCENARIO SWITCH

## 35. SENSITIVITY

## 36. DATA TABLE

## 37. LOOKUP

## 38. XLOOKUP/INDEX-MATCH

## 39. ERROR SUPPRESSION

IFERROR can hide broken model.

## 40. BLANK VS ZERO

## 41. NEGATIVE

## 42. CAP

## 43. FLOOR

## 44. ASSUMPTION

## 45. SOURCE

## 46. MODEL CHECK

## 47. CONTROL TOTAL

## 48. BALANCE SHEET CHECK

## 49. CASH CHECK

## 50. MODEL STRESS

## 51. EXTREME INPUT

## 52. ZERO REVENUE

## 53. NEGATIVE GROWTH

## 54. HIGH INTEREST

## 55. SENSITIVITY MONOTONICITY

Where expected.

## 56. OUTPUT

## 57. CHART

Do not audit visual formatting unless it changes interpretation.

## 58. VERSION

## 59. CHANGE LOG

## 60. FALSE POSITIVE RULES

Hardcoded assumption is not an error if intentional and documented.

Circularity is not always wrong.

## 61. EVIDENCE TIERS

```text
A - formula traced and recalculated independently
B - deterministic model inconsistency
C - strong structural anomaly
D - suspected issue requiring business confirmation
E - modeling hardening
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (izlaz modela koji se koristi za odluku (vrednost, NPV, stanje cash-a, covenant test)) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

## 62. FINDING FORMAT

```text
ID:
Materiality:
Sheet/module:
Cell/formula:
Status:
Evidence tier:
Expected logic:
Actual logic:
Impact:
Affected outputs:
Evidence:
Fix:
Independent verification:
```

## 63. MODEL CHECK MATRIX

| Area | Control | Pass | Notes |
|---|---|---|---|

## 64. SECOND PASS

Change key inputs and verify:

- outputs respond correctly
- no broken hardcodes
- statements balance
- scenarios remain internally consistent

## 65. FINAL QUALITY GATE

Confirm:

- formulas
- units
- timing
- assumptions
- statements
- debt
- cash
- scenarios
- controls
- outputs

## 66. OUTPUT

`FINANCIAL_MODEL_AUDIT.md`

# KONAČNO PRAVILO

Model nije tačan zato što nema Excel error.

Model je tačan tek kada:

```text
formula
+
economic logic
+
timing
+
units
+
statement relationships
```

daju konzistentan rezultat.
