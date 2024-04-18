import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  createMockPipe,
  mockLogs,
  mockPluginExecution,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import { PluginStatus, TaskState } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { DatasetlogComponent } from '.';

describe('DatasetlogComponent', () => {
  let component: DatasetlogComponent;
  let fixture: ComponentFixture<DatasetlogComponent>;
  let modalConfirms: ModalConfirmService;

  const configureTestingModule = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [DatasetlogComponent],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useClass: createMockPipe('translate') },
        { provide: RenameWorkflowPipe, useClass: createMockPipe('renameWorkflow') },
        { provide: ModalConfirmService, useClass: MockModalConfirmService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetlogComponent);
    component = fixture.componentInstance;
    component.showPluginLog = mockPluginExecution;
    fixture.detectChanges();
  };

  describe('Normal operations', () => {
    beforeEach(async(() => {
      configureTestingModule();
    }));

    beforeEach(b4Each);

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

    it('should not open the logs unless at least one record has been processed', fakeAsync(() => {
      const emptyPluginExecution = structuredClone(mockPluginExecution);
      emptyPluginExecution.executionProgress = {
        processedRecords: 0,
        progressPercentage: 0,
        status: TaskState.SENT,
        expectedRecords: 100,
        errors: 0
      };
      component.showPluginLog = emptyPluginExecution;
      expect(component.logMessages).toBeFalsy();
      component.startPolling();
      tick(1);
      expect(component.logMessages).toBeFalsy();

      if (emptyPluginExecution.executionProgress) {
        emptyPluginExecution.executionProgress.processedRecords = 1;
        emptyPluginExecution.executionProgress.progressPercentage = 1;
      }
      component.startPolling();
      tick(1);
      expect(component.logMessages).toBeTruthy();
      component.cleanup();
    }));

    it('should show empty logs where there is no progress', fakeAsync(() => {
      expect(component.logMessages).toBeFalsy();
      spyOn(component, 'startPolling').and.callThrough();
      let peCopy = structuredClone(mockPluginExecution);
      peCopy = { ...peCopy, pluginStatus: PluginStatus.FINISHED };
      delete peCopy.executionProgress;
      component.showPluginLog = peCopy;
      tick(1);
      expect(component.startPolling).toHaveBeenCalledTimes(1);
      component.showPluginLog = peCopy;
      tick(1);
      expect(component.startPolling).toHaveBeenCalledTimes(1);
      component.cleanup();
    }));

    it('should show the correct empty log message', () => {
      let peCopy = structuredClone(mockPluginExecution);
      peCopy = {
        ...peCopy,
        pluginStatus: PluginStatus.RUNNING,
        executionProgress: {
          processedRecords: 1000,
          expectedRecords: 1000,
          progressPercentage: 100,
          errors: 0
        }
      };
      component.showPluginLog = peCopy;

      component.showWindowOutput(undefined, true);
      expect(component.noLogMessage).toEqual('en:noProcessedRecords');

      component.showWindowOutput(undefined, false);
      expect(component.noLogMessage).toEqual('en:noLogs');
    });

    it('should show the output', () => {
      component.showWindowOutput(undefined);
      expect(component.logMessages).toBeFalsy();
      component.showWindowOutput(mockLogs);
      expect(component.logMessages).toBeTruthy();

      const logCopy = structuredClone(mockLogs);
      component.showWindowOutput({ ...logCopy, length: 0 });
      expect(component.logMessages).toBeFalsy();
    });

    it('should get the log from', () => {
      expect(component.getLogFrom(0)).toEqual(1);
      expect(component.getLogFrom(1)).toEqual(1);
      expect(component.getLogFrom(component.logPerStep)).toEqual(1);
      expect(component.getLogFrom(component.logPerStep + 1)).toEqual(2);
    });

    it('should close the logs', () => {
      // supply a user close action
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
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

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestingModule(true);
    }));

    beforeEach(b4Each);

    it('should open the logs', fakeAsync(() => {
      spyOn(component, 'cleanup').and.callThrough();
      expect(component.logMessages).toBeFalsy();
      component.startPolling();
      tick(1);
      expect(component.logMessages).toBeFalsy();
      expect(component.isFirstLoading).toBeFalsy();
      expect(component.cleanup).toHaveBeenCalled();
    }));
  });
});
