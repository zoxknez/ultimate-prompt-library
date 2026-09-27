# Changelog

All notable changes to Ultimate Prompt Library are documented in this file. Prompt-level changes are tracked through each prompt's `version` field; this changelog records repository-level changes and notable prompt additions.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed - effective prompt version 2.4.0 (production hardening)

- **Routing:** task-shape, completion-contract and semantic routing now come from one token-aware table (`scripts/lib/v2-routing.mjs`) evaluated on the slug and English title only. This removes substring collisions ("api" in "terapije", "valuation" in "evaluation", "liability" in "reliability", "auth" in "authority", "etl" in "osvetljenja" and others) and guarantees identical rule selection in EN and SR. 69 English and 78 Serbian prompts lost false semantic rules; 47 primary task shapes changed to the English head noun.
- **Serbian prompts:** restored the missing draft/consultation source-status rule in all 1,000 Serbian prompts, localized section 13, and stopped the prompt subject from losing diacritics and symbols.
- **Evals:** harness protocol v2 (no expected-behavior leakage to the candidate, strict structured judge with verbatim-quote verification, deterministic prompt-injection canary), provider-neutral runner with cost limits, error taxonomy, bounded retries and partial-result persistence, run and baseline schema v2, fail-closed baseline acceptance, `npm run eval:report`, and the curated `npm run eval:baseline-smoke` manifest (27 entries, 49 fixtures). The golden baseline moved to `evals/baselines/v2.4.json` and is still empty: no live eval has been run.
- **Sources:** `npm run sources:check` (offline structural mode and online metadata checker with a committed metadata snapshot); corrected four moved or broken URLs, removed one redirect duplicate, added OWASP ASVS 5.0.0, NICE NG5 and IVSC standards.
- **Build and CI:** `npm run build` no longer regenerates generated files before checking them, so stale files fail the build; regenerated indexes (they still reported version 2.0.0), category READMEs and README statistics artwork (it still showed 200 prompts). `npm run validate` now includes `npm test` and the offline source check. CI runs on Node 24; a weekly source-freshness workflow was added.

### Added

- Hand-authored concrete inputs for all 49 curated smoke fixtures (`evals/cases/`, 27 files, fictional material with planted facts and 1-4 case-specific assertions each). The candidate receives only the concrete input; the judge sees it separately (harness protocol v3). `validate-v2` enforces one case per curated fixture.

- Serbian titles for all 200 IT and Business prompts (previously English), in the catalog, front matter and H1, plus seven in-body references; `validate-v2` now rejects a Serbian title identical to the English one.
- Browser verification of the 31 sources that block automated clients (`scripts/v2-source-manual-verification.json`, 180-day validity): 26 verified, an FTC page returning 404 replaced, the retired COPE Core Practices replaced by the 2026 COPE Code of Conduct, ten redirecting URLs moved to their canonical pages, and five unesco.org pages recorded as unreachable.

### Removed

- `scripts/upgrade-prompts-v2.mjs` (could materialize a frozen copy of the v2 layer into all raw files; its post-check still required version 2.0.0) and `scripts/lib/eval-runtime.mjs` (replaced by `scripts/lib/eval/`).

### Fixed

- UPL-IT-004 (Serbian): the file was truncated mid-sentence. Completed the final quality gate and the closing `KONAČNO PRAVILO` section from the English text.
- UPL-IT-045 and UPL-IT-046 (English): restored code fences that a `\t` escape had mangled into a single backtick (18 lines).
- UPL-IT-036 (English): restored the `..\..\file` example, whose `\f` had become a form-feed control character.
- UPL-IT-047 (Serbian): removed leaked editor/agent metadata (a local path, a timestamp and a cursor position) from the end of the file.
- All five pairs were bumped to version `1.0.1` in both languages. No other prompt body was changed.

### Added

