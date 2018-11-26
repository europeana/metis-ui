import { map, publishLast } from 'rxjs/operators';
import { ConnectableObservable,  Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { ErrorService } from './error.service';
import { Dataset } from '../_models/dataset';
import { XmlSample } from '../_models/xml-sample';
import { WorkflowExecution } from '../_models/workflow-execution';

export interface PreviewFilters {
  date?: WorkflowExecution;
  plugin?: string;
}

@Injectable()
export class DatasetsService {

  datasetMessage?: string;
  tempPreviewFilers: PreviewFilters;
  tempXSLT: string | null;
  datasetById: { [id: string]: Observable<Dataset> } = {};

  constructor(private http: HttpClient,
    private errors: ErrorService) { }

  /** setDatasetMessage
  /* set message that is displayed on the dataset page
  /* @param {string} message - text to display
  */
  setDatasetMessage(message: string): void {
    this.datasetMessage = message;
  }

  clearDatasetMessage(): void {
    this.datasetMessage = undefined;
  }

  /** getDatasetMessage
  /* get message that is displayed on the dataset page
  */
  getDatasetMessage(): string | undefined {
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

  getCachedDataset(id: string): Observable<Dataset> {
    let observable = this.datasetById[id];
    if (observable) {
      return observable;
    }
    // tslint:disable-next-line: no-any
    observable = this.getDataset(id).pipe(publishLast());
    (observable as ConnectableObservable<Dataset>).connect();
    this.datasetById[id] = observable;
    return observable;
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
    // remove old dataset from cache
    delete this.datasetById[datasetFormValues.dataset.id];

    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.put<void>(url, datasetFormValues).pipe(this.errors.handleRetry());
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
