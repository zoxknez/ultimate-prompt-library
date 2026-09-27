# UPL External Source Registry v2

Last reviewed: 2026-09-27

This registry lists authoritative starting points used to strengthen Ultimate Prompt Library v2. Every prompt also receives a subcategory-specific source profile. Sources must still be checked for the latest applicable version, jurisdiction, population and task context at execution time.

## Cross-domain AI and prompt quality

- OpenAI Prompting Guide
  - https://developers.openai.com/api/docs/guides/prompting
  - Treat production prompts as code-managed artifacts with tests/evals and validated dynamic inputs.
- OpenAI Prompt Engineering Guide
  - https://developers.openai.com/api/docs/guides/prompt-engineering
  - Current guidance covers message roles, structured prompt boundaries, versioning and evaluation across model changes.
- OpenAI Safety Best Practices
  - https://developers.openai.com/api/docs/guides/safety-best-practices
  - Use human review for high-stakes outputs and code generation, constrain untrusted input where appropriate, and preserve access to source evidence for verification.
- NIST AI Risk Management Framework and Generative AI Profile
  - https://airc.nist.gov/
  - AI RMF 1.0 is being revised; the Generative AI Profile remains a key companion resource.
- OWASP Top 10 for LLM Applications 2025
  - https://genai.owasp.org/llm-top-10/
- Google Gemini prompt design strategies
  - https://ai.google.dev/gemini-api/docs/prompting-strategies
  - Current guidance emphasizes clear/direct instructions, consistent structure, explicit output constraints, decomposition, grounding/tool use and iterative refinement.
- Anthropic Prompting Best Practices
  - https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
  - Current guidance emphasizes clear/direct instructions, contextual explanation, representative examples, explicit structure, tool-use discipline and agentic safeguards.

## IT, programming and technology

- NIST SP 800-218, SSDF v1.1 - **final**
  - https://csrc.nist.gov/pubs/sp/800/218/final
- NIST SP 800-218 Rev. 1, SSDF v1.2 - **draft**, published 2025-12-17
  - https://csrc.nist.gov/pubs/sp/800/218/r1/ipd
  - Treat as draft/future-facing guidance, not the final baseline.
- NIST SP 800-218A, GenAI and Dual-Use Foundation Model SSDF Community Profile - **final**
  - https://csrc.nist.gov/pubs/sp/800/218/a/final
- NIST Cybersecurity Framework 2.0
  - https://www.nist.gov/cyberframework
- CIS Critical Security Controls v8.1
  - https://www.cisecurity.org/controls/v8-1
- CISA Secure by Design
  - https://www.cisa.gov/securebydesign
- OWASP Top 10 for LLM Applications 2025
  - https://genai.owasp.org/llm-top-10/

## Business, governance and quality

- ISO Quality Management Principles
  - https://committee.iso.org/quality-management/principles
- ISO 9001:2026 - Quality management systems - Requirements
  - https://www.iso.org/standard/9001
  - Current edition published 2026-09-16; replaces ISO 9001:2015.
- ISO 31000:2018 Risk management - Guidelines
  - https://www.iso.org/standard/65694.html
- ISO 30401:2018 Knowledge Management Systems
  - https://www.iso.org/standard/68683.html
  - Current published edition with 2022 and 2024 amendments, but under revision. ISO/DIS 30401 closed its ballot on 2026-09-18; verify status before use.

## Creativity, design and media

- W3C WCAG 2.2
  - https://www.w3.org/TR/WCAG22/
  - W3C's 2026 materials continue to treat WCAG 2.2 as the latest WCAG 2 Recommendation.
- W3C ARIA Authoring Practices Guide
  - https://www.w3.org/WAI/ARIA/apg/
- W3C Media Accessibility User Requirements
  - https://www.w3.org/TR/media-accessibility-reqs/
- Design Tokens Format Module 2025.10 - Final Community Group Report
  - https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/
  - First stable production-ready Design Tokens format from the Community Group; it is not a W3C Recommendation or standards-track specification.
- Design Tokens Color Module 2025.10
  - https://www.w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/
- Design Tokens Resolver Module 2025.10
  - https://www.w3.org/community/reports/design-tokens/CG-FINAL-resolver-20251028/

## Freshness checks and 2.4.0 registry changes

The machine-readable registry is `scripts/v2-source-profiles.json` plus `scripts/v2-subcategory-source-profiles.json`. `npm run sources:check` validates its structure offline and checks every URL online for redirects, broken links, draft/superseded signals and changes against a metadata snapshot. See [Source freshness](source-freshness.md) for statuses and the full 2026-09-27 run.

