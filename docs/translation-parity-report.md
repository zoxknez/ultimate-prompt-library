# Translation Parity Report

Snapshot of the English/Serbian parity of the Initial IT Collection (UPL-IT-001 to UPL-IT-060), taken during the pre-061 hardening pass. The numbers come from `npm run validate:translations -- --details`; rerun it to see the current state. The method and thresholds are described in the [translation guide](translation-guide.md#structural-parity-checks).

A parity signal marks a **review candidate**. It does not mean a translation is wrong, and length alone is never treated as evidence of an incomplete translation.

## Summary

| Check | Result |
|---|---|
| Pairs checked | 60 |
| Metadata pairs valid (id, number, slug, category, subcategory, path, version, status) | 60 |
| Missing language pairs | 0 |
| Numbered sections identical in both languages | 60 of 60 |
| Heading outline (H1-H4) identical | 60 of 60 |
| Key sections present in both languages | 60 of 60 |
| Structural warnings after this pass | 2 (UPL-IT-004, UPL-IT-020, both code-block formatting) |
| Median SR/EN character ratio | 0.835 (raw length delta median 16.5%) |
| Largest deviation from the median ratio | 36.4% (UPL-IT-057), below the 40% warning threshold |

The structure of the collection is in very good shape: every one of the 60 pairs has exactly the same numbered sections in the same order. The differences that remain are about wording density and whether an example is shown inline or in a code block.

## Update: focused prompts 042-060 (version 1.1.0)

After the methodological expansion of UPL-IT-042 to UPL-IT-060, both languages of every pair were revised in the same change and carry the same version (`1.1.0`). The new sections (context discovery, evidence tiers, status model, false-positive rules, matrices, finding formats, second pass, quality gates and failure chains) are fully translated, with technical terms, field names and failure-chain code blocks kept in English in both languages.

| Check (current state) | Result |
|---|---|
| Numbered sections identical in both languages | 60 of 60 |
| Heading outline (H1-H4) identical | 60 of 60 |
| Structural warnings | 2 (UPL-IT-004, UPL-IT-020, unchanged) |
| Median SR/EN character ratio | 0.871 |
| Largest deviation among 042-060 | 24.6% (UPL-IT-060), below the 40% warning threshold |

The tables below remain the snapshot from the hardening pass; the per-pair numbers for 042-060 have changed since and can be regenerated with `npm run validate:translations -- --details`.

## Defects found and fixed

These were concrete technical defects rather than stylistic differences. Each fix is minimal, and the English source or the other language showed exactly what was intended. Both files of each affected prompt were bumped to version `1.0.1`.

| ID | Language | Defect | Fix |
|---|---|---|---|
| UPL-IT-004 | SR | File was truncated mid-sentence (`- svaki P`). The last three items of the FINAL QUALITY GATE and the whole closing rule were missing. All 59 other Serbian prompts end with `# KONAČNO PRAVILO`. | Completed the three items and the `# KONAČNO PRAVILO` section from the English text. The H1 outline is now 103 / 103. |
| UPL-IT-045 | EN | Eight code-fence lines were mangled by a `\t` escape: ```` ```text ```` had become a backtick, a TAB and `ext`, and closing fences had become a single backtick. The blocks rendered as plain text; code fences were 0 / 4. | Restored the fences. Code fences are now 4 / 4. |
| UPL-IT-046 | EN | Same mangling on ten lines; code fences were 0 / 5. | Restored the fences. Code fences are now 5 / 5. |
| UPL-IT-036 | EN | In the path-traversal example `..\..\file`, the `\f` had become a form-feed control character (`..\..<FF>ile`). | Restored `..\..\file`, matching the Serbian file. |
| UPL-IT-047 | SR | The end of the file contained leaked editor/agent context (`<ADDITIONAL_METADATA>`, a local Windows path, a timestamp and a cursor position) that would have been copied into every user's prompt. | Removed the block. |

`npm run validate:prompts` now reports these defect classes (control characters and leaked context as errors, mangled fences as warnings), so they cannot return unnoticed.

## Remaining review candidates

Sorted by priority: section mismatch, code-block mismatch, major length deviation, version mismatch, formatting.

| ID | EN chars | SR chars | Delta | Headings | Numbered | Code fences | Assessment |
|---|---:|---:|---:|:---:|:---:|:---:|---|
| UPL-IT-004 | 34,196 | 30,263 | 11.5% | 150 / 150 | 125 / 125 | 32 / 43 | **Formatting.** In §62-88 the Serbian file puts short examples in code blocks, for example `Axios + Redux` and `fetch + TanStack Query` in §83, where the English file writes them inline. The Serbian text sometimes keeps a nuance the English condenses (§83: "To nije automatski bug"). No section is missing. Optional: align the example formatting. |
| UPL-IT-020 | 71,813 | 50,746 | 29.3% | 322 / 322 | 311 / 311 | 51 / 48 | **English expansion.** The English file adds code examples in eight sections, for example an `android:debuggable="false"` XML snippet and an explicit impact sentence in §50, and generally expands explanations. The Serbian file has code blocks in five sections where the English writes the example inline. Every check exists in both languages, and the English is the more detailed rendition. Optional: port the extra English examples into Serbian and bump both to a MINOR version. |

## Length outliers

Pairs closest to the length threshold. All of them have identical headings, numbered sections and code blocks.

| ID | EN chars | SR chars | Delta | Deviation from median ratio | Headings | Numbered | Code fences |
|---|---:|---:|---:|---:|:---:|:---:|:---:|
| UPL-IT-057 | 7,069 | 4,330 | 38.7% | 36.4% | 78 / 78 | 76 / 76 | 5 / 5 |
| UPL-IT-059 | 7,632 | 4,831 | 36.7% | 32.0% | 79 / 79 | 77 / 77 | 5 / 5 |
| UPL-IT-055 | 6,340 | 4,021 | 36.6% | 31.7% | 60 / 60 | 58 / 58 | 3 / 3 |
| UPL-IT-021 | 68,705 | 44,582 | 35.1% | 28.8% | 302 / 302 | 295 / 295 | 59 / 61 |
| UPL-IT-060 | 13,522 | 8,831 | 34.7% | 27.9% | 134 / 134 | 132 / 132 | 4 / 4 |
| UPL-IT-056 | 5,810 | 3,813 | 34.4% | 27.3% | 59 / 59 | 57 / 57 | 3 / 3 |
| UPL-IT-019 | 68,346 | 45,112 | 34.0% | 26.6% | 320 / 320 | 313 / 313 | 59 / 62 |
| UPL-IT-053 | 7,875 | 5,303 | 32.7% | 24.1% | 84 / 84 | 82 / 82 | 4 / 4 |

## Focus: UPL-IT-051 to UPL-IT-060

This block has the largest average EN/SR length difference (median SR/EN ratio 0.66, against 0.86 for 001-041).

| ID | EN chars | SR chars | Delta | Headings | Numbered | Code fences |
|---|---:|---:|---:|:---:|:---:|:---:|
| UPL-IT-051 | 14,022 | 10,819 | 22.8% | 128 / 128 | 126 / 126 | 7 / 7 |
| UPL-IT-052 | 8,833 | 6,898 | 21.9% | 96 / 96 | 91 / 91 | 5 / 5 |
| UPL-IT-053 | 7,875 | 5,303 | 32.7% | 84 / 84 | 82 / 82 | 4 / 4 |
| UPL-IT-054 | 5,972 | 4,385 | 26.6% | 56 / 56 | 54 / 54 | 5 / 5 |
| UPL-IT-055 | 6,340 | 4,021 | 36.6% | 60 / 60 | 58 / 58 | 3 / 3 |
| UPL-IT-056 | 5,810 | 3,813 | 34.4% | 59 / 59 | 57 / 57 | 3 / 3 |
| UPL-IT-057 | 7,069 | 4,330 | 38.7% | 78 / 78 | 76 / 76 | 5 / 5 |
| UPL-IT-058 | 4,773 | 3,404 | 28.7% | 47 / 47 | 45 / 45 | 5 / 5 |
| UPL-IT-059 | 7,632 | 4,831 | 36.7% | 79 / 79 | 77 / 77 | 5 / 5 |
| UPL-IT-060 | 13,522 | 8,831 | 34.7% | 134 / 134 | 132 / 132 | 4 / 4 |

**Assessment:** the structure is identical in all ten pairs. The Serbian files are written as terse checklist notes, and the English files turn each note into a full sentence. Examples from UPL-IT-057:

| Section | English | Serbian |
|---|---|---|
| §5 WRITE-WRITE | "Unintentional last-writer-wins overwrites." | "Last writer wins unintentionally." |
| §12 ONE-TIME TOKEN | "Single-use token redemption races." | "Same." |
| §30 EXTERNAL CALL INSIDE TRANSACTION | "Holding database locks for seconds across outbound network calls." | "Can hold locks for seconds." |

Neither language is missing checks. Because the prompts are short, a few elaborated sentences move the ratio a lot. **No action needed.** The earlier suspicion about 053, 058 and 060 is not confirmed: their structure matches exactly, and 058 (deviation 17.1%) is well within the normal range.

## No-action observations

- **"Isto." / "Same." sections.** 26 files (23 Serbian, 3 English) have numbered sections whose whole body is "Isto." ("Same."), meaning "apply the same check as the previous section". It is an authoring convention of the source and remains clear in context. English often expands these into a sentence, which partly explains the length difference. UPL-IT-057 §12 used the English word "Same." in the Serbian file; it was changed to "Isto." in version 1.1.0 of that prompt.
- **Empty matrix templates.** 70 files in both languages contain matrices written as a header row, a blank line and a delimiter row (for example `| Source | Validation | Sink | Context | Risk |`). The blank line stops GitHub from rendering them as tables, but the raw Markdown given to a model is unaffected, and the pattern is the same in both languages. Removing the blank lines would touch 70 files for display only, so it is not done in this pass.
- **Blockquotes.** A few pairs differ by one blockquote (for example UPL-IT-050 and UPL-IT-060), where one language quotes an example and the other writes it as plain text. This is formatting only.
