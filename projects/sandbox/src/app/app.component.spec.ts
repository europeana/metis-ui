import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ViewContainerRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import {
  MaintenanceScheduleItemKey,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';
import {
  ClickService,
  mockedKeycloak,
  MockModalConfirmService,
  ModalConfirmComponent,
  ModalConfirmService
} from 'shared';
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
    app.consentContainer = ({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      clear: (): void => {},
      createComponent: () => {
        return {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setInput: (): void => {}
        };
      }
    } as unknown) as ViewContainerRef;
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule, AppComponent],
      providers: [
        {
          provide: ModalConfirmService,
          useClass: MockModalConfirmService
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ({} as unknown) as KeycloakEvent;
          }
        }
      ]
    }).compileComponents();
    maintenanceSchedules = TestBed.inject(MaintenanceScheduleService);
    modalConfirms = TestBed.inject(ModalConfirmService);
    themes = TestBed.inject(ThemeService);
  };

  describe('Normal Behaviour', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
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
      vi.spyOn(modalConfirms, 'open').mockImplementation(() => {
        return of(false);
      });
      vi.spyOn(maintenanceSchedules, 'loadMaintenanceItem').mockImplementation(() => {
        return of(
          sendMessage
            ? {
                maintenanceMessage: 'Hello'
              }
            : {}
        );
      });

      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(maintenanceSchedules.loadMaintenanceItem).toHaveBeenCalled();
      expect(modalConfirms.open).toHaveBeenCalled();

      // close the (opened) confirm

      vi.spyOn(modalConfirms, 'isOpen').mockImplementation(() => true);
      sendMessage = false;
      app.modalConfirm = ({
        close: vi.fn()
      } as unknown) as ModalConfirmComponent;

      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(app.modalConfirm.close).toHaveBeenCalled();
    });

    it('should show the cookie consent', fakeAsync(() => {
      fixture.detectChanges();
      vi.spyOn(app, 'closeSideBar');
      app.showCookieConsent();
      expect(app.closeSideBar).toHaveBeenCalled();
    }));

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
      expect(app.getLinkTabIndex()).toEqual(-1);
      app.isSidebarOpen = true;
      expect(app.getLinkTabIndex()).toEqual(0);
      app.isSidebarOpen = false;
      expect(app.getLinkTabIndex()).toEqual(-1);
    });

    it('should close the sidebar', () => {
      app.isSidebarOpen = true;
      app.closeSideBar();
      expect(app.isSidebarOpen).toBeFalsy();
    });

    it('should toggle the sidebar', () => {
      expect(app.isSidebarOpen).toBeFalsy();
      app.toggleSidebarOpen();
      expect(app.isSidebarOpen).toBeTruthy();
      app.toggleSidebarOpen();
      expect(app.isSidebarOpen).toBeFalsy();
    });

    it('should switch the theme', () => {
      vi.spyOn(themes, 'switchTheme');
      app.switchTheme();
      expect(themes.switchTheme).toHaveBeenCalled();
    });
  });
});
