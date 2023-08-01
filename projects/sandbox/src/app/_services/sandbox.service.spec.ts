import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { MockHttp, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  mockCountries,
  mockDataset,
  mockDatasetInfo,
  mockLanguages,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockProcessedRecordData,
  mockRecordReport
} from '../_mocked';
import {
  DatasetInfo,
  DatasetStatus,
  DatasetTierSummaryRecord,
  FieldOption,
  ProblemPattern,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';
import { SandboxService } from '.';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

  const formBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SandboxService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(SandboxService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the countries', () => {
    const sub = service.getCountries().subscribe((countries: Array<FieldOption>) => {
      expect(countries).toEqual(mockCountries);
    });
    mockHttp.expect('GET', '/dataset/countries').send(mockCountries);
    sub.unsubscribe();
  });

  it('should get the dataset records', () => {
    const sub = service.getDatasetRecords(0).subscribe((data: Array<DatasetTierSummaryRecord>) => {
      expect(data).toBeTruthy();
    });
    mockHttp.expect('GET', '/dataset/0/records-tiers').send(mockCountries);
    sub.unsubscribe();
  });

  it('should get the languages', () => {
    const sub = service.getLanguages().subscribe((languages: Array<FieldOption>) => {
      expect(languages).toEqual(mockLanguages);
    });
    mockHttp.expect('GET', '/dataset/languages').send(mockLanguages);
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
    mockHttp.expect('GET', '/dataset-info/1').send(mockDatasetInfo);
    sub.unsubscribe();
  });

  it('should get the dataset info (from the cache)', () => {
    spyOn(service, 'requestDatasetInfo').and.callFake(() => {
      return of(({} as unknown) as DatasetInfo);
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
    mockHttp.expect('GET', '/dataset/1').send(mockDataset);
    sub.unsubscribe();
  });

  it('should submit the dataset', () => {
    const name = 'Test Name';
    const country = 'Scotland';
    const language = 'EN';
    const metadataFormat = 'XXX';
    const setSpec = 'yyy';
    const url = 'http://xyz.com';

    const getForm = (protocol: ProtocolType): FormGroup => {
      const res = formBuilder.group({
        name: [name, []],
        country: [country, []],
        language: [language, []],
        harvestUrl: [url, []],
        metadataFormat: [metadataFormat, []],
        setSpec: [setSpec, []],
        stepSize: [1, []],
        uploadProtocol: [protocol, []],
        url: [url, []],
        xsltFile: []
      });
      return res;
    };

    const form1 = getForm(ProtocolType.HTTP_HARVEST);
    const form2 = getForm(ProtocolType.ZIP_UPLOAD);
    const form3 = getForm(ProtocolType.OAIPMH_HARVEST);

    const sub1 = service
      .submitDataset(form1, [])
      .subscribe((response: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        expect(response).toBeTruthy();
      });
    const sub2 = service
      .submitDataset(form2, ['xsltFile', 'does-not-exist'])
      .subscribe((response: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        expect(response).toBeTruthy();
      });
    const sub3 = service
      .submitDataset(form3, [])
      .subscribe((response: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        expect(response).toBeTruthy();
      });

    mockHttp
      .expect(
        'POST',
        `/dataset/${name}/harvestByUrl?country=${country}&language=${language}&stepsize=1&url=${encodeURIComponent(
          url
        )}`
      )
      .body(new FormData())
      .send(form1);
    mockHttp
      .expect(
        'POST',
        `/dataset/${name}/harvestByFile?country=${country}&language=${language}&stepsize=1`
      )
      .body(new FormData())
      .send(form2);
    mockHttp
      .expect(
        'POST',
        [
          `/dataset/${name}/harvestOaiPmh?country=${country}&language=${language}`,
          `&stepsize=1&metadataformat=${metadataFormat}&setspec=${setSpec}`,
          `&url=${encodeURIComponent(url)}`
        ].join('')
      )
      .body(new FormData())
      .send(form3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
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

  it('should get the processed record data', fakeAsync(() => {
    const datasetId = '123_PROCESSED_RECORD_DATA';
    const recordId = '456';
    const processedDataset = Object.assign({}, mockDataset);
    processedDataset.status = DatasetStatus.IN_PROGRESS;
    delete processedDataset['portal-publish'];

    const sub = service
      .getProcessedRecordData(datasetId, recordId)
      .subscribe((prd: ProcessedRecordData) => {
        expect(prd).toEqual(mockProcessedRecordData);
      });

    tick();
    mockHttp.expect('GET', `/dataset/${datasetId}`).send(processedDataset);
    tick(apiSettings.interval);

    processedDataset.status = DatasetStatus.COMPLETED;
    processedDataset['portal-publish'] = 'http://portal';
    mockHttp.expect('GET', `/dataset/${datasetId}`).send(processedDataset);
    tick(apiSettings.interval);

    mockHttp
      .expect('GET', `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}`)
      .send(mockRecordReport);
    sub.unsubscribe();
  }));
});
