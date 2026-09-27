// Source freshness: structural checks of the authoritative-source registry and a metadata-only
// online checker. The checker reports candidates for human review; it never edits the registry.
// HTTP 200 alone is never treated as "current": title, status, version and date signals are
// compared with a committed metadata snapshot (no page bodies are stored).

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const REGISTRY_FILES = Object.freeze([
  'scripts/v2-source-profiles.json',
  'scripts/v2-subcategory-source-profiles.json',
]);
export const SNAPSHOT_FILE = 'scripts/v2-source-freshness-snapshot.json';
export const SNAPSHOT_SCHEMA_VERSION = 1;
export const CHECKER_VERSION = 1;

export const STATUSES = Object.freeze([
  'REACHABLE', 'REDIRECTED', 'CHANGED', 'POSSIBLY_UPDATED', 'DRAFT_STATUS', 'POSSIBLY_SUPERSEDED',
  'BROKEN', 'TIMEOUT', 'UNKNOWN', 'NOT_RUN_NO_NETWORK',
]);

const DRAFT_NOTE_RE = /(draft|proposed|consult|interim|not final|future-facing)/i;
const DRAFT_LABEL_RE = /(\bdraft\b|initial-public-draft|\/ipd\b|public-comment|consultation|proposed)/i;

export function readJson(rel) {
  return JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
}

/** Unique sources across all registry files, with where each is used. */
export function collectSources(registries = REGISTRY_FILES.map((file) => ({ file, data: readJson(file) }))) {
  const byUrl = new Map();
  for (const { file, data } of registries) {
    for (const [profile, items] of Object.entries(data)) {
      for (const item of Array.isArray(items) ? items : []) {
        if (!item?.url) continue;
        const entry = byUrl.get(item.url) ?? { url: item.url, labels: new Set(), notes: new Set(), usedBy: [] };
        entry.labels.add(item.label);
        if (item.note) entry.notes.add(item.note);
        entry.usedBy.push(path.basename(file) + '#' + profile);
        byUrl.set(item.url, entry);
      }
    }
  }
  return [...byUrl.values()].map((entry) => ({
    url: entry.url,
    labels: [...entry.labels],
    notes: [...entry.notes],
    usedBy: entry.usedBy,
    // Declared draft status comes from the label/URL only. Notes often mention a *different*
    // document's draft status (for example a final page noting that its revision is in draft).
    declaredDraft: [...entry.labels, entry.url].some((text) => DRAFT_LABEL_RE.test(text)),
  })).sort((a, b) => a.url.localeCompare(b.url));
}

/** Structural rules for one profile's source list (shared with validate-v2). */
export function validateSourceList(where, items) {
  const errors = [];
  if (!Array.isArray(items) || !items.length) return [where + ': source profile must be a non-empty array.'];
  const urls = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      errors.push(where + ': invalid source entry.');
      continue;
    }
    const extra = Object.keys(item).filter((key) => !['label', 'url', 'note'].includes(key));
    if (extra.length) errors.push(where + ': unknown source fields ' + extra.join(', '));
    if (!item.label || typeof item.label !== 'string') errors.push(where + ': source entry missing label.');
    if (!item.url || typeof item.url !== 'string') errors.push(where + ': source entry missing URL.');
    else {
      let parsed = null;
      try {
        parsed = new URL(item.url);
      } catch {
        errors.push(where + ': source URL is not a valid URL: ' + item.url);
      }
      if (parsed && parsed.protocol !== 'https:') errors.push(where + ': source URL must use HTTPS: ' + item.url);
      if (parsed && (parsed.username || parsed.password)) errors.push(where + ': source URL must not embed credentials: ' + item.url);
      if (urls.has(item.url)) errors.push(where + ': duplicate source URL: ' + item.url);
      urls.add(item.url);
    }
    if (item.note != null && typeof item.note !== 'string') errors.push(where + ': source note must be a string.');
    if (DRAFT_LABEL_RE.test(String(item.label ?? '') + ' ' + String(item.url ?? '')) && !DRAFT_NOTE_RE.test(String(item.note ?? ''))) {
      errors.push(where + ': draft/proposed source must carry an explicit status note: ' + (item.label || item.url));
    }
  }
  return errors;
}

