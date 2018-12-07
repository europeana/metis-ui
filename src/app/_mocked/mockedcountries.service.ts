import { Observable, of as observableOf } from 'rxjs';

import { Country, Language } from '../_models';
import { CountriesService } from '../_services';

export const mockedCountries: Country[] = [
  { enum: 'CHINA', name: 'China', isoCode: 'CN' },
  { enum: 'FRANCE', name: 'France', isoCode: 'FR' },
];

export class MockCountriesService extends CountriesService {
  getCountries(): Observable<Country[]> {
    return observableOf(mockedCountries);
  }

  getLanguages(): Observable<Language[]> {
    return observableOf(mockedCountries);
  }
}
