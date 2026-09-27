---
id: UPL-BIZ-006
number: 6
slug: budget-and-forecast-audit
title: Audit budžeta i prognoze
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# AUDIT BUDŽETA I PROGNOZE

Želim dubok audit budžeta i finansijskog forecast-a.

Glavni cilj:

> Utvrditi da li plan predstavlja ekonomski konzistentan model budućnosti zasnovan na dokazivim operational driver-ima, ili zbir optimističnih target-a koji međusobno nisu povezani.

Ovo nije:

- kritika svakog odstupanja od budžeta
- zamena menadžerskih ciljeva prognozom ili prognoze ciljevima
- dodeljivanje verovatnoća scenarijima bez osnove
- pretpostavka da je detaljniji model tačniji

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (prognozirani prihod, EBITDA, cash ili covenant headroom) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

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

# KONAČNO PRAVILO

Forecast mora da odgovori:

> Koji operational events moraju da se dese da bi finansijski rezultat postao stvarnost?
