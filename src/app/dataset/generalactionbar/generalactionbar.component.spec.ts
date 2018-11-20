import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslatePipe } from '../../_translate';

import { WorkflowService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl } from '../../_services';
import { GeneralactionbarComponent } from './generalactionbar.component';
import { MockAuthenticationService, MockWorkflowService, currentWorkflow, currentDataset, MockTranslateService } from '../../_mocked';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ GeneralactionbarComponent, TranslatePipe ],
      providers:    [ {provide: WorkflowService, useClass: MockWorkflowService},
        ErrorService,
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService},
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralactionbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check the status', () => {
    component.datasetData = currentDataset;
    component.lastExecutionData = currentWorkflow['results'][0];
    component.returnLastExecution();
    fixture.detectChanges();
    expect(component.currentWorkflowStatus).toBe('INQUEUE');
  });

  it('should start a workflow', () => {
    component.datasetData = currentDataset;
    component.selectWorkflow();
    fixture.detectChanges();

    component.displayWorkflowButton = true;
    component.workflowInfoAvailable = true;
    component.currentWorkflowStatus = 'INQUEUE';
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.progress')).length).toBeTruthy();
  });

});
