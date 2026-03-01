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
    static readonly EMAIL_READ = 'email_read';
    /** Write access to email functionality */
    static readonly EMAIL_WRITE = 'email_write';
    /** Permission to send emails */
    static readonly EMAIL_SEND = 'email_send';

    /** Read access to SMS functionality */
    static readonly SMS_READ = 'sms_read';
    /** Write access to SMS functionality */
    static readonly SMS_WRITE = 'sms_write';
    /** Permission to send SMS messages */
    static readonly SMS_SEND = 'sms_send';

    /** Read access to push notifications */
    static readonly PUSH_READ = 'push_read';
    /** Write access to push notifications */
    static readonly PUSH_WRITE = 'push_write';
    /** Permission to send push notifications */
    static readonly PUSH_SEND = 'push_send';

    /** Read access to social media */
    static readonly SOCIAL_READ = 'social_read';
    /** Write access to social media */
    static readonly SOCIAL_WRITE = 'social_write';
    /** Permission to publish to social media */
    static readonly SOCIAL_PUBLISH = 'social_publish';

    /** Read access to OTT (Over-The-Top) chat messaging */
    static readonly OTT_READ = 'ott_read';
    /** Permission to send OTT messages */
    static readonly OTT_SEND = 'ott_send';

    // ========================================
    // Data & Content Scopes
    // ========================================

    /** Read access to data extensions */
    static readonly DATA_EXTENSIONS_READ = 'data_extensions_read';
    /** Write access to data extensions */
    static readonly DATA_EXTENSIONS_WRITE = 'data_extensions_write';

    /** Read access to audiences */
    static readonly AUDIENCES_READ = 'audiences_read';
    /** Write access to audiences */
    static readonly AUDIENCES_WRITE = 'audiences_write';

    /** Read access to lists and subscribers */
    static readonly LIST_AND_SUBSCRIBERS_READ = 'list_and_subscribers_read';
    /** Write access to lists and subscribers */
    static readonly LIST_AND_SUBSCRIBERS_WRITE = 'list_and_subscribers_write';

    /** Read access to file locations */
    static readonly FILE_LOCATIONS_READ = 'file_locations_read';
    /** Write access to file locations */
    static readonly FILE_LOCATIONS_WRITE = 'file_locations_write';

    /** Read access to tracking events */
    static readonly TRACKING_EVENTS_READ = 'tracking_events_read';

    /** Read access to documents and images */
    static readonly DOCUMENTS_AND_IMAGES_READ = 'documents_and_images_read';
    /** Write access to documents and images */
    static readonly DOCUMENTS_AND_IMAGES_WRITE = 'documents_and_images_write';

    /** Read access to saved content */
    static readonly SAVED_CONTENT_READ = 'saved_content_read';
    /** Write access to saved content */
    static readonly SAVED_CONTENT_WRITE = 'saved_content_write';

    // ========================================
    // Automation & Journey Scopes
    // ========================================

    /** Execute automations */
    static readonly AUTOMATIONS_EXECUTE = 'automations_execute';
    /** Read access to automations */
    static readonly AUTOMATIONS_READ = 'automations_read';
    /** Write access to automations */
    static readonly AUTOMATIONS_WRITE = 'automations_write';

    /** Execute/publish journeys */
    static readonly JOURNEYS_EXECUTE = 'journeys_execute';
    /** Read access to journeys */
    static readonly JOURNEYS_READ = 'journeys_read';
    /** Write access to journeys */
    static readonly JOURNEYS_WRITE = 'journeys_write';

    // ========================================
    // Administrative & Provisioning Scopes
    // ========================================

    /** Read access to users */
    static readonly USERS_READ = 'users_read';
    /** Write access to users */
    static readonly USERS_WRITE = 'users_write';

    /** Read access to organizations */
    static readonly ORGANIZATIONS_READ = 'organizations_read';
    /** Write access to organizations */
    static readonly ORGANIZATIONS_WRITE = 'organizations_write';

    /** Write access to workflows */
    static readonly WORKFLOWS_WRITE = 'workflows_write';

    // ========================================
    // Additional Scopes
    // ========================================

    /** Read access to webhooks */
    static readonly WEBHOOKS_READ = 'webhooks_read';
    /** Write access to webhooks */
    static readonly WEBHOOKS_WRITE = 'webhooks_write';

    /** Offline access (for refresh tokens) */
    static readonly OFFLINE = 'offline';

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
    static buildScope(scopes: string[]): string {
        return scopes.filter(Boolean).join(' ');
    }
}
