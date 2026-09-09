# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-09-09

### Added
- **`bulkDelete()` accepts an optional `concurrency` argument** (default `1`, i.e. unchanged behavior). Batches were always sent one at a time, so a large delete cost one full round-trip per batch. Raising `concurrency` sends a window of batches in flight at once. Measured against a simulated 25 ms round-trip, a 20,000-row delete (20 batches) went from 515 ms to 129 ms at `concurrency: 4` and 78 ms at `8`. Results keep their batch order regardless of completion order, and a failure still reports how many batches completed — with concurrency, successes within the failing window are counted before the error is raised. Sent batches cannot be rolled back, which is why this is opt-in rather than the default.
- CI gained a non-blocking `typescript-next` job that typechecks against `typescript@next`. TypeScript 7 cannot be adopted yet — typescript-eslint 8.70.0 caps at `typescript <6.1.0` and there is no v9 — but the source already compiles clean under 7.0.2 with byte-identical emit, so this surfaces a regression before the switch becomes possible.

### Documentation
- README documents `bulkDelete()`'s batching and concurrency, including the partial-failure reporting.
- README gained an upgrade note for the 2.2.0 error-type change: authentication failures through wrapper methods are now `SalesForceAuthError` with the real status, not `SalesForceAPIError` with a fabricated 500.

### Tests
- 165 → 173 tests, covering concurrency validation, that the default sends one batch at a time, that raising it overlaps requests up to the limit, that result order is preserved when batches finish out of order, and that the completed-batch count is correct when one batch in a concurrent window fails.

### Notes
- `AutomationStudio.activate()` and its timezone handling remain untouched, as they have since 2.0.0. The only change ever made to that method was attaching a sanitized error `cause` in 2.1.1; the date logic is byte-identical.

## [2.4.0] - 2026-09-09

Follow-up to an independent security re-review of 2.3.0, which confirmed the 2.1.1 fixes are complete and found no new way for a token or secret to escape. This release fixes the issues it did surface, plus a functional regression from 2.2.0.

### Fixed
- **`bulkDelete()` progress reporting never actually fired (regression introduced in 2.2.0).** `SalesForceClient.api()` wraps every HTTP failure as a `SalesForceAPIError`, so the `isSalesForceError()` passthrough always matched first and the `"batch N of M"` context added in 2.2.0 was dead code. The 2.2.0 test only passed because it rejected with a plain `Error`, which is not what `api()` throws. An API error is now re-raised with the progress context and its original `statusCode`, with the original attached as `cause`; auth and config errors still pass through untouched.
- **Query parameters in `AutomationStudio.getAll()` were interpolated unencoded.** `page` and `pageSize` are typed as numbers, but nothing enforced that at runtime, so a string arriving from untyped code (`req.query.page`, for example) could append arbitrary query parameters to an authenticated request. Both are now validated as integers.
- **Malformed identifiers threw a raw `URIError`.** `encodeURIComponent` throws for a lone surrogate, which escaped the SDK error hierarchy entirely — a caller catching `SalesForceConfigError` or `SalesForceAPIError` would miss it. All URL parameter encoding now goes through an internal `encodeParam` helper that reports malformed input as `SalesForceConfigError`.
- **Error metadata no longer records query strings.** `SalesForceAPIError.endpoint` held the full endpoint including the query, so after the 2.2.0 passthrough change a failing `getData()` call put the `$filter` value — typically a subscriber email — into every error log. `endpoint` is now the path only, which is also what error aggregators group on.

### Documentation
- `soapClient()` now documents that the returned client retains the access token: it is set as a SOAP header, `soap` keeps the full envelope on `client.lastRequest` after any call, and async SOAP methods resolve a tuple whose fourth element is the raw request XML. Logging any of those leaks a live token. The SDK's own `activate()` and `pause()` read only `[0].OverallStatus`.
- README gained a complete error-handling section reflecting how the classes actually behave, and documents the now-implemented `AutomationStudio.delete()`.

### Added
- `AutomationStudio.delete()` is implemented. It previously shipped as a method that unconditionally threw. It now issues `DELETE /automation/v1/automations/{id}` with the same validation, encoding and error handling as the rest of the class. Verified against the documented endpoint and covered by tests, but not exercised against a live Marketing Cloud tenant.

### Tests
- 128 → 165 tests. Coverage rose from 78.16% lines / 57.35% branches to **97.4% lines / 88.46% branches / 100% functions**.
- The repository has always declared an 80% coverage threshold, but CI ran `test:coverage` with `continue-on-error: true`, so the failure was invisible. CI now gates on both coverage and the linter; only the Codecov upload remains best-effort.
- Added systematic coverage of all argument-validation branches, all error-wrapping paths (each asserting the sanitized `cause` carries no token), SOAP client failure paths, non-`Error` rejections, and SDK error passthrough.

