---
id: UPL-IT-065
number: 65
slug: ai-agent-architecture-audit
title: AI Agent Architecture Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: AI, LLM & Automation
subcategory_id: ai-llm-automation
language: en
version: 1.0.0
status: stable
---

# AI AGENT ARCHITECTURE AUDIT

I want a complete architectural audit of the AI agent system with a focus on the decision loop, state, tools, memory, authorization, planning, orchestration, recovery and bounded autonomy.

Main objective:

> Determine whether the agent architecture has clear trust boundaries, state invariants, execution limits and failure semantics, or relies on the model to implicitly coordinate security, persistence, retries, side effects and recovery.

This is not:

- only a prompt audit
- "agentic = better"
- insisting on a planner/executor pattern
- insisting on a multi-agent system
- a recommendation that every workflow become an agent
- an assumption that a model can reliably replace a deterministic workflow
- a benchmark of who makes more tool calls

Priority:

**authority boundaries > side-effect correctness > state integrity > bounded execution > recovery > observability > maintainability > flexibility**

## 1. AGENT INVENTORY

For each agent:

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

Ask:

Is an agent actually needed?

If the flow can be:

```text
deterministic state machine
```

without a model decision, the agent may only increase uncertainty.

Do not report it as a defect without a concrete downside.

## 3. ORCHESTRATION MODEL

Determine:

- single-agent loop
- planner/executor
- supervisor
- multi-agent
- graph
- event-driven
- workflow with AI nodes

## 4. CONTROL PLANE

Who decides what the agent is allowed to do?

The model or trusted code?

## 5. DATA PLANE

Which data goes in and out?

## 6. STATE MACHINE

Implicit conversation history is not enough for a critical workflow.

## 7. EXPLICIT STATE

For a long-running task:

- phase
- completed actions
- pending actions
- external receipts
- retries
- approvals

## 8. STATE AUTHORITY

Model-generated state is not automatically authoritative.

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

Do not automatically report:

- single-agent architecture
- multi-agent architecture
- absence of planner
- explicit planner
- memory
- no memory
- fixed max steps
- dynamic max steps

A problem must have a concrete reliability, security or complexity consequence.

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

Simulate:

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

# FINAL RULE

The model can decide what should be done.

Trusted architecture must decide:

```text
what is allowed
with which scope
how many times
for how long
with which proof of success
and how it recovers after an error
```
