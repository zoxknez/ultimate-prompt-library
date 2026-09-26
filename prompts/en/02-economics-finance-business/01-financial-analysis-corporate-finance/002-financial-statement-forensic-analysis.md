---
id: UPL-BIZ-002
number: 2
slug: financial-statement-forensic-analysis
title: Financial Statement Forensic Analysis
category: Economics, Finance & Business
category_id: UPL-BIZ
subcategory: Financial Analysis & Corporate Finance
subcategory_id: financial-analysis-corporate-finance
language: en
version: 1.0.0
status: stable
---

# FINANCIAL STATEMENT FORENSIC ANALYSIS

I want a forensic analysis of the financial statements with a focus on anomalies, aggressive accounting, earnings quality, classifications, timing and the mutual consistency of the Income Statement, Balance Sheet and Cash Flow Statement.

Main objective:

> Find the places where reported financial performance may not represent the economic reality of the business, without accusing anyone of fraud without evidence.

This is not:

- a fraud accusation generator
- automatically declaring an accounting estimate to be manipulation
- only a ratio analysis
- only a Benford test
- a replacement for a formal audit

## 1. SOURCE QUALITY

Establish:

- audited?
- auditor opinion
- period
- accounting framework
- restatements
- notes available

## 2. THREE-STATEMENT RECONCILIATION

Check the links between:

- profit
- retained earnings
- cash
- debt
- working capital

## 3. REVENUE QUALITY

Look for:

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

Materiality is the severity scale of this analysis: **HIGH** changes the overall conclusion, a decision or the liquidity outlook; **MEDIUM** changes a key metric or trend but not the conclusion; **LOW** has a limited effect and is noted for completeness. Judge it against an explicit base (profit, operating cash flow, total assets or equity) and state that base. A finding is CONFIRMED only with evidence tier A or B; tier C is LIKELY; tier D stays NOT VERIFIED, and tier E is an open analytical question, not a finding. A pattern with a legitimate, documented explanation is a false positive: mark it EXPLAINED instead of reporting it as an anomaly.

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

# FINAL RULE

A forensic analysis should find:

```text
what does not fit
+
why it is material
+
which legitimate explanations exist
+
which evidence is needed to establish what actually happened
```
