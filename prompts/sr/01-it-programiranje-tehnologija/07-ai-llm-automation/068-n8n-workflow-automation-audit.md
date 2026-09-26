---
id: UPL-IT-068
number: 68
slug: n8n-workflow-automation-audit
title: n8n / Workflow Automation Audit
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: AI, LLM i automatizacija
subcategory_id: ai-llm-automation
language: sr
version: 1.0.0
status: stable
---

# N8N / WORKFLOW AUTOMATION AUDIT

Želim kompletan production audit n8n ili ekvivalentnog workflow automation sistema sa fokusom na correctness, retries, idempotency, credentials, concurrency, partial failure, data handling i AI node reliability.

Primeni na:

- n8n
- Make
- Zapier
- custom workflow engines
- serverless orchestrations

ali prvo utvrdi actual platform semantics.

Glavni cilj:

> Utvrditi da li automatizacija pouzdano izvršava business workflow i pod retries, duplicate events, partial failures, credential rotation, rate limits i AI nondeterminism, bez dupliranja side effect-a, gubitka događaja ili curenja podataka.

Ovo nije:

- samo pregled "da li workflow radi"
- screenshot review
- generic node naming advice
- automatska kritika velikog workflow-a
- automatska preporuka da se sve podeli na subworkflow
- pretpostavka da successful execution znači business success

## 1. WORKFLOW INVENTORY

Za svaki:

```text
Workflow:
Trigger:
Purpose:
Criticality:
Inputs:
External systems:
Credentials:
Writes:
AI nodes:
Retries:
Error flow:
Idempotency:
Schedule:
Owner:
```

## 2. TRIGGER

- webhook
- schedule
- queue
- app event
- polling
- manual

## 3. DELIVERY SEMANTICS

At-most-once?

At-least-once?

Unknown?

## 4. DUPLICATE EVENT

Mandatory test.

## 5. EVENT ID

## 6. IDEMPOTENCY KEY

## 7. WEBHOOK RETRY

Provider may retry when response late.

## 8. EARLY 200

Can acknowledge before durable processing.

## 9. LATE 200

Duplicate risk.

## 10. SCHEDULE OVERLAP

## 11. TIMEZONE

## 12. DST

## 13. MISSED SCHEDULE

## 14. CONCURRENT RUN

## 15. SINGLETON

If needed.

## 16. QUEUE MODE

## 17. WORKER

## 18. EXECUTION PERSISTENCE

## 19. CRASH

## 20. RESUME

## 21. PARTIAL FAILURE

## 22. NODE RETRY

## 23. WHOLE-WORKFLOW RETRY

## 24. DUPLICATE SIDE EFFECT

## 25. PAYMENT

## 26. EMAIL

## 27. CRM WRITE

## 28. FILE UPLOAD

## 29. API POST

## 30. DATABASE

## 31. TRANSACTION

Workflow engine does not magically create distributed transaction.

## 32. COMPENSATION

## 33. UNKNOWN OUTCOME

## 34. ERROR BRANCH

## 35. ERROR SWALLOWED

## 36. CONTINUE ON FAIL

High-value review.

## 37. EMPTY DATA

## 38. NULL

## 39. PARTIAL ITEM FAILURE

Batch.

## 40. LOOP OVER ITEMS

## 41. N+1 API CALL

## 42. BATCHING

## 43. RATE LIMIT

## 44. BACKOFF

## 45. RETRY-AFTER

## 46. THROTTLING

## 47. PAGINATION

## 48. CURSOR

## 49. API TOKEN EXPIRY

## 50. OAUTH REFRESH

## 51. CREDENTIAL SCOPE

## 52. CREDENTIAL STORAGE

## 53. SHARED CREDENTIAL

## 54. PROD/DEV SEPARATION

## 55. SECRET IN NODE

## 56. SECRET IN LOG

## 57. EXECUTION DATA

May persist sensitive payloads.

## 58. RETENTION

## 59. BINARY DATA

## 60. LARGE PAYLOAD

## 61. MEMORY

## 62. FILESYSTEM

## 63. CLOUD STORAGE

## 64. EXPRESSION

Dynamic values.

## 65. INJECTION

Shell/SQL/URL.

## 66. CODE NODE

Treat as production code.

## 67. PACKAGE DEPENDENCY

## 68. HTTP REQUEST NODE

SSRF/credentials.

