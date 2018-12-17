// Java name: AbstractMetisPluginMetadata

export interface BasicPluginMetadata {
  pluginType:
    | 'VALIDATION_EXTERNAL'
    | 'VALIDATION_INTERNAL'
    | 'NORMALIZATION'
    | 'ENRICHMENT'
    | 'PREVIEW'
    | 'PUBLISH';
  mocked?: boolean;
  enabled?: boolean;
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

export interface ConnectionLimits {
  [host: string]: number;
}

export interface ConnectionsPluginMetadata {
  pluginType: 'MEDIA_PROCESS' | 'LINK_CHECKING';
  mocked?: boolean;
  enabled?: boolean;

  connectionLimitToDomains: ConnectionLimits;
}

export type PluginMetadata =
  | BasicPluginMetadata
  | OAIHarvestPluginMetadata
  | HttpHarvestPluginMetadata
  | TransformationPluginMetadata
  | ConnectionsPluginMetadata;
