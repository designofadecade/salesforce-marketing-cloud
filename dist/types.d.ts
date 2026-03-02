/**
 * Configuration options for the Salesforce Marketing Cloud client
 */
export interface SalesForceClientConfig {
    /** The client domain (subdomain) for your Marketing Cloud instance */
    clientDomain: string;
    /** OAuth client ID */
    clientId: string;
    /** OAuth client secret */
    clientSecret: string;
    /** Marketing Cloud account ID */
    accountId: string;
    /** OAuth scope for API access (optional) */
    scope?: string;
}
/**
 * Authentication response from the Marketing Cloud API
 */
export interface AuthenticationResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    rest_instance_url: string;
    soap_instance_url?: string;
}
/**
 * SOAP client interface
 */
export interface SoapClientInterface {
    addSoapHeader: (header: string) => void;
    ScheduleAsync: (options: ScheduleOptions) => Promise<ScheduleResponse[]>;
    [key: string]: any;
}
/**
 * Schedule options for SOAP operations
 */
export interface ScheduleOptions {
    Action: 'start' | 'pause' | 'stop';
    Schedule?: {
        Recurrence: {
            attributes: {
                'xsi:type': string;
            };
            DailyRecurrencePatternType: string;
            DayInterval: number;
        };
        Occurrences: number;
        StartDateTime: string;
        RecurrenceType: string;
        RecurrenceRangeType: string;
        TimeZone: {
            ID: number;
        };
    };
    Interactions: {
        Interaction: {
            attributes: {
                'xsi:type': string;
            };
            ObjectID: string;
        };
    };
}
/**
 * Schedule response from SOAP API
 */
export interface ScheduleResponse {
    OverallStatus: string;
    RequestID?: string;
    [key: string]: any;
}
/**
 * Data Extension row structure
 */
export interface DataExtensionRow {
    keys: Record<string, string | number>;
    values?: Record<string, any>;
}
/**
 * Data Extension response
 */
export interface DataExtensionResponse {
    items?: DataExtensionRow[];
    count?: number;
    page?: number;
    pageSize?: number;
    links?: {
        next?: string | boolean;
        self?: string;
    };
}
/**
 * Asset response from the API
 */
export interface AssetResponse {
    id: string;
    name: string;
    assetType?: {
        id: number;
        name?: string;
    };
    [key: string]: any;
}
/**
 * Assets list response
 */
export interface AssetsListResponse {
    count: number;
    page?: number;
    pageSize?: number;
    items: AssetResponse[];
}
/**
 * Automation response
 */
export interface AutomationResponse {
    id: string;
    key?: string;
    name: string;
    description?: string;
    status?: string;
    [key: string]: any;
}
/**
 * Automations list response
 */
export interface AutomationsListResponse {
    count: number;
    page?: number;
    pageSize?: number;
    items: AutomationResponse[];
    links?: {
        next?: string | boolean;
        self?: string;
    };
}
/**
 * Automation activity configuration
 */
export interface AutomationActivity {
    name: string;
    objectTypeId: number;
    displayOrder: number;
    activityObjectId: string;
}
/**
 * Automation step configuration
 */
export interface AutomationStep {
    annotation?: string;
    stepNumber: number;
    activities: AutomationActivity[];
}
/**
 * Options for creating a new automation
 */
export interface CreateAutomationOptions {
    /** Name of the automation */
    name?: string;
    /** Description of the automation */
    description?: string;
    /** Array of automation steps */
    steps?: AutomationStep[];
    /** Start date in ISO 8601 format */
    startDate?: string;
    /** Timezone ID (default: TIME_ZONE_AMERICA_TORONTO) */
    timeZoneId?: number;
}
//# sourceMappingURL=types.d.ts.map