import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  mockDataset,
  MockErrorService,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';
import { DragType, PluginType, successNotification, workflowFormFieldConf } from '../../_models';
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
        createMockPipe('renameWorkflow')
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;

    component.fieldConf = workflowFormFieldConf;

    fixture.detectChanges();
  });

  it('should implement different scroll behaviours', () => {
    expect(component.isAnchorsOffset).toBeFalsy();
    component.scrollToPlugin('pluginVALIDATION_EXTERNAL', true);
    expect(component.isAnchorsOffset).toBeTruthy();
    component.scrollToPlugin('pluginHARVEST', false);
    expect(component.isAnchorsOffset).toBeFalsy();
  });

  it('should set the link checking', () => {
    expect(component.workflowForm.dirty).toBeFalsy();
    component.setLinkCheck(1);
    expect(component.workflowForm.dirty).toBeTruthy();
  });

  it('should rearrange the config', () => {
    let indexCopy = component.fieldConf.findIndex((c) => {
      return c.dragType === DragType.dragCopy;
    });
    component.rearrange(1, false);
    indexCopy = component.fieldConf.findIndex((c) => {
      return c.dragType === DragType.dragCopy;
    });
    expect(indexCopy).toBe(2);
    component.rearrange(2, false);
    indexCopy = component.fieldConf.findIndex((c) => {
      return c.dragType === DragType.dragCopy;
    });
    expect(indexCopy).toBe(3);
  });

  it('should rearrange the config (wrapper) onHeaderSynchronise', () => {
    spyOn(component, 'rearrange');
    component.workflowData = {
      datasetId: '1',
      id: '1',
      metisPluginsMetadata: [
        {
          metadataFormat: 'edm',
          pluginType: PluginType.OAIPMH_HARVEST,
          setSpec: 'oai_test',
          url: 'http://www.mocked.com',
          enabled: true
        },
        {
          pluginType: PluginType.TRANSFORMATION,
          customXslt: false,
          enabled: true
        },
        {
          pluginType: PluginType.MEDIA_PROCESS,
          enabled: true
        },
        {
          pluginType: PluginType.LINK_CHECKING,
          enabled: true
        },
        {
          pluginType: PluginType.VALIDATION_INTERNAL,
          enabled: true
        }
      ]
    };
    component.onHeaderSynchronised();
    expect(component.rearrange).toHaveBeenCalledWith(2, true);
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
    expect(component.getRunNotification()!.content).toBe('en:workflowsaved');
  });

  it('should start a workflow', () => {
    spyOn(component.startWorkflow, 'emit');
    component.start();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });
});
