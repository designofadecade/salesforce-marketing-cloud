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

Common scopes:

| Scope | Description |
|---|---|
| `email` | Send and manage email messages |
| `list_and_subscribers` | Manage subscriber lists |
| `data_extensions` | Read/write data extensions |
| `automations` | Manage automations |
| `assets` | Manage content assets |

Example: `'email list_and_subscribers data_extensions'`

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
