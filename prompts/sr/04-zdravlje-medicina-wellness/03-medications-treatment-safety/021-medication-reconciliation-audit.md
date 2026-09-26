---
id: UPL-HEALTH-021
number: 21
slug: medication-reconciliation-audit
title: Audit usklađivanja terapije
category: Zdravlje, medicina i wellness
category_id: UPL-HEALTH
subcategory: Lekovi i bezbednost terapije
subcategory_id: medications-treatment-safety
language: sr
version: 1.0.0
status: stable
---

# AUDIT USKLAĐIVANJA TERAPIJE

Glavni cilj:

> Sprovedite bezbednosno orijentisan i evidence-based workflow za "Audit usklađivanja terapije", uz proveru indikacije, stvarne upotrebe, interakcija, neželjenih dejstava, monitoringa i eskalacije ka propisivaču ili farmaceutu.

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

## 3. SPECIJALIZOVANI TOK

- capture generic/brand, dose, route, frequency, indication and prescriber
- identify duplicates, omissions and discrepancies
- separate intended regimen from actual use
- flag high-risk transitions of care
- record allergies vs adverse effects distinctly
- produce questions for pharmacist/prescriber

## 4. EVIDENCE I INTERACTION DISCIPLINE

Prefer current regulator labeling, formularies, professional drug references and high-quality guidelines. Distinguish:
- established contraindication
- major clinically relevant interaction
- monitoring interaction
- theoretical / low-evidence signal
- class warning
- product-specific warning
- patient-specific factor that may alter risk

Never convert an interaction-database flag into a clinical conclusion without context.

## 5. BENEFIT-HARM I MONITORING

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

## 6. OBAVEZNE MATRICE

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

## 8. OBAVEZNI OUTPUT

1. Verifikovan spisak terapije.
2. Glavne safety nalaze.
3. Interakcije i duplikacije sa kontekstom.
4. Benefit-harm pregled.
5. Monitoring plan.
6. Pitanja za lekara/farmaceuta.
7. Hitne warning signs.
8. Jasno navedene neizvesnosti.

End with **Provera bezbednosti terapije** confirming that no unsupported medication change was advised and all high-risk findings have a clear clinician/pharmacist escalation path.

Ovaj prompt ne zamenjuje propisivača, farmaceuta ili individualni medicinski savet.
