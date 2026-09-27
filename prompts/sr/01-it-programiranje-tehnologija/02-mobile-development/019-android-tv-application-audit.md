---
id: UPL-IT-019
number: 19
slug: android-tv-application-audit
title: Audit Android TV aplikacije
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Mobilni razvoj
subcategory_id: mobile-development
language: sr
version: 1.0.0
status: stable
---

# AUDIT ANDROID TV APLIKACIJE

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletne Android TV aplikacije.

Glavni cilj:

> Utvrditi da li je aplikacija zaista pouzdano upotrebljiva na televizoru pomoću daljinskog upravljača, bez touch/mouse pretpostavki, sa stabilnim fokusom, pravilnim D-pad ponašanjem, pouzdanim Live TV i media playback flow-ovima, dobrim performansama na slabijem TV hardveru i ispravnim ponašanjem kroz lifecycle, PiP, EPG, playback, recording, timeshift, multiview i druge TV-specifične funkcije ako postoje.

Ovo nije:

- običan Android app audit
- mobile UI audit na velikom ekranu
- provera samo da li se APK instalira na TV
- generički Leanback checklist
- savet da se "povećaju dugmad"
- automatsko dodavanje focus modifier-a
- pretpostavka da je svaki ekran dobar ako radi sa mišom
- površna analiza ExoPlayer-a
- nasumično menjanje D-pad navigation-a

Fokus je na stvarnom TV iskustvu:

```text
remote input
↓
focus movement
↓
screen state
↓
content selection
↓
playback
↓
overlay / EPG / controls
↓
Back / Home / PiP / resume
```

Prioritet:

**focus correctness > playback continuity > remote usability > lifecycle reliability > data correctness > TV performance > visual polish**

Bolje je pronaći 6 stvarnih D-pad/focus/playback problema nego napisati 100 generičkih preporuka za TV UI.

---

# 1. UTVRDI TV STACK

Pre nalaza utvrdi:

- Android Gradle Plugin
- Kotlin
- minSdk
- targetSdk
- Compose for TV ili standard Compose
- Leanback ako postoji
- RecyclerView-based TV UI
- Navigation
- Media3 / ExoPlayer
- MediaSession
- PiP
- Live TV
- EPG
- recording
- timeshift
- multiview
- Cast
- DRM
- Room
- WorkManager
- remote/key handling
- focus system
- image loading
- analytics/crash reporting

Ne koristi mobile pretpostavke za TV.

---

# 2. UTVRDI TARGET UREĐAJE

Mapiraj:

```text
Android TV
Google TV
TV boxes
operator devices
generic AOSP TV
```

Ako aplikacija cilja specifične uređaje, dokumentuj:

- resolution
- aspect ratio
- hardware performance
- remote layout
- Android verzije

Ako nije definisano:

**TARGET DEVICE MATRIX: NOT DEFINED**

---

# 3. TV MANIFEST

Pregledaj:

- launcher category
- leanback launcher
- touch requirement
- TV banner
- orientation
- hardware features
- touchscreen declarations
- PiP support
- exported components

Proveri da aplikacija može pravilno da se pojavi i ponaša kao TV aplikacija.

---

# 4. TOUCHSCREEN REQUIREMENT

Android TV aplikacija ne treba slučajno da zahteva touchscreen ako nije potreban.

Proveri manifest features.

---

# 5. TV BANNER

Ako platforma/launcher zahteva banner, proveri:

- postoji
- dimenzije/config
- branding

Ali ne tretiraj cosmetic asset kao critical runtime finding.

---

# 6. D-PAD FIRST PRINCIPLE

Za svaki ekran pitaj:

> Može li kompletan critical flow da se završi samo daljinskim upravljačem?

Bez:

- mouse-a
- touch-a
- keyboard-a

---

# 7. REMOTE INPUT INVENTORY

Mapiraj:

- Up
- Down
- Left
- Right
- Center/Enter
- Back
- Play/Pause
- Next
- Previous
- Rewind
- Fast Forward
- Menu
- numeric keys ako postoje

Ne zahtevaj podršku za dugmad koja target remote nema.

---

# 8. FOCUS MAP

Za svaki critical screen napravi mapu fokusa.

Primer:

```text
Sidebar
↓
Content Row
↓
Card
↓
Details
↓
Action Buttons
```

Dokumentuj očekivani smer kretanja.

---

# 9. FOCUSABLE INVENTORY

Identifikuj sve interaktivne elemente:

- cards
- buttons
- tabs
- rows
- filters
- search
- player controls
- EPG cells
- dialogs

Pitaj:

> Da li svaki može dobiti fokus kada treba?

---

# 10. NON-FOCUSABLE ACTION

Critical bug:

UI element izgleda klikabilno, ali D-pad korisnik ne može do njega.

---

# 11. FOCUS TRAP

Scenario:

```text
focus enters component
↓
cannot leave with D-pad
```

Aktivno traži.

---

# 12. FOCUS LOSS

Scenario:

```text
data refresh
↓
focused item disappears/recomposes
↓
focus becomes null
```

Korisnik više ne zna gde je.

---

# 13. FOCUS JUMP

Focus ne sme neočekivano skočiti na:

- prvi item
- sidebar
- random row

nakon običnog data update-a.

---

# 14. FOCUS RESTORATION

Za navigation:

```text
List
↓
Detail
↓
Back
```

proveri da fokus ide nazad na prethodno izabrani item gde je to UX očekivanje.

---

# 15. FOCUS RESTORATION POSLE PLAYBACK-A

Scenario:

```text
channel/card selected
↓
fullscreen player
↓
Back
```

Fokus treba da se vrati smisleno.

---

# 16. FOCUS POSLE DIALOG-A

Open dialog:

```text
background focus A
↓
dialog
↓
focus inside dialog
↓
dismiss
↓
focus returns A
```

Ako ne, korisnik gubi orijentaciju.

---

# 17. FOCUS POSLE OVERLAY-A

Isto za:

- EPG overlay
- player controls
- settings panel
- audio/subtitle menu

---

# 18. FOCUS POSLE DATA REFRESH-A

Ako lista refreshuje:

- isti item i dalje postoji
- ID stabilan

proveri da fokus ostane na istom logical item-u.

---

# 19. STABLE IDENTITY

Focus restoration treba da se oslanja na stabilan item identity, ne samo list index.

---

# 20. INDEX-BASED FOCUS

Scenario:

```text
focus index 5
↓
new item inserted at top
↓
focus still index 5
↓
now points to different content
```

Traži ovakav bug.

---

# 21. COMPOSE FOCUS

Ako koristi Compose, pregledaj:

- `focusable`
- `focusRequester`
- `focusProperties`
- `onFocusChanged`
- `FocusRequester`

---

# 22. FOCUSREQUESTER LIFECYCLE

Proveri da request nije pozvan:

- pre nego što target uđe u composition
- nakon što target nestane

---

# 23. REPEATED FOCUS REQUEST

`LaunchedEffect` koji stalno traži focus može se boriti sa korisnikom.

Scenario:

```text
user moves right
↓
effect fires
↓
focus forced back left
```

---

# 24. FOCUSPROPERTIES

Ako se eksplicitno definiše next/previous:

proveri da nema:

- cycles
- dead ends
- invalid refs

---

# 25. MANUAL KEY HANDLING

Ako code hvata D-pad kroz:

- `onKeyEvent`
- `onPreviewKeyEvent`
- Activity dispatch

proveri da ne duplira normalan focus navigation.

---

# 26. KEY EVENT CONSUMPTION

Ako handler vrati `true`, događaj je potrošen.

Proveri da globalni handler ne blokira child controls.

---

# 27. KEY DOWN VS KEY UP

Jedan pritisak može proizvesti više event-a.

Ako se business akcija poziva i na down i na up:

može se izvršiti dvaput.

---

# 28. KEY REPEAT

Držanje D-pad dugmeta generiše repeat.

Proveri:

- fast navigation
- accidental repeated activation
- scroll behavior

---

# 29. CENTER BUTTON

Aktivacija na `KEYCODE_DPAD_CENTER` ili Enter treba da se dogodi jednom.

---

# 30. PLAY/PAUSE BUTTON

Ako remote ima media button, proveri da koristi isti canonical playback state kao on-screen controls.

---

# 31. BACK BUTTON

Back behavior na TV-u mora biti predvidljiv.

Mapiraj hijerarhiju:

```text
player controls open
↓
Back closes controls

fullscreen playback
↓
Back returns to previous screen

main/root screen
↓
Back exits or follows product policy
```

---

# 32. BACK NE SME BITI NASUMIČAN

Traži screen gde Back:

- jednom zatvara overlay
- drugi put odmah izlazi iz app-a
- treći put otvara drugi screen

bez jasnog state modela.

---

# 33. DOUBLE BACK

Brzi Back događaji mogu popovati više destination-a.

Proveri debouncing/state.

---

# 34. NAVIGATION ARCHITECTURE

Mapiraj:

- home
- categories
- search
- detail
- live TV
- EPG
- settings
- player

Za svaki put proveri focus restoration.

---

# 35. SIDEBAR

Ako postoji TV sidebar:

proveri:

- focus entry
- exit
- selected state
- collapsed/expanded
- Back behavior

---

# 36. SIDEBAR FOCUS MEMORY

Ako korisnik izađe iz sidebar-a i vrati se:

da li se fokus vraća na poslednju stavku ili uvek na prvu?

Definiši očekivanje.

---

# 37. TOP NAVIGATION

Isto za tabs/top menu.

---

# 38. ROW-BASED CONTENT

Tipičan TV UI:

```text
row
↓
horizontal cards
```

Proveri:

- horizontal focus
- vertical movement
- remembered position po row-u

---

# 39. PER-ROW FOCUS MEMORY

Scenario:

```text
Row 1 item 8
↓
Down to Row 2
↓
Up back to Row 1
```

Da li se vraća item 8 ili neočekivano item 1?

---

# 40. VIRTUALIZED ROWS

Lazy rendering može ukloniti trenutno nefokusirane item-e.

Proveri restoration kada se row vrati u viewport.

---

# 41. AUTO SCROLL

Focused item mora ostati vidljiv.

Proveri da scroll prati fokus bez:

- prevelikog skoka
- kasnog reposition-a
- oscillation-a

---

# 42. SCROLL + FOCUS RACE

Scenario:

```text
user holds Right
↓
focus changes rapidly
↓
scroll animation still running
```

Proveri konačni target.

---

# 43. FAST D-PAD NAVIGATION

Simuliraj brzo držanje:

```text
Right x20
```

Traži:

- focus loss
- input backlog
- wrong activation
- jank

---

# 44. FOCUS VISIBILITY

Focused element mora biti vizuelno jasno označen.

Proveri:

- scale
- border
- glow
- color
- elevation

Ne oslanjaj se samo na suptilnu boju ako nije dovoljno vidljiva na TV udaljenosti.

---

# 45. FOCUS SCALE

Ako focused card raste:

proveri da ne:

- preseca susedne elemente
- bude clipped
- menja layout i gura druge item-e

---

# 46. CLIPPING

Scale animation unutar clipped parent-a može odseći fokus efekat.

---

# 47. Z-ORDER

Focused card možda treba da bude iznad susednih elemenata.

Proveri actual layout.

---

# 48. FOCUS ANIMATION

Animacija ne sme kasniti toliko da korisnik ne zna gde je fokus tokom brzog navigation-a.

---

# 49. REMOTE LATENCY

Input-to-focus response treba biti brz.

Ako nije meren:

**REMOTE INPUT LATENCY: NOT MEASURED**

---

# 50. TV PERFORMANCE

TV uređaji često imaju slabiji:

- CPU
- GPU
- RAM
- storage

nego moderni telefoni.

Ne procenjuj performanse samo na high-end emulatoru/telefonu.

---

# 51. LARGE HERO IMAGES

Velike background slike mogu napraviti:

- memory pressure
- decode latency
- jank

Proveri stvarne dimensions.

---

# 52. ROW IMAGE LOADING

Brzo horizontalno kretanje može pokrenuti veliki broj image request-ova.

Proveri:

- caching
- cancellation
- placeholders
- requested size

---

# 53. FOCUS IMAGE REQUEST

Nemoj ponovno učitavati istu sliku svaki put kada item dobije fokus ako cache/model to već rešava.

---

# 54. BACKDROP

Ako fokus promenom item-a menja veliki background/backdrop:

proveri stale response race.

---

# 55. BACKDROP RACE

Scenario:

```text
focus A
↓
image A request starts
↓
focus B
↓
image B loads
↓
A loads late
↓
background returns to A
```

Critical visual/state race.

---

# 56. DEBOUNCE FOCUS-DRIVEN LOADS

Ako svaki focus move pokreće expensive:

- detail API
- EPG
- image
- preview video

razmotri debounce/cancellation samo ako current implementation pravi problem.

---

# 57. PREVIEW VIDEO

Ako focused item automatski pokreće preview:

proveri:

- debounce
- cancellation
- audio
- resources
- rapid focus changes

---

# 58. AUTOPLAY PREVIEW

Brzo menjanje fokusa ne sme kreirati mnogo player instanci ili stream request-ova.

