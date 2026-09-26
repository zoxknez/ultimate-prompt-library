---
id: UPL-BIZ-010
number: 10
slug: corporate-finance-decision-analysis
title: Corporate Finance Decision Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# CORPORATE FINANCE DECISION ANALYSIS

I want a rigorous analysis of a specific corporate finance decision, such as:

- investment
- capex
- financing
- dividend
- buyback
- acquisition
- divestment
- pricing/capacity decision with a large financial effect

Main objective:

> Structure the decision so that the incremental cash flows, alternatives, opportunity cost, financing effects, uncertainty, downside and decision criteria are clearly visible.

This is not:

- an NPV calculator without business context
- a decision generator that picks an option without assumptions
- mixing sunk costs with incremental economics
- calculating a valuation with false precision

## 1. DECISION

Define exactly:

```text
Decision:
Alternatives:
Decision date:
Horizon:
Currency:
Constraints:
```

## 2. BASELINE

What happens if nothing changes?

## 3. INCREMENTAL CASH FLOW

Only cash flows caused by the decision.

## 4. SUNK COST

Exclude from forward economics unless relevant for another reason.

## 5. OPPORTUNITY COST

## 6. CANNIBALIZATION

## 7. WORKING CAPITAL

## 8. CAPEX

## 9. OPERATING COST

## 10. REVENUE

## 11. TERMINAL VALUE

If applicable.

## 12. TAX

Jurisdiction-sensitive.

## 13. NPV

## 14. IRR

## 15. PAYBACK

## 16. ROIC

## 17. DISCOUNT RATE

## 18. COST OF CAPITAL

## 19. NOMINAL VS REAL

## 20. INFLATION

## 21. CURRENCY

## 22. FINANCING

Separate project economics from financing effects where appropriate.

## 23. DEBT CAPACITY

## 24. LIQUIDITY

## 25. COVENANT

## 26. STRATEGIC OPTION

## 27. REVERSIBILITY

## 28. FLEXIBILITY

## 29. STAGED INVESTMENT

## 30. REAL OPTION

Only if useful, not jargon.

## 31. SCENARIO

## 32. SENSITIVITY

## 33. BREAK-EVEN

## 34. KEY ASSUMPTION

## 35. UNCERTAINTY

## 36. DOWNSIDE

## 37. FAILURE MODE

## 38. SECOND-ORDER EFFECT

## 39. IMPLEMENTATION RISK

## 40. ALTERNATIVE USE OF CAPITAL

## 41. DECISION RULE

Must be explicit.

## 42. FALSE PRECISION

## 43. FALSE POSITIVE RULES

Highest IRR is not automatically best.

Positive NPV does not remove strategic/financing risk.

Shortest payback is not automatically best.

## 44. EVIDENCE TIERS

```text
A - contracted/verified incremental cash flow
B - historical operational relationship
C - management forecast
D - external assumption
E - scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (the investment amount, NPV or the liquidity headroom of the decision) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate or a scenario as a fact.

## 45. DECISION FORMAT

```text
Option:
Initial investment:
Incremental cash flow:
NPV:
IRR:
Payback:
Liquidity impact:
Key assumptions:
Downside:
Strategic benefit:
Reversibility:
Evidence quality:
```

## 46. DECISION MATRIX

| Option | NPV | Liquidity | Risk | Flexibility | Evidence |
|---|---|---|---|---|---|

## 47. SECOND PASS

Ask:

- what assumption can destroy the economics?
- what happens if implementation is delayed?
- what if capex is 25% higher?
- what if revenue starts later?
- what if financing costs rise?
- what is the cost of waiting?

Use context-specific sensitivities where available.

## 48. FINAL QUALITY GATE

Confirm:

- baseline
- alternatives
- incremental economics
- opportunity cost
- financing
- liquidity
- risk
- scenario
- reversibility
- assumptions
- evidence

## 49. OUTPUT

`CORPORATE_FINANCE_DECISION_ANALYSIS.md`

# FINAL RULE

A corporate finance decision should not be:

> "Option A has the highest IRR."

It should show:

```text
economic return
+
cash requirement
+
risk
+
flexibility
+
the alternative use of capital
+
the quality of evidence
```
