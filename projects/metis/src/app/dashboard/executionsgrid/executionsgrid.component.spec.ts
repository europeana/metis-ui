import { CUSTOM_ELEMENTS_SCHEMA, QueryList } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component.rows = ([{ expanded: true }, { expanded: true }] as any) as QueryList<GridrowComponent>;
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

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should poll for data on initialisation', fakeAsync(() => {
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      component.ngAfterViewInit();
      tick();
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
      component.cleanup();
      tick(interval);
    }));

    it('should unsubscribe when destroyed', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();
      spyOn(component, 'cleanup').and.callThrough();
      component.ngOnDestroy();
      expect(component.cleanup).toHaveBeenCalled();
      tick(interval);
    }));

    it('should reload when the parameters are changed', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      component.setOverviewParams('');
      tick();
      expect(workflows.getCompletedDatasetOverviewsUptoPage).not.toHaveBeenCalled();
      component.setOverviewParams('param-string');
      tick();
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
      component.cleanup();
      tick(interval);
    }));

    it('should update data periodically and allow polling resets', fakeAsync(() => {
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      component.ngAfterViewInit();
      tick();
      [1, 2, 3, 4, 5].forEach((index) => {
        expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(index);
        tick(interval);
      });
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(6);
      component.pollingRefresh.next(true);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(7);
      tick(interval - 1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(7);
      tick(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalledTimes(8);

      component.cleanup();
      tick(interval);
    }));

    it('should load the next page', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();
      spyOn(workflows, 'getCompletedDatasetOverviewsUptoPage').and.callThrough();
      expect(component.currentPage).toEqual(0);
      component.loadNextPage();
      tick();
      expect(component.currentPage).toEqual(1);
      expect(workflows.getCompletedDatasetOverviewsUptoPage).toHaveBeenCalled();
      component.cleanup();
      tick(interval);
    }));

    it('should set the selected index', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();
      setRows(component);
      expect(component.selectedDsId).toEqual('');
      component.setSelectedDsId('3');
      expect(component.selectedDsId).toEqual('3');
      component.cleanup();
      tick(interval);
    }));

    it('should relay the row selection to the parent', fakeAsync(() => {
      component.ngAfterViewInit();
      spyOn(component.selectedSet, 'emit');
      setRows(component);
      component.setSelectedDsId('id');
      expect(component.selectedSet.emit).toHaveBeenCalled();
      component.cleanup();
      tick(interval);
    }));
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors when loading', fakeAsync(() => {
      component.isLoading = true;
      component.isLoadingMore = true;
      component.ngAfterViewInit();
      tick();
      expect(component.isLoading).toBeFalsy();
      expect(component.isLoadingMore).toBeFalsy();
      component.cleanup();
      tick(interval);
    }));
  });
});
