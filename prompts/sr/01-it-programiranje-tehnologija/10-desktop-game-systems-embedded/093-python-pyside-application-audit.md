---
id: UPL-IT-093
number: 93
slug: python-pyside-application-audit
title: Audit Python/PySide aplikacije
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# AUDIT PYTHON/PYSIDE APLIKACIJE

Želim kompletan production audit Python/PySide ili PyQt desktop aplikacije.

Glavni cilj:

> Utvrditi da li Qt event loop, threading, signals/slots, worker lifecycle, filesystem, packaging, subprocesses i lokalni state rade bez UI freeze-a, race condition-a, orphan thread-ova, crash-a, resource leak-a ili release-only problema.

Ovo nije:

- Python style review
- PEP8 audit
- automatska preporuka asyncio-a
- automatska kritika thread-ova
- samo UI audit

## 1. STACK

Utvrdi:

- Python version
- PySide/PyQt version
- packaging tool
- Qt modules
- asyncio integration
- DB
- subprocess
- network
- native libs

## 2. QT EVENT LOOP

## 3. MAIN THREAD

UI operations belong on UI thread.

## 4. BLOCKING WORK

Search for:

- network
- file IO
- DB
- CPU
- subprocess wait

on UI thread.

## 5. QTHREAD

## 6. MOVE TO THREAD

## 7. QTHREAD SUBCLASS

Not automatically wrong.

## 8. QRUNNABLE

## 9. THREADPOOL

## 10. SIGNAL/SLOT

## 11. CONNECTION TYPE

## 12. CROSS-THREAD OBJECT

## 13. QObject AFFINITY

## 14. DELETE LATER

## 15. WORKER LIFETIME

## 16. WINDOW CLOSE

## 17. WORKER STILL RUNNING

## 18. APP SHUTDOWN

## 19. THREAD JOIN

## 20. CANCELLATION

## 21. COOPERATIVE CANCEL

## 22. FORCE TERMINATE

High-risk.

## 23. RACE

## 24. SHARED PYTHON STATE

## 25. GIL

Does not eliminate logical race.

## 26. NATIVE CODE

May release GIL.

## 27. SIGNAL AFTER DELETE

## 28. STALE CALLBACK

## 29. UI OBJECT DESTROYED

## 30. EXCEPTION IN SLOT

## 31. GLOBAL EXCEPTION HANDLER

## 32. CRASH REPORT

## 33. ASYNCIO

If integrated.

## 34. QEVENTLOOP

## 35. NESTED EVENT LOOP

## 36. MODAL DIALOG

## 37. REENTRANCY

## 38. PROGRESS

## 39. CANCELLABLE TASK

## 40. DOWNLOAD

## 41. RESUME

## 42. FILE SAVE

## 43. ATOMIC WRITE

## 44. SQLITE

## 45. CONNECTION PER THREAD

DB-dependent.

## 46. TRANSACTION

## 47. CURSOR LIFETIME

## 48. ORM

## 49. CONFIG

## 50. QSETTINGS

## 51. SECRET

## 52. KEYRING

## 53. TEMP

## 54. PATH

## 55. WINDOWS PATH

## 56. UNICODE

## 57. SUBPROCESS

- `subprocess`
- QProcess

## 58. QPROCESS

## 59. STDOUT

## 60. DEADLOCK ON PIPE

## 61. SHELL

## 62. ARGUMENT QUOTING

## 63. CHILD LIFECYCLE

## 64. TERMINATION

## 65. PROCESS TREE

## 66. PACKAGING

- PyInstaller
- Nuitka
- cx_Freeze
- other

## 67. HIDDEN IMPORT

## 68. PLUGIN

## 69. QT PLATFORM PLUGIN

## 70. FFMPEG/EXTERNAL BINARY

## 71. PATH AT RUNTIME

## 72. FROZEN VS SOURCE

## 73. `sys._MEIPASS`

If PyInstaller.

## 74. ONEFILE EXTRACTION

## 75. ANTIVIRUS

## 76. CODE SIGNING

## 77. UPDATE

## 78. VERSION MIGRATION

## 79. MULTI-INSTANCE

## 80. FILE LOCK

## 81. TRAY APP

## 82. HIDDEN WINDOW

## 83. PROCESS EXIT

## 84. MEMORY

## 85. SIGNAL CONNECTION LEAK

## 86. TIMER

## 87. QPIXMAP/QIMAGE

## 88. LARGE IMAGE

## 89. MODEL/VIEW

## 90. LARGE TABLE

## 91. LAZY LOAD

## 92. UI FREEZE

## 93. CPU

## 94. NUMPY/NATIVE

## 95. DEVICE/GPU

If applicable.

## 96. HIGH DPI

## 97. MULTI-MONITOR

## 98. THEME

## 99. LOCALIZATION

## 100. FALSE POSITIVE RULES

Do not automatically report:

- QThread usage
- nested event loop
- PyInstaller
- global signal
- QSettings
- Python threading

Need actual failure path.

## 101. EVIDENCE TIERS

```text
A - reproduced runtime/release failure
B - complete Qt/thread/lifecycle path
C - strong static evidence
D - suspected issue
E - hardening
```

## 102. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 103. SEVERITY

P0:
catastrophic corruption or arbitrary-code/update compromise

P1:
repeatable critical crash/data loss/thread safety defect

P2:
material freeze/reliability/release issue

P3:
limited performance/resource weakness

P4:
hardening

## 104. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Python/Qt version:
Object/thread:
Trigger:
Event sequence:
UI thread impact:
Persistent state:
Crash/leak risk:
Evidence:
Root cause:
Fix:
Regression test:
Frozen-build verification:
```

## 105. THREAD MATRIX

| Component | Created on | Runs on | Signals to | Shutdown |
|---|---|---|---|---|

## 106. RESOURCE MATRIX

| Resource | Owner | Open | Close | Crash behavior |
|---|---|---|---|---|

## 107. SECOND PASS

Test:

- close window while worker runs
- cancel download
- network timeout
- rapid start/stop
- process shutdown
- repeated open/close dialogs
- large file
- packaged build
- missing external binary
- non-ASCII user path
- DB locked
- child process hangs

## 108. FINAL QUALITY GATE

Confirm:

- event loop
- UI thread
- workers
- thread affinity
- cancellation
- shutdown
- DB
- filesystem
- subprocesses
- packaging
- external binaries
- updates
- resource lifecycle
- release build

## 109. OUTPUT

`PYTHON_PYSIDE_APPLICATION_AUDIT.md`

## 110. FAILURE CHAIN

```text
worker thread downloads file
↓
user closes window
↓
QObject receiving progress signals is destroyed
↓
worker keeps emitting and accesses stale state
↓
intermittent crash during shutdown
```

# KONAČNO PRAVILO

PySide audit mora pratiti:

```text
QObject ownership
+
thread affinity
+
event-loop lifecycle
+
resource cleanup
+
frozen-build behavior
```

a ne samo Python syntax.
