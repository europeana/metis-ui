import { WorkflowService, ErrorService, AuthenticationService, RedirectPreviousUrl, TranslateService, DatasetsService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { OngoingexecutionsComponent } from './ongoingexecutions.component';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ OngoingexecutionsComponent, TranslatePipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        DatasetsService,
        ErrorService, 
        AuthenticationService, 
        RedirectPreviousUrl,
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
    fixture = TestBed.createComponent(OngoingexecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get an ongoing execution', () => {
    component.getOngoing();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.ongoing-executions')).length).toBeTruthy();
  });

  it('should cancel a workflow', () => {
    component.ongoingExecutions = currentWorkflow;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.cancel-btn')).length).toBeTruthy();

    component.cancelWorkflow(1);
    component.ongoingExecutions = undefined;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.ongoing-executions')).length).not.toBeTruthy();
  });

});
