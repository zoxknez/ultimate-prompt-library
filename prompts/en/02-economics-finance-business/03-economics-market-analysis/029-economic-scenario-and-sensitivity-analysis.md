---
id: UPL-BIZ-029
number: 29
slug: economic-scenario-and-sensitivity-analysis
title: Economic Scenario & Sensitivity Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Economics & Market Analysis
subcategory_id: economics-market-analysis
language: en
version: 1.0.0
status: stable
---

# ECONOMIC SCENARIO & SENSITIVITY ANALYSIS

I want a rigorous scenario and sensitivity framework for an economic or business decision.

Main objective:

> Show how the result responds when key economic assumptions change, without presenting a scenario as a prediction or inventing precise probabilities.

This is not:

- three arbitrary numbers labelled base/upside/downside
- forecast presented as certainty
- sensitivity of one input while the other dependent inputs illogically stay fixed
- Monte Carlo just because it sounds advanced

## 1. DECISION OUTPUT

Define metric:

- revenue
- EBITDA
- cash
- valuation
- runway
- market size
- demand

## 2. KEY DRIVERS

## 3. DRIVER RELATIONSHIP

## 4. INDEPENDENCE

Are assumptions correlated?

## 5. BASE CASE

## 6. DOWNSIDE

## 7. UPSIDE

## 8. STRESS

## 9. REVERSE STRESS

What conditions break threshold?

## 10. SINGLE-VARIABLE SENSITIVITY

## 11. MULTI-VARIABLE

## 12. ELASTICITY

## 13. NONLINEARITY

## 14. THRESHOLD

## 15. CAPACITY

## 16. PRICE/VOLUME

## 17. INFLATION

## 18. FX

## 19. RATE

## 20. WAGES

## 21. COMMODITY

## 22. WORKING CAPITAL

## 23. CAPEX

## 24. CUSTOMER LOSS

## 25. DELAY

## 26. LAG

## 27. DEPENDENCY

## 28. SCENARIO COHERENCE

Example:

High inflation + aggressive rate cuts may require explicit reasoning, not arbitrary combination.

## 29. HISTORICAL RANGE

## 30. PLAUSIBLE RANGE

## 31. EXTREME RANGE

## 32. PROBABILITY

Only with defensible basis.

## 33. EXPECTED VALUE

Only if probability framework valid.

## 34. MONTE CARLO

Use only when distributions/dependencies can be justified.

## 35. BREAK-EVEN

## 36. MARGIN OF SAFETY

## 37. DECISION THRESHOLD

## 38. FALSE PRECISION

## 39. FALSE POSITIVE RULES

Scenario is not forecast.

Stress is not prediction.

Historical worst case is not guaranteed maximum.

## 40. EVIDENCE TIERS

```text
A - historically observed/contractual driver
B - strongly supported range
C - management/external forecast
D - plausible scenario
E - extreme stress
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion or the decision; **MEDIUM** changes a key metric, driver or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (the decision output and its threshold) and state that base. An assumption is CONFIRMED only with evidence tier A or B; tier C (a forecast) and tier D (a plausible scenario) stay NOT VERIFIED; tier E is a stress case, never a forecast. Never present an estimate, a forecast or a scenario as a fact.

## 41. SCENARIO FORMAT

```text
Scenario:
Materiality:
Status:
Evidence tier:
Purpose:
Key assumptions:
Evidence:
Internal consistency:
Output:
Threshold breached:
Management implication:
```

## 42. SENSITIVITY MATRIX

| Variable | Low | Base | High | Output impact |
|---|---:|---:|---:|---:|

## 43. SECOND PASS

Check:

- dependent assumptions
- asymmetric downside
- delay
- nonlinearity
- break-even
- liquidity before profitability
- second-order effects

## 44. FINAL QUALITY GATE

Confirm:

- output defined
- key drivers
- ranges justified
- scenarios coherent
- probabilities not invented
- stress/reverse stress
- thresholds
- conclusions conditional

## 45. OUTPUT

`ECONOMIC_SCENARIO_SENSITIVITY_ANALYSIS.md`

# FINAL RULE

A scenario analysis does not answer:

> "What will happen?"

But:

> "What happens to the decision if the key assumptions turn out differently, and where does it stop being viable?"
