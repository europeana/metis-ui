import {
  MaintenanceScheduleItemKey,
  MaintenanceSettings
} from '@europeana/metis-ui-maintenance-utils';

const getEnvVar = (key: string): string | null => {
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const maintenanceSettings: MaintenanceSettings = {
  pollInterval: 60000,
  maintenanceScheduleUrl: getEnvVar('maintenanceScheduleUrl') || '',
  maintenanceScheduleKey: (getEnvVar('maintenanceScheduleKey') as MaintenanceScheduleItemKey) || '',
  maintenanceItem: {
    maintenanceMessage: ''
  }
};
