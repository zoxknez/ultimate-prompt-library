---
id: UPL-BIZ-022
number: 22
slug: macroeconomic-environment-analysis
title: Macroeconomic Environment Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# MACROECONOMIC ENVIRONMENT ANALYSIS

Želim duboku analizu makroekonomskog okruženja relevantnog za kompaniju, industriju, investiciju ili poslovnu odluku.

Glavni cilj:

> Prevesti makroekonomske promene u konkretne business transmission channels, umesto da se analiza završi na GDP-u, inflaciji i kamatnim stopama.

Ovo nije:

- lista makro indikatora bez izloženosti kompanije
- makroekonomska prognoza ili investicioni savet
- pretpostavka da svaka makro promena utiče na svaku kompaniju
- politička analiza izvan konkretnih ekonomskih kanala

## 1. BUSINESS EXPOSURE FIRST

Pre makro analize utvrdi:

```text
Revenue geographies:
Cost geographies:
Currencies:
Debt:
Customer type:
Supplier base:
Labor intensity:
Energy intensity:
Import/export:
Pricing power:
```

## 2. GDP

## 3. CONSUMPTION

## 4. INVESTMENT

## 5. INDUSTRIAL PRODUCTION

## 6. RETAIL SALES

## 7. PMIs / SURVEYS

If available and relevant.

## 8. LABOR MARKET

## 9. WAGE PRESSURE

## 10. PRODUCTIVITY

## 11. INFLATION

## 12. CORE INFLATION

## 13. PRODUCER PRICES

## 14. ENERGY

## 15. COMMODITIES

## 16. INTEREST RATE

## 17. YIELD CURVE

## 18. CREDIT CONDITIONS

## 19. BANK LENDING

## 20. FX

## 21. TRADE

## 22. CURRENT ACCOUNT

## 23. FISCAL

## 24. GOVERNMENT SPENDING

## 25. TAX CHANGE

## 26. PUBLIC INVESTMENT

## 27. BUSINESS CONFIDENCE

## 28. CONSUMER CONFIDENCE

## 29. HOUSING

If relevant.

## 30. DEMOGRAPHICS

## 31. MIGRATION

## 32. REGULATION

## 33. GEOPOLITICAL ECONOMIC EFFECT

Only concrete economic channels.

## 34. COUNTRY RISK

## 35. SOVEREIGN RISK

## 36. LIQUIDITY CONDITIONS

## 37. FINANCIAL CONDITIONS

## 38. BUSINESS TRANSMISSION

Map:

```text
macro variable
↓
business driver
↓
P&L / cash flow / demand effect
```

## 39. REVENUE EFFECT

## 40. COST EFFECT

## 41. MARGIN EFFECT

## 42. WORKING CAPITAL EFFECT

## 43. FINANCING EFFECT

## 44. CAPEX EFFECT

## 45. CUSTOMER CREDIT RISK

## 46. SUPPLIER RISK

## 47. SCENARIO

## 48. LAG

Important.

## 49. HISTORICAL ANALOG

Use carefully.

Different regimes may make analogy weak.

## 50. FALSE POSITIVE RULES

Do not map every macro change to every company.

Require actual exposure.

## 51. EVIDENCE TIERS

```text
A - official macro data + verified company exposure
B - strong historical/business relationship
C - credible sector evidence
D - inferred transmission
E - scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (prihod, EBITDA, cash flow ili finansijski headroom kompanije) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

## 52. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Macro factor:
Current state:
Direction:
Business exposure:
Transmission:
Lag:
Financial impact:
Evidence:
Uncertainty:
Management implication:
```

## 53. EXPOSURE MATRIX

| Macro variable | Revenue | Cost | Cash | Financing | Exposure |
|---|---|---|---|---|---|

## 54. SECOND PASS

Stress:

- recession
- inflation persistence
- rate increase
- currency move
- wage shock
- commodity shock
- credit tightening

## 55. FINAL QUALITY GATE

Confirm:

- actual business exposure
- major macro drivers
- transmission
- lag
- scenarios
- evidence
- no irrelevant macro filler

## 56. OUTPUT

`MACROECONOMIC_ENVIRONMENT_ANALYSIS.md`

# KONAČNO PRAVILO

Makro analiza za business nije:

> "Inflation is 4%."

Nego:

> "Koji deo revenue-a, costs-a, working capital-a i financing-a menja ta inflacija, kojim lagom i koliko kompanija može preneti efekat na kupca?"
