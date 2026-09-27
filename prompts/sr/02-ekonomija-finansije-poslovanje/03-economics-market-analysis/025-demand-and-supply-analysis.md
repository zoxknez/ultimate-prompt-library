---
id: UPL-BIZ-025
number: 25
slug: demand-and-supply-analysis
title: Analiza ponude i tražnje
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# ANALIZA PONUDE I TRAŽNJE

Želim duboku analizu demand i supply dinamike konkretnog tržišta, proizvoda, usluge ili input-a.

Glavni cilj:

> Utvrditi šta pomera demand i supply, gde nastaju imbalances, kako se oni prenose na cenu, volume, margins i capacity, i da li observed movement predstavlja trajni strukturni trend ili privremeni shock.

Ovo nije:

- crtanje teorijske supply-demand krive bez podataka
- pretpostavka da svaki price move dolazi iz demand-a
- automatsko proglašavanje shortage-a kada cena raste

## 1. MARKET DEFINITION

## 2. DEMAND UNIT

## 3. SUPPLY UNIT

Must be comparable.

## 4. DEMAND LEVEL

## 5. SUPPLY LEVEL

## 6. PRICE

## 7. VOLUME

## 8. CAPACITY

## 9. UTILIZATION

## 10. INVENTORY

## 11. BACKLOG

## 12. LEAD TIME

## 13. ORDER RATE

## 14. CANCELLATION

## 15. CUSTOMER SEGMENT

## 16. DEMAND DRIVER

- income
- price
- substitution
- demographics
- regulation
- seasonality
- technology

## 17. SUPPLY DRIVER

- capacity
- labor
- materials
- energy
- regulation
- capital
- logistics

## 18. PRICE ELASTICITY

## 19. CROSS ELASTICITY

## 20. INCOME ELASTICITY

## 21. SUBSTITUTE

## 22. COMPLEMENT

## 23. SHORTAGE

Must define evidence.

## 24. SURPLUS

## 25. INVENTORY BUILD

## 26. INVENTORY DRAW

## 27. CAPACITY EXPANSION

## 28. CAPACITY RETIREMENT

## 29. TIME TO ADD SUPPLY

Critical.

## 30. ENTRY

## 31. EXIT

## 32. MARGINAL PRODUCER

## 33. MARGINAL COST

## 34. COST CURVE

## 35. SUPPLY CURVE

## 36. PRICE SIGNAL

## 37. DEMAND DESTRUCTION

## 38. RATIONING

## 39. QUEUE

## 40. WAIT TIME

## 41. IMPORT

## 42. EXPORT

## 43. TRADE BARRIER

## 44. TRANSPORT COST

## 45. REGIONAL ARBITRAGE

## 46. SEASONALITY

## 47. WEATHER

If relevant.

## 48. POLICY

## 49. SUBSIDY

## 50. TAX

## 51. STRUCTURAL VS CYCLICAL

## 52. BASE EFFECT

## 53. EXPECTATION

## 54. SPECULATIVE INVENTORY

## 55. FORECAST

## 56. EQUILIBRIUM

Do not claim exact equilibrium without sufficient evidence.

## 57. SCENARIO

## 58. FALSE POSITIVE RULES

Price up does not prove demand up.

Inventory down does not prove shortage.

High utilization does not automatically mean supply constrained.

## 59. EVIDENCE TIERS

```text
A - direct market volume/capacity/inventory data
B - multiple consistent operating indicators
C - strong derived market balance
D - inferred imbalance
E - scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (obim tržišta, cena, kapacitet ili marža posmatranog biznisa) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

## 60. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Market:
Demand signal:
Supply signal:
Price:
Volume:
Inventory/capacity:
Imbalance:
Driver:
Duration:
Economic effect:
Evidence:
Alternative explanation:
Outlook:
```

## 61. MARKET BALANCE MATRIX

| Indicator | Demand signal | Supply signal | Direction | Evidence |
|---|---|---|---|---|

## 62. SECOND PASS

Challenge with:

- price movement without volume change
- inventory restocking
- capacity expansion
- demand substitution
- import response
- temporary bottleneck
- seasonal shift

## 63. FINAL QUALITY GATE

Confirm:

- market definition
- units
- price
- volume
- capacity
- inventory
- demand drivers
- supply drivers
- elasticity
- lag
- structural vs cyclical
- scenarios

## 64. OUTPUT

`DEMAND_SUPPLY_ANALYSIS.md`

# KONAČNO PRAVILO

Demand/supply analysis mora objasniti:

> šta se promenilo na kojoj strani tržišta, kako to znamo i koliko brzo druga strana može da odgovori.
