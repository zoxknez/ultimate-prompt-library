---
id: UPL-BIZ-006
number: 6
slug: budget-and-forecast-audit
title: Budget & Forecast Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# BUDGET & FORECAST AUDIT

I want a deep audit of the budget and the financial forecast.

Main objective:

> Determine whether the plan is an economically consistent model of the future based on provable operational drivers, or a sum of optimistic targets that are not connected to each other.

This is not:

- criticizing every variance from the budget
- replacing management targets with the forecast, or the forecast with targets
- assigning probabilities to scenarios without a basis
- an assumption that a more detailed model is more accurate

## 1. FORECAST HORIZON

## 2. GRANULARITY

## 3. DRIVER-BASED MODEL

## 4. REVENUE DRIVERS

- volume
- price
- conversion
- customers
- capacity

## 5. COST DRIVERS

## 6. HEADCOUNT

## 7. CAPEX

## 8. WORKING CAPITAL

## 9. DEBT

## 10. TAX

## 11. THREE-STATEMENT CONSISTENCY

## 12. OPENING BALANCE

## 13. HISTORICAL BASE

## 14. NORMALIZATION

## 15. SEASONALITY

## 16. INFLATION

## 17. FX

## 18. INTEREST

## 19. CAPACITY

## 20. LEAD TIME

## 21. BUSINESS CONSTRAINT

## 22. TOP-DOWN

## 23. BOTTOM-UP

## 24. RECONCILE

## 25. MANAGEMENT TARGET

Separate target from forecast.

## 26. BASE CASE

## 27. DOWNSIDE

## 28. UPSIDE

## 29. PROBABILITY

Do not assign arbitrarily.

## 30. SENSITIVITY

## 31. ACTUAL VS PLAN

## 32. FORECAST BIAS

## 33. FORECAST ERROR

## 34. ROLLING FORECAST

## 35. VERSIONING

## 36. ASSUMPTION REGISTER

## 37. OWNER

## 38. SOURCE

## 39. DATE

## 40. FALSE PRECISION

## 41. CASH

## 42. LIQUIDITY

## 43. COVENANT

## 44. BREAK-EVEN

## 45. FALSE POSITIVE RULES

Missing budget line is not automatically a problem.

Variance is not automatically poor management.

## 46. EVIDENCE TIERS

```text
A - historical verified driver
B - contractual/committed future driver
C - operational plan with owner
D - management assumption
E - scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (forecast revenue, EBITDA, cash or covenant headroom) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate or a scenario as a fact.

## 47. FINDING FORMAT

```text
ID:
Materiality:
Status:
Forecast line:
Assumption:
Evidence tier:
Historical relationship:
Forecast value:
Implied change:
Constraint:
Risk:
Sensitivity:
Recommended revision:
```

## 48. ASSUMPTION MATRIX

| Assumption | Source | Owner | Evidence | Sensitivity |
|---|---|---|---|---|

## 49. SECOND PASS

Stress:

- revenue delay
- margin -5 pp
- headcount +10%
- collections delayed
- capex overrun
- interest increase

## 50. FINAL QUALITY GATE

Confirm:

- drivers
- three statements
- cash
- working capital
- capacity
- assumptions
- scenarios
- forecast accuracy
- target vs forecast

## 51. OUTPUT

`BUDGET_FORECAST_AUDIT.md`

# FINAL RULE

A forecast must answer:

> Which operational events must happen for the financial result to become reality?
