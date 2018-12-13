import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MockErrorService, MockWorkflowService } from '../../_mocked';
import { ErrorService, WorkflowService } from '../../_services';

import { ReportComponent } from '.';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportComponent],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
