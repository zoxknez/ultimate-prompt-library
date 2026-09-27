---
id: UPL-IT-008
number: 8
slug: technical-seo-audit
title: Technical SEO Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Web Development
subcategory_id: web-development
language: en
version: 1.0.0
status: stable
---

# TECHNICAL SEO AUDIT

I want you to perform an exhaustive, systematic, and evidence-first technical SEO analysis of the entire web application.

Main goal:

> Determine whether search engines can properly discover, crawl, understand, index, and rank the public content of the application without technical barriers, duplicate content, conflicting signals, or ambiguous architecture.

This is not:

- a generic SEO checklist
- content marketing analysis
- keyword stuffing
- speculating on Google ranking positions
- recommending to "add more keywords"
- a subjective copywriting review
- an automated attempt to alter metadata

The focus is on technical SEO issues that impact:

- crawlability
- indexability
- canonicalization
- duplicate content
- status codes
- redirect behavior
- metadata
- structured data
- internal linking
- sitemaps
- robots directives
- social previews
- internationalization
- rendering models
- performance risks affecting search visibility
- JavaScript content accessibility
- search engine comprehension of site structure

Priority:

**indexability > crawlability > canonical correctness > technical consistency > metadata quality > optimization**

Do not fabricate an SEO problem unless it has a concrete technical root cause.

---

# 1. IDENTIFY TECHNOLOGY STACK

Before the analysis, determine:

- framework
- SSR/CSR/SSG model
- routing system
- deployment platform
- CMS if present
- i18n system
- metadata API
- sitemap generator
- robots implementation
- structured data implementation
- analytics/Search Console integrations if present
- PWA/service worker behavior
- CDN/proxy layer

Specifically check:

- Next.js
- Nuxt
- Remix
- Astro
- React SPA
- static site generator
- custom server

Do not apply obsolete SEO assumptions to frameworks with differing modern rendering architectures.

---

# 2. CREATE ROUTE SEO INVENTORY

Map all publicly accessible routes.

Classify them:

```text
PUBLIC INDEXABLE
PUBLIC NOINDEX
AUTHENTICATED
ADMIN
UTILITY
API
REDIRECT
ERROR
DYNAMIC
```

For each key public route, record:

- URL
- title
- description
- canonical URL
- robots directives
- indexability status
- status code
- structured data
- sitemap inclusion
- internal links pointing to it

Do not assume every public route should be indexed.

---

# 3. CRAWLABILITY

Verify whether search crawlers can discover content.

Look for:

- orphan pages
- content accessible solely through JS events
- links lacking valid `href` attributes
- navigation relying exclusively on click handlers
- content requiring client-side state transitions to surface
- routes accessible only via search queries
- deeply buried pages

Ask:

> Can a crawler reach this page via standard hypertext links?

---

# 4. INTERNAL LINKING

Map primary internal links.

Check:

- contextual links
- navigation links
- breadcrumbs
- related content
- pagination
- category/archive pages

Look for critical pages with weak or nonexistent internal link signals.

Do not recommend aggressive internal link stuffing merely to inflate link counts.

---

# 5. LINKS VS BUTTONS

Navigation must use authentic anchor links wherever applicable.

Example defect:

```html
<button onclick="router.push('/article')">
```

when representing actual page navigation.

Crawlers may not treat custom click behaviors like standard links.

Verify framework behavior before filing a finding.

---

# 6. INDEXABILITY

For every key route, verify:

- robots meta tags
- X-Robots-Tag HTTP headers
- robots.txt
- canonical links
- HTTP status codes
- authentication barriers
- redirects
- rendering completeness

Look for pages that appear indexable on the surface but harbor hidden indexing blocks.

---

# 7. `noindex`

Search the project repository for:

```text
noindex
nofollow
robots
```

For every instance, determine whether it is intentional.

Specifically check:

- staging
- production
- preview environments
- search pages
- filters
- admin areas

---

# 8. PRODUCTION VS STAGING SEO

One of the most critical audit checkpoints.

Verify whether production accidentally inherits:

```text
noindex
```

from staging/development configurations.

And conversely:

ensure staging environments are not exposed to indexation if not intended.

---

# 9. ROBOTS.TXT

Inspect the actual robots.txt output.

Verify:

- user-agent rules
- disallow rules
- allow rules
- sitemap references
- environment-specific behaviors

Look for:

