import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  currentDataset,
  currentWorkflowDataset,
  MockErrorService,
  MockTranslateService,
  MockWorkflowService,
} from '../../_mocked';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { WorkflowComponent } from '.';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [
        WorkflowComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow'),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    }).compileComponents();
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
    component.workflowForm.get('pluginHARVEST')!.setValue(true);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('#harvest-url')).length).toBe(0);
  });

  it('should get the workflow for this dataset', () => {
    component.datasetData = currentDataset;
    component.workflowData = currentWorkflowDataset;
    component.getWorkflow();
    fixture.detectChanges();
    expect(component.harvestprotocol).toBe('OAIPMH_HARVEST');
  });

  it('should submit the changes', () => {
    component.datasetData = currentDataset;
    component.workflowForm.get('pluginTRANSFORMATION')!.setValue(true);
    component.workflowForm.get('customXslt')!.setValue('mocked');
    component.workflowForm.get('pluginVALIDATION_EXTERNAL')!.setValue(true);
    component.workflowForm.get('pluginVALIDATION_INTERNAL')!.setValue(true);
    component.workflowForm.get('pluginNORMALIZATION')!.setValue(true);
    component.workflowForm.get('pluginENRICHMENT')!.setValue(true);
    component.workflowForm.get('pluginMEDIA_PROCESS')!.setValue(true);
    component.workflowForm.get('pluginPREVIEW')!.setValue(true);
    component.workflowForm.get('pluginPUBLISH')!.setValue(true);
    component.workflowForm.get('pluginLINK_CHECKING')!.setValue(true);
    component.onSubmit();
    fixture.detectChanges();
    expect(component.getRunNotification()!.content).toBe('en:workflowsaved');
  });
});
