---
id: UPL-IT-063
number: 63
slug: hallucination-and-grounding-audit
title: Hallucination & Grounding Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: AI, LLM & Automation
subcategory_id: ai-llm-automation
language: en
version: 1.0.0
status: stable
---

# HALLUCINATION AND GROUNDING AUDIT

I want a deep, systematic analysis of the factual reliability of the AI system.

Main objective:

> Measure where and why the system produces unsupported, fabricated, stale, contradictory or overconfident claims, and determine whether the architecture, retrieval, tools, prompts and UI correctly limit the answer to the available evidence.

This is not:

- counting every incorrect sentence as the same type of problem
- a subjective "looks correct"
- an assumption that a citation solves the problem
- an assumption that the model's verbal confidence means actual confidence
- penalizing a creative task because it is not factual
- expecting the model to know current facts without a source

## 1. TASK CLASSIFICATION

For each AI task:

- factual
- analytical
- generative
- transformative
- summarization
- extraction
- classification
- recommendation
- tool decision

The hallucination standard depends on the task.

## 2. CLAIM UNIT

Break the output into claims.

## 3. CLAIM TYPE

- directly supported
- inferred
- external fact
- temporal fact
- quantitative
- citation
- attribution
- prediction
- recommendation premise

## 4. SOURCE AVAILABILITY

Does the system have a source at all?

## 5. SOURCE AUTHORITY

## 6. SOURCE FRESHNESS

## 7. ENTAILMENT

Does the source actually support the claim?

## 8. PARTIAL SUPPORT

## 9. CONTRADICTION

## 10. FABRICATION

## 11. FABRICATED CITATION

## 12. REAL CITATION, WRONG CLAIM

## 13. STALE FACT

## 14. NUMERIC ERROR

## 15. ENTITY CONFUSION

## 16. NAME/ID CONFUSION

## 17. TEMPORAL CONFUSION

## 18. CAUSAL OVERREACH

Correlation -> causation.

## 19. GENERALIZATION

One source -> universal claim.

## 20. OMISSION

Missing qualification can make otherwise true statement misleading.

## 21. SUMMARY DISTORTION

## 22. EXTRACTION ERROR

Should be evaluated differently from open-generation hallucination.

## 23. UNANSWERABLE QUESTION

Mandatory test class.

## 24. MODEL SHOULD SAY UNKNOWN

## 25. INFERENCE LABELING

If inferred, label appropriately.

## 26. UNCERTAINTY

## 27. FALSE CERTAINTY

## 28. CITATION COVERAGE

## 29. CLAIM-CITATION ALIGNMENT

## 30. QUANTITATIVE CHECK

Arithmetic may require calculator/tool.

## 31. DATE CHECK

Current info requires current source.

## 32. TOOL GROUNDING

Database/API result.

## 33. TOOL OUTPUT MISREAD

## 34. TOOL ERROR AS FACT

Tool returns failure message, model interprets as business fact.

## 35. RETRIEVAL MISS

## 36. RETRIEVAL WRONG

## 37. MODEL OVERRIDES SOURCE

Source says X, model "knows" Y.

## 38. CONFLICTING SOURCES

## 39. KNOWLEDGE PRIOR

Model priors can override context.

## 40. PROMPT INSTRUCTION

Explicit grounding rules.

## 41. "ONLY USE SOURCES"

Test whether actually obeyed.

## 42. SOURCE BOUNDARY

Untrusted source can contain instructions.

## 43. CONTEXT LENGTH

## 44. TRUNCATION

## 45. MULTI-HOP

## 46. NEGATION

## 47. TABLES

## 48. NUMERIC TABLE

## 49. OCR

## 50. MULTI-LANGUAGE

## 51. TRANSLATION

Can introduce unsupported detail.

## 52. SUMMARIZATION

Check source fidelity.

## 53. COMPRESSION

High compression ratio increases omission risk.

## 54. MODEL REFUSAL

Over-refusal is separate quality issue.

## 55. ABSTENTION

Measure appropriate abstention.

## 56. ABSTENTION PRECISION

Does it abstain when answer is available?

## 57. ABSTENTION RECALL

Does it answer when no support exists?

