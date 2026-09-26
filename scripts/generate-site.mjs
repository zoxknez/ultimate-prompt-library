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
    heroKicker: 'The field guide', heroTitle: 'A better starting point for your next task.',
    heroLead: 'A curated, open-source library of production-ready prompts for technology, business, and the work that connects them.',
    homeSearchLabel: 'Search the prompt library', homeSearchPlaceholder: 'Search by task, tool, or keyword',
    homeSearchButton: 'Search', homeSearchHint: 'Try “security audit”, “financial analysis”, or a tool you use every day.',
    homeProof1: 'Built for practical work', homeProof2: 'English and Serbian', homeProof3: 'Open source', homeProof4: 'Evidence first',
    pathKicker: 'Choose your path', pathTitle: 'What are you working on?', pathLead: 'Start with the kind of work in front of you. Every shortcut below leads to prompts already in the library.',
    path1Title: 'Build and ship software', path1Lead: 'Plan, develop, and improve applications with a clearer process.',
    path2Title: 'Protect and operate systems', path2Lead: 'Review security, reliability, infrastructure, and technical risk.',
    path3Title: 'Understand the numbers', path3Lead: 'Turn financial records and business data into useful decisions.',
    path4Title: 'Plan and grow a business', path4Lead: 'Work through strategy, new ventures, and commercial decisions.',
    promptCountLabel: 'prompts', featuredKicker: 'Featured prompt', featuredTitle: 'A useful place to start', starterKicker: 'Recommended next steps',
    starterLead: 'A small, considered selection from the current library.', homeBrowseAll: 'Browse all prompts', homeOpenPrompt: 'Open prompt',
    pathCategory: 'Browse', directoryLead: 'Explore all ten permanent categories. New areas become available as prompts are added.',
    explore: 'Explore all prompts', browseIt: 'Explore IT Collection', browseBiz: 'Explore Business Collection',
    unique: 'Unique prompts', localized: 'Localized files', languages: 'Languages', stable: 'Stable prompts',
    complete: 'Complete', inProgress: 'In progress', published: 'published',
    whyTitle: 'Built for serious work', footer: 'Open source. Bilingual. Model agnostic. Designed for repeatable results.',
    noResults: 'No prompts match these filters.', reset: 'Reset filters',
    menu: 'Menu', closeMenu: 'Close menu', close: 'Close', skip: 'Skip to content', brandTag: 'Professional prompts for real work',
    primaryNav: 'Primary navigation', mobileNav: 'Mobile navigation', searchLabel: 'Search prompts, tasks, tools, or keywords',
    categoryNav: 'Browse categories', plannedCategory: 'Coming soon', loadMore: 'Load more prompts',
    collectionsKicker: 'Collections', collectionsTitle: 'Two collections. One consistent standard.',
    collectionsLead: 'Every published prompt follows the same permanent ID, versioning and bilingual structure.',
    findKicker: 'Find the right prompt', categoriesTitle: 'Built to grow without becoming messy.',
    categoriesLead: 'Permanent category namespaces keep every prompt predictable even as the library expands.',
    qualityKicker: 'Quality standard', planned: 'Planned', viewGithub: 'View on GitHub',
    quality1: 'Deep over generic', quality1Lead: 'Prompts define the problem, scope and expected evidence instead of relying on vague one-line instructions.',
    quality2: 'Evidence over assumptions', quality2Lead: 'Audit-style prompts separate confirmed findings, uncertainty and hardening recommendations.',
    quality3: 'Production ready', quality3Lead: 'Failure modes, real constraints, verification and concrete output formats are part of the prompt itself.',
    quality4: 'Bilingual by design', quality4Lead: 'English and Serbian versions share the same ID, slug, version and logical structure.',
    completeCollections: 'Complete collections', quickBrowse: 'Browse by subcategory', showAll: 'Show all prompts',
    collectionSummary: '200 production-ready prompts across two complete collections.', openPrompt: 'Open prompt',
    supportProject: 'Support the project', supportLead: 'Choose a way to support', supportTitle: 'Help the library keep growing', supportText: 'UPL is open source and free to use. If it saves you time or helps your work, you can support further development and new collections.',
  },
  sr: {
    prompts: 'Promptovi', categories: 'Oblasti', github: 'GitHub', search: 'Pretraži promptove',
    allCategories: 'Sve oblasti', allSubcategories: 'Sve podkategorije', results: 'rezultata', copy: 'Kopiraj prompt',
    copyLink: 'Kopiraj link', source: 'Otvori izvor', language: 'Jezik', version: 'Verzija', status: 'Status',
    category: 'Oblast', subcategory: 'Podkategorija', toc: 'Na ovoj stranici', previous: 'Prethodni', next: 'Sledeći',
    libraryTitle: 'Biblioteka promptova',
    libraryLead: 'Pretraži i filtriraj svaki objavljeni prompt. Otvori prompt, kopiraj ga jednim klikom ili promeni jezik bez gubitka pozicije.',
    heroKicker: 'Vodič kroz biblioteku', heroTitle: 'Pronađi bolji početak za sledeći zadatak.',
    heroLead: 'Kurirana open-source biblioteka promptova spremnih za stvaran rad u tehnologiji, poslovanju i oblastima koje ih povezuju.',
    homeSearchLabel: 'Pretraži biblioteku promptova', homeSearchPlaceholder: 'Pretraži po zadatku, alatu ili pojmu',
    homeSearchButton: 'Pretraži', homeSearchHint: 'Probaj „bezbednosni audit“, „finansijska analiza“ ili alat koji svakodnevno koristiš.',
    homeProof1: 'Za praktičan rad', homeProof2: 'Srpski i engleski', homeProof3: 'Otvorenog koda', homeProof4: 'Dokazi na prvom mestu',
    pathKicker: 'Izaberi oblast rada', pathTitle: 'Na čemu trenutno radiš?', pathLead: 'Počni od zadatka koji imaš pred sobom. Svaka prečica vodi do promptova koji već postoje u biblioteci.',
    path1Title: 'Razvij i isporuči softver', path1Lead: 'Jasnije planiraj, razvijaj i unapređuj aplikacije.',
    path2Title: 'Zaštiti i održavaj sisteme', path2Lead: 'Proveri bezbednost, pouzdanost, infrastrukturu i tehničke rizike.',
    path3Title: 'Razumi poslovne brojeve', path3Lead: 'Pretvori finansijske podatke i evidenciju u korisne odluke.',
    path4Title: 'Planiraj rast poslovanja', path4Lead: 'Razradi strategiju, nove poslovne modele i tržišne odluke.',
    promptCountLabel: 'promptova', featuredKicker: 'Izdvojeni prompt', featuredTitle: 'Dobar početak za ozbiljan rad', starterKicker: 'Preporučeni sledeći koraci',
    starterLead: 'Mali, pažljivo izabran izbor iz trenutne biblioteke.', homeBrowseAll: 'Pregledaj sve promptove', homeOpenPrompt: 'Otvori prompt',
    pathCategory: 'Pregledaj', directoryLead: 'Istraži svih deset stalnih oblasti. Nove postaju dostupne kada dodamo njihove promptove.',
    explore: 'Pregledaj sve promptove', browseIt: 'Pregledaj IT kolekciju', browseBiz: 'Pregledaj Business kolekciju',
    unique: 'Jedinstvenih promptova', localized: 'Lokalizovanih fajlova', languages: 'Jezika', stable: 'Stabilnih promptova',
    complete: 'Završeno', inProgress: 'U toku', published: 'objavljeno',
    whyTitle: 'Napravljeno za ozbiljan rad', footer: 'Open source. Dvojezično. Nezavisno od modela. Napravljeno za ponovljive rezultate.',
    noResults: 'Nijedan prompt ne odgovara filterima.', reset: 'Resetuj filtere',
    menu: 'Meni', closeMenu: 'Zatvori meni', close: 'Zatvori', skip: 'Pređi na sadržaj', brandTag: 'Profesionalni promptovi za stvaran rad',
    primaryNav: 'Glavna navigacija', mobileNav: 'Mobilna navigacija', searchLabel: 'Pretraži promptove, zadatke, alate ili ključne reči',
    categoryNav: 'Pregledaj oblasti', plannedCategory: 'Uskoro', loadMore: 'Učitaj još promptova',
    collectionsKicker: 'Kolekcije', collectionsTitle: 'Dve kolekcije. Jedan dosledan standard.',
    collectionsLead: 'Svaki objavljeni prompt prati isti trajni ID, verzionisanje i dvojezičnu strukturu.',
    findKicker: 'Pronađi pravi prompt', categoriesTitle: 'Napravljeno da raste bez haosa.',
    categoriesLead: 'Trajni namespace-i oblasti čuvaju svaki prompt predvidivim čak i kada biblioteka raste.',
    qualityKicker: 'Standard kvaliteta', planned: 'Planirano', viewGithub: 'Otvori na GitHub-u',
    quality1: 'Dubina umesto generike', quality1Lead: 'Promptovi definišu problem, obim i očekivane dokaze umesto nejasnih instrukcija od jedne rečenice.',
    quality2: 'Dokazi umesto pretpostavki', quality2Lead: 'Audit promptovi razdvajaju potvrđene nalaze, neizvesnost i hardening preporuke.',
    quality3: 'Spremno za stvaran rad', quality3Lead: 'Failure mode-ovi, realna ograničenja, verifikacija i konkretni output formati deo su samog prompta.',
    quality4: 'Dvojezično po dizajnu', quality4Lead: 'Engleska i srpska verzija dele isti ID, slug, verziju i logičku strukturu.',
    completeCollections: 'Završene kolekcije', quickBrowse: 'Pregled po podkategorijama', showAll: 'Prikaži sve promptove',
    collectionSummary: '200 production-ready promptova kroz dve kompletne kolekcije.', openPrompt: 'Otvori prompt',
    supportProject: 'Podrška projektu', supportLead: 'Izaberite način podrške', supportTitle: 'Pomozite da biblioteka nastavi da raste', supportText: 'UPL je open source i besplatan za korišćenje. Ako vam štedi vreme ili pomaže u radu, možete podržati dalji razvoj i nove kolekcije.',
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
const promptById = new Map(prompts.map((prompt) => [prompt.id, prompt]));

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
  const support = `<details class="support-menu"><summary><span class="support-heart">♡</span><span>${esc(t.supportProject)}</span><span class="support-chevron">⌄</span></summary><div class="support-popover"><span class="support-lead">${esc(t.supportLead)}</span><a href="https://www.paypal.com/paypalme/o0o0o0o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider paypal">P</span><strong>PayPal</strong><span>›</span></a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider kofi">☕</span><strong>Ko-fi</strong><span>›</span></a></div></details>`;
  return `<header class="site-header"><div class="shell nav-shell"><a class="brand" href="${lang === 'sr' ? '/sr/' : '/'}">${brandMark()}<span><strong>Ultimate Prompt Library</strong><small>${esc(t.brandTag)}</small></span></a><nav class="desktop-nav" aria-label="${esc(t.primaryNav)}"><a href="${libraryUrl(lang)}">${t.prompts}</a><a href="${lang === 'sr' ? '/sr/#categories' : '/#categories'}">${t.categories}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">${t.github}</a></nav><div class="nav-actions">${support}<div class="lang-switch" aria-label="${esc(t.language)}"><a class="${lang === 'en' ? 'active' : ''}" href="${alternateEn}" lang="en">EN</a><a class="${lang === 'sr' ? 'active' : ''}" href="${alternateSr}" lang="sr">SR</a></div><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(t.menu)}"><span></span><span></span><span></span></button></div></div><nav class="mobile-menu" id="mobile-menu" aria-label="${esc(t.mobileNav)}" hidden><div class="shell"><a href="${libraryUrl(lang)}">${t.prompts}</a><a href="${lang === 'sr' ? '/sr/#categories' : '/#categories'}">${t.categories}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">${t.github}</a><div class="mobile-support"><span>${esc(t.supportProject)}</span><a href="https://www.paypal.com/paypalme/o0o0o0o0o0o0o" target="_blank" rel="noopener noreferrer">PayPal</a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer">Ko-fi</a></div><div class="mobile-lang" aria-label="${esc(t.language)}"><a class="${lang === 'en' ? 'active' : ''}" href="${alternateEn}" lang="en">EN</a><a class="${lang === 'sr' ? 'active' : ''}" href="${alternateSr}" lang="sr">SR</a></div></div></nav></header>`;
}

