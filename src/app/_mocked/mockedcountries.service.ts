import { Observable, of as observableOf } from 'rxjs';

import { Country } from '../_models/country';
import { Language } from '../_models/language';
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
