/**
 * OAuth Scopes for Salesforce Marketing Cloud API
 *
 * This class provides constants for all available OAuth scopes in the Marketing Cloud API.
 * Use these constants to request specific permissions when authenticating.
 *
 * @example
 * ```typescript
 * import { Scopes } from '@designofadecade/salesforce-marketing-cloud';
 *
 * // Single scope
 * const scope = Scopes.EMAIL_READ;
 *
 * // Multiple scopes
 * const scope = Scopes.buildScope([
 *   Scopes.EMAIL_READ,
 *   Scopes.DATA_EXTENSIONS_WRITE
 * ]);
 * ```
 */
export default class Scopes {
    // ========================================
    // Messaging & Channel Scopes
    // ========================================
    /** Read access to email functionality */
    static EMAIL_READ = 'email_read';
    /** Write access to email functionality */
    static EMAIL_WRITE = 'email_write';
    /** Permission to send emails */
    static EMAIL_SEND = 'email_send';
    /** Read access to SMS functionality */
    static SMS_READ = 'sms_read';
    /** Write access to SMS functionality */
    static SMS_WRITE = 'sms_write';
    /** Permission to send SMS messages */
    static SMS_SEND = 'sms_send';
    /** Read access to push notifications */
    static PUSH_READ = 'push_read';
    /** Write access to push notifications */
    static PUSH_WRITE = 'push_write';
    /** Permission to send push notifications */
    static PUSH_SEND = 'push_send';
    /** Read access to social media */
    static SOCIAL_READ = 'social_read';
    /** Write access to social media */
    static SOCIAL_WRITE = 'social_write';
    /** Permission to publish to social media */
    static SOCIAL_PUBLISH = 'social_publish';
    /** Read access to OTT (Over-The-Top) chat messaging */
    static OTT_READ = 'ott_read';
    /** Permission to send OTT messages */
    static OTT_SEND = 'ott_send';
    // ========================================
    // Data & Content Scopes
    // ========================================
    /** Read access to data extensions */
    static DATA_EXTENSIONS_READ = 'data_extensions_read';
    /** Write access to data extensions */
    static DATA_EXTENSIONS_WRITE = 'data_extensions_write';
    /** Read access to audiences */
    static AUDIENCES_READ = 'audiences_read';
    /** Write access to audiences */
    static AUDIENCES_WRITE = 'audiences_write';
    /** Read access to lists and subscribers */
    static LIST_AND_SUBSCRIBERS_READ = 'list_and_subscribers_read';
    /** Write access to lists and subscribers */
    static LIST_AND_SUBSCRIBERS_WRITE = 'list_and_subscribers_write';
    /** Read access to file locations */
    static FILE_LOCATIONS_READ = 'file_locations_read';
    /** Write access to file locations */
    static FILE_LOCATIONS_WRITE = 'file_locations_write';
    /** Read access to tracking events */
    static TRACKING_EVENTS_READ = 'tracking_events_read';
    /** Read access to documents and images */
    static DOCUMENTS_AND_IMAGES_READ = 'documents_and_images_read';
    /** Write access to documents and images */
    static DOCUMENTS_AND_IMAGES_WRITE = 'documents_and_images_write';
    /** Read access to saved content */
    static SAVED_CONTENT_READ = 'saved_content_read';
    /** Write access to saved content */
    static SAVED_CONTENT_WRITE = 'saved_content_write';
    // ========================================
    // Automation & Journey Scopes
    // ========================================
    /** Execute automations */
    static AUTOMATIONS_EXECUTE = 'automations_execute';
    /** Read access to automations */
    static AUTOMATIONS_READ = 'automations_read';
    /** Write access to automations */
    static AUTOMATIONS_WRITE = 'automations_write';
    /** Execute/publish journeys */
    static JOURNEYS_EXECUTE = 'journeys_execute';
    /** Read access to journeys */
    static JOURNEYS_READ = 'journeys_read';
    /** Write access to journeys */
    static JOURNEYS_WRITE = 'journeys_write';
    // ========================================
    // Administrative & Provisioning Scopes
    // ========================================
    /** Read access to users */
    static USERS_READ = 'users_read';
    /** Write access to users */
    static USERS_WRITE = 'users_write';
    /** Read access to organizations */
    static ORGANIZATIONS_READ = 'organizations_read';
    /** Write access to organizations */
    static ORGANIZATIONS_WRITE = 'organizations_write';
    /** Write access to workflows */
    static WORKFLOWS_WRITE = 'workflows_write';
    // ========================================
    // Additional Scopes
    // ========================================
    /** Read access to webhooks */
    static WEBHOOKS_READ = 'webhooks_read';
    /** Write access to webhooks */
    static WEBHOOKS_WRITE = 'webhooks_write';
    /** Offline access (for refresh tokens) */
    static OFFLINE = 'offline';
    /**
     * Combines multiple scopes into a single space-separated string
     *
     * @param scopes - Array of scope strings to combine
     * @returns Space-separated scope string
     *
     * @example
     * ```typescript
     * const scope = Scopes.buildScope([
     *   Scopes.EMAIL_READ,
     *   Scopes.DATA_EXTENSIONS_WRITE
     * ]);
     * // Returns: 'email_read data_extensions_write'
     * ```
     */
    static buildScope(scopes) {
        return scopes.filter(Boolean).join(' ');
    }
}
//# sourceMappingURL=Scopes.js.map