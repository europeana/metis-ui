import { Results } from '../../src/app/_models/results';
import { DatasetOverview, PluginStatus } from '../../src/app/_models/workflow-execution';

export const datasetOverview: Results<DatasetOverview> = {
  results: [
    {
      dataset: {
        datasetName: 'Dataset 2',
        datasetId: '129',
      },
      executionProgress: {
        stepsDone: 3,
        stepsTotal: 11,
        currentPluginProgress: {
          errors: 49,
          processedRecords: 232,
          expectedRecords: 233,
          progressPercentage: 99,
        },
      },
      execution: {
        finishedDate: '2018-10-19T09:23:70.844Z',
        startedDate: '2018-10-19T09:05:40.844Z',
        plugins: [
          {
            pluginType: 'OAIPMH_HARVEST',
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 114092,
              processedRecords: 114092,
              progressPercentage: 100,
              errors: 0,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'HTTP_HARVEST',
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 900,
              progressPercentage: 100,
              errors: 20,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'TRANSFORMATION',
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 90,
              progressPercentage: 10,
              errors: 12,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
        ],
      },
    },
    {
      dataset: {
        datasetName: 'Dataset 1',
        datasetId: '123',
      },
      executionProgress: {
        stepsDone: 2,
        stepsTotal: 3,
        currentPluginProgress: {
          errors: 92,
          processedRecords: 444,
          expectedRecords: 3000,
          progressPercentage: 22,
        },
      },
      execution: {
        startedDate: '2011-11-19T09:05:40.844Z',
        plugins: [
          {
            pluginType: 'OAIPMH_HARVEST',
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 90,
              progressPercentage: 10,
              errors: 12,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'HTTP_HARVEST',
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'TRANSFORMATION',
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'LINK_CHECKING',
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            finishedDate: '2019-11-19T13:07:70.844Z',
            startedDate: '2019-11-19T12:47:10.844Z',
          },
          {
            pluginType: 'ENRICHMENT',
            pluginStatus: PluginStatus.RUNNING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            startedDate: '2019-11-19T12:47:10.844Z',
            finishedDate: '2019-11-19T13:07:70.844Z',
          },
          {
            pluginType: 'MEDIA_PROCESS',
            pluginStatus: PluginStatus.RUNNING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            startedDate: '2019-11-19T12:47:10.844Z',
            finishedDate: '2019-11-19T13:07:70.844Z',
          },
          {
            pluginType: 'VALIDATION_EXTERNAL',
            pluginStatus: PluginStatus.INQUEUE,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            startedDate: '2019-11-19T12:47:10.844Z',
            finishedDate: '2019-11-19T13:07:70.844Z',
          },
          {
            pluginType: 'VALIDATION_INTERNAL',
            pluginStatus: PluginStatus.CLEANING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10,
            },

            startedDate: '2019-11-19T12:47:10.844Z',
            finishedDate: '2019-11-19T13:07:70.844Z',
          },
          {
            pluginType: 'NORMALIZATION',
            pluginStatus: PluginStatus.PENDING,

            progress: {
              expectedRecords: 1000,
              processedRecords: 430,
              progressPercentage: 0,
              errors: 80,
            },
          },
          {
            pluginType: 'PREVIEW',
            pluginStatus: PluginStatus.PENDING,

            progress: {
              expectedRecords: 1000,
              processedRecords: 430,
              progressPercentage: 0,
              errors: 80,
            },
          },
          {
            pluginType: 'PUBLISH',
            pluginStatus: PluginStatus.PENDING,

            progress: {
              expectedRecords: 1000,
              processedRecords: 430,
              progressPercentage: 0,
              errors: 80,
            },
          },
        ],
      },
    },
  ],
  listSize: 4,
  nextPage: 1,
};
