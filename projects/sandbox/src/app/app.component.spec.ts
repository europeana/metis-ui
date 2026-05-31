import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { KeycloakAuthService, ThemeService } from './_services';
import { ModalConfirmService, ClickService } from 'shared';
import { MaintenanceScheduleService } from '@europeana/metis-ui-maintenance-utils';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let mockAuthService: any;
  let mockThemeService: any;
  let mockModalConfirms: any;
  let mockMaintenanceSchedules: any;
  let mockClickService: any;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(of(true)),
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
      loadMaintenanceItem: vi
        .fn()
        .mockReturnValue(of({ maintenanceMessage: 'System update scheduled' }))
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
      // 🚀 THE BREAKTHROUGH OVERRIDE: Set template directly to an empty string '' !
      // This instructs the compiler to drop the real HTML file processing entirely,
      // completely eliminating element/selector mismatches.
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
  });
});
