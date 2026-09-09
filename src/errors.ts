/**
 * Custom error class for Salesforce Marketing Cloud API errors
 */
export class SalesForceAPIError extends Error {
    public readonly statusCode: number;
    public readonly endpoint?: string;
    public readonly method?: string;

    constructor(
        message: string,
        statusCode: number,
        endpoint?: string,
        method?: string,
        options?: ErrorOptions
    ) {
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
    public readonly statusCode: number;

    constructor(message: string, statusCode: number, options?: ErrorOptions) {
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
    constructor(message: string, options?: ErrorOptions) {
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
export function toSafeCause(error: unknown): {
    name?: string;
    code?: string;
    message?: string;
} {
    if (!(error instanceof Error)) {
        return { message: typeof error === 'string' ? error : 'Unknown error' };
    }

    const code = (error as Error & { code?: unknown }).code;

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
export function isSalesForceError(
    error: unknown
): error is SalesForceAPIError | SalesForceAuthError | SalesForceConfigError {
    return (
        error instanceof SalesForceAPIError ||
        error instanceof SalesForceAuthError ||
        error instanceof SalesForceConfigError
    );
}
