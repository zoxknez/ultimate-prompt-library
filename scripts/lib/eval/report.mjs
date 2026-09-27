// Deterministic reporting for validated live runs. The same run always produces the same JSON and
// Markdown. Failures are never hidden behind the aggregate pass rate: critical failures are listed
// first and individually. Model output is untrusted and only appears escaped or inside safe fences.

import { markdownCell, markdownFence, terminalSafe } from './safety.mjs';
import { summarizeResults } from './schema.mjs';

export const CRITICAL_CLASSES = Object.freeze(['adversarial', 'provenance']);
export const HIGH_IMPACT_CATEGORIES = Object.freeze(['UPL-LAW', 'UPL-HEALTH']);
export const HIGH_IMPACT_SUBCATEGORIES = Object.freeze(['cybersecurity']);

const failed = (r) => ['COMPLETED', 'CANDIDATE_REFUSAL'].includes(r.executionStatus) && r.grading.overallPass !== true;

/** Why a result counts as critical; empty when it is not. */
export function criticalReasons(result) {
  const reasons = [];
  if (result.goldenComparison?.status === 'REGRESSION') reasons.push('golden regression');
  if (result.grading?.criticalFailure) reasons.push('judge critical failure');
  for (const check of result.grading?.codeChecks ?? []) if (!check.pass) reasons.push('code check failed: ' + check.id);
  if (failed(result)) {
    if (CRITICAL_CLASSES.includes(result.fixtureClass)) reasons.push(result.fixtureClass + ' fixture failed');
    if (HIGH_IMPACT_CATEGORIES.includes(result.categoryId) || HIGH_IMPACT_SUBCATEGORIES.includes(result.subcategoryId)) {
      reasons.push('high-impact domain failure');
    }
  }
  return reasons;
}

function stats(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))];
  return { count: sorted.length, min: sorted[0], p50: at(0.5), p90: at(0.9), max: sorted[sorted.length - 1] };
}

function sumUsage(calls) {
  const totals = { calls: 0, withUsage: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, reasoningTokens: 0 };
  for (const call of calls) {
    if (!call?.responded) continue;
    totals.calls += 1;
    if (!call.usage) continue;
    totals.withUsage += 1;
    for (const key of ['inputTokens', 'outputTokens', 'totalTokens', 'reasoningTokens']) totals[key] += call.usage[key] ?? 0;
  }
  return totals;
}

