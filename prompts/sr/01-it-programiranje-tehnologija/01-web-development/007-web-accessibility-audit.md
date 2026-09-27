---
id: UPL-IT-007
number: 7
slug: web-accessibility-audit
title: Audit web pristupačnosti
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Web razvoj
subcategory_id: web-development
language: sr
version: 1.0.0
status: stable
---

# AUDIT WEB PRISTUPAČNOSTI

Želim da izvršiš maksimalno duboku, sistematsku i evidence-first analizu pristupačnosti kompletne web aplikacije.

Glavni cilj:

> Utvrditi da li osobe sa različitim motoričkim, vizuelnim, auditivnim i kognitivnim ograničenjima mogu razumeti, navigirati i koristiti sve ključne funkcije aplikacije.

Ovo nije:

- generički accessibility checklist
- automatsko dodavanje ARIA atributa
- "dodaj alt text svuda" audit
- analiza samo Lighthouse accessibility score-a
- vizuelni design review
- pokušaj da svaki warning pretvoriš u bug
- automatski refactor

Fokus je na stvarnom korisničkom iskustvu.

Prioritet:

**funkcionalna dostupnost > semantika > keyboard/focus > screen reader iskustvo > percepcija sadržaja > kozmetičke preporuke**

Svaki ozbiljan nalaz mora imati:

- konkretnu lokaciju
- konkretnog korisnika ili način korišćenja koji je pogođen
- jasan failure scenario
- dokaz iz koda ili runtime ponašanja
- realnu remediation preporuku

Ako nešto nisi mogao proveriti u browseru ili assistive tehnologiji, jasno označi:

**NOT VERIFIED**

---

# 1. UTVRDI STACK I ACCESSIBILITY KONTEKST

Pre audita utvrdi:

- framework
- React/Vue/Angular/Svelte ili drugi
- SSR/CSR model
- component library
- headless UI library
- design system
- routing
- form library
- modal/dialog library
- table/grid library
- charting library
- rich text/editor library
- internationalization
- testing framework

Posebno utvrdi da li projekat koristi biblioteke koje već implementiraju accessibility behavior.

Na primer:

- Radix
- React Aria
- Headless UI
- MUI
- Chakra
- shadcn/ui
- Reach UI

Nemoj prijavljivati problem koji biblioteka već pravilno rešava bez provere stvarnog renderovanog ponašanja.

---

# 2. UTVRDI PRIMENJIV STANDARD

Ako projekat, ugovor, regulativa ili dokumentacija definišu cilj, koristi taj standard.

Ako nije definisano drugačije, koristi aktuelni WCAG okvir relevantan projektu i fokusiraj se najmanje na nivo AA kao praktični baseline.

Razlikuj:

- standard requirement
- usability improvement
- framework/library recommendation

Nemoj izmišljati pravne obaveze.

Ako pravna usklađenost nije poznata:

**LEGAL REQUIREMENT: NOT VERIFIED**

---

# 3. MAPIRAJ KRITIČNE USER FLOW-OVE

Pre pojedinačnih finding-a identifikuj ključne tokove.

Na primer:

```text
Landing
↓
Navigation
↓
Registration
↓
Login
↓
Main feature
↓
Form
↓
Submit
↓
Success/Error
```

ili:

```text
Dashboard
↓
Search
↓
Results
↓
Open item
↓
Edit
↓
Save
```

Accessibility nije samo svojstvo pojedinačnih komponenti.

Za svaki ključni tok proveri da li ga korisnik može završiti:

- tastaturom
- screen reader-om
- bez oslanjanja samo na boju
- uz povećan tekst
- uz zoom
- uz reduced motion gde je relevantno

---

# 4. SEMANTIC HTML

Pregledaj upotrebu:

- `header`
- `nav`
- `main`
- `section`
- `article`
- `aside`
- `footer`
- `button`
- `a`
- `form`
- `label`
- `fieldset`
- `legend`
- `table`
- headings

Traži generičke elemente koji glume interaktivne kontrole.

Primer:

```html
<div onclick="...">
  Save
</div>
```

Ako ponaša kao button, proveri zašto nije pravi `button`.

Nemoj preporučivati ARIA ako native HTML već rešava problem bolje.

---

# 5. INTERACTIVE ELEMENT SEMANTICS

Pronađi:

- clickable div
- clickable span
- custom controls
- custom dropdown
- custom tabs
- custom switches
- custom checkboxes

Za svaki proveri:

- keyboard operabilnost
- role
- accessible name
- focusability
- state announcement

---

# 6. BUTTON VS LINK

Proveri semantiku:

- `button` za akciju
- `a` za navigaciju

Traži:

```html
<a href="#" onclick="deleteItem()">
```

ili:

```html
<button onclick="navigate('/page')">
```

Proceni stvarnu semantiku i browser behavior.

Nemoj menjati element samo radi teorijske čistote ako trenutna implementacija već ima smislen behavior.

---

# 7. LANDMARKS

Proveri:

- main landmark
- navigation landmarks
- header/banner
- footer/contentinfo

Ako postoji više navigation regiona, proveri da imaju razlikovne accessible nazive gde je potrebno.

---

# 8. HEADING HIJERARHIJA

Mapiraj `h1` do `h6`.

Traži:

- preskakanje koje remeti strukturu
- heading koji se koristi samo zbog stila
- tekst vizuelno predstavljen kao heading bez semantike
- mnogo nepovezanih `h1`

