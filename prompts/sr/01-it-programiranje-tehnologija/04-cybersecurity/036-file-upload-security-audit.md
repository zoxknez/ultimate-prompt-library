---
id: UPL-IT-036
number: 36
slug: file-upload-security-audit
title: Bezbednosni audit otpremanja fajlova
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.1
status: stable
---

# BEZBEDNOSNI AUDIT OTPREMANJA FAJLOVA

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog file upload sistema aplikacije, od trenutka kada fajl napusti klijenta do njegovog:

- prijema

- parsiranja

- validacije

- privremenog čuvanja

- finalnog storage-a

- post-processinga

- preview-a

- download-a

- javnog serviranja

- brisanja

- arhiviranja

Glavni cilj:

> Utvrditi da li napadač može da uploaduje fajl koji zaobilazi validation, izvrši aktivan sadržaj pod origin-om aplikacije, prepiše ili pročita lokalne fajlove, izazove parser exploit, SSRF, Zip Slip, decompression bomb, storage exhaustion, malware distribution, cross-user/cross-tenant data access ili drugi konkretan sigurnosni failure.

Ovo nije:

- generički savet da se proveri MIME type

- automatski zahtev za antivirus na svakom upload-u

- automatska zabrana SVG/PDF/ZIP fajlova

- pretpostavka da extension određuje stvarni file type

- pretpostavka da magic bytes rešavaju sve

- automatsko prebacivanje svega na object storage

- samo path traversal audit

- samo malware audit

- samo file size limit audit

- automatsko proglašavanje svakog user-uploaded fajla RCE rizikom

Fokus je na kompletnom lifecycle-u:

```text

client-selected file

↓

HTTP upload

↓

body/multipart parser

↓

temporary storage

↓

validation

↓

renaming/key generation

↓

permanent storage

↓

processing/transformation

↓

metadata extraction

↓

serving/download

↓

deletion/retention

```

Prioritet:

**arbitrary code execution > arbitrary file write/read > active content under trusted origin > parser exploitation > cross-user/cross-tenant exposure > SSRF/path traversal > archive attacks > storage/resource abuse > malware distribution > hardening**

Bolje je pronaći 5 stvarnih exploitable upload failure-a nego napisati 100 generičkih file-security preporuka.

---

# 1. INVENTARIŠI SVE UPLOAD POVRŠINE

Pronađi svaki upload flow:

- avatar

- profile image

- attachments

- documents

- invoices

- CSV import

- ZIP import

- backup restore

- media upload

- video

- audio

- PDF

- spreadsheet

- office documents

- admin imports

- webhook-attached files

- API bulk uploads

Za svaki zabeleži:

```text

Endpoint:

Method:

Authenticated:

Required permission:

Accepted file types:

Max size:

Max count:

Temporary storage:

Permanent storage:

Processing:

Publicly served:

Retention:

```

---

# 2. NE GLEDAJ SAMO `multipart/form-data`

Upload može doći kao:

- multipart

- raw body

- base64 JSON

- presigned object storage upload

- chunked upload

- remote URL import

- drag-and-drop frontend

- mobile direct upload

- archive import

---

# 3. MAPIRAJ STVARNI FLOW

Za svaki upload nacrtaj:

```text

request

↓

body parser

↓

temporary file/buffer

↓

validation

↓

rename

↓

storage

↓

metadata DB record

↓

post-processing

↓

serving

```

---

# 4. IDENTIFIKUJ TRUST BOUNDARIES

Razdvoji:

```text

browser/client input

server parser

local filesystem

object storage

third-party processor

public CDN

```

Svaka granica može promeniti threat model.

---

# 5. FILE NAME

Originalni filename je attacker-controlled input.

Nikada ga ne tretiraj kao trusted path.

---

# 6. SERVER-GENERATED FILE NAME

Preferiraj server-generated:

- UUID

- random ID

- content-addressed key

gde odgovara arhitekturi.

Originalno ime može ostati kao metadata.

---

# 7. PATH TRAVERSAL

Testiraj relevantne varijante:

```text

../../file

..\..\file

```

i platform-specific encoding gde runtime to podržava.

---

# 8. ABSOLUTE PATH

Testiraj:

```text

/etc/passwd

C:\Windows\...

\\server\share

```

samo u kontrolisanom test environment-u.

---

# 9. PATH NORMALIZATION

Proveri redosled:

```text

decode

normalize

validate

join

```

---

# 10. DOUBLE DECODE

Klasičan bypass:

```text

%252e%252e%252f

↓

decode once

↓

validation

↓

decode again

↓

../

```

Relevantno samo ako stack zaista radi multiple decoding.

---

# 11. PREFIX CHECK

Naivan:

```text

resolved.startsWith(base)

```

može biti pogrešan bez canonical separator semantics.

---

# 12. WINDOWS PATH

Ako server može raditi na Windows-u:

proveri:

- `\`

- drive letter

- UNC

- device names

- alternate path separators

---

# 13. RESERVED NAMES

Windows:

```text

CON

PRN

AUX

NUL

COM1

LPT1

```

mogu napraviti edge case.

Severity samo prema realnom impact-u.

---

# 14. FILENAME LENGTH

Ekstremno dugo ime može:

- polomiti filesystem

- DB

- logs

- UI

Bounded length.

---

# 15. UNICODE FILENAME

Normalization/confusable issues mogu izazvati:

- duplicate names

- extension confusion

- moderation confusion

Prijavi samo uz realan security impact.

---

# 16. NULL BYTE

Historijski:

```text

file.php%00.jpg

```

Moderni runtime-i uglavnom blokiraju.

Ne prijavljuj bez konkretne library/runtime potvrde.

---

# 17. EXTENSION VALIDATION

Client-provided extension nije dokaz tipa.

---

# 18. CASE VARIATION

```text

.PHP

.JpG

.SvG

```

Ako validation radi case-sensitive poređenje.

---

# 19. MULTIPLE EXTENSIONS

Primer:

```text

shell.php.jpg

invoice.pdf.exe

```

---

# 20. TRAILING DOT / SPACE

Neki filesystem-i normalizuju:

```text

file.php.

file.php 

