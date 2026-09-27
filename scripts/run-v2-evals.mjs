#!/usr/bin/env node
// Executable eval runner. DRY RUN BY DEFAULT: without --live it makes no network request and only
// prints the execution plan. Live execution needs --live, an API key in the environment and
// explicit candidate and judge models. See docs/v2-evaluation-methodology.md.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { loadValidRepository } from './lib/upl.mjs';
import { V2_VERSION } from './lib/v2-quality.mjs';
import { V2_EVAL_CLASSES } from './lib/v2-evals.mjs';
import { LANGUAGES, loadManifest, planHash, selectByFilters, selectByManifest } from './lib/eval/plan.mjs';
import { executeTrial, LIMITS, RequestBudget } from './lib/eval/execute.mjs';
import { HARNESS_PROTOCOL_VERSION, buildCandidateRequest } from './lib/eval/harness.mjs';
import { BASELINE_PATH, loadBaseline } from './lib/eval/golden.mjs';
import { EVAL_RUN_SCHEMA_VERSION, summarizeResults, validateRun } from './lib/eval/schema.mjs';
import { DEFAULT_PROVIDER, getProvider } from './lib/eval/providers/index.mjs';
import { gitCommit, redactSecrets, ROOT, terminalSafe } from './lib/eval/safety.mjs';
import { runsDir } from './lib/eval/runs.mjs';

function usage(message) {
  console.error('eval:run: ' + message);
  console.error('Usage: npm run eval:run -- [--prompt=UPL-XX-NNN] [--lang=en|sr|all] [--class=<fixture class>] [--manifest=evals/manifests/<file>.json]');
  console.error('       [--live --model=<model> --judge-model=<model>] [--trials=N] [--max-fixtures=N] [--confirm-calls=N]');
  process.exit(2);
}

let parsed;
try {
  parsed = parseArgs({
    strict: true,
    allowPositionals: false,
    options: {
      live: { type: 'boolean', default: false },
      prompt: { type: 'string' },
      lang: { type: 'string' },
      class: { type: 'string' },
      manifest: { type: 'string' },
      provider: { type: 'string', default: DEFAULT_PROVIDER },
      model: { type: 'string' },
      'judge-model': { type: 'string' },
      trials: { type: 'string' },
      'max-fixtures': { type: 'string' },
      'max-output-tokens': { type: 'string' },
      'judge-max-output-tokens': { type: 'string' },
      'timeout-ms': { type: 'string' },
      'max-retries': { type: 'string' },
      temperature: { type: 'string' },
      'confirm-calls': { type: 'string' },
      'price-input-per-mtok': { type: 'string' },
      'price-output-per-mtok': { type: 'string' },
    },
  }).values;
} catch (error) {
  usage(error.message);
}

function intOption(name, limits, fallback) {
  const raw = parsed[name];
  if (raw === undefined) return fallback ?? limits.default;
  if (!/^\d+$/.test(raw)) usage('--' + name + ' must be a whole number.');
  const value = Number(raw);
  if (value < limits.min || value > limits.max) usage('--' + name + ' must be between ' + limits.min + ' and ' + limits.max + '.');
  return value;
}
function priceOption(name) {
  const raw = parsed[name];
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) usage('--' + name + ' must be a non-negative number (price per million tokens).');
  return value;
}

const live = parsed.live;
if (parsed.manifest && (parsed.prompt || parsed.lang || parsed.class)) usage('--manifest cannot be combined with --prompt, --lang or --class.');
const languages = parsed.lang === 'all' ? [...LANGUAGES] : [parsed.lang ?? 'en'];
if (!languages.every((lang) => LANGUAGES.includes(lang))) usage('--lang must be en, sr or all.');
if (parsed.class && !V2_EVAL_CLASSES.includes(parsed.class)) usage('--class must be one of: ' + V2_EVAL_CLASSES.join(', '));
if (parsed.prompt && !/^UPL-[A-Z]+-\d{3}$/.test(parsed.prompt)) usage('--prompt must look like UPL-IT-031.');

const trials = intOption('trials', LIMITS.trials);
const maxOutputTokens = intOption('max-output-tokens', LIMITS.candidateMaxOutputTokens);
const judgeMaxOutputTokens = intOption('judge-max-output-tokens', LIMITS.judgeMaxOutputTokens);
const timeoutMs = intOption('timeout-ms', LIMITS.timeoutMs);
const maxRetries = intOption('max-retries', LIMITS.maxRetries);
let temperature = null;
if (parsed.temperature !== undefined) {
  temperature = Number(parsed.temperature);
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) usage('--temperature must be between 0 and 2.');
}
const model = parsed.model || process.env.UPL_EVAL_MODEL || '';
const judgeModel = parsed['judge-model'] || process.env.UPL_EVAL_JUDGE_MODEL || '';
const provider = (() => {
  try {
    return getProvider(parsed.provider);
  } catch (error) {
    return usage(error.message);
  }
})();