Ne prijavljuj svako numeričko preskakanje bez procene strukture dokumenta.

---

# 9. PAGE TITLE

Za svaku važnu route proveri:

- smislen `<title>`
- promena naslova pri navigation-u
- jedinstvenost
- context

Screen reader korisnik mora moći da razume koju je stranicu otvorio.

---

# 10. LANGUAGE

Proveri:

- `lang` atribut dokumenta
- promenjene jezičke fragmente gde je relevantno
- locale switching

Ako je aplikacija višejezična, proveri da root language prati stvarni locale.

---

# 11. KEYBOARD AUDIT

Svaka interaktivna funkcija treba da bude dostupna tastaturom gde je to primenljivo.

Testiraj mentalno ili runtime:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys
Home
End
```

u zavisnosti od component pattern-a.

---

# 12. TAB ORDER

Proveri da focus ide logičnim redosledom.

Traži:

- nevidljive elemente u tab order-u
- elemente koji vizuelno dolaze kasnije, a fokusiraju se ranije
- custom `tabindex` vrednosti
- `tabindex > 0`

Pozitivni tabindex često komplikuje prirodni DOM redosled.

Prijavi samo kada zaista remeti tok.

---

# 13. FOCUS VISIBILITY

Svaki keyboard-interactive element mora imati vidljiv focus indikator.

Traži:

```css
outline: none;
```

```css
outline: 0;
```

ili Tailwind ekvivalente.

Proveri da li postoji adekvatna zamenska focus stilizacija.

Samo uklanjanje default outline-a nije problem ako postoji kvalitetan custom focus state.

---

# 14. FOCUS CONTRAST

Focus ring mora biti dovoljno uočljiv u odnosu na pozadinu.

Ne procenjuj samo "izgleda slabo".

Ako tooling omogućava, izmeri kontrast.

---

# 15. FOCUS ORDER VS VISUAL ORDER

Ako CSS koristi:

- `order`
- grid placement
- absolute positioning

proveri da vizuelni i keyboard redosled ostaju razumni.

---

# 16. FOCUS MANAGEMENT

Posebno proveri:

- route changes
- modals
- drawers
- menus
- dialogs
- dynamically inserted content
- errors

Pitaj:

> Gde focus završava nakon ove akcije?

---

# 17. ROUTE CHANGE FOCUS

Kod SPA navigation-a proveri da li keyboard/screen reader korisnik dobija smislen signal da se sadržaj promenio.

Nemoj zahtevati automatsko fokusiranje heading-a ako framework ili proizvod koristi drugi validan pattern.

---

# 18. MODAL FOCUS

Za svaki modal proveri:

```text
open
↓
focus enters modal
↓
focus remains logically inside
↓
Escape/close
↓
focus returns to trigger
```

Traži:

- focus ostaje u pozadini
- focus odlazi iza modala
- close button nije dostupan
- focus se gubi posle zatvaranja

---

# 19. FOCUS TRAP

Focus trap treba da postoji kada modalni pattern to zahteva.

Ali proveri stvarnu biblioteku pre finding-a.

Ne prijavljuj "nema custom focus trap koda" ako ga component library interno rešava.

---

# 20. DRAWER FOCUS

Drawer koji se ponaša kao modal mora imati odgovarajuće focus ponašanje.

Ako je samo dodatni non-modal panel, očekivanja mogu biti drugačija.

Utvrdi semantiku.

---

# 21. ESCAPE KEY

Proveri gde `Escape` treba da zatvori:

- modal
- menu
- popover
- combobox

Nemoj zahtevati Escape za svaki proizvoljni panel.

---

# 22. SKIP LINK

Za aplikacije sa velikom ponavljajućom navigacijom proveri da li keyboard korisnik može brzo preći na glavni sadržaj.

Ako nedostatak skip link-a stvara desetine tab-stop koraka na svakoj stranici, prijavi problem.

---

# 23. ACCESSIBLE NAME

Za svaki interaktivan element proveri da ima smislen accessible name.

Izvori mogu biti:

- vidljiv tekst
- `<label>`
- `aria-label`
- `aria-labelledby`
- `alt`

Traži dugmad koja screen reader vidi samo kao:

```text
button
```

bez imena.

---

# 24. ICON-ONLY BUTTONS

Posebno proveri:

- close
- menu
- delete
- edit
- share
- search
- settings

SVG ikona sama po sebi ne garantuje dobar accessible name.

---

# 25. DUPLICATE ACCESSIBLE NAMES

Ako postoji više dugmadi:

```text
Edit
Edit
Edit
```

u listi, proveri da li screen reader korisnik može razumeti šta se uređuje.

Možda treba contextual accessible name.

Ali ne menjaj vidljivi tekst bez potrebe.

---

# 26. IMAGES

Za svaku važnu sliku utvrdi da li je:

- informativna
- dekorativna
- funkcionalna
- tekstualna

Na osnovu toga proceni `alt`.

---

# 27. DECORATIVE IMAGES

Dekorativne slike ne treba da proizvode nepotreban screen reader sadržaj.

Proveri `alt=""` ili odgovarajući pattern.

---

# 28. INFORMATIVE ALT TEXT

Alt ne treba da opisuje piksele nego funkciju/informaciju relevantnu kontekstu.

Ne traži generički:

```text
image of...
```

ako nema koristi.

---

# 29. FUNCTIONAL IMAGES

Ako image služi kao link/button, accessible name treba da opisuje akciju ili destinaciju.

---

# 30. SVG

Za SVG proveri:

- decorative vs informative
- `aria-hidden`
- title/label
- focusability

Nemoj automatski dodavati `<title>` svakom SVG-u.

---

# 31. FORMS

Za svaku važnu formu mapiraj:

```text
label
↓
input
↓
hint
↓
validation
↓
error
↓
submit
```

Proveri kompletan tok.

---

# 32. FORM LABELS

Svaki relevantan input treba da ima programatski povezan label.

Placeholder nije puna zamena za label.

Traži:

- placeholder-only fields
- visual labels bez association-a
- custom component koji prekida `for/id`

---

# 33. PLACEHOLDER

Proveri da placeholder ne nosi jedinu ključnu instrukciju.

Nestaje kada korisnik počne da kuca.

---

# 34. REQUIRED FIELDS

Proveri da required stanje nije označeno samo bojom ili zvezdicom bez programskog značenja.

---

# 35. FIELD INSTRUCTIONS

Za specifične formate proveri da korisnik dobija instrukciju pre greške.

Na primer:

- password requirements
- date format
- username rules

---

# 36. ERROR IDENTIFICATION

Kada validation padne, proveri:

- jasno ime polja
- objašnjenje problema
- način ispravke

Poruka:

```text
Invalid
```

može biti nedovoljna.

---

# 37. ERROR ASSOCIATION

Error tekst treba da bude programatski povezan sa odgovarajućim field-om gde je potrebno.

Pregledaj:

- `aria-describedby`
- `aria-errormessage`
- library behavior

---

# 38. ERROR ANNOUNCEMENT

Ako error nastane nakon submit-a ili async validacije, proveri da screen reader korisnik dobija informaciju.

Ne dodaj live region naslepo.

Proceni postojeći focus/error pattern.

---

# 39. FORM SUBMISSION FAILURE

Scenario:

```text
submit
↓
server validation fails
↓
three fields invalid
```

Pitaj:

- gde focus završava
- da li korisnik zna da submit nije uspeo
- kako pronalazi prvu grešku

---

# 40. ERROR SUMMARY

Za duge forme proceni da li error summary ima smisla.

Nije potreban za svaku malu formu.

---

# 41. SUCCESS ANNOUNCEMENT

Ako submit uspe, screen reader korisnik mora razumeti da se akcija završila.

Proveri:

- navigation
- visible message
- live region
- focus change

---

# 42. LOADING STATE

Proveri da loading nije komuniciran samo spinner animacijom.

Za critical async operacije korisniku mora biti jasno:

- da je operacija počela
- da li je još aktivna
- kada je završila

---

# 43. `aria-busy`

Gde je prikladno proveri korišćenje `aria-busy` ili drugog odgovarajućeg pattern-a.

Nemoj dodavati bez razloga.

---

# 44. DISABLED CONTROLS

Proveri kako screen reader korisnik razume zašto je nešto disabled.

Posebno ako dugme ostaje disabled dok se ne ispuni uslov koji nije objašnjen.

---

# 45. NATIVE DISABLED VS ARIA-DISABLED

Utvrdi semantiku.

`aria-disabled` ne sprečava interakciju sam po sebi.

Ako se koristi, proveri event handling.

---

# 46. CUSTOM CHECKBOX

Ako nije native checkbox, proveri:

- role
- checked state
- keyboard
- label
- focus

---

# 47. RADIO GROUP

Proveri:

- group name
- keyboard arrows
- selected state
- legend/group label

---

# 48. SWITCH

Ako se koristi switch pattern:

- role
- checked state
- accessible name
- keyboard activation

---

# 49. SELECT

Preferiraj native select gde odgovara.

Ako je custom:

- role
- keyboard
- expanded state
- active option
- focus
- screen reader announcement

---

# 50. COMBOBOX

Duboko proveri custom autocomplete/combobox:

- input
- popup
- active descendant
- selected value
- arrow navigation
- escape
- enter
- loading
- no results

Ovo je česta accessibility hotspot komponenta.

---

# 51. AUTOCOMPLETE

Proveri da screen reader korisnik sazna:

- koliko rezultata postoji
- koji je aktivan
- šta je izabrano

gde pattern to zahteva.

---

# 52. LISTBOX

Custom listbox mora imati kompletno keyboard ponašanje odgovarajućeg pattern-a.

Nemoj samo dodati `role="listbox"`.

ARIA role bez ponašanja može pogoršati accessibility.

---

# 53. MENUS

Razlikuj običnu navigation listu od ARIA application menu pattern-a.

Ne koristi:

```text
role="menu"
```

samo zato što element vizuelno izgleda kao dropdown.

---

# 54. TABS

Proveri:

- `tablist`
- `tab`
- `tabpanel`
- selection
- keyboard navigation
- focus behavior

Ako je implementacija native links koja funkcioniše dobro, nemoj forsirati ARIA tabs pattern.

---

# 55. ACCORDION

Proveri:

- button trigger
- expanded state
- relationship sa panelom
- keyboard

---

# 56. DISCLOSURE

Jednostavan show/hide control često zahteva manje semantike od kompleksnog accordion-a.

Razlikuj pattern-e.

---

# 57. TOOLTIP

Tooltip sadržaj:

- ne sme biti jedini način pristupa kritičnoj informaciji
- treba biti dostupan keyboard focus-om gde je relevantno
- treba imati odgovarajući relationship

Proveri mobile/touch posledice odvojeno.

---

# 58. DIALOG SEMANTICS

Za modal proveri:

- dialog role
- accessible name
- modal state gde odgovara
- focus

Ne dodaj `aria-modal` bez odgovarajućeg ponašanja.

---

# 59. ALERT DIALOG

Za kritične confirmation akcije proceni da li pattern odgovara alert dialog-u ili običnom dialog-u.

Ne koristi agresivniji pattern za svaku potvrdu.

---

# 60. TOASTS I NOTIFICATIONS

Proveri:

- success
- warning
- error
- informational

Da li screen reader dobija odgovarajuću informaciju bez nepotrebnog prekidanja?

---

# 61. LIVE REGIONS

Proveri:

- `aria-live`
- `role="status"`
- `role="alert"`

Traži:

- previše agresivne announcements
- live region koji se mountuje tek zajedno sa porukom i zbog toga možda ne radi kako se očekuje
- ponavljane poruke

---

# 62. STATUS UPDATES

Dynamic sadržaj kao:

```text
3 results found
```

može zahtevati announcement u određenom UX-u.

Proceni stvarnu potrebu.

---

# 63. TABLES

Za data tables proveri:

- native `table`
- headers
- scope
- caption
- relationships
- sorting state

---

# 64. TABLE HEADERS

Kompleksne tabele mogu zahtevati pažljiviju association logiku.

Nemoj pretpostavljati da jedan `th` rešava sve.

---

# 65. SORTABLE TABLES

Ako klik na header sortira podatke, proveri:

- da je kontrola keyboard dostupna
- da je trenutno sort stanje programatski dostupno

---

# 66. RESPONSIVE TABLES

Ako mobile verzija menja tabelu u cards, proveri da se semantičke veze ne izgube.

---

# 67. DATA GRID

Kompleksan interactive grid ima mnogo strožije keyboard zahteve.

Prvo utvrdi da li komponenta stvarno treba da bude grid pattern ili obična tabela.

Ne uvodi `role="grid"` bez pune implementacije ponašanja.

---

# 68. PAGINATION

Proveri:

- navigation semantics
- current page
- accessible names
- disabled controls

---

# 69. BREADCRUMBS

Proveri:

- navigation landmark
- accessible label
- current page

---

# 70. NAVIGATION

Za main navigation proveri:

- semantic structure
- current page indication
- keyboard operability
- mobile behavior

---

# 71. MOBILE MENU ACCESSIBILITY

Proveri kompletan flow:

```text
menu button
↓
open
↓
focus
↓
navigate
↓
close
↓
focus restoration
```

---

# 72. CURRENT STATE

Za navigation/tab/pagination proveri programatski current/selected state.

Ne oslanjaj se samo na boju ili bold font.

---

# 73. COLOR CONTRAST

Proveri relevantne kombinacije:

- body text
- secondary text
- links
- button text
- input text
- placeholders gde je relevantno
- icons koji prenose značenje
- focus indicators

Ako možeš, izmeri stvarni contrast ratio.

Ne procenjuj samo vizuelno.

---

# 74. TEXT CONTRAST

Razlikuj:

- normal text
- large text

i odgovarajuće zahteve standarda koji projekat koristi.

---

# 75. NON-TEXT CONTRAST

Proveri važne UI granice i state indikatore gde je kontrast potreban:

- input borders
- checkbox
- focus
- selected states
- icons

---

# 76. COLOR-ONLY INFORMATION

Traži:

- green = success
- red = error
- blue = selected

bez drugog indikatora.

Dodaj:

- text
- icon
- shape
- semantic state

gde je potrebno.

---

# 77. LINKS

Link treba biti prepoznatljiv kao interaktivan.

Ako se razlikuje samo bojom, proveri da li kombinacija stila i konteksta zadovoljava relevantne zahteve.

---

# 78. CHARTS

Za chart proveri da informacija nije dostupna samo:

- bojom
- hover-om
- vizuelnom pozicijom

Proceni alternativni pristup podacima.

---

# 79. DATA VISUALIZATION

Za kompleksne grafikone može biti potreban:

- tabela
- tekstualni summary
- accessible description

Ne pokušavaj verbalizovati svaki pixel grafikona.

---

# 80. STATUS BADGES

Badges koji koriste samo boju za:

- active
- failed
- pending
- success

treba da imaju i tekstualno/programsko značenje.

---

# 81. MOTION

Pregledaj:

- animations
- transitions
- parallax
- auto movement
- blinking
- scrolling

---

# 82. PREFERS-REDUCED-MOTION

Ako postoje značajne animacije, proveri podršku za:

```css
@media (prefers-reduced-motion: reduce)
```

Ne mora svaka transition animacija potpuno nestati.

Smanji problematičan motion.

---

# 83. AUTOPLAY

Za audio/video proveri:

- autoplay
- sound
- controls
- pause

Ne puštaj zvuk automatski bez veoma dobrog razloga.

---

# 84. CAROUSELS

Proveri:

- auto-rotation
- pause
- keyboard
- buttons
- screen reader context
- current slide

---

# 85. ANIMATED CONTENT

Korisnik treba da može zaustaviti relevantno:

- moving
- blinking
- scrolling
- auto-updating

u skladu sa primenljivim zahtevima.

---

# 86. FLASHING CONTENT

Identifikuj sadržaj koji može predstavljati seizure risk.

Ako takav sadržaj ne postoji:

**NOT APPLICABLE**

---

# 87. ZOOM

Testiraj ili analiziraj browser zoom.

Posebno:

- 200%
- reflow
- fixed elements
- horizontal scroll

Ne blokiraj zoom kroz viewport config.

---

# 88. TEXT RESIZING

Proveri da tekst može rasti bez:

- clipping-a
- overlap-a
- nestanka kontrole

---

# 89. REFLOW

Na uskom efektivnom viewport-u proveri da korisnik ne mora horizontalno skrolovati za običan linearni sadržaj, osim gde je horizontalni prikaz prirodno potreban.

Na primer:

- tabela
- mapa
- kompleksan diagram

mogu biti posebni slučajevi.

---

# 90. FIXED ELEMENTS

Pri zoom-u proveri da:

- sticky header
- cookie banner
- bottom nav
- chat widget

ne zauzmu praktično ceo ekran.

---

# 91. COGNITIVE ACCESSIBILITY

Ne dijagnostikuj korisnike.

Proceni UX karakteristike poput:

- jasnog jezika
- konzistentne navigacije
- predvidivih kontrola
- razumljivih grešaka
- sprečavanja slučajnog gubitka podataka

---

# 92. CONSISTENT NAVIGATION

Isti navigation element treba da ima konzistentno mesto i ponašanje kroz slične stranice.

---

# 93. CONSISTENT IDENTIFICATION

Ista funkcija ne bi bez razloga trebalo da bude:

```text
Save
```

na jednoj strani i:

```text
Apply
```

na drugoj ako radi istu stvar.

Ali razlikuj stvarnu semantičku razliku.

---

# 94. DESTRUCTIVE ACTIONS

Proveri:

- jasno označavanje
- confirmation gde je opravdano
- undo gde ima smisla
- keyboard access

Accessibility uključuje i sprečavanje nenamernih ozbiljnih posledica.

---

# 95. TIME LIMITS

Ako aplikacija ima:

- session countdown
- quiz timer
- booking hold
- auto logout

proveri mogućnost upozorenja i produženja gde je primenljivo.

Nemoj prijavljivati inherentne real-time limite bez razumevanja poslovnog razloga.

---

# 96. SESSION EXPIRY

Ako session istekne tokom duge forme, proveri:

- da li user gubi podatke
- da li dobija upozorenje
- da li može nastaviti nakon re-auth-a

---

# 97. DRAG AND DROP

Ako postoji drag-and-drop, proveri postoji li keyboard ili drugi pristupačan način da se izvrši ista funkcija.

---

# 98. POINTER GESTURES

Ako feature zahteva:

- swipe
- pinch
- multi-touch
- path gesture

proveri postoji li jednostavnija alternativa kada je zahtev primenljiv.

---

# 99. TARGET SIZE

Za male kontrole proveri stvarnu hit area, ne samo ikonu.

Posebno:

- close
- pagination
- kebab menu
- tiny checkboxes

---

# 100. POINTER CANCELLATION

Za critical actions proveri da se akcija ne izvršava prerano na pointer-down ako korisnik treba da ima mogućnost odustajanja.

Relevantno uglavnom kod custom interactions.

---

# 101. SCREEN READER READING ORDER

DOM redosled treba da daje smislen sadržaj i bez CSS pozicioniranja.

Proveri:

- grids
- sidebars
- mobile reordered content
- portals

---

# 102. VISUALLY HIDDEN CONTENT

Proveri utility klase za screen-reader-only sadržaj.

Traži element koji je vizuelno skriven ali slučajno zauzima layout ili ostaje interactive.

---

# 103. `aria-hidden`

Pronađi:

```html
aria-hidden="true"
```

i proveri da unutar tog subtree-a nema fokusabilnih ili važnih elemenata.

---

# 104. HIDDEN INTERACTIVE ELEMENTS

Posebno proveri responsive desktop/mobile duplikate.

Ako je jedan vizuelno sakriven, može li screen reader ili keyboard ipak doći do njega?

---

# 105. ARIA MISUSE

Pretraži:

```text
role=
aria-
```

Traži:

- invalid role
- redundant ARIA
- contradictory state
- missing required properties
- pogrešno korišćenje pattern-a

Pravilo:

> No ARIA is better than bad ARIA.

Native semantics imaju prednost gde rešavaju problem.

---

# 106. `aria-label` VS VISIBLE TEXT

Ako accessible name ne odgovara vidljivom tekstu, voice-control korisnik može imati problem.

Proveri relevantne kontrole.

---

# 107. LABEL IN NAME

Za kontrole sa vidljivim tekstom proveri da accessible name uključuje taj tekst gde je primenljivo.

---

# 108. IDS

Traži duplicate HTML IDs koji mogu polomiti:

- label association
- `aria-labelledby`
- `aria-describedby`

Posebno kod reusable komponenti u listama.

---

# 109. GENERATED IDS

Ako se ID generiše tokom rendera, proveri SSR/hydration stabilnost.

Koristi framework/React mehanizam kada je relevantno.

---

# 110. LIVE DATA

Ako dashboard automatski menja vrednosti, ne treba sve promene agresivno najavljivati screen reader-u.

Odredi koje promene stvarno zahtevaju announcement.

---

# 111. CHAT / MESSAGING

Proveri:

- nova poruka
- send state
- focus
- conversation history
- live announcements

Previše announcement-a može biti jednako problematično kao premalo.

---

# 112. FILE UPLOAD

Proveri:

- label
- drag/drop alternativa
- upload status
- progress
- error
- successful completion

---

# 113. PROGRESS

Ako upload traje, proveri da progress informacije imaju programatsko značenje gde je potrebno.

---

# 114. CAPTCHA

Ako postoji CAPTCHA, proveri pristupačne alternative.

Ne pretpostavljaj da svaki CAPTCHA provider automatski zadovoljava sve potrebe.

---

# 115. AUTHENTICATION ACCESSIBILITY

Pregledaj:

- login
- password
- MFA
- password manager compatibility
- paste restrictions
- one-time codes

Ne blokiraj paste bez veoma jakog razloga.

---

# 116. PASSWORD FIELDS

Proveri:

- show/hide password
- accessible name toggle-a
- state announcement
- requirements

---

# 117. MFA

One-time-code input treba da radi sa:

- keyboard
- paste
- autocomplete

gde je moguće.

---

# 118. CAPTCHA / SECURITY BALANCE

Security kontrola ne treba nepotrebno da blokira korisnike sa invaliditetom.

Ako postoji problem, dokumentuj bez slabljenja sigurnosti.

---

# 119. MAPS

Ako mapa sadrži ključne informacije, proveri postoji li alternativni način pristupa informacijama.

Na primer:

- lista lokacija
- tekstualna adresa

---

# 120. CANVAS

Ako značajan sadržaj postoji samo u `<canvas>`, proveri accessibility alternative.

---

# 121. VIDEO

Za relevantan video proveri:

- captions
- transcript
- controls
- keyboard
- focus

Zahtevi zavise od sadržaja.

---

# 122. AUDIO

Za audio sadržaj proveri:

- controls
- transcript gde je potreban
- autoplay

---

# 123. CAPTIONS

Ne tvrdi da captions imaju dobar kvalitet samo zato što fajl postoji.

Ako sadržaj nije moguće proveriti:

**CAPTION QUALITY: NOT VERIFIED**

---

# 124. DOCUMENTS I DOWNLOADS

Ako sajt linkuje PDF ili druge dokumente koji predstavljaju ključan sadržaj, zabeleži accessibility rizik dokumenta ako nije proverljiv u ovom auditu.

Nemoj tvrditi da je sam PDF pristupačan bez pregleda.

---

# 125. PDF LINKS

Ako klik otvara PDF umesto web stranice, korisniku može biti korisno jasno naznačiti format gde je relevantno.

---

# 126. THIRD-PARTY WIDGETS

Mapiraj:

- payment widget
- chat
- maps
- social embed
- booking widget
- consent manager

Accessibility problema third-party komponente i dalje utiče na korisnika.

Ali jasno označi ownership.

---

# 127. COOKIE BANNER

Proveri:

- keyboard
- focus
- contrast
- screen reader
- reject/accept controls
- modal behavior

---

# 128. CHAT WIDGET

Proveri da floating widget ne:

- zaklanja fokus
- prekriva kontrole
- pravi neočekivan tab stop

---

# 129. ACCESSIBILITY NA MOBILE-U

Posebno proveri:

- touch target
- screen reader order
- mobile menu
- forms
- modal
- orientation
- zoom

Desktop accessibility nije dovoljan.

---

# 130. LANDSCAPE

Proveri da kritičan sadržaj nije blokiran kada je uređaj u landscape modu.

---

# 131. COLOR SCHEME

Ako postoji dark mode, kontrast proveri posebno.

Light theme passing ne znači da dark theme passing.

---

# 132. HIGH CONTRAST MODES

Ako platform/browser podržava forced colors/high contrast, proveri custom controls gde je relevantno.

---

# 133. CSS BACKGROUND IMAGES

Tekstualno važan sadržaj ne treba da postoji samo kao CSS background image.

---

# 134. ICON COLOR

Ako icon prenosi status samo bojom, dodaj drugi signal.

---

# 135. VALIDATION COLOR

Crveni border bez tekstualne/programske greške nije dovoljan.

---

# 136. AUTOMATED TOOLS

Ako imaš pristup, koristi:

- axe
- Lighthouse
- framework accessibility linting
- browser accessibility tree

Ali:

> Automated tools nisu kompletan accessibility audit.

Nikada nemoj proglasiti aplikaciju pristupačnom samo zato što axe ima 0 violations.

---

# 137. AUTOMATED FALSE POSITIVES

Svaki automatski finding proveri u kontekstu.

Ne kopiraj report bez analize.

---

# 138. MANUAL TESTING

Prioritetni manual testovi:

- keyboard-only
- zoom
- mobile
- screen reader gde je dostupno
- error forms
- modal flow
- navigation

---

# 139. SCREEN READER TEST

Ako je moguće, koristi odgovarajući screen reader.

Proveri:

- page title
- landmarks
- headings
- forms
- buttons
- links
- dialogs
- dynamic updates

Ako nije moguće:

**SCREEN READER RUNTIME TEST: NOT VERIFIED**

---

# 140. ACCESSIBILITY TREE

Ako browser tooling dozvoljava, pregledaj accessibility tree za kritične custom komponente.

---

# 141. TESTOVI U REPOSITORY-JU

Pregledaj postojeće accessibility testove.

Traži:

- jest-axe
- axe Playwright/Cypress integration
- keyboard tests
- accessibility snapshots
- focus tests

---

# 142. TEST LIMITATIONS

Test koji samo pokrene:

```text
expect(await axe(container)).toHaveNoViolations()
```

ne dokazuje:

- dobar keyboard flow
- ispravan focus
- razumljiv screen reader UX
- kompletnu form usability

---

# 143. CRITICAL COMPONENT MATRIX

Napravi tabelu:

| Component | Keyboard | Focus | Name | State | Screen reader | Result |
|---|---|---|---|---|---|---|

Za:

- navigation
- menu
- dialog
- form
- combobox
- tabs
- table
- toast

gde postoje.

---

# 144. PAGE MATRIX

Za važne rute:

| Route | Headings | Landmarks | Forms | Keyboard | Focus | Result |
|---|---|---|---|---|---|---|

---

# 145. FINDING FORMAT

Za svaki ozbiljan finding:

```text
ID:
Severity:
Standard/Category:
Confidence:
Status:

