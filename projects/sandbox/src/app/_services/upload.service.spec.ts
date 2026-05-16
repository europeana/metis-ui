import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProtocolType } from 'shared';

import { mockCountries, mockLanguages } from '../_mocked';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';
import { UploadService } from '.';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('upload service', () => {
  let mockHttp: HttpTestingController;
  let service: UploadService;
  const apiHost = 'null';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UploadService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    service = TestBed.inject(UploadService);
    mockHttp = TestBed.inject(HttpTestingController);
  });

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
    mockHttp.expectOne(`${apiHost}/dataset/countries`);
    sub.unsubscribe();
  });

  it('should get the languages', () => {
    const sub = service.getLanguages().subscribe((languages: Array<FieldOption>) => {
      expect(languages).toEqual(mockLanguages);
    });
    mockHttp.expectOne(`${apiHost}/dataset/languages`);
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

    mockHttp.expectOne(
      `${apiHost}/dataset/${name}/harvestByUrl?country=${country}&language=${language}&stepsize=1&url=${encodeURIComponent(
        url
      )}`
    );

    mockHttp.expectOne(
      `${apiHost}/dataset/${name}/harvestByFile?country=${country}&language=${language}&stepsize=1`
    );

    mockHttp.expectOne(
      [
        apiHost,
        `/dataset/${name}/harvestOaiPmh?country=${country}&language=${language}`,
        `&stepsize=1&metadataformat=${metadataFormat}&setspec=${setSpec}`,
        `&url=${encodeURIComponent(url)}`
      ].join('')
    );

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });
});
