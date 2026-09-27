#!/usr/bin/env node
// Source freshness checker for the authoritative-source registry.
//
//   npm run sources:check -- --offline          structural registry + snapshot checks, no network
//   npm run sources:check                       online metadata check of every unique source URL
//   npm run sources:check -- --update-snapshot  online check, then record observed metadata
//                                               (only after reviewing flagged sources)
//
// Exit codes: 0 no blocking problem (review items may still be listed), 1 structural error or a
// BROKEN source, 2 usage error, 4 NOT_RUN_NO_NETWORK (the network was unavailable; nothing was
// judged broken). The registry is never modified.

import { lookup } from 'node:dns/promises';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import {
  CHECKER_VERSION, classify, collectSources, mapWithHostLimit, networkVerdict, NO_NETWORK_CODES, observe, readJson, REGISTRY_FILES,
  SNAPSHOT_FILE, SNAPSHOT_SCHEMA_VERSION, snapshotEntry, validateSnapshot, validateSourceList,
} from './lib/source-freshness.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function usage(message) {
  console.error('sources:check: ' + message);
  process.exit(2);
}

let args;
try {
  args = parseArgs({
    strict: true,
    options: {
      offline: { type: 'boolean', default: false },
      'update-snapshot': { type: 'boolean', default: false },
      concurrency: { type: 'string', default: '4' },
      'timeout-ms': { type: 'string', default: '20000' },
      url: { type: 'string' },
      json: { type: 'boolean', default: false },
    },
  }).values;
} catch (error) {
  usage(error.message);
}
const concurrency = Number(args.concurrency);
const timeoutMs = Number(args['timeout-ms']);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) usage('--concurrency must be 1..8');
if (!Number.isInteger(timeoutMs) || timeoutMs < 2000 || timeoutMs > 120000) usage('--timeout-ms must be 2000..120000');
if (args.offline && args['update-snapshot']) usage('--update-snapshot needs an online check');

// ---------------------------------------------------------------------------
// Structural (offline) checks

const structural = [];
const warnings = [];
for (const file of REGISTRY_FILES) {
  let data;
  try {
    data = readJson(file);
  } catch (error) {
    structural.push(file + ': ' + error.message);
    continue;
  }
  for (const [profile, items] of Object.entries(data)) structural.push(...validateSourceList(file + '#' + profile, items));
}
const sources = collectSources();
const snapshot = existsSync(path.join(ROOT, SNAPSHOT_FILE))
  ? readJson(SNAPSHOT_FILE)
  : { schemaVersion: SNAPSHOT_SCHEMA_VERSION, checkerVersion: CHECKER_VERSION, updatedAt: null, entries: {} };
const snap = validateSnapshot(snapshot, sources);
structural.push(...snap.errors);
warnings.push(...snap.warnings);

const offlineSummary = {
  registryFiles: REGISTRY_FILES.length,
  uniqueSources: sources.length,
  declaredDraftSources: sources.filter((s) => s.declaredDraft).length,
  hosts: new Set(sources.map((s) => new URL(s.url).host)).size,
  snapshotEntries: Object.keys(snapshot.entries ?? {}).length,
  structuralErrors: structural.length,
  warnings,
};

if (args.offline) {
  for (const error of structural) console.error('ERROR  ' + error);
  console.log(JSON.stringify({ mode: 'offline', network: 'NOT_USED', ...offlineSummary }, null, 2));
  process.exit(structural.length ? 1 : 0);
}
if (structural.length) {
  for (const error of structural) console.error('ERROR  ' + error);
  usage('fix structural registry errors before an online check');
}

// ---------------------------------------------------------------------------
// Online check

const targets = args.url ? sources.filter((s) => s.url === args.url) : sources;
if (!targets.length) usage('no registry source matches --url');

async function networkAvailable() {
  for (const host of ['www.iana.org', 'www.w3.org']) {
    try {
      await lookup(host);
      return true;
    } catch (error) {
      if (!NO_NETWORK_CODES.has(error.code)) return true;
    }
  }
  return false;
}

const checkedAt = new Date().toISOString();
const report = { mode: 'online', checkerVersion: CHECKER_VERSION, checkedAt, ...offlineSummary, results: [] };

