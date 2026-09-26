---
id: UPL-IT-036
number: 36
slug: file-upload-security-audit
title: File Upload Security Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Cybersecurity
subcategory_id: cybersecurity
language: en
version: 1.0.1
status: stable
---

# FILE UPLOAD SECURITY AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of the application's entire file upload system, from the moment a file leaves the client to its:

- ingestion
- parsing
- validation
- temporary staging
- permanent storage
- post-processing
- previewing
- downloading
- public serving
- deletion
- archiving

Main goal:

> Determine whether an attacker can upload a file that bypasses validation, executes active content under the application origin, overwrites or reads local files, triggers parser exploits, SSRF, Zip Slip, decompression bombs, storage exhaustion, malware distribution, cross-user/cross-tenant data access, or other concrete security failures.

This is not:

- generic advice to check MIME types
- an automatic demand for antivirus scanning on every upload
- an automatic ban on SVG, PDF, or ZIP files
- assuming file extensions dictate actual file types
- assuming magic bytes solve all validation problems
- automatically migrating everything to object storage
- merely a path traversal audit
- merely a malware audit
- merely a file size limit audit
- automatically declaring every user-uploaded file an RCE risk

The focus is on the complete lifecycle:

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

Priority:

**arbitrary code execution > arbitrary file write/read > active content under trusted origin > parser exploitation > cross-user/cross-tenant exposure > SSRF/path traversal > archive attacks > storage/resource abuse > malware distribution > hardening**

It is better to identify 5 real, exploitable upload failures than to write 100 generic file security recommendations.

---

# 1. INVENTORY ALL UPLOAD SURFACES

Locate every upload workflow:

- avatars
- profile images
- attachments
- documents
- invoices
- CSV imports
- ZIP imports
- backup restores
- media uploads
- videos
- audio
- PDFs
- spreadsheets
- office documents
- admin imports
- webhook-attached files
- API bulk uploads

For each, document:

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

# 2. DO NOT EXAMINE ONLY `multipart/form-data`

Uploads can arrive via:

- multipart forms
- raw binary request bodies
- base64 JSON payloads
- presigned object storage uploads
- chunked uploads
- remote URL imports
- drag-and-drop frontend interfaces
- direct mobile uploads
- archive imports

---

# 3. MAP THE ACTUAL EXECUTION FLOW

For each upload feature, diagram:

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

# 4. IDENTIFY TRUST BOUNDARIES

Differentiate:

```text
browser/client input
server parser
local filesystem
object storage
third-party processor
public CDN
```

Every boundary alters the underlying threat model.

---

# 5. ORIGINAL FILE NAMES

The original filename is attacker-controlled input.

Never treat it as a trusted filesystem path.

---

# 6. SERVER-GENERATED FILE NAMES

Prefer server-generated:

- UUIDs
- random cryptographic identifiers
- content-addressed storage keys

where architecture allows.

Original filenames can be retained as metadata.

---

# 7. PATH TRAVERSAL

Test relevant traversal sequences:

```text
../../file
..\..\file
```

and platform-specific encodings where the runtime permits.

---

# 8. ABSOLUTE PATHS

Test:

```text
/etc/passwd
C:\Windows\...
\server\share
```

strictly within a controlled test environment.

---

# 9. PATH NORMALIZATION

Verify the execution order:

```text
decode
normalize
validate
join
```

---

# 10. DOUBLE DECODING

Classic bypass pattern:

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

Relevant only if the stack genuinely performs multiple decoding passes.

---

# 11. PREFIX CHECKS

Naive checks like:

```text
resolved.startsWith(base)
```

can be flawed without canonical path separator semantics.

---

# 12. WINDOWS PATHS

If the server can run on Windows:

inspect:

- `\`
- drive letters
- UNC paths
- reserved device names
- alternate path separators

---

# 13. RESERVED NAMES

On Windows:

```text
CON
PRN
AUX
NUL
COM1
LPT1
```

can trigger platform edge cases.

Severity scaled strictly to real impact.

---

# 14. FILENAME LENGTH

Extremely long filenames can:

- crash filesystems
- overflow database columns
- break loggers
- distort UI layouts

Enforce bounded maximum lengths.

---

# 15. UNICODE FILENAMES

Normalization and confusable issues can trigger:

- duplicate file overwrites
- extension confusion
- moderation bypasses

Report only with demonstrable security impact.

---

# 16. NULL BYTES

Historically:

```text
file.php%00.jpg
```

Modern runtimes predominantly block this.

Do not report without concrete library or runtime verification.

---

# 17. EXTENSION VALIDATION

Client-provided extensions do not prove actual file type.

---

# 18. CASE VARIATIONS

```text
.PHP
.JpG
.SvG
```

If validation routines perform case-sensitive comparisons.

---

# 19. MULTIPLE EXTENSIONS

Examples:

```text
shell.php.jpg
invoice.pdf.exe
```

---

# 20. TRAILING DOTS AND SPACES

Certain filesystems normalize:

```text
file.php.
file.php 
```

Verify only on relevant operating systems.

---

# 21. MIME TYPES

The multipart `Content-Type` header is attacker-controlled.

Never treat it as authoritative.

---

# 22. MAGIC BYTES

Can assist in identifying known file signatures.

However:

> Magic bytes are not a universal defense against polyglot or active content files.

---

# 23. POLYGLOT FILES

A file can be simultaneously valid across multiple formats.

Examples:

- image structures containing executable scripts
- archive headers wrapping executable binaries

Report only where serving or processing contexts enable exploitation.

---

# 24. FILE SIGNATURE LIBRARIES

If employing type detection libraries:

inspect:

- library version
- supported formats
- fallback handling

---

# 25. UNKNOWN TYPES

Ask:

> What happens if type detection returns unknown?

Unknown types must never be allowed by default.

---

# 26. ALLOWLISTS

For high-risk uploads, explicitly allowing required types is vastly superior to attempting to blacklist malicious formats.

---

# 27. BLACKLISTS

If an implementation merely blocks:

```text
.exe
.php
.js
```

an attacker may leverage other active formats.

---

# 28. FILE TYPES MUST MATCH THE USE CASE

Avatars:

```text
JPEG/PNG/WebP
```

must enforce a much narrower allowlist than general attachment systems.

---

# 29. FILE SIZES

Enforce limits across multiple layers:

- reverse proxies
- application body parsers
- business logic validators
- object storage configurations

---

# 30. CLIENT-SIDE LIMITS ARE NOT SECURITY CONTROLS

Frontend `maxSize` guards are insufficient.

Backend and storage layers must enforce constraints.

---

# 31. REQUEST BODY LIMITS

Unbounded request bodies can exhaust server memory prior to business validation.

---

# 32. PER-FILE LIMITS

---

# 33. PER-REQUEST TOTAL LIMITS

Ten 100 MB files are not equivalent to a single 100 MB upload.

---

# 34. FILE COUNT LIMITS

Uploading 100,000 tiny files can cause resource denial of service.

---

# 35. CONCURRENT UPLOAD LIMITS

A single user opening excessive concurrent upload connections.

---

# 36. ACCOUNT AND TENANT STORAGE QUOTAS

Per-request limits alone do not prevent cumulative storage exhaustion.

---

# 37. GLOBAL STORAGE CAPACITY

If utilizing local storage:

audit disk full failure behaviors.

---

# 38. TEMPORARY STORAGE

Multipart parsers may buffer incoming files in:

- system RAM
- temporary disk paths

before validation logic executes.

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
OOM crash
```

