import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import { createMockPipe, RadioButtonComponent } from 'shared';
import {
  MockCountriesService,
  MockCountriesServiceErrors,
  mockDataset,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService
} from '../../_mocked';
import { CountriesService, DatasetsService } from '../../_services';
import { TranslatePipe, TranslateService } from '../../_translate';
import { DatasetformComponent } from '.';

describe('DatasetformComponent', () => {
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let router: Router;

  const existingId = '123';
  const newId = 'some_id';

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        DatasetformComponent,
        RadioButtonComponent
      ],
      providers: [
        {
          provide: CountriesService,
          useClass: errorMode ? MockCountriesServiceErrors : MockCountriesService
        },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValue: createMockPipe('translate') }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('datasetData', mockDataset);
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
      const data = structuredClone(component.datasetData());
      delete data.datasetIdsToRedirectFrom;
      fixture.componentRef.setInput('datasetData', data);
      expect(component.getIdsAsFormArray().length).toEqual(0);
    });

    it('should handle form enabling and disabling', async () => {
      component.isSaving.set(false);
      expect(component.datasetForm).toBeTruthy();

      spyOn(component.datasetForm, 'enable');
      spyOn(component.datasetForm, 'disable');

      component['updateFormEnabled'](false);
      await Promise.resolve(); // Flushes the queueMicrotask queue cleanly
      expect(component.datasetForm.enable).toHaveBeenCalled();
      expect(component.datasetForm.disable).not.toHaveBeenCalled();

      component['updateFormEnabled'](true);
      await Promise.resolve(); // Flushes the queueMicrotask queue cleanly
      expect(component.datasetForm.disable).toHaveBeenCalled();
    });

    it('should submit the valid form and update the dataset', async () => {
      fixture.detectChanges();
      component.datasetForm.controls.datasetName.setValue('');

      component.onSubmit();
      await Promise.resolve(); // Let form status queueMicrotask finish
      fixture.detectChanges();
      expect(component.notification()).toBeFalsy();

      component.datasetForm.controls.datasetName.setValue('X');

      const saveComplete = firstValueFrom(outputToObservable(component.datasetUpdated));

      component.onSubmit();

      await saveComplete;
      fixture.detectChanges();

      expect(component.notification()!).toBeDefined();
      expect(component.notification()!.content).toBe('en:datasetSaved');
    });

    it('should submit form and create the dataset', () => {
      fixture.componentRef.setInput('isNew', true);
      fixture.detectChanges();
      spyOn(router, 'navigate');
      component.onSubmit();
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
    });

    it('should cancel', () => {
      fixture.detectChanges();
      spyOn(router, 'navigate');
      localStorage.setItem('tempDatasetData', 'X');
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(localStorage.getItem('tempDatasetData')).toBeFalsy();
    });

    it('should temp save the form', () => {
      const key = 'tempDatasetData';
      fixture.detectChanges();
      expect(localStorage.getItem(key)).toBeFalsy();
      component.saveTempData();
      fixture.detectChanges();
      expect(localStorage.getItem(key)).toBeFalsy();
      fixture.componentRef.setInput('isNew', true);
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
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
    });

    it('should handle errors getting the countries', async () => {
      expect(component.notification()).toBeFalsy();
      component.returnCountries();

      // Let the mock HTTP error callback execute immediately in the microtask loop
      await Promise.resolve();
      expect(component.notification()).toBeTruthy();
    });

    it('should handle errors getting the languages', async () => {
      expect(component.notification()).toBeFalsy();
      component.returnLanguages();

      // Let the mock HTTP error callback execute immediately in the microtask loop
      await Promise.resolve();
      expect(component.notification()).toBeTruthy();
    });

    // FIXED: Removed toObservable completely. Uses the same microtask strategy!
    it('should handle errors submitting the form', async () => {
      expect(component.notification()).toBeFalsy();
      fixture.detectChanges();

      component.onSubmit();

      // Await the asynchronous error pipeline to complete and mutate the notification signal
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.notification()).toBeTruthy();
    });
  });
});
