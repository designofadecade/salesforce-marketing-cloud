# Configuration

## `SalesForceClientConfig`

All configuration is passed to the `SalesForceClient` constructor.

```typescript
interface SalesForceClientConfig {
  clientDomain: string;
  clientId: string;
  clientSecret: string;
  accountId: string;
  scope?: string;
}
```

### `clientDomain` *(required)*

The subdomain of your Marketing Cloud instance. Found in the Authentication Base URI of your installed package:

```
https://<clientDomain>.auth.marketingcloudapis.com/v2/token
```

Example: if your auth URL is `https://mc123abc.auth.marketingcloudapis.com/v2/token`, the `clientDomain` is `mc123abc`.

### `clientId` *(required)*

The OAuth **Client ID** from your installed package's API integration component.

### `clientSecret` *(required)*

The OAuth **Client Secret** from your installed package's API integration component.

> ⚠️ Never hard-code this value. Load it from an environment variable or a secrets manager.

### `accountId` *(required)*

Your Marketing Cloud **MID** (Member ID / Account ID). Found in the top-right account menu of Marketing Cloud.

### `scope` *(optional)*

A space-separated list of OAuth scopes to request. If omitted, the token inherits all scopes granted to the installed package.

The SDK provides static scope constants for convenience:

#### Available Scope Constants

| Constant | Scope Value | Description |
|---|---|---|
| `SCOPE_EMAIL_READ` | `email_read` | Read access to email |
| `SCOPE_EMAIL_WRITE` | `email_write` | Write access to email |
| `SCOPE_EMAIL_SEND` | `email_send` | Permission to send emails |
| `SCOPE_LIST_AND_SUBSCRIBERS_READ` | `list_and_subscribers_read` | Read access to lists/subscribers |
| `SCOPE_LIST_AND_SUBSCRIBERS_WRITE` | `list_and_subscribers_write` | Write access to lists/subscribers |
| `SCOPE_DATA_EXTENSIONS_READ` | `data_extensions_read` | Read access to data extensions |
| `SCOPE_DATA_EXTENSIONS_WRITE` | `data_extensions_write` | Write access to data extensions |
| `SCOPE_SAVED_CONTENT_READ` | `saved_content_read` | Read access to saved content |
| `SCOPE_SAVED_CONTENT_WRITE` | `saved_content_write` | Write access to saved content |
| `SCOPE_AUTOMATIONS_READ` | `automations_read` | Read access to automations |
| `SCOPE_AUTOMATIONS_WRITE` | `automations_write` | Write access to automations |
| `SCOPE_AUTOMATIONS_EXECUTE` | `automations_execute` | Execute automations |
| `SCOPE_JOURNEYS_READ` | `journeys_read` | Read access to journeys |
| `SCOPE_JOURNEYS_WRITE` | `journeys_write` | Write access to journeys |
| `SCOPE_JOURNEYS_EXECUTE` | `journeys_execute` | Execute/publish journeys |
| `SCOPE_TRACKING_EVENTS_READ` | `tracking_events_read` | Read access to tracking events |
| `SCOPE_WEBHOOKS_READ` | `webhooks_read` | Read access to webhooks |
| `SCOPE_WEBHOOKS_WRITE` | `webhooks_write` | Write access to webhooks |
| `SCOPE_DOCUMENTS_AND_IMAGES_READ` | `documents_and_images_read` | Read access to documents/images |
| `SCOPE_DOCUMENTS_AND_IMAGES_WRITE` | `documents_and_images_write` | Write access to documents/images |
| `SCOPE_OFFLINE` | `offline` | Offline access (refresh tokens) |

#### Using Scope Constants

**Single scope:**
```typescript
import SalesForceClient from '@designofadecade/salesforce-marketing-cloud';

const client = new SalesForceClient({
  clientDomain: 'your-domain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
  scope: SalesForceClient.SCOPE_EMAIL_READ
});
```

**Multiple scopes:**
```typescript
const client = new SalesForceClient({
  clientDomain: 'your-domain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
  scope: SalesForceClient.buildScope([
    SalesForceClient.SCOPE_EMAIL_READ,
    SalesForceClient.SCOPE_EMAIL_WRITE,
    SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE
  ])
});
```

**Manual scope string:**
```typescript
scope: 'email_read email_write data_extensions_read'
```

---

## Using Environment Variables

Store credentials as environment variables and never commit them to source control.

```typescript
import SalesForceClient from '@designofadecade/salesforce-marketing-cloud';

const client = new SalesForceClient({
  clientDomain: process.env.SFMC_DOMAIN!,
  clientId: process.env.SFMC_CLIENT_ID!,
  clientSecret: process.env.SFMC_CLIENT_SECRET!,
  accountId: process.env.SFMC_ACCOUNT_ID!,
  scope: process.env.SFMC_SCOPE,
});
```

Example `.env` file (do not commit):

```
SFMC_DOMAIN=mc123abc
SFMC_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
SFMC_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
SFMC_ACCOUNT_ID=1234567
SFMC_SCOPE=email data_extensions
```

---

## Token Management

The SDK manages the OAuth 2.0 token lifecycle automatically:

1. **First call** — authenticates using client credentials and caches the token.
2. **Subsequent calls** — reuses the cached token.
3. **Token expiry** — the token is automatically refreshed when it expires (with a 60-second safety buffer before the reported `expires_in` time).

You do not need to call any authentication method manually.
