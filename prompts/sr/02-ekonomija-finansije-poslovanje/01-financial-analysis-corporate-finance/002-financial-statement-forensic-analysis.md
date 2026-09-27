---
id: UPL-BIZ-002
number: 2
slug: financial-statement-forensic-analysis
title: Forenzička analiza finansijskih izveštaja
category: Ekonomija, finansije i poslovanje
category_id: UPL-BIZ
subcategory: Finansijska analiza i korporativne finansije
subcategory_id: financial-analysis-corporate-finance
language: sr
version: 1.0.0
status: stable
---

# FORENZIČKA ANALIZA FINANSIJSKIH IZVEŠTAJA

Želim forenzičku analizu finansijskih izveštaja sa fokusom na anomalije, agresivno računovodstvo, earnings quality, klasifikacije, timing i međusobnu konzistentnost Income Statement-a, Balance Sheet-a i Cash Flow Statement-a.

Glavni cilj:

> Pronaći mesta gde reported financial performance možda ne predstavlja ekonomsku realnost poslovanja, bez optuživanja za prevaru bez dokaza.

Ovo nije:

- fraud accusation generator
- automatsko proglašavanje accounting estimate-a manipulacijom
- samo ratio analysis
- samo Benford test
- zamena za formalnu reviziju

## 1. SOURCE QUALITY

Utvrdi:

- audited?
- auditor opinion
- period
- accounting framework
- restatements
- notes available

## 2. THREE-STATEMENT RECONCILIATION

Proveri veze između:

- profit
- retained earnings
- cash
- debt
- working capital

## 3. REVENUE QUALITY

Traži:

- unusual period-end spike
- receivable growth > revenue
- contract assets
- deferred revenue
- returns
- bill-and-hold indicators where evidence exists

## 4. RECEIVABLES

## 5. DSO

## 6. ALLOWANCE

## 7. BAD DEBT

## 8. INVENTORY

## 9. INVENTORY GROWTH

## 10. OBSOLESCENCE RESERVE

## 11. GROSS MARGIN

Sudden unexplained movements.

## 12. COGS CLASSIFICATION

## 13. CAPITALIZATION

Costs that might otherwise be expensed.

## 14. DEVELOPMENT COST

## 15. SOFTWARE COST

## 16. CAPITALIZED INTEREST

## 17. DEPRECIATION POLICY

## 18. USEFUL LIFE

## 19. RESIDUAL VALUE

## 20. IMPAIRMENT

## 21. GOODWILL

## 22. INTANGIBLES

## 23. ACQUISITION ACCOUNTING

## 24. PROVISION

## 25. RESERVE RELEASE

## 26. RESTRUCTURING

## 27. "NON-RECURRING"

## 28. STOCK-BASED COMPENSATION

## 29. RELATED PARTY

## 30. OFF-BALANCE-SHEET

## 31. LEASE

## 32. DEBT CLASSIFICATION

## 33. CURRENT/NON-CURRENT

## 34. COVENANT

## 35. CONTINGENCY

## 36. TAX

## 37. DEFERRED TAX

## 38. CASH TAX VS ACCOUNTING TAX

## 39. OPERATING CASH FLOW

## 40. CLASSIFICATION

Interest/dividends depending on the accounting framework.

## 41. FREE CASH FLOW

## 42. PROFIT VS CFO

## 43. ACCRUALS

## 44. TOTAL ACCRUAL RATIO

Use carefully.

## 45. CASH CONVERSION

## 46. PERIOD-END WINDOW DRESSING

Only report with evidence.

## 47. SUPPLIER PAYMENT TIMING

## 48. FACTORING

## 49. RECEIVABLE SALE

## 50. SUPPLY CHAIN FINANCE

## 51. DEBT-LIKE ITEMS

## 52. CASH-LIKE ITEMS

## 53. RECLASSIFICATION

## 54. RESTATEMENT

## 55. ACCOUNTING POLICY CHANGE

## 56. ESTIMATE CHANGE

## 57. AUDITOR CHANGE

Signal, not proof.

## 58. MANAGEMENT KPI

Reconcile to statutory data.

## 59. ADJUSTED EBITDA

## 60. NON-GAAP

## 61. RECONCILIATION

## 62. SEGMENT REPORTING

## 63. GEOGRAPHIC REPORTING

## 64. CONCENTRATION

## 65. FOOTNOTES

High-value.

## 66. COMMITMENTS

## 67. GUARANTEES

## 68. LEGAL

## 69. PENSION

## 70. MINORITY INTEREST

## 71. DILUTION

## 72. SHARE COUNT

## 73. EPS

## 74. CASH RESTRICTION

## 75. SUBSIDIARY CASH

## 76. CURRENCY TRANSLATION

## 77. HYPERINFLATION

If relevant.

## 78. ANOMALY TREND

## 79. PEER COMPARISON

Only comparable accounting/business models.

## 80. FORENSIC SIGNALS

A signal is not fraud proof.

## 81. FRAUD LANGUAGE RULE

Never write:

```text
"management manipulated earnings"
```

unless there is direct reliable evidence.

Prefer:

```text
"This pattern warrants further verification because..."
```

## 82. EVIDENCE TIERS

```text
A - audited note/reconciliation/direct ledger evidence
B - deterministic statement inconsistency
C - strong multi-period accounting anomaly
D - forensic signal requiring verification
E - analytical question
```

Materijalnost je skala ozbiljnosti ove analize: **HIGH** menja ukupan zaključak, odluku ili izgled likvidnosti; **MEDIUM** menja ključni pokazatelj ili trend, ali ne i zaključak; **LOW** ima ograničen efekat i navodi se radi potpunosti. Procenjuj je u odnosu na eksplicitnu osnovu (dobit, operativni cash flow, ukupna imovina ili kapital) i navedi tu osnovu. Finding je CONFIRMED samo uz evidence tier A ili B; tier C je LIKELY; tier D ostaje NOT VERIFIED, a tier E je otvoreno analitičko pitanje, a ne finding. Obrazac sa legitimnim, dokumentovanim objašnjenjem je false positive: označi ga kao EXPLAINED umesto da ga prijaviš kao anomaliju.

## 83. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
EXPLAINED
NOT APPLICABLE
```

## 84. FINDING FORMAT

```text
ID:
Materiality:
Status:
Evidence tier:
Statement/account:
Period:
Observed pattern:
Expected relationship:
Difference:
Cash impact:
Possible explanations:
Evidence:
Additional evidence required:
Conclusion:
```

## 85. ANOMALY MATRIX

| Signal | Current | Prior | Cash effect | Explanation |
|---|---|---|---|---|

## 86. SECOND PASS

Revisit:

- revenue vs receivables
- profit vs cash
- inventory vs sales
- capitalization
- reserve release
- debt classification
- adjusted metrics
- related parties
- notes
- restatements

## 87. FINAL QUALITY GATE

Confirm:

- three statements reconcile
- footnotes reviewed
- anomalies distinguished from proof
- materiality considered
- alternative explanations considered
- accounting framework considered

## 88. OUTPUT

`FINANCIAL_STATEMENT_FORENSIC_ANALYSIS.md`

# KONAČNO PRAVILO

Forenzička analiza treba da pronađe:

```text
šta se ne uklapa
+
zašto je materijalno
+
koja legitimna objašnjenja postoje
+
koji dokaz je potreban da se utvrdi šta se zaista desilo
```
