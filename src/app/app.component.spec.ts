import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from '.';
import {
  createMockPipe,
  MockAuthenticationService,
  MockErrorService,
  MockWorkflowService
} from './_mocked';
import { CancellationRequest } from './_models';
import {
  AuthenticationService,
  ErrorService,
  ModalConfirmService,
  WorkflowService
} from './_services';
import { ModalConfirmComponent } from './shared/modal-confirm';
import { DashboardComponent } from './dashboard';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let modalConfirms: ModalConfirmService;
  let workflows: WorkflowService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: './dashboard', component: DashboardComponent }])
      ],
      declarations: [AppComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ModalConfirmService,
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ErrorService, useClass: MockErrorService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
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
  });

  it('should handle url changes', () => {
    const spy = spyOn(router.events, 'subscribe');
    spyOn(router, 'isActive').and.returnValue(true);
    spyOn(router, 'navigate');
    fixture.detectChanges();
    const fn = spy.calls.first().args[0];

    expect(fn).toBeTruthy();

    if (fn) {
      fn({} as RouterEvent);
      expect(app.bodyClass).toBeFalsy();

      fn({ url: '/' } as RouterEvent);
      expect(app.bodyClass).toBe('home');
      expect(app.loggedIn).toBe(true);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

      fn({ url: '/home' } as RouterEvent);
      expect(app.bodyClass).toBe('home');
      fn({ url: '/dataset' } as RouterEvent);
      expect(app.bodyClass).toBe('dataset');
    }
  });

  it('should show a prompt', () => {
    fixture.detectChanges();
    spyOn(modalConfirms, 'open');
    workflows.promptCancelWorkflow.emit({
      workflowExecutionId: '15',
      datasetId: '11',
      datasetName: 'The Name'
    } as CancellationRequest);
    expect(app.cancellationRequest!.workflowExecutionId).toBe('15');
    expect(modalConfirms.open).toHaveBeenCalled();
  });

  it('should cancel a workflow', () => {
    app.cancellationRequest = {
      workflowExecutionId: '16',
      datasetId: '11',
      datasetName: 'The Name'
    };
    spyOn(workflows, 'cancelThisWorkflow').and.callThrough();
    app.cancelWorkflow();
    expect(workflows.cancelThisWorkflow).toHaveBeenCalledWith('16');
  });

  it('should cleanup on destroy', () => {
    spyOn(app, 'cleanup');
    app.ngOnInit();
    app.ngOnDestroy();
    expect(app.cleanup).toHaveBeenCalled();
  });
});
