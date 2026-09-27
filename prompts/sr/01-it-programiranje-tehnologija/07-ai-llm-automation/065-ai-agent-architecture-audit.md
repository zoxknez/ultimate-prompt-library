---
id: UPL-IT-065
number: 65
slug: ai-agent-architecture-audit
title: Audit arhitekture AI agenata
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: AI, LLM i automatizacija
subcategory_id: ai-llm-automation
language: sr
version: 1.0.0
status: stable
---

# AUDIT ARHITEKTURE AI AGENATA

Želim kompletan arhitektonski audit AI agent sistema sa fokusom na decision loop, state, tools, memory, authorization, planning, orchestration, recovery i bounded autonomy.

Glavni cilj:

> Utvrditi da li agent architecture ima jasne trust boundaries, state invariants, execution limits i failure semantics, ili se oslanja na model da implicitno koordinira security, persistence, retries, side effects i recovery.

Ovo nije:

- samo prompt audit
- "agentic = bolje"
- insistiranje na planner/executor pattern-u
- insistiranje na multi-agent sistemu
- preporuka da svaki workflow postane agent
- pretpostavka da model može pouzdano zameniti deterministic workflow
- benchmark ko ima više tool call-ova

Prioritet:

**authority boundaries > side-effect correctness > state integrity > bounded execution > recovery > observability > maintainability > flexibility**

## 1. AGENT INVENTORY

Za svaki agent:

```text
Name:
Goal:
Trigger:
Model:
State:
Memory:
Tools:
Read/write authority:
Human confirmation:
Max steps:
Cost budget:
Persistence:
Retry:
Termination:
```

## 2. AGENT VS WORKFLOW

Pitaj:

Da li je agent stvarno potreban?

Ako flow može biti:

```text
deterministic state machine
```

bez model decision-a, agent možda samo povećava uncertainty.

Ne prijavljuj kao defect bez concrete downside-a.

## 3. ORCHESTRATION MODEL

Utvrdi:

- single-agent loop
- planner/executor
- supervisor
- multi-agent
- graph
- event-driven
- workflow with AI nodes

## 4. CONTROL PLANE

Ko odlučuje šta agent sme?

Model ili trusted code?

## 5. DATA PLANE

Koji podaci ulaze/izlaze?

## 6. STATE MACHINE

Implicitna conversation history nije dovoljna za critical workflow.

## 7. EXPLICIT STATE

Za long-running task:

- phase
- completed actions
- pending actions
- external receipts
- retries
- approvals

## 8. STATE AUTHORITY

Model-generated state nije automatski authoritative.

## 9. PERSISTENCE

Crash/restart.

## 10. CHECKPOINT

## 11. RESUME

## 12. DUPLICATE RESUME

## 13. STALE TASK

## 14. TASK VERSION

Workflow code changed while task paused.

## 15. PROMPT VERSION

## 16. MODEL VERSION

## 17. PLAN

Plan can guide execution but must not grant permission.

## 18. PLAN VALIDATION

## 19. DYNAMIC REPLANNING

Can invalidate prior confirmation.

## 20. TOOL INVENTORY

## 21. TOOL CAPABILITY

## 22. TOOL LEAST PRIVILEGE

## 23. TOOL DISCOVERY

## 24. DYNAMIC TOOL REGISTRY

## 25. MCP

## 26. TOOL SCHEMA

## 27. TOOL PRECONDITIONS

## 28. TOOL POSTCONDITIONS

## 29. SIDE EFFECT RECEIPT

## 30. UNKNOWN OUTCOME

Timeout.

## 31. IDEMPOTENCY

## 32. COMPENSATION

Not every action reversible.

## 33. TRANSACTION BOUNDARY

Distributed agent actions rarely share one transaction.

## 34. SAGA-LIKE WORKFLOW

If applicable.

## 35. COMPENSATING ACTION FAILURE

## 36. HUMAN CONFIRMATION

## 37. APPROVAL SCOPE

## 38. APPROVAL EXPIRY

## 39. ACTION BINDING

## 40. REAUTHENTICATION

High-risk operations.

## 41. AUTHORIZATION

Backend enforcement.

## 42. TENANT

## 43. USER DELEGATION

## 44. SERVICE IDENTITY

## 45. CREDENTIAL LIFETIME

## 46. AGENT IMPERSONATION

## 47. MEMORY

Types:

- working
- conversation
- episodic
- semantic
- user profile

## 48. MEMORY WRITE POLICY

## 49. MEMORY READ SCOPE

## 50. MEMORY POISONING

## 51. MEMORY CONFLICT

## 52. MEMORY DELETION

## 53. CONTEXT COMPACTION

## 54. SUMMARY DRIFT

Compacted memory can alter facts.

## 55. CONTEXT TRUNCATION

## 56. TOOL RESULT SIZE

## 57. RAG

## 58. INDIRECT INJECTION

## 59. MULTI-AGENT HANDOFF

What state is passed?

## 60. AUTHORITY HANDOFF

Sub-agent must not gain supervisor privilege by default.

## 61. DELEGATION

## 62. SUB-AGENT LIMITS

## 63. AGENT IDENTITY

## 64. SHARED MEMORY

Cross-agent poisoning.

## 65. MESSAGE ORDER

## 66. DUPLICATE MESSAGE

