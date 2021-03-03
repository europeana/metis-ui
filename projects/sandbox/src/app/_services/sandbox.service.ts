import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { DatasetInfo, SubmissionResponseData } from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxService {
  constructor(private readonly http: HttpClient) {}

  /** requestProgress
  /*
  /* request progress info from server
  */
  requestProgress(id: string): Observable<DatasetInfo> {
    const url = `${apiSettings.apiHost}/dataset/${id}`;
    return this.http.get<DatasetInfo>(url);
  }

  /** submitDataset
  /*  attach file to form and post
  /*  @param {string} datasetName - the datasetName url parameter
  /*  @param {string} country - the country url parameter
  /*  @param {string} language - the language url parameter
  /*  @param {string} fileFormName - the name of the file data
  /*  @param {File} file - zip file of records
  */
  submitDataset(
    datasetName: string,
    country: string,
    language: string,
    fileFormName: string,
    file: File
  ): Observable<SubmissionResponseData> {
    const url = `${apiSettings.apiHost}/dataset/${datasetName}/process?country=${country}&language=${language}`;
    const formData = new FormData();
    formData.append(fileFormName, file);

    return this.http.post<SubmissionResponseData>(url, formData, {
      observe: 'events',
      params: {
        clientFilename: file.name,
        mimeType: file.type
      },
      reportProgress: true
    }) as Observable<SubmissionResponseData>;
  }
}
