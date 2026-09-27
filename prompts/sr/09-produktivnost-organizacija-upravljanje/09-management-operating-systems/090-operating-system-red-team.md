---
id: UPL-PROD-090
number: 90
slug: operating-system-red-team
title: Red-team operativnog sistema
category: Produktivnost, organizacija i upravljanje
category_id: UPL-PROD
subcategory: Menadžment i operativni sistemi
subcategory_id: management-operating-systems
language: sr
version: 1.0.0
status: stable
---

# RED-TEAM OPERATIVNOG SISTEMA

Glavni cilj:

> Sprovedite sistemski audit i redizajn za "Red-team operativnog sistema", sa jasnim ownership-om, informacijskim tokom, kontrolama, metrikama i kontinuiranim unapređenjem.

## 1. SISTEMSKI KONTEKST
Define users/stakeholders, current tools/repositories, process boundaries, information flows, decision cadence, metrics, pain points, failure modes and governance.

## 2. DOMAIN STANDARD
Management operating systems should connect metrics, decisions, reviews and escalation. Governance must clarify who decides, who provides input and what evidence triggers intervention.

## 3. INTEGRITY CHECKS
- metrics map to decisions
- review cadence has defined purpose
- decision rights are explicit
- escalation thresholds are known
- information flow avoids duplicate reporting
- controls are proportionate
- organizational health includes leading signals
- operating model matches actual work

## 4. SYSTEM AUDIT CARD
```text
System/process:
Purpose:
Owner:
User/consumer:
Source of truth:
Trigger:
Metric:
Failure mode:
Control:
Improvement hypothesis:
Review date:
```

## 5. OBAVEZNE MATRICE
### Management Rhythm Matrix
| Forum/review | Purpose | Inputs | Decision | Owner | Cadence |
|---|---|---|---|---|---|

### Governance Matrix
| Decision | Owner | Input | Constraint | Escalation | Evidence |
|---|---|---|---|---|---|

## 6. FAILURE MODES
Avoid duplicate sources of truth, stale documentation, unclear governance, metric overload, local optimization, tool proliferation, improvement theater and changes with no adoption or outcome check.

## 7. OBAVEZNI OUTPUT
1. Current-state map.
2. Ownership/governance.
3. Main friction/failure modes.
4. Required matrices.
5. Redesign/improvement actions.
6. Adoption/control plan.
7. Metrics.
8. Review/rollback criteria.

End with **Provera integriteta operativnog sistema** confirming that the redesigned system is simpler, owned, measurable and reviewable.
