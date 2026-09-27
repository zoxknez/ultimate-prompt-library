// Token-aware keyword matching for task-shape, semantic and completion routing.
//
// Why this exists: the v2 layer used raw substring regexes such as /api|backend/ over the slug plus
// the *localized* title. That produced a class of silent routing bugs:
//   - substring collisions ("api" in "terapije", "valuation" in "evaluation", "sop" in "philosophy",
//     "etl" in "osvetljenja", "liability" in "reliability", "log" in "technology" / "uloge"),
//   - EN/SR drift, because the Serbian title was matched against English keywords, so the same
//     prompt received different rules in each language.
//
// Rules implemented here:
//   1. Routing text is language-neutral: slug + catalog English title. Localized titles are never
//      used for classification, so EN and SR always receive the same rule groups.
//   2. Matching is per token. Text is lowercased and split on every non [a-z0-9] character, so
//      hyphens, slashes, "&" and punctuation are boundaries.
//   3. Term syntax (deliberately small):
//        "word"        exact token, or a regular plural: word+s, word+es, word(-y)+ies
//        "stem*"       any token starting with stem (explicit, documented prefix match)
//        "two words"   consecutive tokens, each matched with the rules above ("red team" also
//                      matches "red-team"); the plural rule applies to every token
//      There is no infix/substring form on purpose. If a compound must match, list it explicitly
//      (for example "polypharmacy").

export function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function tokenMatches(token, part) {
  if (part.endsWith('*')) return token.startsWith(part.slice(0, -1));
  if (token === part) return true;
  if (token === part + 's' || token === part + 'es') return true;
  if (part.endsWith('y') && token === part.slice(0, -1) + 'ies') return true;
  return false;
}

const compiled = new Map();

export function compileTerm(term) {
  if (compiled.has(term)) return compiled.get(term);
  const parts = String(term).toLowerCase().split(/[\s-]+/).filter(Boolean);
  if (!parts.length) throw new Error('Empty matcher term: "' + term + '"');
  for (const part of parts) {
    if (!/^[a-z0-9]+\*?$/.test(part)) throw new Error('Invalid matcher term "' + term + '": only [a-z0-9], one trailing * per token.');
  }
  compiled.set(term, parts);
  return parts;
}

/** Returns every match of `terms` in `tokens` as { term, start, end } (end is exclusive). */
export function findTerms(tokens, terms) {
  const hits = [];
  for (const term of terms) {
    const parts = compileTerm(term);
    for (let i = 0; i + parts.length <= tokens.length; i += 1) {
      if (parts.every((part, j) => tokenMatches(tokens[i + j], part))) {
        hits.push({ term, start: i, end: i + parts.length });
      }
    }
  }
  return hits;
}

export function matchesAny(tokens, terms) {
  return findTerms(tokens, terms).length > 0;
}
