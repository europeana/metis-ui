import { PluginMetadata } from './plugin-metadata';

export interface Workflow {
  id: string;
  datasetId: string;
  metisPluginsMetadata: PluginMetadata[];
}
