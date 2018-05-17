import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

import { DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, MockCountriesService, currentWorkflow, currentDataset } from '../../_mocked';

import { WorkflowComponent } from './workflow.component';
import { TRANSLATION_PROVIDERS, TranslatePipe, RenameWorkflowPipe }   from '../../_translate';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ WorkflowComponent, TranslatePipe, RenameWorkflowPipe ], 
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

  it('should get the workflow for this dataset', () => {
    component.datasetData = currentDataset;
    component.getWorkflow();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#url')).length).toBe(1);
  });

  it('should add and remove host/connections to form', () => {
    component.datasetData = currentDataset;
    component.addConnection('LINK_CHECKING');
    fixture.detectChanges();
    expect(component.workflowForm.controls.limitConnectionsLINK_CHECKING.value.length).toBe(2);

    component.removeConnection('LINK_CHECKING');
    fixture.detectChanges();
    expect(component.workflowForm.controls.limitConnectionsLINK_CHECKING.value.length).toBe(1);

    component.addConnection('MEDIA_PROCESS');
    fixture.detectChanges();
    expect(component.workflowForm.controls.limitConnectionsMEDIA_PROCESS.value.length).toBe(2);

    component.removeConnection('MEDIA_PROCESS');
    fixture.detectChanges();
    expect(component.workflowForm.controls.limitConnectionsMEDIA_PROCESS.value.length).toBe(1);
  });

  it('should submit the changes', () => {
    component.datasetData = currentDataset;
    component.workflowForm.get('pluginHARVEST').setValue(true);
    component.workflowForm.get('pluginType').setValue('OAIPMH_HARVEST');
    component.workflowForm.get('pluginTRANSFORMATION').setValue(true);
    component.workflowForm.get('customxslt').setValue('mocked');
    component.workflowForm.get('pluginVALIDATION_EXTERNAL').setValue(true);
    component.workflowForm.get('pluginVALIDATION_INTERNAL').setValue(true);
    component.workflowForm.get('pluginNORMALIZATION').setValue(true);
    component.workflowForm.get('pluginENRICHMENT').setValue(true);
    component.workflowForm.get('pluginMEDIA_PROCESS').setValue(true);
    component.workflowForm.get('pluginPREVIEW').setValue(true);
    component.workflowForm.get('pluginPUBLISH').setValue(true);
    component.workflowForm.get('pluginLINK_CHECKING').setValue(true);
    component.onSubmit();
    fixture.detectChanges();
  });

});
