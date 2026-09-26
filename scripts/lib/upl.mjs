// Shared helpers for the Ultimate Prompt Library tooling.
//
// Sources of truth:
//   catalog.json          -> categories, subcategories and the planned prompt list (IDs, numbers, slugs)
//   prompt front matter   -> everything about prompts that actually exist (title, version, status, ...)
// Everything in indexes/ and inside generated Markdown blocks is derived from those two.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PROMPTS_DIR = 'prompts';
export const CATALOG_FILE = 'catalog.json';

export const STATUSES = ['draft', 'review', 'stable', 'deprecated'];
export const REQUIRED_FIELDS = [
  'id',
  'number',
  'slug',
  'title',
  'category',
  'category_id',
  'subcategory',
  'subcategory_id',
  'language',
  'version',
  'status',
];
export const OPTIONAL_FIELDS = ['tags', 'replaced_by', 'updated', 'authors'];

export const ID_RE = /^UPL-[A-Z]+-\d{3}$/;
export const CATEGORY_ID_RE = /^UPL-[A-Z]+$/;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PROMPT_FILE_RE = /^(\d{3})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
export const VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Small utilities

export const pad = (n, width) => String(n).padStart(width, '0');
export const toPosix = (p) => p.split(path.sep).join('/');
export const rel = (abs) => toPosix(path.relative(ROOT, abs));
export const abs = (relPath) => path.join(ROOT, ...relPath.split('/'));
export const sha256 = (text) => createHash('sha256').update(text).digest('hex');
export const subcategoryDir = (sub) => `${pad(sub.order, 2)}-${sub.id}`;
export const categoryCode = (categoryId) => categoryId.replace(/^UPL-/, '');
export const promptId = (categoryId, number) => `${categoryId}-${pad(number, 3)}`;
export const promptFileName = (number, slug) => `${pad(number, 3)}-${slug}.md`;

export function readText(relPath) {
  return readFileSync(abs(relPath), 'utf8');
}

/** Collects errors and warnings and prints them in a consistent format. */
export class Reporter {
  constructor(name) {
    this.name = name;
    this.errors = [];
    this.warnings = [];
  }
  error(where, message) {
    this.errors.push({ where, message });
  }
  warn(where, message) {
    this.warnings.push({ where, message });
  }
  merge(other) {
    this.errors.push(...other.errors);
    this.warnings.push(...other.warnings);
  }
  print() {
    for (const { where, message } of this.warnings) console.warn(`WARNING  ${where}: ${message}`);
    for (const { where, message } of this.errors) console.error(`ERROR    ${where}: ${message}`);
  }
  /** Prints issues and a summary; returns the process exit code. */
  finish(summaryLines = []) {
    this.print();
    if (this.warnings.length || this.errors.length) console.log('');
    for (const line of summaryLines) console.log(line);
    console.log(
      `${this.name}: ${this.errors.length} error(s), ${this.warnings.length} warning(s) -> ${
        this.errors.length ? 'FAILED' : 'OK'
      }`,
    );
    return this.errors.length ? 1 : 0;
  }
}

// ---------------------------------------------------------------------------
// Catalog

export function loadCatalog() {
  return JSON.parse(readText(CATALOG_FILE));
}

