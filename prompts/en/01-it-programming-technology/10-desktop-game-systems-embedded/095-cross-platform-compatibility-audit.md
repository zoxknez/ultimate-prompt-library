---
id: UPL-IT-095
number: 95
slug: cross-platform-compatibility-audit
title: Cross-Platform Compatibility Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Desktop, Game, Systems & Embedded
subcategory_id: desktop-game-systems-embedded
language: en
version: 1.0.0
status: stable
---

# CROSS-PLATFORM COMPATIBILITY AUDIT

I want a deep audit of an application that runs on several operating systems/platforms, with the goal of finding implicit platform assumptions, divergent behavior and release gaps.

Main objective:

> Determine whether the same logical feature actually works consistently and safely on all supported platforms, with intentional differences explicitly documented.

This is not:

- insisting on a 100% identical UX
- a ban on platform-specific code
- an automatic recommendation of an abstraction layer
- only a compile test

## 1. PLATFORM MATRIX

Inventory:

- Windows
- macOS
- Linux
- architecture
- package format
- runtime version

## 2. FEATURE MATRIX

## 3. INTENTIONAL DIFFERENCE

## 4. ACCIDENTAL DIFFERENCE

## 5. FILESYSTEM

- separators
- case sensitivity
- reserved names
- permissions
- symlink
- path length
- Unicode

## 6. HOME/USER DATA

## 7. TEMP

## 8. EXECUTABLE PATH

## 9. CURRENT WORKING DIRECTORY

## 10. FILE LOCK

## 11. DELETE OPEN FILE

Platform difference.

## 12. RENAME

## 13. ATOMIC REPLACE

## 14. LINE ENDINGS

## 15. SHELL

## 16. COMMAND QUOTING

## 17. ENVIRONMENT VARIABLES

## 18. PROCESS SIGNALS

## 19. PROCESS TREE

## 20. PERMISSIONS

## 21. ADMIN/ROOT

## 22. SERVICE/DAEMON

## 23. IPC

## 24. SOCKET

## 25. NAMED PIPE

## 26. UNIX SOCKET

## 27. PORT

## 28. FIREWALL

## 29. TLS TRUST STORE

## 30. CERTIFICATE

## 31. PROXY

## 32. CREDENTIAL STORE

- DPAPI
- Keychain
- Secret Service/keyring

## 33. NOTIFICATION

## 34. TRAY

## 35. GLOBAL SHORTCUT

## 36. CLIPBOARD

## 37. FILE DIALOG

## 38. DRAG/DROP

## 39. DEEP LINK

## 40. FILE ASSOCIATION

## 41. AUTOSTART

## 42. UPDATE

## 43. SIGNING

## 44. NOTARIZATION

## 45. PACKAGE MANAGER

## 46. INSTALL LOCATION

## 47. SANDBOX

## 48. ENTITLEMENTS

## 49. WAYLAND/X11

If Linux UI relevant.

## 50. DISPLAY SERVER

## 51. DPI

## 52. FONT

## 53. FONT METRIC

## 54. TEXT RENDERING

## 55. INPUT METHOD

## 56. IME

## 57. KEYBOARD SHORTCUT

## 58. MODIFIER KEY

## 59. TOUCHPAD

## 60. MULTI-MONITOR

## 61. WINDOW MANAGER

## 62. MINIMIZE/CLOSE

## 63. SLEEP/RESUME

## 64. CLOCK

## 65. TIMEZONE

## 66. LOCALE

## 67. ENCODING

## 68. ARCHITECTURE

x64/ARM64.

## 69. ENDIANNESS

If relevant.

## 70. NATIVE LIBRARY

## 71. ABI

## 72. GPU

## 73. DRIVER

## 74. HARDWARE ACCELERATION

## 75. TEST MATRIX

## 76. CI MATRIX

## 77. PHYSICAL MACHINE

## 78. VM

## 79. RELEASE PACKAGE

## 80. INSTALL/UPDATE TEST

## 81. FEATURE PARITY

## 82. DOCUMENTED NON-PARITY

## 83. FALLBACK

## 84. FALSE POSITIVE RULES

Platform-specific implementation is not inherently bad.

Different UX is not inherently bad.

Finding requires unintended incompatibility or risk.

## 85. EVIDENCE TIERS

```text
A - reproduced platform failure
B - complete platform-specific code path
C - strong static evidence
D - suspected difference
E - compatibility hardening
```

## 86. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 87. SEVERITY

P0:
catastrophic platform-specific data/security failure

P1:
critical feature/install/update broken on supported platform

P2:
material incompatibility

P3:
limited platform inconsistency

P4:
hardening

## 88. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Platform:
Version/arch:
Feature:
Expected:
Actual:
Platform assumption:
Impact:
Evidence:
Fix:
Regression matrix:
```

## 89. PLATFORM MATRIX

| Feature | Windows | macOS | Linux | Intentional difference |
|---|---|---|---|---|

## 90. SECOND PASS

Test:

- non-ASCII path
- case-sensitive FS
- ARM64
- different locale
- display scaling
- sleep/resume
- update
- standard user
- proxy
- native dependency missing
- deep link
- app launched from unexpected cwd

## 91. FINAL QUALITY GATE

Confirm:

- filesystem
- process
- IPC
- permissions
- credentials
- install/update
- signing
- UI
- input
- networking
- native libs
- architecture
- tests

## 92. OUTPUT

`CROSS_PLATFORM_COMPATIBILITY_AUDIT.md`

# FINAL RULE

Cross-platform quality is not:

> "the same code runs everywhere"

but:

> the same product invariant is preserved on every supported platform, with intentional and documented platform differences.
