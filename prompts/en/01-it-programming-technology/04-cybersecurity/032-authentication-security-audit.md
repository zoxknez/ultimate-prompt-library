---
id: UPL-IT-032
number: 32
slug: authentication-security-audit
title: Authentication Security Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.0
status: stable
---

# AUTHENTICATION SECURITY AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the entire authentication system of the application.

Main objective:

> Determine whether an attacker can impersonate another user, take over accounts, extend or hijack active sessions, exploit password reset or account recovery flows, bypass MFA, forge authentication tokens, abuse legacy login pathways, manipulate OAuth/OIDC account linking, or continue using credentials that should have been revoked.

This is not:

- generic advice to "enable MFA"
- an automatic ban on JWTs
- an automatic ban on session cookies
- a checklist of security headers
- a password policy debate detached from real attack paths
- advice to migrate to a third-party auth provider without necessity
- an assumption that every long-lived token is insecure
- an assumption that localStorage is inherently an exploitable vulnerability
- merely reviewing the primary login endpoint

The focus is on the complete identity lifecycle:

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

Priority:

**account takeover > authentication bypass > token/session forgery > recovery abuse > MFA bypass > session theft persistence > identity confusion > hardening**

It is better to discover 5 genuine account-takeover or authentication-bypass vulnerabilities than to produce 100 generic authentication recommendations.

---

# 1. ESTABLISH AUTHENTICATION ARCHITECTURE

Before filing findings, identify all authentication mechanisms in use:

- username/password
- email/password
- phone/password
- magic links
- one-time passwords (OTP)
- OAuth 2.0
- OpenID Connect (OIDC)
- SAML
- passkeys / WebAuthn
- API keys
- session cookies
- access tokens
- refresh tokens
- JSON Web Tokens (JWT)
- managed third-party auth providers
- custom authentication engines

---

# 2. MAP AUTHENTICATION FLOWS

Map every distinct sign-in pathway:

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

# 3. INVENTORY AUTHENTICATION ENDPOINTS

Locate all endpoints:

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

including:

- legacy
- mobile-specific
- administrative
- internal
- v1/v2 versions

---

# 4. LEGACY AUTHENTICATION PATHWAYS

Older login endpoints frequently feature weaker defenses than modern equivalents.

Specifically search for flows that:

- do not enforce MFA
- utilize alternative or deprecated token signers
- bypass account locking or risk-based anomaly checks
- enforce weaker password complexity or validation rules

---

# 5. AUTHENTICATION VS AUTHORIZATION

Do not classify an authorization defect as an authentication bug if identity was verified accurately, but permissions were evaluated incorrectly.

This audit focuses strictly on proof of identity.

---

# 6. ACCOUNT IDENTIFIERS

Establish what attributes identify accounts:

- email address
- username
- phone number
- identity provider subject (`sub`)
- internal user UUID

---

# 7. IDENTIFIER NORMALIZATION

Audit normalization rules:

- case folding
- whitespace stripping
- Unicode equivalence forms (NFKC/NFC)
- canonical E.164 phone formatting
- domain name normalization

prior to account database queries.

---

# 8. IDENTITY COLLISION

If registration and login normalize identifiers differently:

an attacker can register colliding accounts that subsequently resolve to a victim's identity.

---

# 9. EMAIL CASE SENSITIVITY

Do not assume universal rules for the local part of email addresses.

Verify against application and provider identity specifications.

---

# 10. UNICODE CONFUSION

If usernames or email-like identifiers permit Unicode:

audit for homograph or confusable collision flaws whenever identifiers dictate security-sensitive identity selection.

---

# 11. ACCOUNT ENUMERATION

Compare login and password recovery responses between:

```text
existing account
non-existing account
```

---

# 12. ENUMERATION CHANNELS

Look beyond error messages:

- HTTP status codes
- response latency differences
- response headers
- CAPTCHA challenge triggering
- rate-limiting bucket attribution
- external email transmission side effects

can all reveal account existence.

---

# 13. ENUMERATION SEVERITY

Do not automatically classify every account existence confirmation as P1 High.

Evaluate:

- application sensitivity
- whether usernames/profiles are publicly discoverable by design
- real-world exploitation potential

---

# 14. REGISTRATION ENUMERATION

Returning `email already exists` is often a conscious, accepted user experience trade-off.

Document this design choice rather than reflexively flagging it as a vulnerability.

---

# 15. PASSWORD STORAGE

If the application manages passwords directly:

identify:

- hashing algorithm (Argon2id, bcrypt, scrypt, PBKDF2)
- work factor and cost parameters
- cryptographic salt generation
- hash upgrade and migration strategy

---

# 16. PLAINTEXT PASSWORDS

Classified as P0/P1 depending on exposure context.

---

# 17. REVERSIBLE PASSWORD ENCRYPTION

A critical architectural flaw.

Passwords must be hashed with slow one-way cryptographic functions, never symmetrically encrypted.

---

# 18. MODERN PASSWORD HASHING

Enforce established, modern password hashing standards aligned with the technology stack.

Do not impose arbitrary algorithms without verifying runtime capabilities.

---

# 19. PASSWORD HASH COST PARAMETERS

Ensure work factors are not trivially weak.

Conversely, avoid setting cost parameters so high that authentication endpoints become vulnerable to CPU-exhaustion DoS attacks.

---

# 20. HASH MIGRATION

When upgrading legacy password hashes:

verify seamless, in-place re-hashing upon successful user login.

---

# 21. PASSWORD LOGGING

Search for credentials inadvertently captured in:

- HTTP server access logs
- application debug logs
- exception error traces
- analytics events
- distributed APM tracing spans

---

# 22. PASSWORDS IN URLS

Credentials must never be transmitted via URL query parameters or path segments during authentication.

---

# 23. PASSWORD POLICIES

Focus the audit on effective threat mitigation rather than arbitrary composition rules.

Prioritize:

- defense against credential stuffing and password reuse
- brute-force rate-limiting defenses
- compromised password screening (e.g., HaveIBeenPwned checks)
- reasonable minimum length requirements

---

# 24. PASSWORD TRUNCATION

Certain legacy libraries silently truncate passwords beyond specific lengths (e.g., bcrypt at 72 bytes).

Verify library behavior.

---

# 25. MAXIMUM PASSWORD LENGTH

Massive password inputs can trigger denial of service against hashing algorithms.

Enforce sensible upper bounds without silently truncating user input.

---

# 26. SECURE PASSWORD COMPARISON

Rely exclusively on battle-tested library verification routines.

Never implement custom string equality checks for password hashes.

---

# 27. LOGIN RATE LIMITING AND BRUTE-FORCE DEFENSE

Evaluate protection across:

- per-IP limits
- per-account limits
- global login thresholds
- risk-based anomaly scoring