/** Structural validation of catalog.json. */
export function validateCatalog(catalog, report) {
  const where = CATALOG_FILE;
  if (catalog.schemaVersion !== 1) report.error(where, `unsupported schemaVersion ${catalog.schemaVersion}`);
  const languages = catalog.languages ?? [];
  const codes = languages.map((l) => l.code);
  if (!codes.length) report.error(where, 'no languages defined');
  if (new Set(codes).size !== codes.length) report.error(where, 'duplicate language codes');
  if (languages.filter((l) => l.primary).length !== 1) report.error(where, 'exactly one language must be primary');

  const seen = { id: new Set(), order: new Set(), slug: new Set() };
  const dirsSeen = Object.fromEntries(codes.map((c) => [c, new Set()]));
  for (const cat of catalog.categories ?? []) {
    const cw = `${where} [${cat.id}]`;
    if (!CATEGORY_ID_RE.test(cat.id ?? '')) report.error(cw, 'category id must match UPL-<CODE>');
    for (const key of ['id', 'order', 'slug']) {
      if (seen[key].has(cat[key])) report.error(cw, `duplicate category ${key} "${cat[key]}"`);
      seen[key].add(cat[key]);
    }
    if (!SLUG_RE.test(cat.slug ?? '')) report.error(cw, 'category slug must be kebab-case');
    for (const code of codes) {
      const dir = cat.dirs?.[code];
      if (!dir) report.error(cw, `missing dirs.${code}`);
      else {
        if (!new RegExp(`^${pad(cat.order, 2)}-[a-z0-9]+(?:-[a-z0-9]+)*$`).test(dir))
          report.error(cw, `dirs.${code} "${dir}" must be "${pad(cat.order, 2)}-<kebab-case>"`);
        if (dirsSeen[code].has(dir)) report.error(cw, `duplicate dirs.${code} "${dir}"`);
        dirsSeen[code].add(dir);
      }
      if (!cat.names?.[code]) report.error(cw, `missing names.${code}`);
    }

    const subIds = new Set();
    const subOrders = new Set();
    for (const sub of cat.subcategories ?? []) {
      const sw = `${cw} subcategory "${sub.id}"`;
      if (!SLUG_RE.test(sub.id ?? '')) report.error(sw, 'subcategory id must be kebab-case');
      if (subIds.has(sub.id)) report.error(sw, 'duplicate subcategory id');
      if (subOrders.has(sub.order)) report.error(sw, `duplicate subcategory order ${sub.order}`);
      if (!Number.isInteger(sub.order) || sub.order < 1 || sub.order > 99) report.error(sw, 'order must be 1-99');
      subIds.add(sub.id);
      subOrders.add(sub.order);
      for (const code of codes) if (!sub.names?.[code]) report.error(sw, `missing names.${code}`);
    }

    const prompts = cat.prompts ?? [];
    const numbers = new Set();
    const slugs = new Set();
    for (const p of prompts) {
      const pw = `${cw} prompt "${p.id}"`;
      if (!Number.isInteger(p.number) || p.number < 1 || p.number > 999) report.error(pw, 'number must be 1-999');
      if (p.id !== promptId(cat.id, p.number)) report.error(pw, `id must be ${promptId(cat.id, p.number)}`);
      if (numbers.has(p.number)) report.error(pw, `duplicate number ${p.number}`);
      numbers.add(p.number);
      if (!SLUG_RE.test(p.slug ?? '')) report.error(pw, 'slug must be kebab-case');
      if (slugs.has(p.slug)) report.error(pw, `duplicate slug "${p.slug}" in category`);
      slugs.add(p.slug);
      if (!subIds.has(p.subcategory)) report.error(pw, `unknown subcategory "${p.subcategory}"`);
      for (const code of codes) if (!p.title?.[code]) report.error(pw, `missing title.${code}`);
    }
    // Catalog numbering is a planning sequence: 1..N without gaps.
    for (let n = 1; n <= prompts.length; n++) {
      if (!numbers.has(n)) report.error(cw, `catalog numbering has a gap: ${pad(n, 3)} is missing`);
    }
    const sorted = prompts.map((p) => p.number);
    if (sorted.some((n, i) => i > 0 && n < sorted[i - 1])) report.error(cw, 'prompts must be listed in number order');
  }
  const orders = (catalog.categories ?? []).map((c) => c.order);
  if (orders.some((o, i) => o !== i + 1)) report.error(where, 'categories must be listed in order 1..N');
}

// ---------------------------------------------------------------------------
// Front matter

/**
 * Splits a Markdown file into YAML front matter and body.
 * Returns { data, body, errors } where body excludes the single blank line after the closing ---.
 */
