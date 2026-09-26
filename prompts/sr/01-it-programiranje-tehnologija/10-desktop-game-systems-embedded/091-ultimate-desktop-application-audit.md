---
id: UPL-IT-091
number: 91
slug: ultimate-desktop-application-audit
title: Ultimate Desktop Application Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# ULTIMATE DESKTOP APPLICATION AUDIT

Želim da izvršiš maksimalno dubok, sistematski, evidence-first i production-oriented audit kompletne desktop aplikacije.

Glavni cilj:

> Utvrditi da li desktop aplikacija može pouzdano da se instalira, pokrene, ažurira, čuva podatke, koristi lokalne resurse, komunicira sa mrežom i oporavi se od crash-a ili prekida bez corruption-a, privilege problema, resource leak-a, update failure-a ili platform-specific kvarova.

Ovo nije:

- samo UI audit
- samo packaging audit
- samo performance profiling
- samo security review
- pretpostavka da debug build predstavlja production behavior
- automatska preporuka Electron-a, Qt-a ili native stack-a
- kritikovanje velikog binary-ja bez business konteksta

Prioritet:

**data integrity > update safety > privilege/security boundaries > crash recovery > resource correctness > filesystem/process correctness > platform compatibility > performance > packaging > UX hardening**

## 1. APPLICATION INVENTORY

Utvrdi:

- language
- framework
- runtime
- UI toolkit
- packaging
- installer
- updater
- local DB
- configuration
- filesystem usage
- subprocesses
- network APIs
- authentication
- background services
- shell integration
- OS integrations
- telemetry
- crash reporting

## 2. PROCESS MODEL

Mapiraj:

```text
main process
renderer/UI
workers
subprocesses
services
helpers
```

## 3. SINGLE INSTANCE

Ako aplikacija očekuje samo jednu instancu:

- lock semantics
- stale lock
- second-instance activation

## 4. STARTUP

Audituj:

- config load
- DB open
- migration
- cache
- credentials
- update check
- UI initialization

## 5. PARTIAL STARTUP FAILURE

## 6. SAFE MODE

Ako postoji.

## 7. CRASH DURING STARTUP

## 8. SHUTDOWN

## 9. FORCED TERMINATION

## 10. UNSAVED DATA

## 11. AUTOSAVE

## 12. FILESYSTEM

Mapiraj:

- install directory
- user data
- temp
- cache
- logs
- downloads
- exports
- backups

## 13. WRITABLE LOCATION

Do not write mutable state into protected install path without reason.

## 14. PATH HANDLING

- spaces
- Unicode
- long paths
- symlinks
- junctions

## 15. TEMP FILE

## 16. ATOMIC WRITE

Critical settings/data should avoid partial overwrite.

## 17. SAVE PATTERN

Prefer where applicable:

```text
write temp
↓
flush
↓
atomic replace
```

## 18. FILE LOCK

## 19. MULTI-PROCESS FILE ACCESS

## 20. LOCAL DATABASE

Audit:

- migrations
- transactions
- crash consistency
- locking
- WAL/journal
- backups

## 21. LOCAL DB CORRUPTION

Recovery path.

## 22. SETTINGS

## 23. CONFIG VERSION

## 24. CONFIG MIGRATION

## 25. INVALID CONFIG

Fail safely.

## 26. CREDENTIAL STORAGE

Use OS-backed secure storage where appropriate.

## 27. PLAINTEXT SECRET

## 28. TOKEN REFRESH

## 29. LOGOUT

## 30. CACHE

## 31. STALE CACHE

## 32. CACHE VERSIONING

## 33. NETWORK

## 34. OFFLINE

## 35. RECONNECT

## 36. PROXY

## 37. TLS

## 38. CERTIFICATE

## 39. DOWNLOAD

## 40. PARTIAL DOWNLOAD

## 41. RESUME

## 42. CHECKSUM

## 43. UPLOAD

## 44. SUBPROCESS

Audit:

- executable path
- arguments
- quoting
- environment
- current working directory
- lifetime
- cancellation
- exit code
- stdout/stderr

## 45. SHELL EXECUTION

Avoid shell where direct process execution suffices.

## 46. ARGUMENT INJECTION

## 47. PROCESS TREE

Child remains after app exits.

## 48. ORPHAN PROCESS

## 49. ZOMBIE

Platform-dependent.

## 50. SIGNAL/TERMINATION

## 51. IPC

Audit:

- transport
- authorization
- message schema
- malformed input
- identity

## 52. LOCAL PORT

If used, assess exposure/binding.

## 53. PLUGIN SYSTEM

## 54. DYNAMIC LIBRARY

## 55. CODE SIGNING

## 56. INSTALLER

## 57. INSTALL SCOPE

Per-user vs machine-wide.

## 58. PRIVILEGE ELEVATION

## 59. ADMIN REQUIREMENT

Avoid unless justified.

## 60. UAC / OS AUTH DIALOG

## 61. AUTO UPDATE

Critical.

## 62. UPDATE CHANNEL

## 63. UPDATE MANIFEST

## 64. SIGNATURE VERIFICATION