- blocking important content paths
- accidental global `Disallow: /`
- blocking critical CSS/JS assets necessary for crawler rendering

---

# 10. ROBOTS META

For relevant pages, check:

- index
- noindex
- follow
- nofollow
- max-image-preview
- max-snippet
- max-video-preview

Do not inject directives without explicit technical justification.

---

# 11. SITEMAP

Inspect the sitemap implementation.

Verify:

- URL validity
- absolute URLs
- canonical URL consistency
- production domain hostnames
- locale variants
- dynamic routes
- stale URLs
- 404 URLs
- redirected URLs

A sitemap must never contain non-canonical or non-indexable URLs.

---

# 12. SITEMAP COVERAGE

Compare:

```text
indexable routes
vs
sitemap URLs
```

Look for:

- missing indexable URLs
- sitemap URLs that no longer exist
- duplicate variants
- filtered URLs that should not be indexed

---

# 13. SITEMAP LASTMOD

If `lastmod` is utilized, verify whether the timestamp genuinely reflects updates to meaningful page content.

Do not automatically set the current build time across all URLs on every deployment.

That renders the signal meaningless to crawlers.

---

# 14. CANONICAL

For every important indexable page, verify its canonical declaration.

Look for:

- missing canonical tags where required
- broken self-canonical implementations
- canonical tags pointing to incorrect URLs
- canonical tags pointing to redirect endpoints
- canonical tags pointing to 404 errors
- cross-domain canonical errors

---

# 15. CANONICAL VS CURRENT URL

Specifically inspect dynamic routes.

Scenario:

```text
/article/a
/article/b
```

where both specify:

```text
canonical = /article
```

This incorrectly consolidates distinct pages into one.

---

# 16. QUERY PARAMETERS

Map query parameters:

- filters
- sorting
- search
- tracking
- pagination

Evaluate whether they generate a vast combinatorial space of crawlable URLs.

Look for:

```text
?sort=
?filter=
?utm_
?page=
```

spawning duplicate content.

---

# 17. FACETED NAVIGATION

If filter systems exist, analyze crawlability.

Questions:

- does each parameter combination yield unique value
- does it generate an infinite crawl space
- should it canonicalize
- noindex
- robots blocking
- static landing page generation

There is no one-size-fits-all rule.

Analyze the business and content model.

---

# 18. DUPLICATE CONTENT

Look for identical content accessible across:

- www / non-www
- http / https
- trailing slash variants
- uppercase / lowercase paths
- query parameters
- multiple slug permutations
- locale variants
- legacy routes

---

# 19. URL NORMALIZATION

Define the canonical URL convention.

For example:

```text
https
non-www
lowercase
no trailing slash
```

or the project's actual chosen standard.

Verify that alternative URL formats:

- redirect permanently
- canonicalize properly
- do not produce duplicate index entries

---

# 20. HTTP VS HTTPS

Ensure HTTP requests consistently redirect to HTTPS.

If the infrastructure/deployment layer enforces this, record as PASS.

---

# 21. WWW VS NON-WWW

Verify host consistency.

Do not advocate one format over the other as inherently superior.

Enforcing a single canonical hostname is what matters.

---

# 22. TRAILING SLASH

Ensure that:

```text
/page
/page/
```

do not behave as two distinct indexable URLs without clear canonicalization or redirects.

---

# 23. CASE SENSITIVITY

Check:

```text
/Product
/product
```

If both resolve, analyze duplicate indexation risks.

---

# 24. SLUGS

Inspect dynamic slug generation logic.

Look for:

- duplicate slugs
- unstable slug alterations
- unsafe URL characters
- Unicode normalization issues
- slug collisions

---

# 25. URL CHANGES

When a slug is modified, verify:

```text
old URL
↓
301/308
↓
new URL
```

Rather than:

```text
old URL
↓
404
```

where the legacy URL holds search equity and external backlinks.

---

# 26. REDIRECTS

Map all redirects.

Look for:

- chains
- loops
- temporary redirects where permanent are warranted
- permanent redirects where temporary should be used
- redirects to irrelevant destinations

---

# 27. REDIRECT CHAINS

Example:

```text
A
↓
B
↓
C
↓
D
```

If it can be resolved directly:

```text
A
↓
D
```

report unnecessary chain latency where real impact exists.

---

# 28. REDIRECT LOOPS

Actively inspect intersections between:

- locale
- auth
- trailing slash
- domain
- middleware

