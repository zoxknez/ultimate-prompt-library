// Fixture selection and identity. This is the only place that turns repository prompts into
// localized eval suites, so export, validation, the runner and baseline acceptance always hash the
// same fixture content.

import path from 'node:path';
import { buildEmpiricalEvalSuite, validateEmpiricalEvalSuite, V2_EVAL_CLASSES } from '../v2-evals.mjs';
import { canonicalJson, readJsonFile, resolveSafeFile, ROOT, sha256 } from './safety.mjs';
import { applyCases } from './cases.mjs';

export const LANGUAGES = Object.freeze(['en', 'sr']);
export const MANIFEST_DIR = path.join(ROOT, 'evals', 'manifests');

export function suiteFor(repo, category, prompt, lang) {
  const localization = repo.prompts.get(prompt.id)?.localizations?.[lang];
  if (!localization) return null;
  const suite = applyCases(buildEmpiricalEvalSuite({
    ...prompt,
    title: prompt.title?.[lang] || prompt.title?.en || prompt.id,
    language: lang,
    category_id: category.id,
    subcategory_id: prompt.subcategory,
    subcategory: localization.data.subcategory,
  }, lang));
  const errors = validateEmpiricalEvalSuite(suite);
  if (errors.length) throw new Error(prompt.id + '/' + lang + ': invalid eval suite: ' + errors.join('; '));
  return { suite, localization };
}

/** Hash of everything that defines what a fixture tests. The effective prompt is tracked separately. */
export function fixtureHash(suite, fixture) {
  return sha256(canonicalJson({
    suiteSchemaVersion: suite.schemaVersion,
    promptId: suite.promptId,
    language: suite.language,
    taskShape: suite.taskShape,
    semanticAnchors: suite.semanticAnchors,
    fixture,
  }));
}

export function* allSuites(repo, languages = LANGUAGES) {
  for (const category of repo.catalog.categories) {
    for (const prompt of category.prompts) {
      for (const lang of languages) {
        const built = suiteFor(repo, category, prompt, lang);
        if (built) yield { category, prompt, lang, ...built };
      }
    }
  }
}

function planItem({ category, prompt, lang, suite, localization }, fixture, extra = {}) {
  return {
    promptId: prompt.id,
    categoryId: category.id,
    subcategoryId: prompt.subcategory,
    language: lang,
    suite,
    fixture,
    fixtureHash: fixtureHash(suite, fixture),
    effectivePrompt: localization.body,
    effectivePromptHash: localization.bodyHash,
    ...extra,
  };
}

/** Filter-based selection: optional prompt ID, languages and fixture class. */
export function selectByFilters(repo, { promptId = null, languages = ['en'], fixtureClass = null }) {
  const items = [];
  for (const entry of allSuites(repo, languages)) {
    if (promptId && entry.prompt.id !== promptId) continue;
    for (const fixture of entry.suite.fixtures) {
      if (fixtureClass && fixture.class !== fixtureClass) continue;
      items.push(planItem(entry, fixture));
    }
  }
  return items;
}

export function loadManifest(userPath) {
  const file = resolveSafeFile(userPath, { baseDir: MANIFEST_DIR, label: 'manifest', maxBytes: 1024 * 1024 });
  const { value } = readJsonFile(file);
  return { file, manifest: value };
}

/** Structural validation of a curated eval manifest against the repository. */
export function validateManifest(manifest, repo) {
  const errors = [];
  if (manifest?.schemaVersion !== 1) errors.push('manifest schemaVersion must be 1');
  if (!manifest?.name || typeof manifest.name !== 'string') errors.push('manifest name is required');
  if (!Array.isArray(manifest?.entries) || !manifest.entries.length) {
    errors.push('manifest entries must be a non-empty array');
    return errors;
  }
  const seen = new Set();
  for (const [i, entry] of manifest.entries.entries()) {
    const where = 'entry ' + (i + 1) + ' (' + (entry?.promptId ?? '?') + '/' + (entry?.language ?? '?') + ')';
    if (!repo.prompts.has(entry?.promptId)) errors.push(where + ': unknown promptId');
    if (!LANGUAGES.includes(entry?.language)) errors.push(where + ': language must be en or sr');
    if (!Array.isArray(entry?.classes) || !entry.classes.length) errors.push(where + ': classes must be a non-empty array');
    for (const klass of entry?.classes ?? []) if (!V2_EVAL_CLASSES.includes(klass)) errors.push(where + ': unknown class ' + klass);
    if (new Set(entry?.classes ?? []).size !== (entry?.classes ?? []).length) errors.push(where + ': duplicate class');
    if (typeof entry?.rationale !== 'string' || entry.rationale.trim().length < 40) errors.push(where + ': rationale must explain the selection (40+ chars)');
    if (!Array.isArray(entry?.coverage) || !entry.coverage.length) errors.push(where + ': coverage tags are required');
    const key = entry?.promptId + ':' + entry?.language;
    if (seen.has(key)) errors.push(where + ': duplicate prompt/language entry');
    seen.add(key);
  }
  return errors;
}

export function selectByManifest(repo, manifest) {
  const errors = validateManifest(manifest, repo);
  if (errors.length) throw new Error('Invalid manifest: ' + errors.join('; '));
  const byId = new Map();
  for (const category of repo.catalog.categories) for (const prompt of category.prompts) byId.set(prompt.id, { category, prompt });
  const items = [];
  for (const entry of manifest.entries) {
    const { category, prompt } = byId.get(entry.promptId);
    const built = suiteFor(repo, category, prompt, entry.language);
    for (const klass of entry.classes) {
      const fixture = built.suite.fixtures.find((item) => item.class === klass);
      items.push(planItem({ category, prompt, lang: entry.language, ...built }, fixture, { manifestRationale: entry.rationale }));
    }
  }
  return items;
}

/** Deterministic hash of a plan, recorded in dry runs and live runs. */
export function planHash(items, trials) {
  return sha256(canonicalJson({ trials, items: items.map((item) => [item.language, item.fixture.id, item.fixtureHash, item.effectivePromptHash]) }));
}
