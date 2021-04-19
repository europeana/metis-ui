import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetDepublicationInfo,
  RecordDepublicationInfo,
  SortDirection,
  SortParameter
} from '../_models';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class DepublicationService {
  constructor(private readonly http: HttpClient, private readonly errors: ErrorService) {}

  /** depublishRecordIds
  /*  depublish individual record ids
  /*  @param {string} datasetId - the dataset to depublish
  /*  @param {Array<string>} recordIds - the record ids to depublish
  */
  depublishRecordIds(datasetId: string, recordIds: Array<string> | null): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublish/execute/${datasetId}?datasetDepublish=false`;
    return this.http
      .post<boolean>(url, recordIds === null ? ' ' : recordIds.join('\n'), {
        reportProgress: true
      })
      .pipe(this.errors.handleRetry());
  }

  /** depublishDataset
  /*  depublish entire dataset
  /*  @param {string} datasetId - the dataset to depublish
  */
  depublishDataset(datasetId: string): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublish/execute/${datasetId}?datasetDepublish=true`;
    return this.http
      .post<boolean>(url, ' ', {
        reportProgress: true
      })
      .pipe(this.errors.handleRetry());
  }

  /** handleUploadEvents
  /*  record upload events
  /*  @param {HttpEvent} event - event from the server
  */
  static handleUploadEvents(event: HttpEvent<Object>): boolean {
    if (event.type === HttpEventType.Response) {
      return true;
    } else {
      if (event.type === HttpEventType.UploadProgress) {
        console.log(`File upload: ${event.loaded} / ${event.total}`);
      }
      return false;
    }
  }

  /** setPublicationFile
  /*  post publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {File} file - file of record urls
  */
  setPublicationFile(datasetId: string, file: File): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublish/record_ids/${datasetId}`;
    const formData = new FormData();

    formData.append('depublicationFile', file);

    return this.http
      .post(url, formData, {
        observe: 'events',
        params: {
          clientFilename: file.name,
          mimeType: file.type
        },
        reportProgress: true
      })
      .pipe(map(DepublicationService.handleUploadEvents))
      .pipe(this.errors.handleRetry());
  }

  /** deleteDepublications
  /*  post deletion information
  /*  @param {Array<string>} recordIds - the recordIds to send
  */
  deleteDepublications(datasetId: string, recordIds: Array<string>): Observable<void> {
    const url = `${apiSettings.apiHostCore}/depublish/record_ids/${datasetId}`;
    return this.http
      .request<void>('delete', url, {
        headers: {
          'Content-Type': 'text/plain'
        },
        body: recordIds.join('\n')
      })
      .pipe(this.errors.handleRetry());
  }

  /** setPublicationInfo
  /*  post publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {string} toDepublish - depublication record urls
  */
  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublish/record_ids/${datasetId}`;
    return this.http
      .post<boolean>(url, toDepublish, {
        headers: {
          'Content-Type': 'text/plain'
        }
      })
      .pipe(this.errors.handleRetry());
  }

  /** parseFilterParameter
  /*  return a url parameter representation of a filter string or an empty string
  /*  @param {string} p - optional
  */
  parseFilterParameter(p?: string): string {
    return p ? `&searchQuery=${encodeURIComponent(p)}` : '';
  }

  /** parseSortParameter
  /*  return a url parameter representation of a SortParameter or an empty string
  /*  @param {SortParameter} p - optional
  */
  parseSortParameter(p?: SortParameter): string {
    if (p) {
      const paramField = `&sortField=${p.field}`;
      const paramAsc = `&sortAscending=${p.direction === SortDirection.ASC}`;
      return `${paramField}${paramAsc}`;
    }
    return '';
  }

  /** getPublicationInfo
  /*  retrieve publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {number} page - the pagination target
  /*  @param {SortParameter} sort - optional - sort parameter
  /*  @param {string} filter - optional - sort parameter
  */
  getPublicationInfo(
    datasetId: string,
    page: number,
    sort?: SortParameter,
    filter?: string
  ): Observable<DatasetDepublicationInfo> {
    const sortParam = this.parseSortParameter(sort);
    const filterParam = this.parseFilterParameter(filter);
    const url = `${apiSettings.apiHostCore}/depublish/record_ids/${datasetId}?page=${page}${sortParam}${filterParam}`;
    return this.http.get<DatasetDepublicationInfo>(url).pipe(this.errors.handleRetry());
  }

  /** flattenDatasetDepublicationInfos
  /*  retrieve publication information
  /*  @param {function} getResults - the data function
  /*  @param {number} endPage - the last page to get
  */
  flattenDatasetDepublicationInfos(
    getResults: (page: number) => Observable<DatasetDepublicationInfo>,
    endPage: number
  ): Observable<DatasetDepublicationInfo> {
    const observables: Observable<DatasetDepublicationInfo>[] = [];
    for (let i = 0; i <= endPage; i++) {
      observables.push(getResults(i));
    }
    return forkJoin(observables).pipe(
      map((resultList) => {
        const lastResult = resultList[resultList.length - 1];
        const allResults = ([] as RecordDepublicationInfo[]).concat(
          ...resultList.map((item) => item.depublicationRecordIds.results)
        );
        return {
          depublicationRecordIds: {
            results: allResults,
            nextPage: lastResult.depublicationRecordIds.nextPage,
            listSize: lastResult.depublicationRecordIds.listSize
          },
          depublicationTriggerable: lastResult.depublicationTriggerable
        } as DatasetDepublicationInfo;
      })
    );
  }

  /** getPublicationInfoUptoPage
  /*  paginated record publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {number} endPage - the number of pages to fetch
  /*  @param {SortParameter} sort - optional - sort parameter
  /*  @param {string} filter - optional - sort parameter
  */
  getPublicationInfoUptoPage(
    datasetId: string,
    endPage: number,
    sort?: SortParameter,
    filter?: string
  ): Observable<DatasetDepublicationInfo> {
    const getResults = (page: number): Observable<DatasetDepublicationInfo> =>
      this.getPublicationInfo(datasetId, page, sort, filter);
    return this.flattenDatasetDepublicationInfos(getResults, endPage);
  }
}
