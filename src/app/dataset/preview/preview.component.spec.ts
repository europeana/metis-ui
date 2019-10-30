import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subscription } from 'rxjs';

import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  mockHistoryVersions,
  MockTranslateService,
  mockWorkflowExecutionHistoryList,
  MockWorkflowService
} from '../../_mocked';
import { PluginType, PreviewFilters, XmlSample } from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { PreviewComponent } from '.';

function getUnsubscribable(undef?: boolean): Subscription {
  return (undef
    ? undefined
    : ({
        unsubscribe: jasmine.createSpy('unsubscribe')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as Subscription;
}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;
  let router: Router;

  const previewFilterData = {
    executionId: mockWorkflowExecutionHistoryList.executions[0].workflowExecutionId,
    pluginType: PluginType.NORMALIZATION,
    startedDate: '111111'
  } as PreviewFilters;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        PreviewComponent,
        createMockPipe('translate'),
        createMockPipe('beautifyXML'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    component.previewFilters = {};
    router = TestBed.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a sample', fakeAsync((): void => {
    tick(0);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeFalsy();
    component.datasetData = mockDataset;
    fixture.detectChanges();
    component.previewFilters = previewFilterData;
    component.prefillFilters();
    tick(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
    component.pluginsFilterTimer.unsubscribe();
    component.executionsFilterTimer.unsubscribe();
  }));

  it('should show interdependent filters', fakeAsync((): void => {
    tick(0);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

    component.datasetData = mockDataset;
    tick(0);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

    component.previewFilters = previewFilterData;
    component.historyVersions = mockHistoryVersions;
    component.prefillFilters();

    tick(0);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeTruthy();

    component.pluginsFilterTimer.unsubscribe();
    component.executionsFilterTimer.unsubscribe();
  }));

  it('should unsubscribe the filters', (): void => {
    const s1 = getUnsubscribable();
    const s2 = getUnsubscribable();

    component.unsubscribeFilters([s1, s2]);

    expect(s1.unsubscribe).toHaveBeenCalled();
    expect(s2.unsubscribe).toHaveBeenCalled();

    const s3 = getUnsubscribable(true);
    const s4 = getUnsubscribable();
    component.unsubscribeFilters([s3, s4]);

    expect(s3).toBeFalsy();
    expect(s4.unsubscribe).toHaveBeenCalled();
  });

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
    component.pluginsFilterTimer.unsubscribe();
    component.executionsFilterTimer.unsubscribe();
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
    component.pluginsFilterTimer.unsubscribe();
    component.executionsFilterTimer.unsubscribe();
  }));

  it('should show sample comparison', () => {
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBe(0);
    component.datasetData = mockDataset;
    component.previewFilters = previewFilterData;
    component.historyVersions = mockHistoryVersions;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBe(1);

    expect(fixture.debugElement.queryAll(By.css('.view-sample-compared')).length).toBe(0);
    component.getXMLSamplesCompare(PluginType.NORMALIZATION, '123');
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-compared')).length).toBe(1);
    component.pluginsFilterTimer.unsubscribe();
  });

  it('should toggle filters', fakeAsync(() => {
    tick(0);
    fixture.detectChanges();

    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length
    ).toBeFalsy();
    component.datasetData = mockDataset;
    tick(0);
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
    component.executionsFilterTimer.unsubscribe();
  }));

  it('should get transformed samples', () => {
    component.datasetData = mockDataset;
    component.transformSamples('default');
    fixture.detectChanges();
    expect(component.allSamples.length).not.toBe(0);
  });

  it('provides links to transformed samples', () => {
    component.datasetData = mockDataset;
    expect(fixture.debugElement.query(By.css('.preview-controls button'))).toBeFalsy();
    component.tempXSLT = 'hello';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.preview-controls button'))).toBeTruthy();
  });

  it('toggles the editor theme', () => {
    component.datasetData = mockDataset;
    fixture.detectChanges();
    expect(component.editorConfig.theme).toEqual('default');
    component.transformSamples('default');
    fixture.detectChanges();
    component.onThemeSet(false);
    expect(component.editorConfig.theme).not.toEqual('default');
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

  it('should open links in a new tab', () => {
    spyOn(window, 'open');
    const testMouseEvent = ({
      target: {
        classList: {
          contains: (): boolean => {
            return true;
          }
        },
        textContent: '"http://test.link"'
      }
    } as unknown) as MouseEvent;
    component.handleCodeClick(testMouseEvent);
    expect(window.open).toHaveBeenCalled();
  });
});
