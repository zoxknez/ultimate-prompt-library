---
id: UPL-SCI-037
number: 37
slug: regression-discontinuity-audit
title: Audit regression discontinuity dizajna
category: Nauka, istraživanje i analiza
category_id: UPL-SCI
subcategory: Kauzalna inferencija i eksperimentalno zaključivanje
subcategory_id: causal-inference-experimental-reasoning
language: sr
version: 1.0.0
status: stable
---

# AUDIT REGRESSION DISCONTINUITY DIZAJNA

Glavni cilj:

> Sprovedite rigorozan i reproduktivan workflow za "Audit regression discontinuity dizajna", uz jasnu razliku između podataka, pretpostavki, modela, rezultata, interpretacije i granica zaključivanja.

## 1. KONTEKST

Define research question, target population/system, unit of analysis, data/source universe, date range, claim type, decision stakes, inclusion/exclusion rules and intended audience.

## 2. DOMAIN DISCIPLINA

State the causal estimand and identification assumptions before model fitting. Use causal diagrams where useful to distinguish confounders, mediators, colliders and selection mechanisms.

## 3. SPECIJALIZOVANI FOKUS

For **Audit regression discontinuity dizajna**:
- define the exact methodological decision being made
- identify the strongest alternative method or interpretation
- document assumptions before inspecting favorable results
- distinguish confirmatory from exploratory choices
- quantify uncertainty where the method permits
- state what evidence would reverse or materially weaken the conclusion

## 4. INTEGRITY CHECKS

- temporal order is defensible
- confounders are identified conceptually, not by p-value
- colliders are not adjusted for casually
- treatment/exposure positivity is plausible
- consistency/SUTVA-type assumptions are considered where relevant
- parallel trends or instrument assumptions are tested where design requires
- alternative causal structures are considered
- unmeasured-confounding sensitivity is explicit

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

### Causal Identification Matrix
| Causal claim | Estimand | Identification strategy | Key assumption | Evidence | Threat |
|---|---|---|---|---|---|

### DAG Adjustment Matrix
| Variable | Role | Adjust? | Why | Risk if mishandled |
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
