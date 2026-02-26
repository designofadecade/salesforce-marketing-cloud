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
//# sourceMappingURL=errors.js.map