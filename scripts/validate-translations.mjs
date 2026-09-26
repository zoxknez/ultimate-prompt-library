#!/usr/bin/env node
// Checks that localized versions of the same prompt ID correspond to each other.
//
// Errors:   stable prompt missing a language, identity fields differ (id, number, slug,
//           category_id, subcategory_id), or files are not at corresponding paths.
// Warnings: version or status differs between languages, a non-stable prompt is missing
//           a language, or two languages have byte-identical bodies (possible untranslated copy).

import { loadRepository, Reporter, subcategoryDir } from './lib/upl.mjs';

const repo = loadRepository();
const report = new Reporter('validate-translations');
if (repo.report.errors.length) {
  report.error('prompts/', `structural validation has ${repo.report.errors.length} error(s); run npm run validate:prompts`);
}

const languages = repo.catalog.languages.map((l) => l.code);
const IDENTITY = ['id', 'number', 'slug', 'category_id', 'subcategory_id'];
let completePairs = 0;

for (const prompt of [...repo.prompts.values()].sort((a, b) => a.id.localeCompare(b.id))) {
  const present = languages.filter((code) => prompt.localizations[code]);
  const missing = languages.filter((code) => !prompt.localizations[code]);
  const files = present.map((code) => prompt.localizations[code]);
  const where = prompt.id;

  const isStable = files.some((f) => f.data.status === 'stable');
  for (const code of missing) {
    const message = `MISSING LANGUAGE PAIR: no "${code}" file (present: ${present.join(', ')})`;
    if (isStable) report.error(where, message);
    else report.warn(where, `${message}; required before the prompt becomes stable`);
  }
  if (!missing.length) completePairs++;

  const [first, ...others] = files;
  for (const other of others) {
    for (const key of IDENTITY) {
      if (first.data[key] !== other.data[key]) {
        report.error(where, `${key} differs: ${first.lang}="${first.data[key]}" vs ${other.lang}="${other.data[key]}"`);
      }
    }
    const expected = `prompts/${other.lang}/${first.category.dirs[other.lang]}/${subcategoryDir(first.subcategory)}/${
      first.path.split('/').pop()
    }`;
    if (other.path !== expected) report.error(other.path, `does not correspond to ${first.path} (expected ${expected})`);
    if (first.data.version !== other.data.version) {
      report.warn(where, `version differs: ${first.lang}=${first.data.version} vs ${other.lang}=${other.data.version}`);
    }
    if (first.data.status !== other.data.status) {
      report.warn(where, `status differs: ${first.lang}=${first.data.status} vs ${other.lang}=${other.data.status}`);
    }
    if (first.bodyHash === other.bodyHash) {
      report.warn(where, `${first.lang} and ${other.lang} bodies are identical; is the translation missing?`);
    }
  }
}

process.exitCode = report.finish([
  `Prompt IDs checked: ${repo.prompts.size}`,
  `Complete language sets (${languages.join('+')}): ${completePairs}`,
]);
