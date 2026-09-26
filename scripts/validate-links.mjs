#!/usr/bin/env node
// Lightweight check of internal relative links in Markdown files.
//
// Checks inline links/images `[text](target)` and reference definitions `[ref]: target`
// outside fenced code blocks and inline code. External URLs (any scheme), protocol-relative
// URLs and pure #anchors are skipped. Anchors are stripped and not verified.

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

const report = new Reporter('validate-links');
let checked = 0;
const files = markdownFiles(ROOT);

for (const file of files) {
  const relFile = rel(file);
  const lines = stripCode(readText(relFile));
  lines.forEach((line, index) => {
    const targets = [];
    for (const m of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g)) targets.push(m[1]);
    const def = /^ {0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+.*)?$/.exec(line);
    if (def) targets.push(def[1]);
    for (const target of targets) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//') || target.startsWith('#')) continue;
      const clean = decodeURIComponent(target.split('#')[0].split('?')[0]);
      if (!clean) continue;
      checked++;
      const resolved = clean.startsWith('/') ? path.join(ROOT, clean) : path.resolve(path.dirname(file), clean);
      if (!resolved.startsWith(ROOT)) report.error(`${relFile}:${index + 1}`, `link points outside the repository: ${target}`);
      else if (!existsSync(resolved)) report.error(`${relFile}:${index + 1}`, `broken link: ${target}`);
    }
  });
}

process.exitCode = report.finish([`Markdown files scanned: ${files.length}`, `Internal links checked: ${checked}`]);
