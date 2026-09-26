// Markdown rendering helpers for generated README/roadmap blocks.

import path from 'node:path';
import { pad, promptFileName, promptPath, subcategoryDir, PROMPTS_DIR } from './upl.mjs';

const STRINGS = {
  en: {
    status: {
      stable: '✅ Available',
      review: '🔍 In review',
      draft: '✏️ Draft',
      deprecated: '⚠️ Deprecated',
      planned: '⏳ Planned',
    },
    prompt: 'Prompt',
    progress: 'Progress',
    available: 'available',
    noneCatalogued:
      'No prompts are catalogued for this category yet. The collection is planned; see the [roadmap](ROADMAP) and [contributing guide](CONTRIBUTING).',
    noneInSubcategory: 'No prompts are catalogued for this subcategory yet.',
    category: 'Category',
    subcategory: 'Subcategory',
    statusHeader: 'Status',
    inProgress: '🚧 In progress',
    complete: '✅ Complete',
    plannedWord: 'Planned',
    prompts: 'Prompts',
    available2: 'Available',
    initialIt: 'Initial IT Collection',
    badgePrompts: 'prompts',
    badgeLanguages: 'languages',
    badgeIt: 'IT collection',
    statsAlt: (st) => `${st.uniquePrompts} unique prompts, ${st.localizedPromptFiles} localized prompt files, ${st.languages} languages`,
    uniquePrompts: 'unique prompts',
    localizedFiles: 'localized prompt files',
    languages: 'languages',
    categoriesWithContent: 'categories with published prompts',
    of: 'of',
    subcategoriesComplete: 'subcategories complete',
    collectionProgress: 'collection progress',
    id: 'ID',
    title: 'Title',
    futureFile: 'Future file',
    nothingPlanned: 'Every catalogued prompt is available. New entries are added to `catalog.json` as they are planned.',
    remaining: 'Remaining',
  },
  sr: {
    status: {
      stable: '✅ Dostupno',
      review: '🔍 U pregledu',
      draft: '✏️ Nacrt',
      deprecated: '⚠️ Zastarelo',
      planned: '⏳ Planirano',
    },
    prompt: 'Prompt',
    progress: 'Napredak',
    available: 'dostupno',
    noneCatalogued:
      'Za ovu oblast još nema katalogizovanih promptova. Kolekcija je planirana; pogledaj [roadmap](ROADMAP) i [uputstvo za doprinos](CONTRIBUTING).',
    noneInSubcategory: 'Za ovu podkategoriju još nema katalogizovanih promptova.',
    category: 'Oblast',
    subcategory: 'Podkategorija',
    statusHeader: 'Status',
    inProgress: '🚧 U toku',
    complete: '✅ Završeno',
    plannedWord: 'Planirano',
    prompts: 'Promptovi',
    available2: 'Dostupno',
    initialIt: 'Početna IT kolekcija',
    badgePrompts: 'promptova',
    badgeLanguages: 'jezika',
    badgeIt: 'IT kolekcija',
    statsAlt: (st) => `${st.uniquePrompts} jedinstvenih promptova, ${st.localizedPromptFiles} lokalizovanih fajlova, ${st.languages} jezika`,
    uniquePrompts: 'jedinstvenih promptova',
    localizedFiles: 'lokalizovanih prompt fajlova',
    languages: 'jezika',
    categoriesWithContent: 'oblasti sa objavljenim promptovima',
    of: 'od',
    subcategoriesComplete: 'podkategorija završeno',
    collectionProgress: 'napredak kolekcije',
    id: 'ID',
    title: 'Naziv',
    futureFile: 'Budući fajl',
    nothingPlanned: 'Svi katalogizovani promptovi su dostupni. Novi unosi se dodaju u `catalog.json` kada se planiraju.',
    remaining: 'Preostalo',
  },
};

export const t = (lang) => STRINGS[lang] ?? STRINGS.en;

/** Relative link from the directory of `fromFile` to `toPath` (both repo-relative). */
export function link(fromFile, toPath) {
  return path.posix.relative(path.posix.dirname(fromFile), toPath) || '.';
}

const escapeCell = (text) => String(text).replace(/\|/g, '\\|');

