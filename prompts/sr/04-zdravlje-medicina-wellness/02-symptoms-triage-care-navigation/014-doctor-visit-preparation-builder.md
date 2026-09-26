---
id: UPL-HEALTH-014
number: 14
slug: doctor-visit-preparation-builder
title: Priprema za pregled kod lekara
category: Zdravlje, medicina i wellness
category_id: UPL-HEALTH
subcategory: Simptomi, trijaža i usmeravanje kroz zdravstveni sistem
subcategory_id: symptoms-triage-care-navigation
language: sr
version: 1.0.0
status: stable
---

# PRIPREMA ZA PREGLED KOD LEKARA

Glavni cilj:

> Bezbedno strukturirajte temu "Priprema za pregled kod lekara" kao proces procene hitnosti, rizika i usmeravanja ka odgovarajućoj nezi, bez daljinske dijagnoze i bez lažne sigurnosti.

## 1. HITNI SAFETY GATE

Before analysis, screen for immediately dangerous patterns such as:
- severe difficulty breathing or blue/grey coloration
- chest pressure/pain with concerning associated symptoms
- new severe neurologic deficit, seizure, unresponsiveness or sudden confusion
- uncontrolled major bleeding
- severe allergic reaction
- signs of shock or rapidly worsening severe illness
- severe injury, poisoning or overdose
- pregnancy-related emergency warning signs
- suicidal intent, imminent self-harm or immediate danger to others

If a plausible emergency is present, prioritize local emergency services / urgent professional assessment. Do not continue with reassurance or a remote diagnostic conclusion.

## 2. KONTEKST SIMPTOMA

Capture:
```text
Main symptom:
Onset:
Duration:
Trajectory:
Severity / functional impact:
Associated symptoms:
Triggers / relieving factors:
Recent illness / injury / procedure:
Relevant conditions:
Medicines / substances:
Pregnancy / age-specific context:
Measurements if reliable:
What has already been tried:
Main concern / decision:
```

## 3. SPECIJALIZOVANI TOK

- summarize chief concern and goal
- build symptom timeline
- list medicines, allergies and relevant history
- identify questions about tests, diagnosis, treatment and follow-up
- separate facts from interpretations
- prepare documents and measurements worth bringing

## 4. TRIAGE, NE DIJAGNOZA

Use categories:
- EMERGENCY NOW
- URGENT / SAME-DAY ASSESSMENT
- PROMPT CLINICAL REVIEW
- ROUTINE REVIEW / SELF-CARE WITH SAFETY NET
- INSUFFICIENT INFORMATION

Never state that a serious condition is ruled out solely from text chat. Never advise delaying urgent care merely because one common red flag is absent.

## 5. SAFETY NET

Every non-emergency output must state:
- what change should trigger escalation
- how quickly to seek care
- what to monitor
- what information to bring
- what cannot be safely determined remotely

## 6. DIFERENCIJALNI OKVIR

If discussing possibilities:
- group by common / important / time-sensitive categories
- explain what features support or weaken each possibility
- do not assign invented probabilities
- do not present a differential as a diagnosis
- emphasize tests or examination needed to distinguish them

## 7. OBAVEZNE MATRICE

### Triage Matrix
| Finding | Why it matters | Urgency impact | Evidence / source | Action |
|---|---|---|---|---|

### Timeline Matrix
| Time | Symptom / event | Severity | Intervention | Response | Confidence |
|---|---|---:|---|---|---|

### Safety-Net Matrix
| Trigger | Meaning | Action | Timeframe |
|---|---|---|---|

## 8. OBAVEZNI OUTPUT

1. Sažetak simptoma bez dijagnoze.
2. Hitni safety gate.
3. Procenu nivoa i vremenskog okvira nege.
4. Ključne činjenice koje menjaju rizik.
5. Moguće kategorije uzroka sa jasnom neizvesnošću.
6. Šta se ne može utvrditi bez pregleda/testa.
7. Safety-net instrukcije.
8. Pripremu za sledeći kontakt sa zdravstvenim radnikom.

End with **Provera bezbednosti trijaže** confirming that emergency signs were screened first, no remote diagnosis was asserted, and escalation instructions are explicit.

Ovaj prompt ne zamenjuje hitnu službu, pregled ili dijagnozu kvalifikovanog zdravstvenog radnika.
