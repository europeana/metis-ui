import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { Country, Language } from '../_models';

export const mockedCountries: Country[] = [
  { enum: 'CHINA', name: 'China', isoCode: 'CN' },
  { enum: 'FRANCE', name: 'France', isoCode: 'FR' }
];

export const mockedLanguages: Language[] = [
  { enum: 'EN', name: 'English' },
  { enum: 'FR', name: 'French' }
];

export class MockCountriesService {
  errorMode = false;

  getCountries(): Observable<Country[]> {
    if (this.errorMode) {
      return throwError({
        status: 401,
        error: { errorMessage: 'Mock getCountries Error' }
      } as HttpErrorResponse);
    }
    return of(mockedCountries);
  }

  getLanguages(): Observable<Language[]> {
    if (this.errorMode) {
      return throwError({
        status: 401,
        error: { errorMessage: 'Mock getLanguages Error' }
      } as HttpErrorResponse);
    }
    return of(mockedLanguages);
  }
}

export class MockCountriesServiceErrors extends MockCountriesService {
  errorMode = true;
}
