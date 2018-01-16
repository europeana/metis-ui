import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Params, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { DatasetformComponent } from './datasetform.component';
import { CountriesService, DatasetsService, ProvidersService, AuthenticationService } from '../../_services';

import { ReactiveFormsModule } from '@angular/forms';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('DatasetformComponent', () => {
  
  let component: DatasetformComponent;
  let fixture: ComponentFixture<DatasetformComponent>;
  let mockParams, mockActivatedRoute;

  beforeEach(async(() => {

    mockParams = Observable.of<Params>({id: '10'});
    mockActivatedRoute = {params: mockParams};

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, ReactiveFormsModule, HttpClientModule ],
      declarations: [ DatasetformComponent ],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }, 
        CountriesService, 
        DatasetsService,
        ProvidersService,
        AuthenticationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
