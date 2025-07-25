import {
  DatasetProgress,
  DatasetStatus,
  HarvestProtocol,
  ProgressByStep,
  StepStatus,
  UserDatasetInfo
} from '../_models';

const mockDatasetInfoBase = {
  'created-by-id': '1234',
  'creation-date': '2022-01-19T15:21:09',
  'dataset-name': 'Test_Dataset_Name',
  'dataset-id': '1',
  country: 'Greece',
  language: 'Greek'
};

export const mockDatasetInfo = {
  ...mockDatasetInfoBase,
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

const insitituteTypes = ['University', 'School', 'Museum', 'Royal_Library'];
const cities = [
  'Amsterdam',
  'Brussels',
  'Como',
  'Dusseldorf',
  'Edinburgh',
  'Freiburg',
  'Glasgow',
  'Helsinki',
  'Imola',
  'Jena',
  'Kotka',
  'Lisbon',
  'Milan',
  'Nice',
  'Overveen',
  'Pisa',
  'Queluz',
  'Rome',
  'Siena',
  'Torino',
  'Ulm',
  'Vienna',
  'Warsaw',
  'X-City',
  'Y-City',
  'Z-City'
];
const dateNow = new Date();

export const mockUserDatasets: Array<UserDatasetInfo> = Object.keys(new Array(24).fill(null)).map(
  (_: string, i: number) => {
    dateNow.setDate(dateNow.getDate() - 1);
    dateNow.setHours((i * 99) % 24);
    dateNow.setMinutes((i * 999) % 60);

    const city = cities[i % cities.length];
    const institute = insitituteTypes[i % insitituteTypes.length];

    return {
      ...mockDatasetInfoBase,
      'creation-date': dateNow.toISOString(),
      'dataset-id': `${i}`,
      'dataset-name': `${institute}_of_${city}_data_${i}`,
      'harvest-protocol':
        i % 2 === 1 ? HarvestProtocol.HARVEST_HTTP : HarvestProtocol.HARVEST_OAI_PMH,
      status:
        i % 3 === 0
          ? DatasetStatus.COMPLETED
          : i % 2 === 0
          ? DatasetStatus.IN_PROGRESS
          : DatasetStatus.FAILED,
      'total-records': i + 1,
      'processed-records': i,
      country:
        i % 2 === 0 ? 'Greece' : i % 3 === 0 ? 'Netherlands' : i % 5 === 0 ? 'Spain' : 'Germany',
      language: i % 2 === 0 ? 'Greek' : i % 3 === 0 ? 'Dutch' : i % 5 === 0 ? 'Spanish' : 'German'
    };
  }
);
