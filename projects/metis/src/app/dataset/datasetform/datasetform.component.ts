import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
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
import {
  AuthenticationService,
  CountriesService,
  DatasetsService,
  ErrorService
} from '../../_services';
import { TranslateService } from '../../_translate';

const DATASET_TEMP_LSKEY = 'tempDatasetData';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss']
})
export class DatasetformComponent extends SubscriptionManager implements OnInit {
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

  createdBy: string;

  @Input() harvestPublicationData?: HarvestData;
  @Input() isNew: boolean;

  @Output() datasetUpdated = new EventEmitter<void>();

  notification?: Notification;
  selectedCountry?: Country;
  selectedLanguage?: Language;

  publicationFitnessOps: Array<{ label: string; val: string }>;
  datasetForm: UntypedFormGroup;
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

  constructor(
    private readonly authenticationServer: AuthenticationService,
    private readonly countries: CountriesService,
    private readonly datasets: DatasetsService,
    private readonly router: Router,
    private readonly fb: UntypedFormBuilder,
    private readonly errors: ErrorService,
    private readonly translate: TranslateService
  ) {
    super();
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
    this.buildForm();
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
  get redirectionIds(): UntypedFormArray {
    return this.datasetForm.get('datasetIdsToRedirectFrom') as UntypedFormArray;
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
      ids.push(this.fb.control(val));
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
    return this.datasetForm.enabled && !this.datasetForm.controls[fieldName].valid;
  }

  /** fieldHasValue
  /* indicates if specified field value has been set
  */
  fieldHasValue(fieldName: keyof Dataset): boolean {
    return !!this.datasetForm.controls[fieldName].value;
  }

  /** clearField
  /* clear the specified field and mark the form as dirty
  */
  clearField(fieldName: keyof Dataset): void {
    this.datasetForm.controls[fieldName].setValue('');
    this.datasetForm.markAsDirty();
  }

  /** returnCountries
  /* - query the available countries
  /* - update the form
  */
  returnCountries(): void {
    this.subs.push(
      this.countries.getCountries().subscribe(
        (result) => {
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
        (err: HttpErrorResponse) => {
          this.errors.handleError(err);
        }
      )
    );
  }

  /** returnLanguages
  /* - query the available languages
  /* - update the form
  */
  returnLanguages(): void {
    this.subs.push(
      this.countries.getLanguages().subscribe(
        (result) => {
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
        (err: HttpErrorResponse) => {
          this.errors.handleError(err);
        }
      )
    );
  }

  /** buildForm
  /* - create a FormGroup
  /* - update the form
  */
  buildForm(): void {
    this.datasetForm = this.fb.group({
      datasetName: ['', [Validators.required]],
      dataProvider: [''],
      provider: ['', [Validators.required]],
      intermediateProvider: [''],
      datasetIdsToRedirectFrom: this.getIdsAsFormArray(),
      replaces: [''],
      replacedBy: [''],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      description: [''],
      notes: [''],
      publicationFitness: [PublicationFitness.FIT]
    });
    this.updateForm();
    this.updateFormEnabled();
  }

  /** getIdsAsFormArray
  /* generates a FormArray object from datasetIdsToRedirectFrom
  /* @returns FormArray
  */
  getIdsAsFormArray(): UntypedFormArray {
    let list: Array<UntypedFormControl> = [];
    if (this.datasetData.datasetIdsToRedirectFrom) {
      list = this.datasetData.datasetIdsToRedirectFrom.map((id) => {
        return this.fb.control(id);
      });
    }
    return this.fb.array(list);
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
    // declare local error-handler function
    const handleError = (err: HttpErrorResponse): void => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);
      this.isSaving = false;
    };
    // clear notification variable
    this.notification = undefined;
    this.isSaving = true;

    if (this.isNew) {
      this.subs.push(
        this.datasets.createDataset(this.datasetForm.value).subscribe((result) => {
          localStorage.removeItem(DATASET_TEMP_LSKEY);
          this.router.navigate(['/dataset/new/' + result.datasetId]);
        }, handleError)
      );
    } else {
      const dataset = {
        datasetId: this.datasetData.datasetId,
        ...this.datasetForm.value
      };
      this.subs.push(
        this.datasets.updateDataset({ dataset }).subscribe(() => {
          localStorage.removeItem(DATASET_TEMP_LSKEY);
          this.notification = successNotification(this.translate.instant('datasetSaved'), {
            fadeTime: 1500,
            sticky: true
          });
          this.datasetUpdated.emit();

          this.isSaving = false;
          this.datasetForm.markAsPristine();
        }, handleError)
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
