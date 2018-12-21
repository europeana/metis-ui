import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AppComponent } from '.';
import {
  createMockPipe,
  MockAuthenticationService,
  MockErrorService,
  MockWorkflowService,
} from './_mocked';
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
        { provide: ErrorService, useClass: MockErrorService },
      ],
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

    fn({});
    expect(app.bodyClass).toBeFalsy();

    fn({ url: '/' });
    expect(app.bodyClass).toBe('home');
    expect(app.loggedIn).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);

    fn({ url: '/home' });
    expect(app.bodyClass).toBe('home');
    fn({ url: '/dataset' });
    expect(app.bodyClass).toBe('dataset');
  });

  it('should show a prompt', () => {
    fixture.detectChanges();
    expect(app.showWrapper).toBe(false);
    workflows.promptCancelWorkflow.emit('15');
    expect(app.currentWorkflowId).toBe('15');
    expect(app.showWrapper).toBe(true);
  });

  it('show close a prompt', () => {
    app.showWrapper = true;
    app.closePrompt();
    expect(app.showWrapper).toBe(false);
  });

  it('should cancel a workflow', () => {
    app.showWrapper = true;
    app.currentWorkflowId = '16';
    spyOn(workflows, 'cancelThisWorkflow').and.returnValue(of({}));
    app.cancelWorkflow();
    expect(workflows.cancelThisWorkflow).toHaveBeenCalledWith('16');
    expect(app.showWrapper).toBe(false);
  });
});