export function validateSnapshot(snapshot, sources) {
  const errors = [];
  const warnings = [];
  if (!snapshot || snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) errors.push('snapshot schemaVersion must be ' + SNAPSHOT_SCHEMA_VERSION);
  if (!snapshot?.entries || typeof snapshot.entries !== 'object' || Array.isArray(snapshot.entries)) {
    errors.push('snapshot entries must be an object');
    return { errors, warnings };
  }
  const known = new Set(sources.map((s) => s.url));
  for (const [url, entry] of Object.entries(snapshot.entries)) {
    if (!known.has(url)) warnings.push('snapshot entry for a URL no longer in the registry: ' + url);
    if (typeof entry?.checkedAt !== 'string' || Number.isNaN(Date.parse(entry.checkedAt))) errors.push(url + ': checkedAt missing');
    if (typeof entry?.finalUrl !== 'string') errors.push(url + ': finalUrl missing');
    if (!Number.isInteger(entry?.httpStatus)) errors.push(url + ': httpStatus missing');
    for (const key of ['title', 'etag', 'lastModified', 'modifiedDate', 'headFingerprint']) {
      if (entry?.[key] !== null && typeof entry?.[key] !== 'string') errors.push(url + ': ' + key + ' must be a string or null');
    }
    if (!Array.isArray(entry?.versionSignals) || !Array.isArray(entry?.statusSignals)) errors.push(url + ': signal arrays missing');
    // Guard against storing page bodies: snapshots hold metadata only.
    if (JSON.stringify(entry).length > 4000) errors.push(url + ': snapshot entry is too large (metadata only)');
  }
  const unchecked = sources.filter((s) => !snapshot.entries[s.url]).length;
  if (unchecked) warnings.push(unchecked + ' registry URL(s) have no snapshot yet (run sources:check online, review, then --update-snapshot)');
  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Page signal extraction (metadata only)

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-' };
export function decodeEntities(text) {
  return String(text ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}
const clean = (text) => decodeEntities(String(text ?? '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

function metaContent(html, names) {
  for (const name of names) {
    const re = new RegExp('<meta[^>]+(?:name|property|itemprop)=["\']' + name.replace(/[.:]/g, '\\$&') + '["\'][^>]*>', 'i');
    const tag = html.match(re)?.[0];
    const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
    if (content) return clean(content);
  }
  return null;
}

// Strong phrases that may appear anywhere in visible text.
const SUPERSEDED_BODY_RE = /\b(superseded by|has been superseded|has been withdrawn|has been revised by|will be replaced by|this (?:page|document|publication|standard|version) (?:is|has been) (?:archived|retired|replaced|withdrawn))\b/i;
// Weaker words are only trusted in identifying elements (title and headings).
const SUPERSEDED_RE =/\b(superseded by|has been superseded|is superseded|withdrawn(?: standard| publication)?|has been withdrawn|has been revised by|will be replaced by|replaced by|no longer (?:current|maintained|in force)|this (?:page|document|publication|standard|version) (?:is|has been) (?:archived|retired|replaced))\b/i;
const DRAFT_RE = /\b(initial public draft|second public draft|final public draft|public draft|draft for (?:public )?comment|exposure draft|consultation (?:draft|paper|document|version)|open for (?:public )?(?:comment|consultation)|under public consultation|proposed rule|draft (?:standard|recommendation|guidance|guideline|report)|working draft|candidate recommendation)\b/i;
const YEAR_RE = /\b(19[89]\d|20[0-4]\d)\b/g;
const VERSION_RE = /\b(?:v(?:ersion)?\s?\d+(?:\.\d+)+|rev(?:ision)?\.?\s?\d+|\d{4,5}:\d{4}|\d+(?:\.\d+)+ (?:edition|release))\b/gi;

/** Extracts metadata signals from the beginning of an HTML document. */
export function extractSignals(html) {
  const head = String(html ?? '').slice(0, 400000);
  const title = clean(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '') || null;
  const h1 = clean(head.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '') || null;
  const description = metaContent(head, ['description', 'og:description']);
  const modifiedDate = metaContent(head, ['article:modified_time', 'og:updated_time', 'dcterms.modified', 'DC.date.modified', 'last-modified', 'dateModified'])
    ?? head.match(/"dateModified"\s*:\s*"([^"]+)"/)?.[1] ?? null;
  // Status signals only from the identifying parts of the page (title, h1, description) plus
  // strong phrases in visible text, to avoid matching history tables that list old drafts.
  // Some publishers (for example NIST CSRC) show the status in a heading next to the title.
  const headings = [...head.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].slice(0, 4).map((m) => clean(m[1])).filter(Boolean);
  const identity = [title, ...headings, description].filter(Boolean).join(' | ');
  const bodyText = clean(head.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')).slice(0, 60000);
  const statusSignals = [];
  const draft = identity.match(DRAFT_RE)?.[0];
  if (draft) statusSignals.push('draft:' + draft.toLowerCase());
  const superseded = identity.match(SUPERSEDED_RE)?.[0] ?? bodyText.match(SUPERSEDED_BODY_RE)?.[0];
  if (superseded) statusSignals.push('superseded:' + superseded.toLowerCase());
  const versionSignals = [...new Set([...(identity.match(VERSION_RE) ?? []), ...(identity.match(YEAR_RE) ?? [])].map((s) => s.toLowerCase()))].sort();
  const headFingerprint = createHash('sha256').update([title, h1, description].map((s) => s ?? '').join('\u0000')).digest('hex');
  return { title, h1, modifiedDate, statusSignals, versionSignals, headFingerprint };
}

// ---------------------------------------------------------------------------
// Classification

const TWO_LEVEL_SUFFIXES = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'nhs.uk', 'com.au', 'gov.au', 'europa.eu', 'coe.int', 'un.org', 'gc.ca']);
export function siteOf(host) {
  const parts = String(host).toLowerCase().replace(/^www\./, '').split('.');
  const lastTwo = parts.slice(-2).join('.');
  return TWO_LEVEL_SUFFIXES.has(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
}

export function isHomepage(url) {
  const { pathname, search } = new URL(url);
  return !search && /^\/(?:(?:[a-z]{2}(?:-[a-z]{2})?|home|index\.html?|default\.aspx?)\/?)?$/i.test(pathname);
}

const trivialRedirect = (from, to) => {
  const a = new URL(from);
  const b = new URL(to);
  // Query-only differences (for example ?hl=<locale> from language negotiation) are trivial.
  const norm = (u) => u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '');
  return norm(a) === norm(b);
};

const maxYear = (signals) => Math.max(0, ...signals.map((s) => Number(s.match(/\b(19|20)\d\d\b/)?.[0] ?? 0)));

const NETWORK_CODES = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ENETUNREACH', 'EHOSTUNREACH', 'ETIMEDOUT', 'EPIPE', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET']);
export const NO_NETWORK_CODES = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH', 'EHOSTUNREACH', 'ECONNREFUSED']);

