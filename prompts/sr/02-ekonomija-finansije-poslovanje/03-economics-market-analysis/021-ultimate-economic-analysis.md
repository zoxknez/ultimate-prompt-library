---
id: UPL-BIZ-021
number: 21
slug: ultimate-economic-analysis
title: Sveobuhvatna ekonomska analiza
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# SVEOBUHVATNA EKONOMSKA ANALIZA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i context-aware ekonomsku analizu zemlje, regiona, industrije, tržišta, kompanije ili poslovne odluke.

Glavni cilj:

> Utvrditi koji ekonomski faktori stvarno utiču na posmatrani problem, kojim kanalima deluju, koliko su jaki dokazi i gde postoje alternative, tradeoff-i ili neizvesnost.

Ovo nije:

- zbir makro indikatora bez veze sa konkretnim pitanjem
- politička analiza osim ako direktno utiče na ekonomsku temu
- automatsko zaključivanje iz jednog pokazatelja
- pretpostavka da korelacija znači kauzalnost
- prognoza bez assumptions i uncertainty-ja
- mešanje nominalnih i realnih podataka
- poređenje različitih država/perioda bez normalizacije
- oslanjanje na jedan izvor kada postoje relevantni primarni podaci

Ako koristiš aktuelne podatke:

- proveri datum
- period
- reviziju
- jurisdikciju
- metodologiju
- source authority

## 1. DEFINE QUESTION

Pre analize napiši:

```text
Economic question:
Geography:
Period:
Population/market:
Decision/use case:
Key unknowns:
```

## 2. SOURCE HIERARCHY

Preferiraj:

```text
official statistical office / central bank / regulator
>
international institution
>
audited/company data
>
reputable research
>
secondary analysis
>
media
>
anecdote
```

## 3. DATA VINTAGE

Koja verzija podatka?

## 4. REVISIONS

GDP, employment i slični podaci se revidiraju.

## 5. NOMINAL VS REAL

Mandatory distinction.

## 6. PER CAPITA

## 7. PPP

Use only where relevant.

## 8. LEVEL VS GROWTH

## 9. RATE VS CHANGE IN RATE

## 10. STOCK VS FLOW

## 11. SEASONALLY ADJUSTED

## 12. ANNUALIZED

## 13. BASE EFFECT

## 14. INDEX BASE YEAR

## 15. POPULATION DENOMINATOR

## 16. LABOR FORCE

## 17. INFORMAL ECONOMY

If relevant and source-supported.

## 18. GDP

## 19. GDP COMPONENTS

- consumption
- investment
- government
- net exports

## 20. PRODUCTIVITY

## 21. EMPLOYMENT

## 22. UNEMPLOYMENT

## 23. PARTICIPATION

## 24. WAGES

## 25. REAL WAGES

## 26. INFLATION

Razlikuj headline, core i sektorsku inflaciju, nivo cena od stope promene i nominalne od realnih vrednosti.

## 27. INTEREST RATES

Razlikuj policy rate, tržišne prinose, credit spread i stvarnu cenu zaduživanja; transmission deluje sa lagom.

## 28. FX

Razlikuj nominalni i realni kurs i transaction, translation i economic exposure; kurs ne prati kamatni diferencijal deterministički.

## 29. CREDIT

## 30. MONEY

## 31. HOUSEHOLD BALANCE SHEET

## 32. CORPORATE BALANCE SHEET

## 33. GOVERNMENT BALANCE

## 34. FISCAL POLICY

## 35. DEFICIT

## 36. PUBLIC DEBT

## 37. EXTERNAL BALANCE

## 38. CURRENT ACCOUNT

## 39. CAPITAL FLOWS

## 40. SAVINGS

## 41. INVESTMENT

## 42. BUSINESS CYCLE

## 43. LEADING INDICATOR

## 44. LAGGING INDICATOR

## 45. STRUCTURAL VS CYCLICAL

Critical distinction.

## 46. SUPPLY SHOCK

## 47. DEMAND SHOCK

## 48. POLICY SHOCK

## 49. TECHNOLOGY SHOCK

## 50. DEMOGRAPHICS

## 51. MIGRATION

