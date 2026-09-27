#!/usr/bin/env node
import { loadValidRepository } from './lib/upl.mjs';
import { buildEmpiricalEvalSuite, validateEmpiricalEvalSuite, V2_EVAL_CLASSES } from './lib/v2-evals.mjs';

const repo = loadValidRepository();
const requested = process.argv.find((arg) => arg.startsWith('--prompt='))?.slice('--prompt='.length) ?? null;
const lang = process.argv.find((arg) => arg.startsWith('--lang='))?.slice('--lang='.length) ?? 'en';

if (!['en', 'sr'].includes(lang)) {
  console.error('evals:v2: --lang must be en or sr');
  process.exit(1);
}

const suites = [];
for (const category of repo.catalog.categories) {
  for (const prompt of category.prompts) {
    if (requested && prompt.id !== requested) continue;
    const title = prompt.title?.[lang] || prompt.title?.en || prompt.id;
    const suite = buildEmpiricalEvalSuite({ ...prompt, title, language: lang, category_id: category.id, subcategory_id: prompt.subcategory, subcategory: prompt.subcategory }, lang);
    const errors = validateEmpiricalEvalSuite(suite);
    if (errors.length) {
      console.error(prompt.id + ': ' + errors.join('; '));
      process.exit(1);
    }
    suites.push(suite);
  }
}

if (requested && !suites.length) {
  console.error('evals:v2: prompt not found: ' + requested);
  process.exit(1);
}

if (requested) {
  console.log(JSON.stringify(suites[0], null, 2));
} else {
  console.log(
    'evals:v2: ' + suites.length + ' prompts / ' +
    (suites.length * V2_EVAL_CLASSES.length) + ' fixtures / classes=' +
    V2_EVAL_CLASSES.join(',') + ' -> OK'
  );
}
