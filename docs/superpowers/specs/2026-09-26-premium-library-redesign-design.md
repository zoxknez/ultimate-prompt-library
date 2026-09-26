# Premium Prompt Library Redesign

## Purpose

Make Ultimate Prompt Library feel like a polished, trustworthy product on desktop and mobile. Help visitors discover the right prompt quickly, understand what it does, and use it with minimal friction. Preserve the existing UPL identity and bilingual English and Serbian experience.

## Agreed direction

Use the curated Field Guide direction selected by the user, combined with a persistent left category navigation. The combination is intentional: the guide provides curated discovery and featured prompts, while the side navigation gives direct access to the full library.

The visual language remains navy, clear blue, warm white, and restrained gold, with the existing UPL mark and Inter typography. Use a centered, generous canvas with consistent outer gutters. On wide screens, the main content should use the available space beside the sidebar. Do not pin the content to the left edge or constrain it to a narrow column. On small screens, replace the permanent sidebar with an accessible category drawer and keep the search immediately visible.

## Current content and scale

The local repository matches `origin/main` at `31fb120`. Its catalog defines ten categories. IT and Business currently contain 100 prompts each, for 200 unique prompts total. The other eight categories are defined but empty. The current source does not contain more than 1,000 prompts.

The redesigned navigation and catalog must scale beyond 1,000 prompts without hardcoded totals or fabricated entries. Derive counts and category availability from `catalog.json`. Show the ten existing category names. Active categories are selectable and display their real counts. Empty categories are visually identified as planned and cannot lead to empty result pages. When the content dataset grows, those entries become active automatically.

## Experience architecture

### Global header

- Keep the UPL mark and bilingual language switch visible.
- Keep primary links and support actions legible without competing with search.
- Use a compact sticky header that works during document scrolling on desktop and mobile.
- Give the mobile menu a clear open and close control, an announced state, keyboard operation, and a reliably scrollable panel.

### Homepage

- Introduce the library with one clear headline, concise value statement, and prominent search entry point.
- Use a curated Field Guide layout with a small set of task pathways, one featured prompt, and a compact popular prompts section.
- Link the main browse action to the full catalog.
- Keep decorative artwork subordinate to useful content.

### Prompt catalog

- Use a centered wide layout with a category sidebar and a spacious results area.
- Place search at the top of the results area. Make it the first catalog action on desktop and mobile.
- Use the side navigation for the ten catalog categories. Show real prompt counts, distinguish active categories from planned empty categories, and avoid dead links.
- Show a useful first screen of results. Include the result count, selected filters, sort control, and a clear reset action near the results.
- Retain subcategory filtering in a compact, discoverable control instead of a long block before search.
- Use legible prompt cards with ID, title, short practical description, category, language availability, and one primary open action. Maintain consistent card heights without excessive blank space.
- Support growing catalogs with progressive result batches or pagination. Keep the result count accurate and ensure search, category filters, subcategory filters, sort, reset, URL state, and browser history remain coherent.
- Preserve direct links to English and Serbian versions.

### Prompt detail

- Keep the prompt title, category, language, copy action, and copy-link action clear above the article.
- Keep source and version metadata available without letting them dominate the reading column.
- Provide desktop table of contents navigation and a compact expandable table of contents on mobile.
- Preserve readable article width, code and table overflow handling, and previous/next navigation.
- Keep the Markdown heading hierarchy below the page title and provide visible focus states for controls.

## Responsive behavior

- Wide desktop: persistent left navigation, broad results canvas, and balanced outer whitespace.
- Tablet: narrow the category panel before reducing card readability; allow filters to wrap cleanly.
- Mobile: hide the permanent sidebar behind a labeled drawer, put search before category shortcuts and results, use one-column cards, maintain touch-sized controls, and avoid horizontal page overflow.
- Detail pages: move metadata and navigation into compact disclosure patterns where needed, with the article remaining the main reading surface.
- Support reduced motion and do not rely on color alone for selection or status.

## Implementation constraints

- Keep the existing static Node site generator and plain JavaScript architecture unless implementation reveals a concrete blocker.
- Do not add dependencies for styling or interaction.
- Preserve existing routes, prompt IDs, localized content, SEO metadata, source links, copy behavior, and catalog generated from source files.
- Keep the UI text localized in English and Serbian.
- Use real catalog data for every count and state. Do not claim the current repository contains over 1,000 prompts. Design for that future scale.
- Consolidate responsive overrides only where needed for this redesign; avoid unrelated cleanup.

## Accessibility and quality criteria

- Search and icon-only controls have explicit accessible names.
- Navigation, filters, drawers, disclosures, copy actions, and pagination can be operated with a keyboard and expose their state to assistive technology.
- Page titles use a logical heading outline. Prompt Markdown headings do not create competing page-level `h1` elements.
- Text and controls maintain readable contrast, visible focus, and adequate touch targets.
- No horizontal overflow at common viewport widths.
- The first mobile catalog viewport exposes search and useful results without scrolling through a long category list.
- A visitor can reach any active category, search results, and an individual prompt from the homepage using clear, reversible navigation.
- The same core experience works in English and Serbian.

## Scope boundaries

This change is a visual and interaction redesign of the existing homepage, catalog, and prompt detail templates. It does not add prompt content, activate empty categories, change the licensing or content model, introduce accounts, or publish a deployment.

## Open implementation detail

The exact batch size and whether progressive loading uses a button or numbered pagination will be selected during implementation based on the existing URL and filtering behavior. Either choice must remain keyboard accessible and preserve deep links to prompts.
