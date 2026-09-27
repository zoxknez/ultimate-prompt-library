// Provider-neutral live execution: bounded retries, a hard request budget, strict grading and
// golden comparison. Execution is sequential on purpose (one request in flight) so a run cannot
// burst into rate limits or spend faster than an operator can stop it.

import { ProviderError } from './providers/errors.mjs';
import { buildCandidateRequest, buildJudgeRequest, parseJudgeOutput, runCodeChecks, HARNESS_PROTOCOL_VERSION } from './harness.mjs';
import { compareWithGolden } from './golden.mjs';
import { redactSecrets } from './safety.mjs';

export const LIMITS = Object.freeze({
  trials: { default: 1, min: 1, max: 5 },
  liveMaxFixtures: { default: 6, min: 1, max: 150 },
  candidateMaxOutputTokens: { default: 3000, min: 256, max: 16000 },
  judgeMaxOutputTokens: { default: 2500, min: 512, max: 8000 },
  timeoutMs: { default: 120000, min: 5000, max: 600000 },
  maxRetries: { default: 2, min: 0, max: 3 },
  maxRetryAfterMs: 60000,
  // Planned calls above this need --confirm-calls=<exact planned number>.
  confirmationThreshold: 20,
  hardMaxPlannedCalls: 600,
});

export function retryBudgetFor(plannedCalls) {
  return Math.max(4, Math.ceil(plannedCalls * 0.25));
}

export const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function backoffMs(attempt, retryAfterMs, random = Math.random) {
  if (retryAfterMs != null) return Math.min(retryAfterMs, LIMITS.maxRetryAfterMs);
  return Math.min(2000 * 2 ** (attempt - 1) + Math.floor(random() * 1000), LIMITS.maxRetryAfterMs);
}

/** Shared request counter: every HTTP attempt counts, including retries. */
export class RequestBudget {
  constructor(plannedCalls) {
    this.plannedCalls = plannedCalls;
    this.retryBudget = retryBudgetFor(plannedCalls);
    this.maxRequests = plannedCalls + this.retryBudget;
    this.attempted = 0;
    this.retried = 0;
  }
  take({ retry }) {
    if (this.attempted >= this.maxRequests) return false;
    if (retry && this.retried >= this.retryBudget) return false;
    this.attempted += 1;
    if (retry) this.retried += 1;
    return true;
  }
}

async function callWithRetries({ provider, config, request, budget, maxRetries, sleep, secrets, log }) {
  let attempts = 0;
  for (;;) {
    const retry = attempts > 0;
    if (!budget.take({ retry })) {
      throw Object.assign(new ProviderError('budget_exhausted', 'Request budget exhausted (' + budget.maxRequests + ' requests, ' + budget.retryBudget + ' retries).'), { attempts });
    }
    attempts += 1;
    try {
      const response = await provider.createResponse({ ...config, ...request });
      return { response, attempts };
    } catch (error) {
      const providerError = error instanceof ProviderError ? error : new ProviderError('malformed_response', redactSecrets(error?.message ?? String(error), secrets));
      providerError.message = redactSecrets(providerError.message, secrets);
      providerError.attempts = attempts;
      if (!providerError.retryable || attempts > maxRetries) throw providerError;
      const wait = backoffMs(attempts, providerError.retryAfterMs);
      if (providerError.retryAfterMs != null && providerError.retryAfterMs > LIMITS.maxRetryAfterMs) throw providerError;
      log('retry ' + providerError.kind + ' in ' + wait + ' ms (attempt ' + (attempts + 1) + '/' + (maxRetries + 1) + ')');
      await sleep(wait);
    }
  }
}

function callRecord(requestedModel, inputHash, outcome, attempts) {
  if (!outcome) return { requestedModel, inputHash, attempts, responded: false };
  return {
    requestedModel,
    inputHash,
    attempts,
    responded: true,
    responseId: outcome.responseId,
    resolvedModel: outcome.resolvedModel,
    status: outcome.status,
    incompleteReason: outcome.incompleteReason,
    latencyMs: outcome.latencyMs,
    usage: outcome.usage,
  };
}

const failedGrading = (graderError = null) => ({ overallPass: false, assertions: [], codeChecks: [], criticalFailure: null, graderError });

/**
 * Executes one fixture trial. Returns a result object; throws only for run-fatal provider errors
 * (auth, quota, invalid request, exhausted budget), which must stop the whole run.
 */