## 52. URBANIZATION

## 53. ENERGY

## 54. COMMODITIES

## 55. TRADE

## 56. TARIFF

## 57. SUPPLY CHAIN

## 58. REGULATION

Only economic effect, unless broader scope requested.

## 59. MARKET STRUCTURE

## 60. COMPETITION

## 61. CAPACITY

## 62. EXPECTATIONS

## 63. CONFIDENCE

## 64. CONSUMER SENTIMENT

## 65. BUSINESS SENTIMENT

## 66. CAUSAL CHANNEL

Za svaki major driver napiši:

```text
Driver
↓
Transmission channel
↓
Affected variable
↓
Observed evidence
↓
Economic impact
```

## 67. CORRELATION

Do not infer causation without mechanism/evidence.

## 68. COUNTERFACTUAL

What would likely happen without driver?

## 69. SECOND-ORDER EFFECT

## 70. DISTRIBUTIONAL EFFECT

Different groups may experience different effects.

## 71. SHORT RUN

## 72. LONG RUN

## 73. ELASTICITY

## 74. SUBSTITUTION

## 75. COMPLEMENTARITY

## 76. MARKET CLEARING

Only where applicable.

## 77. CONSTRAINT

## 78. BOTTLENECK

## 79. SCENARIO

## 80. BASE CASE

## 81. DOWNSIDE

## 82. UPSIDE

## 83. PROBABILITY

Do not invent probabilities.

## 84. SENSITIVITY

## 85. FORECAST

Clearly separate observed from forecast.

## 86. FORECAST HORIZON

## 87. FORECAST ERROR

## 88. CONSENSUS

Consensus is not truth, but useful benchmark.

## 89. ALTERNATIVE VIEW

Represent credible alternatives.

## 90. FALSE POSITIVE RULES

Ne zaključuj automatski:

- GDP growth = broad prosperity
- unemployment down = labor market universally strong
- inflation down = prices falling
- rate cut = easier conditions for everyone
- currency appreciation = stronger economy
- trade deficit = economic weakness

bez relevantnog context-a.

## 91. EVIDENCE TIERS

```text
A - primary official or audited quantitative evidence
B - multiple high-quality consistent sources
C - strong derived analysis with transparent calculation
D - plausible interpretation/inference
E - scenario/hypothesis
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (vrednost ekonomskog pitanja: GDP, tržište, prihod kompanije ili odluka) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je SUPPORTED; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Kada se kredibilni izvori ne slažu, status je CONTESTED i prikazuju se oba stanovišta. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

## 92. STATUS

```text
CONFIRMED
SUPPORTED
NOT VERIFIED
CONTESTED
SCENARIO
NOT APPLICABLE
```

## 93. FINDING FORMAT

```text
ID:
Materiality:
Topic:
Status:
Evidence tier:
Geography:
Period:
Indicator/driver:
Observed data:
Comparison:
Transmission mechanism:
Economic impact:
Affected groups:
Alternative explanation:
Evidence:
Uncertainty:
Implication:
```

## 94. MACRO MATRIX

| Driver | Current condition | Direction | Transmission | Evidence |
|---|---|---|---|---|

## 95. SCENARIO MATRIX

| Variable | Base | Downside | Upside | Main driver |
|---|---:|---:|---:|---|

## 96. SECOND PASS

Ponovo proveri:

- nominal vs real
- base effects
- revisions
- seasonality
- causality
- structural vs cyclical
- alternative explanations
- distribution
- lag
- policy transmission
- external shocks

## 97. FINAL QUALITY GATE

Confirm:

- question defined
- geography/period
- source quality
- data definitions
- real vs nominal
- mechanisms
- causality carefully handled
- uncertainty
- alternative explanations
- scenarios separated from facts

## 98. OUTPUT

`ULTIMATE_ECONOMIC_ANALYSIS.md`

# KONAČNO PRAVILO

Ekonomska analiza nije dobra kada navede mnogo indikatora.

Dobra je kada pokaže:

```text
šta se promenilo
+
zašto
+
kojim kanalom
+
za koga
+
u kom periodu
+
sa kojim nivoom dokaza i neizvesnosti
```
