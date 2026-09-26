# Prompt Format

English | [Srpski](prompt-format.sr.md)

This document defines the file format every prompt must follow and the recommended structure of the prompt body. The file format is enforced by `npm run validate:prompts`; the body structure is a guideline.

## File location and name

```text
prompts/<language>/<category-folder>/<subcategory-folder>/NNN-kebab-case-slug.md
```

- `<language>` is a language code from [`catalog.json`](../catalog.json) (`en`, `sr`).
- `<category-folder>` is the localized category folder for that language (for example `01-it-programming-technology` / `01-it-programiranje-tehnologija`).
- `<subcategory-folder>` is `NN-<subcategory_id>` and is **identical in every language**.
- `NNN` is the three-digit prompt number within its category (`001`-`999`).
- The slug is lowercase kebab-case (`a-z`, `0-9`, `-`).
- Every language version of a prompt uses **the same filename**.

Example:

```text
prompts/en/01-it-programming-technology/05-devops-cloud-infrastructure/042-docker-production-audit.md
prompts/sr/01-it-programiranje-tehnologija/05-devops-cloud-infrastructure/042-docker-production-audit.md
```

## Front matter

Every prompt file starts with YAML front matter, followed by a blank line and the prompt body.

```yaml
---
id: UPL-IT-035
number: 35
slug: secrets-and-credential-exposure-audit
title: Secrets & Credential Exposure Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---
```

### Required fields

