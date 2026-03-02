import { describe, it, expect, vi, beforeEach } from 'vitest';
import DataExtensions from './DataExtensions.js';
import type SalesForceClient from './SalesForceClient.js';

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
        it('should clear all records from data extension', async () => {
            const mockRows = {
                items: [
                    { keys: { key: 'row1' } },
                    { keys: { key: 'row2' } },
                ],
                links: {},
            };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(mockRows)
                .mockResolvedValueOnce({ message: 'Deleted' })
                .mockResolvedValueOnce({ message: 'Deleted' });

            await dataExtensions.clearRecords('test-key');

            expect(mockSFClient.api).toHaveBeenCalledTimes(3);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                [{ keys: { key: 'row1' } }]
            );
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/hub/v1/dataevents/key:test-key/rowset/delete',
                'POST',
                [{ keys: { key: 'row2' } }]
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
