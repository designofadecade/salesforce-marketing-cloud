import type SalesForceClient from './SalesForceClient.js';
import { SalesForceAPIError, SalesForceConfigError } from './errors.js';
import type { AssetResponse, AssetsListResponse } from './types.js';

/**
 * Assets API client for Salesforce Marketing Cloud
 *
 * Provides methods for managing content assets in Marketing Cloud,
 * including listing and updating assets.
 *
 * @example
 * ```typescript
 * const client = new SalesForceClient({ ... });
 * const assets = new Assets(client);
 *
 * // List all assets
 * const assetList = await assets.list();
 *
 * // Update an asset
 * const updated = await assets.update('asset-id', { name: 'New Name' });
 * ```
 */
export default class Assets {
    #SF: SalesForceClient;

    /**
     * Creates a new Assets API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance: SalesForceClient) {
        if (!salesForceInstance) {
            throw new SalesForceConfigError('SalesForce client instance is required');
        }
        this.#SF = salesForceInstance;
    }

    /**
     * Lists all assets filtered by asset type ID 205 (typically HTML content blocks)
     *
     * @returns A promise that resolves to the list of assets
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const assets = await assetsClient.list();
     * console.log(`Found ${assets.count} assets`);
     * ```
     */
    async list(): Promise<AssetsListResponse> {
        try {
            return await this.#SF.api<AssetsListResponse>(
                `/asset/v1/content/assets?$filter=assetType.id=205`,
                'GET'
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to list assets: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                '/asset/v1/content/assets',
                'GET'
            );
        }
    }

    /**
     * Updates an existing asset by ID
     *
     * @param id - The ID of the asset to update
     * @param data - The data to update on the asset
     * @returns A promise that resolves to the updated asset
     * @throws {SalesForceConfigError} If the asset ID is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const updated = await assetsClient.update('12345', {
     *   name: 'Updated Asset Name',
     *   content: '<html>...</html>'
     * });
     * ```
     */
    async update(id: string, data: Record<string, any>): Promise<AssetResponse> {
        if (!id) {
            throw new SalesForceConfigError('Asset ID is required');
        }

        if (!data || Object.keys(data).length === 0) {
            throw new SalesForceConfigError('Update data is required');
        }

        try {
            return await this.#SF.api<AssetResponse>(
                `/asset/v1/content/assets/${id}`,
                'PATCH',
                data
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to update asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                `/asset/v1/content/assets/${id}`,
                'PATCH'
            );
        }
    }
}
