import { async, ComponentFixture, TestBed, fakeAsync, tick  } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { DatasetformComponent } from './datasetform.component';
import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService, WorkflowService } from '../../_services';
import { MockDatasetService, MockWorkflowService, MockCountriesService, currentWorkflow, currentDataset, MockAuthenticationService, currentUser} from '../../_mocked';

import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { TRANSLATION_PROVIDERS, TranslatePipe } from '../../_translate';

describe('DatasetformComponent', () => {

  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ DatasetformComponent, TranslatePipe ],
      providers: [
        {provide: DatasetsService, useClass: MockDatasetService},
        {provide: WorkflowService, useClass: MockWorkflowService},
        {provide: CountriesService, useClass: MockCountriesService},
        { provide: AuthenticationService, useClass: MockAuthenticationService},
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
    router = TestBed.get(Router);

  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have a new dataset form', () => {
    fixture.detectChanges();
    component.datasetData = currentDataset;
    expect(component.formMode).toBe('create');
  });

  it('should submit form and update the dataset', fakeAsync((): void => {
    component.datasetData = currentDataset;
    component.buildForm();
    fixture.detectChanges();

    component.formMode = 'update';
    spyOn(router, 'navigate').and.callFake(() => { });
    tick(50);

    component.onSubmit();
    fixture.detectChanges();
    expect(component.successMessage).not.toBe('');

    component.formMode = 'create';
    component.onSubmit();
    fixture.detectChanges();

  }));

  it('should submit form and create the dataset', fakeAsync((): void => {
    component.datasetData = currentDataset;
    component.buildForm();
    fixture.detectChanges();

    component.formMode = 'create';
    spyOn(router, 'navigate').and.callFake(() => { });
    tick(50);

    component.onSubmit();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
  }));

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
