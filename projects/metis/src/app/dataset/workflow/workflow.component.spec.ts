import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

  const setSavableChanges = function(): void {
    component.datasetData = mockDataset;
    component.workflowForm.get('pluginType')!.setValue('HTTP_HARVEST');
    component.workflowForm.get('customXslt')!.setValue('mocked');
    component.workflowForm.get('url')!.setValue('http://eu/zip');
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
      const getIndexCopy = (): number => {
        return component.fieldConf.findIndex((c) => {
          return c.dragType === DragType.dragCopy;
        });
      };
      const pluginData: WorkflowFieldData = {
        label: '',
        name: 'pluginLINK_CHECKING',
        dragType: DragType.dragCopy
      };
      expect(getIndexCopy()).toBe(-1);
      const testTargetIndex = 4;
      component.addLinkCheck(pluginData, testTargetIndex, false);
      expect(getIndexCopy()).toEqual(testTargetIndex + 1);
    });

    it('should remove the link checking', () => {
      component.rearrange(2, false);
      let indexCopy = component.fieldConf.findIndex((c) => {
        return c.dragType === DragType.dragCopy;
      });
      expect(indexCopy).toBe(3);
      component.removeLinkCheck();
      indexCopy = component.fieldConf.findIndex((c) => {
        return c.dragType === DragType.dragCopy;
      });
      expect(indexCopy).toBe(-1);
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
        } as WorkflowFormFieldComponent
      ];
      component.setHighlightedField(fields);
      expect(fields[0].conf.currentlyViewed).toBeTruthy();
      expect(fields[1].conf.currentlyViewed).toBeFalsy();
    });

    it('should enable the incremental-harvesting field', fakeAsync(() => {
      const getField = (): FormControl => {
        return component.workflowForm.get('incrementalHarvest') as FormControl;
      };

      const testWorkflowData = {
        datasetId: '1',
        id: '1',
        metisPluginsMetadata: [
          {
            metadataFormat: 'edm',
            pluginType: PluginType.OAIPMH_HARVEST,
            setSpec: 'oai_test',
            url: 'http://www.mocked.com',
            enabled: true
          } as PluginMetadata
        ]
      };

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

    it('should format the form values', () => {
      let result: { metisPluginsMetadata: PluginMetadata[] } = component.formatFormValues();
      expect(result.metisPluginsMetadata.length).toBeGreaterThan(1);
      component.workflowForm.get('pluginPREVIEW')!.setValue(true);
      result = component.formatFormValues();
      expect(result.metisPluginsMetadata.filter((x) => x.enabled).length).toEqual(1);
    });

    it('should format missing url parameters as a blank string', () => {
      let result: { metisPluginsMetadata: PluginMetadata[] } = component.formatFormValues();
      const httpHarvestConf = result.metisPluginsMetadata.filter(
        (x) => x.pluginType === 'HTTP_HARVEST'
      )[0] as HarvestPluginMetadataBase;
      const oaipmhHarvestConf = result.metisPluginsMetadata.filter(
        (x) => x.pluginType === 'OAIPMH_HARVEST'
      )[0] as OAIHarvestPluginMetadata;
      expect(oaipmhHarvestConf.url).toEqual('');
      expect(httpHarvestConf.url).toEqual('');
      result = component.formatFormValues();
    });

    it('should reset', () => {
      component.notification = successNotification('hoi!');
      component.reset();
      expect(component.notification).toBeUndefined();
    });

    it('should submit the changes', fakeAsync(() => {
      spyOn(workflows, 'createWorkflowForDataset').and.callThrough();
      setSavableChanges();
      expect(component.getSaveNotification()!.content).toBe('en:workflowSaveNew');
      component.onSubmit();
      tick(1);
      expect(component.getSaveNotification()!.content).toBe('en:workflowSaved');
      expect(component.getSaveNotification()).toEqual(component.notification);
      expect(workflows.createWorkflowForDataset).toHaveBeenCalled();
      tick(1);
    }));

    it('should get the save notification unless saving', () => {
      expect(component.getSaveNotification()).toBeTruthy();
      component.isSaving = true;
      expect(component.getSaveNotification()).toBeFalsy();
    });

    it('should get the run notification if running', () => {
      expect(component.getRunNotification()).toBeFalsy();
      component.lastExecution = ({
        workflowStatus: WorkflowStatus.INQUEUE
      } as unknown) as WorkflowExecution;
      expect(component.getRunNotification()).toBeTruthy();
      component.isStarting = true;
      expect(component.getRunNotification()).toBeFalsy();
    });

    it('should start a workflow', () => {
      spyOn(component.startWorkflow, 'emit');
      component.start();
      expect(component.startWorkflow.emit).toHaveBeenCalledWith();
    });

    it('should detect gaps in the workflow sequence', () => {
      const fakeInputs = [
        {
          conf: {
            name: 'pluginHARVEST',
            error: false
          }
        },
        {
          conf: {
            name: 'pluginType',
            error: false
          }
        },
        {
          conf: {
            name: 'pluginTRANSFORMATION',
            error: false
          }
        },
        {
          conf: {
            name: 'pluginVALIDATION_INTERNAL',
            error: false
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any;

      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fakeInputs.filter((item: any) => {
          return item.conf.error;
        }).length
      ).toBe(0);

      component.workflowForm.get('pluginHARVEST')!.setValue(true);
      component.workflowStepAllowed(fakeInputs);
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fakeInputs.filter((item: any) => {
          return item.conf.error;
        }).length
      ).toBe(0);

      component.workflowForm.get('pluginVALIDATION_INTERNAL')!.setValue(true);
      component.workflowStepAllowed(fakeInputs);

      expect(fakeInputs[1].conf.error).toBeTruthy();
      expect(fakeInputs[2].conf.error).toBeTruthy();
      expect(component.gapInSequence).toBeTruthy();
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