---

# 59. PLAYER OWNERSHIP

Za glavni player utvrdi:

- screen
- Activity
- service
- session

Isto pravilo kao media audit, ali sa TV focus/navigation kontekstom.

---

# 60. LIVE TV FLOW

Ako postoji Live TV, mapiraj:

```text
channel list / EPG
↓
select channel
↓
resolve source
↓
prepare player
↓
audio/video
```

---

# 61. CHANNEL ZAPPING

Jedan od najvažnijih TV flow-ova.

Simuliraj:

```text
Channel A
↓
B
↓
C
↓
D
```

veoma brzo.

Finalni playback mora ostati D.

---

# 62. STALE RESOLVE

Kasni response za A/B/C ne sme promeniti player posle izbora D.

---

# 63. ZAP BOUNDS

Ako channel navigation koristi index:

proveri:

- first
- last
- empty list
- filtered list
- removed channel

---

# 64. NEXT/PREVIOUS CHANNEL

Ako postoji wrap-around:

dokumentuj.

Ako ne postoji:

ne dozvoli out-of-bounds.

---

# 65. CHANNEL LIST UPDATE TOKOM ZAP-A

Ako provider/source refresh promeni channel list dok user zappuje, proveri current identity.

---

# 66. CHANNEL ID VS INDEX

Player/current channel treba vezati za stabilan ID, ne samo trenutni list index.

---

# 67. CHANNEL NUMBER

Ako se podržava numeric zap:

proveri:

- multi-digit timeout
- invalid channel
- leading zero
- duplicate numbers

---

# 68. LAST CHANNEL

Ako postoji "previous channel" funkcija:

proveri da brz zap ne uništi logiku last/current.

---

# 69. CHANNEL HISTORY

Ne čuvaj neograničen history bez potrebe.

---

# 70. LIVE STREAM ERROR

Ako channel ne može da se pusti:

proveri:

- error overlay
- retry
- next channel
- return to list

Korisnik ne sme ostati zarobljen na crnom ekranu.

---

# 71. LIVE BUFFERING

Spinner/control overlay mora ostati remote-accessible.

---

# 72. AUDIO-FIRST

Kod TV-a audio može krenuti pre videa.

UI ne treba pogrešno tretirati to kao total failure.

---

# 73. BLACK SCREEN WITH AUDIO

Ako se dogodi decoder/video failure uz audio:

proveri error detection.

---

# 74. EPG

Ako postoji EPG, tretiraj ga kao kompleksan TV-specific interaction model.

---

# 75. EPG DATA MODEL

Mapiraj:

```text
channel
↓
programs
↓
start/end
↓
current time
```

---

# 76. EPG TIMEZONE

Proveri:

- source timezone
- UTC/local
- DST
- device timezone

Pogrešan offset može pomeriti celu vremensku osu.

---

# 77. DST

Na DST transition dan proveri:

- duplicated hour
- missing hour
- program positioning

---

# 78. EPG PROGRAM BOUNDS

Proveri:

```text
start < end
```

i behavior za invalid/missing data.

---

# 79. OVERLAPPING PROGRAMS

Ako provider pošalje overlap:

UI ne sme crashovati.

Dokumentuj fallback.

---

# 80. GAPS U EPG-U

Ako postoji period bez programa:

grid treba ostati navigabilan.

---

# 81. LONG PROGRAM

Veoma dug event ne sme proizvesti ekstreman width/layout problem.

---

# 82. VERY SHORT PROGRAM

Vrlo kratak event mora ostati focusable ili imati alternativan način selekcije ako feature to zahteva.

---

# 83. EPG CURRENT PROGRAM

Utvrdi boundary semantics:

```text
start <= now < end
```

ili stvarni model.

Izbegni double-current na tačnoj granici.

---

# 84. EPG NOW LINE

Ako postoji current-time marker:

proveri da se ažurira bez teškog full-grid recomposition-a.

---

# 85. CLOCK UPDATE

Ne refreshuj čitav EPG svake sekunde bez potrebe.

---

# 86. EPG FOCUS

D-pad navigation kroz 2D grid mora biti determinističan.

Pitaj:

> Gde fokus ide kada pritisnem Right, Left, Up, Down?

---

# 87. EPG VERTICAL MOVE

Kada ideš na drugi channel, možda nema program sa istim start time-om.

Definiši algoritam:

- najveći overlap
- nearest start
- current time position

Proveri actual implementation.

---

# 88. EPG HORIZONTAL MOVE

Left/Right treba da prati prethodni/sledeći program, ne samo geometrijsku blizinu ako ona vodi pogrešnom item-u.

---

# 89. EPG FOCUS MEMORY

Izlazak i povratak treba da vrati:

- channel
- program
- timeline position

ako proizvod to očekuje.

---

# 90. EPG AUTO-SCROLL

Focused program treba ostati vidljiv.

Proveri horizontalni i vertikalni scroll.

---

# 91. EPG SCROLL SYNCHRONIZATION

Ako channel column i timeline koriste odvojene liste:

proveri da ostanu vertikalno sinhronizovane.

---

# 92. HEADER / BODY SYNC

Time header i program grid horizontal scroll treba da ostanu usklađeni.

---

# 93. EPG VIRTUALIZATION

Veliki broj:

- kanala
- programa

ne treba renderovati ceo grid ako to pravi memory/jank problem.

---

# 94. EPG PERFORMANCE

Ako nije izmereno:

**EPG SCROLL PERFORMANCE: NOT MEASURED**

---

# 95. EPG DATA REFRESH

Ako EPG refresh stigne dok user navigira:

fokus ne sme nestati ili skočiti na drugi program bez potrebe.

---

# 96. EPG CURRENT PROGRAM CHANGE

Kada vreme pređe na sledeći program:

ne sme se automatski pomeriti user focus ako user pregledava budući program, osim ako UX to eksplicitno želi.

---

# 97. PROGRAM DETAILS

Iz EPG-a:

```text
focus program
↓
open details
↓
Back
```

vrati focus na isti program.

---

# 98. FUTURE PROGRAM

Akcija može biti:

- reminder
- record
- details

ne "play" ako sadržaj još nije dostupan, osim ako catch-up postoji.

---

# 99. PAST PROGRAM

Ako postoji catch-up/timeshift:

proveri source resolution prema konkretnom event-u.

---

# 100. EPG MISSING ID

Ne oslanjaj se samo na title/start kao unique identity ako provider daje stabilan event ID.

Ako ID nema, dokumentuj fallback.

---

# 101. REMINDERS

Ako postoji reminder:

mapiraj:

```text
EPG event
↓
schedule
↓
Alarm/Worker
↓
notification
↓
open event/channel
```

