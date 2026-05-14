import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { UserDataService, KeycloakAuthService } from '../_services';
import { MockUserDataService } from '../_mocked';
import { mockedKeycloak, MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';

describe('HomeComponent (Angular 20 Zoneless)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHttp: MockHttp;
  let authService: KeycloakAuthService;

  const keycloakEventSignal = signal({ type: KeycloakEventType.AuthLogout });

  const configureTestbed = async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        KeycloakAuthService,
        { provide: UserDataService, useClass: MockUserDataService },
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: keycloakEventSignal }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(KeycloakAuthService);
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

      // Corrected: Overwrite the readonly computed signal field using property descriptor definition
      Object.defineProperty(authService, 'isAuthenticated', {
        value: () => false,
        writable: true,
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

      // Corrected: Overwrite the readonly computed signal field using property descriptor definition
      Object.defineProperty(authService, 'isAuthenticated', {
        value: () => true,
        writable: true,
        configurable: true
      });

      keycloakEventSignal.set({ type: KeycloakEventType.Ready });

      fixture.detectChanges();
      await fixture.whenStable();

      expect(initSpy).toHaveBeenCalled();
    });

    it('should load and capitalize user profile name', async () => {
      vi.spyOn(authService, 'userProfile', 'get').mockReturnValue('jim');
      Object.defineProperty(authService, 'isAuthenticated', {
        value: () => true,
        writable: true,
        configurable: true
      });

      vi.spyOn(component.userDataService, 'getUserDatasetsPolledObservable').mockReturnValue(
        of([])
      );

      component.initUserData();

      vi.runAllTimers();

      // 5. Flush the reactive layout microtask cycles
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.userName()).toBe('Jim');
    });
  });
});
