import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  mockDataset,
  MockErrorService,
  MockTranslateService,
  mockWorkflow,
  MockWorkflowService,
} from '../../_mocked';
import { successNotification } from '../../_models';
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
    component.workflowForm.get('pluginType')!.setValue('OAIPMH_HARVEST');
    component.changeHarvestProtocol('OAIPMH_HARVEST');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#harvest-url'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#setspec'))).toBeTruthy();

    component.workflowForm.get('pluginType')!.setValue('HTTP_HARVEST');
    component.changeHarvestProtocol('HTTP_HARVEST');
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#harvest-url'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('#setspec'))).toBeFalsy();
  });

  it('should get the workflow for this dataset', () => {
    component.datasetData = mockDataset;
    component.workflowData = mockWorkflow;
    component.getWorkflow();
    fixture.detectChanges();
    expect(component.harvestprotocol).toBe('OAIPMH_HARVEST');

    component.workflowData.metisPluginsMetadata[0].pluginType = 'HTTP_HARVEST';
    component.getWorkflow();
    fixture.detectChanges();
    expect(component.harvestprotocol).toBe('HTTP_HARVEST');

    component.workflowData.metisPluginsMetadata[0].pluginType = 'OAIPMH_HARVEST';
  });

  it('should reset', () => {
    component.notification = successNotification('hoi!');
    component.reset();
    expect(component.notification).toBeUndefined();
  });

  it('should submit the changes', () => {
    component.datasetData = mockDataset;

    component.workflowForm.get('pluginHARVEST')!.setValue(true);
    component.workflowForm.get('pluginType')!.setValue('HTTP_HARVEST');
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

    expect(component.getSaveNotification()!.content).toBe('en:formerror');
    component.workflowForm.get('url')!.setValue('http://eu/zip');
    expect(component.getSaveNotification()!.content).toBe('en:workflowsavenew');

    component.onSubmit();
    fixture.detectChanges();
    expect(component.getRunNotification()!.content).toBe('en:workflowsaved');
  });

  it('should start a workflow', () => {
    spyOn(component.startWorkflow, 'emit');
    component.start();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });
});
