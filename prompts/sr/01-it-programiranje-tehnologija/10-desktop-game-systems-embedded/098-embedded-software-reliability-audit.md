---
id: UPL-IT-098
number: 98
slug: embedded-software-reliability-audit
title: Audit pouzdanosti embedded softvera
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Desktop, igre, sistemi i embedded
subcategory_id: desktop-game-systems-embedded
language: sr
version: 1.0.0
status: stable
---

# AUDIT POUZDANOSTI EMBEDDED SOFTVERA

Želim dubok reliability i correctness audit embedded/firmware sistema sa fokusom na timing, interrupts, memory, persistent state, watchdog, power loss, hardware interaction i recovery.

Glavni cilj:

> Utvrditi da li firmware može bezbedno da nastavi rad ili se oporavi kada se pojave reset, power loss, noisy input, partial peripheral failure, timing pressure, communication corruption ili memory exhaustion.

Ovo nije:

- generic C/C++ review
- hardware schematic audit
- RTOS evangelizam
- automatska preporuka dynamic/static memory model-a
- safety certification

Ako je sistem safety-critical:

jasno označi da ovaj audit nije formalna certification zamena.

## 1. PLATFORM

- MCU/SoC
- architecture
- clock
- RAM
- flash
- peripherals
- RTOS/bare metal
- bootloader

## 2. RESET PATH

## 3. POWER-ON

## 4. BROWNOUT

## 5. WATCHDOG

## 6. WATCHDOG FEED

## 7. WATCHDOG BLIND SPOT

Task hangs but another task feeds watchdog.

## 8. BOOTLOADER

## 9. FIRMWARE UPDATE

## 10. A/B SLOT

## 11. ROLLBACK

## 12. FAILED UPDATE

## 13. IMAGE SIGNATURE

## 14. VERSION

## 15. DOWNGRADE

## 16. INTERRUPT

## 17. ISR LENGTH

## 18. PRIORITY

## 19. SHARED DATA

## 20. VOLATILE

Not concurrency primitive.

## 21. ATOMIC

## 22. CRITICAL SECTION

## 23. INTERRUPT MASKING

## 24. DMA

## 25. CACHE COHERENCY

Where relevant.

## 26. RTOS TASK

## 27. PRIORITY INVERSION

## 28. DEADLOCK

## 29. STARVATION

## 30. SCHEDULING

## 31. DEADLINE

## 32. JITTER

## 33. WCET

Where needed.

## 34. TIMER

## 35. TICK WRAPAROUND

## 36. INTEGER WRAP

## 37. CLOCK

## 38. RTC

## 39. CLOCK DRIFT

## 40. COMMUNICATION

- UART
- SPI
- I2C
- CAN
- USB
- BLE
- Ethernet

## 41. FRAME VALIDATION

## 42. CRC

## 43. TIMEOUT

## 44. RETRY

## 45. BUS LOCK

## 46. DEVICE ABSENT

## 47. PARTIAL PERIPHERAL FAILURE

## 48. SENSOR

## 49. OUT-OF-RANGE

## 50. NOISE

## 51. DEBOUNCE

## 52. ACTUATOR

## 53. SAFE STATE

## 54. FAIL-SAFE

## 55. FAIL-OPERATIONAL

If requirement.

## 56. MEMORY

## 57. STACK

## 58. STACK OVERFLOW

## 59. HEAP

## 60. FRAGMENTATION

## 61. BUFFER

## 62. BOUNDS

## 63. USE-AFTER-FREE

## 64. STATIC LIFETIME

## 65. RESOURCE HANDLE

## 66. FLASH

## 67. EEPROM/NVM

## 68. WEAR

## 69. ATOMIC PERSISTENCE

## 70. POWER LOSS DURING WRITE

## 71. CRC/VERSION OF STORED DATA

## 72. FACTORY RESET

## 73. CALIBRATION

## 74. CONFIG

## 75. CORRUPT CONFIG

## 76. LOGGING

## 77. RING BUFFER

## 78. LOG STORM

## 79. STORAGE FULL

## 80. DIAGNOSTICS

## 81. SAFE MODE

## 82. RECOVERY MODE

## 83. ASSERT

## 84. PRODUCTION ASSERTION

## 85. HARD FAULT

## 86. CRASH DUMP

## 87. RESET REASON

## 88. BREADCRUMB

## 89. POWER

## 90. SLEEP

## 91. WAKE

## 92. RACE AFTER WAKE

## 93. LOW VOLTAGE

## 94. THERMAL

## 95. EMI

Software-level resilience only.

## 96. TEST

## 97. HIL

## 98. SIL

## 99. FAULT INJECTION

## 100. FUZZ

Protocols/parsers.

## 101. LONG-RUN

## 102. RESET LOOP

## 103. FALSE POSITIVE RULES

Do not automatically flag:

- bare metal
- RTOS
- dynamic allocation
- interrupts
- polling
- watchdog

without actual reliability consequence.

## 104. EVIDENCE TIERS

```text
A - reproduced HIL/runtime/fault-injection failure
B - complete timing/state/hardware interaction proof
C - strong static evidence
D - plausible embedded failure
E - hardening
```

## 105. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 106. SEVERITY

P0:
unsafe uncontrolled hardware behavior, systemic bricking or unrecoverable critical state

P1:
repeatable severe reliability/persistent-state/watchdog/update defect

P2:
material timing/peripheral/recovery issue

P3:
limited robustness issue

P4:
hardening

## 107. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Hardware:
Firmware version:
Task/ISR:
Peripheral:
Trigger:
Timing/state sequence:
Expected invariant:
Actual behavior:
Safe state:
Recovery:
Evidence:
Root cause:
Fix:
HIL/fault regression:
```

## 108. FAILURE MATRIX

| Failure | Detection | Safe state | Recovery | Persistent impact |
|---|---|---|---|---|

## 109. SECOND PASS

Inject:

- power loss during write
- peripheral absent
- corrupt packet
- stuck bus
- high interrupt load
- task starvation
- low memory
- watchdog reset
- update interrupted
- corrupt config
- timer wrap
- repeated sleep/wake

## 110. FINAL QUALITY GATE

Confirm:

- reset
- boot
- update
- interrupts
- RTOS
- timing
- communication
- peripherals
- memory
- persistent data
- watchdog
- safe state
- power
- diagnostics
- fault injection

## 111. OUTPUT

`EMBEDDED_SOFTWARE_RELIABILITY_AUDIT.md`

## 112. FAILURE CHAIN

```text
configuration written in-place to flash
↓
power fails halfway
↓
CRC not stored separately
↓
next boot reads partially updated configuration
↓
actuator starts with invalid threshold
```

# KONAČNO PRAVILO

Embedded reliability audit mora uvek pitati:

> Šta se dešava kada sistem izgubi power, vreme, komunikaciju ili periferiju usred state transition-a?
