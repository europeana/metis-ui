import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
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
      imports: [ReactiveFormsModule, DatasetformComponent, RadioButtonComponent],
      providers: [
        provideRouter([]),
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
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', async () => {
      await fixture.whenStable();
      expect(component).toBeDefined();
    });

    it('should get the redirection ids FormArray', async () => {
      await fixture.whenStable();
      expect(component.getIdsAsFormArray().length).toEqual(2);

      const data = structuredClone(component.datasetData());
      delete data.datasetIdsToRedirectFrom;

      fixture.componentRef.setInput('datasetData', data);
      await fixture.whenStable();
      expect(component.getIdsAsFormArray().length).toEqual(0);
    });

    it('should submit the valid form and update the dataset', async () => {
      await fixture.whenStable();
      component.notification.set(null as any);
      component.datasetForm.controls.datasetName.setValue('');

      component.onSubmit();
      TestBed.flushEffects();
      await fixture.whenStable();
      expect(component.notification()).toBeFalsy();

      component.datasetForm.controls.datasetName.setValue('X');
      const saveComplete = firstValueFrom(outputToObservable(component.datasetUpdated));

      component.onSubmit();
      TestBed.flushEffects();
      await saveComplete;
      await fixture.whenStable();

      expect(component.notification()!).toBeDefined();
      expect(component.notification()!.content).toBe('en:datasetSaved');
    });

    it('should submit form and create the dataset', async () => {
      fixture.componentRef.setInput('isNew', true);
      await fixture.whenStable();
      component.notification.set(null as any);

      vi.spyOn(router, 'navigate');
      component.onSubmit();
      TestBed.flushEffects();
      await fixture.whenStable();
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/new/1']);
    });

    it('should cancel', async () => {
      await fixture.whenStable();
      vi.spyOn(router, 'navigate');
      localStorage.setItem('tempDatasetData', 'X');
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(localStorage.getItem('tempDatasetData')).toBeFalsy();
    });

    it('should temp save the form', async () => {
      const key = 'tempDatasetData';
      await fixture.whenStable();
      expect(localStorage.getItem(key)).toBeFalsy();
      component.saveTempData();
      expect(localStorage.getItem(key)).toBeFalsy();

      fixture.componentRef.setInput('isNew', true);
      await fixture.whenStable();
      component.saveTempData();
      expect(localStorage.getItem(key)).toBeTruthy();
      localStorage.removeItem(key);
    });

    it('should clear the fields', async () => {
      await fixture.whenStable();
      const fName = 'datasetName';
      const field = component.datasetForm.controls[fName];

      expect(component.datasetForm.dirty).toBeFalsy();
      expect(field.value).toBeTruthy();

      component.clearField(fName);

      expect(component.datasetForm.dirty).toBeTruthy();
      expect(field.value).toBeFalsy();
    });

    it('should reset', async () => {
      await fixture.whenStable();
      const fName = 'datasetName';
      expect(component.datasetForm.pristine).toBeTruthy();
      component.clearField(fName);
      expect(component.datasetForm.pristine).toBeFalsy();
      component.reset();
      expect(component.datasetForm.pristine).toBeTruthy();
    });

    it('should add redirection ids', async () => {
      await fixture.whenStable();
      expect(component.datasetForm.dirty).toBeFalsy();
      component.addRedirectionId(existingId);
      expect(component.datasetForm.dirty).toBeFalsy();
      component.addRedirectionId(newId);
      expect(component.datasetForm.dirty).toBeTruthy();
    });

    it('should remove redirection ids', async () => {
      await fixture.whenStable();
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
      TestBed.flushEffects();
      await fixture.whenStable();
      expect(component.notification()).toBeTruthy();
    });

    it('should handle errors getting the languages', async () => {
      expect(component.notification()).toBeFalsy();

      component.returnLanguages();
      TestBed.flushEffects();
      await fixture.whenStable();
      expect(component.notification()).toBeTruthy();
    });

    it('should handle errors submitting the form', async () => {
      expect(component.notification()).toBeFalsy();

      component.onSubmit();
      TestBed.flushEffects();
      await fixture.whenStable();
      expect(component.notification()).toBeTruthy();
    });
  });
});
