---
id: UPL-BIZ-001
number: 1
slug: ultimate-financial-analysis
title: Ultimate Financial Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# ULTIMATE FINANCIAL ANALYSIS

I want you to perform a maximally deep, systematic, evidence-first and decision-oriented financial analysis of a company, business, project or organization.

Main objective:

> Determine what the financial data actually says about profitability, liquidity, cash generation, capital efficiency, financial stability and trends, while clearly distinguishing facts, calculated metrics, accounting effects, assumptions and interpretations.

This is not:

- automatically declaring a company "good" or "bad"
- an analysis of revenue growth only
- an analysis of EBITDA only
- a ratio checklist without context
- an assumption that profit means cash
- an assumption that negative cash flow means a bad business
- comparing companies without adjusting for the business model
- an investment recommendation without an explicit request from the user

If the analysis uses:

- current market data
- interest rates
- FX
- peer multiples
- tax rates
- regulatory data

always record the date, jurisdiction and source.

## 1. ANALYSIS CONTEXT

Establish:

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

Prefer:

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

Do not mix levels without labeling them.

## 3. DATA QUALITY

Check:

- period consistency
- currency
- units
- restatements
- missing periods
- one-off adjustments
- accounting policy changes
- unaudited figures

## 4. INCOME STATEMENT

Analyze:

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

Where possible, break it down into:

```text
price
x
volume
x
mix
```

## 6. REVENUE QUALITY

Look for:

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

If the data supports it.

## 9. EBITDA

Do not treat it as cash flow.

## 10. EBITDA ADJUSTMENTS

Review in particular:

- restructuring
- stock compensation
- founder expenses
- litigation
- one-time marketing
- acquisition costs

## 11. RECURRING "ONE-TIME" ITEMS

If they recur, do not automatically treat them as non-recurring.

## 12. EBIT

## 13. DEPRECIATION

## 14. AMORTIZATION

## 15. INTEREST

## 16. TAX

## 17. NET INCOME

## 18. BALANCE SHEET

Analyze:

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

If relevant and provable.

## 27. CASH FLOW STATEMENT

- operating
- investing
- financing

## 28. OPERATING CASH FLOW

## 29. FREE CASH FLOW

Define the formula you use.

## 30. CAPEX

Distinguish:

- maintenance
- growth

only if there is evidence.

## 31. WORKING CAPITAL

## 32. CASH CONVERSION

## 33. ACCRUAL VS CASH

## 34. PROFIT TO CASH BRIDGE

Mandatory for a material mismatch.

## 35. QUALITY OF EARNINGS

Look for:

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

Do not interpret it in isolation.

## 38. QUICK RATIO

## 39. CASH RUNWAY

If relevant.

## 40. DEBT

## 41. NET DEBT

## 42. LEVERAGE

## 43. INTEREST COVERAGE

## 44. DEBT SERVICE

## 45. COVENANTS

If available.

## 46. MATURITY WALL

## 47. CAPITAL EFFICIENCY

## 48. ROIC

Clearly define NOPAT and invested capital.

## 49. ROA

## 50. ROE

## 51. DUPONT

If useful.

## 52. ASSET TURNOVER

## 53. INVENTORY TURNOVER

## 54. RECEIVABLE DAYS

## 55. PAYABLE DAYS

## 56. CASH CONVERSION CYCLE

## 57. TREND ANALYSIS

Minimum:

- YoY
- multi-period CAGR where meaningful

## 58. SEASONALITY

## 59. NORMALIZATION

## 60. INFLATION

Nominal growth can mask real stagnation.

## 61. FX

## 62. ACQUISITION

Acquisition-driven vs organic growth.

## 63. PER-UNIT ECONOMICS

If the business model allows it.

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

If it exists.

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

Do not automatically conclude:

- negative FCF = bad
- high debt = bad
- low current ratio = insolvency
- margin decline = structural problem
- high capex = poor capital allocation
- inventory increase = deterioration

without context.

## 92. EVIDENCE TIERS

```text
A - audited/verified financial data or reconciled transaction evidence
B - official management accounts and complete calculation path
C - consistent but unaudited internal data
D - external estimate or inference
E - hypothesis / scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (revenue, EBITDA, cash, net debt or equity) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate or a scenario as a fact.

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

Re-check:

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

# FINAL RULE

A financial analysis should not end with:

> "Revenue grew 20%."

It should explain:

where the growth came from, how profitable it is, how much of it turned into cash, how sustainable it is and which assumptions must remain true for it to continue.
