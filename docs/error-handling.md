# Error Handling

The SDK provides three custom error classes so you can handle different failure scenarios precisely.

## Error Classes

### `SalesForceConfigError`

Thrown when the SDK is used with invalid or missing configuration.

**When it is thrown:**
- `SalesForceClient` constructor is called with a missing required field.
- A module method is called with a missing required argument (e.g. no asset ID).

**Properties:** `message`

```typescript
import { SalesForceConfigError } from '@designofadecade/salesforce-marketing-cloud';

try {
  const client = new SalesForceClient({ clientDomain: '' /* missing */ });
} catch (error) {
  if (error instanceof SalesForceConfigError) {
    console.error('Bad configuration:', error.message);
  }
}
```

---

### `SalesForceAuthError`

Thrown when OAuth authentication fails.

**When it is thrown:**
- The token endpoint returns a non-2xx response.
- The authentication network request itself fails.

**Properties:**

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error message |
| `statusCode` | `number` | HTTP status code from the auth server |

```typescript
import { SalesForceAuthError } from '@designofadecade/salesforce-marketing-cloud';

try {
  await client.api('/some/endpoint');
} catch (error) {
  if (error instanceof SalesForceAuthError) {
    console.error(`Auth failed [${error.statusCode}]:`, error.message);
    // Possible remediation: check credentials, rotate client secret
  }
}
```

---

### `SalesForceAPIError`

Thrown when a REST API request returns an error response or the network request fails.

**When it is thrown:**
- The API server returns a non-2xx HTTP status.
- The network request throws (e.g. DNS failure, timeout).

**Properties:**

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error message including status and body |
| `statusCode` | `number` | HTTP status code |
| `endpoint` | `string \| undefined` | The endpoint that was called |
| `method` | `string \| undefined` | The HTTP method that was used |

```typescript
import { SalesForceAPIError } from '@designofadecade/salesforce-marketing-cloud';

try {
  const result = await client.api('/asset/v1/content/assets/invalid-id');
} catch (error) {
  if (error instanceof SalesForceAPIError) {
    console.error('API error:', {
      status: error.statusCode,
      endpoint: error.endpoint,
      method: error.method,
      message: error.message,
    });

    if (error.statusCode === 404) {
      console.log('Asset not found');
    } else if (error.statusCode === 401) {
      console.log('Unauthorized — check permissions');
    } else if (error.statusCode >= 500) {
      console.log('Server error — retry later');
    }
  }
}
```

---

## Recommended Pattern

For production code, always catch errors and handle each type appropriately:

```typescript
import SalesForceClient, {
  SalesForceConfigError,
  SalesForceAuthError,
  SalesForceAPIError,
  Assets,
} from '@designofadecade/salesforce-marketing-cloud';

async function updateAsset(id: string, content: string): Promise<void> {
  try {
    const client = new SalesForceClient({
      clientDomain: process.env.SFMC_DOMAIN!,
      clientId: process.env.SFMC_CLIENT_ID!,
      clientSecret: process.env.SFMC_CLIENT_SECRET!,
      accountId: process.env.SFMC_ACCOUNT_ID!,
    });

    const assets = new Assets(client);
    await assets.update(id, { content });
    console.log(`Asset ${id} updated successfully`);

  } catch (error) {
    if (error instanceof SalesForceConfigError) {
      // Configuration issue — fail fast, do not retry
      throw new Error(`SDK misconfigured: ${error.message}`);

    } else if (error instanceof SalesForceAuthError) {
      // Auth issue — check credentials
      console.error(`Authentication failed [${error.statusCode}]: ${error.message}`);
      throw error;

    } else if (error instanceof SalesForceAPIError) {
      // API issue — log details and decide whether to retry
      console.error(`API call failed`, {
        status: error.statusCode,
        endpoint: error.endpoint,
        method: error.method,
      });

      if (error.statusCode >= 500) {
        // Transient server error — safe to retry
        throw error;
      }
      // Client error — do not retry
      throw error;
    }

    throw error;
  }
}
```

## Error Inheritance

All custom errors extend the native `Error` class, so they are compatible with any standard error-handling approach, including `instanceof` checks and stack traces.

```
Error
├── SalesForceConfigError
├── SalesForceAuthError
└── SalesForceAPIError
```
