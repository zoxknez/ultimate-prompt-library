---
id: UPL-BIZ-019
number: 19
slug: internal-financial-controls-audit
title: Internal Financial Controls Audit
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Računovodstvo, izveštavanje i finansijska kontrola
subcategory_id: accounting-reporting-financial-control
language: sr
version: 1.0.0
status: stable
---

# INTERNAL FINANCIAL CONTROLS AUDIT

Želim dubok audit internal financial controls framework-a sa fokusom na material reporting, authorization, segregation of duties, reconciliations, master data i manual adjustments.

Glavni cilj:

> Utvrditi da li postoje preventivne i detektivne kontrole koje realno sprečavaju ili pravovremeno otkrivaju material error, unauthorized transaction i reporting misstatement.

Ovo nije:

- automatsko primenjivanje SOX-a na svaku kompaniju
- compliance certification
- "više approval-a = bolja kontrola"
- samo policy review

## 1. CONTROL OBJECTIVE

Za svaku kontrolu:

```text
Risk:
Control objective:
Control:
Owner:
Frequency:
Evidence:
Preventive/detective:
Manual/automated:
```

## 2. ENTITY-LEVEL CONTROLS

## 3. FINANCIAL CLOSE

## 4. JOURNAL ENTRY

## 5. RECONCILIATION

## 6. REVENUE

## 7. EXPENSE

## 8. AR

## 9. AP

## 10. CASH

## 11. PAYROLL

## 12. INVENTORY

## 13. FIXED ASSET

## 14. TAX

## 15. CONSOLIDATION

## 16. MASTER DATA

## 17. VENDOR MASTER

## 18. CUSTOMER MASTER

## 19. BANK DETAILS

## 20. CHART OF ACCOUNTS

## 21. ACCESS

## 22. PRIVILEGED USER

## 23. SEGREGATION OF DUTIES

## 24. CONFLICTING ROLES

## 25. COMPENSATING CONTROL

## 26. APPROVAL

## 27. THRESHOLD

## 28. SPLIT TRANSACTION

## 29. AUTOMATED CONTROL

## 30. SYSTEM CONFIGURATION

## 31. IT DEPENDENCE

## 32. REPORT USED IN CONTROL

IUC/IPE reliability.

## 33. COMPLETENESS

## 34. ACCURACY

## 35. REVIEW CONTROL

## 36. PRECISION

Does review operate at level capable of detecting material error?

## 37. EVIDENCE

## 38. RETENTION

## 39. EXCEPTION

## 40. FOLLOW-UP

## 41. CONTROL FAILURE

## 42. REMEDIATION

## 43. REPEAT DEFICIENCY

## 44. DESIGN EFFECTIVENESS

## 45. OPERATING EFFECTIVENESS

Distinct.

## 46. CONTROL FREQUENCY

## 47. POPULATION

## 48. SAMPLE

If performing test.

## 49. MATERIALITY

## 50. RISK

## 51. FALSE POSITIVE RULES

No segregation is not automatically a failure in tiny organization if effective compensating control exists.

Manual control is not inherently weak.

## 52. EVIDENCE TIERS

```text
A - control performance evidence and reperformance
B - complete design/configuration proof
C - strong control evidence
D - suspected weakness
E - maturity hardening
```

Deficiency je CONFIRMED (status DEFICIENT) samo uz evidence tier A ili B; tier C je LIKELY deficiency; tier D ostaje NOT VERIFIED; tier E je HARDENING. Status EFFECTIVE zahteva dokaz o stvarnom izvršenju kontrole, ne samo o njenom dizajnu.

## 53. STATUS

```text
EFFECTIVE
DEFICIENT
NOT VERIFIED
COMPENSATED
NOT APPLICABLE
HARDENING
```

## 54. SEVERITY

P0:
- systemic absence/failure allowing catastrophic material reporting corruption

P1:
- material control deficiency with realistic misstatement/fraud exposure

P2:
- significant control weakness

P3:
- limited deficiency

P4:
- hardening

## 55. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Risk:
Control objective:
Control:
Owner:
Frequency:
Expected operation:
Observed operation:
Deficiency:
Potential misstatement:
Evidence:
Compensating control:
Remediation:
Retest:
```

## 56. CONTROL MATRIX

| Risk | Control | Type | Owner | Evidence | Status |
|---|---|---|---|---|---|

## 57. SECOND PASS

Review:

- admin users
- manual journals
- bank changes
- close
- reconciliations
- spreadsheet controls
- reports used in controls
- repeat deficiencies
- compensating controls

## 58. FINAL QUALITY GATE

Confirm:

- risks
- objectives
- design
- operation
- evidence
- access
- SOD
- reconciliations
- journals
- master data
- reporting
- remediation

## 59. OUTPUT

`INTERNAL_FINANCIAL_CONTROLS_AUDIT.md`

# KONAČNO PRAVILO

Kontrola nije dobra zato što postoji u policy dokumentu.

Moraš dokazati:

```text
relevantan rizik
+
precizna kontrola
+
stvarno izvršenje
+
dokaz
+
sposobnost da spreči ili otkrije material problem
```
