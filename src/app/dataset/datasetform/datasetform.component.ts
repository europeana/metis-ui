import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import 'rxjs/Rx';

import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { StringifyHttpError } from '../../_helpers';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  providers: [DatePipe]
})

export class DatasetformComponent implements OnInit {

  @Input() datasetData: any;
  autosuggest;
  autosuggestId: string;
  datasetOptions: object;
  formMode: string = 'create'; // possible options: create, read, update
  formSubmitted: boolean;
  errorMessage;
  successMessage;
  harvestprotocol; 
  selectedCountry;
  selectedLanguage;

  private datasetForm: FormGroup;
  private countryOptions: any;
  private languageOptions: any;
 
  constructor(private countries: CountriesService,
    private datasets: DatasetsService,
    private authentication: AuthenticationService,
    private route: ActivatedRoute, 
    private router: Router,
    private fb: FormBuilder, 
    private RedirectPreviousUrl: RedirectPreviousUrl,
    private errors: ErrorService,
    private datePipe: DatePipe,
    private translate: TranslateService) {}

  /** ngOnInit
  /* init of this component
  /* check for temp dataset information
  /* set translation languages
  /* get countries and languages
  /* build the dataset form
  */
  ngOnInit() {

    if (!this.datasetData) {      
      const tempdata = JSON.parse(localStorage.getItem('tempDatasetData')); // something in localstorage? 
      this.datasetData = tempdata;
      this.formMode = 'create';
    } else {
      this.formMode = 'read';
    }

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
    
    this.returnCountries();
    this.returnLanguages();

    this.buildForm();
    
  }

  /** returnCountries
  /* return all countries
  /* list can be used in form
  */
  returnCountries() {    
    this.countries.getCountriesLanguages('country').subscribe(result => {
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
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);     
    });
  }

  /** returnLanguages
  /* return all languages
  /* list can be used in form
  */
  returnLanguages() {
    this.countries.getCountriesLanguages('language').subscribe(result => {
      this.languageOptions = result;
      if (this.datasetData && result) {
        if (this.datasetData.language) {
          for (let i = 0; i < this.languageOptions.length; i++) {
            if (this.languageOptions[i].enum === this.datasetData.language.enum) {
              this.selectedLanguage = this.languageOptions[i];
            }
          }
        }
      }
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
  buildForm() {
    this.datasetForm = this.fb.group({
      datasetId: [(this.datasetData ? this.datasetData.datasetId : '')],
      datasetName: [(this.datasetData ? this.datasetData.datasetName : ''), [Validators.required]],
      dataProvider: [(this.datasetData ? this.datasetData.dataProvider : '')],
      provider: [(this.datasetData ? this.datasetData.provider : ''), [Validators.required]],
      intermediateProvider: [(this.datasetData ? this.datasetData.intermediateProvider : '')],
      dateCreated: [(this.datasetData ? this.datePipe.transform(this.datasetData.createdDate, 'dd/MM/yyyy - HH:mm') : '')],
      dateUpdated: [(this.datasetData ? this.datePipe.transform(this.datasetData.updatedDate, 'dd/MM/yyyy - HH:mm') : '')],
      status: [''],
      replaces: [(this.datasetData ? this.datasetData.replaces : '')],
      replacedBy: [(this.datasetData ? this.datasetData.replacedBy : '')],
      country: [],
      language: [(this.datasetData ? this.datasetData.language : '')],
      description: [(this.datasetData ? this.datasetData.description : '')],
      notes: [(this.datasetData ? this.datasetData.notes : '')],
      createdBy: [(this.datasetData ? this.datasetData.createdByUserId : '')],
      firstPublished: [''],
      lastPublished: [''],
      numberOfItemsPublished: [''],
      lastDateHarvest: [''],
      numberOfItemsHarvested: [''],
      pluginType: ['', [Validators.required]],
      harvestUrl: [(this.datasetData ? this.datasetData.harvestingMetadata.url : ''), [Validators.required]],
      setSpec: [(this.datasetData ? this.datasetData.harvestingMetadata.setSpec : '')],
      metadataFormat: [(this.datasetData ? this.datasetData.harvestingMetadata.metadataFormat : ''), [Validators.required]],
      recordXPath: [''],
      ftpHttpUser: [''],
      ftpHttpPassword: [''],
      url: ['']
    });

    if (this.datasetData) {
      if (this.datasetData.harvestingMetadata) {
        this.harvestprotocol = (this.datasetData ? this.datasetData.harvestingMetadata.pluginType : '');
      }
    }

    if (this.formMode == 'read') { 
      this.datasetForm.controls['country'].disable();
      this.datasetForm.controls['language'].disable();
      this.datasetForm.controls['description'].disable();
      this.datasetForm.controls['notes'].disable();
      this.datasetForm.controls['pluginType'].disable();
    }
  }

  /** saveTempData
  /* temporarily save form values
  /* after blur/change
  */
  saveTempData() {
    if (this.formMode === 'create') {
      this.formatFormValues();
      localStorage.removeItem('tempDatasetData');
      localStorage.setItem('tempDatasetData', JSON.stringify(this.datasetForm.value));
    }
  }

  /** formatFormValues
  /* some field values need formating before sending them to the backend
  */
  formatFormValues() {
    this.datasetForm.value.harvestingMetadata = {
      pluginType: this.datasetForm.value.pluginType ? this.datasetForm.value.pluginType : 'NULL',
      mocked: false,
      url: this.datasetForm.value.harvestUrl ? this.datasetForm.value.harvestUrl : '',
      metadataFormat: this.datasetForm.value.metadataFormat ? this.datasetForm.value.metadataFormat : '',
      setSpec: this.datasetForm.value.setSpec ? this.datasetForm.value.setSpec : ''
    };

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
  onSubmit() {

    this.successMessage = undefined;
    this.errorMessage = undefined;
    this.formatFormValues();

    let datasetValues = { 'dataset': this.datasetForm.value };       
    if (this.formMode === 'update') {
      this.datasets.updateDataset(datasetValues).subscribe(result => {
        localStorage.removeItem('tempDatasetData');
        this.successMessage = 'Dataset updated!';
        this.formMode = 'read';
        
        this.datasetForm.controls['country'].disable();
        this.datasetForm.controls['language'].disable();
        this.datasetForm.controls['description'].disable();
        this.datasetForm.controls['notes'].disable();
        this.datasetForm.controls['pluginType'].disable();          
      }, (err: HttpErrorResponse) => {
        let error = this.errors.handleError(err);
        this.errorMessage = `${StringifyHttpError(error)}`; 
      });
    } else {
      this.datasets.createDataset(this.datasetForm.value).subscribe(result => {        
        localStorage.removeItem('tempDatasetData');
        this.datasets.setDatasetMessage('New dataset created! Id: ' + result['datasetId']);
        this.router.navigate(['/dataset/new/' + result['datasetId']]);
      }, (err: HttpErrorResponse) => {
        let error = this.errors.handleError(err);
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
  updateForm() {
    this.formMode = 'update';
    this.datasets.setDatasetMessage('');
    this.errorMessage = undefined;
    this.successMessage = undefined;

    this.datasetForm.controls['country'].enable();
    this.datasetForm.controls['language'].enable();
    this.datasetForm.controls['description'].enable();
    this.datasetForm.controls['notes'].enable();
    this.datasetForm.controls['pluginType'].enable();
    
    window.scrollTo(0, 0);
  }   

}
