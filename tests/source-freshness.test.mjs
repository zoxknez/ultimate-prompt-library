// Source freshness: deterministic classification, signal extraction and network-failure handling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classify,
  collectSources,
  extractSignals,
  isHomepage,
  networkVerdict,
  observe,
  siteOf,
  validateSnapshot,
  validateSourceList,
} from '../scripts/lib/source-freshness.mjs';

const source = (url, declaredDraft = false) => ({ url, declaredDraft });
const signals = (html) => extractSignals(html);
const ok = (url, html, extra = {}) => ({ httpStatus: 200, finalUrl: url, redirectChain: [], etag: null, lastModified: null, signals: signals(html), ...extra });

test('HTTP 200 alone is REACHABLE only when nothing else is known', () => {
  const url = 'https://example.org/doc';
  const verdict = classify(source(url), ok(url, '<title>Doc</title>'));
  assert.equal(verdict.status, 'REACHABLE');
  assert.match(verdict.reasons.join(' '), /no snapshot/);
});

test('404/410 and soft-404 homepage redirects are BROKEN; blocked and 5xx are UNKNOWN', () => {
  const url = 'https://example.org/doc';
  assert.equal(classify(source(url), { httpStatus: 404, finalUrl: url, signals: signals('') }).status, 'BROKEN');
  assert.equal(classify(source(url), { httpStatus: 410, finalUrl: url, signals: signals('') }).status, 'BROKEN');
  assert.equal(classify(source(url), ok('https://example.org/', '<title>Home</title>')).status, 'BROKEN');
  assert.equal(classify(source(url), { httpStatus: 403, finalUrl: url, signals: signals('') }).status, 'UNKNOWN');
  assert.equal(classify(source(url), { httpStatus: 503, finalUrl: url, signals: signals('') }).status, 'UNKNOWN');
});

test('network, TLS and timeout failures are never reported as BROKEN', () => {
  const url = 'https://example.org/doc';
  assert.equal(classify(source(url), { error: { kind: 'timeout' } }).status, 'TIMEOUT');
  assert.equal(classify(source(url), { error: { kind: 'network', code: 'ENOTFOUND' } }).status, 'UNKNOWN');
  assert.equal(classify(source(url), { error: { kind: 'tls', code: 'CERT_HAS_EXPIRED' } }).status, 'UNKNOWN');
  assert.equal(networkVerdict([{ error: { kind: 'network' } }, { error: { kind: 'timeout' } }]), 'NOT_RUN_NO_NETWORK');
  assert.equal(networkVerdict([{ error: { kind: 'network' } }, { httpStatus: 404 }]), 'AVAILABLE');
});

test('cross-site redirects need review; locale query redirects are trivial', () => {
  const url = 'https://www.go-fair.org/fair-principles/';
  const moved = classify(source(url), ok('https://www.gofair.foundation/fair-principles', '<title>FAIR</title>'));
  assert.equal(moved.status, 'REDIRECTED');
  assert.equal(moved.needsReview, true);
  const locale = classify(source('https://developers.google.com/analytics'), ok('https://developers.google.com/analytics?hl=ko', '<title>GA</title>'));
  assert.equal(locale.status, 'REACHABLE');
  const subdomainRoot = classify(source('https://owasp.org/API-Security/'), ok('https://api-security.owasp.org/', '<title>API</title>'));
  assert.equal(subdomainRoot.status, 'REDIRECTED');
  assert.equal(subdomainRoot.needsReview, true);
});

test('draft and superseded signals come from identifying elements, not history tables', () => {
  const draftPage = '<title>SP 800-218 Rev. 1 | CSRC</title><h3>NIST SP 800-218 Rev. 1 <small>(Initial Public Draft)</small></h3>';
  assert.deepEqual(signals(draftPage).statusSignals, ['draft:initial public draft']);
  const finalWithHistory = '<title>SP 800-218 | CSRC</title><h1>SSDF 1.1</h1>' + '<p>x</p>'.repeat(10) + '<table><tr><td>Initial Public Draft</td></tr></table>';
  assert.deepEqual(signals(finalWithHistory).statusSignals, []);
  const listing = '<title>Medicines</title><h1>Medicines</h1><p>3 applications withdrawn this month</p>';
  assert.deepEqual(signals(listing).statusSignals, []);
  const superseded = '<title>Old Guide</title><h1>Old Guide</h1><p>This publication has been superseded by SP 800-999.</p>';
  assert.equal(classify(source('https://example.org/old'), ok('https://example.org/old', superseded)).status, 'POSSIBLY_SUPERSEDED');
});

test('undeclared drafts need review; declared drafts are acknowledged; finalized drafts are flagged', () => {
  const draft = '<title>X</title><h1>Guidance (Consultation Draft)</h1>';
  assert.equal(classify(source('https://example.org/g'), ok('https://example.org/g', draft)).needsReview, true);
  const ack = classify(source('https://example.org/ipd', true), ok('https://example.org/ipd', draft));
  assert.equal(ack.status, 'DRAFT_STATUS');
  assert.equal(ack.needsReview, false);
  assert.equal(classify(source('https://example.org/ipd', true), ok('https://example.org/ipd', '<title>X</title><h1>Final</h1>')).status, 'POSSIBLY_UPDATED');
});

