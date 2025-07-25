import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import {
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { PreviewComponent } from '../preview';
import { HistoryComponent } from '.';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let router: Router;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dataset/preview/*', component: PreviewComponent }
        ]),
        HistoryComponent
      ],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
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
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    router = TestBed.inject(Router);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
  };

  describe('Normal operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load the next page', () => {
      expect(component.currentPage).toEqual(0);
      component.loadNextPage();
      expect(component.currentPage).toEqual(1);
    });

    it('should open the fail report', () => {
      spyOn(component.setReportMsg, 'emit');
      component.openFailReport({});
      expect(component.setReportMsg.emit).toHaveBeenCalled();
    });

    it('should copy the information', () => {
      spyOn(navigator.clipboard, 'writeText');
      component.copyInformation('X', '1', '2');
      expect(component.contentCopied).toBeTruthy();
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should update the last execution when it changes ', () => {
      spyOn(component, 'returnAllExecutions');
      component.lastExecutionData = mockWorkflowExecution;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      component.lastExecutionData = undefined;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      component.lastExecutionData = mockWorkflowExecution;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      component.lastExecutionData = {
        ...mockWorkflowExecution,
        id: 'modified'
      };
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(2);
    });

    it('should display history in tabs', fakeAsync(() => {
      component.returnAllExecutions();
      expect(component.isLoading).toBeTruthy();
      tick(1);
      expect(component.isLoading).toBeFalsy();
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.table-grid.history')).length).toBeTruthy();
    }));

    it('should submit form and create the dataset', fakeAsync((): void => {
      spyOn(router, 'navigate');
      spyOn(component.setPreviewFilters, 'emit');
      component.goToPreview({
        baseFilter: {}
      });
      expect(router.navigate).toHaveBeenCalled();
      expect(component.setPreviewFilters.emit).toHaveBeenCalled();
    }));
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should update the notification', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.returnAllExecutions();
      expect(component.isLoading).toBeTruthy();
      tick(1);
      expect(component.isLoading).toBeFalsy();
      expect(component.notification).toBeTruthy();
    }));
  });
});
