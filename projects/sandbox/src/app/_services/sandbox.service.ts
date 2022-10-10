import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { KeyedCache, ProtocolType } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import {
  Dataset,
  DatasetInfo,
  FieldOption,
  ProblemPattern,
  ProblemPatternsDataset,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxService {
  datasetInfoCache = new KeyedCache((key) => this.requestDatasetInfo(key));

  constructor(private readonly http: HttpClient) {}

  /**
  /* getProblemPatternsRecord
  /*  @param { string } datasetId
  /*  @param { string } recordId
  /* @returns Observable<Array<ProblemPattern>>
  **/
  getProblemPatternsRecord(datasetId: string, recordId: string): Observable<Array<ProblemPattern>> {
    const url = `${apiSettings.apiHost}/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`;
    return this.http.get<Array<ProblemPattern>>(url);
  }

  /**
  /* getProblemPatternsDataset
  /*  @param { string } datasetId
  /* @returns Observable<ProblemPatternsDataset>
  **/
  getProblemPatternsDataset(datasetId: string): Observable<ProblemPatternsDataset> {
    const url = `${apiSettings.apiHost}/pattern-analysis/${datasetId}/get-dataset-pattern-analysis`;
    return this.http.get<ProblemPatternsDataset>(url);
  }

  /**
  /* getCountries
  /*  gets the country options
  /*  @returns Observable<Array<FieldOption>>
  **/
  getCountries(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/countries`;
    return this.http.get<Array<FieldOption>>(url);
  }

  /**
  /*  getLanguages
  /*  gets the language options
  /*  @returns Observable<Array<FieldOption>>
  **/
  getLanguages(): Observable<Array<FieldOption>> {
    const url = `${apiSettings.apiHost}/dataset/languages`;
    return this.http.get<Array<FieldOption>>(url);
  }

  /** getRecordReport
  /*  @param { string } datasetId
  /*  @param { string } recordId
  /* @returns Observable<RecordReport>
  **/
  getRecordReport(datasetId: string, recordId: string): Observable<RecordReport> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/record/compute-tier-calculation`;
    return this.http.get<RecordReport>(`${url}?recordId=${recordId}`);
  }

  /** requestProgress
  /*  @param { string } datasetId
  /* request progress info from server
  */
  requestProgress(datasetId: string): Observable<Dataset> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}`;
    return this.http.get<Dataset>(url);
  }

  /** requestDatasetInfo
  /*  @param { string } datasetId
  /* request dataset info from server
  */
  requestDatasetInfo(datasetId: string): Observable<DatasetInfo> {
    const url = `${apiSettings.apiHost}/dataset-info/${datasetId}`;
    return this.http.get<DatasetInfo>(url);
  }

  /** getDatasetInfo
  /*  @param { string } datasetId
  /*  @param { false } clearCache - flag cache clear
  /* returns dataset info from cache
  */
  getDatasetInfo(datasetId: string, clearCache = false): Observable<DatasetInfo> {
    if (clearCache) {
      this.datasetInfoCache.clear(datasetId);
    }
    return this.datasetInfoCache.get(datasetId);
  }

  /** submitDataset
  /*  attach file data to form and post
  /*  @param {FormGroup} form - the user-filled data
  /*  @param {Array<string>} fileNames - the names of files to append
  */
  submitDataset(
    form: FormGroup,
    fileNames: Array<string>
  ): Observable<SubmissionResponseData | SubmissionResponseDataWrapped> {
    const protocol = form.value.uploadProtocol;
    let sendUrl = '';
    let harvestType = 'harvestByFile';
    let oaiParameters = '';

    if (protocol === ProtocolType.HTTP_HARVEST) {
      sendUrl = form.value.url;
      harvestType = 'harvestByUrl';
    } else if (protocol === ProtocolType.OAIPMH_HARVEST) {
      sendUrl = form.value.harvestUrl;
      harvestType = 'harvestOaiPmh';
      oaiParameters = `&metadataformat=${form.value.metadataFormat}&setspec=${form.value.setSpec}`;
    }

    const urlParameter = sendUrl.length > 0 ? '&url=' + encodeURIComponent(sendUrl) : '';

    let url = `${apiSettings.apiHost}/dataset/${form.value.name}/${harvestType}`;
    url += `?country=${form.value.country}&language=${form.value.language}${oaiParameters}${urlParameter}`;

    const formData = new FormData();
    let fileAppended = false;

    fileNames.forEach((fileName: string) => {
      const file = form.get(fileName) as FormControl;
      if (file) {
        formData.append(fileName, file.value);
        fileAppended = true;
      }
    });

    if (fileAppended) {
      return this.http.post<SubmissionResponseDataWrapped>(url, formData, {
        observe: 'events',
        reportProgress: true
      }) as Observable<SubmissionResponseDataWrapped | SubmissionResponseData>;
    } else {
      return this.http.post<SubmissionResponseData>(url, formData);
    }
  }
}
