# Source Freshness

Review date: 2026-09-27

Every effective prompt cites authoritative starting sources from two registry files:

- `scripts/v2-source-profiles.json` - 10 category profiles
- `scripts/v2-subcategory-source-profiles.json` - 100 subcategory profiles

`npm run sources:check` keeps that registry honest. It reports candidates for **human review**; it never edits the registry, and an HTTP 200 alone is never treated as "current".

## Commands

```bash
npm run sources:check -- --offline           # structure only, no network (part of npm run validate)
npm run sources:check                        # online metadata check of every unique URL
npm run sources:check -- --url=<registry url>
npm run sources:check -- --update-snapshot   # online check, then record observed metadata
```

Options: `--concurrency=1..8` (default 4, and never more than one request per host at a time), `--timeout-ms=2000..120000` (default 20000), `--json`.

Exit codes: `0` no blocking problem (review items may still be listed), `1` structural error or a `BROKEN` source, `2` usage error, `4` `NOT_RUN_NO_NETWORK`.

## Offline structural checks

- every profile is a non-empty list of `{ label, url, note? }` with no unknown fields
- URLs parse, use HTTPS, embed no credentials and are unique per profile
- a draft, consultation or proposed source (by label or URL) carries an explicit status note
- the snapshot has the expected schema, holds metadata only (entry size is capped), and has no entries for URLs that left the registry
- warnings list registry URLs that have never been checked online

`validate-v2` additionally requires at least four effective sources and two independent domains per subcategory.

## Online statuses

| Status | Meaning | Needs review |
|---|---|---|
| `REACHABLE` | fetched; nothing changed versus the snapshot (or no snapshot yet, which is stated) | no |
| `REDIRECTED` | the URL redirects; locale query changes and trailing slashes are ignored | when it crosses to another site or lands on the root of another host |
| `CHANGED` | the page title or final URL differs from the snapshot | yes |
| `POSSIBLY_UPDATED` | page modified date, a newer year/version in the title, or the headings/description changed; or a registry "draft" no longer shows draft status | yes |
| `DRAFT_STATUS` | the page shows draft/consultation status | only if the registry does not declare it |
| `POSSIBLY_SUPERSEDED` | "superseded by", "has been withdrawn", "has been revised by", "will be replaced by" and similar signals | yes |
| `BROKEN` | 404/410, a same-host redirect to the homepage (soft 404), a redirect loop, or a redirect to a non-HTTPS location | yes |
| `TIMEOUT` | no response within the timeout | recheck |
| `UNKNOWN` | 401/403/429/451 (blocked or rate limited), 5xx, TLS or connection errors: not evidence of a broken source | recheck manually |
| `NOT_RUN_NO_NETWORK` | DNS failed for the probe hosts, or every request failed at the network layer | nothing was judged |

Two registry URLs that resolve to the same final document are flagged as redundant.

Design choices, each from an observed failure mode:

- Draft and superseded signals are read from the title, the first headings and the meta description, plus only strong phrases in body text. NIST CSRC shows "(Initial Public Draft)" in a heading next to the title, while final pages list old drafts in history tables, and the EMA medicines page mentions "withdrawn" applications.
- ETag and Last-Modified are recorded but not flagged on their own: EDPB and O*NET regenerated them within one minute without any content change.
- The checker identifies itself honestly (`UltimatePromptLibrary-SourceFreshness/1`) and does not imitate a browser. Sites that block non-browser clients (ISO, OECD, FTC, PMI, SEC, BLS and others on 2026-09-27) are reported as `UNKNOWN` and must be verified manually (see "Manual verification" below).
- Title changes are only compared between two real titles. EUR-Lex sometimes serves a page without a title, and owasp.org sometimes serves only the site name ("OWASP Foundation") before client-side rendering; neither is a document change.
- Declared draft status comes from the label or URL only. Notes may mention a different document's draft (the SSDF 1.1 final entry notes that SSDF 1.2 is a draft).

## Manual verification

`scripts/v2-source-manual-verification.json` records sources that were checked in a real browser because they block automated clients or were unreachable. Each entry has the date, method (`browser`), finding (`VERIFIED` or `UNREACHABLE`), HTTP status, final URL, title and notes. The offline check validates the file (registry URLs only, no future dates, complete `VERIFIED` entries). In online runs, a blocked source with a `VERIFIED` entry younger than 180 days is not listed for recheck; `UNREACHABLE` and expired entries are. After 180 days an entry must be re-verified.

