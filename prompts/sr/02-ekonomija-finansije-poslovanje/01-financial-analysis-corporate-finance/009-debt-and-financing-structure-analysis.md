---
id: UPL-BIZ-009
number: 9
slug: debt-and-financing-structure-analysis
title: Debt & Financing Structure Analysis
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# DEBT & FINANCING STRUCTURE ANALYSIS

Želim duboku analizu debt-a i ukupne financing structure kompanije.

Glavni cilj:

> Utvrditi da li finansiranje odgovara cash-flow profilu poslovanja i koliko je kompanija osetljiva na refinancing, interest-rate, FX, covenant i liquidity rizik.

Ovo nije:

- automatsko proglašavanje visokog leverage-a neodrživim
- pravni pregled ugovora o kreditu
- kreditni rejting ili savet o finansiranju
- stres test sa proizvoljnim vrednostima kada korisnik navede druge

## 1. DEBT INVENTORY

Za svaki instrument:

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

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (neto dug, raspoloživa likvidnost ili covenant headroom) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je SCENARIO. Nikada ne predstavljaj procenu ili scenario kao činjenicu.

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

# KONAČNO PRAVILO

Debt risk nije samo:

> "koliko duga postoji"

nego:

kada dospeva, u kojoj valuti, po kojoj ceni, uz koje uslove i iz kog cash flow-a će stvarno biti servisiran.
