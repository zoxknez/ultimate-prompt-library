---
id: UPL-HEALTH-026
number: 26
slug: polypharmacy-risk-audit
title: Polypharmacy Risk Audit
category: Health, Medicine & Wellness
category_id: UPL-HEALTH
subcategory: Medications & Treatment Safety
subcategory_id: medications-treatment-safety
language: en
version: 1.0.0
status: stable
---

# POLYPHARMACY RISK AUDIT

Main objective:

> Audit polypharmacy risk with attention to indication, duplication, interactions, anticholinergic/sedative burden and monitoring.

## 1. MEDICATION SAFETY GATE

Do not independently start, stop, taper, increase, decrease or substitute prescription medication. For suspected overdose, severe allergic reaction, severe bleeding, loss of consciousness, seizure, severe breathing difficulty or other serious reaction, prioritize urgent medical help.

## 2. MEDICATION RECORD

```text
Medicine / product:
Generic name:
Strength:
Dose:
Route:
Frequency:
PRN?:
Indication:
Prescriber:
Start / change date:
Actual use:
Allergy / adverse-effect history:
Monitoring:
Source verified:
```

Include prescription medicines, OTC products, vitamins, supplements, herbal products and relevant substances.

## 3. SPECIALIZED WORKFLOW

- verify indication for every medication
- identify duplicates and cascades
- flag high-risk combinations
- consider renal/hepatic function and age/frailty
- identify medicines without current benefit evidence
- prepare deprescribing questions, not unilateral changes

## 4. EVIDENCE & INTERACTION DISCIPLINE

Prefer current regulator labeling, formularies, professional drug references and high-quality guidelines. Distinguish:
- established contraindication
- major clinically relevant interaction
- monitoring interaction
- theoretical / low-evidence signal
- class warning
- product-specific warning
- patient-specific factor that may alter risk

Never convert an interaction-database flag into a clinical conclusion without context.

## 5. BENEFIT-HARM & MONITORING

For each treatment:
```text
Indication:
Expected benefit:
Time to benefit:
Common adverse effects:
Serious but less common harms:
Contraindications / precautions:
Interaction risks:
Required monitoring:
What symptom needs urgent review:
What needs routine review:
Evidence source:
```

## 6. REQUIRED MATRICES

### Medication Matrix
| Product | Indication | Actual use | Benefit | Harm | Interaction | Monitoring | Issue |
|---|---|---|---|---|---|---|---|

### Discrepancy Matrix
| Source | Medication instruction | Conflict | Risk | Verification owner |
|---|---|---|---|---|

### Monitoring Matrix
| Parameter | Baseline | Target / expected | Frequency | Escalation trigger | Reviewer |
|---|---|---|---|---|---|

## 7. FINDING FORMAT

```text
Issue:
Severity:
Medication(s):
Evidence:
Mechanism / rationale:
Patient-specific modifier:
Potential consequence:
Urgent?:
Recommended verification:
Who should review:
Do not-change warning:
```

## 8. REQUIRED OUTPUT

1. Verified medication list.
2. Key safety findings.
3. Interactions and duplications with context.
4. Benefit-harm review.
5. Monitoring plan.
6. Questions for prescriber/pharmacist.
7. Urgent warning signs.
8. Explicit uncertainties.

End with **Medication Safety Check** confirming that no unsupported medication change was advised and all high-risk findings have a clear clinician/pharmacist escalation path.

This prompt does not replace a prescriber, pharmacist or individualized medical advice.
