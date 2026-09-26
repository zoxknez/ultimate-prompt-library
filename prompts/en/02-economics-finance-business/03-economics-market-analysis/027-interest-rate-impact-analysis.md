---
id: UPL-BIZ-027
number: 27
slug: interest-rate-impact-analysis
title: Interest Rate Impact Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Economics & Market Analysis
subcategory_id: economics-market-analysis
language: en
version: 1.0.0
status: stable
---

# INTEREST RATE IMPACT ANALYSIS

I want a deep analysis of the impact of interest rates on a company, industry, consumers or an investment decision.

Main objective:

> Determine the direct and indirect transmission channels through debt service, refinancing, demand, valuation, credit availability, working capital and customer behavior.

This is not:

- "rates up = bad"
- an analysis of debt expense only
- an assumption that the policy rate directly becomes the company's borrowing rate

## 1. RATE DEFINITION

- policy
- overnight
- benchmark
- government yield
- corporate yield
- mortgage
- lending rate

## 2. YIELD CURVE

## 3. CREDIT SPREAD

## 4. COMPANY DEBT

## 5. FIXED/FLOATING

## 6. RESET DATE

## 7. MATURITY

## 8. HEDGE

## 9. CASH YIELD

Higher rates can increase interest income.

## 10. NET INTEREST

## 11. REFINANCING

## 12. CREDIT AVAILABILITY

## 13. COVENANT

## 14. LEVERAGE

## 15. WORKING CAPITAL FINANCING

## 16. CUSTOMER FINANCING

## 17. CONSUMER CREDIT

## 18. MORTGAGE

## 19. AUTO LOAN

## 20. CAPEX

## 21. HURDLE RATE

## 22. INVESTMENT DEMAND

## 23. HOUSING/REAL ESTATE

## 24. VALUATION

Discount rate.

## 25. TERMINAL VALUE

## 26. EQUITY RISK PREMIUM

Do not mechanically assume fixed relationship.

## 27. FX

Interest differential can affect currency, but not deterministically.

## 28. BANK MARGIN

If sector relevant.

## 29. DEPOSIT BETA

## 30. CREDIT LOSS

## 31. ECONOMIC LAG

## 32. POLICY LAG

## 33. SCENARIO

## 34. +100 BPS

## 35. +300 BPS

Only use if context-appropriate.

## 36. RATE CUT

## 37. INVERTED CURVE

## 38. REAL RATE

## 39. INFLATION EXPECTATION

## 40. FALSE POSITIVE RULES

Policy rate increase does not automatically increase all corporate debt immediately.

Rate cuts do not automatically stimulate demand instantly.

## 41. EVIDENCE TIERS

```text
A - executed debt/loan data and current benchmark
B - official rate/yield data
C - strong transmission relationship
D - inferred secondary effect
E - scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion or the decision; **MEDIUM** changes a key metric, driver or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (net interest cost, EBITDA, cash, covenant headroom or valuation) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate, a forecast or a scenario as a fact.

## 42. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Rate exposure:
Current rate:
Reset/maturity:
Transmission:
Direct financial effect:
Demand effect:
Valuation effect:
Lag:
Evidence:
Scenario sensitivity:
```

## 43. RATE EXPOSURE MATRIX

| Exposure | Fixed/floating | Reset | +100bps effect | Evidence |
|---|---|---|---:|---|

## 44. SECOND PASS

Test:

- rates stay high longer
- spreads widen despite stable policy rate
- refinancing closes
- customer demand weakens
- FX offsets rate effect

## 45. FINAL QUALITY GATE

Confirm:

- actual rate exposure
- benchmark/spread
- reset/maturity
- direct interest
- refinancing
- demand
- valuation
- lag
- scenarios

## 46. OUTPUT

`INTEREST_RATE_IMPACT_ANALYSIS.md`

# FINAL RULE

A rate analysis must distinguish:

```text
central-bank rate
company borrowing rate
customer borrowing rate
discount rate
```

and prove the transmission between them.
