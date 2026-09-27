#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { loadValidRepository } from './lib/upl.mjs';
import { V2_MARKER, V2_VERSION, semanticDetailRules, taskShapeRules } from './lib/v2-quality.mjs';
import { buildEmpiricalEvalSuite, validateEmpiricalEvalSuite, V2_EVAL_CLASSES } from './lib/v2-evals.mjs';
import { validateSourceList } from './lib/source-freshness.mjs';
import { matchedSemanticGroups, primaryTaskShape } from './lib/v2-routing.mjs';
import { allSuites, fixtureHash, validateManifest } from './lib/eval/plan.mjs';
import { BASELINE_PATH, loadBaseline, staleReasons } from './lib/eval/golden.mjs';
import { HARNESS_PROTOCOL_VERSION } from './lib/eval/harness.mjs';
import { caseFileNames, validateCaseFile } from './lib/eval/cases.mjs';

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
  for (const error of validateSourceList(where, items)) fail(error);
}

for (const [categoryId, items] of Object.entries(sourceProfiles)) {
  validateSources('category source profile ' + categoryId, items);
}
for (const [subId, items] of Object.entries(subSourceProfiles)) {
  validateSources('subcategory source profile ' + subId, items);
}

// Serbian titles must be localized (all IT and BIZ titles were English until 2.4.0).
for (const category of repo.catalog.categories) {
  for (const prompt of category.prompts) {
    if (prompt.title?.sr && prompt.title.sr === prompt.title.en) fail(prompt.id + ': Serbian title is identical to the English title; localize it.');
  }
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
      const localizedHaystack = ((prompt.slug ?? '') + ' ' + title).toLowerCase();
      const semanticJoined = semanticDetailRules({ ...taskData, title, language: lang }, lang).join(' ').toLowerCase();
      if (!/\bapi\b|backend/.test(localizedHaystack) &&
          /contract\/schema.*authentication\/authorization|validirajte contract\/schema.*authentication\/authorization/.test(semanticJoined)) {
        fail(prompt.id + '/' + lang + ': cross-domain API/backend semantic contamination detected.');
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
    if (!file.body.includes('EXECUTABLE EVAL & GOLDEN REGRESSION') &&
        !file.body.includes('EXECUTABLE EVAL I GOLDEN REGRESSION')) {
      fail(file.path + ': missing executable-eval/golden-regression reference.');
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

// ---------------------------------------------------------------------------
// EN/SR structural parity of the effective prompts. Wording differs by language; the rule
// selection, sources, sections and eval namespace must not.
const sectionShape = (body) => (body.split(V2_MARKER)[1] ?? '').split(/\n(?=## )/).map((section) => ({
  bullets: section.split('\n').filter((line) => /^- /.test(line)).length,
  links: (section.match(/\]\(https:\/\/[^)]+\)/g) ?? []).join(' '),
}));
for (const [id, prompt] of repo.prompts) {
  const en = prompt.localizations.en;
  const sr = prompt.localizations.sr;
  if (!en || !sr) continue;
  const a = sectionShape(en.body);
  const b = sectionShape(sr.body);
  if (a.length !== b.length) fail(id + ': EN/SR v2 layers have a different number of sections.');
  a.forEach((section, i) => {
    if (!b[i]) return;
    if (section.bullets !== b[i].bullets) fail(id + ': EN/SR v2 section ' + i + ' has ' + section.bullets + ' vs ' + b[i].bullets + ' rules.');
    if (section.links !== b[i].links) fail(id + ': EN/SR v2 section ' + i + ' cites different sources.');
  });
  for (const [lang, file] of [['en', en], ['sr', sr]]) {
    if (!file.body.includes('"' + file.data.title + '"')) fail(file.path + ': prompt subject must be the verbatim localized title.');
    const routingData = { ...file.data, language: lang };
    if (primaryTaskShape(routingData) !== primaryTaskShape({ ...en.data, language: 'en' })) fail(id + '/' + lang + ': primary task shape differs by language.');
    if (matchedSemanticGroups(routingData).map((g) => g.id).join() !== matchedSemanticGroups({ ...en.data, language: 'en' }).map((g) => g.id).join()) {
      fail(id + '/' + lang + ': semantic groups differ by language.');
    }
  }
}

