---
id: UPL-IT-020
number: 20
slug: android-release-and-play-store-readiness-audit
title: Android Release & Play Store Readiness Audit
category: IT, Programming & Technology
category_id: UPL-IT
subcategory: Mobile Development
subcategory_id: mobile-development
language: en
version: 1.0.0
status: stable
---

# ANDROID RELEASE AND PLAY STORE READINESS AUDIT

I want you to perform a maximally deep, systematic, evidence-first, and production-oriented analysis of an Android application's readiness for actual release and distribution via Google Play.

Main objective:

> Determine whether the application can be safely, reproducibly, and reliably built, signed, published, installed, updated, and operated in production without release-only crashes, misconfigurations, leaked secrets, R8/ProGuard regressions, target SDK incompatibilities, permission model failures, manifest merge anomalies, App Bundle split bugs, versioning errors, signing identity mismatches, or Google Play policy rejections.

This is not:

- a simple `assembleRelease` verification
- a generic Play Store publishing checklist
- advice to simply increment `versionCode`
- blindly upgrading all dependencies to latest
- a superficial scan of `AndroidManifest.xml`
- a replacement for an in-depth security penetration audit
- a replacement for a comprehensive legal/privacy counsel review
- an assumption that a functioning debug build guarantees release readiness
- an assumption that a compiling build equates to a crash-free production runtime

The focus encompasses the entire release lifecycle:

```text
source
↓
dependencies
↓
Gradle configuration
↓
release build
↓
R8 / shrinking
↓
signing
↓
AAB / APK
↓
Play delivery
↓
installation / update
↓
production runtime
```

Priority hierarchy:

**release correctness > update safety > signing/security > production configuration > store compliance > runtime reliability > build optimization**

Uncovering 5 genuine release blockers is infinitely more valuable than listing 100 generic Play Store best practices.

---

# 1. IDENTIFY THE RELEASE STACK

Before formulating findings, establish:

- Android Gradle Plugin (AGP) version
- Gradle wrapper version
- Kotlin compiler version
- JDK runtime version
- `compileSdk`
- `targetSdk`
- `minSdk`
- Build tools revision if explicitly pinned
- `versionCode`
- `versionName`
- Build types
- Product flavors and flavor dimensions
- Signing configurations
- R8 minification, optimization, and obfuscation configuration
- Resource shrinking configuration
- Manifest definitions and merge manifests
- Dependency management model (version catalogs, lockfiles)
- AAB vs APK delivery outputs
- CI/CD build scripts
- Automated Play publishing pipelines (Fastlane, Gradle Play Publisher)

Do not rely on obsolete Android platform or Google Play assumptions.

If a Google Play policy requirement depends upon current real-world policy deadlines:

**VERIFY CURRENT PLAY POLICY BEFORE CONCLUSION**

If you cannot verify active policy requirements:

**PLAY POLICY STATUS: NOT VERIFIED**

---

# 2. MAP THE RELEASE PIPELINE

Construct the real operational release flow:

```text
Git commit / tag
↓
CI runner or local Gradle daemon
↓
release variant compilation
↓
R8 code shrinking and obfuscation
↓
resource shrinking and asset removal
↓
release cryptographic signing
↓
Android App Bundle (AAB) packaging
↓
Google Play Console upload
↓
Release track (Internal → Closed → Open → Production)
↓
User device install / upgrade
```

If staging or release candidate tracks exist, map each distinct track.

---

# 3. BUILD TYPE AUDIT

Inspect all defined build types:

```text
debug
release
```

along with custom variants (staging, benchmark, releaseCandidate).

For each variant, audit:

- `debuggable` flag
- `minifyEnabled`
- `shrinkResources`
- Signing credentials configuration
- `applicationIdSuffix`
- Base backend API URLs
- Logging interceptors and logger levels
- Feature flag defaults
- Analytics dispatcher endpoints
- Crash reporting enablement

---

# 4. DEBUG VS RELEASE CONFIGURATION DELTA

One of the most critical audit phases.

Construct an exhaustive comparison matrix:

| Setting | Debug Variant | Release Variant | Risk Assessment |
|---|---|---|---|

Covering:

- API endpoint URLs
- Network logging interceptors
- SSL/TLS certificate handling
- Feature flag defaults
- Mock data and stub services
- Test credentials and bypasses
- Network security configuration
- Analytics logging
- Remote configuration fallbacks

---

# 5. EXECUTING THE RELEASE BUILD

Where tooling permits, attempt a genuine production compilation:

```text
./gradlew assembleRelease
```

or:

```text
./gradlew bundleRelease
```

If release signing keys or environment secrets are missing:

**RELEASE BUILD: BLOCKED BY MISSING SIGNING/SECRETS**

Never bypass security protections or fallback to debug signing just to force compilation.

---

# 6. APP BUNDLE PACKAGING AUDIT

For Google Play distribution, explicitly inspect the AAB output.

Validating an APK build is never a substitute for verifying the Android App Bundle pipeline.

---

# 7. CLEAN BUILD VERIFICATION

Where safe, execute a clean build from scratch:

```text
./gradlew clean bundleRelease
```

Objective:

Expose hidden dependencies on stale local build outputs or IDE caches.

---

# 8. BUILD REPRODUCIBILITY

Verify that release builds do not depend upon:

- Manually created local files
- Local Android Studio IDE state
- Uncommitted git configuration files
- Developer-specific local machine environment paths
- Ephemeral machine-local properties

---

# 9. VERSION CODE INTEGRITY

Verify that `versionCode`:

- Monotonically increments between release candidates
- Avoids collision across distinct production artifacts
- Evaluates flavor offsets safely where multi-flavor distribution exists

---

# 10. VERSION NAME CONSISTENCY

`versionName` is user-facing metadata.

Verify consistency with git release tags and product documentation.

Do not classify semantic formatting choices as bugs unless violated by specific business requirements.

---

# 11. MULTI-FLAVOR VERSIONING ARCHITECTURE

When multiple product flavors exist:

Verify that flavor-specific `versionCode` computation preserves unique integer identifiers across all Play Store tracks.

---

# 12. APPLICATION ID VERIFICATION

Identify the definitive production:

```text
applicationId
```

Ensure the release artifact does not inadvertently inherit:

- `.debug`
- `.dev`
- Internal test package suffixes

---

# 13. NAMESPACE VS APPLICATION ID

Never conflate Gradle module `namespace` with the runtime `applicationId`.

Verify configurations where third-party SDKs, deep links, or deployment tools rely on package identity.

---

# 14. APPLICATION ID IMPACT ON EXTERNAL SERVICES

Altering the `applicationId` breaks:

- Google OAuth consent client IDs
- Firebase project registrations
- Android App Links domain verification
- Third-party API key restrictions (Google Maps, Facebook SDK)

Audit production service bindings against the production `applicationId`.

---

# 15. CRYPTOGRAPHIC SIGNING CONFIGURATION

Map the signing pipeline:

```text
release signing configuration
↓
keystore storage location
↓
key alias
↓
credential retrieval mechanism
```

Never print secret passwords or key values in audit reports.

---

# 16. DEBUG KEY SIGNING IN RELEASE ARTIFACTS

Critical P0 blocker if a production artifact is signed with the default insecure debug certificate (`debug.keystore`).

---

# 17. KEYSTORE REPOSITORY LEAKS

If a private release keystore is committed to a public or insufficiently protected git repository:

Document the critical credential compromise.

Never echo keystore binaries or passwords into outputs.

---

# 18. HARDCODED SIGNING PASSWORDS

Search:

- `build.gradle` and `build.gradle.kts`
- `gradle.properties`
- CI/CD workflow YAML files
- Deployment scripts

If hardcoded credentials are found, mask all characters in findings.

---

# 19. ENVIRONMENT-DRIVEN SIGNING CREDENTIALS

When signing keys are injected via CI environment variables:

Verify fail-closed behavior when environment variables are undefined or empty.

---

# 20. SILENT FALLBACK TO DEBUG SIGNING (CRITICAL DEFECT)

Hazardous antipattern:

```text
if (releaseKeyMissing) {
    signingConfig = signingConfigs.debug
}
```

Production builds must fail immediately and loudly rather than silently switching to an untrusted debug identity.

---

# 21. PLAY APP SIGNING VERIFICATION

When Google Play App Signing is utilized:

Distinguish between:

- Upload key (used by developer / CI to sign AAB)
- App signing key (managed securely by Google to re-sign delivered split APKs)

Do not assert configuration state without access to Play Console settings.

If unavailable:

**PLAY APP SIGNING: NOT VERIFIED**

---

# 22. SIGNING KEY UPGRADE AND ROTATION

If the application has a history of key migration, verify the `signingConfig` cryptographically links past and new certificates via the signing lineage.

If not applicable:

**NOT APPLICABLE**

---

# 23. CERTIFICATE FINGERPRINT-DEPENDENT SERVICES

Many services bind strictly to the SHA-1 or SHA-256 certificate fingerprint:

