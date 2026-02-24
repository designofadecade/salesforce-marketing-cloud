# Salesforce Marketing Cloud SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40designofadecade%2Fsalesforce-marketing-cloud.svg)](https://www.npmjs.com/package/@designofadecade/salesforce-marketing-cloud)

A modern, type-safe Node.js SDK for interacting with the Salesforce Marketing Cloud API. Built with TypeScript and designed for Node.js 24+.

## Features

- ✅ Full TypeScript support with comprehensive type definitions
- ✅ ESM (ES Modules) compatible
- ✅ Support for both REST and SOAP APIs
- ✅ Comprehensive error handling with custom error types
- ✅ Automatic OAuth 2.0 authentication
- ✅ Well-tested with Vitest
- ✅ Modern async/await API
- ✅ Zero dependencies (except soap for SOAP API support)

## 📦 Installation

This package is published to npm. To install:

```bash
npm install @designofadecade/salesforce-marketing-cloud
```

Or with yarn:

```bash
yarn add @designofadecade/salesforce-marketing-cloud
```

Or with pnpm:

```bash
pnpm add @designofadecade/salesforce-marketing-cloud
```

### Requirements

- **Node.js** >= 24.0.0
- **ES Modules** support (package uses `"type": "module"`)
- TypeScript >= 5.0 (if using TypeScript)

## Quick Start

```typescript
import SalesForceClient, { Assets, DataExtensions, AutomationStudio } from '@designofadecade/salesforce-marketing-cloud';

// Initialize the client
const client = new SalesForceClient({
  clientDomain: 'your-subdomain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
  scope: 'your-scope' // optional
});

// Use the client directly
const endpoints = await client.endpoints();

// Or use specialized modules
const assets = new Assets(client);
const assetList = await assets.list();

const dataExtensions = new DataExtensions(client);
const rows = await dataExtensions.getAllRows('customer-de');

const automation = new AutomationStudio(client);
const automations = await automation.getAll();
```

## API Reference

### SalesForceClient

The main client for authenticating and making API requests.

#### Constructor

```typescript
new SalesForceClient(config: SalesForceClientConfig)
```

**Parameters:**
- `clientDomain` (string, required): Your Marketing Cloud subdomain
- `clientId` (string, required): OAuth client ID
- `clientSecret` (string, required): OAuth client secret
- `accountId` (string, required): Marketing Cloud account ID
- `scope` (string, optional): OAuth scope

**Throws:**
- `SalesForceConfigError`: If required configuration is missing

#### Methods

##### `api<T>(endpoint: string, method?: string, body?: any): Promise<T>`

Makes an authenticated REST API request.

```typescript
const result = await client.api('/asset/v1/content/assets', 'GET');
const created = await client.api('/asset/v1/content/assets', 'POST', { name: 'New Asset' });
```

**Throws:**
- `SalesForceAuthError`: If authentication fails
- `SalesForceAPIError`: If the API request fails

##### `endpoints(): Promise<any>`

Retrieves available API endpoints.

```typescript
const endpoints = await client.endpoints();
```

##### `soapClient(): Promise<SoapClientInterface>`

Creates a configured SOAP client.

```typescript
const soapClient = await client.soapClient();
const result = await soapClient.RetrieveAsync({ /* ... */ });
```

### Assets

Manage Marketing Cloud content assets.

#### Constructor

```typescript
const assets = new Assets(salesForceClient);
```

#### Methods

##### `list(): Promise<AssetsListResponse>`

Lists all assets of type 205 (HTML content blocks).

```typescript
const assets = await assetsClient.list();
console.log(`Found ${assets.count} assets`);
```

##### `update(id: string, data: Record<string, any>): Promise<AssetResponse>`

Updates an asset.

```typescript
const updated = await assetsClient.update('12345', {
  name: 'Updated Asset Name',
  content: '<html>...</html>'
});
```

### DataExtensions

Manage data extensions and their records.

#### Constructor

```typescript
const dataExtensions = new DataExtensions(salesForceClient);
```

#### Methods

##### `get(externalKey: string): Promise<DataExtensionResponse>`

Retrieves rows from a data extension.

```typescript
const data = await dataExtensions.get('customer-de');
```

##### `getData(externalKey: string, primaryKey: string, primaryKeyValue: string): Promise<Record<string, any> | undefined>`

Gets a specific record by primary key.

```typescript
const customer = await dataExtensions.getData('customer-de', 'email', 'customer@example.com');
```

##### `insert(externalKey: string, items: DataExtensionRow[]): Promise<any>`

Inserts records.

```typescript
await dataExtensions.insert('customer-de', [
  { keys: { email: 'john@example.com' }, values: { name: 'John', status: 'active' } }
]);
```

##### `update(externalKey: string, primaryKey: string, primaryKeyValue: string, values: Record<string, any>): Promise<any>`

Updates a record.

```typescript
await dataExtensions.update('customer-de', 'email', 'john@example.com', {
  status: 'inactive',
  lastUpdated: new Date().toISOString()
});
```

##### `delete(externalKey: string, primaryKey: string, primaryKeyValue: string): Promise<any>`

Deletes a record.

```typescript
await dataExtensions.delete('customer-de', 'email', 'old@example.com');
```

##### `getAllRows(externalKey: string): Promise<DataExtensionRow[]>`

Gets all rows with automatic pagination.

```typescript
const allRows = await dataExtensions.getAllRows('customer-de');
console.log(`Total rows: ${allRows.length}`);
```

##### `insertAsync(externalKey: string, items: Record<string, any>[]): Promise<any>`