function footer(lang = 'en') {
  return `<footer><div class="shell footer-shell"><div>${brandMark()}<div><strong>Ultimate Prompt Library</strong><p>${L[lang].footer}</p></div></div><div class="footer-links"><a href="${libraryUrl(lang)}">${L[lang].prompts}</a><a href="https://github.com/zoxknez/ultimate-prompt-library">GitHub</a><a href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer">${L[lang].supportProject}</a><a href="https://github.com/zoxknez/ultimate-prompt-library/blob/main/LICENSE">MIT License</a></div></div></footer>`;
}

function pageShell({ lang = 'en', title, description, body, canonical = '/', bodyClass = '', alternateEn = '/', alternateSr = '/sr/' }) {
  const safeTitle = title === 'Ultimate Prompt Library' ? title : `${title} | Ultimate Prompt Library`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(safeTitle)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${absUrl(canonical)}"><link rel="alternate" hreflang="en" href="${absUrl(alternateEn)}"><link rel="alternate" hreflang="sr" href="${absUrl(alternateSr)}"><link rel="alternate" hreflang="x-default" href="${absUrl(alternateEn)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(safeTitle)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absUrl(canonical)}"><meta name="theme-color" content="#ffffff"><link rel="icon" href="/assets/upl-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><link rel="manifest" href="/site.webmanifest"></head><body class="${bodyClass}"><a class="skip-link" href="#main-content">${esc(L[lang].skip)}</a>${header(lang, alternateEn, alternateSr)}<main id="main-content" class="site-main" tabindex="-1">${body}</main>${footer(lang)}<script src="/assets/site.js" defer></script><script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script><script defer src="/_vercel/insights/script.js"></script></body></html>`;
}

