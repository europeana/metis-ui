import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectableObservable, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, publishLast, tap } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import { Dataset, XmlSample } from '../_models';

import { ErrorService } from './error.service';

const FAVORITE_IDS = 'favoriteIds';

@Injectable({ providedIn: 'root' })
export class DatasetsService {
  datasetById: { [id: string]: Observable<Dataset> } = {};
  favoriteIds: string[];

  constructor(private http: HttpClient, private errors: ErrorService) {
    this.favoriteIds = JSON.parse(localStorage.getItem(FAVORITE_IDS) || '[]');
  }

  private requestDataset(id: string): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;
    return this.http.get<Dataset>(url).pipe(this.errors.handleRetry());
  }

  getDataset(id: string, refresh: boolean = false): Observable<Dataset> {
    let observable = this.datasetById[id];
    if (observable && !refresh) {
      return observable;
    }
    observable = this.requestDataset(id).pipe(
      tap(undefined, () => {
        delete this.datasetById[id];
      }),
      publishLast(),
    );
    (observable as ConnectableObservable<Dataset>).connect();
    this.datasetById[id] = observable;
    return observable;
  }

  // tslint:disable-next-line: no-any
  createDataset(datasetFormValues: { dataset: any }): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset>(url, datasetFormValues).pipe(this.errors.handleRetry());
  }

  // tslint:disable-next-line: no-any
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
    // tslint:disable-next-line: no-any
    let options: { responseType: any } | undefined = { responseType: 'text' };
    if (type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;
      options = undefined;
    }

    return (
      this.http
        // tslint:disable-next-line: no-any
        .get<any>(url, options)
        .pipe(
          map((data) => {
            // TODO: fix any
            return type === 'default' ? data : data.xslt;
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

  isFavorite(dataset: Dataset): boolean {
    return this.favoriteIds.indexOf(dataset.datasetId) >= 0;
  }

  saveFavorites(): void {
    localStorage.setItem(FAVORITE_IDS, JSON.stringify(this.favoriteIds));
  }

  sortFavorites(): void {
    this.favoriteIds.sort((id1, id2) => {
      const idNum1 = parseInt(id1, 10);
      const idNum2 = parseInt(id2, 10);
      if (idNum1 < idNum2) {
        return -1;
      } else if (idNum1 > idNum2) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  addFavorite(dataset: Dataset): void {
    if (!this.isFavorite(dataset)) {
      this.favoriteIds.push(dataset.datasetId);
      this.sortFavorites();
      this.saveFavorites();
    }
  }

  removeFavorite(dataset: Dataset): void {
    if (this.isFavorite(dataset)) {
      const index = this.favoriteIds.indexOf(dataset.datasetId);
      this.favoriteIds.splice(index, 1);
      this.saveFavorites();
    }
  }

  getFavorites(): Observable<Dataset[]> {
    if (this.favoriteIds.length === 0) {
      return of([]);
    }

    const getDatasetOrUndefined = (id: string) =>
      this.getDataset(id).pipe(catchError(() => of(undefined)));

    const filterDatasets = (datasets: Array<Dataset | undefined>) =>
      datasets.filter((dataset) => dataset) as Dataset[];

    return forkJoin(this.favoriteIds.map(getDatasetOrUndefined)).pipe(map(filterDatasets));
  }
}
