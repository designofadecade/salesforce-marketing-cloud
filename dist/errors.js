/**
 * Custom error class for Salesforce Marketing Cloud API errors
 */
export class SalesForceAPIError extends Error {
    statusCode;
    endpoint;
    method;
    constructor(message, statusCode, endpoint, method) {
        super(message);
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
    constructor(message, statusCode) {
        super(message);
        this.name = 'SalesForceAuthError';
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Custom error class for configuration errors
 */
export class SalesForceConfigError extends Error {
    constructor(message) {
        super(message);
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
//# sourceMappingURL=errors.js.map