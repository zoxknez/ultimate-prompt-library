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

## Versioning

- Both language versions should carry the same `version`.
- A change that affects behavior (new checks, changed rules) must be applied to both languages in the same pull request, with the same version bump.
- A translation-only fix (typo or wording in one language) is a PATCH bump of that file. Bringing the other language to the same version number is recommended when convenient; `npm run validate:translations` reports mismatches as warnings.

## Workflow

1. Find the prompt by ID in the [catalog](../catalog.json) or the category README.
2. Create or edit the file at the **same path** in the other language tree (only the language folder and the category folder name differ).
3. Copy the front matter and adjust `language`, `category` and `subcategory`.
4. Translate the body following the principles above.
5. Run `npm run validate` and `npm run generate`; commit the regenerated files.
6. Open a pull request using the template and mention the prompt ID.

## Reporting translation problems

Use the **Translation issue** template. Include the prompt ID, the language, the section and a quote of the problematic passage, and explain what is wrong (meaning, terminology, missing content, script).
