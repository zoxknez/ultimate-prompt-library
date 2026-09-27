// Golden baselines: comparison of live results against accepted behavior, and the rules for
// accepting new baseline entries. Acceptance is a pure function so every refusal path is testable.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { V2_VERSION } from '../v2-quality.mjs';
import { HARNESS_PROTOCOL_VERSION } from './harness.mjs';
import { GOLDEN_BASELINE_SCHEMA_VERSION, validateBaseline, validateRun } from './schema.mjs';
import { ROOT } from './safety.mjs';

const minorLine = (version) => version.split('.').slice(0, 2).join('.');
export const BASELINE_DIR = path.join(ROOT, 'evals', 'baselines');
export const DEFAULT_BASELINE_PATH = path.join(BASELINE_DIR, 'v' + minorLine(V2_VERSION) + '.json');
// UPL_EVAL_BASELINE_PATH (absolute) exists for tests only, so acceptance can be exercised without
// touching the committed baseline.
export const BASELINE_PATH = process.env.UPL_EVAL_BASELINE_PATH && path.isAbsolute(process.env.UPL_EVAL_BASELINE_PATH)
  ? process.env.UPL_EVAL_BASELINE_PATH
  : DEFAULT_BASELINE_PATH;

export function emptyBaseline() {
  return {
    schemaVersion: GOLDEN_BASELINE_SCHEMA_VERSION,
    promptQualityVersion: V2_VERSION,
    description: 'Golden live-eval baselines. Entries are added only from validated, fully passing live runs via npm run baseline:accept with --accept-baseline.',
    updatedAt: null,
    entries: {},
  };
}

export function loadBaseline(file = BASELINE_PATH) {
  if (!existsSync(file)) throw new Error('Golden baseline file is missing: ' + path.relative(ROOT, file));
  const raw = readFileSync(file, 'utf8');
  const baseline = JSON.parse(raw);
  const errors = validateBaseline(baseline, { raw, promptQualityVersion: V2_VERSION });
  if (errors.length) throw new Error('Invalid golden baseline: ' + errors.slice(0, 10).join('; '));
  return baseline;
}

