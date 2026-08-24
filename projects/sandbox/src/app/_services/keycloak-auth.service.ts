import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  private readonly keycloakEngine = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly destroyRef = inject(DestroyRef);

  // 1. Core reactive state primitives
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _userId = signal<string>('');
  private readonly _userProfile = signal<string>('');

  // 2. Read-only structural outputs to keep dependencies stable
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly userId = this._userId.asReadonly();
  public readonly userProfile = this._userProfile.asReadonly();

  constructor() {
    // 3. Track events actively inside an isolated effect block
    const syncEffect = effect(() => {
      // Consume external trigger token safely
      this.keycloakSignal();

      // Compute internal layout states safely outside of computed chains
      this._isAuthenticated.set(!!this.keycloakEngine.authenticated);
      this._userId.set(this.keycloakEngine.idTokenParsed?.sub || '');
      this._userProfile.set(
        this.keycloakEngine.idTokenParsed?.preferred_username ||
          this.keycloakEngine.idTokenParsed?.given_name ||
          ''
      );
    });

    // 4. Force immediate reference breakdown to prevent Vitest memory leaks
    this.destroyRef.onDestroy(() => {
      syncEffect.destroy();
    });
  }

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
