// Versioned schemas for live eval runs and golden baselines, with validators that reject
// incomplete or internally inconsistent files. Baseline acceptance and reporting only operate on
// files that pass these checks.

export const EVAL_RUN_SCHEMA_VERSION = 2;
export const GOLDEN_BASELINE_SCHEMA_VERSION = 2;

export const EXECUTION_STATUSES = Object.freeze([
  'COMPLETED', // candidate answered and the judge produced a valid grading
  'CANDIDATE_REFUSAL', // the model refused; a task failure, recorded distinctly
  'CANDIDATE_INCOMPLETE', // output cut off (for example max_output_tokens); harness budget issue, not graded
  'GRADER_ERROR', // judge output failed schema, consistency or quote verification; fails closed
  'PROVIDER_ERROR', // transport/provider failure after bounded retries; not a model failure
]);
export const GOLDEN_STATUSES = Object.freeze(['NO_BASELINE', 'PASS', 'REGRESSION', 'STALE_BASELINE', 'NOT_EVALUATED']);
export const TASK_FAILURE_STATUSES = Object.freeze(['COMPLETED', 'CANDIDATE_REFUSAL']);

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isStr = (v) => typeof v === 'string' && v.length > 0;
const isHash = (v) => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);
const isInt = (v, min = 0) => Number.isInteger(v) && v >= min;
const isIso = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Summary recomputed from results; stored summaries must match it exactly. */
export function summarizeResults(results) {
  const count = (fn) => results.filter(fn).length;
  const byStatus = Object.fromEntries(EXECUTION_STATUSES.map((status) => [status, count((r) => r.executionStatus === status)]));
  const evaluated = count((r) => TASK_FAILURE_STATUSES.includes(r.executionStatus));
  const passed = count((r) => r.grading?.overallPass === true);
  return {
    results: results.length,
    evaluated,
    passed,
    failed: evaluated - passed,
    notEvaluated: results.length - evaluated,
    passRate: evaluated ? Number((passed / evaluated).toFixed(4)) : null,
    byExecutionStatus: byStatus,
    golden: Object.fromEntries(GOLDEN_STATUSES.map((status) => [status, count((r) => r.goldenComparison?.status === status)])),
  };
}

function validateCall(where, call, errors, { required }) {
  if (!required && call === null) return;
  if (!isObj(call)) return errors.push(where + ' must be an object');
  if (!isStr(call.requestedModel)) errors.push(where + '.requestedModel missing');
  if (!isInt(call.attempts, 1)) errors.push(where + '.attempts must be >= 1');
  if (!isHash(call.inputHash)) errors.push(where + '.inputHash missing');
  if (call.responded) {
    if (!isStr(call.responseId)) errors.push(where + '.responseId missing (reproducibility metadata)');
    if (!isStr(call.resolvedModel)) errors.push(where + '.resolvedModel missing (reproducibility metadata)');
    if (!isInt(call.latencyMs)) errors.push(where + '.latencyMs missing');
    if (call.usage !== null && !isObj(call.usage)) errors.push(where + '.usage must be an object or null');
  }
}

export function validateRunResult(result, i) {
  const errors = [];
  const where = 'results[' + i + ']';
  if (!isObj(result)) return [where + ' must be an object'];
  for (const key of ['promptId', 'language', 'categoryId', 'subcategoryId', 'taskShape', 'fixtureId', 'fixtureClass']) {
    if (!isStr(result[key])) errors.push(where + '.' + key + ' missing');
  }
  if (isStr(result.fixtureId) && isStr(result.promptId) && !result.fixtureId.startsWith(result.promptId + ':')) {
    errors.push(where + '.fixtureId is outside the prompt namespace');
  }
  if (!isHash(result.fixtureHash)) errors.push(where + '.fixtureHash invalid');
  if (!isHash(result.effectivePromptHash)) errors.push(where + '.effectivePromptHash invalid');
  if (!isInt(result.trial, 1)) errors.push(where + '.trial must be >= 1');
  if (!EXECUTION_STATUSES.includes(result.executionStatus)) errors.push(where + '.executionStatus unknown');
  if (!isObj(result.grading)) errors.push(where + '.grading missing');
  if (!isObj(result.goldenComparison) || !GOLDEN_STATUSES.includes(result.goldenComparison.status)) {
    errors.push(where + '.goldenComparison.status unknown');
  }

  const status = result.executionStatus;
  validateCall(where + '.candidate', result.candidate, errors, { required: true });
  if (status === 'COMPLETED' || status === 'GRADER_ERROR') {
    if (!result.candidate?.responded) errors.push(where + '.candidate must have responded for ' + status);
    validateCall(where + '.judge', result.judge, errors, { required: true });
  }
  if (status === 'COMPLETED') {
    if (!result.judge?.responded) errors.push(where + '.judge must have responded for COMPLETED');
    const grading = result.grading ?? {};
    if (grading.graderError) errors.push(where + '.grading.graderError must be null for COMPLETED');
    if (!Array.isArray(grading.assertions) || !grading.assertions.length) errors.push(where + '.grading.assertions missing');
    else {
      const indexes = grading.assertions.map((a) => a.index);
      if (indexes.some((n, k) => n !== k + 1)) errors.push(where + '.grading.assertions must be indexed 1..N');
      if (grading.assertions.some((a) => typeof a.pass !== 'boolean')) errors.push(where + '.grading.assertions[].pass must be boolean');
    }
    if (!Array.isArray(grading.codeChecks)) errors.push(where + '.grading.codeChecks missing');
    const expected = Array.isArray(grading.assertions) && grading.assertions.length > 0 &&
      grading.assertions.every((a) => a.pass === true) &&
      (grading.codeChecks ?? []).every((c) => c.pass === true) && !grading.criticalFailure;
    if (grading.overallPass !== expected) errors.push(where + '.grading.overallPass is inconsistent with assertions/codeChecks/criticalFailure');
  } else if (result.grading?.overallPass !== false) {
    errors.push(where + '.grading.overallPass must be false for ' + status);
  }
  if (status === 'GRADER_ERROR' && !isStr(result.grading?.graderError?.code)) errors.push(where + '.grading.graderError.code missing');
  if (status === 'PROVIDER_ERROR' && !isStr(result.error?.kind)) errors.push(where + '.error.kind missing');
  return errors;
}