---

# 29. 404

Verify the actual HTTP status code for missing resources.

A visual "Not found" page returning HTTP 200 represents a soft 404 defect.

---

# 30. SOFT 404

Look for pages displaying:

```text
Resource not found
```

while returning HTTP 200.

Particularly prevalent on dynamic routes.

---

# 31. DELETED CONTENT

For deleted content, evaluate:

- 404
- 410
- redirect

based on context.

Do not automatically redirect every deleted page to the homepage.

---

# 32. 5XX

Ensure unhandled server exceptions do not return HTTP 200 with an error screen.

---

# 33. STATUS CODE CONSISTENCY

For major route archetypes, document:

| Route type | Expected | Actual |
|---|---|---|

---

# 34. PAGE TITLE

For every indexable page, verify:

- present
- unique
- descriptive of page content
- not generic
- contains no unresolved template placeholders

Example of a broken pattern:

```text
App
App
App
App
```

across all views.

---

# 35. TITLE TEMPLATE

If a metadata title template exists:

```text
Page | Brand
```

verify that nested layouts do not produce:

```text
Page | Brand | Brand
```

through redundant wrapping.

---

# 36. TITLE LENGTH

Do not treat strict character counts as immutable SEO laws.

Instead evaluate:

- truncation risk in SERP snippets
- redundant brand repetitions
- descriptive clarity

---

# 37. META DESCRIPTION

Verify:

- presence on key landing and content views
- uniqueness
- relevance
- absence of placeholder copy
- absence of identical duplicate descriptions

A meta description is not a ranking factor.

Treat it as a search result presentation and click-through asset.

---

# 38. DYNAMIC METADATA

When the framework generates metadata dynamically, inspect:

- missing resources
- undefined property values
- duplicate fallback values
- exception handling

---

# 39. METADATA FETCH

If metadata generation triggers separate network requests, verify that the same resource is not fetched redundantly during page rendering.

This sits at the intersection of SEO and performance.

---

# 40. OPEN GRAPH

Check:

- title
- description
- image
- URL
- type

for social-share critical pages.

Distinguish social preview issues from core search engine indexing defects.

---

# 41. OG IMAGE

Verify:

- absolute URL
- accessible, valid asset
- proper dimensions where relevant
- dynamic generation reliability
- fallback image availability

---

# 42. TWITTER/X METADATA

If implemented, verify alignment with Open Graph metadata.

---

# 43. SOCIAL SHARE DEBUGGING

If preview generation fails, inspect:

- server-rendered metadata
- caching headers
- image URLs
- redirects
- authentication barriers

Social platform scrapers rarely execute JavaScript like modern web browsers.

---

# 44. STRUCTURED DATA

Map JSON-LD/microdata schemas.

Identify schema types in use:

- Article
- BlogPosting
- BreadcrumbList
- Organization
- WebSite
- Product
- FAQ
- JobPosting

---

# 45. STRUCTURED DATA VALIDITY

Check:

- JSON syntax
- required and recommended properties
- URL validity
- date formatting
- image references
- author references

Do not add schema markup merely because a template exists.

It must faithfully describe the visible page content.

---

# 46. STRUCTURED DATA VS VISIBLE CONTENT

Structured data must never assert facts that users cannot see or that are false.

Look for semantic drift between JSON-LD and page content.

---

# 47. DUPLICATE STRUCTURED DATA

Ensure the framework or CMS does not emit duplicate schema blocks.

---

# 48. BREADCRUMB STRUCTURED DATA

If visual breadcrumbs exist, verify alignment across:

- visible breadcrumb hierarchy
- URL structure
- BreadcrumbList JSON-LD

---

# 49. ARTICLE METADATA

For article pages, verify:

- headline
- datePublished
- dateModified
- author
- image
- canonical URL

where relevant.

---

# 50. DATES

Do not update `dateModified` automatically on every deployment if content remained unaltered.

That provides an untruthful freshness signal to crawlers.

---

# 51. PAGINATION

If content spans multiple pages, check:

- unique URLs
- self-referential canonicals
- indexability
- internal link traversal

Do not blindly canonicalize all pagination pages to page 1 without content analysis.

---

# 52. INFINITE SCROLL

If content is revealed exclusively via infinite scroll, ensure crawlers have an accessible paginated or link-navigable fallback if the content is SEO-relevant.

---

