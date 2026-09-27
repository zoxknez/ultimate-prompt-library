#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/upl.mjs';
import { GOLDEN_BASELINE_SCHEMA_VERSION } from './lib/eval-runtime.mjs';

const args = process.argv.slice(2);
const value = (name) => {
  const prefix = '--' + name + '=';
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
};
const has = (name) => args.includes('--' + name);

const runArg = value('run');
if (!runArg) throw new Error('--run=<path-to-live-run.json> is required.');
if (!has('accept-baseline')) throw new Error('Refusing to change the golden baseline without --accept-baseline.');

const runPath = path.resolve(ROOT, runArg);
if (!existsSync(runPath)) throw new Error('Run file not found: ' + runArg);
const run = JSON.parse(readFileSync(runPath, 'utf8'));
if (run.mode !== 'live') throw new Error('Only live eval runs can be accepted as golden baselines.');
if (!Array.isArray(run.results) || !run.results.length) throw new Error('Run has no results.');
if (run.results.some((item) => !item.grading?.overallPass)) {
  throw new Error('Refusing baseline update because one or more results failed grading.');
}
if (run.results.some((item) => item.grading?.graderParseError)) {
  throw new Error('Refusing baseline update because a judge result failed to parse.');
}

const baselinePath = path.join(ROOT, 'evals', 'baselines', 'v2.3.json');
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : { schemaVersion: GOLDEN_BASELINE_SCHEMA_VERSION, entries: {} };

if (baseline.schemaVersion !== GOLDEN_BASELINE_SCHEMA_VERSION) {
  throw new Error('Unsupported golden baseline schema version.');
}
baseline.updatedAt = new Date().toISOString();
baseline.entries ??= {};

for (const result of run.results) {
  const key = result.language + ':' + result.fixtureId;
  baseline.entries[key] = {
    promptId: result.promptId,
    language: result.language,
    fixtureId: result.fixtureId,
    fixtureClass: result.fixtureClass,
    fixtureHash: result.fixtureHash,
    effectivePromptHash: result.effectivePromptHash,
    acceptedAt: baseline.updatedAt,
    provider: run.provider,
    model: result.candidate?.model || run.model,
    judgeModel: result.judge?.model || run.judgeModel,
    overallPass: true,
    assertions: (result.grading?.assertions ?? []).map((item) => ({
      index: item.index,
      pass: item.pass === true,
    })),
  };
}

writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
console.log('baseline:accept: accepted ' + run.results.length + ' result(s) into ' + path.relative(ROOT, baselinePath));
