---
id: UPL-BIZ-018
number: 18
slug: management-reporting-audit
title: Management Reporting Audit
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Accounting, Reporting & Financial Control
subcategory_id: accounting-reporting-financial-control
language: en
version: 1.0.0
status: stable
---

# MANAGEMENT REPORTING AUDIT

I want a deep audit of the management reporting system, including KPIs, P&L reporting, segment reporting, dashboards, variance analysis and decision usefulness.

Main objective:

> Determine whether management receives accurate, timely and decision-relevant information that can be reconciled to authoritative financial and operational data sources.

This is not:

- dashboard design audit
- "more KPIs is better"
- an assumption that every metric must be financial

## 1. AUDIENCE

- CEO
- CFO
- operations
- sales
- board
- department

## 2. DECISION

For each report:

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

Finding status: CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED until confirmed with the report users; tier E is HARDENING. Severity follows the impact on decisions: **P0** systemically wrong reporting on which material decisions are based; **P1** a materially wrong or unreconciled key KPI; **P2** a significant gap in definition, source or timeliness; **P3** a limited report issue; **P4** hardening.

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

# FINAL RULE

Management reporting is not successful because the dashboard looks professional.

It is successful when:

> the relevant decision can be made on the basis of accurate, understandable and traceable data.
