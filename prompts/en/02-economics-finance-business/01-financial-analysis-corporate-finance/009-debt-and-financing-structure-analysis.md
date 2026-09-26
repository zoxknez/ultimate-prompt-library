---
id: UPL-BIZ-009
number: 9
slug: debt-and-financing-structure-analysis
title: Debt & Financing Structure Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# DEBT & FINANCING STRUCTURE ANALYSIS

I want a deep analysis of the company's debt and overall financing structure.

Main objective:

> Determine whether the financing matches the cash-flow profile of the business and how sensitive the company is to refinancing, interest-rate, FX, covenant and liquidity risk.

This is not:

- automatically declaring high leverage unsustainable
- a legal review of loan agreements
- a credit rating or financing advice
- a stress test with arbitrary values when the user specifies others

## 1. DEBT INVENTORY

For each instrument:

```text
Principal:
Currency:
Rate:
Fixed/floating:
Maturity:
Amortization:
Security:
Covenants:
```

## 2. MATURITY PROFILE

## 3. MATURITY WALL

## 4. INTEREST

## 5. FIXED/FLOATING

## 6. BENCHMARK RATE

## 7. SPREAD

## 8. HEDGE

## 9. FX

## 10. NATURAL HEDGE

## 11. PRINCIPAL REPAYMENT

## 12. BULLET

## 13. AMORTIZING

## 14. REVOLVER

## 15. UNDRAWN FACILITY

## 16. COVENANT

## 17. HEADROOM

## 18. SECURITY

## 19. GUARANTEE

## 20. SUBORDINATION

## 21. LEASE

## 22. SUPPLIER FINANCE

## 23. DEBT-LIKE ITEMS

## 24. NET DEBT

## 25. LEVERAGE

## 26. INTEREST COVERAGE

## 27. DEBT SERVICE COVERAGE

## 28. CASH FLOW VOLATILITY

## 29. ASSET LIFE VS DEBT LIFE

## 30. REFINANCING

## 31. RATE SHOCK

## 32. FX SHOCK

## 33. EBITDA SHOCK

## 34. LIQUIDITY

## 35. DEFAULT

## 36. CROSS-DEFAULT

## 37. COVENANT BREACH

## 38. CURE

## 39. EQUITY FINANCING

## 40. DILUTION

## 41. HYBRID

## 42. PREFERRED

## 43. CONVERTIBLE

## 44. COST OF CAPITAL

## 45. FALSE POSITIVE RULES

High leverage is not automatically unsustainable.

Floating debt is not automatically bad.

## 46. EVIDENCE TIERS

```text
A - executed financing documents / verified debt schedule
B - official financial statements
C - management schedule
D - estimate
E - stress scenario
```

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (net debt, available liquidity or covenant headroom) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is a SCENARIO. Never present an estimate or a scenario as a fact.

## 47. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Instrument:
Exposure:
Current level:
Stress:
Headroom:
Trigger:
Impact:
Evidence:
Mitigation:
```

## 48. DEBT MATRIX

| Instrument | Amount | Rate | Maturity | Covenant | Risk |
|---|---|---|---|---|---|

## 49. SECOND PASS

Stress:

- +300 bps rate
- -20% EBITDA
- 15% FX move
- refinancing unavailable
- working capital outflow

Use scenario values appropriate to the context, not these values blindly if the user specifies others.

## 50. FINAL QUALITY GATE

Confirm:

- all debt
- maturity
- rates
- currency
- covenants
- coverage
- liquidity
- refinancing
- dilution alternatives
- stress

## 51. OUTPUT

`DEBT_FINANCING_STRUCTURE_ANALYSIS.md`

# FINAL RULE

Debt risk is not only:

> "how much debt there is"

but:

when it matures, in which currency, at what cost, under which terms and from which cash flow it will actually be serviced.
