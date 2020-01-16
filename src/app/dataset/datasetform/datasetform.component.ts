import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Country,
  Dataset,
  errorNotification,
  HarvestData,
  httpErrorNotification,
  Language,
  Notification,
  successNotification
} from '../../_models';
import { CountriesService, DatasetsService, ErrorService } from '../../_services';
import { TranslateService } from '../../_translate';

const DATASET_TEMP_LSKEY = 'tempDatasetData';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss']
})
export class DatasetformComponent implements OnInit {
  @Input() datasetData: Partial<Dataset>;
  @Input() harvestPublicationData?: HarvestData;
  @Input() isNew: boolean;

  @Output() datasetUpdated = new EventEmitter<void>();

  redirectionIds: Array<string> = [];

  notification?: Notification;
  selectedCountry?: Country;
  selectedLanguage?: Language;

  datasetForm: FormGroup;
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
    private readonly countries: CountriesService,
    private readonly datasets: DatasetsService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly errors: ErrorService,
    private readonly translate: TranslateService
  ) {}

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
    this.buildForm();
    this.returnCountries();
    this.returnLanguages();
    this.invalidNotification = errorNotification(this.translate.instant('formerror'), {
      sticky: true
    });
  }

  /** addRedirectionId
  /* - handle addition to the datasetData.redirectionIds array
  /* - creates the datasetData.redirectionIds array if it doesn't exist
  /* @param {string} add - the item to remove
  */
  addRedirectionId(add: string): void {
    if (this.redirectionIds.indexOf(add) === -1) {
      this.redirectionIds.push(add);
      this.datasetForm.patchValue({ redirectionIds: this.redirectionIds.join(',') });
      this.datasetForm.markAsDirty();
    }
  }

  /** removeRedirectionId
  /* - handle removal from the redirectionIds array
  /* @param {string} m - the item to remove
  */
  removeRedirectionId(rm: string): void {
    this.redirectionIds.forEach((oldId: string, index) => {
      if (oldId === rm) {
        this.redirectionIds.splice(index, 1);
      }
    });
    this.datasetForm.patchValue({ redirectionIds: this.redirectionIds.join(',') });
    this.datasetForm.markAsDirty();
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
    this.countries.getCountries().subscribe(
      (result) => {
        this.countryOptions = result;
        if (this.datasetData && this.countryOptions && this.datasetData.country) {
          for (let i = 0; i < this.countryOptions.length; i++) {
            if (this.countryOptions[i].enum === this.datasetData.country.enum) {
              this.selectedCountry = this.countryOptions[i];
            }
          }
        }
        this.updateForm();
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      }
    );
  }

  /** returnLanguages
  /* - query the available languages
  /* - update the form
  */
  returnLanguages(): void {
    this.countries.getLanguages().subscribe(
      (result) => {
        this.languageOptions = result;
        if (this.datasetData && this.languageOptions && this.datasetData.language) {
          for (let i = 0; i < this.languageOptions.length; i++) {
            if (this.languageOptions[i].enum === this.datasetData.language.enum) {
              this.selectedLanguage = this.languageOptions[i];
            }
          }
        }
        this.updateForm();
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      }
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
      redirectionIds: [''],
      replaces: [''],
      replacedBy: [''],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      description: [''],
      notes: [''],
      unfitForPublication: ['']
    });

    this.updateForm();
    this.updateFormEnabled();
  }

  /** updateForm
  /* sets the form data, country and language
  */
  updateForm(): void {
    this.redirectionIds = this.datasetData.redirectionIds
      ? JSON.parse(this.datasetData.redirectionIds)
      : [];
    this.datasetForm.patchValue(this.datasetData);
    this.datasetForm.patchValue({ country: this.selectedCountry });
    this.datasetForm.patchValue({ language: this.selectedLanguage });
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
      this.datasets.createDataset(this.datasetForm.value).subscribe((result) => {
        localStorage.removeItem(DATASET_TEMP_LSKEY);
        this.router.navigate(['/dataset/new/' + result.datasetId]);
      }, handleError);
    } else {
      const dataset = {
        datasetId: this.datasetData.datasetId,
        ...this.datasetForm.value
      };
      this.datasets.updateDataset({ dataset }).subscribe(() => {
        localStorage.removeItem(DATASET_TEMP_LSKEY);
        this.notification = successNotification(this.translate.instant('datasetsaved'), {
          fadeTime: 1500,
          sticky: true
        });
        this.datasetUpdated.emit();

        this.isSaving = false;
        this.datasetForm.markAsPristine();
      }, handleError);
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
