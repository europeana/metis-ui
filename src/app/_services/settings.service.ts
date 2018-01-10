import { Injectable } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Injectable()

export class SettingsService {

  apiSettings;
  apiHostCore;
  apiHostAuth;

  constructor() {}

  returnApiHosts() {
    return apiSettings;    
  }

}