---

# 40. STREAMING

Streaming mitigates memory exhaustion.

However, it does not inherently solve:

- malicious content ingestion
- total storage consumption
- incomplete partial uploads

---

# 41. TEMPORARY FILE CLEANUP

On:

- successful completion
- validation failure
- unhandled exceptions
- client disconnections

temporary files must be reliably purged.

---

# 42. ORPHANED TEMPORARY FILES

Repeated failed uploads can silently exhaust disk space.

---

# 43. PARTIAL UPLOADS

A client drops connection mid-stream.

Determine:

- what data remains on disk
- whether temporary files persist
- whether metadata falsely flags the upload as complete

---

# 44. CHUNKED UPLOADS

If supported:

map:

```text
init
↓
chunks
↓
complete
```

---

# 45. CHUNK OWNERSHIP

An attacker must not be able to append chunks to another user's upload session.

---

# 46. CHUNK ORDERING

Out-of-order or duplicate chunks can corrupt assembled files.

---

# 47. CHUNK SIZES

Every individual chunk must be bounded by size limits.

---

# 48. TOTAL CHUNKED SIZE

Prevent cumulative bypasses:

```text
per chunk < limit
```

where:

```text
10,000 chunks
```

exceed total storage limits.

---

# 49. UPLOAD SESSION IDENTIFIERS

If possessing a session token confers write permissions:

it must be cryptographically unguessable or bound to user authentication.

---

# 50. FINALIZE RACE CONDITIONS

Concurrent finalization requests must not produce duplicate metadata records or duplicated side effects.

---

# 51. PRESIGNED UPLOADS

If clients upload directly to cloud object storage:

audit the endpoint generating presigned credentials.

---

# 52. PRESIGNED URL SCOPING

Inspect:

- target bucket
- object key restrictions
- permitted HTTP methods
- expiration duration
- content constraints where applicable

---

# 53. ARBITRARY OBJECT KEYS

Users must never be able to request signed PUT operations for:

```text
another-user/file
system/config
```

---

# 54. OVERWRITE PERMISSIONS

If PUT requests against existing objects are permitted:

verify strict object-level authorization.

---

# 55. CREATE-ONLY SEMANTICS

If a user is only authorized for new uploads, the presigned flow should enforce create-only semantics to the extent supported by storage APIs.

---

# 56. PRESIGNED URL EXPIRATION

Must not exceed reasonable use case requirements.

Do not mandate an arbitrary expiration duration.

---

# 57. CONTENT-TYPE IN PRESIGNED URLS

If signature binding enforces a content type:

ensure backend verification does not blindly trust that client assertion later.

---

# 58. POST-UPLOAD VALIDATION

Direct storage uploads often require subsequent server-side validation or processing before the file is marked trusted or public.

---

# 59. QUARANTINE STATES

Potential lifecycle states:

```text
UPLOADED
↓
SCANNING/VALIDATING
↓
READY
```

Do not introduce if unneeded, but audit if present.

---

# 60. FILES BECOMING PUBLIC BEFORE VALIDATION

High-signal vulnerability for active and malicious content.

---

# 61. STORAGE LOCATIONS

Determine:

- local web root
- local non-web directory
- private cloud bucket
- public cloud bucket
- CDN distribution

---

# 62. WEB ROOT PLACEMENT

If uploaded files land directly inside directories where the web server executes or serves application code:

critical risk.

---

# 63. SERVER-SIDE CODE EXECUTION

Most dangerous scenario:

```text
upload .php/.jsp/.aspx/etc
↓
web server interprets file as executable code
```

valid only if the specific server and runtime environment can execute it.

---

# 64. STATIC FILE SERVERS

A Node.js or static server may merely return `.php` files as raw binary bytes.

Do not report RCE if the server lacks an execution interpreter.

---

# 65. FILE SERVING ORIGINS

Ask:

> From which origin does the browser retrieve user-uploaded files?

---

# 66. SAME-ORIGIN SERVING

Active content served directly from:

```text
https://app.example.com
```

carries far greater impact than serving from an isolated untrusted domain.

---

# 67. DEDICATED FILE DOMAINS

