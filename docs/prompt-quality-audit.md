# Prompt Quality Audit

A high-level consistency audit of the 60 available prompts of the Initial IT Collection, done before work on UPL-IT-061 to UPL-IT-100 begins, and updated after the methodological expansion of the focused prompts (UPL-IT-042 to UPL-IT-060). It looks for anomalies, not rankings. Size is never used as a quality score: a short, focused prompt can be excellent, and no prompt is expected to reach a particular length.

The data comes from `npm run audit:prompts` (a diagnostic script that never fails) and `npm run validate:translations -- --details`. Rerun them to see the current state. Design elements are detected with simple keyword signals in English or Serbian; "not detected" means the signal was not found, not that the prompt is deficient.

Terms used: **exhaustive** (a long specification with hundreds of numbered sections), **focused** (a compact checklist), **structural outlier**, **translation outlier** and **review candidate**.

## Summary

- 60 prompts, 120 files, 2.15 MB of English and 1.82 MB of Serbian body text.
- All 60 prompts have an objective, a severity model and an output or finding format.
- The collection has two clear styles:
  - **Exhaustive (UPL-IT-001 to UPL-IT-041):** 30-70 KB per prompt, 120-364 headings, numbered sections as `#` headings, and nearly every design element present.
  - **Focused (UPL-IT-042 to UPL-IT-060):** 13-23 KB per prompt, 61-162 headings, numbered sections as `##` headings, written as specialist checklists with an explicit methodology (see [below](#focused-prompts-after-the-expansion)).
- Five technical defects were found and fixed during this pass (see the [translation parity report](translation-parity-report.md#defects-found-and-fixed)). No prompt was rewritten, shortened or artificially extended.

## Size distribution

KB of body text (front matter excluded): min / median / max.

| Scope | Prompts | EN | SR |
|---|:---:|:---:|:---:|
| All | 60 | 13.4 / 37.9 / 70.3 | 10.5 / 35.8 / 50.0 |
| Web Development | 10 | 29.9 / 34.4 / 50.0 | 26.1 / 30.5 / 41.4 |
| Mobile Development | 10 | 41.0 / 54.2 / 70.3 | 33.8 / 41.5 / 50.0 |
| Backend & API | 10 | 37.0 / 42.1 / 67.3 | 34.8 / 36.6 / 44.0 |
| Cybersecurity | 10 | 34.5 / 46.5 / 58.5 | 32.6 / 40.0 / 44.7 |
| DevOps, Cloud & Infrastructure | 10 | 13.4 / 19.9 / 42.2 | 11.6 / 19.4 / 38.0 |
| Databases & Data Engineering | 10 | 14.7 / 17.7 / 21.1 | 10.5 / 15.7 / 19.3 |

No prompt is more than 50% smaller than the median of its own subcategory, so there are no size outliers within a subcategory. The size difference lies between subcategories: DevOps and Databases are written in the focused style. The expansion made them larger because methodology was added where it was missing, not to approach the size of the exhaustive prompts.

## Strong patterns

Detected coverage across all 60 prompts:

| Design element | Prompts |
|---|:---:|
| Objective | 60 / 60 |
| Severity model (P0-P4 or equivalent) | 60 / 60 |
| Output or finding format | 60 / 60 |
| Final quality gate | 60 / 60 |
| Explicit scope or limits | 60 / 60 |
| False-positive guard | 60 / 60 |
| Confirmed vs theoretical (or not verified) distinction | 60 / 60 |
| Evidence model | 59 / 60 |
| Second pass | 58 / 60 |

The "confirmed vs theoretical" signal also accepts "not verified", the status the focused prompts use for unproven findings.

In the exhaustive prompts (001-041) these principles are consistently present: evidence over assumptions, confirmed vs theoretical, false-positive resistance, understanding the actual architecture before reporting findings, severity tied to impact, an explicit output format, a second pass and a final quality gate. Only three of these 41 prompts miss a single signal:

| ID | Title | Not detected | Note |
|---|---|---|---|
| UPL-IT-010 | Browser Compatibility & Production Bug Hunter | second pass | Has a final quality gate |
| UPL-IT-012 | Jetpack Compose Deep Audit | second pass | Has a final quality gate |
| UPL-IT-023 | API Contract Consistency Audit | evidence model (by keyword) | Has confirmed vs theoretical and 14 second-pass headings |

UPL-IT-001 remains a good reference for the library's principles (*accuracy > depth > finding count*), without every prompt needing to copy its structure.

## Focused prompts after the expansion

Before the expansion, most focused prompts (042-060) had an objective, a severity model, a finding format and a second pass, but stated the evidence rules only inside individual checks. The expansion closed the methodological gaps in all 19 prompts (version 1.1.0 in both languages) without changing IDs, filenames, output filenames or the prompt's focus:

- **Substantially expanded (045-049, 052-059):** objective and non-goals, context discovery (stack, version, provider), an evidence model (tiers A-E), a status model (CONFIRMED, LIKELY, NOT VERIFIED, NOT APPLICABLE, CONTROLLED, HARDENING), explicit false-positive rules, domain-specific deep sections, relevant matrices, a finding format with the minimum fields, a domain-specific P0-P4 severity, an adversarial second pass, a final quality gate and additional failure chains.
- **Compact methodology section (042, 043, 044, 050, 051, 060):** these already had most of the method; they gained the missing status model, false-positive rules and, where needed, the evidence tier scale (043, 051, 060) or the full P0-P4 range (043, 044), plus the Status and Evidence tier fields in the finding format.

Every prompt still stands on its own: the shared ideas are repeated in domain terms, not referenced across prompts, and provider limits, prices and version-specific defaults are left to verification rather than hard-coded.

| ID | Title | EN KB before | EN KB after | Numbered sections before | after |
|---|---|:---:|:---:|:---:|:---:|
| UPL-IT-042 | Docker Production Audit | 14.3 | 15.7 | 105 | 106 |
| UPL-IT-043 | Kubernetes Production Audit | 11.1 | 13.4 | 103 | 104 |
| UPL-IT-044 | GitHub Actions Forensic Audit | 11.9 | 13.8 | 106 | 107 |
| UPL-IT-045 | CI/CD Pipeline Audit | 7.9 | 21.5 | 94 | 111 |
| UPL-IT-046 | Vercel Production Audit | 7.9 | 22.4 | 89 | 108 |
| UPL-IT-047 | Cloud Infrastructure Audit | 8.3 | 20.8 | 89 | 106 |
| UPL-IT-048 | Environment Configuration Audit | 7.6 | 19.0 | 91 | 106 |
| UPL-IT-049 | Zero-Downtime Deployment Audit | 8.5 | 22.6 | 95 | 112 |
| UPL-IT-050 | Backup, Disaster Recovery & Rollback Audit | 16.8 | 18.3 | 145 | 146 |
| UPL-IT-051 | Ultimate Database Audit | 13.7 | 15.6 | 126 | 127 |
| UPL-IT-052 | Database Schema & Data Model Audit | 8.6 | 20.8 | 91 | 107 |
| UPL-IT-053 | SQL Performance Hunter | 7.7 | 15.2 | 82 | 93 |
| UPL-IT-054 | Database Index Audit | 5.8 | 19.9 | 54 | 68 |
| UPL-IT-055 | Database Migration Safety Audit | 6.2 | 17.6 | 58 | 71 |
| UPL-IT-056 | Data Integrity Audit | 5.7 | 18.1 | 57 | 73 |
| UPL-IT-057 | Transaction & Concurrency Audit | 6.9 | 21.1 | 76 | 94 |
| UPL-IT-058 | N+1 & Expensive Query Hunter | 4.7 | 14.7 | 45 | 59 |
| UPL-IT-059 | ORM Forensic Audit | 7.5 | 17.8 | 77 | 90 |
| UPL-IT-060 | ETL & Data Pipeline Reliability Audit | 13.2 | 15.0 | 132 | 133 |

UPL-IT-041 (the DevOps flagship, 42 KB) follows the exhaustive style and was not part of this pass.

## Translation parity

All 60 pairs have identical numbered sections and heading outlines. Two review candidates remain (UPL-IT-004 and UPL-IT-020, both about code-block formatting or extra English examples). The new methodology sections of 042-060 are fully translated; older checklist sections of 051-060 remain terser in Serbian than in English. Details are in the [translation parity report](translation-parity-report.md).

## Potential future improvements

These are review candidates for future content revisions. They are not done in this pass, because this pass does not rewrite prompt bodies.

1. ~~**Evidence block for focused prompts (042-060).**~~ Done in version 1.1.0 of all 19 prompts (see [above](#focused-prompts-after-the-expansion)).
2. **UPL-IT-020 examples in Serbian.** Port the additional English code examples into the Serbian file (MINOR revision).
3. **Matrix template rendering.** A blank line between header and delimiter keeps empty matrix templates from rendering as tables on GitHub (70 files at the time of the hardening pass; after their 1.1.0 revision, no file among 042-060 has it). This could be fixed in a dedicated formatting-only PATCH pass if GitHub rendering matters. It does not affect the prompt given to a model.
4. **Classification.** If filtering by style becomes useful for the website, optional `type` (audit, hunter, generator) and `depth` (exhaustive, focused) fields are documented as possible future metadata in [architecture.md](architecture.md#future-metadata-evolution). They are not added now.

## No-action-needed observations

- **Length differences are expected.** Different languages and writing styles produce different lengths; the two styles in this collection are intentional.
- **Repetition between prompts is intentional.** Every prompt must be usable on its own, so shared ideas (severity scales, quality gates) are repeated rather than included from shared files.
- **"Isto." / "Same." sections** are an authoring convention meaning "apply the same check as the previous section". They are clear in context.
- **Broad and narrow prompts coexist.** The "Ultimate ..." prompts are the broadest audits of their subcategory. They are not always the largest files (for example, UPL-IT-020 is larger than UPL-IT-011), which is fine, because scope and size are different things.
