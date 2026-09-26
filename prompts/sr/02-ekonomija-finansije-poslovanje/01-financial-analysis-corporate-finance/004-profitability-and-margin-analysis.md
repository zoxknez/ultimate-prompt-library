---
id: UPL-BIZ-004
number: 4
slug: profitability-and-margin-analysis
title: Profitability & Margin Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# PROFITABILITY & MARGIN ANALYSIS

Želim duboku analizu profitabilnosti i margin strukture poslovanja.

Glavni cilj:

> Utvrditi šta zaista pokreće ili erodira marginu po proizvodu, segmentu, customer-u, kanalu i periodu, uz razdvajanje price, volume, mix i cost efekata.

Ovo nije:

- poređenje procentualnih marži bez ekonomskog konteksta
- tretiranje proizvoljne alokacije troškova kao ekonomske istine
- automatska preporuka da se ukinu proizvodi ili kupci sa niskom maržom
- pretpostavka da je veća marža uvek strateški bolja

## 1. REVENUE BRIDGE

## 2. PRICE

## 3. VOLUME

## 4. MIX

## 5. GROSS MARGIN

## 6. CONTRIBUTION MARGIN

## 7. EBITDA MARGIN

## 8. EBIT MARGIN

## 9. NET MARGIN

## 10. FIXED COST

## 11. VARIABLE COST

## 12. SEMI-VARIABLE

## 13. DIRECT COST

## 14. INDIRECT COST

## 15. ALLOCATION

Do not treat arbitrary allocation as economic truth.

## 16. PRODUCT

## 17. CUSTOMER

## 18. CHANNEL

## 19. REGION

## 20. SEGMENT

## 21. DISCOUNT

## 22. REBATE

## 23. RETURN

## 24. REFUND

## 25. SHIPPING

## 26. PAYMENT FEES

## 27. SUPPORT COST

## 28. SALES COMMISSION

## 29. CUSTOMER ACQUISITION

## 30. CAPACITY UTILIZATION

## 31. LABOR

## 32. MATERIAL

## 33. ENERGY

## 34. FX

## 35. INFLATION

## 36. OPERATING LEVERAGE

## 37. BREAK-EVEN

## 38. MARGIN WATERFALL

## 39. PRIOR PERIOD

## 40. BUDGET

## 41. PEER

Only if comparable.

## 42. OUTLIER

## 43. LOSS-MAKING CUSTOMER

Need full economic context.

## 44. LOSS-LEADER

May be intentional.

## 45. CROSS-SELL

## 46. UNIT ECONOMICS

## 47. SCALE

## 48. MARGINAL PROFIT

## 49. FALSE POSITIVE RULES

Low-margin product is not automatically bad.

High-margin product is not automatically strategically superior.

## 50. EVIDENCE TIERS

```text
A - transaction/product-level verified data
B - management-account segment data
C - financial-statement derived
D - allocation/estimate
E - scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (bruto dobit, contribution margin ili marža posmatranog segmenta) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

## 51. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Segment/product/customer:
Current margin:
Prior margin:
Delta:
Price effect:
Volume effect:
Mix effect:
Cost effect:
Allocation effect:
Economic interpretation:
Evidence:
Action:
```

## 52. MARGIN BRIDGE

| Driver | Impact |
|---|---|

## 53. SECOND PASS

Check:

- price-volume mix
- inflation
- FX
- allocation
- discounts
- low utilization
- customer concentration
- one-off cost

## 54. FINAL QUALITY GATE

Confirm:

- margin definitions
- cost classification
- segment/customer/product
- price-volume-mix
- allocation
- break-even
- operating leverage
- evidence

## 55. OUTPUT

`PROFITABILITY_MARGIN_ANALYSIS.md`

# KONAČNO PRAVILO

Marginu ne analiziraj samo kao procenat.

Objasni:

koji konkretni economics menjaju taj procenat i da li je promena održiva, reverzibilna ili strukturna.
