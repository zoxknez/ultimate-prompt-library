# Prompt Quality Audit

A high-level consistency audit of the 60 available prompts of the Initial IT Collection, done before work on UPL-IT-061 to UPL-IT-100 begins. It looks for anomalies, not rankings. Size is never used as a quality score: a short, focused prompt can be excellent, and no prompt is expected to reach a particular length.

The data comes from `npm run audit:prompts` (a diagnostic script that never fails) and `npm run validate:translations -- --details`. Rerun them to see the current state. Design elements are detected with simple keyword signals in English or Serbian; "not detected" means the signal was not found, not that the prompt is deficient.

Terms used: **exhaustive** (a long specification with hundreds of numbered sections), **focused** (a compact checklist), **structural outlier**, **translation outlier** and **review candidate**.

## Summary

- 60 prompts, 120 files, 1.98 MB of English and 1.65 MB of Serbian body text.
- All 60 prompts have an objective, a severity model and an output or finding format.
- The collection has two clear styles:
  - **Exhaustive (UPL-IT-001 to UPL-IT-041):** 30-70 KB per prompt, 120-364 headings, numbered sections as `#` headings, and nearly every design element present.
  - **Focused (UPL-IT-042 to UPL-IT-060):** 5-17 KB per prompt, 47-161 headings, numbered sections as `##` headings, written as compact checklists.
