var _a;
import { SalesForceAPIError, SalesForceConfigError, toSafeCause, isSalesForceError, encodeParam, } from './errors.js';
/**
 * Automation Studio API client for Salesforce Marketing Cloud
 *
 * Provides methods for managing automations in Marketing Cloud,
 * including creating, retrieving, activating, pausing, and running automations.
 *
 * @example
 * ```typescript
 * const client = new SalesForceClient({ ... });
 * const automation = new AutomationStudio(client);
 *
 * // Get all automations
 * const automations = await automation.getAll();
 *
 * // Run an automation
 * await automation.run('automation-id');
 * ```
 */
class AutomationStudio {
    /**
     * Upper bound on pages fetched by {@link AutomationStudio.getAll}.
     *
     * Pagination stops when the API stops advertising a next link. This cap is the
     * backstop for a server that always advertises one, which would otherwise loop
     * until the process exhausts memory.
     */
    static MAX_PAGES = 1000;
    /** Timezone ID for America/Toronto (Eastern Time) */
    static TIME_ZONE_AMERICA_TORONTO = 76;
    /** Timezone ID for America/Chicago (Central Time) */
    static TIME_ZONE_AMERICA_CHICAGO = 27;
    /** Mapping of timezone IDs to IANA timezone names */
    static TIMEZONE_MAP = {
        76: 'America/Toronto',
        27: 'America/Chicago',
    };
    #SF;
    /**
     * Creates a new AutomationStudio API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance) {
        if (!salesForceInstance) {
            throw new SalesForceConfigError('SalesForce client instance is required');
        }
        this.#SF = salesForceInstance;
    }
    /**
     * Retrieves available automation endpoints
     *
     * @returns A promise that resolves to the endpoints configuration
     * @throws {SalesForceAPIError} If the API request fails
     */
    async endpoints() {
        try {
            return await this.#SF.api(`/automation/v1/rest`, 'GET');
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get automation endpoints: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, '/automation/v1/rest', 'GET', { cause: toSafeCause(error) });
        }
    }
    async getAll(options) {
        const { page: requestedPage, pageSize = 500 } = options || {};
        // These are interpolated into the query string. They are typed as numbers,
        // but nothing enforces that at runtime, so a string reaching here from
        // untyped code (req.query.page, for instance) could append parameters.
        if (requestedPage !== undefined && !Number.isInteger(requestedPage)) {
            throw new SalesForceConfigError('page must be an integer');
        }
        if (!Number.isInteger(pageSize) || pageSize < 1) {
            throw new SalesForceConfigError('pageSize must be a positive integer');
        }
        try {
            // If specific page requested, return single page response
            if (requestedPage !== undefined) {
                return await this.#SF.api(`/automation/v1/automations?$page=${requestedPage}&$pageSize=${pageSize}`, 'GET');
            }
            // Otherwise, fetch all pages automatically
            let allAutomations = [];
            let page = 1;
            let hasMore = true;
            while (hasMore) {
                // A server that always advertises a next link would otherwise loop
                // forever, accumulating results until the process runs out of memory.
                if (page > _a.MAX_PAGES) {
                    throw new SalesForceAPIError(`Pagination exceeded ${_a.MAX_PAGES} pages; aborting to avoid an unbounded loop`, 500, '/automation/v1/automations', 'GET');
                }
                const data = await this.#SF.api(`/automation/v1/automations?$page=${page}&$pageSize=${pageSize}`, 'GET');
                allAutomations = allAutomations.concat(data.items || []);
                hasMore = !!data.links?.next;
                page++;
            }
            return allAutomations;
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get automations: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, '/automation/v1/automations', 'GET', { cause: toSafeCause(error) });
        }
    }
    /**
     * Retrieves a specific automation by its external key
     *
     * @param externalKey - The external key of the automation
     * @returns A promise that resolves to the automation details
     * @throws {SalesForceConfigError} If the external key is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const automation = await automationStudio.get('my-automation-key');
     * console.log(automation.name);
     * ```
     */
    async get(externalKey) {
        if (!externalKey) {
            throw new SalesForceConfigError('Automation external key is required');
        }
        try {
            return await this.#SF.api(`/automation/v1/automations/${encodeParam(externalKey, 'External key')}`, 'GET');
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to get automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/automation/v1/automations/${encodeParam(externalKey, 'External key')}`, 'GET', { cause: toSafeCause(error) });
        }
    }
    /**
     * Creates a new scheduled automation
     *
     * @param options - Configuration options for the automation
     * @param options.name - Name of the automation
     * @param options.description - Description of the automation
     * @param options.steps - Array of automation steps with activities
     * @param options.startDate - Start date in ISO 8601 format
     * @param options.timeZoneId - Timezone ID
     * @returns A promise that resolves to the created automation
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const newAutomation = await automationStudio.create({
     *   name: 'My Custom Automation',
     *   description: 'Sends daily email',
     *   startDate: '2026-03-01T09:00:00',
     *   timeZoneId: AutomationStudio.TIME_ZONE_AMERICA_CHICAGO,
     *   steps: [{
     *     stepNumber: 0,
     *     activities: [{
     *       name: 'Send Email',
     *       objectTypeId: 42,
     *       displayOrder: 1,
     *       activityObjectId: 'your-activity-id'
     *     }]
     *   }]
     * });
     * ```
     */
    async create(options = {}) {
        const { name, description, steps, startDate, timeZoneId } = options;
        try {
            return await this.#SF.api(`/automation/v1/automations`, 'POST', {
                name,
                description,
                steps,
                startSource: {
                    typeId: 1,
                    schedule: {
                        timezoneId: timeZoneId,
                        occurrences: 1,
                        icalRecur: 'FREQ=DAILY;COUNT=1;INTERVAL=1',
                        startDate,
                    },
                },
            });
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to create automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, '/automation/v1/automations', 'POST', { cause: toSafeCause(error) });
        }
    }
    /**
     * Activates (schedules) an automation to run at a specified time
     *
     * @param automationId - The ID of the automation to activate
     * @param date - The date/time to start the automation (ISO 8601 format)
     * @param timeZoneId - The timezone ID (default: AutomationStudio.TIME_ZONE_AMERICA_TORONTO)
     * @returns A promise that resolves to true if activation was successful, false otherwise
     * @throws {SalesForceConfigError} If required parameters are missing
     * @throws {Error} If the SOAP request fails
     *
     * @example
     * ```typescript
     * const success = await automationStudio.activate(
     *   'automation-id',
     *   '2026-03-01T10:00:00',
     *   AutomationStudio.TIME_ZONE_AMERICA_TORONTO
     * );
     * ```
     */
    async activate(automationId, date, timeZoneId = _a.TIME_ZONE_AMERICA_TORONTO) {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }
        if (!date) {
            throw new SalesForceConfigError('Start date is required');
        }
        try {
            const soapClient = await this.#SF.soapClient();
            const scheduleOptions = {
                Action: 'start',
                Schedule: {
                    Recurrence: {
                        attributes: {
                            'xsi:type': 'DailyRecurrence',
                        },
                        DailyRecurrencePatternType: 'Interval',
                        DayInterval: 1,
                    },
                    Occurrences: 1,
                    StartDateTime: _a.TIMEZONE_MAP[timeZoneId]
                        ? this.#getFormattedDateForTimezone(date, timeZoneId)
                        : date,
                    RecurrenceType: 'Daily',
                    RecurrenceRangeType: 'EndAfter',
                    TimeZone: {
                        ID: timeZoneId,
                    },
                },
                Interactions: {
                    Interaction: {
                        attributes: {
                            'xsi:type': 'Automation',
                        },
                        ObjectID: automationId,
                    },
                },
            };
            const soapRes = await soapClient.ScheduleAsync(scheduleOptions);
            return soapRes[0]?.OverallStatus === 'OK';
        }
        catch (error) {
            throw new Error(`Failed to activate automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            // Attaching the raw error would leak the access token carried in its
            // axios request config; toSafeCause preserves name, message and code.
            // eslint-disable-next-line preserve-caught-error
            { cause: toSafeCause(error) });
        }
    }
    /**
     * Pauses a running automation
     *
     * @param automationId - The ID of the automation to pause
     * @returns A promise that resolves to true if pause was successful, false otherwise
     * @throws {SalesForceConfigError} If the automation ID is not provided
     * @throws {Error} If the SOAP request fails
     *
     * @example
     * ```typescript
     * const success = await automationStudio.pause('automation-id');
     * ```
     */
    async pause(automationId) {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }
        try {
            const soapClient = await this.#SF.soapClient();
            const scheduleOptions = {
                Action: 'pause',
                Interactions: {
                    Interaction: {
                        attributes: {
                            'xsi:type': 'Automation',
                        },
                        ObjectID: automationId,
                    },
                },
            };
            const soapRes = await soapClient.ScheduleAsync(scheduleOptions);
            return soapRes[0]?.OverallStatus === 'OK';
        }
        catch (error) {
            throw new Error(`Failed to pause automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 
            // Attaching the raw error would leak the access token carried in its
            // axios request config; toSafeCause preserves name, message and code.
            // eslint-disable-next-line preserve-caught-error
            { cause: toSafeCause(error) });
        }
    }
    /**
     * Deletes an automation
     *
     * @param automationId - The ID of the automation to delete
     * @returns The API response, if the endpoint returns one
     * @throws {SalesForceConfigError} If the automation ID is missing
     * @throws {SalesForceAPIError} If the request fails
     *
     * @example
     * ```typescript
     * await automationStudio.delete('automation-id');
     * ```
     */
    async delete(automationId) {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }
        try {
            return await this.#SF.api(`/automation/v1/automations/${encodeParam(automationId, 'Automation ID')}`, 'DELETE');
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to delete automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/automation/v1/automations/${encodeParam(automationId, 'Automation ID')}`, 'DELETE', { cause: toSafeCause(error) });
        }
    }
    /**
     * Runs an automation immediately (run once)
     *
     * @param automationId - The ID of the automation to run
     * @returns A promise that resolves to the run execution details
     * @throws {SalesForceConfigError} If the automation ID is not provided
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const result = await automationStudio.run('automation-id');
     * console.log(`Automation started at ${result.executedDate}`);
     * ```
     */
    async run(automationId) {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }
        try {
            return await this.#SF.api(`/automation/v1/automations/${encodeParam(automationId, 'Automation ID')}/actions/runallonce`, 'POST');
        }
        catch (error) {
            if (isSalesForceError(error)) {
                throw error;
            }
            throw new SalesForceAPIError(`Failed to run automation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, `/automation/v1/automations/${encodeParam(automationId, 'Automation ID')}/actions/runallonce`, 'POST', { cause: toSafeCause(error) });
        }
    }
    /**
     * Formats a date string for a specific timezone
     *
     * @private
     * @param dateStr - The date string to format
     * @param timeZoneId - The timezone ID to format for
     * @returns The formatted date string with timezone offset
     */
    #getFormattedDateForTimezone(dateStr, timeZoneId) {
        const timeZoneName = _a.TIMEZONE_MAP[timeZoneId];
        if (!timeZoneName) {
            throw new Error(`Unsupported timezone ID: ${timeZoneId}`);
        }
        // NOTE: Deliberate, do not "fix".
        //
        // `dateStr` is parsed as local time, converted to UTC, and then stamped with
        // the *target* timezone's offset. That is not what a strict ISO 8601 reading
        // would produce, and it makes the result depend on the host's timezone.
        //
        // This is a workaround for Marketing Cloud's handling of Schedule
        // StartDateTime, arrived at empirically because the documented behaviour did
        // not hold. Correcting this to a timezone-independent conversion changes the
        // times SFMC actually schedules and regresses live automations.
        //
        // If this needs revisiting, verify against a real SFMC instance rather than
        // against the ISO 8601 spec.
        const date = new Date(dateStr);
        const isoWithoutZ = date.toISOString().split('Z')[0];
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZoneName,
            timeZoneName: 'shortOffset',
        }).formatToParts(date);
        const offsetName = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
        let offset = offsetName.replace('GMT', '');
        if (!offset.includes(':')) {
            offset += ':00';
        }
        if (offset.startsWith('-') && offset.length === 5) {
            offset = '-0' + offset.slice(1);
        }
        if (offset.startsWith('+') && offset.length === 5) {
            offset = '+0' + offset.slice(1);
        }
        return `${isoWithoutZ}${offset}`;
    }
}
_a = AutomationStudio;
export default AutomationStudio;
//# sourceMappingURL=AutomationStudio.js.map