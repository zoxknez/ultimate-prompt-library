#!/usr/bin/env node
// Generates machine-readable indexes and the navigation tables in Markdown files.
//
//   indexes/prompts.json         one entry per prompt ID (all languages)
//   indexes/prompts.<lang>.json  one entry per localized file
//   prompts/<lang>/<category>/README.md                 <!-- UPL:BEGIN category-prompts -->
//   prompts/<lang>/<category>/<subcategory>/README.md   <!-- UPL:BEGIN subcategory-prompts -->
//   docs/roadmap.md, docs/roadmap.sr.md                 <!-- UPL:BEGIN roadmap-planned -->
//
// Usage: node scripts/generate-index.mjs [--check]
// With --check nothing is written; the script fails if any output is out of date.

import { buildCollections, categoryCode, loadValidRepository, Outputs, subcategoryDir, PROMPTS_DIR } from './lib/upl.mjs';
import { categoryBlock, roadmapPlannedBlock, subcategoryBlock } from './lib/render.mjs';

const repo = loadValidRepository();
const out = new Outputs('generate-index');
const languages = repo.catalog.languages.map((l) => l.code);
const primary = repo.catalog.languages.find((l) => l.primary).code;
const collections = buildCollections(repo);

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const optional = (data) => ({
  ...(data.tags?.length ? { tags: data.tags } : {}),
  ...(data.replaced_by ? { replacedBy: data.replaced_by } : {}),
  ...(data.updated ? { updated: data.updated } : {}),
  ...(data.authors?.length ? { authors: data.authors } : {}),
});

// ---------------------------------------------------------------------------
// JSON indexes (available prompts only; planned prompts live in catalog.json)

const combined = [];
const perLanguage = Object.fromEntries(languages.map((code) => [code, []]));

for (const collection of collections) {
  const { category } = collection;
  for (const { entry, prompt } of collection.entries) {
    if (!prompt) continue;
    const present = languages.filter((code) => prompt.localizations[code]);
    const main = prompt.localizations[primary] ?? prompt.localizations[present[0]];
    const pick = (fn) => Object.fromEntries(present.map((code) => [code, fn(prompt.localizations[code])]));

    combined.push({
      id: entry.id,
      number: entry.number,
      slug: entry.slug,
      category: categoryCode(category.id),
      categoryId: category.id,
      categorySlug: category.slug,
      subcategory: entry.subcategory,
      status: main.data.status,
      version: main.data.version,
      languages: present,
      titles: pick((f) => f.data.title),
      versions: pick((f) => f.data.version),
      files: pick((f) => f.path),
      ...optional(main.data),
    });

    for (const code of present) {
      const file = prompt.localizations[code];
      perLanguage[code].push({
        id: entry.id,
        number: entry.number,
        slug: entry.slug,
        title: file.data.title,
        language: code,
        category: file.data.category,
        categoryId: category.id,
        categorySlug: category.slug,
        subcategory: file.data.subcategory,
        subcategoryId: file.data.subcategory_id,
        status: file.data.status,
        version: file.data.version,
        path: file.path,
        ...optional(file.data),
      });
    }
  }
}

out.set('indexes/prompts.json', json({ schemaVersion: 1, languages, count: combined.length, prompts: combined }));
for (const code of languages) {
  out.set(
    `indexes/prompts.${code}.json`,
    json({ schemaVersion: 1, language: code, count: perLanguage[code].length, prompts: perLanguage[code] }),
  );
}

// ---------------------------------------------------------------------------
// Markdown navigation blocks

const docLinks = (code) => ({
  roadmap: code === primary ? 'docs/roadmap.md' : `docs/roadmap.${code}.md`,
  contributing: code === primary ? 'CONTRIBUTING.md' : `CONTRIBUTING.${code}.md`,
});

for (const code of languages) {
  for (const collection of collections) {
    const catDir = `${PROMPTS_DIR}/${code}/${collection.category.dirs[code]}`;
    const catReadme = `${catDir}/README.md`;
    out.block(
      catReadme,
      'category-prompts',
      categoryBlock({ lang: code, fromFile: catReadme, collection, languages, docLinks: docLinks(code) }),
    );
    for (const group of collection.subcategories) {
      const subReadme = `${catDir}/${subcategoryDir(group.sub)}/README.md`;
      out.block(
        subReadme,
        'subcategory-prompts',
        subcategoryBlock({ lang: code, fromFile: subReadme, collection, group, languages }),
      );
    }
  }
  out.block(docLinks(code).roadmap, 'roadmap-planned', roadmapPlannedBlock({ lang: code, collections }));
}

process.exitCode = out.finish();
