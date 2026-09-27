---
id: UPL-IT-032
number: 32
slug: authentication-security-audit
title: Bezbednosni audit autentifikacije
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Sajber bezbednost
subcategory_id: cybersecurity
language: sr
version: 1.0.0
status: stable
---

# BEZBEDNOSNI AUDIT AUTENTIFIKACIJE

Želim da izvršiš maksimalno duboku, sistematsku, evidence-first i production-oriented analizu kompletnog authentication sistema aplikacije.

Glavni cilj:

> Utvrditi da li napadač može da se predstavi kao drugi korisnik, preuzme nalog, produži ili ukrade session, zloupotrebi reset/recovery tok, zaobiđe MFA, falsifikuje token, iskoristi legacy login put, manipuliše OAuth/OIDC povezivanjem naloga ili nastavi da koristi credential koji bi trebalo da je opozvan.

Ovo nije:

- generički savet da se uključi MFA
- automatska zabrana JWT-a
- automatska zabrana session cookie-ja
- checklist secure headers-a
- password-policy debata bez realnog attack path-a
- savet da se auth prebaci na drugog providera bez potrebe
- pretpostavka da je svaki dugačak token nesiguran
- pretpostavka da je localStorage automatski vulnerability
- samo pregled login endpoint-a

Fokus je na kompletnom identity lifecycle-u:

```text
account creation
↓
credential enrollment
↓
login
↓
session/token issuance
↓
refresh
↓
privilege/session changes
↓
logout/revocation
↓
recovery
↓
account deletion
```

Prioritet:

**account takeover > authentication bypass > token/session forgery > recovery abuse > MFA bypass > session theft persistence > identity confusion > hardening**

Bolje je pronaći 5 stvarnih account-takeover ili authentication-bypass problema nego napisati 100 generičkih auth preporuka.

---

# 1. UTVRDI AUTH ARHITEKTURU

Pre finding-a utvrdi sve auth mehanizme:

- username/password
- email/password
- phone/password
- magic link
- OTP
- OAuth
- OpenID Connect
- SAML
- passkeys/WebAuthn
- API keys
- session cookies
- access tokens
- refresh tokens
- JWT
- provider-managed auth
- custom auth

---

# 2. NAPRAVI AUTH FLOW MAPU

Mapiraj svaki način prijave:

```text
credential
↓
verification
↓
identity lookup
↓
risk/MFA checks
↓
session creation
↓
credential delivery
```

---

# 3. INVENTARIŠI AUTH ENDPOINT-E

Pronađi:

```text
/login
/logout
/register
/refresh
/reset
/forgot-password
/verify-email
/magic-link
/otp
/mfa
/oauth/*
```

plus:

- legacy
- mobile
- admin
- internal
- v1/v2

varijante.

---

# 4. LEGACY AUTH PATH

Stari login endpoint može imati slabiju zaštitu od novog.

Posebno traži auth flow koji:

- ne zahteva MFA
- koristi drugi token issuer
- preskače lock/risk checks
- koristi slabije password validation pravilo

---

# 5. AUTHENTICATION VS AUTHORIZATION

Ne prijavljuj privilege problem kao auth bug ako je identity ispravno potvrđen, ali kasnije permission pogrešno proverena.

Ovaj audit fokusira identity proof.

---

# 6. ACCOUNT IDENTIFIER

Utvrdite šta može identifikovati account:

- email
- username
- phone
- provider subject
- internal ID

---

# 7. NORMALIZATION

Proveri:

- case
- whitespace
- Unicode
- canonical phone
- domain normalization

pre account lookup-a.

---

# 8. IDENTITY COLLISION

Ako registracija i login normalizuju identifier različito:

mogu nastati dva naloga koja se kasnije tretiraju kao isti identitet.

---

# 9. EMAIL CASE

Ne pretpostavljaj globalno pravilo za lokalni deo email-a.

Proveri product/provider model.

---

# 10. UNICODE CONFUSION

Ako username/email-like identifier dozvoljava Unicode:

proveri collision/confusable problem samo ako se identifier koristi za security-sensitive identity selection.

---

# 11. ACCOUNT ENUMERATION

Uporedi login/recovery responses za:

```text
existing account
non-existing account
```

---

# 12. ENUMERATION SIGNALS

Ne samo message:

- status
- timing
- headers
- CAPTCHA
- rate-limit bucket
- email send behavior

mogu otkriti existence.

---

# 13. ENUMERATION SEVERITY

Ne označavaj svako existence otkrivanje kao P1.

Proceni:

- sensitivity aplikacije
- public nature naloga
- abuse potential

---

# 14. REGISTRATION ENUMERATION

`email already exists` može biti nameran UX tradeoff.

Dokumentuj, ne automatski vulnerability.

---

# 15. PASSWORD STORAGE

Ako aplikacija čuva password:

utvrdi:

- hashing algorithm
- cost parameters
- salt
- migration strategy

---

# 16. PLAINTEXT PASSWORD

P0/P1 zavisno od exposure context-a.

---

# 17. REVERSIBLE PASSWORD STORAGE

Ozbiljan problem.

---

# 18. MODERN PASSWORD HASH

Preferiraj etablirani password hashing mehanizam prema stack-u.

Ne izmišljaj jedan univerzalni algorithm/cost bez runtime context-a.

---

# 19. PASSWORD HASH COST

Proveri da nije ekstremno slab.

Ali ne diži cost toliko da auth endpoint postane trivijalan DoS vector.

---

# 20. HASH MIGRATION

Ako postoje legacy hashes:

proveri gradual rehash model pri successful login-u.

---

# 21. PASSWORD LOGGING

Pretraži:

- HTTP logs
- debug logs
- error logs
- analytics
- traces

---

# 22. PASSWORD IN URL

Nikada ne sme biti query/path parametar u normalnom login flow-u.

---

# 23. PASSWORD POLICY

Ne fokusiraj audit na proizvoljne complexity zahteve.

Bitnije:

- weak credential reuse defense
- brute-force protection
- compromised password policy ako product zahteva
- minimum reasonable length

---

# 24. PASSWORD TRUNCATION

Neki libraries/systems trunciraju input.

Proveri actual algorithm.

---

# 25. PASSWORD MAX LENGTH

Ogroman input može biti DoS risk za skupi hash.

Bound treba biti razuman, ali ne tiho skraćivati korisnički password.

---

# 26. PASSWORD COMPARISON