## 69. REDIRECT

## 70. TLS

## 71. DATABASE NODE

Parameterized queries.

## 72. TENANT

## 73. CROSS-WORKFLOW

## 74. SUBWORKFLOW

Input/output contract.

## 75. VERSIONING

## 76. WORKFLOW EDIT

Running executions use which version?

Platform-specific.

## 77. DEPLOYMENT

## 78. ROLLBACK

## 79. EXPORT/BACKUP

## 80. CREDENTIAL PORTABILITY

## 81. ENVIRONMENT VARIABLES

## 82. AI NODE

Inventory model/prompt/context.

## 83. AI NONDETERMINISM

## 84. STRUCTURED OUTPUT

## 85. AI TOOL CALL

## 86. AI RETRY

Can produce different business decision.

## 87. AI SIDE EFFECT

Must be gated.

## 88. PROMPT INJECTION

External workflow data.

## 89. AI COST

## 90. AI RATE LIMIT

## 91. AI FALLBACK

## 92. AI ERROR ROUTE

## 93. OBSERVABILITY

- execution ID
- event ID
- workflow version
- node
- attempt
- latency
- error

## 94. ALERT

## 95. DEAD LETTER

If relevant.

## 96. REPLAY

## 97. RECONCILIATION

## 98. BUSINESS SUCCESS

Technical success vs actual target state.

## 99. EXTERNAL RECEIPT

## 100. HEALTH

Workflow engine up != workflows correct.

## 101. CAPACITY

## 102. QUEUE DEPTH

## 103. EXECUTION AGE

## 104. DB GROWTH

Workflow execution history.

## 105. PRUNING

## 106. BACKUP

## 107. DISASTER RECOVERY

## 108. ACCESS CONTROL

Who can edit workflows/credentials?

## 109. CHANGE AUDIT

## 110. PROD EDIT

## 111. FALSE POSITIVE RULES

Ne prijavljuj automatski:

- large workflow
- code node
- continue-on-fail
- retries
- shared subworkflow
- manual trigger
- polling

Finding mora pokazati concrete risk.

## 112. EVIDENCE TIERS

```text
A - reproduced execution/runtime evidence
B - complete workflow/config path
C - strong static evidence
D - inference needing test
E - hardening
```

## 113. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 114. SEVERITY

P0:
catastrophic global duplicate/destructive automation or secret exposure

P1:
repeatable critical duplicate side effect, data loss, privilege/tenant failure

P2:
material reliability/security problem

P3:
limited operational weakness

P4:
hardening

## 115. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Workflow:
Trigger:
Execution semantics:
Node/path:
External system:
Side effect:
Retry:
Idempotency:
Failure scenario:
Business impact:
Evidence:
Fix:
Replay/regression test:
```

## 116. MATRICES

### Workflow Matrix

| Workflow | Trigger | Write | Idempotent | Retry | Critical |
|---|---|---|---|---|---|

### Credential Matrix

| Credential | Workflows | Scope | Environment | Rotation |
|---|---|---|---|---|

### Failure Matrix

| Node | Timeout | Duplicate | Partial success | Recovery |
|---|---|---|---|---|

## 117. SECOND PASS

Test:

- duplicate webhook
- delayed webhook
- schedule overlap
- API 429
- API timeout after success
- credential expiration
- malformed item
- one item in batch fails
- process restart
- workflow edited mid-execution
- AI node returns different decision
- external content contains prompt injection
- replay historical event

## 118. FINAL QUALITY GATE

Confirm:

- triggers
- delivery semantics
- idempotency
- retries
- partial failure
- concurrency
- credentials
- sensitive data
- external APIs
- AI nodes
- versioning
- observability
- replay
- reconciliation
- DR
- access control

## 119. OUTPUT

`WORKFLOW_AUTOMATION_AUDIT.md`

## 120. FAILURE CHAINS

```text
payment webhook received
↓
workflow creates invoice
↓
email node times out
↓
entire workflow retries
↓
invoice creation runs again
↓
duplicate invoice
```

```text
AI node classifies support request
↓
external ticket contains indirect prompt injection
↓
AI sets priority = "refund immediately"
↓
next node calls payment API
↓
no trusted validation exists between AI output and side effect
```

# KONAČNO PRAVILO

Workflow je pouzdan tek kada duplicate, retry i partial-failure scenariji ne menjaju business invariant.
