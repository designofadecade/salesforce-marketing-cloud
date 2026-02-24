import SalesForceClient from './SalesForceClient.js';
import Assets from './Assets.js';
import AutomationStudio from './AutomationStudio.js';
import DataExtensions from './DataExtensions.js';

// Export error classes
export {
    SalesForceAPIError,
    SalesForceAuthError,
    SalesForceConfigError,
} from './errors.js';

// Export types
export type {
    SalesForceClientConfig,
    AuthenticationResponse,
    SoapClientInterface,
    ScheduleOptions,
    ScheduleResponse,
    DataExtensionRow,
    DataExtensionResponse,
    AssetResponse,
    AssetsListResponse,
    AutomationResponse,
    AutomationsListResponse,
    AutomationActivity,
    AutomationStep,
    CreateAutomationOptions,
} from './types.js';

// Export main classes
export { SalesForceClient, Assets, AutomationStudio, DataExtensions };

// Default export
export default SalesForceClient;