## 65. HTTPS ONLY IS NOT ENOUGH

Update artifact integrity should be explicit where platform requires.

## 66. UPDATE ROLLBACK

## 67. PARTIAL UPDATE

## 68. APP RUNNING DURING UPDATE

## 69. FILE IN USE

## 70. UPDATE AND LOCAL DATA

Backward compatibility.

## 71. OLD VERSION

## 72. SKIPPED VERSIONS

## 73. DOWNGRADE

## 74. RELEASE CHANNEL

## 75. PORTABLE MODE

If supported.

## 76. MULTI-USER MACHINE

## 77. ROAMING PROFILE

If applicable.

## 78. OS SLEEP

## 79. HIBERNATE

## 80. RESUME

## 81. NETWORK CHANGE

## 82. CLOCK CHANGE

## 83. TIMEZONE CHANGE

## 84. LOW DISK

## 85. READONLY FS

## 86. LOW MEMORY

## 87. GPU FAILURE

If hardware accelerated.

## 88. DEVICE DISCONNECT

## 89. MULTI-MONITOR

## 90. DPI

## 91. DISPLAY CHANGE

## 92. WINDOW RESTORE

Avoid reopening off-screen.

## 93. ACCESSIBILITY

## 94. KEYBOARD

## 95. SCREEN READER

## 96. HIGH DPI

## 97. LOCALIZATION

## 98. CRASH REPORTING

Avoid secrets/PII.

## 99. TELEMETRY

## 100. UPDATE TELEMETRY

## 101. PACKAGING

## 102. MISSING RUNTIME

## 103. DLL/SHARED LIB

## 104. ANTIVIRUS FALSE POSITIVE

## 105. SMARTSCREEN/GATEKEEPER

Platform-specific.

## 106. RELEASE BUILD

## 107. DEBUG FLAG

## 108. ASSERTIONS

## 109. FEATURE FLAGS

## 110. RESOURCE LEAK

Za svaki dugoživeći resurs (memory, handles, threads, subprocesses, timers) proveri vlasnika, očekivani trenutak oslobađanja i rast kroz ponovljen open/close ciklus.

## 111. THREAD

## 112. UI THREAD BLOCK

## 113. DEADLOCK

## 114. ASYNC CANCELLATION

## 115. LARGE FILE

## 116. LARGE DATASET

## 117. STARTUP PERFORMANCE

## 118. IDLE RESOURCE USE

## 119. LONG SESSION

## 120. MEMORY GROWTH

## 121. FALSE POSITIVE RULES

Ne prijavljuj automatski:

- large installer
- local database
- background process
- admin installer
- auto-update
- shell integration
- native library

bez concrete risk-a.

## 122. EVIDENCE TIERS

```text
A - reproduced production/release failure or runtime evidence
B - complete code/configuration/lifecycle path
C - strong static evidence
D - plausible issue requiring verification
E - hardening
```

## 123. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 124. SEVERITY

P0:
- catastrophic local data loss
- compromised updater enabling arbitrary code execution at scale

P1:
- repeatable update corruption
- privilege/security boundary failure
- critical persistent-data corruption

P2:
- material crash/recovery/platform problem

P3:
- limited reliability/performance issue

P4:
- hardening/polish

## 125. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Platform:
Version:
Component:
Trigger:
Lifecycle stage:
Current behavior:
Expected invariant:
Persistent effect:
Security impact:
User impact:
Evidence:
Root cause:
Fix:
Regression test:
Release verification:
```

## 126. MATRICES

### Platform Matrix

| Feature | Windows | macOS | Linux | Notes |
|---|---|---|---|---|

### Persistence Matrix

| Data | Location | Atomic | Backup | Migration |
|---|---|---|---|---|

### Update Matrix

| From | To | Install | Data migration | Rollback |
|---|---|---|---|---|

## 127. SECOND PASS

Test:

- forced kill during save
- forced kill during migration
- update interrupted
- low disk
- no network
- app opened twice
- stale lock
- old config
- read-only directory
- sleep/resume
- display removal
- token expiry
- subprocess crash
- child process timeout

## 128. FINAL QUALITY GATE

Confirm:

- startup
- shutdown
- persistence
- config
- local DB
- filesystem
- IPC
- subprocesses
- credentials
- offline
- update
- installer
- privilege
- crash recovery
- OS lifecycle
- accessibility
- resource use
- release build

## 129. OUTPUT

`ULTIMATE_DESKTOP_APPLICATION_AUDIT.md`

## 130. FAILURE CHAIN

```text
app writes settings directly to settings.json
↓
process crashes midway
↓
file contains truncated JSON
↓
next startup cannot parse settings
↓
application fails before recovery UI initializes
```

```text
updater downloads new executable
↓
artifact signature is never verified
↓
update server/CDN compromise serves modified binary
↓
client installs attacker-controlled code
```

# KONAČNO PRAVILO

Desktop aplikacija mora biti auditovana kao dugovečan lokalni sistem koji poseduje persistent state, OS integrations i update authority, a ne samo kao web UI spakovan u executable.
