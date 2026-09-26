# Oblasti

[English](categories.md) | Srpski

Ultimate Prompt Library je organizovana u deset glavnih oblasti. Svaka oblast ima trajni ID prefiks, sopstveni prostor numeracije i folder u svakom jeziku. Trenutni napredak svake oblasti prikazan je u [README-u](../README.sr.md#oblasti) i [roadmap-u](roadmap.sr.md).

| # | Oblast | ID prefiks | Srpski folder | Engleski folder |
|---|---|---|---|---|
| 1 | IT, programiranje i tehnologija | `UPL-IT` | [`01-it-programiranje-tehnologija`](../prompts/sr/01-it-programiranje-tehnologija/README.md) | [`01-it-programming-technology`](../prompts/en/01-it-programming-technology/README.md) |
| 2 | Ekonomija, finansije i poslovanje | `UPL-BIZ` | [`02-ekonomija-finansije-poslovanje`](../prompts/sr/02-ekonomija-finansije-poslovanje/README.md) | [`02-economics-finance-business`](../prompts/en/02-economics-finance-business/README.md) |
| 3 | Pravo i administracija | `UPL-LAW` | [`03-pravo-administracija`](../prompts/sr/03-pravo-administracija/README.md) | [`03-law-administration`](../prompts/en/03-law-administration/README.md) |
| 4 | Zdravlje, medicina i wellness | `UPL-HEALTH` | [`04-zdravlje-medicina-wellness`](../prompts/sr/04-zdravlje-medicina-wellness/README.md) | [`04-health-medicine-wellness`](../prompts/en/04-health-medicine-wellness/README.md) |
| 5 | Obrazovanje i učenje | `UPL-EDU` | [`05-obrazovanje-ucenje`](../prompts/sr/05-obrazovanje-ucenje/README.md) | [`05-education-learning`](../prompts/en/05-education-learning/README.md) |
| 6 | Nauka, istraživanje i analiza | `UPL-SCI` | [`06-nauka-istrazivanje-analiza`](../prompts/sr/06-nauka-istrazivanje-analiza/README.md) | [`06-science-research-analysis`](../prompts/en/06-science-research-analysis/README.md) |
| 7 | Karijera i profesionalni razvoj | `UPL-CAREER` | [`07-karijera-profesionalni-razvoj`](../prompts/sr/07-karijera-profesionalni-razvoj/README.md) | [`07-career-professional-development`](../prompts/en/07-career-professional-development/README.md) |
| 8 | Marketing, prodaja i komunikacija | `UPL-MKT` | [`08-marketing-prodaja-komunikacija`](../prompts/sr/08-marketing-prodaja-komunikacija/README.md) | [`08-marketing-sales-communication`](../prompts/en/08-marketing-sales-communication/README.md) |
| 9 | Produktivnost, organizacija i upravljanje | `UPL-PROD` | [`09-produktivnost-organizacija-upravljanje`](../prompts/sr/09-produktivnost-organizacija-upravljanje/README.md) | [`09-productivity-organization-management`](../prompts/en/09-productivity-organization-management/README.md) |
| 10 | Kreativnost, dizajn i mediji | `UPL-CREATIVE` | [`10-kreativnost-dizajn-mediji`](../prompts/sr/10-kreativnost-dizajn-mediji/README.md) | [`10-creativity-design-media`](../prompts/en/10-creativity-design-media/README.md) |

## Opisi

1. **IT, programiranje i tehnologija** - softversko inženjerstvo, web i mobilni razvoj, backend, bezbednost, DevOps, podaci, AI i računarski sistemi.
2. **Ekonomija, finansije i poslovanje** - ekonomija, lične i korporativne finansije, računovodstvo, strategija, preduzetništvo i poslovne operacije.
3. **Pravo i administracija** - pravna istraživanja, ugovori, usklađenost sa propisima, javna uprava i regulatorni poslovi.
4. **Zdravlje, medicina i wellness** - zdravstvena pismenost, medicina, ishrana, fizička aktivnost, mentalno blagostanje i rad u zdravstvu.
5. **Obrazovanje i učenje** - podučavanje, učenje, dizajn nastavnog programa, tutorstvo, metode učenja i ocenjivanje.
6. **Nauka, istraživanje i analiza** - naučni metod, dizajn istraživanja, pregled literature, analiza podataka i kritičko rasuđivanje.
7. **Karijera i profesionalni razvoj** - planiranje karijere, traženje posla, intervjui, profesionalni rast i liderstvo.
8. **Marketing, prodaja i komunikacija** - marketinška strategija, prodaja, copywriting, brendiranje, odnosi s javnošću i komunikacija.
9. **Produktivnost, organizacija i upravljanje** - lična produktivnost, planiranje, upravljanje projektima i timovima, operacije i donošenje odluka.
10. **Kreativnost, dizajn i mediji** - pisanje, dizajn, vizuelne umetnosti, audio, video i medijska produkcija.

## IT podkategorije

IT oblast je podeljena na deset podkategorija. Folderi podkategorija koriste isti engleski mašinski slug u svim jezicima (`subcategory_id`), što čuva stabilnost putanja, alata i budućih URL-ova.

| # | Podkategorija | `subcategory_id` | Brojevi (početna IT kolekcija) |
|---|---|---|---|
| 01 | Web razvoj | `web-development` | 001-010 |
| 02 | Mobilni razvoj | `mobile-development` | 011-020 |
| 03 | Backend i API | `backend-api` | 021-030 |
| 04 | Sajber bezbednost | `cybersecurity` | 031-040 |
| 05 | DevOps, cloud i infrastruktura | `devops-cloud-infrastructure` | 041-050 |
| 06 | Baze podataka i data engineering | `databases-data-engineering` | 051-060 |
| 07 | AI, LLM i automatizacija | `ai-llm-automation` | 061-070 |
| 08 | Testiranje, QA i pouzdanost | `testing-qa-reliability` | 071-080 |
| 09 | UX, UI i razvoj proizvoda | `ux-ui-product-development` | 081-090 |
| 10 | Desktop, igre, sistemi i embedded | `desktop-game-systems-embedded` | 091-100 |

Promptovi dodati posle početne IT kolekcije nastavljaju od broja `101` i mogu pripadati bilo kojoj podkategoriji; gornji opsezi brojeva odnose se samo na prvih 100.

## Dodavanje oblasti ili podkategorije

Oblasti i podkategorije su definisane u [`catalog.json`](../catalog.json). Novu oblast ili podkategoriju prvo predloži kroz issue. Koraci su opisani u [architecture.md](architecture.md#adding-a-subcategory-or-category).
