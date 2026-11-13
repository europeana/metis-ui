import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { apiSettings } from '../../environments/apisettings';
import { Country, Language } from '../_models';
import { mockedCountries, mockedLanguages } from '../_mocked';
import { CountriesService } from '.';

describe('CountriesService', () => {
  let httpTesting: HttpTestingController;
  let service: CountriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CountriesService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the countries (cached)', () => {
    let firstResult: Country[] | undefined;
    let secondResult: Country[] | undefined;
    let cachedResult: Country[] | undefined;

    const sub1 = service.getCountries().subscribe((countries) => (firstResult = countries));
    const sub2 = service.getCountries().subscribe((countries) => (secondResult = countries));

    const req = httpTesting.expectOne({
      method: 'GET',
      url: `${apiSettings.apiHostCore}/datasets/countries`
    });
    req.flush(mockedCountries);

    expect(firstResult).toEqual(mockedCountries);
    expect(secondResult).toEqual(mockedCountries);

    sub1.unsubscribe();
    sub2.unsubscribe();

    const sub3 = service.getCountries().subscribe((countries) => (cachedResult = countries));
    expect(cachedResult).toEqual(mockedCountries);
    sub3.unsubscribe();
  });

  it('should evict failed countries request from cache and retry', () => {
    let errorCaught = false;
    let retryResult: Country[] | undefined;

    const sub1 = service.getCountries().subscribe({
      error: () => (errorCaught = true)
    });
    httpTesting
      .expectOne({ method: 'GET', url: `${apiSettings.apiHostCore}/datasets/countries` })
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(errorCaught).toBe(true);
    sub1.unsubscribe();

    const sub2 = service.getCountries().subscribe((countries) => (retryResult = countries));
    httpTesting
      .expectOne({ method: 'GET', url: `${apiSettings.apiHostCore}/datasets/countries` })
      .flush(mockedCountries);
    expect(retryResult).toEqual(mockedCountries);
    sub2.unsubscribe();
  });

  it('should get the languages (cached)', () => {
    let firstResult: Language[] | undefined;
    let secondResult: Language[] | undefined;
    let cachedResult: Language[] | undefined;

    const sub1 = service.getLanguages().subscribe((languages) => (firstResult = languages));
    const sub2 = service.getLanguages().subscribe((languages) => (secondResult = languages));

    const req = httpTesting.expectOne({
      method: 'GET',
      url: `${apiSettings.apiHostCore}/datasets/languages`
    });
    req.flush(mockedLanguages);

    expect(firstResult).toEqual(mockedLanguages);
    expect(secondResult).toEqual(mockedLanguages);

    sub1.unsubscribe();
    sub2.unsubscribe();

    const sub3 = service.getLanguages().subscribe((languages) => (cachedResult = languages));
    expect(cachedResult).toEqual(mockedLanguages);
    sub3.unsubscribe();
  });

  it('should evict failed languages request from cache and retry', () => {
    let errorCaught = false;
    let retryResult: Language[] | undefined;

    const sub1 = service.getLanguages().subscribe({
      error: () => (errorCaught = true)
    });
    httpTesting
      .expectOne({ method: 'GET', url: `${apiSettings.apiHostCore}/datasets/languages` })
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(errorCaught).toBe(true);
    sub1.unsubscribe();

    const sub2 = service.getLanguages().subscribe((languages) => (retryResult = languages));
    httpTesting
      .expectOne({ method: 'GET', url: `${apiSettings.apiHostCore}/datasets/languages` })
      .flush(mockedLanguages);
    expect(retryResult).toEqual(mockedLanguages);
    sub2.unsubscribe();
  });
});
