import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ViewContainerRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SandboxNavigatonComponent } from './sandbox-navigation';
import {
  MaintenanceScheduleService,
  MockMaintenanceScheduleService,
  MockMaintenanceScheduleServiceEmpty
} from '@europeana/metis-ui-maintenance-utils';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickService,
  MockModalConfirmService,
  ModalConfirmComponent,
  ModalConfirmService
} from 'shared';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const b4Each = (): void => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    app.consentContainer = ({
      clear: (): void => {},
      createComponent: () => {
        return {
          setInput: () => void {}
        };
      }
    } as unknown) as ViewContainerRef;
  };

  const configureTestbed = (empty = false): void => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ModalConfirmService,
          useClass: MockModalConfirmService
        },
        {
          provide: MaintenanceScheduleService,
          useClass: empty ? MockMaintenanceScheduleServiceEmpty : MockMaintenanceScheduleService
        }
      ]
    }).compileComponents();
  };

  describe('With Maintenance Message', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);
    it('should create the app', fakeAsync(() => {
      expect(app).toBeTruthy();
      tick(1);
    }));
  });

  describe('Normal Behaviour', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));
    beforeEach(b4Each);

    it('should create the app', fakeAsync(() => {
      app.modalConfirm = ({
        close: jasmine.createSpy()
      } as unknown) as ModalConfirmComponent;
      tick(1);
      expect(app).toBeTruthy();
    }));

    it('should show the cookie consent', fakeAsync(() => {
      fixture.detectChanges();
      spyOn(app, 'closeSideBar');
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
      spyOn(cmpClickService.documentClickedTarget, 'next');
      fixture.debugElement.query(By.css('.pusher')).nativeElement.click();
      expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalled();
    });

    it('should handle clicks on the logo', () => {
      app.sandboxNavigationRef = ({
        setPage: jasmine.createSpy()
      } as unknown) as SandboxNavigatonComponent;
      const event = ({ preventDefault: jasmine.createSpy() } as unknown) as Event;
      app.onLogoClick(event);
      expect(app.sandboxNavigationRef.setPage).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
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
      expect(app.themeIndex).toEqual(0);
      app.switchTheme();
      expect(app.themeIndex).toEqual(1);
      app.switchTheme();
      expect(app.themeIndex).toEqual(0);
    });
  });
});