- Google Sign-In / OAuth
- Google Maps SDK
- Firebase Authentication
- Android App Links digital asset links (`assetlinks.json`)
- Restricted backend API gateways

Verify that the production signing certificate fingerprint is registered across all provider consoles.

---

# 24. "DEBUG WORKS, RELEASE AUTH CRASHES" SYNDROME

Classic release disaster:

```text
debug keystore SHA-1 registered with Google Cloud / Firebase
↓
release keystore SHA-1 missing from Google Cloud Console
↓
login works flawlessly in QA debug builds
↓
production release crashes or fails authentication immediately upon launch
```

Actively audit SHA fingerprint registrations.

---

# 25. R8 CODE SHRINKING AND MINIFICATION

When R8 is enabled for release:

Map:

- Code shrinking (unused class and method stripping)
- Name obfuscation (identifiers renamed to a, b, c)
- Code optimization (inlining, dead code removal)
- Resource shrinking

---

# 26. RELEASE-ONLY RUNTIME CRASH SURFACE

Search for code patterns vulnerable to R8 minification:

- Reflection and dynamic class loading
- Reliance on `class.simpleName` for business logic
- Runtime annotations
- Generics type argument reflection
- JSON serialization and deserialization
- Java Native Interface (JNI) C++ bindings

---

# 27. REFLECTION SAFETY UNDER R8

If code invokes:

```text
Class.forName("com.example.FeatureImpl")
```

Verify explicit `-keep` rules prevent R8 from stripping or renaming the target class.

---

# 28. RUNTIME CLASS NAME DEPENDENCY

If business logic, analytics tracking, or local database table names rely on:

```kotlin
javaClass.name
javaClass.simpleName
```

Name obfuscation will alter identifiers at runtime, corrupting persistence and analytics.

---

# 29. JSON SERIALIZATION CONTRACTS

For Gson, Moshi, Kotlinx Serialization, or Jackson:

Audit keep rules and annotation processors (`@Keep`, `@Serializable`, `@JsonClass(generateAdapter = true)`).

Never insert indiscriminate broad keep rules without understanding library contracts.

---

# 30. REFLECTIVE SERIALIZERS WITHOUT KEEP RULES

Reflection-based parsing fails in release if R8 strips no-arg constructors, field names, or generic type signatures.

---

# 31. RUNTIME ANNOTATION RETENTION

If framework dependency injection or serialization inspects annotations at runtime, ensure R8 preserves `-keepattributes *Annotation*,Signature,InnerClasses`.

---

# 32. JNI AND C++ BINDING SAFETY

C/C++ native code looking up Java classes and methods via JNI function signatures (`env->FindClass`, `env->GetMethodID`) will crash with `NoSuchMethodError` if R8 renames the Java symbols.

Verify JNI keep rules.

---

# 33. WEBVIEW JAVASCRIPT INTERFACE SAFETY

Methods exposed to WebView via `@JavascriptInterface` must be protected from stripping and renaming.

---

# 34. CUSTOM VIEW INFLATION FROM XML

If custom view classes are referenced in XML layout attributes, verify shrinker rules preserve their two-argument `(Context, AttributeSet)` constructors.

---

# 35. JETPACK NAVIGATION SAFE ARGS REFLECTION

Verify that generated Navigation Safe Args classes and Parcelable/Serializable arguments survive R8 obfuscation.

---

# 36. R8 BUILD WARNING AUDIT

Inspect R8 compiler output for unresolved reference warnings.

Classify warnings:

```text
ACTIONABLE
KNOWN SAFE
DEPENDENCY ISSUE
NOT VERIFIED
```

Never use `-dontwarn **` as a blanket suppressive fix.

---

# 37. INDISCRIMINATE BROAD KEEP RULES

Antipatterns like:

```text
-keep class ** { *; }
```

completely negate the benefits of R8 shrinking.

Classify as an optimization defect unless masking deeper correctness bugs.

---

# 38. RESOURCE SHRINKING RISKS

When `shrinkResources = true` is enabled:

Inspect dynamic resource lookups:

- `Resources.getIdentifier()`
- String-based drawable name lookups
- Raw assets referenced reflectively

---

# 39. DYNAMIC RESOURCE NAME PURGING

Resources accessed solely by string concatenation (e.g., `"icon_" + id`) will be identified as dead resources by AAPT2 and replaced with blank 1x1 stubs in release builds.

Verify `keep.xml` configurations.

---

# 40. NATIVE LIBRARY (.SO) PACKAGING

If native libraries are included:

Audit ABI architecture packaging across `.so` files.

---

# 41. ABI TARGET MATRIX

Map supported hardware architectures:

- `arm64-v8a`
- `armeabi-v7a`
- `x86_64`
- `x86`

strictly according to target device requirements.

---

# 42. MISSING ABI ARCHITECTURES

If a dependency bundles only 32-bit native libraries while the app targets 64-bit platforms, 64-bit devices will crash with `UnsatisfiedLinkError` at runtime.

---

# 43. NATIVE DEBUG SYMBOLS UPLOAD

If utilizing C/C++ native code, verify that native debug symbols (`lib.so.dbg`) are extracted and queued for upload to Google Play Console or Crashlytics for de-obfuscation.

---

# 44. APP BUNDLE SPLIT DELIVERY ASSUMPTIONS

Google Play splits AABs into base and configuration APKs (density, language, ABI).

Verify that code does not assume all language strings or density assets reside in the base APK filesystem.

---

# 45. DYNAMIC FEATURE MODULES

If implementing on-demand Play Feature Delivery:

Audit:

- Module download states
- Offline fallback when module is missing
- Deep navigation into uninstalled modules
- Module version compatibility

If not implemented:

**NOT APPLICABLE**

---

# 46. ON-DEMAND MODULE STATE DEFENSE

UI components must never assume dynamic feature module classes exist before the download and installation listener confirms success.

---

# 47. PLAY ASSET DELIVERY

If delivering large media or game assets via Play Asset Delivery:

Verify install-time, fast-follow, and on-demand asset pack loading.

If not implemented:

**NOT APPLICABLE**

---

# 48. MANIFEST MERGE AUDIT

Always inspect the generated final merged release manifest:

`build/intermediates/merged_manifests/release/AndroidManifest.xml`

Never evaluate release compliance solely from `app/src/main/AndroidManifest.xml`.

Third-party dependencies frequently inject:

- Unintended permissions
- Content providers
- Background services
- Broadcast receivers
- Transparent activities

---

# 49. MERGED RELEASE MANIFEST ATTRIBUTES

Audit final production values:

- `android:debuggable`
- `android:allowBackup`
- `android:usesCleartextTraffic`
- `android:exported`
- Permissions list
- Application label and icon
- Application theme
- `android:networkSecurityConfig`
- Foreground service declarations

---

# 50. `android:debuggable` ENFORCEMENT

The final production release manifest must strictly enforce:

```xml
android:debuggable="false"
```

Shipping `debuggable="true"` in production is a severe P0/P1 security vulnerability allowing arbitrary memory attachment and data extraction.

---

# 51. DATA BACKUP RULES

Inspect:

- `android:allowBackup`
- `android:dataExtractionRules` (Android 12+)
- `android:fullBackupContent` (legacy)

Verify that sensitive databases, cryptographic keys, and user tokens are excluded from cloud backup extraction.

---

# 52. CLEARTEXT HTTP TRAFFIC

If production manifests allow cleartext HTTP (`android:usesCleartextTraffic="true"`):

Document as a security finding unless specific local hardware devices explicitly demand unencrypted communication.

---

# 53. NETWORK SECURITY CONFIGURATION

Audit the production `network_security_config.xml`:

Ensure debug-only custom CA trust anchors (`<certificates src="user" />`) used for Charles/Mitmproxy proxying are strictly excluded from release builds.

---

# 54. USER CERTIFICATE TRUST ANCHORS

Trusting user-installed certificates in a release build permits man-in-the-middle network interception on standard production devices.

---

# 55. CERTIFICATE PINNING RESILIENCE

If SSL/TLS certificate pinning is configured:

Verify expiration dates, backup pin configurations, and remote emergency update paths.

Do not prescribe certificate pinning indiscriminately.

---

# 56. EXPORTED COMPONENT SECURITY

On the final merged manifest, inspect every:

- `<activity>`
- `<service>`
- `<receiver>`
- `<provider>`

Verify that every exported component enforces appropriate permissions or intent filters.

---

# 57. INTENT FILTER IMPLICIT EXPORT RISKS

On Android 12+, any component with an `<intent-filter>` must explicitly declare `android:exported="true"` or `"false"`.

Verify that exported components are not vulnerable to arbitrary intent injection.

---

# 58. DEEP LINK CONFIGURATION

Verify that deep link schemes and hosts point strictly to production domains.

---

# 59. DEVELOPMENT DEEP LINK LEAKS

Ensure test deep links (`dev://`, `staging.example.com`) are not exported in the production manifest.

---

# 60. ANDROID APP LINKS DOMAIN VERIFICATION

When using verified App Links (`android:autoVerify="true"`):

Verify:

