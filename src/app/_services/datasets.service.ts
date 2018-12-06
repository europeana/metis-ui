import { map, publishLast, tap } from 'rxjs/operators';
import { ConnectableObservable, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { ErrorService } from './error.service';
import { Dataset } from '../_models/dataset';
import { XmlSample } from '../_models/xml-sample';

@Injectable()
export class DatasetsService {
  datasetById: { [id: string]: Observable<Dataset> } = {};

  constructor(private http: HttpClient, private errors: ErrorService) {}

  private requestDataset(id: string): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;
    return this.http.get<Dataset>(url).pipe(this.errors.handleRetry());
  }

  getDataset(id: string, refresh: boolean = false): Observable<Dataset> {
    let observable = this.datasetById[id];
    if (observable && !refresh) {
      return observable;
    }
    observable = this.requestDataset(id).pipe(publishLast());
    (observable as ConnectableObservable<Dataset>).connect();
    this.datasetById[id] = observable;
    return observable;
  }

  //tslint:disable-next-line: no-any
  createDataset(datasetFormValues: { dataset: any }): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset>(url, datasetFormValues).pipe(this.errors.handleRetry());
  }

  //tslint:disable-next-line: no-any
  updateDataset(datasetFormValues: { dataset: any }): Observable<void> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.put<void>(url, datasetFormValues).pipe(
      tap(() => {
        // remove old dataset from cache
        delete this.datasetById[datasetFormValues.dataset.datasetId];
      }),
      this.errors.handleRetry(),
    );
  }

  getXSLT(type: string, id?: string): Observable<string> {
    let url = `${apiSettings.apiHostCore}/datasets/xslt/default`;
    //tslint:disable-next-line: no-any
    let options: { responseType: any } | undefined = { responseType: 'text' };
    if (type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;
      options = undefined;
    }

    return (
      this.http
        //tslint:disable-next-line: no-any
        .get<any>(url, options)
        .pipe(
          map((data) => {
            // TODO: fix any
            return type === 'default' ? data : data['xslt'];
          }),
        )
        .pipe(this.errors.handleRetry())
    );
  }

  // get transformed samples for specific dataset
  getTransform(id: string, samples: XmlSample[], type: string): Observable<XmlSample[]> {
    let url = `${apiSettings.apiHostCore}/datasets/${id}/xslt/transform`;
    if (type === 'default') {
      url += '/default';
    }
    return this.http
      .post<XmlSample[]>(url, samples, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(this.errors.handleRetry());
  }
}
