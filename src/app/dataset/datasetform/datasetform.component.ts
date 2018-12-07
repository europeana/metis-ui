import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Country } from '../../_models/country';
import { Dataset } from '../../_models/dataset';
import { HarvestData } from '../../_models/harvest-data';
import { Language } from '../../_models/language';
import {
  httpErrorNotification,
  Notification,
  successNotification,
} from '../../_models/notification';
import { CountriesService, DatasetsService, ErrorService } from '../../_services';
import { TranslateService } from '../../_translate';

type FormMode = 'show' | 'edit' | 'save';

const DATASET_TEMP_LSKEY = 'tempDatasetData';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
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

  _formMode: FormMode;

  set formMode(value: FormMode) {
    this._formMode = value;
    this.updateFormEnabled();
  }

  get formMode(): FormMode {
    return this._formMode;
  }

  constructor(
    private countries: CountriesService,
    private datasets: DatasetsService,
    private router: Router,
    private fb: FormBuilder,
    private errors: ErrorService,
    private translate: TranslateService,
  ) {}

  private updateFormEnabled(): void {
    if (this.datasetForm) {
      if (this.formMode === 'edit') {
        this.datasetForm.enable();
      } else {
        this.datasetForm.disable();
      }
    }
  }

  ngOnInit(): void {
    this.formMode = this.isNew ? 'edit' : 'show';

    this.translate.use('en');

    this.buildForm();
    this.returnCountries();
    this.returnLanguages();
  }

  returnCountries(): void {
    this.countries.getCountries().subscribe(
      (result) => {
        this.countryOptions = result;
        if (this.datasetData && this.countryOptions) {
          if (this.datasetData.country) {
            for (let i = 0; i < this.countryOptions.length; i++) {
              if (this.countryOptions[i].enum === this.datasetData.country.enum) {
                this.selectedCountry = this.countryOptions[i];
              }
            }
          }
        }
        this.updateForm();
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      },
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
      },
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
    });

    this.updateForm();
    this.updateFormEnabled();
  }

  updateForm(): void {
    this.datasetForm.patchValue(this.datasetData);
    this.datasetForm.patchValue({ country: this.selectedCountry });
    this.datasetForm.patchValue({ language: this.selectedLanguage });
  }

  saveTempData(): void {
    if (this.isNew) {
      localStorage.setItem(DATASET_TEMP_LSKEY, JSON.stringify(this.datasetForm.value));
    }
  }

  private scrollToTop(): void {
    const tabs = document.querySelector('.tabs');
    if (tabs) {
      tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onSubmit(): void {
    this.notification = undefined;

    this.formMode = 'save';
    if (this.isNew) {
      this.datasets.createDataset(this.datasetForm.value).subscribe(
        (result) => {
          localStorage.removeItem(DATASET_TEMP_LSKEY);

          this.router.navigate(['/dataset/new/' + result.datasetId]);
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);

          this.formMode = 'edit';
          this.scrollToTop();
        },
      );
    } else {
      const dataset = {
        datasetId: this.datasetData.datasetId,
        ...this.datasetForm.value,
      };
      this.datasets.updateDataset({ dataset }).subscribe(
        () => {
          localStorage.removeItem(DATASET_TEMP_LSKEY);
          this.notification = successNotification('Dataset updated!');
          this.datasetUpdated.emit();

          this.formMode = 'show';
          this.scrollToTop();
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);

          this.formMode = 'edit';
          this.scrollToTop();
        },
      );
    }
  }

  cancel(): void {
    localStorage.removeItem(DATASET_TEMP_LSKEY);
    this.notification = undefined;
    if (this.isNew) {
      this.router.navigate(['/dashboard']);
    } else {
      this.formMode = 'show';
      this.updateForm();
    }

    this.scrollToTop();
  }

  editForm(): void {
    this.formMode = 'edit';
    this.notification = undefined;

    this.scrollToTop();
  }
}
