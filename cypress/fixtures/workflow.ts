import { Workflow } from '../../src/app/_models/workflow';

export const workflow: Workflow = {
  datasetId: '1',
  id: '1',
  metisPluginsMetadata: [{
    enabled: true,
    metadataFormat: 'edm',
    pluginType: 'OAIPMH_HARVEST',
    setSpec: 'oai_test',
    url: 'http://www.mocked.com'
  },
  {
    enabled: true,
    pluginType: 'TRANSFORMATION',
    customXSLT: false
  },
  {
    enabled: true,
    pluginType: 'MEDIA_PROCESS',
    connectionLimitToDomains: { 'mocked': 1 }
  },
  {
    enabled: true,
    pluginType: 'LINK_CHECKING',
    connectionLimitToDomains: { 'mocked': 1 }
  }]
};
