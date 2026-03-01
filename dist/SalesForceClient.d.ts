import type { SalesForceClientConfig, SoapClientInterface } from './types.js';
/**
 * Salesforce Marketing Cloud API Client
 *
 * Provides a unified interface for interacting with the Salesforce Marketing Cloud REST and SOAP APIs.
 * Handles OAuth authentication, token management, and provides methods for making authenticated API requests.
 *
 * @example
 * ```typescript
 * import SalesForceClient, { Scopes } from '@designofadecade/salesforce-marketing-cloud';
 *
 * const client = new SalesForceClient({
 *   clientDomain: 'your-subdomain',
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   accountId: 'your-account-id',
 *   scope: Scopes.buildScope([
 *     Scopes.EMAIL_READ,
 *     Scopes.DATA_EXTENSIONS_WRITE
 *   ])
 * });
 *
 * // Make API calls
 * const data = await client.api('/path/to/endpoint', 'GET');
 * ```
 */
export default class SalesForceClient {
    #private;
    /** @deprecated Use Scopes.EMAIL_READ instead */
    static readonly SCOPE_EMAIL_READ = "email_read";
    /** @deprecated Use Scopes.EMAIL_WRITE instead */
    static readonly SCOPE_EMAIL_WRITE = "email_write";
    /** @deprecated Use Scopes.EMAIL_SEND instead */
    static readonly SCOPE_EMAIL_SEND = "email_send";
    /** @deprecated Use Scopes.SMS_READ instead */
    static readonly SCOPE_SMS_READ = "sms_read";
    /** @deprecated Use Scopes.SMS_WRITE instead */
    static readonly SCOPE_SMS_WRITE = "sms_write";
    /** @deprecated Use Scopes.SMS_SEND instead */
    static readonly SCOPE_SMS_SEND = "sms_send";
    /** @deprecated Use Scopes.PUSH_READ instead */
    static readonly SCOPE_PUSH_READ = "push_read";
    /** @deprecated Use Scopes.PUSH_WRITE instead */
    static readonly SCOPE_PUSH_WRITE = "push_write";
    /** @deprecated Use Scopes.PUSH_SEND instead */
    static readonly SCOPE_PUSH_SEND = "push_send";
    /** @deprecated Use Scopes.SOCIAL_READ instead */
    static readonly SCOPE_SOCIAL_READ = "social_read";
    /** @deprecated Use Scopes.SOCIAL_WRITE instead */
    static readonly SCOPE_SOCIAL_WRITE = "social_write";
    /** @deprecated Use Scopes.SOCIAL_PUBLISH instead */
    static readonly SCOPE_SOCIAL_PUBLISH = "social_publish";
    /** @deprecated Use Scopes.OTT_READ instead */
    static readonly SCOPE_OTT_READ = "ott_read";
    /** @deprecated Use Scopes.OTT_SEND instead */
    static readonly SCOPE_OTT_SEND = "ott_send";
    /** @deprecated Use Scopes.DATA_EXTENSIONS_READ instead */
    static readonly SCOPE_DATA_EXTENSIONS_READ = "data_extensions_read";
    /** @deprecated Use Scopes.DATA_EXTENSIONS_WRITE instead */
    static readonly SCOPE_DATA_EXTENSIONS_WRITE = "data_extensions_write";
    /** @deprecated Use Scopes.AUDIENCES_READ instead */
    static readonly SCOPE_AUDIENCES_READ = "audiences_read";
    /** @deprecated Use Scopes.AUDIENCES_WRITE instead */
    static readonly SCOPE_AUDIENCES_WRITE = "audiences_write";
    /** @deprecated Use Scopes.LIST_AND_SUBSCRIBERS_READ instead */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_READ = "list_and_subscribers_read";
    /** @deprecated Use Scopes.LIST_AND_SUBSCRIBERS_WRITE instead */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_WRITE = "list_and_subscribers_write";
    /** @deprecated Use Scopes.FILE_LOCATIONS_READ instead */
    static readonly SCOPE_FILE_LOCATIONS_READ = "file_locations_read";
    /** @deprecated Use Scopes.FILE_LOCATIONS_WRITE instead */
    static readonly SCOPE_FILE_LOCATIONS_WRITE = "file_locations_write";
    /** @deprecated Use Scopes.TRACKING_EVENTS_READ instead */
    static readonly SCOPE_TRACKING_EVENTS_READ = "tracking_events_read";
    /** @deprecated Use Scopes.DOCUMENTS_AND_IMAGES_READ instead */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_READ = "documents_and_images_read";
    /** @deprecated Use Scopes.DOCUMENTS_AND_IMAGES_WRITE instead */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_WRITE = "documents_and_images_write";
    /** @deprecated Use Scopes.SAVED_CONTENT_READ instead */
    static readonly SCOPE_SAVED_CONTENT_READ = "saved_content_read";
    /** @deprecated Use Scopes.SAVED_CONTENT_WRITE instead */
    static readonly SCOPE_SAVED_CONTENT_WRITE = "saved_content_write";
    /** @deprecated Use Scopes.AUTOMATIONS_EXECUTE instead */
    static readonly SCOPE_AUTOMATIONS_EXECUTE = "automations_execute";
    /** @deprecated Use Scopes.AUTOMATIONS_READ instead */
    static readonly SCOPE_AUTOMATIONS_READ = "automations_read";
    /** @deprecated Use Scopes.AUTOMATIONS_WRITE instead */
    static readonly SCOPE_AUTOMATIONS_WRITE = "automations_write";
    /** @deprecated Use Scopes.JOURNEYS_EXECUTE instead */
    static readonly SCOPE_JOURNEYS_EXECUTE = "journeys_execute";
    /** @deprecated Use Scopes.JOURNEYS_READ instead */
    static readonly SCOPE_JOURNEYS_READ = "journeys_read";
    /** @deprecated Use Scopes.JOURNEYS_WRITE instead */
    static readonly SCOPE_JOURNEYS_WRITE = "journeys_write";
    /** @deprecated Use Scopes.USERS_READ instead */
    static readonly SCOPE_USERS_READ = "users_read";
    /** @deprecated Use Scopes.USERS_WRITE instead */
    static readonly SCOPE_USERS_WRITE = "users_write";
    /** @deprecated Use Scopes.ORGANIZATIONS_READ instead */
    static readonly SCOPE_ORGANIZATIONS_READ = "organizations_read";
    /** @deprecated Use Scopes.ORGANIZATIONS_WRITE instead */
    static readonly SCOPE_ORGANIZATIONS_WRITE = "organizations_write";
    /** @deprecated Use Scopes.WORKFLOWS_WRITE instead */
    static readonly SCOPE_WORKFLOWS_WRITE = "workflows_write";
    /** @deprecated Use Scopes.WEBHOOKS_READ instead */
    static readonly SCOPE_WEBHOOKS_READ = "webhooks_read";
    /** @deprecated Use Scopes.WEBHOOKS_WRITE instead */
    static readonly SCOPE_WEBHOOKS_WRITE = "webhooks_write";
    /** @deprecated Use Scopes.OFFLINE instead */
    static readonly SCOPE_OFFLINE = "offline";
    /**
     * Combines multiple scopes into a single space-separated string
     *
     * @deprecated Use Scopes.buildScope() instead
     * @param scopes - Array of scope strings to combine
     * @returns Space-separated scope string
     *
     * @example
     * ```typescript
     * // Deprecated
     * const scope = SalesForceClient.buildScope([...]);
     *
     * // Use instead:
     * import { Scopes } from '@designofadecade/salesforce-marketing-cloud';
     * const scope = Scopes.buildScope([
     *   Scopes.EMAIL_READ,
     *   Scopes.DATA_EXTENSIONS_WRITE
     * ]);
     * ```
     */
    static buildScope(scopes: string[]): string;
    /**
     * Creates a new Salesforce Marketing Cloud client instance
     *
     * @param config - Configuration options for the client
     * @throws {SalesForceConfigError} If required configuration parameters are missing
     */
    constructor(config: SalesForceClientConfig);
    /**
     * Makes an authenticated API request to the Salesforce REST endpoint
     *
     * @param endpoint - The API endpoint to call (relative to the Salesforce instance URL)
     * @param method - The HTTP method to use for the request (default: 'GET')
     * @param body - The request payload to send as JSON, if applicable
     * @returns The parsed JSON response from the API
     * @throws {SalesForceAPIError} If the API request fails
     * @throws {SalesForceAuthError} If authentication fails
     *
     * @example
     * ```typescript
     * const result = await client.api('/asset/v1/content/assets', 'GET');
     * const created = await client.api('/asset/v1/content/assets', 'POST', { name: 'New Asset' });
     * ```
     */
    api<T = any>(endpoint: string, method?: string, body?: Record<string, any> | Record<string, any>[] | null): Promise<T>;
    /**
     * Retrieves available API endpoints for the authenticated instance
     *
     * @returns A promise that resolves to the endpoints configuration
     * @throws {SalesForceAPIError} If the request fails
     *
     * @example
     * ```typescript
     * const endpoints = await client.endpoints();
     * console.log(endpoints);
     * ```
     */
    endpoints(): Promise<any>;
    /**
     * Creates and configures a SOAP client for interacting with the Marketing Cloud SOAP API
     *
     * @returns A promise that resolves to a configured SOAP client
     * @throws {SalesForceAuthError} If authentication fails
     * @throws {Error} If SOAP client creation fails
     *
     * @example
     * ```typescript
     * const soapClient = await client.soapClient();
     * const result = await soapClient.RetrieveAsync({ ... });
     * ```
     */
    soapClient(): Promise<SoapClientInterface>;
}
//# sourceMappingURL=SalesForceClient.d.ts.map