### Behavior changes
- `SalesForceAPIError.endpoint` is the path without the query string.
- `getAll()` rejects non-integer `page` or `pageSize` rather than interpolating them.
- Malformed identifiers raise `SalesForceConfigError` instead of `URIError`.
- `bulkDelete()` API failures are re-raised with progress context rather than passed through by identity; `statusCode` and type are preserved and the original is available on `cause`.

## [2.3.0] - 2026-09-09

Production-readiness release: runtime compatibility, pagination safety, API typing and CI gating.

### Fixed
- **Unbounded pagination could hang the process.** `AutomationStudio.getAll()` and `DataExtensions.getAllRows()` looped for as long as the API advertised a `links.next`, with no ceiling. A server that always advertises one would loop forever, accumulating results until the process ran out of memory. Both now stop after `MAX_PAGES` (1000) and throw a `SalesForceAPIError`.
- **`SalesForceClient.api()` reported a caller mistake as an API response.** An empty endpoint threw `SalesForceAPIError` with a fabricated `statusCode` of 400; it now throws `SalesForceConfigError`, matching every other argument validation in the SDK.
- **`AutomationStudio.delete()` threw a bare `Error`**, so it could not be caught alongside other SDK failures. It now throws `SalesForceConfigError` and names the alternative. The method remains unimplemented and deprecated.
- **Shipped source maps pointed at files that were not published.** `dist/*.js.map` and `dist/*.d.ts.map` reference `../src/*.ts`, but `files` only included `dist`, so consumer debuggers and go-to-definition resolved to nonexistent paths. `src` is now published (tests excluded).

### Changed
- **Node floor lowered from `>=24.0.0` to `>=20.0.0`.** Nothing in the SDK needs more than Node 18 (`fetch`, `#private` fields, `Error` `cause`, `Intl` `shortOffset`); the previous floor excluded Node 20 and 22 deployments for no benefit. CI now runs the full suite on Node 20, 22 and 24.
- `AutomationStudio.getAll()` gained overloads. `getAll()` narrows to `AutomationResponse[]` and `getAll({ page })` narrows to `AutomationsListResponse`, instead of both returning a union every caller had to narrow by hand. Runtime behavior is unchanged.
- CI now gates on the linter instead of running it with `continue-on-error`, and the workflows use `actions/checkout@v5` and `actions/setup-node@v5` (v4 was being force-migrated off Node 20).
- ESLint no longer reports `no-explicit-any` in test files, where mock casts made it noise. Warnings dropped from 112 to 26, all in `src/`, so the count is now a usable signal.

### Documentation
- README corrected: `getAll()` was documented as returning `AutomationsListResponse`, which was wrong for the no-argument call. Both forms and the pagination cap are now described.
- README Node requirement updated to 20+.

### Behavior changes
- `api('')` throws `SalesForceConfigError` rather than `SalesForceAPIError` (`statusCode` 400).
- `AutomationStudio.delete()` throws `SalesForceConfigError` rather than `Error`.
- Automatic pagination past 1000 pages now throws instead of continuing. Collections larger than 500,000 records need explicit paging.
- The narrowed `getAll()` return types can surface a compile error in defensive code that branched on `Array.isArray(...)` for the no-argument call, since that branch is now statically known.

### Tests
- 122 → 128 tests, covering both pagination caps, the `getAll` single-page path, `delete()`'s error type and `api('')` validation. Overload narrowing is verified at the type level.

## [2.2.0] - 2026-09-09

Error handling, resource and typing fixes from the v2.1.1 code review. No signature is removed or narrowed, but error *types* change for some failures — see Behavior changes.

### Fixed
- **Authentication failures are no longer flattened into fabricated 500s.** Every wrapper method caught only `SalesForceAPIError` and re-wrapped anything else, so a 401 from the token endpoint surfaced through `DataExtensions.get()` as `SalesForceAPIError` with `statusCode: 500` and no `cause`. `instanceof SalesForceAuthError` was therefore `false` outside a direct `client.api()` call, and retry-on-5xx logic would retry a credentials failure indefinitely. All 17 wrapper catch sites now re-throw SDK errors unchanged via a new internal `isSalesForceError` guard.
- **Concurrent calls no longer trigger a token request each.** `#authenticate()` had no in-flight guard, so N parallel calls on a cold or newly expired client each POSTed the `client_secret` to the rate-limited token endpoint. Callers now share a single in-flight request; a failed attempt is not cached, so the next call retries.
- **`clearRecords()` no longer silently skips rows with falsy primary keys.** A truthiness check dropped legitimate keys such as `0` or `''`, leaving those rows in the data extension while the method returned `void` and reported success. Only genuinely absent keys are skipped now.
- **`bulkDelete()` no longer silently deletes nothing for a non-integer batch size.** `NaN` passed the old `batchSize < 1` check, then `i += NaN` ended the batching loop immediately, so the call completed successfully having deleted no rows. A realistic trigger was `parseInt(process.env.BATCH_SIZE)` on an unset variable. Batch size must now be a positive integer.

