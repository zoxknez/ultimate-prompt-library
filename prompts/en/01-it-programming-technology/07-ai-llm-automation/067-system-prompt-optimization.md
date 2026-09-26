---
id: UPL-IT-067
number: 67
slug: system-prompt-optimization
title: System Prompt Optimization
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: AI, LLM & Automation
subcategory_id: ai-llm-automation
language: en
version: 1.0.0
status: stable
---

# SYSTEM PROMPT OPTIMIZATION

I want a forensic and experimental audit of the system/developer prompt, with the goal of improving instruction clarity, task reliability, token efficiency, security posture and maintainability without prompt superstition.

Main objective:

> Determine which instructions actually change the model's behavior and which are redundant, contradictory, unverifiable or unnecessarily expensive, and build a shorter or clearer prompt that keeps or improves the measured results.

This is not:

- "write a better prompt"
- rewriting the prompt in nicer English
- automatic shortening
- automatic lengthening
- cargo-cult phrases such as "think step by step"
- an assumption that CAPS LOCK increases compliance
- an assumption that repeating an instruction guarantees higher priority
- optimizing only for token count
- changing the prompt without a regression eval

## 1. CURRENT PROMPT INVENTORY

Load:

- system prompt
- developer prompt
- dynamic instructions
- tool descriptions
- schemas
- memory instructions
- response-format instructions

## 2. PROMPT PURPOSE

For each instruction, determine:

```text
Behavior:
Why needed:
Risk if removed:
How tested:
```

## 3. INSTRUCTION CATEGORIES

- identity/role
- task objective
- constraints
- security
- formatting
- tools
- uncertainty
- source handling
- workflow
- style
- examples

## 4. DUPLICATION

## 5. CONTRADICTION

## 6. PRIORITY CONFLICT

## 7. VAGUE INSTRUCTION

"Be accurate" without operational definition.

## 8. NON-ACTIONABLE

## 9. IMPOSSIBLE INSTRUCTION

"Never make a mistake."

## 10. UNVERIFIABLE

## 11. OVERCONSTRAINT

Can hurt legitimate tasks.

## 12. UNDERCONSTRAINT

## 13. NEGATIVE INSTRUCTION

"Do not X" may need positive alternative.

## 14. CONDITIONAL RULE

Make trigger clear.

## 15. EXCEPTION

## 16. SCOPE

Does instruction apply globally or only some tasks?

## 17. DYNAMIC CONTEXT

Avoid static prompt carrying task-specific facts that should be dynamic.

## 18. CURRENT FACTS

Do not hardcode rapidly changing facts in system prompt.

## 19. TOOL DESCRIPTIONS

Part of effective prompt.

## 20. TOOL OVERLAP

## 21. OUTPUT SCHEMA

## 22. STYLE INSTRUCTION

Should not interfere with correctness.

## 23. SAFETY

System prompt is not authorization.

## 24. SECRETS

Never put secret in prompt.

## 25. PROMPT LEAK

Assume instructions may be exposed.

## 26. USER OVERRIDE

Clarify priority.

## 27. EXTERNAL CONTENT

Mark untrusted.

## 28. EXAMPLES

Few-shot examples can strongly shape behavior.

## 29. EXAMPLE BIAS

## 30. EXAMPLE COVERAGE

## 31. NEGATIVE EXAMPLES

## 32. TOKEN COST

Calculate static input cost per request.

## 33. CACHED INPUT

Provider-dependent.

## 34. LONG PROMPT EFFECT

More instructions can reduce effective compliance.

## 35. CRITICAL INSTRUCTION POSITION

Test, do not rely on folklore.

## 36. REPEAT

Empirically test.

## 37. DELIMITERS

Useful for structure.

## 38. XML/Markdown/JSON

Format choice must serve model/task, not fashion.

## 39. HUMAN READABILITY

Important for maintenance.

## 40. VERSIONING

## 41. CHANGE LOG

## 42. OWNERSHIP

## 43. EVAL DATASET

Must exist before "optimization".

## 44. BASELINE

Measure current prompt.

## 45. METRICS

- correctness
- instruction compliance
- tool accuracy
- refusal
- format
- latency
- tokens
- cost

