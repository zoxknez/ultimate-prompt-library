# UPL v2 Translation Parity Audit

Review date: 2026-09-27

## Automated result before manual review

- EN/SR prompt pairs checked: **1,000 / 1,000**
- Metadata-valid pairs: **1,000 / 1,000**
- Missing language pairs: **0**
- Structural warning candidates: **2**
- Length outliers at configured threshold: **0**

The only warning candidates were UPL-IT-004 and UPL-IT-020. Both warnings concerned code-fence counts, not headings, numbered sections, tables, blockquotes, metadata or translation length.

## Manual resolution

### UPL-IT-004

The Serbian localization used fenced blocks for eleven very short examples that the English source expressed inline. They were normalized to inline code/text because the fenced form added no structural value. No substantive Serbian content was removed.

### UPL-IT-020

The two localizations contained complementary useful examples. English had concrete Android XML/Gradle/R8 snippets absent from Serbian; Serbian had release-only and second-pass flow examples absent from English. The useful examples were added to the opposite localization instead of deleting them.

## Post-edit structural parity

- UPL-IT-004 code blocks: **32 EN / 32 SR**
- UPL-IT-020 code blocks: **56 EN / 56 SR**

A deployment diagnostic re-runs `validate:translations` after these edits. The expected result is 0 structural warning candidates.
