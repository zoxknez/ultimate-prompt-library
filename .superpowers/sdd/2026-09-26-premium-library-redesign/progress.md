# SDD ledger — plan: docs/superpowers/plans/2026-09-26-premium-library-redesign.md

## Setup
- Workspace: C:\Users\zoxkn\.codex\worktrees\premium-library-redesign\ultimate-prompt-library
- Branch: codex/premium-library-redesign
- Base: 7522ec9 (contains the approved spec and plan)
- Runtime: bundled Node v24.19.0
- Ruling: Automated tests are not added or run because the active developer instruction forbids them unless the user asks. Use the planned site build and browser visual review as evidence instead. Cost if wrong: behavioral regressions may be less thoroughly covered than with automated tests.
- Ruling: The Windows bash alias targets unavailable WSL. Use Git Bash at C:\Program Files\Git\bin\bash.exe for the required planning scripts. Cost if wrong: none to product behavior; only changes how tooling is invoked.
- Ruling: Use the user selected Field Guide concept with an explicit left category navigation as recorded in the approved spec. Cost if wrong: the user intended one image layout literally instead of the stated combination.
- Superseding ruling: The latest user direction removes the separate Field Guide homepage. `/` and `/sr/` render the prompt catalog directly, while `/prompts/` and `/sr/prompts/` remain aliases. Cost if wrong: none; this is the user's explicit correction to the earlier direction.
- Ruling: The user will check visual appearance from their own screenshots and wants implementation only. Do not make visual acceptance claims or capture comparison screenshots for them. Cost if wrong: visual polish beyond the supplied references will wait for the user's feedback.
- Ruling: Keep current data counts truthful at 200 prompts, two active categories, and eight empty categories while making the interface support future growth beyond 1,000. Cost if wrong: content outside the current repository will not appear until its source files are added.

## Pre-flight interfaces
- Task 1 produces the shared centered shell, localized interface labels, and sticky header consumed by Tasks 2 through 5. Plan and spec align.
- Task 2's temporary homepage is superseded. Task 3 now renders the catalog at the root routes and retains the old catalog routes as aliases.
- Task 3 keeps the data-prompt-card contract and synchronizes search, category, subcategory, sort, and page state through the URL. Task 5 consumes its generated output. Plan contract is consistent.
- Task 4 consumes localized labels and existing Markdown, prompt IDs, TOC anchors, and copy payload. It does not alter Task 3 filter state.
- Task 5 depends on the output of Tasks 1 through 4. No conflicts found.

## Task 1: shared shell and navigation
- Result: complete. Added balanced centered gutters, semantic localized navigation labels, skip-to-content handling, keyboard-aware mobile menu behavior, sticky-header overflow correction, visible focus, and reduced-motion support.
- Build: `npm run build:site` succeeded with 200 prompts, 400 localized files, and 404 indexed URLs.
- Browser review: at 390px viewport, desktop navigation is hidden, the mobile panel is visible and opaque when opened, Escape closes it, and focus returns to the menu button. Sticky header remains pinned after scrolling.
- Review artifact: `C:\Users\zoxkn\AppData\Local\Temp\upl-redesign-review\task1-menu-open-fixed.png`.
- `git diff --check`: clean.

## Task 2: Field Guide homepage (superseded)
- Historical result: the Field Guide was implemented and reviewed, then removed after the user clarified that the catalog should open immediately. Its templates, translations, and styles are being deleted as part of Task 3.
- Current acceptance: no separate landing page; the root pages display the prompt catalog.

## Scope update: catalog-first entry and reading aids
- User correction: make the prompt catalog the only entry screen, with the category navigation, search, EN/SR, and support available immediately.
- Additional user feedback: increase category navigation legibility; make the prompt table of contents follow the reading position; add a right-side reading progress indicator, top/end shortcuts, text-size controls, line-spacing control, and focus mode.
- Catalog: removed the Field Guide renderer, its styles, and homepage-only copy. Both root routes now render `renderLibrary()` directly; catalog aliases remain generated, canonical URLs point to the roots, and the sitemap contains 402 canonical URLs.
- Navigation: increased category name and count sizes, increased touch rows, improved planned-category contrast, and removed the small explanatory sidebar note.
- Prompt reader: added a scroll-aware active TOC item, a right-edge reading progress bar, top/end jump buttons, font size controls, line-spacing preference, and focus mode with English and Serbian labels.
- Build: `npm run build:site` succeeded with 200 prompts, 400 localized files, and 402 indexed URLs. `node --check site-src/site.js` and `git diff --check` completed without errors.
- Local route check: `/`, `/sr/`, and a long prompt detail URL each returned HTTP 200 from the preview. Both root pages contain the catalog; the detail page contains the reading controls.
- Visual review: not captured because the user explicitly handles visual acceptance. Await the user's next screenshot and make any requested refinements.

## Scope update: premium catalog and prompt heroes with pagination
- User feedback: make the catalog and prompt detail heroes distinctive, align category navigation beside the catalog hero at the top, remove the sidebar's nested scrollbar, redesign the search, filters, and cards, and add polished pagination. The user handles visual acceptance; do not capture screenshots.
- Catalog layout: composed the ten-category desktop navigation and the dark UPL index hero in a single two-column workspace. The category list fits its natural content height with no internal scrolling. Narrow layouts use the existing accessible category drawer.
- Catalog controls: grouped search and filters into a compact surface, strengthened card hierarchy and actions, and added synchronized pagination controls above and below the cards.
- Pagination behavior: 24 prompts per page, condensed numbered controls with localized previous and next actions, accurate localized result ranges, keyboard focus retention, filter reset to page one, browser history support, and a `page` URL parameter.
- Prompt detail: redesigned its hero around the UPL prompt index stamp, stronger title hierarchy, localized metadata, and prominent copy actions. Existing reading outline, scroll progress, jump controls, and reading preferences remain in place.
- Verification: `node --check site-src/site.js`, `node --check scripts/generate-site.mjs`, `npm run build:site`, and `git diff --check` completed successfully. The generated catalog includes the sidebar, index hero, and both pagination slots; generated detail output includes the new hero and retains the reading progress rail. Build generated 200 prompts, 400 localized files, and 402 indexed URLs.
- Visual acceptance: left to the user as requested. No visual screenshots were taken.
- Latest screenshot refinements: removed grid, orbit, and dot decorations from both heroes; simplified hero surfaces; show the reading rail only after the prompt hero clears the sticky header and keep hidden controls out of keyboard navigation; aligned catalog search, category filters, sorting, and reset in one desktop row with a responsive wrap at narrower widths.
- Latest verification: both JavaScript syntax checks, `npm run build:site`, and `git diff --check` succeeded. The build still generates 200 prompts, 400 localized files, and 402 indexed URLs.