export function parseFrontMatter(text) {
  if (!text.startsWith('---\n')) return { data: null, body: text, errors: ['file must start with YAML front matter (---)'] };
  const end = text.indexOf('\n---\n', 3);
  if (end === -1) return { data: null, body: text, errors: ['front matter is not closed with ---'] };
  const yamlText = text.slice(4, end + 1);
  let body = text.slice(end + 5);
  if (body.startsWith('\n')) body = body.slice(1);
  const doc = parseDocument(yamlText, { uniqueKeys: true, prettyErrors: false });
  const errors = [...doc.errors, ...doc.warnings].map((e) => `invalid YAML front matter: ${e.message.split('\n')[0]}`);
  const data = errors.length ? null : doc.toJS();
  if (!errors.length && (data === null || typeof data !== 'object' || Array.isArray(data))) {
    return { data: null, body, errors: ['front matter must be a YAML mapping'] };
  }
  return { data, body, errors };
}

// ---------------------------------------------------------------------------
// Repository scan

function listDir(relDir) {
  return readdirSync(abs(relDir), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Walks prompts/ and validates layout plus every prompt file against the catalog.
 * Returns { catalog, files, prompts, report } where `prompts` groups localized files by ID.
 */
export function loadRepository() {
  const report = new Reporter('validate-prompts');
  const catalog = loadCatalog();
  validateCatalog(catalog, report);

  const languages = catalog.languages.map((l) => l.code);
  const catByDir = Object.fromEntries(languages.map((code) => [code, new Map()]));
  const planned = new Map(); // id -> { category, entry }
  for (const cat of catalog.categories) {
    for (const code of languages) catByDir[code].set(cat.dirs[code], cat);
    for (const entry of cat.prompts) planned.set(entry.id, { category: cat, entry });
  }

  const files = [];
  if (!existsSync(abs(PROMPTS_DIR))) {
    report.error(PROMPTS_DIR, 'directory is missing');
    return { catalog, files, prompts: new Map(), planned, report };
  }

  for (const langEntry of listDir(PROMPTS_DIR)) {
    const langRel = `${PROMPTS_DIR}/${langEntry.name}`;
    if (!langEntry.isDirectory() || !languages.includes(langEntry.name)) {
      report.error(langRel, `unexpected entry; language folders must be one of: ${languages.join(', ')}`);
      continue;
    }
    const lang = langEntry.name;
    for (const catEntry of listDir(langRel)) {
      const catRel = `${langRel}/${catEntry.name}`;
      const cat = catByDir[lang].get(catEntry.name);
      if (!catEntry.isDirectory() || !cat) {
        report.error(catRel, 'unexpected entry; not a category folder defined in catalog.json for this language');
        continue;
      }
      const subByDir = new Map(cat.subcategories.map((s) => [subcategoryDir(s), s]));
      for (const subEntry of listDir(catRel)) {
        const subRel = `${catRel}/${subEntry.name}`;
        if (subEntry.isFile() && subEntry.name === 'README.md') continue;
        const sub = subByDir.get(subEntry.name);
        if (!subEntry.isDirectory() || !sub) {
          report.error(subRel, 'unexpected entry; prompts must live in a subcategory folder defined in catalog.json');
          continue;
        }
        for (const fileEntry of listDir(subRel)) {
          const fileRel = `${subRel}/${fileEntry.name}`;
          if (fileEntry.isFile() && fileEntry.name === 'README.md') continue;
          if (!fileEntry.isFile() || !fileEntry.name.endsWith('.md')) {
            report.error(fileRel, 'unexpected entry; subcategory folders may only contain README.md and prompt .md files');
            continue;
          }
          const file = validatePromptFile({ fileRel, lang, cat, sub, name: fileEntry.name, planned, report });
          if (file) files.push(file);
        }
      }
    }
  }

  // Every category and subcategory folder must exist (with a README) in every language.
  for (const cat of catalog.categories) {
    for (const lang of languages) {
      const catRel = `${PROMPTS_DIR}/${lang}/${cat.dirs[lang]}`;
      if (!existsSync(abs(`${catRel}/README.md`))) report.error(catRel, 'missing category README.md');
      for (const sub of cat.subcategories) {
        const subRel = `${catRel}/${subcategoryDir(sub)}`;
        if (!existsSync(abs(`${subRel}/README.md`))) report.error(subRel, 'missing subcategory README.md');
      }
    }
  }

  // Duplicates per language.
  for (const lang of languages) {
    const byId = new Map();
    const bySlug = new Map();
    for (const f of files.filter((x) => x.lang === lang)) {
      const id = f.data.id;
      if (byId.has(id)) report.error(f.path, `duplicate id ${id} in language "${lang}" (also ${byId.get(id)})`);
      else byId.set(id, f.path);
      const slugKey = `${f.data.category_id}/${f.data.slug}`;
      if (bySlug.has(slugKey))
        report.error(f.path, `duplicate slug "${f.data.slug}" in ${f.data.category_id} (also ${bySlug.get(slugKey)})`);
      else bySlug.set(slugKey, f.path);
    }
  }

  // Group localized files by stable ID.
  const prompts = new Map();
  for (const f of files) {
    if (!prompts.has(f.data.id)) prompts.set(f.data.id, { id: f.data.id, localizations: {} });
    prompts.get(f.data.id).localizations[f.lang] ??= f;
  }
  return { catalog, files, prompts, planned, report };
}

function validatePromptFile({ fileRel, lang, cat, sub, name, planned, report }) {
  const buffer = readFileSync(abs(fileRel));
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    report.error(fileRel, 'file is not valid UTF-8');
    return null;
  }
  let ok = true;
  const fail = (message) => {
    report.error(fileRel, message);
    ok = false;
  };
  if (text.charCodeAt(0) === 0xfeff) {
    fail('file must not start with a UTF-8 BOM');
    return null;
  }
  if (text.includes('\r')) fail('file must use LF line endings (found CR characters)');
  if (!text.endsWith('\n') || text.endsWith('\n\n')) fail('file must end with exactly one newline');

  const match = PROMPT_FILE_RE.exec(name);
  if (!match) {
    fail('filename must match NNN-kebab-case-slug.md (e.g. 042-docker-production-audit.md)');
    return null;
  }
  const fileNumber = Number(match[1]);
  const fileSlug = match[2];

  const { data, body, errors } = parseFrontMatter(text);
  if (errors.length) {
    errors.forEach(fail);
    return null;
  }

  for (const key of REQUIRED_FIELDS) {
    if (data[key] === undefined || data[key] === null || data[key] === '') fail(`missing required field "${key}"`);
  }
  for (const key of Object.keys(data)) {
    if (!REQUIRED_FIELDS.includes(key) && !OPTIONAL_FIELDS.includes(key)) fail(`unknown front matter field "${key}"`);
  }
  if (!ok) return null;

  const str = (key) => {
    if (typeof data[key] !== 'string') fail(`"${key}" must be a string`);
  };
  ['id', 'slug', 'title', 'category', 'category_id', 'subcategory', 'subcategory_id', 'language', 'version', 'status'].forEach(str);
  if (!Number.isInteger(data.number)) fail('"number" must be an integer');
  if (!ok) return null;

  if (!ID_RE.test(data.id)) fail(`id "${data.id}" must match UPL-<CATEGORY>-NNN`);
  if (data.number < 1 || data.number > 999) fail(`number ${data.number} must be between 1 and 999`);
  if (data.number !== fileNumber) fail(`number ${data.number} does not match filename number ${match[1]}`);
  if (data.slug !== fileSlug) fail(`slug "${data.slug}" does not match filename slug "${fileSlug}"`);
  if (!SLUG_RE.test(data.slug)) fail(`slug "${data.slug}" must be kebab-case`);
  if (data.language !== lang) fail(`language "${data.language}" does not match folder "prompts/${lang}"`);
  if (data.category_id !== cat.id) fail(`category_id "${data.category_id}" must be "${cat.id}" for this folder`);
  if (data.category !== cat.names[lang]) fail(`category "${data.category}" must be "${cat.names[lang]}" for language "${lang}"`);
  if (data.subcategory_id !== sub.id) fail(`subcategory_id "${data.subcategory_id}" must be "${sub.id}" for this folder`);
  if (data.subcategory !== sub.names[lang])
    fail(`subcategory "${data.subcategory}" must be "${sub.names[lang]}" for language "${lang}"`);
  if (data.id !== promptId(cat.id, data.number)) fail(`id "${data.id}" must be "${promptId(cat.id, data.number)}"`);
  if (!VERSION_RE.test(data.version)) fail(`version "${data.version}" must be MAJOR.MINOR.PATCH (e.g. 1.0.0)`);
  if (!STATUSES.includes(data.status)) fail(`unknown status "${data.status}" (allowed: ${STATUSES.join(', ')})`);

  // Optional fields.
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== 'string' || !SLUG_RE.test(t)))
      fail('"tags" must be a list of kebab-case strings');
    else if (new Set(data.tags).size !== data.tags.length) fail('"tags" contains duplicates');
  }
  if (data.authors !== undefined) {
    if (!Array.isArray(data.authors) || data.authors.some((a) => typeof a !== 'string' || !a.trim()))
      fail('"authors" must be a list of non-empty strings');
  }
  if (data.updated !== undefined) {
    if (typeof data.updated !== 'string' || !DATE_RE.test(data.updated) || Number.isNaN(Date.parse(data.updated)))
      fail('"updated" must be a date string in YYYY-MM-DD format');
  }
  if (data.replaced_by !== undefined) {
    if (typeof data.replaced_by !== 'string' || !ID_RE.test(data.replaced_by)) fail('"replaced_by" must be a prompt ID');
    else if (!planned.has(data.replaced_by)) fail(`"replaced_by" ${data.replaced_by} is not in catalog.json`);
    else if (data.replaced_by === data.id) fail('"replaced_by" cannot reference the prompt itself');
    if (data.status !== 'deprecated') report.warn(fileRel, '"replaced_by" is set but status is not "deprecated"');
  }

  // The ID must be registered in the catalog, with matching identity.
  const plan = planned.get(data.id);
  if (!plan) fail(`id ${data.id} is not registered in catalog.json (IDs are assigned through the catalog)`);
  else {
    if (plan.entry.slug !== data.slug) fail(`slug "${data.slug}" differs from catalog slug "${plan.entry.slug}"`);
    if (plan.entry.subcategory !== data.subcategory_id)
      fail(`catalog places ${data.id} in subcategory "${plan.entry.subcategory}", not "${data.subcategory_id}"`);
    if (plan.entry.title[lang] !== data.title)
      report.warn(fileRel, `title "${data.title}" differs from catalog title "${plan.entry.title[lang]}"`);
  }

  if (!body.trim()) fail('prompt body is empty');
  const fence = findUnclosedFence(body);
  if (fence) report.warn(fileRel, `code fence opened on body line ${fence} is never closed`);

  if (!ok) return null;
  return { path: fileRel, lang, category: cat, subcategory: sub, data, body, bodyHash: sha256(body) };
}

