---
id: UPL-IT-069
number: 69
slug: llm-cost-and-latency-optimization
title: Optimizacija troškova i latencije LLM-a
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: AI, LLM i automatizacija
subcategory_id: ai-llm-automation
language: sr
version: 1.0.0
status: stable
---

# OPTIMIZACIJA TROŠKOVA I LATENCIJE LLM-A

Želim duboku analizu troška i latencije LLM sistema bez degradacije critical quality-ja.

Glavni cilj:

> Identifikovati gde se tokeni, model pozivi, retrieval, tool pozivi i čekanje nepotrebno troše, a zatim dokazati optimizaciju kroz merljive before/after rezultate uz quality regression guard.

Ovo nije:

- "koristi jeftiniji model"
- "skrati prompt"
- "smanji max_tokens"
- "dodaj cache"
- automatski routing na small model
- optimizacija proseka dok p95/p99 ostaje loš
- savings bez quality eval-a

Prioritet:

**critical quality preserved > correctness > reliability > cost > p95 latency > average latency**

## 1. BASELINE

Measure:

```text
requests/day
model calls/request
input tokens
cached input
output tokens
tool calls
retrieval calls
latency
cost/request
cost/day
```

## 2. SEGMENT

By use case.

## 3. MODEL

## 4. INPUT SIZE

## 5. OUTPUT SIZE

## 6. TOOL PATH

## 7. SUCCESS/FAILURE

## 8. RETRY

## 9. FALLBACK

## 10. STATIC PROMPT TOKENS

## 11. DYNAMIC CONTEXT TOKENS

## 12. CONVERSATION HISTORY

## 13. RAG TOKENS

## 14. TOOL OUTPUT TOKENS

## 15. DUPLICATE CONTEXT

## 16. REDUNDANT SYSTEM RULE

## 17. FULL DOCUMENT

Could be narrowed.

## 18. HISTORY COMPACTION

Must preserve facts.

## 19. SUMMARY DRIFT

## 20. CACHE

Prompt/provider caching if available.

## 21. APPLICATION CACHE

## 22. SEMANTIC CACHE

Risk.

## 23. USER SCOPE

## 24. FRESHNESS

## 25. CACHE HIT RATE

## 26. MODEL ROUTING

## 27. TASK COMPLEXITY

## 28. SMALL MODEL

Evaluate.

## 29. LARGE MODEL

Use only where benefit proven.

## 30. CASCADE

Small first, large on uncertainty.

## 31. CASCADE FALSE NEGATIVE

Small model incorrectly thinks it succeeded.

## 32. ROUTER

Needs eval.

## 33. CONFIDENCE

Do not rely on model self-confidence alone.

## 34. OUTPUT TOKENS

## 35. STOP

## 36. STRUCTURED OUTPUT

Can reduce verbosity.

## 37. STREAMING

Improves perceived latency, not total compute.

## 38. TTFT

## 39. TOKENS/SECOND

## 40. TOTAL LATENCY

## 41. RETRIEVAL LATENCY

## 42. RERANK LATENCY

## 43. TOOL LATENCY

## 44. SERIAL CALLS

## 45. PARALLEL CALLS

Only independent calls.

## 46. SPECULATIVE PARALLELISM

Can waste cost.

## 47. DEPENDENCY GRAPH

## 48. N+1 MODEL CALL

## 49. LOOP

## 50. MULTI-AGENT

Can multiply cost.

## 51. JUDGE CALL

## 52. SELF-CRITIQUE CALL

Measure benefit.

## 53. RETRY COST

## 54. INVALID JSON RETRY

Improve schema/prompt.

## 55. TOOL ERROR RETRY

## 56. PROVIDER RATE LIMIT

## 57. CONCURRENCY

## 58. BATCH

Embeddings/classification where provider supports.

## 59. ASYNC

Non-interactive task.

## 60. BACKGROUND

## 61. PRIORITY QUEUE

## 62. SLA

Not all tasks need same latency.

## 63. TIMEOUT

## 64. DEADLINE PROPAGATION

## 65. BUDGET

Per task/user/tenant.

## 66. MAX STEPS

## 67. TOKEN CAP

## 68. COST CAP