### Added
- `cause` is now attached to every wrapped error, sanitized through `toSafeCause` so transport errors cannot carry an access token into logs. `SalesForceAPIError`, `SalesForceAuthError` and `SalesForceConfigError` all accept an `ErrorOptions` argument.
- Generic return types on `insert`, `update`, `insertAsync`, `updateAsync`, `delete`, `bulkDelete`, `run` and both `endpoints()` methods — e.g. `insert<T>(...): Promise<T>`. The default remains `any`, so existing callers are unaffected.
- `bulkDelete()` failures now report progress: `"Failed to bulk delete data on batch 2 of 3 (1 of 3 batches completed)"`. Batches already sent cannot be rolled back, so knowing where it stopped matters.

### Behavior changes
- Authentication failures raised through wrapper methods are now `SalesForceAuthError` (`statusCode` 401) rather than `SalesForceAPIError` (`statusCode` 500). This restores the behavior the README has always documented, but code catching `SalesForceAPIError` to handle auth failures will no longer match them.
- `bulkDelete()` rejects `NaN`, `Infinity` and fractional batch sizes that were previously accepted. `Infinity` had behaved as a single batch.
- Two validation and failure messages changed wording; string-matching on them will need updating.

### Tests
- 109 → 122 tests. Added coverage for auth and config error passthrough, sanitized `cause` content, concurrent token deduplication and retry-after-failure, batch-size validation, batch coverage and mid-batch failure reporting, and falsy primary keys in `clearRecords()`. All new tests were confirmed to fail against the unfixed code.

## [2.1.1] - 2026-09-09

Security patch. No public API changes; drop-in for 2.1.0.

### Security
- **Fixed access token leaking into logs via the error `cause` chain (regression introduced in 2.1.0).** Transport-level SOAP failures reject with a raw axios error whose `config.data` holds the full request envelope, including the `<fueloauth>` access token. 2.1.0 attached that error directly as `cause`, so `util.inspect`, `console.error` and `AxiosError.toJSON` all serialised a live token. Causes are now reduced to `name`, `message` and `code` via an internal `toSafeCause` helper. Affects `AutomationStudio.activate()`, `AutomationStudio.pause()` and `SalesForceClient.soapClient()`.
- **Fixed OData filter injection in `DataExtensions.getData()`.** `primaryKeyValue` was interpolated into the `$filter` expression unescaped, so a value containing a single quote could rewrite the filter. Supplying `x' or email ne 'x` produced a tautology matching every row, and `getData` returns the first one — leaking another record to the caller. Values now have quotes doubled per OData and are URL-encoded; field names are restricted to `[A-Za-z0-9_]` and rejected with `SalesForceConfigError` otherwise.
- **Fixed path traversal via unencoded identifiers.** `externalKey`, `automationId` and asset `id` were interpolated into REST paths without encoding in six places, letting `../` segments retarget a request at a different Marketing Cloud endpoint while still carrying the caller's bearer token. All path parameters are now passed through `encodeURIComponent`, matching what `insert()`/`update()`/`delete()`/`bulkDelete()` already did. Affects `DataExtensions.get()`, `.getData()`, `.getAllRows()`, `AutomationStudio.get()`, `.run()` and `Assets.update()`.
- **Added `clientDomain` validation.** The value is interpolated directly into the auth and SOAP hostnames, so a value such as `attacker.example/` redirected the token request — and the `client_id` and `client_secret` in its body — to an arbitrary host. The constructor now requires a bare subdomain (`[A-Za-z0-9][A-Za-z0-9-]*`) and throws `SalesForceConfigError` otherwise.

### Changed
- Error `endpoint` values now match the encoded path actually requested, rather than the raw identifier.

### Documentation
- Documented the timezone handling in `AutomationStudio.#getFormattedDateForTimezone()` as a deliberate Marketing Cloud workaround. The conversion is host-timezone dependent and does not match a strict ISO 8601 reading, but it reflects observed SFMC scheduling behaviour and must not be "corrected" without verifying against a live instance.

