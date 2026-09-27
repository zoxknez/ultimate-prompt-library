#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { enhancePrompt } from './lib/v2-quality.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'site-src');
const SITE_URL = (process.env.SITE_URL || 'https://ultimate-prompt-library.vercel.app').replace(/\/$/, '');
const GITHUB_ROOT = 'https://github.com/zoxknez/ultimate-prompt-library/blob/main';

const catalog = JSON.parse(readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
const index = JSON.parse(readFileSync(path.join(ROOT, 'indexes/prompts.json'), 'utf8'));
const stats = JSON.parse(readFileSync(path.join(ROOT, 'indexes/stats.json'), 'utf8'));

const L = {
  en: {
    prompts: 'Prompts', categories: 'Categories', github: 'GitHub', search: 'Search prompts', allSubcategories: 'All subcategories', results: 'results', copy: 'Copy prompt',
    copyLink: 'Copy link', source: 'View source', language: 'Language', version: 'Version', status: 'Status', toc: 'On this page', previous: 'Previous', next: 'Next',
    libraryTitle: 'Prompt Library',
    libraryLead: 'Find the right prompt, refine by category, and open it in your preferred language.',
    libraryHeroKicker: 'UPL / PROMPT INDEX', libraryHeroSignal: 'Find. Refine. Put to work.',
    libraryKicker: 'Explore the library', librarySearchLabel: 'Search prompts by task, keyword, or tool',
    librarySearchHint: 'Search across prompt titles, categories, and practical workflows.',
    allPrompts: 'All prompts', browseCategories: 'Browse categories', categoryDrawerTitle: 'Choose a category',
    closeCategoryDrawer: 'Close categories', filterBySubcategory: 'Subcategory', sortLabel: 'Sort by',
    sortOriginal: 'Library order', sortTitle: 'Title A to Z', currentFilters: 'Active filters',
    showing: 'Showing', to: 'to', of: 'of', stableLabel: 'Stable', activeCategoriesLabel: 'active categories',
    paginationLabel: 'Prompt result pages', pageLabel: 'Page', currentPageLabel: 'current page', previousPage: 'Previous', nextPage: 'Next',
    readingTools: 'Reading controls', fontSmaller: 'Decrease text size', fontReset: 'Reset text size', fontLarger: 'Increase text size',
    lineSpacing: 'Comfortable spacing', focusMode: 'Focus reading', readingProgress: 'Reading progress', backToTop: 'Back to top', jumpToBottom: 'Jump to end',
    unique: 'Unique prompts', footer: 'Open source. Bilingual. Model agnostic. Designed for repeatable results.',
    noResults: 'No prompts match these filters.', reset: 'Reset filters',
    menu: 'Menu', skip: 'Skip to content', brandTag: 'Professional prompts for real work',
    primaryNav: 'Primary navigation', mobileNav: 'Mobile navigation',
    categoryNav: 'Browse categories', planned: 'Planned', openPrompt: 'Open prompt',
    supportProject: 'Support the project', supportLead: 'Choose a way to support',
  },
  sr: {
    prompts: 'Promptovi', categories: 'Oblasti', github: 'GitHub', search: 'Pretraži promptove', allSubcategories: 'Sve podkategorije', results: 'rezultata', copy: 'Kopiraj prompt',
    copyLink: 'Kopiraj link', source: 'Otvori izvor', language: 'Jezik', version: 'Verzija', status: 'Status', toc: 'Na ovoj stranici', previous: 'Prethodni', next: 'Sledeći',
    libraryTitle: 'Biblioteka promptova',
    libraryLead: 'Pronađi prompt, suzi izbor po oblasti i otvori ga na željenom jeziku.',
    libraryHeroKicker: 'UPL / INDEKS PROMPTOVA', libraryHeroSignal: 'Pronađi. Izdvoji. Primeni.',
    libraryKicker: 'Istraži biblioteku', librarySearchLabel: 'Pretraži promptove po zadatku, pojmu ili alatu',
    librarySearchHint: 'Pretraga obuhvata naslove promptova, oblasti i konkretne tokove rada.',
    allPrompts: 'Svi promptovi', browseCategories: 'Pregledaj oblasti', categoryDrawerTitle: 'Izaberi oblast',
    closeCategoryDrawer: 'Zatvori oblasti', filterBySubcategory: 'Podkategorija', sortLabel: 'Sortiraj',
    sortOriginal: 'Redosled u biblioteci', sortTitle: 'Naslov A do Š', currentFilters: 'Aktivni filteri',
    showing: 'Prikazano', to: 'do', of: 'od', stableLabel: 'Stabilan', activeCategoriesLabel: 'aktivne oblasti',
    paginationLabel: 'Stranice rezultata promptova', pageLabel: 'Strana', currentPageLabel: 'trenutna strana', previousPage: 'Prethodna', nextPage: 'Sledeća',
    readingTools: 'Kontrole čitanja', fontSmaller: 'Smanji veličinu teksta', fontReset: 'Vrati veličinu teksta', fontLarger: 'Povećaj veličinu teksta',
    lineSpacing: 'Veći prored', focusMode: 'Fokus čitanja', readingProgress: 'Napredak čitanja', backToTop: 'Idi na vrh stranice', jumpToBottom: 'Idi na kraj stranice',
    unique: 'Jedinstvenih promptova', footer: 'Open source. Dvojezično. Nezavisno od modela. Napravljeno za ponovljive rezultate.',
    noResults: 'Nijedan prompt ne odgovara filterima.', reset: 'Resetuj filtere',
    menu: 'Meni', skip: 'Pređi na sadržaj', brandTag: 'Profesionalni promptovi za stvaran rad',
    primaryNav: 'Glavna navigacija', mobileNav: 'Mobilna navigacija',
    categoryNav: 'Pregledaj oblasti', planned: 'Planirano', openPrompt: 'Otvori prompt',
    supportProject: 'Podrška projektu', supportLead: 'Izaberite način podrške',
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
  if (!match) {
    const enhanced = enhancePrompt({ data: {}, body: source.trim() });
    return { frontmatter: enhanced.data, body: enhanced.body };
  }
  const enhanced = enhancePrompt({ data: YAML.parse(match[1]) || {}, body: match[2].trim() });
  return { frontmatter: enhanced.data, body: enhanced.body };
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

const prompts = index.prompts.map((p, catalogIndex) => {
  const category = categoryById.get(p.categoryId);
  const sub = category?.subcategories.find((s) => s.id === p.subcategory);
  return { ...p, categoryData: category, subcategoryData: sub, catalogIndex };
});

function promptExcerpt(prompt, lang, maxLength = 190) {
  if (!prompt?.files?.[lang]) return '';
  const { body } = parsePromptFile(prompt.files[lang]);
  const firstParagraph = body.split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^#{1,6}\s/.test(block) && !/^(?:[*+-]|\d+\.)\s/.test(block) && !/^>/.test(block));
  const text = (firstParagraph || body)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  const boundary = text.lastIndexOf(' ', maxLength - 1);
  return `${text.slice(0, boundary > 100 ? boundary : maxLength).trim()}…`;
}

function brandMark() {
  return '<span class="brand-mark" aria-hidden="true"><img src="/assets/upl-mark.svg" alt=""></span>';
}

function header(lang = 'en', alternateEn = '/', alternateSr = '/sr/') {
  const t = L[lang];
  const categoriesUrl = `${libraryUrl(lang)}#categories`;
  const support = `<details class="support-menu"><summary><span class="support-heart">♡</span><span>${esc(t.supportProject)}</span><span class="support-chevron">⌄</span></summary><div class="support-popover"><span class="support-lead">${esc(t.supportLead)}</span><a href="https://www.paypal.com/paypalme/o0o0o0o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider paypal">P</span><strong>PayPal</strong><span>›</span></a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider kofi">☕</span><strong>Ko-fi</strong><span>›</span></a></div></details>`;
  return `<header class="site-header"><div class="shell nav-shell"><a class="brand" href="${lang === 'sr' ? '/sr/' : '/'}">${brandMark()}<span><strong>Ultimate Prompt Library</strong><small>${esc(t.brandTag)}</small></span></a><nav class="desktop-nav" aria-label="${esc(t.primaryNav)}"><a href="${libraryUrl(lang)}">${t.prompts}</a><a href="${categoriesUrl}">${t.categories}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">${t.github}</a></nav><div class="nav-actions">${support}<div class="lang-switch" aria-label="${esc(t.language)}"><a class="${lang === 'en' ? 'active' : ''}" href="${alternateEn}" lang="en">EN</a><a class="${lang === 'sr' ? 'active' : ''}" href="${alternateSr}" lang="sr">SR</a></div><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(t.menu)}"><span></span><span></span><span></span></button></div></div><nav class="mobile-menu" id="mobile-menu" aria-label="${esc(t.mobileNav)}" hidden><div class="shell"><a href="${libraryUrl(lang)}">${t.prompts}</a><a href="${categoriesUrl}">${t.categories}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">${t.github}</a><div class="mobile-support"><span>${esc(t.supportProject)}</span><a href="https://www.paypal.com/paypalme/o0o0o0o0o0o0o" target="_blank" rel="noopener noreferrer">PayPal</a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer">Ko-fi</a></div><div class="mobile-lang" aria-label="${esc(t.language)}"><a class="${lang === 'en' ? 'active' : ''}" href="${alternateEn}" lang="en">EN</a><a class="${lang === 'sr' ? 'active' : ''}" href="${alternateSr}" lang="sr">SR</a></div></div></nav></header>`;
}

function footer(lang = 'en') {
  return `<footer><div class="shell footer-shell"><div>${brandMark()}<div><strong>Ultimate Prompt Library</strong><p>${L[lang].footer}</p></div></div><div class="footer-links"><a href="${libraryUrl(lang)}">${L[lang].prompts}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">GitHub</a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer">${L[lang].supportProject}</a><a href="https://github.com/zoxknez/ultimate-prompt-library/blob/main/LICENSE">MIT License</a></div></div></footer>`;
}

function pageShell({ lang = 'en', title, description, body, canonical = '/', bodyClass = '', alternateEn = '/', alternateSr = '/sr/' }) {
  const safeTitle = title === 'Ultimate Prompt Library' ? title : `${title} | Ultimate Prompt Library`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(safeTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${absUrl(canonical)}"><link rel="alternate" hreflang="en" href="${absUrl(alternateEn)}"><link rel="alternate" hreflang="sr" href="${absUrl(alternateSr)}"><link rel="alternate" hreflang="x-default" href="${absUrl(alternateEn)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(safeTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absUrl(canonical)}"><meta name="theme-color" content="#ffffff"><link rel="icon" href="/assets/upl-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><link rel="manifest" href="/site.webmanifest"></head><body class="${bodyClass}"><a class="skip-link" href="#main-content">${esc(L[lang].skip)}</a>${header(lang, alternateEn, alternateSr)}<main id="main-content" class="site-main" tabindex="-1">${body}</main>${footer(lang)}<script src="/assets/site.js" defer></script><script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script></body></html>`;
}

function formatPromptCount(lang, count) {
  if (lang === 'sr') {
    const form = new Intl.PluralRules('sr').select(count);
    const word = { one: 'prompt', few: 'prompta', other: 'promptova' }[form] || 'promptova';
    return `${count} ${word}`;
  }
  return `${count} ${count === 1 ? 'prompt' : 'prompts'}`;
}

function renderCategoryNavigation(lang) {
  const t = L[lang];
  return catalog.categories.map((category) => {
    const count = prompts.filter((prompt) => prompt.categoryId === category.id).length;
    const order = String(category.order).padStart(2, '0');
    if (!count) {
      return `<div class="category-link planned" aria-disabled="true"><span class="category-order">${order}</span><span class="category-link-copy"><strong>${esc(category.names[lang])}</strong><small>${esc(t.planned)}</small></span><span class="category-status" aria-hidden="true">·</span></div>`;
    }
    return `<button type="button" class="category-link" data-category-shortcut="${esc(category.id)}" aria-pressed="false"><span class="category-order">${order}</span><span class="category-link-copy"><strong>${esc(category.names[lang])}</strong><small>${formatPromptCount(lang, count)}</small></span><span class="category-status" aria-hidden="true">↗</span></button>`;
  }).join('');
}

function promptCard(p, lang = 'en') {
  const title = p.titles?.[lang] || p.titles?.en || p.slug;
  const cat = p.categoryData?.names?.[lang] || p.categoryId;
  const sub = p.subcategoryData?.names?.[lang] || p.subcategory;
  const alternateLang = lang === 'en' ? 'sr' : 'en';
  const searchableText = [
    p.id, p.slug, p.titles?.en, p.titles?.sr,
    p.categoryData?.names?.en, p.categoryData?.names?.sr,
    p.subcategoryData?.names?.en, p.subcategoryData?.names?.sr,
    promptExcerpt(p, 'en', 600), promptExcerpt(p, 'sr', 600),
  ].filter(Boolean).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const hidden = p.catalogIndex >= 24 ? ' hidden' : '';
  const t = L[lang];

  return `<article class="prompt-card" data-prompt-card data-search="${esc(searchableText)}" data-title="${esc(title)}" data-category="${esc(p.categoryId)}" data-subcategory="${esc(p.subcategory)}"${hidden}><div class="prompt-card-top"><span class="prompt-id">${esc(p.id)}</span><span class="status-dot">${esc(t.stableLabel)}</span></div><div class="prompt-card-body"><h3><a href="${promptUrl(lang, p)}">${esc(title)}</a></h3><p class="prompt-excerpt">${esc(promptExcerpt(p, lang, 155))}</p><div class="prompt-category-meta"><span>${esc(cat)}</span><span aria-hidden="true">›</span><span>${esc(sub)}</span></div></div><div class="prompt-card-footer"><div class="prompt-card-languages" aria-label="${esc(t.language)}"><div class="language-links"><a href="${promptUrl('en', p)}" lang="en"${lang === 'en' ? ' aria-current="page"' : ''}>EN</a><a href="${promptUrl('sr', p)}" lang="sr"${lang === 'sr' ? ' aria-current="page"' : ''}>SR</a></div><span>v${esc(p.version)}</span></div><a class="open-link" href="${promptUrl(lang, p)}">${esc(t.openPrompt)} <span aria-hidden="true">↗</span></a></div></article>`;
}

function renderLibrary(lang = 'en', canonical = lang === 'sr' ? '/sr/' : '/') {
  const t = L[lang];
  const subOptions = catalog.categories
    .filter((category) => prompts.some((prompt) => prompt.categoryId === category.id))
    .flatMap((category) => category.subcategories.map((subcategory) => ({ ...subcategory, categoryId: category.id })))
    .filter((subcategory) => prompts.some((prompt) => prompt.subcategory === subcategory.id))
    .map((subcategory) => `<option value="${esc(subcategory.id)}" data-parent="${esc(subcategory.categoryId)}">${esc(subcategory.names[lang])}</option>`)
    .join('');
  const categoryNavigation = renderCategoryNavigation(lang);
  const promptCards = prompts.map((prompt) => promptCard(prompt, lang)).join('');
  const paginationAttrs = `aria-label="${esc(t.paginationLabel)}" data-page-label="${esc(t.pageLabel)}" data-current-page="${esc(t.currentPageLabel)}" data-previous="${esc(t.previousPage)}" data-next="${esc(t.nextPage)}"`;

  const body = `<section class="shell library-workspace" id="categories"><aside class="category-sidebar"><div class="category-sidebar-head"><span class="eyebrow">${esc(t.categoryNav)}</span><button type="button" data-reset>${esc(t.allPrompts)}</button></div><nav class="category-navigation" aria-label="${esc(t.categoryNav)}"><button type="button" class="category-link category-link-all" data-reset aria-pressed="true"><span class="category-order">⌘</span><span class="category-link-copy"><strong>${esc(t.allPrompts)}</strong><small>${formatPromptCount(lang, prompts.length)}</small></span><span class="category-status" aria-hidden="true">↗</span></button>${categoryNavigation}</nav></aside><section class="library-results" aria-labelledby="results-heading"><section class="library-intro" aria-labelledby="results-heading"><div class="library-intro-grid"><div class="library-intro-copy"><div class="library-eyebrow-row"><span class="eyebrow">${esc(t.libraryHeroKicker)}</span><span class="library-hero-signal">${esc(t.libraryHeroSignal)}</span></div><h1 id="results-heading">${esc(t.libraryTitle)}</h1><p>${esc(t.libraryLead)}</p></div><div class="library-index-panel" aria-label="${stats.uniquePrompts} ${esc(t.unique)}, ${stats.categoriesWithContent} ${esc(t.activeCategoriesLabel)}"><div class="library-index-top"><span>UPL / INDEX</span></div><div class="library-index-main"><strong>${stats.uniquePrompts}</strong><span>${esc(t.unique)}</span></div><div class="library-index-foot"><div><span>${esc(t.activeCategoriesLabel)}</span><strong>${stats.categoriesWithContent}<small> / ${catalog.categories.length}</small></strong></div></div></div></div></section><div class="catalog-controls"><div class="catalog-search-wrap"><label class="sr-only" for="prompt-search">${esc(t.librarySearchLabel)}</label><div class="catalog-search"><span aria-hidden="true">⌕</span><input id="prompt-search" type="search" placeholder="${esc(t.search)}" autocomplete="off"><kbd>/</kbd></div><p>${esc(t.librarySearchHint)}</p></div><button type="button" class="mobile-category-trigger" data-open-category-drawer aria-haspopup="dialog" aria-controls="category-drawer" aria-expanded="false"><span aria-hidden="true">☷</span><span id="mobile-category-label" data-default-label="${esc(t.browseCategories)}">${esc(t.browseCategories)}</span></button><label class="filter-select"><span>${esc(t.filterBySubcategory)}</span><select id="subcategory-filter"><option value="">${esc(t.allSubcategories)}</option>${subOptions}</select></label><label class="filter-select sort-select"><span>${esc(t.sortLabel)}</span><select id="sort-filter"><option value="original">${esc(t.sortOriginal)}</option><option value="title">${esc(t.sortTitle)}</option></select></label><button id="reset-filters" class="reset-filter-button" type="button">${esc(t.reset)}</button><div id="active-filters" class="active-filters" aria-label="${esc(t.currentFilters)}" hidden></div></div><div class="results-toolbar"><p class="results-line" aria-live="polite"><span><strong id="result-count">${prompts.length}</strong> ${esc(t.results)}</span><small id="result-range" data-showing="${esc(t.showing)}" data-to="${esc(t.to)}" data-of="${esc(t.of)}">${esc(t.showing)} ${Math.min(prompts.length, 24)} ${esc(t.to)} ${Math.min(prompts.length, 24)} ${esc(t.of)} ${prompts.length}</small></p><div class="pagination-slot pagination-top" data-pagination ${paginationAttrs}></div></div><div class="prompt-grid" id="prompt-grid">${promptCards}</div><div class="empty-state" id="empty-state" hidden><span aria-hidden="true">⌕</span><h2>${esc(t.noResults)}</h2><p>${esc(t.librarySearchHint)}</p><button type="button" data-reset>${esc(t.reset)}</button></div><div class="pagination-slot pagination-bottom" data-pagination ${paginationAttrs}></div></section></section><dialog id="category-drawer" class="category-drawer" aria-labelledby="category-drawer-title"><div class="category-drawer-head"><div><span class="eyebrow">${esc(t.libraryKicker)}</span><h2 id="category-drawer-title">${esc(t.categoryDrawerTitle)}</h2></div><button type="button" class="drawer-close" data-close-category-drawer aria-label="${esc(t.closeCategoryDrawer)}">×</button></div><nav class="category-navigation category-navigation-dialog" aria-label="${esc(t.categoryDrawerTitle)}"><button type="button" class="category-link category-link-all" data-reset aria-pressed="true"><span class="category-order">⌘</span><span class="category-link-copy"><strong>${esc(t.allPrompts)}</strong><small>${formatPromptCount(lang, prompts.length)}</small></span><span class="category-status" aria-hidden="true">↗</span></button>${categoryNavigation}</nav></dialog>`;

  return pageShell({ lang, title: t.libraryTitle, description: t.libraryLead, body, canonical, bodyClass: 'library-page', alternateEn: '/', alternateSr: '/sr/' });
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

  const promptIndex = p.id.split('-').at(-1) || String(p.number || '').padStart(3, '0');
  const body = `<section class="prompt-hero"><div class="shell prompt-hero-shell"><nav class="breadcrumbs" aria-label="${esc(t.prompts)}"><a href="${libraryUrl(lang)}">${t.prompts}</a><span aria-hidden="true">/</span><a href="${libraryUrl(lang)}?category=${encodeURIComponent(p.categoryId)}">${esc(cat)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.id)}</span></nav><div class="prompt-hero-layout"><div class="prompt-title-copy"><div class="prompt-hero-kicker"><span>${esc(t.libraryHeroKicker)}</span><span>${esc(p.id)} · ${esc(sub)}</span></div><h1>${esc(title)}</h1><p>${esc(cat)}</p><div class="prompt-hero-meta"><span>v${esc(p.version)}</span><span>${esc(t.stableLabel)}</span><span>${lang === 'sr' ? 'Srpski' : 'English'}</span></div></div><div class="prompt-hero-side"><div class="prompt-hero-stamp" aria-hidden="true"><div class="prompt-stamp-top"><span>UPL / PROMPT</span><span>NO. ${esc(promptIndex)}</span></div><strong>${esc(promptIndex)}</strong><div class="prompt-stamp-bottom"><span>${esc(p.id)}</span><span>${esc(sub)}</span></div></div><div class="prompt-actions"><button class="button prompt-copy-primary" type="button" data-copy-prompt>${esc(t.copy)}</button><button class="secondary-button prompt-copy-link" type="button" data-copy-link>${esc(t.copyLink)}</button></div></div></div></div></section><section class="shell prompt-layout"><aside class="prompt-sidebar"><div class="side-card"><dl><div><dt>${t.status}</dt><dd>${esc(t.stableLabel)}</dd></div><div><dt>${t.version}</dt><dd>v${esc(p.version)}</dd></div><div><dt>${t.language}</dt><dd><a class="${lang === 'en' ? 'active-lang' : ''}" href="${promptUrl('en', p)}">EN</a> <a class="${lang === 'sr' ? 'active-lang' : ''}" href="${promptUrl('sr', p)}">SR</a></dd></div></dl><a class="source-link" href="${GITHUB_ROOT}/${file}">${t.source} →</a></div>${toc.length ? `<nav class="toc" aria-label="${esc(t.toc)}"><strong>${t.toc}</strong>${toc.map((item) => `<a class="toc-${item.level}" data-toc-link href="#${item.id}">${esc(item.title)}</a>`).join('')}</nav>` : ''}</aside><article class="markdown-body" id="prompt-content"><div class="reading-tools" role="toolbar" aria-label="${esc(t.readingTools)}"><div class="reading-font-controls"><button type="button" class="reading-control" data-font-down aria-label="${esc(t.fontSmaller)}" title="${esc(t.fontSmaller)}">A−</button><button type="button" class="reading-control reading-font-reset" data-font-reset aria-label="${esc(t.fontReset)}" title="${esc(t.fontReset)}">Aa</button><button type="button" class="reading-control" data-font-up aria-label="${esc(t.fontLarger)}" title="${esc(t.fontLarger)}">A+</button></div><button type="button" class="reading-option" data-line-spacing aria-pressed="false">${esc(t.lineSpacing)}</button><button type="button" class="reading-option" data-focus-mode aria-pressed="false">${esc(t.focusMode)}</button></div>${renderMarkdown(parsed.body)}</article></section><aside class="reading-rail" aria-hidden="true" aria-label="${esc(t.readingTools)}"><div class="reading-progress-track" role="progressbar" aria-label="${esc(t.readingProgress)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-reading-progress><span></span></div><div class="reading-jump-controls"><button type="button" data-scroll-top tabindex="-1" aria-label="${esc(t.backToTop)}" title="${esc(t.backToTop)}">↑</button><button type="button" data-scroll-bottom tabindex="-1" aria-label="${esc(t.jumpToBottom)}" title="${esc(t.jumpToBottom)}">↓</button></div></aside><section class="shell prev-next">${prev ? `<a href="${promptUrl(lang, prev)}"><small>${t.previous}</small><strong>${esc(prev.titles?.[lang] || prev.titles?.en)}</strong></a>` : '<span></span>'}${next ? `<a class="next-link" href="${promptUrl(lang, next)}"><small>${t.next}</small><strong>${esc(next.titles?.[lang] || next.titles?.en)}</strong></a>` : ''}</section><script id="raw-prompt" type="application/json">${rawJson}</script>`;
  const description = `${p.id}: ${title}. ${cat} - ${sub}.`;
  return pageShell({ lang, title, description, body, canonical: promptUrl(lang, p), bodyClass: 'prompt-page', alternateEn: promptUrl('en', p), alternateSr: promptUrl('sr', p) });
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

write('index.html', renderLibrary('en'));
write('sr/index.html', renderLibrary('sr'));
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
  '/sr/',
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
