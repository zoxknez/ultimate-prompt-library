#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'site-src');
const SITE_URL = (process.env.SITE_URL || 'https://ultimate-prompt-library.vercel.app').replace(/\/$/, '');
const GITHUB_ROOT = 'https://github.com/zoxknez/ultimate-prompt-library/blob/main';

const catalog = JSON.parse(readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
const index = JSON.parse(readFileSync(path.join(ROOT, 'indexes/prompts.json'), 'utf8'));
const stats = JSON.parse(readFileSync(path.join(ROOT, 'indexes/stats.json'), 'utf8'));

const L = {
  en: {
    prompts: 'Prompts', categories: 'Categories', github: 'GitHub', search: 'Search prompts',
    allCategories: 'All categories', allSubcategories: 'All subcategories', results: 'results', copy: 'Copy prompt',
    copyLink: 'Copy link', source: 'View source', language: 'Language', version: 'Version', status: 'Status',
    category: 'Category', subcategory: 'Subcategory', toc: 'On this page', previous: 'Previous', next: 'Next',
    libraryTitle: 'Prompt Library',
    libraryLead: 'Search and filter every published prompt. Open a prompt, copy it in one click, or switch language without losing your place.',
    heroKicker: 'Professional AI prompts for real work', heroTitle: 'Better prompts. Better work.',
    heroLead: 'A curated open-source library of deep, production-grade prompts for IT, business and real-world professional workflows.',
    explore: 'Explore all prompts', browseIt: 'Explore IT Collection', browseBiz: 'Explore Business Collection',
    unique: 'Unique prompts', localized: 'Localized files', languages: 'Languages', stable: 'Stable prompts',
    complete: 'Complete', inProgress: 'In progress', published: 'published',
    whyTitle: 'Built for serious work', footer: 'Open source. Bilingual. Model agnostic. Designed for repeatable results.',
    noResults: 'No prompts match these filters.', reset: 'Reset filters',
  },
  sr: {
    prompts: 'Promptovi', categories: 'Oblasti', github: 'GitHub', search: 'Pretraži promptove',
    allCategories: 'Sve oblasti', allSubcategories: 'Sve podkategorije', results: 'rezultata', copy: 'Kopiraj prompt',
    copyLink: 'Kopiraj link', source: 'Otvori izvor', language: 'Jezik', version: 'Verzija', status: 'Status',
    category: 'Oblast', subcategory: 'Podkategorija', toc: 'Na ovoj stranici', previous: 'Prethodni', next: 'Sledeći',
    libraryTitle: 'Biblioteka promptova',
    libraryLead: 'Pretraži i filtriraj svaki objavljeni prompt. Otvori prompt, kopiraj ga jednim klikom ili promeni jezik bez gubitka pozicije.',
    heroKicker: 'Profesionalni AI promptovi za stvaran rad', heroTitle: 'Bolji promptovi. Bolji rad.',
    heroLead: 'Kurirana open-source biblioteka dubokih, production-grade promptova za IT, poslovanje i profesionalne tokove rada.',
    explore: 'Pregledaj sve promptove', browseIt: 'Pregledaj IT kolekciju', browseBiz: 'Pregledaj Business kolekciju',
    unique: 'Jedinstvenih promptova', localized: 'Lokalizovanih fajlova', languages: 'Jezika', stable: 'Stabilnih promptova',
    complete: 'Završeno', inProgress: 'U toku', published: 'objavljeno',
    whyTitle: 'Napravljeno za ozbiljan rad', footer: 'Open source. Dvojezično. Nezavisno od modela. Napravljeno za ponovljive rezultate.',
    noResults: 'Nijedan prompt ne odgovara filterima.', reset: 'Resetuj filtere',
  },
};

const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const slugify = (value) => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const promptUrl = (lang, p) => `/prompts/${lang}/${p.id.toLowerCase()}-${p.slug}/`;
const libraryUrl = (lang) => lang === 'sr' ? '/sr/prompts/' : '/prompts/';
const absUrl = (url) => `${SITE_URL}${url}`;

function parsePromptFile(filePath) {
  const source = readFileSync(path.join(ROOT, filePath), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source.trim() };
  return { frontmatter: YAML.parse(match[1]) || {}, body: match[2].trim() };
}

function inlineMarkdown(input) {
  let s = esc(input);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+|\.\.\/[^)]+|\.\/[^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function renderTable(lines) {
  const rows = lines.map((line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => inlineMarkdown(cell.trim())));
  const header = rows[0] || [];
  const body = rows.slice(2);
  return `<div class="table-wrap"><table><thead><tr>${header.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const out = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const tag = listType === 'ol' ? 'ol' : 'ul';
    out.push(`<${tag}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${tag}>`);
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      const lang = line.slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      out.push(`<div class="code-block"><div class="code-meta"><span>${esc(lang || 'text')}</span><button type="button" data-copy-code>Copy</button></div><pre><code>${esc(code.join('\n'))}</code></pre></div>`);
      continue;
    }

    const tableDivider = i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1]) && line.includes('|');
    if (tableDivider) {
      flushParagraph();
      flushList();
      const table = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        table.push(lines[i]);
        i += 1;
      }
      i -= 1;
      out.push(renderTable(table));
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].replace(/#+$/, '').trim();
      const id = slugify(text);
      out.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    const ul = line.match(/^\s*[-*+]\s+(.+)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushParagraph();
      const type = ul ? 'ul' : 'ol';
      if (listType && listType !== type) flushList();
      listType = type;
      listItems.push((ul || ol)[1]);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      const quote = [line.replace(/^>\s?/, '')];
      while (i + 1 < lines.length && /^>\s?/.test(lines[i + 1])) {
        i += 1;
        quote.push(lines[i].replace(/^>\s?/, ''));
      }
      out.push(`<blockquote>${quote.map(inlineMarkdown).join('<br>')}</blockquote>`);
      continue;
    }

    if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      flushParagraph();
      flushList();
      out.push('<hr>');
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return out.join('\n');
}

function getToc(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter(Boolean)
    .map((m) => ({ level: m[1].length, title: m[2].trim(), id: slugify(m[2].trim()) }));
}

const categoryById = new Map(catalog.categories.map((c) => [c.id, c]));

const prompts = index.prompts.map((p) => {
  const category = categoryById.get(p.categoryId);
  const sub = category?.subcategories.find((s) => s.id === p.subcategory);
  return { ...p, categoryData: category, subcategoryData: sub };
});

function brandMark() {
  return '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M7 11c8-3 14 0 17 5v23c-5-4-11-6-17-3V11Zm34 0c-8-3-14 0-17 5v23c5-4 11-6 17-3V11Z"/><path d="M24 16v23"/></svg></span>';
}

function header(lang = 'en') {
  const t = L[lang];
  return `<header class="site-header"><div class="shell nav-shell"><a class="brand" href="${lang === 'sr' ? '/sr/' : '/'}">${brandMark()}<span><strong>Ultimate Prompt Library</strong><small>Professional prompts for real work</small></span></a><nav aria-label="Primary"><a href="${libraryUrl(lang)}">${t.prompts}</a><a href="${lang === 'sr' ? '/sr/#categories' : '/#categories'}">${t.categories}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">${t.github}</a></nav><div class="lang-switch"><a class="${lang === 'en' ? 'active' : ''}" href="/">EN</a><a class="${lang === 'sr' ? 'active' : ''}" href="/sr/">SR</a></div></div></header>`;
}

function footer(lang = 'en') {
  return `<footer><div class="shell footer-shell"><div>${brandMark()}<div><strong>Ultimate Prompt Library</strong><p>${L[lang].footer}</p></div></div><div class="footer-links"><a href="${libraryUrl(lang)}">${L[lang].prompts}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">GitHub</a><a href="https://github.com/zoxknez/ultimate-prompt-library/blob/main/LICENSE">MIT License</a></div></div></footer>`;
}

function pageShell({ lang = 'en', title, description, body, canonical = '/', bodyClass = '' }) {
  const safeTitle = title === 'Ultimate Prompt Library' ? title : `${title} | Ultimate Prompt Library`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(safeTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${absUrl(canonical)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(safeTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absUrl(canonical)}"><meta name="theme-color" content="#ffffff"><link rel="stylesheet" href="/assets/site.css"><link rel="manifest" href="/site.webmanifest"></head><body class="${bodyClass}">${header(lang)}<main>${body}</main>${footer(lang)}<script src="/assets/site.js" defer></script></body></html>`;
}

function statCard(value, label, note, tone = 'blue') {
  return `<div class="metric ${tone}"><strong>${esc(value)}</strong><span>${esc(label)}</span><small>${esc(note)}</small></div>`;
}

function collectionCard({ lang, category, count, planned, tone }) {
  const t = L[lang];
  const pct = Math.round((count / planned) * 100);
  const isComplete = count === planned;
  const href = `${libraryUrl(lang)}?category=${encodeURIComponent(category.id)}`;
  return `<article class="collection-card ${tone}"><div class="collection-top"><span class="collection-kicker">${esc(category.names[lang])}</span><span class="collection-status">${count}/${planned} · ${isComplete ? t.complete : t.inProgress}</span></div><h3>${esc(category.descriptions[lang])}</h3><div class="progress"><span style="width:${pct}%"></span></div><div class="chip-row">${category.subcategories.slice(0, 7).map((s) => `<span>${esc(s.names[lang])}</span>`).join('')}<span>+${Math.max(0, category.subcategories.length - 7)}</span></div><a class="button ${tone === 'gold' ? 'gold' : ''}" href="${href}">${category.id === 'UPL-IT' ? t.browseIt : t.browseBiz}<span>→</span></a></article>`;
}

function renderHome(lang = 'en') {
  const t = L[lang];
  const it = categoryById.get('UPL-IT');
  const biz = categoryById.get('UPL-BIZ');
  const itStats = stats.collections.IT;
  const bizStats = stats.collections.BIZ;

  const body = `<section class="hero"><div class="shell hero-grid"><div class="hero-copy"><span class="eyebrow">${esc(t.heroKicker)}</span><h1>${esc(t.heroTitle)}</h1><p>${esc(t.heroLead)}</p><div class="hero-actions"><a class="button" href="${libraryUrl(lang)}">${t.explore}<span>→</span></a><a class="text-link" href="https://github.com/zoxknez/ultimate-prompt-library">View on GitHub</a></div><div class="trust-row"><span>Evidence-first</span><span>EN + SR</span><span>Open source</span><span>MIT</span></div></div><div class="hero-visual" aria-label="Prompt library preview"><div class="workspace-card main-card"><div class="workspace-head"><span></span><span></span><span></span></div><div class="workspace-label">UPL-IT-001</div><h2>Forensic Full Repository Audit</h2><p>Scope · evidence · severity · failure modes · verification</p><div class="workspace-lines"><i></i><i></i><i></i><i></i></div></div><div class="floating-card fc-blue"><b>IT</b><span>${itStats.available}/100</span></div><div class="floating-card fc-gold"><b>Business</b><span>${bizStats.available}/100</span></div></div></div></section>
  <section class="metrics-section"><div class="shell metrics-grid">${statCard(stats.uniquePrompts, t.unique, 'Production-grade', 'blue')}${statCard(stats.localizedPromptFiles, t.localized, 'EN + SR', 'green')}${statCard(stats.byStatus.stable, t.stable, 'Reviewed and versioned', 'blue')}${statCard(stats.languages, t.languages, 'English + Srpski', 'gold')}</div></section>
  <section class="shell section"><div class="section-head"><span class="eyebrow">Collections</span><h2>Two collections. One consistent standard.</h2><p>Every published prompt follows the same permanent ID, versioning and bilingual structure.</p></div><div class="collections-grid">${collectionCard({ lang, category: it, count: itStats.available, planned: itStats.planned, tone: 'blue' })}${collectionCard({ lang, category: biz, count: bizStats.available, planned: bizStats.planned, tone: 'gold' })}</div></section>
  <section class="search-cta"><div class="shell search-cta-inner"><div><span class="eyebrow">Find the right prompt</span><h2>${t.search}</h2><p>${t.libraryLead}</p></div><a class="button" href="${libraryUrl(lang)}">${t.explore}<span>→</span></a></div></section>
  <section class="shell section" id="categories"><div class="section-head"><span class="eyebrow">${t.categories}</span><h2>Built to grow without becoming messy.</h2><p>Permanent category namespaces keep every prompt predictable even as the library expands.</p></div><div class="category-grid">${catalog.categories.map((c) => { const count = prompts.filter((p) => p.categoryId === c.id).length; const roadmap = lang === 'sr' ? 'docs/roadmap.sr.md' : 'docs/roadmap.md'; return `<a class="category-card ${count ? 'active' : ''}" href="${count ? `${libraryUrl(lang)}?category=${encodeURIComponent(c.id)}` : `https://github.com/zoxknez/ultimate-prompt-library/blob/main/${roadmap}`}"><span>${String(c.order).padStart(2, '0')}</span><h3>${esc(c.names[lang])}</h3><p>${esc(c.descriptions[lang])}</p><strong>${count ? `${count} ${t.published}` : 'Planned'}</strong></a>`; }).join('')}</div></section>
  <section class="why"><div class="shell"><div class="section-head"><span class="eyebrow">Quality standard</span><h2>${t.whyTitle}</h2></div><div class="why-grid"><div><b>01</b><h3>Deep over generic</h3><p>Prompts define the problem, scope and expected evidence instead of relying on vague one-line instructions.</p></div><div><b>02</b><h3>Evidence over assumptions</h3><p>Audit-style prompts separate confirmed findings, uncertainty and hardening recommendations.</p></div><div><b>03</b><h3>Production ready</h3><p>Failure modes, real constraints, verification and concrete output formats are part of the prompt itself.</p></div><div><b>04</b><h3>Bilingual by design</h3><p>English and Serbian versions share the same ID, slug, version and logical structure.</p></div></div></div></section>`;

  return pageShell({ lang, title: 'Ultimate Prompt Library', description: t.heroLead, body, canonical: lang === 'sr' ? '/sr/' : '/' });
}

function promptCard(p, lang = 'en') {
  const title = p.titles?.[lang] || p.titles?.en || p.slug;
  const cat = p.categoryData?.names?.[lang] || p.categoryId;
  const sub = p.subcategoryData?.names?.[lang] || p.subcategory;
  const search = `${p.id} ${title} ${cat} ${sub} ${p.slug}`.toLowerCase();

  return `<article class="prompt-card" data-prompt-card data-search="${esc(search)}" data-category="${esc(p.categoryId)}" data-subcategory="${esc(p.subcategory)}"><div class="prompt-card-top"><span class="prompt-id">${esc(p.id)}</span><span class="status-dot">stable</span></div><h3><a href="${promptUrl(lang, p)}">${esc(title)}</a></h3><p>${esc(cat)}</p><div class="prompt-meta"><span>${esc(sub)}</span><span>v${esc(p.version)}</span></div><div class="prompt-card-actions"><a href="${promptUrl('en', p)}">EN</a><a href="${promptUrl('sr', p)}">SR</a><a class="open-link" href="${promptUrl(lang, p)}">Open →</a></div></article>`;
}

function renderLibrary(lang = 'en') {
  const t = L[lang];
  const categoryOptions = catalog.categories
    .filter((c) => prompts.some((p) => p.categoryId === c.id))
    .map((c) => `<option value="${esc(c.id)}">${esc(c.names[lang])}</option>`)
    .join('');

  const subOptions = catalog.categories
    .flatMap((c) => c.subcategories.map((s) => ({ ...s, categoryId: c.id })))
    .filter((s) => prompts.some((p) => p.subcategory === s.id))
    .map((s) => `<option value="${esc(s.id)}" data-parent="${esc(s.categoryId)}">${esc(s.names[lang])}</option>`)
    .join('');

  const body = `<section class="library-hero"><div class="shell"><span class="eyebrow">${stats.uniquePrompts} published prompts</span><h1>${t.libraryTitle}</h1><p>${t.libraryLead}</p></div></section><section class="shell library-shell"><div class="filter-bar"><label class="search-box"><span>⌕</span><input id="prompt-search" type="search" placeholder="${esc(t.search)}" autocomplete="off"></label><select id="category-filter" aria-label="${esc(t.category)}"><option value="">${esc(t.allCategories)}</option>${categoryOptions}</select><select id="subcategory-filter" aria-label="${esc(t.subcategory)}"><option value="">${esc(t.allSubcategories)}</option>${subOptions}</select><button id="reset-filters" type="button">${esc(t.reset)}</button></div><div class="results-line"><strong id="result-count">${prompts.length}</strong> ${esc(t.results)}</div><div class="prompt-grid" id="prompt-grid">${prompts.map((p) => promptCard(p, lang)).join('')}</div><div class="empty-state" id="empty-state" hidden><h2>${esc(t.noResults)}</h2><button type="button" data-reset>${esc(t.reset)}</button></div></section>`;

  return pageShell({ lang, title: t.libraryTitle, description: t.libraryLead, body, canonical: libraryUrl(lang), bodyClass: 'library-page' });
}

function renderPromptPage(p, lang) {
  const t = L[lang];
  const file = p.files?.[lang];
  const parsed = parsePromptFile(file);
  const title = p.titles?.[lang] || p.titles?.en || p.slug;
  const cat = p.categoryData?.names?.[lang] || p.categoryId;
  const sub = p.subcategoryData?.names?.[lang] || p.subcategory;
  const toc = getToc(parsed.body);
  const sameCategory = prompts.filter((item) => item.categoryId === p.categoryId).sort((a, b) => a.number - b.number);
  const idx = sameCategory.findIndex((item) => item.id === p.id);
  const prev = idx > 0 ? sameCategory[idx - 1] : null;
  const next = idx >= 0 && idx < sameCategory.length - 1 ? sameCategory[idx + 1] : null;
  const rawJson = JSON.stringify(parsed.body).replace(/</g, '\\u003c');

  const body = `<section class="prompt-hero"><div class="shell"><nav class="breadcrumbs"><a href="${libraryUrl(lang)}">${t.prompts}</a><span>/</span><a href="${libraryUrl(lang)}?category=${encodeURIComponent(p.categoryId)}">${esc(cat)}</a><span>/</span><span>${esc(p.id)}</span></nav><div class="prompt-title-row"><div><span class="eyebrow">${esc(p.id)} · ${esc(sub)}</span><h1>${esc(title)}</h1><p>${esc(cat)}</p></div><div class="prompt-actions"><button class="button" type="button" data-copy-prompt>${t.copy}</button><button class="secondary-button" type="button" data-copy-link>${t.copyLink}</button></div></div></div></section><section class="shell prompt-layout"><aside class="prompt-sidebar"><div class="side-card"><dl><div><dt>${t.status}</dt><dd>stable</dd></div><div><dt>${t.version}</dt><dd>v${esc(p.version)}</dd></div><div><dt>${t.language}</dt><dd><a class="${lang === 'en' ? 'active-lang' : ''}" href="${promptUrl('en', p)}">EN</a> <a class="${lang === 'sr' ? 'active-lang' : ''}" href="${promptUrl('sr', p)}">SR</a></dd></div></dl><a class="source-link" href="${GITHUB_ROOT}/${file}">${t.source} →</a></div>${toc.length ? `<div class="toc"><strong>${t.toc}</strong>${toc.map((item) => `<a class="toc-${item.level}" href="#${item.id}">${esc(item.title)}</a>`).join('')}</div>` : ''}</aside><article class="markdown-body">${renderMarkdown(parsed.body)}</article></section><section class="shell prev-next">${prev ? `<a href="${promptUrl(lang, prev)}"><small>${t.previous}</small><strong>${esc(prev.titles?.[lang] || prev.titles?.en)}</strong></a>` : '<span></span>'}${next ? `<a class="next-link" href="${promptUrl(lang, next)}"><small>${t.next}</small><strong>${esc(next.titles?.[lang] || next.titles?.en)}</strong></a>` : ''}</section><script id="raw-prompt" type="application/json">${rawJson}</script>`;

  const description = `${p.id}: ${title}. ${cat} - ${sub}.`;
  return pageShell({ lang, title, description, body, canonical: promptUrl(lang, p), bodyClass: 'prompt-page' });
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  ensureDir(path.dirname(file));
  writeFileSync(file, content);
}

rmSync(OUT, { recursive: true, force: true });
ensureDir(OUT);

if (!existsSync(SRC)) {
  throw new Error('site-src/ is missing');
}

cpSync(SRC, path.join(OUT, 'assets'), { recursive: true });

write('index.html', renderHome('en'));
write('sr/index.html', renderHome('sr'));
write('prompts/index.html', renderLibrary('en'));
write('sr/prompts/index.html', renderLibrary('sr'));

for (const p of prompts) {
  for (const lang of ['en', 'sr']) {
    if (!p.files?.[lang]) continue;
    write(path.join('prompts', lang, `${p.id.toLowerCase()}-${p.slug}`, 'index.html'), renderPromptPage(p, lang));
  }
}

const sitemapUrls = [
  '/',
  '/prompts/',
  '/sr/',
  '/sr/prompts/',
  ...prompts.flatMap((p) => ['en', 'sr'].filter((lang) => p.files?.[lang]).map((lang) => promptUrl(lang, p))),
];

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map((url) => `<url><loc>${absUrl(url)}</loc></url>`).join('')}</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('site.webmanifest', JSON.stringify({
  name: 'Ultimate Prompt Library',
  short_name: 'UPL',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#102a43',
}, null, 2));

write('404.html', pageShell({
  title: 'Not found',
  description: 'Page not found',
  canonical: '/404',
  body: '<section class="not-found shell"><span class="eyebrow">404</span><h1>Page not found</h1><p>The prompt or page you requested does not exist.</p><a class="button" href="/prompts/">Browse prompts →</a></section>',
}));

console.log(`Generated website: ${stats.uniquePrompts} prompts, ${stats.localizedPromptFiles} localized files, ${sitemapUrls.length} indexed URLs.`);
