---
id: UPL-IT-070
number: 70
slug: ai-model-selection-and-evaluation
title: AI Model Selection & Evaluation
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: AI, LLM & Automation
subcategory_id: ai-llm-automation
language: en
version: 1.0.0
status: stable
---

# AI MODEL SELECTION AND EVALUATION

I want a rigorous, evidence-first process for selecting an AI model for a specific product or workflow.

Main objective:

> Choose a model based on the real task distribution, quality, reliability, latency, tool support, context behavior, privacy/security requirements and cost, without benchmark marketing and without a universal "best model".

This is not:

- ranking models by general impression
- blindly following a leaderboard
- choosing the newest model
- choosing the most expensive model
- choosing the cheapest model
- one benchmark for all tasks
- relying on a vendor demo
- testing only English if the product is not English-only

## 1. DEFINE TASK DISTRIBUTION

Inventory the real tasks.

For each:

```text
Task:
Frequency:
Criticality:
Input type:
Context size:
Output:
Tools:
Freshness:
Latency target:
Cost sensitivity:
Languages:
```

## 2. HARD REQUIREMENTS

Before the quality eval, filter by:

- modalities
- context
- tools
- structured output
- region
- privacy
- data retention
- throughput
- API availability

## 3. CURRENT PROVIDER FACTS

If features, pricing or limits may have changed:

verify current official information.

If not:

**CURRENT MODEL CAPABILITY/PRICING: NOT VERIFIED**

## 4. CANDIDATE SET

Do not include a model only because it is popular.

## 5. BASELINE

Current model or human/process baseline.

## 6. DATASET

Representative.

## 7. PRODUCTION DISTRIBUTION

## 8. EDGE CASE

## 9. HARD CASE

## 10. EASY CASE

## 11. UNANSWERABLE

## 12. ADVERSARIAL

## 13. LONG CONTEXT

## 14. SHORT CONTEXT

## 15. MULTI-LANGUAGE

## 16. DOMAIN

## 17. TOOL TASK

## 18. STRUCTURED OUTPUT

## 19. EXTRACTION

## 20. SUMMARIZATION

## 21. REASONING

## 22. CODE

## 23. RAG

## 24. AGENT

## 25. MULTIMODAL

## 26. REPETITIONS

## 27. NONDETERMINISM

## 28. PARAMETERS

Keep fair/configured.

## 29. PROMPT ADAPTATION

One shared prompt may unfairly favor model.

Evaluate:

- same prompt baseline
- then reasonable per-model optimization

Document both.

## 30. QUALITY RUBRIC

Define observable criteria.

## 31. BINARY CORRECTNESS

Where objective.

## 32. HUMAN RUBRIC

## 33. LLM JUDGE

## 34. JUDGE BIAS

## 35. BLIND EVAL

Hide model identity from humans if practical.

## 36. PAIRWISE

## 37. INTER-RATER

## 38. CRITICAL ERROR

Weight.

## 39. AVERAGE SCORE

Can hide catastrophic failures.

## 40. PASS@K

Where repeated attempts matter.

## 41. FIRST-TRY

Important for user-facing.

## 42. TOOL ACCURACY

## 43. ARGUMENT ACCURACY

## 44. TOOL COMPLETION

## 45. SCHEMA COMPLIANCE

## 46. HALLUCINATION

## 47. GROUNDING

## 48. REFUSAL

## 49. OVER-REFUSAL

## 50. INSTRUCTION FOLLOWING

## 51. LONG-CONTEXT RETRIEVAL

## 52. POSITION SENSITIVITY

## 53. LATENCY

- TTFT
- total
- p95

## 54. THROUGHPUT

## 55. RATE LIMIT

## 56. CONCURRENCY

## 57. STABILITY

## 58. PROVIDER OUTAGE

Historical/provider evidence if available.

## 59. FALLBACK

## 60. COST

Use current verified pricing.

## 61. INPUT TOKENS

## 62. OUTPUT TOKENS

## 63. CACHE

## 64. TOOL COST

## 65. COST PER PASS

## 66. COST PER SUCCESSFUL TASK

## 67. HUMAN REWORK

## 68. ROUTING

Maybe multiple models outperform one universal model.

## 69. EASY/HARD ROUTING

## 70. ROUTER ERROR

## 71. CASCADE

## 72. FALLBACK MODEL

## 73. PROVIDER DIVERSITY

