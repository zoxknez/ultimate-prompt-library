---
id: UPL-IT-096
number: 96
slug: game-architecture-audit
title: Game Architecture Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Desktop, Game, Systems & Embedded
subcategory_id: desktop-game-systems-embedded
language: en
version: 1.0.0
status: stable
---

# GAME ARCHITECTURE AUDIT

I want a deep audit of the architecture of a game project with a focus on the game loop, state, scene/world lifecycle, save systems, networking, asset management, determinism and maintainability.

Main objective:

> Determine whether the architecture can support real gameplay systems, content growth and runtime failure scenarios without state corruption, hidden coupling, save incompatibility or uncontrolled complexity.

This is not:

- an engine preference debate
- ECS evangelism
- an OOP vs ECS war
- insisting on design patterns
- a gameplay design review, except where the architecture prevents the intended behavior

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

# FINAL RULE

Game architecture must preserve gameplay and persistent invariants across:

```text
frame
scene
save
patch
reconnect
crash
```

and not only look modular in the codebase.
