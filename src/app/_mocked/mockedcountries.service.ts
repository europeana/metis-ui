
import {of as observableOf,  Observable } from 'rxjs';
import { CountriesService } from '../_services';


export let mockedCountries = [
	{enum: 'CHINA', name: 'China', isoCode: 'CN'},
  {enum: 'FRANCE', name: 'France', isoCode: 'FR'}
];

export class MockCountriesService extends CountriesService {
  getCountriesLanguages() {
    return observableOf(mockedCountries);
  }
}