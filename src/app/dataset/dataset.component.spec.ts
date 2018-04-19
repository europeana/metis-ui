import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetComponent } from './dataset.component';
import { DatasetformComponent } from './datasetform/datasetform.component';

import { By } from '@angular/platform-browser';

import { DatasetsService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl, WorkflowService } from '../_services';
import { MockDatasetService, MockWorkflowService, currentWorkflow, currentDataset } from '../_mocked';

import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../_translate';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule, RouterTestingModule],
      declarations: [ DatasetComponent, TranslatePipe ],
      providers: [ 
        {provide: DatasetsService, useClass: MockDatasetService}, 
        {provide: WorkflowService, useClass: MockWorkflowService}, 
        ErrorService,
        AuthenticationService, 
        RedirectPreviousUrl,
        { provide: TranslateService,
            useValue: {
              translate: () => {
                return {};
              }
            }
        }],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
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
    component.activeTab = undefined;
    component.returnDataset('1');
    fixture.detectChanges();    
    expect(component.lastExecutionData).not.toBe(undefined);
  });

  it('should switch tabs', () => {
    fixture.detectChanges();  

    component.activeTab = 'edit';
    component.getCurrentTab();
    fixture.detectChanges();  
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'workflow';
    component.getCurrentTab();
    fixture.detectChanges();  
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'mapping';
    component.getCurrentTab();
    fixture.detectChanges();  
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'preview';
    component.getCurrentTab();
    fixture.detectChanges();  
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'log';
    component.getCurrentTab();
    fixture.detectChanges();  
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

  });

  it('should be possible to display a message', () => {
    component.onNotifyShowLogStatus('mocked');
    fixture.detectChanges();
    expect(component.isShowingLog).toBe('mocked');

    component.clickOutsideMessage();
    fixture.detectChanges();
    expect(component.errorMessage).toBe(undefined);

  });

});