/** Returns the 1-based line number of an unclosed fenced code block, or 0. */
export function findUnclosedFence(markdown) {
  let open = null;
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[i]);
    if (!m) continue;
    const [, marker, rest] = m;
    if (!open) {
      if (marker[0] === '`' && rest.includes('`')) continue; // not a valid backtick fence opener
      open = { char: marker[0], length: marker.length, line: i + 1 };
    } else if (marker[0] === open.char && marker.length >= open.length && !rest.trim()) {
      open = null;
    }
  }
  return open ? open.line : 0;
}

/** Fails fast (exit 1) when the repository has validation errors; used by generators. */
export function loadValidRepository() {
  const repo = loadRepository();
  if (repo.report.errors.length) {
    repo.report.print();
    console.error('\nRepository has validation errors; fix them before generating indexes.');
    process.exit(1);
  }
  return repo;
}

// ---------------------------------------------------------------------------
// Derived model shared by generators

/** Status of a prompt ID: the primary-language status if present, otherwise the first available one. */
export function promptStatus(prompt, languages) {
  for (const code of languages) if (prompt?.localizations[code]) return prompt.localizations[code].data.status;
  return 'planned';
}

/** Per-category view: catalog entries merged with what exists on disk. */
export function buildCollections(repo) {
  const languages = repo.catalog.languages.map((l) => l.code);
  return repo.catalog.categories.map((cat) => {
    const entries = cat.prompts.map((entry) => {
      const prompt = repo.prompts.get(entry.id);
      const status = promptStatus(prompt, languages);
      const titles = {};
      for (const code of languages) titles[code] = prompt?.localizations[code]?.data.title ?? entry.title[code];
      return { entry, prompt, status, available: Boolean(prompt), titles };
    });
    const subcategories = cat.subcategories.map((sub) => {
      const subEntries = entries.filter((e) => e.entry.subcategory === sub.id);
      return {
        sub,
        entries: subEntries,
        planned: subEntries.length,
        available: subEntries.filter((e) => e.available).length,
      };
    });
    return {
      category: cat,
      entries,
      subcategories,
      planned: entries.length,
      available: entries.filter((e) => e.available).length,
    };
  });
}

