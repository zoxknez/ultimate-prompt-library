---
id: UPL-BIZ-021
number: 21
slug: ultimate-economic-analysis
title: Ultimate Economic Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Economics & Market Analysis
subcategory_id: economics-market-analysis
language: en
version: 1.0.0
status: stable
---

# ULTIMATE ECONOMIC ANALYSIS

I want you to perform a maximally deep, systematic, evidence-first and context-aware economic analysis of a country, region, industry, market, company or business decision.

Main objective:

> Determine which economic factors actually affect the problem at hand, through which channels they act, how strong the evidence is and where alternatives, tradeoffs or uncertainty exist.

This is not:

- a collection of macro indicators unrelated to the specific question
- a political analysis, unless it directly affects the economic topic
- automatic conclusions from a single indicator
- an assumption that correlation means causation
- a forecast without assumptions and uncertainty
- mixing nominal and real data
- comparing different countries/periods without normalization
- relying on a single source when relevant primary data exist

If you use current data:

- check the date
- period
- the revision
- the jurisdiction
- the methodology
- source authority

## 1. DEFINE QUESTION

Before the analysis, write down:

```text
Economic question:
Geography:
Period:
Population/market:
Decision/use case:
Key unknowns:
```

## 2. SOURCE HIERARCHY

Prefer:

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

Which version of the data?

## 4. REVISIONS

GDP, employment and similar data get revised.

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

Distinguish headline, core and sector inflation, the price level from the rate of change, and nominal from real values.

## 27. INTEREST RATES

Distinguish the policy rate, market yields, the credit spread and the actual cost of borrowing; transmission works with a lag.

## 28. FX

Distinguish the nominal and real exchange rate and transaction, translation and economic exposure; the exchange rate does not follow the interest differential deterministically.

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

For each major driver, write:

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

Do not automatically conclude:

- GDP growth = broad prosperity
- unemployment down = labor market universally strong
- inflation down = prices falling
- rate cut = easier conditions for everyone
- currency appreciation = stronger economy
- trade deficit = economic weakness

without the relevant context.

## 91. EVIDENCE TIERS

```text
A - primary official or audited quantitative evidence
B - multiple high-quality consistent sources
C - strong derived analysis with transparent calculation
D - plausible interpretation/inference
E - scenario/hypothesis
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion or the decision; **MEDIUM** changes a key metric, driver or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (the value of the economic question: GDP, the market, the company's revenue or the decision) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is SUPPORTED; tier D stays NOT VERIFIED, and tier E is a SCENARIO. When credible sources disagree, the status is CONTESTED and both views are shown. Never present an estimate, a forecast or a scenario as a fact.

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

Check again:

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

# FINAL RULE

An economic analysis is not good when it lists many indicators.

It is good when it shows:

```text
what changed
+
why
+
through which channel
+
for whom
+
in which period
+
with what level of evidence and uncertainty
```
