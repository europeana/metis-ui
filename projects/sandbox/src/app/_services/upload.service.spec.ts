import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FormBuilder, FormGroup } from '@angular/forms';

import { MockHttp, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockCountries, mockLanguages } from '../_mocked';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';
import { UploadService } from '.';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('upload service', () => {
  let mockHttp: MockHttp;
  let service: UploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UploadService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
    service = TestBed.inject(UploadService);
  });

  /*
  afterEach(() => {
    mockHttp.verify();
  });
  */

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

  it('should submit the dataset', () => {
    const name = 'Test Name';
    const country = 'Scotland';
    const language = 'EN';
    const metadataFormat = 'XXX';
    const setSpec = 'yyy';
    const url = 'http://xyz.com';
    const formBuilder = new FormBuilder();

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
});
