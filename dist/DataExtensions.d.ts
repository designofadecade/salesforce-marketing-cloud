import type SalesForceClient from './SalesForceClient.js';
import type { DataExtensionRow, DataExtensionResponse } from './types.js';
/**
 * Data Extensions API client for Salesforce Marketing Cloud
 *
 * Provides methods for managing data extensions, including reading, inserting,
 * updating, and deleting records. Supports both synchronous and asynchronous operations.
 *
 * @example
 * ```typescript
 * const client = new SalesForceClient({ ... });
 * const dataExtensions = new DataExtensions(client);
 *
 * // Insert records
 * await dataExtensions.insert('customer-de', [
 *   { keys: { email: 'test@example.com' }, values: { name: 'John Doe' } }
 * ]);
 *
 * // Get all rows
 * const rows = await dataExtensions.getAllRows('customer-de');
 * ```
 */
export default class DataExtensions {
    #private;
    /**
     * Creates a new DataExtensions API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance: SalesForceClient);
    /**
     * Retrieves all rows from a data extension
     *
     * @param externalKey - The external key of the data extension
     * @returns A promise that resolves to the data extension response
     * @throws {SalesForceConfigError} If the external key is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const data = await dataExtensions.get('customer-de');
     * ```
     */
    get(externalKey: string): Promise<DataExtensionResponse>;
    /**
     * Retrieves specific data from a data extension by filtering on a primary key
     *
     * @param externalKey - The external key of the data extension
     * @param primaryKey - The name of the primary key field
     * @param primaryKeyValue - The value of the primary key to filter by
     * @returns A promise that resolves to the values of the first matching record, or undefined
     * @throws {SalesForceConfigError} If required parameters are missing
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const customerData = await dataExtensions.getData(
     *   'customer-de',
     *   'email',
     *   'customer@example.com'
     * );
     * console.log(customerData?.name);
     * ```
     */
    getData(externalKey: string, primaryKey: string, primaryKeyValue: string): Promise<Record<string, any> | undefined>;
    /**
     * Inserts one or more records into a data extension
     *
     * @param externalKey - The external key of the data extension
     * @param items - Array of items to insert
     * @returns A promise that resolves to the API response
     * @throws {SalesForceConfigError} If required parameters are missing or invalid
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * await dataExtensions.insert('customer-de', [
     *   { keys: { email: 'john@example.com' }, values: { name: 'John' } },
     *   { keys: { email: 'jane@example.com' }, values: { name: 'Jane' } }
     * ]);
     * ```
     */
    insert<T = any>(externalKey: string, items: DataExtensionRow[]): Promise<T>;
    /**
     * Updates a record in a data extension
     *
     * @param externalKey - The external key of the data extension
     * @param primaryKey - The name of the primary key field
     * @param primaryKeyValue - The value of the primary key to update
     * @param values - The values to update
     * @returns A promise that resolves to the API response
     * @throws {SalesForceConfigError} If required parameters are missing
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * await dataExtensions.update(
     *   'customer-de',
     *   'email',
     *   'customer@example.com',
     *   { status: 'active', lastUpdated: new Date().toISOString() }
     * );
     * ```
     */
    update<T = any>(externalKey: string, primaryKey: string, primaryKeyValue: string, values: Record<string, any>): Promise<T>;
    /**
     * Inserts records asynchronously into a data extension
     *
     * @param externalKey - The external key of the data extension
     * @param items - Array of items to insert
     * @returns A promise that resolves to the async request details
     * @throws {SalesForceConfigError} If required parameters are missing or invalid
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const result = await dataExtensions.insertAsync('customer-de', [
     *   { email: 'john@example.com', name: 'John' }
     * ]);
     * console.log(`Request ID: ${result.requestId}`);
     * ```
     */
    insertAsync<T = any>(externalKey: string, items: Record<string, any>[]): Promise<T>;
    /**
     * Updates records asynchronously in a data extension
     *
     * @param externalKey - The external key of the data extension
     * @param items - Array of items to update
     * @returns A promise that resolves to the async request details
     * @throws {SalesForceConfigError} If required parameters are missing or invalid
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const result = await dataExtensions.updateAsync('customer-de', [
     *   { email: 'john@example.com', status: 'active' }
     * ]);
     * ```
     */
    updateAsync<T = any>(externalKey: string, items: Record<string, any>[]): Promise<T>;
    /**
     * Deletes a record from a data extension
     *
     * @param externalKey - The external key of the data extension
     * @param primaryKey - The name of the primary key field
     * @param primaryKeyValue - The value of the primary key to delete
     * @returns A promise that resolves to the API response
     * @throws {SalesForceConfigError} If required parameters are missing
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * await dataExtensions.delete('customer-de', 'email', 'customer@example.com');
     * ```
     */
    delete<T = any>(externalKey: string, primaryKey: string, primaryKeyValue: string): Promise<T>;
    /**
     * Deletes multiple records from a data extension with automatic batching
     *
     * Automatically splits large datasets into batches to stay within API limits.
     * Default batch size is 1,000 records per API call.
     *
     * @param externalKey - The external key of the data extension
     * @param items - Array of items to delete with their key values
     * @param batchSize - Maximum number of records per batch (default: 1000)
     * @returns A promise that resolves to an array of API responses (one per batch)
     * @throws {SalesForceConfigError} If required parameters are missing or invalid
     * @throws {SalesForceAPIError} If any API request fails
     *
     * @example
     * ```typescript
     * // Delete multiple records by key
     * await dataExtensions.bulkDelete('customer-de', [
     *   { keys: { key: 'campaign_1' } },
     *   { keys: { key: 'campaign_2' } },
     *   { keys: { key: 'campaign_3' } }
     * ]);
     *
     * // Using different primary key field
     * await dataExtensions.bulkDelete('customer-de', [
     *   { keys: { subscriberkey: 'user@example.com' } },
     *   { keys: { subscriberkey: 'other@example.com' } }
     * ]);
     *
     * // Custom batch size for very large datasets
     * await dataExtensions.bulkDelete('customer-de', largeArray, 500);
     * ```
     */
    bulkDelete<T = any>(externalKey: string, items: Array<{
        keys: Record<string, any>;
    }>, batchSize?: number): Promise<T[]>;
    /**
     * Retrieves all rows from a data extension with automatic pagination
     *
     * @param externalKey - The external key of the data extension
     * @returns A promise that resolves to an array of all rows
     * @throws {SalesForceConfigError} If the external key is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const allRows = await dataExtensions.getAllRows('customer-de');
     * console.log(`Total rows: ${allRows.length}`);
     * ```
     */
    getAllRows(externalKey: string): Promise<DataExtensionRow[]>;
    /**
     * Clears all records from a data extension using bulk delete for improved performance
     *
     * @param externalKey - The external key of the data extension
     * @param primaryKey - The name of the primary key field (default: 'key')
     * @throws {SalesForceConfigError} If the external key is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * await dataExtensions.clearRecords('temp-de', 'id');
     * ```
     */
    clearRecords(externalKey: string, primaryKey?: string): Promise<void>;
    /**
     * Converts a JSON object into chunked values for storage in data extension fields
     *
     * Useful for storing large JSON objects that exceed single field size limits.
     *
     * @param data - The data object to convert
     * @param attribute - The base attribute name for the chunked fields
     * @param count - The number of fields to create (default: 4)
     * @param size - The maximum size of each chunk in characters (default: 3900)
     * @returns An object with keys like `${attribute}1`, `${attribute}2`, etc.
     *
     * @example
     * ```typescript
     * const largeObject = { /* large data * / };
     * const chunked = DataExtensions.jsonToValues(largeObject, 'json', 4, 3900);
     * // Returns: { json1: '...', json2: '...', json3: '...', json4: '...' }
     * ```
     */
    static jsonToValues(data: any, attribute: string, count?: number, size?: number): Record<string, string>;
}
//# sourceMappingURL=DataExtensions.d.ts.map