# Contributing to Ultimate Prompt Library

English | [Srpski](CONTRIBUTING.sr.md)

Thank you for helping build an open library of deep, production-grade prompts. This guide explains how to propose, write, improve and translate prompts, and what a pull request must satisfy.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

| I want to… | Start with |
|---|---|
| Suggest a new prompt | A **Prompt suggestion** issue |
| Write a prompt that is already planned | An issue or pull request that references the planned ID |
| Improve an existing prompt | A pull request (or an issue first, for large changes) |
| Report a factual or technical error in a prompt | A **Bug report** issue |
| Add or fix a translation | A **Translation issue** or a pull request |
| Propose a new category or subcategory | A **Prompt suggestion** issue describing the area |
| Fix tooling or documentation | A pull request |

## Before you start

1. **Check for duplicates.** Look at the [catalog](catalog.json), the [roadmap](docs/roadmap.md), the category READMEs and open issues. If a prompt on the same topic exists or is planned, improve or claim that one instead of creating a new one.
2. **Read the format.** [docs/prompt-format.md](docs/prompt-format.md) defines front matter, filenames, statuses and versioning. [docs/ids.md](docs/ids.md) explains IDs.
3. **Set up the tooling** (Node.js 18 or newer):

   ```bash
   npm ci
   npm run validate
   ```

## Local validation comes first

The repository includes automated validation tooling that runs locally. **Run it before every pull request**; cloud CI is configured but not currently relied upon, so a pull request is not guaranteed to be checked automatically.

```bash
npm ci               # install the single tooling dependency
npm run generate     # after changing prompts, the catalog or scripts
npm run validate     # must finish with 0 errors
```

- `npm run validate` checks prompts, translations, links and generated files. Errors must be fixed; warnings are review signals.
- `npm run validate:translations -- --details` shows the EN/SR structural comparison for every prompt.
- Generated files (indexes, README tables, artwork) are never edited by hand. The scripts do not commit; review the diff and commit generated files together with your change.

## Writing a planned prompt

Planned prompts already have a reserved ID, number, slug, title and subcategory in [`catalog.json`](catalog.json) - for example `UPL-IT-061 ultimate-ai-application-audit`.

1. Open an issue (or comment on an existing one) saying you are working on the ID, to avoid duplicated effort.
2. Create the files at the reserved paths, e.g.:

   ```text
   prompts/en/01-it-programming-technology/07-ai-llm-automation/061-ultimate-ai-application-audit.md
   prompts/sr/01-it-programiranje-tehnologija/07-ai-llm-automation/061-ultimate-ai-application-audit.md
   ```

3. **Use the reserved ID.** Never assign a different ID to a planned prompt.
4. Start with `status: draft` or `review`. A prompt becomes `stable` only after review and when it exists in **both** English and Serbian.

## Proposing a new prompt

If the prompt is not on the roadmap:

1. Open a **Prompt suggestion** issue: the problem it solves, who it is for, scope and non-goals, and how it differs from existing prompts.
2. Wait for the proposal to be accepted. An ID is then assigned by appending an entry with the next free number to the category's `prompts` list in `catalog.json` (this can be done in your pull request once agreed).
3. Write the prompt following the steps above.

Do not pick an ID on your own before the proposal is discussed - IDs are permanent.

## Improving an existing prompt

- Keep the **ID, number, slug and filename** unchanged.
- If the change affects **logical coverage** (checks, sections, scenarios, examples, rules), update **both languages** in the same pull request where possible.
- If only one localization can be updated, bump its version and set the prompt to `status: review`, or open a follow-up translation issue that references the prompt ID.
- Bump `version` in both files according to [versioning rules](docs/prompt-format.md#versioning): PATCH for wording and defect repairs, MINOR for new checks or sections, MAJOR for fundamental changes.
- Keep each prompt self-contained. Do not rewrite a prompt only to match the style of another prompt.
- If a prompt becomes obsolete, mark it `status: deprecated` (and set `replaced_by` if there is a replacement) instead of deleting it.

## Reporting a factual problem

Open a **Bug report** issue with the prompt ID, language, the exact passage, what is wrong, and a source or explanation. Factual fixes must be applied to all language versions.

## Translations

Follow the [translation guide](docs/translation-guide.md). In short: keep the structure, keep code and identifiers untouched, keep technical terms in English where that is natural, preserve severity semantics, and do not publish unreviewed machine translation as `stable`.

## Proposing a new category or subcategory

Open an issue describing the area, the audience, a few example prompts and how it fits the existing [categories](docs/categories.md). Category and subcategory definitions live in `catalog.json`; see [architecture.md](docs/architecture.md#adding-a-subcategory-or-category) for the mechanics.

## Pull request checklist

A pull request must satisfy:

- [ ] Prompt ID unchanged
- [ ] Filename and path unchanged, unless the change is intentional and documented
- [ ] Front matter valid
- [ ] EN/SR parity considered (both languages updated, or the prompt set to `review` / a follow-up issue opened)
- [ ] Version bumped if the content changed
- [ ] No other prompt modified accidentally
- [ ] Generated indexes, tables and artwork are current (`npm run generate`)
- [ ] Local validation passes (`npm run validate`)

The [pull request template](.github/PULL_REQUEST_TEMPLATE.md) contains this checklist.

## Security prompts

Prompts in the cybersecurity area are for defensive review, authorized testing, secure development and threat modeling. Contributions that aim at attacking systems without authorization will not be accepted. See [SECURITY.md](SECURITY.md).

## Authorship and licensing

Contributions are published under the [MIT License](LICENSE). The optional `authors` front matter field may list real contributors who agree to be named; do not add names on someone else's behalf.
