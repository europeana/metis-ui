import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiSettings } from '../../environments/apisettings';
import { MoreResults, RecordPublicationInfo, Results } from '../_models';

import { collectResultsUptoPage } from './service-utils';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class DepublicationService {
  constructor(private readonly http: HttpClient, private readonly errors: ErrorService) {}

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
    const url = `${apiSettings.apiHostCore}/records/${datasetId}`;
    const formData = new FormData();

    formData.append('depublicationFile', file);

    return this.http
      .post(url, formData, {
        headers: {
          'Content-Type': file.type
        },
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
    const url = `${apiSettings.apiHostCore}/records/${datasetId}`;
    return this.http.post<boolean>(url, { toDepublish }).pipe(this.errors.handleRetry());
  }

  /** getPublicationInfo
  /*  retrieve publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {number} page - the pagination target
  */
  getPublicationInfo(datasetId: string, page: number): Observable<Results<RecordPublicationInfo>> {
    const url = `${apiSettings.apiHostCore}/records/${datasetId}?nextPage=${page}&sort=1`;
    return this.http.get<Results<RecordPublicationInfo>>(url).pipe(this.errors.handleRetry());
  }

  /** getPublicationInfoUptoPage
  /*  paginated record publication information
  /*  @param {string} datasetId - the dataset id
  /*  @param {number} endPage - the number of pages to fetch
  */
  getPublicationInfoUptoPage(
    datasetId: string,
    endPage: number
  ): Observable<MoreResults<RecordPublicationInfo>> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.getPublicationInfo(datasetId, page);
    return collectResultsUptoPage(getResults, endPage);
  }
}
