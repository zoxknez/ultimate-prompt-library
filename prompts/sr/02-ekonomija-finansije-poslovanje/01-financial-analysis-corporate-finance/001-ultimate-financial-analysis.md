---
id: UPL-BIZ-001
number: 1
slug: ultimate-financial-analysis
title: Ultimate Financial Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# ULTIMATE FINANCIAL ANALYSIS

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i decision-oriented finansijsku analizu kompanije, poslovanja, projekta ili organizacije.

Glavni cilj:

> Utvrditi šta finansijski podaci stvarno govore o profitabilnosti, likvidnosti, cash generation-u, kapitalnoj efikasnosti, finansijskoj stabilnosti i trendovima, uz jasno razlikovanje činjenica, računatih pokazatelja, računovodstvenih efekata, pretpostavki i interpretacija.

Ovo nije:

- automatsko proglašavanje kompanije "dobrom" ili "lošom"
- analiza samo revenue growth-a
- analiza samo EBITDA
- ratio checklist bez konteksta
- pretpostavka da profit znači cash
- pretpostavka da negativan cash flow znači loše poslovanje
- poređenje kompanija bez prilagođavanja business model-a
- investiciona preporuka bez eksplicitnog zahteva korisnika

Ako analiza koristi:

- aktuelne tržišne podatke
- kamatne stope
- FX
- peer multiples
- poreske stope
- regulatorne podatke

obavezno zabeleži datum, jurisdikciju i izvor.

## 1. ANALYSIS CONTEXT

Utvrdi:

```text
Company/project:
Period:
Currency:
Jurisdiction:
Business model:
Industry:
Accounting basis:
Available statements:
Data quality:
```

## 2. DATA HIERARCHY

Preferiraj:

```text
audited financial statements
>
official management accounts
>
general ledger / transactional data
>
management estimates
>
external estimates
```

Ne mešaj nivoe bez oznake.

## 3. DATA QUALITY

Proveri:

- period consistency
- currency
- units
- restatements
- missing periods
- one-off adjustments
- accounting policy changes
- unaudited figures

## 4. INCOME STATEMENT

Analiziraj:

- revenue
- COGS
- gross profit
- operating expenses
- EBITDA
- EBIT
- interest
- tax
- net income

## 5. REVENUE

Razloži gde moguće na:

```text
price
x
volume
x
mix
```

## 6. REVENUE QUALITY

Traži:

- recurring vs one-time
- concentrated customers
- discounts
- rebates
- refunds
- deferred revenue
- recognition timing

## 7. GROSS MARGIN

Trend.

## 8. CONTRIBUTION MARGIN

Ako data podržava.

## 9. EBITDA

Ne tretirati kao cash flow.

## 10. EBITDA ADJUSTMENTS

Posebno pregledaj:

- restructuring
- stock compensation
- founder expenses
- litigation
- one-time marketing
- acquisition costs

## 11. RECURRING "ONE-TIME" ITEMS

Ako se ponavljaju, ne tretirati ih automatski kao non-recurring.

## 12. EBIT

## 13. DEPRECIATION

## 14. AMORTIZATION

## 15. INTEREST

## 16. TAX

## 17. NET INCOME

## 18. BALANCE SHEET

Analiziraj:

- cash
- receivables
- inventory
- prepaid
- fixed assets
- intangibles
- payables
- accrued liabilities
- debt
- equity

## 19. ASSET QUALITY

## 20. RECEIVABLES

## 21. INVENTORY

## 22. GOODWILL

## 23. INTANGIBLES

## 24. LIABILITY QUALITY

## 25. DEBT MATURITY

## 26. OFF-BALANCE-SHEET

Ako relevantno i dokazivo.

## 27. CASH FLOW STATEMENT

- operating
- investing
- financing

## 28. OPERATING CASH FLOW

## 29. FREE CASH FLOW

Definiši formulu koju koristiš.

## 30. CAPEX

Razlikuj:

- maintenance
- growth

samo ako postoje dokazi.

## 31. WORKING CAPITAL

## 32. CASH CONVERSION

## 33. ACCRUAL VS CASH

## 34. PROFIT TO CASH BRIDGE

Obavezno za material mismatch.

## 35. QUALITY OF EARNINGS

Traži:

```text
reported profit
↓
non-cash items
↓
working capital
↓
one-offs
↓
actual cash generation
```

## 36. LIQUIDITY

## 37. CURRENT RATIO

Ne interpretirati izolovano.

