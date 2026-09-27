# UPL v2 Deep Quality Upgrade Report

Review date: 2026-09-27

## Coverage

- Unique production prompts: **1,000 / 1,000**
- Localized prompt experiences: **2,000 / 2,000**
- Major categories: **10 / 10**
- Subcategories with dedicated best-practice profiles: **100 / 100**
- Subcategories with dedicated authoritative source routing: **100 / 100**
- Category-level authoritative source profiles: **10 / 10**
- Effective prompt version: **2.0.0**
- Languages: **English + Serbian**

## V2 composition model

Every effective prompt is composed from these layers at generation/runtime:

1. original task-specific production specification
2. shared UPL Prompt Quality Standard v2
3. category-specific domain profile
4. subcategory-specific best-practice profile
5. prompt-execution best-practice layer
6. task-shape execution model
7. subcategory-specific authoritative source routing
8. category-level authoritative source fallback

Task-shape logic distinguishes audit/review, builder/design/plan, analysis/assessment, tracker/monitor, generative copy/script and red-team/stress-test workflows.

## Universal improvements

Every generated prompt now receives:
- pre-flight goal/scope/non-goal/assumption contract
- primary-source and freshness discipline
- tool, privacy and sensitive-data rules
- category and subcategory best practices
- model-neutral prompt-execution guidance
- adversarial challenge pass
- calibrated uncertainty vocabulary
- decision-ready findings schema
- acceptance, verification and rollback gate
- relevant authoritative starting sources

## Prompt-engineering methodology

The shared layer follows current provider-neutral best practices:
- clear and specific instructions
- consistent section/delimiter structure
- explicit constraints and output format
- decomposition of complex work into phases
- grounded use of tools and external evidence
- schema validation for automated outputs
- evaluation on representative, boundary and adversarial cases
- iterative refinement based on observed failures rather than prompt length alone

## External methodology

The source registry and 100 subcategory source profiles prioritize primary/official guidance including NIST, OWASP, CISA, CIS, ISO, OECD, IFRS, EUR-Lex, EDPB, ILO, WIPO, HCCH, UNCITRAL, WHO, NICE, Cochrane, EEF, UNESCO, CONSORT 2025, PRISMA, STROBE, EQUATOR, FAIR/GO FAIR, ESCO, Europass, O*NET, BLS, FTC, Google Search Essentials, IAB, PMI and W3C/WCAG.

Current-version examples captured in the registry include:
- NIST SSDF v1.1 final + v1.2 draft status
- NIST SP 800-218A final GenAI profile
- CONSORT 2025
- PMBOK Guide Eighth Edition
- ESCO v1.2.1
- IAB Campaign Data Standards 1.0 Final
- WCAG 2.2

See:
- [Prompt Quality Standard v2](prompt-quality-standard-v2.md)
- [External Source Registry v2](external-source-registry-v2.md)

## Versioning architecture

Raw Markdown files remain the task-specific base specification. The effective v2 layer is composed centrally by `scripts/lib/v2-quality.mjs`, preventing 2,000 localized files from drifting into inconsistent copies of shared quality rules.

`scripts/upgrade-prompts-v2.mjs` can materialize the effective v2 layer into raw Markdown when a fully materialized source export is required.

## Verification gates

The production build must preserve:
- exactly 1,000 unique prompt IDs
- exactly 2 languages per prompt
- exactly 10 categories
- exactly 10 subcategories per category
- exactly 100 subcategory quality profiles
- exactly 100 subcategory authoritative source profiles
- exactly 10 category authoritative source profiles
- HTTPS source URLs
- stable identity from `catalog.json`
- effective version 2.0.0 in generated indexes and live prompt pages
- v2 quality marker in every generated prompt body
- prompt-execution best-practice layer
- task-shape execution model
- challenge pass
- acceptance gate
- authoritative source section