if (!(await networkAvailable())) {
  report.network = 'NOT_RUN_NO_NETWORK';
  report.results = targets.map((s) => ({ url: s.url, status: 'NOT_RUN_NO_NETWORK', needsReview: false, reasons: ['DNS resolution failed for probe hosts; no source was checked'] }));
} else {
  report.network = 'AVAILABLE';
  const observations = await mapWithHostLimit(targets, (s) => new URL(s.url).host, concurrency, (s) => observe(s.url, { timeoutMs }));
  report.results = targets.map((source, i) => {
    const observation = observations[i];
    const verdict = classify(source, observation, snapshot.entries[source.url] ?? null);
    return {
      url: source.url,
      labels: source.labels,
      usedBy: source.usedBy.length,
      declaredDraft: source.declaredDraft,
      status: verdict.status,
      needsReview: verdict.needsReview,
      reasons: verdict.reasons,
      httpStatus: observation.httpStatus ?? null,
      finalUrl: observation.finalUrl ?? null,
      redirectChain: observation.redirectChain,
      title: observation.signals?.title ?? null,
      statusSignals: observation.signals?.statusSignals ?? [],
      versionSignals: observation.signals?.versionSignals ?? [],
      error: observation.error ?? null,
      observation,
    };
  });
  // Two registry URLs that resolve to the same document are redundant citations.
  const byFinal = new Map();
  for (const r of report.results) {
    if (!r.finalUrl || r.error) continue;
    const key = r.finalUrl.replace(/\/+$/, '').replace('://www.', '://');
    byFinal.set(key, [...(byFinal.get(key) ?? []), r]);
  }
  for (const group of byFinal.values()) {
    if (group.length < 2) continue;
    for (const r of group) {
      r.needsReview = true;
      r.reasons.push('resolves to the same document as ' + group.filter((x) => x !== r).map((x) => x.url).join(', '));
    }
  }

  // If every request failed at the network layer, the network is effectively unavailable.
  if (networkVerdict(observations) === 'NOT_RUN_NO_NETWORK') {
    report.network = 'NOT_RUN_NO_NETWORK';
    for (const r of report.results) {
      r.status = 'NOT_RUN_NO_NETWORK';
      r.needsReview = false;
    }
  }
}

const counts = Object.fromEntries([...new Set(report.results.map((r) => r.status))].sort().map((s) => [s, report.results.filter((r) => r.status === s).length]));
report.counts = counts;
report.needsReview = report.results.filter((r) => r.needsReview).map((r) => ({ url: r.url, status: r.status, reasons: r.reasons }));

if (args['update-snapshot'] && report.network === 'AVAILABLE') {
  const entries = { ...snapshot.entries };
  let updated = 0;
  for (const r of report.results) {
    if (!r.observation?.signals || r.observation.httpStatus < 200 || r.observation.httpStatus >= 300) continue;
    entries[r.url] = snapshotEntry(r.observation, checkedAt);
    updated += 1;
  }
  const known = new Set(sources.map((s) => s.url));
  const next = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    checkerVersion: CHECKER_VERSION,
    description: 'Metadata-only freshness snapshot for the authoritative-source registry. Updated only by npm run sources:check -- --update-snapshot after review. Contains no page bodies.',
    updatedAt: checkedAt,
    entries: Object.fromEntries(Object.entries(entries).filter(([url]) => known.has(url)).sort(([a], [b]) => a.localeCompare(b))),
  };
  writeFileSync(path.join(ROOT, SNAPSHOT_FILE), JSON.stringify(next, null, 2) + '\n', 'utf8');
  report.snapshotUpdated = updated;
}

for (const r of report.results) delete r.observation;
const outDir = path.join(ROOT, '.source-checks');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'source-check-' + checkedAt.replace(/[:.]/g, '-') + '.json');
writeFileSync(outFile, JSON.stringify(report, null, 2) + '\n', 'utf8');

if (args.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log('sources:check: ' + report.results.length + ' source(s), network ' + report.network);
  console.log('status counts: ' + JSON.stringify(counts));
  for (const r of report.needsReview) console.log('REVIEW  ' + r.status.padEnd(20) + ' ' + r.url + '\n        ' + r.reasons.join('; '));
  for (const r of report.results.filter((x) => ['UNKNOWN', 'TIMEOUT'].includes(x.status))) console.log('RECHECK ' + r.status.padEnd(20) + ' ' + r.url + '\n        ' + r.reasons.join('; '));
  if (report.snapshotUpdated !== undefined) console.log('snapshot: recorded ' + report.snapshotUpdated + ' observation(s) in ' + SNAPSHOT_FILE);
  console.log('report: ' + path.relative(ROOT, outFile).split(path.sep).join('/'));
}

if (report.network === 'NOT_RUN_NO_NETWORK') process.exitCode = 4;
else if (counts.BROKEN) process.exitCode = 1;