Focus here on account takeover resistance.

---

# 28. ACCOUNT LOCKOUT DOS RISKS

Hard account lockouts after few failed attempts allow attackers to orchestrate denial-of-service attacks against victim accounts.

---

# 29. CREDENTIAL STUFFING ATTACKS

Scenario:

```text
one attempt
×
many accounts
```

Per-account rate limits alone offer zero protection against distributed stuffing.

---

# 30. DISTRIBUTED BRUTE FORCE

Thousands of distinct IP addresses targeting a single high-value account.

---

# 31. PASSWORD SPRAYING

Testing a handful of common passwords across thousands of user accounts.

---

# 32. GENERIC LOGIN ERRORS

Authentication error messages should not disclose whether the identifier or the password was incorrect when the security model intends to conceal existence.

---

# 33. SESSION CREATION

Following successful authentication, map:

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

# 34. SESSION IDENTIFIER ENTROPY

Session identifiers must be cryptographically unpredictable.

Rely on framework-native CSPRNG generators.

---

# 35. SESSION FIXATION

Verify that pre-authentication session identifiers are destroyed and regenerated immediately upon successful login.

---

# 36. PRIVILEGE ELEVATION

When a user ascends to an elevated or administrative role:

evaluate session rotation and mandatory re-authentication requirements against the threat model.

---

# 37. COOKIE-BASED SESSIONS

If cookies manage sessions, verify:

```text
Secure
HttpOnly
SameSite
Domain
Path
```

---

# 38. COOKIE DOMAIN SCOPE

Broad domain scopes (e.g., `.example.com`) allow compromised sibling subdomains to intercept or manipulate authentication cookies.

---

# 39. SUBDOMAIN TAKEOVER INTERACTION

If an authentication cookie scopes to `.example.com`, any orphaned or hijacked subdomain can capture session credentials.

Report only where DNS and infrastructure configurations prove exposure.

---

# 40. COOKIE NAME COLLISIONS

Multiple applications deployed under the same domain must not overwrite or conflict with each other's session cookies.

---

# 41. SERVER-SIDE SESSION STORES

If session state resides on the server:

verify:

- idle and absolute expirations
- immediate server-side revocation
- session fixation defenses
- user-to-session indexing
- consistency across multi-replica deployments

---

# 42. SESSION EXPIRATION MODELS

Distinguish:

- idle inactivity timeouts
- absolute session lifetimes

when both are defined.

---

# 43. SLIDING EXPIRATION RISKS

Unbounded sliding expiration permits an attacker with a stolen credential to maintain access perpetually.

---

# 44. REMEMBER-ME FUNCTIONALITY

Persistent long-lived tokens require dedicated security analysis and separate lifecycle handling.

---

# 45. SERVER-SIDE LOGOUT

Logging out must irrevocably destroy or invalidate the session state on the server.

---

# 46. CLIENT-ONLY LOGOUT

Vulnerability scenario:

```text
browser deletes cookie/token
↓
server credential remains valid
```

A stolen token or session remains completely functional on attacker machines.

---

# 47. LOGOUT FROM ALL DEVICES

If multi-device logout is supported:

verify that it actively invalidates all outstanding sessions, tokens, and refresh credentials.

---

# 48. PASSWORD CHANGE SESSION HANDLING

What happens to active sessions when a user changes their password?

Document expected security behavior and verify enforcement.

---

# 49. INCIDENT RESPONSE CREDENTIAL TERMINATION

If a user resets their password due to suspected compromise:

leaving active attacker sessions open is a critical security vulnerability.

---

# 50. JWT ACCESS TOKENS

If using JSON Web Tokens:

identify:

- signing algorithm
- cryptographic key management
- issuer (`iss`)
- audience (`aud`)
- expiration (`exp`)
- subject (`sub`)
- token type discriminator

---

# 51. MANDATORY SIGNATURE VERIFICATION

Ensure tokens are never decoded and accepted as trusted without prior cryptographic signature verification.

---

# 52. VERIFY VS DECODE

High-signal anti-pattern:

```text
jwt.decode(token)
↓
use claims as authenticated identity
```

omitting cryptographic signature verification entirely.

---

# 53. JWT ALGORITHM PINNING

Token verification must enforce an explicit expected algorithm and key.

Never permit client-controlled algorithm headers if the underlying library allows algorithm confusion.

---

# 54. THE `alg=none` EXPLOIT

Audit only when the specific library version and configuration permit unsigned tokens.

---

# 55. HMAC / RSA KEY CONFUSION (HS/RS CONFUSION)

Audit only when an actionable code path permits verifying an asymmetric token against an asymmetric public key using an HMAC algorithm.

---

# 56. JWT SIGNING SECRETS

Weak, predictable, or publicly committed symmetric HMAC secrets permit trivial token forgery.

---

# 57. ASYMMETRIC PRIVATE KEYS

Private signing keys must remain strictly protected on the backend authentication authority.

---

# 58. PUBLIC KEY ROTATION

If using JWKS endpoints for public key distribution:

verify key caching, background refreshing, and error handling.

---

# 59. KEY ID (`kid`) MANIPULATION

Custom key resolution logic based on untrusted `kid` headers can introduce directory traversal, SQL injection, or SSRF vulnerabilities.

---

# 60. ISSUER ENFORCEMENT

When consuming tokens from multiple identity providers:

ensure the `iss` claim is strictly validated.

---

# 61. AUDIENCE ENFORCEMENT

Tokens minted for client service A must not be accepted by client service B.

---

# 62. TOKEN TYPE CONFUSION

Access tokens, ID tokens, and refresh tokens must not be interchangeable.

---

# 63. ID TOKENS AS API AUTHORIZATION CREDENTIALS

Accepting OpenID Connect ID tokens as API access tokens causes audience and permission scoping flaws.

---

# 64. EXPIRATION ENFORCEMENT

Verify that the `exp` claim is strictly validated.

---

# 65. NOT-BEFORE ENFORCEMENT

Verify that the `nbf` claim is evaluated where utilized.

---

# 66. CLOCK SKEW TOLERANCE

Reasonable clock skew tolerance (e.g., 60 seconds) is standard.

Excessive grace periods artificially inflate token lifespans.

---

# 67. STATELESS JWT REVOCATION

Stateless access tokens are inherently difficult to revoke instantly before expiration.

Evaluate:

- token lifespan
- sensitivity of accessible data
- refresh token architecture

---

# 68. STALE ROLE CLAIMS

Embedding user roles inside JWT claims means role revocations in the database do not take effect until token expiration.

---

# 69. SUSPENDED USER TOKEN VALIDITY

If an account is suspended or deleted:

determine whether previously issued, unexpired access tokens remain functional.

---

# 70. AUTHENTICATION EPOCHS AND TOKEN VERSIONS

Some systems track:

- token versions
- session epochs

in the database to invalidate active tokens globally upon demand.

---

# 71. REFRESH TOKEN LIFECYCLE

Map the full refresh sequence:

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

# 72. REFRESH TOKEN STORAGE

Server-side persistence can store:

- raw token strings
- cryptographic hashes
- token family trees

---

# 73. RAW REFRESH TOKENS IN THE DATABASE

If database compromise is within the threat model:

storing refresh tokens as salted cryptographic hashes mitigates offline credential abuse.

---

# 74. REFRESH TOKEN ROTATION

When refresh tokens rotate on each use:

verify how old tokens are retired.

---

# 75. REUSE DETECTION

Attempting to redeem an already consumed refresh token indicates potential theft and should trigger immediate revocation of the entire token family.

---

# 76. CONCURRENT REFRESH CALLS

Legitimate clients frequently emit parallel refresh requests during page initialization.

Naively strict rotation models can cause false positives, prematurely logging users out.

---

# 77. REFRESH RACE CONDITIONS

Test concurrency:

```text
same refresh token
A || B
```

---

# 78. TOKEN FAMILIES

If implementing token families for reuse detection:

ensure state transitions and revocations are atomic.

---

# 79. REFRESH TOKEN LIFETIME

Excessively long refresh token lifespans grant extended persistence to stolen credentials.

Balance against UX retention requirements.

---

# 80. REFRESH TOKEN CLIENT SCOPING

Refresh tokens must be strictly bound to the specific client and device to which they were originally issued.

---

# 81. BROWSER TOKEN STORAGE

Identify storage locations:

- HttpOnly cookies
- localStorage
- sessionStorage
- in-memory state
- IndexedDB

---

# 82. STORAGE ARCHITECTURE IS NOT AN AUTOMATIC FLAW

Evaluate storage choices holistically alongside:

- XSS attack surfaces
- CSRF defense models
- access token lifespans
- refresh token mechanics

---

# 83. TOKENS IN URLS

Audit magic links, password resets, and OAuth callback URLs.

---

# 84. HTTP REFERER LEAKAGE

Sensitive tokens embedded in URL paths or query strings can leak to third parties via browser `Referer` headers.

---

# 85. BROWSER HISTORY LEAKAGE

Tokens passed in URLs persist in browser navigation histories.

---

# 86. MAGIC LINK AUTHENTICATION

Map:

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

Magic link tokens must be generated using cryptographically secure random number generators.

---

# 88. MAGIC LINK EXPIRATION

Magic links must have short, tightly bounded expiration windows.

---

# 89. MAGIC LINK SINGLE-USE ENFORCEMENT

Magic links that establish authenticated sessions must be consumed atomically and immediately invalidated.

---

# 90. CONCURRENT MAGIC LINK REDEMPTION

Test simultaneous clicks across two distinct browser sessions.

---

# 91. MAGIC LINK CONTEXT BINDING

Verify whether magic links are bound to:

- original email address
- original user agent/client fingerprint
- original login intent

---

# 92. MAGIC LINK OPEN REDIRECTS

Unvalidated `next` or redirect parameters can divert authenticated users to attacker-controlled origins.

---

# 93. AUTOMATED EMAIL SECURITY SCANNERS

Corporate email security tools frequently pre-fetch and click links inside emails.

Audit whether pre-fetching inadvertently consumes one-time magic links.

---

# 94. ONE-CLICK LOGIN RISKS

Consuming tokens via HTTP GET requests makes them vulnerable to email scanner pre-fetching and browser link pre-rendering.

---

# 95. INTERMEDIATE CONFIRMATION PROMPTS

Requiring an interactive confirmation click prevents automated email link crawlers from consuming magic links.

---

# 96. OTP AUTHENTICATION

If utilizing one-time passwords:

map:

- generation
- dispatch
- verification
- attempt limits
- expiration
- single-use invalidation

---

# 97. OTP ENTROPY

Short 6-digit numeric codes have small search spaces, demanding aggressive attempt throttling.

---

# 98. OTP ATTEMPT LIMITS

Verification limits must be strictly enforced per challenge and account.

---

# 99. OTP RESEND PROTECTION

Requesting a new OTP must never reset the failed verification attempt counter for the active challenge.

---

# 100. RETIRING OLD OTPS

Issuing a new OTP must immediately invalidate all previously issued, unexpired codes for that challenge.

---

# 101. MULTIPLE SIMULTANEOUSLY VALID OTPS

Permitting multiple valid OTP codes concurrently expands the brute-force search space.

---

# 102. SINGLE-USE OTP CONSUMPTION

A successfully verified OTP code must be invalidated immediately.

---

# 103. OTP DELIVERY OUTAGES

Failures in third-party SMS or email dispatch providers must fail-closed, never bypassing authentication.

---

# 104. PHONE NUMBER RECYCLING RISKS

SMS authentication is inherently vulnerable to carrier SIM swaps and cellular number recycling.

Document architectural reliance on phone numbers as primary identities.

---

# 105. MULTI-FACTOR AUTHENTICATION (MFA)

Identify supported second factors:

- TOTP (time-based one-time password)
- SMS / voice OTP
- email OTP
- WebAuthn / FIDO2 security keys
- mobile push notifications
- backup recovery codes

---

# 106. MFA ENROLLMENT SECURITY

Enrolling a new second factor must require re-authentication with existing credentials.

---

# 107. MFA DEACTIVATION

Disabling MFA is a high-risk security operation requiring explicit re-authentication.

---

# 108. ADMINISTRATIVE MFA RESETS

Support desk MFA resets represent high-value account takeover pathways requiring strict authorization and audit logging.

---

# 109. MFA BYPASS ENDPOINTS

Search for alternative login, refresh, or password reset routes that issue full sessions while skipping MFA checks.

---

# 110. REMEMBERED DEVICES

If MFA offers a "remember this device" option:

audit the storage, entropy, and expiration lifecycle of the persistent device token.

---

# 111. TRUSTING CLIENT-SUPPLIED MFA FLAGS

Never trust client-submitted booleans:

```text
mfaVerified=true
```

---

# 112. PARTIALLY AUTHENTICATED SESSIONS

Pre-MFA session tokens must hold strictly limited scopes, granting access solely to second-factor verification endpoints.

---

# 113. PRIVILEGES OF PARTIALLY AUTHENTICATED SESSIONS

A user who has completed password verification but not MFA must never receive general API access tokens.

---

# 114. MFA CHALLENGE BINDING

Second-factor challenges must be cryptographically bound to the authenticated pre-MFA session.

---

# 115. TOTP IMPLEMENTATION

Verify:

- shared secret entropy
- secure storage of TOTP seeds
- drift verification windows
- replay prevention

---

# 116. TOTP REPLAY DEFENSE

