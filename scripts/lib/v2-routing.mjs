// Single source of truth for v2 keyword routing: task shapes, completion contracts and
// subject-specific semantic groups. Consumed by v2-quality.mjs (effective prompt text) and
// v2-evals.mjs (empirical eval suites), so the prompt and its eval suite can never disagree about
// a prompt's task shape.
//
// Routing is computed from language-neutral text only (slug + catalog English title) with the
// token-aware matcher in matchers.mjs. See that file for the term syntax and the collision classes
// this replaces. Rule wording is localized; rule *selection* is identical for EN and SR.

import { readFileSync } from 'node:fs';
import { findTerms, tokenize } from './matchers.mjs';

const catalog = JSON.parse(readFileSync(new URL('../../catalog.json', import.meta.url), 'utf8'));
const catalogPrompts = new Map();
for (const category of catalog.categories ?? []) {
  for (const prompt of category.prompts ?? []) catalogPrompts.set(prompt.id, { ...prompt, categoryId: category.id });
}

/**
 * Language-neutral routing tokens. Slug and English title are kept as separate segments so a
 * multi-word term never matches across the slug/title seam.
 */
export function routingSegments(data) {
  const entry = catalogPrompts.get(data?.id);
  const englishTitle = entry?.title?.en ?? (data?.language === 'sr' ? '' : data?.title ?? '');
  return {
    title: tokenize(englishTitle),
    slug: tokenize(entry?.slug ?? data?.slug ?? ''),
    categoryId: entry?.categoryId ?? data?.category_id ?? null,
  };
}

const hitsIn = (segments, terms) => [...findTerms(segments.title, terms), ...findTerms(segments.slug, terms)];

// ---------------------------------------------------------------------------
// Task shapes. Order is the order rules are emitted in; it is also the tie-break for the primary
// shape when two shapes end at the same title position.