- UPL-BIZ-091 to UPL-BIZ-100 (Investment, Valuation & Due Diligence), version `1.0.0`, status `stable`, in Serbian and English. The initial Business collection is now complete at 100 of 100 prompts, bringing the library to 200 unique prompts and 400 localized prompt files.
- UPL-BIZ-081 to UPL-BIZ-090 (Risk, Compliance & Business Resilience), version `1.0.0`, status `stable`, in Serbian and English. The Business collection now has 90 of 100 prompts available.
- UPL-BIZ-071 to UPL-BIZ-080 (Management, Leadership & Organization), version `1.0.0`, status `stable`, in Serbian and English. The Business collection now has 80 of 100 prompts available.
- UPL-BIZ-061 to UPL-BIZ-070 (Sales, Revenue & Pricing), version `1.0.0`, status `stable`, in Serbian and English. The Business collection now has 70 of 100 prompts available.
- UPL-BIZ-051 to UPL-BIZ-060 (Operations, Supply Chain & Procurement), version `1.0.0`, status `stable`, in Serbian and English. The Business collection now has 60 of 100 prompts available.
- UPL-BIZ-041 to UPL-BIZ-050 (Entrepreneurship & Business Models), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Business Model Audit, Startup Idea Feasibility Analysis, Business Model Canvas Deep Analysis, Unit Economics Audit, Product-Market Fit Evidence Audit, Startup Financial Runway Analysis, Founder Assumption Stress Test, Business Scalability Audit, Monetization Model Analysis and Startup Failure Mode Audit. The Business collection now has 50 of 100 prompts available.
- Premium static website generator for the full prompt library, including responsive landing pages, searchable EN/SR prompt browser, dedicated prompt pages, copy actions, sitemap, robots, manifest, Vercel deployment config, and website validation.
- UPL-BIZ-031 to UPL-BIZ-040 (Business Strategy & Competitive Analysis), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Business Strategy Audit, Competitive Landscape Analysis, Competitive Advantage Audit, SWOT Evidence-Based Analysis, PESTLE Strategic Analysis, Strategic Risk & Opportunity Analysis, Market Entry Strategy Analysis, Growth Strategy Audit, Strategic Initiative Prioritization and Business Strategy Stress Test. The Business collection now has 40 of 100 prompts available.
- **Economics, Finance & Business (`UPL-BIZ`) is catalogued:** ten subcategories of ten prompts, `UPL-BIZ-001` to `UPL-BIZ-100` (Initial Business Collection), with reserved IDs, titles and filenames, subcategory folders and README files in both languages, and Phase 2 in the roadmap.
- UPL-BIZ-021 to UPL-BIZ-030 (Economics & Market Analysis), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Economic Analysis, Macroeconomic Environment Analysis, Industry Economics Analysis, Market Size & Growth Analysis, Demand & Supply Analysis, Inflation & Cost Pressure Analysis, Interest Rate Impact Analysis, Exchange Rate Exposure Analysis, Economic Scenario & Sensitivity Analysis and Economic Data Quality & Interpretation Audit. Each prompt is standalone: the cross-references in UPL-BIZ-021 were replaced with short self-contained guidance. The Business collection now has 30 of 100 prompts available.
- UPL-BIZ-011 to UPL-BIZ-020 (Accounting, Reporting & Financial Control), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Accounting System Audit, General Ledger Forensic Audit, Revenue Recognition Audit, Expense & Cost Accounting Audit, Accounts Receivable Audit, Accounts Payable Audit, Financial Close Process Audit, Management Reporting Audit, Internal Financial Controls Audit and Accounting Anomaly & Misstatement Hunter. Each prompt is standalone: the cross-references in UPL-BIZ-011 were replaced with short self-contained checks. The Business collection now has 20 of 100 prompts available.
- UPL-BIZ-001 to UPL-BIZ-010 (Financial Analysis & Corporate Finance), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Financial Analysis, Financial Statement Forensic Analysis, Cash Flow & Liquidity Audit, Profitability & Margin Analysis, Working Capital Optimization, Budget & Forecast Audit, Financial Model Audit, Capital Allocation Analysis, Debt & Financing Structure Analysis and Corporate Finance Decision Analysis.
- UPL-IT-091 to UPL-IT-100 (Desktop, Game, Systems & Embedded), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Desktop Application Audit, Electron Application Audit, Python/PySide Application Audit, Windows Application Production Audit, Cross-Platform Compatibility Audit, Game Architecture Audit, Game Performance Audit, Embedded Software Reliability Audit, Memory & Resource Leak Hunter and Hardware/Software Integration Audit. **Phase 1 is complete: all 100 prompts of the Initial IT Collection are available in English and Serbian.**
- UPL-IT-081 to UPL-IT-090 (UX, UI & Product Development), version `1.0.0`, status `stable`, in Serbian and English: Ultimate UX/UI Product Audit, Critical User Flow Audit, Onboarding Audit, Form UX Audit, Navigation & Information Architecture Audit, Mobile UX Audit, Design System Consistency Audit, Accessibility Experience Audit, Product Requirement Generator and Feature Design & UX Review. The IT collection now has 90 of 100 prompts available.
- UPL-IT-071 to UPL-IT-080 (Testing, QA & Reliability), version `1.0.0`, status `stable`, in Serbian and English: Ultimate Test Suite Audit, Missing Test Coverage Hunter, Flaky Test Hunter, Regression Test Generator, End-to-End Test Plan Generator, Edge Case Generator, Adversarial User Testing, Reliability & Failure Mode Audit, Race Condition & Concurrency Hunter and Production Incident Simulation. The IT collection now has 80 of 100 prompts available.
- UPL-IT-061 to UPL-IT-070 (AI, LLM & Automation), version `1.0.0`, status `stable`, in Serbian and English: Ultimate AI Application Audit, RAG System Forensic Audit, Hallucination & Grounding Audit, Prompt Injection Security Audit, AI Agent Architecture Audit, AI Agent Reliability Audit, System Prompt Optimization, n8n / Workflow Automation Audit, LLM Cost & Latency Optimization and AI Model Selection & Evaluation. The IT collection now has 70 of 100 prompts available.
- Structural EN/SR parity checks in `npm run validate:translations`: numbered sections (reporting which ones are missing), heading outline, key sections, code fences, and length relative to the collection's median ratio. They are reported as warnings with a summary; `--details` prints every pair.
- Content hygiene checks in `npm run validate:prompts`: control characters and leaked editor/agent context are errors, and mangled code fences and invisible characters are warnings.
- Anchor validation in `npm run validate:links` for links into Markdown files (GitHub heading slugs and explicit ids).
- `npm run audit:prompts`, a diagnostic content audit (size distribution, outliers, detected design elements).
- `docs/translation-parity-report.md` and `docs/prompt-quality-audit.md`.
- Documentation of status semantics (`stable` is not a certification), the display labels, versioning and the translation version rule, ID and slug permanence, deprecation and deletion policy, the generated-file policy, local-first validation, tooling safety, and notes on future metadata and high-stakes categories.
- Bilingual folder structure `prompts/<language>/<category>/<subcategory>/NNN-slug.md` for English and Serbian (Latin).
- Foundation for all ten categories, each with English and Serbian README files and a reserved ID prefix (`UPL-IT`, `UPL-BIZ`, `UPL-LAW`, `UPL-HEALTH`, `UPL-EDU`, `UPL-SCI`, `UPL-CAREER`, `UPL-MKT`, `UPL-PROD`, `UPL-CREATIVE`).
- Ten IT subcategories with English and Serbian README files.
- Stable, language-independent prompt IDs and YAML front matter (`id`, `number`, `slug`, `title`, `category`, `category_id`, `subcategory`, `subcategory_id`, `language`, `version`, `status`).
- `catalog.json` as the planning source of truth, including all 100 prompts of the Initial IT Collection (`UPL-IT-001` to `UPL-IT-100`); prompts 061-100 are planned and have reserved IDs, titles and filenames.
- Generated indexes: `indexes/prompts.json`, `indexes/prompts.en.json`, `indexes/prompts.sr.json` and `indexes/stats.json`.
- Validation and generation scripts (`npm run validate`, `npm run generate`) and a GitHub Actions validation workflow.
- Documentation: English and Serbian README, contributing guides, categories, prompt format and roadmap; translation guide, ID rules and architecture overview.
- `LICENSE` (MIT, as previously stated in the README), `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates and a pull request template.

### Changed

- `npm run validate:translations` compares each pair's SR/EN length ratio with the median of its own subcategory (at least 5 complete pairs, otherwise the collection median). Writing style, and therefore the ratio, is consistent within a subcategory but not across the collection; the translation guide explains the method.
- UPL-IT-010 and UPL-IT-012 (English and Serbian, `1.0.0` -> `1.1.0`): added an explicit SECOND PASS section before the final quality gate. UPL-IT-023 (`1.0.0` -> `1.1.0`): added an EVIDENCE MODEL section (tiers A-E mapped to CONFIRMED, LIKELY, THEORETICAL and NOT VERIFIED) and an Evidence tier field in the finding format. Following sections were renumbered. All 70 prompts now show every design signal in `npm run audit:prompts`.
- UPL-IT-066 and UPL-IT-070 (English and Serbian, `1.0.0` -> `1.1.0`): 066 gained its non-goals and priority order; 070 gained a P0-P4 severity scale for risks in the model choice and evaluation process (sections after it renumbered). `npm run audit:prompts` now also recognizes the "This is not:" / "Ovo nije:" non-goals list as a scope signal.
- UPL-IT-042 to UPL-IT-060 (English and Serbian, version `1.0.0`/`1.0.1` -> `1.1.0`): methodological expansion of the focused DevOps and Database prompts. IDs, filenames, output filenames, catalog entries and status are unchanged, and every prompt stays self-contained.
  - 045-049 and 052-059 were substantially expanded: objective and non-goals, context discovery, evidence tiers A-E, a status model (CONFIRMED, LIKELY, NOT VERIFIED, NOT APPLICABLE, CONTROLLED, HARDENING), explicit false-positive rules, domain-specific deep sections, relevant matrices, a finding format with the minimum fields, domain-specific P0-P4 severity, an adversarial second pass, a final quality gate and additional failure chains.
  - 042, 043, 044, 050, 051 and 060 gained a compact section with the missing status model and false-positive rules (and the evidence tier scale or full P0-P4 range where it was missing), plus Status and Evidence tier fields in their finding formats.
  - Provider limits, prices and version-specific defaults are left to verification instead of being hard-coded; the cross-reference "Prompt 38" in UPL-IT-045 was replaced by self-contained text; UPL-IT-057 (Serbian) "Same." became "Isto."; blank lines inside tables and code blocks of the revised files were removed.
- `npm run audit:prompts` also recognizes "not verified" as the unconfirmed side of the confirmed-vs-theoretical signal.
- `docs/prompt-quality-audit.md` and `docs/translation-parity-report.md` describe the state after the revision.
- `npm run check` was renamed to `npm run validate:generated`. `npm run validate` remains the single command that runs every check.
- Stale generated files are reported with the exact command that regenerates them.
- The README no longer shows a CI status badge, because cloud Actions are optional and not relied upon. The workflow now runs `npm run validate` and pins `actions/checkout` and `actions/setup-node` to full commit SHAs (v4.4.0).
- The README explains the status labels and that Available does not mean expert-certified, describes what a UPL prompt is, and features UPL-IT-001.
- CONTRIBUTING (English and Serbian) and the pull request template describe the local validation workflow, the EN/SR parity rules and the updated checklist.
- Redesigned the English and Serbian READMEs in a restrained monochrome style: generated hero banner and live statistics card (light and dark variants, embedded Inter and JetBrains Mono fonts under the SIL OFL 1.1), centered sections and generated category and progress tables.

- Moved the 60 existing IT prompt pairs from the repository root (`<slug>.md` = Serbian, `<slug>.en.md` = English) into the new structure as `NNN-<slug>.md` in both language trees. Prompt bodies were not changed; one extra trailing blank line was removed from the English OWASP Vulnerability Hunter.
