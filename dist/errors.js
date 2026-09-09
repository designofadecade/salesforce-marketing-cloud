/**
 * Custom error class for Salesforce Marketing Cloud API errors
 */
export class SalesForceAPIError extends Error {
    statusCode;
    endpoint;
    method;
    constructor(message, statusCode, endpoint, method, options) {
        super(message, options);
        this.name = 'SalesForceAPIError';
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.method = method;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Custom error class for authentication errors
 */
export class SalesForceAuthError extends Error {
    statusCode;
    constructor(message, statusCode, options) {
        super(message, options);
        this.name = 'SalesForceAuthError';
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Custom error class for configuration errors
 */
export class SalesForceConfigError extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'SalesForceConfigError';
        Error.captureStackTrace(this, this.constructor);
    }
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
export function toSafeCause(error) {
    if (!(error instanceof Error)) {
        return { message: typeof error === 'string' ? error : 'Unknown error' };
    }
    const code = error.code;
    return {
        name: error.name,
        message: error.message,
        ...(typeof code === 'string' ? { code } : {}),
    };
}
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
export function isSalesForceError(error) {
    return (error instanceof SalesForceAPIError ||
        error instanceof SalesForceAuthError ||
        error instanceof SalesForceConfigError);
}
/**
 * Percent-encodes a value for use in a URL path segment or query value.
 *
 * `encodeURIComponent` throws a raw `URIError` for a lone surrogate, which would
 * escape the SDK's error hierarchy and bypass a caller's `SalesForceConfigError`
 * handling. Malformed input is a caller mistake, so it is reported as one.
 *
 * @param value - The value to encode
 * @param label - Human-readable name of the parameter, used in the error message
 * @returns The percent-encoded value
 * @throws {SalesForceConfigError} If the value cannot be encoded
 */
export function encodeParam(value, label) {
    try {
        return encodeURIComponent(value);
    }
    catch {
        throw new SalesForceConfigError(`${label} contains characters that cannot be encoded for a URL`);
    }
}
//# sourceMappingURL=errors.js.map