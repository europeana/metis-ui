import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetComponent } from './dataset.component';

import { By } from '@angular/platform-browser';

import {
  DatasetsService,
  TranslateService,
  ErrorService,
  AuthenticationService,
  RedirectPreviousUrl,
  WorkflowService,
} from '../_services';
import {
  MockDatasetService,
  MockWorkflowService,
  MockAuthenticationService,
  MockTranslateService,
  currentWorkflow,
} from '../_mocked';

import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslatePipe } from '../_translate';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      declarations: [DatasetComponent, TranslatePipe],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get dataset info', () => {
    component.loadData();
    fixture.detectChanges();
    expect(component.lastExecutionSubscription.closed).toBe(false);
  });

  it('should switch tabs', () => {
    fixture.detectChanges();

    component.activeTab = 'edit';
    component.datasetIsLoading = component.workflowIsLoading = component.lastExecutionIsLoading = component.harvestIsLoading = false;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'workflow';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'mapping';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'preview';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'log';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();
  });

  it('should be possible to display a message', () => {
    component.setShowPluginLog(currentWorkflow.results[0].metisPlugins[0]);
    fixture.detectChanges();
    expect(component.showPluginLog).toBe(currentWorkflow.results[0].metisPlugins[0]);

    component.errorMessage = 'error!';
    component.clickOutsideMessage();
    fixture.detectChanges();
    expect(component.errorMessage).toBeFalsy();
  });
});