## 46. CRITICAL CASES

Weighted.

## 47. ABLATION

Remove one instruction/category.

## 48. ADDITION

Add one change.

## 49. ISOLATE VARIABLES

Do not rewrite everything then guess cause.

## 50. MULTIPLE RUNS

## 51. MODEL SEGMENT

Prompt may work differently across models.

## 52. FALLBACK MODEL

## 53. LANGUAGE

## 54. SHORT INPUT

## 55. LONG INPUT

## 56. ADVERSARIAL INPUT

## 57. TOOL TASK

## 58. UNANSWERABLE TASK

## 59. HIGH-RISK TASK

## 60. REGRESSION

## 61. PROMPT COMPRESSION

Only after behavior preserved.

## 62. DEDUP

## 63. NORMALIZE TERMINOLOGY

## 64. RULE GROUPING

## 65. ORDER

Logical organization.

## 66. IMPORTANT RULE

Highlight sparingly.

## 67. TOO MANY PRIORITIES

If everything is critical, nothing is.

## 68. SELF-REFERENCE

Avoid confusing meta instructions.

## 69. ROLE BLOAT

Long persona often low value.

## 70. "EXPERT" LANGUAGE

May not materially improve result.

## 71. CHAIN-OF-THOUGHT REQUEST

Do not depend on hidden reasoning disclosure.

Define observable output/verification instead.

## 72. SELF-CRITIQUE

Can help but requires evaluation.

## 73. SECOND PASS

Explicit verification can improve tasks if tested.

## 74. STRUCTURED CHECKLIST

Useful when coverage matters.

## 75. PROMPT INJECTION

Prompt text alone cannot solve.

## 76. AUTHORIZATION

Keep outside.

## 77. FALSE POSITIVE RULES

Do not report as a problem:

- long prompt
- short prompt
- repeated instruction
- XML
- Markdown
- role text
- examples

without a measured downside.

## 78. EVIDENCE TIERS

```text
A - controlled eval shows measurable effect
B - repeated production evidence
C - strong structural reasoning
D - hypothesis to test
E - style/preference
```

## 79. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 80. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Instruction:
Purpose:
Current wording:
Observed effect:
Problem:
Eval evidence:
Recommended change:
Expected effect:
Regression risk:
A/B result:
```

## 81. OPTIMIZATION TABLE

| Rule | Keep | Rewrite | Remove | Evidence |
|---|---|---|---|---|

## 82. EXPERIMENT MATRIX

| Variant | Model | Runs | Quality | Compliance | Tokens |
|---|---|---:|---:|---:|---:|

## 83. REWRITE PHASE

Only after the analysis, build the optimized prompt.

## 84. PRESERVE SEMANTICS

Do not silently delete behavior.

## 85. CHANGE ANNOTATION

Map old rule -> new rule.

## 86. BEFORE/AFTER

## 87. TOKEN DELTA

## 88. EVAL DELTA

## 89. CRITICAL REGRESSION

Any critical regression blocks optimization.

## 90. SECOND PASS

Test optimized prompt against:

- normal task
- ambiguous task
- adversarial user
- long context
- tool task
- no-evidence case
- conflicting instruction
- fallback model
- different language

## 91. FINAL QUALITY GATE

Confirm:

- objectives retained
- contradictions resolved
- dynamic facts removed
- secrets absent
- tool behavior preserved
- output schema preserved
- injection not treated as solved
- token cost measured
- eval improvement or parity proven
- regression cases pass

## 92. OUTPUT

`SYSTEM_PROMPT_OPTIMIZATION.md`

## 93. FAILURE CHAINS

```text
system prompt contains 40 style rules
↓
critical tool rule buried among them
↓
long user context added
↓
model formats response perfectly
↓
but skips required authorization confirmation
```

```text
optimization removes "if source is missing, say unknown"
↓
token count improves
↓
happy-path eval still passes
↓
unanswerable test was absent
↓
production unsupported-claim rate rises
```

# FINAL RULE

The best system prompt is not:

```text
the longest
the shortest
the strictest
```

but the one whose behavior you can measure and that achieves the best result with the least necessary complexity, without critical regressions.
