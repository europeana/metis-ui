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
  });

  describe('Authentication States', () => {
    it('should not init userData when logged out', async () => {
      const initSpy = vi.spyOn(component, 'initUserData');

      // Set signal state before detection
      keycloakEventSignal.set({ type: KeycloakEventType.AuthLogout });

      fixture.detectChanges();
      await Promise.resolve(); // Flush microtasks

      expect(initSpy).not.toHaveBeenCalled();
    });

    it('should init userData when logged in', async () => {
      const initSpy = vi.spyOn(component, 'initUserData');

      // Transition to Ready state
      keycloakEventSignal.set({ type: KeycloakEventType.Ready });

      fixture.detectChanges();
      await Promise.resolve();

      expect(initSpy).toHaveBeenCalled();
    });

    it('should load and capitalize user profile name', async () => {
      const mockProfile = { username: 'jim' };
      vi.spyOn(mockedKeycloak, 'loadUserProfile').mockResolvedValue(mockProfile);

      // Trigger logic
      component.initUserData();

      // Await Vitest timers + Promise resolution
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();

      fixture.detectChanges(); // Update view with Signal change

      expect(mockedKeycloak.loadUserProfile).toHaveBeenCalled();
      expect(component.userName).toBe('Jim');
    });
  });
});
