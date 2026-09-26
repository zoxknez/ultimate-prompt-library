# Categories

English | [Srpski](categories.sr.md)

Ultimate Prompt Library is organized into ten main categories. Each category has a permanent ID prefix, its own numbering namespace and a folder in every language. Current progress for each category is shown in the [README](../README.md#categories) and the [roadmap](roadmap.md).

| # | Category | ID prefix | English folder | Serbian folder |
|---|---|---|---|---|
| 1 | IT, Programming & Technology | `UPL-IT` | [`01-it-programming-technology`](../prompts/en/01-it-programming-technology/README.md) | [`01-it-programiranje-tehnologija`](../prompts/sr/01-it-programiranje-tehnologija/README.md) |
| 2 | Economics, Finance & Business | `UPL-BIZ` | [`02-economics-finance-business`](../prompts/en/02-economics-finance-business/README.md) | [`02-ekonomija-finansije-poslovanje`](../prompts/sr/02-ekonomija-finansije-poslovanje/README.md) |
| 3 | Law & Administration | `UPL-LAW` | [`03-law-administration`](../prompts/en/03-law-administration/README.md) | [`03-pravo-administracija`](../prompts/sr/03-pravo-administracija/README.md) |
| 4 | Health, Medicine & Wellness | `UPL-HEALTH` | [`04-health-medicine-wellness`](../prompts/en/04-health-medicine-wellness/README.md) | [`04-zdravlje-medicina-wellness`](../prompts/sr/04-zdravlje-medicina-wellness/README.md) |
| 5 | Education & Learning | `UPL-EDU` | [`05-education-learning`](../prompts/en/05-education-learning/README.md) | [`05-obrazovanje-ucenje`](../prompts/sr/05-obrazovanje-ucenje/README.md) |
| 6 | Science, Research & Analysis | `UPL-SCI` | [`06-science-research-analysis`](../prompts/en/06-science-research-analysis/README.md) | [`06-nauka-istrazivanje-analiza`](../prompts/sr/06-nauka-istrazivanje-analiza/README.md) |
| 7 | Career & Professional Development | `UPL-CAREER` | [`07-career-professional-development`](../prompts/en/07-career-professional-development/README.md) | [`07-karijera-profesionalni-razvoj`](../prompts/sr/07-karijera-profesionalni-razvoj/README.md) |
| 8 | Marketing, Sales & Communication | `UPL-MKT` | [`08-marketing-sales-communication`](../prompts/en/08-marketing-sales-communication/README.md) | [`08-marketing-prodaja-komunikacija`](../prompts/sr/08-marketing-prodaja-komunikacija/README.md) |
| 9 | Productivity, Organization & Management | `UPL-PROD` | [`09-productivity-organization-management`](../prompts/en/09-productivity-organization-management/README.md) | [`09-produktivnost-organizacija-upravljanje`](../prompts/sr/09-produktivnost-organizacija-upravljanje/README.md) |
| 10 | Creativity, Design & Media | `UPL-CREATIVE` | [`10-creativity-design-media`](../prompts/en/10-creativity-design-media/README.md) | [`10-kreativnost-dizajn-mediji`](../prompts/sr/10-kreativnost-dizajn-mediji/README.md) |

## Descriptions

1. **IT, Programming & Technology** - software engineering, web and mobile development, backend, security, DevOps, data, AI and computing systems.
2. **Economics, Finance & Business** - economics, personal and corporate finance, accounting, strategy, entrepreneurship and business operations.
3. **Law & Administration** - legal research, contracts, compliance, public administration and regulatory work.
4. **Health, Medicine & Wellness** - health literacy, medicine, nutrition, physical activity, mental well-being and healthcare work.
5. **Education & Learning** - teaching, learning, curriculum design, tutoring, study methods and assessment.
6. **Science, Research & Analysis** - scientific method, research design, literature review, data analysis and critical reasoning.
7. **Career & Professional Development** - career planning, job search, interviews, professional growth and leadership.
8. **Marketing, Sales & Communication** - marketing strategy, sales, copywriting, branding, public relations and communication.
9. **Productivity, Organization & Management** - personal productivity, planning, project and team management, operations and decision-making.
10. **Creativity, Design & Media** - writing, design, visual arts, audio, video and media production.

## IT subcategories

The IT category is divided into ten subcategories. Subcategory folders use the same English machine slug in every language (`subcategory_id`), which keeps paths, tooling and future URLs stable.

| # | Subcategory | `subcategory_id` | Numbers (Initial IT Collection) |
|---|---|---|---|
| 01 | Web Development | `web-development` | 001-010 |
| 02 | Mobile Development | `mobile-development` | 011-020 |
| 03 | Backend & API | `backend-api` | 021-030 |
| 04 | Cybersecurity | `cybersecurity` | 031-040 |
| 05 | DevOps, Cloud & Infrastructure | `devops-cloud-infrastructure` | 041-050 |
| 06 | Databases & Data Engineering | `databases-data-engineering` | 051-060 |
| 07 | AI, LLM & Automation | `ai-llm-automation` | 061-070 |
| 08 | Testing, QA & Reliability | `testing-qa-reliability` | 071-080 |
| 09 | UX, UI & Product Development | `ux-ui-product-development` | 081-090 |
| 10 | Desktop, Game, Systems & Embedded | `desktop-game-systems-embedded` | 091-100 |

Prompts added after the Initial IT Collection continue at `101` and may belong to any subcategory; the number ranges above describe only the first 100.

## Business subcategories

The Economics, Finance & Business category follows the same model: ten subcategories of ten prompts, `UPL-BIZ-001` to `UPL-BIZ-100`, with English machine slugs as folder names in both languages.

| # | Subcategory | `subcategory_id` | Numbers (Initial Business Collection) |
|---|---|---|---|
| 01 | Financial Analysis & Corporate Finance | `financial-analysis-corporate-finance` | 001-010 |
| 02 | Accounting, Reporting & Financial Control | `accounting-reporting-financial-control` | 011-020 |
| 03 | Economics & Market Analysis | `economics-market-analysis` | 021-030 |
| 04 | Business Strategy & Competitive Analysis | `business-strategy-competitive-analysis` | 031-040 |
| 05 | Entrepreneurship & Business Models | `entrepreneurship-business-models` | 041-050 |
| 06 | Operations, Supply Chain & Procurement | `operations-supply-chain-procurement` | 051-060 |
| 07 | Sales, Revenue & Pricing | `sales-revenue-pricing` | 061-070 |
| 08 | Management, Leadership & Organization | `management-leadership-organization` | 071-080 |
| 09 | Risk, Compliance & Business Resilience | `risk-compliance-business-resilience` | 081-090 |
| 10 | Investment, Valuation & Due Diligence | `investment-valuation-due-diligence` | 091-100 |

## Adding a category or subcategory

Categories and subcategories are defined in [`catalog.json`](../catalog.json). Propose a new one through an issue first. See [architecture.md](architecture.md#adding-a-subcategory-or-category) for the steps.
