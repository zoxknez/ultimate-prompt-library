# Changelog

All notable changes to Ultimate Prompt Library are documented in this file. Prompt-level changes are tracked through each prompt's `version` field; this changelog records repository-level changes and notable prompt additions.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

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

- Redesigned the English and Serbian READMEs: generated hero banner and live statistics card (light and dark variants), centered sections, card grids for categories, usage steps, contribution paths and quality principles, and emoji progress tables. Generated prompt tables now show status with icons.

- Moved the 60 existing IT prompt pairs from the repository root (`<slug>.md` = Serbian, `<slug>.en.md` = English) into the new structure as `NNN-<slug>.md` in both language trees. Prompt bodies were not changed; one extra trailing blank line was removed from the English OWASP Vulnerability Hunter.
