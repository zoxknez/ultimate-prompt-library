// OpenAI Responses API adapter (native fetch, no SDK dependency).
//
// Provider adapter contract (see docs/v2-evaluation-methodology.md, "Provider adapter contract"):
//   id                         stable provider identifier recorded in runs and baselines
//   resolveConfig(env)         -> { apiKey, baseUrl, baseUrlHost } or throws; never logs the key
//   createResponse(request)    -> NormalizedResponse, or throws ProviderError
// request:  { system, user, model, maxOutputTokens, timeoutMs, temperature?, jsonSchema?, fetchImpl? }
// NormalizedResponse: { outcome: 'ok' | 'refusal' | 'incomplete', text, refusal, status,
//   incompleteReason, responseId, resolvedModel, usage, latencyMs, httpStatus }
// The core harness never sees provider-specific payloads.

import { ProviderError, classifyHttpError } from './errors.mjs';
import { redactSecrets } from '../safety.mjs';

export const id = 'openai-responses';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const MAX_BODY_BYTES = 8 * 1024 * 1024;
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function resolveConfig(env = process.env) {
  const apiKey = env.OPENAI_API_KEY || '';
  const baseUrl = (env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('OPENAI_BASE_URL is not a valid URL.');
  }
  // The API key is sent to this host, so plain HTTP is only allowed for a local mock server.
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.has(url.hostname))) {
    throw new Error('OPENAI_BASE_URL must use https:// (http:// is allowed only for localhost test servers).');
  }
  if (url.username || url.password) throw new Error('OPENAI_BASE_URL must not embed credentials.');
  return { apiKey, baseUrl, baseUrlHost: url.host };
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return null;
  const num = (value) => (Number.isFinite(value) ? value : null);
  return {
    inputTokens: num(usage.input_tokens),
    outputTokens: num(usage.output_tokens),
    totalTokens: num(usage.total_tokens),
    reasoningTokens: num(usage.output_tokens_details?.reasoning_tokens),
    cachedInputTokens: num(usage.input_tokens_details?.cached_tokens),
  };
}

function extract(payload) {
  const texts = [];
  const refusals = [];
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    if (item?.type !== 'message') continue;
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') texts.push(content.text);
      if (content?.type === 'refusal' && typeof content.refusal === 'string') refusals.push(content.refusal);
    }
  }
  return { text: texts.join('\n').trim(), refusal: refusals.join('\n').trim() };
}

async function readLimited(response) {
  const reader = response.body?.getReader?.();
  if (!reader) return await response.text();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      throw new ProviderError('malformed_response', 'Provider response exceeded ' + MAX_BODY_BYTES + ' bytes.', { httpStatus: response.status });
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
}

export async function createResponse({
  apiKey,
  baseUrl,
  system,
  user,
  model,
  maxOutputTokens,
  timeoutMs,
  temperature = null,
  jsonSchema = null,
  fetchImpl = globalThis.fetch,
}) {
  if (!apiKey) throw new ProviderError('auth', 'OPENAI_API_KEY is not set.');
  if (!model) throw new ProviderError('invalid_request', 'A model is required.');

  const body = {
    model,
    instructions: system,
    input: user,
    max_output_tokens: maxOutputTokens,
    store: false,
  };
  if (temperature !== null) body.temperature = temperature;
  if (jsonSchema) {
    body.text = { format: { type: 'json_schema', name: jsonSchema.name, schema: jsonSchema.schema, strict: true } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  let response;
  let bodyText;
  try {
    response = await fetchImpl(baseUrl + '/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
      redirect: 'error',
    });
    bodyText = await readLimited(response);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (controller.signal.aborted) throw new ProviderError('timeout', 'Request timed out after ' + timeoutMs + ' ms.');
    throw new ProviderError('network', 'Network error: ' + redactSecrets(error?.cause?.code || error?.message || 'unknown', [apiKey]));
  } finally {
    clearTimeout(timer);
  }
  const latencyMs = Date.now() - started;

  let payload = null;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw classifyHttpError({
      httpStatus: response.status,
      code: payload?.error?.code ?? payload?.error?.type ?? null,
      message: redactSecrets(payload?.error?.message || bodyText.slice(0, 500) || 'HTTP ' + response.status, [apiKey]),
      retryAfter: response.headers.get('retry-after'),
    });
  }
  if (!payload || typeof payload !== 'object') {
    throw new ProviderError('malformed_response', 'Provider returned a non-JSON success body.', { httpStatus: response.status });
  }
  if (payload.status === 'failed' || payload.error) {
    throw new ProviderError('provider_failed', redactSecrets(payload.error?.message || 'Response status failed.', [apiKey]), { httpStatus: response.status });
  }

  const { text, refusal } = extract(payload);
  const common = {
    status: payload.status ?? null,
    incompleteReason: payload.incomplete_details?.reason ?? null,
    responseId: typeof payload.id === 'string' ? payload.id : null,
    resolvedModel: typeof payload.model === 'string' ? payload.model : null,
    usage: normalizeUsage(payload.usage),
    latencyMs,
    httpStatus: response.status,
  };

  if (refusal && !text) return { ...common, outcome: 'refusal', text: '', refusal };
  if (payload.status === 'incomplete') return { ...common, outcome: 'incomplete', text, refusal: refusal || null };
  if (!text) throw new ProviderError('malformed_response', 'Provider returned no output text and no refusal.', { httpStatus: response.status });
  return { ...common, outcome: 'ok', text, refusal: refusal || null };
}
