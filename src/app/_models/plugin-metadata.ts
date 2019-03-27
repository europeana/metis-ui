// Java name: AbstractMetisPluginMetadata

export interface BasicPluginMetadata {
  pluginType:
    | 'VALIDATION_EXTERNAL'
    | 'VALIDATION_INTERNAL'
    | 'NORMALIZATION'
    | 'ENRICHMENT'
    | 'MEDIA_PROCESS'
    | 'PREVIEW'
    | 'PUBLISH'
    | 'LINK_CHECKING';
  mocked?: boolean;
  enabled?: boolean;
  performSampling?: boolean;
}

export interface OAIHarvestPluginMetadata {
  pluginType: 'OAIPMH_HARVEST';
  mocked?: boolean;
  enabled?: boolean;

  url: string;
  setSpec: string;
  metadataFormat: string;
}

export interface HttpHarvestPluginMetadata {
  pluginType: 'HTTP_HARVEST';
  mocked?: boolean;
  enabled?: boolean;

  url: string;
}

export interface TransformationPluginMetadata {
  pluginType: 'TRANSFORMATION';
  mocked?: boolean;
  enabled?: boolean;

  customXslt: boolean;
}

export type PluginMetadata =
  | BasicPluginMetadata
  | OAIHarvestPluginMetadata
  | HttpHarvestPluginMetadata
  | TransformationPluginMetadata;
