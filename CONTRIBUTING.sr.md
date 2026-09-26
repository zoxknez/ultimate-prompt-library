# Doprinos projektu Ultimate Prompt Library

[English](CONTRIBUTING.md) | Srpski

Hvala što pomažeš u izgradnji otvorene biblioteke dubokih promptova spremnih za produkciju. Ovo uputstvo objašnjava kako se predlažu, pišu, poboljšavaju i prevode promptovi, kao i šta pull request mora da ispuni.

Učešćem u projektu prihvataš [Kodeks ponašanja](CODE_OF_CONDUCT.md).

## Načini doprinosa

| Želim da… | Počni sa |
|---|---|
| Predložim novi prompt | Issue tipa **Prompt suggestion** |
| Napišem prompt koji je već planiran | Issue ili pull request koji navodi planirani ID |
| Poboljšam postojeći prompt | Pull request (ili prvo issue, za veće izmene) |
| Prijavim činjeničnu ili tehničku grešku u promptu | Issue tipa **Bug report** |
| Dodam ili ispravim prevod | Issue tipa **Translation issue** ili pull request |
| Predložim novu oblast ili podkategoriju | Issue tipa **Prompt suggestion** sa opisom oblasti |
| Ispravim alate ili dokumentaciju | Pull request |

## Pre nego što počneš

1. **Proveri duplikate.** Pogledaj [katalog](catalog.json), [roadmap](docs/roadmap.sr.md), README fajlove oblasti i otvorene issue-e. Ako prompt na istu temu postoji ili je planiran, poboljšaj njega ili ga preuzmi, umesto da praviš novi.
2. **Pročitaj format.** [docs/prompt-format.sr.md](docs/prompt-format.sr.md) definiše front matter, imena fajlova, statuse i verzionisanje. [docs/ids.md](docs/ids.md) objašnjava ID-eve.
3. **Podesi alate** (Node.js 18 ili noviji):

   ```bash
   npm ci
   npm run validate
   ```

## Pisanje planiranog prompta

Planirani promptovi već imaju rezervisan ID, broj, slug, naziv i podkategoriju u [`catalog.json`](catalog.json) - na primer `UPL-IT-061 ultimate-ai-application-audit`.

1. Otvori issue (ili komentariši postojeći) i navedi da radiš na tom ID-u, da bi se izbegao dupli posao.
2. Napravi fajlove na rezervisanim putanjama, npr.:

   ```text
   prompts/en/01-it-programming-technology/07-ai-llm-automation/061-ultimate-ai-application-audit.md
   prompts/sr/01-it-programiranje-tehnologija/07-ai-llm-automation/061-ultimate-ai-application-audit.md
   ```

3. **Koristi rezervisani ID.** Nikada ne dodeljuj drugi ID planiranom promptu.
4. Počni sa `status: draft` ili `review`. Prompt postaje `stable` tek posle pregleda i kada postoji na **oba** jezika, engleskom i srpskom.

## Predlog novog prompta

Ako prompt nije na roadmap-u:

1. Otvori issue tipa **Prompt suggestion**: koji problem rešava, kome je namenjen, obim i ne-ciljevi i po čemu se razlikuje od postojećih promptova.
2. Sačekaj da predlog bude prihvaćen. ID se tada dodeljuje dodavanjem unosa sa sledećim slobodnim brojem u listu `prompts` odgovarajuće oblasti u `catalog.json` (to može biti deo tvog pull request-a, kada se dogovori).
3. Napiši prompt prema koracima iznad.

Ne biraj ID sam pre nego što se o predlogu diskutuje - ID-evi su trajni.

## Poboljšanje postojećeg prompta

- Zadrži **ID, broj, slug i ime fajla** nepromenjenim.
- Izmene ponašanja primeni na **oba jezika** u istom pull request-u.
- Povećaj `version` u oba fajla prema [pravilima verzionisanja](docs/prompt-format.sr.md#verzionisanje): PATCH za formulacije, MINOR za nove provere ili sekcije, MAJOR za temeljne promene.
- Svaki prompt je samostalan. Ne prepravljaj prompt samo da bi odgovarao stilu drugog prompta.
- Ako prompt zastari, označi ga sa `status: deprecated` (i postavi `replaced_by` ako postoji zamena) umesto da ga brišeš.

## Prijava činjenične greške

Otvori issue tipa **Bug report** sa ID-em prompta, jezikom, tačnim pasusom, opisom greške i izvorom ili objašnjenjem. Činjenične ispravke se primenjuju na sve jezičke verzije.

## Prevodi

Prati [vodič za prevođenje](docs/translation-guide.md). Ukratko: zadrži strukturu, ne diraj kod i identifikatore, zadrži tehničke termine na engleskom gde je to prirodno, sačuvaj značenje nivoa ozbiljnosti i ne objavljuj mašinski prevod bez pregleda kao `stable`.

## Predlog nove oblasti ili podkategorije

Otvori issue sa opisom oblasti, publike, nekoliko primera promptova i načina na koji se uklapa u postojeće [oblasti](docs/categories.sr.md). Definicije oblasti i podkategorija nalaze se u `catalog.json`; tehnički koraci su opisani u [architecture.md](docs/architecture.md#adding-a-subcategory-or-category).

## Kontrolna lista za pull request

Pull request mora da:

- [ ] zadrži postojeće ID-eve promptova nepromenjenim;
- [ ] ima validan front matter u svakom prompt fajlu koji dodaje ili menja;
- [ ] prati konvencije imena fajla `NNN-slug.md` i foldera;
- [ ] sadrži odgovarajuću verziju na drugom jeziku (ili zadrži prompt u statusu `draft`/`review` dok ona ne postoji);
- [ ] ne menja druge promptove slučajno;
- [ ] sadrži regenerisane indekse i README tabele (`npm run generate`);
- [ ] prolazi `npm run validate`.

[Šablon za pull request](.github/PULL_REQUEST_TEMPLATE.md) sadrži ovu listu.

## Bezbednosni promptovi

Promptovi iz oblasti sajber bezbednosti namenjeni su defanzivnom pregledu, ovlašćenom testiranju, bezbednom razvoju i modelovanju pretnji. Doprinosi čiji je cilj napad na sisteme bez ovlašćenja neće biti prihvaćeni. Pogledaj [SECURITY.md](SECURITY.md).

## Autorstvo i licenca

Doprinosi se objavljuju pod [MIT licencom](LICENSE). Opciono polje `authors` u front matter-u može navesti stvarne saradnike koji su pristali da budu navedeni; ne dodaj imena u tuđe ime.
