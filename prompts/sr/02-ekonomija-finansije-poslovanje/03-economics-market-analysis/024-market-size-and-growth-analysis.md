---
id: UPL-BIZ-024
number: 24
slug: market-size-and-growth-analysis
title: Market Size & Growth Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# MARKET SIZE & GROWTH ANALYSIS

Želim rigoroznu analizu veličine i rasta tržišta sa transparentnim definitions, sources, assumptions i metodologijom.

Glavni cilj:

> Izračunati ili proceniti market size bez duplog brojanja, mešanja različitih definitions i marketing-level TAM pretpostavki koje nisu povezane sa realnim kupcem i transakcijom.

Ovo nije:

- uzimanje prvog "market size" broja sa interneta
- TAM × arbitrary market share
- ekstrapolacija bez denominator-a
- kombinovanje revenue i transaction value definicija
- mešanje globalnog i addressable tržišta

## 1. MARKET DEFINITION

Precizno:

```text
Product/service:
Customer:
Geography:
Channel:
Use case:
Price/revenue basis:
Period:
```

## 2. TAM

## 3. SAM

## 4. SOM

Definitions must be explicit.

## 5. TOP-DOWN

## 6. BOTTOM-UP

## 7. SUPPLY-SIDE

## 8. DEMAND-SIDE

## 9. CROSS-CHECK

Prefer at least two independent methods where feasible.

## 10. UNIT

- users
- units
- revenue
- transaction value
- seats
- locations

## 11. DENOMINATOR

## 12. ADDRESSABLE POPULATION

## 13. ELIGIBLE POPULATION

## 14. ADOPTION

## 15. PENETRATION

## 16. FREQUENCY

## 17. PRICE

## 18. ARPU

## 19. CUSTOMER COUNT

## 20. ACCOUNT COUNT

## 21. DUPLICATE CUSTOMER

## 22. MULTI-PRODUCT

## 23. CHANNEL OVERLAP

## 24. GEOGRAPHY OVERLAP

## 25. SOURCE DATE

## 26. SOURCE METHODOLOGY

## 27. PRIMARY DATA

## 28. INDUSTRY REPORT

## 29. COMPANY DISCLOSURE

## 30. GOVERNMENT DATA

## 31. MARKETPLACE DATA

## 32. SURVEY

## 33. SEARCH/TREND DATA

Signal only.

## 34. HISTORICAL SIZE

## 35. CAGR

## 36. CAGR FORMULA

## 37. NOMINAL GROWTH

## 38. REAL GROWTH

## 39. FX

## 40. PRICE VS VOLUME

## 41. MIX

## 42. CATEGORY EXPANSION

## 43. RECLASSIFICATION

## 44. ACQUISITION EFFECT

## 45. STRUCTURAL GROWTH DRIVER

## 46. TEMPORARY GROWTH DRIVER

## 47. SATURATION

## 48. REPLACEMENT CYCLE

## 49. CHURN

## 50. SUBSTITUTION

## 51. REGULATION

## 52. CAPACITY CONSTRAINT

## 53. FORECAST

## 54. SCENARIO

## 55. CONFIDENCE RANGE

Prefer range over false precision when uncertain.

## 56. FALSE POSITIVE RULES

Do not assume:

- reported market CAGR continues
- all category spend is addressable
- all users are buyers
- all revenue represents economic market size

## 57. EVIDENCE TIERS

```text
A - primary transaction/customer/official data
B - multiple independently consistent sources
C - transparent bottom-up derivation
D - market estimate
E - scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (procenjena veličina tržišta ili odluka koja od nje zavisi) i navedi tu osnovu. Veličina je VERIFIED (potvrđena) samo uz evidence tier A, ili tier B kada se nezavisni izvori slažu; tier C je SUPPORTED kada je bottom-up računica transparentna; tier D je ESTIMATED i ostaje NOT VERIFIED dok ga druga metoda ne podrži; tier E je SCENARIO. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

## 58. STATUS

```text
VERIFIED
SUPPORTED
ESTIMATED
NOT VERIFIED
SCENARIO
```

## 59. CALCULATION FORMAT

```text
Market definition:
Method:
Population/base:
Eligibility:
Penetration:
Frequency:
Price:
Calculated size:
Source date:
Evidence tier:
Materiality:
Status:
Confidence:
```

## 60. MARKET SIZE MATRIX

| Method | Size | Period | Evidence | Main assumption |
|---|---:|---|---|---|

## 61. SECOND PASS

Check:

- double counting
- outdated source
- nominal inflation-driven growth
- overlapping channels
- incompatible definitions
- unrealistic adoption
- price/volume mix

## 62. FINAL QUALITY GATE

Confirm:

- market definition
- unit
- geography
- period
- TAM/SAM/SOM
- top-down
- bottom-up
- sources
- growth decomposition
- uncertainty
- no double counting

## 63. OUTPUT

`MARKET_SIZE_GROWTH_ANALYSIS.md`

# KONAČNO PRAVILO

Market size mora biti rezultat jasne definicije i računice.

Ne prihvataj:

> "The market is worth $10B"

dok nije jasno:

```text
koje tržište
koji kupci
koja geografija
koji period
koji revenue concept
i kako je broj izračunat
```
