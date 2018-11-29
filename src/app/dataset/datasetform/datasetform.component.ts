import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService, WorkflowService } from '../../_services';
import { StringifyHttpError } from '../../_helpers';
import { Language } from '../../_models/language';
import { Country } from '../../_models/country';
import { HarvestData } from '../../_models/harvest-data';
import { Dataset } from '../../_models/dataset';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  providers: [DatePipe]
})
export class DatasetformComponent implements OnInit {

  @Input() datasetData: Dataset;
  @Input() harvestPublicationData: HarvestData;
  @Input() isNew: boolean;

  @Output() setSuccessMessage = new EventEmitter<string | undefined>();

  formMode: 'create' | 'read' | 'update' = 'create';
  errorMessage?: string;
  successMessage?: string;
  harvestprotocol?: string;
  selectedCountry?: Country;
  selectedLanguage?: Language;

  datasetForm: FormGroup;
  countryOptions: Country[];
  languageOptions: Language[];

  constructor(private countries: CountriesService,
    private workflows: WorkflowService,
    private datasets: DatasetsService,
    private authentication: AuthenticationService,
    private router: Router,
    private fb: FormBuilder,
    private redirectPreviousUrl: RedirectPreviousUrl,
    private errors: ErrorService,
    private datePipe: DatePipe,
    private translate: TranslateService) {}

  ngOnInit(): void {
    this.formMode = this.isNew ? 'create' : 'read';

    this.translate.use('en');

    this.returnCountries();
    this.returnLanguages();
    this.buildForm();
  }

  returnCountries(): void {
    this.countries.getCountries().subscribe(result => {
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
      this.buildForm(); // TODO: updateForm?
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  returnLanguages(): void {
    this.countries.getLanguages().subscribe(result => {
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
      this.buildForm(); // TODO: updateForm?
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  buildForm(): void {
    this.datasetForm = this.fb.group({
      datasetId: [(this.datasetData ? this.datasetData.datasetId : '')],
      datasetName: [(this.datasetData ? this.datasetData.datasetName : ''), [Validators.required]],
      dataProvider: [(this.datasetData ? this.datasetData.dataProvider : '')],
      provider: [(this.datasetData ? this.datasetData.provider : ''), [Validators.required]],
      intermediateProvider: [(this.datasetData ? this.datasetData.intermediateProvider : '')],
      dateCreated: [(this.datasetData ? this.datePipe.transform(this.datasetData.createdDate, 'dd/MM/yyyy - HH:mm') : '')],
      dateUpdated: [(this.datasetData ? this.datePipe.transform(this.datasetData.updatedDate, 'dd/MM/yyyy - HH:mm') : '')],
      replaces: [(this.datasetData ? this.datasetData.replaces : '')],
      replacedBy: [(this.datasetData ? this.datasetData.replacedBy : '')],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      description: [(this.datasetData ? this.datasetData.description : '')],
      notes: [(this.datasetData ? this.datasetData.notes : '')],
      createdBy: [(this.datasetData ? this.datasetData.createdByUserId : '')],
      firstPublished: [(this.harvestPublicationData ? this.datePipe.transform(this.harvestPublicationData.firstPublishedDate, 'dd/MM/yyyy - HH:mm') : '')],
      lastPublished: [(this.harvestPublicationData ? this.datePipe.transform(this.harvestPublicationData.lastPublishedDate, 'dd/MM/yyyy - HH:mm')  : '')],
      numberOfItemsPublished: [(this.harvestPublicationData ? this.harvestPublicationData.lastPublishedRecords : '')],
      lastDateHarvest: [(this.harvestPublicationData ? this.datePipe.transform(this.harvestPublicationData.lastHarvestedDate, 'dd/MM/yyyy - HH:mm') : '')],
      numberOfItemsHarvested: [(this.harvestPublicationData ? this.harvestPublicationData.lastHarvestedRecords : '')]
    });

    this.datasetForm.patchValue({country: this.selectedCountry});
    this.datasetForm.patchValue({language: this.selectedLanguage});

    if (this.formMode === 'read') {
      this.datasetForm.controls['country'].disable();
      this.datasetForm.controls['language'].disable();
      this.datasetForm.controls['description'].disable();
      this.datasetForm.controls['notes'].disable();
    }
  }

  saveTempData(): void {
    if (this.formMode === 'create') {
      this.formatFormValues();
      localStorage.removeItem('tempDatasetData');
      localStorage.setItem('tempDatasetData', JSON.stringify(this.datasetForm.value));
    }
  }

  /** formatFormValues
  /* some field values need formating before sending them to the backend
  */
  formatFormValues(): void {
    if (!this.datasetForm.value['country']) {
      this.datasetForm.value['country'] = null;
    }

    if (!this.datasetForm.value['language']) {
      this.datasetForm.value['language'] = null;
    }
  }

  onSubmit(): void {
    this.successMessage = undefined;
    this.errorMessage = undefined;
    this.formatFormValues();

    const datasetValues = { dataset: this.datasetForm.value };
    if (this.formMode === 'update') {
      this.datasets.updateDataset(datasetValues).subscribe(() => {
        localStorage.removeItem('tempDatasetData');
        this.successMessage = 'Dataset updated!';
        this.formMode = 'read';

        this.datasetForm.controls['country'].disable();
        this.datasetForm.controls['language'].disable();
        this.datasetForm.controls['description'].disable();
        this.datasetForm.controls['notes'].disable();
      }, (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
      });
    } else {
      this.datasets.createDataset(this.datasetForm.value).subscribe(result => {
        localStorage.removeItem('tempDatasetData');
        this.setSuccessMessage.emit('New dataset created! Id: ' + result['datasetId']);
        this.router.navigate(['/dataset/new/' + result['datasetId']]);
      }, (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
      });
    }

    window.scrollTo(0, 0);
  }

  cancel(): void {
    localStorage.removeItem('tempDatasetData');
    if (this.formMode === 'update') {
      this.formMode = 'read';

      this.datasetForm.controls['country'].disable();
      this.datasetForm.controls['language'].disable();
      this.datasetForm.controls['description'].disable();
      this.datasetForm.controls['notes'].disable();
    } else {
      this.router.navigate(['/dashboard']);
    }

    window.scrollTo(0, 0);
  }

  editForm(): void {
    this.formMode = 'update';
    this.setSuccessMessage.emit(undefined);
    this.errorMessage = undefined;
    this.successMessage = undefined;

    this.datasetForm.controls['country'].enable();
    this.datasetForm.controls['language'].enable();
    this.datasetForm.controls['description'].enable();
    this.datasetForm.controls['notes'].enable();

    window.scrollTo(0, 0);
  }
}