/**
 * Turns one observation into a status. `observation` is either
 *   { error: { kind: 'timeout' | 'network' | 'tls' | 'redirect-loop' | 'invalid-redirect', code } }
 * or { httpStatus, finalUrl, redirectChain, etag, lastModified, signals }.
 */
export function classify(source, observation, previous = null) {
  const reasons = [];
  const result = (status, needsReview) => ({ status, needsReview, reasons });
  if (observation.error) {
    if (observation.error.kind === 'timeout') return (reasons.push('request timed out'), result('TIMEOUT', false));
    if (observation.error.kind === 'redirect-loop') return (reasons.push('too many redirects'), result('BROKEN', true));
    if (observation.error.kind === 'invalid-redirect') return (reasons.push('redirect to a non-HTTPS or invalid location'), result('BROKEN', true));
    reasons.push(observation.error.kind + (observation.error.code ? ' ' + observation.error.code : '') + '; not evidence that the source is broken');
    return result('UNKNOWN', false);
  }
  const { httpStatus, finalUrl, signals } = observation;
  if (httpStatus === 404 || httpStatus === 410) return (reasons.push('HTTP ' + httpStatus), result('BROKEN', true));
  if ([401, 403, 429, 451].includes(httpStatus)) return (reasons.push('HTTP ' + httpStatus + ' (access blocked or rate limited; verify manually)'), result('UNKNOWN', false));
  if (httpStatus >= 500) return (reasons.push('HTTP ' + httpStatus + ' (server error; retry later)'), result('UNKNOWN', false));
  if (httpStatus < 200 || httpStatus >= 300) return (reasons.push('HTTP ' + httpStatus), result('UNKNOWN', false));

  const redirected = finalUrl !== source.url && !trivialRedirect(source.url, finalUrl);
  const sameHost = new URL(finalUrl).host.replace(/^www\./, '') === new URL(source.url).host.replace(/^www\./, '');
  if (redirected && isHomepage(finalUrl) && !isHomepage(source.url)) {
    if (sameHost) {
      reasons.push('document URL redirects to the site homepage (soft 404): ' + finalUrl);
      return result('BROKEN', true);
    }
    reasons.push('document moved to the root of another host; confirm it is the same resource: ' + finalUrl);
  }
  const suspicious = redirected && siteOf(new URL(finalUrl).host) !== siteOf(new URL(source.url).host);
  if (suspicious) reasons.push('redirect crosses to a different site: ' + new URL(finalUrl).host);

  const superseded = signals.statusSignals.find((s) => s.startsWith('superseded:'));
  if (superseded) {
    reasons.push('page signals ' + superseded.slice('superseded:'.length));
    return result('POSSIBLY_SUPERSEDED', true);
  }
  const draft = signals.statusSignals.find((s) => s.startsWith('draft:'));
  if (draft && !source.declaredDraft) {
    reasons.push('page signals "' + draft.slice(6) + '" but the registry does not declare draft status');
    return result('DRAFT_STATUS', true);
  }

  if (previous) {
    if (previous.title !== signals.title) reasons.push('title changed: "' + previous.title + '" -> "' + signals.title + '"');
    if (previous.finalUrl !== finalUrl) reasons.push('final URL changed: ' + previous.finalUrl + ' -> ' + finalUrl);
    if (reasons.some((r) => /changed/.test(r))) return result('CHANGED', true);
    // Page-level signals only. ETag/Last-Modified are recorded but are weak: many publishers
    // regenerate them on every request (observed on EDPB and O*NET within one minute).
    const updates = [];
    if (previous.modifiedDate && signals.modifiedDate && previous.modifiedDate !== signals.modifiedDate) updates.push('page modified date changed');
    if (maxYear(signals.versionSignals) > maxYear(previous.versionSignals ?? [])) updates.push('newer year/version signal in title');
    if (previous.headFingerprint && previous.headFingerprint !== signals.headFingerprint) updates.push('headings or description changed');
    if (updates.length) {
      reasons.push(...updates);
      return result('POSSIBLY_UPDATED', true);
    }
    if ((previous.etag && observation.etag && previous.etag !== observation.etag) ||
        (previous.lastModified && observation.lastModified && previous.lastModified !== observation.lastModified)) {
      reasons.push('HTTP validators changed (weak signal, not flagged)');
    }
  }
  if (source.declaredDraft && !draft) {
    reasons.push('registry declares draft status but the page no longer signals draft; it may have been finalized');
    return result('POSSIBLY_UPDATED', true);
  }
  if (draft) {
    reasons.push('draft status acknowledged in the registry');
    return result('DRAFT_STATUS', false);
  }
  if (redirected) {
    reasons.push('redirects to ' + finalUrl);
    return result('REDIRECTED', suspicious || reasons.some((r) => r.startsWith('document moved')));
  }
  if (!previous) reasons.push('no snapshot yet; reachable but freshness not compared');
  return result('REACHABLE', false);
}

