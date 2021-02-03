import { Dataset } from '../../src/app/_models/dataset';
import { HarvestData } from '../../src/app/_models/harvest-data';
import { Workflow } from '../../src/app/_models/workflow';
import { PluginStatus, WorkflowExecution } from '../../src/app/_models/workflow-execution';

export const urlManipulation = {
  RETURN_404: 'METIS_UI_404',
  RETURN_EMPTY: 'METIS_UI_EMPTY',
  METIS_UI_CLEAR: 'METIS_UI_CLEAR'
};

export enum DateBumpType {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DATE = 'DATE'
}

export interface UnfinishedPlugin {
  status: PluginStatus; // should not be PluginStatus.FINISHED
  index: number;
}

export interface WorkflowXRunConf {
  expectedRecords: number;
  numExecutions?: number;
  unfinished?: UnfinishedPlugin;
}

export interface WorkflowX extends Workflow {
  executions?: Array<WorkflowExecution>;
  harvestData?: HarvestData;
  conf: WorkflowXRunConf;
}

export interface DatasetX extends Dataset {
  workflows?: Array<WorkflowX>;
}

export interface PluginRunConf {
  numExpected: number;
  numDone: number;
  numErr: number;
}

export interface ResultList {
  results: Array<Object>;
  listSize: number;
  nextPage: number;
}
