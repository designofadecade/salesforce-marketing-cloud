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
 *   scope: 'your-scope'
 * });
 *
 * // Make API calls
 * const data = await client.api('/path/to/endpoint', 'GET');
 * ```
 */
export default class SalesForceClient {
    #private;
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
    api<T = any>(endpoint: string, method?: string, body?: Record<string, any> | null): Promise<T>;
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