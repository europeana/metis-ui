import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createMockPipe,
  MockCountriesService,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  MockTranslateService
} from '../../_mocked';
import { CountriesService, DatasetsService, ErrorService } from '../../_services';
import { TranslateService } from '../../_translate';

import { DatasetformComponent } from '.';

describe('DatasetformComponent', () => {
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [DatasetformComponent, createMockPipe('translate')],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: CountriesService, useClass: MockCountriesService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    component.datasetData = mockDataset;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should submit form and update the dataset', fakeAsync((): void => {
    fixture.detectChanges();
    component.onSubmit();
    fixture.detectChanges();
    expect(component.notification!.content).toBe('en:datasetsaved');
  }));

  it('should submit form and create the dataset', fakeAsync((): void => {
    component.isNew = true;
    fixture.detectChanges();
    spyOn(router, 'navigate');
    component.onSubmit();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
  }));

  it('should temp save the form', () => {
    component.isNew = true;
    fixture.detectChanges();
    component.saveTempData();
    fixture.detectChanges();

    expect(localStorage.getItem('tempDatasetData')).not.toBe('');
    localStorage.removeItem('tempDatasetData');
  });

  it('should clear the fields', () => {
    fixture.detectChanges();
    const fName = 'datasetName';
    const field = component.datasetForm.controls[fName];

    expect(component.datasetForm.dirty).toBeFalsy();
    expect(field.value).toBeTruthy();

    component.clearField(fName);

    expect(component.datasetForm.dirty).toBeTruthy();
    expect(field.value).toBeFalsy();
  });

  it('should reset', () => {
    fixture.detectChanges();
    const fName = 'datasetName';
    expect(component.datasetForm.pristine).toBeTruthy();
    component.clearField(fName);
    expect(component.datasetForm.pristine).toBeFalsy();
    component.reset();
    expect(component.datasetForm.pristine).toBeTruthy();
  });

  it('should add redirection ids', () => {
    fixture.detectChanges();
    const existingId = '123';
    const newId = 'some_id';
    expect(component.datasetForm.dirty).toBeFalsy();
    component.addRedirectionId(existingId);
    expect(component.datasetForm.dirty).toBeFalsy();
    component.addRedirectionId(newId);
    expect(component.datasetForm.dirty).toBeTruthy();
  });

  it('should remove redirection ids', () => {
    fixture.detectChanges();
    const existingId = '123';
    const newId = 'some_id';
    expect(component.datasetForm.dirty).toBeFalsy();
    component.removeRedirectionId(newId);
    expect(component.datasetForm.dirty).toBeFalsy();
    component.removeRedirectionId(existingId);
    expect(component.datasetForm.dirty).toBeTruthy();
  });
});
