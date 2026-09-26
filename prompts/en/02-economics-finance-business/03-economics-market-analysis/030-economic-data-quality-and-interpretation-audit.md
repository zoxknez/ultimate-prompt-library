---
id: UPL-BIZ-030
number: 30
slug: economic-data-quality-and-interpretation-audit
title: Economic Data Quality & Interpretation Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Economics & Market Analysis
subcategory_id: economics-market-analysis
language: en
version: 1.0.0
status: stable
---

# ECONOMIC DATA QUALITY & INTERPRETATION AUDIT

I want a forensic audit of the quality of economic, market and statistical data before they are used for serious conclusions.

Main objective:

> Determine whether the dataset or indicator is reliable, comparable and methodologically appropriate enough for the specific conclusion, and prevent wrong interpretations caused by revisions, denominators, a nominal/real mix, seasonal effects or definition changes.

This is not:

- automatically rejecting estimated data
- only a missing-value check
- a statistical analysis without understanding the methodology
- correcting source data without documenting it

## 1. SOURCE

## 2. SOURCE AUTHORITY

## 3. ORIGINAL SOURCE

Prefer original over copied secondary chart.

## 4. DATASET VERSION

## 5. RELEASE DATE

## 6. REFERENCE PERIOD

## 7. REVISION DATE

## 8. VINTAGE

Critical for macro analysis.

## 9. DEFINITION

## 10. UNIT

## 11. CURRENCY

## 12. PRICE BASIS

- current
- constant
- chain-linked

## 13. NOMINAL/REAL

## 14. INDEX

## 15. BASE YEAR

## 16. SEASONAL ADJUSTMENT

## 17. ANNUALIZATION

## 18. FREQUENCY

## 19. POPULATION

## 20. SAMPLE

## 21. WEIGHT

## 22. SURVEY DESIGN

## 23. RESPONSE RATE

## 24. ESTIMATION

## 25. IMPUTATION

## 26. BENCHMARK REVISION

## 27. METHODOLOGY CHANGE

## 28. SERIES BREAK

## 29. RECLASSIFICATION

## 30. GEOGRAPHY CHANGE

## 31. POPULATION CHANGE

## 32. DENOMINATOR

## 33. PER CAPITA

## 34. PPP

## 35. FX CONVERSION

## 36. INFLATION ADJUSTMENT

## 37. MISSING DATA

## 38. STRUCTURAL NA

Different from missing.

## 39. ZERO

Zero is not missing.

## 40. OUTLIER

## 41. DATA ERROR

## 42. TRUE EXTREME

## 43. DUPLICATE

## 44. AGGREGATION

## 45. WEIGHTED AVERAGE

## 46. SIMPLE AVERAGE

## 47. MEDIAN

## 48. RATE

## 49. LEVEL

## 50. GROWTH

## 51. CAGR

## 52. INDEX CHANGE

## 53. CONTRIBUTION

## 54. SHARE

## 55. PERCENTAGE POINT

## 56. PERCENT CHANGE

Critical distinction.

## 57. STOCK/FLOW

## 58. GROSS/NET

## 59. REVISION BIAS

## 60. REAL-TIME DATA

## 61. SURVIVORSHIP

## 62. SELECTION BIAS

## 63. COVERAGE BIAS

## 64. LOOK-AHEAD BIAS

## 65. PUBLICATION LAG

## 66. COMPARABILITY

Across countries/time.

## 67. METHODOLOGICAL BREAK

## 68. PROXY

## 69. PROXY VALIDITY

## 70. ALTERNATIVE DATA

## 71. SCRAPED DATA

## 72. MANUAL MAPPING

## 73. INTERPOLATION

Must be explicitly disclosed.

## 74. EXTRAPOLATION

## 75. FORECAST DATA

Must not be mixed with actual unnoticed.

## 76. PRELIMINARY

## 77. ESTIMATE

## 78. FINAL

## 79. SOURCE CONFLICT

## 80. RECONCILIATION

## 81. META DATA

## 82. DOCUMENTATION

## 83. LINEAGE

Map:

```text
original source
↓
extraction
↓
transformation
↓
calculation
↓
final metric
```

## 84. REPRODUCIBILITY

## 85. CALCULATION CHECK

## 86. ROUNDING

## 87. SPREADSHEET ERROR

## 88. UNIT CONVERSION

## 89. CHART DISTORTION

Axis/base effects.

## 90. INTERPRETATION

## 91. CAUSAL CLAIM

Data quality alone cannot prove causality.

## 92. FALSE POSITIVE RULES

Estimated data is not automatically bad.

Revised data is not automatically unreliable.

Small sample can still be useful with limits.

## 93. EVIDENCE TIERS

```text
A - original source + methodology + reproducible calculation
B - authoritative processed series
C - reliable secondary transformation
D - estimated/proxy/manual mapping
E - speculative/insufficient
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion or the decision; **MEDIUM** changes a key metric, driver or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (the conclusion that depends on the data) and state that base. A data-quality issue is CONFIRMED only with evidence tier A or B. For the series itself: tier A supports VERIFIED; tiers B and C support USABLE_WITH_LIMITATIONS with the limitation stated; tier D stays NOT VERIFIED; tier E is UNUSABLE for the conclusion. Never present an estimate, a forecast or a scenario as a fact.

## 94. STATUS

```text
VERIFIED
USABLE_WITH_LIMITATIONS
NOT VERIFIED
INCOMPARABLE
STRUCTURAL_NA
UNUSABLE
```

## 95. FINDING FORMAT

```text
ID:
Status:
Evidence tier:
Dataset/indicator:
Source:
Period:
Definition:
Issue:
Affected observations:
Materiality:
Interpretation risk:
Evidence:
Can be repaired:
Repair method:
Remaining limitation:
```

## 96. DATA QUALITY MATRIX

| Series | Source | Definition | Comparable | Quality |
|---|---|---|---|---|

## 97. SECOND PASS

Check:

- unit
- real/nominal
- percent vs pp
- revisions
- series breaks
- missing vs zero
- estimate vs actual
- denominator changes
- source lineage
- country comparability

## 98. FINAL QUALITY GATE

Confirm:

- original source
- version/date
- definition
- unit
- methodology
- revisions
- missing data
- comparability
- transformations
- lineage
- limitations

## 99. OUTPUT

`ECONOMIC_DATA_QUALITY_INTERPRETATION_AUDIT.md`

# FINAL RULE

Before you ask:

> "What does this number mean?"

first prove:

```text
what the number measures
how it was calculated
which population it refers to
in which period
and whether it is comparable at all with the number you compare it to
```
