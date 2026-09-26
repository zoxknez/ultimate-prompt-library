#!/usr/bin/env node
// Lightweight check of internal relative links in Markdown files.
//
// Anchors: for links to a Markdown file inside the repository (or to "#id" in the same file) the
// anchor must exist, either as the GitHub slug of a Markdown heading (lowercase, punctuation
// removed, spaces to hyphens, "-1", "-2" suffixes for duplicates) or as an explicit id/name
// attribute such as <a id="top"></a>. HTML headings (<h2>...</h2>) do not reliably get anchors on
// GitHub, so they are not counted; link to an explicit id instead. Anchors in non-Markdown targets
// and external URLs are not checked.
//
// Checks inline links/images `[text](target)`, reference definitions `[ref]: target` and
// HTML href/src/srcset attributes
// outside fenced code blocks and inline code. External URLs (any scheme), protocol-relative
// URLs are skipped.

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { readText, rel, Reporter, ROOT } from './lib/upl.mjs';

const IGNORED_DIRS = new Set(['.git', 'node_modules']);

function markdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

/** Removes fenced code blocks and inline code spans, preserving line count. */
function stripCode(markdown) {
  const lines = markdown.split('\n');
  let fence = null;
  const kept = lines.map((line) => {
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (m && m[1][0] === fence.char && m[1].length >= fence.length && !m[2].trim()) fence = null;
      return '';
    }
    if (m && !(m[1][0] === '`' && m[2].includes('`'))) {
      fence = { char: m[1][0], length: m[1].length };
      return '';
    }
    return line.replace(/(`+)[\s\S]*?\1/g, '');
  });
  return kept;
}

/** GitHub-compatible heading slug (github-slugger semantics on the heading's plain text). */
function slug(heading) {
  const text = heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images -> their text
    .replace(/<[^>]+>/g, '') // inline HTML tags
    .replace(/[`*]/g, '') // code and emphasis markers
    .trim();
  return text.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');
}

const anchorCache = new Map();
function anchorsOf(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const anchors = new Set();
  const counts = new Map();
  let fence = null;
  for (const line of readText(rel(file)).split('\n')) {
    const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null;
      continue;
    }
    if (f && !(f[1][0] === '`' && f[2].includes('`'))) {
      fence = f[1];
      continue;
    }
    const h = /^ {0,3}#{1,6}[ \t]+(.*?)[ \t#]*$/.exec(line);
    if (h) {
      const base = slug(h[1]);
      const n = counts.get(base) ?? 0;
      counts.set(base, n + 1);
      anchors.add(n ? `${base}-${n}` : base);
    }
    for (const m of line.matchAll(/\b(?:id|name)="([^"]+)"/g)) anchors.add(m[1]);
  }
  anchorCache.set(file, anchors);
  return anchors;
}

const report = new Reporter('validate-links');
let checked = 0;
let anchorsChecked = 0;
const files = markdownFiles(ROOT);

for (const file of files) {
  const relFile = rel(file);
  const lines = stripCode(readText(relFile));
  lines.forEach((line, index) => {
    const targets = [];
    for (const m of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g)) targets.push(m[1]);
    for (const m of line.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)) targets.push(m[1].trim().split(/\s+/)[0]);
    const def = /^ {0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+.*)?$/.exec(line);
    if (def) targets.push(def[1]);
    for (const target of targets) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) continue;
      const [pathPart, anchor] = target.split('#');
      const clean = decodeURIComponent(pathPart.split('?')[0]);
      const where = `${relFile}:${index + 1}`;
      let resolved = file;
      if (clean) {
        checked++;
        resolved = clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(path.dirname(file), clean);
        if (!resolved.startsWith(ROOT)) {
          report.error(where, `link points outside the repository: ${target}`);
          continue;
        }
        if (!existsSync(resolved)) {
          report.error(where, `broken link: ${target}`);
          continue;
        }
      }
      if (anchor && resolved.endsWith('.md')) {
        anchorsChecked++;
        if (!anchorsOf(resolved).has(decodeURIComponent(anchor)))
          report.error(where, `broken anchor: ${target} (no heading or id "${anchor}" in ${rel(resolved)})`);
      }
    }
  });
}

process.exitCode = report.finish([
  `Markdown files scanned: ${files.length}`,
  `Internal links checked: ${checked}`,
  `Anchors checked: ${anchorsChecked}`,
]);
