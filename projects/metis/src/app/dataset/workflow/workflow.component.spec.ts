import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import {
  createMockPipe,
  mockDataset,
  MockErrorService,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import {
  DragType,
  HarvestPluginMetadataBase,
  IncrementalHarvestPluginMetadata,
  MediaProcessPluginMetadata,
  NotificationType,
  OAIHarvestPluginMetadata,
  PluginMetadata,
  PluginType,
  successNotification,
  Workflow,
  WorkflowExecution,
  WorkflowFieldData,
  workflowFormFieldConf,
  WorkflowStatus
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { WorkflowComponent } from '.';
import { WorkflowFormFieldComponent } from './workflow-form-field';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let workflows: WorkflowService;

  const getTestEl = function(top: number, bottom?: number): HTMLElement {
    return ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getBoundingClientRect(): any {
        return {
          bottom: bottom ? bottom : top + 20,
          top
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any) as HTMLElement;
  };

  const getFormControl = (name: string): FormControl => {
    return component.workflowForm.get(name) as FormControl;
  };

  const getIndexDragged = (): number => {
    return component.fieldConf.findIndex((c) => {
      return c.dragType === DragType.dragCopy;
    });
  };

  const setComponentInputFields = function(): void {
    const inputs = [
      'pluginHARVEST',
      'pluginType',
      'pluginTRANSFORMATION',
      'pluginVALIDATION_INTERNAL'
    ].map((name: string, index: number) => {
      return {
        isInactive: (): boolean => index !== 1,
        conf: { name: name }
      };
    }) as unknown;
    component.inputFields = inputs as QueryList<WorkflowFormFieldComponent>;
    component.inputFields.toArray = (): Array<WorkflowFormFieldComponent> =>
      inputs as Array<WorkflowFormFieldComponent>;
    fixture.detectChanges();
  };

  const setSavableChanges = function(): void {
    component.datasetData = mockDataset;
    getFormControl('pluginType').setValue(PluginType.HTTP_HARVEST);
    getFormControl('customXslt').setValue('mocked');
    getFormControl('url').setValue('http://eu/zip');
    [
      'pluginHARVEST',
      'pluginTRANSFORMATION',
      'pluginVALIDATION_EXTERNAL',
      'pluginVALIDATION_INTERNAL',
      'pluginNORMALIZATION',
      'pluginENRICHMENT',
      'pluginMEDIA_PROCESS',
      'pluginPREVIEW',
      'pluginPUBLISH',
      'pluginLINK_CHECKING'
    ].forEach((fName: string) => {
      const field = component.workflowForm.get(fName) as FormControl;
      field.setValue(true);
    });
  };

  const workflowData = {
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
        pluginType: PluginType.VALIDATION_INTERNAL,
        enabled: true
      },
      {
        pluginType: PluginType.LINK_CHECKING,
        enabled: true
      }
    ]
  } as Workflow;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        WorkflowComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();
    workflows = TestBed.inject(WorkflowService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    component.fieldConf = workflowFormFieldConf;
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should set the link checking', () => {
      expect(component.workflowForm.dirty).toBeFalsy();
      component.setLinkCheck(1);
      expect(component.workflowForm.dirty).toBeTruthy();
    });

    it('should add the link checking', () => {
      component.removeLinkCheck();
      const pluginData: WorkflowFieldData = {
        label: '',
        name: 'pluginLINK_CHECKING',
        dragType: DragType.dragCopy
      };

      setComponentInputFields();

      expect(getIndexDragged()).toBe(-1);
      const testTargetIndex = 4;
      component.addLinkCheck(pluginData, testTargetIndex, false);
      expect(getIndexDragged()).toEqual(testTargetIndex + 1);

      component.addLinkCheck(pluginData, testTargetIndex, true);
      expect(getIndexDragged()).toEqual(testTargetIndex + 1);

      component.removeLinkCheck();
      component.addLinkCheck(pluginData, -1, true);
      expect(getIndexDragged()).toBeLessThan(testTargetIndex);
    });

    it('should remove the link checking', () => {
      component.removeLinkCheck();
      expect(getIndexDragged()).toBe(-1);

      component.rearrange(2, false);
      fixture.detectChanges();
      expect(getIndexDragged()).toBe(3);

      component.removeLinkCheck();
      expect(getIndexDragged()).toBe(-1);
    });

    it('should rearrange the config', () => {
      setComponentInputFields();

      component.removeLinkCheck();
      component.rearrange(-1, false);
      expect(getIndexDragged()).toBe(-1);

      component.rearrange(1, false);
      expect(getIndexDragged()).toBe(2);

      component.rearrange(2, false);
      expect(getIndexDragged()).toBe(3);

      component.inputFields = (false as unknown) as QueryList<WorkflowFormFieldComponent>;
      component.rearrange(2, false);
      expect(getIndexDragged()).toBe(3);
    });

    it('should rearrange the config (wrapper) onHeaderSynchronise', () => {
      spyOn(component, 'rearrange');
      component.onHeaderSynchronised();
      expect(component.rearrange).not.toHaveBeenCalled();

      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      component.workflowData = testWorkflowData;
      component.onHeaderSynchronised();
      expect(component.rearrange).toHaveBeenCalledWith(3, true);

      testWorkflowData.metisPluginsMetadata.reverse();
      expect(testWorkflowData.metisPluginsMetadata[0].pluginType).toEqual('LINK_CHECKING');

      component.onHeaderSynchronised();
      expect(component.rearrange).toHaveBeenCalledTimes(2);

      testWorkflowData.metisPluginsMetadata.reverse();
      testWorkflowData.metisPluginsMetadata.pop();
      component.onHeaderSynchronised();
      expect(component.rearrange).toHaveBeenCalledTimes(2);
    });

    it('should get the viewport score', () => {
      expect(component.getViewportScore(getTestEl(20), 50)).toEqual(0);
      expect(component.getViewportScore(getTestEl(50), 50)).toEqual(1);
      expect(component.getViewportScore(getTestEl(70, 1000), 50)).toEqual(2);
      expect(component.getViewportScore(getTestEl(70), 50)).toEqual(3);
      expect(component.getViewportScore(getTestEl(20, 1000), 50)).toEqual(4);
    });

    it('it should respond to scroll events', () => {
      spyOn(component, 'setHighlightedField');
      component.onHeaderSynchronised();
      window.dispatchEvent(new Event('scroll'));
      expect(component.setHighlightedField).toHaveBeenCalled();
    });

    it('it should throttle scroll events', () => {
      component.onHeaderSynchronised();
      spyOn(component, 'setHighlightedField');
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      expect(component.setHighlightedField).toHaveBeenCalledTimes(1);
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
        } as WorkflowFormFieldComponent,
        {
          conf: { currentlyViewed: false },
          pluginElement: { nativeElement: getTestEl(10) }
        } as WorkflowFormFieldComponent
      ];
      component.setHighlightedField(fields);
      expect(fields[0].conf.currentlyViewed).toBeTruthy();
      expect(fields[1].conf.currentlyViewed).toBeFalsy();
      expect(fields[2].conf.currentlyViewed).toBeFalsy();

      component.setHighlightedField(fields, getTestEl(200));
      expect(fields[0].conf.currentlyViewed).toBeFalsy();
      expect(fields[1].conf.currentlyViewed).toBeFalsy();
      expect(fields[2].conf.currentlyViewed).toBeFalsy();
    });

    it('should enable the incremental-harvesting field', fakeAsync(() => {
      const getField = (): FormControl => {
        return component.workflowForm.get('incrementalHarvest') as FormControl;
      };

      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      testWorkflowData.metisPluginsMetadata = testWorkflowData.metisPluginsMetadata.slice(0, 1);

      component.workflowData = testWorkflowData;
      component.enableIncrementalHarvestingFieldIfAvailable(component.workflowData as Workflow);
      tick(1);
      expect(getField().disabled).toBeFalsy();

      let serviceResult = false;
      spyOn(workflows, 'getIsIncrementalHarvestAllowed').and.callFake(() => {
        return of(serviceResult);
      });
      component.enableIncrementalHarvestingFieldIfAvailable(component.workflowData as Workflow);
      expect(getField().disabled).toBeTruthy();

      serviceResult = true;

      component.enableIncrementalHarvestingFieldIfAvailable(component.workflowData as Workflow);
      expect(getField().disabled).toBeFalsy();
    }));

    it('should send the incremental-harvesting field', fakeAsync(() => {
      let result = component.formatFormValues();

      expect(
        (result.metisPluginsMetadata.filter((x) => {
          return x.pluginType === PluginType.OAIPMH_HARVEST;
        })[0] as IncrementalHarvestPluginMetadata).incrementalHarvest
      ).toBeFalsy();

      expect(
        (result.metisPluginsMetadata.filter((x) => {
          return x.pluginType === PluginType.HTTP_HARVEST;
        })[0] as IncrementalHarvestPluginMetadata).incrementalHarvest
      ).toBeFalsy();

      const field = component.workflowForm.get('incrementalHarvest') as FormControl;
      field.setValue(true);
      result = component.formatFormValues();

      expect(
        (result.metisPluginsMetadata.filter((x) => {
          return x.pluginType === PluginType.OAIPMH_HARVEST;
        })[0] as IncrementalHarvestPluginMetadata).incrementalHarvest
      ).toBeTruthy();

      expect(
        (result.metisPluginsMetadata.filter((x) => {
          return x.pluginType === PluginType.HTTP_HARVEST;
        })[0] as IncrementalHarvestPluginMetadata).incrementalHarvest
      ).toBeTruthy();
    }));

    it('should format the form values', () => {
      let result: { metisPluginsMetadata: PluginMetadata[] } = component.formatFormValues();
      expect(result.metisPluginsMetadata.length).toBeGreaterThan(1);
      getFormControl('pluginPREVIEW').setValue(true);
      result = component.formatFormValues();
      expect(result.metisPluginsMetadata.filter((x) => x.enabled).length).toEqual(1);
    });

    it('should format missing url parameters as a blank string or null', () => {
      const result: { metisPluginsMetadata: PluginMetadata[] } = component.formatFormValues();
      const httpHarvestConf = result.metisPluginsMetadata.filter(
        (x) => x.pluginType === PluginType.HTTP_HARVEST
      )[0] as HarvestPluginMetadataBase;
      const oaipmhHarvestConf = result.metisPluginsMetadata.filter(
        (x) => x.pluginType === PluginType.OAIPMH_HARVEST
      )[0] as OAIHarvestPluginMetadata;

      expect(oaipmhHarvestConf.url).toEqual('');
      expect(httpHarvestConf.url).toEqual('');

      const mediaConf = result.metisPluginsMetadata.filter(
        (x) => x.pluginType === PluginType.MEDIA_PROCESS
      )[0] as MediaProcessPluginMetadata;
      expect(mediaConf.throttlingLevel).toBeFalsy();
    });

    it('should reset', () => {
      component.notification = successNotification('hoi!');
      component.reset();
      expect(component.notification).toBeUndefined();
    });

    it('should submit the changes', fakeAsync(() => {
      spyOn(workflows, 'createWorkflowForDataset').and.callThrough();

      component.onSubmit();
      tick(1);
      expect(workflows.createWorkflowForDataset).not.toHaveBeenCalled();

      setSavableChanges();
      expect(component.getSaveNotification()!.content).toBe('en:workflowSaveNew');
      component.onSubmit();
      tick(1);
      expect(component.getSaveNotification()!.content).toBe('en:workflowSaved');
      expect(component.getSaveNotification()).toEqual(component.notification);
      expect(workflows.createWorkflowForDataset).toHaveBeenCalled();
      tick(1);
    }));

    it('should get the save notification', () => {
      expect(component.getSaveNotification()).toEqual(component.newNotification);

      component.isSaving = true;
      expect(component.getSaveNotification()).toBeFalsy();

      component.isSaving = false;
      component.newWorkflow = false;
      expect(component.getSaveNotification()).toEqual(component.saveNotification);

      getFormControl('url').setErrors({ incorrect: true });
      expect(component.workflowForm.valid).toBeFalsy();
      expect(component.getSaveNotification()).toEqual(component.invalidNotification);
    });

    it('should get the run notification if running', () => {
      expect(component.getRunNotification()).toBeFalsy();
      component.lastExecution = ({
        workflowStatus: WorkflowStatus.INQUEUE
      } as unknown) as WorkflowExecution;
      expect(component.getRunNotification()).toBeTruthy();

      expect(component.getRunNotification()).toEqual(component.runningNotification);

      component.isStarting = true;
      expect(component.getRunNotification()).toBeFalsy();
      component.isStarting = false;

      component.getSaveNotification();
      component.notification = successNotification('hoi!');
      expect(component.getRunNotification()).toBeTruthy();
      expect(component.getRunNotification()).not.toEqual(component.runningNotification);
    });

    it('should start a workflow', () => {
      spyOn(component.startWorkflow, 'emit');
      component.start();
      expect(component.startWorkflow.emit).toHaveBeenCalledWith();
    });

    it('should detect gaps in the workflow sequence', () => {
      setComponentInputFields();
      const inputFields = component.inputFields.toArray();

      const getFakeInputErrorCount = (): number => {
        return inputFields.filter((item: WorkflowFormFieldComponent) => {
          return item.conf.error;
        }).length;
      };

      expect(getFakeInputErrorCount()).toBe(0);

      getFormControl('pluginHARVEST').setValue(true);
      expect(component.hasGapInSequence(inputFields)).toBeFalsy();
      expect(component.workflowForm.valid).toBeTruthy();
      expect(getFakeInputErrorCount()).toBe(0);

      getFormControl('pluginVALIDATION_INTERNAL').setValue(true);
      expect(component.hasGapInSequence(inputFields)).toBeTruthy();
      expect(getFakeInputErrorCount()).toBe(2);

      component.workflowForm.updateValueAndValidity();
      expect(component.workflowForm.valid).toBeFalsy();
      expect(component.getSaveNotification()).toEqual(component.gapInSequenceNotification);
    });

    it('should extract the workflow params (always)', () => {
      const httpUrl = 'HTTP_URL';
      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      const plugin = testWorkflowData.metisPluginsMetadata[0];
      plugin.pluginType = PluginType.HTTP_HARVEST;

      // test null
      delete plugin.url;
      component.extractWorkflowParamsAlways(testWorkflowData);
      expect(component.workflowForm.value.url).toBeFalsy();

      // test valid
      (plugin as HarvestPluginMetadataBase).url = httpUrl;
      component.extractWorkflowParamsAlways(testWorkflowData);
      expect(component.workflowForm.value.url).toBe(httpUrl);
    });

    it('should extract the workflow params (enabled)', () => {
      const pluginType = PluginType.HTTP_HARVEST;
      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      const plugin = testWorkflowData.metisPluginsMetadata[0];
      plugin.pluginType = pluginType;
      plugin.enabled = false;
      component.extractWorkflowParamsEnabled(testWorkflowData);
      expect(component.workflowForm.value.pluginType).not.toBe(pluginType);

      plugin.enabled = true;
      component.extractWorkflowParamsEnabled(testWorkflowData);
      expect(component.workflowForm.value.pluginType).toBe(pluginType);

      plugin.pluginType = 'IGNORED' as 'TRANSFORMATION';
      component.extractWorkflowParamsEnabled(testWorkflowData);
      expect(component.workflowForm.value.pluginType).toBe(pluginType);
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));
    beforeEach(b4Each);

    it('should handle errors submitting the changes', fakeAsync(() => {
      setSavableChanges();
      expect(component.notification).toBeFalsy();
      component.onSubmit();
      tick(1);
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
    }));
  });
});
