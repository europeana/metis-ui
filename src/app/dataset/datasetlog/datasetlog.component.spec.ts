import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  createMockPipe,
  MockErrorService,
  mockPluginExecution,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';

import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { DatasetlogComponent } from '.';

describe('DatasetlogComponent', () => {
  let component: DatasetlogComponent;
  let fixture: ComponentFixture<DatasetlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DatasetlogComponent, createMockPipe('translate')],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetlogComponent);
    component = fixture.componentInstance;
    component.showPluginLog = mockPluginExecution;
    fixture.detectChanges();
  });

  beforeEach(fakeAsync(() => {
    tick(0);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the logs', fakeAsync(() => {
    expect(component.logMessages).toBeFalsy();
    component.startPolling();
    tick(1);
    expect(component.logMessages).toBeTruthy();
    component.cleanup();
  }));

  it('should show empty logs where there is no progress', () => {
    expect(component.logMessages).toBeFalsy();
    let peCopy = Object.assign({}, mockPluginExecution);
    peCopy = Object.assign(peCopy, { executionProgress: false });
    component.showPluginLog = Object.assign(peCopy, { executionProgress: false });
    component.startPolling();
    expect(component.logMessages).toBeFalsy();
    component.cleanup();
  });

  it('should close the logs', () => {
    spyOn(component.closed, 'emit');
    component.closeLog();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should get a from number', () => {
    component.logPerStep = 100;
    fixture.detectChanges();
    expect(component.getLogFrom(200)).toBe(101);
  });
});
