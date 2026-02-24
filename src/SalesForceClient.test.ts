import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SalesForceClient from './SalesForceClient.js';

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
