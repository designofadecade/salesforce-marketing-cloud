import Soap from 'soap';
import { SalesForceAPIError, SalesForceAuthError, SalesForceConfigError, } from './errors.js';
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
    #clientDomain;
    #clientId;
    #clientSecret;
    #accountId;
    #scope;
    #authentication;
    #tokenExpiresAt;
    /**
     * Creates a new Salesforce Marketing Cloud client instance
     *
     * @param config - Configuration options for the client
     * @throws {SalesForceConfigError} If required configuration parameters are missing
     */
    constructor(config) {
        if (!config) {
            throw new SalesForceConfigError('Configuration object is required');
        }
        if (!config.clientDomain) {
            throw new SalesForceConfigError('clientDomain is required');
        }
        if (!config.clientId) {
            throw new SalesForceConfigError('clientId is required');
        }
        if (!config.clientSecret) {
            throw new SalesForceConfigError('clientSecret is required');
        }
        if (!config.accountId) {
            throw new SalesForceConfigError('accountId is required');
        }
        this.#clientDomain = config.clientDomain;
        this.#clientId = config.clientId;
        this.#clientSecret = config.clientSecret;
        this.#accountId = config.accountId;
        this.#scope = config.scope || '';
    }
    /**
     * Checks whether the current authentication token has expired
     *
     * @private
     * @returns True if the token is expired or expiry time is unknown
     */
    #isTokenExpired() {
        if (!this.#tokenExpiresAt) {
            return true;
        }
        return Date.now() >= this.#tokenExpiresAt;
    }
    /**
     * Authenticates with the Marketing Cloud API using OAuth 2.0 client credentials flow
     *
     * @private
     * @throws {SalesForceAuthError} If authentication fails
     */
    async #authenticate() {
        const authUrl = `https://${this.#clientDomain}.auth.marketingcloudapis.com/v2/token`;
        try {
            const res = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    client_id: this.#clientId,
                    client_secret: this.#clientSecret,
                    scope: this.#scope,
                    account_id: this.#accountId,
                }),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new SalesForceAuthError(`Failed to authenticate: ${res.status} ${errorText}`, res.status);
            }
            const data = (await res.json());
            this.#authentication = data;
            // Store expiry time with a 60-second buffer to avoid using near-expired tokens
            this.#tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
        }
        catch (error) {
            if (error instanceof SalesForceAuthError) {
                throw error;
            }
            throw new SalesForceAuthError(`Authentication request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
        }
    }
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
    async api(endpoint, method = 'GET', body = null) {
        if (!endpoint) {
            throw new SalesForceAPIError('Endpoint is required', 400);
        }
        if (!this.#authentication || this.#isTokenExpired()) {
            await this.#authenticate();
        }
        if (!this.#authentication) {
            throw new SalesForceAuthError('Authentication failed', 401);
        }
        const url = `${this.#authentication.rest_instance_url}${endpoint}`;
        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${this.#authentication.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new SalesForceAPIError(`Error: ${res.status} ${res.statusText} ${errorText}`, res.status, endpoint, method);
            }
            const data = await res.json();
            return data;
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, endpoint, method);
        }
    }
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
    async endpoints() {
        return await this.api(`/platform/v1/endpoints`, 'GET');
    }
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
    async soapClient() {
        if (!this.#authentication || this.#isTokenExpired()) {
            await this.#authenticate();
        }
        if (!this.#authentication) {
            throw new SalesForceAuthError('Authentication required for SOAP client', 401);
        }
        try {
            const wsdlUrl = `https://${this.#clientDomain}.soap.marketingcloudapis.com/etframework.wsdl`;
            const client = (await Soap.createClientAsync(wsdlUrl));
            client.addSoapHeader(`
            <fueloauth>${this.#authentication.access_token}</fueloauth>
        `);
            return client;
        }
        catch (error) {
            throw new Error(`Failed to create SOAP client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=SalesForceClient.js.map