A TOTP code used within a 30-second window must not be accepted a second time.

The system must track the last used timestamp step.

---

# 117. CLOCK SKEW WINDOWS

Excessively wide TOTP time-step tolerance windows expand the brute-force attack window.

---

# 118. BACKUP RECOVERY CODES

Backup codes must be:

- cryptographically random
- single-use
- securely stored as salted hashes

---

# 119. HASHING RECOVERY CODES

Storing recovery codes as salted hashes protects user accounts in the event of database exfiltration.

---

# 120. RECOVERY CODE REGENERATION

Generating a fresh set of recovery codes must instantly revoke all previous codes.

---

# 121. PASSKEYS / WEBAUTHN

If supported, audit:

- Relying Party ID (RP ID)
- origin verification
- cryptographic challenge randomness
- user verification flags
- signature counter validation

---

# 122. WEBAUTHN CHALLENGE FRESHNESS

Challenges must be fresh, single-use, and bound to the specific browser registration ceremony.

---

# 123. WEBAUTHN ORIGIN VALIDATION

The server must strictly validate that the client origin matches the expected Relying Party origin.

---

# 124. WEBAUTHN USER HANDLES

User handles must link unambiguously to distinct internal accounts without identity confusion.

---

# 125. OAUTH 2.0 AND OPENID CONNECT

Map all integrated external identity providers (Google, Apple, GitHub, Microsoft).

---

# 126. AUTHORIZATION CODE FLOW

Verify:

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

# 127. THE `state` PARAMETER

Verify that the `state` parameter is cryptographically random and verified upon callback to prevent CSRF.

---

# 128. PKCE IMPLEMENTATION

Verify Proof Key for Code Exchange (PKCE) implementation on public and single-page clients.

---

# 129. THE `nonce` PARAMETER

Verify `nonce` validation in OpenID Connect flows to prevent ID token replay attacks.

---

# 130. REDIRECT URI RESTRICTIONS

Redirect URIs must match exact, pre-registered allowlists.

---

# 131. OPEN REDIRECTS COMBINED WITH OAUTH

An open redirect on the callback domain allows attackers to exfiltrate authorization codes or tokens.

---

# 132. PERSISTENT PROVIDER IDENTIFIERS

Local user accounts must map to immutable provider subject identifiers (`sub`), never mutable display names or profile URLs.

---

# 133. EMAIL-ONLY ACCOUNT LINKING RISKS

High-risk vulnerability scenario:

```text
OAuth provider returns email
↓
backend finds local account by email
↓
automatically links
```

If the external provider does not verify email ownership, attackers can register unverified emails on the provider and hijack victim accounts.

---

# 134. VERIFIED EMAIL CLAIMS

Verify that account linking honors only cryptographically signed `email_verified: true` claims from trusted identity providers.

---

# 135. MANUAL ACCOUNT LINKING

When an authenticated user binds a new third-party provider to their profile:

verify re-authentication, CSRF state validation, and explicit confirmation.

---

# 136. ACCOUNT UNLINKING RULES

Unlinking an identity provider must never leave an account stranded without an operational authentication method.

---

# 137. IDENTITY PROVIDER COLLISION

Identical email addresses across distinct external identity providers do not constitute the same identity without an explicit trust policy.

---

# 138. SOCIAL LOGIN ACCOUNT TAKEOVER

Ensure a single external identity cannot be linked to multiple local accounts simultaneously without collision handling.

---

# 139. COMPOSITE OIDC IDENTITY KEYS

Unique user mapping must rely on the composite key:

```text
issuer + subject
```

as mandated by the OpenID Connect specification.

---

# 140. SAML IMPLEMENTATION

If SAML SSO is deployed, verify:

- XML digital signature validation
- audience restriction enforcement
- recipient URL verification
- entity ID validation
- replay prevention
- assertion expiration windows

---

# 141. SAML XML PARSER SECURITY

Audit for XML External Entity (XXE) and XML signature wrapping (XSW) vulnerabilities where custom parsers are used.

---

# 142. SAML ATTRIBUTE MAPPING

Map local accounts to immutable SAML `NameID` attributes rather than mutable email or display name fields.

---

# 143. ADMINISTRATIVE AUTHENTICATION

Administrative authentication mechanisms demand heightened scrutiny.

---

# 144. ALTERNATIVE ADMINISTRATIVE PATHWAYS

Audit for:

- specialized admin login URLs
- master passwords
- emergency bypass credentials
- support team backdoors

---

# 145. BREAK-GLASS EMERGENCY ACCOUNTS

Break-glass accounts must feature:

- extreme entropy passwords
- offline multi-party key storage
- automated real-time alert notifications upon use
- immediate credential rotation following access

---

# 146. MASTER PASSWORDS

A hardcoded or shared master password capable of authenticating any user account is a catastrophic vulnerability.

---

# 147. SUPPORT IMPERSONATION FEATURES

"Login-as-user" support tooling represents a privileged authentication pathway.

---

# 148. IMPERSONATION TOKENS

Session tokens issued during impersonation must explicitly record both the acting administrator and the target subject.

---

# 149. AUDIT TRAILS FOR IMPERSONATION

All actions performed during user impersonation sessions must be attributed to the initiating administrator in audit logs.

---

# 150. MACHINE API KEYS

If services authenticate via API keys, identify:

- key ownership
- permission scopes
- expiration dates
- revocation mechanisms
- storage hashing
- rotation workflows

---

# 151. HASHED STORAGE OF API KEYS

API keys must be stored as salted cryptographic hashes (e.g., SHA-256) to prevent exposure during database breaches.

---

# 152. FULL API KEY PRESENTATION

Full API key secrets should be displayed to users exactly once upon generation.

---

# 153. API KEY PREFIXING

Prefixes (e.g., `sk_live_`) facilitate secret scanning without compromising security.

---

# 154. API KEY SCOPING

API keys must enforce least privilege, restricting access to designated scopes rather than granting global account access.

---

# 155. IMMEDIATE API KEY REVOCATION

Revoking an API key must terminate access across all API gateways and backend instances immediately.

---

# 156. MULTIPLE AUTHENTICATION METHODS

The overall security posture of an account is bounded by its weakest enabled authentication method.

---

# 157. STRONG PASSWORDS PAIRED WITH WEAK MAGIC LINKS

Requiring a strong password with MFA provides no protection if a passwordless magic link pathway bypasses MFA entirely.

---

# 158. AUTHENTICATION METHOD DOWNGRADES

Attackers will systematically attempt the weakest legacy, mobile, or recovery pathway.

---

# 159. ACCOUNT RECOVERY ARCHITECTURE

Map every account recovery pathway:

- password reset via email
- recovery email address
- SMS recovery code
- support desk manual reset
- backup recovery codes
- secondary identity provider

---