```

Proveri samo na relevantnom OS-u.

---

# 21. MIME TYPE

`Content-Type` u multipart delu je attacker-controlled.

Ne tretiraj kao autoritativan.

---

# 22. MAGIC BYTES

Mogu pomoći pri identifikaciji poznatih tipova.

Ali:

> Magic bytes nisu univerzalna zaštita od polyglot ili active content fajlova.

---

# 23. POLYGLOT FILE

Fajl može biti validan kao više formata.

Primeri:

- image + script-like content

- archive + executable structure

Prijavi samo gde serving/processing kontekst daje exploit.

---

# 24. FILE SIGNATURE LIBRARY

Ako postoji library za type detection:

proveri:

- verziju

- supported format

- fallback behavior

---

# 25. UNKNOWN TYPE

Pitaj:

> Šta se dešava ako file type detection vrati unknown?

Ne sme automatski postati allowed.

---

# 26. ALLOWLIST

Za high-risk upload često je bolje eksplicitno dozvoliti potrebne tipove nego pokušavati blacklist svih loših.

---

# 27. BLACKLIST

Ako implementacija blokira samo:

```text

.exe

.php

.js

```

napadač možda koristi drugi aktivni format.

---

# 28. FILE TYPE MORA PRATITI USE CASE

Avatar:

```text

JPEG/PNG/WebP

```

može imati užu allowlist-u nego general attachment system.

---

# 29. FILE SIZE

Proveri limit na više slojeva:

- reverse proxy

- app parser

- business validator

- object storage

---

# 30. CLIENT-SIDE LIMIT NIJE SECURITY CONTROL

Frontend `maxSize` nije dovoljan.

Backend/storage mora enforce-ovati.

---

# 31. REQUEST BODY LIMIT

Velik body može potrošiti resurse pre business validation-a.

---

# 32. PER-FILE LIMIT

---

# 33. PER-REQUEST TOTAL LIMIT

10 × 100 MB nije isto što i jedan 100 MB fajl.

---

# 34. FILE COUNT LIMIT

Upload 100.000 malih fajlova može biti DoS.

---

# 35. CONCURRENT UPLOAD LIMIT

Jedan user može otvoriti mnogo paralelnih upload-a.

---

# 36. ACCOUNT/TENANT STORAGE QUOTA

Request limit sam ne sprečava ukupno storage exhaustion.

---

# 37. GLOBAL STORAGE CAPACITY

Ako local disk:

proveri disk full failure.

---

# 38. TEMP STORAGE

Multipart parser može prvo čuvati fajl u:

- memory

- temp disk

pre nego što validation počne.

---

# 39. MEMORY BUFFERING

Scenario:

```text

500 MB upload

↓

entire body buffered in RAM

↓

several concurrent requests

↓

OOM

```

---

# 40. STREAMING

Streaming može smanjiti memory pressure.

Ali ne rešava:

- malicious content

- total storage

- partial uploads

---

# 41. TEMP FILE CLEANUP

Na:

- success

- validation fail

- exception

- client disconnect

temp fajl treba pravilno očistiti.

---

# 42. ORPHAN TEMP FILE

Repeated failed uploads mogu napuniti disk.

---

# 43. PARTIAL UPLOAD

Klijent prekine connection na pola.

Pitaj:

- šta ostaje

- da li temp file opstaje

- da li metadata tvrdi da je upload complete

---

# 44. CHUNKED UPLOAD

Ako postoji:

mapiraj:

```text

init

↓

chunks

↓

complete

```

---

# 45. CHUNK OWNERSHIP

Attacker ne sme append-ovati chunk tuđem upload session-u.

---

# 46. CHUNK ORDER

Out-of-order/repeated chunks mogu corrupt-ovati fajl.

---

# 47. CHUNK SIZE

Svaki chunk mora imati bounds.

---

# 48. TOTAL SIZE

Ne dozvoli bypass:

```text

per chunk < limit

```

ali:

```text

10,000 chunks

```

prelazi total.

---

# 49. UPLOAD SESSION ID

Ako possession daje write access:

mora biti dovoljno nepredvidiv ili auth-bound.

---

# 50. FINALIZE RACE

Dva concurrent finalize request-a ne treba da kreiraju duple metadata/side effects.

---

# 51. PRESIGNED UPLOAD

Ako client direktno šalje object storage-u:

audituj endpoint koji generiše presigned credential.

---

# 52. PRESIGNED SCOPE

Proveri:

- bucket

- object key

- method

- expiration

- content constraints gde relevantno

---

# 53. ARBITRARY OBJECT KEY

User ne sme zatražiti signed PUT za:

```text

another-user/file

system/config

```

---

# 54. OVERWRITE

Ako PUT na postojeći object dozvoljen:

proveri authorization.

---

# 55. CREATE-ONLY SEMANTICS

Ako user sme samo novi upload, presigned flow treba to poštovati koliko storage model dozvoljava.

---

# 56. PRESIGNED URL EXPIRY

Ne treba biti duži nego use case zahteva.

Ali ne izmišljaj univerzalan broj minuta.

---

# 57. CONTENT-TYPE NA PRESIGNED URL-U

Ako signature binding uključuje content type:

proveri da backend kasnije i dalje ne veruje samo toj vrednosti.

---

# 58. POST-UPLOAD VALIDATION

Direct upload u storage može zahtevati kasniju server-side validation/processing pre nego što fajl postane trusted/public.

---

# 59. QUARANTINE STATE

Mogući lifecycle:

```text

UPLOADED

↓

SCANNING/VALIDATING

↓

READY

```

Ne uvodi ako nije potrebno, ali proveri ako postoji.

---

# 60. FILE POSTANE JAVAN PRE VALIDACIJE

High-signal problem za active/malicious content.

---

# 61. STORAGE LOCATION

Utvrdite:

- local web root

- local non-web directory

- private bucket

- public bucket

- CDN

---

# 62. WEB ROOT

Ako uploadovani fajl ide direktno u directory iz kojeg server izvršava/servira aplikacioni kod:

visok rizik.

---

# 63. SERVER-SIDE EXECUTION

Najopasniji scenario:

```text

upload .php/.jsp/.aspx/etc

↓

web server interprets file as executable code

```

samo ako konkretni stack/server to može da izvrši.

---

# 64. STATIC SERVER

Node/static server može samo vratiti `.php` kao bytes.

Ne prijavljuj RCE ako server nema interpreter.

---

# 65. FILE SERVING ORIGIN

Pitaj:

> Sa kog origin-a browser dobija user-uploaded fajl?

---

# 66. SAME ORIGIN

Active content served sa:

```text

https://app.example.com

