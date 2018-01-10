import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/Rx';

import { CountriesService, ProvidersService, DatasetsService, AuthenticationService } from '../../_services';
import { StringifyHttpError, convertDate } from '../../_helpers';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss']
})

export class DatasetformComponent implements OnInit {

  @Input() datasetData: any;
  autosuggest;
  autosuggestId: String;
  datasetOptions: Object;
  providerOptions;
  activeSet;
  formMode: String = 'create'; // create, read, update
  errorMessage;
  successMessage;
  harvestprotocol; 

  private datasetForm: FormGroup;
  private countryOptions;
  private languageOptions;

 
  constructor(private countries: CountriesService,
    private datasets: DatasetsService,
    private providers: ProvidersService,
    private authentication: AuthenticationService,
    private route: ActivatedRoute, 
    private router: Router,
    private fb: FormBuilder) {}

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.activeSet = +params['id']; 
    });

    if (!this.activeSet) {
      this.formMode = 'create';
    } else {
      this.formMode = 'read';
    }

    this.countryOptions = this.countries.getCountries();
    this.languageOptions = this.countries.getLanguages();
    this.providerOptions = this.providers.getProviders();

    this.buildForm();

  }

  /* buildForm
    creates a new form
    if datasetid exists: prefill form
    disable/enable fields
  */
  buildForm() {
     /* populated the form or leave empty when creating a new dataset */
    this.datasetForm = this.fb.group({
      identifier: [(this.datasetData ? this.datasetData.datasetId : ''), [Validators.required]],
      datasetName: [(this.datasetData ? this.datasetData.datasetName : ''), [Validators.required]],
      dataProvider: [(this.datasetData ? this.datasetData.dataProvider : '')],
      provider: [(this.datasetData ? this.datasetData.provider : ''), [Validators.required]],
      intermediateProvider: [(this.datasetData ? this.datasetData.intermediateProvider : '')],
      dateCreated: [(this.datasetData ? convertDate(this.datasetData.createdDate) : '')],
      dateUpdated: [(this.datasetData ? convertDate(this.datasetData.updatedDate) : '')],
      status: [(this.datasetData ? this.datasetData.datasetStatus : ''), [Validators.required]],
      replaces: [(this.datasetData ? this.datasetData.replaces : '')],
      replacedBy: [(this.datasetData ? this.datasetData.replacedBy : '')],
      country: [(this.datasetData ? this.datasetData.country : '')],
      language: [(this.datasetData ? this.datasetData.language : '')],
      description: [(this.datasetData ? this.datasetData.description : '')],
      notes: [(this.datasetData ? this.datasetData.notes : '')],
      createdBy: [(this.datasetData ? this.datasetData.createdByUserId : '')],
      firstPublished: [(this.datasetData ? convertDate(this.datasetData.firstPublishedDate) : '')],
      lastPublished: [(this.datasetData ? convertDate(this.datasetData.lastPublishedDate) : '')],
      numberOfItemsPublished: [(this.datasetData ? this.datasetData.publishedRecords : '')],
      lastDateHarvest: [(this.datasetData ? convertDate(this.datasetData.harvestedDate) : '')],
      numberOfItemsHarvested: [(this.datasetData ? this.datasetData.harvestedRecords : '')],
      pluginType: [''],
      harvestUrl: [(this.datasetData ? this.datasetData.harvestingMetadata.url : '')],
      setSpec: [(this.datasetData ? this.datasetData.harvestingMetadata.setSpec : '')],
      metadataFormat: [(this.datasetData ? this.datasetData.harvestingMetadata.metadataFormat : '')],
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

    /* disable fields depening on mode and restrictions */
    this.datasetForm.controls['identifier'].disable();      
    this.datasetForm.controls['dateCreated'].disable();
    this.datasetForm.controls['dateUpdated'].disable();
    this.datasetForm.controls['status'].disable();    
    this.datasetForm.controls['createdBy'].disable();    
    this.datasetForm.controls['firstPublished'].disable();
    this.datasetForm.controls['lastPublished'].disable();
    this.datasetForm.controls['numberOfItemsPublished'].disable();
    this.datasetForm.controls['lastDateHarvest'].disable();
    this.datasetForm.controls['numberOfItemsHarvested'].disable();
    
    if (this.formMode == 'read') { 
      this.datasetForm.controls['datasetName'].disable();
      this.datasetForm.controls['dataProvider'].disable();
      this.datasetForm.controls['provider'].disable();
      this.datasetForm.controls['intermediateProvider'].disable();
      this.datasetForm.controls['replaces'].disable();
      this.datasetForm.controls['replacedBy'].disable();
      this.datasetForm.controls['country'].disable();
      this.datasetForm.controls['language'].disable();
      this.datasetForm.controls['description'].disable();
      this.datasetForm.controls['notes'].disable();
      this.datasetForm.controls['pluginType'].disable();
      this.datasetForm.controls['harvestUrl'].disable();
      this.datasetForm.controls['setSpec'].disable();
      this.datasetForm.controls['metadataFormat'].disable();
      this.datasetForm.controls['recordXPath'].disable();
      this.datasetForm.controls['ftpHttpUser'].disable();
      this.datasetForm.controls['ftpHttpPassword'].disable();
      this.datasetForm.controls['url'].disable();
    }

  }

  /* searchDataset
    searches in all datasets
    creates an autosuggest field
  */
  searchDataset(event) {
    this.datasetOptions = this.datasets.searchDatasets(event.target.value);
    this.autosuggest = event.target;
    this.autosuggestId = event.target.id;
  }

  /* selectDataset
    select a dataset
    from the autosuggest field
  */
  selectDataset(datasetname) {
    this.autosuggest.value = datasetname;
    this.datasetOptions = '';
    this.autosuggest = '';
    this.autosuggestId = '';
  }

  /* onSubmit
    submits the form and shows an error or success message
  */
  onSubmit() {

    this.successMessage = '';
    this.errorMessage = '';

    this.datasetForm.value.harvestingMetadata = {
      pluginType: this.datasetForm.value.pluginType ? this.datasetForm.value.pluginType : 'VOID',
      mocked: true,
      url: this.datasetForm.value.harvestUrl ? this.datasetForm.value.harvestUrl : '',
      metadataFormat: this.datasetForm.value.metadataFormat ? this.datasetForm.value.metadataFormat : '',
      setSpec: this.datasetForm.value.setSpec ? this.datasetForm.value.setSpec : ''
    };

    delete this.datasetForm.value['pluginType'];
    delete this.datasetForm.value['harvestUrl'];
    delete this.datasetForm.value['metadataFormat'];
    delete this.datasetForm.value['setSpec'];

    this.datasets.createDataset(this.datasetForm.value).subscribe(result => {
      
      this.datasets.setDatasetMessage('New dataset created! Id: ' + result['datasetId']);
      this.router.navigate(['/dataset/new/' + result['datasetId']]);
    
    }, (err: HttpErrorResponse) => {

      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }

      this.errorMessage = `Not able to load this dataset: ${StringifyHttpError(err)}`;  

    });

    window.scrollTo(0, 0);

  }

  /* updateForm
    update an existing dataset
    using (new) values from the form
    show an error or success message
  */
  updateForm() {
    this.formMode = 'update';

    this.datasetForm.controls['datasetName'].enable();
    this.datasetForm.controls['dataProvider'].enable();
    this.datasetForm.controls['replaces'].enable();
    this.datasetForm.controls['replacedBy'].enable();
    this.datasetForm.controls['country'].enable();
    this.datasetForm.controls['language'].enable();
    this.datasetForm.controls['description'].enable();
    this.datasetForm.controls['notes'].enable();
    this.datasetForm.controls['pluginType'].enable();
    this.datasetForm.controls['metadataSchema'].enable();
    this.datasetForm.controls['harvestUrl'].enable();
    this.datasetForm.controls['setSpec'].enable();
    this.datasetForm.controls['metadataFormat'].enable();
    this.datasetForm.controls['recordXPath'].enable();
    this.datasetForm.controls['ftpHttpUser'].enable();
    this.datasetForm.controls['ftpHttpPassword'].enable();
    this.datasetForm.controls['url'].enable();

    //this.datasets.updateDataset(this.datasetForm.value).subscribe(result => {
    //  console.log('updateForm', result);
    //});

    window.scrollTo(0, 0);
  }

}