### Tests
- 76 → 109 tests. Added regression coverage for every issue above: OData quote escaping and field-name validation, path encoding across all six call sites, `clientDomain` rejection, and assertions that a serialised error chain never contains an access token. All new security tests were confirmed to fail against the unfixed code.
- Added `src/errors.test.ts` covering the error classes and `toSafeCause`.

## [2.1.0] - 2026-09-09

### Security
- Resolved all 13 known advisories (8 high, 5 moderate). `npm audit` now reports 0 vulnerabilities.
- Raised the `soap` floor from `^1.1.5` to `^1.11.0`, pulling in patched transitive dependencies:
  - `axios` 1.15.2 → 1.20.0 — 18 advisories, including ReDoS, `Proxy-Authorization` credential leaks across redirects, `NO_PROXY` bypasses, and prototype-pollution request tampering
  - `@xmldom/xmldom` 0.8.13 → 0.8.15 — 10 advisories, including XML/attribute/DocType injection bypassing `requireWellFormed`, and quadratic-time parsing
- Cleared dev-toolchain advisories in `@vitest/mocker` (path traversal / arbitrary file read), `vite`, `postcss`, `nanoid`, `js-yaml`, `brace-expansion`, and `form-data`. These are dev-only and never shipped, since `files` is limited to `dist`.

### Changed
- Upgraded the dev toolchain: ESLint 8 → 10, typescript-eslint 7 → 8, TypeScript 5 → 6, Vitest 4 → 5, `@types/node` 20 → 24 (now matching the declared `node >=24` engine).
- Migrated ESLint to flat config: `eslint.config.js` replaces `.eslintrc.json`. ESLint 8 had reached end of life.
- `tsconfig.json` now uses `module`/`moduleResolution: NodeNext`, replacing `ES2022`/`node`. The old `node10` resolution is deprecated in TypeScript 6 and stops working in 7. All relative imports already carried explicit `.js` extensions, so this required no source changes.
- `tsconfig.json` now declares `types: ["node"]` explicitly, as TypeScript 6 no longer auto-includes every `@types/*` package. This also keeps unrelated test-only types out of the build.
- The `lint` script now targets `src` instead of a shell glob, matching flat-config conventions.

### Fixed
- Rethrown errors in `AutomationStudio.activate()`, `AutomationStudio.pause()`, and SOAP client creation in `SalesForceClient` now attach the original error via `{ cause }`. Previously the underlying failure was discarded, leaving only a summary message and making SOAP and network faults hard to diagnose.

### Notes
- No public API changes. This release is drop-in for 2.0.x.
- TypeScript was held at 6.x rather than 7.x because typescript-eslint 8 (the current release) supports TypeScript `<6.1.0`. TypeScript 7 can be adopted once typescript-eslint ships support.

## [2.0.0] - 2026-08-19

### Added
- New `bulkDelete()` method to `DataExtensions` class for deleting multiple records with automatic batching
- Automatic batching in `bulkDelete()` to handle large datasets safely (default: 1,000 records per batch)
- Configurable batch size parameter to optimize for different use cases
- Significantly improves performance for bulk delete operations (reduces N sequential API calls to batched calls)
- Follows the same pattern as `insert()` method, accepting an array of items to delete

### Changed
- `clearRecords()` method now uses `bulkDelete()` internally for dramatically improved performance
- `clearRecords()` now completes in <5 seconds instead of 90+ seconds for large data extensions

### Breaking Changes
- **`bulkDelete()` return type changed from `Promise<any>` to `Promise<any[]>`**
  - Now returns an array of API responses (one per batch) instead of a single response
  - For datasets under 1,000 records, returns array with single response: `[response]`
  - For larger datasets, returns array with multiple responses: `[response1, response2, ...]`

### Performance
- Bulk delete operations now complete in <5 seconds instead of 90+ seconds for large data extensions
- Automatic batching prevents API limit errors for datasets exceeding 1,000 records

## [1.6.1] - 2026-04-23

### Security
- Fixed 4 high-severity vulnerabilities in `@xmldom/xmldom` (CVE CVSS 8.7)
  - Uncontrolled Recursion (CWE-674)
  - XML Injection vulnerabilities (CWE-91)
- Updated `@xmldom/xmldom` from 0.8.12 to 0.8.13 (transitive dependency via `soap`)

## [1.6.0] - 2026-04-15

