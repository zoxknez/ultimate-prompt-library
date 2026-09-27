---
id: UPL-BIZ-026
number: 26
slug: inflation-and-cost-pressure-analysis
title: Analiza inflacije i pritiska troškova
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# ANALIZA INFLACIJE I PRITISKA TROŠKOVA

Želim duboku analizu inflacije i cost pressure-a sa fokusom na business transmission, pricing power, margins, wages, inputs i real purchasing power.

Glavni cilj:

> Utvrditi koji deo inflation pressure-a utiče na posmatrani business ili sektor, koliko brzo prolazi kroz cost base i koliko se može preneti na kupce bez neprihvatljivog gubitka volume-a.

Ovo nije:

- analiza samo headline CPI-a
- pretpostavka da CPI = company cost inflation
- pretpostavka da inflation down znači costs down
- automatsko povezivanje svih price increases sa inflation

## 1. INFLATION MEASURE

Identify:

- CPI
- core CPI
- PPI
- wage
- energy
- commodity
- sector-specific index

## 2. LEVEL VS RATE

Inflation falling can coexist with prices still rising.

## 3. BUSINESS COST BASKET

Map actual cost exposure.

## 4. MATERIALS

## 5. LABOR

## 6. ENERGY

## 7. RENT

## 8. LOGISTICS

## 9. SOFTWARE/SERVICES

## 10. INTEREST

## 11. FX

## 12. IMPORTED INFLATION

## 13. DOMESTIC INFLATION

## 14. WAGE INFLATION

## 15. UNIT LABOR COST

## 16. PRODUCTIVITY

## 17. PRICE INCREASE

## 18. PASS-THROUGH

## 19. LAG

## 20. CONTRACTUAL PRICE

## 21. INDEXATION

## 22. CUSTOMER PRICE SENSITIVITY

## 23. ELASTICITY

## 24. MIX

## 25. SHRINKFLATION

If relevant.

## 26. MARGIN

## 27. GROSS MARGIN

## 28. EBITDA MARGIN

## 29. WORKING CAPITAL

Higher nominal inventory/receivables can consume cash.

## 30. REAL REVENUE

## 31. REAL WAGE

## 32. PURCHASING POWER

## 33. CUSTOMER DEMAND

## 34. SECOND ROUND EFFECT

## 35. EXPECTATION

## 36. STICKINESS

## 37. DISINFLATION

## 38. DEFLATION

## 39. BASE EFFECT

## 40. SCENARIO

## 41. MARGIN SENSITIVITY

## 42. PRICING SENSITIVITY

## 43. FALSE POSITIVE RULES

CPI and business cost inflation can diverge materially.

Price increase is not proof of pricing power if volume falls sharply.

## 44. EVIDENCE TIERS

```text
A - verified company/input price data
B - official relevant price/wage indices
C - strong sector evidence
D - inferred pass-through
E - scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (bruto marža, EBITDA ili cash) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

## 45. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Cost/revenue driver:
Current inflation:
Company exposure:
Lag:
Pass-through:
Volume effect:
Margin effect:
Cash effect:
Evidence:
Uncertainty:
Action/monitoring:
```

## 46. COST PRESSURE MATRIX

| Cost | Weight | Inflation | Lag | Margin impact |
|---|---:|---:|---|---:|

## 47. SECOND PASS

Test:

- input inflation remains high while CPI falls
- wage inflation
- FX depreciation
- lower demand limits pass-through
- productivity offsets wage pressure

## 48. FINAL QUALITY GATE

Confirm:

- correct inflation measure
- business cost basket
- nominal vs real
- pass-through
- lag
- margins
- working capital
- demand
- scenarios

## 49. OUTPUT

`INFLATION_COST_PRESSURE_ANALYSIS.md`

# KONAČNO PRAVILO

Business inflation analysis mora da koristi stvarni cost/revenue basket kompanije, ne headline CPI kao univerzalnu zamenu.
