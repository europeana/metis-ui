import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

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
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });

  it('open a prompt', () => {
    app.showWrapper = true;
    app.closePrompt();
    fixture.detectChanges();
    expect(app.showWrapper).toBe(false);
  });

  it('cancel a workflow', () => {
    app.cancelWorkflow();
    fixture.detectChanges();
    expect(app.showWrapper).toBe(false);
  });
});
