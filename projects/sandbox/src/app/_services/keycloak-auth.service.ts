// projects/sandbox/src/app/_services/keycloak-auth.service.ts
import { Injectable, inject, computed } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  private readonly keycloakEngine = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  /**
   * Reactive state monitoring library-wide initialization events.
   * Listens to the signal stream as a dependency anchor, but always resolves
   * against the absolute client engine instance state.
   */
  public readonly isAuthenticated = computed(() => {
    // 1. Establish the reactive tracking anchor whenever any event pushes down the pipe
    this.keycloakSignal();

    // 2. Read the absolute source of truth directly from the core client instance
    return !!this.keycloakEngine.authenticated;
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
