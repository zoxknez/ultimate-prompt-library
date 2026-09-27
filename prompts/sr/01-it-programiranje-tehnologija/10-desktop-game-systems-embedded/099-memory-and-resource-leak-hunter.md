---
id: UPL-IT-099
number: 99
slug: memory-and-resource-leak-hunter
title: Lov na curenje memorije i resursa
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# LOV NA CURENJE MEMORIJE I RESURSA

Želim duboku analizu memory, handle, thread, file, socket, GPU i drugih resource leak-ova kroz realan lifecycle aplikacije.

Glavni cilj:

> Pronaći resurse koji se alociraju/otvaraju, ali se ne oslobađaju ili se oslobađaju tek nakon neprihvatljivo dugog vremena, i dokazati leak kroz lifecycle i measurement evidence.

Ovo nije:

- "memory usage is high"
- pretpostavka da GC znači nema leak-a
- pretpostavka da native app mora ručno oslobađati sve
- brojanje allocation-a bez lifetime analize

## 1. RESOURCE INVENTORY

- heap
- native heap
- file
- socket
- DB connection
- thread
- process
- timer
- listener
- subscription
- GPU texture/buffer
- window
- handle
- cursor
- lock
- mapped file

## 2. OWNERSHIP

Za svaki:

```text
Owner:
Created:
Expected lifetime:
Released:
Release trigger:
Failure cleanup:
```

## 3. BASELINE

## 4. STEADY STATE

## 5. REPEATED OPERATION

## 6. GROWTH CURVE

## 7. PLATEAU

Growing then plateau may be cache, not leak.

## 8. CACHE

## 9. UNBOUNDED CACHE

## 10. RETENTION

## 11. REFERENCE CHAIN

## 12. GLOBAL

## 13. STATIC

## 14. CLOSURE

## 15. EVENT LISTENER

## 16. SIGNAL/SLOT

## 17. OBSERVER

## 18. CALLBACK

## 19. TIMER

## 20. INTERVAL

## 21. BACKGROUND TASK

## 22. THREAD

## 23. EXECUTOR

## 24. THREADPOOL

## 25. SOCKET

## 26. HTTP CLIENT

## 27. RESPONSE BODY

## 28. DB CONNECTION

## 29. CURSOR

## 30. TRANSACTION

## 31. FILE

## 32. STREAM

## 33. TEMP FILE

## 34. SUBPROCESS

## 35. PIPE

## 36. HANDLE

## 37. WINDOW

## 38. DIALOG

## 39. VIEW MODEL

## 40. COMPONENT UNMOUNT

## 41. DOM

If relevant.

## 42. IMAGE

## 43. BITMAP

## 44. GPU

## 45. TEXTURE

## 46. FRAMEBUFFER

## 47. CUDA/COMPUTE

If relevant.

## 48. MEDIA

## 49. DECODER

## 50. CAMERA

## 51. MICROPHONE

## 52. FILE WATCHER

## 53. NETWORK WATCHER

## 54. OS NOTIFICATION

## 55. IPC SUBSCRIPTION

## 56. FFI

## 57. NATIVE LIB

## 58. FINALIZER

## 59. GC

## 60. GC ROOT

## 61. REFERENCE CYCLE

## 62. WEAK REFERENCE

## 63. CANCELLATION

## 64. EXCEPTION PATH

High-value.

## 65. EARLY RETURN

## 66. RETRY

## 67. PARTIAL INIT

## 68. INIT FAILURE CLEANUP

## 69. SHUTDOWN

## 70. APP RESTART

## 71. SESSION

## 72. OPEN/CLOSE LOOP

## 73. CONNECT/DISCONNECT LOOP

## 74. PLAY/STOP LOOP

## 75. NAVIGATION LOOP

## 76. DOWNLOAD/CANCEL LOOP

## 77. PROFILER

Use:

- heap snapshots
- allocation profiler
- OS handles
- thread count
- fd count
- GPU profiler

## 78. BEFORE/AFTER SNAPSHOT

## 79. DOMINATOR TREE

Where applicable.

## 80. RETAINED SIZE

## 81. ALLOCATION STACK

## 82. NATIVE MEMORY

## 83. RSS

## 84. WORKING SET

## 85. PRIVATE BYTES

Platform-dependent.

## 86. FALSE POSITIVE RULES

Ne prijavljuj kao leak samo zato što:

- memory doesn't immediately return to OS
- cache grows
- runtime reserves heap
- thread pool remains alive
- allocator keeps arena

Need unbounded/unexpected retention.

## 87. EVIDENCE TIERS

```text
A - reproducible unbounded resource growth with ownership proof
B - complete missing-release/lifecycle path
C - strong profiler evidence
D - suspected retention
E - hardening
```

## 88. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 89. SEVERITY

P0:
resource leak causes catastrophic system-wide exhaustion or corruption

P1:
repeatable production exhaustion/crash under realistic use

P2:
material long-session degradation

P3:
limited leak with bounded impact

P4:
hardening

## 90. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Resource:
Owner:
Create path:
Expected release:
Actual retention:
Reproduction loop:
Baseline:
After N iterations:
Growth rate:
Impact:
Profiler evidence:
Root cause:
Fix:
Regression measurement:
```

## 91. RESOURCE MATRIX

| Resource | Baseline | After loop | Expected plateau | Leak |
|---|---:|---:|---:|---|

## 92. SECOND PASS

Repeat:

- open/close window 100x
- connect/disconnect
- start/cancel job
- play/stop media
- load/unload document
- login/logout
- network failure
- exception during initialization
- process child launch/kill

## 93. FINAL QUALITY GATE

Confirm:

- ownership
- lifetime
- normal path
- error path
- cancel
- retry
- shutdown
- profiler evidence
- cache vs leak
- native/managed resources
- long-session impact

## 94. OUTPUT

`MEMORY_RESOURCE_LEAK_HUNTER.md`

## 95. FAILURE CHAIN

```text
user opens video
↓
decoder allocates native buffers
↓
user closes player
↓
UI object is destroyed
↓
decoder subscription remains referenced by global manager
↓
buffers retained
↓
each open/close increases memory until crash
```

# KONAČNO PRAVILO

Memory leak finding mora dokazati:

```text
resource
+
owner
+
expected release point
+
actual retention path
+
measured growth
```