Changes verified on the publishers' sites on 2026-09-27:

- COSO Internal Control moved to https://www.coso.org/internal-control (the old URL returned 404).
- OWASP API Security Top 10 moved to https://api-security.owasp.org/.
- FAIR Principles now live at https://www.gofair.foundation/fair-principles.
- IAASB Standards and Pronouncements: https://www.iaasb.org/standards-pronouncements (the old publications URL redirected to a generic IFAC search).
- EDPB: the Law profile cited the same document twice under two URLs; only https://www.edpb.europa.eu/documents_en remains.
- Added OWASP ASVS 5.0.0 (https://owasp.org/projects/asvs) for cybersecurity, NICE NG5 Medicines optimisation (https://www.nice.org.uk/guidance/ng5, covers medicines reconciliation) for medications and treatment safety, and IVSC International Valuation Standards (https://ivsc.org/standards/) for investment, valuation and due diligence.

## Use rule

These are starting points, not universal substitutes for local law, domain standards, primary evidence, current product documentation or current platform behavior.

At execution time:
1. select only sources relevant to the exact task;
2. verify that the linked guidance is still current;
3. prefer binding/current primary authority when available;
4. record jurisdiction, population, version/date and exact claim supported;
5. lower confidence when current authoritative evidence cannot be verified.


### Additional creative-production authorities

- WIPO Copyright FAQ
  - https://www.wipo.int/en/web/copyright/faq-copyright
  - General copyright/originality concepts; local law still controls legal conclusions.
- C2PA Technical Specification 2.2
  - https://spec.c2pa.org/specifications/specifications/2.2/index.html
  - Content provenance and authenticity for digital media workflows.
- IPTC Photo Metadata Standard 2025.1
  - https://iptc.org/standards/photo-metadata/iptc-standard/
  - Professional photo metadata, rights information and AI-generated-content metadata.
- EBU R 128
  - https://tech.ebu.ch/publications/r128
  - Programme loudness normalisation guidance; platform-specific delivery targets still require verification.


### Marketing review/testimonial regulation

- FTC Consumer Reviews and Testimonials Rule - 16 CFR Part 465
  - https://www.ftc.gov/legal-library/browse/rules/rulemaking-use-consumer-reviews-testimonials
  - Final rule effective 2024-10-21; covers fake or false reviews/testimonials, certain incentivized reviews, insider reviews, review suppression and fake social indicators.


### Career taxonomy freshness - 2026-09-27

- O*NET Database 31.0
  - https://www.onetcenter.org/database.html
  - Current production release, August 2026.
- ESCO v1.2.1
  - https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/esco-versions
  - Current ESCO version, released 2025-12-10.


### NIST SSDF status - 2026-09-27

- NIST SP 800-218 - SSDF Version 1.1 (Final)
  - https://csrc.nist.gov/pubs/sp/800/218/final
- NIST SP 800-218A - GenAI SSDF Community Profile (Final)
  - https://csrc.nist.gov/pubs/sp/800/218/a/final
- NIST SP 800-218 Rev.1 - SSDF Version 1.2 (Initial Public Draft)
  - https://csrc.nist.gov/pubs/sp/800/218/r1/ipd
  - Draft only as of 2026-09-27; do not cite as a final normative baseline.


### Legal-source status checks

- HCCH Status Charts
  - https://www.hcch.net/en/instruments/status-charts
  - Verify treaty participation, entry into force, declarations, reservations and extensions for the relevant state.
- EDPB Documents
  - https://www.edpb.europa.eu/documents_en
  - Verify whether guidance is adopted/final, under consultation or superseded before relying on it.


### Education freshness - 2026-09-27

- EEF Metacognition and Self-Regulated Learning - Second Edition
  - https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition
  - Second Edition published 2025-11-13.
- UNESCO AI Competency Framework for Teachers
  - https://www.unesco.org/en/articles/ai-competency-framework-teachers
  - Published 2024-08-08; page last updated 2026-01-16.
- UNESCO AI Competency Framework for Students
  - https://www.unesco.org/en/articles/ai-competency-framework-students
  - Published 2024-08-08; page last updated 2026-01-16.


### Business and reporting freshness - 2026-09-27

- IFRS Accounting Standards Navigator - 2026 collection
  - https://www.ifrs.org/issued-standards/list-of-standards/
  - Verify the effective date and transition requirements of the specific Standard or amendment before application.
- G20/OECD Principles of Corporate Governance 2023
  - https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en.html
  - Revised benchmark edition endorsed by G20 leaders in September 2023.
