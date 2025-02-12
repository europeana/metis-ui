import { Directive, effect, HostListener, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Directive({
  selector: '[appKeycloakSignoutCheck]'
})
export class KeycloakSignoutCheckDirective {
  static readonly cookieUserSignedOut = 'cookieUserSignedOut';

  cookies = inject(CookieService);
  keycloak = inject(Keycloak);

  constructor() {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
    effect(() => {
      const keycloakEvent = keycloakSignal();

      let cookieVal: string | undefined;

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        if (keycloakEvent.args) {
          cookieVal = 'no';
        } else {
          cookieVal = 'yes';
        }
      }
      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        cookieVal = 'yes';
      }
      if (cookieVal) {
        this.cookies.set(KeycloakSignoutCheckDirective.cookieUserSignedOut, cookieVal, {
          path: '/'
        });
      }
    });
  }

  @HostListener('document:visibilitychange')
  visibilitychange(): void {
    if (!document.hidden) {
      if (this.cookies.get(KeycloakSignoutCheckDirective.cookieUserSignedOut) === 'yes') {
        if (this.keycloak.authenticated) {
          this.keycloak.logout();
        }
      }
    }
  }
}