Significantly mitigates XSS and origin compromise risks.

P4/P2 depending on actual active content exposure.

---

# 68. HTML UPLOADS

If users can upload HTML files and open them inline under the application origin:

immediate stored XSS and account takeover candidate.

---

# 69. SVG FILES

SVG files can contain executable scripts and external entity references.

---

# 70. SVG `<script>` TAGS

The rendering and embedding context determines whether script execution occurs.

---

# 71. SVG `<foreignObject>` TAGS

Can encapsulate arbitrary HTML markup.

---

# 72. SVG EXTERNAL RESOURCES

Can trigger client-side tracking, privacy leaks, or server-side SSRF if backend parsers fetch references.

---

# 73. SVG SANITIZATION

If SVG uploads must be supported:

verify robust sanitization routines, not mere XML parsing.

---

# 74. PDF FILES

PDF files can embed:

- links
- form actions
- attached files
- JavaScript in certain viewer engines

Severity depends on the target viewer and serving configuration.

---

# 75. PDF PREVIEWERS

If the application utilizes embedded or custom PDF viewers:

evaluate their sandbox boundaries and security configurations.

---

# 76. OFFICE DOCUMENTS

May contain:

- macros
- external OLE links
- embedded payloads

If the application only stores and serves downloads, server execution is not automatically an issue.

---

# 77. MALWARE DISTRIBUTION

If users share uploaded attachments with one another:

malware distribution risks become highly relevant.

---

# 78. MALWARE SCANNING

Do not mandate antivirus scanning for every application.

Evaluate:

- user-to-user sharing patterns
- enterprise threat profile
- permitted file types
- exposure to untrusted parties

---

# 79. SCANNING WORKFLOW

If antivirus scanning is implemented:

map:

```text
uploaded
↓
scan
↓
clean / infected / failed
```

---

# 80. SCANNER OUTAGES

If the scanning engine becomes unavailable:

determine behavior:

- fail closed
- queue for retry
- fail open

Evaluated against business risk.

---

# 81. PUBLICATION BEFORE SCANNING

Infected files must not become downloadable if the security model mandates scanning prior to release.

---

# 82. PARSER ATTACK SURFACES

Inventory all backend media processing utilities:

- ImageMagick
- FFmpeg
- ExifTool
- PDF rendering libraries
- LibreOffice/headless office tools
- archive extraction libraries
- OCR engines
- media metadata extractors

---

# 83. PARSERS ARE TRUST BOUNDARIES

Validating file extensions does not render parser input trusted.

---

# 84. IMAGE DECODING

Attacker-controlled image decoders expose memory safety, CPU exhaustion, and third-party dependency vulnerabilities.

---

# 85. IMAGE DIMENSIONS

A small compressed image can decompress into a massive in-memory raw bitmap.

Example:

```text
50,000 × 50,000 pixels
```

---

# 86. PIXEL DIMENSION LIMITS

Often more critical than raw file size limits.

---

# 87. IMAGE DECOMPRESSION BOMBS

Verify decoding library safeguards and dimension caps.

---

# 88. EXIF METADATA

Metadata structures can contain:

- oversized attribute blocks
- attacker-crafted strings
- sensitive GPS coordinates and PII

---

# 89. EXIF OUTPUT HANDLING

If extracted metadata flows into HTML, logs, or database queries:

it acts as untrusted second-order input.

---

# 90. EXIF STRIPPING

Privacy hardening for public images where desirable.

Not a universal vulnerability requirement.

---

# 91. VIDEO FILES

FFmpeg-based processing represents a high-value untrusted parser attack surface.

---

# 92. VIDEO DURATION

A small file can entail extremely complex or lengthy transcoding operations.

---

# 93. TRANSCODING RESOURCE LIMITS

Enforce:

- CPU limits
- memory ceilings
- maximum execution time
- worker concurrency
- processing timeouts

---

# 94. AUDIO FILES

Same transcoding and parser constraints apply.

---

# 95. DOCUMENT CONVERSION

Office and PDF conversion pipelines can expose:

- shell execution risks
- filesystem access
- parser crashes
- macro execution
- outbound network requests

---

# 96. SANDBOXED PROCESSING

For high-risk untrusted parsers, evaluate:

- isolated worker processes
- container sandboxing
- restricted OS permissions
- network isolation

Do not automatically demand full sandboxing unless justified by the threat profile.

---

# 97. PARSER NETWORK ACCESS

Critical question:

> Can the file parser initiate outbound network requests during processing?

---

# 98. FILE-BASED SSRF

Documents, images, or SVGs referencing:

```text
http://internal-service
```

If server-side parsers resolve external references:

SSRF vulnerability.

---

# 99. PDF/HTML RENDERING SSRF

If uploaded documents or HTML are processed via headless browsers:

verify strict isolation from internal network resources.

---

# 100. LOCAL FILE REFERENCES

Parsers may support:

```text
file://
```

or relative local filesystem paths.

---

# 101. XXE

If uploads include XML, SVG, or XML-based office formats:

verify parser external entity resolution settings.

---

# 102. ZIP AND ARCHIVE FILES

Inventory:

- ZIP
- TAR
- GZ
- 7z
- RAR

if decompressed on the server.

---

# 103. ZIP SLIP

Entries containing:

```text
../../target
```

must never escape the intended destination extraction directory.

---

# 104. ABSOLUTE ARCHIVE PATHS

Block absolute paths according to archive extraction library semantics.

---

# 105. SYMLINKS IN ARCHIVES

Archives may package symlinks that subsequent entries traverse to write files outside the sandbox.

---

# 106. HARDLINKS

If supported by archive formats and extraction tools.

---

# 107. EXTRACTION ORDER

Symlink and hardlink safety frequently depends on the sequencing of extracted entries.

---

# 108. DECOMPRESSION BOMBS

