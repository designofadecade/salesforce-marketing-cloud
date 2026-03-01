# Getting Started

## Requirements

- Node.js >= 24.0.0
- ES Modules support (`"type": "module"` in your `package.json`)
- A Salesforce Marketing Cloud account with API credentials

## Installation

Install the package from npm:

```bash
npm install @designofadecade/salesforce-marketing-cloud
```

## Obtaining API Credentials

1. Log in to Salesforce Marketing Cloud.
2. Navigate to **Setup → Apps → Installed Packages**.
3. Create a new installed package and add an **API Integration** component.
4. Choose **Server-to-Server** as the integration type.
5. Select the required OAuth scopes (e.g., `email`, `list_and_subscribers`, `data_extensions`).
6. Save the package and note the **Client ID**, **Client Secret**, and **Authentication Base URI** subdomain.

The **Client Domain** is the subdomain portion of your Authentication Base URI, e.g.:

```
https://XXXXXXXXXXXXXXXX.auth.marketingcloudapis.com
           ^^^^^^^^^^^^^^^^
           this is your clientDomain
```

## First API Call

```typescript
import SalesForceClient from '@designofadecade/salesforce-marketing-cloud';

const client = new SalesForceClient({
  clientDomain: 'your-subdomain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
});

// List available API endpoints
const endpoints = await client.endpoints();
console.log(endpoints);
```

## Using Modules

The SDK ships three specialised modules that wrap common Marketing Cloud APIs:

```typescript
import SalesForceClient, {
  Assets,
  DataExtensions,
  AutomationStudio,
} from '@designofadecade/salesforce-marketing-cloud';

const client = new SalesForceClient({ /* config */ });

// Content Assets
const assets = new Assets(client);
const assetList = await assets.list();

// Data Extensions
const dataExtensions = new DataExtensions(client);
const rows = await dataExtensions.getAllRows('my-data-extension-key');

// Automation Studio
const automation = new AutomationStudio(client);
const automations = await automation.getAll();
```

## Token Management

Authentication tokens are obtained automatically on the first API call and cached for re-use. Tokens are refreshed automatically when they expire (with a 60-second safety buffer), so you do not need to manage token lifecycle yourself.

## Next Steps

- [API Reference](./api-reference.md) — detailed method documentation
- [Error Handling](./error-handling.md) — how to handle errors gracefully
- [Configuration](./configuration.md) — full configuration reference
