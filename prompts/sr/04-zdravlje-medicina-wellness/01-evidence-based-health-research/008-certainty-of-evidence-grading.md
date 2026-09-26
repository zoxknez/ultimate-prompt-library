---
id: UPL-HEALTH-008
number: 8
slug: certainty-of-evidence-grading
title: Procena sigurnosti dokaza
category: Zdravlje, medicina i wellness
category_id: UPL-HEALTH
subcategory: Medicina zasnovana na dokazima i klinička istraživanja
subcategory_id: evidence-based-health-research
language: sr
version: 1.0.0
status: stable
---

# PROCENA SIGURNOSTI DOKAZA

Glavni cilj:

> Sprovedite rigorozan, transparentan i reproduktivan evidence-based workflow za "Procena sigurnosti dokaza", uz jasnu procenu kvaliteta dokaza, direktnosti, neizvesnosti i praktične primenjivosti.

Ovaj prompt služi zdravstvenom istraživanju i edukaciji, ne individualnoj dijagnozi ili propisivanju terapije. Kod simptoma opasnih po život, naglog pogoršanja ili mogućeg hitnog stanja prioritet je hitna medicinska procena, ne nastavak analize.

## 1. KONTEKST I PITANJE

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

## 2. SPECIJALIZOVANI TOK

- grade certainty by outcome rather than by study label
- assess risk of bias, inconsistency, indirectness, imprecision and publication bias
- consider upgrade domains only where methodologically justified
- separate certainty in effect estimate from recommendation strength
- document reasons for every downgrade or upgrade
- present certainty in plain language without false precision

## 3. HIJERARHIJA DOKAZA

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

## 4. PROCENA SIGURNOSTI DOKAZA

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

## 5. SAFETY I FALSE-CERTAINTY GATE

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

## 6. OBAVEZNE MATRICE

### Evidence Matrix
| Source | Design | Population | Intervention / exposure | Outcome | Effect | Bias | Directness | Certainty |
|---|---|---|---|---|---|---|---|---|

### Benefit-Harm Matrix
| Outcome | Benefit / harm | Absolute effect | Time horizon | Certainty | Patient importance |
|---|---|---:|---|---|---|

### Evidence Gap Register
| Question | Missing evidence | Why it matters | Best next source / study | Decision impact |
|---|---|---|---|---|

## 7. FORMAT NALAZA

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

## 8. OBAVEZNI OUTPUT

1. Izvršni evidence sažetak.
2. Precizno pitanje i scope.
3. Strategiju pretrage i datum preseka.
4. Hijerarhiju i procenu dokaza.
5. Obavezne matrice.
6. Koristi, štete i apsolutne efekte gde su dostupni.
7. Kontradiktorne nalaze i neizvesnost.
8. Primjenjivost na ciljnu populaciju.
9. Rupe u dokazima.
10. Jasan zaključak sa kalibrisanom sigurnošću.

End with **Provera integriteta medicinskih dokaza** confirming that each material health claim is tied to an appropriate source, effect size or explicit uncertainty.

Ovaj prompt ne zamenjuje pregled, dijagnozu ili lečenje od strane kvalifikovanog zdravstvenog radnika.
