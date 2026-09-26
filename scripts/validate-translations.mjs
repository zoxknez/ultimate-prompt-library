#!/usr/bin/env node
// Checks that the localized versions of each prompt ID correspond to each other.
//
// 1. Metadata parity (ERRORS - exit code 1)
//    - a stable prompt is missing a language (MISSING LANGUAGE PAIR)
//    - id, number, slug, category_id or subcategory_id differ
//    - files are not at corresponding paths
//
// 2. Revision parity (WARNINGS)
//    - version or status differs between languages
//    - a non-stable prompt is missing a language
//    - bodies are byte-identical (possible untranslated copy)
//
// 3. Structural parity (WARNINGS / NOTES - never fail the run)
//    Deterministic, language-neutral signals computed by scripts/lib/structure.mjs:
//    numbered sections, heading outline, code fences, key sections, tables, blockquotes and length.
//    A warning means "review candidate", not "the translation is wrong".
//
//    Length is judged against the collection itself: translations in this library are
//    systematically shorter or longer than the primary language, and the ratio depends on the
//    writing style, which is consistent within a subcategory but differs between subcategories.
//    The reference is therefore the median length ratio of the complete pairs in the same
//    subcategory (at least SUBCATEGORY_MIN_PAIRS pairs), falling back to the median of the whole
//    collection. Pairs that deviate from their reference by LENGTH_WARN_PCT (warning) or
//    LENGTH_STRONG_PCT (strong warning) are flagged. The raw delta is reported for context.
//
// Usage: node scripts/validate-translations.mjs [--details]
//   --details  print the structural comparison for every pair, including notes

import { loadRepository, Reporter, subcategoryDir } from './lib/upl.mjs';
import { analyzeBody, deltaPct, KEY_SECTIONS, median } from './lib/structure.mjs';

const LENGTH_WARN_PCT = 40;
const LENGTH_STRONG_PCT = 60;
const CODE_FENCE_MIN_DIFF = 3;
const CODE_FENCE_MIN_PCT = 5;
const SUBCATEGORY_MIN_PAIRS = 5;

const details = process.argv.includes('--details');
const repo = loadRepository();
const report = new Reporter('validate-translations');
if (repo.report.errors.length) {
  report.error('prompts/', `structural validation has ${repo.report.errors.length} error(s); run npm run validate:prompts`);
}

const languages = repo.catalog.languages.map((l) => l.code);
const primary = repo.catalog.languages.find((l) => l.primary).code;
const IDENTITY = ['id', 'number', 'slug', 'category_id', 'subcategory_id'];
const prompts = [...repo.prompts.values()].sort((a, b) => a.id.localeCompare(b.id));

let pairsChecked = 0;
let metadataValid = 0;
let missingPairs = 0;
const structuralWarnings = [];
const blocks = [];

// Baseline length ratio per secondary language (median over complete pairs).
const metrics = new Map(prompts.map((p) => [p.id, Object.fromEntries(Object.entries(p.localizations).map(([c, f]) => [c, analyzeBody(f.body)]))]));
const baseline = {};
const subBaseline = {};
const subOf = (p) => p.localizations[primary].data.subcategory_id;
for (const code of languages.filter((c) => c !== primary)) {
  const complete = prompts.filter((p) => p.localizations[primary] && p.localizations[code]);
  const ratioOf = (p) => metrics.get(p.id)[code].chars / metrics.get(p.id)[primary].chars;
  baseline[code] = complete.length >= 10 ? median(complete.map(ratioOf)) : 1;
  subBaseline[code] = {};
  for (const sub of new Set(complete.map(subOf))) {
    const ratios = complete.filter((p) => subOf(p) === sub).map(ratioOf);
    if (ratios.length >= SUBCATEGORY_MIN_PAIRS) subBaseline[code][sub] = median(ratios);
  }
}

