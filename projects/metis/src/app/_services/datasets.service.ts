import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import { Dataset, DatasetSearchView, MoreResults, Results, XmlSample } from '../_models';
import { collectResultsUptoPage } from './service-utils';

@Injectable({ providedIn: 'root' })
export class DatasetsService {
  private readonly http = inject(HttpClient);

  private readonly datasetCacheMap = new Map<string, Observable<Dataset>>();

  getDataset(id: string, refresh = false): Observable<Dataset> {
    if (refresh) {
      this.datasetCacheMap.delete(id);
    }
    if (!this.datasetCacheMap.has(id)) {
      const request$ = this.http.get<Dataset>(`${apiSettings.apiHostCore}/datasets/${id}`).pipe(
        tap({
          error: () => this.datasetCacheMap.delete(id)
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.datasetCacheMap.set(id, request$);
    }
    return this.datasetCacheMap.get(id)!;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDataset(datasetFormValues: { dataset: any }): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset>(url, datasetFormValues);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDataset(datasetFormValues: { dataset: any }): Observable<void> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    this.datasetCacheMap.delete(datasetFormValues.dataset.datasetId);
    return this.http.put<void>(url, datasetFormValues);
  }

  getXSLT(type: string, id?: string): Observable<string> {
    let url = `${apiSettings.apiHostCore}/datasets/xslt/default`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let options: { responseType: any } | undefined = { responseType: 'text' };
    if (type === 'custom') {
      url = `${apiSettings.apiHostCore}/datasets/${id}/xslt`;
      options = undefined;
    }

    return (
      this.http
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .get<any>(url, options)
        .pipe(
          map((data) => {
            return type === 'default' ? data : data.xslt;
          })
        )
    );
  }

  // get transformed samples for specific dataset
  getTransform(id: string, samples: XmlSample[], type: string): Observable<XmlSample[]> {
    let url = `${apiSettings.apiHostCore}/datasets/${id}/xslt/transform`;
    if (type === 'default') {
      url += '/default';
    }
    return this.http.post<XmlSample[]>(url, samples, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** search
  /*  retrieve dataset information with names matching the term
  /*  @param {string} term - the search term
  /*  @param {number} page - the pagination target
  */
  search(term: string, page: number): Observable<Results<DatasetSearchView>> {
    const url = `${apiSettings.apiHostCore}/datasets/search?searchString=${term}&nextPage=${page}`;
    return this.http.get<Results<DatasetSearchView>>(url);
  }

  /** getSearchResultsUptoPage
  /*  search for datasets
  /*  @param {string} term - the search term
  /*  @param {number} endPage - the number of pages to fetch
  */
  getSearchResultsUptoPage(
    term: string,
    endPage: number
  ): Observable<MoreResults<DatasetSearchView>> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.search(term, page);
    return collectResultsUptoPage(getResults, endPage);
  }
}
