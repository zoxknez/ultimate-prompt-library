# Premium Prompt Library Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Redesign the existing bilingual prompt library as a premium, spacious Field Guide with a left category navigation, quick search, and responsive prompt reading.

**Architecture:** Keep the static Node generator, generated HTML, existing prompt index, and plain JavaScript interactions. Build the visual system in the shared stylesheet and localized templates, render category state from the catalog, and progressively reveal matching prompt cards in accessible batches.

**Tech Stack:** Node.js static site generator, template literals, vanilla JavaScript, CSS, existing JSON/YAML prompt metadata.

**Spec:** `docs/superpowers/specs/2026-09-26-premium-library-redesign-design.md`

## Global Constraints

- Preserve the existing static Node site generator and plain JavaScript architecture.
- Add no styling or interaction dependencies.
- Preserve existing routes, prompt IDs, localized content, SEO metadata, source links, and copy behavior.
- Keep every UI label localized in English and Serbian.
- Use the ten category records in `catalog.json`; two are populated with 100 prompts each and eight are currently empty.
- Derive visible counts and availability from real catalog data; do not fabricate prompts or claim the current source has more than 1,000.
- Design the catalog to scale beyond 1,000 prompts through progressive result batches.
- Use a centered, generous page canvas and the available width beside the category navigation.
- Do not publish a deployment or change the content model.

## Review Focus

- Search, category, subcategory, and sort query state on direct load, refresh, reset, and browser back or forward. Review in Task 3.
- Empty category behavior and accurate counts for all ten category records. Review in Task 3.
- Long English and Serbian labels at narrow widths, including 320 px. Review in Task 5.
- Result counts and progressive reveal when matches exceed one 24 card batch. Review in Task 3 and Task 5.
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

- [ ] **Step 1: Add localized shared interface strings** in `L.en` and `L.sr` for search labeling, category browsing, planned categories, load more, and close actions. Use the same key in both language objects.
- [ ] **Step 2: Refine `header()` and `pageShell()` markup** so the brand, desktop navigation, language switch, support actions, skip link, and mobile menu remain available at all supported widths. Keep the mobile toggle's `aria-expanded` and `aria-controls` state accurate.
- [ ] **Step 3: Set shared layout rules** in `site-src/site.css`: a centered shell up to 1,360 px wide, 32 px desktop outer gutters, 14 px mobile gutters, visible focus styles, reduced-motion handling, and a sticky header. Remove the root overflow rule that breaks sticky positioning; use clipping only where needed.
- [ ] **Step 4: Generate the static site** with `npm run build:site` and inspect generated home, catalog, and detail headers at 1440 px and 390 px.
- [ ] **Step 5: Commit** as `style: refine shared site shell`.

### Task 2: Field Guide homepage

**Files:**
- Modify: `scripts/generate-site.mjs` `renderHome()`, prompt selection helpers, and `L.en` / `L.sr`
- Modify: `site-src/site.css` homepage hero, search, path cards, featured prompt, and recommendation styles

**Interfaces:**
- Consumes: `prompts`, `catalog.categories`, `stats`, `promptUrl(lang, prompt)`, and `libraryUrl(lang)`.
- Produces: an above-the-fold search form, task paths derived from populated catalog subcategories, one real featured prompt, and a short curated starter list.

- [ ] **Step 1: Select homepage prompt content from real records** using stable existing IDs `UPL-IT-001`, `UPL-BIZ-001`, and `UPL-IT-002`; source titles, categories, and URLs from `prompts` and `promptUrl()`.
- [ ] **Step 2: Replace the current homepage hero** with the Field Guide layout. Add a native `GET` search form whose `action` is `libraryUrl(lang)` and whose query field is named `q`, so search works without client-side submission code.
- [ ] **Step 3: Render task pathways from populated subcategories** and keep the ten-category directory driven by `catalog.categories`. Empty categories remain labeled as planned and retain their existing roadmap destination.
- [ ] **Step 4: Remove hardcoded prompt totals and collection names** from homepage copy and cards. Use `stats` and localized text for current counts, and label the curated list as recommendations rather than popularity because the source has no usage analytics.
- [ ] **Step 5: Generate and visually inspect** English and Serbian homepages at 1440 px and 390 px. Confirm the search form targets the correct localized catalog route.
- [ ] **Step 6: Commit** as `feat: redesign homepage as prompt field guide`.

### Task 3: Scalable catalog with side navigation

**Files:**
- Modify: `scripts/generate-site.mjs` `promptCard()` and `renderLibrary()`
- Modify: `site-src/site.js` search, filter, URL, drawer, and result-batch state
- Modify: `site-src/site.css` catalog layout, side navigation, drawer, filters, and cards