/** `| # | Prompt | EN | SR | Status |` table for a list of collection entries. */
export function promptTable({ lang, fromFile, category, subcategories, entries, languages }) {
  const s = t(lang);
  const subById = new Map(subcategories.map((sub) => [sub.id, sub]));
  const header = `| # | ${s.prompt} | ${languages.map((c) => c.toUpperCase()).join(' | ')} | ${s.statusHeader} |`;
  const divider = `|---|---|${languages.map(() => ':---:|').join('')}---|`;
  const rows = entries.map(({ entry, prompt, status, titles }) => {
    const sub = subById.get(entry.subcategory);
    const target = (code) => promptPath(code, category, sub, entry.number, entry.slug);
    const own = prompt?.localizations[lang];
    const title = own ? `[${escapeCell(titles[lang])}](${link(fromFile, target(lang))})` : escapeCell(titles[lang]);
    const langCells = languages.map((code) =>
      prompt?.localizations[code] ? `[${code.toUpperCase()}](${link(fromFile, target(code))})` : '-',
    );
    return `| ${pad(entry.number, 3)} | ${title} | ${langCells.join(' | ')} | ${s.status[status] ?? status} |`;
  });
  return [header, divider, ...rows].join('\n');
}

export function progressLabel(lang, available, planned) {
  const s = t(lang);
  if (!planned) return s.status.planned;
  if (available === planned) return `${s.complete} - ${available}/${planned}`;
  if (available === 0) return `${s.status.planned} - 0/${planned}`;
  return `${s.inProgress} - ${available}/${planned}`;
}

/** Full category listing grouped by subcategory (used in prompts/<lang>/<category>/README.md). */
export function categoryBlock({ lang, fromFile, collection, languages, docLinks }) {
  const s = t(lang);
  const { category } = collection;
  if (!collection.planned) {
    return s.noneCatalogued.replace('ROADMAP', link(fromFile, docLinks.roadmap)).replace(
      'CONTRIBUTING',
      link(fromFile, docLinks.contributing),
    );
  }
  const parts = [`**${s.progress}:** ${collection.available} / ${collection.planned} ${s.available}`];
  for (const group of collection.subcategories) {
    const dir = `${PROMPTS_DIR}/${lang}/${category.dirs[lang]}/${subcategoryDir(group.sub)}`;
    parts.push(
      `### ${pad(group.sub.order, 2)} · [${group.sub.names[lang]}](${link(fromFile, `${dir}/README.md`)})`,
      `${group.available} / ${group.planned} ${s.available}`,
      group.entries.length
        ? promptTable({
            lang,
            fromFile,
            category,
            subcategories: category.subcategories,
            entries: group.entries,
            languages,
          })
        : s.noneInSubcategory,
    );
  }
  return parts.join('\n\n');
}

/** Table for a single subcategory README. */
export function subcategoryBlock({ lang, fromFile, collection, group, languages }) {
  const s = t(lang);
  if (!group.entries.length) return s.noneInSubcategory;
  return [
    `**${s.progress}:** ${group.available} / ${group.planned} ${s.available}`,
    promptTable({
      lang,
      fromFile,
      category: collection.category,
      subcategories: collection.category.subcategories,
      entries: group.entries,
      languages,
    }),
  ].join('\n\n');
}

/** Planned (catalogued but not yet written) prompts, grouped by category and subcategory. */
export function roadmapPlannedBlock({ lang, collections }) {
  const s = t(lang);
  const parts = [];
  for (const collection of collections) {
    const pending = collection.entries.filter((e) => !e.available);
    if (!pending.length) continue;
    parts.push(
      `### ${collection.category.icon ?? ""} ${collection.category.names[lang]} - ${pending.length} ${s.plannedWord.toLowerCase()}`,
    );
    for (const group of collection.subcategories) {
      const groupPending = group.entries.filter((e) => !e.available);
      if (!groupPending.length) continue;
      parts.push(
        `#### ${pad(group.sub.order, 2)} · ${group.sub.names[lang]}`,
        [
          `| ${s.id} | ${s.title} | ${s.futureFile} |`,
          '|---|---|---|',
          ...groupPending.map(
            (e) =>
              `| ${e.entry.id} | ${escapeCell(e.titles[lang])} | \`${subcategoryDir(group.sub)}/${promptFileName(
                e.entry.number,
                e.entry.slug,
              )}\` |`,
          ),
        ].join('\n'),
      );
    }
  }
  return parts.length ? parts.join('\n\n') : s.nothingPlanned;
}

// ---------------------------------------------------------------------------
// Root README blocks

const BADGE = 'style=flat-square&labelColor=0B1020';
const REPO = 'zoxknez/ultimate-prompt-library';
const enc = (text) => encodeURIComponent(String(text).replace(/-/g, '--').replace(/_/g, '__'));

