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
| `draft` | Work in progress. May exist in only one language. |
| `review` | Complete and waiting for review. May exist in only one language. |
| `stable` | Reviewed and ready to use. **Must exist in every supported language.** |
| `deprecated` | Kept for reference but no longer recommended. Set `replaced_by` if a replacement exists. |

Prompts are not deleted just because they are outdated. Mark them `deprecated` first so links and IDs keep working.

## Versioning

Each localized file has its own `version`, using semantic-like versioning:

| Bump | When |
|---|---|
| **PATCH** (`1.0.0` → `1.0.1`) | Typos, formatting, wording clarifications. Behavior of the prompt does not change. |
| **MINOR** (`1.0.0` → `1.1.0`) | New checks, sections or examples; meaningful expansion that stays compatible with the prompt's purpose. |
| **MAJOR** (`1.0.0` → `2.0.0`) | Fundamental restructuring or a change in what the prompt does or how its output is used. |

The English and Serbian versions of the same prompt should carry the **same version**. `npm run validate:translations` reports a warning when they differ, which is acceptable only briefly (for example while a translation update is in review).

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

These conventions are checked automatically where practical. Tooling never rewrites prompt bodies; it only reads metadata and generates indexes.

## Content policy

Each prompt is a self-contained artifact. Do not change a prompt only to make its style match another prompt. Improvements should make the prompt more correct, deeper or clearer for its own purpose, and must be mirrored in every language version.
