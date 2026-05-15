import { Injectable, inject, computed } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  private readonly keycloakEngine = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  public readonly isAuthenticated = computed(() => {
    this.keycloakSignal();
    return !!this.keycloakEngine.authenticated;
  });

  // Convert to highly performant, memoized computed signals
  public readonly userId = computed(() => {
    this.keycloakSignal();
    return this.keycloakEngine.idTokenParsed?.sub || '';
  });

  public readonly userProfile = computed(() => {
    this.keycloakSignal();
    return (
      this.keycloakEngine.idTokenParsed?.preferred_username ||
      this.keycloakEngine.idTokenParsed?.given_name ||
      ''
    );
  });

  public login(): void {
    this.keycloakEngine.login({ redirectUri: window.location.href });
  }

  public logout(): void {
    this.keycloakEngine.logout({ redirectUri: `${window.location.origin}/` });
  }

  public getAccountUrl(): string {
    return this.keycloakEngine.createAccountUrl() || '';
  }
}
