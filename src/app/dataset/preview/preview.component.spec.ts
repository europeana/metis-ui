import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  mockHistoryVersions,
  MockTranslateService,
  mockWorkflowExecutionHistoryList,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import {
  PluginAvailabilityList,
  PluginType,
  PreviewFilters,
  Results,
  WorkflowExecution,
  XmlSample
} from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { PreviewComponent } from '.';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let router: Router;
  let workflows: WorkflowService;

  const previewFilterData = {
    basic: {
      executionId: mockWorkflowExecutionHistoryList.executions[0].workflowExecutionId,
      pluginType: PluginType.NORMALIZATION
    },
    startedDate: '111111'
  } as PreviewFilters;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        PreviewComponent,
        createMockPipe('translate'),
        createMockPipe('beautifyXML'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    component.previewFilters = { basic: {}, comparison: {} };
    router = TestBed.get(Router);
    workflows = TestBed.get(WorkflowService);
  };

  const getTextElement = (textContent = '"http://test.link"', classMatch = true): Element => {
    const classList = ({
      contains: (_: string): boolean => {
        return classMatch;
      },
      add: (_: string): void => {},
      remove: (_: string): void => {}
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
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

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
      component.ngOnDestroy();
    }));

    it('should show interdependent filters', fakeAsync((): void => {
      tick(0);
      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
      expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

      component.datasetData = mockDataset;
      tick(1);
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

      component.ngOnDestroy();
    }));

    it('should expand a sample', fakeAsync((): void => {
      tick(0);
      fixture.detectChanges();

      component.datasetData = mockDataset;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.previewFilters = previewFilterData;
      component.prefillFilters();
      component.tempXSLT = undefined;
      tick(1);
      component.expandedSample = undefined;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      fixture.detectChanges();
      component.ngOnDestroy();
    }));

    it('should collapse an expanded sample', fakeAsync((): void => {
      tick(0);
      fixture.detectChanges();

      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.previewFilters = previewFilterData;
      component.prefillFilters();
      component.tempXSLT = undefined;
      tick(1);
      component.expandedSample = undefined;
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      component.expandSample(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
      component.ngOnDestroy();
    }));

    it('should automatically expand single samples', fakeAsync(() => {
      expect(component.expandedSample).toEqual(undefined);
      component.getXMLSamples(PluginType.NORMALIZATION, false);
      tick(1);
      expect(component.expandedSample).toEqual(0);

      // reset
      component.expandedSample = undefined;

      spyOn(workflows, 'getWorkflowSamples').and.callFake(() => {
        const results: Array<XmlSample> = [];
        return of(results);
      });

      expect(component.expandedSample).toEqual(undefined);
      component.getXMLSamples(PluginType.NORMALIZATION, false);
      tick(1);
      expect(component.expandedSample).toEqual(undefined);
    }));

    it('should show sample comparison', fakeAsync(() => {
      expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBe(0);
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterData;
      component.historyVersions = mockHistoryVersions;
      tick(0);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBe(1);
      expect(fixture.debugElement.queryAll(By.css('.view-sample-compared')).length).toBe(0);
      component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123', false);
      tick(1);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.view-sample-compared')).length).toBe(1);
      component.ngOnDestroy();
    }));

    it('should toggle filters', fakeAsync(() => {
      tick(0);
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

    it('should get transformed samples', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.transformSamples('default');
      tick(2);
      fixture.detectChanges();
      expect(component.allSamples.length).not.toBe(0);

      spyOn(workflows, 'getFinishedDatasetExecutions').and.callFake(() => {
        const results: Results<WorkflowExecution> = {
          results: [],
          listSize: 0,
          nextPage: 0
        };
        return of(results);
      });

      component.allSamples = [];
      component.transformSamples('default');
      tick(1);
      fixture.detectChanges();
      expect(component.allSamples.length).toBe(0);

      component.ngOnDestroy();
      tick(1);
    }));

    it('provides links to transformed samples', fakeAsync(() => {
      const selBtn = '.preview-controls button';
      component.datasetData = mockDataset;
      expect(fixture.debugElement.query(By.css(selBtn))).toBeFalsy();
      component.tempXSLT = 'hello';
      component.ngOnInit();
      tick(2);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(selBtn))).toBeTruthy();
      component.ngOnDestroy();
      tick(1);
    }));

    it('toggles the editor theme', () => {
      component.datasetData = mockDataset;
      fixture.detectChanges();
      expect(component.editorConfig.theme).toEqual('default');
      component.transformSamples('default');
      fixture.detectChanges();

      component.onThemeSet(false);
      expect(component.editorConfig.theme).not.toEqual('default');
      component.onThemeSet(false);
      expect(component.editorConfig.theme).not.toEqual('default');

      component.onThemeSet(true);
      expect(component.editorConfig.theme).toEqual('default');
      component.onThemeSet(true);
      expect(component.editorConfig.theme).toEqual('default');
    });

    it('has utility to strip blank lines', () => {
      const samples = [
        {
          xmlRecord: '\n\r'
        }
      ] as XmlSample[];

      const res: XmlSample[] = component.undoNewLines(samples);
      expect(res[0].xmlRecord).toEqual('');
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
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

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

    it('should handle errors getting the XML comparisons', fakeAsync(() => {
      component.datasetData = mockDataset;
      fixture.detectChanges();
      component.isLoadingSamples = true;
      component.getXMLSamples(PluginType.NORMALIZATION, false);
      tick(1);
      fixture.detectChanges();
      expect(component.isLoadingSamples).toBeFalsy();
      expect(component.notification).toBeTruthy();
      component.ngOnDestroy();
      tick(1);
    }));

    it('should handle errors showing the sample comparison', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.previewFilters = previewFilterData;
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

    it('should handle errors transforming the samples', fakeAsync(() => {
      component.datasetData = mockDataset;
      component.isLoadingTransformSamples = true;
      component.transformSamples('default');
      tick(1);
      fixture.detectChanges();
      expect(component.allSamples.length).toBe(0);
      expect(component.isLoadingTransformSamples).toBeFalsy();
      expect(component.isLoading()).toBeFalsy();
      component.ngOnDestroy();
      tick(1);
    }));
  });
});