function renderHomePath(lang, path) {
  const t = L[lang];
  const ids = path.subcategories
    .map((id) => catalog.categories.map((category) => ({ category, subcategory: category.subcategories.find((sub) => sub.id === id) })).find((item) => item.subcategory))
    .filter(Boolean);
  const count = prompts.filter((prompt) => path.subcategories.includes(prompt.subcategory)).length;
  const first = ids[0];
  const href = first ? `${libraryUrl(lang)}?category=${encodeURIComponent(first.category.id)}&subcategory=${encodeURIComponent(first.subcategory.id)}` : libraryUrl(lang);
  return `<article class="path-card path-card-${path.tone}"><div class="path-card-top"><span class="path-icon" aria-hidden="true">${path.icon}</span><span class="path-count">${count} ${esc(t.promptCountLabel)}</span></div><h3>${esc(t[path.title])}</h3><p>${esc(t[path.lead])}</p><div class="path-chip-list">${ids.map(({ category, subcategory }) => `<a href="${libraryUrl(lang)}?category=${encodeURIComponent(category.id)}&subcategory=${encodeURIComponent(subcategory.id)}">${esc(subcategory.names[lang])}</a>`).join('')}</div><a class="path-link" href="${href}">${esc(t.pathCategory)} <span aria-hidden="true">↗</span></a></article>`;
}

