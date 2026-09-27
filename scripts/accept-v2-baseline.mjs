#!/usr/bin/env node
// Accepts a validated, fully passing live run into the golden baseline. Never runs implicitly.
//
//   npm run baseline:accept -- --run=.eval-runs/<run>.json --accept-baseline
//
// Refuses: dry runs, schema-invalid or inconsistent runs, aborted runs, any non-COMPLETED or
// failing result, grader errors, runs made against a different prompt/fixture/harness version,
// and changes to existing entries unless --replace-stale / --replace-existing is given.

import path from 'node:path';
import { parseArgs } from 'node:util';
import { loadValidRepository } from './lib/upl.mjs';
import { allSuites, fixtureHash } from './lib/eval/plan.mjs';
import { BASELINE_PATH, loadBaseline, planAcceptance, writeBaselineAtomic } from './lib/eval/golden.mjs';
import { readJsonFile, ROOT, terminalSafe } from './lib/eval/safety.mjs';
import { resolveRunFile } from './lib/eval/runs.mjs';

function fail(message) {
  console.error('baseline:accept: ' + message);
  process.exit(1);
}

let args;
try {
  args = parseArgs({
    strict: true,
    options: {
      run: { type: 'string' },
      'accept-baseline': { type: 'boolean', default: false },
      'replace-stale': { type: 'boolean', default: false },
      'replace-existing': { type: 'boolean', default: false },
    },
  }).values;
} catch (error) {
  fail(error.message);
}

if (!args.run) fail('--run=<.eval-runs/run-....json> is required.');
if (!args['accept-baseline']) fail('refusing to change the golden baseline without --accept-baseline.');

let run;
try {
  run = readJsonFile(resolveRunFile(args.run)).value;
} catch (error) {
  fail(terminalSafe(error.message));
}

const repo = loadValidRepository();
const current = new Map();
for (const { lang, suite, localization } of allSuites(repo)) {
  for (const fixture of suite.fixtures) {
    current.set(lang + ':' + fixture.id, { fixtureHash: fixtureHash(suite, fixture), effectivePromptHash: localization.bodyHash });
  }
}

const baseline = loadBaseline();
const { entries, errors } = planAcceptance({
  run,
  baseline,
  current,
  replaceStale: args['replace-stale'],
  replaceExisting: args['replace-existing'],
});
if (errors.length) {
  for (const error of errors.slice(0, 50)) console.error('  - ' + terminalSafe(error));
  if (errors.length > 50) console.error('  ... ' + (errors.length - 50) + ' more');
  fail('refused (' + errors.length + ' problem(s)); the baseline was not changed.');
}

const next = { ...baseline, updatedAt: new Date().toISOString(), entries: { ...baseline.entries, ...entries } };
next.entries = Object.fromEntries(Object.entries(next.entries).sort(([a], [b]) => a.localeCompare(b)));
writeBaselineAtomic(next);
console.log('baseline:accept: accepted ' + Object.keys(entries).length + ' fixture baseline(s) from run ' + run.runId +
  ' into ' + path.relative(ROOT, BASELINE_PATH).split(path.sep).join('/'));
