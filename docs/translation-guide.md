# Translation Guide

Ultimate Prompt Library publishes every stable prompt in **English** (primary) and **Serbian, Latin script**. This guide explains how to create and maintain translations so that both versions stay equivalent.

## Principles

1. **Preserve the structure.** Keep the same sections, headings, order, numbered lists, tables, matrices and code blocks. A reader must be able to compare both versions side by side.
2. **Preserve the meaning, not the words.** Translate naturally; do not produce word-for-word text that reads awkwardly.
3. **Keep established technical terminology in English where that is natural.** Terms such as *race condition*, *rate limiting*, *deployment*, *code review*, *false positive*, *evidence-first* or *production-ready* are commonly used untranslated by Serbian-speaking engineers. Use English terms when a Serbian equivalent would be unclear or unusual; use Serbian when it is equally precise and natural.
4. **Never translate code or identifiers.** Code blocks, file names, paths, commands, configuration keys, API names, HTTP headers, environment variables, log messages and placeholders (`<REPO_PATH>`, `{{input}}`) stay exactly as they are.
5. **Keep severity and confidence semantics identical.** Levels such as P0-P4, their definitions and thresholds must mean exactly the same in both languages. Do not soften or strengthen a rule in translation.
6. **Do not add or remove checks in only one language.** If a translation reveals a missing check or a mistake, fix it in **both** versions in the same pull request and bump the `version` of both files.
7. **Keep the metadata aligned.** Both files share the same `id`, `number`, `slug`, `category_id`, `subcategory_id` and filename. `category` and `subcategory` use the localized names from [`catalog.json`](../catalog.json). `title` currently stays in English in both languages.
8. **Use the Serbian Latin script** (`č`, `ć`, `š`, `ž`, `đ`), never Cyrillic, in the `sr` tree.

## Machine translation

Machine or AI translation may be used to produce a first draft, but it **must not be published as a final `stable` version without human review** by someone fluent in both languages and familiar with the subject. Reviewers should check terminology, meaning of every rule, severity definitions, lists and tables, and that no content was dropped.

## Keeping languages in step

- **Preserve the logical structure.** Keep the same numbered sections in the same order. Headings may be worded differently, but a section must not silently disappear or be merged into another one.
- **Code identifiers stay unchanged.** Code blocks can be formatted slightly differently (an example inline in one language and in a code block in the other), but their content and coverage should match.
- **Technical terms may remain in English** where that is natural for practitioners.
- **Synchronize significant expansion.** When a section gains new checks, scenarios or examples in one language, add them to the other language in the same pull request, or set the prompt to `status: review` and open a translation issue.
- **The version represents the logical revision.** Both files carry the same version when they contain the same revision of the prompt (see the [translation version rule](prompt-format.md#translation-version-rule)).
- **A parity warning is not a verdict.** It marks a review candidate. Different languages naturally differ in length and formatting.

## Structural parity checks

`npm run validate:translations` compares every EN/SR pair with deterministic, language-neutral signals (no AI or semantic comparison):

| Signal | Why it matters | Result |
|---|---|---|
| Missing language for a `stable` prompt, or different id, number, slug, category, subcategory or path | Broken pair | **Error** |
| Different version or status; byte-identical bodies | Revision out of step, or untranslated copy | Warning |
| Numbered sections (the set of section numbers, e.g. `1`, `2`, ... `132`) | A section exists only in one language | Warning, lists the missing numbers |
| Heading outline (H1-H4 counts) | Sections added, removed or re-levelled | Warning |
| Key sections (finding format, output, second pass, final quality gate, severity, evidence) detected by heading in only one language | A core part of the method is missing | Warning |
| Code fences, when they differ by at least 3 blocks and 5% | Examples or templates not kept in step | Warning (smaller differences are notes) |
| Length relative to the collection | One language substantially expanded while the other stayed old | Warning / strong warning |
| Tables, blockquotes | Formatting | Note only |

**How length is judged.** Serbian text in this collection is usually shorter than the English text of the same prompt, even when the structure is identical, and how much shorter depends on the writing style: in the older subcategories EN often expands terse Serbian notes into full sentences (a SR/EN ratio of about 0.8), while in newer subcategories both languages keep the same English technical terms (a ratio close to 1). A fixed threshold, or one median for the whole collection, would therefore flag normal pairs. The validator compares each pair with the median SR/EN ratio of its own subcategory (when the subcategory has at least 5 complete pairs, otherwise with the collection median) and warns when a pair deviates from that reference by 40% or more (strong warning at 60%). The raw character delta is still printed for context. The thresholds can be revisited as the collection grows.

Run `npm run validate:translations -- --details` to see the comparison for every pair. The current assessment is in [translation-parity-report.md](translation-parity-report.md).

## Versioning

- Both language versions should carry the same `version`.
- A change that affects behavior (new checks, changed rules) must be applied to both languages in the same pull request, with the same version bump.
- A translation-only fix (typo or wording in one language) is a PATCH bump. Bump the other language to the same version as well, so the pair keeps one version per logical revision; `npm run validate:translations` reports mismatches as warnings.

## Workflow

1. Find the prompt by ID in the [catalog](../catalog.json) or the category README.
2. Create or edit the file at the **same path** in the other language tree (only the language folder and the category folder name differ).
3. Copy the front matter and adjust `language`, `category` and `subcategory`.
4. Translate the body following the principles above.
5. Run `npm run generate` and `npm run validate`, review the structural parity warnings for the prompt, and commit the regenerated files.
6. Open a pull request using the template and mention the prompt ID.

## Reporting translation problems

Use the **Translation issue** template. Include the prompt ID, the language, the section and a quote of the problematic passage, and explain what is wrong (meaning, terminology, missing content, script).
