import {
  MaintenanceScheduleItemKey,
  MaintenanceSettings
} from '@europeana/metis-ui-maintenance-utils';

const getEnvVar = (key: string): string | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
