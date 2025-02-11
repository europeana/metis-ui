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
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        if (keycloakEvent.args) {
          console.log('SIGNAL got a LOGIN - set cookie, args ', keycloakEvent.args);
          this.cookies.set(KeycloakSignoutCheckDirective.cookieUserSignedOut, 'no', { path: '/' });
        } else {
          this.cookies.set(KeycloakSignoutCheckDirective.cookieUserSignedOut, 'yes', { path: '/' });
        }
      }
      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.cookies.set(KeycloakSignoutCheckDirective.cookieUserSignedOut, 'yes', { path: '/' });
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
