import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createMockPipe,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService,
} from '../../_mocked';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { OngoingexecutionsComponent } from '.';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OngoingexecutionsComponent, createMockPipe('translate')],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OngoingexecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show a log', () => {
    spyOn(component.setShowPluginLog, 'emit');
    component.showLog(mockWorkflowExecution);
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