# 53. LOAD MORE

A "Load More" button fetching records exclusively via client-side JavaScript can obscure deeper items from crawler discovery.

Verify the underlying route/link architecture.

---

# 54. JAVASCRIPT RENDERING

Determine how much SEO-relevant content is present in the initial server HTML payload.

Look for:

- empty HTML shells
- content appearing only after client API calls
- metadata generated exclusively client-side
- links injected only after user interaction

---

# 55. CSR SEO RISK

Client-Side Rendering is not an automatic SEO failure.

However, evaluate:

- rendering availability
- latency and timeout risks
- crawl budget and reliability
- initial metadata presence

Avoid repeating the oversimplified myth:

> Google does not execute JavaScript.

Modern crawlers render JavaScript, but with resource constraints and deferred scheduling.

---

# 56. SSR

If Server-Side Rendering is utilized, verify that critical indexable content is delivered in the initial server response.

---

# 57. SSG

For static generation, check:

- content freshness
- rebuild schedules
- stale data
- inclusion of newly published pages

---

# 58. ISR / REVALIDATION

If Incremental Static Regeneration is used, verify that search engines do not receive excessively stale data due to flawed cache invalidation rules.

---

# 59. HYDRATION

Hydration mismatches can lead to:

- disappearing content
- altered link structures
- runtime client errors

Analyze whether crawlers and browsers observe inconsistent states.

---

# 60. CONTENT VISIBILITY

Look for critical content enclosed within:

- tabs
- accordions
- modals
- interactive disclosures

Hidden content is not automatically de-indexed.

Inspect how it is delivered in the DOM.

---

# 61. AUTHENTICATED CONTENT

Private or user-specific content should generally not be indexable.

Verify that authenticated views do not leak into sitemaps or public search engine directives.

---

# 62. SEARCH RESULT PAGES

Internal site search results frequently generate thin, duplicate URLs.

Evaluate:

- indexability
- query parameter patterns
- noindex directives

against the actual content model.

---

# 63. FILTER PAGES

Certain faceted filter combinations represent high-value landing pages.

Others represent an infinite crawl sink.

Do not apply a blanket rule across all combinations.

---

# 64. THIN CONTENT TECHNICAL SIGNALS

Do not critique prose quality without being asked.

However, identify technical pages with:

- minimal or zero content
- template-only shells
- empty category archives
- auto-generated pages offering no distinct value

Flag them as SEO risks, not confirmed algorithmic penalties.

---

# 65. DUPLICATE TEMPLATE PAGES

If thousands of programmatic routes differ by only a single keyword variable, document the template duplication risk.

Do not jump to unsupported penalty conclusions.

---

# 66. INTERNAL SEARCH INDEXATION

Ensure the application does not expose an infinite number of indexable URLs derived from arbitrary user search inputs.

---

# 67. INTERNATIONAL SEO

If multiple locales exist, verify:

- locale route structures
- canonical tags
- alternate URLs
- hreflang tags
- default fallback language

---

# 68. HREFLANG

If implemented, check:

- valid ISO language and region codes
- reciprocal return tags
- self-referential hreflang
- canonical consistency
- correct regional mapping

Do not implement hreflang if the project does not maintain internationalized versions.

---

# 69. LANGUAGE SWITCHER

Language switchers should direct users to the exact translated equivalent of the active page where available.

Do not reset users to the home page unnecessarily.

---

# 70. AUTO-REDIRECT BY LANGUAGE

Aggressive IP or header-based locale redirects can block search crawlers from discovering localized regional content.

Verify how bots and users are routed.

---

# 71. GEO REDIRECTS

If present, analyze:

- crawlability
- canonical relationships
- alternate locale accessibility

---

# 72. MOBILE SEO

On responsive URLs:

verify content parity between mobile and desktop presentations.

If separate mobile URLs exist, scrutinize canonical and alternate link relationships.

---

# 73. CONTENT PARITY

Do not hide substantial SEO copy exclusively on mobile viewports if mobile-first crawlers inspect that version.

---

# 74. IMAGE SEO

For important images, inspect:

- alt attributes
- meaningful filenames
- surrounding descriptive context
- crawlability
- image sitemaps where justified

---

# 75. LAZY LOADED IMAGES

Ensure lazy loading implementations provide crawlers with valid fallback image source attributes (`src`).

---

# 76. BACKGROUND IMAGES

