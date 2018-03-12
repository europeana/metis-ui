import { Injectable } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Injectable()

export class SettingsService {

  apiSettings;
  apiHostCore;
  apiHostAuth;

  constructor() {}

  /** returnApiHosts
  /* return api settings
  /* to use throughout entite application
  */
  returnApiHosts() {
    return apiSettings;    
  }

}