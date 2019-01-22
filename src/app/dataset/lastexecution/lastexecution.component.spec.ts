import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createMockPipe, mockWorkflowExecutionResults } from '../../_mocked';

import { LastExecutionComponent } from '.';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LastExecutionComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow'),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a report', () => {
    spyOn(component.setReportRequest, 'emit');
    component.openReport('123', 'validation');
    fixture.detectChanges();
    expect(component.setReportRequest.emit).toHaveBeenCalledWith({
      taskId: '123',
      topology: 'validation',
    });
  });

  it('should display history in panel', () => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[4];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });
});
