# Website architecture

The Ultimate Prompt Library website is generated directly from the repository content.

## Goals

- Keep Git and Markdown as the single source of truth.
- Publish every stable prompt as a dedicated, indexable web page.
- Provide fast search and filtering without a database.
- Keep English and Serbian routes structurally paired.
- Preserve permanent prompt IDs and stable links.
- Make copying a full prompt or code block a one-click action.
- Keep the runtime surface as small as possible.

## Architecture

The website uses build-time static generation implemented in `scripts/generate-site.mjs`.

Source data:

- `catalog.json` for category and subcategory structure.
- `indexes/prompts.json` for published prompt metadata and file paths.
- `indexes/stats.json` for live collection counts.
- `prompts/en/**` and `prompts/sr/**` for prompt bodies.
- `site-src/site.css` for the visual system.
- `site-src/site.js` for progressive enhancement.

Generated output is written to `dist/` and is intentionally not committed.

## Routes

- `/` - English landing page.
- `/sr/` - Serbian landing page.
- `/prompts/` - English prompt browser.
- `/sr/prompts/` - Serbian prompt browser.
- `/prompts/en/<id>-<slug>/` - English prompt page.
- `/prompts/sr/<id>-<slug>/` - Serbian prompt page.

Every prompt page includes:

- prompt ID, version and status,
- category and subcategory,
- EN/SR switch,
- copy prompt,
- copy link,
- GitHub source link,
- table of contents,
- rendered Markdown,
- previous and next prompt navigation.

## Design system

The website follows the premium light visual direction established by the README artwork:

- white and ivory surfaces,
- deep navy typography,
- royal blue for IT and primary actions,
- warm gold for Business and secondary emphasis,
- restrained green for positive state,
- subtle borders and shadows,
- no purple, neon or fluorescent AI styling.

The site uses semantic HTML, responsive CSS and progressive enhancement instead of a heavy client framework.

## Search

The prompt browser is fully rendered at build time.

Client JavaScript only controls:

- text search,
- category filter,
- subcategory filter,
- result count,
- copy actions,
- keyboard shortcut `/` to focus search.

The prompt content itself remains visible without JavaScript.

## SEO and discoverability

The build generates:

- semantic HTML for every prompt,
- page titles and descriptions,
- canonical URLs,
- Open Graph metadata,
- `sitemap.xml`,
- `robots.txt`,
- web app manifest.

Set `SITE_URL` in the deployment environment when using a custom production domain.

## Build and validation

Build:

```bash
npm run build:site
```

Full build:

```bash
npm run build
```

Website validation:

```bash
npm run validate:site
```

Full repository validation:

```bash
npm run validate
```

The website validator checks:

- required generated pages and assets,
- one page for every localized prompt,
- prompt IDs on generated pages,
- accidental `undefined` output,
- the current prompt count on the home page,
- accidental em dash characters in generated prompt pages.

## Deployment

`vercel.json` builds the repository and publishes `dist/` as a static site.

No database, serverless function or runtime secret is required for the current feature set.

## Future upgrades

Introduce a server framework only when the product genuinely needs server state, for example:

- accounts,
- favorites synchronized across devices,
- personal collections,
- community ratings,
- comments,
- saved search,
- private prompts,
- analytics that require first-party server processing,
- semantic/vector search,
- API access.

Until then, static generation keeps the site simpler, faster and easier to maintain.
