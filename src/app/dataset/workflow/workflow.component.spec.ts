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
import {
  DragType,
  PluginMetadata,
  PluginType,
  successNotification,
  workflowFormFieldConf
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { WorkflowComponent } from '.';
import { WorkflowFormFieldComponent } from './workflow-form-field';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  const getTestEl = function(top: number, bottom?: number): HTMLElement {
    // tslint:disable:no-any
    return ({
      // tslint:disable:no-any
      getBoundingClientRect(): any {
        return {
          bottom: bottom ? bottom : top + 20,
          top
        };
      }
    } as any) as HTMLElement;
  };

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
    component.onHeaderSynchronised();
    expect(component.rearrange).not.toHaveBeenCalled();

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

  it('should get the viewport score', () => {
    expect(component.getViewportScore(getTestEl(20), 50)).toEqual(0);
    expect(component.getViewportScore(getTestEl(50), 50)).toEqual(1);
    expect(component.getViewportScore(getTestEl(70), 50)).toEqual(3);
    expect(component.getViewportScore(getTestEl(20, 1000), 50)).toEqual(4);
  });

  it('it should throttle scroll events', () => {
    component.onHeaderSynchronised();
    expect(component.busy).toBeFalsy();
    window.dispatchEvent(new Event('scroll'));
    expect(component.busy).toBeTruthy();
  });

  it('it should respond to scroll events', () => {
    spyOn(component, 'setHighlightedField');
    component.onHeaderSynchronised();
    window.dispatchEvent(new Event('scroll'));
    expect(component.setHighlightedField).toHaveBeenCalled();
  });

  it('should set the highlighted field', () => {
    const fields = [
      {
        conf: { currentlyViewed: false },
        pluginElement: { nativeElement: getTestEl(20) }
      } as WorkflowFormFieldComponent,
      {
        conf: { currentlyViewed: false },
        pluginElement: { nativeElement: getTestEl(500) }
      } as WorkflowFormFieldComponent
    ];

    component.setHighlightedField(fields);
    expect(fields[0].conf.currentlyViewed).toBeTruthy();
    expect(fields[1].conf.currentlyViewed).toBeFalsy();
  });

  it('should format the form values', () => {
    let result: { metisPluginsMetadata: PluginMetadata[] } = component.formatFormValues();
    expect(result.metisPluginsMetadata.length).toBeFalsy();
    component.workflowForm.get('pluginPREVIEW')!.setValue(true);
    result = component.formatFormValues();
    expect(result.metisPluginsMetadata.length).toEqual(1);
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