## 67. EVENTUAL CONSISTENCY

## 68. CONCURRENT AGENTS

Two agents modify same resource.

## 69. LOCK/LEASE

## 70. FENCING TOKEN

If distributed ownership matters.

## 71. TERMINATION

Success criteria.

## 72. FAILURE CRITERIA

## 73. MAX STEPS

## 74. MAX TIME

## 75. MAX COST

## 76. MAX TOOL CALLS

## 77. LOOP DETECTION

## 78. OSCILLATION

A -> B -> A.

## 79. REPEATED TOOL FAILURE

## 80. MODEL REFUSAL LOOP

## 81. FALLBACK

## 82. DEGRADED MODE

## 83. PROVIDER OUTAGE

## 84. TOOL OUTAGE

## 85. PARTIAL TOOL SET

## 86. CIRCUIT BREAKER

## 87. RETRY

## 88. BACKOFF

## 89. RETRY BUDGET

## 90. OBSERVABILITY

Trace:

```text
task
agent step
prompt/model
tool call
tool result
decision
state transition
cost
```

## 91. REPLAY

Can incident be reconstructed?

## 92. DETERMINISM

Not guaranteed.

## 93. AUDIT LOG

## 94. USER EXPLANATION

Separate explanation from actual decision evidence.

## 95. EVALUATION

Need task-level eval, not only single-turn.

## 96. TRAJECTORY EVAL

## 97. TOOL SELECTION EVAL

## 98. ACTION CORRECTNESS

## 99. COMPLETION

Did task actually finish?

## 100. EFFICIENCY

Steps/cost.

## 101. SAFETY

Unauthorized action rate.

## 102. LONG-HORIZON

Error compounds over steps.

## 103. STATE DRIFT

## 104. SELF-CORRECTION

Do not assume model will notice own error.

## 105. VERIFICATION TOOL

Where possible verify authoritative state.

## 106. FINAL ANSWER VS REAL STATE

Agent says "done" but action failed.

## 107. SANDBOX

## 108. CODE EXECUTION

## 109. BROWSER

## 110. FILESYSTEM

## 111. NETWORK

## 112. SHELL

## 113. EXTERNAL COMMUNICATION

## 114. FINANCIAL ACTION

## 115. DESTRUCTIVE ACTION

## 116. SECRETS

## 117. DATA RETENTION

## 118. MULTI-TENANT

## 119. FALSE POSITIVE RULES

Ne prijavljuj automatski:

- single-agent architecture
- multi-agent architecture
- absence of planner
- explicit planner
- memory
- no memory
- fixed max steps
- dynamic max steps

Problem mora imati concrete reliability/security/complexity consequence.

## 120. EVIDENCE TIERS

```text
A - reproduced trajectory/runtime failure
B - complete architecture/code path
C - strong static evidence
D - inference needing validation
E - hardening/architecture improvement
```

## 121. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 122. SEVERITY

P0:
- uncontrolled catastrophic autonomous action
- systemic cross-tenant authority collapse

P1:
- repeatable high-impact incorrect side effect
- persistent agent loop with material cost/impact
- approval/authorization bypass

P2:
- significant reliability/state/recovery defect

P3:
- limited architecture/observability issue

P4:
- maturity/hardening

## 123. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Agent:
Task:
State:
Step:
Tool:
Authority:
Trigger:
Trajectory:
Expected invariant:
Actual behavior:
External side effect:
Recovery:
Blast radius:
Evidence:
Root cause:
Architecture fix:
Regression trajectory:
```

## 124. MATRICES

### Agent Capability Matrix

| Agent | Tool | Read/Write | Scope | Confirmation | Idempotent |
|---|---|---|---|---|---|

### State Matrix

| State | Authority | Persistence | Resume | Conflict handling |
|---|---|---|---|---|

### Failure Matrix

| Failure | Detection | Retry | Compensation | Human escalation |
|---|---|---|---|---|

## 125. SECOND PASS

Simuliraj:

- crash mid-task
- duplicate resume
- same task started twice
- tool succeeds but times out
- tool fails after partial effect
- agent loops
- budget exhausted
- provider fallback
- memory poisoning
- stale approval
- state schema changes
- two agents edit same resource
- malicious retrieved content
- sub-agent gets excessive tool scope

## 126. FINAL QUALITY GATE

Check:

- architecture
- state
- authority
- tools
- side effects
- idempotency
- approvals
- memory
- concurrency
- termination
- budgets
- retries
- recovery
- fallback
- observability
- evaluation
- sandboxing
- tenant isolation

## 127. OUTPUT

`AI_AGENT_ARCHITECTURE_AUDIT.md`

## 128. FAILURE CHAINS

```text
agent creates support refund
↓
provider responds slowly
↓
HTTP timeout
↓
agent state records "refund failed"
↓
agent retries
↓
provider processed first request
↓
duplicate refund
```

```text
task paused waiting for approval
↓
resource changes while paused
↓
user approves old plan
↓
agent recalculates target silently
↓
approval no longer matches executed action
```

# KONAČNO PRAVILO

Model može odlučivati šta bi trebalo uraditi.

Trusted architecture mora odlučivati:

```text
šta sme
sa kojim scope-om
koliko puta
koliko dugo
sa kojim dokazom uspeha
i kako se oporavlja posle greške
```