test('snapshot comparison: title change is CHANGED, header-only validator churn is not flagged', () => {
  const url = 'https://example.org/doc';
  const first = ok(url, '<title>Guide 2024</title>', { etag: 'a', lastModified: 'Mon' });
  const previous = { title: first.signals.title, finalUrl: url, etag: 'a', lastModified: 'Mon', modifiedDate: null, versionSignals: first.signals.versionSignals, headFingerprint: first.signals.headFingerprint };
  assert.equal(classify(source(url), ok(url, '<title>Guide 2026</title>'), previous).status, 'CHANGED');
  const churn = classify(source(url), ok(url, '<title>Guide 2024</title>', { etag: 'b', lastModified: 'Tue' }), previous);
  assert.equal(churn.status, 'REACHABLE');
  assert.equal(churn.needsReview, false);
});

test('observe follows HTTPS redirects manually and rejects downgrade redirects and loops', async () => {
  const hops = { 'https://a.test/x': ['https://a.test/y', 301], 'https://a.test/y': ['http://a.test/z', 302] };
  const fetchImpl = async (url) => {
    const hop = hops[url];
    if (hop) return new Response(null, { status: hop[1], headers: { location: hop[0] } });
    return new Response('<title>ok</title>', { status: 200, headers: { 'content-type': 'text/html' } });
  };
  const downgrade = await observe('https://a.test/x', { fetchImpl });
  assert.equal(downgrade.error.kind, 'invalid-redirect');
  const loop = await observe('https://a.test/loop', { fetchImpl: async () => new Response(null, { status: 302, headers: { location: 'https://a.test/loop' } }), maxRedirects: 3 });
  assert.equal(loop.error.kind, 'redirect-loop');
  const dns = await observe('https://a.test/x', { fetchImpl: async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } }); } });
  assert.deepEqual(dns.error, { kind: 'network', code: 'ENOTFOUND' });
});

test('registry structure: https only, draft labels need status notes, snapshot has metadata only', () => {
  assert.ok(validateSourceList('p', [{ label: 'x', url: 'http://example.org' }]).some((e) => /HTTPS/.test(e)));
  assert.ok(validateSourceList('p', [{ label: 'Rule (Initial Public Draft)', url: 'https://example.org/ipd' }]).some((e) => /status note/.test(e)));
  assert.ok(validateSourceList('p', [{ label: 'x', url: 'https://example.org', extra: 1 }]).some((e) => /unknown source fields/.test(e)));
  const sources = collectSources();
  assert.ok(sources.length >= 100);
  assert.equal(sources.filter((s) => s.declaredDraft).length >= 1, true);
  const big = { schemaVersion: 1, entries: { [sources[0].url]: { checkedAt: new Date().toISOString(), finalUrl: 'x', httpStatus: 200, title: 'x'.repeat(5000), etag: null, lastModified: null, modifiedDate: null, headFingerprint: null, versionSignals: [], statusSignals: [] } } };
  assert.ok(validateSnapshot(big, sources).errors.some((e) => /too large/.test(e)));
});

test('helpers', () => {
  assert.equal(siteOf('www.edpb.europa.eu'), 'edpb.europa.eu');
  assert.equal(siteOf('api-security.owasp.org'), 'owasp.org');
  assert.ok(isHomepage('https://example.org/'));
  assert.ok(isHomepage('https://example.org/en/'));
  assert.ok(!isHomepage('https://example.org/en/guide'));
});

test('site-name-only and missing titles are not document changes', async () => {
  const { isSiteNameVariant } = await import('../scripts/lib/source-freshness.mjs');
  assert.ok(isSiteNameVariant('OWASP ASVS | OWASP Foundation', 'OWASP Foundation'));
  assert.ok(!isSiteNameVariant('Guide 2024 | X', 'Guide 2026 | X'));
  const url = 'https://example.org/doc';
  const real = ok(url, '<title>Guide | Example</title><h1>Guide</h1>');
  const bare = ok(url, '<title>Example</title><h1>Loading</h1>');
  const previous = { title: real.signals.title, finalUrl: url, modifiedDate: null, versionSignals: [], headFingerprint: real.signals.headFingerprint };
  assert.equal(classify(source(url), bare, previous).status, 'REACHABLE');
  assert.equal(classify(source(url), real, { ...previous, title: null }).status, 'REACHABLE');
});

test('manual verification: schema, registry membership and 180-day expiry', async () => {
  const { validateManualVerification, manualVerificationState } = await import('../scripts/lib/source-freshness.mjs');
  const sources = [{ url: 'https://example.org/a' }];
  const good = { verifiedAt: '2026-09-27', method: 'browser', finding: 'VERIFIED', httpStatus: 200, finalUrl: 'https://example.org/a', title: 'A', notes: '' };
  const now = new Date('2026-10-01T00:00:00Z');
  assert.deepEqual(validateManualVerification({ schemaVersion: 1, entries: { 'https://example.org/a': good } }, sources, now).errors, []);
  assert.ok(validateManualVerification({ schemaVersion: 1, entries: { 'https://other.example/': good } }, sources, now).errors.some((e) => /not in the registry/.test(e)));
  assert.ok(validateManualVerification({ schemaVersion: 1, entries: { 'https://example.org/a': { ...good, httpStatus: 403 } } }, sources, now).errors.length);
  assert.equal(manualVerificationState(good, now), 'verified');
  assert.equal(manualVerificationState(good, new Date('2027-06-01T00:00:00Z')), 'expired');
  assert.equal(manualVerificationState({ ...good, finding: 'UNREACHABLE' }, now), 'unreachable');
});
