import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CodemirrorModule } from 'ng2-codemirror';

import { XmlPipe } from '../../_helpers';
import {
  currentDataset,
  currentWorkflow,
  MockDatasetService,
  MockTranslateService,
  MockWorkflowService,
} from '../../_mocked';
import {
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  WorkflowService,
} from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { PreviewComponent } from './preview.component';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, CodemirrorModule],
      declarations: [PreviewComponent, TranslatePipe, XmlPipe, RenameWorkflowPipe],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetService },
        ErrorService,
        RedirectPreviousUrl,
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
      execution: currentWorkflow.results[0],
      plugin: 'MOCKED',
    };
    component.prefillFilters();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
  });

  it('should expand sample', (): void => {
    component.datasetData = currentDataset;
    component.previewFilters = {
      execution: currentWorkflow.results[0],
      plugin: 'MOCKED',
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

    component.allPlugins = [{ type: 'mocked', error: false }];
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
