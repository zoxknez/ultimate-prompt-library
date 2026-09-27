---
id: UPL-IT-097
number: 97
slug: game-performance-audit
title: Audit performansi igre
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# AUDIT PERFORMANSI IGRE

Želim dubok, measurement-driven audit performance-a igre.

Glavni cilj:

> Identifikovati stvarne CPU, GPU, memory, IO, asset, simulation i frame-time bottleneck-e na ciljanim uređajima i dokazati poboljšanja kroz profiler evidence bez degradacije visual/gameplay quality-ja.

Ovo nije:

- "optimize everything"
- brojanje draw call-ova bez GPU context-a
- pretpostavka da object pooling uvek pomaže
- automatska preporuka lower resolution-a
- fokus samo na average FPS

Prioritet:

**frame-time stability > critical gameplay correctness > memory stability > loading/stutter > thermal/sustained performance > average FPS > optimization polish**

## 1. TARGET HARDWARE

## 2. PERFORMANCE TARGET

- frame rate
- resolution
- memory
- load time

## 3. FRAME BUDGET

At 60 FPS:

~16.67 ms total.

At 30 FPS:

~33.33 ms.

Use actual target.

## 4. CPU FRAME

## 5. GPU FRAME

## 6. BOTTLENECK CLASS

## 7. P50

## 8. P95

## 9. P99

## 10. FRAME PACING

## 11. STUTTER

## 12. HITCH

## 13. ONE-PERCENT LOW

If useful.

## 14. PROFILER

Use engine/platform profiler.

## 15. CPU SAMPLE

## 16. INSTRUMENTATION

## 17. GPU CAPTURE

## 18. RENDERDOC/PLATFORM TOOL

If applicable.

## 19. DRAW CALL

## 20. BATCHING

## 21. INSTANCING

## 22. STATE CHANGE

## 23. OVERDRAW

## 24. TRANSPARENCY

## 25. SHADER

## 26. SHADER VARIANT

## 27. COMPILE STUTTER

## 28. PIPELINE CACHE

## 29. TEXTURE

## 30. TEXTURE MEMORY

## 31. MIPMAP

## 32. STREAMING

## 33. MODEL

## 34. LOD

## 35. CULLING

## 36. OCCLUSION

## 37. LIGHT

## 38. SHADOW

## 39. POSTPROCESS

## 40. PARTICLE

## 41. UI

## 42. CANVAS/UI REBUILD

Engine-specific.

## 43. PHYSICS

## 44. COLLISION

## 45. RIGIDBODY

## 46. RAYCAST

## 47. AI

## 48. PATHFINDING

## 49. ANIMATION

## 50. SKINNING

## 51. AUDIO

## 52. SCRIPT

## 53. ALLOCATION

## 54. GC

## 55. MEMORY

## 56. LEAK

## 57. FRAGMENTATION

## 58. ASSET LIFETIME

## 59. POOL

## 60. SCENE LOAD

## 61. ASYNC LOAD

## 62. DISK IO

## 63. DECOMPRESSION

## 64. NETWORK

Multiplayer.

## 65. SERIALIZATION

## 66. JOB SYSTEM

## 67. THREAD

## 68. CONTENTION

## 69. MAIN THREAD

## 70. WORKER

## 71. GPU/CPU SYNC

## 72. READBACK

## 73. V-SYNC

## 74. FRAME CAP

## 75. DYNAMIC RESOLUTION

## 76. QUALITY LEVEL

## 77. THERMAL

Mobile/laptop.

## 78. BATTERY

## 79. SUSTAINED LOAD

## 80. MEMORY PRESSURE

## 81. BACKGROUND

## 82. LOW-END DEVICE

## 83. HIGH-END DEVICE

## 84. DIFFERENT DRIVER

## 85. BUILD

Development build can distort profiling.

## 86. RELEASE BUILD

## 87. DEBUG OVERHEAD

## 88. WORST-CASE SCENE

## 89. PEAK ENTITY COUNT

## 90. PEAK EFFECTS

## 91. LONG SESSION

## 92. LOAD/UNLOAD LOOP

## 93. TELEPORT

## 94. RAPID SCENE SWITCH

## 95. BENCHMARK

## 96. REPLAYABLE TEST

## 97. OPTIMIZATION PROOF

Before/after.

## 98. VISUAL REGRESSION

## 99. GAMEPLAY REGRESSION

## 100. FALSE POSITIVE RULES

Do not report:

- high draw calls
- GC presence
- high polygon count
- large texture
- object pooling absence

without measured frame/memory impact.

## 101. EVIDENCE TIERS

```text
A - profiler/capture/benchmark proof
B - reproducible bottleneck path
C - strong measured correlation
D - suspected hotspot
E - optimization idea
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
performance failure renders critical game state unusable at scale or causes systemic crash/data corruption

P1:
target hardware cannot sustain required performance or memory

P2:
material stutter/load/frame issue

P3:
localized inefficiency

P4:
optional optimization

## 104. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Hardware:
Build:
Scene:
Metric:
Target:
Measured:
Profiler evidence:
Root cause:
Optimization:
Before:
After:
Visual/gameplay delta:
Regression test:
```

## 105. FRAME MATRIX

| Scenario | CPU ms | GPU ms | Frame ms | Memory | Target met |
|---|---:|---:|---:|---:|---|

## 106. SECOND PASS

Profile:

- worst scene
- low-end target
- long session
- rapid spawn/despawn
- scene load
- shader warmup
- peak particles
- UI-heavy screen
- network match
- background/resume

## 107. FINAL QUALITY GATE

Confirm:

- target hardware
- frame budget
- CPU
- GPU
- memory
- allocation
- IO
- loading
- shader
- physics
- AI
- UI
- thermal
- release build
- long session
- before/after proof

## 108. OUTPUT

`GAME_PERFORMANCE_AUDIT.md`

# KONAČNO PRAVILO

Performance finding bez profiler evidence-a je hypothesis.

Optimizacija je završena tek kada:

```text
measured bottleneck
↓
targeted change
↓
measured improvement
↓
no unacceptable quality regression
```
