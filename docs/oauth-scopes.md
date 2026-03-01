# OAuth Scopes Reference

This guide provides a comprehensive list of all available OAuth scopes for the Salesforce Marketing Cloud API.

## Overview

OAuth scopes control what actions your application can perform in Marketing Cloud. If no scope is specified during authentication, your application will inherit all permissions granted to the installed package.

## Using Scope Constants

The SDK provides convenient constants for all scopes:

```typescript
import SalesForceClient from '@designofadecade/salesforce-marketing-cloud';

// Single scope
const client = new SalesForceClient({
  clientDomain: 'your-domain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
  scope: SalesForceClient.SCOPE_EMAIL_READ
});

// Multiple scopes
const client = new SalesForceClient({
  clientDomain: 'your-domain',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accountId: 'your-account-id',
  scope: SalesForceClient.buildScope([
    SalesForceClient.SCOPE_EMAIL_READ,
    SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE,
    SalesForceClient.SCOPE_AUTOMATIONS_EXECUTE
  ])
});
```

---

## Available Scopes

### 1. Messaging & Channel Scopes

Control the ability to send and manage communications across different channels.

#### Email

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_EMAIL_READ` | `email_read` | Read email sends, definitions, and templates | View email performance, retrieve email content |
| `SCOPE_EMAIL_WRITE` | `email_write` | Create and update email definitions | Create email templates, update email settings |
| `SCOPE_EMAIL_SEND` | `email_send` | Trigger email sends | Send transactional emails, trigger campaigns |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_EMAIL_READ,
  SalesForceClient.SCOPE_EMAIL_SEND
])
```

#### SMS

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_SMS_READ` | `sms_read` | Read SMS messages and definitions | View SMS sends, retrieve SMS content |
| `SCOPE_SMS_WRITE` | `sms_write` | Create and update SMS definitions | Create SMS templates, manage SMS settings |
| `SCOPE_SMS_SEND` | `sms_send` | Trigger SMS sends | Send transactional SMS, trigger SMS campaigns |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_SMS_READ,
  SalesForceClient.SCOPE_SMS_SEND
])
```

#### Push Notifications

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_PUSH_READ` | `push_read` | Read push notification sends | View push notification performance |
| `SCOPE_PUSH_WRITE` | `push_write` | Create and update push definitions | Create push templates, manage push settings |
| `SCOPE_PUSH_SEND` | `push_send` | Trigger push sends | Send mobile push notifications |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_PUSH_SEND
```

#### Social Media

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_SOCIAL_READ` | `social_read` | Read social posts and interactions | Monitor social media engagement |
| `SCOPE_SOCIAL_WRITE` | `social_write` | Create and update social posts | Draft social media content |
| `SCOPE_SOCIAL_PUBLISH` | `social_publish` | Publish to social media platforms | Post to connected social accounts |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_SOCIAL_READ,
  SalesForceClient.SCOPE_SOCIAL_PUBLISH
])
```

#### OTT (Over-The-Top) Messaging

For chat applications like WhatsApp, LINE, etc.

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_OTT_READ` | `ott_read` | Read OTT messages | View chat message history |
| `SCOPE_OTT_SEND` | `ott_send` | Send OTT messages | Send chat messages via WhatsApp, LINE, etc. |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_OTT_SEND
```

---

### 2. Data & Content Scopes

The most common scopes for server-to-server data syncing and content management.

#### Data Extensions

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_DATA_EXTENSIONS_READ` | `data_extensions_read` | Read data from data extensions | Export data, sync to external systems |
| `SCOPE_DATA_EXTENSIONS_WRITE` | `data_extensions_write` | Write data to data extensions | Import data, update customer records |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE
])
```

#### Contacts & Audiences

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_AUDIENCES_READ` | `audiences_read` | Read audience definitions and memberships | Retrieve segment information |
| `SCOPE_AUDIENCES_WRITE` | `audiences_write` | Create and update audiences | Manage customer segments |
| `SCOPE_LIST_AND_SUBSCRIBERS_READ` | `list_and_subscribers_read` | Read lists and subscriber data | Export subscriber lists |
| `SCOPE_LIST_AND_SUBSCRIBERS_WRITE` | `list_and_subscribers_write` | Manage lists and subscriber data | Update subscriber information, manage lists |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_LIST_AND_SUBSCRIBERS_READ,
  SalesForceClient.SCOPE_LIST_AND_SUBSCRIBERS_WRITE
])
```

