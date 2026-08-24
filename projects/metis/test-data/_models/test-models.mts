import { Dataset } from '../../src/app/_models/dataset';
import { HarvestData } from '../../src/app/_models/harvest-data';
import { PluginStatus, Workflow, WorkflowExecution } from '../src-copy/workflow-execution.mjs';

export enum DateBumpType {
  SECOND = 'SECOND',
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DATE = 'DATE'
}

export enum RecordDepublicationInfoField {
  RECORDID = 'recordId',
  DEPUBLICATIONSTATUS = 'depublicationStatus',
  DEPUBLICATIONDATE = 'depublicationDate',
  DEPUBLICATIONREASON = 'depublicationReason'
}

export interface UnfinishedPlugin {
  status: PluginStatus; // should not be PluginStatus.FINISHED
  index: number;
}

export interface WorkflowXRunConf {
  expectedRecords: number;
  numExecutions?: number;
  unfinished?: UnfinishedPlugin;
  successDepublishRecords?: number;
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
  numDeleted: number;
  numDone: number;
  numErr: number;
}

export interface ResultList {
  results: Array<object>;
  listSize: number;
  nextPage: number;
}
