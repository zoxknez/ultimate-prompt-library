#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadValidRepository } from './lib/upl.mjs';
import { V2_MARKER, V2_VERSION } from './lib/v2-quality.mjs';

const repo = loadValidRepository();
const errors = [];
const fail = (message) => errors.push(message);

if (repo.catalog.categories.length !== 10) fail('Expected exactly 10 categories.');
if (repo.prompts.size !== 1000) fail('Expected exactly 1000 unique prompts, found ' + repo.prompts.size + '.');
if (repo.files.length !== 2000) fail('Expected exactly 2000 localized prompt files, found ' + repo.files.length + '.');

const subProfiles = JSON.parse(readFileSync(new URL('./v2-subcategory-profiles.json', import.meta.url), 'utf8'));
const sourceProfiles = JSON.parse(readFileSync(new URL('./v2-source-profiles.json', import.meta.url), 'utf8'));
const subSourceProfiles = JSON.parse(readFileSync(new URL('./v2-subcategory-source-profiles.json', import.meta.url), 'utf8'));

if (Object.keys(subProfiles).length !== 100) fail('Expected exactly 100 subcategory v2 profiles.');
if (Object.keys(sourceProfiles).length !== 10) fail('Expected exactly 10 category authoritative source profiles.');
if (Object.keys(subSourceProfiles).length !== 100) fail('Expected exactly 100 subcategory authoritative source profiles.');

function validateSources(where, items) {
  if (!Array.isArray(items) || !items.length) {
    fail(where + ': source profile must be a non-empty array.');
    return;
  }
  const urls = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      fail(where + ': invalid source entry.');
      continue;
    }
    if (!item.label || typeof item.label !== 'string') fail(where + ': source entry missing label.');
    if (!item.url || typeof item.url !== 'string') fail(where + ': source entry missing URL.');
    else {
      if (!item.url.startsWith('https://')) fail(where + ': source URL must use HTTPS: ' + item.url);
      if (urls.has(item.url)) fail(where + ': duplicate source URL: ' + item.url);
      urls.add(item.url);
    }
    if (item.note != null && typeof item.note !== 'string') fail(where + ': source note must be a string.');
  }
}

for (const [categoryId, items] of Object.entries(sourceProfiles)) {
  validateSources('category source profile ' + categoryId, items);
}
for (const [subId, items] of Object.entries(subSourceProfiles)) {
  validateSources('subcategory source profile ' + subId, items);
}

const normalizedTitles = new Map();
for (const category of repo.catalog.categories) {
  for (const prompt of category.prompts) {
    const title = String(prompt.title?.en ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (!title) continue;
    if (normalizedTitles.has(title)) {
      fail(
        'Duplicate normalized English prompt title: "' + prompt.title.en + '" in ' +
        normalizedTitles.get(title) + ' and ' + prompt.id + '.'
      );
    } else {
      normalizedTitles.set(title, prompt.id);
    }
  }
}

for (const category of repo.catalog.categories) {
  if (category.prompts.length !== 100) fail(category.id + ': expected 100 prompts.');
  if (category.subcategories.length !== 10) fail(category.id + ': expected 10 subcategories.');
  if (!sourceProfiles[category.id]) fail(category.id + ': missing category authoritative source profile.');

  for (const sub of category.subcategories) {
    if (!subProfiles[sub.id]) fail(category.id + ': missing v2 subcategory profile for ' + sub.id + '.');
    if (!subSourceProfiles[sub.id]) fail(category.id + ': missing subcategory source profile for ' + sub.id + '.');
  }
}

for (const [id, prompt] of repo.prompts) {
  for (const lang of ['en', 'sr']) {
    const file = prompt.localizations[lang];
    if (!file) {
      fail(id + ': missing ' + lang + ' localization.');
      continue;
    }

    if (file.data.version !== V2_VERSION) fail(file.path + ': effective version is not ' + V2_VERSION + '.');
    if (!file.body.includes(V2_MARKER)) fail(file.path + ': missing v2 quality marker.');

    const subHeading = lang === 'sr'
      ? 'PODKATEGORIJSKI BEST-PRACTICE PROFIL'
      : 'SUBCATEGORY BEST-PRACTICE PROFILE';
    if (!file.body.includes(subHeading)) fail(file.path + ': missing subcategory best-practice profile.');

    if (!file.body.includes('PROMPT-EXECUTION BEST PRACTICES')) {
      fail(file.path + ': missing prompt-execution best-practice layer.');
    }
    if (!file.body.includes('TASK-SHAPE EXECUTION MODEL')) fail(file.path + ': missing task-shape execution model.');
    if (!file.body.includes('CHALLENGE PASS')) fail(file.path + ': missing challenge pass.');
    if (!file.body.includes('ACCEPTANCE GATE')) fail(file.path + ': missing acceptance gate.');

    const sourceHeading = lang === 'sr'
      ? 'AUTORITATIVNI POČETNI IZVORI'
      : 'AUTHORITATIVE STARTING SOURCES';
    if (!file.body.includes(sourceHeading)) fail(file.path + ': missing authoritative source profile.');

    const sourceLinks = file.body.match(/https:\/\//g)?.length ?? 0;
    if (sourceLinks < 2) fail(file.path + ': expected at least two HTTPS source/methodology links.');
  }
}

if (errors.length) {
  for (const error of errors.slice(0, 100)) console.error('ERROR  ' + error);
  if (errors.length > 100) console.error('... ' + (errors.length - 100) + ' additional error(s)');
  console.error('validate-v2: ' + errors.length + ' error(s) -> FAILED');
  process.exit(1);
}

console.log(
  'validate-v2: 1000 prompts / 2000 localizations / 100 quality profiles / ' +
  '100 subcategory source profiles / 10 category source profiles / version ' + V2_VERSION + ' -> OK'
);
