import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  mockHistoryVersions,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService,
} from '../../_mocked';
import { PluginType, XmlSample } from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { PreviewFilters } from '../dataset.component';

import { PreviewComponent } from '.';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  const previewFilterData = {
    execution: mockWorkflowExecution,
    plugin: 'NORMALIZATION',
    startedDate: '111111',
  } as PreviewFilters;

  const previewFilterDataBasic = {
    execution: mockWorkflowExecution,
  } as PreviewFilters;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        PreviewComponent,
        createMockPipe('translate'),
        createMockPipe('beautifyXML'),
        createMockPipe('renameWorkflow'),
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    component.previewFilters = {};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a sample', (): void => {
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeFalsy();
    component.datasetData = mockDataset;
    component.previewFilters = previewFilterData;
    component.prefillFilters();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
  });

  it('should show interdependent filters', (): void => {
    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

    component.datasetData = mockDataset;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeFalsy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

    component.previewFilters = previewFilterDataBasic;
    component.prefillFilters();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeFalsy();

    component.historyVersions = mockHistoryVersions;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-date')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-plugin')).length).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.dropdown-compare')).length).toBeTruthy();
  });

  it('should expand sample', (): void => {
    component.datasetData = mockDataset;
    component.previewFilters = previewFilterData;
    component.prefillFilters();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });

  it('should collapse an expanded sample', (): void => {
    component.datasetData = mockDataset;
    component.previewFilters = previewFilterData;
    component.prefillFilters();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeFalsy();
  });

  it('should show sample comparison', (): void => {
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
  });

  it('should toggle filters', () => {
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length,
    ).toBeFalsy();
    component.datasetData = mockDataset;
    component.toggleFilterDate();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length,
    ).toBeTruthy();

    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-plugin .dropdown-wrapper')).length,
    ).toBeFalsy();
    component.allPlugins = [{ type: PluginType.NORMALIZATION, error: false }];
    component.toggleFilterPlugin();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-plugin .dropdown-wrapper')).length,
    ).toBeTruthy();

    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-compare .dropdown-wrapper')).length,
    ).toBeFalsy();
    component.historyVersions = mockHistoryVersions;
    component.toggleFilterCompare();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-compare .dropdown-wrapper')).length,
    ).toBeTruthy();
  });

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
        xmlRecord: '\n\r',
      },
    ] as XmlSample[];

    const res: XmlSample[] = component.undoNewLines(samples);
    expect(res[0].xmlRecord).toEqual('');
  });
});
