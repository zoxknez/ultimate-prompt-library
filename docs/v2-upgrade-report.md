# UPL v2 Deep Quality Upgrade Report

Review date: 2026-09-27

## Coverage

- Unique production prompts: **1,000 / 1,000**
- Localized prompt experiences: **2,000 / 2,000**
- Major categories: **10 / 10**
- Subcategories with dedicated best-practice profiles: **100 / 100**
- Effective prompt version: **2.0.0**
- Languages: **English + Serbian**

## V2 composition model

Every prompt is now composed from four quality layers at generation/runtime:

1. the prompt's original task-specific production specification
2. the shared UPL Prompt Quality Standard v2
3. a category-specific domain profile
4. a subcategory-specific best-practice profile plus a task-shape execution model

Task-shape logic distinguishes audit/review, builder/design/plan, analysis/assessment, tracker/monitor, generative copy/script and red-team/stress-test workflows.

## Universal improvements

Every generated prompt now receives:
- pre-flight goal/scope/assumption contract
- primary-source and freshness discipline
- tool, privacy and sensitive-data rules
- category and subcategory best practices
- adversarial challenge pass
- calibrated uncertainty vocabulary
- decision-ready findings schema
- acceptance, verification and rollback gate

## External methodology

The source registry prioritizes primary/official guidance including NIST, OWASP, CISA, CIS, ISO, OECD, EUR-Lex, EDPB, ILO, WIPO, HCCH, UNCITRAL, WHO, NICE, Cochrane, EEF, UNESCO, PRISMA, CONSORT, STROBE, FAIR/GO FAIR, O*NET, BLS, FTC, Google Search Essentials, IAB, PMI and W3C/WCAG.

See:
- [Prompt Quality Standard v2](prompt-quality-standard-v2.md)
- [External Source Registry v2](external-source-registry-v2.md)

## Versioning architecture

Raw Markdown files remain the task-specific base specification. The shared v2 layer is composed centrally by `scripts/lib/v2-quality.mjs` so 2,000 localized files cannot drift into different copies of the same quality rules.

`scripts/upgrade-prompts-v2.mjs` can materialize the effective v2 layer into raw Markdown if a fully materialized source export is ever required.

## Verification gates

The build must preserve:
- exactly 1,000 unique prompt IDs
- exactly 2 languages per prompt
- exactly 10 categories
- exactly 10 subcategories per category
- stable identity from `catalog.json`
- effective version 2.0.0 in generated indexes and live prompt pages
- v2 quality marker in every generated prompt body
