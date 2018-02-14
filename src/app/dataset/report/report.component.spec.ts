import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BaseRequestOptions, ConnectionBackend, Http, RequestOptions } from '@angular/http';

import { ReportComponent } from './report.component';
import { WorkflowService, AuthenticationService } from '../../_services';
import {MockBackend, MockConnection} from '@angular/http/testing';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let spy: any;

  const mockHttpProvider = {  
    deps: [ MockBackend, BaseRequestOptions ],
    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
      return new Http(backend, defaultOptions);
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ ReportComponent ],
      providers: [ WorkflowService, AuthenticationService, MockBackend ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should close the report window', () => {
    component.closeReport();
    fixture.detectChanges();
    expect(component.report).toEqual(undefined);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
