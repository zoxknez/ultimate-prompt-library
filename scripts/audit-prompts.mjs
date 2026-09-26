#!/usr/bin/env node
// Diagnostic content audit of the available prompts. Prints Markdown to stdout; never fails.
//
// For every prompt it extracts size, structure and the presence of common design elements
// (objective, scope/limits, evidence model, severity, output/finding format, second pass,
// final quality gate). Presence is detected with simple keyword signals in English or Serbian
// and is meant to surface anomalies for human review. It is not a quality score:
// a short, focused prompt can be excellent, and size is never used to rank prompts.
//
// Usage: node scripts/audit-prompts.mjs            (tables for every prompt and every subcategory)
//        node scripts/audit-prompts.mjs --summary  (distribution and outliers only)

import { loadRepository } from './lib/upl.mjs';
import { analyzeBody, median } from './lib/structure.mjs';

const OUTLIER_BELOW_PCT = 50; // flag prompts more than 50% smaller than their subcategory median

const SIGNALS = {
  objective: (b) => /\b(main|primary)?\s*objective\b|\bgoal\b|\bI want\b|\bcilj\b|\bželim\b/i.test(b.slice(0, 4000)),
  scope: (b) => /\bscope\b|non-goals?|out of scope|do not (report|invent|fabricate|flag)|\bobim\w*|ne prijavljuj|ne izmišljaj/i.test(b),
  evidence: (b) => (b.match(/\bevidence\b|\bdokaz/gi) ?? []).length >= 3,
  confirmedVsTheoretical: (b) =>
    /\bconfirmed\b|potvrđen/i.test(b) && /theoretical|hypothes|suspected|teorijsk|hipotez|sumnj/i.test(b),
  falsePositive: (b) => /false[\s-]positive|lažno pozitiv|do not (fabricate|invent)|ne izmišljaj|nemoj izmišlja/i.test(b),
  severity: (b) => /\bP0\b|\bseverity\b|ozbiljnost/i.test(b),
  outputFormat: (b, m) => Boolean(m.sections.output || m.sections.findingFormat) || /\b[A-Z][A-Z0-9_]{3,}\.md\b/.test(b),
  secondPass: (b, m) => Boolean(m.sections.secondPass) || /second[\s-]pass|drugi prolaz/i.test(b),
  qualityGate: (b, m) => Boolean(m.sections.finalQualityGate) || /quality gate/i.test(b),
};
const SIGNAL_LABELS = {
  objective: 'objective',
  scope: 'scope/limits',
  evidence: 'evidence model',
  confirmedVsTheoretical: 'confirmed vs theoretical',
  falsePositive: 'false-positive guard',
  severity: 'severity',
  outputFormat: 'output/finding format',
  secondPass: 'second pass',
  qualityGate: 'final quality gate',
};

const summaryOnly = process.argv.includes('--summary');
const repo = loadRepository();
const languages = repo.catalog.languages.map((l) => l.code);
const primary = repo.catalog.languages.find((l) => l.primary).code;
const kb = (bytes) => (bytes / 1024).toFixed(1);

const rows = [];
for (const collection of repo.catalog.categories) {
  for (const entry of collection.prompts) {
    const prompt = repo.prompts.get(entry.id);
    if (!prompt) continue;
    const main = prompt.localizations[primary];
    const m = analyzeBody(main.body);
    const sizes = Object.fromEntries(languages.map((c) => [c, prompt.localizations[c] ? analyzeBody(prompt.localizations[c].body).bytes : 0]));
    const signals = Object.fromEntries(Object.entries(SIGNALS).map(([k, fn]) => [k, fn(main.body, m)]));
    rows.push({ entry, sub: entry.subcategory, title: main.data.title, m, sizes, signals });
  }
}

const out = [];
const stat = (values) => `${kb(Math.min(...values))} / ${kb(median(values))} / ${kb(Math.max(...values))}`;

out.push('## Size distribution (KB of body text: min / median / max)', '');
out.push(`| Scope | Prompts | ${languages.map((c) => c.toUpperCase()).join(' | ')} |`, `|---|:---:|${languages.map(() => ':---:|').join('')}`);
out.push(`| All | ${rows.length} | ${languages.map((c) => stat(rows.map((r) => r.sizes[c]))).join(' | ')} |`);
const subs = [...new Set(rows.map((r) => r.sub))];
for (const sub of subs) {
  const group = rows.filter((r) => r.sub === sub);
  out.push(`| ${sub} | ${group.length} | ${languages.map((c) => stat(group.map((r) => r.sizes[c]))).join(' | ')} |`);
}
out.push('', `Totals: ${languages.map((c) => `${c.toUpperCase()} ${(rows.reduce((s, r) => s + r.sizes[c], 0) / 1024 / 1024).toFixed(2)} MB`).join(', ')}.`, '');

out.push(`## Size outliers (more than ${OUTLIER_BELOW_PCT}% below the subcategory median, ${primary.toUpperCase()})`, '');
const outliers = [];
for (const sub of subs) {
  const group = rows.filter((r) => r.sub === sub);
  const med = median(group.map((r) => r.sizes[primary]));
  for (const r of group) {
    const delta = ((r.sizes[primary] - med) / med) * 100;
    if (delta <= -OUTLIER_BELOW_PCT) outliers.push(`| ${r.entry.id} | ${r.title} | ${sub} | ${kb(r.sizes[primary])} | ${kb(med)} | ${delta.toFixed(0)}% |`);
  }
}
out.push(
  ...(outliers.length
    ? ['| ID | Title | Subcategory | KB | Subcategory median KB | Delta |', '|---|---|---|:---:|:---:|:---:|', ...outliers]
    : ['None.']),
  '',
);

out.push('## Design elements not detected', '');
const missing = rows
  .map((r) => [r, Object.keys(SIGNALS).filter((k) => !r.signals[k])])
  .filter(([, list]) => list.length);
out.push(
  ...(missing.length
    ? ['| ID | Title | Not detected |', '|---|---|---|', ...missing.map(([r, list]) => `| ${r.entry.id} | ${r.title} | ${list.map((k) => SIGNAL_LABELS[k]).join(', ')} |`)]
    : ['Every prompt shows every signal.']),
  '',
);
const coverage = Object.keys(SIGNALS).map((k) => `${SIGNAL_LABELS[k]} ${rows.filter((r) => r.signals[k]).length}/${rows.length}`);
out.push(`Signal coverage: ${coverage.join(' · ')}.`, '');

if (!summaryOnly) {
  out.push('## All prompts', '');
  out.push(
    `| ID | Title | ${languages.map((c) => `${c.toUpperCase()} KB`).join(' | ')} | Headings | Numbered sections | Code blocks | Signals |`,
    `|---|---|${languages.map(() => ':---:|').join('')}:---:|:---:|:---:|:---:|`,
  );
  for (const r of rows) {
    const count = Object.values(r.signals).filter(Boolean).length;
    out.push(
      `| ${r.entry.id} | ${r.title} | ${languages.map((c) => kb(r.sizes[c])).join(' | ')} | ${r.m.headings.total} | ${r.m.numberedCount} | ${r.m.codeFences} | ${count}/${Object.keys(SIGNALS).length} |`,
    );
  }
  out.push('');
}

console.log(out.join('\n'));
