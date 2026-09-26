---
id: UPL-LAW-089
number: 89
slug: ip-due-diligence-for-transactions
title: IP due diligence za transakcije
category: Pravo i administracija
category_id: UPL-LAW
subcategory: Intelektualna svojina
subcategory_id: intellectual-property
language: sr
version: 1.0.0
status: stable
---

# IP DUE DILIGENCE ZA TRANSAKCIJE

Glavni cilj:

> Sprovedite evidence-first i jurisdiction-aware workflow za "IP due diligence za transakcije", sa proverom prava, teritorije, statusa, vlasništva, licence, ograničenja i dokaznog lanca.

WIPO materijale koristite kao autoritativan međunarodni referentni okvir, ali konkretna prava, registracije, izuzeci i pravna sredstva zavise od jurisdikcije. Registracioni status i domaće pravo uvek proverite direktno.

## 1. IP ULAZNI GATE

- asset / work / invention / mark / software / confidential information
- creator / inventor / applicant / owner / licensee / contributor
- creation, filing, publication, acquisition and assignment dates
- jurisdictions and markets
- registrations, applications and renewal status
- employment / contractor / commission relationships
- licenses, assignments, coexistence or settlement agreements
- third-party components and prior materials
- open-source / Creative Commons / platform terms where relevant
- disputes, oppositions, claims, takedowns or encumbrances

## 2. SPECIJALIZOVANI TOK

- Perform transaction-focused IP due diligence across ownership, registrations, licenses, encumbrances, disputes, open source, trade secrets, employees, contractors and change-of-control risk.
- Separate existence of a right from ownership, validity, scope and enforceability.
- Trace chain of title from creator/inventor to current owner.
- Verify territorial coverage and current status.
- Distinguish registered rights, unregistered rights, contractual rights and confidentiality.
- Identify license scope, restrictions, sublicensing, transfer and termination effects.
- Test third-party dependencies and contamination risk.
- Preserve uncertainty where search coverage or legal status is incomplete.

## 3. IP EVIDENCE CARD

```text
Asset:
Right type:
Jurisdiction:
Creator / inventor:
Applicant / registrant:
Current owner:
Registration / application:
Status:
Priority / filing / creation date:
Term / renewal:
Chain-of-title document:
License / encumbrance:
Third-party dependency:
Commercial use:
Dispute / challenge:
Primary source:
Verification status:
```

## 4. POSEBNI PRAVNI TESTOVI

Where relevant test:
- trademark distinctiveness, classes, territory, prior rights and use
- copyright authorship, originality threshold, ownership, fixation/formality rules and licenses
- patent family, claim scope, legal status, priority and jurisdiction
- trade-secret secrecy, commercial value from secrecy and reasonable protective measures
- software copyright, patent dependencies and contributor ownership
- open-source license obligations and distribution triggers
- AI content provenance, human contribution, contractual terms and similarity / infringement risk

Never equate a database search hit with infringement or clearance.

## 5. FAILURE MODES

Actively test:
- missing assignment in chain of title
- expired or abandoned registrations treated as active
- wrong owner in registry
- territorial assumptions
- license scope exceeded
- contributor / contractor rights not assigned
- open-source notice or source obligations missed
- confidentiality inconsistent with public disclosure
- trade secret with no reasonable protection evidence
- trademark clearance based only on exact-match search
- patent analysis based only on titles/abstracts rather than claims/status
- AI output treated as automatically owned or automatically infringing

## 6. OBAVEZNE MATRICE

### IP Asset Register
| Asset | Right | Jurisdiction | Owner | Status | Term | License | Evidence | Risk |
|---|---|---|---|---|---|---|---|---|

### Chain-of-Title Matrix
| Asset | Creator | Transfer step | Document | Scope | Date | Gap |
|---|---|---|---|---|---|---|

### Third-Party Dependency Matrix
| Component / content | Source | License / permission | Obligation | Trigger | Evidence | Risk |
|---|---|---|---|---|---|---|

## 7. FORMAT NALAZA

```text
ID:
Severity:
Status:
Asset:
Right type:
Jurisdiction:
Issue:
Primary evidence:
Ownership impact:
Validity / scope impact:
License impact:
Third-party risk:
Commercial impact:
Remediation:
Owner:
Deadline:
Residual uncertainty:
```

P0 - ownership, validity or license defect capable of blocking core use / transaction  
P1 - material infringement, chain-of-title, registration or license exposure  
P2 - significant territorial, contractual, OSS, trade-secret or evidence weakness  
P3 - correctable filing, notice or documentation gap  
P4 - portfolio / protection optimization

## 8. OBAVEZNI OUTPUT

1. Izvršni IP risk sažetak.
2. IP asset mapu.
3. Chain-of-title analizu.
4. Nalaze P0-P4.
5. Obavezne matrice.
6. License i third-party dependency analizu.
7. Teritorijalne i statusne rupe.
8. Dispute / enforcement rizike.
9. Remediation i filing plan.
10. Završnu proveru vlasništva, scope-a i dokazivosti.

End with **Provera integriteta IP portfolija** confirming that each material ownership, validity, scope and license conclusion is tied to a primary record or clearly marked unresolved.

Ovaj prompt pomaže IP istraživanju i pripremi. Ne zamenjuje savet kvalifikovanog IP pravnika ili patentnog zastupnika u relevantnoj jurisdikciji.
