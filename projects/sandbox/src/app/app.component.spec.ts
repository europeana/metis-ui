import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  provideZonelessChangeDetection,
  signal,
  ViewContainerRef
} from '@angular/core';
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent> | undefined;
  let maintenanceSchedules: MaintenanceScheduleService;
  let modalConfirms: ModalConfirmService;
  let themes: ThemeService;
  let mockAuthService: any;
  let mockContainer: any;

  const b4Each = (): void => {
    mockContainer = {
      clear: vi.fn(),
      createComponent: vi.fn().mockReturnValue({ setInput: vi.fn(), instance: { shrink: vi.fn() } })
    };

    const mockModal = {
      close: vi.fn(),
      id: signal('idMaintenanceModal')
    };

    // Create standard Angular signal wrappers
    const containerSignal = signal((mockContainer as unknown) as ViewContainerRef);
    const modalSignal = signal(mockModal as any);

    // 1. Create the component instance normally without breaking its prototype chain
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    (app as any).modalMaintenanceId = 'idMaintenanceModal';

    // 2. Overwrite the properties directly on the class instance.
    // This provides our mocks without breaking the component's underlying signal descriptors.
    Object.defineProperty(app, 'consentContainer', {
      value: containerSignal,
      writable: true,
      configurable: true
    });
    Object.defineProperty(app, 'modalConfirm', {
      value: modalSignal,
      writable: true,
      configurable: true
    });

    // 3. Flush the effect engine so the constructor initialization runs with the mocks ready
    TestBed.flushEffects();
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
      fixture = undefined;
      TestBed.resetTestingModule();
      configureTestbed();
      maintenanceSchedules = TestBed.inject(MaintenanceScheduleService);
      modalConfirms = TestBed.inject(ModalConfirmService);
      themes = TestBed.inject(ThemeService);
      b4Each();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      if (fixture) {
        fixture.destroy();
      }
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
      vi.spyOn(modalConfirms, 'remove').mockImplementation(() => {});
      vi.spyOn(maintenanceSchedules, 'loadMaintenanceItem').mockImplementation(() => {
        return of(sendMessage ? { maintenanceMessage: 'Hello' } : {});
      });

      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
      expect(modalConfirms.open).toHaveBeenCalled();

      vi.spyOn(modalConfirms, 'isOpen').mockReturnValue(true);
      sendMessage = false;

      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(modalConfirms.remove).toHaveBeenCalledWith('idMaintenanceModal');
    });

    it('should show the cookie consent', async () => {
      vi.useFakeTimers();

      vi.spyOn(app, 'closeSideBar');

      const consentPromise = app.showCookieConsent();
      await vi.advanceTimersByTimeAsync(0);
      await consentPromise;

      expect(app.closeSideBar).toHaveBeenCalled();
      expect(mockContainer.createComponent).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should assign the sandboxNavigationRef on outlet load', () => {
      const component = ({} as unknown) as SandboxNavigatonComponent;
      app.onOutletLoaded(component);
      expect(app.sandboxNavigationRef).toEqual(component);
    });

    it('should handle clicks', () => {
      const cmpClickService = fixture!.debugElement.injector.get<ClickService>(ClickService);
      vi.spyOn(cmpClickService.documentClickedTarget, 'next');
      fixture!.debugElement.query(By.css('.pusher')).nativeElement.click();
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
      TestBed.flushEffects();
      expect(app.linkTabIndex()).toEqual(0);

      app.isSidebarOpen.set(false);
      TestBed.flushEffects();
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
      fixture!.detectChanges();
      expect(app.isSidebarOpen()).toBeTruthy();
      app.toggleSidebarOpen();
      fixture!.detectChanges();
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
