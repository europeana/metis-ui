import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { KeyedCache } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { Dataset, DatasetSearchView, MoreResults, Results, XmlSample } from '../_models';
import { collectResultsUptoPage } from './service-utils';

@Injectable({ providedIn: 'root' })
export class DatasetsService {
  private readonly http = inject(HttpClient);

  datasetCache = new KeyedCache((id) => this.requestDataset(id));

  private requestDataset(id: string): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets/${id}`;
    return this.http.get<Dataset>(url);
  }

  getDataset(id: string, refresh = false): Observable<Dataset> {
    return this.datasetCache.get(id, refresh);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createDataset(datasetFormValues: { dataset: any }): Observable<Dataset> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.post<Dataset>(url, datasetFormValues);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDataset(datasetFormValues: { dataset: any }): Observable<void> {
    const url = `${apiSettings.apiHostCore}/datasets`;
    return this.http.put<void>(url, datasetFormValues).pipe(
      tap(() => {
        this.datasetCache.clear(datasetFormValues.dataset.datasetId);
      })
    );
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
