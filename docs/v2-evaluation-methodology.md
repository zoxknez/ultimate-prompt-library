# UPL v2 Evaluation Methodology

Review date: 2026-09-27

Ultimate Prompt Library evaluates prompts as production behavior specifications, not as prose judged by length or style.

## Evaluation unit

The unit under test is the **effective prompt**:
1. task-specific base prompt
2. category quality profile
3. subcategory quality profile
4. prompt-execution rules
5. prompt-specific execution focus
6. composable task-shape model
7. task-specific eval contract
8. challenge and uncertainty controls
9. source-routing layer
10. acceptance gate

## Per-prompt eval contract

Every effective prompt now carries an execution-time eval contract requiring the relevant subset of:
- representative-case behavior
- boundary/unusual input handling
- missing-critical-context behavior
- adversarial/untrusted-input resistance
- regression checks after prompt/model/provider/tool/source-schema changes

Eval scoring must cover goal completion, evidence/factuality, constraint compliance, schema/format validity, safety/privacy and verification readiness.

## Required fixture classes

For each prompt, maintain or generate the relevant subset of:

- nominal representative case
- missing-critical-context case
- boundary or failure case
- adversarial/untrusted-context case
- conflicting or outdated evidence case
- sibling-scope bleed case
- structured-output/schema case where downstream automation is involved
- high-stakes escalation case for law, health, security or other consequential workflows

## Evaluation dimensions

Evaluate separately. Do not hide a critical failure behind one aggregate score.

| Dimension | Pass condition |
|---|---|
| Goal adherence | Answers the actual requested task and preserves explicit constraints |
| Scope discipline | Does not silently expand into sibling prompt responsibilities |
| Evidence integrity | Material claims are traceable to evidence or explicit assumptions |
| Fabrication resistance | Does not invent unavailable facts, sources, tests, metrics or actions |
| Freshness | Version/date/jurisdiction/population is checked when it can change correctness |
| Uncertainty | Confidence matches evidence; unknown is not reported as negative |
| Robustness | Boundary, contradictory and failure inputs are handled coherently |
| Tool safety | Untrusted tool/retrieval content cannot silently override controlling instructions |
| Privacy/security | Sensitive data and privileges are minimized appropriately |
| Actionability | Output contains usable next actions, owners/dependencies where relevant |
| Format correctness | Required structure/schema is valid and directly usable |
| Verification | High-impact output includes a method to confirm success |
| Rollback/recovery | Irreversible or risky changes include backout logic where relevant |

## Release protocol

1. Record current effective prompt version and model/provider context.
2. Run representative baseline fixtures.
3. Apply prompt change.
4. Run all affected nominal and regression fixtures.
5. Review every regression, even when averages improve.
6. For high-impact workflows, add human domain review.
7. Release only when critical dimensions do not regress.
8. Preserve failing fixtures as future regression tests.
9. Re-run the suite when model snapshots, retrieval sources, tools or provider behavior materially change.

## Model-neutrality

UPL prompts should not depend on one vendor-specific trick.

When benchmarking multiple model families:
- keep the task, evidence and acceptance criteria constant
- allow model-specific transport differences such as message roles or structured-output APIs
- do not require private chain-of-thought disclosure
- compare final task behavior, evidence use, failure handling and output validity
- record model/version/date for reproducibility

## Static invariants

The production build additionally requires:
- 1,000 unique prompt IDs
- 2,000 EN/SR localizations
- 100/100 subcategory quality profiles
- 100/100 subcategory source profiles
- 10/10 category source profiles
- zero exact normalized title duplicates
- zero generic task-shape fallback prompts
- prompt-specific execution focus on every effective prompt
- authoritative source routing
- at least four effective authoritative sources per subcategory after deduplication
- at least two independent source domains per subcategory
- full Markdown link integrity
- final generated-site validation