for (const prompt of prompts) {
  const present = languages.filter((code) => prompt.localizations[code]);
  const missing = languages.filter((code) => !prompt.localizations[code]);
  const where = prompt.id;

  // --- metadata parity -------------------------------------------------------------------
  const isStable = present.some((code) => prompt.localizations[code].data.status === 'stable');
  for (const code of missing) {
    const message = `MISSING LANGUAGE PAIR: no "${code}" file (present: ${present.join(', ')})`;
    if (isStable) {
      report.error(where, message);
      missingPairs++;
    } else report.warn(where, `${message}; required before the prompt becomes stable`);
  }

  const base = prompt.localizations[primary] ?? prompt.localizations[present[0]];
  let metadataOk = missing.length === 0 || !isStable;
  for (const code of present.filter((c) => c !== base.lang)) {
    const other = prompt.localizations[code];
    for (const key of IDENTITY) {
      if (base.data[key] !== other.data[key]) {
        report.error(where, `${key} differs: ${base.lang}="${base.data[key]}" vs ${code}="${other.data[key]}"`);
        metadataOk = false;
      }
    }
    const expected = `prompts/${code}/${base.category.dirs[code]}/${subcategoryDir(base.subcategory)}/${base.path.split('/').pop()}`;
    if (other.path !== expected) {
      report.error(other.path, `does not correspond to ${base.path} (expected ${expected})`);
      metadataOk = false;
    }
    if (base.data.version !== other.data.version) {
      report.warn(where, `version differs: ${base.lang}=${base.data.version} vs ${code}=${other.data.version} (same logical revision should share a version)`);
    }
    if (base.data.status !== other.data.status) {
      report.warn(where, `status differs: ${base.lang}=${base.data.status} vs ${code}=${other.data.status}`);
    }
    if (base.bodyHash === other.bodyHash) {
      report.warn(where, `${base.lang} and ${code} bodies are byte-identical; is the translation missing?`);
    }
  }
  if (present.length < 2) continue;
  pairsChecked++;
  if (metadataOk) metadataValid++;

  // --- structural parity -----------------------------------------------------------------
  for (const code of present.filter((c) => c !== base.lang)) {
    const a = metrics.get(prompt.id)[base.lang];
    const b = metrics.get(prompt.id)[code];
    const warnings = []; // [priority, text]
    const notes = [];

    // Multiset difference: a section number that appears twice in one language and once in the
    // other is reported too.
    const minus = (xs, ys) => {
      const left = new Map();
      for (const y of ys) left.set(y, (left.get(y) ?? 0) + 1);
      return xs.filter((x) => (left.get(x) ? (left.set(x, left.get(x) - 1), false) : true));
    };
    const onlyA = minus(a.numbered, b.numbered);
    const onlyB = minus(b.numbered, a.numbered);
    if (onlyA.length || onlyB.length || a.numberedCount !== b.numberedCount) {
      const list = (xs) => (xs.length > 12 ? `${xs.slice(0, 12).join(', ')}, ...` : xs.join(', '));
      warnings.push([
        1,
        `numbered sections differ (${a.numberedCount} / ${b.numberedCount})` +
          (onlyA.length ? `; only in ${base.lang}: ${list(onlyA)}` : '') +
          (onlyB.length ? `; only in ${code}: ${list(onlyB)}` : ''),
      ]);
    }
    const outline = ['h1', 'h2', 'h3', 'h4'].filter((h) => a.headings[h] !== b.headings[h]);
    if (outline.length) {
      warnings.push([1, `heading outline differs: ${outline.map((h) => `${h.toUpperCase()} ${a.headings[h]} / ${b.headings[h]}`).join(', ')}`]);
    }
    const keyDiff = Object.keys(KEY_SECTIONS).filter((k) => Boolean(a.sections[k]) !== Boolean(b.sections[k]));
    if (keyDiff.length) {
      warnings.push([1, `key section detected in only one language: ${keyDiff.map((k) => `${k} (${a.sections[k] ? base.lang : code})`).join(', ')}`]);
    }
    const fenceDiff = Math.abs(a.codeFences - b.codeFences);
    if (fenceDiff) {
      const text = `code fences ${a.codeFences} / ${b.codeFences}`;
      if (fenceDiff >= CODE_FENCE_MIN_DIFF && deltaPct(a.codeFences, b.codeFences) >= CODE_FENCE_MIN_PCT) warnings.push([2, text]);
      else notes.push(text);
    }
    const ratio = b.chars / a.chars;
    const subRef = prompt.localizations[primary] ? subBaseline[code][subOf(prompt)] : undefined;
    const ref = subRef ?? baseline[code];
    const refName = subRef === undefined ? 'collection' : 'subcategory';
    const deviation = (Math.max(ratio / ref, ref / ratio) - 1) * 100;
    const rawDelta = deltaPct(a.chars, b.chars);
    const lengthText = `length ${a.chars} / ${b.chars} chars (delta ${rawDelta.toFixed(1)}%, ${deviation.toFixed(1)}% from the ${refName} median ratio ${ref.toFixed(2)})`;
    if (deviation >= LENGTH_STRONG_PCT) warnings.push([3, `STRONG: ${lengthText}`]);
    else if (deviation >= LENGTH_WARN_PCT) warnings.push([3, lengthText]);
    if (a.tables !== b.tables) notes.push(`tables ${a.tables} / ${b.tables}`);
    if (a.blockquotes !== b.blockquotes) notes.push(`blockquotes ${a.blockquotes} / ${b.blockquotes}`);
    if (a.unclosedFence || b.unclosedFence) warnings.push([2, 'unclosed code fence']);

    warnings.sort((x, y) => x[0] - y[0]);
    for (const [, text] of warnings) {
      structuralWarnings.push(`${prompt.id}: ${text}`);
      report.warn(prompt.id, `structural parity: ${text}`);
    }
    if (details || warnings.length) {
      const pairLabel = `${base.lang}/${code}`;
      blocks.push(
        [
          `${prompt.id} (${pairLabel})`,
          `  metadata: ${metadataOk ? 'OK' : 'ERROR'}`,
          `  headings: ${a.headings.total} / ${b.headings.total}   numbered sections: ${a.numberedCount} / ${b.numberedCount}`,
          `  code fences: ${a.codeFences} / ${b.codeFences}   tables: ${a.tables} / ${b.tables}   blockquotes: ${a.blockquotes} / ${b.blockquotes}`,
          `  ${lengthText}`,
          ...notes.map((n) => `  note: ${n}`),
          `  status: ${warnings.length ? 'WARNING - review candidate' : 'OK'}`,
        ].join('\n'),
      );
    }
  }
}

if (blocks.length) console.log(`${blocks.join('\n\n')}\n`);

const reviewCandidates = new Set(structuralWarnings.map((w) => w.split(':')[0]));
process.exitCode = report.finish([
  `${pairsChecked} pairs checked`,
  `${metadataValid} metadata pairs valid`,
  `${structuralWarnings.length} structural warnings (${reviewCandidates.size} review candidates)`,
  `${missingPairs} missing language pairs`,
  ...Object.entries(baseline).map(([code, r]) => `median length ratio ${code}/${primary}: ${r.toFixed(3)} (length warnings at >= ${LENGTH_WARN_PCT}% / strong >= ${LENGTH_STRONG_PCT}% deviation)`),
]);
