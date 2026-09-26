# Prompt IDs

Every prompt has a **stable, language-independent ID**. The ID is the permanent logical key of a prompt: it is used in issues, pull requests, indexes and (in the future) website permalinks.

```text
UPL-IT-035
│   │  └── three-digit number within the category
│   └───── category code
└───────── project prefix (Ultimate Prompt Library)
```

## Category prefixes

| Category | Prefix |
|---|---|
| IT, Programming & Technology | `UPL-IT` |
| Economics, Finance & Business | `UPL-BIZ` |
| Law & Administration | `UPL-LAW` |
| Health, Medicine & Wellness | `UPL-HEALTH` |
| Education & Learning | `UPL-EDU` |
| Science, Research & Analysis | `UPL-SCI` |
| Career & Professional Development | `UPL-CAREER` |
| Marketing, Sales & Communication | `UPL-MKT` |
| Productivity, Organization & Management | `UPL-PROD` |
| Creativity, Design & Media | `UPL-CREATIVE` |

All ten prefixes are reserved now, even for categories that have no prompts yet.

## Rules

1. **One ID per prompt, shared by all languages.** English `UPL-IT-035` and Serbian `UPL-IT-035` are the same prompt.
2. **IDs never change.** Not when the title is reworded, not when the slug is adjusted, not when the prompt moves to another subcategory, and not when the display order changes.
3. **IDs are never reused.** A deprecated prompt keeps its ID; its replacement gets a new one and is linked with `replaced_by`.
4. **Numbering is per category.** `UPL-IT-001` and `UPL-BIZ-001` are different prompts. The global uniqueness comes from the prefix, not the number.
5. **Numbering does not restart per subcategory.** Within IT, numbers continue `…, 099, 100, 101, …` regardless of subcategory.
6. **The number matches the filename.** `UPL-IT-019` lives in `019-<slug>.md` and has `number: 19`.
7. **IDs are assigned through [`catalog.json`](../catalog.json).** A prompt file whose ID is not registered in the catalog fails validation.
8. **Slugs and paths should not change after publication either.** They are part of every link to the prompt. If a rename is unavoidable, keep the ID and follow the procedure in [prompt-format.md](prompt-format.md#identity-paths-and-lifecycle).

## `number` versus `id`

`number` currently represents the order of a prompt within its collection, and `id` is derived from it. If the display order ever needs to change, the **ID and filename stay the same**; ordering would then be expressed by a separate field rather than by renumbering. For now `number` and the ID suffix are always identical.

## Planned prompts

A planned prompt is a catalog entry without prompt files. Its ID, number, slug, title and subcategory are reserved. Anyone writing it must use exactly that ID - a planned prompt must never receive a second ID. The planned list is in the [roadmap](roadmap.md).

## Getting a new ID

1. Check the [catalog](../catalog.json) and open issues for an existing or planned prompt on the same topic.
2. Open a **prompt suggestion** issue.
3. Once accepted, a maintainer (or the contributor, in the pull request) appends a new entry to the category's `prompts` list in `catalog.json` with the next free number.
4. The prompt files use that ID.

## Beyond 999

The filename format reserves three digits (`001`-`999`) per category. If a category ever approaches 999 prompts, the format will be widened in a single documented change; existing IDs remain valid.
