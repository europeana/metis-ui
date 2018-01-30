import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Params, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { DatasetformComponent } from './datasetform.component';
import { CountriesService, DatasetsService, AuthenticationService, RedirectPreviousUrl, ErrorService } from '../../_services';

import { ReactiveFormsModule } from '@angular/forms';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { DatasetServiceStub } from '../../_mocked';

describe('DatasetformComponent', () => {
  
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let mockParams, mockActivatedRoute;

  let tempDatasetsService;
   
  beforeEach(() => {
    
    mockParams = Observable.of<Params>({id: '10'});
    mockActivatedRoute = {params: mockParams};    

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
