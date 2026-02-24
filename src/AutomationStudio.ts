import type SalesForceClient from './SalesForceClient.js';
import { SalesForceAPIError, SalesForceConfigError } from './errors.js';
import type {
    AutomationResponse,
    AutomationsListResponse,
    ScheduleOptions,
    CreateAutomationOptions,
} from './types.js';

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
export default class AutomationStudio {
    /** Timezone ID for America/Toronto (Eastern Time) */
    static readonly TIME_ZONE_AMERICA_TORONTO = 76;

    /** Timezone ID for America/Chicago (Central Time) */
    static readonly TIME_ZONE_AMERICA_CHICAGO = 27;

    /** Mapping of timezone IDs to IANA timezone names */
    private static readonly TIMEZONE_MAP: Record<number, string> = {
        76: 'America/Toronto',
        27: 'America/Chicago',
    };

    #SF: SalesForceClient;

    /**
     * Creates a new AutomationStudio API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance: SalesForceClient) {
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
    async endpoints(): Promise<any> {
        try {
            return await this.#SF.api(`/automation/v1/rest`, 'GET');
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to get automation endpoints: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                '/automation/v1/rest',
                'GET'
            );
        }
    }

    /**
     * Retrieves all automations in the account
     *
     * @returns A promise that resolves to the list of automations
     * @throws {SalesForceAPIError} If the API request fails
     *
     * @example
     * ```typescript
     * const automations = await automationStudio.getAll();
     * console.log(`Found ${automations.count} automations`);
     * ```
     */
    async getAll(): Promise<AutomationsListResponse> {
        try {
            return await this.#SF.api<AutomationsListResponse>(
                `/automation/v1/automations`,
                'GET'
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to get automations: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                '/automation/v1/automations',
                'GET'
            );
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
    async get(externalKey: string): Promise<AutomationResponse> {
        if (!externalKey) {
            throw new SalesForceConfigError('Automation external key is required');
        }

        try {
            return await this.#SF.api<AutomationResponse>(
                `/automation/v1/automations/${externalKey}`,
                'GET'
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to get automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                `/automation/v1/automations/${externalKey}`,
                'GET'
            );
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
    async create(options: CreateAutomationOptions = {}): Promise<AutomationResponse> {
        const { name, description, steps, startDate, timeZoneId } = options;

        try {
            return await this.#SF.api<AutomationResponse>(
                `/automation/v1/automations`,
                'POST',
                {
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
                }
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to create automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                '/automation/v1/automations',
                'POST'
            );
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
    async activate(
        automationId: string,
        date: string,
        timeZoneId: number = AutomationStudio.TIME_ZONE_AMERICA_TORONTO
    ): Promise<boolean> {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }

        if (!date) {
            throw new SalesForceConfigError('Start date is required');
        }

        try {
            const soapClient = await this.#SF.soapClient();

            const scheduleOptions: ScheduleOptions = {
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
                    StartDateTime:
                        AutomationStudio.TIMEZONE_MAP[timeZoneId]
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
        } catch (error) {
            throw new Error(
                `Failed to activate automation: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
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
    async pause(automationId: string): Promise<boolean> {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }

        try {
            const soapClient = await this.#SF.soapClient();

            const scheduleOptions: ScheduleOptions = {
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
        } catch (error) {
            throw new Error(
                `Failed to pause automation: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Placeholder method for deleting an automation
     *
     * @param automationId - The ID of the automation to delete
     * @deprecated This method is not yet implemented
     */
    async delete(automationId: string): Promise<void> {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }
        // Implementation pending
        throw new Error('Delete automation not yet implemented');
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
    async run(automationId: string): Promise<any> {
        if (!automationId) {
            throw new SalesForceConfigError('Automation ID is required');
        }

        try {
            return await this.#SF.api(
                `/automation/v1/automations/${automationId}/actions/runallonce`,
                'POST'
            );
        } catch (error) {
            if (error instanceof SalesForceAPIError) {
                throw error;
            }
            throw new SalesForceAPIError(
                `Failed to run automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                `/automation/v1/automations/${automationId}/actions/runallonce`,
                'POST'
            );
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
    #getFormattedDateForTimezone(dateStr: string, timeZoneId: number): string {
        const timeZoneName = AutomationStudio.TIMEZONE_MAP[timeZoneId];
        if (!timeZoneName) {
            throw new Error(`Unsupported timezone ID: ${timeZoneId}`);
        }

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
