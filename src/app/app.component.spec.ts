import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WorkflowService, ErrorService, AuthenticationService, RedirectPreviousUrl, TranslateService } from './_services';
import { MockAuthenticationService, MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset, currentUser } from './_mocked';

import { TRANSLATION_PROVIDERS, TranslatePipe, RenameWorkflowPipe } from './_translate';

// Can't bind to 'loggedIn' since it isn't a known property of 'app-header'.
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let fixture;
  let app;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ AppComponent, TranslatePipe ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        ErrorService,
        RedirectPreviousUrl,
        { provide: TranslateService,
            useValue: {
              translate: () => {
                return {};
              }
            }
        }
      ]
    })
      .compileComponents();
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