Critical informative images rendered purely as CSS background images lack semantic discovery value.

Evaluate in context.

---

# 77. VIDEO SEO

If video is central to content value, verify:

- title
- description
- transcript availability
- VideoObject structured data
- thumbnail image

where appropriate.

---

# 78. PDF SEO

If downloadable PDFs represent key public content, inspect:

- linkability
- embedded metadata
- duplicate content conflicts with HTML counterparts

only where relevant to the project.

---

# 79. HEADINGS

Analyze heading hierarchy as a signal of content organization.

Do not enforce the obsolete doctrine that exactly one `h1` must exist regardless of context.

Semantic clarity and logical organization are what matter.

---

# 80. MAIN CONTENT

Crawlers must effortlessly parse primary content.

Look for templates overwhelmed by repetitive boilerplate compared to unique page copy.

---

# 81. INTERNAL ANCHOR TEXT

Look for generic link labels:

```text
Click here
More
Read more
```

when lacking surrounding context to describe the target destination.

Do not demand keyword stuffing in anchor texts.

---

# 82. BROKEN LINKS

Where tooling allows, identify internal links pointing to:

- 404 errors
- unexpected redirect chains
- malformed URLs

---

# 83. EXTERNAL LINKS

You do not need to audit every outbound link for SEO purposes.

However, check:

- broken high-priority references
- unsafe user-generated links
- spam vulnerabilities

where relevant.

---

# 84. `nofollow`

Inspect usage of `nofollow`.

Do not append it blindly to all outbound links.

Analyze editorial intent.

---

# 85. USER-GENERATED CONTENT

If user-generated content (UGC) is hosted, inspect SEO abuse vectors:

- spam pages
- link injection
- autogenerated profile farms
- thin user pages

---

# 86. CANONICAL FOR UGC

If user-generated content can resolve under multiple URL structures, verify canonical consolidation.

---

# 87. PERFORMANCE AND SEO

Identify severe performance bottlenecks that degrade crawl efficiency or search user experience.

Do not turn this SEO audit into a full performance audit.

Reference only primary performance obstacles.

---

# 88. CORE WEB VITALS

If actual field metrics are unavailable:

```text
CWV: NOT MEASURED
```

Do not invent LCP, CLS, or INP scores.

Report only code-level risks.

---

# 89. SERVER RESPONSE

Extremely slow server responses (high TTFB) impair crawl budget and user engagement.

If unmeasured:

**NOT MEASURED**

---

# 90. SERVICE WORKER

Verify that PWA service workers do not serve stale or incorrect content to crawlers or visitors in a manner that undermines indexing.

---

# 91. CACHING

Look for metadata and content mismatches stemming from aggressive caching.

Example:

```text
new article title published
↓
page content updates
↓
old metadata remains cached at edge
```

---

# 92. CDN

Inspect:

- stale edge redirects
- stale robots.txt
- stale sitemaps
- cached 404 responses

where CDN rules are defined.

---

# 93. ERROR PAGES

A 404 view can feature helpful UX, but it must emit an HTTP 404 status header.

---

# 94. MAINTENANCE MODE

If maintenance mode is deployed, verify its status code (e.g., HTTP 503 with Retry-After).

Returning HTTP 200 or 404 during maintenance harms indexing.

---

# 95. TEMPORARY OUTAGES

Ensure temporary backend failures signal appropriate retry states rather than permanent deletion signals.

---

# 96. DOMAIN MIGRATION

If domains were migrated, verify:

- 1:1 permanent redirects
- canonical updates
- sitemap updates
- internal link refactoring

---

# 97. URL MIGRATION

If route patterns changed:

```text
/old-category/post
↓
/post
```

verify the preservation of link equity via permanent redirects.

---

# 98. LEGACY ROUTES

Identify legacy route handlers that:

- still return content
- redirect
- return 404

Classify them.

---

# 99. DUPLICATE HOME URLS

Check:

```text
/
/index
/home
```

if multiple URLs serve identical home page content.

---

# 100. BASE URL CONFIG

Inspect the root site URL configuration.

Look for:

- localhost leaks in production metadata
- preview domain hostnames
- staging URLs
- incorrect protocols

---

# 101. ABSOLUTE URL GENERATION

For:

- canonical tags
- Open Graph tags
- sitemap entries
- structured data IDs

ensure fully qualified absolute URLs are generated.

---

# 102. ENVIRONMENT VARIABLES

