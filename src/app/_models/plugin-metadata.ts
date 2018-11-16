// Java name: AbstractMetisPluginMetadata

export interface PluginMetadata {
  pluginType: string;
  mocked?: boolean;
  enabled?: boolean;

  //tslint:disable-next-line: no-any
  [key: string]: any;
}
