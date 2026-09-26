---
id: UPL-BIZ-029
number: 29
slug: economic-scenario-and-sensitivity-analysis
title: Economic Scenario & Sensitivity Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# ECONOMIC SCENARIO & SENSITIVITY ANALYSIS

Želim rigorozan scenario i sensitivity framework za ekonomsku ili poslovnu odluku.

Glavni cilj:

> Pokazati kako rezultat reaguje kada se ključne ekonomske assumptions promene, bez predstavljanja scenario-a kao predviđanja ili izmišljanja preciznih verovatnoća.

Ovo nije:

- tri proizvoljna broja nazvana base/upside/downside
- forecast presented as certainty
- sensitivity jednog inputa dok ostali zavisni inputi ostaju nelogično fixed
- Monte Carlo samo zato što zvuči napredno

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (izlaz odluke i njegov prag) i navedi tu osnovu. Pretpostavka je CONFIRMED samo uz evidence tier A ili B; tier C (prognoza) i tier D (plauzibilan scenario) ostaju NOT VERIFIED; tier E je stress case, nikada prognoza. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

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

# KONAČNO PRAVILO

Scenario analysis ne odgovara:

> "Šta će se desiti?"

Nego:

> "Šta se dešava sa odlukom ako ključne pretpostavke budu drugačije, i gde prestaje da bude održiva?"
