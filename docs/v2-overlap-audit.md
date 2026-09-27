# UPL v2 Prompt Overlap Audit

Review date: 2026-09-27

## Result

- Prompt titles audited: **1,000 / 1,000**
- Exact normalized English title duplicates: **0**
- High lexical-similarity pairs reviewed: **11**
- Pairs requiring deletion/merge: **0**
- Scope-boundary refinements added: **12 subcategory profiles**

The similarity pass used normalized title-token overlap as a detection heuristic, not as proof of duplication. Similarity is expected in a structured professional library where concepts such as audit, positioning, reporting, user flow and shot lists recur in different domains.

## Main intentional overlaps and boundaries

### Technical SEO
- UPL-IT-008 Technical SEO Audit: implementation, crawl/render/index, performance and production web defects.
- UPL-MKT-035 Technical SEO Priority Audit: search intent, content portfolio, organic growth and business prioritization.

### User flows
- UPL-IT-082 Critical User Flow Audit: implemented product behavior, production states and measurable usability friction.
- UPL-CREATIVE-031 User Flow Audit: design intent, information architecture, interaction model and design-system specification.

### Management reporting
- UPL-BIZ-018 Management Reporting Audit: numerical integrity, reconciliation, accounting policy and financial controls.
- UPL-BIZ-075 Management Reporting System Audit: management operating rhythm, decision use, ownership and escalation.

### Positioning
- UPL-CAREER-006 Career Positioning Statement Builder: an individual's evidence-backed professional value.
- UPL-MKT-004 Positioning Statement Builder: a product/company market position relative to customer problems and alternatives.

### Reputation risk
- UPL-CAREER-089 Professional Reputation Risk Audit: individual professional credibility, public footprint and relationship trust.
- UPL-MKT-089 Reputation Risk Audit: organizational stakeholders, media, public claims and crisis communications.

### Shot lists
- UPL-CREATIVE-042 Shot List Builder: still-image coverage, composition and photo-series continuity.
- UPL-CREATIVE-054 Video Shot List Builder: temporal coverage, motion, audio and edit continuity.

Other lexical matches such as Android/AI/Desktop Application Audit are domain-distinct and were false positives from shared generic nouns.

## Regression protection

validate:v2 now rejects exact normalized English prompt-title duplicates. Near-duplicate titles remain reviewable rather than automatically rejected because cross-domain reuse of terms can be legitimate.
