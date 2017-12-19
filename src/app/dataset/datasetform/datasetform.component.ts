import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';

import { CountriesService, ProvidersService, DatasetsService } from '../../_services';
import { Dataset } from '../../_models';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  providers: [CountriesService, ProvidersService, DatasetsService]
})

export class DatasetformComponent implements OnInit {

  datasetData: Dataset;
  autosuggest;
  autosuggestId: String;
  datasetOptions: Object;
  providerOptions;
  activeSet;
  formMode: String = 'create'; // create, read, update
  successMessage;
  harvestprotocol; 
  
  constructor(private countries: CountriesService,
    private datasets: DatasetsService,
    private providers: ProvidersService,
    private route: ActivatedRoute, 
    private fb: FormBuilder) {}

  private datasetForm: FormGroup;
  private countryOptions;
  private languageOptions;

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.activeSet = +params['id']; 
    });

    if (!this.activeSet) {
      this.formMode = 'create';
    } else {
      this.formMode = 'read';
      this.datasetData = this.datasets.getDataset(this.activeSet);
    }

    this.countryOptions = this.countries.getCountries();
    this.languageOptions = this.countries.getLanguages();
    this.providerOptions = this.providers.getProviders();

    this.datasetForm = this.fb.group({
      identifier: [(this.datasetData ? this.datasetData.id : ''), [Validators.required]],
      datasetName: [(this.datasetData ? this.datasetData.name : ''), [Validators.required]],
      dataProvider: [''],
      provider: [(this.datasetData ? this.datasetData.provider : ''), [Validators.required]],
      intermediateProvider: [''],
      deaSigned: [''],
      dateCreated: [''],
      dateUpdated: [''],
      status: [(this.datasetData ? this.datasetData.workflow.name : ''), [Validators.required]],
      replaces: [''],
      replacedBy: [''],
      country: [(this.datasetData ? this.datasetData.country : '')],
      language: [(this.datasetData ? this.datasetData.language : '')],
      description: [''],
      notes: [''],
      createdBy: [''],
      assignedTo: [''],
      firstPublished: [(this.datasetData ? this.datasetData.startDate : '')],
      lastPublished: [(this.datasetData ? this.datasetData.lastPublicationDate : '')],
      numberOfItemsPublished: [(this.datasetData ? this.datasetData.publishedRecords : '')],
      lastDateHarvest: [''],
      numberOfItemsHarvested: [''],
      lastDateSubmission: [''],
      numberOfItemsDelivered: [''],
      acceptanceStep: ['acceptancestep', [Validators.required]],
      harvestProtocol: [(this.datasetData ? this.datasetData.harvestprotocol : '')],
      metadataSchema: [''],
      harvestUrl: [''],
      setSpec: [''],
      metadataFormat: [''],
      recordXPath: [''],
      ftpHttpUser: [''],
      ftpHttpPassword: [''],
      url: [''],
      path: [''],
      serverAddress: [''],
      folderPath: ['']
    });

    this.harvestprotocol = (this.datasetData ? this.datasetData.harvestprotocol : '');

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
    this.datasetForm.controls['lastDateSubmission'].disable();
    this.datasetForm.controls['numberOfItemsDelivered'].disable();
    
    if (this.formMode == 'read') {
      this.datasetForm.controls['datasetName'].disable();
      this.datasetForm.controls['dataProvider'].disable();
      this.datasetForm.controls['provider'].disable();
      this.datasetForm.controls['intermediateProvider'].disable();
      this.datasetForm.controls['deaSigned'].disable();
      this.datasetForm.controls['replaces'].disable();
      this.datasetForm.controls['replacedBy'].disable();
      this.datasetForm.controls['country'].disable();
      this.datasetForm.controls['language'].disable();
      this.datasetForm.controls['description'].disable();
      this.datasetForm.controls['notes'].disable();
      this.datasetForm.controls['assignedTo'].disable();
      this.datasetForm.controls['acceptanceStep'].disable();
      this.datasetForm.controls['harvestProtocol'].disable();
      this.datasetForm.controls['metadataSchema'].disable();
      this.datasetForm.controls['harvestUrl'].disable();
      this.datasetForm.controls['setSpec'].disable();
      this.datasetForm.controls['metadataFormat'].disable();
      this.datasetForm.controls['recordXPath'].disable();
      this.datasetForm.controls['ftpHttpUser'].disable();
      this.datasetForm.controls['ftpHttpPassword'].disable();
      this.datasetForm.controls['url'].disable();
      this.datasetForm.controls['path'].disable();
      this.datasetForm.controls['serverAddress'].disable();
      this.datasetForm.controls['folderPath'].disable();
    }

  }

  searchDataset(event) {
    this.datasetOptions = this.datasets.searchDatasets(event.target.value);
    this.autosuggest = event.target;
    this.autosuggestId = event.target.id;
  }

  selectDataset(datasetname) {
    this.autosuggest.value = datasetname;
    this.datasetOptions = '';
    this.autosuggest = '';
    this.autosuggestId = '';
  }

  onSubmit() {
    this.successMessage = 'SUBMIT OK - ';
    for (let x in this.datasetForm.value) {
      this.successMessage += x + ': ' + this.datasetForm.value[x] + ' --- ';
    }
    window.scrollTo(0, 0);
  }

  updateForm() {
    this.formMode = 'update';

    this.datasetForm.controls['datasetName'].enable();
    this.datasetForm.controls['dataProvider'].enable();
    this.datasetForm.controls['deaSigned'].enable();
    this.datasetForm.controls['replaces'].enable();
    this.datasetForm.controls['replacedBy'].enable();
    this.datasetForm.controls['country'].enable();
    this.datasetForm.controls['language'].enable();
    this.datasetForm.controls['description'].enable();
    this.datasetForm.controls['notes'].enable();
    this.datasetForm.controls['assignedTo'].enable();
    this.datasetForm.controls['acceptanceStep'].enable();
    this.datasetForm.controls['harvestProtocol'].enable();
    this.datasetForm.controls['metadataSchema'].enable();
    this.datasetForm.controls['harvestUrl'].enable();
    this.datasetForm.controls['setSpec'].enable();
    this.datasetForm.controls['metadataFormat'].enable();
    this.datasetForm.controls['recordXPath'].enable();
    this.datasetForm.controls['ftpHttpUser'].enable();
    this.datasetForm.controls['ftpHttpPassword'].enable();
    this.datasetForm.controls['url'].enable();
    this.datasetForm.controls['path'].enable();
    this.datasetForm.controls['serverAddress'].enable();
    this.datasetForm.controls['folderPath'].enable();

    window.scrollTo(0, 0);
  }

}