Raw:

```text
10 MB
```

can decompress into:

```text
100 GB
```

---

# 109. COMPRESSION RATIOS

Enforce limits on:

- total expanded byte volume
- maximum extracted entry count
- archive nesting depth

---

# 110. NESTED ARCHIVES

Archives within archives can bypass single-layer inspection thresholds.

---

# 111. ARCHIVE ENTRY COUNTS

Extracting millions of tiny files triggers filesystem inode and resource exhaustion.

---

# 112. EXTRACTION TIMEOUTS

Extraction operations must be strictly bounded in execution time.

---

# 113. EXTRACTION DISK QUOTAS

Cap the cumulative disk footprint during extraction, not merely the archive input size.

---

# 114. DUPLICATE ENTRY NAMES

Archives containing multiple entries with identical paths.

Determine precedence rules and potential validation bypasses.

---

# 115. VALIDATE-THEN-EXTRACT MISMATCH

If validation inspects the first entry while the extraction tool overwrites it with the last entry:

critical bypass.

---

# 116. TOCTOU

If file validation and processing operate across mutable shared paths:

attackers or concurrent processes may substitute contents between steps.

Relevant according to filesystem permissions.

---

# 117. CONTENT HASHES

Cryptographic hashes help maintain immutable file tracking throughout processing pipelines.

Not mandatory, but valuable.

---

# 118. POST-VALIDATION MUTATION

If an object can be overwritten after validation, scan results no longer guarantee current safety.

---

# 119. PRESIGNED OVERWRITE AFTER SCANNING

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

Verify object immutability and versioning semantics.

---

# 120. STORAGE KEY COLLISIONS

Server-generated storage keys must eliminate accidental or deliberate overwrites.

---

# 121. USER-SUPPLIED IDENTIFIERS AS STORAGE KEYS

If paths follow:

```text
uploads/{userInput}
```

verify collision risks and ownership boundaries.

---

# 122. CASE-INSENSITIVE FILESYSTEMS

`File.jpg` and `file.jpg` can collide on case-insensitive filesystems.

---

# 123. OBJECT STORAGE CASE SENSITIVITY

Cloud object stores may behave differently than local host filesystems.

---

# 124. OVERWRITING EXISTING FILES

Can enable:

- avatar substitution
- unauthorized modification of third-party documents
- system asset corruption

---

# 125. STATIC ASSET OVERWRITES

If upload paths can target:

```text
index.html
app.js
config.json
```

critical application compromise.

---

# 126. DATABASE METADATA

Every upload record must be tightly bound to:

- owner identity
- tenant identity
- storage object key
- lifecycle state

---

# 127. ORPHANED STORAGE OBJECTS

Storage upload succeeds, but database metadata insertion fails.

---

# 128. ORPHANED DATABASE RECORDS

Database metadata is created, but storage upload fails or is aborted.

---

# 129. FALSE READY STATES

Metadata must never declare:

```text
READY
```

if the underlying object is missing or processing has not completed.

---

# 130. DELETION WORKFLOWS

Map:

```text
authorization
↓
DB delete/state
↓
storage delete
```

---

# 131. STORAGE DELETION FAILURES

Database records may be purged while private or public files remain exposed in storage.

---

# 132. ORPHANED PUBLIC FILES

High-risk privacy and security exposure.

---

# 133. SOFT DELETIONS

Direct or presigned URLs may remain active even after application records are flagged as deleted.

---

# 134. CDN CACHING

Deleted or restricted files may persist inside CDN edge caches.

---

# 135. PUBLIC TO PRIVATE VISIBILITY TRANSITIONS

When changing visibility from public to private:

verify immediate cache purging and access restriction enforcement.

---

# 136. SIGNED DOWNLOAD URLS

If signed URLs remain valid long after permissions are revoked:

determine whether this constitutes intended capability semantics or an access control flaw.

Document clearly.

---

# 137. DOWNLOAD AUTHORIZATION

Do not audit uploads in isolation.

Private file downloads demand identical access control enforcement.

---

# 138. FILE IDOR

Substituting file identifiers or storage keys with another user's resource.

---

# 139. THUMBNAIL IDOR

Preview and thumbnail endpoints must not circumvent parent file authorization checks.

---

# 140. DERIVATIVE FILES

Transcoded media, thumbnails, OCR text, and extracted document pages must retain owner and tenant scoping.

---

# 141. OCR OUTPUTS

Extracted text can be confidential even when original binary access is controlled.

---

# 142. PREVIEW HTML GENERATION

Preview renderers must not inject extracted text or document markup as unsanitized raw HTML.

---

# 143. METADATA XSS

Filenames, document titles, and EXIF metadata displayed unsanitized in admin dashboards:

classic stored XSS second-order attack path.

---

# 144. CONTENT-DISPOSITION

For potentially active file formats:

```text
attachment
```

is substantially safer than inline serving.

Evaluate against product requirements.

---

# 145. CONTENT-TYPE ON DOWNLOAD

Servers must serve accurate and safe MIME types.

---

# 146. `X-Content-Type-Options: nosniff`

Essential defense-in-depth header for all user-generated content delivery.

---

# 147. CSP ON FILE SERVING ORIGINS

Restrictive Content Security Policies further constrain active content execution.

P4/P2 depending on actual exposure.

---

# 148. CONTENT SECURITY SANDBOXES

Dedicated untrusted file domains paired with restrictive CSPs are recommended for preview systems.

---

# 149. SAME-SITE COOKIES

If file-serving origins share application authentication cookies:

the impact of active content execution multiplies.

---

# 150. COOKIE DOMAIN SCOPE

A `.example.com` cookie scope exposes credentials to untrusted file subdomains.

Verify cookie boundaries.

---

# 151. `document.domain` AND LEGACY BEHAVIORS

Evaluate only against actual modern browser specifications.