Map SEO-relevant environment variables:

- site URL
- public domain
- default locale
- indexing flag

Look for staging/production drift.

---

# 103. PREVIEW DEPLOYMENTS

If hosting platforms generate preview deployment URLs, ensure they are protected from accidental indexation.

---

# 104. SEARCH CONSOLE

If Google Search Console data is unavailable, do not speculate on:

- impressions
- click-through rates
- indexing coverage
- keyword rankings

Explicitly note:

**SEARCH CONSOLE DATA: NOT AVAILABLE**

---

# 105. ANALYTICS

Analytics data is not direct proof of SEO technical health.

Use it only when available to identify:

- primary organic landing pages
- broken routes
- user drop-offs

---

# 106. RANKING CLAIMS

Never assert:

> Making this change will boost this page to rank position 1.

Technical SEO removes impediments; rankings depend on numerous complex algorithmic signals.

---

# 107. KEYWORD CLAIMS

Do not evaluate keyword selection unless explicitly requested.

This audit focuses primarily on technical foundations.

---

# 108. INDEX BLOAT

Evaluate whether the application generates excessive low-value URLs.

Potential sources:

- faceted filters
- search results
- pagination
- tags
- profiles
- auto-generated utility routes

Do not categorize this as a confirmed issue without indexation evidence.

---

# 109. CRAWL SPACE

Map combinatorial URL generation patterns.

Example:

```text
category
x
sort
x
filter
x
page
```

which can generate vast route permutations.

---

# 110. ORPHAN PAGE DETECTION

Where feasible, compare:

```text
sitemap/routes
vs
internal links
```

A page may reside in a sitemap while completely lacking incoming internal links.

---

# 111. NAVIGATION DEPTH

Evaluate click distance from main entry points to valuable content.

Avoid arbitrary rules like "every page must be within three clicks".

Evaluate relative architectural hierarchy.

---

# 112. CATEGORY ARCHITECTURE

For content-heavy platforms, verify:

- categories
- tags
- archives
- breadcrumbs

Look for duplicate or competing taxonomy hierarchies.

---

# 113. TAG PAGES

Tag pages can offer indexable value or constitute thin content.

Evaluate real utility.

Do not apply `noindex` across all tags blindly.

---

# 114. ARCHIVE PAGES

Check:

- pagination handling
- descriptive titles
- canonicalization
- internal linking

---

# 115. EMPTY TAXONOMY

Empty category or tag archives must not be indexed without cause.

---

# 116. DYNAMIC CONTENT

If a page renders empty until an external API responds, evaluate failure modes.

Crawlers may index an empty shell if third-party services timeout.

---

# 117. CLIENT ERRORS

If an uncaught JavaScript error aborts main content rendering, it creates both an SEO and UX failure.

Report cross-cutting findings where appropriate.

---

# 118. CONTENT FLASH / REPLACEMENT

If the server renders one version of content and client-side JavaScript immediately replaces it with different copy, inspect consistency.

---

# 119. PERSONALIZED CONTENT

Public SEO landing pages must not depend entirely on user personalization if crawlers require stable canonical content.

---

# 120. A/B TESTING

If experiments are active, inspect:

- canonical tags
- cloaking risks
- redirects
- content consistency

Do not label standard A/B testing as cloaking without proof of malicious user-agent branching.

---

# 121. COOKIE-DEPENDENT CONTENT

If a crawler visiting without cookies sees drastically divergent content, verify intent.

---

# 122. GEO CONTENT

The same principle applies to geolocation-dependent content variations.

---

# 123. STRUCTURED DATA ERROR HANDLING

If JSON-LD is constructed from incomplete data, ensure it does not produce malformed JSON or empty strings.

---

# 124. ESCAPING

Dynamic metadata and structured data must safely handle special characters in user-provided content.

Document technical injection risks, deferring in-depth security analysis to the security audit.

---

# 125. CMS CONTENT

If a CMS is present, verify whether editors can inadvertently produce:

- missing metadata
- duplicate slugs
- broken heading hierarchies
- accidental `noindex` tags

Document validation safeguards where present.

---

# 126. DEFAULT METADATA

Fallback metadata should prevent empty tags without generating hundreds of identical title/description combinations across unrelated routes.

---

# 127. CONTENT DELETION

When content is deleted in the CMS, verify lifecycle handling for:

- sitemaps
- internal links
- route resolution
- canonical references