function groupFailures(results, key) {
  const out = {};
  for (const r of results) {
    const k = r[key];
    out[k] ??= { results: 0, failed: 0 };
    out[k].results += 1;
    if (failed(r)) out[k].failed += 1;
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

export function buildReport(run) {
  const results = run.results;
  const summary = summarizeResults(results);
  const failing = results.filter((r) => r.grading.overallPass !== true);
  const byPrompt = new Map();
  for (const r of failing) byPrompt.set(r.promptId, (byPrompt.get(r.promptId) ?? 0) + 1);

  const failureDetails = failing.map((r) => ({
    identity: r.language + ':' + r.fixtureId + '#' + r.trial,
    promptId: r.promptId,
    fixtureClass: r.fixtureClass,
    categoryId: r.categoryId,
    taskShape: r.taskShape,
    executionStatus: r.executionStatus,
    critical: criticalReasons(r),
    failingAssertions: (r.grading.assertions ?? []).filter((a) => !a.pass).map((a) => ({ index: a.index, verdict: a.verdict, assertion: a.text, reason: a.reason })),
    failingCodeChecks: (r.grading.codeChecks ?? []).filter((c) => !c.pass),
    criticalFailure: r.grading.criticalFailure ?? null,
    graderError: r.grading.graderError ?? null,
    providerError: r.error ?? null,
    golden: r.goldenComparison,
  }));

  return {
    reportSchemaVersion: 1,
    runId: run.runId,
    createdAt: run.createdAt,
    completedAt: run.completedAt,
    aborted: run.aborted,
    provider: run.provider,
    candidateModel: { requested: run.candidate.requestedModel, resolved: [...new Set(results.map((r) => r.candidate?.resolvedModel).filter(Boolean))] },
    judgeModel: { requested: run.judge.requestedModel, resolved: [...new Set(results.map((r) => r.judge?.resolvedModel).filter(Boolean))] },
    promptQualityVersion: run.promptQualityVersion,
    harnessProtocolVersion: run.harnessProtocolVersion,
    gitCommit: run.gitCommit,
    languages: [...new Set(results.map((r) => r.language))].sort(),
    prompts: new Set(results.map((r) => r.promptId)).size,
    fixtures: new Set(results.map((r) => r.language + ':' + r.fixtureId)).size,
    trials: run.plan.trials,
    summary,
    criticalFailures: failureDetails.filter((f) => f.critical.length),
    regressions: results.filter((r) => r.goldenComparison.status === 'REGRESSION').map((r) => ({ identity: r.language + ':' + r.fixtureId + '#' + r.trial, reasons: r.goldenComparison.reasons })),
    staleBaselines: results.filter((r) => r.goldenComparison.status === 'STALE_BASELINE').map((r) => ({ identity: r.language + ':' + r.fixtureId, reasons: r.goldenComparison.reasons })),
    missingBaselines: results.filter((r) => r.goldenComparison.status === 'NO_BASELINE').length,
    graderErrors: results.filter((r) => r.executionStatus === 'GRADER_ERROR').map((r) => ({ identity: r.language + ':' + r.fixtureId + '#' + r.trial, code: r.grading.graderError?.code })),
    providerErrors: results.filter((r) => r.executionStatus === 'PROVIDER_ERROR').map((r) => ({ identity: r.language + ':' + r.fixtureId + '#' + r.trial, stage: r.error?.stage, kind: r.error?.kind })),
    failuresByFixtureClass: groupFailures(results, 'fixtureClass'),
    failuresByCategory: groupFailures(results, 'categoryId'),
    failuresByTaskShape: groupFailures(results, 'taskShape'),
    latencyMs: {
      candidate: stats(results.map((r) => r.candidate?.latencyMs)),
      judge: stats(results.map((r) => r.judge?.latencyMs)),
    },
    usage: {
      candidate: sumUsage(results.map((r) => r.candidate)),
      judge: sumUsage(results.map((r) => r.judge)),
    },
    apiRequests: run.apiRequests,
    mostProblematicPrompts: [...byPrompt].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([promptId, failures]) => ({ promptId, failures })),
    failures: failureDetails,
  };
}

const pct = (value) => (value === null ? 'n/a' : (value * 100).toFixed(1) + '%');

export function renderMarkdown(report, run) {
  const lines = [];
  const s = report.summary;
  lines.push('# Eval run report ' + markdownCell(report.runId), '');
  lines.push('| Field | Value |', '|---|---|');
  const rows = [
    ['Created', report.createdAt], ['Completed', report.completedAt ?? 'n/a'], ['Aborted', report.aborted ? report.aborted.reason : 'no'],
    ['Provider', report.provider],
    ['Candidate model', report.candidateModel.requested + ' -> ' + (report.candidateModel.resolved.join(', ') || 'n/a')],
    ['Judge model', report.judgeModel.requested + ' -> ' + (report.judgeModel.resolved.join(', ') || 'n/a')],
    ['Prompt quality / harness', report.promptQualityVersion + ' / protocol v' + report.harnessProtocolVersion],
    ['Git commit', report.gitCommit ?? 'unknown'], ['Languages', report.languages.join(', ')],
    ['Prompts / fixtures / trials', report.prompts + ' / ' + report.fixtures + ' / ' + report.trials],
    ['Evaluated / passed / failed', s.evaluated + ' / ' + s.passed + ' / ' + s.failed],
    ['Pass rate (evaluated only)', pct(s.passRate)], ['Not evaluated (provider/grader/incomplete)', String(s.notEvaluated)],
    ['Golden', Object.entries(s.golden).map(([k, v]) => k + '=' + v).join(', ')],
    ['API requests', report.apiRequests ? report.apiRequests.attempted + ' attempted, ' + report.apiRequests.retried + ' retries' : 'n/a'],
  ];
  for (const [k, v] of rows) lines.push('| ' + k + ' | ' + markdownCell(v) + ' |');
  lines.push('');

  lines.push('## Critical failures (' + report.criticalFailures.length + ')', '');
  if (!report.criticalFailures.length) lines.push('None.', '');
  for (const f of report.criticalFailures) {
    lines.push('- **' + markdownCell(f.identity) + '** (' + markdownCell(f.executionStatus) + '): ' + markdownCell(f.critical.join('; ')));
  }
  if (report.criticalFailures.length) lines.push('');

  const section = (title, items, render) => {
    lines.push('## ' + title + ' (' + items.length + ')', '');
    if (!items.length) lines.push('None.');
    for (const item of items) lines.push('- ' + render(item));
    lines.push('');
  };
  section('Regressions', report.regressions, (r) => markdownCell(r.identity) + ': ' + markdownCell(r.reasons.join('; ')));
  section('Stale baselines', report.staleBaselines, (r) => markdownCell(r.identity) + ': ' + markdownCell(r.reasons.join('; ')));
  lines.push('Missing baselines: ' + report.missingBaselines, '');
  section('Grader errors', report.graderErrors, (r) => markdownCell(r.identity) + ': ' + markdownCell(r.code));
  section('Provider errors (not model failures)', report.providerErrors, (r) => markdownCell(r.identity) + ': ' + markdownCell(r.stage + ' ' + r.kind));

  const table = (title, groups) => {
    lines.push('## ' + title, '', '| Group | Results | Failed |', '|---|---:|---:|');
    for (const [k, v] of Object.entries(groups)) lines.push('| ' + markdownCell(k) + ' | ' + v.results + ' | ' + v.failed + ' |');
    lines.push('');
  };
  table('Failures by fixture class', report.failuresByFixtureClass);
  table('Failures by category', report.failuresByCategory);
  table('Failures by task shape', report.failuresByTaskShape);

  lines.push('## Latency and usage', '');
  lines.push('- Candidate latency ms: ' + markdownCell(JSON.stringify(report.latencyMs.candidate)));
  lines.push('- Judge latency ms: ' + markdownCell(JSON.stringify(report.latencyMs.judge)));
  lines.push('- Candidate usage: ' + markdownCell(JSON.stringify(report.usage.candidate)));
  lines.push('- Judge usage: ' + markdownCell(JSON.stringify(report.usage.judge)), '');

  lines.push('## Most problematic prompts', '');
  if (!report.mostProblematicPrompts.length) lines.push('None.');
  for (const p of report.mostProblematicPrompts) lines.push('- ' + markdownCell(p.promptId) + ': ' + p.failures + ' failing result(s)');
  lines.push('');

  lines.push('## Failure details', '');
  if (!report.failures.length) lines.push('None.', '');
  const outputs = new Map(run.results.map((r) => [r.language + ':' + r.fixtureId + '#' + r.trial, r.output]));
  for (const f of report.failures) {
    lines.push('### ' + markdownCell(f.identity), '');
    lines.push('- Status: ' + markdownCell(f.executionStatus) + '; class: ' + markdownCell(f.fixtureClass) + '; shape: ' + markdownCell(f.taskShape));
    if (f.critical.length) lines.push('- Critical: ' + markdownCell(f.critical.join('; ')));
    if (f.criticalFailure) lines.push('- Judge critical failure: ' + markdownCell(f.criticalFailure));
    if (f.graderError) lines.push('- Grader error: ' + markdownCell(f.graderError.code + ': ' + f.graderError.message));
    if (f.providerError) lines.push('- Provider error: ' + markdownCell(f.providerError.stage + ' ' + f.providerError.kind + ': ' + f.providerError.message));
    for (const a of f.failingAssertions) lines.push('- Assertion ' + a.index + ' (' + markdownCell(a.verdict) + '): ' + markdownCell(a.assertion) + ' | reason: ' + markdownCell(a.reason));
    for (const c of f.failingCodeChecks) lines.push('- Code check ' + markdownCell(c.id) + ': ' + markdownCell(c.detail));
    const output = outputs.get(f.identity);
    if (output) lines.push('', 'Candidate output (untrusted, first 2000 characters):', '', markdownFence(String(output).slice(0, 2000)));
    lines.push('');
  }
  return lines.join('\n') + '\n';
}

export function terminalSummary(report) {
  const s = report.summary;
  return [
    'run ' + terminalSafe(report.runId) + (report.aborted ? ' (ABORTED: ' + terminalSafe(report.aborted.reason) + ')' : ''),
    'evaluated ' + s.evaluated + ', passed ' + s.passed + ', failed ' + s.failed + ', not evaluated ' + s.notEvaluated + ', pass rate ' + pct(s.passRate),
    'critical failures ' + report.criticalFailures.length + ', regressions ' + report.regressions.length + ', stale ' + report.staleBaselines.length + ', missing baselines ' + report.missingBaselines,
  ].join('\n');
}
