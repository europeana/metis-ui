import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, mergeMap, switchMap, takeLast, takeWhile } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { KeyedCache, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetInfo,
  DatasetProgress,
  DatasetStatus,
  DebiasInfo,
  DebiasReport,
  FieldOption,
  ProblemPattern,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped,
  TierSummaryRecord
} from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxService {
  private readonly http = inject(HttpClient);

  static nullUrlStrings = [
    'Harvesting dataset identifiers and records.',
    'A review URL will be generated when the dataset has finished processing.'
  ];

  datasetInfoCache = new KeyedCache((key) =>
    this.requestDatasetInfo(key).pipe(
      map((datasetInfo: DatasetInfo) => {
        const creationDate = datasetInfo['creation-date'];
        datasetInfo['creation-date'] = formatDate(
          new Date(creationDate),
          'dd/MM/yyyy, HH:mm:ss',
          'en-GB'
        );
        return datasetInfo;
      })
    )
  );

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
  /* getProblemPatternsRecordWrapped
  /*  @param { string } datasetId
  /*  @param { string } recordId
  /* @returns Observable<ProblemPatternsRecord>
  **/
  getProblemPatternsRecordWrapped(
    datasetId: string,
    recordId: string
  ): Observable<ProblemPatternsRecord> {
    return this.getProblemPatternsRecord(datasetId, recordId).pipe(
      map((errorList) => {
        return {
          datasetId: datasetId,
          problemPatternList: errorList
        };
      })
    );
  }

  /**
  /* getProcessedRecordData
  /*  @param { string } datasetId
  /*  @param { string } recordId
  /* @returns Observable<ProcessedRecordData>
  **/
  getProcessedRecordData(datasetId: string, recordId: string): Observable<ProcessedRecordData> {
    const pollInfo = timer(0, apiSettings.interval).pipe(
      switchMap(() => {
        return this.requestProgress(datasetId);
      }),
      takeWhile((dataset: DatasetProgress) => {
        const url = dataset['portal-publish'];
        return (
          dataset.status !== DatasetStatus.COMPLETED &&
          !url &&
          !(url && SandboxService.nullUrlStrings.includes(url))
        );
      }, true),
      takeLast(1)
    );
    return pollInfo.pipe(
      mergeMap((_: DatasetProgress) => {
        return this.getRecordReport(datasetId, recordId).pipe(
          map((report: RecordReport) => {
            return {
              europeanaRecordId: report.recordTierCalculationSummary.europeanaRecordId,
              portalRecordLink: report.recordTierCalculationSummary.portalRecordLink
            };
          })
        );
      })
    );
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
  requestProgress(datasetId: string): Observable<DatasetProgress> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/progress`;
    return this.http.get<DatasetProgress>(url);
  }

  /** requestDatasetInfo
  /*  @param { string } datasetId
  /* request dataset info from server
  */
  requestDatasetInfo(datasetId: string): Observable<DatasetInfo> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/info`;
    return this.http.get<DatasetInfo>(url);
  }

  /** getDatasetInfo
  /*  @param { string } datasetId
  /*  @param { false } clearCache - flag cache clear
  /*  @returns Observable<DatasetInfo> - dataset info from cache
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
    url += `?country=${form.value.country}&language=${form.value.language}`;
    url += `&stepsize=${form.value.stepSize}`;
    url += `${oaiParameters}${urlParameter}`;

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
      return this.http.post<SubmissionResponseDataWrapped>(url, formData);
    } else {
      return this.http.post<SubmissionResponseData>(url, formData);
    }
  }

  /** getDatasetRecords
  /*  @param { number } datasetId
  /*  @returns dataset records
  */
  getDatasetRecords(datasetId: number): Observable<Array<TierSummaryRecord>> {
    return this.http.get<Array<TierSummaryRecord>>(
      `${apiSettings.apiHost}/dataset/${datasetId}/records-tiers`
    );
  }

  runDebiasReport(datasetId: string): Observable<boolean> {
    return this.http.post<boolean>(`${apiSettings.apiHost}/dataset/${datasetId}/debias`, {});
  }

  getDebiasReport(datasetId: string): Observable<DebiasReport> {
    return this.http.get<DebiasReport>(`${apiSettings.apiHost}/dataset/${datasetId}/debias/report`);
  }

  getDebiasInfo(datasetId: string): Observable<DebiasInfo> {
    return this.http.get<DebiasInfo>(`${apiSettings.apiHost}/dataset/${datasetId}/debias/info`);
  }
}
