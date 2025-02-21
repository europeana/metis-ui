import { DatasetSearchView, PublicationFitness } from '../../src/app/_models/dataset-shared';
import { DatasetDepublicationStatus, HarvestData } from '../../src/app/_models/harvest-data';
import { ThrottleLevel, Workflow, XmlSample } from '../../src/app/_models';
import {
  DatasetX,
  DateBumpType,
  PluginRunConf,
  ResultList,
  WorkflowX,
  WorkflowXRunConf
} from '../_models/test-models';
import { DepublicationReasonHash } from '../_data/depublication-reasons';
import { xsltDefault } from '../_data/xslt';
import {
  DatasetExecutionProgress,
  DatasetOverview,
  DatasetOverviewExecution,
  ExecutionProgress,
  PluginAvailabilityList,
  PluginExecution,
  PluginExecutionOverview,
  PluginStatus,
  PluginType,
  TopologyName,
  WorkflowExecution,
  WorkflowExecutionHistory,
  WorkflowStatus
} from '../../src/app/_models/workflow-execution';
import { HistoryVersion, HistoryVersions } from '../../src/app/_models/xml-sample';
import { PluginMetadata } from '../../src/app/_models/plugin-metadata';
import { Report, ReportAvailability } from '../../src/app/_models/report';

let datasetXs: Array<DatasetX> = [];
const baseDate = new Date('2019-02-18T07:36:59.801Z');
const pageSize = 2;

const fullSequenceTypesOAIPMH = Object.values(PluginType).filter((pType: PluginType) => {
  return pType !== PluginType.HTTP_HARVEST;
});

const fullSequenceTypesHTTP = Object.values(PluginType).filter((pType: PluginType) => {
  return pType !== PluginType.OAIPMH_HARVEST;
});

function pluginExecutionIsHarvest(pe: PluginExecution): boolean {
  return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].includes(pe.pluginType);
}

function pluginExecutionCanHaveDeleted(pe: PluginExecution): boolean {
  return (
    pluginExecutionIsHarvest(pe) || [PluginType.PUBLISH, PluginType.PREVIEW].includes(pe.pluginType)
  );
}

function pluginExecutionQueuesNext(status: PluginStatus): boolean {
  return (
    [
      PluginStatus.INQUEUE,
      PluginStatus.PENDING,
      PluginStatus.RUNNING,
      PluginStatus.CLEANING,
      PluginStatus.IDENTIFYING_DELETED_RECORDS
    ].indexOf(status) > -1
  );
}

function overviewExecutionFromExecution(execution: WorkflowExecution): DatasetOverviewExecution {
  return {
    id: execution.id,
    finishedDate: execution.finishedDate,
    startedDate: execution.startedDate,

    plugins: execution.metisPlugins.map((pe: PluginExecution) => {
      return {
        id: pe.id,
        failMessage: pe.failMessage,
        pluginType: pe.pluginType,
        pluginStatus: pe.pluginStatus,
        progress: pe.executionProgress,
        startedDate: pe.startedDate,
        finishedDate: pe.finishedDate
      } as PluginExecutionOverview;
    })
  };
}

