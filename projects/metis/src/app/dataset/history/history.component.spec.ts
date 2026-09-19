import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

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

describe('HistoryComponent (Zoneless + Jasmine Clock)', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let router: Router;

  const configureTestbed = async (errorMode = false): Promise<void> => {
    const mockWorkflowServiceSync = {
      getCompletedDatasetExecutionsUptoPage: () => {
        if (errorMode) {
          return timer(1).pipe(
            switchMap(() => {
              const nativeError = new Error(
                'mock getCompletedDatasetExecutionsUptoPage throws error'
              );
              Object.defineProperties(nativeError, {
                status: { value: 500, writable: true, enumerable: true },
                statusText: { value: 'Internal Server Error', writable: true, enumerable: true },
                error: {
                  value: JSON.stringify({ message: 'Internal Server Error' }),
                  writable: true,
                  enumerable: true
                }
              });
              return throwError(() => nativeError);
            })
          );
        }
        return of({
          results: JSON.parse(JSON.stringify(mockWorkflowExecutionResults.results)),
          more: false,
          maxResultCountReached: false
        }).pipe(delay(1));
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
        { provide: WorkflowService, useValue: mockWorkflowServiceSync },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useValue: createMockPipe('translate') },
        { provide: RenameWorkflowPipe, useValue: createMockPipe('renameWorkflow') }
      ]
    }).compileComponents();
    router = TestBed.inject(Router);
  };

  const createComponentInstance = (): void => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('datasetId', 'test-dataset-id');
  };

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('Normal operations', () => {
    beforeEach(async () => {
      await configureTestbed(false);
      createComponentInstance();
    });

    it('should create', () => {
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
      fixture.detectChanges();

      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();
      expect(component.allExecutions().length).toBeTruthy();

      fixture.componentRef.setInput('lastExecutionData', mockWorkflowExecution);
      fixture.detectChanges(); // Sync the new parameter reference
      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();

      fixture.componentRef.setInput('lastExecutionData', undefined);
      fixture.detectChanges();
      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();

      fixture.componentRef.setInput('lastExecutionData', {
        ...mockWorkflowExecution,
        id: 'modified'
      });
      fixture.detectChanges();
      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.allExecutions().length).toBeTruthy();
    });

    it('should display history grid layouts cleanly upon successful evaluation data fetches', async () => {
      fixture.detectChanges();

      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
      expect(fixture.debugElement.queryAll(By.css('.table-grid.history')).length).toBeTruthy();
    });

    it('should evaluate manual and resource errors correctly within the notification computed signal', () => {
      component.manualNotification.set(undefined);

      // Override the historyResource read loop to start clean
      Object.defineProperty(component, 'historyResource', {
        value: {
          value: () => null,
          isLoading: () => false,
          error: () => null
        },
        configurable: true
      });

      // Assert baseline condition (returns undefined when no error exists)
      expect(component.notification()).toBeUndefined();

      // Test Branch A: Manual notification takes highest precedence
      const mockManualAlert = { content: 'Manual Alert Message', type: 'error' };
      component.manualNotification.set(mockManualAlert as any);

      expect(component.notification()).toEqual(mockManualAlert as any);

      // Test Branch B: Falls back to history resource network errors if manual is missing
      component.manualNotification.set(undefined);

      const mockHttpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });
      Object.defineProperty(component, 'historyResource', {
        value: {
          value: () => null,
          isLoading: () => false,
          error: () => mockHttpError
        },
        configurable: true
      });

      // Assert it converts the network error using the httpErrorNotification helper natively
      expect(component.notification()).toBeDefined();
      expect(component.notification()?.content).toBeTruthy();
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
      fixture.detectChanges();
      expect(component.notification()).toBeFalsy();

      jasmine.clock().tick(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.isLoading()).toBeFalse();
      expect(component.notification()).toBeTruthy();
    });
  });
});
