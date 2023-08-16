export type EnvItemKey = 'sandbox-ui-test' | 'sandbox-ui-acceptance' | 'sandbox-ui-production';

export interface EnvPeriod {
  from: string;
  to: string;
}

export interface EnvItem {
  maintenanceMessage?: string;
  remoteEnvUrl?: string;
  period?: EnvPeriod;
}

export interface Env {
  ['sandbox-ui-test']: EnvItem;
  ['sandbox-ui-acceptance']: EnvItem;
  ['sandbox-ui-production']: EnvItem;
}

export interface ApiSettingsGeneric {
  intervalMaintenance: number;
  remoteEnvUrl: string;
  remoteEnvKey: EnvItemKey;
  remoteEnv: EnvItem;
}