- HTTPS scheme enforcement
- Fully qualified domain names
- Presence and formatting of `/.well-known/assetlinks.json` on the remote server

If the production server cannot be queried:

**APP LINKS PRODUCTION VERIFICATION: NOT VERIFIED**

---

# 61. CUSTOM URL SCHEMES AND HIJACKING

Custom URL schemes (e.g., `myapp://oauth`) can be intercepted by malicious apps installed on the same device.

Verify migration toward verified App Links where sensitive authentication tokens are passed.

---

# 62. FINAL PERMISSION INVENTORY

Construct an inventory of all permissions present in the merged release manifest:

Classify each:

```text
REQUIRED
OPTIONAL
TRANSITIVE
LEGACY
UNUSED
NOT VERIFIED
```

---

# 63. TRANSITIVE PERMISSION INJECTION

Dependencies often inject permissions automatically (e.g., an image library injecting `READ_EXTERNAL_STORAGE`).

Identify and remove unnecessary transitive permissions via manifest merge rules:

```xml
<uses-permission android:name="..." tools:node="remove" />
```

---

# 64. UNUSED DANGEROUS PERMISSIONS

Requesting dangerous permissions that the application no longer requires harms:

- User trust and conversion rates
- Google Play Store review approval
- App privacy rating

---

# 65. RUNTIME PERMISSION FLOWS

Verify that every dangerous permission is requested via modern runtime permission contracts (`ActivityResultContracts.RequestPermission()`) with proper rationale handling.

---

# 66. NOTIFICATION PERMISSION (POST_NOTIFICATIONS)

On Android 13+ (API 33+), verify that the application requests `POST_NOTIFICATIONS` at runtime and does not assume notifications are enabled by default.

---

# 67. MEDIA AND STORAGE PERMISSIONS

Audit image, video, and audio access against modern granular media permissions (`READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`) vs legacy storage permissions.

---

# 68. PHOTO PICKER MODERNIZATION

Where applicable, verify whether the app uses the zero-permission Android Photo Picker rather than demanding broad media permissions.

---

# 69. BACKGROUND LOCATION POLICY COMPLIANCE

Requesting `ACCESS_BACKGROUND_LOCATION` triggers strict Google Play declaration and review requirements.

Verify explicit business justification.

Current Play policy requirements must be verified before concluding store compliance.

---

# 70. EXACT ALARM PERMISSIONS (SCHEDULE_EXACT_ALARM)

On Android 13+, `SCHEDULE_EXACT_ALARM` is restricted to alarm clock and calendar categories.

Verify whether the app should migrate to `USE_EXACT_ALARM` or non-exact WorkManager tasks.

---

# 71. FOREGROUND SERVICE TYPES

On Android 14+ (API 34+), every foreground service must declare an explicit `android:foregroundServiceType` in the manifest and hold the matching permission (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `FOREGROUND_SERVICE_LOCATION`, etc.).

---

# 72. FOREGROUND SERVICE PERMISSION AUDIT

Verify that the application holds the specific type permission matching its declared service.

Confirm active Play Store policy guidelines before issuing final compliance findings.

---

# 73. BACKGROUND EXECUTION CONSTRAINTS

Release builds must adhere to strict platform background limitations.

Testing with the app continuously open in the foreground fails to validate background durability.

---

# 74. PACKAGE VISIBILITY RESTRICTIONS (`<queries>`)

On Android 11+ (API 30+), apps must declare explicit packages or intent signatures in the `<queries>` manifest element to interact with external apps.

---

# 75. `QUERY_ALL_PACKAGES` SCRUTINY

Declaring `android.permission.QUERY_ALL_PACKAGES` is heavily restricted on Google Play and triggers policy rejection unless the app represents a launcher, file manager, or antivirus.

---

# 76. SCOPED STORAGE ADHERENCE

Verify complete compatibility with Scoped Storage without relying on legacy storage bypasses.

---

# 77. `requestLegacyExternalStorage` RETIREMENT

Verify that the app does not rely on `android:requestLegacyExternalStorage="true"`, which is ignored on modern target SDK levels.

---

# 78. FILEPROVIDER CONFIGURATION

Inspect all `<provider>` FileProvider definitions:

- Unique `android:authorities`
- `android:exported="false"`
- `android:grantUriPermissions="true"`
- Strict XML path definitions (`res/xml/file_paths.xml`)

---

# 79. HARDCODED FILEPROVIDER AUTHORITIES

Hardcoding package names in FileProvider authorities breaks multi-flavor and parallel debug/release installations.

Use manifest placeholders:

```xml
android:authorities="${applicationId}.fileprovider"
```

---

# 80. SIDE-BY-SIDE INSTALLATION COMPATIBILITY

If debug and release variants must co-exist on the same physical testing device, verify that content provider authorities and custom permissions do not collide.

If not a project requirement:

**NOT APPLICABLE**

---

# 81. CUSTOM PERMISSION UNIQUENESS

Custom permissions must use signature-level protection and unique domain names to prevent permission spoofing vulnerabilities.

---

# 82. MINIMUM SDK (minSdk) COMPATIBILITY

Verify that all modern API calls, resources, and XML attributes are properly protected by runtime SDK version guards for the defined `minSdk`.

---

# 83. RUNTIME API VERSION GUARDS

Search for:

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
```

Ensure new platform APIs are not called unconditionally on older Android versions.

---

# 84. `@RequiresApi` ANNOTATION LIMITATIONS

The `@RequiresApi` annotation silences lint warnings but provides zero runtime protection if the enclosing method is called on older devices.

---

# 85. CORE LIBRARY DESUGARING

Verify whether the project enables core library desugaring in Gradle to safely use modern Java 8+ APIs (java.time, java.util.function) on older Android versions:

```groovy
coreLibraryDesugaringEnabled true
```

---

# 86. TARGET SDK BEHAVIORAL CHANGES

Raising `targetSdk` activates mandatory platform behavioral changes.

Audit the features directly impacted by the target SDK upgrade rather than generating generic lists.

---

# 87. GOOGLE PLAY TARGET SDK REQUIREMENT

Google Play mandates specific minimum target SDK levels for annual app updates.

Verify active Google Play target API requirements at the time of the audit.

If not verified:

**CURRENT PLAY TARGET REQUIREMENT: NOT VERIFIED**

---

# 88. COMPILE SDK VS TARGET SDK

`compileSdk` must be greater than or equal to `targetSdk`.

Never confuse compiler capabilities with runtime target behavior.

---

# 89. DEPENDENCY GRAPH AND SUPPLY CHAIN AUDIT

Inspect the complete dependency tree (`./gradlew app:dependencies`):

- Version conflicts and resolution strategies
- Duplicate libraries packaging different versions of the same code
- Stale or unmaintained critical libraries
- Known Common Vulnerabilities and Exposures (CVEs) where documented

---

# 90. DYNAMIC AND UNBOUNDED DEPENDENCY VERSIONS

Antipatterns like:

```groovy
implementation 'com.example:library:1.+'
implementation 'com.example:library:latest.release'
```

destroy build reproducibility and introduce unexpected breaking changes during release builds.

---

# 91. UNSTABLE SNAPSHOT DEPENDENCIES

Release builds must never depend upon `-SNAPSHOT` dependencies unless explicitly governed by a deliberate release decision.

---

# 92. DIRECT BINARY DEPENDENCIES (LOCAL AAR / JAR)

When bundling local binary `.aar` or `.jar` files in `libs/`:

- Trace provenance and source origin
- Verify native architecture packaging
- Ensure licensing compliance

---

# 93. DEPENDENCY REPOSITORY INTEGRITY

Inspect Gradle repository declarations:

- Prioritize Google Maven and Maven Central
- Audit third-party hosts (JitPack, custom artifactories)
- Ban unencrypted HTTP repositories (`http://`) to prevent man-in-the-middle dependency poisoning

---

# 94. PRIVATE REPOSITORY CREDENTIAL SECURITY

Repository credentials must be loaded via environment variables or secret Gradle properties, never hardcoded in `build.gradle`.

---

# 95. DEPENDENCY LOCKING AND VERIFICATION

Evaluate Gradle dependency verification (`verification-metadata.xml`) or lockfiles.

If absent:

Classify as P4 / supply chain enhancement unless reproducibility is actively broken.

---

# 96. OPEN SOURCE LICENSING COMPLIANCE

If the application bundles third-party open-source components requiring attribution (GPL, Apache 2.0, MIT):

Verify notice and attribution compliance.

Do not formulate definitive legal conclusions.

---

# 97. IN-APP OPEN SOURCE LICENSE SCREEN

An in-app attribution screen is standard practice for software containing Apache/MIT code.

Audit presence against product and licensing requirements.

---

# 98. SECRETS AND SENSITIVE ASSETS INVENTORY

Search for release-sensitive assets embedded in code or resources:

- Third-party API keys
- Keystore signing credentials
- OAuth client secrets
- Cloud service account private keys
- Backend administrative passwords

---

# 99. THE "CLIENT SECRET" FALLACY

Any "secret" embedded inside an Android APK or AAB is completely accessible to end users via decompilation.

