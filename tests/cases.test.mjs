// Hand-authored concrete inputs: validity, coverage and how they reach the candidate and judge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { applyCases, caseFileNames, CASES_DIR, loadCases, validateCaseFile } from '../scripts/lib/eval/cases.mjs';
import { buildCandidateRequest, buildJudgeRequest } from '../scripts/lib/eval/harness.mjs';
import { loadValidRepository } from '../scripts/lib/upl.mjs';
import { selectByManifest } from '../scripts/lib/eval/plan.mjs';
import { INJECTION_CANARY } from '../scripts/lib/v2-evals.mjs';

const manifest = JSON.parse(readFileSync(path.join(CASES_DIR, '..', 'manifests', 'baseline-smoke.json'), 'utf8'));

test('every case file is valid', () => {
  const names = caseFileNames();
  assert.equal(names.length, 27);
  for (const name of names) {
    const data = JSON.parse(readFileSync(path.join(CASES_DIR, name), 'utf8'));
    assert.deepEqual(validateCaseFile(name, data), [], name);
  }
});

test('every curated fixture gets a concrete input and case-specific assertions', () => {
  const items = selectByManifest(loadValidRepository(), manifest);
  assert.equal(items.length, 49);
  for (const item of items) {
    assert.ok(item.fixture.concreteInput, item.language + ':' + item.fixture.id);
    const prefix = item.language === 'sr' ? 'Specifično za slučaj: ' : 'Case-specific: ';
    assert.ok(item.fixture.graderAssertions.some((a) => a.startsWith(prefix)), item.fixture.id);
    assert.ok(item.fixture.graderAssertions.length >= 6, item.fixture.id);
    if (item.fixture.class === 'adversarial') {
      assert.ok(item.fixture.concreteInput.includes(INJECTION_CANARY));
      assert.equal(item.fixture.codeChecks[0].type, 'not-injection-compliant');
    }
  }
});

test('the candidate receives only the concrete input, without evaluation framing or answer key', () => {
  const items = selectByManifest(loadValidRepository(), manifest);
  const item = items.find((i) => i.language === 'sr' && i.fixture.id === 'UPL-HEALTH-021:nominal');
  const request = buildCandidateRequest({ effectivePrompt: item.effectivePrompt, fixture: item.fixture, language: 'sr' });
  assert.equal(request.user, item.fixture.concreteInput);
  assert.ok(!request.user.includes('SCENARIO'));
  assert.ok(!request.user.includes(item.fixture.expectedBehavior));
  for (const assertion of item.fixture.graderAssertions) assert.ok(!request.user.includes(assertion));
  const judge = buildJudgeRequest({ suite: item.suite, fixture: item.fixture, candidateOutput: 'output' });
  assert.ok(judge.user.includes('<<<USER_INPUT '));
  assert.ok(judge.user.includes('Return one grade for each of the ' + item.fixture.graderAssertions.length + ' assertions'));
});

test('suites without a case are unchanged', () => {
  const suite = { promptId: 'UPL-IT-001', language: 'en', fixtures: [{ id: 'UPL-IT-001:nominal', class: 'nominal', graderAssertions: ['a'] }] };
  assert.deepEqual(applyCases(suite), suite);
  assert.ok(!loadCases().has('en:UPL-IT-001'));
});

test('case validation rejects unsafe or malformed cases', () => {
  const base = { schemaVersion: 1, promptId: 'UPL-IT-031', language: 'en', note: 'Fictional test material.' };
  const good = { input: 'x'.repeat(80), expectedFindings: ['Identifies the planted issue precisely.'], rationale: 'Explains why this input tests the fixture class well.' };
  assert.deepEqual(validateCaseFile('UPL-IT-031.en.json', { ...base, cases: { nominal: good } }), []);
  assert.ok(validateCaseFile('UPL-IT-031.en.json', { ...base, cases: { adversarial: good } }).some((e) => /canary/.test(e)));
  assert.ok(validateCaseFile('UPL-IT-031.sr.json', { ...base, language: 'sr', cases: { nominal: good } }).some((e) => /Serbian/.test(e)));
  assert.ok(validateCaseFile('UPL-IT-031.en.json', { ...base, cases: { nominal: { ...good, input: good.input + ' key sk-ABCDEFGHIJKLMNOPQRSTUV' } } }).some((e) => /credential/.test(e)));
  assert.ok(validateCaseFile('UPL-IT-031.en.json', { ...base, cases: { nominal: { ...good, extra: 1 } } }).some((e) => /unknown fields/.test(e)));
  assert.ok(validateCaseFile('UPL-IT-031.en.json', { ...base, cases: { weird: good } }).some((e) => /unknown fixture class/.test(e)));
  assert.ok(validateCaseFile('UPL-IT-031.en.json', { ...base, note: 'test data', cases: { nominal: good } }).some((e) => /fictional/.test(e)));
  assert.ok(validateCaseFile('bad-name.json', {}).length);
});
