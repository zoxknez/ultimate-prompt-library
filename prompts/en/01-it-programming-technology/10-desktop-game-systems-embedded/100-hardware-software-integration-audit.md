---
id: UPL-IT-100
number: 100
slug: hardware-software-integration-audit
title: Hardware/Software Integration Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Desktop, Game, Systems & Embedded
subcategory_id: desktop-game-systems-embedded
language: en
version: 1.0.0
status: stable
---

# HARDWARE / SOFTWARE INTEGRATION AUDIT

I want a complete audit of the boundary between software and physical hardware, including protocol semantics, device discovery, timing, state synchronization, disconnect/reconnect, firmware compatibility and unsafe state behavior.

Main objective:

> Determine whether the software correctly represents the real state of the device and stays reliable when the hardware is late, disappears, returns unexpected data, resets, changes firmware or is in a different physical state than the application assumes.

This is not:

- an electrical engineering audit
- a hardware certification
- a firmware-only audit
- a generic "add retries"
- an assumption that a successful API call means the physical action happened

## 1. SYSTEM MAP

```text
UI/app
↓
driver/library
↓
protocol
↓
transport
↓
firmware
↓
physical device
```

## 2. HARDWARE INVENTORY

## 3. DEVICE VERSION

## 4. FIRMWARE VERSION

## 5. HARDWARE REVISION

## 6. CAPABILITY DISCOVERY

Do not assume every device supports same features.

## 7. PROTOCOL

- serial
- USB
- HID
- BLE
- TCP
- CAN
- proprietary

## 8. MESSAGE FORMAT

## 9. FRAMING

## 10. CRC

## 11. LENGTH

## 12. ENDIANNESS

## 13. VERSION

## 14. UNKNOWN MESSAGE

## 15. UNKNOWN FIELD

## 16. BACKWARD COMPATIBILITY

## 17. FORWARD COMPATIBILITY

## 18. DEVICE DISCOVERY

## 19. HOTPLUG

## 20. MULTIPLE DEVICES

## 21. WRONG DEVICE

## 22. DEVICE IDENTITY

## 23. SERIAL NUMBER

## 24. RECONNECT

## 25. PORT CHANGES

## 26. BLUETOOTH RECONNECT

## 27. CONNECTION STATE

## 28. APPLICATION STATE

## 29. HARDWARE STATE

## 30. STATE DIVERGENCE

## 31. COMMAND

## 32. ACK

## 33. NACK

## 34. NO RESPONSE

## 35. TIMEOUT

## 36. RETRY

## 37. DUPLICATE COMMAND

Critical for physical action.

## 38. IDEMPOTENCY

## 39. SEQUENCE NUMBER

## 40. CORRELATION ID

## 41. UNKNOWN OUTCOME

Command timed out after device may have acted.

## 42. READBACK

Where possible verify physical state.

## 43. COMMAND QUEUE

## 44. ORDER

## 45. OUT-OF-ORDER

## 46. BUFFER

## 47. BACKPRESSURE

## 48. RATE

## 49. DEVICE BUSY

## 50. CONCURRENT COMMAND

## 51. MUTUAL EXCLUSION

## 52. FIRMWARE RESET

## 53. DEVICE REBOOT

## 54. POWER LOSS

## 55. APP CRASH

## 56. PC SLEEP

## 57. USB SUSPEND

## 58. RESUME

## 59. PARTIAL PHYSICAL ACTION

## 60. SAFE STATE

## 61. FAIL-SAFE

## 62. EMERGENCY STOP

If applicable.

## 63. INTERLOCK

## 64. LIMIT SWITCH

## 65. SENSOR

## 66. SENSOR STALE

## 67. SENSOR OUTLIER

## 68. SENSOR FAILURE

## 69. ACTUATOR

## 70. ACTUATOR FEEDBACK

## 71. CALIBRATION

## 72. CALIBRATION VERSION

## 73. UNITS

Critical.

## 74. UNIT CONVERSION

## 75. SCALE

## 76. OFFSET

