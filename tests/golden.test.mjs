// Golden comparison and baseline acceptance: stale vs regression, and every refusal path.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareWithGolden, emptyBaseline, planAcceptance } from '../scripts/lib/eval/golden.mjs';
import { summarizeResults, validateBaseline, duplicateBaselineKeys, validateRun } from '../scripts/lib/eval/schema.mjs';
import { HARNESS_PROTOCOL_VERSION } from '../scripts/lib/eval/harness.mjs';
import { V2_VERSION } from '../scripts/lib/v2-quality.mjs';

const H = (c) => c.repeat(64);
const call = (model) => ({ requestedModel: model, inputHash: H('a'), attempts: 1, responded: true, responseId: 'resp_1', resolvedModel: model + '-2026', status: 'completed', incompleteReason: null, latencyMs: 10, usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2, reasoningTokens: null, cachedInputTokens: null } });

function result(overrides = {}) {
  const base = {
    promptId: 'UPL-IT-031', language: 'en', categoryId: 'UPL-IT', subcategoryId: 'cybersecurity', taskShape: 'audit',
    fixtureId: 'UPL-IT-031:nominal', fixtureClass: 'nominal', fixtureHash: H('f'), effectivePromptHash: H('e'), trial: 1,
    executionStatus: 'COMPLETED', candidate: call('cand'), judge: call('judge'), output: 'text',
    grading: { overallPass: true, assertions: [{ index: 1, pass: true, verdict: 'pass' }, { index: 2, pass: true, verdict: 'pass' }], codeChecks: [], criticalFailure: null, graderError: null },
    error: null, goldenComparison: { status: 'NO_BASELINE', reasons: [], modelChanged: false },
  };
  return { ...base, ...overrides };
}

function run(results, overrides = {}) {
  const r = {
    schemaVersion: 2, runId: 'r1', mode: 'live', createdAt: '2026-09-27T10:00:00.000Z', completedAt: '2026-09-27T10:05:00.000Z',
    harnessProtocolVersion: HARNESS_PROTOCOL_VERSION, promptQualityVersion: V2_VERSION, provider: 'openai-responses',
    candidate: { requestedModel: 'cand' }, judge: { requestedModel: 'judge' },
    plan: { fixtures: results.length, trials: 1, plannedCalls: results.length * 2, hash: H('c') },
    aborted: null, results, ...overrides,
  };
  r.summary = summarizeResults(r.results);
  return r;
}

const entry = (overrides = {}) => ({
  promptId: 'UPL-IT-031', language: 'en', fixtureId: 'UPL-IT-031:nominal', fixtureClass: 'nominal',
  fixtureHash: H('f'), effectivePromptHash: H('e'), harnessProtocolVersion: HARNESS_PROTOCOL_VERSION, provider: 'openai-responses',
  candidateModel: 'cand-2026', candidateRequestedModel: 'cand', judgeModel: 'judge-2026', sourceRunId: 'r0',
  acceptedAt: '2026-09-01T00:00:00.000Z', trials: 1, overallPass: true,
  assertions: [{ index: 1, pass: true }, { index: 2, pass: true }], codeChecks: [], ...overrides,
});
const current = new Map([['en:UPL-IT-031:nominal', { fixtureHash: H('f'), effectivePromptHash: H('e') }]]);

test('comparison statuses: NO_BASELINE, PASS, REGRESSION, STALE_BASELINE, NOT_EVALUATED', () => {
  assert.equal(compareWithGolden({ result: result(), entry: null }).status, 'NO_BASELINE');
  assert.equal(compareWithGolden({ result: result(), entry: entry() }).status, 'PASS');
  const regressed = result({ grading: { ...result().grading, overallPass: false, assertions: [{ index: 1, pass: true }, { index: 2, pass: false }] } });
  const cmp = compareWithGolden({ result: regressed, entry: entry() });
  assert.equal(cmp.status, 'REGRESSION');
  assert.ok(cmp.reasons.includes('assertion 2 regressed'));
  assert.equal(compareWithGolden({ result: result({ executionStatus: 'CANDIDATE_REFUSAL', grading: { ...result().grading, overallPass: false } }), entry: entry() }).status, 'REGRESSION');
});

test('changed fixture, prompt or harness is STALE, never REGRESSION', () => {
  const failing = result({ grading: { ...result().grading, overallPass: false } });
  assert.equal(compareWithGolden({ result: failing, entry: entry({ fixtureHash: H('0') }) }).status, 'STALE_BASELINE');
  assert.equal(compareWithGolden({ result: failing, entry: entry({ effectivePromptHash: H('0') }) }).status, 'STALE_BASELINE');
  assert.equal(compareWithGolden({ result: failing, entry: entry({ harnessProtocolVersion: 1 }) }).status, 'STALE_BASELINE');
});

test('provider and grader errors are NOT_EVALUATED, not regressions', () => {
  for (const status of ['PROVIDER_ERROR', 'GRADER_ERROR', 'CANDIDATE_INCOMPLETE']) {
    assert.equal(compareWithGolden({ result: result({ executionStatus: status }), entry: entry() }).status, 'NOT_EVALUATED');
  }
});

