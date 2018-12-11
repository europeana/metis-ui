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

import { DatasetformComponent } from '.';

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

  it('should submit form and update the dataset', fakeAsync((): void => {
    fixture.detectChanges();
    component.onSubmit();
    fixture.detectChanges();
    expect(component.notification!.content).toBe('Dataset updated!');
  }));

  it('should submit form and create the dataset', fakeAsync((): void => {
    component.isNew = true;
    fixture.detectChanges();

    spyOn(router, 'navigate').and.callFake(() => {});
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
});