const repo = loadValidRepository();
let manifestInfo = null;
let selected;
try {
  if (parsed.manifest) {
    const { file, manifest } = loadManifest(parsed.manifest);
    manifestInfo = { path: path.relative(ROOT, file).split(path.sep).join('/'), name: manifest.name };
    selected = selectByManifest(repo, manifest);
  } else {
    selected = selectByFilters(repo, { promptId: parsed.prompt ?? null, languages, fixtureClass: parsed.class ?? null });
  }
} catch (error) {
  usage(error.message);
}
if (parsed.prompt && !selected.length) usage('No fixture matched prompt ' + parsed.prompt + '.');
if (!selected.length) usage('No fixtures selected.');

const defaultMax = live
  ? (manifestInfo ? Math.min(selected.length, LIMITS.liveMaxFixtures.max) : LIMITS.liveMaxFixtures.default)
  : selected.length;
const maxFixtures = live
  ? intOption('max-fixtures', LIMITS.liveMaxFixtures, defaultMax)
  : intOption('max-fixtures', { default: selected.length, min: 1, max: Number.MAX_SAFE_INTEGER }, defaultMax);
const plan = selected.slice(0, maxFixtures);
const candidateCalls = plan.length * trials;
const plannedCalls = candidateCalls * 2;
const budget = new RequestBudget(plannedCalls);

let config = null;
let configError = null;
try {
  config = provider.resolveConfig(process.env);
} catch (error) {
  configError = error.message;
}

const approxInputChars = plan.reduce((sum, item) => {
  const request = buildCandidateRequest({ effectivePrompt: item.effectivePrompt, fixture: item.fixture, language: item.language });
  return sum + request.system.length + request.user.length;
}, 0) * trials;
const outputTokenCeiling = candidateCalls * maxOutputTokens + candidateCalls * judgeMaxOutputTokens;
const priceIn = priceOption('price-input-per-mtok');
const priceOut = priceOption('price-output-per-mtok');

const missingForLive = [
  !config?.apiKey && 'OPENAI_API_KEY environment variable',
  !model && '--model (or UPL_EVAL_MODEL)',
  !judgeModel && '--judge-model (or UPL_EVAL_JUDGE_MODEL)',
  configError,
].filter(Boolean);
const confirmationRequired = plannedCalls > LIMITS.confirmationThreshold;

const planSummary = {
  harnessProtocolVersion: HARNESS_PROTOCOL_VERSION,
  promptQualityVersion: V2_VERSION,
  provider: provider.id,
  model: model || null,
  judgeModel: judgeModel || null,
  selection: manifestInfo
    ? { manifest: manifestInfo.path, name: manifestInfo.name }
    : { prompt: parsed.prompt ?? null, languages, fixtureClass: parsed.class ?? null },
  trials,
  selectedFixtures: plan.length,
  totalMatchingFixtures: selected.length,
  truncatedByMaxFixtures: selected.length > plan.length,
  prompts: new Set(plan.map((item) => item.promptId)).size,
  languages: [...new Set(plan.map((item) => item.language))],
  classes: [...new Set(plan.map((item) => item.fixture.class))],
  candidateCalls,
  judgeCalls: candidateCalls,
  plannedCalls,
  maxApiRequestsIncludingRetries: budget.maxRequests,
  maxOutputTokensUpperBound: outputTokenCeiling,
  approxCandidateInputTokens: Math.round(approxInputChars / 4),
  approxNote: 'Input tokens are a rough chars/4 estimate for candidate calls only; judge input adds roughly the candidate output size.',
  costUpperBound: priceIn !== null && priceOut !== null
    ? Number(((approxInputChars / 4) * 2 * priceIn / 1e6 + outputTokenCeiling * priceOut / 1e6).toFixed(4))
    : null,
  costNote: 'No prices are built in. Pass --price-input-per-mtok and --price-output-per-mtok from the current provider price list to get a rough upper bound.',
  planHash: planHash(plan, trials),
  firstFixtures: plan.slice(0, 12).map((item) => item.language + ':' + item.fixture.id),
};

if (!live) {
  console.log(JSON.stringify({
    mode: 'dry-run',
    apiCallsMade: 0,
    ...planSummary,
    liveReadiness: missingForLive.length ? { ready: false, missing: missingForLive } : { ready: true, missing: [] },
    confirmationRequiredForLive: confirmationRequired ? '--confirm-calls=' + plannedCalls : null,
    note: 'Dry run: no API calls were made. Live execution requires --live, OPENAI_API_KEY and explicit --model and --judge-model.',
  }, null, 2));
  process.exit(0);
}

