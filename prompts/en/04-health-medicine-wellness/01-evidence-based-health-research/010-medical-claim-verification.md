---
id: UPL-HEALTH-010
number: 10
slug: medical-claim-verification
title: Medical Claim Verification
category: Health, Medicine & Wellness
category_id: UPL-HEALTH
subcategory: Evidence-Based Health & Clinical Research
subcategory_id: evidence-based-health-research
language: en
version: 1.0.0
status: stable
---

# MEDICAL CLAIM VERIFICATION

Main objective:

> Perform a rigorous, transparent and reproducible evidence-based workflow for Medical Claim Verification, with explicit assessment of evidence quality, directness, uncertainty and practical applicability.

This prompt supports health research and education, not individualized diagnosis or prescribing. For life-threatening symptoms, rapid deterioration or a possible emergency, urgent medical evaluation takes priority over continued analysis.

## 1. CONTEXT & QUESTION

Establish:
- exact health / clinical question and decision
- target population and setting
- intervention / exposure / diagnostic strategy
- comparator
- patient-important outcomes
- time horizon
- relevant comorbidities / exclusions
- jurisdiction or health-system context
- publication cutoff / search date
- whether this is individual, clinical, public-health or policy evidence

## 2. SPECIALIZED WORKFLOW

- trace each medical claim to its strongest available source
- classify whether claim concerns causation, association, diagnosis, treatment or prognosis
- verify population, dose/exposure, comparator and outcome match
- check whether headlines overstate relative effects or surrogate outcomes
- identify contradiction by major guidelines or systematic reviews
- rewrite claim with calibrated certainty and safety context

## 3. EVIDENCE HIERARCHY

Prioritize evidence appropriate to the question:
- current high-quality clinical / public-health guidelines
- systematic reviews and meta-analyses with transparent methods
- randomized trials for intervention effects where feasible
- prospective / retrospective observational studies where appropriate
- diagnostic-accuracy, prognostic or qualitative studies for their matching questions
- pharmacovigilance / surveillance data for rare harms
- authoritative public-health and regulator sources
- individual expert opinion only as clearly labeled low-level support

Never rank a study solely by design label. Assess actual risk of bias and relevance.

## 4. CERTAINTY ASSESSMENT

For every material outcome record:
```text
Outcome:
Population:
Comparison:
Effect measure:
Absolute effect:
Relative effect:
Follow-up:
Study designs:
Risk of bias:
Inconsistency:
Indirectness:
Imprecision:
Publication bias:
Other considerations:
Certainty:
Clinical importance:
Applicability:
```

Use calibrated labels such as HIGH / MODERATE / LOW / VERY LOW only when the chosen framework supports them, and explain why.

## 5. SAFETY & FALSE-CERTAINTY GATE

Do not:
- convert association into causation
- treat statistical significance as clinical importance
- hide absolute risk behind relative risk
- generalize from surrogate outcomes without justification
- extrapolate from animals, cells or small uncontrolled studies to clinical benefit
- treat preprints as settled evidence
- ignore harms, contraindications or uncertainty
- assume a guideline applies unchanged across populations or health systems
- use absence of evidence as evidence of absence
- create individualized diagnosis, medication changes or emergency reassurance from literature alone

## 6. REQUIRED MATRICES

### Evidence Matrix
| Source | Design | Population | Intervention / exposure | Outcome | Effect | Bias | Directness | Certainty |
|---|---|---|---|---|---|---|---|---|

### Benefit-Harm Matrix
| Outcome | Benefit / harm | Absolute effect | Time horizon | Certainty | Patient importance |
|---|---|---:|---|---|---|

### Evidence Gap Register
| Question | Missing evidence | Why it matters | Best next source / study | Decision impact |
|---|---|---|---|---|

## 7. FINDING FORMAT

```text
Claim / question:
Evidence status:
Best source:
Study / guideline type:
Population match:
Outcome:
Absolute effect:
Relative effect:
Certainty:
Main bias / limitation:
Contrary evidence:
Applicability:
Safety implication:
What would change conclusion:
```

## 8. REQUIRED OUTPUT

1. Executive evidence summary.
2. Precise question and scope.
3. Search strategy and cutoff date.
4. Evidence hierarchy and appraisal.
5. Required matrices.
6. Benefits, harms and absolute effects where available.
7. Contradictory findings and uncertainty.
8. Applicability to target population.
9. Evidence gaps.
10. Calibrated conclusion.

End with **Medical Evidence Integrity Check** confirming that each material health claim is tied to an appropriate source, effect size or explicit uncertainty.

This prompt does not replace examination, diagnosis or treatment by a qualified healthcare professional.
