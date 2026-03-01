# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automatic OAuth token expiry detection and refresh with a 60-second safety buffer (`SalesForceClient`)
- `docs/` folder with structured documentation: `index.md`, `getting-started.md`, `api-reference.md`, `error-handling.md`, `configuration.md`
- npm registry (`publish-npm` job) support in publish workflow — activated by adding an `NPM_TOKEN` secret
- Pre-publish test gate (`test` job) in publish workflow to prevent broken releases

### Changed
- `api()` body parameter type widened to `Record<string, any> | Record<string, any>[] | null` to correctly accept array payloads (used by `DataExtensions.insert`, `delete`, etc.)
- Upgraded `softprops/action-gh-release` from `v1` to `v2` in publish workflow
- Upgraded `codecov/codecov-action` from `v4` to `v5` in test workflow

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

[Unreleased]: https://github.com/designofadecade/salesforce-marketing-cloud/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/designofadecade/salesforce-marketing-cloud/releases/tag/v1.0.4
[1.0.0]: https://github.com/designofadecade/salesforce-marketing-cloud/releases/tag/v1.0.0