/** generateDate
/* moves the baseDate forward and returns it as an ISO string
/* @param {DateBumpType} bumpType - specifies how to advance the baseDate
*/
function generateDate(bumpType: DateBumpType): string {
  if (bumpType === DateBumpType.SECOND) {
    baseDate.setSeconds(baseDate.getSeconds() + 1);
  } else if (bumpType === DateBumpType.MINUTE) {
    baseDate.setMinutes(baseDate.getMinutes() + 1);
  } else if (bumpType === DateBumpType.HOUR) {
    baseDate.setHours(baseDate.getHours() + 1);
  } else if (bumpType === DateBumpType.DATE) {
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return baseDate.toISOString();
}

/** runPlugin
/* simulates run of workflow
/* @param {string} id - the dataset id
/* @param {PluginMetadata} pmd - the plugin metadata
/* @param {PluginStatus} status - the plugin status
*/
function runPlugin(id: string, pmd: PluginMetadata, status: PluginStatus): PluginExecution {
  const cancelled = status === PluginStatus.CANCELLED;
  const failed = status === PluginStatus.FAILED;

  return {
    id: id,
    externalTaskId: id,
    pluginMetadata: pmd,
    topologyName: pmd.pluginType.toLowerCase() as TopologyName,
    pluginType: pmd.pluginType,
    pluginStatus: status,
    canDisplayRawXml: !(cancelled || failed),
    startedDate: cancelled ? undefined : generateDate(DateBumpType.SECOND),
    updatedDate: cancelled ? undefined : generateDate(DateBumpType.MINUTE),
    finishedDate: status === PluginStatus.FINISHED ? generateDate(DateBumpType.SECOND) : undefined,

    failMessage: failed ? 'fail message' : undefined
  } as PluginExecution;
}

function getExecutionProgress(conf: PluginRunConf): ExecutionProgress {
  return {
    expectedRecords: conf.numExpected,
    processedRecords: conf.numDone,
    deletedRecords: conf.numDeleted,
    progressPercentage:
      conf.numDone && conf.numExpected ? (conf.numDone / conf.numExpected) * 100 : '',
    errors: conf.numErr,
    status: 'PROCESSED'
  } as ExecutionProgress;
}

function runWorkflow(workflow: WorkflowX, executionId: string): WorkflowExecution {
  const wConf = workflow.conf;
  let makePluginCancelled = false;
  let makePluginQueue = false;
  let peIndex = 0;
  let peErrors = 0;

  const workflowExecution = {
    id: executionId,
    datasetId: workflow.datasetId,
    isIncremental: wConf.deletedRecords ? true : false,
    workflowStatus: WorkflowStatus.INQUEUE,
    ecloudDatasetId: 'e-cloud-dataset-id',

    workflowPriority: 0,
    cancelling: false,

    createdDate: generateDate(DateBumpType.MINUTE),
    startedDate: generateDate(DateBumpType.MINUTE),
    startedBy: '1482250000001617026',

    metisPlugins: workflow.metisPluginsMetadata.map((pmd: PluginMetadata, i) => {
      const fallbackStatus =
        wConf.unfinished && wConf.unfinished.index === i
          ? wConf.unfinished.status
          : PluginStatus.FINISHED;

      const status = makePluginCancelled
        ? PluginStatus.CANCELLED
        : makePluginQueue
        ? PluginStatus.INQUEUE
        : fallbackStatus;

      // run plugin

      const pe = runPlugin('' + peIndex, pmd, status);

      peIndex++;

      // get stats

      if (
        [PluginType.VALIDATION_EXTERNAL, PluginType.VALIDATION_INTERNAL].indexOf(pe.pluginType) > -1
      ) {
        const deduct = 7;
        if (wConf.expectedRecords > deduct) {
          wConf.expectedRecords -= deduct;
          peErrors += deduct;
        }
      }

      const prc = {
        numExpected: wConf.expectedRecords,
        numDeleted:
          pluginExecutionCanHaveDeleted(pe) && wConf.deletedRecords ? wConf.deletedRecords : 0,
        numDone: 0,
        numErr: peErrors
      };

      if ([PluginStatus.FAILED, PluginStatus.CANCELLED].indexOf(status) > -1) {
        makePluginCancelled = true;
      }
      if (pluginExecutionQueuesNext(status)) {
        makePluginQueue = true;
      }
      if (PluginStatus.FINISHED === status) {
        prc.numDone = prc.numExpected;
      } else if (PluginStatus.RUNNING === status) {
        prc.numDone = Math.floor(Math.max(prc.numExpected, 1) / i);
      } else if (PluginStatus.INQUEUE) {
        prc.numDone = 0;
        prc.numExpected = 0;
        prc.numErr = 0;
      }
      pe.executionProgress = getExecutionProgress(prc);
      return pe;
    })
  } as WorkflowExecution;

  const plugins = workflowExecution.metisPlugins;

  if (
    plugins.filter((pe) => {
      return pe.pluginStatus === PluginStatus.FAILED;
    }).length > 0
  ) {
    workflowExecution.workflowStatus = WorkflowStatus.FAILED;
  } else if (
    plugins.filter((pe) => {
      return pe.pluginStatus === PluginStatus.CANCELLED;
    }).length > 0
  ) {
    workflowExecution.cancelledBy = '123';
    workflowExecution.cancelling = true;
    workflowExecution.workflowStatus = WorkflowStatus.CANCELLED;
  } else if (
    plugins.filter((pe) => {
      return pe.pluginStatus === PluginStatus.RUNNING;
    }).length > 0
  ) {
    workflowExecution.workflowStatus = WorkflowStatus.RUNNING;
  } else if (
    plugins.filter((pe) => {
      return pe.pluginStatus === PluginStatus.IDENTIFYING_DELETED_RECORDS;
    }).length === plugins.length
  ) {
    workflowExecution.workflowStatus = WorkflowStatus.RUNNING;
  } else if (
    plugins.filter((pe) => {
      return pe.pluginStatus === PluginStatus.FINISHED;
    }).length === plugins.length
  ) {
    workflowExecution.updatedDate = generateDate(DateBumpType.MINUTE);
    workflowExecution.finishedDate = generateDate(DateBumpType.SECOND);
    workflowExecution.workflowStatus = WorkflowStatus.FINISHED;
  }
  return workflowExecution;
}

function generatePluginMetadata(pType: PluginType, metadataIndex = 1): PluginMetadata {
  return {
    pluginType: pType,
    enabled: true,
    url: pType === PluginType.OAIPMH_HARVEST ? 'https://oaipmh.com' : 'https://harvest.com',
    metadataFormat: pType === PluginType.OAIPMH_HARVEST ? 'edm' : undefined,
    setSpec: pType === PluginType.OAIPMH_HARVEST ? 'setSpec' : undefined,
    incrementalHarvest: pType === PluginType.OAIPMH_HARVEST ? true : undefined,
    customXslt: pType === PluginType.TRANSFORMATION ? metadataIndex % 2 === 0 : undefined,
    throttlingLevel:
      pType === PluginType.MEDIA_PROCESS
        ? metadataIndex % 2 === 1
          ? ThrottleLevel.STRONG
          : ThrottleLevel.WEAK
        : undefined,
    depublicationReason:
      pType === PluginType.DEPUBLISH
        ? metadataIndex === 1
          ? DepublicationReasonHash['GDPR']
          : DepublicationReasonHash['REMOVED_DATA_AT_SOURCE']
        : undefined,
    datasetDepublish:
      pType === PluginType.DEPUBLISH ? (metadataIndex === 1 ? true : false) : undefined,
    recordIdsToDepublish:
      pType === PluginType.DEPUBLISH ? (metadataIndex === 1 ? undefined : [1, 2, 4]) : undefined
  } as PluginMetadata;
}

/** updateHarvestData
/* returns a ResultList from the supplied array
/* @param {HarvestData} info to update
/* @param {PluginExecution} execution to read
*/
function updateHarvestData(info: HarvestData, pe: PluginExecution): void {
  if (pe.finishedDate) {
    if (pe.pluginType === PluginType.PREVIEW) {
      if (info.lastPreviewDate.length === 0) {
        info.lastPreviewDate = pe.finishedDate;
        info.lastPreviewRecordsReadyForViewing = pe.pluginStatus === PluginStatus.FINISHED;
      }
      if (pe.executionProgress) {
        info.lastPreviewRecords = pe.executionProgress.processedRecords;
      }
    } else if (pe.pluginType === PluginType.PUBLISH) {
      info.firstPublishedDate = pe.finishedDate;

      if (info.lastPublishedDate.length === 0) {
        info.lastPublishedDate = pe.finishedDate;
        info.lastPublishedRecordsReadyForViewing = pe.pluginStatus === PluginStatus.FINISHED;
      }
      if (pe.executionProgress) {
        info.lastPreviewRecords = pe.executionProgress.processedRecords;
        info.lastPublishedRecords = pe.executionProgress.processedRecords;
        info.lastDepublishedRecords = pe.executionProgress.processedRecords;
        info.publicationStatus = DatasetDepublicationStatus.DEPUBLISHED;
      }
    } else if (pluginExecutionIsHarvest(pe)) {
      if (info.lastHarvestedDate.length === 0) {
        info.lastHarvestedDate = pe.finishedDate;
      }
      if (pe.executionProgress) {
        info.lastHarvestedRecords = pe.executionProgress.processedRecords;
      }
    }
  }
}

/** dataset
/* returns a DatasetX
/* @param {string} datasetId - the datasetId
*/
export function dataset(datasetId: string): DatasetX | undefined {
  if (datasetXs.length > 0) {
    const matchingDatasets = datasetXs.filter((datasetX: DatasetX) => {
      return datasetX.datasetId === datasetId;
    });
    if (matchingDatasets.length > 0) {
      return matchingDatasets.pop();
    }
  }
  return undefined;
}

/** information
/* @param {string} the information to return
/* return empty HarvestData if param not specified
*/
export function information(informationId?: string): HarvestData {
  if (typeof informationId !== 'undefined') {
    const dsx = dataset(informationId);
    if (dsx && dsx.workflows && dsx.workflows.length > 0 && dsx.workflows[0].harvestData) {
      return dsx.workflows[0].harvestData;
    }
    return information();
  } else {
    return {
      lastPreviewDate: '',
      lastPreviewRecords: 0,
      lastPreviewRecordsReadyForViewing: false,
      firstPublishedDate: '',
      depublicationStatus: DatasetDepublicationStatus.PUBLISHED,
      lastPublishedDate: '',
      lastPublishedRecords: 0,
      lastDepublishedRecords: 0,
      lastPublishedRecordsReadyForViewing: false,
      lastHarvestedDate: '',
      lastHarvestedRecords: 0,
      totalPreviewRecords: 0,
      totalPublishedRecords: 0
    } as HarvestData;
  }
}

datasetXs = ((): Array<DatasetX> => {
  let weIndex = 0;
  const workflowsByDS = [
    [
      {
        conf: {
          expectedRecords: 879
        },
        metisPluginsMetadata: fullSequenceTypesOAIPMH.map(
          (type: PluginType, metadataIndex: number) => {
            return generatePluginMetadata(type, metadataIndex);
          }
        )
      },
      {
        conf: {
          expectedRecords: 1200,
          numExecutions: 2,
          unfinished: {
            index: 5,
            status: PluginStatus.RUNNING
          }
        },
        metisPluginsMetadata: fullSequenceTypesHTTP
          .slice(0, 5)
          .concat(PluginType.LINK_CHECKING)
          .map((type: PluginType) => {
            return generatePluginMetadata(type);
          })
      }
    ],
    [
      {
        conf: {
          expectedRecords: 418,
          unfinished: {
            index: 2,
            status: PluginStatus.RUNNING
          },
          deletedRecords: 0
        },
        metisPluginsMetadata: [
          generatePluginMetadata(PluginType.HTTP_HARVEST),
          generatePluginMetadata(PluginType.VALIDATION_EXTERNAL),
          generatePluginMetadata(PluginType.TRANSFORMATION),
          generatePluginMetadata(PluginType.VALIDATION_INTERNAL),
          generatePluginMetadata(PluginType.NORMALIZATION)
        ]
      }
    ],
    [
      {
        conf: {
          expectedRecords: 762,
          unfinished: {
            index: 4,
            status: PluginStatus.CANCELLED
          },
          deletedRecords: 200
        },
        metisPluginsMetadata: fullSequenceTypesOAIPMH.slice(0, 7).map((type: PluginType) => {
          return generatePluginMetadata(type);
        })
      }
    ],
    [
      {
        conf: {
          expectedRecords: 209,
          unfinished: {
            index: 2,
            status: PluginStatus.IDENTIFYING_DELETED_RECORDS
          },
          deletedRecords: 0
        },
        metisPluginsMetadata: [
          generatePluginMetadata(PluginType.HTTP_HARVEST),
          generatePluginMetadata(PluginType.VALIDATION_EXTERNAL),
          generatePluginMetadata(PluginType.TRANSFORMATION),
          generatePluginMetadata(PluginType.VALIDATION_INTERNAL),
          generatePluginMetadata(PluginType.NORMALIZATION),
          generatePluginMetadata(PluginType.DEPUBLISH)
        ]
      }
    ]
  ]; // END CONF

  return workflowsByDS
    .map(
      (
        workflows: Array<{ conf: WorkflowXRunConf; metisPluginsMetadata: Array<PluginMetadata> }>,
        ds_index: number
      ) => {
        return workflows.map(
          (
            w: { conf?: WorkflowXRunConf; metisPluginsMetadata: Array<PluginMetadata> },
            workflowId
          ) => {
            // turn config into (extended) WorkFlow objects
            return {
              id: 'workflow-' + workflowId,
              datasetId: '' + ds_index,
              conf: w.conf ? w.conf : {},
              metisPluginsMetadata: w.metisPluginsMetadata
            } as WorkflowX;
          }
        );
      }
    )
    .map((workflows: Array<WorkflowX>) => {
      const datasetId = workflows[0].datasetId;
      const datasetName =
        datasetId === '3'
          ? 'Automation_Unusual_Namespace_Firefox_Regression_MET5709_Test_Overlap_Check'
          : 'Dataset_' + (parseInt(datasetId) + 1);
      const datasetX = {
        id: datasetId,
        ecloudDatasetId: 'e-cloud-dataset-id-' + datasetId,
        xsltId: parseInt(datasetId) % 2 === 0 ? datasetId : undefined,
        datasetId: datasetId,
        datasetName: datasetName,
        datasetIdsToRedirectFrom: ['0', '1'],
        organizationId: 'organisation-id',
        organizationName: 'Europeana Foundation',
        provider: 'Europeana Provider',
        dataProvider: 'Europeana Data Provider',
        createdByUserId: '123',
        createdDate: generateDate(DateBumpType.DATE),
        country: {
          enum: 'FINLAND',
          name: 'Finland',
          isoCode: 'FI'
        },
        language: {
          enum: 'GD',
          name: 'Gaelic (Scottish)'
        },
        description: '',
        intermediateProvider: '',
        notes: '',
        replacedBy: '',
        replaces: '',
        publicationFitness:
          parseInt(datasetId) % 3 == 1
            ? PublicationFitness.PARTIALLY_FIT
            : PublicationFitness.UNFIT,
        workflows: workflows,
        updatedDate: generateDate(DateBumpType.MINUTE)
      } as DatasetX;

      if (datasetX.workflows) {
        datasetX.workflows.forEach((w: WorkflowX) => {
          const harvestData = information();

          w.executions = [];
          const numExecutions = w.conf.numExecutions ? w.conf.numExecutions : 1;

          // "run" the Workflows
          for (let i = 0; i < numExecutions; i++) {
            const wExec = runWorkflow(w, `${weIndex}`);

            w.executions.push(wExec);

            wExec.metisPlugins.forEach((pe: PluginExecution) => {
              updateHarvestData(harvestData, pe);
            });
            weIndex++;
          }

          w.harvestData = harvestData;
        });
      }
      return datasetX;
    });
})();

/** getListResultWrapper
/* returns a ResultList from the supplied array
/* @param {array} list - optional
/* @param {boolean} fromZero - optional - include results from zero
/* @param {number} page - optional- the page to return
*/
export function getListWrapper(list: Array<object> = [], fromZero = false, page = 0): ResultList {
  const sliceIndex = page * pageSize;
  const results = list.slice(fromZero ? 0 : sliceIndex, sliceIndex + pageSize);
  const more = list && list.length > (page + 1) * pageSize;
  return {
    results: results,
    listSize: list.length,
    nextPage: more ? 1 : -1
  };
}

function generateDatasetExecutionProgress(
  pExecutions: Array<PluginExecution>
): DatasetExecutionProgress {
  const res = {
    stepsDone: pExecutions.filter((e) => {
      return (
        [PluginStatus.FINISHED, PluginStatus.CANCELLED, PluginStatus.FAILED].indexOf(
          e.pluginStatus
        ) > -1
      );
    }).length,
    stepsTotal: pExecutions.length
  } as DatasetExecutionProgress;

  pExecutions.forEach((pe) => {
    if (pe.pluginStatus === PluginStatus.RUNNING) {
      res.currentPluginProgress = pe.executionProgress as ExecutionProgress;
    }
  });

  return res;
}

function getMostRecentExecutionByDatasetId(datasetId: string): Array<WorkflowExecution> {
  const mostRecentExec = [dataset(datasetId)].map((datasetX: DatasetX | undefined) => {
    const w = datasetX && datasetX.workflows ? datasetX.workflows.slice(0, 1)[0] : undefined;
    return w ? w.executions : [];
  });

  if (mostRecentExec) {
    const first = mostRecentExec[0];
    if (first) {
      return first;
    }
  }
  return [];
}

export function overview(page = 0): ResultList {
  const res: Array<DatasetOverview> = [];

  datasetXs.forEach((datasetX) => {
    if (datasetX && datasetX.workflows) {
      datasetX.workflows.forEach((w: WorkflowX) => {
        if (w.executions) {
          w.executions.forEach((we: WorkflowExecution) => {
            res.push({
              dataset: datasetX,
              executionProgress: generateDatasetExecutionProgress(we.metisPlugins),
              execution: overviewExecutionFromExecution(we)
            } as DatasetOverview);
          });
        }
      });
    }
  });
  // page parameter based on 1 in this case so deduct 1
  return getListWrapper(res, true, page > 0 ? page - 1 : page);
}

export function running(page = 0): ResultList {
  const res: Array<WorkflowExecution> = [];

  datasetXs.forEach((datasetX) => {
    if (datasetX.workflows) {
      datasetX.workflows.forEach((wx: WorkflowX) => {
        if (wx.executions) {
          wx.executions.forEach((we: WorkflowExecution) => {
            let hasRuning = false;
            we.metisPlugins.forEach((pe: PluginExecution) => {
              if (pe.pluginStatus === PluginStatus.RUNNING) {
                hasRuning = true;
              }
            });
            if (hasRuning) {
              res.push(we);
            }
          });
        }
      });
    }
  });
  return getListWrapper(res, false, page);
}

/** executionsHistory
/* @param {string} datasetId
/* return dataset's workflow's WorkflowExecutionHistory
*/
export function executionsHistory(
  datasetId: string
): { executions: Array<WorkflowExecutionHistory> } {
  const res: Array<WorkflowExecutionHistory> = [];

  [dataset(datasetId)].forEach((datasetX: DatasetX | undefined) => {
    if (datasetX && datasetX.workflows) {
      datasetX.workflows.forEach((w) => {
        if (w && w.executions) {
          w.executions.forEach((e) => {
            res.push({
              workflowExecutionId: e.id,
              startedDate: e.startedDate
            });
          });
        }
      });
    }
  });
  return { executions: res };
}

export function pluginsAvailable(executionId: string): PluginAvailabilityList {
  const res: PluginAvailabilityList = { plugins: [] };

  datasetXs.forEach((datasetX: DatasetX) => {
    if (datasetX && datasetX.workflows) {
      datasetX.workflows.forEach((w) => {
        if (w && w.executions) {
          w.executions.forEach((we: WorkflowExecution) => {
            if (we && we.id === executionId) {
              we.metisPlugins.forEach((p) => {
                res.plugins.push({
                  pluginType: p.pluginType,
                  canDisplayRawXml: true
                });
              });
            }
          });
        }
      });
    }
  });
  return res;
}

/** executionsByDatasetIdAsList
/* @param {string} datasetId
/* @param {number} page
/* return dataset's executions
*/
export function executionsByDatasetIdAsList(datasetId: string, page = 0): ResultList {
  return getListWrapper(getMostRecentExecutionByDatasetId(datasetId), true, page);
}

/** search
/* return ResultList of DatasetSearchView
/* @param {string} term - the search term
/* @param {page} term - the page
*/
export function search(term: string, page = 0): ResultList {
  const allResults = datasetXs
    .filter((datasetX: DatasetX) => {
      return (
        datasetX.datasetName.toUpperCase().includes(`${term}`.toUpperCase()) ||
        datasetX.datasetId.toUpperCase().includes(`${term}`.toUpperCase())
      );
    })
    .map((datasetX: DatasetX) => {
      const lastExec = datasetX.workflows![0]!.executions![0]!.finishedDate;

      return {
        datasetId: datasetX.datasetId,
        datasetName: datasetX.datasetName,
        provider: datasetX.provider,
        dataProvider: datasetX.dataProvider,
        lastExecutionDate: lastExec ? lastExec : ''
      } as DatasetSearchView;
    });
  return getListWrapper(allResults, false, page);
}

// /orchestrator/workflows/0
export function workflow(datasetId: string): Workflow | undefined {
  const dsx = dataset(datasetId);

  if (dsx && dsx.workflows && dsx.workflows[0]) {
    return dsx.workflows[0];
  }
  return undefined;
}

// /orchestrator/proxies/enrichment/task/external-task-id/report/exists
export function reportExists(reportId: string): ReportAvailability {
  return {
    existsExternalTaskReport: !!reportId
  };
}

// /datasets/0/xslt
export function xslt(xsltId: string): XmlSample {
  return {
    ecloudId: xsltId,
    xmlRecord: xsltDefault
  };
}

// /orchestrator/proxies/link_checking/task/60/report?idsPerError=100
export function errorReport(reportId: string, process: string): Report {
  return {
    id: reportId,
    errors: [
      {
        errorType: '1',
        message: process,
        occurrences: 321,
        errorDetails: ['fail', 'OJIN3E', 'P72D6Q'].map((ecloudRecordId: string) => {
          return {
            identifier: `http://test.ecloud.psnc.pl/api/records/${ecloudRecordId}`,
            additionalInfo: 'Error while executing ' + process
          };
        })
      }
    ]
  };
}

// /orchestrator/workflows/evolution/0/OAIPMH_HARVEST
export function evolution(datasetId: string, peType: string): HistoryVersions {
  const wl = getMostRecentExecutionByDatasetId(datasetId);
  const res: Array<HistoryVersion> = [];

  if (wl.length == 1) {
    const w = wl[0];
    let reachedEnd = false;

    w.metisPlugins.forEach((pe) => {
      if (pe.pluginType.toString() === peType) {
        reachedEnd = true;
      }
      if (!reachedEnd) {
        res.push({
          workflowExecutionId: w.id,
          pluginType: pe.pluginType.toString(),
          finishedTime: pe.finishedDate ? new Date(pe.finishedDate).getTime() : undefined
        } as HistoryVersion);
      }
    });
  }
  return {
    evolutionSteps: res
  };
}

// /orchestrator/proxies/link_checking/task/10/logs?from=766&to=865
export function logs(): string {
  return JSON.stringify([
    {
      resourceNum: 5,
      resource:
        'https://test.ecloud.psnc.pl/api/records/VKOBBAXYMXK2PK3G4UQ/representations/metadataRecord/versions/e9b32090-a928/files/81bbc67c',
      recordState: 'SUCCESS',
      info: 'Record is indexed correctly',
      additionalInformations: null,
      europeanaId: '/76/CMC_HA_1185',
      processingTime: 18539,
      resultResource: 'null'
    },
    {
      resourceNum: 4,
      resource:
        'https://test.ecloud.psnc.pl/api/records/FQRVHVPSYGGHVZKD3AQ/representations/metadataRecord/versions/e9b32090-a928/files/58b9ee6e',
      recordState: 'SUCCESS',
      info: 'Record is indexed correctly',
      additionalInformations: null,
      europeanaId: '/76/CMC_HA_936',
      processingTime: 6077,
      resultResource: 'null'
    },
    {
      resourceNum: 3,
      resource:
        'https://test.ecloud.psnc.pl/api/records/HH33HGHSQWTD44FFNDA/representations/metadataRecord/versions/e9b32090-a928/files/6bdfc3c1',
      recordState: 'SUCCESS',
      info: 'Record is indexed correctly',
      additionalInformations: null,
      europeanaId: '/76/CMC_HA_1255',
      processingTime: 5927,
      resultResource: 'null'
    },
    {
      resourceNum: 2,
      resource:
        'https://test.ecloud.psnc.pl/api/records/NN334OW7RLQ4N2KPVWA/representations/metadataRecord/versions/e9b32090-a928/files/6dc08691',
      recordState: 'SUCCESS',
      info: 'Record is indexed correctly',
      additionalInformations: null,
      europeanaId: '/76/_nnhSX08',
      processingTime: 4845,
      resultResource: 'null'
    },
    {
      resourceNum: 1,
      resource:
        'https://test.ecloud.psnc.pl/api/records/D2ZMGZHAUTK2OLZE4EQ/representations/metadataRecord/versions/e9b32090-a928/files/013ab78d',
      recordState: 'SUCCESS',
      info: 'Record is indexed correctly',
      additionalInformations: null,
      europeanaId:
        '/76/data_sounds_http___archive_org_download_BTO2012_09_16_BTO_2012_09_16_set2_08_mp3',
      processingTime: 4514,
      resultResource: 'null'
    }
  ]);
}
