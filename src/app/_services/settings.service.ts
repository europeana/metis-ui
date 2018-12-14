import { Injectable } from '@angular/core';

import { apiSettings } from '../../environments/apisettings';

export interface Settings {
  apiHostCore: string;
  apiHostAuth: string;
  viewPreview: string;
  viewCollections: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor() {}

  /** returnApiHosts
  /* return api settings
  /* to use throughout entite application
  */
  returnApiHosts(): Settings {
    return apiSettings;
  }
}
