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

@Injectable()
export class DatasetsService {

  @Output() updateLog: EventEmitter<any> = new EventEmitter();

  private datasets = [];
  datasetMessage: string;
  tempPreviewFilers: string[];
  datasetNames: string[] = [];
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
  getDataset(id: string): Observable<Dataset | false> {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;
    return this.http.get<Dataset | null>(url)
      .pipe(map(dataset => {
        return dataset ? dataset : false;
      })).pipe(this.errors.handleRetry());
  }

  /** createDataset
  /* create a new dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  createDataset(datasetFormValues: Dataset): Observable<Dataset | false> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset | null>(url, datasetFormValues).pipe(map(newDataset => {
      return newDataset ? newDataset : false;
    })).pipe(this.errors.handleRetry());
  }

  /** updateDataset
  /* update an existing dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  updateDataset(datasetFormValues: Dataset): Observable<Dataset | false> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.put<Dataset | null>(url, datasetFormValues).pipe(map(updateDataset => {
      return updateDataset ? updateDataset : false;
    })).pipe(this.errors.handleRetry());
  }

  /** addDatasetNameAndCurrentPlugin
  /* add relevant dataset info to execution
  /* use a name that was retrieved before, or
  /* make a call to get dataset name and store it in the array
  /* @param {object} executions - the executions retrieved from a call
  */
  addDatasetNameAndCurrentPlugin(executions, currentDatasetId?) {
    const updatedExecutions: Array<any> = [];
    for (let i = 0; i < executions.length; i++) {
      executions[i].currentPlugin = this.workflows.getCurrentPlugin(executions[i]);

      const thisPlugin = executions[i]['metisPlugins'][executions[i].currentPlugin];

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
  setPreviewFilters(tempFilters: string[]): void {
    this.tempPreviewFilers = tempFilters;
  }

  /** getPreviewFilters
  /* get filters used in the preview tab
  */
  getPreviewFilters(): string[] {
    return this.tempPreviewFilers;
  }

  /** getXSLT
  /* get default xslt
  /* the default one
  */
  getXSLT(type: string, id?: string): string | false {
    let url = `${apiSettings.apiHostCore}/datasets/xslt/default`;
    let options = { responseType: 'text' as any };
    if (type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;
      options = undefined;
    }

    return this.http.get<string | null>(url, options).pipe(map(data => {
      return data ? (type === 'default' ? data : data['xslt']) : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getTransform
  /* get transformed samples for specific dataset
  /* either using default xslt or custom
  /* @param {string} id - dataset identifier
  /* @param {object} samples - samples to transform
  */
  getTransform(id: string, samples: XmlSample[], type: string): Observable<XmlSample[] | false> {
    let url = `${apiSettings.apiHostCore}/datasets/${id}/xslt/transform`;
    if (type === 'default') {
      url += '/default';
    }
    return this.http.post<XmlSample[] | null>(url, samples, {headers: {'Content-Type': 'application/json'}}).pipe(map(data => {
      return data ? data : false;
    })).pipe(this.errors.handleRetry());
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
  getTempXSLT(): string {
    return this.tempXSLT;
  }

}
