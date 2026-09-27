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
if (Object.keys(subProfiles).length !== 100) fail('Expected exactly 100 subcategory v2 profiles.');
if (Object.keys(sourceProfiles).length !== 10) fail('Expected exactly 10 authoritative source profiles.');

for (const category of repo.catalog.categories) {
  if (category.prompts.length !== 100) fail(category.id + ': expected 100 prompts.');
  if (category.subcategories.length !== 10) fail(category.id + ': expected 10 subcategories.');
  for (const sub of category.subcategories) {
    if (!subProfiles[sub.id]) fail(category.id + ': missing v2 subcategory profile for ' + sub.id + '.');
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
    if (!file.body.includes('TASK-SHAPE EXECUTION MODEL')) fail(file.path + ': missing task-shape execution model.');
    const subHeading = lang === 'sr' ? 'PODKATEGORIJSKI BEST-PRACTICE PROFIL' : 'SUBCATEGORY BEST-PRACTICE PROFILE';
    if (!file.body.includes(subHeading)) fail(file.path + ': missing subcategory best-practice profile.');
    if (!file.body.includes('CHALLENGE PASS')) fail(file.path + ': missing challenge pass.');
    if (!file.body.includes('ACCEPTANCE GATE')) fail(file.path + ': missing acceptance gate.');
    const sourceHeading = lang === 'sr' ? 'AUTORITATIVNI POČETNI IZVORI' : 'AUTHORITATIVE STARTING SOURCES';
    if (!file.body.includes(sourceHeading)) fail(file.path + ': missing authoritative source profile.');
  }
}

if (errors.length) {
  for (const error of errors.slice(0, 100)) console.error('ERROR  ' + error);
  if (errors.length > 100) console.error('... ' + (errors.length - 100) + ' additional error(s)');
  console.error('validate-v2: ' + errors.length + ' error(s) -> FAILED');
  process.exit(1);
}

console.log('validate-v2: 1000 prompts / 2000 localizations / 100 subcategory profiles / 10 source profiles / version ' + V2_VERSION + ' -> OK');
