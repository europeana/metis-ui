import { WorkflowService, ErrorService, AuthenticationService, RedirectPreviousUrl, TranslateService, DatasetsService } from '../../_services';
import { MockWorkflowService, MockAuthenticationService, MockTranslateService } from '../../_mocked';
import { TranslatePipe } from '../../_translate';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { ExecutionsComponent } from './executions.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ExecutionsComponent', () => {
  let component: ExecutionsComponent;
  let fixture: ComponentFixture<ExecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ ExecutionsComponent, TranslatePipe ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService},
        DatasetsService,
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService},
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

});
