// Global matcher audit: substring, cross-language, plural, hyphen and punctuation collisions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTerms, matchesAny, tokenize, compileTerm } from '../scripts/lib/matchers.mjs';
import {
  matchedSemanticGroups,
  matchedTaskShapes,
  primaryTaskShape,
  routingSegments,
  SEMANTIC_GROUPS,
  TASK_SHAPES,
} from '../scripts/lib/v2-routing.mjs';
import { loadValidRepository } from '../scripts/lib/upl.mjs';
import { semanticDetailRules, taskShapeRules } from '../scripts/lib/v2-quality.mjs';

const ids = (items) => items.map((item) => item.id).sort();
const semantic = (title, extra = {}) => ids(matchedSemanticGroups({ title, slug: '', language: 'en', ...extra }));
const shapes = (title) => ids(matchedTaskShapes({ title, slug: '', language: 'en' }));

test('tokenize splits on hyphens, punctuation and symbols and folds diacritics', () => {
  assert.deepEqual(tokenize('Red-Team: API/Backend & N+1 (iOS)'), ['red', 'team', 'api', 'backend', 'n', '1', 'ios']);
  assert.deepEqual(tokenize('Usklađivanje čćžšđ'), ['uskladivanje', 'cczsd']);
});

test('term syntax: exact, plural, explicit prefix and multi-word', () => {
  const t = (text, term) => matchesAny(tokenize(text), [term]);
  assert.ok(t('api', 'api'));
  assert.ok(t('apis', 'api'));
  assert.ok(t('strategies', 'strategy'));
  assert.ok(t('prioritization', 'priorit*'));
  assert.ok(t('red-team review', 'red team'));
  assert.ok(t('red team', 'red team'));
  assert.ok(t('stress-testing', 'stress test*'));
  assert.ok(!t('rapid', 'api'));
  assert.ok(!t('team red', 'red team'));
  assert.throws(() => compileTerm('bad!term'));
  assert.throws(() => compileTerm(''));
});

test('substring traps from the audit no longer route', () => {
  const traps = [
    ['Psychotherapy (terapije) Capital Rapid Mapping', 'api-backend'],
    ['Teaching Intervention Evaluation', 'financial-analysis'],
    ['Webhook Reliability Audit', 'contract-law'],
    ['Primary Authority Finder', 'application-security'],
    ['Authorship & Contribution Audit', 'application-security'],
    ['Enforcement Risk & Remediation Plan', 'causal-inference'],
    ['AI Tutor Safety & Pedagogy Audit', 'causal-inference'],
    ['Copyright Ownership & Licensing Audit', 'brand-messaging'],
    ['Promotion Readiness Audit', 'time-based-media'],
    ['Backend Scalability Bottleneck Hunter', 'diagnostic-testing'],
    ['Food Label & Health Claim Audit', 'diagnostic-testing'],
    ['Settlement Scenario Analysis', 'data-engineering'],
    ['Portfolio Scenarios Ratios Studio', 'mobile'],
    ['Philosophy of Science Review', 'process-automation'],
    ['Highlighting Style Guide', 'photography'],
  ];
  for (const [title, group] of traps) {
    assert.ok(!semantic(title, { category_id: 'UPL-HEALTH' }).includes(group) && !semantic(title, { category_id: 'UPL-IT' }).includes(group),
      title + ' must not route to ' + group);
  }
});

test('task-shape substring traps no longer route', () => {
  assert.ok(!shapes('Ultimate DevOps & Infrastructure Audit').includes('builder'));
  assert.ok(!shapes('Systematic Review Critical Appraisal').includes('builder'));
  assert.ok(!shapes('Teacher Explanation Quality Audit').includes('builder'));
  assert.ok(!shapes('Epidemiology Study Interpreter').includes('tracker'));
  assert.ok(!shapes('Logo System Audit').includes('tracker'));
  assert.ok(!shapes('Memory & Resource Leak Hunter').includes('research'));
  assert.ok(!shapes('Clinical Guideline Quality Audit').includes('generator'));
  assert.ok(!shapes('Health Inequality Impact Assessment').includes('audit'));
  assert.ok(!shapes('Workflow Bottleneck Audit').includes('analysis'));
  assert.ok(!shapes('Five-Year Career Roadmap').includes('analysis'));
});

test('true positives still route (false-negative guard)', () => {
  assert.ok(semantic('Ultimate Backend API Audit').includes('api-backend'));
  assert.ok(semantic('REST APIs Review').includes('api-backend'));
  assert.ok(semantic('iOS Release Readiness').includes('mobile'));
  assert.ok(semantic('Polypharmacy Review', { category_id: 'UPL-HEALTH' }).includes('medication-safety'));
  assert.ok(semantic('Medical Test Preparation Quality Check', { category_id: 'UPL-HEALTH' }).includes('diagnostic-testing'));
  assert.ok(semantic('Causal Question & DAG Builder').includes('causal-inference'));
  assert.ok(shapes('Marketing Experiment Backlog').includes('tracker'));
  assert.ok(shapes('Study Design Red-Team Review').includes('red-team'));
  assert.ok(shapes('Resource Conflict Resolution').includes('decision'));
});