```

može imati daleko veći impact nego sa dedicated untrusted-files origin-a.

---

# 67. DEDICATED FILE ORIGIN

Može smanjiti XSS/origin risk.

P4/P2 zavisno od actual active content exposure-a.

---

# 68. HTML UPLOAD

Ako user može uploadovati HTML i otvarati ga inline pod app origin-om:

stored XSS/origin takeover kandidat.

---

# 69. SVG

SVG može sadržati active content i external references.

---

# 70. SVG `<script>`

Serving/embedding context određuje da li se izvršava.

---

# 71. SVG `<foreignObject>`

Može sadržati HTML.

---

# 72. SVG EXTERNAL RESOURCE

Može izazvati browser-side fetch/privacy issue ili server-side SSRF ako parser/resizer učitava reference.

---

# 73. SVG SANITIZATION

Ako SVG mora biti podržan:

proveri actual sanitizer, ne samo XML parser.

---

# 74. PDF

PDF može sadržati:

- links

- actions

- embedded files

- JavaScript u nekim viewerima

Severity zavisi od viewer-a i serving modela.

---

# 75. PDF PREVIEWER

Ako aplikacija koristi browser/native/custom PDF viewer:

proceni njegov sandbox/security model.

---

# 76. OFFICE DOCUMENTS

Mogu sadržati:

- macros

- external links

- embedded objects

Ako aplikacija samo čuva/downloaduje file, server execution nije automatski problem.

---

# 77. MALWARE DISTRIBUTION

Ako korisnici dele attachments jedni drugima:

malicious file distribution postaje relevantna.

---

# 78. MALWARE SCANNING

Ne zahtevaj antivirus za svaki sistem.

Proceni:

- user-to-user sharing

- enterprise context

- file types

- external users

---

# 79. SCAN RESULT

Ako antivirus postoji:

mapiraj:

```text

uploaded

↓

scan

↓

clean / infected / failed

```

---

# 80. SCANNER FAILURE

Ako scanner nije dostupan:

šta se dešava?

- fail closed

- queue

- fail open

Prema business risk-u.

---

# 81. PUBLICATION PRE SCAN-A

Infected file ne treba postati downloadable ako security model zahteva scan-before-release.

---

# 82. PARSER ATTACK SURFACE

Inventariši sve server-side procesore:

- ImageMagick

- FFmpeg

- ExifTool

- PDF libraries

- LibreOffice/headless office

- archive libraries

- OCR

- media metadata parsers

---

# 83. PARSER JE TRUST BOUNDARY

Validation file extension-a ne čini parser input trusted.

---

# 84. IMAGE DECODING

Attacker-controlled image parser može imati memory/CPU/dependency vulnerability surface.

---

# 85. IMAGE DIMENSIONS

Mala compressed slika može dekompresovati u ogroman bitmap.

Primer:

```text

50,000 × 50,000 pixels

```

---

# 86. PIXEL LIMIT

Može biti važniji od raw file size-a.

---

# 87. IMAGE DECOMPRESSION BOMB

Proveri library safeguards.

---

# 88. EXIF

Metadata može sadržati:

- huge fields

- attacker strings

- GPS/PII

---

# 89. EXIF OUTPUT

Ako metadata kasnije ide u HTML/log/query:

može postati second-order input.

---

# 90. EXIF STRIPPING

Privacy hardening za public images gde product to želi.

Nije univerzalni security requirement.

---

# 91. VIDEO

FFmpeg-like processing je high-value untrusted parser surface.

---

# 92. VIDEO DURATION

Small file size može imati veoma dugo/complex processing vreme.

---

# 93. TRANSCODING RESOURCE LIMITS

Proveri:

- CPU

- memory

- duration

- concurrency

- timeout

---

# 94. AUDIO

Isto.

---

# 95. DOCUMENT CONVERSION

Office/PDF conversion subprocess može imati:

- shell

- filesystem

- parser

- macro

- network

attack surface.

---

# 96. SANDBOX PROCESSING

Za visoko-rizične untrusted parsers proceni:

- isolated worker

- container

- permissions

- network access

Ne zahtevaj automatski full sandbox ako threat ne opravdava.

---

# 97. PARSER NETWORK ACCESS

Critical pitanje:

> Može li file parser tokom obrade da pristupa mreži?

---

# 98. FILE-BASED SSRF

Document/image/SVG može referencirati:

```text

http://internal-service

```

Ako server-side parser učitava external resources:

SSRF.

---

# 99. PDF/HTML RENDERING SSRF

Ako uploadovani HTML/document ide kroz headless browser:

proveri internal network access.

---

# 100. LOCAL FILE REFERENCE

Parser može podržavati:

```text

file://

```

ili relative local references.

---

# 101. XXE

Ako upload uključuje XML, SVG ili XML-based office format:

proveri parser external entity settings.

---

# 102. ZIP / ARCHIVE

Inventariši:

- ZIP

- TAR

- GZ

- 7z

- RAR

ako ih server raspakuje.

---

# 103. ZIP SLIP

Entry:

```text

../../target

```

ne sme izaći iz extraction directory-ja.

---

# 104. ABSOLUTE ARCHIVE PATH

Blokiraj prema library semantics.

---

# 105. SYMLINK U ARCHIVE-U

Archive može sadržati symlink koji kasniji entry koristi za write van sandbox-a.

---

# 106. HARDLINK

Ako format/library podržava.

---

# 107. EXTRACTION ORDER

Symlink/hardlink safety može zavisiti od redosleda entries.

---

# 108. DECOMPRESSION BOMB

Raw:

```text

10 MB

```

može postati:

```text

100 GB

```

---

# 109. COMPRESSION RATIO

Proveri:

- total expanded bytes

- entry count

- recursion depth

---

# 110. NESTED ARCHIVE

ZIP u ZIP-u može zaobići single-layer limits.

---

# 111. ARCHIVE ENTRY COUNT

Milion tiny files može biti resource DoS.

---

# 112. EXTRACTION TIMEOUT

Long extraction mora biti bounded.

---

# 113. EXTRACTION DISK QUOTA

Ne samo input file size.

---

# 114. DUPLICATE ENTRY NAMES

Dve archive entries sa istim path-om.

Koja pobeđuje?

Može uticati na validation.

---

# 115. VALIDATE-THEN-EXTRACT MISMATCH

Ako validator pregleda prvu entry, extractor koristi poslednju sa istim imenom:

potential bypass.

---

# 116. TOCTOU

Ako fajl validation i processing rade preko mutable shared path-a:

attacker ili drugi process možda može zameniti sadržaj između koraka.

Relevantno prema filesystem permissions.

---

# 117. CONTENT HASH

Hash može pomoći identifikaciji immutable upload-a kroz pipeline.

Nije obavezan.

---

# 118. POST-VALIDATION MUTATION

Ako object može biti overwritten nakon scan-a, scan status više ne garantuje trenutni sadržaj.

---

# 119. PRESIGNED OVERWRITE + SCAN

Scenario:

```text

