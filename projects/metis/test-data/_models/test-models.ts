import { Dataset } from '../../src/app/_models/dataset';
import { HarvestData } from '../../src/app/_models/harvest-data';
import { Workflow } from '../../src/app/_models/workflow';
import { PluginStatus, WorkflowExecution } from '../../src/app/_models/workflow-execution';

export enum UrlManipulation {
  RETURN_401 = 'METIS_UI_401',
  RETURN_404 = 'METIS_UI_404',
  RETURN_406 = 'METIS_UI_406',
  RETURN_409 = 'METIS_UI_409',
  RETURN_EMPTY = 'METIS_UI_EMPTY',
  RETURN_EMPTY_ARRAY = 'METIS_UI_EMPTY_ARRAY',
  METIS_UI_CLEAR = 'METIS_UI_CLEAR'
}

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
  deletedRecords?: number;
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