Inserts records asynchronously (for large batches).

```typescript
const result = await dataExtensions.insertAsync('customer-de', [
  { email: 'john@example.com', name: 'John' }
]);
```

##### `updateAsync(externalKey: string, items: Record<string, any>[]): Promise<any>`

Updates records asynchronously.

##### `clearRecords(externalKey: string, primaryKey?: string): Promise<void>`

Deletes all records from a data extension.

```typescript
await dataExtensions.clearRecords('temp-de', 'id');
```

##### Static: `jsonToValues(data: any, attribute: string, count?: number, size?: number): Record<string, string>`

Splits JSON into chunks for storage in multiple fields.

```typescript
const chunked = DataExtensions.jsonToValues(
  { large: 'object' },
  'json',
  4,
  3900
);
// Returns: { json1: '...', json2: '...', json3: '...', json4: '...' }
```

### AutomationStudio

Manage Marketing Cloud automations.

#### Constructor

```typescript
const automation = new AutomationStudio(salesForceClient);
```

#### Timezone Constants

AutomationStudio provides timezone constants for easier automation scheduling:

```typescript
// Available timezone constants
AutomationStudio.TIME_ZONE_AMERICA_TORONTO  // 76 - Eastern Time
AutomationStudio.TIME_ZONE_AMERICA_CHICAGO  // 27 - Central Time
```

#### Methods

##### `getAll(): Promise<AutomationsListResponse>`

Gets all automations.

```typescript
const automations = await automation.getAll();
```

##### `get(externalKey: string): Promise<AutomationResponse>`

Gets a specific automation.

```typescript
const auto = await automation.get('my-automation-key');
```

##### `create(options?: CreateAutomationOptions): Promise<AutomationResponse>`

Creates a new automation. All parameters are optional but typically all should be provided.

**Parameters:**
- `name` (optional): Name of the automation
- `description` (optional): Description of the automation
- `steps` (optional): Array of automation steps with activities
- `startDate` (optional): Start date in ISO 8601 format
- `timeZoneId` (optional): Timezone ID

```typescript
// Create with all parameters
const newAuto = await automation.create({
  name: 'Daily Email Campaign',
  description: 'Sends daily promotional emails',
  startDate: '2026-03-01T09:00:00',
  timeZoneId: AutomationStudio.TIME_ZONE_AMERICA_CHICAGO,
  steps: [{
    stepNumber: 0,
    activities: [{
      name: 'Send Email',
      objectTypeId: 42,
      displayOrder: 1,
      activityObjectId: 'your-activity-id'
    }]
  }]
});
```

##### `activate(automationId: string, date: string, timeZoneId?: number): Promise<boolean>`

Activates an automation. Uses timezone constants for automatic date formatting.

```typescript
const success = await automation.activate(
  'automation-id',
  '2026-03-01T10:00:00',
  AutomationStudio.TIME_ZONE_AMERICA_TORONTO  // Default if not specified
);

// Or with Central Time
const success = await automation.activate(
  'automation-id',
  '2026-03-01T10:00:00',
  AutomationStudio.TIME_ZONE_AMERICA_CHICAGO
);
```

```

##### `pause(automationId: string): Promise<boolean>`

Pauses an automation.

```typescript
await automation.pause('automation-id');
```

##### `run(automationId: string): Promise<any>`

Runs an automation immediately.

```typescript
const result = await automation.run('automation-id');
```

## Error Handling

The SDK provides custom error classes for better error handling:

### `SalesForceConfigError`

Thrown when configuration is invalid or missing.

```typescript
try {
  const client = new SalesForceClient({});
} catch (error) {
  if (error instanceof SalesForceConfigError) {
    console.error('Configuration error:', error.message);
  }
}
```

### `SalesForceAuthError`

Thrown when authentication fails.

```typescript
try {
  await client.api('/some/endpoint');
} catch (error) {
  if (error instanceof SalesForceAuthError) {
    console.error('Auth failed:', error.statusCode, error.message);
  }
}
```

### `SalesForceAPIError`

Thrown when API requests fail.

```typescript
try {
  await client.api('/invalid/endpoint');
} catch (error) {
  if (error instanceof SalesForceAPIError) {
    console.error('API error:', {
      statusCode: error.statusCode,
      endpoint: error.endpoint,
      method: error.method,
      message: error.message
    });
  }
}
```

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## 🚀 Releasing New Versions

This package uses semantic versioning. To release a new version:

### Using VS Code Tasks (Recommended)

Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and select "Tasks: Run Task", then choose:

- **Version: Patch (Bug Fix)** - For backward-compatible bug fixes (1.0.0 → 1.0.1)
- **Version: Minor (New Feature)** - For backward-compatible new features (1.0.0 → 1.1.0)
- **Version: Major (Breaking Change)** - For breaking changes (1.0.0 → 2.0.0)

Each task will:
1. Run all tests
2. Build the package
3. Bump the version in package.json
4. Create a git commit and tag
5. Push the tag to GitHub
6. GitHub Actions will automatically publish to npm

### Manual Release

```bash
# Run tests and build
npm test && npm run build

# Bump version (patch, minor, or major)
npm version patch  # or minor, or major

# Push the tag
git push --follow-tags
```

The GitHub Actions workflow will automatically:
- Build the package
- Publish to npm with provenance
- Create a GitHub release with auto-generated release notes

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code is formatted with Prettier
- TypeScript types are properly defined
- New features include tests and documentation

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/designofadecade/salesforce-marketing-cloud/issues).
