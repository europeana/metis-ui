import {
  DatasetProgress,
  DatasetStatus,
  HarvestProtocol,
  ProgressByStep,
  StepStatus
} from '../_models';

export const mockDatasetInfo = {
  'creation-date': '2022-01-19T15:21:09',
  'dataset-name': 'Test_Dataset_Name',
  'dataset-id': '1',
  country: 'Greece',
  language: 'He',
  'harvesting-parameters': {
    'harvest-protocol': HarvestProtocol.HARVEST_HTTP,
    url: 'http'
  }
};

export const mockDataset = {
  'dataset-logs': [],
  'records-published-successfully': true,
  status: DatasetStatus.COMPLETED,
  'portal-publish':
    'https://metis-sandbox-publish-api-test-portal.eanadev.org/portal/search?view=grid&q=edm_datasetName:43_jochen_test*',
  'total-records': 4,
  'processed-records': 3,
  'progress-by-step': [
    {
      step: StepStatus.HARVEST_OAI_PMH,
      total: 4,
      success: 4,
      fail: 0,
      warn: 0
    },
    {
      step: StepStatus.TRANSFORM_TO_EDM_EXTERNAL,
      total: 4,
      success: 4,
      fail: 0,
      warn: 0
    },
    {
      step: StepStatus.VALIDATE_EXTERNAL,
      total: 4,
      success: 2,
      fail: 1,
      warn: 1
    },
    {
      step: StepStatus.TRANSFORM,
      total: 4,
      success: 1,
      fail: 1,
      warn: 2
    },
    {
      step: StepStatus.VALIDATE_INTERNAL,
      total: 4,
      success: 1,
      fail: 2,
      warn: 1
    },
    {
      step: StepStatus.NORMALIZE,
      total: 4,
      success: 0,
      fail: 3,
      warn: 1
    },
    {
      step: StepStatus.ENRICH,
      total: 3,
      success: 0,
      fail: 1,
      warn: 2,
      errors: [
        {
          type: 'warning',
          message: 'Exception occurred while trying to perform enrichment.',
          records: ['libvar:ADV.11639', 'libvar:ADV.14385']
        }
      ]
    },
    {
      step: StepStatus.MEDIA_PROCESS,
      total: 4,
      success: 1,
      fail: 1,
      warn: 2,
      errors: [
        {
          type: 'warning',
          message:
            // eslint-disable-next-line max-len
            "Could not analyze content and generate thumbnails: External process returned error content:\nconvert: profile 'icc': 'RGB ': RGB color space not permitted on grayscale PNG `/opt/tomcat/temp/thumbnail_10695675381391133662.tmp' @ warning/png.c/MagickPNGWarningHandler/1654.\nconvert: profile 'icc': 'RGB ': RGB color space not permitted on grayscale PNG `/opt/tomcat/temp/thumbnail_17114105981585841388.tmp' @ warning/png.c/MagickPNGWarningHandler/1654.\n",
          records: ['libvar:ADV.11639']
        },
        {
          type: 'warning',
          message:
            // eslint-disable-next-line max-len
            "Could not analyze content and generate thumbnails: External process returned error content:\nconvert: profile 'icc': 'RGB ': RGB color space not permitted on grayscale PNG `/opt/tomcat/temp/thumbnail_8801379353654169986.tmp' @ warning/png.c/MagickPNGWarningHandler/1654.\nconvert: profile 'icc': 'RGB ': RGB color space not permitted on grayscale PNG `/opt/tomcat/temp/thumbnail_9054546622302023453.tmp' @ warning/png.c/MagickPNGWarningHandler/1654.\n",
          records: ['libvar:ADV.14385']
        }
      ]
    },
    {
      step: StepStatus.PUBLISH,
      total: 1,
      success: 1,
      fail: 0,
      warn: 0
    } as ProgressByStep
  ]
} as DatasetProgress;
