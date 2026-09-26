#!/usr/bin/env node
// Computes collection statistics and renders the status blocks in the READMEs and roadmaps.
//
//   indexes/stats.json
//   assets/banner.<lang>.<theme>.svg, assets/stats.<lang>.<theme>.svg   (theme: light, dark)
//   README.md / README.<lang>.md    <!-- UPL:BEGIN hero-badges -->, collection-stats, category-status,
//                                   subcategory-status
//   docs/roadmap.md / roadmap.<lang>.md    <!-- UPL:BEGIN roadmap-progress -->
//
// Only files with valid prompt front matter are counted. Catalogued-but-unwritten prompts
// count as "planned", never as available.
//
// Usage: node scripts/generate-stats.mjs [--check]

import { buildCollections, categoryCode, loadValidRepository, Outputs, STATUSES } from './lib/upl.mjs';
import {
  categoryGrid,
  emojiBar,
  heroBadges,
  progressLabel,
  statsPicture,
  subcategoryStatus,
  t,
} from './lib/render.mjs';
import { bannerSvg, statsSvg, THEMES } from './lib/svg.mjs';

const repo = loadValidRepository();
const out = new Outputs('generate-stats');
const languages = repo.catalog.languages;
const codes = languages.map((l) => l.code);
const primary = languages.find((l) => l.primary).code;
const collections = buildCollections(repo);

// ---------------------------------------------------------------------------
// Numbers

const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
for (const c of collections) for (const e of c.entries) if (e.available) byStatus[e.status]++;

const stats = {
  schemaVersion: 1,
  uniquePrompts: repo.prompts.size,
  localizedPromptFiles: repo.files.length,
  languages: codes.length,
  filesByLanguage: Object.fromEntries(codes.map((code) => [code, repo.files.filter((f) => f.lang === code).length])),
  byStatus,
  categories: collections.length,
  categoriesWithContent: collections.filter((c) => c.available > 0).length,
  planned: collections.reduce((sum, c) => sum + c.planned, 0),
  remaining: collections.reduce((sum, c) => sum + c.planned - c.available, 0),
  collections: Object.fromEntries(
    collections.map((c) => [
      categoryCode(c.category.id),
      {
        id: c.category.id,
        slug: c.category.slug,
        available: c.available,
        planned: c.planned,
        remaining: c.planned - c.available,
        subcategories: c.subcategories.length,
        completedSubcategories: c.subcategories.filter((g) => g.planned > 0 && g.available === g.planned).length,
        bySubcategory: Object.fromEntries(
          c.subcategories.map((g) => [g.sub.id, { available: g.available, planned: g.planned }]),
        ),
      },
    ]),
  ),
};
out.set('indexes/stats.json', `${JSON.stringify(stats, null, 2)}\n`);

// ---------------------------------------------------------------------------
// SVG artwork (light and dark variants per language)

for (const code of codes) {
  const s = t(code);
  const rows = collections
    .filter((c) => c.planned > 0)
    .map((c) => ({
      name: c.category.id === 'UPL-IT' ? `${s.initialIt} · ${c.category.names[code]}` : c.category.names[code],
      available: c.available,
      planned: c.planned,
      segments: c.subcategories.map((g) => ({ available: g.available, planned: g.planned })),
    }));
  for (const theme of Object.keys(THEMES)) {
    out.set(`assets/banner.${code}.${theme}.svg`, bannerSvg(code, theme));
    out.set(`assets/stats.${code}.${theme}.svg`, statsSvg(code, theme, stats, rows));
  }
}

// ---------------------------------------------------------------------------
// Markdown blocks

const readmeFor = (code) => (code === primary ? 'README.md' : `README.${code}.md`);
const roadmapFor = (code) => (code === primary ? 'docs/roadmap.md' : `docs/roadmap.${code}.md`);

for (const code of codes) {
  const s = t(code);
  const readme = readmeFor(code);

  out.block(readme, 'hero-badges', heroBadges({ lang: code, stats, collections }));
  out.block(readme, 'collection-stats', statsPicture({ lang: code, stats }));
  out.block(readme, 'category-status', categoryGrid({ lang: code, fromFile: readme, collections }));
  out.block(readme, 'subcategory-status', subcategoryStatus({ lang: code, fromFile: readme, collections }));

  out.block(
    roadmapFor(code),
    'roadmap-progress',
    [
      `| | ${s.category} | ${s.progress} | ${s.available2} | ${s.remaining} | ${s.statusHeader} |`,
      '|:---:|---|:---:|:---:|:---:|:---:|',
      ...collections.map(
        (c) =>
          `| ${c.category.icon ?? ''} | **${c.category.names[code]}** | ${c.planned ? emojiBar(c.available, c.planned) : '-'} | ${
            c.planned ? `${c.available} / ${c.planned}` : '-'
          } | ${c.planned ? c.planned - c.available : '-'} | ${progressLabel(code, c.available, c.planned).split(' - ')[0]} |`,
      ),
    ].join('\n'),
  );
}

process.exitCode = out.finish();
