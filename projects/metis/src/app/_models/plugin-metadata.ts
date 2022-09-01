// Java name: AbstractMetisPluginMetadata
import { PluginType } from '.';

type pluginTypes =
  | 'VALIDATION_EXTERNAL'
  | 'VALIDATION_INTERNAL'
  | 'NORMALIZATION'
  | 'ENRICHMENT'
  | 'MEDIA_PROCESS'
  | 'PREVIEW'
  | 'PUBLISH'
  | 'LINK_CHECKING';

export interface BasicPluginMetadata {
  pluginType: pluginTypes;
  mocked?: boolean;
  enabled?: boolean;
  performSampling?: boolean;
}

export interface HarvestPluginMetadataBase {
  mocked?: boolean;
  enabled?: boolean;
  url: string;
}

export interface IncrementalHarvestPluginMetadata extends HarvestPluginMetadataBase {
  incrementalHarvest?: boolean;
}

export interface OAIHarvestPluginMetadata extends IncrementalHarvestPluginMetadata {
  pluginType: PluginType.OAIPMH_HARVEST;
  setSpec: string;
  metadataFormat: string;
}

// Allow OAIHarvestPluginMetadata to have the property 'harvestUrl' temporarily
export interface OAIHarvestPluginMetadataTmp extends OAIHarvestPluginMetadata {
  harvestUrl?: string;
}

export interface HttpHarvestPluginMetadata extends IncrementalHarvestPluginMetadata {
  pluginType: PluginType.HTTP_HARVEST;
}

export interface IncrementalHarvestingAllowedResult {
  incrementalHarvestingAllowed: boolean;
}

export interface TransformationPluginMetadata {
  pluginType: PluginType.TRANSFORMATION;
  mocked?: boolean;
  enabled?: boolean;
  customXslt: boolean;
}

export enum ThrottleLevel {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG'
}

export interface MediaProcessPluginMetadata {
  enabled?: boolean;
  pluginType: PluginType.MEDIA_PROCESS;
  throttlingLevel: ThrottleLevel;
}

export type PluginMetadata =
  | BasicPluginMetadata
  | OAIHarvestPluginMetadata
  | OAIHarvestPluginMetadataTmp
  | HttpHarvestPluginMetadata
  | MediaProcessPluginMetadata
  | TransformationPluginMetadata;