## 69. PROVIDER PRICING

Must use current verified pricing if calculating real money.

If not verified:

**CURRENT PROVIDER PRICING: NOT VERIFIED**

## 70. CACHED TOKEN PRICING

Provider-specific.

## 71. TOOL/API COST

## 72. VECTOR DB COST

## 73. STORAGE/LOG COST

## 74. UNIT ECONOMICS

Cost per successful task.

## 75. COST PER BUSINESS OUTCOME

More useful than cost per request where possible.

## 76. FAILURE COST

Failed task still costs money.

## 77. REWORK COST

Bad AI answer causes human work.

## 78. HUMAN ESCALATION

May be cheaper than huge model loop.

## 79. QUALITY BASELINE

Mandatory.

## 80. EVAL SET

## 81. QUALITY BY SEGMENT

## 82. CRITICAL CASE

## 83. NON-CRITICAL CASE

## 84. OPTIMIZATION EXPERIMENT

One variable at time where possible.

## 85. BEFORE/AFTER

## 86. STATISTICAL VARIANCE

Repeated runs.

## 87. COST SAVINGS

## 88. LATENCY SAVINGS

## 89. QUALITY DELTA

## 90. CRITICAL REGRESSION

Blocks rollout.

## 91. CANARY

## 92. ROLLBACK

## 93. OBSERVABILITY

Per request:

- model
- input/output token
- cache hit
- cost
- latency
- tools
- retries
- outcome

## 94. OUTLIER

## 95. EXPENSIVE USER/TENANT

## 96. ABUSE

## 97. RATE LIMIT

## 98. COST ANOMALY

## 99. DAILY BUDGET

## 100. FALSE POSITIVE RULES

Ne prijavljuj:

- large model
- long prompt
- multiple model calls
- no cache
- streaming
- retrieval

kao problem bez workload evidence.

## 101. EVIDENCE TIERS

```text
A - measured production/controlled benchmark
B - reproducible profiling
C - strong static cost path
D - hypothesis
E - optimization idea
```

## 102. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 103. SEVERITY

P0:
cost runaway threatens system/account availability or creates catastrophic financial exposure

P1:
repeatable high-volume runaway or severe latency failure in critical path

P2:
material cost/latency inefficiency

P3:
limited optimization

P4:
optional tuning

## 104. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Flow:
Model:
Volume:
Current tokens:
Current calls:
Current latency:
Current cost:
Cause:
Optimization:
New latency:
New cost:
Quality delta:
Critical regression:
Evidence:
Rollout:
```

## 105. COST MATRIX

| Flow | Calls | In tokens | Out tokens | Cost | Success |
|---|---:|---:|---:|---:|---:|

## 106. LATENCY MATRIX

| Stage | p50 | p95 | p99 | Dependency |
|---|---:|---:|---:|---|

## 107. MODEL ROUTING MATRIX

| Task | Current | Candidate | Quality | Cost | Latency |
|---|---|---|---:|---:|---:|

## 108. SECOND PASS

Test:

- long conversation
- max document size
- fallback model
- provider retry
- no cache
- cache hit
- 10x concurrency
- expensive tenant
- tool timeout
- agent loop
- small-model route
- quality-critical cases

## 109. FINAL QUALITY GATE

Confirm:

- baseline
- segmentation
- model calls
- tokens
- cache
- retrieval
- tools
- retries
- routing
- concurrency
- p95/p99
- provider pricing verification
- quality eval
- rollout guard
- observability

## 110. OUTPUT

`LLM_COST_LATENCY_OPTIMIZATION.md`

## 111. FAILURE CHAINS

```text
every user turn sends entire 200-message history
↓
static context grows continuously
↓
input tokens dominate cost
↓
latency and price rise with session age
↓
no measured benefit from older messages
```

```text
cheap model classifies task
↓
false "easy" classification routes complex task to weak model
↓
output passes schema
↓
quality silently drops
↓
cost improves but business outcome worsens
```

# KONAČNO PRAVILO

Najjeftiniji AI sistem nije onaj sa najmanjim token računom.

Najbolji optimization target je:

```text
cost per successful, correct, useful task
```

uz očuvane critical quality gates.
