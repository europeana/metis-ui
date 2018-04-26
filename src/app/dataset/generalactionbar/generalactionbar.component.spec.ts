import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe, RenameWorkflowPipe }   from '../../_translate';

import { WorkflowService, TranslateService } from '../../_services';
import { GeneralactionbarComponent } from './generalactionbar.component';
import { MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset } from '../../_mocked';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ GeneralactionbarComponent, TranslatePipe ],
      providers:    [ {provide: WorkflowService, useClass: MockWorkflowService},
      { provide: TranslateService,
            useValue: {
              translate: () => {
                return {};
              }
            }
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralactionbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check the status', () => {
    component.datasetData = currentDataset;
    component.returnLastExecution();
    fixture.detectChanges();
    expect(component.currentWorkflowStatus).toBe('INQUEUE');
  });

  it('should start a workflow', () => {
    component.datasetData = currentDataset;
    component.selectWorkflow();
    fixture.detectChanges();

    component.workflowInfoAvailable = true;
    component.currentWorkflowStatus = 'INQUEUE';
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.progress')).length).toBeTruthy();
  });

});
