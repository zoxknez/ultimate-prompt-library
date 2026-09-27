---
id: UPL-PROD-037
number: 37
slug: process-cycle-time-review
title: Pregled cycle time-a procesa
category: Produktivnost, organizacija i upravljanje
category_id: UPL-PROD
subcategory: Workflow, procesi i automatizacija
subcategory_id: workflow-process-automation
language: sr
version: 1.0.0
status: stable
---

# PREGLED CYCLE TIME-A PROCESA

Glavni cilj:

> Sprovedite izvršiv i auditabilan workflow za "Pregled cycle time-a procesa", sa jasnim ciljem, ownerom, pretpostavkama, zavisnostima, rizicima i review triggerima.

## 1. OPERATIVNI KONTEKST
Define objective, scope, owner, stakeholders, constraints, deadline, dependencies, current state, available capacity and success criteria.

## 2. DOMAIN STANDARD
Process design should reduce delay, rework and ambiguity. Automation should remove repeatable work only after the process, exception path, owner and controls are understood.

## 3. INTEGRITY CHECKS
- process start/end are explicit
- handoffs define required inputs/outputs
- bottlenecks use evidence
- SOPs distinguish standard and exception paths
- automation has fallback/manual override
- controls are proportionate
- cycle-time changes preserve quality
- continuous improvement has a backlog and owner

## 4. OPERATING CARD
```text
Objective:
Owner:
Scope:
Dependency:
Assumption:
Risk:
Decision:
Next action:
Deadline/trigger:
Success evidence:
Review date:
```

## 5. OBAVEZNE MATRICE
### Process Matrix
| Step | Input | Owner | Output | Wait | Failure mode | Control |
|---|---|---|---|---|---|---|

### Automation Matrix
| Task | Rule stability | Volume | Risk | Human review | Fallback | Decision |
|---|---|---|---|---|---|---|

## 6. FAILURE MODES
Avoid ownerless work, hidden dependencies, vague goals, unbounded scope, excessive process, automation without controls, status reporting with no decision value and plans that ignore capacity.

## 7. OBAVEZNI OUTPUT
1. Objective and scope.
2. Owner/stakeholders.
3. Dependencies and assumptions.
4. Risks/controls.
5. Required matrices.
6. Execution sequence.
7. Review cadence.
8. Stop/change/escalation triggers.

End with **Provera operativnog integriteta** confirming every active item has ownership, a next action and a review mechanism.