if (missingForLive.length) usage('live execution needs: ' + missingForLive.join(', ') + '.');
if (plannedCalls > LIMITS.hardMaxPlannedCalls) usage('plan needs ' + plannedCalls + ' calls; hard maximum is ' + LIMITS.hardMaxPlannedCalls + '. Narrow the selection.');
if (confirmationRequired && parsed['confirm-calls'] !== String(plannedCalls)) {
  usage('this live plan makes ' + plannedCalls + ' planned calls (up to ' + budget.maxRequests + ' with retries). Re-run with --confirm-calls=' + plannedCalls + ' to proceed.');
}

let baseline;
try {
  baseline = loadBaseline();
} catch (error) {
  usage(error.message);
}

const runId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(3).toString('hex');
const run = {
  schemaVersion: EVAL_RUN_SCHEMA_VERSION,
  runId,
  mode: 'live',
  createdAt: new Date().toISOString(),
  completedAt: null,
  harnessProtocolVersion: HARNESS_PROTOCOL_VERSION,
  promptQualityVersion: V2_VERSION,
  gitCommit: gitCommit(),
  environment: { node: process.version, platform: process.platform },
  provider: provider.id,
  providerEndpointHost: config.baseUrlHost,
  candidate: { requestedModel: model, maxOutputTokens, temperature },
  judge: { requestedModel: judgeModel, maxOutputTokens: judgeMaxOutputTokens, temperature: null },
  limits: { timeoutMs, maxRetries, retryBudget: budget.retryBudget, maxRequests: budget.maxRequests, concurrency: 1 },
  selection: planSummary.selection,
  baselineFile: path.relative(ROOT, BASELINE_PATH).split(path.sep).join('/'),
  plan: { fixtures: plan.length, trials, plannedCalls, hash: planSummary.planHash },
  apiRequests: null,
  aborted: null,
  results: [],
  summary: null,
};

let interrupted = false;
process.on('SIGINT', () => {
  if (interrupted) process.exit(130);
  interrupted = true;
  console.error('eval:run: interrupt received; finishing the current request, then writing partial results.');
});

const log = (line) => console.error('  ' + terminalSafe(line));
try {
  outer: for (const item of plan) {
    for (let trial = 1; trial <= trials; trial += 1) {
      if (interrupted) {
        run.aborted = { reason: 'interrupted by operator', kind: 'interrupt' };
        break outer;
      }
      const result = await executeTrial({
        item,
        trial,
        provider,
        config,
        options: { model, judgeModel, maxOutputTokens, judgeMaxOutputTokens, timeoutMs, maxRetries, temperature },
        budget,
        baselineEntries: baseline.entries,
        log,
      });
      run.results.push(result);
      console.error(terminalSafe(
        result.executionStatus + ' ' + (result.grading.overallPass ? 'PASS' : 'FAIL') + ' ' +
        result.language + ':' + result.fixtureId + ' trial=' + trial + ' golden=' + result.goldenComparison.status,
      ));
    }
  }
} catch (error) {
  run.aborted = { reason: redactSecrets(error.message, [config.apiKey]), kind: error.kind ?? 'error' };
  console.error('eval:run: aborted: ' + terminalSafe(run.aborted.reason));
}

run.completedAt = new Date().toISOString();
run.apiRequests = { attempted: budget.attempted, retried: budget.retried };
run.summary = summarizeResults(run.results);

// Final guard: the key must never reach disk, even inside a provider error string.
let serialized = JSON.stringify(run, null, 2) + '\n';
if (config.apiKey && serialized.includes(config.apiKey)) serialized = redactSecrets(serialized, [config.apiKey]);

const schemaErrors = validateRun(JSON.parse(serialized));
const dir = runsDir();
mkdirSync(dir, { recursive: true });
const outPath = path.join(dir, 'run-' + runId + '.json');
writeFileSync(outPath, serialized, { encoding: 'utf8', flag: 'wx' });

console.log(JSON.stringify({
  output: path.relative(ROOT, outPath).split(path.sep).join('/'),
  aborted: run.aborted,
  apiRequests: run.apiRequests,
  summary: run.summary,
  schemaValid: schemaErrors.length === 0,
  schemaErrors: schemaErrors.slice(0, 10),
  report: 'npm run eval:report -- --run=' + path.relative(ROOT, outPath).split(path.sep).join('/'),
}, null, 2));

if (run.aborted) process.exitCode = 3;
else if (schemaErrors.length || run.summary.failed || run.summary.notEvaluated || run.summary.golden.REGRESSION || run.summary.golden.STALE_BASELINE) process.exitCode = 1;
