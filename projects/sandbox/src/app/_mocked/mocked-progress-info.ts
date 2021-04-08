import { DatasetInfo, ProgressByStep } from '../_models';

export const mockDatasetInfo = {
  creationDate: '1617886312265',
  status: 'completed',
  'portal-preview':
    'https://metis-sandbox-preview-api-test-portal.eanadev.org/portal/search?view=grid&q=edm_datasetName:43_jochen_test*',
  'portal-publish':
    'https://metis-sandbox-publish-api-test-portal.eanadev.org/portal/search?view=grid&q=edm_datasetName:43_jochen_test*',
  'total-records': 4,
  'processed-records': 3,
  'progress-by-step': [
    {
      step: 'import',
      total: 4,
      success: 4,
      fail: 0,
      warn: 0
    },
    {
      step: 'validate (edm external)',
      total: 4,
      success: 2,
      fail: 1,
      warn: 1
    },
    {
      step: 'transform',
      total: 4,
      success: 1,
      fail: 1,
      warn: 2
    },
    {
      step: 'validate (edm internal)',
      total: 4,
      success: 1,
      fail: 2,
      warn: 1
    },
    {
      step: 'normalise',
      total: 4,
      success: 0,
      fail: 3,
      warn: 1
    },
    {
      step: 'enrich',
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
      step: 'process media',
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
      step: 'preview',
      total: 3,
      success: 1,
      fail: 2,
      warn: 0
    },
    {
      step: 'publish',
      total: 1,
      success: 1,
      fail: 0,
      warn: 0
    } as ProgressByStep
  ]
} as DatasetInfo;
