---
id: UPL-PROD-067
number: 67
slug: workload-forecast-plan
title: Plan prognoze opterećenja
category: Produktivnost, organizacija i upravljanje
category_id: UPL-PROD
subcategory: Upravljanje vremenom, kapacitetom i resursima
subcategory_id: time-capacity-resource-management
language: sr
version: 1.0.0
status: stable
---

# PLAN PROGNOZE OPTEREĆENJA

Glavni cilj:

> Izgradite "Plan prognoze opterećenja" kao operativni sistem sa jasnim purpose-om, ownership-om, inputima, outputima, triggerima i proverom da li sistem stvarno smanjuje trenje.

## 1. KONTEKST
Define people/teams involved, work type, current tools/channels, cadence, volume, constraints, failure modes and success criteria.

## 2. DOMAIN STANDARD
Capacity planning must start from realistic available capacity rather than nominal headcount or calendar hours. Protect buffers for uncertainty, support work and unplanned demand.

## 3. INTEGRITY CHECKS
- available capacity excludes known overhead
- workload is sized consistently
- buffers are explicit
- critical constraints are visible
- resource conflicts use priority criteria
- deadlines are checked against dependencies
- utilization does not target 100% by default
- scenarios define trigger/actions

## 4. SYSTEM CARD
```text
Purpose:
Owner:
Trigger:
Inputs:
Process:
Output:
Consumer:
SLA/cadence:
Failure mode:
Escalation:
Review metric:
```

## 5. OBAVEZNE MATRICE
### Capacity Matrix
| Resource/team | Available | Committed | Buffer | Gap | Action |
|---|---:|---:|---:|---:|---|

### Constraint Matrix
| Constraint | Affected work | Severity | Owner | Option | Trigger |
|---|---|---|---|---|---|

## 6. FAILURE MODES
Avoid meetings without decisions, notes without actions, unclear ownership, overloaded capacity, hidden queues, status duplication, knowledge trapped in people, and systems that require heroic memory.

## 7. OBAVEZNI OUTPUT
1. Current system map.
2. Purpose and owner.
3. Trigger/input/output logic.
4. Risks/failure modes.
5. Required matrices.
6. Operating cadence.
7. Escalation.
8. Improvement criteria.

End with **Provera sistemskog integriteta** confirming the workflow reduces ambiguity and has measurable evidence of usefulness.
