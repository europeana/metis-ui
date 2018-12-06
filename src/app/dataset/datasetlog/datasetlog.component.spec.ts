import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  currentWorkflow,
  MockDatasetService,
  MockTranslateService,
  MockWorkflowService,
} from '../../_mocked';
import {
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  TranslateService,
  WorkflowService,
} from '../../_services';
import { TranslatePipe } from '../../_translate';

import { DatasetlogComponent } from './datasetlog.component';

describe('DatasetlogComponent', () => {
  let component: DatasetlogComponent;
  let fixture: ComponentFixture<DatasetlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [DatasetlogComponent, TranslatePipe],
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
    fixture = TestBed.createComponent(DatasetlogComponent);
    component = fixture.componentInstance;
    component.showPluginLog = currentWorkflow.results[0].metisPlugins[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the logs', () => {
    component.returnLog();
    expect(component.logMessages).toBeTruthy();
    component.closeLog();
  });

  it('should get a from number', () => {
    component.logTo = 200;
    component.logPerStep = 100;
    fixture.detectChanges();
    expect(component.getLogFrom()).toBe(101);
  });
});