| Field | Rule |
|---|---|
| `id` | `UPL-<CATEGORY>-NNN`; must equal `category_id` + `-` + zero-padded `number`. Permanent. See [ids.md](ids.md). |
| `number` | Integer 1-999; must match the `NNN` prefix of the filename. |
| `slug` | Kebab-case; must match the filename after `NNN-` and the slug registered in `catalog.json`. |
| `title` | Human-readable title. Should match the catalog title (a mismatch is reported as a warning). |
| `category` | Category display name in the file's language, exactly as in `catalog.json` (e.g. `IT, Programming & Technology` / `IT, programiranje i tehnologija`). |
| `category_id` | Category ID, identical in every language (e.g. `UPL-IT`). |
| `subcategory` | Subcategory display name in the file's language, exactly as in `catalog.json` (e.g. `Cybersecurity` / `Sajber bezbednost`). |
| `subcategory_id` | Subcategory machine slug, identical in every language; must match the subcategory folder. |
| `language` | Must match the language folder (`en` in `prompts/en/`, `sr` in `prompts/sr/`). |
| `version` | `MAJOR.MINOR.PATCH`, see [Versioning](#versioning). |
| `status` | One of `draft`, `review`, `stable`, `deprecated`. |

### Optional fields

| Field | Rule |
|---|---|
| `tags` | List of kebab-case strings, e.g. `[security, backend]`. |
| `replaced_by` | ID of the prompt that replaces a deprecated one, e.g. `UPL-IT-120`. |
| `updated` | Date of the last meaningful change, `YYYY-MM-DD`. Only add it when the date is known. |
| `authors` | List of author names or GitHub handles. Only add real, verifiable authors. |

Any other field is rejected by the validator, which protects against typos. Propose new fields through an issue.

### Statuses

| Status | Meaning |
|---|---|
| `draft` | The prompt is incomplete or actively being authored. May exist in only one language. |
| `review` | The prompt is structurally complete but still awaiting content, translation or factual review. May exist in only one language. Also use it when one localization is known to lag behind the other. |
| `stable` | The prompt is published, structurally complete and considered ready for general use. **Every supported language must exist.** |
| `deprecated` | The prompt remains available for history or compatibility but is no longer the recommended version. Set `replaced_by` if a replacement exists. |

**`stable` is not a certification.** It does not mean that a prompt has been independently audited, professionally guaranteed or is factually infallible. It means the prompt is complete, published and suitable for general use; results still depend on the model, the context and human review.

### Display labels

The READMEs and indexes show one label per catalog entry:

| Label | Meaning |
|---|---|
| **Available** | Prompt files exist (status `stable`). Available is not "expert-certified"; see above. |
| **In review** / **Draft** | Prompt files exist with status `review` / `draft`. |
| **Deprecated** | Prompt files exist with status `deprecated`. |
| **Planned** | The ID, title and filename are reserved in `catalog.json`, but no prompt file exists yet. Planned prompts are never counted as available. |

## Identity, paths and lifecycle

- **The ID never changes after publication**, even if the title is reworded. See [ids.md](ids.md).
- **Avoid slug and path changes after publication.** They break links and bookmarks, and the GitHub file tree cannot redirect. If a rename is unavoidable, document it in the changelog, move the file with `git mv` so history is preserved, update the catalog slug in the same commit and keep the ID.
- **Deprecate instead of deleting.** Keep the file and set `status: deprecated`, plus `replaced_by: UPL-...` when there is a replacement.
- **Deletion is exceptional.** A published prompt is not deleted lightly. If a prompt is found to be dangerous or incorrect, deprecate it and explain why in the prompt and the changelog. Its ID is never reused.

## Versioning

Versions use `MAJOR.MINOR.PATCH` and describe the **logical revision of a prompt**, shared by all of its languages:

| Bump | When |
|---|---|
| **PATCH** (`1.0.0` → `1.0.1`) | Typos, formatting, wording clarifications and repairs of technical defects (a broken code fence, a truncated ending, a stray artifact). No meaningful scope change. |
| **MINOR** (`1.0.0` → `1.1.0`) | New checks, sections or scenarios; meaningful content expansion that stays compatible with the prompt's purpose. |
| **MAJOR** (`1.0.0` → `2.0.0`) | Fundamental restructuring, changed methodology or changed expected behavior or output. |

### Translation version rule

- The English and Serbian files of a prompt **should carry the same version when they represent the same content revision**. When a change is applied to both languages, bump both to the same new version, even if one file only needed a smaller edit.
- If only one localization can be updated, bump that file and either set the prompt to `status: review` until the other language catches up, or open a follow-up translation issue. `npm run validate:translations` reports the version difference as a **warning**, not an error, so an intentional translation lag does not block work.
- Do not bump a version without a content change.

## Recommended body structure

The following structure works well for analysis, audit and review prompts. **It is a guideline, not a rigid requirement.** Use the parts that serve the task: a creative writing prompt does not need P0-P4 severity, and a generator prompt may not need a finding format.

1. **Title** - a single `#` heading.
2. **Role / objective** - who the AI should act as and what it must achieve.
3. **Scope** - what is included.
4. **Non-goals** - what is explicitly out of scope.
5. **Methodology** - the order of work and how to explore the material.
6. **Checks** - concrete things to examine, grouped by area.
7. **Evidence** - what counts as proof versus hypothesis; how to cite files, lines, logs or data.
8. **Severity** - a clear scale (for example P0-P4) with definitions.
9. **Confidence** - how certain a finding is, and why.
10. **Finding format** - the exact fields each finding must contain.
11. **Matrices** - coverage tables that make gaps visible (e.g. endpoint × authorization rule).
12. **Second pass** - an adversarial re-check that looks for missed issues and false positives.
13. **Final quality gate** - conditions the output must satisfy before it is delivered.
14. **Output filename / deliverable** - where and in what shape the result is written.
15. **Concrete examples** - realistic examples of good findings or real failure patterns.

## Markdown conventions

- UTF-8 without BOM, LF line endings, exactly one newline at the end of the file.
- Fenced code blocks must be closed; use a longer fence (four backticks) when the block itself contains a three-backtick fence.
- Use relative links for anything inside the repository.
- Keep headings clean and hierarchical.

These conventions are checked automatically where practical. `npm run validate:prompts` also rejects artifacts that never belong in a prompt: control characters (usually an escape such as `\f` that was interpreted), leaked editor or agent context (for example `<ADDITIONAL_METADATA>` blocks), and warns about code fences that were mangled into a single backtick. Tooling never rewrites prompt bodies; it only reads metadata and generates indexes.

### Front matter strictness

Only the documented required and optional fields are accepted; any other field is an error, which catches typos such as `stauts`. New fields are added deliberately, through a documented change to this guide and the validator. Possible future optional fields are listed in [architecture.md](architecture.md#future-metadata-evolution); none of them is required today.

## Content policy

- **Every prompt is self-contained.** A user must be able to copy one file and use it on its own, so some repetition between prompts (evidence rules, severity scales, quality gates) is intentional. There are no shared includes or template inheritance.
- **Style is per prompt.** Do not change a prompt only to make its style match another prompt. Some prompts are exhaustive specifications with hundreds of sections, others are focused checklists; both are valid. Length is never a quality measure.
- **Improvements are mirrored.** Changes should make a prompt more correct, deeper or clearer for its own purpose and must be applied to every language version (see the translation version rule).
- **Reference principles.** UPL-IT-001 (Forensic Full Repository Audit) is a good reference for the library's principles, above all *accuracy over depth over finding count*, without every prompt needing to copy its structure.
