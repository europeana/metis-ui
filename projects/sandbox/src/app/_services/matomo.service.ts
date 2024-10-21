import { Injectable } from '@angular/core';
import { matomoSettings } from '../../environments/matomo-settings';
import { MatomoLabel } from '../_models';

@Injectable({ providedIn: 'root' })
export class MatomoService {
  /** trackNavigation
   *  track non-url-changing browser activity
   *  @param { Array<MatomoLabel> } labels
   **/
  trackNavigation(labels: Array<MatomoLabel>): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _paq = matomoSettings.getPAQ() as Array<any>;
    if (_paq) {
      _paq.push(['trackEvent', 'navigation', 'click', labels]);
    }
  }

  /** urlChanged
   *  track url-changing browser activity
   *  @param { string } path
   *  @param { string } title
   **/
  urlChanged(path: string, title: string): void {
    const _paq = matomoSettings.getPAQ();
    if (_paq) {
      _paq.push(['setCustomUrl', path]);
      _paq.push(['setDocumentTitle', title]);
      _paq.push(['trackPageView']);
    }
  }
}