upload clean file

↓

scan = CLEAN

↓

same signed key overwritten with malicious file

↓

status remains CLEAN

```

Proveri object immutability/version semantics.

---

# 120. STORAGE KEY COLLISION

Server-generated key mora izbegavati accidental overwrite.

---

# 121. USER-SUPPLIED ID KAO KEY

Ako path:

```text

uploads/{userInput}

```

proveri collision/ownership.

---

# 122. CASE-INSENSITIVE FILESYSTEM

`File.jpg` vs `file.jpg` može collision-ovati na nekim platformama.

---

# 123. OBJECT STORAGE CASE SENSITIVITY

Može se razlikovati od local filesystem-a.

---

# 124. OVERWRITE EXISTING FILE

Može omogućiti:

- avatar replacement

- tuđ document replacement

- system asset overwrite

prema path modelu.

---

# 125. STATIC ASSET OVERWRITE

Ako upload key može pogoditi:

```text

index.html

app.js

config.json

```

critical.

---

# 126. DATABASE METADATA

Upload record treba biti vezan za:

- owner

- tenant

- object key

- state

---

# 127. ORPHAN OBJECT

Storage upload uspe, DB metadata fail.

---

# 128. ORPHAN DB RECORD

DB metadata success, storage upload fail.

---

# 129. FALSE READY STATE

Metadata ne sme tvrditi:

```text

READY

```

ako final object ne postoji ili validation nije završena.

---

# 130. DELETE

Mapiraj:

```text

authorization

↓

DB delete/state

↓

storage delete

```

---

# 131. STORAGE DELETE FAILURE

DB record može nestati, ali private/public object ostati dostupan.

---

# 132. ORPHAN PUBLIC FILE

Posebno security/privacy relevantno.

---

# 133. SOFT DELETE

Signed/direct URL možda nastavlja da radi iako app resource označen deleted.

---

# 134. CDN CACHE

Deleted/private fajl može ostati cache-ovan.

---

# 135. PUBLIC -> PRIVATE

Ako visibility promeni public u private:

proveri CDN/object access transition.

---

# 136. SIGNED DOWNLOAD URL

Ako stari signed URL važi još dugo nakon permission revoke-a:

to može biti intended capability semantics ili problem.

Dokumentuj.

---

# 137. DOWNLOAD AUTHORIZATION

Ne fokusiraj se samo na upload.

Private file read je ista granica.

---

# 138. FILE IDOR

Promeni file ID/object key na tuđ.

---

# 139. THUMBNAIL IDOR

Preview/thumbnail route može zaobići originalnu authorization proveru.

---

# 140. DERIVATIVE FILES

Transcoded video, thumbnail, OCR text, extracted pages takođe imaju owner/tenant scope.

---

# 141. OCR OUTPUT

Extracted text može biti sensitive čak i ako original file access kontroliše.

---

# 142. PREVIEW HTML

Preview generator ne sme ubaciti extracted attacker content kao raw HTML bez escaping-a.

---

# 143. METADATA XSS

Filename/title/EXIF može se prikazivati u admin UI.

Stored XSS second-order path.

---

# 144. CONTENT-DISPOSITION

Za potentially active file:

```text

attachment

```

može biti bezbednije od inline.

Proceni actual UX.

---

# 145. CONTENT-TYPE NA DOWNLOAD-U

Server treba da vraća pravi/safe type.

---

# 146. `X-Content-Type-Options: nosniff`

Defense-in-depth za browser-served user content.

---

# 147. CSP NA FILE ORIGIN-U

Može dodatno ograničiti active content.

P4/P2 prema actual exposure-u.

---

# 148. CONTENT SECURITY SANDBOX

Dedicated untrusted file origin + restrictive CSP može biti relevantno za preview systems.

---

# 149. SAME-SITE COOKIE

Ako upload file origin deli auth cookies:

active file impact raste.

---

# 150. COOKIE DOMAIN

`.example.com` cookie može biti poslat i file subdomain-u.

Proveri.

---

# 151. `document.domain` / LEGACY

Relevantnost samo za actual browser model.

Ne izmišljaj.

---

# 152. CORS NA STORAGE-U

Private storage bucket ne treba broad CORS koji omogućava unauthorized browser reads bez druge auth granice.

---

# 153. PUBLIC BUCKET

Proveri object ACL/policy.

---

# 154. DIRECTORY/PREFIX LISTING

Attacker možda može enumerate-ovati object keys.

---

# 155. GUESSABLE OBJECT KEY

Ako bucket public, random key može biti jedina zaštita.

To je capability-by-obscurity model.

---

# 156. OBJECT KEY LEAK

Logs/referrer/UI mogu leakovati private capability URL.

---

# 157. STORAGE CREDENTIAL

Backend storage key ne sme biti poslat client-u.

---

# 158. TEMP CLOUD CREDENTIAL

Ako direct upload koristi temporary scoped credential:

proveri scope/lifetime.

---

# 159. MULTIPART CLOUD UPLOAD

Ako S3-like multipart:

proveri ownership nad:

- upload ID

- part numbers

- complete/abort

---

# 160. ABORT

Abandoned multipart uploads mogu akumulirati storage cost.

---

# 161. FILE HASH DEDUP

Ako server deduplikuje fajlove globalno po hash-u:

cross-user privacy side channel može postojati.

---

# 162. "FILE ALREADY EXISTS"

Može otkriti da drugi user poseduje isti sensitive fajl.

Severity prema product-u.

---

# 163. CROSS-TENANT DEDUP

Ne dozvoli shared object metadata da pogrešno prenese authorization između tenant-a.

---

# 164. SERVER-SIDE DEDUP REFERENCE

Jedan physical object može imati više logical owners, ali authorization mora ostati per-reference.

---

# 165. DOWNLOAD COUNT

Public/share download limits mogu race-ovati.

---

# 166. ONE-TIME DOWNLOAD

Ako link treba da bude single-use:

atomic consumption.

---

# 167. SHARE LINK

Share capability treba biti scoped na konkretan fajl i operation.

---

# 168. PUBLIC TOKEN

Token u URL-u može procureti u:

- logs

- analytics

- referrer

- history

---

# 169. UPLOAD CALLBACK

Object storage može poslati webhook nakon upload-a.

Mapiranje mora biti tenant/resource-safe.

---

# 170. MALICIOUS STORAGE EVENT

Ne veruj file metadata iz event-a bez provider authenticity.

---

# 171. REMOTE URL IMPORT

Ako app podržava:

```text