export function snapshotEntry(observation, checkedAt) {
  return {
    checkedAt,
    finalUrl: observation.finalUrl,
    httpStatus: observation.httpStatus,
    etag: observation.etag ?? null,
    lastModified: observation.lastModified ?? null,
    modifiedDate: observation.signals.modifiedDate ?? null,
    title: observation.signals.title ?? null,
    versionSignals: observation.signals.versionSignals,
    statusSignals: observation.signals.statusSignals,
    headFingerprint: observation.signals.headFingerprint,
  };
}

// ---------------------------------------------------------------------------
// Network

const USER_AGENT = 'UltimatePromptLibrary-SourceFreshness/' + CHECKER_VERSION + ' (+https://github.com/zoxknez/ultimate-prompt-library)';
const MAX_BYTES = 1024 * 1024;

async function readPrefix(response) {
  const reader = response.body?.getReader?.();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return Buffer.concat(chunks).toString('utf8');
}

function errorKind(error) {
  const code = error?.cause?.code ?? error?.code ?? null;
  if (/CERT|TLS|SSL|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(String(code ?? '') + ' ' + String(error?.cause?.message ?? ''))) return { kind: 'tls', code };
  if (NETWORK_CODES.has(code)) return { kind: 'network', code };
  return { kind: 'network', code: code ?? (error?.name || 'error') };
}

