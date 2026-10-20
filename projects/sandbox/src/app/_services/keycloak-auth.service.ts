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

  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _userId = signal<string>('');
  private readonly _userProfile = signal<string>('');

  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly userId = this._userId.asReadonly();
  public readonly userProfile = this._userProfile.asReadonly();

  constructor() {
    const syncEffect = effect(() => {
      this.keycloakSignal();

      this._isAuthenticated.set(!!this.keycloakEngine.authenticated);
      this._userId.set(this.keycloakEngine.idTokenParsed?.sub || '');
      this._userProfile.set(
        this.keycloakEngine.idTokenParsed?.preferred_username ||
          this.keycloakEngine.idTokenParsed?.given_name ||
          ''
      );
    });

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
