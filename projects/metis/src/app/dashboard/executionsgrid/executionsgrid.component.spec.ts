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
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should reload when the parameters are changed', () => {
      jasmine.clock().tick(1);
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      component.setOverviewParams('');
      jasmine.clock().tick(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).not.toHaveBeenCalled();
      component.setOverviewParams('param-string');
      jasmine.clock().tick(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
    });

    it('should update data periodically and allow polling resets', () => {
      TestBed.resetTestingModule();
      configureTestbed(false);

      const workflowsServiceInstance = TestBed.inject(WorkflowService);
      spyOn(workflowsServiceInstance, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();

      fixture = TestBed.createComponent(ExecutionsGridComponent);
      component = fixture.componentInstance;

      jasmine.clock().tick(1);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        1
      );

      jasmine.clock().tick(interval);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        2
      );

      jasmine.clock().tick(interval);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        3
      );

      jasmine.clock().tick(interval / 2);

      component.pollingRefresh.next();
      jasmine.clock().tick(1);

      // Call count should increment immediately by 1 because of the manual trigger (Call 4)
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        4
      );

      // Verify that the new interval baseline tracks from the manual click moment
      // tick halfway through the new interval window (no extra calls should happen)
      jasmine.clock().tick(interval / 2);
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        4
      );

      // Tick the remaining half to finish a full interval cycle from the manual reset point
      jasmine.clock().tick(interval / 2);

      // The next automated interval tick successfully triggers Call 5!
      expect(workflowsServiceInstance.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(
        5
      );
    });

    it('should load the next page', () => {
      jasmine.clock().tick(1);
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      expect(component.currentPage).toEqual(0);
      component.loadNextPage();
      jasmine.clock().tick(1);
      expect(component.currentPage).toEqual(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
    });

    it('should set the selected index', () => {
      jasmine.clock().tick(1);
      setRows(component);
      expect(component.selectedDsId).toEqual('');
      component.setSelectedDsId('3');
      expect(component.selectedDsId).toEqual('3');
    });

    it('should relay the row selection to the parent', () => {
      spyOn(component.selectedSet, 'emit');
      setRows(component);
      component.setSelectedDsId('id');
      expect(component.selectedSet.emit).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      // Spy on the target service BEFORE component creation
      spyOn(
        TestBed.inject(WorkflowService),
        'getCompletedDatasetOverviewsUptoPage'
      ).and.callThrough();
      b4Each();
    });

    it('should gracefully handle a network error and maintain the periodic loop', () => {
      jasmine.clock().tick(1);

      const service = TestBed.inject(WorkflowService);
      expect(component.isLoading).toBeFalsy();

      jasmine.clock().tick(interval);
      expect(service.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(2);
      jasmine.clock().tick(interval);
    });
  });
});