export const TASK_SHAPES = Object.freeze([
  {
    id: 'red-team',
    terms: ['red team*', 'stress test*', 'adversarial'],
    en: [
      'Attack core assumptions and construct the strongest realistic failure scenario before recommending changes.',
      'Search for a counterexample that could invalidate the current solution or conclusion, not merely more issues.',
      'Separate decision-relevant or exploitable failure from theoretical edge cases with no material impact.',
    ],
    sr: [
      'Napadnite osnovne pretpostavke i konstruišite najjači realni failure scenario pre preporuke.',
      'Tražite counterexample koji bi mogao oboriti trenutno rešenje ili zaključak, ne samo dodatne probleme.',
      'Odvojite decision-relevant ili exploitable failure od teorijskih edge case-ova bez materijalnog uticaja.',
    ],
    completion: {
      en: 'a prioritized set of realistic failure scenarios, counterexamples, mitigations, verification steps and residual risks',
      sr: 'prioritizovan skup realnih failure scenarija, counterexample-a, mitigacija, koraka verifikacije i residual risk-a',
    },
  },
  {
    id: 'audit',
    terms: ['audit*', 'review*', 'check', 'checklist', 'checking', 'readiness', 'quality', 'inspection', 'hunter',
      'verification', 'appraisal', 'due diligence', 'diligence', 'spotting', 'detection', 'acceptance'],
    en: [
      'Define the baseline and audit criteria before findings so severity is not impression-driven.',
      'Tie every material finding to direct evidence, consequence and a reproduction path or trigger.',
      'Actively eliminate false positives through shared controls, alternative explanations and system context.',
    ],
    sr: [
      'Definišite baseline i kriterijume audita pre nalaza kako severity ne bi zavisio od utiska.',
      'Svaki materijalni nalaz povežite sa direktnim dokazom, posledicom i reprodukcijom ili triggerom.',
      'Aktivno eliminišite false positive kroz shared controls, alternativna objašnjenja i system context.',
    ],
    completion: {
      en: 'an evidence-backed finding register with severity/priority, root cause, remediation and a verification test',
      sr: 'evidence-backed registar nalaza sa severity/prioritetom, root cause-om, remedijacijom i verification testom',
    },
  },
  {
    id: 'builder',
    terms: ['builder', 'design', 'designer', 'redesign', 'plan', 'planner', 'planning', 'roadmap', 'framework',
      'system', 'strategy', 'brief', 'architecture', 'workflow', 'architect', 'playbook', 'preparation', 'prep',
      'program', 'pipeline', 'portfolio', 'direction', 'rollout', 'routine', 'pathway', 'cadence', 'rhythm',
      'feedback loop', 'structure', 'version control'],
    en: [
      'Start from objective, user/stakeholder, constraints and acceptance criteria before designing the solution.',
      'Compare at least one serious alternative and document why the selected direction better fits the context.',
      'Turn the design into implementable steps with owners, dependencies, sequence, verification and review triggers.',
    ],
    sr: [
      'Počnite od cilja, korisnika/stakeholdera, ograničenja i acceptance kriterijuma pre dizajna rešenja.',
      'Uporedite najmanje jednu ozbiljnu alternativu i dokumentujte zašto izabrani pravac bolje odgovara kontekstu.',
      'Pretvorite dizajn u implementabilne korake sa ownerima, zavisnostima, redosledom, verifikacijom i review triggerima.',
    ],
    completion: {
      en: 'an implementation-ready artifact with required inputs, structure, owners/dependencies, acceptance criteria and review triggers',
      sr: 'implementation-ready artefakt sa potrebnim inputima, strukturom, ownerima/zavisnostima, acceptance kriterijumima i review triggerima',
    },
  },
  {
    id: 'analysis',
    terms: ['analysis', 'analyses', 'analyzer', 'assessment', 'evaluation', 'map', 'mapper', 'mapping', 'comparison',
      'compare', 'diagnostic', 'interpretation', 'interpreter', 'applicability', 'enforcement', 'jurisdiction', 'synthesis',
      'triangulation', 'allocation', 'unit economics', 'economics', 'optimization', 'rationalization',
      'reconstructor', 'explainer', 'communicator', 'alignment', 'information flow', 'flow', 'differentiation',
      'divergence', 'convergence'],
    en: [
      'Define the unit of analysis, comparison basis, variables/criteria and time period before interpreting results.',
      'Check source/data quality, missingness, measurement error and alternative explanations.',
      'Use sensitivity or scenario checks when an uncertain assumption could change the decision.',
    ],
    sr: [
      'Definišite jedinicu analize, uporednu osnovu, varijable/kriterijume i period pre tumačenja rezultata.',
      'Proverite kvalitet izvora/podataka, missingness, measurement error i alternativna objašnjenja.',
      'Koristite sensitivity ili scenario proveru kada neizvesna pretpostavka može promeniti odluku.',
    ],
    completion: {
      en: 'an evidence table or structured comparison plus interpretation, sensitivity/alternatives and explicit uncertainty',
      sr: 'evidence tabela ili strukturirano poređenje uz tumačenje, sensitivity/alternative i eksplicitnu neizvesnost',
    },
  },
  {
    id: 'research',
    terms: ['research*', 'evidence', 'literature', 'finder', 'authority', 'source'],
    en: [
      'Define the research question and evidence hierarchy before searching.',
      'Use reproducible search boundaries where the task is systematic, and record inclusion/exclusion logic.',
      'Seek disconfirming evidence and distinguish source authority, relevance, recency and directness.',
    ],
    sr: [
      'Definišite istraživačko pitanje i hijerarhiju dokaza pre pretrage.',
      'Koristite reproduktibilne granice pretrage kada je zadatak sistematičan i zabeležite inclusion/exclusion logiku.',
      'Tražite disconfirming evidence i razlikujte autoritet, relevantnost, svežinu i direktnost izvora.',
    ],
    completion: {
      en: 'an evidence map that ties each answer to the research question, source authority/date/directness, inclusion/exclusion logic and open evidence gaps',
      sr: 'mapa dokaza koja svaki odgovor vezuje za istraživačko pitanje, autoritet/datum/direktnost izvora, inclusion/exclusion logiku i otvorene praznine u dokazima',
    },
  },
  {
    id: 'forecast',
    terms: ['forecast*', 'model', 'modeling', 'modelling', 'simulation', 'scenario', 'calculator', 'estimate',
      'estimator', 'valuation', 'benchmark*'],
    en: [
      'Define inputs, units, base period, model assumptions and output metric before calculation or forecasting.',
      'Separate observed inputs from estimated parameters and show sensitivity to material assumptions.',
      'Back-test or compare against an independent benchmark where feasible and state the valid operating range.',
    ],
    sr: [
      'Definišite inpute, jedinice, bazni period, model pretpostavke i output metriku pre računanja ili forecast-a.',
      'Odvojite posmatrane inpute od procenjenih parametara i prikažite sensitivity na materijalne pretpostavke.',
      'Gde je moguće uradite back-test ili poređenje sa nezavisnim benchmarkom i navedite validni opseg modela.',
    ],
    completion: {
      en: 'a reproducible calculation or model with stated inputs, units, assumptions, sensitivity range and valid operating range',
      sr: 'reproduktibilan proračun ili model sa navedenim inputima, jedinicama, pretpostavkama, sensitivity opsegom i validnim opsegom primene',
    },
  },
  {
    id: 'tracker',
    terms: ['tracker', 'monitor', 'monitoring', 'calendar', 'register', 'inventory', 'log', 'logbook', 'dashboard',
      'scorecard', 'status report', 'report', 'reporting', 'backlog'],
    en: [
      'Define source of truth, metric/field, owner, cadence and freshness rule before tracking.',
      'Add thresholds or triggers that lead to action; do not collect data without a decision use.',
      'Handle stale, missing, duplicate and conflicting states explicitly.',
    ],
    sr: [
      'Definišite source of truth, metriku/polje, ownera, cadence i freshness pravilo pre praćenja.',
      'Uvedite threshold ili trigger koji vodi ka akciji; ne skupljajte podatke bez decision use-a.',
      'Eksplicitno obradite stale, missing, duplicate i conflicting stanje.',
    ],
    completion: {
      en: 'a usable tracking schema with source of truth, owner, cadence/freshness rules, action triggers and stale/missing-data handling',
      sr: 'upotrebljiva tracking šema sa source of truth, ownerom, cadence/freshness pravilima, action triggerima i obradom stale/missing podataka',
    },
  },
  {
    id: 'generator',
    terms: ['generator', 'script', 'message', 'sequence', 'outline', 'copy', 'statement', 'memo', 'memorandum',
      'proposal', 'letter', 'newsletter', 'summary', 'response', 'request', 'guide', 'series', 'options'],
    en: [
      'Ground generated content in confirmed inputs, audience, objective, tone and channel.',
      'Do not invent facts, results, testimonials, quotes, references or personalization that was not provided.',
      'Check factual consistency, claim substantiation, next action and format-specific constraints before finalizing.',
    ],
    sr: [
      'Groundujte generisani sadržaj u potvrđenim inputima, publici, cilju, tonu i kanalu.',
      'Ne izmišljajte činjenice, rezultate, testimoniale, citate, reference ili personalizaciju koja nije data.',
      'Pre finalizacije proverite factual consistency, claim substantiation, sledeću akciju i format-specific ograničenja.',
    ],
    completion: {
      en: 'a finished reusable artifact grounded only in verified inputs, followed by a factual/format consistency check',
      sr: 'završen upotrebljiv artefakt zasnovan samo na potvrđenim inputima, uz factual/format consistency proveru',
    },
  },
  {
    id: 'decision',
    terms: ['triage', 'priorit*', 'ranking', 'selection', 'decision', 'navigator', 'navigation', 'resolution', 'resolver'],
    en: [
      'Define decision criteria and thresholds before scoring or ranking options.',
      'Separate hard constraints from preferences and make trade-offs explicit.',
      'Run a sensitivity check when small weight or threshold changes could alter the decision.',
    ],
    sr: [
      'Definišite kriterijume odluke i threshold-e pre scoring-a ili rangiranja opcija.',
      'Odvojite hard constraints od preferencija i učinite trade-offove eksplicitnim.',
      'Uradite sensitivity proveru kada male promene težina ili threshold-a mogu promeniti odluku.',
    ],
    completion: {
      en: 'explicit criteria, options, trade-offs, a decision or routing outcome, and the next evidence/action trigger',
      sr: 'eksplicitni kriterijumi, opcije, trade-offovi, odluka ili routing ishod i sledeći evidence/action trigger',
    },
  },
]);

