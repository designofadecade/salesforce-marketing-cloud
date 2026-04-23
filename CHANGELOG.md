# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
