import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MockHttp } from 'shared';
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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SandboxService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(SandboxService);
  });

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the dataset records', () => {
    const sub = service.getDatasetRecords(0).subscribe((data: Array<TierSummaryRecord>) => {
      expect(data).toBeTruthy();
    });
    mockHttp.expect('GET', '/dataset/0/records-tiers').send([
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
    mockHttp
      .expect('GET', `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}`)
      .send(mockRecordReport);
    sub.unsubscribe();
  });

  it('should request the dataset info', () => {
    const sub = service.requestDatasetInfo('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDatasetInfo);
    });
    mockHttp.expect('GET', '/dataset/1/info').send(mockDatasetInfo);
    sub.unsubscribe();
  });

  it('should get the dataset info (from the cache)', () => {
    const date = new Date();
    const dateString = date.toISOString();
    vi.spyOn(service, 'requestDatasetInfo').mockImplementation(() => {
      return of(({ 'creation-date': dateString } as unknown) as DatasetInfo);
    });
    let observable = service.getDatasetInfo('1');
    expect(service.requestDatasetInfo).toHaveBeenCalled();
    observable = service.getDatasetInfo('1');
    expect(service.requestDatasetInfo).toHaveBeenCalledTimes(1);
    observable = service.getDatasetInfo('2');
    expect(service.requestDatasetInfo).toHaveBeenCalledTimes(2);
    observable = service.getDatasetInfo('2');
    expect(service.requestDatasetInfo).toHaveBeenCalledTimes(2);
    observable = service.getDatasetInfo('2', true);
    expect(service.requestDatasetInfo).toHaveBeenCalledTimes(3);
    expect(observable).toBeTruthy();
  });

  it('should get the progress', () => {
    const sub = service.requestProgress('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/dataset/1/progress').send(mockDataset);
    sub.unsubscribe();
  });

  it('should get the problem-patterns for datasets', () => {
    const datasetId = '123';
    const sub = service
      .getProblemPatternsDataset(datasetId)
      .subscribe((pp: ProblemPatternsDataset) => {
        expect(pp).toEqual(mockProblemPatternsDataset);
      });
    mockHttp
      .expect('GET', `/pattern-analysis/${datasetId}/get-dataset-pattern-analysis`)
      .send(mockProblemPatternsDataset);
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
    mockHttp
      .expect(
        'GET',
        `/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`
      )
      .send(mockProblemPatternsRecord);
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
    mockHttp
      .expect(
        'GET',
        `/pattern-analysis/${datasetId}/get-record-pattern-analysis?recordId=${recordId}`
      )
      .send(mockProblemPatternsRecord);
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
    mockHttp.expect('GET', `/dataset/${datasetId}/progress`).send(processedDataset);
    vi.advanceTimersByTime(apiSettings.interval);
    await Promise.resolve();

    processedDataset.status = DatasetStatus.COMPLETED;
    processedDataset['portal-preview'] = 'http://portal';
    mockHttp.expect('GET', `/dataset/${datasetId}/progress`).send(processedDataset);
    vi.advanceTimersByTime(apiSettings.interval);
    await Promise.resolve();

    mockHttp
      .expect('GET', `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}`)
      .send(mockRecordReport);
    sub.unsubscribe();
    vi.useRealTimers();
  });
});
