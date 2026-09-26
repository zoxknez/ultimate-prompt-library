---
id: UPL-LAW-042
number: 42
slug: data-mapping-and-processing-inventory
title: Mapa podataka i evidencija aktivnosti obrade
category: Pravo i administracija
category_id: UPL-LAW
subcategory: Privatnost i zaštita podataka
subcategory_id: privacy-data-protection
language: sr
version: 1.0.0
status: stable
---

# MAPA PODATAKA I EVIDENCIJA AKTIVNOSTI OBRADE

Glavni cilj:

> Sprovedite rigorozan, dokaziv i jurisdiction-aware workflow za temu "Mapa podataka i evidencija aktivnosti obrade", sa jasnim mapiranjem pravnih osnova, stvarne obrade, rizika po prava lica, kontrola i dokaza o usklađenosti.

Ovaj prompt je prilagodljiv jurisdikciji. GDPR/EDPB koristite samo kada su primenjivi. Ne pretpostavljajte da isti pravni osnov, rok, transfer mehanizam ili notification threshold važi u svakoj državi.

## 1. ULAZNI GATE

- organizaciju, uloge controller/processor/joint-controller ili lokalne ekvivalente
- jurisdikcije i lokacije obrade
- kategorije lica i podataka
- svrhe obrade i stvarne data flow-ove
- sisteme, procesore, podprocesore i primaoce
- rokove čuvanja i deletion mehanizme
- bezbednosne i governance kontrole
- postojeće politike, ugovore, evidencije i incidente
- pravne osnove i posebne uslove za osetljive podatke
- međunarodne transfere i onward transfer-e

## mapirajte svaku svrhu na konkretne podatke, lica, sistem i primaoca,proverite da dokumentacija odgovara stvarnoj obradi, ne samo policy tekstu,razdvojite obavezno pravo od regulatornih smernica i interne dobre prakse,proverite purpose limitation, minimisation, accuracy, storage limitation, security i accountability gde su primenjivi,identifikujte processing koji nema vlasnika, dokaz ili jasan pravni osnov,testirajte rights, breach, retention i transfer workflow kao operativni sistem

- mapirajte svaku svrhu na konkretne podatke, lica, sistem i primaoca
- proverite da dokumentacija odgovara stvarnoj obradi, ne samo policy tekstu
- razdvojite obavezno pravo od regulatornih smernica i interne dobre prakse
- proverite purpose limitation, minimisation, accuracy, storage limitation, security i accountability gde su primenjivi
- identifikujte processing koji nema vlasnika, dokaz ili jasan pravni osnov
- testirajte rights, breach, retention i transfer workflow kao operativni sistem

Poseban fokus / Specialized focus:
- Reconstruct personal-data flows, systems, purposes, actors, recipients, locations, retention and legal dependencies into a verifiable processing inventory.
- Tie every conclusion to the real processing operation, legal rule, evidence and accountable owner.
- Detect mismatches between notices, records, contracts, systems and observed behavior.
- Require a reasoned residual-risk conclusion rather than a checklist-only pass.

## 3. EVIDENCIJA OBRADE

For each material processing activity capture:
```text
Processing activity:
Purpose:
Data subjects:
Data categories:
Special / sensitive data:
Source:
System:
Controller / responsible entity:
Processor / vendor:
Recipients:
Jurisdictions:
Lawful basis / legal condition:
Retention:
Security controls:
Rights impact:
Transfer mechanism:
Evidence:
Owner:
Verification status:
```

Status: PROVERENO / PODRŽANO / SPORNO / NEPROVERENO / ZASTARELO / NIJE PRIMENJIVO.

## 4. PRAVNI GATE

Use current primary law and authoritative regulator material for jurisdiction-specific conclusions. Under GDPR where applicable, explicitly test the relevant principles, lawful-basis rules, transparency and rights duties, processor requirements, security, breach duties, DPIA triggers and international-transfer rules. Do not treat guidance as legislation or a contract as proof of actual compliance.

## 5. RISK TEST

Actively test:
- undocumented processing or shadow data flows
- purpose creep
- excessive data collection
- invalid or mismatched lawful basis
- consent bundled, coerced, stale or impossible to withdraw where consent is relied on
- processor acting outside documented instructions
- uncontrolled subprocessors or onward transfers
- notices inconsistent with reality
- rights requests that cannot be fulfilled across systems
- retention schedules that do not delete copies
- breach decisions without documented risk assessment
- security controls that exist only on paper
- DPIA used as a formality instead of a risk process

Severity:
P0 - unlawful/high-risk processing or transfer with immediate material rights/regulatory exposure
P1 - systemic legal-basis, rights, breach, security or transfer failure
P2 - significant control or documentation weakness
P3 - correctable inconsistency or evidence gap
P4 - privacy engineering / governance hardening

## 6. OBAVEZNE MATRICE

### Processing Register
| Activity | Purpose | Data | Basis | System | Recipients | Retention | Transfer | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|

### Rights & Obligations Matrix
| Trigger / right | Legal source | Workflow | Deadline | Evidence | Exception | Owner |
|---|---|---|---|---|---|---|

### Risk & Control Matrix
| Risk | Rights impact | Existing control | Evidence | Gap | Residual risk | Action |
|---|---|---|---|---|---|---|

## 7. FORMAT NALAZA

```text
ID:
Severity:
Status:
Processing / system:
Jurisdiction:
Legal requirement:
Observed practice:
Evidence:
Gap:
Rights impact:
Regulatory impact:
Security / transfer dependency:
Remediation:
Owner:
Deadline:
Residual risk:
```

## 8. OBAVEZNI OUTPUT

1. Izvršni privacy risk sažetak.
2. Mapu obrade i uloga.
3. Primenjivi pravni okvir.
4. Nalaze P0-P4.
5. Obavezne matrice.
6. Rupe u dokazima i dokumentaciji.
7. Remediation plan sa vlasnicima i rokovima.
8. Rights / breach / transfer zavisnosti.
9. Residual risk.
10. Završnu Accountability proveru.

End with **Provera odgovornosti i dokazivosti** confirming that each material conclusion is tied to actual processing evidence and a verified legal source, or is explicitly marked unresolved.

Ovaj prompt pomaže privacy/compliance istraživanju i pripremi. Ne zamenjuje savet kvalifikovanog pravnika ili DPO-a u relevantnoj jurisdikciji.
