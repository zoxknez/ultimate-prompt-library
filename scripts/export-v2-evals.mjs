#!/usr/bin/env node
// Generates and validates every localized empirical eval suite (default: EN + SR, 2000 suites /
// 12000 fixtures), or prints one suite as JSON with --prompt.
//
//   npm run evals:v2
//   npm run evals:v2 -- --prompt=UPL-IT-031 --lang=sr

import { parseArgs } from 'node:util';
import { loadValidRepository } from './lib/upl.mjs';
import { V2_EVAL_CLASSES } from './lib/v2-evals.mjs';
import { allSuites, fixtureHash, LANGUAGES } from './lib/eval/plan.mjs';

function fail(message) {
  console.error('evals:v2: ' + message);
  process.exit(1);
}

let args;
try {
  args = parseArgs({ strict: true, options: { prompt: { type: 'string' }, lang: { type: 'string' } } }).values;
} catch (error) {
  fail(error.message);
}
const languages = !args.lang || args.lang === 'all' ? [...LANGUAGES] : [args.lang];
if (!languages.every((lang) => LANGUAGES.includes(lang))) fail('--lang must be en, sr or all');
if (args.prompt && languages.length !== 1) fail('--prompt needs a single --lang=en or --lang=sr');

const repo = loadValidRepository();
let suites = 0;
const fixtureIds = new Set();
const hashes = new Set();
try {
  for (const { prompt, lang, suite } of allSuites(repo, languages)) {
    if (args.prompt && prompt.id !== args.prompt) continue;
    if (args.prompt) {
      console.log(JSON.stringify({ ...suite, fixtures: suite.fixtures.map((f) => ({ ...f, fixtureHash: fixtureHash(suite, f) })) }, null, 2));
      process.exit(0);
    }
    suites += 1;
    for (const fixture of suite.fixtures) {
      const key = lang + ':' + fixture.id;
      if (fixtureIds.has(key)) fail('duplicate fixture identity ' + key);
      fixtureIds.add(key);
      hashes.add(fixtureHash(suite, fixture));
    }
  }
} catch (error) {
  fail(error.message);
}
if (args.prompt) fail('prompt not found: ' + args.prompt);
if (hashes.size !== fixtureIds.size) fail('fixture hash collision: ' + fixtureIds.size + ' fixtures but ' + hashes.size + ' hashes');

console.log(
  'evals:v2: ' + suites + ' localized suites / ' + fixtureIds.size + ' fixtures / languages=' + languages.join(',') +
  ' / classes=' + V2_EVAL_CLASSES.join(',') + ' -> OK'
);
