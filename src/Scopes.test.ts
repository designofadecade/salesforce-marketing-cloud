import { describe, it, expect } from 'vitest';
import Scopes from './Scopes.js';

describe('Scopes', () => {
    describe('scope constants', () => {
        it('should define messaging scope constants', () => {
            expect(Scopes.EMAIL_READ).toBe('email_read');
            expect(Scopes.EMAIL_WRITE).toBe('email_write');
            expect(Scopes.EMAIL_SEND).toBe('email_send');
            expect(Scopes.SMS_READ).toBe('sms_read');
            expect(Scopes.SMS_WRITE).toBe('sms_write');
            expect(Scopes.SMS_SEND).toBe('sms_send');
            expect(Scopes.PUSH_READ).toBe('push_read');
            expect(Scopes.PUSH_WRITE).toBe('push_write');
            expect(Scopes.PUSH_SEND).toBe('push_send');
            expect(Scopes.SOCIAL_READ).toBe('social_read');
            expect(Scopes.SOCIAL_WRITE).toBe('social_write');
            expect(Scopes.SOCIAL_PUBLISH).toBe('social_publish');
            expect(Scopes.OTT_READ).toBe('ott_read');
            expect(Scopes.OTT_SEND).toBe('ott_send');
        });

        it('should define data & content scope constants', () => {
            expect(Scopes.DATA_EXTENSIONS_READ).toBe('data_extensions_read');
            expect(Scopes.DATA_EXTENSIONS_WRITE).toBe('data_extensions_write');
            expect(Scopes.AUDIENCES_READ).toBe('audiences_read');
            expect(Scopes.AUDIENCES_WRITE).toBe('audiences_write');
            expect(Scopes.LIST_AND_SUBSCRIBERS_READ).toBe('list_and_subscribers_read');
            expect(Scopes.LIST_AND_SUBSCRIBERS_WRITE).toBe('list_and_subscribers_write');
            expect(Scopes.FILE_LOCATIONS_READ).toBe('file_locations_read');
            expect(Scopes.FILE_LOCATIONS_WRITE).toBe('file_locations_write');
            expect(Scopes.TRACKING_EVENTS_READ).toBe('tracking_events_read');
            expect(Scopes.DOCUMENTS_AND_IMAGES_READ).toBe('documents_and_images_read');
            expect(Scopes.DOCUMENTS_AND_IMAGES_WRITE).toBe('documents_and_images_write');
            expect(Scopes.SAVED_CONTENT_READ).toBe('saved_content_read');
            expect(Scopes.SAVED_CONTENT_WRITE).toBe('saved_content_write');
        });

        it('should define automation scope constants', () => {
            expect(Scopes.AUTOMATIONS_EXECUTE).toBe('automations_execute');
            expect(Scopes.AUTOMATIONS_READ).toBe('automations_read');
            expect(Scopes.AUTOMATIONS_WRITE).toBe('automations_write');
            expect(Scopes.JOURNEYS_EXECUTE).toBe('journeys_execute');
            expect(Scopes.JOURNEYS_READ).toBe('journeys_read');
            expect(Scopes.JOURNEYS_WRITE).toBe('journeys_write');
        });

        it('should define administrative scope constants', () => {
            expect(Scopes.USERS_READ).toBe('users_read');
            expect(Scopes.USERS_WRITE).toBe('users_write');
            expect(Scopes.ORGANIZATIONS_READ).toBe('organizations_read');
            expect(Scopes.ORGANIZATIONS_WRITE).toBe('organizations_write');
            expect(Scopes.WORKFLOWS_WRITE).toBe('workflows_write');
        });

        it('should define additional scope constants', () => {
            expect(Scopes.WEBHOOKS_READ).toBe('webhooks_read');
            expect(Scopes.WEBHOOKS_WRITE).toBe('webhooks_write');
            expect(Scopes.OFFLINE).toBe('offline');
        });
    });

    describe('buildScope', () => {
        it('should combine multiple scopes with spaces', () => {
            const result = Scopes.buildScope([
                Scopes.EMAIL_READ,
                Scopes.DATA_EXTENSIONS_WRITE,
                Scopes.AUTOMATIONS_EXECUTE,
            ]);
            expect(result).toBe('email_read data_extensions_write automations_execute');
        });

        it('should handle single scope', () => {
            const result = Scopes.buildScope([Scopes.EMAIL_READ]);
            expect(result).toBe('email_read');
        });

        it('should filter out empty strings', () => {
            const result = Scopes.buildScope([
                Scopes.EMAIL_READ,
                '',
                Scopes.EMAIL_WRITE,
            ]);
            expect(result).toBe('email_read email_write');
        });

        it('should return empty string for empty array', () => {
            const result = Scopes.buildScope([]);
            expect(result).toBe('');
        });

        it('should handle custom scope strings', () => {
            const result = Scopes.buildScope([
                'custom_scope_1',
                'custom_scope_2',
            ]);
            expect(result).toBe('custom_scope_1 custom_scope_2');
        });
    });

    describe('constants are readonly', () => {
        it('should have readonly properties defined', () => {
            // TypeScript enforces readonly at compile time
            // At runtime, the values should be accessible
            expect(Scopes.EMAIL_READ).toBe('email_read');
            expect(typeof Scopes.EMAIL_READ).toBe('string');
            
            // Verify all major categories have constants
            expect(Scopes).toHaveProperty('EMAIL_READ');
            expect(Scopes).toHaveProperty('DATA_EXTENSIONS_READ');
            expect(Scopes).toHaveProperty('AUTOMATIONS_EXECUTE');
            expect(Scopes).toHaveProperty('USERS_READ');
        });
    });
});
