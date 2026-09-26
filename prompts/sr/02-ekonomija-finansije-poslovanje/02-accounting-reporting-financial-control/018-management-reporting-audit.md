---
id: UPL-BIZ-018
number: 18
slug: management-reporting-audit
title: Management Reporting Audit
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# MANAGEMENT REPORTING AUDIT

Želim dubok audit management reporting sistema, uključujući KPI-jeve, P&L reporting, segment reporting, dashboards, variance analysis i decision usefulness.

Glavni cilj:

> Utvrditi da li management dobija tačne, pravovremene i decision-relevant informacije koje se mogu reconciliovati sa authoritative finansijskim i operational data source-ovima.

Ovo nije:

- dashboard design audit
- "više KPI-jeva je bolje"
- pretpostavka da svaki metric mora biti financial

## 1. AUDIENCE

- CEO
- CFO
- operations
- sales
- board
- department

## 2. DECISION

Za svaki report:

```text
Report:
Audience:
Decision supported:
Frequency:
Source:
Owner:
```

## 3. FINANCIAL METRICS

## 4. OPERATIONAL METRICS

## 5. KPI DEFINITION

## 6. FORMULA

## 7. SOURCE

## 8. GRAIN

## 9. PERIOD

## 10. CURRENCY

## 11. ACTUAL

## 12. BUDGET

## 13. FORECAST

## 14. PRIOR YEAR

## 15. VARIANCE

## 16. DRIVER

## 17. COMMENTARY

## 18. SEGMENT

## 19. PRODUCT

## 20. CUSTOMER

## 21. REGION

## 22. DEPARTMENT

## 23. ALLOCATION

## 24. CONSISTENCY

## 25. RECONCILIATION TO GL

## 26. NON-GAAP KPI

## 27. ADJUSTED KPI

## 28. KPI DRIFT

Definition changes over time.

## 29. VERSION

## 30. LATE DATA

## 31. PROVISIONAL DATA

## 32. ESTIMATE

## 33. DATA FRESHNESS

## 34. MANUAL INPUT

## 35. SPREADSHEET

## 36. DASHBOARD

## 37. DUPLICATE METRIC

## 38. CONFLICTING REPORTS

## 39. "ONE NUMBER"

Same metric should not have multiple unexplained values.

## 40. LEADING KPI

## 41. LAGGING KPI

## 42. ACTIONABILITY

## 43. VANITY KPI

Only call it vanity if it does not support decision/outcome.

## 44. TARGET

## 45. THRESHOLD

## 46. ALERT

## 47. FALSE PRECISION

## 48. MATERIALITY

## 49. EXCEPTION REPORTING

## 50. TREND

## 51. SEASONALITY

## 52. FORECAST ACCURACY

## 53. BOARD REPORT

## 54. MANAGEMENT PACK

## 55. ACCESS CONTROL

Sensitive reporting.

## 56. DISTRIBUTION

## 57. DATA EXPORT

## 58. FALSE POSITIVE RULES

A KPI with no target is not automatically useless.

Manual commentary is not inherently weak.

## 59. EVIDENCE TIERS

```text
A - reconciled report/source data
B - complete KPI calculation path
C - strong reporting evidence
D - decision-usefulness inference
E - reporting hardening
```

Status findinga: CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED dok se ne potvrdi sa korisnicima izveštaja; tier E je HARDENING. Severity prati uticaj na odluke: **P0** sistemski netačan reporting na osnovu kog se donose materijalne odluke; **P1** materijalno netačan ili nereconciliovan ključni KPI; **P2** značajan gap u definiciji, izvoru ili pravovremenosti; **P3** ograničen problem u izveštaju; **P4** hardening.

## 60. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Report/KPI:
Audience:
Decision:
Definition:
Source:
Issue:
Financial/decision impact:
Evidence:
Recommended change:
```

## 61. KPI MATRIX

| KPI | Definition | Source | Owner | Decision |
|---|---|---|---|---|

## 62. SECOND PASS

Search:

- same KPI with different values
- unreconciled adjusted EBITDA
- stale dashboards
- manual copy/paste
- metric definition changes
- reports nobody uses
- decisions lacking required metric

## 63. FINAL QUALITY GATE

Confirm:

- audience
- decision
- KPI definitions
- sources
- reconciliation
- timing
- segments
- variance
- forecast
- ownership
- access

## 64. OUTPUT

`MANAGEMENT_REPORTING_AUDIT.md`

# KONAČNO PRAVILO

Management reporting nije uspešan zato što dashboard izgleda profesionalno.

Uspešan je kada:

> relevantna odluka može da se donese na osnovu tačnog, razumljivog i sledljivog podatka.
