import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Params, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { DatasetformComponent } from './datasetform.component';
import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService } from '../../_services';

import { ReactiveFormsModule } from '@angular/forms';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('DatasetformComponent', () => {
  
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let mockParams, mockActivatedRoute;

  let tempDatasetsService;
  let DatasetServiceStub;
   
  beforeEach(() => {
    
    mockParams = Observable.of<Params>({id: '10'});
    mockActivatedRoute = {params: mockParams};

    DatasetServiceStub = { 
      country: {enum: 'AZERBAIJAN', name: 'Azerbaijan', isoCode: 'AZ'},
      createdByUserId: '1482250000003948001',
      createdDate: '2018-01-16T07:31:20.865Z',
      dataProvider: '',
      datasetId: 84,
      datasetName: 'TestMirjam15',
      description:'',
      ecloudDatasetId: 'bb63d3b3-d9fa-4bad-ac50-d8fd4476dda1',
      harvestingMetadata: {pluginType: 'OAIPMH_HARVEST', mocked: true, url: '', metadataFormat: '', setSpec: ''},
      id: '5a5daa48a458bb00083d49bb',
      intermediateProvider: '',
      language: {enum: 'CY', name: 'Welsh'},
      notes: '',
      organizationId: '1482250000001617026',
      organizationName: 'Europeana Foundation',
      provider: '1234',
      replacedBy: '',
      replaces: '',
      updatedDate: '2018-01-16T11:04:14.103Z'
    }

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ DatasetformComponent ],
      providers:    [ 
        {provide: ActivatedRoute, useValue: mockActivatedRoute }, 
        {provide: DatasetsService, useValue: DatasetServiceStub }, 
        AuthenticationService, 
        CountriesService,
        ErrorService, 
        RedirectPreviousUrl ]
    });

    fixture = TestBed.createComponent(DatasetformComponent);
    component    = fixture.componentInstance;

    tempDatasetsService = TestBed.get(DatasetsService);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
