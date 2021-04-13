import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { MockModalConfirmService, ModalConfirmComponent, ModalConfirmService } from 'shared';
import { AppComponent } from '.';
import {
  createMockPipe,
  MockAuthenticationService,
  MockErrorService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from './_mocked';
import { AuthenticationService, ErrorService, WorkflowService } from './_services';
import { DashboardComponent } from './dashboard';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let errors: ErrorService;
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
      imports: [
        RouterTestingModule.withRoutes([{ path: './dashboard', component: DashboardComponent }])
      ],
      declarations: [AppComponent, createMockPipe('translate')],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ErrorService, useClass: MockErrorService }
      ]
    }).compileComponents();
    errors = TestBed.inject(ErrorService);
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
      id: app.modalConfirmId
    } as unknown) as ModalConfirmComponent;
    fixture.detectChanges();
  };

  describe('Normal operations', () => {
    beforeEach(async(() => {
      configureTestingModule();
    }));

    beforeEach(b4Each);

    it('should handle url changes', () => {
      spyOn(router, 'isActive').and.returnValue(true);
      spyOn(router, 'navigate');
      fixture.detectChanges();

      app.handleRouterEvent({} as RouterEvent);
      expect(app.bodyClass).toBeFalsy();

      app.handleRouterEvent({ url: '/' } as RouterEvent);
      expect(app.bodyClass).toBe('home');
      expect(app.loggedIn).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      app.handleRouterEvent({ url: '/home' } as RouterEvent);
      expect(app.bodyClass).toBe('home');

      app.handleRouterEvent({ url: '/dataset' } as RouterEvent);
      expect(app.bodyClass).toBe('dataset');
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
          modalConfirms.add({ open: () => res, close: () => undefined, id: '1' });
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
    beforeEach(async(() => {
      configureTestingModule(true);
    }));

    beforeEach(b4Each);

    it('should show a workflow', () => {
      spyOn(errors, 'handleError').and.callThrough();
      app.cancellationRequest = cancellationRequest;
      app.cancelWorkflow();
      expect(errors.handleError).toHaveBeenCalled();
    });
  });
});
