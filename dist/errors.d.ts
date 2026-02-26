/**
 * Custom error class for Salesforce Marketing Cloud API errors
 */
export declare class SalesForceAPIError extends Error {
    readonly statusCode: number;
    readonly endpoint?: string;
    readonly method?: string;
    constructor(message: string, statusCode: number, endpoint?: string, method?: string);
}
/**
 * Custom error class for authentication errors
 */
export declare class SalesForceAuthError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
/**
 * Custom error class for configuration errors
 */
export declare class SalesForceConfigError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map