export async function executeTrial({ item, trial, provider, config, options, budget, baselineEntries, sleep = defaultSleep, log = () => {} }) {
  const secrets = [config.apiKey];
  const base = {
    promptId: item.promptId,
    language: item.language,
    categoryId: item.categoryId,
    subcategoryId: item.subcategoryId,
    taskShape: item.suite.taskShape,
    fixtureId: item.fixture.id,
    fixtureClass: item.fixture.class,
    fixtureHash: item.fixtureHash,
    effectivePromptHash: item.effectivePromptHash,
    trial,
  };
  const candidateRequest = buildCandidateRequest({ effectivePrompt: item.effectivePrompt, fixture: item.fixture, language: item.language });
  const common = { maxRetries: options.maxRetries, sleep, secrets, log, provider, config, budget };

  const finish = (result) => {
    const full = { ...base, ...result };
    full.goldenComparison = compareWithGolden({ result: full, entry: baselineEntries[item.language + ':' + item.fixture.id] });
    return full;
  };
  const providerFailure = (stage, error, candidate, judge = null) => {
    if (error.fatalForRun || error.kind === 'budget_exhausted') throw error;
    return finish({
      executionStatus: 'PROVIDER_ERROR',
      candidate,
      judge,
      output: null,
      grading: failedGrading(),
      error: { stage, kind: error.kind, httpStatus: error.httpStatus ?? null, message: error.message },
    });
  };

  let candidate;
  try {
    candidate = await callWithRetries({
      ...common,
      request: {
        system: candidateRequest.system,
        user: candidateRequest.user,
        model: options.model,
        maxOutputTokens: options.maxOutputTokens,
        timeoutMs: options.timeoutMs,
        temperature: options.temperature,
      },
    });
  } catch (error) {
    return providerFailure('candidate', error, callRecord(options.model, candidateRequest.inputHash, null, Math.max(1, error.attempts ?? 1)));
  }
  const candidateOut = candidate.response;
  const candidateRec = callRecord(options.model, candidateRequest.inputHash, candidateOut, candidate.attempts);

  if (candidateOut.outcome === 'refusal') {
    return finish({ executionStatus: 'CANDIDATE_REFUSAL', candidate: candidateRec, judge: null, output: candidateOut.refusal, grading: failedGrading(), error: null });
  }
  if (candidateOut.outcome === 'incomplete') {
    return finish({ executionStatus: 'CANDIDATE_INCOMPLETE', candidate: candidateRec, judge: null, output: candidateOut.text, grading: failedGrading(), error: null });
  }

  const judgeRequest = buildJudgeRequest({ suite: item.suite, fixture: item.fixture, candidateOutput: candidateOut.text });
  let judge;
  try {
    judge = await callWithRetries({
      ...common,
      request: {
        system: judgeRequest.system,
        user: judgeRequest.user,
        model: options.judgeModel,
        maxOutputTokens: options.judgeMaxOutputTokens,
        timeoutMs: options.timeoutMs,
        temperature: null,
        jsonSchema: judgeRequest.jsonSchema,
      },
    });
  } catch (error) {
    return providerFailure('judge', error, candidateRec, callRecord(options.judgeModel, judgeRequest.inputHash, null, Math.max(1, error.attempts ?? 1)));
  }
  const judgeOut = judge.response;
  const judgeRec = callRecord(options.judgeModel, judgeRequest.inputHash, judgeOut, judge.attempts);

  if (judgeOut.outcome !== 'ok') {
    return finish({
      executionStatus: 'GRADER_ERROR',
      candidate: candidateRec,
      judge: judgeRec,
      output: candidateOut.text,
      grading: failedGrading({ code: judgeOut.outcome === 'refusal' ? 'JUDGE_REFUSAL' : 'JUDGE_INCOMPLETE', message: 'Judge did not return a complete grading.' }),
      error: null,
    });
  }
  const parsed = parseJudgeOutput(judgeOut.text, { assertionCount: item.fixture.graderAssertions.length, candidateOutput: candidateOut.text });
  if (!parsed.ok) {
    return finish({ executionStatus: 'GRADER_ERROR', candidate: candidateRec, judge: judgeRec, output: candidateOut.text, grading: failedGrading(parsed.error), error: null });
  }
  const codeChecks = runCodeChecks(item.fixture, candidateOut.text);
  const assertions = parsed.assertions.map((a) => ({ ...a, text: item.fixture.graderAssertions[a.index - 1] }));
  const overallPass = assertions.every((a) => a.pass) && codeChecks.every((c) => c.pass) && !parsed.criticalFailure;
  return finish({
    executionStatus: 'COMPLETED',
    candidate: candidateRec,
    judge: judgeRec,
    output: candidateOut.text,
    grading: { overallPass, assertions, codeChecks, criticalFailure: parsed.criticalFailure, graderError: null },
    error: null,
  });
}

export { HARNESS_PROTOCOL_VERSION };
