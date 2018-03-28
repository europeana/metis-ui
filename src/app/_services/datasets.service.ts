import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import 'rxjs/Rx';
import { switchMap } from 'rxjs/operators';

import { ErrorService } from './error.service';


@Injectable()
export class DatasetsService {
  private datasets = [];
  datasetMessage;
  tempPreviewFilers;
  datasetNames: Array<any> = [];
  
  constructor(private http: HttpClient, 
    private errors: ErrorService) { }
  
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
  /* @param {number} id - datasetid
  */
  getDataset(id: number) {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;    
    return this.http.get(url).map(dataset => {   
      return dataset ? dataset : false;
    });    
  }

  /** createDataset
  /* create a new dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  createDataset(datasetFormValues: Array<any>) {    
    const url = `${apiSettings.apiHostCore}/datasets`;    
    return this.http.post(url, datasetFormValues).map(newDataset => {      
      return newDataset ? newDataset : false;
    });
  }

  /** updateDataset
  /* update an existing dataset
  /* @param {array} datasetFormValues - values from dataset form
  */
  updateDataset(datasetFormValues) {
    const url = `${apiSettings.apiHostCore}/datasets`;    
    return this.http.put(url, datasetFormValues).map(updateDataset => {      
      return updateDataset ? updateDataset : false;
    });
  }

  /** addDatasetInfo
  /* add relevant dataset info to execution
  /* use a name that was retrieved before, or
  /* make a call to get dataset name and store it in the array
  /* @param {object} executions - the executions retrieved from a call
  */
  addDatasetNameToExecution(executions) {
    let updatedExecutions: Array<any> = [];

    for (let i = 0; i < executions.length; i++) {
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

    return this.http.get(url, options).map(data => {  
      return data ? (type === 'default' ? data : data['xslt']) : false;
    });  
  }

}
