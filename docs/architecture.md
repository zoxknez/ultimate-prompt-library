# Architecture

This document explains how the repository is organized, where each piece of information lives and how the tooling fits together. The design goal is a library that can grow to 10 categories, 100+ subcategories, 1,000+ prompts and more languages without a fundamental reorganization - while staying plain Markdown plus metadata.

## Principles

- **Files are the database.** No backend, no database, no build framework. Prompts are Markdown files; everything else is derived.
- **One source of truth per fact.**

  | Source | Role | Holds |
  |---|---|---|
  | [`catalog.json`](../catalog.json) | **Planning taxonomy** | Categories, subcategories, and every catalogued prompt ID with its number, slug, subcategory and planned title. |
  | Prompt front matter | **Published prompt metadata** | For prompts that exist: title, version, status, language, optional tags and so on. Generated outputs always use these values, never the catalog title. |
  | [`indexes/`](../indexes/), [`assets/`](../assets/) artwork, generated Markdown blocks | **Generated outputs** | Derived by scripts. Never edited by hand. |

- **Language-independent identity.** IDs, numbers, slugs, subcategory folders and filenames are identical in every language. Only the language folder, the category folder name and display names are localized.
- **Honest counts.** A prompt is available only when its file exists with valid front matter. Planned prompts are catalog entries only; no placeholder files are created.

## Layout

```text
prompts/<lang>/<NN-category-folder>/<NN-subcategory_id>/<NNN-slug>.md
```

| Level | English example | Serbian example | Localized? |
|---|---|---|---|
| Language | `en` | `sr` | - |
| Category folder | `01-it-programming-technology` | `01-it-programiranje-tehnologija` | Yes |
| Subcategory folder | `04-cybersecurity` | `04-cybersecurity` | No |
| File | `035-secrets-and-credential-exposure-audit.md` | `035-secrets-and-credential-exposure-audit.md` | No |

Every category folder and every subcategory folder contains a `README.md` in the language of its tree. Category folders exist for all ten categories from the start, even without prompts.

## catalog.json

```jsonc
{
  "schemaVersion": 1,
  "project": { "name": "Ultimate Prompt Library", "shortName": "UPL", "idPrefix": "UPL" },
  "languages": [
    { "code": "en", "name": "English", "nativeName": "English", "primary": true },
    { "code": "sr", "name": "Serbian (Latin)", "nativeName": "Srpski (latinica)", "primary": false }
  ],
  "categories": [
    {
      "id": "UPL-IT",
      "order": 1,
      "slug": "it-programming-technology",
      "dirs": { "en": "01-it-programming-technology", "sr": "01-it-programiranje-tehnologija" },
      "names": { "en": "IT, Programming & Technology", "sr": "IT, programiranje i tehnologija" },
      "descriptions": { "en": "…", "sr": "…" },
      "subcategories": [
        { "id": "cybersecurity", "order": 4, "names": { "en": "Cybersecurity", "sr": "Sajber bezbednost" }, "descriptions": { … } }
      ],
      "prompts": [
        {
          "id": "UPL-IT-061",
          "number": 61,
          "slug": "ultimate-ai-application-audit",
          "subcategory": "ai-llm-automation",
          "title": { "en": "Ultimate AI Application Audit", "sr": "Ultimate AI Application Audit" }
        }
      ]
    }
  ]
}
```

Catalog prompt entries intentionally have **no status field**. Whether a prompt is available, and its status, comes from the prompt files; a catalog entry without files is "planned". This avoids keeping the same status in two places.

## Generated outputs

