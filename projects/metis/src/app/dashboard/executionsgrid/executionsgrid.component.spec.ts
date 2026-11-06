import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe } from 'shared';

import { environment } from '../../../environments/environment';
import {
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { GridrowComponent } from './gridrow';
import { ExecutionsGridComponent } from '.';

function setRows(component: ExecutionsGridComponent): void {
  const mockRows = ([
    { expanded: signal(true) },
    { expanded: signal(true) }
  ] as unknown) as GridrowComponent[];

  Object.defineProperty(component, 'rows', {
    writable: true,
    configurable: true,
    value: () => mockRows
  });
}

describe('ExecutionsGridComponent', () => {
  let component: ExecutionsGridComponent;
  let fixture: ComponentFixture<ExecutionsGridComponent>;
  let workflows: WorkflowService;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ExecutionsGridComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        }
      ]
    }).compileComponents();
    workflows = TestBed.inject(WorkflowService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ExecutionsGridComponent);
    component = fixture.componentInstance;
  };

  const interval = environment.intervalStatusMedium;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should reload when the parameters are changed', () => {
      vi.advanceTimersByTime(1);
      vi.spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage');
      component.setOverviewParams('');
      vi.advanceTimersByTime(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).not.toHaveBeenCalled();
      component.setOverviewParams('param-string');
      vi.advanceTimersByTime(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
    });

    it('should update data periodically and allow polling resets', () => {
      TestBed.resetTestingModule();
      configureTestbed(false);

      const workflowsServiceInstance = TestBed.inject(WorkflowService);
      vi.spyOn(workflowsServiceInstance, 'getCompletedDatasetOverviewsUptoPage');

      fixture = TestBed.createComponent(ExecutionsGridComponent);
      component = fixture.componentInstance;

      vi.advanceTimersByTime(1);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        1
      );

      vi.advanceTimersByTime(interval);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        2
      );

      vi.advanceTimersByTime(interval);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        3
      );

      vi.advanceTimersByTime(interval / 2);

      component.pollingRefresh.next();
      vi.advanceTimersByTime(1);

      // Call count should increment immediately by 1 because of the manual trigger (Call 4)
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        4
      );

      // Verify that the new interval baseline tracks from the manual click moment
      // tick halfway through the new interval window (no extra calls should happen)
      vi.advanceTimersByTime(interval / 2);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        4
      );

      // Tick the remaining half to finish a full interval cycle from the manual reset point
      vi.advanceTimersByTime(interval / 2);

      // The next automated interval tick successfully triggers Call 5!
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        5
      );
    });

    it('should load the next page', () => {
      vi.advanceTimersByTime(1);
      vi.spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage');
      expect(component.currentPage).toEqual(0);
      component.loadNextPage();
      vi.advanceTimersByTime(1);
      expect(component.currentPage).toEqual(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
    });

    it('should set the selected index', () => {
      vi.advanceTimersByTime(1);
      setRows(component);
      expect(component.selectedDsId).toEqual('');
      component.setSelectedDsId('3');
      expect(component.selectedDsId).toEqual('3');
    });

    it('should relay the row selection to the parent', () => {
      vi.spyOn(component.selectedSet, 'emit');
      setRows(component);
      component.setSelectedDsId('id');
      expect(component.selectedSet.emit).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      // Spy on the target service BEFORE component creation
      vi.spyOn(TestBed.inject(WorkflowService), 'getCompletedDatasetOverviewsUptoPage');
      b4Each();
    });

    it('should gracefully handle a network error and completely terminate the periodic loop', () => {
      vi.advanceTimersByTime(1);

      const service = TestBed.inject(WorkflowService);
      expect(component.isLoading()).toBeFalsy();

      // Advance time by the interval duration
      vi.advanceTimersByTime(interval);

      expect(service.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(interval);
      expect(service.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(1);
    });
  });
});
