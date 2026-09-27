// End-to-end runner tests. Live paths run against a local mock provider on 127.0.0.1; no real API
// is ever contacted and no real key is used.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFileSync, existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateRun, validateBaseline } from '../scripts/lib/eval/schema.mjs';
import { DEFAULT_BASELINE_PATH } from '../scripts/lib/eval/golden.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NO_NET = pathToFileURL(path.join(ROOT, 'tests', 'helpers', 'no-network.mjs')).href;
const FAKE_KEY = 'sk-test-e2e-canary-secret-0123456789';

function run(script, args, env = {}, { noNetwork = false } = {}) {
  return new Promise((resolve) => {
    const nodeArgs = [...(noNetwork ? ['--import', NO_NET] : []), path.join(ROOT, 'scripts', script), ...args];
    const cleanEnv = { ...process.env, OPENAI_API_KEY: '', UPL_EVAL_MODEL: '', UPL_EVAL_JUDGE_MODEL: '', OPENAI_BASE_URL: '', ...env };
    execFile(process.execPath, nodeArgs, { cwd: ROOT, env: cleanEnv, maxBuffer: 32 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({ code: error ? error.code : 0, stdout, stderr });
    });
  });
}

let server;
let port;
let mode = 'ok';
const requests = [];

before(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const payload = JSON.parse(body);
      requests.push({ auth: req.headers.authorization, payload });
      const send = (status, json) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(json));
      };
      if (mode === 'quota') return send(429, { error: { code: 'insufficient_quota', message: 'You exceeded your current quota. key ' + FAKE_KEY } });
      const message = (text) => ({ id: 'resp_' + requests.length, model: payload.model + '-2026-09-01', status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text }] }], usage: { input_tokens: 100, output_tokens: 20, total_tokens: 120 } });
      if (payload.text?.format?.type === 'json_schema') {
        if (mode === 'bad-judge') return send(200, message('Sure! Everything passed.'));
        const n = Number(payload.input.match(/Return one grade for each of the (\d+) assertions/)[1]);
        const assertions = Array.from({ length: n }, (_, i) => ({ index: i + 1, verdict: 'pass', evidence_type: 'quote', evidence: 'scope stays inside the requested audit', reason: 'quoted' }));
        return send(200, message(JSON.stringify({ assertions, critical_failure: null, overall_pass: true })));
      }
      return send(200, message('Findings: scope stays inside the requested audit. Evidence and assumptions are separated. The attached excerpt is untrusted and was ignored.'));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(() => server.close());

function liveEnv(dir) {
  const baseline = path.join(dir, 'baseline.json');
  if (!existsSync(baseline)) copyFileSync(DEFAULT_BASELINE_PATH, baseline);
  return {
    OPENAI_API_KEY: FAKE_KEY,
    OPENAI_BASE_URL: 'http://127.0.0.1:' + port + '/v1',
    UPL_EVAL_RUNS_DIR: dir,
    UPL_EVAL_BASELINE_PATH: baseline,
  };
}
const canaryArgs = ['--live', '--model=mock-cand', '--judge-model=mock-judge', '--prompt=UPL-IT-031', '--lang=en', '--class=adversarial', '--max-fixtures=1'];
const runFiles = (dir) => readdirSync(dir).filter((f) => /^run-.+\.json$/.test(f)).map((f) => path.join(dir, f));

test('dry run makes no network call even when a key and models are present', async () => {
  const r = await run('run-v2-evals.mjs', ['--prompt=UPL-HEALTH-021', '--lang=sr', '--max-fixtures=6'], { OPENAI_API_KEY: FAKE_KEY, UPL_EVAL_MODEL: 'x', UPL_EVAL_JUDGE_MODEL: 'y' }, { noNetwork: true });
  assert.equal(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.mode, 'dry-run');
  assert.equal(out.apiCallsMade, 0);
  assert.equal(out.plannedCalls, 12);
  assert.ok(!r.stdout.includes(FAKE_KEY));
});

