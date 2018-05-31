
import {map,  switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import 'rxjs';

import { ErrorService } from './error.service';
import { WorkflowService } from './workflow.service';

@Injectable()
export class DatasetsService {
  private datasets = [];
  datasetMessage;
  tempPreviewFilers;
  datasetNames: Array<any> = [];
  tempXSLT;
  
  constructor(private http: HttpClient, 
    private errors: ErrorService, 
    private workflows: WorkflowService) { }
  
  /** setDatasetMessage
  /* set message that is displayed on the dataset page
  /* @param {string} message - text to display
  */
  setDatasetMessage(message) {
    this.datasetMessage = message;
  }

  /** getDatasetMessage
  /* get message that is displayed on the dataset page
  */
  getDatasetMessage() {
    return this.datasetMessage;
  }

  /** getDataset
  /* get all information related to the dataset
  /* @param {string} id - datasetid
  */
  getDataset(id: string) {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;    
    return this.http.get(url).pipe(map(dataset => {   
      return dataset ? dataset : false;
    }));    
  }

  /** createDataset
  /* create a new dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  createDataset(datasetFormValues: Array<any>) {    
    const url = `${apiSettings.apiHostCore}/datasets`;    
    return this.http.post(url, datasetFormValues).pipe(map(newDataset => {  
      return newDataset ? newDataset : false;
    }));
  }

  /** updateDataset
  /* update an existing dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  updateDataset(datasetFormValues) {
    const url = `${apiSettings.apiHostCore}/datasets`;    
    return this.http.put(url, datasetFormValues).pipe(map(updateDataset => {      
      return updateDataset ? updateDataset : false;
    }));
  }

  /** addDatasetNameAndCurrentPlugin
  /* add relevant dataset info to execution
  /* use a name that was retrieved before, or
  /* make a call to get dataset name and store it in the array
  /* @param {object} executions - the executions retrieved from a call
  */
  addDatasetNameAndCurrentPlugin(executions) {
    let updatedExecutions: Array<any> = [];
    for (let i = 0; i < executions.length; i++) {
      executions[i].currentPlugin = this.workflows.getCurrentPlugin(executions[i]);
      if (this.datasetNames[executions[i].datasetId]) {
        executions[i].datasetName = this.datasetNames[executions[i].datasetId];
      } else {    
        this.getDataset(executions[i].datasetId).subscribe(result => {
          this.datasetNames[executions[i].datasetId] = result['datasetName'];
          executions[i].datasetName = result['datasetName'];
        },(err: HttpErrorResponse) => {
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
  setPreviewFilters(tempFilters) {
    this.tempPreviewFilers = tempFilters;
  }

  /** getPreviewFilters
  /* get filters used in the preview tab
  */
  getPreviewFilters() {
    return this.tempPreviewFilers;
  }

  /** getXSLT
  /* get default xslt
  /* the default one
  */
  getXSLT(type, id?) {
    let url = `${apiSettings.apiHostCore}/datasets/xslt/default`;   
    let options =  { responseType: 'text' as 'text' };
    if(type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;   
      options = undefined;
    }

    return this.http.get(url, options).pipe(map(data => {  
      return data ? (type === 'default' ? data : data['xslt']) : false;
    }));  
  }

  /** getTransform
  /* get transformed samples for specific dataset
  /* either using default xslt or custom
  /* @param {string} id - dataset identifier
  /* @param {object} samples - samples to transform
  */
  getTransform(id, samples, type) {
    let url = `${apiSettings.apiHostCore}/datasets/${id}/xslt/transform`;   
    if (type === 'default') {
      url += '/default';
    }
    return this.http.post(url, samples, {headers:{'Content-Type': 'application/json'}}).pipe(map(data => {  
      return data ? data : false;
    }));  
  }

  /** setTempXSLT
  /* temporary save xslt to use in transformation on the fly
  */
  setTempXSLT(xslttype) {
    this.tempXSLT = xslttype;
  }

  /** getTempXSLT
  /* temporary save xslt to use in transformation on the fly
  */
  getTempXSLT() {
    return this.tempXSLT;
  }

}