/** Fetches one URL following at most `maxRedirects` HTTPS redirects manually. */
export async function observe(url, { timeoutMs = 20000, maxRedirects = 5, fetchImpl = globalThis.fetch } = {}) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetchImpl(current, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5', 'Accept-Language': 'en' },
      });
      if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
        await response.body?.cancel?.().catch(() => {});
        let next;
        try {
          next = new URL(response.headers.get('location'), current).href;
        } catch {
          return { error: { kind: 'invalid-redirect' }, redirectChain: chain };
        }
        if (!next.startsWith('https://')) return { error: { kind: 'invalid-redirect' }, redirectChain: [...chain, next] };
        chain.push({ status: response.status, to: next });
        current = next;
        continue;
      }
      const type = response.headers.get('content-type') ?? '';
      const html = /html|xml/i.test(type) ? await readPrefix(response) : '';
      if (!html) await response.body?.cancel?.().catch(() => {});
      return {
        httpStatus: response.status,
        finalUrl: current,
        redirectChain: chain,
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
        contentType: type.split(';')[0] || null,
        signals: extractSignals(html),
      };
    } catch (error) {
      if (controller.signal.aborted) return { error: { kind: 'timeout' }, redirectChain: chain };
      return { error: errorKind(error), redirectChain: chain };
    } finally {
      clearTimeout(timer);
    }
  }
  return { error: { kind: 'redirect-loop' }, redirectChain: chain };
}

/**
 * When every observation failed at the network layer, nothing was actually checked: report
 * NOT_RUN_NO_NETWORK instead of per-source UNKNOWN/TIMEOUT (and never BROKEN).
 */
export function networkVerdict(observations) {
  const allNetwork = observations.length > 0 && observations.every((o) => o.error && ['network', 'tls', 'timeout'].includes(o.error.kind));
  return allNetwork ? 'NOT_RUN_NO_NETWORK' : 'AVAILABLE';
}

/** Runs `worker` over items with a global concurrency limit and at most one request per host at a time. */
export async function mapWithHostLimit(items, hostOf, limit, worker) {
  const queues = new Map();
  for (const item of items) {
    const host = hostOf(item);
    if (!queues.has(host)) queues.set(host, []);
    queues.get(host).push(item);
  }
  const hosts = [...queues.keys()];
  const results = new Map();
  let next = 0;
  async function lane() {
    while (next < hosts.length) {
      const host = hosts[next++];
      for (const item of queues.get(host)) results.set(item, await worker(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, hosts.length) }, lane));
  return items.map((item) => results.get(item));
}
