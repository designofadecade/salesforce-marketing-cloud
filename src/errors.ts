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
        method?: string
    ) {
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
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
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
    constructor(message: string) {
        super(message);
        this.name = 'SalesForceConfigError';
        Error.captureStackTrace(this, this.constructor);
    }
}
