import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkflowService, AuthenticationService } from '../../_services';

import { DatasetlogComponent } from './datasetlog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DatasetlogComponent', () => {
  let component: DatasetlogComponent;
  let fixture: ComponentFixture<DatasetlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ DatasetlogComponent ],
      providers: [ WorkflowService, AuthenticationService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
