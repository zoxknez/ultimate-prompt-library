# UPL v2 Context-Budget and Anti-Bloat Audit

Review date: 2026-09-27

## Scope

The raw-source size distribution across all 2,000 localized prompt files was inspected, followed by an exact repeated-paragraph scan of the ten largest English task-specific prompts.

## Findings

- Localized prompt source files inspected for size: **2,000**
- Largest raw English task-specific prompt: about **72 KB**
- Ten largest English prompt sources reviewed for repeated long paragraphs: **10 / 10**
- Exact repeated long-paragraph groups found in those ten: **0**

The largest prompts are concentrated in deep IT production/security/reliability audits. Their size is primarily breadth of unique checks rather than exact copy/paste repetition.

## Risk

A prompt can be non-redundant and still be too broad for one execution pass. Mechanical execution of every checklist item can:
- dilute attention from high-risk findings
- create checklist-shaped output noise
- waste context on non-applicable checks
- encourage shallow coverage instead of verified depth
- silently truncate later sections on smaller-context models

## V2 mitigation

The shared prompt-execution layer now requires:
- an applicability ledger before deep execution of large checklists
- APPLICABLE / NOT APPLICABLE / UNKNOWN classification
- expansion only of evidence-bearing or decision-relevant material
- concise treatment of verified non-issues
- deterministic multi-pass execution when context budget threatens coverage
- explicit declaration of any unreviewed scope

The IT category profile adds an additional audit-specific applicability rule.

## Design principle

Prompt quality is evaluated by task success, evidence integrity, robustness and verification - not by prompt length. Large prompts remain justified where breadth is the product requirement, but their execution must be selective, traceable and context-aware.