#### File Management

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_FILE_LOCATIONS_READ` | `file_locations_read` | Read files and file locations | Download files, list file locations |
| `SCOPE_FILE_LOCATIONS_WRITE` | `file_locations_write` | Upload and manage files | Upload images, manage file storage |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_FILE_LOCATIONS_WRITE
```

#### Tracking & Analytics

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_TRACKING_EVENTS_READ` | `tracking_events_read` | Read tracking data (opens, clicks, bounces) | Generate reports, analyze campaign performance |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_TRACKING_EVENTS_READ
```

#### Assets & Content

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_DOCUMENTS_AND_IMAGES_READ` | `documents_and_images_read` | Read documents and images from Content Builder | Retrieve assets, list content |
| `SCOPE_DOCUMENTS_AND_IMAGES_WRITE` | `documents_and_images_write` | Upload and manage documents and images | Upload new assets, update content |
| `SCOPE_SAVED_CONTENT_READ` | `saved_content_read` | Read saved content blocks | Retrieve content blocks |
| `SCOPE_SAVED_CONTENT_WRITE` | `saved_content_write` | Create and update saved content | Manage reusable content blocks |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_DOCUMENTS_AND_IMAGES_READ,
  SalesForceClient.SCOPE_SAVED_CONTENT_WRITE
])
```

---

### 3. Automation & Journey Scopes

Used for triggering workflows and marketing automation logic.

#### Automations

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_AUTOMATIONS_EXECUTE` | `automations_execute` | Start, stop, and run automations | Trigger data imports, run scheduled tasks |
| `SCOPE_AUTOMATIONS_READ` | `automations_read` | Read automation definitions and status | Monitor automation health |
| `SCOPE_AUTOMATIONS_WRITE` | `automations_write` | Create and update automations | Build automation workflows |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_AUTOMATIONS_READ,
  SalesForceClient.SCOPE_AUTOMATIONS_EXECUTE
])
```

#### Journeys

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_JOURNEYS_EXECUTE` | `journeys_execute` | Activate and stop journeys | Publish journeys, control journey state |
| `SCOPE_JOURNEYS_READ` | `journeys_read` | Read journey definitions and analytics | Monitor journey performance |
| `SCOPE_JOURNEYS_WRITE` | `journeys_write` | Create and update journeys | Build customer journeys |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_JOURNEYS_READ,
  SalesForceClient.SCOPE_JOURNEYS_WRITE,
  SalesForceClient.SCOPE_JOURNEYS_EXECUTE
])
```

---

### 4. Administrative & Provisioning Scopes

High-level scopes for managing the Marketing Cloud account itself.

#### User Management

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_USERS_READ` | `users_read` | Read user accounts and permissions | Audit user access |
| `SCOPE_USERS_WRITE` | `users_write` | Create and update user accounts | Manage team members, update permissions |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_USERS_READ,
  SalesForceClient.SCOPE_USERS_WRITE
])
```

#### Organization Management

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_ORGANIZATIONS_READ` | `organizations_read` | Read organization structure and business units | View account hierarchy |
| `SCOPE_ORGANIZATIONS_WRITE` | `organizations_write` | Manage organization structure | Create business units, modify org structure |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_ORGANIZATIONS_READ
```

#### Workflows

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_WORKFLOWS_WRITE` | `workflows_write` | Create and manage workflows | Build complex workflow logic |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_WORKFLOWS_WRITE
```

---

### 5. Additional Scopes

#### Webhooks

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_WEBHOOKS_READ` | `webhooks_read` | Read webhook configurations | Audit webhook setup |
| `SCOPE_WEBHOOKS_WRITE` | `webhooks_write` | Create and manage webhooks | Configure event notifications |

**Example:**
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_WEBHOOKS_READ,
  SalesForceClient.SCOPE_WEBHOOKS_WRITE
])
```

#### Offline Access

| Constant | Scope | Description | Use Case |
|----------|-------|-------------|----------|
| `SCOPE_OFFLINE` | `offline` | Enable refresh tokens for offline access | Long-running background processes |

