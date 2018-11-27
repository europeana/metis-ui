import { Results } from '../../src/app/_models/results';
import { WorkflowExecution, WorkflowStatus, PluginStatus, TaskState } from '../../src/app/_models/workflow-execution';

export const workflowExecutions: Results<WorkflowExecution[]> = {
  'results': [
    {
      'id': '5bf2db489f7dd000084d4cc4',
      'datasetId': '58',
      'workflowStatus': WorkflowStatus.FAILED,
      'ecloudDatasetId': 'fa07e945-48c4-4547-8929-6fde4055a403',
      'workflowPriority': 0,
      'cancelling': false,
      'createdDate': '2018-11-19T15:48:24.665Z',
      'startedDate': '2018-11-19T15:48:24.810Z',
      'updatedDate': '2018-11-19T15:49:07.452Z',
      'finishedDate': undefined,
      'metisPlugins': [
        {
          'pluginType': 'OAIPMH_HARVEST',
          'id': '5bf2db489f7dd000084d4cbc-OAIPMH_HARVEST',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-19T15:48:24.810Z',
          'updatedDate': '2018-11-19T15:48:46.222Z',
          'finishedDate': '2018-11-19T15:48:46.243Z',
          'externalTaskId': '-7126549942357373798',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 0,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'OAIPMH_HARVEST',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'url': 'https://oai-pmh.eanadev.org/oai',
            'metadataFormat': 'edm',
            'setSpec': '2021006',
            'fromDate': undefined,
            'untilDate': undefined,
            'datasetId': '58',
            'useDefaultIdentifiers': false,
            'identifierPrefixRemoval': undefined
          },
          'topologyName': 'oai_harvest'
        },
        {
          'pluginType': 'VALIDATION_EXTERNAL',
          'id': '5bf2db489f7dd000084d4cbd-VALIDATION_EXTERNAL',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-19T15:48:46.256Z',
          'updatedDate': '2018-11-19T15:49:01.935Z',
          'finishedDate': '2018-11-19T15:49:01.946Z',
          'externalTaskId': '-7851899970126527630',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 760,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_EXTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': 'OAIPMH_HARVEST',
            'revisionTimestampPreviousPlugin': '2018-11-19T15:48:24.810Z',
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM.xsd',
            'schematronRootPath': 'schematron/schematron.xsl'
          },
          'topologyName': 'validation'
        },
        {
          'pluginType': 'TRANSFORMATION',
          'id': '5bf2db489f7dd000084d4cbe-TRANSFORMATION',
          'pluginStatus': PluginStatus.FAILED,
          'startedDate': '2018-11-19T15:49:01.956Z',
          'updatedDate': '2018-11-19T15:49:07.452Z',
          'finishedDate': undefined,
          'externalTaskId': '2850425267034800327',
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': TaskState.DROPPED
          },
          'pluginMetadata': {
            'pluginType': 'TRANSFORMATION',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': 'VALIDATION_EXTERNAL',
            'revisionTimestampPreviousPlugin': '2018-11-19T15:48:46.256Z',
            'xsltUrl': 'https://metis-core-rest-test.eanadev.org/datasets/xslt/5b2bb8268e3b95000bacc522',
            'customXslt': false,
            'datasetId': '58',
            'datasetName': '58_dataset_with_long_field',
            'country': 'Greece',
            'language': 'el'
          },
          'topologyName': 'xslt_transform'
        },
        {
          'pluginType': 'VALIDATION_INTERNAL',
          'id': '5bf2db489f7dd000084d4cbf-VALIDATION_INTERNAL',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_INTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM-INTERNAL.xsd',
            'schematronRootPath': 'schematron/schematron-internal.xsl'
          },
          'topologyName': 'validation'
        },
        {
          'pluginType': 'NORMALIZATION',
          'id': '5bf2db489f7dd000084d4cc0-NORMALIZATION',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'NORMALIZATION',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined
          },
          'topologyName': 'normalization'
        },
        {
          'pluginType': 'ENRICHMENT',
          'id': '5bf2db489f7dd000084d4cc1-ENRICHMENT',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'ENRICHMENT',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined
          },
          'topologyName': 'enrichment'
        },
        {
          'pluginType': 'MEDIA_PROCESS',
          'id': '5bf2db489f7dd000084d4cc2-MEDIA_PROCESS',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'MEDIA_PROCESS',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'connectionLimitToDomains': {}
          },
          'topologyName': 'media_process'
        },
        {
          'pluginType': 'PREVIEW',
          'id': '5bf2db489f7dd000084d4cc3-PREVIEW',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'PREVIEW',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'datasetId': '58',
            'useAlternativeIndexingEnvironment': false,
            'preserveTimestamps': false
          },
          'topologyName': 'indexer'
        }
      ]
    },
    {
      'id': '5bf2d6ac9f7dd000084d4cbb',
      'datasetId': '58',
      'workflowStatus': WorkflowStatus.CANCELLED,
      'ecloudDatasetId': 'fa07e945-48c4-4547-8929-6fde4055a403',
      'workflowPriority': 0,
      'cancelling': false,
      'createdDate': '2018-11-19T15:28:44.179Z',
      'startedDate': '2018-11-19T15:28:44.288Z',
      'updatedDate': '2018-11-19T15:29:06.238Z',
      'finishedDate': undefined,
      'metisPlugins': [
        {
          'pluginType': 'OAIPMH_HARVEST',
          'id': '5bf2d6ac9f7dd000084d4cb9-OAIPMH_HARVEST',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': '2018-11-19T15:28:44.288Z',
          'updatedDate': '2018-11-19T15:29:06.238Z',
          'finishedDate': undefined,
          'externalTaskId': '7263327147583816636',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 300,
            'progressPercentage': 39,
            'errors': 0,
            'status': TaskState.DROPPED
          },
          'pluginMetadata': {
            'pluginType': 'OAIPMH_HARVEST',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'url': 'https://oai-pmh.eanadev.org/oai',
            'metadataFormat': 'edm',
            'setSpec': '2021006',
            'fromDate': undefined,
            'untilDate': undefined,
            'datasetId': '58',
            'useDefaultIdentifiers': false,
            'identifierPrefixRemoval': undefined
          },
          'topologyName': 'oai_harvest'
        },
        {
          'pluginType': 'VALIDATION_EXTERNAL',
          'id': '5bf2d6ac9f7dd000084d4cba-VALIDATION_EXTERNAL',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_EXTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM.xsd',
            'schematronRootPath': 'schematron/schematron.xsl'
          },
          'topologyName': 'validation'
        }
      ]
    },
    {
      'id': '5bf27dfc4bbc6c0008c0f269',
      'datasetId': '58',
      'workflowStatus': WorkflowStatus.FINISHED,
      'ecloudDatasetId': 'fa07e945-48c4-4547-8929-6fde4055a403',
      'workflowPriority': 0,
      'cancelling': false,
      'createdDate': '2018-11-12T09:10:20.151Z',
      'startedDate': '2018-11-12T09:10:20.175Z',
      'updatedDate': '2018-11-12T09:11:06.555Z',
      'finishedDate': '2018-11-12T09:11:06.564Z',
      'metisPlugins': [
        {
          'pluginType': 'OAIPMH_HARVEST',
          'id': '5bf27dfc4bbc6c0008c0f267-OAIPMH_HARVEST',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-12T09:10:20.175Z',
          'updatedDate': '2018-11-12T09:10:50.859Z',
          'finishedDate': '2018-11-12T09:10:50.864Z',
          'externalTaskId': '4480402470550914525',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 0,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'OAIPMH_HARVEST',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'url': 'https://oai-pmh.eanadev.org/oai',
            'metadataFormat': 'edm',
            'setSpec': '2021006',
            'fromDate': undefined,
            'untilDate': undefined,
            'datasetId': '58',
            'useDefaultIdentifiers': false,
            'identifierPrefixRemoval': undefined
          },
          'topologyName': 'oai_harvest'
        },
        {
          'pluginType': 'VALIDATION_EXTERNAL',
          'id': '5bf27dfc4bbc6c0008c0f268-VALIDATION_EXTERNAL',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-12T09:10:50.873Z',
          'updatedDate': '2018-11-12T09:11:06.555Z',
          'finishedDate': '2018-11-12T09:11:06.564Z',
          'externalTaskId': '-3184946032335434203',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 760,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_EXTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': 'OAIPMH_HARVEST',
            'revisionTimestampPreviousPlugin': '2018-11-12T09:10:20.175Z',
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM.xsd',
            'schematronRootPath': 'schematron/schematron.xsl'
          },
          'topologyName': 'validation'
        }
      ]
    },
    {
      'id': '5bf27ce44bbc6c0008c0f25f',
      'datasetId': '58',
      'workflowStatus': WorkflowStatus.CANCELLED,
      'ecloudDatasetId': 'fa07e945-48c4-4547-8929-6fde4055a403',
      'workflowPriority': 0,
      'cancelling': false,
      'createdDate': '2018-11-19T09:05:40.844Z',
      'startedDate': '2018-11-19T09:05:40.910Z',
      'updatedDate': '2018-11-19T09:05:51.987Z',
      'finishedDate': undefined,
      'metisPlugins': [
        {
          'pluginType': 'OAIPMH_HARVEST',
          'id': '5bf27ce44bbc6c0008c0f25d-OAIPMH_HARVEST',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': '2018-11-19T09:05:40.910Z',
          'updatedDate': '2018-11-19T09:05:51.987Z',
          'finishedDate': undefined,
          'externalTaskId': '-5975372731849357466',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': TaskState.DROPPED
          },
          'pluginMetadata': {
            'pluginType': 'OAIPMH_HARVEST',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'url': 'https://oai-pmh.eanadev.org/oai',
            'metadataFormat': 'edm',
            'setSpec': '2021006',
            'fromDate': undefined,
            'untilDate': undefined,
            'datasetId': '58',
            'useDefaultIdentifiers': false,
            'identifierPrefixRemoval': undefined
          },
          'topologyName': 'oai_harvest'
        },
        {
          'pluginType': 'VALIDATION_EXTERNAL',
          'id': '5bf27ce44bbc6c0008c0f25e-VALIDATION_EXTERNAL',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_EXTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM.xsd',
            'schematronRootPath': 'schematron/schematron.xsl'
          },
          'topologyName': 'validation'
        }
      ]
    },
    {
      'id': '5bebea4a4bbc6c0008c0cce1',
      'datasetId': '58',
      'workflowStatus': WorkflowStatus.FAILED,
      'ecloudDatasetId': 'fa07e945-48c4-4547-8929-6fde4055a403',
      'workflowPriority': 0,
      'cancelling': false,
      'createdDate': '2018-11-14T09:26:34.718Z',
      'startedDate': '2018-11-14T09:26:34.846Z',
      'updatedDate': '2018-11-14T09:27:16.673Z',
      'finishedDate': undefined,
      'metisPlugins': [
        {
          'pluginType': 'OAIPMH_HARVEST',
          'id': '5bebea4a4bbc6c0008c0ccd8-OAIPMH_HARVEST',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-14T09:26:34.846Z',
          'updatedDate': '2018-11-14T09:26:55.714Z',
          'finishedDate': '2018-11-14T09:26:55.718Z',
          'externalTaskId': '-8787568004595497503',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 0,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'OAIPMH_HARVEST',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'url': 'https://oai-pmh.eanadev.org/oai',
            'metadataFormat': 'edm',
            'setSpec': '2021006',
            'fromDate': undefined,
            'untilDate': undefined,
            'datasetId': '58',
            'useDefaultIdentifiers': false,
            'identifierPrefixRemoval': undefined
          },
          'topologyName': 'oai_harvest'
        },
        {
          'pluginType': 'VALIDATION_EXTERNAL',
          'id': '5bebea4a4bbc6c0008c0ccd9-VALIDATION_EXTERNAL',
          'pluginStatus': PluginStatus.FINISHED,
          'startedDate': '2018-11-14T09:26:55.729Z',
          'updatedDate': '2018-11-14T09:27:11.244Z',
          'finishedDate': '2018-11-14T09:27:11.248Z',
          'externalTaskId': '5489024161574699493',
          'executionProgress': {
            'expectedRecords': 760,
            'processedRecords': 760,
            'progressPercentage': 100,
            'errors': 760,
            'status': TaskState.PROCESSED
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_EXTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': 'OAIPMH_HARVEST',
            'revisionTimestampPreviousPlugin': '2018-11-14T09:26:34.846Z',
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM.xsd',
            'schematronRootPath': 'schematron/schematron.xsl'
          },
          'topologyName': 'validation'
        },
        {
          'pluginType': 'TRANSFORMATION',
          'id': '5bebea4a4bbc6c0008c0ccda-TRANSFORMATION',
          'pluginStatus': PluginStatus.FAILED,
          'startedDate': '2018-11-14T09:27:11.257Z',
          'updatedDate': '2018-11-14T09:27:16.673Z',
          'finishedDate': undefined,
          'externalTaskId': '261431629346917503',
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': TaskState.DROPPED
          },
          'pluginMetadata': {
            'pluginType': 'TRANSFORMATION',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': 'VALIDATION_EXTERNAL',
            'revisionTimestampPreviousPlugin': '2018-11-14T09:26:55.729Z',
            'xsltUrl': 'https://metis-core-rest-test.eanadev.org/datasets/xslt/5b2bb8268e3b95000bacc522',
            'customXslt': false,
            'datasetId': '58',
            'datasetName': '58_dataset_with_long_field',
            'country': 'Greece',
            'language': 'el'
          },
          'topologyName': 'xslt_transform'
        },
        {
          'pluginType': 'VALIDATION_INTERNAL',
          'id': '5bebea4a4bbc6c0008c0ccdb-VALIDATION_INTERNAL',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'VALIDATION_INTERNAL',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'urlOfSchemasZip': 'http://ftp.eanadev.org/schema_zips/europeana_schemas-20180809.zip',
            'schemaRootPath': 'EDM-INTERNAL.xsd',
            'schematronRootPath': 'schematron/schematron-internal.xsl'
          },
          'topologyName': 'validation'
        },
        {
          'pluginType': 'NORMALIZATION',
          'id': '5bebea4a4bbc6c0008c0ccdc-NORMALIZATION',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'NORMALIZATION',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined
          },
          'topologyName': 'normalization'
        },
        {
          'pluginType': 'ENRICHMENT',
          'id': '5bebea4a4bbc6c0008c0ccdd-ENRICHMENT',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'ENRICHMENT',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined
          },
          'topologyName': 'enrichment'
        },
        {
          'pluginType': 'MEDIA_PROCESS',
          'id': '5bebea4a4bbc6c0008c0ccde-MEDIA_PROCESS',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'MEDIA_PROCESS',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'connectionLimitToDomains': {}
          },
          'topologyName': 'media_process'
        },
        {
          'pluginType': 'PREVIEW',
          'id': '5bebea4a4bbc6c0008c0ccdf-PREVIEW',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'PREVIEW',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'datasetId': '58',
            'useAlternativeIndexingEnvironment': false,
            'preserveTimestamps': false
          },
          'topologyName': 'indexer'
        },
        {
          'pluginType': 'PUBLISH',
          'id': '5bebea4a4bbc6c0008c0cce0-PUBLISH',
          'pluginStatus': PluginStatus.CANCELLED,
          'startedDate': undefined,
          'updatedDate': undefined,
          'finishedDate': undefined,
          'externalTaskId': undefined,
          'executionProgress': {
            'expectedRecords': 0,
            'processedRecords': 0,
            'progressPercentage': 0,
            'errors': 0,
            'status': undefined
          },
          'pluginMetadata': {
            'pluginType': 'PUBLISH',
            'mocked': false,
            'enabled': true,
            'revisionNamePreviousPlugin': undefined,
            'revisionTimestampPreviousPlugin': undefined,
            'datasetId': '58',
            'useAlternativeIndexingEnvironment': false,
            'preserveTimestamps': false
          },
          'topologyName': 'indexer'
        }
      ]
    }
  ],
  'listSize': 5,
  'nextPage': -1
};