// ---------------------------------------------------------------------------
// Golden baseline: schema, version and staleness against the current repository.
let baselineSummary = 'missing';
try {
  const baseline = loadBaseline();
  const current = new Map();
  for (const { lang, suite, localization } of allSuites(repo)) {
    for (const fixture of suite.fixtures) current.set(lang + ':' + fixture.id, { fixtureHash: fixtureHash(suite, fixture), effectivePromptHash: localization.bodyHash, harnessProtocolVersion: HARNESS_PROTOCOL_VERSION });
  }
  let stale = 0;
  for (const [key, entry] of Object.entries(baseline.entries)) {
    const live = current.get(key);
    if (!live) fail('golden baseline entry ' + key + ' references a fixture that no longer exists.');
    else if (staleReasons(entry, live).length) stale += 1;
  }
  baselineSummary = Object.keys(baseline.entries).length + ' entries / ' + stale + ' stale';
  if (stale) console.warn('WARNING  golden baseline: ' + stale + ' stale entr' + (stale === 1 ? 'y needs' : 'ies need') + ' review before they can be replaced (npm run baseline:accept -- --replace-stale).');
} catch (error) {
  fail('golden baseline ' + BASELINE_PATH + ': ' + error.message);
}

// ---------------------------------------------------------------------------
// Curated live-eval manifest coverage.
const smoke = JSON.parse(readFileSync(new URL('../evals/manifests/baseline-smoke.json', import.meta.url), 'utf8'));
for (const error of validateManifest(smoke, repo)) fail('baseline-smoke manifest: ' + error);
const smokeCategories = new Set(smoke.entries.map((e) => e.promptId.replace(/-\d{3}$/, '')));
if (smokeCategories.size !== 10) fail('baseline-smoke manifest must cover all 10 categories.');
if (!['en', 'sr'].every((lang) => smoke.entries.some((e) => e.language === lang))) fail('baseline-smoke manifest must cover EN and SR.');
for (const id of ['UPL-IT-031', 'UPL-LAW-001', 'UPL-HEALTH-021', 'UPL-SCI-031']) {
  if (!smoke.entries.some((e) => e.promptId === id)) fail('baseline-smoke manifest must include high-impact prompt ' + id + '.');
}
const smokeShapes = new Set(smoke.entries.map((e) => primaryTaskShape({ id: e.promptId })));
if (smokeShapes.size < 9) fail('baseline-smoke manifest must cover every task shape (found ' + smokeShapes.size + ').');
const smokeFixtures = smoke.entries.reduce((n, e) => n + e.classes.length, 0);
if (smokeFixtures < 20 || smokeFixtures > 150) fail('baseline-smoke manifest must plan 20-150 fixtures (found ' + smokeFixtures + ').');

// ---------------------------------------------------------------------------
// Hand-authored concrete inputs: valid files, and exactly one case per curated fixture.
const caseNames = caseFileNames().filter((name) => name.endsWith('.json'));
const expectedCases = new Set(smoke.entries.flatMap((e) => e.classes.map((klass) => e.language + ':' + e.promptId + ':' + klass)));
const foundCases = new Set();
for (const name of caseNames) {
  let data;
  try {
    data = JSON.parse(readFileSync(new URL('../evals/cases/' + name, import.meta.url), 'utf8'));
  } catch (error) {
    fail('evals/cases/' + name + ': invalid JSON: ' + error.message);
    continue;
  }
  for (const error of validateCaseFile(name, data)) fail(error);
  for (const klass of Object.keys(data?.cases ?? {})) {
    const key = data.language + ':' + data.promptId + ':' + klass;
    if (!expectedCases.has(key)) fail('evals/cases/' + name + '#' + klass + ': case is not part of the baseline-smoke manifest.');
    foundCases.add(key);
  }
}
for (const key of expectedCases) if (!foundCases.has(key)) fail('baseline-smoke fixture ' + key + ' has no concrete input in evals/cases/.');

// Raw model output and network observations must stay out of Git.
const gitignore = readFileSync(new URL('../.gitignore', import.meta.url), 'utf8').split(/\r?\n/).map((line) => line.trim());
for (const dir of ['.eval-runs/', '.source-checks/', '.env']) if (!gitignore.includes(dir)) fail('.gitignore must ignore ' + dir);

if (errors.length) {
  for (const error of errors.slice(0, 100)) console.error('ERROR  ' + error);
  if (errors.length > 100) console.error('... ' + (errors.length - 100) + ' additional error(s)');
  console.error('validate-v2: ' + errors.length + ' error(s) -> FAILED');
  process.exit(1);
}

console.log(
  'validate-v2: 1000 prompts / 2000 localizations / 100 quality profiles / ' +
  '100 subcategory source profiles / 10 category source profiles / 2000 localized empirical suites / 12000 localized fixtures / ' +
  'EN/SR parity / golden baseline ' + baselineSummary + ' / smoke manifest ' + smoke.entries.length + ' entries, ' + smokeFixtures + ' fixtures, ' + foundCases.size + ' concrete inputs / version ' + V2_VERSION + ' -> OK'
);
