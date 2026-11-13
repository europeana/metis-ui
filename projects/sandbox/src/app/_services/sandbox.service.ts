import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import {
  catchError,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  takeLast,
  takeWhile
} from 'rxjs/operators';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetInfo,
  DatasetProgress,
  DatasetStatus,
  ProblemPattern,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordReport,
  TierSummaryRecord
} from '../_models';

@Injectable({
  providedIn: 'root'
})
export class SandboxService {
  private readonly http = inject(HttpClient);
  private readonly datasetInfoCache = new Map<string, Observable<DatasetInfo>>();

  static nullUrlStrings = [
    'Harvesting dataset identifiers and records.',
    'A review URL will be generated when the dataset has finished processing.'
  ];

  /**
   * getProblemPatternsRecord
   * @param { string } datasetId
   * @param { string } recordId
   * @returns Observable<Array<ProblemPattern>>
   */
  getProblemPatternsRecord(datasetId: string, recordId: string): Observable<Array<ProblemPattern>> {
    const url = `${apiSettings.apiHost}/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`;
    return this.http.get<Array<ProblemPattern>>(url);
  }

  /**
   * getProblemPatternsRecordWrapped
   * @param { string } datasetId
   * @param { string } recordId
   * @returns Observable<ProblemPatternsRecord>
   */
  getProblemPatternsRecordWrapped(
    datasetId: string,
    recordId: string
  ): Observable<ProblemPatternsRecord> {
    return this.getProblemPatternsRecord(datasetId, recordId).pipe(
      map((errorList) => {
        return { datasetId: datasetId, problemPatternList: errorList };
      })
    );
  }

  /**
   * getProcessedRecordData
   * @param { string } datasetId
   * @param { string } recordId
   * @returns Observable<ProcessedRecordData>
   */
  getProcessedRecordData(datasetId: string, recordId: string): Observable<ProcessedRecordData> {
    const pollInfo = timer(0, apiSettings.interval).pipe(
      switchMap(() => {
        return this.requestProgress(datasetId);
      }),
      takeWhile((dataset: DatasetProgress) => {
        const url = dataset['portal-preview'];
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
   * getProblemPatternsDataset
   * @param { string } datasetId
   * @returns Observable<ProblemPatternsDataset>
   */
  getProblemPatternsDataset(datasetId: string): Observable<ProblemPatternsDataset> {
    const url = `${apiSettings.apiHost}/pattern-analysis/${datasetId}/get-dataset-pattern-analysis`;
    return this.http.get<ProblemPatternsDataset>(url);
  }

  /**
   * getRecordReport
   * @param { string } datasetId
   * @param { string } recordId
   * @returns Observable<RecordReport>
   */
  getRecordReport(datasetId: string, recordId: string): Observable<RecordReport> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/record/compute-tier-calculation`;
    return this.http.get<RecordReport>(`${url}?recordId=${recordId}`);
  }

  /**
   * requestProgress
   * @param { string } datasetId
   * request progress info from server
   */
  requestProgress(datasetId: string): Observable<DatasetProgress> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/progress`;
    return this.http.get<DatasetProgress>(url);
  }

  /**
   * requestDatasetInfo
   * @param { string } datasetId
   * request dataset info from server
   */
  requestDatasetInfo(datasetId: string): Observable<DatasetInfo> {
    const url = `${apiSettings.apiHost}/dataset/${datasetId}/info`;
    return this.http.get<DatasetInfo>(url);
  }

  /**
   * getDatasetInfo
   * @param { string } datasetId
   * @param { boolean } clearCache - flag cache clear
   * @returns Observable<DatasetInfo> - dataset info from cache
   */
  getDatasetInfo(datasetId: string, clearCache = false): Observable<DatasetInfo> {
    if (clearCache) {
      this.datasetInfoCache.delete(datasetId);
    }

    let cached$ = this.datasetInfoCache.get(datasetId);

    if (!cached$) {
      cached$ = this.requestDatasetInfo(datasetId).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError((err) => {
          this.datasetInfoCache.delete(datasetId);
          return throwError(() => err);
        })
      );
      this.datasetInfoCache.set(datasetId, cached$);
    }

    return cached$;
  }

  /**
   * getDatasetRecords
   * @param { number } datasetId
   * @returns dataset records
   */
  getDatasetRecords(datasetId: number): Observable<Array<TierSummaryRecord>> {
    return this.http.get<Array<TierSummaryRecord>>(
      `${apiSettings.apiHost}/dataset/${datasetId}/records-tiers`
    );
  }
}
