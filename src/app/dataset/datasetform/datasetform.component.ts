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

  notification?: Notification;
  selectedCountry?: Country;
  selectedLanguage?: Language;

  datasetForm: FormGroup;
  countryOptions: Country[];
  languageOptions: Language[];

  _isSaving = false;
  invalidNotification: Notification;

  set isSaving(value: boolean) {
    this._isSaving = value;
    this.updateFormEnabled();
  }

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

  private updateFormEnabled(): void {
    if (this.datasetForm) {
      if (this.isSaving) {
        this.datasetForm.disable();
      } else {
        this.datasetForm.enable();
      }
    }
  }

  ngOnInit(): void {
    this.buildForm();
    this.returnCountries();
    this.returnLanguages();

    this.invalidNotification = errorNotification(this.translate.instant('formerror'), {
      sticky: true
    });
  }

  showError(fieldName: keyof Dataset): boolean {
    return this.datasetForm.enabled && !this.datasetForm.controls[fieldName].valid;
  }

  fieldHasValue(fieldName: keyof Dataset): boolean {
    return !!this.datasetForm.controls[fieldName].value;
  }

  clearField(fieldName: keyof Dataset): void {
    this.datasetForm.controls[fieldName].setValue('');
    this.datasetForm.markAsDirty();
  }

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

  returnLanguages(): void {
    this.countries.getLanguages().subscribe(
      (result) => {
        this.languageOptions = result;
        if (this.datasetData && this.languageOptions) {
          if (this.datasetData.language) {
            for (let i = 0; i < this.languageOptions.length; i++) {
              if (this.languageOptions[i].enum === this.datasetData.language.enum) {
                this.selectedLanguage = this.languageOptions[i];
              }
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

  buildForm(): void {
    this.datasetForm = this.fb.group({
      datasetName: ['', [Validators.required]],
      dataProvider: [''],
      provider: ['', [Validators.required]],
      intermediateProvider: [''],
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

  updateForm(): void {
    this.datasetForm.patchValue(this.datasetData);
    this.datasetForm.patchValue({ country: this.selectedCountry });
    this.datasetForm.patchValue({ language: this.selectedLanguage });
  }

  reset(): void {
    this.notification = undefined;
    this.updateForm();
    this.datasetForm.markAsPristine();
  }

  saveTempData(): void {
    if (this.isNew) {
      localStorage.setItem(DATASET_TEMP_LSKEY, JSON.stringify(this.datasetForm.value));
    }
  }

  onSubmit(): void {
    if (!this.datasetForm.valid) {
      return;
    }

    const handleError = (err: HttpErrorResponse): void => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);

      this.isSaving = false;
    };

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

  cancel(): void {
    localStorage.removeItem(DATASET_TEMP_LSKEY);
    this.router.navigate(['/dashboard']);
  }

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
