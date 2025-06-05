import { PluginStatus, PluginType, TopologyName } from '../_models';

export const mockPluginLog = {
  id: 'xx5',
  pluginType: PluginType.OAIPMH_HARVEST,
  pluginStatus: PluginStatus.RUNNING,
  executionProgress: {
    expectedRecords: 1000,
    processedRecords: 500,
    progressPercentage: 50,
    errors: 5
  },
  topologyName: 'oai_harvest' as TopologyName
};
