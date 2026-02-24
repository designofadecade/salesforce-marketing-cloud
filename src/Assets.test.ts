import { describe, it, expect, vi, beforeEach } from 'vitest';
import Assets from './Assets.js';
import type SalesForceClient from './SalesForceClient.js';

describe('Assets', () => {
    let assets: Assets;
    let mockSFClient: Partial<SalesForceClient>;

    beforeEach(() => {
        mockSFClient = {
            api: vi.fn(),
        };

        assets = new Assets(mockSFClient as SalesForceClient);
    });

    describe('constructor', () => {
        it('should create an instance with SalesForce client', () => {
            expect(assets).toBeInstanceOf(Assets);
        });
    });

    describe('list', () => {
        it('should list assets with correct filter for type 205', async () => {
            const mockAssets = {
                count: 2,
                page: 1,
                pageSize: 50,
                items: [
                    { id: '123', name: 'Test Asset 1', assetType: { id: 205 } },
                    { id: '456', name: 'Test Asset 2', assetType: { id: 205 } },
                ],
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockAssets);

            const result = await assets.list();

            expect(result).toEqual(mockAssets);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/asset/v1/content/assets?$filter=assetType.id=205',
                'GET'
            );
        });

        it('should handle empty asset list', async () => {
            const mockAssets = {
                count: 0,
                items: [],
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockAssets);

            const result = await assets.list();

            expect(result).toEqual(mockAssets);
            expect(result.items).toHaveLength(0);
        });

        it('should handle errors when listing assets', async () => {
            const error = new Error('API Error: Unable to fetch assets');
            (mockSFClient.api as any).mockRejectedValueOnce(error);

            await expect(assets.list()).rejects.toThrow('API Error: Unable to fetch assets');
        });
    });

    describe('update', () => {
        it('should update asset successfully', async () => {
            const mockResponse = {
                id: '123',
                name: 'Updated Asset',
                status: 'active',
            };
            const updateData = {
                name: 'Updated Asset',
                status: 'active',
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await assets.update('123', updateData);

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/asset/v1/content/assets/123',
                'PATCH',
                updateData
            );
        });

        it('should update asset with partial data', async () => {
            const mockResponse = { id: '456', name: 'Partial Update' };
            const updateData = { name: 'Partial Update' };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await assets.update('456', updateData);

            expect(result).toEqual(mockResponse);
        });

        it('should handle API errors during update', async () => {
            const error = new Error('Update failed: Asset not found');
            (mockSFClient.api as any).mockRejectedValueOnce(error);

            await expect(assets.update('999', { name: 'Test' })).rejects.toThrow(
                'Update failed: Asset not found'
            );
        });

        it('should handle network errors during update', async () => {
            const error = new Error('Network error');
            (mockSFClient.api as any).mockRejectedValueOnce(error);

            await expect(assets.update('123', { name: 'Test' })).rejects.toThrow('Network error');
        });
    });
});
