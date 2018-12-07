import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  currentDataset,
  MockCountriesService,
  MockDatasetService,
  MockTranslateService,
} from '../../_mocked';
import {
  CountriesService,
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
} from '../../_services';
import { TranslatePipe, TranslateService } from '../../_translate';

import { DatasetformComponent } from './datasetform.component';

describe('DatasetformComponent', () => {
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientModule],
      declarations: [DatasetformComponent, TranslatePipe],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: CountriesService, useClass: MockCountriesService },
        ErrorService,
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    component.datasetData = currentDataset;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should have a new dataset form', () => {
    component.isNew = true;
    fixture.detectChanges();
    expect(component.formMode).toBe('edit');
  });

  it('should submit form and update the dataset', fakeAsync((): void => {
    fixture.detectChanges();
    component.editForm();
    expect(component.formMode).toBe('edit');

    component.onSubmit();
    fixture.detectChanges();
    expect(component.notification!.content).toBe('Dataset updated!');
    expect(component.formMode).toBe('show');
  }));

  it('should submit form and create the dataset', fakeAsync((): void => {
    component.isNew = true;
    fixture.detectChanges();
    expect(component.formMode).toBe('edit');

    spyOn(router, 'navigate').and.callFake(() => {});
    component.onSubmit();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
  }));

  it('should have a preview dataset form', () => {
    fixture.detectChanges();
    expect(component.formMode).toBe('show');
    expect(component.datasetForm.get('datasetName')!.enabled).toBeFalsy();
  });

  it('should have an edit dataset form', () => {
    fixture.detectChanges();
    component.editForm();
    expect(component.formMode).toBe('edit');
    expect(component.datasetForm.get('datasetName')!.enabled).toBeTruthy();
  });

  it('should temp save the form', () => {
    component.isNew = true;
    fixture.detectChanges();
    expect(component.formMode).toBe('edit');
    component.saveTempData();
    fixture.detectChanges();

    expect(localStorage.getItem('tempDatasetData')).not.toBe('');
    localStorage.removeItem('tempDatasetData');
  });
});
