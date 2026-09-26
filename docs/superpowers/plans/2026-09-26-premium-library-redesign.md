# Premium Prompt Library Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Make the bilingual prompt catalog the premium, spacious entry experience, with a left category navigation, quick search, and responsive prompt reading.

**Architecture:** Keep the static Node generator, generated HTML, existing prompt index, and plain JavaScript interactions. Build the visual system in the shared stylesheet and localized templates, render category state from the catalog, and show matching prompt cards through accessible, URL-addressable numbered pagination.

**Tech Stack:** Node.js static site generator, template literals, vanilla JavaScript, CSS, existing JSON/YAML prompt metadata.

**Spec:** `docs/superpowers/specs/2026-09-26-premium-library-redesign-design.md`

## Global Constraints

- Preserve the existing static Node site generator and plain JavaScript architecture.
- Add no styling or interaction dependencies.
- Preserve existing routes, prompt IDs, localized content, SEO metadata, source links, and copy behavior.
- Keep every UI label localized in English and Serbian.
- Use the ten category records in `catalog.json`; two are populated with 100 prompts each and eight are currently empty.
- Derive visible counts and availability from real catalog data; do not fabricate prompts or claim the current source has more than 1,000.
- Design the catalog to scale beyond 1,000 prompts through numbered result pages.
- Use a centered, generous page canvas and the available width beside the category navigation.
- Do not publish a deployment or change the content model.

## Review Focus

- Search, category, subcategory, and sort query state on direct load, refresh, reset, and browser back or forward. Review in Task 3.
- Empty category behavior and accurate counts for all ten category records. Review in Task 3.
- Long English and Serbian labels at narrow widths, including 320 px. Review in Task 5.
- Accurate result ranges and page navigation when matches exceed one 24 card page. Review in Task 3 and Task 5.
- Long prompt headings, code blocks, tables, and the mobile table of contents. Review in Task 4 and Task 5.

---

### Task 1: Shared layout and navigation

**Files:**
- Modify: `scripts/generate-site.mjs` functions `header`, `pageShell`, and `L.en` / `L.sr`
- Modify: `site-src/site.js` global menu state and keyboard handling
- Modify: `site-src/site.css` shared tokens, shell, header, and responsive foundations

**Interfaces:**
- Consumes: existing `header(lang, alternateEn, alternateSr)`, `pageShell(...)`, and `L[lang]` translations.
- Produces: the shared centered shell, localized accessible navigation labels, and a sticky header that works while the document scrolls.

- [x] **Step 1: Add localized shared interface strings** in `L.en` and `L.sr` for search labeling, category browsing, planned categories, pagination, and close actions. Use the same key in both language objects.
- [x] **Step 2: Refine `header()` and `pageShell()` markup** so the brand, desktop navigation, language switch, support actions, skip link, and mobile menu remain available at all supported widths. Keep the mobile toggle's `aria-expanded` and `aria-controls` state accurate.
- [x] **Step 3: Set shared layout rules** in `site-src/site.css`: a centered shell up to 1,360 px wide, 32 px desktop outer gutters, 14 px mobile gutters, visible focus styles, reduced-motion handling, and a sticky header. Remove the root overflow rule that breaks sticky positioning; use clipping only where needed.
- [x] **Step 4: Generate the static site** with `npm run build:site` and inspect generated home, catalog, and detail headers at 1440 px and 390 px.
- [x] **Step 5: Commit** as `style: refine shared site shell`.

### Task 2: Field Guide homepage (superseded)

**Scope correction:** This section records a direction that was implemented earlier in the branch. The user has since asked to remove the separate landing page and render prompts immediately at `/` and `/sr/`. The final acceptance criteria are catalog-first. Task 3 removes the obsolete homepage template, translations, and styles while preserving `/prompts/` and `/sr/prompts/` as working aliases.

**Files:**
- Modify: `scripts/generate-site.mjs` `renderHome()`, prompt selection helpers, and `L.en` / `L.sr`
- Modify: `site-src/site.css` homepage hero, search, path cards, featured prompt, and recommendation styles

**Interfaces:**
- Consumes: `prompts`, `catalog.categories`, `stats`, `promptUrl(lang, prompt)`, and `libraryUrl(lang)`.
- Produces: an above-the-fold search form, task paths derived from populated catalog subcategories, one real featured prompt, and a short curated starter list.

- [x] **Step 1: Select homepage prompt content from real records** using stable existing IDs `UPL-IT-001`, `UPL-BIZ-001`, and `UPL-IT-002`; source titles, categories, and URLs from `prompts` and `promptUrl()`.
- [x] **Step 2: Replace the current homepage hero** with the Field Guide layout. Add a native `GET` search form whose `action` is `libraryUrl(lang)` and whose query field is named `q`, so search works without client-side submission code.
- [x] **Step 3: Render task pathways from populated subcategories** and keep the ten-category directory driven by `catalog.categories`. Empty categories remain labeled as planned and retain their existing roadmap destination.
- [x] **Step 4: Remove hardcoded prompt totals and collection names** from homepage copy and cards. Use `stats` and localized text for current counts, and label the curated list as recommendations rather than popularity because the source has no usage analytics.
- [x] **Step 5: Generate and visually inspect** English and Serbian homepages at 1440 px and 390 px. Confirm the search form targets the correct localized catalog route.
- [x] **Step 6: Commit** as `feat: redesign homepage as prompt field guide`.

### Task 3: Scalable catalog with side navigation

