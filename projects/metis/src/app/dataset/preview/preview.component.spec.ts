import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { PreviewComponent } from './preview.component';
import { EditorComponent } from '../editor';
import { NotificationComponent } from '../../shared';
import { WorkflowService } from '../../_services';
import { SampleResource } from '../../_resources';
import {
  EditorSafeXmlPipe,
  RenameWorkflowPipe,
  TranslatePipe,
  TranslateService,
  XmlPipe
} from '../../_translate';
import {
  Dataset,
  HistoryVersion,
  PluginType,
  PreviewFilters,
  WorkflowExecutionHistoryList,
  XmlSample
} from '../../_models';

@Component({
  selector: 'app-editor',
  template: '<div>Mock Editor</div>',
  standalone: true
})
class MockEditorComponent {}

@Component({
  selector: 'app-notification',
  template: '<div>Mock Notification</div>',
  standalone: true
})
class MockNotificationComponent {}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let workflows: WorkflowService;
  let sampleResource: SampleResource;

  const mockDataset: Dataset = { datasetId: '123', datasetName: 'Mock Test Dataset' } as any;

  const previewFilterData: PreviewFilters = {
    baseFilter: { executionId: 'exec-1', pluginType: PluginType.NORMALIZATION },
    baseStartedDate: '2026-08-31T12:00:00Z',
    sampleRecordIds: ['sample-1']
  };

  const mockHistoryVersions: Array<HistoryVersion> = [
    { workflowExecutionId: 'exec-1', pluginType: PluginType.NORMALIZATION }
  ];

  const mockWorkflowExecutionHistoryList: WorkflowExecutionHistoryList = {
    executions: [{ workflowExecutionId: 'exec-1', startedDate: '2026-08-31T12:00:00Z' }]
  };

  const mockXmlSamples: XmlSample[] = [{ ecloudId: 'sample-1', xmlRecord: '<xml>Test</xml>' }];

  const createMockPipe = () => ({ transform: (v: any) => v });

  beforeEach(async () => {
    const mockWorkflowService = {
      getDatasetHistory: () => of(mockWorkflowExecutionHistoryList),
      getExecutionPlugins: () =>
        of({
          plugins: [{ pluginType: PluginType.NORMALIZATION, canDisplayRawXml: true }]
        }),
      getWorkflowSamples: () => of(mockXmlSamples),
      getVersionHistory: () => of(mockHistoryVersions),
      searchWorkflowRecordsById: () => of({ ecloudId: 'sample-1', xmlRecord: '<xml></xml>' }),
      getWorkflowRecordsById: () => of(mockXmlSamples)
    };

    const mockSampleResource = {
      transformedSamples: { isLoading: () => false },
      originalSamples: signal([]),
      transformationUnavailable: signal(false),
      httpError: signal(null),
      xslt: { set: jasmine.createSpy('set') },
      datasetId: { set: jasmine.createSpy('set') }
    };

    const mockTranslate = {
      instant: (key: string) => key
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PreviewComponent],
      providers: [
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: SampleResource, useValue: mockSampleResource },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: TranslatePipe, useValue: createMockPipe() },
        { provide: XmlPipe, useValue: createMockPipe() },
        { provide: RenameWorkflowPipe, useValue: createMockPipe() },
        { provide: EditorSafeXmlPipe, useValue: createMockPipe() }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(PreviewComponent, {
        remove: { imports: [NotificationComponent, EditorComponent] },
        add: { imports: [MockNotificationComponent, MockEditorComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    workflows = TestBed.inject(WorkflowService);
    sampleResource = TestBed.inject(SampleResource);

    fixture.componentRef.setInput('datasetData', mockDataset);
    fixture.componentRef.setInput('previewFilters', previewFilterData);
  });

  describe('Normal operation', () => {
    beforeEach(() => {
      spyOn(workflows, 'getDatasetHistory').and.callThrough();
      spyOn(workflows, 'getExecutionPlugins').and.callThrough();
      spyOn(workflows, 'getWorkflowSamples').and.callThrough();
      spyOn(workflows, 'getVersionHistory').and.callThrough();
    });

    it('should create', () => {
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should clear the resource xslt', () => {
      TestBed.flushEffects();
      fixture.detectChanges();
      component.clearTransformation();
      expect(sampleResource.xslt.set).toHaveBeenCalledWith('');
    });

    it('should expand the searched sample', () => {
      expect(component.searchedXMLSampleExpanded).toBeFalsy();
      component.expandSearchSample();
      expect(component.searchedXMLSampleExpanded).toBeTruthy();
    });

    it('should add plugins', async () => {
      // Trigger initial reactive lifecycle paths
      component.ngOnInit();
      TestBed.flushEffects();

      const executions = mockWorkflowExecutionHistoryList.executions;
      component.isLoadingFilter = true;

      // Fire execution state modifications
      component.addPluginsFilter(executions[0]);

      // Synchronously compute active Signal effects loops
      TestBed.flushEffects();

      // Clear the micro-task boundary safely
      await Promise.resolve();

      expect(component.allPlugins().length).toBeTruthy();
      expect(component.isLoadingFilter).toBeFalsy();
    });

    it('should show interdependent filters', () => {
      fixture.componentRef.setInput('previewFilters', { baseFilter: {} } as any);
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();

      fixture.componentRef.setInput('previewFilters', previewFilterData);
      component.historyVersions = mockHistoryVersions;
      component.prefillFilters();

      TestBed.flushEffects();
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    });

    it('should prefill the filters', async () => {
      component.ngOnInit();
      TestBed.flushEffects();

      component.historyVersions = mockHistoryVersions;
      component.prefillFilters();

      TestBed.flushEffects();

      await Promise.resolve();

      expect(component.historyVersions).toBeTruthy();
      expect(component.allPlugins().length).toBeTruthy();
    });

    it('should automatically expand single samples', () => {
      TestBed.flushEffects();
      fixture.detectChanges();

      component.getXMLSamples(PluginType.NORMALIZATION, true);
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component.expandedSample).toEqual(0);
    });

    it('should collapse an expanded sample when clicked again', () => {
      component.expandedSample = 2;
      component.expandSample(2);
      expect(component.expandedSample).toBeUndefined();

      component.expandSample(5);
      expect(component.expandedSample).toEqual(5);
    });

    it('should handle code selection click events', () => {
      const mockEvent = {
        target: { classList: { contains: () => true }, textContent: '"https://europeana.eu"' }
      };
      spyOn(window, 'open');
      component.handleCodeClick(mockEvent as any);
      expect(window.open).toHaveBeenCalledWith('https://europeana.eu', '_blank');
    });

    it('should search for matching xml tracking tokens', () => {
      spyOn(workflows, 'searchWorkflowRecordsById').and.callThrough();
      component.searchXMLSample('test-record-id');
      expect(workflows.searchWorkflowRecordsById).toHaveBeenCalled();
    });

    it('should clear parameters when clearing search constraints', () => {
      component.searchXMLSample('');
      expect(component.searchedXMLSample).toBeUndefined();
      expect(component.searchError).toBeFalsy();
    });

    it('should trigger mouse link highlights', () => {
      const mockEl = document.createElement('div');
      mockEl.classList.add('cm-string');
      mockEl.textContent = '"https://test.link"';

      const mockContainer = document.createElement('div');
      mockContainer.appendChild(mockEl);

      const mockEvent = { target: mockEl, currentTarget: mockContainer };
      component.handleMouseOver(mockEvent as any);
      expect(mockEl.classList.contains('link-active')).toBeTruthy();

      component.handleMouseOut(mockEvent as any);
      expect(mockEl.classList.contains('link-active')).toBeFalsy();
    });

    it('should map collection identity tracks', () => {
      const dummyRecord = { id: 'test-identity-node' };
      const out = component.byId(0, dummyRecord as any);
      expect(out).toEqual('test-identity-node');
    });
  });
});