---

# 102. REMINDER STALE EVENT

EPG refresh može promeniti program timing.

Proveri da reminder semantics ostaje jasna.

---

# 103. RECORDING

Ako postoji recording feature, tretiraj kao high-risk state machine.

---

# 104. RECORDING STATE

Primer:

```text
IDLE
SCHEDULED
STARTING
RECORDING
STOPPING
COMPLETED
FAILED
CANCELLED
```

Proveri actual model.

---

# 105. RECORD START

Mora imati jasan owner koji preživljava UI screen.

---

# 106. RECORD STOP

Brzi:

```text
start
stop
start
```

može napraviti race.

---

# 107. UIDT / FGS / JOBS

Ako recording koristi User-Initiated Data Transfer, foreground service, JobScheduler ili WorkManager:

proveri platform constraints i ownership prema stvarnoj implementaciji.

---

# 108. DURABLE RECORDING

Ako recording treba da nastavi kada user ode sa screen-a:

ne vezuj ga samo za Activity/Composable scope.

---

# 109. RECORDING PROCESS DEATH

Pitaj:

> Kako app zna da je recording bio aktivan kada se proces vrati?

---

# 110. RECORDING RECOVERY

Proveri:

- current file
- temp file
- metadata
- server/source
- job state

---

# 111. STALE RECORDING STATE

UI ne sme prikazivati "Recording" samo zato što je flag ostao u DB ako underlying process/job više ne postoji.

---

# 112. TERMINAL JOB CLEANUP

Kada recording dođe u terminal state:

proveri da corresponding:

- job
- notification
- service
- temp resource

budu ugašeni.

---

# 113. RECORDING + SOURCE DELETE

Ako user obriše provider/source dok recording koristi taj source:

definiši expected behavior.

---

# 114. RECORDING + BACKUP/RESTORE

Backup restore ne sme ostaviti lažan active recording state.

---

# 115. STORAGE SPACE

Recording može napuniti storage.

Proveri:

- disk full
- partial file
- user error
- cleanup

---

# 116. RECORDING DUPLICATE

Dva start request-a ne smeju slučajno kreirati dve recording operacije ako business model dozvoljava samo jednu.

---

# 117. SCHEDULED RECORDING

Ako postoji:

- reboot
- app update
- clock/timezone change
- EPG shift

analiziraj.

---

# 118. RECORDING CONFLICT

Ako uređaj/resource ne može više simultaneous recording-a, proveri conflict UX.

---

# 119. TIMESHIFT

Ako postoji timeshift, mapiraj:

```text
live input
↓
rolling buffer
↓
pause
↓
seek back
↓
resume
↓
go live
```

---

# 120. TIMESHIFT BUFFER

Proveri:

- max duration
- storage
- eviction
- lifecycle

---

# 121. TIMESHIFT BUFFER BOUNDS

Seek ne sme ići van:

- oldest retained position
- current live edge

---

# 122. BUFFER EVICTION

Ako paused user padne iza buffer window-a:

definiši recovery.

---

# 123. GO LIVE

Go Live treba da pređe na trenutni edge i resetuje relevantan timeshift state.

---

# 124. LIVE / TIMESHIFT RACE

Scenario:

```text
user presses Go Live
↓
old seek request completes late
↓
player jumps backwards again
```

Traži stale action guard.

---

# 125. TIMESHIFT PROCESS DEATH

Da li se timeshift očekuje da preživi process death?

Često ne.

Dokumentuj product expectation.

---

# 126. TIMESHIFT STORAGE CLEANUP

Rolling buffer temp fajlovi moraju biti očišćeni.

---

# 127. MULTIVIEW

Ako postoji više istovremenih stream-ova:

mapiraj:

```text
tile A
tile B
tile C
tile D
```

---

# 128. MULTIVIEW PLAYER COUNT

Koliko player instanci postoji?

Ako runtime/device limits nisu testirani:

**DECODER CAPACITY: NOT VERIFIED**

---

# 129. ACTIVE TILE

Samo jedan tile obično treba audio.

Proveri:

- active selection
- focus
- audio handoff

---

# 130. MULTIVIEW FOCUS

D-pad mora jasno menjati active/focused tile.

---

# 131. TILE REMOVE

Ako se tile ukloni:

- player release
- focus target
- audio selection

moraju se ažurirati.

---

# 132. TILE FAILURE

Jedan stream failure ne treba nužno srušiti ostale.

---

# 133. MULTIVIEW PERFORMANCE

Proveri:

- decoder count
- bandwidth
- resolution
- memory

Ne izmišljaj device capabilities.

---

# 134. PiP

Ako app koristi PiP:

proveri:

- enter
- actions
- playback state
- exit
- focus restoration

---

# 135. PiP NA TV-U

Ne pretpostavljaj identično ponašanje kao phone PiP.

Proveri target platform behavior.

---

# 136. BACKGROUND PLAYBACK

TV aplikacija može imati drugačiji product expectation od mobile audio aplikacije.

Dokumentuj.

---

# 137. HOME BUTTON

Home nije isto što i Back.

Proveri šta se dešava sa:

- player
- recording
- timeshift
- session

---

# 138. APP RETURN POSLE HOME

Povratak treba da obnovi UI iz stvarnog playback state-a, ne iz stale local booleana.

---

# 139. PROCESS DEATH

Za critical TV state proveri:

- current channel
- playback position
- EPG selection
- recording
- account
- source/provider

---

# 140. RESTART POSLE PROCESS DEATH-A

Ne vraćaj automatski sve state-ove ako product to ne očekuje.

Posebno autoplay live channel-a može biti UX/product odluka.

---

# 141. PLAYER STATE RESTORE

Ako se restore-uje channel:

proveri da source još postoji i user još ima permission.

---

# 142. PROVIDER/SOURCE MANAGEMENT

Ako IPTV/TV app ima više source/provider naloga:

mapiraj:

- source ID
- channels
- EPG
- recordings
- favorites
- history

---

# 143. SOURCE DELETE

Delete source mora koordinisati:

- active playback
- EPG
- recordings
- reminders
- favorites
- cached content

---

# 144. SOURCE REPLACE

Ako backup/import ili edit zamenjuje provider:

proveri da retained source i removed source budu razlikovani.

---

# 145. PROVIDER REFRESH

Refresh channels/EPG ne sme nehotice obrisati user state koji je vezan za stabilan logical channel.

---

# 146. CHANNEL IDENTITY POSLE REFRESH-A

Provider može promeniti:

- ordering
- metadata
- URL

Ako favorites/history koriste list index, mogu se pokvariti.

---

# 147. STABLE CHANNEL FINGERPRINT