function renderFeaturedPrompt(lang, prompt) {
  const t = L[lang];
  if (!prompt) return '';
  const title = prompt.titles?.[lang] || prompt.titles?.en || prompt.slug;
  const category = prompt.categoryData?.names?.[lang] || prompt.categoryId;
  const subcategory = prompt.subcategoryData?.names?.[lang] || prompt.subcategory;
  const href = promptUrl(lang, prompt);
  return `<article class="featured-prompt"><div class="featured-content"><div class="featured-meta"><span class="prompt-id">${esc(prompt.id)}</span><span>${esc(category)} · ${esc(subcategory)}</span></div><h3><a href="${href}">${esc(title)}</a></h3><p>${esc(promptExcerpt(prompt, lang, 245))}</p><div class="featured-detail"><span aria-hidden="true">✳</span>${esc(lang === 'sr' ? 'Obim, dokazi, rizici i jasni naredni koraci' : 'Scope, evidence, risks, and clear next steps')}</div><div class="featured-actions"><a class="button" href="${href}">${esc(t.homeOpenPrompt)} <span aria-hidden="true">↗</span></a><a class="text-link" href="${promptUrl(lang === 'sr' ? 'en' : 'sr', prompt)}" lang="${lang === 'sr' ? 'en' : 'sr'}">${lang === 'sr' ? 'EN' : 'SR'}</a></div></div><div class="featured-art" aria-hidden="true"><div class="featured-art-window"><span></span><span></span><span></span><i></i><i></i><i></i><b>UPL</b></div><span class="featured-art-badge">${esc(prompt.id)}</span></div></article>`;
}