/** Shields.io badges for the README hero; counts come from stats.json. */
export function heroBadges({ lang, stats, collections }) {
  const s = t(lang);
  const it = collections.find((c) => c.category.id === 'UPL-IT');
  const badges = [
    [
      'Validate',
      `https://img.shields.io/github/actions/workflow/status/${REPO}/validate.yml?branch=main&${BADGE}&label=validate`,
      `https://github.com/${REPO}/actions/workflows/validate.yml`,
    ],
    [
      `${s.badgePrompts}: ${stats.uniquePrompts}`,
      `https://img.shields.io/badge/${enc(s.badgePrompts)}-${stats.uniquePrompts}-7C3AED?${BADGE}`,
      lang === 'en' ? '#collection' : '#kolekcija',
    ],
    it && [
      `${s.badgeIt}: ${it.available}/${it.planned}`,
      `https://img.shields.io/badge/${enc(s.badgeIt)}-${it.available}%2F${it.planned}-4F46E5?${BADGE}`,
      `prompts/${lang}/${it.category.dirs[lang]}/README.md`,
    ],
    [
      `${s.badgeLanguages}: EN | SR`,
      `https://img.shields.io/badge/${enc(s.badgeLanguages)}-EN%20%7C%20SR-0891B2?${BADGE}`,
      lang === 'en' ? 'README.sr.md' : 'README.md',
    ],
    ['License: MIT', `https://img.shields.io/badge/license-MIT-22C55E?${BADGE}`, 'LICENSE'],
  ].filter(Boolean);
  return badges.map(([alt, src, href]) => `<a href="${href}"><img src="${src}" alt="${alt}"></a>`).join('\n');
}

/** Light/dark statistics card. */
export function statsPicture({ lang, stats }) {
  const s = t(lang);
  return [
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="assets/stats.${lang}.dark.svg">`,
    `  <img src="assets/stats.${lang}.light.svg" alt="${s.statsAlt(stats)}" width="100%">`,
    '</picture>',
  ].join('\n');
}

/** Five-column card grid of all categories. */
export function categoryGrid({ lang, fromFile, collections }) {
  const s = t(lang);
  const cells = collections.map((c) => {
    const status = !c.planned
      ? s.status.planned
      : c.available === c.planned
        ? `${s.complete} · ${c.available}/${c.planned}`
        : c.available
          ? `${s.inProgress} · ${c.available}/${c.planned}`
          : `${s.status.planned} · 0/${c.planned}`;
    const href = link(fromFile, `${PROMPTS_DIR}/${lang}/${c.category.dirs[lang]}/README.md`);
    return [
      '<td align="center" valign="top" width="20%">',
      `<h3>${c.category.icon ?? '📁'}</h3>`,
      `<a href="${href}"><b>${escapeHtml(c.category.names[lang])}</b></a><br>`,
      `<sub><code>${c.category.id}</code></sub><br>`,
      `<sub>${status}</sub>`,
      '</td>',
    ].join('\n');
  });
  const rows = [];
  for (let i = 0; i < cells.length; i += 5) rows.push(`<tr>\n${cells.slice(i, i + 5).join('\n')}\n</tr>`);
  return `<table>\n${rows.join('\n')}\n</table>`;
}

/** Emoji progress bar, one square per prompt (scaled to at most 10 squares). */
export function emojiBar(available, planned, width = 10) {
  if (!planned) return '';
  const slots = Math.min(width, planned);
  const filled = Math.round((available / planned) * slots);
  return '🟪'.repeat(filled) + '⬜'.repeat(slots - filled);
}

/** Subcategory progress table for every category that has subcategories. */
export function subcategoryStatus({ lang, fromFile, collections }) {
  const s = t(lang);
  return collections
    .filter((c) => c.subcategories.length)
    .map((c) =>
      [
        `| | ${s.subcategory} | ${s.progress} | ${s.available2} | ${s.statusHeader} |`,
        '|:---:|---|:---:|:---:|:---:|',
        ...c.subcategories.map((g) => {
          const href = link(fromFile, `${PROMPTS_DIR}/${lang}/${c.category.dirs[lang]}/${subcategoryDir(g.sub)}/README.md`);
          const status = !g.planned
            ? s.status.planned
            : g.available === g.planned
              ? s.complete
              : g.available
                ? s.inProgress
                : s.status.planned;
          return `| ${g.sub.icon ?? ''} | **[${escapeCell(g.sub.names[lang])}](${href})** | ${emojiBar(g.available, g.planned)} | ${g.available} / ${g.planned} | ${status} |`;
        }),
      ].join('\n'),
    )
    .join('\n\n');
}

const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
