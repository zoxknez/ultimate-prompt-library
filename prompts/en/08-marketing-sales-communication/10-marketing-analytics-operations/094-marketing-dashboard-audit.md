---
id: UPL-MKT-094
number: 94
slug: marketing-dashboard-audit
title: Marketing Dashboard Audit
category: Marketing, Sales & Communication
category_id: UPL-MKT
subcategory: Marketing Analytics & Operations
subcategory_id: marketing-analytics-operations
language: en
version: 1.0.0
status: stable
---

# MARKETING DASHBOARD AUDIT

Main objective:

> Perform Marketing Dashboard Audit through defined metrics, trustworthy data, attribution limits, operational ownership and decision-ready reporting.

## 1. MEASUREMENT CONTEXT
Define business objective, funnel stages, source systems, event definitions, attribution model, reporting cadence, owners, decision users and known data-quality issues.

## 2. MEASUREMENT STANDARD
- define numerator and denominator
- define source of truth
- separate leading from lagging metrics
- separate correlation/attribution from incrementality
- use consistent funnel-stage definitions
- document event/schema changes
- assign owner and SLA for lead/data flows
- dashboards should support decisions, not display every metric

## 3. KPI CARD
```text
Metric:
Business question:
Definition:
Numerator:
Denominator:
Source:
Owner:
Cadence:
Target/threshold:
Known bias:
Decision triggered:
```

## 4. REQUIRED MATRICES
### Funnel Measurement Matrix
| Stage | Entry event | Exit event | Denominator | Conversion | Owner | Data source |
|---|---|---|---|---|---|---|

### Attribution Triangulation Matrix
| Channel | Platform attribution | Analytics attribution | Experiment/incrementality | Difference | Decision |
|---|---|---|---|---|---|

### Operations Control Matrix
| Process | Trigger | Owner | SLA | Failure mode | Monitoring |
|---|---|---|---|---|---|

## 5. FAILURE MODES
Avoid dashboard sprawl, changing definitions silently, optimizing proxy metrics, double-counting conversions, stale lead routing, forecasts without scenarios and treating attribution output as causal truth.

## 6. REQUIRED OUTPUT
1. Objective/funnel map.
2. KPI definitions.
3. Data-quality findings.
4. Attribution/incrementality view.
5. Required matrices.
6. Operational owners/SLAs.
7. Forecast/scenario logic.
8. Decision cadence.

End with **Marketing Operations Integrity Check** confirming each metric and process has a definition, source, owner and decision use.

This supports marketing analytics and operations and does not guarantee third-party attribution accuracy or future performance.
