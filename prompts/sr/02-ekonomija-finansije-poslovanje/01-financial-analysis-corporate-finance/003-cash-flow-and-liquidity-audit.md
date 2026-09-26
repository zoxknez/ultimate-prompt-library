---
id: UPL-BIZ-003
number: 3
slug: cash-flow-and-liquidity-audit
title: Cash Flow & Liquidity Audit
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# CASH FLOW & LIQUIDITY AUDIT

Želim dubok audit cash flow-a, liquidity-ja i kratkoročne finansijske održivosti.

Glavni cilj:

> Utvrditi odakle cash stvarno dolazi, gde odlazi, koliko brzo kompanija može ostati bez likvidnosti i da li reported profit prikriva cash pressure.

Ovo nije:

- samo analiza cash flow statement-a iz godišnjeg izveštaja
- pretpostavka da negativan FCF znači distress
- pretpostavka da neiskorišćena kreditna linija uvek može da se povuče
- investicioni ili kreditni savet

## 1. CASH POSITION

## 2. RESTRICTED CASH

## 3. AVAILABLE LIQUIDITY

## 4. CREDIT FACILITY

## 5. UNDRAWN CAPACITY

Only if actually accessible.

## 6. OPERATING CASH FLOW

## 7. INVESTING CASH FLOW

## 8. FINANCING CASH FLOW

## 9. FREE CASH FLOW

Define formula.

## 10. CASH BURN

## 11. RUNWAY

## 12. RUNWAY FORMULA

State assumptions.

## 13. SEASONALITY

## 14. WORKING CAPITAL

## 15. RECEIVABLES

## 16. INVENTORY

## 17. PAYABLES

## 18. ACCRUALS

## 19. CASH CONVERSION CYCLE

## 20. CUSTOMER PAYMENT TERMS

## 21. SUPPLIER TERMS

## 22. CUSTOMER CONCENTRATION

## 23. LATE PAYMENT

## 24. BAD DEBT

## 25. CAPEX

## 26. MAINTENANCE CAPEX

## 27. GROWTH CAPEX

Only if supportable.

## 28. DEBT SERVICE

## 29. INTEREST

## 30. PRINCIPAL

## 31. MATURITY

## 32. TAX

## 33. PAYROLL

## 34. RENT

## 35. FIXED CASH COST

## 36. VARIABLE CASH COST

## 37. DIVIDEND

## 38. BUYBACK

## 39. ACQUISITION

## 40. ONE-TIME CASH OUTFLOW

## 41. NORMALIZATION

## 42. WEEKLY CASH FORECAST

For stressed liquidity.

## 43. 13-WEEK CASH FLOW

Where useful.

## 44. FORECAST ACCURACY

## 45. MINIMUM CASH BUFFER

Must be justified.

## 46. STRESS SCENARIO

- revenue down
- collections delayed
- margin compression
- interest increase
- FX move

## 47. COVENANT

## 48. LIQUIDITY EVENT

## 49. REFINANCING

## 50. FALSE POSITIVE RULES

Do not conclude:

- negative FCF = distress
- low cash balance = distress
- high working capital = bad

without context.

## 51. EVIDENCE TIERS

```text
A - bank/reconciled cash and verified payment schedule
B - complete management cash-flow data
C - financial-statement derived
D - estimate
E - stress scenario
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (raspoloživa likvidnost, mesečni cash burn ili minimalna cash rezerva) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

## 52. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
SCENARIO
```

## 53. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Cash driver:
Timing:
Amount:
Recurring:
Liquidity impact:
Runway impact:
Evidence:
Mitigation:
```

## 54. LIQUIDITY MATRIX

| Source/use | Amount | Timing | Certain | Flexible |
|---|---|---|---|---|

## 55. SECOND PASS

Test:

- customer pays 30 days later
- revenue -20%
- gross margin -5 pp
- debt refinancing unavailable
- major supplier demands faster payment

## 56. FINAL QUALITY GATE

Confirm:

- cash balance
- restrictions
- working capital
- capex
- debt
- burn
- runway
- timing
- stress scenarios
- forecast confidence

## 57. OUTPUT

`CASH_FLOW_LIQUIDITY_AUDIT.md`

# KONAČNO PRAVILO

Liquidity analysis mora biti zasnovana na vremenu i stvarnom cash movement-u, ne samo na računovodstvenom profitu.
