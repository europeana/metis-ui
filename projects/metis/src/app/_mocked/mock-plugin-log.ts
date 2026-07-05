import { PluginStatus, PluginType, TopologyName } from '../_models';

export const mockPluginLog = {
  id: 'xx5',
  pluginType: PluginType.OAIPMH_HARVEST,
  pluginStatus: PluginStatus.RUNNING,
  executionProgress: {
    failRecords: 5,
    failDepublishRecords: 0,
    expectedRecords: 1000,
    processedRecords: 500,
    progressPercentage: 50
  },
  topologyName: 'oai_harvest' as TopologyName
};
