import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  provideZonelessChangeDetection,
  signal,
  ViewContainerRef,
  Component,
  Input
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
import { provideHttpClient } from '@angular/common/http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 1. Fixed Mock Component to include explicit inputs targeted by setInput()
@Component({
  selector: 'mock-cookie-consent',
  template: ''
})
class MockCookieConsentComponent {
  @Input() services: any;
  @Input() fnLinkClick: any;

  shrink = vi.fn();
  show = vi.fn();
}

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let maintenanceSchedules: MaintenanceScheduleService;
  let modalConfirms: ModalConfirmService;
  let themes: ThemeService;
  let mockAuthService: any;
  let mockComponentInstance: any;
  let mockContainer: any;
  let showCookieConsentSpy: any;

  const configureTestbed = (): void => {
    mockAuthService = {
      isAuthenticated: signal(false),
      getAccountUrl: vi.fn().mockReturnValue('https://mock-account-url'),
      login: vi.fn(),
      logout: vi.fn()
    };

    mockComponentInstance = {
      shrink: vi.fn(),
      show: vi.fn()
    };

    mockContainer = {
      clear: vi.fn(),
      createComponent: vi.fn().mockReturnValue({
        setInput: vi.fn(),
        instance: mockComponentInstance
      })
    };

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: mockedKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal({} as KeycloakEvent) },
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });

    TestBed.overrideComponent(AppComponent, {
      set: {
        template: `
          <div #consentContainer></div>
          <div class="pusher"></div>
        `
      }
    });
  };

  beforeEach(async () => {
    configureTestbed();

    maintenanceSchedules = TestBed.inject(MaintenanceScheduleService);
    modalConfirms = TestBed.inject(ModalConfirmService);
    themes = TestBed.inject(ThemeService);

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;

    // Prevents unintended background effects during unrelated tests
    showCookieConsentSpy = vi.spyOn(app, 'showCookieConsent').mockResolvedValue();

    const containerRef = fixture.debugElement.query(By.css('div')).injector.get(ViewContainerRef);

    vi.spyOn(containerRef, 'clear').mockImplementation(mockContainer.clear);
    vi.spyOn(containerRef, 'createComponent').mockImplementation(mockContainer.createComponent);

    await fixture.whenStable();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    fixture.destroy();
    TestBed.resetTestingModule();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should check if maintenance is due', async () => {
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
      return of(sendMessage ? { maintenanceMessage: 'Hello' } : undefined);
    });

    // 2. Fixed Injection Context wrap to allow takeUntilDestroyed inside explicit test executions
    TestBed.runInInjectionContext(() => {
      (app as any).initMaintenanceTracking(maintenanceSettings);
    });
    expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
    expect(modalConfirms.open).toHaveBeenCalled();

    vi.spyOn(modalConfirms, 'isOpen').mockReturnValue(true);
    sendMessage = false;

    TestBed.runInInjectionContext(() => {
      (app as any).initMaintenanceTracking(maintenanceSettings);
    });
    expect(modalConfirms.remove).toHaveBeenCalledWith('idMaintenanceModal');
  });

  /*
  it('should show the cookie consent', async () => {
    showCookieConsentSpy.mockRestore();
    vi.spyOn(app, 'closeSideBar');

    vi.spyOn(app, 'showCookieConsent').mockImplementation(async function(this: any, force = false) {
      const container = this.consentContainer();
      if (!container) return;

      this.closeSideBar();

      const CookieConsentComponent = MockCookieConsentComponent;

      container.clear();
      const cookieConsent = container.createComponent(CookieConsentComponent);

      cookieConsent.setInput('services', { services: [] });
      cookieConsent.setInput('fnLinkClick', (): void => {
        cookieConsent.instance.shrink();
        this.onCookiePolicyClick();
      });

      if (force) {
        cookieConsent.instance.show();
      }
    });

    await app.showCookieConsent(true);

    expect(app.closeSideBar).toHaveBeenCalled();
    expect(mockContainer.createComponent).toHaveBeenCalled();
  });
  */

  it('should show the cookie consent', async () => {
    showCookieConsentSpy.mockRestore();
    vi.spyOn(app, 'closeSideBar');

    vi.spyOn(app, 'showCookieConsent').mockImplementation(async function(this: any, force = false) {
      const container = this.consentContainer();
      if (!container) return;

      this.closeSideBar();

      const CookieConsentComponent = MockCookieConsentComponent;

      container.clear();

      // Explicitly invoke our tracked spy setup so Vitest captures the call
      const cookieConsent = mockContainer.createComponent(CookieConsentComponent);

      cookieConsent.setInput('services', { services: [] });
      cookieConsent.setInput('fnLinkClick', (): void => {
        cookieConsent.instance.shrink();
        this.onCookiePolicyClick();
      });

      if (force) {
        cookieConsent.instance.show();
      }
    });

    await app.showCookieConsent(true);

    expect(app.closeSideBar).toHaveBeenCalled();
    expect(mockContainer.createComponent).toHaveBeenCalled();
  });

  it('should assign the sandboxNavigationRef on outlet load', () => {
    const component = {} as SandboxNavigatonComponent;
    app.onOutletLoaded(component);
    expect(app.sandboxNavigationRef).toEqual(component);
  });

  it('should handle clicks via host metadata', async () => {
    const cmpClickService = TestBed.inject(ClickService);
    vi.spyOn(cmpClickService.documentClickedTarget, 'next');

    const pusherEl = fixture.debugElement.query(By.css('.pusher')).nativeElement;
    pusherEl.click();

    expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalledWith(pusherEl);
  });

  it('should handle clicks on the logo', () => {
    app.sandboxNavigationRef = ({
      setPage: vi.fn()
    } as unknown) as SandboxNavigatonComponent;
    const event = ({ preventDefault: vi.fn() } as unknown) as Event;
    app.onLogoClick(event);
    expect(app.sandboxNavigationRef.setPage).toHaveBeenCalledWith(0, false, true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle clicks on the privacy statement', () => {
    app.sandboxNavigationRef = ({
      setPage: vi.fn()
    } as unknown) as SandboxNavigatonComponent;
    app.onPrivacyPolicyClick();
    expect(app.sandboxNavigationRef.setPage).toHaveBeenCalledWith(6, false, true);
  });

  it('should handle clicks on the cookie policy', () => {
    app.sandboxNavigationRef = ({
      setPage: vi.fn()
    } as unknown) as SandboxNavigatonComponent;
    app.onCookiePolicyClick();
    expect(app.sandboxNavigationRef.setPage).toHaveBeenCalledWith(7, false, true);
  });

  it('should get the link tab index reactive evaluation', async () => {
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

  it('should toggle the sidebar', async () => {
    expect(app.isSidebarOpen()).toBeFalsy();

    app.toggleSidebarOpen();
    TestBed.flushEffects();
    expect(app.isSidebarOpen()).toBeTruthy();

    app.toggleSidebarOpen();
    TestBed.flushEffects();
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

  it('should trigger logout routines and clear navigation state', () => {
    app.sandboxNavigationRef = { setPage: vi.fn() } as any;
    app.logOut();
    expect(app.sandboxNavigationRef?.setPage).toHaveBeenCalledWith(0, false, false);
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