Ako nema stabilan remote ID, proveri kako aplikacija identifikuje isti channel kroz refresh.

Ne dizajniraj novi fingerprint bez analize collision-a.

---

# 148. DUPLICATE CHANNELS

Provider može imati isti channel više puta.

Proveri dedup semantics.

---

# 149. FAVORITES

Favorite treba da preživi refresh ako logical channel ostaje isti.

---

# 150. HISTORY

Recently watched treba biti user/source-aware.

---

# 151. PARENTAL CONTROL

Ako postoji, tretiraj kao security boundary.

---

# 152. PIN GATE

Proveri:

```text
locked channel
↓
select
↓
PIN
↓
success/failure
```

---

# 153. BACK IZ PIN DIALOG-A

Mora vratiti fokus bez otključavanja sadržaja.

---

# 154. PROCESS DEATH POSLE UNLOCK-A

Ako unlock važi samo session, process restart treba da vrati odgovarajuće zaključano stanje.

---

# 155. PROFILE / USER SWITCH

Ako više profila postoji, parental state i favorites mogu biti profile-scoped.

---

# 156. SEARCH

TV search mora biti potpuno remote-usable.

---

# 157. ONSCREEN KEYBOARD

Proveri interaction sa Android TV keyboard/IME.

---

# 158. SEARCH FOCUS

Scenario:

```text
search field
↓
results
↓
Back
```

Focus mora biti predvidljiv.

---

# 159. VOICE SEARCH

Ako app koristi voice search:

proveri permissions/integration.

Ako ne:

**NOT APPLICABLE**

---

# 160. FAST SEARCH INPUT

Results refresh ne sme stalno resetovati fokus na prvi item dok user navigira.

---

# 161. FILTERS

Filter chips/dropdowns moraju biti D-pad navigabilni.

---

# 162. SORT

Promena sort-a može reorderovati focused item.

Proveri focus identity.

---

# 163. SETTINGS

Settings na TV-u često sadrži switch/list rows.

Cela row može biti focus target.

Proveri da Center izvršava očekivanu akciju.

---

# 164. SWITCH

Focused switch state mora biti jasno vidljiv i screen-reader semantics ispravne gde je relevantno.

---

# 165. DESTRUCTIVE SETTINGS

Reset/delete source treba imati confirmation flow upotrebljiv daljinskim.

---

# 166. LONG TEXT

Legal/help screens moraju biti scrollable D-pad-om.

---

# 167. QR CODE

Ako TV prikazuje QR za login/linking:

proveri fallback za user-a koji nema telefon ili kamera ne radi, ako proizvod to zahteva.

---

# 168. AUTHENTICATION

TV auth često koristi:

- email/password
- device code
- QR
- external browser

Mapiraj stvarni flow.

---

# 169. DEVICE CODE

Ako postoji:

- expiry
- polling
- cancel
- account switch

---

# 170. POLLING

Device-code polling ne sme nastaviti zauvek nakon screen-a ili expiry-ja.

---

# 171. AUTH SUCCESS

Ako login završi na drugom uređaju:

TV UI mora pravilno preći u authenticated state bez focus/navigation glitch-a.

---

# 172. LOGOUT

Na logout-u proveri:

- player
- MediaSession
- recording
- pending jobs
- Room/user data
- navigation stack
- focus

---

# 173. BACK POSLE LOGOUT-A

Ne sme otvoriti privatni screen iz starog back stack-a.

---

# 174. CROSS-USER TV DATA

Favorites/history/recordings ne smeju procuriti drugom nalogu ako su user-specific.

---

# 175. NETWORK LOSS

TV app često radi dugo.

Simuliraj:

```text
live playback
↓
network lost
↓
network returns
```

---

# 176. WI-FI TO ETHERNET / NETWORK CHANGE

Ako underlying network promeni transport, playback/repository treba recovery-ovati.

---

# 177. CAPTIVE / LIMITED NETWORK

"Connected" nije isto što i server reachable.

---

# 178. OFFLINE UI

Ako app bez mreže nema sadržaj:

poruka mora biti remote-usable i nuditi retry gde ima smisla.

---

# 179. NETWORK ERROR OVERLAY

Overlay ne sme zarobiti focus ili sprečiti Back.

---

# 180. RETRY BUTTON

Mora imati default focus ili biti lako dostupan.

---

# 181. ERROR + BACK

Korisnik treba moći izaći iz failed player screen-a.

---

# 182. LOADING SCREEN

Dug loading ne sme ostaviti screen bez focusable escape mogućnosti ako Back treba da radi.

---

# 183. SLOW PROVIDER

Ako channel/EPG API traje dugo:

proveri da user i dalje može navigirati drugim delovima aplikacije.

---

# 184. CANCELLATION

Ako user napusti screen tokom load-a:

kasni response ne sme resetovati novi screen ili focus.

---

# 185. LONG-RUNNING SESSION

TV app može ostati otvorena danima.

Posebno proveri:

- token expiry
- EPG refresh
- player URLs
- memory
- cache
- WebSockets

---

# 186. MIDNIGHT / DATE CHANGE

EPG/day navigation treba pravilno preći na novi datum.

---

# 187. TIMEZONE CHANGE

Ako uređaj promeni timezone, EPG/current program mapping mora se osvežiti.

---

# 188. CLOCK WRONG

Device clock može biti pogrešan.

Ako current program zavisi isključivo od device clock-a, dokumentuj ograničenje.

---

# 189. SCREEN BURN-IN / STATIC UI

Ako app prikazuje vrlo statičan UI satima, može biti UX/device consideration.

Ne prijavljuj kao bug bez requirement-a.

---

# 190. SCREEN SAVER

Android TV može pokrenuti ambient/screen saver.

Proveri playback/product behavior.

---

# 191. KEEP SCREEN ON

Ako playback treba da spreči sleep, proveri odgovarajući behavior.

Ne drži ekran budnim na non-playback screens bez potrebe.

---

# 192. WAKE LOCK

Ako postoji, proveri lifecycle.

---

# 193. LOW MEMORY

TV uređaj može agresivno ubiti background app.

Povratak mora raditi iz persistent state-a.

---

# 194. STORAGE

TV box može imati vrlo malo storage-a.

Posebno:

- recordings
- timeshift
- image cache
- EPG DB

---

# 195. CACHE LIMIT

Ne dozvoli neograničen image/EPG/media cache.

---

# 196. EPG RETENTION

Stari EPG podaci mogu rasti.

Proveri retention.

---

# 197. RECORDING RETENTION

Ako korisnik pravi recordings:

proveri storage management i delete UX.

---

# 198. TIMESHiFT CLEANUP

Temp buffer mora imati lifecycle/size granicu.

