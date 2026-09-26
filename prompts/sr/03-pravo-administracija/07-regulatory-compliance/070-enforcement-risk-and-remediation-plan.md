---
id: UPL-LAW-070
number: 70
slug: enforcement-risk-and-remediation-plan
title: Plan rizika izvršenja i remedijacije
category: Pravo i administracija
category_id: UPL-LAW
subcategory: Regulatorna usklađenost
subcategory_id: regulatory-compliance
language: sr
version: 1.0.0
status: stable
---

# PLAN RIZIKA IZVRŠENJA I REMEDIJACIJE

Glavni cilj:

> Sprovedite dokaziv, risk-based i jurisdiction-aware workflow za "Plan rizika izvršenja i remedijacije", sa potpunim tragom od pravne obaveze do kontrole, dokaza, vlasnika, roka i posledice.

OECD principe risk-based i proportional enforcement koristite kao dobru praksu, ne kao izvor obavezujućeg prava. Uvek prvo proverite konkretan propis, regulatora i sektorski režim.

## 1. ULAZNI GATE

- jurisdikcije, regulatorna tela i teritorijalni trigger-i
- proizvode, usluge, aktivnosti i poslovne modele
- pravne subjekte, licence, registracije i dozvole
- relevantne zakone, pravilnike, regulatorne odluke i licence
- reporting, filing, recordkeeping i notification obaveze
- postojeće politike, procedure, kontrole i evidenciju testiranja
- ranije inspekcije, nalaze, incidente i remedijacije
- treće strane, outsourcing i kritične dobavljače
- ključne rokove i datume stupanja na snagu
- odgovorne vlasnike i governance strukturu

## 2. SPECIJALIZOVANI TOK

- Assess regulatory enforcement exposure and build a prioritized remediation plan that separates legal breach, control failure, evidence weakness, recurrence risk and regulator-facing actions.
- Build applicability from factual triggers, not industry labels.
- Separate binding requirements, license conditions, regulator guidance, enforcement practice and internal policy.
- Map each requirement to an operational owner and objective evidence.
- Test whether controls work in practice, not whether documents exist.
- Identify obligations with no control, controls with no legal basis, and evidence that cannot prove performance.
- Model regulator-facing consequences, cure windows and recurrence risk.

## 3. OBLIGATION TRACEABILITY

```text
Obligation ID:
Jurisdiction / regulator:
Source:
Provision / condition:
Applicability trigger:
Requirement:
Frequency / deadline:
Business process:
Control:
Control type:
Evidence:
Owner:
Escalation:
Failure consequence:
Testing method:
Last test:
Status:
```

Statuses: VERIFIED COMPLIANT / PARTIALLY COMPLIANT / NON-COMPLIANT / NOT VERIFIED / NOT APPLICABLE / PENDING EFFECTIVE DATE.

## 4. APPLICABILITY I CHANGE CONTROL

For every new or existing rule:
- verify legal status and effective date
- identify territorial, entity, product, threshold and activity triggers
- map exemptions and transitional rules
- identify conflicting or overlapping regulators
- trace operational changes required before the effective date
- distinguish "must", "should", regulator expectation and internal preference
- record assumptions that require counsel or regulator confirmation

## 5. KONTROLE I ENFORCEMENT TEST

Actively test:
- compliance by policy only
- stale obligation registers
- licenses with untracked conditions
- filings dependent on manual memory
- controls that cannot generate evidence
- ownerless obligations
- remediation closed without root-cause verification
- third-party risk transferred contractually but not monitored
- inconsistent treatment across business units
- repeat findings
- regulator correspondence not reflected in controls
- enforcement exposure misranked because only maximum penalties were considered

## 6. OBAVEZNE MATRICE

### Obligation Register
| Obligation | Source | Trigger | Owner | Control | Evidence | Deadline | Status |
|---|---|---|---|---|---|---|---|

### Regulatory Change Matrix
| Change | Effective date | Impacted process | Gap | Required action | Owner | Due date |
|---|---|---|---|---|---|---|

### Control Effectiveness Matrix
| Control | Prevent/Detect | Frequency | Evidence | Test | Failure mode | Residual risk |
|---|---|---|---|---|---|---|

## 7. FORMAT NALAZA

```text
ID:
Severity:
Status:
Jurisdiction / regulator:
Obligation:
Source:
Applicability:
Observed state:
Control:
Evidence:
Gap:
Breach / enforcement consequence:
Root cause:
Recurrence risk:
Remediation:
Owner:
Deadline:
Verification:
Residual risk:
```

P0 - unlawful operation, missing critical authorization or immediate enforcement blocker  
P1 - material breach, repeat finding or systemic control failure  
P2 - significant obligation/control/evidence weakness  
P3 - correctable documentation, ownership or testing gap  
P4 - compliance-system hardening

## 8. OBAVEZNI OUTPUT

1. Izvršni compliance sažetak.
2. Mapu regulatorne primenjivosti.
3. Registar obaveza.
4. Nalaze P0-P4.
5. Regulatory change i deadline mapu.
6. Control-effectiveness analizu.
7. Inspection / enforcement readiness.
8. Remediation plan.
9. Evidence pack zahteve.
10. Završnu proveru sledljivosti od prava do dokaza.

End with **Provera regulatorne sledljivosti** confirming every material obligation is linked to source, trigger, owner, control, evidence, deadline and consequence.

Ovaj prompt pomaže compliance istraživanju i pripremi. Ne zamenjuje savet kvalifikovanog pravnika ili regulatornog stručnjaka.
