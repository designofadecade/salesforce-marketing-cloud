import type SalesForceClient from './SalesForceClient.js';
import type { AutomationResponse, AutomationsListResponse, CreateAutomationOptions } from './types.js';
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
    #private;
    /** Timezone ID for America/Toronto (Eastern Time) */
    static readonly TIME_ZONE_AMERICA_TORONTO = 76;
    /** Timezone ID for America/Chicago (Central Time) */
    static readonly TIME_ZONE_AMERICA_CHICAGO = 27;
    /** Mapping of timezone IDs to IANA timezone names */
    private static readonly TIMEZONE_MAP;
    /**
     * Creates a new AutomationStudio API instance
     *
     * @param salesForceInstance - An authenticated SalesForce client instance
     * @throws {SalesForceConfigError} If the SalesForce client is not provided
     */
    constructor(salesForceInstance: SalesForceClient);
    /**
     * Retrieves available automation endpoints
     *
     * @returns A promise that resolves to the endpoints configuration
     * @throws {SalesForceAPIError} If the API request fails
     */
    endpoints(): Promise<any>;
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
    getAll(): Promise<AutomationsListResponse>;
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
    get(externalKey: string): Promise<AutomationResponse>;
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
    create(options?: CreateAutomationOptions): Promise<AutomationResponse>;
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
    activate(automationId: string, date: string, timeZoneId?: number): Promise<boolean>;
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
    pause(automationId: string): Promise<boolean>;
    /**
     * Placeholder method for deleting an automation
     *
     * @param automationId - The ID of the automation to delete
     * @deprecated This method is not yet implemented
     */
    delete(automationId: string): Promise<void>;
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
    run(automationId: string): Promise<any>;
}
//# sourceMappingURL=AutomationStudio.d.ts.map