Affected users:
Route:
Component:
File:
Relevant location:

Problem:

Evidence:

User flow:

Keyboard behavior:

Screen reader behavior:

Visual behavior:

Impact:

Root cause:

Recommended remediation:

How to verify:

Regression test:

Complexity:
XS / S / M / L / XL
```

Ako određeno polje nije relevantno, označi:

**NOT APPLICABLE**

---

# 146. SEVERITY

Koristi:

## P1 - HIGH

- korisnik ne može završiti kritičan flow
- važna funkcija nije keyboard dostupna
- modal potpuno blokira screen reader/keyboard korišćenje
- ključna forma je praktično neupotrebljiva za značajnu grupu korisnika

## P2 - MEDIUM

- značajna accessibility prepreka sa workaround-om
- važne informacije nisu programatski dostupne
- ozbiljan focus/navigation problem

## P3 - LOW

- ograničen problem na sekundarnoj funkciji
- manja semantička nepravilnost sa realnom posledicom

## P4 - IMPROVEMENT

- opravdano accessibility poboljšanje bez trenutne ozbiljne prepreke

P0 koristi samo kada accessibility problem direktno izaziva kritičnu bezbednosnu ili drugu katastrofalnu posledicu.

---

# 147. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

runtime reprodukovano ili direktno dokazano DOM/semantikom.

MEDIUM:

kod jasno ukazuje na problem, ali assistive technology runtime nije proveren.

LOW:

zavisi od browser/AT kombinacije koja nije testirana.

---

# 148. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 149. STANDARD MAPPING

Gde možeš pouzdano, poveži nalaz sa relevantnim WCAG success criterion-om.

Ali:

- nemoj izmišljati criterion broj
- nemoj forsirati mapping ako nisi siguran
- tehnički problem može biti validan i bez numeričkog criterion-a

Ako nije pouzdano:

```text
WCAG mapping: NOT VERIFIED
```

---

# 150. DUPLICATE FINDINGS

Ako isti component pattern uzrokuje problem na 30 mesta:

napravi jedan root-cause finding.

Navedi:

```text
Affected locations:
```

Nemoj generisati 30 skoro identičnih nalaza.

---

# 151. FALSE-POSITIVE PREVENTION

Pre ozbiljnog finding-a proveri:

1. rendered HTML
2. component library behavior
3. parent wrapper
4. event handlers
5. keyboard behavior
6. CSS
7. hidden labels
8. ARIA relationships
9. browser native behavior
10. testove

Primer:

Ako ne vidiš `aria-label` u component fajlu, proveri da accessible name možda dolazi iz vidljivog teksta.

---

# 152. NE DODAJ ARIA AUTOMATSKI

Pravilo:

> Koristi native HTML kad god on pravilno rešava problem.

Nemoj preporučiti:

```html
<div role="button">
```

ako:

```html
<button>
```

rešava problem bolje.

---

# 153. NE MENJAJ KOD

Tokom audita:

- ne edituj components
- ne dodaj ARIA
- ne menjaj styles
- ne menjaj design system
- ne instaliraj accessibility library

Prvo završi audit.

---

# 154. OUTPUT - ACCESSIBILITY_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

Navedi:

- stack
- accessibility pristup
- najvažnije prepreke
- najjače postojeće accessibility prakse
- šta je runtime provereno
- šta nije provereno

## 2. Accessibility Architecture

- component library
- design system
- semantic strategy
- testing

## 3. Critical User Flows

## 4. Keyboard Audit

## 5. Focus Management Audit

## 6. Screen Reader Audit

## 7. Semantic HTML Audit

## 8. Forms Audit

## 9. Navigation Audit

## 10. Dialog / Modal / Drawer Audit

## 11. Custom Widgets Audit

## 12. Tables & Data Visualization Audit

## 13. Color & Contrast Audit

## 14. Motion Audit

## 15. Responsive / Zoom / Reflow Audit

## 16. Media Accessibility

## 17. Dynamic Content & Live Regions

## 18. Third-Party Components

## 19. Automated Testing Results

## 20. Manual Testing Results

## 21. Findings Summary

| ID | Severity | Category | Affected users | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 22. P1 Findings

## 23. P2 Findings

## 24. P3 Findings

## 25. P4 Improvements

## 26. Existing Accessibility Strengths

## 27. Missing Test Coverage

## 28. Unknown / Not Verified

## 29. Remediation Roadmap

### Phase 1 - Blocking barriers

### Phase 2 - Critical user flows

### Phase 3 - Shared components

### Phase 4 - Secondary content

### Phase 5 - Improvements

Prioritet postavi prema user impact-u, ne samo prema broju WCAG stavki.

---

# 155. KEYBOARD-ONLY SECOND PASS

Kada završiš prvi audit, ponovo prođi critical flow bez miša.

Zamisli da imaš samo:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys
```

