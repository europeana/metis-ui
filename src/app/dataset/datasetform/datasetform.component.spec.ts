import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs/Rx';

import { DatasetformComponent } from './datasetform.component';
import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { MockDatasetService, currentWorkflow, currentDataset } from '../../_mocked';

import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

describe('DatasetformComponent', () => {
  
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
 
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ DatasetformComponent, TranslatePipe ],
      providers:    [         
        {provide: DatasetsService, useClass: MockDatasetService}, 
        AuthenticationService, 
        CountriesService,
        ErrorService, 
        RedirectPreviousUrl,
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        } ]
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component    = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have a new dataset form', () => { 
    fixture.detectChanges();
    expect(component.formMode).toBe('create');
  });

  it('should have a preview dataset form', () => { 
    component.formMode = 'read';
    component.datasetData = currentDataset;
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('#dataset-name'))[0].properties.readOnly).toBe(true);

  });

  it('should have an edit dataset form', () => { 
    component.datasetData = currentDataset;
    component.buildForm();
    fixture.detectChanges();

    component.updateForm();
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('#dataset-name'))[0].properties.readOnly).toBe(false);
  });

  it('should temp save the form', () => { 
    component.datasetData = currentDataset;
    component.buildForm();
    component.formMode = 'create';
    component.saveTempData();
    fixture.detectChanges();

    expect(localStorage.getItem('tempDatasetData')).not.toBe('');
    localStorage.removeItem('tempDatasetData');
    
  });


});