---

# 128. DRAFT CONTENT

Draft or unpublished content must never be publicly indexable.

---

# 129. SCHEDULED CONTENT

For scheduled publication flows, verify timezone logic and sitemap/indexability synchronization.

---

# 130. SEO TESTS

Review existing automated tests for:

- metadata
- sitemaps
- robots.txt
- canonical tags
- redirects
- HTTP status codes

---

# 131. SNAPSHOT TESTS

Metadata snapshot tests are helpful, but they do not prove canonical URLs match the actual live production domain.

---

# 132. E2E SEO CHECKS

If End-to-End test suites exist, check assertions for:

- titles
- canonical tags
- robots directives
- JSON-LD schemas
- status codes

across critical public pages.

---

# 133. FINDING FORMAT

For every serious finding:

```text
ID:
Severity:
Category:
Confidence:
Status:
 
Route/URL pattern:
File:
Function/Component:
Relevant location:
 
Problem:
 
Evidence:
 
Crawler/Search Flow:
 
Expected behavior:
 
Actual behavior:
 
SEO impact:
 
User impact:
 
Root cause:
 
Recommended remediation:
 
How to verify:
 
Regression test:
 
Complexity:
XS / S / M / L / XL
```

---

# 134. SEVERITY

Use:

## P1 - HIGH

- large section of the application is unindexable
- canonicalization is severely broken
- production environment outputs `noindex`
- crawler access blocked for critical indexable content
- systemic soft 404 defect
- catastrophic redirect or indexing error

## P2 - MEDIUM

- significant subset of content suffers indexation or canonicalization defects
- structured data fundamentally conflicts with visible content
- internal linking architecture makes important pages undiscoverable

## P3 - LOW

- localized metadata or technical SEO issue of limited reach

## P4 - IMPROVEMENT

- optimization without an active technical blocker

Reserve P0 exclusively for extreme disasters that completely de-index the public product or expose sensitive internal infrastructure to search indices.

---

# 135. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

directly proven through rendered HTTP output, production configuration, or verified HTTP responses.

MEDIUM:

strong codebase evidence, but production crawling was not observed directly.

LOW:

requires Google Search Console, server access logs, or live search data to confirm.

---

# 136. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 137. SOURCE OF TRUTH

For technical SEO audits, priority order is:

1. live production HTTP and rendered output
2. production configuration
3. application code
4. generated metadata and sitemaps
5. documentation

If documentation asserts one behavior and production outputs another, production behavior takes precedence.

---

# 138. DO NOT MODIFY CODE

During the audit:

- do not alter metadata
- do not modify redirects
- do not edit robots.txt
- do not change sitemaps
- do not inject schema markup
- do not delete query parameter handlers

Complete the audit first.

---

# 139. OUTPUT - TECHNICAL_SEO_AUDIT.md

Structure the final audit report as follows:

## 1. Executive Summary

- framework
- rendering architecture
- indexability status
- primary technical SEO risks
- positive implementations
- scope requiring Search Console/live search verification

## 2. Route SEO Inventory

| Route Pattern | Indexable | Canonical | Status | Sitemap | Metadata | Result |
|---|---|---|---|---|---|---|

## 3. Crawlability Audit

## 4. Indexability Audit

## 5. Robots Audit

## 6. Sitemap Audit

## 7. Canonicalization Audit

## 8. Duplicate URL Audit

## 9. Redirect Audit

## 10. HTTP Status Audit

## 11. Metadata Audit

## 12. Open Graph / Social Audit

## 13. Structured Data Audit

## 14. Internal Linking Audit

## 15. Rendering / JavaScript SEO Audit

## 16. International SEO Audit

## 17. Image / Media SEO

## 18. Performance SEO Risks

## 19. CMS / Dynamic Content Risks

## 20. Findings Summary

| ID | Severity | Category | Route | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 21. P1 Findings

## 22. P2 Findings

## 23. P3 Findings

## 24. P4 Improvements

## 25. Things Done Well

## 26. Search Data Required

Detail what requires validation via Search Console or server crawler logs.

## 27. Unknown / Not Verified

## 28. Remediation Roadmap

### Phase 1 - Indexing blockers

### Phase 2 - Canonical/redirect correctness

### Phase 3 - Metadata/structured data

### Phase 4 - Internal architecture

### Phase 5 - Enhancements

---

