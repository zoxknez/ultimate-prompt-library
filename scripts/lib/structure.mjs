// Deterministic structural metrics for a prompt body.
//
// Used by validate-translations (EN/SR structural parity) and audit-prompts (diagnostics).
// The analysis is line-based and language-neutral: headings, fenced code blocks, tables and
// blockquotes are detected with CommonMark-style rules; headings inside code fences are ignored.
// Nothing here interprets meaning. The key-section detectors match heading text in English or
// Serbian and are signals for review, not proof that a section is complete or correct.

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const HEADING_RE = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t#]*$/;
const TABLE_DELIMITER_RE = /^ {0,3}\|?[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/;
const NUMBERED_RE = /^(\d+(?:\.\d+)*)[.)]?(?:\s|$)/;

/** Key sections, matched against heading text (case-insensitive, EN or SR wording). */
export const KEY_SECTIONS = {
  findingFormat: /finding[s]?\s+(reporting\s+)?(format|template)|reporting\s+template|format\s+(of\s+)?(each\s+)?(finding|nalaza)/i,
  output: /\boutput\b|\bdeliverable|\bizlaz\b|isporuk/i,
  secondPass: /second[\s-]+pass|drugi\s+prolaz/i,
  finalQualityGate: /quality\s+gate|završn\w*\s+provera\s+kvaliteta/i,
  severity: /\bseverity\b|ozbiljnost/i,
  evidence: /^(evidence|dokazi?)\b|evidence\s+(tier|hierarchy|model|standard|level|requirement)|(nivo|hijerarhij)\w*\s+dokaza/i,
};

/** Returns structural metrics for a Markdown body (front matter already removed). */
export function analyzeBody(body) {
  const lines = body.split('\n');
  const headings = { total: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  const numbered = [];
  const sections = Object.fromEntries(Object.keys(KEY_SECTIONS).map((k) => [k, 0]));
  let codeFences = 0;
  let tables = 0;
  let blockquotes = 0;
  let fence = null;
  let prevLine = '';
  let prevPrevLine = '';
  let inQuote = false;

  for (const line of lines) {
    const f = FENCE_RE.exec(line);
    if (fence) {
      if (f && f[1][0] === fence.char && f[1].length >= fence.length && !f[2].trim()) fence = null;
      prevLine = prevPrevLine = '';
      continue;
    }
    if (f && !(f[1][0] === '`' && f[2].includes('`'))) {
      fence = { char: f[1][0], length: f[1].length };
      codeFences++;
      inQuote = false;
      prevLine = prevPrevLine = '';
      continue;
    }

    const h = HEADING_RE.exec(line);
    if (h) {
      const level = h[1].length;
      headings.total++;
      headings[`h${level}`]++;
      const text = h[2].replace(/[*_`]/g, '').trim();
      const n = NUMBERED_RE.exec(text);
      if (n) numbered.push(n[1]);
      const title = text.replace(/^\d+(?:\.\d+)*[.)]?\s*/, '');
      for (const [key, re] of Object.entries(KEY_SECTIONS)) if (re.test(title)) sections[key]++;
    }

    // A table is a delimiter row under a pipe row. Many prompts contain empty matrix templates
    // with a blank line between header and delimiter; count those too so parity stays comparable.
    if (
      TABLE_DELIMITER_RE.test(line) &&
      line.includes('-') &&
      (prevLine.includes('|') || (!prevLine.trim() && prevPrevLine.includes('|')))
    )
      tables++;

    const isQuote = /^ {0,3}>/.test(line);
    if (isQuote && !inQuote) blockquotes++;
    inQuote = isQuote;
    prevPrevLine = prevLine;
    prevLine = line;
  }

  return {
    chars: [...body].length,
    bytes: Buffer.byteLength(body, 'utf8'),
    lines: lines.length,
    headings,
    numbered,
    numberedCount: numbered.length,
    codeFences,
    tables,
    blockquotes,
    sections,
    unclosedFence: Boolean(fence),
  };
}

/** Relative difference of b versus a, in percent (0 when both are 0). */
export function deltaPct(a, b) {
  if (!a && !b) return 0;
  return (Math.abs(a - b) / Math.max(a, b)) * 100;
}

export const median = (values) => {
  const s = [...values].sort((x, y) => x - y);
  if (!s.length) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
