import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';
import {
  MockDatasetService,
  MockWorkflowService,
  currentWorkflow,
  currentDataset,
  MockTranslateService,
} from '../../_mocked';

import { PreviewComponent } from './preview.component';
import {
  WorkflowService,
  TranslateService,
  ErrorService,
  RedirectPreviousUrl,
  DatasetsService,
} from '../../_services';

import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslatePipe, RenameWorkflowPipe } from '../../_translate';
import { XmlPipe } from '../../_helpers';

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
      execution: currentWorkflow['results'][0],
      plugin: 'MOCKED',
    };
    component.prefillFilters();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample')).length).toBeTruthy();
  });

  it('should expand sample', (): void => {
    component.datasetData = currentDataset;
    component.previewFilters = {
      execution: currentWorkflow['results'][0],
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
