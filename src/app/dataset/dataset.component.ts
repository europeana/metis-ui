import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router }   from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';
import { CountriesService } from '../services/countries.service';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
  providers: [AuthenticationService, CountriesService]
})

export class DatasetComponent implements OnInit {

  constructor(private http: HttpClient, 
    private authentication: AuthenticationService, 
    private countries: CountriesService,
    public router: Router) { }

  datasetForm: FormGroup;
  countryOptions;
  languageOptions;
  user: {};
  userRole: string;
  editMode = false; // if not edit, then create

  ngOnInit() {

    this.authentication.redirectLogin();

    this.user = this.authentication.getUserInfo(1);
    this.userRole = this.user['role'];

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

  onSubmit() {
    console.log('submit');
  }

}
