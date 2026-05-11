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
import { SandboxNavigatonComponent } from './sandbox-navigation';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let maintenanceSchedules: MaintenanceScheduleService;
  let modalConfirms: ModalConfirmService;
  let themes: ThemeService;

  const b4Each = (): void => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    // 1. Assign the property directly
    (app as any).modalMaintenanceId = 'idMaintenanceModal';

    // 2. Mock ViewChild Signals (This prevents the NG0950 and inputSignalNode errors)
    const mockContainer = {
      clear: vi.fn(),
      createComponent: vi.fn().mockReturnValue({ setInput: vi.fn(), instance: {} })
    };

    const mockModal = {
      close: vi.fn(),
      id: signal('idMaintenanceModal') // satisfy internal signal checks
    };

    // Replace the read-only signal properties with our mock functions
    Object.defineProperty(app, 'consentContainer', { value: () => mockContainer });
    Object.defineProperty(app, 'modalConfirm', {
      value: () => mockModal,
      configurable: true
    });

    // 3. Trigger lifecycle
    fixture.detectChanges();
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal({} as KeycloakEvent) }
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

      // 1. Mock Services
      vi.spyOn(modalConfirms, 'open').mockReturnValue(of(false));
      vi.spyOn(maintenanceSchedules, 'loadMaintenanceItem').mockImplementation(() => {
        return of(sendMessage ? { maintenanceMessage: 'Hello' } : {});
      });

      // 2. Mock the viewChild Signal properly
      // Since signals are read-only functions, we use defineProperty
      const mockModal = { close: vi.fn() };
      Object.defineProperty(app, 'modalConfirm', {
        value: () => mockModal,
        configurable: true
      });

      // --- Run Open Logic ---
      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
      expect(modalConfirms.open).toHaveBeenCalled();

      // --- Run Close Logic ---
      vi.spyOn(modalConfirms, 'isOpen').mockReturnValue(true);
      sendMessage = false;

      app.checkIfMaintenanceDue(maintenanceSettings);

      // 3. Assertion: Call the signal mock function, then check the method
      expect(mockModal.close).toHaveBeenCalled();
    });

    it('should show the cookie consent', async () => {
      vi.useFakeTimers();

      // 1. Await the actual function call since it's an async Promise
      const consentPromise = app.showCookieConsent();

      // 2. Flush the microtask queue so the dynamic import resolves
      await vi.advanceTimersByTimeAsync(0);
      await consentPromise;

      // 3. Now verify
      vi.spyOn(app, 'closeSideBar');
      // If you call it again to test the spy:
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
  });
});
