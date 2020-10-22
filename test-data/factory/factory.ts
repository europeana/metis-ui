import { DatasetSearchView, PublicationFitness } from '../../src/app/_models/dataset-shared.js';
import { DatasetDepublicationStatus, HarvestData } from '../../src/app/_models/harvest-data.js';
import { Workflow } from '../../src/app/_models/workflow.js';
import {
  DatasetX,
  DateBumpType,
  PluginRunConf,
  ResultList,
  WorkflowX,
  WorkflowXRunConf
} from '../_models/test-models.js';
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
} from '../../src/app/_models/workflow-execution.js';
import { HistoryVersion, HistoryVersions } from '../../src/app/_models/xml-sample.js';
import { PluginMetadata } from '../../src/app/_models/plugin-metadata.js';

let baseDate = new Date('2019-02-18T07:36:59.801Z');
const pageSize = 2;

const fullSequenceTypesOAIPMH = Object.values(PluginType).filter((pType: PluginType) => {
  return pType !== PluginType.HTTP_HARVEST;
});

const fullSequenceTypesHTTP = Object.values(PluginType).filter((pType: PluginType) => {
  return pType !== PluginType.OAIPMH_HARVEST;
});

function pluginExecutionIsHarvest(pe: PluginExecution): boolean {
  return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].indexOf(pe.pluginType) > -1;
}

