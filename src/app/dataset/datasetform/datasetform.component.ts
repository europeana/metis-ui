import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CountriesService } from '../../_services';

@Component({
  selector: 'app-datasetform',
  templateUrl: './datasetform.component.html',
  styleUrls: ['./datasetform.component.scss'],
  providers: [CountriesService]
})

export class DatasetformComponent implements OnInit {

  private datasetForm: FormGroup;
  private countryOptions;
  private languageOptions;

  constructor(private countries: CountriesService) { }

  ngOnInit() {

    this.countryOptions = this.countries.getCountries();
    this.languageOptions = this.countries.getLanguages();

    this.datasetForm = new FormGroup({
      'identifier': new FormControl('2024913', [Validators.required]),
      'datasetName': new FormControl('2024913_Photocons_LPDP', [Validators.required]),
      'dataProvider': new FormControl(''),
      'provider': new FormControl('provider', [Validators.required]),
      'intermediateProvider': new FormControl(''),
      'dateCreated': new FormControl(''),
      'dateUpdated': new FormControl(''),
      'status': new FormControl('status', [Validators.required]),
      'replaces': new FormControl(''),
      'replacedBy': new FormControl(''),
      'country': new FormControl(''),
      'description': new FormControl(''),
      'notes': new FormControl(''),
      'createdBy': new FormControl(''),
      'assignedTo': new FormControl(''),
      'firstPublished': new FormControl(''),
      'lastPublished': new FormControl(''),
      'numberOfItemsPublished': new FormControl(''),
      'lastDateHarvest': new FormControl(''),
      'numberOfItemsHarvested': new FormControl(''),
      'lastDateSubmission': new FormControl(''),
      'numberOfItemsDelivered': new FormControl(''),
      'acceptanceStep': new FormControl('acceptancestep', [Validators.required]),
      'harvestProtocol': new FormControl(''),
      'metadataSchema': new FormControl(''),
      'harvestUrl': new FormControl(''),
      'setSpec': new FormControl(''),
      'metadataFormat': new FormControl(''),
      'recordXPath': new FormControl(''),
      'ftpHttpUser': new FormControl(''),
      'ftpHttpPassword': new FormControl(''),
      'url': new FormControl(''),
      'path': new FormControl(''),
      'serverAddress': new FormControl(''),
      'folderPath': new FormControl('')
    });

  }

}
