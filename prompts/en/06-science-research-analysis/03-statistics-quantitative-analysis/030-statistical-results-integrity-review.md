---
id: UPL-SCI-030
number: 30
slug: statistical-results-integrity-review
title: Statistical Results Integrity Review
category: Science, Research & Analysis
category_id: UPL-SCI
subcategory: Statistics & Quantitative Analysis
subcategory_id: statistics-quantitative-analysis
language: en
version: 1.0.0
status: stable
---

# STATISTICAL RESULTS INTEGRITY REVIEW

Main objective:

> Perform a rigorous, reproducible workflow for Statistical Results Integrity Review, clearly separating data, assumptions, model, results, interpretation and inference limits.

## 1. CONTEXT

Define research question, target population/system, unit of analysis, data/source universe, date range, claim type, decision stakes, inclusion/exclusion rules and intended audience.

## 2. DOMAIN DISCIPLINE

Treat statistical analysis as estimation under assumptions. Prefer effect sizes and uncertainty intervals over threshold-only reasoning. Match model structure to the data-generating process and estimand.

## 3. SPECIALIZED FOCUS

For **Statistical Results Integrity Review**:
- define the exact methodological decision being made
- identify the strongest alternative method or interpretation
- document assumptions before inspecting favorable results
- distinguish confirmatory from exploratory choices
- quantify uncertainty where the method permits
- state what evidence would reverse or materially weaken the conclusion

## 4. INTEGRITY CHECKS

- estimand is explicit
- descriptive and inferential statistics are separated
- effect size and uncertainty are reported
- assumptions are checked
- model diagnostics are inspected
- multiplicity is handled
- missing-data handling is justified
- sensitivity analyses test consequential choices

## 5. EVIDENCE / ANALYSIS CARD

```text
Question:
Data/source:
Design/method:
Population/sample:
Primary estimate/result:
Uncertainty:
Assumptions:
Bias/threat:
Alternative explanation:
Robustness check:
Generalizability:
Claim supported:
Claim not supported:
```

## 6. REQUIRED MATRICES

### Statistical Analysis Matrix
| Estimand | Model/test | Assumptions | Estimate | Uncertainty | Diagnostic | Robustness |
|---|---|---|---|---|---|---|

### Decision Sensitivity Matrix
| Choice | Base analysis | Alternative | Result change | Interpretation impact |
|---|---|---|---|---|

## 7. ANTI-OVERCLAIM RULES

Do not:
- convert association into causation without identification
- treat p < threshold as practical importance
- hide null or adverse findings
- change outcome, sample or model silently after seeing results
- generalize outside the observed population without argument
- interpret absence of significance as proof of no effect
- confuse model fit with truth
- report more precision than the data support

## 8. REQUIRED OUTPUT

1. Question and scope.
2. Method/design rationale.
3. Data/source description.
4. Assumptions and bias threats.
5. Main results with uncertainty.
6. Required matrices.
7. Robustness / sensitivity analysis.
8. Alternative explanations.
9. Inference boundaries.
10. Reproducibility notes.

End with **Research Integrity Check** confirming that the final claim matches the method, evidence and uncertainty.

This supports scientific analysis and does not replace domain-specific ethical, regulatory or specialist procedures.
