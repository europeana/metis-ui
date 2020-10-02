import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from '.';
import {
  createMockPipe,
  MockAuthenticationService,
  MockErrorService,
  MockWorkflowService
} from './_mocked';
import { CancellationRequest } from './_models';
import { AuthenticationService, ErrorService, WorkflowService } from './_services';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;
  let workflows: WorkflowService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ErrorService, useClass: MockErrorService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    workflows = TestBed.get(WorkflowService);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
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
    expect(app.showWrapper).toBe(false);
    workflows.promptCancelWorkflow.emit({
      workflowExecutionId: '15',
      datasetId: '11',
      datasetName: 'The Name'
    } as CancellationRequest);
    expect(app.cancellationRequest!.workflowExecutionId).toBe('15');
    expect(app.showWrapper).toBe(true);
  });

  it('show close a prompt', () => {
    app.showWrapper = true;
    app.closePrompt();
    expect(app.showWrapper).toBe(false);
  });

  it('should cancel a workflow', () => {
    app.showWrapper = true;
    app.cancellationRequest = {
      workflowExecutionId: '16',
      datasetId: '11',
      datasetName: 'The Name'
    };
    spyOn(workflows, 'cancelThisWorkflow').and.callThrough();
    app.cancelWorkflow();
    expect(workflows.cancelThisWorkflow).toHaveBeenCalledWith('16');
    expect(app.showWrapper).toBe(false);
  });

  it('should cleanup on destroy', () => {
    spyOn(app, 'cleanup').and.callThrough();
    app.ngOnDestroy();
    expect(app.cleanup).toHaveBeenCalled();
  });
});
