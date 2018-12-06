import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { GeneralinfoComponent } from './generalinfo.component';
import { DatasetsService, TranslateService, ErrorService, AuthenticationService, RedirectPreviousUrl, WorkflowService } from '../../_services';
import {MockDatasetService, MockWorkflowService, currentDataset, MockAuthenticationService, MockTranslateService, harvestData} from '../../_mocked';
import { apiSettings } from '../../../environments/apisettings';
import { TranslatePipe } from '../../_translate';

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
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralinfoComponent);
    component = fixture.componentInstance;
    component.datasetData = currentDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should try to find publication data', () => {
    component.harvestPublicationData = harvestData;
    fixture.detectChanges();
    expect(component.harvestPublicationData).toBe(harvestData);
    expect(component.lastPublishedRecords).toBe(842);
    expect(component.lastPublishedDate).toBe('2018-03-30T13:53:04.762Z');
    expect(component.viewPreview).toBe(apiSettings.viewPreview + '1_*');
    expect(component.buttonClassPreview).toBe('');
    expect(component.viewCollections).toBe(apiSettings.viewCollections + '1_*');
    expect(component.buttonClassCollections).toBe('');
  });
});
