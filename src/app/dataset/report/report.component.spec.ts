import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { ReportComponent } from './report.component';

import { WorkflowService, TranslateService, ErrorService, RedirectPreviousUrl, DatasetsService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { MockDatasetService, MockWorkflowService, MockTranslateService } from '../../_mocked';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ ReportComponent, TranslatePipe ],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
        ErrorService,
        RedirectPreviousUrl
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should close the report window', () => {
    spyOn(component.closed, 'emit');
    component.closeReport();
    fixture.detectChanges();
    expect(component.closed.emit).toHaveBeenCalledWith();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
