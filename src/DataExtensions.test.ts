import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataExtensions from './DataExtensions.js';
import type SalesForceClient from './SalesForceClient.js';
import { SalesForceConfigError } from './errors.js';

describe('DataExtensions', () => {
    let dataExtensions: DataExtensions;
    let mockSFClient: Partial<SalesForceClient>;

    beforeEach(() => {
        mockSFClient = {
            api: vi.fn(),
        };

        dataExtensions = new DataExtensions(mockSFClient as SalesForceClient);
    });

    describe('constructor', () => {
        it('should create an instance', () => {
            expect(dataExtensions).toBeInstanceOf(DataExtensions);
        });
    });

    describe('get', () => {
        it('should get data extension rowset', async () => {
            const mockData = {
                items: [{ id: 1, name: 'Test' }],
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockData);

            const result = await dataExtensions.get('test-key');

            expect(result).toEqual(mockData);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/data/v1/customobjectdata/key/test-key/rowset',
                'GET'
            );
        });
    });

    describe('getData', () => {
        it('should get specific data by primary key', async () => {
            const mockResponse = {
                items: [
                    {
                        keys: { id: '123' },
                        values: { name: 'Test', email: 'test@example.com' },
                    },
                ],
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.getData('test-key', 'id', '123');

            expect(result).toEqual({ name: 'Test', email: 'test@example.com' });
            expect(mockSFClient.api).toHaveBeenCalledWith(
                "/data/v1/customobjectdata/key/test-key/rowset?$filter=id eq '123'",
                'GET'
            );
        });

        // A raw single quote terminates the OData string literal, letting a
        // user-supplied value rewrite the $filter into a tautology and return
        // another record entirely.
        it('should escape single quotes in the filter value', async () => {
            (mockSFClient.api as any).mockResolvedValueOnce({ items: [] });

            await dataExtensions.getData('test-key', 'email', "x' or email ne 'x");

            const url = (mockSFClient.api as any).mock.calls[0][0] as string;
            const filter = decodeURIComponent(url.split('$filter=')[1]);

            // The doubled quote keeps the payload inside the string literal.
            expect(filter).toBe("email eq 'x'' or email ne ''x'");
            expect(filter).not.toBe("email eq 'x' or email ne 'x'");
        });

        it('should encode reserved characters in the filter value', async () => {
            (mockSFClient.api as any).mockResolvedValueOnce({ items: [] });

            await dataExtensions.getData('test-key', 'id', 'a&$top=1#frag');

            const url = (mockSFClient.api as any).mock.calls[0][0] as string;
            expect(url).not.toContain('&$top=1');
            expect(url).toContain('%26');
        });

        it('should encode the external key', async () => {
            (mockSFClient.api as any).mockResolvedValueOnce({ items: [] });

            await dataExtensions.getData('../../../platform/v1/endpoints', 'id', '1');

            const url = (mockSFClient.api as any).mock.calls[0][0] as string;
            expect(url).not.toContain('../');
            expect(url).toContain('%2F');
        });

        it.each(['id;drop', 'id eq 1', "id'", 'id)', ''])(
            'should reject unsafe primary key field name %j',
            async field => {
                await expect(
                    dataExtensions.getData('test-key', field, '1')
                ).rejects.toThrow(SalesForceConfigError);
            }
        );

        it('should return undefined when no data found', async () => {
            const mockResponse = { items: [] };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.getData('test-key', 'id', '999');

            expect(result).toBeUndefined();
        });
    });

    describe('insert', () => {
        it('should insert items successfully', async () => {
            const items = [
                { keys: { id: '1' }, values: { name: 'Test 1' } },
                { keys: { id: '2' }, values: { name: 'Test 2' } },
            ];

            const mockResponse = { message: 'Inserted successfully' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.insert('test-key', items);

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset',
                'POST',
                items
            );
        });

        it('should encode special characters in external key', async () => {
            const items = [{ keys: { id: '1' }, values: { name: 'Test' } }];

            (mockSFClient.api as any).mockResolvedValueOnce({});

            await dataExtensions.insert('test:key/with:special', items);

            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test%3Akey%2Fwith%3Aspecial/rowset',
                'POST',
                items
            );
        });
    });

    describe('update', () => {
        it('should update record successfully', async () => {
            const mockResponse = { message: 'Updated successfully' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.update(
                'test-key',
                'id',
                '123',
                { name: 'Updated Name', status: 'active' }
            );

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset',
                'POST',
                [
                    {
                        keys: { id: '123' },
                        values: { name: 'Updated Name', status: 'active' },
                    },
                ]
            );
        });

        it('should encode special characters in external key', async () => {
            (mockSFClient.api as any).mockResolvedValueOnce({});

            await dataExtensions.update(
                'test:key/with:special',
                'id',
                '123',
                { name: 'Updated Name' }
            );

            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test%3Akey%2Fwith%3Aspecial/rowset',
                'POST',
                [
                    {
                        keys: { id: '123' },
                        values: { name: 'Updated Name' },
                    },
                ]
            );
        });
    });

    describe('insertAsync', () => {
        it('should insert items asynchronously', async () => {
            const items = [
                { id: '1', name: 'Test 1' },
                { id: '2', name: 'Test 2' },
            ];

            const mockResponse = { requestId: 'async-123' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.insertAsync('test-key', items);

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/data/v1/async/dataextensions/key:test-key/rows',
                'POST',
                { items }
            );
        });
    });

    describe('updateAsync', () => {
        it('should update items asynchronously', async () => {
            const items = [
                { id: '1', name: 'Updated 1' },
                { id: '2', name: 'Updated 2' },
            ];

            const mockResponse = { requestId: 'async-456' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.updateAsync('test-key', items);

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/data/v1/async/dataextensions/key:test-key/rows',
                'PUT',
                { items }
            );
        });
    });

    describe('delete', () => {
        it('should delete record successfully', async () => {
            const mockResponse = { message: 'Deleted successfully' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.delete('test-key', 'id', '123');

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                [{ keys: { id: '123' } }]
            );
        });

        it('should encode special characters in external key', async () => {
            (mockSFClient.api as any).mockResolvedValueOnce({});

            await dataExtensions.delete('test:key/with:special', 'id', '123');

            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test%3Akey%2Fwith%3Aspecial/rowset/delete',
                'POST',
                [{ keys: { id: '123' } }]
            );
        });
    });

    describe('bulkDelete', () => {
        it('should delete multiple records successfully', async () => {
            const items = [
                { keys: { key: 'campaign_1' } },
                { keys: { key: 'campaign_2' } },
                { keys: { key: 'campaign_3' } },
            ];

            const mockResponse = { message: 'Deleted successfully' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await dataExtensions.bulkDelete('test-key', items);

            expect(result).toEqual([mockResponse]);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                items
            );
        });

        it('should encode special characters in external key', async () => {
            const items = [
                { keys: { id: '123' } },
                { keys: { id: '456' } },
            ];

            (mockSFClient.api as any).mockResolvedValueOnce({});

            await dataExtensions.bulkDelete('test:key/with:special', items);

            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test%3Akey%2Fwith%3Aspecial/rowset/delete',
                'POST',
                items
            );
        });

        it('should handle different primary key fields', async () => {
            const items = [
                { keys: { subscriberkey: 'user@example.com' } },
                { keys: { subscriberkey: 'other@example.com' } },
            ];

            (mockSFClient.api as any).mockResolvedValueOnce({});

            await dataExtensions.bulkDelete('customer-de', items);

            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:customer-de/rowset/delete',
                'POST',
                items
            );
        });

        it('should automatically batch large datasets', async () => {
            // Create 2500 items (should split into 3 batches with default batch size of 1000)
            const items = Array.from({ length: 2500 }, (_, i) => ({
                keys: { id: `id_${i}` }
            }));

            const mockResponse1 = { message: 'Batch 1 deleted' };
            const mockResponse2 = { message: 'Batch 2 deleted' };
            const mockResponse3 = { message: 'Batch 3 deleted' };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(mockResponse1)
                .mockResolvedValueOnce(mockResponse2)
                .mockResolvedValueOnce(mockResponse3);

            const result = await dataExtensions.bulkDelete('test-key', items);

            expect(result).toHaveLength(3);
            expect(result).toEqual([mockResponse1, mockResponse2, mockResponse3]);
            expect(mockSFClient.api).toHaveBeenCalledTimes(3);

            // Verify batch sizes
            expect((mockSFClient.api as any).mock.calls[0][2]).toHaveLength(1000);
            expect((mockSFClient.api as any).mock.calls[1][2]).toHaveLength(1000);
            expect((mockSFClient.api as any).mock.calls[2][2]).toHaveLength(500);
        });

        it('should support custom batch size', async () => {
            const items = Array.from({ length: 150 }, (_, i) => ({
                keys: { id: `id_${i}` }
            }));

            (mockSFClient.api as any)
                .mockResolvedValueOnce({ message: 'Batch 1' })
                .mockResolvedValueOnce({ message: 'Batch 2' })
                .mockResolvedValueOnce({ message: 'Batch 3' });

            const result = await dataExtensions.bulkDelete('test-key', items, 50);

            expect(result).toHaveLength(3);
            expect(mockSFClient.api).toHaveBeenCalledTimes(3);
            expect((mockSFClient.api as any).mock.calls[0][2]).toHaveLength(50);
            expect((mockSFClient.api as any).mock.calls[1][2]).toHaveLength(50);
            expect((mockSFClient.api as any).mock.calls[2][2]).toHaveLength(50);
        });

        it('should throw error when external key is missing', async () => {
            const items = [{ keys: { id: '123' } }];

            await expect(dataExtensions.bulkDelete('', items)).rejects.toThrow(
                'Data extension external key is required'
            );
        });

        it('should throw error when items array is empty', async () => {
            await expect(dataExtensions.bulkDelete('test-key', [])).rejects.toThrow(
                'Items array is required and must not be empty'
            );
        });

        it('should throw error when items is not an array', async () => {
            await expect(
                dataExtensions.bulkDelete('test-key', null as any)
            ).rejects.toThrow('Items array is required and must not be empty');
        });

        it('should throw error when batch size is less than 1', async () => {
            const items = [{ keys: { id: '123' } }];

            await expect(dataExtensions.bulkDelete('test-key', items, 0)).rejects.toThrow(
                'Batch size must be at least 1'
            );
        });

        it('should handle API errors appropriately', async () => {
            const items = [{ keys: { id: '123' } }];

            (mockSFClient.api as any).mockRejectedValueOnce(
                new Error('Network error')
            );

            await expect(dataExtensions.bulkDelete('test-key', items)).rejects.toThrow(
                'Failed to bulk delete data: Network error'
            );
        });
    });

    describe('getAllRows', () => {
        it('should get all rows with pagination', async () => {
            const page1 = {
                items: [{ id: 1 }, { id: 2 }],
                links: { next: true },
            };

            const page2 = {
                items: [{ id: 3 }, { id: 4 }],
                links: {},
            };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(page1)
                .mockResolvedValueOnce(page2);

            const result = await dataExtensions.getAllRows('test-key');

            expect(result).toHaveLength(4);
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
            expect(mockSFClient.api).toHaveBeenCalledTimes(2);
        });

        it('should handle single page response', async () => {
            const mockData = {
                items: [{ id: 1 }],
                links: {},
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockData);

            const result = await dataExtensions.getAllRows('test-key');

            expect(result).toEqual([{ id: 1 }]);
            expect(mockSFClient.api).toHaveBeenCalledTimes(1);
        });

        it('should handle empty data extension', async () => {
            const mockData = {
                items: [],
                links: {},
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockData);

            const result = await dataExtensions.getAllRows('test-key');

            expect(result).toEqual([]);
        });
    });

    describe('clearRecords', () => {
        it('should clear all records from data extension using bulkDelete', async () => {
            const mockRows = {
                items: [
                    { keys: { key: 'row1' } },
                    { keys: { key: 'row2' } },
                ],
                links: {},
            };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(mockRows)
                .mockResolvedValueOnce({ message: 'Deleted' });

            await dataExtensions.clearRecords('test-key');

            expect(mockSFClient.api).toHaveBeenCalledTimes(2);
            expect(mockSFClient.api).toHaveBeenNthCalledWith(
                1,
                '/data/v1/customobjectdata/key/test-key/rowset?$pageSize=500&$page=1',
                'GET'
            );
            expect(mockSFClient.api).toHaveBeenNthCalledWith(
                2,
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                [
                    { keys: { key: 'row1' } },
                    { keys: { key: 'row2' } }
                ]
            );
        });

        it('should use custom primary key', async () => {
            const mockRows = {
                items: [{ keys: { customId: 'id1' } }],
                links: {},
            };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(mockRows)
                .mockResolvedValueOnce({ message: 'Deleted' });

            await dataExtensions.clearRecords('test-key', 'customId');

            expect(mockSFClient.api).toHaveBeenLastCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                [{ keys: { customId: 'id1' } }]
            );
        });
    });

    describe('jsonToValues', () => {
        it('should split JSON into chunked values', () => {
            const data = { test: 'data', number: 123 };
            const result = DataExtensions.jsonToValues(data, 'json', 4, 10);

            expect(result).toHaveProperty('json1');
            expect(result).toHaveProperty('json2');
            expect(result).toHaveProperty('json3');
            expect(result).toHaveProperty('json4');

            const combined = result.json1 + result.json2 + result.json3 + result.json4;
            expect(combined).toContain('"test":"data"');
        });

        it('should handle small JSON that fits in one chunk', () => {
            const data = { small: 'data' };
            const result = DataExtensions.jsonToValues(data, 'attr', 4, 3900);

            expect(result.attr1).toContain('"small":"data"');
            expect(result.attr2).toBe('');
            expect(result.attr3).toBe('');
            expect(result.attr4).toBe('');
        });

        it('should handle large JSON across multiple chunks', () => {
            const largeData = { data: 'x'.repeat(10000) };
            const result = DataExtensions.jsonToValues(largeData, 'content', 4, 3900);

            const combined = result.content1 + result.content2 + result.content3 + result.content4;
            expect(combined).toContain('xxxx');
        });

        it('should throw error when data exceeds count x size limit', () => {
            // Create data that exceeds 4 * 10 = 40 characters
            const largeData = { data: 'x'.repeat(100) };

            expect(() => {
                DataExtensions.jsonToValues(largeData, 'json', 4, 10);
            }).toThrow('Data size (111 characters) exceeds maximum allowed size (40 characters)');
        });
    });
});
