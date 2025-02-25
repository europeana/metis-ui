import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickService,
  MockModalConfirmService,
  ModalConfirmComponent,
  ModalConfirmService
} from 'shared';
import { environment } from '../environments/environment';
import {
  mockedKeycloak,
  MockModalConfirmComponent,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from './_mocked';
import { WorkflowService } from './_services';
import { TranslatePipe, TranslateService } from './_translate';
import { DashboardComponent } from './dashboard';
import { AppComponent } from '.';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
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
    modalConfirms = TestBed.inject(ModalConfirmService);
    workflows = TestBed.inject(WorkflowService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
    app.modalConfirm = ({
      open: () => of(true),
      close: () => undefined,
      id: app.modalConfirmId,
      isShowing: true
    } as unknown) as ModalConfirmComponent;
    fixture.detectChanges();
  };

  describe('Normal operations', () => {
    beforeEach(() => {
      configureTestingModule();
      b4Each();
    });

    it('should handle clicks', () => {
      const cmpClickService = fixture.debugElement.injector.get<ClickService>(ClickService);
      spyOn(cmpClickService.documentClickedTarget, 'next');
      fixture.debugElement.query(By.css('.pusher')).nativeElement.click();
      expect(cmpClickService.documentClickedTarget.next).toHaveBeenCalled();
    });

    it('should handle url changes', () => {
      spyOn(router, 'isActive').and.returnValue(true);
      spyOn(router, 'navigate');
      fixture.detectChanges();

      const event = ({} as unknown) as RouterEvent;

      app.handleRouterEvent(event);
      expect(app.bodyClass).toBeFalsy();

      event.url = (undefined as unknown) as string;
      app.handleRouterEvent(event);
      expect(app.bodyClass).not.toBe('home');

      event.url = '/';
      app.handleRouterEvent(event);
      expect(app.bodyClass).toBe('home');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      event.url = '/home';
      app.handleRouterEvent(event);

      expect(app.bodyClass).toBe('home');

      event.url = '/dataset';
      app.handleRouterEvent(event);

      expect(app.bodyClass).toBe('dataset');
    });

    it('should handle unauthorised url changes', () => {
      spyOn(router, 'isActive').and.returnValue(true);
      spyOn(modalConfirms, 'open').and.callFake(() => {
        modalConfirms.add({
          open: () => of(true),
          close: () => undefined,
          id: '1',
          isShowing: true
        });
        return of(true);
      });

      const event = ({
        url: `/home?${environment.paramLoginUnauthorised}=true`
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
          modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
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
      app.cleanup();
    });

    it('should cancel a workflow', () => {
      spyOn(workflows, 'cancelThisWorkflow').and.callThrough();
      app.cancelWorkflow();
      expect(workflows.cancelThisWorkflow).not.toHaveBeenCalled();
      app.cancellationRequest = cancellationRequest;
      app.cancelWorkflow();
      expect(workflows.cancelThisWorkflow).toHaveBeenCalledWith('16');
      app.cleanup();
    });

    it('should cleanup on destroy', () => {
      spyOn(app, 'cleanup').and.callThrough();
      app.ngOnDestroy();
      expect(app.cleanup).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestingModule(true);
      b4Each();
    });

    it('should show a workflow', fakeAsync(() => {
      app.cancellationRequest = cancellationRequest;
      app.cancelWorkflow();
      tick(1);
      expect(app.errorNotification).toBeTruthy();
    }));
  });
});