Pitaj:

- Mogu li otvoriti sve potrebno?
- Mogu li zatvoriti sve što sam otvorio?
- Znam li uvek gde je focus?
- Da li focus ulazi u nevidljiv sadržaj?
- Da li postoji keyboard trap?
- Da li redosled ima smisla?

---

# 156. SCREEN-READER SECOND PASS

Ponovo analiziraj UI bez vizuelnog izgleda.

Za svaki ekran pitaj:

> Kada bih video samo accessibility tree, da li bih razumeo ovu stranicu?

Posebno proveri:

- page title
- headings
- landmarks
- links
- buttons
- forms
- errors
- dynamic state

---

# 157. NO-COLOR PASS

Zamisli da korisnik ne može pouzdano razlikovati boje.

Pitaj:

> Koja informacija nestaje?

Proveri:

- validation
- statuses
- chart
- selected state
- required fields
- alerts

---

# 158. 200% ZOOM PASS

Ponovo mentalno ili runtime testiraj critical flow sa značajnim zoom-om.

Pitaj:

- Da li se kontrole preklapaju?
- Da li sadržaj nestaje?
- Da li fixed UI prekriva sadržaj?
- Da li funkcija ostaje dostupna?

---

# 159. REDUCED MOTION PASS

Pretpostavi da korisnik traži reduced motion.