## 38. QUICK RATIO

## 39. CASH RUNWAY

Ako relevantno.

## 40. DEBT

## 41. NET DEBT

## 42. LEVERAGE

## 43. INTEREST COVERAGE

## 44. DEBT SERVICE

## 45. COVENANTS

Ako dostupni.

## 46. MATURITY WALL

## 47. CAPITAL EFFICIENCY

## 48. ROIC

Jasno definisati NOPAT i invested capital.

## 49. ROA

## 50. ROE

## 51. DUPONT

Ako korisno.

## 52. ASSET TURNOVER

## 53. INVENTORY TURNOVER

## 54. RECEIVABLE DAYS

## 55. PAYABLE DAYS

## 56. CASH CONVERSION CYCLE

## 57. TREND ANALYSIS

Minimum:

- YoY
- multi-period CAGR gde smisleno

## 58. SEASONALITY

## 59. NORMALIZATION

## 60. INFLATION

Nominal growth može maskirati realnu stagnaciju.

## 61. FX

## 62. ACQUISITION

Acquisition-driven vs organic growth.

## 63. PER-UNIT ECONOMICS

Ako business model omogućava.

## 64. SEGMENT ANALYSIS

## 65. GEOGRAPHY

## 66. PRODUCT

## 67. CUSTOMER

## 68. CONCENTRATION

## 69. COST STRUCTURE

- fixed
- variable
- semi-variable

## 70. OPERATING LEVERAGE

## 71. BREAK-EVEN

## 72. SENSITIVITY

Test:

- revenue
- gross margin
- payroll
- interest
- FX
- working capital

## 73. DOWNSIDE

## 74. BASE CASE

## 75. UPSIDE

Do not assign probabilities without basis.

## 76. FORECAST

Ako postoji.

## 77. ACTUAL VS PLAN

## 78. FORECAST ACCURACY

## 79. MANAGEMENT ASSUMPTIONS

## 80. ACCOUNTING POLICY

## 81. RELATED PARTY

## 82. NON-CASH TRANSACTION

## 83. DIVIDEND

## 84. SHARE ISSUANCE

## 85. DILUTION

## 86. CAPEX COMMITMENT

## 87. CONTINGENT LIABILITY

## 88. CUSTOMER CONCENTRATION

## 89. SUPPLIER CONCENTRATION

## 90. KEY PERSON DEPENDENCY

Financial impact only where relevant.

## 91. FALSE POSITIVE RULES

Ne zaključuj automatski:

- negative FCF = bad
- high debt = bad
- low current ratio = insolvency
- margin decline = structural problem
- high capex = poor capital allocation
- inventory increase = deterioration

bez context-a.

## 92. EVIDENCE TIERS

```text
A - audited/verified financial data or reconciled transaction evidence
B - official management accounts and complete calculation path
C - consistent but unaudited internal data
D - external estimate or inference
E - hypothesis / scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (prihod, EBITDA, cash, neto dug ili kapital) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

## 93. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
NOT APPLICABLE
SCENARIO
```

## 94. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Metric/account:
Period:
Current value:
Prior/comparison:
Change:
Driver:
Business meaning:
Cash impact:
Risk/opportunity:
Evidence:
Assumptions:
Recommended analysis/action:
```

## 95. MATRICES

### Financial Health Matrix

| Area | Current | Trend | Evidence | Main driver |
|---|---|---|---|---|

### Profit-to-Cash Matrix

| Item | Profit impact | Cash impact | Timing |
|---|---|---|---|

### Scenario Matrix

| Variable | Base | Downside | Upside | Impact |
|---|---|---|---|---|

## 96. SECOND PASS

Ponovo proveri:

- profit vs cash
- one-offs
- working capital
- debt maturity
- seasonality
- FX
- inflation
- acquisition effects
- accounting changes
- concentration
- forecast assumptions

## 97. FINAL QUALITY GATE

Confirm:

- data quality
- income statement
- balance sheet
- cash flow
- earnings quality
- liquidity
- leverage
- working capital
- returns
- trends
- scenarios
- assumptions
- evidence

## 98. OUTPUT

`ULTIMATE_FINANCIAL_ANALYSIS.md`

# KONAČNO PRAVILO

Finansijska analiza ne treba da završi sa:

> "Revenue grew 20%."

Treba da objasni:

odakle je rast došao, koliko je profitabilan, koliko se pretvorio u cash, koliko je održiv i koje pretpostavke moraju ostati tačne da bi se nastavio.