---

# 152. STORAGE CORS CONFIGURATIONS

Private storage buckets must not grant overly permissive CORS headers allowing unauthorized cross-origin reads.

---

# 153. PUBLIC BUCKETS

Audit object ACLs and bucket policies.

---

# 154. DIRECTORY AND PREFIX LISTINGS

Determine whether attackers can enumerate storage object keys.

---

# 155. GUESSABLE OBJECT KEYS

If buckets are public, unguessable keys may serve as the sole access barrier:

this constitutes a capability-by-obscurity model.

---

# 156. OBJECT KEY LEAKAGE

Access logs, referrer headers, and UI views can leak private capability URLs.

---

# 157. STORAGE CREDENTIALS

Backend cloud storage access keys must never be exposed to clients.

---

# 158. TEMPORARY CLOUD CREDENTIALS

If using direct uploads via temporary credentials:

strictly audit granted IAM scopes and expiration lifetimes.

---

# 159. MULTIPART CLOUD UPLOADS

In S3-compatible multipart uploads, verify ownership over:

- upload IDs
- part numbers
- completion and abort commands

---

# 160. ABORTED UPLOADS

Abandoned multipart uploads can silently accumulate storage billing costs.

---

# 161. FILE HASH DEDUPLICATION

If the server deduplicates files globally by hash:

privacy side channels may allow attackers to detect whether another user uploaded a specific file.

---

# 162. "FILE ALREADY EXISTS" RESPONSES

Can disclose the existence of sensitive documents across accounts.

---

# 163. CROSS-TENANT DEDUPLICATION

Shared storage objects must never cause authorization rights to bleed across tenant boundaries.

---

# 164. SERVER-SIDE DEDUPLICATION REFERENCES

A single physical object may link to multiple logical records, but authorization must remain strictly per-reference.

---

# 165. DOWNLOAD COUNTERS

Public and share link download quotas can be bypassed via race conditions.

---

# 166. ONE-TIME DOWNLOAD LINKS

If links are single-use:

enforce atomic token invalidation.

---

# 167. SHARE LINKS

Capability tokens must be strictly scoped to specific files and permitted operations.

---

# 168. PUBLIC TOKENS

URL-based tokens can leak via:

- proxy logs
- analytics
- referrer headers
- browser history

---

# 169. UPLOAD CALLBACKS

Cloud storage events notifying backends of completed uploads must be validated for authenticity and tenant safety.

---

# 170. MALICIOUS STORAGE EVENTS

Never trust event metadata without verifying cloud provider message authenticity.

---

# 171. REMOTE URL IMPORTS

If the application supports:

```text
Import file from URL
```

this combines file upload risks with SSRF attack surfaces.

---

# 172. URL IMPORT CONTROLS

Inspect:

- URI schemes
- target hosts
- HTTP redirects
- DNS resolution
- payload size caps
- content type assertions
- connection timeouts

---

# 173. UNKNOWN CONTENT-LENGTH

Remote servers may omit `Content-Length` headers.

The backend must enforce byte ceilings progressively during stream consumption.

---

# 174. SPOOFED CONTENT-LENGTH

Never rely on headers as the sole file size control.

---

# 175. SLOW REMOTE SERVERS

Remote imports can monopolize worker threads and connection pools.

---

# 176. REDIRECTS TO LARGE FILES

Validating the initial URL size is insufficient if redirects lead to massive payloads.

---

# 177. REDIRECTS TO INTERNAL SERVICES

SSRF via redirect.

---

# 178. REMOTE ARCHIVE IMPORTS

Combines:

- SSRF
- massive downloads
- decompression bombs

---

# 179. ADMINISTRATIVE IMPORTS

Administrative roles do not render uploaded data inherently trusted.

---

# 180. BACKUP RESTORATION

One of the most dangerous upload attack surfaces.

---

# 181. RESTORE ARCHIVES

Can package:

- configurations
- directory paths
- user accounts
- role assignments
- raw database states

---

# 182. BACKUP PATH TRAVERSAL

Restoration routines must never write outside designated data directories.

---

# 183. BACKUP SCHEMA VERSIONING

Restoring incompatible schemas must not corrupt system state.

Reliability and integrity boundary.

---

# 184. BACKUP AUTHORIZATION

Who is authorized to trigger restorations?

High-privilege operation.

---

# 185. BACKUP REPLACE MODES

Destructive operations purging active data demand explicit authorization guards.

---

# 186. IMPORTED OWNER AND TENANT IDS

Import routines must not permit ordinary users to inject records into foreign tenants.

---

# 187. CSV IMPORTS

CSVs can introduce:

- oversized rows
- formula injections
- malformed escaping
- unauthorized privilege columns

---

# 188. CSV FORMULA INJECTION

If imported data is subsequently exported or reviewed in spreadsheet software:

cells prefixed with:

```text
=
+
-
@
```

can execute formulas.

Evaluate against real user workflows.

---

# 189. CSV PARSER CONSTRAINTS

Enforce limits on:

- row counts
- column counts
- individual field lengths

---

# 190. JSON IMPORTS

Deep nesting and massive array structures.

---

# 191. XML IMPORTS

XXE and entity expansion attacks.

---

# 192. YAML IMPORTS

Unsafe deserialization.

---

# 193. FILE PROCESSING QUEUES

If uploads are dispatched to async workers:

audit:

- job payloads
- idempotency
- retry behaviors
- stale file states

---

# 194. RETRYING PROCESSING JOBS

Job retries must not duplicate database metadata or external side effects.

---

# 195. FILES REPLACED BEFORE RETRIES

Worker retries might inadvertently process modified content stored under the same key.

---

# 196. IMMUTABLE VERSION IDENTIFIERS

Ensure background workers process the precise validated file version.

---

# 197. CANCELLING UPLOADS

