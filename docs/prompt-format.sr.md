# Format promptova

[English](prompt-format.md) | Srpski

Ovaj dokument definiše format fajla koji svaki prompt mora da prati i preporučenu strukturu sadržaja prompta. Format fajla proverava `npm run validate:prompts`; struktura sadržaja je smernica.

## Lokacija i ime fajla

```text
prompts/<jezik>/<folder-oblasti>/<folder-podkategorije>/NNN-kebab-case-slug.md
```

- `<jezik>` je kod jezika iz [`catalog.json`](../catalog.json) (`en`, `sr`).
- `<folder-oblasti>` je lokalizovani folder oblasti za taj jezik (na primer `01-it-programming-technology` / `01-it-programiranje-tehnologija`).
- `<folder-podkategorije>` je `NN-<subcategory_id>` i **isti je u svim jezicima**.
- `NNN` je trocifreni broj prompta unutar oblasti (`001`-`999`).
- Slug je kebab-case malim slovima (`a-z`, `0-9`, `-`).
- Sve jezičke verzije prompta koriste **isto ime fajla**.

Primer:

```text
prompts/en/01-it-programming-technology/05-devops-cloud-infrastructure/042-docker-production-audit.md
prompts/sr/01-it-programiranje-tehnologija/05-devops-cloud-infrastructure/042-docker-production-audit.md
```

## Front matter

Svaki prompt fajl počinje YAML front matter-om, posle kojeg sledi prazan red i sadržaj prompta.

```yaml
---
id: UPL-IT-035
number: 35
slug: secrets-and-credential-exposure-audit
title: Secrets & Credential Exposure Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---
```

### Obavezna polja