Import file from URL

```

to je file upload + SSRF attack surface.

---

# 172. URL IMPORT

Proveri:

- scheme

- host

- redirects

- DNS

- size

- content type

- download timeout

---

# 173. UNKNOWN CONTENT LENGTH

Remote server možda ne šalje `Content-Length`.

Backend mora i dalje enforce-ovati max bytes tokom stream-a.

---

# 174. FAKE CONTENT LENGTH

Ne veruj header-u kao jedinoj size zaštiti.

---

# 175. SLOW REMOTE SERVER

Import može dugo držati worker/connection.

---

# 176. REDIRECT TO LARGE FILE

Validation initial URL-a nije dovoljna.

---

# 177. REDIRECT TO INTERNAL

SSRF.

---

# 178. REMOTE ZIP

Kombinuje:

- SSRF

- large download

- decompression bomb

---

# 179. ADMIN IMPORT

Admin status ne čini file trusted.

---

# 180. BACKUP RESTORE

Jedan od najopasnijih upload surface-a.

---

# 181. RESTORE ARCHIVE

Može sadržati:

- config

- paths

- users

- permissions

- database state

---

# 182. BACKUP PATH TRAVERSAL

Restore ne sme pisati van intended data area.

---

# 183. BACKUP VERSION

Old/incompatible schema ne sme corrupt-ovati state.

Reliability + security.

---

# 184. BACKUP AUTHORIZATION

Ko sme restore?

High privilege.

---

# 185. BACKUP REPLACE MODE

Ako restore briše current data:

critical destructive action.

---

# 186. IMPORTED OWNER/TENANT IDs

Backup/import ne sme dozvoliti običnom user-u da ubaci records u drugi tenant.

---

# 187. CSV IMPORT

CSV može imati:

- huge rows

- formula values

- malformed quoting

- authorization fields

---

# 188. CSV FORMULA INJECTION

Ako imported data kasnije bude exported/opened u spreadsheet-u:

vrednosti koje počinju sa:

```text

=

+

-

@

```

mogu imati spreadsheet formula semantics.

Proceni realan workflow.

---

# 189. CSV PARSER LIMITS

- rows

- columns

- field length

---

# 190. JSON IMPORT

Deep nesting/huge arrays.

---

# 191. XML IMPORT

XXE/entity expansion.

---

# 192. YAML IMPORT

Unsafe deserialization.

---

# 193. FILE PROCESSING QUEUE

Ako upload ide u async worker:

audituj:

- payload

- idempotency

- retries

- stale file state

---

# 194. RETRY PROCESSING

Parser/transcode job retry ne sme duplicate-ovati metadata/side effects.

---

# 195. FILE REPLACED PRE RETRY-JA

Worker retry možda obrađuje drugi sadržaj pod istim object key-em.

---

# 196. IMMUTABLE VERSION ID

Može pomoći da worker obradi tačno verziju koja je validirana.

---

# 197. CANCEL UPLOAD

Ako user obriše file tokom processing-a:

worker ne treba kasnije da ga ponovo objavi.

---

# 198. PROCESSING RACE

```text

delete

||

scan completes

