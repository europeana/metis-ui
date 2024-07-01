import { Injectable } from '@angular/core';
import { matomoSettings } from '../../environments/matomo-settings';
import { MatomoLabel } from '../_models';

@Injectable({ providedIn: 'root' })
export class MatomoService {
  /** trackNavigation
  /*  @param { string } datasetId
  /*  @param { string } recordId
  /* @returns Observable<Array<ProblemPattern>>
  **/
  trackNavigation(labels: Array<MatomoLabel>): void {
    const _paq = matomoSettings.getPAQ();
    if (_paq) {
      _paq.push(['trackEvent', 'navigation', 'click'].concat(labels));
    }
  }

  urlChanged(path: string, title: string): void {
    const _paq = matomoSettings.getPAQ();
    if (_paq) {
      _paq.push(['setCustomUrl', path]);
      _paq.push(['setDocumentTitle', title]);
      _paq.push(['trackPageView']);
    }
  }
}
