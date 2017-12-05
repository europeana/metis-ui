import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';

import { CountriesService, ProvidersService, DatasetsService } from '../../_services';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  providers: [CountriesService, ProvidersService, DatasetsService]
})

export class DatasetformComponent implements OnInit {

  datasetForm: FormGroup;
  autosuggest;
  autosuggestId: String;
  datasetOptions: Object;
  providerOptions;
  countryOptions;
  languageOptions;
  activeSet;
  editMode: Boolean = false;
  
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
    }

    this.countryOptions = this.countries.getCountries();
    this.languageOptions = this.countries.getLanguages();
    this.providerOptions = this.providers.getProviders();

    this.datasetForm = this.fb.group({
      identifier: ['2024913', [Validators.required]],
      datasetName: ['2024913_Photocons_LPDP', [Validators.required]],
      dataProvider: [''],
      provider: ['', [Validators.required]],
      intermediateProvider: [''],
      dateCreated: [''],
      dateUpdated: [''],
      tatus: ['status', [Validators.required]],
      replaces: [''],
      replacedBy: [''],
      country: [''],
      description: [''],
      notes: [''],
      createdBy: [''],
      assignedTo: [''],
      firstPublished: [''],
      lastPublished: [''],
      numberOfItemsPublished: [''],
      lastDateHarvest: [''],
      numberOfItemsHarvested: [''],
      lastDateSubmission: [''],
      numberOfItemsDelivered: [''],
      acceptanceStep: ['acceptancestep', [Validators.required]],
      harvestProtocol: [''],
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

}