```

Koji state pobeđuje?

---

# 199. SCAN RESULT ZA STARU VERZIJU

Ako file može biti overwritten:

scan rezultat mora biti vezan za content version/hash.

---

# 200. HASH

Hash može koristiti za:

- integrity

- immutable identity

- scan binding

Ali nije authorization.

---

# 201. AV SIGNATURE

Antivirus result može biti:

- clean

- infected

- error

- timeout

- unknown

`error` ne znači `clean`.

---

# 202. SANITIZATION

Document sanitization/CDR može biti opcija za high-risk enterprise systems.

Ne zahtevaj generički.

---

# 203. LOGGING

Ne loguj:

- raw file contents

- presigned credentials

- private URLs

bez potrebe.

---

# 204. FILENAME U LOGU

Attacker-controlled filename može izazvati log injection ili huge logs.

---

# 205. METADATA LOGGING

Sensitive EXIF/document metadata može procuriti.

---

# 206. ERROR RESPONSE

Parser exception ne treba da otkrije:

- local path

- command

- temp directory

- library internals

ako to povećava attack surface.

---

# 207. OBSERVABILITY

Prati gde relevantno:

- uploads

- rejected uploads

- max-size rejects

- scan failures

- parser failures

- processing latency

- orphan count

- storage usage

---

# 208. ABUSE DETECTION

Nagli rast:

- upload count

- bytes

- decompression failures

može signalizirati abuse.

---

# 209. RATE LIMIT

Upload endpoints često treba cost-aware limiter.

Detaljni rate limiting audit postoji zasebno.

---

# 210. BYTE RATE

Request count nije dovoljan.

---

# 211. USER QUOTA

Upload count/time može biti drugačiji od total storage quota-e.

---

# 212. TENANT QUOTA

Jedan tenant ne treba pojesti shared disk/object budget bez product namere.

---

# 213. UNAUTHENTICATED UPLOAD

Ako public upload postoji:

posebno analiziraj abuse i storage cost.

---

# 214. PUBLIC TEMP UPLOAD

Unclaimed temporary uploads moraju imati cleanup/retention.

---

# 215. CAPTCHA

Ne uvodi automatski.

Samo ako spam/bot threat opravdava UX cost.

---

# 216. DOWNLOAD SECURITY

Audituj i download flow, ne samo upload.

---

# 217. CONTENT RANGE

Large file download može koristiti Range.

Proveri da authorization važi i na partial requests.

---

# 218. HEAD REQUEST

Može otkriti existence/metadata private file-a.

---

# 219. CACHE

Private download ne sme postati shared public cache.

---

# 220. CDN SIGNED URL

Proveri expiry/path scope.

---

# 221. REVOKE

Ako user izgubi permission, postojeći long-lived CDN URL može ostati capability.

Dokumentuj.

---

# 222. RETENTION

Expired/deleted private files treba zaista ukloniti prema product/privacy politici.

Ne pravi pravni zaključak bez zahteva.

---

# 223. BACKUP OF UPLOADS

Deleted file može ostati u backup-u.

To nije nužno bug.

Dokumentuj lifecycle.

---

# 224. TESTING

Mapiraj postojeće upload security testove.

---

# 225. VALID FILE TEST

Svaki dozvoljeni tip.

---

# 226. WRONG EXTENSION TEST

Content i extension mismatch.

---

# 227. WRONG MIME TEST

---

# 228. UNKNOWN TYPE TEST

---

# 229. OVERSIZE TEST

---

# 230. TOO MANY FILES TEST

---

# 231. CONCURRENT UPLOAD TEST

---

# 232. PATH TRAVERSAL FILENAME TEST

---

# 233. DUPLICATE NAME TEST

---

# 234. OVERWRITE TEST

---

# 235. ACTIVE CONTENT TEST

Za HTML/SVG/PDF prema allowed file types.

---

# 236. STORED XSS TEST

Upload/metadata pa render u:

- normal UI

- admin UI

- preview

---

# 237. ZIP SLIP TEST

Kontrolisan archive sa traversal entry.

---

# 238. ZIP BOMB TEST

Koristi bezbednu synthetic granicu, ne pravi stvarni destructive disk exhaustion.

---

# 239. ARCHIVE SYMLINK TEST

Ako parser/library podržava.

---

# 240. IMAGE DIMENSION BOMB TEST

Small file + huge dimensions u sigurnom environment-u.

---

# 241. PARSER TIMEOUT TEST

Malicious/complex file koji dugo obrađuje.

---

# 242. SSRF FILE TEST

Ako parser može external resources.

Koristi controlled local/test endpoint.

---

# 243. TEMP CLEANUP TEST

Abort upload pa proveri temp files.

---

# 244. DB FAILURE TEST

Storage upload success, DB metadata failure.

---

# 245. STORAGE FAILURE TEST

DB step success, storage failure.

---

# 246. DELETE FAILURE TEST

DB delete + storage delete mismatch.

---

# 247. PERMISSION TEST

User A file vs User B file.

---

# 248. CROSS-TENANT TEST

Tenant A credential + Tenant B file/object.

---

# 249. PRESIGNED URL TEST

Pokušaj generisanje signed URL-a za tuđ object.

---

# 250. PRESIGNED OVERWRITE TEST

Pokušaj overwrite postojećeg object-a ako flow treba da bude create-only.

---

# 251. SCAN BYPASS TEST

Ako scan status postoji:

pokušaj pristup file-u pre `CLEAN/READY`.

---

# 252. SCAN VERSION RACE TEST

Scan clean v1, overwrite na v2, pokušaj serving-a.

---

# 253. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text

ID:

Severity:

Category:

Confidence:

Status:

Evidence tier:

Upload feature:

Endpoint:

Authentication:

Required role:

File type:

Original filename:

Detected type:

Size:

Processing pipeline:

Storage:

Serving origin:

Public/private:

File/Class:

Function:

Relevant config:

Vulnerability:

Attacker prerequisites:

Upload timeline:

T0:

T1:

T2:

T3:

Expected security behavior:

Actual/Possible behavior:

Arbitrary file read:

YES / NO

Arbitrary file write:

YES / NO

Server code execution:

YES / NO / NOT VERIFIED

Browser active content:

YES / NO

SSRF:

YES / NO

Cross-user:

YES / NO

Cross-tenant:

YES / NO

Resource exhaustion:

YES / NO

Malware distribution:

YES / NO

Impact:

Blast radius:

Root cause:

Recommended remediation:

Regression/security test:

Production verification:

Complexity:

XS / S / M / L / XL

```

---

# 254. SEVERITY

Koristi:

## P0 - CRITICAL

- upload vodi do unauthenticated/low-privilege remote code execution

- arbitrary overwrite critical server/app files sa takeover impact-om

- cross-tenant unrestricted file exposure na velikom nivou

- malicious restore/upload omogućava catastrophic system compromise

## P1 - HIGH

- arbitrary private file read/write

- active uploaded content izvršava se pod trusted app origin-om sa meaningful account impact-om

- parser SSRF do sensitive internal service-a

- upload bypass daje široko sensitive cross-user data exposure

- archive traversal piše van intended storage-a

## P2 - MEDIUM

- significant stored XSS through uploaded content/metadata

- resource exhaustion uz realan low-cost exploit

- upload/delete race sa meaningful private-data exposure

- limited cross-user file access

- malware distribution gap u sistemu koji aktivno distribuira uploads drugim korisnicima

## P3 - LOW

- limited metadata leak

- small cleanup issue

- minor serving/header weakness

- constrained edge case

## P4 - HARDENING

- dodatna scanning/isolation/observability preporuka bez confirmed exploit path-a

---

# 255. CONFIDENCE

Koristi:

```text

HIGH

MEDIUM

LOW

```

---

# 256. STATUS

Koristi:

```text

CONFIRMED

LIKELY

THEORETICAL

NOT VERIFIED

```

---

# 257. EVIDENCE TIER

Koristi:

```text

A - safely reproduced

B - complete executable upload-to-impact path

C - strong static/config evidence

D - partial/inferred

E - theoretical

```

---

# 258. CATEGORY

Koristi:

```text

TYPE VALIDATION

PATH TRAVERSAL

ARBITRARY FILE WRITE

ARBITRARY FILE READ

ACTIVE CONTENT

XSS

PARSER

SSRF

XXE

ARCHIVE / ZIP SLIP

DECOMPRESSION BOMB

RESOURCE EXHAUSTION

MALWARE

STORAGE AUTHORIZATION

PRESIGNED URL

CROSS-TENANT

RACE CONDITION

TEMP STORAGE

SERVING / DOWNLOAD

```

---

# 259. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. upload endpoint je reachable

2. attacker ima potrebnu auth/role

3. validation path

4. actual storage location

5. actual serving origin

6. processing library

7. file execution semantics

8. object/file authorization

9. infrastructure behavior

10. reproducible impact

Ne zaključuj iz same extension allowlist-e.

---

# 260. NE PRIJAVLJUJ `.php` UPLOAD KAO RCE AKO SERVER NE IZVRŠAVA PHP

Mora postojati execution path.

---

# 261. NE PRIJAVLJUJ SVG KAO XSS AUTOMATSKI

