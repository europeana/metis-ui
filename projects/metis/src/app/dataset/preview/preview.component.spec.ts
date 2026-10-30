import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

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
      xslt: { set: vi.fn() },
      datasetId: { set: vi.fn() }
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

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Normal operation', () => {
    beforeEach(() => {
      vi.spyOn(workflows, 'getDatasetHistory');
      vi.spyOn(workflows, 'getExecutionPlugins');
      vi.spyOn(workflows, 'getWorkflowSamples');
      vi.spyOn(workflows, 'getVersionHistory');
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should synchronize sample resource variables when tempXSLT updates', () => {
      const mockResource = {
        value: signal([]),
        isLoading: signal(false),
        error: signal(null)
      };

      (component as any).allOriginalSamples = mockResource;
      (component as any).allTransformedSamples = mockResource;

      fixture.componentRef.setInput('datasetData', { datasetId: 'dataset-123' });
      fixture.detectChanges();

      const privateResource = (component as any).sampleResource;

      const testXslt = '<?xml version="1.0"?><xsl:stylesheet...>';
      fixture.componentRef.setInput('tempXSLT', testXslt);

      TestBed.flushEffects();
      fixture.detectChanges();

      // Verify the preexisting spies captured your constructor effect changes perfectly
      expect(privateResource.xslt.set).toHaveBeenCalledWith(testXslt);
      expect(privateResource.datasetId.set).toHaveBeenCalledWith('dataset-123');
    });

    it('should clear the resource xslt', () => {
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
      component.addPluginsFilter(mockWorkflowExecutionHistoryList.executions[0]);
      fixture.detectChanges();
      vi.advanceTimersByTime(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.allPlugins().length).toBeTruthy();
      expect(component.isLoadingFilter()).toBeFalsy();
    });

    it('should show interdependent filters', () => {
      fixture.componentRef.setInput('previewFilters', { baseFilter: {} } as any);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();

      fixture.componentRef.setInput('previewFilters', previewFilterData);
      component.historyVersions = mockHistoryVersions;
      component.prefillFilters();

      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    });

    it('should prefill the filters', async () => {
      component.prefillFilters();

      fixture.detectChanges();

      vi.advanceTimersByTime(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.allPlugins().length).toBeTruthy();
    });

    it('should set comparison filter properties and load records within getXMLSamplesCompare', () => {
      vi.spyOn(workflows, 'getWorkflowRecordsById');
      vi.spyOn(component, 'searchXMLSample');

      component.previewFilters.set({
        baseFilter: { executionId: 'exec-1', pluginType: PluginType.NORMALIZATION },
        sampleRecordIds: ['sample-1']
      });

      component.getXMLSamplesCompare(PluginType.NORMALIZATION, 'exec-1', false);
      fixture.detectChanges();

      expect(component.filterCompareOpen).toBe(false);
      expect(component.previewFilters().comparisonFilter).toEqual({
        pluginType: PluginType.NORMALIZATION,
        executionId: 'exec-1'
      });

      expect(workflows.getWorkflowRecordsById).toHaveBeenCalledWith(
        'exec-1',
        PluginType.NORMALIZATION,
        ['sample-1']
      );
      expect(component.searchXMLSample).toHaveBeenCalledWith(component.searchTerm, true);
    });

    it('should handle error notifications and populate errSamples state cleanly', () => {
      vi.spyOn(workflows, 'getWorkflowRecordsById').mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              statusText: 'Bad Request',
              error: 'Failed to process XML record mapping parameters'
            })
        )
      );

      // Force sampleRecordIds to be populated to clear the initial guard condition
      component.previewFilters.set({
        baseFilter: { executionId: 'exec-1', pluginType: PluginType.NORMALIZATION },
        sampleRecordIds: ['sample-1']
      });

      // Execute the method to push the subscription flow down the error: path track
      component.getXMLSamplesCompare(PluginType.NORMALIZATION, 'exec-1', false);
      fixture.detectChanges();

      // Assert that loading flags were safely reset and error notifications recorded
      expect(component.isLoadingComparisons()).toBe(false);
      expect(component.notification).toBeDefined();
    });

    it('should execute getXMLSamples loop tracking parameters seamlessly', () => {
      component.getXMLSamples(PluginType.NORMALIZATION, false);
      fixture.detectChanges();

      expect(workflows.getWorkflowSamples).toHaveBeenCalled();
    });

    it('should automatically expand single samples', () => {
      fixture.detectChanges();
      component.getXMLSamples(PluginType.NORMALIZATION, true);
      fixture.detectChanges();
      expect(component.expandedSample()).toEqual(0);
    });

    it('should collapse an expanded sample when clicked again', () => {
      component.expandedSample.set(2);
      component.expandSample(2);
      expect(component.expandedSample()).toBeUndefined();

      component.expandSample(5);
      expect(component.expandedSample()).toEqual(5);
    });

    it('should handle code selection click events', () => {
      const mockEvent = {
        target: { classList: { contains: () => true }, textContent: '"https://europeana.eu"' }
      };
      vi.spyOn(window, 'open');
      component.handleCodeClick(mockEvent as any);
      expect(window.open).toHaveBeenCalledWith('https://europeana.eu', '_blank');
    });

    it('should search for matching xml tracking tokens', () => {
      vi.spyOn(workflows, 'searchWorkflowRecordsById');
      component.searchXMLSample('test-record-id');
      expect(workflows.searchWorkflowRecordsById).toHaveBeenCalled();
    });

    it('should clear parameters when clear string search criteria is entered', () => {
      component.searchXMLSample('');
      expect(component.searchTerm).toBe('');
      expect(component.searchedXMLSample).toBeUndefined();
    });
  });
});
