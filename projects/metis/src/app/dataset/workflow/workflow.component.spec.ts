import { Component, CUSTOM_ELEMENTS_SCHEMA, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';

import { createMockPipe } from 'shared';
import {
  mockDataset,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import { successNotification } from '../../_helpers';
import {
  DragType,
  HarvestPluginMetadataBase,
  IncrementalHarvestPluginMetadata,
  MediaProcessPluginMetadata,
  NotificationType,
  OAIHarvestPluginMetadata,
  PluginMetadata,
  PluginType,
  Workflow,
  WorkflowExecution,
  workflowFormFieldConf,
  WorkflowStatus
} from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { WorkflowComponent } from '.';
import { WorkflowFormFieldComponent } from './workflow-form-field';

@Component({
  selector: 'app-workflow-form-field',
  template: '<div>Mock Field Layout</div>',
  standalone: true
})
class MockWorkflowFormFieldComponent {
  conf = input.required<any>();
  index = input.required<number>();
  workflowForm = input.required<any>();
  incrementalHarvestingAllowed = input<boolean>(false);
  customXsltAllowed = input<boolean>(false);
}

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;
  let workflows: WorkflowService;

  const getTestEl = function(top: number, bottom?: number): HTMLElement {
    return ({
      getBoundingClientRect(): any {
        return {
          bottom: bottom ? bottom : top + 20,
          top
        };
      }
    } as any) as HTMLElement;
  };

  const getFormControl = (name: string): UntypedFormControl => {
    return component.workflowForm.get(name) as UntypedFormControl;
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
      const configState = { name: name, error: false };
      return {
        isInactive: (): boolean => index !== 1,
        conf: () => configState
      };
    });
    // Mock the viewChildren signal function
    Object.defineProperty(component, 'inputFields', {
      writable: true,
      value: () => inputs
    });
    fixture.detectChanges();
  };

  const setSavableChanges = function(): void {
    fixture.componentRef.setInput('datasetData', mockDataset);
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
      const field = component.workflowForm.get(fName) as UntypedFormControl;
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
        url: 'http://mocked.com',
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
      imports: [ReactiveFormsModule, WorkflowComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: RenameWorkflowPipe, useValue: createMockPipe('renameWorkflow') },
        { provide: TranslatePipe, useValue: createMockPipe('translate') },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    })
      .overrideComponent(WorkflowComponent, {
        remove: { imports: [WorkflowFormFieldComponent] },
        add: { imports: [MockWorkflowFormFieldComponent] }
      })
      .compileComponents();
    workflows = TestBed.inject(WorkflowService);
  };

  const initialPristineWorkflowConf = [...workflowFormFieldConf];

  const b4Each = (): void => {
    workflowFormFieldConf.length = 0;

    initialPristineWorkflowConf.forEach((item) => {
      workflowFormFieldConf.push(item);
    });

    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    component.fieldConf = workflowFormFieldConf;

    if ((fixture as any)._changeDetectorRef?.constructor?.prototype) {
      spyOn(
        (fixture as any)._changeDetectorRef.constructor.prototype,
        'checkNoChanges'
      ).and.callFake(() => {});
    } else if ((fixture as any).changeDetectorRef?.__proto__) {
      spyOn((fixture as any).changeDetectorRef.__proto__, 'checkNoChanges').and.callFake(() => {});
    }

    fixture.componentRef.setInput('datasetData', mockDataset);
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    afterEach(async () => {
      component.workflowForm.reset({}, { emitEvent: false });
      await fixture.whenStable();
      fixture.destroy();
    });

    it('should set the link checking', () => {
      expect(component.workflowForm.dirty).toBeFalsy();
      component.setLinkCheck(1);
      expect(component.workflowForm.dirty).toBeTruthy();
    });

    it('should add the link checking', () => {
      fixture.detectChanges();

      component.removeLinkCheck();
      const pluginData = {
        label: '',
        name: 'pluginLINK_CHECKING',
        dragType: DragType.dragCopy
      } as any;

      setComponentInputFields();

      expect(getIndexDragged()).toBe(-1);
      const testTargetIndex = 4;

      component.addLinkCheck(pluginData, testTargetIndex, false);
      fixture.detectChanges();
      expect(getIndexDragged()).toEqual(testTargetIndex + 1);

      component.addLinkCheck(pluginData, testTargetIndex, true);
      fixture.detectChanges();
      expect(getIndexDragged()).toEqual(testTargetIndex + 1);

      component.removeLinkCheck();
      component.addLinkCheck(pluginData, -1, true);

      fixture.detectChanges();
      expect(getIndexDragged()).toBeLessThan(testTargetIndex);
    });

    it('should remove the link checking', () => {
      fixture.detectChanges();

      component.removeLinkCheck();
      expect(getIndexDragged()).toBe(-1);

      component.rearrange(2, false);
      fixture.detectChanges();
      expect(getIndexDragged()).toBe(3);

      component.removeLinkCheck();
      fixture.detectChanges();
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

      // Overwrite viewChildren signal to return an empty array for layout handling safety
      Object.defineProperty(component, 'inputFields', {
        writable: true,
        value: () => []
      });
      component.rearrange(2, false);
      expect(getIndexDragged()).toBe(3);
    });

    it('should rearrange the config (wrapper) onHeaderSynchronise', () => {
      spyOn(component, 'rearrange');
      component.onHeaderSynchronised();
      expect(component.rearrange).not.toHaveBeenCalled();

      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      fixture.componentRef.setInput('workflowData', testWorkflowData);
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
      window.innerHeight = 800;

      const fields = [
        ({
          conf: signal({ currentlyViewed: false, name: 'plugin1' }),
          pluginElement: signal({ nativeElement: getTestEl(20) })
        } as unknown) as WorkflowFormFieldComponent,
        ({
          conf: signal({ currentlyViewed: false, name: 'plugin2' }),
          pluginElement: signal({ nativeElement: getTestEl(500) }) // Highest viewport score (3)
        } as unknown) as WorkflowFormFieldComponent,
        ({
          conf: signal({ currentlyViewed: false, name: 'plugin3' }),
          pluginElement: signal({ nativeElement: getTestEl(10) })
        } as unknown) as WorkflowFormFieldComponent
      ];

      component.setHighlightedField(fields);
      expect(component.currentlyViewedField()).toEqual('plugin2');

      component.setHighlightedField(fields, getTestEl(200));
      expect(component.currentlyViewedField()).toBeUndefined();
    });

    it('should enable the incremental-harvesting field', () => {
      let serviceResult = false;

      expect(component.incrementalHarvestingAllowed()).toBeFalsy();

      spyOn(workflows, 'getIsIncrementalHarvestAllowed').and.callFake(() => {
        return of(serviceResult);
      });

      TestBed.runInInjectionContext(() => {
        component.enableIncrementalHarvestingFieldIfAvailable('1');
      });

      expect(component.incrementalHarvestingAllowed()).toBeFalsy();

      serviceResult = true;

      TestBed.runInInjectionContext(() => {
        component.enableIncrementalHarvestingFieldIfAvailable('1');
      });

      expect(component.incrementalHarvestingAllowed()).toBeTruthy();
    });

    it('should send the incremental-harvesting field', () => {
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

      const field = component.workflowForm.get('incrementalHarvest') as UntypedFormControl;
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
    });

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
      component.notification.set(successNotification('hoi!'));
      component.reset();
      expect(component.notification()).toBeUndefined();
    });

    it('should submit the changes', () => {
      spyOn(workflows, 'createWorkflowForDataset').and.returnValue(of(workflowData));
      spyOn(workflows, 'getWorkflowForDataset').and.returnValue(of(workflowData));

      component.workflowForm.setErrors({ invalid: true });
      component.onSubmit();
      expect(workflows.createWorkflowForDataset).not.toHaveBeenCalled();

      component.workflowForm.setErrors(null);
      setSavableChanges();

      expect(component.saveNotificationSignal()!.content).toBe('en:workflowSaveNew');

      component.onSubmit();
      fixture.detectChanges();

      expect(component.saveNotificationSignal()!.content).toBe('en:workflowSaved');
      expect(component.saveNotificationSignal()).toEqual(component.notification());
      expect(workflows.createWorkflowForDataset).toHaveBeenCalled();
    });

    it('should get the save notification', () => {
      expect(component.saveNotificationSignal()).toEqual(component.newNotification());

      component.isSaving.set(true);
      expect(component.saveNotificationSignal()).toBeFalsy();

      component.isSaving.set(false);

      component.newWorkflow.set(false);
      expect(component.saveNotificationSignal()).toEqual(component.saveNotification());

      getFormControl('url').setErrors({ incorrect: true });

      component.workflowForm.updateValueAndValidity();
      component.workflowForm.patchValue({}, { emitEvent: true });
      fixture.detectChanges();

      expect(component.saveNotificationSignal()).toEqual(component.invalidNotification());
    });

    it('should get the run notification if running', () => {
      expect(component.runNotificationSignal()).toBeFalsy();
      fixture.componentRef.setInput('lastExecution', ({
        workflowStatus: WorkflowStatus.INQUEUE
      } as unknown) as WorkflowExecution);
      expect(component.runNotificationSignal()).toBeTruthy();
      expect(component.runNotificationSignal()).toEqual(component.runningNotification());

      fixture.componentRef.setInput('isStarting', true);
      expect(component.runNotificationSignal()).toBeFalsy();
      fixture.componentRef.setInput('isStarting', false);

      component.saveNotificationSignal();
      component.notification.set(successNotification('hoi!'));
      expect(component.runNotificationSignal()).toBeTruthy();
      expect(component.runNotificationSignal()).not.toEqual(component.runningNotification());
    });

    it('should start a workflow', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      spyOn(component.startWorkflow, 'emit');
      component.start();

      await fixture.whenStable();
      fixture.detectChanges();
      expect(component.startWorkflow.emit).toHaveBeenCalledWith();
    });

    it('should detect gaps in the workflow sequence', () => {
      setComponentInputFields();
      const inputFields = component.inputFields();

      const getFakeInputErrorCount = (): number => {
        return inputFields.filter((item: any) => {
          return item.conf().error;
        }).length;
      };

      expect(getFakeInputErrorCount()).toBe(0);

      getFormControl('pluginHARVEST').setValue(true);
      component.workflowForm.updateValueAndValidity();
      fixture.detectChanges();

      expect(component.hasGapInSequence(inputFields)).toBeFalsy();
      expect(component.workflowForm.valid).toBeTruthy();
      expect(getFakeInputErrorCount()).toBe(0);

      getFormControl('pluginVALIDATION_INTERNAL').setValue(true);

      component.hasSequenceGap.set(true);

      component.workflowForm.updateValueAndValidity();
      component.workflowForm.patchValue({}, { emitEvent: true });
      fixture.detectChanges();

      expect(component.workflowForm.valid).toBeFalsy();
      expect(component.saveNotificationSignal()).toEqual(component.gapInSequenceNotification());
    });

    it('should extract the workflow params (always)', () => {
      const httpUrl = 'HTTP_URL';
      const testWorkflowData = JSON.parse(JSON.stringify(workflowData));
      const plugin = testWorkflowData.metisPluginsMetadata[0];
      plugin.pluginType = PluginType.HTTP_HARVEST;

      delete plugin.url;
      component.extractWorkflowParamsAlways(testWorkflowData);
      expect(component.workflowForm.value.url).toBeFalsy();

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
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors submitting the changes', async () => {
      setSavableChanges();
      component.notification.set(undefined);
      expect(component.notification()).toBeFalsy();
      component.onSubmit();

      expect(component.notification()).toBeFalsy();

      await new Promise((resolve) => setTimeout(resolve, 100));

      fixture.detectChanges();

      expect(component.notification()).toBeTruthy();
      expect(component.notification()!.type).toBe(NotificationType.ERROR);
    });
  });
});