Koristi library verify funkciju.

Ne implementiraj sopstveno poređenje hash-a.

---

# 27. LOGIN RATE PROTECTION

Analiziraj:

- per-IP
- per-account
- global
- risk-based

Detaljniji limiter audit postoji zasebno.

Ovde fokus na takeover resistance.

---

# 28. ACCOUNT LOCKOUT

Hard lockout može omogućiti denial-of-service žrtvi.

---

# 29. CREDENTIAL STUFFING

Scenario:

```text
one attempt
×
many accounts
```

Per-account limiter sam nije dovoljan.

---

# 30. DISTRIBUTED BRUTE FORCE

Mnogo IP adresa protiv jednog naloga.

---

# 31. PASSWORD SPRAY

Malo popularnih passwords kroz veliki broj naloga.

---

# 32. LOGIN ERROR

Ne otkrivaj da li je password ili account pogrešan ako security model to želi da sakrije.

---

# 33. SESSION CREATION

Nakon uspešne autentikacije mapiraj:

```text
identity
↓
session/token ID
↓
claims
↓
expiry
↓
storage
```

---

# 34. SESSION ID ENTROPY

Session identifier mora biti nepredvidiv.

Preferiraj framework-generated cryptographic session IDs.

---

# 35. SESSION FIXATION

Proveri da li se pre-auth session ID zadržava nakon login-a.

---

# 36. PRIVILEGE ELEVATION

Ako user prelazi u elevated/admin mode:

razmotri session rotation/re-auth prema threat modelu.

---

# 37. COOKIE SESSION

Ako koristi cookie:

proveri:

```text
Secure
HttpOnly
SameSite
Domain
Path
```

---

# 38. COOKIE DOMAIN

Preširok domain može dozvoliti sibling subdomain-u da utiče na auth cookie prema browser semantics.

---

# 39. SUBDOMAIN TAKEOVER INTERACTION

Ako auth cookie važi za `.example.com`, kompromitovan subdomain može povećati rizik.

Prijavi samo uz stvaran domain model.

---

# 40. COOKIE NAME COLLISION

Više app-ova na istom domain-u može koristiti isti session cookie name.

---

# 41. SESSION STORE

Ako server-side:

proveri:

- expiry
- invalidation
- fixation
- user-session mapping
- multi-instance behavior

---

# 42. SESSION EXPIRY

Razlikuj:

- idle timeout
- absolute timeout

ako oba postoje.

---

# 43. SLIDING EXPIRY

Može beskonačno produžavati session aktivnom attacker-u nakon theft-a.

Proceni model.

---

# 44. REMEMBER ME

Dugotrajni persistent credential mora imati zasebnu analizu.

---

# 45. LOGOUT

Server-side session treba da bude invalidirana gde auth model to zahteva.

---

# 46. CLIENT-ONLY LOGOUT

Scenario:

```text
browser deletes cookie/token
↓
server credential remains valid
```

Ukradeni credential nastavlja da radi.

---

# 47. LOGOUT ALL DEVICES

Ako feature postoji:

proveri da zaista invalidira sve relevantne credentials.

---

# 48. PASSWORD CHANGE

Šta se dešava sa postojećim sessions?

Ne postoji univerzalan odgovor.

Dokumentuj product/security nameru.

---

# 49. COMPROMISE RESPONSE

Ako user resetuje password jer sumnja na compromise:

ostavljanje svih attacker sessions aktivnim može biti ozbiljan problem.

---

# 50. JWT ACCESS TOKEN

Ako koristi JWT:

utvrdi:

- signing algorithm
- key
- issuer
- audience
- expiration
- subject
- token type

---

# 51. SIGNATURE VERIFICATION

Proveri da se token nikada ne decode-uje kao trusted bez verification-a.

---

# 52. VERIFY VS DECODE

High-signal anti-pattern:

```text
jwt.decode(token)
↓
use claims as authenticated identity
```

bez signature verification.

---

# 53. JWT ALGORITHM

Verifier treba da ima očekivani algorithm/key model.

Ne dozvoli attacker-controlled algorithm selection ako library to može pogrešno da interpretira.

---

# 54. `alg=none`

Proveri samo ako library/version/config to realno može prihvatiti.

---

# 55. HS/RS CONFUSION

Isto, ne prijavljuj generički bez actual library path-a.

---

# 56. JWT SECRET

Slab/hardcoded symmetric secret može omogućiti token forgery.

---

# 57. ASYMMETRIC KEY

Private key mora ostati server-side.

---

# 58. PUBLIC KEY ROTATION

Ako JWKS/provider keys rotiraju:

proveri cache/refresh handling.

---

# 59. `kid`

Custom key lookup nad attacker-controlled `kid` može postati injection/path/SSRF surface ako nebezbedno implementiran.

---

# 60. ISSUER

Ako se tokeni više identity providera koriste:

proveri da issuer nije ignorisan.

---

# 61. AUDIENCE

Token iz jednog client/service konteksta ne treba automatski važiti u drugom.

---

# 62. TOKEN TYPE CONFUSION

Access token, ID token i refresh token ne treba koristiti kao međusobne zamene.

---

# 63. ID TOKEN AS API AUTH

Ako OIDC ID token se prihvata kao access token bez namere:

mogu nastati audience/scope problemi.

---

# 64. EXPIRATION

Proveri `exp`.

---

# 65. `nbf`

Ako se koristi, proveri.

---

# 66. CLOCK SKEW

Razumna tolerancija može biti potrebna.

Ne uvodi velike grace periode koji efektivno produžavaju token.

---

# 67. JWT REVOCATION

Stateless access token možda namerno nije instant revocable.

Proceni:

- lifetime
- sensitivity
- refresh model

---

# 68. ROLE CLAIM

Ako token sadrži role:

promena role u DB-u možda ne utiče do isteka tokena.

To mora biti namerna semantics.

---

# 69. DISABLED USER

Ako user bude suspended/deleted:

da li postojeći access token i dalje radi?

---

# 70. AUTH VERSION

Neki sistemi koriste:

- token version
- session epoch

za invalidaciju svih tokena.

Ako postoji, proveri enforcement.

---

# 71. REFRESH TOKEN

Mapiraj lifecycle:

```text
issue
↓
store
↓
use
↓
rotate
↓
revoke
```

---

# 72. REFRESH STORAGE

Server-side storage može biti:

- raw token
- hash
- token family metadata

