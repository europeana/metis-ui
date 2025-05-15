import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { environment } from '../../../environments/environment';
import { XmlPipe } from '../../_helpers';
import {
  MockCodemirrorComponent,
  mockDataset,
  MockDatasetsService,
  mockHistoryVersions,
  MockSampleResource,
  MockTranslateService,
  mockWorkflowExecutionHistoryList,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import {
  PluginAvailabilityList,
  PluginType,
  PreviewFilters,
  XmlDownload,
  XmlSample
} from '../../_models';
import { SampleResource } from '../../_resources';
import { DatasetsService, WorkflowService } from '../../_services';

import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { EditorComponent } from '../';
import { MappingComponent } from '../';
import { PreviewComponent } from '.';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let router: Router;
  let workflows: WorkflowService;
  const interval = environment.intervalStatusShort;

  const previewFilterData = {
    baseFilter: {
      executionId: mockWorkflowExecutionHistoryList.executions[0].workflowExecutionId,
      pluginType: PluginType.NORMALIZATION
    },
    baseStartedDate: '111111'
  } as PreviewFilters;

  const previewFilterDataCompare = {
    ...previewFilterData,
    comparisonFilter: { pluginType: PluginType.NORMALIZATION, executionId: '1' },
    sampleRecordIds: []
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dataset/mapping/*', component: MappingComponent }
        ]),
        EditorComponent,
        PreviewComponent
      ],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: SampleResource, useClass: MockSampleResource },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValue: createMockPipe('translate') },
        { provide: XmlPipe, useValue: createMockPipe('beautifyXML') },
        { provide: RenameWorkflowPipe, useValue: createMockPipe('renameWorkflow') }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideModule(CodemirrorModule, {
        remove: { declarations: [CodemirrorComponent], exports: [CodemirrorComponent] },
        add: { declarations: [MockCodemirrorComponent], exports: [MockCodemirrorComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    component.previewFilters = { baseFilter: {} };
    router = TestBed.inject(Router);
    workflows = TestBed.inject(WorkflowService);
  };

  const getTextElement = (textContent = '"http://test.link"', classMatch = true): Element => {
    const classList = ({
      contains: (_: string): boolean => {
        return classMatch;
      },
      add: (_: string): void => undefined,
      remove: (_: string): void => undefined
    } as unknown) as DOMTokenList;

    return ({
      classList: classList,
      textContent: textContent,
      querySelectorAll: (_: string): Array<Element> => {
        return [
          ({
            classList: classList
          } as unknown) as Element
        ];
      }
    } as unknown) as Element;
  };

  const makeMouseEvent = (el: Element): MouseEvent => {
    return ({
      target: el,
      currentTarget: el
    } as unknown) as MouseEvent;
  };

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should destroy', () => {
      const testUrl = 'http://123.com';
      component.downloadUrlCache = { testUrl: testUrl };
      spyOn(component, 'cleanup');
      spyOn(URL, 'revokeObjectURL').and.callThrough();
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
      expect(component.cleanup).toHaveBeenCalled();
    });

    it('should add plugins', fakeAsync(() => {
      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.isLoadingFilter = true;

      expect(component.allPlugins.length).toBeFalsy();

      const runCheck = (): void => {
        component.addPluginsFilter(mockWorkflowExecutionHistoryList.executions[0]);
        tick(1);
        fixture.detectChanges();
        expect(component.allPlugins.length).toBeTruthy();
        expect(component.isLoadingFilter).toBeFalsy();
      };
      runCheck();
      runCheck();

      spyOn(workflows, 'getExecutionPlugins').and.callFake(() => {
        const results: PluginAvailabilityList = { plugins: [] };
        return of(results);
      });
      component.addPluginsFilter(mockWorkflowExecutionHistoryList.executions[0]);
      tick(1);
      expect(component.allPlugins.length).toBeFalsy();
      expect(component.isLoadingFilter).toBeFalsy();

      component.ngOnDestroy();
    }));

    it('should show a sample', fakeAsync((): void => {
      const selNonDefaultEditor = '.view-sample:not(.no-sample)';
      tick(0);
      fixture.detectChanges();
      expect(component.allSamples.length).toBe(0);
      expect(fixture.debugElement.queryAll(By.css(selNonDefaultEditor)).length).toBeFalsy();
      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.previewFilters = previewFilterData;
      component.prefillFilters();
      tick(1);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css(selNonDefaultEditor)).length).toBeTruthy();
      tick(0);
      component.ngOnDestroy();
    }));

    it('should show interdependent filters', fakeAsync((): void => {
      tick(0);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

      component.datasetData = mockDataset;
      tick(interval);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

      component.previewFilters = previewFilterData;
      component.historyVersions = mockHistoryVersions;
      component.prefillFilters();

      tick(1);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeTruthy();

      tick(interval);
      component.ngOnDestroy();
    }));

    it('should prefill the filters', fakeAsync((): void => {
      component.datasetData = mockDataset;
      fixture.detectChanges();
      tick(1);

      expect(component.historyVersions).toBeFalsy();
      expect(component.historyVersions).toBeFalsy();

      component.prefillFilters();
      tick(1);

      expect(component.historyVersions).toBeFalsy();
      expect(component.historyVersions).toBeFalsy();

      component.previewFilters = { baseFilter: { pluginType: PluginType.NORMALIZATION } };
      component.prefillFilters();
      tick(1);

      expect(component.allPlugins.length).toBeFalsy();
      expect(component.historyVersions).toBeFalsy();

      component.previewFilters = previewFilterData;
      component.prefillFilters();
      tick(1);
      expect(component.historyVersions).toBeTruthy();
      expect(component.allPlugins.length).toBeTruthy();

      const searchTerm = 'mySearchTerm';
      const previewFilterDataSearch = structuredClone(previewFilterData);

      previewFilterDataSearch.searchedRecordId = searchTerm;
      component.previewFilters = { baseFilter: {} };
      component.prefillFilters();
      tick(1);
      expect(component.searchTerm).toBeFalsy();

      component.previewFilters = previewFilterDataSearch;
      component.prefillFilters();
      tick(1);
      expect(component.searchTerm).toEqual(searchTerm);

      component.ngOnDestroy();
      tick(1);
    }));

    it('should expand a sample', fakeAsync((): void => {
      fixture.detectChanges();
      component.datasetData = mockDataset;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.previewFilters = previewFilterData;
      component.prefillFilters();
      component.tempXSLT = (undefined as unknown) as string;
      tick(1);
      component.expandedSample = undefined;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      fixture.detectChanges();
      tick(1);
      component.ngOnDestroy();
    }));

    it('should expand the searched sample', (): void => {
      expect(component.searchedXMLSampleExpanded).toBeFalsy();
      component.expandSearchSample();
      expect(component.searchedXMLSampleExpanded).toBeTruthy();
    });

    it('should collapse an expanded sample', fakeAsync((): void => {
      tick(interval);
      fixture.detectChanges();

      component.datasetData = mockDataset;
      tick(interval);
      fixture.detectChanges();
      component.previewFilters = previewFilterData;
      component.prefillFilters();
      component.tempXSLT = (undefined as unknown) as string;
      tick(interval);
      component.expandedSample = undefined;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      tick(interval);
      component.ngOnDestroy();
    }));

    it('should automatically expand single samples', fakeAsync(() => {
      expect(component.expandedSample).toEqual(undefined);

      component.getXMLSamples(PluginType.NORMALIZATION, true);
      tick(1);
      expect(component.expandedSample).toEqual(undefined);

      // set filter data
      component.previewFilters = previewFilterData;
      component.getXMLSamples(PluginType.NORMALIZATION, true);
      tick(1);
      expect(component.expandedSample).toEqual(0);

      // reset
      component.expandedSample = undefined;

      spyOn(workflows, 'getWorkflowSamples').and.callFake(() => {
        const results: Array<XmlSample> = [];
        return of(results);
      });

      expect(component.expandedSample).toEqual(undefined);
      component.getXMLSamples(PluginType.NORMALIZATION);
      tick(1);
      expect(component.expandedSample).toEqual(undefined);
    }));

    it('should show a sample comparison', fakeAsync(() => {
      tick(1);
      fixture.detectChanges();
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterDataCompare;
      component.historyVersions = mockHistoryVersions;
      tick(interval);
      fixture.detectChanges();
      expect(component.previewFilters.sampleRecordIds).toBeTruthy();
      expect(component.allSampleComparisons.length).toBeFalsy();

      spyOn(component.setPreviewFilters, 'emit');
      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123', true);
      tick(interval);
      fixture.detectChanges();
      expect(component.setPreviewFilters.emit).not.toHaveBeenCalled();

      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123', false);
      tick(1);
      fixture.detectChanges();
      expect(component.setPreviewFilters.emit).toHaveBeenCalled();

      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123');
      tick(1);
      fixture.detectChanges();

      expect(component.setPreviewFilters.emit).toHaveBeenCalledTimes(2);
      component.ngOnDestroy();
    }));

    it('should search for a sample', (): void => {
      expect(component.searchedXMLSample).toBeFalsy();

      component.searchXMLSample('abc');
      expect(component.searchedXMLSample).toBeFalsy();

      component.previewFilters.baseFilter.executionId = 'A';
      component.searchXMLSample('abc');
      expect(component.searchedXMLSample).toBeFalsy();

      component.previewFilters.baseFilter.pluginType = PluginType.NORMALIZATION;
      component.searchXMLSample('abc');
      expect(component.searchedXMLSample).toBeTruthy();
      expect(component.searchError).toBeFalsy();

      component.searchXMLSample('zero');
      expect(component.searchError).toBeTruthy();
    });

    it('should get the comparison for the searched sample', fakeAsync((): void => {
      const term = 'abc';
      const baseFilter = {
        executionId: 'A',
        pluginType: PluginType.NORMALIZATION
      };
      const comparisonFilter = {
        executionId: 'B',
        pluginType: PluginType.VALIDATION_INTERNAL
      };
      spyOn(workflows, 'searchWorkflowRecordsById').and.callThrough();
      expect(component.searchedXMLSampleCompare).toBeFalsy();

      component.searchXMLSample(term, true);
      tick(1);
      expect(component.searchedXMLSample).toBeFalsy();
      expect(component.searchedXMLSampleCompare).toBeFalsy();
      expect(workflows.searchWorkflowRecordsById).not.toHaveBeenCalled();

      component.previewFilters.baseFilter = baseFilter;
      component.previewFilters.comparisonFilter = comparisonFilter;

      component.searchXMLSample(term);
      tick(1);
      expect(component.searchedXMLSample).toBeTruthy();
      expect(component.searchedXMLSampleCompare).toBeFalsy();
      expect(workflows.searchWorkflowRecordsById).toHaveBeenCalledWith(
        baseFilter.executionId,
        baseFilter.pluginType,
        term
      );

      component.searchXMLSample(term, true);
      tick(1);
      expect(component.searchedXMLSample).toBeTruthy();
      expect(component.searchedXMLSampleCompare).toBeTruthy();
      expect(workflows.searchWorkflowRecordsById).toHaveBeenCalledWith(
        comparisonFilter.executionId,
        comparisonFilter.pluginType,
        term
      );
    }));

    it('should toggle filters', fakeAsync(() => {
      tick(1);
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length
      ).toBeFalsy();
      component.datasetData = mockDataset;
      tick(1);
      fixture.detectChanges();
      component.toggleFilterDate();
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length
      ).toBeTruthy();

      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-plugin .dropdown-wrapper')).length
      ).toBeFalsy();
      component.allPlugins = [{ type: PluginType.NORMALIZATION, error: false }];
      component.toggleFilterPlugin();
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-plugin .dropdown-wrapper')).length
      ).toBeTruthy();

      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-compare .dropdown-wrapper')).length
      ).toBeFalsy();
      component.historyVersions = mockHistoryVersions;
      component.toggleFilterCompare();
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('.dropdown-compare .dropdown-wrapper')).length
      ).toBeTruthy();
      component.ngOnDestroy();
    }));

    it('should get the comparison by index', () => {
      expect(component.getComparisonSampleAtIndex(1)).toBeFalsy();
      component.allSampleComparisons = [({} as unknown) as XmlDownload];
      expect(component.getComparisonSampleAtIndex(0)).toBeTruthy();
    });

    it('should go to the mapping', () => {
      spyOn(router, 'navigate');
      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.gotoMapping();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should handle mouse events', () => {
      const element = getTextElement();
      const elementNoText = getTextElement('');

      const mouseEvent = makeMouseEvent(element);
      const mouseEventNoText = makeMouseEvent(elementNoText);

      spyOn(element.classList, 'add');
      spyOn(element.classList, 'remove');

      component.handleMouseOut(mouseEventNoText);

      expect(element.classList.remove).not.toHaveBeenCalled();
      expect(element.classList.add).not.toHaveBeenCalled();

      component.handleMouseOut(mouseEvent);

      expect(element.classList.remove).toHaveBeenCalled();
      expect(element.classList.add).not.toHaveBeenCalled();

      component.handleMouseOver(mouseEvent);
      expect(element.classList.add).toHaveBeenCalledTimes(1);

      component.handleMouseOver(mouseEventNoText);
      expect(element.classList.add).toHaveBeenCalledTimes(1);
    });

    it('should open links in a new tab', () => {
      spyOn(window, 'open');
      const testMouseEvent = makeMouseEvent(getTextElement());
      component.handleCodeClick(testMouseEvent);
      expect(window.open).toHaveBeenCalled();
    });

    it('should extract the link from the element', () => {
      spyOn(window, 'open');
      const testText = 'https://hello';
      const el = getTextElement('');
      const ev = makeMouseEvent(el);

      component.handleCodeClick(ev);
      expect(window.open).not.toHaveBeenCalled();

      el.textContent = testText;
      component.handleCodeClick(ev);
      expect(window.open).not.toHaveBeenCalled();

      el.textContent = `"${testText}"`;
      component.handleCodeClick(ev);
      expect(window.open).toHaveBeenCalledTimes(1);

      component.handleCodeClick(makeMouseEvent(getTextElement('', false)));
      expect(window.open).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors filtering on execution', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.isLoadingFilter = true;
      expect(component.isLoading()).toBeTruthy();
      component.addExecutionsFilter();
      tick(1);
      expect(component.isLoading()).toBeFalsy();
    }));

    it('should handle errors filtering on plugins', fakeAsync(() => {
      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.isLoadingFilter = true;
      expect(component.isLoading()).toBeTruthy();
      component.addPluginsFilter(mockWorkflowExecutionHistoryList.executions[0]);
      tick(1);
      fixture.detectChanges();
      expect(component.isLoading()).toBeFalsy();
      component.ngOnDestroy();
      tick(1);
    }));

    it('should handle errors getting the XML samples', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterData;

      fixture.detectChanges();
      component.isLoadingSamples = true;
      component.getXMLSamples(PluginType.NORMALIZATION);
      tick(1);
      fixture.detectChanges();
      expect(component.isLoadingSamples).toBeFalsy();
      expect(component.notification).toBeTruthy();
      component.ngOnDestroy();
      tick(1);
    }));

    it('should handle errors showing the sample comparison', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterDataCompare;
      component.historyVersions = mockHistoryVersions;
      component.isLoadingSamples = true;
      fixture.detectChanges();
      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123', false);
      tick(1);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-compared')).length).toBe(0);
      expect(component.notification).toBeTruthy();
      expect(component.isLoadingSamples).toBeFalsy();
      component.ngOnDestroy();
      tick(1);
    }));

    it('should handle errors searching for a sample', (): void => {
      expect(component.searchedXMLSample).toBeFalsy();
      expect(component.searchError).toBeFalsy();
      component.previewFilters.baseFilter.executionId = 'A';
      component.previewFilters.baseFilter.pluginType = PluginType.NORMALIZATION;
      component.searchXMLSample('abc123');
      expect(component.searchedXMLSample).toBeFalsy();
      expect(component.notification).toBeTruthy();
    });

    it('should handle errors getting the sample comparison', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterDataCompare;
      component.historyVersions = mockHistoryVersions;
      tick(1);
      fixture.detectChanges();
      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123', true);
      tick(1);
      fixture.detectChanges();
      expect(component.allSampleComparisons.length).toBeFalsy();
      component.ngOnDestroy();
    }));
  });
});
