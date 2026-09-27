#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { loadValidRepository, ROOT } from './lib/upl.mjs';
import { buildEmpiricalEvalSuite, validateEmpiricalEvalSuite, V2_EVAL_CLASSES } from './lib/v2-evals.mjs';
import {
  EVAL_RUN_SCHEMA_VERSION,
  buildFixtureExecutionInput,
  buildJudgeInput,
  compareWithGolden,
  createOpenAIResponse,
  normalizeJudgeResult,
  sha256,
} from './lib/eval-runtime.mjs';

const args = process.argv.slice(2);
const value = (name, fallback = null) => {
  const prefix = '--' + name + '=';
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};
const has = (name) => args.includes('--' + name);

const live = has('live');
const promptId = value('prompt');
const lang = value('lang', 'en');
const fixtureClass = value('class');
const model = value('model', process.env.UPL_EVAL_MODEL || '');
const judgeModel = value('judge-model', process.env.UPL_EVAL_JUDGE_MODEL || model);
const trials = Number(value('trials', '1'));
const maxFixtures = Number(value('max-fixtures', live ? '12' : '12000'));
const maxOutputTokens = Number(value('max-output-tokens', '3500'));
const timeoutMs = Number(value('timeout-ms', '120000'));
const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const apiKey = process.env.OPENAI_API_KEY || '';
const baselinePath = path.join(ROOT, 'evals', 'baselines', 'v2.3.json');

if (!['en', 'sr'].includes(lang)) throw new Error('--lang must be en or sr.');
if (fixtureClass && !V2_EVAL_CLASSES.includes(fixtureClass)) throw new Error('--class must be one of: ' + V2_EVAL_CLASSES.join(', '));
if (!Number.isInteger(trials) || trials < 1 || trials > 10) throw new Error('--trials must be an integer from 1 to 10.');
if (!Number.isInteger(maxFixtures) || maxFixtures < 1) throw new Error('--max-fixtures must be a positive integer.');
if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 128) throw new Error('--max-output-tokens must be at least 128.');
if (live && !model) throw new Error('--model or UPL_EVAL_MODEL is required with --live.');
if (live && !judgeModel) throw new Error('--judge-model or UPL_EVAL_JUDGE_MODEL is required with --live.');
if (live && !apiKey) throw new Error('OPENAI_API_KEY is required with --live.');

const repo = loadValidRepository();
let baseline = { entries: {} };
if (existsSync(baselinePath)) baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const entries = baseline.entries ?? {};

const selected = [];
for (const category of repo.catalog.categories) {
  for (const prompt of category.prompts) {
    if (promptId && prompt.id !== promptId) continue;
    const localization = repo.prompts.get(prompt.id)?.localizations?.[lang];
    if (!localization) continue;
    const title = prompt.title?.[lang] || prompt.title?.en || prompt.id;
    const suite = buildEmpiricalEvalSuite({
      ...prompt,
      title,
      language: lang,
      category_id: category.id,
      subcategory_id: prompt.subcategory,
      subcategory: localization.data.subcategory,
    }, lang);
    const errors = validateEmpiricalEvalSuite(suite);
    if (errors.length) throw new Error(prompt.id + ': invalid eval suite: ' + errors.join('; '));

    for (const fixture of suite.fixtures) {
      if (fixtureClass && fixture.class !== fixtureClass) continue;
      selected.push({ prompt, localization, suite, fixture });
    }
  }
}

if (promptId && !selected.length) throw new Error('No fixture matched prompt ' + promptId + '.');
const plan = selected.slice(0, maxFixtures);
if (!plan.length) throw new Error('No fixtures selected.');

if (!live) {
  console.log(JSON.stringify({
    mode: 'dry-run',
    provider: 'openai-responses',
    model: model || null,
    judgeModel: judgeModel || null,
    language: lang,
    trials,
    selectedFixtures: plan.length,
    totalMatchingFixtures: selected.length,
    truncatedByMaxFixtures: selected.length > plan.length,
    prompts: [...new Set(plan.map((item) => item.suite.promptId))].length,
    classes: [...new Set(plan.map((item) => item.fixture.class))],
    estimatedModelCalls: plan.length * trials * 2,
    note: 'No API calls were made. Add --live with OPENAI_API_KEY and an explicit model to execute.',
  }, null, 2));
  process.exit(0);
}