### Security
- Updated `soap` from 1.7.1 to 1.8.0 to fix critical security vulnerabilities
- Fixed critical SSRF vulnerability in `axios` (CVE CVSS 9.1) - updated to 1.15.0
- Fixed high severity XML injection in `@xmldom/xmldom` (CVSS 7.7) - updated to 0.8.12
- Fixed high severity HTTP response splitting in `axios` (CVSS 7.0)
- Updated dev dependencies (`vitest`, `@vitest/coverage-v8`, `@vitest/ui`) to 4.1.4 to address moderate security issues in testing infrastructure

## [1.4.0] - 2026-03-02

### Added
- Pagination support for `AutomationStudio.getAll()` method
- Optional `page` and `pageSize` parameters to retrieve specific pages of automations
- Pagination metadata fields (`page`, `pageSize`, `links`) to `AutomationsListResponse` type

### Changed
- `AutomationStudio.getAll()` now automatically fetches all automations across multiple pages when called without parameters
- `AutomationStudio.getAll()` returns `AutomationResponse[]` when fetching all, or `AutomationsListResponse` when requesting a specific page
- Default page size increased to 500 items per request for better performance

## [1.3.0] - 2026-03-02

### Added
- Data size validation in `DataExtensions.jsonToValues()` method to prevent silent data truncation
- Error thrown when JSON data exceeds the `count x size` limit with helpful error message including actual size, maximum size, and suggestions

### Changed
- `DataExtensions.jsonToValues()` now validates data fits within specified constraints before chunking

## [1.2.0] - 2026-03-01

### Added
- New `Scopes` class with 45+ OAuth scope constants for all Marketing Cloud APIs
- Comprehensive OAuth scope documentation (`docs/oauth-scopes.md`) with examples and best practices
- Scope constants organized by category: Messaging, Data & Content, Automation, Administration
- `Scopes.buildScope()` helper method to combine multiple scopes
- Support for all Marketing Cloud channels: Email, SMS, Push, Social, OTT (chat)
- Test suite for Scopes class (11 new tests, 62 total)

### Changed
- OAuth scopes now accessed via `Scopes` class instead of `SalesForceClient`
- Updated all examples and documentation to use new `Scopes` class
- Scope constant naming simplified (removed `SCOPE_` prefix, e.g., `Scopes.EMAIL_READ` instead of `SalesForceClient.SCOPE_EMAIL_READ`)

## [1.1.0] - 2026-03-01

### Added
- Automatic OAuth token expiry detection and refresh with a 60-second safety buffer (`SalesForceClient`)
- `docs/` folder with structured documentation: `index.md`, `getting-started.md`, `api-reference.md`, `error-handling.md`, `configuration.md`
- npm registry (`publish-npm` job) support in publish workflow with provenance attestation
- Pre-publish test gate (`test` job) in publish workflow to prevent broken releases
- Build provenance support (`--provenance` flag) for supply chain security

### Changed
- **Breaking**: Package now published to npmjs.com instead of GitHub Packages
- Updated `publishConfig` to publish to npm public registry with `access: public`
- Simplified installation - no longer requires `.npmrc` configuration or GitHub authentication
- Updated all documentation to reflect npm installation instead of GitHub Packages
- `api()` body parameter type widened to `Record<string, any> | Record<string, any>[] | null` to correctly accept array payloads (used by `DataExtensions.insert`, `delete`, etc.)
- Upgraded `softprops/action-gh-release` from `v1` to `v2` in publish workflow
- Upgraded `codecov/codecov-action` from `v4` to `v5` in test workflow
- GitHub Actions workflow now publishes to both GitHub Packages and npmjs.com with provenance

## [1.0.4] - 2026-02-24

### Fixed
- Minor patch updates

## [1.0.0] - 2026-02-24

### Added
- Initial release of Salesforce Marketing Cloud SDK
- Full TypeScript support with comprehensive type definitions
- ESM (ES Modules) compatibility
- Support for both REST and SOAP APIs
- SalesForceClient class for authentication and API requests
- Assets class for managing content assets
- DataExtensions class for managing data extensions
- AutomationStudio class for managing automations
- Custom error classes (SalesForceAPIError, SalesForceAuthError, SalesForceConfigError)
- Comprehensive test suite using Vitest (49 tests)
- GitHub Actions workflow for CI/CD
- Full API documentation
- MIT License

### Requirements
- Node.js >= 24.0.0
- ES Modules support

[Unreleased]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.6.1...HEAD
[1.6.1]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.4.0...v1.6.0
[1.4.0]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/designofadecade/salesforce-marketing-cloud/releases/tag/v1.0.4
[1.0.0]: https://github.com/designofadecade/salesforce-marketing-cloud/releases/tag/v1.0.0