| Polje | Pravilo |
|---|---|
| `id` | `UPL-<OBLAST>-NNN`; mora biti jednak `category_id` + `-` + `number` dopunjen nulama. Trajan. Pogledaj [ids.md](ids.md). |
| `number` | Ceo broj 1-999; mora odgovarati prefiksu `NNN` u imenu fajla. |
| `slug` | Kebab-case; mora odgovarati imenu fajla posle `NNN-` i slug-u registrovanom u `catalog.json`. |
| `title` | Naziv prompta. Treba da odgovara nazivu u katalogu (razlika se prijavljuje kao upozorenje). |
| `category` | Naziv oblasti na jeziku fajla, tačno kao u `catalog.json` (npr. `IT, Programming & Technology` / `IT, programiranje i tehnologija`). |
| `category_id` | ID oblasti, isti u svim jezicima (npr. `UPL-IT`). |
| `subcategory` | Naziv podkategorije na jeziku fajla, tačno kao u `catalog.json` (npr. `Cybersecurity` / `Sajber bezbednost`). |
| `subcategory_id` | Mašinski slug podkategorije, isti u svim jezicima; mora odgovarati folderu podkategorije. |
| `language` | Mora odgovarati folderu jezika (`en` u `prompts/en/`, `sr` u `prompts/sr/`). |
| `version` | `MAJOR.MINOR.PATCH`, pogledaj [Verzionisanje](#verzionisanje). |
| `status` | Jedan od `draft`, `review`, `stable`, `deprecated`. |

### Opciona polja

| Polje | Pravilo |
|---|---|
| `tags` | Lista kebab-case stringova, npr. `[security, backend]`. |
| `replaced_by` | ID prompta koji zamenjuje zastareli prompt, npr. `UPL-IT-120`. |
| `updated` | Datum poslednje značajne izmene, `YYYY-MM-DD`. Dodaj samo kada je datum poznat. |
| `authors` | Lista imena autora ili GitHub naloga. Dodaj samo stvarne autore koje je moguće proveriti. |

Validator odbija svako drugo polje, što štiti od grešaka u kucanju. Nova polja predloži kroz issue.

### Statusi

| Status | Značenje |
|---|---|
| `draft` | Rad u toku. Može postojati samo na jednom jeziku. |
| `review` | Završeno i čeka pregled. Može postojati samo na jednom jeziku. |
| `stable` | Pregledano i spremno za upotrebu. **Mora postojati na svim podržanim jezicima.** |
| `deprecated` | Zadržano radi reference, ali se više ne preporučuje. Postavi `replaced_by` ako postoji zamena. |

Promptovi se ne brišu samo zato što su zastareli. Prvo ih označi kao `deprecated`, kako bi linkovi i ID-evi nastavili da rade.

## Verzionisanje

Svaki lokalizovani fajl ima svoju `version`, po principu sličnom semantičkom verzionisanju:

| Promena | Kada |
|---|---|
| **PATCH** (`1.0.0` → `1.0.1`) | Greške u kucanju, formatiranje, pojašnjenja formulacija. Ponašanje prompta se ne menja. |
| **MINOR** (`1.0.0` → `1.1.0`) | Nove provere, sekcije ili primeri; značajno proširenje koje ostaje u skladu sa svrhom prompta. |
| **MAJOR** (`1.0.0` → `2.0.0`) | Temeljno restrukturiranje ili promena onoga što prompt radi ili kako se njegov izlaz koristi. |

Engleska i srpska verzija istog prompta treba da imaju **istu verziju**. `npm run validate:translations` prijavljuje upozorenje kada se razlikuju, što je prihvatljivo samo privremeno (na primer dok je ažuriranje prevoda na pregledu).

## Preporučena struktura sadržaja

Sledeća struktura dobro funkcioniše za promptove za analizu, audit i pregled. **Ovo je smernica, a ne kruta obaveza.** Koristi delove koji služe zadatku: promptu za kreativno pisanje nije potrebna P0-P4 ozbiljnost, a promptu-generatoru možda nije potreban format nalaza.

1. **Naslov** - jedan `#` naslov.
2. **Uloga / cilj** - koju ulogu AI preuzima i šta mora da postigne.
3. **Obim (scope)** - šta je uključeno.
4. **Ne-ciljevi (non-goals)** - šta je eksplicitno van obima.
5. **Metodologija** - redosled rada i način istraživanja materijala.
6. **Provere** - konkretne stvari koje treba ispitati, grupisane po oblastima.
7. **Dokazi** - šta se računa kao dokaz, a šta kao hipoteza; kako citirati fajlove, linije, logove ili podatke.
8. **Ozbiljnost (severity)** - jasna skala (na primer P0-P4) sa definicijama.
9. **Pouzdanost (confidence)** - koliko je nalaz siguran i zašto.
10. **Format nalaza** - tačna polja koja svaki nalaz mora da sadrži.
11. **Matrice** - tabele pokrivenosti koje čine praznine vidljivim (npr. endpoint × pravilo autorizacije).
12. **Drugi prolaz** - adversarijalna ponovna provera koja traži propuštene probleme i lažno pozitivne nalaze.
13. **Završna provera kvaliteta** - uslovi koje izlaz mora da ispuni pre isporuke.
14. **Ime izlaznog fajla / isporuka** - gde i u kom obliku se rezultat zapisuje.
15. **Konkretni primeri** - realni primeri dobrih nalaza ili stvarnih obrazaca grešaka.

## Markdown konvencije

- UTF-8 bez BOM-a, LF završeci redova, tačno jedan prazan red (newline) na kraju fajla.
- Fenced code blokovi moraju biti zatvoreni; koristi duži fence (četiri backtick-a) kada sam blok sadrži fence od tri backtick-a.
- Za sve unutar repozitorijuma koristi relativne linkove.
- Naslovi treba da budu čisti i hijerarhijski.

Ove konvencije se automatski proveravaju gde je to praktično. Alati nikada ne menjaju sadržaj prompta; samo čitaju metapodatke i generišu indekse.

## Pravila o sadržaju

Svaki prompt je samostalan artefakt. Ne menjaj prompt samo da bi njegov stil odgovarao drugom promptu. Poboljšanja treba da učine prompt tačnijim, dubljim ili jasnijim za njegovu svrhu i moraju se preneti u sve jezičke verzije.
