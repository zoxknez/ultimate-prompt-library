---
id: UPL-SCI-085
number: 85
slug: global-sensitivity-analysis-plan
title: Global Sensitivity Analysis Plan
category: Science, Research & Analysis
category_id: UPL-SCI
subcategory: Modeling, Simulation & Computational Analysis
subcategory_id: domain-analysis-modeling-simulation
language: en
version: 1.0.0
status: stable
---

# GLOBAL SENSITIVITY ANALYSIS PLAN

Main objective:

> Perform a rigorous, transparent workflow for Global Sensitivity Analysis Plan that preserves research integrity, decision traceability and claims proportional to evidence.

## 1. CONTEXT

Define research object, study/model/artifact, responsible people, data/code/materials, decision stage, relevant standards, risks and intended use.

## 2. DOMAIN STANDARD

Separate model verification, calibration, validation and application. A model can reproduce observed data yet still be structurally wrong or unreliable outside its calibration domain. Treat parameter, structural and input uncertainty separately.

## 3. SPECIALIZED FOCUS

For **Global Sensitivity Analysis Plan**:
- define the exact integrity/model/project question
- identify source documents and evidence
- separate mandatory requirements from good practice
- identify hidden assumptions and incentives
- test failure, misuse and edge cases
- produce corrective actions with verification

## 4. INTEGRITY CHECKS

- equations/rules match stated mechanism
- units and dimensional consistency are checked
- code implementation is verified
- parameters have provenance
- calibration and validation datasets are separated where possible
- sensitivity covers consequential parameters
- uncertainty is propagated to outputs
- extrapolation beyond validation domain is explicit

## 5. REVIEW CARD

```text
Issue:
Source / evidence:
Observed state:
Expected standard:
Assumption:
Risk:
Alternative explanation:
Corrective action:
Owner:
Verification:
Residual uncertainty:
```

## 6. REQUIRED MATRICES

### Model Validation Matrix
| Component | Assumption | Calibration evidence | Validation evidence | Failure mode | Domain |
|---|---|---|---|---|---|

### Sensitivity Matrix
| Parameter/input | Range | Output sensitivity | Interaction | Uncertainty priority |
|---|---|---|---|---|

## 7. ANTI-OVERCLAIM / ANTI-BLAME RULES

Do not infer misconduct from anomaly alone, treat reporting compliance as proof of validity, select a model only by fit, hide failed replications, use stakeholder preference as evidence, or convert uncertain evidence into deterministic policy claims.

## 8. REQUIRED OUTPUT

1. Scope and evidence base.
2. Standard/method applied.
3. Key findings.
4. Required matrices.
5. Alternative explanations / models.
6. Robustness or verification plan.
7. Corrective / implementation actions.
8. Residual limitations.

End with **Final Integrity Check** confirming traceability from evidence to recommendation or scientific claim.

This supports scientific work and does not replace required formal ethical, institutional, regulatory or specialist procedures.
