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

export interface HarvestPluginMetadataBase {
  mocked?: boolean;
  enabled?: boolean;
  url: string;
}

export interface OAIHarvestPluginMetadata extends HarvestPluginMetadataBase {
  pluginType: 'OAIPMH_HARVEST';
  setSpec: string;
  metadataFormat: string;
}

// Allow OAIHarvestPluginMetadata to have the property 'harvestUrl' temporarily
export interface OAIHarvestPluginMetadataTmp extends OAIHarvestPluginMetadata {
  harvestUrl: string;
}

export interface HttpHarvestPluginMetadata extends HarvestPluginMetadataBase {
  pluginType: 'HTTP_HARVEST';
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
  | OAIHarvestPluginMetadataTmp
  | HttpHarvestPluginMetadata
  | TransformationPluginMetadata;