## 74. OPERATIONAL COMPLEXITY

Two providers add complexity.

## 75. PRIVACY

## 76. RETENTION

## 77. REGION

## 78. COMPLIANCE

If relevant, verify actual requirements.

## 79. MODEL VERSIONING

Pinned vs alias.

## 80. SILENT PROVIDER UPDATE

If alias behavior changes.

## 81. DEPRECATION

## 82. MIGRATION COST

## 83. PROMPT PORTABILITY

## 84. TOOL PORTABILITY

## 85. OUTPUT DIFFERENCE

## 86. EVAL REPRODUCIBILITY

Store:

```text
model ID
date
prompt version
dataset version
parameters
results
```

## 87. CURRENTNESS

Re-run periodically.

## 88. DRIFT

Provider/model behavior changes.

## 89. CANARY

## 90. SHADOW

## 91. A/B

Where safe.

## 92. USER SEGMENT

## 93. LANGUAGE SEGMENT

## 94. TASK SEGMENT

## 95. OUTCOME METRIC

## 96. COST GUARD

## 97. QUALITY GUARD

## 98. ROLLBACK

## 99. MODEL ROUTING ARCHITECTURE

If multiple.

## 100. FALSE POSITIVE RULES

Do not conclude:

- bigger model wins
- latest model wins
- benchmark leader wins
- cheaper model is better
- faster model is better
- open model is better/worse
- proprietary model is better/worse

without task evidence.

## 101. EVIDENCE TIERS

```text
A - controlled task-specific eval / production experiment
B - reproducible benchmark on representative data
C - official capability/runtime facts
D - inference from external benchmarks
E - anecdote/vendor claim
```

A vendor claim is not enough for a selection conclusion.

## 102. STATUS

```text
VERIFIED
LIKELY
NOT VERIFIED
NOT APPLICABLE
```

## 103. IMPORTANT DECISION RULE

Do not build one global numeric score unless the weights are explicitly business-defined.

Show the trade-off instead.

## 104. MODEL COMPARISON MATRIX

| Model | Critical quality | General quality | p95 | Cost/success | Tools |
|---|---:|---:|---:|---:|---|

## 105. TASK MATRIX

| Task | Model A | Model B | Model C | Notes |
|---|---:|---:|---:|---|

## 106. FAILURE MATRIX

| Model | Critical failures | Refusal | Schema fail | Tool fail |
|---|---:|---:|---:|---:|

## 107. ROUTING MATRIX

| Task class | Primary | Fallback | Escalation condition |
|---|---|---|---|

## 108. DECISION OUTPUT

Do not give only:

```text
Model X is best.
```

Show:

```text
Task A:
observed strengths/weaknesses

Task B:
observed strengths/weaknesses

Tradeoffs:
quality
cost
latency
operations
```

If the user asks for a final selection for a non-political product decision, you can give a recommendation based on clearly documented weights.

## 109. SECOND PASS

Repeat the evaluation:

- hard cases only
- long context
- tool tasks
- unanswerable
- non-English
- provider retry/failure
- fallback
- high concurrency
- current pricing
- critical error analysis

## 110. FINAL QUALITY GATE

Confirm:

- real task distribution
- requirements
- current capability verification
- representative dataset
- repeated runs
- critical error weighting
- tools
- grounding
- refusal
- languages
- context
- latency
- throughput
- cost
- privacy
- operational complexity
- routing
- rollout
- drift

## 111. OUTPUT

`AI_MODEL_SELECTION_EVALUATION.md`

## 112. FAILURE CHAINS

```text
public benchmark shows Model A ahead
↓
product mostly processes Serbian legal documents
↓
benchmark is English general reasoning
↓
no local-language evaluation exists
↓
team migrates
↓
critical extraction quality declines
```

```text
Model B costs 60% less per token
↓
requires twice as many retries
↓
outputs are longer
↓
human correction rises
↓
cost per successful task is higher
```

```text
Model C wins single-turn benchmark
↓
production task requires 12-step tool workflow
↓
tool argument error rate is much higher
↓
end-to-end completion is lower despite stronger raw reasoning
```

# FINAL RULE

Do not look for the universally best model.

Look for:

```text
the best model
for a specific task distribution
with specific quality thresholds
in a specific latency/cost/privacy environment
```

and repeat the evaluation when the models, pricing, provider behavior or the product itself change significantly.