## 77. PRECISION

## 78. ROUNDING

## 79. RANGE

## 80. CLAMP

## 81. OUT-OF-RANGE COMMAND

## 82. HARDWARE LIMIT

Trusted layer should enforce where safety matters.

## 83. SOFTWARE LIMIT

Not always sufficient.

## 84. FIRMWARE UPDATE

## 85. BOOTLOADER

## 86. UPDATE INTERRUPTION

## 87. FIRMWARE/APP COMPATIBILITY

## 88. ROLLBACK

## 89. DRIVER

## 90. DRIVER VERSION

## 91. OS PERMISSION

## 92. DEVICE LOCK

## 93. MULTIPLE APP INSTANCE

## 94. LOGGING

## 95. RAW PROTOCOL TRACE

Useful for diagnostics.

## 96. TIMESTAMP

## 97. CLOCK SYNC

## 98. TELEMETRY

## 99. DIAGNOSTIC MODE

## 100. SIMULATOR

## 101. HARDWARE-IN-THE-LOOP

## 102. FAULT INJECTION

## 103. MOCK LIMITATION

Mock device may be too perfect.

## 104. PHYSICAL TEST MATRIX

## 105. TEMPERATURE

If behavior depends.

## 106. VOLTAGE/POWER

Software-observable effects only.

## 107. CABLE/CONNECTION

## 108. NOISE

## 109. FALSE POSITIVE RULES

Do not call:

- retry
- serial protocol
- polling
- lack of push events
- hardware-specific branch

a defect automatically.

Need incorrect/unsafe state path.

## 110. EVIDENCE TIERS

```text
A - reproduced hardware/HIL failure
B - complete command/protocol/state proof
C - strong trace/static evidence
D - suspected integration failure
E - hardening
```

## 111. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 112. SEVERITY

P0:
unsafe physical behavior, catastrophic device damage or systemic bricking

P1:
repeatable severe wrong hardware action, critical state desync or firmware compatibility failure

P2:
material operational/reliability problem

P3:
limited integration weakness

P4:
hardening

## 113. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Hardware:
Firmware:
Software:
Transport:
Command/event:
Physical state:
Software state:
Trigger:
Protocol sequence:
Expected invariant:
Actual outcome:
Safety impact:
Evidence:
Root cause:
Fix:
HIL regression:
```

## 114. STATE MATRIX

| Physical state | Software state | Command allowed | Verification |
|---|---|---|---|

## 115. COMPATIBILITY MATRIX

| App version | Firmware | Hardware rev | Supported |
|---|---|---|---|

## 116. FAILURE MATRIX

| Failure | Detection | Device state | App state | Recovery |
|---|---|---|---|---|

## 117. SECOND PASS

Test:

- cable disconnect during command
- device resets after command
- duplicate command
- timeout after physical success
- stale sensor
- unsupported firmware
- two devices
- two app instances
- PC sleep/resume
- update interruption
- out-of-range command
- corrupted packet
- device busy

## 118. FINAL QUALITY GATE

Confirm:

- discovery
- identity
- protocol
- versioning
- commands
- acknowledgement
- timeout
- retry
- idempotency
- physical verification
- disconnect
- reset
- safety state
- sensors
- actuators
- units
- firmware
- drivers
- HIL testing

## 119. OUTPUT

`HARDWARE_SOFTWARE_INTEGRATION_AUDIT.md`

## 120. FAILURE CHAINS

```text
software sends "open valve"
↓
device executes command
↓
USB response is lost
↓
application marks command failed
↓
user clicks Retry
↓
second command is not idempotent
↓
physical system receives unintended duplicate action
```

```text
new desktop app assumes firmware supports field X
↓
older device ignores field silently
↓
application shows requested state
↓
physical device remains in previous state
↓
UI and hardware diverge
```

# FINAL RULE

Hardware/software integration is not correct when:

```text
API call returns success
```

but when the software can prove that the physical system reached the expected and safe state, or clearly recognize that it cannot confirm this.
