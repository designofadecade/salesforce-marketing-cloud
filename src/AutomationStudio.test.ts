import { describe, it, expect, vi, beforeEach } from 'vitest';
import AutomationStudio from './AutomationStudio.js';
import type SalesForceClient from './SalesForceClient.js';

describe('AutomationStudio', () => {
    let automationStudio: AutomationStudio;
    let mockSFClient: Partial<SalesForceClient>;

    beforeEach(() => {
        mockSFClient = {
            api: vi.fn(),
            soapClient: vi.fn(),
        };

        automationStudio = new AutomationStudio(mockSFClient as SalesForceClient);
    });

    describe('constructor', () => {
        it('should create an instance', () => {
            expect(automationStudio).toBeInstanceOf(AutomationStudio);
        });
    });

    describe('endpoints', () => {
        it('should get automation endpoints', async () => {
            const mockEndpoints = {
                links: [
                    { rel: 'automations', href: '/automation/v1/automations' },
                ],
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockEndpoints);

            const result = await automationStudio.endpoints();

            expect(result).toEqual(mockEndpoints);
            expect(mockSFClient.api).toHaveBeenCalledWith('/automation/v1/rest', 'GET');
        });
    });

    describe('getAll', () => {
        it('should get all automations with automatic pagination', async () => {
            const mockPage1 = {
                count: 4,
                page: 1,
                pageSize: 2,
                items: [
                    { id: 'auto-1', name: 'Test Automation 1' },
                    { id: 'auto-2', name: 'Test Automation 2' },
                ],
                links: { next: true },
            };

            const mockPage2 = {
                count: 4,
                page: 2,
                pageSize: 2,
                items: [
                    { id: 'auto-3', name: 'Test Automation 3' },
                    { id: 'auto-4', name: 'Test Automation 4' },
                ],
                links: { next: false },
            };

            (mockSFClient.api as any)
                .mockResolvedValueOnce(mockPage1)
                .mockResolvedValueOnce(mockPage2);

            const result = await automationStudio.getAll();

            expect(result).toEqual([
                { id: 'auto-1', name: 'Test Automation 1' },
                { id: 'auto-2', name: 'Test Automation 2' },
                { id: 'auto-3', name: 'Test Automation 3' },
                { id: 'auto-4', name: 'Test Automation 4' },
            ]);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations?$page=1&$pageSize=500',
                'GET'
            );
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations?$page=2&$pageSize=500',
                'GET'
            );
        });

        it('should get specific page when page parameter is provided', async () => {
            const mockPage = {
                count: 100,
                page: 1,
                pageSize: 50,
                items: [
                    { id: 'auto-1', name: 'Test Automation 1' },
                    { id: 'auto-2', name: 'Test Automation 2' },
                ],
                links: { next: true },
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockPage);

            const result = await automationStudio.getAll({ page: 1, pageSize: 50 });

            expect(result).toEqual(mockPage);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations?$page=1&$pageSize=50',
                'GET'
            );
        });
    });

    describe('get', () => {
        it('should get automation by external key', async () => {
            const mockAutomation = {
                id: 'auto-1',
                key: 'test-key',
                name: 'Test Automation',
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockAutomation);

            const result = await automationStudio.get('test-key');

            expect(result).toEqual(mockAutomation);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations/test-key',
                'GET'
            );
        });
    });

    describe('create', () => {
        it('should create a new automation with provided options', async () => {
            const mockResponse = {
                id: 'new-auto-id',
                name: 'My Test Automation',
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await automationStudio.create({
                name: 'My Test Automation',
                description: 'Test description',
                startDate: '2025-09-05T06:00:00',
                timeZoneId: AutomationStudio.TIME_ZONE_AMERICA_TORONTO,
                steps: [
                    {
                        stepNumber: 0,
                        activities: [
                            {
                                name: 'Send Test Email',
                                objectTypeId: 42,
                                displayOrder: 1,
                                activityObjectId: '030cf58c-db89-f011-a5df-5cba2c198868',
                            },
                        ],
                    },
                ],
            });

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations',
                'POST',
                expect.objectContaining({
                    name: 'My Test Automation',
                    description: 'Test description',
                    steps: expect.any(Array),
                    startSource: expect.any(Object),
                })
            );
        });

        it('should create automation with custom parameters', async () => {
            const mockResponse = {
                id: 'custom-auto-id',
                name: 'My Custom Automation',
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await automationStudio.create({
                name: 'My Custom Automation',
                description: 'Custom description',
                startDate: '2026-03-01T10:00:00',
                timeZoneId: AutomationStudio.TIME_ZONE_AMERICA_CHICAGO,
            });

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations',
                'POST',
                expect.objectContaining({
                    name: 'My Custom Automation',
                    description: 'Custom description',
                    startSource: expect.objectContaining({
                        schedule: expect.objectContaining({
                            timezoneId: AutomationStudio.TIME_ZONE_AMERICA_CHICAGO,
                            startDate: '2026-03-01T10:00:00',
                        }),
                    }),
                })
            );
        });
    });

    describe('activate', () => {
        it('should activate automation successfully', async () => {
            const mockSoapClient = {
                ScheduleAsync: vi.fn().mockResolvedValueOnce([{ OverallStatus: 'OK' }]),
            };

            (mockSFClient.soapClient as any).mockResolvedValueOnce(mockSoapClient);

            const result = await automationStudio.activate(
                'auto-123',
                '2026-03-01T10:00:00'
            );

            expect(result).toBe(true);
            expect(mockSoapClient.ScheduleAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    Action: 'start',
                    Schedule: expect.any(Object),
                    Interactions: expect.any(Object),
                })
            );
        });

        it('should return false when activation fails', async () => {
            const mockSoapClient = {
                ScheduleAsync: vi.fn().mockResolvedValueOnce([{ OverallStatus: 'ERROR' }]),
            };

            (mockSFClient.soapClient as any).mockResolvedValueOnce(mockSoapClient);

            const result = await automationStudio.activate(
                'auto-123',
                '2026-03-01T10:00:00'
            );

            expect(result).toBe(false);
        });

        it('should handle different timezone', async () => {
            const mockSoapClient = {
                ScheduleAsync: vi.fn().mockResolvedValueOnce([{ OverallStatus: 'OK' }]),
            };

            (mockSFClient.soapClient as any).mockResolvedValueOnce(mockSoapClient);

            const result = await automationStudio.activate(
                'auto-123',
                '2026-03-01T10:00:00',
                AutomationStudio.TIME_ZONE_AMERICA_CHICAGO
            );

            expect(result).toBe(true);
            expect(mockSoapClient.ScheduleAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    Schedule: expect.objectContaining({
                        TimeZone: { ID: AutomationStudio.TIME_ZONE_AMERICA_CHICAGO },
                    }),
                })
            );
        });
    });

    describe('pause', () => {
        it('should pause automation successfully', async () => {
            const mockSoapClient = {
                ScheduleAsync: vi.fn().mockResolvedValueOnce([{ OverallStatus: 'OK' }]),
            };

            (mockSFClient.soapClient as any).mockResolvedValueOnce(mockSoapClient);

            const result = await automationStudio.pause('auto-123');

            expect(result).toBe(true);
            expect(mockSoapClient.ScheduleAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    Action: 'pause',
                    Interactions: expect.any(Object),
                })
            );
        });

        it('should return false when pause fails', async () => {
            const mockSoapClient = {
                ScheduleAsync: vi.fn().mockResolvedValueOnce([{ OverallStatus: 'ERROR' }]),
            };

            (mockSFClient.soapClient as any).mockResolvedValueOnce(mockSoapClient);

            const result = await automationStudio.pause('auto-123');

            expect(result).toBe(false);
        });
    });

    describe('run', () => {
        it('should run automation successfully', async () => {
            const mockResponse = {
                executedDate: '2026-02-24T12:00:00',
                status: 'Running',
            };

            (mockSFClient.api as any).mockResolvedValueOnce(mockResponse);

            const result = await automationStudio.run('auto-123');

            expect(result).toEqual(mockResponse);
            expect(mockSFClient.api).toHaveBeenCalledWith(
                '/automation/v1/automations/auto-123/actions/runallonce',
                'POST'
            );
        });
    });
});
