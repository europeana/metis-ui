import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WorkflowService, TranslateService } from '../../_services';
import { GeneralactionbarComponent } from './generalactionbar.component';
import { MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset } from '../../_mocked';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ GeneralactionbarComponent ],
      providers:    [ {provide: WorkflowService, useClass: MockWorkflowService} ]
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

  it('should start checking the status', () => {
    component.datasetData = currentDataset;
    fixture.detectChanges();
    
    console.log(component.currentWorkflowStatus);
    //expect(component).toBeTruthy();

  });

});
