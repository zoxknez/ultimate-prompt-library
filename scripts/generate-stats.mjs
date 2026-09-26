#!/usr/bin/env node
// Computes collection statistics and renders the status blocks in the READMEs and roadmaps.
//
//   indexes/stats.json
//   README.md / README.<lang>.md    <!-- UPL:BEGIN collection-stats -->, category-status, subcategory-status
//   docs/roadmap.md / roadmap.<lang>.md    <!-- UPL:BEGIN roadmap-progress -->
//
// Only files with valid prompt front matter are counted. Catalogued-but-unwritten prompts
// count as "planned", never as available.
//
// Usage: node scripts/generate-stats.mjs [--check]

import { buildCollections, categoryCode, loadValidRepository, Outputs, STATUSES, subcategoryDir, PROMPTS_DIR } from './lib/upl.mjs';
import { link, progressLabel, t } from './lib/render.mjs';

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
// Markdown blocks

const readmeFor = (code) => (code === primary ? 'README.md' : `README.${code}.md`);
const roadmapFor = (code) => (code === primary ? 'docs/roadmap.md' : `docs/roadmap.${code}.md`);
const languageNames = (code) =>
  languages.map((l) => (code === primary ? l.name : l.nativeName)).join(', ');

for (const code of codes) {
  const s = t(code);
  const readme = readmeFor(code);

  const progressLines = collections
    .filter((c) => c.planned > 0)
    .map((c) => {
      const done = stats.collections[categoryCode(c.category.id)].completedSubcategories;
      return `- **${c.category.names[code]}** ${s.collectionProgress}: **${c.available} / ${c.planned}** (${done} ${s.of} ${c.subcategories.length} ${s.subcategoriesComplete})`;
    });
  out.block(
    readme,
    'collection-stats',
    [
      `- **${stats.uniquePrompts}** ${s.uniquePrompts}`,
      `- **${stats.localizedPromptFiles}** ${s.localizedFiles}`,
      `- **${stats.languages}** ${s.languages} (${languageNames(code)})`,
      `- **${stats.categoriesWithContent}** ${s.of} ${stats.categories} ${s.categoriesWithContent}`,
      ...progressLines,
    ].join('\n'),
  );

  out.block(
    readme,
    'category-status',
    [
      `| # | ${s.category} | ${s.statusHeader} |`,
      '|---|---|---|',
      ...collections.map(
        (c) =>
          `| ${String(c.category.order).padStart(2, '0')} | [${c.category.names[code]}](${link(
            readme,
            `${PROMPTS_DIR}/${code}/${c.category.dirs[code]}/README.md`,
          )}) | ${progressLabel(code, c.available, c.planned)} |`,
      ),
    ].join('\n'),
  );

  out.block(
    readme,
    'subcategory-status',
    collections
      .filter((c) => c.subcategories.length)
      .map((c) =>
        [
          `**${c.category.names[code]}**`,
          '',
          `| ${s.subcategory} | ${s.progress} | ${s.statusHeader} |`,
          '|---|:---:|---|',
          ...c.subcategories.map(
            (g) =>
              `| [${g.sub.names[code]}](${link(
                readme,
                `${PROMPTS_DIR}/${code}/${c.category.dirs[code]}/${subcategoryDir(g.sub)}/README.md`,
              )}) | ${g.available}/${g.planned} | ${progressLabel(code, g.available, g.planned).split(' - ')[0]} |`,
          ),
        ].join('\n'),
      )
      .join('\n\n'),
  );

  out.block(
    roadmapFor(code),
    'roadmap-progress',
    [
      `| # | ${s.category} | ${s.progress} | ${s.remaining} | ${s.statusHeader} |`,
      '|---|---|:---:|:---:|---|',
      ...collections.map(
        (c) =>
          `| ${String(c.category.order).padStart(2, '0')} | ${c.category.names[code]} | ${
            c.planned ? `${c.available} / ${c.planned}` : '-'
          } | ${c.planned ? c.planned - c.available : '-'} | ${progressLabel(code, c.available, c.planned).split(' - ')[0]} |`,
      ),
    ].join('\n'),
  );
}

process.exitCode = out.finish();
