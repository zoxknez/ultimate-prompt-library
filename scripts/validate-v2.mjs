#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadValidRepository } from './lib/upl.mjs';
import { V2_MARKER, V2_VERSION, semanticDetailRules, taskShapeRules } from './lib/v2-quality.mjs';
import { buildEmpiricalEvalSuite, validateEmpiricalEvalSuite, V2_EVAL_CLASSES } from './lib/v2-evals.mjs';

const repo = loadValidRepository();
const errors = [];
const fail = (message) => errors.push(message);

if (repo.catalog.categories.length !== 10) fail('Expected exactly 10 categories.');
if (repo.prompts.size !== 1000) fail('Expected exactly 1000 unique prompts, found ' + repo.prompts.size + '.');
if (repo.files.length !== 2000) fail('Expected exactly 2000 localized prompt files, found ' + repo.files.length + '.');

const categoryProfiles = JSON.parse(readFileSync(new URL('./v2-quality-profiles.json', import.meta.url), 'utf8'));
const subProfiles = JSON.parse(readFileSync(new URL('./v2-subcategory-profiles.json', import.meta.url), 'utf8'));
const sourceProfiles = JSON.parse(readFileSync(new URL('./v2-source-profiles.json', import.meta.url), 'utf8'));
const subSourceProfiles = JSON.parse(readFileSync(new URL('./v2-subcategory-source-profiles.json', import.meta.url), 'utf8'));

