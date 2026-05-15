import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { KeycloakAuthService } from './keycloak-auth.service';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { MockProvider } from 'ng-mocks';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

import {
  MockDatasetHierarchyService,
  MockDebiasService,
  MockUploadService,
  MockUserDataService
} from '../_mocked';
import {
  DatasetHierarchyService,
  DebiasService,
  UploadService,
  UserDataService
} from '../_services';

describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService;
  let mockKeycloakEngine: any;
  let mockKeycloakSignal: WritableSignal<KeycloakEvent | null>;

  beforeEach(() => {
    mockKeycloakSignal = signal<KeycloakEvent | null>(null);

    mockKeycloakEngine = {
      authenticated: false,
      idTokenParsed: undefined,
      login: vi.fn(),
      logout: vi.fn(),
      createAccountUrl: vi.fn().mockReturnValue('https://mock-account-url')
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        KeycloakAuthService,
        { provide: Keycloak, useValue: mockKeycloakEngine },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: mockKeycloakSignal },

        // 🛠️ FIXED: Added 'new' keyword to all instances to resolve TS2769 overloads
        MockProvider(DatasetHierarchyService, new MockDatasetHierarchyService()),
        MockProvider(DebiasService, new MockDebiasService()),
        MockProvider(UploadService, new MockUploadService()),
        MockProvider(UserDataService, new MockUserDataService())
      ]
    });

    service = TestBed.inject(KeycloakAuthService);
    TestBed.tick();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should accurately return authentication state when signal triggers', () => {
    expect(service.isAuthenticated()).toBe(false);

    mockKeycloakEngine.authenticated = true;
    mockKeycloakSignal.set({ type: KeycloakEventType.AuthSuccess, args: null });

    TestBed.tick();
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should parse userId safely from idTokenParsed', () => {
    mockKeycloakEngine.idTokenParsed = { sub: 'user-123' };
    mockKeycloakSignal.set({ type: KeycloakEventType.AuthSuccess, args: null });

    TestBed.tick();
    expect(service.userId()).toBe('user-123');
  });

  it('should fallback to preferred_username for userProfile', () => {
    mockKeycloakEngine.idTokenParsed = { preferred_username: 'tester_john' };
    mockKeycloakSignal.set({ type: KeycloakEventType.AuthSuccess, args: null });

    TestBed.tick();
    expect(service.userProfile()).toBe('tester_john');
  });

  it('should trigger login with current location window context', () => {
    const loginSpy = vi.spyOn(mockKeycloakEngine, 'login');
    service.login();
    expect(loginSpy).toHaveBeenCalledWith({ redirectUri: expect.any(String) });
  });
});
