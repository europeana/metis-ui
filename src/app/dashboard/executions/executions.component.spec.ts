import { WorkflowService, ErrorService, AuthenticationService, RedirectPreviousUrl, TranslateService, DatasetsService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { ExecutionsComponent } from './executions.component';

describe('ExecutionsComponent', () => {
  let component: ExecutionsComponent;
  let fixture: ComponentFixture<ExecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule ],
      declarations: [ ExecutionsComponent, TranslatePipe ],
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
    fixture = TestBed.createComponent(ExecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load a next page', () => {
    component.nextPage = 1;
    component.loadNextPage();
    component.nextPage = -1;
    fixture.detectChanges();
    expect(component.allExecutions.length).not.toBe(0);
  });

  it('should cancel a workflow', () => {
    component.cancelWorkflow(1);    
    fixture.detectChanges();
    expect(component.successMessage).not.toBe();
  });

});
