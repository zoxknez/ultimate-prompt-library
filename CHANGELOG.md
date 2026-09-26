# Changelog

All notable changes to Ultimate Prompt Library are documented in this file. Prompt-level changes are tracked through each prompt's `version` field; this changelog records repository-level changes and notable prompt additions.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- UPL-IT-004 (Serbian): the file was truncated mid-sentence. Completed the final quality gate and the closing `KONAČNO PRAVILO` section from the English text.
- UPL-IT-045 and UPL-IT-046 (English): restored code fences that a `\t` escape had mangled into a single backtick (18 lines).
- UPL-IT-036 (English): restored the `..\..\file` example, whose `\f` had become a form-feed control character.
- UPL-IT-047 (Serbian): removed leaked editor/agent metadata (a local path, a timestamp and a cursor position) from the end of the file.
- All five pairs were bumped to version `1.0.1` in both languages. No other prompt body was changed.

### Added

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
