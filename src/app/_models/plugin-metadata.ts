export interface PluginMetadata {
  pluginType: string;
  mocked?: boolean;
  enabled: boolean;
  [key: string]: any;
}