If a user deletes a file while processing is active:

workers must not republish or mark the file as ready.

---

# 198. PROCESSING RACE CONDITIONS

```text
delete
||
scan completes
```

Which state takes precedence?

---

# 199. SCAN RESULTS FOR STALE VERSIONS

If files can be overwritten:

scanning verdicts must bind directly to specific content versions or hashes.

---

# 200. CRYPTOGRAPHIC HASHING

Useful for:

- integrity validation
- immutable content addressing
- scan result binding

Does not replace authorization checks.

---

# 201. ANTIVIRUS SIGNATURES

Antivirus results include:

- clean
- infected
- error
- timeout
- unknown

An `error` state must never be treated as `clean`.

---

# 202. SANITIZATION

Content Disarm and Reconstruction (CDR) can be considered for high-risk enterprise systems.

Do not mandate generically.

---

# 203. LOGGING

Do not log:

- raw binary contents
- presigned credentials
- private capability URLs

without operational necessity.

---

# 204. FILENAMES IN LOGS

Attacker-crafted filenames can trigger log injection or massive log bloat.

---

# 205. METADATA LOGGING

Sensitive EXIF and document attributes can leak into application logs.

---

# 206. ERROR RESPONSES

Parser exceptions must never disclose:

- local filesystem paths
- internal shell commands
- temporary directory locations
- library version internals

---

# 207. OBSERVABILITY

Monitor where relevant:

- total upload volumes
- rejected uploads
- max-size rejections
- scanning failures
- parser exceptions
- processing latency
- orphan file counts
- storage utilization

---

# 208. ABUSE DETECTION

Spikes in:

- upload frequency
- aggregate byte volume
- decompression failures

frequently signal deliberate abuse.

---

# 209. RATE LIMITING

Upload endpoints require cost-aware rate limiting.

Detailed rate limiting audits are covered separately.

---

# 210. BYTE TRANSFER RATE

Request counts alone do not constrain bandwidth exhaustion.

---

# 211. USER QUOTAS

Upload rate limits operate independently from total persistent storage quotas.

---

# 212. TENANT QUOTAS

A single tenant must not consume shared disk or cloud storage budgets without intended product limits.

---

# 213. UNAUTHENTICATED UPLOADS

If public uploads exist:

rigorously analyze abuse vectors and storage exhaustion costs.

---

# 214. PUBLIC TEMPORARY UPLOADS

Unclaimed temporary uploads must enforce strict TTL cleanup policies.

---

# 215. CAPTCHA

Do not mandate automatically.

Implement only where bot and spam abuse justifies user friction.

---

# 216. DOWNLOAD SECURITY

Audit download workflows alongside ingestion paths.

---

# 217. CONTENT RANGE REQUESTS

Large file downloads frequently utilize `Range` headers.

Ensure authorization checks govern partial content requests equally.

---

# 218. HEAD REQUESTS

Can disclose the existence and metadata of private files without body download.

---

# 219. CACHING

Private file downloads must never be cached by shared public intermediaries.

---

# 220. CDN SIGNED URLS

Verify path constraints and token expiration lifetimes.

---

# 221. PERMISSION REVOCATION

If a user loses file permissions, long-lived CDN tokens may continue to grant access.

Document capability lifetimes.

---

# 222. RETENTION POLICIES

Expired or deleted private files must be permanently purged in accordance with privacy policies.

Avoid legal assessments; focus on technical mechanisms.

---

# 223. BACKUPS OF UPLOADED DATA

Deleted files may persist inside historical backups.

This is standard operational reality; document retention lifecycles.

---

# 224. SECURITY TESTING

Map existing automated upload security test coverage.

---

# 225. VALID FILE TESTS

Verify each permitted file type.

---

# 226. EXTENSION MISMATCH TESTS

Discrepancies between file extension and actual content.

---

# 227. MIME TYPE MISMATCH TESTS

---

# 228. UNKNOWN FILE TYPE TESTS

---

# 229. OVERSIZED FILE TESTS

---

# 230. EXCESSIVE FILE COUNT TESTS

---

# 231. CONCURRENT UPLOAD TESTS

---

# 232. PATH TRAVERSAL FILENAME TESTS

---

# 233. DUPLICATE FILENAME TESTS

---

# 234. FILE OVERWRITE TESTS

---

# 235. ACTIVE CONTENT TESTS

For HTML, SVG, and PDF according to allowed formats.

---

# 236. STORED XSS TESTS

Upload malicious metadata and test rendering in:

- standard user UI
- administrative dashboards
- preview views

---

# 237. ZIP SLIP TESTS

Controlled synthetic archive containing traversal path entries.

---

# 238. DECOMPRESSION BOMB TESTS

Use safe synthetic limits; avoid creating actual disk exhaustion events.

---

# 239. ARCHIVE SYMLINK TESTS

Where supported by extraction libraries.

---

# 240. IMAGE DIMENSION BOMB TESTS

Small compressed files with extreme pixel dimensions tested in safe environments.

---

# 241. PARSER TIMEOUT TESTS

Complex or pathological inputs causing parsing hangs.

---

# 242. SSRF FILE TESTS

If parsers resolve external references:

test against controlled local test endpoints.

---

# 243. TEMPORARY FILE CLEANUP TESTS

Abort uploads mid-transfer and verify disk cleanup.

---

# 244. DATABASE FAILURE TESTS

Storage write succeeds, database record fails.

---

# 245. STORAGE FAILURE TESTS

Database record succeeds, storage write fails.

---

# 246. DELETION FAILURE TESTS

Database record deleted, storage object persists.

---

# 247. PERMISSION ISOLATION TESTS

User A file access attempts by User B.

---

# 248. CROSS-TENANT ACCESS TESTS

Tenant A credentials targeting Tenant B storage objects.

---

# 249. PRESIGNED URL AUTHORIZATION TESTS

