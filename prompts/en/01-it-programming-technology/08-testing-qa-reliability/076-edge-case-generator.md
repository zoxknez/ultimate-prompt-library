---
id: UPL-IT-076
number: 76
slug: edge-case-generator
title: Edge Case Generator
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Testing, QA & Reliability
subcategory_id: testing-qa-reliability
language: en
version: 1.0.0
status: stable
---

# EDGE CASE GENERATOR

I want you to generate a systematic set of edge cases for a specific feature, API, data model, workflow or application, based on the real input domains, state transitions, boundaries and failure semantics.

Main objective:

> Find boundary combinations that are technically allowed or realistically possible and that typical happy-path development easily misses.

This is not:

- a random list of "null, empty, huge"
- a generic checklist without context
- inventing impossible states
- 500 edge cases without priorities

## 1. DEFINE DOMAIN

First establish:

- inputs
- outputs
- states
- actors
- invariants
- dependencies
- limits

## 2. INPUT PARTITION

Normal.

## 3. MINIMUM

## 4. MAXIMUM

## 5. ZERO

## 6. ONE

## 7. OFF-BY-ONE

## 8. NEGATIVE

If type permits.

## 9. NULL

## 10. EMPTY

## 11. WHITESPACE

## 12. VERY LONG

## 13. UNICODE

## 14. EMOJI

## 15. RTL

## 16. COMBINING CHARACTERS

## 17. NORMALIZATION

## 18. CASE

## 19. LOCALE

## 20. SPECIAL CHAR

## 21. DELIMITER

## 22. ESCAPE

## 23. ENCODING

## 24. MALFORMED

## 25. DUPLICATE

## 26. ORDER

## 27. OUT OF ORDER

## 28. MISSING FIELD

## 29. EXTRA FIELD

## 30. UNKNOWN ENUM

## 31. OLD ENUM

## 32. FUTURE VALUE

## 33. DATE

## 34. LEAP YEAR

## 35. DST

## 36. TIMEZONE

## 37. MIDNIGHT

## 38. CLOCK SKEW

## 39. EXPIRY BOUNDARY

## 40. MONEY

## 41. ROUNDING

## 42. CURRENCY

## 43. PRECISION

## 44. FLOAT

## 45. LARGE INTEGER

## 46. IDENTIFIER

## 47. UUID

## 48. CASE-SENSITIVE ID

## 49. FILE

## 50. EMPTY FILE

## 51. LARGE FILE

## 52. WRONG MIME

## 53. EXTENSION MISMATCH

## 54. CORRUPT FILE

## 55. DUPLICATE FILE

## 56. NETWORK

## 57. TIMEOUT

## 58. SLOW

## 59. PARTIAL RESPONSE

## 60. RETRY

## 61. DUPLICATE REQUEST

## 62. CANCELLATION

## 63. DISCONNECT

## 64. CONCURRENCY

## 65. SAME USER TWO TABS

## 66. TWO USERS SAME RESOURCE

## 67. STALE VERSION

## 68. LOST UPDATE

## 69. DELETE/UPDATE RACE

## 70. CREATE/CREATE RACE

## 71. PERMISSION CHANGE

## 72. SESSION EXPIRE

## 73. TOKEN ROTATE

## 74. FEATURE FLAG CHANGE

## 75. CONFIG CHANGE

## 76. OLD CLIENT

## 77. NEW SERVER

## 78. NEW CLIENT

## 79. OLD SERVER

## 80. CACHE STALE

## 81. CACHE MISS

## 82. CACHE DUPLICATE

## 83. DB REPLICA LAG

## 84. BACKGROUND JOB DELAY

## 85. EVENT DUPLICATE

## 86. EVENT MISSING

## 87. EVENT REORDER

## 88. THIRD PARTY

## 89. RATE LIMIT

## 90. API SCHEMA DRIFT

## 91. BUSINESS STATE

## 92. IMPOSSIBLE STATE

Only if system can actually reach it.

## 93. RECOVERY

## 94. ROLLBACK

## 95. RESTORE

## 96. PARTIAL MIGRATION

## 97. ACCESSIBILITY

## 98. KEYBOARD

## 99. SCREEN READER

## 100. SMALL VIEWPORT

## 101. ZOOM

## 102. LOW BANDWIDTH

## 103. OFFLINE

## 104. LOW STORAGE

## 105. LOW MEMORY

## 106. FALSE POSITIVE RULES

Do not include an edge case if:

- type/system proves impossible
- framework guarantees invariant
- scenario requires unrealistic corruption outside threat model

unless resilience to that failure is explicitly required.

## 107. EVIDENCE TIERS

```text
A - known production/reproduced edge failure
B - reachable state proven from code/model
C - realistic boundary
D - plausible but unverified
E - robustness hardening
```

P0 and P1 edge cases need evidence tier A or B: a known failure, or a state proven reachable from the code or model. Tier D evidence means reachability is not verified; mark such cases NOT VERIFIED and do not present them as confirmed failures.

## 108. PRIORITY

P0/P1:
catastrophic/critical edge behavior.

P2:
material.

P3:
limited.

P4:
optional robustness.

## 109. EDGE CASE FORMAT

```text
ID:
Priority:
Input/state:
Why reachable:
Boundary:
Expected invariant:
Expected behavior:
Likely failure:
Test layer:
Setup:
Assertions:
```

## 110. MATRIX

| Dimension | Normal | Lower boundary | Upper boundary | Invalid | Concurrent |
|---|---|---|---|---|---|

## 111. SECOND PASS

Combine dimensions:

- max length + Unicode
- retry + timeout
- stale session + permission change
- duplicate event + process crash
- old client + new schema
- timezone + DST
- concurrent update + stale cache

Avoid combinatorial explosion. Use pairwise/risk-based selection.

## 112. FINAL QUALITY GATE

Confirm:

- domain-specific
- reachable
- prioritized
- invariants explicit
- combinations considered
- no generic filler
- test layer proposed

## 113. OUTPUT

`EDGE_CASE_TEST_CATALOG.md`

# FINAL RULE

A good edge case is not a "strange input".

It is:

```text
realistic boundary
+
reachable state
+
meaningful invariant
+
a failure the happy path does not reveal
```
