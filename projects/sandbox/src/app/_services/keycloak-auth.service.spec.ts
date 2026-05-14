import { signal, EffectRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { KeycloakAuthService } from './keycloak-auth.service';
import { mockedKeycloak } from 'shared'; // Adjust import paths to match your layout repo structures

describe('KeycloakAuthService (Angular 20 Zoneless)', () => {
  let service: KeycloakAuthService;

  // Create reactive mock signal matching the Keycloak library footprint
  const keycloakEventSignalMock = signal({ type: KeycloakEventType.Ready });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        KeycloakAuthService,
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakEventSignalMock }
      ]
    });

    service = TestBed.inject(KeycloakAuthService);

    // Reset core mock state modifications between separate iterations
    mockedKeycloak.authenticated = false;
    mockedKeycloak.idTokenParsed = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Instance Initialization', () => {
    it('should be created cleanly', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Reactive isAuthenticated Signal Tracking', () => {
    it('should calculate false when engine state is unauthenticated', () => {
      mockedKeycloak.authenticated = false;

      // Notify dependency tracking chains using mock event ticks
      keycloakEventSignalMock.set({ type: KeycloakEventType.AuthLogout });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should reactively track engine updates and transition to true', () => {
      mockedKeycloak.authenticated = true;

      // Update dependency anchor token state
      keycloakEventSignalMock.set({ type: KeycloakEventType.Ready });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('User Metadata & Profiles', () => {
    it('should extract correct string fields or fall back gracefully', () => {
      // 1. preferred_username is fully present
      mockedKeycloak.idTokenParsed = { preferred_username: 'preferred_jim' };
      expect(service.userProfile).toBe('preferred_jim');

      // 2. preferred_username is omitted, falls back to given_name
      mockedKeycloak.idTokenParsed = { given_name: 'given_jim' };
      expect(service.userProfile).toBe('given_jim');

      // 3. Identity parameters empty, yields fallback string node
      mockedKeycloak.idTokenParsed = {};
      expect(service.userProfile).toBe('');

      // 4. Token reference undefined, protects against fatal reference crashes
      mockedKeycloak.idTokenParsed = undefined;
      expect(service.userProfile).toBe('');
    });

    it('should pull out standard user account identifier hash strings', () => {
      mockedKeycloak.idTokenParsed = { sub: 'auth-user-hash-id-999' };
      expect(service.userId).toBe('auth-user-hash-id-999');

      mockedKeycloak.idTokenParsed = undefined;
      expect(service.userId).toBe('');
    });
  });

  describe('Redirect Redirection Actions', () => {
    it('should forward to engine login methods using accurate runtime location parameters', () => {
      const loginSpy = vi.spyOn(mockedKeycloak, 'login').mockResolvedValue(undefined as any);

      service.login();

      expect(loginSpy).toHaveBeenCalledWith({
        redirectUri: window.location.href
      });
    });

    it('should trigger logouts routed directly through matching client configurations', () => {
      const logoutSpy = vi.spyOn(mockedKeycloak, 'logout').mockResolvedValue(undefined as any);

      service.logout();

      expect(logoutSpy).toHaveBeenCalledWith({
        redirectUri: `${window.location.origin}/`
      });
    });

    it('should construct correct account manager route paths', () => {
      const accountSpy = vi.spyOn(mockedKeycloak, 'createAccountUrl').mockReturnValue('http://keycloak/account');

      expect(service.getAccountUrl()).toBe('http://keycloak/account');
      expect(accountSpy).toHaveBeenCalled();
    });

    it('should recover safely with standard fallbacks if account url generation yields empty data', () => {
      vi.spyOn(mockedKeycloak, 'createAccountUrl').mockReturnValue(undefined as any);
      expect(service.getAccountUrl()).toBe('');
    });
  });
});
