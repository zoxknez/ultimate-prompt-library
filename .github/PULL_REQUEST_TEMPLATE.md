## Summary

<!-- What does this pull request change, and why? -->

## Type of change

- [ ] New prompt (planned ID or accepted proposal)
- [ ] Improvement of an existing prompt
- [ ] Factual fix
- [ ] Translation
- [ ] Catalog / category / subcategory change
- [ ] Tooling or documentation

## Prompts affected

<!-- List prompt IDs, e.g. UPL-IT-061. Write "none" for tooling-only changes. -->

## Checklist

- [ ] Existing prompt IDs are unchanged.
- [ ] Every added or changed prompt file has valid front matter.
- [ ] Filenames and folders follow `prompts/<lang>/<category>/<subcategory>/NNN-slug.md`.
- [ ] The corresponding language version is included, or the prompt stays in `draft`/`review` status.
- [ ] Both language versions carry the same `version` (bumped according to docs/prompt-format.md).
- [ ] No other prompt was modified accidentally.
- [ ] I ran `npm run generate` and committed the regenerated indexes and README tables.
- [ ] `npm run validate` passes.
