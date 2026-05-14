import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { HomeComponent } from './home.component';
import { UserDataService } from '../_services';
import { MockUserDataService } from '../_mocked';
import { mockedKeycloak, MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';

describe('HomeComponent (Angular 20 Zoneless)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHttp: MockHttp;

  // Use a real Signal for the mock to trigger Angular 20 reactivity
  const keycloakEventSignal = signal({ type: KeycloakEventType.AuthLogout });

  const configureTestbed = async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(), // Stable in Angular 20
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserDataService, useClass: MockUserDataService },
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakEventSignal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHost);
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    await configureTestbed();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockHttp.verify();
    vi.restoreAllMocks();
  });

  describe('Authentication States', () => {
    it('should not init userData when logged out', async () => {
      const initSpy = vi.spyOn(component, 'initUserData');

      // Setup state: Keycloak ready but explicitly unauthenticated
      Object.defineProperty(mockedKeycloak, 'authenticated', {
        get: () => false,
        configurable: true
      });

      keycloakEventSignal.set({ type: KeycloakEventType.Ready });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(initSpy).not.toHaveBeenCalled();
      expect(component.hasRecent()).toBe(false);
      expect(component.userName()).toBe('');
    });

    it('should init userData when logged in', async () => {
      const initSpy = vi.spyOn(component, 'initUserData').mockImplementation(() => {});

      // Setup state: Keycloak ready AND authenticated to bypass component guard
      Object.defineProperty(mockedKeycloak, 'authenticated', {
        get: () => true,
        configurable: true
      });

      keycloakEventSignal.set({ type: KeycloakEventType.Ready });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(initSpy).toHaveBeenCalled();
    });

    it('should load and capitalize user profile name', async () => {
      const mockProfile = { username: 'jim' };
      vi.spyOn(mockedKeycloak, 'loadUserProfile').mockResolvedValue(mockProfile);

      // Trigger logic directly
      component.initUserData();

      // Flush microtasks and native async operations
      await vi.advanceTimersByTimeAsync(1);
      await fixture.whenStable();
      fixture.detectChanges();

      // Fixes [Function getter] error by invoking the signal with parentheses ()
      expect(mockedKeycloak.loadUserProfile).toHaveBeenCalled();
      expect(component.userName()).toBe('Jim');
    });
  });
});