**Files:**
- Modify: `scripts/generate-site.mjs` `promptCard()` and `renderLibrary()`
- Modify: `scripts/generate-site.mjs` root routes, catalog canonical URLs, and shared category navigation
- Modify: `site-src/site.js` search, filter, URL, drawer, and pagination state
- Modify: `site-src/site.css` catalog layout, side navigation, drawer, filters, and cards

**Interfaces:**
- Consumes: `catalog.categories`, `prompts`, `stats`, `promptUrl()`, `libraryUrl()`, existing `data-prompt-card` metadata, and URL keys `q`, `category`, `subcategory`, `sort`.
- Produces: a 10-category desktop sidebar, mobile category drawer, accessible search, active filters, `PAGE_SIZE = 24` matching cards per page, and original-order or title sort.

- [ ] **Step 1: Render category navigation from `catalog.categories`** with a shared helper. Active categories are buttons with real counts and `data-category-shortcut`; zero-count categories use a noninteractive planned state and never link to empty results.
- [ ] **Step 2: Render the catalog directly at `/` and `/sr/`** with no separate promotional homepage. Keep `/prompts/` and `/sr/prompts/` as aliases, point canonical and language alternates to the root routes, and keep category navigation anchored to the catalog.
- [ ] **Step 3: Recompose `renderLibrary()`** as a centered two-column layout with the full category sidebar immediately below the global header and a distinctive, compact index hero beside it. Keep all ten categories visible without an inner sidebar scrollbar. Place the labeled search, subcategory and sort controls, reset, result count, active-filter summary, grid, and empty state in the results canvas. Sort options are original catalog order and localized title A to Z.
- [ ] **Step 4: Add mobile category controls** using a labeled native `<dialog id="category-drawer">` with close control and the same category data. Keep mobile search above shortcuts and results. Include `aria-live="polite"` for result count changes. Keep EN/SR controls visible in the compact mobile header and support links reachable from its menu.
- [ ] **Step 5: Implement numbered pagination** in `site.js` with `PAGE_SIZE = 24`, localized previous, next, and page controls, current-page state, condensed page numbers, and synchronized controls above and below the grid. Reset to page one when filters change and preserve keyboard focus when moving between pages.
- [ ] **Step 6: Keep URL state coherent** for `q`, `category`, `subcategory`, `sort`, and `page`: restore controls on initial load and `popstate`, update the URL on search, filter, and page changes, sort titles with `Intl.Collator(lang)`, and clear all state on reset.
- [ ] **Step 7: Add the explicit accessible search label** and selected states to category buttons. Keep prompt cards readable, with title, category, subcategory, language links, and one primary open action.
- [ ] **Step 8: Generate and inspect the generated route markup** for `/`, `/sr/`, `/prompts/`, and `/sr/prompts/`, including a direct page URL, empty search state, and the mobile category drawer. The user performs visual acceptance and supplies any additional refinements. Do not invent 1,000 prompt records for this review.
- [ ] **Step 9: Commit** as `feat: redesign scalable prompt catalog`.

### Task 4: Prompt detail reading experience

**Files:**
- Modify: `scripts/generate-site.mjs` `renderMarkdown()`, `getToc()`, and `renderPromptPage()`
- Modify: `site-src/site.css` prompt hero identity, metadata, table of contents, and article layout
- Modify: `site-src/site.js` only if native disclosure needs localized state handling

**Interfaces:**
- Consumes: existing prompt file Markdown, `getToc()`, localized `L[lang]`, and `raw-prompt` copy payload.
- Produces: one page-level `h1`, article headings beginning at `h2`, a sticky active section navigator, right-side reading progress and jump controls, and localized reading preferences.

- [ ] **Step 1: Map rendered Markdown headings one level below page headings** in `renderMarkdown()`, keeping generated IDs aligned with `getToc()` links.
- [ ] **Step 2: Keep the table of contents beside the article** and sticky within the reading viewport. Mark the active heading during scroll, expose it through `aria-current`, and keep it visible in the scrollable contents panel.
- [ ] **Step 3: Add localized reading controls** for font size, line spacing, and focused reading, plus a right-side progress indicator and top/end shortcuts.
- [ ] **Step 4: Rebalance prompt detail layout** so actions and key metadata are visible near the title, the article column remains comfortable to read, and code blocks and tables scroll within their own containers.
- [ ] **Step 5: Generate** one long English prompt and its Serbian route. Confirm copy controls, source link, previous/next links, heading outline, and TOC anchors are preserved.
- [ ] **Step 6: Commit** as `style: improve prompt reading experience`.

### Task 5: Integrated responsive review

**Files:**
- Review: generated pages in `dist/`
- Modify only if needed: `scripts/generate-site.mjs`, `site-src/site.js`, or `site-src/site.css`

**Interfaces:**
- Consumes: catalog-first root routes, catalog aliases, and detail templates.
- Produces: a coherent English and Serbian experience with no horizontal page overflow and no misleading counts.

- [ ] **Step 1: Run** `npm run build:site` and confirm the generated English and Serbian routes exist under `dist/`.
- [ ] **Step 2: Confirm** the root catalog, localized routes, category drawer, and reader controls are present in generated output.
- [ ] **Step 3: Leave visual review** of the screenshots and supplied reference dimensions to the user, who explicitly handles visual acceptance.
- [ ] **Step 4: Make scoped code corrections** from the user's visual feedback and rebuild.
- [ ] **Step 5: Confirm** `git diff --check` is clean and review `git status --short` before handing over the completed branch.
