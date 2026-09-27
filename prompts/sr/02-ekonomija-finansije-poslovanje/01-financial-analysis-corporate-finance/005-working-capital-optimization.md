---
id: UPL-BIZ-005
number: 5
slug: working-capital-optimization
title: Optimizacija obrtnog kapitala
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# OPTIMIZACIJA OBRTNOG KAPITALA

Želim duboku analizu working capital-a sa ciljem da se oslobodi cash bez narušavanja prodaje, supplier stability-ja ili operativne otpornosti.

Glavni cilj:

> Utvrditi gde je cash nepotrebno vezan u receivables, inventory i drugim operating assets ili gde payment structure stvara liquidity pressure.

Ovo nije:

- "naplati kupce brže"
- "drži manje zaliha"
- "plaćaj dobavljače kasnije"
- optimizacija cash-a koja uništava business relationship

## 1. WORKING CAPITAL DEFINITION

Use consistent formula.

## 2. RECEIVABLES

## 3. DSO

## 4. AGING

## 5. OVERDUE

## 6. CUSTOMER TERMS

## 7. ACTUAL PAYMENT

## 8. COLLECTION PROCESS

## 9. DISPUTE

## 10. CREDIT LIMIT

## 11. CUSTOMER RISK

## 12. INVOICE QUALITY

## 13. BILLING DELAY

## 14. UNBILLED REVENUE

## 15. INVENTORY

## 16. DIO

## 17. RAW MATERIAL

## 18. WIP

## 19. FINISHED GOODS

## 20. SAFETY STOCK

## 21. OBSOLETE

## 22. SLOW MOVING

## 23. FORECAST ERROR

## 24. MOQ

## 25. LEAD TIME

## 26. SERVICE LEVEL

## 27. STOCKOUT COST

## 28. PAYABLES

## 29. DPO

## 30. SUPPLIER TERMS

## 31. EARLY PAYMENT DISCOUNT

## 32. SUPPLIER DEPENDENCY

## 33. SUPPLY CHAIN RISK

## 34. PAYMENT PRIORITY

## 35. CONTRACTUAL LIMIT

## 36. CASH CONVERSION CYCLE

## 37. TREND

## 38. SEASONALITY

## 39. GROWTH

Growth can legitimately consume working capital.

## 40. WORKING CAPITAL NORMALIZATION

## 41. ACQUISITION

## 42. CUSTOMER CONCENTRATION

## 43. SUPPLIER CONCENTRATION

## 44. OPERATIONAL CONSTRAINT

## 45. CASH RELEASE

Calculate:

```text
days improvement
x
relevant daily flow
```

with clear assumptions.

## 46. SENSITIVITY

## 47. IMPLEMENTATION

## 48. OWNERSHIP

## 49. KPI

## 50. GUARDRAIL

Do not optimize DSO/DIO/DPO at expense of:

- revenue
- service level
- supplier continuity

## 51. FALSE POSITIVE RULES

High inventory can be intentional.

Long customer terms can be strategic.

Fast supplier payment may have economic benefit.

## 52. EVIDENCE TIERS

```text
A - invoice/inventory/payment transaction data
B - reconciled management records
C - aggregate financial data
D - operational estimate
E - optimization scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (cash vezan u obrtnom kapitalu ili relevantni dnevni tok) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

## 53. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Area:
Current metric:
Benchmark/internal target:
Cash tied:
Root driver:
Operational reason:
Optimization:
Estimated cash release:
Risk:
Guardrail:
Evidence:
Owner:
```

## 54. WORKING CAPITAL MATRIX

| Area | Days | Cash tied | Opportunity | Risk |
|---|---|---|---|---|

## 55. SECOND PASS

Test proposed improvement against:

- revenue
- customer churn
- stockout
- production stop
- supplier failure
- discount loss

## 56. FINAL QUALITY GATE

Confirm:

- AR
- inventory
- AP
- actual payment behavior
- operational constraints
- cash release
- risks
- ownership
- guardrails

## 57. OUTPUT

`WORKING_CAPITAL_OPTIMIZATION.md`

# KONAČNO PRAVILO

Working capital optimization nije maksimizovanje DPO i minimizovanje DSO/DIO.

Cilj je:

osloboditi održiv cash bez prebacivanja većeg ekonomskog rizika na prodaju, kupce, dobavljače ili operacije.
