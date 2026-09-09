/**
 * Custom error class for Salesforce Marketing Cloud API errors
 */
export declare class SalesForceAPIError extends Error {
    readonly statusCode: number;
    readonly endpoint?: string;
    readonly method?: string;
    constructor(message: string, statusCode: number, endpoint?: string, method?: string, options?: ErrorOptions);
}
/**
 * Custom error class for authentication errors
 */
export declare class SalesForceAuthError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number, options?: ErrorOptions);
}
/**
 * Custom error class for configuration errors
 */
export declare class SalesForceConfigError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/**
 * Extracts a minimal, non-sensitive summary of a caught error for use as an
 * error `cause`.
 *
 * Transport-level failures from the `soap` client reject with a raw axios
 * error whose `config.data` holds the complete SOAP request envelope. For
 * authenticated calls that envelope contains the `<fueloauth>` access token,
 * so attaching such an error directly as `cause` exposes a live token to any
 * logger that serialises the error chain (`util.inspect`, `console.error` and
 * `AxiosError.toJSON` all do). Only identifying fields are retained here.
 *
 * @param error - The caught error, of unknown shape
 * @returns A plain object safe to attach as `cause` and to log
 */
export declare function toSafeCause(error: unknown): {
    name?: string;
    code?: string;
    message?: string;
};
/**
 * Narrows an unknown caught value to one of this SDK's error classes.
 *
 * Wrapper methods use this to re-throw SDK errors unchanged instead of
 * flattening them into a generic `SalesForceAPIError`, which would discard the
 * real status code and make an authentication failure indistinguishable from a
 * server error.
 *
 * @param error - The caught error, of unknown shape
 * @returns True if the value is a SalesForce SDK error
 */
export declare function isSalesForceError(error: unknown): error is SalesForceAPIError | SalesForceAuthError | SalesForceConfigError;
//# sourceMappingURL=errors.d.ts.map