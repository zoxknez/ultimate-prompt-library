---
id: UPL-IT-094
number: 94
slug: windows-application-production-audit
title: Windows Application Production Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# WINDOWS APPLICATION PRODUCTION AUDIT

Želim dubok Windows-specific production audit desktop aplikacije.

Glavni cilj:

> Utvrditi da li aplikacija pravilno funkcioniše kroz Windows filesystem, UAC, registry, services, sessions, code signing, installer/update, Defender/SmartScreen i lifecycle scenarije bez privilege, persistence ili deployment kvarova.

Ovo nije:

- generic desktop audit
- samo installer review
- automatska preporuka registry-ja
- pretpostavka da admin rights rešavaju permission probleme

## 1. WINDOWS SUPPORT MATRIX

- Windows versions
- x64
- ARM64
- per-user/per-machine

## 2. INSTALLER

- MSI
- MSIX
- EXE
- portable

## 3. INSTALL LOCATION

## 4. PROGRAM FILES

Not writable for regular user.

## 5. APPDATA

- Local
- Roaming

## 6. PROGRAMDATA

## 7. TEMP

## 8. USER PROFILE

## 9. LONG PATH

## 10. UNICODE PATH

## 11. ONEDRIVE/REDIRECTED FOLDER

If user data stored there.

## 12. NTFS PERMISSIONS

## 13. ACL

## 14. UAC

## 15. ELEVATION

## 16. ADMIN TOKEN

## 17. UNELEVATED CHILD

## 18. PRIVILEGE BOUNDARY

## 19. ELEVATION HELPER

## 20. PIPE

## 21. LOCAL RPC/IPC

## 22. NAMED PIPE ACL

## 23. MUTEX

## 24. SINGLE INSTANCE

## 25. SESSION

## 26. MULTIPLE USERS

## 27. FAST USER SWITCHING

## 28. REMOTE DESKTOP

## 29. SERVICE

If applicable.

## 30. SERVICE ACCOUNT

## 31. SERVICE ACL

## 32. SERVICE CONTROL

## 33. SESSION 0

## 34. STARTUP

- registry run
- startup folder
- scheduled task
- service

## 35. SCHEDULED TASK

## 36. REGISTRY

## 37. HKCU/HKLM

## 38. WOW64

## 39. FILE ASSOCIATION

## 40. URL PROTOCOL

## 41. DEEP LINK

## 42. COM

If used.

## 43. DLL SEARCH ORDER

## 44. DLL HIJACKING

Need reachable load path.

## 45. LOADLIBRARY

## 46. PATH

## 47. ENVIRONMENT

## 48. SUBPROCESS

## 49. COMMAND LINE

## 50. CREATEPROCESS

## 51. SHELL EXECUTE

## 52. QUOTING

## 53. JOB OBJECT

Useful for child lifecycle where applicable.

## 54. CONSOLE WINDOW

## 55. CTRL EVENTS

## 56. PROCESS TERMINATION

## 57. WINDOWS SHUTDOWN

## 58. LOGOFF

## 59. SLEEP

## 60. HIBERNATE

## 61. RESUME

## 62. NETWORK PROFILE CHANGE

## 63. DRIVE REMOVAL

## 64. DISPLAY CHANGE

## 65. DPI

Per-monitor DPI awareness.

## 66. MULTI-MONITOR

## 67. HIGH CONTRAST

## 68. ACCESSIBILITY

## 69. CODE SIGNING

## 70. AUTHENTICODE

## 71. CERTIFICATE EXPIRY

## 72. TIMESTAMP

## 73. SMARTSCREEN

## 74. DEFENDER

## 75. FALSE POSITIVE

## 76. INSTALLER SIGNING

## 77. BINARY SIGNING

## 78. UPDATE

## 79. UPDATE PRIVILEGE

## 80. UPDATE SERVICE

## 81. UPDATE FILE REPLACEMENT

## 82. LOCKED FILE

## 83. REBOOT REQUIRED

## 84. PENDING FILE RENAME

## 85. ROLLBACK

## 86. APP COMPATIBILITY

## 87. VC++ RUNTIME

## 88. .NET RUNTIME

## 89. WEBVIEW2

## 90. DRIVER

If applicable.

## 91. FIREWALL

## 92. LOOPBACK SERVER

## 93. LISTEN ADDRESS

## 94. WINDOWS CREDENTIAL MANAGER

## 95. DPAPI

## 96. SECRET

## 97. EVENT LOG

## 98. CRASH DUMP

Sensitive data.

## 99. WER

## 100. MINIDUMP

## 101. LOG LOCATION

## 102. ETW

If used.

## 103. GROUP POLICY

Enterprise environments.

## 104. LOCKED-DOWN MACHINE

## 105. NON-ADMIN USER

## 106. APPLOCKER/WDAC

If enterprise relevant.

## 107. FALSE POSITIVE RULES

Do not automatically flag:

- registry usage
- per-machine install
- elevation
- Windows service
- scheduled task
- DPAPI

without misuse or unnecessary privilege.

## 108. EVIDENCE TIERS

```text
A - reproduced Windows/release failure
B - complete Windows privilege/install/update path
C - strong static evidence
D - suspected platform issue
E - hardening
```

## 109. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 110. SEVERITY

P0:
systemic local privilege escalation/update compromise/data destruction

P1:
critical installer/updater/ACL/privilege defect

P2:
material Windows compatibility/reliability issue

P3:
limited platform issue

P4:
hardening

## 111. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Windows version:
Install scope:
Privilege:
Component:
Trigger:
Current behavior:
Expected Windows behavior:
Impact:
Evidence:
Root cause:
Fix:
Installer/update regression test:
```

## 112. MATRICES

### Windows Environment Matrix

| Scenario | Admin | Standard user | Multi-user | Enterprise |
|---|---|---|---|---|

### Privilege Matrix

| Action | Current token | Required token | Elevation justified |
|---|---|---|---|

### Update Matrix

| Installed state | Update | Locked files | Rollback |
|---|---|---|---|

## 113. SECOND PASS

Test:

- standard user
- Unicode path
- Program Files install
- multi-user
- locked executable
- antivirus delay
- sleep/resume
- update interruption
- expired auth token
- service stopped
- firewall enabled
- high DPI
- RDP session

## 114. FINAL QUALITY GATE

Confirm:

- install
- locations
- ACL
- UAC
- elevation
- IPC
- registry
- service
- startup
- code signing
- SmartScreen
- update
- process lifecycle
- credentials
- logs/dumps
- enterprise constraints
- standard user

## 115. OUTPUT

`WINDOWS_APPLICATION_PRODUCTION_AUDIT.md`

# KONAČNO PRAVILO

Windows-specific audit mora proveriti stvarni token, ACL, install scope i update lifecycle.

"Radi kod mene kao administrator" nije production dokaz.
