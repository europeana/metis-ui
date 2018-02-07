import { WorkflowService } from '../_services';

export class MockWorkflowService extends WorkflowService {

  mockedDataset: any = { 
    country: {enum: 'AZERBAIJAN', name: 'Azerbaijan', isoCode: 'AZ'},
    createdByUserId: '1482250000003948001',
    createdDate: '2018-01-16T07:31:20.865Z',
    dataProvider: '',
    datasetId: 84,
    datasetName: 'TestMirjam15',
    description:'',
    ecloudDatasetId: 'bb63d3b3-d9fa-4bad-ac50-d8fd4476dda1',
    harvestingMetadata: {pluginType: 'OAIPMH_HARVEST', mocked: true, url: '', metadataFormat: '', setSpec: ''},
    id: '5a5daa48a458bb00083d49bb',
    intermediateProvider: '',
    language: {enum: 'CY', name: 'Welsh'},
    notes: '',
    organizationId: '1482250000001617026',
    organizationName: 'Europeana Foundation',
    provider: '1234',
    replacedBy: '',
    replaces: '',
    updatedDate: '2018-01-16T11:04:14.103Z'
  }

  mockedWorkflow: any = 
  {
    "results": [
        {
            "id": "5a7b03f03d330700087a48a4",
            "datasetId": 147,
            "workflowOwner": "owner1",
            "workflowName": "harvest_and_validation_external",
            "workflowStatus": "FAILED",
            "ecloudDatasetId": "60276b9b-4faf-42c7-a5e2-328c7d58dde3",
            "workflowPriority": 0,
            "cancelling": false,
            "createdDate": "2018-02-07T13:49:36.593Z",
            "startedDate": "2018-02-07T13:49:46.651Z",
            "updatedDate": "2018-02-07T13:50:02.333Z",
            "finishedDate": null,
            "metisPlugins": [
                {
                    "pluginType": "OAIPMH_HARVEST",
                    "id": "5a7b03f03d330700087a48a2-OAIPMH_HARVEST",
                    "pluginStatus": "FINISHED",
                    "startedDate": "2018-02-07T13:49:46.651Z",
                    "updatedDate": "2018-02-07T13:49:57.130Z",
                    "finishedDate": "2018-02-07T13:49:57.133Z",
                    "externalTaskId": "-4764306484012037563",
                    "executionProgress": {
                        "expectedRecords": -1,
                        "processedRecords": 13,
                        "progressPercentage": -1,
                        "errors": 0,
                        "status": "PROCESSED"
                    },
                    "pluginMetadata": {
                        "pluginType": "OAIPMH_HARVEST",
                        "mocked": false,
                        "revisionNamePreviousPlugin": null,
                        "revisionTimestampPreviousPlugin": null,
                        "url": "http://agregator.nb.rs/oai/OAIHandler",
                        "metadataFormat": "edm",
                        "setSpec": "oai_test",
                        "fromDate": null,
                        "untilDate": null
                    },
                    "topologyName": "oai_harvest"
                },
                {
                    "pluginType": "VALIDATION_EXTERNAL",
                    "id": "5a7b03f03d330700087a48a3-VALIDATION_EXTERNAL",
                    "pluginStatus": "FAILED",
                    "startedDate": "2018-02-07T13:49:57.143Z",
                    "updatedDate": "2018-02-07T13:50:02.333Z",
                    "finishedDate": null,
                    "externalTaskId": "-4920038554569060959",
                    "executionProgress": {
                        "expectedRecords": 0,
                        "processedRecords": 0,
                        "progressPercentage": 0,
                        "errors": 0,
                        "status": "DROPPED"
                    },
                    "pluginMetadata": {
                        "pluginType": "VALIDATION_EXTERNAL",
                        "mocked": false,
                        "revisionNamePreviousPlugin": "OAIPMH_HARVEST",
                        "revisionTimestampPreviousPlugin": "2018-02-07T13:49:46.651Z",
                        "urlOfSchemasZip": null,
                        "schemaRootPath": null,
                        "schematronRootPath": null
                    },
                    "topologyName": "validation"
                }
            ]
        },
        {
            "id": "5a7b03b63d330700087a48a1",
            "datasetId": 147,
            "workflowOwner": "owner1",
            "workflowName": "harvest_and_validation_external",
            "workflowStatus": "FAILED",
            "ecloudDatasetId": "60276b9b-4faf-42c7-a5e2-328c7d58dde3",
            "workflowPriority": 0,
            "cancelling": false,
            "createdDate": "2018-02-07T13:48:38.831Z",
            "startedDate": "2018-02-07T13:48:48.881Z",
            "updatedDate": "2018-02-07T13:49:04.533Z",
            "finishedDate": null,
            "metisPlugins": [
                {
                    "pluginType": "OAIPMH_HARVEST",
                    "id": "5a7b03b63d330700087a489f-OAIPMH_HARVEST",
                    "pluginStatus": "FINISHED",
                    "startedDate": "2018-02-07T13:48:48.881Z",
                    "updatedDate": "2018-02-07T13:48:59.320Z",
                    "finishedDate": "2018-02-07T13:48:59.323Z",
                    "externalTaskId": "-7625521638804666547",
                    "executionProgress": {
                        "expectedRecords": -1,
                        "processedRecords": 13,
                        "progressPercentage": -1,
                        "errors": 0,
                        "status": "PROCESSED"
                    },
                    "pluginMetadata": {
                        "pluginType": "OAIPMH_HARVEST",
                        "mocked": false,
                        "revisionNamePreviousPlugin": null,
                        "revisionTimestampPreviousPlugin": null,
                        "url": "http://agregator.nb.rs/oai/OAIHandler",
                        "metadataFormat": "edm",
                        "setSpec": "oai_test",
                        "fromDate": null,
                        "untilDate": null
                    },
                    "topologyName": "oai_harvest"
                },
                {
                    "pluginType": "VALIDATION_EXTERNAL",
                    "id": "5a7b03b63d330700087a48a0-VALIDATION_EXTERNAL",
                    "pluginStatus": "FAILED",
                    "startedDate": "2018-02-07T13:48:59.327Z",
                    "updatedDate": "2018-02-07T13:49:04.533Z",
                    "finishedDate": null,
                    "externalTaskId": "9035078622010363850",
                    "executionProgress": {
                        "expectedRecords": 0,
                        "processedRecords": 0,
                        "progressPercentage": 0,
                        "errors": 0,
                        "status": "DROPPED"
                    },
                    "pluginMetadata": {
                        "pluginType": "VALIDATION_EXTERNAL",
                        "mocked": false,
                        "revisionNamePreviousPlugin": "OAIPMH_HARVEST",
                        "revisionTimestampPreviousPlugin": "2018-02-07T13:48:48.881Z",
                        "urlOfSchemasZip": null,
                        "schemaRootPath": null,
                        "schematronRootPath": null
                    },
                    "topologyName": "validation"
                }
            ]
        },
        {
            "id": "5a7b03913d330700087a489e",
            "datasetId": 147,
            "workflowOwner": "owner1",
            "workflowName": "harvest_and_validation_external",
            "workflowStatus": "FAILED",
            "ecloudDatasetId": "60276b9b-4faf-42c7-a5e2-328c7d58dde3",
            "workflowPriority": 0,
            "cancelling": false,
            "createdDate": "2018-02-07T13:48:01.591Z",
            "startedDate": "2018-02-07T13:48:11.646Z",
            "updatedDate": "2018-02-07T13:48:27.332Z",
            "finishedDate": null,
            "metisPlugins": [
                {
                    "pluginType": "OAIPMH_HARVEST",
                    "id": "5a7b03913d330700087a489c-OAIPMH_HARVEST",
                    "pluginStatus": "FINISHED",
                    "startedDate": "2018-02-07T13:48:11.646Z",
                    "updatedDate": "2018-02-07T13:48:22.105Z",
                    "finishedDate": "2018-02-07T13:48:22.114Z",
                    "externalTaskId": "1058184108554996456",
                    "executionProgress": {
                        "expectedRecords": -1,
                        "processedRecords": 13,
                        "progressPercentage": -1,
                        "errors": 0,
                        "status": "PROCESSED"
                    },
                    "pluginMetadata": {
                        "pluginType": "OAIPMH_HARVEST",
                        "mocked": false,
                        "revisionNamePreviousPlugin": null,
                        "revisionTimestampPreviousPlugin": null,
                        "url": "http://agregator.nb.rs/oai/OAIHandler",
                        "metadataFormat": "edm",
                        "setSpec": "oai_test",
                        "fromDate": null,
                        "untilDate": null
                    },
                    "topologyName": "oai_harvest"
                },
                {
                    "pluginType": "VALIDATION_EXTERNAL",
                    "id": "5a7b03913d330700087a489d-VALIDATION_EXTERNAL",
                    "pluginStatus": "FAILED",
                    "startedDate": "2018-02-07T13:48:22.123Z",
                    "updatedDate": "2018-02-07T13:48:27.332Z",
                    "finishedDate": null,
                    "externalTaskId": "-4919136934375505100",
                    "executionProgress": {
                        "expectedRecords": 0,
                        "processedRecords": 0,
                        "progressPercentage": 0,
                        "errors": 0,
                        "status": "DROPPED"
                    },
                    "pluginMetadata": {
                        "pluginType": "VALIDATION_EXTERNAL",
                        "mocked": false,
                        "revisionNamePreviousPlugin": "OAIPMH_HARVEST",
                        "revisionTimestampPreviousPlugin": "2018-02-07T13:48:11.646Z",
                        "urlOfSchemasZip": null,
                        "schemaRootPath": null,
                        "schematronRootPath": null
                    },
                    "topologyName": "validation"
                }
            ]
        },
        {
            "id": "5a7b01363d330700087a4899",
            "datasetId": 147,
            "workflowOwner": "owner1",
            "workflowName": "harvest_and_validation_external",
            "workflowStatus": "FAILED",
            "ecloudDatasetId": "60276b9b-4faf-42c7-a5e2-328c7d58dde3",
            "workflowPriority": 0,
            "cancelling": false,
            "createdDate": "2018-02-07T13:37:58.288Z",
            "startedDate": "2018-02-07T13:38:08.360Z",
            "updatedDate": "2018-02-07T13:38:24.042Z",
            "finishedDate": null,
            "metisPlugins": [
                {
                    "pluginType": "OAIPMH_HARVEST",
                    "id": "5a7b01363d330700087a4897-OAIPMH_HARVEST",
                    "pluginStatus": "FINISHED",
                    "startedDate": "2018-02-07T13:38:08.360Z",
                    "updatedDate": "2018-02-07T13:38:18.804Z",
                    "finishedDate": "2018-02-07T13:38:18.812Z",
                    "externalTaskId": "-1355145172509047576",
                    "executionProgress": {
                        "expectedRecords": -1,
                        "processedRecords": 13,
                        "progressPercentage": -1,
                        "errors": 0,
                        "status": "PROCESSED"
                    },
                    "pluginMetadata": {
                        "pluginType": "OAIPMH_HARVEST",
                        "mocked": false,
                        "revisionNamePreviousPlugin": null,
                        "revisionTimestampPreviousPlugin": null,
                        "url": "http://agregator.nb.rs/oai/OAIHandler",
                        "metadataFormat": "edm",
                        "setSpec": "oai_test",
                        "fromDate": null,
                        "untilDate": null
                    },
                    "topologyName": "oai_harvest"
                },
                {
                    "pluginType": "VALIDATION_EXTERNAL",
                    "id": "5a7b01363d330700087a4898-VALIDATION_EXTERNAL",
                    "pluginStatus": "FAILED",
                    "startedDate": "2018-02-07T13:38:18.818Z",
                    "updatedDate": "2018-02-07T13:38:24.042Z",
                    "finishedDate": null,
                    "externalTaskId": "-3524774018248717674",
                    "executionProgress": {
                        "expectedRecords": 0,
                        "processedRecords": 0,
                        "progressPercentage": 0,
                        "errors": 0,
                        "status": "DROPPED"
                    },
                    "pluginMetadata": {
                        "pluginType": "VALIDATION_EXTERNAL",
                        "mocked": false,
                        "revisionNamePreviousPlugin": "OAIPMH_HARVEST",
                        "revisionTimestampPreviousPlugin": "2018-02-07T13:38:08.360Z",
                        "urlOfSchemasZip": null,
                        "schemaRootPath": null,
                        "schematronRootPath": null
                    },
                    "topologyName": "validation"
                }
            ]
        },
        {
            "id": "5a7b00ff3d330700087a4896",
            "datasetId": 147,
            "workflowOwner": "owner1",
            "workflowName": "harvest_and_validation_external",
            "workflowStatus": "FAILED",
            "ecloudDatasetId": "60276b9b-4faf-42c7-a5e2-328c7d58dde3",
            "workflowPriority": 0,
            "cancelling": false,
            "createdDate": "2018-02-07T13:37:03.856Z",
            "startedDate": "2018-02-07T13:37:13.906Z",
            "updatedDate": "2018-02-07T13:37:29.599Z",
            "finishedDate": null,
            "metisPlugins": [
                {
                    "pluginType": "OAIPMH_HARVEST",
                    "id": "5a7b00ff3d330700087a4894-OAIPMH_HARVEST",
                    "pluginStatus": "FINISHED",
                    "startedDate": "2018-02-07T13:37:13.906Z",
                    "updatedDate": "2018-02-07T13:37:24.375Z",
                    "finishedDate": "2018-02-07T13:37:24.378Z",
                    "externalTaskId": "3505632908625792107",
                    "executionProgress": {
                        "expectedRecords": -1,
                        "processedRecords": 13,
                        "progressPercentage": -1,
                        "errors": 0,
                        "status": "PROCESSED"
                    },
                    "pluginMetadata": {
                        "pluginType": "OAIPMH_HARVEST",
                        "mocked": false,
                        "revisionNamePreviousPlugin": null,
                        "revisionTimestampPreviousPlugin": null,
                        "url": "http://agregator.nb.rs/oai/OAIHandler",
                        "metadataFormat": "edm",
                        "setSpec": "oai_test",
                        "fromDate": null,
                        "untilDate": null
                    },
                    "topologyName": "oai_harvest"
                },
                {
                    "pluginType": "VALIDATION_EXTERNAL",
                    "id": "5a7b00ff3d330700087a4895-VALIDATION_EXTERNAL",
                    "pluginStatus": "FAILED",
                    "startedDate": "2018-02-07T13:37:24.385Z",
                    "updatedDate": "2018-02-07T13:37:29.599Z",
                    "finishedDate": null,
                    "externalTaskId": "-7711580320556232711",
                    "executionProgress": {
                        "expectedRecords": 0,
                        "processedRecords": 0,
                        "progressPercentage": 0,
                        "errors": 0,
                        "status": "DROPPED"
                    },
                    "pluginMetadata": {
                        "pluginType": "VALIDATION_EXTERNAL",
                        "mocked": false,
                        "revisionNamePreviousPlugin": "OAIPMH_HARVEST",
                        "revisionTimestampPreviousPlugin": "2018-02-07T13:37:13.906Z",
                        "urlOfSchemasZip": null,
                        "schemaRootPath": null,
                        "schematronRootPath": null
                    },
                    "topologyName": "validation"
                }
            ]
        }
    ],
    "listSize": 5,
    "nextPage": 1
};

  getAllExecutions(id, page?, workflow?) {
    return this.mockedWorkflow;
  }

  getWorkflows() {
    let workflows = ['mocked'];
    return workflows ;
  }

  getCurrentPage() {
    return 1;
  }

}