# 160. ACCOUNT RECOVERY IS AUTHENTICATION

Recovery mechanisms grant full control over accounts and must be treated as full authentication boundaries.

---

# 161. PASSWORD RESET REQUESTS

Requesting a reset must never alter passwords or terminate active sessions prior to token redemption.

---

# 162. RESET TOKEN ENTROPY

Reset tokens must be generated using CSPRNG primitives with adequate entropy.

---

# 163. RESET TOKEN EXPIRATION

Reset tokens must expire within tight, bounded intervals.

---

# 164. ATOMIC SINGLE-USE RESET TOKENS

Reset tokens must be consumed atomically and invalidated immediately upon first use.

---

# 165. CONCURRENT RESET TOKEN REDEMPTION

Simulate two parallel reset requests using the same token.

---

# 166. MULTIPLE ACTIVE RESET TOKENS

Issuing a new password reset token should ideally invalidate all outstanding previous reset tokens for that account.

---

# 167. PASSWORD RESETS AND MFA

Does redeeming a password reset token bypass MFA requirements?

If so, the email recovery channel serves as the primary single point of failure for account takeover.

---

# 168. EMAIL ACCOUNT COMPROMISE THREAT MODEL

Password-reset-by-email inherits the security posture of the user's email provider.

This is an inherent architectural constraint, not an application code bug.

---

# 169. SUPPORT DESK RECOVERY PROCEDURES

Manual support-driven password resets are frequently vulnerable to social engineering.

If undocumented:

**SUPPORT RECOVERY PROCESS: NOT VERIFIED**

---

# 170. SECURITY QUESTIONS

Security questions provide weak authentication due to publicly researchable or easily guessable answers.

---

# 171. ACCOUNT DELETION CLEANUP

Following account deletion:

- active sessions
- refresh tokens
- API keys
- outstanding magic links

must be purged immediately.

---

# 172. ACCOUNT RESTORATION

If deleted accounts can be restored:

audit how historical credentials and sessions are handled.

---

# 173. EMAIL ADDRESS REUSE

If a new user registers an email address previously associated with a deleted account:

historical tokens and reset links must never grant access to the new account.

---

# 174. IDENTIFIER RECYCLING RISKS

Same considerations apply to recycled phone numbers and usernames.

---

# 175. BINDING TOKENS TO ACCOUNT GENERATIONS

One-time tokens should bind to a specific user account ID or account epoch counter, not merely a raw email string.

---

# 176. INVITATION TOKENS

Invitation links create accounts and establish organization memberships.

Audit invitation links with the same rigor as authentication tokens.

---

# 177. INVITATION HIJACKING

If an invitation token allows the recipient to edit the target email address during registration:

attackers can intercept and claim invitations intended for others.

---

# 178. SINGLE-USE INVITATION TOKENS

Invitation tokens must be consumed atomically upon first use.

---

# 179. EMAIL VERIFICATION TOKENS

Clicking an email verification link must not automatically log the user in unless specifically designed as a dual verification-and-login flow.

---

# 180. REUSING EMAIL VERIFICATION TOKENS

Replaying verification tokens must produce safe, idempotent responses.

---

# 181. ACTIVE DEVICE AND SESSION MANAGEMENT

If the user interface displays active logged-in devices:

verify that listed entries correspond directly to authoritative server-side session records.

---

# 182. SESSION REVOCATION INTERFACE

Clicking "Log out device" must irrevocably revoke the associated session credential on the backend.

---

# 183. NEW DEVICE LOGIN NOTIFICATIONS

Sending alert emails upon logins from unrecognized devices provides valuable defense-in-depth.

---

# 184. IP ADDRESS BINDING

Strictly binding sessions to IP addresses causes frequent false-positive logouts for mobile and VPN users.

Do not recommend IP binding automatically.

---

# 185. USER-AGENT HEADER BINDING

User-Agent headers provide weak security signals and can be trivially spoofed by attackers possessing stolen tokens.

---

# 186. DEVICE FINGERPRINTING

Carries privacy implications and high false-positive rates.

Do not recommend intrusive fingerprinting without a clear threat model.

---

# 187. RE-AUTHENTICATION FOR SENSITIVE ACTIONS

High-value operations should mandate recent re-authentication:

- updating passwords
- disabling MFA
- updating payout bank details
- generating administrative API keys

---

# 188. STALE SESSIONS EXECUTING PRIVILEGED ACTIONS

Allowing a long-lived stolen session to disable MFA or change account credentials without re-authentication facilitates account takeover persistence.

---

# 189. RE-AUTHENTICATION METHODS

Re-authentication can require:

- password re-entry
- fresh MFA challenge
- WebAuthn biometric assertion

---

# 190. REMEMBERED MFA DURING RE-AUTHENTICATION

A "remembered device" cookie must not bypass mandatory step-up re-authentication on high-risk operations.

---

# 191. CONCURRENT SESSION LIMITS

Enforcing limits on simultaneous active sessions is an optional enterprise policy, not a universal security mandate.

---

# 192. SESSION LIST IDOR

Users must never be able to terminate or inspect other users' active sessions by manipulating session identifiers.

---

# 193. SESSION TOKENS IN APPLICATION LOGS

Search for tokens leaking into:

- web server access logs
- query parameters
- request headers
- error monitoring payloads

---

# 194. AUTHORIZATION HEADER REDACTION

Ensure HTTP logging middleware redacts `Authorization: Bearer ...` headers.

---

# 195. COOKIE HEADER REDACTION

Ensure logging frameworks sanitize sensitive session cookie values.

---

# 196. THIRD-PARTY ERROR TRACKING

Error reporting platforms (e.g., Sentry) must sanitize request environments to avoid capturing credentials.

---

# 197. DISTRIBUTED TRACE ATTRIBUTES

Ensure OpenTelemetry tracing spans do not include passwords or raw authentication tokens.

---

# 198. CLIENT-SIDE TELEMETRY LEAKAGE

Frontend analytics tools must be audited to ensure they do not capture session tokens.

---

# 199. SERVICE WORKERS AND CACHING

Service workers must not cache authenticated API responses containing sensitive credentials.

---

# 200. BROWSER CACHING OF AUTHENTICATED RESPONSES

Authentication responses must include strict cache prevention headers (`Cache-Control: no-store, private`).

---

# 201. THIRD-PARTY SCRIPTS ON AUTHENTICATION PAGES

Loading third-party analytics or tracking scripts on password reset or magic link pages risks token leakage.

---

# 202. SANITIZING TOKENS FROM THE BROWSER URL

Single-page applications should strip authentication tokens from the URL bar via `history.replaceState` immediately upon consumption.

---

# 203. LOGIN CSRF

In cookie-authenticated applications:

attackers can forge login requests, tricking victim browsers into logging into attacker-controlled accounts.

