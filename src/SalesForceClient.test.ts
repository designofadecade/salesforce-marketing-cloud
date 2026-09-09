import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SalesForceClient from './SalesForceClient.js';
import { SalesForceAuthError, SalesForceConfigError } from './errors.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock soap
vi.mock('soap', () => ({
    default: {
        createClientAsync: vi.fn(),
    },
}));

describe('SalesForceClient', () => {
    let client: SalesForceClient;

    beforeEach(() => {
        client = new SalesForceClient({
            clientDomain: 'test-domain',
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            accountId: 'test-account-id',
            scope: 'test-scope',
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create an instance with valid configuration', () => {
            expect(client).toBeInstanceOf(SalesForceClient);
        });

        it('should create instance with default scope', () => {
            const clientWithoutScope = new SalesForceClient({
                clientDomain: 'test-domain',
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                accountId: 'test-account-id',
            });
            expect(clientWithoutScope).toBeInstanceOf(SalesForceClient);
        });

        it.each([
            ['missing config', undefined],
            ['missing clientDomain', { clientDomain: '' }],
            ['missing clientId', { clientDomain: 'd', clientId: '' }],
            ['missing clientSecret', { clientDomain: 'd', clientId: 'i', clientSecret: '' }],
        ])('should throw SalesForceConfigError for %s', (_label, partial) => {
            expect(
                () =>
                    new SalesForceClient({
                        accountId: 'a',
                        ...(partial as object),
                    } as never)
            ).toThrow(SalesForceConfigError);
        });

        // A clientDomain carrying path or authority characters redirects the auth
        // request - and the client_secret it carries - to an arbitrary host.
        it.each([
            'attacker.example/',
            'attacker.example/#',
            'attacker.example/?',
            'sub.domain',
            'has space',
            'has_underscore',
            '-leading-hyphen',
        ])('should reject clientDomain %j as unsafe', domain => {
            expect(
                () =>
                    new SalesForceClient({
                        clientDomain: domain,
                        clientId: 'i',
                        clientSecret: 's',
                        accountId: 'a',
                    })
            ).toThrow(SalesForceConfigError);
        });

        it.each(['test-domain', 'mc563885gzs27c5t9', 'abc123'])(
            'should accept valid subdomain %j',
            domain => {
                expect(
                    () =>
                        new SalesForceClient({
                            clientDomain: domain,
                            clientId: 'i',
                            clientSecret: 's',
                            accountId: 'a',
                        })
                ).not.toThrow();
            }
        );

        it('should not expose credentials via serialization or reflection', () => {
            expect(JSON.stringify(client)).toBe('{}');
            expect(Reflect.ownKeys(client)).toEqual([]);
            expect(JSON.stringify(client)).not.toContain('test-client-secret');
        });
    });

    describe('api() validation', () => {
        it('should throw SalesForceConfigError for an empty endpoint', async () => {
            await expect(client.api('')).rejects.toThrow(SalesForceConfigError);
        });
    });

    describe('concurrent authentication', () => {
        // Without an in-flight guard each parallel caller POSTs the client_secret
        // to the token endpoint, which Marketing Cloud rate limits.
        it('should issue a single token request for concurrent calls', async () => {
            let tokenRequests = 0;
            (global.fetch as any).mockImplementation(async (url: string) => {
                if (String(url).includes('/v2/token')) {
                    tokenRequests++;
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({
                            access_token: 't',
                            expires_in: 1200,
                            rest_instance_url: 'https://r.example',
                        }),
                    };
                }
                return { ok: true, status: 200, json: async () => ({ ok: true }) };
            });

            await Promise.all([
                client.api('/a'),
                client.api('/b'),
                client.api('/c'),
                client.api('/d'),
                client.api('/e'),
            ]);

            expect(tokenRequests).toBe(1);
        });

        it('should retry authentication after a failure', async () => {
            let tokenRequests = 0;
            (global.fetch as any).mockImplementation(async (url: string) => {
                if (String(url).includes('/v2/token')) {
                    tokenRequests++;
                    if (tokenRequests === 1) {
                        return { ok: false, status: 401, text: async () => 'nope' };
                    }
                    return {
                        ok: true,
                        status: 200,
                        json: async () => ({
                            access_token: 't',
                            expires_in: 1200,
                            rest_instance_url: 'https://r.example',
                        }),
                    };
                }
                return { ok: true, status: 200, json: async () => ({ ok: true }) };
            });

            await expect(client.api('/a')).rejects.toThrow(SalesForceAuthError);
            // The failed promise must not be cached, or the client would be
            // permanently stuck on the first failure.
            await expect(client.api('/b')).resolves.toEqual({ ok: true });
            expect(tokenRequests).toBe(2);
        });
    });

    describe('authentication', () => {
        it('should authenticate successfully', async () => {
            const mockAuthResponse = {
                access_token: 'test-token',
                rest_instance_url: 'https://test.rest.marketingcloudapis.com',
                token_type: 'Bearer',
                expires_in: 3600,
            };

            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAuthResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: 'test' }),
                });

            const result = await client.api('/test/endpoint');

            expect(global.fetch).toHaveBeenCalledWith(
                'https://test-domain.auth.marketingcloudapis.com/v2/token',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_type: 'client_credentials',
                        client_id: 'test-client-id',
                        client_secret: 'test-client-secret',
                        scope: 'test-scope',
                        account_id: 'test-account-id',
                    }),
                })
            );
            expect(result).toEqual({ data: 'test' });
        });

        it('should throw error when authentication fails', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized',
            });

            await expect(client.api('/test/endpoint')).rejects.toThrow(
                'Failed to authenticate: 401 Unauthorized'
            );
        });

        it('should reuse existing authentication token', async () => {
            const mockAuthResponse = {
                access_token: 'test-token',
                rest_instance_url: 'https://test.rest.marketingcloudapis.com',
                expires_in: 3600,
                token_type: 'Bearer',
            };

            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAuthResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: 'first' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: 'second' }),
                });

            await client.api('/test/endpoint1');
            await client.api('/test/endpoint2');

            // Authentication should only be called once
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should re-authenticate when token has expired', async () => {
            const mockAuthResponse = {
                access_token: 'test-token',
                rest_instance_url: 'https://test.rest.marketingcloudapis.com',
                expires_in: 0, // Immediately expired (0 - 60 = -60 seconds)
                token_type: 'Bearer',
            };

            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAuthResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: 'first' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ ...mockAuthResponse, access_token: 'new-token' }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ data: 'second' }),
                });

            await client.api('/test/endpoint1');
            await client.api('/test/endpoint2');

            // Authentication should have been called twice (once per request due to expiry)
            expect(global.fetch).toHaveBeenCalledTimes(4);
        });
    });

    describe('api', () => {
        beforeEach(async () => {
            // Mock successful authentication
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        access_token: 'test-token',
                        rest_instance_url: 'https://test.rest.marketingcloudapis.com',
                    }),
                });
        });

        it('should make GET request successfully', async () => {
            const mockData = { result: 'success' };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await client.api('/test/endpoint', 'GET');

            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenLastCalledWith(
                'https://test.rest.marketingcloudapis.com/test/endpoint',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer test-token',
                        'Content-Type': 'application/json',
                    },
                })
            );
        });

        it('should make POST request with body successfully', async () => {
            const mockData = { result: 'created' };
            const postBody = { name: 'test' };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await client.api('/test/endpoint', 'POST', postBody);

            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenLastCalledWith(
                'https://test.rest.marketingcloudapis.com/test/endpoint',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(postBody),
                })
            );
        });

        it('should make DELETE request successfully', async () => {
            const mockData = { result: 'deleted' };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData,
            });

            const result = await client.api('/test/endpoint', 'DELETE');

            expect(result).toEqual(mockData);
        });

        it('should throw error when API request fails with 404', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: async () => 'Resource not found',
            });

            await expect(client.api('/test/endpoint')).rejects.toThrow(
                'Error: 404 Not Found Resource not found'
            );
        });

        it('should throw error when API request fails with 500', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: async () => 'Server error',
            });

            await expect(client.api('/test/endpoint')).rejects.toThrow(
                'Error: 500 Internal Server Error Server error'
            );
        });
    });

    describe('endpoints', () => {
        it('should get endpoints', async () => {
            const mockAuthResponse = {
                access_token: 'test-token',
                rest_instance_url: 'https://test.rest.marketingcloudapis.com',
            };

            const mockEndpoints = { endpoints: ['endpoint1', 'endpoint2'] };

            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockAuthResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockEndpoints,
                });

            const result = await client.endpoints();

            expect(result).toEqual(mockEndpoints);
            expect(global.fetch).toHaveBeenLastCalledWith(
                'https://test.rest.marketingcloudapis.com/platform/v1/endpoints',
                expect.anything()
            );
        });
    });

    describe('soapClient', () => {
        it('should create SOAP client with authentication', async () => {
            const mockAuthResponse = {
                access_token: 'test-soap-token',
                rest_instance_url: 'https://test.rest.marketingcloudapis.com',
            };

            const mockSoapClient = {
                addSoapHeader: vi.fn(),
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAuthResponse,
            });

            const { default: Soap } = await import('soap');
            (Soap.createClientAsync as any).mockResolvedValueOnce(mockSoapClient);

            const soapClient = await client.soapClient();

            expect(Soap.createClientAsync).toHaveBeenCalledWith(
                'https://test-domain.soap.marketingcloudapis.com/etframework.wsdl'
            );
            expect(mockSoapClient.addSoapHeader).toHaveBeenCalledWith(
                expect.stringContaining('test-soap-token')
            );
            expect(soapClient).toBe(mockSoapClient);
        });
    });
});