---

# 73. RAW REFRESH TOKEN U DB

Ako DB compromise scenario ima značaj:

hashing refresh tokena može smanjiti blast radius.

Proceni architecture-u.

---

# 74. REFRESH ROTATION

Ako svaki refresh izdaje novi refresh token:

stari treba imati definisano ponašanje.

---

# 75. REUSE DETECTION

Ponovna upotreba starog refresh tokena može ukazivati na krađu.

---

# 76. PARALLEL REFRESH

Legitimate client može slučajno poslati dva refresh request-a istovremeno.

Naivan rotation model može odjaviti korisnika ili otvoriti race.

---

# 77. REFRESH RACE

Testiraj:

```text
same refresh token
A || B
```

---

# 78. TOKEN FAMILY

Ako postoji reuse-detection family model:

proveri atomicity.

---

# 79. REFRESH TOKEN EXPIRY

Dug refresh lifetime povećava persistence ukradenog credential-a.

Ali UX/product tradeoff postoji.

---

# 80. REFRESH TOKEN SCOPE

Ne prihvataj token namenjen drugom device/client-u ako model to ne dozvoljava.

---

# 81. TOKEN U BROWSER-U

Utvrdi gde se čuva:

- HttpOnly cookie
- localStorage
- sessionStorage
- memory
- IndexedDB

---

# 82. STORAGE MODEL NIJE SAM PO SEBI VULNERABILITY

Proceni zajedno sa:

- XSS riskom
- CSRF modelom
- token lifetime-om
- refresh tokenom

---

# 83. TOKEN LEAK U URL

Proveri magic link/reset/OAuth callbacks.

---

# 84. REFERER LEAK

Sensitive token u URL-u može otići trećim stranama kroz referrer, zavisno od policy/browser flow-a.

---

# 85. HISTORY

Token može ostati u browser history-ju.

---

# 86. MAGIC LINK

Mapiraj:

```text
request
↓
token
↓
email
↓
click
↓
login/session
```

---

# 87. MAGIC LINK ENTROPY

Token mora biti nepredvidiv.

---

# 88. MAGIC LINK EXPIRY

Ograničen lifetime.

---

# 89. MAGIC LINK SINGLE USE

Ako link daje direktnu autentikaciju:

ponovna upotreba je high-signal risk osim ako design namerno dozvoljava.

---

# 90. MAGIC LINK CONCURRENCY

Dva browsera koriste isti link istovremeno.

---

# 91. MAGIC LINK BINDING

Ako se binduje za:

- email
- intent
- redirect
- client

proveri enforcement.

---

# 92. MAGIC LINK OPEN REDIRECT

`next`/redirect param može voditi na attacker domain.

---

# 93. EMAIL SCANNER

Security email scanner može automatski otvoriti magic link pre korisnika.

Proveri flow ako relevantno.

---

# 94. ONE-CLICK LOGIN

GET request koji odmah konzumira token može biti problem sa link scanners/prefetch.

---

# 95. INTERMEDIATE CONFIRMATION

Može biti potrebno za neke magic-link sisteme.

Ne uvodi automatski bez UX/product konteksta.

---

# 96. OTP AUTH

Ako koristi OTP:

mapiraj:

- generation
- delivery
- verification
- attempts
- expiry
- reuse

---

# 97. OTP ENTROPY

Kratak numeric OTP zahteva strogu attempt zaštitu.

---

# 98. OTP VERIFY LIMIT

Mora biti vezan za challenge/account semantics.

---

# 99. OTP RESEND

Novi OTP ne treba trivijalno resetovati guessing protection.

---

# 100. OLD OTP

Nakon izdavanja novog OTP-a:

utvrdi da li stari ostaje validan.

---

# 101. MULTIPLE VALID OTP

Ako više kodova istovremeno važi:

attack surface raste.

Može biti namerno radi delivery race-a, ali mora biti poznato.

---

# 102. OTP SINGLE USE

Successful code ne sme biti ponovno prihvaćen.

---

# 103. OTP DELIVERY

SMS/email provider failure ne sme pretvoriti auth flow u bypass.

---

# 104. PHONE NUMBER RECYCLING

SMS auth ima širi identity lifecycle problem.

Ne rešava se samo kodom.

Dokumentuj ako product dugoročno koristi phone kao sole identity.

---

# 105. MFA

Ako postoji:

utvrdi faktore:

- TOTP
- SMS
- email
- WebAuthn
- push
- recovery code

---

# 106. MFA ENROLLMENT

Napadač sa ukradenom session ne sme lako da enroll-uje svoj MFA bez odgovarajuće re-auth politike ako threat model zahteva.

---

# 107. MFA DISABLE

High-risk action.

---

# 108. MFA RESET

Support/admin reset je takeover surface.

---

# 109. MFA BYPASS ROUTE

Traži alternativni login/refresh/recovery endpoint koji izdaje full auth bez MFA.

---

# 110. REMEMBERED DEVICE

Ako MFA može biti zapamćen:

proveri device token lifecycle.

---

# 111. MFA TOKEN

Ne veruj client boolean-u:

```text
mfaVerified=true
```

---

# 112. PARTIAL SESSION

Pre-MFA session mora biti ograničena.

---

# 113. PARTIAL AUTH PRIVILEGES

User koji je prošao password ali ne MFA ne sme dobiti normalni access token/session.

---

# 114. MFA CHALLENGE BINDING

Challenge treba da bude vezan za pravi pre-auth principal/session.

---

# 115. TOTP

Proveri:

- secret generation
- storage
- verification window
- replay

---

# 116. TOTP REPLAY

Isti code unutar window-a može biti prihvaćen više puta ako system ne prati last-used step, zavisno od threat modela.

---

# 117. CLOCK WINDOW

Preširok verification window povećava brute-force prostor.

---

# 118. RECOVERY CODES

Treba biti:

- dovoljno random
- single-use
- bezbedno stored

---

# 119. RECOVERY CODE HASHING

Ako DB breach model relevantan:

hash storage može biti koristan.

---

# 120. CODE REGENERATION

Novi recovery codes treba da invalidiraju stare ako product tako definiše.

---

# 121. PASSKEYS / WEBAUTHN

Ako postoji:

proveri:

- RP ID
- origin
- challenge
- user verification
- sign count semantics prema authenticator tipu

---

# 122. WEBAUTHN CHALLENGE

Mora biti fresh i bound za ceremony.

