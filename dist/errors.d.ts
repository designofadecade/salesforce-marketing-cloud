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
//# sourceMappingURL=errors.d.ts.map