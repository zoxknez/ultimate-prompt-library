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
| `draft` | Prompt nije završen ili je u aktivnom pisanju. Može postojati samo na jednom jeziku. |
| `review` | Prompt je strukturno kompletan, ali još čeka pregled sadržaja, prevoda ili činjenica. Može postojati samo na jednom jeziku. Koristi ga i kada je poznato da jedna lokalizacija kasni za drugom. |
| `stable` | Prompt je objavljen, strukturno kompletan i smatra se spremnim za opštu upotrebu. **Moraju postojati sve podržane jezičke verzije.** |
| `deprecated` | Prompt ostaje dostupan radi istorije ili kompatibilnosti, ali više nije preporučena verzija. Postavi `replaced_by` ako postoji zamena. |

**`stable` nije sertifikat.** Ne znači da je prompt nezavisno proveren, profesionalno garantovan niti činjenično nepogrešiv. Znači da je prompt kompletan, objavljen i pogodan za opštu upotrebu; rezultat i dalje zavisi od modela, konteksta i ljudskog pregleda.

### Oznake u prikazu

README fajlovi i indeksi prikazuju jednu oznaku po unosu u katalogu:

| Oznaka | Značenje |
|---|---|
| **Dostupno** | Prompt fajlovi postoje (status `stable`). Dostupno ne znači „stručno sertifikovano"; pogledaj iznad. |
| **U pregledu** / **Nacrt** | Prompt fajlovi postoje sa statusom `review` / `draft`. |
| **Zastarelo** | Prompt fajlovi postoje sa statusom `deprecated`. |
| **Planirano** | ID, naziv i ime fajla su rezervisani u `catalog.json`, ali prompt fajl još ne postoji. Planirani promptovi se nikada ne računaju kao dostupni. |

## Identitet, putanje i životni ciklus

- **ID se nikada ne menja posle objavljivanja**, čak i ako se naziv preformuliše. Pogledaj [ids.md](ids.md).
- **Izbegavaj promene slug-a i putanje posle objavljivanja.** One kvare linkove i obeleživače, a GitHub stablo fajlova ne može da preusmeri. Ako je promena neizbežna, zabeleži je u changelog-u, premesti fajl sa `git mv` da bi se sačuvala istorija, ažuriraj slug u katalogu u istom commit-u i zadrži ID.
- **Označi kao zastarelo umesto brisanja.** Zadrži fajl i postavi `status: deprecated`, uz `replaced_by: UPL-...` kada postoji zamena.
- **Brisanje je izuzetak.** Objavljeni prompt se ne briše olako. Ako se pokaže da je prompt opasan ili netačan, označi ga kao zastareo i objasni razlog u promptu i changelog-u. Njegov ID se nikada ne koristi ponovo.

## Verzionisanje

Verzije koriste format `MAJOR.MINOR.PATCH` i opisuju **logičku reviziju prompta**, zajedničku za sve njegove jezike:

| Promena | Kada |
|---|---|
| **PATCH** (`1.0.0` → `1.0.1`) | Greške u kucanju, formatiranje, pojašnjenja formulacija i popravke tehničkih defekata (pokvaren code fence, odsečen kraj, zalutali artefakt). Bez značajne promene obima. |
| **MINOR** (`1.0.0` → `1.1.0`) | Nove provere, sekcije ili scenariji; značajno proširenje sadržaja koje ostaje u skladu sa svrhom prompta. |
| **MAJOR** (`1.0.0` → `2.0.0`) | Temeljno restrukturiranje, promenjena metodologija ili promenjeno očekivano ponašanje ili izlaz. |

### Pravilo verzije za prevode

- Engleski i srpski fajl prompta **treba da imaju istu verziju kada predstavljaju istu reviziju sadržaja**. Kada se izmena primeni na oba jezika, povećaj oba na istu novu verziju, čak i ako je jedan fajl zahtevao manju izmenu.
- Ako se može ažurirati samo jedna lokalizacija, povećaj verziju tog fajla i ili postavi prompt na `status: review` dok drugi jezik ne sustigne, ili otvori issue za prevod. `npm run validate:translations` razliku u verziji prijavljuje kao **upozorenje**, a ne grešku, pa namerno kašnjenje prevoda ne blokira rad.
- Ne povećavaj verziju bez promene sadržaja.

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

Ove konvencije se automatski proveravaju gde je to praktično. `npm run validate:prompts` odbija i artefakte koji nikada ne pripadaju promptu: kontrolne karaktere (obično escape sekvenca kao `\f` koja je protumačena), procurele podatke iz editora ili agenta (na primer `<ADDITIONAL_METADATA>` blokove), i upozorava na code fence-ove koji su se pretvorili u jedan backtick. Alati nikada ne menjaju sadržaj prompta; samo čitaju metapodatke i generišu indekse.

### Strogost front matter-a

Prihvataju se samo dokumentovana obavezna i opciona polja; svako drugo polje je greška, što hvata greške u kucanju kao `stauts`. Nova polja se dodaju namerno, kroz dokumentovanu izmenu ovog vodiča i validatora. Moguća buduća opciona polja navedena su u [architecture.md](architecture.md#future-metadata-evolution); nijedno od njih danas nije obavezno.

## Pravila o sadržaju

- **Svaki prompt je samostalan.** Korisnik mora moći da kopira jedan fajl i koristi ga samostalno, pa je određeno ponavljanje između promptova (pravila o dokazima, skale ozbiljnosti, provere kvaliteta) namerno. Nema deljenih include-ova niti nasleđivanja šablona.
- **Stil je stvar svakog prompta.** Ne menjaj prompt samo da bi njegov stil odgovarao drugom promptu. Neki promptovi su iscrpne specifikacije sa stotinama sekcija, drugi su fokusirane liste provera; oba pristupa su validna. Dužina nikada nije mera kvaliteta.
- **Poboljšanja se prenose.** Izmene treba da učine prompt tačnijim, dubljim ili jasnijim za njegovu svrhu i moraju se primeniti na sve jezičke verzije (pogledaj pravilo verzije za prevode).
- **Referentni principi.** UPL-IT-001 (Forensic Full Repository Audit) je dobar primer principa biblioteke, pre svega *tačnost ispred dubine, a dubina ispred broja nalaza*, bez obaveze da svaki prompt kopira njegovu strukturu.