---

# 123. WEBAUTHN ORIGIN

Proveri expected origin/RP ID.

---

# 124. WEBAUTHN USER HANDLE

Ne mešaj account identities.

---

# 125. OAUTH/OIDC

Mapiraj svaki provider.

---

# 126. AUTHORIZATION CODE FLOW

Proveri:

```text
authorize
↓
callback
↓
code exchange
↓
identity validation
↓
account/session
```

---

# 127. `state`

Proveri correlation/CSRF zaštitu gde flow zahteva.

---

# 128. PKCE

Za public clients proveri provider/client model.

---

# 129. `nonce`

OIDC ID token flow gde relevantno.

---

# 130. REDIRECT URI

Mora biti kontrolisan.

---

# 131. OPEN REDIRECT + OAUTH

Može postati credential/token leakage path.

---

# 132. PROVIDER IDENTITY

Local account treba mapirati na stabilan provider subject, ne samo mutable display data.

---

# 133. EMAIL-ONLY ACCOUNT LINKING

High-risk.

Scenario:

```text
OAuth provider returns email
↓
backend finds local account by email
↓
automatically links
```

Ako provider email nije verified/trusted kako se pretpostavlja, account takeover može biti moguć.

---

# 134. VERIFIED EMAIL CLAIM

Proveri provider contract i claim.

---

# 135. ACCOUNT LINKING

Korisnik koji je već prijavljen i dodaje novog provider-a:

proveri re-auth/CSRF/state semantics.

---

# 136. ACCOUNT UNLINKING

Ne ostavi user-a bez ijednog usable authentication metoda slučajno.

---

# 137. PROVIDER COLLISION

Isti email na različitim providers nije isto što i isti identity bez explicit trust policy-ja.

---

# 138. SOCIAL LOGIN TAKEOVER

Ako jedan provider account može biti linked na više local accounts ili obrnuto:

proveri uniqueness constraints.

---

# 139. OIDC ISSUER + SUBJECT

Identity tipično treba da se razlikuje po:

```text
issuer + subject
```

gde provider model to propisuje.

---

# 140. SAML

Ako postoji:

proveri:

- signature
- audience
- recipient
- issuer
- replay
- assertion expiry

---

# 141. SAML XML SECURITY

Detaljni XML napadi samo ako actual parser/config daje površinu.

---

# 142. SAML ACCOUNT MAPPING

Email/name nije nužno stabilan identity key.

---

# 143. ADMIN AUTH

Admin login zaslužuje poseban pregled.

---

# 144. ADMIN ALTERNATIVE FLOW

Traži:

- special URL
- master password
- emergency login
- support bypass

---

# 145. BREAK-GLASS ACCOUNT

Može biti legitimno.

Ali mora imati:

- strogu zaštitu
- monitoring
- rotation
- limited use

---

# 146. MASTER PASSWORD

Ako jedna shared tajna prijavljuje bilo kog user-a:

veoma visok rizik.

---

# 147. SUPPORT IMPERSONATION

Ako support može postati user bez user credential-a:

to je privileged authentication path.

---

# 148. IMPERSONATION TOKEN

Treba jasno razlikovati actor i impersonated user.

---

# 149. IMPERSONATION AUDIT

High-value events moraju pokazati pravog operatora.

---

# 150. API KEYS KAO AUTH

Ako machines koriste API key:

utvrdi:

- owner
- scopes
- expiry
- revocation
- hashing
- rotation

---

# 151. RAW API KEY STORAGE

Hashing može zaštititi od DB disclosure-a.

---

# 152. KEY CREATION

Full secret često treba prikazati samo pri kreiranju.

---

# 153. KEY PREFIX

Koristan za lookup/identification, ne kao secret.

---

# 154. KEY SCOPE

Machine key ne treba automatski imati full account/admin privileges.

---

# 155. KEY REVOCATION

Mora biti enforce-ovana na svakom auth path-u koji prihvata key.

---

# 156. MULTIPLE AUTH METHODS

Najslabiji auth method određuje takeover resistance naloga.

---

# 157. STRONG PASSWORD + WEAK MAGIC LINK

MFA na password flow-u ne pomaže ako recovery/magic-link flow potpuno zaobilazi MFA bez namere.

---

# 158. AUTH METHOD DOWNGRADE

Attacker može pokušati slabiji legacy/provider flow.

---

# 159. ACCOUNT RECOVERY

Mapiraj svaki recovery način:

- password reset
- recovery email
- SMS
- support
- recovery codes
- backup identity provider

---

# 160. RECOVERY JE AUTHENTICATION

Recovery često daje kontrolu nad account-om i mora biti tretiran kao pun auth boundary.

---

# 161. RESET REQUEST

Ne treba da menja password/session pre validnog token proof-a.

---

# 162. RESET TOKEN ENTROPY

Cryptographically secure.

---

# 163. RESET TOKEN EXPIRY

Bounded.

---

# 164. RESET TOKEN SINGLE USE

Atomic consumption.

---

# 165. RESET TOKEN RACE

Dva reset request-a sa istim tokenom istovremeno.

---

# 166. MULTIPLE RESET TOKENS

Da li novi reset request invalidira prethodni?

Oba modela mogu postojati.

Dokumentuj threat.

---

# 167. PASSWORD RESET + MFA

Ako account koristi MFA:

da li password reset zaobilazi MFA?

Možda namerno, ali tada recovery kanal postaje glavni takeover boundary.

---

# 168. EMAIL ACCOUNT COMPROMISE

Password-reset-by-email security zavisi od email account-a.

To je inherentan model, ne app bug.

---

# 169. SUPPORT RECOVERY

Manual support reset često je najteže auditovati u code repo-u.

Ako nije vidljiv:

**SUPPORT RECOVERY PROCESS: NOT VERIFIED**

---

# 170. SECURITY QUESTIONS

Ako postoje kao recovery mechanism:

obično slabe zbog guessable answers.

Proceni implementation.

---

# 171. ACCOUNT DELETION

Posle delete-a:

- old sessions
- refresh tokens
- API keys
- magic links

ne treba neočekivano ostati usable.

---

# 172. ACCOUNT RESTORE

Ako deleted account može biti restored:

proveri old credential semantics.

---

# 173. EMAIL REUSE

Ako novi user može kasnije registrovati email obrisanog user-a:

stari tokens/magic links ne smeju autentikovati novi account.

---

