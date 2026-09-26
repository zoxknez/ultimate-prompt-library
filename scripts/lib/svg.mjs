// SVG artwork for the READMEs: a hero banner and a live statistics card.
//
// Design: premium editorial palette with a bright canvas, navy typography, royal blue progress and warm gold accents.
// Fonts (Inter, Inter Display, JetBrains Mono; SIL OFL 1.1) are subset in assets/fonts/ and
// embedded as data URIs, so the artwork renders identically on every platform. Text is measured
// with the glyph advances in assets/fonts/metrics.json, so layout never depends on guesses.
// Every image exists per language and per color scheme (light/dark) for use with <picture>.
// Output is deterministic: no timestamps, no random ids.

import { readFileSync } from 'node:fs';
import { abs } from './upl.mjs';

const FONT_DIR = 'assets/fonts';
const FONTS = {
  sans: { file: 'Inter-Regular', family: 'UPL Sans', weight: 400 },
  sansMedium: { file: 'Inter-Medium', family: 'UPL Sans', weight: 500 },
  sansSemi: { file: 'Inter-SemiBold', family: 'UPL Sans', weight: 600 },
  display: { file: 'InterDisplay-SemiBold', family: 'UPL Display', weight: 600 },
  mono: { file: 'JetBrainsMono-Regular', family: 'UPL Mono', weight: 400 },
};
const FALLBACK = {
  'UPL Sans': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  'UPL Display': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  'UPL Mono': "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

let metricsCache = null;
const metrics = () => (metricsCache ??= JSON.parse(readFileSync(abs(`${FONT_DIR}/metrics.json`), 'utf8')));
const fontData = new Map();
function fontBase64(file) {
  if (!fontData.has(file)) fontData.set(file, readFileSync(abs(`${FONT_DIR}/${file}.woff2`)).toString('base64'));
  return fontData.get(file);
}

/** Exact advance width of `text` in pixels (kerning ignored) plus optional letter spacing. */
export function measure(text, fontKey, size, letterSpacing = 0) {
  const m = metrics()[FONTS[fontKey].file];
  let units = 0;
  for (const ch of String(text)) units += m.advances[ch] ?? m.advances['n'];
  return (units / m.unitsPerEm) * size + letterSpacing * Math.max(0, [...String(text)].length - 1);
}

function fontFaces(keys) {
  return [...new Set(keys)]
    .map((key) => {
      const f = FONTS[key];
      return `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/woff2;base64,${fontBase64(
        f.file,
      )}) format('woff2');}`;
    })
    .join('');
}

/** Attribute string for a text element in the given font. */
function font(key, size, extra = '') {
  const f = FONTS[key];
  return `font-family="'${f.family}', ${FALLBACK[f.family]}" font-weight="${f.weight}" font-size="${size}"${extra ? ` ${extra}` : ''}`;
}

export const THEMES = {
  light: {
    canvas: '#FFFFFF',
    border: '#D9E4EE',
    grid: '#EEF4F8',
    text: '#102A43',
    muted: '#536B84',
    faint: '#B98524',
    track: '#E8EEF4',
    fill: '#1769AA',
    card: '#FFFFFF',
    cardHeader: '#F4F8FB',
    skeleton: '#E8EEF4',
    shadow: '#102A43',
    shadowOpacity: 0.10,
  },
  // README artwork intentionally remains bright in dark GitHub mode as well.
  // The library's visual identity prioritizes readability over theme switching.
  dark: {
    canvas: '#FFFFFF',
    border: '#D9E4EE',
    grid: '#EEF4F8',
    text: '#102A43',
    muted: '#536B84',
    faint: '#B98524',
    track: '#E8EEF4',
    fill: '#1769AA',
    card: '#FFFFFF',
    cardHeader: '#F4F8FB',
    skeleton: '#E8EEF4',
    shadow: '#102A43',
    shadowOpacity: 0.10,
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------
// Banner

const BANNER_TEXT = {
  en: {
    eyebrow: 'OPEN-SOURCE PROMPT LIBRARY',
    tagline: ['The open-source library of deep,', 'production-grade AI prompts.'],
    meta: (n) => [`${n} prompts`, 'English · Srpski', 'Model-agnostic', 'MIT License'],
  },
  sr: {
    eyebrow: 'OPEN-SOURCE BIBLIOTEKA PROMPTOVA',
    tagline: ['Open-source biblioteka dubokih AI', 'promptova spremnih za produkciju.'],
    meta: (n) => [`${n} promptova`, 'English · Srpski', 'Nezavisno od modela', 'MIT licenca'],
  },
};

export function bannerSvg(lang, themeName, stats) {
  const th = THEMES[themeName];
  const s = BANNER_TEXT[lang] ?? BANNER_TEXT.en;
  const id = `b${themeName[0]}`;
  const W = 1200;
  const H = 460;
  const X = 72;

  // Meta row: items separated by hairlines, measured exactly.
  let mx = X;
  const meta = s
    .meta(stats.uniquePrompts)
    .map((item, i) => {
      const w = measure(item, 'sansMedium', 15);
      const parts = [];
      if (i > 0) {
        parts.push(`<rect x="${r1(mx)}" y="355" width="1" height="18" fill="${th.border}"/>`);
        mx += 17;
      }
      parts.push(`<text x="${r1(mx)}" y="369" ${font('sansMedium', 15)} fill="${th.muted}">${esc(item)}</text>`);
      mx += w + 16;
      return parts.join('');
    })
    .join('\n  ');

  // Document card on the right.
  const CX = 720;
  const CY = 74;
  const CW = 408;
  const CH = 312;
  const fm = [
    ['id', 'UPL-IT-042'],
    ['title', 'Docker Production Audit'],
    ['category', 'IT'],
    ['language', lang],
    ['version', '1.0.0'],
    ['status', 'stable'],
  ];
  const keyW = measure('category:  ', 'mono', 13);
  const fmLines = fm
    .map(
      ([k, v], i) =>
        `<text x="24" y="${92 + i * 22}" ${font('mono', 13)}><tspan fill="${th.faint}">${esc(k)}:</tspan><tspan x="${r1(
          24 + keyW,
        )}" fill="${th.text}">${esc(v)}</tspan></text>`,
    )
    .join('\n      ');
  const skeleton = [300, 340, 250, 320]
    .map((w, i) => `<rect x="24" y="${252 + i * 14}" width="${w}" height="6" rx="3" fill="${th.skeleton}"/>`)
    .join('');
  const statusW = measure('stable', 'mono', 11) + 18;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" text-rendering="geometricPrecision" role="img" aria-label="Ultimate Prompt Library - ${esc(
    s.tagline.join(' '),
  )}">
  <defs>
    <style>${fontFaces(['sans', 'sansMedium', 'display', 'mono'])}</style>
    <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${th.grid}" stroke-width="1"/>
    </pattern>
    <radialGradient id="${id}-fade" cx="0.78" cy="0.45" r="0.62">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <mask id="${id}-mask"><rect width="${W}" height="${H}" fill="url(#${id}-fade)"/></mask>
    <clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="12"/></clipPath>
    <filter id="${id}-shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="${th.shadow}" flood-opacity="${th.shadowOpacity}"/>
    </filter>
  </defs>

  <g clip-path="url(#${id}-clip)">
    <rect width="${W}" height="${H}" fill="${th.canvas}"/>
    <rect width="${W}" height="${H}" fill="url(#${id}-grid)" mask="url(#${id}-mask)"/>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${th.border}"/>

  <rect x="${X}" y="72" width="10" height="10" fill="${th.text}"/>
  <text x="${X + 22}" y="82" ${font('mono', 13, 'letter-spacing="1.5"')} fill="${th.muted}">${esc(s.eyebrow)}</text>

  <text x="${X - 3}" y="176" ${font('display', 68, 'letter-spacing="-2.2"')} fill="${th.text}">Ultimate Prompt</text>
  <text x="${X - 3}" y="250" ${font('display', 68, 'letter-spacing="-2.2"')} fill="${th.faint}">Library</text>

  <text ${font('sans', 20)} fill="${th.muted}">
    <tspan x="${X}" y="296">${esc(s.tagline[0])}</tspan>
    <tspan x="${X}" y="324">${esc(s.tagline[1])}</tspan>
  </text>

  ${meta}

  <g transform="translate(${CX} ${CY})">
    <rect width="${CW}" height="${CH}" rx="10" fill="${th.card}" filter="url(#${id}-shadow)"/>
    <rect x="0.5" y="0.5" width="${CW - 1}" height="${CH - 1}" rx="10" fill="${th.card}" stroke="${th.border}"/>
    <path d="M10.5 0.5h${CW - 21}a10 10 0 0 1 10 10v33H0.5v-33a10 10 0 0 1 10-10z" fill="${th.cardHeader}" stroke="${th.border}"/>
    <text x="24" y="27" ${font('mono', 12)} fill="${th.muted}">042-docker-production-audit.md</text>
    <rect x="${r1(CW - 24 - statusW)}" y="12" width="${r1(statusW)}" height="20" rx="10" fill="none" stroke="${th.border}"/>
    <text x="${r1(CW - 24 - statusW / 2)}" y="26" text-anchor="middle" ${font('mono', 11)} fill="${th.muted}">stable</text>
    <text x="24" y="70" ${font('mono', 13)} fill="${th.faint}">---</text>
      ${fmLines}
    <text x="24" y="224" ${font('mono', 13)} fill="${th.faint}">---</text>
    ${skeleton}
  </g>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Statistics card

const STATS_TEXT = {
  en: {
    eyebrow: 'LIBRARY AT A GLANCE',
    source: 'Generated from catalog.json and prompt front matter',
    tiles: [
      ['Unique prompts', 'Stable, language-independent IDs'],
      ['Localized files', 'One per prompt and language'],
      ['Languages', 'English · Srpski'],
      ['Categories', (n) => `${n} with published prompts`],
    ],
    complete: (done, total) => `${done} of ${total} subcategories complete`,
    planned: (n) => `${n} planned`,
    available: 'available',
  },
  sr: {
    eyebrow: 'BIBLIOTEKA UKRATKO',
    source: 'Generisano iz catalog.json i front matter-a promptova',
    tiles: [
      ['Jedinstvenih promptova', 'Stabilni ID-evi za sve jezike'],
      ['Lokalizovanih fajlova', 'Jedan po promptu i jeziku'],
      ['Jezika', 'English · Srpski'],
      ['Oblasti', (n) => `${n} sa objavljenim promptovima`],
    ],
    complete: (done, total) => `${done} od ${total} podkategorija završeno`,
    planned: (n) => `${n} planirano`,
    available: 'dostupno',
  },
};

/**
 * @param rows [{ name, available, planned, segments: [{ label, available, planned }] }]
 */
export function statsSvg(lang, themeName, stats, rows) {
  const th = THEMES[themeName];
  const s = STATS_TEXT[lang] ?? STATS_TEXT.en;
  const id = `s${themeName[0]}`;
  const W = 1200;
  const X = 64;
  const innerW = W - X * 2;
  const tilesY = 104;
  const rowsY = 300;
  const rowH = 132;
  const H = rowsY + rows.length * rowH + 40;

  const values = [stats.uniquePrompts, stats.localizedPromptFiles, stats.languages, stats.categories];
  const colW = innerW / 4;
  const tiles = s.tiles
    .map(([label, note], i) => {
      const x = X + i * colW;
      const noteText = typeof note === 'function' ? note(stats.categoriesWithContent) : note;
      const pad = i === 0 ? 0 : 32;
      return `${i > 0 ? `<rect x="${r1(x)}" y="${tilesY}" width="1" height="128" fill="${th.border}"/>` : ''}
  <text x="${r1(x + pad)}" y="${tilesY + 58}" ${font('display', 60, 'letter-spacing="-2"')} fill="${th.text}">${esc(
        values[i],
      )}</text>
  <text x="${r1(x + pad)}" y="${tilesY + 94}" ${font('sansMedium', 16)} fill="${th.text}">${esc(label)}</text>
  <text x="${r1(x + pad)}" y="${tilesY + 118}" ${font('sans', 14)} fill="${th.muted}">${esc(noteText)}</text>`;
    })
    .join('\n  ');

  const rowSvg = rows
    .map((row, r) => {
      const y = rowsY + r * rowH;
      const pct = row.planned ? Math.round((row.available / row.planned) * 100) : 0;
      const segs = row.segments.length ? row.segments : [{ label: '', available: row.available, planned: row.planned }];
      const gap = 8;
      const segW = (innerW - gap * (segs.length - 1)) / segs.length;
      const bars = segs
        .map((seg, i) => {
          const x = X + i * (segW + gap);
          const fill = seg.planned ? (seg.available / seg.planned) * segW : 0;
          const label = esc(seg.label);
          return `<rect x="${r1(x)}" y="${y + 44}" width="${r1(segW)}" height="8" rx="2" fill="${th.track}"/>${
            fill > 0 ? `<rect x="${r1(x)}" y="${y + 44}" width="${r1(fill)}" height="8" rx="2" fill="${th.fill}"/>` : ''
          }<text x="${r1(x)}" y="${y + 76}" ${font('sansMedium', 12)} fill="${seg.available ? th.muted : th.faint}">${label}</text>`;
        })
        .join('\n    ');
      const done = row.segments.filter((g) => g.planned > 0 && g.available === g.planned).length;
      const right = `${row.available} / ${row.planned}`;
      const pctText = `${pct}%`;
      return `<rect x="${X}" y="${y - 36}" width="${innerW}" height="1" fill="${th.border}"/>
  <text x="${X}" y="${y + 20}" ${font('sansSemi', 18)} fill="${th.text}">${esc(row.name)}</text>
  <text x="${W - X}" y="${y + 20}" text-anchor="end" ${font('mono', 15)} fill="${th.muted}"><tspan fill="${th.text}">${esc(
    right,
  )}</tspan>  ${esc(s.available)} · ${esc(pctText)}</text>
    ${bars}
  <text x="${X}" y="${y + 108}" ${font('sans', 14)} fill="${th.muted}">${esc(
    `${s.complete(done, row.segments.length)} · ${s.planned(row.planned - row.available)}`,
  )}</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" text-rendering="geometricPrecision" role="img" aria-label="${esc(
    `${s.eyebrow}: ${stats.uniquePrompts} ${s.tiles[0][0]}, ${stats.localizedPromptFiles} ${s.tiles[1][0]}, ${stats.languages} ${s.tiles[2][0]}`,
  )}">
  <defs>
    <style>${fontFaces(['sans', 'sansMedium', 'sansSemi', 'display', 'mono'])}</style>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${th.canvas}" stroke="${th.border}"/>
  <rect x="${X}" y="50" width="10" height="10" fill="${th.text}"/>
  <text x="${X + 22}" y="60" ${font('mono', 13, 'letter-spacing="1.5"')} fill="${th.muted}">${esc(s.eyebrow)}</text>
  <text x="${W - X}" y="60" text-anchor="end" ${font('mono', 12)} fill="${th.faint}">${esc(s.source)}</text>
  ${tiles}
  ${rowSvg}
</svg>
`;
}
