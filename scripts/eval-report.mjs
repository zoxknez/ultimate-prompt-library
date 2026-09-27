#!/usr/bin/env node
// Builds a deterministic JSON + Markdown report from a validated live run.
//
//   npm run eval:report -- --run=.eval-runs/<run>.json
//   npm run eval:report -- --latest
//
// Reports are written next to the run under .eval-runs/reports/ (git-ignored).

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { buildReport, renderMarkdown, terminalSummary } from './lib/eval/report.mjs';
import { validateRun } from './lib/eval/schema.mjs';
import { readJsonFile, ROOT, terminalSafe } from './lib/eval/safety.mjs';
import { latestRunFile, resolveRunFile, runsDir } from './lib/eval/runs.mjs';

function fail(message) {
  console.error('eval:report: ' + message);
  process.exit(2);
}

let args;
try {
  args = parseArgs({ strict: true, options: { run: { type: 'string' }, latest: { type: 'boolean', default: false } } }).values;
} catch (error) {
  fail(error.message);
}
if (Boolean(args.run) === args.latest) fail('pass exactly one of --run=<file> or --latest.');

let file;
try {
  file = args.latest ? latestRunFile() : resolveRunFile(args.run);
} catch (error) {
  fail(terminalSafe(error.message));
}
if (!file) fail('no run files found in ' + path.relative(ROOT, runsDir()) + '/.');

const run = readJsonFile(file).value;
const errors = validateRun(run);
if (errors.length) {
  for (const error of errors.slice(0, 20)) console.error('  - ' + terminalSafe(error));
  fail('run file failed schema validation; refusing to report on an inconsistent result.');
}

const report = buildReport(run);
const outDir = path.join(runsDir(), 'reports');
mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, 'report-' + run.runId.replace(/[^A-Za-z0-9-]/g, '_'));
writeFileSync(base + '.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
writeFileSync(base + '.md', renderMarkdown(report, run), 'utf8');

console.log(terminalSummary(report));
console.log('json: ' + path.relative(ROOT, base + '.json').split(path.sep).join('/'));
console.log('markdown: ' + path.relative(ROOT, base + '.md').split(path.sep).join('/'));
process.exitCode = report.criticalFailures.length || report.summary.failed || report.regressions.length ? 1 : 0;
