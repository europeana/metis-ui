import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import 'rxjs';

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
  harvestPublicationData: HarvestData;
  autosuggest: string;
  autosuggestId: string;
  datasetOptions: object;
  formMode: 'create' | 'read' | 'update' = 'create';
  formSubmitted: boolean;
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

  /** ngOnInit
  /* init of this component
  /* check for temp dataset information
  /* if dataset exists, check for additional info on harvest and publication
  /* set translation languages
  /* get countries and languages
  /* build the dataset form
  */
  ngOnInit(): void {

    if (!this.datasetData) {
      const tempdata = JSON.parse(localStorage.getItem('tempDatasetData') || '{}');
      this.datasetData = tempdata;
      this.formMode = 'create';
    } else {
      this.formMode = 'read';
      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(result => {
        this.harvestPublicationData = result;
        this.buildForm();
      }, (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      });
    }

    this.translate.use('en');

    this.returnCountries();
    this.buildForm();
  }

  /** returnCountries
  /* return all countries
  /* list can be used in form
  */
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
      this.returnLanguages();
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  /** returnLanguages
  /* return all languages
  /* list can be used in form
  */
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
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  /** buildForm
  /* creates a new form
  /* populate the form or leave empty when creating a new dataset
  /* if datasetid exists: prefill form
  /* disable/enable fields
  */
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

  /** saveTempData
  /* temporarily save form values
  /* after blur/change
  */
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

  /** onSubmit
  /*  submits the form and shows an error or success message
  */
  onSubmit(): void {

    this.successMessage = undefined;
    this.errorMessage = undefined;
    this.formatFormValues();

    const datasetValues = { dataset: this.datasetForm.value };
    if (this.formMode === 'update') {
      this.datasets.updateDataset(datasetValues).subscribe(result => {
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
        this.datasets.setDatasetMessage('New dataset created! Id: ' + result['datasetId']);
        this.router.navigate(['/dataset/new/' + result['datasetId']]);
      }, (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`;
      });
    }

    window.scrollTo(0, 0);
  }

  /** updateForm
  /* update an existing dataset
  /* using (new) values from the form
  /* show an error or success message
  */
  updateForm(): void {
    this.formMode = 'update';
    this.datasets.setDatasetMessage('');
    this.errorMessage = undefined;
    this.successMessage = undefined;

    this.datasetForm.controls['country'].enable();
    this.datasetForm.controls['language'].enable();
    this.datasetForm.controls['description'].enable();
    this.datasetForm.controls['notes'].enable();

    window.scrollTo(0, 0);
  }
}
