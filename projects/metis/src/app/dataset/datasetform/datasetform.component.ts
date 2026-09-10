import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'; // Required for zoneless lifecycle safety
import {
  FormArray,
  FormControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { RadioButtonComponent } from 'shared';
import { errorNotification, httpErrorNotification, successNotification } from '../../_helpers';
import {
  Country,
  Dataset,
  HarvestData,
  Language,
  Notification,
  PublicationFitness
} from '../../_models';
import { CountriesService, DatasetsService } from '../../_services';
import { TranslatePipe, TranslateService } from '../../_translate';
import { LoadingButtonComponent, NotificationComponent } from '../../shared';
import { RedirectionComponent } from '../redirection';
import { UsernameComponent } from '../username';

const DATASET_TEMP_LSKEY = 'tempDatasetData';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioButtonComponent,
    RedirectionComponent,
    NotificationComponent,
    LoadingButtonComponent,
    DatePipe,
    TranslatePipe,
    UsernameComponent
  ]
})
export class DatasetformComponent implements OnInit {
  private readonly countries = inject(CountriesService);
  private readonly datasets = inject(DatasetsService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translate = inject(TranslateService);

  datasetData = input.required<Partial<Dataset>>();
  harvestPublicationData = input<HarvestData | undefined>(undefined);
  isNew = input<boolean>(false);

  datasetUpdated = output<void>();

  datasetForm = this.formBuilder.group({
    datasetName: ['', [Validators.required]],
    dataProvider: [''],
    provider: ['', [Validators.required]],
    intermediateProvider: [''],
    datasetIdsToRedirectFrom: this.formBuilder.array([]),
    replaces: [''],
    replacedBy: [''],
    country: [({} as unknown) as Country, [Validators.required]],
    language: [({} as unknown) as Language, [Validators.required]],
    description: [''],
    notes: [''],
    publicationFitness: [PublicationFitness.FIT]
  });

  notification = signal<Notification | undefined>(undefined);
  selectedCountry = signal<Country | undefined>(undefined);
  selectedLanguage = signal<Language | undefined>(undefined);

  publicationFitnessOps = signal<Array<{ label: string; val: string }>>([]);
  countryOptions = signal<Country[]>([]);
  languageOptions = signal<Language[]>([]);
  invalidNotification = signal<Notification | undefined>(undefined);

  isSaving = signal<boolean>(false);

  constructor() {
    this.datasetForm.statusChanges.pipe(takeUntilDestroyed()).subscribe();
  }

  /** updateFormEnabled
  /* disable/enable the form safely using queueMicrotask
  */
  private updateFormEnabled(saving: boolean): void {
    queueMicrotask(() => {
      if (this.datasetForm) {
        if (saving) {
          this.datasetForm.disable();
        } else {
          this.datasetForm.enable();
        }
      }
    });
  }

  /** ngOnInit
  /* - sync form
  /* - pre-load data
  /* - pre-translate the error notification message
  */
  ngOnInit(): void {
    this.publicationFitnessOps.set([
      { label: 'datasetPublicationFitnessValLabelFit', val: PublicationFitness.FIT },
      {
        label: 'datasetPublicationFitnessValLabelPartiallyFit',
        val: PublicationFitness.PARTIALLY_FIT
      },
      { label: 'datasetPublicationFitnessValLabelUnfit', val: PublicationFitness.UNFIT }
    ]);

    this.updateForm();
    this.updateFormEnabled(this.isSaving());

    this.returnCountries();
    this.returnLanguages();
    this.invalidNotification.set(
      errorNotification(this.translate.instant('formError'), {
        sticky: true
      })
    );
  }

  /** redirectionIds
  /* - returns form control as array
  */
  get redirectionIds(): FormArray {
    return this.datasetForm.get('datasetIdsToRedirectFrom') as FormArray;
  }

  /** addRedirectionId
  /* - handle addition to the redirectionIds array
  /* @param {string} val - the item to add
  */
  addRedirectionId(val: string): void {
    this.addOrRemoveRedirectionId(val, true);
  }

  /** removeRedirectionId
  /* - handle removal from the redirectionIds array
  /* @param {string} val - the item to remove
  */
  removeRedirectionId(val: string): void {
    this.addOrRemoveRedirectionId(val, false);
  }

  /** addOrRemoveRedirectionId
  /* - handle additions or removals from the redirectionIds array
  /* @param {string} val - the item to add or remove
  /* @param {boolean} add - flag addition (removal if false)
  */
  addOrRemoveRedirectionId(val: string, add: boolean): void {
    const ids = this.redirectionIds;
    const existingIndex = ids.value.findIndex((id: string) => id === val);

    if (add && existingIndex === -1) {
      ids.push(this.formBuilder.control(val));
      this.datasetForm.markAsDirty();
    } else if (!add && existingIndex > -1) {
      ids.removeAt(existingIndex);
      this.datasetForm.markAsDirty();
    }
  }

  /** showError
  /* indicates if specified field is enabled and valid
  */
  showError(fieldName: keyof Dataset): boolean {
    const ctrl = this.datasetForm.get(fieldName) as FormControl;
    return this.datasetForm.enabled && !ctrl.valid;
  }

  /** fieldHasValue
  /* indicates if specified field value has been set
  */
  fieldHasValue(fieldName: keyof Dataset): fieldName is keyof Dataset {
    return !!(this.datasetForm.get(fieldName) as FormControl).value;
  }

  /** clearField
  /* clear the specified field and mark the form as dirty
  */
  clearField(fieldName: keyof Dataset): void {
    (this.datasetForm.get(fieldName) as FormControl).setValue('');
    this.datasetForm.markAsDirty();
  }

  /** returnCountries
  /* - query the available countries
  /* - update the form
  */
  returnCountries(): void {
    this.countries
      .getCountries()
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.countryOptions.set(result);
          const datasetCountry = this.datasetData()?.country;
          if (result && datasetCountry) {
            const found = result.find((country: Country) => country.enum === datasetCountry.enum);
            this.selectedCountry.set(found);
          }
          this.updateForm();
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  /** returnLanguages
  /* - query the available languages
  /* - update the form
  */
  returnLanguages(): void {
    this.countries
      .getLanguages()
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.languageOptions.set(result);
          const datasetLanguage = this.datasetData()?.language;

          if (result && datasetLanguage) {
            const found = result.find((lang: Language) => lang.enum === datasetLanguage.enum);
            this.selectedLanguage.set(found);
          }

          this.updateForm();
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  /** getIdsAsFormArray
  /* generates a FormArray object from datasetIdsToRedirectFrom
  /* @returns FormArray
  */
  getIdsAsFormArray(): FormArray {
    let list: Array<FormControl<string>> = [];
    if (this.datasetData().datasetIdsToRedirectFrom) {
      list = this.datasetData().datasetIdsToRedirectFrom!.map((id) => {
        return this.formBuilder.control(id);
      });
    }
    return this.formBuilder.array(list);
  }

  /** updateForm
  /* sets the form data
  */
  updateForm(): void {
    this.datasetForm.patchValue(this.datasetData());
    this.datasetForm.setControl('datasetIdsToRedirectFrom', this.getIdsAsFormArray());
    this.datasetForm.patchValue({ country: this.selectedCountry() });
    this.datasetForm.patchValue({ language: this.selectedLanguage() });
    if (!this.datasetData().publicationFitness) {
      this.datasetForm.patchValue({ publicationFitness: PublicationFitness.FIT });
    }
  }

  /** reset
  /* - clear the notification
  /* - update the form
  /* - mark it as pristine
  */
  reset(): void {
    this.notification.set(undefined);
    this.updateForm();
    this.datasetForm.markAsPristine();
  }

  /** saveTempData
  /* save (new) form data to local storage
  */
  saveTempData(): void {
    if (this.isNew()) {
      localStorage.setItem(DATASET_TEMP_LSKEY, JSON.stringify(this.datasetForm.value));
    }
  }

  /** handleError
  /* set notification / reset isSaving
  /* @param {HttpErrorResponse} err
  */
  handleError(err: HttpErrorResponse): void {
    this.notification.set(httpErrorNotification(err));
    this.isSaving.set(false);
    this.updateFormEnabled(false);
  }

  /** onSubmit
  /* - submit the form if valid
  /* - redirect to new page if dataset is new
  /* - manage save-tracking variable
  /* - emit updated event if existing
  /* - show success notification if existing
  */
  onSubmit(): void {
    if (!this.datasetForm.valid) {
      return;
    }

    this.notification.set(undefined);
    this.isSaving.set(true);
    this.updateFormEnabled(true);

    if (this.isNew()) {
      this.datasets
        .createDataset((this.datasetForm as UntypedFormGroup).value)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            localStorage.removeItem(DATASET_TEMP_LSKEY);
            this.router.navigate(['/dataset/new/' + result.datasetId]);
          },
          error: this.handleError.bind(this)
        });
    } else {
      const dataset = {
        datasetId: this.datasetData()?.datasetId,
        ...this.datasetForm.value
      };

      this.datasets
        .updateDataset({ dataset })
        .pipe(take(1))
        .subscribe({
          next: () => {
            localStorage.removeItem(DATASET_TEMP_LSKEY);
            this.notification.set(
              successNotification(this.translate.instant('datasetSaved'), {
                fadeTime: 1500,
                sticky: true
              })
            );
            this.datasetUpdated.emit();

            this.isSaving.set(false);
            this.updateFormEnabled(false);
            this.datasetForm.markAsPristine();
          },
          error: this.handleError.bind(this)
        });
    }
  }

  /** cancel
  /* - remove current form data from local storage
  /* - redirect to the dashboard
  */
  cancel(): void {
    localStorage.removeItem(DATASET_TEMP_LSKEY);
    this.router.navigate(['/dashboard']);
  }

  /** getNotification
  /* - return the notification (unless saving)
  /* - return invalid notification if invalid
  */
  getNotification(): Notification | undefined {
    if (this.isSaving()) {
      return undefined;
    }

    if (this.notification()) {
      return this.notification();
    }

    if (this.datasetForm.valid) {
      return undefined;
    } else {
      return this.invalidNotification();
    }
  }
}