Attempting to request signed URLs for unauthorized object keys.

---

# 250. PRESIGNED OVERWRITE TESTS

Attempting to overwrite existing objects when workflows mandate create-only semantics.

---

# 251. SCANNING BYPASS TESTS

If scan statuses exist:

attempt accessing objects prior to achieving `CLEAN/READY` state.

---

# 252. SCAN VERSION RACE TESTS

Scan clean version 1, overwrite with version 2, attempt serving.

---

# 253. FINDING FORMAT

Every substantive finding must include:

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

Use:

## P0 - CRITICAL

- file upload leads to unauthenticated or low-privilege remote code execution
- arbitrary overwrite of critical server or application files resulting in takeover
- unrestricted cross-tenant file exposure at scale
- malicious backup restore or upload causing catastrophic system compromise

## P1 - HIGH

- arbitrary private file read or write capabilities
- active uploaded content executing under trusted application origin with substantial account takeover impact
- parser-driven SSRF targeting sensitive internal network services
- upload validation bypass leading to broad cross-user data disclosure
- archive extraction writing files outside designated storage sandboxes

## P2 - MEDIUM

- significant stored XSS through uploaded content or metadata
- resource exhaustion via realistic low-cost exploit vectors
- upload/deletion race conditions leading to private data exposure
- limited cross-user file access
- malware distribution gaps in applications actively sharing uploads across users

## P3 - LOW

- limited metadata disclosure
- minor temporary file cleanup deficiencies
- minor serving header weaknesses
- constrained edge cases

## P4 - HARDENING

- additional scanning, sandboxing, or observability recommendations without confirmed exploit paths

---

# 255. CONFIDENCE

Use:

```text
HIGH
MEDIUM
LOW
```

---

# 256. STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 257. EVIDENCE TIER

Use:

```text
A - safely reproduced
B - complete executable upload-to-impact path
C - strong static/config evidence
D - partial/inferred
E - theoretical
```

---

# 258. CATEGORY

Use:

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

# 259. FALSE-POSITIVE PREVENTION

Before reporting P0/P1/P2 findings, verify:

1. upload endpoint is reachable
2. attacker holds required authentication and role
3. validation code path
4. actual storage location
5. actual serving origin
6. processing library behavior
7. file execution semantics
8. object and file authorization logic
9. infrastructure deployment behavior
10. reproducible impact

Do not infer vulnerabilities solely from extension allowlists.

---

# 260. DO NOT REPORT `.php` UPLOADS AS RCE IF THE SERVER CANNOT EXECUTE PHP

An active execution interpreter path must exist.

---

# 261. DO NOT AUTOMATICALLY REPORT SVG AS XSS

Depends on:

- inline, embed, object, img, or download context
- serving origin
- CSP restrictions
- sanitization logic

---

# 262. DO NOT REPORT PDF AS MALWARE MERELY BECAUSE IT IS A PDF

A realistic malicious content model must exist.

---

# 263. DO NOT DEMAND ANTIVIRUS AUTOMATICALLY

If an application merely stores private photos that are never downloaded by third parties:

antivirus scanning may not represent a core priority.

---

# 264. DO NOT TRUST CLIENT MIME TYPES

The client controls them completely.

---

# 265. DO NOT TRUST EXTENSIONS

Extensions are similarly attacker-controlled.

---

# 266. DO NOT TRUST MAGIC BYTES AS AN ABSOLUTE GUARANTEE

Polyglot and active content formats can circumvent simple magic byte checks.

---

# 267. DO NOT RELY ON UUIDS AS THE SOLE FILE AUTHORIZATION BARRIER

Knowledge of unguessable URLs does not replace a comprehensive authorization model unless explicitly designed as capability tokens.

---

# 268. DO NOT CONFINE VALIDATION TO THE FRONTEND

Backend and storage layers must strictly enforce validation rules.

---

# 269. DO NOT ADOPT OBJECT STORAGE MERELY FOR CHECKLIST COMPLIANCE

Local storage can be secure if properly isolated and aligned with architectural scale.

---

# 270. DO NOT MODIFY CODE

During the audit:

- do not delete files
- do not upload real malware
- do not attempt server takeovers
- do not fill disk storage
- do not query unauthorized internal services
- do not modify bucket ACLs

Use safe synthetic testing techniques.

---

# 271. OUTPUT - FILE_UPLOAD_SECURITY_AUDIT.md

Structure the final report as follows:

## 1. Executive Summary

- upload surfaces
- storage model
- serving model
- parser inventory
- top security risks

## 2. Upload Surface Inventory

## 3. Upload Lifecycle Map

## 4. Filename / Path Security Audit

## 5. Extension / MIME / Type Validation Audit

## 6. File Size / Count / Quota Audit

## 7. Multipart / Temp Storage Audit

## 8. Chunked Upload Audit

If relevant.

## 9. Presigned Upload Audit

If relevant.

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

For each permitted file type, attempt mismatches:

```text
extension A
MIME B
magic C
actual content D
```

Determine which signals the backend genuinely relies upon.

---

# 278. SECOND PASS - ACTIVE CONTENT

For each upload type displayable in browsers, test:

- HTML
- SVG
- XML
- PDF

according to permitted types.

Determine:

- serving origin
- Content-Type
- Content-Disposition
- CSP headers

---

# 279. SECOND PASS - PATH ATTACKS

Probe filename and object key resolution with:

- traversal sequences
- absolute paths
- duplicate path separators
- encoded traversal tokens

strictly in test environments.

---

# 280. SECOND PASS - OVERWRITE PROBING

Attempt targeting:

- user's existing files
- third-party files
- static web assets
- predictable object keys

according to upload flows.

---

# 281. SECOND PASS - TEMPORARY STORAGE

Abort uploads at:

```text
25%
50%
99%
```

