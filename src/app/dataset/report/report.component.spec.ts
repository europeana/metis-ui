import { async, ComponentFixture, TestBed, tick, fakeAsync, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BaseRequestOptions, ConnectionBackend, Http, RequestOptions } from '@angular/http';

import { ReportComponent } from './report.component';

import { WorkflowService, AuthenticationService, TranslateService } from '../../_services';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ ReportComponent, TranslatePipe ],
      providers: [ 
      {provide: WorkflowService, useClass: MockWorkflowService}, 
      AuthenticationService, 
      { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
      }]

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