function renderRecommendedPrompt(lang, prompt, order) {
  const t = L[lang];
  if (!prompt) return '';
  const title = prompt.titles?.[lang] || prompt.titles?.en || prompt.slug;
  const category = prompt.categoryData?.names?.[lang] || prompt.categoryId;
  return `<li class="recommendation"><span class="recommendation-number">${String(order).padStart(2, '0')}</span><div class="recommendation-copy"><span class="prompt-id">${esc(prompt.id)} · ${esc(category)}</span><a href="${promptUrl(lang, prompt)}">${esc(title)}</a></div><a class="recommendation-open" href="${promptUrl(lang, prompt)}" aria-label="${esc(t.homeOpenPrompt)}: ${esc(title)}">↗</a></li>`;
}

function renderHome(lang = 'en') {
  const t = L[lang];
  const promptPaths = [
    { title: 'path1Title', lead: 'path1Lead', tone: 'blue', subcategories: ['web-development', 'mobile-development', 'backend-api'], icon: '<svg viewBox="0 0 32 32"><path d="m11 9-7 7 7 7M21 9l7 7-7 7M19 5l-6 22"/></svg>' },
    { title: 'path2Title', lead: 'path2Lead', tone: 'mint', subcategories: ['cybersecurity', 'devops-cloud-infrastructure', 'testing-qa-reliability'], icon: '<svg viewBox="0 0 32 32"><path d="M16 3 27 7v8c0 7-4.7 11.5-11 14-6.3-2.5-11-7-11-14V7z"/><path d="m11 16 3.2 3.2L21 12"/></svg>' },
    { title: 'path3Title', lead: 'path3Lead', tone: 'gold', subcategories: ['databases-data-engineering', 'financial-analysis-corporate-finance', 'accounting-reporting-financial-control'], icon: '<svg viewBox="0 0 32 32"><path d="M5 25V15M13 25V8M21 25v-6M29 25V4"/><path d="M3 28h28"/></svg>' },
    { title: 'path4Title', lead: 'path4Lead', tone: 'rose', subcategories: ['business-strategy-competitive-analysis', 'entrepreneurship-business-models', 'sales-revenue-pricing'], icon: '<svg viewBox="0 0 32 32"><rect x="4" y="9" width="24" height="18" rx="3"/><path d="M12 9V6h8v3M4 16h24M13 16v3h6v-3"/></svg>' },
  ];
  const activeCategories = catalog.categories.filter((category) => prompts.some((prompt) => prompt.categoryId === category.id));
  const featured = promptById.get('UPL-IT-001');
  const recommended = ['UPL-BIZ-001', 'UPL-IT-002'].map((id) => promptById.get(id)).filter(Boolean);
  const roadmap = lang === 'sr' ? 'docs/roadmap.sr.md' : 'docs/roadmap.md';
  const pathCards = promptPaths.map((path) => renderHomePath(lang, path)).join('');
  const categoryCards = catalog.categories.map((category) => {
    const count = prompts.filter((prompt) => prompt.categoryId === category.id).length;
    const href = count
      ? `${libraryUrl(lang)}?category=${encodeURIComponent(category.id)}`
      : `https://github.com/zoxknez/ultimate-prompt-library/blob/main/${roadmap}`;
    return `<a class="category-card ${count ? 'active' : 'planned-card'}" href="${href}" ${count ? '' : `aria-label="${esc(category.names[lang])}, ${esc(t.planned)}"`}><span>${String(category.order).padStart(2, '0')}</span><h3>${esc(category.names[lang])}</h3><p>${esc(category.descriptions[lang])}</p><strong>${count ? `${count} ${esc(t.published)}` : esc(t.planned)}</strong></a>`;
  }).join('');
  const categoryOptions = activeCategories.map((category) => `<option value="${esc(category.id)}">${esc(category.names[lang])}</option>`).join('');

  const body = `<section class="home-hero"><div class="shell home-hero-grid"><div class="home-intro"><span class="eyebrow"><i></i>${esc(t.heroKicker)}</span><h1>${esc(t.heroTitle)}</h1><p>${esc(t.heroLead)}</p><div class="home-proof"><span><i>✓</i>${esc(t.homeProof1)}</span><span><i>✓</i>${esc(t.homeProof2)}</span><span><i>✓</i>${esc(t.homeProof3)}</span><span><i>✓</i>${esc(t.homeProof4)}</span></div></div><div class="home-search-wrap"><div class="home-search-note"><span aria-hidden="true">↙</span><span>${esc(t.findKicker)}</span></div><form class="home-search" action="${libraryUrl(lang)}" method="get" role="search"><label class="sr-only" for="home-query">${esc(t.homeSearchLabel)}</label><span class="home-search-icon" aria-hidden="true">⌕</span><input id="home-query" type="search" name="q" placeholder="${esc(t.homeSearchPlaceholder)}" autocomplete="off"><label class="sr-only" for="home-category">${esc(t.category)}</label><select id="home-category" name="category"><option value="">${esc(t.allCategories)}</option>${categoryOptions}</select><button class="button" type="submit">${esc(t.homeSearchButton)} <span aria-hidden="true">→</span></button></form><p class="home-search-hint">${esc(t.homeSearchHint)}</p><div class="home-current-count"><span class="count-pulse"></span><strong>${stats.uniquePrompts}</strong> ${esc(t.promptCountLabel)} <span>·</span> ${catalog.categories.length} ${esc(t.categories.toLowerCase())}</div></div><div class="hero-index" aria-hidden="true"><span>${esc(t.prompts)}</span><span>${esc(t.categories)}</span><span>${esc(t.whyTitle)}</span></div></div></section>
  <section class="shell home-path-section"><div class="home-section-heading"><div><span class="eyebrow">${esc(t.pathKicker)}</span><h2>${esc(t.pathTitle)}</h2><p>${esc(t.pathLead)}</p></div><a class="home-section-link" href="${libraryUrl(lang)}">${esc(t.homeBrowseAll)} <span aria-hidden="true">→</span></a></div><div class="path-grid">${pathCards}</div></section>
  <section class="shell home-discovery"><div class="home-discovery-head"><div><span class="eyebrow">${esc(t.featuredKicker)}</span><h2>${esc(t.featuredTitle)}</h2></div><a class="home-section-link" href="${libraryUrl(lang)}">${esc(t.homeBrowseAll)} <span aria-hidden="true">→</span></a></div><div class="discovery-grid">${renderFeaturedPrompt(lang, featured)}<aside class="recommendation-panel"><div class="recommendation-head"><div><span class="eyebrow">${esc(t.starterKicker)}</span><p>${esc(t.starterLead)}</p></div></div><ol>${recommended.map((prompt, index) => renderRecommendedPrompt(lang, prompt, index + 1)).join('')}</ol><a class="recommendation-browse" href="${libraryUrl(lang)}">${esc(t.homeBrowseAll)} <span aria-hidden="true">→</span></a></aside></div></section>
  <section class="shell section home-directory" id="categories"><div class="section-head"><span class="eyebrow">${esc(t.categories)}</span><h2>${esc(t.categoriesTitle)}</h2><p>${esc(t.directoryLead)}</p></div><div class="category-grid">${categoryCards}</div></section>
  <section class="why"><div class="shell"><div class="section-head"><span class="eyebrow">${esc(t.qualityKicker)}</span><h2>${esc(t.whyTitle)}</h2></div><div class="why-grid"><div><b>01</b><h3>${esc(t.quality1)}</h3><p>${esc(t.quality1Lead)}</p></div><div><b>02</b><h3>${esc(t.quality2)}</h3><p>${esc(t.quality2Lead)}</p></div><div><b>03</b><h3>${esc(t.quality3)}</h3><p>${esc(t.quality3Lead)}</p></div><div><b>04</b><h3>${esc(t.quality4)}</h3><p>${esc(t.quality4Lead)}</p></div></div></div></section>
  <section class="support-section"><div class="shell support-section-inner"><div class="support-copy"><span class="eyebrow">${esc(t.supportProject)}</span><h2>${esc(t.supportTitle)}</h2><p>${esc(t.supportText)}</p></div><div class="support-options"><a class="support-card" href="https://www.paypal.com/paypalme/o0o0o0o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider paypal">P</span><div><strong>PayPal</strong><small>paypal.me</small></div><span class="support-arrow">→</span></a><a class="support-card" href="https://ko-fi.com/o0o0o0o" target="_blank" rel="noopener noreferrer"><span class="support-provider kofi">☕</span><div><strong>Ko-fi</strong><small>ko-fi.com</small></div><span class="support-arrow">→</span></a></div></div></section>`;
  return pageShell({ lang, title: 'Ultimate Prompt Library', description: t.heroLead, body, canonical: lang === 'sr' ? '/sr/' : '/', alternateEn: '/', alternateSr: '/sr/' });
}