| Output | Produced by | Contents |
|---|---|---|
| `indexes/prompts.json` | `npm run index` | One entry per available prompt ID: number, slug, category, subcategory, status, version, languages, titles, per-language versions and file paths. |
| `indexes/prompts.<lang>.json` | `npm run index` | One entry per localized file, with localized category and subcategory names and the file path. |
| `indexes/stats.json` | `npm run stats` | Unique prompts, localized files, languages, counts per status, per-category and per-subcategory progress. `planned` is the number of catalogued IDs (available + not yet written); `remaining` is the part not yet written; `available` counts only prompts with files. |
| `<!-- UPL:BEGIN category-prompts -->` in category READMEs | `npm run index` | Full prompt tables (available and planned) grouped by subcategory. |
| `<!-- UPL:BEGIN subcategory-prompts -->` in subcategory READMEs | `npm run index` | `\| # \| Prompt \| EN \| SR \| Status \|` table. |
| `<!-- UPL:BEGIN roadmap-planned -->` in the roadmaps | `npm run index` | Planned prompts with their reserved IDs and future filenames. |
| `hero-badges`, `collection-stats`, `category-status`, `subcategory-status` in the root READMEs; `roadmap-progress` in the roadmaps | `npm run stats` | Badges with live counts, the statistics card, the category grid and the progress tables. |
| `assets/banner.<lang>.<theme>.svg`, `assets/stats.<lang>.<theme>.svg` | `npm run stats` | README artwork in `light` and `dark` variants per language, shown through `<picture>` so GitHub picks the variant that matches the viewer's theme. The statistics card is drawn from the same numbers as `stats.json`. Fonts (Inter and JetBrains Mono, SIL OFL 1.1, subset in `assets/fonts/` with their licenses) are embedded, and text is laid out with the glyph widths in `assets/fonts/metrics.json`. |

Indexes deliberately contain metadata only, not prompt bodies. They are small enough for client-side search and filtering, and a website can fetch a prompt's Markdown by its path when needed. Output is deterministic (no timestamps), so CI can detect stale files with a plain `git diff`.

### Generated file policy

- **Do not edit generated files manually.** This covers everything in `indexes/`, the SVG files in `assets/` (not the fonts) and every block between `<!-- UPL:BEGIN name … -->` and `<!-- UPL:END name -->` markers in READMEs and roadmaps. Text outside the markers is hand-written and never touched by the scripts.
- Change the source instead (`catalog.json`, prompt front matter, or the scripts) and run `npm run generate`.
- Scripts only write files; they never commit. Review the diff and commit generated files together with the change that caused them.
- `npm run validate` fails with `generated file is stale` when a generated file does not match its sources, and names the command that fixes it.
- Two consecutive runs of `npm run generate` without source changes produce no diff.

## Scripts

