---
id: UPL-BIZ-010
number: 10
slug: corporate-finance-decision-analysis
title: Analiza odluka korporativnih finansija
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# ANALIZA ODLUKA KORPORATIVNIH FINANSIJA

Želim rigoroznu analizu konkretne corporate-finance odluke, kao što su:

- investicija
- capex
- financing
- dividend
- buyback
- acquisition
- divestment
- pricing/capacity decision sa velikim finansijskim efektom

Glavni cilj:

> Strukturisati odluku tako da se jasno vide incremental cash flows, alternatives, opportunity cost, financing effects, uncertainty, downside i decision criteria.

Ovo nije:

- NPV calculator bez business context-a
- decision generator koji bira opciju bez assumptions
- mešanje sunk cost-a sa incremental economics
- računanje valuation-a sa lažnom preciznošću

## 1. DECISION

Definiši tačno:

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (iznos investicije, NPV ili likvidnosni headroom odluke) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

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

# KONAČNO PRAVILO

Corporate finance odluka ne treba da bude:

> "Opcija A ima najveći IRR."

Treba da pokaže:

```text
ekonomski povrat
+
cash requirement
+
rizik
+
fleksibilnost
+
alternativnu upotrebu kapitala
+
kvalitet dokaza
```
