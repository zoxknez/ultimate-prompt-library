#!/usr/bin/env node
// Structural validation of catalog.json and every prompt file under prompts/.
// Checks layout, filenames, required/optional front matter, IDs, numbering,
// language/category/subcategory consistency and duplicates. It never rewrites files.

import { loadRepository } from './lib/upl.mjs';

const repo = loadRepository();
const languages = repo.catalog.languages.map((l) => l.code);
const perLanguage = languages.map((code) => `${code}: ${repo.files.filter((f) => f.lang === code).length}`).join(', ');
const catalogued = repo.catalog.categories.reduce((sum, c) => sum + c.prompts.length, 0);

process.exitCode = repo.report.finish([
  `Categories: ${repo.catalog.categories.length}`,
  `Catalogued prompt IDs: ${catalogued}`,
  `Valid prompt files: ${repo.files.length} (${perLanguage})`,
  `Unique prompt IDs with files: ${repo.prompts.size}`,
]);
