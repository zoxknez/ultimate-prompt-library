---
id: UPL-HEALTH-037
number: 37
slug: false-positive-false-negative-analyzer
title: False Positive & False Negative Analyzer
category: Health, Medicine & Wellness
category_id: UPL-HEALTH
subcategory: Diagnostics, Labs & Medical Tests
subcategory_id: diagnostics-labs-medical-tests
language: en
version: 1.0.0
status: stable
---

# FALSE POSITIVE & FALSE NEGATIVE ANALYZER

Main objective:

> Analyze false-positive and false-negative pathways and their clinical consequences.

## 1. CONTEXT & LIMITS

- define the exact question and decision
- record age / population, relevant conditions and medications
- identify source date, units, method and reference standard where applicable
- separate screening, diagnosis, monitoring and prognosis
- state what cannot be concluded from the available information
- escalate urgent or dangerous patterns before routine interpretation

## 2. SPECIALIZED WORKFLOW

- define threshold and target condition
- use prevalence context
- identify confirmatory testing
- map downstream harms
- consider sensitivity-specificity tradeoff
- state residual uncertainty after testing

## 3. EVIDENCE STANDARD

Use current high-quality guidelines, systematic reviews, authoritative laboratory / professional standards and primary evidence appropriate to the question. Always distinguish population evidence from an individualized clinical conclusion.

## 4. DOMAIN MODEL

Distinguish analytical validity, clinical validity and clinical utility. Interpret every test against pretest context, method, threshold and reference standard.

## 5. SAFETY / RED-FLAG TEST

- critical values or rapidly worsening symptoms require urgent professional review
- a normal test does not always exclude serious disease
- an abnormal result is not automatically a diagnosis
- unit, method and reference-range mismatches can invalidate interpretation

## 6. REQUIRED MATRICES

### Test Context Matrix
| Test | Value/result | Units | Reference/threshold | Method | Pretest context | Limitation |
|---|---|---|---|---|---|---|

### Diagnostic Consequence Matrix
| Result | Possible meaning | False-positive risk | False-negative risk | Confirmation | Action |
|---|---|---|---|---|---|

## 7. FINDING FORMAT

```text
Issue:
Context:
Best evidence:
Observed value / fact:
Expected / comparator:
Clinical relevance:
Main limitation:
Possible alternative explanation:
Safety concern:
Need for confirmation:
Next professional step:
Confidence:
```

## 8. REQUIRED OUTPUT

1. Executive summary.
2. Context and assumptions.
3. Evidence-based analysis.
4. Key findings and limitations.
5. Required matrices.
6. Safety / escalation points.
7. What requires clinical confirmation.
8. Calibrated conclusion without false certainty.

End with **Medical Integrity Check** confirming that evidence, units, context, uncertainty and safety boundaries are explicit.

This does not replace clinician interpretation of diagnostic tests.