# 140. CRAWLER SECOND PASS

Following the initial audit, evaluate the site from the perspective of an automated crawler that:

- has no user credentials
- has no access to localStorage
- maintains no user session
- accesses URLs directly
- does not click complex custom UI

For every key page, ask:

> What exact payload is received?

Verify:

- HTTP status
- raw HTML
- title tag
- canonical link
- robots directives
- main content
- links

---

# 141. DUPLICATE URL SECOND PASS

For key pages, test permutations:

```text
http
https

www
non-www

trailing slash
no trailing slash

uppercase
lowercase

query params
tracking params
```

Verify that all paths converge onto a single canonical destination.

---

# 142. NEW CONTENT PASS

Simulate publishing a brand-new article, product, or page.

Ask:

1. How does a crawler discover its existence?
2. When is it added to the sitemap?
3. Does an internal link point to it?
4. Is metadata populated?
5. Does its canonical tag point to itself?
6. Does the route return HTTP 200?

---

# 143. DELETED CONTENT PASS

Simulate deleting an existing resource.

Ask:

1. Does the sitemap still list the URL?
2. Do internal links still point to it?
3. What HTTP status is returned?
4. Is there an appropriate redirect?
5. Does any canonical reference break?

---

# 144. URL CHANGE PASS

Simulate changing a slug.

Ask:

> What happens to the legacy URL that search engines and external websites already link to?

---

# 145. PRODUCTION ENVIRONMENT PASS

Specifically re-check:

- base site URL
- robots.txt rules
- canonical hosts
- sitemap hosts
- `noindex` directives
- preview deployment configs
- staging environment variables

These subtle configuration details carry massive SEO consequences.

---

# 146. SEARCH ENGINE PRESENTATION PASS

For critical landing views, review the combined alignment of:

```text
title
description
canonical
OG
structured data
```

Look for contradictions.

For example:

```text
title = Product A
OG title = Product B
JSON-LD = Product C
```

---

# 147. FINAL QUALITY GATE

Before returning your final response, verify:

- you made no unsubstantiated ranking predictions
- you asserted no Search Console metrics without verified data
- you did not conflate copywriting critique with technical SEO
- every P1/P2 finding describes a concrete crawl/indexation failure
- `noindex` findings were checked against target environments
- sitemap findings were compared with actual route definitions
- canonical findings detail concrete duplication or conflict scenarios
- redirect findings verify HTTP status codes and target URLs
- 404 findings verify actual HTTP response status codes
- structured data corresponds to visible page facts
- CSR was not labeled an SEO failure automatically
- performance assertions are grounded in code evidence
- Core Web Vitals were not fabricated without empirical data
- international SEO was analyzed only where present
- recommendations do not introduce new duplicate content or indexing issues
- bugs and improvements are clearly distinguished

---

# FINAL RULE

I do not want generic reports like:

> Add meta descriptions, a sitemap, robots.txt, and more keywords.

That is not a technical SEO audit.

I want you to reconstruct the real crawler journey:

```text
crawler discovers URL
↓
request
↓
HTTP response
↓
robots rules
↓
rendered content
↓
canonical
↓
metadata
↓
internal links
↓
indexability
```

For every serious issue, explain:

- which URL or pattern is impacted
- what the crawler receives
- why that represents a failure
- how broadly the issue extends
- the technical root cause
- how to resolve it
- how to verify the fix

Example of a quality finding:

```text
/articles/example
↓
server returns HTTP 200
↓
UI renders "Article not found"
↓
route fails to return a 404 status
↓
crawler encounters a soft 404
↓
invalid URL may remain indexed as a valid page
```

or:

```text
production deploy
↓
ROBOTS_INDEX=false
↓
global metadata emits noindex
↓
all public pages receive noindex
↓
entire website becomes de-indexed
```

or:

```text
/product/red
/product/blue
↓
both output canonical /product
↓
two distinct indexable pages emit identical canonical tags
↓
search engines receive contradictory canonical signals
```

If evidence is insufficient:

**NOT VERIFIED.**

If an issue depends on Search Console or server crawler logs:

explicitly state what external telemetry is required.

If it is merely an optimization:

**P4 - IMPROVEMENT.**

It is better to discover 8 confirmed indexing or canonical defects than to generate 80 generic SEO tips.

The objective is a technically precise SEO audit that engineers can directly translate into concrete fixes, automated tests, and production verification steps.