test('domain-scoped groups do not leak into unrelated categories', () => {
  assert.ok(!semantic('Incident Triage Workflow', { category_id: 'UPL-IT' }).includes('symptom-triage'));
  assert.ok(semantic('Symptom Triage Safety Net', { category_id: 'UPL-HEALTH' }).includes('symptom-triage'));
  assert.ok(!semantic('Team Performance Diagnostic', { category_id: 'UPL-CAREER' }).includes('service-reliability'));
  assert.ok(semantic('Service Performance Audit', { category_id: 'UPL-IT' }).includes('service-reliability'));
  assert.ok(!semantic('Customer Interview Guide', { category_id: 'UPL-MKT' }).includes('career-materials'));
  assert.ok(!semantic('Sales Pipeline Conversion Audit', { category_id: 'UPL-MKT' }).includes('data-engineering'));
});

test('primary task shape uses the English head noun', () => {
  assert.equal(primaryTaskShape({ title: 'Threat Modeling Generator', slug: '' }), 'generator');
  assert.equal(primaryTaskShape({ title: 'Ultimate Application Security Audit', slug: '' }), 'audit');
  assert.equal(primaryTaskShape({ title: 'Causal Question & DAG Builder', slug: '' }), 'builder');
  assert.equal(primaryTaskShape({ title: 'Study Design Red-Team Review', slug: '' }), 'red-team');
  assert.equal(primaryTaskShape({ title: 'Something Unclassifiable', slug: '' }), 'analysis');
});

test('routing ignores localized titles: Serbian words never trigger English keywords', () => {
  // Known Serbian collisions: terapije (api), prepreka (prep), uloge (log), osvetljenja (etl),
  // drugi (drug), slabosti (lab), sistematskog (ats).
  const srOnly = { language: 'sr', title: 'Analiza prepreka terapije, uloge, osvetljenja, drugi slabosti sistematskog', slug: 'x' };
  assert.deepEqual(routingSegments(srOnly).title, []);
  assert.deepEqual(ids(matchedSemanticGroups(srOnly)), []);
  assert.deepEqual(ids(matchedTaskShapes(srOnly)), []);
});

test('every term compiles and every group has EN/SR rules of equal length', () => {
  for (const item of [...TASK_SHAPES, ...SEMANTIC_GROUPS]) {
    for (const term of item.terms) compileTerm(term);
    assert.equal(item.en.length, item.sr.length, item.id);
  }
});

test('corpus: EN and SR receive identical rule selections for all 1000 prompts', () => {
  const repo = loadValidRepository();
  let checked = 0;
  for (const category of repo.catalog.categories) {
    for (const prompt of category.prompts) {
      const base = { ...prompt, category_id: category.id, subcategory_id: prompt.subcategory };
      const en = { ...base, title: prompt.title.en, language: 'en' };
      const sr = { ...base, title: prompt.title.sr, language: 'sr' };
      assert.equal(primaryTaskShape(en), primaryTaskShape(sr), prompt.id);
      assert.deepEqual(ids(matchedTaskShapes(en)), ids(matchedTaskShapes(sr)), prompt.id);
      assert.deepEqual(ids(matchedSemanticGroups(en)), ids(matchedSemanticGroups(sr)), prompt.id);
      assert.equal(taskShapeRules(en, 'en').length, taskShapeRules(sr, 'sr').length, prompt.id);
      assert.equal(semanticDetailRules(en, 'en').length, semanticDetailRules(sr, 'sr').length, prompt.id);
      checked += 1;
    }
  }
  assert.equal(checked, 1000);
});

test('corpus: every fired term is a whole-token (or declared prefix) match', () => {
  const repo = loadValidRepository();
  for (const category of repo.catalog.categories) {
    for (const prompt of category.prompts) {
      const segments = routingSegments({ id: prompt.id });
      for (const item of [...TASK_SHAPES, ...SEMANTIC_GROUPS]) {
        for (const tokens of [segments.title, segments.slug]) {
          for (const hit of findTerms(tokens, item.terms)) {
            const parts = compileTerm(hit.term);
            parts.forEach((part, j) => {
              const token = tokens[hit.start + j];
              if (!part.endsWith('*')) assert.ok(token === part || token.startsWith(part) && token.length <= part.length + 3, prompt.id + ' ' + hit.term + ' ~ ' + token);
            });
          }
        }
      }
    }
  }
});

test('prompt subject keeps diacritics and symbols verbatim', () => {
  const rules = semanticDetailRules({ id: 'UPL-LAW-005', title: 'Tumačenje zakona i podzakonskih propisa', slug: 'statutory-interpretation' }, 'sr');
  assert.match(rules[0], /"Tumačenje zakona i podzakonskih propisa"/);
  const en = semanticDetailRules({ id: 'UPL-IT-058', title: 'N+1 & Expensive Query Hunter', slug: 'n-plus-one' }, 'en');
  assert.match(en[0], /"N\+1 & Expensive Query Hunter"/);
});