Zavisi od:

- inline/embed/object/img/download context

- origin

- CSP

- sanitization

---

# 262. NE PRIJAVLJUJ PDF KAO MALWARE SAMO ZATO ŠTO JE PDF

Mora postojati realan malicious-content model.

---

# 263. NE ZAHTEVAJ ANTIVIRUS AUTOMATSKI

Ako app čuva privatnu ličnu fotografiju koju niko drugi ne downloaduje:

AV možda nije prioritet.

---

# 264. NE VERUJ MIME-U

Client ga kontroliše.

---

# 265. NE VERUJ EXTENSION-U

Ista stvar.

---

# 266. NE VERUJ MAGIC BYTES KAO POTPUNOJ GARANCIJI

Polyglot/active formats postoje.

---

# 267. NE KORISTI UUID KAO JEDINU FILE AUTHORIZATION ZAŠTITU

Knowledge of unguessable URL nije isto što i full authorization model, osim ako je token namerno capability.

---

# 268. NE STAVLJAJ FILE VALIDATION SAMO NA FRONTEND

Backend/storage path mora enforce-ovati.

---

# 269. NE UVODI OBJECT STORAGE SAMO RADI SECURITY CHECKLIST-E

Lokalni storage može biti bezbedan ako je pravilno izolovan i skalabilnost odgovara sistemu.

---

# 270. NE MENJAJ KOD

Tokom audita:

- ne briši fajlove

- ne uploaduj stvarni malware

- ne pokušavaj server takeover

- ne puni disk

- ne zovi neovlašćene internal services

- ne menjaj bucket ACL

Koristi bezbedne synthetic testove.

---

# 271. OUTPUT - FILE_UPLOAD_SECURITY_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- upload surfaces

- storage model

- serving model

- parser inventory

- najveći security rizici

## 2. Upload Surface Inventory

## 3. Upload Lifecycle Map

## 4. Filename / Path Security Audit

## 5. Extension / MIME / Type Validation Audit

## 6. File Size / Count / Quota Audit

## 7. Multipart / Temp Storage Audit

## 8. Chunked Upload Audit

Ako relevantno.

## 9. Presigned Upload Audit

Ako relevantno.

## 10. Storage Security Audit

## 11. Public / Private Object Audit

## 12. Active Content / Same-Origin Audit

## 13. SVG / HTML / PDF Audit

## 14. Image Processing Audit

## 15. Video / Audio Processing Audit

## 16. Document Conversion Audit

## 17. Parser / Sandbox Audit

## 18. SSRF Through File Processing Audit

## 19. XML / XXE Audit

## 20. Archive / Zip Slip Audit

## 21. Decompression / Resource Exhaustion Audit

## 22. Malware Distribution Audit

## 23. Metadata / Stored XSS Audit

## 24. DB / Storage Consistency Audit

## 25. Delete / Retention Audit

## 26. Download / Preview Authorization Audit

## 27. CDN / Cache Audit

## 28. Remote URL Import Audit

## 29. CSV / Backup / Import Audit

## 30. Async Processing / Race Audit

## 31. Logging / Observability Audit

## 32. Security Test Coverage

## 33. Findings Summary

| ID | Severity | Upload surface | Category | Impact | Confidence | Status |

|---|---|---|---|---|---|---|

## 34. P0 Findings

## 35. P1 Findings

## 36. P2 Findings

## 37. P3 Findings

## 38. P4 Hardening

## 39. Things Done Well

## 40. Not Applicable

## 41. Not Verified

## 42. Remediation Roadmap

---

# 272. UPLOAD SURFACE MATRIX

| Feature | Types | Max size | Storage | Processing | Public |

|---|---|---:|---|---|---|

---

# 273. VALIDATION MATRIX

| Type | Extension | MIME | Magic | Parser validation | Result |

|---|---|---|---|---|---|

---

# 274. STORAGE MATRIX

| Upload | Storage | Object key source | Public | Encryption | Tenant scoped |

|---|---|---|---|---|---|

---

# 275. PROCESSOR MATRIX

| File type | Processor | Network access | Timeout | Memory bound | Isolation |

|---|---|---|---|---|---|

---

# 276. ARCHIVE MATRIX

| Format | Extraction | Traversal protection | Expanded-size limit | Symlink handling |

|---|---|---|---|---|

---

# 277. SECOND PASS - VALIDATION BYPASS HUNT

Za svaki allowed file type pokušaj mismatch:

```text

extension A

MIME B

magic C

actual content D

```

Pitaj koji signal backend stvarno koristi.

---

# 278. SECOND PASS - ACTIVE CONTENT

Za svaki upload koji browser može prikazati testiraj:

- HTML

- SVG

- XML

- PDF

prema allowed types.

Utvrdi:

- origin

- Content-Type

- Content-Disposition

- CSP

---

# 279. SECOND PASS - PATH ATTACK

Pokušaj filename/object key sa:

- traversal

- absolute path

- duplicate separator

- encoded traversal

samo u test environment-u.

---

# 280. SECOND PASS - OVERWRITE

Pokušaj pogoditi:

- sopstveni existing file

- tuđ file

- static asset

- predictable object key

prema flow-u.

---

# 281. SECOND PASS - TEMP STORAGE

Prekini upload:

```text

25%

50%

99%

```

i proveri cleanup.

---

# 282. SECOND PASS - CONCURRENT UPLOAD

Maksimalan dozvoljen broj paralelnih upload-a.

Prati:

- memory

- disk

- sockets

- temp files

---

# 283. SECOND PASS - LARGE DIMENSIONS

Upload validnu image datoteku male compressed veličine sa ekstremnim dimensions.

Prati decoder memory.

---

# 284. SECOND PASS - ARCHIVE ATTACK

Kontrolisani ZIP/TAR sa:

- traversal entry

- symlink

- many entries

- high compression ratio

---

# 285. SECOND PASS - PARSER NETWORK

Ako processor može external reference:

koristi test URL i proveri da li ga server fetchuje.

---

# 286. SECOND PASS - REMOTE IMPORT

Ako URL import postoji:

testiraj:

```text

public URL

redirect

oversized response

slow response

internal-test target

```

bez pristupa neovlašćenim sistemima.

---

# 287. SECOND PASS - CROSS-USER FILE

User A uploaduje file.

User B pokušava:

- metadata

- preview

- download

- thumbnail

- delete

- signed URL

---

# 288. SECOND PASS - CROSS-TENANT FILE

