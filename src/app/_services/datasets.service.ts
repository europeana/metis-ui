import { map,  switchMap } from 'rxjs/operators';
import {of as observableOf,  Observable, throwError } from 'rxjs';

import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import 'rxjs';

import { ErrorService } from './error.service';
import { WorkflowService } from './workflow.service';
import { Dataset } from '../_models/dataset';
import { XmlSample } from '../_models/xml-sample';
import { WorkflowExecution } from '../_models/workflow-execution';
import { LogStatus } from '../_models/log-status';

export interface PreviewFilters {
  date?: WorkflowExecution;
  plugin?: string;
}

@Injectable()
export class DatasetsService {

  @Output() updateLog: EventEmitter<LogStatus> = new EventEmitter();

  private datasets = [];
  datasetMessage: string;
  tempPreviewFilers: PreviewFilters;
  datasetNames: { [id: string]: string } = {};
  tempXSLT: string | null;
  currentTaskId: string;

  constructor(private http: HttpClient,
    private errors: ErrorService,
    private workflows: WorkflowService) { }

  /** setDatasetMessage
  /* set message that is displayed on the dataset page
  /* @param {string} message - text to display
  */
  setDatasetMessage(message: string): void {
    this.datasetMessage = message;
  }

  /** getDatasetMessage
  /* get message that is displayed on the dataset page
  */
  getDatasetMessage(): string {
    return this.datasetMessage;
  }

  /** getDataset
  /* get all information related to the dataset
  /* @param {string} id - datasetid
  */
  getDataset(id: string): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;
    return this.http.get<Dataset>(url).pipe(this.errors.handleRetry());
  }

  /** createDataset
  /* create a new dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  //tslint:disable-next-line: no-any
  createDataset(datasetFormValues: { dataset: any }): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset>(url, datasetFormValues).pipe(this.errors.handleRetry());
  }

  /** updateDataset
  /* update an existing dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  //tslint:disable-next-line: no-any
  updateDataset(datasetFormValues: { dataset: any }): Observable<void> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.put<void>(url, datasetFormValues).pipe(this.errors.handleRetry());
  }

  /** addDatasetNameAndCurrentPlugin
  /* add relevant dataset info to execution
  /* use a name that was retrieved before, or
  /* make a call to get dataset name and store it in the array
  /* @param {object} executions - the executions retrieved from a call
  */
  addDatasetNameAndCurrentPlugin(executions: WorkflowExecution[], currentDatasetId?: string): WorkflowExecution[] {
    const updatedExecutions: WorkflowExecution[] = [];
    for (let i = 0; i < executions.length; i++) {
      executions[i].currentPlugin = this.workflows.getCurrentPlugin(executions[i]);

      const thisPlugin = executions[i]['metisPlugins'][executions[i].currentPlugin!];

      if (executions[i].datasetId === currentDatasetId) {
        if (this.currentTaskId !== thisPlugin['externalTaskId']) {
          const message = {
            'externaltaskId' : thisPlugin['externalTaskId'],
            'topology' : thisPlugin['topologyName'],
            'plugin': thisPlugin['pluginType'],
            'processed': thisPlugin['executionProgress'].processedRecords,
            'status': thisPlugin['pluginStatus']
          };
          this.updateLog.emit(message);
        }
        this.workflows.setCurrentProcessed(thisPlugin['executionProgress'].processedRecords, thisPlugin['pluginType']);
        this.currentTaskId = thisPlugin['externalTaskId'];
      }

      if (this.datasetNames[executions[i].datasetId]) {
        executions[i].datasetName = this.datasetNames[executions[i].datasetId];
      } else {
        this.getDataset(executions[i].datasetId).subscribe(result => {
          this.datasetNames[executions[i].datasetId] = result['datasetName'];
          executions[i].datasetName = result['datasetName'];
        }, (err: HttpErrorResponse) => {
          this.errors.handleError(err);
        });
      }
      updatedExecutions.push(executions[i]);
    }
    return updatedExecutions;
  }

  /** setPreviewFilters
  /* set filters used in the preview tab
  /* @param {array} tempFilters - options selected in the filter, removed after page refresh/tab switch
  */
  setPreviewFilters(tempFilters: PreviewFilters): void {
    this.tempPreviewFilers = tempFilters;
  }

  /** getPreviewFilters
  /* get filters used in the preview tab
  */
  getPreviewFilters(): PreviewFilters {
    return this.tempPreviewFilers;
  }

  /** getXSLT
  /* get default xslt
  /* the default one
  */
  getXSLT(type: string, id?: string): Observable<string> {
    let url = `${apiSettings.apiHostCore}/datasets/xslt/default`;
    //tslint:disable-next-line: no-any
    let options: { responseType: any } | undefined = { responseType: 'text' };
    if (type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;
      options = undefined;
    }

    //tslint:disable-next-line: no-any
    return this.http.get<any>(url, options).pipe(map(data => { // TODO: fix any
      return type === 'default' ? data : data['xslt'];
    })).pipe(this.errors.handleRetry());
  }

  /** getTransform
  /* get transformed samples for specific dataset
  /* either using default xslt or custom
  /* @param {string} id - dataset identifier
  /* @param {object} samples - samples to transform
  */
  getTransform(id: string, samples: XmlSample[], type: string): Observable<XmlSample[]> {
    let url = `${apiSettings.apiHostCore}/datasets/${id}/xslt/transform`;
    if (type === 'default') {
      url += '/default';
    }
    return this.http.post<XmlSample[]>(url, samples, {headers: {'Content-Type': 'application/json'}}).pipe(this.errors.handleRetry());
  }

  /** setTempXSLT
  /* temporary save xslt to use in transformation on the fly
  */
  setTempXSLT(xslttype: string | null): void {
    this.tempXSLT = xslttype;
  }

  /** getTempXSLT
  /* temporary save xslt to use in transformation on the fly
  */
  getTempXSLT(): string | null {
    return this.tempXSLT;
  }

}
