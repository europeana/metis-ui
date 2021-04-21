import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createMockPipe,
  mockDataset,
  MockErrorService,
  mockWorkflowExecution,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../../_mocked';
import { ErrorService, WorkflowService } from '../../_services';
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
        ])
      ],
      declarations: [
        HistoryComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: ErrorService, useClass: MockErrorService }
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
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should reset the templateRowIndex', () => {
      component.templateRowIndex = 5;
      component.resetTemplateRowIndex();
      expect(component.templateRowIndex).toEqual(0);
    });

    it('should tell if the row is stripey', () => {
      expect(component.rowIsStripe()).toBeFalsy();
      expect(component.rowIsStripe()).toBeTruthy();
      expect(component.rowIsStripe()).toBeFalsy();
    });

    it('should load the next page', () => {
      component.datasetData = mockDataset;
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
      component.copyInformation('X', '1', '2');
      expect(component.contentCopied).toBeTruthy();
    });

    it('should update the last execution when it changes ', () => {
      spyOn(component, 'returnAllExecutions');
      component.datasetData = mockDataset;
      component.lastExecutionData = mockWorkflowExecution;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      component.lastExecutionData = undefined;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      component.lastExecutionData = mockWorkflowExecution;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(1);
      let lastCopy = Object.assign({}, mockWorkflowExecution);
      lastCopy = Object.assign(lastCopy, { id: 'modified' });
      component.lastExecutionData = lastCopy;
      expect(component.returnAllExecutions).toHaveBeenCalledTimes(2);
    });

    it('should display history in tabs', fakeAsync(() => {
      component.datasetData = mockDataset;
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
      component.datasetData = mockDataset;
      component.goToPreview({
        baseFilter: {}
      });
      expect(router.navigate).toHaveBeenCalled();
      expect(component.setPreviewFilters.emit).toHaveBeenCalled();
    }));
  });

  describe('Error Handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(() => {
      b4Each();
    });

    it('should update the notification', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.datasetData = mockDataset;
      component.returnAllExecutions();
      expect(component.isLoading).toBeTruthy();
      tick(1);
      expect(component.isLoading).toBeFalsy();
      expect(component.notification).toBeTruthy();
    }));
  });
});
