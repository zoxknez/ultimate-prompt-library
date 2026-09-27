// Security surface of the eval harness and provider error taxonomy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { markdownCell, markdownFence, redactSecrets, resolveSafeFile, terminalSafe, canonicalJson } from '../scripts/lib/eval/safety.mjs';
import { classifyHttpError, parseRetryAfter, ProviderError } from '../scripts/lib/eval/providers/errors.mjs';
import { createResponse, resolveConfig } from '../scripts/lib/eval/providers/openai-responses.mjs';
import { backoffMs, RequestBudget } from '../scripts/lib/eval/execute.mjs';

test('redaction removes API keys, bearer tokens and known secret values', () => {
  const key = 'sk-proj-abcdefghijklmnop1234';
  const text = 'Incorrect API key provided: ' + key + ' / Authorization: Bearer abcdefghijklmnop / raw=' + 'mysecretvalue123';
  const out = redactSecrets(text, ['mysecretvalue123']);
  assert.ok(!out.includes(key));
  assert.ok(!out.includes('abcdefghijklmnop'));
  assert.ok(!out.includes('mysecretvalue123'));
});

test('terminal and markdown sanitization neutralize escapes, HTML and fences', () => {
  const hostile = 'ok\u001b[31mRED\u001b[0m\u202egnp.exe <script>alert(1)</script> | [x](javascript:alert(1)) `code`';
  const t = terminalSafe(hostile);
  assert.ok(!t.includes('\u001b') && !t.includes('\u202e'));
  const cell = markdownCell(hostile);
  assert.ok(!cell.includes('<script>'));
  assert.ok(cell.includes('&lt;script&gt;'));
  assert.ok(cell.includes('\\|'));
  assert.ok(cell.includes('\\['));
  const fenced = markdownFence('before\n```\n# injected heading\n```\nafter');
  const fence = fenced.split('\n')[0].replace('text', '');
  assert.ok(fence.length >= 4, 'fence must be longer than any backtick run inside');
  assert.ok(fenced.trimEnd().endsWith(fence));
});

test('canonical JSON is key-order independent', () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
});

test('safe file resolution blocks traversal, wrong extensions and symlinks', () => {
  const base = mkdtempSync(path.join(tmpdir(), 'upl-safe-'));
  const inside = path.join(base, 'run.json');
  writeFileSync(inside, '{}');
  const outsideDir = mkdtempSync(path.join(tmpdir(), 'upl-out-'));
  const outside = path.join(outsideDir, 'run.json');
  writeFileSync(outside, '{}');
  assert.equal(resolveSafeFile(inside, { baseDir: base }).toLowerCase(), inside.toLowerCase());
  assert.throws(() => resolveSafeFile(path.join(base, '..', path.basename(outsideDir), 'run.json'), { baseDir: base }), /must be inside/);
  assert.throws(() => resolveSafeFile(outside, { baseDir: base }), /must be inside/);
  writeFileSync(path.join(base, 'run.txt'), '{}');
  assert.throws(() => resolveSafeFile(path.join(base, 'run.txt'), { baseDir: base }), /\.json/);
  assert.throws(() => resolveSafeFile(path.join(base, 'missing.json'), { baseDir: base }), /not found/);
  mkdirSync(path.join(base, 'dir.json'));
  assert.throws(() => resolveSafeFile(path.join(base, 'dir.json'), { baseDir: base }), /regular file/);
  try {
    symlinkSync(outside, path.join(base, 'link.json'));
  } catch {
    return; // symlink creation needs privileges on some Windows setups; the lstat guard is still covered on POSIX CI
  }
  assert.throws(() => resolveSafeFile(path.join(base, 'link.json'), { baseDir: base }), /symbolic link/);
});

