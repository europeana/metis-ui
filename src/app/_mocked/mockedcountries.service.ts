import { Observable, of as observableOf } from 'rxjs';

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
  getCountries(): Observable<Country[]> {
    return observableOf(mockedCountries);
  }

  getLanguages(): Observable<Language[]> {
    return observableOf(mockedLanguages);
  }
}
