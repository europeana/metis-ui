import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MockHttp, ProtocolType } from 'shared';
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
      .expect(
        'GET',
        `/dataset/${datasetId}/record/compute-tier-calculation?recordId=${recordId}&recordIdType=EUROPEANA_ID`
      )
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
        uploadProtocol: [protocol, []],
        url: [url, []]
      });
      res.addControl('xsltFile', new FormControl(''));
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
        `/dataset/${name}/harvestByUrl?country=${country}&language=${language}&url=${encodeURIComponent(
          url
        )}`
      )
      .body(new FormData())
      .send(form1);
    mockHttp
      .expect('POST', `/dataset/${name}/harvestByFile?country=${country}&language=${language}`)
      .body(new FormData())
      .send(form2);
    mockHttp
      .expect(
        'POST',
        [
          `/dataset/${name}/harvestOaiPmh?country=${country}&language=${language}`,
          `&metadataformat=${metadataFormat}&setspec=${setSpec}`,
          `&url=${encodeURIComponent(url)}`
        ].join('')
      )
      .body(new FormData())
      .send(form3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });
});
