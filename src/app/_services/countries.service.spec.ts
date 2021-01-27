import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import { MockHttp } from '../_helpers/test-helpers';
import { mockedCountries, mockedLanguages, MockErrorService } from '../_mocked';

import { CountriesService, ErrorService } from '.';

describe('countries service', () => {
  let mockHttp: MockHttp;
  let service: CountriesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [CountriesService, { provide: ErrorService, useClass: MockErrorService }],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.inject(CountriesService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get the countries (cached)', () => {
    service
      .getCountries()
      .subscribe((countries) => {
        expect(countries).toEqual(mockedCountries);
      })
      .unsubscribe();
    service
      .getCountries()
      .subscribe((countries) => {
        expect(countries).toEqual(mockedCountries);
      })
      .unsubscribe();
    mockHttp.expect('GET', '/datasets/countries').send(mockedCountries);
  });

  it('should get the languages (cached)', () => {
    service
      .getLanguages()
      .subscribe((languages) => {
        expect(languages).toEqual(mockedLanguages);
      })
      .unsubscribe();
    service
      .getLanguages()
      .subscribe((languages) => {
        expect(languages).toEqual(mockedLanguages);
      })
      .unsubscribe();
    mockHttp.expect('GET', '/datasets/languages').send(mockedLanguages);
  });
});
