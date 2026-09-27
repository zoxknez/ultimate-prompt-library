---
id: UPL-MKT-043
number: 43
slug: lead-nurture-sequence
title: Lead Nurture Sequence
category: Marketing, Sales & Communication
category_id: UPL-MKT
subcategory: Email, Lifecycle & CRM Marketing
subcategory_id: email-lifecycle-crm
language: en
version: 1.0.0
status: stable
---

# LEAD NURTURE SEQUENCE

Main objective:

> Design or audit Lead Nurture Sequence so lifecycle communication matches the user's actual state, behavioral signals and business objective.

## 1. LIFECYCLE CONTEXT
Define lifecycle stage, segment, trigger, user state, value already received, desired next action, exclusions, consent/preferences and success metric.

## 2. LIFECYCLE STANDARD
- message only when there is a relevant user state or trigger
- separate onboarding, activation, nurture, retention and reactivation
- avoid batch-and-blast when behavior-based segmentation is available
- respect consent, frequency and preference controls
- make automation exits explicit
- measure downstream behavior, not opens alone

## 3. FLOW CARD
```text
Entry trigger:
Segment:
User state:
Message purpose:
CTA:
Delay:
Exit condition:
Suppression:
Success event:
Risk:
```

## 4. REQUIRED MATRICES
### Lifecycle Journey Matrix
| Stage | Trigger | Message | CTA | Exit | Metric |
|---|---|---|---|---|---|

### Segmentation Matrix
| Segment | Evidence | Need/state | Treatment | Exclusion | KPI |
|---|---|---|---|---|---|

## 5. FAILURE MODES
Avoid over-emailing, stale automations, contradictory journeys, open-rate-only optimization, reactivation without value, poor suppression logic and CRM fields with unclear ownership.

## 6. REQUIRED OUTPUT
1. Lifecycle stage.
2. Trigger and segment logic.
3. Message/sequence.
4. Exit/suppression rules.
5. Required matrices.
6. Deliverability/consent risks.
7. Measurement.
8. Optimization plan.

End with **Lifecycle Integrity Check** confirming messages are relevant, permission-aware and tied to a meaningful downstream event.

This prompt does not guarantee deliverability or conversion.
