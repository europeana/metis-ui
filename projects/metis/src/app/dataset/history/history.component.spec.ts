import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { createMockPipe } from 'shared';
import {
  MockTranslateService,
  mockWorkflowExecution,
  mockWorkflowExecutionResults
} from '../../_mocked';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { PreviewComponent } from '../preview';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let router: Router;

  const configureTestbed = async (errorMode = false): Promise<void> => {
    const mockWorkflowServiceSync = {
      getCompletedDatasetExecutionsUptoPage: () => {
        if (errorMode) {
          return throwError(
            () =>
              new HttpErrorResponse({
                error: 'err',
                status: 500,
                statusText: 'Internal Server Error'
              })
          );
        }
        return of({
          results: JSON.parse(JSON.stringify(mockWorkflowExecutionResults.results)),
          more: false,
          maxResultCountReached: false
        });
      },
      getReportsForExecution: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dataset/preview/*', component: PreviewComponent }
        ]),
        HistoryComponent
      ],
      providers: [
        {
          provide: WorkflowService,
          useValue: mockWorkflowServiceSync
        },
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  };

  const createComponentInstance = (): void => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('datasetId', 'test-dataset-id');
  };

  describe('Normal operations', () => {
    beforeEach(async () => {
      await configureTestbed(false);
      createComponentInstance();
    });

    it('should create', () => {
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load the next page', () => {
      expect(component.currentPage()).toEqual(0);
      component.loadNextPage();
      expect(component.currentPage()).toEqual(1);
    });

    it('should open the fail report', () => {
      spyOn(component.setReportMsg, 'emit');
      component.openFailReport({} as any);
      expect(component.setReportMsg.emit).toHaveBeenCalled();
    });

    it('should copy the information', () => {
      spyOn(navigator.clipboard, 'writeText');
      component.copyInformation('X', '1', '2');
      expect(component.contentCopied()).toBeTrue();
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should update the last execution data tracking metrics when it changes', async () => {
      // 1. Initial trigger loop execution
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      // Verifies synchronous mock streams load datasets natively without delay
      expect(component.allExecutions().length).toBeTruthy();

      // 2. Hydrate input payload parameter tracks
      fixture.componentRef.setInput('lastExecutionData', mockWorkflowExecution);
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      // 3. Clear data
      fixture.componentRef.setInput('lastExecutionData', undefined);
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      // 4. Force state modifications to provoke fresh computation loops
      fixture.componentRef.setInput('lastExecutionData', {
        ...mockWorkflowExecution,
        id: 'modified'
      });
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      expect(component.allExecutions().length).toBeTruthy();
    });

    it('should display history grid layouts cleanly upon successful evaluation data fetches', async () => {
      // Act: Flush Signal updates synchronously
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      // Update template layout frames
      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.table-grid.history')).length).toBeTruthy();
    });

    it('should navigate to the preview page safely on navigation submissions', () => {
      spyOn(router, 'navigate');
      spyOn(component.setPreviewFilters, 'emit');

      component.goToPreview({
        baseFilter: { executionId: 'test-exec-id' }
      } as any);

      expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/test-dataset-id']);
      expect(component.setPreviewFilters.emit).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await configureTestbed(true);
      createComponentInstance();
    });

    it('should update the notification layout when network stream requests throw errors', async () => {
      expect(component.notification()).toBeFalsy();

      // Act: Evaluate declarative error pipelines synchronously
      TestBed.flushEffects();
      fixture.detectChanges();
      await Promise.resolve();

      expect(component.isLoading()).toBeFalse();
      expect(component.notification()).toBeTruthy();
    });
  });
});
