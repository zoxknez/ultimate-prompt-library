// SVG artwork for the READMEs: a hero banner and a live statistics card.
// Both are rendered per language and per color scheme (light/dark) so GitHub can pick
// the right one with <picture>. Output is deterministic; no timestamps or random ids.

const FONT = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

export const THEMES = {
  light: {
    bg1: '#FFFFFF',
    bg2: '#F6F7FE',
    tile: '#FFFFFF',
    border: '#E2E6F3',
    text: '#0F172A',
    muted: '#5B6478',
    faint: '#94A0B8',
    track: '#E9ECF7',
    a1: '#7C3AED',
    a2: '#4F46E5',
    a3: '#0891B2',
    glow1: '#A78BFA',
    glow2: '#67E8F9',
    glowOpacity: 0.35,
    dots: '#C7CEE4',
    code: '#0B1020',
    codeBar: '#141B33',
    codeText: '#E6EDF7',
    codeMuted: '#7D89A6',
    codeKey: '#67E8F9',
    codeHead: '#C4B5FD',
  },
  dark: {
    bg1: '#0B1020',
    bg2: '#121A33',
    tile: '#141C36',
    border: '#26304F',
    text: '#E6EDF7',
    muted: '#9AA6C2',
    faint: '#66728F',
    track: '#1E2745',
    a1: '#A78BFA',
    a2: '#818CF8',
    a3: '#22D3EE',
    glow1: '#7C3AED',
    glow2: '#0891B2',
    glowOpacity: 0.45,
    dots: '#2A3558',
    code: '#070B17',
    codeBar: '#0F1528',
    codeText: '#E6EDF7',
    codeMuted: '#66728F',
    codeKey: '#67E8F9',
    codeHead: '#C4B5FD',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Rough text width estimate for layout (no font metrics are available in an <img> SVG). */
function textWidth(text, size, { bold = false, spacing = 0 } = {}) {
  let units = 0;
  for (const ch of String(text)) {
    if (ch === ' ') units += 0.28;
    else if (/[MW]/.test(ch)) units += 0.86;
    else if (/[A-Z]/.test(ch)) units += 0.66;
    else if (/[mw]/.test(ch)) units += 0.82;
    else if (/[ijlt.,:;'|!·]/.test(ch)) units += 0.3;
    else if (/[0-9]/.test(ch)) units += 0.57;
    else units += 0.54;
  }
  return units * size * (bold ? 1.07 : 1) + spacing * String(text).length;
}

function defs(th, id) {
  return `<defs>
    <linearGradient id="${id}-accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${th.a1}"/>
      <stop offset="0.55" stop-color="${th.a2}"/>
      <stop offset="1" stop-color="${th.a3}"/>
    </linearGradient>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${th.bg1}"/>
      <stop offset="1" stop-color="${th.bg2}"/>
    </linearGradient>
    <radialGradient id="${id}-glow1">
      <stop offset="0" stop-color="${th.glow1}" stop-opacity="${th.glowOpacity}"/>
      <stop offset="1" stop-color="${th.glow1}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-glow2">
      <stop offset="0" stop-color="${th.glow2}" stop-opacity="${th.glowOpacity}"/>
      <stop offset="1" stop-color="${th.glow2}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}-dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="${th.dots}"/>
    </pattern>
  </defs>`;
}

function chip(x, y, label, th, id) {
  const w = Math.round(textWidth(label, 15, { bold: true }) + 34);
  return {
    width: w,
    svg: `<g transform="translate(${x} ${y})">
      <rect width="${w}" height="34" rx="17" fill="${th.tile}" stroke="${th.border}"/>
      <circle cx="17" cy="17" r="4" fill="url(#${id}-accent)"/>
      <text x="29" y="22" font-family="${FONT}" font-size="15" font-weight="600" fill="${th.text}">${esc(label)}</text>
    </g>`,
  };
}

// ---------------------------------------------------------------------------
// Banner

const BANNER_TEXT = {
  en: {
    eyebrow: 'OPEN-SOURCE · MODEL-AGNOSTIC · ENGLISH / SRPSKI',
    tagline: ['The open-source library of deep,', 'production-grade AI prompts.'],
    chips: ['Stable IDs', 'Versioned', 'Bilingual', 'Evidence-first'],
  },
  sr: {
    eyebrow: 'OPEN-SOURCE · NEZAVISNO OD MODELA · ENGLISH / SRPSKI',
    tagline: ['Open-source biblioteka dubokih AI', 'promptova spremnih za produkciju.'],
    chips: ['Stabilni ID-evi', 'Verzionisano', 'Dvojezično', 'Dokazi pre svega'],
  },
};

export function bannerSvg(lang, themeName) {
  const th = THEMES[themeName];
  const s = BANNER_TEXT[lang] ?? BANNER_TEXT.en;
  const id = `b${themeName[0]}`;
  const W = 1200;
  const H = 420;

  const eyebrowW = Math.round(textWidth(s.eyebrow, 13, { bold: true, spacing: 1.6 }) + 40);
  let cx = 64;
  const chips = s.chips.map((label) => {
    const c = chip(cx, 330, label, th, id);
    cx += c.width + 10;
    return c.svg;
  });

  const codeLines = [
    [['---', 'm']],
    [['id', 'k'], [': UPL-IT-042', 't']],
    [['title', 'k'], [': Docker Production Audit', 't']],
    [['language', 'k'], [`: ${lang}`, 't']],
    [['version', 'k'], [': 1.0.0', 't']],
    [['status', 'k'], [': stable', 't']],
    [['---', 'm']],
    [['# DOCKER PRODUCTION AUDIT', 'h']],
  ];
  const color = { m: th.codeMuted, k: th.codeKey, t: th.codeText, h: th.codeHead };
  const code = codeLines
    .map(
      (parts, i) =>
        `<text x="24" y="${78 + i * 25}" font-family="${MONO}" font-size="15" xml:space="preserve">${parts
          .map(([txt, c]) => `<tspan fill="${color[c]}"${c === 'h' ? ' font-weight="700"' : ''}>${esc(txt)}</tspan>`)
          .join('')}</text>`,
    )
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ultimate Prompt Library - ${esc(
    s.tagline.join(' '),
  )}">
  ${defs(th, id)}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="28" fill="url(#${id}-bg)" stroke="${th.border}"/>
  <clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  <g clip-path="url(#${id}-clip)">
    <rect width="${W}" height="${H}" fill="url(#${id}-dots)" opacity="0.55"/>
    <circle cx="140" cy="40" r="360" fill="url(#${id}-glow1)"/>
    <circle cx="1080" cy="420" r="380" fill="url(#${id}-glow2)"/>
    <rect width="${W}" height="6" fill="url(#${id}-accent)"/>
  </g>

  <g transform="translate(64 58)">
    <rect width="${eyebrowW}" height="32" rx="16" fill="${th.tile}" stroke="${th.border}"/>
    <text x="20" y="21" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="1.6" fill="${th.muted}">${esc(
      s.eyebrow,
    )}</text>
  </g>

  <text x="60" y="162" font-family="${FONT}" font-size="64" font-weight="800" letter-spacing="-1.5" fill="${th.text}">Ultimate Prompt</text>
  <text x="60" y="232" font-family="${FONT}" font-size="64" font-weight="800" letter-spacing="-1.5" fill="url(#${id}-accent)">Library</text>

  <text font-family="${FONT}" font-size="22" fill="${th.muted}">
    <tspan x="64" y="276">${esc(s.tagline[0])}</tspan>
    <tspan x="64" y="306">${esc(s.tagline[1])}</tspan>
  </text>

  ${chips.join('\n  ')}

  <g transform="translate(732 64)">
    <rect x="6" y="10" width="404" height="292" rx="18" fill="${th.a2}" opacity="0.18"/>
    <rect width="404" height="292" rx="18" fill="${th.code}" stroke="${th.border}"/>
    <path d="M18 0h368a18 18 0 0 1 18 18v26H0V18A18 18 0 0 1 18 0z" fill="${th.codeBar}"/>
    <circle cx="24" cy="22" r="6" fill="#FF5F57"/>
    <circle cx="44" cy="22" r="6" fill="#FEBC2E"/>
    <circle cx="64" cy="22" r="6" fill="#28C840"/>
    <text x="88" y="27" font-family="${MONO}" font-size="13" fill="${th.codeMuted}">042-docker-production-audit.md</text>
    <g>
      ${code}
    </g>
    <rect x="24" y="274" width="356" height="4" rx="2" fill="url(#${id}-accent)" opacity="0.85"/>
  </g>
</svg>
`;
}

// ---------------------------------------------------------------------------
// Statistics card

const STATS_TEXT = {
  en: {
    title: 'Library at a glance',
    subtitle: 'Live numbers, generated from prompt front matter and catalog.json',
    tiles: ['Unique prompts', 'Localized files', 'Languages', 'Categories'],
    active: (n) => `${n} with prompts`,
    languagesNote: 'English · Srpski',
    filesNote: 'one per language',
    promptsNote: 'stable IDs',
    complete: (done, total) => `${done} of ${total} subcategories complete`,
    planned: (n) => `${n} planned`,
    available: 'available',
  },
  sr: {
    title: 'Biblioteka ukratko',
    subtitle: 'Brojevi uživo, generisani iz front matter-a promptova i catalog.json',
    tiles: ['Jedinstvenih promptova', 'Lokalizovanih fajlova', 'Jezika', 'Oblasti'],
    active: (n) => `${n} sa promptovima`,
    languagesNote: 'English · Srpski',
    filesNote: 'po jedan za svaki jezik',
    promptsNote: 'stabilni ID-evi',
    complete: (done, total) => `${done} od ${total} podkategorija završeno`,
    planned: (n) => `${n} planirano`,
    available: 'dostupno',
  },
};

/**
 * @param lang      language code
 * @param themeName 'light' | 'dark'
 * @param stats     object from generate-stats
 * @param rows      [{ name, available, planned, segments: [{ available, planned }] }]
 */
export function statsSvg(lang, themeName, stats, rows) {
  const th = THEMES[themeName];
  const s = STATS_TEXT[lang] ?? STATS_TEXT.en;
  const id = `s${themeName[0]}`;
  const W = 1200;
  const PAD = 56;
  const tilesY = 128;
  const tileH = 136;
  const rowsY = tilesY + tileH + 56;
  const rowH = 132;
  const H = rowsY + rows.length * rowH + 16;

  const tiles = [
    [stats.uniquePrompts, s.tiles[0], s.promptsNote],
    [stats.localizedPromptFiles, s.tiles[1], s.filesNote],
    [stats.languages, s.tiles[2], s.languagesNote],
    [stats.categories, s.tiles[3], s.active(stats.categoriesWithContent)],
  ];
  const gap = 24;
  const tileW = (W - PAD * 2 - gap * 3) / 4;
  const tileSvg = tiles
    .map(([value, label, note], i) => {
      const x = PAD + i * (tileW + gap);
      return `<g transform="translate(${x} ${tilesY})">
      <rect width="${tileW}" height="${tileH}" rx="18" fill="${th.tile}" stroke="${th.border}"/>
      <rect x="24" y="0" width="44" height="4" rx="2" fill="url(#${id}-accent)"/>
      <text x="24" y="66" font-family="${FONT}" font-size="46" font-weight="800" letter-spacing="-1" fill="url(#${id}-accent)">${esc(
        value,
      )}</text>
      <text x="24" y="96" font-family="${FONT}" font-size="17" font-weight="600" fill="${th.text}">${esc(label)}</text>
      <text x="24" y="118" font-family="${FONT}" font-size="14" fill="${th.muted}">${esc(note)}</text>
    </g>`;
    })
    .join('\n  ');

  const barW = W - PAD * 2;
  const rowSvg = rows
    .map((row, r) => {
      const y = rowsY + r * rowH;
      const pct = row.planned ? Math.round((row.available / row.planned) * 100) : 0;
      const n = row.segments.length || 1;
      const segGap = 6;
      const segW = (barW - segGap * (n - 1)) / n;
      const segments = (row.segments.length ? row.segments : [{ available: row.available, planned: row.planned }])
        .map((seg, i) => {
          const x = PAD + i * (segW + segGap);
          const fill = seg.planned ? (seg.available / seg.planned) * segW : 0;
          return `<rect x="${x.toFixed(1)}" y="${y + 40}" width="${segW.toFixed(1)}" height="18" rx="6" fill="${th.track}"/>${
            fill > 0
              ? `<rect x="${x.toFixed(1)}" y="${y + 40}" width="${fill.toFixed(1)}" height="18" rx="6" fill="url(#${id}-bar)"/>`
              : ''
          }<text x="${(x + segW / 2).toFixed(1)}" y="${y + 80}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${
            th.faint
          }">${String(i + 1).padStart(2, '0')}</text>`;
        })
        .join('\n    ');
      const done = row.segments.filter((g) => g.planned > 0 && g.available === g.planned).length;
      return `<g>
    <text x="${PAD}" y="${y + 22}" font-family="${FONT}" font-size="20" font-weight="700" fill="${th.text}">${esc(row.name)}</text>
    <text x="${W - PAD}" y="${y + 22}" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="700" fill="${th.text}">${
      row.available
    } / ${row.planned} <tspan fill="${th.muted}" font-weight="600">${s.available} · ${pct}%</tspan></text>
    ${segments}
    <text x="${PAD}" y="${y + 110}" font-family="${FONT}" font-size="15" fill="${th.muted}">${esc(
      s.complete(done, row.segments.length),
    )} · ${esc(s.planned(row.planned - row.available))}</text>
  </g>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(
    `${s.title}: ${stats.uniquePrompts} ${s.tiles[0]}, ${stats.localizedPromptFiles} ${s.tiles[1]}, ${stats.languages} ${s.tiles[2]}`,
  )}">
  ${defs(th, id)}
  <defs>
    <linearGradient id="${id}-bar" x1="0" y1="0" x2="${barW}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${th.a1}"/>
      <stop offset="0.55" stop-color="${th.a2}"/>
      <stop offset="1" stop-color="${th.a3}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="28" fill="url(#${id}-bg)" stroke="${th.border}"/>
  <clipPath id="${id}-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  <g clip-path="url(#${id}-clip)">
    <rect width="${W}" height="6" fill="url(#${id}-accent)"/>
    <circle cx="1140" cy="0" r="340" fill="url(#${id}-glow1)" opacity="0.7"/>
    <circle cx="0" cy="${H}" r="320" fill="url(#${id}-glow2)" opacity="0.6"/>
  </g>
  <text x="${PAD}" y="70" font-family="${FONT}" font-size="30" font-weight="800" letter-spacing="-0.5" fill="${th.text}">${esc(
    s.title,
  )}</text>
  <text x="${PAD}" y="100" font-family="${FONT}" font-size="16" fill="${th.muted}">${esc(s.subtitle)}</text>
  ${tileSvg}
  ${rowSvg}
</svg>
`;
}