Pitaj:

- Koje animacije ostaju?
- Da li su neophodne?
- Da li sadržaj i dalje funkcioniše bez njih?

---

# 160. ERROR PASS

Namerno izazovi:

- required field error
- invalid format
- server error
- auth error

Pitaj:

> Da li korisnik bez vida može da razume šta je pošlo pogrešno i kako da popravi problem?

---

# 161. DYNAMIC CONTENT PASS

Za:

- search
- autocomplete
- filters
- toasts
- progress
- realtime updates

pitaj:

> Da li korisnik koji ne vidi ekran zna da se nešto promenilo?

Ne najavljuj svaku trivijalnu promenu.

---

# 162. DESTRUCTIVE FLOW PASS

Za:

- delete
- cancel subscription
- reset
- remove account

proveri:

- accessible control
- confirmation
- focus
- rezultat akcije

---

# 163. FIRST-TIME USER PASS

Zamisli korisnika koji:

- ne zna layout
- koristi keyboard
- koristi screen reader

Da li UI zahteva vizuelno memorisanje lokacije kontrola?

---

# 164. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nisi accessibility sveo na ARIA
- nisi accessibility sveo na automated tooling
- nisi prijavio missing aria-label kada postoji dobro vidljivo ime
- nisi dodao ARIA native elementu bez potrebe
- svaki P1/P2 ima konkretan user impact
- keyboard i focus su provereni odvojeno
- modal behavior je proveravan kao kompletan lifecycle
- forms su proverene zajedno sa error state-ovima
- dynamic content nije ignorisan
- responsive i zoom accessibility su provereni
- color-only informacije su proverene
- third-party komponente su uključene gde utiču na critical flow
- standard mapping nije izmišljen
- assistive technology behavior nije proglašeno potvrđenim bez runtime testa
- duplicate root causes su objedinjeni
- improvements su odvojeni od stvarnih barijera

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Dodajte alt tekst slikama, ARIA labele dugmadima i povećajte kontrast.

