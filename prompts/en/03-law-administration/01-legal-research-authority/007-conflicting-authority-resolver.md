---
id: UPL-LAW-007
number: 7
slug: conflicting-authority-resolver
title: Conflicting Authority Resolver
category: Law & Administration
category_id: UPL-LAW
subcategory: Legal Research & Authority
subcategory_id: legal-research-authority
language: en
version: 1.0.0
status: stable
---

# CONFLICTING AUTHORITY RESOLVER

Main objective:

> Resolve apparently conflicting legal authorities by testing hierarchy, jurisdiction, chronology, procedural posture, scope, factual predicates and subsequent treatment before concluding that a true conflict exists.

This is a jurisdiction-adaptive, evidence-first legal research workflow. Do not assume that US, EU, Serbian, common-law or civil-law concepts are interchangeable.

## 1. INTAKE GATE

Establish or mark as unknown:
- jurisdiction and forum
- legally relevant date or period
- parties and legal capacities
- material and disputed facts
- procedural posture
- location of acts, assets and performance
- governing-law, forum or arbitration clauses
- requested remedy or work product
- available sources and access limitations
- deadline and required citation style

If a missing item could change the result, do not silently invent it.

## 2. SPECIALIZED WORKFLOW

- normalize the propositions that supposedly conflict
- rank sources by formal authority and precedential status
- test whether different facts, remedies, definitions or procedural stages explain the divergence
- apply later-in-time and specific-over-general principles only where recognized
- identify authoritative resolution by a higher court or competent body
- preserve unresolved splits instead of manufacturing certainty

## 3. AUTHORITY HIERARCHY

Build a hierarchy specific to the legal system. Typical source families include:
- constitution or foundational instrument
- legislation and authentic official-gazette publication
- delegated legislation and regulations
- binding higher-court decisions
- same-level or lower-court decisions with precedential status stated
- official regulator or agency decisions and guidance
- treaties and supranational instruments where applicable
- authoritative secondary commentary
- non-authoritative summaries, blogs, search snippets and AI-generated material

For EU-law questions, distinguish authentic Official Journal material from consolidated documentation texts and verify EU case law through official court resources. For European human-rights questions, use HUDOC where relevant.

## 4. RESEARCH FUNNEL

1. Frame the legal issue in the vocabulary of the relevant system.
2. Identify likely official repositories.
3. Find primary authority before relying on commentary.
4. Verify authenticity, temporal applicability and legal weight.
5. Read around the pinpoint and capture context.
6. Trace amendments, implementing acts and later judicial treatment.
7. Search specifically for adverse authority and alternative interpretations.
8. Stop only when additional research has low marginal decision value, and state why.

## 5. AUTHORITY RECORD

For every material source capture:

```text
Authority:
Authority type:
Jurisdiction:
Issuing body / court:
Identifier / citation:
Publication or decision date:
Effective / relevant date:
Version:
Binding status:
Proposition supported:
Pinpoint:
Direct source:
Currency / subsequent-treatment check:
Contrary authority:
Verification status:
Notes:
```

Allowed verification states:
VERIFIED PRIMARY / VERIFIED SECONDARY / SUPPORTED / CONTESTED / UNVERIFIED / OUTDATED OR SUPERSEDED / NOT APPLICABLE.

## 6. SPECIALIZED MATRICES

- **Conflict Matrix**: show source, legal weight, date, verification status, uncertainty and decision impact where relevant.
- **Hierarchy and Chronology Table**: show source, legal weight, date, verification status, uncertainty and decision impact where relevant.
- **Distinguishing-Factor Table**: show source, legal weight, date, verification status, uncertainty and decision impact where relevant.
- **Resolution Confidence Register**: show source, legal weight, date, verification status, uncertainty and decision impact where relevant.

## 7. FALSE-CERTAINTY DEFENSES

Actively guard against:
- invented cases, citations, statutes, articles, quotations, courts or dates
- treating a search snippet as authority
- using a current rule for a historical event without temporal analysis
- confusing a case summary with the judgment
- treating dicta, dissent, press material or an advocate-general opinion as the holding
- transferring a rule from one jurisdiction to another without legal basis
- missing amendment, repeal, commencement or transitional provisions
- ignoring procedural posture or standard of review
- assuming repeated secondary commentary proves the proposition

## 8. CONTRARY AUTHORITY TEST

For each important conclusion ask:
- What is the strongest contrary authority?
- Is it binding, persuasive, distinguishable or outdated?
- Does a different definition, fact pattern, remedy or procedural stage explain the difference?
- What fact or authority would falsify the current conclusion?

## 9. FINDING FORMAT

```text
Issue:
Conclusion status:
Jurisdiction / forum:
Relevant date:
Controlling rule:
Best authority:
Authority weight:
Application to facts:
Adverse authority / counterargument:
Missing fact or verification:
Confidence:
Practical consequence:
Next research step:
```

## 10. REQUIRED OUTPUT

Return:
1. Executive answer with calibrated confidence.
2. Assumptions and jurisdiction/date gate.
3. Issue tree.
4. Authority hierarchy used.
5. Analysis with proposition-level citations or identifiers.
6. Contrary authority and unresolved conflicts.
7. Specialized matrices.
8. Missing facts and research gaps.
9. Verification log.
10. Clear boundary between legal research and legal advice.

End with **Research Integrity Check** confirming that every material proposition is tied to verified authority, explicitly identified as inference, or marked unresolved.

This prompt supports legal research and preparation. It does not replace advice from qualified counsel in the relevant jurisdiction.