If backend security trusts a client-embedded secret for authentication:

Document this critical architectural security flaw.

---

# 100. RESTRICTING CLIENT-FACING API KEYS

Client-visible API keys (e.g., Google Maps, Firebase API Key) must be restricted within provider consoles by:

- Android package name (`applicationId`)
- Production SHA-1 certificate fingerprint
- Allowed API service scopes
- Usage and billing quotas

---

# 101. SERVICE ACCOUNT PRIVATE KEYS IN PRODUCTION (P0)

Embedding a Google Cloud service account JSON key or AWS secret access key inside an Android app is an immediate Critical P0 vulnerability.

---

# 102. `google-services.json` METADATA BOUNDARIES

`google-services.json` contains public client identifiers, not private server secrets.

Verify that backend security rules (Firebase Security Rules) do not assume `google-services.json` is confidential.

---

# 103. ENVIRONMENT CONFIGURATION AUDIT

Verify that the release variant points strictly to production resources:

- Production backend API URLs
- Production OAuth client IDs
- Production analytics accounts
- Production remote configuration instances
- Production Crashlytics / Sentry projects

---

# 104. DEVELOPMENT BACKEND IN PRODUCTION (CRITICAL P1)

Catastrophic release misconfiguration:

```text
release build
↓
DEV_API_BASE_URL (points to localhost or staging server)
```

Real users will flood the staging database with live data or fail to connect.

---

# 105. STAGING CREDENTIAL LEAKS

Ensure production builds do not utilize staging API keys or sandbox payment gateway credentials.

---

# 106. FEATURE FLAG RELEASE DEFAULTS

Audit feature flag defaults for release:

Unfinished or experimental features must not be active in release builds simply because debug defaults enabled them.

---

# 107. REMOTE CONFIGURATION AS SOLE SECURITY BOUNDARY

Remote config flags should control UX feature rollout, never act as the sole barrier guarding sensitive backend operations.

---

# 108. EMERGENCY KILL SWITCH BEHAVIOR

If the application incorporates an emergency remote kill switch:

Verify behavior when the remote config service is unreachable or network is offline.

---

# 109. LOGGING HYGIENE IN RELEASE

Audit logging outputs:

- Log severity levels
- Personally Identifiable Information (PII)
- Session and auth tokens
- Full request and response bodies
- Raw database queries

---

# 110. `Log.d` AND `Log.v` STRIPPING

Verify whether release builds strip debug logging statements via R8 rules:

```text
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
}
```

---

# 111. NETWORK LOGGING INTERCEPTOR IN PRODUCTION

OkHttp `HttpLoggingInterceptor.Level.BODY` must be disabled in release builds to avoid printing sensitive authorization headers and payloads to logcat.

---

# 112. CRASH REPORTING INTEGRATION

Verify that crash reporting (Firebase Crashlytics, Sentry, Bugsnag) is active and pointed to the production workspace.

If absent:

Document as an observability improvement.

---

# 113. DE-OBFUSCATION MAPPING FILE UPLOAD

When R8 obfuscation is enabled, stack traces are unreadable without the corresponding `mapping.txt` file.

Verify automated mapping file upload via Gradle plugins (`firebaseCrashlytics`, `sentry-android-gradle-plugin`).

---

# 114. MAPPING FILE ARCHIVAL AND RETENTION

Ensure CI builds archive `mapping.txt` for every tagged production release to enable manual de-obfuscation in the future.

---

# 115. NATIVE SYMBOL ARCHIVAL

If using NDK code, ensure unstripped native symbols are retained for crash de-obfuscation.

---

# 116. JETPACK COMPOSE COMPILER TRACE DE-OBFUSCATION

Verify that Compose compiler metrics and mapping files are handled according to toolchain recommendations.

---

# 117. ANALYTICS PIPELINE VERIFICATION

Verify:

- Production analytics workspace routing
- Debug event filtering (excluding developer traffic)
- User identity sanitization
- User consent handling where required

---

# 118. CONTAMINATING PRODUCTION ANALYTICS WITH TEST EVENTS

Ensure internal QA testing and automated UI test runs do not pollute production analytics properties.

---

# 119. THIRD-PARTY SDK PRIVACY AUDIT

Catalog all third-party SDKs that collect device or user telemetry (advertising, analytics, social login, crash tracking).

---

# 120. GOOGLE PLAY DATA SAFETY DECLARATION

Do not guess Data Safety declarations.

Map the exact data collected and shared by app code and embedded third-party SDKs.

If Play Console declaration responses are unavailable:

**DATA SAFETY DECLARATION CONSISTENCY: NOT VERIFIED**

---

# 121. PRIVACY POLICY VALIDITY

If the application requires a Privacy Policy:

Verify that the Privacy Policy URL is live, accessible via HTTPS, and accurately reflects app data practices.

---

# 122. BROKEN OR NON-COMPLIANT PRIVACY POLICY URL

A dead link (HTTP 404) or staging privacy policy URL in the Play Console listing is an immediate trigger for app rejection or removal.

---

# 123. ACCOUNT DELETION COMPLIANCE

Google Play mandates that any app allowing user account creation must provide an in-app and web-based account deletion mechanism.

Verify active Google Play policy requirements and inspect implementation.

---

# 124. IN-APP ACCOUNT DELETION FLOW

If account deletion exists:

- Confirmation dialog
- Re-authentication challenge
- Local database and token purging
- Cancellation of background jobs
- Verification of backend server account purge

---

# 125. EXTERNAL WEB ACCOUNT DELETION URL

Verify that the web deletion link submitted to Google Play Console allows users to request deletion of their account and associated data without requiring the app.

---

# 126. ADVERTISING SDK AUDIT

If ads are implemented:

Audit ad SDK integrations (AdMob, AppLovin).

If not implemented:

**NOT APPLICABLE**

---

# 127. ADVERTISING ID DECLARATION

If collecting the Android Advertising ID (AAID) on Android 12+, verify the declaration of `com.google.android.gms.permission.AD_ID` and the Play Console advertising declaration.

---

# 128. DESIGNED FOR FAMILIES / CHILDREN PRIVACY

If the app targets children:

Strict Google Play Families policies apply (COPPA, restricted SDKs, non-personalized ads).

Do not apply children policies to general-audience apps.

---

# 129. REGULATED APP CATEGORIES (HEALTH, FINANCE, VPN)

If the app operates within regulated domains:

Verify domain-specific Play policies and mandatory declarations.

Do not transfer specialized requirements to general apps.

---

# 130. USER-GENERATED CONTENT (UGC) POLICIES

If users can post content:

Verify reporting mechanisms, user blocking, content filtering, and terms of service.

---

# 131. DIGITAL GOODS AND IN-APP PURCHASES

If selling digital features or subscriptions:

Verify Google Play Billing implementation and compliance with Play payment policies.

Confirm current policy guidelines before issuing compliance verdicts.

---

# 132. GOOGLE PLAY BILLING LIBRARY VERSION

Verify that the app utilizes a supported version of the Google Play Billing Library according to Google's annual deprecation schedule.

---

# 133. BILLING RELEASE SKU CONFIGURATION

Ensure test SKU IDs are replaced with live production Google Play In-App Product and Subscription IDs.

---

# 134. PURCHASE ACKNOWLEDGEMENT CONTRACT

Purchases must be acknowledged within Google's required timeframe (typically 3 days), otherwise Google Play automatically refunds and revokes the purchase.

Verify the call to `BillingClient.acknowledgePurchase()`.

---

# 135. PENDING PURCHASES HANDLING

Verify that the app supports pending transactions (e.g., cash payments at retail) and does not grant entitlements before payment confirmation.

---

# 136. RESTORE PURCHASES FUNCTIONALITY

Ensure users can restore existing entitlements across reinstalls or device switches without relying solely on local flags.

---

# 137. SERVER-SIDE PURCHASE VALIDATION

For high-value digital goods, verify that purchases are validated securely against the Google Play Developer API on the backend.

---

# 138. PLAY INTEGRITY API USAGE

If implementing Play Integrity:

Verify that token verification is evaluated on the backend as a risk signal rather than an absolute binary client-side block.

---

# 139. ROOT DETECTION REALISM

Never treat root detection as a mandatory release blocker unless justified by explicit security threat models (e.g., banking apps).

---

# 140. APP UPGRADE AND UPDATE AUDIT

The single most critical production test:

```text
user has version N installed with active data
↓
Play Store downloads and installs version N+1
↓
application opens cleanly without data loss
```

Audit:

- Room / SQLite database migrations
- SharedPreferences and DataStore schema evolution
- Stored authentication tokens
- Pending WorkManager background jobs
- Existing notification channels
- Local cache compatibility

---

# 141. UPGRADE VS FRESH INSTALL SEPARATION

Never test only fresh installs.

Explicitly differentiate:

```text
FRESH INSTALL
```

from:

```text
UPGRADE FROM PREVIOUS RELEASE
```

---

# 142. SKIPPED VERSION MIGRATION TESTING

Users rarely update sequentially.