---

# 204. LOGOUT CSRF

Typically low severity, though it causes user disruption and denial of service.

---

# 205. ACCOUNT LINKING CSRF

Severe vulnerability where an attacker tricks a victim into linking the attacker's third-party OAuth profile to the victim's account.

---

# 206. OAUTH CALLBACK CSRF

Mitigated by validating the cryptographically random `state` parameter upon return from the identity provider.

---

# 207. CROSS-TAB TOKEN REFRESH RACES

Multiple browser tabs simultaneously triggering token refresh can cause rotation false positives.

Verify client-side concurrency handling.

---

# 208. MOBILE CREDENTIAL STORAGE

On mobile clients:

verify usage of platform-secure storage primitives (iOS Keychain, Android Keystore / EncryptedSharedPreferences).

---

# 209. DESKTOP CREDENTIAL STORAGE

On desktop applications:

verify integration with operating system credential managers (Windows Credential Manager, macOS Keychain).

---

# 210. CLI TOOL CREDENTIAL STORAGE

Ensure command-line interfaces restrict access permissions on configuration and credential files (e.g., `chmod 600`).

---

# 211. SERVER-SIDE OAUTH CLIENT SECRETS

OAuth client secrets must never be embedded in public mobile applications or single-page browser clients.

---

# 212. PUBLIC OAUTH CLIENT ARCHITECTURE

Public clients cannot securely maintain client secrets and must utilize PKCE.

---

# 213. CLIENT SECRETS EXPOSED IN FRONTEND BUNDLES

Hardcoding client secrets in client-side JavaScript indicates a fundamental architectural misunderstanding.

---

# 214. DYNAMIC CALLBACK HOST GENERATION

Never construct security-sensitive OAuth callback or password reset URLs directly from untrusted client `Host` headers.

---

# 215. TRUSTED REVERSE PROXY CONFIGURATION

Authentication components evaluating client IP, scheme, or host must rely on verified reverse proxy configurations.

---

# 216. SECURE COOKIES BEHIND REVERSE PROXIES

Misconfigured proxy trust can trick backends into believing connections are plaintext HTTP, suppressing `Secure` cookie flags.

---

# 217. ORIGIN VALIDATION

OAuth, WebAuthn, and anti-CSRF routines depend on validating exact, expected browser origins.

---

# 218. MULTI-DOMAIN AUTHENTICATION

If a single authentication system spans multiple domains:

map cookie scoping, CORS trust, and token delegation rules carefully.

---

# 219. CROSS-ENVIRONMENT IDENTITY ISOLATION

Staging credentials and tokens must never be valid in production environments due to:

- shared JWT signing secrets
- missing issuer/audience boundaries
- shared session databases

---

# 220. CROSS-ENVIRONMENT TOKEN REPLAY

Classified as P0/P1 depending on the scope of production access granted.

---

# 221. DEFAULT DEVELOPMENT SECRETS IN PRODUCTION

Falling back to hardcoded default development secrets when production environment variables are missing is a critical vulnerability.

---

# 222. FAIL-OPEN AUTHENTICATION LOGIC

Vulnerability pattern:

```text
auth provider unavailable
↓
catch error
↓
continue as authenticated/default user
```

Classified as P0/P1 Critical.

---

# 223. CACHE LOOKUP FAIL-OPEN

Failing to resolve a session in a degraded cache store must result in denied access, never authenticated access.

---

# 224. HANDLING DELETED USERS WITH VALID TOKENS

Establish behavior when a cryptographically valid token references a user ID that has been purged from the database.

---

# 225. JUST-IN-TIME (JIT) USER PROVISIONING

If SAML or OIDC automatically provisions new user accounts on first login:

verify:

- domain allowlists
- assigned default tenant
- assigned default roles
- identity verification requirements

---

# 226. PRIVILEGED DEFAULT ROLES

Newly provisioned federated users must never default to administrative roles.

---

# 227. CORPORATE EMAIL DOMAIN ALLOWLISTING

B2B platforms restricting access to specific corporate domains must perform robust domain parsing, not naive string suffix matching.

---

# 228. CONCURRENT JIT PROVISIONING RACES

Simulate two simultaneous first-time logins for the same federated identity to ensure race-free account creation.

---

# 229. DUPLICATE FEDERATED USER MAPPINGS

Enforce unique database constraints on composite provider issuer and subject identifiers.

---

# 230. SESSION STATE DESERIALIZATION

If session stores serialize user roles and permissions:

verify how updates to permissions invalidate cached session snapshots.

---

# 231. PER-REQUEST USER DATABASE LOOKUPS

Querying the user profile from the database on every request enables immediate revocation, but increases database load.

---

# 232. USER PROFILE CACHING

Ensure cached user security attributes are refreshed promptly when account statuses change.

---

# 233. TRUSTING CLIENT-SUPPLIED USER CLAIMS

Frontend-provided user profile objects must never serve as authorization authorities.

---

# 234. UNSAFE AUTHENTICATION CONTEXT OVERRIDES

Audit for dangerous patterns:

```text
req.user = body.user
```

or unsafe object merging that allows clients to overwrite server-assigned user context.

---

# 235. TRUSTED IDENTITY HEADERS

Headers conveying authenticated identities (`X-User-Id`) must be accepted only when originating from trusted internal API gateways.

---

# 236. DIRECT ORIGIN ACCESS WITH AUTHENTICATION SPOOFING

If external attackers can bypass the API gateway and hit the backend directly, they can inject arbitrary identity headers.

---

# 237. PRE-AUTHENTICATION STATE ENTITIES

MFA challenge sessions and password reset tokens represent sensitive resources requiring authorization boundaries.

---

# 238. CHALLENGE IDENTIFIER IDOR

Users must not be able to interact with or verify challenges belonging to other accounts.

---

# 239. CHALLENGE IDENTIFIER ENTROPY

Challenge IDs that serve as authorization proofs must be cryptographically unguessable.

---

# 240. BINDING CHALLENGES TO SESSIONS

If challenge IDs are predictable, they must be cryptographically bound to an established pre-authentication session.

---

# 241. RACE CONDITIONS IN TOKEN CONSUMPTION

Single-use credentials must be consumed using atomic database operations.

---

# 242. CHECK-THEN-MARK-USED VULNERABILITY

Vulnerable pattern:

```text
if token unused
↓
perform action
↓
mark used
```

permits concurrent execution races.

---

# 243. ATOMIC TOKEN INVALIDATION

Execute token verification and invalidation in a single atomic database update or transaction.

---

# 244. ATOMIC EXPIRATION CHECKS

Expiration and state checks must form an integral part of the atomic consumption transaction.

---

# 245. TOKEN BRUTE-FORCE CALCULATIONS

Mathematical risk is a function of token entropy, rate-limiting thresholds, and token lifetime.