All scripts are plain Node.js (18+) ES modules. The only dependency is [`yaml`](https://www.npmjs.com/package/yaml), a mature YAML parser with no dependencies of its own, used to parse front matter reliably. There is no custom YAML parser, linter, formatter or test framework.

| Command | Script | Purpose |
|---|---|---|
| `npm run validate` | all validators below | **The one command to run before every commit or pull request.** Exit code 0 = no errors; warnings never fail the run. |
| `npm run validate:prompts` | `scripts/validate-prompts.mjs` | Catalog structure; folder layout; filenames; strict front matter (required fields, documented optional fields only); ID format; ID ↔ number ↔ filename ↔ slug consistency; language ↔ folder; category and subcategory names and IDs; duplicate IDs and slugs; unknown statuses; catalog numbering without gaps; UTF-8, LF, single final newline; control characters and leaked editor/agent context (errors); unclosed or mangled code fences and invisible characters (warnings). |
| `npm run validate:translations` | `scripts/validate-translations.mjs` | Metadata parity (errors): every `stable` prompt exists in all languages (`MISSING LANGUAGE PAIR`), identical id, number, slug, category and subcategory, corresponding paths. Revision parity (warnings): version or status differences, byte-identical bodies. Structural parity (warnings): numbered sections, heading outline, key sections, code fences and length relative to the collection median. `--details` prints the comparison for every pair. See the [translation guide](translation-guide.md#structural-parity-checks). |
| `npm run validate:links` | `scripts/validate-links.mjs` | Internal relative links in all Markdown files (outside code blocks), including HTML `href`, `src` and `srcset` attributes, point to existing files or folders; anchors into Markdown files resolve to a heading (GitHub slug rules) or an explicit `id`/`name`. |
| `npm run validate:generated` | both generators with `--check` | Fails if any generated file is stale. |
| `npm run generate` | `generate-index.mjs`, `generate-stats.mjs` | Regenerates indexes, README/roadmap tables, statistics and artwork (`npm run index` and `npm run stats` run the two halves). |
| `npm run audit:prompts` | `scripts/audit-prompts.mjs` | Diagnostic only, never fails: size distribution, size outliers and detected design elements per prompt, as Markdown. Used for [prompt-quality-audit.md](prompt-quality-audit.md). |

Scripts never modify prompt bodies. Generators refuse to run while structural validation has errors.

### Tooling safety

The scripts read repository-controlled Markdown, YAML and JSON only. They do not evaluate or execute prompt content or code blocks, do not build shell commands from file content, and do not fetch remote URLs (external links are skipped by the link validator; the only network access is `npm ci` installing the locked `yaml` package). YAML is parsed with the `yaml` library's default, non-executable schema.

## Validation: local first

**Local validation is the source of truth.** Contributors run:

```bash
npm ci
npm run validate
```

[`.github/workflows/validate.yml`](../.github/workflows/validate.yml) runs exactly the same `npm run validate` on pull requests and pushes to `main`/`master` when GitHub Actions is enabled. The project currently does not rely on cloud Actions execution (paid minutes), so a missing or failed cloud run is not a statement about repository correctness, and the README shows no CI status badge. The workflow uses read-only permissions and pins third-party actions to full commit SHAs.

## Adding a prompt

1. Make sure the ID exists in `catalog.json` (planned prompts already have one; new ideas go through an issue first).
2. Create the file at the reserved path in every language, with front matter as described in [prompt-format.md](prompt-format.md).
3. Run `npm run generate` and `npm run validate`, and commit the updated indexes and READMEs together with the prompt.

## Adding a subcategory or category

1. Propose it in an issue.
2. Add it to `catalog.json` (subcategory: `id`, `order`, `names`, `descriptions`; category: also `dirs` for every language). Never renumber or rename existing folders.
3. Create the folder with a `README.md` in every language, containing the generated-block markers (copy an existing README as a template).
4. Run `npm run generate` and `npm run validate`.

## Adding a language

1. Add the language to `languages` in `catalog.json`, plus `dirs`, `names`, `descriptions` and prompt `title` entries for it.
2. Create `prompts/<code>/` with all category and subcategory READMEs.
3. Add UI strings for the language in `scripts/lib/render.mjs` (English is used as a fallback).
4. Translate prompts; until every prompt exists in the new language, the missing ones must not be `stable` (or the new language is added only once translations are complete).

## Future metadata evolution

The front matter schema is intentionally small and strict. When new categories need it, optional fields may be added through a documented change to [prompt-format.md](prompt-format.md) and the validator, for example:

| Possible field | Purpose |
|---|---|
| `requires_current_sources` | The prompt must be used with current, dated sources (rates, regulations, guidelines). |
| `jurisdiction_sensitive` | Results depend on country, state or regulator. |
| `high_stakes` | Output can affect health, legal position or finances; the prompt must state limits and require professional review. |
| `type` / `depth` | Classification such as `audit` / `hunter` / `generator` and `exhaustive` / `focused`. |

None of these fields exists today and none is required for the IT collection. They are added only when a real prompt needs them, not preemptively.

### High-stakes categories

Health, Law and Finance prompts will need a stronger source and currentness model than the IT collection. Before the first prompt in these categories is published, their category READMEs and prompts should establish:

- **Health:** reliance on current evidence and guidelines, the population the evidence applies to, explicit uncertainty, source quality, and no diagnostic certainty where the evidence does not support it.
- **Law:** the jurisdiction and the date the analysis applies to, current law from official sources, and a clear distinction between the text of the law and its interpretation.
- **Finance:** date sensitivity, current market data and rates, explicit assumptions, jurisdiction and tax context, and risk and uncertainty.

## Future website

The repository is designed so a separate website can be built on top of it without changes to the content:

| Website feature | Data source |
|---|---|
| Category / subcategory filters | `catalog.json`, `categoryId` / `subcategory` in indexes |
| Search | `indexes/prompts.<lang>.json` (titles, categories, tags) |
| Language switch | shared `id` and identical relative paths per language |
| Prompt detail and copy button | Markdown file at `path` |
| Version and status | index entries |
| Permalinks | `id` (e.g. `/p/UPL-IT-035`), with the slug as a human-readable suffix |
| Planned prompts / roadmap | catalog entries without an index entry |
