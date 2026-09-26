---
id: UPL-BIZ-007
number: 7
slug: financial-model-audit
title: Financial Model Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# FINANCIAL MODEL AUDIT

I want a forensic audit of an Excel, Sheets or programmatic financial model with a focus on formula correctness, assumptions, circularity, hardcodes, scenario logic, units, timing and output reliability.

Main objective:

> Prove that the model does, mathematically and economically, what it claims to do.

This is not:

- a formatting audit
- a preference for a particular spreadsheet style
- automatic criticism of hardcoded assumptions
- a replacement for business validation

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

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (the model output used for the decision (value, NPV, cash balance, covenant test)) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate or a scenario as a fact.

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

# FINAL RULE

A model is not correct because it has no Excel error.

A model is correct only when:

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

produce a consistent result.