# 174. IDENTIFIER RECYCLING

Isto za phone/username.

---

# 175. TOKEN BINDING TO ACCOUNT GENERATION

One-time token treba targetirati konkretnu account identity/version, ne samo email string, gde lifecycle dopušta identifier reuse.

---

# 176. INVITES

Invite token može kreirati/loginovati membership/account.

Audituj kao auth-like token.

---

# 177. INVITE HIJACK

Ako invite token + editable email omogućavaju attacker-u da prihvati poziv kao druga osoba:

analiziraj.

---

# 178. INVITE SINGLE USE

Atomic consumption.

---

# 179. EMAIL VERIFICATION

Verification token ne treba automatski davati full auth ako product to ne namerava.

---

# 180. VERIFY TOKEN REUSE

Ponovna upotreba treba imati stabilno bezbedno ponašanje.

---

# 181. DEVICE SESSIONS

Ako UI prikazuje logged-in devices:

uporedi sa stvarnim credentials/session records.

---

# 182. SESSION REVOCATION UI

Klik na "log out device" mora stvarno invalidirati credential.

---

# 183. UNKNOWN DEVICE NOTIFICATION

Hardening/product feature, ne mandatory security kontrola.

---

# 184. IP BINDING

Hard binding session-a na IP često kvari mobile/VPN users.

Ne preporučuj automatski.

---

# 185. USER AGENT BINDING

Slab signal, može biti hardening, ne jaka auth kontrola.

---

# 186. DEVICE FINGERPRINT

Privacy i false-positive problemi.

Ne uvodi bez threat modela.

---

# 187. REAUTHENTICATION

Sensitive akcije mogu zahtevati recent authentication.

Primer:

- password change
- MFA disable
- payout destination
- API key creation

---

# 188. STALE SESSION FOR SENSITIVE ACTION

Ako 1-year-old stolen session može promeniti password/MFA bez re-auth:

proceni kao takeover persistence risk.

---

# 189. RECENT AUTH

Može biti:

- password
- MFA
- WebAuthn

zavisno od auth modela.

---

# 190. REMEMBERED MFA + REAUTH

Ne pretpostavljaj da remembered device zadovoljava high-risk reauthentication.

---

# 191. SESSION CONCURRENCY

Da li postoji limit na active sessions?

Nije obavezna kontrola.

---

# 192. SESSION LIST

Ako postoji, proveri ownership.

User ne sme revokovati tuđu session preko manipulacije ID-a.

---

# 193. SESSION TOKEN IN LOGS

Pretraži:

- access logs
- query params
- headers
- error reports

---

# 194. AUTHORIZATION HEADER LOG

Redact.

---

# 195. COOKIE LOG

Redact session cookies.

---

# 196. ERROR REPORTING

Sentry-like tool ne treba da dobija raw credentials.

---

# 197. TRACE ATTRIBUTES

Ne stavljaj tokens/passwords u spans.

---

# 198. CLIENT TELEMETRY

Frontend analytics ne sme slati auth token.

---

# 199. SERVICE WORKER

PWA/service worker ne treba slučajno logovati/cache-ovati auth secrets.

---

# 200. BROWSER CACHE

Sensitive auth response-i treba da imaju odgovarajuće caching semantics.

---

# 201. MAGIC/RESET PAGE THIRD-PARTY SCRIPTS

Sensitive token u URL-u + third-party analytics može povećati leakage risk.

---

# 202. URL TOKEN CONSUMPTION

Poželjno je ukloniti token iz visible URL/history nakon consumption gde architecture dozvoljava.

P4/P2 prema realnom leak path-u.

---

# 203. CSRF NA LOGIN

Login CSRF može biti relevantan kod cookie session aplikacija.

Attacker može naterati žrtvu da bude prijavljena na attacker account.

Proceni realan impact.

---

# 204. CSRF NA LOGOUT

Obično niži severity, ali može biti abuse/UX problem.

---

# 205. CSRF NA ACCOUNT LINKING

Mnogo ozbiljniji.

---

# 206. OAUTH CALLBACK CSRF

`state`/flow correlation.

---

# 207. CROSS-TAB RACE

Multiple tabs mogu paralelno refresh-ovati/rotate-ovati token.

Testiraj official client behavior.

---

# 208. MOBILE TOKEN STORAGE

Ako mobile client postoji:

proveri korišćenje platform secure storage gde relevantno.

---

# 209. DESKTOP TOKEN STORAGE

Ako desktop app postoji:

proveri OS credential protection prema platformi.

---

# 210. CLI TOKEN STORAGE

Plain config file permissions.

---

# 211. SERVER-SIDE SECRET

OAuth client secret ne treba u public/mobile/browser client-u.

---

# 212. PUBLIC OAUTH CLIENT

Public client ne može pouzdano čuvati client secret.

Flow treba to uzeti u obzir.

---

# 213. CLIENT SECRET IZLOŽEN U SPA

Ako server tretira ga kao poverljivu tajnu:

problem je architecture.

---

# 214. AUTH CALLBACK HOST

Ne generiši security-sensitive callback URL iz attacker-controlled host bez trust validation-a.

---

# 215. PROXY HEADERS

Auth system koji koristi:

- forwarded proto
- host
- IP

mora imati pravilno trusted proxy podešavanje.

---

# 216. SECURE COOKIE BEHIND PROXY

Wrong proxy config može sprečiti Secure cookie ili izazvati pogrešne redirect-e.

---

# 217. ORIGIN

OAuth/WebAuthn/CSRF flow može zavisiti od pravog origin-a.

---

# 218. MULTI-DOMAIN APP

Ako isti auth važi na više domena:

mapiraj cookie/token scope.

---

# 219. STAGING/PRODUCTION IDENTITY

Nikada ne dozvoli da staging token/session automatski radi u production-u zbog:

- shared secret
- missing issuer/audience
- shared session store

---

# 220. CROSS-ENVIRONMENT TOKEN

P1/P0 prema blast radius-u.

---

# 221. DEV DEFAULT SECRET

Ako dev fallback secret radi u production-u kada env nedostaje:

critical.

---

# 222. FAIL-OPEN AUTH

Scenario:

```text
auth provider unavailable
↓
catch error
↓
continue as authenticated/default user
```

P0/P1.

---

# 223. CACHE FAIL-OPEN

Missing session/permission lookup ne sme postati authenticated success.

---

# 224. UNKNOWN USER

