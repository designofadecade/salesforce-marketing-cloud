import Soap from 'soap';
import {
    SalesForceAPIError,
    SalesForceAuthError,
    SalesForceConfigError,
} from './errors.js';
import type {
    SalesForceClientConfig,
    AuthenticationResponse,
    SoapClientInterface,
} from './types.js';

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
    // OAuth Scope Constants
    /** Read access to email functionality */
    static readonly SCOPE_EMAIL_READ = 'email_read';
    /** Write access to email functionality */
    static readonly SCOPE_EMAIL_WRITE = 'email_write';
    /** Permission to send emails */
    static readonly SCOPE_EMAIL_SEND = 'email_send';
    
    /** Read access to lists and subscribers */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_READ = 'list_and_subscribers_read';
    /** Write access to lists and subscribers */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_WRITE = 'list_and_subscribers_write';
    
    /** Read access to data extensions */
    static readonly SCOPE_DATA_EXTENSIONS_READ = 'data_extensions_read';
    /** Write access to data extensions */
    static readonly SCOPE_DATA_EXTENSIONS_WRITE = 'data_extensions_write';
    
    /** Read access to saved content */
    static readonly SCOPE_SAVED_CONTENT_READ = 'saved_content_read';
    /** Write access to saved content */
    static readonly SCOPE_SAVED_CONTENT_WRITE = 'saved_content_write';
    
    /** Read access to automations */
    static readonly SCOPE_AUTOMATIONS_READ = 'automations_read';
    /** Write access to automations */
    static readonly SCOPE_AUTOMATIONS_WRITE = 'automations_write';
    /** Execute automations */
    static readonly SCOPE_AUTOMATIONS_EXECUTE = 'automations_execute';
    
    /** Read access to journeys */
    static readonly SCOPE_JOURNEYS_READ = 'journeys_read';
    /** Write access to journeys */
    static readonly SCOPE_JOURNEYS_WRITE = 'journeys_write';
    /** Execute/publish journeys */
    static readonly SCOPE_JOURNEYS_EXECUTE = 'journeys_execute';
    
    /** Read access to tracking events */
    static readonly SCOPE_TRACKING_EVENTS_READ = 'tracking_events_read';
    
    /** Read access to webhooks */
    static readonly SCOPE_WEBHOOKS_READ = 'webhooks_read';
    /** Write access to webhooks */
    static readonly SCOPE_WEBHOOKS_WRITE = 'webhooks_write';
    
    /** Read access to documents and images */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_READ = 'documents_and_images_read';
    /** Write access to documents and images */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_WRITE = 'documents_and_images_write';
    
    /** Offline access (for refresh tokens) */
    static readonly SCOPE_OFFLINE = 'offline';

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
    static buildScope(scopes: string[]): string {
        return scopes.filter(Boolean).join(' ');
    }

    #clientDomain: string;
    #clientId: string;
    #clientSecret: string;
    #accountId: string;
    #scope: string;
    #authentication?: AuthenticationResponse;
    #tokenExpiresAt?: number;

    /**
     * Creates a new Salesforce Marketing Cloud client instance
     *
     * @param config - Configuration options for the client
     * @throws {SalesForceConfigError} If required configuration parameters are missing
     */
    constructor(config: SalesForceClientConfig) {
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
    #isTokenExpired(): boolean {
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
    async #authenticate(): Promise<void> {
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
                throw new SalesForceAuthError(
                    `Failed to authenticate: ${res.status} ${errorText}`,
                    res.status
                );
            }

            const data = (await res.json()) as AuthenticationResponse;
            this.#authentication = data;
            // Store expiry time with a 60-second buffer to avoid using near-expired tokens
            this.#tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
        } catch (error) {
            if (error instanceof SalesForceAuthError) {
                throw error;
            }
            throw new SalesForceAuthError(
                `Authentication request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
            );
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
    async api<T = any>(
        endpoint: string,
        method: string = 'GET',
        body: Record<string, any> | Record<string, any>[] | null = null
    ): Promise<T> {
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
                throw new SalesForceAPIError(
                    `Error: ${res.status} ${res.statusText} ${errorText}`,
                    res.status,
                    endpoint,
                    method
                );
            }

            const data = await res.json();
            return data as T;
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                endpoint,
                method
            );
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
    async endpoints(): Promise<any> {
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
    async soapClient(): Promise<SoapClientInterface> {
        if (!this.#authentication || this.#isTokenExpired()) {
            await this.#authenticate();
        }

        if (!this.#authentication) {
            throw new SalesForceAuthError('Authentication required for SOAP client', 401);
        }

        try {
            const wsdlUrl = `https://${this.#clientDomain}.soap.marketingcloudapis.com/etframework.wsdl`;
            const client = (await Soap.createClientAsync(
                wsdlUrl
            )) as unknown as SoapClientInterface;

            client.addSoapHeader(`
            <fueloauth>${this.#authentication.access_token}</fueloauth>
        `);

            return client;
        } catch (error) {
            throw new Error(
                `Failed to create SOAP client: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