export function validateRun(run) {
  const errors = [];
  if (!isObj(run)) return ['run must be a JSON object'];
  if (run.schemaVersion !== EVAL_RUN_SCHEMA_VERSION) errors.push('unsupported run schemaVersion ' + run.schemaVersion);
  if (run.mode !== 'live') errors.push('only live runs are stored as run files');
  for (const key of ['runId', 'provider', 'promptQualityVersion']) if (!isStr(run[key])) errors.push(key + ' missing');
  if (!isInt(run.harnessProtocolVersion, 1)) errors.push('harnessProtocolVersion missing');
  if (!isIso(run.createdAt)) errors.push('createdAt missing');
  if (run.completedAt !== null && !isIso(run.completedAt)) errors.push('completedAt invalid');
  if (!isObj(run.candidate) || !isStr(run.candidate.requestedModel)) errors.push('candidate.requestedModel missing');
  if (!isObj(run.judge) || !isStr(run.judge.requestedModel)) errors.push('judge.requestedModel missing');
  if (!isObj(run.plan) || !isInt(run.plan.fixtures, 1) || !isInt(run.plan.trials, 1) || !isHash(run.plan.hash)) errors.push('plan metadata missing');
  if (!Array.isArray(run.results)) return [...errors, 'results must be an array'];

  const identities = new Set();
  run.results.forEach((result, i) => {
    errors.push(...validateRunResult(result, i));
    const identity = result?.language + ':' + result?.fixtureId + ':' + result?.trial;
    if (identities.has(identity)) errors.push('duplicate result identity ' + identity);
    identities.add(identity);
  });
  if (!run.aborted && run.plan && run.results.length !== run.plan.fixtures * run.plan.trials) {
    errors.push('results count ' + run.results.length + ' does not match plan ' + run.plan.fixtures + ' x ' + run.plan.trials);
  }
  const summary = summarizeResults(run.results);
  if (JSON.stringify(summary) !== JSON.stringify(run.summary)) errors.push('stored summary does not match results');
  return errors;
}

/** Duplicate object keys are silently collapsed by JSON.parse, so identities are checked on raw text. */
export function duplicateBaselineKeys(raw) {
  const counts = new Map();
  for (const match of String(raw).matchAll(/"((?:en|sr):UPL-[A-Z]+-\d{3}:[a-z-]+)"\s*:/g)) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return [...counts].filter(([, n]) => n > 1).map(([key]) => key);
}

export function validateBaseline(baseline, { raw = null, promptQualityVersion = null } = {}) {
  const errors = [];
  if (!isObj(baseline)) return ['baseline must be a JSON object'];
  if (baseline.schemaVersion !== GOLDEN_BASELINE_SCHEMA_VERSION) errors.push('unsupported baseline schemaVersion ' + baseline.schemaVersion);
  if (promptQualityVersion && baseline.promptQualityVersion !== promptQualityVersion) {
    errors.push('baseline promptQualityVersion ' + baseline.promptQualityVersion + ' does not match ' + promptQualityVersion);
  }
  if (baseline.updatedAt !== null && !isIso(baseline.updatedAt)) errors.push('updatedAt invalid');
  if (!isObj(baseline.entries)) return [...errors, 'entries must be an object'];
  if (raw) for (const key of duplicateBaselineKeys(raw)) errors.push('duplicate baseline identity ' + key);
  for (const [key, entry] of Object.entries(baseline.entries)) {
    const where = 'entries["' + key + '"]';
    if (!isObj(entry)) {
      errors.push(where + ' must be an object');
      continue;
    }
    if (key !== entry.language + ':' + entry.fixtureId) errors.push(where + ' key does not match language:fixtureId');
    for (const field of ['promptId', 'language', 'fixtureId', 'fixtureClass', 'provider', 'candidateModel', 'judgeModel', 'sourceRunId']) {
      if (!isStr(entry[field])) errors.push(where + '.' + field + ' missing');
    }
    if (isStr(entry.fixtureId) && !entry.fixtureId.startsWith(entry.promptId + ':')) errors.push(where + ' fixtureId outside prompt namespace');
    if (!isHash(entry.fixtureHash)) errors.push(where + '.fixtureHash invalid');
    if (!isHash(entry.effectivePromptHash)) errors.push(where + '.effectivePromptHash invalid');
    if (!isInt(entry.harnessProtocolVersion, 1)) errors.push(where + '.harnessProtocolVersion missing');
    if (!isIso(entry.acceptedAt)) errors.push(where + '.acceptedAt invalid');
    if (!isInt(entry.trials, 1)) errors.push(where + '.trials missing');
    if (entry.overallPass !== true) errors.push(where + '.overallPass must be true (only passing behavior is golden)');
    if (!Array.isArray(entry.assertions) || !entry.assertions.length || entry.assertions.some((a, k) => a?.index !== k + 1 || a?.pass !== true)) {
      errors.push(where + '.assertions must be 1..N, all passing');
    }
    if (!Array.isArray(entry.codeChecks) || entry.codeChecks.some((c) => !isStr(c?.id) || c?.pass !== true)) {
      errors.push(where + '.codeChecks must list passing checks');
    }
  }
  return errors;
}
