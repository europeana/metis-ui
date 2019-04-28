import { Results } from '../../src/app/_models/results';
import {
  PluginStatus,
  PluginType,
  TaskState,
  WorkflowExecution,
  WorkflowStatus,
} from '../../src/app/_models/workflow-execution';

export const runningExecutions: Results<WorkflowExecution> = {
  results: [
    {
      id: 'vfvdsvfdv',
      datasetId: '64',
      workflowStatus: WorkflowStatus.RUNNING,
      cancelling: false,
      createdDate: '2018-11-13T08:46:54.373Z',
      startedDate: '2018-11-13T08:46:54.476Z',
      updatedDate: '2018-11-13T08:47:32.003Z',
      finishedDate: '2018-11-13T08:47:32.008Z',
      metisPlugins: [
        {
          pluginType: PluginType.OAIPMH_HARVEST,
          id: '5bea8f7e729e6f000d3a8764-OAIPMH_HARVEST',
          pluginStatus: PluginStatus.RUNNING,
          startedDate: '2018-11-13T08:46:54.476Z',
          updatedDate: '2018-11-13T08:47:32.003Z',
          finishedDate: '2018-11-13T08:47:32.008Z',
          externalTaskId: '-138550145322300154',
          executionProgress: {
            expectedRecords: 760,
            processedRecords: 0,
            progressPercentage: 0,
            errors: 0,
            status: TaskState.PENDING,
          },
          pluginMetadata: {
            pluginType: PluginType.OAIPMH_HARVEST,
            mocked: false,
            enabled: true,
            url: 'https://oai-pmh.eanadev.org/oai',
            metadataFormat: 'edm',
            setSpec: '2021006',
          },
          topologyName: 'oai_harvest',
        },
      ],
    },
    {
      id: 'vfv5325dsvfdv',
      datasetId: '194',
      workflowStatus: WorkflowStatus.RUNNING,
      cancelling: false,
      createdDate: '2018-11-13T08:46:54.373Z',
      startedDate: '2018-11-13T08:46:54.476Z',
      updatedDate: '2018-11-13T08:47:32.003Z',
      finishedDate: '2018-11-13T08:47:32.008Z',
      metisPlugins: [
        {
          pluginType: PluginType.OAIPMH_HARVEST,
          id: '5bea8f7e729e6f000d3a8764-OAIPMH_HARVEST',
          pluginStatus: PluginStatus.RUNNING,
          startedDate: '2018-11-13T08:46:54.476Z',
          updatedDate: '2018-11-13T08:47:32.003Z',
          finishedDate: '2018-11-13T08:47:32.008Z',
          externalTaskId: '-138550145322300154',
          executionProgress: {
            expectedRecords: 760,
            processedRecords: 0,
            progressPercentage: 0,
            errors: 0,
            status: TaskState.PENDING,
          },
          pluginMetadata: {
            pluginType: PluginType.OAIPMH_HARVEST,
            mocked: false,
            enabled: true,
            url: 'https://oai-pmh.eanadev.org/oai',
            metadataFormat: 'edm',
            setSpec: '2021006',
          },
          topologyName: 'oai_harvest',
        },
      ],
    },
  ],
  listSize: 5,
  nextPage: -1,
};