Valid token sa subject-om koji local DB više nema:

definiši behavior.

---

# 225. AUTO-PROVISIONING

Ako OIDC/SAML auto-kreira user-e:

proveri:

- allowed domain
- tenant
- role default
- verified identity

---

# 226. DEFAULT ROLE

New federated user ne sme dobiti privileged default.

---

# 227. EMAIL DOMAIN ALLOWLIST

Ako B2B app zahteva samo corporate domain:

proveri da se domain validation ne radi samo string suffix metodom bez normalization.

---

# 228. JIT PROVISIONING

Mapiraj race između dva simultaneous first logins.

---

# 229. DUPLICATE FEDERATED ACCOUNT

Unique issuer+subject mapping.

---

# 230. SESSION DESERIALIZATION

Ako session store sadrži user role/permissions snapshot:

proveri staleness.

---

# 231. USER FETCH PER REQUEST

Ako current user DB lookup postoji:

revocation semantics su drugačije.

---

# 232. CACHE USER PROFILE

Auth-critical properties ne smeju biti stale duže nego security model dozvoljava.

---

# 233. TOKEN CLAIM TRUST

Frontend-provided user object nije auth authority.

---

# 234. AUTH CONTEXT OVERRIDE

Traži mogućnost:

```text
req.user = body.user
```

ili sličan unsafe merge.

---

# 235. IMPERSONATION HEADER

Internal identity header mora dolaziti samo iz trusted gateway-a.

---

# 236. DIRECT ORIGIN ACCESS

Ako client može direktno pogoditi backend i spoofovati auth header:

critical.

---

# 237. PRE-AUTH STATE

Login/MFA/reset state objekti sami mogu biti sensitive resources.

---

# 238. CHALLENGE IDOR

User ne sme koristiti tuđ:

- MFA challenge
- reset flow
- magic-link session
- WebAuthn challenge

---

# 239. CHALLENGE ENTROPY

Challenge IDs koji sami predstavljaju secret moraju biti nepredvidivi.

---

# 240. CHALLENGE BINDING

Ako ID nije secret, onda mora biti vezan za drugi proof/session.

---

# 241. RACE CONDITIONS

One-time credentials moraju biti consumed atomically.

---

# 242. CHECK-THEN-MARK-USED

Pattern:

```text
if token unused
↓
perform action
↓
mark used
```

može race-ovati.

---

# 243. ATOMIC CONSUMPTION

Preferiraj atomic conditional update/transaction gde je potrebno.

---

# 244. EXPIRY CHECK + USE

I expiry/state treba biti deo safe consumption modela.

---

# 245. TOKEN BRUTE FORCE

Entropy + limiter + lifetime zajedno određuju risk.

---

# 246. UUID TOKEN

UUID nije automatski dovoljan ili nedovoljan.

Proceni version/entropy/use.

---

# 247. NUMERIC RESET TOKEN

Ako mali search space + weak attempts:

high risk.

---

# 248. SHORT CODE

Mora imati strict attempt protection.

---

# 249. TIMING ATTACKS

Ne prijavljuj theoretical nanosecond differences bez realistic remote exploit evidence-a.

---

# 250. CONSTANT TIME

Važno za manual secret comparisons gde attacker ima viable measurement model.

---

# 251. AUTH TEST INVENTORY

Pregledaj:

- login tests
- token tests
- refresh tests
- reset tests
- MFA tests
- OAuth tests
- session revocation tests
- negative tests

---

# 252. HAPPY LOGIN NIJE DOVOLJAN

Test:

```text
correct password -> success
```

ne dokazuje security.

---

# 253. WRONG PASSWORD TEST

---

# 254. UNKNOWN ACCOUNT TEST

---

# 255. LOCK/RATE TEST

---

# 256. SESSION FIXATION TEST

Pre-login cookie/session ID vs posle-login.

---

# 257. LOGOUT REUSE TEST

Sačuvaj credential, logout, pokušaj reuse.

---

# 258. PASSWORD CHANGE REUSE TEST

Old sessions/tokens prema intended semantics.

---

# 259. REFRESH REUSE TEST

Stari rotated refresh token.

---

# 260. PARALLEL REFRESH TEST

Dva request-a istovremeno.

---

# 261. RESET REUSE TEST

Isti token nakon success-a.

---

# 262. RESET PARALLEL TEST

Dva concurrent uses.

---

# 263. MAGIC LINK REUSE TEST

---

# 264. OTP GUESS LIMIT TEST

---

# 265. OTP RESEND BYPASS TEST

---

# 266. MFA BYPASS MATRIX

Za svaki auth/recovery flow pitaj:

> Da li izdaje full session bez drugog faktora?

---

# 267. ROLE REVOKE TEST

Admin role uklonjena, stari token/session.

---

# 268. USER DISABLE TEST

---

# 269. CROSS-ENVIRONMENT TOKEN TEST

Ako environments dele identity components.

---

# 270. OAUTH STATE TEST

Callback bez/sa pogrešnim `state`.

---

# 271. OAUTH ACCOUNT LINK TEST

Attacker provider account + victim email scenario prema provider claims.

---

# 272. FINDING FORMAT

Svaki ozbiljan finding mora sadržati:

```text
ID:
Severity:
Category:
Confidence:
Status:

Authentication method:
Attacker model:
Existing privileges required:

Endpoint/Flow:
Credential:
Session/token type:

File/Class:
Function:
Relevant configuration:

Vulnerability:

Evidence:

Attack Preconditions:

Attack Timeline:

T0:
T1:
T2:
T3:

Expected authentication boundary:

Actual behavior:

Credential obtained/abused:

Account takeover impact:

Privilege impact:

Persistence after password change/logout:

Blast radius:

Root cause:

Recommended remediation:

Regression/security test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 273. SEVERITY

Koristi:

## P0 - CRITICAL

- unauthenticated arbitrary account/admin takeover at scale
- token forgery zbog exposed universal signing secret/key
- full authentication bypass
- cross-environment trust koji daje production privileged access

## P1 - HIGH

- practical account takeover
- reset/magic-link/MFA bypass
- long-lived session hijack persistence kroz normalne revocation actions
- exploitable OAuth/OIDC account-linking flaw
- privileged auth path protected slabije od običnog flow-a

## P2 - MEDIUM

- meaningful auth weakness sa dodatnim preconditions
- limited session persistence problem
- constrained enumeration/recovery weakness
- moderate MFA/session flaw

## P3 - LOW

- minor auth information leak
- difficult edge case
- small session hygiene problem

## P4 - HARDENING

- dodatno auth hardening bez potvrđenog takeover/bypass path-a

---

# 274. CONFIDENCE

Koristi:

```text
HIGH
MEDIUM
LOW
```

HIGH:

code/test/config direktno dokazuje auth bypass/takeover path.

MEDIUM:

jak evidence, ali provider/browser/deployment behavior nije potpuno potvrđen.

LOW:

zavisi od nepoznatog external identity/provider contract-a.

---

# 275. STATUS

Koristi:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 276. CATEGORY

Koristi:

```text
PASSWORD
SESSION
JWT
REFRESH TOKEN
MAGIC LINK
OTP
MFA
WEBAUTHN
OAUTH/OIDC
SAML
RECOVERY
API KEY
ACCOUNT LINKING
REVOCATION
TRUST BOUNDARY
```

---

# 277. EVIDENCE TIER

```text
A - reproduced
B - complete executable path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 278. FALSE-POSITIVE PREVENCIJA

