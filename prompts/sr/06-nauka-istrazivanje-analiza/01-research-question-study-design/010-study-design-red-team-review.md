---
id: UPL-SCI-010
number: 10
slug: study-design-red-team-review
title: Red-team pregled dizajna studije
category: Nauka, istraživanje i analiza
category_id: UPL-SCI
subcategory: Istraživačka pitanja i dizajn studije
subcategory_id: research-question-study-design
language: sr
version: 1.0.0
status: stable
---

# RED-TEAM PREGLED DIZAJNA STUDIJE

Glavni cilj:

> Sprovedite rigorozan workflow za "Red-team pregled dizajna studije" koji povezuje pitanje, tvrdnju, dizajn, merenje, uzorak, analizu i granice zaključivanja.

## 1. ISTRAŽIVAČKI KONTEKST

Establish domain, research aim, unit of analysis, target population/system, time horizon, data availability, ethical constraints, resources, decision stakes and intended claim type.

## 2. SPECIJALIZOVANI TOK

- attack identification, measurement, sampling, analysis and interpretation
- construct strongest alternative explanation
- identify hidden researcher degrees of freedom
- test robustness requirements
- surface assumptions that could reverse conclusion
- produce redesign priorities

## 3. CLAIM-DESIGN GATE

Every major claim must map to a design capable of supporting it. Distinguish:
- description
- association
- prediction
- intervention effect
- causal effect
- mechanism
- generalization

Do not let wording outrun identification.

## 4. PRE-SPECIFICATION

Capture:
```text
Primary question:
Primary outcome / estimand:
Key exposure/intervention:
Comparator:
Population:
Sampling:
Design:
Primary analysis:
Exclusions:
Missing-data strategy:
Sensitivity analyses:
Confirmatory vs exploratory:
Deviation log:
```

## 5. BIAS I VALIDITY

Audit selection bias, measurement error, confounding, attrition, missingness, researcher degrees of freedom, temporal ambiguity, multiplicity and external-validity limits.

## 6. REPORTING STANDARDS

Use design-appropriate reporting guidance. For example, CONSORT 2025 applies to randomized trial reporting, STROBE to major observational designs, and PRISMA 2020 to systematic reviews. Reporting checklists improve transparency but are not themselves proof of methodological quality.

## 7. OBAVEZNE MATRICE

### Question-Design Matrix
| Claim | Design | Required data | Main bias | Identifiable? | Limitation |
|---|---|---|---|---|---|

### Variable Matrix
| Construct | Operational measure | Role | Timing | Validity | Error risk |
|---|---|---|---|---|---|

### Assumption Register
| Assumption | Why needed | Evidence | Failure consequence | Test / sensitivity |
|---|---|---|---|---|

## 8. OBAVEZNI OUTPUT

1. Research question and claim type.
2. Design choice and alternatives.
3. Variable / measurement plan.
4. Sampling plan.
5. Bias and validity map.
6. Analysis / preregistration outline.
7. Sensitivity requirements.
8. Inference boundaries.

End with **Provera integriteta dizajna** confirming that the proposed claim does not exceed what the design and data can support.

Ovaj prompt podržava istraživačko planiranje i ne zamenjuje etički review, stručnu metodološku konsultaciju ili domen-specifične standarde gde su obavezni.
