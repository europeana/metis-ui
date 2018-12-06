import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslatePipe } from '../../_translate';

import {
  WorkflowService,
  TranslateService,
  ErrorService,
  AuthenticationService,
  RedirectPreviousUrl,
  DatasetsService,
} from '../../_services';
import { GeneralactionbarComponent } from './generalactionbar.component';
import {
  MockAuthenticationService,
  MockWorkflowService,
  currentWorkflow,
  currentDataset,
  MockTranslateService,
  MockDatasetService,
  currentWorkflowDataset,
} from '../../_mocked';
import { WorkflowStatus } from '../../_models/workflow-execution';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [GeneralactionbarComponent, TranslatePipe],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetService },
        ErrorService,
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralactionbarComponent);
    component = fixture.componentInstance;
    component.workflowData = currentWorkflowDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check the status', () => {
    component.lastExecutionData = currentWorkflow['results'][0];
    component.ngOnChanges();
    expect(component.workflowStatus).toBe(WorkflowStatus.INQUEUE);
  });

  it('should start a workflow', () => {
    component.lastExecutionData = currentWorkflow['results'][4];
    component.ngOnChanges();
    fixture.detectChanges();
    expect(component.workflowStatus).toBe(WorkflowStatus.FINISHED);

    spyOn(component.startWorkflow, 'emit');
    const run = fixture.debugElement.query(By.css('.btn'));
    expect(run.nativeElement.textContent).toBe('en:run workflow');
    run.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });
});
