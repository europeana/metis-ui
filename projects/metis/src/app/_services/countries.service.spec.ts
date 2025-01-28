import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockedCountries, mockedLanguages } from '../_mocked';
import { CountriesService } from '.';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('countries service', () => {
  let mockHttp: MockHttp;
  let service: CountriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CountriesService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.inject(CountriesService);
  });

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
