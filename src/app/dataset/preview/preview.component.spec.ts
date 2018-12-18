import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  currentDataset,
  MockDatasetService,
  MockErrorService,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService,
} from '../../_mocked';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { PreviewComponent } from '.';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

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
        { provide: DatasetsService, useClass: MockDatasetService },
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

  it('should prefill filters', (): void => {
    component.datasetData = currentDataset;
    component.previewFilters = {
      execution: mockWorkflowExecution,
      plugin: 'NORMALIZATION',
    };
    component.prefillFilters();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
  });

  it('should expand sample', (): void => {
    component.datasetData = currentDataset;
    component.previewFilters = {
      execution: mockWorkflowExecution,
      plugin: 'NORMALIZATION',
    };
    component.prefillFilters();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });

  it('should toggle filters', () => {
    component.datasetData = currentDataset;
    component.toggleFilterDate();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-date .dropdown-wrapper')).length,
    ).toBeTruthy();

    component.allPlugins = [{ type: 'NORMALIZATION', error: false }];
    component.toggleFilterPlugin();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.dropdown-plugin .dropdown-wrapper')).length,
    ).toBeTruthy();
  });

  it('should get transformed samples', () => {
    component.datasetData = currentDataset;
    component.transformSamples('default');
    fixture.detectChanges();
    expect(component.allSamples.length).not.toBe(0);
  });
});