test('HTTP error classification separates auth, quota, rate limit, transient and invalid requests', () => {
  assert.equal(classifyHttpError({ httpStatus: 401 }).kind, 'auth');
  assert.equal(classifyHttpError({ httpStatus: 403 }).kind, 'auth');
  assert.equal(classifyHttpError({ httpStatus: 429, code: 'insufficient_quota' }).kind, 'quota');
  assert.equal(classifyHttpError({ httpStatus: 429, message: 'You exceeded your current quota' }).kind, 'quota');
  assert.equal(classifyHttpError({ httpStatus: 429, code: 'rate_limit_exceeded' }).kind, 'rate_limit');
  for (const status of [408, 409, 500, 502, 503, 504]) assert.equal(classifyHttpError({ httpStatus: status }).kind, 'transient');
  for (const status of [400, 404, 413, 422]) assert.equal(classifyHttpError({ httpStatus: status }).kind, 'invalid_request');
  assert.ok(new ProviderError('rate_limit', 'x').retryable);
  assert.ok(!new ProviderError('quota', 'x').retryable);
  assert.ok(new ProviderError('auth', 'x').fatalForRun);
  assert.equal(parseRetryAfter('2'), 2000);
  assert.equal(parseRetryAfter(null), null);
});

test('base URL must be HTTPS except for loopback test servers, and must not embed credentials', () => {
  assert.equal(resolveConfig({}).baseUrlHost, 'api.openai.com');
  assert.throws(() => resolveConfig({ OPENAI_BASE_URL: 'http://evil.example.com/v1' }), /https/);
  assert.throws(() => resolveConfig({ OPENAI_BASE_URL: 'https://user:pw@api.openai.com/v1' }), /credentials/);
  assert.equal(resolveConfig({ OPENAI_BASE_URL: 'http://127.0.0.1:9999/v1' }).baseUrlHost, '127.0.0.1:9999');
});

const reply = (status, body, headers = {}) => async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
const req = (fetchImpl, extra = {}) => createResponse({ apiKey: 'sk-test-abcdefgh12345', baseUrl: 'https://api.example.test/v1', system: 's', user: 'u', model: 'm', maxOutputTokens: 256, timeoutMs: 5000, fetchImpl, ...extra });

test('adapter normalizes output text, usage, refusal and incomplete responses', async () => {
  const ok = await req(reply(200, { id: 'resp_1', model: 'm-2026', status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'hello' }] }], usage: { input_tokens: 3, output_tokens: 1, total_tokens: 4 } }));
  assert.equal(ok.outcome, 'ok');
  assert.equal(ok.text, 'hello');
  assert.equal(ok.resolvedModel, 'm-2026');
  assert.equal(ok.usage.totalTokens, 4);
  const refusal = await req(reply(200, { id: 'r', model: 'm', status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] }));
  assert.equal(refusal.outcome, 'refusal');
  const incomplete = await req(reply(200, { id: 'r', model: 'm', status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [{ type: 'message', content: [{ type: 'output_text', text: 'partial' }] }] }));
  assert.equal(incomplete.outcome, 'incomplete');
  assert.equal(incomplete.incompleteReason, 'max_output_tokens');
});

test('adapter errors are classified and never leak the key', async () => {
  await assert.rejects(req(reply(401, { error: { message: 'Incorrect API key provided: sk-test-abcdefgh12345' } })), (e) => e.kind === 'auth' && !e.message.includes('sk-test-abcdefgh12345'));
  await assert.rejects(req(reply(429, { error: { code: 'insufficient_quota', message: 'quota' } })), (e) => e.kind === 'quota');
  await assert.rejects(req(reply(429, { error: { code: 'rate_limit_exceeded', message: 'slow down' } }, { 'retry-after': '3' })), (e) => e.kind === 'rate_limit' && e.retryAfterMs === 3000);
  await assert.rejects(req(reply(503, 'upstream down')), (e) => e.kind === 'transient');
  await assert.rejects(req(reply(200, 'not json')), (e) => e.kind === 'malformed_response');
  await assert.rejects(req(reply(200, { id: 'r', status: 'completed', output: [] })), (e) => e.kind === 'malformed_response');
  await assert.rejects(req(reply(200, { id: 'r', status: 'failed', error: { message: 'server' } })), (e) => e.kind === 'provider_failed');
  await assert.rejects(req(async () => { throw new TypeError('fetch failed'); }), (e) => e.kind === 'network');
  await assert.rejects(req((url, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')))), { timeoutMs: 20 }), (e) => e.kind === 'timeout');
});

test('request budget caps total attempts and retries', () => {
  const budget = new RequestBudget(4);
  assert.equal(budget.retryBudget, 4);
  let n = 0;
  while (budget.take({ retry: n >= 4 })) n += 1;
  assert.equal(n, budget.maxRequests);
  assert.ok(backoffMs(1, null, () => 0) >= 2000);
  assert.equal(backoffMs(1, 120000), 60000);
});