---

# 199. DATABASE PERFORMANCE

EPG može sadržati veliki broj redova.

Proveri:

- time-range queries
- channel filters
- indexes
- N+1

---

# 200. EPG QUERY

Critical query često liči na:

```text
channel_id
+
start/end time
```

Proveri index prema stvarnom SQL-u.

Ne izmišljaj.

---

# 201. CHANNEL LIST PERFORMANCE

Hiljade kanala mogu zahtevati:

- lazy list
- filtering
- search

ali performance severity zavisi od realnog dataset-a.

---

# 202. FAVORITE FILTER

Ne raditi full expensive reprocessing na svaki D-pad event bez potrebe.

---

# 203. IMAGE MEMORY

TV poster/backdrop assets mogu biti veliki.

Requestuj display-appropriate size gde loader podržava.

---

# 204. BACKDROP TRANSITION MEMORY

Ne držati mnogo full-resolution background bitmap-a nepotrebno.

---

# 205. GPU

Scale/glow/blur animacije na desetine kartica mogu biti skupe na low-end TV GPU-u.

Ako nije mereno:

**TV GPU PERFORMANCE: NOT MEASURED**

---

# 206. ANIMATIONS

TV focus feedback treba da bude brz.

Duga animacija može učiniti remote navigation "lepljivim".

---

# 207. COMPOSE RECOMPOSITION

EPG/focus changes mogu izazvati veliki recomposition blast radius.

Prijavi samo uz concrete hotspot.

---

# 208. FOCUS STATE U VELIKOM TREE-U

Ako svaki focus move menja globalni root state:

hiljade elemenata mogu reagovati.

Analiziraj actual dependency.

---

# 209. CLOCK TICK RECOMPOSITION

Ako current time update na svakih nekoliko sekundi recomponuje ceo EPG:

to može biti performance hotspot.

---

# 210. LIST KEY

TV focus state posebno zavisi od stabilnih keys u Lazy listama.

---

# 211. SCREEN RESOLUTION

Testiraj relevantno:

- 720p
- 1080p
- 4K

ako product/device matrix to zahteva.

---

# 212. OVERSCAN / SAFE AREA

Moderni TV uglavnom imaju manje legacy overscan problema, ali critical text/actions ne treba nepotrebno lepiti uz ivice.

Ne koristi zastarele TV safe-area pretpostavke bez target device razloga.

---

# 213. FONT SIZE

TV se gleda sa distance.

Proveri readability na stvarnom ekranu ili screenshot/device preview-u.

Ovo je UX finding, ne correctness, osim ako text postaje nečitljiv.

---

# 214. CONTRAST

Focus indicator mora biti vidljiv na različitim poster/background bojama.

---

# 215. ACCESSIBILITY

Ako TalkBack/TV accessibility scope postoji, proveri:

- labels
- roles
- focus order
- selected state

Ali ne mešaj accessibility focus i input focus bez razumevanja platforme.

---

# 216. CONTENT DESCRIPTION

Poster može imati naslov kao semantic label.

Ne dodaj redundantno čitanje istog teksta više puta.

---

# 217. PLAYER CONTROLS ACCESSIBILITY

Play/Pause/CC/Settings ikone moraju imati labels.

---

# 218. PARENTAL PIN ACCESSIBILITY

PIN screen mora imati jasan current focus i input feedback.

---

# 219. TESTOVI

Mapiraj:

- unit
- Compose UI
- instrumentation
- screenshot
- playback
- focus
- remote/key tests
- EPG
- recording
- timeshift
- multiview

---

# 220. TOUCH-BASED UI TEST LIMIT

Test koji klikće koordinatu ili `performClick` direktno ne dokazuje D-pad navigation correctness.

---

# 221. D-PAD TEST

Za critical screen testiraj sequence:

```text
Right
Right
Down
Left
Center
Back
```

Assert focused item posle svakog koraka.

---

# 222. FOCUS RESTORATION TEST

```text
focus item X
↓
open details
↓
Back
↓
assert X focused
```

---

# 223. DATA REFRESH FOCUS TEST

```text
focus item X
↓
refresh list
↓
item X still exists
↓
assert X remains focused
```

---

# 224. REMOVED FOCUSED ITEM TEST

Ako X nestane:

proveri deterministic fallback fokus:

- nearest
- previous
- next
- parent

prema UX-u.

---

# 225. RAPID D-PAD TEST

Repeat input sa držanjem dugmeta.

---

# 226. RAPID ZAP TEST

Za Live TV:

kontroliši delayed responses tako da najstariji završi poslednji.

Finalni channel mora ostati najnovije izabran.

---

# 227. EPG NAV TEST

Testiraj:

- horizontalno
- vertikalno
- granice
- gaps
- overlaps
- future/past

---

# 228. EPG REFRESH TEST

Refresh dok je focus na konkretnom programu.

---

# 229. MIDNIGHT EPG TEST

Prelazak dana.

---

# 230. DST TEST

Ako timezone scope opravdava.

---

# 231. RECORDING TEST

Ako postoji:

```text
start
↓
background
↓
process issue/recovery
↓
stop
```

---

# 232. RAPID RECORDING CONTROL TEST

```text
start
stop
start
```

Assert valid state machine.

---

# 233. RECORDING SOURCE DELETE TEST

Delete provider/source tokom recording-a.

Assert očekivano terminalno stanje.

---

# 234. TIMESHIFT TEST

```text
live
↓
pause
↓
seek back
↓
buffer window advances
↓
go live
```

---

# 235. MULTIVIEW TEST

Ako postoji:

- add tiles
- focus
- audio switch
- remove active
- background/foreground

---

# 236. PiP TEST

Ako postoji.

---

# 237. PROCESS DEATH TEST

Za TV screen state:

- current channel
- list selection
- EPG
- auth
- active recording state

Razlikuj šta stvarno treba restore-ovati.

---

# 238. LONG SESSION TEST

Simuliraj ili testiraj:

- mnogo channel transitions
- EPG refresh cikluse
- background/foreground
- long playback

Traži resource accumulation.

---

# 239. LOW-END DEVICE TEST

Ako moguće, testiraj na realnom ili reprezentativnom slabijem TV uređaju.

Emulator/high-end telefon nije dovoljan dokaz.

---

# 240. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Feature:
Screen:
TV interaction:
Focused element:
Player/source:
File/Class:
Relevant code:

Device/API scope:

Problem:

Evidence:

TV Interaction Timeline:

T0:
T1:
T2:
T3:

Expected focus/state:

Actual/Possible focus/state:

Playback impact:

User impact:

Data/Recording impact:

Root cause:

Recommended remediation:

Regression test:

Device/runtime verification:

Complexity:
XS / S / M / L / XL
```

---

# 241. SEVERITY

Koristi:

## P0 - CRITICAL

- cross-user private media exposure
- destructive recording/data corruption
- serious parental/security bypass

## P1 - HIGH

- critical screen nije usable samo remote-om
- fokus se gubi i user ostaje zarobljen
- pogrešan channel počinje da se pušta zbog race-a
- recording/timeshift može izgubiti critical data
- logout ostavlja private playback/state

## P2 - MEDIUM

- značajan focus/navigation problem
- EPG normalni flow je nepouzdan
- playback recovery problem sa workaround-om
- important TV feature radi nekonzistentno

## P3 - LOW

- ograničen focus/remote edge case
- secondary TV UX problem

## P4 - IMPROVEMENT

- TV polish/performance/UX unapređenje bez postojećeg functional failure-a

---

# 242. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

runtime reprodukovano na TV/emulatoru ili direktno dokazano state/focus flow-om.

MEDIUM:

jak code-level dokaz, ali relevantan TV device nije testiran.

LOW:

zavisi od OEM remote-a, decoder-a, TV launcher-a ili device-specific behavior-a.

---

# 243. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 244. DEVICE STATUS

Za TV-specific finding dodaj:

```text
DEVICE VERIFIED:
YES
NO

