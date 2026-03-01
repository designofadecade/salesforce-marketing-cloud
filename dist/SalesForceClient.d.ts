import type { SalesForceClientConfig, SoapClientInterface } from './types.js';
/**
 * Salesforce Marketing Cloud API Client
 *
 * Provides a unified interface for interacting with the Salesforce Marketing Cloud REST and SOAP APIs.
 * Handles OAuth authentication, token management, and provides methods for making authenticated API requests.
 *
 * @example
 * ```typescript
 * const client = new SalesForceClient({
 *   clientDomain: 'your-subdomain',
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   accountId: 'your-account-id',
 *   scope: SalesForceClient.SCOPE_EMAIL_READ
 * });
 *
 * // Make API calls
 * const data = await client.api('/path/to/endpoint', 'GET');
 * ```
 */
export default class SalesForceClient {
    #private;
    /** Read access to email functionality */
    static readonly SCOPE_EMAIL_READ = "email_read";
    /** Write access to email functionality */
    static readonly SCOPE_EMAIL_WRITE = "email_write";
    /** Permission to send emails */
    static readonly SCOPE_EMAIL_SEND = "email_send";
    /** Read access to SMS functionality */
    static readonly SCOPE_SMS_READ = "sms_read";
    /** Write access to SMS functionality */
    static readonly SCOPE_SMS_WRITE = "sms_write";
    /** Permission to send SMS messages */
    static readonly SCOPE_SMS_SEND = "sms_send";
    /** Read access to push notifications */
    static readonly SCOPE_PUSH_READ = "push_read";
    /** Write access to push notifications */
    static readonly SCOPE_PUSH_WRITE = "push_write";
    /** Permission to send push notifications */
    static readonly SCOPE_PUSH_SEND = "push_send";
    /** Read access to social media */
    static readonly SCOPE_SOCIAL_READ = "social_read";
    /** Write access to social media */
    static readonly SCOPE_SOCIAL_WRITE = "social_write";
    /** Permission to publish to social media */
    static readonly SCOPE_SOCIAL_PUBLISH = "social_publish";
    /** Read access to OTT (Over-The-Top) chat messaging */
    static readonly SCOPE_OTT_READ = "ott_read";
    /** Permission to send OTT messages */
    static readonly SCOPE_OTT_SEND = "ott_send";
    /** Read access to data extensions */
    static readonly SCOPE_DATA_EXTENSIONS_READ = "data_extensions_read";
    /** Write access to data extensions */
    static readonly SCOPE_DATA_EXTENSIONS_WRITE = "data_extensions_write";
    /** Read access to audiences */
    static readonly SCOPE_AUDIENCES_READ = "audiences_read";
    /** Write access to audiences */
    static readonly SCOPE_AUDIENCES_WRITE = "audiences_write";
    /** Read access to lists and subscribers */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_READ = "list_and_subscribers_read";
    /** Write access to lists and subscribers */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_WRITE = "list_and_subscribers_write";
    /** Read access to file locations */
    static readonly SCOPE_FILE_LOCATIONS_READ = "file_locations_read";
    /** Write access to file locations */
    static readonly SCOPE_FILE_LOCATIONS_WRITE = "file_locations_write";
    /** Read access to tracking events */
    static readonly SCOPE_TRACKING_EVENTS_READ = "tracking_events_read";
    /** Read access to documents and images */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_READ = "documents_and_images_read";
    /** Write access to documents and images */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_WRITE = "documents_and_images_write";
    /** Read access to saved content */
    static readonly SCOPE_SAVED_CONTENT_READ = "saved_content_read";
    /** Write access to saved content */
    static readonly SCOPE_SAVED_CONTENT_WRITE = "saved_content_write";
    /** Execute automations */
    static readonly SCOPE_AUTOMATIONS_EXECUTE = "automations_execute";
    /** Read access to automations */
    static readonly SCOPE_AUTOMATIONS_READ = "automations_read";
    /** Write access to automations */
    static readonly SCOPE_AUTOMATIONS_WRITE = "automations_write";
    /** Execute/publish journeys */
    static readonly SCOPE_JOURNEYS_EXECUTE = "journeys_execute";
    /** Read access to journeys */
    static readonly SCOPE_JOURNEYS_READ = "journeys_read";
    /** Write access to journeys */
    static readonly SCOPE_JOURNEYS_WRITE = "journeys_write";
    /** Read access to users */
    static readonly SCOPE_USERS_READ = "users_read";
    /** Write access to users */
    static readonly SCOPE_USERS_WRITE = "users_write";
    /** Read access to organizations */
    static readonly SCOPE_ORGANIZATIONS_READ = "organizations_read";
    /** Write access to organizations */
    static readonly SCOPE_ORGANIZATIONS_WRITE = "organizations_write";
    /** Write access to workflows */
    static readonly SCOPE_WORKFLOWS_WRITE = "workflows_write";
    /** Read access to webhooks */
    static readonly SCOPE_WEBHOOKS_READ = "webhooks_read";
    /** Write access to webhooks */
    static readonly SCOPE_WEBHOOKS_WRITE = "webhooks_write";
    /** Offline access (for refresh tokens) */
    static readonly SCOPE_OFFLINE = "offline";
    /**
     * Combines multiple scopes into a single space-separated string
     *
     * @param scopes - Array of scope strings to combine
     * @returns Space-separated scope string
     *
     * @example
     * ```typescript
     * const scope = SalesForceClient.buildScope([
     *   SalesForceClient.SCOPE_EMAIL_READ,
     *   SalesForceClient.SCOPE_DATA_EXTENSIONS_WRITE
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