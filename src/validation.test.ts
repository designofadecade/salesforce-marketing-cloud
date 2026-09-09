import { describe, it, expect, vi, beforeEach } from 'vitest';
import Assets from './Assets.js';
import AutomationStudio from './AutomationStudio.js';
import DataExtensions from './DataExtensions.js';
import type SalesForceClient from './SalesForceClient.js';
import { SalesForceAPIError, SalesForceConfigError } from './errors.js';

/**
 * Systematic coverage of argument validation and error-wrapping paths.
 *
 * Every public method validates its arguments and wraps unexpected failures in a
 * SalesForceAPIError. Both paths are easy to regress silently, so they are
 * exercised here in one place rather than scattered across the per-class suites.
 */
describe('validation and error paths', () => {
    let api: ReturnType<typeof vi.fn>;
    let client: SalesForceClient;
    let assets: Assets;
    let automation: AutomationStudio;
    let de: DataExtensions;

    beforeEach(() => {
        api = vi.fn();
        client = { api } as unknown as SalesForceClient;
        assets = new Assets(client);
        automation = new AutomationStudio(client);
        de = new DataExtensions(client);
    });

    describe('constructors reject a missing client', () => {
        it.each([
            ['Assets', () => new Assets(undefined as never)],
            ['AutomationStudio', () => new AutomationStudio(undefined as never)],
            ['DataExtensions', () => new DataExtensions(undefined as never)],
        ])('%s', (_name, build) => {
            expect(build).toThrow(SalesForceConfigError);
        });
    });

    describe('required arguments', () => {
        it('should reject missing arguments with SalesForceConfigError', async () => {
            const cases: Array<[string, () => Promise<unknown>]> = [
                ['assets.update no id', () => assets.update('', { a: 1 })],
                ['assets.update no data', () => assets.update('id', null as never)],
                ['automation.get', () => automation.get('')],
                ['automation.activate no id', () => automation.activate('', '2026-01-01T00:00:00', 76)],
                ['automation.activate no date', () => automation.activate('id', '', 76)],
                ['automation.pause', () => automation.pause('')],
                ['automation.delete', () => automation.delete('')],
                ['automation.run', () => automation.run('')],
                ['de.get', () => de.get('')],
                ['de.getData no key', () => de.getData('', 'id', '1')],
                ['de.getData no field', () => de.getData('k', '', '1')],
                ['de.getData no value', () => de.getData('k', 'id', null as never)],
                ['de.insert no key', () => de.insert('', [{ keys: {}, values: {} }])],
                ['de.insert empty items', () => de.insert('k', [])],
                ['de.update no key', () => de.update('', 'id', '1', { a: 1 })],
                ['de.update no field', () => de.update('k', '', '1', { a: 1 })],
                ['de.update no value', () => de.update('k', 'id', null as never, { a: 1 })],
                ['de.update no values', () => de.update('k', 'id', '1', null as never)],
                ['de.insertAsync no key', () => de.insertAsync('', [{ a: 1 }])],
                ['de.insertAsync empty', () => de.insertAsync('k', [])],
                ['de.updateAsync no key', () => de.updateAsync('', [{ a: 1 }])],
                ['de.updateAsync empty', () => de.updateAsync('k', [])],
                ['de.delete no key', () => de.delete('', 'id', '1')],
                ['de.delete no field', () => de.delete('k', '', '1')],
                ['de.delete no value', () => de.delete('k', 'id', null as never)],
                ['de.bulkDelete no key', () => de.bulkDelete('', [{ keys: {} }])],
                ['de.bulkDelete empty', () => de.bulkDelete('k', [])],
                ['de.getAllRows', () => de.getAllRows('')],
                ['de.clearRecords no key', () => de.clearRecords('')],
                ['de.clearRecords no field', () => de.clearRecords('k', '')],
            ];

            for (const [label, run] of cases) {
                await expect(run(), label).rejects.toBeInstanceOf(SalesForceConfigError);
            }
            // No validation failure should have reached the network.
            expect(api).not.toHaveBeenCalled();
        });
    });

    describe('unexpected failures are wrapped with a sanitized cause', () => {
        it('should wrap a transport error from every method', async () => {
            const TOKEN = 'ZZ-TOKEN-ZZ';
            const makeTransportError = () =>
                Object.assign(new Error('socket hang up'), {
                    name: 'AxiosError',
                    code: 'ECONNRESET',
                    config: { data: `<fueloauth>${TOKEN}</fueloauth>` },
                });

            const cases: Array<[string, () => Promise<unknown>]> = [
                ['assets.list', () => assets.list()],
                ['assets.update', () => assets.update('id', { a: 1 })],
                ['automation.endpoints', () => automation.endpoints()],
                ['automation.getAll', () => automation.getAll()],
                ['automation.get', () => automation.get('k')],
                ['automation.create', () => automation.create({ name: 'n' })],
                ['automation.run', () => automation.run('id')],
                ['automation.delete', () => automation.delete('id')],
                ['de.get', () => de.get('k')],
                ['de.getData', () => de.getData('k', 'id', '1')],
                ['de.insert', () => de.insert('k', [{ keys: {}, values: {} }])],
                ['de.update', () => de.update('k', 'id', '1', { a: 1 })],
                ['de.insertAsync', () => de.insertAsync('k', [{ a: 1 }])],
                ['de.updateAsync', () => de.updateAsync('k', [{ a: 1 }])],
                ['de.delete', () => de.delete('k', 'id', '1')],
                ['de.bulkDelete', () => de.bulkDelete('k', [{ keys: { id: '1' } }])],
                ['de.getAllRows', () => de.getAllRows('k')],
            ];

            for (const [label, run] of cases) {
                api.mockReset();
                api.mockRejectedValue(makeTransportError());

                const thrown = await run().catch(e => e);

                expect(thrown, label).toBeInstanceOf(SalesForceAPIError);
                expect(thrown.statusCode, label).toBe(500);
                expect(thrown.cause, label).toEqual({
                    name: 'AxiosError',
                    message: 'socket hang up',
                    code: 'ECONNRESET',
                });
                expect(JSON.stringify(thrown.cause), label).not.toContain(TOKEN);
            }
        });
    });

    describe('non-Error rejections', () => {
        // The `error instanceof Error ? error.message : 'Unknown error'` fallback
        // fires when a dependency rejects with a non-Error value.
        it('should describe a non-Error rejection as Unknown error', async () => {
            const cases: Array<[string, () => Promise<unknown>]> = [
                ['assets.list', () => assets.list()],
                ['automation.getAll', () => automation.getAll()],
                ['de.get', () => de.get('k')],
                ['de.insert', () => de.insert('k', [{ keys: {}, values: {} }])],
                ['de.bulkDelete', () => de.bulkDelete('k', [{ keys: { id: '1' } }])],
                ['de.getAllRows', () => de.getAllRows('k')],
            ];

            for (const [label, run] of cases) {
                api.mockReset();
                api.mockRejectedValue('a plain string');

                const thrown = await run().catch(e => e);

                expect(thrown, label).toBeInstanceOf(SalesForceAPIError);
                expect(thrown.message, label).toContain('Unknown error');
            }
        });
    });

    describe('SDK errors pass through untouched', () => {
        it('should re-throw an existing SalesForceAPIError unchanged', async () => {
            const original = new SalesForceAPIError('original', 404, '/x', 'GET');
            const cases: Array<[string, () => Promise<unknown>]> = [
                ['assets.list', () => assets.list()],
                ['assets.update', () => assets.update('id', { a: 1 })],
                ['automation.getAll', () => automation.getAll()],
                ['automation.get', () => automation.get('k')],
                ['automation.create', () => automation.create({})],
                ['automation.run', () => automation.run('id')],
                ['automation.endpoints', () => automation.endpoints()],
                ['automation.delete', () => automation.delete('id')],
                ['de.getData', () => de.getData('k', 'id', '1')],
                ['de.update', () => de.update('k', 'id', '1', { a: 1 })],
                ['de.insertAsync', () => de.insertAsync('k', [{ a: 1 }])],
                ['de.updateAsync', () => de.updateAsync('k', [{ a: 1 }])],
                ['de.delete', () => de.delete('k', 'id', '1')],
                ['de.getAllRows', () => de.getAllRows('k')],
            ];

            for (const [label, run] of cases) {
                api.mockReset();
                api.mockRejectedValue(original);
                await expect(run(), label).rejects.toBe(original);
            }
        });
    });

    describe('malformed identifiers', () => {
        // encodeURIComponent throws a raw URIError for a lone surrogate, which would
        // escape the SDK error hierarchy entirely.
        it.each([
            ['de.get', () => de.get('\uD800')],
            ['de.getData key', () => de.getData('\uD800', 'id', '1')],
            ['de.getData value', () => de.getData('k', 'id', '\uD800')],
            ['de.insert', () => de.insert('\uD800', [{ keys: {}, values: {} }])],
            ['de.getAllRows', () => de.getAllRows('\uD800')],
            ['automation.get', () => automation.get('\uD800')],
            ['automation.run', () => automation.run('\uD800')],
            ['assets.update', () => assets.update('\uD800', { a: 1 })],
        ])('should reject %s with SalesForceConfigError, not URIError', async (_l, run) => {
            const thrown = await run().catch(e => e);
            expect(thrown).toBeInstanceOf(SalesForceConfigError);
            expect(thrown).not.toBeInstanceOf(URIError);
        });
    });

    describe('getAll query parameters', () => {
        // page/pageSize are interpolated into the query string; untyped callers could
        // otherwise append their own parameters.
        it.each([
            ['string page', { page: "1&$filter=name eq 'x'" }],
            ['float page', { page: 1.5 }],
            ['string pageSize', { pageSize: '5#' }],
            ['zero pageSize', { pageSize: 0 }],
            ['NaN pageSize', { pageSize: NaN }],
        ])('should reject %s', async (_l, opts) => {
            await expect(
                automation.getAll(opts as never)
            ).rejects.toBeInstanceOf(SalesForceConfigError);
            expect(api).not.toHaveBeenCalled();
        });
    });

    describe('bulkDelete failure context', () => {
        // api() wraps every HTTP failure as a SalesForceAPIError, so a plain
        // passthrough here would discard the progress information entirely.
        it('should add progress to an API error while preserving its status', async () => {
            const original = new SalesForceAPIError('Error: 404 Not Found', 404, '/p', 'POST');
            api.mockResolvedValueOnce({ ok: true }).mockRejectedValue(original);

            const thrown = await de
                .bulkDelete('k', [{ keys: { id: '1' } }, { keys: { id: '2' } }], 1)
                .catch(e => e);

            expect(thrown).toBeInstanceOf(SalesForceAPIError);
            expect(thrown.statusCode).toBe(404);
            expect(thrown.message).toContain('Error: 404 Not Found');
            expect(thrown.message).toContain('batch 2 of 2 failed');
            expect(thrown.message).toContain('1 of 2 batches completed');
            expect(thrown.cause).toBe(original);
        });
    });

    describe('activate timezone selection', () => {
        // An unmapped timezone id falls through to the raw date string rather than
        // the Marketing Cloud offset workaround. Asserting the offset *shape* only,
        // so this does not pin the deliberate timezone behaviour in activate().
        it('should pass the date through unchanged for an unmapped timezone', async () => {
            const soap = {
                addSoapHeader: vi.fn(),
                ScheduleAsync: vi.fn().mockResolvedValue([{ OverallStatus: 'OK' }]),
            };
            const c = { api, soapClient: vi.fn().mockResolvedValue(soap) };
            const a = new AutomationStudio(c as unknown as SalesForceClient);

            await a.activate('id', '2026-03-01T10:00:00', 999);

            const sent = soap.ScheduleAsync.mock.calls[0][0];
            expect(JSON.stringify(sent)).toContain('2026-03-01T10:00:00');
        });

        it('should emit a padded offset for a mapped timezone', async () => {
            const soap = {
                addSoapHeader: vi.fn(),
                ScheduleAsync: vi.fn().mockResolvedValue([{ OverallStatus: 'OK' }]),
            };
            const c = { api, soapClient: vi.fn().mockResolvedValue(soap) };
            const a = new AutomationStudio(c as unknown as SalesForceClient);

            await a.activate('id', '2026-03-01T10:00:00', 76);

            const sent = JSON.stringify(soap.ScheduleAsync.mock.calls[0][0]);
            expect(sent).toMatch(/[+-]\d{2}:\d{2}/);
        });
    });

    describe('DataExtensions.jsonToValues', () => {
        it('should chunk a value across fields', () => {
            const out = DataExtensions.jsonToValues({ a: 'x'.repeat(10) }, 'json', 4, 10);
            expect(Object.keys(out)).toEqual(['json1', 'json2', 'json3', 'json4']);
            expect(Object.values(out).join('')).toBe(JSON.stringify({ a: 'x'.repeat(10) }));
        });

        it.each([
            ['missing attribute', () => DataExtensions.jsonToValues({}, '')],
            ['count below 1', () => DataExtensions.jsonToValues({}, 'j', 0)],
            ['size below 1', () => DataExtensions.jsonToValues({}, 'j', 4, 0)],
            ['data too large', () => DataExtensions.jsonToValues({ a: 'x'.repeat(500) }, 'j', 1, 10)],
        ])('should reject %s', (_label, run) => {
            expect(run).toThrow(SalesForceConfigError);
        });
    });

    describe('clearRecords edge cases', () => {
        it('should make no delete call for an empty data extension', async () => {
            api.mockResolvedValueOnce({ items: [], links: {} });

            await de.clearRecords('k', 'id');

            expect(api).toHaveBeenCalledTimes(1);
        });

        it('should skip rows missing the primary key field entirely', async () => {
            api.mockResolvedValueOnce({
                items: [{ keys: { other: 'x' } }, { keys: {} }],
                links: {},
            }).mockResolvedValue({ ok: true });

            await de.clearRecords('k', 'id');

            // Every row lacked `id`, so there was nothing to delete.
            expect(api).toHaveBeenCalledTimes(1);
        });
    });
});
