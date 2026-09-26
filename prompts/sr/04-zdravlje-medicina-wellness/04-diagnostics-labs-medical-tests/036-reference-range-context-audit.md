---
id: UPL-HEALTH-036
number: 36
slug: reference-range-context-audit
title: Audit konteksta referentnih vrednosti
category: Zdravlje, medicina i wellness
category_id: UPL-HEALTH
subcategory: Dijagnostika, laboratorija i medicinski testovi
subcategory_id: diagnostics-labs-medical-tests
language: sr
version: 1.0.0
status: stable
---

# AUDIT KONTEKSTA REFERENTNIH VREDNOSTI

Glavni cilj:

> Auditujte da li je laboratorijska referentna vrednost odgovarajuća i pravilno protumačena.

## 1. KONTEKST I OGRANIČENJA

- define the exact question and decision
- record age / population, relevant conditions and medications
- identify source date, units, method and reference standard where applicable
- separate screening, diagnosis, monitoring and prognosis
- state what cannot be concluded from the available information
- escalate urgent or dangerous patterns before routine interpretation

## 2. SPECIJALIZOVANI TOK

- verify lab-specific interval
- consider age, sex, pregnancy and method
- distinguish reference interval from decision threshold
- consider fasting/time-of-day effects
- identify unit mismatches
- avoid labeling all out-of-range values as disease

## 3. EVIDENCE STANDARD

Use current high-quality guidelines, systematic reviews, authoritative laboratory / professional standards and primary evidence appropriate to the question. Always distinguish population evidence from an individualized clinical conclusion.

## 4. DOMAIN MODEL

Distinguish analytical validity, clinical validity and clinical utility. Interpret every test against pretest context, method, threshold and reference standard.

## 5. SAFETY / RED-FLAG TEST

- critical values or rapidly worsening symptoms require urgent professional review
- a normal test does not always exclude serious disease
- an abnormal result is not automatically a diagnosis
- unit, method and reference-range mismatches can invalidate interpretation

## 6. OBAVEZNE MATRICE

### Test Context Matrix
| Test | Value/result | Units | Reference/threshold | Method | Pretest context | Limitation |
|---|---|---|---|---|---|---|

### Diagnostic Consequence Matrix
| Result | Possible meaning | False-positive risk | False-negative risk | Confirmation | Action |
|---|---|---|---|---|---|

## 7. FORMAT NALAZA

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

## 8. OBAVEZNI OUTPUT

1. Izvršni sažetak.
2. Kontekst i pretpostavke.
3. Evidence-based analizu.
4. Glavne nalaze i ograničenja.
5. Obavezne matrice.
6. Safety / escalation tačke.
7. Šta treba potvrditi pregledom ili dodatnim testom.
8. Kalibrisan zaključak bez lažne sigurnosti.

End with **Provera medicinskog integriteta** confirming that evidence, units, context, uncertainty and safety boundaries are explicit.

Ovo ne zamenjuje tumačenje dijagnostičkih testova od strane zdravstvenog radnika.