## Snapshot

`scripts/v2-source-freshness-snapshot.json` stores, per URL: check time, final URL, HTTP status, ETag, Last-Modified, page modified date, normalized title, version/year signals, status signals and a SHA-256 fingerprint of the title, first headings and description. It contains no page bodies. It is updated only with `--update-snapshot`, which the operator runs after reviewing the flagged sources; updating the snapshot acknowledges `CHANGED` and `POSSIBLY_UPDATED` results. Draft and superseded signals are recomputed from the page on every run, so updating the snapshot does not hide them.

Online reports are written to `.source-checks/` (git-ignored). The scheduled `Source freshness` workflow runs the same check weekly and uploads the report; it does not gate merges.

## 2026-09-27 run

142 unique URLs on 75 hosts. Result after review and fixes: 99 `REACHABLE`, 11 `REDIRECTED` (locale or path normalization on the same site), 1 `DRAFT_STATUS` (NIST SP 800-218 Rev. 1 Initial Public Draft, declared in the registry), 31 `UNKNOWN` (blocked non-browser clients or connection resets), 0 `BROKEN`.

Registry changes made after manual verification on the publishers' sites:

| Old URL | Finding | New URL |
|---|---|---|
| `https://www.coso.org/Pages/ic.aspx` | HTTP 404 | `https://www.coso.org/internal-control` |
| `https://owasp.org/API-Security/` | project moved to its own subdomain | `https://api-security.owasp.org/` |
| `https://www.go-fair.org/fair-principles/` | 301 to the GO FAIR Foundation | `https://www.gofair.foundation/fair-principles` |
| `https://www.iaasb.org/publications-resources` | 301 to a generic IFAC search page | `https://www.iaasb.org/standards-pronouncements` |
| `https://www.edpb.europa.eu/our-work-tools/our-documents_en` | 301 to `documents_en`, which the Law profile already cited | removed from the Law profile; subcategory entry points to `documents_en` |

Added after the representative domain audit: OWASP ASVS 5.0.0 (cybersecurity), NICE NG5 Medicines optimisation, which covers medicines reconciliation (medications and treatment safety), and IVSC International Valuation Standards (investment, valuation and due diligence).

Manually confirmed on 2026-09-27: OWASP Top 10 for LLM Applications 2025 is still the current release; WCAG 2.2 is a W3C Recommendation (12 December 2024); NIST states that AI RMF 1.0 is being revised; NIST SP 800-218 Rev. 1 is still an Initial Public Draft.

### Browser verification of the 31 blocked sources (2026-09-27)

The 31 sources the checker could not see (HTTP 403 to automated clients, or connection failures) were opened in a real browser:

- **26 verified**, including ISO 9001:2026 (Published, 2026-09, edition 6), ISO 31000:2018, ISO 22361:2022, ISO 30401:2018 (stage 90.92, to be revised; already noted in the registry), G20/OECD Principles of Corporate Governance 2023, PMBOK Guide Eighth Edition, EBU R 128 version 5.0, the FTC consumer reviews and testimonials final rule (August 2024), HUDOC, SEC EDGAR, BLS OOH, CEFR and IMF Data.
- **2 real problems found and fixed:**
  - `https://www.ftc.gov/news-events/topics/consumer-protection` returns HTTP 404. Replaced by the FTC Bureau of Consumer Protection page.
  - COPE retired its Core Practices in 2024 and published a new Code of Conduct in July 2026 (confirmed on COPE's history page). The registry now cites the Code of Conduct with a status note.
- **Canonical URLs:** ten OECD, SIGMA, IMF and ISO URLs only worked through redirects to new site structures and now point directly at the final pages (for example `https://www.oecd.org/cfe/smes/` to `https://www.oecd.org/en/topics/smes-and-entrepreneurship.html`, SIGMA to its 2023 edition).
- **5 UNREACHABLE (BLOCKED):** four unesco.org pages and ibe.unesco.org. The UNESCO server timed out from the local network and refused connections from a second network, so nothing could be confirmed. They stay on the recheck list; this is not evidence that the pages are gone.

After these changes, three consecutive online runs reported 0 sources needing review: 99 `REACHABLE`, 11 `REDIRECTED`, 1 `DRAFT_STATUS` (declared), and 31 `UNKNOWN`, of which 26 are covered by browser verification and 5 are the UNESCO pages.
