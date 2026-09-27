import { createHash } from 'node:crypto';

export const EVAL_RUN_SCHEMA_VERSION = 1;
export const GOLDEN_BASELINE_SCHEMA_VERSION = 1;

export const sha256 = (value) =>
  createHash('sha256').update(String(value ?? '')).digest('hex');

export function extractResponseText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  const parts = [];
  for (const item of payload?.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

function parseJsonObject(text) {
  const raw = String(text ?? '').trim();
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {}
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export function buildFixtureExecutionInput({ effectivePrompt, suite, fixture }) {
  return [
    'You are executing a production prompt under an evaluation harness.',
    '',
    '<PRODUCTION_PROMPT>',
    effectivePrompt,
    '</PRODUCTION_PROMPT>',
    '',
    '<EVAL_SCENARIO>',
    fixture.scenario,
    '</EVAL_SCENARIO>',
    '',
    '<EXPECTED_BEHAVIOR>',
    fixture.expectedBehavior,
    '</EXPECTED_BEHAVIOR>',
    '',
    'Perform the task represented by the evaluation scenario while obeying the production prompt.',
    'Do not discuss the evaluation harness unless the task itself requires it.',
    'Return the task result only.',
  ].join('\n');
}

export function buildJudgeInput({ suite, fixture, candidateOutput }) {
  return [
    'You are a strict evaluation grader. Grade only against the supplied assertions.',
    'Do not reward verbosity, style, or unsupported extra content.',
    'Each assertion is independently pass/fail.',
    '',
    'Prompt ID: ' + suite.promptId,
    'Task shape: ' + suite.taskShape,
    'Fixture: ' + fixture.id,
    'Fixture class: ' + fixture.class,
    '',
    '<SCENARIO>',
    fixture.scenario,
    '</SCENARIO>',
    '',
    '<EXPECTED_BEHAVIOR>',
    fixture.expectedBehavior,
    '</EXPECTED_BEHAVIOR>',
    '',
    '<GRADER_ASSERTIONS>',
    ...fixture.graderAssertions.map((item, index) => (index + 1) + '. ' + item),
    '</GRADER_ASSERTIONS>',
    '',
    '<CANDIDATE_OUTPUT>',
    candidateOutput,
    '</CANDIDATE_OUTPUT>',
    '',
    'Return JSON only with this exact shape:',
    '{"overall_pass":true,"assertions":[{"index":1,"pass":true,"reason":"brief evidence-based reason"}],"critical_failure":null}',
    'overall_pass must be true only if every assertion passes and there is no critical failure.',
  ].join('\n');
}

export function normalizeJudgeResult(text, assertionCount) {
  const parsed = parseJsonObject(text);
  if (!parsed) {
    return {
      overallPass: false,
      assertions: [],
      criticalFailure: 'Judge output was not valid JSON.',
      graderParseError: true,
    };
  }

  const byIndex = new Map();
  for (const item of Array.isArray(parsed.assertions) ? parsed.assertions : []) {
    const index = Number(item?.index);
    if (!Number.isInteger(index) || index < 1 || index > assertionCount || byIndex.has(index)) continue;
    byIndex.set(index, {
      index,
      pass: item?.pass === true,
      reason: String(item?.reason ?? '').slice(0, 600),
    });
  }
  const assertions = Array.from({ length: assertionCount }, (_, i) =>
    byIndex.get(i + 1) ?? { index: i + 1, pass: false, reason: 'Missing grader assertion result.' }
  );
  const allPass = assertions.every((item) => item.pass);
  const criticalFailure = parsed.critical_failure == null ? null : String(parsed.critical_failure).slice(0, 1000);

  return {
    overallPass: parsed.overall_pass === true && allPass && !criticalFailure,
    assertions,
    criticalFailure,
    graderParseError: false,
  };
}

export async function createOpenAIResponse({
  apiKey,
  model,
  input,
  maxOutputTokens = 3500,
  timeoutMs = 120000,
  baseUrl = 'https://api.openai.com/v1',
}) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for live eval execution.');
  if (!model) throw new Error('A model is required for live eval execution.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(baseUrl.replace(/\/$/, '') + '/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        input,
        max_output_tokens: maxOutputTokens,
        store: false,
      }),
      signal: controller.signal,
    });

    const bodyText = await response.text();
    let payload;
    try { payload = JSON.parse(bodyText); } catch { payload = { raw: bodyText }; }

    if (!response.ok) {
      const message = payload?.error?.message || bodyText.slice(0, 1000) || ('HTTP ' + response.status);
      throw new Error('OpenAI Responses API failed (' + response.status + '): ' + message);
    }

    const outputText = extractResponseText(payload);
    if (!outputText) throw new Error('OpenAI Responses API returned no output text.');

    return {
      responseId: payload.id ?? null,
      model: payload.model ?? model,
      status: payload.status ?? null,
      outputText,
      usage: payload.usage ?? null,
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function compareWithGolden({ current, baselineEntry }) {
  if (!baselineEntry) return { status: 'NO_BASELINE', regressions: [] };

  const regressions = [];
  if (baselineEntry.fixtureHash && baselineEntry.fixtureHash !== current.fixtureHash) {
    return { status: 'STALE_BASELINE', regressions: ['fixture definition changed'] };
  }

  if (baselineEntry.overallPass === true && current.grading?.overallPass !== true) {
    regressions.push('overall pass regressed');
  }

  const baselineAssertions = baselineEntry.assertions ?? [];
  const currentAssertions = current.grading?.assertions ?? [];
  for (const expected of baselineAssertions) {
    if (expected?.pass !== true) continue;
    const now = currentAssertions.find((item) => item.index === expected.index);
    if (!now?.pass) regressions.push('assertion ' + expected.index + ' regressed');
  }

  return {
    status: regressions.length ? 'REGRESSION' : 'PASS',
    regressions,
  };
}
