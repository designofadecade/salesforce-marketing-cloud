import Soap from 'soap';
import Scopes from './Scopes.js';
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
    // ========================================
    // OAuth Scope Constants (Backward Compatibility)
    // @deprecated Use Scopes class instead (e.g., Scopes.EMAIL_READ)
    // ========================================
    
    /** @deprecated Use Scopes.EMAIL_READ instead */
    static readonly SCOPE_EMAIL_READ = Scopes.EMAIL_READ;
    /** @deprecated Use Scopes.EMAIL_WRITE instead */
    static readonly SCOPE_EMAIL_WRITE = Scopes.EMAIL_WRITE;
    /** @deprecated Use Scopes.EMAIL_SEND instead */
    static readonly SCOPE_EMAIL_SEND = Scopes.EMAIL_SEND;
    /** @deprecated Use Scopes.SMS_READ instead */
    static readonly SCOPE_SMS_READ = Scopes.SMS_READ;
    /** @deprecated Use Scopes.SMS_WRITE instead */
    static readonly SCOPE_SMS_WRITE = Scopes.SMS_WRITE;
    /** @deprecated Use Scopes.SMS_SEND instead */
    static readonly SCOPE_SMS_SEND = Scopes.SMS_SEND;
    /** @deprecated Use Scopes.PUSH_READ instead */
    static readonly SCOPE_PUSH_READ = Scopes.PUSH_READ;
    /** @deprecated Use Scopes.PUSH_WRITE instead */
    static readonly SCOPE_PUSH_WRITE = Scopes.PUSH_WRITE;
    /** @deprecated Use Scopes.PUSH_SEND instead */
    static readonly SCOPE_PUSH_SEND = Scopes.PUSH_SEND;
    /** @deprecated Use Scopes.SOCIAL_READ instead */
    static readonly SCOPE_SOCIAL_READ = Scopes.SOCIAL_READ;
    /** @deprecated Use Scopes.SOCIAL_WRITE instead */
    static readonly SCOPE_SOCIAL_WRITE = Scopes.SOCIAL_WRITE;
    /** @deprecated Use Scopes.SOCIAL_PUBLISH instead */
    static readonly SCOPE_SOCIAL_PUBLISH = Scopes.SOCIAL_PUBLISH;
    /** @deprecated Use Scopes.OTT_READ instead */
    static readonly SCOPE_OTT_READ = Scopes.OTT_READ;
    /** @deprecated Use Scopes.OTT_SEND instead */
    static readonly SCOPE_OTT_SEND = Scopes.OTT_SEND;
    /** @deprecated Use Scopes.DATA_EXTENSIONS_READ instead */
    static readonly SCOPE_DATA_EXTENSIONS_READ = Scopes.DATA_EXTENSIONS_READ;
    /** @deprecated Use Scopes.DATA_EXTENSIONS_WRITE instead */
    static readonly SCOPE_DATA_EXTENSIONS_WRITE = Scopes.DATA_EXTENSIONS_WRITE;
    /** @deprecated Use Scopes.AUDIENCES_READ instead */
    static readonly SCOPE_AUDIENCES_READ = Scopes.AUDIENCES_READ;
    /** @deprecated Use Scopes.AUDIENCES_WRITE instead */
    static readonly SCOPE_AUDIENCES_WRITE = Scopes.AUDIENCES_WRITE;
    /** @deprecated Use Scopes.LIST_AND_SUBSCRIBERS_READ instead */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_READ = Scopes.LIST_AND_SUBSCRIBERS_READ;
    /** @deprecated Use Scopes.LIST_AND_SUBSCRIBERS_WRITE instead */
    static readonly SCOPE_LIST_AND_SUBSCRIBERS_WRITE = Scopes.LIST_AND_SUBSCRIBERS_WRITE;
    /** @deprecated Use Scopes.FILE_LOCATIONS_READ instead */
    static readonly SCOPE_FILE_LOCATIONS_READ = Scopes.FILE_LOCATIONS_READ;
    /** @deprecated Use Scopes.FILE_LOCATIONS_WRITE instead */
    static readonly SCOPE_FILE_LOCATIONS_WRITE = Scopes.FILE_LOCATIONS_WRITE;
    /** @deprecated Use Scopes.TRACKING_EVENTS_READ instead */
    static readonly SCOPE_TRACKING_EVENTS_READ = Scopes.TRACKING_EVENTS_READ;
    /** @deprecated Use Scopes.DOCUMENTS_AND_IMAGES_READ instead */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_READ = Scopes.DOCUMENTS_AND_IMAGES_READ;
    /** @deprecated Use Scopes.DOCUMENTS_AND_IMAGES_WRITE instead */
    static readonly SCOPE_DOCUMENTS_AND_IMAGES_WRITE = Scopes.DOCUMENTS_AND_IMAGES_WRITE;
    /** @deprecated Use Scopes.SAVED_CONTENT_READ instead */
    static readonly SCOPE_SAVED_CONTENT_READ = Scopes.SAVED_CONTENT_READ;
    /** @deprecated Use Scopes.SAVED_CONTENT_WRITE instead */
    static readonly SCOPE_SAVED_CONTENT_WRITE = Scopes.SAVED_CONTENT_WRITE;
    /** @deprecated Use Scopes.AUTOMATIONS_EXECUTE instead */
    static readonly SCOPE_AUTOMATIONS_EXECUTE = Scopes.AUTOMATIONS_EXECUTE;
    /** @deprecated Use Scopes.AUTOMATIONS_READ instead */
    static readonly SCOPE_AUTOMATIONS_READ = Scopes.AUTOMATIONS_READ;
    /** @deprecated Use Scopes.AUTOMATIONS_WRITE instead */
    static readonly SCOPE_AUTOMATIONS_WRITE = Scopes.AUTOMATIONS_WRITE;
    /** @deprecated Use Scopes.JOURNEYS_EXECUTE instead */
    static readonly SCOPE_JOURNEYS_EXECUTE = Scopes.JOURNEYS_EXECUTE;
    /** @deprecated Use Scopes.JOURNEYS_READ instead */
    static readonly SCOPE_JOURNEYS_READ = Scopes.JOURNEYS_READ;
    /** @deprecated Use Scopes.JOURNEYS_WRITE instead */
    static readonly SCOPE_JOURNEYS_WRITE = Scopes.JOURNEYS_WRITE;
    /** @deprecated Use Scopes.USERS_READ instead */
    static readonly SCOPE_USERS_READ = Scopes.USERS_READ;
    /** @deprecated Use Scopes.USERS_WRITE instead */
    static readonly SCOPE_USERS_WRITE = Scopes.USERS_WRITE;
    /** @deprecated Use Scopes.ORGANIZATIONS_READ instead */
    static readonly SCOPE_ORGANIZATIONS_READ = Scopes.ORGANIZATIONS_READ;
    /** @deprecated Use Scopes.ORGANIZATIONS_WRITE instead */
    static readonly SCOPE_ORGANIZATIONS_WRITE = Scopes.ORGANIZATIONS_WRITE;
    /** @deprecated Use Scopes.WORKFLOWS_WRITE instead */
    static readonly SCOPE_WORKFLOWS_WRITE = Scopes.WORKFLOWS_WRITE;
    /** @deprecated Use Scopes.WEBHOOKS_READ instead */
    static readonly SCOPE_WEBHOOKS_READ = Scopes.WEBHOOKS_READ;
    /** @deprecated Use Scopes.WEBHOOKS_WRITE instead */
    static readonly SCOPE_WEBHOOKS_WRITE = Scopes.WEBHOOKS_WRITE;
    /** @deprecated Use Scopes.OFFLINE instead */
    static readonly SCOPE_OFFLINE = Scopes.OFFLINE;

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
    static buildScope(scopes: string[]): string {
        return Scopes.buildScope(scopes);
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