- Five technical defects were found and fixed during this pass (see the [translation parity report](translation-parity-report.md#defects-found-and-fixed)). No prompt was rewritten, shortened or artificially extended.

## Size distribution

KB of body text (front matter excluded): min / median / max.

| Scope | Prompts | EN | SR |
|---|:---:|:---:|:---:|
| All | 60 | 4.7 / 37.9 / 70.3 | 3.3 / 35.8 / 50.0 |
| Web Development | 10 | 29.9 / 34.4 / 50.0 | 26.1 / 30.5 / 41.4 |
| Mobile Development | 10 | 41.0 / 54.2 / 70.3 | 33.8 / 41.5 / 50.0 |
| Backend & API | 10 | 37.0 / 42.1 / 67.3 | 34.8 / 36.6 / 44.0 |
| Cybersecurity | 10 | 34.5 / 46.5 / 58.5 | 32.6 / 40.0 / 44.7 |
| DevOps, Cloud & Infrastructure | 10 | 7.6 / 9.8 / 42.2 | 6.5 / 8.5 / 38.0 |
| Databases & Data Engineering | 10 | 4.7 / 7.2 / 13.7 | 3.3 / 4.5 / 10.6 |

No prompt is more than 50% smaller than the median of its own subcategory, so there are no size outliers within a subcategory. The size difference lies between subcategories: DevOps and Databases were written in the focused style.

## Strong patterns

Detected coverage across all 60 prompts:

| Design element | Prompts |
|---|:---:|
| Objective | 60 / 60 |
| Severity model (P0-P4 or equivalent) | 60 / 60 |
| Output or finding format | 60 / 60 |
| Second pass | 57 / 60 |
| Final quality gate | 56 / 60 |
| Explicit scope or limits | 50 / 60 |
| Evidence model | 44 / 60 |
| False-positive guard | 42 / 60 |
| Confirmed vs theoretical distinction | 40 / 60 |

In the exhaustive prompts (001-041) these principles are consistently present: evidence over assumptions, confirmed vs theoretical, false-positive resistance, understanding the actual architecture before reporting findings, severity tied to impact, an explicit output format, a second pass and a final quality gate. Only four of these 41 prompts miss a single signal:

| ID | Title | Not detected | Note |
|---|---|---|---|
| UPL-IT-004 | Frontend Architecture Audit | confirmed vs theoretical | Uses evidence and dependency-flow requirements instead |
| UPL-IT-010 | Browser Compatibility & Production Bug Hunter | second pass | Has a final quality gate |
| UPL-IT-012 | Jetpack Compose Deep Audit | second pass | Has a final quality gate |
| UPL-IT-023 | API Contract Consistency Audit | evidence model (by keyword) | Has confirmed vs theoretical and 14 second-pass headings |

UPL-IT-001 remains a good reference for the library's principles (*accuracy > depth > finding count*), without every prompt needing to copy its structure.

## Structural outliers: the focused prompts

The focused prompts (042-060) consistently have an objective, a severity model, an output or finding format and, in most cases, a second pass. Less often, they state the evidence rules explicitly:

| ID | Title | EN KB | Headings | Not detected |
|---|---|:---:|:---:|---|
| UPL-IT-042 | Docker Production Audit | 14.3 | 107 | scope/limits, confirmed vs theoretical, false-positive guard |
| UPL-IT-043 | Kubernetes Production Audit | 11.1 | 105 | evidence model, confirmed vs theoretical |
| UPL-IT-044 | GitHub Actions Forensic Audit | 11.9 | 111 | confirmed vs theoretical, false-positive guard |
| UPL-IT-045 | CI/CD Pipeline Audit | 7.9 | 99 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard, second pass |
| UPL-IT-046 | Vercel Production Audit | 7.9 | 91 | evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-047 | Cloud Infrastructure Audit | 8.3 | 94 | evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-048 | Environment Configuration Audit | 7.6 | 93 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-049 | Zero-Downtime Deployment Audit | 8.5 | 97 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-050 | Backup, Disaster Recovery & Rollback Audit | 16.8 | 161 | confirmed vs theoretical, false-positive guard |
| UPL-IT-051 | Ultimate Database Audit | 13.7 | 128 | confirmed vs theoretical, false-positive guard |
| UPL-IT-052 | Database Schema & Data Model Audit | 8.6 | 96 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard, final quality gate |
| UPL-IT-053 | SQL Performance Hunter | 7.7 | 84 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-054 | Database Index Audit | 5.8 | 56 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-055 | Database Migration Safety Audit | 6.2 | 60 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard, final quality gate |
| UPL-IT-056 | Data Integrity Audit | 5.7 | 59 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard, final quality gate |
| UPL-IT-057 | Transaction & Concurrency Audit | 6.9 | 78 | evidence model, confirmed vs theoretical, false-positive guard, final quality gate |
| UPL-IT-058 | N+1 & Expensive Query Hunter | 4.7 | 47 | evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-059 | ORM Forensic Audit | 7.5 | 79 | evidence model, confirmed vs theoretical, false-positive guard |
| UPL-IT-060 | ETL & Data Pipeline Reliability Audit | 13.2 | 134 | scope/limits, evidence model, confirmed vs theoretical, false-positive guard |

These prompts are **focused**, not defective. They cover their domain with many precise checks and often carry evidence rules inside individual checks (for example "Client-side checks do not constitute data integrity enforcement" in UPL-IT-056), but they do not state the library-wide evidence model as a section of its own. UPL-IT-041 (the DevOps flagship, 42 KB) follows the exhaustive style.

## Translation parity

All 60 pairs have identical numbered sections and heading outlines. Two review candidates remain (UPL-IT-004 and UPL-IT-020, both about code-block formatting or extra English examples). The Serbian files in 051-060 are terse checklist notes that the English expands into sentences. Details are in the [translation parity report](translation-parity-report.md).

## Potential future improvements

These are review candidates for future content revisions. They are not done in this pass, because this pass does not rewrite prompt bodies.

1. **Evidence block for focused prompts (042-060).** Consider adding a short, prompt-specific evidence section (confirmed vs theoretical, what counts as proof, no invented findings) and a final quality gate where it is missing (052, 055, 056, 057). Do this as a MINOR revision in both languages, one prompt at a time, and only where it improves the prompt. It should not be a copied boilerplate block, since each prompt stays self-contained.
2. **UPL-IT-020 examples in Serbian.** Port the additional English code examples into the Serbian file (MINOR revision).
3. **Matrix template rendering.** A blank line between header and delimiter keeps empty matrix templates from rendering as tables on GitHub (70 files). This could be fixed in a dedicated formatting-only PATCH pass if GitHub rendering matters. It does not affect the prompt given to a model.
4. **Classification.** If filtering by style becomes useful for the website, optional `type` (audit, hunter, generator) and `depth` (exhaustive, focused) fields are documented as possible future metadata in [architecture.md](architecture.md#future-metadata-evolution). They are not added now.

## No-action-needed observations

- **Length differences are expected.** Different languages and writing styles produce different lengths; the two styles in this collection are intentional.
- **Repetition between prompts is intentional.** Every prompt must be usable on its own, so shared ideas (severity scales, quality gates) are repeated rather than included from shared files.
- **"Isto." / "Same." sections** are an authoring convention meaning "apply the same check as the previous section". They are clear in context.
- **Broad and narrow prompts coexist.** The "Ultimate ..." prompts are the broadest audits of their subcategory. They are not always the largest files (for example, UPL-IT-020 is larger than UPL-IT-011), which is fine, because scope and size are different things.
