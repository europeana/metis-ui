import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, InputSignal, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';

import {
  ClickService,
  keycloakConstants,
  mockedKeycloak,
  MockModalConfirmService,
  ModalConfirmComponent,
  ModalConfirmService
} from 'shared';
import {
  MockModalConfirmComponent,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from './_mocked';
import { WorkflowService } from './_services';
import { TranslatePipe, TranslateService } from './_translate';
import { DashboardComponent } from './dashboard';
import {
  MaintenanceScheduleItemKey,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';
import { AppComponent } from '.';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let maintenanceSchedules: MaintenanceScheduleService;
  let modalConfirms: ModalConfirmService;
  let workflows: WorkflowService;
  let router: Router;

  const cancellationRequest = {
    workflowExecutionId: '16',
    datasetId: '11',
    datasetName: 'The Name'
  };

  const configureTestingModule = (errorMode = false): void => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        ModalConfirmComponent,
        RouterTestingModule.withRoutes([{ path: './dashboard', component: DashboardComponent }]),
        TranslatePipe,
        AppComponent
      ],
      providers: [
        { provide: Keycloak, useValue: mockedKeycloak },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ({} as unknown) as KeycloakEvent;
          }
        },
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(AppComponent, {
        remove: { imports: [ModalConfirmComponent] },
        add: { imports: [MockModalConfirmComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    maintenanceSchedules = TestBed.inject(MaintenanceScheduleService);
    modalConfirms = TestBed.inject(ModalConfirmService);
    workflows = TestBed.inject(WorkflowService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;

    (app as any).modalConfirm = signal({
      open: () => of(true),
      close: () => undefined,
      id: signal(app.modalConfirmId),
      isShowing: signal(true)
    } as any);

    if ((fixture as any)._changeDetectorRef?.constructor?.prototype) {
      spyOn(
        (fixture as any)._changeDetectorRef.constructor.prototype,
        'checkNoChanges'
      ).and.callFake(() => {});
    } else if ((fixture as any).changeDetectorRef?.__proto__) {
      spyOn((fixture as any).changeDetectorRef.__proto__, 'checkNoChanges').and.callFake(() => {});
    }

    fixture.detectChanges();
  };

  describe('Normal operations', () => {
    beforeEach(() => {
      configureTestingModule();
      b4Each();
    });

    it('should check if maintenance is due', () => {
      let sendMessage = true;
      const maintenanceSettings = {
        pollInterval: 1,
        maintenanceScheduleUrl: 'http://maintenance',
        maintenanceScheduleKey: MaintenanceScheduleItemKey.METIS_UI_TEST,
        maintenanceItem: {}
      };
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(false);
      });
      spyOn(maintenanceSchedules, 'loadMaintenanceItem').and.callFake(() => {
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

      spyOn(modalConfirms, 'isOpen').and.callFake(() => true);
      sendMessage = false;

      let wasCloseCalled = false;

      (app as any).modalConfirm = signal({
        close: () => {
          wasCloseCalled = true;
        }
      } as any);

      app.checkIfMaintenanceDue(maintenanceSettings);
      expect(wasCloseCalled).toBeTrue();
    });

    it('should handle clicks', () => {
      const cmpClickService = fixture.debugElement.injector.get<ClickService>(ClickService);
      spyOn(cmpClickService.documentClickedTarget, 'next');
      fixture.debugElement.query(By.css('.pusher')).nativeElement.click();
      expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalled();
    });

    it('should handle url changes', async () => {
      mockedKeycloak.authenticated = true;
      spyOn(router, 'isActive').and.returnValue(true);
      spyOn(router, 'navigate');

      await fixture.whenStable();
      fixture.detectChanges();

      const event = ({} as unknown) as RouterEvent;

      app.handleRouterEvent(event);
      expect(app.bodyClass).toBeFalsy();

      event.url = (undefined as unknown) as string;
      app.handleRouterEvent(event);
      expect(app.bodyClass).not.toBe('home');

      event.url = '/';
      app.handleRouterEvent(event);

      await Promise.resolve();
      fixture.detectChanges();

      expect(app.bodyClass).toBe('home');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      event.url = '/home';
      app.handleRouterEvent(event);

      expect(app.bodyClass).toBe('home');

      event.url = '/dataset';
      app.handleRouterEvent(event);

      await Promise.resolve();
      fixture.detectChanges();

      expect(app.bodyClass).toBe('dataset');
    });

    it('should handle unauthorised url changes', () => {
      spyOn(router, 'isActive').and.returnValue(true);
      spyOn(modalConfirms, 'open').and.callFake(() => {
        modalConfirms.add({
          open: () => of(true),
          close: () => undefined,
          id: (() => '1' as unknown) as InputSignal<string>,
          isShowing: signal(true)
        });
        return of(true);
      });

      const event = ({
        url: `/home?${keycloakConstants.paramLoginUnauthorised}=true`
      } as unknown) as RouterEvent;

      app.handleRouterEvent(event);
      expect(modalConfirms.open).toHaveBeenCalledWith(app.modalUnauthorisedId);
    });

    it('should logout', () => {
      spyOn(mockedKeycloak, 'logout');
      app.logOut();
      expect(mockedKeycloak.logout).toHaveBeenCalled();
    });

    it('should show a prompt', () => {
      let confirmResult = false;
      let modalNotFound = false;
      spyOn(app, 'cancelWorkflow');
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(confirmResult);
        if (modalNotFound) {
          return (undefined as unknown) as Observable<boolean>;
        } else {
          modalConfirms.add({
            open: () => res,
            close: () => undefined,
            id: (() => '1' as unknown) as InputSignal<string>,
            isShowing: signal(true)
          });
          return res;
        }
      });
      workflows.promptCancelWorkflow.emit(cancellationRequest);
      expect(app.cancellationRequest!.workflowExecutionId).toBe(
        cancellationRequest.workflowExecutionId
      );
      expect(modalConfirms.open).toHaveBeenCalled();
      expect(app.cancelWorkflow).not.toHaveBeenCalled();

      confirmResult = true;
      workflows.promptCancelWorkflow.emit(cancellationRequest);

      expect(app.cancelWorkflow).toHaveBeenCalledTimes(1);
      modalNotFound = true;
      workflows.promptCancelWorkflow.emit(cancellationRequest);

      expect(app.cancelWorkflow).toHaveBeenCalledTimes(1);
    });

    it('should cancel a workflow', () => {
      spyOn(workflows, 'cancelThisWorkflow').and.callThrough();
      app.cancelWorkflow();
      expect(workflows.cancelThisWorkflow).not.toHaveBeenCalled();
      app.cancellationRequest = cancellationRequest;
      app.cancelWorkflow();
      expect(workflows.cancelThisWorkflow).toHaveBeenCalledWith('16');
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestingModule(true);
      b4Each();
      jasmine.clock().install();
    });

    afterEach(async () => {
      jasmine.clock().uninstall();

      app.errorNotification = undefined;
      await fixture.whenStable();
      fixture.destroy();
    });

    it('should show a workflow', async () => {
      app.cancellationRequest = cancellationRequest;
      app.cancelWorkflow();

      jasmine.clock().tick(1);

      await Promise.resolve();
      fixture.detectChanges();

      expect(app.errorNotification).toBeTruthy();
    });
  });
});