Simulate a user upgrading directly from version N-5 to the latest version.

---

# 143. APPLICATION DOWNGRADES

Android package manager prevents installing an older `versionCode` over a newer one without prior uninstallation.

Document this constraint for QA workflows.

---

# 144. DATABASE MIGRATION INTEGRITY (RELEASE BLOCKER)

A crashing database migration on startup will destroy user data and trigger massive 1-star reviews.

Verify that `fallbackToDestructiveMigration()` is not active on production tables containing user data.

---

# 145. PREFERENCES AND DATASTORE MIGRATIONS

Ensure key renames or default value changes do not reset user settings or corrupt stored sessions upon update.

---

# 146. AUTHENTICATION SESSION SURVIVAL

An application update must not force all existing users to log in again unless security tokens were deliberately invalidated.

---

# 147. WORKMANAGER COMPATIBILITY ACROSS UPGRADES

Existing users may have scheduled WorkManager jobs stored in local SQLite databases.

Verify that worker class names and input data formats remain backward compatible.

---

# 148. WORKER CLASS RENAMING HAZARDS

Renaming or deleting a `ListenableWorker` class while existing jobs remain scheduled will cause WorkManager to fail or throw exceptions when reviving work.

---

# 149. NOTIFICATION CHANNELS IMMUTABILITY

Notification channel attributes (importance, sound, vibration) are immutable once created on a user's device.

Updating code defaults will not alter settings for existing users.

---

# 150. DEEP LINK BACKWARD COMPATIBILITY

Ensure legacy deep link URLs previously sent in emails or push notifications continue resolving after an update.

---

# 151. APP SHORTCUTS COMPATIBILITY

Verify that static and dynamic app shortcuts do not point to deleted or renamed activity classes.

---

# 152. APP WIDGET COMPATIBILITY

Verify that home screen widgets update their layout and receiver bindings smoothly across version upgrades.

---

# 153. POST-UPDATE FIRST RUN IDEMPOTENCY

One-time data migration or onboarding routines must execute idempotently and record completion flags reliably.

---

# 154. "WHAT'S NEW" CHANGELOG PROMPT

Classify changelog dialogs as P4 UX enhancements.

---

# 155. FRESH INSTALL TESTING

Execute:

```text
clean device with no prior app data
↓
install release artifact
↓
launch application
```

---

# 156. FRESH INSTALL DEFAULT STATE

Verify:

- Initial database seeding
- Preference defaults
- Initial permission requests
- Login / onboarding navigation flows

---

# 157. TESTING REAL RELEASE ARTIFACTS

Where possible, install the exact compiled release AAB/APK on a physical device or emulator.

Successful compilation is never proof of runtime health.

---

# 158. SIGNED ARTIFACT INSTALLATION

If release signing keys are inaccessible during audit:

**SIGNED RELEASE INSTALL: NOT VERIFIED**

---

# 159. UPGRADE INSTALLATION SIMULATION

Ideal verification path:

```text
install previous signed production build
↓
populate user data and login session
↓
install new signed release candidate over existing app
↓
verify smooth startup and data continuity
```

---

# 160. UNINSTALL AND REINSTALLATION DYNAMICS

Verify behavior when a user uninstalls and reinstalls:

Understand what data restores via Google Auto Backup versus what initializes clean.

---

# 161. AUTO BACKUP SURPRISES

Users reinstalling an app may inherit old preferences or invalid tokens restored silently from Google Drive.

The onboarding flow must handle pre-existing restored tokens defensively.

---

# 162. PLAY STORE LISTING ASSETS

If store listing copy and assets reside in the repository (e.g., Fastlane metadata):

Verify consistency with actual app features.

If absent:

**STORE LISTING: NOT VERIFIED**

---

# 163. APPLICATION NAME (LABEL)

Verify that `android:label` matches the official brand name and does not exceed character limits.

---

# 164. LAUNCHER ICONS AND ADAPTIVE ICONS

Verify:

- Adaptive icon XML definitions (`ic_launcher.xml`, `ic_launcher_round.xml`)
- Foreground and background layers
- Themed icon monochrome layer (Android 13+)

---

# 165. ANDROID TV STORE ASSETS

For Android TV apps, verify the TV banner asset and leanback launcher icon.

---

# 166. SCREENSHOTS AND GRAPHIC ASSETS

If screenshots are not stored in the repository:

Mark as NOT VERIFIED.

---

# 167. CONTENT RATING DECLARATION

If Play Console questionnaires are unavailable:

**CONTENT RATING: NOT VERIFIED**

---

# 168. APP ACCESS AND DEMO CREDENTIALS

If the app requires login, verify that valid demo credentials and instructions are prepared for Google Play review teams.

---

# 169. REVIEWER ENVIRONMENT RESTRICTIONS

If the application requires IP whitelisting, VPNs, specific geolocation, or proprietary hardware:

Document clear reviewer bypass mechanisms.

---

# 170. GEOGRAPHIC DISTRIBUTION RESTRICTIONS

Verify that store listing distribution settings exclude countries where backend services or licensing rights are unsupported.

---

# 171. DEVICE CATALOG FILTERING

Inspect how manifest hardware declarations filter supported devices:

- Camera
- Telephony
- Bluetooth
- Sensor hardware

---

# 172. ACCIDENTAL DEVICE EXCLUSION VIA USES-FEATURE

Declaring:

```xml
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

filters out all devices lacking a rear camera (e.g., tablets, Chromebooks).

Mark `android:required="false"` if the feature is optional.

---

# 173. ACCIDENTAL DEVICE INCLUSION WITHOUT HARDWARE GUARDS

Conversely, allowing installation on devices lacking necessary hardware without runtime checks will cause crashes when the feature is accessed.

---

# 174. SCREEN COMPATIBILITY AND TABLET SUPPORT

Verify that the app layout renders reasonably on tablets, foldables, and large screens without manifest restrictions artificially blocking distribution.

---

# 175. SCREEN ORIENTATION LOCKING

Locking orientation to `portrait` or `landscape` restricts foldables and tablets.

Do not classify as a bug if justified by product requirements.

---

# 176. CHROMEBOOK AND DESKTOP ANDROID SCOPE

If Chromebook distribution is enabled, audit keyboard, trackpad, and window resizing behavior.

If not targeted:

**NOT IN TARGET SCOPE**

---

# 177. APP DOWNLOAD AND INSTALLATION SIZE

AAB packaging and App Delivery optimize download size.

If not measured:

**DOWNLOAD SIZE: NOT MEASURED**

---

# 178. EXCESSIVE ASSET SIZES

Search for uncompressed media assets, oversized raw videos, bundled SQLite files, or duplicate graphics inflating artifact size.

---

# 179. UNUSED RESOURCES AND DRAWABLES

Resource shrinking removes unused XML resources, but avoid deleting assets referenced dynamically by name.

---

# 180. DENSITY ASSET DISTRIBUTION

Verify that vectorized drawables (vector XMLs) are prioritized over bloating the APK with multi-density PNGs.

---

# 181. NATIVE LIBRARY SIZE IMPACT

While multi-ABI universal APKs are large, Google Play serves single-ABI split APKs to devices.

Do not judge download footprint purely from universal APK sizes.

---

# 182. BASELINE PROFILES FOR STARTUP PERFORMANCE

If Baseline Profiles are configured:

Verify that profile rules are compiled into the AAB release artifact.

If absent:

Document as an optimization opportunity (P4), not a release blocker.

---

# 183. BENCHMARK AND TEST MODULE ISOLATION

Verify that Macrobenchmark and instrumentation test modules are strictly excluded from the production release bundle.

---

# 184. LEAKING DEBUG TOOLS INTO PRODUCTION

Search release configurations and manifests for:

- LeakCanary
- Stetho
- Flipper
- Chucker
- In-app debug menus
- Test endpoint switchers

---

# 185. LEAKCANARY IN PRODUCTION

LeakCanary must strictly use `debugImplementation`.

Shipping LeakCanary in release causes severe performance degradation and confusing user notifications.

---

# 186. MOCK AND STUB DATA LEAKS

Ensure release variants cannot initialize mock repositories or demo user profiles due to misconfigured dependency injection.

---

# 187. EXPOSED DEBUG AND DEVELOPER MENUS

Secret gestures (e.g., tapping a version number 7 times) that expose developer menus must be disabled or strictly protected in production builds.

---

# 188. HARDCODED TEST CREDENTIALS IN CODE (P0)

Hardcoded test usernames, passwords, or bypass tokens accessible in release builds represent critical security findings.

---

# 189. STRICTMODE PENALTIES IN RELEASE

`StrictMode` detection is valuable in debug, but penalty configurations that crash the app (`penaltyDeath()`) must be disabled in release.

---

# 190. PRODUCTION CODE RELYING ON ASSERTIONS

Java/Kotlin `assert` statements are disabled by default in Android runtime and must never be used to enforce production business logic or security checks.

---

# 191. VULNERABLE `BuildConfig.DEBUG` BRANCHES

Inspect all `if (BuildConfig.DEBUG)` code blocks.

For example:

```text
if (BuildConfig.DEBUG) {
    validation/security
}
```

Search for essential validation or security logic accidentally bypassed in release.

---

# 192. UNTESTED `if (!BuildConfig.DEBUG)` PATHS

Code paths that execute exclusively in release builds are frequently untested in everyday development.

```text
if (!BuildConfig.DEBUG) {
    ...
}
```

---

# 193. PRODUCTION-ONLY SDK INITIALIZATION

Analytics, crash reporters, and ad SDKs that only initialize in release builds must be tested via staging release variants.

---

# 194. PRODUCTION BACKEND API DISCREPANCIES

A successful staging build proves nothing regarding production backend health.

If production endpoints cannot be verified safely:

**PRODUCTION BACKEND INTEGRATION: NOT VERIFIED**

---

# 195. PRODUCTION SSL/TLS CERTIFICATE VALIDITY

Verify that production domains possess valid, unexpired SSL certificates issued by recognized public Certificate Authorities.

---

# 196. PRODUCTION API QUOTAS AND RATE LIMITS

Production environments enforce stricter rate limiting than staging environments.

Ensure critical release flows handle HTTP 429 gracefully.

---

# 197. CRASH-ON-LAUNCH SMOKE TESTING

Execute a clean install and launch on a real device with no attached debugger.

```text
clean install
↓
launch release
```

Catch immediate initialization crashes (`NullPointerException`, `ClassNotFoundException`).

---

# 198. OFFLINE FIRST LAUNCH RESILIENCE

Simulate a user launching the app for the very first time with no internet connectivity.

Verify that the app renders a clear offline state without crashing.

---

# 199. PERMISSION REJECTION SMOKE TESTING

Simulate a user denying all optional runtime permissions.

The app must remain operable and must not crash.

---

# 200. GOOGLE PLAY SERVICES (GMS) DEPENDENCY

If the app depends on Google Play Services (Maps, FusedLocation, Play Integrity):

Verify graceful handling and user prompts on devices where GMS is missing or outdated.

---

# 201. HARDCODED PLAY SERVICES VERSIONS

Avoid hardcoding fragile Play Services version checks that break as platform updates roll out.

---

# 202. FIREBASE INITIALIZATION FOR RELEASE

If Firebase configuration files (`google-services.json`) are variant-specific, ensure the release variant loads the production Firebase project credentials.

---

# 203. FLAVOR-SPECIFIC APPLICATION IDS IN FIREBASE

Every distinct `applicationId` across flavors must be registered as a separate Android app in the Firebase console.

---

# 204. CRASHLYTICS SYMBOL MAPPING UPLOAD

Verify that the Crashlytics Gradle plugin runs during release builds and successfully uploads R8 mapping files.

---

# 205. CI/CD AUTOMATION PIPELINE AUDIT

Map the CI release workflow:

```text
git tag / trigger
↓
checkout source
↓
JDK & Android SDK setup
↓
dependency restoration
↓
unit tests & lint checks
↓
bundleRelease
↓
sign artifact via secrets
↓
publish to Play Console track
```

---

# 206. TOOLCHAIN PINNING IN CI

Verify that the CI environment pins:

- Specific JDK distribution and version
- Gradle wrapper version
- Android SDK build tools version

---

# 207. GRADLE WRAPPER INTEGRITY

Ensure `gradlew` and `gradle-wrapper.jar` are committed to the repository and match official checksums.

---

# 208. WRAPPER CHECKSUM VERIFICATION

Verify whether GitHub Actions or CI workflows validate the Gradle wrapper checksum (`gradle/wrapper-validation-action`).

---

# 209. CI SECRETS MANAGEMENT

Ensure signing keystores, passwords, and Google Play API service account keys are stored in encrypted secret vaults (GitHub Secrets, Vault) and never outputted in build logs.

---

# 210. LEAKING SECRETS IN BUILD LOGS

Commands that pass passwords as command-line arguments can expose secrets in public CI build logs.

---

# 211. RELEASING FROM DEVELOPER LAPTOPS

Relying on a developer's local laptop to build and sign production releases introduces severe operational risks and lacks reproducibility.

---

# 212. AUTOMATED QUALITY GATES BEFORE RELEASE

Verify that the release CI pipeline enforces mandatory quality gates:

- All unit tests pass
- Android Lint reports no fatal issues
- Release compilation succeeds
- Room database migration tests pass

---

# 213. IGNORING TEST FAILURES IN CI

Search for:

```yaml
continue-on-error: true
```

or Gradle tasks running with `--continue` where failing test suites are ignored.

---

# 214. LINT ABORT ON ERROR BEHAVIOR

Inspect `lintOptions`:

```groovy
abortOnError false
```

Determine whether fatal errors are ignored during release builds.

Do not mandate zero lint warnings, but fatal errors must fail the build.

---

# 215. LINT BASELINE USAGE

Using a lint baseline is a valid strategy for legacy projects.

Verify that newly introduced errors are not hidden behind baseline masks.

---

# 216. RELEASE ARTIFACT PROVENANCE

Ensure that the exact AAB artifact tested in the QA pipeline is promoted to production, rather than compiling a new artifact from source with different timestamps.

---

# 217. "BUILD ONCE, PROMOTE" PRINCIPLE

Promoting a single verified binary across testing tracks guarantees that what was tested is exactly what ships to users.

---

# 218. GIT COMMIT TRACEABILITY

Every production release artifact should be traceable to an immutable Git commit hash and release tag.

---

# 219. CLIENT-SIDE ROLLBACK IMPOSSIBILITY

Mobile applications cannot be rolled back instantly like web servers.

Backward-compatible backend APIs and emergency server-side feature flags are essential defenses.

---

# 220. DISASTER RECOVERY PROTOCOL FOR BAD RELEASES

Establish:

> What is the exact operational response if a newly released version exhibits a critical crash in production?

Available recovery mechanisms:

- Halting the Google Play rollout
- Staged rollouts (e.g., 5% → 10% → 20% → 100%)
- Remote kill switches / feature flags
- Rapid hotfix release pipeline

---

# 221. STAGED ROLLOUT STRATEGY

Verify whether the release plan incorporates staged percentage rollouts.

If unverified:

**STAGED ROLLOUT STRATEGY: NOT VERIFIED**

---

# 222. POST-RELEASE MONITORING

Ensure real-time monitoring of:

- Crashlytics / Sentry crash-free session rates
- Google Play Console Android Vitals (crash rate, ANR rate)
- Authentication failure spikes
- Backend API error rates

---

# 223. GOOGLE PLAY PRE-LAUNCH REPORT

If pre-launch report data is accessible in the Play Console:

Audit findings across test devices.

If unavailable:

**PRE-LAUNCH REPORT: NOT VERIFIED**

---

# 224. GOOGLE PLAY CONSOLE POLICY WARNINGS

Do not fabricate Play Console account warnings without direct access.

---

# 225. DEVICE AND OS COMPATIBILITY TESTING

Release testing must validate against:

- Minimum supported Android version (`minSdk`)
- Median current market Android version
- Latest target Android version

---

# 226. COMPATIBILITY TEST MATRIX

Construct:

| Android Version / Device | Installation | Cold Launch | Core Feature Flow | Status |
|---|---|---|---|---|

---

# 227. LOW-END HARDWARE VALIDATION

Validate the release build on budget, low-memory devices to expose memory pressure crashes and UI lag.

---

# 228. 64-BIT NATIVE ARCHITECTURE COMPLIANCE

Google Play strictly mandates 64-bit support for all applications containing native code.

Verify that 64-bit `.so` libraries (`arm64-v8a`) are present.

If unverified:

**NATIVE PLAY REQUIREMENTS: NOT VERIFIED**

---

# 229. 16 KB PAGE SIZE COMPLIANCE

For applications bundling native C/C++ code, audit readiness for 16 KB page size support on modern Android platform architectures.

---

# 230. EDGE-TO-EDGE AND WINDOW INSETS COMPLIANCE

When targeting modern SDKs where edge-to-edge rendering is mandatory:

Verify that system bars (status bar, navigation bar) do not overlap critical UI interactive elements.

---

# 231. PREDICTIVE BACK NAVIGATION

If targeting Android 14+ and implementing custom back navigation:

Verify compatibility with Predictive Back animations.

---

# 232. NOTIFICATION TRAMPOLINE RESTRICTIONS

Verify that notification actions and taps launch Activities directly, rather than launching broadcast receivers or services that start activities.

---

# 233. EXACT ALARM RESTRICTIONS

Verify compliance with modern background scheduling limitations.

---

# 234. FOREGROUND SERVICE POLICY COMPLIANCE

Confirm that all declared foreground services comply with Google Play foreground service use-case policies.

---

# 235. PLAY POLICY CITATION REQUIREMENTS

For every policy-related finding, document:

```text
Policy area:
Applicable to this app:
Evidence:
Current requirement verified:
YES / NO
Date / source:
```

Never assert a policy rejection without verifying active Google Play guidelines.

---

# 236. SEPARATING PLATFORM BUGS FROM STORE POLICY

Distinguish:

```text
permission runtime crash
```

(Platform implementation correctness defect)

from:

```text
permission declaration violates store policy
```

(Google Play compliance violation)

Keep them strictly segregated.

---

# 237. SEPARATING BLOCKERS FROM RECOMMENDATIONS

Classify every finding into clear operational buckets:

```text
RELEASE BLOCKER
HIGH RISK
NON-BLOCKING ISSUE
IMPROVEMENT
NOT VERIFIED
```

---

# 238. RELEASE BLOCKER EXAMPLES

Concrete blockers:

- Release build fails compilation
- App crashes on startup in release variant
- Incorrect signing key used
- Database migration crashes upon upgrade
- Release variant points to staging/dev API
- Critical runtime permission flow broken
- Verified active Google Play policy violation preventing submission

---

# 239. NON-BLOCKING IMPROVEMENTS

Non-blocking suggestions:

- Missing Baseline Profiles
- Absence of documented staged rollout policy
- Additional analytics telemetry
- Minor build speed optimizations

Never present cosmetic recommendations as "The app cannot be published to Google Play."

---

# 240. SUBSTANTIVE FINDING REPORTING TEMPLATE

Every substantive finding must be documented using this exact structure:

```text
ID:
Severity:
Release classification:
Confidence:
Status:

Build variant:
Application ID:
Version:
API scope:
Device scope:

File:
Gradle config:
Manifest component:
Dependency:
Relevant code/config:

Problem:

Evidence:

Release Flow:

Reproduction:

Debug behavior:

Release behavior:

User impact:

Store/Policy impact:

Security/Data impact:

Root cause:

Recommended remediation:

Regression / release test:

Production verification:

Complexity:
XS / S / M / L / XL
```

---

# 241. SEVERITY RATING SYSTEM

Apply strict severity definitions:

## P0 - CRITICAL

- Compromise of production release signing keys or server credentials
- Hardcoded production administrative secrets
- Catastrophic security or privacy vulnerability shipping to all users

## P1 - HIGH

- Release build fails compilation or crashes on startup
- Release-only crash blocking core user flows
- Broken database migration destroying user data upon upgrade
- Production build pointing to staging/dev backends
- Verified Google Play policy violation causing immediate app rejection

## P2 - MEDIUM

- Substantial device compatibility or configuration defect
- Store readiness issue requiring remediation before public release

## P3 - LOW

- Bounded release edge cases
- Minor metadata or configuration inconsistency

## P4 - IMPROVEMENT

- CI/CD optimizations, observability enhancements, or build performance tuning

---

# 242. CONFIDENCE RATINGS

Use:

```text
HIGH
MEDIUM
LOW
```

HIGH:

Empirically verified via successful/failed release compilation or direct code evidence.

MEDIUM:

Strong configuration evidence, but unverified on physical hardware or Play Console.

LOW:

Dependent upon unavailable external backend configs or unverified policy updates.

---

# 243. VERIFICATION STATUS

Use:

```text
CONFIRMED
LIKELY
THEORETICAL
NOT VERIFIED
```

---

# 244. RELEASE VERIFICATION FLAGS

Include:

```text
RELEASE BUILD:
PASS
FAIL
NOT VERIFIED

SIGNED INSTALL:
PASS
FAIL
NOT VERIFIED

UPGRADE TEST:
PASS
FAIL
NOT VERIFIED