function promptCard(p, lang = 'en') {
  const title = p.titles?.[lang] || p.titles?.en || p.slug;
  const cat = p.categoryData?.names?.[lang] || p.categoryId;
  const sub = p.subcategoryData?.names?.[lang] || p.subcategory;
  const search = `${p.id} ${title} ${cat} ${sub} ${p.slug}`.toLowerCase();

  return `<article class="prompt-card" data-prompt-card data-search="${esc(search)}" data-category="${esc(p.categoryId)}" data-subcategory="${esc(p.subcategory)}"><div class="prompt-card-top"><span class="prompt-id">${esc(p.id)}</span><span class="status-dot">stable</span></div><h3><a href="${promptUrl(lang, p)}">${esc(title)}</a></h3><p class="prompt-category">${esc(cat)}</p><div class="prompt-meta"><span>${esc(sub)}</span><span>v${esc(p.version)}</span></div><div class="prompt-card-actions"><div class="language-links"><a href="${promptUrl('en', p)}">EN</a><a href="${promptUrl('sr', p)}">SR</a></div><a class="open-link" href="${promptUrl(lang, p)}">${esc(L[lang].openPrompt)} →</a></div></article>`;
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

  const collectionNav = catalog.categories.filter((c) => prompts.some((p) => p.categoryId === c.id)).map((c) => {
    const collectionStats = stats.collections[c.id.replace('UPL-', '')];
    return `<button type="button" class="collection-filter-card" data-category-shortcut="${esc(c.id)}"><span>${esc(c.id)}</span><strong>${esc(c.names[lang])}</strong><small>${collectionStats.available}/${collectionStats.planned} · ${t.complete}</small></button>`;
  }).join('');
  const subcategoryNav = catalog.categories
    .filter((c) => prompts.some((p) => p.categoryId === c.id))
    .flatMap((c) => c.subcategories.map((s) => `<button type="button" class="subcategory-chip" data-subcategory-shortcut="${esc(s.id)}" data-parent="${esc(c.id)}"><span>${esc(s.names[lang])}</span><small>10</small></button>`))
    .join('');

  const body = `<section class="library-hero"><div class="shell library-hero-grid"><div><span class="eyebrow">${stats.uniquePrompts} published prompts</span><h1>${t.libraryTitle}</h1><p>${t.libraryLead}</p><div class="library-summary"><span>${t.completeCollections}</span><strong>IT 100/100</strong><strong>Business 100/100</strong><span>EN + SR</span></div></div><div class="library-hero-card"><span class="eyebrow">${t.collectionSummary}</span><strong>${stats.uniquePrompts}</strong><small>${t.unique}</small></div></div></section><section class="shell library-shell"><div class="browse-panel"><div class="browse-panel-head"><div><span class="eyebrow">${t.collectionsKicker}</span><h2>${t.quickBrowse}</h2></div><button type="button" class="text-button" data-reset>${t.showAll}</button></div><div class="collection-filter-grid">${collectionNav}</div><div class="subcategory-shortcuts">${subcategoryNav}</div></div><div class="filter-bar"><label class="search-box"><span>⌕</span><input id="prompt-search" type="search" placeholder="${esc(t.search)}" autocomplete="off"></label><select id="category-filter" aria-label="${esc(t.category)}"><option value="">${esc(t.allCategories)}</option>${categoryOptions}</select><select id="subcategory-filter" aria-label="${esc(t.subcategory)}"><option value="">${esc(t.allSubcategories)}</option>${subOptions}</select><button id="reset-filters" type="button">${esc(t.reset)}</button></div><div class="results-line"><strong id="result-count">${prompts.length}</strong> ${esc(t.results)}</div><div class="prompt-grid" id="prompt-grid">${prompts.map((p) => promptCard(p, lang)).join('')}</div><div class="empty-state" id="empty-state" hidden><h2>${esc(t.noResults)}</h2><button type="button" data-reset>${esc(t.reset)}</button></div></section>`;

  return pageShell({ lang, title: t.libraryTitle, description: t.libraryLead, body, canonical: libraryUrl(lang), bodyClass: 'library-page', alternateEn: '/prompts/', alternateSr: '/sr/prompts/' });
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

  const body = `<section class="prompt-hero"><div class="shell"><nav class="breadcrumbs"><a href="${libraryUrl(lang)}">${t.prompts}</a><span>/</span><a href="${libraryUrl(lang)}?category=${encodeURIComponent(p.categoryId)}">${esc(cat)}</a><span>/</span><span>${esc(p.id)}</span></nav><div class="prompt-title-row"><div class="prompt-title-copy"><span class="eyebrow">${esc(p.id)} · ${esc(sub)}</span><h1>${esc(title)}</h1><p>${esc(cat)}</p><div class="prompt-hero-meta"><span>v${esc(p.version)}</span><span>stable</span><span>${lang === 'sr' ? 'Srpski' : 'English'}</span></div></div><div class="prompt-actions"><button class="button" type="button" data-copy-prompt>${t.copy}</button><button class="secondary-button" type="button" data-copy-link>${t.copyLink}</button></div></div></div></section><section class="shell prompt-layout"><aside class="prompt-sidebar"><div class="side-card"><dl><div><dt>${t.status}</dt><dd>stable</dd></div><div><dt>${t.version}</dt><dd>v${esc(p.version)}</dd></div><div><dt>${t.language}</dt><dd><a class="${lang === 'en' ? 'active-lang' : ''}" href="${promptUrl('en', p)}">EN</a> <a class="${lang === 'sr' ? 'active-lang' : ''}" href="${promptUrl('sr', p)}">SR</a></dd></div></dl><a class="source-link" href="${GITHUB_ROOT}/${file}">${t.source} →</a></div>${toc.length ? `<div class="toc"><strong>${t.toc}</strong>${toc.map((item) => `<a class="toc-${item.level}" href="#${item.id}">${esc(item.title)}</a>`).join('')}</div>` : ''}</aside><article class="markdown-body">${renderMarkdown(parsed.body)}</article></section><section class="shell prev-next">${prev ? `<a href="${promptUrl(lang, prev)}"><small>${t.previous}</small><strong>${esc(prev.titles?.[lang] || prev.titles?.en)}</strong></a>` : '<span></span>'}${next ? `<a class="next-link" href="${promptUrl(lang, next)}"><small>${t.next}</small><strong>${esc(next.titles?.[lang] || next.titles?.en)}</strong></a>` : ''}</section><script id="raw-prompt" type="application/json">${rawJson}</script>`;

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
