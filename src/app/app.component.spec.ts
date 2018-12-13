import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from '.';
import {
  createMockPipe,
  MockAuthenticationService,
  MockDatasetService,
  MockWorkflowService,
} from './_mocked';
import {
  AuthenticationService,
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  WorkflowService,
} from './_services';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AppComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        ErrorService,
        RedirectPreviousUrl,
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