export const TASK_SHAPE_IDS = Object.freeze(TASK_SHAPES.map((shape) => shape.id));
export const FALLBACK_TASK_SHAPE = 'analysis';

/** Every task shape whose terms occur in the routing text, in TASK_SHAPES order. */
export function matchedTaskShapes(data) {
  const segments = routingSegments(data);
  return TASK_SHAPES.filter((shape) => hitsIn(segments, shape.terms).length);
}

/**
 * The single primary task shape for a prompt, shared by the completion contract and the eval suite.
 * English titles are head-final noun phrases ("Medication Reconciliation Audit", "Causal Question &
 * DAG Builder"), so the shape whose term ends last in the title wins. Ties keep TASK_SHAPES order.
 * When the title has no shape term the slug is used the same way; otherwise the fallback applies.
 * Red-team is a mode rather than a noun ("Study Design Red-Team Review"), so it wins wherever it
 * occurs.
 */
export function primaryTaskShape(data) {
  const segments = routingSegments(data);
  const redTeam = TASK_SHAPES[0];
  if (hitsIn(segments, redTeam.terms).length) return redTeam.id;
  for (const tokens of [segments.title, segments.slug]) {
    let best = null;
    for (const shape of TASK_SHAPES) {
      for (const hit of findTerms(tokens, shape.terms)) {
        if (!best || hit.end > best.end) best = { id: shape.id, end: hit.end };
      }
    }
    if (best) return best.id;
  }
  return FALLBACK_TASK_SHAPE;
}

