import { Injectable } from '@angular/core';

@Injectable()
export class ProvidersService {

  providers = [
    'Österreichische Nationalbibliothek - Austrian National Library',
    'Internet Culturale',
    'U.S. Department of Agriculture, National Agricultural Library',
    'Uppsala University',
    'The British Library',
    'New York Botanical Garden, LuEsther T. Mertz Library'
  ];

  getProviders() {
    return this.providers;
  }

}