Pre P0/P1/P2 finding-a proveri:

1. endpoint reachability
2. credential verification
3. middleware
4. auth provider contract
5. token/session storage
6. revocation path
7. client flow
8. concurrency
9. tests
10. deployment config

---

# 279. NE PRIJAVLJUJ DUG SESSION KAO VULNERABILITY SAM PO SEBI

Severity zavisi od:

- sensitivity
- revocation
- MFA
- secure storage
- product UX

---

# 280. NE PRIJAVLJUJ JWT KAO PROBLEM SAM PO SEBI

Problem mora biti:

- verification
- key
- claims
- lifetime
- revocation semantics

---

# 281. NE PRIJAVLJUJ LOCALSTORAGE SAMO PO SEBI

Mora postojati realan token theft/XSS threat model.

---

# 282. NE ZAHTEVAJ MFA ZA SVAKU APLIKACIJU

P4 hardening ako product risk ne zahteva.

---

# 283. NE ZAHTEVAJ PASSWORD ROTATION PO KALENDARU AUTOMATSKI

To često nema bezbednosnu korist bez compromise signala.

---

# 284. NE ZAHTEVAJ KOMPLEKSNE PASSWORD SIMBOLE SAMO RADI CHECKLIST-E

Fokus na dužinu, hashovanje, brute-force i compromised credential threat.

---

# 285. NE BLOKIRAJ ACCOUNT TVRDO POSLE PAR GREŠAKA BEZ DOS ANALIZE

Napadač može lockout-ovati žrtvu.

---

# 286. NE MENJAJ PROVIDER

Ako current provider može biti ispravno konfigurisan, nema razloga za migraciju samo radi audita.

---

# 287. NE MENJAJ KOD

Tokom audita:

- ne resetuje passwords
- ne revokuje sessions
- ne rotira signing keys
- ne menja MFA
- ne menja OAuth config
- ne menja cookie policy

osim uz eksplicitno odobrenje.

Prvo završi audit.

---

# 288. OUTPUT - AUTHENTICATION_SECURITY_AUDIT.md

Finalni izveštaj strukturiraj:

## 1. Executive Summary

- auth methods
- session/token model
- recovery model
- najveći takeover rizici
- evidence quality

## 2. Authentication Architecture Map

## 3. Auth Endpoint Inventory

## 4. Account Identifier / Normalization Audit

## 5. Password Authentication Audit

## 6. Brute Force / Enumeration Audit

## 7. Session Security Audit

## 8. Cookie Audit

## 9. JWT Access Token Audit

## 10. Refresh Token Audit

## 11. Revocation / Logout Audit

## 12. Password Change / Credential Rotation Audit

## 13. Magic Link Audit

## 14. OTP Audit

## 15. MFA Audit

## 16. WebAuthn / Passkey Audit

Ako relevantno.

## 17. OAuth / OIDC Audit

Ako relevantno.

## 18. SAML Audit

Ako relevantno.

## 19. Account Linking Audit

## 20. Account Recovery Audit

## 21. API Key Authentication Audit

## 22. Admin / Support Authentication Audit

## 23. Cross-Environment Trust Audit

## 24. Token / Credential Exposure Audit

## 25. Reauthentication Audit

## 26. Race / One-Time Credential Audit

## 27. Auth Test Coverage

## 28. Findings Summary

| ID | Severity | Method | Flow | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 29. P0 Findings

## 30. P1 Findings

## 31. P2 Findings

## 32. P3 Findings

## 33. P4 Hardening

## 34. Things Done Well

## 35. Unknown / Not Verified

## 36. Authentication Remediation Roadmap

---

# 289. AUTH METHOD MATRIX

| Method | Credential | Second factor | Session issued | Recovery path |
|---|---|---|---|---|

---

# 290. SESSION MATRIX

| Session type | Lifetime | Storage | Rotation | Revocation | Risk |
|---|---|---|---|---|---|

---

# 291. TOKEN MATRIX

| Token | Purpose | Lifetime | Single-use | Stored | Revocable |
|---|---|---|---|---|---|

---

# 292. MFA BYPASS MATRIX

| Login/recovery path | MFA required | Full session issued | Bypass risk |
|---|---|---|---|

---

# 293. RECOVERY MATRIX

| Recovery path | Proof required | Token/code lifetime | Single-use | Account takeover power |
|---|---|---|---|---|

---

# 294. SECOND PASS - SESSION FIXATION ATTACK

Scenario:

```text
attacker obtains/sets pre-auth session ID
↓
victim logs in
↓
session ID remains unchanged
↓
attacker reuses same ID
```

Proveri actual session rotation.

---

# 295. SECOND PASS - LOGOUT ATTACK

Sačuvaj token/session.

Logout.

Pokušaj ga ponovo.

---

# 296. SECOND PASS - PASSWORD CHANGE

Sačuvaj:

- session
- access token
- refresh token

Promeni password.

Testiraj svaki credential prema intended policy-ju.

---

# 297. SECOND PASS - USER DISABLE

Suspend/delete account.

Testiraj sve postojeće credentials.

---

# 298. SECOND PASS - ROLE REVOKE

Ukloni privileged role.

Testiraj old access token/session.

---

# 299. SECOND PASS - REFRESH RACE

Pošalji isti refresh token paralelno.

Pitaj:

