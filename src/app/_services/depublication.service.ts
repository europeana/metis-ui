import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiSettings } from '../../environments/apisettings';
import {
  MoreResults,
  RecordPublicationInfo,
  Results,
  SortDirection,
  SortParameter
} from '../_models';

import { collectResultsUptoPage } from './service-utils';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class DepublicationService {
  constructor(private readonly http: HttpClient, private readonly errors: ErrorService) {}

  /** depublishDataset
  /*  depublish entire dataset
  /*  @param {string} datasetId - the dataset to depublish
  */
  depublishDataset(datasetId: string): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublished_dataset`;
    return this.http
      .post<boolean>(url, datasetId, {
        reportProgress: true
      })
      .pipe(this.errors.handleRetry());
  }

  /** handleUploadEvents
  /*  record upload events
  /*  @param {HttpEvent} event - event from the server
  */
  handleUploadEvents(event: HttpEvent<Object>): boolean {
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
    const url = `${apiSettings.apiHostCore}/depublished_records/${datasetId}`;
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
      .pipe(map(this.handleUploadEvents))
      .pipe(this.errors.handleRetry());
  }

  /** setPublicationInfo
  /*  post publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {string} toDepublish - depublication record urls
  */
  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/depublished_records/${datasetId}`;
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
    return p ? `&sortField=${p.field}&sortAscending=${p.direction === SortDirection.ASC}` : '';
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
  ): Observable<Results<RecordPublicationInfo>> {
    const sortParam = this.parseSortParameter(sort);
    const filterParam = this.parseFilterParameter(filter);
    const url = `${apiSettings.apiHostCore}/depublished_records/${datasetId}?page=${page}${sortParam}${filterParam}`;
    return this.http.get<Results<RecordPublicationInfo>>(url).pipe(this.errors.handleRetry());
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
  ): Observable<MoreResults<RecordPublicationInfo>> {
    const getResults = (page: number): Observable<Results<RecordPublicationInfo>> =>
      this.getPublicationInfo(datasetId, page, sort, filter);
    return collectResultsUptoPage(getResults, endPage);
  }
}