export function taskShapeById(id) {
  return TASK_SHAPES.find((shape) => shape.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// Subject-specific semantic groups. `categories` restricts a group to the categories where its
// rules are methodologically valid; it exists because shared vocabulary ("triage", "assessment",
// "performance", "portfolio", "interview", "pipeline") means different things in different
// domains, and the rule text is domain-specific.

export const SEMANTIC_GROUPS = Object.freeze([
  {
    id: 'meta-analysis',
    terms: ['meta analysis', 'heterogeneity', 'publication bias', 'small study'],
    en: ['Predefine effect measure/estimand, pooling rationale and heterogeneity handling; inspect influential studies and small-study/publication-bias signals before interpreting a pooled estimate.',
      'Do not pool merely because studies report a similar outcome; check population, intervention/exposure, design and measurement compatibility.'],
    sr: ['Predefinišite effect measure/estimand, opravdanost poolinga i obradu heterogenosti; proverite influential studies i small-study/publication-bias signale pre tumačenja pooled procene.',
      'Ne radite pooling samo zato što studije prijavljuju sličan outcome; proverite kompatibilnost populacije, intervencije/ekspozicije, dizajna i merenja.'],
  },
  {
    id: 'causal-inference',
    terms: ['causal', 'dag', 'difference in differences', 'instrumental variable', 'regression discontinuity', 'mediation'],
    en: ['State the causal estimand and identification assumptions before modeling; distinguish confounders, mediators, colliders and selection mechanisms.',
      'Test design-specific falsification/sensitivity conditions such as pre-trends, exclusion restriction, continuity/manipulation or unmeasured-confounding sensitivity as applicable.'],
    sr: ['Navedite causal estimand i identification pretpostavke pre modelovanja; razlikujte confounders, mediators, colliders i selection mehanizme.',
      'Testirajte design-specific falsification/sensitivity uslove kao što su pre-trends, exclusion restriction, continuity/manipulation ili sensitivity na unmeasured confounding gde je primenljivo.'],
  },
  {
    id: 'statistics',
    terms: ['regression', 'confidence interval', 'hypothesis testing', 'multiple testing', 'missing data', 'sensitivity analysis', 'statistical'],
    en: ['Define estimand, data-generating assumptions and uncertainty before choosing a test/model; report effect size and interval information rather than threshold significance alone.',
      'Check missingness, multiplicity, diagnostics and sensitivity to consequential modeling choices.'],
    sr: ['Definišite estimand, data-generating pretpostavke i neizvesnost pre izbora testa/modela; prikažite effect size i intervale umesto samo threshold značajnosti.',
      'Proverite missingness, multiplicity, diagnostics i sensitivity na važne modelarske odluke.'],
  },
  {
    id: 'medication-safety',
    categories: ['UPL-HEALTH'],
    terms: ['medication', 'drug', 'pharmac*', 'polypharmacy', 'interaction', 'dose', 'treatment safety', 'prescrib*'],
    en: ['Verify indication, formulation/route, dose context, renal/hepatic function, pregnancy/lactation, allergies, interactions, monitoring and relevant special populations before treatment-safety conclusions.',
      'Do not advise unilateral prescription starts, stops, tapering or dose changes; separate education from individualized prescribing.'],
    sr: ['Proverite indikaciju, formulaciju/put primene, kontekst doze, renalnu/hepatičku funkciju, trudnoću/dojenje, alergije, interakcije, monitoring i relevantne posebne populacije pre zaključka o bezbednosti terapije.',
      'Ne savetujte samostalno uvođenje, prekid, taper ili promenu doze propisane terapije; odvojite edukaciju od individualnog propisivanja.'],
  },
  {
    id: 'diagnostic-testing',
    categories: ['UPL-HEALTH'],
    terms: ['diagnostic', 'lab', 'laboratory', 'medical test', 'screening', 'screen'],
    en: ['Separate screening from diagnosis and reference intervals from clinical decision thresholds; incorporate pre-test probability, test characteristics and consequences of false positives/negatives.',
      'Check specimen/timing/method and population applicability before interpreting an isolated result.'],
    sr: ['Odvojite screening od dijagnoze i referentne intervale od kliničkih decision threshold-a; uključite pre-test probability, karakteristike testa i posledice false positive/negative rezultata.',
      'Proverite specimen/timing/metod i primenljivost na populaciju pre tumačenja izolovanog rezultata.'],
  },
  {
    id: 'symptom-triage',
    categories: ['UPL-HEALTH'],
    terms: ['symptom', 'triage', 'red flag', 'care navigation'],
    en: ['Check emergency/red-flag features, onset, severity, trajectory, vulnerability and immediate safety before routine self-care or navigation advice.',
      'Use safety-netting with explicit escalation triggers and timeframe; uncertainty must not delay urgent evaluation.'],
    sr: ['Proverite emergency/red-flag karakteristike, početak, težinu, tok, ranjivost i neposrednu bezbednost pre rutinskog self-care ili navigation saveta.',
      'Koristite safety-netting sa eksplicitnim escalation triggerima i vremenskim okvirom; neizvesnost ne sme odložiti hitnu procenu.'],
  },
  {
    id: 'contract-law',
    terms: ['contract', 'contracting', 'clause', 'liability', 'indemnity', 'termination', 'force majeure', 'hardship'],
    en: ['Trace defined terms, obligations, triggers, exceptions, remedies, survival and cross-references under the actual governing law and contract hierarchy.',
      'Test both ordinary performance and breach/termination scenarios; flag ambiguity that changes allocation of risk or enforceability.'],
    sr: ['Pratite definisane termine, obaveze, triggere, izuzetke, remedies, survival i cross-reference prema stvarnom governing law-u i hijerarhiji ugovora.',
      'Testirajte normalno izvršenje i breach/termination scenarije; označite nejasnoću koja menja raspodelu rizika ili enforceability.'],
  },
  {
    id: 'data-protection',
    terms: ['privacy', 'data protection', 'lawful basis', 'consent', 'data transfer', 'breach'],
    en: ['Map data categories, purposes, actors/roles, lawful basis, recipients, transfers, retention and rights before concluding compliance.',
      'Verify actual data flows and controls, not only policy language; distinguish controller, processor and joint-controller obligations where relevant.'],
    sr: ['Mapirajte kategorije podataka, svrhe, aktere/uloge, lawful basis, primaoce, transfere, retention i prava pre zaključka o usklađenosti.',
      'Proverite stvarne data flows i kontrole, ne samo tekst politike; razlikujte controller, processor i joint-controller obaveze gde je relevantno.'],
  },
  {
    id: 'compensation',
    categories: ['UPL-CAREER'],
    terms: ['salary', 'compensation', 'offer', 'counteroffer', 'negotiation', 'benefits', 'equity compensation'],
    en: ['Normalize geography, level, role scope, cash, bonus, equity, vesting, benefits, tax/context and risk before comparing compensation.',
      'Define target, reservation point, BATNA/alternatives and tradeable concessions before scripting negotiation.'],
    sr: ['Normalizujte geografiju, nivo, scope uloge, cash, bonus, equity, vesting, benefite, poreski/kontekstualni rizik pre poređenja kompenzacije.',
      'Definišite target, reservation point, BATNA/alternative i tradeable concessions pre skriptovanja pregovora.'],
  },
  {
    id: 'career-materials',
    categories: ['UPL-CAREER'],
    terms: ['resume', 'cv', 'ats', 'portfolio', 'interview', 'behavioral story'],
    en: ['Map every claim to real experience, artifact or measurable result; do not fabricate scope, seniority, tools, metrics or outcomes.',
      'Match target-role requirements while preserving natural human readability; ATS fit or interview structure must not turn into keyword stuffing or scripted fiction.'],
    sr: ['Mapirajte svaku tvrdnju na stvarno iskustvo, artefakt ili merljiv rezultat; ne izmišljajte scope, senioritet, alate, metrike ili ishode.',
      'Uskladite se sa zahtevima ciljne uloge uz prirodnu čitljivost; ATS fit ili interview struktura ne smeju postati keyword stuffing ili izmišljeni scenario.'],
  },
  {
    id: 'seo',
    terms: ['seo', 'search intent', 'keyword', 'internal link*', 'serp', 'organic growth'],
    en: ['Establish current search intent/SERP pattern and distinguish crawl, render, index, relevance, quality and conversion problems before prioritizing SEO work.',
      'Check cannibalization and page purpose; do not promise rankings or create content primarily for keyword density.'],
    sr: ['Utvrditi aktuelni search intent/SERP pattern i razlikovati crawl, render, index, relevance, quality i conversion probleme pre SEO prioritizacije.',
      'Proverite cannibalization i svrhu stranice; ne obećavajte ranking niti pravite sadržaj prvenstveno radi keyword density-ja.'],
  },
  {
    id: 'marketing-measurement',
    terms: ['attribution', 'incrementality', 'paid media', 'paid acquisition', 'creative testing', 'campaign experiment'],
    en: ['Separate platform attribution from causal incrementality; define hypothesis, primary outcome, guardrails, attribution window and economics before reading results.',
      'Use holdout/geo/causal designs where feasible and set scale/stop rules before favorable data is observed.'],
    sr: ['Odvojite platform attribution od kauzalnog incrementality-ja; definišite hipotezu, primarni outcome, guardrails, attribution window i ekonomiku pre čitanja rezultata.',
      'Koristite holdout/geo/causal dizajn gde je izvodljivo i postavite scale/stop pravila pre pojave povoljnih podataka.'],
  },
  {
    id: 'customer-retention',
    categories: ['UPL-MKT', 'UPL-BIZ', 'UPL-CAREER'],
    terms: ['retention', 'churn', 'referral', 'growth loop', 'expansion revenue'],
    en: ['Use cohort- and lifecycle-consistent windows; separate acquisition, activation, retention and expansion effects.',
      'Combine stated customer feedback with observed behavior and test whether the proposed loop has a real replenishing mechanism rather than one-time arbitrage.'],
    sr: ['Koristite cohort i lifecycle konzistentne periode; odvojite acquisition, activation, retention i expansion efekte.',
      'Kombinujte izjave kupaca sa posmatranim ponašanjem i proverite da li predloženi loop ima stvarni obnavljajući mehanizam umesto jednokratnog arbitrage-a.'],
  },
  {
    id: 'visual-system',
    terms: ['typography', 'color system', 'layout', 'grid', 'visual hierarchy', 'visual density'],
    en: ['Define hierarchy, semantic roles, responsive behavior and accessibility constraints before visual polish.',
      'Check contrast, scale, spacing, density and token/system consistency across representative breakpoints and states.'],
    sr: ['Definišite hijerarhiju, semantičke uloge, responsive ponašanje i accessibility ograničenja pre vizuelnog polish-a.',
      'Proverite kontrast, skalu, spacing, gustinu i token/system doslednost kroz reprezentativne breakpoint-e i stanja.'],
  },
  {
    id: 'interaction-design',
    terms: ['user flow', 'information architecture', 'wireframe', 'ui', 'usability', 'accessibility design', 'interface'],
    en: ['Anchor decisions in the user goal and complete state model: entry, success, empty, loading, validation, error, permission and recovery where relevant.',
      'Validate keyboard/focus, semantics, responsive/mobile behavior and WCAG-relevant accessibility before visual sign-off.'],
    sr: ['Vežite odluke za user goal i kompletan state model: entry, success, empty, loading, validation, error, permission i recovery gde je relevantno.',
      'Validirajte keyboard/focus, semantiku, responsive/mobile ponašanje i WCAG-relevant accessibility pre vizuelnog sign-off-a.'],
  },
  {
    id: 'photography',
    terms: ['photo', 'photos', 'photography', 'image', 'lighting', 'shot list', 'portrait'],
    en: ['Verify subject/property releases, licensing/rights, provenance and required metadata alongside composition/lighting quality.',
      'Preserve factual/product truth in perspective and editing; define crop/channel variants and master-delivery requirements before selection.'],
    sr: ['Proverite subject/property releases, licence/prava, provenance i potreban metadata uz kvalitet kompozicije/svetla.',
      'Sačuvajte factual/product truth u perspektivi i obradi; definišite crop/channel varijante i master-delivery zahteve pre izbora.'],
  },
  {
    id: 'time-based-media',
    terms: ['video', 'motion', 'storyboard', 'editing', 'podcast', 'audio', 'music', 'sound'],
    en: ['Define temporal structure, continuity, intelligibility, captions/transcript or other accessibility needs, rights and technical delivery targets.',
      'For audio, verify loudness/true-peak against the actual delivery platform or applicable standard; for video, verify picture/audio/caption synchronization and export variants.'],
    sr: ['Definišite temporalnu strukturu, continuity, razumljivost, captions/transcript ili druge accessibility potrebe, prava i tehničke delivery ciljeve.',
      'Za audio proverite loudness/true-peak prema stvarnoj platformi ili primenljivom standardu; za video proverite picture/audio/caption sinhronizaciju i export varijante.'],
  },
  {
    id: 'prioritization',
    terms: ['priority', 'weekly planning', 'daily execution', 'kanban', 'focus work', 'workload limit'],
    en: ['Make WIP and available capacity explicit; a priority decision must also state what is deferred, delegated, dropped or not started.',
      'Use outcome completion and flow/aging signals rather than task-count activity as the primary success evidence.'],
    sr: ['Učinite WIP i dostupan kapacitet eksplicitnim; odluka o prioritetu mora navesti i šta se odlaže, delegira, odbacuje ili ne započinje.',
      'Koristite završene ishode i flow/aging signale umesto broja taskova kao primarni dokaz uspeha.'],
  },
  {
    id: 'project-delivery',
    terms: ['project charter', 'scope definition', 'milestone', 'project risk', 'change control', 'project status', 'project recovery', 'delivery readiness'],
    en: ['Define scope boundaries, milestone outcomes, dependency owners, acceptance criteria and decision/change authority before execution.',
      'Track risk trigger, response and residual risk; status must surface decisions/blockers rather than repeat activity.'],
    sr: ['Definišite granice scope-a, milestone ishode, ownere zavisnosti, acceptance kriterijume i decision/change authority pre izvršenja.',
      'Pratite risk trigger, response i residual risk; status mora izneti odluke/blokere umesto ponavljanja aktivnosti.'],
  },
  {
    id: 'process-automation',
    terms: ['automation', 'workflow', 'sop', 'handoff', 'process map', 'bottleneck', 'cycle time'],
    en: ['Map trigger, inputs, owner, outputs, exceptions and control points before automating or redesigning the process.',
      'For automation, require idempotency/retry behavior where relevant, human fallback, observability and safe failure/rollback.'],
    sr: ['Mapirajte trigger, inpute, ownera, outpute, izuzetke i control points pre automatizacije ili redizajna procesa.',
      'Za automatizaciju zahtevajte idempotency/retry ponašanje gde je relevantno, human fallback, observability i bezbedan failure/rollback.'],
  },
  {
    id: 'learning-science',
    categories: ['UPL-EDU'],
    terms: ['retrieval', 'spacing', 'interleaving', 'metacogn*', 'assessment', 'feedback', 'rubric'],
    en: ['Tie the method to explicit learning objectives and prior knowledge; distinguish immediate performance from delayed retention and transfer.',
      'For assessment, preserve construct validity, scoring reliability/fairness and an evidence-to-action loop.'],
    sr: ['Vežite metod za eksplicitne ciljeve učenja i prethodno znanje; razlikujte trenutni performance od odloženog retention-a i transfera.',
      'Za procenu sačuvajte construct validity, scoring reliability/fairness i evidence-to-action loop.'],
  },
  {
    id: 'people-leadership',
    terms: ['leadership', 'delegation', 'one on one', 'coaching', 'team operating', 'team performance', 'manager'],
    en: ['Define the expected outcome, decision rights, context, support and escalation path; do not assign accountability without authority.',
      'Use observable behavior and team/system evidence for feedback rather than personality labels or charisma proxies.'],
    sr: ['Definišite očekivani ishod, decision rights, kontekst, podršku i escalation path; ne dodeljujte odgovornost bez autoriteta.',
      'Koristite posmatrano ponašanje i team/system dokaze za feedback umesto personality etiketa ili charisma proxy-ja.'],
  },
  {
    id: 'financial-analysis',
    terms: ['valuation', 'financial', 'cash flow', 'budget', 'forecast', 'unit economics', 'capital allocation'],
    en: ['Reconcile units, currency, period, nominal/real basis and cash/accrual treatment before comparing or calculating.',
      'Separate observed inputs from assumptions and run sensitivity/scenarios on drivers that can change the decision.'],
    sr: ['Uskladite jedinice, valutu, period, nominal/real osnovu i cash/accrual tretman pre poređenja ili računanja.',
      'Odvojite posmatrane inpute od pretpostavki i uradite sensitivity/scenario analizu drivera koji mogu promeniti odluku.'],
  },
  {
    id: 'brand-messaging',
    terms: ['brand', 'positioning', 'value proposition', 'copy', 'message', 'headline', 'offer clarity'],
    en: ['Define audience, problem, alternative, promised value and proof before optimizing wording or aesthetics.',
      'Substantiate objective claims, testimonials, endorsements, scarcity and performance claims; persuasion must not depend on deception.'],
    sr: ['Definišite publiku, problem, alternativu, obećanu vrednost i dokaz pre optimizacije formulacije ili estetike.',
      'Potkrepite objektivne tvrdnje, testimoniale, endorsements, scarcity i performance claims; persuazija ne sme zavisiti od obmane.'],
  },
  {
    id: 'crisis-communication',
    terms: ['crisis', 'press release', 'media pitch', 'reputation', 'issues management'],
    en: ['Separate verified facts, unknowns and items under investigation; map affected stakeholders, spokesperson authority and update triggers.',
      'Do not speculate about blame/cause before evidence; coordinate legal/regulatory duties and correct material errors promptly.'],
    sr: ['Odvojite potvrđene činjenice, nepoznato i ono što je pod istragom; mapirajte pogođene stakeholder-e, ovlašćenje spokesperson-a i update triggere.',
      'Ne spekulišite o krivici/uzroku pre dokaza; uskladite pravne/regulatorne obaveze i brzo ispravite materijalne greške.'],
  },
  {
    id: 'knowledge-management',
    terms: ['knowledge', 'documentation', 'taxonomy', 'archive', 'single source', 'information retrieval'],
    en: ['Define source of truth, owner, users, findability path, freshness/review rule and retention/archive behavior.',
      'Test retrieval with real user questions and remove duplicate or stale sources that create conflicting answers.'],
    sr: ['Definišite source of truth, ownera, korisnike, findability path, freshness/review pravilo i retention/archive ponašanje.',
      'Testirajte retrieval stvarnim korisničkim pitanjima i uklonite duplicate ili stale izvore koji stvaraju konfliktne odgovore.'],
  },
  {
    id: 'application-security',
    terms: ['security', 'auth', 'threat', 'vulnerability', 'pentest', 'authorization', 'authentication'],
    en: ['Map trust boundaries, attacker capability, reachable surface and privileged operations before rating severity.',
      'Verify server-side authorization, secret handling, exploit preconditions and effective mitigations; theoretical weakness without reachability is not automatically a vulnerability.'],
    sr: ['Mapirajte trust boundaries, capability napadača, reachable surface i privilegovane operacije pre severity ocene.',
      'Proverite server-side autorizaciju, tajne, exploit preconditions i efektivne mitigacije; teorijska slabost bez reachability-ja nije automatski ranjivost.'],
  },
  {
    id: 'data-engineering',
    categories: ['UPL-IT', 'UPL-SCI'],
    terms: ['database', 'sql', 'data engineering', 'etl', 'pipeline', 'migration'],
    en: ['Check schema constraints, transaction boundaries, idempotency, ordering, backfill/replay and migration rollback before data-integrity conclusions.',
      'Measure on realistic data volume/cardinality and verify indexes/query plans or pipeline bottlenecks rather than inferring performance from syntax.'],
    sr: ['Proverite schema constraints, transaction boundaries, idempotency, ordering, backfill/replay i migration rollback pre zaključka o integritetu podataka.',
      'Merite na realnom volume/cardinality-ju i proverite indexes/query plans ili pipeline bottleneck umesto zaključivanja o performance-u iz sintakse.'],
  },
  {
    id: 'api-backend',
    terms: ['api', 'backend'],
    en: ['Validate contract/schema, authentication/authorization, input normalization, idempotency, rate/abuse controls, errors and version compatibility.',
      'Trace downstream storage/services and partial-failure behavior; a correct handler in isolation is not enough.'],
    sr: ['Validirajte contract/schema, authentication/authorization, input normalizaciju, idempotency, rate/abuse kontrole, errors i version compatibility.',
      'Pratite downstream storage/services i partial-failure ponašanje; korektan handler u izolaciji nije dovoljan.'],
  },
  {
    id: 'mobile',
    terms: ['mobile', 'android', 'ios'],
    en: ['Include lifecycle/backgrounding, offline/network transitions, permissions, secure storage, device/OS variation and release/store constraints.',
      'Verify behavior on supported minimum/current OS versions and degraded connectivity, not only a happy-path emulator.'],
    sr: ['Uključite lifecycle/backgrounding, offline/network prelaze, permissions, secure storage, device/OS varijacije i release/store ograničenja.',
      'Proverite ponašanje na podržanim minimalnim/aktuelnim OS verzijama i degraded connectivity, ne samo happy-path emulator.'],
  },
  {
    id: 'service-reliability',
    categories: ['UPL-IT'],
    terms: ['performance', 'reliability', 'incident', 'observability', 'resilience', 'recovery'],
    en: ['Define workload/SLO or operational threshold, failure domain and measurement method before labeling a performance or reliability issue.',
      'Test timeout/retry/backoff, saturation, partial dependency failure, observability and recovery; verify that mitigation does not create retry storms or hidden data loss.'],
    sr: ['Definišite workload/SLO ili operativni threshold, failure domain i metod merenja pre označavanja performance/reliability problema.',
      'Testirajte timeout/retry/backoff, saturation, partial dependency failure, observability i recovery; proverite da mitigation ne stvara retry storm ili skriven gubitak podataka.'],
  },
]);

/** Semantic groups whose terms occur in the routing text and whose category scope allows them. */
export function matchedSemanticGroups(data) {
  const segments = routingSegments(data);
  return SEMANTIC_GROUPS.filter((group) =>
    (!group.categories || group.categories.includes(segments.categoryId)) && hitsIn(segments, group.terms).length
  );
}

/** Debug/audit helper: which terms fired for a prompt. */
export function explainRouting(data) {
  const segments = routingSegments(data);
  const describe = (items) => items
    .map((item) => ({ id: item.id, terms: [...new Set(hitsIn(segments, item.terms).map((hit) => hit.term))] }))
    .filter((item) => item.terms.length);
  return {
    primaryTaskShape: primaryTaskShape(data),
    taskShapes: describe(TASK_SHAPES),
    semanticGroups: describe(SEMANTIC_GROUPS).filter((item) => {
      const group = SEMANTIC_GROUPS.find((g) => g.id === item.id);
      return !group.categories || group.categories.includes(segments.categoryId);
    }),
  };
}