- koliko novih tokena nastaje
- da li reuse detection radi
- da li legitimate client biva pogrešno zaključan

---

# 300. SECOND PASS - RESET RACE

Isti password reset token dva puta paralelno.

Samo jedan logical reset treba biti prihvaćen ako je token single-use.

---

# 301. SECOND PASS - MAGIC LINK REUSE

Klik:

```text
first browser
second browser
after success
after expiry
```

---

# 302. SECOND PASS - OTP

Testiraj:

- wrong codes do limita
- resend
- new challenge
- old code
- concurrent correct code

---

# 303. SECOND PASS - MFA BYPASS

Za svaki login/recovery flow pronađi mesto gde se izdaje full credential.

Pitaj:

> Da li je MFA requirement proverena pre tog trenutka?

---

# 304. SECOND PASS - OAUTH ACCOUNT LINK

Testiraj:

- matching email
- unverified email
- different issuer
- existing local account
- already-linked provider identity

---

# 305. SECOND PASS - CROSS-ENVIRONMENT TOKEN

Pokušaj staging/dev token protiv production verifier-a u bezbednom environment-u ili statički proveri:

- signing keys
- issuer
- audience
- session namespace

---

# 306. SECOND PASS - TOKEN TYPE CONFUSION

Pokušaj:

- ID token kao access token
- refresh token kao access token
- token za service A protiv service B

gde architecture ima više token tipova.

---

# 307. SECOND PASS - TRUSTED HEADER

Ako gateway postavlja authenticated identity:

proveri direct-origin spoofing.

---

# 308. SECOND PASS - ACCOUNT RECOVERY

Pitaj:

> Koji je najslabiji način da attacker dobije novu validnu session?

To je stvarna account recovery security granica.

---

# 309. SECOND PASS - OLD AUTH ROUTES

Uporedi security controls na:

- v1
- v2
- web
- mobile
- admin

---

# 310. SECOND PASS - CREDENTIAL LEAK

Repository-wide traži da li se:

- password
- session token
- access token
- refresh token
- reset token

prosleđuje u:

- URL
- logs
- analytics
- error monitoring

---

# 311. FINAL QUALITY GATE

Pre finalnog odgovora proveri:

- svi auth methods su inventarisani
- najslabiji auth/recovery path je analiziran
- auth i authorization nisu pomešani
- password storage je potvrđen actual library/config-om
- session fixation je proverena
- logout/revocation je testirana na realnom credential-u
- password change behavior je provereno
- suspended/deleted user credentials su analizirani
- JWT se verify-uje, ne samo decode-uje
- issuer/audience/token type su provereni gde relevantno
- staging/prod trust je analiziran
- refresh token rotation/reuse/concurrency su provereni
- magic link/reset/OTP tokeni imaju entropy, expiry i single-use analizu
- MFA nije proverena samo na glavnom login endpoint-u
- recovery flow nije tiho tretiran kao manje važan od login-a
- OAuth account linking koristi pravi identity proof
- unverified provider email nije implicitno trusted bez dokaza
- admin/support/break-glass auth putevi su pregledani
- credentials nisu exposed kroz logs/URL/analytics
- one-time credential races su analizirane
- P4 hardening je odvojen od stvarnih takeover/bypass findings
- svaki P0/P1 ima kompletan attack path i jasne preconditions

---

# KONAČNO PRAVILO

Ne želim izveštaj tipa:

> Uključite MFA, koristite secure cookies i kratkotrajne JWT tokene.

To nije authentication security audit.

Tražim probleme poput:

```text
login succeeds
↓
server keeps same pre-auth session ID
↓
attacker already knows/fixed that ID
↓
victim authenticates
↓
attacker reuses same session
↓
account takeover
```

ili:

```text
access token verifier:
jwt.decode(token)
↓
claims trusted
↓
signature never verified
↓
attacker creates arbitrary token
↓
sets victim/admin subject
↓
authentication bypass
```

ili:

```text
user logs out
↓
browser deletes token
↓
refresh token remains valid server-side
↓
attacker with stolen refresh token continues issuing new access tokens
↓
logout did not revoke compromised credential
```

ili:

```text
user has MFA enabled
↓
main password login requires MFA
↓
legacy mobile login endpoint issues full session immediately after password
↓
attacker uses legacy endpoint
↓
MFA bypass
```

ili:

```text
OAuth callback receives provider email
↓
backend finds local account only by email
↓
provider does not guarantee email_verified
↓
attacker controls same unverified email claim
↓
victim local account is automatically linked
↓
account takeover
```

ili:

```text
password reset token:
SELECT token
↓
unused
↓
two concurrent requests both pass check
↓
both change password
↓
token marked used only afterwards
```

ili:

```text
staging and production share JWT signing secret
↓
issuer/audience not validated
↓
attacker obtains valid staging token
↓
production accepts same token
↓
cross-environment authentication bypass
```

ili:

```text
refresh token rotation
↓
two legitimate browser requests refresh simultaneously
↓
both validate same old token
↓
two new token families are created
↓
stolen old token can remain usable outside intended reuse-detection model
```

To su authentication problemi koje treba da pronađeš.

Razmišljaj kroz:

- identity proof
- credential creation
- credential storage
- session issuance
- revocation
- recovery
- MFA
- provider trust
- token reuse
- concurrency
- weakest alternative flow

Za svaki ozbiljan finding moraš moći da odgovoriš:

> Koji credential attacker ima pre napada?

> Koju dodatnu proveru uspeva da zaobiđe?

> Koji tačan endpoint ili auth flow koristi?

> Kada server odlučuje da je identity potvrđen?

> Koji credential dobija nakon toga?

> Da li password change/logout/MFA reset zaustavlja attacker-a?

> Da li isti problem postoji kroz legacy/mobile/recovery flow?

Ako external identity provider contract nije potvrđen:

**PROVIDER IDENTITY CONTRACT NOT VERIFIED.**

Ako je samo dodatno hardening poboljšanje bez takeover/bypass path-a:

**P4 - HARDENING.**

Bolje je pronaći 5 stvarnih account-takeover, token-forgery ili MFA-bypass problema nego napisati 100 generičkih authentication pravila.

Cilj je dobiti forenzički precizan authentication security audit koji se može direktno pretvoriti u:

- auth regression test
- session rotation fix
- token validation correction
- revocation improvement
- MFA bypass closure
- recovery hardening
- OAuth/OIDC identity fix
- production account-takeover protection
