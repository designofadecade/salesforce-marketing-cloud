import type SalesForceClient from './SalesForceClient.js';
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
    #private;
    /**
     * Creates a new Assets API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance: SalesForceClient);
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
    list(): Promise<AssetsListResponse>;
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
    update(id: string, data: Record<string, any>): Promise<AssetResponse>;
}
//# sourceMappingURL=Assets.d.ts.map