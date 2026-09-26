---
id: UPL-SCI-023
number: 23
slug: confidence-interval-uncertainty-audit
title: Audit intervala pouzdanosti i neizvesnosti
category: Nauka, istraživanje i analiza
category_id: UPL-SCI
subcategory: Statistika i kvantitativna analiza
subcategory_id: statistics-quantitative-analysis
language: sr
version: 1.0.0
status: stable
---

# AUDIT INTERVALA POUZDANOSTI I NEIZVESNOSTI

Glavni cilj:

> Sprovedite rigorozan i reproduktivan workflow za "Audit intervala pouzdanosti i neizvesnosti", uz jasnu razliku između podataka, pretpostavki, modela, rezultata, interpretacije i granica zaključivanja.

## 1. KONTEKST

Define research question, target population/system, unit of analysis, data/source universe, date range, claim type, decision stakes, inclusion/exclusion rules and intended audience.

## 2. DOMAIN DISCIPLINA

Treat statistical analysis as estimation under assumptions. Prefer effect sizes and uncertainty intervals over threshold-only reasoning. Match model structure to the data-generating process and estimand.

## 3. SPECIJALIZOVANI FOKUS

For **Audit intervala pouzdanosti i neizvesnosti**:
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

## 6. OBAVEZNE MATRICE

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

## 8. OBAVEZNI OUTPUT

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

End with **Provera integriteta istraživanja** confirming that the final claim matches the method, evidence and uncertainty.

Ovaj prompt podržava naučnu analizu i ne zamenjuje domen-specifične etičke, regulatorne ili stručne procedure.