test('acceptance succeeds only for a valid, fully passing, current run', () => {
  const { entries, errors } = planAcceptance({ run: run([result()]), baseline: emptyBaseline(), current });
  assert.deepEqual(errors, []);
  const accepted = entries['en:UPL-IT-031:nominal'];
  assert.equal(accepted.candidateModel, 'cand-2026');
  assert.equal(accepted.judgeModel, 'judge-2026');
  const baseline = { ...emptyBaseline(), updatedAt: '2026-09-27T10:06:00.000Z', entries };
  assert.deepEqual(validateBaseline(baseline, { promptQualityVersion: V2_VERSION }), []);
});

test('acceptance refuses failing, grader-error, provider-error, aborted and dry runs', () => {
  const failing = result({ grading: { ...result().grading, overallPass: false, assertions: [{ index: 1, pass: true }, { index: 2, pass: false }] } });
  assert.ok(planAcceptance({ run: run([failing]), baseline: emptyBaseline(), current }).errors.length);
  const graderError = result({ executionStatus: 'GRADER_ERROR', grading: { overallPass: false, assertions: [], codeChecks: [], criticalFailure: null, graderError: { code: 'INVALID_JSON', message: 'x' } } });
  assert.ok(planAcceptance({ run: run([graderError]), baseline: emptyBaseline(), current }).errors.some((e) => /GRADER_ERROR|grader error/.test(e)));
  const providerError = result({ executionStatus: 'PROVIDER_ERROR', judge: null, grading: { overallPass: false, assertions: [], codeChecks: [], criticalFailure: null, graderError: null }, error: { stage: 'candidate', kind: 'transient' } });
  assert.ok(planAcceptance({ run: run([providerError]), baseline: emptyBaseline(), current }).errors.length);
  assert.ok(planAcceptance({ run: run([result()], { aborted: { reason: 'x' } }), baseline: emptyBaseline(), current }).errors.length);
  assert.ok(planAcceptance({ run: { ...run([result()]), mode: 'dry-run' }, baseline: emptyBaseline(), current }).errors.length);
});

test('acceptance refuses unknown schema, inconsistent summary, stale runs and duplicate identities', () => {
  assert.ok(planAcceptance({ run: { ...run([result()]), schemaVersion: 99 }, baseline: emptyBaseline(), current }).errors.length);
  assert.ok(planAcceptance({ run: { ...run([result()]), summary: { passed: 999 } }, baseline: emptyBaseline(), current }).errors.length);
  const staleCurrent = new Map([['en:UPL-IT-031:nominal', { fixtureHash: H('9'), effectivePromptHash: H('e') }]]);
  assert.ok(planAcceptance({ run: run([result()]), baseline: emptyBaseline(), current: staleCurrent }).errors.some((e) => /stale run/.test(e)));
  const dup = run([result(), result()], { plan: { fixtures: 1, trials: 2, plannedCalls: 4, hash: H('c') } });
  assert.ok(planAcceptance({ run: dup, baseline: emptyBaseline(), current }).errors.some((e) => /duplicate/.test(e)));
});

test('acceptance refuses results without reproducibility metadata', () => {
  const noId = result({ candidate: { ...call('cand'), responseId: null } });
  assert.ok(planAcceptance({ run: run([noId]), baseline: emptyBaseline(), current }).errors.some((e) => /responseId/.test(e)));
  const noModel = result({ judge: { ...call('judge'), resolvedModel: null } });
  assert.ok(planAcceptance({ run: run([noModel]), baseline: emptyBaseline(), current }).errors.some((e) => /resolvedModel/.test(e)));
});

test('existing entries are never replaced implicitly', () => {
  const withCurrent = { ...emptyBaseline(), entries: { 'en:UPL-IT-031:nominal': entry() } };
  assert.ok(planAcceptance({ run: run([result()]), baseline: withCurrent, current }).errors.some((e) => /--replace-existing/.test(e)));
  assert.deepEqual(planAcceptance({ run: run([result()]), baseline: withCurrent, current, replaceExisting: true }).errors, []);
  const withStale = { ...emptyBaseline(), entries: { 'en:UPL-IT-031:nominal': entry({ fixtureHash: H('0') }) } };
  assert.ok(planAcceptance({ run: run([result()]), baseline: withStale, current }).errors.some((e) => /--replace-stale/.test(e)));
  assert.deepEqual(planAcceptance({ run: run([result()]), baseline: withStale, current, replaceStale: true }).errors, []);
});

test('baseline validation rejects failing entries and duplicate raw keys', () => {
  const bad = { ...emptyBaseline(), entries: { 'en:UPL-IT-031:nominal': entry({ overallPass: false }) } };
  assert.ok(validateBaseline(bad).length);
  const raw = '{"entries":{"en:UPL-IT-031:nominal":{},"en:UPL-IT-031:nominal":{}}}';
  assert.deepEqual(duplicateBaselineKeys(raw), ['en:UPL-IT-031:nominal']);
});

test('run validation catches overallPass inconsistent with assertions', () => {
  const lying = result({ grading: { ...result().grading, overallPass: true, assertions: [{ index: 1, pass: true }, { index: 2, pass: false }] } });
  assert.ok(validateRun(run([lying])).some((e) => /overallPass is inconsistent/.test(e)));
});