To nije ozbiljan accessibility audit.

Želim da analiziraš stvarnog korisnika koji pokušava da završi stvaran zadatak.

Primer kvalitetnog finding-a izgleda ovako:

```text
Keyboard user
↓
opens Edit Profile modal
↓
focus remains on background Edit button
↓
Tab continues through background page
↓
modal controls nisu sledeći u focus order-u
↓
korisnik ne može pouzdano navigirati modalom
```

ili:

```text
Form submit
↓
server returns validation error
↓
error appears visually at top of page
↓
focus remains on Submit
↓
no live announcement
↓
screen reader user nema signal da submit nije uspeo
```

ili:

```text
Status displayed as green/red dot
↓
no text
↓
no accessible label
↓
user koji ne razlikuje boje ili koristi screen reader
↓
ne može utvrditi status
```

Za svaki ozbiljan nalaz moraš znati:

- ko je pogođen
- koju funkciju pokušava da izvrši
- gde flow puca
- šta trenutni kod radi
- kako dokazati problem
- kako popraviti root cause
- kako sprečiti regresiju

Ako nešto nije provereno assistive tehnologijom:

**NOT VERIFIED.**

Ako postoji samo potencijalni rizik:

**LIKELY** ili **THEORETICAL**.

Ako je samo poboljšanje:

**P4 - IMPROVEMENT.**

Bolje je pronaći 12 stvarnih accessibility barijera nego generisati 100 generičkih WCAG stavki bez konteksta.

Cilj je dobiti accessibility audit koji developer može direktno pretvoriti u konkretne popravke, testove i proverljive acceptance kriterijume.
