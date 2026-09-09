import { describe, it, expect } from 'vitest';
import util from 'node:util';
import {
    SalesForceAPIError,
    SalesForceAuthError,
    SalesForceConfigError,
    toSafeCause,
} from './errors.js';

describe('errors', () => {
    describe('error classes', () => {
        it('should expose name and metadata on SalesForceAPIError', () => {
            const err = new SalesForceAPIError('boom', 404, '/x', 'GET');
            expect(err).toBeInstanceOf(Error);
            expect(err.name).toBe('SalesForceAPIError');
            expect(err.statusCode).toBe(404);
            expect(err.endpoint).toBe('/x');
            expect(err.method).toBe('GET');
        });

        it('should expose statusCode on SalesForceAuthError', () => {
            const err = new SalesForceAuthError('nope', 401);
            expect(err.name).toBe('SalesForceAuthError');
            expect(err.statusCode).toBe(401);
        });

        it('should name SalesForceConfigError', () => {
            expect(new SalesForceConfigError('bad').name).toBe('SalesForceConfigError');
        });
    });

    describe('toSafeCause', () => {
        // Transport errors from soap/axios carry the full request envelope on
        // `config.data`, which for authenticated SOAP calls contains the
        // <fueloauth> access token. Attaching one as `cause` leaks it to loggers.
        it('should not carry an access token from an axios-shaped error', () => {
            const TOKEN = 'ZZ-SECRET-ACCESS-TOKEN-ZZ';
            const axiosLike = Object.assign(new Error('connect ECONNREFUSED'), {
                name: 'AxiosError',
                code: 'ECONNREFUSED',
                config: {
                    url: 'https://t.soap.marketingcloudapis.com',
                    data: `<soap:Header><fueloauth>${TOKEN}</fueloauth></soap:Header>`,
                },
            });

            const safe = toSafeCause(axiosLike);
            const wrapped = new Error('Failed to activate automation', { cause: safe });

            expect(JSON.stringify(safe)).not.toContain(TOKEN);
            expect(util.inspect(wrapped, { depth: null })).not.toContain(TOKEN);
            expect(util.format(wrapped)).not.toContain(TOKEN);
            expect(safe).not.toHaveProperty('config');
        });

        it('should retain identifying fields for debugging', () => {
            const err = Object.assign(new Error('timed out'), {
                name: 'AxiosError',
                code: 'ETIMEDOUT',
            });
            expect(toSafeCause(err)).toEqual({
                name: 'AxiosError',
                message: 'timed out',
                code: 'ETIMEDOUT',
            });
        });

        it('should omit code when it is not a string', () => {
            const err = Object.assign(new Error('x'), { code: 500 });
            expect(toSafeCause(err)).not.toHaveProperty('code');
        });

        it('should handle non-Error values', () => {
            expect(toSafeCause('plain string')).toEqual({ message: 'plain string' });
            expect(toSafeCause(undefined)).toEqual({ message: 'Unknown error' });
            expect(toSafeCause({ weird: true })).toEqual({ message: 'Unknown error' });
        });
    });
});
