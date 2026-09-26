---
id: UPL-IT-080
number: 80
slug: production-incident-simulation
title: Production Incident Simulation
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# PRODUCTION INCIDENT SIMULATION

Želim da dizajniraš kontrolisanu production-incident simulation / game-day vežbu za aplikaciju, sa ciljem da testiramo detection, triage, containment, recovery, communication i post-incident learning bez stvarnog ugrožavanja korisnika ili podataka.

Glavni cilj:

> Dokazati da tim i sistem mogu prepoznati, razumeti, ograničiti i oporaviti se od realističnog incidenta pod vremenskim pritiskom, uz validaciju runbook-a, observability-ja i recovery pretpostavki.

Ovo nije:

- izazivanje realnog production incidenta
- destructive chaos bez safety boundary-ja
- test ljudi kao "krivaca"
- skrivena kaznena vežba
- generički tabletop bez tehničkih inject-a

## 1. SIMULATION SCOPE

Definiši:

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

Ne označavaj "incident response failure" samo zato što tim nije znao unapred root cause.

Vežba testira proces, ne memorisanje scenarija.

## 72. EVIDENCE TIERS

```text
A - observed during simulation
B - directly verified runbook/tool behavior
C - strong inferred gap
D - hypothesis
E - hardening opportunity
```

Gap je confirmed samo uz evidence tier A ili B (uočen tokom simulacije ili direktno proveren u runbook-u ili alatu). Gap tier C ili D ostaje NOT VERIFIED dok ga naredna vežba ili provera ne potvrdi; evidence tier upiši u svaki finding.

## 73. SEVERITY

Za findings simulation-a:

P0:
gap bi u realnom incidentu mogao izazvati catastrophic unrecoverable outcome

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

# KONAČNO PRAVILO

Incident simulation nije uspešna zato što je tim "rešio incident".

Uspešna je ako posle vežbe znaš:

```text
šta sistem vidi
šta tim vidi
šta ne vidi
šta može da popravi
šta ne može
i kako sledeći incident postaje manje rizičan
```
