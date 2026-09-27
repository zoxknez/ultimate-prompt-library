# UPL v2.3 Deep Quality Upgrade Report

Review date: 2026-09-27

## Coverage

- Unique production prompts: **1,000 / 1,000**
- Localized prompt experiences: **2,000 / 2,000**
- Major categories: **10 / 10**
- Subcategories with dedicated best-practice profiles: **100 / 100**
- Subcategories with dedicated authoritative source routing: **100 / 100**
- Category-level authoritative source profiles: **10 / 10**
- Effective prompt version: **2.3.0**
- Languages: **English + Serbian**

## V2 composition model

Every effective prompt is composed from these layers at generation/runtime:

1. original task-specific production specification
2. shared UPL Prompt Quality Standard v2
3. category-specific domain profile
4. subcategory-specific best-practice profile
5. prompt-execution best-practice layer
6. prompt-specific execution focus derived from exact prompt identity and sibling scope
7. subject-specific semantic detail with domain mechanism checks
8. task-shape execution model
9. explicit eval contract covering representative, boundary, missing-context, adversarial and regression cases
10. adversarial challenge and calibrated uncertainty controls
11. subcategory-specific authoritative source routing
12. category-level authoritative source fallback

Task-shape logic distinguishes audit/review, builder/design/plan, analysis/assessment, tracker/monitor, generative copy/script and red-team/stress-test workflows.

## Universal improvements

Every generated prompt now receives:
- pre-flight goal/scope/non-goal/assumption contract
- primary-source and freshness discipline
- tool, privacy and sensitive-data rules
- category and subcategory best practices
- model-neutral prompt-execution guidance
- prompt-specific scope, input, completion and sibling-handoff rules for every ID
- minimum four subject-specific semantic rules for every ID, with deeper dedicated matchers where the subject has a specialized methodology
- explicit per-prompt eval contract
- adversarial challenge pass
- calibrated uncertainty vocabulary
- decision-ready findings schema
- acceptance, verification and rollback gate
- high-impact human-review gate with source/evidence traceability
- claim-level provenance and citation-laundering protection
- reproducibility fixtures for model/tool/harness-sensitive evaluation
- lean-prompt execution rule to prevent duplicated guidance from becoming output noise
- deterministic empirical eval suite for every prompt identity
- six machine-readable fixture classes per prompt: nominal, boundary, missing-context, adversarial, provenance and regression
- prompt-specific semantic anchors and adjacent-scope awareness inside eval generation
- grader assertions that are validated structurally before a suite can pass
- cross-domain semantic-contamination guard, including strict token-boundary matching for API/backend routing
- executable eval runner with zero-cost dry-run default
- explicit OpenAI Responses API adapter using native Node fetch, without adding runtime dependencies
- separate candidate and assertion-based judge calls with response/model/latency/usage metadata
- golden regression comparison with NO_BASELINE / PASS / REGRESSION / STALE_BASELINE states
- immutable-by-default golden baseline workflow requiring explicit successful-live-run acceptance
- local eval-output isolation through ignored .eval-runs/ artifacts
- relevant authoritative starting sources

## Prompt-engineering methodology

The shared layer follows current provider-neutral best practices:
- clear and specific instructions
- consistent section/delimiter structure
- explicit constraints and output format
- decomposition of complex work into phases
- grounded use of tools and external evidence
- schema validation for automated outputs
- evaluation on representative, boundary, missing-context, adversarial and regression cases
- iterative refinement based on observed failures rather than prompt length alone

## External methodology

The source registry and 100 subcategory source profiles prioritize primary/official guidance including NIST, OWASP, CISA, CIS, ISO, OECD, IFRS, EUR-Lex, EDPB, ILO, WIPO, HCCH, UNCITRAL, WHO, NICE, Cochrane, EEF, UNESCO, CONSORT 2025, PRISMA, STROBE, EQUATOR, FAIR/GO FAIR, ESCO, Europass, O*NET, BLS, FTC, Google Search Essentials, IAB, PMI and W3C/WCAG.

Current-version examples captured in the registry include:
- NIST SSDF v1.1 final + v1.2 draft status
- NIST SP 800-218A final GenAI profile
- CONSORT 2025
- ISO 9001:2026\n- PMBOK Guide Eighth Edition
- ESCO v1.2.1
- IAB Campaign Data Standards 1.0 Final
- WCAG 2.2
- NIST RDaF v2.0
- ISO 30401:2018 revision status

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
- zero generic task-shape fallback prompts
- zero exact normalized English title duplicates
- HTTPS source URLs
- at least four effective authoritative sources per subcategory after deduplication
- at least two independent authoritative source domains per subcategory
- draft/proposed source-status validation with explicit notes
- stable identity from `catalog.json`
- effective version 2.3.0 in generated indexes and live prompt pages
- v2 quality marker in every generated prompt body
- prompt-execution best-practice layer
- prompt-specific execution-focus layer
- task-shape execution model
- eval contract
- challenge pass
- acceptance gate
- authoritative source section

See also: [V2 evaluation methodology](v2-evaluation-methodology.md) and [Prompt overlap audit](v2-overlap-audit.md).
