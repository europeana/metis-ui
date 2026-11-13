import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import {
  mockDataset,
  mockDatasetInfo,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockProcessedRecordData,
  mockRecordReport
} from '../_mocked';
import {
  DatasetInfo,
  DatasetStatus,
  ProblemPattern,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordReport,
  TierSummaryRecord
} from '../_models';
import { SandboxService } from '.';

describe('SandboxService', () => {
  let httpTesting: HttpTestingController;
  let service: SandboxService;

  const expectRequest = (method: string, path: string) =>
    httpTesting.expectOne({ method, url: `${apiSettings.apiHost}${path}` });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SandboxService);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the dataset records', () => {
    const sub = service.getDatasetRecords(0).subscribe((data: Array<TierSummaryRecord>) => {
      expect(data).toBeTruthy();
    });
    expectRequest('GET', '/dataset/0/records-tiers').flush([
      {
        name: 'Greece',
        xmlValue: 'GREECE'
      }
    ]);
    sub.unsubscribe();
  });

  it('should get the record report', () => {
    const datasetId = '123';
    const recordId = '456';
    const sub = service.getRecordReport(datasetId, recordId).subscribe((report: RecordReport) => {
      expect(report).toEqual(mockRecordReport);
    });
    expectRequest(
      'GET',
      `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}`
    ).flush(mockRecordReport);
    sub.unsubscribe();
  });

  it('should request the dataset info', () => {
    const sub = service.requestDatasetInfo('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDatasetInfo);
    });
    expectRequest('GET', '/dataset/1/info').flush(mockDatasetInfo);
    sub.unsubscribe();
  });

  it('should get the dataset info (from the cache)', () => {
    const mockInfo1 = ({ 'creation-date': new Date().toISOString() } as unknown) as DatasetInfo;
    const mockInfo2 = ({ 'creation-date': new Date().toISOString() } as unknown) as DatasetInfo;

    const spy = vi
      .spyOn(service, 'requestDatasetInfo')
      .mockImplementation((id) => of(id === '1' ? mockInfo1 : mockInfo2));

    // First call for '1' -> hits requestDatasetInfo
    let result1: DatasetInfo | undefined;
    service.getDatasetInfo('1').subscribe((res) => (result1 = res));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(mockInfo1);

    // Second call for '1' -> served from Map cache
    let cachedResult1: DatasetInfo | undefined;
    service.getDatasetInfo('1').subscribe((res) => (cachedResult1 = res));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(cachedResult1).toEqual(mockInfo1);

    // First call for '2' -> hits requestDatasetInfo
    service.getDatasetInfo('2').subscribe();
    expect(spy).toHaveBeenCalledTimes(2);

    // Second call for '2' -> served from Map cache
    service.getDatasetInfo('2').subscribe();
    expect(spy).toHaveBeenCalledTimes(2);

    // Call for '2' with clearCache = true -> evicts & re-fetches
    service.getDatasetInfo('2', true).subscribe();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should evict failed requests from the cache so subsequent calls retry', () => {
    const spy = vi
      .spyOn(service, 'requestDatasetInfo')
      .mockReturnValueOnce(throwError(() => new Error('Network error')))
      .mockReturnValueOnce(of(mockDatasetInfo));

    // First call fails -> should be evicted from cache
    let caughtError: Error | undefined;
    service.getDatasetInfo('1').subscribe({
      error: (err) => (caughtError = err)
    });
    expect(caughtError?.message).toBe('Network error');
    expect(spy).toHaveBeenCalledTimes(1);

    // Second call retries instead of replaying the cached error
    let result: DatasetInfo | undefined;
    service.getDatasetInfo('1').subscribe((res) => (result = res));
    expect(result).toEqual(mockDatasetInfo);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should get the progress', () => {
    const sub = service.requestProgress('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDataset);
    });
    expectRequest('GET', '/dataset/1/progress').flush(mockDataset);
    sub.unsubscribe();
  });

  it('should get the problem-patterns for datasets', () => {
    const datasetId = '123';
    const sub = service
      .getProblemPatternsDataset(datasetId)
      .subscribe((pp: ProblemPatternsDataset) => {
        expect(pp).toEqual(mockProblemPatternsDataset);
      });
    expectRequest('GET', `/pattern-analysis/${datasetId}/get-dataset-pattern-analysis`).flush(
      mockProblemPatternsDataset
    );
    sub.unsubscribe();
  });

  it('should get the problem-patterns for records', () => {
    const datasetId = '123';
    const recordId = '456';
    const sub = service
      .getProblemPatternsRecord(datasetId, recordId)
      .subscribe((pp: Array<ProblemPattern>) => {
        expect(pp).toEqual(mockProblemPatternsRecord);
      });
    expectRequest(
      'GET',
      `/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`
    ).flush(mockProblemPatternsRecord);
    sub.unsubscribe();
  });

  it('should get the problem-patterns for records (wrapped)', () => {
    const datasetId = '123';
    const recordId = '456';
    const sub = service
      .getProblemPatternsRecordWrapped(datasetId, recordId)
      .subscribe((pp: ProblemPatternsRecord) => {
        expect(pp.problemPatternList).toEqual(mockProblemPatternsRecord);
      });
    expectRequest(
      'GET',
      `/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`
    ).flush(mockProblemPatternsRecord);
    sub.unsubscribe();
  });

  it('should get the processed record data', async () => {
    vi.useFakeTimers();
    const datasetId = '123_PROCESSED_RECORD_DATA';
    const recordId = '456';
    const processedDataset = structuredClone(mockDataset);
    processedDataset.status = DatasetStatus.IN_PROGRESS;
    delete processedDataset['portal-preview'];

    const sub = service
      .getProcessedRecordData(datasetId, recordId)
      .subscribe((prd: ProcessedRecordData) => {
        expect(prd).toEqual(mockProcessedRecordData);
      });

    vi.advanceTimersByTime(0);
    expectRequest('GET', `/dataset/${datasetId}/progress`).flush(processedDataset);
    vi.advanceTimersByTime(apiSettings.interval);
    await Promise.resolve();

    processedDataset.status = DatasetStatus.COMPLETED;
    processedDataset['portal-preview'] = 'http://portal';
    expectRequest('GET', `/dataset/${datasetId}/progress`).flush(processedDataset);
    vi.advanceTimersByTime(apiSettings.interval);
    await Promise.resolve();

    expectRequest(
      'GET',
      `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}`
    ).flush(mockRecordReport);
    sub.unsubscribe();
  });
});
