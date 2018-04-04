import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinfoComponent } from './generalinfo.component';
import { DatasetsService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

describe('GeneralinfoComponent', () => {
  let component: GeneralinfoComponent;
  let fixture: ComponentFixture<GeneralinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule, RouterTestingModule],
      declarations: [ GeneralinfoComponent, TranslatePipe ],
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
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
