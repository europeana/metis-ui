import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, MockCountriesService, currentWorkflow, currentDataset } from '../../_mocked';

import { WorkflowComponent } from './workflow.component';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ WorkflowComponent, TranslatePipe ], 
      providers:    [         
        {provide: DatasetsService, useClass: MockDatasetService}, 
        {provide: WorkflowService, useClass: MockWorkflowService},        
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*it('should check if a workflow exists', () => {
    component.datasetData  = currentDataset;
    component.getWorkflow();
    fixture.detectChanges();
  });*/

});
