---
id: UPL-IT-080
number: 80
slug: production-incident-simulation
title: Production Incident Simulation
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# PRODUCTION INCIDENT SIMULATION

I want you to design a controlled production-incident simulation / game-day exercise for the application, with the goal of testing detection, triage, containment, recovery, communication and post-incident learning without actually endangering users or data.

Main objective:

> Prove that the team and the system can recognize, understand, contain and recover from a realistic incident under time pressure, while validating the runbooks, observability and recovery assumptions.

This is not:

- causing a real production incident
- destructive chaos without safety boundaries
- a test of people as "culprits"
- a hidden punitive exercise
- a generic tabletop without technical injects

## 1. SIMULATION SCOPE

Define:

- environment
- systems
- participants
- observers
- allowed actions
- forbidden actions
- stop conditions

## 2. SAFETY

Prefer:

- staging
- sandbox
- isolated production-like environment

Production only with explicit safeguards/authorization.

## 3. INCIDENT CLASS

Choose realistic:

- DB unavailable
- DB slow
- queue backlog
- duplicate events
- provider outage
- credential expiry
- bad deployment
- config error
- data inconsistency
- cache corruption
- storage full
- DNS failure
- region failure
- security signal

## 4. BUSINESS IMPACT

## 5. INITIAL SIGNAL

What team sees first?

## 6. ALERT

## 7. USER REPORT

## 8. DASHBOARD

## 9. LOG

## 10. TRACE

## 11. METRIC

## 12. HIDDEN ROOT CAUSE

Participants should diagnose.

## 13. TIMELINE

## 14. INJECT

At controlled times.

## 15. ESCALATION

## 16. SECONDARY FAILURE

## 17. MISLEADING SIGNAL

Use sparingly.

## 18. TRIAGE

## 19. INCIDENT COMMAND

## 20. OWNER

## 21. COMMUNICATION

## 22. STATUS UPDATE

## 23. CUSTOMER IMPACT

## 24. CONTAINMENT

## 25. FEATURE DISABLE

## 26. TRAFFIC SHED

## 27. ROLLBACK

## 28. FAILOVER

## 29. RESTORE

## 30. RESTART

## 31. SECRET ROTATE

## 32. QUEUE DRAIN

## 33. DATA RECONCILE

## 34. RECOVERY VERIFY

## 35. FALSE RECOVERY

System looks healthy but invariant still broken.

## 36. DATA INTEGRITY CHECK

## 37. BUSINESS TRANSACTION CHECK

## 38. SYNTHETIC CHECK

## 39. RPO

## 40. RTO

## 41. ACTUAL RECOVERY TIME

## 42. RUNBOOK

Did it work?

## 43. MISSING STEP

## 44. STALE COMMAND

## 45. PERMISSION

Does responder have access?

## 46. MFA/ACCOUNT

## 47. CREDENTIAL

## 48. TOOL AVAILABILITY

## 49. DEPENDENCY STATUS

## 50. EXTERNAL CONTACT

## 51. DECISION LOG

## 52. TIMESTAMP

## 53. HANDOFF

## 54. FATIGUE

## 55. SHIFT

## 56. POSTMORTEM

## 57. BLAMELESS

Focus on system.

## 58. ROOT CAUSE

## 59. CONTRIBUTING FACTORS

## 60. DETECTION GAP

## 61. RUNBOOK GAP

## 62. OBSERVABILITY GAP

## 63. TEST GAP

## 64. ARCHITECTURE GAP

## 65. FOLLOW-UP

## 66. OWNER

## 67. DEADLINE

## 68. REGRESSION TEST

## 69. GAME DAY REPEAT

## 70. METRICS

Measure:

- detection time
- acknowledgment
- diagnosis
- containment
- recovery
- verification

## 71. FALSE POSITIVE RULES

Do not mark an "incident response failure" only because the team did not know the root cause in advance.

The exercise tests the process, not memorization of the scenario.

## 72. EVIDENCE TIERS

```text
A - observed during simulation
B - directly verified runbook/tool behavior
C - strong inferred gap
D - hypothesis
E - hardening opportunity
```

A gap is confirmed only with evidence tier A or B (observed during the simulation, or directly verified in the runbook or tool). A tier C or D gap stays NOT VERIFIED until a follow-up exercise or check confirms it; record the evidence tier in every finding.

## 73. SEVERITY

For findings of the simulation:

P0:
in a real incident, the gap could cause a catastrophic unrecoverable outcome

P1:
critical response/recovery gap

P2:
material delay/risk

P3:
limited process weakness

P4:
maturity improvement

## 74. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Simulation step:
Expected response:
Observed response:
Detection:
Decision:
Tool/runbook:
Delay:
Impact if real:
Root cause:
Improvement:
Owner:
Validation:
```

## 75. SIMULATION PLAN FORMAT

```text
Scenario:
Objective:
Environment:
Safety boundaries:
Participants:
Initial inject:
Timeline:
Expected signals:
Escalation injects:
Stop conditions:
Recovery target:
Success criteria:
Observers:
```

## 76. SECOND PASS

Add one unexpected but safe inject:

- provider remains slow after rollback
- queue contains duplicates
- monitoring dashboard unavailable
- primary responder lacks permission
- backup restore completes but data inconsistent
- rollback code incompatible with migrated schema

## 77. FINAL QUALITY GATE

Confirm:

- safety
- realism
- detection
- triage
- containment
- recovery
- data verification
- communication
- runbooks
- permissions
- metrics
- postmortem
- follow-up tests

## 78. OUTPUT

`PRODUCTION_INCIDENT_SIMULATION.md`

## 79. EXAMPLE SCENARIO

```text
10:00
database latency increases 20x
↓
API p95 rises
↓
workers accumulate
↓
queue depth rises
↓
responders see generic timeout alert
↓
at 10:10 external provider is also slowed artificially
↓
team must determine primary vs secondary symptom
↓
containment requires traffic reduction
↓
recovery only counts when queue drains and business transactions reconcile
```

# FINAL RULE

An incident simulation is not successful because the team "solved the incident".

It is successful if, after the exercise, you know:

```text
what the system sees
what the team sees
what it does not see
what it can fix
what it cannot
and how the next incident becomes less risky
```
