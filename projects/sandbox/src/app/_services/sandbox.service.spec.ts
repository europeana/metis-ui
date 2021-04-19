import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockCountries, mockDataset, mockLanguages } from '../_mocked';
import { FieldOption } from '../_models';
import { SandboxService } from '.';

describe('sandbox service', () => {
  let mockHttp: MockHttp;
  let service: SandboxService;

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

  it('should get the progress', () => {
    const sub = service.requestProgress('1').subscribe((datasetInfo) => {
      expect(datasetInfo).toEqual(mockDataset);
    });
    mockHttp.expect('GET', '/dataset/1').send(mockDataset);
    sub.unsubscribe();
  });
});
