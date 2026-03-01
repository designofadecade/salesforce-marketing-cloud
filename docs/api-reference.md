# API Reference

## Table of Contents

- [SalesForceClient](#salesforceclient)
- [Assets](#assets)
- [DataExtensions](#dataextensions)
- [AutomationStudio](#automationstudio)
- [Types](#types)

---

## SalesForceClient

The main client for authentication and raw REST/SOAP API access.

### Import

```typescript
import SalesForceClient from '@designofadecade/salesforce-marketing-cloud';
```

### Constructor

```typescript
new SalesForceClient(config: SalesForceClientConfig)
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `config.clientDomain` | `string` | ✅ | Marketing Cloud subdomain |
| `config.clientId` | `string` | ✅ | OAuth client ID |
| `config.clientSecret` | `string` | ✅ | OAuth client secret |
| `config.accountId` | `string` | ✅ | Marketing Cloud account ID |
| `config.scope` | `string` | ❌ | OAuth scope (default: `''`) |

**Throws:** `SalesForceConfigError` if any required parameter is missing.

### Methods

#### `api<T>(endpoint, method?, body?): Promise<T>`

Makes an authenticated REST API call. Authentication and token refresh are handled automatically.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | — | API endpoint path, e.g. `/asset/v1/content/assets` |
| `method` | `string` | `'GET'` | HTTP method |
| `body` | `Record<string, any> \| Record<string, any>[] \| null` | `null` | Request body |

```typescript
// GET
const result = await client.api('/asset/v1/content/assets');

// POST
const created = await client.api('/asset/v1/content/assets', 'POST', {
  name: 'New Asset',
  assetType: { id: 205 },
});

// PATCH
const updated = await client.api('/asset/v1/content/assets/123', 'PATCH', {
  name: 'Updated Name',
});
```

**Throws:** `SalesForceAuthError` | `SalesForceAPIError`

#### `endpoints(): Promise<any>`

Returns the available REST API endpoints for the authenticated instance.

```typescript
const endpoints = await client.endpoints();
```

#### `soapClient(): Promise<SoapClientInterface>`

Creates and returns a configured SOAP client. The SOAP auth header is set automatically.

```typescript
const soap = await client.soapClient();
const result = await soap.RetrieveAsync({ /* ... */ });
```

**Throws:** `SalesForceAuthError` | `Error`

---

## Assets

Manages Marketing Cloud Content Builder assets.

### Import

```typescript
import { Assets } from '@designofadecade/salesforce-marketing-cloud';
```

### Constructor

```typescript
new Assets(salesForceClient: SalesForceClient)
```

### Methods

#### `list(): Promise<AssetsListResponse>`

Returns all assets with `assetType.id === 205` (HTML content blocks).

```typescript
const { count, items } = await assets.list();
console.log(`Found ${count} assets`);
items.forEach(a => console.log(a.id, a.name));
```

#### `update(id, data): Promise<AssetResponse>`

Updates an existing asset.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Asset ID |
| `data` | `Record<string, any>` | Fields to update |

```typescript
const updated = await assets.update('12345', {
  name: 'Updated Name',
  content: '<html>New content</html>',
});
```

**Throws:** `SalesForceConfigError` if `id` or `data` is missing.

---

## DataExtensions

Manages Marketing Cloud Data Extension records.

### Import

```typescript
import { DataExtensions } from '@designofadecade/salesforce-marketing-cloud';
```

### Constructor

```typescript
new DataExtensions(salesForceClient: SalesForceClient)
```

### Methods

#### `get(externalKey): Promise<DataExtensionResponse>`

Retrieves the first page of rows from a data extension.

```typescript
const response = await dataExtensions.get('my-de-key');
console.log(response.items);
```

#### `getData(externalKey, primaryKey, primaryKeyValue): Promise<Record<string, any> | undefined>`

Returns the `values` of the first record matching the given primary key filter.

```typescript
const record = await dataExtensions.getData('my-de-key', 'Email', 'user@example.com');
console.log(record?.FirstName);
```

Returns `undefined` when no matching record is found.

#### `insert(externalKey, items): Promise<any>`

Inserts one or more records (synchronous).

```typescript
await dataExtensions.insert('my-de-key', [
  { keys: { Email: 'a@example.com' }, values: { FirstName: 'Alice' } },
  { keys: { Email: 'b@example.com' }, values: { FirstName: 'Bob' } },
]);
```

#### `update(externalKey, primaryKey, primaryKeyValue, values): Promise<any>`

Updates a single record identified by the primary key.

```typescript
await dataExtensions.update('my-de-key', 'Email', 'a@example.com', {
  FirstName: 'Alicia',
  LastUpdated: new Date().toISOString(),
});
```

#### `delete(externalKey, primaryKey, primaryKeyValue): Promise<any>`

Deletes a single record.

```typescript
await dataExtensions.delete('my-de-key', 'Email', 'old@example.com');
```

#### `getAllRows(externalKey): Promise<DataExtensionRow[]>`

Fetches **all** rows from a data extension, following pagination automatically (page size 500).

```typescript
const allRows = await dataExtensions.getAllRows('my-de-key');
console.log(`Total: ${allRows.length}`);
```

#### `insertAsync(externalKey, items): Promise<any>`

Inserts records using the async data events API (suitable for large batches).

```typescript
const { requestId } = await dataExtensions.insertAsync('my-de-key', [
  { Email: 'a@example.com', FirstName: 'Alice' },
]);
```

#### `updateAsync(externalKey, items): Promise<any>`

Updates records using the async data events API.

```typescript
await dataExtensions.updateAsync('my-de-key', [
  { Email: 'a@example.com', Status: 'active' },
]);
```

#### `clearRecords(externalKey, primaryKey?): Promise<void>`

Deletes **all** records from a data extension by first fetching all rows then deleting each one.

```typescript
await dataExtensions.clearRecords('temp-de', 'id');
```

> ⚠️ This method issues one DELETE request per record. Use with care on large data extensions.

#### `static jsonToValues(data, attribute, count?, size?): Record<string, string>`

Splits a JSON-serialised object into multiple string fields for storage in a data extension.

| Parameter | Default | Description |
|---|---|---|
| `attribute` | — | Base field name (e.g. `'json'`) |
| `count` | `4` | Number of output fields |
| `size` | `3900` | Max characters per field |

```typescript
const chunked = DataExtensions.jsonToValues({ large: 'payload' }, 'json', 4, 3900);
// { json1: '...', json2: '...', json3: '', json4: '' }
```

---

## AutomationStudio

Manages Marketing Cloud Automation Studio automations via both REST and SOAP APIs.

### Import

```typescript
import { AutomationStudio } from '@designofadecade/salesforce-marketing-cloud';
```

### Constructor

```typescript
new AutomationStudio(salesForceClient: SalesForceClient)
```

### Static Timezone Constants

| Constant | Value | Timezone |
|---|---|---|
| `AutomationStudio.TIME_ZONE_AMERICA_TORONTO` | `76` | America/Toronto (ET) |
| `AutomationStudio.TIME_ZONE_AMERICA_CHICAGO` | `27` | America/Chicago (CT) |

### Methods

#### `getAll(): Promise<AutomationsListResponse>`

Returns all automations in the account.

```typescript
const { count, items } = await automation.getAll();
```

#### `get(externalKey): Promise<AutomationResponse>`

Returns a single automation by its external key.

```typescript
const auto = await automation.get('my-automation-key');
```

#### `create(options?): Promise<AutomationResponse>`

Creates a new scheduled automation.

| Option | Type | Description |
|---|---|---|
| `name` | `string` | Automation name |
| `description` | `string` | Description |
| `steps` | `AutomationStep[]` | Steps and activities |
| `startDate` | `string` | ISO 8601 start date |
| `timeZoneId` | `number` | Timezone constant |

```typescript
const newAuto = await automation.create({
  name: 'Daily Report',
  description: 'Sends daily report email',
  startDate: '2026-04-01T08:00:00',
  timeZoneId: AutomationStudio.TIME_ZONE_AMERICA_TORONTO,
  steps: [{
    stepNumber: 0,
    activities: [{
      name: 'Send Report',
      objectTypeId: 42,
      displayOrder: 1,
      activityObjectId: 'your-activity-uuid',
    }],
  }],
});
```

#### `activate(automationId, date, timeZoneId?): Promise<boolean>`

Activates (schedules) an automation to run at the specified date/time. Uses the SOAP API.

Returns `true` on success, `false` if the server reports an error status.

```typescript
const ok = await automation.activate(
  'automation-uuid',
  '2026-04-01T08:00:00',
  AutomationStudio.TIME_ZONE_AMERICA_TORONTO,
);
```

#### `pause(automationId): Promise<boolean>`

Pauses a running scheduled automation via the SOAP API.

```typescript
const ok = await automation.pause('automation-uuid');
```

#### `run(automationId): Promise<any>`

Triggers an automation to run immediately (run once).

```typescript
const result = await automation.run('automation-uuid');
```

#### `endpoints(): Promise<any>`

Returns the available Automation Studio REST endpoints.

---

## Types

All public types are exported from the package root.

```typescript
import type {
  SalesForceClientConfig,
  AuthenticationResponse,
  SoapClientInterface,
  ScheduleOptions,
  ScheduleResponse,
  DataExtensionRow,
  DataExtensionResponse,
  AssetResponse,
  AssetsListResponse,
  AutomationResponse,
  AutomationsListResponse,
  AutomationActivity,
  AutomationStep,
  CreateAutomationOptions,
} from '@designofadecade/salesforce-marketing-cloud';
```

See [`src/types.ts`](../src/types.ts) for the full type definitions.