---

# 246. UUID TOKEN ENTROPY

UUIDv4 provides adequate entropy; UUIDv1 (timestamp-based) is predictable and insecure for authentication tokens.

---

# 247. NUMERIC RESET TOKENS

Short numeric codes used for password resets represent extreme takeover risks without strict attempt limits.

---

# 248. SHORT CODE MITIGATIONS

Codes shorter than 8 alphanumeric characters mandate aggressive, permanent rate-limiting lockouts.

---

# 249. TIMING ATTACKS

Do not report microsecond timing variations without demonstrable, practical network exploitation proof.

---

# 250. CONSTANT-TIME COMPARISONS

Mandatory when comparing cryptographic signatures, HMAC digests, and secret tokens in code.

---

# 251. INVENTORY AUTHENTICATION TESTS

Examine test coverage:

- login test suites
- token issuance tests
- token refresh tests
- password reset tests
- MFA validation tests
- OAuth handshake tests
- session invalidation tests
- negative test cases

---

# 252. HAPPY PATH TESTING IS INSUFFICIENT

A test proving:

```text
correct password -> success
```

does not demonstrate authentication security.

---

# 253. INVALID PASSWORD TEST COVERAGE

---

# 254. NON-EXISTENT ACCOUNT TEST COVERAGE

---

# 255. RATE-LIMITING AND LOCKOUT TEST COVERAGE

---

# 256. SESSION FIXATION TEST COVERAGE

Verify session ID changes between pre-auth and post-auth states.

---

# 257. LOGOUT INVALIDATION TEST COVERAGE

Capture a session token, execute logout, and verify that the token is rejected on subsequent calls.

---

# 258. PASSWORD CHANGE SESSION REVOCATION TEST COVERAGE

Verify existing credentials against intended revocation policies following password changes.

---

# 259. REFRESH TOKEN ROTATION TEST COVERAGE

Verify that redeemed refresh tokens are immediately rejected.

---

# 260. CONCURRENT REFRESH TEST COVERAGE

Submit two refresh calls simultaneously.

---

# 261. RESET TOKEN REUSE TEST COVERAGE

Attempt to reuse a password reset token after a successful reset.

---

# 262. CONCURRENT RESET TOKEN TEST COVERAGE

Submit two password reset requests simultaneously using the same token.

---

# 263. MAGIC LINK REUSE TEST COVERAGE

---

# 264. OTP GUESS LIMIT TEST COVERAGE

---

# 265. OTP RESEND BYPASS TEST COVERAGE

---

# 266. MFA BYPASS MATRIX

For every login, refresh, and recovery flow, ask:

> Does this pathway issue a fully authenticated session without satisfying MFA?

---

# 267. ROLE REVOCATION TEST COVERAGE

Revoke an administrative role and test whether active sessions or tokens retain administrative capabilities.

---

# 268. SUSPENDED USER TEST COVERAGE

---

# 269. CROSS-ENVIRONMENT TOKEN REPLAY TEST COVERAGE

Test staging tokens against production verification keys.

---

# 270. OAUTH STATE VALIDATION TEST COVERAGE

Verify rejection of OAuth callbacks missing or presenting invalid `state` parameters.

---

# 271. OAUTH ACCOUNT LINKING TEST COVERAGE

Verify account linking behavior when attacker provider accounts present victim email addresses.

---

# 272. FINDING FORMAT

Every significant finding must include:

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

Use:

## P0 - CRITICAL

- unauthenticated arbitrary account takeover at scale
- token forgery resulting from exposed global signing secrets
- complete authentication bypass
- cross-environment trust relationships granting unauthorized production access

## P1 - HIGH

- practical account takeover vulnerabilities
- password reset, magic link, or MFA bypasses
- session persistence surviving explicit logout or password change
- exploitable OAuth/OIDC account linking flaws
- privileged administrative authentication routes featuring weaker protections than standard user routes

## P2 - MEDIUM

- meaningful authentication defects requiring specific preconditions
- limited session persistence issues
- constrained account enumeration or recovery weaknesses
- moderate MFA implementation defects

## P3 - LOW

- minor authentication telemetry leakage
- edge-case vulnerabilities requiring complex prerequisites
- minor session hygiene gaps

## P4 - HARDENING

- defense-in-depth hardening opportunities without confirmed exploit paths

---

# 274. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

source code, configuration, or test suites directly demonstrate the bypass or takeover path.

MEDIUM:

strong static code evidence exists, but identity provider or browser runtime behavior is partially unverified.

LOW:

depends on unverified third-party identity provider contract specifications.

---

# 275. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 276. CATEGORIES

Classify:

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

# 277. EVIDENCE TIERS

Use:

```text
A - reproduced in controlled environment
B - complete executable code path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 278. FALSE-POSITIVE PREVENTION

Before reporting P0/P1/P2 findings, verify:

1. endpoint reachability
2. credential verification logic
3. authentication middleware coverage
4. identity provider contracts
5. token and session storage architectures
6. revocation pathways
7. client-side execution flows
8. concurrency handling
9. automated test coverage
10. production deployment configurations

---

# 279. DO NOT REPORT LONG SESSIONS AS VULNERABILITIES ON THEIR OWN

Risk depends on:

- application sensitivity
- revocation mechanisms
- MFA requirements
- secure storage models
- product UX requirements

---

# 280. DO NOT REPORT JWT USAGE AS AN INHERENT FLAW

The vulnerability must lie in:

- broken signature verification
- compromised keys
- unvalidated claims
- excessive token lifetimes
- missing revocation semantics

---

# 281. DO NOT REPORT LOCALSTORAGE USAGE REFLEXIVELY

Must be evaluated alongside a demonstrable XSS threat model and token lifespan constraints.

---

# 282. DO NOT MANDATE MFA FOR EVERY SYSTEM

Classify as P4 Hardening unless business risk or compliance explicitly mandates second factors.

---

# 283. DO NOT REQUIRE CALENDAR-BASED PASSWORD ROTATION

Periodic password expiration offers negligible security benefits while encouraging weaker, predictable passwords.

---

# 284. DO NOT DEMAND ARBITRARY PASSWORD COMPLEXITY RULES

Focus on passphrase length, robust hashing algorithms, brute-force defenses, and credential stuffing screening.

---

# 285. DO NOT MANDATE PERMANENT ACCOUNT LOCKOUT WITHOUT DOS EVALUATION

Attackers exploit aggressive lockouts to deny service to legitimate users.

---

# 286. DO NOT DEMAND MIGRATION TO NEW AUTH PROVIDERS

If the existing authentication architecture can be configured securely, avoid recommending vendor migrations.

---

# 287. DO NOT MODIFY CODE

During the audit:

- do not reset user passwords
- do not revoke active sessions
- do not rotate signing keys
- do not alter MFA configurations
- do not modify OAuth settings
- do not change cookie policies

Complete the investigation first.

---

# 288. OUTPUT - AUTHENTICATION_SECURITY_AUDIT.md

Structure the final report:

## 1. Executive Summary

- authentication methods deployed
- session and token architecture overview
- account recovery model
- top account takeover risks
- evidence quality assessment

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

If applicable.

## 17. OAuth / OIDC Audit

If applicable.

## 18. SAML Audit

If applicable.

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

# 294. SECOND PASS - SESSION FIXATION ATTACKS

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

Verify whether session IDs actively rotate upon login.

---

# 295. SECOND PASS - LOGOUT ATTACK SIMULATION

Capture an active session token.

Execute logout.

Attempt to use the captured credential again.

---

# 296. SECOND PASS - PASSWORD CHANGE CREDENTIAL VALIDATION

Capture:

- active session cookie
- access token
- refresh token

Change the account password.

Verify the status of each existing credential against intended security policies.

---

# 297. SECOND PASS - SUSPENDED ACCOUNT AUDIT

Suspend or delete a test account.

Verify whether existing credentials continue to authenticate successfully.

---

# 298. SECOND PASS - ROLE REVOCATION AUDIT

Remove an administrative role from an active account.

Test whether existing access tokens or session claims continue executing administrative actions.

---

# 299. SECOND PASS - CONCURRENT REFRESH TOKEN REDEMPTION

Dispatch identical refresh tokens concurrently across two requests.

Determine:

- how many new token pairs are minted
- whether reuse detection triggers
- whether legitimate users are locked out inadvertently

---

# 300. SECOND PASS - CONCURRENT PASSWORD RESET REDEMPTION

Dispatch identical password reset tokens across two simultaneous requests.

Only one request must succeed if the token is single-use.

---

# 301. SECOND PASS - MAGIC LINK REPLAY

Click the magic link:

```text
first browser
second browser
after success
after expiry
```

---

# 302. SECOND PASS - OTP BRUTE-FORCE SIMULATION

Verify:

- submission of invalid codes up to the attempt ceiling
- resend behavior
- challenge rotation
- invalidation of superseded codes
- concurrent correct submissions

---

# 303. SECOND PASS - SYSTEMATIC MFA BYPASS DISCOVERY

Trace every authentication and recovery pathway to the point of session issuance.

Ask:

> Were second-factor verification checks enforced prior to this milestone?

---

# 304. SECOND PASS - OAUTH ACCOUNT LINKING EXPLOITATION

Test scenarios involving:

- matching email addresses
- unverified provider emails
- distinct external issuers
- pre-existing local accounts
- colliding external identities

---

# 305. SECOND PASS - CROSS-ENVIRONMENT TOKEN REPLAY

Attempt to authenticate against production verifiers using staging tokens, or audit:

- shared signing keys
- issuer validation
- audience validation
- session database namespaces

---

# 306. SECOND PASS - TOKEN TYPE INTERCHANGEABILITY

Attempt to use:

- an ID token as an API access token
- a refresh token as an API access token
- service A access tokens against service B

---

# 307. SECOND PASS - TRUSTED GATEWAY IDENTITY HEADERS

If upstream gateways inject authenticated user headers:

verify whether external attackers can spoof headers via direct origin access.

---

# 308. SECOND PASS - RECOVERY PATHWAY RESISTANCE

Ask:

> What is the weakest operational pathway through which an attacker can obtain a valid authenticated session?

This defines the true security perimeter of the identity system.

---

# 309. SECOND PASS - LEGACY AUTHENTICATION ROUTE AUDIT

Compare security controls across:

- v1 endpoints
- v2 endpoints
- web clients
- mobile endpoints
- administrative portals

---

# 310. SECOND PASS - CREDENTIAL EXPOSURE AUDIT

Perform repository-wide searches to confirm whether:

- passwords
- session identifiers
- access tokens
- refresh tokens
- reset tokens

are leaked into:

- URL strings
- server access logs
- third-party analytics
- error monitoring platforms

---

# 311. FINAL QUALITY GATE

Before finalizing the audit report, confirm:

- all authentication methods are fully inventoried
- the weakest recovery pathway was analyzed
- authentication is strictly distinguished from authorization
- password storage algorithms were confirmed against real libraries
- session fixation protections were verified
- logout and revocation mechanics were tested against real credentials
- password change session invalidation was audited
- suspended and deleted user credentials were evaluated
- JWT signatures are cryptographically verified, not merely decoded
- issuer, audience, and token type discriminators were validated
- cross-environment staging-to-production trust was evaluated
- refresh token rotation, concurrency, and reuse detection were audited
- magic links, resets, and OTPs were analyzed for entropy, lifespan, and single-use enforcement
- MFA was audited across all secondary pathways, not merely the primary login form
- account recovery was evaluated with the same rigor as direct login
- OAuth account linking requires explicit cryptographic proof of email ownership
- unverified provider email claims are never trusted implicitly
- administrative, support, and break-glass authentication routes were audited
- credentials are not leaked via access logs, URLs, or analytics
- one-time credential race conditions were evaluated
- P4 hardening proposals are kept separate from confirmed takeover vulnerabilities
- every P0/P1 finding details a complete, actionable attack path with clear preconditions

---

# FINAL RULE

Do not deliver a report that merely states:

> Enable MFA, use secure cookies, and use short-lived JWT tokens.

That is not an authentication security audit.

Look for real issues such as:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

These are the authentication security defects you must uncover.

Think through:

- proof of identity
- credential enrollment
- secure credential storage
- session token issuance
- session revocation
- account recovery
- multi-factor authentication
- external provider trust
- token reuse
- concurrency races
- weakest alternative pathways

For every significant finding, you must be able to answer:

> What credential does the attacker possess prior to the attack?

> What security check do they bypass?

> What exact endpoint or authentication flow do they exploit?

> At what exact point does the server decide identity is confirmed?

> What credential do they receive as a result?

> Does a password change, logout, or MFA reset terminate the attacker's access?

> Does the same vulnerability exist across legacy, mobile, or recovery pathways?

If third-party identity provider contracts are unverified:

**PROVIDER IDENTITY CONTRACT NOT VERIFIED.**

If an observation is simply defense-in-depth without an actionable takeover path:

**P4 - HARDENING.**

It is better to discover 5 genuine account-takeover, token-forgery, or MFA-bypass vulnerabilities than to produce 100 generic authentication rules.

The ultimate objective is a forensically rigorous authentication security audit that translates directly into:

- authentication regression test suites
- session rotation fixes
- cryptographic token verification corrections
- credential revocation improvements
- MFA bypass closures
- account recovery hardening
- OAuth/OIDC identity linking repairs
- production account-takeover defenses