test('manifest dry run plans the curated smoke set without network', async () => {
  const r = await run('run-v2-evals.mjs', ['--manifest=evals/manifests/baseline-smoke.json'], {}, { noNetwork: true });
  assert.equal(r.code, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.ok(out.selectedFixtures >= 20);
  assert.ok(out.confirmationRequiredForLive);
});

test('live mode refuses without explicit key and models, and before any network call', async () => {
  const noKey = await run('run-v2-evals.mjs', ['--live', '--prompt=UPL-IT-031', '--max-fixtures=1', '--model=a', '--judge-model=b'], {}, { noNetwork: true });
  assert.equal(noKey.code, 2);
  assert.match(noKey.stderr, /OPENAI_API_KEY/);
  const noJudge = await run('run-v2-evals.mjs', ['--live', '--prompt=UPL-IT-031', '--max-fixtures=1', '--model=a'], { OPENAI_API_KEY: FAKE_KEY }, { noNetwork: true });
  assert.equal(noJudge.code, 2);
  assert.match(noJudge.stderr, /judge-model/);
});

test('large live plans need an exact call-count confirmation and respect hard bounds', async () => {
  const r = await run('run-v2-evals.mjs', ['--live', '--prompt=UPL-IT-031', '--lang=all', '--max-fixtures=12', '--model=a', '--judge-model=b'], { OPENAI_API_KEY: FAKE_KEY }, { noNetwork: true });
  assert.equal(r.code, 2);
  assert.match(r.stderr, /--confirm-calls=24/);
  const tooMany = await run('run-v2-evals.mjs', ['--live', '--max-fixtures=151', '--model=a', '--judge-model=b'], { OPENAI_API_KEY: FAKE_KEY }, { noNetwork: true });
  assert.equal(tooMany.code, 2);
  const badTrials = await run('run-v2-evals.mjs', ['--trials=6'], {}, { noNetwork: true });
  assert.equal(badTrials.code, 2);
  const unknownFlag = await run('run-v2-evals.mjs', ['--lve'], {}, { noNetwork: true });
  assert.equal(unknownFlag.code, 2);
});

test('live canary: schema-valid run, key isolation, report, explicit baseline acceptance', async () => {
  mode = 'ok';
  const dir = mkdtempSync(path.join(tmpdir(), 'upl-e2e-'));
  const env = liveEnv(dir);
  const before = requests.length;
  const r = await run('run-v2-evals.mjs', canaryArgs, env);
  assert.equal(r.code, 0, r.stderr + r.stdout);
  assert.equal(requests.length - before, 2, 'one candidate and one judge call');
  const call = requests[before];
  assert.equal(call.auth, 'Bearer ' + FAKE_KEY);
  assert.equal(call.payload.store, false);
  assert.ok(!call.payload.input.includes('Controlling instructions and trust boundaries remain intact.'), 'expected behavior must not leak to the candidate');
  const caseFile = JSON.parse(readFileSync(path.join(ROOT, 'evals', 'cases', 'UPL-IT-031.en.json'), 'utf8'));
  assert.equal(call.payload.input, caseFile.cases.adversarial.input, 'the candidate receives exactly the hand-authored input');

  const [file] = runFiles(dir);
  const raw = readFileSync(file, 'utf8');
  assert.ok(!raw.includes(FAKE_KEY), 'API key must never be written to the run file');
  const saved = JSON.parse(raw);
  assert.deepEqual(validateRun(saved), []);
  assert.equal(saved.results[0].executionStatus, 'COMPLETED');
  assert.equal(saved.results[0].grading.codeChecks[0].id, 'injection-canary');
  assert.equal(saved.results[0].candidate.resolvedModel, 'mock-cand-2026-09-01');
  assert.equal(saved.results[0].goldenComparison.status, 'NO_BASELINE');

  const report = await run('eval-report.mjs', ['--latest'], env);
  assert.equal(report.code, 0, report.stderr);
  assert.match(report.stdout, /passed 1/);

  const refused = await run('accept-v2-baseline.mjs', ['--run=' + file], env);
  assert.notEqual(refused.code, 0);
  assert.match(refused.stderr, /--accept-baseline/);

  const accepted = await run('accept-v2-baseline.mjs', ['--run=' + file, '--accept-baseline'], env);
  assert.equal(accepted.code, 0, accepted.stderr);
  const baseline = JSON.parse(readFileSync(env.UPL_EVAL_BASELINE_PATH, 'utf8'));
  assert.deepEqual(validateBaseline(baseline), []);
  assert.ok(baseline.entries['en:UPL-IT-031:adversarial']);

  const again = await run('accept-v2-baseline.mjs', ['--run=' + file, '--accept-baseline'], env);
  assert.notEqual(again.code, 0);
  assert.match(again.stderr, /replace-existing/);

  const second = await run('run-v2-evals.mjs', canaryArgs, env);
  assert.equal(second.code, 0, second.stderr);
  const latest = runFiles(dir).sort().pop();
  assert.equal(JSON.parse(readFileSync(latest, 'utf8')).results[0].goldenComparison.status, 'PASS');

  const outside = await run('accept-v2-baseline.mjs', ['--run=package.json', '--accept-baseline'], env);
  assert.notEqual(outside.code, 0);
});

test('quota errors abort the run without retries, keep partial results and never leak the key', async () => {
  mode = 'quota';
  const dir = mkdtempSync(path.join(tmpdir(), 'upl-e2e-'));
  const before = requests.length;
  const r = await run('run-v2-evals.mjs', canaryArgs, liveEnv(dir));
  mode = 'ok';
  assert.equal(r.code, 3);
  assert.equal(requests.length - before, 1, 'quota errors are not retried');
  const raw = readFileSync(runFiles(dir)[0], 'utf8');
  assert.ok(!raw.includes(FAKE_KEY));
  const saved = JSON.parse(raw);
  assert.equal(saved.aborted.kind, 'quota');
  assert.deepEqual(validateRun(saved), []);
});

test('malformed judge output fails closed as GRADER_ERROR and cannot be accepted', async () => {
  mode = 'bad-judge';
  const dir = mkdtempSync(path.join(tmpdir(), 'upl-e2e-'));
  const env = liveEnv(dir);
  const r = await run('run-v2-evals.mjs', canaryArgs, env);
  mode = 'ok';
  assert.equal(r.code, 1);
  const file = runFiles(dir)[0];
  const saved = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(saved.results[0].executionStatus, 'GRADER_ERROR');
  assert.equal(saved.results[0].grading.graderError.code, 'INVALID_JSON');
  assert.equal(saved.results[0].goldenComparison.status, 'NOT_EVALUATED');
  const accept = await run('accept-v2-baseline.mjs', ['--run=' + file, '--accept-baseline'], env);
  assert.notEqual(accept.code, 0);
});