export function promptPath(lang, cat, sub, number, slug) {
  return `${PROMPTS_DIR}/${lang}/${cat.dirs[lang]}/${subcategoryDir(sub)}/${promptFileName(number, slug)}`;
}

// ---------------------------------------------------------------------------
// Output handling (write or --check)

export class Outputs {
  constructor(name) {
    this.name = name;
    this.files = new Map();
    this.check = process.argv.includes('--check');
    this.report = new Reporter(name);
  }
  set(relPath, content) {
    this.files.set(relPath, content);
  }
  /** Replaces the content of `<!-- UPL:BEGIN name ... -->` ... `<!-- UPL:END name -->` in a Markdown file. */
  block(relPath, name, content) {
    const current = this.files.get(relPath) ?? (existsSync(abs(relPath)) ? readText(relPath) : null);
    if (current === null) {
      this.report.error(relPath, `file is missing (expected generated block "${name}")`);
      return;
    }
    const re = new RegExp(`(<!-- UPL:BEGIN ${name}\\b[^\\n]*-->\\n)[\\s\\S]*?(<!-- UPL:END ${name} -->)`);
    if (!re.test(current)) {
      this.report.error(relPath, `missing generated block markers for "${name}"`);
      return;
    }
    this.files.set(relPath, current.replace(re, (_, begin, end) => `${begin}${content.trimEnd()}\n${end}`));
  }
  finish() {
    const stale = [];
    for (const [relPath, content] of this.files) {
      const current = existsSync(abs(relPath)) ? readText(relPath) : null;
      if (current === content) continue;
      stale.push(relPath);
      if (!this.check) writeFileSync(abs(relPath), content, 'utf8');
    }
    if (this.report.errors.length) return this.report.finish();
    if (this.check) {
      for (const p of stale) this.report.error(p, 'is out of date; run `npm run generate` and commit the result');
      return this.report.finish([`Checked ${this.files.size} generated file(s).`]);
    }
    for (const p of stale) console.log(`updated  ${p}`);
    return this.report.finish([`Generated ${this.files.size} file(s), ${stale.length} changed.`]);
  }
}

export function isDirectory(relPath) {
  return existsSync(abs(relPath)) && statSync(abs(relPath)).isDirectory();
}
