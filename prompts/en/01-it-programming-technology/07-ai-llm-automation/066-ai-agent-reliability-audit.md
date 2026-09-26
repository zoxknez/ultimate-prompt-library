---
id: UPL-IT-066
number: 66
slug: ai-agent-reliability-audit
title: AI Agent Reliability Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: AI, LLM & Automation
subcategory_id: ai-llm-automation
language: en
version: 1.0.0
status: stable
---

# AI AGENT RELIABILITY AUDIT

I want a deep reliability audit of the AI agent with a focus on trajectory correctness, retries, loops, recovery, partial side effects, concurrency, nondeterminism and real task completion.

Main objective:

> Prove that the agent can reliably complete the task under failure conditions too, not only in an ideal happy-path demo.

## 1. RELIABILITY SLO

Define:

- success
- partial success
- safe failure
- unsafe failure

## 2. TASK CLASSES

Segment them.

## 3. COMPLETION CRITERIA

Model saying "done" is not completion.

## 4. AUTHORITATIVE VERIFICATION

## 5. TRAJECTORY

Record every step.

## 6. STEP FAILURE

## 7. PARTIAL SUCCESS

## 8. RETRY

## 9. IDEMPOTENCY

## 10. UNKNOWN OUTCOME

## 11. DUPLICATE TOOL CALL

## 12. DUPLICATE AGENT RUN

## 13. CRASH

## 14. RESUME

## 15. CHECKPOINT

## 16. STALE CHECKPOINT

## 17. STATE VERSION

## 18. RETRY AFTER CODE UPDATE

## 19. PROVIDER TIMEOUT

## 20. PROVIDER 5XX

## 21. RATE LIMIT

## 22. FALLBACK MODEL

## 23. QUALITY DEGRADATION

## 24. TOOL TIMEOUT

## 25. TOOL RATE LIMIT

## 26. TOOL PARTIAL EFFECT

## 27. TOOL SCHEMA ERROR

## 28. TOOL RESULT MALFORMED

## 29. NETWORK PARTITION

## 30. EXTERNAL CONSISTENCY

## 31. LONG-RUN TASK

## 32. LEASE EXPIRY

## 33. CONCURRENT WORKER

## 34. FENCING

## 35. DUPLICATE QUEUE DELIVERY

## 36. MESSAGE ORDER

## 37. STALE EVENT

## 38. LOOP

## 39. OSCILLATION

## 40. REPEATED ERROR

## 41. MAX STEPS

## 42. MAX WALL CLOCK

## 43. MAX COST

## 44. MAX TOKENS

## 45. MAX TOOL CALLS

## 46. ESCALATION

## 47. HUMAN TAKEOVER

## 48. CANCELLATION

## 49. CANCEL DURING TOOL

## 50. CANCEL AFTER EFFECT

## 51. USER DISCONNECT

## 52. BACKGROUND DURABILITY

## 53. MODEL NONDETERMINISM

## 54. REPEATED RUNS

## 55. SUCCESS RATE

## 56. CRITICAL FAILURE RATE

## 57. RETRY SUCCESS

## 58. MEAN STEPS

## 59. P95 STEPS

## 60. COST DISTRIBUTION

## 61. TAIL LATENCY

## 62. PATH EXPLOSION

## 63. LONG-CONTEXT DRIFT

## 64. SUMMARY DRIFT

## 65. MEMORY STALE

## 66. CONTEXT LOSS

## 67. TOOL DISCOVERY CHANGE

## 68. MODEL UPGRADE

## 69. PROMPT UPGRADE

## 70. REGRESSION SET

## 71. TRAJECTORY GOLDEN SET

## 72. CHAOS TESTING

Safe mocks/staging.

## 73. FAULT INJECTION

Inject:

- timeouts
- duplicate results
- malformed responses
- slow tools
- stale data

## 74. PROPERTY

Critical invariant should survive.

## 75. EXACTLY ONCE

Do not claim unless proven.

## 76. AT-LEAST-ONCE

Design for duplicate.

## 77. COMPENSATION

## 78. COMPENSATION FAILURE

## 79. RECONCILIATION

## 80. FINAL STATE CHECK

## 81. SIDE EFFECT LEDGER

## 82. RECEIPTS

## 83. OBSERVABILITY

## 84. TRACE CORRELATION

## 85. INCIDENT REPLAY

## 86. USER-VISIBLE FAILURE

## 87. ERROR MESSAGE

## 88. SAFE RETRY UX

## 89. RETRY BUTTON

Must not duplicate effect.

## 90. FALSE POSITIVE RULES

- multiple steps are not failure
- retries are not failure
- fallback is not failure
- nondeterminism is not failure

Finding requires measurable correctness/reliability impact.

## 91. EVIDENCE TIERS

```text
A - reproduced failure/fault injection/runtime trace
B - complete control-flow proof
C - strong static evidence
D - suspected failure
E - hardening
```

## 92. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 93. SEVERITY

P0:
catastrophic autonomous reliability failure with irreversible impact

P1:
repeatable critical duplicate/lost side effect, runaway execution or unsafe recovery

P2:
material task failure under realistic faults

P3:
limited resilience/observability weakness

P4:
maturity/hardening

## 94. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Task:
Fault:
Trajectory:
Checkpoint:
Retry:
External effect:
Expected state:
Actual state:
Detection:
Recovery:
Impact:
Evidence:
Fix:
Chaos/regression test:
```

## 95. RELIABILITY MATRIX

| Task | Happy path | Timeout | Duplicate | Crash/resume | Fallback |
|---|---|---|---|---|---|

## 96. FAILURE MATRIX

| Component | Fault | Detection | Retry | Safe? |
|---|---|---|---|---|

## 97. SECOND PASS

Force:

- every external call timeout once
- every write receive duplicate response
- model returns invalid tool args
- process crash after side effect
- process crash before checkpoint
- fallback model mid-task
- two workers same task
- cancellation at every stage
- memory missing
- context truncated

## 98. FINAL QUALITY GATE

Confirm:

- completion
- verification
- retries
- idempotency
- crash
- resume
- duplicates
- concurrency
- loops
- budgets
- cancellation
- compensation
- reconciliation
- fault injection
- metrics
- incident replay

## 99. OUTPUT

`AI_AGENT_RELIABILITY_AUDIT.md`

## 100. FAILURE CHAINS

```text
agent sends email
↓
SMTP accepted message
↓
network response lost
↓
tool reports timeout
↓
agent retries
↓
recipient gets duplicate email
```

```text
agent loop repeatedly calls search
↓
each result slightly changes summary
↓
model believes more research is needed
↓
no max-cost/step boundary
↓
task consumes extreme tokens without progress
```

# FINAL RULE

Agent reliability is not measured by the agent completing 20 ideal demo tasks.

It is measured by whether, under controlled failure conditions, it:

```text
does not lose state
does not duplicate effects
does not exceed its authority
does not loop indefinitely
and can prove the actual final result
```
