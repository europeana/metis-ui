import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
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
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { RadioButtonComponent, SubscriptionManager } from 'shared';
import {
  Country,
  Dataset,
  errorNotification,
  HarvestData,
  httpErrorNotification,
  Language,
  Notification,
  PublicationFitness,
  successNotification,
  User
} from '../../_models';
import { AuthenticationService, CountriesService, DatasetsService } from '../../_services';
import { TranslatePipe, TranslateService } from '../../_translate';
import { LoadingButtonComponent, NotificationComponent } from '../../shared';
import { RedirectionComponent } from '../redirection';

const DATASET_TEMP_LSKEY = 'tempDatasetData';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    RadioButtonComponent,
    RedirectionComponent,
    NotificationComponent,
    LoadingButtonComponent,
    DatePipe,
    TranslatePipe
  ]
})
export class DatasetformComponent extends SubscriptionManager implements OnInit {
  private readonly authenticationServer = inject(AuthenticationService);
  private readonly countries = inject(CountriesService);
  private readonly datasets = inject(DatasetsService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly translate = inject(TranslateService);

  createdBy: string;
  _datasetData: Partial<Dataset>;

  @Input() set datasetData(data: Partial<Dataset>) {
    this._datasetData = data;
    if (!this.createdBy) {
      const userId = data.createdByUserId;
      if (userId) {
        this.subs.push(
          this.authenticationServer.getUserByUserId(userId).subscribe((user: User) => {
            this.createdBy = `${user.firstName} ${user.lastName}`;
          })
        );
      }
    }
  }

  get datasetData(): Partial<Dataset> {
    return this._datasetData;
  }

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

  @Input() harvestPublicationData?: HarvestData;
  @Input() isNew = false;

  @Output() datasetUpdated = new EventEmitter<void>();

  notification?: Notification;
  selectedCountry?: Country;
  selectedLanguage?: Language;

  publicationFitnessOps: Array<{ label: string; val: string }>;
  countryOptions: Country[];
  languageOptions: Language[];

  _isSaving = false;
  invalidNotification: Notification;

  // set the isSaving value and update the formEnabled value
  set isSaving(value: boolean) {
    this._isSaving = value;
    this.updateFormEnabled();
  }

  /** isSaving
  /* accessor for the isSaving variable
  */
  get isSaving(): boolean {
    return this._isSaving;
  }

  /** updateFormEnabled
  /* disable the form if saving
  /* enable the form according if not saving
  */
  private updateFormEnabled(): void {
    if (this.datasetForm) {
      if (this.isSaving) {
        this.datasetForm.disable();
      } else {
        this.datasetForm.enable();
      }
    }
  }

  /** ngOnInit
  /* - build the form / get the countries and languages
  /* - pre-translate the error notification message
  */
  ngOnInit(): void {
    this.publicationFitnessOps = [
      {
        label: 'datasetPublicationFitnessValLabelFit',
        val: PublicationFitness.FIT
      },
      {
        label: 'datasetPublicationFitnessValLabelPartiallyFit',
        val: PublicationFitness.PARTIALLY_FIT
      },
      {
        label: 'datasetPublicationFitnessValLabelUnfit',
        val: PublicationFitness.UNFIT
      }
    ];

    this.updateForm();
    this.updateFormEnabled();

    this.returnCountries();
    this.returnLanguages();
    this.invalidNotification = errorNotification(this.translate.instant('formError'), {
      sticky: true
    });
  }

  /** redirectionIds
  /* - returns form control as array
  /* - (necessary for template-check to pass)
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
    this.subs.push(
      this.countries.getCountries().subscribe({
        next: (result) => {
          this.countryOptions = result;
          const datasetCountry = this.datasetData.country;
          if (this.datasetData && this.countryOptions && datasetCountry) {
            this.countryOptions.forEach((country: Country) => {
              if (country.enum === datasetCountry.enum) {
                this.selectedCountry = country;
              }
            });
          }
          this.updateForm();
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      })
    );
  }

  /** returnLanguages
  /* - query the available languages
  /* - update the form
  */
  returnLanguages(): void {
    this.subs.push(
      this.countries.getLanguages().subscribe({
        next: (result) => {
          this.languageOptions = result;
          const datasetLanguage = this.datasetData.language;
          if (this.datasetData && this.languageOptions && datasetLanguage) {
            this.languageOptions.forEach((lang: Language) => {
              if (lang.enum === datasetLanguage.enum) {
                this.selectedLanguage = lang;
              }
            });
          }
          this.updateForm();
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      })
    );
  }

  /** getIdsAsFormArray
  /* generates a FormArray object from datasetIdsToRedirectFrom
  /* @returns FormArray
  */
  getIdsAsFormArray(): FormArray {
    let list: Array<FormControl<string>> = [];
    if (this.datasetData.datasetIdsToRedirectFrom) {
      list = this.datasetData.datasetIdsToRedirectFrom.map((id) => {
        return this.formBuilder.control(id);
      });
    }
    return this.formBuilder.array(list);
  }

  /** updateForm
  /* sets the form data, country and language
  */
  updateForm(): void {
    this.datasetForm.patchValue(this.datasetData);
    this.datasetForm.setControl('datasetIdsToRedirectFrom', this.getIdsAsFormArray());
    this.datasetForm.patchValue({ country: this.selectedCountry });
    this.datasetForm.patchValue({ language: this.selectedLanguage });
    if (!this.datasetData.publicationFitness) {
      this.datasetForm.patchValue({ publicationFitness: PublicationFitness.FIT });
    }
  }

  /** reset
  /* - clear the notification
  /* - update the form
  /* - mark it as pristine
  */
  reset(): void {
    this.notification = undefined;
    this.updateForm();
    this.datasetForm.markAsPristine();
  }

  /** saveTempData
  /* save (new) form data to local storage
  */
  saveTempData(): void {
    if (this.isNew) {
      localStorage.setItem(DATASET_TEMP_LSKEY, JSON.stringify(this.datasetForm.value));
    }
  }

  /** handleError
  /* set notification / reset isSaving
  /* @param {HttpErrorResponse} err
  */
  handleError(err: HttpErrorResponse): void {
    this.notification = httpErrorNotification(err);
    this.isSaving = false;
  }

  /** onSubmit
  /* - submit the form if valid
  /* - redirect to new page if dataset is new
  /* - manage save-tracking variable
  /* - emit updated event if existing
  /* - show success notification if existing
  */
  onSubmit(): void {
    // return if invalid
    if (!this.datasetForm.valid) {
      return;
    }

    const handleError = this.handleError;

    // clear notification variable
    this.notification = undefined;
    this.isSaving = true;

    if (this.isNew) {
      this.subs.push(
        this.datasets.createDataset((this.datasetForm as UntypedFormGroup).value).subscribe({
          next: (result) => {
            localStorage.removeItem(DATASET_TEMP_LSKEY);
            this.router.navigate(['/dataset/new/' + result.datasetId]);
          },
          error: handleError
        })
      );
    } else {
      const dataset = {
        datasetId: this.datasetData.datasetId,
        ...this.datasetForm.value
      };
      this.subs.push(
        this.datasets.updateDataset({ dataset }).subscribe({
          next: () => {
            localStorage.removeItem(DATASET_TEMP_LSKEY);
            this.notification = successNotification(this.translate.instant('datasetSaved'), {
              fadeTime: 1500,
              sticky: true
            });
            this.datasetUpdated.emit();

            this.isSaving = false;
            this.datasetForm.markAsPristine();
          },
          error: handleError
        })

        //, handleError)
      );
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
  /* - return the notifiction (unless saving)
  /* - return invalid notification if invalid
  */
  getNotification(): Notification | undefined {
    if (this.isSaving) {
      return undefined;
    }

    if (this.notification) {
      return this.notification;
    }

    if (this.datasetForm.valid) {
      return undefined;
    } else {
      return this.invalidNotification;
    }
  }
}
