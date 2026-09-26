---
id: UPL-SCI-043
number: 43
slug: missingness-mechanism-audit
title: Missingness Mechanism Audit
category: Science, Research & Analysis
category_id: UPL-SCI
subcategory: Data Quality & Reproducibility
subcategory_id: data-quality-reproducibility
language: en
version: 1.0.0
status: stable
---

# MISSINGNESS MECHANISM AUDIT

Main objective:

> Perform a rigorous, transparent and reproducible workflow for Missingness Mechanism Audit, with a clear audit trail for all methodological decisions.

## 1. CONTEXT

Define question, unit of analysis, data/material, source/provenance, time range, software/tools, transformations, decision stakes and intended claim.

## 2. DOMAIN STANDARD

Apply FAIR principles where relevant: make data and metadata findable, accessible under appropriate conditions, interoperable and reusable. FAIR does not mean all data must be public; privacy, consent, licensing and governance still control access.

## 3. SPECIALIZED FOCUS

For **Missingness Mechanism Audit**:
- define the exact artifact, method or claim being audited
- preserve raw evidence and provenance
- distinguish planned from post hoc choices
- make transformations and exclusions reproducible
- test plausible alternatives
- state unresolved uncertainty

## 4. INTEGRITY CHECKS

- raw data are immutable or versioned
- provenance is recorded
- cleaning steps are scripted or logged
- missingness is characterized
- data dictionary matches actual fields
- code/environment versions are captured
- random seeds and dependencies are recorded where relevant
- outputs can be regenerated from declared inputs

## 5. AUDIT CARD

```text
Object:
Source/provenance:
Method:
Transformation:
Assumption:
Evidence:
Quality issue:
Alternative:
Reproducibility status:
Decision impact:
```

## 6. REQUIRED MATRICES

### Provenance Matrix
| Dataset/artifact | Source | Version | License/access | Transformation | Output |
|---|---|---|---|---|---|

### Reproducibility Matrix
| Step | Input | Code/tool | Version | Parameters | Deterministic? | Evidence |
|---|---|---|---|---|---|---|

## 7. ANTI-FAILURE RULES

Do not hide exclusions, overwrite raw data, infer saturation from convenience, confuse coding frequency with importance, truncate axes deceptively, suppress uncertainty, or use polished visualization to imply stronger evidence than exists.

## 8. REQUIRED OUTPUT

1. Scope and provenance.
2. Method and assumptions.
3. Quality/integrity findings.
4. Required matrices.
5. Sensitivity / alternative choices.
6. Reproducibility package requirements.
7. Inference/communication limits.
8. Remediation priorities.

End with **Scientific Integrity Check** confirming traceability from raw evidence through transformation to final claim.

This supports scientific analysis and does not replace domain-specific ethical or institutional procedures.