Isto za tenant A/B.

---

# 289. SECOND PASS - PRESIGNED FLOW

Pokušaj:

```text

request signed URL for unauthorized object key

```

i:

```text

reuse URL after expected expiry

```

---

# 290. SECOND PASS - CLEAN FILE OVERWRITE

Ako scan workflow postoji:

```text

upload clean v1

↓

scan clean

↓

overwrite same key with v2

↓

request file

```

---

# 291. SECOND PASS - DELETE RACE

```text

processing completes

||

user deletes file

```

Pitaj da li deleted file može ponovo postati READY/public.

---

# 292. SECOND PASS - STORAGE FAILURE

Simuliraj storage write failure.

Pitaj da li DB tvrdi da file postoji.

---

# 293. SECOND PASS - DB FAILURE

Storage succeeds, DB metadata fails.

Pitaj:

- orphan

- cleanup

- public exposure

---

# 294. SECOND PASS - DOWNLOAD HEADERS

Za active file proveri:

- Content-Type

- Content-Disposition

- nosniff

- cache control

---

# 295. SECOND PASS - METADATA XSS

Koristi attacker-controlled:

- filename

- title

- EXIF metadata

i prati gde se prikazuje.

---

# 296. SECOND PASS - FILE VERSION RACE

Ako object key može biti reused:

proveri da validation/scan rezultat pripada baš serving verziji.

---

# 297. SECOND PASS - BACKUP RESTORE

Ako postoji:

testiraj synthetic archive sa:

- unexpected paths

- foreign tenant IDs

- incompatible schema

- duplicate entities

bez destruktivne produkcione primene.

---

# 298. SECOND PASS - QUOTA

Pitaj:

> Može li attacker sa malo request-a da napravi mnogo storage/processing troška?

---

# 299. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svi upload surfaces su inventarisani

- multipart nije tretiran kao jedini upload način

- original filename je tretiran kao attacker-controlled

- path normalization odgovara realnom OS/runtime-u

- extension, MIME i magic bytes nisu pojedinačno tretirani kao potpuna garancija

- backend, a ne samo frontend, enforce-uje limits

- temp file lifecycle je analiziran

- chunked/presigned flows imaju ownership i total-size analizu

- direct object storage upload ne postaje trusted pre server-side validation-a ako je validation potrebna

- storage location i serving origin su mapirani

- RCE finding postoji samo ako server stvarno može izvršiti file

- SVG/HTML/PDF findings zavise od serving/rendering context-a

- file parseri su tretirani kao untrusted-input boundary

- image dimension/decompression abuse je analiziran

- archive extraction obuhvata traversal, symlink i expanded-size limits

- file-based SSRF je analiziran gde parser fetchuje external resources

- malware scanning je preporučena samo gde product threat opravdava

- delete/public-to-private lifecycle obuhvata CDN/object access

- preview/thumbnail/derivative resources imaju authorization

- scan result je vezan za istu content verziju koja se servira

- remote URL import uključuje size, timeout, redirect i SSRF analizu

- storage/DB partial failures su analizirani

- metadata je praćena kao second-order attacker input

- svaki P0/P1 ima kompletan upload-to-impact path

- P4 hardening je odvojen od potvrđenih exploit-a

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Proveravajte MIME type, ograničite veličinu i skenirajte fajlove antivirusom.

To nije bezbednosni audit otpremanja fajlova.

Tražim probleme poput:

```text

POST /avatar

↓

backend allows .svg

↓

file stored unchanged

↓

served from app.example.com/uploads/...

↓

browser opens SVG inline

↓

uploaded active content executes under trusted application origin

↓

stored XSS/account impact

```

ili:

```text

multipart filename:

../../public/index.html

↓

backend:

join(uploadDir, originalFilename)

↓

no canonical containment check

↓

upload writes outside upload directory

↓

application file overwritten

```

ili:

```text

ZIP import

↓

validator checks archive file itself

↓

extractor trusts entry names

↓

archive contains:

../../config/app.json

↓

entry written outside extraction directory

↓

arbitrary file overwrite

```

ili:

```text

image upload limit:

5 MB

↓

attacker uploads 1 MB compressed image

↓

decoded dimensions:

50,000 x 50,000

↓

image processor allocates gigabytes of memory

↓

worker crashes

```

ili:

```text

direct object-storage upload

↓

file marked CLEAN after scan

↓

same object key can still be overwritten

↓

attacker replaces clean object with malicious version

↓

database scan status remains CLEAN

↓

malicious content is served

```

ili:

```text

GET /files/:id

↓

route checks authentication

↓

metadata loaded only by file ID

↓

no owner/tenant scope

↓

User B changes ID to User A's file

↓

private document disclosure

```

ili:

```text

remote file import

↓

backend validates original host as public

↓

HTTP client follows redirect

↓

redirect points to internal service

↓

backend downloads internal response as "file"

↓

SSRF

```

ili:

```text

upload succeeds to object storage

↓

database insert fails

↓

object remains in public bucket

↓

no metadata record exists

↓

normal app cleanup can no longer find it

↓

orphan sensitive public file persists

```

To su file upload problemi koje treba da pronađeš.

Razmišljaj kroz:

- filename

- type

- bytes

- size

- parser

- path

- storage

- origin

- authorization

- post-processing

- races

- cleanup

- serving

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Ko može da uploaduje fajl?

> Koji deo fajla ili metadata attacker kontroliše?

> Koju validaciju fajl prolazi?

> Gde se fizički ili logički čuva?

> Koji parser ga obrađuje?

> Da li parser ima network/filesystem access?

> Kako se fajl kasnije servira?

> Da li se izvršava kao active content?

> Može li korisnik doći do tuđeg file-a?

> Šta se dešava ako obrada ili storage padnu između koraka?

Ako server execution behavior nije potvrđen:

**SERVER EXECUTION NOT VERIFIED.**

Ako parser/network semantics nisu potvrđene:

**PARSER BEHAVIOR NOT VERIFIED.**

Ako je samo dodatno file-hardening poboljšanje bez potvrđenog exploit path-a:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih upload, storage, parser ili serving exploit path-ova nego napisati 100 generičkih file-security pravila.

Cilj je dobiti forenzički precizan File Upload Security Audit koji se može direktno pretvoriti u:

- upload regression test

- path containment fix

- content validation correction

- safe storage architecture

- active-content isolation

- parser sandboxing

- archive protection

- file authorization fix

- production upload hardening