and inspect temporary file cleanup.

---

# 282. SECOND PASS - CONCURRENT UPLOADS

Initiate the maximum permitted concurrent uploads.

Monitor:

- memory usage
- disk consumption
- socket exhaustion
- temporary file accumulation

---

# 283. SECOND PASS - LARGE DIMENSIONS

Upload valid compressed image files with extreme pixel dimensions.

Monitor image decoder memory utilization.

---

# 284. SECOND PASS - ARCHIVE ATTACKS

Test controlled synthetic archives featuring:

- traversal path entries
- symlinks
- excessive entry counts
- high compression ratios

---

# 285. SECOND PASS - PARSER NETWORK REQUESTS

If processors support external references:

test with controlled URLs to verify if the server initiates network requests.

---

# 286. SECOND PASS - REMOTE IMPORTS

If URL imports are supported:

test:

```text
public URL
redirect
oversized response
slow response
internal-test target
```

without interacting with unauthorized external systems.

---

# 287. SECOND PASS - CROSS-USER FILES

User A uploads a private file.

User B attempts:

- viewing metadata
- previewing
- downloading
- generating thumbnails
- deleting
- requesting signed URLs

---

# 288. SECOND PASS - CROSS-TENANT FILES

Repeat cross-user testing across Tenant A and Tenant B boundaries.

---

# 289. SECOND PASS - PRESIGNED FLOWS

Attempt:

```text
request signed URL for unauthorized object key
```

and:

```text
reuse URL after expected expiry
```

---

# 290. SECOND PASS - CLEAN FILE OVERWRITING

Where scanning workflows exist:

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

# 291. SECOND PASS - DELETION RACES

```text
processing completes
||
user deletes file
```

Determine whether deleted files can erroneously revert to READY or public states.

---

# 292. SECOND PASS - STORAGE FAILURES

Simulate storage write failures.

Verify whether database records falsely assert file readiness.

---

# 293. SECOND PASS - DATABASE FAILURES

Storage succeeds, but database metadata insertion fails.

Inspect:

- orphaned files
- cleanup mechanisms
- unintended public exposure

---

# 294. SECOND PASS - DOWNLOAD HEADERS

For active file types, inspect:

- Content-Type
- Content-Disposition
- X-Content-Type-Options: nosniff
- Cache-Control headers

---

# 295. SECOND PASS - METADATA XSS

Inject attacker-controlled strings into:

- filenames
- document titles
- EXIF metadata

and trace where attributes are rendered across the UI.

---

# 296. SECOND PASS - FILE VERSION RACES

If object keys can be reused:

verify that validation and scan results map strictly to the version currently served.

---

# 297. SECOND PASS - BACKUP RESTORATION

If supported:

test synthetic archives containing:

- unexpected path definitions
- foreign tenant identifiers
- incompatible schemas
- duplicate entities

without destructive production execution.

---

# 298. SECOND PASS - QUOTAS

Ask:

> Can an attacker incur significant storage or processing costs with minimal request volumes?

---

# 299. FINAL QUALITY GATE

Before issuing the final report, verify:

- all upload surfaces have been cataloged
- multipart forms are not assumed to be the sole upload mechanism
- original filenames are treated as attacker-controlled input
- path normalization mirrors actual operating system and runtime behaviors
- extensions, MIME types, and magic bytes are not individually treated as absolute proof
- backend and storage layers enforce limits rather than relying on frontend checks
- temporary file lifecycles and cleanup paths have been audited
- chunked and presigned workflows undergo ownership and cumulative size reviews
- direct object storage uploads do not become trusted prior to required server validation
- storage locations and serving origins have been mapped
- RCE findings are filed only when the server can genuinely execute the uploaded file
- SVG, HTML, and PDF findings depend on serving and rendering contexts
- file parsers are treated as untrusted input boundaries
- image dimension and decompression bomb risks are evaluated
- archive extraction routines enforce traversal, symlink, and expanded size boundaries
- file-based SSRF is evaluated where parsers fetch external resources
- malware scanning is recommended only where the product threat model justifies it
- deletion and public-to-private lifecycles account for CDN and storage caching
- preview, thumbnail, and derivative assets enforce authorization checks
- scanning verdicts bind strictly to the specific content version served
- remote URL imports include size, timeout, redirect, and SSRF analyses
- storage and database partial failure states have been reviewed
- metadata is tracked as second-order attacker input
- every P0/P1 finding features a complete upload-to-impact path
- P4 hardening recommendations are separated from confirmed exploit vectors

---

# FINAL RULE

Do not generate reports like:

> Check MIME types, limit file sizes, and scan files with an antivirus.

That is not a File Upload Security Audit.

I am looking for concrete defects such as:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

or:

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

These are the file upload vulnerabilities you must uncover.

Reason through:

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

For every serious finding, you must be able to answer:

> Who is permitted to upload the file?

> What part of the file or metadata does the attacker control?

> What validation does the file undergo?

> Where is it physically or logically stored?

> Which parser processes it?

> Does the parser have network or filesystem access?

> How is the file subsequently served?

> Does it execute as active content in the browser?

> Can a user access another user's file?

> What happens if processing or storage fails between pipeline steps?

If server execution behavior cannot be confirmed:

**SERVER EXECUTION NOT VERIFIED.**

If parser or network semantics are not confirmed:

**PARSER BEHAVIOR NOT VERIFIED.**

If only a general hardening enhancement without a confirmed exploit path:

**P4 - HARDENING.**

It is far better to find 5 real upload, storage, parser, or serving exploit paths than to write 100 generic file security rules.

The objective is to produce a forensically precise File Upload Security Audit that translates directly into:

- upload regression test
- path containment fix
- content validation correction
- safe storage architecture
- active-content isolation
- parser sandboxing
- archive protection
- file authorization fix
- production upload hardening
