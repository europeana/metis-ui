import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockCountries, mockDataset, mockLanguages, mockRecordReport } from '../_mocked';
import {
  FieldOption,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';
import { SandboxService } from '.';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

  const formBuilder: FormBuilder = new FormBuilder();

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
      .expect('GET', `/dataset/${datasetId}/record?recordId=${recordId}&recordIdType=PROVIDER_ID`)
      .send(mockRecordReport);
    sub.unsubscribe();
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
    const url = 'http://xyz.com';

    const form = formBuilder.group({
      name: [name, []],
      country: [country, []],
      language: [language, []],
      url: [url, []]
    });

    const sub = service
      .submitDataset(form, [])
      .subscribe((response: SubmissionResponseData | SubmissionResponseDataWrapped) => {
        expect(response).toBeTruthy();
      });

    mockHttp
      .expect(
        'POST',
        `/dataset/${name}/harvestByUrl?country=${country}&language=${language}&url=${encodeURIComponent(
          url
        )}`
      )
      .body(new FormData())
      .send(form);

    sub.unsubscribe();
  });
});
