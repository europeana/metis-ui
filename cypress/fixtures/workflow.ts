import { Workflow } from '../../src/app/_models/workflow';

export const workflow: Workflow = {
  datasetId: '1',
  id: '1',
  metisPluginsMetadata: [
    {
      enabled: true,
      metadataFormat: 'edm',
      pluginType: 'OAIPMH_HARVEST',
      setSpec: 'oai_test',
      url: 'http://www.mocked.com',
    },
    {
      enabled: true,
      pluginType: 'TRANSFORMATION',
      customXslt: false,
    },
    {
      enabled: true,
      pluginType: 'MEDIA_PROCESS',
    },
    {
      enabled: true,
      pluginType: 'LINK_CHECKING',
    },
  ],
};
