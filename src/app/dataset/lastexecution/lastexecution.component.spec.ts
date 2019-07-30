import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from '../../_mocked';

import { LastExecutionComponent } from '.';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LastExecutionComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

  it('should open a simple report', () => {
    spyOn(component.setReportMsg, 'emit');
    component.openFailReport({});
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalled();
  });
});
