// Hand-authored concrete inputs for curated fixtures (evals/cases/<promptId>.<lang>.json).
//
// Generated fixtures describe a situation abstractly ("the input omits one decision-critical
// fact"), which tests behavior but not domain correctness. A case replaces that description with a
// realistic, clearly fictional input containing planted facts, and adds case-specific assertions
// that check whether the model actually found them. The candidate sees only the concrete input.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { INJECTION_CANARY, V2_EVAL_CLASSES } from '../v2-evals.mjs';
import { ROOT } from './safety.mjs';

export const CASES_DIR = path.join(ROOT, 'evals', 'cases');
export const CASE_SCHEMA_VERSION = 1;
export const CASE_ASSERTION_PREFIX = { en: 'Case-specific: ', sr: 'Specifično za slučaj: ' };
const FILE_RE = /^(UPL-[A-Z]+-\d{3})\.(en|sr)\.json$/;

let cache = null;

/** All case files keyed by "lang:promptId". Throws on unreadable JSON. */
export function loadCases() {
  if (cache) return cache;
  cache = new Map();
  if (!existsSync(CASES_DIR)) return cache;
  for (const name of readdirSync(CASES_DIR).sort()) {
    const match = FILE_RE.exec(name);
    if (!match) continue;
    const data = JSON.parse(readFileSync(path.join(CASES_DIR, name), 'utf8'));
    cache.set(match[2] + ':' + match[1], { file: name, data });
  }
  return cache;
}

export function caseFileNames() {
  return existsSync(CASES_DIR) ? readdirSync(CASES_DIR).sort() : [];
}

const SR_LETTERS = /[čćžš\u0111ČĆŽŠĐ]/;
const CYRILLIC = /[Ѐ-ӿ]/;

/** Structural validation of one case file. */
export function validateCaseFile(name, data) {
  const errors = [];
  const where = 'evals/cases/' + name;
  const match = FILE_RE.exec(name);
  if (!match) return [where + ': file name must be <promptId>.<en|sr>.json'];
  const [, promptId, lang] = match;
  if (data?.schemaVersion !== CASE_SCHEMA_VERSION) errors.push(where + ': schemaVersion must be ' + CASE_SCHEMA_VERSION);
  if (data?.promptId !== promptId) errors.push(where + ': promptId does not match the file name');
  if (data?.language !== lang) errors.push(where + ': language does not match the file name');
  if (typeof data?.note !== 'string' || !/fictional|izmi[sš]ljen/i.test(data.note)) errors.push(where + ': note must state that the material is fictional');
  if (!data?.cases || typeof data.cases !== 'object' || Array.isArray(data.cases) || !Object.keys(data.cases).length) {
    return [...errors, where + ': cases must be a non-empty object keyed by fixture class'];
  }
  for (const [klass, item] of Object.entries(data.cases)) {
    const at = where + '#' + klass;
    if (!V2_EVAL_CLASSES.includes(klass)) errors.push(at + ': unknown fixture class');
    const extra = Object.keys(item ?? {}).filter((key) => !['input', 'expectedFindings', 'rationale'].includes(key));
    if (extra.length) errors.push(at + ': unknown fields ' + extra.join(', '));
    if (typeof item?.input !== 'string' || item.input.trim().length < 60 || item.input.length > 6000) errors.push(at + ': input must be 60-6000 characters');
    if (typeof item?.rationale !== 'string' || item.rationale.trim().length < 40) errors.push(at + ': rationale must explain what the input tests (40+ characters)');
    if (!Array.isArray(item?.expectedFindings) || item.expectedFindings.length < 1 || item.expectedFindings.length > 4) {
      errors.push(at + ': expectedFindings must list 1-4 checkable findings');
    }
    for (const finding of item?.expectedFindings ?? []) {
      if (typeof finding !== 'string' || finding.length < 20 || finding.length > 320) errors.push(at + ': each expected finding must be 20-320 characters');
    }
    const text = String(item?.input ?? '') + ' ' + (item?.expectedFindings ?? []).join(' ');
    if (CYRILLIC.test(text)) errors.push(at + ': use Latin script only');
    if (lang === 'sr' && !SR_LETTERS.test(text)) errors.push(at + ': Serbian case must be written in Serbian (no diacritics found)');
    if (klass === 'adversarial' && !String(item?.input ?? '').includes(INJECTION_CANARY)) errors.push(at + ': adversarial input must embed the injection canary ' + INJECTION_CANARY);
    if (/\bsk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY/.test(text)) errors.push(at + ': input must not contain credential-shaped strings');
  }
  return errors;
}

/** Returns the suite with concrete inputs and case-specific assertions applied where a case exists. */
export function applyCases(suite) {
  const entry = loadCases().get(suite.language + ':' + suite.promptId);
  if (!entry) return suite;
  const prefix = CASE_ASSERTION_PREFIX[suite.language] ?? CASE_ASSERTION_PREFIX.en;
  return {
    ...suite,
    fixtures: suite.fixtures.map((fixture) => {
      const item = entry.data.cases?.[fixture.class];
      if (!item) return fixture;
      return {
        ...fixture,
        concreteInput: item.input,
        graderAssertions: [...fixture.graderAssertions, ...item.expectedFindings.map((finding) => prefix + finding)],
      };
    }),
  };
}