PLAY POLICY:
VERIFIED
PARTIAL
NOT VERIFIED
```

---

# 245. DO NOT MODIFY CODE DURING THE AUDIT

Throughout the audit:

- Do not increment `versionCode`
- Do not bump `targetSdk`
- Do not alter signing configurations
- Do not inject ProGuard keep rules
- Do not remove permissions
- Do not upgrade dependencies
- Do not edit Play Console configurations

Complete the investigation first.

---

# 246. OUTPUT REPORT STRUCTURE - ANDROID_RELEASE_PLAY_READINESS_AUDIT.md

Structure the audit report:

## 1. Executive Summary

- Release stack overview
- Release compilation status
- Signing integrity status
- Identified release blockers
- Play Store readiness verdict
- Production configuration posture

## 2. Release Environment

## 3. Build Variant Matrix

## 4. Debug vs Release Differences

## 5. Release Build Audit

## 6. AAB / APK Audit

## 7. Signing Audit

## 8. R8 / ProGuard Audit

## 9. Resource Shrinking Audit

## 10. Manifest Merge Audit

## 11. Permissions Audit

## 12. Target SDK / Platform Compatibility

## 13. Dependencies / Supply Chain Audit

## 14. Secrets / Production Configuration

## 15. Network / API Production Config

## 16. Firebase / External Service Config

## 17. Logging / Analytics / Crash Reporting

## 18. Update / Migration Audit

## 19. Fresh Install Audit

## 20. Upgrade Install Audit

## 21. Device / API Compatibility Matrix

## 22. Play Store Policy Areas

## 23. Data Safety / Privacy Configuration

## 24. Billing Audit

If implemented.

## 25. Store Listing Readiness

If assets available.

## 26. CI/CD Release Pipeline

## 27. Rollout / Monitoring / Recovery

## 28. Findings Summary

| ID | Severity | Classification | Area | Problem | Confidence | Status |
|---|---|---|---|---|---|---|

## 29. Release Blockers

## 30. P0 Findings

## 31. P1 Findings

## 32. P2 Findings

## 33. P3 Findings

## 34. P4 Improvements

## 35. Things Done Well

## 36. Unknown / Not Verified

## 37. Final Release Readiness Matrix

Use:

```text
✅ PASS
⚠️ PARTIAL
❌ FAIL
❓ NOT VERIFIED
➖ NOT APPLICABLE
```

Covering:

- Clean build
- Release build compilation
- AAB packaging
- R8 minification
- Resource shrinking
- Cryptographic signing
- Fresh installation
- Cold launch
- Version upgrade
- Database migration
- Production authentication
- Production API endpoints
- Permissions model
- Notifications
- Deep links / App Links
- Background execution
- External SDK integrations
- Crash reporting de-obfuscation
- Target SDK compliance
- Privacy and Data Safety
- Google Play Billing
- Store listing metadata
- CI/CD pipeline
- Rollout and monitoring

## 38. Go-Live Remediation Roadmap

### Phase 0 - Release Blockers

### Phase 1 - Before Production Submission

### Phase 2 - First Production Rollout

### Phase 3 - Post-Launch Hardening

---

# 247. BUILD VARIANT MATRIX

Construct:

| Variant | Compiles | Minified | Resource Shrunk | Signed | Tested on Device |
|---|---|---|---|---|---|

---

# 248. SIGNING SECURITY MATRIX

| Environment | Certificate Type | Storage Location | Verified | Risk |
|---|---|---|---|---|

Never display sensitive credentials.

---

# 249. CONFIGURATION ENVIRONMENT MATRIX

| Configuration | Debug Value | Release Value | Expected Production Target | Status |
|---|---|---|---|---|

Covering:

- Base API URL
- OAuth Client ID
- Firebase project
- Analytics property
- Crash reporting project
- Feature flag defaults

---

# 250. PERMISSIONS AUDIT MATRIX

| Permission | Source (App vs Library) | Protection Level | Runtime Rationale | Store Policy Relevance |
|---|---|---|---|---|

---

# 251. DATABASE AND STORAGE UPGRADE MATRIX

| From Version | To Version | Room Migration Path | Preferences Preserved | Background Work Intact | Verified |
|---|---|---|---|---|---|

---

# 252. STORE READINESS MATRIX

| Area | Mandatory | Available in Repo | Verified | Status |
|---|---|---|---|---|

Covering:

- App name
- App icon
- Screenshots
- Privacy Policy
- Data Safety declarations
- Content rating
- App access credentials
- Account deletion
- In-app billing

---

# 253. SECOND PASS - RELEASE-ONLY CODE PATH ATTACK

Review the codebase with a single guiding question:

> What code runs exclusively in release, or behaves fundamentally differently in release?

Inspect:

- R8 obfuscation and optimization
- Production API base URLs
- Release-only SDK initialization
- Production cryptographic signing
- Log suppression
- Resource shrinking
- Manifest placeholders

---

# 254. SECOND PASS - DEBUG FALSE CONFIDENCE ATTACK

For every critical feature, evaluate:

> What aspect of the development environment is masking a production failure?

Examples:

- Debug keystore SHA registered in Google Cloud Console
- Mock backend stubs
- Verbose logging hiding race conditions
- Unminified code masking reflection failures
- Permissive network security config
- Pre-authenticated developer test accounts

---

# 255. SECOND PASS - FRESH INSTALL SIMULATION

Simulate:

```text
brand new physical device
↓
install release AAB
↓
deny all optional runtime permissions
↓
launch application
```

Verify that the app reaches a usable state without crashing.

---

# 256. SECOND PASS - OLD USER UPGRADE SIMULATION

Simulate a user upgrading from a historical production release:

```text
device with legacy database v4
legacy SharedPreferences
pending scheduled WorkManager jobs
cached auth tokens
↓
install latest release candidate
```

Trace the entire cold startup sequence.

---

# 257. SECOND PASS - R8 MINIFICATION ATTACK

For every:

- Reflection call
- JSON serializer/deserializer
- JNI C++ binding
- Dynamic class lookup
- Dynamic resource identifier lookup

Evaluate:

> Can code shrinking, field stripping, or name obfuscation break this runtime behavior?

---

# 258. SECOND PASS - SIGNING CERTIFICATE SERVICE BINDING

Inspect:

> Which external services bind client identity directly to the production signing certificate?

Audit:

- Google Sign-In / OAuth
- Google Maps SDK
- Firebase Authentication
- App Links `assetlinks.json`

---

# 259. SECOND PASS - MISSING ENVIRONMENT VARIABLES

Mentally strip every CI/build environment variable:

Evaluate:

> Does the release build fail cleanly, or silently fall back to insecure debug defaults?

---

# 260. SECOND PASS - STORE POLICY APPLICABILITY

For sensitive capabilities:

- Background location
- Broad package visibility (`QUERY_ALL_PACKAGES`)
- VPN services
- In-app digital goods billing
- Children's apps
- Health and financial categories
- User-generated content

Verify against current, active Google Play policies.

---

# 261. SECOND PASS - PRODUCTION NETWORK REALISM

Analyze or test against production-like environments:

```text
real production host
real TLS
release auth client
release certificate identity
```

Verify:
- Production domain hostnames
- Public SSL/TLS certificates
- Production OAuth client configurations
- Production API rate limits

A pass on staging never proves production network viability.

---

# 262. SECOND PASS - EXECUTION WITHOUT ATTACHED DEBUGGER

Run release builds without an attached debugger.

Timing, coroutine execution, and exception handling differ when unhooked from JDWP.

---

# 263. SECOND PASS - CRASH OBSERVABILITY VALIDATION

Inject a controlled, test-only exception within a staging release build:

Verify that the crash reporting tool captures, de-obfuscates, and renders the stack trace with readable line numbers.

Never trigger test crashes in live production user populations.

---

# 264. SECOND PASS - ROLLOUT FAILURE CONTINGENCY

Assume the newly published release candidate contains a fatal bug:

Evaluate:

- How fast can the rollout be halted in Google Play Console?
- Can the defect be neutralized via remote feature flags?
- How quickly can a hotfix binary be compiled, signed, and approved?
- Does the backend maintain backward compatibility with previous app versions?

---

# 265. SECOND PASS - BACKEND API VERSION SKEW

During phased rollout, active users simultaneously run:

```text
version N (old client)
version N+1 (new client)
```

The backend must support both payload schemas concurrently.

---

# 266. SECOND PASS - LONG-TERM UN-UPDATED CLIENTS

Evaluate:

> What happens if a user does not update their application for 6 months?

Audit:

- API endpoint deprecations
- Auth token refresh lifecycles
- Enum serialization drift
- Force-update enforcement mechanisms

---

# 267. SECOND PASS - IN-APP FORCE UPDATE DEADLOCKS

If an in-app force-update gate exists:

Verify behavior when:

- Backend is unreachable
- Google Play Store is offline
- Update has not yet propagated globally to all regions

The user must not be trapped in an unrecoverable, flickering loop.

---

# 268. SECOND PASS - UNINSTALL AND CLOUD RESTORATION

Simulate Google Auto Backup restoration across reinstalls:

Ensure stale auth tokens or obsolete device IDs do not corrupt initial onboarding.

---

# 269. SECOND PASS - PERMISSION DENIAL RECOVERY

For every optional runtime permission:

```text
deny
↓
deny again / don't ask again
```

Simulate denial and permanent denial ("Don't ask again").

Verify that core non-dependent features remain fully functional.

---

# 270. SECOND PASS - MINIMUM SDK PLATFORM VALIDATION

Where possible, execute the release build on a physical device or emulator running the declared `minSdk`.

Expose missing API level checks and class verification crashes.

---

# 271. SECOND PASS - LATEST ANDROID PLATFORM BEHAVIOR

Execute on the latest production Android OS version.

Expose behavioral shifts in window insets, predictive back, notifications, and background work.

---

# 272. SECOND PASS - MANIFEST HARDWARE FILTERING

Audit:

> Which device categories will Google Play filter out based on the merged manifest `<uses-feature>` tags?

Identify accidental exclusions of tablets, foldables, or camera-less devices.

---

# 273. FINAL QUALITY GATE

Before publishing the audit report, verify:

- Release compilation is audited separately from debug builds
- AAB bundle packaging is evaluated for Google Play distribution
- Signing configuration is verified from code/scripts, not assumed
- Secret passwords and tokens are strictly masked in the report
- Merged release manifest is analyzed, not just source manifest
- Transitive permissions injected by libraries are audited
- R8 findings include specific reflection, JNI, or serialization evidence
- Indiscriminate keep rules are not recommended as quick fixes
- Resource shrinking and dynamic string lookups are verified
- Fresh install and version upgrade paths are evaluated separately
- Multi-version skipped database migrations are audited
- Production backend configs are not assumed from staging success
- Release certificate service bindings (OAuth, Maps) are checked
- Debugging tools (LeakCanary, Stetho) do not leak into release
- Crash mapping de-obfuscation pipeline is verified
- Google Play policy assertions cite active, verified guidelines
- Platform runtime bugs are segregated from store policy issues
- Unavailable Play Console settings are clearly flagged NOT VERIFIED
- Billing and subscriptions are audited only if implemented
- Child, health, financial, and UGC policies are applied only when relevant
- minSdk and targetSdk behavioral changes are verified against target versions
- Version skew between old and new clients during rollout is evaluated
- Identified release blockers are strictly separated from P4 improvements

---

# FINAL RULE

Do not deliver a report stating:

> Increment versionCode, enable R8, compile an AAB, and publish the app to Google Play.

That is not a release readiness audit.

Seek concrete systemic failures such as:

```text
debug build
↓
Google OAuth uses debug signing certificate fingerprint
↓
login works perfectly in QA
↓
release variant compiled and signed with production key
↓
production SHA-1 fingerprint was never registered in Google Cloud Console
↓
authentication fails for 100% of production users immediately after release
```

or:

```text
release minification enabled
↓
JSON serializer inspects data models via runtime reflection
↓
R8 strips model constructors and field names
↓
debug automated tests pass
↓
release build crashes with JsonDataException parsing production API responses
```

or:

```text
current application database version = 8
↓
existing user updates from historical production version with database v4
↓
only migration 7 → 8 was implemented and tested
↓
database throws IllegalStateException upon startup
↓
app crashes continuously or wipes user data via destructive fallback
```

or:

```text
release CI environment variable missing
↓
Gradle script silently falls back to staging API endpoint
↓
production application ships successfully to Google Play
↓
thousands of real users transmit sensitive data to staging servers
```

or:

```text
third-party library injects dangerous permission via manifest merge
↓
developer inspects only app/src/main/AndroidManifest.xml
↓
permission ships inside final production release
↓
Google Play Store flags policy violation and rejects app submission
```

or:

```text
R8 mapping.txt file is not archived by CI
↓
production crashes occur in live release
↓
Crashlytics displays obfuscated stack traces with unreadable symbols
↓
engineering team cannot diagnose or locate the failure
```

or:

```text
new release renames a ListenableWorker class
↓
existing users have active scheduled WorkManager jobs referencing old class name
↓
after update, WorkManager fails to instantiate missing worker class
↓
critical background synchronization permanently halts
```

These are the release and distribution failures you must uncover.

Think through:

- Debug vs release configuration differences
- Source vs merged release manifests
- Unminified vs shrunk and obfuscated bytecode
- Local developer builds vs automated CI pipelines
- Unsigned vs cryptographically signed binaries
- Fresh clean installs vs multi-version upgrades
- Current client vs historical legacy clients
- Staging vs production environments
- APK vs App Bundle split delivery
- Technical code correctness vs Google Play Store compliance

For every substantive finding, you must answer:

> Does this defect manifest strictly in release builds?

> Does the compiled AAB contain the expected production configuration?

> Does the production signing identity match all registered external services?

> Can an existing user safely upgrade without data loss or crashes?

> Does the merged manifest reflect the intended permission and component model?

> Is the Play Store policy assertion backed by verified active requirements?

If not verified at runtime:

**NOT VERIFIED.**

If Google Play policy is unconfirmed:

**CURRENT PLAY POLICY NOT VERIFIED.**

If representing only process quality enhancement rather than a release blocker:

**P4 - IMPROVEMENT.**

Uncovering 5 genuine release blockers with exact root cause analysis is infinitely superior to writing 100 generic publishing recommendations.

The goal is a forensically precise release audit from which every substantive finding translates directly into:

- a Gradle build fix
- a signing and configuration correction
- an R8 regression test
- an upgrade and database migration test
- a pre-flight release smoke test
- an automated CI quality gate
- a verified Google Play submission checklist
- a production-safe phased rollout plan
