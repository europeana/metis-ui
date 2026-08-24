import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal, ViewContainerRef } from '@angular/core';
import { of, Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { KeycloakAuthService, ThemeService } from './_services';
import { ClickService, ModalConfirmService } from 'shared';
import { MaintenanceScheduleService } from '@europeana/metis-ui-maintenance-utils';

// 🚀 MOCK ENVIRONMENT CONFIGURATIONS AND LAZY MODULES
vi.mock('../environments/apisettings', () => ({
  apiSettings: { documentationUrl: 'doc', feedbackUrl: 'feed', userGuideUrl: 'guide' }
}));
vi.mock('../environments/maintenance-settings', () => ({ maintenanceSettings: {} }));
vi.mock('../environments/eu-cm-settings', () => ({ cookieConsentConfig: { services: [] } }));

const mockCookieConsentInstance = {
  shrink: vi.fn(),
  show: vi.fn()
};

vi.mock('@europeana/metis-ui-consent-management', () => ({
  CookieConsentComponent: class MockCookieConsent {
    setInput = vi.fn();
    instance = mockCookieConsentInstance;
  }
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let mockAuthService: any;
  let mockThemeService: any;
  let mockModalConfirms: any;
  let mockMaintenanceSchedules: any;
  let mockClickService: any;
  let maintenanceSubject: Subject<any>;

  beforeEach(async () => {
    maintenanceSubject = new Subject<any>();

    mockAuthService = {
      isAuthenticated: signal(true),
      login: vi.fn(),
      logout: vi.fn(),
      getAccountUrl: vi.fn().mockReturnValue('https://example.com')
    };

    mockThemeService = {
      switchTheme: vi.fn()
    };

    mockModalConfirms = {
      open: vi.fn().mockReturnValue(of(true)),
      remove: vi.fn(),
      isOpen: vi.fn().mockReturnValue(false)
    };

    mockMaintenanceSchedules = {
      setApiSettings: vi.fn(),
      loadMaintenanceItem: vi.fn().mockReturnValue(maintenanceSubject.asObservable())
    };

    mockClickService = {
      documentClickedTarget: new Subject<HTMLElement>()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: KeycloakAuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ModalConfirmService, useValue: mockModalConfirms },
        { provide: MaintenanceScheduleService, useValue: mockMaintenanceSchedules },
        { provide: ClickService, useValue: mockClickService }
      ]
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [],
          template: '',
          styleUrls: []
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    vi.clearAllMocks();
  });

  it('should instantiate cleanly in a zoneless environment', () => {
    expect(component).toBeTruthy();
  });

  describe('Authentication Actions', () => {
    it('should invoke identity server workflows on goToLogin', () => {
      component.goToLogin();
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should forward parameters and trigger systemic logout scripts', () => {
      const mockNav = { setPage: vi.fn() };
      component.sandboxNavigationRef = mockNav as any;

      component.logOut();

      expect(mockNav.setPage).toHaveBeenCalledWith(0, false, false);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should fetch the secure account dashboard link parameters', () => {
      expect(component.keycloakAccountUrl()).toBe('https://example.com');
    });
  });

  describe('UI State Toggles and Theme Options', () => {
    it('should toggle sidebar layout states reactively', () => {
      expect(component.isSidebarOpen()).toBe(false);
      component.toggleSidebarOpen();
      expect(component.isSidebarOpen()).toBe(true);
      component.closeSideBar();
      expect(component.isSidebarOpen()).toBe(false);
    });

    it('should dispatch switch hooks into the global ThemeService panel container', () => {
      component.switchTheme();
      expect(mockThemeService.switchTheme).toHaveBeenCalled();
    });

    it('should compute valid keyboard navigation indices when the sidebar layout shifts', () => {
      component.isSidebarOpen.set(false);
      expect(component.linkTabIndex()).toBe(-1);

      component.isSidebarOpen.set(true);
      expect(component.linkTabIndex()).toBe(0);
    });
  });

  describe('Global Event Handlers and Navigation Dispatches', () => {
    let mockNav: any;

    beforeEach(() => {
      mockNav = { setPage: vi.fn() };
      component.sandboxNavigationRef = mockNav as any;
    });

    it('should pass layout targets downstream when catching document click hooks', () => {
      const spy = vi.spyOn(mockClickService.documentClickedTarget, 'next');
      const mockEvent = { target: document.createElement('div') } as any;
      component.documentClick(mockEvent);

      expect(spy).toHaveBeenCalledWith(mockEvent.target);
    });

    it('should delegate child node activation on onOutletLoaded sequences', () => {
      const mockComponentRef = { mockInstance: true };
      component.onOutletLoaded(mockComponentRef as any);

      expect(component.sandboxNavigationRef).toBe(mockComponentRef);
    });

    it('should intercept structural layout events on custom logo interactions', () => {
      const preventSpy = vi.fn();
      const mockEvent = { preventDefault: preventSpy } as any;

      component.onLogoClick(mockEvent);

      expect(preventSpy).toHaveBeenCalled();
      expect(mockNav.setPage).toHaveBeenCalledWith(0, false, true);
    });

    it('should push view coordinates seamlessly on custom profile policy triggers', () => {
      component.onPrivacyPolicyClick();
      expect(mockNav.setPage).toHaveBeenCalledWith(6, false, true);
    });

    it('should push view coordinates seamlessly on cookie policy text links', () => {
      component.onCookiePolicyClick();
      expect(mockNav.setPage).toHaveBeenCalledWith(7, false, true);
    });
  });

  // 🎯 NEW: High-density coverage blocks targeting maintenance streams & dynamic imports
  describe('Maintenance Automation Paths', () => {
    it('should display maintenance dialog structures when intercepting warnings', async () => {
      const mockItem = { maintenanceMessage: 'Emergency Service Maintenance Operational' };
      maintenanceSubject.next(mockItem);
      await TestBed.flushEffects();

      expect(component.maintenanceInfo()).toBe(mockItem);
      expect(mockModalConfirms.open).toHaveBeenCalledWith(component.modalMaintenanceId);
    });

    it('should clear old modal active tokens out when structural alerts resolve to null', async () => {
      mockModalConfirms.isOpen.mockReturnValue(true);

      maintenanceSubject.next(null);
      await TestBed.flushEffects();

      expect(component.maintenanceInfo()).toBeNull();
      expect(mockModalConfirms.remove).toHaveBeenCalledWith(component.modalMaintenanceId);
    });
  });

  describe('Asynchronous Cookie Operations', () => {
    let mockViewContainer: any;

    beforeEach(() => {
      mockViewContainer = {
        clear: vi.fn(),
        createComponent: vi.fn().mockImplementation(() => {
          // 🚀 STRUCTURAL HARNESS OVERRIDE: Return a perfectly matched object contract
          // containing explicitly tracked setInput spies and custom inline method mocks
          const setInputSpy = vi.fn();
          return {
            setInput: setInputSpy,
            instance: {
              shrink: mockCookieConsentInstance.shrink,
              show: mockCookieConsentInstance.show
            },
            _setInputSpy: setInputSpy // Expose spy pointer to test blocks
          };
        })
      };
    });

    it('should immediately terminate cookie consent executions if structural view boundaries are missing', async () => {
      vi.spyOn(component, 'consentContainer').mockReturnValue(undefined);
      await component.showCookieConsent();
      expect(mockViewContainer.clear).not.toHaveBeenCalled();
    });

    it('should clear containers, dynamically bind inputs, and track sub-callbacks over network chunks', async () => {
      vi.spyOn(component, 'consentContainer').mockReturnValue(
        (mockViewContainer as unknown) as ViewContainerRef
      );

      await component.showCookieConsent(true);

      expect(mockViewContainer.clear).toHaveBeenCalled();
      expect(mockViewContainer.createComponent).toHaveBeenCalled();
      expect(mockCookieConsentInstance.show).toHaveBeenCalled();
    });

    it('should capture callback actions on nested sub-module text adjustments', async () => {
      vi.spyOn(component, 'consentContainer').mockReturnValue(
        (mockViewContainer as unknown) as ViewContainerRef
      );
      const policySpy = vi.spyOn(component, 'onCookiePolicyClick');

      let capturedCallback: (() => void) | undefined;
      mockViewContainer.createComponent.mockImplementation(() => {
        const setInputSpy = vi.fn().mockImplementation((key: string, value: any) => {
          if (key === 'fnLinkClick') capturedCallback = value;
        });
        return {
          setInput: setInputSpy,
          instance: {
            shrink: mockCookieConsentInstance.shrink,
            show: mockCookieConsentInstance.show
          }
        };
      });

      await component.showCookieConsent(false);

      expect(capturedCallback).toBeDefined();
      capturedCallback!();

      expect(mockCookieConsentInstance.shrink).toHaveBeenCalled();
      expect(policySpy).toHaveBeenCalled();
    });

    it('should evaluate and step clean across the internal constructor effect macro-task bypass', async () => {
      const mockContainerRef = {
        clear: vi.fn(),
        createComponent: vi.fn().mockImplementation(() => ({
          setInput: vi.fn(),
          instance: {
            shrink: mockCookieConsentInstance.shrink,
            show: mockCookieConsentInstance.show
          }
        }))
      };

      const consentSpy = vi.spyOn(component, 'showCookieConsent').mockResolvedValue();
      vi.spyOn(component, 'consentContainer').mockReturnValue(
        (mockContainerRef as unknown) as ViewContainerRef
      );

      // Re-trigger the active effect tracking boundary
      TestBed.flushEffects();

      // Flushes the JavaScript macro-task queue safely without Zone.js dependencies
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consentSpy).toHaveBeenCalled();
    });
  });
});
