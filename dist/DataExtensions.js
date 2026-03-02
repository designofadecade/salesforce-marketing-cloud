import { SalesForceAPIError, SalesForceConfigError } from './errors.js';
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
    #SF;
    /**
     * Creates a new DataExtensions API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance) {
        if (!salesForceInstance) {
            throw new SalesForceConfigError('SalesForce client instance is required');
        }
        this.#SF = salesForceInstance;
    }
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
    async get(externalKey) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        try {
            return await this.#SF.api(`/data/v1/customobjectdata/key/${externalKey}/rowset`, 'GET');
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get data extension: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/data/v1/customobjectdata/key/${externalKey}/rowset`, 'GET');
        }
    }
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
    async getData(externalKey, primaryKey, primaryKeyValue) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!primaryKey) {
            throw new SalesForceConfigError('Primary key field name is required');
        }
        if (primaryKeyValue === undefined || primaryKeyValue === null) {
            throw new SalesForceConfigError('Primary key value is required');
        }
        try {
            const resData = await this.#SF.api(`/data/v1/customobjectdata/key/${externalKey}/rowset?$filter=${primaryKey} eq '${primaryKeyValue}'`, 'GET');
            return resData?.items?.[0]?.values;
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get data: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/data/v1/customobjectdata/key/${externalKey}/rowset`, 'GET');
        }
    }
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
    async insert(externalKey, items) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new SalesForceConfigError('Items array is required and must not be empty');
        }
        try {
            return await this.#SF.api(`/hub/v1/dataevents/key:${encodeURIComponent(externalKey)}/rowset`, 'POST', items);
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to insert data: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/hub/v1/dataevents/key:${encodeURIComponent(externalKey)}/rowset`, 'POST');
        }
    }
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
    async update(externalKey, primaryKey, primaryKeyValue, values) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!primaryKey) {
            throw new SalesForceConfigError('Primary key field name is required');
        }
        if (primaryKeyValue === undefined || primaryKeyValue === null) {
            throw new SalesForceConfigError('Primary key value is required');
        }
        if (!values || Object.keys(values).length === 0) {
            throw new SalesForceConfigError('Update values are required');
        }
        try {
            return await this.#SF.api(`/hub/v1/dataevents/key:${externalKey}/rowset`, 'POST', [
                {
                    keys: {
                        [primaryKey]: primaryKeyValue,
                    },
                    values,
                },
            ]);
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/hub/v1/dataevents/key:${externalKey}/rowset`, 'POST');
        }
    }
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
    async insertAsync(externalKey, items) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new SalesForceConfigError('Items array is required and must not be empty');
        }
        try {
            return await this.#SF.api(`/data/v1/async/dataextensions/key:${encodeURIComponent(externalKey)}/rows`, 'POST', {
                items: items,
            });
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to insert data asynchronously: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/data/v1/async/dataextensions/key:${encodeURIComponent(externalKey)}/rows`, 'POST');
        }
    }
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
    async updateAsync(externalKey, items) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new SalesForceConfigError('Items array is required and must not be empty');
        }
        try {
            return await this.#SF.api(`/data/v1/async/dataextensions/key:${encodeURIComponent(externalKey)}/rows`, 'PUT', {
                items: items,
            });
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to update data asynchronously: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/data/v1/async/dataextensions/key:${encodeURIComponent(externalKey)}/rows`, 'PUT');
        }
    }
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
    async delete(externalKey, primaryKey, primaryKeyValue) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!primaryKey) {
            throw new SalesForceConfigError('Primary key field name is required');
        }
        if (primaryKeyValue === undefined || primaryKeyValue === null) {
            throw new SalesForceConfigError('Primary key value is required');
        }
        try {
            return await this.#SF.api(`/hub/v1/dataevents/key:${externalKey}/rowset/delete`, 'POST', [
                {
                    keys: {
                        [primaryKey]: primaryKeyValue,
                    },
                },
            ]);
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/hub/v1/dataevents/key:${externalKey}/rowset/delete`, 'POST');
        }
    }
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
    async getAllRows(externalKey) {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        let allRows = [];
        let page = 1;
        let hasMore = true;
        try {
            while (hasMore) {
                const data = await this.#SF.api(`/data/v1/customobjectdata/key/${externalKey}/rowset?$pageSize=500&$page=${page}`, 'GET');
                allRows = allRows.concat(data.items || []);
                hasMore = !!data.links?.next;
                page++;
            }
            return allRows;
        }
        catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get all rows: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/data/v1/customobjectdata/key/${externalKey}/rowset`, 'GET');
        }
    }
    /**
     * Clears all records from a data extension
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
    async clearRecords(externalKey, primaryKey = 'key') {
        if (!externalKey) {
            throw new SalesForceConfigError('Data extension external key is required');
        }
        if (!primaryKey) {
            throw new SalesForceConfigError('Primary key field name is required');
        }
        const allRows = await this.getAllRows(externalKey);
        for (const row of allRows) {
            const primaryKeyValue = row.keys[primaryKey];
            if (primaryKeyValue) {
                await this.delete(externalKey, primaryKey, String(primaryKeyValue));
            }
        }
    }
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
    static jsonToValues(data, attribute, count = 4, size = 3900) {
        if (!attribute) {
            throw new SalesForceConfigError('Attribute name is required');
        }
        if (count < 1) {
            throw new SalesForceConfigError('Count must be at least 1');
        }
        if (size < 1) {
            throw new SalesForceConfigError('Size must be at least 1');
        }
        const text = JSON.stringify(data);
        const maxSize = count * size;
        if (text.length > maxSize) {
            throw new SalesForceConfigError(`Data size (${text.length} characters) exceeds maximum allowed size (${maxSize} characters). ` +
                `Increase count or size parameters, or reduce data size.`);
        }
        const chunks = [];
        for (let i = 0; i < text.length; i += size) {
            chunks.push(text.slice(i, i + size));
        }
        const values = {};
        for (let i = 1; i <= count; i++) {
            values[`${attribute}${i}`] = chunks[i - 1] ? chunks[i - 1] : '';
        }
        return values;
    }
}
//# sourceMappingURL=DataExtensions.js.map