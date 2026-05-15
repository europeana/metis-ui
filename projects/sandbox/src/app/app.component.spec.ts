import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import {
  MaintenanceScheduleItemKey,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';
import { ClickService, mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import { ThemeService } from './_services';
import { KeycloakAuthService } from './_services/keycloak-auth.service';
import { SandboxNavigatonComponent } from './sandbox-navigation';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let maintenanceSchedules: MaintenanceScheduleService;
  let modalConfirms: ModalConfirmService;
  let themes: ThemeService;
  let mockAuthService: any;

  const b4Each = (): void => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    (app as any).modalMaintenanceId = 'idMaintenanceModal';

    const mockContainer = {
      clear: vi.fn(),
      createComponent: vi.fn().mockReturnValue({ setInput: vi.fn(), instance: {} })
    };

    const mockModal = {
      close: vi.fn(),
      id: signal('idMaintenanceModal')
    };

    Object.defineProperty(app, 'consentContainer', { value: () => mockContainer });
    Object.defineProperty(app, 'modalConfirm', {
      value: () => mockModal,
      configurable: true
    });

    fixture.detectChanges();
  };

  const configureTestbed = (): void => {
    mockAuthService = {
      isAuthenticated: signal(false),
      getAccountUrl: vi.fn().mockReturnValue('https://mock-account-url'),
      login: vi.fn(),
      logout: vi.fn()
    };

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal({} as KeycloakEvent) },
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });
  };

  describe('Normal Behaviour', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      configureTestbed();
      maintenanceSchedules = TestBed.inject(MaintenanceScheduleService);
      modalConfirms = TestBed.inject(ModalConfirmService);
      themes = TestBed.inject(ThemeService);
      b4Each();
    });

    afterEach(() => {
      fixture.destroy();
      TestBed.resetTestingModule();
    });

    it('should create the app', () => {
      expect(app).toBeTruthy();
    });

    it('should check if maintenance is due', () => {
      let sendMessage = true;
      const maintenanceSettings = {
        pollInterval: 1,
        maintenanceScheduleUrl: 'http://maintenance',
        maintenanceScheduleKey: MaintenanceScheduleItemKey.SANDBOX_UI_TEST,
        maintenanceItem: {}
      };

      vi.spyOn(modalConfirms, 'open').mockReturnValue(of(false));
      vi.spyOn(modalConfirms, 'remove').mockImplementation(() => {}); // 🛠️ Mock the actual remove method called by component
      vi.spyOn(maintenanceSchedules, 'loadMaintenanceItem').mockImplementation(() => {
        return of(sendMessage ? { maintenanceMessage: 'Hello' } : {});
      });

      // --- Run Open Logic ---
      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
      expect(modalConfirms.open).toHaveBeenCalled();

      // --- Run Close Logic ---
      vi.spyOn(modalConfirms, 'isOpen').mockReturnValue(true);
      sendMessage = false;

      app.checkIfMaintenanceDue(maintenanceSettings);

      // 🛠️ FIX: Target modalConfirms.remove since the component code executes this natively
      expect(modalConfirms.remove).toHaveBeenCalledWith('idMaintenanceModal');
    });

    it('should show the cookie consent', async () => {
      vi.useFakeTimers();
      const consentPromise = app.showCookieConsent();

      await vi.advanceTimersByTimeAsync(0);
      await consentPromise;

      vi.spyOn(app, 'closeSideBar');
      await app.showCookieConsent();

      expect(app.closeSideBar).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should assign the sandboxNavigationRef on outlet load', () => {
      const component = ({} as unknown) as SandboxNavigatonComponent;
      app.onOutletLoaded(component);
      expect(app.sandboxNavigationRef).toEqual(component);
    });

    it('should handle clicks', () => {
      const cmpClickService = fixture.debugElement.injector.get<ClickService>(ClickService);
      vi.spyOn(cmpClickService.documentClickedTarget, 'next');
      fixture.debugElement.query(By.css('.pusher')).nativeElement.click();
      expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalled();
    });

    it('should handle clicks on the logo', () => {
      app.sandboxNavigationRef = ({
        setPage: vi.fn()
      } as unknown) as SandboxNavigatonComponent;
      const event = ({ preventDefault: vi.fn() } as unknown) as Event;
      app.onLogoClick(event);
      expect(app.sandboxNavigationRef.setPage).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle clicks on the privacy statement', () => {
      app.sandboxNavigationRef = ({
        setPage: vi.fn()
      } as unknown) as SandboxNavigatonComponent;
      app.onPrivacyPolicyClick();
      expect(app.sandboxNavigationRef.setPage).toHaveBeenCalled();
    });

    it('should handle clicks on the cookie policy', () => {
      app.sandboxNavigationRef = ({
        setPage: vi.fn()
      } as unknown) as SandboxNavigatonComponent;
      app.onCookiePolicyClick();
      expect(app.sandboxNavigationRef.setPage).toHaveBeenCalled();
    });

    it('should get the link tab index', () => {
      expect(app.linkTabIndex()).toEqual(-1);
      app.isSidebarOpen.set(true);
      expect(app.linkTabIndex()).toEqual(0);
      app.isSidebarOpen.set(false);
      expect(app.linkTabIndex()).toEqual(-1);
    });

    it('should close the sidebar', () => {
      app.isSidebarOpen.set(true);
      app.closeSideBar();
      expect(app.isSidebarOpen()).toBeFalsy();
    });

    it('should toggle the sidebar', () => {
      expect(app.isSidebarOpen()).toBeFalsy();
      app.toggleSidebarOpen();
      fixture.detectChanges();
      expect(app.isSidebarOpen()).toBeTruthy();
      app.toggleSidebarOpen();
      fixture.detectChanges();
      expect(app.isSidebarOpen()).toBeFalsy();
    });

    it('should switch the theme', () => {
      vi.spyOn(themes, 'switchTheme');
      app.switchTheme();
      expect(themes.switchTheme).toHaveBeenCalled();
    });

    it('should navigate to the login sequence through KeycloakAuthService', () => {
      app.goToLogin();
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should trigger logOut actions and accurately clear active navigation states', () => {
      app.sandboxNavigationRef = ({
        setPage: vi.fn()
      } as unknown) as SandboxNavigatonComponent;
      app.logOut();
      expect(app.sandboxNavigationRef.setPage).toHaveBeenCalledWith(0, false, false);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should cleanly pull the account configuration string from KeycloakAuthService', () => {
      expect(app.keycloakAccountUrl()).toEqual('https://mock-account-url');
    });
  });
});
