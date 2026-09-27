---
id: UPL-IT-096
number: 96
slug: game-architecture-audit
title: Audit arhitekture igre
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# AUDIT ARHITEKTURE IGRE

Želim dubok audit architecture game projekta sa fokusom na game loop, state, scene/world lifecycle, save systems, networking, asset management, determinism i maintainability.

Glavni cilj:

> Utvrditi da li architecture može da podrži realne gameplay systems, content growth i runtime failure scenarije bez state corruption-a, hidden coupling-a, save incompatibility-ja ili nekontrolisane kompleksnosti.

Ovo nije:

- engine preference debate
- ECS evangelizam
- OOP vs ECS rat
- insistiranje na design pattern-ima
- gameplay design review osim gde architecture sprečava behavior

## 1. ENGINE/STACK

## 2. GAME LOOP

## 3. UPDATE

## 4. FIXED UPDATE

## 5. RENDER

## 6. SIMULATION

## 7. TIME STEP

## 8. FRAME RATE DEPENDENCE

## 9. GLOBAL TIME

## 10. PAUSE

## 11. SLOW MOTION

## 12. GAME STATE

## 13. MENU

## 14. LEVEL

## 15. WORLD

## 16. SCENE

## 17. TRANSITION

## 18. LOADING

## 19. ASSET STREAMING

## 20. ENTITY LIFECYCLE

## 21. COMPONENT LIFECYCLE

## 22. EVENT BUS

## 23. GLOBAL SINGLETON

## 24. SERVICE LOCATOR

Not automatically bad.

## 25. DEPENDENCY

## 26. HIDDEN COUPLING

## 27. SCRIPT ORDER

## 28. INITIALIZATION ORDER

## 29. SAVE SYSTEM

Critical.

## 30. SAVE VERSION

## 31. MIGRATION

## 32. PARTIAL SAVE

## 33. ATOMIC SAVE

## 34. AUTOSAVE

## 35. CLOUD SAVE

## 36. CONFLICT

## 37. PROFILE

## 38. MULTIPLE SLOTS

## 39. CORRUPTION

## 40. MODDING

If supported.

## 41. SERIALIZATION

## 42. OBJECT REFERENCES

## 43. IDENTITY

## 44. CONTENT ID

## 45. PATCH/DLC

## 46. ASSET ID STABILITY

## 47. ASSET BUNDLE

## 48. ADDRESSABLE/RESOURCE SYSTEM

## 49. MISSING ASSET

## 50. HOT RELOAD

## 51. POOLING

## 52. OBJECT LIFETIME

## 53. AUDIO

## 54. INPUT

## 55. REBINDING

## 56. CONTROLLER

## 57. MULTIPLAYER

If applicable.

## 58. AUTHORITATIVE SERVER

## 59. CLIENT PREDICTION

## 60. RECONCILIATION

## 61. LAG COMPENSATION

## 62. DETERMINISM

## 63. RANDOMNESS

## 64. SEED

## 65. REPLAY

## 66. DESYNC

## 67. MATCH STATE

## 68. RECONNECT

## 69. HOST MIGRATION

If applicable.

## 70. CHEAT TRUST BOUNDARY

## 71. CLIENT AUTHORITY

## 72. INVENTORY

## 73. ECONOMY

## 74. TRANSACTION

## 75. DUPLICATE REWARD

## 76. ACHIEVEMENT

## 77. QUEST STATE

## 78. STATE MACHINE

## 79. AI SYSTEM

## 80. PATHFINDING

## 81. ECS

If used.

## 82. THREADING

## 83. JOB SYSTEM

## 84. DATA RACE

## 85. MAIN THREAD

## 86. GPU RESOURCE

## 87. PLATFORM

## 88. BUILD CONFIG

## 89. DEVELOPMENT CHEAT

## 90. DEBUG COMMAND

## 91. LIVEOPS

## 92. REMOTE CONFIG

## 93. FEATURE FLAG

## 94. CONTENT VERSION

## 95. TELEMETRY

## 96. CRASH

## 97. CRASH RECOVERY

## 98. FALSE POSITIVE RULES

Do not flag:

- singleton
- event bus
- ECS
- OOP
- pooling
- scene architecture

without concrete coupling/reliability/performance consequence.

## 99. EVIDENCE TIERS

```text
A - reproduced gameplay/save/network failure
B - complete architecture/state path
C - strong static evidence
D - architectural concern requiring validation
E - hardening
```

## 100. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 101. SEVERITY

P0:
catastrophic save/economy/server-authority corruption at scale

P1:
critical persistent-state or multiplayer correctness failure

P2:
material architecture/state defect

P3:
maintainability/performance risk

P4:
hardening

## 102. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
System:
Game state:
Trigger:
Current architecture:
Invariant:
Failure:
Player impact:
Persistence/network impact:
Evidence:
Root cause:
Fix:
Regression scenario:
```

## 103. SYSTEM MATRIX

| System | Owner | State | Update phase | Persistence |
|---|---|---|---|---|

## 104. SAVE MATRIX

| Data | ID | Versioned | Migration | Atomic |
|---|---|---|---|---|

## 105. SECOND PASS

Test:

- load old save
- crash during save
- level unload mid-task
- duplicate reward
- pause/resume
- low FPS
- 2x speed
- reconnect
- content missing
- remote config changed
- DLC removed
- host disconnect

## 106. FINAL QUALITY GATE

Confirm:

- loop
- time
- state
- lifecycle
- save
- content
- assets
- input
- multiplayer
- authority
- determinism
- threading
- liveops
- crash recovery

## 107. OUTPUT

`GAME_ARCHITECTURE_AUDIT.md`

# KONAČNO PRAVILO

Game architecture mora da čuva gameplay i persistent invariants kroz:

```text
frame
scene
save
patch
reconnect
crash
```

a ne samo da izgleda modularno u codebase-u.
