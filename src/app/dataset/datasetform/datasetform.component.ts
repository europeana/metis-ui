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
  datasetForm: FormGroup;
  autosuggest;
  autosuggestId: String;
  datasetOptions: Object;
  providerOptions;
  countryOptions;
  languageOptions;
  activeSet;
  editMode: Boolean = false;
  successMessage;
  harvestprotocol; 
  
  constructor(private countries: CountriesService,
    private datasets: DatasetsService,
    private providers: ProvidersService,
    private route: ActivatedRoute, 
    private fb: FormBuilder) {}

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.activeSet = +params['id']; 
    });

    if (!this.activeSet) {
      this.editMode = false;
    } else {
      this.editMode = true;
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
      dateCreated: [''],
      dateUpdated: [''],
      status: [(this.datasetData ? this.datasetData.workflow.name : ''), [Validators.required]],
      replaces: [''],
      replacedBy: [''],
      country: [(this.datasetData ? this.datasetData.country : '')],
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

}
