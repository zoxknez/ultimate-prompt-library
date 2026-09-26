# Architecture

This document explains how the repository is organized, where each piece of information lives and how the tooling fits together. The design goal is a library that can grow to 10 categories, 100+ subcategories, 1,000+ prompts and more languages without a fundamental reorganization - while staying plain Markdown plus metadata.

## Principles

- **Files are the database.** No backend, no database, no build framework. Prompts are Markdown files; everything else is derived.
- **One source of truth per fact.**
  - [`catalog.json`](../catalog.json) is the **planning** source: categories, subcategories, and the list of prompt IDs with their numbers, slugs, subcategories and planned titles.
  - **Prompt front matter** is the source for **prompts that exist**: title, version, status, tags and so on.
  - Everything in [`indexes/`](../indexes/) and inside generated Markdown blocks is **derived** by scripts and must never be edited by hand.
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

Categories and subcategories also carry an `icon` (an emoji) used by the generated README grids and available to a future website.

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
| `hero-badges`, `collection-stats`, `category-status`, `subcategory-status` in the root READMEs; `roadmap-progress` in the roadmaps | `npm run stats` | Badges with live counts, the statistics card, the category card grid and the progress tables. |
| `assets/banner.<lang>.<theme>.svg`, `assets/stats.<lang>.<theme>.svg` | `npm run stats` | README artwork in `light` and `dark` variants per language, shown through `<picture>` so GitHub picks the variant that matches the viewer's theme. The statistics card is drawn from the same numbers as `stats.json`. |

Indexes deliberately contain metadata only, not prompt bodies. They are small enough for client-side search and filtering, and a website can fetch a prompt's Markdown by its path when needed. Output is deterministic (no timestamps), so CI can detect stale files with a plain `git diff`.

Generated Markdown blocks are delimited by `<!-- UPL:BEGIN name … -->` and `<!-- UPL:END name -->`. Text outside the markers is hand-written and never touched by the scripts.

## Scripts

All scripts are plain Node.js (18+) ES modules. The only dependency is [`yaml`](https://www.npmjs.com/package/yaml), a mature YAML parser with no dependencies of its own, used to parse front matter reliably.

| Command | Script | Purpose |
|---|---|---|
| `npm run validate:prompts` | `scripts/validate-prompts.mjs` | Catalog structure; folder layout; filenames; required and optional front matter; ID format; ID ↔ number ↔ filename ↔ slug consistency; language ↔ folder; category and subcategory names and IDs; duplicate IDs and slugs; unknown statuses; catalog numbering without gaps; UTF-8, LF, single final newline; unclosed code fences (warning). |
| `npm run validate:translations` | `scripts/validate-translations.mjs` | For every ID: all languages present for `stable` prompts (`MISSING LANGUAGE PAIR`); identical id, number, slug, category and subcategory; corresponding paths; version and status differences (warning); byte-identical bodies (warning). |
| `npm run validate:links` | `scripts/validate-links.mjs` | Internal relative links in all Markdown files (outside code blocks), including HTML `href`, `src` and `srcset` attributes, point to existing files or folders. Anchors (`#section`) are not verified. |
| `npm run index` | `scripts/generate-index.mjs` | Writes JSON indexes and navigation tables. `--check` only verifies they are current. |
| `npm run stats` | `scripts/generate-stats.mjs` | Writes `stats.json` and status blocks. `--check` only verifies they are current. |
| `npm run generate` | both generators | Regenerates everything. |
| `npm run validate` | all of the above in check mode | What CI runs. |

Scripts never modify prompt bodies. Generators refuse to run while structural validation has errors.

## Continuous integration

[`.github/workflows/validate.yml`](../.github/workflows/validate.yml) runs on every pull request and on pushes to `main`/`master`: it installs dependencies with `npm ci`, runs the three validators, regenerates all outputs and fails if that produces any uncommitted change.

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
