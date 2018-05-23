import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinfoComponent } from './generalinfo.component';
import { DatasetsService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, currentWorkflow, currentDataset, MockAuthenticationService, currentUser } from '../../_mocked';

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
        { provide: AuthenticationService, useClass: MockAuthenticationService}, 
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
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should try to find publication data', () => {
    component.datasetData = currentDataset;
    fixture.detectChanges();
    expect(component.harvestPublicationData).not.toBe(undefined);
  });

});