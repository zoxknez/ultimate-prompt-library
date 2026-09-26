---
id: UPL-BIZ-028
number: 28
slug: exchange-rate-exposure-analysis
title: Exchange Rate Exposure Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Economics & Market Analysis
subcategory_id: economics-market-analysis
language: en
version: 1.0.0
status: stable
---

# EXCHANGE RATE EXPOSURE ANALYSIS

I want a deep analysis of FX exposure and the economic impact of currency moves.

Main objective:

> Determine where the company or business model actually has transaction, translation and economic currency exposure, how much natural hedge exists and how FX affects revenue, costs, debt, cash and competitiveness.

This is not:

- looking only at reporting currency translation
- an assumption that foreign revenue = FX risk
- automatically recommending hedging
- trading/FX prediction

## 1. CURRENCY INVENTORY

Map:

- revenue
- costs
- cash
- debt
- capex
- receivables
- payables

by currency.

## 2. FUNCTIONAL CURRENCY

## 3. REPORTING CURRENCY

## 4. TRANSACTION EXPOSURE

## 5. TRANSLATION EXPOSURE

## 6. ECONOMIC EXPOSURE

## 7. NATURAL HEDGE

## 8. NET EXPOSURE

## 9. TIMING

## 10. RECEIVABLE

## 11. PAYABLE

## 12. DEBT

## 13. CASH

## 14. CONTRACT CURRENCY

## 15. PRICING CURRENCY

## 16. CUSTOMER CURRENCY

## 17. SUPPLIER CURRENCY

## 18. INDEXATION

## 19. PRICE RESET

## 20. COMPETITOR CURRENCY

Important for economic exposure.

## 21. FX PASS-THROUGH

## 22. LAG

## 23. GROSS MARGIN

## 24. EBITDA

## 25. CASH FLOW

## 26. WORKING CAPITAL

## 27. COVENANT

## 28. HEDGE

- forward
- option
- swap
- natural

## 29. HEDGE RATIO

## 30. HEDGE TENOR

## 31. BASIS

## 32. ACCOUNTING

If hedge accounting relevant, verify framework.

## 33. FX GAIN/LOSS

## 34. REALIZED

## 35. UNREALIZED

## 36. SCENARIO

- 5%
- 10%
- 20%

Use context-specific moves where possible.

## 37. CORRELATION

Multiple currencies.

## 38. CRISIS LIQUIDITY

## 39. CAPITAL CONTROL

If jurisdiction relevant.

## 40. FALSE POSITIVE RULES

Foreign revenue can be naturally hedged.

Translation loss is not necessarily cash loss.

FX gain can coexist with worse economics.

## 41. EVIDENCE TIERS

```text
A - verified currency-level transaction/debt data
B - reconciled management data
C - strong operational exposure
D - inferred economic exposure
E - scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion or the decision; **MEDIUM** changes a key metric, driver or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (net exposure, EBITDA, cash or covenant headroom) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate, a forecast or a scenario as a fact.

## 42. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Currency:
Exposure type:
Gross exposure:
Natural hedge:
Net exposure:
Timing:
Current FX:
Scenario:
P&L impact:
Cash impact:
Competitive impact:
Evidence:
Mitigation:
```

## 43. FX MATRIX

| Currency | Revenue | Cost | Debt | Net exposure | Hedge |
|---|---:|---:|---:|---:|---|

## 44. SECOND PASS

Test:

- currency depreciation
- appreciation
- hedge expires
- customer price reset delayed
- supplier currency moves differently
- debt currency mismatch

## 45. FINAL QUALITY GATE

Confirm:

- currencies
- transaction
- translation
- economic
- natural hedge
- debt
- price pass-through
- cash
- hedges
- scenarios

## 46. OUTPUT

`EXCHANGE_RATE_EXPOSURE_ANALYSIS.md`

# FINAL RULE

An FX analysis must distinguish accounting translation from the actual economic cash exposure.
