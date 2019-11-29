import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import {
  createMockPipe,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockErrorService,
  mockPluginExecution,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { NotificationType, SimpleReportRequest, WorkflowExecution } from '../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';

import { DatasetComponent } from '.';
import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  let workflows: WorkflowService;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DatasetComponent, createMockPipe('translate')],
      providers: [
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    workflows = TestBed.get(WorkflowService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
  };

  describe('Normal operation', () => {
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(b4Each);

    it('responds to form initialisation by setting it in the header', () => {
      component.workflowFormRef = { onHeaderSynchronised: () => {} } as WorkflowComponent;
      const mockHeader = new WorkflowHeaderComponent();
      mockHeader.elRef = { nativeElement: {} } as ElementRef;
      component.workflowHeaderRef = mockHeader;
      spyOn(component.workflowFormRef, 'onHeaderSynchronised');
      component.formInitialised({} as FormGroup);
      expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
    });

    it('responds to form initialisation by setting it in the header using delays ', fakeAsync(() => {
      component.workflowFormRef = { onHeaderSynchronised: () => {} } as WorkflowComponent;
      const mockHeader = new WorkflowHeaderComponent();
      spyOn(component.workflowFormRef, 'onHeaderSynchronised');
      component.formInitialised({} as FormGroup);
      expect(component.workflowFormRef.onHeaderSynchronised).not.toHaveBeenCalled();
      mockHeader.elRef = { nativeElement: {} } as ElementRef;
      component.workflowHeaderRef = mockHeader;
      expect(component.workflowFormRef.onHeaderSynchronised).not.toHaveBeenCalled();
      tick(50);
      expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
    }));

    it('should call setLinkCheck on its workflowFormRef', () => {
      const spy = jasmine.createSpy();
      component.workflowFormRef = ({ setLinkCheck: spy } as unknown) as WorkflowComponent;
      component.setLinkCheck(1);
      expect(spy).toHaveBeenCalled();
    });

    it('should get dataset info', () => {
      component.loadData();
      fixture.detectChanges();
      expect(component.lastExecutionSubscription.closed).toBe(false);
    });

    it('should switch tabs', () => {
      fixture.detectChanges();

      component.activeTab = 'edit';
      component.datasetIsLoading = false;
      component.workflowIsLoading = false;
      component.lastExecutionIsLoading = false;
      component.harvestIsLoading = false;

      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

      component.activeTab = 'workflow';
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

      component.activeTab = 'mapping';
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

      component.activeTab = 'preview';
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

      component.activeTab = 'log';
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();
    });

    it('should be possible to display a message', () => {
      component.showPluginLog = mockPluginExecution;
      fixture.detectChanges();
      expect(component.showPluginLog).toBe(mockPluginExecution);
    });

    it('should set a report from a message request', fakeAsync(() => {
      expect(component.reportMsg).toBeFalsy();
      expect(component.reportMsg).toBeFalsy();

      const srrM = {
        message: 'message'
      } as SimpleReportRequest;

      component.setReportMsg(srrM);
      tick();

      expect(component.reportErrors).toBeFalsy();
      expect(component.reportMsg).toBeTruthy();
    }));

    it('should set a report from task data', fakeAsync(() => {
      expect(component.reportMsg).toBeFalsy();
      expect(component.reportMsg).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as SimpleReportRequest;

      component.setReportMsg(srrE);
      tick();
      expect(component.reportErrors).toBeTruthy();
      expect(component.reportMsg).toBeFalsy();
    }));

    it('should handle an empty report', fakeAsync(() => {
      spyOn(workflows, 'getReport').and.callFake(() => {
        return of({
          id: 123,
          errors: []
        });
      });
      expect(component.reportMsg).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as SimpleReportRequest;

      component.setReportMsg(srrE);
      tick();
      expect(component.reportMsg).toEqual('Report is empty.');
    }));

    it('should clear the report message', () => {
      expect(component.reportMsg).toBeFalsy();
      component.setReportMsg({
        message: 'message'
      } as SimpleReportRequest);
      expect(component.reportMsg).toBeTruthy();
      component.clearReport();
      expect(component.reportMsg).toBeFalsy();
    });

    it('should start a workflow', () => {
      spyOn(workflows, 'startWorkflow').and.callThrough();
      component.datasetId = '65';
      component.startWorkflow();
      expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
    });

    it('should update data', () => {
      spyOn(component, 'loadData');
      component.datasetUpdated();
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should return to the top', () => {
      const mockFn = jasmine.createSpy();
      const el = ({ scrollIntoView: mockFn } as unknown) as Element;
      component.scrollToTopAnchor = { nativeElement: el } as ElementRef;
      component.returnToTop();
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));
    beforeEach(b4Each);

    it('should handle load errors', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.loadData();
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);

      component.ngOnDestroy();
    }));

    it('should handle setReportMsg errors', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.reportLoading = true;
      component.setReportMsg({ taskId: '123', topology: 'enrichment' });
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.reportLoading).toBeFalsy();
      component.ngOnDestroy();
    }));

    it('should handle loadWorkflow errors', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.workflowIsLoading = true;
      component.loadWorkflow();
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.workflowIsLoading).toBeFalsy();
      component.ngOnDestroy();
    }));

    it('should handle startWorkflow errors', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      expect(component.notification).toBeFalsy();
      component.startWorkflow();
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(window.scrollTo).toHaveBeenCalled();
      component.ngOnDestroy();
    }));

    it('should handle empty results when loading the last execution', fakeAsync(() => {
      component.lastExecutionIsLoading = true;
      component.lastExecutionData = { id: 'test-this-gets-removed' } as WorkflowExecution;

      spyOn(workflows, 'getLastDatasetExecution').and.callFake(() => {
        return of((undefined as unknown) as WorkflowExecution);
      });

      expect(component.lastExecutionData).toBeTruthy();
      component.loadLastExecution();
      tick();
      expect(component.notification).toBeFalsy();
      expect(component.lastExecutionIsLoading).toBeFalsy();
      expect(component.lastExecutionData).toBeFalsy();
    }));

    it('should handle errors when loading the last execution', fakeAsync(() => {
      component.lastExecutionIsLoading = true;

      expect(component.notification).toBeFalsy();
      component.loadLastExecution();
      tick();
      expect(component.lastExecutionIsLoading).toBeFalsy();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
    }));
  });
});
