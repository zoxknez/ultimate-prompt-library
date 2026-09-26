---
id: UPL-IT-092
number: 92
slug: electron-application-audit
title: Electron Application Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# ELECTRON APPLICATION AUDIT

Želim dubok security, reliability i production audit Electron aplikacije.

Glavni cilj:

> Utvrditi da li Electron architecture pravilno odvaja renderer od OS privilegija, bezbedno koristi IPC, navigaciju, preload i Node capabilities, i da li packaging/update/runtime behavior može pouzdano da radi u production-u.

Ovo nije:

- "Electron je nesiguran"
- automatsko kritikovanje velikog RAM usage-a
- insistiranje da se aplikacija rewrite-uje native
- samo CSP audit

## 1. ELECTRON VERSION

Current semantics depend on version.

## 2. PROCESS MODEL

- main
- renderer
- preload
- utility
- worker

## 3. BROWSERWINDOW INVENTORY

Za svaki:

```text
Purpose:
URL/content:
webPreferences:
Preload:
Node integration:
Context isolation:
Sandbox:
Navigation:
External content:
```

## 4. NODEINTEGRATION

High-value review.

## 5. CONTEXTISOLATION

## 6. SANDBOX

## 7. PRELOAD

## 8. CONTEXTBRIDGE

## 9. GLOBAL EXPOSURE

Expose narrow APIs.

## 10. IPC MAIN/RENDERER

## 11. IPC CHANNEL INVENTORY

## 12. INPUT SCHEMA

## 13. SENDER VALIDATION

## 14. WINDOW/FRAME IDENTITY

## 15. AUTHORITY

Renderer should not get arbitrary filesystem/process power.

## 16. IPC CONFUSED DEPUTY

## 17. RETURN DATA

Avoid leaking secrets.

## 18. REMOTE CONTENT

## 19. NAVIGATION

## 20. WILL-NAVIGATE

## 21. WINDOW OPEN

## 22. EXTERNAL URL

## 23. SHELL.OPENEXTERNAL

Validate protocol/URL.

## 24. CUSTOM PROTOCOL

## 25. DEEP LINK

## 26. CSP

## 27. XSS TO RCE PATH

Central Electron risk.

## 28. INNERHTML/DOM INJECTION

Only critical if reachable and privileges exist.

## 29. WEBVIEW

## 30. SESSION

## 31. PARTITION

## 32. COOKIES

## 33. TOKEN STORAGE

## 34. DEVTOOLS

## 35. DEBUG PORT

## 36. PRODUCTION FLAGS

## 37. ASAR

Not security boundary by itself.

## 38. NATIVE MODULE

## 39. NODE ABI

## 40. PACKAGING

## 41. CODE SIGNING

## 42. NOTARIZATION

If macOS.

## 43. WINDOWS SIGNING

## 44. LINUX PACKAGES

## 45. AUTOUPDATER

## 46. ELECTRON-UPDATER

If used.

## 47. UPDATE SIGNATURE

## 48. UPDATE CHANNEL

## 49. DOWNGRADE

## 50. ROLLBACK

## 51. APP DATA

## 52. USERDATA PATH

## 53. CACHE

## 54. SESSION STORAGE

## 55. LOCALSTORAGE

Sensitive-data implications.

## 56. INDEXEDDB

## 57. SQLITE

## 58. FILESYSTEM

## 59. DOWNLOAD

## 60. CLIPBOARD

## 61. SCREEN CAPTURE

## 62. GLOBAL SHORTCUT

## 63. TRAY

## 64. NOTIFICATION

## 65. POWER MONITOR

## 66. SLEEP/RESUME

## 67. SINGLE INSTANCE

## 68. CRASH

## 69. RENDERER CRASH

## 70. MAIN PROCESS CRASH

## 71. HANG

## 72. RESPONSIVENESS

## 73. GPU PROCESS

## 74. HARDWARE ACCELERATION

## 75. MEMORY

## 76. RENDERER LEAK

## 77. WINDOW LEAK

## 78. IPC LISTENER LEAK

## 79. BACKGROUND TIMER

## 80. STARTUP

## 81. BUNDLE SIZE

## 82. LAZY LOAD

## 83. NETWORK

## 84. PROXY

## 85. CERTIFICATE

## 86. CERTIFICATE ERROR HANDLER

Dangerous if blindly accepted.

## 87. PERMISSION REQUEST HANDLER

## 88. CAMERA/MIC

## 89. FILE DIALOG

## 90. PATH TRUST

## 91. DRAG/DROP

## 92. EXTENSION

## 93. ELECTRON FUSES

If used, inspect actual configuration.

## 94. DEPENDENCY SUPPLY CHAIN

## 95. NATIVE BINARY

## 96. SOURCE MAP

## 97. CRASH REPORTER

## 98. TELEMETRY

## 99. FALSE POSITIVE RULES

Do not automatically call:

- Electron usage
- preload
- contextBridge
- shell.openExternal
- native module
- auto-update

a defect.

Need reachability and impact.

## 100. EVIDENCE TIERS

```text
A - reproduced runtime/security/release failure
B - complete renderer-to-privilege path
C - strong static evidence
D - plausible issue
E - hardening
```

## 101. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 102. SEVERITY

P0:
systemic RCE/updater compromise at scale

P1:
renderer compromise reaches critical OS privilege
critical IPC authorization bypass

P2:
material local security/reliability issue

P3:
limited hardening/performance weakness

P4:
maturity

## 103. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Electron version:
Window/process:
Renderer trust:
IPC/preload API:
Trigger:
Privilege path:
Reachability:
Impact:
Evidence:
Root cause:
Fix:
Regression test:
```

## 104. SECURITY MATRIX

| Window | External content | Node | Isolation | Sandbox | Preload |
|---|---|---|---|---|---|

## 105. IPC MATRIX

| Channel | Caller | Args | Privilege | Validation |
|---|---|---|---|---|

## 106. SECOND PASS

Test:

- renderer XSS
- malicious remote page
- arbitrary external URL
- malformed IPC
- forged renderer request
- compromised preload assumption
- updater interruption
- certificate failure
- multiple windows
- renderer crash
- deep link with crafted input

## 107. FINAL QUALITY GATE

Confirm:

- processes
- BrowserWindow
- isolation
- sandbox
- preload
- IPC
- navigation
- external URLs
- permissions
- storage
- update
- signing
- crashes
- memory
- release configuration

## 108. OUTPUT

`ELECTRON_APPLICATION_AUDIT.md`

## 109. FAILURE CHAIN

```text
renderer displays attacker-controlled HTML
↓
XSS executes JavaScript
↓
preload exposes:
window.api.readFile(path)
↓
IPC handler accepts arbitrary path
↓
renderer reads user's SSH key
↓
XSS becomes local file disclosure
```

# KONAČNO PRAVILO

Electron security se ne meri time da li postoji `contextIsolation: true`.

Moraš pratiti kompletan put:

```text
untrusted renderer input
↓
preload
↓
IPC
↓
main-process privilege
↓
OS side effect
```