INPUT VERIFIED:
YES
NO
```

---

# 245. PERFORMANCE STATUS

Za performance finding:

```text
MEASURED
CODE-LEVEL RISK
NOT MEASURED
```

---

# 246. FALSE-POSITIVE PREVENCIJA

Pre P1/P2 finding-a proveri:

1. actual TV input flow
2. focus owner
3. list keys
4. navigation state
5. Compose/View behavior
6. player state
7. EPG model
8. provider/source identity
9. lifecycle
10. tests

Ne zaključuj iz screenshot-a da focus ne radi.

---

# 247. NE TRETIRAJ MOUSE KAO TV TEST

Ako ekran radi sa mouse click-om:

to ništa ne dokazuje o D-pad usability-ju.

---

# 248. NE FORSIRAJ MANUAL FOCUS ROUTING SVUDA

Default spatial navigation može biti sasvim dobra.

Dodaj custom focus properties samo gde actual navigation nije deterministična ili odgovarajuća.

---

# 249. NE ČUVAJ FOCUS SAMO KAO INDEX

Ako lista može da se menja, stable logical ID je obično pouzdaniji.

Ali proveri actual architecture.

---

# 250. NE MENJAJ PLAYER ZBOG FOCUS-A

Focus i player lifecycle su odvojeni problemi.

Nemoj kreirati/release player na svaki focus event osim ako feature baš predstavlja preview playback.

---

# 251. NE REFRESHUJ SVE NA SVAKI FOCUS

Focus movement može biti veoma čest.

Ne vezuj heavyweight fetch/DB operation direktno za svaki focus event bez cancellation/debounce/caching strategije.

---

# 252. NE MENJAJ KOD

Tokom audita:

- ne menja focus
- ne menja navigation
- ne menja player
- ne menja EPG
- ne menja recording
- ne menja timeshift
- ne dodaje TV libraries

Prvo završi audit.

---

# 253. OUTPUT - ANDROID_TV_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- TV stack
- input model
- focus architecture
- media architecture
- najveći TV rizici
- production readiness

## 2. TV Device / Platform Matrix

## 3. Manifest / TV Launcher Audit

## 4. D-pad Input Audit

## 5. Focus Architecture

## 6. Focus Navigation Audit

## 7. Focus Restoration Audit

## 8. Sidebar / Navigation Audit

## 9. Row / Grid Navigation Audit

## 10. TV Performance Audit

## 11. Live TV Audit

## 12. Channel Zapping Audit

## 13. Player Lifecycle Audit

## 14. EPG Data Audit

## 15. EPG Focus / Timeline Audit

## 16. Recording Audit

## 17. Timeshift Audit

## 18. Multiview Audit

## 19. PiP Audit

## 20. Provider / Source Audit

## 21. Search Audit

## 22. Settings / Forms Audit

## 23. Authentication / Logout Audit

## 24. Parental Controls Audit

## 25. Network / Recovery Audit

## 26. Long Session / Memory Audit

## 27. Accessibility Audit

## 28. Test Coverage Audit

## 29. Findings Summary

| ID | Severity | Area | Screen/Feature | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 30. P0 Findings

## 31. P1 Findings

## 32. P2 Findings

## 33. P3 Findings

## 34. P4 Improvements

## 35. Things Done Well

## 36. Unknown / Not Verified

## 37. Production Readiness Matrix

Koristi:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Za:

- TV launcher
- remote-only navigation
- focus visibility
- focus restoration
- dialogs
- Back
- rapid D-pad
- Live TV
- rapid zap
- EPG
- recording
- timeshift
- multiview
- PiP
- process death
- logout
- low-end performance
- long session
- tests

## 38. Remediation Roadmap

---

# 254. FOCUS MATRIX

Za svaki critical screen:

| Element | Focusable | Up | Down | Left | Right | Center |
|---|---|---|---|---|---|---|

Ne moraš dokumentovati svaki minor element ako screen ima stotine kartica.

Fokusiraj logical component types.

---

# 255. FOCUS RESTORATION MATRIX

| Flow | Previous focus | Return focus | Stable ID | Verified |
|---|---|---|---|---|

---

# 256. TV INPUT MATRIX

| Key | Screen | Expected action | Consumed by | Risk |
|---|---|---|---|---|

---

# 257. LIVE TV MATRIX

| Action | Player state before | Expected after | Race guard | Verified |
|---|---|---|---|---|

---

# 258. EPG MATRIX

| Scenario | Expected focus | Expected timeline | Result |
|---|---|---|---|

---

# 259. RECORDING MATRIX

| State | Action | Expected next | Durable | Recovery |
|---|---|---|---|---|

---

# 260. SECOND PASS - REMOTE-ONLY ATTACK

Nakon prvog audita mentalno ukloni:

- touch
- mouse
- keyboard

i završi svaki critical flow isključivo sa:

```text
Up
Down
Left
Right
Center
Back
```

Ako flow ne može da se završi:

to je realan TV usability finding.

---

# 261. SECOND PASS - FOCUS LOSS ATTACK

Za svaki screen promeni data set dok je item fokusiran:

```text
focus X
↓
insert item before X
↓
refresh
↓
remove unrelated item
```

Pitaj:

> Gde je fokus?

---

# 262. SECOND PASS - REMOVE FOCUSED ITEM

```text
focus X
↓
X removed
```

Pitaj:

> Ko dobija fokus sada?

Behavior mora biti determinističan.

---

# 263. SECOND PASS - RAPID INPUT

Simuliraj brzo držanje:

```text
Right Right Right Right Right
Down
Left Left
Center
```

Traži:

- input queue issues
- focus mismatch
- stale selected item

---

# 264. SECOND PASS - RAPID ZAP

Koristi najgori ordering:

```text
A starts resolving
B starts resolving
C starts resolving
C returns
B returns
A returns
```

Finalni playback mora biti C.

---

# 265. SECOND PASS - EPG REFRESH

```text
user focused future program
↓
EPG refresh
↓
program data changes
```

Pitaj:

- da li logical event i dalje postoji
- da li focus ostaje
- da li scroll skače

---

# 266. SECOND PASS - MIDNIGHT

Simuliraj aplikaciju otvorenu preko:

```text
23:59
↓
00:00
```

Proveri:

- EPG date
- current program
- now line
- scheduled recording/reminder

---

# 267. SECOND PASS - RECORDING FAILURE

Ubaci failure u:

```text
STARTING
RECORDING
STOPPING
FINALIZING
```

Pitaj šta ostaje durable i šta korisnik vidi.

---

# 268. SECOND PASS - SOURCE DELETE

Scenario:

```text
provider active
↓
channel playing
↓
recording pending
↓
user deletes provider
```

Proveri sve dependent state-ove.

---

# 269. SECOND PASS - PROCESS DEATH

Ubij process tokom:

- browsing
- Live TV
- EPG
- recording
- timeshift
- multiview

Za svaki odredi šta se realno očekuje posle povratka.

---

# 270. SECOND PASS - LOGOUT

```text
private channel playing
↓
logout
```

Proveri:

- player
- MediaSession
- notification
- recordings
- focus
- navigation
- Room state

---

# 271. SECOND PASS - LONG SESSION

Simuliraj:

- 8 sati playback-a
- 100 channel changes
- više EPG refresh ciklusa
- više background/foreground prelaza

Pitaj:

> Koji resource raste ili se duplira?

---

# 272. SECOND PASS - LOW-END TV

Ponovi critical screens sa pretpostavkom:

- slab CPU
- 2 GB ili manje dostupnog RAM-a
- spor storage
- ograničen decoder

Ne izmišljaj konkretan device limit.

---

# 273. SECOND PASS - NETWORK FAILURE

Tokom Live TV-a:

```text
network lost
↓
user zaps
↓
network returns
```

Pitaj:

> Koji channel se na kraju pušta?

---

# 274. SECOND PASS - BACK BUTTON

Na svakom overlay/screen state-u pitaj:

> Šta tačno radi jedan Back?

Ako odgovor nije determinističan iz state machine-a, istraži dalje.

---

# 275. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- nijedan critical flow nije ocenjen samo mouse/touch testom
- fokus je tretiran kao state, ne samo styling
- focus restoration je proverena
- list index nije automatski prihvaćen kao stable identity
- rapid input scenario je analiziran
- key repeat i duplicate activation su provereni
- Back behavior je mapiran
- Live TV source switching proverava stale responses
- channel identity nije zasnovan samo na index-u ako se lista menja
- EPG timezone/DST/bounds su analizirani
- EPG focus se ne resetuje bez razloga na refresh
- recording ima state machine i durable recovery gde je potrebno
- timeshift proverava buffer bounds
- multiview uzima decoder/resource limits u obzir
- logout/state boundary je analiziran
- private media ne ostaje aktivna kroz account switch
- long-session resource growth je analiziran
- TV performance nije zaključena iz phone uređaja
- device-specific tvrdnje nisu izmišljene
- svaki P1/P2 ima konkretan D-pad/focus/playback timeline
- P4 polish je odvojen od functional bugova

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Poboljšajte D-pad navigaciju, povećajte dugmad i testirajte aplikaciju na televizoru.

To nije Android TV audit.

Tražim probleme poput:

```text
focus on channel 15
↓
EPG refresh inserts new channel at index 0
↓
app stores focus by index
↓
same index now belongs to channel 14
↓
focus silently moves to wrong logical channel
```

ili:

```text
Channel A source request starts
↓
user zaps B
↓
user zaps C
↓
C starts playing
↓
A request completes late
↓
player receives A MediaItem
↓
TV jumps back to wrong channel
```

ili:

```text
dialog opens
↓
focus moves inside dialog
↓
dialog closes
↓
previous FocusRequester target no longer exists
↓
focus becomes null
↓
remote user cannot continue navigation
```

ili:

```text
recording marked RECORDING in database
↓
process dies
↓
underlying recording job is gone
↓
app restarts
↓
UI trusts DB flag
↓
user sees recording as active although nothing is being recorded
```

ili:

```text
timeshift paused
↓
rolling buffer advances
↓
oldest segment containing current position is deleted
↓
user presses Play
↓
player attempts unavailable segment
↓
no recovery to oldest valid position or live edge
```

ili:

```text
User A plays private channel
↓
logout
↓
MediaSession/Player remains alive
↓
User B logs in
↓
A content and metadata still active
```

ili:

```text
focused card A starts backdrop request
↓
focus moves to B
↓
B backdrop displayed
↓
A image request finishes later
↓
background switches back to A
↓
visual context no longer matches focused item
```

To su Android TV problemi koje treba da pronađeš.

Razmišljaj kroz:

- remote-only interaction
- focus ownership
- stable identity
- D-pad ordering
- Back behavior
- rapid input
- source switching
- EPG time model
- recording state
- timeshift bounds
- process death
- long-running playback
- account boundaries
- low-end TV hardware

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji element ima fokus?

> Šta se događa ako user brzo pritiska D-pad?

> Šta se događa ako lista promeni sadržaj?

> Gde se focus vraća posle Back-a?

> Koji channel je canonical tokom rapid zapping-a?

> Može li stari async rezultat promeniti novi TV state?

> Šta se događa ako proces nestane tokom recording-a?

> Šta se događa nakon više sati rada?

Ako nije runtime provereno:

**NOT VERIFIED.**

Ako zavisi od specifičnog TV uređaja:

**DEVICE BEHAVIOR NOT VERIFIED.**

Ako je samo UX polish:

**P4 - IMPROVEMENT.**

Bolje je pronaći 6 stvarnih focus/playback/EPG bugova nego napisati 100 generičkih TV preporuka.

Cilj je dobiti forenzički precizan Android TV audit koji se može direktno pretvoriti u:

- deterministic D-pad reproduction
- focus regression test
- rapid-zap race test
- EPG navigation test
- recording recovery test
- timeshift boundary test
- process-death verification
- production TV readiness plan