if (Object.keys(categoryProfiles).length !== 10) fail('Expected exactly 10 category v2 quality profiles.');
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
    const statusHaystack = String(item.label ?? '') + ' ' + String(item.url ?? '');
    if (/(\bdraft\b|initial-public-draft|\/ipd\b|public-comment|consultation|proposed)/i.test(statusHaystack)) {
      const note = String(item.note ?? '');
      if (!/(draft|proposed|consult|interim|not final|future-facing)/i.test(note)) {
        fail(where + ': draft/proposed source must carry an explicit status note: ' + (item.label || item.url));
      }
    }
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

  for (const prompt of category.prompts) {
    const taskData = { ...prompt, title: prompt.title?.en ?? '', language: 'en', category_id: category.id, subcategory_id: prompt.subcategory, subcategory: prompt.subcategory };
    const taskRules = taskShapeRules(taskData, 'en');
    const semanticRules = semanticDetailRules(taskData, 'en');
    if (semanticRules.length < 4) fail(prompt.id + ': expected at least four subject-specific semantic rules.');
    if (taskRules[0] === 'Define objective, inputs, constraints and success criteria before the main work.') {
      fail(prompt.id + ': generic task-shape fallback is not allowed.');
    }

    for (const lang of ['en', 'sr']) {
      const title = prompt.title?.[lang] ?? prompt.title?.en ?? prompt.id;
      const suite = buildEmpiricalEvalSuite({ ...taskData, title, language: lang }, lang);
      const fixtureErrors = validateEmpiricalEvalSuite(suite);
      for (const error of fixtureErrors) fail(prompt.id + '/' + lang + ': empirical eval: ' + error);
      if (suite.promptId !== prompt.id) fail(prompt.id + '/' + lang + ': empirical eval prompt identity drift.');
      if (suite.fixtures.length !== 6) fail(prompt.id + '/' + lang + ': expected exactly six empirical fixtures.');
      if (!suite.fixtures.every((item) => item.id.startsWith(prompt.id + ':'))) fail(prompt.id + '/' + lang + ': fixture ID namespace drift.');
      if (!suite.semanticAnchors.every((item) => item && !/this task|ovaj zadatak/i.test(item))) {
        fail(prompt.id + '/' + lang + ': empirical eval semantic anchors are too generic.');
      }
    }
  }

  for (const sub of category.subcategories) {
    if (!categoryProfiles[category.id]) fail(category.id + ': missing category v2 quality profile.');
    if (!subProfiles[sub.id]) fail(category.id + ': missing v2 subcategory profile for ' + sub.id + '.');
    if (!subSourceProfiles[sub.id]) fail(category.id + ': missing subcategory source profile for ' + sub.id + '.');

    const combinedSources = [...(subSourceProfiles[sub.id] ?? []), ...(sourceProfiles[category.id] ?? [])];
    const uniqueByUrl = [...new Map(combinedSources.map((item) => [item.url, item])).values()];
    if (uniqueByUrl.length < 4) {
      fail(category.id + '/' + sub.id + ': expected at least 4 effective authoritative sources after deduplication.');
    }
    const sourceHosts = new Set(
      uniqueByUrl
        .map((item) => String(item.url ?? '').match(/^https:\/\/([^/]+)/i)?.[1]?.replace(/^www\./, ''))
        .filter(Boolean)
    );
    if (sourceHosts.size < 2) {
      fail(category.id + '/' + sub.id + ': expected at least 2 independent source domains.');
    }
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
    if (!file.body.includes('PROMPT-SPECIFIC EXECUTION FOCUS')) {
      fail(file.path + ': missing prompt-specific execution focus.');
    }
    if (!file.body.includes('SUBJECT-SPECIFIC SEMANTIC DETAIL')) fail(file.path + ': missing subject-specific semantic detail.');
    if (!file.body.includes('TASK-SHAPE EXECUTION MODEL')) fail(file.path + ': missing task-shape execution model.');
    if (!file.body.includes('EVAL CONTRACT') && !file.body.includes('EVAL UGOVOR')) fail(file.path + ': missing eval contract.');
    if (!file.body.includes('CHALLENGE PASS')) fail(file.path + ': missing challenge pass.');
    if (!file.body.includes('ACCEPTANCE GATE')) fail(file.path + ': missing acceptance gate.');
    if (!file.body.includes('Regression case:') && !file.body.includes('Regression slučaj:')) {
      fail(file.path + ': missing regression eval rule.');
    }
    if (!file.body.includes('Adversarial/untrusted case:') && !file.body.includes('Adversarial/untrusted slučaj:')) {
      fail(file.path + ': missing adversarial eval rule.');
    }

    if (!file.body.includes('human review with access to the underlying evidence') &&
        !file.body.includes('human review sa pristupom osnovnim dokazima')) {
      fail(file.path + ': missing high-impact human-review rule.');
    }
    if (!file.body.includes('human-review fixture')) {
      fail(file.path + ': missing human-review eval fixture.');
    }
    if (!file.body.includes('claim-level provenance')) {
      fail(file.path + ': missing claim-level provenance rule.');
    }
    if (!file.body.includes('Reproducibility case:') && !file.body.includes('Reproducibility slučaj:')) {
      fail(file.path + ': missing reproducibility eval fixture.');
    }
    if (!file.body.includes('citation laundering')) {
      fail(file.path + ': missing citation-laundering guard.');
    }
    if (!file.body.includes('Keep the effective prompt lean:') && !file.body.includes('Efektivni prompt držite lean:')) {
      fail(file.path + ': missing lean-prompt execution rule.');
    }
    if (!file.body.includes('EMPIRICAL EVAL SUITE') && !file.body.includes('EMPIRIJSKI EVAL SUITE')) {
      fail(file.path + ': missing empirical eval-suite reference.');
    }
    for (const klass of V2_EVAL_CLASSES) {
      if (!file.body.includes(id + ':{nominal|boundary|missing-context|adversarial|provenance|regression}')) {
        fail(file.path + ': missing empirical fixture namespace.');
        break;
      }
    }

    const sourceHeading = lang === 'sr'
      ? 'AUTORITATIVNI POČETNI IZVORI'
      : 'AUTHORITATIVE STARTING SOURCES';
    if (!file.body.includes(sourceHeading)) fail(file.path + ': missing authoritative source profile.');

    const sourceLinks = file.body.match(/https:\/\//g)?.length ?? 0;
    if (sourceLinks < 2) fail(file.path + ': expected at least two HTTPS source/methodology links.');

    const v2Layer = file.body.split(V2_MARKER)[1] ?? '';
    const normalizedLongBullets = v2Layer
      .split('\n')
      .filter((line) => /^-\s+/.test(line) && line.trim().length >= 100)
      .map((line) => line.toLowerCase().replace(/\s+/g, ' ').trim());
    const seenLongBullets = new Set();
    for (const bullet of normalizedLongBullets) {
      if (seenLongBullets.has(bullet)) {
        fail(file.path + ': duplicate long instruction detected inside v2 layer: ' + bullet.slice(0, 120));
        break;
      }
      seenLongBullets.add(bullet);
    }
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
  '100 subcategory source profiles / 10 category source profiles / 1000 empirical suites / 6000 fixtures per language-pair run / version ' + V2_VERSION + ' -> OK'
);