**Interfaces:**
- Consumes: `catalog.categories`, `prompts`, `stats`, `promptUrl()`, `libraryUrl()`, existing `data-prompt-card` metadata, and URL keys `q`, `category`, `subcategory`, `sort`.
- Produces: a 10-category desktop sidebar, mobile category drawer, accessible search, active filters, `PAGE_SIZE = 24` matching cards per visible batch, and original-order or title sort.

- [ ] **Step 1: Render category navigation from `catalog.categories`** with a shared helper. Active categories are buttons with real counts and `data-category-shortcut`; zero-count categories use a noninteractive planned state and never link to empty results.
- [ ] **Step 2: Recompose `renderLibrary()`** as a centered two-column layout with a 248 px category sidebar and a spacious results canvas. Place the labeled search first, keep subcategory selection compact, and place result count, active-filter summary, sort control, reset, grid, and empty state beside the results. Sort options are original catalog order and localized title A to Z. Render the first 24 cards initially and mark the rest hidden until shown.
- [ ] **Step 3: Add mobile category controls** using a labeled native `<dialog id="category-drawer">` with close control and the same category data. Keep mobile search above shortcuts and results. Include `aria-live="polite"` for result count changes.
- [ ] **Step 4: Implement progressive result visibility** in `site.js` with `PAGE_SIZE = 24`, matched-card count separate from displayed-card count, and a localized load-more button. Reset displayed count when filters change and reveal the next 24 matching cards when activated.
- [ ] **Step 5: Keep URL state coherent** for `q`, `category`, `subcategory`, and `sort`: restore controls on initial load and `popstate`, update the URL on search and filter changes, sort titles with `Intl.Collator(lang)`, and clear all four values on reset.
- [ ] **Step 6: Add the explicit accessible search label** and selected states to category buttons. Keep prompt cards readable, with title, category, subcategory, language links, and one primary open action.
- [ ] **Step 7: Generate and visually inspect** `/prompts/` and `/sr/prompts/` at 1440 px, 768 px, 390 px, and 320 px. Inspect an empty search, a populated search, a direct category URL, and the mobile drawer. Do not invent 1,000 prompt records for this review.
- [ ] **Step 8: Commit** as `feat: redesign scalable prompt catalog`.

### Task 4: Prompt detail reading experience

**Files:**
- Modify: `scripts/generate-site.mjs` `renderMarkdown()`, `getToc()`, and `renderPromptPage()`
- Modify: `site-src/site.css` prompt hero, metadata, table of contents, and article layout
- Modify: `site-src/site.js` only if native disclosure needs localized state handling

**Interfaces:**
- Consumes: existing prompt file Markdown, `getToc()`, localized `L[lang]`, and `raw-prompt` copy payload.
- Produces: one page-level `h1`, article headings beginning at `h2`, desktop section navigation, and a compact mobile disclosure.

- [ ] **Step 1: Map rendered Markdown headings one level below page headings** in `renderMarkdown()`, keeping generated IDs aligned with `getToc()` links.
- [ ] **Step 2: Render the table of contents as a native disclosure** with a localized summary. Keep it expanded as a visible desktop panel and compact it on mobile without removing access to its links.
- [ ] **Step 3: Rebalance prompt detail layout** so actions and key metadata are visible near the title, the article column remains comfortable to read, and code blocks and tables scroll within their own containers.
- [ ] **Step 4: Generate and visually inspect** one long English prompt and its Serbian route at 1440 px and 390 px. Confirm copy controls, source link, previous/next links, heading outline, and TOC anchors are preserved.
- [ ] **Step 5: Commit** as `style: improve prompt reading experience`.

### Task 5: Integrated responsive review

**Files:**
- Review: generated pages in `dist/`
- Modify only if needed: `scripts/generate-site.mjs`, `site-src/site.js`, or `site-src/site.css`

**Interfaces:**
- Consumes: completed homepage, catalog, and detail templates.
- Produces: a coherent English and Serbian experience with no horizontal page overflow and no misleading counts.

- [ ] **Step 1: Run** `npm run build:site` and confirm the generated English and Serbian routes exist under `dist/`.
- [ ] **Step 2: Start a local static preview** of `dist/` and use the previously approved read-only Playwright CLI capture at desktop and mobile widths.
- [ ] **Step 3: Review** home, catalog, search results, the mobile category drawer, and a long prompt at 1440 px, 768 px, 390 px, and 320 px. Check centered composition, full usable width, sticky header, localized copy, focus visibility, and overflow.
- [ ] **Step 4: Make only scoped visual corrections**, rebuild, and capture the affected view again.
- [ ] **Step 5: Confirm** `git diff --check` is clean and review `git status --short` before handing over the completed branch.
