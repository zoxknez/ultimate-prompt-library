---
id: UPL-IT-083
number: 83
slug: onboarding-audit
title: Onboarding Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: UX, UI & Product Development
subcategory_id: ux-ui-product-development
language: en
version: 1.0.0
status: stable
---

# ONBOARDING AUDIT

I want a complete audit of the onboarding experience for a new user, from the first contact to the first provable product value moment.

Main objective:

> Determine whether onboarding leads the user quickly and clearly to the real value of the product, or burdens them with information, setup, permissions and steps before they understand why they should continue.

This is not:

- "cut onboarding down to 3 screens"
- insisting on a product tour
- automatically removing signup
- growth-hack funnel audit
- manipulative dark-pattern optimization

## 1. DEFINE ACTIVATION

What is a realistic first-value event?

Not a vanity metric.

## 2. USER SEGMENT

Different personas may need different onboarding.

## 3. ENTRY SOURCE

- organic
- invite
- ad
- deep link
- team invite
- returning user

## 4. EXPECTATION

What did user expect before landing?

## 5. FIRST SCREEN

## 6. VALUE PROPOSITION

## 7. NEXT ACTION

## 8. SIGNUP

## 9. EMAIL VERIFICATION

## 10. PASSWORD

## 11. SSO

## 12. INVITE

## 13. TEAM CREATION

## 14. PROFILE

## 15. OPTIONAL FIELDS

## 16. PERMISSION REQUEST

Ask when context exists.

## 17. IMPORT

## 18. INTEGRATION

## 19. EMPTY STATE

## 20. SAMPLE DATA

## 21. TEMPLATE

## 22. CHECKLIST

## 23. PRODUCT TOUR

## 24. TOOLTIP

## 25. MODAL

## 26. VIDEO

## 27. SKIP

## 28. RETURN LATER

## 29. PROGRESS

## 30. BRANCH

## 31. ROLE-SPECIFIC

## 32. TEAM ADMIN

## 33. MEMBER

## 34. MOBILE

## 35. SMALL SCREEN

## 36. ACCESSIBILITY

## 37. ERROR

## 38. RETRY

## 39. VERIFICATION EMAIL DELAY

## 40. INVITE EXPIRED

## 41. OAUTH DENY

## 42. PROVIDER FAILURE

## 43. DUPLICATE ACCOUNT

## 44. EXISTING USER

## 45. WRONG ACCOUNT

## 46. SESSION INTERRUPTION

## 47. ANALYTICS

Measure:

- start
- completion
- activation
- time to value
- abandonment step

## 48. ACTIVATION VS COMPLETION

Finishing onboarding is not necessarily activation.

## 49. INFORMATION OVERLOAD

## 50. PREMATURE CONFIGURATION

Don't force decisions user cannot understand yet.

## 51. DEFAULT

Good defaults reduce burden.

## 52. EXPLAIN WHY

Especially for permissions/integrations.

## 53. TRUST

## 54. PRIVACY

## 55. DATA IMPORT

## 56. COMMITMENT

Do not ask for high commitment before demonstrated value without reason.

## 57. PAYWALL

Should align with expectation.

## 58. DARK PATTERN

Avoid misleading pressure.

## 59. FALSE POSITIVE RULES

Do not assume:

- shorter onboarding is better
- no onboarding is better
- fewer fields always better
- tour always bad

Evaluate against task complexity and activation.

## 60. EVIDENCE TIERS

```text
A - onboarding experiment/user test/funnel evidence
B - complete interaction evidence
C - strong usability evidence
D - hypothesis
E - optimization
```

## 61. STATUS

```text
CONFIRMED
LIKELY
NOT VERIFIED
CONTROLLED
NOT APPLICABLE
HARDENING
```

## 62. SEVERITY

P0:
rare, catastrophic trust/data consequence

P1:
large share of legitimate new users blocked from product value

P2:
material activation friction

P3:
limited onboarding friction

P4:
polish

## 63. FINDING FORMAT

```text
ID:
Severity:
Status:
Evidence tier:
Persona:
Step:
User expectation:
Required action:
Current friction:
Why user may abandon:
Impact:
Evidence:
Recommended change:
Experiment/validation:
```

## 64. ONBOARDING MATRIX

| Step | Required | User understands why | Skippable | Value gained |
|---|---|---|---|---|

## 65. SECOND PASS

Test:

- invite user
- existing account
- slow email
- OAuth denial
- mobile
- keyboard
- user skips
- user abandons halfway
- user returns next day
- zero-data account
- team/member roles

## 66. FINAL QUALITY GATE

Confirm:

- expectation
- value proposition
- first action
- activation
- signup
- permissions
- setup
- interruption
- skip/resume
- errors
- roles
- accessibility
- analytics

## 67. OUTPUT

`ONBOARDING_AUDIT.md`

## 68. FAILURE CHAIN

```text
new user signs up
↓
must configure 12 settings before dashboard
↓
does not yet understand terminology
↓
chooses defaults randomly
↓
product appears confusing
↓
user churns before reaching first value
```

# FINAL RULE

The goal of onboarding is not:

> "teach the user the whole product"

but:

> "bring the user to the first real value with the minimum necessary uncertainty and setup."