**Example:**
```typescript
scope: SalesForceClient.SCOPE_OFFLINE
```

---

## Common Scope Combinations

### Read-Only Analytics Application
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_EMAIL_READ,
  SalesForceClient.SCOPE_TRACKING_EVENTS_READ,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ
])
```

### Data Synchronization Service
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE,
  SalesForceClient.SCOPE_LIST_AND_SUBSCRIBERS_WRITE
])
```

### Transactional Email Service
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_EMAIL_READ,
  SalesForceClient.SCOPE_EMAIL_SEND,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ
])
```

### Marketing Automation Platform
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_EMAIL_READ,
  SalesForceClient.SCOPE_EMAIL_WRITE,
  SalesForceClient.SCOPE_EMAIL_SEND,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE,
  SalesForceClient.SCOPE_AUTOMATIONS_EXECUTE,
  SalesForceClient.SCOPE_JOURNEYS_READ
])
```

### Multi-Channel Campaign Manager
```typescript
scope: SalesForceClient.buildScope([
  SalesForceClient.SCOPE_EMAIL_SEND,
  SalesForceClient.SCOPE_SMS_SEND,
  SalesForceClient.SCOPE_PUSH_SEND,
  SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
  SalesForceClient.SCOPE_TRACKING_EVENTS_READ
])
```

---

## Best Practices

### 1. Principle of Least Privilege
Only request the scopes your application actually needs. This improves security and makes it easier to audit API usage.

❌ **Bad:**
```typescript
// No scope specified - inherits ALL permissions
const client = new SalesForceClient({ ... });
```

✅ **Good:**
```typescript
// Only request what you need
const client = new SalesForceClient({
  ...config,
  scope: SalesForceClient.buildScope([
    SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
    SalesForceClient.SCOPE_EMAIL_SEND
  ])
});
```

### 2. Separate Read and Write Operations
Use different API clients or tokens for read vs write operations when possible.

```typescript
// Read-only client for reporting
const analyticsClient = new SalesForceClient({
  ...config,
  scope: SalesForceClient.buildScope([
    SalesForceClient.SCOPE_TRACKING_EVENTS_READ,
    SalesForceClient.SCOPE_DATA_EXTENSIONS_READ
  ])
});

// Write client for data operations
const dataClient = new SalesForceClient({
  ...config,
  scope: SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE
});
```

### 3. Document Required Scopes
Clearly document which scopes your application requires and why.

```typescript
/**
 * Customer Data Sync Service
 * 
 * Required scopes:
 * - data_extensions_read: Read customer data from DE
 * - data_extensions_write: Update customer records
 * - list_and_subscribers_write: Manage subscriber lists
 */
const client = new SalesForceClient({
  ...config,
  scope: SalesForceClient.buildScope([
    SalesForceClient.SCOPE_DATA_EXTENSIONS_READ,
    SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE,
    SalesForceClient.SCOPE_LIST_AND_SUBSCRIBERS_WRITE
  ])
});
```

### 4. Environment-Specific Scopes
Use different scopes for development, staging, and production.

```typescript
const scopes = process.env.NODE_ENV === 'production'
  ? [
      SalesForceClient.SCOPE_EMAIL_SEND,
      SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE
    ]
  : [
      SalesForceClient.SCOPE_EMAIL_READ,  // Read-only in dev
      SalesForceClient.SCOPE_DATA_EXTENSIONS_READ
    ];

const client = new SalesForceClient({
  ...config,
  scope: SalesForceClient.buildScope(scopes)
});
```

---

## Troubleshooting

### "Insufficient Privileges" Error
If you receive this error, verify that:
1. The scope is included in your authentication request
2. The installed package has been granted this permission in Marketing Cloud
3. The scope name is spelled correctly

### Scope Not Available
Some scopes may require:
- Specific Marketing Cloud editions or licenses
- Additional feature enablement in your account
- Enterprise-level access

Contact Salesforce Support if a documented scope is not available in your instance.

---

## Related Resources

- [Configuration Guide](./configuration.md)
- [Getting Started](./getting-started.md)
- [Error Handling](./error-handling.md)
- [Salesforce Marketing Cloud OAuth Documentation](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/access-token-s2s.html)
