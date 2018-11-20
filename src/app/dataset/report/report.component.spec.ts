import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { ReportComponent } from './report.component';

import { WorkflowService, AuthenticationService, TranslateService, ErrorService, RedirectPreviousUrl } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { MockWorkflowService, MockAuthenticationService, MockTranslateService } from '../../_mocked';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ ReportComponent, TranslatePipe ],
      providers: [
      {provide: WorkflowService, useClass: MockWorkflowService},
      { provide: AuthenticationService, useClass: MockAuthenticationService },
      { provide: TranslateService, useClass: MockTranslateService },
      ErrorService,
      RedirectPreviousUrl]

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
