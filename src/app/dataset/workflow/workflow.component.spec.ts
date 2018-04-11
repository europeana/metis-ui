import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

import { DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, MockCountriesService, currentWorkflow, currentDataset } from '../../_mocked';

import { WorkflowComponent } from './workflow.component';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ WorkflowComponent, TranslatePipe ], 
      providers:    [         
        { provide: DatasetsService, useClass: MockDatasetService }, 
        { provide: WorkflowService, useClass: MockWorkflowService },        
        AuthenticationService, 
        ErrorService, 
        RedirectPreviousUrl,
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        } ]
    })
    .compileComponents();

    router = TestBed.get(Router);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check for changes and update required fields', () => {
    component.workflowForm.get('pluginHARVEST').setValue(true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#harvest-url')).length).toBe(0);

    component.workflowForm.get('pluginType').setValue('OAIPMH_HARVEST');
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#harvest-url')).length).toBe(1);

    component.workflowForm.get('pluginType').setValue('HTTP_HARVEST');
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#url')).length).toBe(1);
  });

  it('should get the workflow for this dataset', () => {
    component.datasetData = currentDataset;
    component.getWorkflow();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#url')).length).toBe(1);
  });

  it('should submit the changes', () => {
    component.datasetData = currentDataset;
    component.onSubmit();
    fixture.detectChanges();
  });

});
