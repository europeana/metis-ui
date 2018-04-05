import { CountriesService } from '../_services';
import { Observable } from 'rxjs/Observable';


export let mockedCountries = [
	{enum: 'CHINA', name: 'China', isoCode: 'CN'},
  {enum: 'FRANCE', name: 'France', isoCode: 'FR'}
];

export class MockCountriesService extends CountriesService {
  getCountriesLanguages() {
    return Observable.of(mockedCountries);
  }
}