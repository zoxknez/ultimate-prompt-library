---
id: UPL-IT-074
number: 74
slug: regression-test-generator
title: Generator regresionih testova
category: IT, programiranje i tehnologija
category_id: UPL-IT
subcategory: Testiranje, QA i pouzdanost
subcategory_id: testing-qa-reliability
language: sr
version: 1.0.0
status: stable
---

# GENERATOR REGRESIONIH TESTOVA

Želim da na osnovu konkretnog bug-a, incidenta, PR-a ili popravke generišeš minimalan ali robustan regression test set koji će pouzdano sprečiti vraćanje istog failure class-a.

Glavni cilj:

> Pretvoriti dokazani bug u trajni automated guard koji proverava stvarni invariant i, gde je korisno, susedne varijante istog root cause-a.

Ovo nije:

- samo test reprodukcije exact input-a
- snapshot trenutnog broken output-a
- generisanje desetina redundantnih testova
- testiranje implementation detalja
- prepisivanje fix-a u test tako da oba mogu biti pogrešna na isti način

## 1. BUG INPUT

Prikupi:

```text
Bug:
Trigger:
Observed result:
Expected result:
Root cause:
Fix:
Affected layer:
Production impact:
```

## 2. PROVE BUG

Ako moguće, test pre fix-a treba da padne.

## 3. INVARIANT

Prevedi bug u generalni invariant.

## 4. FAILURE CLASS

Primer:

```text
duplicate webhook
timezone boundary
missing tenant filter
lost update
stale cache
off-by-one
null handling
```

## 5. MINIMAL REPRO

## 6. REALISTIC REPRO

## 7. BEST TEST LAYER

## 8. UNIT

## 9. INTEGRATION

## 10. CONTRACT

## 11. E2E

## 12. CONCURRENCY

## 13. PROPERTY

## 14. FIXTURE

Use smallest realistic setup.

## 15. ASSERT INVARIANT

Not implementation.

## 16. ASSERT SIDE EFFECT

## 17. ASSERT NEGATIVE EFFECT

Example:

"second charge does not occur".

## 18. ASSERT DATABASE

## 19. ASSERT EXTERNAL CALL COUNT

Where relevant.

## 20. BOUNDARY NEIGHBOR

Test one or more nearby values if root cause implies class.

## 21. BEFORE/AFTER

## 22. EMPTY

## 23. DUPLICATE

## 24. RETRY

## 25. CONCURRENCY

## 26. INVALID

## 27. PERMISSION

## 28. ALTERNATE ROLE

## 29. MULTI-TENANT

## 30. TIME

## 31. CLOCK

## 32. DST

## 33. VERSION

## 34. MIGRATION

## 35. OLD CLIENT

## 36. FEATURE FLAG

## 37. TEST NAME

Describe invariant.

## 38. FAILURE MESSAGE

## 39. DETERMINISM

## 40. CLEANUP

## 41. NO SLEEP

Unless timing itself is under test and bounded.

## 42. CONCURRENCY CONTROL

Use barriers/latches where possible.

## 43. TEST FAILS ON OLD CODE

Strong regression proof.

## 44. TEST PASSES ON FIX

## 45. MUTATION

If practical, verify removing fix makes test fail.

## 46. FALSE POSITIVE RULES

Ne generiši additional tests samo zato što:

- related function exists
- nearby lines changed
- coverage could increase

Every test should protect an identifiable behavior.

## 47. EVIDENCE TIERS

```text
A - test demonstrably fails on buggy version and passes on fixed version
B - root cause/invariant fully mapped
C - strong inferred regression scenario
D - speculative adjacent scenario
E - optional hardening
```

REQUIRED testovi se zasnivaju na evidence tier A ili B. Test zasnovan na tier C ili D evidence navodi pretpostavku od koje zavisi; spekulativni susedni scenario (tier D) nikada nije REQUIRED. Bug se smatra confirmed tek kada je reprodukovan ili mu je root cause potpuno mapiran; u suprotnom ga označi kao NOT VERIFIED i navedi šta bi ga potvrdilo.

## 48. STATUS

```text
REQUIRED
RECOMMENDED
OPTIONAL
NOT APPLICABLE
```

## 49. PRIORITY

P0/P1 bug:
regression protection mandatory where technically feasible.

P2:
strongly recommended.

P3/P4:
risk/maintenance tradeoff.

## 50. OUTPUT FORMAT

Za svaki generated test:

```text
Test ID:
Priority:
Layer:
Invariant:
Bug trigger:
Setup:
Action:
Assertions:
Why this catches regression:
Fails on old code:
Adjacent failure class covered:
```

## 51. TEST PLAN MATRIX

| Test | Layer | Original bug | Adjacent class | Priority |
|---|---|---|---|---|

## 52. SECOND PASS

Pitaj:

- Could fix regress while this test remains green?
- Does test assert correct effect?
- Is mock hiding actual bug?
- Does test depend on implementation?
- Does it cover root cause or only exact input?
- Is concurrency deterministic?
- Does test survive refactor?

## 53. FINAL QUALITY GATE

Confirm:

- original bug represented
- root invariant explicit
- appropriate layer
- deterministic
- assertions strong
- old code would fail where feasible
- fixed code passes
- no redundant filler tests

## 54. OUTPUT

`REGRESSION_TEST_PLAN.md`

Ako korisnik traži implementation, implementiraj tests u existing framework i prikaži changed files.

## 55. FAILURE CHAIN

```text
bug:
same webhook charged twice
↓
weak regression test:
checks first webhook returns 200
↓
idempotency code removed later
↓
test remains green
↓
bug returns
```

Pravi regression test mora poslati isti event najmanje dva puta i proveriti authoritative final state.

# KONAČNO PRAVILO

Regression test ne treba da pamti kako je fix implementiran.

Treba da pamti:

> Koji invariant je bug prekršio i kako dokazujemo da se to više ne može desiti?