function pluginExecutionQueuesNext(status: PluginStatus): boolean {
  return (
    [
      PluginStatus.INQUEUE,
      PluginStatus.PENDING,
      PluginStatus.RUNNING,
      PluginStatus.CLEANING
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

function generateDatasetX(): Array<DatasetX> {
  let weIndex = 0;
  let workflowsByDS = [
    [
      {
        conf: {
          expectedRecords: 879
        },
        metisPluginsMetadata: fullSequenceTypesOAIPMH.map((type: PluginType) => {
          return generatePluginMetadata(type);
        })
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
          }
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
          }
        },
        metisPluginsMetadata: fullSequenceTypesHTTP.slice(0, 7).map((type: PluginType) => {
          return generatePluginMetadata(type);
        })
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
      let datasetId = workflows[0].datasetId;
      let datasetX = {
        id: datasetId,
        ecloudDatasetId: 'e-cloud-dataset-id-' + datasetId,
        xsltId: datasetId,
        datasetId: datasetId,
        datasetName: 'Dataset_' + (parseInt(datasetId) + 1),
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
          let harvestData = information();

          w.executions = [];
          let numExecutions = w.conf.numExecutions ? w.conf.numExecutions : 1;

          // "run" the Workflows
          for (var i = 0; i < numExecutions; i++) {
            let wExec = runWorkflow(w, `${weIndex}`);

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

/** getListResultWrapper
/* returns a ResultList from the supplied array
/* @param {array} list - optional
/* @param {boolean} fromZero - optional - include results from zero
/* @param {number} page - optional- the page to return
*/
export function getListWrapper(
  list: Array<Object> = [],
  fromZero: boolean = false,
  page: number = 0
): ResultList {
  const sliceIndex = page * pageSize;
  const results = list.slice(fromZero ? 0 : sliceIndex, sliceIndex + pageSize);
  const more = list && list.length > (page + 1) * pageSize;
  return {
    results: results,
    listSize: list.length,
    nextPage: more ? 1 : -1
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

function runPlugin(id: string, pmd: PluginMetadata, status: PluginStatus): PluginExecution {
  let cancelled = status === PluginStatus.CANCELLED;
  let failed = status === PluginStatus.FAILED;

  return {
    id: id,
    externalTaskId: id,

    pluginMetadata: pmd,
    topologyName: pmd.pluginType.toLowerCase() as TopologyName,
    pluginType: pmd.pluginType,

    pluginStatus: status,

    startedDate: cancelled ? undefined : generateDate(DateBumpType.SECOND),
    updatedDate: cancelled ? undefined : generateDate(DateBumpType.MINUTE),
    finishedDate: status === PluginStatus.FINISHED ? generateDate(DateBumpType.SECOND) : undefined,

    failMessage: failed ? 'fail message' : undefined
  } as PluginExecution;
}

function runWorkflow(workflow: WorkflowX, executionId: string): WorkflowExecution {
  let wConf = workflow.conf;
  let makePluginCancelled = false;
  let makePluginQueue = false;
  let peIndex = 0;
  let peErrors = 0;

  let workflowExecution = {
    id: executionId,
    datasetId: workflow.datasetId,

    workflowStatus: WorkflowStatus.INQUEUE,
    ecloudDatasetId: 'e-cloud-dataset-id',

    workflowPriority: 0,
    cancelling: false,

    createdDate: generateDate(DateBumpType.MINUTE),
    startedDate: generateDate(DateBumpType.MINUTE),

    metisPlugins: workflow.metisPluginsMetadata.map((pmd: PluginMetadata, i) => {
      let fallbackStatus =
        wConf.unfinished && wConf.unfinished.index === i
          ? wConf.unfinished.status
          : PluginStatus.FINISHED;

      let status = makePluginCancelled
        ? PluginStatus.CANCELLED
        : makePluginQueue
        ? PluginStatus.INQUEUE
        : fallbackStatus;

      // run plugin

      let pe = runPlugin('' + peIndex, pmd, status);

      peIndex++;

      // get stats

      if (
        [PluginType.VALIDATION_EXTERNAL, PluginType.VALIDATION_INTERNAL].indexOf(pe.pluginType) > -1
      ) {
        let deduct = 7;
        if (wConf.expectedRecords > deduct) {
          wConf.expectedRecords -= deduct;
          peErrors += deduct;
        }
      }

      let prc = {
        numExpected: wConf.expectedRecords,
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

  let plugins = workflowExecution.metisPlugins;

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
      return pe.pluginStatus === PluginStatus.FINISHED;
    }).length === plugins.length
  ) {
    workflowExecution.updatedDate = generateDate(DateBumpType.MINUTE);
    workflowExecution.finishedDate = generateDate(DateBumpType.SECOND);
    workflowExecution.workflowStatus = WorkflowStatus.FINISHED;
  }

  return workflowExecution;
}

function generatePluginMetadata(pType: PluginType): PluginMetadata {
  return {
    pluginType: pType,
    enabled: true,
    url:
      pType === PluginType.OAIPMH_HARVEST
        ? 'https://oaipmh.com'
        : pType === PluginType.HTTP_HARVEST
        ? 'https://harvest.com'
        : undefined,
    metadataFormat: pType === PluginType.OAIPMH_HARVEST ? 'edm' : undefined,
    setSpec: pType === PluginType.OAIPMH_HARVEST ? 'setSpec' : undefined,
    customXslt: pType === PluginType.TRANSFORMATION ? false : undefined,
    conf: {}
  } as PluginMetadata;
}

function getExecutionProgress(conf: PluginRunConf): ExecutionProgress {
  return {
    expectedRecords: conf.numExpected,
    processedRecords: conf.numDone,
    progressPercentage:
      conf.numDone && conf.numExpected ? (conf.numDone / conf.numExpected) * 100 : '',
    errors: conf.numErr,
    status: 'PROCESSED'
  } as ExecutionProgress;
}

function generateDatasetExecutionProgress(
  pExecutions: Array<PluginExecution>
): DatasetExecutionProgress {
  let res = {
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
  let mostRecentExec = [dataset(datasetId)].map((datasetX: DatasetX | undefined) => {
    let w = datasetX && datasetX.workflows ? datasetX.workflows.slice(0, 1)[0] : undefined;
    return w ? w.executions : [];
  });

  if (mostRecentExec) {
    let first = mostRecentExec[0];
    if (first) {
      return first;
    }
  }
  return [];
}

/** generate data / export query functions
 */
const datasetXs = generateDatasetX();

export function overview(page: number = 0): ResultList {
  let res: Array<DatasetOverview> = [];

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

export function dataset(datasetId: string): DatasetX | undefined {
  let matchingDatasets = datasetXs.filter((datasetX: DatasetX) => {
    return datasetX.datasetId === datasetId;
  });

  if (matchingDatasets.length > 0) {
    return matchingDatasets.pop();
  }
  return undefined;
}

export function running(page: number = 0): ResultList {
  let res: Array<WorkflowExecution> = [];

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
  let res: Array<WorkflowExecutionHistory> = [];

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
  let res: PluginAvailabilityList = { plugins: [] };

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
export function executionsByDatasetIdAsList(datasetId: string, page: number = 0): ResultList {
  return getListWrapper(getMostRecentExecutionByDatasetId(datasetId), true, page);
}

/** information
/* @param {string} the information to return
/* return empty HarvestData if param not specified
*/
export function information(informationId?: string): HarvestData {
  if (typeof informationId !== 'undefined') {
    let dsx = dataset(informationId);
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
      lastHarvestedRecords: 0
    } as HarvestData;
  }
}

/** search
/* return ResultList of DatasetSearchView
/* @param {string} term - the search term
/* @param {page} term - the page
*/
export function search(term: string, page: number = 0): ResultList {
  const allResults = datasetXs
    .filter((datasetX: DatasetX) => {
      return (
        datasetX.datasetName.toUpperCase().includes(`${term}`.toUpperCase()) ||
        datasetX.datasetId.toUpperCase().includes(`${term}`.toUpperCase())
      );
    })
    .map((datasetX: DatasetX) => {
      let lastExec = datasetX.workflows![0]!.executions![0]!.finishedDate;

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

// localhost:3000/orchestrator/workflows/0
export function workflow(datasetId: string): Workflow | undefined {
  let dsx = dataset(datasetId);

  if (dsx && dsx.workflows && dsx.workflows[0]) {
    return dsx.workflows[0];
  }
  return undefined;
}

// localhost:3000/orchestrator/proxies/enrichment/task/external-task-id/report/exists
export function reportExists(reportId: string) {
  return {
    existsExternalTaskReport: !!reportId
  };
}

// localhost:3000/datasets/0/xslt
export function xslt(xsltId: string) {
  return {
    id: xsltId,
    errors: []
  };
}

// localhost:3000/orchestrator/proxies/link_checking/task/60/report?idsPerError=100
export function errorReport(reportId: string, process: string) {
  return {
    id: reportId,
    errors: [
      {
        errorType: '1',
        message: process,
        occurrences: reportId,
        errorDetails: [1, 2, 3].forEach(() => {
          return {
            identifier: 'http://test.ecloud.psnc.pl/api/records/' + reportId,
            additionalInfo: 'Error while executing ' + process
          };
        })
      }
    ]
  };
}

// localhost:3000/orchestrator/workflows/evolution/0/OAIPMH_HARVEST
export function evolution(datasetId: string, peType: string): HistoryVersions {
  let wl = getMostRecentExecutionByDatasetId(datasetId);
  let res: Array<HistoryVersion> = [];

  if (wl.length == 1) {
    let w = wl[0];
    let reachedEnd = false;

    w.metisPlugins.forEach((pe) => {
      if (pe.pluginType.toString() === peType) {
        reachedEnd = true;
      }
      if (!reachedEnd) {
        res.push({
          workflowExecutionId: w.id,
          pluginType: pe.pluginType.toString(),
          finishedTime: pe.finishedDate
        } as HistoryVersion);
      }
    });
  }
  return {
    evolutionSteps: res
  };
}
