---
id: UPL-BIZ-028
number: 28
slug: exchange-rate-exposure-analysis
title: Exchange Rate Exposure Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Ekonomija i analiza tržišta
subcategory_id: economics-market-analysis
language: sr
version: 1.0.0
status: stable
---

# EXCHANGE RATE EXPOSURE ANALYSIS

Želim duboku analizu FX exposure-a i ekonomskog uticaja valutnih promena.

Glavni cilj:

> Utvrditi gde kompanija ili business model stvarno ima transaction, translation i economic currency exposure, koliko postoji natural hedge i kako FX utiče na revenue, costs, debt, cash i competitiveness.

Ovo nije:

- gledanje samo reporting currency translation-a
- pretpostavka da foreign revenue = FX risk
- automatsko preporučivanje hedging-a
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

po valuti.

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak ili odluku; **MEDIUM** menja ključni pokazatelj, driver ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (neto izloženost, EBITDA, cash ili covenant headroom) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu, prognozu ili scenario kao činjenicu.

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

# KONAČNO PRAVILO

FX analysis mora razlikovati accounting translation od stvarnog economic cash exposure-a.