## 58. GROUNDING METRICS

Potential metrics:

- claim support rate
- unsupported claim rate
- contradiction rate
- citation precision
- citation completeness
- abstention accuracy

Do not blindly use metric if not aligned with task.

## 59. CRITICAL CLAIM WEIGHTING

One false medical dosage claim matters more than five minor wording issues.

## 60. SEGMENTATION

By:

- task
- language
- input size
- model
- retrieval path
- source freshness
- user cohort

## 61. REPEATED RUNS

Non-determinism.

## 62. MODEL CHANGE

Regression.

## 63. PROMPT CHANGE

## 64. RAG CHANGE

## 65. TOOL CHANGE

## 66. JUDGE MODEL

Use carefully.

## 67. HUMAN REVIEW

For gold labels.

## 68. INTER-RATER

## 69. EVAL SET BALANCE

Include:

- answerable
- unanswerable
- ambiguous
- conflicting
- stale
- adversarial
- long-context
- numeric

## 70. PRODUCTION SAMPLING

Privacy-aware.

## 71. FEEDBACK

User thumbs-up is not truth label.

## 72. CORRECTION SIGNAL

User edits can be useful.

## 73. SUPPORT ESCALATION

## 74. CLAIM EXTRACTION

Automated claim extraction itself can fail.

## 75. HIGH-STAKES

More conservative threshold.

## 76. UI

Does UI visually distinguish sourced/unsourced content?

## 77. CITATION INTERACTION

Can user inspect source?

## 78. SOURCE SNIPPET

Avoid misleading context.

## 79. CURRENTNESS LABEL

## 80. FALSE POSITIVE RULES

Do not call it a hallucination:

- legitimate inference clearly labeled
- creative content
- recommendation framed as opinion
- paraphrase that preserves meaning
- answer based on authoritative tool even without web citation
- format variation

## 81. EVIDENCE TIERS

```text
A - manually/reliably verified claim-level failure
B - deterministic source/claim contradiction
C - strong evaluation evidence
D - suspected unsupported output
E - hardening suggestion
```

## 82. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 83. SEVERITY

P0:
- catastrophic false output automatically drives critical real-world action at scale

P1:
- repeatable materially harmful false claim in high-impact flow
- systematic fabricated source/citation relied on operationally

P2:
- significant unsupported answer rate in important workflow

P3:
- limited/low-impact grounding weakness

P4:
- measurement or UX hardening

## 84. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Task:
Prompt/model:
Input:
Claim:
Claim type:
Expected source:
Actual support:
Failure class:
Confidence/wording:
Impact:
Evidence:
Root cause:
Remediation:
Eval case:
Regression threshold:
```

## 85. CLAIM MATRIX

| Claim | Type | Source | Supported | Fresh | Severity |
|---|---|---|---|---|---|

## 86. EVAL MATRIX

| Scenario | Model | Runs | Unsupported rate | Abstention |
|---|---|---:|---:|---:|

## 87. SECOND PASS

Test:

- answer absent
- answer partially present
- sources conflict
- source is old
- numeric question
- trick negation
- exact quote
- source has typo
- source contains adversarial instruction
- very long context
- same prompt repeated 10 times
- weaker fallback model
- different language

## 88. FINAL QUALITY GATE

Confirm:

- task classification
- claim decomposition
- authority
- freshness
- entailment
- citation
- abstention
- uncertainty
- retrieval vs generation error
- numeric/tool grounding
- eval coverage
- segmentation
- production monitoring

## 89. OUTPUT

`HALLUCINATION_GROUNDING_AUDIT.md`

## 90. FAILURE CHAINS

```text
source:
"plan limit is 100 GB"
↓
model answers:
"plan includes unlimited storage"
↓
citation points to same plan page
↓
citation is real but does not support claim
↓
citation presence creates false trust
```

```text
question:
"What is today's exchange rate?"
↓
no current data tool is called
↓
model answers from training prior
↓
response is fluent and precise
↓
stale temporal fact presented as current
```

# FINAL RULE

Do not measure "hallucination" as one magic metric.

Separate:

```text
retrieval
claim support
freshness
citation
inference
abstention
```

and show exactly where the system loses factual reliability.
