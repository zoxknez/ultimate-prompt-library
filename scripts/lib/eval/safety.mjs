// Safety helpers for the eval harness: secret redaction, untrusted-text sanitization, safe file
// paths and canonical hashing. Model output, provider errors and fixture text are UNTRUSTED DATA:
// they are never executed, never rendered as HTML and never printed raw to a terminal.

import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export const sha256 = (value) => createHash('sha256').update(String(value ?? '')).digest('hex');

/** JSON with recursively sorted object keys, so hashes do not depend on property order. */
export function canonicalJson(value) {
  const sort = (item) => {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === 'object') {
      return Object.fromEntries(Object.keys(item).sort().map((key) => [key, sort(item[key])]));
    }
    return item;
  };
  return JSON.stringify(sort(value));
}

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{8,}/g, // OpenAI-style keys, including sk-proj-...
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  /\b(?:api[_-]?key|authorization|x-api-key)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{8,}/gi,
];

/** Removes anything that looks like a credential. `known` holds exact secret values to scrub too. */
export function redactSecrets(text, known = []) {
  let out = String(text ?? '');
  for (const secret of known) {
    if (secret && secret.length >= 8) out = out.split(secret).join('[REDACTED]');
  }
  for (const pattern of SECRET_PATTERNS) out = out.replace(pattern, '[REDACTED]');
  return out;
}

// ANSI/VT escape sequences, C0/C1 controls (except \n and \t) and bidi overrides that can spoof
// terminal or rendered output.
const ANSI_RE = /\u001b\[[0-9;?]*[ -/]*[@-~]|\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)|\u001b[@-_]/g;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const BIDI_RE = /[\u202a-\u202e\u2066-\u2069\u200e\u200f]/g;

export function stripUnsafeChars(text) {
  return String(text ?? '').replace(ANSI_RE, '').replace(CONTROL_RE, '').replace(BIDI_RE, '');
}

/** One-line, length-limited, control-free text for terminal output. */
export function terminalSafe(text, max = 300) {
  const clean = stripUnsafeChars(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 3) + '...' : clean;
}

/** Text safe inside a Markdown table cell: no HTML, links, code spans, pipes or line breaks. */
export function markdownCell(text, max = 400) {
  return terminalSafe(text, max)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/[`*_[\]]/g, (ch) => '\\' + ch);
}

/** A fenced block that cannot be closed early by backticks inside the untrusted content. */
export function markdownFence(text, info = 'text') {
  const body = stripUnsafeChars(text);
  const longest = Math.max(2, ...[...body.matchAll(/`+/g)].map((m) => m[0].length));
  const fence = '`'.repeat(longest + 1);
  return fence + info + '\n' + body + '\n' + fence;
}

/**
 * Resolves a user-supplied file path and refuses anything outside `baseDir`, symlinks, non-files,
 * wrong extensions and oversized files. Used for --run and --manifest.
 */
export function resolveSafeFile(userPath, { baseDir, extension = '.json', maxBytes = 64 * 1024 * 1024, label = 'file' }) {
  if (!userPath || typeof userPath !== 'string') throw new Error(label + ' path is required.');
  if (userPath.includes('\0')) throw new Error(label + ' path contains a NUL byte.');
  const base = path.resolve(baseDir);
  const candidate = path.resolve(ROOT, userPath);
  if (!candidate.toLowerCase().endsWith(extension)) throw new Error(label + ' must be a ' + extension + ' file.');
  if (!existsSync(candidate)) throw new Error(label + ' not found: ' + terminalSafe(userPath));
  if (lstatSync(candidate).isSymbolicLink()) throw new Error(label + ' must not be a symbolic link.');
  const realBase = existsSync(base) ? realpathSync(base) : base;
  const real = realpathSync(candidate);
  const relative = path.relative(realBase, real);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(label + ' must be inside ' + path.relative(ROOT, base).split(path.sep).join('/') + '/.');
  }
  const stats = statSync(real);
  if (!stats.isFile()) throw new Error(label + ' is not a regular file.');
  if (stats.size > maxBytes) throw new Error(label + ' exceeds ' + maxBytes + ' bytes.');
  return real;
}

export function readJsonFile(file) {
  const raw = readFileSync(file, 'utf8');
  return { raw, value: JSON.parse(raw) };
}

/** Current git commit without spawning a shell; null when unavailable. */
export function gitCommit() {
  try {
    const gitDir = path.join(ROOT, '.git');
    const head = readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();
    if (/^[0-9a-f]{40}$/.test(head)) return head;
    const ref = head.match(/^ref: (.+)$/)?.[1];
    if (!ref) return null;
    const loose = path.join(gitDir, ...ref.split('/'));
    if (existsSync(loose)) return readFileSync(loose, 'utf8').trim();
    const packed = readFileSync(path.join(gitDir, 'packed-refs'), 'utf8');
    return packed.split('\n').find((line) => line.endsWith(' ' + ref))?.split(' ')[0] ?? null;
  } catch {
    return null;
  }
}