export function writeBaselineAtomic(baseline, file = BASELINE_PATH) {
  const errors = validateBaseline(baseline, { promptQualityVersion: V2_VERSION });
  if (errors.length) throw new Error('Refusing to write an invalid baseline: ' + errors.slice(0, 10).join('; '));
  const tmp = file + '.tmp-' + process.pid;
  writeFileSync(tmp, JSON.stringify(baseline, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
  renameSync(tmp, file);
}

/** Why an entry cannot be compared with the current fixture/prompt/harness. Empty when comparable. */
export function staleReasons(entry, current) {
  const reasons = [];
  if (entry.fixtureHash !== current.fixtureHash) reasons.push('fixture definition changed');
  if (entry.effectivePromptHash !== current.effectivePromptHash) reasons.push('effective prompt changed');
  if (entry.harnessProtocolVersion !== current.harnessProtocolVersion) reasons.push('harness protocol changed');
  return reasons;
}

export function compareWithGolden({ result, entry }) {
  if (!['COMPLETED', 'CANDIDATE_REFUSAL'].includes(result.executionStatus)) {
    return { status: 'NOT_EVALUATED', reasons: ['execution status ' + result.executionStatus + ' is not a graded task outcome'], modelChanged: false };
  }
  if (!entry) return { status: 'NO_BASELINE', reasons: [], modelChanged: false };
  const stale = staleReasons(entry, { ...result, harnessProtocolVersion: HARNESS_PROTOCOL_VERSION });
  const modelChanged = entry.candidateModel !== result.candidate?.resolvedModel;
  if (stale.length) return { status: 'STALE_BASELINE', reasons: stale, modelChanged };

  const reasons = [];
  if (result.executionStatus === 'CANDIDATE_REFUSAL') reasons.push('candidate refused a task that previously passed');
  if (result.grading?.overallPass !== true) reasons.push('overall pass regressed');
  const now = new Map((result.grading?.assertions ?? []).map((a) => [a.index, a.pass]));
  for (const expected of entry.assertions) if (now.get(expected.index) !== true) reasons.push('assertion ' + expected.index + ' regressed');
  const checks = new Map((result.grading?.codeChecks ?? []).map((c) => [c.id, c.pass]));
  for (const expected of entry.codeChecks) if (checks.get(expected.id) !== true) reasons.push('code check ' + expected.id + ' regressed');
  return { status: reasons.length ? 'REGRESSION' : 'PASS', reasons: [...new Set(reasons)], modelChanged };
}

/**
 * Decides which baseline entries a run may create or replace.
 * `current` maps "lang:fixtureId" -> { fixtureHash, effectivePromptHash } for the repository now.
 * Returns { entries, errors }; any error means nothing may be written.
 */
export function planAcceptance({ run, baseline, current, replaceStale = false, replaceExisting = false, now = new Date().toISOString() }) {
  const errors = [...validateRun(run).map((e) => 'run: ' + e)];
  if (errors.length) return { entries: {}, errors };
  if (run.promptQualityVersion !== V2_VERSION) errors.push('run was produced for prompt quality ' + run.promptQualityVersion + ', repository is ' + V2_VERSION);
  if (run.harnessProtocolVersion !== HARNESS_PROTOCOL_VERSION) errors.push('run used harness protocol ' + run.harnessProtocolVersion + ', current is ' + HARNESS_PROTOCOL_VERSION);
  if (run.aborted) errors.push('run was aborted: ' + run.aborted.reason);
  if (!run.results.length) errors.push('run has no results');

  const groups = new Map();
  for (const result of run.results) {
    const key = result.language + ':' + result.fixtureId;
    if (result.executionStatus !== 'COMPLETED') errors.push(key + ' trial ' + result.trial + ': execution status ' + result.executionStatus);
    else if (result.grading.overallPass !== true) errors.push(key + ' trial ' + result.trial + ': failed grading');
    if (result.grading?.graderError) errors.push(key + ' trial ' + result.trial + ': grader error ' + result.grading.graderError.code);
    const live = current.get(key);
    if (!live) errors.push(key + ': fixture no longer exists in the repository');
    else {
      if (live.fixtureHash !== result.fixtureHash) errors.push(key + ': run fixture hash differs from the repository (stale run)');
      if (live.effectivePromptHash !== result.effectivePromptHash) errors.push(key + ': run effective prompt differs from the repository (stale run)');
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(result);
  }

  const entries = {};
  for (const [key, results] of groups) {
    // Non-completed or failing trials were already reported above; they never produce an entry.
    if (results.some((r) => r.executionStatus !== 'COMPLETED' || r.grading?.overallPass !== true)) continue;
    const first = results[0];
    const trials = new Set(results.map((r) => r.trial));
    if (trials.size !== results.length) errors.push(key + ': duplicate trial numbers');
    const models = new Set(results.map((r) => r.candidate.resolvedModel));
    if (models.size !== 1) errors.push(key + ': trials resolved to different candidate models');

    const existing = baseline.entries[key];
    if (existing) {
      const stale = staleReasons(existing, { ...first, harnessProtocolVersion: HARNESS_PROTOCOL_VERSION });
      if (stale.length && !replaceStale) errors.push(key + ': existing baseline is stale (' + stale.join(', ') + '); review it and pass --replace-stale');
      if (!stale.length && !replaceExisting) errors.push(key + ': a current baseline already exists; pass --replace-existing to supersede it deliberately');
      if (!stale.length && existing.assertions.length > first.grading.assertions.length) {
        errors.push(key + ': new result covers fewer assertions than the existing baseline');
      }
    }

    entries[key] = {
      promptId: first.promptId,
      language: first.language,
      fixtureId: first.fixtureId,
      fixtureClass: first.fixtureClass,
      fixtureHash: first.fixtureHash,
      effectivePromptHash: first.effectivePromptHash,
      harnessProtocolVersion: run.harnessProtocolVersion,
      provider: run.provider,
      candidateModel: first.candidate.resolvedModel,
      candidateRequestedModel: first.candidate.requestedModel,
      judgeModel: first.judge.resolvedModel,
      sourceRunId: run.runId,
      acceptedAt: now,
      trials: results.length,
      overallPass: true,
      assertions: first.grading.assertions.map((a) => ({ index: a.index, pass: true })),
      codeChecks: first.grading.codeChecks.map((c) => ({ id: c.id, pass: true })),
    };
  }
  return { entries: errors.length ? {} : entries, errors };
}
