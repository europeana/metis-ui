import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createMockPipe,
  MockAuthenticationService,
  MockCountriesService,
  MockCountriesServiceErrors,
  mockDataset,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService
} from '../../_mocked';
import { AuthenticationService, CountriesService, DatasetsService } from '../../_services';
import { TranslateService } from '../../_translate';

import { DatasetformComponent } from '.';

describe('DatasetformComponent', () => {
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let router: Router;

  const existingId = '123';
  const newId = 'some_id';

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule],
      declarations: [DatasetformComponent, createMockPipe('translate')],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: CountriesService,
          useClass: errorMode ? MockCountriesServiceErrors : MockCountriesService
        },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    component.datasetData = mockDataset;
  };

  describe('Normal Operations', () => {
    beforeEach(configureTestbed);

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should get the redirection ids FormArray', () => {
      fixture.detectChanges();
      expect(component.getIdsAsFormArray().length).toEqual(2);
      const data = Object.assign({}, component.datasetData);
      delete data.datasetIdsToRedirectFrom;
      component.datasetData = data;
      expect(component.getIdsAsFormArray().length).toEqual(0);
    });

    it('should handle form enabling and disabling', () => {
      component.isSaving = false;
      expect(component.datasetForm).toBeTruthy();
      spyOn(component.datasetForm, 'enable');
      spyOn(component.datasetForm, 'disable');
      component.isSaving = false;
      expect(component.datasetForm.enable).toHaveBeenCalled();
      expect(component.datasetForm.disable).not.toHaveBeenCalled();
      component.isSaving = true;
      expect(component.datasetForm.disable).toHaveBeenCalled();
    });

    it('should submit the valid form and update the dataset', fakeAsync((): void => {
      fixture.detectChanges();

      component.datasetForm.controls.datasetName.setValue('');

      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification).toBeFalsy();

      component.datasetForm.controls.datasetName.setValue('X');

      component.onSubmit();
      tick(1);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('en:datasetSaved');
    }));

    it('should submit form and create the dataset', fakeAsync((): void => {
      component.isNew = true;
      fixture.detectChanges();
      spyOn(router, 'navigate');
      component.onSubmit();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
    }));

    it('should cancel', fakeAsync((): void => {
      fixture.detectChanges();
      spyOn(router, 'navigate');
      localStorage.setItem('tempDatasetData', 'X');
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(localStorage.getItem('tempDatasetData')).toBeFalsy();
    }));

    it('should temp save the form', () => {
      const key = 'tempDatasetData';
      fixture.detectChanges();
      expect(localStorage.getItem(key)).toBeFalsy();
      component.saveTempData();
      fixture.detectChanges();
      expect(localStorage.getItem(key)).toBeFalsy();
      component.isNew = true;
      component.saveTempData();
      expect(localStorage.getItem(key)).toBeTruthy();
      localStorage.removeItem(key);
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
      expect(component.datasetForm.dirty).toBeFalsy();
      component.addRedirectionId(existingId);
      expect(component.datasetForm.dirty).toBeFalsy();
      component.addRedirectionId(newId);
      expect(component.datasetForm.dirty).toBeTruthy();
    });

    it('should remove redirection ids', () => {
      fixture.detectChanges();
      expect(component.datasetForm.dirty).toBeFalsy();
      component.removeRedirectionId(newId);
      expect(component.datasetForm.dirty).toBeFalsy();
      component.removeRedirectionId(existingId);
      expect(component.datasetForm.dirty).toBeTruthy();
    });

    it('should cleanup on destroy', () => {
      fixture.detectChanges();
      spyOn(component, 'cleanup').and.callThrough();
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
    });

    it('should handle errors getting the countries', () => {
      expect(component.notification).toBeFalsy();
      component.returnCountries();
      expect(component.notification).toBeTruthy();
    });

    it('should handle errors getting the languages', () => {
      expect(component.notification).toBeFalsy();
      component.returnLanguages();
      expect(component.notification).toBeTruthy();
    });

    it('should handle errors submitting the form', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      fixture.detectChanges();
      component.onSubmit();
      tick(1);
      expect(component.notification).toBeTruthy();
    }));
  });
});