const run = {
  schemaVersion: EVAL_RUN_SCHEMA_VERSION,
  createdAt: new Date().toISOString(),
  mode: 'live',
  provider: 'openai-responses',
  model,
  judgeModel,
  language: lang,
  trials,
  maxOutputTokens,
  timeoutMs,
  baseUrl,
  promptFilter: promptId,
  classFilter: fixtureClass,
  results: [],
};

for (const item of plan) {
  const fixtureHash = sha256(JSON.stringify({
    promptId: item.suite.promptId,
    language: item.suite.language,
    taskShape: item.suite.taskShape,
    fixture: item.fixture,
    effectivePromptHash: item.localization.bodyHash,
  }));

  for (let trial = 1; trial <= trials; trial += 1) {
    const executionInput = buildFixtureExecutionInput({
      effectivePrompt: item.localization.body,
      suite: item.suite,
      fixture: item.fixture,
    });
    const candidate = await createOpenAIResponse({
      apiKey,
      model,
      input: executionInput,
      maxOutputTokens,
      timeoutMs,
      baseUrl,
    });
    const judgeInput = buildJudgeInput({
      suite: item.suite,
      fixture: item.fixture,
      candidateOutput: candidate.outputText,
    });
    const judge = await createOpenAIResponse({
      apiKey,
      model: judgeModel,
      input: judgeInput,
      maxOutputTokens: 1800,
      timeoutMs,
      baseUrl,
    });
    const grading = normalizeJudgeResult(judge.outputText, item.fixture.graderAssertions.length);

    const result = {
      promptId: item.suite.promptId,
      language: lang,
      fixtureId: item.fixture.id,
      fixtureClass: item.fixture.class,
      trial,
      taskShape: item.suite.taskShape,
      fixtureHash,
      effectivePromptHash: item.localization.bodyHash,
      candidate: {
        responseId: candidate.responseId,
        model: candidate.model,
        status: candidate.status,
        latencyMs: candidate.latencyMs,
        usage: candidate.usage,
        output: candidate.outputText,
      },
      judge: {
        responseId: judge.responseId,
        model: judge.model,
        status: judge.status,
        latencyMs: judge.latencyMs,
        usage: judge.usage,
      },
      grading,
    };

    const baselineKey = lang + ':' + item.fixture.id;
    result.goldenComparison = compareWithGolden({ current: result, baselineEntry: entries[baselineKey] });
    run.results.push(result);

    const icon = grading.overallPass ? 'PASS' : 'FAIL';
    console.error(icon + ' ' + baselineKey + ' trial=' + trial + ' golden=' + result.goldenComparison.status);
  }
}

run.summary = {
  fixtures: plan.length,
  trials: run.results.length,
  passed: run.results.filter((item) => item.grading.overallPass).length,
  failed: run.results.filter((item) => !item.grading.overallPass).length,
  regressions: run.results.filter((item) => item.goldenComparison.status === 'REGRESSION').length,
  staleBaselines: run.results.filter((item) => item.goldenComparison.status === 'STALE_BASELINE').length,
  noBaseline: run.results.filter((item) => item.goldenComparison.status === 'NO_BASELINE').length,
};

const dir = path.join(ROOT, '.eval-runs');
mkdirSync(dir, { recursive: true });
const stamp = run.createdAt.replace(/[:.]/g, '-');
const outPath = path.join(dir, 'v2.3-' + stamp + '.json');
writeFileSync(outPath, JSON.stringify(run, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ output: path.relative(ROOT, outPath), summary: run.summary }, null, 2));

if (run.summary.failed || run.summary.regressions || run.summary.staleBaselines) process.exitCode = 1;
